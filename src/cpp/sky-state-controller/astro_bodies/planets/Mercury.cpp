#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "OtherPlanet.h"
#include "Mercury.h"
#include <cmath>

//
//Constructor
//
Mercury::Mercury(AstsroTime* astroTime, Sun* sunRef, Earth* earthRef) : OtherPlanet(astroTimeRef, sunRef){
  //
  //Default constructor
  //
};

void Mercury::updateEclipticalLongitude(){

}

void Mercury::updateEclipticalLatitude(){

}

void Mercury::updateRadiusVector(){

}

//From page 286 of Meeus
void Mercury::updateMagnitudeOfPlanet(){
  double phaseAngle = getPhaseAngleInDegrees();
  magnitudeOfPlanetFromEarth =;
}
