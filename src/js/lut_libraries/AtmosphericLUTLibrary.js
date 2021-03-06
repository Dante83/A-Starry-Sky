StarrySky.LUTlibraries.AtmosphericLUTLibrary = function(data, renderer, scene){
  this.renderer = renderer;
  this.data = data;
  this.sunLUT;
  this.moonLUT;
  this.lunarEcclipseLUTs = [];

  //Enable the OES_texture_float_linear extension
  if(!renderer.capabilities.isWebGL2 && !renderer.extensions.get("OES_texture_float_linear")){
    console.error("No linear interpolation of OES textures allowed.");
    return false;
  }

  //Enable 32 bit float textures
  if(!renderer.capabilities.isWebGL2 && !renderer.extensions.get("WEBGL_color_buffer_float")){
    console.error("No float WEBGL color buffers allowed.");
    return false;
  }

  document.body.appendChild(renderer.domElement);

  //Create our first renderer, for transmittance
  const TRANSMITTANCE_TEXTURE_SIZE = 512;
  this.transmittanceTextureSize = TRANSMITTANCE_TEXTURE_SIZE;
  let transmittanceRenderer = new THREE.StarrySkyComputationRenderer(TRANSMITTANCE_TEXTURE_SIZE, TRANSMITTANCE_TEXTURE_SIZE, renderer);

  //Using a 3D look up table of 256x32x32, I can have 2 256x32 textures per row
  //and 16*32 rows, using this structure allows us to directly compute the 3D texture
  //in one go.
  let singleScatteringRenderer = new THREE.StarrySkyComputationRenderer(512, 512, renderer);
  let scatteringSumRenderer = new THREE.StarrySkyComputationRenderer(512, 512, renderer);

  let materials = StarrySky.Materials.Atmosphere;

  //Depth texture parameters. Note that texture depth is packing width * packing height
  this.scatteringTextureWidth = 256;
  this.scatteringTextureHeight = 32;
  this.scatteringTexturePackingWidth = 2;
  this.scatteringTexturePackingHeight = 16;
  const mieGCoefficient = data.skyAtmosphericParameters.mieDirectionalG;

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

  //
  //Set up our single scattering texture
  //
  //Mie
  let singleScatteringMieTexture = singleScatteringRenderer.createTexture();
  let singleScatteringMieVar = singleScatteringRenderer.addVariable('kthInscatteringMie',
    materials.singleScatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      false, //Is Rayleigh
      atmosphereFunctions
    ),
    singleScatteringMieTexture
  );
  singleScatteringRenderer.setVariableDependencies(singleScatteringMieVar, []);
  singleScatteringMieVar.material.uniforms = JSON.parse(JSON.stringify(materials.singleScatteringMaterial.uniforms));
  singleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  singleScatteringMieVar.minFilter = THREE.LinearFilter;
  singleScatteringMieVar.magFilter = THREE.LinearFilter;
  singleScatteringMieVar.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringMieVar.wrapT = THREE.ClampToEdgeWrapping;

  //Rayleigh
  let singleScatteringRayleighTexture = singleScatteringRenderer.createTexture();
  let singleScatteringRayleighVar = singleScatteringRenderer.addVariable('kthInscatteringRayleigh',
    materials.singleScatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      true, //Is Rayleigh
      atmosphereFunctions
    ),
    singleScatteringRayleighTexture
  );
  singleScatteringRenderer.setVariableDependencies(singleScatteringRayleighVar, []);
  singleScatteringRayleighVar.material.uniforms = JSON.parse(JSON.stringify(materials.singleScatteringMaterial.uniforms));
  singleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  singleScatteringRayleighVar.minFilter = THREE.LinearFilter;
  singleScatteringRayleighVar.magFilter = THREE.LinearFilter;
  singleScatteringRayleighVar.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringRayleighVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error2 = singleScatteringRenderer.init();
  if(error2 !== null){
    console.error(`Single Scattering Renderer: ${error2}`);
  }

  //Run the scattering shader
  singleScatteringRenderer.compute();
  let mieScattering = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringMieVar).texture;
  let rayleighScattering = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringRayleighVar).texture;

  //Combine our two shaders together into an inscattering sum texture
  let inscatteringRayleighSumTexture = scatteringSumRenderer.createTexture();
  let inscatteringRayleighSumVar = scatteringSumRenderer.addVariable('inscatteringRayleighSumTexture',
    materials.inscatteringSumMaterial.fragmentShader, //Initializing
    inscatteringRayleighSumTexture
  );
  scatteringSumRenderer.setVariableDependencies(inscatteringRayleighSumVar, []);
  inscatteringRayleighSumVar.material.uniforms = JSON.parse(JSON.stringify(materials.inscatteringSumMaterial.uniforms));
  inscatteringRayleighSumVar.material.uniforms.isNotFirstIteration.value = 0;
  inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = rayleighScattering;
  inscatteringRayleighSumVar.minFilter = THREE.LinearFilter;
  inscatteringRayleighSumVar.magFilter = THREE.LinearFilter;
  inscatteringRayleighSumVar.wrapS = THREE.ClampToEdgeWrapping;
  inscatteringRayleighSumVar.wrapT = THREE.ClampToEdgeWrapping;

  let inscatteringMieSumTexture = scatteringSumRenderer.createTexture();
  let inscatteringMieSumVar = scatteringSumRenderer.addVariable('inscatteringMieSumTexture',
    materials.inscatteringSumMaterial.fragmentShader, //Initializing
    inscatteringMieSumTexture
  );
  scatteringSumRenderer.setVariableDependencies(inscatteringMieSumVar, []);
  inscatteringMieSumVar.material.uniforms = JSON.parse(JSON.stringify(materials.inscatteringSumMaterial.uniforms));
  inscatteringMieSumVar.material.uniforms.isNotFirstIteration.value = 0;
  inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = mieScattering;
  inscatteringMieSumVar.minFilter = THREE.LinearFilter;
  inscatteringMieSumVar.magFilter = THREE.LinearFilter;
  inscatteringMieSumVar.wrapS = THREE.ClampToEdgeWrapping;
  inscatteringMieSumVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error3 = scatteringSumRenderer.init();
  if(error3 !== null){
    console.error(`Single Scattering Sum Renderer: ${error3}`);
  }
  scatteringSumRenderer.compute();
  let rayleighScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar).texture;
  let mieScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar).texture;

  //
  //Set up our multiple scattering textures
  //
  let multipleScatteringRenderer = new THREE.StarrySkyComputationRenderer(512, 512, renderer);

  //Mie
  let multipleScatteringMieTexture = multipleScatteringRenderer.createTexture();
  let multipleScatteringMieVar = multipleScatteringRenderer.addVariable('kthInscatteringMie',
    materials.kthInscatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      mieGCoefficient,
      false, //Is Rayleigh
      atmosphereFunctions
    ),
    multipleScatteringMieTexture
  );
  multipleScatteringRenderer.setVariableDependencies(multipleScatteringMieVar, []);
  multipleScatteringMieVar.material.uniforms = JSON.parse(JSON.stringify(materials.kthInscatteringMaterial.uniforms));
  multipleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  multipleScatteringMieVar.material.uniforms.inscatteredLightLUT.value = mieScattering;
  multipleScatteringMieVar.minFilter = THREE.LinearFilter;
  multipleScatteringMieVar.magFilter = THREE.LinearFilter;
  multipleScatteringMieVar.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringMieVar.wrapT = THREE.ClampToEdgeWrapping;

  //Rayleigh
  let multipleScatteringRayleighTexture = multipleScatteringRenderer.createTexture();
  let multipleScatteringRayleighVar = multipleScatteringRenderer.addVariable('kthInscatteringRayleigh',
    materials.kthInscatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      mieGCoefficient,
      true, //Is Rayleigh
      atmosphereFunctions
    ),
    multipleScatteringRayleighTexture
  );
  multipleScatteringRenderer.setVariableDependencies(multipleScatteringRayleighVar, []);
  multipleScatteringRayleighVar.material.uniforms = JSON.parse(JSON.stringify(materials.kthInscatteringMaterial.uniforms));
  multipleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  multipleScatteringRayleighVar.material.uniforms.inscatteredLightLUT.value = rayleighScattering;
  multipleScatteringRayleighVar.minFilter = THREE.LinearFilter;
  multipleScatteringRayleighVar.magFilter = THREE.LinearFilter;
  multipleScatteringRayleighVar.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleighVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error4 = multipleScatteringRenderer.init();
  if(error4 !== null){
    console.error(`Multiple Scattering Renderer: ${error4}`);
  }

  //Run the multiple scattering shader
  multipleScatteringRenderer.compute();
  mieScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar).texture;
  rayleighScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar).texture;

  //Sum
  inscatteringRayleighSumVar.material.uniforms.isNotFirstIteration.value = 1;
  inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = rayleighScattering;
  inscatteringRayleighSumVar.material.uniforms.previousInscatteringSum.value = rayleighScatteringSum;
  inscatteringMieSumVar.material.uniforms.isNotFirstIteration.value = 1;
  inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = mieScattering;
  inscatteringMieSumVar.material.uniforms.previousInscatteringSum.value = mieScatteringSum;
  scatteringSumRenderer.compute();
  rayleighScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar).texture;
  mieScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar).texture;

  // Let's just focus on the second order scattering until that looks correct, possibly giving
  // another look over the first order scattering to make sure we have that correct as well.
  for(let i = 0; i < 7; ++i){
    multipleScatteringMieVar.material.uniforms.inscatteredLightLUT.value = mieScattering;
    multipleScatteringRayleighVar.material.uniforms.inscatteredLightLUT.value = rayleighScattering;

    //Compute this mie and rayliegh scattering order
    multipleScatteringRenderer.compute();
    mieScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar).texture;
    rayleighScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar).texture;

    //Sum
    inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = rayleighScattering;
    inscatteringRayleighSumVar.material.uniforms.previousInscatteringSum.value = rayleighScatteringSum;
    inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = mieScattering;
    inscatteringMieSumVar.material.uniforms.previousInscatteringSum.value = mieScatteringSum;
    scatteringSumRenderer.compute();
    rayleighScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar).texture;
    mieScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar).texture;
  }

  //Clean up and finishin attaching things we will need
  mieScattering.dispose();
  rayleighScattering.dispose();
  this.transmittance = transmittanceLUT;
  this.rayleighScatteringSum = rayleighScatteringSum;
  this.mieScatteringSum = mieScatteringSum;
}
