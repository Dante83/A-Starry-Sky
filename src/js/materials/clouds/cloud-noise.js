StarrySky.Materials.Clouds.cloudNoiseMaterial = {
  uniforms: {
    zDepth: {value: 0.0},
  },
  fragmentShader: [
    'precision highp sampler3D;',

    '/* discontinuous pseudorandom uniformly distributed in [-0.5, +0.5]^3 */',
    'vec3 random3(vec3 c) {',
    '	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));',
    '	vec3 r;',
    '	r.z = fract(512.0*j);',
    '	j *= .125;',
    '	r.x = fract(512.0*j);',
    '	j *= .125;',
    '	r.y = fract(512.0*j);',
    '	return r-0.5;',
    '}',

    '//3D Tileable Worley Noise',
    'float tileableWorleyNoise(vec3 uv3, int numPoints){',
      'float minDistance = 1000.0;',
    '	float seed = float(numPoints * numPoints);',
      'for(float x = -1.0; x < 1.0; ++x){',
        'for(float y = -1.0; y < 1.0; ++y){',
          'for(float z = -1.0; z < 1.0; ++z){',
    '				for(int i = 0; i < numPoints; ++i){',
    '					//The seed numbers below are meant to give constant values but different random locations',
    '					//for each seed.',
    '					vec3 seedPoint = vec3(4.575 * float(i) + seed, 8.3784875 * (float(i) + seed), 7.457515 * (float(i) + seed));',
    '	        vec3 vec2Point = uv3 - random3(seedPoint) + vec3(x, y, z);',
    '	        minDistance = min(dot(vec2Point, vec2Point), minDistance);',
    '				}',
          '}',
        '}',
      '}',

      'return 1.0 - minDistance;',
    '}',

    '//Presume the width of our texture is 128x128x128',
    '//Presume an output texture width of 2048x1024',
    '//The latter being 16 128x128 textures wide and 8 128x128 textures high',
    'vec3 pixel2DLocTo3DLoc(vec2 fragCoordinate){',
    '	int xIndex = int(floor(fragCoordinate.x / 128.0));',
    '	int yIndex = int(floor(fragCoordinate.y / 128.0));',
    '	float z = float(xIndex + yIndex * 16) / 128.0;',
    '	float x = (fragCoordinate.x - float(xIndex * 128)) / 128.0;',
    '	float y = (fragCoordinate.y - float(yIndex * 128)) / 128.0;',
    '	return vec3(x, y, z);',
    '}',

    'void main(){',
      'vec2 p = gl_FragCoord.xy;',
    '	vec3 p3 = pixel2DLocTo3DLoc(p);',

      '//Worley noise octaves',
      'float worleyNoise1 = tileableWorleyNoise(p3, 12);',
      'float worleyNoise2 = tileableWorleyNoise(p3, 24);',
      'float worleyNoise3 = tileableWorleyNoise(p3, 48);',
      'gl_FragColor = vec4(worleyNoise1, worleyNoise2, worleyNoise3, 1.0);',
    '}',
  ].join('\n')
};
