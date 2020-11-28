#pragma once
#include "Planet.h"
#include "planets/Earth.h"
#include "../world_state/AstroTime.h"

class OtherPlanet : public Planet{
public:
  OtherPlanet(AstroTime* astroTimeRef);
  Earth* earth;
  double averageAlbedo;
  double distanceFromEarth;
  double getPhaseAngleInDegrees();
  void updatePosition(double trueObliquityOfEclipticInRads);
  virtual void updateMagnitudeOfPlanet() = 0;
};
