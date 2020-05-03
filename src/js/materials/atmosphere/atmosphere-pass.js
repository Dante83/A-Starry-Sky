//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Atmosphere.atmosphereShader = {
  uniforms: function(isSunShader = false, isMoonShader = false){
    let uniforms = {
      sunPosition: {type: 'vec3', value: new THREE.Vector3()},
      solarMieInscatteringSum: {type: 't', value: null},
      solarRayleighInscatteringSum: {type: 't', value: null},
      transmittance: {type: 't', value: null},
      toneMappingExposure: {type: 'f', value: 1.0},
      sunHorizonFade: {type: 'f', value: 1.0}
    }

    //Pass our specific uniforms in here.
    if(isSunShader){
      uniforms.sunAngularDiameterCos = {type: 'f', value: 1.0};
      uniforms.radiusOfSunPlane = {type: 'f', value: 1.0};
      uniforms.worldMatrix = {type: 'mat4', value: new THREE.Matrix4()};
      uniforms.moonOpacityMap = {type: 't', value: null};
    }
    else if(isMoonShader){
      uniforms.moonAngularDiameterCos = {type: 'f', value: 1.0};
      uniforms.moonDiffuseMap = {type: 't', value: null};
      uniforms.moonNormalMap = {type: 't', value: null};
      uniforms.moonAOMap = {type: 't', value: null};
      uniforms.moonSpecularMap = {type: 't', value: null};
      uniforms.moonOpacityMap = {type: 't', value: null};
    }

    return uniforms;
  },
  vertexShader: [
    'varying vec3 vWorldPosition;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = normalize(worldPosition.xyz);',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}',
  ].join('\n'),
  fragmentShader: function(mieG, textureWidth, textureHeight, packingWidth, packingHeight, atmosphereFunctions, sunCode = false, moonCode = false){
    let originalGLSL = [
    'precision highp float;',

    'varying vec3 vWorldPosition;',

    'uniform vec3 sunPosition;',
    'uniform float sunHorizonFade;',
    'uniform sampler2D mieInscatteringSum;',
    'uniform sampler2D rayleighInscatteringSum;',
    'uniform sampler2D transmittance;',

    'const float piOver2 = 1.5707963267948966192313;',
    'const float pi = 3.141592653589793238462;',
    'const float scatteringSunIntensity = 20.0;',
    'const float scatteringMoonIntensity = 0.0144; //Moon reflects 0.072% of all light',

    '#if($isSunPass)',
      'uniform float sunAngularDiameterCos;',
      'varying vec2 vUv;',
      'const float sunDiskIntensity = 20.0;',

      '//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',
      'const float ac1 = 0.46787619;',
      'const float ac2 = 0.67104811;',
      'const float ac3 = -0.06948355;',
    '#elif($isMoonPass)',
      'uniform float moonAngularDiameterCos;',
      'uniform sampler2D moonDiffuseMap;',
      'uniform sampler2D moonNormalMap;',
      'uniform sampler2D moonAOMap;',
      'uniform sampler2D moonSpecularMap;',
      'uniform sampler2D moonOpacityMap;',
      'varying vec2 vUv;',
      'const float moonDiskIntensity = 0.0144;',
    '#endif',

    '$atmosphericFunctions',

    'vec3 linearAtmosphericPass(vec3 sourcePosition, float sourceIntensity, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){',
      'float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);',
      'float cosOFAngleBetweenZenithAndSource = sourcePosition.y;',
      'vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));',
      'float depthInPixels = $textureDepth;',
      'UVInterpolatants solarUVInterpolants = getUVInterpolants(uv3, depthInPixels);',

      '//Interpolated scattering values',
      'vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, solarUVInterpolants.uv0).rgb, texture2D(mieLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);',
      'vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, solarUVInterpolants.uv0).rgb, texture2D(rayleighLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);',

      'return intensityFader * sourceIntensity * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);',
    '}',

    'void main(){',
      '//Figure out where we are',
      'float altitude = piOver2 - acos(vWorldPosition.y);',
      'float azimuth = atan(vWorldPosition.z, vWorldPosition.x) + pi;',
      'vec3 sphericalPosition = vec3(sin(azimuth) * cos(altitude), sin(altitude), cos(azimuth) * cos(altitude));',

      '//Get our transmittance for this texel',
      'float cosOfViewAngle = vWorldPosition.y;',
      'vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH));',
      'vec3 transmittanceFade = texture2D(transmittance, uv2OfTransmittance).rgb;',

      '//In the event that we have a moon shader, we need to block out all astronomical light blocked by the moon',
      '#if($isMoonPass)',
        '//Get our lunar occlusion texel',
        'float lunarPixelMask = texture2D(lunarAlphaMask, vUv);',
      '#endif',

      '//This stuff never shows up near our sun, so we can exclude it',
      '#if(!$isSunPass)',
        '//Milky Way Pass',


        '//Star Pass',


        '//Planet Pass',

      '#endif',

      '//Atmosphere',
      'vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);',
      'vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, lunarHorizonFade, uv2OfTransmittance);',
      'vec3 combinedPass = solarAtmosphericPass + lunarAtmosphericPass;',

      '//Sun and Moon layers',
      '#if($isSunPass)',
        '$draw_sun_pass',
        'vec3 toneMappedSky = ACESFilmicToneMapping(combinedPass);',
        'gl_FragColor = vec4(toneMappedSky + sunTexel, 1.0);',
      '#elif($isMoonPass)',
        '$draw_moon_pass',
        'gl_FragColor = vec4(combinedPass, 1.0);',
      '#else',
        'vec3 combinedAtmosphericPass = solarAtmosphericPass;',

        '//Color Adjustment Pass',
        'vec3 toneMappedColor = ACESFilmicToneMapping(combinedPass);',

        '//Triangular Blue Noise Adjustment Pass',

        'gl_FragColor = vec4(clamp(toneMappedColor, 0.0, 1.0), 1.0);',
      '#endif',
    '}',
    ];

    let mieGSquared = mieG * mieG;
    let miePhaseFunctionCoefficient = (1.5 * (1.0 - mieGSquared) / (2.0 + mieGSquared));
    let textureDepth = packingWidth * packingHeight;

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$atmosphericFunctions/g, atmosphereFunctions);
      updatedGLSL = updatedGLSL.replace(/\$mieG/g, mieG.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$mieGSquared/g, mieGSquared.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$miePhaseFunctionCoefficient/g, miePhaseFunctionCoefficient.toFixed(16));

      //Texture constants
      updatedGLSL = updatedGLSL.replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureDepth/g, textureDepth.toFixed(1));

      //Additional injected code for sun and moon
      if(moonCode !== false){
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '1');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '1');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, sunCode);
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, moonCode);
      }
      else if(sunCode !== false){
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '1');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, sunCode);
      }
      else{
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, '');
      }

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
}
