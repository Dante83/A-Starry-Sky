#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  #ifndef FOG_EXP2
  	vFogWorldPosition = worldPosition.xyz;

    //
    //Sun values
    ///
    vec2 sunAltitudeAzimuth = fogColor.xy;
    vec3 sunPosition = convertRhoThetaToXYZ(sunAltitudeAzimuth);
  	vSunDirection = normalize(sunPosition);
  	vSunE = sourceIntensity( dot( vSunDirection, up ), 1000.0 ); //Sun EE is constant at 1000.0
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
    float moonEE = fogFar; //the uniform's true value
    vec2 moonAlitudeAzimuth = vec2(fogColor.z, fogNear);
    vec3 moonPosition = convertRhoThetaToXYZ(moonAlitudeAzimuth);
    vMoonDirection = normalize(moonPosition);
  	vMoonE = sourceIntensity( dot( vMoonDirection, up ), moonEE);
  	vMoonfade = 1.0 - clamp( 1.0 - exp( ( moonPosition.y ) ), 0.0, 1.0 );

  	float rayleighCoefficientMoon = rayleigh - ( 1.0 * ( 1.0 - vMoonfade ) );

  	// extinction (absorbtion + out scattering)
  	// rayleigh coefficients
  	vBetaRMoon = totalRayleigh * rayleighCoefficientMoon;
  #endif
#endif
