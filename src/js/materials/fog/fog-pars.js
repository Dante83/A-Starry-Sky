StarrySky.Materials.Fog.fogParsMaterial = {
  fragmentShader: function(rayleigh, exposure, groundFexDistanceMultiplier, useAdvancedAtmospehericPerspective, atmosphericParameters){
    let originalGLSL = [
    '#ifdef USE_FOG',
      'uniform vec3 fogColor; //Phi-Theta of Sun and Phi of Mooon',
      'varying float vFogDepth;',
      '#ifdef FOG_EXP2',
        'uniform float fogDensity;',
      '#else',
        'uniform float fogNear;',
        'uniform float fogFar;',
        '#if($useAdvancedAtmospehericPerspective)',
          'varying vec3 vFogWorldPosition;',
          'varying vec3 vSunDirection;',
          'varying vec3 vMoonDirection;',
          'varying vec3 vSunE;          // Sun radiance, color-shifted by atmospheric extinction',
          'varying vec3 vMoonE;         // Moon radiance, color-shifted by atmospheric extinction',
          'varying vec3 vMoonLightColor;',

          'const float fogLightExposure = $exposure;',
          'const float groundFexDistanceMultiplier = $groundFexDistanceMultiplier;',

          '// Same beta values as the sky LUT bake (template-substituted from sky-atmospheric-parameters,',
          '// converted from per-km to per-meter to match world-space distances).',
          'const vec3 betaR = $rayleighBeta;',
          'const vec3 betaM = $mieBeta;',
          'const vec3 betaExt = betaR + betaM;',

          '// Cornette-Shanks Mie phase function -- matches atmosphere-functions.glsl miePhaseFunction.',
          'const float MIE_G = $mieDirectionalG;',
          'const float MIE_G_SQUARED = MIE_G * MIE_G;',
          'const float MIE_PHASE_COEFF = 1.5 * (1.0 - MIE_G_SQUARED) / (2.0 + MIE_G_SQUARED);',
          'const float THREE_OVER_SIXTEEN_PI = 0.05968310365946075;',

          'const vec3 up = vec3(0.0, 1.0, 0.0);',
          'const float pi = 3.1415926535897932;',

          'vec4 fogsRGBToLinear(vec4 value ) {',
          '	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );',
          '}',

          'vec4 fogLinearTosRGB(vec4 value ) {',
          '	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );',
          '}',

          'vec3 MyAESFilmicToneMapping(vec3 color) {',
            'return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);',
          '}',

          'float rayleighPhase( float cosTheta ) {',
            'return THREE_OVER_SIXTEEN_PI * ( 1.0 + cosTheta * cosTheta );',
          '}',

          '// The sky LUTs bake 7 orders of multiple scattering which smooth the Mie forward peak;',
          '// single-scatter fog has no such smoothing, so we cap the peak to avoid the un-physical',
          '// brightness blowout when looking near the sun. Cap value chosen to produce a forward',
          '// lobe slightly stronger than the Henyey-Greenstein equivalent at g=0.8 (~3.6).',
          'const float MIE_PHASE_CAP = 5.0;',
          'float miePhase( float cosTheta ) {',
            'float t = 1.0 + MIE_G_SQUARED - 2.0 * MIE_G * cosTheta;',
            'return min(MIE_PHASE_COEFF * ((1.0 + cosTheta * cosTheta) / (t * sqrt(t))), MIE_PHASE_CAP);',
          '}',

          '// Single-scattering aerial perspective using the same beta values and phase functions',
          "// as the Elek sky LUT bake, so ground objects' atmospheric perspective matches the sky.",
          '// vLightE is the source radiance already attenuated by sun-to-observer Kasten-Young',
          "// extinction in the vertex shader (so it's wavelength-shifted -- red at horizon).",
          '// Standard analytic form: integral_0^d beta_sca * P(theta) * E * exp(-beta_ext * x) dx',
          '//                       = (beta_sca * P(theta) / beta_ext) * (1 - exp(-beta_ext * d)) * E',
          'vec3 addLightSource(vec3 viewDirection, vec3 lightDirection, vec3 vLightE, float distToPoint, out vec3 Fex){',
            'Fex = exp(-betaExt * distToPoint);',
            'float cosTheta = dot(viewDirection, lightDirection);',
            'vec3 phaseScatter = betaR * rayleighPhase(cosTheta) + betaM * miePhase(cosTheta);',
            'return (phaseScatter / max(betaExt, vec3(1e-9))) * (vec3(1.0) - Fex) * vLightE;',
          '}',

          'vec3 atmosphericFogMethod() {',
            'vec3 vecToPoint = vFogWorldPosition - cameraPosition;',
            'float distToPoint = length(vecToPoint) * groundFexDistanceMultiplier;',
            'vec3 viewDirection = normalize(vecToPoint);',

            'vec3 FexSun;',
            'vec3 LSun = addLightSource(viewDirection, vSunDirection, vSunE, distToPoint, FexSun);',
            'vec3 FexMoon;',
            'vec3 LMoon = vMoonLightColor * addLightSource(viewDirection, vMoonDirection, vMoonE, distToPoint, FexMoon);',

            'return fogLightExposure * (LSun + LMoon);',
          '}',
        '#endif',
      '#endif',
    '#endif',
    ];

    let updatedLines = [];
    let rayBet = JSON.parse(JSON.stringify(atmosphericParameters.rayleighBeta));
    rayBet.red *= 0.001;
    rayBet.green *= 0.001;
    rayBet.blue *= 0.001;
    const rayleighBeta = `vec3(${rayBet.red.toFixed(16)}, ${rayBet.green.toFixed(16)}, ${rayBet.blue.toFixed(16)})`;
    let mieBet = JSON.parse(JSON.stringify(atmosphericParameters.mieBeta));
    mieBet.red *= 0.001;
    mieBet.green *= 0.001;
    mieBet.blue *= 0.001;
    const mieBeta = `vec3(${mieBet.red.toFixed(16)}, ${mieBet.green.toFixed(16)}, ${mieBet.blue.toFixed(16)})`;
    const mieScaleHeight = atmosphericParameters.mieScaleHeight * 1000.0;
    const rayleighScaleHeight = atmosphericParameters.rayleighScaleHeight * 1000.0;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$mieDirectionalG/g, atmosphericParameters.mieDirectionalG.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$rayleighBeta/g, rayleighBeta);
      updatedGLSL = updatedGLSL.replace(/\$mieBeta/g, mieBeta);
      updatedGLSL = updatedGLSL.replace(/\$rayleighScaleHeight/g, rayleighScaleHeight.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$rayleigh/g, rayleigh.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$exposure/g, exposure.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$groundFexDistanceMultiplier/g, groundFexDistanceMultiplier.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$mieScaleHeight/g, mieScaleHeight.toFixed(5));

      if(useAdvancedAtmospehericPerspective){
        updatedGLSL = updatedGLSL.replace(/\$useAdvancedAtmospehericPerspective/g, '1');
      }
      else{
        updatedGLSL = updatedGLSL.replace(/\$useAdvancedAtmospehericPerspective/g, '0');
      }

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  },
  vertexShader: function(rayleigh, turbidty, groundDistanceMultp, solarRadius, lunarRadius, useAdvancedAtmospehericPerspective, atmosphericParameters){
    let originalGLSL = [
    '#ifdef USE_FOG',
    'varying float vFogDepth;',
      '#ifndef FOG_EXP2',
        '#if($useAdvancedAtmospehericPerspective)',
          'varying vec3 vFogWorldPosition;',
          'varying vec3 vSunDirection;',
          'varying vec3 vMoonDirection;',
          'varying vec3 vSunE;          // Sun radiance reaching observer, color-shifted by atmosphere',
          'varying vec3 vMoonE;         // Moon radiance reaching observer, color-shifted by atmosphere',
          'varying vec3 vMoonLightColor;',

          'uniform vec3 fogColor; //Altitude, Azimuth of Sun and Altitude of Mooon',
          'uniform float fogNear; //Azimuth of moon',
          'uniform float fogFar;  //Intensity of moon (negated; sign-bit flag for advanced mode)',
          'const float sunRadius = $solarRadius;',
          'const float moonRadius = $lunarRadius;',
          'const vec3 up = vec3(0.0, 1.0, 0.0);',
          'const float e = 2.7182818284590452;',
          'const float pi = 3.1415926535897932;',
          'const float piOver2 = 1.57079632679;',
          'const float sqrtOf2 = 1.41421356237;',

          '// Same beta values as the sky LUT bake (per-meter, matching world-space distances).',
          'const vec3 betaR = $rayleighBeta;',
          'const vec3 betaM = $mieBeta;',

          '// Vertical optical depth at zenith (in meters; scale heights are pre-multiplied by 1000).',
          'const float rayleighZenithLength = $rayleighScaleHeight;',
          'const float mieZenithLength = $mieScaleHeight;',

          '// Analytic horizon falloff for source intensity (sun/moon dim as they approach',
          '// the horizon and below). Cleaner than passing sunHorizonFade through fog.color',
          '// would require encoding more bits than we have available in the existing fog',
          '// uniform smuggle.',
          'const float cutoffAngle = 1.6110731556870734;  // pi / 1.95 -- slightly past horizon',
          'const float steepness = 1.5;',
          'float sourceIntensity( float zenithAngleCos, float EE ) {',
            'zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );',
            'return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );',
          '}',

          '// Kasten-Young 1989 air-mass approximation. Returns the multiplicative factor',
          '// (relative to vertical column) by which the atmospheric path length increases',
          '// for a given zenith angle. Matches what the Elek LUT integrates analytically.',
          'float airMass( float zenithAngleCos ) {',
            'float zenithAngleDeg = acos(clamp(zenithAngleCos, -1.0, 1.0)) * 180.0 / pi;',
            'return 1.0 / ( zenithAngleCos + 0.15 * pow( max(0.001, 93.885 - zenithAngleDeg), -1.253 ) );',
          '}',

          '// Sun/moon radiance reaching the observer through the vertical atmospheric column,',
          '// wavelength-attenuated. This is what makes the sun redden as it approaches the horizon.',
          'vec3 sourceIntensityWithExtinction( vec3 lightDirection, float EE ){',
            'float cosZ = dot( up, lightDirection );',
            'float E = sourceIntensity( cosZ, EE );',
            'if( E <= 0.0 ) return vec3(0.0);',
            'float am = airMass( cosZ );',
            'vec3 Fex = exp( -( betaR * rayleighZenithLength + betaM * mieZenithLength ) * am );',
            'return E * Fex;',
          '}',

          'vec3 convertRhoThetaToXYZ(vec2 altitudeAzimuth){',
            'vec3 outPosition;',
            'outPosition.x = -sin(altitudeAzimuth.x) * sin(altitudeAzimuth.y);',
            'outPosition.z = -sin(altitudeAzimuth.x) * cos(altitudeAzimuth.y);',
            'outPosition.y = cos(altitudeAzimuth.x);',
            'return normalize(outPosition);',
          '}',

          'float solarEclipseLightingModifier(vec3 sunPosition, vec3 moonPosition){',
            'float distanceBetweenSunAndMoon = distance(sunPosition, moonPosition);',
            'float lightingModifier = 1.0;',
            'if(distanceBetweenSunAndMoon <= (2.0 * sqrtOf2 * max(sunRadius, moonRadius))){',
              'float sunRadiusSquared = sunRadius * sunRadius;',
              'float moonRadiusSquared = moonRadius * moonRadius;',
              'float x = (sunRadiusSquared - moonRadiusSquared + distanceBetweenSunAndMoon * distanceBetweenSunAndMoon)/(2.0 * distanceBetweenSunAndMoon);',
              'float z = x * x;',
              'float y = sqrt(sunRadiusSquared - z);',

              'float ecclipsedArea = 0.0;',
              'if (distanceBetweenSunAndMoon < abs(moonRadius - sunRadius)) {',
                'ecclipsedArea = pi * min(sunRadiusSquared, moonRadiusSquared);',
              '}',
              'else{',
                'ecclipsedArea = sunRadiusSquared * asin(y / sunRadius) + moonRadiusSquared * asin(y / moonRadius) - y * (x + sqrt(z + moonRadiusSquared - sunRadiusSquared));',
              '}',
              'float surfaceAreaOfSun = pi * sunRadiusSquared;',
              'lightingModifier = clamp((surfaceAreaOfSun - ecclipsedArea) / surfaceAreaOfSun, 0.0, 1.0);',
            '}',
            'return lightingModifier;',
          '}',

          'vec3 lunarEclipseLightingModifier(vec3 sunPosition, vec3 moonPosition){',
            'float distanceBetweenMoonAndAntiSun = distance(-sunPosition, moonPosition);',
            'vec3 lightingColor = vec3(1.0, 0.5, 0.1);',
            'if(distanceBetweenMoonAndAntiSun <= (2.0 * sqrtOf2 * max(sunRadius, moonRadius))){',
              'float moonRadiusSquared = moonRadius * moonRadius;',
              'float distanceToEarthsShadowSquared = distanceBetweenMoonAndAntiSun * distanceBetweenMoonAndAntiSun;',

              '//Determine the color of the moonlight used for atmospheric scattering',
              'float colorIntensity = clamp(distanceToEarthsShadowSquared / moonRadiusSquared, 0.0, 1.0);',
              'float lightIntensity = clamp(distanceToEarthsShadowSquared / moonRadiusSquared, 0.0, 0.8);',
              'lightingColor = clamp(lightingColor + (vec3(1.0) - lightingColor) * colorIntensity, vec3(0.0), vec3(1.0));',
              'lightingColor *= lightIntensity + 0.2;',
            '}',
            'return lightingColor;',
          '}',
        '#endif',
      '#endif',
    '#endif',
    ];

    let updatedLines = [];
    let rayBet = JSON.parse(JSON.stringify(atmosphericParameters.rayleighBeta));
    rayBet.red *= 0.001;
    rayBet.green *= 0.001;
    rayBet.blue *= 0.001;
    const rayleighBeta = `vec3(${rayBet.red.toFixed(16)}, ${rayBet.green.toFixed(16)}, ${rayBet.blue.toFixed(16)})`;
    let mieBet = JSON.parse(JSON.stringify(atmosphericParameters.mieBeta));
    mieBet.red *= 0.001;
    mieBet.green *= 0.001;
    mieBet.blue *= 0.001;
    const mieBeta = `vec3(${mieBet.red.toFixed(16)}, ${mieBet.green.toFixed(16)}, ${mieBet.blue.toFixed(16)})`;
    const mieCoefficient = atmosphericParameters.mieBeta.red;
    const mieScaleHeight = atmosphericParameters.mieScaleHeight * 1000.0;
    const rayleighScaleHeight = atmosphericParameters.rayleighScaleHeight * 1000.0;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$turbidty/g, turbidty.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$rayleighScaleHeight/g, rayleighScaleHeight.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$rayleighBeta/g, rayleighBeta);
      updatedGLSL = updatedGLSL.replace(/\$mieBeta/g, mieBeta);
      updatedGLSL = updatedGLSL.replace(/\$rayleigh/g, rayleigh.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$mieCoefficient/g, mieCoefficient.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$groundFexDistanceMultiplier/g, groundDistanceMultp.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$solarRadius/g, solarRadius.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$lunarRadius/g, lunarRadius.toFixed(5));
      updatedGLSL = updatedGLSL.replace(/\$mieScaleHeight/g, mieScaleHeight.toFixed(5));

      if(useAdvancedAtmospehericPerspective){
        updatedGLSL = updatedGLSL.replace(/\$useAdvancedAtmospehericPerspective/g, '1');
      }
      else{
        updatedGLSL = updatedGLSL.replace(/\$useAdvancedAtmospehericPerspective/g, '0');
      }

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};
