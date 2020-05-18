precision highp float;

varying vec3 vWorldPosition;

uniform vec3 sunPosition;
uniform vec3 moonPosition;
uniform float sunHorizonFade;
uniform float moonHorizonFade;
uniform sampler2D mieInscatteringSum;
uniform sampler2D rayleighInscatteringSum;
uniform sampler2D transmittance;

const float piOver2 = 1.5707963267948966192313;
const float piTimes2 = 6.283185307179586476925286;
const float pi = 3.141592653589793238462;
const float scatteringSunIntensity = 20.0;
const float scatteringMoonIntensity = 1.44; //Moon reflects 7.2% of all light

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
  uniform float moonAngularDiameterCos;
  uniform float sunRadius;
  uniform sampler2D moonDiffuseMap;
  uniform sampler2D moonNormalMap;
  uniform sampler2D moonRoughnessMap;
  uniform sampler2D moonAperatureSizeMap;
  uniform sampler2D moonAperatureOrientationMap;
  varying vec2 vUv;
  varying mat3 TBNMatrix;

  //Tangent space lighting
  varying vec3 tangentSpaceSunLightDirection;
  varying vec3 tangentSpaceViewDirection;
#endif

$atmosphericFunctions

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
  vec3 sphericalPosition = normalize(vWorldPosition);

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

  //This stuff never shows up near our sun, so we can exclude it
  #if(!$isSunPass)
    //Milky Way Pass


    //Star Pass


    //Planet Pass

  #endif

  //Atmosphere
  vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);
  vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, moonHorizonFade, uv2OfTransmittance);
  vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass;

  //Sun and Moon layers
  #if($isSunPass)
    $draw_sun_pass
    gl_FragColor = vec4(combinedPass + sunTexel, 1.0);
  #elif($isMoonPass)
    $draw_moon_pass
    gl_FragColor = vec4(mix(combinedPass, combinedPass + moonTexel, lunarMask), 1.0);
  #else
    //Color Adjustment Pass
    vec3 toneMappedColor = ACESFilmicToneMapping(combinedPass);

    //Triangular Blue Noise Adjustment Pass

    gl_FragColor = vec4(clamp(toneMappedColor, 0.0, 1.0), 1.0);
  #endif
}
