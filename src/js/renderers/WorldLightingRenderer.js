//The sky's lighting of the world beneath it, published for anything that draws that
//world. Today that is the clouds' shadow on the ground (CloudRenderer bakes it), the
//clouds themselves for anything that reflects the sky, and the colour they give the
//sky light; the aerial perspective volume with its god rays will join it here.
//
//The contract, for a-faraway-land, a-water and anything else:
//  StarrySky.worldLighting = {version, features, uniforms, cloudSkyTint}
//    cloudSkyTint  [r, g, b], live: the mean sky light with the clouds over the mean of
//               the clear sky. Multiply anything built from a CLEAR sky model by it (the
//               sky's own hemisphere lights already are, see LightingManager). 1 without clouds.
//    uniforms   live uniform objects. Splice them into a material BY REFERENCE
//               (material.uniforms.starryX = worldLighting.uniforms.starryX), never
//               through UniformsUtils.merge or clone, which would freeze them.
//  THREE.ShaderChunk.starry_world_lighting_pars
//               the GLSL (starry-world-lighting-pars.glsl): #include it and call
//               starryCloudDominantShadow(worldPosition) and friends, and
//               starryCloudySkyRadiance(direction, clearSky) for a reflection.
//  document event 'starry-sky-world-lighting-ready', detail.worldLighting, once the
//               first shadows are baked. StarrySky.worldLighting exists before then,
//               with the shadows switched off, so a reader may wire up early.
//
//Three's own lit materials (standard, physical, phong, lambert, toon) are patched
//here, so A-Frame primitives and loaded models take the shadows with no help. A
//material opts out with material.userData.starryWorldLighting = false. The patch
//goes into the stock chunks behind #ifdef STARRY_WORLD_LIGHTING, so a shader that
//builds its own lighting from those chunks (a-faraway-land's objects do) inherits it,
//and only shaders that carry the uniforms ever compile it.
StarrySky.Renderers.WorldLightingRenderer = function(skyDirector){
  const WORLD_LIGHTING_VERSION = 1;
  //Frames between sweeps of the scene for newly added stock materials.
  const MATERIAL_SWEEP_INTERVAL = 30;
  const PATCH_DEFINE = 'STARRY_WORLD_LIGHTING';
  const LIGHT_ANCHOR = 'getDirectionalLightInfo( directionalLight, directLight );';

  const skyState = skyDirector.skyState;
  const atmosphericParameters = skyDirector.assetManager.data.skyAtmosphericParameters;

  //Until the first bake, and whenever there are no clouds, the shadow map is a single
  //lit texel in each layer, so every reader can compile and bind it unconditionally.
  const unshadowed = new THREE.DataArrayTexture(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]), 1, 1, 2);
  unshadowed.format = THREE.RGBAFormat;
  unshadowed.type = THREE.UnsignedByteType;
  unshadowed.colorSpace = THREE.NoColorSpace;
  unshadowed.needsUpdate = true;
  //And the cloud map, until there is one: one empty texel, no clouds.
  const cloudless = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
  cloudless.colorSpace = THREE.NoColorSpace;
  cloudless.needsUpdate = true;

  const uniforms = {
    starryCloudShadowMap: {value: unshadowed},
    starryCloudShadowCascades: {value: [new THREE.Vector4(0.0, 0.0, 1.0, 1.0), new THREE.Vector4(0.0, 0.0, 1.0, 1.0)]},
    starryCloudShadowCentre: {value: new THREE.Vector2()},
    starryCloudShadowPlaneHeight: {value: 0.0},
    starryCloudShadowFade: {value: new THREE.Vector2(0.0, 1.0)},
    starryCloudShadowOn: {value: 0.0},
    starryCloudObserverRadius: {value: (atmosphericParameters.radiusOfEarth + atmosphericParameters.cameraHeight) * 1000.0},
    starrySkyCameraPosition: {value: new THREE.Vector3()},
    starrySunDirection: {value: new THREE.Vector3(0.0, 1.0, 0.0)},
    starryMoonDirection: {value: new THREE.Vector3(0.0, -1.0, 0.0)},
    starryLightDirectionWorld: {value: new THREE.Vector3(0.0, 1.0, 0.0)},
    starryDominantLightIsMoon: {value: 0.0},
    //The clouds as the observer sees them, for reflections: CloudRenderer's map.
    starryCloudSkyMap: {value: cloudless},
    starryCloudSkyOn: {value: 0.0},
    //1 once the hemisphere lights carry the clouds' tint (LightingManager), so the
    //shaders only shade one spot against the deck instead of dimming them again.
    starryCloudSkyLightTinted: {value: 0.0}
  };
  const cloudSkyTint = [1.0, 1.0, 1.0];

  this.worldLighting = {
    version: WORLD_LIGHTING_VERSION,
    features: {cloudShadows: false, cloudSky: false, aerialPerspective: false},
    uniforms: uniforms,
    cloudSkyTint: cloudSkyTint,
    //Patch three's lit materials automatically. Set false to patch by hand with
    //patchMaterial, or not at all.
    autoPatchMaterials: true,
    patchMaterial: null
  };
  StarrySky.worldLighting = this.worldLighting;

  //The chunks. The light multiply goes right after the anchor, so a shader that
  //splices its own block in after the same anchor (a-faraway-land's _sunLitChunk)
  //runs its block first -- its sun magnitude, then its shadows -- and the clouds
  //multiply whatever that left.
  THREE.ShaderChunk.starry_world_lighting_pars = StarrySky.Materials.WorldLighting.worldLightingPars.partialFragmentShader;
  if(THREE.ShaderChunk.lights_pars_begin.indexOf('starry_world_lighting_pars') === -1){
    THREE.ShaderChunk.lights_pars_begin += [
      '',
      '#ifdef ' + PATCH_DEFINE,
      '#include <starry_world_lighting_pars>',
      '#endif'
    ].join('\n');
  }
  //Three's lighting, in three places:
  //  the start of lights_fragment_begin  the clouds over this fragment, sampled once,
  //                                      and the sky's light in view space
  //  right after the light anchor        the sky's directional light through them
  //  the end of lights_fragment_begin    ambient, probe and hemisphere light: the sky
  //                                      tints its hemispheres with the clouds' mean, so
  //                                      only this spot against the deck (dimmed outright
  //                                      where nothing tints them)
  //  the end of lights_fragment_maps     the environment map, which (captured from the
  //                                      dome) already has the clouds in it on average:
  //                                      only this spot against the deck as a whole
  //vViewPosition is the view space position negated; the view rotation is orthonormal,
  //so its transpose carries it back into the world.
  const lightsFragmentBegin = THREE.ShaderChunk.lights_fragment_begin;
  if(lightsFragmentBegin.indexOf('starryCloudHere') === -1){
    if(lightsFragmentBegin.indexOf(LIGHT_ANCHOR) === -1){
      console.warn('A-Starry-Sky: lights_fragment_begin does not look like the r173 chunk, so three materials will not receive cloud shadows.');
    }
    else{
      THREE.ShaderChunk.lights_fragment_begin = [
        '#ifdef ' + PATCH_DEFINE,
        'vec3 starryCloudHere = starryCloudDominantShadow(cameraPosition + transpose(mat3(viewMatrix)) * (-vViewPosition));',
        'vec3 starryLightView = normalize((viewMatrix * vec4(starryLightDirectionWorld, 0.0)).xyz);',
        '#endif',
        lightsFragmentBegin.replace(LIGHT_ANCHOR, [
          LIGHT_ANCHOR,
          '#ifdef ' + PATCH_DEFINE,
          'if(dot(directLight.direction, starryLightView) > 0.9999) directLight.color *= starryCloudHere.x;',
          '#endif'
        ].join('\n')),
        '#if defined( ' + PATCH_DEFINE + ' ) && defined( RE_IndirectDiffuse )',
        'irradiance *= starryCloudSkyVisibilityFrom(starryCloudHere);',
        '#endif'
      ].join('\n');
      THREE.ShaderChunk.lights_fragment_maps += [
        '',
        '#ifdef ' + PATCH_DEFINE,
        '#if defined( RE_IndirectDiffuse )',
        'iblIrradiance *= starryCloudSkyContrastFrom(starryCloudHere);',
        '#endif',
        '#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )',
        'radiance *= starryCloudSkyContrastFrom(starryCloudHere);',
        '#endif',
        '#endif'
      ].join('\n');
    }
  }

  const PATCHABLE = function(material){
    return material.isMeshStandardMaterial || material.isMeshPhongMaterial ||
      material.isMeshLambertMaterial || material.isMeshToonMaterial;
  };
  //Which materials carry the patch. Not a userData flag: clone() copies userData, and a
  //clone flagged as patched would be skipped while having neither the hook nor the uniforms.
  const patchedMaterials = new WeakSet();
  const patchMaterial = function(material){
    if(!material || patchedMaterials.has(material) || material.userData.starryWorldLighting === false){
      return false;
    }
    const previousOnBeforeCompile = material.onBeforeCompile;
    material.onBeforeCompile = function(shader, renderer){
      previousOnBeforeCompile.call(this, shader, renderer);
      for(const name in uniforms){
        shader.uniforms[name] = uniforms[name];
      }
    };
    //The define goes in material.defines, never into the shader text: three keys its program
    //cache on the defines whatever happens to customProgramCacheKey, which other hooks assign
    //over (a-faraway-land's ObjectMaterial does). Keyed on a custom key alone, a patched and an
    //unpatched material could share one program, and the unpatched one would draw with a
    //sampler it never bound -- three leaves it on unit 0 beside a sampler2D, and the draw fails
    //validation. clone() and copy() never carry it over, so a clone is drawn clean until the
    //next sweep patches it too.
    material.defines = material.defines || {};
    material.defines[PATCH_DEFINE] = '';
    patchedMaterials.add(material);
    material.needsUpdate = true;
    return true;
  };
  this.worldLighting.patchMaterial = patchMaterial;

  const sweepScene = function(){
    const scene = skyDirector.scene;
    if(!scene){
      return;
    }
    scene.traverse(function(object){
      if(!object.isMesh){
        return;
      }
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for(let i = 0; i < materials.length; ++i){
        if(materials[i] && PATCHABLE(materials[i])){
          patchMaterial(materials[i]);
        }
      }
    });
  };

  const self = this;
  let frame = 0;
  let announced = false;
  this.tick = function(){
    const cloudRenderer = skyDirector.renderers.cloudRenderer;
    const groundShadow = cloudRenderer ? cloudRenderer.groundShadow : null;
    const shadowsLive = !!(groundShadow && groundShadow.enabled && groundShadow.ready);
    if(shadowsLive){
      uniforms.starryCloudShadowMap.value = groundShadow.texture;
      uniforms.starryCloudShadowCascades.value[0].copy(groundShadow.cascades[0]);
      uniforms.starryCloudShadowCascades.value[1].copy(groundShadow.cascades[1]);
      uniforms.starryCloudShadowCentre.value.copy(groundShadow.centre);
      uniforms.starryCloudShadowPlaneHeight.value = groundShadow.planeHeight;
      uniforms.starryCloudShadowFade.value.copy(groundShadow.fade);
      uniforms.starryCloudObserverRadius.value = groundShadow.observerRadius;
    }
    uniforms.starryCloudShadowOn.value = shadowsLive ? 1.0 : 0.0;
    self.worldLighting.features.cloudShadows = shadowsLive;

    //The cloud map ping-pongs, so it is picked up fresh every frame.
    const cloudSkyLive = !!cloudRenderer;
    uniforms.starryCloudSkyMap.value = cloudSkyLive ? cloudRenderer.cloudMap : cloudless;
    uniforms.starryCloudSkyOn.value = cloudSkyLive ? 1.0 : 0.0;
    self.worldLighting.features.cloudSky = cloudSkyLive;
    const tintLive = !!(cloudRenderer && cloudRenderer.skyLightTintLive);
    cloudSkyTint[0] = tintLive ? cloudRenderer.skyLightTint.x : 1.0;
    cloudSkyTint[1] = tintLive ? cloudRenderer.skyLightTint.y : 1.0;
    cloudSkyTint[2] = tintLive ? cloudRenderer.skyLightTint.z : 1.0;

    //The same observer the clouds were baked around this frame.
    uniforms.starrySkyCameraPosition.value.copy(skyDirector.globalCameraPosition);
    uniforms.starrySunDirection.value.copy(skyState.sun.position);
    uniforms.starryMoonDirection.value.copy(skyState.moon.position);
    const lightingManager = skyDirector.lightingManager;
    if(lightingManager){
      uniforms.starryLightDirectionWorld.value.copy(lightingManager.dominantLightDirection);
      uniforms.starryDominantLightIsMoon.value = lightingManager.dominantLightIsSun ? 0.0 : 1.0;
      uniforms.starryCloudSkyLightTinted.value = lightingManager.cloudSkyLightTinted ? 1.0 : 0.0;
    }

    if(self.worldLighting.autoPatchMaterials && frame % MATERIAL_SWEEP_INTERVAL === 0){
      sweepScene();
    }
    ++frame;

    if(!announced && (shadowsLive || !(groundShadow && groundShadow.enabled))){
      announced = true;
      document.dispatchEvent(new CustomEvent('starry-sky-world-lighting-ready', {
        detail: {worldLighting: self.worldLighting, skyDirector: skyDirector}
      }));
    }
  };
};
