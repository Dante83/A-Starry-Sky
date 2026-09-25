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

      // Cornette-Shanks Mie phase function -- matches atmosphere-functions.glsl miePhaseFunction.
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

      //Tonemapper. FOG_SKY_TONEMAPPER must match SKY_TONEMAPPER in atmosphere-pass.glsl
      //and moon-and-sun-output.glsl, so the ground seen through the fog is tonemapped
      //the same way as the sky above it (0 AES, 1 PBR Neutral, 2 AgX). This chunk goes
      //into every THREE material, hence the fog prefix: THREE has its own AgXToneMapping.
      const int FOG_SKY_TONEMAPPER = 1;

      vec3 MyAESFilmicToneMapping(vec3 color) {
        return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
      }

      //https://github.com/KhronosGroup/ToneMapping/tree/main/PBR_Neutral
      vec3 fogPBRNeutralToneMapping(vec3 color) {
        const float startCompression = 0.8 - 0.04;
        const float desaturation = 0.15;
        float x = min(color.r, min(color.g, color.b));
        float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
        color -= offset;
        float peak = max(color.r, max(color.g, color.b));
        if(peak < startCompression){
          return color;
        }
        const float d = 1.0 - startCompression;
        float newPeak = 1.0 - d * d / (peak + d - startCompression);
        color *= newPeak / peak;
        float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
        return mix(color, vec3(newPeak), g);
      }

      //https://iolite-engine.com/blog_posts/minimal_agx_implementation -- returns linear.
      vec3 fogAgXToneMapping(vec3 color) {
        const mat3 agxInset = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
          0.0784335999999992, 0.878468636469772, 0.0784336,
          0.0792237451477643, 0.0791661274605434, 0.879142973793104);
        const mat3 agxOutset = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
          -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
          -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
        const float minEv = -12.47393;
        const float maxEv = 4.026069;
        vec3 v = agxInset * max(color, vec3(0.0));
        v = (clamp(log2(max(v, vec3(1e-10))), minEv, maxEv) - minEv) / (maxEv - minEv);
        vec3 v2 = v * v;
        vec3 v4 = v2 * v2;
        v = 15.5 * v4 * v2 - 40.14 * v4 * v + 31.96 * v4 - 6.868 * v2 * v + 0.4298 * v2 + 0.1191 * v - 0.00232;
        v = agxOutset * v;
        return pow(max(v, vec3(0.0)), vec3(2.2));
      }

      //PBR Neutral maps mid grey (0.18) to 0.14, where AES gives 0.27 -- the scene came
      //out a stop darker. This exposure matches AES for greys from about 0.05 up to mid
      //grey; above that the highlights come out brighter and keep their hue.
      const float FOG_SKY_NEUTRAL_EXPOSURE = 1.7;
      
      //Neutral has no toe: it only takes the smallest channel down, so a dark saturated
      //colour keeps its dominant channel nearly linear, up to 3x brighter than under
      //AES, whose toe crushed it. At night that lit the whole scene. So in the dark the
      //curve hands back to AES, blending over this range of the brightest channel out.
      const float FOG_SKY_NEUTRAL_TOE_START = 0.05;
      const float FOG_SKY_NEUTRAL_TOE_END = 0.25;

      vec3 fogSkyToneMap(vec3 color) {
        if(FOG_SKY_TONEMAPPER == 1){
          vec3 neutral = clamp(fogPBRNeutralToneMapping(FOG_SKY_NEUTRAL_EXPOSURE * color), 0.0, 1.0);
          float toe = smoothstep(FOG_SKY_NEUTRAL_TOE_START, FOG_SKY_NEUTRAL_TOE_END, max(neutral.r, max(neutral.g, neutral.b)));
          return mix(MyAESFilmicToneMapping(color), neutral, toe);
        }
        if(FOG_SKY_TONEMAPPER == 2){
          return clamp(fogAgXToneMapping(color), 0.0, 1.0);
        }
        return MyAESFilmicToneMapping(color);
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
      // extinction in the vertex shader (so it's wavelength-shifted -- red at horizon).
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
