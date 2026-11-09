# Code health: duplication, build, tests

## Build

**Every shader exists three or four times.** `src/glsl/x.glsl` is the source. `src/python/create-shader.py` turns it into `src/js/materials/.../x.js`, an array of string literals, using `x-template.txt`. Both generated files are committed, and then concatenated again into `dist/`. A change to one shader touches four files, and nothing stops the copies drifting (the `.glsl` and the `.js` can disagree if the script is not run).

**The toolchain is not in the repository.** `.gitignore` excludes `package.json` and the lock file, so the minifier and its version are unrecorded. The WASM build is an `emcc` command inside `src/python/watch-wasm.py`. A new contributor cannot reproduce `dist/`.

**`dist/` holds three generations** of the bundle (master, 1.2.0, 1.3.0), full and minified: 3.3 MB of JavaScript in git that changes on every release. `src/csv_files/hygdata_v3.csv` is another 32 MB.

Proposal:

- Commit `package.json`. Use a bundler (esbuild or Rollup) with a GLSL loader that resolves `#include`, strips comments and minifies. Delete the generated `.js` materials and the templates.
- Keep `$placeholder` substitution only where a value truly must be a compile-time constant (loop bounds). Everything else becomes a uniform or a `#define` passed through `material.defines`, which three already supports. That also removes most of the shader recompiles a runtime parameter change would need.
- ES modules, with a UMD build for script-tag users. Required for WebGPU (`04`).
- Build the two WASM modules with `-s MODULARIZE=1 -s EXPORT_ES6=1`, from an npm script. Consider merging them: the interpolation engine and the state engine share constants and a hand-maintained float layout.
- Publish to npm and attach bundles to GitHub releases. Keep only the current build in `dist/`, or none.
- Move the star catalogue out of the main tree (a release asset, or fetch it in the baker script).

## Tests

There are none, and no CI. In rough order of value for effort:

1. **Astronomy against an ephemeris.** A table of sun, moon and planet altitude and azimuth for a few dozen dates and places, from JPL Horizons or Skyfield, checked against the WASM state engine in Node. Tolerance of a few arcminutes. Include a known solar and a known lunar eclipse, a date before 1900 and one after 2100, and both hemispheres. This guards the feature the library is named for.
2. **The unit probes** from `02`. Numbers with expected ranges.
3. **Tag parsing.** Each tag: default, valid value, out-of-range value, duplicate. Pure DOM, fast. Would have caught `01` items 2 and 7.
4. **A headless smoke test.** Load each example in headless Chromium, wait for `starry-sky-atmosphere-ready`, fail on any console error or shader link failure. Run it in CI on every push. Would have caught the 19-texture-unit moon pass.
5. **Golden images.** A handful of fixed times and camera angles, compared with a tolerance. Noisy across GPUs, so run on one software rasterizer in CI and treat as a change detector.

## Duplication

**Constants that must match across files, by comment only.**

| Constant | Copies |
| --- | --- |
| `CLOUD_MAP_K` / `AURORA_MAP_K` (1.0723687100246826) | `cloud-march.glsl`, `cloud-resolve.glsl`, `atmosphere-pass.glsl` (twice), `aurora-march.glsl`, `starry-world-lighting-pars.glsl`, `AuroraRenderer.js`, `SkyDirector.js` |
| `SKY_TONEMAPPER` and the tonemapping functions | `atmosphere-pass.glsl`, `moon-and-sun-output.glsl`, `fog-pars-fragment.glsl` |
| Eclipse constants (`U_SHADOW_LUNAR`, shadow and moon radii) | `atmosphere-pass.glsl`, `SkyDirector.js` |
| `RADIUS_OF_SKY`, `DEG_2_RAD`, `1367.0`, `29.0` | several files each |
| Worker event ids and the float layout of the state buffers | `SkyDirector.js`, `starry-sky-web-worker.js`, and the C++, as bare indices (`[14]`, `[24]`, `[28]`) |

One `constants` module for JavaScript, one shared GLSL chunk, and for the buffer layout a single schema (a list of named fields) from which the JavaScript offsets and a C header are generated.

