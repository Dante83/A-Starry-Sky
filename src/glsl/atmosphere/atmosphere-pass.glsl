varying vec3 vWorldPosition;

uniform vec3 sunPosition;
uniform sampler2D solarMieInscatteringSum;
uniform sampler2D solarRayleighInscatteringSum;

$atmosphericFunctions

vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable){
  float cosOfViewAngle = vWorldPosition.y;
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH), parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));
  float depthInPixels = $textureDepth;
  float floorPixelValue = (floor(uv3.z * depthInPixels) + ceil(floor(uv3.z * depthInPixels))) / 2.0;
  float floorValue = clamp(floor(floorPixelValue + 1.0) / depthInPixels, 0.0, 1.0);
  float ceilingValue = clamp(ceil(floorPixelValue - 1.0) / depthInPixels, 0.0, 1.0);
  vec2 uv2_0 = getUV2From3DUV(vec3(uv3.xy, floorValue));
  vec2 uv2_f = getUV2From3DUV(vec3(uv3.xy, ceilingValue));
  float interpolationFraction = clamp((uv3.z - floorValue) / (ceilingValue - floorValue), 0.0, 1.0);

  //Interpolated scattering values
  vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, uv2_f).rgb, texture2D(mieLookupTable, uv2_0).rgb, interpolationFraction);
  vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, uv2_0).rgb, texture2D(rayleighLookupTable, uv2_f).rgb, interpolationFraction);

  return miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering;
}

// Filmic ToneMapping http://filmicgames.com/archives/75
const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;
const float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x){
  return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

void main(){
  //Figure out where we are

  //Initialize our color to zero light
  vec3 outColor = vec3(0.0);

  //Milky Way Pass


  //Star Pass


  //Planet Pass


  //Atmosphere
  vec3 sunPosition = normalize(vec3(0.0, 1.0, 0.0));
  vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, vWorldPosition, solarMieInscatteringSum, solarRayleighInscatteringSum);

  //Color Adjustment Pass
  vec3 toneMappedColor = Uncharted2ToneMapping(LinearTosRGB(vec4(solarAtmosphericPass, 1.0)).rgb);

  //Triangular Blue Noise Adjustment Pass
  gl_FragColor = vec4(toneMappedColor, 1.0);
}
