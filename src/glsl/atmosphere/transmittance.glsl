//Based on the thesis of from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
//By Gustav Bodare and Edvard Sandberg

const float RADIUS_OF_EARTH = 6366.7;
const float TWO_TIMES_THE_RADIUS_OF_THE_EARTH = 12733.4;
const float ATMOSPHERE_HEIGHT = 80.0;
const float ATMOSPHERE_HEIGHT_SQUARED = 6400.0;
const float ONE_OVER_MIE_SCALE_HEIGHT = 0.833333333333333333333333333333333333;
const float ONE_OVER_RAYLEIGH_SCALE_HEIGHT = 0.125;
const float OZONE_PERCENT_OF_RAYLEIGH = 0.0000006;
//Mie Beta / 0.9, http://www-ljk.imag.fr/Publications/Basilic/com.lmc.publi.PUBLI_Article@11e7cdda2f7_f64b69/article.pdf
const float EARTH_MIE_BETA_EXTINCTION = 0.00000222222222222222222222222222222222222222;

//8 * (PI^3) *(( (n_air^2) - 1)^2) / (3 * N_atmos * ((lambda_color)^4))
//(http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf - page 10)
//n_air = 1.00029
//N_atmos = 2.545e25
//lambda_red = 650nm
//labda_green = 510nm
//lambda_blue = 475nm
const vec3 RAYLEIGH_BETA = vec3(0.00000612434, 0.0000161596, 0.0000214752);

//As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
const vec3 OZONE_BETA = vec3(413.470734338, 413.470734338, 2.1112886E-13);

float cosViewZenithFromParameter(float parameterizedViewZenith, float kmAboveSeaLevel){
  float parameterizedViewZenithConst = - sqrt(kmAboveSeaLevel * (TWO_TIMES_THE_RADIUS_OF_THE_EARTH + kmAboveSeaLevel)) / (RADIUS_OF_EARTH + kmAboveSeaLevel);
  float cosOfViewZenith = 0.0;
  if(parameterizedViewZenith > 0.5){
    cosOfViewZenith = parameterizedViewZenithConst + pow((parameterizedViewZenith - 0.5), 5.0) * (1.0 - parameterizedViewZenithConst);
  }
  cosOfViewZenith = parameterizedViewZenithConst - pow(parameterizedViewZenith, 5.0) * (1.0 + parameterizedViewZenithConst);
  return cosOfViewZenith;
}

vec2 calculatePB(vec2 uv, float startingHeightInKM, float radiusOfCamera){
  float cosViewZenith = cosViewZenithFromParameter(uv.y, startingHeightInKM);
  float sinViewZenith = sqrt(1.0 - cosViewZenith * cosViewZenith);
  float radiusOfCameraSquared = radiusOfCamera * radiusOfCamera;

  //Simplifying the results from https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
  float t_intersection = radiusOfCamera * sinViewZenith + sqrt(ATMOSPHERE_HEIGHT_SQUARED - radiusOfCameraSquared * (1.0 - sinViewZenith * sinViewZenith));
  return vec2(cosViewZenith * t_intersection, sinViewZenith * t_intersection);
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  //Height and view angle is parameterized
  //Calculate these and determine the intersection of the ray and the edge of the
  //Earth's atmosphere.
  float startingHeight = uv.x * uv.x * ATMOSPHERE_HEIGHT;
  vec2 pA = vec2(0.0, startingHeight + RADIUS_OF_EARTH);
  vec2 p = pA;
  float height = 0.0;
  vec2 pB = calculatePB(uv, startingHeight, pA.y);
  float distFromPaToPb = distance(pA, pB);
  float deltaP = distFromPaToPb / $numberOfStepsMinusOne;
  vec2 direction = (pB - pA) / distFromPaToPb;

  //Initialize our final variables used in our loop
  float totalDensityMie = 0.0;
  float currentMieDensity = 0.0;
  float totalDensityRayleigh = 0.0;
  float currentRayleighDensity = 0.0;

  //Integrate from Pa to Pb to determine the total transmittance
  vec3 transmittance = vec3(1.0);
  #pragma unroll
  for(int i = 0; i < $numberOfSteps; i++){
    p = pA + direction * float(i) * deltaP;
    height = length(p) - RADIUS_OF_EARTH;
    currentMieDensity = exp(-height * ONE_OVER_MIE_SCALE_HEIGHT);
    currentRayleighDensity = exp(-height * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
    totalDensityMie += 2.0 * currentMieDensity;
    totalDensityMie += 2.0 * currentRayleighDensity;
  }
  totalDensityMie = (totalDensityMie - currentMieDensity) / (2.0 * deltaP);
  totalDensityRayleigh = (totalDensityRayleigh - currentRayleighDensity) / (2.0 * deltaP);
  float integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;
  transmittance = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));

  gl_FragColor = vec4(transmittance, 1.0);
}
