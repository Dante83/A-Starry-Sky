#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "OtherPlanet.h"
#include "Saturn.h"
#include <cmath>

//
//Constructor
//
Saturn::Saturn(AstsroTime* astroTime, Sun* sunRef, Earth* earthRef) : OtherPlanet(astroTimeRef, sunRef){
  //
  //Default constructor
  //
};

void Saturn::updateEclipticalLongitude(){

}

void Saturn::updateEclipticalLatitude(){

}

void Saturn::updateRadiusVector(){

}

//From page 286 of Meeus
void Saturn::updateMagnitudeOfPlanet(){
  double phaseAngle = getPhaseAngleInDegrees();
  //
  //TODO: Get delta U and B  from Meeus in Chapter 45
  //
  double sinB = sin(B);
  magnitudeOfPlanetFromEarth = -8.88 + 5.0 * log(distanceFromSun * distanceFromEarth) + 0.44 * abs(deltaU) - 2.60 * abs(sinB) + 1.25 * sinB * sinB;
}
