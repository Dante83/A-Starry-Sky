"""
Eclipse-Shadow LuT baker.

Generates a 2D RGB lookup texture parameterized by (u_shadow, v_shadow) per
Schneegans et al. 2025, "Physically Based Real-Time Rendering of Eclipses",
Eqs. 3-4:

    u_shadow = 1 / (phi_occ / phi_sun + 1)
    v_shadow = delta / (phi_occ + phi_sun)

where phi_sun and phi_occ are the angular radii of the sun and occluder
(Earth or Moon) as seen from a position in the shadow cone, and delta is the
angular distance between them.

At runtime the shader / WASM compute (u_shadow, v_shadow) from the current
geometry and sample this texture to get the RGB attenuation that the
sun's direct light should be multiplied by at that point in the shadow.

The same LuT is used for:
  - Lunar eclipses (observer = point on the moon, occluder = Earth)
  - Solar-eclipse sky darkening (observer = on Earth, occluder = Moon)

Bake uses the project's existing RGB Rayleigh/Mie/ozone coefficients (from
SkyAtmosphericParameters.js defaults). Refraction is not simulated; light
reaching the deep umbra is approximated by an atmospheric inscattering glow
based on the average limb transmittance, scaled by how much of the sun's
disk is geometrically occluded.
"""

import argparse
import sys
import time
from pathlib import Path

import numpy as np

# numpy >= 2.0 renamed np.trapz to np.trapezoid. Support both.
_trapezoid = getattr(np, "trapezoid", None) or np.trapz


# -----------------------------------------------------------------------------
# Project-matching constants (mirrors SkyAtmosphericParameters.js defaults).
# Keep these in sync if those defaults change.
# -----------------------------------------------------------------------------
R_EARTH_KM = 6366.7
ATMOSPHERE_HEIGHT_KM = 80.0
H_RAYLEIGH_KM = 8.4
H_MIE_KM = 1.25

# RGB extinction coefficients (per km). These match the project's GLSL
# constants -- they are *not* physical spectral values, they are the tuned
# RGB triples we already use to render the sky, so the LuT shares the same
# "look" as the rest of the renderer.
RAYLEIGH_BETA = np.array([5.8e-3, 1.35e-2, 3.31e-2])
MIE_BETA = np.array([4.44e-3, 4.44e-3, 4.44e-3])
OZONE_PERCENT_OF_RAYLEIGH = 6e-7
OZONE_BETA_RAW = np.array([413.470734338, 413.470734338, 2.1112886e-13])
# Effective ozone extinction per (km of ozone-density-integral). The runtime
# applies a tent ozone profile peaked at 25 km with internal *0.56 scaling
# (see transmittance.glsl). We mirror that here.
OZONE_BETA = OZONE_BETA_RAW * OZONE_PERCENT_OF_RAYLEIGH

# Sun / sky geometry.
R_SUN_KM = 696342.0
AU_KM = 1.496e8

# Solar limb darkening coefficient (Eq. 1 of the paper, Schneegans et al.).
LIMB_DARKENING_U = 0.6

# Umbra glow tuning. Without refraction, the deep umbra would be perfectly
# black; in reality, atmospheric scattering near Earth's limb fills the umbra
# with a dim reddish illumination (the classic blood-moon). We approximate
# the contribution as the integral over altitudes of the local scattering
# rate (Rayleigh+Mie density) times the outgoing chord transmittance, then
# scale by this constant. Calibrated by eye so the umbra reads as deep
# orange-red in the LuT image and produces visible "blood moon" colors on
# the rendered moon after tonemap. The runtime shader can dim further if
# this turns out to be too bright.
UMBRA_GLOW_SCALE = 4.0

# Characteristic angular depth (radians) over which the umbra glow falls off
# inside the geometric umbra. Roughly the maximum atmospheric refraction angle
# (~0.6 deg at sea level); beyond that, only multiple-scattering reaches the
# observer, and the brightness decays exponentially. Smaller -> sharper umbra
# edge with darker core; larger -> gentler gradient.
UMBRA_GLOW_REACH_RAD = 0.014


