precision highp float;

varying vec3 vWorldPosition;

uniform vec3 sunPosition;
uniform float sunHorizonFade;
uniform sampler2D solarMieInscatteringSum;
uniform sampler2D solarRayleighInscatteringSum;
uniform sampler2D transmittance;

const float piOver2 = 1.5707963267948966192313;
const float pi = 3.141592653589793238462;

#if($isSunPass)
  uniform float sunAngularDiameterCos;
  varying vec2 vUv;
  const float sunIntensity = 20.0;

  //From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf
  const float ac1 = 0.46787619;
  const float ac2 = 0.67104811;
  const float ac3 = -0.06948355;
#elif($isMoonPass)
  //DO NOTHING
#endif

$atmosphericFunctions

vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));
  float depthInPixels = $textureDepth;
  UVInterpolatants solarUVInterpolants = getUVInterpolants(uv3, depthInPixels);

  //Interpolated scattering values
  vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, solarUVInterpolants.uv0).rgb, texture2D(mieLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);
  vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, solarUVInterpolants.uv0).rgb, texture2D(rayleighLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);

  return intensityFader * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);
}

void main(){
  //Figure out where we are
  float altitude = piOver2 - acos(vWorldPosition.y);
  float azimuth = atan(vWorldPosition.z, vWorldPosition.x) + pi;
  vec3 sphericalPosition = vec3(sin(azimuth) * cos(altitude), sin(altitude), cos(azimuth) * cos(altitude));

  //Get our transmittance for this texel
  float cosOfViewAngle = vWorldPosition.y;
  vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH));
  vec3 transmittanceFade = texture2D(transmittance, uv2OfTransmittance).rgb;

  //Initialize our color to zero light
  vec3 outColor = vec3(0.0);

  //Stuff that gets covered by the sun or moon so it doesn't get added to the original light
  #if(!$isSunPass && !$isMoonPass)
    //Milky Way Pass


    //Star Pass


    //Planet Pass

  #endif

  //Atmosphere
  vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, sphericalPosition, solarMieInscatteringSum, solarRayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);

  //Sun and Moon layers
  #if($isSunPass)
    $draw_sun_pass
    vec3 toneMappedSky = ACESFilmicToneMapping(solarAtmosphericPass);
    gl_FragColor = vec4(toneMappedSky + sunTexel, 1.0);
  #elif($isMoonPass)
    $draw_sun_pass
    $draw_moon_pass
    gl_FragColor = vec4(solarAtmosphericPass + moonPassColor, moonPassTransparency);
  #else
    vec3 combinedAtmosphericPass = solarAtmosphericPass;

    //Color Adjustment Pass
    vec3 toneMappedColor = ACESFilmicToneMapping(combinedAtmosphericPass);

    //Triangular Blue Noise Adjustment Pass

    gl_FragColor = vec4(clamp(toneMappedColor, 0.0, 1.0), 1.0);
  #endif
}
