#include "LightingAnalyzer.h"
#include <stdbool.h>
#include <cmath>
#include "../Constants.h"
#include <stdio.h>

void LightingAnalyzer::setTransmittance(int x, int y, float weight, float* transmittance){
  int clampedX = fmin(fmax(x, 0), widthOfTransmittanceTexture);
  int clampedY = fmin(fmax(y, 0), widthOfTransmittanceTexture);
  int startPosition = (clampedX + clampedY * widthOfTransmittanceTexture) * 3;
  transmittance[0] += transmittanceLUT[startPosition] * weight;
  transmittance[1] += transmittanceLUT[startPosition + 1] * weight;
  transmittance[2] += transmittanceLUT[startPosition + 2] * weight;
}

void LightingAnalyzer::updateHemisphericalLightingData(float* skyColorIntensitiesPtr, float* hemisphericalAndDirectSkyLightPtr, float hmdViewX, float hmdViewZ){
  const int numberOfPixels = widthOfMeteringTexture * widthOfMeteringTexture;

  //In the oposite direction, get the lighting value for the ground.
  //I presume that N is <0,1,0> for all points on the ground, so that
  //we can have a constant N•L for all points. This will allow us to
  //just average the lighting of the ground color with the sky color
  //when we are finished for the horizon values (x,z) as half the horizon
  //will always be this color. The ground color negativeY will always be
  //this color, while positiveY has no values at all.
  float rGround = yComponentOfDirectLighting * directLightingColor[0] * pow(groundColor[0], 2.2f);
  float gGround = yComponentOfDirectLighting * directLightingColor[1] * pow(groundColor[1], 2.2f);
  float bGround = yComponentOfDirectLighting * directLightingColor[2] * pow(groundColor[2], 2.2f);
  float linearGroundColors[3] = {rGround, gGround, bGround};

  //The final lighting colors that we pass back to the user
  float postiveXHemisphericalLightColor[3] = {0.0, 0.0, 0.0};
  float postiveYHemisphericalLightColor[3] = {0.0, 0.0, 0.0};
  float postiveZHemisphericalLightColor[3] = {0.0, 0.0, 0.0};

  float negativeXHemisphericalLightColor[3] = {0.0, 0.0, 0.0};
  float negativeYHemisphericalLightColor[3] = {rGround, bGround, gGround};
  float negativeZHemisphericalLightColor[3] = {0.0, 0.0, 0.0};

  float* arrayOfHemisphericalLights[6] = {
    postiveXHemisphericalLightColor, postiveYHemisphericalLightColor, postiveZHemisphericalLightColor,
    negativeXHemisphericalLightColor, negativeYHemisphericalLightColor, negativeZHemisphericalLightColor
  };

  float normalizationConstantForHMD = sqrt(fmax(hmdViewX * hmdViewX + hmdViewZ * hmdViewZ, 0.0f));
  normalizationConstantForHMD = normalizationConstantForHMD > 0.0f ? normalizationConstantForHMD : 1.0f;
  if((hmdViewX * hmdViewX + hmdViewZ * hmdViewZ) <= 0.0f){
    hmdViewZ = 1.0;
  }
  float fogTotalWeight = 0.0f;
  for(int i = 0; i < 3; ++i){
    fogColor[i] = 0.0f;
  }
  for(int i = 0; i < numberOfPixels; ++i){
    int iTimes4 = i * 4;
    int iTimes3 = i * 3;
    float skyDirectionX = xyzCoordinatesOfPixel[iTimes3];
    float skyDirectionY = xyzCoordinatesOfPixel[iTimes3 + 1];
    float skyDirectionZ = xyzCoordinatesOfPixel[iTimes3 + 2];
    float hemisphericalLightingMagnitude[6] = {
      skyDirectionX, skyDirectionY, skyDirectionZ,
      -skyDirectionX, -skyDirectionY, -skyDirectionZ
    };
    //Calculate the luminance
    float rgbSky[3] = {
      pow(skyColorIntensitiesPtr[iTimes4], 2.2f),
      pow(skyColorIntensitiesPtr[iTimes4 + 1], 2.2f),
      pow(skyColorIntensitiesPtr[iTimes4 + 2], 2.2f)
    };

    //Because this is used throughout the next section
    float pixelWeight = pixelWeights[i];
    float fogWeight = fmax(hmdViewX * skyDirectionX + hmdViewZ * skyDirectionZ, 0.0f);
    fogWeight = exp(10.0f * fogWeight);
    fogTotalWeight += fogWeight;
    for(int j = 0; j < 3; ++j){
      float linearColor = rgbSky[j];

      //For fog, we presume that the y of the look direction is zero, and we just dot each of our
      //directional vectors with our hmd x and y values to decide the contribution.
      fogColor[j] += fogWeight * linearColor;

      for(int k = 0; k < 6; ++k){
        arrayOfHemisphericalLights[k][j] += fmax(hemisphericalLightingMagnitude[k], 0.0f) * linearColor;
      }
    }
  }

  //Normalize our results
  fogTotalWeight = fogTotalWeight > 0.0f ? fogTotalWeight : 1.0f;
  printf("Total weight: %f\r\n", fogTotalWeight);
  for(int i = 0; i < 3; ++i){
    printf("Fog Color: %f\r\n", fogColor[i]);
    fogColor[i] = pow(fogColor[i] / fogTotalWeight, ONE_OVER_TWO_POINT_TWO);
    float linearGroundColor = linearGroundColors[i];
    for(int j = 0; j < 6; ++j){
      arrayOfHemisphericalLights[j][i] *= oneOverSumOfDirectionalWeights[j];
    }
  }

  //Half the sky for our x,z values are our ground lighting, so we will average those two, now, too.
  for(int i = 0; i < 3; ++i){
    float linearGroundColor = linearGroundColors[i];
    postiveXHemisphericalLightColor[i] = 0.5f * (postiveXHemisphericalLightColor[i] + linearGroundColor);
    postiveZHemisphericalLightColor[i] = 0.5f * (postiveZHemisphericalLightColor[i] + linearGroundColor);
    negativeXHemisphericalLightColor[i] = 0.5f * (negativeXHemisphericalLightColor[i] + linearGroundColor);
    negativeZHemisphericalLightColor[i] = 0.5f * (negativeZHemisphericalLightColor[i] + linearGroundColor);
  }

  //Now bring our values back into the normal range of intensities and save it to our final hemispherical
  //lighting array so that we can bring this back out to the first CPU.
  float maxIntensity = 1.0E-9f;
  for(int i = 0; i < 6; ++i){
    int iTimes3 = i * 3;
    for(int j = 0; j < 3; ++j){
      float skyColorChannel = pow(arrayOfHemisphericalLights[i][j], ONE_OVER_TWO_POINT_TWO);
      hemisphericalAndDirectSkyLightPtr[iTimes3 + j] = skyColorChannel;
      maxIntensity = fmax(maxIntensity, skyColorChannel);
    }
  }
  float oneOverMaxIntensity = 1.0 / maxIntensity;
  for(int i = 0; i < 6; ++i){
    int iTimes3 = i * 3;
    for(int j = 0; j < 3; ++j){
      hemisphericalAndDirectSkyLightPtr[iTimes3 + j] *= oneOverMaxIntensity;
    }
  }
}

float LightingAnalyzer::updateMeteringData(float* skyColorIntensitiesPtr){
  //Drive the colors in the greyscale intensities from the linear intensities
  const int numberOfPixels = widthOfMeteringTexture * widthOfMeteringTexture;
  const float logBase2Factor = 1.0f / log(5.0f);
  float logAverageOfLuminance = 0.0f;

  for(int i = 0; i < numberOfPixels; ++i){
    //Take the log average of our intensities after converting from CD/m2 to EVs
    //https://www.astro-landscapes.com/what-are-evs-the-technical-explanation-and-calibration-of-the-integrating-sphere/
    //https://knarkowicz.wordpress.com/2016/01/09/automatic-exposure/
    logAverageOfLuminance += log((skyColorIntensitiesPtr[i * 4 + 3] + 1e-9f) / 0.125f) * logBase2Factor * pixelWeights[i];
  }

  //But really we're just using hacky functions that I figured out over like months.
  //I don't think I have the above code understood at all - it's just a reference for the future.
  return 0.2f * pow(fmax(logAverageOfLuminance * oneOverSumOfWeightWeights, 0.0), 2.4f);
}
