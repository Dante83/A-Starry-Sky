precision highp float;

varying vec3 vWorldPosition;

uniform vec3 sunPosition;
uniform float sunHorizonFade;
uniform sampler2D solarMieInscatteringSum;
uniform sampler2D solarRayleighInscatteringSum;

const float piOver2 = 1.5707963267948966192313;
const float pi = 3.141592653589793238462;

$atmosphericFunctions

vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable, float intensityFader){
  float cosOfViewAngle = vWorldPosition.y;
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH), parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));
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

  //Initialize our color to zero light
  vec3 outColor = vec3(0.0);

  //Milky Way Pass


  //Star Pass


  //Planet Pass


  //Atmosphere
  vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, sphericalPosition, solarMieInscatteringSum, solarRayleighInscatteringSum, sunHorizonFade);

  //Color Adjustment Pass
  vec3 toneMappedColor = OptimizedCineonToneMapping(solarAtmosphericPass);

  //Triangular Blue Noise Adjustment Pass
  gl_FragColor = vec4(toneMappedColor, 1.0);
}
