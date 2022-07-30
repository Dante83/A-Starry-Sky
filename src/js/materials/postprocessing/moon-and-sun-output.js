StarrySky.Materials.Postprocessing.moonAndSunOutput = {
  uniforms: {
    blueNoiseTexture: {type: 't', 'value': null},
    outputImage: {type: 't', 'value': null},
    uTime: {'value': 0.0},
  },
  fragmentShader: [
    'uniform sampler2D blueNoiseTexture;',
    'uniform sampler2D outputImage;',
    'uniform float uTime;',

    'varying vec3 vWorldPosition;',
    'varying vec2 vUv;',
    'const float sqrtOfOneHalf = 0.7071067811865475244008443;',

    '//From http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/',
    'float rand(float x){',
      'float a = 12.9898;',
      'float b = 78.233;',
      'float c = 43758.5453;',
      'float dt= dot(vec2(x, x) ,vec2(a,b));',
      'float sn= mod(dt,3.14);',
      'return fract(sin(sn) * c);',
    '}',

    '//From The Book of Shaders :D',
    '//https://thebookofshaders.com/11/',
    'float noise(float x){',
      'float i = floor(x);',
      'float f = fract(x);',
      'float y = mix(rand(i), rand(i + 1.0), smoothstep(0.0,1.0,f));',

      'return y;',
    '}',

    '//Including this because someone removed this in a future version of THREE. Why?!',
    'vec3 MyAESFilmicToneMapping(vec3 color) {',
      'return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);',
    '}',

    'void main(){',
      'float distanceFromCenter = distance(vUv, vec2(0.5));',
      'float falloffDisk = clamp(smoothstep(0.0, 1.0, (sqrtOfOneHalf - min(distanceFromCenter * 2.7 - 0.8, 1.0))), 0.0, 1.0);',
      'vec3 combinedPass = texture(outputImage, vUv).rgb;',
      'combinedPass += (texelFetch(blueNoiseTexture, (ivec2(gl_FragCoord.xy) + ivec2(128.0 * noise(uTime),  128.0 * noise(uTime + 511.0))) % 128, 0).rgb - vec3(0.5)) / vec3(128.0);',
      'gl_FragColor = vec4(combinedPass, falloffDisk);',
    '}',
  ].join('\n'),
  vertexShader: [
    'varying vec3 vWorldPosition;',
    'varying vec2 vUv;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = worldPosition.xyz;',
      'vUv = uv;',

      'vec4 projectionPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      'vec3 normalizedPosition = projectionPosition.xyz / projectionPosition.w;',
      'gl_Position = projectionPosition;',

      '//We offset our sun z-position by 0.01 to avoid Z-Fighting with the back sky plane',
      'gl_Position.z -= 0.01;',
    '}',
  ].join('\n')
};
