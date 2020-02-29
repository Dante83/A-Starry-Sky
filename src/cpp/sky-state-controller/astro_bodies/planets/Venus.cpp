#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "OtherPlanet.h"
#include "Venus.h"
#include <cmath>

//
//Constructor
//
Venus::Venus(AstsroTime* astroTime, Sun* sunRef, Earth* earthRef) : OtherPlanet(astroTimeRef, sunRef){
  //
  //Default constructor
  //
};

void Venus::updateEclipticalLongitude(){

}

void Venus::updateEclipticalLatitude(){

}

void Venus::updateRadiusVector(){

}

//From page 286 of Meeus
void Venus::updateMagnitudeOfPlanet(){
  double phaseAngle = getPhaseAngleInDegrees();
  double phaseAngleComponent = 0.0009 * phaseAngle + 0.000239 * phaseAngle * phaseAngle - 0.00000065 * phaseAngle * phaseAngle * phaseAngle;
  magnitudeOfPlanetFromEarth = -4.40 * 5.0 * log(distanceFromEarth * distanceFromSun) + phaseAngleComponent;
}
