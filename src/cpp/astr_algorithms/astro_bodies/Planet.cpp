#include <emscripten/emscripten.h>

//
//Constructor
//
Moon::Moon(SkyManager& skyManagerRef){
  skyManager = skyManagerRef;
  astroTime = skyManager.getAstroTime();
  updateAstronomicalState();
};
