varying vec3 vWorldPosition;

uniform vec3 sunPosition;
uniform sampler2D solarMieInscatteringSum;
uniform sampler2D solarRayleighInscatteringSum;

$atmosphericFunctions

vec3 atmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable){
  float cosOfViewAngle = vWorldPosition.y;
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH), parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));
  float pixelValue = uv3.z * $textureDepth;
  float floorZValue = clamp(floor(clamp(pixelValue, 0.0, $textureDepth - 1.0)) / $textureDepth, 0.0, 1.0);
  float ceilingZValue = clamp(ceil(clamp(pixelValue, 1.0, $textureDepth)) / $textureDepth, 0.0, 1.0);

  //As we do not natively support 3D textures, we must linearly interpolate between values ourselves.
  vec2 uv2_0 = getUV2From3DUV(vec3(uv3.xy, floorZValue));
  vec2 uv2_f = getUV2From3DUV(vec3(uv3.xy, ceilingZValue));
  float uvz_fraction = (uv3.z - floorZValue) / (ceilingZValue - floorZValue);

  //Mie Pass
  vec3 mieLUTsample1 = texture2D(mieLookupTable, uv2_0).rgb;
  vec3 mieLUTsample2 = texture2D(mieLookupTable, uv2_f).rgb;
  vec3 mieLUTWeightedAvg = mieLUTsample1 + (mieLUTsample2 - mieLUTsample1) * uvz_fraction;

  //Rayleigh Pass
  vec3 rayleighLUTsample1 = texture2D(rayleighLookupTable, uv2_0).rgb;
  vec3 rayleighLUTsample2 = texture2D(rayleighLookupTable, uv2_f).rgb;
  vec3 rayleighLUTWeightedAvg = rayleighLUTsample1 + (rayleighLUTsample2 - rayleighLUTsample1) * uvz_fraction;

  return miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * mieLUTWeightedAvg + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * rayleighLUTWeightedAvg;
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
  vec3 solarAtmosphericPass = atmosphericPass(sunPosition, vWorldPosition, solarMieInscatteringSum, solarRayleighInscatteringSum);

  //Color Adjustment Pass

  //Triangular Blue Noise Adjustment Pass

  gl_FragColor = vec4(solarAtmosphericPass, 1.0);
}
