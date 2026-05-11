# Eclipse-Shadow LuT baker

Generates the 2D RGB lookup texture used by the lunar-eclipse moon shader,
the moon's atmospheric halo, and the scene's direct + ambient lighting. The
parameterization follows Schneegans et al. 2025,
*Physically Based Real-Time Rendering of Eclipses*, Computer Graphics Forum
44(2), Eqs. 3-4.

## Usage

```
./run.sh
```

Default action converts the CC0-licensed `earthShadow.tif` from a local
CosmoScout VR checkout (the output of the authors' full pipeline: extended
Bruneton multi-scattering + refraction + limb-view integration) into our
sRGB-encoded lossless WebP, applies a gamma=2.0 perceptual lift so the
radiometrically-tiny umbra reads as visible red, and bicubic-upsamples to
2048x2048.

Output: `assets/lunar_eclipse/eclipse-shadow-lut.webp` (~170 KB).

The conversion is reproducible — re-run any time after updating the source
TIFF or tweaking the brightness/gamma knobs.

First run creates a `venv/` and installs `requirements.txt`. Subsequent runs
reuse it but always re-sync requirements (cheap if nothing changed).

### Knobs

```
./run.sh --size 256          # native source resolution (no upsample)
./run.sh --gamma 2.5         # more dark lift, brighter umbra
./run.sh --gamma 1.5         # less dark lift, more physical
./run.sh --brightness 2.0    # additional linear multiplier, clips at 1.0
./run.sh --input <path>      # alternate source TIFF
./run.sh --out <path>        # alternate output (extension picks format: .webp or .png)
```

### Fallback: from-scratch baker

`./run.sh --simple` runs `bake.py`, our original approximate baker that
integrates the chord transmittance directly without multi-scattering or
refraction. Produces a too-red penumbra (no blue Rayleigh contribution from
the sunlit atmospheric limb) so it's not used for production. Kept for
experimentation.

## Source data

The default input is `~/Documents/webland/cosmoscout-vr/resources/textures/earthShadow.tif`
(CC0-1.0, German Aerospace Center / DLR). CosmoScout VR is MIT-licensed.
Both compatible with anything downstream.
