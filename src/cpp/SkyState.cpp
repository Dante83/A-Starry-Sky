#include "Constants.h"
#include "SkyState.h"
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include "atmosphere/AtmosphericSkyEngine.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyState::SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt, SkyLUTGenerator* skyLUTGeneratorPtr){
  astroTime = astroTimePnt;
  location = locationPnt;
  skyManager = skyManagerPnt;
  skyLUTGenerator = skyLUTGeneratorPtr;
}

SkyState* skyState;

extern "C" {
  int main();
  void initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
  uint8_t* getTransmittanceStridedLUTPtr();
  uint8_t* getScatteringStridedLUT();
  double getSunRightAscension();
  double getSunDeclination();
  double getMoonRightAscension();
  double getMoonDeclination();
}

void EMSCRIPTEN_KEEPALIVE initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset, double stepsPerKilo, int numRotationalSteps, double mieDirectioanlG){
  SkyLUTGenerator *skyLUTGenerator = new SkyLUTGenerator(stepsPerKilo, numRotationalSteps, mieDirectioanlG);
  AstroTime *astroTime = new AstroTime(year, month, day, hour, minute, second, utcOffset);
  Location *location = new Location(latitude, longitude);
  SkyManager *skyManager = new SkyManager(astroTime, location);
  skyState = new SkyState(astroTime, location, skyManager);
}

//For our image LUT
uint8_t* EMSCRIPTEN_KEEPALIVE getTransmittanceStridedLUTPtr(){
  return skyState->transmittanceStridedLUTPtr;
}

uint8_t* EMSCRIPTEN_KEEPALIVE getScatteringStridedLUT(){
  return skyState->scatteringStridedLUTPrt;
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
