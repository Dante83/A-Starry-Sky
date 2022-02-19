precision highp float;
precision highp int;
precision highp sampler3D;

//Based on the work of Oskar Elek
//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf
//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
//by Gustav Bodare and Edvard Sandberg

layout(location = 0) out vec4 mieOutColor;
layout(location = 1) out vec4 rayleighOutColor;
layout(location = 2) out vec4 mieSumOutColor;
layout(location = 3) out vec4 rayleighSumOutColor;

uniform sampler3D inscatteredMieLightLUT;
uniform sampler3D inscatteredRayleighLightLUT;
uniform sampler2D transmittanceTexture;
uniform sampler2D mieSumInColor;
uniform sampler2D rayleighSumInColor;

const float mieGCoefficient = $mieGCoefficient;

$atmosphericFunctions

struct GatheredLight{
  vec3 mie;
  vec3 rayleigh;
};

GatheredLight gatherInscatteredLight(float r, float sunAngleAtP){
  float x;
  float y = parameterizationOfHeightToY(r);
  float z = parameterizationOfCosOfSourceZenithToZ(sunAngleAtP);
  vec3 uv3 = vec3(x, y, z);
  vec2 inscatteredUV2;
  vec3 gatheredInscatteredIntensityMie = vec3(0.0);
  vec3 gatheredInscatteredIntensityRayleigh = vec3(0.0);
  vec3 transmittanceFromPToPb;
  vec3 inscatteredLight;
  float theta = 0.0;
  float angleBetweenCameraAndIncomingRay;
  float phaseValueMie;
  float phaseValueRayleigh;
  float cosAngle;
  float deltaTheta = PI_TIMES_TWO / $numberOfChunks;
  float depthInPixels = $textureDepth;
  vec3 inscatteredMieLight;
  vec3 inscatteredRayleighLight;

  #pragma unroll_loop_start
  for(int i = 1; i < $numberOfChunksInt; i++){
    theta += deltaTheta;
    uv3.x = parameterizationOfCosOfViewZenithToX(cos(theta));

    //Get our transmittance value
    transmittanceFromPToPb = texture(transmittanceTexture, uv3.xy).rgb;

    //Interpolate our inscattered light from the 3D texture
    inscatteredMieLight = texture(inscatteredMieLightLUT, uv3).rgb;
    inscatteredRayleighLight = texture(inscatteredRayleighLightLUT, uv3).rgb;

    angleBetweenCameraAndIncomingRay = abs(fModulo(abs(theta - sunAngleAtP), PI_TIMES_TWO)) - PI;
    cosAngle = cos(angleBetweenCameraAndIncomingRay);
    phaseValueMie = miePhaseFunction(cosAngle);
    phaseValueRayleigh = rayleighPhaseFunction(cosAngle);

    gatheredInscatteredIntensityMie += inscatteredMieLight * phaseValueMie * transmittanceFromPToPb;
    gatheredInscatteredIntensityRayleigh += inscatteredRayleighLight * phaseValueRayleigh * transmittanceFromPToPb;
  }
  #pragma unroll_loop_end
  gatheredInscatteredIntensityMie = gatheredInscatteredIntensityMie * PI_TIMES_FOUR / $numberOfChunks;
  gatheredInscatteredIntensityRayleigh = gatheredInscatteredIntensityMie * PI_TIMES_FOUR / $numberOfChunks;
  return GatheredLight(gatheredInscatteredIntensityMie, gatheredInscatteredIntensityRayleigh);
}

