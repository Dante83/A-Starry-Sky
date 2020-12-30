#include "Constants.h"
#include "SkyState.h"
#include "world_state/AstroTime.h"
#include "world_state/Location.h"
#include "astro_bodies/SkyManager.h"
#include "autoexposure/LightingAnalyzer.h"
#include <emscripten/emscripten.h>
#include <cmath>

//
//Constructor
//
SkyState::SkyState(AstroTime* astroTimePnt, Location* locationPnt, SkyManager* skyManagerPnt, LightingAnalyzer* lightingAnalyzerPtr, float *memoryPtrIn){
  astroTime = astroTimePnt;
  location = locationPnt;
  skyManager = skyManagerPnt;
  memoryPtr = memoryPtrIn;
  lightingAnalyzer = lightingAnalyzerPtr;
}

SkyState* skyState;

extern "C" {
  int main();
  void setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, float* memoryPtr);
  void updateSky(int year, int month, int day, int hour, int minute, double second);
  void initializeMeteringAndLightingDependencies(int widthOfMeteringTexture, int transmittanceTextureSize, float* xyzPtr, float* pixelWeightsPtr, float* groundColor, float* transmittanceLUT, float* fogColor);
  float updateMeteringData(float* skyColorIntensities);
  void updateHemisphericalLightingData(float* skyColorIntensitiesPtr, float* hemisphericalAndDirectSkyLightPtr, float hmdViewX, float hmdViewZ);
  float updateDirectLighting(float heightOfCamera, float sunYPosition, float sunRadius, float moonRadius, float moonYPosition, float sunIntensity, float moonIntensity, float meteringIntensity, float* directLightingPointer);
}

void SkyState::updateHeap32Memory(){
  skyState->memoryPtr[0] = static_cast<float>(skyState->skyManager->sun.rightAscension);
  skyState->memoryPtr[1] = static_cast<float>(skyState->skyManager->sun.declination);
  skyState->memoryPtr[15] = static_cast<float>(skyState->skyManager->sun.irradianceFromEarth);
  skyState->memoryPtr[16] = static_cast<float>(skyState->skyManager->sun.scale);

  skyState->memoryPtr[2] = static_cast<float>(skyState->skyManager->moon.rightAscension);
  skyState->memoryPtr[3] = static_cast<float>(skyState->skyManager->moon.declination);
  skyState->memoryPtr[17] = static_cast<float>(skyState->skyManager->moon.irradianceFromEarth);
  skyState->memoryPtr[18] = static_cast<float>(skyState->skyManager->moon.scale);
  skyState->memoryPtr[19] = static_cast<float>(skyState->skyManager->moon.parallacticAngle);
  skyState->memoryPtr[20] = static_cast<float>(skyState->skyManager->moon.earthShineIntensity);

  skyState->memoryPtr[4] = static_cast<float>(skyState->skyManager->mercury.rightAscension);
  skyState->memoryPtr[5] = static_cast<float>(skyState->skyManager->mercury.declination);
  skyState->memoryPtr[21] = static_cast<float>(skyState->skyManager->mercury.irradianceFromEarth);

  skyState->memoryPtr[6] = static_cast<float>(skyState->skyManager->venus.rightAscension);
  skyState->memoryPtr[7] = static_cast<float>(skyState->skyManager->venus.declination);
  skyState->memoryPtr[22] = static_cast<float>(skyState->skyManager->venus.irradianceFromEarth);

  skyState->memoryPtr[8] = static_cast<float>(skyState->skyManager->mars.rightAscension);
  skyState->memoryPtr[9] = static_cast<float>(skyState->skyManager->mars.declination);
  skyState->memoryPtr[23] = static_cast<float>(skyState->skyManager->mars.irradianceFromEarth);

  skyState->memoryPtr[10] = static_cast<float>(skyState->skyManager->jupiter.rightAscension);
  skyState->memoryPtr[11] = static_cast<float>(skyState->skyManager->jupiter.declination);
  skyState->memoryPtr[24] = static_cast<float>(skyState->skyManager->jupiter.irradianceFromEarth);

  skyState->memoryPtr[12] = static_cast<float>(skyState->skyManager->saturn.rightAscension);
  skyState->memoryPtr[13] = static_cast<float>(skyState->skyManager->saturn.declination);
  skyState->memoryPtr[25] = static_cast<float>(skyState->skyManager->saturn.irradianceFromEarth);

  skyState->memoryPtr[14] = static_cast<float>(skyState->astroTime->localApparentSiderealTime) * DEG_2_RAD;
}

