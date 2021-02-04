#include "ColorInterpolator.h"
#include "../Constants.h"
#include <cmath>
#include <stdio.h>

ColorInterpolator::ColorInterpolator(){
  //
  //Empty Constructor
  //
}

void ColorInterpolator::updateFinalColorValues(float* rgb0, float* rgbf){
  //In the future | this into a single 32 bit unsigned integer
  for(int rChannel = 0; rChannel < NUMBER_OF_INTERPOLATED_COLOR_CHANNELS; rChannel += 3){
    int gChannel = rChannel + 1;
    int bChannel = rChannel + 2;
    convertRGBToHSL(rgb0[rChannel], rgb0[gChannel], rgb0[bChannel]);
    hsl0[rChannel] = threeVector[0];
    hsl0[gChannel] = threeVector[1];
    hsl0[bChannel] = threeVector[2];
    convertRGBToHSL(rgbf[rChannel], rgbf[gChannel], rgbf[bChannel]);
    deltaHSL[rChannel] = threeVector[0];
    deltaHSL[gChannel] = threeVector[1] - hsl0[gChannel];
    deltaHSL[bChannel] = threeVector[2] - hsl0[bChannel];
  }
}

void ColorInterpolator::updateLightingLinearInterpolations(float tFractional){
  //Interpolate our values, clamping saturation and brightness
  //converting our
  for(int rChannel = 0; rChannel < NUMBER_OF_INTERPOLATED_COLOR_CHANNELS; rChannel += 3){
    int gChannel = rChannel + 1;
    int bChannel = rChannel + 2;

    //Interpolate our hue as per help from
    //https://www.alanzucconi.com/2016/01/06/colour-interpolation/
    float hue = 0.0f;
    float hue0 = hsl0[rChannel];
    float huef = deltaHSL[rChannel];
    float d = huef - hue0;
    float t = tFractional;
    if (hue0 > huef){
      // Swap (hue0, huef)
      float h3 = huef;
      huef = hue0;
      hue0 = h3;

      d = -d;
      t = 1.0f - tFractional;
    }

    if (d > 0.5){
      hue0 = hue0 + 1.0f;
      hue = fmod((hue0 + t * (huef - hue0)), 1.0);
    }
    if (d <= 0.5){
      hue = hue0 + t * d;
    }

    //Normal interpolation for our brightness and saturation
    float saturation = fmin(fmax(hsl0[gChannel] + tFractional * deltaHSL[gChannel], 0.0f), 1.0f);
    float lightness = fmin(fmax(hsl0[bChannel] + tFractional * deltaHSL[bChannel], 0.0f), 1.0f);

    //Convert our values back into RGB

    convertHSLToRGB(hue, saturation, lightness);
    interpolatedMeteringAndLightingValues[rChannel] = threeVector[0];
    interpolatedMeteringAndLightingValues[gChannel] = threeVector[1];
    interpolatedMeteringAndLightingValues[bChannel] = threeVector[2];
  }
}

//
//Color conversions adapted from THREE.JS
//https://github.com/mrdoob/three.js/blob/master/src/math/Color.js
//https://raw.githubusercontent.com/mrdoob/three.js/master/LICENSE
//
void ColorInterpolator::convertRGBToHSL(float r, float g, float b){
  float maxColorChannel;
  float minColorChannel;
  float oneOverDeltaCoefficient;
  float hueTerm;
  bool maxColorIsR = false;
  bool maxColorIsG = false;
  if(r >= g){
    if(r >= b){
      //r > g && b but we still need to find the minimum between g and b
      maxColorIsR = true;
      maxColorChannel = r;
      minColorChannel = fmin(b, g);
    }
    else{
      //r > g and b > r so g is minimum b > r > g
      maxColorChannel = b;
      minColorChannel = g;
    }
  }
  else{
    //r < g
    if(g < b){
      //r < g < b
      maxColorChannel = b;
      minColorChannel = r;
    }
    else{
      //g > b && >r but we still need to find the mininum between b and r
      //This is also the default if g == b as g supersedes b
      maxColorIsG = true;
      maxColorChannel = g;
      minColorChannel = fmin(b, r);
    }
  }

  float hue = 0.0f;
  float saturation;
  float lightness = (maxColorChannel + minColorChannel) * 0.5f;
  float delta = maxColorChannel - minColorChannel;
  if(minColorChannel == maxColorChannel){
    hue = 0.0f;
    saturation = 0.0f;
  }
  else{
    saturation = lightness < 0.5f ? delta / (minColorChannel + maxColorChannel) : delta / (2.0f - maxColorChannel - minColorChannel);
    if(maxColorIsR){
      hue = (g - b)/delta + (g < b ? 6.0f : 0.0f);
    }
    else if(maxColorIsG){
      hue = (b - r)/delta + 2.0f;
    }
    else{
      hue = (r - g)/delta + 4.0f;
    }
    hue *= ONE_SIXTH;
  }

  threeVector[0] = fmax(fmin(hue, 1.0), 0.0);
  threeVector[1] = fmax(fmin(saturation, 1.0), 0.0);
  threeVector[2] = fmax(fmin(lightness, 1.0), 0.0);
}

float ColorInterpolator::hueToRGB(float p, float q, float t){
  if(t < 0.0f){
    t += 1.0f;
  }
  if(t > 1.0f){
    t -= 1.0f;
  }
  if(t < ONE_SIXTH){
    return p + (q - p) * 6.0f * t;
  }
  if(t < 0.5f){
    return q;
  }
  if(t < TWO_THIRDS){
    return p + (q - p) * 6.0 * (TWO_THIRDS - t);
  }
  return p;
}

void ColorInterpolator::convertHSLToRGB(float h, float s, float l){
  float clampedH = fmax(fmin(h, 1.0), 0.0);
  float clampedS = fmax(fmin(s, 1.0), 0.0);
  float clampedL = fmax(fmin(l, 1.0), 0.0);

  if(s == 0.0f){
    threeVector[0] = clampedL;
    threeVector[1] = clampedL;
    threeVector[2] = clampedL;
  }
  else{
    float p = clampedL <= 0.5f ? clampedL * (1.0f + clampedS) : clampedL + clampedS - (clampedL * clampedS);
    float q = (2.0f * clampedL) - p;

    threeVector[0] = hueToRGB(q, p, clampedH + ONE_THIRD);
    threeVector[1] = hueToRGB(q, p, clampedH );
    threeVector[2] = hueToRGB(q, p, clampedH - ONE_THIRD);
  }
}
