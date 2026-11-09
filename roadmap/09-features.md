# Smaller features and API gaps

The large items have their own files (`03` atmosphere, `05` high clouds, `06` precipitation). These are the rest, grouped by how much they ask for.

## Runtime control

Today almost everything is read once from tags at load. Aurora activity is the exception, and it shows the pattern works.

- **Set time, speed and place while running.** `StarrySky.Methods.setDate()`, `setSpeed()`, `setLocation()`. The state engine already recomputes from a date; it needs a path that resets the interpolation endpoints. This is the most-asked-for kind of feature for a sky: time-lapse scrubbing, a day-night slider, tying the sky to a game clock.
- **Getters for what the sky knows.** Current date and time, sun and moon altitude and azimuth in degrees, moon phase and illuminated fraction, next sunrise and sunset, whether an eclipse is in progress, the current exposure. Most are already computed.
- **Events.** `sunrise`, `sunset`, `moonrise`, twilight boundaries, eclipse contacts. Scenes want to turn on street lights.
- **Live tags.** A `MutationObserver` on the tag tree, driven by the declarative tag table in `08`, so changing `<sky-cloud-coverage>` in the DOM changes the sky. Coverage, cloud type, heights, wind, haze and halo parameters are already uniforms or could be.
- **Weather presets and transitions.** `setWeather('overcast', {over: 600})` blending coverage, type, haze and wind over time. Individually the tags exist; what is missing is interpolating them together.

## Robustness

- Resize, field-of-view change and entering or leaving VR should recompute target sizes (`01`, item 17).
- `remove()` on the component: dispose targets, terminate the worker, remove lights, restore `ShaderChunk`.
- `webglcontextlost` and `webglcontextrestored`.
- More than one sky per page, or at least a clear error on the second.
- A visible failure when WebGL2 or float render targets are missing. `auditTextureUnitBudget` is a good model: it explains what went wrong.

## Sky content

- **Evolving clouds.** The field slides rigidly with the wind. Slowly morphing the weather map and advecting the detail noise upward and along the shear would let cumulus build and decay. The caches (shadow cascades, amortized history) assume a rigid field, so this needs a "rate of change" they can budget for.
- **Wind shear between decks.** One wind for everything today. Decks moving in different directions is a strong depth cue and nearly free.
- **Fog and mist as a ground-hugging layer.** A third deck at height zero with its own simple density, using the same march. Valley fog at dawn, sea fog. Ties into the aerial-perspective volume.
- **Crepuscular rays.** The ground shadow map's own comment anticipates them ("later every sample of air the god rays march through"). With an aerial-perspective volume (`03`), sample the cloud shadow per froxel.
- **Shooting stars and satellites.** A meteor is a short bright streak with a random radiant, or a real shower radiant on the right dates. Satellites are a moving point visible only near twilight when they are sunlit and the ground is not; the geometry is already in the engine.
- **Remaining planets, and the bright ones as disks.** Uranus and Neptune are below naked-eye visibility and can be skipped. Venus as a crescent and Jupiter with its moons matter only with a zoom; note it for a telescope mode.
- **Star catalogue depth and proper motion.** For far-past or far-future dates, precession is already implied by the engine's date handling (worth confirming) but proper motion is not. Niche; note the valid date range in the README.
- **Zodiacal light, airglow structure, gegenschein** (`03`).
- **Light pollution.** A tag for Bortle class or zenith sky brightness that adds a horizon-weighted glow and raises the floor. Most users live under it, and it makes "dark site" a meaningful contrast. One term in the night floor.
- **The moon's surface at altitude.** The moon is drawn at six times its size, so its 512 x 512 maps are under strain; the texture-size logic in `SkyDirector` already caps at the art's resolution. Higher-resolution maps as an optional asset tier.
- **Solar eclipse detail.** Baily's beads and the diamond ring from the lunar limb profile; shadow bands; the 360-degree sunset glow during totality, which falls out of an atmosphere model that handles a partly shadowed sky.
- **Other worlds.** With atmosphere parameters as uniforms (`03`), a Mars preset (thin, dust-dominated, butterscotch day and blue sunset) is a few numbers. A crowd-pleaser, and a good test that nothing is hard-coded to Earth.

## Integration

- **Environment map for reflections and image-based lighting.** A small cube or octahedral map of the sky with clouds, refreshed a face at a time, set as `scene.environment`. Standard materials then pick up sky reflections with no patching. The world-lighting comments mention an environment capture; make it a supported, documented output.
- **Spherical-harmonic sky light as a `LightProbe`**, replacing three hemisphere lights. It is what the code already computes before it throws the detail away by sampling six axes.
- **Shadow cascades for the sun's own shadow map.** One orthographic shadow camera of fixed size follows the camera today. three's cascaded shadow maps add-on, or at minimum texel-snapping the shadow camera to stop shimmer as the sun moves.
- **Plain three.js entry point.** The sky's core has little to do with A-Frame beyond the component wrapper and tag parsing. `new StarrySky.Sky(renderer, scene, camera, options)` would widen the audience considerably, and the core/render split (`04`) nearly produces it for free.
- **TypeScript declarations** for the public API and the `worldLighting` and weather contracts, so the companion libraries get checked against them.

## Documentation

- The README is 922 lines and is the only reference. Generate the tag reference from the declarative table (`08`) so it cannot drift from the parser. It would have shown that `<sky-atmosphere-height>` does nothing.
- A page on units and exposure for scene authors once `02` lands: what intensity to give a lamp so it looks right at dusk.
- A page on performance tiers with measured numbers per device class.
- The `worldLighting` contract deserves its own document with a minimal example material; at the moment it lives in a source comment.
