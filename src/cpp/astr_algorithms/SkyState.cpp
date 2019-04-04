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
};

double SkyState::getJulianDay(){
  return time.getJulianDay();
}

extern "C" {
 double initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
 int swapSkyState(double secondsUntilNextEvent);
}

double EMSCRIPTEN_KEEPALIVE initializeStarrySky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset){
  static SkyState skyState = SkyState(latitude, longitude, year, month, day, hour, minute, second, utcOffset);

  //For testing, get the julian day.
  return skyState.getJulianDay();
}

int EMSCRIPTEN_KEEPALIVE swapSkyState(double secondsUntilNextEvent){
  return 782;
}

int main() {
  //Required because main.
  return 0;
}
