#pragma once

#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include "atmosphere/SkyLUTGenerator.h"

class SkyState{
public:
  SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt, SkyLUTGenerator* skyLUTGenerator);
  Location* location;
  AstroTime* astroTime;
  SkyManager* skyManager;
  SkyLUTGenerator* skyLUTGenerator;
};
