//Cloud density, shared by every pass that needs to know where the clouds are: the
//sky map march (cloud-march.glsl) today, and the cloud shadow map for the ground.
//Keeping one copy is what guarantees that the shadows on the ground belong to the
//clouds in the sky.
//
//The recipe is the one every shipped real-time cloud renderer converged on --
//Schneider's Nubis (Horizon Zero Dawn, SIGGRAPH 2015/2017), Hillaire's Frostbite
//clouds (2016), and takram-design-engineering's three-clouds (MIT), whose constants
//these follow most closely, since it runs on WebGL2 like we do:
//
//  1. A 2D weather map says where clouds stand (Worley footprints) and what species
//     they are.
//  2. Coverage is applied through a height profile that is widest low down and
//     rounds over at the top, with a SOFT threshold 0.6 wide: density rises
//     gradually from the edge of a cloud into its core instead of stepping to full
//     at a surface.
//  3. A 3D shape noise ERODES that with a remap, remap(d, 1 - shape, 1): it can only
//     take density away, and it takes least where the cloud is densest, so cores
//     stay solid while the edges billow. (Multiplying or adding noise instead gives
//     sponge -- Schneider's own warning.)
//  4. A finer detail noise erodes the edges again: wispy at the base of a cloud,
//     billowy at the top.
//  5. Density grows towards the top (0.75 h + 0.25), so tops are brighter and
//     sharper than bases.
//
//This replaced a hand built height field with octaves in meters. Its hard 40m
//surface was thinner than one march step, so every ray met it at a random depth
//and the clouds came out speckled and flat however the lighting was tuned.
//
//Coordinates: a local frame in meters with the observer at the origin, y up, and
//the planet centre at (0, -cloudObserverRadius, 0). Heights are measured from the
//observer. The layers are spherical shells, so clouds follow the curve of the Earth
//down to the horizon.

uniform sampler3D cloudBaseNoise;
uniform sampler3D cloudDetailNoise;
uniform sampler2D cloudWeatherMap;
uniform float cloudCoverage;            //0..1
uniform float cloudType;                //0 stratus .. 0.5 cumulus .. 1 cumulonimbus
uniform float cloudStartHeight;         //Meters above the observer: the condensation level, where cumulus bases sit
uniform float cloudEndHeight;           //Meters above the observer: nothing builds above this
uniform float cloudFadeInEndPercent;    //0..1 of each species' depth
uniform float cloudFadeOutStartPercent; //0..1 of each species' depth
uniform float cloudCutoffDistance;      //Meters. Clouds fade out approaching this.
uniform float cloudObserverRadius;      //Meters from the planet centre to the observer
uniform vec2 cloudNoiseOffset;          //Camera position minus wind drift, sky frame x/z, wrapped
uniform vec2 cloudWindDirection;        //Unit vector the clouds drift along, sky frame x/z
uniform float midCloudCoverage;         //0..1, the mid deck (see MID DECK below)
uniform float midCloudType;             //0 altocumulus .. 1 altostratus
uniform float midCloudHeight;           //Meters above the observer: the mid deck's base

//Tile sizes, meters. CLOUD_NOISE_WRAP in CloudRenderer.js (360km) must be a whole
//multiple of every one of them -- the shape and weather tiles times any value
//cloudShapeScale can take -- or the wind offset wrapping back to zero would jump
//the clouds. takram uses 3.3km and 167m for the shape and detail tiles; these are
//the nearest sizes that divide the wrap.
const float CLOUD_SHAPE_TILE = 3000.0;
const float CLOUD_DETAIL_TILE = 200.0;
const float CLOUD_WEATHER_TILE = 60000.0;

//How far the weather map may move local coverage and species away from the tag
//values. Coverage variation fades out towards 0% and 100% so that a clear sky stays
//clear and an overcast one stays overcast.
const float CLOUD_COVERAGE_VARIATION = 0.6;
const float CLOUD_TYPE_VARIATION = 0.3;

