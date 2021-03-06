//Based on the work of Oskar Elek
//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf
//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
//by Gustav Bodare and Edvard Sandberg

const float PI = 3.14159265359;
const float PI_TIMES_FOUR = 12.5663706144;
const float PI_TIMES_TWO = 6.28318530718;
const float PI_OVER_TWO = 1.57079632679;
const float RADIUS_OF_EARTH = 6366.7;
const float RADIUS_OF_EARTH_SQUARED = 40534868.89;
const float RADIUS_OF_EARTH_PLUS_RADIUS_OF_ATMOSPHERE_SQUARED = 41559940.89;
const float RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED = 1025072.0;
const float ATMOSPHERE_HEIGHT = 80.0;
const float ATMOSPHERE_HEIGHT_SQUARED = 6400.0;
const float ONE_OVER_MIE_SCALE_HEIGHT = 0.833333333333333333333333333333333333;
const float ONE_OVER_RAYLEIGH_SCALE_HEIGHT = 0.125;
//Mie Beta / 0.9, http://www-ljk.imag.fr/Publications/Basilic/com.lmc.publi.PUBLI_Article@11e7cdda2f7_f64b69/article.pdf
//const float EARTH_MIE_BETA_EXTINCTION = 0.00000222222222222222222222222222222222222222;
const float EARTH_MIE_BETA_EXTINCTION = 0.0044444444444444444444444444444444444444444444;
const float ELOK_Z_CONST = 0.9726762775527075;
const float ONE_OVER_EIGHT_PI = 0.039788735772973836;

const float MIE_G = $mieG;
const float MIE_G_SQUARED = $mieGSquared;
const float MIE_PHASE_FUNCTION_COEFFICIENT = $miePhaseFunctionCoefficient; //(1.5 * (1.0 - MIE_G_SQUARED) / (2.0 + MIE_G_SQUARED))

//8 * (PI^3) *(( (n_air^2) - 1)^2) / (3 * N_atmos * ((lambda_color)^4))
//I actually found the values from the ET Engine by Illation
//https://github.com/Illation/ETEngine
//Far more helpful for determining my mie and rayleigh values
const vec3 RAYLEIGH_BETA = vec3(5.8e-3, 1.35e-2, 3.31e-2);

//As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
const float OZONE_PERCENT_OF_RAYLEIGH = 6e-7;
const vec3 OZONE_BETA = vec3(413.470734338, 413.470734338, 2.1112886E-13);

//
//General methods
//
float fModulo(float a, float b){
  return (a - (b * floor(a / b)));
}

//
//Scattering functions
//
float rayleighPhaseFunction(float cosTheta){
  return 1.12 + 0.4 * cosTheta;
}

float miePhaseFunction(float cosTheta){
  return MIE_PHASE_FUNCTION_COEFFICIENT * ((1.0 + cosTheta * cosTheta) / pow(1.0 + MIE_G_SQUARED - 2.0 * MIE_G * cosTheta, 1.5));
}

//
//Sphere Collision methods
//
vec2 intersectRaySphere(vec2 rayOrigin, vec2 rayDirection) {
    float b = dot(rayDirection, rayOrigin);
    float c = dot(rayOrigin, rayOrigin) - RADIUS_OF_EARTH_PLUS_RADIUS_OF_ATMOSPHERE_SQUARED;
    float t = (-b + sqrt((b * b) - c));
    return rayOrigin + t * rayDirection;
}

//From page 178 of Real Time Collision Detection by Christer Ericson
bool intersectsSphere(vec2 origin, vec2 direction, float radius){
  //presume that the sphere is located at the origin (0,0)
  bool collides = true;
  float b = dot(origin, direction);
  float c = dot(origin, origin) - radius * radius;
  if(c > 0.0 && b > 0.0){
    collides = false;
  }
  else{
    collides = (b * b - c) < 0.0 ? false : true;
  }
  return collides;
}

