StarrySky.LUTlibraries.StellarLUTLibrary = function(data, renderer, scene){
  this.renderer = renderer;
  this.dimStarDataMap;
  this.brightStarDataMap;
  this.noiseMap;

  //Enable the OES_texture_float_linear extension
  if(!renderer.extensions.get("OES_texture_float_linear")){
    console.error("No linear interpolation of OES textures allowed.");
    return false;
  }

  //Enable 32 bit float textures
  if(!renderer.extensions.get("WEBGL_color_buffer_float")){
    console.error("No float WEBGL color buffers allowed.");
    return false;
  }

  document.body.appendChild(renderer.domElement);

  this.starMapPass = function(width, height, rImg, gImg, bImg, aImg, target){
    let renderer = new THREE.StarrySkyComputationRenderer(width, height, this.renderer);
    let materials = StarrySky.Materials.Stars;
    let starMapTexture = renderer.createTexture();
    let starMapVar = renderer.addVariable(`starMapTexture-${target}`,
      materials.starDataMap.fragmentShader,
      starMapTexture
    );
    renderer.setVariableDependencies(starMapVar, []);
    starMapVar.material.uniforms = JSON.parse(JSON.stringify(materials.starDataMap.uniforms));
    starMapVar.material.uniforms.textureRChannel = rImg;
    starMapVar.material.uniforms.textureGChannel = gImg;
    starMapVar.material.uniforms.textureBChannel = bImg;
    starMapVar.material.uniforms.textureAChannel = aImg;
    starMapVar.minFilter = THREE.NearestFilter;
    starMapVar.magFilter = THREE.NearestFilter;
    starMapVar.wrapS = THREE.ClampToEdgeWrapping;
    starMapVar.wrapT = THREE.ClampToEdgeWrapping;

    //Check for any errors in initialization
    let error1 = renderer.init();
    if(error1 !== null){
      console.error(`Star map Renderer: ${error1}`);
    }

    renderer.compute();
    return renderer.getCurrentRenderTarget(starMapVar).texture;
  };
};
