#include "Constants.h"
#include "SkyInterpolator.h"
#include <emscripten/emscripten.h>
#include <cmath>
#include "stdio.h"

//
//Constructor
//
SkyInterpolator::SkyInterpolator(){
  //
  //Empty constructor
  //
}

SkyInterpolator* skyInterpolator;

extern "C" {
  int main();
  void initialize(float latitude, float* astroPositions_0, float* rotatedAstroPositions, float* linearValues_0, float* linearValues);
  void updateFinalValues(float* astroPositions_f, float* linearValues_f);
  void updateTimeData(float t_0, float t_f, float initialLSRT, float finalLSRT);
  void tick(float t);
}

void EMSCRIPTEN_KEEPALIVE initialize(float latitude, float* astroPositions_0, float* rotatedAstroPositions, float* linearValues_0, float* linearValues){
  skyInterpolator->sinOfLatitude = -sin(latitude * DEG_2_RAD);
  skyInterpolator->cosOfLatitude = cos(latitude * DEG_2_RAD);
  skyInterpolator->astroPositions_0 = astroPositions_0;
  skyInterpolator->rotatedAstroPositions = rotatedAstroPositions;
  skyInterpolator->linearValues_0 = linearValues_0;
  skyInterpolator->linearValues = linearValues;
}

void EMSCRIPTEN_KEEPALIVE updateFinalValues(float* astroPositions_f, float* linearValues_f){
  // printf("%f %f\r\n", skyInterpolator->astroPositions_0[0], skyInterpolator->astroPositions_0[1]);
  // printf("%f %f\r\n", astroPositions_f[0], astroPositions_f[1]);
  // printf("----------------\r\n");

  #pragma unroll
  for(int i = 0; i < NUMBER_OF_RAS_AND_DECS; ++i){
    if(astroPositions_f[i] < skyInterpolator->astroPositions_0[i]){
      skyInterpolator->deltaPositions[i] = (PI_TIMES_TWO - skyInterpolator->astroPositions_0[i]) + astroPositions_f[i];
    }
    else{
      skyInterpolator->deltaPositions[i] = astroPositions_f[i] - skyInterpolator->astroPositions_0[i];
    }
  }

  #pragma unroll
  for(int i = 0; i < NUMBER_OF_LINEAR_VALUES; ++i){
    skyInterpolator->deltaLinearValues[i] = linearValues_f[i] - skyInterpolator->linearValues_0[i];
  }
}

void EMSCRIPTEN_KEEPALIVE updateTimeData(float t_0, float t_f, float initialLSRT, float finalLSRT){
  skyInterpolator->t_0 = t_0;
  skyInterpolator->oneOverDeltaT = 1.0 / (t_f - t_0);
  skyInterpolator->initialLSRT = initialLSRT;
  skyInterpolator->deltaLSRT = finalLSRT >= initialLSRT ? finalLSRT - initialLSRT : (PI_TIMES_TWO - initialLSRT) + finalLSRT;
}

void EMSCRIPTEN_KEEPALIVE tick(float t){
  float tRelativeToT_0 = t - skyInterpolator->t_0;
  float tFractional = tRelativeToT_0 * skyInterpolator->oneOverDeltaT;

  //Update our linear interpolations
  skyInterpolator->updateLinearInterpolations(tFractional);

  //Update our rotation of our astronomical objects in the sky
  skyInterpolator->rotateAstroObjects(tFractional);
}

void SkyInterpolator::rotateAstroObjects(float fractOfFinalPosition){
  //Interpolate the x, y and z right ascension and hour angle for each of our astronomical objects
  float interpolatedAstroPositions[NUMBER_OF_ASTRONOMICAL_COORDINATES];
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_RAS_AND_DECS; ++i){
    interpolatedAstroPositions[i] = astroPositions_0[i] + fractOfFinalPosition * deltaPositions[i];
  }
  float interpolatedLSRT = skyInterpolator->initialLSRT + fractOfFinalPosition * skyInterpolator->deltaLSRT;

  //Rotate our objects into the x, y, z coordinates of our azimuth and altitude
  float sinLocalSiderealTime = sin(interpolatedLSRT);
  float cosLocalSiderealTime = cos(interpolatedLSRT);
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_ASTRONOMICAL_OBJECTS; i += 1){
    //Convert the right ascension and hour angle to an x, y, z coordinate
    float interpolatedRA = interpolatedAstroPositions[i * 2];
    float interpolatedDec = interpolatedAstroPositions[i * 2 + 1];
    float cosOfDec = cos(interpolatedDec);
    float equitorialX = cosOfDec * cos(interpolatedRA);
    float equitorialZ = cosOfDec * sin(interpolatedRA);
    float equitorialY = sin(interpolatedDec);

    //Rotate the object
    int xIndex = 3 * i;
    int yIndex = xIndex + 1;
    int zIndex = xIndex + 2;
    float term0 = cosLocalSiderealTime * equitorialX + sinLocalSiderealTime * equitorialZ;
    rotatedAstroPositions[xIndex] = sinOfLatitude * term0 - cosOfLatitude * equitorialY;
    rotatedAstroPositions[yIndex] = cosOfLatitude * term0 + sinOfLatitude * equitorialY;
    rotatedAstroPositions[zIndex] = sinLocalSiderealTime * equitorialX - cosLocalSiderealTime * equitorialZ;

    //Get the magnitude of the vector
    float magnitudeOfAstroVector = 1.0 / sqrt(rotatedAstroPositions[xIndex] * rotatedAstroPositions[xIndex] + rotatedAstroPositions[yIndex] * rotatedAstroPositions[yIndex] + rotatedAstroPositions[zIndex] * rotatedAstroPositions[zIndex]);
    rotatedAstroPositions[xIndex] *= magnitudeOfAstroVector;
    rotatedAstroPositions[yIndex] *= magnitudeOfAstroVector;
    rotatedAstroPositions[zIndex] *= magnitudeOfAstroVector;
  }
}

void SkyInterpolator::updateLinearInterpolations(float fractOfFinalPosition){
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_LINEAR_VALUES; i += 1){
    linearValues[i] = linearValues_0[i] + fractOfFinalPosition * deltaLinearValues[i];
  }
}

int main(){
  return 0;
}
