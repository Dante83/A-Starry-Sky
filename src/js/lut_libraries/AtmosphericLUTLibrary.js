StarrySky.LUTlibraries.AtmosphericLUTLibrary = function(data, renderer){
  const materials = StarrySky.Materials.Atmosphere; //Using... as materials
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

  //Using guidance from https://github.com/mrdoob/three.js/issues/18746#issuecomment-591441598
  const initialRenderTarget = renderer.getRenderTarget();
  const currentXrEnabled = renderer.xr.enabled;
  const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
  renderer.xr.enabled = false;
  renderer.shadowMap.autoUpdate = false;

  //Prepare our scene and render target object
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const targetMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2),
    new THREE.MeshBasicMaterial({color: new THREE.Color( 0, 1, 0 )}) //Default to no material because we will set this to a shader material later
  );
  scene.add(targetMesh);

  //Create our first renderer, for transmittance
  const TRANSMITTANCE_TEXTURE_SIZE = 512;
  this.transmittanceTextureSize = TRANSMITTANCE_TEXTURE_SIZE;
  let transmittanceRenderer = new THREE.StarrySkyComputationRenderer(TRANSMITTANCE_TEXTURE_SIZE, TRANSMITTANCE_TEXTURE_SIZE, renderer);

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
  //Prime our texture with the single scattering texture
  //
  const MSRT_WIDTH = 256;
  const MSRT_HEIGHT = 1024;
  const multiScatteringRenderTarget = new THREE.WebGLMultipleRenderTargets(MSRT_WIDTH, MSRT_HEIGHT, 4);
  for(let i = 0; i < 3; ++i){
    multiScatteringRenderTarget.texture[i].minFilter = THREE.NearestFilter;
    multiScatteringRenderTarget.texture[i].magFilter = THREE.NearestFilter;
    multiScatteringRenderTarget.texture[i].wrapS = THREE.ClampToEdgeWrapping;
    multiScatteringRenderTarget.texture[i].wrapT = THREE.ClampToEdgeWrapping;
    multiScatteringRenderTarget.texture[i].type = THREE.FloatType;
    multiScatteringRenderTarget.texture[i].depthBuffer = false;
    multiScatteringRenderTarget.texture[i].encoding = THREE.LinearEncoding;
  }
  multiScatteringRenderTarget.texture[0].name = 'kthInscatteringMie';
  multiScatteringRenderTarget.texture[1].name = 'kthInscatteringRayleigh';
  multiScatteringRenderTarget.texture[2].name = 'kthInscatteringSumMie';
  multiScatteringRenderTarget.texture[3].name = 'kthInscatteringSumRayleigh';
  targetMesh.material = new THREE.RawShaderMaterial({
    uniforms: {...materials.singleScatteringMaterial.uniforms},
    vertexShader: 'in vec3 position;void main(){gl_Position = vec4( position, 1.0 );}',
    fragmentShader: materials.singleScatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      atmosphereFunctions
    ),
    glslVersion: THREE.GLSL3
  });
  const MSRT_WIDTH_STR = MSRT_WIDTH.toFixed(1);
  const MSRT_HEIGHT_STR = MSRT_HEIGHT.toFixed(1);
  targetMesh.material.defines.resolution = 'vec2( ' + MSRT_WIDTH_STR + ', ' + MSRT_HEIGHT_STR + " )";
  targetMesh.material.uniforms.transmittanceTexture.value = transmittanceLUT;

  //Render
  renderer.setRenderTarget(multiScatteringRenderTarget);
  renderer.clear();
  renderer.render(scene, camera);
  let mieScattering = multiScatteringRenderTarget.texture[0];
  let rayleighScattering = multiScatteringRenderTarget.texture[1];
  let mieScatteringSum = multiScatteringRenderTarget.texture[2];
  let rayleighScatteringSum = multiScatteringRenderTarget.texture[3];

  //The read pixels render target (>_< Not the best, but can I do?)
  const outputRenderTarget = new THREE.WebGLRenderTarget(MSRT_WIDTH, MSRT_HEIGHT);
  outputRenderTarget.texture.name = 'readPixelsRenderTarget';
  outputRenderTarget.texture.minFilter = THREE.NearestFilter;
  outputRenderTarget.texture.magFilter = THREE.NearestFilter;
  outputRenderTarget.texture.wrapS = THREE.ClampToEdgeWrapping;
  outputRenderTarget.texture.wrapT = THREE.ClampToEdgeWrapping;
  outputRenderTarget.texture.type = THREE.FloatType;
  outputRenderTarget.texture.depthBuffer = false;
  outputRenderTarget.texture.encoding = THREE.LinearEncoding;
  const convertToRenderTextureMaterial = new THREE.RawShaderMaterial({
    uniforms: {inTex: {value: null}},
    vertexShader: 'in vec3 position;void main(){gl_Position = vec4( position, 1.0 );}',
    fragmentShader: 'precision highp float;precision highp int;layout(location = 0) out vec4 outFragment;uniform sampler2D inTex;void main(){outFragment = texture(inTex, gl_FragCoord.xy/resolution.xy);}',
    glslVersion: THREE.GLSL3
  });
  convertToRenderTextureMaterial.defines.resolution = 'vec2( ' + MSRT_WIDTH_STR + ', ' + MSRT_HEIGHT_STR + " )";
  targetMesh.material = convertToRenderTextureMaterial;

  //Convert our mie and rayleigh scattering textures into 3D textures
  const mieRenderBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * MSRT_WIDTH * MSRT_HEIGHT * 4);
  const mieRenderBufferFloatArray = new Float32Array(mieRenderBuffer);
  convertToRenderTextureMaterial.uniforms.inTex.value = mieScattering;
  renderer.setRenderTarget(outputRenderTarget);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.readRenderTargetPixels(outputRenderTarget, 0, 0, MSRT_WIDTH, MSRT_HEIGHT, mieRenderBufferFloatArray);

  mie3DDataTexture  = new THREE.DataTexture3D(mieRenderBufferFloatArray, MSRT_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  mie3DDataTexture.wrapR = THREE.ClampToEdgeWrapping;
  mie3DDataTexture.wrapS = THREE.ClampToEdgeWrapping;
  mie3DDataTexture.wrapT = THREE.ClampToEdgeWrapping;
  mie3DDataTexture.minFilter = THREE.LinearFilter;
  mie3DDataTexture.magFilter = THREE.LinearFilter;
  mie3DDataTexture.type = THREE.FloatType;
  mie3DDataTexture.encoding = THREE.LinearEncoding;
  mie3DDataTexture.unpackAlignment = 1;
  mie3DDataTexture.needsUpdate = true;

  const rayleighRenderBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * MSRT_WIDTH * MSRT_HEIGHT * 4);
  const rayleighRenderBufferFloatArray = new Float32Array(rayleighRenderBuffer);
  convertToRenderTextureMaterial.uniforms.inTex.value = rayleighScattering;
  renderer.clear();
  renderer.render(scene, camera);
  renderer.readRenderTargetPixels(outputRenderTarget, 0, 0, MSRT_WIDTH, MSRT_HEIGHT, rayleighRenderBufferFloatArray);
  const rayleigh3DDataTexture = new THREE.DataTexture3D(rayleighRenderBufferFloatArray, MSRT_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  rayleigh3DDataTexture.wrapR = THREE.ClampToEdgeWrapping;
  rayleigh3DDataTexture.wrapS = THREE.ClampToEdgeWrapping;
  rayleigh3DDataTexture.wrapT = THREE.ClampToEdgeWrapping;
  rayleigh3DDataTexture.minFilter = THREE.LinearFilter;
  rayleigh3DDataTexture.magFilter = THREE.LinearFilter;
  rayleigh3DDataTexture.type = THREE.FloatType;
  rayleigh3DDataTexture.encoding = THREE.LinearEncoding;
  rayleigh3DDataTexture.unpackAlignment = 1;
  rayleigh3DDataTexture.needsUpdate = true;

  //
  //Prime the first of our multiple scattering operations
  //
  const kthInscatteringMaterial = new THREE.RawShaderMaterial({
    uniforms: {...materials.kthInscatteringMaterial.uniforms},
    vertexShader: 'in vec3 position;void main(){gl_Position = vec4( position, 1.0 );}',
    fragmentShader: materials.kthInscatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      mieGCoefficient,
      atmosphereFunctions
    ),
    glslVersion: THREE.GLSL3
  });
  targetMesh.material = kthInscatteringMaterial;
  targetMesh.material.defines.resolution = 'vec2( ' + MSRT_WIDTH_STR + ', ' + MSRT_HEIGHT_STR + " )";
  targetMesh.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  targetMesh.material.uniforms.inscatteredMieLightLUT.value = mie3DDataTexture;
  targetMesh.material.uniforms.inscatteredRayleighLightLUT.value = rayleigh3DDataTexture;
  targetMesh.material.uniforms.mieSumInColor.value = mieScatteringSum;
  targetMesh.material.uniforms.rayleighSumInColor.value = rayleighScatteringSum;
  console.log('bing!');
  debugger;


  //Render the second scattering event
  renderer.setRenderTarget(multiScatteringRenderTarget);
  renderer.clear();
  renderer.render(scene, camera);
  mieScattering = multiScatteringRenderTarget.texture[0];
  rayleighScattering = multiScatteringRenderTarget.texture[1];
  rayleighScatteringSum = multiScatteringRenderTarget.texture[2];
  mieScatteringSum = multiScatteringRenderTarget.texture[3];

  // Iterate this a few times to get higher order scattering
  for(let i = 0; i < 7; ++i){
    console.log('TEST!');
    //Convert the previous inscattering results to a 3D texture
    targetMesh.material = convertToRenderTextureMaterial;
    targetMesh.material.uniforms.inTex.value = mieScattering;
    renderer.setRenderTarget(outputRenderTarget);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.readRenderTargetPixels(outputRenderTarget, 0, 0, MSRT_WIDTH, MSRT_HEIGHT, mieRenderBufferFloatArray);
    mei3DDataTexture.needsUpdate = true;
    targetMesh.material.uniforms.inTex.value = rayleighScattering;
    renderer.clear();
    renderer.render(scene, camera);
    renderer.readRenderTargetPixels(outputRenderTarget, 0, 0, MSRT_WIDTH, MSRT_HEIGHT, rayleighRenderBufferFloatArray);
    rayleigh3DDataTexture.needsUpdate = true;

    //Update our uniforms...
    targetMesh.material = kthInscatteringMaterial;
    targetMesh.material.uniforms.inscatteredMieLightLUT.value = mie3DDataTexture;
    targetMesh.material.uniforms.inscatteredRayleighLightLUT.value = rayleigh3DDataTexture;

    //render the scene
    renderer.render(scene, camera);
    mieScattering = multiScatteringRenderTarget.texture[0];
    rayleighScattering = multiScatteringRenderTarget.texture[1];
    mieScatteringSum = multiScatteringRenderTarget.texture[2];
    rayleighScatteringSum = multiScatteringRenderTarget.texture[3];
  }
  //Convert the sums to a 3D Texture and dispose of the MRT
  targetMesh.material = convertToRenderTextureMaterial;
  targetMesh.material.uniforms.inTex.value = mieScatteringSum;
  renderer.setRenderTarget(outputRenderTarget);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.readRenderTargetPixels(outputRenderTarget, 0, 0, MSRT_WIDTH, MSRT_HEIGHT, mieRenderBufferFloatArray);
  mei3DDataTexture.needsUpdate = true;
  targetMesh.material.uniforms.inTex.value = rayleighScatteringSum;
  renderer.clear();
  renderer.render(scene, camera);
  renderer.readRenderTargetPixels(outputRenderTarget, 0, 0, MSRT_WIDTH, MSRT_HEIGHT, rayleighRenderBufferFloatArray);
  rayleigh3DDataTexture.needsUpdate = true;
  this.mieScatteringSum.dispose();
  this.rayleighScatteringSum.dispose();
  multiScatteringRenderTarget.dispose();
  outputRenderTarget.dispose();
  this.mieScatteringSum = mei3DDataTexture;
  this.rayleighScatteringSum = rayleigh3DDataTexture;
  this.transmittance = transmittanceLUT;

  //Clean up shadows and XR stuff
  renderer.xr.enabled = currentXrEnabled;
  renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
  renderer.setRenderTarget(initialRenderTarget);
}
