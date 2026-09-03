//Draws the diffuse galactic band -- the unresolved starlight of the Milky Way,
//carved by interstellar dust. Two equirectangular textures in galactic
//coordinates: milkyWayEmissionMap (galpy MWPotential2014 line-of-sight density
//integration) and milkyWayAbsorptionMap (SFD-98 dust reddening). Both are
//regeneratable from src/python/milky-way-mapper/.
//
//This chunk is injected into atmosphere-pass.glsl, so every name here is
//prefixed to avoid colliding with the 1200 lines it lands in.

//The maps run galactic longitude DECREASING left to right (l=+180 at the left
//edge, l=0 dead center, l=-180 at the right edge) with the north galactic pole
//on row 0. See src/python/milky-way-mapper/README.md.
const float MILKY_WAY_ONE_OVER_PI = 0.3183098861837907;
const float MILKY_WAY_ONE_OVER_TWO_PI = 0.15915494309189535;

//Longitude of the north celestial pole in galactic coordinates, 122.93192
//degrees. See the derivation in milkyWayGalacticUV below.
const float MILKY_WAY_L_NCP = 2.145566749;

//Reference apparent magnitude the band is exposed at. Feeding this through the
//same Pogson ratio the stars use is what locks the Milky Way to the dim stars:
//it brightens and washes out with them, through every exposure change, with no
//separate fade logic to keep in sync. Lower is brighter.
const float MILKY_WAY_REFERENCE_MAGNITUDE = 5.0;

//Grey-blue of the scotopic (dark-adapted) response -- the band is well below
//the cone threshold, so it reads as a desaturated blue-grey rather than the
//warm 5000K its stars actually emit at. Ratios only; the magnitude comes from
//the exposure above.
const vec3 MILKY_WAY_SCOTOPIC_COLOR = vec3(0.5555555, 0.7777778, 1.0);

//Per-channel dust extinction, split into a physical part and a tuning part.
//
//The ratios come from the standard interstellar extinction curve: relative to
//E(B-V), A_B is about 4.1, A_V about 3.1 and A_R about 2.3, which normalized
//to V gives the vector below. Blue is extinguished hardest, so dust lanes do
//not just darken, they warm -- which is what makes the Great Rift read as dust
//rather than as a hole cut in the band.
const vec3 MILKY_WAY_EXTINCTION_RATIO = vec3(0.742, 1.0, 1.323);

//Overall optical depth. This one is a tuning constant, not a physical one: the
//absorption map stores a log-normalized value rather than true E(B-V), so
//there is no principled conversion. Measured over the band (emission > 0.35,
//3.8% of the sky, median stored absorption 0.53) a strength of 0.75 keeps the
//band blue-grey at a red-to-blue ratio near 0.69 while still swinging the
//saturated lanes warm by about 1.5x. At 2.0 -- the value implied by the
//upstream shader -- the median dust washes the color out to a near-neutral
//0.90 and the scotopic tint stops reading at all.
const float MILKY_WAY_EXTINCTION_STRENGTH = 0.75;

//Recovers true galactic (l, b) from the galacticCoordinates varying and turns
//it into a texture lookup.
//
//The varying is not built with the standard formula. vertex.glsl computes an
//atan2 term without the leading l_NCP term, so what it carries is
//
//  gc = (cos(b) * cos(A), -sin(b), cos(b) * sin(A))   where A = l_NCP - l
//
//That mirrored frame is self-consistent for the star cubemap, which was baked
//with the same formula, but these textures are in true galactic coordinates
//and have to be un-mirrored. Inverting is exact:
//
//  b = asin(-gc.y)
//  A = atan2(gc.z, gc.x)
//  l = l_NCP - A
//
//Verified against the galactic center, the anticenter, l=90 and the north
//galactic pole -- all recover to better than a hundredth of a degree.
vec2 milkyWayGalacticUV(vec3 galacticSphericalPosition){
  float galacticLatitude = asin(clamp(-galacticSphericalPosition.y, -1.0, 1.0));
  float nodeAngle = atan(galacticSphericalPosition.z, galacticSphericalPosition.x);
  float galacticLongitude = MILKY_WAY_L_NCP - nodeAngle;

  //Longitude decreases left to right, so u runs against l. fract() carries the
  //wrap, and the sampler repeats in S to make the seam at l=180 invisible.
  float u = fract(0.5 - galacticLongitude * MILKY_WAY_ONE_OVER_TWO_PI);

  //Three.js flips textures on upload by default, so v=1 samples image row 0,
  //which is b=+90.
  float v = 0.5 + galacticLatitude * MILKY_WAY_ONE_OVER_PI;

  return vec2(u, v);
}

