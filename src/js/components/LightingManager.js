//The lighting for our scene contains 3 hemispherical lights and 1 directional light
//with shadows enabled. The shadow enabled directional light is shared between the sun
//and the moon in order to reduce the rendering load.
StarrySky.LightingManager = function(skyDirector){
  const RADIUS_OF_SKY = 5000.0;
  const lightingData = skyDirector.assetManager.data.skyLighting;
  const skyState = skyDirector.skyState;
  const sunRenderer = skyDirector.renderers.sunRenderer;
  const lunarEclipseLightingModifier = skyState.moon.lightingModifier;
  this.sourceLight = new THREE.DirectionalLight(0xffffff, 4.0);
  const shadow = this.sourceLight.shadow;
  this.sourceLight.castShadow = true;
  shadow.mapSize.width = lightingData.shadowCameraResolution;
  shadow.mapSize.height = lightingData.shadowCameraResolution;
  shadow.camera.near = 128.0;
  shadow.camera.far = RADIUS_OF_SKY * 2.0;
  const directLightingCameraSize = lightingData.shadowCameraSize;
  shadow.camera.left = -directLightingCameraSize;
  shadow.camera.right = directLightingCameraSize;
  shadow.camera.bottom = -directLightingCameraSize;
  shadow.camera.top = directLightingCameraSize;
  this.sourceLight.target = skyDirector.camera;
  this.fogColorVector = new THREE.Color();
  this.xAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 1.0);
  this.yAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 1.0);
  this.zAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 1.0);
  this.xAxisHemisphericalLight.position.set(1,0,0);
  this.yAxisHemisphericalLight.position.set(0,1,0);
  this.zAxisHemisphericalLight.position.set(0,0,1);
  const isNormalLighting = lightingData.atmosphericPerspectiveType === 'normal';
  let maxFogDensity;
  if(isNormalLighting){
    maxFogDensity = lightingData.atmosphericPerspectiveDensity;
    this.fog = new THREE.FogExp2(0xFFFFFF, maxFogDensity);
    skyDirector.scene.fog = this.fog;
  }

  const scene = skyDirector.scene;
  scene.add(this.sourceLight);
  scene.add(this.xAxisHemisphericalLight);
  scene.add(this.yAxisHemisphericalLight);
  scene.add(this.zAxisHemisphericalLight);
  this.cameraRef = skyDirector.camera;
  const self = this;
  StarrySky.Methods.getDominantLightColor = function(){
    return self.sourceLight.color;
  };
  StarrySky.Methods.getDominantLightIntensity = function(){
    return self.sourceLight.intensity;
  }
  StarrySky.Methods.getAmbientLights = function(){
    return {
      x: self.xAxisHemisphericalLight,
      y: self.yAxisHemisphericalLight,
      z: self.zAxisHemisphericalLight
    };
  }

  // ===========================================================================
  // Ambient LUT path (replaces per-frame metering survey + worker pipeline).
  // Flip useAmbientLUT to false to fall back to the worker-driven lightingState[]
  // path (kept fully functional below).
  // ===========================================================================
  this.useAmbientLUT = true;

  const meteringSurveyRenderer = skyDirector.renderers.meteringSurveyRenderer;
  const meteringSize = meteringSurveyRenderer.meteringSurveyTextureSize;
  const numPixels = meteringSize * meteringSize;
  const renderer = skyDirector.renderer;
  const transmittanceLUT = skyDirector.atmosphereLUTLibrary.transmittanceFloat32ArrayCopy;
  const transmittanceTextureSize = skyDirector.atmosphereLUTLibrary.transmittanceTextureSize;

  // Per-pixel direction & weight setup - port of C++ initializeMeteringAndLightingDependencies.
  const pixelDirections = new Float32Array(numPixels * 3);
  const pixelWeights = new Float32Array(numPixels);
  const sumOfDirWeights = [0, 0, 0, 0, 0, 0];
  let sumOfPixelWeights = 0;
  const halfSize = meteringSize * 0.5;
  for(let i = 0; i < numPixels; ++i){
    const x = ((i % meteringSize) - halfSize) / halfSize;
    const y = (Math.floor(i / meteringSize) - halfSize) / halfSize;
    const rho2 = x*x + y*y;
    if(rho2 < 1.0){
      const rho = Math.sqrt(rho2);
      const height = Math.sqrt(1 - rho2);
      const phi = Math.PI * 0.5 - Math.atan2(height, rho);
      const theta = Math.atan2(y, x);
      let x3 = Math.sin(phi) * Math.cos(theta);
      let z3 = Math.sin(phi) * Math.sin(theta);
      let y3 = Math.cos(phi);
      const norm = 1.0 / Math.sqrt(x3*x3 + y3*y3 + z3*z3);
      x3 *= norm; y3 *= norm; z3 *= norm;
      pixelDirections[i*3]   = x3;
      pixelDirections[i*3+1] = y3;
      pixelDirections[i*3+2] = z3;
      pixelWeights[i] = 1.0;
      sumOfPixelWeights += 1;
      sumOfDirWeights[0] += Math.max(x3, 0);
      sumOfDirWeights[1] += Math.max(y3, 0);
      sumOfDirWeights[2] += Math.max(z3, 0);
      sumOfDirWeights[3] += Math.max(-x3, 0);
      sumOfDirWeights[4] += Math.max(-y3, 0);
      sumOfDirWeights[5] += Math.max(-z3, 0);
    }
  }
  const oneOverSumOfDirWeights = sumOfDirWeights.map(w => 1.0 / Math.max(w, 1e-9));
  const oneOverSumOfPixelWeights = 1.0 / Math.max(sumOfPixelWeights, 1);

  // Project a 64*64 RGBA sky buffer into 9 spherical-harmonic coefficients * RGB
  // (#24-lite - replaces the 6-hemi-direct projection with an SH9 representation
  // that interpolates more smoothly between LUT samples; at runtime we still drive
  // 3 hemi lights, but the colors come from a cosine-convolved SH evaluation at the
  // cardinal axes). Plus average sky color (3 floats, for normal-mode fog) and
  // log-luminance magnitude (1 float). 31 floats per LUT entry.
  function project(skyPixels, lutOut, lutOffset){
    // 9 SH coefs * RGB = 27 floats. Order: Y00, Y1m1, Y10, Y11, Y2m2, Y2m1, Y20, Y21, Y22.
    const sh = new Array(27).fill(0);
    let avgR = 0, avgG = 0, avgB = 0;
    let logAvg = 0;
    const logBase2Factor = 1.0 / Math.log(5.0);
    for(let i = 0; i < numPixels; ++i){
      if(pixelWeights[i] === 0) continue;
      const i4 = i * 4;
      const i3 = i * 3;
      const dx = pixelDirections[i3];
      const dy = pixelDirections[i3+1];
      const dz = pixelDirections[i3+2];
      // Survey output is sRGB-encoded RGB + linear luminance alpha.
      const r = Math.pow(Math.max(skyPixels[i4],     0), 2.2);
      const g = Math.pow(Math.max(skyPixels[i4 + 1], 0), 2.2);
      const b = Math.pow(Math.max(skyPixels[i4 + 2], 0), 2.2);
      const a = skyPixels[i4 + 3];

      // Real spherical harmonics basis values at this direction. Coefficients from
      // standard L=0..2 normalized SH (Sloan 2008 "Stupid SH Tricks", positive sign
      // convention - we use the same signs at projection and reconstruction so any
      // sign flips cancel out).
      const y00  = 0.282095;
      const y1m1 = 0.488603 * dy;
      const y10  = 0.488603 * dz;
      const y11  = 0.488603 * dx;
      const y2m2 = 1.092548 * dx * dy;
      const y2m1 = 1.092548 * dy * dz;
      const y20  = 0.315392 * (3 * dz * dz - 1);
      const y21  = 1.092548 * dx * dz;
      const y22  = 0.546274 * (dx * dx - dy * dy);

      sh[0]  += y00  * r; sh[1]  += y00  * g; sh[2]  += y00  * b;
      sh[3]  += y1m1 * r; sh[4]  += y1m1 * g; sh[5]  += y1m1 * b;
      sh[6]  += y10  * r; sh[7]  += y10  * g; sh[8]  += y10  * b;
      sh[9]  += y11  * r; sh[10] += y11  * g; sh[11] += y11  * b;
      sh[12] += y2m2 * r; sh[13] += y2m2 * g; sh[14] += y2m2 * b;
      sh[15] += y2m1 * r; sh[16] += y2m1 * g; sh[17] += y2m1 * b;
      sh[18] += y20  * r; sh[19] += y20  * g; sh[20] += y20  * b;
      sh[21] += y21  * r; sh[22] += y21  * g; sh[23] += y21  * b;
      sh[24] += y22  * r; sh[25] += y22  * g; sh[26] += y22  * b;

      avgR += r; avgG += g; avgB += b;
      logAvg += Math.log((a + 1e-9) / 0.125) * logBase2Factor;
    }
    for(let k = 0; k < 27; ++k) sh[k] *= oneOverSumOfPixelWeights;
    avgR  *= oneOverSumOfPixelWeights;
    avgG  *= oneOverSumOfPixelWeights;
    avgB  *= oneOverSumOfPixelWeights;
    logAvg *= oneOverSumOfPixelWeights;

    for(let k = 0; k < 27; ++k) lutOut[lutOffset + k] = sh[k];
    lutOut[lutOffset + 27] = avgR;
    lutOut[lutOffset + 28] = avgG;
    lutOut[lutOffset + 29] = avgB;
    lutOut[lutOffset + 30] = 0.2 * Math.pow(Math.max(logAvg, 0), 2.4);
  }

  // Evaluate cosine-convolved SH at unit vector (nx, ny, nz). Per-band weights
  // A_l from Ramamoorthi-Hanrahan 2001 (irradiance environment maps). Returns
  // RGB into outRGB. SH coefs are read from `sh` starting at `offset`.
  function evalSHHemi(sh, offset, nx, ny, nz, outRGB){
    const A0 = 3.141592653589793;
    const A1 = 2.0943951023931953;
    const A2 = 0.7853981633974483;
    const w0   = A0 * 0.282095;
    const w1m1 = A1 * 0.488603 * ny;
    const w10  = A1 * 0.488603 * nz;
    const w11  = A1 * 0.488603 * nx;
    const w2m2 = A2 * 1.092548 * nx * ny;
    const w2m1 = A2 * 1.092548 * ny * nz;
    const w20  = A2 * 0.315392 * (3 * nz * nz - 1);
    const w21  = A2 * 1.092548 * nx * nz;
    const w22  = A2 * 0.546274 * (nx * nx - ny * ny);
    const ws = [w0, w1m1, w10, w11, w2m2, w2m1, w20, w21, w22];
    let r = 0, g = 0, b = 0;
    for(let k = 0; k < 9; ++k){
      r += ws[k] * sh[offset + k*3];
      g += ws[k] * sh[offset + k*3 + 1];
      b += ws[k] * sh[offset + k*3 + 2];
    }
    outRGB[0] = Math.max(r, 0);
    outRGB[1] = Math.max(g, 0);
    outRGB[2] = Math.max(b, 0);
  }

  // ----- Bake the LUTs --------------------------------------------------------
  const N_LUT = 32;
  // 27 SH * RGB + 3 fogColor RGB + 1 magnitude = 31 floats per LUT entry.
  const STRIDE = 31;
  // cos(zenith) range: above horizon (1.0) down to ~12deg below (-0.21).
  const LUT_COSZ_MIN = -0.21;
  const LUT_COSZ_MAX =  1.0;
  const sunAmbientLUT  = new Float32Array(N_LUT * STRIDE);
  const moonAmbientLUT = new Float32Array(N_LUT * STRIDE);
  const tempBuffer = new Float32Array(numPixels * 4);

  // Snapshot uniforms we'll temporarily clobber.
  const meteringUniforms = meteringSurveyRenderer.meteringSurveyVar.material.uniforms;
  const _saved = {
    sunPosition: meteringUniforms.sunPosition.value,
    moonPosition: meteringUniforms.moonPosition.value,
    sunHorizonFade: meteringUniforms.sunHorizonFade.value,
    moonHorizonFade: meteringUniforms.moonHorizonFade.value,
    scatteringSunIntensity: meteringUniforms.scatteringSunIntensity.value,
    scatteringMoonIntensity: meteringUniforms.scatteringMoonIntensity.value,
    sunLuminosity: meteringUniforms.sunLuminosity.value,
    moonLuminosity: meteringUniforms.moonLuminosity.value,
    starsExposure: meteringUniforms.starsExposure.value,
    moonLightColor: meteringUniforms.moonLightColor.value,
  };
  // The metering shader multiplies moon scattering by moonLightColor (= the WASM's
  // skyState.moon.lightingModifier). The WASM appears to leave that at the eclipse-base
  // (1, 0.5, 0.1) outside an eclipse, which would gild the entire moon-LUT bake. Force
  // it to neutral white during bake so the LUT captures the spectral character of moon
  // scattering only, without the eclipse-formula bias.
  const neutralMoonColor = new THREE.Vector3(1, 1, 1);

  // Peak intensity values matching what the live system uses near zenith.
  const PEAK_SCAT_SUN = 10.0;
  const PEAK_SUN_LUM = 100000.0;
  const PEAK_SCAT_MOON = 0.5;
  const PEAK_MOON_LUM = 100.0;

  const sunPosScratch = new THREE.Vector3();
  const moonPosScratch = new THREE.Vector3();
  const farBelow = new THREE.Vector3(0, -1, 0);

  function horizonFade(cosZ){
    // Smooth fade - full above ~+5deg, zero below ~-3deg. Roughly matches the
    // analytic shape used by the WASM live state.
    return Math.max(0, Math.min(1, 0.5 + 6.0 * cosZ));
  }

  function bakeOne(lut, isSunLut){
    for(let i = 0; i < N_LUT; ++i){
      const t = i / (N_LUT - 1);
      const cosZ = LUT_COSZ_MIN + (LUT_COSZ_MAX - LUT_COSZ_MIN) * t;
      const sinZ = Math.sqrt(Math.max(1 - cosZ*cosZ, 0));
      const fade = horizonFade(cosZ);
      // The metering shader computes alpha as `lunarPass*(moonLum/scatMoon) + solarPass*(sunLum/scatSun)`.
      // Setting either denominator to 0 produces NaN even though the numerator is also 0,
      // so we use a tiny non-zero value for the "off" source - its contribution stays
      // negligible but the divide is well-defined.
      const TINY = 1e-9;
      if(isSunLut){
        sunPosScratch.set(sinZ, cosZ, 0).normalize();
        meteringUniforms.sunPosition.value = sunPosScratch;
        meteringUniforms.moonPosition.value = farBelow;
        meteringUniforms.sunHorizonFade.value = fade;
        meteringUniforms.moonHorizonFade.value = 0.0;
        meteringUniforms.scatteringSunIntensity.value = PEAK_SCAT_SUN;
        meteringUniforms.scatteringMoonIntensity.value = TINY;
        meteringUniforms.sunLuminosity.value = PEAK_SUN_LUM;
        meteringUniforms.moonLuminosity.value = 0.0;
      } else {
        moonPosScratch.set(sinZ, cosZ, 0).normalize();
        meteringUniforms.sunPosition.value = farBelow;
        meteringUniforms.moonPosition.value = moonPosScratch;
        meteringUniforms.sunHorizonFade.value = 0.0;
        meteringUniforms.moonHorizonFade.value = fade;
        meteringUniforms.scatteringSunIntensity.value = TINY;
        meteringUniforms.scatteringMoonIntensity.value = PEAK_SCAT_MOON;
        meteringUniforms.sunLuminosity.value = 0.0;
        meteringUniforms.moonLuminosity.value = PEAK_MOON_LUM;
      }
      meteringUniforms.starsExposure.value = 0.0;
      meteringUniforms.moonLightColor.value = neutralMoonColor;

      meteringSurveyRenderer.meteringSurveyRenderer.compute();
      const rt = meteringSurveyRenderer.meteringSurveyRenderer.getCurrentRenderTarget(meteringSurveyRenderer.meteringSurveyVar);
      renderer.readRenderTargetPixels(rt, 0, 0, meteringSize, meteringSize, tempBuffer);
      project(tempBuffer, lut, i * STRIDE);
    }
  }

  bakeOne(sunAmbientLUT, true);
  bakeOne(moonAmbientLUT, false);

  // Restore the live uniforms so the next worker-driven render isn't disturbed.
  meteringUniforms.sunPosition.value = _saved.sunPosition;
  meteringUniforms.moonPosition.value = _saved.moonPosition;
  meteringUniforms.sunHorizonFade.value = _saved.sunHorizonFade;
  meteringUniforms.moonHorizonFade.value = _saved.moonHorizonFade;
  meteringUniforms.scatteringSunIntensity.value = _saved.scatteringSunIntensity;
  meteringUniforms.scatteringMoonIntensity.value = _saved.scatteringMoonIntensity;
  meteringUniforms.sunLuminosity.value = _saved.sunLuminosity;
  meteringUniforms.moonLuminosity.value = _saved.moonLuminosity;
  meteringUniforms.starsExposure.value = _saved.starsExposure;
  meteringUniforms.moonLightColor.value = _saved.moonLightColor;

  // Pre-computed groundColor in linear space (pow 2.2). Used at runtime to bias
  // the X/Z/Y- hemis (matches what the C++ does to those four hemis).
  const groundColorRaw = lightingData.groundColor;
  const groundColorLinear = [
    Math.pow(groundColorRaw.red   / 255.0, 2.2),
    Math.pow(groundColorRaw.green / 255.0, 2.2),
    Math.pow(groundColorRaw.blue  / 255.0, 2.2),
  ];

  // Sample one LUT into 22 floats with linear interp. Out array must have >=22 slots.
  function sampleLUT(lut, cosZ, out){
    let t = (cosZ - LUT_COSZ_MIN) / (LUT_COSZ_MAX - LUT_COSZ_MIN);
    if(t <= 0){ for(let k = 0; k < STRIDE; ++k) out[k] = lut[k]; return; }
    if(t >= 1){ const off = (N_LUT - 1) * STRIDE; for(let k = 0; k < STRIDE; ++k) out[k] = lut[off + k]; return; }
    const f = t * (N_LUT - 1);
    const i0 = Math.floor(f);
    const i1 = i0 + 1;
    const a = f - i0;
    const o0 = i0 * STRIDE;
    const o1 = i1 * STRIDE;
    for(let k = 0; k < STRIDE; ++k){
      out[k] = lut[o0 + k] * (1 - a) + lut[o1 + k] * a;
    }
  }

  // Bilinear transmittance LUT lookup - used to color the dominant directional light.
  // Note: row 0 of the LUT is all zeros because transmittance.glsl's intersectsSphere
  // treats rays from exactly the earth's surface as tangent-intersecting. The atmosphere
  // shader's runtime path always adds the camera's world Y (in km) so it never lands on
  // row 0 - we need to do the same here, plus a row floor as belt-and-braces.
  function sampleTransmittance(cosZ, cameraHeight, outRGB){
    const earthR = skyDirector.assetManager.data.skyAtmosphericParameters.radiusOfEarth;
    const atmH = skyDirector.assetManager.data.skyAtmosphericParameters.atmosphereHeight;
    const cameraWorldKm = skyDirector.camera.position.y * 0.001;
    const totalHeight = Math.max(cameraHeight + cameraWorldKm, 0);
    const r = earthR + totalHeight;
    const earthR2 = earthR * earthR;
    const atmR2MinusEarthR2 = (earthR + atmH) * (earthR + atmH) - earthR2;
    const xPos = 0.5 * (1.0 + cosZ) * (transmittanceTextureSize - 1);
    let yPos = Math.sqrt(Math.max((r*r - earthR2) / atmR2MinusEarthR2, 0)) * (transmittanceTextureSize - 1);
    if(yPos < 1.0) yPos = 1.0;  // skip the zeroed row 0
    const xL = Math.max(0, Math.floor(xPos));
    const xR = Math.min(transmittanceTextureSize - 1, xL + 1);
    const yB = Math.max(0, Math.floor(yPos));
    const yT = Math.min(transmittanceTextureSize - 1, yB + 1);
    const fx = xPos - xL;
    const fy = yPos - yB;
    const w00 = (1 - fx) * (1 - fy);
    const w10 = fx * (1 - fy);
    const w01 = (1 - fx) * fy;
    const w11 = fx * fy;
    const idx = (xx, yy) => (xx + yy * transmittanceTextureSize) * 4;
    outRGB[0] = transmittanceLUT[idx(xL, yB)]   * w00 + transmittanceLUT[idx(xR, yB)]   * w10
             + transmittanceLUT[idx(xL, yT)]   * w01 + transmittanceLUT[idx(xR, yT)]   * w11;
    outRGB[1] = transmittanceLUT[idx(xL, yB)+1] * w00 + transmittanceLUT[idx(xR, yB)+1] * w10
             + transmittanceLUT[idx(xL, yT)+1] * w01 + transmittanceLUT[idx(xR, yT)+1] * w11;
    outRGB[2] = transmittanceLUT[idx(xL, yB)+2] * w00 + transmittanceLUT[idx(xR, yB)+2] * w10
             + transmittanceLUT[idx(xL, yT)+2] * w01 + transmittanceLUT[idx(xR, yT)+2] * w11;
  }

  // Scratch reused per tick.
  const sunSample = new Float32Array(STRIDE);
  const moonSample = new Float32Array(STRIDE);
  const combinedSHScratch = new Float32Array(27);
  const axisOutScratch = [0, 0, 0];
  const transmittanceScratch = [0, 0, 0];
  const cameraHeightDefault = skyDirector.assetManager.data.skyAtmosphericParameters.cameraHeight;
  const ONE_OVER_TWO_TWO = 1.0 / 2.2;

  this.tick = function(lightingState){
    const sunRadius = Math.sin(sunRenderer.sunAngularRadiusInRadians * skyState.sun.scale);
    const dominantLightIsSun = skyState.sun.position.y >= -sunRadius;

    if(self.useAmbientLUT){
      // -------- LUT-driven path --------
      const sunY  = skyState.sun.position.y;
      const moonY = skyState.moon.position.y;
      sampleLUT(sunAmbientLUT,  sunY,  sunSample);
      sampleLUT(moonAmbientLUT, moonY, moonSample);

      // Combine sun and moon contributions (linear superposition, weighted by
      // each source's current intensity scale relative to the LUT's bake-time
      // peak).
      const sunWeight  = skyState.sun.intensity  * skyState.sun.horizonFade  / PEAK_SCAT_SUN;
      const moonWeight = skyState.moon.intensity * skyState.moon.horizonFade / PEAK_SCAT_MOON;

      // Direct (dominant) light color from transmittance * intensity.
      // skyState.sun.intensity is already 10*(linear/1300), peaks ~10 at noon - fine as-is.
      // skyState.moon.intensity is 500*(linear), calibrated for the sky scattering shader;
      // for direct-lighting we want the raw value (~1 at full moon) to match the worker
      // pipeline's calc - otherwise transmittance * 500 saturates all RGB channels to 1
      // and the lunarEclipseLightingModifier (default ~(1, 0.5, 0.1) outside an eclipse)
      // turns white moonlight into pure orange.
      const dominantY = dominantLightIsSun ? sunY : moonY;
      sampleTransmittance(dominantY, cameraHeightDefault, transmittanceScratch);
      const dominantIntensity = dominantLightIsSun
        ? skyState.sun.intensity
        : skyState.moon.intensity / 500.0;
      const directR = Math.min(1.0, Math.max(0, transmittanceScratch[0] * dominantIntensity));
      const directG = Math.min(1.0, Math.max(0, transmittanceScratch[1] * dominantIntensity));
      const directB = Math.min(1.0, Math.max(0, transmittanceScratch[2] * dominantIntensity));

      // Ground-bounce contribution to the X/Z/Y- hemis (matches C++ behavior).
      const groundY = Math.max(dominantY, 0);
      const rGround = groundY * directR * groundColorLinear[0];
      const gGround = groundY * directG * groundColorLinear[1];
      const bGround = groundY * directB * groundColorLinear[2];

      // Compose 6 hemi colors by combining sun and moon SH coefficients (27 * RGB)
      // and evaluating cosine-convolved SH at the 6 cardinal axes (in bake frame:
      // sun was on +X, hemi positions are rotated to follow runtime sun azimuth
      // further down). Values are linear; gamma + max-normalize happens after the
      // ground-bounce mix.
      const combinedSH = combinedSHScratch;
      for(let k = 0; k < 27; ++k){
        combinedSH[k] = sunSample[k] * sunWeight + moonSample[k] * moonWeight;
      }
      const hemi = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const axisOut = axisOutScratch;
      evalSHHemi(combinedSH, 0,  1, 0, 0, axisOut); hemi[0]  = axisOut[0]; hemi[1]  = axisOut[1]; hemi[2]  = axisOut[2];
      evalSHHemi(combinedSH, 0,  0, 1, 0, axisOut); hemi[3]  = axisOut[0]; hemi[4]  = axisOut[1]; hemi[5]  = axisOut[2];
      evalSHHemi(combinedSH, 0,  0, 0, 1, axisOut); hemi[6]  = axisOut[0]; hemi[7]  = axisOut[1]; hemi[8]  = axisOut[2];
      evalSHHemi(combinedSH, 0, -1, 0, 0, axisOut); hemi[9]  = axisOut[0]; hemi[10] = axisOut[1]; hemi[11] = axisOut[2];
      evalSHHemi(combinedSH, 0,  0,-1, 0, axisOut); hemi[12] = axisOut[0]; hemi[13] = axisOut[1]; hemi[14] = axisOut[2];
      evalSHHemi(combinedSH, 0,  0, 0,-1, axisOut); hemi[15] = axisOut[0]; hemi[16] = axisOut[1]; hemi[17] = axisOut[2];
      // X+, Z+, X-, Z- average their sky contribution with ground (per C++).
      // Y- is set entirely to ground (per C++).
      const halfMix = (hi, gv) => 0.5 * (hi + gv);
      hemi[0]  = halfMix(hemi[0],  rGround); hemi[1]  = halfMix(hemi[1],  gGround); hemi[2]  = halfMix(hemi[2],  bGround);
      hemi[6]  = halfMix(hemi[6],  rGround); hemi[7]  = halfMix(hemi[7],  gGround); hemi[8]  = halfMix(hemi[8],  bGround);
      hemi[9]  = halfMix(hemi[9],  rGround); hemi[10] = halfMix(hemi[10], gGround); hemi[11] = halfMix(hemi[11], bGround);
      hemi[15] = halfMix(hemi[15], rGround); hemi[16] = halfMix(hemi[16], gGround); hemi[17] = halfMix(hemi[17], bGround);
      hemi[12] = rGround; hemi[13] = gGround; hemi[14] = bGround;

      // Gamma + max-normalize across all 18 channels (C++ does this).
      let maxVal = 1e-9;
      for(let k = 0; k < 18; ++k){
        hemi[k] = Math.pow(Math.max(hemi[k], 0), ONE_OVER_TWO_TWO);
        if(hemi[k] > maxVal) maxVal = hemi[k];
      }
      const oneOverMax = 1.0 / maxVal;
      for(let k = 0; k < 18; ++k) hemi[k] *= oneOverMax;

      // The LUT was baked with the dominant source on world +X. Rotate the X/Z hemi
      // lights' positions to match the dominant light's actual azimuth so the bake-time
      // +X color falls in the right world direction. Y stays at +Y (the bake is symmetric
      // around the Y axis for vertical zenith). Position is computed as a fade-weighted
      // blend of sun and moon azimuths so the rotation interpolates smoothly through
      // dawn/dusk when both sources are partial.
      const sunAz_x  = skyState.sun.position.x;
      const sunAz_z  = skyState.sun.position.z;
      const moonAz_x = skyState.moon.position.x;
      const moonAz_z = skyState.moon.position.z;
      const sFade = Math.max(0.0001, skyState.sun.horizonFade);
      const mFade = Math.max(0.0001, skyState.moon.horizonFade);
      let azX = sunAz_x * sFade + moonAz_x * mFade;
      let azZ = sunAz_z * sFade + moonAz_z * mFade;
      const azNorm = Math.sqrt(azX*azX + azZ*azZ) || 1.0;
      azX /= azNorm; azZ /= azNorm;
      self.xAxisHemisphericalLight.position.set(azX,  0, azZ);
      self.zAxisHemisphericalLight.position.set(-azZ, 0, azX);

      self.xAxisHemisphericalLight.color.setRGB(hemi[0], hemi[1], hemi[2]);
      self.yAxisHemisphericalLight.color.setRGB(hemi[3], hemi[4], hemi[5]);
      self.zAxisHemisphericalLight.color.setRGB(hemi[6], hemi[7], hemi[8]);
      self.xAxisHemisphericalLight.groundColor.setRGB(hemi[9],  hemi[10], hemi[11]);
      self.yAxisHemisphericalLight.groundColor.setRGB(hemi[12], hemi[13], hemi[14]);
      self.zAxisHemisphericalLight.groundColor.setRGB(hemi[15], hemi[16], hemi[17]);

      // Sky magnitude -> starsExposure. Magnitude lives at offset 30 in the new
      // SH9 LUT layout (was 21 in the old 6-hemi layout).
      const skyMagnitude = sunSample[30] * sunWeight + moonSample[30] * moonWeight;
      skyDirector.exposureVariables.starsExposure = Math.min(6.8 - skyMagnitude, 3.7);

      // Fog color (used by 'normal' atmospheric perspective only). FogColor lives
      // at offsets 27/28/29 in the new SH9 LUT layout.
      if(isNormalLighting){
        const fogR = Math.pow(Math.max(sunSample[27] * sunWeight + moonSample[27] * moonWeight, 0), ONE_OVER_TWO_TWO);
        const fogG = Math.pow(Math.max(sunSample[28] * sunWeight + moonSample[28] * moonWeight, 0), ONE_OVER_TWO_TWO);
        const fogB = Math.pow(Math.max(sunSample[29] * sunWeight + moonSample[29] * moonWeight, 0), ONE_OVER_TWO_TWO);
        // Fog density is set by atmosphere geometry (path * scattering coefficient),
        // not by sky brightness. Sky color drives fog *color* via the LUT-baked hemis.
        self.fog.density = maxFogDensity;
        self.fog.color.setRGB(fogR, fogG, fogB);
      }

      // Directional source light: position, color, intensity.
      const dominantPos = dominantLightIsSun ? skyState.sun.position : skyState.moon.position;
      self.sourceLight.position.x = -RADIUS_OF_SKY * dominantPos.z;
      self.sourceLight.position.y =  RADIUS_OF_SKY * dominantPos.y;
      self.sourceLight.position.z = -RADIUS_OF_SKY * dominantPos.x;
      // Sun gets physical color (warm sunsets, white noon, etc). Moon gets a fixed
      // cool cinematic tint - the same atmospheric extinction that paints sunsets red
      // would paint a low moon orange, but we perceive moonlight as cool blue-white
      // (Purkinje shift in scotopic vision), and most renderers commit to that. During
      // an actual lunar eclipse, override with the eclipse modifier (proper umbra red).
      let colorR, colorG, colorB;
      if(dominantLightIsSun){
        colorR = directR;
        colorG = directG;
        colorB = directB;
      } else {
        // Eclipse check (matches the GLSL fog formula's distance test).
        const sunAnti_x = -skyState.sun.position.x;
        const sunAnti_y = -skyState.sun.position.y;
        const sunAnti_z = -skyState.sun.position.z;
        const dx = skyState.moon.position.x - sunAnti_x;
        const dy = skyState.moon.position.y - sunAnti_y;
        const dz = skyState.moon.position.z - sunAnti_z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const eclipseThreshold = 2 * Math.SQRT2 * Math.max(skyDirector.sunRadius || 0.03, skyDirector.moonRadius || 0.03);
        if(dist <= eclipseThreshold){
          colorR = lunarEclipseLightingModifier.x;
          colorG = lunarEclipseLightingModifier.y;
          colorB = lunarEclipseLightingModifier.z;
        } else {
          // Fixed cool cinematic moonlight - slightly blue, slightly green-shifted.
          colorR = 0.70;
          colorG = 0.85;
          colorB = 1.00;
        }
      }
      self.sourceLight.color.r = colorR;
      self.sourceLight.color.g = colorG;
      self.sourceLight.color.b = colorB;
      // The WASM `_tick_lightingInterpolations` writes max(direct color) into the
      // interpolated lightingState[24] (despite the worker pre-interpolation putting
      // `max(1-direct)` there - WASM remaps the semantic). The original LightingManager
      // multiplies sourceLight.intensity by lightingState[24], so for the LUT path we
      // do the same with max(direct) directly.
      const directMax = Math.max(directR, directG, directB);
      self.sourceLight.intensity = directMax * 0.5 * (dominantLightIsSun ? lightingData.sunIntensity : lightingData.moonIntensity);

      // Ambient gating: smooth-but-permissive curve. The original `clamp(x*2, 0, 0.1) * 10`
      // saturated at 5% - flat from twilight to noon. Pure linear `clamp(x, 0, 1)` is
      // physically truer but visually too dim at sunrise. `clamp(x * 2, 0, 1)` is the
      // happy medium: saturates at lightingMag = 0.5 (sun moderately above horizon)
      // so sunrise/sunset get most of full ambient, while twilight and night still fade
      // out smoothly.
      const sunGate  = Math.max(0, skyState.sun.position.y  * 1.5 + 0.3);
      const moonGate = Math.max(0, skyState.moon.position.y * 1.5 + 0.3) * 0.3;
      const lightingMag = Math.max(directMax, sunGate, moonGate);
      const intensityModifier = Math.min(Math.max(lightingMag * 2.0, 0.0), 1.0);
      const indirectLightIntensity = Math.min(Math.max(lightingData.ambientIntensity * intensityModifier * 0.15, lightingData.minimumAmbientLighting), lightingData.maximumAmbientLighting);
      self.xAxisHemisphericalLight.intensity = indirectLightIntensity;
      self.yAxisHemisphericalLight.intensity = indirectLightIntensity;
      self.zAxisHemisphericalLight.intensity = indirectLightIntensity;
      return;
    }

    // -------- Worker-driven fallback path (original) --------
    if(isNormalLighting){
      self.fogColorVector.fromArray(lightingState, 21);
      // Fog density is set by atmosphere geometry, not sky brightness - see LUT path.
      self.fog.density = maxFogDensity;
      self.fog.color.copy(self.fogColorVector);
    }

    self.sourceLight.position.x = -RADIUS_OF_SKY * lightingState[27];
    self.sourceLight.position.y = RADIUS_OF_SKY * lightingState[26];
    self.sourceLight.position.z = -RADIUS_OF_SKY * lightingState[25];
    self.sourceLight.color.r = lunarEclipseLightingModifier.x * lightingState[18];
    self.sourceLight.color.g = lunarEclipseLightingModifier.y * lightingState[19];
    self.sourceLight.color.b = lunarEclipseLightingModifier.z * lightingState[20];
    self.sourceLight.intensity = lightingState[24] * 0.5 * (dominantLightIsSun ? lightingData.sunIntensity : lightingData.moonIntensity);

    self.xAxisHemisphericalLight.color.fromArray(lightingState, 0);
    self.yAxisHemisphericalLight.color.fromArray(lightingState, 3);
    self.zAxisHemisphericalLight.color.fromArray(lightingState, 6);
    self.xAxisHemisphericalLight.groundColor.fromArray(lightingState, 9);
    self.yAxisHemisphericalLight.groundColor.fromArray(lightingState, 12);
    self.zAxisHemisphericalLight.groundColor.fromArray(lightingState, 15);
    const intensityModifier = Math.min(Math.max(lightingState[24] * 2.0, 0.0), 0.1) * 10.0;
    const indirectLightIntensity = Math.min(Math.max(lightingData.ambientIntensity * intensityModifier * 0.15, lightingData.minimumAmbientLighting), lightingData.maximumAmbientLighting);
    self.xAxisHemisphericalLight.intensity = indirectLightIntensity;
    self.yAxisHemisphericalLight.intensity = indirectLightIntensity;
    self.zAxisHemisphericalLight.intensity = indirectLightIntensity;
  }
};
