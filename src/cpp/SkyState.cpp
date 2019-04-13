#include "SkyState.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyState::SkyState(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  //construct the time
  astroTime = AstroTime(year, month, day, hour, minute, second, utcOffset);

  //construct the location
  location = Location(latitude, longitude);

  //Update our astronomical state
  skyManager = SkyManager(&time, &location);
};

void SkyState::updateSunAndMoon(){
  skyManager.update(false);
}

void SkyState::updateEverything(){
  skyManager.update(true);
}

//
//Getters and Setters
//
AstroTime& getAstroTime(){
  return astroTime;
}

SkyManager& getSkyManager(){
  return skyManager;
}

//
//JS Exposed Data
//
extern "C" {
 int main();
 void initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
 void swapSunAndMoonState(int year, int month, int day, int hour, int minute, double second, double utcOffset);
 void swapSkyState(int year, int month, int day, int hour, int minute, double second, double utcOffset);
}

void EMSCRIPTEN_KEEPALIVE initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  static SkyState skyState = SkyState(latitude, longitude, year, month, day, hour, minute, second, utcOffset);
}

void EMSCRIPTEN_KEEPALIVE swapSunAndMoonState(int year, int month, int day, int hour, int minute, double second, double utcOffset){
  skyState.getAstroTime().setAstroTimeFromYMDHMSTZ(year, month, day, hour, minute, second, utcOffset);
  skyState.updateSunAndMoon();
}

void EMSCRIPTEN_KEEPALIVE swapSkyState(int year, int month, int day, int hour, int minute, double second, double utcOffset){
  skyState.getAstroTime().setAstroTimeFromYMDHMSTZ(year, month, day, hour, minute, second, utcOffset);
  skyState.updateEverything();
}

//
//Testing these for now. In the future, we will want to return only interpolated values
//interpolations or even the raw image textures.
//
double EMSCRIPTEN_KEEPALIVE getSunAzimuth(){
  return skyState.getSkyManager().getSun().getAzimuth1();
}

double EMSCRIPTEN_KEEPALIVE getSunAltitude(){
  return skyState.getSkyManager().getSun().getAltitude1();
}

double EMSCRIPTEN_KEEPALIVE getMoonAzimuth(){
  return skyState.getSkyManager().getMooon().getAzimuth1();
}

double EMSCRIPTEN_KEEPALIVE getMoonAltitude(){
  return skyState.getSkyManager().getMoon().getAltitude1();
}

int main(){
  return 0;
}
