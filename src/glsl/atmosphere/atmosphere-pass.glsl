varying vec3 vWorldPosition;

uniform vec3 sunPosition;
uniform sampler2D solarMieInscatteringSum;
uniform sampler2D solarRayleighInscatteringSum;

$atmosphericFunctions

vec3 atmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable){
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y; //dot(sunPosition, vec3(0.0, 1.0, 0.0))
  vec3 uv3 = vec3(parameterizationOfCosOfZenithToX(cosOFAngleBetweenZenithAndSource), 0.0, parameterizationOfCosOfSourceZenithToZ(cosOfAngleBetweenCameraPixelAndSource));
  float pixelValue = uv3.z * $textureDepth;
  float floorZValue = floor(pixelValue) / $textureDepth;
  float ceilingZValue = ceil(pixelValue) / $textureDepth;

  //As we do not natively support 3D textures, we must linearly interpolate between values ourselves.
  vec2 uv2_0 = getUV2From3DUV(vec3(uv3.xy, floorZValue));
  vec2 uv2_f = getUV2From3DUV(vec3(uv3.xy, ceilingZValue));

  //Mie Pass
  vec3 mieLUTsample1 = texture2D(mieLookupTable, uv2_0).rgb;
  vec3 mieLUTsample2 = texture2D(mieLookupTable, uv2_f).rgb;
  vec3 mieLUTWeightedAvg = ((uv2_f - uv3.z) * mieLUTsample1 + (uv3.z - uv2_0) * mieLUTsample2) / (uv2_f - uv2_0);

  //Rayleigh Pass
  vec3 rayleighLUTsample1 = texture2D(rayleighLookupTable, uv2_0).rgb;
  vec3 rayleighLUTsample2 = texture2D(rayleighLookupTable, uv2_f).rgb;
  vec3 rayleighLUTWeightedAvg = ((uv2_f - uv3.z) * rayleighLUTsample1 + (uv3.z - uv2_0) * rayleighLUTsample2) / (uv2_f - uv2_0);

  return miePhaseFunction(cosOfAngleBetweenCameraPixelAndSun) * mieLUTWeightedAvg + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSun) * rayleighLUTWeightedAvg;
}

void main(){
  //Figure out where we are

  //Initialize our color to zero light
  vec3 outColor = vec3(0.0);

  //Milky Way Pass


  //Star Pass


  //Planet Pass


  //Atmosphere
  vec3 solarAtmosphericPass = atmosphericPass(sunPosition, vWorldPosition, solarMieInscatteringSum, solarRayleighInscatteringSum);

  //Color Adjustment Pass

  //Triangular Blue Noise Adjustment Pass

  gl_FragColor = vec4(outColor, 1.0);
}
