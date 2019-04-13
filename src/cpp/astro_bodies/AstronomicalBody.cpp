#include "AstronomicalBody.h"
#include "Constants.h"

/**
* Constructor
*/
AstromicalBody::AstronomicalBody(){
  //
  //DEFAULT CONSTRUCTOR: This really doesn't do anything, it's only meant to be inherited from.
  //
}

//
//Internal methods that we would like to share between sky bodies. Some might be extrapolated up to a higher level later
//to reduce the size of our objects.
//
inline void AstronomicalBody::convertLambdaAndBetaToRaAndDec(double lambda, double beta, double cosBeta){
  double epsilon = skyManager.getTrueObliquityOfEclipticInRads();

  //Use these to acquire the equatorial solarGPUCoordinates
  double sinLambda = sin(lambda);
  double sinEpsilon = sin(epsilon);
  double cosEpsilon = cos(epsilon);
  double sinBeta = sin(beta);
  double tempRightAscension = check4GreaterThan2Pi(atan2(sinLambda * cosEpsilon - (sinBeta / cosBeta) * sinEpsilon, cos(lambda))) * DEG_2_RAD;
  double tempDeclination = checkBetweenMinusPiOver2AndPiOver2(asin(sinBeta * cosEpsilon + cosBeta * sinEpsilon * sinLambda)) * DEG_2_RAD;
  if(rightAscension1){
    rightAscension0 = rightAscension1;
    declination0 = declination1;
  }
  rightAscension1 = tempRightAscension;
  declination1 = tempDeclination;
}

inline void AstronomicalBody::convert2NormalizedGPUCoords(){
  double altitudeMinusThreePiOver2 = altitude - THREE_PI_OVER_TWO;
  double cosAltitudeMinusThreePiOver2 = cos(altitudeMinusThreePiOver2);
  double sinAzimuth = sin(azimuth);

  gpuCoords[0] = sinAzimuth * cosAltitudeMinusThreePiOver2; //Define me as true north, switch to minus one to define me as south.
  gpuCoords[1] = sinAzimuth * sin(altitudeMinusThreePiOver2);
  gpuCoords[2] = cosAltitudeMinusThreePiOver2;
}

inline void AstronomicalBody::updateAzimuthAndAltitudeFromRAAndDec(double ra, double dec){
  double localApparentSiderealTime;

  //Calculated from page 92 of Meeus
  double hourAngleInRads = check4GreaterThan2Pi((astroTime.getLocalApparentSiderealTime() * DEG_2_RAD) - ra);
  double declinationInRads = dec * DEG_2_RAD;

  double cosHA = cos(hourAngleInRads);
  double sinLat = location.getSinOfLatitude();
  double cosLat = location.getCosOfLatitude();
  double sinDec = sin(declinationInRads);
  double cosDec = cos(declinationInRads);
  tempAzimuth = check4GreaterThan2Pi(atan2(sin(hourAngleInRads), ((cosHA * sinLat) - ((sinDec / cosDec) * cosLat))) + PI);
  tempAltitude = checkBetweenMinusPiOver2AndPiOver2(asin(sinLat * sinDec + cosLat * cosDec *cosHA));

  if(azimuth1){
    azimuth0 = azimuth1;
    altitude0 = altitude1;
  }
  azimuth1 = tempAzimuth;
  altitude1 = tempAltitude;
}

inline double AstronomicalBody::check4GreaterThan2Pi(double inNum){
  double outRads = fmod(inNum, PI_TIMES_TWO);
  if(outRads < 0.0){
    return (PI_TIMES_TWO + outRads);
  }
  else if(outRads == PI_TIMES_TWO){
    return 0.0;
  }
  return outRads;
}

inline double AstronomicalBody::check4GreaterThan360(double inNum){
  double outDegrees = fmod(inNum, 360.0);
  if(outDegrees < 0.0){
    return (360 + outDegrees);
  }
  else if(outDegrees == 360.0){
    return 0.0;
  }
  return outDegrees;
}

inline double AstronomicalBody::checkBetweenMinusPiOver2AndPiOver2(double inNum){
  double outRads = check4GreaterThan2Pi(inNum + PI_OVER_TWO);
  return (outRads - PI_OVER_TWO);
}

//
//Getters and Setters
//
double& getAzimuth0(){
  return azimuth0;
}

double& getAzimuth1(){
  return azimuth1;
}

double& getAltitude0(){
  return altitude0;
}

double& getAltitude1(){
  return altitude1;
}

void interpolateAzimuthAndAltitude(double fraction){
  //
  //TODO: Figure this one out based on SLERP
  //
}

double& getInterpolatedAzimuth(){
  return azimuth;
}

double& getInterpolatedAltitude(){
  return altitude;
}
