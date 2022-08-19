//Oh... Well isn't this fun. Turns out that old code isn't dead after all...
//All the way back from version 0.3!
#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor);
  #else
    #if($useAdvancedAtmospehericPerspective)
      if(fogFar <= 0.0){
        vec3 fogOutData = max(atmosphericFogMethod(), 0.0);
        vec3 groundColor = fogsRGBToLinear(vec4(gl_FragColor.rgb, 1.0)).rgb;
        gl_FragColor.rgb =  fogLinearTosRGB(vec4(MyAESFilmicToneMapping(fogOutData + groundColor * vFexPixel), 1.0)).rgb;
      }
      else if(fogNear < 0.0){
        //$$OCEAN_SHADER_SHADER_FRAGMENT_RESERVATION$$
      }
      else{
        float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
      }
    #else
      float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
      gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
    #endif
  #endif
#endif
