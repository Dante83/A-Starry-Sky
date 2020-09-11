#pragma once
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include "autoexposure/MeteringHistogram.h"

class SkyState{
public:
  SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt, MeteringHistogram* meteringHistogramPtr, float* memoryPtr);
  Location* location;
  AstroTime* astroTime;
  SkyManager* skyManager;
  MeteringHistogram* meteringHistogram;
  float* memoryPtr;
  void updateHeap32Memory();
};
