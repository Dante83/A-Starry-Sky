# The atmosphere model

## Where it stands

The sky is Elek's 2009 model: a 512 x 512 transmittance table and two 256 x 32 x 32 in-scattering tables (Rayleigh and Mie), baked once at startup with the atmosphere's parameters compiled into the shaders as constants. The sky dome, the clouds and the fog all read them.

What that costs:

- **The bake is wrong in several places** (`01`, items 9 to 13) and the errors partly cancel.
- **The sun's zenith axis stops at 16.6 degrees below the horizon** (`cos = -0.2857`, from `inverseParameterizationOfZToCosOfSourceZenith`), and the parameterization is coarse well before that. Twilight is patched at lookup time with `sunHorizonFade` squared, a horizon-sampled "shadow" table read, and an eight-step bisection per pixel per light for the Earth's shadow.
- **The view axis is linear in the cosine of the zenith angle**, so the horizon, where the sky changes fastest, gets the fewest texels.
- **Rays that hit the ground are stored as zero**, so the table has a hard edge at the horizon that every lookup has to clamp away from (`max(cosOfViewAngle, 0.0)` appears throughout).
- **Parameters are compile-time constants.** Changing haze or altitude at runtime means recompiling every shader and re-baking.
- **Startup does synchronous float readbacks** to turn 2D render targets into 3D textures: about 4 plus 2 per scattering order, each a megabyte.
- **Altitude is not really supported** (`01`, item 5), and the clouds assume the observer is below them.

## Recommendation: replace it with Hillaire 2020

*A Scalable and Production Ready Sky and Atmosphere Rendering Technique* (Hillaire, EGSR 2020) fits this library unusually well. Four small tables:

| Table | Size | Rebuilt | Holds |
| --- | --- | --- | --- |
| Transmittance | 256 x 64 | when the atmosphere changes | Transmittance to the top of the atmosphere, by height and view zenith |
| Multiple scattering | 32 x 32 | when the atmosphere changes | Total higher-order scattering as a closed-form series, by height and sun zenith |
| Sky view | about 192 x 108 | every frame, or every few | The sky's radiance for the current observer and sun, latitude and longitude, with texels concentrated at the horizon |
| Aerial perspective | 32 x 32 x 32 froxels | every frame, or every few | In-scatter and transmittance between the camera and any point in view |

Why it suits A-Starry-Sky:

- **It deletes the bake's bug class.** Multiple scattering is one small integral with an analytic infinite series, in place of the iterated gather.
- **It is cheap enough to run per frame**, so atmosphere parameters become uniforms. Haze, humidity and altitude can change while the sky runs. That is the hook rain and snow need (`06`): turbidity that rises under a storm.
- **The sky dome becomes one texture read** in place of two 3D-table reads, two bisections and two phase evaluations per pixel per light.
- **It works from the ground to orbit.** The camera-height bug goes away by construction.
- **The aerial-perspective volume is the thing `WorldLightingRenderer`'s comments already promise** ("the aerial perspective volume with its god rays will join it here"). It replaces the Preetham-derived fog chunk and gives a-water and a-faraway-land the same haze the sky has, by one 3D lookup.
- **It runs on WebGL2.** No compute needed. It ports to WebGPU compute trivially later.

Caveats, so nobody is surprised:

- The sky-view table cannot hold the sun's disk or sharp features; those stay analytic, as now.
- Its multiple scattering assumes an isotropic phase function for the higher orders. Fine for Earth; visibly off only for very dense atmospheres.
- The Earth's shadow at twilight comes from marching with a planet-shadow test in the sky-view pass. That is about 30 steps per texel of a 192 x 108 table, not per screen pixel.
- The clouds read the old tables in many places (`cloudSkyRadiance`, the fog subtraction at the end of the march). Each needs a new source: the sky-view table for sky radiance, the aerial-perspective volume or a short analytic march for the cloud's own fog.
- Two lights means two sky-view tables, or one table with both lights marched together. The second is simpler; the table is small.

Do this and the units conversion (`02`) together. The new tables are naturally "radiance per unit illuminance", and every hand-tuned twilight constant has to be revisited either way.

## If the Elek bake is kept instead

Then fix it properly and all at once, with the probes from `02` recorded before and after:

1. `atan(p.x, p.y)` for the sun's angle along the ray.
2. Pass a cosine to `parameterizationOfCosOfSourceZenithToZ`.
3. Integrate the gather over the sphere with a solid-angle weight, using the gathering step count for both the step and the loop.
4. Halve the trapezoid sums.
5. Drop the extra transmittance in the gather and correct the sign of the phase angle.
6. Render straight into the layers of a 3D render target to remove the readbacks.

Expect the sky to change brightness and hue at each step. It is the larger job of the two for a worse result.

## Improvements that apply either way

**Ozone.** Store it as an absorption coefficient, about (0.650, 1.881, 0.085) e-3 per km at the peak, with the existing 25 km tent at unit height. Retire `ozonePercentOfRayleigh`. See `01`, item 13.

**Atmosphere top.** 80 km today; 100 km is the usual choice and costs nothing.

**Mie.** One exponential layer with a scale height of 1.25 km and g = 0.8 describes clean continental air. Worth adding:

- A turbidity or visibility tag that scales the Mie coefficient, so "hazy summer afternoon" is one number. Koschmieder's relation ties it to a visibility distance the user can reason about: `visibility = 3.912 / extinction`.
- A better phase function. Cornette-Shanks at one g has no back-scatter rise and too narrow a peak. The Jendersie and d'Eon fit (*An Approximate Mie Scattering Function for Fog and Cloud Rendering*, 2023) blends Henyey-Greenstein with Draine's function, is parameterized by droplet diameter, and costs about the same. It would serve fog, haze and cloud droplets with one function.

**Spectral accuracy.** Three wavelengths get noon right and sunsets slightly wrong, since the red channel stands in for a wide band. Bruneton's 2017 code shows the standard fix: bake with a few more wavelengths and convert to RGB with fitted constants. Low priority; note it and move on.

**Refraction.** Not modelled. The sun and moon set about half a degree late in reality and flatten near the horizon. Bennett's formula applied to the apparent altitude of the sun, moon and stars is a few lines in the interpolation engine. The flattening is a nice touch for the cinematic disk.

**Ground albedo in the atmosphere.** Light bounced off the ground brightens the lower sky noticeably over snow or sand. The clouds already read `<sky-ground-color>`; the atmosphere tables should too. In Hillaire's model it is one term in the multiple-scattering table.

**Night sky floor.** `SKY_BASELINE` is a constant colour times transmittance. Airglow is a thin emitting layer near 90 km, so it brightens towards the horizon (the van Rhijn effect) before extinction takes over within a few degrees of it. Zodiacal light along the ecliptic and the gegenschein are cheap analytic additions for dark-sky scenes, and the engine already knows where the ecliptic is.

## What can be deleted afterwards

With a model that is right through twilight: `sunHorizonFade` and `moonHorizonFade` as brightness terms, the `mieShadow` and `rayleighShadow` lookups, `earthsShadowGeometry` and its bisection, `fogGateSun` and `fogGateMoon` in the cloud march, the soft caps on the Mie phase, the 2D-packed 3D texture helpers (`get3DUVFrom2DUV`, the packing constants), and the readback code in `AtmosphericLUTLibrary`.
