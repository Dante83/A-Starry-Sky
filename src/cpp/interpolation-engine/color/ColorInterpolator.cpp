#include "Location.h"
#include "../Constants.h"
#include <cmath>

ColorInterpolator::ColorInterpolator(){
  //
  //Empty Constructor
  //
}

void ColorInterpolator::updateFinalColorValues(float* rgb0, float* rgbf){
  float oneOverDeltaT =
  for(int rChannel = 0; rChannel < NUMBER_OF_INTERPOLATED_COLOR_CHANNELS; rChannel += 3){
    int gChannel = rChannel + 1;
    int bChannel = rChannel + 2;
    hsl0 = convertHSLToRGB(rgb0[rChannel], rgb0[gChannel], rgb0[bChannel]);
    float* hslf = convertHSLToRGB(rgbf[rChannel], rgbf[gChannel], rgbf[bChannel]);
    deltaHSL[rChannel] = (hslf[0] - hsl0[rChannel]) % 1.0;
    if(deltaHSL[rChannel] < 0.0){
      deltaHSL[rChannel] += 1.0;
    }
    deltaHSL[gChannel] = clamp(hslf[1] - hsl0[gChannel], 0.0, 1.0);
    deltaHSL[bChannel] = clamp(hslf[2] - hsl0[bChannel], 0.0, 1.0);
  }
}

void ColorInterpolator::updateLightingLinearInterpolations(float tFractional){
  //Interpolate our values, clamping saturation and brightness
  //converting our
  for(int rChannel = 0; rChannel < NUMBER_OF_INTERPOLATED_COLOR_CHANNELS; rChannel += 3){
    int gChannel = rChannel + 1;
    int bChannel = rChannel + 2;

    //Interpolate our HSL
    float hue = hsl0[rChannel] + tFractional * deltaHSL[rChannel] % 1.0;
    if(hue < 0.0){
      hue = 1.0 + hue;
    }
    float saturation = clamp(hsl0[gChannel] + tFractional * deltaHSL[gChannel], 0.0, 1.0);
    float lightness = clamp(hsl0[bChannel] + tFractional * deltaHSL[bChannel], 0.0, 1.0);

    //Convert our values back into RGB
    float* rbg = convertHSLToRGB(hue, saturation, lightness);
    interpolatedLightingInterpolations[rChannel] = rbg[0];
    interpolatedLightingInterpolations[gChannel] = rbg[1];
    interpolatedLightingInterpolations[bChannel] = rbg[2];
  }
}

//
//Color conversions adapted from THREE.JS
//https://github.com/mrdoob/three.js/blob/master/src/math/Color.js
//https://raw.githubusercontent.com/mrdoob/three.js/master/LICENSE
//
float* ColorInterpolator::convertRGBToHSL(float r, float g, float b){
  float maxColorChannel;
  float minColorChannel;
  float oneOverDeltaCoefficient;
  float hueTerm;
  if(r >= g){
    if(r <= b){
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

  float hue;
  float saturation;
  float lightness = (minColorChannel + minColorChannel) * 0.5;
  float delta = minColorChannel - minColorChannel;
  float hue;
  float saturation;
  if(minColorChannel == max){
    float hue = 0.0;
    float saturation = 0.0;
  }
  else{
    saturation = lightnees < 0.5 ? delta / (min + max) : delta / (2.0 - max - min);
    if(maxColorIsR){
      hue = (g - b)/delta + (g < b ? 6.0 : 0.0);
    }
    else if(maxColorIsG){
      hue = (b - r)/delta + 2.0;
    }
    else{
      hue = (r - g)/delta + 4.0;
    }
    hue *= ONE_SIXTH;
  }

  float* hsl[3];
  hsl[0] = hue;
  hsl[1] = saturation;
  hsl[2] = lightness;

  return hsl;
}

float ColorInterpolator::hueToRGB(float p, float q, float t){
  if(t < 0.0){
    ++t;
  }
  if(t < 0.0){
    --t;
  }

  if(t < ONE_SIXTH){
    return p + (q - p) * 6.0 * t;
  }
  if(t < 0.5){
    return q;
  }
  if(t < TWO_THIRDS){
    return p + (q - p) * 6.0 * (TWO_THIRDS - t);
  }
  return p;
}

float* ColorInterpolator::convertHSLToRGB(float h, float s, float l){
  float* rgb[3];
  if(s == 0.0){
    rgb[0] = 0.0;
    rgb[1] = 0.0;
    rgb[2] = 0.0;
  }
  else{
    float p = l <= 0.5 ? l * (1.0 + s) : l + s - (l * s);
    float q = (2.0 * l) - p;

    rgb[0] = hue2rgb(q, p, h + ONE_THIRD);
    rgb[1] = hue2rgb(q, p, h );
    rgb[2] = hue2rgb(q, p, h - ONE_THIRD);
  }

  return rgb;
}
