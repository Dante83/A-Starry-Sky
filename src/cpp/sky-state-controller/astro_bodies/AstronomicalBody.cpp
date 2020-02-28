#include "AstronomicalBody.h"
#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include <cmath>

//
//Constructor
//
AstronomicalBody::AstronomicalBody(AstroTime* astroTimeRef){
  astroTime = astroTimeRef;
}

//
//Internal methods that we would like to share between sky bodies. Some might be extrapolated up to a higher level later
//to reduce the size of our objects.
//
void AstronomicalBody::convertLambdaAndBetaToRaAndDec(double lambda, double beta, double cosBeta){
  double epsilon = *trueObliquityOfEclipticInRads;

  //Use these to acquire the equatorial solarGPUCoordinates
  double sinLambda = sin(lambda);
  double sinEpsilon = sin(epsilon);
  double cosEpsilon = cos(epsilon);
  double sinBeta = sin(beta);
  rightAscension = check4GreaterThan2Pi(atan2(sinLambda * cosEpsilon - (sinBeta / cosBeta) * sinEpsilon, cos(lambda)));
  declination = checkBetweenMinusPiOver2AndPiOver2(asin(sinBeta * cosEpsilon + cosBeta * sinEpsilon * sinLambda));
}

void AstronomicalBody::updateParalacticAngle(){
  double hourAngle = (astroTime->greenwhichSiderealTime * DEG_2_RAD) - location->lonInRads - rightAscension;
  double paralacticAngleDenominator = tan(location->latInRads) * cos(declination) - sin(declination) * cos(hourAngle);
  paralacticAngle = paralacticAngleDenominator != 0.0 ? sin(hourAngle) / paralacticAngleDenominator : PI_OVER_TWO;
}

double AstronomicalBody::check4GreaterThan2Pi(double inNum){
  double outRads = fmod(inNum, PI_TIMES_TWO);
  if(outRads < 0.0){
    return (PI_TIMES_TWO + outRads);
  }
  else if(outRads == PI_TIMES_TWO){
    return 0.0;
  }
  return outRads;
}

double AstronomicalBody::check4GreaterThan360(double inNum){
  double outDegrees = fmod(inNum, 360.0);
  if(outDegrees < 0.0){
    return (360 + outDegrees);
  }
  else if(outDegrees == 360.0){
    return 0.0;
  }
  return outDegrees;
}

double AstronomicalBody::checkBetweenMinusPiOver2AndPiOver2(double inNum){
  double outRads = check4GreaterThan2Pi(inNum + PI_OVER_TWO);
  return (outRads - PI_OVER_TWO);
}