void main(){
  //This is actually a packed 3D Texture
  vec2 uv_2d = gl_FragCoord.xy/resolution.xy;
  vec3 uv = get3DUVFrom2DUV(gl_FragCoord.xy/resolution.xy);
  float r = inverseParameterizationOfYToRPlusRe(uv.y);
  float h = r - RADIUS_OF_EARTH;
  vec2 pA = vec2(0.0, r);
  vec2 p = pA;
  float cosOfViewZenith = inverseParameterizationOfXToCosOfViewZenith(uv.x);
  float cosOfSunZenith = inverseParameterizationOfZToCosOfSourceZenith(uv.z);
  //sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction
  vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);
  vec2 sunDirection = vec2(sqrt(1.0 - cosOfSunZenith * cosOfSunZenith), cosOfSunZenith);
  float initialSunAngle = atan(sunDirection.x, sunDirection.y);

  //Check if we intersect the earth. If so, return a transmittance of zero.
  //Otherwise, intersect our ray with the atmosphere.
  vec2 pB = intersectRaySphere(pA, cameraDirection);
  float distFromPaToPb = distance(pA, pB);
  float chunkLength = distFromPaToPb / $numberOfChunks;
  vec2 deltaP = cameraDirection * chunkLength;

  bool intersectsEarth = intersectsSphere(p, cameraDirection, RADIUS_OF_EARTH);
  vec3 totalInscatteringMie = vec3(0.0);
  vec3 totalInscatteringRayleigh = vec3(0.0);
  if(!intersectsEarth){
    //Prime our trapezoidal rule
    float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
    float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
    float totalDensityMie = 0.0;
    float totalDensityRayleigh = 0.0;

    vec3 transmittancePaToP = vec3(1.0);
    vec2 uvt = vec2(parameterizationOfCosOfViewZenithToX(cosOfSunZenith), parameterizationOfHeightToY(r));

    GatheredLight gatheringFunction = gatherInscatteredLight(length(p), initialSunAngle);
    vec3 previousMieInscattering = gatheringFunction.mie * previousMieDensity * transmittancePaToP;
    vec3 previousRayleighInscattering = gatheringFunction.rayleigh * previousRayleighDensity * transmittancePaToP;

    //Integrate from Pa to Pb to determine the total transmittance
    //Using the trapezoidal rule.
    float mieDensity;
    float rayleighDensity;
    float integralOfOzoneDensityFunction;
    float r_p;
    float sunAngle;
    vec3 mieInscattering;
    vec3 rayleighInscattering;
    vec3 previousInscatteringMie;
    vec3 previousInscatteringRayleigh;
    #pragma unroll_loop_start
    for(int i = 1; i < $numberOfChunksInt; i++){
      p += deltaP;
      r_p = length(p);
      h = r_p - RADIUS_OF_EARTH;
      //Only inscatter if this point is outside of the earth
      //otherwise it contributes nothing to the final result
      if(h > 0.0){
        sunAngle = initialSunAngle - atan(p.x, p.y);

        //Iterate our progress through the transmittance along P
        mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
        rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
        totalDensityMie += (previousMieDensity + mieDensity) * chunkLength * 0.5;
        totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength * 0.5;
        integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;
        transmittancePaToP = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));

        //Now that we have the transmittance from Pa to P, get the transmittance from P to Pc
        //and combine them to determine the net transmittance
        uvt = vec2(parameterizationOfCosOfViewZenithToX(cos(sunAngle)), parameterizationOfHeightToY(r_p));
        gatheringFunction = gatherInscatteredLight(r_p, sunAngle);
        mieInscattering = gatheringFunction.mie * mieDensity * transmittancePaToP;
        rayleighInscattering = gatheringFunction.rayleigh * rayleighDensity * transmittancePaToP;
        totalInscatteringMie += (previousInscatteringMie + mieInscattering) * chunkLength;
        totalInscatteringRayleigh += (previousInscatteringRayleigh + rayleighInscattering) * chunkLength;

        //Store our values for the next iteration
        previousInscatteringMie = mieInscattering;
        previousInscatteringRayleigh = rayleighInscattering;
        previousMieDensity = mieDensity;
        previousRayleighDensity = rayleighDensity;
      }
    }
    #pragma unroll_loop_end

    totalInscatteringMie *= ONE_OVER_EIGHT_PI * EARTH_MIE_BETA_EXTINCTION;
    totalInscatteringRayleigh *= ONE_OVER_EIGHT_PI * RAYLEIGH_BETA;
  }

  mieOutColor = max(vec4(totalInscatteringMie, 1.0), vec4(0.0));
  rayleighOutColor = max(vec4(totalInscatteringRayleigh, 1.0), vec4(0.0));
  mieSumOutColor = vec4(texture(mieSumInColor, uv_2d).rgb + mieOutColor.rgb, 1.0);
  rayleighSumOutColor = vec4(texture(rayleighSumInColor, uv_2d).rgb + rayleighOutColor.rgb, 1.0);
}
