StarrySky.LUTlibraries.CloudLUTLibrary = function(data, renderer, scene){
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
  const materials = StarrySky.Materials.Clouds;

  const CLOUD_RENDER_TEXTURE_SIZE = 128;
  const cloudTextureRenderer = new THREE.StarrySkyComputationRenderer(CLOUD_RENDER_TEXTURE_SIZE, CLOUD_RENDER_TEXTURE_SIZE, renderer);

  const BYTES_PER_32_BIT_FLOAT = 4;
  const cloud3DNoiseRenderTargetBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * CLOUD_RENDER_TEXTURE_SIZE * CLOUD_RENDER_TEXTURE_SIZE * CLOUD_RENDER_TEXTURE_SIZE * 4);
  const cloud3DNoiseRenderTargetBufferFloat32Array = new Float32Array(cloud3DNoiseRenderTargetBuffer);
  const cloud3DNoiseRenderTargetBufferSlice = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * CLOUD_RENDER_TEXTURE_SIZE * CLOUD_RENDER_TEXTURE_SIZE * 4);
  const cloud3DNoiseRenderTargetBufferFloat32ArraySlice = new Float32Array(cloud3DNoiseRenderTargetBufferSlice);

  const cloudNoiseSliceTexture = cloudTextureRenderer.createTexture();
  const cloudNoiseSliceVar = cloudTextureRenderer.addVariable('cloudNoise',
    materials.cloudNoiseMaterial.fragmentShader,
    cloudNoiseSliceTexture
  );
  cloudTextureRenderer.setVariableDependencies(cloudNoiseSliceVar, []);
  cloudNoiseSliceVar.material.uniforms = JSON.parse(JSON.stringify(materials.cloudNoiseMaterial.uniforms));
  cloudNoiseSliceVar.type = THREE.FloatType;
  cloudNoiseSliceVar.format = THREE.RGBAFormat;
  cloudNoiseSliceVar.minFilter = THREE.NearestFilter;
  cloudNoiseSliceVar.magFilter = THREE.NearestFilter;
  cloudNoiseSliceVar.wrapS = THREE.ClampToEdgeWrapping;
  cloudNoiseSliceVar.wrapT = THREE.ClampToEdgeWrapping;
  cloudNoiseSliceVar.encoding = THREE.LinearEncoding;

  let error1 = cloudTextureRenderer.init();
  if(error1 !== null){
    console.error(`Cloud Texture Renderer: ${error1}`);
  }

  //Read data one slice at a time into the 3D texture array buffer
  const inverseCloudRenderTextureSize = 1.0 / CLOUD_RENDER_TEXTURE_SIZE;
  const NUM_DATA_POINTS_IN_SLICE = CLOUD_RENDER_TEXTURE_SIZE * CLOUD_RENDER_TEXTURE_SIZE * 4;
  for(let i = 0; i < CLOUD_RENDER_TEXTURE_SIZE; ++i){
    cloudNoiseSliceVar.material.uniforms.zDepth = i * inverseCloudRenderTextureSize;
    cloudNoiseSliceVar.material.uniforms.zDepth.needsUpdate = true;
    cloudTextureRenderer.compute();
    const renderTarget = cloudTextureRenderer.getCurrentRenderTarget(cloudNoiseSliceVar);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, CLOUD_RENDER_TEXTURE_SIZE, CLOUD_RENDER_TEXTURE_SIZE, cloud3DNoiseRenderTargetBufferFloat32ArraySlice);
    let test = 0.0;
    for(let j = 0; j < NUM_DATA_POINTS_IN_SLICE; ++j){
      test += cloud3DNoiseRenderTargetBufferFloat32ArraySlice[j];
      cloud3DNoiseRenderTargetBufferFloat32Array[i * NUM_DATA_POINTS_IN_SLICE + j] = cloud3DNoiseRenderTargetBufferFloat32ArraySlice[j];
    }
    console.log(test);
  }

  //Turn this array into a 3D texture
  this.repeating3DCloudNoiseTextures = new THREE.DataTexture3D(cloud3DNoiseRenderTargetBufferFloat32Array, CLOUD_RENDER_TEXTURE_SIZE, CLOUD_RENDER_TEXTURE_SIZE, CLOUD_RENDER_TEXTURE_SIZE);
  this.repeating3DCloudNoiseTextures.type = THREE.FloatType;
  this.repeating3DCloudNoiseTextures.format = THREE.RGBAFormat;
  this.repeating3DCloudNoiseTextures.minFilter = THREE.LinearFilter;
  this.repeating3DCloudNoiseTextures.magFilter = THREE.LinearFilter;
  this.repeating3DCloudNoiseTextures.wrapS = THREE.RepeatWrapping;
  this.repeating3DCloudNoiseTextures.wrapT = THREE.RepeatWrapping;
  this.repeating3DCloudNoiseTextures.wrapR = THREE.RepeatWrapping;
  this.repeating3DCloudNoiseTextures.encoding = THREE.LinearEncoding;
  this.repeating3DCloudNoiseTextures.needsUpdate = true;
}
