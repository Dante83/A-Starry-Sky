# Physical units: cliff notes

For whoever converts the sky to physical units, person or model. Read the whole file before changing any constant. The work has failed before for a small number of repeatable reasons, listed under "How this goes wrong".

## Where the code is today

The sky runs in private units. Lengths are fine (kilometres in the atmosphere tables, metres in the clouds and the scene). Light is not. A partial inventory of the scale factors that currently stand in for units:

| Where | What |
| --- | --- |
| `SkyDirector.tick` | `sun.intensity = 10 * I / 1367`, `sun.luminosity = 100000 * I / 1367`, `moon.intensity = 500 * x`, `moon.luminosity = 200 * x` |
| `SkyAtmosphericParameters` | `solarIntensity: 1367`, `lunarMaxIntensity: 29` (the real ratio is about 400,000 to 1) |
| every renderer | `skyState.sun.intensity * solarIntensity / 1367.0`, repeated in six files |
| `atmosphere-pass.glsl` | `sunDiskIntensity = 30.0` times a further `3.0`; `SKY_BASELINE`; `starsExposure`; the legacy star washout built on an sRGB-encoded value |
| `atmosphere-pass.glsl`, `cloud-march.glsl` | `sunHorizonFade` squared, the `fogGate` smoothsteps, the soft caps on the Mie phase |
| `LightingManager` | light colours gamma-encoded, clamped to 1 and normalized to their own maximum; ambient level from a hand-built gate; `PEAK_*` constants |
| `FogRenderer` | `exposure = 0.012`, "tuned by eye" |
| aurora | pinned to the night floor by contrast because the floor itself is not in real units |

Each of those was a reasonable local fix. Together they mean no two parts of the sky agree on what "1.0" is, which is why every new feature (clouds lit by the sky, aurora against the night, halos against the sun) has needed its own hand-tuned bridge.

Two deliberate departures from reality sit on top, and both should survive the conversion:

- The sun and moon are drawn at 3.38 and 3.15 degrees across, about six times real size.
- Night is far brighter than real, so it can be seen on a monitor.

## The target convention

Pick this once and write it at the top of the shared GLSL chunk.

**Linear Rec.709 RGB whose luminance is in cd/m2.** That is, `dot(rgb, vec3(0.2126, 0.7152, 0.0722))` is a luminance in nits. Everything that is a radiance (sky, cloud, sun disk, moon disk, aurora, halo, fog in-scatter) is in these units. Everything that is an irradiance (sun on the ground, sky light on the ground) is in lux with the same RGB weighting.

Then:

| Quantity | Unit | Notes |
| --- | --- | --- |
| Scattering and extinction coefficients | km^-1 in the atmosphere, m^-1 in clouds | Already true. Keep the conversion at one named boundary. |
| Phase functions | sr^-1, integrating to 1 over the sphere | Already true for Rayleigh, Mie and Henyey-Greenstein. |
| Transmittance | unitless | |
| Atmosphere tables | sr^-1: radiance per unit of the light's illuminance | So one table serves the sun and the moon. Multiply by lux at lookup. |
| Sun, moon | illuminance at the top of the atmosphere, lux | The disk's luminance is derived: L = E / solid angle. |
| Stars, planets | illuminance, lux | Point sources have no luminance. See below. |
| Exposure | one scalar | Applied once, at the end (or pre-applied, see "Half floats"). |

The dimensional check that catches most mistakes: a single-scattering term is

```
coefficient [km^-1] x path [km] x phase [sr^-1] x transmittance [1] x illuminance [lx]  =  cd/m2
```

If a line of shader does not reduce to cd/m2 or lux, it is wrong or it is a perceptual adjustment that belongs in the last stage.

## Numbers to hold the result against

Approximate, from standard photometric references. Good to a factor of about 1.5, which is all a probe needs. Record the source of whichever exact figures you adopt.

| Quantity | Value |
| --- | --- |
| Sun, illuminance above the atmosphere | about 128,000 to 133,000 lx |
| Sun plus sky on the ground, clear noon | about 100,000 to 120,000 lx |
| Sky alone on the ground, clear noon | about 10,000 to 20,000 lx |
| Clear sky luminance, away from the sun | about 2,000 to 8,000 cd/m2 |
| Sun disk luminance | about 1.6e9 cd/m2 |
| Sun's angular radius | 0.00465 rad, solid angle 6.8e-5 sr |
| Overcast day on the ground | about 1,000 to 10,000 lx |
| Sunset, sun on the horizon | about 400 lx |
| End of civil twilight (sun at -6 degrees) | about 3 lx |
| End of nautical twilight (-12 degrees) | about 0.01 lx |
| Moonless night, stars and airglow | about 0.001 lx |
| Full moon, high in the sky | about 0.1 to 0.3 lx |
| Full moon disk luminance | about 2,500 cd/m2 |
| Dark night sky, 22 mag/arcsec2 | 1.7e-4 cd/m2 (the aurora code already uses this) |
| Magnitude 0 star | 2.5e-6 lx; in general `E = 10^(-0.4 (m + 14.18))` lx |
| Sky brightness from magnitudes | `L = 1.08e5 * 10^(-0.4 m)` cd/m2, m in mag/arcsec2 |
| Aurora | 1 kR (IBC I, barely visible) to 1000 kR (IBC IV) of 557.7 nm |

