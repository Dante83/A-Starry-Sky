# Moving to WebGPU

## What the move actually involves

Under three.js's `WebGPURenderer`, materials are node graphs (TSL). `ShaderMaterial` with GLSL strings, `onBeforeCompile` and edits to `THREE.ShaderChunk` do not carry over. Against that, this library is:

- about 30 GLSL files, turned into JavaScript string arrays by `src/python/create-shader.py` with `$placeholder` substitution;
- one large uber-shader (`atmosphere-pass.glsl`) specialized four ways by string replacement;
- fog implemented by replacing four `ShaderChunk` entries, with uniforms carried in `scene.fog`'s colour, near and far (`01`, item 14);
- world lighting implemented by appending to `lights_pars_begin` and splicing into `lights_fragment_begin` and `lights_fragment_maps`;
- a copy of `GPUComputationRenderer`, `EffectComposer`, `UnrealBloomPass` and friends in `three_js_extensions/`;
- classic scripts and globals, where WebGPU builds of three.js and A-Frame are ES modules.

So this is a rewrite of the rendering layer. The astronomy (C++ and WASM), the asset bakers (Python), the tag parsing and the design of each effect all survive.

**Verify before planning dates.** I checked these on 2026-11-09 by web search only, and the results were thin:

- A-Frame merged `WebGPURenderer` and TSL support in early 2025 ([PR 5655](https://github.com/aframevr/aframe/pull/5655)), for the module build only. I could not confirm how complete it is in the current release.
- three.js release notes for r185 list "Add support for WebXR with WebGPU". Earlier forum threads saying it is impossible predate that.
- TSL compute is reported not to run on the WebGL2 fallback backend.

Check all three against the A-Frame and three.js release notes directly. VR is a core use of A-Frame; if WebXR on WebGPU is not solid on the headsets users have, WebGL2 has to stay a first-class path for longer.

## Shape of the port

**Keep both backends for at least one release.** TSL compiles to WGSL and to GLSL, so shared shading code written once in TSL covers both. Features that need compute are gated, and the WebGL2 path keeps the fragment-shader versions.

**Separate the sky's core from its renderer first**, on WebGL2, before porting anything:

- `core/`: state, interpolation, parameters, table definitions. No three.js imports.
- `render/`: passes that take the core's state and draw.
- A single uniform block (sun, moon, exposure, atmosphere) built in one place. Today six renderers each rebuild the same values.

That refactor is worth doing even if WebGPU slips. It is where most of the duplication in `08` lives.

**Publish world lighting as nodes.** Instead of patching chunks, export TSL functions (`starryCloudShadow(worldPosition)`, `starryAerialPerspective(worldPosition)`, `starrySkyIrradiance(normal)`) and a light node. three's node materials can take them through a custom lighting model; a-water and a-faraway-land import them. This is a cleaner contract than the current one and needs agreeing with those two libraries early.

## Where compute earns its place

Ordered by expected gain for this library.

### 1. Sparse cloud marching

The amortized march exists to work around a rasterizer. `cloud-march.glsl` explains it: marching one texel in sixteen in place cost 84% of the full march, because each fragment warp still paid for its one live texel, so the march draws into a packed target and a second pass merges it back.

In compute that is the natural form. Build a list of texels to march this frame and dispatch exactly that many. Benefits beyond removing the merge pass:

- The list can be prioritized: on-screen first, largest reprojection error first, recently disoccluded first, in place of a fixed Bayer order.
- The budget becomes a number of rays per frame, so the clouds can hold a frame time by marching fewer rays under load.
- Colour and depth are written together to storage textures; no second render target.

### 2. A lighting volume for the clouds

By the shader's own account lighting is three quarters of the march: per lit step, five density samples towards the sun, three up for sky light, three down for ground bounce, and the same again for the moon in twilight.

None of that depends on the view ray. Cache it: a camera-centred 3D grid over the cloud layer (for example 256 x 256 horizontally by 32 to 64 vertically, coarser with distance), each cell holding optical depth to the sun, to the sky above and to the ground below. Update a fraction of it each frame in compute, since it changes only as fast as the clouds drift and the sun moves. The march then does one trilinear read per step.

This is the single largest speed-up available to the clouds, and it is possible on WebGL2 as well by rendering to the layers of a 3D target. Compute makes the incremental update far easier. It also gives cloud shadows, god rays and precipitation lighting (`06`) a shared source.

### 3. Atmosphere tables without readbacks

With Hillaire's tables (`03`): four small compute passes writing straight to 2D and 3D storage textures, every frame or on change. No float readbacks at startup, no 2D-packed atlases, no `Data3DTexture` round trips.

### 4. Stars as geometry

Each sky pixel currently does a cubemap fetch, three `texelFetch` calls, three star evaluations (each with five octaves of noise for scintillation) and five planet tests. The hash cubemap alone was 25 MB before 1.3.0's cleanup.

Draw the catalogue as instanced quads instead: positions, magnitudes and temperatures in a storage buffer, pulled in the vertex stage, additive blending. Cost is proportional to stars drawn, the point spread can be sized per star, and the cubemap disappears. This also works on WebGL2 with instanced attributes, so it need not wait.

### 5. Auto-exposure on the GPU

A luminance histogram of the unexposed frame, built in compute, reduced to an EV on the GPU and read back as one value (or not read back at all: keep exposure in a 1 x 1 texture). Replaces the metering survey, its worker round trip and the `LightingAnalyzer` C++.

### 6. Precipitation particles

Storage-buffer particles with simulation in compute and collision against a height field (`06`).

### 7. Measurement

`timestamp-query` gives real per-pass GPU times. The cloud work in 1.3.0 was clearly done against measurements taken by hand; a built-in profiler overlay makes the next round much faster. Optional feature; check for it.

## Path tracing: where it fits

Path tracing the sky per pixel per frame is out of reach on the GPUs the web runs on, and it would be the wrong tool anyway: the sky is smooth, and the tables already capture it. Three uses are worth building.

**A reference mode.** A progressive volumetric path tracer for atmosphere and clouds, using delta tracking through the same density functions, accumulating over seconds with the sky paused. Its value is as ground truth: every approximation in the march (the eight octaves, the diffusion floor, the powder term, the sky-occlusion softness) was tuned by eye against photographs. With a reference, each can be fitted. It doubles as a photo mode. No hardware ray tracing is involved, since the volumes are procedural; it is a compute loop with a hash-based random number generator.

**Path-traced lighting, cached.** Put the Monte Carlo into the lighting volume from item 2, not into pixels. One or a few light paths per cell per frame, accumulated over hundreds of frames, gives true multiple scattering inside the clouds: bright edges, dark creases, the glow deep in a cumulus. It converges because the lighting changes slowly, and the view march stays a cheap deterministic lookup. This is the version of "path-traced clouds" that can ship. Start from the reference tracer's scattering loop.

**Baked fits.** Use the reference tracer offline to fit the multiple-scattering approximation's parameters by cloud type and sun angle, and ship the fit. That benefits the WebGL2 path too.

## Other WebGPU features worth using

- **HDR canvas output.** Configure the canvas as `rgba16float` with `toneMapping: { mode: 'extended' }` and the sun, its glints on water and the moon can exceed SDR white on capable displays. A sky is close to the best case for HDR output. Needs a display-capability check and a tonemapper with an adjustable peak.
- **Read-only depth attachments** let the aerial-perspective and precipitation passes sample scene depth while depth-testing against it.
- **Indirect draws** for particle counts decided on the GPU.
- **Texture views and per-layer render attachments** simplify the texture-array building in `TextureArrayBuilder`.

## Limits to design around

- `float32-filterable` is optional. Plan the tables for `rgba16float`, which is filterable and writable as a storage texture. That is another reason to pre-expose (`02`): physical luminances overflow half floats.
- Storage textures are write-only except for a few single-channel 32-bit formats. Ping-pong where a pass reads what it writes.
- Default limits are 4 storage textures and 16 sampled textures per shader stage, and 8 colour attachments. The moon pass's history with texture units (19 against a limit of 16) is the same lesson.
- Compute is unavailable on the WebGL2 fallback, so every compute feature needs a fallback or must be optional.
- WGSL has no preprocessor. The `#if($isSunPass)` specialization becomes TSL conditionals resolved in JavaScript at build time, which is cleaner.
- Mobile GPUs and standalone headsets are where the march is most expensive and where WebGPU support is least certain. Test there first, not last.

## A staged plan

1. **Module build and core/render split** on WebGL2 (`08`). No visual change.
2. **Hillaire atmosphere and physical units** on WebGL2 (`02`, `03`). This shrinks the shader surface to be ported.
3. **Port passes to TSL one at a time** behind a renderer check: atmosphere tables, sky dome, sun and moon, stars, aurora, halos. Keep an image-diff test between backends.
4. **World lighting and aerial perspective as nodes**, with a-water and a-faraway-land.
5. **Clouds**: first a straight TSL port of the fragment march, then the compute work list, then the lighting volume.
6. **The reference path tracer**, then cached path-traced lighting.
7. **Compute particles** for precipitation.
8. **HDR output.**

Steps 1 and 2 are the bulk of the risk reduction and deliver value with no WebGPU at all.
