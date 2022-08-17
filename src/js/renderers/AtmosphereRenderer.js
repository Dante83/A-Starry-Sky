StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  this.geometry = new THREE.IcosahedronBufferGeometry(5000.0, 4);

  //Create our material late
  const assetManager = skyDirector.assetManager;
  const auroraParameters = assetManager.data.skyAurora;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  const skyState = skyDirector.skyState;
  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(
      false, //sun pass
      false, //moon pass
      false, //metering pass
      assetManager.data.skyAurora.auroraEnabled,  //aurora enabled
      assetManager.data.skyCloud.cloudsEnabled  //clouds enabled
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
      assetManager.data.skyAurora.auroraEnabled,  //aurora enabled
      assetManager.data.skyCloud.cloudsEnabled  //clouds enabled
    )
  });
  this.atmosphereMaterial.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.atmosphereMaterial.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.atmosphereMaterial.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  if(assetManager.data.skyCloud.cloudsEnabled){
    this.atmosphereMaterial.uniforms.cloudLUTs.value = skyDirector.cloudLUTLibrary.repeating3DCloudNoiseTextures;
  }
  if(assetManager.data.skyAurora.auroraEnabled){
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
    this.atmosphereMaterial.uniforms.auroraCutoffDistance.value = auroraParameters.cutoffDistance;
  }

  if(assetManager.hasLoadedImages){
    this.atmosphereMaterial.uniforms.starColorMap.value = assetManager.images.starImages.starColorMap;
  }

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(this.geometry, this.atmosphereMaterial);
  this.skyMesh.castShadow = false;
  this.skyMesh.receiveShadow = false;
  this.skyMesh.fog = false;

  const self = this;
  let assetsNotReadyYet = true;
  this.tick = function(t){
    if(assetsNotReadyYet){
      this.firstTick(t);
      return true;
    }

    const cameraPosition = skyDirector.camera.position;
    const uniforms = self.atmosphereMaterial.uniforms;
    const skyState = skyDirector.skyState;
    const skyMesh = self.skyMesh;
    skyMesh.position.copy(skyDirector.globalCameraPosition);

    //Update the uniforms so that we can see where we are on this sky.
    uniforms.sunHorizonFade.value = skyState.sun.horizonFade;
    uniforms.moonHorizonFade.value = skyState.moon.horizonFade;
    uniforms.uTime.value = t;
    uniforms.localSiderealTime.value = skyState.LSRT;
    uniforms.starsExposure.value = skyDirector.exposureVariables.starsExposure;
    uniforms.scatteringSunIntensity.value = skyState.sun.intensity * atmosphericParameters.solarIntensity / 1367.0;
    uniforms.scatteringMoonIntensity.value = skyState.moon.intensity * atmosphericParameters.lunarMaxIntensity / 29.0;
    uniforms.blueNoiseTexture.value = assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];

    const lightingManager = skyDirector.lightingManager;
    if(assetManager.data.skyCloud.cloudsEnabled){
      uniforms.cloudTime.value = assetManager.data.skyCloud.startSeed + t;
      if(assetManager && assetManager.data.skyCloud.cloudsEnabled && lightingManager){
        uniforms.ambientLightPY.value = lightingManager.yAxisHemisphericalLight.color.clone().multiplyScalar(lightingManager.yAxisHemisphericalLight.intensity);
      }
    }
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    const uniforms = self.atmosphereMaterial.uniforms;

    //Connect up our reference values
    uniforms.sunPosition.value = skyState.sun.position;
    uniforms.moonPosition.value = skyState.moon.position;

    uniforms.mercuryPosition.value = skyState.mercury.position;
    uniforms.venusPosition.value = skyState.venus.position;
    uniforms.marsPosition.value = skyState.mars.position;
    uniforms.jupiterPosition.value = skyState.jupiter.position;
    uniforms.saturnPosition.value = skyState.saturn.position;

    uniforms.mercuryBrightness.value = skyState.mercury.intensity;
    uniforms.venusBrightness.value = skyState.venus.intensity;
    uniforms.marsBrightness.value = skyState.mars.intensity;
    uniforms.jupiterBrightness.value = skyState.jupiter.intensity;
    uniforms.saturnBrightness.value = skyState.saturn.intensity;
    uniforms.moonLightColor.value = skyState.moon.lightingModifier;

    //Connect up our images if they don't exist yet
    if(assetManager){
      uniforms.starHashCubemap.value = assetManager.images.starImages.starHashCubemap;
      uniforms.dimStarData.value = skyDirector.stellarLUTLibrary.dimStarDataMap;
      uniforms.medStarData.value = skyDirector.stellarLUTLibrary.medStarDataMap;
      uniforms.brightStarData.value = skyDirector.stellarLUTLibrary.brightStarDataMap;
      uniforms.latitude.value = assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
      uniforms.cameraHeight.value = assetManager.data.skyAtmosphericParameters.cameraHeight;
      if(assetManager.data.skyAurora.auroraEnabled){
        uniforms.auroraSampler.value =  assetManager.images.auroraImages[0];
      }

      if(assetManager.data.skyCloud.cloudsEnabled){
        const cloudParams = assetManager.data.skyCloud;
        uniforms.cloudCoverage.value = cloudParams.coverage;
        uniforms.cloudVelocity.value = cloudParams.velocity;
        uniforms.cloudStartHeight.value = cloudParams.startHeight;
        uniforms.cloudEndHeight.value = cloudParams.endHeight;
        uniforms.numberOfCloudMarchSteps.value = (cloudParams.numberOfRayMarchSteps + 0.0);
        uniforms.cloudFadeOutStartPercent.value = cloudParams.fadeOutStartPercent;
        uniforms.cloudFadeInEndPercent.value = cloudParams.fadeInEndPercentTags;
        uniforms.cloudCutoffDistance.value = cloudParams.cutoffDistance;
      }
      assetsNotReadyYet = false;

      //Proceed with the first tick
      self.tick(t);

      //Add this object to the scene
      skyDirector.scene.add(self.skyMesh);

      //Delete this method when done
			delete this.firstTick;
    }
  }
}
