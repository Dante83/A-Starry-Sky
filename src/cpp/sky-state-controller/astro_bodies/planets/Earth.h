#pragma once
#include "../AstronomicalBody.h"
#include "../Planet.h"
#include "../Sun.h"
#include "../../world_state/AstroTime.h"

class Earth : public Planet{
public:
  Earth(AstroTime* astroTimeRef);
  virtual void updatePosition();
  virtual void updateEclipticalLongitude();
  virtual void updateEclipticalLatitude();
  virtual void updateRadiusVector();
};