//takram's layer defaults.
//  COVERAGE_FILTER_WIDTH  how soft the coverage threshold is: the density climbs from
//                         0 to 1 over this much of the footprint's range. Softness
//                         here is what gives a cloud a core and an edge.
//  SHAPE_ALTERING_BIAS    the height profile is 1 - (2 h^bias - 1)^2 above
//                         h = 0.5^(1/bias), a quarter of the way up, rounding over
//                         to the top, and full width below it. takram's 0.35 puts that at 14%, which for a
//                         layer as deep as ours made every cumulus a candle flame.
//  SHAPE_AMOUNT           how hard the shape noise erodes
//  DETAIL_AMOUNT          how hard the detail noise erodes
const float CLOUD_COVERAGE_FILTER_WIDTH = 0.6;
const float CLOUD_SHAPE_ALTERING_BIAS = 0.5;
const float CLOUD_SHAPE_AMOUNT = 1.0;
const float CLOUD_DETAIL_AMOUNT = 1.0;

//The tag coverage is the fraction of the sky the clouds cover. The coverage the
//recipe thresholds with is not: the footprints, the soft edges and the height
//profile bunch it, so 0.2 already covered 70% of the sky. These are the
//recipe coverages that cover 0%, 10% ... 100% of the sky, looking straight down on
//cumulus, measured with the density probe. Towering species fill more sky at the
//same value, since their tops overhang, so they sit a little lower
//(CLOUD_TOWERING_COVERAGE_OFFSET). Re-measure whenever the recipe changes.
const float CLOUD_COVERAGE_TABLE[11] = float[11](0.0, 0.082, 0.097, 0.112, 0.126, 0.139, 0.154, 0.171, 0.191, 0.223, 0.45);
//The same for stratiform decks. Their footprint never falls below half (so that
//the coverage can close them into an overcast), which bunched the heap table
//further still: 10% on the tag covered 28% of the sky and 90% only 87%. Measured
//on stratus the same way; blended in with the stratiform weight.
const float CLOUD_STRATIFORM_COVERAGE_TABLE[11] = float[11](0.0, 0.036, 0.066, 0.090, 0.111, 0.131, 0.151, 0.172, 0.194, 0.221, 0.35);
const float CLOUD_TOWERING_COVERAGE_OFFSET = 0.008;

//Extinction at full density, per meter. takram's 0.2 -- the dense end of real
//cumulus (0.05 to 0.2/m) -- but since the soft threshold and the erosion leave most
//of a cloud well under full density, a typical core sits near 0.05 to 0.1.
const float CLOUD_DENSITY_SCALE = 0.2;

//Past a few tens of kilometres the detail noise is sub pixel and would only shimmer.
const float CLOUD_DETAIL_FADE_START = 15000.0;
const float CLOUD_DETAIL_FADE_END = 50000.0;

//Means of the two detail modifiers over the whole detail texture, pow(d, 6) and
//1 - d, measured. Where the detail is not sampled -- in the distance, and in the
//cheap density used for shadows -- the erosion runs with these instead, so the
//density keeps the same average. Skipping the erosion outright skipped its doubling
//too: distant clouds and every far shadow sample came out at half density.
const float CLOUD_DETAIL_MEAN_WISPY = 0.15;
const float CLOUD_DETAIL_MEAN_BILLOWY = 0.3;

//Clouds thin out over the last 40% of the cutoff distance rather than stopping at a
//wall, and the atmospheric perspective in the march melts what is left into the sky.
const float CLOUD_FAR_FADE_START_FRACTION = 0.6;

float cloudRemap(float x, float a, float b, float c, float d){
  return c + (x - a) * (d - c) / (b - a);
}

float cloudLinearGradient(float zeroHeight, float oneHeight, float x){
  return clamp((x - zeroHeight) / (oneHeight - zeroHeight), 0.0, 1.0);
}

//Height above the observer of a point in the local frame. Written so the planet
//radius cancels exactly: |q - centre| - R = (2 R q.y + q.q) / (|q - centre| + R).
//The obvious length() - R throws away most of a float's precision at 6.4e6 meters.
float cloudHeight(vec3 q){
  float s = 2.0 * cloudObserverRadius * q.y + dot(q, q);
  return s / (sqrt(cloudObserverRadius * cloudObserverRadius + s) + cloudObserverRadius);
}

//Local vertical at a point -- for a cloud a hundred kilometres away the sun sits more
//than a degree higher or lower than it does for the observer.
vec3 cloudLocalUp(vec3 q){
  return normalize(vec3(q.x, q.y + cloudObserverRadius, q.z));
}

