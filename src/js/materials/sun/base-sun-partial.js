//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Sun.baseSunPartial = {
  fragmentShader: function(sunAngularDiameter){
    let originalGLSL = [
    '//We enter and leave with additionalPassColor, which we add our sun direct',
    '//lighting to, after it has been attenuated by our transmittance.',

    '//Our sun is located in the middle square of our quad, so that we give our',
    '//solar bloom enough room to expand into without clipping the edge.',
    '//We also fade out our quad towards the edge to reduce the visibility of sharp',
    '//edges.',
    'float pixelDistanceFromSun = distance(offsetUV, vec2(0.5));',

    '//From https://github.com/supermedium/superframe/blob/master/components/sun-sky/shaders/fragment.glsl',
    'float sundisk = smoothstep(0.0, 0.1, (0.5 - (pixelDistanceFromSun)));',

    '//We can use this for our solar limb darkening',
    '//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',
    'float rOverR = pixelDistanceFromSun / 0.5;',
    'float mu = sqrt(clamp(1.0 - rOverR * rOverR, 0.0, 1.0));',
    'float limbDarkening = (ac1 + ac2 * mu + 2.0 * ac3 * mu * mu);',

    '//Apply transmittance to our sun disk direct lighting',
    'vec3 normalizedWorldPosition = normalize(vWorldPosition);',
    'vec3 vectorBetweenMoonAndPixel = normalizedWorldPosition - moonPosition;',
    'float distanceBetweenPixelAndMoon = length(vectorBetweenMoonAndPixel);',
    'vec3 sunTexel = (3.0 * sundisk * sunDiskIntensity + 2.0 * texture2D(solarEclipseMap, vUv * 1.9 - vec2(0.45)).r) * transmittanceFade;',
    'sunTexel *= smoothstep(0.97 * moonRadius, moonRadius, distanceBetweenPixelAndMoon);',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$sunAngularDiameter/g, sunAngularDiameter.toFixed(5));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  },
  vertexShader: [
    'uniform float radiusOfSunPlane;',
    'uniform mat4 worldMatrix;',
    'varying vec3 vWorldPosition;',
    'varying vec3 vLocalPosition;',
    'varying vec2 vUv;',

    'void main() {',
      'mat4 worldMatrixIn = worldMatrix;',
      'vec4 worldMatrixTranslation = worldMatrixIn[3];',
      'worldMatrixIn[3] = worldMatrixTranslation - vec4(cameraPosition, 0.0);',
      'vec4 worldPosition = worldMatrixIn * vec4(position * radiusOfSunPlane * 2.0, 1.0);',
      'vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);',
      'vLocalPosition = normalize(vWorldPosition.xyz);',
      'worldPosition = worldMatrix * vec4(position * radiusOfSunPlane * 2.0, 1.0);',
      'vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);',

      'vUv = uv;',

      'gl_Position = vec4(position, 1.0);',
    '}',
  ].join('\n'),
}
