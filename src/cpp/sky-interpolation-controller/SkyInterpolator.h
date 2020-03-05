#pragma once

class SkyInterpolator{
public:
  SkyInterpolator();
  double sinOfLatitude;
  double cosOfLatitude;
  double t_0;
  double oneOverDeltaT;
  double initialLSRT;
  double finalLSRT;
  double* astroPositions_0;
  double* linearValues_0;
  double* rotatedAstroPositions;
  double* deltaPositions[9];
  double* deltaLinearValues[9];
  double* linearValues;
};
