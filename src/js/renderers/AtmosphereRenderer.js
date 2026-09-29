StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  this.geometry = new THREE.IcosahedronGeometry(5000.0, 4);

  //Create our material late
  const assetManager = skyDirector.assetManager;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  const skyState = skyDirector.skyState;
  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(
      false, //sun pass
      false, //moon pass
      false, //metering pass
      assetManager.data.skyAurora.auroraEnabled,  //aurora enabled
      assetManager.data.skyCloud.cloudsEnabled,  //clouds enabled
      assetManager.data.skyMilkyWay.milkyWayEnabled,  //milky way enabled
      assetManager.data.skyHalos.halosEnabled  //halos enabled
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
      assetManager.data.skyCloud.cloudsEnabled,  //clouds enabled
      assetManager.data.skyMilkyWay.milkyWayEnabled,  //milky way enabled
      assetManager.data.skyHalos.halosEnabled ? assetManager.data.skyHalos.atlas : false  //halo atlas layout
    )
  });
  this.atmosphereMaterial.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.atmosphereMaterial.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.atmosphereMaterial.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;

  //The uniforms went through a JSON clone above, which leaves a plain {x, y, z} where a
  //Vector3 was, so give the halo gains back real vectors to write into every frame.
  if(assetManager.data.skyHalos.halosEnabled){
    this.atmosphereMaterial.uniforms.sunHaloGains.value = new THREE.Vector3();
    this.atmosphereMaterial.uniforms.moonHaloGains.value = new THREE.Vector3();
  }

  if(assetManager.data.skyMilkyWay.milkyWayEnabled){
    this.atmosphereMaterial.uniforms.milkyWayIntensity.value = assetManager.data.skyMilkyWay.milkyWayIntensity;
  }

  if(assetManager.hasLoadedImages){
    this.atmosphereMaterial.uniforms.starColorMap.value = assetManager.images.starImages.starColorMap;

    if(assetManager.data.skyMilkyWay.milkyWayEnabled){
      this.atmosphereMaterial.uniforms.milkyWayEmissionMap.value = assetManager.images.milkyWayImages.milkyWayEmissionMap;
      this.atmosphereMaterial.uniforms.milkyWayAbsorptionMap.value = assetManager.images.milkyWayImages.milkyWayAbsorptionMap;
    }
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
    // The Schneegans Eclipse-Shadow LuT is physically calibrated: at full
    // moon the LuT returns ~(1, 1, 1), in deep umbra it returns ~(0.001, 0, 0)
    // -- already 1000x dimmer matching real lunar-eclipse photometry. So
    // moonLightColor (= the integrated LuT sample) carries the brightness
    // modulation on its own; no extra magnitude attenuation needed here.
    uniforms.scatteringMoonIntensity.value = skyState.moon.intensity * atmosphericParameters.lunarMaxIntensity / 29.0;
    uniforms.blueNoiseTexture.value = assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];

    //The halo tags can be changed while the sky runs, so the gains are rebuilt every frame.
    //The ice cloud amount scales every halo: no ice in the sky, nothing to turn the light.
    const haloData = assetManager.data.skyHalos;
    if(haloData.halosEnabled){
      const haloScale = haloData.radianceScale * haloData.intensity * haloData.iceCloud;
      uniforms.sunHaloGains.value.set(haloData.randomCrystals, haloData.plateCrystals, haloData.columnCrystals).multiplyScalar(haloScale * haloData.sunIntensity);
      uniforms.moonHaloGains.value.set(haloData.moonRandomCrystals, haloData.moonPlateCrystals, haloData.moonColumnCrystals).multiplyScalar(haloScale * haloData.moonIntensity);

      //The sun and moon quads re-render the sky, so they draw the halos too, or they would
      //paint a halo-less patch over the one behind them. They share this frame's values.
      const quadMaterials = [skyDirector.renderers.sunRenderer?.baseSunMaterial, skyDirector.renderers.moonRenderer?.moonMaterial];
      for(let i = 0; i < quadMaterials.length; ++i){
        const quadUniforms = quadMaterials[i]?.uniforms;
        if(quadUniforms?.haloMaps !== undefined){
          quadUniforms.haloMaps.value = uniforms.haloMaps.value;
          quadUniforms.sunHaloGains.value = uniforms.sunHaloGains.value;
          quadUniforms.moonHaloGains.value = uniforms.moonHaloGains.value;
        }
      }
    }

    //CloudRenderer and AuroraRenderer tick first and ping-pong their targets, so
    //take this frame's maps.
    if(assetManager.data.skyCloud.cloudsEnabled){
      uniforms.cloudMap.value = skyDirector.renderers.cloudRenderer.cloudMap;
    }
    if(assetManager.data.skyAurora.auroraEnabled){
      uniforms.auroraMap.value = skyDirector.renderers.auroraRenderer.auroraMap;
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

    //Connect up our images once they have all finished loading
    if(assetManager.hasLoadedImages){
      uniforms.starHashCubemap.value = assetManager.images.starImages.starHashCubemap;
      uniforms.starData.value = skyDirector.stellarLUTLibrary.starDataArray;
      if(assetManager.data.skyHalos.halosEnabled){
        uniforms.haloMaps.value = assetManager.images.haloImages.haloMaps;
      }
      uniforms.latitude.value = assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
      uniforms.cameraHeight.value = assetManager.data.skyAtmosphericParameters.cameraHeight;

      assetsNotReadyYet = false;

      //Proceed with the first tick
      self.tick(t);

      skyDirector.scene.add(self.skyMesh);

      //Delete this method when done
			delete this.firstTick;
    }
  }
}
