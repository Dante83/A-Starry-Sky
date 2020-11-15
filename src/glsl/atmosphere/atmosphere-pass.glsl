precision mediump float;

varying vec3 vWorldPosition;
varying vec3 galacticCoordinates;

uniform float uTime;
uniform vec3 sunPosition;
uniform vec3 moonPosition;
uniform vec3 venusPosition;
uniform vec3 marsPosition;
uniform vec3 jupiterPosition;
uniform vec3 saturnPosition;
uniform float sunHorizonFade;
uniform float moonHorizonFade;
uniform float scatteringMoonIntensity;
uniform float scatteringSunIntensity;
uniform sampler2D mieInscatteringSum;
uniform sampler2D rayleighInscatteringSum;
uniform sampler2D transmittance;

#if(!$isSunPass)
  uniform samplerCube starHashCubemap;
  uniform sampler2D dimStarData;
  uniform sampler2D medStarData;
  uniform sampler2D brightStarData;
  uniform sampler2D starColorMap;
#endif

const float piOver2 = 1.5707963267948966192313;
const float piTimes2 = 6.283185307179586476925286;
const float pi = 3.141592653589793238462;
const vec3 inverseGamma = vec3(0.454545454545454545454545);
const vec3 gamma = vec3(2.2);

#if($isSunPass)
  uniform float sunAngularDiameterCos;
  uniform sampler2D moonDiffuseMap;
  varying vec2 vUv;
  const float sunDiskIntensity = 30.0;

  //From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf
  const float ac1 = 0.46787619;
  const float ac2 = 0.67104811;
  const float ac3 = -0.06948355;
#elif($isMoonPass)
  uniform float starsExposure;
  uniform float moonExposure;
  uniform float moonAngularDiameterCos;
  uniform float sunRadius;
  uniform sampler2D moonDiffuseMap;
  uniform sampler2D moonNormalMap;
  uniform sampler2D moonRoughnessMap;
  uniform sampler2D moonAperatureSizeMap;
  uniform sampler2D moonAperatureOrientationMap;
  varying vec2 vUv;

  //Tangent space lighting
  varying vec3 tangentSpaceSunLightDirection;
  varying vec3 tangentSpaceViewDirection;
#elif($isMeteringPass)
  varying vec2 vUv;
  uniform float moonLuminosity;
  uniform float sunLuminosity;
#else
  uniform float starsExposure;
#endif

$atmosphericFunctions

#if(!$isSunPass && !$isMeteringPass)
  vec3 getSpectralColor(){
    return vec3(1.0);
  }

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
    float one_over_r_cubed = 1.0 / abs(r * r * r);
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
    float zCoordinate = floor(sqrt((temperature - 2000.0) * (961.0 / 15000.0)));//range: [0-31]
    vec2 uv = getUV2OffsetFromStarColorTemperature(zCoordinate, normalizedYPosition, noise);

    //Interpolate between the 2 colors (ZCoordinateC and zCoordinate are never more then 1 apart)
    return texture2D(starColorMap, uv).rgb;
  }

  vec3 drawStarLight(vec4 starData, vec3 galacticSphericalPosition, vec3 skyPosition, float starAndSkyExposureReduction){
    //I hid the temperature inside of the magnitude of the stars equitorial position, as the position vector must be normalized.
    float temperature = sqrt(dot(starData.xyz, starData.xyz));
    vec3 normalizedStarPosition = starData.xyz / temperature;

    //Get the distance the light ray travels
    vec2 skyIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), normalize(vec2(length(vec2(skyPosition.xz)), skyPosition.y)));
    vec2 normalizationIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), vec2(1.0, 0.0));
    float distanceToEdgeOfSky = clamp((1.0 - distance(vec2(0.0, RADIUS_OF_EARTH), skyIntersectionPoint) / distance(vec2(0.0, RADIUS_OF_EARTH), normalizationIntersectionPoint)), 0.0, 1.0);

    //Use the distance to the star to determine it's perceived twinkling
    float starBrightness = pow(100.0, (-starData.a + starAndSkyExposureReduction) * 0.2);
    float approximateDistanceOnSphereStar = distance(galacticSphericalPosition, normalizedStarPosition) * 1400.0;

    //Modify the intensity and color of this star using approximation of stellar scintillation
    vec3 starColor = getStarColor(temperature, distanceToEdgeOfSky, colorTwinkleFactor(normalizedStarPosition));

    //Pass this brightness into the fast Airy function to make the star glow
    starBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0) * twinkleFactor(normalizedStarPosition, distanceToEdgeOfSky, sqrt(starBrightness) + 3.0);
    return sqrt(vec3(starBrightness)) * starColor;
  }
#endif

vec3 linearAtmosphericPass(vec3 sourcePosition, float sourceIntensity, vec3 sphericalPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, sphericalPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));
  float depthInPixels = $textureDepth;
  UVInterpolatants solarUVInterpolants = getUVInterpolants(uv3, depthInPixels);

  //Interpolated scattering values
  vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, solarUVInterpolants.uv0).rgb, texture2D(mieLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);
  vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, solarUVInterpolants.uv0).rgb, texture2D(rayleighLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);

  return intensityFader * sourceIntensity * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);
}

