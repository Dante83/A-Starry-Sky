#include "planet.h"
//
//Constructor
//
Moon::Moon(SkyManager& skyManagerRef){
  skyManager = skyManagerRef;
  astroTime = skyManager.getAstroTime();
  updateAstronomicalState();
}
