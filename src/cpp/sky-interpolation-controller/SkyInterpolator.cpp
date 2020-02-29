#include "Constants.h"
#include "SkyInterpolator.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyInterpolator::SkyInterpolator(){

}

SkyInterpolator* SkyInterpolator;

extern "C" {
  int main();
}

double EMSCRIPTEN_KEEPALIVE getSaturnIntensity(){
  return skyState->skyManager->saturn.intensity;
}

int main(){
  return 0;
}