//Distance along a ray, from the observer, to the shell at height H above them.
//The observer is always below the shell, so there is exactly one forward hit. This
//is the root of t^2 + 2 R mu t - H (2R + H) = 0, rearranged so it never subtracts
//two nearly equal large numbers.
float cloudDistanceToHeight(float mu, float H){
  float b = cloudObserverRadius * mu;
  float c = H * (2.0 * cloudObserverRadius + H);
  return c / (b + sqrt(b * b + c));
}

//Where each kind of cloud lives and how big it grows, from the meteorology. The base
//and depth columns must match SPECIES_BASE_FRACTIONS and SPECIES_DEPTHS in
//CloudRenderer.js.
//  base   its base, as a fraction of <sky-cloud-start-height>, the condensation
//         level. Cumuliform bases sit right on it; stratus forms lower down.
//  depth  the tallest it builds above its base, meters, capped by
//         <sky-cloud-end-height>
//  scale  how much larger its footprints and shape noise are than a cumulus's. A
//         cloud is roughly as wide as it is tall, so a 10km tower on a cumulus
//         footprint is a needle, and built from cumulus sized billows it reads as a
//         stack of popcorn.
//                                                 base   depth   scale
const float CLOUD_STRATUS[3]       = float[3](0.40,   400.0, 1.0);
const float CLOUD_STRATOCUMULUS[3] = float[3](0.80,   700.0, 1.0);
const float CLOUD_CUMULUS[3]       = float[3](1.00,  1500.0, 1.0);
const float CLOUD_CONGESTUS[3]     = float[3](1.00,  5000.0, 2.0);
const float CLOUD_CUMULONIMBUS[3]  = float[3](1.00, 10000.0, 3.0);

float cloudSpeciesKey(float type, int k){
  float s = clamp(type, 0.0, 1.0) * 4.0;
  if(s < 1.0) return mix(CLOUD_STRATUS[k], CLOUD_STRATOCUMULUS[k], s);
  if(s < 2.0) return mix(CLOUD_STRATOCUMULUS[k], CLOUD_CUMULUS[k], s - 1.0);
  if(s < 3.0) return mix(CLOUD_CUMULUS[k], CLOUD_CONGESTUS[k], s - 2.0);
  return mix(CLOUD_CONGESTUS[k], CLOUD_CUMULONIMBUS[k], s - 3.0);
}

float cloudSpeciesBase(float type){
  return cloudStartHeight * cloudSpeciesKey(type, 0);
}

float cloudSpeciesTop(float type){
  return min(cloudSpeciesBase(type) + cloudSpeciesKey(type, 1), cloudEndHeight);
}

//The species within reach of the weather map's variation. Bases and tops both rise
//with the type, so the lowest base and the highest top come from the two ends.
float cloudShellBaseHeight(){
  return cloudSpeciesBase(clamp(cloudType - 0.5 * CLOUD_TYPE_VARIATION, 0.0, 1.0));
}

float cloudShellTopHeight(){
  return cloudSpeciesTop(clamp(cloudType + 0.5 * CLOUD_TYPE_VARIATION, 0.0, 1.0));
}

//The scale of the footprints and the shape noise, from the TAG species rather than
//the local one: a scale that varies from place to place warps the field more and
//more the further it is from the origin. Quantized to 6 / n, so that
//CLOUD_NOISE_WRAP (360km, 6 weather tiles) is still a whole number of scaled tiles.
float cloudShapeScale(){
  float raw = cloudSpeciesKey(cloudType, 2);
  return 6.0 / max(round(6.0 / raw), 1.0);
}

//How much coarser the march may step for bigger species: 1 for cumulus, 1.7 for a
//cumulonimbus, whose billows are three times the size.
float cloudStepScale(){
  return sqrt(cloudShapeScale());
}

//How much a species is a spreading sheet rather than a heap: 1 for stratus, 0 from
//cumulus up.
float cloudStratiformWeight(float type){
  return 1.0 - smoothstep(0.1, 0.4, type);
}

float cloudRecipeCoverage(float coverage, float type){
  float x = clamp(coverage, 0.0, 1.0) * 10.0;
  int i = min(int(x), 9);
  float heaps = mix(CLOUD_COVERAGE_TABLE[i], CLOUD_COVERAGE_TABLE[i + 1], x - float(i));
  float sheets = mix(CLOUD_STRATIFORM_COVERAGE_TABLE[i], CLOUD_STRATIFORM_COVERAGE_TABLE[i + 1], x - float(i));
  float k = mix(heaps, sheets, cloudStratiformWeight(type));
  return max(k - CLOUD_TOWERING_COVERAGE_OFFSET * smoothstep(0.5, 1.0, type), 0.0);
}

