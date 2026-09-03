# Milky Way Map Generator

Generates the two textures that `src/glsl/stars/milky-way.glsl` samples to draw
the galactic band:

| Output | Source | Default size | Runtime |
| --- | --- | --- | --- |
| `assets/milky_way/milky-way-emission-map.webp` | galpy `MWPotential2014` | 1536x768 | ~3 hours, all cores |
| `assets/milky_way/milky-way-absorption-map.webp` | SFD-98 dust reddening | 4096x2048 | ~20 min + 128 MB one-time download |

Neither needs to be re-run to build the project -- both outputs are committed.
This tool exists so they are reproducible rather than opaque binaries.

## Usage

```bash
./run.sh --dust          # absorption map only
./run.sh --glow          # emission map only (slow)
./run.sh --all           # both, dust first

./run.sh --glow --size 256    # quick low-res sanity run
```

First run creates `venv/` and installs `requirements.txt`; later runs reuse it.
The `--dust` path downloads the SFD-98 FITS pair (~128 MB) into the venv on
first use and skips the download afterwards.

## Coordinate convention

Both maps are **equirectangular in galactic coordinates**, 2:1 aspect:

* Row 0 is the **north galactic pole** (b = +90), the bottom row is b = -90.
* Galactic longitude **decreases left to right**: l = +180 at the left edge,
  l = 0 (the galactic center) dead center, l = -180 at the right edge.

This is the standard Gaia/Planck all-sky convention. It is worth stating
explicitly because the two upstream generators in `three-starry-sky` disagreed
with each other on handedness -- the dust exporter used this convention and the
glow generator used the mirror of it. The emission map is mirror-symmetric
(`MWPotential2014` is axisymmetric), so the disagreement was invisible there and
silently mirrored the dust lanes. `generate_glow_map.py` has been moved onto
this convention so the two agree.

If you regenerate the dust map and want to check the orientation, probe a few
known complexes -- Taurus (l=173, b=-15), Rho Ophiuchi (l=353, b=+17), the LMC
(l=280.5, b=-32.9) and Orion A (l=209, b=-19.4) should all land on bright
pixels. Against a global mean near 24/255 they read around 142, 135, 85 and 75
respectively; a mirrored or flipped map drops every one of them toward the mean.

## What the maps contain

**Emission** is intrinsic brightness with **no dust applied**. For every pixel
the script walks 50 samples from 0.1 to 20 kpc along the sightline, evaluates
`MWPotential2014`'s stellar mass density at each, and sums. The result is
normalized against its own 99th percentile, blurred, and collapsed to a single
channel -- the shader supplies the color, so the chroma was only ever costing
bytes.

**Absorption** is E(B-V) color excess, log-normalized:

```
stored = log1p(2 * E(B-V)) / log1p(2 * max_ebv)
```

with `max_ebv` the 99.5th percentile of the queried map (`--metadata` writes the
exact value alongside the texture). The log matters: E(B-V) spans ~0 to 10+
magnitudes, and a linear 8-bit encoding would flatten every high-latitude
sightline -- most of the sky -- into the bottom couple of codes.

The shader does not decode this back to E(B-V). It treats the stored value as a
relative optical depth and feeds it into a per-channel exponential, folding the
calibration into its tuning constants. That is deliberate: the dust lanes need
to read correctly against an artistically scaled emission map, not to be
photometrically correct.

## Why two textures instead of one packed RG map

Packing emission into R and absorption into G halves the sampler count, and the
upstream project does exactly that by compositing them onto a canvas at load
time. It is not worth it here. Lossy WebP chroma subsampling mangles
independently-packed channels -- at quality 90 the round-trip error reaches
**73/255 on the R channel** -- so a packed map has to be lossless, which costs
579 KB at 2048x1024. Two separate *grayscale* maps compress cleanly at around
115 KB combined, and grayscale has no cross-channel artifacts to worry about.

The cost is one extra sampler. Note that the worst-case moon pass (clouds +
aurora + eclipse shadow LuT) already binds 17 samplers, past WebGL2's guaranteed
minimum of 16; this takes it to 19. That is fine on the >=32-unit hardware the
project already requires, but it is the budget to watch if anything else is
added.

## Provenance and licensing

* **Emission** -- galpy, Bovy (2015), ApJS 216, 29. `MWPotential2014` is
  calibrated against Milky Way rotation-curve and mass observations.
  galpy is BSD-3-Clause.
* **Absorption** -- Schlegel, Finkbeiner & Davis (1998), ApJ 500, 525, retrieved
  through the `dustmaps` package (Green 2018, JOSS 3, 695).

## Dependencies

See `requirements.txt`. `galpy` and `dustmaps` are independent of each other;
the two scripts share only numpy/scipy/Pillow, and one venv serves both.
