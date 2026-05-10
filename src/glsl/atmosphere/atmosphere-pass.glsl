precision highp sampler3D;

varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec3 galacticCoordinates;
varying vec2 screenPosition;

uniform float uTime;
uniform vec3 sunPosition;
uniform vec3 moonPosition;
uniform float sunHorizonFade;
uniform float moonHorizonFade;
uniform float scatteringMoonIntensity;
uniform float scatteringSunIntensity;
uniform vec3 moonLightColor;
uniform sampler3D mieInscatteringSum;
uniform sampler3D rayleighInscatteringSum;
uniform sampler2D transmittance;
uniform float cameraHeight;

//If clouds enabled
#if($cloudsEnabled && !$isMeteringPass)
  uniform sampler3D cloudLUTs;
  uniform float cloudCoverage;
  uniform vec2 cloudVelocity;
  uniform float cloudStartHeight;
  uniform float cloudEndHeight;
  uniform float numberOfCloudMarchSteps;
  uniform float cloudFadeOutStartPercent;
  uniform float cloudFadeInEndPercent;
  uniform float cloudTime;
  uniform float cloudCutoffDistance;
  uniform vec3 ambientLightPY;
#endif

uniform sampler2D blueNoiseTexture;

#if($auroraEnabled)
  uniform float numberOfAuroraRaymarchingSteps;
  uniform vec3 nitrogenColor;
  uniform float nitrogenCutOff;
  uniform float nitrogenIntensity;
  uniform vec3 molecularOxygenColor;
  uniform float molecularOxygenCutOff;
  uniform float molecularOxygenIntensity;
  uniform vec3 atomicOxygenColor;
  uniform float atomicOxygenCutOff;
  uniform float atomicOxygenIntensity;
  uniform float auroraCutoffDistance;
  uniform sampler2D auroraSampler;
#endif

#if(!$isSunPass && !$isMeteringPass)
  uniform samplerCube starHashCubemap;
  uniform sampler2D dimStarData;
  uniform sampler2D medStarData;
  uniform sampler2D brightStarData;
  uniform sampler2D starColorMap;

  uniform vec3 mercuryPosition;
  uniform vec3 venusPosition;
  uniform vec3 marsPosition;
  uniform vec3 jupiterPosition;
  uniform vec3 saturnPosition;

  uniform float mercuryBrightness;
  uniform float venusBrightness;
  uniform float marsBrightness;
  uniform float jupiterBrightness;
  uniform float saturnBrightness;

  const vec3 mercuryColor = vec3(1.0);
  const vec3 venusColor = vec3(0.913, 0.847, 0.772);
  const vec3 marsColor = vec3(0.894, 0.509, 0.317);
  const vec3 jupiterColor = vec3(0.901, 0.858, 0.780);
  const vec3 saturnColor = vec3(0.905, 0.772, 0.494);
#endif

const float piOver2 = 1.5707963267948966192313;
const float piTimes2 = 6.283185307179586476925286;
const float pi = 3.141592653589793238462;
const vec3 intensityVector = vec3(0.2126, 0.7152, 0.0722); // BT.709 luminance weights

#if($isSunPass)
  uniform float sunAngularDiameterCos;
  uniform float moonRadius;
  uniform sampler2D moonDiffuseMap;
  uniform sampler2D solarEclipseMap;
  varying vec2 vUv;
  const float sunDiskIntensity = 30.0;

  //Solar limb darkening, per RGB band (B/V/R after Hestroffer & Magnan 1998).
  //Each channel obeys I(mu)/I_center = ac1 + ac2*mu + 2*ac3*mu^2 and integrates
  //to ~1 at the disc center (mu=1). At the limb (mu=0) red retains ~0.59,
  //green ~0.47, blue ~0.30 — the disc reddens toward its edge, complementing
  //atmospheric reddening for a richer sunset.
  const vec3 ac1 = vec3(0.590, 0.468, 0.300);
  const vec3 ac2 = vec3(0.450, 0.671, 0.930);
  const vec3 ac3 = vec3(-0.020, -0.069, -0.115);
#elif($isMoonPass)
  uniform float starsExposure;
  uniform float moonExposure;
  uniform float sunRadius;
  uniform float distanceToEarthsShadowSquared;
  uniform float oneOverNormalizedLunarDiameter;
  uniform vec3 earthsShadowPosition;
  uniform sampler2D moonDiffuseMap;
  uniform sampler2D moonNormalMap;
  uniform sampler2D moonRoughnessMap;
  uniform sampler2D moonApertureSizeMap;
  uniform sampler2D moonApertureOrientationMap;
  uniform float earthshineIntensity;
  varying vec2 vUv;

  //Tangent space lighting
  varying vec3 tangentSpaceSunLightDirection;
  varying vec3 tangentSpaceViewDirection;
#elif($isMeteringPass)
  varying vec2 vUv;
  uniform float moonLuminosity;
  uniform float sunLuminosity;
  uniform float starsExposure;
#else
  uniform float starsExposure;
#endif

$atmosphericFunctions

#if(!$isSunPass)
//From http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
float rand(float x){
  float a = 12.9898;
  float b = 78.233;
  float c = 43758.5453;
  float dt= dot(vec2(x, x) ,vec2(a,b));
  float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}

//From The Book of Shaders :D
//https://thebookofshaders.com/11/
float noise(float x){
  float i = floor(x);
  float f = fract(x);
  float y = mix(rand(i), rand(i + 1.0), smoothstep(0.0,1.0,f));

  return y;
}
#endif

