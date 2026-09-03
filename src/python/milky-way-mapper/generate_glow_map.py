#!/usr/bin/env python3
"""Generate the Milky Way emission (glow) map for A-Starry-Sky.

Integrates the stellar mass density of galpy's MWPotential2014 along every
line of sight on an equirectangular galactic grid, giving the diffuse glow of
unresolved galactic starlight. Dust is deliberately NOT applied here -- this is
intrinsic brightness only; extinction comes from the separate SFD-98 map in
generate_dust_map.py and is applied per-channel in the shader.

Ported from three-starry-sky's
tools/data_prep/milky-way-glow/galpy-density-integration/generate_density_glow_highres.py
with three changes:

  1. Longitude now DECREASES left to right (l=+180 at the left edge, l=0 dead
     center, l=-180 at the right edge) so it agrees with generate_dust_map.py
     and with the standard Gaia/Planck all-sky convention. The original ran
     longitude the other way and then rolled the array by half a width to
     center it; both steps are gone. MWPotential2014 is axisymmetric so this
     map is mirror-symmetric and the change is a visual no-op, but leaving the
     two maps on opposite handedness is a trap waiting to be sprung.
  2. Output is single-channel grayscale WebP written straight into
     assets/milky_way/ (the old script wrote an RGB PNG and a second script
     converted it). The shader supplies the color, so the chroma was always
     discarded.
  3. Resolution is a --size flag rather than a source edit.

Runtime scales with the pixel count; the shipped 1536x768 map takes roughly
three hours on all cores. Use --size 256 for a quick correctness check.
"""

import argparse
import multiprocessing as mp
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

# Physical / model parameters. These match the shipped asset; changing them
# changes the look of the band.
MAX_DISTANCE = 20.0        # integration limit along each sightline, kpc
N_SAMPLES = 50             # distance samples per sightline
BRIGHTNESS_BOOST = 1000.0  # pre-normalization scale, keeps floats in a sane range
BLUR_SIGMA = 2.0           # gaussian smoothing, in pixels, 0 disables
COLOR_SATURATION = 1.5     # chroma boost applied before the grayscale collapse
STELLAR_TEMPERATURE = 5000.0  # representative color of the integrated population
SOLAR_RADIUS_KPC = 8.0     # galpy ro

OUTPUT_PATH = Path(__file__).resolve().parents[3] / 'assets' / 'milky_way' / 'milky-way-emission-map.webp'

# Filled in per worker by _init_worker so the (expensive) galpy import and the
# potential object are not pickled for every pixel.
_potential = None
_evaluate_densities = None


def _init_worker():
    global _potential, _evaluate_densities
    from galpy.potential import MWPotential2014, evaluateDensities
    _potential = MWPotential2014
    _evaluate_densities = evaluateDensities


def _integrate_along_los(l_deg, b_deg):
    """Sum the stellar density along one sightline, returning a column density."""
    from astropy.coordinates import SkyCoord
    import astropy.units as u

    distances = np.linspace(0.1, MAX_DISTANCE, N_SAMPLES)

    # One vectorized SkyCoord for the whole sightline rather than N_SAMPLES of
    # them; astropy's frame transform is by far the hot spot in this loop.
    coords = SkyCoord(
        l=np.full(N_SAMPLES, l_deg) * u.deg,
        b=np.full(N_SAMPLES, b_deg) * u.deg,
        distance=distances * u.kpc,
        frame='galactic',
    ).transform_to('galactocentric')

    x = coords.cartesian.x.to(u.kpc).value
    y = coords.cartesian.y.to(u.kpc).value
    z = coords.cartesian.z.to(u.kpc).value
    cylindrical_radius = np.sqrt(x * x + y * y)

    total_density = 0.0
    for radius, height in zip(cylindrical_radius, z):
        total_density += _evaluate_densities(
            _potential,
            radius / SOLAR_RADIUS_KPC,
            height / SOLAR_RADIUS_KPC,
            phi=0.0,
        )

    return total_density * (MAX_DISTANCE / N_SAMPLES)


def _process_pixel(args):
    x, y, width, height = args

    # Equirectangular -> galactic. Longitude decreases left to right, latitude
    # decreases top to bottom, so row 0 is the north galactic pole.
    galactic_longitude = 180.0 - (x / width) * 360.0
    galactic_latitude = 90.0 - (y / height) * 180.0

    return (y, x, _integrate_along_los(galactic_longitude, galactic_latitude))