//Everything the 2D weather map and the height decide, before any 3D noise.
struct CloudWeather {
  float density;        //Coverage through the height profile, 0..1; 0 means no cloud here
  float heightFraction; //0 at the base, 1 at the top of this column's species
  float fade;           //Distance and layer fades, and the height density profile
  float detailWeight;   //How much of the detail noise applies at this distance
  vec3 noisePosition;   //Meters, wind and camera offset applied
};

CloudWeather cloudSampleWeather(vec3 q, float distance){
  CloudWeather weather;
  weather.density = 0.0;
  weather.heightFraction = 0.0;
  weather.fade = 0.0;
  weather.detailWeight = 0.0;
  float h = cloudHeight(q);
  weather.noisePosition = vec3(q.x + cloudNoiseOffset.x, h, q.z + cloudNoiseOffset.y);

  //Cheapest rejection first: below any base, above anything that can tower, or past
  //the cutoff.
  if(h <= cloudShellBaseHeight() || h >= cloudShellTopHeight() || distance >= cloudCutoffDistance || cloudCoverage <= 0.0){
    return weather;
  }

  vec4 map = texture(cloudWeatherMap, weather.noisePosition.xz / CLOUD_WEATHER_TILE);
  float c = cloudCoverage;
  float coverage = clamp(c + (map.b - 0.5) * CLOUD_COVERAGE_VARIATION * 4.0 * c * (1.0 - c), 0.0, 1.0);
  float type = clamp(cloudType + (map.a - 0.5) * CLOUD_TYPE_VARIATION, 0.0, 1.0);

  float speciesBase = cloudSpeciesBase(type);
  float layerDepth = cloudSpeciesTop(type) - speciesBase;
  float hf = (h - speciesBase) / max(layerDepth, 1.0);
  if(hf <= 0.0 || hf >= 1.0 || coverage <= 0.0){
    return weather;
  }
  weather.heightFraction = hf;

  //Footprints: stratiform decks spread from the kilometres wide coverage field;
  //heaps stand on the Worley footprints, scaled up with the species.
  float stratiform = cloudStratiformWeight(type);
  float shapeScale = cloudShapeScale();
  float heaps = shapeScale == 1.0 ? map.r : texture(cloudWeatherMap, weather.noisePosition.xz / (CLOUD_WEATHER_TILE * shapeScale)).r;
  //A deck's footprint never falls to zero, so the coverage can close it into an
  //overcast: with the full 0..1 range, 90% on the tag covered only 40% of the sky.
  float sheet = 0.5 + 0.5 * smoothstep(0.2, 0.8, map.b);
  float footprint = mix(heaps, sheet, stratiform);

  //takram / Skybolt: coverage through a height profile, with a soft threshold. A
  //sheet keeps a flatter profile than a heap.
  float bias = mix(CLOUD_SHAPE_ALTERING_BIAS, 1.0, stratiform);
  //Held at full width below its widest point: cumulus bases are flat, sitting on the
  //condensation level. Tapered below it too, as takram's is for its thin layers,
  //the underside of a deep cloud was a shallow cone, and looking up at it we saw
  //the shape noise cut on the slant, as a sheet of leopard spots.
  float x = max(pow(hf, bias) * 2.0 - 1.0, 0.0);
  float heightScale = 1.0 - x * x;
  //
  //Then normalized by the most it could be at this height, so that it runs from 0
  //at the edge of a cloud to 1 at its heart whatever the coverage -- Nubis' dimensional
  //profile. Where the edges fall is unchanged. Without this, the cores of a sparse
  //sky only reached about 0.4, and the shape erosion below hollowed every cloud out
  //into popcorn.
  float reach = max(cloudRecipeCoverage(coverage, type) * heightScale, 1e-4);
  float threshold = 1.0 - reach;
  float profile = cloudRemap(mix(footprint, 1.0, CLOUD_COVERAGE_FILTER_WIDTH), threshold, threshold + CLOUD_COVERAGE_FILTER_WIDTH, 0.0, 1.0);
  weather.density = clamp(profile * CLOUD_COVERAGE_FILTER_WIDTH / reach, 0.0, 1.0);

  //The fade tags: the top goes out over the fade-out fraction, and the fade-in
  //softens the base over a quarter of its fraction (about 40m for cumulus at the
  //default 10%) -- cumulus bases are flat and fairly crisp.
  float farFade = 1.0 - smoothstep(CLOUD_FAR_FADE_START_FRACTION * cloudCutoffDistance, cloudCutoffDistance, distance);
  float layerFade = cloudLinearGradient(1.0, cloudFadeOutStartPercent, hf) * cloudLinearGradient(0.0, max(0.25 * cloudFadeInEndPercent, 1e-3), hf);
  weather.fade = farFade * layerFade * (0.75 * hf + 0.25);
  weather.detailWeight = 1.0 - smoothstep(CLOUD_DETAIL_FADE_START, CLOUD_DETAIL_FADE_END, distance);
  return weather;
}

