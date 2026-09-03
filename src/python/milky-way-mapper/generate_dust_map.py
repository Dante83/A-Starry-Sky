#!/usr/bin/env python3
"""Generate the Milky Way absorption (dust) map for A-Starry-Sky.

Samples the Schlegel, Finkbeiner & Davis (1998) dust reddening map on an
equirectangular galactic grid and writes a log-normalized 8-bit grayscale
texture. This is what carves the Great Rift out of the emission map.

Ported from three-starry-sky's tools/data_prep/dust-maps/export.py with two
changes: the output is grayscale WebP written straight into assets/milky_way/
rather than a 1.7 MB PNG in a scratch directory, and the resolution is a --size
flag. The coordinate convention is unchanged and is the one both maps now use
(see generate_glow_map.py, which was the one that had to move).

Encoding
--------
The stored value is

    stored = log1p(2 * E(B-V)) / log1p(2 * max_ebv)

with max_ebv the 99.5th percentile of the queried map. The log compression
matters: E(B-V) spans ~0 to 10+ magnitudes and a linear 8-bit encoding would
quantize every high-latitude sightline -- which is most of the sky -- into the
bottom couple of codes.

The shader does not decode this back to E(B-V). It feeds the stored value
straight into a per-channel exponential extinction, treating the map as a
relative optical depth and folding the calibration into the tuning constants.
That is a deliberate simplification: the dust lanes need to look right against
an artistically scaled emission map, not to be photometrically correct.
"""

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

OUTPUT_PATH = Path(__file__).resolve().parents[3] / 'assets' / 'milky_way' / 'milky-way-absorption-map.webp'

# E(B-V) above this is treated as bad data rather than a real sightline.
MAX_PLAUSIBLE_EBV = 10.0
# Percentile used as the normalization ceiling.
NORMALIZATION_PERCENTILE = 99.5


def query_sfd_fullsky(width, height, interpolation_order=3):
    """Query SFD-98 E(B-V) over the whole sky on an equirectangular grid."""
    from dustmaps.sfd import SFDQuery
    from astropy.coordinates import SkyCoord
    import astropy.units as u

    print('Querying SFD-98 (interpolation order {})...'.format(interpolation_order))

    # Longitude decreases left to right (+180 at the left edge, 0 dead center,
    # -180 at the right edge) and latitude decreases top to bottom, putting the
    # north galactic pole on row 0. This is the standard all-sky convention and
    # is what src/glsl/stars/milky-way.glsl assumes.
    longitudes = np.linspace(180.0, -180.0, width)
    latitudes = np.linspace(90.0, -90.0, height)
    longitude_grid, latitude_grid = np.meshgrid(longitudes, latitudes)

    coordinates = SkyCoord(
        l=longitude_grid.ravel() * u.deg,
        b=latitude_grid.ravel() * u.deg,
        frame='galactic',
    )

    ebv_map = SFDQuery()(coordinates, order=interpolation_order).reshape(height, width)

    n_bad = int(np.sum(~np.isfinite(ebv_map)))
    if n_bad:
        print('  {} non-finite samples replaced'.format(n_bad))
        ebv_map = np.nan_to_num(ebv_map, nan=0.0, posinf=MAX_PLAUSIBLE_EBV, neginf=0.0)

    n_outliers = int(np.sum(ebv_map > MAX_PLAUSIBLE_EBV))
    if n_outliers:
        print('  {} samples above E(B-V) = {} clamped'.format(n_outliers, MAX_PLAUSIBLE_EBV))
        ebv_map = np.clip(ebv_map, 0.0, MAX_PLAUSIBLE_EBV)

    print('  E(B-V) range {:.4f} to {:.4f} mag, mean {:.4f}, p99 {:.4f}'.format(
        ebv_map.min(), ebv_map.max(), ebv_map.mean(), np.percentile(ebv_map, 99)))

    return ebv_map


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--size', type=int, default=4096,
                        help='output width in pixels; height is half of it (default: 4096)')
    parser.add_argument('--quality', type=int, default=90,
                        help='WebP quality, 0-100 (default: 90)')
    parser.add_argument('--out', type=Path, default=OUTPUT_PATH,
                        help='output file (default: %(default)s)')
    parser.add_argument('--metadata', action='store_true',
                        help='also write a sidecar .json with the E(B-V) statistics')
    args = parser.parse_args()

    width = args.size
    height = width // 2

    print('=' * 70)
    print('Milky Way absorption map -- SFD-98 dust reddening')
    print('=' * 70)
    print('  Resolution: {}x{}'.format(width, height))
    print('')

    ebv_map = query_sfd_fullsky(width, height)

    max_ebv = float(np.percentile(ebv_map, NORMALIZATION_PERCENTILE))
    normalized = np.clip(np.log1p(ebv_map * 2.0) / np.log1p(max_ebv * 2.0), 0.0, 1.0)
    print('')
    print('Normalizing: log1p(2 * E(B-V)) / log1p(2 * {:.3f})'.format(max_ebv))

    image = Image.fromarray((normalized * 255.0).astype(np.uint8), mode='L')

    args.out.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.out, format='WEBP', quality=args.quality, method=6)

    print('Wrote {} ({:.1f} KB, {}x{} grayscale)'.format(
        args.out, args.out.stat().st_size / 1024.0, width, height))

    if args.metadata:
        metadata_path = args.out.with_suffix('.json')
        with open(metadata_path, 'w') as f:
            json.dump({
                'width': width,
                'height': height,
                'source': 'Schlegel, Finkbeiner & Davis (1998)',
                'data_type': 'E(B-V) color excess, log-normalized to 8 bits',
                'normalization': 'log1p(2 * E(B-V)) / log1p(2 * max_ebv)',
                'max_ebv': max_ebv,
                'decode': 'E(B-V) = expm1(stored * log1p(2 * max_ebv)) / 2',
                'visual_extinction': 'A_V = 3.1 * E(B-V)',
                'ebv_statistics': {
                    'min': float(ebv_map.min()),
                    'max': float(ebv_map.max()),
                    'mean': float(ebv_map.mean()),
                    'median': float(np.median(ebv_map)),
                    'p95': float(np.percentile(ebv_map, 95)),
                    'p99': float(np.percentile(ebv_map, 99)),
                },
            }, f, indent=2)
        print('Wrote {}'.format(metadata_path))


if __name__ == '__main__':
    main()