def precompute_grazing_transmittance(n_altitudes=2048, n_chord_steps=512):
    """Return (altitudes_km, transmittance_rgb) precomputed tables.

    For each grazing altitude h in [0, ATMOSPHERE_HEIGHT_KM], compute the
    Rayleigh/Mie/ozone optical depth along the symmetric chord through the
    atmosphere with closest-approach altitude h, then return the RGB
    transmittance.

    Symmetric chord parameterization: a ray with impact parameter b = R+h
    enters the atmospheric shell at altitude ATMOSPHERE_HEIGHT_KM, reaches
    closest approach at altitude h, then exits at altitude
    ATMOSPHERE_HEIGHT_KM again. Total chord length:
        L = 2 * sqrt((R+H)^2 - (R+h)^2)
    At a path parameter s measured from the closest-approach point, the
    altitude is:
        z(s) = sqrt((R+h)^2 + s^2) - R
    """
    altitudes = np.linspace(0.0, ATMOSPHERE_HEIGHT_KM, n_altitudes)
    transmittances = np.zeros((n_altitudes, 3))

    R_plus_H = R_EARTH_KM + ATMOSPHERE_HEIGHT_KM
    for i, h in enumerate(altitudes):
        b = R_EARTH_KM + h
        if b >= R_plus_H:
            transmittances[i] = (1.0, 1.0, 1.0)
            continue
        half_chord = np.sqrt(R_plus_H * R_plus_H - b * b)
        s = np.linspace(0.0, half_chord, n_chord_steps)
        z = np.sqrt(b * b + s * s) - R_EARTH_KM
        rho_R = np.exp(-z / H_RAYLEIGH_KM)
        rho_M = np.exp(-z / H_MIE_KM)
        # Tent ozone profile from transmittance.glsl, matching the runtime.
        rho_O = np.maximum(0.0, 1.0 - np.abs(z - 25.0) / 15.0) * 0.56
        # Trapezoidal integration; multiply by 2 for the symmetric other half.
        col_R = 2.0 * _trapezoid(rho_R, s)
        col_M = 2.0 * _trapezoid(rho_M, s)
        col_O = 2.0 * _trapezoid(rho_O, s)
        od = col_R * RAYLEIGH_BETA + col_M * MIE_BETA + col_O * OZONE_BETA
        transmittances[i] = np.exp(-od)

    return altitudes, transmittances


def compute_limb_glow_color(altitudes_km, transmittances_rgb):
    """Low-altitude-biased chord transmittance, the "blood moon" color.

    The deep umbra is illuminated by light that has been refracted (or
    multiply scattered) through the densest, lowest layers of Earth's
    atmosphere -- the same layers responsible for the deep red of sunset.
    Rayleigh extinction at these altitudes wipes out blue and most green,
    leaving only red.

    A density-weighted average of T_chord(h) using rho_R (linear) ends up
    fairly neutral because the chord transmittance also recovers fast with
    altitude. Weighting by rho_R squared concentrates the average around
    h ~ H_R / 2 ~ 4 km, where T_chord is dominantly red. This is a hack,
    not the real multiple-scattering integral, but it produces a saturated
    blood-moon color that matches the appearance of real lunar eclipses.
    """
    rho_R = np.exp(-altitudes_km / H_RAYLEIGH_KM)
    weights = rho_R * rho_R
    return (transmittances_rgb * weights[:, None]).sum(axis=0) / weights.sum()


def gen_sun_disk_samples(n_per_axis=24, jitter_seed=0):
    """Return (dx_array, dy_array, limb_weight_array) for sun-disk samples.

    Samples (dx, dy) live in [-1, 1] x [-1, 1] in *normalized* sun-radius
    units (so dx^2 + dy^2 <= 1 is on the disk). Limb-darkening weight per
    sample uses Eq. 1 of the paper with u = 0.6.

    Samples outside the disk are dropped to avoid wasted work / spurious
    edge-of-square contributions.

    Stratified jitter: each stratum cell of size (2/n_per_axis) gets a
    uniformly random offset inside the cell. Without jitter, the regular
    grid creates discrete transition thresholds (clear/grazing/blocked) at
    repeated delta values, which shows up as diagonal banding in the LuT
    at high resolutions. Jitter spreads each sample's transition delta
    randomly within its stratum so the banding averages out into noise
    smaller than one LuT cell.
    """
    rng = np.random.default_rng(jitter_seed)
    step = 2.0 / n_per_axis
    centers = np.linspace(-1.0 + step * 0.5, 1.0 - step * 0.5, n_per_axis)
    dx, dy = np.meshgrid(centers, centers, indexing="xy")
    dx = dx.ravel()
    dy = dy.ravel()
    # Add per-sample jitter inside each stratum (range = step).
    dx = dx + rng.uniform(-0.5, 0.5, dx.shape) * step
    dy = dy + rng.uniform(-0.5, 0.5, dy.shape) * step
    r2 = dx * dx + dy * dy
    inside = r2 <= 1.0
    dx = dx[inside]
    dy = dy[inside]
    r2 = r2[inside]
    mu = np.sqrt(np.maximum(0.0, 1.0 - r2))
    limb = 1.0 - LIMB_DARKENING_U * (1.0 - mu)
    return dx, dy, limb


