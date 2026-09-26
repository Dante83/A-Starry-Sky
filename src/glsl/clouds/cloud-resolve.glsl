//Temporal resolve for the cloud map. Upsamples the half resolution march map to
//the full map and folds it into the history, so the blue noise jitter in the
//march averages away into a smooth, very slightly soft image.
//
//Because the map is indexed by direction rather than by screen pixel, turning
//the head moves nothing in it. The only reprojection left is for things that
//genuinely move the clouds relative to the viewer: the wind, and the camera
//walking around underneath them.

varying vec2 vUv;

uniform sampler2D cloudMarchMap;
uniform sampler2D cloudHistoryMap;
uniform vec2 cloudJitter;             //This frame's march jitter, in march texels
uniform vec2 cloudMarchSize;          //March map size in texels
uniform vec2 cloudMarchTexelSize;     //1 / march map size
uniform vec3 cloudReprojectionShift;  //Camera motion minus wind motion since last frame, sky frame, meters
uniform float cloudReprojectionHeight;//Middle of the low deck, meters above the observer
uniform float cloudMidReprojectionHeight; //Middle of the mid deck, meters above the observer
uniform float cloudMidSplitHeight;    //Cloud found above this is reprojected with the mid deck, meters
uniform sampler2D cloudMarchDepth;    //The march's second output: distance to the cloud in each texel, km, 0 for none
uniform float cloudEarthRadius;       //Meters
uniform float cloudCutoffDistance;    //Meters
uniform float cloudHistoryBlend;      //Weight of the new frame where this frame has a sample right here. 1.0 discards the history.
uniform vec2 cloudResolveSize;        //Resolve (output) map size in texels
uniform int cloudCheckerboardParity;  //-1 when every march texel was marched; see cloud-march.glsl

//Must match CLOUD_MAP_K in cloud-march.glsl, atmosphere-pass.glsl and CloudRenderer.js
const float CLOUD_MAP_K = 1.0723687100246826;

//How far outside the local min/max the history may sit before it is clipped, in
//standard deviations. Lower rejects ghosts harder but lets more of the march noise
//through; 1.25 is the usual compromise for noisy half resolution inputs.
const float CLOUD_TAA_VARIANCE_GAMMA = 1.25;

//Falloff of a march sample's weight with its distance from this texel, in output
//texels: exp(-k * d^2), the usual Gaussian fit to Blackman-Harris. The march map is
//half resolution, so on any one frame a texel's nearest sample sits anywhere up to
//about 1.4 output texels away. Weighting by that distance, rather than handing
//every texel the same bilinear blend of its neighbours, means each texel mostly
//learns from the frames whose jitter put a sample close to it -- which is what
//turns sixteen jittered half resolution frames into a full resolution image
//instead of a blurred half resolution one.
//2.29 is the textbook value; 3.0 leans a little further towards the nearest sample,
//which keeps more of the cauliflower detail that the nine tap reconstruction
//otherwise softens.
const float CLOUD_TAA_SAMPLE_SHARPNESS = 3.0;

vec2 cloudDirectionToUV(vec3 direction){
  return 0.5 + 0.5 * direction.xz / ((1.0 + direction.y) * CLOUD_MAP_K);
}

vec3 cloudUVToDirection(vec2 uv){
  vec2 p = (2.0 * uv - 1.0) * CLOUD_MAP_K;
  float pSquared = dot(p, p);
  return vec3(2.0 * p.x, 1.0 - pSquared, 2.0 * p.y) / (1.0 + pSquared);
}

vec3 RGBToYCoCg(vec3 c){
  return vec3(
    0.25 * c.r + 0.5 * c.g + 0.25 * c.b,
    0.5 * c.r - 0.5 * c.b,
    -0.25 * c.r + 0.5 * c.g - 0.25 * c.b
  );
}

vec3 YCoCgToRGB(vec3 c){
  return vec3(c.x + c.y - c.z, c.x + c.z, c.x - c.y - c.z);
}

//Clip towards the centre of the box rather than clamping each axis, so a history
//colour outside the box moves along the line to the local mean and keeps its hue
//(Playdead, INSIDE, GDC 2016).
vec4 clipToAABB(vec4 history, vec4 boxMin, vec4 boxMax){
  vec4 center = 0.5 * (boxMax + boxMin);
  vec4 extents = 0.5 * (boxMax - boxMin) + 1e-5;
  vec4 offset = history - center;
  vec4 unitOffset = abs(offset / extents);
  float maxUnit = max(max(unitOffset.x, unitOffset.y), max(unitOffset.z, unitOffset.w));
  return maxUnit > 1.0 ? center + offset / maxUnit : history;
}

