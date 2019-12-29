#include "Constants.h"
#include "SkyState.h"
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyState::SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt){
  astroTime = astroTimePnt;
  location = locationPnt;
  skyManager = skyManagerPnt;
}

SkyState* skyState;

extern "C" {
  int main();
  void initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
  double getSunRightAscension();
  double getSunDeclination();
  double getMoonRightAscension();
  double getMoonDeclination();
}

//What we use to get all of this rolling.
void EMSCRIPTEN_KEEPALIVE initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  AstroTime *astroTime = new AstroTime(year, month, day, hour, minute, second, utcOffset);
  Location *location = new Location(latitude, longitude);
  SkyManager *skyManager = new SkyManager(astroTime, location);
  skyState = new SkyState(astroTime, location, skyManager);
}

//For our sky state
double EMSCRIPTEN_KEEPALIVE getSunRightAscension(){
  return skyState->skyManager->sun.rightAscension1;
}

double EMSCRIPTEN_KEEPALIVE getSunDeclination(){
  return skyState->skyManager->sun.declination1;
}

double EMSCRIPTEN_KEEPALIVE getMoonRightAscension(){
  return skyState->skyManager->moon.rightAscension1;
}

double EMSCRIPTEN_KEEPALIVE getMoonDeclination(){
  return skyState->skyManager->moon.declination1;
}

int main(){
  return 0;
}
