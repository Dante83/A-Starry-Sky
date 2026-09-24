precision highp sampler3D;
//Both of our texture arrays carry data rather than color. The star LUT holds decoded
//galactic coordinates reaching +/-17000, where a half float's spacing is 16, and the moon
//maps feed a normal and two aperture terms. three declares samplers at the renderer's own
//precision, which is highp unless the context asked for less, so this is belt and braces
//-- but a mediump array sampler would quietly wreck both and look merely a little wrong.
precision highp sampler2DArray;

varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec3 galacticCoordinates;
varying vec2 screenPosition;

uniform float uTime;
uniform vec3 sunPosition;
uniform vec3 moonPosition;
uniform float sunHorizonFade;
uniform float moonHorizonFade;
uniform float scatteringMoonIntensity;
uniform float scatteringSunIntensity;
uniform vec3 moonLightColor;
uniform sampler3D mieInscatteringSum;
uniform sampler3D rayleighInscatteringSum;
uniform sampler2D transmittance;
uniform float cameraHeight;

//If clouds enabled
#if($cloudsEnabled && !$isMeteringPass)
  uniform sampler2D cloudMap;
#endif

uniform sampler2D blueNoiseTexture;

#if($auroraEnabled)
  uniform float numberOfAuroraRaymarchingSteps;
  uniform vec3 nitrogenColor;
  uniform float nitrogenCutOff;
  uniform float nitrogenIntensity;
  uniform vec3 molecularOxygenColor;
  uniform float molecularOxygenCutOff;
  uniform float molecularOxygenIntensity;
  uniform vec3 atomicOxygenColor;
  uniform float atomicOxygenCutOff;
  uniform float atomicOxygenIntensity;
  uniform float auroraCutoffDistance;
  uniform sampler2D auroraSampler;
#endif

#if(!$isSunPass && !$isMeteringPass)
  uniform samplerCube starHashCubemap;
  //The three star tiers differ only in size, so they ride in one array. Their layers are
  //sized to the largest tier and the smaller two occupy a corner, which is why every read
  //below is a texelFetch on integer star indices rather than a normalized UV.
  uniform sampler2DArray starData;
  const int DIM_STAR_LAYER = 0;
  const int MED_STAR_LAYER = 1;
  const int BRIGHT_STAR_LAYER = 2;
  uniform sampler2D starColorMap;

  #if($milkyWayEnabled)
    uniform sampler2D milkyWayEmissionMap;
    uniform sampler2D milkyWayAbsorptionMap;
    uniform float milkyWayIntensity;
  #endif

  uniform vec3 mercuryPosition;
  uniform vec3 venusPosition;
  uniform vec3 marsPosition;
  uniform vec3 jupiterPosition;
  uniform vec3 saturnPosition;

  uniform float mercuryBrightness;
  uniform float venusBrightness;
  uniform float marsBrightness;
  uniform float jupiterBrightness;
  uniform float saturnBrightness;

  const vec3 mercuryColor = vec3(1.0);
  const vec3 venusColor = vec3(0.913, 0.847, 0.772);
  const vec3 marsColor = vec3(0.894, 0.509, 0.317);
  const vec3 jupiterColor = vec3(0.901, 0.858, 0.780);
  const vec3 saturnColor = vec3(0.905, 0.772, 0.494);
#endif

const float piOver2 = 1.5707963267948966192313;
const float piTimes2 = 6.283185307179586476925286;
const float pi = 3.141592653589793238462;
const vec3 intensityVector = vec3(0.2126, 0.7152, 0.0722); // BT.709 luminance weights

#if($isSunPass)
  uniform float sunAngularDiameterCos;
  uniform float moonRadius;
  uniform sampler2D solarEclipseMap;
  varying vec2 vUv;
  const float sunDiskIntensity = 30.0;

  //Solar limb darkening, per RGB band (B/V/R after Hestroffer & Magnan 1998).
  //Each channel obeys I(mu)/I_center = ac1 + ac2*mu + 2*ac3*mu^2 and integrates
  //to ~1 at the disc center (mu=1). At the limb (mu=0) red retains ~0.59,
  //green ~0.47, blue ~0.30 -- the disc reddens toward its edge, complementing
  //atmospheric reddening for a richer sunset.
  const vec3 ac1 = vec3(0.590, 0.468, 0.300);
  const vec3 ac2 = vec3(0.450, 0.671, 0.930);
  const vec3 ac3 = vec3(-0.020, -0.069, -0.115);
#elif($isMoonPass)
  uniform float starsExposure;
  uniform float moonExposure;
  uniform float sunRadius;
  uniform float distanceToEarthsShadowSquared;
  uniform float oneOverNormalizedLunarDiameter;
  uniform vec3 earthsShadowPosition;
  //Diffuse, normal, roughness, aperture size and aperture orientation are all 512x512,
  //share their filtering, and are read at the same UV, so they are one array. Layer order
  //is set by AssetManager.buildMoonTextureArray and must match it.
  uniform sampler2DArray moonMaps;
  const int MOON_DIFFUSE_LAYER = 0;
  const int MOON_NORMAL_LAYER = 1;
  const int MOON_ROUGHNESS_LAYER = 2;
  const int MOON_APERTURE_SIZE_LAYER = 3;
  const int MOON_APERTURE_ORIENTATION_LAYER = 4;
  uniform float earthshineIntensity;
  uniform sampler2D eclipseShadowLUT;
  varying vec2 vUv;

  //Tangent space lighting
  varying vec3 tangentSpaceSunLightDirection;
  varying vec3 tangentSpaceViewDirection;
#elif($isMeteringPass)
  varying vec2 vUv;
  uniform float moonLuminosity;
  uniform float sunLuminosity;
  uniform float starsExposure;
#else
  uniform float starsExposure;
#endif

$atmosphericFunctions

#if(!$isSunPass)
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
#endif

