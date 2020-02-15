//Based on the thesis of from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
//By Gustav Bodare and Edvard Sandberg
uniform sampler2D kMinusOneMieInscattering;
uniform sampler2D kMinusOneRayleighInscattering;
uniform sampler2D transmittanceTexture;

const float mieGCoefficient = $mieGCoefficient;
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
const float OZONE_PERCENT_OF_RAYLEIGH = 0.0000006;
//Mie Beta / 0.9, http://www-ljk.imag.fr/Publications/Basilic/com.lmc.publi.PUBLI_Article@11e7cdda2f7_f64b69/article.pdf
//const float EARTH_MIE_BETA_EXTINCTION = 0.00000222222222222222222222222222222222222222;
const float EARTH_MIE_BETA_EXTINCTION = 0.0044444444444444444444444444444444444444444444;
const float ELOK_Z_CONST = 0.9726762775527075;
const float ONE_OVER_EIGHT_PI = 0.039788735772973836;
const vec3 intensity = vec3(10.0);

//8 * (PI^3) *(( (n_air^2) - 1)^2) / (3 * N_atmos * ((lambda_color)^4))
//(http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf - page 10)
//n_air = 1.00029
//N_atmos = 2.545e25
//lambda_red = 650nm
//labda_green = 510nm
//lambda_blue = 475nm
const vec3 RAYLEIGH_BETA = vec3(5.8e-3, 1.35e-2, 3.31e-2);

//As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
const vec3 OZONE_BETA = vec3(413.470734338, 413.470734338, 2.1112886E-13);

//Texture setup
const float textureWidth = $textureWidth;
const float textureHeight = $textureHeight;
const float packingWidth = $packingWidth;
const float packingHeight = $packingHeight;

float fModulo(float a, float b){
  return (a - (b * floor(a / b)));
}

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

float parameterizationOfCosOfSunZenithToZ(float cs_theta){
  return (1.0 - exp(-2.8 * cs_theta - 0.8)) / ELOK_Z_CONST;
}

//Converts the parameterized x to cos(zenith) of the sun
float inverseParameterizationOfZToCosOfSunZenith(float z){
    return -(log(1.0 - z * ELOK_Z_CONST) + 0.8) / 2.8;
}

//Converts the parameterized x to cos(zenith) where zenith is between 0 and pi
float inverseParameterizationOfXToCosOfZenith(float x){
  return 2.0 * x - 1.0;
}

//Converts the cosine of a given theta to a pixel x location betweeen 0 and 1
float parameterizationOfCosOfZenithToX(float cs_theta){
  return 0.5 * (1.0 + cs_theta);
}

//Converts the parameterized y to a radius (r + R_e) between R_e and R_e + 80
float inverseParameterizationOfYToRPlusRe(float y){
  return sqrt(y * y * RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED + RADIUS_OF_EARTH_SQUARED);
}

//Converts radius (r + R_e) to a y value between 0 and 1
float parameterizationOfHeightToY(float r){
  return sqrt((r * r - RADIUS_OF_EARTH_SQUARED) / RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED);
}

vec3 get3DUVFrom2DUV(vec2 glFragCoords){
  float row = floor(glFragCoords.y / textureHeight);
  float column = floor(glFragCoords.x / textureWidth);
  float zPixelCoord = row * packingWidth + column;
  vec3 uv;
  uv.x = (glFragCoords.x - column * textureWidth) / textureWidth;
  uv.y = (glFragCoords.y - row * textureHeight) / textureHeight;
  uv.z = zPixelCoord / (packingWidth * packingHeight - 1.0);

  return uv;
}

vec2 getUV2From3DUV(vec3 uv3Coords){
  float row = floor(uv3Coords.z * $packingHeight);
  float column = fModulo(row * packingWidth, $packingWidth);
  float x = (column * $packingWidth + $textureWidth * uv3Coords.x) / ($packingWidth * $textureWidth);
  float y = (row * $packingHeight + $textureHeight * uv3Coords.y) / ($packingHeight * $textureHeight);
  return vec2(x, y);
}

float phaseMie(float cosTheta){
  float g_squared = mieGCoefficient * mieGCoefficient;
  return (1.5 * (1.0 - g_squared) / (2.0 + g_squared)) * ((1.0 + cosTheta * cosTheta) / pow((1.0 +  g_squared - 2.0 *  mieGCoefficient * + cosTheta * cosTheta), 1.5));
}

//Modified Rayleigh Phase Function
//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf
float phaseRayleigh(float cosTheta){
  return 0.8 * (1.4 + 0.5 * cosTheta);
}