def bake_lut(size=256, sun_disk_samples_per_axis=24, smooth_sigma=0.8, verbose=True):
    """Compute the Eclipse-Shadow LuT as a (size, size, 3) float32 array.

    Coordinate convention:
      out[v_idx, u_idx, :] is the RGB shadow attenuation for that LuT cell.
      v_idx = 0 at the top (v_shadow = 0, umbra core),
      v_idx = size-1 at the bottom (v_shadow = 1, outer penumbra edge).
      u_idx = 0 at the left (u_shadow = 0, occluder infinitely large),
      u_idx = size-1 at the right (u_shadow = 1, occluder = sun apparent size).

    To match Figure 9 of the paper visually, we output the texture with
    v=0 at the bottom and v=1 at the top, but this is a presentation choice
    handled by the writer below.
    """
    t0 = time.time()

    if verbose:
        print(f"Precomputing grazing-chord transmittance LuT...")
    altitudes, T_chord_table = precompute_grazing_transmittance()
    limb_glow = compute_limb_glow_color(altitudes, T_chord_table)
    if verbose:
        print(f"  limb glow color (linear RGB): {limb_glow}")

    if verbose:
        print(f"Generating {sun_disk_samples_per_axis}x{sun_disk_samples_per_axis} sun-disk sample grid...")
    sun_dx, sun_dy, sun_limb = gen_sun_disk_samples(sun_disk_samples_per_axis)
    n_samples = sun_dx.size
    if verbose:
        print(f"  {n_samples} samples after disk clipping")

    # ---- Per-cell geometry, vectorized over (u, v). --------------------------
    # Use a fixed phi_sun -- the LuT is parameterized so that absolute sizes
    # don't matter, only the ratio phi_occ/phi_sun.
    phi_sun = np.arcsin(R_SUN_KM / AU_KM)  # ~0.00465 rad

    # u in (0, 1], avoid u=0 (occluder infinitely far -> phi_occ = phi_sun*inf).
    # u_min picked so that phi_occ_max corresponds to ~80x sun's apparent
    # radius -- well past the regime where eclipses actually happen, but
    # makes the texture usable across geometries.
    u_min = 1.0 / 81.0
    u = np.linspace(u_min, 1.0, size)
    v = np.linspace(0.0, 1.0, size)
    U, V = np.meshgrid(u, v, indexing="xy")  # shape (size, size)

    phi_occ_over_phi_sun = (1.0 / U) - 1.0
    phi_occ = phi_sun * phi_occ_over_phi_sun
    # Distance from occluder center to observer (km). For tiny phi_occ we'd
    # overflow; clamp.
    sin_phi_occ = np.sin(phi_occ)
    d_occ = R_EARTH_KM / np.maximum(sin_phi_occ, 1e-9)

    delta = V * (phi_sun + phi_occ)

    phi_atm = np.arcsin(np.minimum(1.0, (R_EARTH_KM + ATMOSPHERE_HEIGHT_KM) / d_occ))
    # phi_atm: angular radius of the occluder + atmosphere together. Rays
    # passing outside phi_atm don't interact with the atmosphere at all.

    # We sum direct-sun contributions and track the geometric-occlusion
    # fraction in parallel.
    direct_color = np.zeros((size, size, 3), dtype=np.float64)
    weight_total = np.zeros((size, size), dtype=np.float64)
    blocked_weight = np.zeros((size, size), dtype=np.float64)

    # Precompute interpolation indices once per altitude lookup. The lookup
    # table has n_altitudes uniformly spaced from 0 to ATMOSPHERE_HEIGHT_KM.
    n_alt = altitudes.size
    alt_step = ATMOSPHERE_HEIGHT_KM / (n_alt - 1)

    def lookup_T(altitude_arr):
        """Vectorized lookup into the 1D chord-transmittance LuT.

        altitude_arr is a 2D array of grazing altitudes in km. Returns a 3D
        array (..., 3) of RGB transmittances.
        """
        # Clamp into table range. Altitudes above ATMOSPHERE_HEIGHT mean the
        # ray didn't enter the atmosphere -- handled by the caller via mask.
        a = np.clip(altitude_arr, 0.0, ATMOSPHERE_HEIGHT_KM - 1e-6)
        f = a / alt_step
        i0 = np.floor(f).astype(np.int32)
        i0 = np.clip(i0, 0, n_alt - 2)
        frac = f - i0
        t0 = T_chord_table[i0]
        t1 = T_chord_table[i0 + 1]
        return t0 + (t1 - t0) * frac[..., None]

    if verbose:
        print(f"Integrating sun-disk contributions across {size}x{size} cells...")
        progress_step = max(1, n_samples // 20)

    for s_idx in range(n_samples):
        # Sun-disk sample at angular offset (dx*phi_sun, dy*phi_sun) from
        # the sun's center in the observer's apparent sky. Place the sun
        # at angular position (delta, 0) from the occluder's center (i.e.,
        # we work in a coordinate frame where the line of centers between
        # sun and occluder lies along the local x-axis).
        dx_ang = sun_dx[s_idx] * phi_sun
        dy_ang = sun_dy[s_idx] * phi_sun
        limb_w = sun_limb[s_idx]

        # Angular distance from occluder center to this sun-disk sample
        # (as seen by the observer in the shadow).
        gamma_x = delta + dx_ang  # shape (size, size)
        gamma_y = dy_ang            # broadcasts as scalar over the cells
        gamma = np.sqrt(gamma_x * gamma_x + gamma_y * gamma_y)

        # Impact parameter: closest approach of this ray to Earth's center.
        # Small-angle: b = d_occ * gamma.
        impact_param = d_occ * gamma  # km

        # Categorize each (u, v) cell for this sample:
        #   clear: b >= R_earth + H_atm  -> T = 1
        #   grazing: R_earth < b < R_earth + H_atm  -> T = lookup_T(h)
        #   blocked: b <= R_earth  -> T = 0 (handled via blocked_weight)
        clear = impact_param >= (R_EARTH_KM + ATMOSPHERE_HEIGHT_KM)
        blocked = impact_param <= R_EARTH_KM
        grazing = ~clear & ~blocked

        T_sample = np.zeros((size, size, 3), dtype=np.float64)
        # Clear rays: full sun transmission.
        T_sample[clear] = (1.0, 1.0, 1.0)
        # Grazing rays: atmospheric extinction.
        if grazing.any():
            h_graz = impact_param[grazing] - R_EARTH_KM
            T_sample[grazing] = lookup_T(h_graz)
        # Blocked rays leave T_sample at zero.

        direct_color += T_sample * limb_w
        weight_total += limb_w
        # Track the umbra-glow contribution from this blocked sample, weighted
        # by exp(-depth / reach). Depth is the angular distance from the
        # sample to the limb, in radians -- samples right at the limb get full
        # weight, samples deep in the geometric umbra get exponentially less.
        # This is what produces the gradient inside the umbra in the LuT.
        depth_rad = np.maximum(0.0, phi_occ - gamma)
        depth_falloff = np.exp(-depth_rad / UMBRA_GLOW_REACH_RAD)
        blocked_weight[blocked] += limb_w * depth_falloff[blocked]

        if verbose and (s_idx + 1) % progress_step == 0:
            done = (s_idx + 1) / n_samples
            print(f"  {done * 100:5.1f}%  ({s_idx + 1}/{n_samples} samples)")

    # Normalize so a fully-clear cell gives (1, 1, 1).
    direct_color /= weight_total[..., None]
    blocked_fraction = blocked_weight / weight_total

    # Umbra glow: dim reddish atmospheric inscattering that fills the umbra.
    # Scales linearly with the geometric-blocked fraction so penumbra cells
    # (where the sun is mostly visible) don't get artificially brightened.
    glow = limb_glow[None, None, :] * UMBRA_GLOW_SCALE * blocked_fraction[..., None]

    lut = direct_color + glow
    lut = np.clip(lut, 0.0, 1.0)

    # Post-process gaussian smooth: dissolves any sub-stratum MC noise left
    # over from jittered sampling without softening the actual gradient.
    # sigma in cells -- 0.8 is roughly the width of one stratum at n=64,
    # so it merges the random per-cell variance into the local trend.
    # Skip if the user passes --no-smooth (e.g. for debugging the raw bake).
    if smooth_sigma > 0.0:
        from scipy.ndimage import gaussian_filter
        for c in range(3):
            lut[..., c] = gaussian_filter(lut[..., c], sigma=smooth_sigma, mode="nearest")
        lut = np.clip(lut, 0.0, 1.0)

    if verbose:
        elapsed = time.time() - t0
        print(f"Bake complete in {elapsed:.1f}s")
        # Sample a handful of cells as a quick sanity readout.
        with np.printoptions(precision=4, suppress=True):
            print(f"  cell samples (linear RGB):")
            print(f"    umbra core    (u=0.20, v=0.00): {lut[0, size // 5, :]}")
            print(f"    umbra rim     (u=0.20, v=0.33): {lut[size // 3, size // 5, :]}")
            print(f"    penumbra      (u=0.20, v=0.50): {lut[size // 2, size // 5, :]}")
            print(f"    no eclipse    (u=1.00, v=1.00): {lut[size - 1, size - 1, :]}")

    return lut.astype(np.float32)


def linear_to_srgb(x):
    """Standard sRGB transfer function. Input/output in [0, 1]. Vectorized."""
    x = np.clip(x, 0.0, 1.0)
    return np.where(
        x <= 0.0031308,
        12.92 * x,
        1.055 * np.power(x, 1.0 / 2.4) - 0.055,
    )


def save_lut(lut, out_path):
    """Save an 8-bit RGB image with sRGB-encoded data.

    The LuT values are linear-light RGB transmittances; we encode to sRGB
    so 8-bit precision survives in the dark umbra range (sRGB gives roughly
    12-bit perceptual precision near zero). Three.js should load this with
    `texture.colorSpace = THREE.SRGBColorSpace` so the shader gets linear
    values back automatically.

    The texture is also flipped vertically so v=1 ends up at the top of the
    file (umbra row at the bottom, matching Figure 9 of the paper).

    Format is inferred from the file extension. For `.webp` we write
    lossless WebP (small for smooth gradients, ~200-500 KB at 2048x2048).
    """
    from PIL import Image

    arr = np.flipud(lut)
    arr_srgb = linear_to_srgb(arr)
    arr_u8 = (arr_srgb * 255.0 + 0.5).astype(np.uint8)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.fromarray(arr_u8, mode="RGB")
    suffix = out_path.suffix.lower()
    if suffix == ".webp":
        img.save(str(out_path), format="WEBP", lossless=True, quality=100, method=6)
    else:
        img.save(str(out_path))
    print(f"Wrote {out_path} ({arr_u8.shape[1]}x{arr_u8.shape[0]} 8-bit sRGB RGB)")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument(
        "--size", type=int, default=2048,
        help="LuT resolution (square). Default 2048.",
    )
    parser.add_argument(
        "--samples", type=int, default=64,
        help="Sun-disk samples per axis (samples = N x N clipped to disk, "
             "stratified-jittered). Default 64 -> ~3200 effective. Banding in "
             "the LuT is roughly proportional to 1/samples_per_axis, so bump "
             "this if the v-axis transitions still look stepped.",
    )
    parser.add_argument(
        "--smooth-sigma", type=float, default=8.0,
        help="Post-bake gaussian smooth (in LuT cells). 0 to disable. "
             "Default 8 erases jitter noise and gently softens the umbra/"
             "penumbra boundary (it spans ~300 cells at size=2048, so sigma=8 "
             "feathers the transition without smearing real structure).",
    )
    parser.add_argument(
        "--out", type=Path,
        default=Path(__file__).resolve().parents[3] / "assets" / "lunar_eclipse" / "eclipse-shadow-lut.webp",
        help="Output image path. Format inferred from extension (.webp = lossless WebP, .png = PNG).",
    )
    parser.add_argument(
        "--quiet", action="store_true",
        help="Suppress progress output.",
    )
    args = parser.parse_args()

    lut = bake_lut(
        size=args.size,
        sun_disk_samples_per_axis=args.samples,
        smooth_sigma=args.smooth_sigma,
        verbose=not args.quiet,
    )
    save_lut(lut, args.out)


if __name__ == "__main__":
    main()
