export default function HighPassFilter(){
  reuturn ({
    uniforms: {
      sourceTexture: {'value': null},
      luminosityThreshold: {'value': null},
    },
    fragmentShader: [
    'uniform sampler2D sourceTexture;',
    'uniform float luminosityThreshold;',

    'const vec3 luma = vec3(0.299, 0.587, 0.144);',

    '//Based on Luminosity High Pass Shader',
    '//Originall created by bhouston / http://clara.io/',
    'void main(){',
      'vec2 vUv = gl_FragCoord.xy / resolution.xy;',
      'vec4 sourceTexture = texture2D(sourceTexture, vUv);',
      'float v = dot(sourceTexture.rgb, luma);',
      'vec4 outputColor = vec4(vec3(0.0), 1.0);',

      '//Note: for the bloom pass our the Unreal Shader sets smoothWidth to 0.01',
      'float alpha = smoothstep(luminosityThreshold, luminosityThreshold + 0.01, v);',

      '//Fudge factor of 0.1 to make sure that we get rid of the added intensity',
      '//from the HDR sun before passing it to our bloom filter.',
      'gl_FragColor = mix(outputColor, sourceTexture * 0.1, alpha);',
    '}',
    ].join('\n')
  });
};
