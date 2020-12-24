#pragma once
#include "color/ColorInterpolator.h"

class SkyInterpolator{
public:
  SkyInterpolator();
  ColorInterpolator* colorInterpolator;
  bool dominantLightIsSun;
  float sinOfLatitude;
  float cosOfLatitude;
  float tanOfLatitude;
  float astronomical_t_0;
  float oneOverAstronomicalDeltaT;
  float lightingTInitial;
  float oneOverLightingDeltaT;
  float initialLSRT;
  float deltaLSRT;
  float initialLogAverageOfSkyIntensity;
  float deltaLogAverageOfSkyIntensity;
  float dominantLightY0;
  float deltaDominantLightY;
  float dominantLightIntensity0;
  float deltaDominantLightIntensity;
  float initialSkyHemisphericalLightingColor[3];
  float estimatedFinalSkyHemisphericalLightingColor[3];
  float deltaPositions[14];
  float deltaLinearValues[11];
  float* astroPositions_0;
  float* linearValues_0;
  float* rotatedAstroPositions;
  float* linearValues;
  float* rotationallyDepedentAstroValues;
  float* interpolatedMeteringAndLightingValues;
  void updateAstronomicalLinearInterpolations(float fractOfFinalPosition);
  void updateLightingLinearInterpolations(float fractionOfFinalPosition);
  float rotateAstroObjects(float fractOfFinalPosition);
  void getHorizonFades();
  void getLunarParallacticAngle(float* interpolatedAstroPositions, float interpolatedLSRT);
  void updateSunAndMoonRADecAndScale(float fractOfFinalPosition);
  void rotateSunAndMoon(float fractOfFinalPosition);
};
