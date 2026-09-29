"""
Halo atlas baker.

Ray traces light through hexagonal ice crystals (see crystal.py) and writes the
result as one packed atlas image plus a JSON manifest describing it.

What gets baked
---------------
Every layer is a picture of the sky around the sun (or moon), unrolled into polar
coordinates:

    x  theta, the angle from the sun,           0 .. THETA_MAX_DEGREES
    y  psi,   the angle round the sun from up,  0 .. 180 degrees (left/right symmetric)

so a ring of constant radius is a column of the layer, and the shader needs only
`acos(dot(view, sun))` and an `atan` to look a pixel up. That is why the halos can
reach the zenith (the circumzenithal arc sits 90 degrees from a low sun) without
needing a giant quad drawn round the sun.

There are three crystal populations, each with its own intensity tag at run time:

    random   the plain 22 and 46 degree rings. No preferred direction, so one layer.
    plate    horizontal plates: sundogs, the parhelic circle, the circumzenithal arc.
    column   horizontal columns: upper and lower tangent arcs, circumscribed halo.

Plates and columns depend on how high the sun is, so each is baked for a ladder of
sun elevations and the shader blends the two layers either side of the real one.

Storage
-------
Each layer is stored RGBA8, gamma 2 encoded (value = sqrt(intensity / peak)) so the
faint outer halos keep their precision in 8 bits, and the shader squares it back.
`peak` is normalised per population, so the populations are tuned against each other
by their run-time intensity tags rather than by anything in the bake.

The layers are packed into a grid inside one lossless WebP, because that is a single
download and a single image decode; the sky then blits each tile into one layer of a
sampler2DArray (see TextureArrayBuilder.js), so the whole halo family costs ONE
texture unit however many layers there are. Run `--budget` for the numbers.

Usage
-----
    ./run.sh                      # bake at the default quality
    ./run.sh --samples 20000000   # smoother, slower
    ./run.sh --selftest           # quick physics check: are the rings where they should be?
    ./run.sh --budget             # print the texture budget and exit
"""

import argparse
import json
import os
import sys
import time
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

import crystal

# -----------------------------------------------------------------------------
# Layout. These are mirrored in src/js/html_tags/SkyHalos.js (DefaultData.skyHalos.atlas)
# and checked against it by `--check-js`; change them together.
# -----------------------------------------------------------------------------
TILE_WIDTH = 320        # theta samples
TILE_HEIGHT = 128       # psi samples
THETA_MAX_DEGREES = 100.0
ELEVATION_STEP_DEGREES = 6.0
ELEVATION_LAYERS = 12   # 0, 6 ... 66 degrees; a higher sun reuses the last layer
ATLAS_COLUMNS = 5
SUN_CORE_DEGREES = 2.0  # the sun's own quad draws this; nothing baked inside it
PLATE_TILT_DEGREES = 1.5
COLUMN_TILT_DEGREES = 1.5

POPULATION_ORDER = ['random', 'plate', 'column']

# WebGL2 guarantees only these, and the atlas and the family must fit inside them.
GL_MIN_MAX_TEXTURE_SIZE = 2048
GL_MIN_MAX_ARRAY_TEXTURE_LAYERS = 256
GL_MIN_MAX_TEXTURE_IMAGE_UNITS = 16

REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUT = REPO_ROOT / 'assets' / 'halos'
BATCH = 1_000_000


def layer_plan():
    """The ordered list of layers: [{population, elevation}]. Order is the array layer
    index, so the shader's HALO_*_LAYER constants must follow it."""
    layers = []
    for population in POPULATION_ORDER:
        if crystal.POPULATIONS[population]['elevation_dependent']:
            for k in range(ELEVATION_LAYERS):
                layers.append({'population': population, 'elevation': k * ELEVATION_STEP_DEGREES})
        else:
            layers.append({'population': population, 'elevation': 0.0})
    return layers


