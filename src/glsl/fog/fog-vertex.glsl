#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  #ifndef FOG_EXP2
    #if($useAdvancedAtmospehericPerspective)
      //Use the sign bit on fog near to decide whether to keep the original behavior
      //or use the advanced fog lighting method - that way we destroy nothing...
      //Although if advanced fog is disabled, none of this should happen at all.
      if(fogFar <= 0.0){
      	vFogWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;

        //
        //Sun values
        //
        vec2 sunAltitudeAzimuth = fogColor.xy;
        vec3 sunPosition = convertRhoThetaToXYZ(sunAltitudeAzimuth);
        vec2 moonAltitudeAzimuth = vec2(fogColor.z, fogNear); //Swap the sign bit on fogNear
        vec3 moonPosition = convertRhoThetaToXYZ(moonAltitudeAzimuth);
      	vSunDirection = normalize(sunPosition);
      	vSunE = sourceIntensity( dot( vSunDirection, up ), 1300.0 ); //Sun EE is constant at 1300.0
        vSunE = solarEclipseLightingModifier(sunPosition, moonPosition) * vSunE;
      	vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y ) ), 0.0, 1.0 );

      	float rayleighCoefficientSun = rayleigh - ( 1.0 - vSunfade );

        // extinction (absorbtion + out scattering)
      	// rayleigh coefficients
      	vBetaRSun = totalRayleigh * rayleighCoefficientSun;

        // mie coefficients
      	vBetaM = totalMie( turbidity ) * mieCoefficient;

        //
        //Moon
        //
        float moonEE = -fogFar; //the uniform's true value
        vMoonDirection = normalize(moonPosition);
      	vMoonE = sourceIntensity( dot( vMoonDirection, up ), moonEE);
        vMoonLightColor = lunarEclipseLightingModifier(sunPosition, moonPosition);
      	vMoonfade = 1.0 - clamp( 1.0 - exp( ( moonPosition.y ) ), 0.0, 1.0 );

      	float rayleighCoefficientMoon = rayleigh - ( 1.0 * ( 1.0 - vMoonfade ) );

      	// extinction (absorbtion + out scattering)
      	// rayleigh coefficients
      	vBetaRMoon = totalRayleigh * rayleighCoefficientMoon;

      }
      else if(fogNear < 0.0){
        //$$OCEAN_SHADER_SHADER_VERTEX_RESERVATION$$
      }
      else{
        vFogDepth = - mvPosition.z;
      }
    #else
      vFogDepth = - mvPosition.z;
    #endif
  #endif
#endif
