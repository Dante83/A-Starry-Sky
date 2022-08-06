#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  #ifndef FOG_EXP2
    #if($useAdvancedAtmospehericPerspective)
      //Use the sign bit on fog near to decide whether to keep the original behavior
      //or use the advanced fog lighting method - that way we destroy nothing...
      //Although if advanced fog is disabled, none of this should happen at all.
      if(fogFar <= 0.0){
      	vFogWorldPosition = worldPosition.xyz;

        //
        //Sun values
        //
        vec2 sunAltitudeAzimuth = fogColor.xy;
        vec3 sunPosition = convertRhoThetaToXYZ(sunAltitudeAzimuth);
      	vSunDirection = normalize(sunPosition);
      	vSunE = sourceIntensity( dot( vSunDirection, up ), 1300.0 ); //Sun EE is constant at 1300.0
      	vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y ) ), 0.0, 1.0 );

      	float rayleighCoefficientSun = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

        // extinction (absorbtion + out scattering)
      	// rayleigh coefficients
      	vBetaRSun = totalRayleigh * rayleighCoefficientSun;

        // mie coefficients
      	vBetaM = totalMie( turbidity ) * mieCoefficient;

        //
        //Moon
        //
        float moonEE = -fogFar; //the uniform's true value
        vec2 moonAlitudeAzimuth = vec2(fogColor.z, fogNear); //Swap the sign bit on fogNear
        vec3 moonPosition = convertRhoThetaToXYZ(moonAlitudeAzimuth);
        vMoonDirection = normalize(moonPosition);
      	vMoonE = sourceIntensity( dot( vMoonDirection, up ), moonEE);
      	vMoonfade = 1.0 - clamp( 1.0 - exp( ( moonPosition.y ) ), 0.0, 1.0 );

      	float rayleighCoefficientMoon = rayleigh - ( 1.0 * ( 1.0 - vMoonfade ) );

      	// extinction (absorbtion + out scattering)
      	// rayleigh coefficients
      	vBetaRMoon = totalRayleigh * rayleighCoefficientMoon;

        //Pixel
        float fogPixelFade = 1.0 - clamp(1.0 - exp(normalize(vFogWorldPosition).y), 0.0, 1.0);
        float rayleighCoefficientPixel = rayleigh - ( 1.0 * ( 1.0 - fogPixelFade ) );
        vec3 betaRPixel = totalRayleigh * rayleighCoefficientPixel;
        // optical length
        // cutoff angle at 90 to avoid singularity in next formula.
        float fogDistToPoint = length(vFogWorldPosition - cameraPosition) * groundFexDistanceMultiplier;

        // combined extinction factor
        float sR = fogDistToPoint;
        float sM = fogDistToPoint;

        // combined extinction factor
        vFexPixel = sqrt(clamp(exp( -( betaRPixel * sR + vBetaM * sM ) ), 0.0, 1.0));
      }
      else{
        vFogDepth = - mvPosition.z;
      }
    #else
      vFogDepth = - mvPosition.z;
    #endif
  #endif
#endif