#if(!$isSunPass && !$isMeteringPass)
  vec3 getSpectralColor(){
    return vec3(1.0);
  }

  float brownianNoise(float lacunarity, float gain, float initialAmplitude, float initialFrequency, float timeInSeconds){
    float amplitude = initialAmplitude;
    float frequency = initialFrequency;

    // Loop of octaves
    float y = 0.0;
    float maxAmplitude = initialAmplitude;
    for (int i = 0; i < 5; i++) {
    	y += amplitude * noise(frequency * timeInSeconds);
    	frequency *= lacunarity;
    	amplitude *= gain;
    }

    return y;
  }

  const float twinkleDust = 0.0010;
  float twinkleFactor(vec3 starposition, float atmosphericDistance, float starBrightness){
    float randSeed = uTime * twinkleDust + (starposition.x + starposition.y + starposition.z) * 10000.0;

    //lacunarity, gain, initialAmplitude, initialFrequency
    return 1.0 + (1.0 - atmosphericDistance) * brownianNoise(0.5, 0.2, starBrightness, 6.0, randSeed);
  }

  float colorTwinkleFactor(vec3 starposition){
    float randSeed = uTime * 0.0007 + (starposition.x + starposition.y + starposition.z) * 10000.0;

    //lacunarity, gain, initialAmplitude, initialFrequency
    return 0.7 * (2.0 * noise(randSeed) - 1.0);
  }

  float fastAiry(float r){
    //Variation of Airy Disk approximation from https://www.shadertoy.com/view/tlc3zM to create our stars brightness
    float one_over_r_cubed = 1.0 / max(abs(r * r * r), 1e-6);
    float gauss_r_over_1_4 = exp(-.5 * (0.71428571428 * r) * (0.71428571428 * r));
    return abs(r) < 1.88 ? gauss_r_over_1_4 : abs(r) > 6.0 ? 1.35 * one_over_r_cubed : (gauss_r_over_1_4 + 2.7 * one_over_r_cubed) * 0.5;
  }

  vec2 getUV2OffsetFromStarColorTemperature(float zCoordinate, float normalizedYPosition, float noise){
    float row = clamp(floor(zCoordinate / 4.0), 0.0, 8.0); //range: [0-8]
    float col = clamp(zCoordinate - row * 4.0, 0.0, 3.0); //range: [0-3]

    //Note: We are still in pixel space, our texture areas are 32 pixels wide
    //even though our subtextures are only 30x14 pixels due to 1 pixel padding.
    float xOffset = col * 32.0 + 15.0;
    float yOffset = row * 16.0 + 1.0;

    float xPosition =  xOffset + 13.0 * noise;
    float yPosition = yOffset + 15.0 * normalizedYPosition;

    return vec2(xPosition / 128.0, yPosition / 128.0);
  }

  vec3 getStarColor(float temperature, float normalizedYPosition, float noise){
    //Convert our temperature to a z-coordinate
    float zCoordinate = floor(31.0 * sqrt((temperature - 2000.0) / 15000.0)); // T in [2000K,17000K] -> [0,31]
    vec2 uv = getUV2OffsetFromStarColorTemperature(zCoordinate, normalizedYPosition, noise);

    vec3 starColor = texture(starColorMap, uv).rgb;

    //Interpolate between the 2 colors (ZCoordinateC and zCoordinate are never more then 1 apart)
    return starColor;
  }

  vec3 drawStarLight(vec4 starData, vec3 galacticSphericalPosition, vec3 skyPosition, float starAndSkyExposureReduction){
    //I hid the temperature inside of the magnitude of the stars equitorial position, as the position vector must be normalized.
    float temperature = sqrt(dot(starData.xyz, starData.xyz));
    vec3 normalizedStarPosition = starData.xyz / temperature;

    //Early out if we're too far away
    float approximateDistanceOnSphereStar = distance(galacticSphericalPosition, normalizedStarPosition) * 1700.0;
    if(approximateDistanceOnSphereStar > 10.0){
      return vec3(0.0);
    }

    //Get the distance the light ray travels
    vec2 skyIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), normalize(vec2(length(vec2(skyPosition.xz)), skyPosition.y)));
    vec2 normalizationIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), vec2(1.0, 0.0));
    float distanceToEdgeOfSky = clamp((1.0 - distance(vec2(0.0, RADIUS_OF_EARTH), skyIntersectionPoint) / distance(vec2(0.0, RADIUS_OF_EARTH), normalizationIntersectionPoint)), 0.0, 1.0);

    //Use the distance to the star to determine it's perceived twinkling
    float starBrightness = pow(100.0, (-starData.a + min(starAndSkyExposureReduction, 2.7)) * 0.20);

    //Modify the intensity and color of this star using approximation of stellar scintillation
    vec3 starColor = getStarColor(temperature, distanceToEdgeOfSky, colorTwinkleFactor(normalizedStarPosition));

    //Pass this brightness into the fast Airy function to make the star glow
    starBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0) * twinkleFactor(normalizedStarPosition, distanceToEdgeOfSky, sqrt(starBrightness) + 3.0);
    return vec3(sqrt(starBrightness)) * pow(starColor, vec3(1.2));
  }

  vec3 drawPlanetLight(vec3 planetColor, float planetMagnitude, vec3 planetPosition, vec3 skyPosition, float starAndSkyExposureReduction){
    //Grab our distance to this planet
    float approximateDistanceOnSphereStar = distance(skyPosition, planetPosition) * 1400.0;

    //Early out if we're too far away
    if(approximateDistanceOnSphereStar > 100.0){
      return vec3(0.0);
    }

    //Use the distance to the star to determine it's perceived twinkling
    //Planets can have higher magnitudes, but capping at -1.0 eliminates
    //silly glow effects.
    float planetBrightness = pow(100.0, (-max(planetMagnitude, -1.0) + starAndSkyExposureReduction) * 0.2);

    //Pass this brightness into the fast Airy function to make the star glow
    planetBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0);
    return sqrt(vec3(planetBrightness)) * planetColor;
  }
#endif

#if($isMoonPass)
  vec3 getLunarEcclipseShadow(vec3 sphericalPosition){
    //Determine the distance from this pixel to the center of the sun.
    float distanceToPixel = distance(sphericalPosition, earthsShadowPosition);
    float pixelToCenterDistanceInMoonDiameter = 4.0 * distanceToPixel * oneOverNormalizedLunarDiameter;
    float umbDistSq = pixelToCenterDistanceInMoonDiameter * pixelToCenterDistanceInMoonDiameter * 0.5;
    float pUmbDistSq = umbDistSq * 0.3;
    float umbraBrightness = 0.5 + 0.5 * clamp(umbDistSq, 0.0, 1.0);
    float penumbraBrightness = 0.15 + 0.85 * clamp(pUmbDistSq, 0.0, 1.0);
    float totalBrightness = clamp(min(umbraBrightness, penumbraBrightness), 0.0, 1.0);

    //Get color intensity based on distance from penumbra
    vec3 colorOfLunarEcclipse = vec3(1.0, 0.45, 0.05);
    float colorIntensity = clamp(16.0 * distanceToEarthsShadowSquared * oneOverNormalizedLunarDiameter * oneOverNormalizedLunarDiameter, 0.0, 1.0);
    colorOfLunarEcclipse = clamp(colorOfLunarEcclipse + (1.0 - colorOfLunarEcclipse) * colorIntensity, 0.0, 1.0);

    return totalBrightness * colorOfLunarEcclipse;
  }
#endif

float interceptPlaneSurface(vec3 rayStartPosition, vec3 rayDirection, float height, float maxDistance){
  float tGoal = rayDirection.y <= 0.0 ? -1.0 : (height - rayStartPosition.y) / rayDirection.y;
  float tMax = sqrt(maxDistance * maxDistance / dot(rayDirection, rayDirection));
  return min(tGoal, tMax);
}