//The shape noise erosion. Remapping (rather than multiplying) takes the least from
//the densest parts, so a cloud's core survives and only its edges billow.
//
//It comes in over the bottom fifth of the cloud. The height profile thins the
//cloud towards its base, and the erosion punched holes through it there: looking up
//at a cumulus we saw its flat base as a sheet of leopard spots. Real bases are flat
//and solid -- they are the condensation level.
const float CLOUD_BASE_EROSION = 0.3;
float cloudErodeShape(CloudWeather weather, float tile, float strength){
  float shape = texture(cloudBaseNoise, weather.noisePosition / tile).r;
  float amount = strength * mix(CLOUD_BASE_EROSION, 1.0, cloudLinearGradient(0.0, 0.2, weather.heightFraction));
  return clamp(cloudRemap(weather.density, (1.0 - shape) * amount, 1.0, 0.0, 1.0), 0.0, 1.0);
}

float cloudErodeShape(CloudWeather weather){
  return cloudErodeShape(weather, CLOUD_SHAPE_TILE * cloudShapeScale(), CLOUD_SHAPE_AMOUNT);
}

//True when there might be cloud here, for the empty space skip: never false where the
//full density is above zero, since the erosion only ever takes density away.
bool cloudLowMayHaveDensity(vec3 q, float distance){
  CloudWeather weather = cloudSampleWeather(q, distance);
  return weather.density * weather.fade > 0.0;
}

//The detail erosion, from takram. The modifier mixes from wispy at the bottom, where
//the eroded bits are thin strands (detail^6), to billowy at the top, where they are
//rounded knobs (1 - detail).
float cloudErodeDetail(float density, float modifier){
  return clamp(cloudRemap(density * 2.0, modifier * 0.5, 1.0, 0.0, 1.0), 0.0, 1.0);
}

//Extinction per meter without the detail noise, for shadow and occlusion samples far
//enough away that the detail cannot matter: the detail erosion runs on its mean.
float cloudLowDensityCheap(vec3 q, float distance){
  CloudWeather weather = cloudSampleWeather(q, distance);
  if(weather.density * weather.fade <= 0.0){
    return 0.0;
  }
  float billowy = cloudLinearGradient(0.2, 0.4, weather.heightFraction);
  float modifier = mix(CLOUD_DETAIL_MEAN_WISPY, CLOUD_DETAIL_MEAN_BILLOWY, billowy) * CLOUD_DETAIL_AMOUNT;
  return cloudErodeDetail(cloudErodeShape(weather), modifier) * weather.fade * CLOUD_DENSITY_SCALE;
}

//Full extinction per meter, with the detail erosion. heightFraction is 0 at the base,
//1 at the top of this column's species.
float cloudLowDensityFull(vec3 q, float distance, out float heightFraction){
  CloudWeather weather = cloudSampleWeather(q, distance);
  heightFraction = weather.heightFraction;
  if(weather.density * weather.fade <= 0.0){
    return 0.0;
  }
  float density = cloudErodeShape(weather);
  if(density <= 0.0){
    return 0.0;
  }

  //Out where the detail fades, its modifier fades to the mean rather than to nothing.
  float billowy = cloudLinearGradient(0.2, 0.4, weather.heightFraction);
  float modifier = mix(CLOUD_DETAIL_MEAN_WISPY, CLOUD_DETAIL_MEAN_BILLOWY, billowy);
  if(weather.detailWeight > 0.0){
    float detail = texture(cloudDetailNoise, weather.noisePosition / CLOUD_DETAIL_TILE).r;
    modifier = mix(modifier, mix(pow(detail, 6.0), 1.0 - detail, billowy), weather.detailWeight);
  }
  density = cloudErodeDetail(density, modifier * CLOUD_DETAIL_AMOUNT);
  return density * weather.fade * CLOUD_DENSITY_SCALE;
}

