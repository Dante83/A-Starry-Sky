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
  void setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);

  //Sun
  double getSunRightAscension();
  double getSunDeclination();

  //Moon
  double getMoonRightAscension();
  double getMoonDeclination();
  double getMoonIntensity();
  double getMoonParalacticAngle();

  //Planet Venus
  double getVenusRightAscension();
  double getVenusDeclination();
  double getVenusIntensity();

  //Planet Mars
  double getMarsRightAscension();
  double getMarsDeclination();
  double getMarsIntensity();

  //Planet Jupiter
  double getJupiterRightAscension();
  double getJupiterDeclination();
  double getJupiterIntensity();

  //Planet Saturn
  double getSaturnRightAscension();
  double getSaturnDeclination();
  double getSaturnIntensity();
}

//What we use to get all of this rolling.
void EMSCRIPTEN_KEEPALIVE setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  AstroTime *astroTime = new AstroTime(year, month, day, hour, minute, second, utcOffset);
  Location *location = new Location(latitude, longitude);
  SkyManager *skyManager = new SkyManager(astroTime, location);
  skyState = new SkyState(astroTime, location, skyManager);
}

//
//Sun
//
double EMSCRIPTEN_KEEPALIVE getSunRightAscension(){
  return skyState->skyManager->sun.rightAscension;
}

double EMSCRIPTEN_KEEPALIVE getSunDeclination(){
  return skyState->skyManager->sun.declination;
}

//
//Moon
//
double EMSCRIPTEN_KEEPALIVE getMoonRightAscension(){
  return skyState->skyManager->moon.rightAscension;
}

double EMSCRIPTEN_KEEPALIVE getMoonDeclination(){
  return skyState->skyManager->moon.declination;
}

double EMSCRIPTEN_KEEPALIVE getMoonIntensity(){
  return skyState->skyManager->moon.intensity;
}

double EMSCRIPTEN_KEEPALIVE getMoonParalacticAngle(){
  return skyState->skyManager->moon.intensity;
}

//
//Venus
//
double EMSCRIPTEN_KEEPALIVE getVenusRightAscension(){
  return skyState->skyManager->venus.rightAscension;
}

double EMSCRIPTEN_KEEPALIVE getVenusDeclination(){
  return skyState->skyManager->venus.declination;
}

double EMSCRIPTEN_KEEPALIVE getVenusIntensity(){
  return skyState->skyManager->venus.intensity;
}

//
//Mars
//
double EMSCRIPTEN_KEEPALIVE getMarsRightAscension(){
  return skyState->skyManager->mars.rightAscension;
}

double EMSCRIPTEN_KEEPALIVE getMarsDeclination(){
  return skyState->skyManager->mars.declination;
}

double EMSCRIPTEN_KEEPALIVE getMarsIntensity(){
  return skyState->skyManager->mars.intensity;
}

//
//Jupiter
//
double EMSCRIPTEN_KEEPALIVE getJupiterRightAscension(){
  return skyState->skyManager->jupiter.rightAscension;
}

double EMSCRIPTEN_KEEPALIVE getJupiterDeclination(){
  return skyState->skyManager->jupiter.declination;
}

double EMSCRIPTEN_KEEPALIVE getJupiterIntensity(){
  return skyState->skyManager->jupiter.intensity;
}

//
//Saturn
//
double EMSCRIPTEN_KEEPALIVE getSaturnRightAscension(){
  return skyState->skyManager->saturn.rightAscension;
}

double EMSCRIPTEN_KEEPALIVE getSaturnDeclination(){
  return skyState->skyManager->saturn.declination;
}

double EMSCRIPTEN_KEEPALIVE getSaturnIntensity(){
  return skyState->skyManager->saturn.intensity;
}

int main(){
  return 0;
}
