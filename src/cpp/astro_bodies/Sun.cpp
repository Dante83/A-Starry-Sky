#include "Sun.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
Sun::Sun(SkyManager& skyManagerRef){
  skyManager = skyManagerRef;
  astroTime = skyManager.getAstroTime();
  location = skyManager.getLocation();
  updatePosition();
};

//
//Methods
//
void Sun::updatePosition(){
  //Get the position of the sun relative to the earth
  double meanObliquityOfTheEclipitic = this.meanObliquityOfTheEclipitic * this.deg2Rad;
  double ra = check4GreaterThan2Pi(atan2(cos(skyManager.getMeanObliquityOfTheEclipitic()) * sin(trueLongitude), cos(trueLongitude)));
  double dec = checkBetweenMinusPiOver2AndPiOver2(asin(sin(skyManager.getMeanObliquityOfTheEclipitic()) * sin(trueLongitude)));

  //While we're here, let's calculate the distance from the earth to the sun, useful for figuring out the illumination of the moon
  double eccentricityOfEarth = skyManager.getEccentricityOfTheEarth();
  distance2Earth = (1.000001018 * (1.0 - (eccentricityOfEarth * eccentricityOfEarth))) / (1.0 + eccentricityOfEarth * Math.cos(sunsEquationOfCenter * DEG_2_RAD)) * 149597871.0;

  //Convert this position to the location coordinates in the sky
  updateAzimuthAndAltitudeFromRAAndDec(ra, dec);
}

//
//Getters and Setters
//
void Sun::setLongitude(double inValue){
  longitude = check4GreaterThan360(inValue);
}

void Sun::setMeanAnomaly(double inValue){
  meanAnomoly = check4GreaterThan360(inValue);
}

void Sun::setTrueLongitude(double inValue){
  trueLongitude = check4GreaterThan360(inValue);
}

double& Sun::getLongitude(){
  return longitude;
}

double& Sun::getMeanLongitude(){
  return meanLongitude;
}

double& Sun::getMeanAnomaly(){
  return meanAnomoly;
}
