#pragma once
#include "../AstronomicalBody.h"
#include "../OtherPlanet.h"
#include "../Sun.h"
#include "Earth.h"
#include "../../world_state/AstroTime.h"

class Mars : public OtherPlanet{
public:
  Mars(AstroTime* astroTimeRef);
  virtual void updateEclipticalLongitude();
  virtual void updateEclipticalLatitude();
  virtual void updateRadiusVector();
  virtual void updateMagnitudeOfPlanet();
};
