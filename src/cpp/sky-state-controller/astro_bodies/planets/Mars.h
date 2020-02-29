#pragma once
#include "AstronomicalBody.h"
#include "Sun.h"
#include "Earth.h"
#include "../world_state/AstroTime.h"

class Mars : public OtherPlanet{
public:
  Mars(SkyManager* skyManager, Sun* sunRef, Earth* earthRef);
  void updateEclipticalLongitude();
  void updateEclipticalLatitude();
  void updateRadiusVector();
  void updateMagnitudeOfPlanet();
};
