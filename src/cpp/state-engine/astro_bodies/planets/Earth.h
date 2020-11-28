#pragma once
#include "../AstronomicalBody.h"
#include "../Planet.h"
#include "../Sun.h"
#include "../../world_state/AstroTime.h"

class Earth : public Planet{
public:
  Earth(AstroTime* astroTimeRef);
  void updatePosition(double trueObliquityOfEclipticInRads);
  void updateEclipticalLongitude();
  void updateEclipticalLatitude();
  void updateRadiusVector();
};
