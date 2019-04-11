#include "SkyManager.cpp"

SkyManager::SkyManager(AstroTime& astrT, Location& loc){
  astroTime = astrT;
  location = loc;

  //For a standard sky we have one sun, one moon and four planets
  //which are visible to the naked eye (we ignore Mercury and anything past Saturn).
  sun = new Sun();
  moon = new Moon();

  //Planets
  Planet[0];
  Planet[1];
  Planet[2];
  Planet[3];

  //Once this is finished, update everything.
  updateSunRaAndDec();
  updateMoonRaAndDec();
  updatePlanetsRaAndDec(int planetNumber);
  swapAllAzimuthsAndAltitudes();
  interpolateAzimuthAndAltitudes();
  swapSunAzimuth();
  swapSunAltititude();
  swapMoonAzimuth();
  swapMoonAlititude();
  swapPlanetAzimuth(int planetNumber);
  swapPlanetAlititude(int planetNumber);
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
