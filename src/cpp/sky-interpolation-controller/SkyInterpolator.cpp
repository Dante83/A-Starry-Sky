#include "Constants.h"
#include "SkyInterpolator.h"
#include <emscripten/emscripten.h>

//
//Constructor
//
SkyInterpolator::SkyInterpolator(){
  //Create all interpolated quantities
}

SkyInterpolator* skyInterpolator;

extern "C" {
  int main();
  void initialize(const double latitudes, const double& astroPositions_0, const double& rotatedAstroPositions);
  void updateAstroRAandHA(double* astroPositions_f);
  void updateTime(double t);
  void updateAstroRAandHA();
  void updateTimeSpan(double t_0, double t_f);
}

void EMSCRIPTEN_KEEPALIVE initialize(double latitudes, double& astroPositions_0, double& rotatedAstroPositions, double& linearValues_0, double &linearValues){
  skyInterpolator.sinOfLatitude = sin(latitude);
  skyInterpolator.cosOfLatitude = cos(latitude);
  skyInterpolator.astroPositions_0 = astroPositions_0;
  skyInterpolator.rotatedAstroPositions = rotatedAstroPositions;
  skyInterpolator.linearValues_0 = linearValues_0;
  skyInterpolator.linearValues = linearValues;
}

void EMSCRIPTEN_KEEPALIVE updateFinalValues(double& astroPositions_f, double& linearValues_f){
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_ASTRONOMICAL_COORDINATES; ++i){
    skyInterpolator.deltaPositions[i] = astroPositions_f[i] - skyInterpolator.astroPositions_0[i];
  }

  #pragma unroll
  for(int i = 0; i < NUMBER_OF_LINEAR_VALUES; ++i){
    skyInterpolator.deltaLinearValues[i] = linearValues_f[i] - skyInterpolator.linearValues_0[i];
  }
}

void EMSCRIPTEN_KEEPALIVE updateTimeData(double t_0, double t_f, double initialLSRT, double finalLSRT){
  skyInterpolator.t_0 = t_0;
  skyInterpolator.oneOverDeltaT = 1.0 / (t_f - t_0);
  skyInterpolator.initialLSRT = initialLSRT;
  skyInterpolator.finalLSRT = finalLSRT;
}

void EMSCRIPTEN_KEEPALIVE tick(double t){
  double tRelativeToT_0 = t - skyInterpolator.t_0;
  double tFractional = tRelativeToT_0 * skyInterpolator.oneOverDeltaT;

  //Update our linear interpolations
  skyInterpolator.updateLinearInterpolations(tFractional);

  //Update our LSRT
  double lsrt = skyInterpolator.interpolateLSRT(tFractional);

  //Update our rotation of our astronomical objects in the sky
  skyInterpolator.rotateAstroObjects(lsrt, tFractional);
}

void SkyInterpolator::rotateAstroObjects(double lsrt, double fractOfFinalPosition){
  //Interpolate the x, y and z right ascension and hour angle for each of our astronomical objects
  double interpolatedAstroPositions[NUMBER_OF_ASTRONOMICAL_COORDINATES];
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_ASTRONOMICAL_COORDINATES; i += 3){
    interpolatedAstroPositions[i] = astroPositions_0[i] + fractOfFinalPosition * deltaPositions[i];
    interpolatedAstroPositions[i + 1] = astroPositions_0[i + 1] + fractOfFinalPosition * deltaPositions[i + 1];
    interpolatedAstroPositions[i + 2] = astroPositions_0[i + 2] + fractOfFinalPosition * deltaPositions[i + 2];
  }

  //Rotate our objects into the x, y, z coordinates of our azimuth and altitude
  double sinOfLSRT = sin(lsrt);
  double cosOfLSRT = cos(lsrt);
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_ASTRONOMICAL_COORDINATES; i += 3){
    rotatedAstroPositions[i] = sinOfLatitude * cosOfLSRT * interpolatedAstroPositions[i] + sinOfLatitude * sinOfLSRT * interpolatedAstroPositions[i + 1] - cosOfLatitude * interpolatedAstroPositions[i + 2];
    rotatedAstroPositions[i + 1] = cosOfLatitude * cosOfLSRT * interpolatedAstroPositions[i] + cosOfLatitude * sinOfLSRT * interpolatedAstroPositions[i + 1] + sinOfLatitude * interpolatedAstroPositions[i + 2];
    rotatedAstroPositions[i + 2] = interpolatedAstroPositions[i + 2];
  }
}

void SkyInterpolator::updateLinearInterpolations(double fractOfFinalPosition){
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_LINEAR_VALUES; i += 1){
    linearValues[i] = linearValues_0[i] + fractOfFinalPosition * deltaLinearValues[i];
  }
}

double SkyInterpolator::interpolateLSRT(double fractOfFinalPosition){
  return initialLSRT + fractOfFinalPosition * min(finalLSRT - initialLSRT, abs(PI_TIMES_TWO - finalLSRT + initialLSRT));
}

int main(){
  return 0;
}
