StarrySky.Materials.Fog.fogMaterial = {
  fragmentShader: [
    "//Oh... Well isn't this fun. Turns out that old code isn't dead after all...",
    '//All the way back from version 0.3!',
    '#ifdef USE_FOG',
      '#ifdef FOG_EXP2',
        'float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );',
        'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor);',
      '#else',
        'vec4 fogOutData = atmosphericFogMethod();',
        '//fogOutData.rgb = MyAESFilmicToneMapping(fogOutData.rgb);',
        'fogOutData.rgb = fogsRGBToLinear(vec4(fogOutData.rgb, 1.0)).rgb;',
        '//fogGroundFex = groundLightingFex();',
        'vec3 groundLightingForFog = fogsRGBToLinear(vec4(gl_FragColor.rgb, 1.0)).rgb;',
        '//groundLightingForFog *= fogGroundFex;',
        'gl_FragColor.rgb = mix(groundLightingForFog, fogOutData.rgb, fogOutData.a);',
        'gl_FragColor.rgb = fogLinearTosRGB(vec4(gl_FragColor.rgb, 1.0)).rgb;',
        'gl_FragColor.rgb = MyAESFilmicToneMapping(gl_FragColor.rgb);',
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
      '	vSunE = sourceIntensity( dot( vSunDirection, up ), 1000.0 ); //Sun EE is constant at 1000.0',
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
      '#endif',
    '#endif',
  ].join('\n')
};
