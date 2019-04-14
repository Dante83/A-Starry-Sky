#pragma once

#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"

class SkyState{
public:
  SkyState(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
  Location location;
  AstroTime astroTime;
  SkyManager skyManager;
};