#if(!$isSunPass && !$isMeteringPass)
  vec3 getSpectralColor(){
    return vec3(1.0);
  }

  float brownianNoise(float lacunarity, float gain, float initialAmplitude, float initialFrequency, float timeInSeconds){
    float amplitude = initialAmplitude;
    float frequency = initialFrequency;

    // Loop of octaves
    float y = 0.0;
    float maxAmplitude = initialAmplitude;
    for (int i = 0; i < 5; i++) {
    	y += amplitude * noise(frequency * timeInSeconds);
    	frequency *= lacunarity;
    	amplitude *= gain;
    }

    return y;
  }

  const float twinkleDust = 0.0010;

  //Fractional swing of the scintillation for the faintest stars AT THE ZENITH,
  //where the air is thinnest and twinkling is weakest. 0.25 lets such a star
  //range roughly 0.75x to 1.25x its mean flux straight overhead, rising with
  //airmass to near +/-90% on the horizon. This is the dial for how hard the
  //stars twinkle.
  //
  //It is deliberately keyed to the zenith rather than the horizon. The obvious
  //alternative -- scaling by (1 - atmosphericDistance), the slant path as a
  //fraction of the HORIZON path -- silently kills the effect, because that
  //fraction is only 0.079 straight up for the default 80 km atmosphere over a
  //6366.7 km earth. It reaches 1.0 solely in the last degree or so above the
  //horizon, so a depth sized against it leaves the entire rest of the sky
  //twinkling at about 4%, which reads as no twinkling at all.
  const float starScintillationDepth = 0.25;

  //Overall star brightness. This knob used to be hidden inside twinkleFactor,
  //which quietly multiplied every star by between 1.2x and 5x depending on its
  //magnitude and how low it sat. Now that the scintillation is centred on 1.0
  //and no longer smuggles in gain, the level lives here where it can actually
  //be reasoned about. 1.0 is the honest value; raise it if the field reads too
  //dim now that the free brightness is gone.
  const float starBrightnessGain = 1.0;

  //Extra washout applied on top of the legacy curve below, in magnitudes of
  //limiting stellar magnitude lost per magnitude the sky background brightens.
  //
  //This only ever ADDS to the original behaviour -- see the max() at the call
  //site -- so it is safe to turn. Roughly what it buys in a moonlit sky, over
  //and above what the old curve already did:
  //    0.0  legacy behaviour exactly     0.7  about +0.5 to +0.9 magnitudes
  //    1.0  about +1.5                   1.3  about +3, which is far too much
  //
  //1.3 was tried and wiped the sky clean: being linear in sky magnitude it
  //overtook the legacy curve all the way up to a sky luminance of 0.97, so it
  //applied everywhere across night and twilight rather than only where the old
  //curve was too gentle. It also stacks with starsExposure, which the state
  //engine has already reduced for a bright sky, so the two double up.
  const float starSkyWashoutRate = 0.7;

  //Exponent on the star's point-spread function, kept separate from the
  //magnitude compression below.
  //
  //The two used to share a single sqrt, which was doing two unrelated jobs at
  //once. Compressing the magnitude scale it does about right. Widening the
  //profile it does far too much: sqrt of a gaussian is a gaussian sqrt(2)
  //wider, and sqrt of the Airy function's r^-3 tail is r^-1.5, which at the
  //r=10 cutoff leaves 27x more halo than the profile actually has. That halo,
  //not the core, is what reads as a fuzzy dot -- and there are 8192 dim stars
  //carrying one each.
  //
  //Measured radius at 5% of peak, where one screen pixel is about 1.92 r-units
  //at a 70 degree field of view:
  //    0.5 (the old sqrt) 4.2 px    0.7  2.5 px    1.0 (true Airy) 1.8 px
  //The 50% radius barely moves (1.2 px -> 0.9 px) because the core is
  //sub-pixel either way, so raising this tightens the halo without costing the
  //star its visible centre. 1.0 is physically honest but leaves the core small
  //enough to alias, so 0.7 is the compromise.
  const float starProfileSharpness = 0.7;

  //Value of sunHorizonFade below which the sky is dark enough to let stars
  //through untouched. 0.8 corresponds to a solar altitude of about -3.5
  //degrees.
  //
  //Stars have to be pushed out of the daytime sky explicitly. The
  //sky-brightness washout gets a midday sky down to a few tenths of a percent
  //contrast, which sounds like plenty, but the eye picks a point discontinuity
  //out of a smooth gradient at far lower contrast than that -- so a handful of
  //the brightest were surviving into full daylight as faint specks.
  //
  //sunHorizonFade is clamp(3.24 * sin(solar altitude) + 1, 0, 1): it pins at
  //1.0 for every sun-above-horizon position and falls to 0 at -18 degrees.
  //Keying off the very top of that range keeps this surgical. It engages only
  //in the last few degrees before sunrise and after sunset and is fully out of
  //the way below that, leaving the rest of twilight to the washout, which is
  //driven by real sky luminance and already behaves correctly there.
  const float starDaylightCutoffFade = 0.8;

  //brownianNoise sums five octaves at gain 0.2, so for a unit initial amplitude
  //it spans [0, 1.2496]. Feeding it the reciprocal normalizes the result to
  //[0, 1] so it can be centred cleanly below.
  const float oneOverBrownianNoiseSum = 0.8002561;

  //Atmospheric scintillation.
  //
  //The noise is centred on zero so a star spends as much time below its mean
  //flux as above it. That centring is the whole correction here: brownianNoise
  //sums strictly non-negative octaves, so the previous form could only ever
  //*brighten* a star. Sampled over a minute of playback it never once dipped
  //below 1.0, and averaged 1.2x at the zenith, 2.0x mid-sky and 3.0x at the
  //horizon -- which is most of the reason the faint stars read too bright.
  //
  //The 6 Hz base octave is deliberately left alone. Atmospheric turbulence
  //rolls off at a characteristic Greenwood frequency near 7 Hz rather than
  //being white noise, and value noise with smoothstep interpolation at 6 Hz is
  //already precisely that "frozen flow" model: quantize time into coherence
  //cells and ease between them. The slower octaves beneath it supply the
  //low-frequency drift real seeing has.
  //
  //relativeAirmass is the slant path through the atmosphere divided by the
  //vertical one: 1.0 at the zenith, about 12.7 at the horizon. magnitudeDepth
  //carries the per-star half of the modulation.
  float twinkleFactor(vec3 starposition, float relativeAirmass, float magnitudeDepth){
    float randSeed = uTime * twinkleDust + (starposition.x + starposition.y + starposition.z) * 10000.0;

    //lacunarity, gain, initialAmplitude, initialFrequency
    float centeredNoise = 2.0 * brownianNoise(0.5, 0.2, oneOverBrownianNoiseSum, 6.0, randSeed) - 1.0;

    //Scintillation deepens with airmass but saturates rather than growing
    //linearly, so the square root: a 12.7x airmass buys 3.6x the swing, not
    //12.7x, which would have the horizon blinking stars fully out.
    float depth = clamp(starScintillationDepth * sqrt(relativeAirmass) * magnitudeDepth, 0.0, 0.95);

    return max(1.0 + depth * centeredNoise, 0.0);
  }

  float colorTwinkleFactor(vec3 starposition){
    float randSeed = uTime * 0.0007 + (starposition.x + starposition.y + starposition.z) * 10000.0;

    //lacunarity, gain, initialAmplitude, initialFrequency
    return 0.7 * (2.0 * noise(randSeed) - 1.0);
  }

  float fastAiry(float r){
    //Variation of Airy Disk approximation from https://www.shadertoy.com/view/tlc3zM to create our stars brightness
    float one_over_r_cubed = 1.0 / max(abs(r * r * r), 1e-6);
    float gauss_r_over_1_4 = exp(-.5 * (0.71428571428 * r) * (0.71428571428 * r));
    return abs(r) < 1.88 ? gauss_r_over_1_4 : abs(r) > 6.0 ? 1.35 * one_over_r_cubed : (gauss_r_over_1_4 + 2.7 * one_over_r_cubed) * 0.5;
  }

  vec2 getUV2OffsetFromStarColorTemperature(float zCoordinate, float normalizedYPosition, float noise){
    float row = clamp(floor(zCoordinate / 4.0), 0.0, 8.0); //range: [0-8]
    float col = clamp(zCoordinate - row * 4.0, 0.0, 3.0); //range: [0-3]

    //Note: We are still in pixel space, our texture areas are 32 pixels wide
    //even though our subtextures are only 30x14 pixels due to 1 pixel padding.
    float xOffset = col * 32.0 + 15.0;
    float yOffset = row * 16.0 + 1.0;

    float xPosition =  xOffset + 13.0 * noise;
    float yPosition = yOffset + 15.0 * normalizedYPosition;

    return vec2(xPosition / 128.0, yPosition / 128.0);
  }

  vec3 getStarColor(float temperature, float normalizedYPosition, float noise){
    //Convert our temperature to a z-coordinate
    float zCoordinate = floor(31.0 * sqrt((temperature - 2000.0) / 15000.0)); // T in [2000K,17000K] -> [0,31]
    vec2 uv = getUV2OffsetFromStarColorTemperature(zCoordinate, normalizedYPosition, noise);

    vec3 starColor = texture(starColorMap, uv).rgb;

    //Interpolate between the 2 colors (ZCoordinateC and zCoordinate are never more then 1 apart)
    return starColor;
  }

  vec3 drawStarLight(vec4 starDatum, vec3 galacticSphericalPosition, vec3 skyPosition, float starAndSkyExposureReduction){
    //I hid the temperature inside of the magnitude of the stars equitorial position, as the position vector must be normalized.
    float temperature = sqrt(dot(starDatum.xyz, starDatum.xyz));
    vec3 normalizedStarPosition = starDatum.xyz / temperature;

    //Early out if we're too far away
    float approximateDistanceOnSphereStar = distance(galacticSphericalPosition, normalizedStarPosition) * 1700.0;
    if(approximateDistanceOnSphereStar > 10.0){
      return vec3(0.0);
    }

    //Get the distance the light ray travels
    vec2 skyIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), normalize(vec2(length(vec2(skyPosition.xz)), skyPosition.y)));
    vec2 normalizationIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), vec2(1.0, 0.0));
    float slantPathToEdgeOfSky = distance(vec2(0.0, RADIUS_OF_EARTH), skyIntersectionPoint);
    float distanceToEdgeOfSky = clamp((1.0 - slantPathToEdgeOfSky / distance(vec2(0.0, RADIUS_OF_EARTH), normalizationIntersectionPoint)), 0.0, 1.0);

    //Relative airmass, straight from the geometry: the slant path over the
    //vertical one. 1.0 overhead, about 12.7 on the horizon.
    float relativeAirmass = slantPathToEdgeOfSky / ATMOSPHERE_HEIGHT;

    //Use the distance to the star to determine it's perceived twinkling
    float starBrightness = starBrightnessGain * pow(100.0, (-starDatum.a + min(starAndSkyExposureReduction, 2.7)) * 0.20);

    //Modify the intensity and color of this star using approximation of stellar scintillation
    vec3 starColor = getStarColor(temperature, distanceToEdgeOfSky, colorTwinkleFactor(normalizedStarPosition));

    //Scintillation is very nearly magnitude-independent, so this only tilts the
    //depth slightly rather than scaling it.
    //
    //The scintillation index is a property of the ATMOSPHERE, not of the star:
    //every star is an unresolved point, so the same wavefront distortion hits
    //them all equally. It is the planets that hold steady, because they are
    //resolved discs whose separate points average out. An earlier 0.4 floor
    //here had bright stars twinkling 2.4x less than faint ones, which is
    //backwards -- Sirius dancing near the horizon is the canonical example of
    //the effect, not a counterexample to it. All that survives is a small
    //perceptual nod: a star near the eye's threshold visibly blinks out where a
    //bright one only shimmers, so the faintest keep a little extra depth.
    float magnitudeDepth = mix(0.75, 1.0, pow(smoothstep(-1.5, 6.0, starDatum.a), 1.5));
    starBrightness *= twinkleFactor(normalizedStarPosition, relativeAirmass, magnitudeDepth);

    //Point spread evaluated separately so it keeps its own falloff. At the
    //centre fastAiry is 1.0, so the star's peak is exactly what it was before
    //the split -- only the halo tightens.
    float starProfile = pow(max(fastAiry(approximateDistanceOnSphereStar), 0.0), starProfileSharpness);

    return vec3(sqrt(starBrightness) * starProfile) * pow(starColor, vec3(1.2));
  }

  vec3 drawPlanetLight(vec3 planetColor, float planetMagnitude, vec3 planetPosition, vec3 skyPosition, float starAndSkyExposureReduction){
    //Grab our distance to this planet
    float approximateDistanceOnSphereStar = distance(skyPosition, planetPosition) * 1400.0;

    //Early out if we're too far away
    if(approximateDistanceOnSphereStar > 100.0){
      return vec3(0.0);
    }

    //Use the distance to the star to determine it's perceived twinkling
    //Planets can have higher magnitudes, but capping at -1.0 eliminates
    //silly glow effects.
    float planetBrightness = pow(100.0, (-max(planetMagnitude, -1.0) + starAndSkyExposureReduction) * 0.2);

    //Pass this brightness into the fast Airy function to make the star glow
    planetBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0);
    return sqrt(vec3(planetBrightness)) * planetColor;
  }

  #if($milkyWayEnabled)
    $milkyWayFunctions
  #endif
