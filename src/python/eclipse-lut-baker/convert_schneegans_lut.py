#!/usr/bin/env python3
"""Convert the CC0-licensed Schneegans earthShadow.tif from CosmoScout VR
(tools/eclipse-shadow-generator output) into our project's WebP format.

The source TIFF is 256x256 32-bit-float linear RGB:
  resources/textures/earthShadow.tif  (in the CosmoScout VR repo)
Its parameterization matches ours exactly:
  u_shadow = phi_sun / (phi_sun + phi_occ)
  v_shadow = delta / (phi_sun + phi_occ)
File convention: y=0 (top of image) is v=1.0 (outside the shadow);
y=H-1 (bottom) is v=0.0 (umbra core).

The pre-baked file already encodes the full physical pipeline from
Schneegans et al. 2025: extended Bruneton multi-scattering with refraction,
limb-view integration per LuT cell. That's roughly 7000 LOC of CUDA + C++ +
GLSL we'd otherwise have to port. We just need to repackage it.

Steps:
  1. Read the TIFF (linear float32, 256x256x3)
  2. Optional bicubic upsample (default 2048 to match our previous bake size)
  3. sRGB-encode to 8-bit. Mid-tones still get good precision; the deep
     umbra (~0.001 linear) loses precision in 8-bit but is essentially
     pitch-dark in real renderings anyway.
  4. Write as lossless WebP at the same path as bake.py's default output.

License notes:
  - CosmoScout VR source: MIT (we ported nothing, just consuming their output)
  - earthShadow.tif data: CC0-1.0 (public domain)
  Both are compatible with anything we ship.
"""

import argparse
from pathlib import Path
import numpy as np


def linear_to_srgb(x):
    """Linear-light RGB to sRGB-encoded RGB. Vectorized."""
    x = np.clip(x, 0.0, 1.0)
    return np.where(
        x <= 0.0031308,
        12.92 * x,
        1.055 * np.power(x, 1.0 / 2.4) - 0.055,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument(
        "--input", type=Path,
        default=Path("/home/david/Documents/webland/cosmoscout-vr/resources/textures/earthShadow.tif"),
        help="Path to the CosmoScout VR earthShadow.tif",
    )
    parser.add_argument(
        "--out", type=Path,
        default=Path(__file__).resolve().parents[3] / "assets" / "lunar_eclipse" / "eclipse-shadow-lut.webp",
        help="Output path (extension chooses the format).",
    )
    parser.add_argument(
        "--size", type=int, default=2048,
        help="Output resolution (square). Source is 256x256; we bicubic-upsample. "
             "Use 256 to keep native size.",
    )
    parser.add_argument(
        "--brightness", type=float, default=1.0,
        help="Linear-light multiplier applied before sRGB encoding. The "
             "Schneegans LuT is physically calibrated (umbra ~= 0.001), so "
             "the umbra is near-pitch-black in 8-bit sRGB. Raise this if you "
             "want a more cinematically visible umbra at the cost of "
             "physical accuracy. Values clip to 1.0 after multiply.",
    )
    parser.add_argument(
        "--gamma", type=float, default=2.0,
        help="Perceptual gamma applied AFTER --brightness and BEFORE sRGB "
             "encoding (in linear-light space). Schneegans values are "
             "radiometrically correct -- umbra ~ 0.001 of full sun, matching "
             "real 1000x dimming -- which is far below visible in a normal "
             "tone-mapped frame; the paper's own Figure 11 uses +13 EV "
             "exposure for those frames. Applying gamma>1 here lifts the "
             "dark end perceptually so the moon-disk umbra reads as visible "
             "red and the directional light stays bright through most of "
             "the eclipse, falling off rapidly only near totality (matching "
             "human log-brightness perception). gamma=2.0 (sqrt curve) maps "
             "umbra 0.001 -> 0.032, penumbra 0.04 -> 0.2, leaves 1.0 alone. "
             "Use 1.0 to disable.",
    )
    args = parser.parse_args()

    import tifffile
    from PIL import Image

    src = tifffile.imread(str(args.input))
    if src.ndim != 3 or src.shape[2] != 3:
        raise SystemExit(f"Expected H x W x 3 TIFF, got shape {src.shape}")
    print(f"Loaded {args.input} -> shape={src.shape} dtype={src.dtype} "
          f"min={src.min():.4f} max={src.max():.4f}")

    arr = src.astype(np.float64)

    # The Schneegans LuT puts v=1 at y=0 (image top). Our existing baker also
    # writes it that way, so we DON'T flip here -- file y-axis convention is
    # preserved end-to-end.

    # Optional bicubic upsample
    H_src = arr.shape[0]
    if args.size != H_src:
        print(f"Upsampling {H_src}x{H_src} -> {args.size}x{args.size} (bicubic)")
        # Use scipy's ndimage zoom (3rd-order spline ~= bicubic)
        from scipy.ndimage import zoom
        factor = args.size / H_src
        arr = np.stack(
            [zoom(arr[..., c], factor, order=3, mode="reflect") for c in range(3)],
            axis=-1,
        )
        arr = np.clip(arr, 0.0, None)  # zoom can over/undershoot a hair

    if args.brightness != 1.0:
        arr = arr * args.brightness

    if args.gamma != 1.0:
        # Perceptual lift of the dark end. Equivalent to x^(1/gamma) since
        # gamma > 1 brightens. Applied in LINEAR space (not sRGB) so the
        # downstream sRGB encoding still gives us 8-bit precision allocated
        # by the sRGB perceptual curve on top of this.
        arr = np.power(np.clip(arr, 0.0, None), 1.0 / args.gamma)

    arr_srgb = linear_to_srgb(arr)
    arr_u8 = (arr_srgb * 255.0 + 0.5).astype(np.uint8)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    img = Image.fromarray(arr_u8, mode="RGB")
    suffix = args.out.suffix.lower()
    if suffix == ".webp":
        img.save(str(args.out), format="WEBP", lossless=True, quality=100, method=6)
    else:
        img.save(str(args.out))
    print(f"Wrote {args.out} ({arr_u8.shape[1]}x{arr_u8.shape[0]})")


if __name__ == "__main__":
    main()
