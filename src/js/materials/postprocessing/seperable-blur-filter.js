//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Postprocessing.seperableBlurFilter = {
  uniforms: {
    direction: {type: 'vec2', 'value': new THREE.Vector2(0.5, 0.5)},
    sourceTexture: {type: 't', 'value': null}
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

      'gl_FragColor = vec4(diffuseSum/weightedSum, 1.0);',
    '}',
    ];

    let oneOverSigmaSquared = 1.0 / kernalRadius * kernalRadius;
    let inverseSigma = 1.0 / kernalRadius;
    function gaussianPdf(x){
      return 0.39894 * Math.exp(-0.5 * x * x * oneOverSigmaSquared) * inverseSigma;
    }

    let invSize = 1.0 / textureSize;
    console.log(textureSize);
    let gaussianPdfAtX0 = 0.39894 * inverseSigma;
    let unrolledForLoop = [];

    //loop 0 (defines variables)
    let w = gaussianPdf(1.0); //gaussianPdf(i), i = 1
    let invSizeTimesI = invSize; //invSize * i, i = 1
    unrolledForLoop.push(`vec2 uvOffset = direction * ${invSizeTimesI.toFixed(16)};`);
    unrolledForLoop.push(`vec3 sample1 = texture2D(sourceTexture, vUv + uvOffset).rgb;`);
    unrolledForLoop.push(`vec3 sample2 = texture2D(sourceTexture, vUv - uvOffset).rgb;`);
    unrolledForLoop.push(`diffuseSum += (sample1 + sample2) * ${w.toFixed(16)};`);
    unrolledForLoop.push(`weightedSum += 2.0 * ${w.toFixed(16)};`);
    //Unroll the rest of the for loop
    for(let i = 2.0; i < kernalRadius; ++i){
      w = gaussianPdf(i);
      invSizeTimesI = invSize * i;
      unrolledForLoop.push(`uvOffset = direction * ${invSizeTimesI.toFixed(16)};`);
      unrolledForLoop.push(`sample1 = texture2D(sourceTexture, vUv + uvOffset).rgb;`);
      unrolledForLoop.push(`sample2 = texture2D(sourceTexture, vUv - uvOffset).rgb;`);
      unrolledForLoop.push(`diffuseSum += (sample1 + sample2) * ${w.toFixed(16)};`);
      unrolledForLoop.push(`weightedSum += 2.0 * ${w.toFixed(16)};`);
    }
    let joinedUnrolledForLoop = unrolledForLoop.join('\n');

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$gaussian_pdf_at_x_0/g, gaussianPdfAtX0.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$unrolled_for_loop/g, joinedUnrolledForLoop);

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};
