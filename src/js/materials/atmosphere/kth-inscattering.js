//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Atmosphere.kthInscatteringMaterial = {
  uniforms: {
    transmittanceTexture: {type: 't', value: null},
    inscatteredLightLUT: {type: 't', value: null},
  },
  fragmentShader: function(numberOfPoints, textureWidth, textureHeight, packingWidth, packingHeight, mieGCoefficient, isRayleigh, atmosphereFunctions){
    let originalGLSL = [
    '//Based on the work of Oskar Elek',
    '//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf',
    '//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',
    '//by Gustav Bodare and Edvard Sandberg',
    'uniform sampler2D inscatteredLightLUT;',
    'uniform sampler2D transmittanceTexture;',

    'const float mieGCoefficient = $mieGCoefficient;',

    '$atmosphericFunctions',

    'const float intensity = 20.0;',

    'vec3 gatherInscatteredLight(float r, float sunAngleAtP){',
      'float x;',
      'float y = parameterizationOfHeightToY(r);',
      'float z = parameterizationOfCosOfSourceZenithToZ(sunAngleAtP);',
      'vec2 inscatteredUV2;',
      'vec3 gatheredInscatteredIntensity = vec3(0.0);',
      'vec3 transmittanceFromPToPb;',
      'vec3 inscatteredLight;',
      'float theta = 0.0;',
      'float angleBetweenCameraAndIncomingRay;',
      'float phaseValue;',
      'float cosAngle;',
      'float deltaTheta = PI_TIMES_TWO / $numberOfChunks;',

      '#pragma unroll',
      'for(int i = 1; i < $numberOfChunksInt; i++){',
        'theta += deltaTheta;',
        'x = parameterizationOfCosOfViewZenithToX(cos(theta));',
        'inscatteredUV2 = getUV2From3DUV(vec3(x, y, z));',
        'inscatteredLight = texture2D(inscatteredLightLUT, inscatteredUV2).rgb;',
        'transmittanceFromPToPb = texture2D(transmittanceTexture, vec2(x, y)).rgb;',
        'angleBetweenCameraAndIncomingRay = abs(fModulo(theta - sunAngleAtP, PI_TIMES_TWO)) - PI;',
        'cosAngle = cos(angleBetweenCameraAndIncomingRay);',
        '#if($isRayleigh)',
          'phaseValue = rayleighPhaseFunction(cosAngle);',
        '#else',
          'phaseValue = miePhaseFunction(cosAngle);',
        '#endif',

        'gatheredInscatteredIntensity += inscatteredLight * phaseValue * transmittanceFromPToPb;',
      '}',
      'return gatheredInscatteredIntensity * PI_TIMES_FOUR / $numberOfChunks;',
    '}',

    'void main(){',
      '//This is actually a packed 3D Texture',
      'vec3 uv = get3DUVFrom2DUV(gl_FragCoord.xy/resolution.xy);',
      'float r = inverseParameterizationOfYToRPlusRe(uv.y);',
      'float h = r - RADIUS_OF_EARTH;',
      'vec2 pA = vec2(0.0, r);',
      'vec2 p = pA;',
      'float cosOfViewZenith = inverseParameterizationOfXToCosOfViewZenith(uv.x);',
      'float cosOfSunZenith = inverseParameterizationOfZToCosOfSourceZenith(uv.z);',
      '//sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction',
      'vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);',
      'vec2 sunDirection = vec2(sqrt(1.0 - cosOfSunZenith * cosOfSunZenith), cosOfSunZenith);',
      'float initialSunAngle = atan(sunDirection.x, sunDirection.y);',

      '//Check if we intersect the earth. If so, return a transmittance of zero.',
      '//Otherwise, intersect our ray with the atmosphere.',
      'vec2 pB = intersectRaySphere(pA, cameraDirection);',
      'float distFromPaToPb = distance(pA, pB);',
      'float chunkLength = distFromPaToPb / $numberOfChunks;',
      'vec2 deltaP = cameraDirection * chunkLength;',

      'bool intersectsEarth = intersectsSphere(p, cameraDirection, RADIUS_OF_EARTH);',
      'vec3 totalInscattering = vec3(0.0);',
      'if(!intersectsEarth){',
        '//Prime our trapezoidal rule',
        'float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',
        'float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',
        'float totalDensityMie = 0.0;',
        'float totalDensityRayleigh = 0.0;',

        'vec3 transmittancePaToP = vec3(1.0);',
        'vec2 uvt = vec2(parameterizationOfCosOfViewZenithToX(cosOfSunZenith), parameterizationOfHeightToY(r));',

        'vec3 gatheringFunction = gatherInscatteredLight(length(p), initialSunAngle);',
        '#if($isRayleigh)',
          'vec3 previousInscattering = gatheringFunction * previousMieDensity * transmittancePaToP;',
        '#else',
          'vec3 previousInscattering = gatheringFunction * previousRayleighDensity * transmittancePaToP;',
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
          '//Only inscatter if this point is outside of the earth',
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
            'uvt = vec2(parameterizationOfCosOfViewZenithToX(cos(sunAngle)), parameterizationOfHeightToY(r_p));',
            'gatheringFunction = gatherInscatteredLight(r_p, sunAngle);',
            '#if($isRayleigh)',
              'inscattering = gatheringFunction * rayleighDensity * transmittancePaToP;',
            '#else',
              'inscattering = gatheringFunction * mieDensity * transmittancePaToP;',
            '#endif',
            'totalInscattering += (previousInscattering + inscattering) * chunkLength;',

            '//Store our values for the next iteration',
            'previousInscattering = inscattering;',
            'previousMieDensity = mieDensity;',
            'previousRayleighDensity = rayleighDensity;',
          '}',
        '}',
        '#if($isRayleigh)',
          'totalInscattering *= ONE_OVER_EIGHT_PI * RAYLEIGH_BETA;',
        '#else',
          'totalInscattering *= ONE_OVER_EIGHT_PI * EARTH_MIE_BETA_EXTINCTION;',
        '#endif',
      '}',

      'gl_FragColor = vec4(totalInscattering, 1.0);',
    '}',
    ];

    let updatedLines = [];
    let numberOfChunks = numberOfPoints - 1;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$numberOfChunksInt/g, numberOfChunks);
      updatedGLSL = updatedGLSL.replace(/\$atmosphericFunctions/g, atmosphereFunctions);
      updatedGLSL = updatedGLSL.replace(/\$numberOfChunks/g, numberOfChunks.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$mieGCoefficient/g, mieGCoefficient.toFixed(16));

      //Texture constants
      updatedGLSL = updatedGLSL.replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));


      //Choose which texture to use
      updatedGLSL = updatedGLSL.replace(/\$isRayleigh/g, isRayleigh ? '1' : '0');

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};
