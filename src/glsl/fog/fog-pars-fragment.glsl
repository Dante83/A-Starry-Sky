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
      varying vec3 vMoonDirection;
      varying vec3 vSunE;          // Sun radiance, color-shifted by atmospheric extinction
      varying vec3 vMoonE;         // Moon radiance, color-shifted by atmospheric extinction
      varying vec3 vMoonLightColor;

      const float fogLightExposure = $exposure;
      const float groundFexDistanceMultiplier = $groundFexDistanceMultiplier;

      // Same beta values as the sky LUT bake (template-substituted from sky-atmospheric-parameters,
      // converted from per-km to per-meter to match world-space distances).
      const vec3 betaR = $rayleighBeta;
      const vec3 betaM = $mieBeta;
      const vec3 betaExt = betaR + betaM;

      // Cornette-Shanks Mie phase function — matches atmosphere-functions.glsl miePhaseFunction.
      const float MIE_G = $mieDirectionalG;
      const float MIE_G_SQUARED = MIE_G * MIE_G;
      const float MIE_PHASE_COEFF = 1.5 * (1.0 - MIE_G_SQUARED) / (2.0 + MIE_G_SQUARED);
      const float THREE_OVER_SIXTEEN_PI = 0.05968310365946075;

      const vec3 up = vec3(0.0, 1.0, 0.0);
      const float pi = 3.1415926535897932;

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

      // The sky LUTs bake 7 orders of multiple scattering which smooth the Mie forward peak;
      // single-scatter fog has no such smoothing, so we cap the peak to avoid the un-physical
      // brightness blowout when looking near the sun. Cap value chosen to produce a forward
      // lobe slightly stronger than the Henyey-Greenstein equivalent at g=0.8 (~3.6).
      const float MIE_PHASE_CAP = 5.0;
      float miePhase( float cosTheta ) {
        float t = 1.0 + MIE_G_SQUARED - 2.0 * MIE_G * cosTheta;
        return min(MIE_PHASE_COEFF * ((1.0 + cosTheta * cosTheta) / (t * sqrt(t))), MIE_PHASE_CAP);
      }

      // Single-scattering aerial perspective using the same beta values and phase functions
      // as the Elek sky LUT bake, so ground objects' atmospheric perspective matches the sky.
      // vLightE is the source radiance already attenuated by sun-to-observer Kasten-Young
      // extinction in the vertex shader (so it's wavelength-shifted — red at horizon).
      // Standard analytic form: integral_0^d beta_sca * P(theta) * E * exp(-beta_ext * x) dx
      //                       = (beta_sca * P(theta) / beta_ext) * (1 - exp(-beta_ext * d)) * E
      vec3 addLightSource(vec3 viewDirection, vec3 lightDirection, vec3 vLightE, float distToPoint, out vec3 Fex){
        Fex = exp(-betaExt * distToPoint);
        float cosTheta = dot(viewDirection, lightDirection);
        vec3 phaseScatter = betaR * rayleighPhase(cosTheta) + betaM * miePhase(cosTheta);
        return (phaseScatter / max(betaExt, vec3(1e-9))) * (vec3(1.0) - Fex) * vLightE;
      }

      vec3 atmosphericFogMethod() {
        vec3 vecToPoint = vFogWorldPosition - cameraPosition;
        float distToPoint = length(vecToPoint) * groundFexDistanceMultiplier;
        vec3 viewDirection = normalize(vecToPoint);

        vec3 FexSun;
        vec3 LSun = addLightSource(viewDirection, vSunDirection, vSunE, distToPoint, FexSun);
        vec3 FexMoon;
        vec3 LMoon = vMoonLightColor * addLightSource(viewDirection, vMoonDirection, vMoonE, distToPoint, FexMoon);

        return fogLightExposure * (LSun + LMoon);
      }
    #endif
  #endif
#endif
