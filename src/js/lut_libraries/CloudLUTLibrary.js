//Bakes the tileable noise the clouds are built from, once, on the GPU:
//  baseNoise    128^3 RGBA8  Perlin-Worley + three Worley fBms -- the cloud mass
//  detailNoise   32^3 RGBA8  three Worley fBms -- erodes the edges
//  weatherMap   512^2 RGBA8  where clouds are, what species, and the cirrus streaks
//See cloud-noise.glsl for the channel layout and cloud-density.glsl for how they are
//combined.
//
//Every layer is rendered straight into its render target, the same way the texture
//array builder fills its arrays. The old baker read a 2048x1024 float slice sheet
//back to the CPU and reshuffled it into a Data3DTexture, which stalled the pipeline
//and cost 32MB of RGBA32F for data that is perfectly happy at 8 bits.
StarrySky.LUTlibraries.CloudLUTLibrary = function(data, renderer, scene){
  const BASE_NOISE_SIZE = 128;
  const DETAIL_NOISE_SIZE = 32;
  const WEATHER_MAP_SIZE = 512;

  const builder = StarrySky.TextureArrayBuilder;
  const noiseTemplate = StarrySky.Materials.Clouds.cloudNoiseMaterial;
  const material = builder.createMaterial(noiseTemplate.fragmentShader, noiseTemplate.uniforms());

  //No mipmaps. The base noise tiles every few kilometres, so it is never minified
  //inside the cloud cutoff, and the detail noise is faded out with distance in the
  //density function before it would alias.
  const createVolume = function(size){
    const target = new THREE.WebGL3DRenderTarget(size, size, size, {
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      generateMipmaps: false,
      depthBuffer: false,
      stencilBuffer: false
    });
    target.texture.wrapS = THREE.RepeatWrapping;
    target.texture.wrapT = THREE.RepeatWrapping;
    target.texture.wrapR = THREE.RepeatWrapping;
    target.texture.generateMipmaps = false;
    target.texture.colorSpace = THREE.NoColorSpace;
    return target;
  };

  const bakeVolume = function(size, mode){
    const target = createVolume(size);
    material.uniforms.noiseMode.value = mode;
    material.uniforms.depth.value = size;
    for(let z = 0; z < size; ++z){
      material.uniforms.slice.value = z;
      builder.renderLayer(renderer, target, z, material);
    }
    return target;
  };

  const bakeStart = performance.now();
  this.baseNoiseTarget = bakeVolume(BASE_NOISE_SIZE, 0);
  this.detailNoiseTarget = bakeVolume(DETAIL_NOISE_SIZE, 1);

  this.weatherMapTarget = new THREE.WebGLRenderTarget(WEATHER_MAP_SIZE, WEATHER_MAP_SIZE, {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    generateMipmaps: false,
    depthBuffer: false,
    stencilBuffer: false
  });
  this.weatherMapTarget.texture.colorSpace = THREE.NoColorSpace;
  material.uniforms.noiseMode.value = 2;
  material.uniforms.depth.value = 1.0;
  material.uniforms.slice.value = 0.0;
  builder.renderLayer(renderer, this.weatherMapTarget, 0, material);

  material.dispose();

  this.baseNoise = this.baseNoiseTarget.texture;
  this.detailNoise = this.detailNoiseTarget.texture;
  this.weatherMap = this.weatherMapTarget.texture;

  //The GPU work is queued, not finished, so this is a lower bound -- but it is the
  //number that shows up as a hitch on the main thread.
  console.log(`Cloud noise baked in ${(performance.now() - bakeStart).toFixed(1)}ms`);
}
