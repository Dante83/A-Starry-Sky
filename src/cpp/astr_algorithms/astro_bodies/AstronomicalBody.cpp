#include "AstronomicalBody.h"
#include "Math.h"

/**
* Constructor
*/
AstromicalBody::AstronomicalBody(SkyManager& skyManagerRef){
  skyManager = skyManagerRef;
  azAndAlt = {0.0, 0.0};
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

double AstronomicalBody::check4GreaterThan2Pi(double& inNum){

}

double AstronomicalBody::check4GreaterThan360(double& inNum){

}

double AstronomicalBody::checkBetweenMinusPiOver2AndPiOver2(double& inNum){

}
