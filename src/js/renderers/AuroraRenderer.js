//Marches the aurora once per frame into a map of the upper hemisphere, indexed by
//direction, and publishes it as this.auroraMap. The sky dome, the moon pass and the
//metering pass all sample that one map instead of each running their own ray
//marcher. It is the same stereographic map as the clouds (see CloudRenderer.js),
//with none of their reprojection: the aurora emits but is never lit, and it hangs
//100km and more overhead, so neither the sun nor the camera moving changes it.
//
//Two passes per frame:
//  curtain -- the shape of every arc along its length, into three 4096 x 1 strips
//             with mipmaps (aurora-curtain.glsl).
//  march   -- each map texel marched through the shell the curtains hang in, at a
//             sub texel Halton offset with a blue noise step jitter that walks in
//             time, and blended into the last frame's map, which ping-pongs between
//             two targets (aurora-march.glsl). Only the aurora's own drift has to
//             get through that history, so a short window is plenty.
StarrySky.Renderers.AuroraRenderer = function(skyDirector){
  const renderer = skyDirector.renderer;
  const assetManager = skyDirector.assetManager;
  const atmosphereLUTLibrary = skyDirector.atmosphereLUTLibrary;
  const auroraParameters = assetManager.data.skyAurora;
  const locationData = assetManager.data.skyLocationData;
  const materials = StarrySky.Materials.Aurora;

  //Weight of the new frame in the history, a window of about 7 frames. The aurora
  //drifts a texel in several seconds, so nothing ghosts; the window only has to
  //swallow the march jitter.
  const AURORA_HISTORY_BLEND = 0.15;

  //A gap longer than this between frames (a backgrounded tab, a debugger pause)
  //means the history no longer describes the sky, so it is thrown away.
  const AURORA_HISTORY_MAX_GAP_MS = 1000.0;

  //Must match AURORA_MAP_K in aurora-march.glsl and atmosphere-pass.glsl, and
  //CLOUD_MAP_K in the cloud shaders: tan(94 degrees / 2).
  const AURORA_MAP_K = 1.0723687100246826;

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

  //The map is stereographic from the nadir, so N / (2 K) texels per radian on the
  //horizon and half that at the zenith. The curtains are sheets a few km thick
  //with crisp folds, so a texel per screen pixel at the horizon.
  const AURORA_MAP_TEXELS_PER_PIXEL = 1.0;
  const AURORA_MAP_MIN_SIZE = 512;
  const AURORA_MAP_MAX_SIZE = 1024;
  const auroraMapTexels = 2.0 * AURORA_MAP_K * skyDirector.pixelsPerRadian * AURORA_MAP_TEXELS_PER_PIXEL;
  const MAP_SIZE = Math.min(Math.max(Math.ceil(auroraMapTexels / 64.0) * 64, AURORA_MAP_MIN_SIZE), AURORA_MAP_MAX_SIZE);

  const createTarget = function(){
    const target = new THREE.WebGLRenderTarget(MAP_SIZE, MAP_SIZE, {
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
  const targets = [createTarget(), createTarget()];

  //The curtains: three strips, one arc per channel, which the march reads with
  //mipmaps. Half floats hold the folds (under ~100km) to a few tens of metres.
  //Must match AURORA_CURTAIN_TEXELS in aurora-march.glsl.
  const AURORA_CURTAIN_TEXELS = 4096;
  const curtainTarget = new THREE.WebGLRenderTarget(AURORA_CURTAIN_TEXELS, 1, {
    count: 3,
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
  curtainTarget.textures.forEach(function(texture){
    texture.colorSpace = THREE.NoColorSpace;
  });
  const curtainMaterial = new THREE.ShaderMaterial({
    uniforms: materials.auroraCurtain.uniforms(),
    vertexShader: materials.auroraCurtain.vertexShader,
    fragmentShader: materials.auroraCurtain.fragmentShader,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
    toneMapped: false
  });
  const curtainUniforms = curtainMaterial.uniforms;

  //The aurora's clock is in seconds, wrapped every ~28 hours so the noise inputs
  //stay small. The wrap is a jump, but not one anybody will sit through.
  const AURORA_TIME_WRAP_SECONDS = 100000.0;
  let writeIndex = 0;

  //The map every sky pass samples. Starts as an untouched target, which WebGL
  //zero fills -- no aurora -- until the first frame has been marched.
  this.auroraMap = targets[1].texture;

  const marchMaterial = new THREE.ShaderMaterial({
    uniforms: materials.auroraMarch.uniforms(),
    vertexShader: materials.auroraMarch.vertexShader,
    fragmentShader: materials.auroraMarch.fragmentShader(atmosphereLUTLibrary.atmosphereFunctionsString),
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
    toneMapped: false
  });
  const uniforms = marchMaterial.uniforms;
  //What each emitter looks like: linear sRGB per kilorayleigh, in units of the
  //luminance of a real moonless sky (22 mag per square arcsecond, 1.712e-4 cd/m2).
  //From the CIE 1931 2 degree observer (colord's CIE1931-2deg-XYZ table) at
  //683 lm/W, with 1 R = 1e10 / (4 pi) photons per m2 per s per sr, taken to
  //linear sRGB and brought into gamut by clipping the negative channels and
  //rescaling to the true luminance, which keeps the lines saturated. One kR of
  //557.7nm comes to 1.93e-4 cd/m2.
  //  prompt -- N2+ 427.8nm, with 3 kR of the N2 first positive bands (654 to
  //            680nm) for each kR of it: the magenta of the lower fringe
  //  green  -- O(1S) 557.7nm
  //  red    -- O(1D) 630.0nm and 636.4nm, 3 to 1
  const PROMPT_EMISSION = new THREE.Vector3(0.46516, 0.0, 0.71160);
  const GREEN_EMISSION = new THREE.Vector3(0.29969, 1.48808, 0.0);
  const RED_EMISSION = new THREE.Vector3(1.17461, 0.0, 0.0);

  //The old per species tags still work, on top of the physics. A colour tag swaps
  //the line's colour for its own at the line's luminance; an intensity tag scales
  //the line by its ratio to the default below. These defaults must match
  //StarrySky.DefaultData.skyAurora in SkyAurora.js. The cutoff tags thresholded
  //the retired caustic texture and do nothing now.
  const DEFAULT_NITROGEN_INTENSITY = 4.0;
  const DEFAULT_MOLECULAR_OXYGEN_INTENSITY = 2.0;
  const DEFAULT_ATOMIC_OXYGEN_INTENSITY = 0.3;
  const BT709 = new THREE.Vector3(0.2126, 0.7152, 0.0722);
  const sRGBToLinear = function(c){
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const emission = function(physical, colorSet, color, intensity, defaultIntensity){
    const result = physical.clone();
    if(colorSet){
      const custom = new THREE.Vector3(sRGBToLinear(color.red / 255.0), sRGBToLinear(color.green / 255.0), sRGBToLinear(color.blue / 255.0));
      const customLuminance = custom.dot(BT709);
      result.copy(customLuminance > 0.0 ? custom.multiplyScalar(physical.dot(BT709) / customLuminance) : custom);
    }
    return result.multiplyScalar(intensity / defaultIntensity);
  };
  //The tags were named for the species as v1 understood them: nitrogen for the
  //pink fringe, molecular oxygen for the green (really atomic, O(1S)), and atomic
  //oxygen for the red.
  uniforms.auroraPromptEmission.value.copy(emission(PROMPT_EMISSION, auroraParameters.nitrogenColorSet, auroraParameters.nitrogenColor, auroraParameters.nitrogenIntensity, DEFAULT_NITROGEN_INTENSITY));
  uniforms.auroraGreenEmission.value.copy(emission(GREEN_EMISSION, auroraParameters.molecularOxygenColorSet, auroraParameters.molecularOxygenColor, auroraParameters.molecularOxygenIntensity, DEFAULT_MOLECULAR_OXYGEN_INTENSITY));
  uniforms.auroraRedEmission.value.copy(emission(RED_EMISSION, auroraParameters.atomicOxygenColorSet, auroraParameters.atomicOxygenColor, auroraParameters.atomicOxygenIntensity, DEFAULT_ATOMIC_OXYGEN_INTENSITY));

  uniforms.numberOfAuroraRaymarchingSteps.value = auroraParameters.raymarchSteps;
  uniforms.auroraMapTexelSize.value.set(1.0 / MAP_SIZE, 1.0 / MAP_SIZE);
  uniforms.auroraFoldMap.value = curtainTarget.textures[0];
  uniforms.auroraBrightnessMap.value = curtainTarget.textures[1];
  uniforms.auroraRayMap.value = curtainTarget.textures[2];

  //Where the curtains hang. <sky-aurora> is a request for an aurora in THIS sky, so
  //the arcs are laid out overhead wherever the sky is, and the storm sets how
  //strong they are rather than where they are. Only their orientation comes from
  //the Earth: curtains run along magnetic east and west, so they are turned to the
  //observer's bearing to the geomagnetic pole of their hemisphere, taking the field
  //as a tilted dipole whose north pole (IGRF-13, 2025) sits here, geographic degrees.
  const GEOMAGNETIC_NORTH_POLE_LATITUDE = 80.7;
  const GEOMAGNETIC_NORTH_POLE_LONGITUDE = -72.7;
  const DEG_2_RAD = Math.PI / 180.0;

  //The arcs: spread across a band this many km wide, centred this far poleward of
  //the zenith, on an oval of this radius, hanging along a field that dips at the
  //angle typical of the auroral zone.
  const ARC_BAND_WIDTH = 600.0;
  const ARC_BAND_CENTRE = 100.0;
  const OVAL_RADIUS = 2500.0;
  const FIELD_DIP_DEGREES = 77.0;
  //Must match AURORA_ARC_FRACTION in aurora-march.glsl: the middle of the four arcs.
  const ARC_FRACTION_MIDDLE = 0.475;

  //What the storm does to the display, all smooth in Kp so that a weather system
  //can blend it. Brightness doubles every two Kp, from a faint quiet arc (a
  //curtain seen from below about 3kR of green at Kp 0) to an overhead display of
  //60kR and more at Kp 9, eleven times Kp 2; Kp 5 sits about where the curtains
  //were tuned before the storm existed. Harder electrons push the lower edge down
  //until the pink fringe shows; great storms add a high red; the arcs fold further,
  //spread wider and move faster.
  const stormBrightness = function(kp){return 0.2 * Math.pow(2.0, 0.5 * kp);};
  const stormEnergy = function(kp){return 0.2 + 0.7 * kp / 9.0;};
  const stormRed = function(kp){return 1.0 + kp * kp / 20.0;};
  const stormFolding = function(kp){return 0.6 + 0.8 * kp / 9.0;};
  const stormSpread = function(kp){return 0.8 + 0.6 * kp / 9.0;};
  const stormSpeed = function(kp){return 0.5 + kp / 6.0;};

  //The aurora's own clock runs faster in a stronger storm. It is integrated one
  //frame at a time, so a change of pace never jumps the curtains; a frame step is
  //capped so a paused tab does not lurch them either.
  const AURORA_MAX_CLOCK_STEP_SECONDS = 0.25;
  let auroraClock = 0.0;

  uniforms.auroraOvalRadius.value = OVAL_RADIUS;
  uniforms.auroraCotDip.value = 1.0 / Math.tan(FIELD_DIP_DEGREES * DEG_2_RAD);

  //Everything here is read afresh every frame -- the observer's position and
  //skyAurora.activity both -- so either can be changed while the sky runs.
  const updateAuroraPlacement = function(){
    const kp = Math.min(Math.max(auroraParameters.activity, 0.0), 9.0);
    const latitude = locationData.latitude * DEG_2_RAD;
    const longitude = locationData.longitude * DEG_2_RAD;
    const poleLatitude = GEOMAGNETIC_NORTH_POLE_LATITUDE * DEG_2_RAD;
    const poleLongitude = GEOMAGNETIC_NORTH_POLE_LONGITUDE * DEG_2_RAD;

    //Which hemisphere's pole: the sign of the geomagnetic latitude.
    const southern = Math.sin(latitude) * Math.sin(poleLatitude) + Math.cos(latitude) * Math.cos(poleLatitude) * Math.cos(longitude - poleLongitude) < 0.0;

    //Poleward is the initial great circle bearing to that pole, clockwise from
    //north. The sky frame has x SOUTH, y up and z west: the frame
    //SkyInterpolator.cpp rotates the sun and moon into (the north celestial pole
    //lands at x = -cos(latitude)), so north is -x and east is -z.
    const targetLatitude = southern ? -poleLatitude : poleLatitude;
    const targetLongitude = southern ? poleLongitude + Math.PI : poleLongitude;
    const deltaLongitude = targetLongitude - longitude;
    const bearing = Math.atan2(
      Math.sin(deltaLongitude) * Math.cos(targetLatitude),
      Math.cos(latitude) * Math.sin(targetLatitude) - Math.sin(latitude) * Math.cos(targetLatitude) * Math.cos(deltaLongitude)
    );
    uniforms.auroraPoleward.value.set(-Math.cos(bearing), -Math.sin(bearing));

    //The band of arcs overhead, widening with the storm about a fixed centre.
    const bandWidth = ARC_BAND_WIDTH * stormSpread(kp);
    uniforms.auroraOvalWidth.value = bandWidth;
    uniforms.auroraOvalOffset.value = ARC_BAND_CENTRE - ARC_FRACTION_MIDDLE * bandWidth;

    uniforms.auroraColumnScale.value = stormBrightness(kp);
    uniforms.auroraEnergy.value = stormEnergy(kp);
    uniforms.auroraRedScale.value = stormRed(kp);
    curtainUniforms.auroraFoldScale.value = stormFolding(kp);
    return kp;
  };

  //One quad in clip space, drawn with a bare camera whose matrices are identity.
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), marchMaterial);
  quad.frustumCulled = false;
  scene.add(quad);

  let previousTickTime = 0.0;
  let frame = 0;

  const self = this;
  let assetsNotReadyYet = true;
  this.tick = function(t){
    if(assetsNotReadyYet){
      self.firstTick(t);
      return;
    }

    //Same state juggling as the cloud map: never let an offscreen pass render
    //through the XR camera or trigger a shadow map update.
    const initialRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    renderer.xr.enabled = false;
    renderer.shadowMap.autoUpdate = false;

    const frameStep = t - previousTickTime;
    const historyUsable = frame > 0 && frameStep > 0.0 && frameStep < AURORA_HISTORY_MAX_GAP_MS;
    const kp = updateAuroraPlacement();
    if(frame > 0 && frameStep > 0.0){
      auroraClock += Math.min(frameStep * 0.001, AURORA_MAX_CLOCK_STEP_SECONDS) * stormSpeed(kp);
      auroraClock %= AURORA_TIME_WRAP_SECONDS;
    }

    //Curtains first; the march reads them.
    curtainUniforms.auroraTime.value = auroraClock;
    quad.material = curtainMaterial;
    renderer.setRenderTarget(curtainTarget);
    renderer.render(scene, camera);

    uniforms.auroraJitter.value.copy(jitterSequence[frame % HALTON_LENGTH]);
    uniforms.auroraFrame.value = frame % 4096;
    uniforms.auroraHistoryBlend.value = historyUsable ? AURORA_HISTORY_BLEND : 1.0;
    uniforms.auroraHistoryMap.value = targets[1 - writeIndex].texture;

    quad.material = marchMaterial;
    renderer.setRenderTarget(targets[writeIndex]);
    renderer.render(scene, camera);

    self.auroraMap = targets[writeIndex].texture;
    writeIndex = 1 - writeIndex;

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

    //One fixed tile, walked through time by the golden ratio in the march.
    uniforms.blueNoiseTexture.value = assetManager.images.blueNoiseImages[0];

    assetsNotReadyYet = false;
    self.tick(t);
  };
};
