//Marches the clouds once per frame into a map of the upper hemisphere, indexed by
//direction, and publishes it as this.cloudMap. The sky dome, the sun pass and the
//moon pass all sample that one map instead of each running their own ray marcher,
//and because the map does not depend on where the camera is looking, both eyes in
//VR share it and turning the head needs no reprojection.
//
//Two passes per frame:
//  march   -- half resolution, each texel jittered by a sub texel Halton offset and
//             a blue noise start offset that walks in time (cloud-march.glsl).
//  resolve -- full resolution temporal upsample: the new march frame is blended
//             into the reprojected history, clipped to the local neighbourhood so
//             nothing ghosts (cloud-resolve.glsl). Ping-pongs between two targets.
StarrySky.Renderers.CloudRenderer = function(skyDirector){
  const renderer = skyDirector.renderer;
  const assetManager = skyDirector.assetManager;
  const atmosphereLUTLibrary = skyDirector.atmosphereLUTLibrary;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  const cloudParams = assetManager.data.skyCloud;
  const skyState = skyDirector.skyState;
  const materials = StarrySky.Materials.Clouds;

  //Weight of the new frame where the march put a sample right on a map texel. The
  //resolve scales it by how much sample weight actually landed nearby
  //(CLOUD_TAA_SAMPLE_SHARPNESS in cloud-resolve.glsl), so averaged over the jitter
  //pattern a texel takes about a third of this per frame -- ~0.05, a window of
  //about 20 frames, a third of a second at 60fps. The ray march is noisy right at
  //cloud edges, and at 0.25 (a ~0.18s window) edges visibly boiled in and out. The
  //variance clip still snaps the history to real lighting changes, so a longer
  //window costs little lag.
  const CLOUD_TAA_BLEND = 0.15;

  //A gap longer than this between frames (a backgrounded tab, a debugger pause)
  //means the history no longer describes the sky, so it is thrown away.
  const CLOUD_HISTORY_MAX_GAP_MS = 1000.0;

  //Sub texel jitter sequence, Halton bases 2 and 3, centred on zero.
  const HALTON_LENGTH = 16;
  const halton = function(index, base){
    let result = 0.0;
    let fraction = 1.0 / base;
    let i = index;
    while(i > 0){
      result += (i % base) * fraction;
      i = Math.floor(i / base);
      fraction /= base;
    }
    return result;
  };
  const jitterSequence = [];
  for(let i = 1; i <= HALTON_LENGTH; ++i){
    jitterSequence.push(new THREE.Vector2(halton(i, 2) - 0.5, halton(i, 3) - 0.5));
  }

  //Every cloud texture repeats, so the offset into them can wrap without a seam as
  //long as the wrap is a whole number of every tile. Must be a common multiple of
  //CLOUD_SHAPE_TILE (3km) and CLOUD_WEATHER_TILE (60km), each times any value the
  //quantized cloudShapeScale can take (6 / n), and CLOUD_DETAIL_TILE (200m), in
  //cloud-density.glsl. 360km in single precision still resolves to a few centimetres. Wrapping here, in doubles,
  //keeps the float offset on the GPU small -- the wind alone runs to thousands of
  //kilometres over a <sky-cloud-start-seed>.
  const CLOUD_NOISE_WRAP = 360000.0;
  const wrapNoiseOffset = function(x){
    return x - CLOUD_NOISE_WRAP * Math.floor(x / CLOUD_NOISE_WRAP);
  };

  //Clouds are measured from the observer; the planet centre sits this far below.
  //<sky-camera-height> is in kilometres.
  const observerRadius = (atmosphericParameters.radiusOfEarth + atmosphericParameters.cameraHeight) * 1000.0;

  //Halfway up the tag species, which is where most of the visible cloud is, for the
  //temporal reprojection. The bases (as fractions of the start height, the
  //condensation level) and depths must match CLOUD_STRATUS ... CLOUD_CUMULONIMBUS in
  //cloud-density.glsl.
  const SPECIES_BASE_FRACTIONS = [0.4, 0.8, 1.0, 1.0, 1.0];
  const SPECIES_DEPTHS = [400.0, 700.0, 1500.0, 5000.0, 10000.0];
  const cloudSpeciesMidHeight = function(type){
    const s = Math.min(Math.max(type, 0.0), 1.0) * 4.0;
    const i = Math.min(Math.floor(s), 3);
    const f = s - i;
    const base = cloudParams.startHeight * (SPECIES_BASE_FRACTIONS[i] + f * (SPECIES_BASE_FRACTIONS[i + 1] - SPECIES_BASE_FRACTIONS[i]));
    const top = Math.min(base + SPECIES_DEPTHS[i] + f * (SPECIES_DEPTHS[i + 1] - SPECIES_DEPTHS[i]), cloudParams.endHeight);
    return 0.5 * (base + Math.max(top, base));
  };

  const RESOLVE_SIZE = skyDirector.cloudMapSize;
  const MARCH_SIZE = RESOLVE_SIZE / 2;
  const createTarget = function(size){
    const target = new THREE.WebGLRenderTarget(size, size, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      generateMipmaps: false,
      depthBuffer: false,
      stencilBuffer: false
    });
    target.texture.colorSpace = THREE.NoColorSpace;
    return target;
  };
  const marchTarget = createTarget(MARCH_SIZE);
  const resolveTargets = [createTarget(RESOLVE_SIZE), createTarget(RESOLVE_SIZE)];
  let writeIndex = 0;

  //The map every sky pass samples. Starts as an untouched target, which WebGL
  //zero fills -- no clouds -- until the first frame has been marched.
  this.cloudMap = resolveTargets[1].texture;

  const marchMaterial = new THREE.ShaderMaterial({
    uniforms: materials.cloudMarch.uniforms(),
    vertexShader: materials.cloudMarch.vertexShader,
    fragmentShader: materials.cloudMarch.fragmentShader(atmosphereLUTLibrary.atmosphereFunctionsString),
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
    toneMapped: false
  });
  const marchUniforms = marchMaterial.uniforms;
  marchUniforms.mieInscatteringSum.value = atmosphereLUTLibrary.mieScatteringSum;
  marchUniforms.rayleighInscatteringSum.value = atmosphereLUTLibrary.rayleighScatteringSum;
  marchUniforms.transmittance.value = atmosphereLUTLibrary.transmittance;
  const cloudLUTLibrary = skyDirector.cloudLUTLibrary;
  marchUniforms.cloudBaseNoise.value = cloudLUTLibrary.baseNoise;
  marchUniforms.cloudDetailNoise.value = cloudLUTLibrary.detailNoise;
  marchUniforms.cloudWeatherMap.value = cloudLUTLibrary.weatherMap;
  marchUniforms.cloudObserverRadius.value = observerRadius;
  marchUniforms.cloudCoverage.value = cloudParams.coverage;
  marchUniforms.cloudType.value = cloudParams.type;
  marchUniforms.cloudStartHeight.value = cloudParams.startHeight;
  marchUniforms.cloudEndHeight.value = cloudParams.endHeight;
  marchUniforms.numberOfCloudMarchSteps.value = cloudParams.numberOfRayMarchSteps + 0.0;
  marchUniforms.cloudFadeOutStartPercent.value = cloudParams.fadeOutStartPercent;
  marchUniforms.cloudFadeInEndPercent.value = cloudParams.fadeInEndPercent;
  marchUniforms.cloudCutoffDistance.value = cloudParams.cutoffDistance;
  marchUniforms.midCloudCoverage.value = cloudParams.midCoverage;
  marchUniforms.midCloudType.value = cloudParams.midType;
  marchUniforms.midCloudHeight.value = cloudParams.midHeight;
  //The wind in the noise frame (see cloudNoiseOffset in tick), for the mid deck's
  //rows, which line up across it. Straight along x when there is no wind.
  if(cloudParams.velocity.lengthSq() > 0.0){
    marchUniforms.cloudWindDirection.value.set(cloudParams.velocity.x, cloudParams.velocity.y).normalize();
  }
  marchUniforms.cloudMarchTexelSize.value.set(1.0 / MARCH_SIZE, 1.0 / MARCH_SIZE);

  //The mid deck's shadow on the clouds beneath it (cloud-shadow-map.glsl), baked each
  //frame into a map of the ground around the observer. 83m texels, finer than the
  //375m altocumulus cells, and mipmapped so the march can blur it by how far below
  //the deck each sample is. Past the edge of the map, the march falls back to the
  //deck's mean.
  const CLOUD_SHADOW_MAP_SIZE = 768;
  const CLOUD_SHADOW_MAP_EXTENT = 64000.0;
  const shadowMapTarget = new THREE.WebGLRenderTarget(CLOUD_SHADOW_MAP_SIZE, CLOUD_SHADOW_MAP_SIZE, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    generateMipmaps: true,
    depthBuffer: false,
    stencilBuffer: false
  });
  shadowMapTarget.texture.colorSpace = THREE.NoColorSpace;
  const shadowMapMaterial = new THREE.ShaderMaterial({
    uniforms: materials.cloudShadowMap.uniforms(),
    vertexShader: materials.cloudShadowMap.vertexShader,
    fragmentShader: materials.cloudShadowMap.fragmentShader(),
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
    toneMapped: false
  });
  const shadowMapUniforms = shadowMapMaterial.uniforms;
  //The same uniform objects as the march, so the shadows always belong to the clouds
  //being drawn, wind and all.
  ['cloudBaseNoise', 'cloudDetailNoise', 'cloudWeatherMap', 'cloudCoverage', 'cloudType',
  'cloudStartHeight', 'cloudEndHeight', 'cloudFadeInEndPercent', 'cloudFadeOutStartPercent',
  'cloudCutoffDistance', 'cloudObserverRadius', 'cloudNoiseOffset', 'cloudWindDirection',
  'midCloudCoverage', 'midCloudType', 'midCloudHeight'].forEach(function(name){
    shadowMapUniforms[name] = marchUniforms[name];
  });
  shadowMapUniforms.cloudShadowMapExtent.value = CLOUD_SHADOW_MAP_EXTENT;
  marchUniforms.cloudShadowMap.value = shadowMapTarget.texture;
  marchUniforms.cloudShadowMapExtent.value = CLOUD_SHADOW_MAP_EXTENT;
  const bakeShadowMap = cloudParams.midCoverage > 0.0;

  const resolveMaterial = new THREE.ShaderMaterial({
    uniforms: materials.cloudResolve.uniforms(),
    vertexShader: materials.cloudResolve.vertexShader,
    fragmentShader: materials.cloudResolve.fragmentShader,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
    toneMapped: false
  });
  const resolveUniforms = resolveMaterial.uniforms;
  resolveUniforms.cloudMarchMap.value = marchTarget.texture;
  resolveUniforms.cloudMarchSize.value.set(MARCH_SIZE, MARCH_SIZE);
  resolveUniforms.cloudMarchTexelSize.value.set(1.0 / MARCH_SIZE, 1.0 / MARCH_SIZE);
  resolveUniforms.cloudResolveSize.value.set(RESOLVE_SIZE, RESOLVE_SIZE);
  resolveUniforms.cloudReprojectionHeight.value = cloudSpeciesMidHeight(cloudParams.type);
  resolveUniforms.cloudEarthRadius.value = observerRadius;
  resolveUniforms.cloudCutoffDistance.value = cloudParams.cutoffDistance;

  //One quad in clip space, drawn with a bare camera whose matrices are identity.
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), marchMaterial);
  quad.frustumCulled = false;
  scene.add(quad);

  const previousCameraPosition = new THREE.Vector3();
  let previousCloudTime = 0.0;
  let frame = 0;

  const self = this;
  let assetsNotReadyYet = true;
  this.tick = function(t){
    if(assetsNotReadyYet){
      self.firstTick(t);
      return;
    }

    //Same state juggling as the sun and moon targets: never let an offscreen pass
    //render through the XR camera or trigger a shadow map update.
    const initialRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    renderer.xr.enabled = false;
    renderer.shadowMap.autoUpdate = false;

    const jitter = jitterSequence[frame % HALTON_LENGTH];
    const cloudTime = cloudParams.startSeed + t;
    const deltaTime = cloudTime - previousCloudTime;

    //The sky frame is three's world frame with x and z swapped and negated
    //(see vertex.glsl), so that is how the camera is carried into it.
    const cameraPosition = skyDirector.globalCameraPosition;
    const cameraSkyX = -cameraPosition.z;
    const cameraSkyZ = -cameraPosition.x;

    //March
    marchUniforms.sunHorizonFade.value = skyState.sun.horizonFade;
    marchUniforms.moonHorizonFade.value = skyState.moon.horizonFade;
    marchUniforms.scatteringSunIntensity.value = skyState.sun.intensity * atmosphericParameters.solarIntensity / 1367.0;
    marchUniforms.scatteringMoonIntensity.value = skyState.moon.intensity * atmosphericParameters.lunarMaxIntensity / 29.0;
    marchUniforms.cloudJitter.value.copy(jitter);
    marchUniforms.cloudFrame.value = frame % 4096;
    //Where we are over the cloud field: the camera's own position, minus how far the
    //wind has carried the field (velocity * cloudTime / 500 meters, as it always was).
    const windScaleTotal = cloudTime / 500.0;
    marchUniforms.cloudNoiseOffset.value.set(
      wrapNoiseOffset(cameraSkyX - cloudParams.velocity.x * windScaleTotal),
      wrapNoiseOffset(cameraSkyZ - cloudParams.velocity.y * windScaleTotal)
    );

    if(bakeShadowMap){
      quad.material = shadowMapMaterial;
      renderer.setRenderTarget(shadowMapTarget);
      renderer.render(scene, camera);
    }

    quad.material = marchMaterial;
    renderer.setRenderTarget(marchTarget);
    renderer.render(scene, camera);

    //Resolve. A cloud now at P, relative to the camera, was at P - wind * dt
    //in the world last frame, and the camera itself moved -- so relative to last
    //frame's camera it sat at P + (camera motion) - (wind motion). The wind term
    //mirrors the offset in the density functions, velocity * cloudTime / 500.
    const historyUsable = frame > 0 && deltaTime > 0.0 && deltaTime < CLOUD_HISTORY_MAX_GAP_MS;
    const windScale = deltaTime / 500.0;
    resolveUniforms.cloudReprojectionShift.value.set(
      (cameraSkyX - previousCameraPosition.x) - cloudParams.velocity.x * windScale,
      0.0,
      (cameraSkyZ - previousCameraPosition.z) - cloudParams.velocity.y * windScale
    );
    resolveUniforms.cloudJitter.value.copy(jitter);
    resolveUniforms.cloudHistoryBlend.value = historyUsable ? CLOUD_TAA_BLEND : 1.0;
    resolveUniforms.cloudHistoryMap.value = resolveTargets[1 - writeIndex].texture;

    quad.material = resolveMaterial;
    renderer.setRenderTarget(resolveTargets[writeIndex]);
    renderer.render(scene, camera);

    self.cloudMap = resolveTargets[writeIndex].texture;
    writeIndex = 1 - writeIndex;

    previousCameraPosition.set(cameraSkyX, 0.0, cameraSkyZ);
    previousCloudTime = cloudTime;
    ++frame;

    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.setRenderTarget(initialRenderTarget);
  };

  this.firstTick = function(t){
    if(!assetManager.hasLoadedImages){
      return;
    }

    //These are live references into the sky state, so they only need hooking up once.
    marchUniforms.sunPosition.value = skyState.sun.position;
    marchUniforms.moonPosition.value = skyState.moon.position;
    marchUniforms.moonLightColor.value = skyState.moon.lightingModifier;
    shadowMapUniforms.sunPosition.value = skyState.sun.position;
    shadowMapUniforms.moonPosition.value = skyState.moon.position;

    //One fixed tile. The march walks it through time with the golden ratio itself,
    //which averages out far more evenly than hopping between random tiles.
    marchUniforms.blueNoiseTexture.value = assetManager.images.blueNoiseImages[0];

    assetsNotReadyYet = false;
    self.tick(t);
  };
};
