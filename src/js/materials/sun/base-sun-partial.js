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
    'vec3 sunTexel = vec3(0.0);',
    'if(vLocalPosition.y >= 0.0){',
      'float pixelDistanceFromSun = distance(offsetUV, vec2(0.5));',

      '//From https://github.com/supermedium/superframe/blob/master/components/sun-sky/shaders/fragment.glsl',
      'float sundisk = smoothstep(0.0, 0.1, (0.5 - (pixelDistanceFromSun)));',

      '//Solar limb darkening, per RGB band -- limb reddens because blue darkens',
      '//more than red. ac1/ac2/ac3 are vec3 (B/V/R) declared in the sun-pass',
      '//header. At mu=1 (disc center) all channels equal 1; at mu=0 (limb) we',
      '//keep ~0.59 R / 0.47 G / 0.30 B.',
      'float rOverR = pixelDistanceFromSun / 0.5;',
      'float mu = sqrt(clamp(1.0 - rOverR * rOverR, 0.0, 1.0));',
      'vec3 limbDarkening = ac1 + ac2 * mu + 2.0 * ac3 * mu * mu;',

      '//The chromatic part of limb darkening is only visible when the sun is',
      '//reddened by the atmosphere. At midday the HDR disc clips to white in the',
      '//center while the limb stays orange, which shows up as a ring. Fade the',
      '//colour difference in with atmospheric reddening (blue/red transmittance),',
      '//keeping only the achromatic (green) darkening at midday.',
      'float sunsetAmount = 1.0 - smoothstep(0.35, 0.85, transmittanceFade.b / max(transmittanceFade.r, 0.0001));',
      'sunsetAmount *= sunsetAmount; //keep the chromatic limb off until the sun is properly reddened',
      'limbDarkening = mix(vec3(limbDarkening.g), limbDarkening, sunsetAmount);',

      '//Apply transmittance to our sun disk direct lighting',
      'vec3 normalizedWorldPosition = normalize(vLocalPosition);',
      'vec3 vectorBetweenMoonAndPixel = normalizedWorldPosition - moonPosition;',
      'float distanceBetweenPixelAndMoon = length(vectorBetweenMoonAndPixel);',
      '//The corona/flare texture should only show when the moon is (nearly) covering',
      '//the sun, not behind the sun disc at midday. Gate it by sun-moon separation.',
      'float sunMoonSeparation = distance(sunPosition, moonPosition);',
      'float coronaVisibility = 1.0 - smoothstep(0.1 * moonRadius, 0.8 * moonRadius, sunMoonSeparation);',
      'coronaVisibility *= coronaVisibility;',

      'sunTexel = (3.0 * sundisk * sunDiskIntensity * limbDarkening + 2.0 * coronaVisibility * texture2D(solarEclipseMap, vUv * 1.9 - vec2(0.45)).r) * transmittanceFade;',
      'sunTexel *= smoothstep(0.97 * moonRadius, moonRadius, distanceBetweenPixelAndMoon);',
    '}',
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
      'vWorldPosition = vec3(-worldPosition.z, -worldPosition.y, -worldPosition.x);',

      'vUv = uv;',

      'gl_Position = vec4(position, 1.0);',
    '}',
  ].join('\n'),
}
