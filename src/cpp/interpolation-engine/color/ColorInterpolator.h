#pragma once
#include "../Constants.h"

class ColorInterpolator{
public:
  ColorInterpolator();
  float* interpolatedMeteringAndLightingValues;
  float hsl0[NUMBER_OF_INTERPOLATED_COLOR_CHANNELS];
  float deltaHSL[NUMBER_OF_INTERPOLATED_COLOR_CHANNELS];
  float threeVector[3];
  void updateLightingLinearInterpolations(float tFractional);
  void updateFinalColorValues(float* rgb0, float* rgbf);
  void convertRGBToHSL(float r, float g, float b);
  void convertHSLToRGB(float h, float s, float l);
  float hueToRGB(float p, float q, float t);
};