The span from noon to a moonless night is eight orders of magnitude. That number drives two of the design decisions below.

## What each part becomes

**Atmosphere.** The tables already store something close to radiance per unit irradiance. After the model is repaired or replaced (`03`), the lookup is `L = E_light * (phase_R * S_R + phase_M * S_M)` with `E_light` in lux and no further factor. The horizon fades and fog gates exist because the tables stop at a sun 16.6 degrees below the horizon and misbehave before that; fix the tables and delete the fades rather than converting them.

**Sun disk.** `L_disk = E_sun * transmittance * limbDarkening / solidAngle`. For the cinematic disk use the *drawn* solid angle. A disk 6.4 times wider covers 41 times the solid angle, so it must be 41 times dimmer per pixel for the ground to receive the same light. That is the correct trade and it also keeps the disk inside a half float.

**Moon.** Same form. The existing Jensen-style irradiance in `Moon.cpp` is already physically based relative to the sun; what is unphysical is the `500` and the `29` applied afterwards. Carry the ratio through untouched and let exposure make moonlight visible.

**Stars and planets.** A point source delivers illuminance, not luminance. The radiance a pixel shows is `E_star * PSF(r)`, where the point spread function integrates to 1 over solid angle and so has units of sr^-1. Consequences worth knowing in advance: star brightness per pixel depends on the PSF's width in steradians, so the PSF should be defined in angle, not in pixels, or stars will change brightness with resolution and field of view. The `sqrt` compression of star brightness and the washout terms are perceptual and belong in the last stage, if anywhere. With a real exposure, stars disappear in daylight on their own and `starDaylightCutoffFade` can go.

**Clouds.** The march is already energy conserving and already in "the sky's own units", so it converts by inheritance once its inputs do. Check the sky-light and ground-bounce terms: they take a mean radiance and treat it as arriving from a hemisphere, which is right, and the ground term divides an irradiance by pi, which is right.

**Aurora.** Emission in Rayleighs converts to luminance directly: for the 557.7 nm line, 1 kR is roughly 2e-4 cd/m2, about the dark sky's own level (1 R is 1e10 / 4 pi photons per m2 per second per steradian; multiply by the photon energy and by 683 lm/W times the photopic response at that wavelength, and redo this for each line rather than trusting the figure). The contrast pin against `darkSkyReferenceLuminance` then disappears.

**Scene lights.** In current three.js, a `DirectionalLight`'s `intensity * color` is an irradiance on a surface facing it, and ambient and hemisphere lights are also irradiances; both pass through the same Lambert term with its `1/pi`. So the directional light is `E_sun * transmittance` in lux, and the hemisphere lights are the sky's cosine-weighted irradiance in lux, straight from an unexposed integration of the sky. No gamma, no clamp, no normalizing to the maximum channel. Confirm against the three.js revision A-Frame ships before relying on this paragraph; the conventions changed around r155.

## Exposure, and keeping the night watchable

Physical units without an exposure model give a white screen at noon and a black one at night. The exposure model is where the artistic decisions go, and keeping them there is the point of the exercise.

- **One exposure scalar.** `exposure = 1 / (1.2 * 2^EV100)`, with `EV100 = log2(L_avg * 100 / 12.5)` for a metered average luminance. Sunny day is about EV 15, full moon about EV -2, starlight about EV -6.
- **Exposure compensation that depends on the scene's level**, so auto-exposure does not turn night into a grainy day. A standard curve brightens dark scenes less than a pure average-to-grey meter would. This one curve replaces the brightened `SKY_BASELINE`, the `0.3` moon gate and the ambient floor.
- **Scotopic shift, optional.** The blue tint and loss of colour in moonlight are properties of the eye. Apply them after exposure as a function of adapted luminance. The fixed "cool cinematic tint" on the moon's directional light becomes an output of this, and a low orange moon lights the scene orange in the linear data, as it does in reality.
- **Clamps on adaptation**, in EV, exposed as tags. A user who wants a stylized bright night sets a floor on EV.

