//The three star tiers are one family: same format, same filtering, same wrapping, and
//they differ only in size. They therefore collapse into a single sampler2DArray, taking
//the atmosphere and moon programs down by two texture units each.
//
//The tiers keep their native sizes. Each renders at its own resolution into the
//bottom-left corner of a 128x64 layer through the viewport, so the bake shader still sees
//the resolution it was written for and nothing about it has to change. The remainder of
//the smaller layers is never sampled, because the consumer reads this array with
//texelFetch and integer star indices rather than normalized UVs.
StarrySky.LUTlibraries.StellarLUTLibrary = function(data, renderer, scene){
  this.renderer = renderer;
  //Stays undefined until every tier has been baked. A half-filled array would hand the
  //sky shader zeroed star data, which decodes to magnitude zero -- a sky full of
  //impossibly bright stars for as long as the remaining tiers take to load.
  this.starDataArray = undefined;

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
  const materials = StarrySky.Materials.Stars;

  //Layer indices, mirrored by DIM_STAR_LAYER, MED_STAR_LAYER and BRIGHT_STAR_LAYER in
  //atmosphere-pass.glsl. These two lists must not drift apart.
  const DIM_STAR_LAYER = 0;
  const MED_STAR_LAYER = 1;
  const BRIGHT_STAR_LAYER = 2;
  const NUMBER_OF_STAR_TIERS = 3;

  //The array is sized to its largest member.
  const STAR_DATA_WIDTH = 128;
  const STAR_DATA_HEIGHT = 64;

  const DIM_STAR_WIDTH = 128;
  const DIM_STAR_HEIGHT = 64;
  const MED_STAR_WIDTH = 32;
  const MED_STAR_HEIGHT = 32;
  const BRIGHT_STAR_WIDTH = 8;
  const BRIGHT_STAR_HEIGHT = 8;

  this.starDataRenderTarget = StarrySky.TextureArrayBuilder.build({
    width: STAR_DATA_WIDTH,
    height: STAR_DATA_HEIGHT,
    layers: NUMBER_OF_STAR_TIERS,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    //Matching the type the GPGPU path used to pick for us. These hold decoded galactic
    //coordinates reaching +/-17000, so the precision here is load-bearing.
    type: (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? THREE.HalfFloatType : THREE.FloatType,
    colorSpace: THREE.LinearSRGBColorSpace,
    generateMipmaps: false
  });

  //One material for all three tiers. renderLayer rewrites its resolution define per tier.
  const starDataMaterial = StarrySky.TextureArrayBuilder.createMaterial(
    materials.starDataMap.fragmentShader,
    JSON.parse(JSON.stringify(materials.starDataMap.uniforms))
  );

  let numberOfTiersBaked = 0;
  const self = this;

  const bakeStarTier = function(layerIndex, width, height, rImg, gImg, bImg, aImg){
    starDataMaterial.uniforms.textureRChannel.value = rImg;
    starDataMaterial.uniforms.textureGChannel.value = gImg;
    starDataMaterial.uniforms.textureBChannel.value = bImg;
    starDataMaterial.uniforms.textureAChannel.value = aImg;

    StarrySky.TextureArrayBuilder.renderLayer(renderer, self.starDataRenderTarget, layerIndex, starDataMaterial, width, height);

    starDataMaterial.uniforms.textureRChannel.value = null;
    starDataMaterial.uniforms.textureGChannel.value = null;
    starDataMaterial.uniforms.textureBChannel.value = null;
    starDataMaterial.uniforms.textureAChannel.value = null;

    numberOfTiersBaked += 1;
    if(numberOfTiersBaked === NUMBER_OF_STAR_TIERS){
      self.starDataArray = StarrySky.TextureArrayBuilder.finalize(renderer, self.starDataRenderTarget);
    }

    return self.starDataArray;
  };

  this.dimStarMapPass = function(rImg, gImg, bImg, aImg){
    return bakeStarTier(DIM_STAR_LAYER, DIM_STAR_WIDTH, DIM_STAR_HEIGHT, rImg, gImg, bImg, aImg);
  };

  this.medStarMapPass = function(rImg, gImg, bImg, aImg){
    return bakeStarTier(MED_STAR_LAYER, MED_STAR_WIDTH, MED_STAR_HEIGHT, rImg, gImg, bImg, aImg);
  };

  this.brightStarMapPass = function(rImg, gImg, bImg, aImg){
    return bakeStarTier(BRIGHT_STAR_LAYER, BRIGHT_STAR_WIDTH, BRIGHT_STAR_HEIGHT, rImg, gImg, bImg, aImg);
  };
};
