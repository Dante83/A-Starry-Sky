#ifdef USE_FOG
  uniform vec3 fogColor; //Phi-Theta of Sun and Phi of Mooon
  varying float vFogDepth;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
    #if($useAdvancedAtmospehericPerspective)
      varying vec3 vFogWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vMoonDirection;
      varying float vMoonfade;
      varying vec3 vBetaRSun;
      varying vec3 vBetaRMoon;
      varying vec3 vBetaM;
      varying float vSunE;
      varying float vMoonE;
      varying vec3 vFexPixel;
      varying vec3 vMoonLightColor;

      const float mieDirectionalG = $mieDirectionalG;
      const float rayleigh = $rayleigh;
      const float fogLightExposure = $exposure;
      const float groundFexDistanceMultiplier = $groundFexDistanceMultiplier;

      const vec3 up = vec3(0.0, 1.0, 0.0);

      // constants for atmospheric scattering
      const float pi = 3.1415926535897932;
      const float n = 1.0003; // refractive index of air
      const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)
      // optical length at zenith for molecules
      const float rayleighZenithLength = 8.4E3;
      const float mieZenithLength = 1.25E3;

      // this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
    	// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
    	const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

      // 3.0 / ( 16.0 * pi )
      const float THREE_OVER_SIXTEEN_PI = 0.05968310365946075;

      // 1.0 / ( 4.0 * pi )
      const float ONE_OVER_FOUR_PI = 0.07957747154594767;

      vec4 fogsRGBToLinear(vec4 value ) {
      	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
      }

      vec4 fogLinearTosRGB(vec4 value ) {
      	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
      }

      vec3 MyAESFilmicToneMapping(vec3 color) {
        return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
      }

      float rayleighPhase( float cosTheta ) {
        return THREE_OVER_SIXTEEN_PI * ( 1.0 + cosTheta * cosTheta );
      }

      float hgPhase( float cosTheta, float g ) {
        float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g * g, 1.5 );
        return ONE_OVER_FOUR_PI * ( ( 1.0 - g * g ) * inverse );
      }

      vec3 addLightSource(vec3 viewDirection, vec3 lightDirection, vec3 vLightE, vec3 vBetaR, float distToPoint, out vec3 Fex){
        // optical length
        // cutoff angle at 90 to avoid singularity in next formula.
        float zenithAngle = acos(dot( up, lightDirection ));
        float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
        float sR = rayleighZenithLength * inverse;
        float sM = mieZenithLength * inverse;

        // combined extinction factor
        Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

        // in scattering
        float cosTheta = dot( viewDirection, lightDirection );
        float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
        vec3 betaRTheta = vBetaR * rPhase;
        float mPhase = hgPhase( cosTheta, mieDirectionalG );
        vec3 betaMTheta = vBetaM * mPhase;
        //Hacky... but works... not going to complain.
        //Why no, I didn't do some physically accurate stuff here, it just looks okay so
        //so I don't complain.
        //vec3 Lin = pow( vLightE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
        vec3 Lin = pow( vLightE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - vFexPixel ), vec3( 1.5 ) );
        //Lin *= mix( vec3( 1.0 ), pow( vLightE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, lightDirection ), 5.0 ), 0.0, 1.0 ) );
        Lin *= pow( vLightE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 0.5 ) );

        return Lin;
      }

      vec3 atmosphericFogMethod() {
        vec3 vecToPoint = vFogWorldPosition - cameraPosition;
        float distToPoint = length(vecToPoint) * groundFexDistanceMultiplier;
        vec3 viewDirection = normalize(vecToPoint);

        // in scattering
  			float cosTheta = dot( viewDirection, vSunDirection );

        vec3 FexSun;
        vec3 LSun = addLightSource(viewDirection, vSunDirection, vec3(vSunE), vBetaRSun, distToPoint, FexSun);
        vec3 FexMoon;
        vec3 LMoon = vMoonLightColor * addLightSource(viewDirection, vMoonDirection, vec3(vMoonE), vBetaRMoon, distToPoint, FexMoon);

        // nightsky
  			float theta = acos( viewDirection.y ); // elevation --> y-axis, [-pi/2, pi/2]
  			float phi = atan( viewDirection.z, viewDirection.x ); // azimuth --> x-axis [-pi/2, pi/2]
  			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );

        // 66 arc seconds -> degrees, and the cosine of that
    		float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

        // composition + solar disc
  			vec3 sunColorTex = LSun * 0.04 + vec3( 0.0, 0.0003, 0.00075 );
        vec3 moonColorTex = LMoon * 0.04 + vec3( 0.0, 0.0003, 0.00075 );
        vec3 sunColor = pow( sunColorTex, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );
        vec3 moonColor = pow( moonColorTex, vec3( 1.0 / ( 1.2 + ( 1.2 * vMoonfade ) ) ) );
  			vec3 retColor = fogLightExposure * max(sunColor, moonColor);

        return vec3( retColor );
      }
    #endif
  #endif
#endif
