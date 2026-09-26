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
  const CLOUD_TAA_BLEND = 0.30;

  //A gap longer than this between frames (a backgrounded tab, a debugger pause)
  //means the history no longer describes the sky, so it is thrown away.
  const CLOUD_HISTORY_MAX_GAP_MS = 1000.0;

  //The wind carries the clouds by a smoothed frame step, not by the wall clock. A frame
  //time that straddles the display's refresh lands frames at one and two refreshes at
  //random, so on the wall clock the clouds lurched by one step or two -- and the history,
  //lagging behind each lurch, smeared it into a jiggle. Nobody can tell the clouds drift
  //a few percent slow or fast; everybody can tell when they judder. Weight of the latest
  //frame in the running mean: about a third of a second to follow a real change of pace.
  const CLOUD_TIME_SMOOTHING = 0.05;

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
  //The mid deck's depths, altocumulus and altostratus: MID_CLOUD_DEPTH in cloud-density.glsl.
  const MID_CLOUD_DEPTHS = [250.0, 1500.0];
  const cloudSpeciesMidHeight = function(type){
    const s = Math.min(Math.max(type, 0.0), 1.0) * 4.0;
    const i = Math.min(Math.floor(s), 3);
    const f = s - i;
    const base = cloudParams.startHeight * (SPECIES_BASE_FRACTIONS[i] + f * (SPECIES_BASE_FRACTIONS[i + 1] - SPECIES_BASE_FRACTIONS[i]));
    const top = Math.min(base + SPECIES_DEPTHS[i] + f * (SPECIES_DEPTHS[i + 1] - SPECIES_DEPTHS[i]), cloudParams.endHeight);
    return 0.5 * (base + Math.max(top, base));
  };

  //Checkerboard march: each frame marches half of the march map's texels, alternating,
  //and the resolve fills in the rest from the neighbours and the history. Lighting is
  //nearly all of the cloud cost, so this about halves it, for an effective history
  //twice as long. The parity walks against the jitter: plain alternation, with an
  //even jitter sequence, would pair each jitter offset with the same half forever,
  //and some sample positions would never be visited.
  const CLOUD_CHECKERBOARD = true;
  const checkerboardParity = function(frame){
    return (frame ^ Math.floor(frame / HALTON_LENGTH)) & 1;
  };

  const RESOLVE_SIZE = skyDirector.cloudMapSize;
  const MARCH_SIZE = RESOLVE_SIZE / 2;
  const createTarget = function(size, count = 1){
    const target = new THREE.WebGLRenderTarget(size, size, {
      count: count,
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
    target.textures.forEach(function(texture){
      texture.colorSpace = THREE.NoColorSpace;
    });
    return target;
  };
  //The march writes two maps: the clouds, and how far away they are, for the resolve
  //to reproject by. Nearest filtering on the depth: blending a cloud's depth with the
  //0 of the clear sky beside it would put its edge anywhere in between.
  const marchTarget = createTarget(MARCH_SIZE, 2);
  if(CLOUD_CHECKERBOARD){
    marchTarget.setSize(MARCH_SIZE / 2, MARCH_SIZE);
  }
  marchTarget.textures[1].minFilter = THREE.NearestFilter;
  marchTarget.textures[1].magFilter = THREE.NearestFilter;
  //Sky light for the clouds and the ground under them (cloudMeanSkyRadiance in
  //cloud-march.glsl): three texels, the mean radiance of the clear sky, of the sky
  //with the mid deck, and of everything; and the small map of the mid deck alone that
  //the second is taken from.
  const ambientTarget = createTarget(1);
  ambientTarget.setSize(3, 1);
  ambientTarget.texture.minFilter = THREE.NearestFilter;
  ambientTarget.texture.magFilter = THREE.NearestFilter;
  const midSkyTarget = createTarget(32);
  const resolveTargets = [createTarget(RESOLVE_SIZE), createTarget(RESOLVE_SIZE)];
  let writeIndex = 0;

  //The map every sky pass samples. Starts as an untouched target, which WebGL
  //zero fills -- no clouds -- until the first frame has been marched.
  this.cloudMap = resolveTargets[1].texture;

  //Three builds of the march, sharing one set of uniforms: sun only, moon only, and
  //both for twilight (CLOUD_SUN_LIGHT / CLOUD_MOON_LIGHT in cloud-march.glsl). Carrying
  //the moon's lighting through the day cost a quarter of the frame even while it was
  //skipped. All three are compiled on the first tick, so switching never stalls.
  const marchUniforms = materials.cloudMarch.uniforms();
  const marchFragmentShader = materials.cloudMarch.fragmentShader(atmosphereLUTLibrary.atmosphereFunctionsString);
  const createMarchMaterial = function(defines){
    return new THREE.ShaderMaterial({
      uniforms: marchUniforms,
      defines: defines,
      vertexShader: materials.cloudMarch.vertexShader,
      fragmentShader: marchFragmentShader,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
      toneMapped: false
    });
  };
  const marchMaterials = {
    sun: createMarchMaterial({CLOUD_SUN_LIGHT: ''}),
    moon: createMarchMaterial({CLOUD_MOON_LIGHT: ''}),
    both: createMarchMaterial({CLOUD_SUN_LIGHT: '', CLOUD_MOON_LIGHT: ''})
  };
  let marchMaterial = marchMaterials.both;
  //A light reaches the clouds while its height plus the horizon dip of the highest deck
  //is above -0.1 (sunCloudFade and moonCloudFade in cloud-march.glsl); the dip is under 0.06 even for a
  //deck 7km up.
  const LIGHT_REACHES_CLOUDS_Y = -0.16;
  const selectMarchMaterial = function(){
    const sunLights = skyState.sun.position.y > LIGHT_REACHES_CLOUDS_Y;
    const moonLights = skyState.moon.position.y > LIGHT_REACHES_CLOUDS_Y;
    if(sunLights && moonLights){
      return marchMaterials.both;
    }
    return moonLights ? marchMaterials.moon : marchMaterials.sun;
  };
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
  //The ground the clouds bounce light off is the ground the scene says it has, in the
  //same linear form LightingManager lights the scene with.
  const groundColor = assetManager.data.skyLighting.groundColor;
  marchUniforms.cloudGroundAlbedo.value.set(
    Math.pow(groundColor.red / 255.0, 2.2),
    Math.pow(groundColor.green / 255.0, 2.2),
    Math.pow(groundColor.blue / 255.0, 2.2)
  );
  //The wind in the noise frame (see cloudNoiseOffset in tick), for the mid deck's
  //rows, which line up across it. Straight along x when there is no wind.
  if(cloudParams.velocity.lengthSq() > 0.0){
    marchUniforms.cloudWindDirection.value.set(cloudParams.velocity.x, cloudParams.velocity.y).normalize();
  }
  marchUniforms.cloudMarchTexelSize.value.set(1.0 / MARCH_SIZE, 1.0 / MARCH_SIZE);

  //The mid deck's shadow on the clouds beneath it (cloud-shadow-map.glsl), baked each
  //frame into a map of the ground around the observer, and mipmapped so the march can
  //blur it by how far below the deck each sample is. Past the edge of the map, the
  //march falls back to the deck's mean.
  //
  //A low cloud looks up its light to where that light crosses the deck, which is its
  //drop below the deck over the light's elevation away: 40km and more at sunset, off
  //the edge of a fixed map. So the map spans that reach for the lowest cloud, from
  //64km (83m texels, finer than the 375m altocumulus cells) with a high light, to
  //240km at the horizon, where a grazing beam averages over many cells anyway.
  const CLOUD_SHADOW_MAP_SIZE = 768;
  const CLOUD_SHADOW_MAP_MIN_EXTENT = 64000.0;
  const CLOUD_SHADOW_MAP_MAX_EXTENT = 240000.0;
  const shadowMapDeckMiddle = cloudParams.midHeight + 0.5 * (MID_CLOUD_DEPTHS[0] + cloudParams.midType * (MID_CLOUD_DEPTHS[1] - MID_CLOUD_DEPTHS[0]));
  const shadowMapExtent = function(){
    //The lower of the lights that are up; the map serves both.
    let lightY = 1.0;
    if(skyState.sun.position.y > -0.1){
      lightY = Math.min(lightY, skyState.sun.position.y);
    }
    if(skyState.moon.position.y > -0.1){
      lightY = Math.min(lightY, skyState.moon.position.y);
    }
    const reach = 2.2 * shadowMapDeckMiddle / Math.max(lightY, 0.05);
    return Math.min(Math.max(reach, CLOUD_SHADOW_MAP_MIN_EXTENT), CLOUD_SHADOW_MAP_MAX_EXTENT);
  };
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
  marchUniforms.cloudShadowMap.value = shadowMapTarget.texture;
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
  resolveUniforms.cloudMarchDepth.value = marchTarget.textures[1];
  resolveUniforms.cloudMarchSize.value.set(MARCH_SIZE, MARCH_SIZE);
  resolveUniforms.cloudMarchTexelSize.value.set(1.0 / MARCH_SIZE, 1.0 / MARCH_SIZE);
  resolveUniforms.cloudResolveSize.value.set(RESOLVE_SIZE, RESOLVE_SIZE);
  resolveUniforms.cloudReprojectionHeight.value = cloudSpeciesMidHeight(cloudParams.type);
  resolveUniforms.cloudMidReprojectionHeight.value = shadowMapDeckMiddle;
  resolveUniforms.cloudMidSplitHeight.value = cloudParams.midCoverage > 0.0 ? cloudParams.midHeight : 1e9;
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
  let previousTickTime = 0.0;
  let smoothedFrameStep = 1000.0 / 60.0;
  let cloudClock = 0.0;
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
    const frameStep = t - previousTickTime;
    const frameStepUsable = frame > 0 && frameStep > 0.0 && frameStep < CLOUD_HISTORY_MAX_GAP_MS;
    if(frameStepUsable){
      smoothedFrameStep += (frameStep - smoothedFrameStep) * CLOUD_TIME_SMOOTHING;
      cloudClock += smoothedFrameStep;
    }
    const cloudTime = cloudParams.startSeed + cloudClock;
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
    const parity = CLOUD_CHECKERBOARD ? checkerboardParity(frame) : -1;
    //Where we are over the cloud field: the camera's own position, minus how far the
    //wind has carried the field (velocity * cloudTime / 500 meters, as it always was).
    const windScaleTotal = cloudTime / 500.0;
    marchUniforms.cloudNoiseOffset.value.set(
      wrapNoiseOffset(cameraSkyX - cloudParams.velocity.x * windScaleTotal),
      wrapNoiseOffset(cameraSkyZ - cloudParams.velocity.y * windScaleTotal)
    );

    if(bakeShadowMap){
      const extent = shadowMapExtent();
      shadowMapUniforms.cloudShadowMapExtent.value = extent;
      marchUniforms.cloudShadowMapExtent.value = extent;
      quad.material = shadowMapMaterial;
      renderer.setRenderTarget(shadowMapTarget);
      renderer.render(scene, camera);
    }

    marchMaterial = selectMarchMaterial();

    //Sky light first, from the last frame's maps; then the mid deck alone, for next
    //frame's sky light; then the march itself. No pass may have its own target bound
    //as a texture, even unread -- WebGL refuses the draw as a feedback loop.
    quad.material = marchMaterial;
    marchUniforms.cloudPreviousMap.value = self.cloudMap;
    marchUniforms.cloudMidSkyMap.value = midSkyTarget.texture;
    marchUniforms.cloudAmbientMap.value = null;
    marchUniforms.cloudAmbientPass.value = true;
    renderer.setRenderTarget(ambientTarget);
    renderer.render(scene, camera);
    marchUniforms.cloudAmbientPass.value = false;
    marchUniforms.cloudAmbientMap.value = ambientTarget.texture;

    if(cloudParams.midCoverage > 0.0){
      marchUniforms.cloudMidSkyPass.value = true;
      marchUniforms.cloudMidSkyMap.value = null;
      renderer.setRenderTarget(midSkyTarget);
      renderer.render(scene, camera);
      marchUniforms.cloudMidSkyPass.value = false;
    }

    marchUniforms.cloudCheckerboardParity.value = parity;
    renderer.setRenderTarget(marchTarget);
    renderer.render(scene, camera);
    marchUniforms.cloudCheckerboardParity.value = -1;

    //Resolve. A cloud now at P, relative to the camera, was at P - wind * dt
    //in the world last frame, and the camera itself moved -- so relative to last
    //frame's camera it sat at P + (camera motion) - (wind motion). The wind term
    //mirrors the offset in the density functions, velocity * cloudTime / 500.
    const historyUsable = frameStepUsable;
    const windScale = deltaTime / 500.0;
    resolveUniforms.cloudReprojectionShift.value.set(
      (cameraSkyX - previousCameraPosition.x) - cloudParams.velocity.x * windScale,
      0.0,
      (cameraSkyZ - previousCameraPosition.z) - cloudParams.velocity.y * windScale
    );
    resolveUniforms.cloudJitter.value.copy(jitter);
    resolveUniforms.cloudCheckerboardParity.value = parity;
    resolveUniforms.cloudHistoryBlend.value = historyUsable ? CLOUD_TAA_BLEND : 1.0;
    resolveUniforms.cloudHistoryMap.value = resolveTargets[1 - writeIndex].texture;

    quad.material = resolveMaterial;
    renderer.setRenderTarget(resolveTargets[writeIndex]);
    renderer.render(scene, camera);

    self.cloudMap = resolveTargets[writeIndex].texture;
    writeIndex = 1 - writeIndex;

    previousCameraPosition.set(cameraSkyX, 0.0, cameraSkyZ);
    previousCloudTime = cloudTime;
    previousTickTime = t;
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

    //Compile every build of the march now, on a cheap one texel draw each, so the
    //switch at dawn and dusk does not stall a frame.
    const initialRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    renderer.xr.enabled = false;
    renderer.shadowMap.autoUpdate = false;
    marchUniforms.cloudAmbientPass.value = true;
    [marchMaterials.sun, marchMaterials.moon, marchMaterials.both].forEach(function(material){
      quad.material = material;
      renderer.setRenderTarget(ambientTarget);
      renderer.render(scene, camera);
    });
    marchUniforms.cloudAmbientPass.value = false;
    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.setRenderTarget(initialRenderTarget);

    assetsNotReadyYet = false;
    self.tick(t);
  };
};