def atlas_shape(num_layers):
    rows = -(-num_layers // ATLAS_COLUMNS)
    return ATLAS_COLUMNS * TILE_WIDTH, rows * TILE_HEIGHT, rows


# -----------------------------------------------------------------------------
# Budget
# -----------------------------------------------------------------------------
def print_budget(num_layers, atlas_file=None):
    atlas_w, atlas_h, rows = atlas_shape(num_layers)
    layer_bytes = TILE_WIDTH * TILE_HEIGHT * 4
    array_bytes = layer_bytes * num_layers
    print('Halo texture budget')
    print('  layers                 %d  (1 random + %d plate + %d column)' % (num_layers, ELEVATION_LAYERS, ELEVATION_LAYERS))
    print('  layer size             %d x %d RGBA8 = %.0f KB' % (TILE_WIDTH, TILE_HEIGHT, layer_bytes / 1024.0))
    print('  sampler2DArray on GPU  %.2f MB, no mips (%.2f MB if mipped)' % (array_bytes / 1048576.0, array_bytes * 4 / 3 / 1048576.0))
    print('  atlas image            %d x %d px in a %d x %d grid' % (atlas_w, atlas_h, ATLAS_COLUMNS, rows))
    if atlas_file is not None and Path(atlas_file).exists():
        print('  atlas on disk          %.0f KB' % (Path(atlas_file).stat().st_size / 1024.0))
    print('  texture units used     1  (of the %d WebGL2 guarantees; the layer count does not matter)' % GL_MIN_MAX_TEXTURE_IMAGE_UNITS)
    problems = []
    if atlas_w > GL_MIN_MAX_TEXTURE_SIZE or atlas_h > GL_MIN_MAX_TEXTURE_SIZE:
        problems.append('atlas %d x %d exceeds the guaranteed MAX_TEXTURE_SIZE %d' % (atlas_w, atlas_h, GL_MIN_MAX_TEXTURE_SIZE))
    if num_layers > GL_MIN_MAX_ARRAY_TEXTURE_LAYERS:
        problems.append('%d layers exceeds the guaranteed MAX_ARRAY_TEXTURE_LAYERS %d' % (num_layers, GL_MIN_MAX_ARRAY_TEXTURE_LAYERS))
    for problem in problems:
        print('  !! ' + problem)
    return not problems


# -----------------------------------------------------------------------------
# Baking
# -----------------------------------------------------------------------------
def trace_layer(job):
    """Histogram one layer. Returns (TILE_HEIGHT, TILE_WIDTH, 3) radiance per steradian,
    before smoothing and before normalisation."""
    index, layer, samples, seed = job
    rng = np.random.default_rng(seed)
    population = layer['population']
    tilt = PLATE_TILT_DEGREES if population == 'plate' else COLUMN_TILT_DEGREES

    theta_edges = np.radians(np.linspace(0.0, THETA_MAX_DEGREES, TILE_WIDTH + 1))
    psi_edges = np.linspace(0.0, np.pi, TILE_HEIGHT + 1)
    accumulated = np.zeros((TILE_HEIGHT, TILE_WIDTH, 3))
    core = np.radians(SUN_CORE_DEGREES)

    remaining = samples
    while remaining > 0:
        n = min(BATCH, remaining)
        remaining -= n
        view, weight, sun = crystal.trace_batch(population, layer['elevation'], n, rng, tilt)
        theta, psi = crystal.to_theta_psi(view, sun)
        keep = (theta > core) & (theta < theta_edges[-1])
        theta_bin = np.searchsorted(theta_edges, theta[keep], side='right') - 1
        psi_bin = np.minimum((psi[keep] / np.pi * TILE_HEIGHT).astype(int), TILE_HEIGHT - 1)
        flat = psi_bin * TILE_WIDTH + np.clip(theta_bin, 0, TILE_WIDTH - 1)
        for c in range(3):
            accumulated[:, :, c] += np.bincount(flat, weights=weight[keep, c], minlength=TILE_WIDTH * TILE_HEIGHT).reshape(TILE_HEIGHT, TILE_WIDTH)

    # Counts -> radiance: divide by the solid angle of each bin, so a ring is not
    # brighter for being short.
    solid_angle = (np.cos(theta_edges[:-1]) - np.cos(theta_edges[1:]))[None, :] * (np.pi / TILE_HEIGHT)
    return accumulated / (solid_angle[:, :, None] * samples), index


def smooth(image):
    """Blur by the sun's own angular size along theta plus a touch of monte carlo noise
    along psi. psi reflects at both ends because the sky is mirror symmetric there."""
    degrees_per_bin = THETA_MAX_DEGREES / TILE_WIDTH
    sigma_theta = 0.30 / degrees_per_bin
    return gaussian_filter(image, sigma=(1.1, sigma_theta, 0.0), mode=('reflect', 'nearest', 'nearest'))


def luminance(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def bake(args):
    layers = layer_plan()
    atlas_w, atlas_h, rows = atlas_shape(len(layers))
    print_budget(len(layers))

    # The randomly oriented layer has no elevation ladder to spread its samples over,
    # and it carries the faintest features, so it gets a proportionally bigger share.
    jobs = []
    for i, layer in enumerate(layers):
        samples = args.samples * (ELEVATION_LAYERS if layer['population'] == 'random' else 1)
        jobs.append((i, layer, samples, 1000 + i))

    print('\nTracing %d layers, %.1fM crystals each (x%d for the random layer), %d workers ...'
          % (len(layers), args.samples / 1e6, ELEVATION_LAYERS, args.workers))
    start = time.time()
    raw = [None] * len(layers)
    with Pool(args.workers) as pool:
        for done, (image, index) in enumerate(pool.imap_unordered(trace_layer, jobs), 1):
            raw[index] = smooth(image)
            print('  layer %2d/%d done (%s %.0f deg)  %.0fs' % (done, len(layers), layers[index]['population'], layers[index]['elevation'], time.time() - start), flush=True)

    # One peak per population, so relative brightness across sun elevations is physical
    # (plates really do make dimmer sundogs as the sun climbs).
    peaks = {}
    for population in POPULATION_ORDER:
        lum = np.concatenate([luminance(raw[i]).ravel() for i, l in enumerate(layers) if l['population'] == population])
        peaks[population] = float(np.percentile(lum[lum > 0], 99.9))

    atlas = np.zeros((atlas_h, atlas_w, 4), dtype=np.uint8)
    atlas[..., 3] = 255
    for i, layer in enumerate(layers):
        x = np.clip(raw[i] / peaks[layer['population']], 0.0, 1.0)
        encoded = np.round(np.sqrt(x) * 255.0).astype(np.uint8)
        col, row = i % ATLAS_COLUMNS, i // ATLAS_COLUMNS
        atlas[row * TILE_HEIGHT:(row + 1) * TILE_HEIGHT, col * TILE_WIDTH:(col + 1) * TILE_WIDTH, :3] = encoded

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    atlas_path = out / 'halo-atlas.webp'
    Image.fromarray(atlas, 'RGBA').save(atlas_path, lossless=True, quality=100, method=6, exact=True)

    manifest = {
        'tileWidth': TILE_WIDTH,
        'tileHeight': TILE_HEIGHT,
        'columns': ATLAS_COLUMNS,
        'rows': rows,
        'thetaMaxDegrees': THETA_MAX_DEGREES,
        'elevationStepDegrees': ELEVATION_STEP_DEGREES,
        'elevationLayers': ELEVATION_LAYERS,
        'encoding': 'value = sqrt(intensity / peak); rgb linear, alpha unused',
        'peakRadiance': peaks,
        'layers': layers,
    }
    (out / 'halo-atlas.json').write_text(json.dumps(manifest, indent=2) + '\n')

    print('\nWrote %s' % atlas_path)
    print_budget(len(layers), atlas_path)


# -----------------------------------------------------------------------------
# Self test: run a few small traces and check the rings are where optics says
# -----------------------------------------------------------------------------
def selftest():
    rng = np.random.default_rng(7)
    failures = []

    def peak_theta(pop, elevation, mask, n=1_500_000, lo=10.0, hi=100.0, weight=lambda th, w: w[:, 1]):
        view, w, sun = crystal.trace_batch(pop, elevation, n, rng, 1.5)
        th, psi = crystal.to_theta_psi(view, sun)
        th, psi = np.degrees(th), np.degrees(psi)
        m = mask(psi) & (th > lo) & (th < hi)
        h, e = np.histogram(th[m], bins=np.arange(lo, hi, 0.25), weights=weight(th[m], w[m]))
        return e[np.argmax(h)]

    def check(name, got, expect, tolerance):
        ok = abs(got - expect) <= tolerance
        print('  %-52s %6.2f deg (want %.1f +/- %.1f)  %s' % (name, got, expect, tolerance, 'ok' if ok else 'FAIL'))
        if not ok:
            failures.append(name)

    print('Checking the optics against the textbook ...')
    check('22 degree halo, random crystals', peak_theta('random', 20, lambda p: p >= 0, lo=15, hi=35, weight=lambda th, w: w[:, 1] / np.sin(np.radians(th))), 22.0, 0.75)
    check('sundog at sun elevation 0', peak_theta('plate', 0, lambda p: abs(p - 90) < 5, lo=15, hi=35), 22.0, 0.75)
    check('sundog at sun elevation 30', peak_theta('plate', 30, lambda p: abs(p - 90) < 6, lo=15, hi=35), 24.5, 1.0)
    check('circumzenithal arc at sun elevation 15 (sun-to-arc)', peak_theta('plate', 15, lambda p: p < 5, n=3_000_000, lo=30, hi=100), 48.0, 2.5)
    check('upper tangent arc touches the 22 degree halo at 20', peak_theta('column', 20, lambda p: p < 4, lo=15, hi=35), 22.0, 1.5)

    if failures:
        print('\n%d check(s) failed: %s' % (len(failures), ', '.join(failures)))
        return 1
    print('\nAll checks passed.')
    return 0


def check_js():
    """The layout above is duplicated in SkyHalos.js. Refuse to let them drift."""
    js = (REPO_ROOT / 'src' / 'js' / 'html_tags' / 'SkyHalos.js').read_text()
    expected = {
        'tileWidth': TILE_WIDTH,
        'tileHeight': TILE_HEIGHT,
        'columns': ATLAS_COLUMNS,
        'thetaMaxDegrees': THETA_MAX_DEGREES,
        'elevationStepDegrees': ELEVATION_STEP_DEGREES,
        'elevationLayers': ELEVATION_LAYERS,
    }
    import re
    bad = []
    for key, value in expected.items():
        match = re.search(r'\b%s:\s*([0-9.]+)' % key, js)
        if match is None or abs(float(match.group(1)) - value) > 1e-9:
            bad.append('%s: bake says %s, SkyHalos.js says %s' % (key, value, match.group(1) if match else 'nothing'))
    if bad:
        print('SkyHalos.js is out of step with bake.py:\n  ' + '\n  '.join(bad))
        return 1
    print('SkyHalos.js layout matches bake.py.')
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--samples', type=int, default=3_000_000, help='crystals traced per layer (default 3M; the random layer gets 12x)')
    parser.add_argument('--workers', type=int, default=os.cpu_count() or 1)
    parser.add_argument('--out', default=str(DEFAULT_OUT), help='output directory (default assets/halos)')
    parser.add_argument('--selftest', action='store_true', help='check the optics and exit')
    parser.add_argument('--budget', action='store_true', help='print the texture budget and exit')
    parser.add_argument('--check-js', action='store_true', help='check SkyHalos.js mirrors this layout and exit')
    args = parser.parse_args()

    if args.selftest:
        sys.exit(selftest())
    if args.check_js:
        sys.exit(check_js())
    if args.budget:
        sys.exit(0 if print_budget(len(layer_plan()), Path(args.out) / 'halo-atlas.webp') else 1)
    bake(args)


if __name__ == '__main__':
    main()