#if($auroraEnabled)
  //I'm gonna do something weird. I propose that aurora look an aweful lot
  //like water caustics - slower, with some texture ripples introduced with
  //perlin noise.
  //
  //To create my fake water caustics, I'm going to linearize and combine
  //multiple tileable shader items to create the effect.
  //From https://www.shadertoy.com/view/Msf3WH (MIT License)
  vec2 hash(vec2 p){
    vec2 p2 = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return 2.0 * fract(sin(p2) * 43758.5453123) - 1.0;
  }

  float perlinNoise(vec2 p){
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

    vec2  i = floor(p + (p.x + p.y) * K1);
    vec2  a = p - i + (i.x + i.y) * K2;
    float m = step(a.y, a.x);
    vec2  o = vec2(m, 1.0 - m);
    vec2  b = a - o + K2;
    vec2  c = a - 1.0 + 2.0 * K2;
    vec3  h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c) ), 0.0);
    vec3  n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));

    return dot(n, vec3(70.0));
  }

  float auroraHeightmap(vec2 uv, float t){
    float halfTime = 0.5 * t;
    float quarterTime = 0.5 * halfTime;

    //Offsets from the perlin noise
    float perlinOffset1 = perlinNoise(16.0 * (uv + vec2(0.1, 0.2) * t));
    float perlinOffset2 = perlinNoise(16.0 * (uv - vec2(0.4, 0.3) * halfTime));
    vec2 pSample = 0.07 * vec2(perlinOffset1, perlinOffset2);

    //Sample our caustic shader
    vec2 uv1 = uv + vec2(0.8, 0.1) * quarterTime;
    vec2 uv2 = uv - vec2(0.2, 0.7) * quarterTime;
    float aSample1 = texture(auroraSampler, (uv1 + pSample) * 0.25).r;
    float aSample2 = texture(auroraSampler, uv1 * 0.25).r;
    float aSample3 = texture(auroraSampler, uv2 * 0.25).g;
    float aSample4 = texture(auroraSampler, (uv2 + pSample) * 0.25).g;

    //Combine our caustic shader results
    float cCombined1 = 1.7 * min(max(aSample1, aSample2), max(aSample3, aSample4));
    return cCombined1 * cCombined1;
  }

  //Is this scientifically correct?! No, I doubt it. I just grabbed some relative values
  //and I'm hoping this will give me a nice sense of varying these things.
  //Note that both magenta nitrogen aurora and red aurora are rather rare, so you are
  //unlikely to see them, their values are set as such below, and use electron velocity
  //in combination with the aurora 'height' (which is a rough estimate for quantity)
  //to determine which aurora is visible. At this point, we are just faking it till
  //we can get more accurate values for simulating this.
  vec3 auroraColor(float auroraNoiseValue, float heightOfRay, float avgElectronVelocityScalar,
                   vec3 excitedNitrogenSpectrumEmission, vec3 molecularO2SpectralEmission, vec3 atomicOxygenSpectralEmission){

    float h = heightOfRay - RADIUS_OF_EARTH;
    vec3 outputLightIntensity = vec3(0.0);
    float centroidValue;
    float linearIntensityFader;

    //Nitrogen contribution
    if(h > 60.0 && h < 120.0){
      centroidValue = (h - 90.0) / 70.0;
      linearIntensityFader = clamp(auroraNoiseValue - nitrogenCutOff, 0.0, 1.0);
      outputLightIntensity += nitrogenIntensity * excitedNitrogenSpectrumEmission * linearIntensityFader * exp(-centroidValue * centroidValue);
    }

    //Molecular oxygen contribution
    if(h > 100.0 && h < 250.0){
      centroidValue = (h - 175.0) / 50.5;
      linearIntensityFader = clamp(auroraNoiseValue - molecularOxygenCutOff, 0.0, 1.0);
      outputLightIntensity += molecularOxygenIntensity * molecularO2SpectralEmission * linearIntensityFader * exp(-centroidValue * centroidValue);
    }

    //Atomic oxygen contribution
    if(h > 150.0 && h < 600.0){
      centroidValue = (h - 375.0) / 80.5;
      linearIntensityFader = clamp(auroraNoiseValue - atomicOxygenCutOff, 0.0, 1.0);
      outputLightIntensity += atomicOxygenIntensity * atomicOxygenSpectralEmission * linearIntensityFader * exp(-centroidValue * centroidValue);
    }

    return max(vec3(outputLightIntensity), 0.0);
  }

  vec3 auroraRayMarchPass(vec3 rayStartPosition, vec3 rayDirection, float starAndSkyExposureReduction){
    float uvScaling = 4.0;
    float rayInterceptStartTime = interceptPlaneSurface(rayStartPosition + RADIUS_OF_EARTH, rayDirection, RADIUS_OF_AURORA_BOTTOM + RADIUS_OF_EARTH, auroraCutoffDistance);
    float rayInterceptEndTime = interceptPlaneSurface(rayStartPosition + RADIUS_OF_EARTH, rayDirection, RADIUS_OF_AURORA_TOP + RADIUS_OF_EARTH, auroraCutoffDistance);
    float rayDeltaT = (rayInterceptEndTime - rayInterceptStartTime) / numberOfAuroraRaymarchingSteps;
    float auroraNoiseValue;
    vec3 auroraColorValue0;
    vec3 auroraColorValuef;
    vec3 lastPosition;
    vec3 linearAuroraGlow = vec3(0.0);
    float auroraBrightness = pow(150.0, min(starAndSkyExposureReduction, 2.7) * 0.20);
    if(rayInterceptStartTime > 0.0){
      vec3 nitrogenLinear = sRGBToLinear(vec4(nitrogenColor, 1.0)).rgb;
      vec3 molecularO2Linear = sRGBToLinear(vec4(molecularOxygenColor, 1.0)).rgb;
      vec3 atomicOxygenLinear = sRGBToLinear(vec4(atomicOxygenColor, 1.0)).rgb;
      lastPosition = rayStartPosition + rayInterceptStartTime * rayDirection;
      vec2 auroraNoiseTextureUV = vec2(lastPosition.x, lastPosition.z);
      auroraNoiseValue = auroraHeightmap(auroraNoiseTextureUV / 1600.0, uTime / 16000.0);
      auroraColorValue0 = auroraColor(auroraNoiseValue, lastPosition.y, 0.5, nitrogenLinear, molecularO2Linear, atomicOxygenLinear); //Setting the velocity value to a constant while we test this out.
      for(float i = 1.0; i < numberOfAuroraRaymarchingSteps; i++){
        //Determine the position of our raymarcher in the sky
        //Per-pixel, per-step blue noise lookup using screen coords
        vec2 noiseUV = (gl_FragCoord.xy + vec2(i * 7.0, i * 11.0)) * 0.0078125;
        float blueNoise = texture(blueNoiseTexture, noiseUV).r * 2.0 - 1.0;
        float d = rayDeltaT * (0.75 + 0.5 * blueNoise);
        vec3 currentPosition = lastPosition + rayDirection * d;

        auroraNoiseTextureUV = vec2(currentPosition.x, currentPosition.z);
        auroraNoiseValue = auroraHeightmap(auroraNoiseTextureUV / 1600.0, uTime / 16000.0);
        auroraColorValuef = auroraColor(auroraNoiseValue, currentPosition.y, 0.5, nitrogenLinear, molecularO2Linear, atomicOxygenLinear); //Setting the velocity value to a constant while we test this out.

        //Integrate using the trapezoidal rule
        linearAuroraGlow += 0.5 * (auroraColorValue0 + auroraColorValuef) * d;//We linearly scale by the longer distances to cancel out the effect of fewer samples

        //Save the current position as the last position so we can determine the distance between points the next time
        lastPosition = currentPosition;
        auroraColorValue0 = auroraColorValuef;
      }
      linearAuroraGlow = 0.00028 * linearAuroraGlow;
    }

    return linearAuroraGlow * auroraBrightness; //Linear multiplier for artistic control
  }
#endif

