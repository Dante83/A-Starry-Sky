#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "OtherPlanet.h"
#include "Mars.h"
#include <cmath>

//
//Constructor
//
Mars::Mars(AstsroTime* astroTime, Sun* sunRef, Earth* earthRef) : OtherPlanet(astroTimeRef, sunRef){
  //
  //Default constructor
  //
};

void Mars::updateEclipticalLongitude(){

}

void Mars::updateEclipticalLatitude(){

}

void Mars::updateRadiusVector(){

}

//From page 286 of Meeus
void Mars::updateMagnitudeOfPlanet(){
  double phaseAngle = getPhaseAngleInDegrees();
  magnitudeOfPlanetFromEarth = -1.52 + 5.0 * log(distanceFromSun * distanceFromEarth) + 0.016 * phaseAngle;
}
