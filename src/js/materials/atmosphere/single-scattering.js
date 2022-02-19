StarrySky.Materials.Atmosphere.singleScatteringMaterial = {
  uniforms: {
    transmittanceTexture: {value: null}
  },
  fragmentShader: function(numberOfPoints, textureWidth, textureHeight, packingWidth, packingHeight, atmosphereFunctions){
    let originalGLSL = [
    'precision highp float;',
    'precision highp int;',
    '//Based on the work of Oskar Elek',
    '//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf',
    '//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',
    '//by Gustav Bodare and Edvard Sandberg',


    'layout(location = 0) out vec4 mieOutColor;',
    'layout(location = 1) out vec4 rayleighOutColor;',
    'layout(location = 2) out vec4 mieSumOutColor;',
    'layout(location = 3) out vec4 rayleighSumOutColor;',

    'uniform sampler2D transmittanceTexture;',

    '$atmosphericFunctions',

    'void main(){',
      '//This is actually a packed 3D Texture',
      'vec3 uv = get3DUVFrom2DUV(gl_FragCoord.xy/resolution.xy);',
      'vec2 uv2 = getUV2From3DUV(uv);',
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
      'vec2 direction = (pB - pA) / distFromPaToPb;',
      'vec2 deltaP = direction * chunkLength;',

      'bool intersectsEarth = intersectsSphere(p, cameraDirection, RADIUS_OF_EARTH);',
      'vec3 totalMieInscattering = vec3(0.0);',
      'vec3 totalRayleighInscattering = vec3(0.0);',
      'if(!intersectsEarth){',
        '//Prime our trapezoidal rule',
        'float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',
        'float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',
        'float totalDensityMie = 0.0;',
        'float totalDensityRayleigh = 0.0;',

        'vec3 transmittancePaToP = vec3(1.0);',
        '//Was better when this was just the initial angle of the sun',
        'vec2 uvt = vec2(parameterizationOfCosOfViewZenithToX(cosOfSunZenith), parameterizationOfHeightToY(r));',
        'vec3 transmittance = transmittancePaToP * texture(transmittanceTexture, uvt).rgb;',
        'vec3 previousMieInscattering = previousMieDensity * transmittance;',
        'vec3 previousRayleighInscattering = previousRayleighDensity * transmittance;',

        '//Integrate from Pa to Pb to determine the total transmittance',
        '//Using the trapezoidal rule.',
        'float mieDensity;',
        'float rayleighDensity;',
        'float integralOfOzoneDensityFunction;',
        'float r_p;',
        'float sunAngle;',
        'vec3 mieInscattering;',
        'vec3 rayleighInscattering;',
        '#pragma unroll_loop_start',
        'for(int i = 1; i < $numberOfChunksInt; i++){',
          'p += deltaP;',
          'r_p = length(p);',
          'h = r_p - RADIUS_OF_EARTH;',

          '//Only inscatter if this point is outside of the earth',
          '//otherwise it contributes nothing to the final result',
          'if(h > 0.0){',
            'sunAngle = initialSunAngle - atan(p.x, p.y);',

            '//Iterate our progress through the transmittance along P',
            '//We do this for both mie and rayleigh as we are reffering to the transmittance here',
            'mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',
            'rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',
            'totalDensityMie += (previousMieDensity + mieDensity) * chunkLength * 0.5;',
            'totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength * 0.5;',
            'integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;',
            'transmittancePaToP = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));',

            '//Now that we have the transmittance from Pa to P, get the transmittance from P to Pc',
            '//and combine them to determine the net transmittance',
            'uvt = vec2(parameterizationOfCosOfViewZenithToX(cos(sunAngle)), parameterizationOfHeightToY(r_p));',
            'transmittance = transmittancePaToP * texture(transmittanceTexture, uvt).rgb;',
            'mieInscattering = mieDensity * transmittance;',
            'rayleighInscattering = rayleighDensity * transmittance;',
            'totalMieInscattering += (previousMieInscattering + mieInscattering) * chunkLength;',
            'totalRayleighInscattering += (previousRayleighInscattering + rayleighInscattering) * chunkLength;',

            '//Store our values for the next iteration',
            'previousMieInscattering = mieInscattering;',
            'previousRayleighInscattering = rayleighInscattering;',
            'previousMieDensity = mieDensity;',
            'previousRayleighDensity = rayleighDensity;',
          '}',
        '}',
        '#pragma unroll_loop_end',

        '//Note that we ignore intensity until the final render as a multiplicative factor',
        'totalMieInscattering *= ONE_OVER_EIGHT_PI * EARTH_MIE_BETA_EXTINCTION;',
        'totalRayleighInscattering *= ONE_OVER_EIGHT_PI * RAYLEIGH_BETA;',
      '}',

      'mieOutColor = max(vec4(totalMieInscattering, 1.0), vec4(0.0));',
      'rayleighOutColor = max(vec4(totalRayleighInscattering, 1.0), vec4(0.0));',
      'mieSumOutColor = mieOutColor;',
      'rayleighSumOutColor = rayleighOutColor;',
    '}',
    ];

    let updatedLines = [];
    let numberOfChunks = numberOfPoints - 1;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$numberOfChunksInt/g, numberOfChunks);
      updatedGLSL = updatedGLSL.replace(/\$atmosphericFunctions/g, atmosphereFunctions);
      updatedGLSL = updatedGLSL.replace(/\$numberOfChunks/g, numberOfChunks.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));

      //Texture depth is packingWidth * packingHeight
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};
