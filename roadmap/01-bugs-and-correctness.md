# Bugs and correctness

Found by reading `development` at `7a98560`. Tags: **[read]** means the code says it on its face, **[suspect]** means it looks wrong but needs a run to confirm. Nothing here was executed.

Ordered by how much a user would notice against how little the fix costs.

## Cheap and user visible

### 1. The default time zone is hard-coded to UTC-7 [read]

`src/js/html_tags/SkyTime.js:20` sets `utcOffset: 7`, while the default date is built from the browser's *local* clock. With no `<sky-time>` tag, a user in Berlin gets their wall-clock time interpreted as Pacific time, so the sun is about eight hours out.

Fix: default to `new Date().getTimezoneOffset() / 60` (already the sign the code uses internally, since the tag value is negated on parse). Better still, pass a UTC timestamp to the worker and drop the offset from the default path entirely.

Related: the date string is `M/D/YYYY H:M:S`, parsed later. Non-ISO date parsing is implementation-defined. Accept ISO 8601 and document it.

### 2. `<sky-atmosphere-height>` is defined but never parsed [read]

`SkyAtmosphericParameters.js` registers the element and documents a default of 80 km, but there is no `getElementsByTagName('sky-atmosphere-height')` and no assignment. The tag is silently ignored.

### 3. `StarrySky.Methods` defaults throw before the sky is ready [read]

`src/js/StarrySky.js:22-23` return `new Vector3()`. There is no global `Vector3`; it should be `THREE.Vector3`. Calling `getSunPosition()` before the renderers exist raises a `ReferenceError` instead of returning a zero vector.

### 4. Ambient hemisphere lights are aimed in the sky frame, not the world frame [suspect]

