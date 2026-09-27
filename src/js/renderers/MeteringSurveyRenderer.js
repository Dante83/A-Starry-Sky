//Renders a seperate version of our sky using a fisheye lens
//for consumption by our sky director and web worker state engine
//which produces the log histogram average intensity of our pixels
//for auto-exposure.
StarrySky.Renderers.MeteringSurveyRenderer = function(skyDirector){
  this.renderer = skyDirector.renderer;
  this.skyDirector = skyDirector;
  this.meteringSurveyTextureSize = 64;

  const assetManager = skyDirector.assetManager;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  this.meteringSurveyRenderer = new THREE.StarrySkyComputationRenderer(this.meteringSurveyTextureSize, this.meteringSurveyTextureSize, this.renderer);
  this.meteringSurveyTexture = this.meteringSurveyRenderer.createTexture();
  this.meteringSurveyVar = this.meteringSurveyRenderer.addVariable(`meteringSurveyVar`,
    StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      atmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString,
      false, //sun code
      false, //moon code
      true, //metering code
      //The aurora is left out of the metering: the eye's night adaptation follows
      //the dark sky and the land, not the aurora, and metering it turned the
      //exposure down as a storm grew and cancelled most of the brightening that
      //<sky-aurora-activity> asks for. (v1 never reached the meter either -- its
      //cutoff distance was never set here, so its march was zero length.)
      false,  //aurora enabled
      false
    ),
    this.meteringSurveyTexture
  );
  this.meteringSurveyRenderer.setVariableDependencies(this.meteringSurveyVar, []);
  this.meteringSurveyVar.material.vertexShader = StarrySky.Materials.Autoexposure.meteringSurvey.vertexShader;
  this.meteringSurveyVar.material.uniforms = JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(
    false,
    false,
    true,
    false, //aurora enabled, see above
    false)));
  this.meteringSurveyVar.material.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.meteringSurveyVar.material.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.meteringSurveyVar.material.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  this.meteringSurveyVar.material.uniforms.latitude.value = skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
  this.meteringSurveyVar.material.uniforms.moonLightColor.value = skyDirector.skyState.moon.lightingModifier;
  this.meteringSurveyVar.material.uniforms.cameraHeight.value = skyDirector.assetManager.data.skyAtmosphericParameters.cameraHeight;

  this.meteringSurveyVar.format = THREE.RGBAFormat;
  this.meteringSurveyVar.minFilter = THREE.NearestFilter;
  this.meteringSurveyVar.magFilter = THREE.NearestFilter;
  this.meteringSurveyVar.wrapS = THREE.ClampToEdgeWrapping;
  this.meteringSurveyVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error1 = this.meteringSurveyRenderer.init();
  if(error1 !== null){
    console.error(`Metering Survey Renderer: ${error1}`);
  }

  this.meteringSurveyRenderer.compute();
  let test = this.meteringSurveyRenderer.getCurrentRenderTarget(this.meteringSurveyVar).texture;

  let self = this;
  this.render = function(sunPosition, moonPosition, sunFade, moonFade){
    //Update the uniforms so that we can see where we are on this sky.
    const uniforms = self.meteringSurveyVar.material.uniforms;
    const skyState = skyDirector.skyState;
    uniforms.sunPosition.value = sunPosition;
    uniforms.moonPosition.value = moonPosition;
    uniforms.sunHorizonFade.value = sunFade;
    uniforms.moonHorizonFade.value = Math.max(1.0 - sunFade, 0.0);
    uniforms.scatteringSunIntensity.value = skyState.sun.intensity * atmosphericParameters.solarIntensity / 1367.0;
    uniforms.sunLuminosity.value = skyState.sun.luminosity;
    // Schneegans LuT carries the brightness modulation; no extra attenuation.
    uniforms.scatteringMoonIntensity.value = skyState.moon.intensity * atmosphericParameters.lunarMaxIntensity / 29.0;
    uniforms.moonLuminosity.value = skyState.moon.luminosity;
    uniforms.starsExposure.value = skyDirector.exposureVariables.starsExposure;
    const blueNoiseTextureRef = skyDirector.assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];
    uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
    self.meteringSurveyRenderer.compute();
    const skyRenderTarget = self.meteringSurveyRenderer.getCurrentRenderTarget(this.meteringSurveyVar);
    return skyRenderTarget;
  }
}
