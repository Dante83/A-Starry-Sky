# A-Starry-Sky roadmap: after 1.3.0

Notes for the iteration after the 1.3.0 pre-release, written from a read-through of `development` at `7a98560`.

**How to read these.** Everything here comes from reading the source. Nothing was run, profiled or rendered, so every finding carries one of two tags:

- **[read]** the code says this on its face (a wrong variable, a tag that is never parsed). Still worth a two-minute check before fixing, because several constants downstream were tuned by eye against the current behaviour.
- **[suspect]** the code looks wrong or lossy but I could not confirm the visible effect without running it.

Performance items are reasoned from the shader and pass structure, not measured. The first performance task is to get real numbers (see `07-performance.md`).

## The files

| File | What it covers |
| --- | --- |
| [01-bugs-and-correctness.md](01-bugs-and-correctness.md) | Bugs found while reading, ranked, with file and line |
| [02-physical-units-guide.md](02-physical-units-guide.md) | Cliff notes for moving the sky to physical units, written for whoever (human or model) does the work |
| [03-atmosphere-model.md](03-atmosphere-model.md) | Replacing the Elek tables: better equations, ozone, twilight, altitude |
| [04-webgpu-migration.md](04-webgpu-migration.md) | What WebGPU buys, what it costs, compute and path tracing, a staged plan |
| [05-cirrus-and-high-clouds.md](05-cirrus-and-high-clouds.md) | Why the low-deck recipe cannot make cirrus, and a design that can |
| [06-hydrometeors.md](06-hydrometeors.md) | Rain, snow, sleet, hail, and the contract with a-water and a-faraway-land |
| [07-performance.md](07-performance.md) | Startup and per-frame costs worth attacking on WebGL2 today |
| [08-code-health.md](08-code-health.md) | Duplication, build, tests, dead code |
| [09-features.md](09-features.md) | Smaller features and API gaps |

## If time is short: the order I would work in

1. **Fix the cheap bugs in `01`** (items 1 to 8). Each is a few lines and several are user visible: the default time zone, an ignored tag, an API that throws, ambient light facing the wrong way.
2. **Decide the atmosphere question before touching units.** The Elek bake has at least four independent errors in its multiple scattering (`01`, items 9 to 12) that partly cancel. Repairing them one by one will change the sky's brightness and colour each time and invalidate tuned constants each time. Replacing the model once (`03`) is less total work than fixing it in place, and it is the natural moment to change units.
3. **Physical units in one sweep, behind a switch** (`02`). Not piecemeal: half-converted is worse than either end.
4. **Cirrus as a 2D sheet** (`05`). It is cheap to render, independent of the volumetric march, and it lets halos come from the ice cloud that causes them.
5. **Weather contract v2, then rain shafts, then near-field particles** (`06`). The contract is the hard part and should be agreed with a-water and a-faraway-land before any particle is drawn.
6. **WebGPU** (`04`) as a staged port, with the build and module work from `08` done first because the port depends on it.

## The three things I would not skip

- **The time zone default** (`01` item 1). A user who drops in `<a-starry-sky>` with no tags gets their local clock read as UTC-7. Outside the US west coast the sun is in the wrong place on first run.
- **A reference test for astronomy** (`08`). Sun and moon altitude and azimuth against a published ephemeris for a few dozen date and place pairs. It is an afternoon of work and it protects the part of the library users trust most.
- **An energy audit before and after any atmosphere change** (`02`, "Probes"). A handful of numbers (zenith luminance at noon, horizontal illuminance, the twilight curve) turns "looks right" into something a future change can be checked against.
