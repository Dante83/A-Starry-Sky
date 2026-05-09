//Based on the work of Oskar Elek
//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf
//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
//by Gustav Bodare and Edvard Sandberg

const float PI = 3.14159265359;
const float PI_TIMES_FOUR = 12.5663706144;
const float PI_TIMES_TWO = 6.28318530718;
const float PI_OVER_TWO = 1.57079632679;
const float RADIUS_OF_EARTH = $radiusOfEarth;
const float RADIUS_OF_AURORA_BOTTOM = $radiusOfAuroraBottom;
const float RADIUS_OF_AURORA_TOP = $radiusOfAuroraTop;
const float RADIUS_OF_EARTH_SQUARED = $radiusOfEarthSquared;
const float RADIUS_OF_EARTH_PLUS_RADIUS_OF_ATMOSPHERE_SQUARED = $radiusOfEarthPlusRadiusOfAtmospherSquared;
const float RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED = $radiusAtmosphereSquaredMinusRadiusOfEarthSquared;
const float ATMOSPHERE_HEIGHT = $atmosphereHeight;
const float ATMOSPHERE_HEIGHT_SQUARED = $atmosphereHeightSquared;
const float ONE_OVER_MIE_SCALE_HEIGHT = $oneOverMieScaleHeight;
const float ONE_OVER_RAYLEIGH_SCALE_HEIGHT = $oneOverRayleighScaleHeight;
//Mie extinction coefficient (β_ext). Single-scattering albedo (0.9 for atmospheric Mie)
//is applied at the LUT bake step, so this is the raw extinction. Reference:
//https://web.archive.org/web/20170215054740/http://www-ljk.imag.fr/Publications/Basilic/com.lmc.publi.PUBLI_Article@11e7cdda2f7_f64b69/article.pdf
const vec3 EARTH_MIE_BETA_EXTINCTION = $mieBeta;
const float ELOK_Z_CONST = 0.97267627755;
const float ONE_OVER_EIGHT_PI = 0.039788735772;
const float ONE_OVER_FOUR_PI = 0.079577471545;
const float THREE_OVER_SIXTEEN_PI = 0.05968310365946075;
const float METERS_TO_KM = 0.001;

const float MIE_G = $mieG;
const float MIE_G_SQUARED = $mieGSquared;
const float MIE_PHASE_FUNCTION_COEFFICIENT = $miePhaseFunctionCoefficient; //(1.5 * (1.0 - MIE_G_SQUARED) / (2.0 + MIE_G_SQUARED))

//8 * (PI^3) *(( (n_air^2) - 1)^2) / (3 * N_atmos * ((lambda_color)^4))
//I actually found the values from the ET Engine by Illation
//https://github.com/Illation/ETEngine
//Far more helpful for determining my mie and rayleigh values
const vec3 RAYLEIGH_BETA = $rayleighBeta;

//As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
const float OZONE_PERCENT_OF_RAYLEIGH = $ozonePercentOfRayleigh;
const vec3 OZONE_BETA = $ozoneBeta;

//
//General methods
//
float fModulo(float a, float b){
  return (a - (b * floor(a / b)));
}

vec3 vec3Modulo(vec3 a, vec3 b){
  float x = (a.x - (b.x * floor(a.x / b.x)));
  float y = (a.y - (b.y * floor(a.y / b.y)));
  float z = (a.z - (b.z * floor(a.z / b.z)));
  return vec3(x, y, z);
}

vec4 sRGBToLinear( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}

vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

//
//Scattering functions
//
float rayleighPhaseFunction(float cosTheta){
  return THREE_OVER_SIXTEEN_PI * (1.0 + cosTheta * cosTheta);
}

float miePhaseFunction(float cosTheta){
  float t = 1.0 + MIE_G_SQUARED - 2.0 * MIE_G * cosTheta;
  return MIE_PHASE_FUNCTION_COEFFICIENT * ((1.0 + cosTheta * cosTheta) / (t * sqrt(t)));
}

//
//Sphere Collision methods
//
vec2 intersectRaySphere(vec2 rayOrigin, vec2 rayDirection) {
    float radius = RADIUS_OF_EARTH + ATMOSPHERE_HEIGHT;
    float a = dot(rayDirection, rayDirection);
    float b = 2.0 * dot(rayDirection, rayOrigin);
    float c = dot(rayOrigin, rayOrigin) - radius * radius;
    float discriminate = sqrt(max(0.0, b * b - 4.0 * a * c));
    float t0 = (-b - discriminate) /  (2.0 * a);
    float t1 = (-b + discriminate) /  (2.0 * a);
    vec2 ray0 = rayOrigin + t0 * rayDirection;
    vec2 ray1 = rayOrigin + t1 * rayDirection;

    if(t1 > t0){
      return ray1;
    }
    return ray0;
}

