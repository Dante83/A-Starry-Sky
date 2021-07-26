StarrySky.LUTlibraries.AtmosphericLUTLibrary = function(data, renderer){
  this.renderer = renderer;
  this.data = data;
  this.sunLUT;
  this.moonLUT;

  //Enable the OES_texture_float_linear extension
  if(renderer.capabilities.isWebGL2){
    if(!renderer.extensions.get("OES_texture_float_linear")){
      console.error('OES_texture_float_linear extension not found. Unfortunately, this browser/system does not meet the minimum requirements for A-Starry Sky.');
      return false;
    }
    if(!renderer.extensions.get('WEBGL_draw_buffers')){
      console.error('WEBGL_draw_buffers extension not found. Unfortunately, this browser/system does not meet the minimum requirements for A-Starry Sky.');
      return false;
    }
    if(!renderer.extensions.get('EXT_color_buffer_float')){
      console.error('EXT_color_buffer_float extension not found. Unfortunately, this browser/system does not meet the minimum requirements for A-Starry Sky.');
      return false;
    }
  }
  else{
    console.error('Web GL 2.0 not found. Unfortunately, this browser/system does not meet the minimum requirements for A-Starry Sky.');
    return false;
  }

  document.body.appendChild(renderer.domElement);

  //Create our first renderer, for transmittance
  const TRANSMITTANCE_TEXTURE_SIZE = 512;
  this.transmittanceTextureSize = TRANSMITTANCE_TEXTURE_SIZE;
  let transmittanceRenderer = new THREE.StarrySkyComputationRenderer(TRANSMITTANCE_TEXTURE_SIZE, TRANSMITTANCE_TEXTURE_SIZE, renderer);

  //Create our scene to render our texture to
  this.lutScene = new StarrySky.LUTlibraries.LUTScene(singleScatteringRenderer);

  //Grab our atmospheric functions partial, we also store it in the library
  //as we use it in the final atmospheric material.
  this.atmosphereFunctionsString = materials.atmosphereFunctions.partialFragmentShader(
    this.scatteringTextureWidth,
    this.scatteringTextureHeight,
    this.scatteringTexturePackingWidth,
    this.scatteringTexturePackingHeight,
    this.data.skyAtmosphericParameters.mieDirectionalG
  );
  let atmosphereFunctions = this.atmosphereFunctionsString;

  //Set up our transmittance texture
  let transmittanceTexture = transmittanceRenderer.createTexture();
  let transmittanceVar = transmittanceRenderer.addVariable('transmittanceTexture',
    materials.transmittanceMaterial.fragmentShader(data.skyAtmosphericParameters.numberOfRaySteps, atmosphereFunctions),
    transmittanceTexture
  );
  transmittanceRenderer.setVariableDependencies(transmittanceVar, []);
  transmittanceVar.material.uniforms = {};
  transmittanceVar.minFilter = THREE.LinearFilter;
  transmittanceVar.magFilter = THREE.LinearFilter;
  transmittanceVar.wrapS = THREE.ClampToEdgeWrapping;
  transmittanceVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error1 = transmittanceRenderer.init();
  if(error1 !== null){
    console.error(`Transmittance Renderer: ${error1}`);
  }

  //Run the actual shader
  transmittanceRenderer.compute();
  let transmittanceRenderTarget = transmittanceRenderer.getCurrentRenderTarget(transmittanceVar);
  let transmittanceLUT = transmittanceRenderTarget.texture;
  const BYTES_PER_32_BIT_FLOAT = 4;
  this.transferrableTransmittanceBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * TRANSMITTANCE_TEXTURE_SIZE * TRANSMITTANCE_TEXTURE_SIZE * 4);
  this.transferableTransmittanceFloat32Array = new Float32Array(this.transferrableTransmittanceBuffer);
  this.renderer.readRenderTargetPixels(transmittanceRenderTarget, 0, 0, TRANSMITTANCE_TEXTURE_SIZE, TRANSMITTANCE_TEXTURE_SIZE, this.transferableTransmittanceFloat32Array);

  //Set up our data LUT renderer
  let atmosphericDataLUTDirector = new StarrySky.LUTlibraries.AtmosphericDataLUTDirector();

  //Depth texture parameters. Note that texture depth is packing width * packing height
  this.scatteringTextureWidth = 256;
  this.scatteringTextureHeight = 32;
  this.scatteringTextureDepth = 32;
  const mieGCoefficient = data.skyAtmosphericParameters.mieDirectionalG;

  //
  //Set up our single scattering texture
  //
  let atmosphericShaderMaterial = new THREE.RawShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(materials.singleScatteringMaterial.uniforms));,
    vertexShader: StarrySky.Materials.getPassThroughVertexShader(),
    fragmentShader: materials.singleScatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      atmosphereFunctions
    );
  });
  atmosphericShaderMaterial.uniforms.transmittanceTexture.value = transmittanceLUT;
  let atmosphericDataLUTDirector = new StarrySky.LUTlibraries.AtmosphericDataLUTRenderer(this.scene, this.renderer, this.scatteringTextureWidth,
    this.scatteringTextureHeight, this.scatteringTextureDepth);
  const singleScattering3DTextures = atmosphericDataLUTDirector.render(atmosphericShaderMaterial);

  //
  //Commence inscattering sum texture
  //
  let inscatteringSumShaderMaterial = new THREE.RawShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(materials.inscatteringSumMaterial.uniforms));,
    vertexShader: StarrySky.Materials.getPassThroughVertexShader(),
    fragmentShader: materials.inscatteringSumMaterial.fragmentShader;
  });
  inscatteringSumShaderMaterial.material.uniforms.isNotFirstIteration.value = 0;
  inscatteringSumShaderMaterial.material.uniforms.inscatteringRayleighTexture.value = singleScattering3DTexture.rayleigh;
  inscatteringSumShaderMaterial.material.uniforms.inscatteringMeiTexture.value = singleScattering3DTexture.mei;
  let inscatteringSum3DTextures = atmosphericDataLUTDirector.render(inscatteringSumShaderMaterial);

  //
  //Set up our multiple scattering textures
  //
  // let multipleScatteringRenderer = new THREE.StarrySkyComputationRenderer(512, 512, renderer);
  //
  // //Mie
  // let multipleScatteringMieTexture = multipleScatteringRenderer.createTexture();
  // let multipleScatteringMieVar = multipleScatteringRenderer.addVariable('kthInscatteringMie',
  //   materials.kthInscatteringMaterial.fragmentShader(
  //     data.skyAtmosphericParameters.numberOfRaySteps,
  //     this.scatteringTextureWidth,
  //     this.scatteringTextureHeight,
  //     this.scatteringTexturePackingWidth,
  //     this.scatteringTexturePackingHeight,
  //     mieGCoefficient,
  //     false, //Is Rayleigh
  //     atmosphereFunctions
  //   ),
  //   multipleScatteringMieTexture
  // );
  // multipleScatteringRenderer.setVariableDependencies(multipleScatteringMieVar, []);
  // multipleScatteringMieVar.material.uniforms = JSON.parse(JSON.stringify(materials.kthInscatteringMaterial.uniforms));
  // multipleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  // multipleScatteringMieVar.material.uniforms.inscatteredLightLUT.value = mieScattering;
  // multipleScatteringMieVar.minFilter = THREE.LinearFilter;
  // multipleScatteringMieVar.magFilter = THREE.LinearFilter;
  // multipleScatteringMieVar.wrapS = THREE.ClampToEdgeWrapping;
  // multipleScatteringMieVar.wrapT = THREE.ClampToEdgeWrapping;
  //
  // //Rayleigh
  // let multipleScatteringRayleighTexture = multipleScatteringRenderer.createTexture();
  // let multipleScatteringRayleighVar = multipleScatteringRenderer.addVariable('kthInscatteringRayleigh',
  //   materials.kthInscatteringMaterial.fragmentShader(
  //     data.skyAtmosphericParameters.numberOfRaySteps,
  //     this.scatteringTextureWidth,
  //     this.scatteringTextureHeight,
  //     this.scatteringTexturePackingWidth,
  //     this.scatteringTexturePackingHeight,
  //     mieGCoefficient,
  //     true, //Is Rayleigh
  //     atmosphereFunctions
  //   ),
  //   multipleScatteringRayleighTexture
  // );
  // multipleScatteringRenderer.setVariableDependencies(multipleScatteringRayleighVar, []);
  // multipleScatteringRayleighVar.material.uniforms = JSON.parse(JSON.stringify(materials.kthInscatteringMaterial.uniforms));
  // multipleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  // multipleScatteringRayleighVar.material.uniforms.inscatteredLightLUT.value = rayleighScattering;
  // multipleScatteringRayleighVar.minFilter = THREE.LinearFilter;
  // multipleScatteringRayleighVar.magFilter = THREE.LinearFilter;
  // multipleScatteringRayleighVar.wrapS = THREE.ClampToEdgeWrapping;
  // multipleScatteringRayleighVar.wrapT = THREE.ClampToEdgeWrapping;
  //
  // //Check for any errors in initialization
  // let error4 = multipleScatteringRenderer.init();
  // if(error4 !== null){
  //   console.error(`Multiple Scattering Renderer: ${error4}`);
  // }
  //
  // //Run the multiple scattering shader
  // multipleScatteringRenderer.compute();
  // mieScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar).texture;
  // rayleighScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar).texture;
  //
  // //Sum
  // inscatteringRayleighSumVar.material.uniforms.isNotFirstIteration.value = 1;
  // inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = rayleighScattering;
  // inscatteringRayleighSumVar.material.uniforms.previousInscatteringSum.value = rayleighScatteringSum;
  // inscatteringMieSumVar.material.uniforms.isNotFirstIteration.value = 1;
  // inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = mieScattering;
  // inscatteringMieSumVar.material.uniforms.previousInscatteringSum.value = mieScatteringSum;
  // scatteringSumRenderer.compute();
  // rayleighScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar).texture;
  // mieScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar).texture;
  //
  // // Let's just focus on the second order scattering until that looks correct, possibly giving
  // // another look over the first order scattering to make sure we have that correct as well.
  // for(let i = 0; i < 7; ++i){
  //   multipleScatteringMieVar.material.uniforms.inscatteredLightLUT.value = mieScattering;
  //   multipleScatteringRayleighVar.material.uniforms.inscatteredLightLUT.value = rayleighScattering;
  //
  //   //Compute this mie and rayliegh scattering order
  //   multipleScatteringRenderer.compute();
  //   mieScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar).texture;
  //   rayleighScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar).texture;
  //
  //   //Sum
  //   inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = rayleighScattering;
  //   inscatteringRayleighSumVar.material.uniforms.previousInscatteringSum.value = rayleighScatteringSum;
  //   inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = mieScattering;
  //   inscatteringMieSumVar.material.uniforms.previousInscatteringSum.value = mieScatteringSum;
  //   scatteringSumRenderer.compute();
  //   rayleighScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar).texture;
  //   mieScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar).texture;
  // }

  //Clean up and finish attaching things we will need
  // mieScattering.dispose();
  // rayleighScattering.dispose();
  this.transmittance = transmittanceLUT;
  this.rayleighScatteringSum = inscatteringSum3DTextures.rayleigh;
  this.mieScatteringSum = inscatteringSum3DTextures.mei;
}
