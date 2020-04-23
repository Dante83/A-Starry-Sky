//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Sun.combinationPass = {
  uniforms: {
    basePass: {type: 't', 'value': null},
  },
  vertexShader: [
    {vertex_shader}
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D basePass;',
    '//uniform sampler2D bloomPass;',

    'void main(){',
      '//vec3 combinedPass = basePass + bloomPass;',
      'combinedPass = basePass;',

      '//Color Adjustment Pass',
      'vec3 toneMappedColor = OptimizedCineonToneMapping(combinedPass.rgb);',

      '//Late triangular blue noise',

      '//Return our tone mapped color when everything else is done',
      'gl_FragColor = vec4(toneMappedColor, combinedPass.a);',
    '}',
  ].join('\n')
};
