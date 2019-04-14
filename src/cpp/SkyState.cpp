#include "Constants.h"
#include "SkyState.h"
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyState::SkyState(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  //construct the time
  astroTime = new AstroTime(year, month, day, hour, minute, second, utcOffset);

  //construct the location
  location = new Location(latitude, longitude);

  //Update our astronomical state
  skyManager = new SkyManager(&astroTime, &location);
}

SkyState* skyStateRef;

extern "C" {
  int main();
  void initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
  double getSunRightAscension();
  double getSunDeclination();
  double getMoonRightAscension();
  double getMoonDeclination();
}

void EMSCRIPTEN_KEEPALIVE initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  skyStateRef = new SkyState(latitude, longitude, year, month, day, hour, minute, second, utcOffset);
}

//
//Testing these for now. In the future, we will want to return only interpolated values
//interpolations or even the raw image textures.
//
double EMSCRIPTEN_KEEPALIVE getSunRightAscension(){
  return skyStateRef->skyManager.sun.rightAscension1;
}

double EMSCRIPTEN_KEEPALIVE getSunDeclination(){
  return skyStateRef->skyManager.sun.declination1;
}

double EMSCRIPTEN_KEEPALIVE getMoonRightAscension(){
  return skyStateRef->skyManager.moon.rightAscension1;
}

double EMSCRIPTEN_KEEPALIVE getMoonDeclination(){
  return skyStateRef->skyManager.moon.declination1;
}

int main(){
  return 0;
}
