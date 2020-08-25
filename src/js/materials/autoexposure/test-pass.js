//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Autoexposure.testPass = {
  vertexShader: [
    'varying vec3 vWorldPosition;',
    'varying vec2 vUv;',

    'void main() {',
      '//Just pass over the texture coordinates',
      'vUv = uv;',

      'gl_Position = vec4(position, 1.0);',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D testTexture;',
    'varying vec2 vUv;',

    'void main(){',
      'vec3 testTexture = texture2D(testTexture, vUv).rgb;',
      'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
    '}',
  ].join('\n')
}