## Half floats

A half float tops out at 65,504. The sun's disk at 1.6e9 cd/m2, a specular highlight of the sun, and even a white wall in noon sun (about 30,000 cd/m2) are at or over the edge.

So **pre-expose**: multiply by `exposure` where light enters the pipeline (light intensities, sky radiance, emissive terms) and keep `renderer.toneMappingExposure` at 1. Every buffer then holds values near 1. Use last frame's exposure, and when temporal history is reprojected (the cloud resolve, the amortized march), rescale history by `exposure_now / exposure_then` or it will ghost through an exposure change.

The eight-orders span also means a sun term and a moon term should not be summed in one half-float target at absolute scale. With pre-exposure they are, safely.

## The cost to users, and the switch

A scene with its own lights at `intensity: 1` and emissive materials at `1` is in no units at all. Once the sun is 100,000 lx times an exposure of about 1e-5, those still work, but only by coincidence of both being near 1 after exposure. A user light of 1 that used to compete with the old sun (intensity about 4) will not behave the same.

- Ship it behind `<sky-units>` with `legacy` as the default for one release.
- Publish `StarrySky.exposure` (the live scalar) and document that user lights in physical mode are in lux times that exposure. a-water and a-faraway-land read it through `worldLighting`.
- Bump `worldLighting.version`.

## How this goes wrong

The repeatable failure modes, roughly in order of how often they bite.

1. **Converting one piece at a time.** The pieces are bridged by hand-tuned constants. Convert the sky dome alone and the clouds, fog, ambient and stars all go wrong at once, and the temptation is to add a new constant to each. Convert a whole light path in one change: source, tables, every consumer, exposure.
2. **Fixing brightness with a multiplier.** If something is 10 times too dim after conversion, a unit is wrong somewhere upstream. Find it. A multiplier that makes noon look right will be wrong at twilight.
3. **Radiance and irradiance confused.** The factors are pi (Lambertian surface: `L = albedo * E / pi`) and the source's solid angle (`L = E / omega`). A stray pi or 4 pi is the signature.
4. **Exposure applied twice**, or to something that is not light (a transmittance, an albedo, an alpha).
5. **Gamma on linear data, or the reverse.** `LightingManager` currently gamma-encodes light colours before handing them to three, which treats them as linear. All light quantities are linear until the final encode.
6. **Tonemapping before the data is finished.** The ambient table reads a tonemapped sky today (`01`, item 19). Bloom, auto-exposure metering and ambient integration all need the unexposed, un-tonemapped image.
7. **Clamping to 1.** `Math.min(1.0, ...)` on a light colour was a guard for the old units and silently caps everything in the new ones.
8. **Keeping a hack that compensated for an old error.** After the tables are fixed, the horizon fades, fog gates, Mie caps and washout floors are compensating for nothing. Remove each one deliberately and look at what changes.
9. **Trusting the picture.** A tonemapper will make almost any input look plausible. Use the probes.

## Probes

Add a debug hook that returns unexposed values, and a script that prints them for a fixed place and a set of sun altitudes. Suggested set:

- Luminance at the zenith and at 90 degrees from the sun, sun at 60, 30, 10, 0, -6, -12, -18 degrees.
- Horizontal illuminance from the sun and from the sky separately, same altitudes. Compare with the twilight rows of the table above.
- Sun disk luminance times the disk's drawn solid angle. It must equal the sun's illuminance on a surface facing it.
- Full moon at 45 degrees: disk luminance, ground illuminance, and their ratio to the sun's.
- Under a full overcast: ground illuminance as a fraction of clear-sky.
- A magnitude 0 star's summed pixel radiance times pixel solid angle. It must equal 2.5e-6 lx at any resolution.

Check these into the repository with their expected ranges. They are the regression test for every later change to the atmosphere.

## Reading

- Bruneton, *Precomputed Atmospheric Scattering*, the 2017 reimplementation and its documentation. The clearest worked example of carrying spectral radiance through to luminance in an RGB renderer.
- Hillaire, *A Scalable and Production Ready Sky and Atmosphere Rendering Technique* (2020). Sun in lux, sky in nits, per-frame tables.
- Lagarde and de Rousiers, *Moving Frostbite to Physically Based Rendering* (2014), the chapters on light units, exposure and pre-exposure.
- Jensen et al., *A Physically-Based Night Sky Model* (2001), already the source for the moon here.
- Kirk and O'Brien, *Perceptually Based Tone Mapping for Low-Light Conditions* (2011), for the scotopic stage.