Everything else converts sky coordinates to world as `(-z, y, -x)` (`placeSourceLight`, the dome's vertex shader, `quadOffset`). `LightingManager.js:564` sets the X and Z hemisphere lights from `sun.position.x` and `.z` directly. If that is not compensated somewhere I missed, the warm side of the ambient light points 90 degrees away from the sun's azimuth, mirrored.

Check: at sunset, light a white sphere with ambient only. The warm side should face the sun.

### 5. Sky altitude uses the dome vertex's height, negated [suspect]

`src/glsl/atmosphere/vertex.glsl:18` builds `vWorldPosition` with `-worldPosition.y`. `atmosphere-pass.glsl:640` then computes the observer's altitude as `cameraHeight + vWorldPosition.y * METERS_TO_KM`.

Two problems. The y is that of a vertex on a 5 km dome, not the camera, so it varies across the sky by up to 5 km. And it is negated, so with the default `cameraHeight` of 0 the clamp pins it at ground level for any camera above the origin. The net effect is that flying the camera up never changes the sky, and a non-zero `<sky-camera-height>` gives a different altitude at the zenith than at the horizon.

Fix: pass the camera's world height as a uniform. `LightingManager.sampleTransmittance` has the same intent but reads `camera.position.y`, which is local to the camera's rig; use `getWorldPosition`.

### 6. The initial metering survey overwrites its own first reading [read]

`SkyDirector.js:823`:

```js
self.transferableSkyFinalLightingFloat32Array = new Float32Array(transferableSkyIntialLightingBuffer);
```

The "final" view is built over the *initial* buffer, so the second readback overwrites the first and the final buffer is transferred to the worker as zeros. It only affects the worker-driven fallback (`useAmbientLUT = false`), which is why nobody has seen it.

Also here: `transferableSkyIntialLightingBuffer` and `transferableIntialSkyLightingFloat32Array` are assigned without declaration (lines 797-798), so they are implicit globals. That throws under strict mode or as an ES module, which matters for the WebGPU port (`04`).

### 7. Colour sub-tag validation checks the wrong variable [read]

`SkyAtmosphericParameters.js:111` tests `tags.length !== 1` inside a loop over `colorTags`. It should be `colorTags.length`. Duplicate `<sky-parameters-color-red>` tags are never reported.

### 8. Tags read on `DOMContentLoaded` only [read]

All ten tag classes attach a `DOMContentLoaded` listener in `connectedCallback`. A sky inserted after the document has loaded (any SPA router, React, a lazy-loaded scene) never parses its tags and never fires `Sky-Data-Loaded`. `SkyDirector` already has the right pattern (`document.readyState` check); the tags need the same.

Each tag also sets `this.data = StarrySky.DefaultData.x` and then mutates it, so the "defaults" object is the live data. A second sky on the page, or a sky removed and re-added, inherits the first one's values.

## The atmosphere bake

These four are in the Elek multiple-scattering bake. They interact, and at least two of them partly cancel, so **do not fix them one at a time** without a way to measure the result. See `03-atmosphere-model.md` for why replacing the bake is the better move.

### 9. The sun's zenith angle along a view ray advances at half rate [read]

`single-scattering.glsl:74` and `kth-inscattering.glsl:115`:

```glsl
sunAngle = initialSunAngle - atan((p.x - pA.x), p.y + RADIUS_OF_EARTH);
```

`p` is already measured from the planet's centre (`pA = vec2(0.0, r)` with `r = R + h`), so the local vertical at `p` has turned by `atan(p.x, p.y)`. Adding `RADIUS_OF_EARTH` again roughly doubles the denominator and halves the angle. Along a 1000 km horizontal path the true turn is about 9 degrees and the code gives about 4.5. It matters most exactly where the sky is hardest to get right: low sun and twilight. The source comment "Was better when this was just the initial angle of the sun" is consistent with this.

### 10. The gathering step is handed an angle where it expects a cosine [read]

`kth-inscattering.glsl:17`:

```glsl
float z = parameterizationOfCosOfSourceZenithToZ(sunAngleAtP);
```

`sunAngleAtP` is in radians (it is used as an angle four lines later). The lookup therefore reads the wrong sun-zenith slice for every order above the first. At a sun zenith angle of 60 degrees it reads the slice for cos = 1.047, which clamps to the overhead sun.

### 11. The gathering integral covers about half a circle, and the path integral is doubled [read]

In `gatherInscatteredLight`, `deltaTheta` is `2 pi / $numberOfChunks` (ray steps minus one, 59 by default) while the loop runs `$numberOfGatheringChunksInt` times (30 by default). So theta sweeps about 6 to 183 degrees, and the weights sum to roughly 2 pi instead of 4 pi.

Separately, both scattering passes accumulate `(previous + current) * chunkLength` with no factor of one half (lines 98 and 136), while the optical-depth sums on the lines above them do have it. Single scattering is therefore twice too bright, and each further order compounds it.

The half-gather and the doubled trapezoid roughly cancel for second order. That is almost certainly an accident, and it stops cancelling at third order and beyond.

### 12. Other approximations in the gather worth knowing about [read]

- The integral is over a circle in the sun's vertical plane, uniformly in angle, not over the sphere. There is no `sin(theta)` weight and no azimuth.
- Each gathered sample is multiplied by the transmittance from P to the top of the atmosphere in that direction. The table it samples already contains the attenuation along that path, so this darkens it twice.
- The phase angle is built as `abs(mod(...)) - PI`, and `cos(x - pi) = -cos(x)`. Harmless for Rayleigh, but it flips the Mie lobe from forward to backward.
- The result has no dependence on the view direction except through the path, so higher orders are treated as isotropic at the last bounce. That part is a reasonable approximation (Hillaire makes the same one).

### 13. Ozone is the wrong colour and about ten times too weak [read]

Defaults: `ozoneBeta = (413.47, 413.47, 2.1e-13)`, `ozonePercentOfRayleigh = 6e-7`, and a tent profile scaled by 0.56. The peak absorption works out to 1.4e-4 per km in red and green equally, and nothing in blue.

Measured Chappuis-band absorption for the wavelengths the Rayleigh coefficients imply is about (0.65, 1.88, 0.085) e-3 per km at the peak of the layer (the values used by Bruneton 2017 and Hillaire 2020, with the same 25 km tent this code already has). Green should absorb nearly three times as much as red. That ratio is what keeps the zenith blue at twilight; with red equal to green the absorption only dims.

Fix: store ozone as its own absorption coefficient with a unit-peak tent, and retire "percent of Rayleigh". Expect the twilight zenith to get bluer and the tuned twilight constants to need another look.

## Smaller things

### 14. Uniforms smuggled through `scene.fog` [read]

`FogRenderer.js:44-47` packs the sun's altitude and azimuth and the moon's altitude into `fog.color`, the moon's azimuth into `fog.near`, and a negative, scaled moon intensity into `fog.far`, with an inverse sRGB transform to undo three's colour management. It works, but any other code that reads `scene.fog` gets nonsense, and it cannot survive a move to node materials. The world-lighting uniforms object is the right home for these.

### 15. Stale comments that will mislead the next reader [read]

- `cloud-march.glsl:668` says the Mie phase "peaks at ~50". Since the coefficient gained its `1/(4 pi)` (see `atmosphere-functions.js`) the peak is about 4 at g = 0.8, so the soft cap at 10 now does far less than the comment describes. Either retune the cap or remove it.
- `LightingManager.js` says moonlight's modifier defaults to "(1, 0.5, 0.1) outside an eclipse" in two places; `SkyDirector` overwrites it from the eclipse table every frame.
- `ELOK_Z_CONST`: the paper's author is Oskar Elek.

### 16. Hard horizon cut for stars [read]

`atmosphere-pass.glsl:732` skips stars when `vLocalPosition.y < 0`. Correct at sea level, but an observer on a mountain sees below the astronomical horizon. Tie it to the geometric horizon for the observer's altitude once item 5 is fixed.

### 17. No resize, no teardown [read]

`pixelsPerRadian`, the sun and moon target sizes and the cloud map size are computed once in `initializeRenderers`. Resizing the window, changing the camera's field of view or entering VR leaves them at their first values. There is also no `remove` handler on the component: render targets, the worker, the lights added to the scene and the patched `THREE.ShaderChunk` entries all outlive the entity.

### 18. One sky per page, one Emscripten module per page [read]

`StarrySky.skyDirectorRef`, `StarrySky.worldLighting` and the bare global `Module` are singletons. Any other non-modularized Emscripten library on the page will collide with `Module`. Build with `-s MODULARIZE=1 -s EXPORT_ES6=1`.

### 19. Ambient light is built from a tonemapped, gamma-encoded sky [read]

The ambient table in `LightingManager` reads the metering pass, which has already been through `skyToneMap` and `LinearTosRGB`, and undoes only the gamma (with `pow(x, 2.2)`, not the sRGB curve it was encoded with). The tonemap's shoulder is still in the data, so bright skies contribute less ambient than they should and the colour is desaturated. The spherical-harmonic projection also weights every texel of an orthographic disk equally, which is a cosine weighting rather than a solid-angle one, and normalizes by texel count.

None of this is worth fixing in place. It goes away when the sky has a linear, unexposed output to integrate (`02`).
