StarrySky.Renderers.SunRenderer = function(skyDirector, renderer, scene){
  this.renderer = renderer;
  this.skyDirector = skyDirector;
  let assetManager = skyDirector.assetManager;
  const RADIUS_OF_SKY = 5000.0;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const sunDiameterInRadians = skyDirector.assetManager.sunAngularDiameter * DEG_2_RAD;
  let diameterOfSunPlane = 2.0 * RADIUS_OF_SKY * Math.sin(sunDiameterInRadians);
  this.geometry = new THREE.PlaneGeometry(diameterOfSunPlane, diameterOfSunPlane, 1);
  this.directLight;

  //Unlike the regular sky, we run the sun as a multi-pass shader
  //in order to allow for bloom shading. As we are using a square plane
  //we can use this to render to a square compute shader for the color pass
  //a clamped pass to use for our bloom, several bloom passes and a combination
  //pass to combine these results with our original pass.
  let sunRenderer = new THREE.GPUComputationRenderer(512, 512, renderer);
  let materials = StarrySky.Materials.Sun;
  let baseSunPartial = materials.baseSunPartial.fragmentShader(sunDiameterInRadians);

  //Set up our transmittance texture
  this.baseSunTexture = transmittanceRenderer.createTexture();
  this.baseSunVar = transmittanceRenderer.addVariable('baseSunTexture',
    StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      skyDirector.assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString
    ),
    this.baseSunTexture
  );
  sunRenderer.setVariableDependencies(this.baseSunVar, []);
  this.baseSunVar.material.uniforms = JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.uniforms));
  this.baseSunVar.minFilter = THREE.LinearFilter;
  this.baseSunVar.magFilter = THREE.LinearFilter;

  //Check for any errors in initialization
  let error1 = sunRenderer.init();
  if(error1 !== null){
    console.error(`Sun Renderer: ${error1}`);
  }

  //Create our base pass
  sunRenderer.compute();
  let basePass = sunRenderer.getCurrentRenderTarget(this.baseSunVar).texture;

  //Create our material late
  this.combinationPassMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Sun.combinationPass.uniforms)),
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    transparent: true,
    lights: false,
    flatShading: true,
    clipping: true,
    vertexShader: StarrySky.Materials.Sun.combinationPass.vertexShader,
    fragmentShader: StarrySky.Materials.Sun.combinationPass.fragmentShader
  });
  this.combinationPassMaterial.uniforms.basePass.value = basePass;
  this.combinationPassMaterial.uniforms.basePass.needsUpdate = true;

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(this.geometry, this.atmosphereMaterial);

  let self = this;
  this.tick = function(){
    //Update the position of our mesh
    let sunPosition = skyDirector.skyState.sun.position;
    self.geometry.position.set(sunPosition.x, sunPosition.y, sunPosition.z).multiplyScalar(this.sunRadiusFromCamera);
    let cameraPosition = skyDirector.camera.position;
    self.geometry.lookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z); //Use the basic look-at function to always have this plane face the camera.
    self.geometry.updateMatrix();
    self.geometry.updateMatrixWorld();

    //Update our lights

    //Update our shader material
    self.baseSunVar.material.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.baseSunVar.material.uniforms.sunHorizonFade.needsUpdate = true;
    self.baseSunVar.material.uniforms.toneMappingExposure.value = 0.8;
    self.baseSunVar.material.uniforms.toneMappingExposure.needsUpdate = true;
    self.baseSunVar.material.uniforms.sunPosition.needsUpdate = true;

    //Run our float shaders shaders
    sunRenderer.compute();
    let basePass = sunRenderer.getCurrentRenderTarget(this.baseSunVar).texture;

    //Pass this information into our final texture for display
    this.combinationPassMaterial.uniforms.basePass.value = basePass;
    this.combinationPassMaterial.uniforms.basePass.needsUpdate = true;
  }

  //Upon completion, this method self destructs
  this.firstTick = function(){
    //Connect up our reference values
    self.baseSunVar.material.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;

    //Proceed with the first tick
    self.tick();

    //Add this object to the scene
    self.skyDirector.scene.add(this.geometry);
  }
}
