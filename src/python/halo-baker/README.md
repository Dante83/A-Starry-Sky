# Halo atlas baker

Ray traces light through hexagonal ice crystals and packs the resulting halos,
sundogs and arcs into one atlas image for `<sky-halos>`.

## Usage

```
./run.sh                      # bake at the default quality (~5 minutes on 4 cores)
./run.sh --samples 20000000   # smoother, slower
./run.sh --selftest           # check the optics land where the textbook says
./run.sh --budget             # print the texture budget and exit
./run.sh --check-js           # check SkyHalos.js mirrors this layout
```

Output: `assets/halos/halo-atlas.webp` (~470 KB, lossless) and `halo-atlas.json`,
a description of the layout for humans and tooling (the sky itself reads the
layout from `src/js/html_tags/SkyHalos.js`).

First run creates a `venv/` and installs `requirements.txt`.

## What it makes

Each layer is the sky round the sun unrolled into polar coordinates: x is the
angle from the sun (0 to 100 degrees), y is the angle round it measured from
straight up (0 to 180 degrees; the sky is mirror symmetric left to right). The
shader needs only an `acos` and an `atan` to find a pixel, so the halos reach
the zenith without a giant quad round the sun.

| Layers | Population | Makes |
|:---|:---|:---|
| 0 | random orientation | 22 and 46 degree halos |
| 1-12 | horizontal plates, sun at 0, 6 ... 66 degrees | sundogs, parhelic circle, circumzenithal arc |
| 13-24 | horizontal columns, sun at 0, 6 ... 66 degrees | upper and lower tangent arcs, circumscribed halo |

The shader blends the two elevation layers either side of the real sun. The
same layers draw the moon's halos.

## How it works

`crystal.py` traces rays through a hexagonal prism, in the crystal's own frame.
Every ray carries a wavelength (colours come out as smooth rainbow edges, not
three hard copies), refracts by the dispersion of ice, and at every face splits
into reflected and transmitted parts by the Fresnel equations, up to four
internal hits. Every exit, and the external reflection off the entry face,
is a weighted sample of where an observer would see that light.

`bake.py` histograms those samples, divides by the solid angle of each bin,
blurs by the size of the sun's disc, normalises each population against its
own peak (so relative brightness across sun elevations is physical), and
stores `sqrt(intensity / peak)` as 8 bit so the faint outer halos keep their
precision.

## Texture budget

Run `./run.sh --budget`. The whole family is **one** `sampler2DArray`, so it
costs a single texture unit however many layers it has. The sky dome already
carries stars, the Milky Way, clouds and aurora against the sixteen units WebGL2
guarantees. At the default settings:

| | |
|:---|:---|
| Layers | 25, each 320 x 128 RGBA8 (160 KB) |
| GPU memory | 3.9 MB, no mips |
| Atlas image | 1600 x 640, inside the 2048 that WebGL2 guarantees |
| Download | ~470 KB |
| Texture units | 1 |

The layers are shipped as one atlas because that is one download and one
decode. `AssetManager.buildHaloTextureArray` blits each tile into a layer of
the array through `TextureArrayBuilder`, so filtering never bleeds between
neighbours the way it would across tiles of an atlas.

## Keeping the layout in step

The layout constants at the top of `bake.py` are mirrored in
`DefaultData.skyHalos.atlas` in `SkyHalos.js`, and the layer order by the
`HALO_*_LAYER` constants in `src/glsl/halos/halo-functions.glsl`. Change them
together; `./run.sh --check-js` fails if the first two drift apart.

## Editing the shader

The GLSL lives in `src/glsl/halos/` and `src/glsl/atmosphere/`. The `.js`
under `src/js/materials` is generated from it by `src/python/create-shader.py`.

## Tuning the crystals

`PLATE_TILT_DEGREES` and `COLUMN_TILT_DEGREES` in `bake.py` set how much the
crystals wobble as they fall: less makes sharper, brighter sundogs and arcs,
more smears them along the sky. `crystal.sample_half_length` sets how fat or
thin each population is.
