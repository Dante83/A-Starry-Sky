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
    'float pixelDistanceFromSun = distance(sunPosition, sphericalPosition);',

    '//From https://github.com/supermedium/superframe/blob/master/components/sun-sky/shaders/fragment.glsl',
    'float sundisk = smoothstep($sunAngularDiameter, $sunAngularDiameter+0.00002, pixelDistanceFromSun);',

    '//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',
    'float limbDarkening;',

    '//Apply transmittance to our sun disk direct lighting',
    'vec3 sunPassColor = vec3(sundisk) * transmittanceFade;',

    "//For now, let us just use the intensity of the sun disk to set it's transparency",
    'float sunPassTransparency = sundisk;',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$sunAngularDiameter/g, sunAngularDiameter.toFixed(5));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
}
