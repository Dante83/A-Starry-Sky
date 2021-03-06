StarrySky.Renderers.MoonRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  let assetManager = skyDirector.assetManager;
  const RADIUS_OF_SKY = 5000.0;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const sunAngularRadiusInRadians = skyDirector.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;
  this.moonAngularRadiusInRadians = skyDirector.assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5;
  const radiusOfMoonPlane = RADIUS_OF_SKY * Math.sin(this.moonAngularRadiusInRadians) * 2.0;
  const diameterOfMoonPlane = 2.0 * radiusOfMoonPlane;
  const blinkOutDistance = Math.SQRT2 * diameterOfMoonPlane;
  this.geometry = new THREE.PlaneBufferGeometry(diameterOfMoonPlane, diameterOfMoonPlane, 1);
  this.bloomEnabled = false;
  this.parallacticAxis = new THREE.Vector3();

  //Unlike the regular sky, we run the moon as a multi-pass shader
  //in order to allow for bloom shading. As we are using a square plane
  //we can use this to render to a square compute shader for the color pass
  //a clamped pass to use for our bloom, several bloom passes and a combination
  //pass to combine these results with our original pass.
  this.moonRenderer = new THREE.StarrySkyComputationRenderer(skyDirector.moonAndSunRendererSize, skyDirector.moonAndSunRendererSize, skyDirector.renderer, true);
  let materials = StarrySky.Materials.Moon;
  let baseMoonPartial = materials.baseMoonPartial.fragmentShader(this.moonAngularRadiusInRadians);

  //Set up our transmittance texture
  this.baseMoonTexture = this.moonRenderer.createTexture();
  this.baseMoonVar = this.moonRenderer.addVariable('baseMoonTexture',
    StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      skyDirector.assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString,
      false,
      baseMoonPartial,
    ),
    this.baseMoonTexture
  );
  this.moonRenderer.setVariableDependencies(this.baseMoonVar, []);
  this.baseMoonVar.material.vertexShader = materials.baseMoonPartial.vertexShader;
  this.baseMoonVar.material.uniforms = JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(false, true)));
  this.baseMoonVar.material.uniforms.radiusOfMoonPlane.value = radiusOfMoonPlane;
  this.baseMoonVar.material.uniforms.radiusOfMoonPlane.needsUpdate = true;
  this.baseMoonVar.material.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.baseMoonVar.material.uniforms.rayleighInscatteringSum.needsUpdate = true;
  this.baseMoonVar.material.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.baseMoonVar.material.uniforms.mieInscatteringSum.needsUpdate = true;
  this.baseMoonVar.material.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  this.baseMoonVar.material.uniforms.transmittance.needsUpdate = true;
  this.baseMoonVar.material.uniforms.sunRadius.value = sunAngularRadiusInRadians;
  this.baseMoonVar.material.uniforms.sunRadius.needsUpdate = true;

  //If our images have finished loading, update our uniforms
  if(this.skyDirector.assetManager.hasLoadedImages){
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap', 'moonApertureSizeMap', 'moonApertureOrientationMap'];
    for(let i = 0; i < moonTextures.length; ++i){
      let moonTextureProperty = moonTextures[i];
      this.baseMoonVar.material.uniforms[moonTextureProperty].value = this.skyDirector.assetManager.images[moonTextureProperty];
      this.baseMoonVar.material.uniforms[moonTextureProperty].needsUpdate = true;
    }

    this.baseMoonVar.material.uniforms.starColorMap.value = this.skyDirector.assetManager.images.starImages.starColorMap;
  }
  this.baseMoonVar.format = THREE.RGBAFormat;
  this.baseMoonVar.type = THREE.UnsignedByteType;
  this.baseMoonVar.minFilter = THREE.LinearFilter;
  this.baseMoonVar.magFilter = THREE.LinearMipmapLinear;
  this.baseMoonVar.generateMipmaps = true;
  this.baseMoonVar.encoding = THREE.sRGBEncoding;
  this.baseMoonVar.needsUpdate = true;

  //Check for any errors in initialization
  let error1 = this.moonRenderer.init();
  if(error1 !== null){
    console.error(`Moon Renderer: ${error1}`);
  }

  //Create our material late
  this.combinationPassMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Moon.combinationPass.uniforms)),
    side: THREE.FrontSide,
    blending: THREE.NormalBlending,
    transparent: true,
    flatShading: true,
    vertexShader: StarrySky.Materials.Moon.combinationPass.vertexShader,
    fragmentShader: StarrySky.Materials.Moon.combinationPass.fragmentShader
  });
  //Attach the material to our geometry
  this.moonMesh = new THREE.Mesh(this.geometry, this.combinationPassMaterial);
  this.moonMesh.castShadow = false;
  this.moonMesh.receiveShadow = false;
  this.moonMesh.fog = false;
  this.baseMoonVar.material.uniforms.worldMatrix.value = this.moonMesh.matrixWorld;

  let self = this;
  this.setBloomStrength = function(bloomStrength){
    self.combinationPassMaterial.uniforms.bloomStrength.value = bloomStrength;
    self.combinationPassMaterial.uniforms.bloomStrength.needsUpdate = true;
  }

  this.setBloomRadius = function(bloomRadius){
    self.combinationPassMaterial.uniforms.bloomRadius.value = bloomRadius;
    self.combinationPassMaterial.uniforms.bloomRadius.needsUpdate = true;
  }

  //And update our object with our initial values
  this.setBloomStrength(3.0);
  this.setBloomRadius(0.7);

  this.tick = function(t){
    const distanceFromSunToMoon = self.skyDirector.skyState.sun.position.distanceTo(self.skyDirector.skyState.moon.position) * RADIUS_OF_SKY;
    if(distanceFromSunToMoon < blinkOutDistance && this.moonMesh.visible){
      this.moonMesh.visible = false;
    }
    else if(distanceFromSunToMoon >= blinkOutDistance && !this.moonMesh.visible){
      this.moonMesh.visible = true;
    }

    //Update the position of our mesh
    let cameraPosition = skyDirector.camera.position;
    let quadOffset = skyDirector.skyState.moon.quadOffset;
    self.parallacticAxis.copy(quadOffset).normalize();
    self.moonMesh.position.copy(quadOffset).add(cameraPosition);
    self.moonMesh.lookAt(cameraPosition); //Use the basic look-at function to always have this plane face the camera.
    self.moonMesh.rotateOnWorldAxis(self.parallacticAxis, -skyDirector.skyState.moon.parallacticAngle); //And rotate the mesh by the parallactic angle.
    self.moonMesh.updateMatrix();
    self.moonMesh.updateMatrixWorld();

    //Update our shader material
    self.baseMoonVar.material.uniforms.worldMatrix.needsUpdate = true;
    self.baseMoonVar.material.uniforms.moonHorizonFade.value = self.skyDirector.skyState.moon.horizonFade;
    self.baseMoonVar.material.uniforms.moonHorizonFade.needsUpdate = true;
    self.baseMoonVar.material.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.baseMoonVar.material.uniforms.sunHorizonFade.needsUpdate = true;
    self.baseMoonVar.material.uniforms.sunPosition.needsUpdate = true;
    self.baseMoonVar.material.uniforms.moonPosition.needsUpdate = true;
    self.baseMoonVar.material.uniforms.sunLightDirection.needsUpdate = true;
    self.baseMoonVar.material.uniforms.uTime.value = t;
    self.baseMoonVar.material.uniforms.scatteringSunIntensity.value = self.skyDirector.skyState.sun.intensity;
    self.baseMoonVar.material.uniforms.scatteringMoonIntensity.value = self.skyDirector.skyState.moon.intensity;
    self.baseMoonVar.material.uniforms.starsExposure.value = self.skyDirector.exposureVariables.starsExposure;
    self.baseMoonVar.material.uniforms.moonExposure.value = self.skyDirector.exposureVariables.moonExposure;
    self.baseMoonVar.material.uniforms.distanceToEarthsShadowSquared.value = self.skyDirector.skyState.moon.distanceToEarthsShadowSquared;
    self.baseMoonVar.material.uniforms.oneOverNormalizedLunarDiameter.value = self.skyDirector.skyState.moon.oneOverNormalizedLunarDiameter;
    self.baseMoonVar.material.uniforms.earthsShadowPosition.needsUpdate = true;
    self.baseMoonVar.material.uniforms.moonLightColor.needsUpdate = true;

    //Run our float shaders shaders
    self.moonRenderer.compute();

    //Update our final texture that is displayed
    //TODO: Drive this with HDR instead of sky fade
    let bloomTest = self.skyDirector.skyState.sun.horizonFade < 0.95;
    let bloomSwapped = this.bloomEnabled !== bloomTest;
    this.bloomEnabled = bloomSwapped ? bloomTest : this.bloomEnabled;

    //Get our moon disk whether we pass it into the bloom shader or not
    let baseTexture = self.moonRenderer.getCurrentRenderTarget(self.baseMoonVar).texture;
    baseTexture.generateMipmaps = true;
    self.combinationPassMaterial.uniforms.baseTexture.value = baseTexture;
    self.combinationPassMaterial.uniforms.baseTexture.needsUpdate = true;
    if(this.bloomEnabled){
      if(bloomSwapped){
        self.combinationPassMaterial.uniforms.bloomEnabled.value = true;
        self.combinationPassMaterial.uniforms.bloomEnabled.needsUpdate = true;
      }

      //Drive our bloom shader with our moon disk
      let bloomTextures = self.skyDirector.renderers.bloomRenderer.render(baseTexture);
      self.combinationPassMaterial.uniforms.blurTexture1.value = bloomTextures[0];
      self.combinationPassMaterial.uniforms.blurTexture2.value = bloomTextures[1];
      self.combinationPassMaterial.uniforms.blurTexture3.value = bloomTextures[2];
      self.combinationPassMaterial.uniforms.blurTexture4.value = bloomTextures[3];
      self.combinationPassMaterial.uniforms.blurTexture5.value = bloomTextures[4];
      self.combinationPassMaterial.uniforms.blurTexture1.needsUpdate = true;
      self.combinationPassMaterial.uniforms.blurTexture2.needsUpdate = true;
      self.combinationPassMaterial.uniforms.blurTexture3.needsUpdate = true;
      self.combinationPassMaterial.uniforms.blurTexture4.needsUpdate = true;
      self.combinationPassMaterial.uniforms.blurTexture5.needsUpdate = true;

      self.baseMoonVar.material.uniforms.localSiderealTime.value = self.skyDirector.skyState.LSRT;
    }
    else if(bloomSwapped){
      self.combinationPassMaterial.uniforms.bloomEnabled.value = false;
      self.combinationPassMaterial.uniforms.bloomEnabled.needsUpdate = true;
    }

    const blueNoiseTextureRef = self.skyDirector.assetManager.images.blueNoiseImages[self.skyDirector.randomBlueNoiseTexture];
    self.combinationPassMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    //Connect up our reference values
    self.baseMoonVar.material.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;
    self.baseMoonVar.material.uniforms.moonPosition.value = self.skyDirector.skyState.moon.position;
    self.baseMoonVar.material.uniforms.sunLightDirection.value = self.skyDirector.skyState.sun.quadOffset;
    self.combinationPassMaterial.uniforms.bloomEnabled.value = self.skyDirector.skyState.sun.horizonFade < 0.95;

    self.baseMoonVar.material.uniforms.mercuryPosition.value = self.skyDirector.skyState.mercury.position;
    self.baseMoonVar.material.uniforms.venusPosition.value = self.skyDirector.skyState.venus.position;
    self.baseMoonVar.material.uniforms.marsPosition.value = self.skyDirector.skyState.mars.position;
    self.baseMoonVar.material.uniforms.jupiterPosition.value = self.skyDirector.skyState.jupiter.position;
    self.baseMoonVar.material.uniforms.saturnPosition.value = self.skyDirector.skyState.saturn.position;

    self.baseMoonVar.material.uniforms.mercuryBrightness.value = self.skyDirector.skyState.mercury.intensity;
    self.baseMoonVar.material.uniforms.venusBrightness.value = self.skyDirector.skyState.venus.intensity;
    self.baseMoonVar.material.uniforms.marsBrightness.value = self.skyDirector.skyState.mars.intensity;
    self.baseMoonVar.material.uniforms.jupiterBrightness.value = self.skyDirector.skyState.jupiter.intensity;
    self.baseMoonVar.material.uniforms.saturnBrightness.value = self.skyDirector.skyState.saturn.intensity;
    self.baseMoonVar.material.uniforms.earthsShadowPosition.value = self.skyDirector.skyState.moon.earthsShadowPosition;
    self.baseMoonVar.material.uniforms.moonLightColor.value = self.skyDirector.skyState.moon.lightingModifier;

    //Connect up our images if they don't exist yet
    if(self.skyDirector.assetManager){
      //Moon Textures
      for(let [property, value] of Object.entries(self.skyDirector.assetManager.images.moonImages)){
        self.baseMoonVar.material.uniforms[property].value = value;
        self.baseMoonVar.material.uniforms[property].needsUpdate = true;
      }

      //Update our star data
      self.baseMoonVar.material.uniforms.latitude.value = self.skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
      self.baseMoonVar.material.uniforms.starHashCubemap.value = self.skyDirector.assetManager.images.starImages.starHashCubemap;
      self.baseMoonVar.material.uniforms.dimStarData.value = self.skyDirector.stellarLUTLibrary.dimStarDataMap;
      self.baseMoonVar.material.uniforms.medStarData.value = self.skyDirector.stellarLUTLibrary.medStarDataMap;
      self.baseMoonVar.material.uniforms.brightStarData.value = self.skyDirector.stellarLUTLibrary.brightStarDataMap;
    }

    //Proceed with the first tick
    self.tick(t);

    //Add this object to the scene
    self.skyDirector.scene.add(self.moonMesh);
  }
}
