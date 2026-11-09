# Rain, snow, sleet and hail

The hard part is the one already identified: precipitation is not a sky effect. It falls through the scene, lands on water and terrain, and has to agree with all three libraries at once. So the contract comes first and the particles last.

## Split it into four layers

| Layer | What it is | Who owns it |
| --- | --- | --- |
| 1. Weather field | Where it is precipitating, what, and how hard | The sky |
| 2. Far field | Rain shafts and virga under distant clouds, the grey veil, lost visibility | The sky (cloud march and aerial perspective) |
| 3. Near field | Streaks and flakes around the camera | The sky, drawn into the scene |
| 4. Surface response | Ripples and splashes, wet ground, snow cover | a-water and a-faraway-land, reading layer 1 |

Layers 1 and 2 are valuable alone and involve nothing outside this library. Ship them first.

## Layer 1: the weather field

The clouds already have a weather map (`cloudWeatherMap`, a 60 km tile giving coverage and species) and the sky already publishes a world-anchored ground map for cloud shadows (two cascades, through `worldLighting`). Precipitation should ride on both.

**Rate from the clouds, so it rains where it should.** Define the precipitation rate at a ground point as a function of the cloud above it:

```
rate(x, z) = intensity_tag * precipMask(x, z) * smoothstep(thresholds, columnWaterPath(x, z))
```

The cloud ground-shadow bake (`cloud-ground-shadow-map.glsl`) already marches every deck above each texel of a toroidal, field-anchored map, though along the light, not the vertical. A sibling pass in the same layout, marching straight up, gives the column's water path; it only needs re-baking as the field scrolls, exactly as the shadow does. Rain then falls under the thick parts of cumulonimbus and nimbostratus, not under fair-weather cumulus, with no extra authoring. A low-frequency `precipMask` (one more channel in the weather map) breaks it into cells and showers.

**Type from temperature.** One tag, surface temperature, plus an optional lapse rate, decides the phase: rain above about 2 C, snow below about 0, a mix between. Sleet and freezing rain need a warm layer aloft over cold air at the surface, which is a second tag for those who want it. Hail is tied to the cumulonimbus species and a strength, not to temperature. The halo tags already take a temperature for the ice; share it.

**State that accumulates.** Wetness and snow depth are integrals of rate over time with drying and melting. They must live with the weather field (world-anchored, scrolling with the camera like the shadow cascades) because both other libraries need the same answer. A small ping-ponged texture: wetness rises with rain and decays in sun; snow depth rises with snowfall, falls with temperature and sunlight.

**The contract, `worldLighting` version 2** (or a sibling `StarrySky.weather`):

```
weather = {
  version,
  uniforms: {
    starryPrecipMap,          // world-anchored: rate, type (0 rain .. 1 snow), wetness, snow depth
    starryPrecipMapTransform, // same convention as the cloud shadow cascades
    starryPrecipFallVelocity, // world space, m/s, includes wind
    starryPrecipGlobal,       // rate and type at the camera, for cheap consumers
    starryWindAtGround
  },
  // GLSL (and later TSL) helpers
  //   starryPrecipAt(worldPosition) -> rate, type, wetness, snowDepth
}
```

Design notes:

- Follow the existing rules exactly: live uniform objects spliced by reference, a chunk to include, a ready event, a version number, and neutral defaults (a 1 x 1 dry texture) so readers can wire up before anything is baked.
- The sky must not need to know about terrain. Occlusion (no rain under a roof, snow not settling under an overhang) is the scene's knowledge. Offer an optional hook the other way: a scene may register a top-down depth texture, which the near-field particles and the accumulation pass will respect if present. a-faraway-land has a height field and can supply it.
- Agree on this with both libraries before building layer 3 or 4.

## Layer 2: the far field

**Rain shafts and virga.** Below a precipitating cloud base, add a second, simple density to the cloud march: a function of the precip rate at that column, falling off with distance below the base (virga evaporates before reaching the ground; rain reaches it), sheared sideways by the wind so shafts lean. It is smooth and low frequency, so it can use the coarse step and the cheap lighting path. Phase function: rain is strongly forward scattering with large drops, so shafts are dark against a bright sky and bright when backlit near the sun.

**Extinction.** Rain cuts visibility. A common fit for visible-light extinction in rain is roughly `0.2 to 0.3 * R^0.6` per km with R in mm/h (confirm the constants against a source before use), so heavy rain at 25 mm/h gives a visibility of a few kilometres. Snow is far more opaque for the same water: visibility near 1 km at a liquid-equivalent of 1 mm/h. Feed this to the aerial-perspective volume (`03`) as extra extinction and in-scatter near the ground, so the terrain and sea fade into the rain together with the sky.

**The light.** Under rain the scene is lit by the cloud base. That already works: cloud shadows and the cloud-tinted ambient are in place.