#endif

#if($isMoonPass)
  //Sample the precomputed Eclipse-Shadow LuT (Schneegans et al. 2025) to get
  //the RGB shadow color at this moon-disk pixel. LuT parameterization:
  //  u_shadow = phi_sun / (phi_sun + phi_occ)  -- ratio of apparent radii
  //  v_shadow = delta / (phi_sun + phi_occ)    -- normalized angle to shadow axis
  //phi_sun, phi_occ, and delta are measured *from the moon's surface* (the
  //observer position in the shadow). For the Earth-Moon-Sun system these are
  //essentially fixed:
  //  phi_sun_from_moon ~ R_sun / d_earth_sun       ~ 0.00465 rad
  //  phi_occ_from_moon ~ R_earth / d_earth_moon    ~ 0.01657 rad
  //  -> phi_sun + phi_occ                          ~ 0.02123 rad (~1.22 deg)
  //  -> physical moon angular radius (R_moon/d_em) ~ 0.00452 rad (~0.26 deg)
  //
  //The project draws the moon at a *cinematic* angular size
  //(<sky-moon-angular-diameter>, default 3.15 deg vs the physical ~0.5 deg)
  //for visual impact. If we just sampled the LuT at the per-pixel delta from
  //antisolar, the shadow would only cover the central ~1.22 deg of the
  //inflated cinematic disk -- a tiny bite. To make the cinematic moon show
  //a full eclipse the way the *physical* moon would, we map each cinematic-
  //disk pixel back to its physical-moon-equivalent position, then look the
  //LuT up at that physical delta. The result: when the moon center is in the
  //umbra, the entire cinematic disk is dim red; when partially eclipsed, the
  //gradient spans the whole cinematic disk; when not eclipsed at all
  //(deltaCenter > 1.22 deg), every pixel clamps to v=1 -> (1, 1, 1).
  const float U_SHADOW_LUNAR = 0.2193;
  const float ECLIPSE_SHADOW_RADIUS_RAD = 0.02123;
  const float PHYSICAL_MOON_RADIUS_RAD = 0.00452;

  vec3 getLunarEcclipseShadow(vec3 sphericalPosition){
    //physicalPerCinematic = physical_moon_radius / cinematic_moon_radius
    //                     = PHYSICAL_MOON_RADIUS_RAD / (1 / (2 * oneOverNormalizedLunarDiameter))
    //                     = 2 * PHYSICAL_MOON_RADIUS_RAD * oneOverNormalizedLunarDiameter
    float physicalPerCinematic = 2.0 * PHYSICAL_MOON_RADIUS_RAD * oneOverNormalizedLunarDiameter;
    vec3 scaledPos = normalize(moonPosition + (sphericalPosition - moonPosition) * physicalPerCinematic);

    float cosDelta = clamp(dot(scaledPos, earthsShadowPosition), -1.0, 1.0);
    float delta = acos(cosDelta);
    float vShadow = clamp(delta / ECLIPSE_SHADOW_RADIUS_RAD, 0.0, 1.0);

    return texture2D(eclipseShadowLUT, vec2(U_SHADOW_LUNAR, vShadow)).rgb;
  }
