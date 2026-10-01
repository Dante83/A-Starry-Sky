uniform sampler2D blueNoiseTexture;
uniform sampler2D outputImage;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec2 vUv;
const float sqrtOfOneHalf = 0.7071067811865475244008443;

//From http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
float rand(float x){
  float a = 12.9898;
  float b = 78.233;
  float c = 43758.5453;
  float dt= dot(vec2(x, x) ,vec2(a,b));
  float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}

//From The Book of Shaders :D
//https://thebookofshaders.com/11/
float noise(float x){
  float i = floor(x);
  float f = fract(x);
  float y = mix(rand(i), rand(i + 1.0), smoothstep(0.0,1.0,f));

  return y;
}

//Tonemapper. SKY_TONEMAPPER must match the const of the same name in
//atmosphere-pass.glsl, and FOG_SKY_TONEMAPPER in fog-pars-fragment.glsl.
//  0  AES filmic (Narkowicz fit) -- the old default. Its shoulder starts
//     early, so sunlit cloud tops and their shadow sides get squeezed together.
//  1  Khronos PBR Neutral (default) -- linear up to 0.76, then a soft shoulder that
//     keeps hue, so lit cloud tops stay white and their bases stay dark.
//  2  AgX (Troy Sobotka, minimal fit by bwrensch) -- desaturates the brightest
//     highlights towards white the way film does, rather than skewing their hue.
const int SKY_TONEMAPPER = 1;

//Including this because someone removed this in a future version of THREE. Why?!
vec3 MyAESFilmicToneMapping(vec3 color) {
  return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
}

//https://github.com/KhronosGroup/ToneMapping/tree/main/PBR_Neutral
vec3 skyPBRNeutralToneMapping(vec3 color) {
  const float startCompression = 0.8 - 0.04;
  const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;
  float peak = max(color.r, max(color.g, color.b));
  if(peak < startCompression){
    return color;
  }
  const float d = 1.0 - startCompression;
  float newPeak = 1.0 - d * d / (peak + d - startCompression);
  color *= newPeak / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
  return mix(color, vec3(newPeak), g);
}

//https://iolite-engine.com/blog_posts/minimal_agx_implementation -- returns linear.
vec3 skyAgXToneMapping(vec3 color) {
  const mat3 agxInset = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
    0.0784335999999992, 0.878468636469772, 0.0784336,
    0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  const mat3 agxOutset = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
    -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
    -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
  const float minEv = -12.47393;
  const float maxEv = 4.026069;
  vec3 v = agxInset * max(color, vec3(0.0));
  v = (clamp(log2(max(v, vec3(1e-10))), minEv, maxEv) - minEv) / (maxEv - minEv);
  vec3 v2 = v * v;
  vec3 v4 = v2 * v2;
  v = 15.5 * v4 * v2 - 40.14 * v4 * v + 31.96 * v4 - 6.868 * v2 * v + 0.4298 * v2 + 0.1191 * v - 0.00232;
  v = agxOutset * v;
  return pow(max(v, vec3(0.0)), vec3(2.2));
}

//PBR Neutral maps mid grey (0.18) to 0.14, where AES gives 0.27. This was 1.7 to
//match AES at mid grey, but that was set while a black row in the transmittance
//table halved every cloud; with it fixed, 1.7 pushed sunlit cloud into the
//shoulder. At 1.0 the scene sits a little darker than AES and lit tops keep detail.
const float SKY_NEUTRAL_EXPOSURE = 1.0;

//Neutral has no toe: it only takes the smallest channel down, so a dark saturated
//colour keeps its dominant channel nearly linear, up to 3x brighter than under
//AES, whose toe crushed it. At night that lit the whole scene. So in the dark the
//curve hands back to AES, blending over this range of the brightest channel out.
const float SKY_NEUTRAL_TOE_START = 0.05;
const float SKY_NEUTRAL_TOE_END = 0.25;

vec3 skyToneMap(vec3 color) {
  if(SKY_TONEMAPPER == 1){
    vec3 neutral = clamp(skyPBRNeutralToneMapping(SKY_NEUTRAL_EXPOSURE * color), 0.0, 1.0);
    float toe = smoothstep(SKY_NEUTRAL_TOE_START, SKY_NEUTRAL_TOE_END, max(neutral.r, max(neutral.g, neutral.b)));
    return mix(MyAESFilmicToneMapping(color), neutral, toe);
  }
  if(SKY_TONEMAPPER == 2){
    return clamp(skyAgXToneMapping(color), 0.0, 1.0);
  }
  return MyAESFilmicToneMapping(color);
}

vec3 LinearTosRGB(vec3 value) {
  return mix(pow(value, vec3(0.41666)) * 1.055 - vec3(0.055), value * 12.92, vec3(lessThanEqual(value, vec3(0.0031308))));
}

void main(){
  float distanceFromCenter = distance(vUv, vec2(0.5));
  float falloffDisk = clamp(smoothstep(0.0, 1.0, (sqrtOfOneHalf - min(distanceFromCenter * 2.7 - 0.8, 1.0))), 0.0, 1.0);
  vec3 combinedPass = texture(outputImage, vUv).rgb;
  #ifdef HDR_INPUT
    combinedPass = LinearTosRGB(skyToneMap(combinedPass));
  #endif
#ifdef SUN_ADDITIVE
  //The sun quad holds only the sun's own light, so it is ADDED to the sky (blend
  //One, One) rather than alpha blended over it: the sun can only brighten the sky,
  //and the faint bloom tail never plates over it. Colour is premultiplied by the
  //edge falloff.
  gl_FragColor = vec4(combinedPass * falloffDisk, falloffDisk);
#else
  gl_FragColor = vec4(combinedPass, falloffDisk);
#endif
}