//Cloud code
#if(!$isMeteringPass && $cloudsEnabled)
  //For cloud rendering
  /* https://www.shadertoy.com/view/XsX3zB
   *
   * The MIT License
   * Copyright (c) 2013 Nikita Miropolskiy
   *
   * ( license has been changed from CCA-NC-SA 3.0 to MIT
   *
   *   but thanks for attributing your source code when deriving from this sample
   *   with a following link: https://www.shadertoy.com/view/XsX3zB )*/

  /* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */
  vec3 random3(vec3 c) {
  	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
  	vec3 r;
  	r.z = fract(512.0*j);
  	j *= .125;
  	r.x = fract(512.0*j);
  	j *= .125;
  	r.y = fract(512.0*j);
  	return r-0.5;
  }

  /* skew constants for 3d simplex functions */
  const float F3 =  0.3333333;
  const float G3 =  0.1666667;

  /* 3d simplex noise */
  float simplex3d(vec3 p) {
  	 /* 1. find current tetrahedron T and it's four vertices */
  	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
  	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/

  	 /* calculate s and x */
  	 vec3 s = floor(p + dot(p, vec3(F3)));
  	 vec3 x = p - s + dot(s, vec3(G3));

  	 /* calculate i1 and i2 */
  	 vec3 e = step(vec3(0.0), x - x.yzx);
  	 vec3 i1 = e*(1.0 - e.zxy);
  	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);

  	 /* x1, x2, x3 */
  	 vec3 x1 = x - i1 + G3;
  	 vec3 x2 = x - i2 + 2.0*G3;
  	 vec3 x3 = x - 1.0 + 3.0*G3;

  	 /* 2. find four surflets and store them in d */
  	 vec4 w, d;

  	 /* calculate surflet weights */
  	 w.x = dot(x, x);
  	 w.y = dot(x1, x1);
  	 w.z = dot(x2, x2);
  	 w.w = dot(x3, x3);

  	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
  	 w = max(0.6 - w, 0.0);

  	 /* calculate surflet components */
  	 d.x = dot(random3(s), x);
  	 d.y = dot(random3(s + i1), x1);
  	 d.z = dot(random3(s + i2), x2);
  	 d.w = dot(random3(s + 1.0), x3);

  	 /* multiply d by w^4 */
  	 w *= w;
  	 w *= w;
  	 d *= w;

  	 /* 3. return the sum of the four surflets */
  	 return dot(d, vec4(52.0));
  }

  /* const matrices for 3d rotation */
  const mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
  const mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
  const mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);

  float linearGradient(float zeroHeight, float oneHeight, float x){
    return clamp((x - zeroHeight) / (oneHeight - zeroHeight), 0.0, 1.0);
  }

  /* directional artifacts can be reduced by rotating each octave */
  float simplex3dFractal(vec3 m, vec2 cloudVelocity, float cloudDensity, float heightPercentage) {
    vec3 cloudOffset = -vec3(cloudVelocity * cloudTime / 500.0, 0.0);
    cloudOffset = vec3(cloudOffset.x, 0.0, cloudOffset.y);
    vec3 offsetM = m + cloudOffset;
    offsetM = offsetM * vec3(1.5E-4, 3.0E-4, 1.5E-4);
    vec3 offsetM1 = offsetM * rot1;
    vec3 offsetM2 = offsetM * rot2;
    vec3 offsetM3 = offsetM * rot3;
    float baseFbm = 0.5000152*simplex3d(offsetM1) + 0.2500305 * simplex3d(2.0 * offsetM2)
    + 0.125061*simplex3d(4.0 * offsetM3) + 0.0625221 * simplex3d(8.0 * offsetM)
    + 0.031494*simplex3d(16.0 * offsetM1) + 0.0161132 * simplex3d(32.0 * offsetM2)
    + 0.008789*simplex3d(64.0 * offsetM3) + 0.0058875 * simplex3d(128.0 * offsetM);
    baseFbm = clamp(0.5 * baseFbm + 0.5, 0.0, 1.0);
    float fadeOut = linearGradient(1.0, cloudFadeOutStartPercent, heightPercentage);
    float fadeIn = linearGradient(0.0, cloudFadeInEndPercent, heightPercentage);
    // Height blend: 0 at cloud bottom, 1 at cloud top
    float heightBlend = linearGradient(0.0, cloudFadeInEndPercent + 0.05, heightPercentage);
    vec4 worleyTex = texture(cloudLUTs, offsetM * 7.0);
    float worleyCoarse = clamp(dot(worleyTex.rgb, vec3(0.625, 0.125, 0.25)) + 0.09, 0.0, 1.0);
    // Perlin-Worley carving: applied at cloud top only, preserving FBM bumps at cloud bottom/sides
    // This gives puffy rounded tops while keeping visible detail when looking up at clouds
    float cloudBase = clamp(baseFbm - (1.0 - worleyCoarse) * 0.20 * heightBlend, 0.0, 1.0);
    return min(cloudDensity - cloudBase * fadeIn * fadeOut, 0.0) / (cloudDensity - 1.0);
  }

  // Cheap 4-octave density for cone shadow sampling (avoids full 8-octave cost per shadow sample)
  float cloudDensityFast(vec3 m, float cloudDensityParam, float heightPercentage) {
    vec3 cloudOffset = -vec3(cloudVelocity * cloudTime / 500.0, 0.0);
    cloudOffset = vec3(cloudOffset.x, 0.0, cloudOffset.y);
    vec3 offsetM = (m + cloudOffset) * vec3(1.5E-4, 3.0E-4, 1.5E-4);
    float fbm = 0.5000152*simplex3d(offsetM * rot1) + 0.2500305*simplex3d(2.0 * offsetM * rot2)
    + 0.125061*simplex3d(4.0 * offsetM * rot3) + 0.0625221*simplex3d(8.0 * offsetM);
    fbm = clamp(0.5 * fbm + 0.5, 0.0, 1.0);
    float fadeOut = linearGradient(1.0, cloudFadeOutStartPercent, heightPercentage);
    float fadeIn = linearGradient(0.0, cloudFadeInEndPercent, heightPercentage);
    // Worley carving must match simplex3dFractal so shadow samples see the same bulge structure
    float heightBlend = linearGradient(0.0, cloudFadeInEndPercent + 0.05, heightPercentage);
    float worleyCoarse = clamp(dot(texture(cloudLUTs, offsetM * 7.0).rgb, vec3(0.625, 0.125, 0.25)) + 0.09, 0.0, 1.0);
    float cloudBase = clamp(fbm - (1.0 - worleyCoarse) * 0.20 * heightBlend, 0.0, 1.0);
    return min(cloudDensityParam - cloudBase * fadeIn * fadeOut, 0.0) / (cloudDensityParam - 1.0);
  }

  float henyayGreenstein(float g, float cosOfVAndL){
    float t = 1.0 + g * g - 2.0 * g * cosOfVAndL;
    return ONE_OVER_FOUR_PI * (1.0 - g * g) / (t * sqrt(t));
  }

  //Three-lobe phase function: softened forward bulk (g=0.5), gentle
  //backward (g=-0.2) for anti-sun pickup at high density, and a separate
  //narrow silver-lining lobe (g=0.95, weight 0.04). The previous
  //g=0.8/-0.3 dual-lobe gave a 256x sun/perpendicular ratio for the bulk
  //(HG(0.8,1)=3.58 vs HG(0.8,0)=0.014) — far above what real cumulus
  //exhibits — which made cumulonimbus viewed perpendicular to the sun
  //read as dim flat haze. Decoupling silver into its own lobe keeps the
  //bulk integrand soft (~32x ratio with g=0.5) so MS terms can carry the
  //bulk diffuse component, while the narrow silver lobe (peak HG=62 at
  //cos=1, weight 0.04 -> ~2.48 contribution, total cos=1 peak ~2.95)
  //gives sun-edge sparkle that reads as visible glow. Silver weight is
  //small because the lobe is very tall: at silver=0.10 the spike was
  //4.6x the bulk forward and added an arc-welder sheen; at silver=0.01
  //the peak was only ~1.10 (1/3 of the old dual-lobe's 3.58) and cloud
  //tops looked flat-white with no glow. 0.04 sits between, restoring
  //sun-edge pop without arc-welder.
  float hillaireHenyayGreenstein(float cosOfVAndL, float density){
    float forward = henyayGreenstein(0.5, cosOfVAndL);
    float backward = henyayGreenstein(-0.2, cosOfVAndL);
    float silver = henyayGreenstein(0.95, cosOfVAndL) * 0.04;
    float w = clamp(density * 5.0, 0.0, 1.0);
    return mix(forward, mix(forward, backward, 0.5), w) + silver;
  }

  vec4 cloudRayMarcher(vec3 rayStartPosition, vec3 rayDirection, float starAndSkyExposureReduction, vec3 sunSourceColor, vec3 moonSourceColor, vec3 atmosphericFog){
    //This is in meters
    float globalCloudStartHeight = cloudStartHeight + rayStartPosition.y;
    float globalCloudEndHeight = cloudEndHeight + rayStartPosition.y;
    float cloudThickness = globalCloudEndHeight - globalCloudStartHeight;
    float rayStartPositionInKm = rayStartPosition.y * METERS_TO_KM;
    float rayInterceptStartTime = interceptPlaneSurface(rayStartPosition + RADIUS_OF_EARTH, rayDirection, rayStartPosition.y + cloudStartHeight  + RADIUS_OF_EARTH, cloudCutoffDistance);
    float rayInterceptEndTime = interceptPlaneSurface(rayStartPosition + RADIUS_OF_EARTH, rayDirection, rayStartPosition.y + cloudEndHeight  + RADIUS_OF_EARTH, cloudCutoffDistance);
    float rayDeltaT = (rayInterceptEndTime - rayInterceptStartTime) / numberOfCloudMarchSteps;
    float rayTransmittance = 1.0;
    vec3 luminance = vec3(0.0);
    float cloudDensity0;
    vec3 firstContactPosition = rayStartPosition;
    bool hasFirstContact = false;
    // ambientFactor: steep sun-elevation fade. Moon weight reduced from
    // 0.5 to 0.15 — at twilight with moon at moderate elevation, the old
    // 0.5 weight kept ambientFactor at ~0.25, which combined with the
    // 8x→3x ambient coefficient still produced enough zenith-blue ambient
    // to wash out the (correctly-reddened-but-DIM) sun direct/MS at
    // alpenglow times. Real moonlight is ~1/400000 of sunlight; our HDR
    // ratio is ~1/6 (heavily compressed), so the moon contribution to
    // cloud-body ambient was overstated. 0.15 keeps full moon nights
    // visibly silver but lets the sun's reddened direct path read as
    // orange when it's the dominant source.
    //
    // Floor 0 (was 0.05): the 0.05 floor multiplied ambientLightPY which
    // LightingManager pre-ramps with sunGate = max(0, sun.y*1.5 + 0.3),
    // so pre-dawn (sun.y = -0.1 to -0.2) had hemispherical intensity 6x
    // higher than late-night floor and a noticeably-blue Rayleigh-tinted
    // color from the upper-atmosphere sky LUT. The 0.05 × that produced
    // visible blue cloud tint at pre-dawn even with sky still nearly
    // black. Floor 0 means clouds silhouette properly when both lights
    // are below their cloud-local horizon — direct+MS carry whenever
    // there's any actual delivered light.
    float ambientFactor = clamp(max(sunPosition.y * 2.0, moonPosition.y * 0.15), 0.0, 1.0);

    // Dual-light path: compute sun and moon contributions independently and
    // sum them at each step. Eliminates the dominance-switch jump that
    // happened when picking ONE source at the sun/moon brightness crossover
    // (direction flip → cone shadow flip → bright/dark cloud sides swap
    // instantly). Now sun fades out smoothly via sunSourceColor while moon
    // fades in via moonSourceColor — both physically present.
    //
    // Skip flags are uniform across all pixels (driven by source colors which
    // are uniform-derived), so the GPU branch is a free skip when one light
    // is well below horizon. Mid-day skips moon, deep night skips sun, only
    // ~30 min around twilight runs both.
    //
    // Sign convention: light positions are direction vectors FROM origin TO
    // sun/moon. rayDirection is camera-into-scene. cosViewLight = dot(rayDir,
    // lightDir) is the cos of the scattering angle: +1 = looking AT light
    // (forward Mie peak / silver), -1 = looking away (backward HG).
    bool computeSun = dot(sunSourceColor, vec3(1.0)) > 0.0;
    bool computeMoon = dot(moonSourceColor, vec3(1.0)) > 0.0;
    float cosViewSunLight = dot(rayDirection, sunPosition);
    float cosViewMoonLight = dot(rayDirection, moonPosition);

    // Cone shadow step size: 15% of cloud thickness per sample
    float coneShadowStep = cloudThickness * 0.15;

    if(rayInterceptStartTime > 0.0){
      vec3 lastPosition = rayStartPosition + rayInterceptStartTime * rayDirection;
      float heightPercentage = (lastPosition.y - globalCloudStartHeight) / cloudThickness;
      cloudDensity0 = simplex3dFractal(lastPosition, cloudVelocity, cloudCoverage, heightPercentage);
      float cloudDensity = 0.0;
      if(cloudDensity0 > 0.0){
        firstContactPosition = lastPosition;
        hasFirstContact = true;
      }

      //Jitter starting position using blue noise (before the loop). Full-step
      //jitter is required — half-step let visible banding rings through, and
      //the buzz from full jitter is preferable. Real cleanup of the noise
      //needs either much higher numberOfCloudMarchSteps or a TAA pass that
      //averages over recent frames.
      float cloudBlueNoise = texture(blueNoiseTexture, gl_FragCoord.xy * 0.0078125).r;
      float startJitter = cloudBlueNoise * rayDeltaT;
      lastPosition += rayDirection * startJitter;

      for(float i = 0.0; i < numberOfCloudMarchSteps; i++){
        //Determine the position of our raymarcher in the sky
        vec3 currentPosition = lastPosition + rayDirection * rayDeltaT;
        heightPercentage = (currentPosition.y - globalCloudStartHeight) / cloudThickness;

        //Calculate cloud density at this step
        float cloudDensityf = simplex3dFractal(currentPosition, cloudVelocity, cloudCoverage, heightPercentage);
        cloudDensity += 0.5 * (cloudDensity0 + cloudDensityf) * rayDeltaT;
        rayTransmittance = exp(-0.2 * cloudDensity);

        //Per-sample atmospheric transmittance Y param (independent of light dir).
        //BUG FIX: currentPosition.y is in METERS with RADIUS_OF_EARTH*1000
        //already baked in (see rayStartPosition construction in main()),
        //so `currentPosition.y * METERS_TO_KM` already gives R_e + altitude
        //in km. The previous form was adding RADIUS_OF_EARTH on top, producing
        //~2*R_e + altitude (~12733 km) which clamped to Y=1 (top of atmosphere)
        //in the LUT — returning transmittance ≈ (1,1,1) with NO reddening.
        //That's why sun-lit clouds at sunset never got their orange tint:
        //the per-sample atmospheric transmittance was always sampling the
        //out-of-range top-of-atmosphere cell, giving white sun light to the
        //cloud regardless of sun elevation.
        float yLightSrc = parameterizationOfHeightToY(currentPosition.y * METERS_TO_KM);

        // Powder + SHADOW_SIGMA_T factor are light-independent — compute once.
        //
        // Schneider Beer-Powder (HZD GDC 2015): density-dependent contrast —
        // thin wisps dim sharply, dense puffs stay bright. Multiplier 6.0
        // chosen so density 0.05 → 0.26, density 0.3 → 0.83. Direct only;
        // MS terms keep their smooth fill so cores don't go fully dark.
        //
        // SHADOW_SIGMA_T 0.32 calibrated for the 4-sample linear-near-weighted
        // shadow scheme (CloudRenderer-style taper, our sample budget): 4
        // evenly-spaced samples at mid-quartiles 0.125/0.375/0.625/0.875 of
        // coneShadowStep, weights (4-k)/4 so closest sample contributes 1.0
        // and farthest contributes 0.25 (sum 2.5, vs 4 for uniform). At
        // uniform density the OD matches the previous 4-sample far-weighted
        // scheme. The visual difference shows up at non-uniform density:
        // bumps with another bump immediately above get sharply darker
        // crevices (near-weighted), while bottoms of thick overcast get
        // slightly lighter (far-weighted under-counted). Net effect is
        // crisper cauliflower self-shadow.
        // We tried 8 samples for noticeably better velvet but the 2x shadow
        // cost wasn't worth it — 4 near-weighted captures most of the gain
        // for the same cost as the old 4 far-weighted.
        float powder = 1.0 - exp(-cloudDensityf * 6.0);
        const float SHADOW_SIGMA_T = 0.32;
        float shadowFactor = SHADOW_SIGMA_T * coneShadowStep / 4.0;

        // sigma_s = 0.18 (m^-1 coefficient on density). Below sigma_t=0.2
        // for albedo ~0.9 — slightly under physical (real cumulus is ~0.99)
        // but tuned for our HDR scale + AESFilmic tonemap.
        //
        // The * cloudDensityf factor in the integrand ties luminance to local
        // scattering material — without it, a clear-air step contributes the
        // same as a dense puff step.
        //
        // MS weights canonical Wrenninge a=b=0.5: MS1 weight 0.5 with 0.5x
        // extinction reduction, MS2 weight 0.25 with 0.25x reduction.
        vec3 stepBase = rayDeltaT * cloudDensityf * vec3(0.18);

        // === SUN CONTRIBUTION ===
        if(computeSun){
          vec2 uvSun = vec2(parameterizationOfCosOfViewZenithToX(max(sunPosition.y, 0.0)), yLightSrc);
          vec3 sunAtmoTrans = texture(transmittance, uvSun).rgb;

          // 4 shadow samples at mid-quartiles of coneShadowStep, linearly
          // near-weighted. See SHADOW_SIGMA_T comment above for rationale.
          vec3 ssp0 = currentPosition + sunPosition * coneShadowStep * 0.125;
          vec3 ssp1 = currentPosition + sunPosition * coneShadowStep * 0.375;
          vec3 ssp2 = currentPosition + sunPosition * coneShadowStep * 0.625;
          vec3 ssp3 = currentPosition + sunPosition * coneShadowStep * 0.875;
          float sh0 = clamp((ssp0.y - globalCloudStartHeight) / cloudThickness, 0.0, 1.0);
          float sh1 = clamp((ssp1.y - globalCloudStartHeight) / cloudThickness, 0.0, 1.0);
          float sh2 = clamp((ssp2.y - globalCloudStartHeight) / cloudThickness, 0.0, 1.0);
          float sh3 = clamp((ssp3.y - globalCloudStartHeight) / cloudThickness, 0.0, 1.0);
          float sd0 = cloudDensityFast(ssp0, cloudCoverage, sh0);
          float sd1 = cloudDensityFast(ssp1, cloudCoverage, sh1);
          float sd2 = cloudDensityFast(ssp2, cloudCoverage, sh2);
          float sd3 = cloudDensityFast(ssp3, cloudCoverage, sh3);
          float sunOD = shadowFactor * (sd0 * 1.0 + sd1 * 0.75 + sd2 * 0.5 + sd3 * 0.25);
          float sunShB = exp(-sunOD);
          float sunShB1 = exp(-sunOD * 0.5);
          float sunShB2 = exp(-sunOD * 0.25);

          float phaseSun = hillaireHenyayGreenstein(cosViewSunLight, cloudDensityf);
          float phaseSunMS = mix(phaseSun, ONE_OVER_FOUR_PI, 0.5);

          vec3 sunBase = stepBase * sunSourceColor * sunAtmoTrans;
          luminance += sunBase * rayTransmittance * sunShB * phaseSun * powder;
          luminance += 0.5 * sunBase * exp(-0.1 * cloudDensity) * sunShB1 * phaseSunMS;
          luminance += 0.25 * sunBase * exp(-0.05 * cloudDensity) * sunShB2 * ONE_OVER_FOUR_PI;
        }

        // === MOON CONTRIBUTION ===
        if(computeMoon){
          vec2 uvMoon = vec2(parameterizationOfCosOfViewZenithToX(max(moonPosition.y, 0.0)), yLightSrc);
          vec3 moonAtmoTrans = texture(transmittance, uvMoon).rgb;

          vec3 msp0 = currentPosition + moonPosition * coneShadowStep * 0.125;
          vec3 msp1 = currentPosition + moonPosition * coneShadowStep * 0.375;
          vec3 msp2 = currentPosition + moonPosition * coneShadowStep * 0.625;
          vec3 msp3 = currentPosition + moonPosition * coneShadowStep * 0.875;
          float mh0 = clamp((msp0.y - globalCloudStartHeight) / cloudThickness, 0.0, 1.0);
          float mh1 = clamp((msp1.y - globalCloudStartHeight) / cloudThickness, 0.0, 1.0);
          float mh2 = clamp((msp2.y - globalCloudStartHeight) / cloudThickness, 0.0, 1.0);
          float mh3 = clamp((msp3.y - globalCloudStartHeight) / cloudThickness, 0.0, 1.0);
          float md0 = cloudDensityFast(msp0, cloudCoverage, mh0);
          float md1 = cloudDensityFast(msp1, cloudCoverage, mh1);
          float md2 = cloudDensityFast(msp2, cloudCoverage, mh2);
          float md3 = cloudDensityFast(msp3, cloudCoverage, mh3);
          float moonOD = shadowFactor * (md0 * 1.0 + md1 * 0.75 + md2 * 0.5 + md3 * 0.25);
          float moonShB = exp(-moonOD);
          float moonShB1 = exp(-moonOD * 0.5);
          float moonShB2 = exp(-moonOD * 0.25);

          float phaseMoon = hillaireHenyayGreenstein(cosViewMoonLight, cloudDensityf);
          float phaseMoonMS = mix(phaseMoon, ONE_OVER_FOUR_PI, 0.5);

          vec3 moonBase = stepBase * moonSourceColor * moonAtmoTrans;
          luminance += moonBase * rayTransmittance * moonShB * phaseMoon * powder;
          luminance += 0.5 * moonBase * exp(-0.1 * cloudDensity) * moonShB1 * phaseMoonMS;
          luminance += 0.25 * moonBase * exp(-0.05 * cloudDensity) * moonShB2 * ONE_OVER_FOUR_PI;
        }

        // Height-modulated ambient inside the loop (Enscape shadertoy style,
        // ref: https://www.shadertoy.com/view/4dSBDt). Quadratic ramp on
        // h*h with floor 0.05 concentrates ambient near cloud tops so dense
        // overcast bottoms drop to ~1/30 of the top brightness — gives the
        // dramatic ominous-dark cumulus underside character of stormy
        // weather. Was previously linear 0.2→1.5 (1/7.5 ratio), which left
        // bottoms readably grey rather than dim. The trailing *1.5 boost
        // was dropped — heightAmbientFactor already maxes at 1.5 at cloud
        // top, so the extra multiplier was double-dipping and pushed
        // shadow-side cloud tops to nearly the same tonemapped brightness
        // as direct-sunlit faces, killing cauliflower contrast.
        float heightAmbientFactor = mix(0.05, 1.5, heightPercentage * heightPercentage);
        luminance += 0.2 * rayTransmittance * rayDeltaT * cloudDensityf * heightAmbientFactor * ambientLightPY * ambientFactor;

        //Update previous values
        cloudDensity0 = cloudDensityf;
        lastPosition = currentPosition;
        if(cloudDensityf > 0.0 && !hasFirstContact){
          firstContactPosition = lastPosition;
          hasFirstContact = true;
        }
        if(rayTransmittance < 0.0001){
          break;
        }
      }
    }
    if(hasFirstContact){
      //Proper atmospheric perspective using the Elek/Chalmers LUT subtraction:
      //  S(viewer->cloud) = S(viewer->inf) - T(viewer->cloud) * S(cloud->inf)
      //The inscattering LUTs don't have earth shadow baked in (that's applied
      //post-hoc in linearAtmosphericPass), so this naturally gives shadow-free
      //fog for the short near-ground viewer-to-cloud path.
      float viewCosZenith = max(rayDirection.y, 0.0);
      float xParam = parameterizationOfCosOfViewZenithToX(viewCosZenith);
      float observerR = rayStartPosition.y * METERS_TO_KM;
      float cloudR = firstContactPosition.y * METERS_TO_KM;
      float yObs = parameterizationOfHeightToY(observerR);
      float yCloud = parameterizationOfHeightToY(cloudR);

      //Viewer-to-cloud transmittance: T(v->c) = T(v->inf) / T(c->inf)
      vec3 T_obs = texture(transmittance, vec2(xParam, yObs)).rgb;
      vec3 T_cloud = texture(transmittance, vec2(xParam, yCloud)).rgb;
      vec3 T_path = T_obs / max(T_cloud, vec3(0.001));

      //Attenuate cloud luminance by viewer-to-cloud extinction
      luminance *= T_path;

      //Compute inscattering along viewer-to-cloud path for sun
      float zSun = parameterizationOfCosOfSourceZenithToZ(sunPosition.y);
      vec3 uv3ObsSun = vec3(xParam, yObs, zSun);
      vec3 uv3CloudSun = vec3(xParam, yCloud, zSun);
      vec3 fogMieSun = max(texture(mieInscatteringSum, uv3ObsSun).rgb - T_path * texture(mieInscatteringSum, uv3CloudSun).rgb, vec3(0.0));
      vec3 fogRaySun = max(texture(rayleighInscatteringSum, uv3ObsSun).rgb - T_path * texture(rayleighInscatteringSum, uv3CloudSun).rgb, vec3(0.0));
      float cosViewSun = dot(rayDirection, sunPosition);
      // Soft-saturate the Mie phase peak on the viewer→cloud fog inscatter
      // path. miePhaseFunction (Cornette-Shanks, g≈0.76) peaks at ~50 at
      // cos=1 (looking toward the sun), which produced the "arc light" /
      // "edges glowing" behaviour at sunset where the short fog path
      // multiplied by the unbounded peak overwhelmed cloud silhouettes.
      // Soft form `x / (1 + x/CAP)` smoothly asymptotes to CAP=10 with
      // no kink — at cos=1 reduces ~50→8.3, at cos=0.9 reduces ~4.6→3.2,
      // perpendicular angles unaffected. Hard min(x, 10) would create a
      // visible ring at the cap transition.
      float miePhaseSun = miePhaseFunction(cosViewSun);
      float cappedMiePhaseSun = miePhaseSun / (1.0 + miePhaseSun * 0.1);
      // Extra smoothstep gate on cloud-fog (in addition to sunHorizonFade²):
      // C++ horizonFade only zeros at sun 18° below horizon, so at nautical
      // twilight (sun -6° to -10°) sunHorizonFade is still 0.4-0.7. Squared
      // and times scatteringSunIntensity (default 20), the fog term gets a
      // ~3-10× multiplier on dim-blue Rayleigh LUT values — visible blue
      // tint on cloud bodies even with sky still nearly black. The sky
      // pass uses sunHorizonFade² unchanged because it SHOULD glow during
      // astronomical twilight; clouds shouldn't pick up the same scatter
      // since they're being viewed against an already-near-dark sky.
      // Cuts fog at sun -6° (smoothstep -0.10 → -0.02 in y units, ≈ -5.7° → -1.1°).
      float fogGateSun = smoothstep(-0.10, -0.02, sunPosition.y);
      vec3 fogSun = sunHorizonFade * sunHorizonFade * fogGateSun * scatteringSunIntensity * (cappedMiePhaseSun * fogMieSun + rayleighPhaseFunction(cosViewSun) * fogRaySun);

      //Compute inscattering along viewer-to-cloud path for moon
      float zMoon = parameterizationOfCosOfSourceZenithToZ(moonPosition.y);
      vec3 uv3ObsMoon = vec3(xParam, yObs, zMoon);
      vec3 uv3CloudMoon = vec3(xParam, yCloud, zMoon);
      vec3 fogMieMoon = max(texture(mieInscatteringSum, uv3ObsMoon).rgb - T_path * texture(mieInscatteringSum, uv3CloudMoon).rgb, vec3(0.0));
      vec3 fogRayMoon = max(texture(rayleighInscatteringSum, uv3ObsMoon).rgb - T_path * texture(rayleighInscatteringSum, uv3CloudMoon).rgb, vec3(0.0));
      float cosViewMoon = dot(rayDirection, moonPosition);
      // Same soft-cap as the sun path — moonlight is dimmer overall but the
      // forward Mie peak still produces a visible bright halo around the
      // moon when looking through cloud fog at low altitude. Same fog gate
      // as sun for symmetric behavior — moon fog dies when moon is well
      // below horizon rather than persisting via permissive C++ horizonFade.
      float miePhaseMoon = miePhaseFunction(cosViewMoon);
      float cappedMiePhaseMoon = miePhaseMoon / (1.0 + miePhaseMoon * 0.1);
      float fogGateMoon = smoothstep(-0.10, -0.02, moonPosition.y);
      vec3 fogMoon = moonHorizonFade * moonHorizonFade * fogGateMoon * scatteringMoonIntensity * moonLightColor * (cappedMiePhaseMoon * fogMieMoon + rayleighPhaseFunction(cosViewMoon) * fogRayMoon);

      luminance += fogSun + fogMoon;
    }

    //No final * max(sunHorizonFade, moonHorizonFade): sun/moonSourceColor
    //are already faded via sunCloudFade/moonCloudFade in main() (so direct +
    //MS terms fade naturally), and fogSun/fogMoon carry their own ^2 fade.
    //Multiplying again here produced double-fade (fade*fade for direct,
    //fade^3 for fog) which collapsed twilight clouds to near-black before
    //the sun had even crossed the horizon.
    return vec4(luminance, 1.0 - rayTransmittance);
  }