#endif

float interceptPlaneSurface(vec3 rayStartPosition, vec3 rayDirection, float height, float maxDistance){
  float tGoal = rayDirection.y <= 0.0 ? -1.0 : (height - rayStartPosition.y) / rayDirection.y;
  float tMax = sqrt(maxDistance * maxDistance / dot(rayDirection, rayDirection));
  return min(tGoal, tMax);
}

#if($auroraEnabled)
  //I'm gonna do something weird. I propose that aurora look an aweful lot
  //like water caustics - slower, with some texture ripples introduced with
  //perlin noise.
  //
  //To create my fake water caustics, I'm going to linearize and combine
  //multiple tileable shader items to create the effect.
  //From https://www.shadertoy.com/view/Msf3WH (MIT License)
  vec2 hash(vec2 p){
    vec2 p2 = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return 2.0 * fract(sin(p2) * 43758.5453123) - 1.0;
  }

  float perlinNoise(vec2 p){
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

  float auroraHeightmap(vec2 uv, float t){
    float halfTime = 0.5 * t;
    float quarterTime = 0.5 * halfTime;

    //Offsets from the perlin noise
    float perlinOffset1 = perlinNoise(16.0 * (uv + vec2(0.1, 0.2) * t));
    float perlinOffset2 = perlinNoise(16.0 * (uv - vec2(0.4, 0.3) * halfTime));
    vec2 pSample = 0.07 * vec2(perlinOffset1, perlinOffset2);

    //Sample our caustic shader
    vec2 uv1 = uv + vec2(0.8, 0.1) * quarterTime;
    vec2 uv2 = uv - vec2(0.2, 0.7) * quarterTime;
    float aSample1 = texture(auroraSampler, (uv1 + pSample) * 0.25).r;
    float aSample2 = texture(auroraSampler, uv1 * 0.25).r;
    float aSample3 = texture(auroraSampler, uv2 * 0.25).g;
    float aSample4 = texture(auroraSampler, (uv2 + pSample) * 0.25).g;

    //Combine our caustic shader results
    float cCombined1 = 1.7 * min(max(aSample1, aSample2), max(aSample3, aSample4));
    return cCombined1 * cCombined1;
  }

  //Is this scientifically correct?! No, I doubt it. I just grabbed some relative values
  //and I'm hoping this will give me a nice sense of varying these things.
  //Note that both magenta nitrogen aurora and red aurora are rather rare, so you are
  //unlikely to see them, their values are set as such below, and use electron velocity
  //in combination with the aurora 'height' (which is a rough estimate for quantity)
  //to determine which aurora is visible. At this point, we are just faking it till
  //we can get more accurate values for simulating this.
  vec3 auroraColor(float auroraNoiseValue, float heightOfRay, float avgElectronVelocityScalar,
                   vec3 excitedNitrogenSpectrumEmission, vec3 molecularO2SpectralEmission, vec3 atomicOxygenSpectralEmission){

    float h = heightOfRay - RADIUS_OF_EARTH;
    vec3 outputLightIntensity = vec3(0.0);
    float centroidValue;
    float linearIntensityFader;

    //Nitrogen contribution
    if(h > 60.0 && h < 120.0){
      centroidValue = (h - 90.0) / 70.0;
      linearIntensityFader = clamp(auroraNoiseValue - nitrogenCutOff, 0.0, 1.0);
      outputLightIntensity += nitrogenIntensity * excitedNitrogenSpectrumEmission * linearIntensityFader * exp(-centroidValue * centroidValue);
    }

    //Molecular oxygen contribution
    if(h > 100.0 && h < 250.0){
      centroidValue = (h - 175.0) / 50.5;
      linearIntensityFader = clamp(auroraNoiseValue - molecularOxygenCutOff, 0.0, 1.0);
      outputLightIntensity += molecularOxygenIntensity * molecularO2SpectralEmission * linearIntensityFader * exp(-centroidValue * centroidValue);
    }

    //Atomic oxygen contribution
    if(h > 150.0 && h < 600.0){
      centroidValue = (h - 375.0) / 80.5;
      linearIntensityFader = clamp(auroraNoiseValue - atomicOxygenCutOff, 0.0, 1.0);
      outputLightIntensity += atomicOxygenIntensity * atomicOxygenSpectralEmission * linearIntensityFader * exp(-centroidValue * centroidValue);
    }

    return max(vec3(outputLightIntensity), 0.0);
  }

  vec3 auroraRayMarchPass(vec3 rayStartPosition, vec3 rayDirection, float starAndSkyExposureReduction){
    float uvScaling = 4.0;
    float rayInterceptStartTime = interceptPlaneSurface(rayStartPosition + RADIUS_OF_EARTH, rayDirection, RADIUS_OF_AURORA_BOTTOM + RADIUS_OF_EARTH, auroraCutoffDistance);
    float rayInterceptEndTime = interceptPlaneSurface(rayStartPosition + RADIUS_OF_EARTH, rayDirection, RADIUS_OF_AURORA_TOP + RADIUS_OF_EARTH, auroraCutoffDistance);
    float rayDeltaT = (rayInterceptEndTime - rayInterceptStartTime) / numberOfAuroraRaymarchingSteps;
    float auroraNoiseValue;
    vec3 auroraColorValue0;
    vec3 auroraColorValuef;
    vec3 lastPosition;
    vec3 linearAuroraGlow = vec3(0.0);
    float auroraBrightness = pow(150.0, min(starAndSkyExposureReduction, 2.7) * 0.20);
    if(rayInterceptStartTime > 0.0){
      vec3 nitrogenLinear = sRGBToLinear(vec4(nitrogenColor, 1.0)).rgb;
      vec3 molecularO2Linear = sRGBToLinear(vec4(molecularOxygenColor, 1.0)).rgb;
      vec3 atomicOxygenLinear = sRGBToLinear(vec4(atomicOxygenColor, 1.0)).rgb;
      lastPosition = rayStartPosition + rayInterceptStartTime * rayDirection;
      vec2 auroraNoiseTextureUV = vec2(lastPosition.x, lastPosition.z);
      auroraNoiseValue = auroraHeightmap(auroraNoiseTextureUV / 1600.0, uTime / 16000.0);
      auroraColorValue0 = auroraColor(auroraNoiseValue, lastPosition.y, 0.5, nitrogenLinear, molecularO2Linear, atomicOxygenLinear); //Setting the velocity value to a constant while we test this out.
      for(float i = 1.0; i < numberOfAuroraRaymarchingSteps; i++){
        //Determine the position of our raymarcher in the sky
        //Per-pixel, per-step blue noise lookup using screen coords
        vec2 noiseUV = (gl_FragCoord.xy + vec2(i * 7.0, i * 11.0)) * 0.0078125;
        float blueNoise = texture(blueNoiseTexture, noiseUV).r * 2.0 - 1.0;
        float d = rayDeltaT * (0.75 + 0.5 * blueNoise);
        vec3 currentPosition = lastPosition + rayDirection * d;

        auroraNoiseTextureUV = vec2(currentPosition.x, currentPosition.z);
        auroraNoiseValue = auroraHeightmap(auroraNoiseTextureUV / 1600.0, uTime / 16000.0);
        auroraColorValuef = auroraColor(auroraNoiseValue, currentPosition.y, 0.5, nitrogenLinear, molecularO2Linear, atomicOxygenLinear); //Setting the velocity value to a constant while we test this out.

        //Integrate using the trapezoidal rule
        linearAuroraGlow += 0.5 * (auroraColorValue0 + auroraColorValuef) * d;//We linearly scale by the longer distances to cancel out the effect of fewer samples

        //Save the current position as the last position so we can determine the distance between points the next time
        lastPosition = currentPosition;
        auroraColorValue0 = auroraColorValuef;
      }
      linearAuroraGlow = 0.00028 * linearAuroraGlow;
    }

    return linearAuroraGlow * auroraBrightness; //Linear multiplier for artistic control
  }
#endif

//Cloud lookup
#if(!$isMeteringPass && $cloudsEnabled)
  //Must match CLOUD_MAP_K in cloud-march.glsl, cloud-resolve.glsl and CloudRenderer.js
  const float CLOUD_MAP_K = 1.0723687100246826;

  //Stereographic projection from the nadir onto the cloud map. The map holds four
  //degrees of guard band below the horizon; past that there are no clouds, and
  //the 1 / (1 + y) would run off towards infinity at the nadir.
  //
  //The map is PREMULTIPLIED -- rgb is cloud light already scaled by opacity -- so
  //it composites as sky * (1 - a) + rgb (see cloud-march.glsl for why).
  vec4 sampleCloudMap(vec3 direction){
    if(direction.y < -0.06){
      return vec4(0.0);
    }
    vec2 uv = 0.5 + 0.5 * direction.xz / ((1.0 + direction.y) * CLOUD_MAP_K);
    return texture(cloudMap, uv);
  }
#endif

vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 sourceIntensity, vec3 sphericalPosition, sampler3D mieLookupTable, sampler3D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){
  float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, sphericalPosition);
  float cosOFAngleBetweenZenithAndSource = sourcePosition.y;
  vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));

  //Interpolated scattering values
  vec3 interpolatedMieScattering = texture(mieLookupTable, uv3).rgb;
  vec3 interpolatedRayleighScattering = texture(rayleighLookupTable, uv3).rgb;
  vec3 uv3_2 = vec3(parameterizationOfCosOfViewZenithToX(0.0), uv3.y, uv3.z);
  vec3 mieShadow = intensityFader * texture(mieLookupTable, uv3_2).rgb;
  vec3 rayleighShadow = intensityFader * texture(rayleighLookupTable, uv3_2).rgb;

  //Percent of sun visible along the view ray. Geometry (the 8-iteration bisection)
  //is computed ONCE -- only the final density weighting differs between Mie and
  //Rayleigh, so this halves the per-pixel shadow-test cost for sun + moon.
  EarthShadowGeometry shadowGeom = earthsShadowGeometry(sphericalPosition, sourcePosition, 0.0, ATMOSPHERE_HEIGHT);
  float percentShadowMie = earthsShadowDensityRatio(shadowGeom, ONE_OVER_MIE_SCALE_HEIGHT);
  float percentShadowRayleigh = earthsShadowDensityRatio(shadowGeom, ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
  //Clamp shadow result to never exceed the original inscattering - the shadow
  //should only ever darken, never brighten (the horizon-sampled mieShadow/rayleighShadow
  //can be brighter than the actual view-direction inscattering at high zenith angles)
  interpolatedMieScattering = min(mix(mieShadow, interpolatedMieScattering, percentShadowMie), interpolatedMieScattering);
  interpolatedRayleighScattering = min(mix(rayleighShadow, interpolatedRayleighScattering, percentShadowRayleigh), interpolatedRayleighScattering);

  // Twilight horizon falloff: squared (not cubed) so post-sunset Rayleigh +
  // Mie inscattering still glows visibly. Cube was a hack masking that the
  // Elek z-parameterization squashes everything when cos(sunZenith) goes
  // negative; squaring is closer to physics and the difference is barely
  // visible above the horizon.
  return intensityFader * intensityFader * sourceIntensity * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);
}

