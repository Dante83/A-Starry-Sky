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
  virtual void updatePosition();
  virtual void updateMagnitudeOfPlanet();
protected:
  virtual void updateEclipticalLongitude() = 0;
  virtual void updateEclipticalLatitude() = 0;
  virtual void updateRadiusVector() = 0;
};
