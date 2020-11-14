#include "LightingAnalyzer.h"
#include <stdbool.h>
#include <cmath>

float LightingAnalyzer::updateMeteringAndLightingData(float* skyColorIntensitiesPtr, float* hemisphericalSkyLightPtr){
  //Drive the colors in the greyscale intensities from the linear intensities
  const int numberOfPixels = widthOfTexture * widthOfTexture;
  const float logBase2Factor = 1.0 / log(5.0);
  float logAverageOfLuminance = 0.0;

  for(int i = 0; i < numberOfPixels; ++i){
    int iTimes4 = i * 4;

    //Calculate the luminance
    float r = skyColorIntensitiesPtr[iTimes4];
    float g = skyColorIntensitiesPtr[iTimes4 + 1];
    float b = skyColorIntensitiesPtr[iTimes4 + 2];
    float greyscaleIntensity = skyColorIntensitiesPtr[iTimes4 + 3];

    //Take the log average of our intensities after converting from CD/m2 to EVs
    //https://www.astro-landscapes.com/what-are-evs-the-technical-explanation-and-calibration-of-the-integrating-sphere/
    //https://knarkowicz.wordpress.com/2016/01/09/automatic-exposure/
    logAverageOfLuminance += log((greyscaleIntensity + 1e-9) / 0.125) * logBase2Factor * pixelWeights[i];
  }

  //But really we're just using hacky functions that I figured out over like months.
  //I don't think I have the above code understood at all - it's just a reference for the future.
  return 0.2 * pow(fmax(logAverageOfLuminance * oneOverSumOfWeightWeights, 0.0), 2.4);
}
