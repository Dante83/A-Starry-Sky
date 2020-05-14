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
  void initialize(float latitude, float* astroPositions_0, float* rotatedAstroPositions, float* linearValues_0, float* linearValues, float* rotationallyDepedentAstroValues);
  void updateFinalValues(float* astroPositions_f, float* linearValues_f);
  void updateTimeData(float t_0, float t_f, float initialLSRT, float finalLSRT);
  void tick(float t);
}

void EMSCRIPTEN_KEEPALIVE initialize(float latitude, float* astroPositions_0, float* rotatedAstroPositions, float* linearValues_0, float* linearValues, float* rotationallyDepedentAstroValues){
  skyInterpolator->sinOfLatitude = -sin(latitude * DEG_2_RAD);
  skyInterpolator->cosOfLatitude = cos(latitude * DEG_2_RAD);
  skyInterpolator->tanOfLatitude = skyInterpolator->sinOfLatitude / skyInterpolator->cosOfLatitude;
  skyInterpolator->astroPositions_0 = astroPositions_0;
  skyInterpolator->rotatedAstroPositions = rotatedAstroPositions;
  skyInterpolator->linearValues_0 = linearValues_0;
  skyInterpolator->linearValues = linearValues;
  skyInterpolator->rotationallyDepedentAstroValues = rotationallyDepedentAstroValues;
}

void EMSCRIPTEN_KEEPALIVE updateFinalValues(float* astroPositions_f, float* linearValues_f){
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_RAS_AND_DECS; i += 2){
    float ra_0 = skyInterpolator->astroPositions_0[i];
    float ra_f = astroPositions_f[i];
    float dec_0 = skyInterpolator->astroPositions_0[i + 1];
    float dec_f = astroPositions_f[i + 1];

    //Huge jumps are an excellent way to see that this is incorrect
    float deltaPosition = ra_f - ra_0;
    skyInterpolator->deltaPositions[i] = fmod((fmod((ra_f - ra_0), PI_TIMES_TWO) + PI_TIMES_THREE), PI_TIMES_TWO) - PI;

    //Interpolation on dec is always a bit weird, but does not face the same massive rotations
    //that interpolations on right-ascension has. That and declination never strays towards the polar
    //limits anyways for our CPU calculated objects, and all GPU objects have a static RA and Dec.
    skyInterpolator->deltaPositions[i + 1] = dec_f - dec_0;
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
  skyInterpolator->deltaLSRT = fmod((fmod((finalLSRT - initialLSRT), PI_TIMES_TWO) + PI_TIMES_THREE), PI_TIMES_TWO) - PI;
}

void EMSCRIPTEN_KEEPALIVE tick(float t){
  float tRelativeToT_0 = t - skyInterpolator->t_0;
  float tFractional = tRelativeToT_0 * skyInterpolator->oneOverDeltaT;

  //Update our linear interpolations
  skyInterpolator->updateLinearInterpolations(tFractional);

  //Update our rotation of our astronomical objects in the sky
  skyInterpolator->rotateAstroObjects(tFractional);

  //Get the horizon fade of our sun and moon
  skyInterpolator->getHorizonFades();
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
  for(int i = 0; i < NUMBER_OF_ASTRONOMICAL_OBJECTS; ++i){
    //Convert the right ascension and hour angle to an x, y, z coordinate
    float interpolatedRA = interpolatedAstroPositions[i * 2];
    float interpolatedDec = interpolatedAstroPositions[i * 2 + 1];
    float cosOfDec = cos(interpolatedDec);
    float equitorialX = cosOfDec * cos(interpolatedRA);
    float equitorialZ = cosOfDec * sin(interpolatedRA);
    float equitorialY = sin(interpolatedDec);

    //Rotate the object
    float term0 = cosLocalSiderealTime * equitorialX + sinLocalSiderealTime * equitorialZ;
    float x_term = sinOfLatitude * term0 - cosOfLatitude * equitorialY;
    float y_term = cosOfLatitude * term0 + sinOfLatitude * equitorialY;
    float z_term = sinLocalSiderealTime * equitorialX - cosLocalSiderealTime * equitorialZ;

    //Get the magnitude of the vector
    float magnitudeOfAstroVector = 1.0 / sqrt(x_term * x_term + y_term * y_term + z_term * z_term);
    rotatedAstroPositions[3 * i] = x_term * magnitudeOfAstroVector;
    rotatedAstroPositions[3 * i + 1] = y_term * magnitudeOfAstroVector;
    rotatedAstroPositions[3 * i + 2] = z_term * magnitudeOfAstroVector;
  }

  //Get our sun position in equitorial coordinates for the moon
  getLunarParallacticAngle(interpolatedAstroPositions, interpolatedLSRT);
}

void SkyInterpolator::updateLinearInterpolations(float fractOfFinalPosition){
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_LINEAR_VALUES; i += 1){
    linearValues[i] = linearValues_0[i] + fractOfFinalPosition * deltaLinearValues[i];
  }
}

void SkyInterpolator::getHorizonFades(){
  #pragma unroll
  for(int i = 0; i < 2; ++i){
    float objectYPosition = rotatedAstroPositions[i * 3 + 1];
    float linearFade = 1.7 * objectYPosition + 1.1;
    rotationallyDepedentAstroValues[START_OF_HORIZON_FADE_INDEX + i] = (linearFade < 0.0) ? 0.0 : (1.0 < linearFade) ? 1.0 : linearFade;
  }
}

void SkyInterpolator::getLunarParallacticAngle(float* interpolatedAstroPositions, float interpolatedLSRT){
  float lunarRightAscension = interpolatedAstroPositions[2];
  float lunarDeclination = interpolatedAstroPositions[3];
  float hourAngle = interpolatedLSRT - lunarRightAscension;
  rotationallyDepedentAstroValues[PARALLACTIC_ANGLE_INDEX] = atan2(sin(hourAngle), tanOfLatitude * cos(lunarDeclination) - sin(lunarDeclination) * cos(hourAngle)) + PI;
}

int main(){
  return 0;
}
