"""
Monte Carlo ray tracer for light through hexagonal ice prisms.

Everything here works in one of two frames:

  crystal frame  c-axis is +z, the six prism faces have outward normals at
                 30, 90, 150 ... degrees in the xy plane. Circumradius is 1, so
                 the prism is described by a single number: its half length h
                 along the c-axis (plates are h << 1, columns are h > 1).
  world frame    +y is up, exactly like `sphericalPosition` in the sky shader.
                 The sun sits at s = (cos e, sin e, 0) for an elevation e.

Light travelling along -s enters a crystal, refracts (with the dispersion of
ice), bounces around inside with Fresnel weighted splitting at every face, and
leaves. Every exit -- and the external reflection off the entry face, which is
what draws the parhelic circle -- is one weighted sample of where the observer
would see that light in the sky.

The observer looks along v = -(direction the ray travels on leaving). We report
each sample as (theta, psi): theta is the angle from the sun and psi is the
angle round the sun measured from straight up, folded onto [0, pi] because
every population here is symmetric left to right.
"""

import numpy as np

N_ICE_A = 1.30111  # Cauchy fit n = A + B / lambda^2 (lambda in micrometres) to
N_ICE_B = 0.00288  # n(656nm) = 1.3078 and n(434nm) = 1.3164, the ice at 0 C

SIDE_APOTHEM = np.cos(np.radians(30.0))
BASAL_AREA = 1.5 * np.sqrt(3.0)  # regular hexagon of circumradius 1

_side_angles = np.radians(30.0 + 60.0 * np.arange(6))
FACE_NORMALS = np.zeros((8, 3))
FACE_NORMALS[:6, 0] = np.cos(_side_angles)
FACE_NORMALS[:6, 1] = np.sin(_side_angles)
FACE_NORMALS[6] = (0.0, 0.0, 1.0)
FACE_NORMALS[7] = (0.0, 0.0, -1.0)

_vertex_angles = np.radians(60.0 * np.arange(7))
HEX_VERTICES = np.stack([np.cos(_vertex_angles), np.sin(_vertex_angles)], axis=1)  # 7th repeats the 1st


def ice_index(wavelength_nm):
    micrometres = wavelength_nm * 1e-3
    return N_ICE_A + N_ICE_B / (micrometres * micrometres)


# -----------------------------------------------------------------------------
# Colour: sample the visible spectrum and let each ray carry its own wavelength,
# which gives the smooth rainbow edges of a real halo instead of three hard
# coloured copies. CIE 1931 fit from Wyman, Sloan & Shirley 2013.
# -----------------------------------------------------------------------------
def _lobe(x, mu, s1, s2):
    t = (x - mu) / np.where(x < mu, s1, s2)
    return np.exp(-0.5 * t * t)


def _cie_xyz(wavelength_nm):
    x = 1.056 * _lobe(wavelength_nm, 599.8, 37.9, 31.0) + 0.362 * _lobe(wavelength_nm, 442.0, 16.0, 26.7) - 0.065 * _lobe(wavelength_nm, 501.1, 20.4, 26.2)
    y = 0.821 * _lobe(wavelength_nm, 568.8, 46.9, 40.5) + 0.286 * _lobe(wavelength_nm, 530.9, 16.3, 31.1)
    z = 1.217 * _lobe(wavelength_nm, 437.0, 11.8, 36.0) + 0.681 * _lobe(wavelength_nm, 459.0, 26.0, 13.8)
    return np.stack([x, y, z], axis=-1)


_XYZ_TO_LINEAR_SRGB = np.array([
    [3.2404542, -1.5371385, -0.4985314],
    [-0.9692660, 1.8760108, 0.0415560],
    [0.0556434, -0.2040259, 1.0572252],
])

SPECTRUM_MIN_NM = 390.0
SPECTRUM_MAX_NM = 700.0


def _build_white_balance():
    grid = np.linspace(SPECTRUM_MIN_NM, SPECTRUM_MAX_NM, 2001)
    rgb = _cie_xyz(grid) @ _XYZ_TO_LINEAR_SRGB.T
    total = rgb.mean(axis=0)
    # An unrefracted sun must stay white, whatever the sample of the spectrum.
    return 1.0 / total


_WHITE_BALANCE = _build_white_balance()


def wavelength_to_rgb(wavelength_nm):
    """Linear sRGB weight of a monochromatic ray; averages to (1, 1, 1) over the spectrum."""
    return (_cie_xyz(wavelength_nm) @ _XYZ_TO_LINEAR_SRGB.T) * _WHITE_BALANCE