**The same uniform assignments in six renderers.** `skyState.sun.intensity * atmosphericParameters.solarIntensity / 1367.0`, the moon's equivalent, sun and moon positions, fades and the moon's light colour are set line by line in `AtmosphereRenderer`, `SunRenderer`, `MoonRenderer`, `MeteringSurveyRenderer`, `CloudRenderer` and, differently packed, `FogRenderer`. One shared uniforms object, updated once per tick and spliced into each material by reference. `WorldLightingRenderer` already documents this pattern.

**`AtmosphericLUTLibrary.js`** is 400 lines, of which roughly 300 are the same two blocks repeated: "configure a computation variable" six times and "read back and build a `Data3DTexture`" eight times. Two helpers bring it to about 100, and make the readback fix in `07` a one-place change.

**`SkyAtmosphericParameters.js`** parses three colour tags with three copies of the same 12 lines. More broadly, all ten tag files repeat: register children, fetch by tag name, warn on duplicates, parse, clamp. A declarative table (`{tag, key, type, min, max, default}`) can drive parsing, validation, default handling, a `MutationObserver` for runtime changes (`09`), and the README's reference section.

**`SunRenderer.js` and `MoonRenderer.js`** are near twins: quad, composer, bloom, XR toggling, uniform updates. One `BodyRenderer` with two configurations.

**`three_js_extensions/`** vendors `BufferGeometryUtils` (787 lines), `EffectComposer`, `RenderPass`, `ShaderPass`, `CopyShader`, `LuminosityHighPassShader`, `UnrealBloom` and a `GPUComputationRenderer`. With a module build these are imports from `three/addons`, except where the copy was deliberately modified (the bloom has been). Mark the modified ones and diff them against upstream so the changes are known.

**The uber-shader.** `atmosphere-pass.glsl` serves the dome, the sun, the moon and the metering pass through `#if($isSunPass)` and friends. Sharing is right, but the mechanism makes the file hard to follow: the sun pass computes nearly nothing the others do. Split it into chunks (atmosphere lookup, stars, halos, tonemap) included by four short top-level shaders.

## Dead and vestigial code

- **The worker-driven lighting path.** With `useAmbientLUT = true` (hard-coded), `LightingAnalyzer.cpp`, `ColorInterpolator.cpp`, the auto-exposure events, `updateAutoExposure`, `_tick_lightingInterpolations`' colour outputs and the fallback half of `LightingManager.tick` are unused, yet the worker still initializes them and the first metering survey is still taken and transferred. It also carries the bug in `01` item 6. Remove it, or put it behind a tag and test it.
- **`MeteringSurveyRenderer`** then exists only to bake the ambient tables at startup.
- **The WASM's own lunar `lightingModifier`**, overwritten every frame by the eclipse table in `SkyDirector`. `getLunarEclipseState`'s colour outputs can go.
- In shaders: `getSpectralColor()` (returns white), `earthsShadowIntensity` (its own comment says it has no callers), `vec3Modulo`, `ONE_OVER_EIGHT_PI`, `mieGCoefficient`, `depthInPixels`, `inscatteredUV2`, and `uvt` in `kth-inscattering.glsl`, which is computed and never read.
- In `SkyDirector`: `this.i`, `transferableIntialLightingFloat32Array` (declared, never used; its misspelled sibling is the implicit global), `FOUR_SECONDS`.
- `FogRenderer` passes Preetham's `turbidity = 2.53` and `rayleigh = 3.0` into a model the comments say is now Elek-consistent. No `$rayleigh` or turbidity placeholder remains in `src/glsl/fog/`, so both look like leftovers; confirm and remove.

## Smaller hygiene

- `StarrySky = {...}` and several other assignments create implicit globals. Add `'use strict'` or move to modules and fix what breaks.
- Identifier typos in shared names make searching harder: `Ecclipse`, `Atmospher`, `Depedent`, `intitial`, `transferrable`, `ELOK`. Fix them in one mechanical pass when the buffer schema is generated.
- The long comments are an asset. Many record measurements and failed experiments ("tried: it darkened every cloud"). A few are now stale (`01`, item 15). When a constant is retuned, update or delete its story.
- `src/cc-stuff` is a one-line attribution note in the source root; move it into `THIRD_PARTY_NOTICES.md`.
- `src/js/lut_libraries/hush.md` should stay exactly where it is.
