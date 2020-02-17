//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Atmosphere.kthInscatteringMaterial = {
  uniforms: {
    transmittanceTexture: {type: 't', value: null},
    kMinusOneMieInscattering: {type: 't', value: null},
    kMinusOneRayleighInscattering: {type: 't', value: null},
  },
  fragmentShader: function(numberOfPoints, textureWidth, textureHeight, packingWidth, packingHeight, mieGCoefficient, isRayleigh, atmosphereFunctions){
    let originalGLSL = [
    '//Based on the thesis of from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',
    '//By Gustav Bodare and Edvard Sandberg',
    'uniform sampler2D kMinusOneMieInscattering;',
    'uniform sampler2D kMinusOneRayleighInscattering;',
    'uniform sampler2D transmittanceTexture;',

    'const float mieGCoefficient = $mieGCoefficient;',

    '$atmosphericFunctions',

    'float phaseMie(float cosTheta){',
      'float g_squared = mieGCoefficient * mieGCoefficient;',
      'return (1.5 * (1.0 - g_squared) / (2.0 + g_squared)) * ((1.0 + cosTheta * cosTheta) / pow((1.0 +  g_squared - 2.0 *  mieGCoefficient * + cosTheta * cosTheta), 1.5));',
    '}',

    '//Modified Rayleigh Phase Function',
    '//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf',
    'float phaseRayleigh(float cosTheta){',
      'return 0.8 * (1.4 + 0.5 * cosTheta);',
    '}',

    'vec3 gatherInscatteredLight(float r, float cameraZenith, float sunAngleAtP){',
      'float x;',
      'float y = parameterizationOfHeightToY(r);',
      'float z = inverseParameterizationOfZToCosOfSunZenith(sunAngleAtP);',
      'vec2 uvInscattered;',
      'vec3 gatheredInscatteredIntensity = vec3(0.0);',
      'vec3 inscatteredLight;',
      'float theta = 0.0;',
      'float angleBetweenCameraAndIncomingRay;',
      'float phaseValue;',
      'float cosAngle;',
      'float deltaTheta = PI_TIMES_TWO / $numberOfChunks;',

      '#pragma unroll',
      'for(int i = 1; i < $numberOfChunksInt; i++){',
        'theta += deltaTheta;',
        'x = parameterizationOfCosOfZenithToX(cos(theta));',
        'uvInscattered = getUV2From3DUV(vec3(x, y, z));',
        'angleBetweenCameraAndIncomingRay = cameraZenith - deltaTheta;',
        'cosAngle = cos(angleBetweenCameraAndIncomingRay);',
        '#if($isRayleigh)',
          'inscatteredLight = texture2D(kMinusOneRayleighInscattering, uvInscattered).rgb;',
          'phaseValue = 0.75 * (1.0 + cosAngle * cosAngle);',
        '#else',
          'inscatteredLight = texture2D(kMinusOneMieInscattering, uvInscattered).rgb;',
          'phaseValue = ((3.0 * (1.0 - mieGCoefficient * mieGCoefficient)) / (2.0 * (2.0 + mieGCoefficient * mieGCoefficient)));',
          'phaseValue *= ((1.0 + cosAngle * cosAngle) / pow((1.0 + mieGCoefficient * mieGCoefficient - 2.0 * mieGCoefficient * cosAngle * cosAngle), 3.0 / 2.0));',
        '#endif',

        'gatheredInscatteredIntensity += inscatteredLight * phaseValue;',
      '}',
      'return gatheredInscatteredIntensity * PI_TIMES_FOUR / $numberOfChunks;',
    '}',

    'void main(){',
      '//This is actually a packed 3D Texture',
      'vec3 uv = get3DUVFrom2DUV(gl_FragCoord.xy / resolution.xy);',
      'float r = inverseParameterizationOfYToRPlusRe(uv.y);',
      'float h = r - RADIUS_OF_EARTH;',
      'vec2 pA = vec2(0.0, r);',
      'vec2 p = pA;',
      'float cosOfViewZenith = inverseParameterizationOfXToCosOfViewZenith(uv.x);',
      'float cosOfSunZenith = inverseParameterizationOfZToCosOfSunZenith(uv.z);',
      '//sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction',
      'vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);',
      'float cameraAngle = atan(cameraDirection.x, cameraDirection.y);',
      'vec2 sunDirection = vec2(sqrt(1.0 - cosOfSunZenith * cosOfSunZenith), cosOfSunZenith);',
      'float initialSunAngle = atan(sunDirection.x, sunDirection.y);',

      '//Check if we intersect the earth. If so, return a transmittance of zero.',
      '//Otherwise, intersect our ray with the atmosphere.',
      'vec2 pB = intersectRaySphere(vec2(0.0, r), cameraDirection);',
      'float distFromPaToPb = distance(pA, pB);',
      'float chunkLength = distFromPaToPb / $numberOfChunks;',
      'vec2 direction = (pB - pA) / distFromPaToPb;',
      'vec2 deltaP = direction * chunkLength;',

      'vec3 totalInscattering = vec3(0.0);',
      '//Prime our trapezoidal rule',
      'float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',
      'float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',
      'float totalDensityMie = 0.0;',
      'float totalDensityRayleigh = 0.0;',

      'vec3 transmittancePaToP = vec3(1.0);',
      '//Was better when this was just the initial angle of the sun',
      'vec2 uvt = vec2(parameterizationOfCosOfZenithToX(cosOfSunZenith), parameterizationOfHeightToY(r));',
      'vec3 transmittance = transmittancePaToP * texture2D(transmittanceTexture, uvt).rgb;',

      'vec3 previousMieInscattering = previousMieDensity * transmittance;',
      'vec3 previousRayleighInscattering = previousRayleighDensity * transmittance;',

      '#if($isRayleigh)',
        'vec3 previousInscattering = previousMieDensity * transmittance;',
      '#else',
        'vec3 previousInscattering = previousRayleighDensity * transmittance;',
      '#endif',

      '//Integrate from Pa to Pb to determine the total transmittance',
      '//Using the trapezoidal rule.',
      'float mieDensity;',
      'float rayleighDensity;',
      'float integralOfOzoneDensityFunction;',
      'float r_p;',
      'float sunAngle;',
      'vec3 inscattering;',
      '#pragma unroll',
      'for(int i = 1; i < $numberOfChunksInt; i++){',
        'p += deltaP;',
        'r_p = length(p);',
        'h = r_p - RADIUS_OF_EARTH;',
        '//Only inscatter if this point is inside of the earth',
        '//otherwise it contributes nothing to the final result',
        'if(h > 0.0){',
          '//Do I add or subtract the angle? O_o',
          'sunAngle = initialSunAngle + atan(p.x, p.y);',

          '//Iterate our progress through the transmittance along P',
          'mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',
          'rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',
          'totalDensityMie += (previousMieDensity + mieDensity) * chunkLength * 0.5;',
          'totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength * 0.5;',
          'integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;',
          'transmittancePaToP = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));',

          '//Now that we have the transmittance from Pa to P, get the transmittance from P to Pc',
          '//and combine them to determine the net transmittance',
          'uvt = vec2(parameterizationOfCosOfZenithToX(cos(sunAngle)), parameterizationOfHeightToY(r_p));',
          'transmittance = transmittancePaToP * texture2D(transmittanceTexture, uvt).rgb;',
          '#if($isRayleigh)',
            'inscattering = rayleighDensity * transmittance * gatherInscatteredLight(r_p, cameraAngle, sunAngle);',
          '#else',
            'inscattering = mieDensity * transmittance * gatherInscatteredLight(r_p, cameraAngle, sunAngle);',
          '#endif',
          'totalInscattering += (previousInscattering + inscattering) * chunkLength;',

          '//Store our values for the next iteration',
          'previousInscattering = inscattering;',
          'previousMieDensity = mieDensity;',
          'previousRayleighDensity = rayleighDensity;',
        '}',
      '}',
      '#if($isRayleigh)',
        'totalInscattering *= ONE_OVER_EIGHT_PI * intensity * RAYLEIGH_BETA;',
      '#else',
        'totalInscattering *= ONE_OVER_EIGHT_PI * intensity * EARTH_MIE_BETA_EXTINCTION;',
      '#endif',

      'gl_FragColor = vec4(totalInscattering, 1.0);',
    '}',
    ];

    let updatedLines = [];
    let numberOfChunks = numberOfPoints - 1;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$numberOfChunksInt/g, numberOfChunks);
      updatedGLSL = updatedGLSL.replace(/\$atmosphereFunctions/g, packingHeight);
      updatedGLSL = updatedGLSL.replace(/\$numberOfChunks/g, numberOfChunks.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$mieGCoefficient/g, mieGCoefficient.toFixed(16));

      //Choose which texture to use
      updatedGLSL = updatedGLSL.replace(/\$isRayleigh/g, isRayleigh ? '1' : '0');

      //Texture depth is packingWidth * packingHeight
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};
