//Renders a seperate version of our sky using a fisheye lens
//for consumption by our sky director and web worker state engine
//which produces the log histogram average intensity of our pixels
//for auto-exposure.
StarrySky.Renderers.MeteringSurveyRenderer = function(skyDirector){
  this.renderer = skyDirector.renderer;
  this.skyDirector = skyDirector;
  this.meteringSurveyTextureSize = 128;

  this.meteringSurveyRenderer = new THREE.StarrySkyComputationRenderer(this.meteringSurveyTextureSize, this.meteringSurveyTextureSize, this.renderer);
  this.meteringSurveyTexture = this.meteringSurveyRenderer.createTexture();
  this.meteringSurveyVar = this.meteringSurveyRenderer.addVariable(`meteringSurveyVar`,
    StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      skyDirector.assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString,
      false,
      false,
      true
    ),
    this.meteringSurveyTexture
  );
  this.meteringSurveyRenderer.setVariableDependencies(this.meteringSurveyVar, []);
  this.meteringSurveyVar.material.vertexShader = StarrySky.Materials.Autoexposure.meteringSurvey.vertexShader;
  this.meteringSurveyVar.material.uniforms = JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(false, false)));
  this.meteringSurveyVar.material.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.meteringSurveyVar.material.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.meteringSurveyVar.material.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  this.meteringSurveyVar.material.uniforms.latitude.value = this.skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);

  this.meteringSurveyVar.minFilter = THREE.NearestFilter;
  this.meteringSurveyVar.magFilter = THREE.NearestFilter;
  this.meteringSurveyVar.format = THREE.RGBAFormat;
  this.meteringSurveyVar.wrapS = THREE.ClampToEdgeWrapping;
  this.meteringSurveyVar.wrapT = THREE.ClampToEdgeWrapping;
  this.meteringSurveyVar.generateMipmaps = false;

  //Check for any errors in initialization
  let error1 = this.meteringSurveyRenderer.init();
  if(error1 !== null){
    console.error(`Metering Survey Renderer: ${error1}`);
  }

  this.meteringSurveyRenderer.compute();
  let test = this.meteringSurveyRenderer.getCurrentRenderTarget(this.meteringSurveyVar).texture;

  //Let's test this out by adding it to a plane in the scene
  let plane = new THREE.PlaneBufferGeometry(2.0, 2.0, 1);

  //Create our material late
  let material = new THREE.MeshLambertMaterial({
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    transparent: true,
    lights: false,
    flatShading: true,
    clipping: true,
    map: test,
  });

  //Attach the material to our geometry
  let testMesh = new THREE.Mesh(plane, material);
  testMesh.position.set(0.0, 2.0, -2.0);

  //Inject this mesh into our scene
  this.skyDirector.scene.add(testMesh);

  let self = this;
  this.render = function(sunPosition, moonPosition, sunFade, moonFade){
    //Update the uniforms so that we can see where we are on this sky.
    self.meteringSurveyVar.material.uniforms.sunPosition.value = sunPosition;
    self.meteringSurveyVar.material.uniforms.moonPosition.value = moonPosition;
    self.meteringSurveyVar.material.uniforms.sunHorizonFade.value = sunFade;
    self.meteringSurveyVar.material.uniforms.moonHorizonFade.value = moonFade;

    self.meteringSurveyRenderer.compute();
    let renderTargetTexture = self.meteringSurveyRenderer.getCurrentRenderTarget(this.meteringSurveyVar);
    return renderTargetTexture;
  }
}
