StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  this.geometry = new THREE.IcosahedronBufferGeometry(5000.0, 4);

  //Create our material late
  const assetManager = skyDirector.assetManager;
  const auroraParameters = assetManager.data.skyAuroraParameters;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(
      false, //sun pass
      false, //moon pass
      false, //metering pass
      assetManager.data.skyAuroraParameters.auroraEnabled  //aurora enabled
    ))),
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    transparent: false,
    vertexShader: StarrySky.Materials.Atmosphere.atmosphereShader.vertexShader,
    fragmentShader: StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      atmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString,
      false, //sun pass
      false, //moon pass
      false, //metering pass
      assetManager.data.skyAuroraParameters.auroraEnabled  //aurora enabled
    )
  });
  this.atmosphereMaterial.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.atmosphereMaterial.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.atmosphereMaterial.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  if(assetManager.data.skyAuroraParameters.auroraEnabled){
    this.atmosphereMaterial.uniforms.nitrogenColor.value = new THREE.Vector3(
      auroraParameters.nitrogenColor.red / 255.0,
      auroraParameters.nitrogenColor.green / 255.0,
      auroraParameters.nitrogenColor.blue / 255.0,
    );
    this.atmosphereMaterial.uniforms.nitrogenCutOff.value = auroraParameters.nitrogenCutOff;
    this.atmosphereMaterial.uniforms.nitrogenIntensity.value = auroraParameters.nitrogenIntensity;

    this.atmosphereMaterial.uniforms.molecularOxygenColor.value = new THREE.Vector3(
      auroraParameters.molecularOxygenColor.red / 255.0,
      auroraParameters.molecularOxygenColor.green / 255.0,
      auroraParameters.molecularOxygenColor.blue / 255.0,
    );
    console.log(auroraParameters.molecularOxygenCutOff);
    console.log(auroraParameters.molecularOxygenIntensity);
    this.atmosphereMaterial.uniforms.molecularOxygenCutOff.value = auroraParameters.molecularOxygenCutOff;
    this.atmosphereMaterial.uniforms.molecularOxygenIntensity.value = auroraParameters.molecularOxygenIntensity;

    this.atmosphereMaterial.uniforms.atomicOxygenColor.value = new THREE.Vector3(
      auroraParameters.atomicOxygenColor.red / 255.0,
      auroraParameters.atomicOxygenColor.green / 255.0,
      auroraParameters.atomicOxygenColor.blue / 255.0,
    );
    this.atmosphereMaterial.uniforms.atomicOxygenCutOff.value = auroraParameters.atomicOxygenCutOff;
    this.atmosphereMaterial.uniforms.atomicOxygenIntensity.value = auroraParameters.atomicOxygenIntensity;

    //Number of raymarching steps
    this.atmosphereMaterial.uniforms.numberOfAuroraRaymarchingSteps.value = auroraParameters.raymarchSteps;
  }

  if(this.skyDirector.assetManager.hasLoadedImages){
    this.atmosphereMaterial.uniforms.starColorMap.value = this.skyDirector.assetManager.images.starImages.starColorMap;
  }

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(this.geometry, this.atmosphereMaterial);
  this.skyMesh.castShadow = false;
  this.skyMesh.receiveShadow = false;
  this.skyMesh.fog = false;

  let self = this;
  this.tick = function(t){
    let cameraPosition = self.skyDirector.camera.position;
    self.skyMesh.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    self.skyMesh.updateMatrix();
    self.skyMesh.updateMatrixWorld();

    //Update the uniforms so that we can see where we are on this sky.
    self.atmosphereMaterial.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.atmosphereMaterial.uniforms.moonHorizonFade.value = self.skyDirector.skyState.moon.horizonFade;
    self.atmosphereMaterial.uniforms.uTime.value = t;
    self.atmosphereMaterial.uniforms.localSiderealTime.value = self.skyDirector.skyState.LSRT;
    self.atmosphereMaterial.uniforms.starsExposure.value = self.skyDirector.exposureVariables.starsExposure;
    self.atmosphereMaterial.uniforms.scatteringSunIntensity.value = self.skyDirector.skyState.sun.intensity;
    self.atmosphereMaterial.uniforms.scatteringMoonIntensity.value = self.skyDirector.skyState.moon.intensity;

    const blueNoiseTextureRef = self.skyDirector.assetManager.images.blueNoiseImages[self.skyDirector.randomBlueNoiseTexture];
    self.atmosphereMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    //Connect up our reference values
    self.atmosphereMaterial.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;
    self.atmosphereMaterial.uniforms.moonPosition.value = self.skyDirector.skyState.moon.position;
    self.atmosphereMaterial.uniforms.latitude.value = self.skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);

    self.atmosphereMaterial.uniforms.mercuryPosition.value = self.skyDirector.skyState.mercury.position;
    self.atmosphereMaterial.uniforms.venusPosition.value = self.skyDirector.skyState.venus.position;
    self.atmosphereMaterial.uniforms.marsPosition.value = self.skyDirector.skyState.mars.position;
    self.atmosphereMaterial.uniforms.jupiterPosition.value = self.skyDirector.skyState.jupiter.position;
    self.atmosphereMaterial.uniforms.saturnPosition.value = self.skyDirector.skyState.saturn.position;

    self.atmosphereMaterial.uniforms.mercuryBrightness.value = self.skyDirector.skyState.mercury.intensity;
    self.atmosphereMaterial.uniforms.venusBrightness.value = self.skyDirector.skyState.venus.intensity;
    self.atmosphereMaterial.uniforms.marsBrightness.value = self.skyDirector.skyState.mars.intensity;
    self.atmosphereMaterial.uniforms.jupiterBrightness.value = self.skyDirector.skyState.jupiter.intensity;
    self.atmosphereMaterial.uniforms.saturnBrightness.value = self.skyDirector.skyState.saturn.intensity;
    self.atmosphereMaterial.uniforms.moonLightColor.value = self.skyDirector.skyState.moon.lightingModifier;

    //Connect up our images if they don't exist yet
    if(self.skyDirector.assetManager){
      self.atmosphereMaterial.uniforms.starHashCubemap.value = self.skyDirector.assetManager.images.starImages.starHashCubemap;
      self.atmosphereMaterial.uniforms.dimStarData.value = self.skyDirector.stellarLUTLibrary.dimStarDataMap;
      self.atmosphereMaterial.uniforms.medStarData.value = self.skyDirector.stellarLUTLibrary.medStarDataMap;
      self.atmosphereMaterial.uniforms.brightStarData.value = self.skyDirector.stellarLUTLibrary.brightStarDataMap;
      if(self.skyDirector.assetManager.data.skyAuroraParameters.auroraEnabled){
        self.atmosphereMaterial.uniforms.auroraSampler1.value =  self.skyDirector.assetManager.images.auroraImages[0];
        self.atmosphereMaterial.uniforms.auroraSampler2.value =  self.skyDirector.assetManager.images.auroraImages[1];
      }
    }

    //Proceed with the first tick
    self.tick(t);

    //Add this object to the scene
    self.skyDirector.scene.add(self.skyMesh);
  }
}
