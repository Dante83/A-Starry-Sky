StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
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
  this.atmosphereMaterial.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  this.atmosphereMaterial.uniforms.transmittance.needsUpdate = true;

  if(this.skyDirector.assetManager.hasLoadedImages){
    this.atmosphereMaterial.uniforms.starColorMap.value = this.skyDirector.assetManager.images.starImages.starColorMap;
  }

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(this.geometry, this.atmosphereMaterial);

  let self = this;
  this.tick = function(t){
    let cameraPosition = self.skyDirector.camera.position;
    self.skyMesh.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    self.skyMesh.updateMatrix();
    self.skyMesh.updateMatrixWorld();

    //Update the uniforms so that we can see where we are on this sky.
    self.atmosphereMaterial.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.atmosphereMaterial.uniforms.sunHorizonFade.needsUpdate = true;
    self.atmosphereMaterial.uniforms.moonHorizonFade.value = self.skyDirector.skyState.moon.horizonFade;
    self.atmosphereMaterial.uniforms.moonHorizonFade.needsUpdate = true;
    self.atmosphereMaterial.uniforms.sunPosition.needsUpdate = true;
    self.atmosphereMaterial.uniforms.moonPosition.needsUpdate = true;
    self.atmosphereMaterial.uniforms.uTime.value = t;
    self.atmosphereMaterial.uniforms.localSiderealTime.value = self.skyDirector.skyState.LSRT;
    self.atmosphereMaterial.uniforms.starsExposure.value = self.skyDirector.exposureVariables.starsExposure;
    self.atmosphereMaterial.uniforms.scatteringSunIntensity.value = self.skyDirector.skyState.sun.intensity;
    self.atmosphereMaterial.uniforms.scatteringMoonIntensity.value = self.skyDirector.skyState.moon.intensity;
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    //Connect up our reference values
    self.atmosphereMaterial.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;
    self.atmosphereMaterial.uniforms.moonPosition.value = self.skyDirector.skyState.moon.position;
    self.atmosphereMaterial.uniforms.latitude.value = self.skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);

    self.atmosphereMaterial.uniforms.venusPosition.value = self.skyDirector.skyState.venus.position;
    self.atmosphereMaterial.uniforms.marsPosition.value = self.skyDirector.skyState.mars.position;
    self.atmosphereMaterial.uniforms.jupiterPosition.value = self.skyDirector.skyState.jupiter.position;
    self.atmosphereMaterial.uniforms.saturnPosition.value = self.skyDirector.skyState.saturn.position;

    self.atmosphereMaterial.uniforms.venusBrightness.value = self.skyDirector.skyState.venus.intensity;
    self.atmosphereMaterial.uniforms.marsBrightness.value = self.skyDirector.skyState.mars.intensity;
    self.atmosphereMaterial.uniforms.jupiterBrightness.value = self.skyDirector.skyState.jupiter.intensity;
    self.atmosphereMaterial.uniforms.saturnBrightness.value = self.skyDirector.skyState.saturn.intensity;

    //Connect up our images if they don't exist yet
    if(self.skyDirector.assetManager){
      self.atmosphereMaterial.uniforms.starHashCubemap.value = self.skyDirector.assetManager.images.starImages.starHashCubemap;
      self.atmosphereMaterial.uniforms.dimStarData.value = self.skyDirector.stellarLUTLibrary.dimStarDataMap;
      self.atmosphereMaterial.uniforms.medStarData.value = self.skyDirector.stellarLUTLibrary.medStarDataMap;
      self.atmosphereMaterial.uniforms.brightStarData.value = self.skyDirector.stellarLUTLibrary.brightStarDataMap;
    }

    //Proceed with the first tick
    self.tick(t);

    //Add this object to the scene
    self.skyDirector.scene.add(self.skyMesh);
  }
}
