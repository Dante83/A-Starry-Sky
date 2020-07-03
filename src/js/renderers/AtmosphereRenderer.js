StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
  //
  //TODO: Replace the sky dome with a plane
  //
  this.skyDirector = skyDirector;
  this.geometry = new THREE.OctahedronBufferGeometry(5000.0, 5);

  //Create our material late
  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms())),
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    transparent: false,
    lights: false,
    flatShading: true,
    clipping: true,
    vertexShader: StarrySky.Materials.Atmosphere.atmosphereShader.vertexShader,
    fragmentShader: StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      skyDirector.assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString
    )
  });
  this.atmosphereMaterial.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.atmosphereMaterial.uniforms.rayleighInscatteringSum.needsUpdate = true;
  this.atmosphereMaterial.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.atmosphereMaterial.uniforms.mieInscatteringSum.needsUpdate = true;

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(this.geometry, this.atmosphereMaterial);

  let self = this;
  this.tick = function(){
    let cameraPosition = self.skyDirector.camera.position;
    self.skyMesh.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    self.skyMesh.updateMatrix();
    self.skyMesh.updateMatrixWorld();

    //Update the uniforms so that we can see where we are on this sky.
    self.atmosphereMaterial.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.atmosphereMaterial.uniforms.sunHorizonFade.needsUpdate = true;
    self.atmosphereMaterial.uniforms.moonHorizonFade.value = self.skyDirector.skyState.moon.horizonFade;
    self.atmosphereMaterial.uniforms.moonHorizonFade.needsUpdate = true;
    self.atmosphereMaterial.uniforms.toneMappingExposure.value = 1.0;
    self.atmosphereMaterial.uniforms.toneMappingExposure.needsUpdate = true;
    self.atmosphereMaterial.uniforms.sunPosition.needsUpdate = true;
    self.atmosphereMaterial.uniforms.moonPosition.needsUpdate = true;
  }

  //Upon completion, this method self destructs
  this.firstTick = function(){
    //Connect up our reference values
    self.atmosphereMaterial.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;
    self.atmosphereMaterial.uniforms.moonPosition.value = self.skyDirector.skyState.moon.position;

    //Connect up our images if they don't exist yet
    if(self.skyDirector.assetManager){
      //Update our star data
      self.atmosphereMaterial.uniforms.starHashCubemap = self.skyDirector.assetManager.images.starImages.starHashCubemap;
      self.atmosphereMaterial.uniforms.starHashCubemap.needsUpdate = true;
      self.atmosphereMaterial.uniforms.dimStarData = self.skyDirector.assetManager.images.starImages.dimStarData;
      self.atmosphereMaterial.uniforms.dimStarData.needsUpdate = true;
      self.atmosphereMaterial.uniforms.brightStarData = self.skyDirector.assetManager.images.starImages.brightStarData;
      self.atmosphereMaterial.uniforms.brightStarData.needsUpdate = true;
    }

    //Proceed with the first tick
    self.tick();

    //Add this object to the scene
    self.skyDirector.scene.add(self.skyMesh);
  }
}
