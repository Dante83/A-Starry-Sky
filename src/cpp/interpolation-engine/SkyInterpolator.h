#pragma once

class SkyInterpolator{
public:
  SkyInterpolator();
  float sinOfLatitude;
  float cosOfLatitude;
  float tanOfLatitude;
  float t_0;
  float oneOverDeltaT;
  float initialLSRT;
  float deltaLSRT;
  float deltaPositions[9];
  float deltaLinearValues[9];
  float* astroPositions_0;
  float* linearValues_0;
  float* rotatedAstroPositions;
  float* linearValues;
  float* rotationallyDepedentAstroValues;
  void updateLinearInterpolations(float fractOfFinalPosition);
  float rotateAstroObjects(float fractOfFinalPosition);
  void getHorizonFades();
  void getLunarParallacticAngle(float* interpolatedAstroPositions, float interpolatedLSRT);
};
