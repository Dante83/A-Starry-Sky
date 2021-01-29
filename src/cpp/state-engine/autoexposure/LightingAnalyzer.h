#pragma once

class LightingAnalyzer{
public:
  int widthOfMeteringTexture;
  int widthOfTransmittanceTexture;
  float oneOverSumOfWeightWeights;
  float yComponentOfDirectLighting;
  float directLightingColor[3];
  float oneOverSumOfDirectionalWeights[6];
  float* transmittanceLUT;
  float* skyHemisphericalLightColor;
  float* xyzCoordinatesOfPixel;
  float* pixelWeights;
  float* groundColor;
  float* fogColor;
  void setTransmittance(int x, int y, float weight, float* transmittance);
  void updateHemisphericalLightingData(float* skyColorIntensitiesPtr, float* hemisphericalAndDirectSkyLightPtr, float hmdViewX, float hmdViewY);
  float updateMeteringData(float* skyColorIntensitiesPtr);
};
