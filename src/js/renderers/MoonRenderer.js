StarrySky.Renderers.MoonRenderer = function(skyDirector){
  this.parallacticAxis = new THREE.Vector3();
  const renderer = skyDirector.renderer;
	const assetManager = skyDirector.assetManager;
	const atmosphereLUTLibrary = skyDirector.atmosphereLUTLibrary;
	const skyState = skyDirector.skyState;
  const RENDER_TARGET_SIZE = 512;
  const RADIUS_OF_SKY = 5000.0;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const sunAngularRadiusInRadians = assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;
  this.moonAngularRadiusInRadians = assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5;
  const radiusOfMoonPlane = RADIUS_OF_SKY * Math.sin(this.moonAngularRadiusInRadians) * 2.0;
  const diameterOfMoonPlane = 4.0 * radiusOfMoonPlane;
  const blinkOutDistance = Math.SQRT2 * diameterOfMoonPlane;

  //All of this eventually gets drawn out to a single quad
  this.geometry = new THREE.PlaneBufferGeometry(diameterOfMoonPlane, diameterOfMoonPlane, 1);

  //Prepare our scene and render target object
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  outputRenderTarget = new THREE.WebGLRenderTarget(RENDER_TARGET_SIZE, RENDER_TARGET_SIZE);
  outputRenderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
  outputRenderTarget.texture.magFilter = THREE.LinearFilter;
  outputRenderTarget.texture.format = THREE.RGBAFormat;
  outputRenderTarget.texture.type = THREE.FloatType;
  outputRenderTarget.texture.generateMipmaps = true;
  outputRenderTarget.texture.anisotropy = 4;
  outputRenderTarget.texture.samples = 8;
  const composer = new THREE.EffectComposer(renderer, outputRenderTarget);
  composer.renderToScreen = false;

  const auroraParameters = assetManager.data.skyAurora;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  const moonMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(
      false,
      true,
      false,
      assetManager.data.skyAurora.auroraEnabled,
      assetManager.data.skyCloud.cloudsEnabled
    ))),
    vertexShader: StarrySky.Materials.Moon.baseMoonPartial.vertexShader,
    fragmentShader: StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      atmosphericParameters.mieDirectionalG,
      atmosphereLUTLibrary.scatteringTextureWidth,
      atmosphereLUTLibrary.scatteringTextureHeight,
      atmosphereLUTLibrary.scatteringTexturePackingWidth,
      atmosphereLUTLibrary.scatteringTexturePackingHeight,
      atmosphereLUTLibrary.atmosphereFunctionsString,
      false, //Sun Code
      StarrySky.Materials.Moon.baseMoonPartial.fragmentShader(this.moonAngularRadiusInRadians),
      false, //Metering Code
      assetManager.data.skyAurora.auroraEnabled, //aurora enabled
      assetManager.data.skyCloud.cloudsEnabled  //clouds enabled
    )
  });
  if(assetManager.data.skyCloud.cloudsEnabled){
    moonMaterial.uniforms.cloudLUTs.value = skyDirector.cloudLUTLibrary.repeating3DCloudNoiseTextures;
  }
  if(assetManager.data.skyAurora.auroraEnabled){
    moonMaterial.uniforms.nitrogenColor.value = new THREE.Vector3(
      auroraParameters.nitrogenColor.red / 255.0,
      auroraParameters.nitrogenColor.green / 255.0,
      auroraParameters.nitrogenColor.blue / 255.0,
    );
    moonMaterial.uniforms.nitrogenCutOff.value = auroraParameters.nitrogenCutOff;
    moonMaterial.uniforms.nitrogenIntensity.value = auroraParameters.nitrogenIntensity;

    moonMaterial.uniforms.molecularOxygenColor.value = new THREE.Vector3(
      auroraParameters.molecularOxygenColor.red / 255.0,
      auroraParameters.molecularOxygenColor.green / 255.0,
      auroraParameters.molecularOxygenColor.blue / 255.0,
    );
    moonMaterial.uniforms.molecularOxygenCutOff.value = auroraParameters.molecularOxygenCutOff;
    moonMaterial.uniforms.molecularOxygenIntensity.value = auroraParameters.molecularOxygenIntensity;

    moonMaterial.uniforms.atomicOxygenColor.value = new THREE.Vector3(
      auroraParameters.atomicOxygenColor.red / 255.0,
      auroraParameters.atomicOxygenColor.green / 255.0,
      auroraParameters.atomicOxygenColor.blue / 255.0,
    );
    moonMaterial.uniforms.atomicOxygenCutOff.value = auroraParameters.atomicOxygenCutOff;
    moonMaterial.uniforms.atomicOxygenIntensity.value = auroraParameters.atomicOxygenIntensity;

    //Number of raymarching steps
    moonMaterial.uniforms.numberOfAuroraRaymarchingSteps.value = auroraParameters.raymarchSteps;
    moonMaterial.uniforms.auroraCutoffDistance.value = auroraParameters.cutoffDistance;
  }

  //Attach the material to our geometry
  moonMaterial.uniforms.radiusOfMoonPlane.value = radiusOfMoonPlane;
  moonMaterial.uniforms.rayleighInscatteringSum.value = atmosphereLUTLibrary.rayleighScatteringSum;
  moonMaterial.uniforms.mieInscatteringSum.value = atmosphereLUTLibrary.mieScatteringSum;
  moonMaterial.uniforms.transmittance.value = atmosphereLUTLibrary.transmittance;
  moonMaterial.uniforms.sunRadius.value = sunAngularRadiusInRadians;
  moonMaterial.uniforms.cameraPosition.value = new THREE.Vector3();
  moonMaterial.defines.resolution = 'vec2( ' + RENDER_TARGET_SIZE + ', ' + RENDER_TARGET_SIZE + " )";
  const renderTargetGeometry = new THREE.PlaneBufferGeometry(2, 2);
  THREE.BufferGeometryUtils.computeTangents(renderTargetGeometry);
  const renderBufferMesh = new THREE.Mesh(
    renderTargetGeometry,
    moonMaterial
  );
  scene.add(renderBufferMesh);

  //If our images have finished loading, update our uniforms
  if(assetManager.hasLoadedImages){
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap', 'moonApertureSizeMap', 'moonApertureOrientationMap'];
    for(let i = 0; i < moonTextures.length; ++i){
      const moonTextureProperty = moonTextures[i];
      moonMaterial.uniforms[moonTextureProperty].value = assetManager.images[moonTextureProperty];
    }

    moonMaterial.uniforms.starColorMap.value = assetManager.images.starImages.starColorMap;
  }

  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  const moonBloomDataRef = assetManager.data.skyLighting.moonBloom;
  if(moonBloomDataRef.bloomEnabled){
    this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(RENDER_TARGET_SIZE, RENDER_TARGET_SIZE), 1.5, 0.4, 0.85);
    this.bloomPass.exposure = moonBloomDataRef.exposure;
    this.bloomPass.threshold = moonBloomDataRef.threshold;
    this.bloomPass.strength = moonBloomDataRef.strength;
    this.bloomPass.radius = moonBloomDataRef.radius;
    composer.addPass(this.bloomPass);
  }

  //Attach the material to our geometry
	const outputMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Postprocessing.moonAndSunOutput.uniforms)),
    vertexShader: StarrySky.Materials.Postprocessing.moonAndSunOutput.vertexShader,
    fragmentShader: StarrySky.Materials.Postprocessing.moonAndSunOutput.fragmentShader
  });
	outputMaterial.defines.resolution = 'vec2( ' + RENDER_TARGET_SIZE + ', ' + RENDER_TARGET_SIZE + " )";
  this.moonMesh = new THREE.Mesh(this.geometry, outputMaterial);
  outputMaterial.castShadow = false;
  outputMaterial.fog = false;
	outputMaterial.side = THREE.FrontSide;
	outputMaterial.dithering = false;
	outputMaterial.toneMapped = false;
	outputMaterial.transparent = true;
	moonMaterial.uniforms.worldMatrix.value = this.moonMesh.matrixWorld;

  const self = this;
  let assetsNotReadyYet = true;
  this.tick = function(t){
    if(assetsNotReadyYet){
      this.firstTick(t);
      return true;
    }

    //Using guidance from https://github.com/mrdoob/three.js/issues/18746#issuecomment-591441598
    const initialRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    renderer.xr.enabled = false;
    renderer.shadowMap.autoUpdate = false;

    const distanceFromSunToMoon = skyState.sun.position.distanceTo(skyState.moon.position) * RADIUS_OF_SKY;
    if(distanceFromSunToMoon < blinkOutDistance && self.moonMesh.visible){
      self.moonMesh.visible = false;
    }
    else if(distanceFromSunToMoon >= blinkOutDistance && !self.moonMesh.visible){
      self.moonMesh.visible = true;
    }

    //Update the position of our mesh
    const cameraPosition = skyDirector.globalCameraPosition;
    const quadOffset = skyState.moon.quadOffset;
    moonMaterial.uniforms.cameraPosition.value.copy(cameraPosition);
    self.moonMesh.position.set(quadOffset.x, quadOffset.y, quadOffset.z).add(cameraPosition);
    self.parallacticAxis.copy(quadOffset).normalize();
    self.moonMesh.lookAt(cameraPosition); //Use the basic look-at function to always have this plane face the camera.
    self.moonMesh.rotateOnWorldAxis(self.parallacticAxis, -skyState.moon.parallacticAngle); //And rotate the mesh by the parallactic angle.
    self.moonMesh.updateMatrix();
    self.moonMesh.updateMatrixWorld(1);

    //Update our shader material
    moonMaterial.uniforms.moonHorizonFade.value = skyState.moon.horizonFade;
    moonMaterial.uniforms.sunHorizonFade.value = skyState.sun.horizonFade;
    moonMaterial.uniforms.uTime.value = t;
    moonMaterial.uniforms.localSiderealTime.value = skyDirector.skyState.LSRT;
    moonMaterial.uniforms.scatteringSunIntensity.value = skyState.sun.intensity * atmosphericParameters.solarIntensity / 1367.0;
    moonMaterial.uniforms.scatteringMoonIntensity.value = skyState.moon.intensity * atmosphericParameters.lunarMaxIntensity / 29.0;
    moonMaterial.uniforms.starsExposure.value = skyDirector.exposureVariables.starsExposure;
    moonMaterial.uniforms.moonExposure.value = skyDirector.exposureVariables.moonExposure;
    moonMaterial.uniforms.distanceToEarthsShadowSquared.value = skyState.moon.distanceToEarthsShadowSquared;
    moonMaterial.uniforms.oneOverNormalizedLunarDiameter.value = skyState.moon.oneOverNormalizedLunarDiameter;
    const blueNoiseTextureRef = assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];
    moonMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;

    const lightingManager = skyDirector.lightingManager;
    if(assetManager.data.skyCloud.cloudsEnabled){
      moonMaterial.uniforms.cloudTime.value = assetManager.data.skyCloud.startSeed + t;
      if(assetManager && assetManager.data.skyCloud.cloudsEnabled && lightingManager){
        moonMaterial.uniforms.ambientLightPY.value = lightingManager.yAxisHemisphericalLight.color.clone().multiplyScalar(lightingManager.xAxisHemisphericalLight.intensity);
      }
    }

    //Update our bloom threshold so we don't bloom the moon during the day
    if(moonBloomDataRef.bloomEnabled){
      this.bloomPass.threshold = 1.0 - 0.43 * Math.max(skyDirector.exposureVariables.starsExposure, 0.0) / 3.4;
    }

    //Run our float shaders shaders
    composer.render();
    outputMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
    outputMaterial.uniforms.outputImage.value = composer.readBuffer.texture;
    outputMaterial.uniforms.uTime.value = t;

    //Clean up shadows and XR stuff
    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.setRenderTarget(initialRenderTarget);
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    //Connect up our reference values
    moonMaterial.uniforms.sunPosition.value = skyState.sun.position;
    moonMaterial.uniforms.moonPosition.value = skyState.moon.position;
    moonMaterial.uniforms.sunLightDirection.value = skyState.sun.quadOffset;

    moonMaterial.uniforms.mercuryPosition.value = skyState.mercury.position;
    moonMaterial.uniforms.venusPosition.value = skyState.venus.position;
    moonMaterial.uniforms.marsPosition.value = skyState.mars.position;
    moonMaterial.uniforms.jupiterPosition.value = skyState.jupiter.position;
    moonMaterial.uniforms.saturnPosition.value = skyState.saturn.position;

    moonMaterial.uniforms.mercuryBrightness.value = skyState.mercury.intensity;
    moonMaterial.uniforms.venusBrightness.value = skyState.venus.intensity;
    moonMaterial.uniforms.marsBrightness.value = skyState.mars.intensity;
    moonMaterial.uniforms.jupiterBrightness.value = skyState.jupiter.intensity;
    moonMaterial.uniforms.saturnBrightness.value = skyState.saturn.intensity;
    moonMaterial.uniforms.earthsShadowPosition.value = skyState.moon.earthsShadowPosition;
    moonMaterial.uniforms.moonLightColor.value = skyState.moon.lightingModifier;

    //Connect up our images if they don't exist yet
    if(assetManager){
      //Moon Textures
      for(let [property, value] of Object.entries(assetManager.images.moonImages)){
        moonMaterial.uniforms[property].value = value;
      }

      //Update our star data
      moonMaterial.uniforms.latitude.value = assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
      moonMaterial.uniforms.starHashCubemap.value = assetManager.images.starImages.starHashCubemap;
      moonMaterial.uniforms.dimStarData.value = skyDirector.stellarLUTLibrary.dimStarDataMap;
      moonMaterial.uniforms.medStarData.value = skyDirector.stellarLUTLibrary.medStarDataMap;
      moonMaterial.uniforms.brightStarData.value = skyDirector.stellarLUTLibrary.brightStarDataMap;

      //Update sky parameters
      moonMaterial.uniforms.cameraHeight.value = assetManager.data.skyAtmosphericParameters.cameraHeight;

      if(assetManager.data.skyAurora.auroraEnabled){
        moonMaterial.uniforms.auroraSampler.value =  assetManager.images.auroraImages[0];
      }

      if(assetManager.data.skyCloud.cloudsEnabled){
        const cloudParams = assetManager.data.skyCloud;

        moonMaterial.uniforms.cloudCoverage.value = cloudParams.coverage;
        moonMaterial.uniforms.cloudVelocity.value = cloudParams.velocity;
        moonMaterial.uniforms.cloudStartHeight.value = cloudParams.startHeight;
        moonMaterial.uniforms.cloudEndHeight.value = cloudParams.endHeight;
        moonMaterial.uniforms.numberOfCloudMarchSteps.value = (cloudParams.numberOfRayMarchSteps + 0.0);
        moonMaterial.uniforms.cloudFadeOutStartPercent.value = cloudParams.fadeOutStartPercent;
        moonMaterial.uniforms.cloudFadeInEndPercent.value = cloudParams.fadeInEndPercentTags;
        moonMaterial.uniforms.cloudCutoffDistance.value = cloudParams.cutoffDistance;
      }
      assetsNotReadyYet = false;

      //Proceed with the first tick
      self.tick(t);

      //Add this object to the scene
      skyDirector.scene.add(self.moonMesh);

      //Delete this method when done
			delete this.firstTick;
    }
  }
}
