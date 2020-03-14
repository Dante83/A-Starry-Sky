#include "Constants.h"
#include "SkyState.h"
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyState::SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt, double* memoryPtr){
  astroTime = astroTimePnt;
  location = locationPnt;
  skyManager = skyManagerPnt;
  memoryPtr = memoryPtr;
}

SkyState* skyState;

extern "C" {
  int main();
  void setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset, double* memoryPtr);
  void updateSky(int year, int month, int day, int hour, int minute, double second, double utcOffset);
}

void inline updateHeap32Memory(){
  //Update the rotational values in our Heap 32
  memoryPtr[0] = skyState->skyManager->sun.rightAscension;
  memoryPtr[1] = skyState->skyManager->sun.declination;
  memoryPtr[15] = skyState->skyManager->sun.irradianceFromEarth;
  memoryPtr[16] = skyState->skyManager->sun.scale;

  memoryPtr[2] = skyState->skyManager->moon.rightAscension;
  memoryPtr[3] = skyState->skyManager->moon.declination;
  memoryPtr[17] = skyState->skyManager->moon.irradianceFromEarth;
  memoryPtr[18] = skyState->skyManager->moon.scale;
  memoryPtr[19] = skyState->skyManager->moon.parallacticAngle;
  memoryPtr[20] = skyState->skyManager->moon.earthShineIntensity;

  memoryPtr[4] = skyState->skyManager->mercury.rightAscension;
  memoryPtr[5] = skyState->skyManager->mercury.declination;
  memoryPtr[21] = skyState->skyManager->mercury.irradianceFromEarth;

  memoryPtr[6] = skyState->skyManager->venus.rightAscension;
  memoryPtr[7] = skyState->skyManager->venus.declination;
  memoryPtr[22] = skyState->skyManager->venus.irradianceFromEarth;

  memoryPtr[8] = skyState->skyManager->mars.rightAscension;
  memoryPtr[9] = skyState->skyManager->mars.declination;
  memoryPtr[23] = skyState->skyManager->mars.irradianceFromEarth;

  memoryPtr[10] = skyState->skyManager->jupiter.rightAscension;
  memoryPtr[11] = skyState->skyManager->jupiter.declination;
  memoryPtr[24] = skyState->skyManager->jupiter.irradianceFromEarth;

  memoryPtr[12] = skyState->skyManager->saturn.rightAscension;
  memoryPtr[13] = skyState->skyManager->saturn.declination;
  memoryPtr[25] = skyState->skyManager->saturn.irradianceFromEarth;

  memoryPtr[14] = skyState->astroTime.localApparentSiderealTime;
}

//What we use to get all of this rolling.
void EMSCRIPTEN_KEEPALIVE setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset, double* memoryPtr){
  //Set up our sky to the current time
  AstroTime *astroTime = new AstroTime(year, month, day, hour, minute, second, utcOffset);
  Location *location = new Location(latitude, longitude);
  SkyManager *skyManager = new SkyManager(astroTime, location);
  skyState = new SkyState(astroTime, location, skyManager, memoryPtr);
  updateHeap32Memory();
}

void EMSCRIPTEN_KEEPALIVE updateSky(int year, int month, int day, int hour, int minute, double second, double utcOffset){
  skyState->astroTime.setAstroTimeFromYMDHMSTZ(year, month, day, hour, minute, second, utcOffset);
  skyState->skyManager.update();
  updateHeap32Memory();
}

int main(){
  return 0;
}
