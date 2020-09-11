#include "MeteringHistogram.h"
#include <stdbool.h>
#include <cmath>

float MeteringHistogram::updateHistogramAndSkyHemisphericalLightColor(float* colorIntensitiesPtr, int widthOfTexture){
  //Drive the colors in the greyscale intensities from the linear intensities
  int numberOfPixels = widthOfTexture * widthOfTexture;
  float logOfLuminance = 0.0;
  float avgRed = 0.0;
  float avgGreen = 0.0;
  float avgBlue = 0.0;
  float xCoordinatOfLight;
  float yCoordinateOfLight;
  float zCoordinateOfLight;
  float totalWeights = 0.0;
  for(int i = 0; i < numberOfPixels; ++i){
    //Calculate the luminance
    float r = colorIntensitiesPtr[i * 4];
    float g = colorIntensitiesPtr[i * 4 + 1];
    float b = colorIntensitiesPtr[i * 4 + 2];
    float a = colorIntensitiesPtr[i * 4 + 3];
    float luminanceValueOfPixel = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    logOfLuminance += log(0.000001 + luminanceValueOfPixel);

    //The y-coordinate is stored in our alpha channel for each pixel and is used to weight
    //the averaging for our ambient lighting.
    avgRed = a * r;
    avgGreen = a * g;
    avgBlue = a * b;
    totalWeights += a;
  }
  logOfLuminance = exp(logOfLuminance / static_cast<float>(numberOfPixels));

  float oneOverWeights = logOfLuminance / totalWeights;
  skyHemisphericalLightColor[0] = avgRed * oneOverWeights;
  skyHemisphericalLightColor[1] = avgGreen * oneOverWeights;
  skyHemisphericalLightColor[2] = avgBlue * oneOverWeights;

  return 0.18 * oneOverWeights;
}