#endif

vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 sourceIntensity, vec3 sphericalPosition, sampler3D mieLookupTable, sampler3D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, sphericalPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));

  //Interpolated scattering values
  vec3 interpolatedMieScattering = texture(mieLookupTable, uv3).rgb;
  vec3 interpolatedRayleighScattering = texture(rayleighLookupTable, uv3).rgb;
  vec3 uv3_2 = vec3(parameterizationOfCosOfViewZenithToX(0.0), uv3.y, uv3.z);
  vec3 mieShadow = intensityFader * texture(mieLookupTable, uv3_2).rgb;
  vec3 rayleighShadow = intensityFader * texture(rayleighLookupTable, uv3_2).rgb;

  //Percent of sun visible along the view ray. Geometry (the 8-iteration bisection)
  //is computed ONCE — only the final density weighting differs between Mie and
  //Rayleigh, so this halves the per-pixel shadow-test cost for sun + moon.
  EarthShadowGeometry shadowGeom = earthsShadowGeometry(sphericalPosition, sourcePosition, 0.0, ATMOSPHERE_HEIGHT);
  float percentShadowMie = earthsShadowDensityRatio(shadowGeom, ONE_OVER_MIE_SCALE_HEIGHT);
  float percentShadowRayleigh = earthsShadowDensityRatio(shadowGeom, ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
  //Clamp shadow result to never exceed the original inscattering - the shadow
  //should only ever darken, never brighten (the horizon-sampled mieShadow/rayleighShadow
  //can be brighter than the actual view-direction inscattering at high zenith angles)
  interpolatedMieScattering = min(mix(mieShadow, interpolatedMieScattering, percentShadowMie), interpolatedMieScattering);
  interpolatedRayleighScattering = min(mix(rayleighShadow, interpolatedRayleighScattering, percentShadowRayleigh), interpolatedRayleighScattering);

  // Twilight horizon falloff: squared (not cubed) so post-sunset Rayleigh +
  // Mie inscattering still glows visibly. Cube was a hack masking that the
  // Elek z-parameterization squashes everything when cos(sunZenith) goes
  // negative; squaring is closer to physics and the difference is barely
  // visible above the horizon.
  return intensityFader * intensityFader * sourceIntensity * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);
}

