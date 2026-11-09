# Cirrus and the high clouds

I do not know which approaches were tried and abandoned, so this starts from why the existing machinery is structurally the wrong fit, then proposes one that is not.

## Why the low-deck recipe cannot make cirrus

The low and mid decks follow the Nubis and takram recipe: a 2D footprint, a height profile, and 3D noise that *erodes* a solid body. Every part of that is built to make lumps.

| | Cumulus (what the recipe is for) | Cirrus |
| --- | --- | --- |
| Shape | Compact, isotropic, convex | Filaments 10 to 100 times longer than wide, aligned with wind shear |
| What makes the shape | Rising parcels with a flat base | Ice falling out of a small source cell and being drawn out by shear |
| Optical depth | 10 to 100; a surface with a lit skin | 0.03 to 3; no surface at all, you see through it |
| Thickness against altitude | 1.5 km at 1.5 km | A few hundred metres at 9 km |
| Lighting that matters | Multiple scattering, self-shadowing | Single scattering through a thin sheet, by an ice phase function |

Concretely, in this renderer:

- **Erosion makes blobs.** `remap(d, 1 - shape, 1)` on isotropic Perlin-Worley can only round things off. Stretching the noise domain gives stretched blobs, which read as altostratus streaks, not fibres.
- **The march cannot resolve it.** A 300 m sheet at 9 km seen 10 degrees above the horizon is crossed in about 1.7 km of path that starts 50 km away, where the adaptive step (`CLOUD_STEP_GROWTH = 0.004`) is already 200 m. A handful of jittered samples through a filament a few tens of metres wide is noise.
- **The temporal filter eats what is left.** One texel in sixteen marched per frame with long history at the horizon is tuned for soft, thick, slowly changing bodies. Thin high-contrast streaks are exactly what such a filter blurs or ghosts.
- **The lighting is solving the wrong problem.** Eight octaves of multiple scattering, a diffusion floor and a powder term describe optically thick water cloud. On a sheet with an optical depth of 0.3 they mostly compute "nearly nothing" at great expense.

## The proposal: a 2D sheet, lit analytically

Shipped engines draw cirrus as textured layers for these reasons, and it is not a compromise here: a sheet whose thickness is under one percent of its distance is, to the eye, two-dimensional.

### Geometry

A spherical shell at the cirrus altitude (8 to 12 km, a tag). For a view ray, intersect the shell (`cloudDistanceToHeight` already does this), take the horizontal position of the hit, and read a 2D optical-depth field `tau(x, z)` there. The slant optical depth is `tau / mu`, with `mu` the cosine between the ray and the local vertical *at the hit* (the mid deck already takes this care).

No march. One or two texture reads per pixel, with mipmaps and anisotropic filtering doing the prefiltering for free. That last point is the real win: the hardware filters a 2D texture at grazing angles correctly, and nothing in a volumetric march can.

### Lighting

Thin enough for single scattering to dominate, so it is closed form:

```
L = E_sun(at shell) * P_ice(theta) * albedo * (1 - exp(-tau/mu_v)) * shadowing + skylight term
```

More carefully, for a slab lit at `mu_s` and viewed at `mu_v` from below, the single-scattered transmission has the standard form

```
L = E * P(theta) * mu_s / (mu_s - mu_v) * (exp(-tau/mu_s) - exp(-tau/mu_v))
```

with the usual limit when the two cosines are equal. Add a small multiple-scattering term proportional to `tau^2` for the thicker patches. The sun's colour comes from the transmittance table at the shell's altitude with the local vertical there, which is what makes cirrus stay pink long after the ground is dark, with no special case.

Composite it behind the mid deck in the cloud map (or directly in the sky dome pass, since it needs no temporal filter): sky times `exp(-tau/mu_v)` plus `L`.

### The phase function is the halo

Ice crystals have a sharp forward peak, a bump at 22 degrees, a weaker one at 46, and a flat side-scatter. The library already ray traces those crystals: `src/python/halo-baker/` produces the halo atlas.

So unify them. The halo atlas *is* the angular part of `P_ice`. Today halos are drawn with their own gains (`sunHaloGains`) and an `iceCloud` amount unrelated to any cloud on screen. With a cirrus sheet, the halo's brightness at each pixel becomes `E * P_halo(direction) * f(tau)` using the sheet's own `tau` there. Halos then appear where there is cirrostratus and break up where the sheet does, which is how real ones look, and the `<sky-halos>` tags become properties of the ice in the high deck. Keep a manual override for scenes that want a halo in a clear sky.

