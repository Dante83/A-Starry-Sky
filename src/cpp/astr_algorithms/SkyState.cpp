#include "SkyState.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyState::SkyState(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  //construct the time
  time = AstroTime(year, month, day, hour, minute, second, utcOffset);

  //construct the location
  location = Location(latitude, longitude);

  //Update our astronomical state
  skyManager = SkyManger(&time, &location);
};

void SkyState::update(){

}

void SkyState::updateSunAndMoond(double secondsFromLastUpdate){

}

//
//JS Exposed Data
//
extern "C" {
 int main();
 void initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
 void swapSkyState(double secondsUntilNextEvent);
}

//Global state variable
SkyState skyState;

void EMSCRIPTEN_KEEPALIVE initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  skyState = SkyState(latitude, longitude, year, month, day, hour, minute, second, utcOffset);
  skyState.update();
}

void EMSCRIPTEN_KEEPALIVE swapSkyState(double secondsUntilNextEvent){
  skyState.update(secondsUntilNextEvent);
}

int main(){
  return 0;
}
