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
  const OUTPUT_RENDER_TEXTURE_WIDTH = 2048;
  const OUTPUT_RENDER_TEXTURE_HEIGHT = 1024;
  const cloudTextureRenderer = new THREE.StarrySkyComputationRenderer(OUTPUT_RENDER_TEXTURE_WIDTH, OUTPUT_RENDER_TEXTURE_HEIGHT, renderer);

  const BYTES_PER_32_BIT_FLOAT = 4;
  const cloud3DNoiseRenderTargetBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * CLOUD_RENDER_TEXTURE_SIZE * CLOUD_RENDER_TEXTURE_SIZE * CLOUD_RENDER_TEXTURE_SIZE * 4);
  const cloud3DNoiseRenderTargetBufferFloat32Array = new Float32Array(cloud3DNoiseRenderTargetBuffer);
  const cloud3DNoiseRenderTargetBufferSlice = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * OUTPUT_RENDER_TEXTURE_WIDTH * OUTPUT_RENDER_TEXTURE_HEIGHT * 4);
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
  cloudTextureRenderer.compute();
  const renderTarget = cloudTextureRenderer.getCurrentRenderTarget(cloudNoiseSliceVar);
  renderer.readRenderTargetPixels(renderTarget, 0, 0, OUTPUT_RENDER_TEXTURE_WIDTH, OUTPUT_RENDER_TEXTURE_HEIGHT, cloud3DNoiseRenderTargetBufferFloat32ArraySlice);
  for(let i = 0; i < OUTPUT_RENDER_TEXTURE_HEIGHT; ++i){
    for(let j = 0; j < OUTPUT_RENDER_TEXTURE_WIDTH; ++j){
      for(let k = 0; k < 4; ++k){
        //Convert this 2D pixel coordinate into a position from our render target read
        const xIndex = Math.floor(j / 128.0);
      	const yIndex = Math.floor(i / 128.0);
      	const z = (xIndex + yIndex * 16);
      	const x = (j - xIndex * 128);
      	const y = (i - yIndex * 128);

        //Convert this 2D pixel coordinate into its' appropriate read position in the 3D texture render buffer
        const inputLocation = (i * OUTPUT_RENDER_TEXTURE_WIDTH + j) * 4 + k;
        const outputLocation = (x + y * 128 + z * 128 * 128) * 4 + k;

        cloud3DNoiseRenderTargetBufferFloat32Array[outputLocation] = cloud3DNoiseRenderTargetBufferFloat32ArraySlice[inputLocation];
      }
    }
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
