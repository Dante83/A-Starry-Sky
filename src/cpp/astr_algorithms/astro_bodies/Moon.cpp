#include <emscripten/emscripten.h>

//
//Constructor
//
Moon::Moon(SkyManager& skyManagerRef){
  skyManager = skyManagerRef;
  astroTime = skyManager.getAstroTime();
  updateAstronomicalState();
};

//
//Methods
//
void Sun::updatePosition(){

}

void Sun::updatePosition(double secondsTillNextUpdate){

}

//
//Getters and Setters
//
void setMeanLongitude(double inValue){
  meanLongitude = check4GreaterThan360(inValue);
}

void setMeanElongation(double inValue){
  moonMeanElongation = check4GreaterThan360(inValue);
}

void setMeanAnomaly(double inValue){
  meanAnomaly = check4GreaterThan360(inValue);
}

void setArgumentOfLatitude(double inValue){
  argumentOfLatitude = check4GreaterThan360(inValue);
}

void setLongitudeOfTheAscendingNodeOfOrbit(double inValue){
  longitudeOfTheAscendingNodeOfOrbit = check4GreaterThan360(inValue);
}


double& getMoonsMeanLongitude(){
  return meanLongitude;
}

double& getMoonsMeanElongation(){
  return meanElongation;
}

double& getMoonsMeanAnomaly(){
  return meanAnomaly;
}

double& getMoonsArgumentOfLatitude(){
  return argumentOfLatitude;
}

double& getLongitudeOfTheAscendingNodeOfOrbit(){
  return longitudeOfTheAscendingNodeOfOrbit;
}