//What we use to get all of this rolling.
void EMSCRIPTEN_KEEPALIVE setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, float* memoryPtr){
  //Set up our sky to the current time
  AstroTime *astroTime = new AstroTime(year, month, day, hour, minute, second);
  Location *location = new Location(latitude, longitude);
  SkyManager *skyManager = new SkyManager(astroTime, location);
  LightingAnalyzer *lightingAnalyzer = new LightingAnalyzer();
  skyState = new SkyState(astroTime, location, skyManager, lightingAnalyzer, memoryPtr);
  skyState->updateHeap32Memory();
}

void EMSCRIPTEN_KEEPALIVE updateSky(int year, int month, int day, int hour, int minute, double second){
  skyState->astroTime->setAstroTimeFromYMDHMSTZ(year, month, day, hour, minute, second);
  skyState->skyManager->update();
  skyState->updateHeap32Memory();
}

//This is just an external wrapper function we can call from our javascript
float EMSCRIPTEN_KEEPALIVE updateMeteringData(float* skyColorIntensities){
  return skyState->lightingAnalyzer->updateMeteringData(skyColorIntensities);
}

void EMSCRIPTEN_KEEPALIVE updateHemisphericalLightingData(float* skyColorIntensitiesPtr, float* hemisphericalAndDirectSkyLightPtr, float hmdViewX, float hmdViewZ){
  skyState->lightingAnalyzer->updateHemisphericalLightingData(skyColorIntensitiesPtr, hemisphericalAndDirectSkyLightPtr, hmdViewX, hmdViewZ);
}

float EMSCRIPTEN_KEEPALIVE updateDirectLighting(float heightOfCamera, float sunYPosition, float sunRadius, float moonRadius, float moonYPosition, float sunIntensity, float moonIntensity, float meteringIntensity, float* directLightingPointer){
  //Determine whether sun or moon is dominant based on the height
  float dominantLightRadius = sunRadius;
  float dominantLightY = sunYPosition;
  bool sunIsDominantLightSource = true;
  float dominantLightIntensity = sunIntensity;
  if(sunYPosition < -sunRadius){
    dominantLightRadius = moonRadius;
    dominantLightY = moonYPosition;
    sunIsDominantLightSource = false;
    dominantLightIntensity = moonIntensity;
  }

  //We are only chopping off the intensity from the horizon, solar eclipse
  //or lunar eclipse here. We do not emulate phases of the moon or a more
  //accurate solution which would require summing over the intensities of
  //all pixels on a image of the sun or moon - this is just a point source
  //approximation.
  float totalLightSourceArea = PI * dominantLightRadius * dominantLightRadius;
  float visibleAreaOfLightSource = 0.0;
  if(dominantLightY >= dominantLightRadius){
    visibleAreaOfLightSource = totalLightSourceArea;
  }
  if(dominantLightY > -dominantLightRadius && dominantLightY < 0.0){
    //LightSource is above horizon, we automatically get half of our sphere
    if(dominantLightY > 0.0){
      visibleAreaOfLightSource = PI_OVER_TWO * dominantLightRadius * dominantLightRadius;
    }

    //And apply the usual business to get the percentVisible
    float h = dominantLightRadius - dominantLightY;
    float d = dominantLightY - h;
    float dOverH = d / h;
    float chordLength = 2.0 * dominantLightRadius * sqrt(1.0 - dOverH * dOverH);
    float angleWithHorizon = 2.0 * atan2(chordLength, 2.0 * d);
    visibleAreaOfLightSource += 0.5 * (dominantLightRadius * dominantLightRadius) * (angleWithHorizon - sin(angleWithHorizon));
  }
  float lightIntensity = sunIsDominantLightSource ? sunIntensity / 700.0 : moonIntensity * 0.025;
  lightIntensity *= visibleAreaOfLightSource / totalLightSourceArea;
  //Not sure if this is accurate, but a nice linear transition works to keep us in the transmittance between
  //these two points. Maybe come back here at a later time and do the calculus to get the perfect
  //answer. We're getting rusty at calculus anyways.
  dominantLightY += dominantLightRadius * (1.0 - (visibleAreaOfLightSource / totalLightSourceArea));

  //If this is the lunar light, we modify the intensity of the light based on our metering results
  // if(!sunIsDominantLightSource){
  //
  // }

  //Once we have the base source light, we need to apply the transmittance to this light
  //Use this height information to acquire the appropriate position on the transmittance LUT
  int xPosition = 0.5 * (1.0 + dominantLightY) * skyState->lightingAnalyzer->widthOfTransmittanceTexture;
  float r = heightOfCamera + RADIUS_OF_EARTH;
  int yPosition = sqrt((heightOfCamera * heightOfCamera - RADIUS_OF_EARTH_SQUARED) / RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED) * skyState->lightingAnalyzer->widthOfTransmittanceTexture;

  //Get the look-up color for the LUT for the weighted nearest 4 colors
  float transmittance[3] = {0.0, 0.0, 0.0};
  float xClamped = ceil(xPosition);
  float weight = xClamped - xPosition;
  float totalWeight = weight;
  skyState->lightingAnalyzer->xyToIndexStartForRedColor(xClamped, yPosition, weight, transmittance);
  xClamped = floor(xPosition);
  weight = xPosition - xClamped;
  totalWeight += weight;
  skyState->lightingAnalyzer->xyToIndexStartForRedColor(xClamped, yPosition, weight, transmittance);
  float yClamped = ceil(yPosition);
  weight = yClamped - yPosition;
  totalWeight += weight;
  skyState->lightingAnalyzer->xyToIndexStartForRedColor(xPosition, yClamped, weight, transmittance);
  yClamped = floor(yPosition);
  weight = yPosition - yClamped;
  totalWeight += weight;
  skyState->lightingAnalyzer->xyToIndexStartForRedColor(xPosition, yClamped, weight, transmittance);
  //Modify the color our light as a side effect
  for(int i = 0; i < 3; ++i){
    //The first three items tell us the color of the light
    directLightingPointer[i] = transmittance[i] * lightIntensity / totalWeight;
  }

  //Apply this LUT transmittance to our direct lighting
  return dominantLightY;
}

