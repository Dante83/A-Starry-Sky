//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
var sunShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    rayleigh: {type: 'f', value: 0.0},
    rayleighCoefficientOfSun: {type: 'f', value: 0.0},
    sunFade: {type: 'f',value: 0.0},
    moonFade: {type: 'f', value: 0.0},
    luminance: {type: 'f',value: 0.0},
    mieDirectionalG: {type: 'f',value: 0.0},
    sunE: {type: 'f',value: 0.0},
    angularDiameterOfTheSun: {type: 'f', value: 0.0},
    betaM: {type: 'v3',value: new THREE.Vector3()},
    sunXYZPosition: {type: 'v3', value: new THREE.Vector3()},
  },

  blending: THREE.NormalBlending,
  transparent: true,

  vertexShader: [
    '#ifdef GL_ES',
    'precision mediump float;',
    'precision mediump int;',
    '#endif',

    'varying vec3 vWorldPosition;',
    'varying vec3 betaRPixel;',

    'uniform float rayleigh;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = worldPosition.xyz;',
      'vec3 normalizedWorldPosition = normalize(worldPosition.xyz);',

      'vec3 simplifiedRayleigh = vec3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);',
      'float pixelFade = 1.0 - clamp(1.0 - exp(normalizedWorldPosition.z), 0.0, 1.0);',
      'betaRPixel = simplifiedRayleigh * (rayleigh - (1.0 - pixelFade));',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
  ].join('\n'),

  fragmentShader: [
    '#ifdef GL_ES',
    'precision mediump float;',
    'precision mediump int;',
    '#endif',

    '//Varyings',
    'varying vec3 vWorldPosition;',
    'varying vec3 betaRPixel;',

    '//Uniforms',
    'uniform float sunFade;',
    'uniform float moonFade;',
    'uniform float luminance;',
    'uniform float mieDirectionalG;',
    'uniform vec3 betaM;',
    'uniform vec3 sunXYZPosition;',
    'uniform float sunE;',
    'uniform float angularDiameterOfTheSun;',

    '//Constants',
    'const vec3 up = vec3(0.0, 1.0, 0.0);',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float oneOverFourPi = 0.079577471545947667884441881686257181017229822870228224373;',
    'const float rayleighPhaseConst = 0.059683103659460750913331411264692885762922367152671168280;',
    'const float rayleighAtmosphereHeight = 8.4E3;',
    'const float mieAtmosphereHeight = 1.25E3;',
    'const float rad2Deg = 57.29577951308232087679815481410517033240547246656432154916;',

    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',
    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',
    'vec2 rayleighPhase(vec2 cosTheta){',
      'return rayleighPhaseConst * (1.0 + cosTheta * cosTheta);',
    '}',

    'vec2 hgPhase(vec2 cosTheta){',
      'return oneOverFourPi * ((1.0 - mieDirectionalG * mieDirectionalG) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + (mieDirectionalG * mieDirectionalG), vec2(1.5)));',
    '}',

    '// Filmic ToneMapping http://filmicgames.com/archives/75',
    'const float A = 0.15;',
    'const float B = 0.50;',
    'const float C = 0.10;',
    'const float D = 0.20;',
    'const float E = 0.02;',
    'const float F = 0.30;',
    'const float W = 1000.0;',
    'const float unchartedW = 0.93034292920990640579589580673035390594971634341319642;',

    'vec3 Uncharted2Tonemap(vec3 x){',
      'return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;',
    '}',

    'vec3 applyToneMapping(vec3 outIntensity, vec3 L0){',
      'outIntensity *= 0.04;',
      'outIntensity += vec3(0.0, 0.0003, 0.00075);',

      'vec3 color = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))* outIntensity) / unchartedW;',
      'return pow(abs(color),vec3(1.0/(1.2 *(1.0 + (sunFade + moonFade)))));',
    '}',

    '//',
    '//Sun',
    '//',
    'vec4 drawSunLayer(vec3 FexPixel, float cosThetaOfSun){',
      '//It seems we need to rotate our sky by pi radians.',
      'float sunAngularDiameterCos = cos(angularDiameterOfTheSun);',
      'float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002, cosThetaOfSun);',

      'vec3 L0 = (sunE * 19000.0 * FexPixel) * sundisk;',
      'L0 *= 0.04 ;',
      'L0 += vec3(0.0,0.001,0.0025)*0.3;',

      'vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*L0);',
      'vec3 color = curr / unchartedW;',
      'color = pow(color,abs(vec3(1.0/(1.2+(1.2 * sunFade)))) );',
      'return vec4(color, sundisk);',
    '}',

    'void main(){',
      'vec3 normalizedWorldPosition = normalize(vWorldPosition.xyz);',

      'float cosOfZenithAngleOfCamera = max(0.0, dot(up, normalizedWorldPosition));',
      'float zenithAngleOfCamera = acos(cosOfZenithAngleOfCamera);',
      'float inverseSDenominator = 1.0 / (cosOfZenithAngleOfCamera + 0.15 * pow(93.885 - (zenithAngleOfCamera * rad2Deg), -1.253));',
      'float sR = rayleighAtmosphereHeight * inverseSDenominator;',
      'float sM = mieAtmosphereHeight * inverseSDenominator;',

      'vec3 betaMTimesSM = betaM * sM;',
      'vec3 FexPixel = exp(-(betaRPixel * sR + betaMTimesSM));',

      '//Apply tone mapping to the result',
      'float cosTheta = dot(normalizedWorldPosition, sunXYZPosition);',
    '	gl_FragColor = drawSunLayer(FexPixel, cosTheta);',
    '}',
  ].join('\n')
});

sunShaderMaterial.clipping = true;
sunShaderMaterial.flatShading = true;
