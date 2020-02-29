#pragma once
#include "AstronomicalBody.h"
#include "Sun.h"
#include "Earth.h"
#include "../world_state/AstroTime.h"

class Saturn : public OtherPlanet{
public:
  Saturn(AstsroTime* astroTime, Sun* sunRef, Earth* earthRef);
  void updateEclipticalLongitude();
  void updateEclipticalLatitude();
  void updateRadiusVector();
  void updateMagnitudeOfPlanet();
};
