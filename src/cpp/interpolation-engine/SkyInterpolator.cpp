#include "Constants.h"
#include "SkyInterpolator.h"
#include "color/ColorInterpolator.h"
#include <emscripten/emscripten.h>
#include <cmath>

//
//Constructor
//
SkyInterpolator::SkyInterpolator(ColorInterpolator* ColorInterpolatorPtr){
  colorInterpolator = ColorInterpolatorPtr;
}

SkyInterpolator* skyInterpolator;

extern "C" {
  int main();
  void initializeAstromicalValues(float latitude, float* astroPositions_0, float* rotatedAstroPositions, float* linearValues_0, float* linearValues, float* rotationallyDepedentAstroValues);
  void updateFinalAstronomicalValues(float* astroPositions_f, float* linearValues_f);
  void updateAstronomicalTimeData(float t_0, float t_f, float initialLSRT, float finalLSRT);
  float tick_astronomicalInterpolations(float t);
  void setSunAndMoonTimeTo(float t);
  void initializeLightingValues(float* lightingDataInterpolatedValues);
  void updateLightingValues(float skyIntensity0, float skyIntensityf, bool dominantLightIsSun0, bool dominantLightIsSunf, float dominantLightY0, float dominantLightf, float dominantLightIntensity0, float dominantLightIntensityF, float* lightColors0, float* lightColorsf, float t_0, float t_f);
  void tick_lightingInterpolations(float t);
  float bolometricMagnitudeToLuminosity(float x);
  float luminosityToAtmosphericIntensity(float x);
}

void EMSCRIPTEN_KEEPALIVE setupInterpolators(float latitude, float* astroPositions_0, float* rotatedAstroPositions, float* linearValues_0, float* linearValues, float* rotationallyDepedentAstroValues){
  //Set up our color interpolator for for animating colors of our lights
  ColorInterpolator* colorInterpolator = new ColorInterpolator();
  skyInterpolator = new SkyInterpolator(colorInterpolator);

  //Set up our astronomical values
  skyInterpolator->sinOfLatitude = -sin(latitude * DEG_2_RAD);
  skyInterpolator->cosOfLatitude = cos(latitude * DEG_2_RAD);
  skyInterpolator->tanOfLatitude = skyInterpolator->sinOfLatitude / skyInterpolator->cosOfLatitude;
  skyInterpolator->astroPositions_0 = astroPositions_0;
  skyInterpolator->rotatedAstroPositions = rotatedAstroPositions;
  skyInterpolator->linearValues_0 = linearValues_0;
  skyInterpolator->linearValues = linearValues;
  skyInterpolator->rotationallyDepedentAstroValues = rotationallyDepedentAstroValues;
}