**Rainbows.** Belong here, and the library has the pattern for them: the halo baker. A rainbow is light scattered by spherical drops into a cone 42 degrees from the antisolar point (51 for the secondary, with Alexander's dark band between). Bake a table of scattered colour by angle and drop size (Lorenz-Mie or Airy theory; Sadeghi et al., *Physically-Based Simulation of Rainbows*, 2012, covers non-spherical drops too), and draw it where the view ray passes through sunlit rain: `E_sun * table(angle, dropSize) * rain column along the ray * sun visibility`. Small drops give fogbows, the same table at another size. It needs the cloud shadow map to know where the rain is sunlit, which exists.

**Lightning.** For the cumulonimbus species: a brief point emitter inside the cloud during the march (interior flashes are just a light at a position with a short time envelope), with the scene's ambient pulsed to match. Bolts as geometry can come later. Publish the strike time and position so a scene can time its thunder.

## Layer 3: the near field

Around the camera, out to 30 to 50 m. Beyond that, layer 2's extinction carries it.

**Rendering.** A camera-centred box of instanced particles whose positions wrap: `position = fract(seed + velocity * time - cameraOffset) * boxSize`. No simulation state at all, so it runs on WebGL2 today. Rain is a streak stretched along its velocity relative to the camera, over the exposure time; snow is a soft sprite with a slow tumbling drift.

**Numbers.**

| | Fall speed | Size | Notes |
| --- | --- | --- | --- |
| Drizzle | 1 to 2 m/s | under 0.5 mm | |
| Rain | 4 to 9 m/s | 1 to 5 mm | `v = 9.65 - 10.3 exp(-0.6 D)`, D in mm (Atlas et al. 1973) |
| Snow | 0.5 to 1.5 m/s | 1 to 20 mm flakes | Drifts with wind; nearly all of its motion is horizontal in any breeze |
| Ice pellets (sleet) | several m/s | 1 to 5 mm | Bounces |
| Hail | 10 to 40 m/s | 5 to 50 mm+ | Roughly `9 * sqrt(D in cm)` m/s. Bounces, rare, brief |

For rain the drop-size distribution is Marshall-Palmer, `N(D) = 8000 exp(-4.1 R^-0.21 D)` per m3 per mm. It gives the count of visible drops for a rate, and it means heavy rain is bigger drops falling faster, not just more of them.

**Lighting.** A raindrop is a lens: it shows an inverted wide-angle view of what is behind it, which in practice means it is as bright as the sky and brightest when backlit. Garg and Nayar (*Photorealistic Rendering of Rain Streaks*, 2006) and Tatarchuk (*Artist-Directable Real-Time Rain Rendering in City Environments*, 2006) are the references. A workable minimum: streak radiance from the sky-view table in the refracted direction, plus a forward-scatter term from the sun or moon, times the cloud shadow at the camera. Snow is diffuse and white: sky irradiance plus sun times shadow.

**With a height hook**, cull particles below the registered top-down depth so rain stops under cover.

**On WebGPU**, real particles in a storage buffer: collision with the height field, splashes spawned at impact, hail that bounces, snow that eddies in a curl-noise wind. That is the upgrade path, not the starting point.

**In VR**, keep streak counts honest and sizes in world units. Near-field particles at wrong stereo depth are uncomfortable.

## Layer 4: surface response

Each library implements its own, from `starryPrecipAt(worldPosition)`.

**a-water.** Ripple rings: a tiling, animated normal-map contribution (rings expanding from random points, a well-known small shader) scaled by rate. Heavy rain also flattens short wind waves and whitens the surface with spray, which can be a roughness increase and a slight albedo lift. Hail and large drops: splash sprites, optional. Snow on open water does nothing visible.

**a-faraway-land.** Wetness darkens albedo and lowers roughness (porous ground darkens a lot, rock a little). Puddles where the terrain is flat. Snow cover by depth, masked by slope and by the normal's upward component, with the snow's own albedo and a little sparkle. Both come from the accumulated channels, so the ground is still wet after the shower passes and the snow lingers in shade.

**The atmosphere after rain.** Rain washes aerosol out. Dropping the Mie coefficient after a shower and letting it recover gives the clear, deep-blue sky that follows a storm. With per-frame atmosphere tables (`03`) that is one uniform.

## Order of work

1. Agree the weather contract with a-water and a-faraway-land. Publish it with neutral defaults.
2. Column water path in the ground bake; the precip map; the type from temperature.
3. Rain shafts and extinction in the march and the aerial perspective.
4. Wrapped-box particles for rain and snow.
5. Accumulation (wetness, snow depth).
6. Surface response in the two companion libraries.
7. Rainbows. Lightning. Hail and sleet as variations on rain.
8. Compute particles with collision, on WebGPU.
