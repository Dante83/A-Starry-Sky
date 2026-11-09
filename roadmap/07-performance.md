# Performance on WebGL2, today

None of this was measured. It is reasoned from what each pass does per pixel and per frame. So the first item is the measuring.

## 0. Get numbers

- `EXT_disjoint_timer_query_webgl2` around each pass (clouds march, merge, resolve, shadow bakes, aurora, sky dome, sun target, moon target, bloom chains), shown in a debug overlay behind a tag. It is unavailable in some browsers; the overlay should say so.
- A fixed benchmark scene and camera path, so two commits can be compared.
- Startup timing: time to first sky frame, split into asset load, WASM start, table bake, shader compile.

The cloud comments in 1.3.0 quote measured percentages, so some of this tooling exists informally. Check it in.

## Startup

**Synchronous float readbacks.** `readRenderTargetPixels` is called from 18 places. At startup: the 512 x 512 transmittance table, then a 256 x 1024 float readback for each of Mie and Rayleigh at single scattering and again at every scattering order (4 by default), then two final sums, each re-uploaded as a `Data3DTexture`. Then `LightingManager` renders and reads the 64 x 64 metering target 64 times to build the ambient tables. Each call stalls the pipeline.

- Render directly into the layers of a `WebGL3DRenderTarget`. No readback, no re-upload.
- Or do not bake at all for default parameters: the tables are a pure function of constants. Ship them as a binary asset, or cache them in IndexedDB keyed on a hash of the parameters.
- Replacing the model (`03`) removes most of this outright.
- The ambient tables want a GPU reduction (render the 9 spherical-harmonic coefficients for all 32 sun altitudes into one small target, read once) or to be dropped in favour of integrating the sky-view table.

**Shader compilation.** The sky compiles the uber-shader four ways, the cloud march three ways, plus resolve, shadow, aurora and bloom programs, all on first use on the main thread. Use `renderer.compileAsync` (which uses `KHR_parallel_shader_compile` where present) before the first frame, and show the scene only when it resolves. Neither appears in the source today.

**Shader source size.** The bundle is 787 KB, 584 KB minified. A minifier cannot do much with it because most of the weight is GLSL held as arrays of strings, **comments included**: the long explanatory comments in `cloud-march.glsl` and `atmosphere-pass.glsl` are shipped to every user and handed to the GLSL compiler on every load. Strip comments and whitespace from shaders at build time. The comments are valuable; they belong in `src/glsl`, not in `dist`.

**The transmittance table is 512 x 512 float32 RGBA**, 4 MB, and is copied twice on the CPU. 256 x 64 half float is the usual size for this function, which is smooth.

## Per frame

**The sky dome's atmosphere term.** Per pixel, per light: two 3D-table reads, two more for the horizon "shadow" sample, an eight-iteration bisection with a ray-sphere intersection in each, and two phase functions. Both lights are always evaluated. A sky-view table (`03`) turns this into one 2D read. Short of that, skip the moon's whole term when its intensity times fade is zero, and the sun's likewise, by compiling variants as the cloud march already does.

**Stars.** Per sky pixel above the horizon: a cubemap read, three `texelFetch`, three calls to `drawStarLight` and five planet distance tests. `drawStarLight` exits early unless the pixel is within reach of its star, so the expensive part (two ray-sphere intersections for airmass, six noise evaluations for scintillation) only runs near stars. But the fetches and distance tests run for every pixel of sky, day and night. Cheap wins:

- Skip the whole star block when `starDaylightFade` is zero, with a uniform branch.
- The airmass for scintillation depends only on the view direction, and one of its two intersections is a constant; compute it once per pixel, not once per star.
- Longer term, draw stars as instanced sprites (`04`, item 4), which also works on WebGL2.

**Sun and moon targets.** Each is re-rendered every frame through its own `EffectComposer` with a multi-level bloom, at up to 2048 x 2048. The moon's appearance changes over minutes. Re-render it when its phase, libration, eclipse state or exposure has changed by a threshold, or every N frames. The sun's target mostly changes with altitude (reddening); the same applies. The moon pass also re-evaluates the sky, stars and halos behind the body.

**Clouds.** Already heavily optimized. What is left is structural:

- The lighting volume (`04`, item 2) is the big one and does not need WebGPU.
- The three extra draws per frame for sky light (the 32 x 32 mid-deck map and the 3 x 1 ambient map, each texel averaging 144 sky directions with several 3D-table reads apiece) could update every few frames; sky light changes slowly.
- The cloud field never changes shape, only slides. That makes everything bake-friendly, and it is why the toroidal shadow map works. If evolving clouds are ever added (`09`), the caches need invalidation rules; design for it.

**CPU and garbage.** Per-frame allocations in hot paths: `Float32Array.slice()` on the WASM heap in `SkyDirector`, the 18-element `hemi` array and several closures in `LightingManager.tick`, `new THREE.Vector3` for the camera look-at. Small, but A-Frame scenes on standalone headsets are sensitive to GC pauses. Hoist them to scratch objects.

`WorldLightingRenderer` walks the scene every 30 frames looking for unpatched materials. On large scenes that is a periodic hitch. Patch on `object3dset` and `child-attached` events, or on first render through `onBeforeRender`.

**The worker.** The astronomy worker recomputes the sky state every 20 sky-minutes and the main thread interpolates. That is a sound design. But the second half of the worker, the auto-exposure and lighting analysis, is unused while `useAmbientLUT` is true, and still initializes, allocates and takes the first survey (`08`).

## Memory

- Two full copies of the transmittance table on the CPU (one transferred to the worker, one kept).
- Sun and moon composers at up to 2048 x 2048 with bloom mip chains, half float.
- Cloud targets: the comments put two half-float targets at 1536 near 38 MB, and up to about 270 MB at the 4096 cap.
- Check what happens on context loss. Nothing in the source handles `webglcontextlost` or `restored`; baked tables and history targets would be gone.

## Quality-for-cost knobs worth exposing

A single `<sky-quality>` tag (low, medium, high, ultra) that sets cloud resolution and steps, amortization side, shadow resolution, aurora steps, bloom levels and table sizes together. Then, with pass timings available, an optional dynamic mode that steps quality down when the frame time is over budget. On headsets that matters more than any single optimization here.
