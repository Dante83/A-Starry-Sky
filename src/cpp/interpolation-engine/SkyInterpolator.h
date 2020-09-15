#pragma once

class SkyInterpolator{
public:
  SkyInterpolator();
  float sinOfLatitude;
  float cosOfLatitude;
  float tanOfLatitude;
  float astronomical_t_0;
  float oneOverAstronomicalDeltaT;
  float lighting_t_0;
  float oneOverLightingDeltaT;
  float initialLSRT;
  float deltaLSRT;
  float initialLogAverageOfSkyIntensity;
  float deltaLogAverageOfSkyIntensity;
  float initialSkyHemisphericalLightingColor[3];
  float estimatedFinalSkyHemisphericalLightingColor[3];
  float deltaPositions[9];
  float deltaLinearValues[9];
  float* astroPositions_0;
  float* linearValues_0;
  float* rotatedAstroPositions;
  float* linearValues;
  float* rotationallyDepedentAstroValues;
  void updateAstronomicalLinearInterpolations(float fractOfFinalPosition);
  void updateLightingLinearInterpolations(float fractionOfFinalPosition);
  float rotateAstroObjects(float fractOfFinalPosition);
  void getHorizonFades();
  void getLunarParallacticAngle(float* interpolatedAstroPositions, float interpolatedLSRT);
  void updateSunAndMoonRADecAndScale(float fractOfFinalPosition);
  void rotateSunAndMoon(float fractOfFinalPosition);
};
