//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
var moonShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    rayleighCoefficientOfSun: {type: 'f', value: 0.0},
    rayleighCoefficientOfMoon: {type: 'f',value: 0.0},
    sunFade: {type: 'f',value: 0.0},
    moonFade: {type: 'f',value: 0.0},
    luminance: {type: 'f',value: 0.0},
    mieDirectionalG: {type: 'f',value: 0.0},
    moonE: {type: 'f',value: 0.0},
    earthshineE: {type: 'f', value: 0.0},
    sunE: {type: 'f',value: 0.0},
    linMoonCoefficient2: {type: 'f',value: 0.0},
    linSunCoefficient2: {type: 'f',value: 0.0},
    moonExposure: {type: 'f', value: 0.0},
    azimuthEarthsShadow: {type: 'f', value: 0.0},
    altitudeEarthsShadow: {type: 'f', value: 0.0},
    distanceToEarthsShadow: {type: 'f', value: 0.0},
    normalizedLunarDiameter: {type: 'f', value: 0.0},
    betaM: {type: 'v3',value: new THREE.Vector3()},
    sunXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    betaRSun: {type: 'v3', value: new THREE.Vector3()},
    betaRMoon: {type: 'v3', value: new THREE.Vector3()},
    moonTangentSpaceSunlight: {type: 'v3', value: new THREE.Vector3()},
    moonXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    moonLightColor: {type: 'v3', value: new THREE.Vector3()},
    moonTexture: {type: 't', value: null},
    moonNormalMap: {type: 't', value: null},
    bayerMatrix: {type: 't', value: null}
  },

  transparent: true,
  lights: false,
  flatShading: true,
  clipping: true,

  vertexShader: [
    '#ifdef GL_ES',
    'precision mediump float;',
    'precision mediump int;',
    '#endif',

    'varying vec3 vWorldPosition;',
    'varying vec2 vUv;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = worldPosition.xyz;',
      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      'gl_Position.z -= 0.02;',
    '}',
  ].join('\n'),

  fragmentShader: [
    '#ifdef GL_ES',
    'precision mediump float;',
    'precision mediump int;',
    '#endif',

    '//Varyings',
    'varying vec3 vWorldPosition;',
    'varying vec2 vUv;',

    '//Uniforms',
    'uniform float sunFade;',
    'uniform float moonFade;',
    'uniform float luminance;',
    'uniform float mieDirectionalG;',
    'uniform vec3 betaM;',
    'uniform vec3 betaRSun;',
    'uniform vec3 betaRMoon;',
    'uniform sampler2D moonTexture;',
    'uniform sampler2D moonNormalMap;',
    'uniform vec3 moonTangentSpaceSunlight;',
    'uniform vec3 sunXYZPosition;',
    'uniform vec3 moonXYZPosition;',
    'uniform vec3 moonLightColor;',
    'uniform float azimuthEarthsShadow;',
    'uniform float altitudeEarthsShadow;',
    'uniform float distanceToEarthsShadow;',
    'uniform float normalizedLunarDiameter;',
    'uniform float moonE;',
    'uniform float sunE;',
    'uniform float earthshineE;',
    'uniform float linMoonCoefficient2; //clamp(pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0,1.0)',
    'uniform float linSunCoefficient2; //clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0)',
    'uniform float moonExposure;',
    'uniform sampler2D bayerMatrix;',

    '//Constants',
    'const vec3 up = vec3(0.0, 1.0, 0.0);',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float pi = 3.141592653589793238462643383279502884197169;',
    'const float piOver2 = 1.570796326794896619231321691639751442098584699687552910487;',
    'const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;',
    'const float oneOverFourPi = 0.079577471545947667884441881686257181017229822870228224373;',
    'const float rayleighPhaseConst = 0.059683103659460750913331411264692885762922367152671168280;',
    'const float rayleighAtmosphereHeight = 8.4E3;',
    'const float mieAtmosphereHeight = 1.25E3;',
    'const float rad2Deg = 57.29577951308232087679815481410517033240547246656432154916;',

    '//I decided to go with a slightly more bluish earthshine as I have seen them get pretty',
    '//blue overall.',
    'const vec3 earthshineColor = vec3(0.65,0.86,1.00);',

    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',
    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',
    'vec2 rayleighPhase(vec2 cosTheta){',
      'return rayleighPhaseConst * (1.0 + cosTheta * cosTheta);',
    '}',

    'vec2 hgPhase(vec2 cosTheta){',
      'return oneOverFourPi * ((1.0 - mieDirectionalG * mieDirectionalG) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + (mieDirectionalG * mieDirectionalG), vec2(1.5)));',
    '}',

    'vec3 getDirectInscatteredIntensity(vec3 normalizedWorldPosition, vec3 FexSun, vec3 FexMoon){',
      '//Cos theta of sun and moon',
      'vec2 cosTheta = vec2(dot(normalizedWorldPosition, sunXYZPosition), dot(normalizedWorldPosition, moonXYZPosition));',
      'vec2 rPhase = rayleighPhase(vec2(0.5) * (vec2(1.0) + cosTheta));',
      'vec3 betaRThetaSun = betaRSun * rPhase.x;',
      'vec3 betaRThetaMoon = betaRMoon * rPhase.y;',

      '//Calculate the mie phase angles',
      'vec2 mPhase = hgPhase(cosTheta);',
      'vec3 betaMSun = betaM * mPhase.x;',
      'vec3 betaMMoon = betaM * mPhase.y;',

      'vec3 LinSunCoefficient = (sunE * (betaRThetaSun + betaMSun)) / (betaRSun + betaM);',
      'vec3 LinMoonCoefficient = moonLightColor * (moonE * (betaRThetaMoon + betaMMoon)) / (betaRMoon + betaM);',
      'vec3 LinSun = pow(LinSunCoefficient * (1.0 - FexSun), vec3(1.5)) * mix(vec3(1.0),pow(LinSunCoefficient * FexSun, vec3(0.5)), linSunCoefficient2);',
      'vec3 LinMoon = pow(LinMoonCoefficient * (1.0 - FexMoon),vec3(1.5)) * mix(vec3(1.0),pow(LinMoonCoefficient * FexMoon,vec3(0.5)), linMoonCoefficient2);',

      '//Final lighting, duplicated above for coloring of sun',
      'return LinSun + LinMoon;',
    '}',

    'float haversineDistance(float az_0, float alt_0, float az_1, float alt_1){',
      '//There is a chance that our compliment (say moon at az_0 at 0 degree and az_2 at 364.99)',
      '//Results in an inaccurately large angle, thus we must check the compliment in addition to',
      '//our regular diff.',
      'float deltaAZ = az_0 - az_1;',
      'float compliment = -1.0 * max(piTimes2 - abs(deltaAZ), 0.0) * sign(deltaAZ);',
      'deltaAZ = abs(deltaAZ) < abs(compliment) ? deltaAZ : compliment;',

      '//Luckily we don not need to worry about this compliment stuff here because alt only goes between -pi and pi',
      'float deltaAlt = alt_1 - alt_0;',

      'float sinOfDeltaAzOver2 = sin(deltaAZ / 2.0);',
      'float sinOfDeltaAltOver2 = sin(deltaAlt / 2.0);',

      '//Presuming that most of our angular objects are small, we will simply use',
      '//this simple approximation... http://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/',
      'return 2.0 * asin(sqrt(sinOfDeltaAltOver2 * sinOfDeltaAltOver2 + cos(alt_0) * cos(alt_1) * sinOfDeltaAzOver2 * sinOfDeltaAzOver2));',
    '}',

    '//From http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl',
    '//Via: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl',
    'vec3 hsv2rgb(vec3 c)',
    '{',
        'vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',
        'vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',
        'return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',
    '}',

    '//From https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl',
    'vec3 rgb2hsv(vec3 c){',
      'vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);',
      'vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));',
      'vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));',

      'float d = q.x - min(q.w, q.y);',
      'float e = 1.0e-10;',
      'return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);',
    '}',

    'vec3 getLunarEcclipseShadow(float azimuthOfPixel, float altitudeOfPixel){',
      '//Determine the distance from this pixel to the center of the sun.',
      'float haversineDistanceToPixel = haversineDistance(azimuthOfPixel, altitudeOfPixel, azimuthEarthsShadow, altitudeEarthsShadow);',
      'float pixelToCenterDistanceInMoonDiameter = haversineDistanceToPixel / normalizedLunarDiameter;',
      'float umbDistSq = pixelToCenterDistanceInMoonDiameter * pixelToCenterDistanceInMoonDiameter;',
      'float pUmbDistSq = umbDistSq / 4.0;',
      'float umbraBrightness = 0.15 + 0.85 * clamp(umbDistSq, 0.0, 1.0);',
      'float penumbraBrightness = 0.5 + 0.5 * clamp(pUmbDistSq, 0.0, 1.0);',
      'float totalBrightness = clamp(min(umbraBrightness, penumbraBrightness), 0.0, 1.0);',

      '//Get color intensity based on distance from penumbra',
      'vec3 colorOfLunarEcclipse = vec3(1.0, 0.45, 0.05);',
      '// float centerToCenterDistanceInMoons = clamp(distanceToEarthsShadow/normalizedLunarDiameter, 0.0, 1.0);',
      'float colorIntensity = clamp((distanceToEarthsShadow * distanceToEarthsShadow) / (normalizedLunarDiameter * normalizedLunarDiameter), 0.0, 1.0);',
      '// float colorIntensityFactor2 = clamp(pixelToCenterDistanceInMoonDiameter / (0.5 * normalizedLunarDiameter), 0.0, 1.0);',
      'colorOfLunarEcclipse = clamp(colorOfLunarEcclipse + (1.0 - colorOfLunarEcclipse) * colorIntensity, 0.0, 1.0);',
      '//colorOfLunarEcclipse = (1.0 - colorOfLunarEcclipse) * clamp(distanceToEarthsShadow / (1.5 * normalizedLunarDiameter), 0.0, 1.0);',

      'return totalBrightness * colorOfLunarEcclipse;',
    '}',

    'vec3 getDirectLunarIntensity(vec3 moonTextureColor, vec2 uvCoords, vec3 earthShadow){',
      'vec3 baseMoonIntensity = moonTextureColor;',

      '//Get the moon shadow using the normal map',
      '//Thank you, https://beesbuzz.biz/code/hsv_color_transforms.php!',
      'vec3 moonNormalMapRGB = texture2D(moonNormalMap, uvCoords).rgb;',
      'vec3 moonNormalMapInverted = vec3(moonNormalMapRGB.r, 1.0 - moonNormalMapRGB.g, moonNormalMapRGB.b);',
      'vec3 moonSurfaceNormal = normalize(2.0 * moonNormalMapInverted - 1.0);',

      '//The moon is presumed to be a lambert shaded object, as per:',
      '//https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Diffuse_Reflection',
      'float normalLighting = clamp(dot(moonSurfaceNormal, moonTangentSpaceSunlight), 0.0, 1.0);',
      'return vec3(clamp(earthshineE * earthshineColor + normalLighting * earthShadow, 0.0, 1.0) * baseMoonIntensity);',
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

    'void main(){',
      '//Get our lunar texture first in order to discard unwanted pixels',
      'vec4 moonTextureColor = texture2D(moonTexture, vUv);',
      'if (moonTextureColor.a < 0.05){',
          'discard;',
      '}',

      '//Get our position in the sky',
      'vec3 normalizedWorldPosition = normalize(vWorldPosition.xyz);',
      'float altitude = piOver2 - acos(normalizedWorldPosition.y);',
      'float azimuth = atan(normalizedWorldPosition.z, normalizedWorldPosition.x) + pi;',

      '// Get the current optical length',
      '// cutoff angle at 90 to avoid singularity in next formula.',
      '//presuming here that the dot of the sun direction and up is also cos(zenith angle)',
      'float cosOfZenithAngleOfCamera = max(0.0, dot(up, normalizedWorldPosition));',
      'float zenithAngleOfCamera = acos(cosOfZenithAngleOfCamera);',
      'float inverseSDenominator = 1.0 / (cosOfZenithAngleOfCamera + 0.15 * pow(93.885 - (zenithAngleOfCamera * rad2Deg), -1.253));',
      'float sR = rayleighAtmosphereHeight * inverseSDenominator;',
      'float sM = mieAtmosphereHeight * inverseSDenominator;',

      '// combined extinction factor',
      'vec3 betaMTimesSM = betaM * sM;',
      'vec3 FexSun = exp(-(betaRSun * sR + betaMTimesSM));',
      'vec3 FexMoon = exp(-(betaRMoon * sR + betaMTimesSM));',

      '//Get our night sky intensity',
      'vec3 L0 = 0.1 * FexMoon;',

      '//Get the inscattered light from the sun or the moon',
      'vec3 outIntensity = applyToneMapping(getDirectInscatteredIntensity(normalizedWorldPosition, FexSun, FexMoon) + L0, L0);',

      '//Apply dithering via the Bayer Matrix',
      '//Thanks to http://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/',
      'outIntensity += vec3(texture2D(bayerMatrix, gl_FragCoord.xy / 8.0).r / 32.0 - (1.0 / 128.0));',

      '//Get direct illumination from the moon',
      'vec3 earthShadow = getLunarEcclipseShadow(azimuth, altitude);',
      'vec3 lunarDirectLight = getDirectLunarIntensity(moonTextureColor.rgb, vUv, earthShadow);',
      'vec3 lunarColor = 1.5 * FexMoon * lunarDirectLight * moonExposure;',
      'outIntensity = clamp(sqrt(outIntensity * outIntensity + lunarColor * lunarColor), 0.0, 1.0);',

      '//Apply tone mapping to the result',
    '	gl_FragColor = vec4(outIntensity, moonTextureColor.a);',
    '}',
  ].join('\n')
});
