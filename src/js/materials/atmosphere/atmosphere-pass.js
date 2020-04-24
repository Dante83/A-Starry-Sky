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
    }
    else if(isMoonShader){
      //DO NOTHING
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

    '#if(!$isSunPass && !$isMoonPass)',
      'varying vec3 vWorldPosition;',
    '#else',
      'const vec3 vWorldPosition = vec3(1.0, 0.2, 0.0);',
    '#endif',

    'uniform vec3 sunPosition;',
    'uniform float sunHorizonFade;',
    'uniform sampler2D solarMieInscatteringSum;',
    'uniform sampler2D solarRayleighInscatteringSum;',
    'uniform sampler2D transmittance;',

    'const float piOver2 = 1.5707963267948966192313;',
    'const float pi = 3.141592653589793238462;',

    '#if($isSunPass)',
      'uniform float sunAngularDiameterCos;',
    '#elif($isMoonPass)',
      '//DO NOTHING',
    '#endif',

    '$atmosphericFunctions',

    'vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){',
      'float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);',
      'float cosOFAngleBetweenZenithAndSource = sourcePosition.y;',
      'vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));',
      'float depthInPixels = $textureDepth;',
      'UVInterpolatants solarUVInterpolants = getUVInterpolants(uv3, depthInPixels);',

      '//Interpolated scattering values',
      'vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, solarUVInterpolants.uv0).rgb, texture2D(mieLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);',
      'vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, solarUVInterpolants.uv0).rgb, texture2D(rayleighLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);',

      'return intensityFader * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);',
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

      '//Initialize our color to zero light',
      'vec3 outColor = vec3(0.0);',

      "//Stuff that gets covered by the sun or moon so it doesn't get added to the original light",
      '#if(!$isSunPass && !$isMoonPass)',
        '//Milky Way Pass',


        '//Star Pass',


        '//Planet Pass',

      '#endif',

      '//Atmosphere',
      'vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, sphericalPosition, solarMieInscatteringSum, solarRayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);',

      '//Sun and Moon layers',
      '#if($isSunPass)',
        '$draw_sun_pass',
        'gl_FragColor = vec4(solarAtmosphericPass + sunPassColor, sunPassTransparency);',
      '#elif($isMoonPass)',
        '$draw_sun_pass',
        '$draw_moon_pass',
        'gl_FragColor = vec4(solarAtmosphericPass + moonPassColor, moonPassTransparency);',
      '#else',
        'vec3 combinedAtmosphericPass = solarAtmosphericPass;',

        '//Color Adjustment Pass',
        'vec3 toneMappedColor = OptimizedCineonToneMapping(combinedAtmosphericPass);',

        '//Triangular Blue Noise Adjustment Pass',

        'gl_FragColor = vec4(toneMappedColor, 1.0);',
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
