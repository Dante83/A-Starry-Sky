StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
  //
  //TODO: Replace the sky dome with a plane
  //
  this.skyDirector = skyDirector;
  this.geometry = new THREE.OctahedronGeometry(5000.0, 5);

  //Create our material late
  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms)),
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
  this.atmosphereMaterial.uniforms.solarRayleighInscatteringSum.value = lutLibrary.rayleighScatteringSum;
  this.atmosphereMaterial.uniforms.solarRayleighInscatteringSum.needsUpdate = true;
  this.atmosphereMaterial.uniforms.solarMieInscatteringSum.value = lutLibrary.mieScatteringSum;
  this.atmosphereMaterial.uniforms.solarMieInscatteringSum.needsUpdate = true;

  //Populate all of uniform values

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(this.geometry, this.atmosphereMaterial);

  //Initialize the position of the sky at the location of the camera
  this.skyMesh.position.set(0.0, 0.0, 0.0);

  let self = this;
  this.tick = function(){
    //Update the uniforms so that we can see where we are on this sky.
    self.atmosphereMaterial.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.atmosphereMaterial.uniforms.sunHorizonFade.needsUpdate = true;
    self.atmosphereMaterial.uniforms.toneMappingExposure.value = 0.8;
    self.atmosphereMaterial.uniforms.toneMappingExposure.needsUpdate = true;
    self.atmosphereMaterial.uniforms.sunPosition.needsUpdate = true;
  }

  //Upon completion, this method self destructs
  this.firstTick = function(){
    //Connect up our reference values
    self.atmosphereMaterial.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;

    //Proceed with the first tick
    self.tick();

    //Add this object to the scene
    self.skyDirector.scene.add(this.skyMesh);
  }
}
