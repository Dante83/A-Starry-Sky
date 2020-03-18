#pragma once
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"

class SkyState{
public:
  SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt, double* memoryPtr);
  Location* location;
  AstroTime* astroTime;
  SkyManager* skyManager;
  double* memoryPtr;
  void updateHeap32Memory();
};
