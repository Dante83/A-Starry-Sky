StarrySky.Renderers.SunRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  let assetManager = skyDirector.assetManager;
  const RADIUS_OF_SKY = 5000.0;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const sunAngularRadiusInRadians = skyDirector.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;
  const radiusOfSunPlane = RADIUS_OF_SKY * Math.sin(sunAngularRadiusInRadians) * 2.0;
  const diameterOfSunPlane = 2.0 * radiusOfSunPlane;
  this.geometry = new THREE.PlaneBufferGeometry(diameterOfSunPlane, diameterOfSunPlane, 1);

  //Unlike the regular sky, we run the sun as a multi-pass shader
  //in order to allow for bloom shading. As we are using a square plane
  //we can use this to render to a square compute shader for the color pass
  //a clamped pass to use for our bloom, several bloom passes and a combination
  //pass to combine these results with our original pass.
  this.sunRenderer = new THREE.StarrySkyComputationRenderer(skyDirector.moonAndSunRendererSize, skyDirector.moonAndSunRendererSize, skyDirector.renderer);
  let materials = StarrySky.Materials.Sun;
  let baseSunPartial = materials.baseSunPartial.fragmentShader(sunAngularRadiusInRadians);

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
  this.baseSunVar.material.uniforms.radiusOfSunPlane.needsUpdate = true;
  this.baseSunVar.material.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.baseSunVar.material.uniforms.rayleighInscatteringSum.needsUpdate = true;
  this.baseSunVar.material.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.baseSunVar.material.uniforms.mieInscatteringSum.needsUpdate = true;
  this.baseSunVar.material.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  this.baseSunVar.material.uniforms.transmittance.needsUpdate = true;
  this.baseSunVar.minFilter = THREE.LinearFilter;
  this.baseSunVar.magFilter = THREE.LinearFilter;
  this.baseSunVar.needsUpdate = true;

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
    lights: false,
    flatShading: true,
    clipping: true,
    vertexShader: StarrySky.Materials.Sun.combinationPass.vertexShader,
    fragmentShader: StarrySky.Materials.Sun.combinationPass.fragmentShader
  });

  //Attach the material to our geometry
  this.sunMesh = new THREE.Mesh(this.geometry, this.combinationPassMaterial);
  this.baseSunVar.material.uniforms.worldMatrix.value = this.sunMesh.matrixWorld;

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
  this.setBloomStrength(5.0);
  this.setBloomRadius(1.0);

  this.tick = function(){
    //Update the position of our mesh
    let cameraPosition = skyDirector.camera.position;
    let quadOffset = skyDirector.skyState.sun.quadOffset;
    self.sunMesh.position.set(quadOffset.x, quadOffset.y, quadOffset.z).add(cameraPosition);
    self.sunMesh.lookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z); //Use the basic look-at function to always have this plane face the camera.
    self.sunMesh.updateMatrix();
    self.sunMesh.updateMatrixWorld();

    //Update our shader material
    self.baseSunVar.material.uniforms.worldMatrix.needsUpdate = true;
    self.baseSunVar.material.uniforms.moonHorizonFade.value = self.skyDirector.skyState.moon.horizonFade;
    self.baseSunVar.material.uniforms.moonHorizonFade.needsUpdate = true;
    self.baseSunVar.material.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.baseSunVar.material.uniforms.sunHorizonFade.needsUpdate = true;
    self.baseSunVar.material.uniforms.sunPosition.needsUpdate = true;
    self.baseSunVar.material.uniforms.moonPosition.needsUpdate = true;
    self.combinationPassMaterial.uniforms.toneMappingExposure.value = 1.0;
    self.combinationPassMaterial.uniforms.toneMappingExposure.needsUpdate = true;

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
    self.combinationPassMaterial.uniforms.baseTexture.needsUpdate = true;
    if(this.bloomEnabled){
      if(bloomSwapped){
        self.combinationPassMaterial.uniforms.bloomEnabled.value = true;
        self.combinationPassMaterial.uniforms.bloomEnabled.needsUpdate = true;
      }

      //Drive our bloom shader with our sun disk
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
    }
    else if(bloomSwapped){
      self.combinationPassMaterial.uniforms.bloomEnabled.value = false;
      self.combinationPassMaterial.uniforms.bloomEnabled.needsUpdate = true;
    }
  }

  //Upon completion, this method self destructs
  this.firstTick = function(){
    //Connect up our reference values
    self.baseSunVar.material.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;
    self.baseSunVar.material.uniforms.moonPosition.value = self.skyDirector.skyState.moon.position;
    self.combinationPassMaterial.uniforms.bloomEnabled.value = self.skyDirector.skyState.sun.horizonFade >= 0.95;
    self.combinationPassMaterial.uniforms.bloomEnabled.needsUpdate = true;

    //Connect up our images if they don't exist yet
    if(self.skyDirector.assetManager.hasLoadedImages){
      //While we only use the alpha channel, we require the lunar map for solar ecclipses
      self.baseSunVar.material.uniforms.moonDiffuseMap.value = self.skyDirector.assetManager.images.moonImages.moonDiffuseMap;
      self.baseSunVar.material.uniforms.moonDiffuseMap.needsUpdate = true;

      //Image of the solar corona for our solar ecclipse

    }

    //Proceed with the first tick
    self.tick();

    //Add this object to the scene
    self.skyDirector.scene.add(self.sunMesh);
  }
}