//Tonemapper, for A/B comparison. SKY_TONEMAPPER must match the const of the same
//name in moon-and-sun-output.glsl (the sun and moon passes tonemap there).
//  0  AES filmic (Narkowicz fit) -- the long standing default. Its shoulder starts
//     early, so sunlit cloud tops and their shadow sides get squeezed together.
//  1  Khronos PBR Neutral -- linear up to 0.76, then a soft shoulder that keeps hue.
//  2  AgX (Troy Sobotka, minimal fit by bwrensch) -- desaturates the brightest
//     highlights towards white the way film does, rather than skewing their hue.
const int SKY_TONEMAPPER = 0;

//Including this because someone removed this in a future version of THREE. Why?!
vec3 MyAESFilmicToneMapping(vec3 color) {
  return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);
}

//https://github.com/KhronosGroup/ToneMapping/tree/main/PBR_Neutral
vec3 PBRNeutralToneMapping(vec3 color) {
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
vec3 AgXToneMapping(vec3 color) {
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

vec3 skyToneMap(vec3 color) {
  if(SKY_TONEMAPPER == 1){
    return clamp(PBRNeutralToneMapping(color), 0.0, 1.0);
  }
  if(SKY_TONEMAPPER == 2){
    return clamp(AgXToneMapping(color), 0.0, 1.0);
  }
  return MyAESFilmicToneMapping(color);
}

void main(){

  #if($isMeteringPass)
    float rho = length(vUv.xy);
    float height = sqrt(max(0.0, 1.0 - rho * rho));
    float phi = piOver2 - atan(height, rho);
    float theta = atan(vUv.y, vUv.x);
    vec3 sphericalPosition;
    sphericalPosition.x = sin(phi) * cos(theta);
    sphericalPosition.z = sin(phi) * sin(theta);
    sphericalPosition.y = cos(phi);
    sphericalPosition = normalize(sphericalPosition);
  #else
    vec3 sphericalPosition = normalize(vLocalPosition);
  #endif

  //Get our transmittance for this texel
  //Note that for uv2OfTransmittance, I am clamping the cosOfViewAngle
  //to avoid edge interpolation in the 2-D texture with a different z
  float cosOfViewAngle = sphericalPosition.y;
  vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(max(cosOfViewAngle, 0.0)), parameterizationOfHeightToY(RADIUS_OF_EARTH + clamp(cameraHeight + vWorldPosition.y * METERS_TO_KM, 0.0, ATMOSPHERE_HEIGHT)));
  vec3 transmittanceFade = texture(transmittance, uv2OfTransmittance).rgb;

  //In the event that we have a moon shader, we need to block out all astronomical light blocked by the moon
  #if($isMoonPass)
    //Get our lunar occlusion texel
    vec2 offsetUV = clamp(vUv * 4.0 - vec2(1.5), vec2(0.0), vec2(1.0));
    vec4 lunarDiffuseTexel = texture(moonMaps, vec3(offsetUV, float(MOON_DIFFUSE_LAYER)));
    vec3 lunarDiffuseColor = lunarDiffuseTexel.rgb;
  #elif($isSunPass)
    //The sun disk is drawn in this frame, so base-sun-partial reads offsetUV for its
    //distance from the sun's center. It used to also sample the lunar diffuse map here for
    //a lunarMask that nothing ever read, off a uniform SunRenderer never bound -- the
    //eclipse silhouette comes from solarEclipseMap instead.
    vec2 offsetUV = clamp(vUv * 4.0 - vec2(1.5), vec2(0.0), vec2(1.0));
  #endif

  //Atmosphere (We multiply the scattering sun intensity by vec3 to convert it to a vector)
  vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity * vec3(1.0), sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);
  vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity * moonLightColor, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, moonHorizonFade, uv2OfTransmittance);
  //Night-sky baseline ("airglow") -- moonless desert tail of the spectrum.
  //RGB ratio captures atmospheric airglow + zodiacal washout (slightly bluer
  //than starlight). Faded with moon presence: a bright moon overwhelms
  //airglow for the human eye (loss of dark adaptation), so we dim the
  //baseline by up to 50% as the moon climbs above the horizon.
  const vec3 SKY_BASELINE = vec3(2E-3, 3.5E-3, 9E-3);
  float airglowIntensity = 0.25 * (1.0 - 0.5 * moonHorizonFade);
  vec3 baseSkyLighting = airglowIntensity * SKY_BASELINE * transmittanceFade;

  #if(!$isSunPass)
    //Sky background washes stars out. What governs that is the RATIO of the sky
    //to a dark moonless one expressed in MAGNITUDES -- the eye gives up roughly
    //one magnitude of limiting stellar magnitude for each magnitude the
    //background brightens. The previous form subtracted a linear multiple of an
    //sRGB-encoded radiance, which is neither of those, and ran far too flat
    //through the moonlit and twilight range: a gibbous moon over twilight took
    //only 2.7 magnitudes off the limit where it should take nearer 6. That is
    //why a moonlit sky still came out carrying a dense field of faint stars.
    //
    //Two properties worth keeping: on a genuinely moonless night there is no
    //sun or moon scatter, the ratio is 1, the log is 0, and the dark-sky star
    //field is left bit-for-bit unchanged; and at full daylight the curve lands
    //within 0.1 magnitudes of where the old one did.
    float skyLuminance = dot(solarAtmosphericPass + lunarAtmosphericPass, intensityVector);
    float darkSkyReferenceLuminance = dot(0.25 * SKY_BASELINE, intensityVector);

    //0.7525750 is 2.5 * log10(2), turning the log2 into magnitudes.
    float skyBrightnessInMagnitudes = 0.7525750 * log2(1.0 + skyLuminance / darkSkyReferenceLuminance);

    //Floor the washout at the original curve rather than replacing it. That
    //curve grows exponentially in sky magnitude -- too flat under moonlight,
    //but correctly brutal by daylight -- so keeping it as a lower bound means
    //a bright sky is guaranteed to behave exactly as it always did, and the
    //logarithmic term only adds washout down in the dim regime where the old
    //one was too gentle.
    //
    //It also bounds how far the rate above can run away. At 0.7 the log term
    //stops winning past a sky luminance near 0.11, so the legacy curve takes
    //back over well before daylight no matter how the knob is set. Replacing
    //the curve outright, with no such floor, is what emptied the sky.
    float legacyWashout = 10.0 * dot(LinearTosRGB(vec4(solarAtmosphericPass + lunarAtmosphericPass, 1.0)).rgb, intensityVector);
    float starAndSkyExposureReduction = starsExposure - max(legacyWashout, starSkyWashoutRate * skyBrightnessInMagnitudes);
  #endif

  //This stuff never shows up near our sun, so we can exclude it
  #if(!$isSunPass && !$isMeteringPass)
    vec3 galacticLighting = vec3(0.0);

    #if($milkyWayEnabled)
      //Built out here, not inside the horizon test below: it takes screen-space
      //derivatives to pick its mip level, and those are only defined in uniform
      //control flow.
      MilkyWayLookup milkyWayData = milkyWayLookup(normalize(galacticCoordinates));
    #endif

    if(vLocalPosition.y >= 0.0){
      //Get the stellar starting id data from the galactic cube map
      vec3 normalizedGalacticCoordinates = normalize(galacticCoordinates);
      vec4 starHashData = texture(starHashCubemap, normalizedGalacticCoordinates);

      //The unpacked bits are a star's integer position in its tier, and they always were.
      //They used to be divided by one less than the tier width and handed to texture(),
      //which under NearestFilter lands on texel i for every i -- so a texelFetch on the
      //index itself reads exactly the same texel, and it keeps reading it now that the
      //three tiers share layers sized to the largest of them.

      //Red
      float scaledBits = starHashData.r * 255.0;
      float leftBits = floor(scaledBits / 2.0);
      float starXIndex = leftBits; //Dim Star
      float rightBits = scaledBits - leftBits * 2.0;

      //Green
      scaledBits = starHashData.g * 255.0;
      leftBits = floor(scaledBits / 8.0);
      float starYIndex = rightBits + leftBits * 2.0; //Dim Star
      rightBits = scaledBits - leftBits * 8.0;

      //Add the dim stars lighting
      vec4 starDatum = texelFetch(starData, ivec3(int(starXIndex), int(starYIndex), DIM_STAR_LAYER), 0);
      galacticLighting = max(drawStarLight(starDatum, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

      //Blue
      scaledBits = starHashData.b * 255.0;
      leftBits = floor(scaledBits / 64.0);
      starXIndex = rightBits + leftBits * 8.0; //Medium Star
      rightBits = scaledBits - leftBits * 64.0;
      leftBits = floor(rightBits / 2.0);
      starYIndex = leftBits; //Medium Star

      //Add the medium stars lighting
      starDatum = texelFetch(starData, ivec3(int(starXIndex), int(starYIndex), MED_STAR_LAYER), 0);
      galacticLighting += max(drawStarLight(starDatum, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

      //Alpha
      scaledBits = starHashData.a * 255.0;
      leftBits = floor(scaledBits / 32.0);
      starXIndex = leftBits;
      rightBits = scaledBits - leftBits * 32.0;
      leftBits = floor(rightBits / 4.0);
      starYIndex = leftBits;

      //Add the bright stars lighting
      starDatum = texelFetch(starData, ivec3(int(starXIndex), int(starYIndex), BRIGHT_STAR_LAYER), 0);
      galacticLighting += max(drawStarLight(starDatum, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);

      //Check our distance from each of the four primary planets
      galacticLighting += max(drawPlanetLight(mercuryColor, mercuryBrightness, mercuryPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting += max(drawPlanetLight(venusColor, venusBrightness, venusPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting += max(drawPlanetLight(marsColor, marsBrightness, marsPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting += max(drawPlanetLight(jupiterColor, jupiterBrightness, jupiterPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);
      galacticLighting += max(drawPlanetLight(saturnColor, saturnBrightness, saturnPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);

      galacticLighting = sRGBToLinear(vec4(galacticLighting, 1.0)).rgb;

      #if($milkyWayEnabled)
        //Converted on its own and added in LINEAR space rather than folded into
        //the accumulator above. sRGB->linear is convex, so a diffuse pedestal
        //sitting under a star lands that star's own delta on a far steeper part
        //of the curve: measured, faint-star wings that used to fade to black
        //came back 2x to 5x brighter across the band, turning every star into a
        //fuzzy dot. Two independent emitters belong added in radiance anyway.
        //
        //The band itself is untouched by this move -- wherever there is no star
        //under it, converting the sum and summing the conversions are the same
        //number. Only the star cross-term goes away, which is the bug.
        galacticLighting += sRGBToLinear(vec4(max(drawMilkyWay(milkyWayData, starAndSkyExposureReduction), 0.0), 1.0)).rgb;
      #endif
    }
  #elif($isMeteringPass)
    vec3 galacticLighting = vec3(0.0);
  #endif

  vec3 auroraLighting = vec3(0.0);
  #if($auroraEnabled)
    //Add aurora lighting if it exists
    auroraLighting = auroraRayMarchPass(vec3(0.0, RADIUS_OF_EARTH, 0.0), sphericalPosition, starAndSkyExposureReduction);
    //Aurora emits at 100-600 km altitude -- well above the bulk of the
    //atmosphere -- so applying the full ground-to-TOA transmittance here is
    //technically over-counting Mie attenuation (Mie is low-altitude). In
    //practice Mie at the relevant viewing angles is small enough that the
    //correct-but-cheaper approximation matches reality to within ~5%.
    auroraLighting = auroraLighting * transmittanceFade;
  #endif

  #if(!$isSunPass)
    //Apply the transmittance function to all of our light sources, and take the
    //stars, planets and Milky Way out of the sky entirely once the sun is up.
    float starDaylightFade = 1.0 - smoothstep(starDaylightCutoffFade, 1.0, sunHorizonFade);
    galacticLighting = galacticLighting * transmittanceFade * starDaylightFade;
  #endif

  //Clouds are marched once per frame into a direction indexed map by
  //CloudRenderer (see cloud-march.glsl), so every pass that shows the sky -- this
  //dome, the sun and the moon targets, both eyes in VR -- just looks them up.
  #if(!$isMeteringPass && $cloudsEnabled)
    vec4 cloudLighting = sampleCloudMap(sphericalPosition);
  #endif

  //Sun and Moon layers
  #if($isSunPass)
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting;

    $draw_sun_pass

    //Combine the cloud lights
    #if($cloudsEnabled)
      combinedPass = (combinedPass + sunTexel) * (1.0 - cloudLighting.a) + cloudLighting.rgb;
    #else
      combinedPass = combinedPass + sunTexel;
    #endif

    //Leave in linear HDR for bloom - tonemapping happens in the output shader
  #elif($isMoonPass)
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting;
    vec3 earthsShadow = getLunarEcclipseShadow(sphericalPosition);

    $draw_moon_pass

    //Now mix in the moon light
    combinedPass = mix(combinedPass + galacticLighting, combinedPass + moonTexel, lunarDiffuseTexel.a);

    #if($auroraEnabled)
      combinedPass = combinedPass + auroraLighting;
    #endif

    //Combine the cloud lights
    #if($cloudsEnabled)
      combinedPass = combinedPass * (1.0 - cloudLighting.a) + cloudLighting.rgb;
    #endif

    //Leave in linear HDR for bloom - tonemapping happens in the output shader
  #elif($isMeteringPass)
    //Cut this down to the circle of the sky ignoring the galatic lighting
    float circularMask = 1.0 - step(1.0, rho);
    vec3 combinedPass = (lunarAtmosphericPass + solarAtmosphericPass + galacticLighting + baseSkyLighting) * circularMask;

    #if($auroraEnabled)
      combinedPass = combinedPass + auroraLighting;
    #endif

    //Combine the colors together and apply a transformation from the scattering intensity to the moon luminosity
    vec3 intensityPassColors = lunarAtmosphericPass * (moonLuminosity / scatteringMoonIntensity) + solarAtmosphericPass * (sunLuminosity / scatteringSunIntensity);

    //Get the greyscale color of the sky for the intensity pass verses the r, g and b channels
    float intensityPass = (0.3 * intensityPassColors.r + 0.59 * intensityPassColors.g + 0.11 * intensityPassColors.b) * circularMask;

    //And bring it back to the normal sRGB afterwards afterwards
    combinedPass = LinearTosRGB(vec4(skyToneMap(combinedPass), 1.0)).rgb;
  #else
    //Regular atmospheric pass
    vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + galacticLighting + baseSkyLighting;

    #if($auroraEnabled)
      combinedPass = combinedPass + auroraLighting;
    #endif

    //Combine the cloud lights
    #if($cloudsEnabled)
      combinedPass = combinedPass * (1.0 - cloudLighting.a) + cloudLighting.rgb;
    #endif

    //And bring it back to the normal sRGB afterwards afterwards
    combinedPass = LinearTosRGB(vec4(skyToneMap(combinedPass), 1.0)).rgb;

    //Now apply the blue noise
    //Use golden ratio for quasi-random temporal offset (R2 sequence)
    float goldenRatio = 1.61803398875;
    float framePhase = fract(uTime * 0.001);
    ivec2 temporalOffset = ivec2(
      128.0 * fract(framePhase * goldenRatio),
      128.0 * fract(framePhase * goldenRatio * goldenRatio)
    );
    combinedPass += (texelFetch(blueNoiseTexture, (ivec2(gl_FragCoord.xy) + temporalOffset) % 128, 0).rgb - vec3(0.5)) / vec3(128.0);
  #endif

  #if($isMeteringPass)
    gl_FragColor = vec4(combinedPass, intensityPass);
  #else
    //Triangular Blue Noise Dithering Pass
    gl_FragColor = vec4(combinedPass, 1.0);
  #endif
}
