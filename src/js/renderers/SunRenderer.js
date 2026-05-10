StarrySky.Renderers.SunRenderer = function(skyDirector){
	const renderer = skyDirector.renderer;
	const assetManager = skyDirector.assetManager;
	const atmosphereLUTLibrary = skyDirector.atmosphereLUTLibrary;
	const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
	const skyState = skyDirector.skyState;
  const scratchColor = new THREE.Color();
	const RENDER_TARGET_SIZE = 256;
  const RADIUS_OF_SKY = 5000.0;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const moonAngularRadiusInRadians = atmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5;
  const baseRadiusOfTheMoon = Math.sin(moonAngularRadiusInRadians)
	this.sunAngularRadiusInRadians = atmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;
  const radiusOfSunPlane = RADIUS_OF_SKY * Math.sin(this.sunAngularRadiusInRadians) * 2.0;
  const diameterOfSunPlane = 4.0 * radiusOfSunPlane;

	//Setup external methods
	const self = this;
	StarrySky.Methods.getSunRadius = function(){
		return self.sunAngularRadiusInRadians;
	};

	StarrySky.Methods.getSunPosition = function(){
		return skyState.sun.position;
	};

	StarrySky.Methods.getIsDominantLightSun = function(){
		const sunRadius = Math.sin(self.sunAngularRadiusInRadians * skyState.sun.scale);
    return skyState.sun.position.y >= -sunRadius;
	};

	//All of this eventually gets drawn out to a single quad
  this.geometry = new THREE.PlaneGeometry(diameterOfSunPlane, diameterOfSunPlane, 1);

	//Prepare our scene and render target object
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	const outputRenderTarget = new THREE.WebGLRenderTarget(RENDER_TARGET_SIZE, RENDER_TARGET_SIZE);
  outputRenderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
  outputRenderTarget.texture.magFilter = THREE.LinearFilter;
	outputRenderTarget.texture.format = THREE.RGBAFormat;
  outputRenderTarget.texture.type = THREE.FloatType;
  outputRenderTarget.texture.generateMipmaps = true;
  outputRenderTarget.texture.anisotropy = 4;
  outputRenderTarget.samples = 8;
	const composer = new THREE.EffectComposer(renderer, outputRenderTarget);
	composer.renderToScreen = false;

	const baseSunMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(
      true, //sun pass
      false, //moon pass
      false, //metering pass
      false,  //aurora enabled
      assetManager.data.skyCloud.cloudsEnabled  //clouds enabled
    ))),
    vertexShader: StarrySky.Materials.Sun.baseSunPartial.vertexShader,
    fragmentShader: StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      atmosphericParameters.mieDirectionalG,
      atmosphereLUTLibrary.scatteringTextureWidth,
      atmosphereLUTLibrary.scatteringTextureHeight,
      atmosphereLUTLibrary.scatteringTexturePackingWidth,
      atmosphereLUTLibrary.scatteringTexturePackingHeight,
      atmosphereLUTLibrary.atmosphereFunctionsString,
      StarrySky.Materials.Sun.baseSunPartial.fragmentShader(this.sunAngularRadiusInRadians),
      false, //Moon Code
      false, //Metering Code
      false, //aurora enabled
			assetManager.data.skyCloud.cloudsEnabled  //clouds enabled
    ),
  });
  baseSunMaterial.uniforms.radiusOfSunPlane.value = radiusOfSunPlane;
  baseSunMaterial.uniforms.rayleighInscatteringSum.value = atmosphereLUTLibrary.rayleighScatteringSum;
  baseSunMaterial.uniforms.mieInscatteringSum.value = atmosphereLUTLibrary.mieScatteringSum;
  baseSunMaterial.uniforms.transmittance.value = atmosphereLUTLibrary.transmittance;
	baseSunMaterial.uniforms.cameraPosition.value = new THREE.Vector3(0.0);
	if(assetManager.data.skyCloud.cloudsEnabled){
    baseSunMaterial.uniforms.cloudLUTs.value = skyDirector.cloudLUTLibrary.repeating3DCloudNoiseTextures;
  }
  baseSunMaterial.defines.resolution = 'vec2( ' + RENDER_TARGET_SIZE + ', ' + RENDER_TARGET_SIZE + " )";
	const renderBufferMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    baseSunMaterial
  );
  scene.add(renderBufferMesh);

	const renderPass = new THREE.RenderPass(scene, camera);
	composer.addPass(renderPass);
	const sunBloomDataRef = assetManager.data.skyLighting.sunBloom;
  if(sunBloomDataRef.bloomEnabled){
    this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(RENDER_TARGET_SIZE, RENDER_TARGET_SIZE), 1.5, 0.4, 0.85);
		this.bloomPass.exposure = sunBloomDataRef.exposure;
    this.bloomPass.threshold = sunBloomDataRef.threshold;
    this.bloomPass.strength = sunBloomDataRef.strength;
    this.bloomPass.radius = sunBloomDataRef.radius;
    composer.addPass(this.bloomPass);
  }

	//Attach the material to our geometry
	const outputMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Postprocessing.moonAndSunOutput.uniforms)),
    vertexShader: StarrySky.Materials.Postprocessing.moonAndSunOutput.vertexShader,
    fragmentShader: StarrySky.Materials.Postprocessing.moonAndSunOutput.fragmentShader
  });
	outputMaterial.defines.resolution = 'vec2( ' + RENDER_TARGET_SIZE + ', ' + RENDER_TARGET_SIZE + " )";
	outputMaterial.defines.HDR_INPUT = '';
  this.sunMesh = new THREE.Mesh(this.geometry, outputMaterial);
  outputMaterial.castShadow = false;
  outputMaterial.fog = false;
	outputMaterial.side = THREE.FrontSide;
	outputMaterial.dithering = false;
	outputMaterial.toneMapped = false;
	outputMaterial.transparent = true;
	baseSunMaterial.uniforms.worldMatrix.value = this.sunMesh.matrixWorld;

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

    //Update the position of our mesh
    const cameraPosition = skyDirector.globalCameraPosition;
    const quadOffset = skyDirector.skyState.sun.quadOffset;
		baseSunMaterial.uniforms.cameraPosition.value.copy(cameraPosition);
    self.sunMesh.position.set(quadOffset.x, quadOffset.y, quadOffset.z).add(cameraPosition);
    self.sunMesh.lookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z); //Use the basic look-at function to always have this plane face the camera.
    self.sunMesh.updateMatrix();
    self.sunMesh.updateMatrixWorld();

    //Update our shader material
		const blueNoiseTextureRef = assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];
		baseSunMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
    baseSunMaterial.uniforms.moonHorizonFade.value = skyState.moon.horizonFade;
    baseSunMaterial.uniforms.sunHorizonFade.value = skyState.sun.horizonFade;
    baseSunMaterial.uniforms.uTime.value = t;
    baseSunMaterial.uniforms.scatteringSunIntensity.value = skyState.sun.intensity * atmosphericParameters.solarIntensity / 1367.0;
    baseSunMaterial.uniforms.scatteringMoonIntensity.value = skyState.moon.intensity * atmosphericParameters.lunarMaxIntensity / 29.0;
    baseSunMaterial.uniforms.localSiderealTime.value = skyState.LSRT;
    baseSunMaterial.uniforms.moonRadius.value = skyState.moon.scale * baseRadiusOfTheMoon;

		const lightingManager = skyDirector.lightingManager;
		if(assetManager.data.skyCloud.cloudsEnabled){
      baseSunMaterial.uniforms.cloudTime.value = assetManager.data.skyCloud.startSeed + t;
      if(assetManager && assetManager.data.skyCloud.cloudsEnabled && lightingManager){
        baseSunMaterial.uniforms.ambientLightPY.value = scratchColor.copy(lightingManager.yAxisHemisphericalLight.color).multiplyScalar(lightingManager.yAxisHemisphericalLight.intensity);
      }
    }

    //Sun bloom: lower threshold near horizon (sun dimmer due to extinction ->
    //easier to exceed -> bigger bloom at sunset). Range: half threshold at the
    //horizon, full threshold at zenith.
    if(sunBloomDataRef.bloomEnabled){
      this.bloomPass.threshold = sunBloomDataRef.threshold * (0.5 + 0.5 * skyState.sun.horizonFade);
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
    baseSunMaterial.uniforms.sunPosition.value = skyState.sun.position;
    baseSunMaterial.uniforms.moonPosition.value = skyState.moon.position;
    baseSunMaterial.uniforms.moonLightColor.value = skyState.moon.lightingModifier;

    //Connect up our images once they have all finished loading
		if(assetManager.hasLoadedImages){
			//Update sky parameters
			const blueNoiseTextureRef = assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];
	    baseSunMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
			baseSunMaterial.uniforms.latitude.value = assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
			baseSunMaterial.uniforms.cameraHeight.value = atmosphericParameters.cameraHeight;

	    //Image of the solar corona for our solar ecclipse
	    baseSunMaterial.uniforms.solarEclipseMap.value = assetManager.images.solarEclipseImage;

			if(assetManager.data.skyCloud.cloudsEnabled){
				const cloudParams = assetManager.data.skyCloud;
				baseSunMaterial.uniforms.cloudCoverage.value = cloudParams.coverage;
        baseSunMaterial.uniforms.cloudVelocity.value = cloudParams.velocity;
        baseSunMaterial.uniforms.cloudStartHeight.value = cloudParams.startHeight;
        baseSunMaterial.uniforms.cloudEndHeight.value = cloudParams.endHeight;
        baseSunMaterial.uniforms.numberOfCloudMarchSteps.value = (cloudParams.numberOfRayMarchSteps + 0.0);
				baseSunMaterial.uniforms.cloudFadeOutStartPercent.value = cloudParams.fadeOutStartPercent;
        baseSunMaterial.uniforms.cloudFadeInEndPercent.value = cloudParams.fadeInEndPercent;
        baseSunMaterial.uniforms.cloudCutoffDistance.value = cloudParams.cutoffDistance;
			}
			assetsNotReadyYet = false;

			//Proceed with the first tick
      self.tick(t);

			skyDirector.scene.add(self.sunMesh);

			//Delete this method when done
			delete this.firstTick;
		}
  }
}