//The texture coordinate plus the screen-space gradient to sample it with.
struct MilkyWayLookup {
  vec2 uv;
  vec2 uvDx;
  vec2 uvDy;
};

//Builds the lookup, correcting the gradient across the l=180 seam.
//
//u wraps there, and fract() turns that wrap into a hard jump from 1 to 0
//inside a single pixel quad. The hardware picks its mip level from the
//screen-space derivative of the texture coordinate, so at that jump it sees a
//derivative of nearly a whole texture width and drops to the 1x1 mip -- which
//paints a hairline of the map's average color straight down the l=180
//meridian. The map averages about 0.117 in emission against roughly 0.075 for
//off-band sky, so the seam reads about 25% too bright: faint, but a dead
//straight line across the sky is exactly the sort of thing the eye locks onto.
//
//Subtracting the nearest integer removes that +/-1 wrap from the gradient and
//leaves it untouched everywhere else, so textureGrad lands on the right mip on
//both sides of the seam and keeps anisotropic filtering working.
//
//dFdx/dFdy are only defined in uniform control flow, so this is called from
//atmosphere-pass.glsl *before* the horizon test rather than from inside it.
MilkyWayLookup milkyWayLookup(vec3 galacticSphericalPosition){
  vec2 uv = milkyWayGalacticUV(galacticSphericalPosition);

  vec2 uvDx = dFdx(uv);
  vec2 uvDy = dFdy(uv);
  uvDx.x -= round(uvDx.x);
  uvDy.x -= round(uvDy.x);

  return MilkyWayLookup(uv, uvDx, uvDy);
}

//Returns the band in the same pseudo-sRGB space drawStarLight returns, because
//the caller converts the whole accumulated galacticLighting to linear in one
//go. Doing our own linearization here would double-convert.
vec3 drawMilkyWay(MilkyWayLookup lookup, float starAndSkyExposureReduction){
  float emission = textureGrad(milkyWayEmissionMap, lookup.uv, lookup.uvDx, lookup.uvDy).r;
  float absorption = textureGrad(milkyWayAbsorptionMap, lookup.uv, lookup.uvDx, lookup.uvDy).r;

  //Same Pogson 100^(1/5) ratio and same exposure clamp the stars use, so the
  //band tracks them exactly.
  float milkyWayBrightness = pow(100.0, (-MILKY_WAY_REFERENCE_MAGNITUDE + min(starAndSkyExposureReduction, 2.7)) * 0.20);

  //Beer-Lambert against the log-normalized dust column. Note this is
  //exp(-tau), not exp(1 - tau): at zero dust the factor must be 1.0, leaving
  //the band untouched.
  vec3 dustExtinction = exp(-absorption * MILKY_WAY_EXTINCTION_STRENGTH * MILKY_WAY_EXTINCTION_RATIO);

  //The sqrt matches the compression drawStarLight applies to its own
  //brightness, keeping the band and the stars on one perceptual curve.
  //
  //The emission map integrates all galactic stellar density, including the
  //~9k catalog stars drawn separately above -- but those are a rounding error
  //against the unresolved billions, so the double-count is not worth
  //subtracting.
  return sqrt(milkyWayBrightness * emission) * milkyWayIntensity * MILKY_WAY_SCOTOPIC_COLOR * dustExtinction;
}
