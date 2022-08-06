#ifdef USE_FOG
varying float vFogDepth;
  #ifndef FOG_EXP2
    #if($useAdvancedAtmospehericPerspective)
      varying vec3 vFogWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vMoonDirection;
      varying float vMoonfade;
      varying vec3 vBetaRSun;
      varying vec3 vBetaRMoon;
      varying vec3 vBetaRFragment;
      varying vec3 vBetaM;
      varying float vSunE;
      varying float vMoonE;
      varying vec3 vFexPixel;

      uniform vec3 fogColor; //Altitude, Azimuth of Sun and Altitude of Mooon
      uniform float fogNear; //Azimuth of moon
      uniform float fogFar; //Intensity of moon
      uniform vec3 worldPosition;

    	const float rayleigh = $rayleigh;
    	const float turbidity = $turbidty;
    	const float mieCoefficient = $mieCoefficient;
      const float groundFexDistanceMultiplier = $groundFexDistanceMultiplier;
    	const vec3 up = vec3(0.0, 1.0, 0.0);
    	const float e = 2.7182818284590452;
    	const float pi = 3.1415926535897932;
      const float piOver2 = 1.57079632679;
      const float rayleighZenithLength = 8.4E3;
      const float mieZenithLength = 1.25E3;

    	// wavelength of used primaries, according to preetham
    	const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );

    	// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
    	// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
    	const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

    	// mie stuff
    	// K coefficient for the primaries
    	const float v = 4.0;
    	const vec3 K = vec3( 0.686, 0.678, 0.666 );

    	// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
    	const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

    	// earth shadow hack
    	// cutoffAngle = pi / 1.95;
    	const float cutoffAngle = 1.6110731556870734;
    	const float steepness = 1.5;
    	float sourceIntensity( float zenithAngleCos, float EE ) {
        zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
  			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
    	}

    	vec3 totalMie( float T ) {
    		float c = ( 0.2 * T ) * 10E-18;
    		return 0.434 * c * MieConst;
    	}

      vec3 convertRhoThetaToXYZ(vec2 altitudeAzimuth){
        vec3 outPosition;
        outPosition.x = sin(altitudeAzimuth.x) * cos(altitudeAzimuth.y);
        outPosition.z = sin(altitudeAzimuth.x) * sin(altitudeAzimuth.y);
        outPosition.y = cos(altitudeAzimuth.x);
        return normalize(outPosition);
      }
    #endif
  #endif
#endif
