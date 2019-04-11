#include "Sun.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
Sun::Sun(SkyManager& skyManagerRef){
  skyManager = skyManagerRef;
  astroTime = skyManager.getAstroTime();
  updateAstronomicalState();
};

//
//Methods
//
void Sun::updateAstronomicalState(){
  double julianCentury = astroTime.getJulianCentury();
  meanAnomoly = check4GreaterThan360(357.5291092 + T * (35999.0502909 - T * (0.0001536 + T / 24490000.0)));
  meanLongitude = check4GreaterThan360(280.46646 + T * (36000.76983 + 0.0003032 * T));
  double meanAnomolyInRads = meanAnomoly * DEG_2_RAD;
  double eccentricityOfEarth = 0.016708634 - T * (0.000042037 - 0.0000001267 * T);
  double equationOfCenter = (1.914602 - T * (0.004817 - 0.000014 * T)) * sin(meanAnomolyInRads) + (0.019993 - 0.000101 * T) * sin(2.0 * meanAnomolyInRads) + 0.000289 * sin(3.0 * meanAnomolyInRads);
  longitude = (meanLongitude + equationOfCenter) * DEG_2_RAD;
  double meanObliquityOfTheEclipitic = skyManager.getMeanObliquityOfTheEclipitic() * DEG_2_RAD;
  double sinOfLongitude = sin(longitude);
  double rightAscension = check4GreaterThan2Pi(atan2(cos(meanObliquityOfTheEclipitic) * sinOfLongitude, cos(longitude)));
  double declination = checkBetweenMinusPiOver2AndPiOver2(asin(sin(meanObliquityOfTheEclipitic) * sinOfLongitude));

  //While we're here, let's calculate the distance from the earth to the sun, useful for figuring out the illumination of the moon
  distance2Earth = (1.000001018 * (1.0 - (eccentricityOfEarth * eccentricityOfEarth))) / (1.0 + eccentricityOfEarth * Math.cos(equationOfCenter * DEG_2_RAD)) * 149597871;

  //Because we use these elsewhere...
  rightAscension = rightAscension * RAD_2_DEG;
  declination = declination * RAD_2_DEG;
}
