StarrySky.Renderers.SunRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  let assetManager = skyDirector.assetManager;
  const RADIUS_OF_SKY = 5000.0;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const moonAngularRadiusInRadians = skyDirector.assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5;
  const baseRadiusOfTheMoon = Math.sin(moonAngularRadiusInRadians)
  this.sunAngularRadiusInRadians = skyDirector.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;
  const radiusOfSunPlane = RADIUS_OF_SKY * Math.sin(this.sunAngularRadiusInRadians) * 2.0;
  const diameterOfSunPlane = 2.0 * radiusOfSunPlane;
  this.geometry = new THREE.PlaneBufferGeometry(diameterOfSunPlane, diameterOfSunPlane, 1);

  //Unlike the regular sky, we run the sun as a multi-pass shader
  //in order to allow for bloom shading. As we are using a square plane
  //we can use this to render to a square compute shader for the color pass
  //a clamped pass to use for our bloom, several bloom passes and a combination
  //pass to combine these results with our original pass.
  this.sunRenderer = new THREE.StarrySkyComputationRenderer(1024, 1024, skyDirector.renderer);
  let materials = StarrySky.Materials.Sun;
  let baseSunPartial = materials.baseSunPartial.fragmentShader(this.sunAngularRadiusInRadians);

  //Set up our transmittance texture
  this.baseSunTexture = this.sunRenderer.createTexture();
  this.baseSunVar = this.sunRenderer.addVariable('baseSunTexture',
    StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      skyDirector.assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString,
      baseSunPartial,
      false
    ),
    this.baseSunTexture
  );
  this.sunRenderer.setVariableDependencies(this.baseSunVar, []);
  this.baseSunVar.material.vertexShader = materials.baseSunPartial.vertexShader;
  this.baseSunVar.material.uniforms = JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(true)));
  this.baseSunVar.material.uniforms.radiusOfSunPlane.value = radiusOfSunPlane;
  this.baseSunVar.material.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.baseSunVar.material.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.baseSunVar.material.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  this.baseSunVar.format = THREE.RGBAFormat;
  this.baseSunVar.type = THREE.FloatType;
  this.baseSunVar.generateMipmaps = false;
  this.baseSunVar.minFilter = THREE.LinearFilter;
  this.baseSunVar.magFilter = THREE.LinearFilter;

  //Check for any errors in initialization
  let error1 = this.sunRenderer.init();
  if(error1 !== null){
    console.error(`Sun Renderer: ${error1}`);
  }

  //Create our material late
  this.combinationPassMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Sun.combinationPass.uniforms)),
    side: THREE.FrontSide,
    blending: THREE.NormalBlending,
    transparent: true,
    vertexShader: StarrySky.Materials.Sun.combinationPass.vertexShader,
    fragmentShader: StarrySky.Materials.Sun.combinationPass.fragmentShader
  });

  //Attach the material to our geometry
  this.sunMesh = new THREE.Mesh(this.geometry, this.combinationPassMaterial);
  this.sunMesh.castShadow = false;
  this.sunMesh.receiveShadow = false;
  this.sunMesh.fog = false;
  this.baseSunVar.material.uniforms.worldMatrix.value = this.sunMesh.matrixWorld;

  let self = this;
  this.setBloomStrength = function(bloomStrength){
    self.combinationPassMaterial.uniforms.bloomStrength.value = bloomStrength;
  }

  this.setBloomRadius = function(bloomRadius){
    self.combinationPassMaterial.uniforms.bloomRadius.value = bloomRadius;
  }

  //And update our object with our initial values
  this.setBloomStrength(3.0);
  this.setBloomRadius(0.7);

  this.tick = function(t){
    //Update the position of our mesh
    let cameraPosition = skyDirector.camera.position;
    let quadOffset = skyDirector.skyState.sun.quadOffset;
    self.sunMesh.position.set(quadOffset.x, quadOffset.y, quadOffset.z).add(cameraPosition);
    self.sunMesh.lookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z); //Use the basic look-at function to always have this plane face the camera.
    self.sunMesh.updateMatrix();
    self.sunMesh.updateMatrixWorld();

    //Update our shader material
    self.baseSunVar.material.uniforms.moonHorizonFade.value = self.skyDirector.skyState.moon.horizonFade;
    self.baseSunVar.material.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.baseSunVar.material.uniforms.uTime.value = t;
    self.baseSunVar.material.uniforms.scatteringSunIntensity.value = self.skyDirector.skyState.sun.intensity;
    self.baseSunVar.material.uniforms.scatteringMoonIntensity.value = self.skyDirector.skyState.moon.intensity;
    self.baseSunVar.material.uniforms.localSiderealTime.value = self.skyDirector.skyState.LSRT;
    self.baseSunVar.material.uniforms.moonRadius.value = self.skyDirector.skyState.moon.scale * baseRadiusOfTheMoon;

    //Run our float shaders shaders
    self.sunRenderer.compute();

    //Update our final texture that is displayed
    //TODO: Drive this with HDR instead of sky fade
    let bloomTest = self.skyDirector.skyState.sun.horizonFade >= 0.95;
    let bloomSwapped = this.bloomEnabled !== bloomTest;
    this.bloomEnabled = bloomSwapped ? bloomTest : this.bloomEnabled;

    //update our base texture, whether we pass it into a bloom shader or not.
    let baseTexture = self.sunRenderer.getCurrentRenderTarget(self.baseSunVar).texture;
    self.combinationPassMaterial.uniforms.baseTexture.value = baseTexture;
    if(this.bloomEnabled){
      if(bloomSwapped){
        self.combinationPassMaterial.uniforms.bloomEnabled.value = true;
      }

      //Drive our bloom shader with our sun disk
      let bloomTextures = self.skyDirector.renderers.bloomRenderer.render(baseTexture);
      self.combinationPassMaterial.uniforms.blurTexture1.value = bloomTextures[0];
      self.combinationPassMaterial.uniforms.blurTexture2.value = bloomTextures[1];
      self.combinationPassMaterial.uniforms.blurTexture3.value = bloomTextures[2];
      self.combinationPassMaterial.uniforms.blurTexture4.value = bloomTextures[3];
      self.combinationPassMaterial.uniforms.blurTexture5.value = bloomTextures[4];
    }
    else if(bloomSwapped){
      self.combinationPassMaterial.uniforms.bloomEnabled.value = false;
    }

    const blueNoiseTextureRef = self.skyDirector.assetManager.images.blueNoiseImages[self.skyDirector.randomBlueNoiseTexture];
    self.combinationPassMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    //Connect up our reference values
    self.baseSunVar.material.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;
    self.baseSunVar.material.uniforms.moonPosition.value = self.skyDirector.skyState.moon.position;
    self.baseSunVar.material.uniforms.latitude.value = self.skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
    self.baseSunVar.material.uniforms.moonLightColor.value = self.skyDirector.skyState.moon.lightingModifier;

    self.combinationPassMaterial.uniforms.bloomEnabled.value = self.skyDirector.skyState.sun.horizonFade >= 0.95;

    //Connect up our images if they don't exist yet
    if(self.skyDirector.assetManager.hasLoadedImages){
      //Image of the solar corona for our solar ecclipse
      self.baseSunVar.material.uniforms.solarEclipseMap.value = self.skyDirector.assetManager.images.solarEclipseImage;
    }

    //Proceed with the first tick
    self.tick(t);

    //Add this object to the scene
    self.skyDirector.scene.add(self.sunMesh);
  }
}
