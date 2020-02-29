#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "Planet.h"
#include "OtherPlanet.h"
#include <cmath>

//
//Constructor
//
OtherPlanet::OtherPlanet(AstroTime* astroTimeRef, Sun* sunRef, Earth* earth) : Planet(astroTimeRef, sunRef){
  //
  //Default constructor
  //
};

void OtherPlanet::updatePosition(){
  //Update each of our heliocentric coordinates
  updateEclipticalLongitude();
  updateEclipticalLatitude();
  updateRadiusVector();

  //Convert our heliocentric coordinates into latitude and longitude
  heliocentric_x = radiusVector * cos(eclipticalLatitude) * cos(eclipticalLongitude);
  heliocentric_y = radiusVector * cos(eclipticalLatitude) * sin(eclipticalLongitude);
  heliocentric_z = radiusVector * sin(eclipticalLatitude);

  //Values relative to earth
  double x = heliocentric_x - earth->heliocentric_x;
  double y = heliocentric_y - earth->heliocentric_y;
  double z = heliocentric_z - earth->heliocentric_z;

  double heliocentricLongitude = atan(y / x);
  double heliocentricLatitude = atan(z / sqrt(x * x + y * y));

  //Convert the latitude and longitude of the planet to right-ascension and decliation
  //Inherited from Astronomical Body
  convertGeocentricLatitudeAndLongitudeToRaAndDec(heliocentricLatitude, heliocentricLongitude);

  //Use our distance from to the sun and distance from the earth to determine the brightness of the planet
  //as seen from earth
  distanceFromSun = sqrt(heliocentric_x * heliocentric_x + heliocentric_y * heliocentric_y + heliocentric_z * heliocentric_z);
  distanceFromEarth = sqrt(x * x + y * y + z * z);
}

double OtherPlanet::getPhaseAngleInDegrees(){
  double phaseAngleNumerator = distanceFromSun * distanceFromSun + distanceFromEarth * distanceFromEarth - (earth->distanceFromSun * earth->distanceFromSun);
  double phaseAngle = acos(phaseAngleNumerator / (2.0 * distanceFromSun * distanceFromEarth));
  return phaseAngle * RAD_2_DEG;
}
