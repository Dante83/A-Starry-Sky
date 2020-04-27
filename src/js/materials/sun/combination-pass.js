//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Sun.combinationPass = {
  uniforms: {
    basePass: {type: 't', 'value': null},
  },
  vertexShader: [
    'varying vec3 vWorldPosition;',
    'varying vec2 vUv;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = worldPosition.xyz;',
      'vUv = uv;',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

      '//We offset our sun z-position by 0.01 to avoid Z-Fighting with the back sky plane',
      'gl_Position.z -= 0.01;',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D basePass;',
    '//uniform sampler2D bloomPass;',

    'varying vec2 vUv;',

    'void main(){',
      '//vec3 combinedPass = basePass + bloomPass;',
      'vec4 combinedPass = texture2D(basePass, vUv);',

      '//Color Adjustment Pass',
      'vec3 toneMappedColor = OptimizedCineonToneMapping(combinedPass.rgb);',

      '//Late triangular blue noise',

      '//Return our tone mapped color when everything else is done',
      'gl_FragColor = toneMappedColor;',
    '}',
  ].join('\n')
};
