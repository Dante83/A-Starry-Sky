//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Atmosphere.atmosphereShader = {
  uniforms: function(isSunShader = false, isMoonShader = false){
    let uniforms = {
      time: {type: 'f', value: 0.0},
      sunPosition: {type: 'vec3', value: new THREE.Vector3()},
      moonPosition: {type: 'vec3', value: new THREE.Vector3()},
      mieInscatteringSum: {type: 't', value: null},
      rayleighInscatteringSum: {type: 't', value: null},
      transmittance: {type: 't', value: null},
      toneMappingExposure: {type: 'f', value: 1.0},
      sunHorizonFade: {type: 'f', value: 1.0},
      moonHorizonFade: {type: 'f', value: 1.0}
    }

    //Pass our specific uniforms in here.
    if(isSunShader){
      uniforms.sunAngularDiameterCos = {type: 'f', value: 1.0};
      uniforms.radiusOfSunPlane = {type: 'f', value: 1.0};
      uniforms.worldMatrix = {type: 'mat4', value: new THREE.Matrix4()};
      uniforms.moonDiffuseMap = {type: 't', value: null};
    }
    else if(isMoonShader){
      uniforms.moonAngularDiameterCos = {type: 'f', value: 1.0};
      uniforms.sunRadius = {type: 'f', value: 1.0};
      uniforms.radiusOfMoonPlane = {type: 'f', value: 1.0};
      uniforms.worldMatrix = {type: 'mat4', value: new THREE.Matrix4()};
      uniforms.sunLightDirection = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.moonDiffuseMap = {type: 't', value: null};
      uniforms.moonNormalMap = {type: 't', value: null};
      uniforms.moonRoughnessMap = {type: 't', value: null};
      uniforms.moonAperatureSizeMap = {type: 't', value: null};
      uniforms.moonAperatureOrientationMap = {type: 't', value: null};
    }

    if(!isSunShader){
      uniforms.starHashCubemap = {type: 't', value: null};
      uniforms.dimStarData = {type: 't', value: null};
      uniforms.brightStarData = {type: 't', value: null};
    }

    return uniforms;
  },
  vertexShader: [
    'varying vec3 vWorldPosition;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
  ].join('\n'),
  fragmentShader: function(mieG, textureWidth, textureHeight, packingWidth, packingHeight, atmosphereFunctions, sunCode = false, moonCode = false){
    let originalGLSL = [
    'precision highp float;',

    'varying vec3 vWorldPosition;',

    'uniform float time;',
    'uniform vec3 sunPosition;',
    'uniform vec3 moonPosition;',
    'uniform float sunHorizonFade;',
    'uniform float moonHorizonFade;',
    'uniform sampler2D mieInscatteringSum;',
    'uniform sampler2D rayleighInscatteringSum;',
    'uniform sampler2D transmittance;',

    '#if(!$isSunPass)',
      '//varying vec3 galacticCoordinates;',
      'uniform samplerCube starHashCubemap;',
      'uniform sampler2D dimStarData;',
      'uniform sampler2D brightStarData;',
      'uniform sampler2D starColorData;',
    '#endif',

    'const float piOver2 = 1.5707963267948966192313;',
    'const float piTimes2 = 6.283185307179586476925286;',
    'const float pi = 3.141592653589793238462;',
    'const float scatteringSunIntensity = 20.0;',
    'const float scatteringMoonIntensity = 1.44; //Moon reflects 7.2% of all light',

    '#if($isSunPass)',
      'uniform float sunAngularDiameterCos;',
      'uniform sampler2D moonDiffuseMap;',
      'varying vec2 vUv;',
      'const float sunDiskIntensity = 30.0;',

      '//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',
      'const float ac1 = 0.46787619;',
      'const float ac2 = 0.67104811;',
      'const float ac3 = -0.06948355;',
    '#elif($isMoonPass)',
      'uniform float moonAngularDiameterCos;',
      'uniform float sunRadius;',
      'uniform sampler2D moonDiffuseMap;',
      'uniform sampler2D moonNormalMap;',
      'uniform sampler2D moonRoughnessMap;',
      'uniform sampler2D moonAperatureSizeMap;',
      'uniform sampler2D moonAperatureOrientationMap;',
      'varying vec2 vUv;',
      'varying mat3 TBNMatrix;',

      '//Tangent space lighting',
      'varying vec3 tangentSpaceSunLightDirection;',
      'varying vec3 tangentSpaceViewDirection;',
    '#endif',

    '$atmosphericFunctions',

    '#if(!$isSunPass)',
      'vec3 getSpectralColor(){',
        'return vec3(1.0);',
      '}',

      '//TODO: Replace with faster functions',

      'float fastAiry(float r){',
        '//Variation of Airy Disk approximation from https://www.shadertoy.com/view/tlc3zM to create our stars brightness',
        'float one_over_r_cubed = 1.0 / abs(r * r * r);',
        'float gauss_r_over_1_4 = exp(-.5 * (0.71428571428 * r) * (0.71428571428 * r));',
        'return abs(r) < 1.88 ? gauss_r_over_1_4 : abs(r) > 6.0 ? 1.35 * one_over_r_cubed : (gauss_r_over_1_4 + 2.7 * one_over_r_cubed) * 0.5;',
      '}',

      'vec3 drawStarLight(vec4 starData, vec3 sphericalPosition){',
        '//I hid the temperature inside of the magnitude of the stars equitorial position, as the position vector must be normalized.',
        'float temperature = length(starData.xyz);',
        'vec3 normalizedStarPosition = starData.xyz / temperature;',
        'float starBrightness = starData.a;',
        'float approximateDistance2Star = distance(sphericalPosition, normalizedStarPosition) * 500.0;',

        '//Modify the intensity and color of this star using approximation of stellar scintillation',


        '//Pass this brightness into the fast Airy function to make the star glow',
        '//float stellarBrightness = max(fastAiry(approximateDistance2Star * 10.0), 0.0);',

        'return vec3((2.0 * pow(20.0, 30.1-starBrightness * 5.0)) / (approximateDistance2Star * approximateDistance2Star));',
      '}',
    '#endif',

    'vec3 linearAtmosphericPass(vec3 sourcePosition, float sourceIntensity, vec3 sphericalPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){',
      'float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, sphericalPosition);',
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
      'vec3 sphericalPosition = normalize(vWorldPosition);',

      '//Get our transmittance for this texel',
      'float cosOfViewAngle = sphericalPosition.y;',
      'vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH));',
      'vec3 transmittanceFade = texture2D(transmittance, uv2OfTransmittance).rgb;',

      '//In the event that we have a moon shader, we need to block out all astronomical light blocked by the moon',
      '#if($isMoonPass)',
        '//Get our lunar occlusion texel',
        'vec2 offsetUV = vUv * 2.0 - vec2(0.5);',
        'vec4 lunarDiffuseTexel = texture2D(moonDiffuseMap, offsetUV);',
        'vec2 uvClamp1 = 1.0 - vec2(step(offsetUV.x, 0.0), step(offsetUV.y, 0.0));',
        'vec2 uvClamp2 = 1.0 - vec2(step(1.0 - offsetUV.x, 0.0), step(1.0 - offsetUV.y, 0.0));',
        'vec3 lunarDiffuseColor = lunarDiffuseTexel.rgb;',
        'float lunarMask = lunarDiffuseTexel.a * uvClamp1.x * uvClamp1.y * uvClamp2.x * uvClamp2.y;',
      '#elif($isSunPass)',
        '//Get our lunar occlusion texel in the frame of the sun',
        'float lunarMask = texture2D(moonDiffuseMap, vUv).a;',
      '#endif',

      '//This stuff never shows up near our sun, so we can exclude it',
      '#if(!$isSunPass)',
        '//Get the stellar starting id data from the galactic cube map',
        'vec3 galacticCoordinates = sphericalPosition;',
        'vec3 starHashData = textureCube(starHashCubemap, galacticCoordinates).rgb;',
        'vec3 scaledStarHashData = floor(starHashData * 255.0);',
        'float originalStarID = floor(dot(scaledStarHashData.rg, vec2(1.0, 256.0)));',
        'float row = floor(originalStarID / 128.0);',
        'float column = originalStarID - row * 128.0;',
        'float x = column / 127.0;',
        'float y = row / 63.0;',
        'vec4 starData = texture2D(dimStarData, vec2(x, y));',
        'vec3 galacticLighting = drawStarLight(starData, sphericalPosition);',

        '//column += 1.0;',
        '//galacticLighting += drawStarLight(texture2D(dimStarData, vec2(column, row)), sphericalPosition);',
        '//',
        '//Now move on to the bright stars',
        'float starID = floor(originalStarID * (2048.0 / 8192.0)) + floor(starHashData.b * 256.0 - 127.0);',
        'row = floor(starID / 64.0);',
        'column = starID - row * 64.0;',
        'x = column / 63.0;',
        'y = row / 31.0;',
        'starData = texture2D(brightStarData, vec2(x, y));',
        'galacticLighting += drawStarLight(starData, sphericalPosition);',
        'column += 1.0;',
        'x = column / 63.0;',
        'y = row / 31.0;',
        'starData = texture2D(brightStarData, vec2(x, y));',
        'galacticLighting += drawStarLight(starData, sphericalPosition);',
        'column -= 2.0;',
        'x = column / 63.0;',
        'y = row / 31.0;',
        'starData = texture2D(brightStarData, vec2(x, y));',
        'galacticLighting += drawStarLight(starData, sphericalPosition);',

        '//Check our distance from each of the four primary planets',

        '//Get the galactic lighting from',

        '//Apply the transmittance function to all of our light sources',
        '//galacticLighting = galacticLighting * transmittanceFade;',
      '#endif',

      '//Atmosphere',
      'vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);',
      'vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, moonHorizonFade, uv2OfTransmittance);',

      '//Sun and Moon layers',
      '#if($isSunPass)',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass;',
        '$draw_sun_pass',
        'combinedPass = combinedPass + sunTexel;',
      '#elif($isMoonPass)',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass;',
        '$draw_moon_pass',
        'combinedPass = mix(combinedPass, combinedPass + moonTexel, lunarMask);',
      '#else',
      '//Regular atmospheric pass',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass;',

        '//Color Adjustment Pass',
        'combinedPass = ACESFilmicToneMapping(combinedPass);',

        '//Triangular Blue Noise Dithering Pass',

        'combinedPass = galacticLighting;',
      '#endif',

      'gl_FragColor = vec4(combinedPass, 1.0);',
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
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, '');
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
