//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
AFRAME.registerShader('moon', {
  schema: {
    rayleighCoefficientOfSun: {type: 'number', default: 0.0, is: 'uniform'},
    rayleighCoefficientOfMoon: {type: 'number', default: 0.0, is: 'uniform'},
    sunFade: {type: 'number', default: 0.0, is: 'uniform'},
    moonFade: {type: 'number', default: 0.0, is: 'uniform'},
    luminance: {type: 'number', default: 0.0, is: 'uniform'},
    twoTimesmieDirectionalG: {type: 'number', default: 0.0, is: 'uniform'},
    oneMinusmieDirectionalGSquared: {type: 'number', default: 0.0, is: 'uniform'},
    betaM: {type: 'number', default: 0.0, is: 'uniform'},
    moonE: {type: 'number', default: 0.0, is: 'uniform'},
    sunE: {type: 'number', default: 0.0, is: 'uniform'},
    linMoonCoefficient2: {type: 'number', default: 0.0, is: 'uniform'},
    linSunCoefficient2: {type: 'number', default: 0.0, is: 'uniform'},
    sunXYZPosition: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    betaRSun: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    betaRMoon: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    moonTangentSpaceSunlight: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    moonXYZPosition: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    moonTexture: {type: 'map', src:'../images/moon-dif-512.png', is: 'uniform'},
    moonNormalMap: {type: 'map', src:'../images/moon-nor-512.png', is: 'uniform'},
  },

  vertexShader: [
    'varying vec3 vWorldPosition;',
    'varying float sR;',
    'varying float sM;',

    'uniform float rayleighCoefficientOfSun;',
    'uniform float rayleighCoefficientOfMoon;',
    'const vec3 up = vec3(0.0, 1.0, 0.0);',
    'const vec3 simplifiedRayleighVal = vec3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);',
    'const float rayleighAtmosphereHeight = 8.4E3;',
    'const float mieAtmosphereHeight = 1.25E3;',
    'const float rad2Deg = 57.29577951308232087679815481410517033240547246656432154916;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = worldPosition.xyz;',

      '//Using dot(a,b) = ||a|| ||b|| * cos(a, b);',
      '//Here, the angle between up and the sun direction is always the zenith angle',
      '//Note in the original code, we normalized the sun direction at this point so that',
      '//the magnitude of that vector will always be one.',
      '//while',
      'vec3 betaRSun = simplifiedRayleighVal * rayleighCoefficientOfSun;',
      'vec3 betaRMoon = simplifiedRayleighVal * rayleighCoefficientOfMoon;',

      '// Get the current optical length',
      '// cutoff angle at 90 to avoid singularity in next formula.',
      '//presuming here that the dot of the sun direction and up is also cos(zenith angle)',
      'float cosOfZenithAngleOfCamera = max(0.0, dot(up, normalize(vWorldPosition)));',
      'float zenithAngleOfCamera = acos(cosOfZenithAngleOfCamera);',
      'float inverseSDenominator = 1.0 / cosOfZenithAngleOfCamera + 0.15 * pow(93.885 - (zenithAngleOfCamera * rad2Deg), -1.253);',
      'sR = rayleighAtmosphereHeight * inverseSDenominator;',
      'sM = mieAtmosphereHeight * inverseSDenominator;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
  ].join('\n'),

  fragmentShader: [
    '#ifdef GL_ES',
    'precision highp float;',
    'precision highp int;',
    '#endif',

    '//Varyings',
    'varying vec3 vWorldPosition;',
    'varying float sR;',
    'varying float sM;',

    '//Uniforms',
    'uniform float sunFade;',
    'uniform float moonFade;',
    'uniform float luminance;',
    'uniform float twoTimesmieDirectionalG;',
    'uniform float oneMinusmieDirectionalGSquared;',
    'uniform float betaM;',
    'uniform vec3 sunXYZPosition;',
    'uniform vec3 betaRSun;',
    'uniform vec3 betaRMoon;',
    'uniform sampler2D moonTexture;',
    'uniform sampler2D moonNormalMap;',
    'uniform vec3 moonTangentSpaceSunlight;',
    'uniform vec3 moonXYZPosition;',
    'uniform float moonE;',
    'uniform float sunE;',
    'uniform float linMoonCoefficient2 //clamp(pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0,1.0)',
    'uniform float linSunCoefficient2 //clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0)',

    '//Constants',
    'const float earthshine = 0.02;',
    'const vec3 up = vec3(0.0, 1.0, 0.0);',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float piOver2 = 1.570796326794896619231321691639751442098584699687552910487;',
    'const float oneOverFourPi = 0.079577471545947667884441881686257181017229822870228224373;',
    'const vec4 lunarLightDensity = 0.1 //Fudge with this till it works',

    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',
    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',
    'float rayleighPhase(vec2 cosTheta){',
      'return 0.75 * (1.0 + cosTheta * cosTheta);',
    '}',

    'vec2 hgPhase(vec2 cosTheta){',
      'return vec2(oneOverFourPi) * (oneMinusmieDirectionalGSquared / pow(twoTimesmieDirectionalG * cosTheta + oneMinusmieDirectionalGSquared, vec2(1.5)));',
    '}',

    'vec4 getDirectInscatteredIntensity(vec3 normalizedWorldPosition, vec3 FexSun, vec3 FexMoon){',
      '//Cos theta of sun and moon',
      'vec2 cosTheta = vec2(dot(normalizedWorldPosition, sunXYZPosition), dot(normalizedWorldPosition, moonXYZPosition));',
      'vec2 rPhase = rayleighPhase(vec2(0.5) * (vec2(1.0) + cosTheta)); //Note: this might be off',
      'vec3 betaRThetaSun = betaRSun * rPhase.x;',
      'vec3 betaRThetaMoon = betaRMoon * rPhase.y;',

      '//Calculate the mie phase angles',
      'float mPhase = hgPhase(cosTheta);',
      'vec3 betaMSun = betaM * mPhase.x;',
      'vec3 betaMMoon = betaM * mPhase.y;',

      'vec3 LinSunCoefficient = (sunE * (betaRThetaSun + betaMTheta)) / (betaRSun + betaM);',
      'vec3 LinMoonCoefficient = (moonE * (betaRThetaMoon + betaMThetaOfMoon)) / (betaRMoon + betaM);',
      'vec3 LinSun = pow(LinSunCoefficient * (1.0 - FexSun), vec3(1.5)) * mix(vec3(1.0),pow(LinSunCoefficient * FexSun, vec3(0.5)), linSunCoefficient2);',
      'vec3 LinMoon = pow(LinMoonCoefficient * (1.0 - FexMoon),vec3(1.5)) * mix(vec3(1.0),pow(LinMoonCoefficient * FexMoon,vec3(0.5)), linMoonCoefficient2);',

      '//Final lighting, duplicated above for coloring of sun',
      'return Lin + LinMoon;',
    '}',

    'vec4 getDirectLunarIntensity(uvCoords){',
      'vec4 baseMoonIntensity = texture2D(moonTexture, uvCoords);',

      '//Get the moon shadow using the normal map',
      '//Thank you, https://beesbuzz.biz/code/hsv_color_transforms.php!',
      'vec3 moonNormalMapRGB = texture2D(moonNormalMap, uvCoords).rgb;',
      'vec3 moonNormalMapInverted = vec3(moonNormalMapRGB.r, moonNormalMapRGB.g, 1.0 - moonNormalMapRGB.b);',
      'vec3 moonSurfaceNormal = normalize(1.0 - 2.0 * moonNormalMapInverted.rgb);',

      '//The moon is presumed to be a lambert shaded object, as per:',
      '//https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Diffuse_Reflection',
      'return vec4(moonColor.rgb * max(earthshine, dot(moonSurfaceNormal, moonTangentSpaceSunlight)), moonColor.a);',
    '}',

    '// Filmic ToneMapping http://filmicgames.com/archives/75',
    'const float A = 0.15;',
    'const float B = 0.50;',
    'const float C = 0.10;',
    'const float D = 0.20;',
    'const float E = 0.02;',
    'const float F = 0.30;',
    'const float W = 1000.0;',

    'vec3 Uncharted2Tonemap(vec3 x){',
      'return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;',
    '}',

    'vec4 applyToneMapping(vec4 outIntensity, vec3 L0){',
      'outIntensity *= 0.04;',
      'outIntensity += vec3(0.0,0.0003,0.00075);',

      'vec3 color = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*outIntensity) / Uncharted2Tonemap(vec3(W));',
      'return pow(abs(color),vec3(1.0/(1.2 * (1.0 + sunfade + moonfade))));',
    '}',

    'void main(){',
      'vec3 normalizedWorldPosition = normalize(vWorldPosition.xyz);',

      '// combined extinction factor',
      'vec3 FexSun = exp(-(betaRSun * sR + betaM * sM));',
      'vec3 FexMoon = exp(-(betaRMoon * sR + betaM * sM));',

      '//Get our night sky intensity',
      'vec3 L0 = vec3(0.1) * (FexSun + FexMoon);',

      '//Get the inscattered light from the sun or the moon',
      'vec4 outIntensity = getDirectInscatteredIntensity(normalizedWorldPosition, FexSun, FexMoon) + L0;',

      '//Get direct illumination from the moon',
      'outIntensity += getDirectLunarIntensity(gl_Position) * lunarLightDensity;',

      '//Apply tone mapping to the result',
    '	gl_FragColor = applyToneMapping(outIntensity, L0);',
    '}',
  ].join('\n')
});
