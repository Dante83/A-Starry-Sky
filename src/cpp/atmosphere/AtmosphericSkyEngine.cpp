#include "Sun.h"
#include "Moon.h"
#include "SkyState.h"
#include "Constants.h" //Local constants
#include "../Constants.h" //Global constants

AtmosphericSkyEngine(double kmAboveSeaLevel, int numberOfRayleighTransmissionSteps, int numberOfMieTransmissionSteps, double stepsPerKilo){
  //Set the Rayleigh Scattering Beta Coefficient
  rayleighDensity = exp(-kmAboveSeaLevel * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
  mieDensity = exp(-kmAboveSeaLevel * ONE_OVER_MIE_SCALE_HEIGHT);
  stepsPerkm = stepsPerKilo;
  //As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
  double moleculesPerMeterCubedAtSeaLevel = pow(2.545, 25);
  ozoneRedBeta = pow(2.0, -25) * moleculesPerMeterCubedAtSeaLevel;
  ozoneGreenBeta = pow(2.0, -25) * moleculesPerMeterCubedAtSeaLevel;
  ozoneBlueBeta = pow(7.0, -27) * moleculesPerMeterCubedAtSeaLevel;
}

//NOTE: Here, h_0 and h_f should be in kilometers
void computeTransmittance(double h_0, double h_f, double* transmittance){
  //Initialize our functions at x_0 + x_n
  double integralOfRayleighDensityFunction = 0.0;
  double integralOfMieDensityFunction = 0.0;
  double integralOfOzoneDensityFunction;
  int numberOfSteps = ceil(deltaH * stepsPerkm);
  int numberOfStepsMinusOne = numberOfSteps - 1;
  double deltaH = (h_f - h_0) / numberOfSteps;
  double percentOfRayleighScaleHeight = -deltaH * ONE_OVER_RAYLEIGH_SCALE_HEIGHT;
  double percentOfMieScaleHeight = -deltaH * ONE_OVER_MIE_SCALE_HEIGHT;
  double h_i = -h_0; //Initialize to this
  for(int i = 1; i < numberOfStepsMinusOne; i++){
    h_i -= deltaH;
    integralOfRayleighDensityFunction += exp(h_i * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
    integralOfMieDensityFunction += exp(h_i * ONE_OVER_MIE_SCALE_HEIGHT);
  }
  //Add x_0 and x_n after multiplying by 2
  integralOfRayleighDensityFunction = 0.5 * deltaH * (2.0 * integralOfRayleighDensityFunction + exp(h_0 * ONE_OVER_RAYLEIGH_SCALE_HEIGHT) + exp(h_f * ONE_OVER_RAYLEIGH_SCALE_HEIGHT));
  integralOfOzoneDensityFunction = integralOfRayleighDensityFunction * 0.0000006;
  integralOfMieDensityFunction = 0.5 * deltaH * (2.0 * integralOfRayleighDensityFunction + exp(h_0 * ONE_OVER_MIE_SCALE_HEIGHT) + exp(h_f * ONE_OVER_MIE_SCALE_HEIGHT));
  double mieTransmittanceExponent = -EARTH_MIE_BETA_EXTINCTION * integralOfMieDensityFunction;
  //Using http://skyrenderer.blogspot.com/
  transmittance[0] = exp(-EARTH_RAYLEIGH_RED_BETA * integralOfRayleighDensityFunction - mieTransmittanceExponent - ozoneRedBeta * integralOfOzoneDensityFunction);
  transmittance[1] = exp(-EARTH_RAYLEIGH_GREEN_BETA * integralOfRayleighDensityFunction - mieTransmittanceExponent - ozoneGreenBeta * integralOfOzoneDensityFunction);
  transmittance[2] = exp(-EARTH_RAYLEIGH_BLUE_BETA * integralOfRayleighDensityFunction - mieTransmittanceExponent - ozoneBlueBeta * integralOfOzoneDensityFunction);
}

void calculateSingleScattering(double lightZenith, double viewZenith, double altitude){
  //Calculate the intersection of our viewZenith with the edge of the atmosphere
  double pb;
  double distanceToPb = sqrt(pb);
  int numIterations = ceil(distanceToPb * stepsPerkm);
  double totalInscatteringMie = 0.0;
  double totalInscatteringRayleigh = {0.0, 0.0, 0.0};
  for(){

  }
  totalInscatteringMie *= EARTH_RAYLEIGH_RED_BETA_OVER_FOUR_PI;
  totalInscatteringRayleigh[0] *= EARTH_RAYLEIGH_RED_BETA_OVER_FOUR_PI;
  totalInscatteringRayleigh[1] *= EARTH_RAYLEIGH_GREEN_BETA_OVER_FOUR_PI;
  totalInscatteringRayleigh[2] *= EARTH_MIE_BETA_OVER_FOUR_PI;
}

//
//NOTE: When using these functions, if you change the height, it is important to call update height first.
//all the other components will depend upon this first request
//
void updateHeight(double kmAboveSeaLevel){
  parameterizedHeight = sqrt(kmAboveSeaLevel * ONE_OVER_HEIGHT_OF_ATMOSPHERE);
  parameterizedViewZenithConst = -sqrt(kmAboveSeaLevel * (TWO_TIMES_THE_RADIUS_OF_THE_EARTH + kmAboveSeaLevel)) / (RADIUS_OF_EARTH + kmAboveSeaLevel);
  //parameterized viewZenith conversions.
  oneOverOneMinusParameterizedHeight = NUMERATOR_FOR_ONE_PLUS_OR_MINUS_PARAMETERIZED_HEIGHTS / (1.0 - parameterizedHeight);
  oneOverOnePlusParamaeterizedHeight = NUMERATOR_FOR_ONE_PLUS_OR_MINUS_PARAMETERIZED_HEIGHTS / (1.0 + parameterizedHeight);
}

double parameterizeViewZenith(double cosViewZenith){
  if(cosViewZenith > parameterizedViewZenithConst){
    return pow((cosViewZenith - parameterizedHeight) * oneOverOneMinusParameterizedHeight, 0.2);
  }
  return pow((cosViewZenith - parameterizedHeight) * oneOverOnePlusParamaeterizedHeight, 0.2);
}

double parameterizeSunZenith(double cosSunZenith){
  return atan2(max(cosSunZenith, -0.1975) * TAN_OF_ONE_POINT_THREE_EIGHT_SIX) * ZERO_POINT_FIVE_OVER_ONE_POINT_ONE + 0.37;
}

double updateHeightFromParameter(double parameterKMAboveSeaLevel){
  kmAboveSeaLevel = parameterKMAboveSeaLevel * HEIGHT_OF_RAYLEIGH_ATMOSPHERE;
  parameterizedViewZenithConst = - sqrt(kmAboveSeaLevel * (TWO_TIMES_THE_RADIUS_OF_THE_EARTH + kmAboveSeaLevel)) / (RADIUS_OF_EARTH + kmAboveSeaLevel);
  oneMinusParameterizedViewAngle = 1.0 - parameterizedViewZenithConst;
  onePlusParameterizedViewAngle = 1.0 + parameterizedViewZenithConst;

  return kmAboveSeaLevel;
}

double cosViewAngleFromParameter(double parameterizedViewZenith){
  if(parameterizedViewZenith > 0.5){
    return parameterizedViewZenithConst + pow((parameterizedViewZenith - 0.5), 5) * oneMinusParameterizedViewAngle;
  }
  return parameterizedViewZenithConst - pow(parameterizedViewZenith, 5) * onePlusParameterizedViewAngle;
}

double cosSunZenithFromParameter(double parameterizedSunZenith){
  return tan(1.5 * parameterizedSunZenith - 0.555) * PARAMETER_TO_COS_ZENITH_OF_SUN_CONST;
}