//Catmull-Rom history fetch in nine bilinear taps (Jimenez, Filmic SMAA). The
//history is resampled at a fractional offset every frame while the wind carries
//it along, and a plain bilinear fetch softens it a little on every one of those
//resamples -- over a dozen frames that compounds into visible blur.
vec4 sampleHistoryCatmullRom(sampler2D historyMap, vec2 uv, vec2 size){
  vec2 samplePosition = uv * size;
  vec2 texPos1 = floor(samplePosition - 0.5) + 0.5;
  vec2 f = samplePosition - texPos1;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 offset12 = w2 / w12;
  vec2 texPos0 = (texPos1 - 1.0) / size;
  vec2 texPos3 = (texPos1 + 2.0) / size;
  vec2 texPos12 = (texPos1 + offset12) / size;

  vec4 result = vec4(0.0);
  result += texture(historyMap, vec2(texPos0.x, texPos0.y)) * w0.x * w0.y;
  result += texture(historyMap, vec2(texPos12.x, texPos0.y)) * w12.x * w0.y;
  result += texture(historyMap, vec2(texPos3.x, texPos0.y)) * w3.x * w0.y;
  result += texture(historyMap, vec2(texPos0.x, texPos12.y)) * w0.x * w12.y;
  result += texture(historyMap, vec2(texPos12.x, texPos12.y)) * w12.x * w12.y;
  result += texture(historyMap, vec2(texPos3.x, texPos12.y)) * w3.x * w12.y;
  result += texture(historyMap, vec2(texPos0.x, texPos3.y)) * w0.x * w3.y;
  result += texture(historyMap, vec2(texPos12.x, texPos3.y)) * w12.x * w3.y;
  result += texture(historyMap, vec2(texPos3.x, texPos3.y)) * w3.x * w3.y;

  //Catmull-Rom has negative lobes; keep them from pushing radiance or opacity below zero.
  return max(result, vec4(0.0));
}

