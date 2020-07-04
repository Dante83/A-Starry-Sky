//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Stars.starDataMap = {
  uniforms: {
    textureRChannel: {type: 't', 'value': null},
    textureGChannel: {type: 't', 'value': null},
    textureBChannel: {type: 't', 'value': null},
    textureAChannel: {type: 't', 'value': null},
  },
  fragmentShader: [
    'uniform sampler2D textureRChannel;',
    'uniform sampler2D textureGChannel;',
    'uniform sampler2D textureBChannel;',
    'uniform sampler2D textureAChannel;',

    'float rgba2Float(vec4 rgbaValue, float minValue, float maxValue){',
      'vec4 v = floor(rgbaValue * 256.0);',

      '//First convert this to the unscaled integer values',
      'float floatValue = (v.a - 1.0) + 256.0 * (v.b + 256.0 * (v.g + 256.0 * v.r));',

      '//Now scale the float down to the appropriate range',
      'return ((floatValue * (maxValue - minValue)) / 4294967296.0) + minValue;',
    '}',

    'void main(){',
      'vec2 uv = gl_FragCoord.xy / resolution.xy;',

      'float r = rgba2Float(texture2D(textureRChannel, uv), -17000.0, 17000.0);',
      'float g = rgba2Float(texture2D(textureGChannel, uv), -17000.0, 17000.0);',
      'float b = rgba2Float(texture2D(textureBChannel, uv), -17000.0, 17000.0);',
      'float a = rgba2Float(texture2D(textureAChannel, uv), -2.0, 7.0);',

      'gl_FragColor = vec4(r, g, b, a);',
    '}',
  ].join('\n')
}
