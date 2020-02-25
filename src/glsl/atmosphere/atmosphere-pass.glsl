varying vec3 vWorldPosition;

uniform vec3 sunPosition;
uniform sampler2D solarMieInscatteringSum;
uniform sampler2D solarRayleighInscatteringSum;

$atmosphericFunctions

vec3 atmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable){
  float cosOfViewAngle = vWorldPosition.y;
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(0.0), parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));
  float pixelValue = uv3.z * $textureDepth;
  float floorZValue = floor(pixelValue) / $textureDepth;
  float ceilingZValue = ceil(pixelValue) / $textureDepth;

  //As we do not natively support 3D textures, we must linearly interpolate between values ourselves.
  // vec2 uv2_0 = getUV2From3DUV(vec3(uv3.xy, floorZValue));
  // vec2 uv2_f = getUV2From3DUV(vec3(uv3.xy, ceilingZValue));

  vec2 uv2 = getUV2From3DUV(uv3);
  vec3 mieLUTsample1 = texture2D(mieLookupTable, uv2).rgb;
  vec3 rayleighLUTsample1 = texture2D(rayleighLookupTable, uv2).rgb;

  //Mie Pass
  // vec2 offset = vec2((1.0/$textureWidth), (1.0/$textureHeight));
  // vec3 mieLUTsample1 = texture2D(mieLookupTable, uv2_0 + offset).rgb;
  // vec3 mieLUTsample2 = texture2D(mieLookupTable, uv2_f + offset).rgb;
  // vec3 mieLUTWeightedAvg = ((uv3.z - floorZValue) * mieLUTsample1 + (ceilingZValue - uv3.z) * mieLUTsample2) / (ceilingZValue - floorZValue);

  //Rayleigh Pass
  // vec3 rayleighLUTsample1 = texture2D(rayleighLookupTable, uv2_0 + offset).rgb;
  // vec3 rayleighLUTsample2 = texture2D(rayleighLookupTable, uv2_f + offset).rgb;
  // vec3 rayleighLUTWeightedAvg = ((uv3.z - floorZValue) * rayleighLUTsample1 + (ceilingZValue - uv3.z) * rayleighLUTsample2) / (ceilingZValue - floorZValue);

  return miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * mieLUTsample1 + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * rayleighLUTsample1;
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
  vec3 solarAtmosphericPass = atmosphericPass(sunPosition, vWorldPosition, solarMieInscatteringSum, solarRayleighInscatteringSum);

  //Color Adjustment Pass

  //Triangular Blue Noise Adjustment Pass

  gl_FragColor = vec4(solarAtmosphericPass, 1.0);
}
