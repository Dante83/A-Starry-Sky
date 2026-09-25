precision highp sampler3D;

//Bakes how much sun and moon light gets through the mid deck, for everything
//beneath it, into a map of the ground plane around the observer. Each texel is a
//point in the middle of the deck, at the horizontal position the map covers there;
//the shadow of the deck along each light is integrated through that point. The
//march then looks it up where a sample's own ray towards the light crosses the
//middle of the deck (see cloudShadowMapTransmittance in cloud-march.glsl), and
//blurs it by reading a coarser mip the further below the deck the sample is.
//
//Transmittance goes in the map, never optical depth: blurring a shadow means
//averaging the LIGHT that arrives from across a patch of cloud, and the mips
//average whatever is stored. The mean of exp(-tau) is not exp(-mean tau).
//
//  r  sun, direct:  exp(-tau), the unscattered beam, sharp but for the sun's own
//                   half degree
//  g  sun, diffuse: the rest of what gets through, scattered forward. Diffusion
//                   theory has the total through a slab at 1 / (1 + 0.75 (1 - g) tau),
//                   g about 0.85 for droplets. It leaves the base of the deck in a
//                   wide cone, so it is blurred over about the drop below the deck.
//  b, a             the same for the moon
//
//The map is centred on the observer and moves with them. The wind is already in
//the density (cloudNoiseOffset), so it is baked fresh every frame.

varying vec2 vUv;

uniform vec3 sunPosition;
uniform vec3 moonPosition;
uniform float cloudShadowMapExtent;     //Meters of ground the map spans, edge to edge

//Matches CLOUD_DIFFUSION_K in cloud-march.glsl.
const float CLOUD_SHADOW_DIFFUSION_K = 0.11;
const int CLOUD_SHADOW_MAP_SAMPLES = 8;

$cloudDensityFunctions

//Direct and diffuse transmittance through the mid deck, along a light, through the
//point c in the middle of the deck.
vec2 cloudShadowMapBake(vec3 c, vec3 light){
  float cosLight = max(dot(light, cloudLocalUp(c)), 0.05);
  float midDepth = midCloudTop() - midCloudBase();
  float pathLength = min(midDepth / cosLight, 8.0 * midDepth);
  float stepLength = pathLength / float(CLOUD_SHADOW_MAP_SAMPLES);
  float opticalDepth = 0.0;
  for(int i = 0; i < CLOUD_SHADOW_MAP_SAMPLES; ++i){
    vec3 q = c + light * ((float(i) + 0.5) * stepLength - 0.5 * pathLength);
    opticalDepth += stepLength * midCloudDensityCheap(q, length(q));
  }
  float direct = exp(-opticalDepth);
  return vec2(direct, max(1.0 / (1.0 + CLOUD_SHADOW_DIFFUSION_K * opticalDepth) - direct, 0.0));
}

void main(){
  //A point in the middle of the deck, over this texel. The deck is a spherical
  //shell, so it sits a little lower in the local frame away from the observer.
  vec2 xz = (vUv - 0.5) * cloudShadowMapExtent;
  float middle = 0.5 * (midCloudBase() + midCloudTop());
  vec3 c = vec3(xz.x, middle - dot(xz, xz) / (2.0 * cloudObserverRadius), xz.y);

  gl_FragColor = vec4(cloudShadowMapBake(c, sunPosition), cloudShadowMapBake(c, moonPosition));
}