vec3 intersectRaySphere3D(vec3 rayOrigin, vec3 rayDirection, float radius) {
    float a = dot(rayDirection, rayDirection);
    float b = 2.0 * dot(rayDirection, rayOrigin);
    float c = dot(rayOrigin, rayOrigin) - radius * radius;
    float discriminate = sqrt(max(0.0, b * b - 4.0 * a * c));
    float t0 = (-b - discriminate) /  (2.0 * a);
    float t1 = (-b + discriminate) /  (2.0 * a);
    vec3 ray0 = rayOrigin + t0 * rayDirection;
    vec3 ray1 = rayOrigin + t1 * rayDirection;

    if(dot(rayDirection, ray0) > 0.0){
      return ray0;
    }
    return ray1;
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

bool intersectsSphere3D(vec3 origin, vec3 direction, float radius){
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

//Earth-shadow geometry — runs the bisection ONCE per (viewDir, lightDir).
//state: 1.0 = full sun (no shadow), 0.0 = full shadow, 0.5 = needs density weighting
//via earthsShadowDensityRatio. This split halves the cost when both Mie and
//Rayleigh need a shadow ratio because only the final exponential differs.
struct EarthShadowGeometry {
  vec3 startingTargetPoint;
  vec3 finalTargetPoint;
  vec3 sunsetPosition;
  float state;
};

EarthShadowGeometry earthsShadowGeometry(vec3 viewDirection, vec3 lightDirection, float startingHeight, float endingHeight){
  EarthShadowGeometry g;
  float earthCentricStartingHeight = RADIUS_OF_EARTH + startingHeight + 0.01;
  float earthCentricEndingHeight = RADIUS_OF_EARTH + endingHeight;
  g.startingTargetPoint = vec3(0.0, earthCentricStartingHeight, 0.0);
  g.finalTargetPoint = intersectRaySphere3D(g.startingTargetPoint, viewDirection, earthCentricEndingHeight);
  g.sunsetPosition = g.finalTargetPoint;

  bool intersection1 = intersectsSphere3D(g.startingTargetPoint, lightDirection, RADIUS_OF_EARTH);
  bool intersection2 = intersectsSphere3D(g.finalTargetPoint, lightDirection, RADIUS_OF_EARTH);

  //Both ends see the sun → no shadow.
  if(!intersection1 && !intersection2){
    g.state = 1.0;
    return g;
  }
  //Neither end sees the sun → fully in Earth's umbra.
  if(intersection1 && intersection2){
    g.state = 0.0;
    return g;
  }

  //Otherwise bisect along the view ray to find the terminator height.
  float heightDiff = (endingHeight - startingHeight) * 0.5;
  float sunsetHeight = endingHeight - heightDiff;
  for(int i = 0; i < 8; i++){
    g.sunsetPosition = intersectRaySphere3D(g.startingTargetPoint, viewDirection, RADIUS_OF_EARTH + sunsetHeight);
    intersection2 = intersectsSphere3D(g.sunsetPosition, lightDirection, RADIUS_OF_EARTH);
    heightDiff *= 0.5;
    sunsetHeight += intersection2 ? heightDiff : -heightDiff;
  }
  g.state = 0.5;
  return g;
}

float earthsShadowDensityRatio(EarthShadowGeometry g, float scaleHeight){
  if(g.state > 0.99){ return 1.0; }
  if(g.state < 0.01){ return 0.0; }
  return clamp(1.0 - (exp((g.sunsetPosition.y - g.startingTargetPoint.y) * scaleHeight) / exp((g.finalTargetPoint.y - g.startingTargetPoint.y) * scaleHeight)), 0.0, 1.0);
}

//Backwards-compat wrapper — single-scaleHeight callers (none in production
//code today, but kept for symmetry).
float earthsShadowIntensity(vec3 viewDirection, vec3 lightDirection, float startingHeight, float endingHeight, float scaleHeight){
  EarthShadowGeometry g = earthsShadowGeometry(viewDirection, lightDirection, startingHeight, endingHeight);
  return earthsShadowDensityRatio(g, scaleHeight);
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
  vec2 parentTextureDimensions = vec2(textureWidth, textureHeight * packingHeight);
  vec2 pixelPosition = uv2 * parentTextureDimensions;
  float row = floor(pixelPosition.y / textureHeight);
  float rowRemainder = pixelPosition.y - row * textureHeight;
  uv3.x = pixelPosition.x / textureWidth;
  uv3.y = rowRemainder / textureHeight;
  uv3.z = row / packingHeight;

  return uv3;
}