//solar-zenith angle parameterization methods
float inverseParameterizationOfZToCosOfSourceZenith(float z){
    return -(log(1.0 - z * ELOK_Z_CONST) + 0.8) / 2.8;
}

float parameterizationOfCosOfSourceZenithToZ(float cosOfSolarZenithAngle){
  return (1.0 - exp(-2.8 * cosOfSolarZenithAngle - 0.8)) / ELOK_Z_CONST;
}

//view-zenith angle parameterization methods
float inverseParameterizationOfXToCosOfViewZenith(float x){
  return 2.0 * x - 1.0;
}

//height parameterization methods
//[0, 1]
float parameterizationOfCosOfViewZenithToX(float cosOfTheViewAngle){
  return 0.5 * (1.0 + cosOfTheViewAngle);
}

//
//Converts the parameterized y to a radius (r + R_e) between R_e and R_e + 80
//[R_earth, R_earth + 80km]
float inverseParameterizationOfYToRPlusRe(float y){
  return sqrt(y * y * RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED + RADIUS_OF_EARTH_SQUARED);
}

//Converts radius (r + R_e) to a y value between 0 and 1
float parameterizationOfHeightToY(float r){
  return sqrt((r * r - RADIUS_OF_EARTH_SQUARED) / RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED);
}

//2D-3D texture conversion methods
//All of this stuff is zero-indexed
const float textureWidth = $textureWidth;
const float textureHeight = $textureHeight;
const float packingWidth = $packingWidth;
const float packingHeight = $packingHeight;

vec3 get3DUVFrom2DUV(vec2 uv2){
  vec3 uv3;
  vec2 parentTextureDimensions = vec2(textureWidth * packingWidth, textureHeight * packingHeight);
  vec2 pixelPosition = uv2 * parentTextureDimensions;
  float row = floor(pixelPosition.y / textureHeight);
  float column = floor(pixelPosition.x / textureWidth);
  float rowRemainder = pixelPosition.y - row * textureHeight;
  float columnRemainder = pixelPosition.x - column * textureWidth;
  uv3.x = columnRemainder / textureWidth;
  uv3.y = rowRemainder / textureHeight;
  uv3.z = (row * packingWidth + column) / (packingWidth * packingHeight);

  return uv3;
}

vec2 getUV2From3DUV(vec3 uv3){
  vec2 parentTextureDimensions = vec2(textureWidth * packingWidth, textureHeight * packingHeight);
  float zIndex = uv3.z * packingHeight * packingWidth - 1.0;
  float row = floor((zIndex + 1.0) / 2.0);
  float column = (zIndex + 1.0) - row * packingWidth;
  vec2 uv2;
  uv2.x = ((column + uv3.x) * textureWidth) / parentTextureDimensions.x;
  uv2.y = (((row + uv3.y - 1.0) * textureHeight)) / parentTextureDimensions.y;

  return vec2(uv2);
}

struct UVInterpolatants{
  vec2 uv0;
  vec2 uvf;
  float interpolationFraction;
};

UVInterpolatants getUVInterpolants(vec3 uv3, float depthInPixels){
  uv3.y += 1.0/($textureHeight - 1.0);
  uv3.x -= 1.0/($textureWidth - 1.0);
  float medianValue = (floor(uv3.z * depthInPixels) + ceil(uv3.z * depthInPixels)) / 2.0;
  float floorValue = clamp(floor(medianValue - 0.5) / depthInPixels, 0.0, 1.0);
  float ceilingValue = clamp(floor(medianValue + 0.5) / depthInPixels, 0.0, 1.0);
  vec2 uv2_0 = getUV2From3DUV(vec3(uv3.xy, floorValue));
  vec2 uv2_f = getUV2From3DUV(vec3(uv3.xy, ceilingValue));
  float interpolationFraction = clamp((uv3.z - floorValue) / (ceilingValue - floorValue), 0.0, 1.0);

  return UVInterpolatants(uv2_0, uv2_f, interpolationFraction);
}
