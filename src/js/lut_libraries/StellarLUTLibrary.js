StarrySky.LUTlibraries.StellarLUTLibrary = function(data, renderer, scene){
  this.renderer = renderer;
  this.dimStarDataMap;
  this.medStarDataMap;
  this.brightStarDataMap;
  this.noiseMap;

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

  this.dimStarDataRenderer = new THREE.StarrySkyComputationRenderer(128, 64, renderer);
  this.dimStarMapTexture = this.dimStarDataRenderer.createTexture();
  this.dimStarMapVar = this.dimStarDataRenderer.addVariable('dimStarMapTexture',
    materials.starDataMap.fragmentShader,
    this.dimStarMapTexture
  );
  this.dimStarDataRenderer.setVariableDependencies(this.dimStarMapVar, []);
  this.dimStarMapVar.material.uniforms = JSON.parse(JSON.stringify(materials.starDataMap.uniforms));
  this.dimStarMapVar.format = THREE.RGBAFormat;
  this.dimStarMapVar.encoding = THREE.LinearEncoding;
  this.dimStarMapVar.minFilter = THREE.NearestFilter;
  this.dimStarMapVar.magFilter = THREE.NearestFilter;
  this.dimStarMapVar.wrapS = THREE.ClampToEdgeWrapping;
  this.dimStarMapVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error1 = this.dimStarDataRenderer.init();
  if(error1 !== null){
    console.error(`Star map Renderer: ${error1}`);
  }

  this.medStarDataRenderer = new THREE.StarrySkyComputationRenderer(32, 32, renderer);
  this.medStarMapTexture = this.medStarDataRenderer.createTexture();
  this.medStarMapVar = this.medStarDataRenderer.addVariable('medStarMapTexture',
    materials.starDataMap.fragmentShader,
    this.medStarMapTexture
  );
  this.medStarDataRenderer.setVariableDependencies(this.medStarMapVar, []);
  this.medStarMapVar.material.uniforms = JSON.parse(JSON.stringify(materials.starDataMap.uniforms));
  this.medStarMapVar.format = THREE.RGBAFormat;
  this.medStarMapVar.encoding = THREE.LinearEncoding;
  this.medStarMapVar.minFilter = THREE.NearestFilter;
  this.medStarMapVar.magFilter = THREE.NearestFilter;
  this.medStarMapVar.wrapS = THREE.ClampToEdgeWrapping;
  this.medStarMapVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error2 = this.medStarDataRenderer.init();
  if(error2 !== null){
    console.error(`Star map Renderer: ${error2}`);
  }

  this.brightStarDataRenderer = new THREE.StarrySkyComputationRenderer(8, 8, renderer);
  this.brightStarMapTexture = this.brightStarDataRenderer.createTexture();
  this.brightStarMapVar = this.brightStarDataRenderer.addVariable('brightStarMapTexture',
    materials.starDataMap.fragmentShader,
    this.brightStarMapTexture
  );
  this.brightStarDataRenderer.setVariableDependencies(this.brightStarMapVar, []);
  this.brightStarMapVar.material.uniforms = JSON.parse(JSON.stringify(materials.starDataMap.uniforms));
  this.brightStarMapVar.format = THREE.RGBAFormat;
  this.brightStarMapVar.encoding = THREE.LinearEncoding;
  this.brightStarMapVar.minFilter = THREE.NearestFilter;
  this.brightStarMapVar.magFilter = THREE.NearestFilter;
  this.brightStarMapVar.wrapS = THREE.ClampToEdgeWrapping;
  this.brightStarMapVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error3 = this.brightStarDataRenderer.init();
  if(error3 !== null){
    console.error(`Star map Renderer: ${error3}`);
  }

  let self = this;
  this.dimStarMapPass = function(rImg, gImg, bImg, aImg){
    self.dimStarMapVar.material.uniforms.textureRChannel.value = rImg;
    self.dimStarMapVar.material.uniforms.textureGChannel.value = gImg;
    self.dimStarMapVar.material.uniforms.textureBChannel.value = bImg;
    self.dimStarMapVar.material.uniforms.textureAChannel.value = aImg;

    self.dimStarDataRenderer.compute();
    self.dimStarDataMap = self.dimStarDataRenderer.getCurrentRenderTarget(self.dimStarMapVar).texture;
    return self.dimStarDataMap;
  };

  this.medStarMapPass = function(rImg, gImg, bImg, aImg){
    self.medStarMapVar.material.uniforms.textureRChannel.value = rImg;
    self.medStarMapVar.material.uniforms.textureGChannel.value = gImg;
    self.medStarMapVar.material.uniforms.textureBChannel.value = bImg;
    self.medStarMapVar.material.uniforms.textureAChannel.value = aImg;

    self.medStarDataRenderer.compute();
    self.medStarDataMap = self.medStarDataRenderer.getCurrentRenderTarget(self.medStarMapVar).texture;
    return self.medStarDataMap;
  };

  this.brightStarMapPass = function(rImg, gImg, bImg, aImg){
    self.brightStarMapVar.material.uniforms.textureRChannel.value = rImg;
    self.brightStarMapVar.material.uniforms.textureGChannel.value = gImg;
    self.brightStarMapVar.material.uniforms.textureBChannel.value = bImg;
    self.brightStarMapVar.material.uniforms.textureAChannel.value = aImg;

    self.brightStarDataRenderer.compute();
    self.brightStarDataMap = self.brightStarDataRenderer.getCurrentRenderTarget(self.brightStarMapVar).texture;
    return self.brightStarDataMap;
  };
};
