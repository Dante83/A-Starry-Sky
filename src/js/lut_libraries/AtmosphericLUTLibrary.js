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
  this.scatteringTexturePackingWidth = 1;
  this.scatteringTexturePackingHeight = 32;
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
  transmittanceVar.format = THREE.RGBAFormat;
  transmittanceVar.minFilter = THREE.LinearFilter;
  transmittanceVar.magFilter = THREE.LinearFilter;
  transmittanceVar.wrapS = THREE.ClampToEdgeWrapping;
  transmittanceVar.wrapT = THREE.ClampToEdgeWrapping;
  transmittanceVar.encoding = THREE.LinearEncoding;

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
  singleScatteringMieVar.material.uniforms = {...materials.singleScatteringMaterial.uniforms};
  singleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  singleScatteringMieVar.format = THREE.RGBAFormat;
  singleScatteringMieVar.minFilter = THREE.NearestFilter;
  singleScatteringMieVar.magFilter = THREE.NearestFilter;
  singleScatteringMieVar.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringMieVar.wrapT = THREE.ClampToEdgeWrapping;
  singleScatteringMieVar.encoding = THREE.LinearEncoding;

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
  singleScatteringRayleighVar.material.uniforms = {...materials.singleScatteringMaterial.uniforms};
  singleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  singleScatteringRayleighVar.format = THREE.RGBAFormat;
  singleScatteringRayleighVar.minFilter = THREE.NearestFilter;
  singleScatteringRayleighVar.magFilter = THREE.NearestFilter;
  singleScatteringRayleighVar.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringRayleighVar.wrapT = THREE.ClampToEdgeWrapping;
  singleScatteringRayleighVar.encoding = THREE.LinearEncoding;

  //Check for any errors in initialization
  let error2 = singleScatteringRenderer.init();
  if(error2 !== null){
    console.error(`Single Scattering Renderer: ${error2}`);
  }

  //Run the scattering shader
  singleScatteringRenderer.compute();
  const mieSingleScatteringRenderTarget = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringMieVar);
  const rayleighSingleScatteringRenderTarget = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringRayleighVar);
  //Convert this to a 3-D LUT
  const MSRT_TEXTURE_WIDTH = 256;
  const MSRT_TEXTURE_HEIGHT = 1024;
  const singleScatteringMieBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * MSRT_TEXTURE_WIDTH * MSRT_TEXTURE_HEIGHT * 4);
  const singleScatteringMieFloat32Array = new Float32Array(singleScatteringMieBuffer);
  renderer.readRenderTargetPixels(mieSingleScatteringRenderTarget, 0, 0, MSRT_TEXTURE_WIDTH, MSRT_TEXTURE_HEIGHT, singleScatteringMieFloat32Array);
  const singleScatteringMie3DLUT = new THREE.DataTexture3D(singleScatteringMieFloat32Array, MSRT_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  singleScatteringMie3DLUT.format = THREE.RGBAFormat;
  singleScatteringMie3DLUT.minFilter = THREE.LinearFilter;
  singleScatteringMie3DLUT.magFilter = THREE.LinearFilter;
  singleScatteringMie3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringMie3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  singleScatteringMie3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  singleScatteringMie3DLUT.encoding = THREE.LinearEncoding;

  const singleScatteringRayleighBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * MSRT_TEXTURE_WIDTH * MSRT_TEXTURE_HEIGHT * 4);
  const singleScatteringRayleighFloat32Array = new Float32Array(singleScatteringRayleighBuffer);
  renderer.readRenderTargetPixels(rayleighSingleScatteringRenderTarget, 0, 0, MSRT_TEXTURE_WIDTH, MSRT_TEXTURE_HEIGHT, singleScatteringRayleighFloat32Array);
  const singleScatteringRayleigh3DLUT = new THREE.DataTexture3D(singleScatteringRayleighFloat32Array, MSRT_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  singleScatteringRayleigh3DLUT.format = THREE.RGBAFormat;
  singleScatteringRayleigh3DLUT.minFilter = THREE.LinearFilter;
  singleScatteringRayleigh3DLUT.magFilter = THREE.LinearFilter;
  singleScatteringRayleigh3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringRayleigh3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  singleScatteringRayleigh3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  singleScatteringRayleigh3DLUT.encoding = THREE.LinearEncoding;

  //Combine our two shaders together into an inscattering sum texture
  let inscatteringRayleighSumTexture = scatteringSumRenderer.createTexture();
  let inscatteringRayleighSumVar = scatteringSumRenderer.addVariable('inscatteringRayleighSumTexture',
    materials.inscatteringSumMaterial.fragmentShader, //Initializing
    inscatteringRayleighSumTexture
  );
  scatteringSumRenderer.setVariableDependencies(inscatteringRayleighSumVar, []);
  inscatteringRayleighSumVar.material.uniforms = {...materials.inscatteringSumMaterial.uniforms};
  inscatteringRayleighSumVar.material.uniforms.isNotFirstIteration.value = 0;
  inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = rayleighSingleScatteringRenderTarget.texture;
  inscatteringRayleighSumVar.format = THREE.RGBAFormat;
  inscatteringRayleighSumVar.minFilter = THREE.NearestFilter;
  inscatteringRayleighSumVar.magFilter = THREE.NearestFilter;
  inscatteringRayleighSumVar.wrapS = THREE.ClampToEdgeWrapping;
  inscatteringRayleighSumVar.wrapT = THREE.ClampToEdgeWrapping;
  inscatteringRayleighSumVar.encoding = THREE.LinearEncoding;

  let inscatteringMieSumTexture = scatteringSumRenderer.createTexture();
  let inscatteringMieSumVar = scatteringSumRenderer.addVariable('inscatteringMieSumTexture',
    materials.inscatteringSumMaterial.fragmentShader, //Initializing
    inscatteringMieSumTexture
  );
  scatteringSumRenderer.setVariableDependencies(inscatteringMieSumVar, []);
  inscatteringMieSumVar.material.uniforms = {...materials.inscatteringSumMaterial.uniforms};
  inscatteringMieSumVar.material.uniforms.isNotFirstIteration.value = 0;
  inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = mieSingleScatteringRenderTarget.texture;
  inscatteringMieSumVar.format = THREE.RGBAFormat;
  inscatteringMieSumVar.minFilter = THREE.NearestFilter;
  inscatteringMieSumVar.magFilter = THREE.NearestFilter;
  inscatteringMieSumVar.wrapS = THREE.ClampToEdgeWrapping;
  inscatteringMieSumVar.wrapT = THREE.ClampToEdgeWrapping;
  inscatteringMieSumVar.encoding = THREE.LinearEncoding;

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
  multipleScatteringMieVar.material.uniforms = {...materials.kthInscatteringMaterial.uniforms};
  multipleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  multipleScatteringMieVar.material.uniforms.inscatteredLightLUT.value = singleScatteringMie3DLUT;
  multipleScatteringMieVar.format = THREE.RGBAFormat;
  multipleScatteringMieVar.minFilter = THREE.NearestFilter;
  multipleScatteringMieVar.magFilter = THREE.NearestFilter;
  multipleScatteringMieVar.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringMieVar.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringMieVar.encoding = THREE.LinearEncoding;

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
  multipleScatteringRayleighVar.material.uniforms = {...materials.kthInscatteringMaterial.uniforms};
  multipleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  multipleScatteringRayleighVar.material.uniforms.inscatteredLightLUT.value = singleScatteringRayleigh3DLUT;
  multipleScatteringRayleighVar.format = THREE.RGBAFormat;
  multipleScatteringRayleighVar.minFilter = THREE.NearestFilter;
  multipleScatteringRayleighVar.magFilter = THREE.NearestFilter;
  multipleScatteringRayleighVar.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleighVar.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleighVar.encoding = THREE.LinearEncoding;

  //Check for any errors in initialization
  let error4 = multipleScatteringRenderer.init();
  if(error4 !== null){
    console.error(`Multiple Scattering Renderer: ${error4}`);
  }

  //Run the multiple scattering shader
  multipleScatteringRenderer.compute();
  let multipleMieScatteringRenderTarget = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar);
  let multipleRayleighScatteringRenderTarget = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar);

  //And create our 3-D Texture again...
  let multipleScatteringMieBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * MSRT_TEXTURE_WIDTH * MSRT_TEXTURE_HEIGHT * 4);
  let multipleScatteringMieFloat32Array = new Float32Array(multipleScatteringMieBuffer);
  renderer.readRenderTargetPixels(multipleMieScatteringRenderTarget, 0, 0, MSRT_TEXTURE_WIDTH, MSRT_TEXTURE_HEIGHT, multipleScatteringMieFloat32Array);
  let multipleScatteringMie3DLUT = new THREE.DataTexture3D(multipleScatteringMieFloat32Array, MSRT_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  multipleScatteringMie3DLUT.format = THREE.RGBAFormat;
  multipleScatteringMie3DLUT.minFilter = THREE.LinearFilter;
  multipleScatteringMie3DLUT.magFilter = THREE.LinearFilter;
  multipleScatteringMie3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.encoding = THREE.LinearEncoding;

  let multipleScatteringRayleighBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * MSRT_TEXTURE_WIDTH * MSRT_TEXTURE_HEIGHT * 4);
  let multipleScatteringRayleighFloat32Array = new Float32Array(multipleScatteringRayleighBuffer);
  renderer.readRenderTargetPixels(multipleRayleighScatteringRenderTarget, 0, 0, MSRT_TEXTURE_WIDTH, MSRT_TEXTURE_HEIGHT, multipleScatteringRayleighFloat32Array);
  let multipleScatteringRayleigh3DLUT = new THREE.DataTexture3D(multipleScatteringRayleighFloat32Array, MSRT_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  multipleScatteringRayleigh3DLUT.format = THREE.RGBAFormat;
  multipleScatteringRayleigh3DLUT.minFilter = THREE.LinearFilter;
  multipleScatteringRayleigh3DLUT.magFilter = THREE.LinearFilter;
  multipleScatteringRayleigh3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.encoding = THREE.LinearEncoding;

  //Sum
  inscatteringRayleighSumVar.material.uniforms.isNotFirstIteration.value = 1;
  inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = multipleRayleighScatteringRenderTarget.texture;
  inscatteringRayleighSumVar.material.uniforms.previousInscatteringSum.value = rayleighScatteringSum;
  inscatteringMieSumVar.material.uniforms.isNotFirstIteration.value = 1;
  inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = multipleMieScatteringRenderTarget.texture;
  inscatteringMieSumVar.material.uniforms.previousInscatteringSum.value = mieScatteringSum;
  scatteringSumRenderer.compute();
  rayleighScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar).texture;
  mieScatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar).texture;

  // Let's just focus on the second order scattering until that looks correct, possibly giving
  // another look over the first order scattering to make sure we have that correct as well.
  let rayleighScatteringSumRenderTarget;
  let meiScatteringSumRenderTarget;
  for(let i = 0; i < 7; ++i){
    multipleScatteringMieVar.material.uniforms.inscatteredLightLUT.value = multipleScatteringMie3DLUT;
    multipleScatteringRayleighVar.material.uniforms.inscatteredLightLUT.value = multipleScatteringRayleigh3DLUT;

    //Compute this mie and rayliegh scattering order
    multipleScatteringRenderer.compute();
    multipleMieScatteringRenderTarget = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar);
    multipleRayleighScatteringRenderTarget = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar);

    //Sum
    inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = multipleRayleighScatteringRenderTarget.texture;
    inscatteringRayleighSumVar.material.uniforms.previousInscatteringSum.value = rayleighScatteringSum;
    inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = multipleMieScatteringRenderTarget.texture;
    inscatteringMieSumVar.material.uniforms.previousInscatteringSum.value = mieScatteringSum;
    scatteringSumRenderer.compute();
    rayleighScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar);
    rayleighScatteringSum = rayleighScatteringSumRenderTarget.texture;
    meiScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar);
    mieScatteringSum = meiScatteringSumRenderTarget.texture;

    //And create our 3-D textures again...
    renderer.readRenderTargetPixels(multipleMieScatteringRenderTarget, 0, 0, MSRT_TEXTURE_WIDTH, MSRT_TEXTURE_HEIGHT, multipleScatteringMieFloat32Array);
    multipleScatteringMie3DLUT = new THREE.DataTexture3D(multipleScatteringMieFloat32Array, MSRT_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
    multipleScatteringMie3DLUT.format = THREE.RGBAFormat;
    multipleScatteringMie3DLUT.minFilter = THREE.LinearFilter;
    multipleScatteringMie3DLUT.magFilter = THREE.LinearFilter;
    multipleScatteringMie3DLUT.wrapS = THREE.ClampToEdgeWrapping;
    multipleScatteringMie3DLUT.wrapT = THREE.ClampToEdgeWrapping;
    multipleScatteringMie3DLUT.wrapR = THREE.ClampToEdgeWrapping;
    multipleScatteringMie3DLUT.encoding = THREE.LinearEncoding;
    renderer.readRenderTargetPixels(multipleRayleighScatteringRenderTarget, 0, 0, MSRT_TEXTURE_WIDTH, MSRT_TEXTURE_HEIGHT, multipleScatteringRayleighFloat32Array);
    multipleScatteringRayleigh3DLUT = new THREE.DataTexture3D(multipleScatteringRayleighFloat32Array, MSRT_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
    multipleScatteringRayleigh3DLUT.format = THREE.RGBAFormat;
    multipleScatteringRayleigh3DLUT.minFilter = THREE.LinearFilter;
    multipleScatteringRayleigh3DLUT.magFilter = THREE.LinearFilter;
    multipleScatteringRayleigh3DLUT.wrapS = THREE.ClampToEdgeWrapping;
    multipleScatteringRayleigh3DLUT.wrapT = THREE.ClampToEdgeWrapping;
    multipleScatteringRayleigh3DLUT.wrapR = THREE.ClampToEdgeWrapping;
    multipleScatteringRayleigh3DLUT.encoding = THREE.LinearEncoding;
  }

  //And finally create a 3-D texture for our sum, which is what we really want...
  renderer.readRenderTargetPixels(meiScatteringSumRenderTarget, 0, 0, MSRT_TEXTURE_WIDTH, MSRT_TEXTURE_HEIGHT, multipleScatteringMieFloat32Array);
  multipleScatteringMie3DLUT = new THREE.DataTexture3D(multipleScatteringMieFloat32Array, MSRT_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  multipleScatteringMie3DLUT.format = THREE.RGBAFormat;
  multipleScatteringMie3DLUT.minFilter = THREE.LinearFilter;
  multipleScatteringMie3DLUT.magFilter = THREE.LinearFilter;
  multipleScatteringMie3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.encoding = THREE.LinearEncoding;
  renderer.readRenderTargetPixels(rayleighScatteringSumRenderTarget, 0, 0, MSRT_TEXTURE_WIDTH, MSRT_TEXTURE_HEIGHT, multipleScatteringRayleighFloat32Array);
  multipleScatteringRayleigh3DLUT = new THREE.DataTexture3D(multipleScatteringRayleighFloat32Array, MSRT_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  multipleScatteringRayleigh3DLUT.format = THREE.RGBAFormat;
  multipleScatteringRayleigh3DLUT.minFilter = THREE.LinearFilter;
  multipleScatteringRayleigh3DLUT.magFilter = THREE.LinearFilter;
  multipleScatteringRayleigh3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.encoding = THREE.LinearEncoding;

  //Clean up and finishin attaching things we will need
  this.transmittance = transmittanceLUT;
  this.mieScatteringSum = multipleScatteringMie3DLUT;
  this.rayleighScatteringSum = multipleScatteringRayleigh3DLUT;
}
