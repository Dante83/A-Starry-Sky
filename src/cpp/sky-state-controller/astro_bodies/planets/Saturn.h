#pragma once
#include "../AstronomicalBody.h"
#include "../OtherPlanet.h"
#include "../Sun.h"
#include "Earth.h"
#include "../../world_state/AstroTime.h"

class Saturn : public OtherPlanet{
public:
  Saturn(AstroTime* astroTimeRef);
  virtual void updateEclipticalLongitude();
  virtual void updateEclipticalLatitude();
  virtual void updateRadiusVector();
  virtual void updateMagnitudeOfPlanet();
};