vec3 gatherInscatteredLight(float r, float cameraZenith, float sunAngleAtP){
  float x;
  float y = parameterizationOfHeightToY(r);
  float z = inverseParameterizationOfZToCosOfSunZenith(sunAngleAtP);
  vec2 uvInscattered;
  vec3 gatheredInscatteredIntensity = vec3(0.0);
  vec3 inscatteredLight;
  float theta = 0.0;
  float angleBetweenCameraAndIncomingRay;
  float phaseValue;
  float cosAngle;
  float deltaTheta = PI_TIMES_TWO / $numberOfChunks;

  #pragma unroll
  for(int i = 1; i < $numberOfChunksInt; i++){
    theta += deltaTheta;
    x = parameterizationOfCosOfZenithToX(cos(theta));
    uvInscattered = getUV2From3DUV(vec3(x, y, z));
    angleBetweenCameraAndIncomingRay = cameraZenith - deltaTheta;
    cosAngle = cos(angleBetweenCameraAndIncomingRay);
    #if($isRayleigh)
      inscatteredLight = texture2D(kMinusOneRayleighInscattering, uvInscattered).rgb;
      phaseValue = 0.75 * (1.0 + cosAngle * cosAngle);
    #else
      inscatteredLight = texture2D(kMinusOneMieInscattering, uvInscattered).rgb;
      phaseValue = ((3.0 * (1.0 - mieGCoefficient * mieGCoefficient)) / (2.0 * (2.0 + mieGCoefficient * mieGCoefficient)));
      phaseValue *= ((1.0 + cosAngle * cosAngle) / pow((1.0 + mieGCoefficient * mieGCoefficient - 2.0 * mieGCoefficient * cosAngle * cosAngle), 3.0 / 2.0));
    #endif

    gatheredInscatteredIntensity += inscatteredLight * phaseValue;
  }
  return gatheredInscatteredIntensity * PI_TIMES_FOUR / $numberOfChunks;
}

void main(){
  //This is actually a packed 3D Texture
  vec3 uv = get3DUVFrom2DUV(gl_FragCoord.xy / resolution.xy);
  float r = inverseParameterizationOfYToRPlusRe(uv.y);
  float h = r - RADIUS_OF_EARTH;
  vec2 pA = vec2(0.0, r);
  vec2 p = pA;
  float cosOfViewZenith = inverseParameterizationOfXToCosOfZenith(uv.x);
  float cosOfSunZenith = inverseParameterizationOfZToCosOfSunZenith(uv.z);
  //sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction
  vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);
  float cameraAngle = atan(cameraDirection.x, cameraDirection.y);
  vec2 sunDirection = vec2(sqrt(1.0 - cosOfSunZenith * cosOfSunZenith), cosOfSunZenith);
  float initialSunAngle = atan(sunDirection.x, sunDirection.y);

  //Check if we intersect the earth. If so, return a transmittance of zero.
  //Otherwise, intersect our ray with the atmosphere.
  vec2 pB = intersectRaySphere(vec2(0.0, r), cameraDirection);
  float distFromPaToPb = distance(pA, pB);
  float chunkLength = distFromPaToPb / $numberOfChunks;
  vec2 direction = (pB - pA) / distFromPaToPb;
  vec2 deltaP = direction * chunkLength;

  vec3 totalInscattering = vec3(0.0);
  //Prime our trapezoidal rule
  float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
  float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
  float totalDensityMie = 0.0;
  float totalDensityRayleigh = 0.0;

  vec3 transmittancePaToP = vec3(1.0);
  //Was better when this was just the initial angle of the sun
  vec2 uvt = vec2(parameterizationOfCosOfZenithToX(cosOfSunZenith), parameterizationOfHeightToY(r));
  vec3 transmittance = transmittancePaToP * texture2D(transmittanceTexture, uvt).rgb;

  vec3 previousMieInscattering = previousMieDensity * transmittance;
  vec3 previousRayleighInscattering = previousRayleighDensity * transmittance;

  #if($isRayleigh)
    vec3 previousInscattering = previousMieDensity * transmittance;
  #else
    vec3 previousInscattering = previousRayleighDensity * transmittance;
  #endif

  //Integrate from Pa to Pb to determine the total transmittance
  //Using the trapezoidal rule.
  float mieDensity;
  float rayleighDensity;
  float integralOfOzoneDensityFunction;
  float r_p;
  float sunAngle;
  vec3 inscattering;
  #pragma unroll
  for(int i = 1; i < $numberOfChunksInt; i++){
    p += deltaP;
    r_p = length(p);
    h = r_p - RADIUS_OF_EARTH;
    //Only inscatter if this point is inside of the earth
    //otherwise it contributes nothing to the final result
    if(h > 0.0){
      //Do I add or subtract the angle? O_o
      sunAngle = initialSunAngle + atan(p.x, p.y);

      //Iterate our progress through the transmittance along P
      mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
      rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
      totalDensityMie += (previousMieDensity + mieDensity) * chunkLength * 0.5;
      totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength * 0.5;
      integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;
      transmittancePaToP = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));

      //Now that we have the transmittance from Pa to P, get the transmittance from P to Pc
      //and combine them to determine the net transmittance
      uvt = vec2(parameterizationOfCosOfZenithToX(cos(sunAngle)), parameterizationOfHeightToY(r_p));
      transmittance = transmittancePaToP * texture2D(transmittanceTexture, uvt).rgb;
      #if($isRayleigh)
        inscattering = rayleighDensity * transmittance * gatherInscatteredLight(r_p, cameraAngle, sunAngle);
      #else
        inscattering = mieDensity * transmittance * gatherInscatteredLight(r_p, cameraAngle, sunAngle);
      #endif
      totalInscattering += (previousInscattering + inscattering) * chunkLength;

      //Store our values for the next iteration
      previousInscattering = inscattering;
      previousMieDensity = mieDensity;
      previousRayleighDensity = rayleighDensity;
    }
  }
  #if($isRayleigh)
    totalInscattering *= ONE_OVER_EIGHT_PI * intensity * RAYLEIGH_BETA;
  #else
    totalInscattering *= ONE_OVER_EIGHT_PI * intensity * EARTH_MIE_BETA_EXTINCTION;
  #endif

  gl_FragColor = vec4(totalInscattering, 1.0);
}
