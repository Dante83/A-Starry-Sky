#include "AstronomicalBody.h"
#include "Constants.h"

/**
* Constructor
*/
AstromicalBody::AstronomicalBody(SkyManager& skyManagerRef){
  skyManager = skyManagerRef;
}

void AstronomicalBody::convertRAAndDecToAzAndAlt(){
  //TODO: Get these variables from our SkyState class which watch over our time and location variables
  double& latitudeOnEarth;
  double& localApparentSiderealTime;

  //Calculated from page 92 of Meeus
  double hourAngle = this.check4GreaterThan360(localApparentSiderealTime - rightAscension);
  double hourAngleInRads = hourAngle * DEG2RAD;
  double latitudeInRads =  latitudeOnEarth * DEG2RAD;
  double declinationInRads = declination * DEG2RAD;

  double cosHA = cos(hourAngleInRads);
  double sinLat = sin(latitudeInRads);
  double cosLat = cos(latitudeInRads);
  double sinDec = sin(declinationInRads);
  double cosDec = cos(declinationInRads);
  azimuth = this.check4GreaterThan2Pi(atan2(sin(hourAngleInRads), ((cosHA * sinLat) - ((sinDec / cosDec) * cosLat))) + PI);
  altitude = this.checkBetweenMinusPiOver2AndPiOver2(asin(sinLat * sinDec + cosLat * cosDec *cosHA));
}

void AstronomicalBody::convertLambdaAndBetaToRaAndDec(){
  //Get epsilon from our sky state which is just DEG2RAD * trueObliquityOfEcliptic
  double eps;

  double radLambda = lambda * DEG2RAD;
  double radBeta = beta * DEG2RAD;

  //Use these to acquire the equatorial solarGPUCoordinates
  double sinLambda = sin(radLambda);
  double sinEpsilon = sin(epsilon);
  double cosEpsilon = cos(epsilon);
  double sinBeta = sin(radBeta);
  double cosBeta = cos(radBeta);
  rightAscension = this.check4GreaterThan2Pi(atan2(sinLambda * cosEpsilon - (sinBeta / cosBeta) * sinEpsilon, cos(radLambda))) * RAD2DEG;
  declination = this.checkBetweenMinusPiOver2AndPiOver2(asin(sinBeta * cosEpsilon + cosBeta * sinEpsilon * sinLambda)) * RAD2DEG;
}

void AstronomicalBody::convert2NormalizedGPUCoords(){
  double altitudeMinusThreePiOver2 = altitude - THREE_PI_OVER_TWO;
  double cosAltitudeMinusThreePiOver2 = cos(altitudeMinusThreePiOver2);
  double sinAzimuth = sin(azimuth);

  gpuCoords[0] = sinAzimuth * cosAltitudeMinusThreePiOver2; //Define me as true north, switch to minus one to define me as south.
  gpuCoords[1] = sinAzimuth * sin(altitudeMinusThreePiOver2);
  gpuCoords[2] = cosAltitudeMinusThreePiOver2;
}

double inline AstronomicalBody::check4GreaterThan2Pi(double& inRads){
  double outRads = fmod(inRads, PI_TIMES_TWO);
  if(outRads < 0.0){
    return (PI_TIMES_TWO + outRads);
  }
  else if(outRads == PI_TIMES_TWO){
    return 0.0;
  }
  return outRads;
}

double inline AstronomicalBody::check4GreaterThan360(double& inDegrees){
  double outDegrees = fmod(inDegrees, 360.0);
  if(outDegrees < 0.0){
    return (360 + outDegrees);
  }
  else if(outDegrees == 360.0){
    return 0.0;
  }
  return outDegrees;
}

double inline AstronomicalBody::checkBetweenMinusPiOver2AndPiOver2(double& inRads){
  double outRads = check4GreaterThan2Pi(inRads + PI_OVER_TWO);
  return (outRads - PI_OVER_TWO);
}
