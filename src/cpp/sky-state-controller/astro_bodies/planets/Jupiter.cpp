#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "OtherPlanet.h"
#include "Jupiter.h"
#include <cmath>

//
//Constructor
//
Jupiter::Jupiter(AstsroTime* astroTime, Sun* sunRef, Earth* earthRef) : OtherPlanet(astroTimeRef, sunRef){
  //
  //Default constructor
  //
};

void Jupiter::updateEclipticalLongitude(){

}

void Jupiter::updateEclipticalLatitude(){

}

void Jupiter::updateRadiusVector(){

}

//From page 286 of Meeus
void Jupiter::updateMagnitudeOfPlanet(){
  double phaseAngle = getPhaseAngleInDegrees();
  magnitudeOfPlanetFromEarth = -9.40 + 5.0 * log(distanceFromSun * distanceFromEarth) + 0.005 * phaseAngle;
}
