#include "SkyManager.cpp"

SkyManager::SkyManager(WorldState& worldStateRef){
  worldState = worldState;

  //For a standard sky we have one sun, one moon and four planets
  //which are visible to the naked eye (we ignore Mercury and anything past Saturn).
  sun = new Sun();
  moon = new Moon();

  //Planets are in order from the sun, Venus, Mars, Jupiter, Saturn
  for(char plnt_idx = 0; plnt_idx < 4; plnt_idx++){
    planets[plnt_idx] = new Planet();
  }

  //Once finished run our update command.
  this.update();
}

SkyManager::update(){
  sun.update();
  moon.update();
  for(char plnt_idx = 0; plnt_idx < 4; plnt_idx++){
    planets[plnt_idx].update();
  }
}

Moon* getMoon(){
  return &moon;
}

Sun* getSun(){
  return &sun;
}

Planet* getPlanetByNumber(planetNumber){
  return &planets[planetNumber];
}
