//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
var skyShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    rayleigh: {type: 'f', value: 0.0},
    rayleighCoefficientOfSun: {type: 'f', value: 0.0},
    rayleighCoefficientOfMoon: {type: 'f', value: 0.0},
    sunFade: {type: 'f', value: 0.0},
    moonFade: {type: 'f', value: 0.0},
    luminance: {type: 'f', value: 0.0},
    mieDirectionalG: {type: 'f', value: 0.0},
    moonE: {type: 'f', value: 0.0},
    sunE: {type: 'f', value: 0.0},
    linMoonCoefficient2: {type: 'f', value: 0.0},
    linSunCoefficient2: {type: 'f', value: 0.0},
    starsExposure: {type: 'f', value: 0.0},
    betaM: {type: 'v3',value: new THREE.Vector3()},
    sunXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    betaRSun: {type: 'v3', value: new THREE.Vector3()},
    betaRMoon: {type: 'v3', value: new THREE.Vector3()},
    moonTangentSpaceSunlight: {type: 'v3', value: new THREE.Vector3()},
    moonXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    uTime: {type: 'f', default: 0.005},
    latLong: {type: 'v2', value: new THREE.Vector2()},
    hourAngle: {type: 'f', value: 0.0},
    localSiderealTime: {type: 'f', value: 0.0},
    starMask: {type: 't', value: null},
    starRas: {type: 't', value: null},
    starDecs: {type: 't', value: null},
    starMags: {type: 't', value: null},
    starColors: {type: 't', value: null},
    bayerMatrix: {type: 't', value: null}
  },

  side: THREE.BackSide,
  blending: THREE.NormalBlending,
  transparent: false,

  vertexShader: [
    '#ifdef GL_ES',
    'precision mediump float;',
    'precision mediump int;',
    '#endif',

    'varying vec3 vWorldPosition;',
    'varying vec3 betaRPixel;',

    'uniform float rayleigh;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
      'vWorldPosition = worldPosition.xyz;',
      'vec3 normalizedWorldPosition = normalize(vWorldPosition);',

      'vec3 simplifiedRayleigh = vec3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);',
      'float pixelFade = 1.0 - clamp(1.0 - exp(normalizedWorldPosition.z), 0.0, 1.0);',
      'betaRPixel = simplifiedRayleigh * (rayleigh - (1.0 - pixelFade));',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}',
  ].join('\n'),

  fragmentShader: [
    '//',
    '//Many thanks to https://github.com/wwwtyro/glsl-atmosphere, which was useful in setting up my first GLSL project :D',
    '//',

    '#ifdef GL_ES',
    'precision mediump float;',
    'precision mediump int;',
    '#endif',

    '//Varyings',
    'varying vec3 vWorldPosition;',
    'varying vec3 betaRPixel;',

    '//Uniforms',
    'uniform float rayleigh;',
    'uniform float sunFade;',
    'uniform float moonFade;',
    'uniform float luminance;',
    'uniform float mieDirectionalG;',
    'uniform vec3 betaM;',
    'uniform vec3 sunXYZPosition;',
    'uniform vec3 betaRSun;',
    'uniform vec3 betaRMoon;',
    'uniform sampler2D moonTexture;',
    'uniform sampler2D moonNormalMap;',
    'uniform vec3 moonTangentSpaceSunlight;',
    'uniform vec3 moonXYZPosition;',
    'uniform float moonE;',
    'uniform float sunE;',
    'uniform float linMoonCoefficient2; //clamp(pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0,1.0)',
    'uniform float linSunCoefficient2; //clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0)',
    'uniform float starsExposure;',
    'uniform sampler2D bayerMatrix;',

    '//Constants',
    'const vec3 up = vec3(0.0, 1.0, 0.0);',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float piOver2 = 1.570796326794896619231321691639751442098584699687552910487;',
    'const float oneOverFourPi = 0.079577471545947667884441881686257181017229822870228224373;',
    'const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;',
    'const float pi = 3.141592653589793238462643383279502884197169;',
    'const float rayleighPhaseConst = 0.059683103659460750913331411264692885762922367152671168280;',
    'const float rayleighAtmosphereHeight = 8.4E3;',
    'const float mieAtmosphereHeight = 1.25E3;',
    'const float rad2Deg = 57.29577951308232087679815481410517033240547246656432154916;',
    'const float angularRadiusOfTheSun = 0.0245;',

    '//Time',
    'uniform float uTime;',

    '//Star Data (passed from our fragment shader)',
    'uniform sampler2D starMask;',
    'uniform sampler2D starRas;',
    'uniform sampler2D starDecs;',
    'uniform sampler2D starMags;',
    'uniform sampler2D starColors;',
    'const int starDataImgWidth = 512;',
    'const int starDataImgHeight = 256;',
    'const float starRadiusMagnitudeMultiplier = 0.01;',
    'const int starOffsetBorder = 5;',

    '//Earth data',
    'uniform vec2 latLong;',
    'uniform float localSiderealTime;',

    '//',
    '//UTIL FUNCTIONS',
    '//',

    '//Thanks to, https://github.com/msfeldstein/glsl-map/blob/master/index.glsl',
    'float map(float value, float inMin, float inMax, float outMin, float outMax) {',
      'return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);',
    '}',

    'int modulo(float a, float b){',
      'return int(a - (b * floor(a/b)));',
    '}',

    'float fModulo(float a, float b){',
      'return (a - (b * floor(a / b)));',
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

    '//From http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/',
    'float rand(float x){',
        'float a = 12.9898;',
        'float b = 78.233;',
        'float c = 43758.5453;',
        'float dt= dot(vec2(x, x) ,vec2(a,b));',
        'float sn= mod(dt,3.14);',
        'return fract(sin(sn) * c);',
    '}',

    '//This converts our local sky coordinates from azimuth and altitude',
    '//into ra and dec, which is useful for picking out stars',
    '//With a bit of help from https://mathematica.stackexchange.com/questions/69330/astronomy-transform-coordinates-from-horizon-to-equatorial',
    '//Updated with help from https://en.wikipedia.org/wiki/Celestial_coordinate_system',
    'vec2 getRaAndDec(float az, float alt){',
      'float declination = asin(sin(latLong.x) * sin(alt) - cos(latLong.x) * cos(alt) * cos(az));',
      'float hourAngle = atan(sin(az), (cos(az) * sin(latLong.x) + tan(alt) * cos(latLong.x)));',
      'float rightAscension = fModulo(localSiderealTime - hourAngle, piTimes2);',

      'return vec2(rightAscension, declination);',
    '}',

    'float getAltitude(float rightAscension, float declination){',
      '//Get the hour angle from the right ascension and declination of the star',
      'float hourAngle = fModulo(localSiderealTime - rightAscension, piTimes2);',

      '//Use this information to derive the altitude of the star',
      'return asin(sin(latLong.x) * sin(declination) + cos(latLong.x) * cos(declination) * cos(hourAngle));',
    '}',

    '//This is useful for converting our values from rgb colors into floats',
    'float rgba2Float(vec4 colorIn){',
      'vec4 colorIn255bits = floor(colorIn * 255.0);',

      'float floatSign = (step(0.5,  float(modulo(colorIn255bits.a, 2.0)) ) - 0.5) * 2.0;',
      'float floatExponential = float(((int(colorIn255bits.a)) / 2) - 64);',
      'float floatValue = floatSign * (colorIn255bits.r * 256.0 * 256.0 + colorIn255bits.g * 256.0 + colorIn255bits.b) * pow(10.0, floatExponential);',

      'return floatValue;',
    '}',

    '//This fellow is useful for the disks of the sun and the moon',
    '//and the glow of stars... It is fast and efficient at small angles',
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

    '//From The Book of Shaders :D',
    '//https://thebookofshaders.com/11/',
    'float noise(float x){',
      'float i = floor(x);',
      'float f = fract(x);',
      'float y = mix(rand(i), rand(i + 1.0), smoothstep(0.,1.,f));',

      'return y;',
    '}',

    'float brownianNoise(float lacunarity, float gain, float initialAmplitude, float initialFrequency, float timeInSeconds){',
      'float amplitude = initialAmplitude;',
      'float frequency = initialFrequency;',

      '// Loop of octaves',
      'float y = 0.0;',
      'float maxAmplitude = initialAmplitude;',
      'for (int i = 0; i < 5; i++) {',
      '	y += amplitude * noise(frequency * timeInSeconds);',
      '	frequency *= lacunarity;',
      '	amplitude *= gain;',
      '}',

      'return y;',
    '}',

    '//This whole method is one big exercise in ad hoc math for the fun of it.',
    '//const vec3 colorizeColor = vec3(0.265, 0.46875, 0.87890);',
    'const vec3 colorizeColor = vec3(0.21, 0.37, 0.50);',
    'const float twinkleDust = 0.002;',
    'vec3 drawStar(vec2 raAndDec, vec2 raAndDecOfStar, float magnitudeOfStar, vec3 starColor, float altitudeOfPixel){',
      '//float maxRadiusOfStar = 1.4 * (2.0/360.0) * piTimes2;',
      'float normalizedMagnitude = (1.0 - (magnitudeOfStar + 1.46) / 7.96) / 15.0;',

      '//Get the stars altitude',
      'float starAlt = getAltitude(raAndDecOfStar.x, raAndDecOfStar.y);',

      '//Determine brightness',
      'float brightnessVariation = 0.99 * pow((1.0 - starAlt / piOver2), 0.5);',
      'float brightneesRemainder = 1.0 - brightnessVariation;',
      'float randSeed = uTime * twinkleDust * (1.0 + rand(rand(raAndDecOfStar.x) + rand(raAndDecOfStar.y)));',

      '// float lacunarity= 0.8;',
      '// float gain = 0.55;',
      '// float initialAmplitude = 1.0;',
      '// float initialFrequency = 2.0;',
      '//lacunarity, gain, initialAmplitude, initialFrequency',
      'float brightnessCoeficient = brightneesRemainder + brightnessVariation * brownianNoise(0.8, 0.55, 1.0, 2.0, randSeed);',
      'float brightness = brightnessCoeficient * normalizedMagnitude * normalizedMagnitude;',

      '//Draw the star out from this data',
      '//distance from star over normalizing factor',
      'float distanceFromStar = haversineDistance(raAndDec.x, raAndDec.y, raAndDecOfStar.x, raAndDecOfStar.y) * 600.0;',
      'float oneOverDistanceSquared = 1.0 / (distanceFromStar * distanceFromStar);',
      '//Determine color',
      '// lacunarity= 0.8;',
      '// gain = 0.0;',
      '// initialAmplitude = 0.65;',
      '// initialFrequency = 1.0;',
      'float hue = brownianNoise(0.8, 0.0, 0.65, 1.0, randSeed);',
      'vec3 starColorVariation = vec3(hue, clamp(pow((1.0 - starAlt / piOver2), 3.0) / 2.0, 0.0, 0.2), 1.0);',
      'vec3 pixelColor = starColor;',
      'vec3 pixelHSV = rgb2hsv(pixelColor);',
      'pixelHSV.x = pixelHSV.x + starColorVariation.x;',
      'pixelHSV.y = clamp(pixelHSV.y + starColorVariation.x - 0.8, 0.0, 1.0);',
      'pixelColor = hsv2rgb(pixelHSV);',
      'vec3 coloredstarLight = 1200.0 * pixelColor * clamp(brightness * oneOverDistanceSquared, 0.0, brightness);',
      'float avgStarLightRGB = (coloredstarLight.x + coloredstarLight.y + coloredstarLight.z) / 3.0;',
      'vec3 colorize = avgStarLightRGB * colorizeColor / sqrt(dot(colorizeColor, colorizeColor));',
      'coloredstarLight = mix(coloredstarLight, colorize, 0.8);',

      'return coloredstarLight;',
    '}',

    '//',
    '//STARS',
    '//',
    'vec3 drawStarLayer(float azimuthOfPixel, float altitudeOfPixel){',
      'int padding = 5; //Should be the same as the value used to create our image in convert_stars_to_image.py',
      'int scanWidth = 2 * padding + 1;',
      'int paddingSquared = scanWidth * scanWidth;',

      '//Convert our ra and dec varying into pixel coordinates.',
      'vec2 raAndDecOfPixel = getRaAndDec(azimuthOfPixel, altitudeOfPixel);',
      'float pixelRa = raAndDecOfPixel.x;',
      'float pixelDec = raAndDecOfPixel.y;',

      'highp float activeImageWidth = float(starDataImgWidth - 2 * padding); //Should be 502',
      'highp float activeImageHeight = float(starDataImgHeight - 2 * padding); //Should be 246',
      'highp float normalizedRa = pixelRa / piTimes2;',
      'highp float normalizedDec = (pixelDec / pi) + 0.5;',

      '//We will include all texture components over a certain range so we might as well start at 0',
      'highp float startingPointX = activeImageWidth * normalizedRa;',
      'highp float startingPointY = activeImageHeight * normalizedDec;',

      '//Main draw loop',
      '//Dropping those last two calls is a big deal!',
      'vec3 returnColor = vec3(0.0);',
      'for(highp int i = 0; i <= 8; ++i){',
        'for(highp int j = 0; j <= 8; ++j){',
          'highp float xLoc = startingPointX + float(i);',
          'highp float yLoc = startingPointY + float(j);',

          '//Now, normalize these locations with respect to the width of the image',
          'highp vec2 searchPosition = vec2(xLoc / float(starDataImgWidth), yLoc / float(starDataImgHeight));',

          '//Hey! No texelfetch until web gl 2.0, screw my life O_o.',
          '//I also can not import textures that are multiples of 2, which is why we have so many textures',
          '//May anti-aliasing not make our life hell',
          'vec4 isStar = texture2D(starMask, searchPosition);',

          'if(isStar.r > 0.0){',
            '//If our value is red, we found a star. Get the values for this star',
            '//by converting our ras, decs, and intensities. The color should just be the color.',
            'vec4 starRaColor = texture2D(starRas, searchPosition);',
            'vec4 starDecColor = texture2D(starDecs, searchPosition);',
            'vec4 starMagColor = texture2D(starMags, searchPosition);',
            'vec3 starColor = texture2D(starColors, searchPosition).rgb;',

            '//Convert colors into final forms we desire',
            'float starRa = rgba2Float(starRaColor);',
            'float starDec = -1.0 * rgba2Float(starDecColor); //Not sure why this needs to be multiplied by a negative one.',
            'float magnitude = rgba2Float(starMagColor);',

            '//Go on and use this to create our color here.',
            '//returnColor = clipImageWithAveragedEdge(drawStar(vec2(pixelRa, pixelDec), vec2(starRa, starDec), magnitude, starColor, altitudeOfPixel), returnColor);',
            'vec3 starLight = drawStar(vec2(pixelRa, pixelDec), vec2(starRa, starDec), magnitude, starColor, altitudeOfPixel);',
            'returnColor = returnColor + starLight * starLight;',
          '}',
        '}',
      '}',

      'return returnColor;',
    '}',

    '//',
    '//SKY',
    '//',

    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',
    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',
    'vec2 rayleighPhase(vec2 cosTheta){',
      'return rayleighPhaseConst * (1.0 + cosTheta * cosTheta);',
    '}',

    'vec2 hgPhase(vec2 cosTheta){',
      'return oneOverFourPi * ((1.0 - mieDirectionalG * mieDirectionalG) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + (mieDirectionalG * mieDirectionalG), vec2(1.5)));',
    '}',

    'vec3 drawSkyLayer(vec2 cosTheta, vec3 FexSun, vec3 FexMoon){',
      'vec2 rPhase = rayleighPhase(vec2(0.5) * (vec2(1.0) + cosTheta));',
      'vec3 betaRThetaSun = betaRSun * rPhase.x;',
      'vec3 betaRThetaMoon = betaRMoon * rPhase.y;',

      '//Calculate the mie phase angles',
      'vec2 mPhase = hgPhase(cosTheta);',
      'vec3 betaMSun = betaM * mPhase.x;',
      'vec3 betaMMoon = betaM * mPhase.y;',

      'vec3 LinSunCoefficient = (sunE * (betaRThetaSun + betaMSun)) / (betaRSun + betaM);',
      'vec3 LinMoonCoefficient = (moonE * (betaRThetaMoon + betaMMoon)) / (betaRMoon + betaM);',
      'vec3 LinSun = pow(LinSunCoefficient * (1.0 - FexSun), vec3(1.5)) * mix(vec3(1.0),pow(LinSunCoefficient * FexSun, vec3(0.5)), linSunCoefficient2);',
      'vec3 LinMoon = pow(LinMoonCoefficient * (1.0 - FexMoon),vec3(1.5)) * mix(vec3(1.0),pow(LinMoonCoefficient * FexMoon,vec3(0.5)), linMoonCoefficient2);',

      '//Final lighting, duplicated above for coloring of sun',
      'return LinSun + LinMoon;',
    '}',

    '//',
    '//Tonemapping',
    '//',
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
    '//Draw main loop',
    '//',
    'void main(){',
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
      'vec3 FexPixel = exp(-(betaRPixel * sR + betaMTimesSM));',

      '//Get our night sky intensity',
      'vec3 L0 = 0.1 * FexMoon;',

      '//Even though everything else is behind the sky, we need this to decide the brightness of the colors returned below.',
      '//Also, whenever the sun falls below the horizon, everything explodes in the original code.',
      '//Thus, I have taken the liberty of killing the sky when that happens to avoid explody code.',
      'vec2 cosTheta = vec2(dot(normalizedWorldPosition, sunXYZPosition), dot(normalizedWorldPosition, moonXYZPosition));',
      'vec3 skyColor = applyToneMapping(drawSkyLayer(cosTheta, FexSun, FexMoon) + L0, L0);',

      '//Apply dithering via the Bayer Matrix',
      '//Thanks to http://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/',
      'skyColor += vec3(texture2D(bayerMatrix, gl_FragCoord.xy / 8.0).r / 32.0 - (1.0 / 128.0));',

      'vec3 skyColorSquared = (drawStarLayer(azimuth, altitude) * FexPixel) * starsExposure + skyColor * skyColor;',

      'gl_FragColor = vec4(clamp(sqrt(skyColorSquared), 0.0, 1.0), 1.0);',
    '}',
  ].join('\n')
});

skyShaderMaterial.clipping = true;
skyShaderMaterial.flatShading = true;
