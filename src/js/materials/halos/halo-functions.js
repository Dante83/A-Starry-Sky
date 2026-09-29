//This is not your usual file, instead it is a kind of fragment file that contains
//a partial glsl fragment file with the functions that draw the ice crystal halos. It gets
//injected into atmosphere-pass.glsl at the $haloFunctions token, so it is
//never compiled on its own and has no uniforms of its own -- they are declared
//in atmosphere-pass.glsl and created by the atmosphereShader uniforms factory.
//
//$haloThetaMax, $haloElevationStep and $haloElevationLayers are filled in by the
//atmosphereShader fragmentShader factory from the atlas layout in SkyHalos.js.
StarrySky.Materials.Halos.haloFunctions = {
  partialFragmentShader: [
    '//Draws the ice crystal halos round the sun or the moon: the 22 and 46 degree rings, sundogs,',
    '//the parhelic circle, tangent arcs and the circumzenithal arc. Ray traced through hexagonal',
    '//ice prisms offline by src/python/halo-baker/, and stored in haloMaps, one layer per',
    '//crystal population and sun elevation.',
    '//',
    '//This chunk is injected into atmosphere-pass.glsl at the $haloFunctions token, so it is never',
    '//compiled on its own and has no uniforms of its own -- haloMaps is declared in',
    '//atmosphere-pass.glsl. Every name is prefixed to keep clear of the lines it lands in.',
    '//',
    '//Each layer is the sky round the body unrolled into polar coordinates: x is the angle from',
    '//the body (0 to HALO_THETA_MAX) and y is the angle round it measured from straight up (0 to',
    '//pi, since the sky is mirror symmetric left to right). So a pixel needs only an acos and an',
    '//atan to find its texel, and the halos reach as far as the zenith with no quad round the sun.',
    '//',
    '//The layout constants below are filled in from DefaultData.skyHalos.atlas in SkyHalos.js,',
    '//and checked against the baker by `bake.py --check-js`.',
    'const float HALO_THETA_MAX = $haloThetaMax;',
    'const float HALO_ELEVATION_STEP = $haloElevationStep;',
    'const int HALO_ELEVATION_LAYERS = $haloElevationLayers;',
    'const int HALO_RANDOM_LAYER = 0;',
    'const int HALO_PLATE_FIRST_LAYER = 1;',
    'const int HALO_COLUMN_FIRST_LAYER = 1 + HALO_ELEVATION_LAYERS;',

    '//Layers are gamma 2 encoded so the faint outer rings keep their precision in 8 bits.',
    'vec3 haloDecode(vec3 encoded){',
      'return encoded * encoded;',
    '}',

    'vec3 haloSampleLayer(vec2 uv, int layer){',
      'return haloDecode(textureLod(haloMaps, vec3(uv, float(layer)), 0.0).rgb);',
    '}',

    '//Radiance of the halos round bodyPosition as seen looking along viewPosition, in units of the',
    '//baked peak. populationGains holds the strength of the random, plate and column populations.',
    'vec3 haloLookup(vec3 viewPosition, vec3 bodyPosition, vec3 populationGains){',
      'float theta = acos(clamp(dot(viewPosition, bodyPosition), -1.0, 1.0));',
      'float u = theta / HALO_THETA_MAX;',
      'if(u >= 1.0){',
        'return vec3(0.0);',
      '}',

      '//Angle round the body from straight up. A body at the zenith has no up to speak of, but',
      '//the plates and columns that care are gone by then and the random layer is symmetric.',
      'vec3 upOnSky = vec3(0.0, 1.0, 0.0) - bodyPosition * bodyPosition.y;',
      'upOnSky /= max(length(upOnSky), 1e-4);',
      'vec3 rightOnSky = cross(upOnSky, bodyPosition);',
      'float psi = atan(max(abs(dot(viewPosition, rightOnSky)), 1e-7), dot(viewPosition, upOnSky));',
      'vec2 uv = vec2(u, psi / pi);',

      '//Plates and columns change with the height of the body, so blend the two layers either',
      '//side of it. Higher than the top of the ladder just reuses the top layer.',
      'float ladder = clamp(asin(clamp(bodyPosition.y, -1.0, 1.0)) / HALO_ELEVATION_STEP, 0.0, float(HALO_ELEVATION_LAYERS - 1));',
      'int lower = int(floor(ladder));',
      'int upper = min(lower + 1, HALO_ELEVATION_LAYERS - 1);',
      'float blend = ladder - float(lower);',

      'vec3 randomHalo = haloSampleLayer(uv, HALO_RANDOM_LAYER);',
      'vec3 plateHalo = mix(haloSampleLayer(uv, HALO_PLATE_FIRST_LAYER + lower), haloSampleLayer(uv, HALO_PLATE_FIRST_LAYER + upper), blend);',
      'vec3 columnHalo = mix(haloSampleLayer(uv, HALO_COLUMN_FIRST_LAYER + lower), haloSampleLayer(uv, HALO_COLUMN_FIRST_LAYER + upper), blend);',

      'return randomHalo * populationGains.x + plateHalo * populationGains.y + columnHalo * populationGains.z;',
    '}',
  ].join('\n')
}
