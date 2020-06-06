StarrySky.LUTlibraries.StellarLUTLibrary = function(data, renderer, scene){
  this.renderer = renderer;
  this.cubemapTextures = [];

  if(!renderer.extensions.get("WEBGL_color_buffer_float")){
    console.error("No float WEBGL color buffers allowed.");
    return false;
  }

  //Create our first renderer, for transmittance
  let floatCubeMapRenderer = new THREE.StarrySkyComputationRenderer(128, 128, renderer);

  //Set up our texture
  let stellarFloatMapTexture = floatCubeMapRenderer.createTexture();
  let stellarFloatMapVar = floatCubeMapRenderer.addVariable('stellarFloatMapTexture',
    materials.stellarFloatMapGenerator.fragmentShader(),
    stellarFloatMapTexture
  );
  floatCubeMapRenderer.setVariableDependencies(stellarFloatMapVar, []);
  stellarFloatMapVar.material.uniforms = {};
  stellarFloatMapVar.minFilter = THREE.NearestFilter;
  stellarFloatMapVar.magFilter = THREE.NearestFilter;
  stellarFloatMapVar.wrapS = THREE.ClampToEdgeWrapping;
  stellarFloatMapVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error1 = floatCubeMapRenderer.init();
  if(error1 !== null){
    console.error(`Stellar Cubemap Renderer: ${error1}`);
  }

  //Generate each of our cubemaps with this.
  for(let i = 0; i < 4; ++i){
    //Populate each of our textures
    for(let i = 0; i < 6; ++i){



    }
  }

  floatCubeMapRenderer.compute();
  for(let i = 0; i < 4; ++i){

  }
}
