precision highp float;

varying vec3 vWorldPosition;

uniform vec3 sunPosition;
uniform sampler2D solarMieInscatteringSum;
uniform sampler2D solarRayleighInscatteringSum;

const float piOver2 = 1.5707963267948966192313;
const float pi = 3.141592653589793238462;

$atmosphericFunctions

vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable){
  float cosOfViewAngle = vWorldPosition.y;
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH), parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));
  float depthInPixels = $textureDepth;
  uv3.y += 1.0/($textureHeight - 1.0);
  uv3.x -= 1.0/($textureWidth - 1.0);
  float floorPixelValue = (floor(uv3.z * depthInPixels) + ceil(floor(uv3.z * depthInPixels))) / 2.0;
  float floorValue = clamp((floorPixelValue + 1.0) / depthInPixels, 0.0, 1.0);
  float ceilingValue = clamp((floorPixelValue - 1.0) / depthInPixels, 0.0, 1.0);
  vec2 uv2_0 = getUV2From3DUV(vec3(uv3.xy, floorValue));
  vec2 uv2_f = getUV2From3DUV(vec3(uv3.xy, ceilingValue));
  float interpolationFraction = clamp((uv3.z - floorValue) / (ceilingValue - floorValue), 0.0, 1.0);

  //Interpolated scattering values
  vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, uv2_0).rgb, texture2D(mieLookupTable, uv2_f).rgb, interpolationFraction);
  vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, uv2_0).rgb, texture2D(rayleighLookupTable, uv2_f).rgb, interpolationFraction);

  return miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering;
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
  // vec3 sunPosition2 = normalize(vec3(0.0, 1.0, 0.0));

  //Atmosphere
  vec3 solarAtmosphericPass = linearAtmosphericPass(normalize(sunPosition), sphericalPosition, solarMieInscatteringSum, solarRayleighInscatteringSum);

  //Color Adjustment Pass
  vec3 toneMappedColor = OptimizedCineonToneMapping(solarAtmosphericPass);

  //Triangular Blue Noise Adjustment Pass
  gl_FragColor = vec4(toneMappedColor, 1.0);
}
