#pragma once
#include "../AstronomicalBody.h"
#include "../OtherPlanet.h"
#include "../Sun.h"
#include "Earth.h"
#include "../../world_state/AstroTime.h"

class Venus : public OtherPlanet{
public:
  Venus(AstroTime* astroTimeRef);
  virtual void updateEclipticalLongitude();
  virtual void updateEclipticalLatitude();
  virtual void updateRadiusVector();
  virtual void updateMagnitudeOfPlanet();
};
