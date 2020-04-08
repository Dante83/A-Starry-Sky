#include "Constants.h"
#include "SkyState.h"
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyState::SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt, float *memoryPtrIn){
  astroTime = astroTimePnt;
  location = locationPnt;
  skyManager = skyManagerPnt;
  memoryPtr = memoryPtrIn;
}

SkyState* skyState;

extern "C" {
  int main();
  void setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset, float* memoryPtr);
  void updateSky(int year, int month, int day, int hour, int minute, double second, double utcOffset);
}

void SkyState::updateHeap32Memory(){
  skyState->memoryPtr[0] = skyState->skyManager->sun.rightAscension;
  skyState->memoryPtr[1] = static_cast<float>(skyState->skyManager->sun.declination);
  skyState->memoryPtr[15] = static_cast<float>(skyState->skyManager->sun.irradianceFromEarth);
  skyState->memoryPtr[16] = static_cast<float>(skyState->skyManager->sun.scale);

  skyState->memoryPtr[2] = static_cast<float>(skyState->skyManager->moon.rightAscension);
  skyState->memoryPtr[3] = static_cast<float>(skyState->skyManager->moon.declination);
  skyState->memoryPtr[17] = static_cast<float>(skyState->skyManager->moon.irradianceFromEarth);
  skyState->memoryPtr[18] = static_cast<float>(skyState->skyManager->moon.scale);
  skyState->memoryPtr[19] = static_cast<float>(skyState->skyManager->moon.parallacticAngle);
  skyState->memoryPtr[20] = static_cast<float>(skyState->skyManager->moon.earthShineIntensity);

  skyState->memoryPtr[4] = static_cast<float>(skyState->skyManager->mercury.rightAscension);
  skyState->memoryPtr[5] = static_cast<float>(skyState->skyManager->mercury.declination);
  skyState->memoryPtr[21] = static_cast<float>(skyState->skyManager->mercury.irradianceFromEarth);

  skyState->memoryPtr[6] = static_cast<float>(skyState->skyManager->venus.rightAscension);
  skyState->memoryPtr[7] = static_cast<float>(skyState->skyManager->venus.declination);
  skyState->memoryPtr[22] = static_cast<float>(skyState->skyManager->venus.irradianceFromEarth);

  skyState->memoryPtr[8] = static_cast<float>(skyState->skyManager->mars.rightAscension);
  skyState->memoryPtr[9] = static_cast<float>(skyState->skyManager->mars.declination);
  skyState->memoryPtr[23] = static_cast<float>(skyState->skyManager->mars.irradianceFromEarth);

  skyState->memoryPtr[10] = static_cast<float>(skyState->skyManager->jupiter.rightAscension);
  skyState->memoryPtr[11] = static_cast<float>(skyState->skyManager->jupiter.declination);
  skyState->memoryPtr[24] = static_cast<float>(skyState->skyManager->jupiter.irradianceFromEarth);

  skyState->memoryPtr[12] = static_cast<float>(skyState->skyManager->saturn.rightAscension);
  skyState->memoryPtr[13] = static_cast<float>(skyState->skyManager->saturn.declination);
  skyState->memoryPtr[25] = static_cast<float>(skyState->skyManager->saturn.irradianceFromEarth);

  skyState->memoryPtr[14] = static_cast<float>(skyState->astroTime->localApparentSiderealTime) * DEG_2_RAD;
}

//What we use to get all of this rolling.
void EMSCRIPTEN_KEEPALIVE setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset, float* memoryPtr){
  //Set up our sky to the current time
  AstroTime *astroTime = new AstroTime(year, month, day, hour, minute, second, utcOffset);
  Location *location = new Location(latitude, longitude);
  SkyManager *skyManager = new SkyManager(astroTime, location);
  skyState = new SkyState(astroTime, location, skyManager, memoryPtr);
  skyState->updateHeap32Memory();
}

void EMSCRIPTEN_KEEPALIVE updateSky(int year, int month, int day, int hour, int minute, double second, double utcOffset){
  skyState->astroTime->setAstroTimeFromYMDHMSTZ(year, month, day, hour, minute, second, utcOffset);
  skyState->skyManager->update();
  skyState->updateHeap32Memory();
}

int main(){
  return 0;
}
