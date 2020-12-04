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
//EclipticalLongitude is eclipticalLongitude
//Beta is eclipticalLatitude
//
void AstronomicalBody::convertEclipticalLongitudeAndLatitudeToRaAndDec(double eclipticalLongitude, double eclipticalLatitude, double trueObliquityOfEclipticInRads){
  //Use these to acquire the equatorial solarGPUCoordinates
  double sinEpsilon = sin(trueObliquityOfEclipticInRads);
  double cosEpsilon = cos(trueObliquityOfEclipticInRads);
  double sin_eclipticalLongitude = sin(eclipticalLongitude);
  double sin_eclipticalLatitude = sin(eclipticalLatitude);
  double cos_eclipticalLatitude = cos(eclipticalLatitude);
  double tan_eclipticalLatitude = sin_eclipticalLatitude / cos_eclipticalLatitude;
  rightAscension = check4GreaterThan2Pi(atan2(sin(eclipticalLongitude) * cosEpsilon - tan_eclipticalLatitude * sinEpsilon, cos(eclipticalLongitude)));
  declination = checkBetweenMinusPiOver2AndPiOver2(asin(sin_eclipticalLatitude * cosEpsilon + cos_eclipticalLatitude * sinEpsilon * sin_eclipticalLongitude));
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
