//Renders a seperate version of our sky using a fisheye lens
//for consumption by our sky director and web worker state engine
//which produces the log histogram average intensity of our pixels
//for auto-exposure.
StarrySky.Renderers.MeteringSurveyRenderer = function(skyDirector){
  this.renderer = skyDirector.renderer;
  this.skyDirector = skyDirector;
  this.meteringSurveyTextureSize = 64;

  const assetManager = skyDirector.assetManager;
  const auroraParameters = assetManager.data.skyAuroraParameters;
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
      assetManager.data.skyAuroraParameters.auroraEnabled  //aurora enabled
    ),
    this.meteringSurveyTexture
  );
  this.meteringSurveyRenderer.setVariableDependencies(this.meteringSurveyVar, []);
  this.meteringSurveyVar.material.vertexShader = StarrySky.Materials.Autoexposure.meteringSurvey.vertexShader;
  this.meteringSurveyVar.material.uniforms = JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(
    false,
    false,
    true,
    assetManager.data.skyAuroraParameters.auroraEnabled)));
  this.meteringSurveyVar.material.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.meteringSurveyVar.material.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.meteringSurveyVar.material.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  this.meteringSurveyVar.material.uniforms.cloudLUTs.value = skyDirector.cloudLUTLibrary.repeating3DCloudNoiseTextures;
  this.meteringSurveyVar.material.uniforms.latitude.value = skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
  this.meteringSurveyVar.material.uniforms.moonLightColor.value = skyDirector.skyState.moon.lightingModifier;
  if(assetManager.data.skyAuroraParameters.auroraEnabled){
    this.meteringSurveyVar.material.uniforms.nitrogenColor.value = new THREE.Vector3(
      auroraParameters.nitrogenColor.red / 255.0,
      auroraParameters.nitrogenColor.green / 255.0,
      auroraParameters.nitrogenColor.blue / 255.0,
    );
    this.meteringSurveyVar.material.uniforms.nitrogenCutOff.value = auroraParameters.nitrogenCutOff;
    this.meteringSurveyVar.material.uniforms.nitrogenIntensity.value = auroraParameters.nitrogenIntensity;

    this.meteringSurveyVar.material.uniforms.molecularOxygenColor.value = new THREE.Vector3(
      auroraParameters.molecularOxygenColor.red / 255.0,
      auroraParameters.molecularOxygenColor.green / 255.0,
      auroraParameters.molecularOxygenColor.blue / 255.0,
    );
    this.meteringSurveyVar.material.uniforms.molecularOxygenCutOff.value = auroraParameters.molecularOxygenCutOff;
    this.meteringSurveyVar.material.uniforms.molecularOxygenIntensity.value = auroraParameters.molecularOxygenIntensity;

    this.meteringSurveyVar.material.uniforms.atomicOxygenColor.value = new THREE.Vector3(
      auroraParameters.atomicOxygenColor.red / 255.0,
      auroraParameters.atomicOxygenColor.green / 255.0,
      auroraParameters.atomicOxygenColor.blue / 255.0,
    );
    this.meteringSurveyVar.material.uniforms.atomicOxygenCutOff.value = auroraParameters.atomicOxygenCutOff;
    this.meteringSurveyVar.material.uniforms.atomicOxygenIntensity.value = auroraParameters.atomicOxygenIntensity;

    //Number of raymarching steps
    this.meteringSurveyVar.material.uniforms.numberOfAuroraRaymarchingSteps.value = auroraParameters.raymarchSteps;
  }

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
    self.meteringSurveyVar.material.uniforms.sunPosition.value = sunPosition;
    self.meteringSurveyVar.material.uniforms.moonPosition.value = moonPosition;
    self.meteringSurveyVar.material.uniforms.sunHorizonFade.value = sunFade;
    self.meteringSurveyVar.material.uniforms.moonHorizonFade.value = Math.max(1.0 - sunFade, 0.0);
    self.meteringSurveyVar.material.uniforms.scatteringSunIntensity.value = self.skyDirector.skyState.sun.intensity;
    self.meteringSurveyVar.material.uniforms.sunLuminosity.value = self.skyDirector.skyState.sun.luminosity;
    self.meteringSurveyVar.material.uniforms.scatteringMoonIntensity.value = self.skyDirector.skyState.moon.intensity;
    self.meteringSurveyVar.material.uniforms.moonLuminosity.value = self.skyDirector.skyState.moon.luminosity;
    self.meteringSurveyVar.material.uniforms.starsExposure.value = self.skyDirector.exposureVariables.starsExposure;
    if(assetManager.data.skyAuroraParameters.auroraEnabled){
      self.meteringSurveyVar.material.uniforms.auroraSampler1.value =  self.skyDirector?.assetManager.images.auroraImages[0];
      self.meteringSurveyVar.material.uniforms.auroraSampler2.value =  self.skyDirector?.assetManager.images.auroraImages[1];
    }
    const blueNoiseTextureRef = self.skyDirector.assetManager.images.blueNoiseImages[self.skyDirector.randomBlueNoiseTexture];
    self.meteringSurveyVar.material.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;

    self.meteringSurveyRenderer.compute();
    const skyRenderTarget = self.meteringSurveyRenderer.getCurrentRenderTarget(this.meteringSurveyVar);
    return skyRenderTarget;
  }
}