def temperature_to_rgb(temperature_kelvin):
    """Tanner Helland's blackbody approximation, normalized to [0, 1]."""
    temperature = np.clip(temperature_kelvin, 1000, 40000) / 100.0
    rgb = np.zeros(3, dtype=np.float32)

    if temperature <= 66:
        rgb[0] = 255
    else:
        rgb[0] = np.clip(329.698727446 * ((temperature - 60) ** -0.1332047592), 0, 255)

    if temperature <= 66:
        rgb[1] = np.clip(99.4708025861 * np.log(temperature) - 161.1195681661, 0, 255)
    else:
        rgb[1] = np.clip(288.1221695283 * ((temperature - 60) ** -0.0755148492), 0, 255)

    if temperature >= 66:
        rgb[2] = 255
    elif temperature <= 19:
        rgb[2] = 0
    else:
        rgb[2] = np.clip(138.5177312231 * np.log(temperature - 10) - 305.0447927307, 0, 255)

    return rgb / 255.0


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--size', type=int, default=1536,
                        help='output width in pixels; height is half of it (default: 1536)')
    parser.add_argument('--workers', type=int, default=mp.cpu_count(),
                        help='parallel worker processes (default: all cores)')
    parser.add_argument('--quality', type=int, default=95,
                        help='WebP quality, 0-100 (default: 95)')
    parser.add_argument('--out', type=Path, default=OUTPUT_PATH,
                        help='output file (default: %(default)s)')
    args = parser.parse_args()

    width = args.size
    height = width // 2
    total_pixels = width * height

    print('=' * 70)
    print('Milky Way emission map -- galpy MWPotential2014 density integration')
    print('=' * 70)
    print('  Resolution:      {}x{} ({:,} pixels)'.format(width, height, total_pixels))
    print('  Workers:         {}'.format(args.workers))
    print('  Samples per LOS: {} out to {} kpc'.format(N_SAMPLES, MAX_DISTANCE))
    print('')

    pixel_args = [(x, y, width, height) for y in range(height) for x in range(width)]
    density_map = np.zeros((height, width), dtype=np.float32)

    print('Integrating density along {:,} sightlines...'.format(total_pixels))
    try:
        from tqdm import tqdm
    except ImportError:
        def tqdm(iterable, **kwargs):
            return iterable

    with mp.Pool(processes=args.workers, initializer=_init_worker) as pool:
        results = tqdm(
            pool.imap(_process_pixel, pixel_args, chunksize=256),
            total=total_pixels,
            desc='Integrating',
        )
        for y, x, density in results:
            density_map[y, x] = density

    print('')
    print('Building texture...')

    texture = density_map[:, :, np.newaxis] * temperature_to_rgb(STELLAR_TEMPERATURE) * BRIGHTNESS_BOOST
    print('  Raw brightness range: [{:.6f}, {:.6f}]'.format(texture.min(), texture.max()))

    if texture.max() > 0:
        p99 = np.percentile(texture[texture > 0], 99)
        texture = np.clip(texture / p99, 0.0, 1.0)
        print('  Normalized against p99 = {:.6f}'.format(p99))
    else:
        raise SystemExit('All pixels integrated to zero -- galpy model failed to evaluate.')

    if BLUR_SIGMA > 0:
        print('  Gaussian blur, sigma = {}'.format(BLUR_SIGMA))
        for channel in range(3):
            texture[:, :, channel] = gaussian_filter(texture[:, :, channel], sigma=BLUR_SIGMA)

    if COLOR_SATURATION != 1.0:
        print('  Saturation boost {}x'.format(COLOR_SATURATION))
        luminance = texture.mean(axis=2, keepdims=True)
        texture = np.clip(luminance + (texture - luminance) * COLOR_SATURATION, 0.0, 1.0)

    # The band is a single stellar population, so the chroma carries no
    # information the shader cannot supply itself. Collapsing to one channel
    # here is what makes this a ~10 KB asset instead of a ~130 KB one.
    image = Image.fromarray((texture * 255.0).astype(np.uint8), mode='RGB').convert('L')

    args.out.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.out, format='WEBP', quality=args.quality, method=6)

    print('')
    print('Wrote {} ({:.1f} KB, {}x{} grayscale)'.format(
        args.out, args.out.stat().st_size / 1024.0, width, height))


if __name__ == '__main__':
    main()
