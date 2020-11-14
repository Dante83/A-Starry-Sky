#pragma once

class LightingAnalyzer{
public:
  int widthOfTexture;
  float oneOverSumOfWeightWeights;
  float* skyHemisphericalLightColor;
  float* groundHemispehricalLightColor;
  float* xyzCoordinatesOfPixel;
  float* pixelWeights;
  float updateMeteringAndLightingData(float* skyColorIntensitiesPtr, float* hemisphericalSkyLightPtr);
};
