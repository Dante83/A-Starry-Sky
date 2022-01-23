export default function SeperableBlurFilter(){
  return({
    uniforms: {
      direction: {'value': new Vector2(0.5, 0.5)},
      sourceTexture: {'value': null}
    },
    fragmentShader: function(kernalRadius, textureSize){
      let originalGLSL = [
    '//Derivative of Unreal Bloom Pass from Three.JS',
    '//Thanks spidersharma / http://eduperiment.com/',
    '//',
    'uniform sampler2D sourceTexture;',
    'uniform vec2 direction;',

    '//Based on Luminosity High Pass Shader',
    '//Originally created by bhouston / http://clara.io/',
    'void main(){',
      'vec2 vUv = gl_FragCoord.xy / resolution.xy;',
      'float weightedSum = $gaussian_pdf_at_x_0;',
      'vec3 diffuseSum = texture2D(sourceTexture, vUv).rgb * weightedSum;',

      '//Unrolled for loop (completed in material function)',
      '$unrolled_for_loop',

      'gl_FragColor = vec4(abs(diffuseSum/weightedSum), 1.0);',
    '}',
      ];

      function gaussianPdf(x){
        return 0.39894 * Math.exp(-0.5 * x * x / (kernalRadius * kernalRadius)) / kernalRadius;
      }

      const invSize = 1.0 / textureSize;
      const unrolledForLoop = [];

      //loop 0 (defines variables)
      const w = gaussianPdf(1.0).toFixed(16); //gaussianPdf(i), i = 1
      unrolledForLoop.push(`vec2 uvOffset = direction * ${invSize.toFixed(16)};`);
      unrolledForLoop.push(`vec3 sample1 = texture2D(sourceTexture, vUv + uvOffset).rgb;`);
      unrolledForLoop.push(`vec3 sample2 = texture2D(sourceTexture, vUv - uvOffset).rgb;`);
      unrolledForLoop.push(`diffuseSum += (sample1 + sample2) * ${w};`);
      unrolledForLoop.push(`weightedSum += 2.0 * ${w};`);
      //Unroll the rest of the for loop
      for(let i = 2.0; i < kernalRadius; ++i){
        const w = gaussianPdf(i).toFixed(16);
        unrolledForLoop.push(`uvOffset = direction * ${(invSize * i).toFixed(16)};`);
        unrolledForLoop.push(`sample1 = texture2D(sourceTexture, vUv + uvOffset).rgb;`);
        unrolledForLoop.push(`sample2 = texture2D(sourceTexture, vUv - uvOffset).rgb;`);
        unrolledForLoop.push(`diffuseSum += (sample1 + sample2) * ${w};`);
        unrolledForLoop.push(`weightedSum += 2.0 * ${w};`);
      }
      const joinedUnrolledForLoop = unrolledForLoop.join('\n');

      const updatedLines = [];
      for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
        let updatedGLSL = originalGLSL[i].replace(/\$gaussian_pdf_at_x_0/g, gaussianPdf(0.0).toFixed(16));
        updatedGLSL = updatedGLSL.replace(/\$unrolled_for_loop/g, joinedUnrolledForLoop);

        updatedLines.push(updatedGLSL);
      }

      return updatedLines.join('\n');
    }
  });
};
