//The aurora's curtains, baked once per frame into three strips 4096 texels long
//and one high, one arc of the auroral oval per channel. A curtain is a sheet a
//few kilometres thick hanging along the magnetic field, running thousands of
//kilometres east to west, so everything about it is a function of one number:
//how far along the arc (magnetic east) you are, in kilometres from the observer.
//  location 0 -- how far the arc has folded poleward there (km). The oval's own
//                bend is added in the march, where it runs to 2000km and more,
//                far past what a half float holds to the kilometre.
//  location 1 -- how bright the arc is there, 0 to 1
//  location 2 -- the bright vertical rays, 0 to 1
//aurora-march.glsl reads them back with mipmaps, so a step that jumps many texels
//along the arc averages them instead of point sampling.
//
//AURORA_CURTAIN_U_RANGE must match aurora-march.glsl.

varying vec2 vUv;

//The aurora's own clock, in seconds: the wall clock run faster or slower with the
//storm (AuroraRenderer.js). It is integrated, not scaled, so a storm that
//strengthens moves the curtains faster from where they are instead of jumping.
uniform float auroraTime;
//How far the arcs fold, against AURORA_FOLD_AMPLITUDE: more in a strong storm.
uniform float auroraFoldScale;

layout(location = 1) out highp vec4 auroraArcBrightness;
layout(location = 2) out highp vec4 auroraArcRays;

const float AURORA_CURTAIN_U_RANGE = 6400.0;

//Folds, km of poleward displacement at three scales: the great loops, the folds,
//and the small curls. The time rates are per second of wall clock.
const vec3 AURORA_FOLD_AMPLITUDE = vec3(70.0, 25.0, 6.0);
const vec3 AURORA_FOLD_WAVELENGTH = vec3(500.0, 150.0, 40.0);
const vec3 AURORA_FOLD_RATE = vec3(0.004, 0.012, 0.03);

//Rays, km across, and how fast they walk along the arc in noise cycles a second.
const vec2 AURORA_RAY_WIDTH = vec2(6.0, 20.0);
const float AURORA_RAY_DRIFT = 0.3;
//How dark the gaps between rays get, 0 (no rays) to 1 (black gaps).
const float AURORA_RAY_CONTRAST = 0.65;

//Each arc is brighter in some stretches than others, over this many km.
const float AURORA_BRIGHTNESS_WAVELENGTH = 900.0;
const float AURORA_BRIGHTNESS_RATE = 0.003;
//Peak brightness of each of the four arcs.
const vec4 AURORA_ARC_WEIGHT = vec4(0.6, 1.0, 0.8, 0.4);

//Hash without sine (Dave Hoskins, https://www.shadertoy.com/view/4djSRW, MIT
//License). The usual fract(sin(x) * 43758) falls apart once x reaches the
//thousands, and the time terms here get there within the hour.
vec2 hash(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return 2.0 * fract((p3.xx + p3.yz) * p3.zy) - 1.0;
}

//Simplex noise from https://www.shadertoy.com/view/Msf3WH (MIT License)

float simplexNoise(vec2 p){
  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
  const float K2 = 0.211324865; // (3-sqrt(3))/6;

  vec2  i = floor(p + (p.x + p.y) * K1);
  vec2  a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2  o = vec2(m, 1.0 - m);
  vec2  b = a - o + K2;
  vec2  c = a - 1.0 + 2.0 * K2;
  vec3  h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c) ), 0.0);
  vec3  n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));

  return dot(n, vec3(70.0));
}

void main(){
  float u = (vUv.x - 0.5) * AURORA_CURTAIN_U_RANGE;
  float t = auroraTime;

  vec4 fold;
  vec4 brightness;
  vec4 rays;
  for(int k = 0; k < 4; ++k){
    float seed = float(k);

    //Where the arc sits: three octaves of folding.
    vec3 amplitude = AURORA_FOLD_AMPLITUDE * auroraFoldScale;
    float f = amplitude.x * simplexNoise(vec2(u / AURORA_FOLD_WAVELENGTH.x, t * AURORA_FOLD_RATE.x + seed * 11.3));
    f += amplitude.y * simplexNoise(vec2(u / AURORA_FOLD_WAVELENGTH.y + seed * 5.7, t * AURORA_FOLD_RATE.y + seed * 3.1));
    f += amplitude.z * simplexNoise(vec2(u / AURORA_FOLD_WAVELENGTH.z, t * AURORA_FOLD_RATE.z + seed * 1.7));
    fold[k] = f;

    //Stretches of the arc brighten and fade.
    float b = simplexNoise(vec2(u / AURORA_BRIGHTNESS_WAVELENGTH + seed * 2.3, t * AURORA_BRIGHTNESS_RATE + seed * 4.1));
    brightness[k] = AURORA_ARC_WEIGHT[k] * smoothstep(-0.35, 0.5, b);

    //Rays: two widths, walking along the arc, squared so they read as bright
    //streaks over darker gaps rather than a soft ripple.
    float r1 = simplexNoise(vec2(u / AURORA_RAY_WIDTH.x - t * AURORA_RAY_DRIFT, seed * 9.1 + t * 0.05));
    float r2 = simplexNoise(vec2(u / AURORA_RAY_WIDTH.y + t * 0.3 * AURORA_RAY_DRIFT, seed * 6.7 + t * 0.02));
    float r = clamp(0.5 + 0.5 * (0.6 * r1 + 0.4 * r2), 0.0, 1.0);
    rays[k] = (1.0 - AURORA_RAY_CONTRAST) + AURORA_RAY_CONTRAST * r * r;
  }

  gl_FragColor = fold;
  auroraArcBrightness = brightness;
  auroraArcRays = rays;
}
