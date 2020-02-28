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
  float pixelValue = uv3.z * depthInPixels;
  float floorValue = clamp((floor(pixelValue) - 1.0) / depthInPixels, 0.0, 1.0);
  float ceilingValue = clamp(floor(pixelValue) / depthInPixels, 0.0, 1.0);
  vec2 uv2_0 = getUV2From3DUV(vec3(uv3.xy, floorValue));
  vec2 uv2_f = getUV2From3DUV(vec3(uv3.xy, ceilingValue));
  float interpolationFraction = clamp((uv3.z - floorValue) / (ceilingValue - floorValue), 0.0, 1.0);

  //Interpolated scattering values
  vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, uv2_f).rgb, texture2D(mieLookupTable, uv2_0).rgb, interpolationFraction);
  vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, uv2_0).rgb, texture2D(rayleighLookupTable, uv2_f).rgb, interpolationFraction);

  return miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering;
}

void main(){
  //Figure out where we are

  //Initialize our color to zero light
  vec3 outColor = vec3(0.0);

  //Milky Way Pass


  //Star Pass


  //Planet Pass


  //Atmosphere
  vec3 sunPosition = normalize(vec3(1.0, 0.1, 0.0));
  vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, vWorldPosition, solarMieInscatteringSum, solarRayleighInscatteringSum);

  //Color Adjustment Pass
  vec3 toneMappedColor = Uncharted2ToneMapping(solarAtmosphericPass.rgb);

  //Triangular Blue Noise Adjustment Pass
  gl_FragColor = LinearTosRGB(vec4(toneMappedColor, 1.0));
}
