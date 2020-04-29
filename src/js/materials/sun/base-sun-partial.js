//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Sun.baseSunPartial = {
  fragmentShader: function(sunAngularDiameter){
    let originalGLSL = [
    '//We enter and leave with additionalPassColor, which we add our sun direct',
    '//lighting to, after it has been attenuated by our transmittance.',

    "//We're going to do this ever render pass, but in the future, we will just",
    '//do a lookup of this value from a downloaded texture.',
    '//We can use this for our solar limb darkening',
    '//https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',
    'float pixelDistanceFromSun = distance(vUv, vec2(0.5));',

    '//From https://github.com/supermedium/superframe/blob/master/components/sun-sky/shaders/fragment.glsl',
    'float sundisk = smoothstep(0.0, 0.1, (0.5 - pixelDistanceFromSun));',

    '//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',
    'float rOverR = pixelDistanceFromSun / 0.5;',
    'float mu = sqrt(1.0 - rOverR * rOverR);',
    'float limbDarkening = (ac1 + ac2 * mu + 2.0 * ac3 * mu * mu);',

    '//Apply transmittance to our sun disk direct lighting',
    'vec3 sunPassColor = sundisk * sunIntensity * transmittanceFade * limbDarkening + combinedAtmosphericPass;',

    "//For now, let us just use the intensity of the sun disk to set it's transparency",
    'float sunPassTransparency = sundisk;',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$sunAngularDiameter/g, sunAngularDiameter.toFixed(5));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  },
  vertexShader: [
    'uniform float scale;',
    'uniform mat4 worldMatrix;',
    'varying vec3 vWorldPosition;',
    'varying vec2 vUv;',

    'void main() {',
      'vec4 worldPosition = worldMatrix * vec4(position * scale, 1.0);',
      'vWorldPosition = normalize(worldPosition.xyz);',
      'vUv = uv;',

      'gl_Position = vec4(position, 1.0);',
    '}',
  ].join('\n'),
}
