//Based on the thesis of from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
//By Gustav Bodare and Edvard Sandberg

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

vec2 intersectRaySphere(vec2 rayOrigin, vec2 rayDirection) {
    float b = dot(rayDirection, rayOrigin);
    float c = dot(rayOrigin, rayOrigin) - RADIUS_OF_EARTH_PLUS_RADIUS_OF_ATMOSPHERE_SQUARED;
    float t = (-b - sqrt((b * b) - c));
    return rayOrigin + t * rayDirection;
}

//From page 178 of Real Time Collision Detection by Christer Ericson
bool intersectsSphere(vec2 origin, vec2 direction, float radius){
  //presume that the sphere is located at the origin (0,0)
  bool collides = false;
  float b = dot(origin, direction);
  float c = dot(origin, origin) - radius * radius;
  if(c > 0.0 && b > 0.0){
    collides = true;
  }
  else{
    collides = (b * b - c) < 0.0 ? true : false;
  }
  return collides;
}

//Converts the parameterized x to cos(zenith) where zenith is between 0 and pi
float inverseParameterizationOfXToCosOfZenith(float x){
  return 2.0 * x - 1.0;
}

//Converts the parameterized y to a radius (r + R_e) between R_e and R_e + 80
float inverseParameterizationOfYToRPlusRe(float y){
  return sqrt(y * y * RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED + RADIUS_OF_EARTH_SQUARED);
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float r = inverseParameterizationOfYToRPlusRe(uv.y);
  float h = r - RADIUS_OF_EARTH;
  vec2 pA = vec2(0.0, r);
  vec2 p = pA;
  float cosOfViewZenith = inverseParameterizationOfXToCosOfZenith(uv.x);
  //sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction
  vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);

  //Check if we intersect the earth. If so, return a transmittance of zero.
  //Otherwise, intersect our ray with the atmosphere.

  vec2 pB = intersectRaySphere(vec2(0.0, r), cameraDirection);
  vec3 transmittance = vec3(0.0);
  float distFromPaToPb = 0.0;
  bool intersectsEarth = intersectsSphere(p, cameraDirection, RADIUS_OF_EARTH);
  if(!intersectsEarth){
    distFromPaToPb = distance(pA, pB);
    float chunkLength = distFromPaToPb / $numberOfChunks;
    vec2 direction = (pB - pA) / distFromPaToPb;
    vec2 deltaP = direction * chunkLength;

    //Prime our trapezoidal rule
    float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
    float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
    float totalDensityMie = 0.0;
    float totalDensityRayleigh = 0.0;

    //Integrate from Pa to Pb to determine the total transmittance
    //Using the trapezoidal rule.
    float mieDensity;
    float rayleighDensity;
    #pragma unroll
    for(int i = 1; i < $numberOfChunksInt; i++){
      p += deltaP;
      h = length(p) - RADIUS_OF_EARTH;
      mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
      rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
      totalDensityMie += (previousMieDensity + mieDensity) * chunkLength;
      totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength;

      //Store our values for the next iteration
      previousMieDensity = mieDensity;
      previousRayleighDensity = rayleighDensity;
    }
    totalDensityMie *= 0.5;
    totalDensityRayleigh *= 0.5;

    float integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;
    transmittance = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));
  }

  gl_FragColor = vec4(transmittance, 1.0);
}
