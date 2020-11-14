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
  void setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset, float* memoryPtr);
  void updateSky(int year, int month, int day, int hour, int minute, double second, double utcOffset);
  void initializeMeteringAndLightingDependencies(float* xyzPtr, float* pixelWeightsPtr, int widthOfTexture);
  float updateMeteringAndLightingData(float* skyColorIntensities, float* hemisphericalSkyLight);
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
void EMSCRIPTEN_KEEPALIVE setupSky(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset, float* memoryPtr){
  //Set up our sky to the current time
  AstroTime *astroTime = new AstroTime(year, month, day, hour, minute, second, utcOffset);
  Location *location = new Location(latitude, longitude);
  SkyManager *skyManager = new SkyManager(astroTime, location);
  LightingAnalyzer *lightingAnalyzer = new LightingAnalyzer();
  skyState = new SkyState(astroTime, location, skyManager, lightingAnalyzer, memoryPtr);
  skyState->updateHeap32Memory();
}

void EMSCRIPTEN_KEEPALIVE updateSky(int year, int month, int day, int hour, int minute, double second, double utcOffset){
  skyState->astroTime->setAstroTimeFromYMDHMSTZ(year, month, day, hour, minute, second, utcOffset);
  skyState->skyManager->update();
  skyState->updateHeap32Memory();
}

//This is just an external wrapper function we can call from our javascript
float EMSCRIPTEN_KEEPALIVE updateMeteringAndLightingData(float* skyColorIntensities, float* hemisphericalSkyLight){
  return skyState->lightingAnalyzer->updateMeteringAndLightingData(skyColorIntensities, hemisphericalSkyLight);
}

void EMSCRIPTEN_KEEPALIVE initializeMeteringAndLightingDependencies(float* xyzPtr, float* pixelWeightsPtr, int widthOfTexture){
  //Attach our pointers to the object
  skyState->lightingAnalyzer->widthOfTexture = widthOfTexture;
  skyState->lightingAnalyzer->xyzCoordinatesOfPixel = xyzPtr;
  skyState->lightingAnalyzer->pixelWeights = pixelWeightsPtr;

  //Set their constant values for future reference
  float sumOfPixelWeights = 0.0;
  const float halfWidthOfTexture = widthOfTexture * 0.5;
  const float radiusOfSkyCircle = halfWidthOfTexture * halfWidthOfTexture;
  const int numberOfPixels = widthOfTexture * widthOfTexture;
  for(int i = 0; i < numberOfPixels; ++i){
    float x = (i % widthOfTexture) - halfWidthOfTexture;
    float y = floor(i / widthOfTexture) - halfWidthOfTexture;

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
