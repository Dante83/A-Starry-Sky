#pragma once

class SkyInterpolator{
public:
  SkyInterpolator();
  float sinOfLatitude;
  float cosOfLatitude;
  float t_0;
  float oneOverDeltaT;
  float initialLSRT;
  float finalLSRT;
  float deltaPositions[9];
  float deltaLinearValues[9];
  float* astroPositions_0;
  float* linearValues_0;
  float* rotatedAstroPositions;
  float* linearValues;
  float interpolateLSRT(float fractOfFinalPosition);
  void updateLinearInterpolations(float fractOfFinalPosition);
  void rotateAstroObjects(float lsrt, float fractOfFinalPosition);
};
