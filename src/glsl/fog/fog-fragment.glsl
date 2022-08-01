//Oh... Well isn't this fun. Turns out that old code isn't dead after all...
//All the way back from version 0.3!
#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor);
  #else
    vec4 fogOutData = atmosphericFogMethod();
    //fogOutData.rgb = MyAESFilmicToneMapping(fogOutData.rgb);
    fogOutData.rgb = fogsRGBToLinear(vec4(fogOutData.rgb, 1.0)).rgb;
    //fogGroundFex = groundLightingFex();
    vec3 groundLightingForFog = fogsRGBToLinear(vec4(gl_FragColor.rgb, 1.0)).rgb;
    //groundLightingForFog *= fogGroundFex;
    gl_FragColor.rgb = mix(groundLightingForFog, fogOutData.rgb, fogOutData.a);
    gl_FragColor.rgb = fogLinearTosRGB(vec4(gl_FragColor.rgb, 1.0)).rgb;
    gl_FragColor.rgb = MyAESFilmicToneMapping(gl_FragColor.rgb);
  #endif
#endif
