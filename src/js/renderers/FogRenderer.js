StarrySky.Renderers.FogRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  this.originalFragmentShader = THREE.ShaderChunk.fog_vertex;
  this.originalFragmentShader = THREE.ShaderChunk.fog_fragment;
  this.fragmentShaderRef = THREE.ShaderChunk.fog_vertex;
  this.fragmentShaderRef = THREE.ShaderChunk.fog_fragment;

  //Create our material late
  const assetManager = skyDirector.assetManager;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  const skyState = skyDirector.skyState;
  const fragmentShader;
  const vertexShader;

  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge( [
				THREE.UniformsLib['fog'],
        THREE.uniformsLibrary. JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(
          false, //sun pass
          false, //moon pass
          false, //metering pass
          false, //aurora enabled
          false, //clouds enabled
          true,  //Fog pass
        )))
      ] )
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
      false,  //aurora enabled
      false,  //clouds enabled
      true,  //Fog pass
    )
  });
  this.atmosphereMaterial.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.atmosphereMaterial.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.atmosphereMaterial.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;

  const self = this;
  this.tick = function(t){
    const cameraPosition = skyDirector.camera.position;
    const uniforms = self.atmosphereMaterial.uniforms;
    const skyState = skyDirector.skyState;

    //Update the uniforms so that we can see where we are on this sky.
    uniforms.sunHorizonFade.value = skyState.sun.horizonFade;
    uniforms.moonHorizonFade.value = skyState.moon.horizonFade;
    uniforms.uTime.value = t;
    uniforms.scatteringSunIntensity.value = skyState.sun.intensity;
    uniforms.scatteringMoonIntensity.value = skyState.moon.intensity;
    uniforms.blueNoiseTexture.value = assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    const uniforms = self.atmosphereMaterial.uniforms;

    //Connect up our reference values
    uniforms.sunPosition.value = skyState.sun.position;
    uniforms.moonPosition.value = skyState.moon.position;
    uniforms.moonLightColor.value = skyState.moon.lightingModifier;

    //Proceed with the first tick
    self.tick(t);

    //Delete this method when done
    delete this.firstTick;
  }
}
