//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
//Currently has no uniforms, but might get them in the future
StarrySky.materials.atmosphere.transmittanceMaterial = {
  uniforms: {},
  fragmentShader: function(numberOfPoints){
    let originalGLSL = [
    '//Based on the thesis of from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',
    '//By Gustav Bodare and Edvard Sandberg',

    'const float RADIUS_OF_EARTH = 6366.7;',
    'const float RADIUS_OF_EARTH_SQUARED = 40534868.89;',
    'const float RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED = 1025072.0;',
    'const float ATMOSPHERE_HEIGHT = 80.0;',
    'const float ATMOSPHERE_HEIGHT_SQUARED = 6400.0;',
    'const float ONE_OVER_MIE_SCALE_HEIGHT = 0.833333333333333333333333333333333333;',
    'const float ONE_OVER_RAYLEIGH_SCALE_HEIGHT = 0.125;',
    'const float OZONE_PERCENT_OF_RAYLEIGH = 0.0000006;',
    '//Mie Beta / 0.9, http://www-ljk.imag.fr/Publications/Basilic/com.lmc.publi.PUBLI_Article@11e7cdda2f7_f64b69/article.pdf',
    '//const float EARTH_MIE_BETA_EXTINCTION = 0.00000222222222222222222222222222222222222222;',
    'const float EARTH_MIE_BETA_EXTINCTION = 0.0044444444444444444444444444444444444444444444;',

    '//8 * (PI^3) *(( (n_air^2) - 1)^2) / (3 * N_atmos * ((lambda_color)^4))',
    '//(http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf - page 10)',
    '//n_air = 1.00029',
    '//N_atmos = 2.545e25',
    '//lambda_red = 650nm',
    '//labda_green = 510nm',
    '//lambda_blue = 475nm',
    'const vec3 RAYLEIGH_BETA = vec3(5.8e-3, 1.35e-2, 3.31e-2);',

    '//As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html',
    'const vec3 OZONE_BETA = vec3(413.470734338, 413.470734338, 2.1112886E-13);',

    '//Variation of the ideas from Page 178 of Real Time Collision Detection, by Christer Ericson',
    'vec2 intersectRaySphere(vec2 rayOrigin, vec2 rayDirection){',
      'float tc = dot(-rayOrigin, rayDirection);',
      'float y = length(rayOrigin + rayDirection * tc);',
      'float rA = RADIUS_OF_EARTH + ATMOSPHERE_HEIGHT;',
      'float x = sqrt(rA * rA - y * y);',

      'return vec2(x, y);',
    '}',

    'void main(){',
      'vec2 uv = gl_FragCoord.xy / resolution.xy;',
      '//Height and view angle is parameterized',
      '//Calculate these and determine the intersection of the ray and the edge of the',
      "//Earth's atmosphere.",
      'float r = sqrt(uv.y * uv.y * RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED + RADIUS_OF_EARTH_SQUARED);',
      'float h = r - RADIUS_OF_EARTH;',
      'vec2 pA = vec2(0.0, r);',
      'vec2 p = pA;',
      'float cosOfViewZenith = 2.0 * uv.x - 1.0;',
      'vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);',

      '//Check if we intersect the earth. If so, return a transmittance of zero.',
      '//Otherwise, intersect our ray with the atmosphere.',

      'vec2 pB = intersectRaySphere(vec2(0.0, r), cameraDirection);',
      'vec3 transmittance = vec3(0.0);',
      'if(pB.y > RADIUS_OF_EARTH){',
        'float distFromPaToPb = distance(pA, pB);',
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

        'float integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;',
        'transmittance = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));',
      '}',

      'gl_FragColor = vec4(transmittance, 1.0);',
    '}',
    ];

    let updatedLines = [];
    let numberOfChunks = numberOfPoints - 1;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$numberOfChunksInt/g, numberOfChunks);
      updatedGLSL = updatedGLSL.replace(/\$numberOfChunks/g, numberOfChunks.toFixed(1));


      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};
