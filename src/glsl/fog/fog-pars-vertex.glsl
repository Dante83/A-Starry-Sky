#ifdef USE_FOG
varying float vFogDepth;
  #ifndef FOG_EXP2
    #if($useAdvancedAtmospehericPerspective)
      varying vec3 vFogWorldPosition;
      varying vec3 vSunDirection;
      varying vec3 vMoonDirection;
      varying vec3 vSunE;          // Sun radiance reaching observer, color-shifted by atmosphere
      varying vec3 vMoonE;         // Moon radiance reaching observer, color-shifted by atmosphere
      varying vec3 vMoonLightColor;

      uniform vec3 fogColor; //Altitude, Azimuth of Sun and Altitude of Mooon
      uniform float fogNear; //Azimuth of moon
      uniform float fogFar;  //Intensity of moon (negated; sign-bit flag for advanced mode)
      const float sunRadius = $solarRadius;
      const float moonRadius = $lunarRadius;
      const vec3 up = vec3(0.0, 1.0, 0.0);
      const float e = 2.7182818284590452;
      const float pi = 3.1415926535897932;
      const float piOver2 = 1.57079632679;
      const float sqrtOf2 = 1.41421356237;

      // Same beta values as the sky LUT bake (per-meter, matching world-space distances).
      const vec3 betaR = $rayleighBeta;
      const vec3 betaM = $mieBeta;

      // Vertical optical depth at zenith (in meters; scale heights are pre-multiplied by 1000).
      const float rayleighZenithLength = $rayleighScaleHeight;
      const float mieZenithLength = $mieScaleHeight;

      // Analytic horizon falloff for source intensity (sun/moon dim as they approach
      // the horizon and below). Cleaner than passing sunHorizonFade through fog.color
      // would require encoding more bits than we have available in the existing fog
      // uniform smuggle.
      const float cutoffAngle = 1.6110731556870734;  // pi / 1.95 — slightly past horizon
      const float steepness = 1.5;
      float sourceIntensity( float zenithAngleCos, float EE ) {
        zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
        return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
      }

      // Kasten-Young 1989 air-mass approximation. Returns the multiplicative factor
      // (relative to vertical column) by which the atmospheric path length increases
      // for a given zenith angle. Matches what the Elek LUT integrates analytically.
      float airMass( float zenithAngleCos ) {
        float zenithAngleDeg = acos(clamp(zenithAngleCos, -1.0, 1.0)) * 180.0 / pi;
        return 1.0 / ( zenithAngleCos + 0.15 * pow( max(0.001, 93.885 - zenithAngleDeg), -1.253 ) );
      }

      // Sun/moon radiance reaching the observer through the vertical atmospheric column,
      // wavelength-attenuated. This is what makes the sun redden as it approaches the horizon.
      vec3 sourceIntensityWithExtinction( vec3 lightDirection, float EE ){
        float cosZ = dot( up, lightDirection );
        float E = sourceIntensity( cosZ, EE );
        if( E <= 0.0 ) return vec3(0.0);
        float am = airMass( cosZ );
        vec3 Fex = exp( -( betaR * rayleighZenithLength + betaM * mieZenithLength ) * am );
        return E * Fex;
      }

      vec3 convertRhoThetaToXYZ(vec2 altitudeAzimuth){
        vec3 outPosition;
        outPosition.x = -sin(altitudeAzimuth.x) * sin(altitudeAzimuth.y);
        outPosition.z = -sin(altitudeAzimuth.x) * cos(altitudeAzimuth.y);
        outPosition.y = cos(altitudeAzimuth.x);
        return normalize(outPosition);
      }

      float solarEclipseLightingModifier(vec3 sunPosition, vec3 moonPosition){
        float distanceBetweenSunAndMoon = distance(sunPosition, moonPosition);
        float lightingModifier = 1.0;
        if(distanceBetweenSunAndMoon <= (2.0 * sqrtOf2 * max(sunRadius, moonRadius))){
          float sunRadiusSquared = sunRadius * sunRadius;
          float moonRadiusSquared = moonRadius * moonRadius;
          float x = (sunRadiusSquared - moonRadiusSquared + distanceBetweenSunAndMoon * distanceBetweenSunAndMoon)/(2.0 * distanceBetweenSunAndMoon);
          float z = x * x;
          float y = sqrt(sunRadiusSquared - z);

          float ecclipsedArea = 0.0;
          if (distanceBetweenSunAndMoon < abs(moonRadius - sunRadius)) {
            ecclipsedArea = pi * min(sunRadiusSquared, moonRadiusSquared);
          }
          else{
            ecclipsedArea = sunRadiusSquared * asin(y / sunRadius) + moonRadiusSquared * asin(y / moonRadius) - y * (x + sqrt(z + moonRadiusSquared - sunRadiusSquared));
          }
          float surfaceAreaOfSun = pi * sunRadiusSquared;
          lightingModifier = clamp((surfaceAreaOfSun - ecclipsedArea) / surfaceAreaOfSun, 0.0, 1.0);
        }
        return lightingModifier;
      }

      vec3 lunarEclipseLightingModifier(vec3 sunPosition, vec3 moonPosition){
        float distanceBetweenMoonAndAntiSun = distance(-sunPosition, moonPosition);
        vec3 lightingColor = vec3(1.0, 0.5, 0.1);
        if(distanceBetweenMoonAndAntiSun <= (2.0 * sqrtOf2 * max(sunRadius, moonRadius))){
          float moonRadiusSquared = moonRadius * moonRadius;
          float distanceToEarthsShadowSquared = distanceBetweenMoonAndAntiSun * distanceBetweenMoonAndAntiSun;

          //Determine the color of the moonlight used for atmospheric scattering
          float colorIntensity = clamp(distanceToEarthsShadowSquared / moonRadiusSquared, 0.0, 1.0);
          float lightIntensity = clamp(distanceToEarthsShadowSquared / moonRadiusSquared, 0.0, 0.8);
          lightingColor = clamp(lightingColor + (vec3(1.0) - lightingColor) * colorIntensity, vec3(0.0), vec3(1.0));
          lightingColor *= lightIntensity + 0.2;
        }
        return lightingColor;
      }
    #endif
  #endif
#endif