//MID DECK -- altocumulus and altostratus, 2 to 7km up, over whatever the low deck is
//doing. Real skies layer like this: fair weather cumulus under a mackerel sky, or
//cumulus drifting under the grey sheet of an advancing warm front.
//
//Both are water droplet clouds, so they are built with the same recipe as the low
//deck, only smaller and thinner (WMO International Cloud Atlas; Houze, Cloud
//Dynamics, ch. 6):
//  altocumulus  cells mostly 1 to 5 degrees wide seen above 30 degrees elevation --
//               a few hundred meters at 4km -- in a layer 200 to 700m deep, in
//               patches with sky between them, and SHADED on their undersides (which
//               is what tells them from cirrocumulus, which is too thin to shade).
//  altostratus  a grey sheet 1 to 2km deep and nearly featureless, thin enough in
//               its translucidus form that the sun shows through as if through
//               ground glass, with no halo.
//midCloudType blends between the two: the footprints go from cells to a sheet, the
//layer deepens, the erosion softens and the extinction drops.
//
//Tiles, meters. Like the low deck's, each must divide CLOUD_NOISE_WRAP (360km).
//  FOOTPRINT  the weather footprints (16 cells a tile) at this tile are 375m cells
//  CLUMP      the same footprints 1.5km across, which gather the cells into rafts
//  PATCH      the coverage variation, kilometres wide, so cells come in patches
//  SHAPE      the shape noise, in proportion to the cells as it is for cumulus
//  DETAIL     the detail noise, half the low deck's for the smaller billows
const float MID_CLOUD_FOOTPRINT_TILE = 6000.0;
const float MID_CLOUD_CLUMP_TILE = 24000.0;
const float MID_CLOUD_PATCH_TILE = 30000.0;
const float MID_CLOUD_SHAPE_TILE = 300.0;
const float MID_CLOUD_DETAIL_TILE = 100.0;
//Offsets into the weather map, so the mid deck's patches are not the low deck's.
const vec2 MID_CLOUD_PATCH_OFFSET = vec2(17000.0, 41000.0);

//Patches: altocumulus comes in fields with clear sky between, so the coverage varies
//more across the sky than it does for the low deck.
const float MID_CLOUD_COVERAGE_VARIATION = 1.0;
const float MID_CLOUD_CLUMP_WEIGHT = 0.5;

//Rows (undulatus): billow waves in the wind shear line the cells up in crests
//across the wind, about a kilometre apart, in some parts of the sky and not
//others. A zero mean wave, so the coverage holds, bent by the clump field so the
//crests wander. At twice this strength the rows ran long, straight and evenly
//spaced, and read as combed rather than as cloud. The wave is not periodic in the
//360km noise wrap unless the wind is axis aligned, so the rows jump once per wrap.
const float MID_CLOUD_ROW_WAVELENGTH = 1000.0;
const float MID_CLOUD_ROW_STRENGTH = 0.1;
const float MID_CLOUD_ROW_BEND = 12.0;

//                                        Ac       As
//Altocumulus cells are lenses, several times wider than they are deep: at 500m
//deep, as deep as the cells were wide, they stood up as pillars towards the
//horizon, where real ones flatten into stripes.
const vec2 MID_CLOUD_DEPTH           = vec2(250.0, 1500.0); //Meters
//Extinction at full density, per meter. Altocumulus holds 0.1 to 0.3 g/m^3 of water
//in droplets of 5 to 10 microns, 1.5 LWC / (rho r) = 0.04 to 0.09/m, and the soft
//threshold leaves a typical core at about half of full density. At 0.05 the cells
//were cotton wool, lit right through; at 0.12 their thick middles went grey under
//bright thin rims, as real ones do seen from below, but low sunlight crossing a cell
//sideways only lit a thin, harsh orange rim before sunset. 0.08 sits between.
//Altostratus is thinner still per meter but deeper: 10 or so through the layer, the
//ground glass sun.
const vec2 MID_CLOUD_DENSITY_SCALE   = vec2(0.08, 0.008);
//Full erosion broke each altocumulus cell into cauliflower lumps; real cells are
//smoother lenses. Altostratus is close to featureless: any real erosion carves it
//into billows, and it reads as a sky of big stratocumulus instead of a sheet.
const vec2 MID_CLOUD_SHAPE_AMOUNT    = vec2(0.7, 0.08);
const vec2 MID_CLOUD_DETAIL_AMOUNT   = vec2(0.7, 0.1);

