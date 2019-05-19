#include "Sun.h"
#include "../world_state/AstroTime.h"
#include "AstronomicalBody.h"
#include "../Constants.h"
#include <cmath>

//
//Constructor
//
Sun::Sun(AstroTime* astroTimeRef) : AstronomicalBody(astroTimeRef){
  //
  //Do nothing, just call the parent method and populate our values.
  //
}

//
//Methods
//
void Sun::updatePosition(){
  //Get the position of the sun relative to the earth
  setLongitude((meanLongitude + equationOfCenter) * DEG_2_RAD);
  double meanObliquityOfTheEclipiticInRads = (*meanObliquityOfTheEclipitic) * DEG_2_RAD;

  double tempRightAscension = check4GreaterThan2Pi(atan2(cos(meanObliquityOfTheEclipiticInRads) * sin(trueLongitude), cos(trueLongitude)));
  double tempDeclination = checkBetweenMinusPiOver2AndPiOver2(asin(sin(meanObliquityOfTheEclipiticInRads) * sin(trueLongitude)));
  double newMeasurementTime = astroTime->julianDay;
  if(rightAscension1){
    rightAscension0 = rightAscension1;
    declination0 = declination1;
    timeBetweenMeasurements = (newMeasurementTime - previousMeasurementTime) * SECONDS_IN_A_DAY;
  }
  rightAscension1 = tempRightAscension;
  declination1 = tempDeclination;
  previousMeasurementTime = newMeasurementTime;

  //While we're here, let's calculate the distance from the earth to the sun, useful for figuring out the illumination of the moon
  double eccentricityOfTheEarthVal = *eccentricityOfTheEarth;
  distance2Earth = (1.000001018 * (1.0 - (eccentricityOfTheEarthVal * eccentricityOfTheEarthVal))) / (1.0 + eccentricityOfTheEarthVal * cos(equationOfCenter * DEG_2_RAD)) * 149597871.0;
}

void Sun::setLongitude(double inValue){
  longitude = check4GreaterThan360(inValue);
}

void Sun::setMeanAnomaly(double inValue){
  meanAnomaly = check4GreaterThan360(inValue);
}

void Sun::setTrueLongitude(double inValue){
  trueLongitude = check4GreaterThan2Pi(inValue);
}

void Sun::setMeanLongitude(double inValue){
  meanLongitude = check4GreaterThan360(inValue);
  meanLongitudeInRads = meanLongitude * DEG_2_RAD;
}