# -----------------------------------------------------------------------------
# Orientation populations. Each returns rotation matrices (N, 3, 3) taking crystal
# frame vectors to world frame vectors.
# -----------------------------------------------------------------------------
def _rotations_from_c_axis(c_axis, rng):
    """Any rotation that sends +z to c_axis, with a uniformly random spin about it."""
    n = c_axis.shape[0]
    helper = np.where((np.abs(c_axis[:, 0]) < 0.9)[:, None], np.array([1.0, 0.0, 0.0]), np.array([0.0, 1.0, 0.0]))
    x_axis = np.cross(c_axis, helper)
    x_axis /= np.linalg.norm(x_axis, axis=1, keepdims=True)
    y_axis = np.cross(c_axis, x_axis)
    spin = rng.uniform(0.0, 2.0 * np.pi, n)
    cos_s, sin_s = np.cos(spin)[:, None], np.sin(spin)[:, None]
    spun_x = cos_s * x_axis + sin_s * y_axis
    spun_y = -sin_s * x_axis + cos_s * y_axis
    return np.stack([spun_x, spun_y, c_axis], axis=2)


def orient_random(n, rng, tilt_degrees=0.0):
    c_axis = rng.normal(size=(n, 3))
    c_axis /= np.linalg.norm(c_axis, axis=1, keepdims=True)
    return _rotations_from_c_axis(c_axis, rng)


def orient_plates(n, rng, tilt_degrees):
    """c-axis vertical, wobbling by a gaussian tilt: sundogs, the parhelic circle, the CZA."""
    sigma = np.radians(tilt_degrees)
    c_axis = np.stack([rng.normal(0.0, sigma, n), np.ones(n), rng.normal(0.0, sigma, n)], axis=1)
    c_axis /= np.linalg.norm(c_axis, axis=1, keepdims=True)
    return _rotations_from_c_axis(c_axis, rng)


def orient_columns(n, rng, tilt_degrees):
    """c-axis horizontal in a random compass direction, wobbling in elevation only:
    the upper and lower tangent arcs, and the circumscribed halo they grow into."""
    sigma = np.radians(tilt_degrees)
    azimuth = rng.uniform(0.0, 2.0 * np.pi, n)
    c_axis = np.stack([np.cos(azimuth), rng.normal(0.0, sigma, n), np.sin(azimuth)], axis=1)
    c_axis /= np.linalg.norm(c_axis, axis=1, keepdims=True)
    return _rotations_from_c_axis(c_axis, rng)


def sample_half_length(kind, n, rng):
    """Half length h of the prism (circumradius 1). Plates are thin, columns long, and
    the randomly oriented population -- which makes the plain 22 and 46 degree rings --
    is a mix of both."""
    if kind == 'plate':
        return np.exp(rng.uniform(np.log(0.05), np.log(0.35), n))
    if kind == 'column':
        return np.exp(rng.uniform(np.log(0.8), np.log(2.5), n))
    return np.exp(rng.uniform(np.log(0.1), np.log(2.5), n))


POPULATIONS = {
    'random': {'orient': orient_random, 'aspect': 'mixed', 'elevation_dependent': False},
    'plate': {'orient': orient_plates, 'aspect': 'plate', 'elevation_dependent': True},
    'column': {'orient': orient_columns, 'aspect': 'column', 'elevation_dependent': True},
}


# -----------------------------------------------------------------------------
# Optics
# -----------------------------------------------------------------------------
def _fresnel(cos_i, eta):
    """Unpolarised reflectance for light meeting a surface at cos_i, going into a medium
    of relative index eta. Returns (R, cos_t); R is 1 where the light is totally
    internally reflected."""
    sin_t2 = (1.0 - cos_i * cos_i) / (eta * eta)
    tir = sin_t2 >= 1.0
    cos_t = np.sqrt(np.clip(1.0 - sin_t2, 0.0, 1.0))
    rs = (cos_i - eta * cos_t) / (cos_i + eta * cos_t + 1e-12)
    rp = (eta * cos_i - cos_t) / (eta * cos_i + cos_t + 1e-12)
    reflectance = np.where(tir, 1.0, 0.5 * (rs * rs + rp * rp))
    return reflectance, cos_t


def _refract(direction, against, cos_i, cos_t, eta):
    """`against` is the surface normal pointing back the way the ray came."""
    return direction / eta[:, None] + ((cos_i / eta) - cos_t)[:, None] * against