float midCloudKey(vec2 key){
  return mix(key.x, key.y, midCloudType);
}

//The recipe coverages that cover 0%, 10% ... 100% of the sky with each, as the
//low deck's tables do: the fraction of columns more than half opaque looking
//straight up, measured with the density probe over 3 x 60km squares. Borrowing
//the low deck's tables, 50% on the tag covered 40% of the sky with altocumulus
//and 57% with altostratus. Re-measure whenever the mid recipe changes.
const float MID_CLOUD_AC_COVERAGE_TABLE[11] = float[11](0.0, 0.102, 0.117, 0.128, 0.139, 0.149, 0.160, 0.172, 0.187, 0.208, 0.32);
const float MID_CLOUD_AS_COVERAGE_TABLE[11] = float[11](0.0, 0.032, 0.057, 0.078, 0.097, 0.115, 0.133, 0.151, 0.171, 0.194, 0.232);

float midCloudRecipeCoverage(float coverage){
  float x = clamp(coverage, 0.0, 1.0) * 10.0;
  int i = min(int(x), 9);
  float cells = mix(MID_CLOUD_AC_COVERAGE_TABLE[i], MID_CLOUD_AC_COVERAGE_TABLE[i + 1], x - float(i));
  float sheet = mix(MID_CLOUD_AS_COVERAGE_TABLE[i], MID_CLOUD_AS_COVERAGE_TABLE[i + 1], x - float(i));
  return mix(cells, sheet, midCloudType);
}

float midCloudBase(){
  return midCloudHeight;
}

float midCloudTop(){
  return midCloudHeight + midCloudKey(MID_CLOUD_DEPTH);
}

CloudWeather midCloudSampleWeather(vec3 q, float distance){
  CloudWeather weather;
  weather.density = 0.0;
  weather.heightFraction = 0.0;
  weather.fade = 0.0;
  weather.detailWeight = 0.0;
  float h = cloudHeight(q);
  weather.noisePosition = vec3(q.x + cloudNoiseOffset.x, h, q.z + cloudNoiseOffset.y);
  float base = midCloudBase();
  if(h <= base || h >= midCloudTop() || distance >= cloudCutoffDistance || midCloudCoverage <= 0.0){
    return weather;
  }
  float hf = (h - base) / midCloudKey(MID_CLOUD_DEPTH);
  weather.heightFraction = hf;

  vec4 patches = texture(cloudWeatherMap, (weather.noisePosition.xz + MID_CLOUD_PATCH_OFFSET) / MID_CLOUD_PATCH_TILE);
  float c = midCloudCoverage;
  float coverage = clamp(c + (patches.b - 0.5) * MID_CLOUD_COVERAGE_VARIATION * 4.0 * c * (1.0 - c), 0.0, 1.0);
  if(coverage <= 0.0){
    return weather;
  }

  //From cells to a sheet, exactly as the low deck goes from heaps to stratus.
  float stratiform = midCloudType;
  //Cells alone came out as a sky of identical, separate puffs. Real altocumulus
  //gathers into rafts with a network of cracks between them, the cells merging in
  //the middle of a raft and breaking up round its edges, so the cells ride on a
  //clump field four times their size.
  float cells = texture(cloudWeatherMap, weather.noisePosition.xz / MID_CLOUD_FOOTPRINT_TILE).r;
  float clumps = texture(cloudWeatherMap, (weather.noisePosition.xz + MID_CLOUD_PATCH_OFFSET.yx) / MID_CLOUD_CLUMP_TILE).r;
  cells = mix(cells, clumps, MID_CLOUD_CLUMP_WEIGHT);
  float rowPhase = dot(weather.noisePosition.xz, cloudWindDirection) / MID_CLOUD_ROW_WAVELENGTH;
  //2 pi spelled out: this chunk is also built into shaders without the atmosphere constants.
  float rows = cos(6.28318530718 * rowPhase + MID_CLOUD_ROW_BEND * (clumps - 0.5));
  cells += MID_CLOUD_ROW_STRENGTH * smoothstep(0.35, 0.65, patches.a) * rows;
  float sheet = 0.5 + 0.5 * smoothstep(0.2, 0.8, patches.b);
  float footprint = mix(cells, sheet, stratiform);

  float bias = mix(CLOUD_SHAPE_ALTERING_BIAS, 1.0, stratiform);
  float x = max(pow(hf, bias) * 2.0 - 1.0, 0.0);
  float heightScale = 1.0 - x * x;
  float reach = max(midCloudRecipeCoverage(coverage) * heightScale, 1e-4);
  float threshold = 1.0 - reach;
  float profile = cloudRemap(mix(footprint, 1.0, CLOUD_COVERAGE_FILTER_WIDTH), threshold, threshold + CLOUD_COVERAGE_FILTER_WIDTH, 0.0, 1.0);
  weather.density = clamp(profile * CLOUD_COVERAGE_FILTER_WIDTH / reach, 0.0, 1.0);

  //A crisp base and a softened top, as the low deck's default fade tags give it.
  float farFade = 1.0 - smoothstep(CLOUD_FAR_FADE_START_FRACTION * cloudCutoffDistance, cloudCutoffDistance, distance);
  float layerFade = cloudLinearGradient(1.0, 0.9, hf) * cloudLinearGradient(0.0, 0.025, hf);
  weather.fade = farFade * layerFade * (0.75 * hf + 0.25);
  weather.detailWeight = 1.0 - smoothstep(CLOUD_DETAIL_FADE_START, CLOUD_DETAIL_FADE_END, distance);
  return weather;
}

