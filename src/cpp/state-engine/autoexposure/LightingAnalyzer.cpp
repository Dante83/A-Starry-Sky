#include "LightingAnalyzer.h"
#include <stdbool.h>
#include <cmath>
#include "../Constants.h"

void LightingAnalyzer::setTransmittance(int x, int y, float weight, float* transmittance){
  int startPosition = (x + y * widthOfTransmittanceTexture) * 3;
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
  float rGround = yComponentOfDirectLighting * directLightingColor[0] * groundColor[0];
  float gGround = yComponentOfDirectLighting * directLightingColor[1] * groundColor[1];
  float bGround = yComponentOfDirectLighting * directLightingColor[2] * groundColor[2];
  float linearRGB[3] = {pow(rGround, 2.2f), pow(gGround, 2.2f), pow(bGround, 2.2f)};

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

  float normalizationConstantForHMD = 1.0f / sqrt(hmdViewX * hmdViewX + hmdViewZ * hmdViewZ);
  float normalizedHMDViewX = hmdViewX * normalizationConstantForHMD;
  float normalizedHMDViewY = hmdViewZ * normalizationConstantForHMD;
  for(int i = 0; i < numberOfPixels; ++i){
    int iTimes4 = i * 4;

    //Calculate the luminance
    float rgbSky[3] = {
      skyColorIntensitiesPtr[iTimes4],
      skyColorIntensitiesPtr[iTimes4 + 1],
      skyColorIntensitiesPtr[iTimes4 + 2]
    };
    for(int j = 0; j < 3; ++j){
      //Because this is used throughout this
      float linearColorTimesPixelWeight = pow(rgbSky[j], 2.2f) * pixelWeights[i];

      //For fog, we presume that the y of the look direction is zero, and we just dot each of our
      //directional vectors with our hmd x and y values to decide the contribution.
      fogColor[j] = fmax(normalizedHMDViewX * directLightingColor[0] + normalizedHMDViewY * directLightingColor[2], 0.0f) * linearColorTimesPixelWeight;

      //As we are looking for lighting coming from a given direction in the sky
      //We actually wish to negate any of our directions so that the vectors are
      //pointing towards the center.
      int lDirectional = 1.0f;
      for(int k = 0; k < 6; ++k){
        int lightingDirection = k % 3;
        lDirectional = k == 3 ? lDirectional : -lDirectional;
        arrayOfHemisphericalLights[k][j] = fmax(lDirectional * directLightingColor[lightingDirection], 0.0f) * linearColorTimesPixelWeight;
      }
    }
  }

  for(int i = 0; i < 6; ++i){
    for(int j = 0; j < 3; ++j){
      arrayOfHemisphericalLights[i][j] = arrayOfHemisphericalLights[i][j] * oneOverSumOfWeightWeights;
    }
  }

  //Half the sky for our x,z values are our ground lighting, so we will average those two, now, too.
  for(int i = 0; i < 3; ++i){
    postiveXHemisphericalLightColor[i] = 0.5f * (postiveXHemisphericalLightColor[i] + linearRGB[i]);
    postiveZHemisphericalLightColor[i] = 0.5f * (postiveZHemisphericalLightColor[i] + linearRGB[i]);
    negativeXHemisphericalLightColor[i] = 0.5f * (negativeXHemisphericalLightColor[i] + linearRGB[i]);
    negativeZHemisphericalLightColor[i] = 0.5f * (negativeZHemisphericalLightColor[i] + linearRGB[i]);
  }

  //Now bring our values back into the normal range of intensities and save it to our final hemispherical
  //lighting array so that we can bring this back out to the first CPU.
  for(int i = 0; i < 6; ++i){
    for(int j = 0; j < 3; ++j){
      hemisphericalAndDirectSkyLightPtr[i * 3 + j] = static_cast<float>(pow(arrayOfHemisphericalLights[i][j], ONE_OVER_TWO_POINT_TWO));
    }
  }

  for(int j = 0; j < 3; ++j){
    fogColor[j] = static_cast<float>(pow(fogColor[j] * oneOverSumOfWeightWeights, ONE_OVER_TWO_POINT_TWO));
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
