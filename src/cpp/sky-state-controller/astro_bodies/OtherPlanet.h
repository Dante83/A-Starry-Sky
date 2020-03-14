#pragma once
#include "Planet.h"
#include "planets/Mercury.cpp"
#include "planets/Venus.cpp"
#include "planets/Mars.cpp"
#include "planets/Jupiter.cpp"
#include "planets/Saturn.cpp"
#include "../world_state/AstroTime.h"

class OtherPlanet : public Planet{
public:
  OtherPlanet(AstroTime* astroTimeRef);
  AstroTime* astroTimeRef;
  Earth* earth;
  double averageAlbedo;
  double distanceFromEarth;
  double irradianceFromEarth;
  void updatePosition();
  double getPhaseAngleInDegrees();
  virtual void updateMagnitudeOfPlanet();
};