bool midCloudMayHaveDensity(vec3 q, float distance){
  CloudWeather weather = midCloudSampleWeather(q, distance);
  return weather.density * weather.fade > 0.0;
}

float midCloudDensityCheap(vec3 q, float distance){
  CloudWeather weather = midCloudSampleWeather(q, distance);
  if(weather.density * weather.fade <= 0.0){
    return 0.0;
  }
  float billowy = cloudLinearGradient(0.2, 0.4, weather.heightFraction);
  float modifier = mix(CLOUD_DETAIL_MEAN_WISPY, CLOUD_DETAIL_MEAN_BILLOWY, billowy) * midCloudKey(MID_CLOUD_DETAIL_AMOUNT);
  float density = cloudErodeShape(weather, MID_CLOUD_SHAPE_TILE, midCloudKey(MID_CLOUD_SHAPE_AMOUNT));
  return cloudErodeDetail(density, modifier) * weather.fade * midCloudKey(MID_CLOUD_DENSITY_SCALE);
}

float midCloudDensityFull(vec3 q, float distance){
  CloudWeather weather = midCloudSampleWeather(q, distance);
  if(weather.density * weather.fade <= 0.0){
    return 0.0;
  }
  float density = cloudErodeShape(weather, MID_CLOUD_SHAPE_TILE, midCloudKey(MID_CLOUD_SHAPE_AMOUNT));
  if(density <= 0.0){
    return 0.0;
  }
  float billowy = cloudLinearGradient(0.2, 0.4, weather.heightFraction);
  float modifier = mix(CLOUD_DETAIL_MEAN_WISPY, CLOUD_DETAIL_MEAN_BILLOWY, billowy);
  if(weather.detailWeight > 0.0){
    float detail = texture(cloudDetailNoise, weather.noisePosition / MID_CLOUD_DETAIL_TILE).r;
    modifier = mix(modifier, mix(pow(detail, 6.0), 1.0 - detail, billowy), weather.detailWeight);
  }
  density = cloudErodeDetail(density, modifier * midCloudKey(MID_CLOUD_DETAIL_AMOUNT));
  return density * weather.fade * midCloudKey(MID_CLOUD_DENSITY_SCALE);
}

//Both decks together, for the march and its light samples. A point can only be in
//one deck unless a tower from the low deck punches up into the mid one.
bool cloudMayHaveDensity(vec3 q, float distance){
  return cloudLowMayHaveDensity(q, distance) || midCloudMayHaveDensity(q, distance);
}

float cloudDensityCheap(vec3 q, float distance){
  return cloudLowDensityCheap(q, distance) + midCloudDensityCheap(q, distance);
}

float cloudDensityFull(vec3 q, float distance){
  float heightFraction;
  return cloudLowDensityFull(q, distance, heightFraction) + midCloudDensityFull(q, distance);
}
