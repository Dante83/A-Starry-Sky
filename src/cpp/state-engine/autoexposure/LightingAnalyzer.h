#pragma once

class LightingAnalyzer{
public:
  int widthOfMeteringTexture;
  int widthOfTransmittanceTexture;
  float oneOverSumOfWeightWeights;
  float yComponentOfDirectLighting;
  float* transmittanceLUT;
  float* directLightingColor;
  float* skyHemisphericalLightColor;
  float* xyzCoordinatesOfPixel;
  float* pixelWeights;
  float* groundColor;
  float* fogColor;
  void setTransmittance(int x, int y, float weight, float* transmittance);
  void updateHemisphericalLightingData(float* skyColorIntensitiesPtr, float* hemisphericalAndDirectSkyLightPtr, float hmdViewX, float hmdViewY);
  float updateMeteringData(float* skyColorIntensitiesPtr);
};
