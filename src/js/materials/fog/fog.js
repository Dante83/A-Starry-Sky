StarrySky.Materials.Fog.fogMaterial = {
  fragmentShader: function(useAdvancedAtmospehericPerspective){
    let originalGLSL = [
    "//Oh... Well isn't this fun. Turns out that old code isn't dead after all...",
    '//All the way back from version 0.3!',
    '#ifdef USE_FOG',
      '#ifdef FOG_EXP2',
        'float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );',
        'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor);',
      '#else',
        '#if($useAdvancedAtmospehericPerspective)',
          'if(fogFar <= 0.0){',
            'vec3 fogOutData = max(atmosphericFogMethod(), 0.0);',
            'vec3 groundColor = fogsRGBToLinear(vec4(gl_FragColor.rgb, 1.0)).rgb;',
            'float distToGround = length(vFogWorldPosition - cameraPosition) * groundFexDistanceMultiplier;',
            'vec3 Fex_ground = clamp(exp( -betaExt * distToGround ), 0.0, 1.0);',
            'gl_FragColor.rgb = fogLinearTosRGB(vec4(MyAESFilmicToneMapping(fogOutData + groundColor * Fex_ground), 1.0)).rgb;',
          '}',
          'else if(fogNear < 0.0){',
            '//$$OCEAN_SHADER_SHADER_FRAGMENT_RESERVATION$$',
          '}',
          'else{',
            'float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );',
            'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );',
          '}',
        '#else',
          'float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );',
          'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );',
        '#endif',
      '#endif',
    '#endif',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i];
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
  vertexShader: function(useAdvancedAtmospehericPerspective){
    let originalGLSL = [
    '#ifdef USE_FOG',
      'vFogDepth = - mvPosition.z;',
      '#ifndef FOG_EXP2',
        '#if($useAdvancedAtmospehericPerspective)',
          '//Use the sign bit on fog near to decide whether to keep the original behavior',
          '//or use the advanced fog lighting method - that way we destroy nothing...',
          '//Although if advanced fog is disabled, none of this should happen at all.',
          'if(fogFar <= 0.0){',
          '	vFogWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;',

            '//',
            '//Sun values',
            '//',
            'vec2 sunAltitudeAzimuth = fogColor.xy;',
            'vec3 sunPosition = convertRhoThetaToXYZ(sunAltitudeAzimuth);',
            'vec2 moonAltitudeAzimuth = vec2(fogColor.z, fogNear); //Swap the sign bit on fogNear',
            'vec3 moonPosition = convertRhoThetaToXYZ(moonAltitudeAzimuth);',
            'vSunDirection = normalize(sunPosition);',
            'vSunE = sourceIntensityWithExtinction( vSunDirection, 1300.0 ); //Sun EE constant; Kasten-Young air mass x beta extinction reddens at low altitudes',
            'vSunE *= solarEclipseLightingModifier(sunPosition, moonPosition);',

            '//',
            '//Moon',
            '//',
            "float moonEE = -fogFar; //the uniform's true value",
            'vMoonDirection = normalize(moonPosition);',
            'vMoonE = sourceIntensityWithExtinction( vMoonDirection, moonEE );',
            'vMoonLightColor = lunarEclipseLightingModifier(sunPosition, moonPosition);',
          '}',
          'else if(fogNear < 0.0){',
            '//$$OCEAN_SHADER_SHADER_VERTEX_RESERVATION$$',
          '}',
          'else{',
            'vFogDepth = - mvPosition.z;',
          '}',
        '#else',
          'vFogDepth = - mvPosition.z;',
        '#endif',
      '#endif',
    '#endif',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i];
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
