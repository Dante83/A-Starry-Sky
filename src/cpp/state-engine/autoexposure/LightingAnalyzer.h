#pragma once

class LightingAnalyzer{
public:
  int widthOfMeteringTexture;
  int widthOfTransmittanceTexture;
  int heightOfTransmittanceTexture;
  float oneOverSumOfWeightWeights;
  float yComponentOfDirectLighting;
  float* transmittanceLUT;
  float* directLightingColor;
  float* skyHemisphericalLightColor;
  float* xyzCoordinatesOfPixel;
  float* pixelWeights;
  float* groundColor;
  void xyToIndexStartForRedColor(int x, int y, float weight, int* transmittance);
  void updateHemisphericalLightingData(float* skyColorIntensitiesPtr, float* hemisphericalAndDirectSkyLightPtr, float hmdViewX, float hmdViewY);
  float updateMeteringData(float* skyColorIntensitiesPtr);
};
