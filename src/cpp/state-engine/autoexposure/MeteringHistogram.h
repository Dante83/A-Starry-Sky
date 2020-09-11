#pragma once

class MeteringHistogram{
public:
  float* skyHemisphericalLightColor;
  float updateHistogramAndSkyHemisphericalLightColor(float* colorIntensitiesPtr, int widthOfTexture);
};