def trace_batch(population, sun_elevation_degrees, n, rng, tilt_degrees, max_hits=4):
    """Trace n crystals. Returns (view_world, weight_rgb): where the observer must look
    (unit vectors) and the linear rgb radiance each exit contributes, for every exit
    of every ray including the entry reflection."""
    spec = POPULATIONS[population]
    half_length = sample_half_length(spec['aspect'], n, rng)
    rotation = spec['orient'](n, rng, tilt_degrees)

    elevation = np.radians(sun_elevation_degrees)
    sun = np.array([np.cos(elevation), np.sin(elevation), 0.0])
    travel_world = -sun
    # world -> crystal is the transpose of crystal -> world
    travel = np.einsum('nji,j->ni', rotation, travel_world)

    wavelength = rng.uniform(SPECTRUM_MIN_NM, SPECTRUM_MAX_NM, n)
    spectral_rgb = wavelength_to_rgb(wavelength)
    index = ice_index(wavelength)

    # Which face does this ray enter by? Chosen in proportion to projected area, so
    # the crystal is illuminated uniformly, and every ray then carries the total
    # projected area as its weight.
    face_area = np.empty((n, 8))
    face_area[:, :6] = (2.0 * half_length)[:, None]
    face_area[:, 6:] = BASAL_AREA
    facing = np.clip(-(travel @ FACE_NORMALS.T), 0.0, None)
    projected = face_area * facing
    total_projected = projected.sum(axis=1)
    pick = rng.uniform(size=n) * total_projected
    entry_face = np.minimum((np.cumsum(projected, axis=1) < pick[:, None]).sum(axis=1), 7)

    # A uniformly random point on that face.
    r1, r2 = rng.uniform(size=n), rng.uniform(size=n)
    point = np.zeros((n, 3))
    side = entry_face < 6
    k = np.where(side, entry_face, 0)
    v0, v1 = HEX_VERTICES[k], HEX_VERTICES[k + 1]
    side_xy = v0 + r1[:, None] * (v1 - v0)
    side_z = (2.0 * r2 - 1.0) * half_length
    triangle = rng.integers(0, 6, n)
    root = np.sqrt(r1)[:, None]
    basal_xy = root * ((1.0 - r2)[:, None] * HEX_VERTICES[triangle] + r2[:, None] * HEX_VERTICES[triangle + 1])
    basal_z = np.where(entry_face == 6, half_length, -half_length)
    point[:, :2] = np.where(side[:, None], side_xy, basal_xy)
    point[:, 2] = np.where(side, side_z, basal_z)

    plane_offset = np.empty((n, 8))
    plane_offset[:, :6] = SIDE_APOTHEM
    plane_offset[:, 6:] = half_length[:, None]

    out_directions = []
    out_weights = []

    def emit(direction_crystal, weight, mask=None):
        world = np.einsum('nij,nj->ni', rotation, direction_crystal)
        rgb = spectral_rgb * (total_projected * weight)[:, None]
        if mask is not None:
            world, rgb = world[mask], rgb[mask]
        out_directions.append(-world)
        out_weights.append(rgb)

    # Entry: reflect a little, refract the rest in.
    entry_normal = FACE_NORMALS[entry_face]
    cos_i = np.clip(-(travel * entry_normal).sum(axis=1), 1e-6, 1.0)
    reflectance, cos_t = _fresnel(cos_i, index)
    emit(travel + 2.0 * cos_i[:, None] * entry_normal, reflectance)
    direction = _refract(travel, entry_normal, cos_i, cos_t, index)
    weight = 1.0 - reflectance

    for _ in range(max_hits):
        # Where does the ray leave the convex prism? The nearest plane it is heading towards.
        approach = direction @ FACE_NORMALS.T
        distance = (plane_offset - point @ FACE_NORMALS.T) / np.where(approach > 1e-9, approach, 1.0)
        distance = np.where(approach > 1e-9, distance, np.inf)
        exit_face = np.argmin(distance, axis=1)
        travelled = distance[np.arange(n), exit_face]
        point = point + travelled[:, None] * direction
        normal = FACE_NORMALS[exit_face]

        cos_i = np.clip((direction * normal).sum(axis=1), 1e-6, 1.0)
        reflectance, cos_t = _fresnel(cos_i, 1.0 / index)
        transmitted = 1.0 - reflectance
        leaves = transmitted > 0.0
        exit_direction = _refract(direction, -normal, cos_i, cos_t, 1.0 / index)
        emit(exit_direction, weight * transmitted, leaves)

        direction = direction - 2.0 * cos_i[:, None] * normal
        weight = weight * reflectance
        if weight.max() < 1e-5:
            break

    return np.concatenate(out_directions), np.concatenate(out_weights), sun


def to_theta_psi(view_world, sun):
    """Angle from the sun, and angle round it from straight up folded onto [0, pi]."""
    cos_theta = np.clip(view_world @ sun, -1.0, 1.0)
    theta = np.arccos(cos_theta)
    up = np.array([0.0, 1.0, 0.0])
    up_on_sky = up - sun * (up @ sun)
    up_on_sky /= np.linalg.norm(up_on_sky)
    right = np.cross(up_on_sky, sun)
    psi = np.arctan2(np.abs(view_world @ right), view_world @ up_on_sky)
    return theta, psi