void EMSCRIPTEN_KEEPALIVE initializeMeteringAndLightingDependencies(int widthOfMeteringTexture, int transmittanceTextureSize, float* xyzPtr, float* pixelWeightsPtr, float* groundColor, float* transmittanceLUT, float* fogColor){
  //Attach our pointers to the object
  skyState->lightingAnalyzer->widthOfMeteringTexture = widthOfMeteringTexture;
  skyState->lightingAnalyzer->xyzCoordinatesOfPixel = xyzPtr;
  skyState->lightingAnalyzer->pixelWeights = pixelWeightsPtr;
  skyState->lightingAnalyzer->groundColor = groundColor;
  skyState->lightingAnalyzer->transmittanceLUT = transmittanceLUT;
  skyState->lightingAnalyzer->widthOfTransmittanceTexture = transmittanceTextureSize;
  skyState->lightingAnalyzer->fogColor = fogColor;

  //Set their constant values for future reference
  float sumOfPixelWeights = 0.0;
  const float halfWidthOfTexture = widthOfMeteringTexture * 0.5;
  const float radiusOfSkyCircle = halfWidthOfTexture * halfWidthOfTexture;
  const int numberOfPixels = widthOfMeteringTexture * widthOfMeteringTexture;
  for(int i = 0; i < numberOfPixels; ++i){
    float x = (i % widthOfMeteringTexture) - halfWidthOfTexture;
    float y = floor(i / widthOfMeteringTexture) - halfWidthOfTexture;

    //Use this to set the x y and z coordinates of our pixel
    float rhoSquared = x * x + y * y;
    float rho = sqrt(rhoSquared);
    float height = sqrt(1.0 - rhoSquared);
    float phi = TWO_OVER_PI - atan2(height, rho);
    float theta = atan2(y, x);
    float x3 = sin(phi) * cos(theta);
    float y3 = sin(phi) * sin(theta);
    float z3 = cos(phi);
    float normalizationConstant = 1.0 / sqrt(x3 * x3 + y3 * y3 + z3 * z3);

    xyzPtr[i * 3] = x3 * normalizationConstant;
    xyzPtr[i * 3 + 1] = y3 * normalizationConstant;
    xyzPtr[i * 3 + 2] = z3 * normalizationConstant;

    float pixelRadius = x * x + y * y;
    float thisPixelsWeight = pixelRadius < radiusOfSkyCircle ? 1.0 : 0.0;
    skyState->lightingAnalyzer->pixelWeights[i] = thisPixelsWeight;
    sumOfPixelWeights += thisPixelsWeight;
  }
  skyState->lightingAnalyzer->oneOverSumOfWeightWeights = 1.0 / sumOfPixelWeights;
}

int main(){
  return 0;
}
