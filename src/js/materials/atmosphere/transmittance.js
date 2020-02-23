//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
//Currently has no uniforms, but might get them in the future
StarrySky.Materials.Atmosphere.transmittanceMaterial = {
  uniforms: {},
  fragmentShader: function(numberOfPoints, atmosphereFunctions){
    let originalGLSL = [
    '//Based on the thesis of from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',
    '//By Gustav Bodare and Edvard Sandberg',

    '$atmosphericFunctions',

    'void main(){',
      'vec2 uv = gl_FragCoord.xy / resolution.xy;',
      'float r = inverseParameterizationOfYToRPlusRe(uv.y);',
      'float h = r - RADIUS_OF_EARTH;',
      'vec2 pA = vec2(0.0, r);',
      'vec2 p = pA;',
      'float cosOfViewZenith = inverseParameterizationOfXToCosOfViewZenith(uv.x);',
      '//sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction',
      'vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);',

      '//Check if we intersect the earth. If so, return a transmittance of zero.',
      '//Otherwise, intersect our ray with the atmosphere.',
      'vec2 pB = intersectRaySphere(vec2(0.0, r), cameraDirection);',
      'vec3 transmittance = vec3(0.0);',
      'float distFromPaToPb = 0.0;',
      'bool intersectsEarth = intersectsSphere(p, cameraDirection, RADIUS_OF_EARTH);',
      'if(!intersectsEarth){',
        'distFromPaToPb = distance(pA, pB);',
        'float chunkLength = distFromPaToPb / $numberOfChunks;',
        'vec2 direction = (pB - pA) / distFromPaToPb;',
        'vec2 deltaP = direction * chunkLength;',

        '//Prime our trapezoidal rule',
        'float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',
        'float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',
        'float totalDensityMie = 0.0;',
        'float totalDensityRayleigh = 0.0;',

        '//Integrate from Pa to Pb to determine the total transmittance',
        '//Using the trapezoidal rule.',
        'float mieDensity;',
        'float rayleighDensity;',
        '#pragma unroll',
        'for(int i = 1; i < $numberOfChunksInt; i++){',
          'p += deltaP;',
          'h = length(p) - RADIUS_OF_EARTH;',
          'mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',
          'rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',
          'totalDensityMie += (previousMieDensity + mieDensity) * chunkLength;',
          'totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength;',

          '//Store our values for the next iteration',
          'previousMieDensity = mieDensity;',
          'previousRayleighDensity = rayleighDensity;',
        '}',
        'totalDensityMie *= 0.5;',
        'totalDensityRayleigh *= 0.5;',

        '//float integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;',
        'float integralOfOzoneDensityFunction = 0.0;',
        'transmittance = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));',
      '}',

      'gl_FragColor = vec4(transmittance, 1.0);',
    '}',
    ];

    let updatedLines = [];
    let numberOfChunks = numberOfPoints - 1;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$numberOfChunksInt/g, numberOfChunks);
      updatedGLSL = updatedGLSL.replace(/\$numberOfChunks/g, numberOfChunks.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$atmosphericFunctions/g, atmosphereFunctions);

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};