void EMSCRIPTEN_KEEPALIVE updateFinalAstronomicalValues(float* astroPositions_f, float* linearValues_f){
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

void EMSCRIPTEN_KEEPALIVE updateAstronomicalTimeData(float t_0, float t_f, float initialLSRT, float finalLSRT){
  skyInterpolator->astronomical_t_0 = t_0;
  skyInterpolator->oneOverAstronomicalDeltaT = 1.0 / (t_f - t_0);
  skyInterpolator->initialLSRT = initialLSRT;
  skyInterpolator->deltaLSRT = fmod((fmod((finalLSRT - initialLSRT), PI_TIMES_TWO) + PI_TIMES_THREE), PI_TIMES_TWO) - PI;
}

void EMSCRIPTEN_KEEPALIVE setSunAndMoonTimeTo(float t){
  float tRelativeToT_0 = t - skyInterpolator->astronomical_t_0;
  float tFractional = tRelativeToT_0 * skyInterpolator->oneOverAstronomicalDeltaT;

  //Update our linear interpolations
  skyInterpolator->updateSunAndMoonRADecAndScale(tFractional);

  //Update our rotation of our astronomical objects in the sky
  skyInterpolator->rotateSunAndMoon(tFractional);

  //Get the horizon fade of our sun and moon
  skyInterpolator->getHorizonFades();
}

float EMSCRIPTEN_KEEPALIVE tick_astronomicalInterpolations(float t){
  float tRelativeToT_0 = t - skyInterpolator->astronomical_t_0;
  float tFractional = tRelativeToT_0 * skyInterpolator->oneOverAstronomicalDeltaT;

  //Update our linear interpolations
  skyInterpolator->updateAstronomicalLinearInterpolations(tFractional);

  //Update our rotation of our astronomical objects in the sky
  float interpolatedLSRT = skyInterpolator->rotateAstroObjects(tFractional);

  //Get the horizon fade of our sun and moon
  skyInterpolator->getHorizonFades();

  return interpolatedLSRT;
}

//Note that the interpolations for lighting exist on 2 second real time interpolations
//while astronomical calculations are done in astronomical time
//The two exists on two seperate time lines, with the lighting calculations depending
//on our astronomical calculations through the position of the sun and moon.
void EMSCRIPTEN_KEEPALIVE tick_lightingInterpolations(float t){
  float tFractional = (t - skyInterpolator->lightingTInitial) * skyInterpolator->oneOverLightingDeltaT;

  //Interpolate the metering
  float meteringValue = skyInterpolator->initialLogAverageOfSkyIntensity + tFractional * skyInterpolator->deltaLogAverageOfSkyIntensity;

  //Interpolate the direct light brightness
  float directLightIntensity = skyInterpolator->dominantLightIntensity0 + tFractional * skyInterpolator->deltaDominantLightIntensity;

  //Interpolate direct light y position
  float directLightingX;
  float directLightingZ;
  if(skyInterpolator->dominantLightIsSun){
    directLightingX = skyInterpolator->rotatedAstroPositions[0];
    directLightingZ = skyInterpolator->rotatedAstroPositions[2];
  }
  else{
    directLightingX = skyInterpolator->rotatedAstroPositions[3];
    directLightingZ = skyInterpolator->rotatedAstroPositions[5];
    directLightIntensity *= pow(100.0, fmin(6.8 - meteringValue, 3.7) * 0.2);
  }
  float directLightingY = skyInterpolator->dominantLightY0 + tFractional * skyInterpolator->deltaDominantLightY;

  //Interpolate our light colors
  colorInterpolator->updateLightingLinearInterpolations(tFractional);

  //Update our memory
  skyInterpolator->interpolatedMeteringAndLightingValues[24] = directLightIntensity;
  skyInterpolator->interpolatedMeteringAndLightingValues[25] = directLightingX;
  skyInterpolator->interpolatedMeteringAndLightingValues[26] = directLightingY;
  skyInterpolator->interpolatedMeteringAndLightingValues[27] = directLightingZ;
  skyInterpolator->interpolatedMeteringAndLightingValues[28] = meteringValue;
}

void EMSCRIPTEN_KEEPALIVE initializeLightingValues(float* lightingDataInterpolatedValues){
  skyInterpolator->interpolatedMeteringAndLightingValues = lightingDataInterpolatedValues;
  colorInterpolator->interpolatedMeteringAndLightingValues = lightingDataInterpolatedValues;
}

void EMSCRIPTEN_KEEPALIVE updateLightingValues(float skyIntensity0, float skyIntensityf, bool dominantLightIsSun0, bool dominantLightIsSunf, float dominantLightY0, float dominantLightf, float dominantLightIntensity0, float dominantLightIntensityF, float* lightColors0, float* lightColorsf, float t_0, float t_f){
  skyInterpolator->initialLogAverageOfSkyIntensity = skyIntensity0;
  skyInterpolator->deltaLogAverageOfSkyIntensity = skyIntensityf - skyIntensity0;

  if(dominantLightIsSun0 !== dominantLightIsSunf){
    skyInterpolator->dominantLightIsSun = true;
    skyInterpolator->dominantLightY0 = dominantLightIsSun0 ? dominantLightY0 ? dominantLightYf;
    skyInterpolator->deltaDominantLightY = 0.0;
    if(dominantLightIsSun0){
      //Sun is setting
      skyInterpolator->dominantLightIntensity0 = dominantLightIntensity0;
      skyInterpolator->deltaDominantLightIntensity = -dominantLightIntensity0;
    }
    else{
      //Sun is rising
      skyInterpolator->dominantLightIntensity0 = 0.0;
      skyInterpolator->deltaDominantLightIntensity = dominantLightIntensity0;
    }
  }
  else{
    skyInterpolator->dominantLightIsSun = dominantLightIsSun0;
    skyInterpolator->dominantLightY0 = dominantLightY0;
    skyInterpolator->deltaDominantLightY = dominantLightYf - dominantLightY0;
    skyInterpolator->dominantLightIntensity0 = dominantLightIntensity0;
    skyInterpolator->deltaDominantLightIntensity = dominantLightIntensityf - dominantLightIntensity0;
  }

  colorInterpolator->updateFinalColorValues(lightColors0, lightColorsf);

  skyInterpolator->lightingTInitial = t_0;
  skyInterpolator->oneOverLightingDeltaT = 1.0 / (t_f - t_0);
}

//These are kind of hackish - I'm not sure they're even remotely correct.
float EMSCRIPTEN_KEEPALIVE bolometricMagnitudeToLuminosity(float x){
  return 100000.0 * pow(100.0, 0.2 * (26.74 - x));
}

float EMSCRIPTEN_KEEPALIVE luminosityToAtmosphericIntensity(float x){
  return log2(x * 1.0e-3);
}

float SkyInterpolator::rotateAstroObjects(float fractOfFinalPosition){
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

  return interpolatedLSRT;
}

void SkyInterpolator::rotateSunAndMoon(float fractOfFinalPosition){
  //Interpolate the x, y and z right ascension and hour angle for the sun and moon
  float interpolatedAstroPositions[6];
  #pragma unroll
  for(int i = 0; i < 4; ++i){
    interpolatedAstroPositions[i] = astroPositions_0[i] + fractOfFinalPosition * deltaPositions[i];
  }
  float interpolatedLSRT = skyInterpolator->initialLSRT + fractOfFinalPosition * skyInterpolator->deltaLSRT;

  //Rotate our objects into the x, y, z coordinates of our azimuth and altitude
  float sinLocalSiderealTime = sin(interpolatedLSRT);
  float cosLocalSiderealTime = cos(interpolatedLSRT);
  #pragma unroll
  for(int i = 0; i < 2; ++i){
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
}

void SkyInterpolator::updateSunAndMoonRADecAndScale(float fractOfFinalPosition){
  //Interpolate our scales
  linearValues[2] = linearValues_0[2] + fractOfFinalPosition * deltaLinearValues[2];
  linearValues[4] = linearValues_0[4] + fractOfFinalPosition * deltaLinearValues[4];
}

void SkyInterpolator::updateAstronomicalLinearInterpolations(float fractOfFinalPosition){
  #pragma unroll
  for(int i = 0; i < NUMBER_OF_LINEAR_VALUES; i += 1){
    linearValues[i] = linearValues_0[i] + fractOfFinalPosition * deltaLinearValues[i];
  }
}

void SkyInterpolator::getHorizonFades(){
  #pragma unroll
  for(int i = 0; i < 2; ++i){
    float objectYPosition = rotatedAstroPositions[i * 3 + 1];

    //This is based around the idea that at 18 degrees below the horizon we are officially in night
    //We use the sin of this angle to determine the position below the horizon when the sun has dissapeared
    //and clamp our results between 0.0 and 1.0 so we never add or remove light
    rotationallyDepedentAstroValues[START_OF_HORIZON_FADE_INDEX + i] = fmin(fmax(3.24 * objectYPosition + 1.0, 0.0), 1.0);
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