void main(){
  vec2 p = (2.0 * vUv - 1.0);
  if(dot(p, p) > 1.0){
    gl_FragColor = vec4(0.0);
    return;
  }

  //The march texel k holds the value at (k + 0.5 + jitter) / size. Centre on the
  //one whose sample landed nearest this texel.
  vec2 marchPosition = vUv * cloudMarchSize - 0.5 - cloudJitter;
  vec2 nearestSample = floor(marchPosition + 0.5);
  ivec2 maxTexel = ivec2(cloudMarchSize) - 1;
  ivec2 centerTexel = clamp(ivec2(nearestSample), ivec2(0), maxTexel);
  vec2 marchToOutputTexels = cloudResolveSize / cloudMarchSize;

  //One pass over the 3x3 march samples around us does two jobs:
  //  - Reconstruct this frame's value here, weighting each sample by how close it
  //    landed. Using all nine rather than only the nearest keeps the per frame
  //    noise down -- a single sample at a cloud edge is either cloud or sky, and
  //    feeding that straight in is what made edges flicker. The weights are sharp
  //    enough that a sample right on top of us still dominates, which is what
  //    builds full resolution detail over the jitter sequence.
  //  - Neighbourhood statistics for clipping the history, in YCoCg so the box hugs
  //    luminance and chroma separately.
  //Under the checkerboard only four or five of the nine were marched this frame, and
  //they sit in a target half as wide; the rest are skipped. A texel whose nearest
  //sample was skipped simply gets little weight this frame, and takes the next.
  vec4 current = vec4(0.0);
  float totalSampleWeight = 0.0;
  //A softer reconstruction, for where there is no history to build on: the sharp
  //weights reduce to the nearest sample, which is blocky, and under the checkerboard
  //leaves a diamond pattern.
  vec4 softCurrent = vec4(0.0);
  float totalSoftWeight = 0.0;
  vec4 moment1 = vec4(0.0);
  vec4 moment2 = vec4(0.0);
  float sampleCount = 0.0;
  //The depth to reproject by comes from the sample nearest this texel.
  float nearestWeight = -1.0;
  ivec2 nearestTexel = ivec2(0);
  for(int y = -1; y <= 1; ++y){
    for(int x = -1; x <= 1; ++x){
      ivec2 texel = clamp(centerTexel + ivec2(x, y), ivec2(0), maxTexel);
      ivec2 storedTexel = texel;
      if(cloudCheckerboardParity >= 0){
        if(((texel.x + texel.y + cloudCheckerboardParity) & 1) != 0){
          continue;
        }
        storedTexel.x = texel.x >> 1;
      }
      vec4 s = texelFetch(cloudMarchMap, storedTexel, 0);
      vec2 offset = (marchPosition - vec2(texel)) * marchToOutputTexels;
      float distanceSquared = dot(offset, offset);
      float w = exp(-CLOUD_TAA_SAMPLE_SHARPNESS * distanceSquared);
      current += s * w;
      totalSampleWeight += w;
      float softWeight = exp(-0.5 * distanceSquared);
      softCurrent += s * softWeight;
      totalSoftWeight += softWeight;
      if(w > nearestWeight){
        nearestWeight = w;
        nearestTexel = storedTexel;
      }

      s = vec4(RGBToYCoCg(s.rgb), s.a);
      moment1 += s;
      moment2 += s * s;
      sampleCount += 1.0;
    }
  }
  current /= max(totalSampleWeight, 1e-4);
  softCurrent /= max(totalSoftWeight, 1e-4);
  //How much evidence this frame has for this texel, ~1 when a sample sits on top
  //of it, less between samples.
  float sampleWeight = clamp(totalSampleWeight, 0.0, 1.0);
  vec4 mean = moment1 / sampleCount;
  vec4 sigma = sqrt(max(moment2 / sampleCount - mean * mean, 0.0));
  vec4 boxMin = mean - CLOUD_TAA_VARIANCE_GAMMA * sigma;
  vec4 boxMax = mean + CLOUD_TAA_VARIANCE_GAMMA * sigma;

  //Reproject. The point that is here now was at (here + shift) relative to last frame's
  //camera, and how far that moves it across the sky goes inversely with its distance --
  //taken here as the distance to the middle of its own deck. One sphere for everything
  //moved the mid deck's history more than twice as far as it had gone, and the clip
  //snapping it back read as a shimmer over the whole sky. But the march's own depth, per
  //texel, is worse inside a cloud: it is the mean of a lump and the core behind it, and
  //jumps between them from one texel to the next, so neighbouring texels of one cloud
  //had their history moved by different amounts. The history tore a little every frame
  //and the clip pulled it back: the middles of moving cumulus bobbed. So the march's depth
  //only says which deck a texel belongs to, and each deck moves as one.
  vec3 direction = cloudUVToDirection(vUv);
  float r = cloudEarthRadius;
  float mu = max(direction.y, 0.0);
  float h = cloudReprojectionHeight;
  float marchDepth = texelFetch(cloudMarchDepth, nearestTexel, 0).r * 1000.0;
  if(marchDepth > 0.0){
    float hitHeight = sqrt(r * r + marchDepth * marchDepth + 2.0 * r * marchDepth * mu) - r;
    h = hitHeight > cloudMidSplitHeight ? cloudMidReprojectionHeight : h;
  }
  float depth = -r * mu + sqrt(r * r * mu * mu + 2.0 * r * h + h * h);
  depth = min(depth, cloudCutoffDistance);
  vec3 previousDirection = normalize(direction * depth + cloudReprojectionShift);
  vec2 previousUV = cloudDirectionToUV(previousDirection);
  vec2 previousP = 2.0 * previousUV - 1.0;
  bool historyValid = previousDirection.y > -0.07 && dot(previousP, previousP) <= 1.0;

  vec4 result;
  if(!historyValid || cloudHistoryBlend >= 1.0){
    //Nothing to accumulate against, so reconstruct from this frame alone, smoothly.
    result = softCurrent;
  }
  else{
    //Longer history towards the horizon. There a sub texel of jitter swings the ray
    //from one cloud to another kilometres behind it, so each frame differs a lot and
    //the far clouds shimmered; but distant clouds barely move across the sky, with
    //the wind or with the camera, so a longer history there costs no ghosting.
    float blend = cloudHistoryBlend * sampleWeight * mix(0.33, 1.0, smoothstep(0.0, 0.2, direction.y));
    vec4 history = sampleHistoryCatmullRom(cloudHistoryMap, previousUV, cloudResolveSize);
    history = vec4(RGBToYCoCg(history.rgb), history.a);
    history = clipToAABB(history, boxMin, boxMax);
    history = vec4(YCoCgToRGB(history.rgb), history.a);

    //A plain lerp, deliberately. The usual luminance weighted blend (Karis) assumes
    //every sample is a colour over the same background; here clear sky is stored
    //as zero, which that weighting treats as the most trustworthy sample of all, so
    //every cloud edge got dragged towards empty -- thin, eroded, flickering clouds.
    //The map is premultiplied, so a straight average is exactly right.
    result = mix(history, current, blend);
  }

  gl_FragColor = max(result, vec4(0.0));
}