Add the smooth part of the ice phase function to the baker's outputs (a 1D table by scattering angle), so the sheet's general brightness and the halo come from the same crystals.

### Making the optical-depth field

This is where the look is won or lost, and it should be baked offline, like every other asset here, so it can be iterated on without touching shaders.

Physically, cirrus uncinus is a small generating cell that sheds ice. The crystals fall at about 0.5 to 1 m/s through air whose horizontal wind changes with height, so the trail is drawn out into a long streak, curved where the shear changes: the hook.

A baker that follows that story:

1. **Seed generating cells.** Sparse points, clustered (a Worley or Poisson pattern modulated by a large-scale mask), each with a strength and a lifetime.
2. **Trace fall streaks.** For each seed, integrate a trajectory: horizontal displacement is the integral of `(wind(z) - wind(head)) / fallSpeed` over the fall. With a simple shear profile that is a curve; with a profile that changes with depth, a hook. Splat density along it, thinning as the ice sublimates.
3. **Add fibre.** Convolve along the local streak direction (line integral convolution of fine noise along the trajectory field). This gives the combed, hair-like texture that stretched noise cannot.
4. **Warp gently** at large scale so the streaks are not parallel rulers.
5. **Make it tile**, at something like 60 to 120 km so repeats are beyond the horizon distance of the shell (about 350 km to the geometric horizon at 10 km, but perspective hides repeats well before that).

Bake several channels into one texture, so one tag blends between species:

| Channel | Species | Character |
| --- | --- | --- |
| R | Cirrus fibratus and uncinus | Streaks and hooks from the tracer above |
| G | Cirrostratus | A near-uniform veil, tau 0.1 to 1, with faint fibre. The halo maker. |
| B | Cirrocumulus | Fine ripples and grains: small cellular noise modulated by a wave pattern, cells well under a degree across |
| A | Coverage mask | Large-scale patches, so the sheet has edges and gaps |

At runtime: `tau = coverage(mask, tag) * mix(species...) * density`, two scrolled samples at different scales to hide the tiling, the fine one fading with distance by mip bias. The streak direction should follow `cloudWindDirection` at altitude, which wants its own tag since upper winds rarely match surface winds.

A cheaper first version, to prove the lighting before writing the tracer: domain-warped, strongly anisotropic ridged noise, with the stretch axis rotated by a low-frequency curl field. It will look like a decent cirrostratus and a mediocre cirrus. The lighting, compositing and halo coupling can all be built against it.

### Shadows and the rest of the sky

- Thin cirrus dims the sun by `exp(-tau/mu_s)` and softens shadows. Feed its mean transmission to the sun's irradiance for the lower decks and the ground; that is the "watery sun" before a front. It does not need the shadow map.
- It belongs in `cloudMeanSkyRadiance` so the lower decks see a brighter, whiter sky under a veil.
- It should reach the environment and reflection path through `worldLighting`, as the cloud map does.

### Suggested tags

`<sky-high-cloud-coverage>`, `<sky-high-cloud-type>` (cirrus to cirrostratus to cirrocumulus), `<sky-high-cloud-height>`, `<sky-high-cloud-wind>` (direction and speed aloft), and an asset tag for the baked texture. Match the low and mid decks' naming.

## Related things the same sheet buys

- **Contrails.** Straight segments that spread and fade, splatted into a small dynamic copy of the optical-depth field. Very recognizable, very cheap.
- **Iridescence and coronae.** Diffraction colours in thin cloud near the sun or moon: a 1D colour table by angle, scaled by thin-cloud optical depth. The lunar corona through thin altostratus is a common, pretty sight that the sky currently cannot show.
- **Noctilucent clouds.** A second, much higher sheet (about 83 km) lit only in deep twilight, visible at high latitudes in summer. Same code, different altitude and texture, and the twilight lighting falls out of the transmittance lookup.
- **The cumulonimbus anvil.** The towering species ends at a flat top today. An anvil is an ice sheet spreading at the tropopause; a patch of this layer anchored over a storm cell, fed by the weather map, would finish it.

## Order of work

1. The shell intersection, single-scattering lighting and compositing, against placeholder noise.
2. The smooth ice phase table from the halo baker, and halos driven by the sheet's optical depth.
3. The streak tracer and the baked species texture.
4. Coupling to the lower decks' sun and sky light.
5. Contrails, coronae and the rest as time allows.