//Including this because someone removed this in a future version of THREE. Why?!
vec3 MyAESFilmicToneMapping(vec3 color) {
  return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
}

void main(){

  #if($isMeteringPass)
    float rho = length(vUv.xy);
    float height = sqrt(max(0.0, 1.0 - rho * rho));
    float phi = piOver2 - atan(height, rho);
    float theta = atan(vUv.y, vUv.x);
    vec3 sphericalPosition;
    sphericalPosition.x = sin(phi) * cos(theta);
    sphericalPosition.z = sin(phi) * sin(theta);
    sphericalPosition.y = cos(phi);
    sphericalPosition = normalize(sphericalPosition);
  #else
    vec3 sphericalPosition = normalize(vLocalPosition);
  #endif

  //Get our transmittance for this texel
  //Note that for uv2OfTransmittance, I am clamping the cosOfViewAngle
  //to avoid edge interpolation in the 2-D texture with a different z
  float cosOfViewAngle = sphericalPosition.y;
  vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(max(cosOfViewAngle, 0.0)), parameterizationOfHeightToY(RADIUS_OF_EARTH + clamp(cameraHeight + vWorldPosition.y * METERS_TO_KM, 0.0, ATMOSPHERE_HEIGHT)));
  vec3 transmittanceFade = texture(transmittance, uv2OfTransmittance).rgb;

  //In the event that we have a moon shader, we need to block out all astronomical light blocked by the moon
  #if($isMoonPass)
    //Get our lunar occlusion texel
    vec2 offsetUV = clamp(vUv * 4.0 - vec2(1.5), vec2(0.0), vec2(1.0));
    vec4 lunarDiffuseTexel = texture(moonDiffuseMap, offsetUV);
    vec3 lunarDiffuseColor = lunarDiffuseTexel.rgb;
  #elif($isSunPass)
    //Get our lunar occlusion texel in the frame of the sun
    vec2 offsetUV = clamp(vUv * 4.0 - vec2(1.5), vec2(0.0), vec2(1.0));
    float lunarMask = texture(moonDiffuseMap, offsetUV).a;
  #endif

  //Atmosphere (We multiply the scattering sun intensity by vec3 to convert it to a vector)
  vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity * vec3(1.0), sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);
  vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity * moonLightColor, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, moonHorizonFade, uv2OfTransmittance);
  //Night-sky baseline ("airglow") — moonless desert tail of the spectrum.
  //RGB ratio captures atmospheric airglow + zodiacal washout (slightly bluer
  //than starlight). Faded with moon presence: a bright moon overwhelms
  //airglow for the human eye (loss of dark adaptation), so we dim the
  //baseline by up to 50% as the moon climbs above the horizon.
  const vec3 SKY_BASELINE = vec3(2E-3, 3.5E-3, 9E-3);
  float airglowIntensity = 0.25 * (1.0 - 0.5 * moonHorizonFade);
  vec3 baseSkyLighting = airglowIntensity * SKY_BASELINE * transmittanceFade;

  #if(!$isSunPass)
    float starAndSkyExposureReduction = starsExposure - 10.0 * dot(LinearTosRGB(vec4(solarAtmosphericPass + lunarAtmosphericPass, 1.0)).rgb, intensityVector);
  #endif

  //This stuff never shows up near our sun, so we can exclude it
  #if(!$isSunPass && !$isMeteringPass)
    vec3 galacticLighting = vec3(0.0);
    if(vLocalPosition.y >= 0.0){
      //Get the stellar starting id data from the galactic cube map
      vec3 normalizedGalacticCoordinates = normalize(galacticCoordinates);
      vec4 starHashData = texture(starHashCubemap, normalizedGalacticCoordinates);

      //Red
      float scaledBits = starHashData.r * 255.0;
      float leftBits = floor(scaledBits / 2.0);
      float starXCoordinate = leftBits / 127.0; //Dim Star
      float rightBits = scaledBits - leftBits * 2.0;

      //Green
      scaledBits = starHashData.g * 255.0;
      leftBits = floor(scaledBits / 8.0);
      float starYCoordinate = (rightBits + leftBits * 2.0) / 63.0; //Dim Star
      rightBits = scaledBits - leftBits * 8.0;

      //Add the dim stars lighting
      vec4 starData = texture(dimStarData, vec2(starXCoordinate, starYCoordinate));
      galacticLighting = max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

      //Blue
      scaledBits = starHashData.b * 255.0;
      leftBits = floor(scaledBits / 64.0);
      starXCoordinate = (rightBits + leftBits * 8.0) / 31.0; //Medium Star
      rightBits = scaledBits - leftBits * 64.0;
      leftBits = floor(rightBits / 2.0);
      starYCoordinate = (leftBits  / 31.0); //Medium Star

      //Add the medium stars lighting
      starData = texture(medStarData, vec2(starXCoordinate, starYCoordinate));
      galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

      //Alpha
      scaledBits = starHashData.a * 255.0;
      leftBits = floor(scaledBits / 32.0);
      starXCoordinate = leftBits / 7.0;
      rightBits = scaledBits - leftBits * 32.0;
      leftBits = floor(rightBits / 4.0);
      starYCoordinate = leftBits  / 7.0;

      //Add the bright stars lighting
      starData = texture(brightStarData, vec2(starXCoordinate, starYCoordinate));
      galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

      //Check our distance from each of the four primary planets
      galacticLighting += max(drawPlanetLight(mercuryColor, mercuryBrightness, mercuryPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting += max(drawPlanetLight(venusColor, venusBrightness, venusPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting += max(drawPlanetLight(marsColor, marsBrightness, marsPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting += max(drawPlanetLight(jupiterColor, jupiterBrightness, jupiterPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting += max(drawPlanetLight(saturnColor, saturnBrightness, saturnPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting = sRGBToLinear(vec4(galacticLighting, 1.0)).rgb;
    }
  #elif($isMeteringPass)
    vec3 galacticLighting = vec3(0.0);
  #endif

  vec3 auroraLighting = vec3(0.0);
  #if($auroraEnabled)
    //Add aurora lighting if it exists
    auroraLighting = auroraRayMarchPass(vec3(0.0, RADIUS_OF_EARTH, 0.0), sphericalPosition, starAndSkyExposureReduction);
    //Aurora emits at 100-600 km altitude — well above the bulk of the
    //atmosphere — so applying the full ground-to-TOA transmittance here is
    //technically over-counting Mie attenuation (Mie is low-altitude). In
    //practice Mie at the relevant viewing angles is small enough that the
    //correct-but-cheaper approximation matches reality to within ~5%.
    auroraLighting = auroraLighting * transmittanceFade;
  #endif

  #if(!$isSunPass)
    //Apply the transmittance function to all of our light sources
    galacticLighting = galacticLighting * transmittanceFade;
  #endif

  //Calculate the impact of clouds on the scene
  //These should be pulled out into uniforms that are determined by the initial parameters
  #if(!$isMeteringPass && $cloudsEnabled)
    //Cloud-illumination strength uses CLOUD-LOCAL horizon, not world horizon.
    //A cloud at altitude h has its horizon dipped below the world horizon by
    //sqrt(2h/R_earth) (small-angle approximation). For default 1000-2500m
    //clouds the dip is ~1.34deg; for 10km cirrus, ~3.2deg. So a moon at
    //-2deg world-elevation is still fully above a 10km cirrus local horizon
    //and should be lighting it even though it appears to be below horizon
    //from the ground observer perspective. The previous sunPosition.y-based
    //fade got this wrong (clouds went dark as soon as the light source
    //crossed the world horizon, regardless of cloud altitude).
    //
    //Above the cloud local horizon: full intensity (clouds are 3D
    //scatterers, not flat surfaces, so no Lambert cosine). Below: smoothstep
    //fades over a ~5.7deg band so the transition is soft. The atmospheric
    //transmittance LUT inside the marcher still reddens the light at low
    //sun, so sunset color comes through correctly without needing fade
    //gymnastics here. The marcher 0.001 scale is halved to 0.0005 to
    //compensate for losing Lambert (which was eating ~half the brightness
    //at typical daytime sun elevations).
    float cloudMidHeightKm = (cloudStartHeight + cloudEndHeight) * 0.0005;
    float cloudHorizonDip = sqrt(2.0 * cloudMidHeightKm / RADIUS_OF_EARTH);
    float effectiveSunY = sunPosition.y + cloudHorizonDip;
    float effectiveMoonY = moonPosition.y + cloudHorizonDip;
    float sunCloudFade = smoothstep(-0.1, 0.05, effectiveSunY);
    float moonCloudFade = smoothstep(-0.1, 0.05, effectiveMoonY);

    //Pre-transmittance source colors. Pass these into the cloud marcher
    //unmodified — the marcher re-applies atmospheric transmittance
    //per-cloud-sample (which is the physically correct place since each
    //cloud sample is at a different altitude with a different path length
    //to the sun/moon).
    vec3 sunSourceColor = scatteringSunIntensity * vec3(1.0) * sunCloudFade;
    vec3 moonSourceColor = 0.3 * scatteringMoonIntensity * moonLightColor * moonCloudFade;

    //Pass BOTH sun and moon source colors into the marcher. The previous
    //dominant-light-selection here picked one source by total post-transmittance
    //luminance, which produced a hard switch at the crossover (sun ~3° below
    //horizon): cone shadow direction flipped, phase function flipped, bright
    //sides of clouds swapped instantly. The marcher now sums both light paths
    //per step, with adaptive skip when one source's color is zero (mid-day
    //skips moon, deep night skips sun, only ~30 min of twilight runs both).

    //atmosphericFog param is unused - atmospheric perspective is now computed
    //inside the ray marcher using the Elek/Chalmers LUT subtraction method
    vec4 cloudLighting = cloudRayMarcher(vec3(vWorldPosition.x, RADIUS_OF_EARTH * 1000.0 + clamp(cameraHeight * 1000.0 + vWorldPosition.y, 0.0, ATMOSPHERE_HEIGHT), vWorldPosition.z), sphericalPosition, 0.0, sunSourceColor, moonSourceColor, vec3(0.0));
  #endif

  //Sun and Moon layers
  #if($isSunPass)
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting;

    $draw_sun_pass

    //Combine the cloud lights
    #if($cloudsEnabled)
      combinedPass = mix((combinedPass + sunTexel), cloudLighting.rgb, cloudLighting.a);
    #else
      combinedPass = combinedPass + sunTexel;
    #endif

    //Leave in linear HDR for bloom - tonemapping happens in the output shader
  #elif($isMoonPass)
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting;
    vec3 earthsShadow = getLunarEcclipseShadow(sphericalPosition);

    $draw_moon_pass

    //Now mix in the moon light
    combinedPass = mix(combinedPass + galacticLighting, combinedPass + moonTexel, lunarDiffuseTexel.a);

    #if($auroraEnabled)
      combinedPass = combinedPass + auroraLighting;
    #endif

    //Combine the cloud lights
    #if($cloudsEnabled)
      combinedPass = mix(combinedPass, cloudLighting.rgb, cloudLighting.a);
    #endif

    //Leave in linear HDR for bloom - tonemapping happens in the output shader
  #elif($isMeteringPass)
    //Cut this down to the circle of the sky ignoring the galatic lighting
    float circularMask = 1.0 - step(1.0, rho);
    vec3 combinedPass = (lunarAtmosphericPass + solarAtmosphericPass + galacticLighting + baseSkyLighting) * circularMask;

    #if($auroraEnabled)
      combinedPass = combinedPass + auroraLighting;
    #endif

    //Combine the colors together and apply a transformation from the scattering intensity to the moon luminosity
    vec3 intensityPassColors = lunarAtmosphericPass * (moonLuminosity / scatteringMoonIntensity) + solarAtmosphericPass * (sunLuminosity / scatteringSunIntensity);

    //Get the greyscale color of the sky for the intensity pass verses the r, g and b channels
    float intensityPass = (0.3 * intensityPassColors.r + 0.59 * intensityPassColors.g + 0.11 * intensityPassColors.b) * circularMask;

    //And bring it back to the normal sRGB afterwards afterwards
    combinedPass = LinearTosRGB(vec4(MyAESFilmicToneMapping(combinedPass), 1.0)).rgb;
  #else
    //Regular atmospheric pass
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + galacticLighting + baseSkyLighting;

    #if($auroraEnabled)
      combinedPass = combinedPass + auroraLighting;
    #endif

    //Combine the cloud lights
    #if($cloudsEnabled)
      combinedPass = mix(combinedPass, cloudLighting.rgb, cloudLighting.a);
    #endif

    //And bring it back to the normal sRGB afterwards afterwards
    combinedPass = LinearTosRGB(vec4(MyAESFilmicToneMapping(combinedPass), 1.0)).rgb;

    //Now apply the blue noise
    //Use golden ratio for quasi-random temporal offset (R2 sequence)
    float goldenRatio = 1.61803398875;
    float framePhase = fract(uTime * 0.001);
    ivec2 temporalOffset = ivec2(
      128.0 * fract(framePhase * goldenRatio),
      128.0 * fract(framePhase * goldenRatio * goldenRatio)
    );
    combinedPass += (texelFetch(blueNoiseTexture, (ivec2(gl_FragCoord.xy) + temporalOffset) % 128, 0).rgb - vec3(0.5)) / vec3(128.0);
  #endif

  #if($isMeteringPass)
    gl_FragColor = vec4(combinedPass, intensityPass);
  #else
    //Triangular Blue Noise Dithering Pass
    gl_FragColor = vec4(combinedPass, 1.0);
  #endif
}
