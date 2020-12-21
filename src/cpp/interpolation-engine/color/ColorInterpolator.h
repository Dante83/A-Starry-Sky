#pragma once

class ColorInterpolator{
public:
  ColorInterpolator();
  float* hsl0[NUMBER_OF_INTERPOLATED_COLORS];
  float* deltaHSL[NUMBER_OF_INTERPOLATED_COLORS];
  float* interpolatedLightingInterpolations;
  void updateLightingLinearInterpolations(float tFractional);
  void updateFinalColorValues(float* rgb0, float* rgbf);
  float hueToRGB(float p, float q, float t);
  float* convertRGBToHSL(float r, float g, float b);
  float* convertHSLToRGB(float h, float s, float l);
};
