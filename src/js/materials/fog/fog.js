StarrySky.Materials.Fog.fogMaterial = {
  fragmentShader: [
    "//Oh... Well isn't this fun. Turns out that old code isn't dead after all...",
    '//All the way back from version 0.3!',
    '#ifdef USE_FOG',
      '#ifdef FOG_EXP2',
        'float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );',
        'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor);',
      '#else',
        'vec3 fogOutData = max(atmosphericFogMethod(), 0.0);',
        'vec3 groundColor = fogsRGBToLinear(vec4(gl_FragColor.rgb, 1.0)).rgb;',
        'gl_FragColor.rgb =  fogLinearTosRGB(vec4(MyAESFilmicToneMapping(fogOutData + groundColor * vFexPixel), 1.0)).rgb;',
      '#endif',
    '#endif',
  ].join('\n'),
  vertexShader: [
    '#ifdef USE_FOG',
      'vFogDepth = - mvPosition.z;',
      '#ifndef FOG_EXP2',
      '	vFogWorldPosition = worldPosition.xyz;',

        '//',
        '//Sun values',
        '///',
        'vec2 sunAltitudeAzimuth = fogColor.xy;',
        'vec3 sunPosition = convertRhoThetaToXYZ(sunAltitudeAzimuth);',
      '	vSunDirection = normalize(sunPosition);',
      '	vSunE = sourceIntensity( dot( vSunDirection, up ), 1300.0 ); //Sun EE is constant at 1300.0',
      '	vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y ) ), 0.0, 1.0 );',

      '	float rayleighCoefficientSun = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );',

        '// extinction (absorbtion + out scattering)',
      '	// rayleigh coefficients',
      '	vBetaRSun = totalRayleigh * rayleighCoefficientSun;',

        '// mie coefficients',
      '	vBetaM = totalMie( turbidity ) * mieCoefficient;',

        '//',
        '//Moon',
        '//',
        "float moonEE = fogFar; //the uniform's true value",
        'vec2 moonAlitudeAzimuth = vec2(fogColor.z, fogNear);',
        'vec3 moonPosition = convertRhoThetaToXYZ(moonAlitudeAzimuth);',
        'vMoonDirection = normalize(moonPosition);',
      '	vMoonE = sourceIntensity( dot( vMoonDirection, up ), moonEE);',
      '	vMoonfade = 1.0 - clamp( 1.0 - exp( ( moonPosition.y ) ), 0.0, 1.0 );',

      '	float rayleighCoefficientMoon = rayleigh - ( 1.0 * ( 1.0 - vMoonfade ) );',

      '	// extinction (absorbtion + out scattering)',
      '	// rayleigh coefficients',
      '	vBetaRMoon = totalRayleigh * rayleighCoefficientMoon;',

        '//Pixel',
        'float fogPixelFade = 1.0 - clamp(1.0 - exp(normalize(vFogWorldPosition).y), 0.0, 1.0);',
        'float rayleighCoefficientPixel = rayleigh - ( 1.0 * ( 1.0 - fogPixelFade ) );',
        'vec3 betaRPixel = totalRayleigh * rayleighCoefficientPixel;',
        '// optical length',
        '// cutoff angle at 90 to avoid singularity in next formula.',
        'float fogDistToPoint = length(vFogWorldPosition - cameraPosition) * groundFexDistanceMultiplier;',

        '// combined extinction factor',
        'float sR = fogDistToPoint;',
        'float sM = fogDistToPoint;',

        '// combined extinction factor',
        'vFexPixel = sqrt(clamp(exp( -( betaRPixel * sR + vBetaM * sM ) ), 0.0, 1.0));',
      '#endif',
    '#endif',
  ].join('\n')
};
