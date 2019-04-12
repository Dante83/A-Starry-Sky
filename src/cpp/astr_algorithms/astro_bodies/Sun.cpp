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
void Sun::updatePosition(){

}

void Sun::updatePosition(double secondsTillNextUpdate){

}

//
//Getters and Setters
//
void setLongitude(double inValue){
  longitude = check4GreaterThan360(inValue);
}

void setMeanAnomaly(double inValue){
  meanAnomoly = check4GreaterThan360(inValue);
}

double& getLongitude(){
  return longitude;
}

double& getMeanAnomaly(){
  return meanAnomoly;
}
