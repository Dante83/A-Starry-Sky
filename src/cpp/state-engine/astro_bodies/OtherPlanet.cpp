#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "planets/Earth.h"
#include "OtherPlanet.h"
#include <cmath>

//
//Constructor
//
OtherPlanet::OtherPlanet(AstroTime* astroTimeRef) : Planet(astroTimeRef){
  //
  //Default constructor
  //
};

void OtherPlanet::updatePosition(double trueObliquityOfEclipticInRads){
  //Update each of our heliocentric coordinates
  updateEclipticalLongitude();
  updateEclipticalLatitude();
  updateRadiusVector();

  //Convert our heliocentric coordinates into latitude and longitude
  double cos_eclipiticalLatitude = cos(eclipticalLatitude);
  double sin_eclipticalLongitude = sin(eclipticalLongitude);
  heliocentric_x = radiusVector * cos_eclipiticalLatitude * cos(eclipticalLongitude);
  heliocentric_y = radiusVector * cos_eclipiticalLatitude * sin_eclipticalLongitude;
  heliocentric_z = radiusVector * sin(eclipticalLatitude);

  //Values relative to earth
  double x = heliocentric_x - earth->heliocentric_x;
  double y = heliocentric_y - earth->heliocentric_y;
  double z = heliocentric_z - earth->heliocentric_z;

  double geocentricLongitude = atan2(y, x);
  geocentricLongitude = geocentricLongitude < 0.0 ? geocentricLongitude + PI_TIMES_TWO : geocentricLongitude;
  double geoCentricLatitude = atan2(z, sqrt(x * x + y * y));

  //Convert the latitude and longitude of the planet to right-ascension and decliation
  //Inherited from Astronomical Body
  convertEclipticalLongitudeAndLatitudeToRaAndDec(geocentricLongitude, geoCentricLatitude, trueObliquityOfEclipticInRads);

  //Use our distance from to the sun and distance from the earth to determine the brightness of the planet
  //as seen from earth
  distanceFromSun = sqrt(heliocentric_x * heliocentric_x + heliocentric_y * heliocentric_y + heliocentric_z * heliocentric_z) * AVERAGE_SOLAR_DISTANCE;
  distanceFromEarth = sqrt(x * x + y * y + z * z) * AVERAGE_SOLAR_DISTANCE;
}

double OtherPlanet::getPhaseAngleInDegrees(){
  double phaseAngleNumerator = distanceFromSun * distanceFromSun + distanceFromEarth * distanceFromEarth - (earth->distanceFromSun * earth->distanceFromSun);
  double phaseAngle = acos(phaseAngleNumerator / (2.0 * distanceFromSun * distanceFromEarth));
  return phaseAngle * RAD_2_DEG;
}
