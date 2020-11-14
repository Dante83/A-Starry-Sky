#pragma once
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include "autoexposure/LightingAnalyzer.h"

class SkyState{
public:
  SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt, LightingAnalyzer* lightingAnalyzerPtr, float* memoryPtr);
  Location* location;
  AstroTime* astroTime;
  SkyManager* skyManager;
  LightingAnalyzer* lightingAnalyzer;
  float* memoryPtr;
  void updateHeap32Memory();
};