void main(){

  #if($isMeteringPass)
    float rho = length(vUv.xy);
    float height = sqrt(1.0 - rho * rho);
    float phi = piOver2 - atan(height, rho);
    float theta = atan(vUv.y, vUv.x);
    vec3 sphericalPosition;
    sphericalPosition.x = sin(phi) * cos(theta);
    sphericalPosition.z = sin(phi) * sin(theta);
    sphericalPosition.y = cos(phi);
    sphericalPosition = normalize(sphericalPosition);
  #else
    vec3 sphericalPosition = normalize(vWorldPosition);
  #endif

  //Get our transmittance for this texel
  float cosOfViewAngle = sphericalPosition.y;
  vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH));
  vec3 transmittanceFade = texture2D(transmittance, uv2OfTransmittance).rgb;

  //In the event that we have a moon shader, we need to block out all astronomical light blocked by the moon
  #if($isMoonPass)
    //Get our lunar occlusion texel
    vec2 offsetUV = vUv * 2.0 - vec2(0.5);
    vec4 lunarDiffuseTexel = texture2D(moonDiffuseMap, offsetUV);
    vec2 uvClamp1 = 1.0 - vec2(step(offsetUV.x, 0.0), step(offsetUV.y, 0.0));
    vec2 uvClamp2 = 1.0 - vec2(step(1.0 - offsetUV.x, 0.0), step(1.0 - offsetUV.y, 0.0));
    vec3 lunarDiffuseColor = lunarDiffuseTexel.rgb;
    float lunarMask = lunarDiffuseTexel.a * uvClamp1.x * uvClamp1.y * uvClamp2.x * uvClamp2.y;
  #elif($isSunPass)
    //Get our lunar occlusion texel in the frame of the sun
    float lunarMask = texture2D(moonDiffuseMap, vUv).a;
  #endif

  //Atmosphere
  vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);
  vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, moonHorizonFade, uv2OfTransmittance);

  //This stuff never shows up near our sun, so we can exclude it
  #if(!$isSunPass && !$isMeteringPass)
    //Get the intensity of our sky color
    vec3 intensityVector = vec3(0.3, 0.59, 0.11);
    float starAndSkyExposureReduction =  starsExposure - 10.0 * dot(pow(solarAtmosphericPass + lunarAtmosphericPass, inverseGamma), intensityVector);

    //Get the stellar starting id data from the galactic cube map
    vec3 normalizedGalacticCoordinates = normalize(galacticCoordinates);
    vec4 starHashData = textureCube(starHashCubemap, normalizedGalacticCoordinates);

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
    vec4 starData = texture2D(dimStarData, vec2(starXCoordinate, starYCoordinate));
    vec3 galacticLighting = max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

    //Blue
    scaledBits = starHashData.b * 255.0;
    leftBits = floor(scaledBits / 64.0);
    starXCoordinate = (rightBits + leftBits * 8.0) / 31.0; //Medium Star
    rightBits = scaledBits - leftBits * 64.0;
    leftBits = floor(rightBits / 2.0);
    starYCoordinate = (leftBits  / 31.0); //Medium Star

    //Add the medium stars lighting
    starData = texture2D(medStarData, vec2(starXCoordinate, starYCoordinate));
    galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

    //Alpha
    scaledBits = starHashData.a * 255.0;
    leftBits = floor(scaledBits / 32.0);
    starXCoordinate = leftBits / 7.0;
    rightBits = scaledBits - leftBits * 32.0;
    leftBits = floor(rightBits / 4.0);
    starYCoordinate = leftBits  / 7.0;

    //Add the bright stars lighting
    starData = texture2D(brightStarData, vec2(starXCoordinate, starYCoordinate));
    galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

    //Check our distance from each of the four primary planets


    //Get the galactic lighting from the Milky Way


    //Apply the transmittance function to all of our light sources
    galacticLighting = pow(galacticLighting, gamma) * transmittanceFade;
  #endif

  //Sun and Moon layers
  #if($isSunPass)
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass;

    $draw_sun_pass

    combinedPass = pow(ACESFilmicToneMapping(combinedPass + pow(sunTexel, gamma)), inverseGamma);
  #elif($isMoonPass)
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass;

    $draw_moon_pass

    //Now mix in the moon light
    combinedPass = mix(combinedPass + galacticLighting, combinedPass + moonTexel, lunarMask);

    //And bring it back to the normal gamma afterwards
    combinedPass = pow(ACESFilmicToneMapping(combinedPass), inverseGamma);
  #elif($isMeteringPass)
    //Cut this down to the circle of the sky ignoring the galatic lighting
    float circularMask = 1.0 - step(1.0, rho);
    vec3 combinedPass = (lunarAtmosphericPass + solarAtmosphericPass) * circularMask;

    //Combine the colors together and apply a transformation from the scattering intensity to the moon luminosity
    vec3 intensityPassColors = lunarAtmosphericPass * (moonLuminosity / scatteringMoonIntensity) + solarAtmosphericPass * (sunLuminosity / scatteringSunIntensity);

    //Get the greyscale color of the sky for the intensity pass verses the r, g and b channels
    float intensityPass = (0.3 * intensityPassColors.r + 0.59 * intensityPassColors.g + 0.11 * intensityPassColors.b) * circularMask;

    //Now apply the ACESFilmicTonemapping
    combinedPass = pow(ACESFilmicToneMapping(combinedPass), inverseGamma);
  #else
    //Regular atmospheric pass
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + galacticLighting;

    //Now apply the ACESFilmicTonemapping
    combinedPass = pow(ACESFilmicToneMapping(combinedPass), inverseGamma);

    //Triangular Blue Noise Dithering Pass
  #endif

  #if($isMeteringPass)
    gl_FragColor = vec4(combinedPass, intensityPass);
  #else
    gl_FragColor = vec4(combinedPass, 1.0);
  #endif
}
