//
//Thank you Andrea! :D
//
var cloner = (function (O) {'use strict';

  // (C) Andrea Giammarchi - Mit Style

  var

    // constants
    VALUE   = 'value',
    PROTO   = '__proto__', // to avoid jshint complains

    // shortcuts
    isArray = Array.isArray,
    create  = O.create,
    dP      = O.defineProperty,
    dPs     = O.defineProperties,
    gOPD    = O.getOwnPropertyDescriptor,
    gOPN    = O.getOwnPropertyNames,
    gOPS    = O.getOwnPropertySymbols ||
              function (o) { return Array.prototype; },
    gPO     = O.getPrototypeOf ||
              function (o) { return o[PROTO]; },
    hOP     = O.prototype.hasOwnProperty,
    oKs     = (typeof Reflect !== typeof oK) &&
              Reflect.ownKeys ||
              function (o) { return gOPS(o).concat(gOPN(o)); },
    set     = function (descriptors, key, descriptor) {
      if (key in descriptors) dP(descriptors, key, {
        configurable: true,
        enumerable: true,
        value: descriptor
      });
      else descriptors[key] = descriptor;
    },

    // used to avoid recursions in deep copy
    index   = -1,
    known   = null,
    blown   = null,
    clean   = function () { known = blown = null; },

    // utilities
    New = function (source, descriptors) {
      var out = isArray(source) ? [] : create(gPO(source));
      return descriptors ? Object.defineProperties(out, descriptors) : out;
    },

    // deep copy and merge
    deepCopy = function deepCopy(source) {
      var result = New(source);
      known = [source];
      blown = [result];
      deepDefine(result, source);
      clean();
      return result;
    },
    deepMerge = function (target) {
      known = [];
      blown = [];
      for (var i = 1; i < arguments.length; i++) {
        known[i - 1] = arguments[i];
        blown[i - 1] = target;
      }
      merge.apply(true, arguments);
      clean();
      return target;
    },

    // shallow copy and merge
    shallowCopy = function shallowCopy(source) {
      clean();
      for (var
        key,
        descriptors = {},
        keys = oKs(source),
        i = keys.length; i--;
        set(descriptors, key, gOPD(source, key))
      ) key = keys[i];
      return New(source, descriptors);
    },
    shallowMerge = function () {
      clean();
      return merge.apply(false, arguments);
    },

    // internal methods
    isObject = function isObject(value) {
      /*jshint eqnull: true */
      return value != null && typeof value === 'object';
    },
    shouldCopy = function shouldCopy(value) {
      /*jshint eqnull: true */
      index = -1;
      if (isObject(value)) {
        if (known == null) return true;
        index = known.indexOf(value);
        if (index < 0) return 0 < known.push(value);
      }
      return false;
    },
    deepDefine = function deepDefine(target, source) {
      for (var
        key, descriptor,
        descriptors = {},
        keys = oKs(source),
        i = keys.length; i--;
      ) {
        key = keys[i];
        descriptor = gOPD(source, key);
        if (VALUE in descriptor) deepValue(descriptor);
        set(descriptors, key, descriptor);
      }
      dPs(target, descriptors);
    },
    deepValue = function deepValue(descriptor) {
      var value = descriptor[VALUE];
      if (shouldCopy(value)) {
        descriptor[VALUE] = New(value);
        deepDefine(descriptor[VALUE], value);
        blown[known.indexOf(value)] = descriptor[VALUE];
      } else if (-1 < index && index in blown) {
        descriptor[VALUE] = blown[index];
      }
    },
    merge = function merge(target) {
      for (var
        source,
        keys, key,
        value, tvalue,
        descriptor,
        deep = this.valueOf(),
        descriptors = {},
        i, a = 1;
        a < arguments.length; a++
      ) {
        source = arguments[a];
        keys = oKs(source);
        for (i = 0; i < keys.length; i++) {
          key = keys[i];
          descriptor = gOPD(source, key);
          if (hOP.call(target, key)) {
            if (VALUE in descriptor) {
              value = descriptor[VALUE];
              if (shouldCopy(value)) {
                descriptor = gOPD(target, key);
                if (VALUE in descriptor) {
                  tvalue = descriptor[VALUE];
                  if (isObject(tvalue)) {
                    merge.call(deep, tvalue, value);
                  }
                }
              }
            }
          } else {
            if (deep && VALUE in descriptor) {
              deepValue(descriptor);
            }
          }
          set(descriptors, key, descriptor);
        }
      }
      return dPs(target, descriptors);
    }
  ;

  return {
    deep: {
      copy: deepCopy,
      merge: deepMerge
    },
    shallow: {
      copy: shallowCopy,
      merge: shallowMerge
    }
  };

}(Object));

//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
AFRAME.registerShader('sky', {
  schema: {
    uTime: {type: 'number', default: 0.005, min: 0, max: 0.1, is: 'uniform' },
    luminance: { type: 'number', default: 1, max: 0, min: 2, is: 'uniform' },
    turbidity: { type: 'number', default: 2, max: 0, min: 20, is: 'uniform' },
    reileigh: { type: 'number', default: 1, max: 0, min: 4, is: 'uniform' },
    mieCoefficient: { type: 'number', default: 0.005, min: 0, max: 0.1, is: 'uniform' },
    mieDirectionalG: { type: 'number', default: 0.8, min: 0, max: 1, is: 'uniform' },
    sunPosition: { type: 'vec2', default: {x: 0.0,y: 0.0}, is: 'uniform' },
    moonTexture: {type: 'map', src:'../images/moon-dif-512.png', is: 'uniform'},
    moonNormalMap: {type: 'map', src:'../images/moon-nor-512.png', is: 'uniform'},
    moonTangentSpaceSunlight: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    moonPosition: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    moonTangent: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    moonBitangent: {type: 'vec3', default: {x: 0.0, y: 0.0, z: 0.0}, is: 'uniform'},
    moonAzimuthAndAltitude: {type: 'vec2', default: {x: 0.0, y: 0.0}, is: 'uniform'},
    moonEE: {type: 'number', default: 100.0, is: 'uniform'},
    starMask: {type: 'map', src:'../images/padded-starry-sub-data-0.png', is: 'uniform'},
    starRas: {type: 'map', src:'../images/padded-starry-sub-data-1.png', is: 'uniform'},
    starDecs: {type: 'map', src:'../images/padded-starry-sub-data-2.png', is: 'uniform'},
    starMags: {type: 'map', src:'../images/padded-starry-sub-data-3.png', is: 'uniform'},
    starColors: {type: 'map', src:'../images/padded-starry-sub-data-4.png', is: 'uniform'},
    latLong: {type: 'vec2', default:{x: 0.0, y: 0.0}, is: 'uniform'},
    hourAngle: {type: 'number', default: 0.0, is: 'uniform'},
    localSiderealTime: {type: 'number', default: 0.0, is: 'uniform'},
    u_resolution: {type: 'vec2', default: {x: 1280, y: 720}, is: 'uniform'}
  },

  vertexShader: [
    'varying vec3 vWorldPosition;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
      'vWorldPosition = worldPosition.xyz;',

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

    '//Time',
    'uniform float uTime;',

    '//Camera data',
    'varying vec3 vWorldPosition;',
    'uniform vec2 u_resolution;',

    '//Status of the sky',
    'uniform float luminance;',
    'uniform float turbidity;',
    'uniform float reileigh;',
    'uniform float mieCoefficient;',
    'uniform float mieDirectionalG;',

    'const float n = 1.0003; // refractive index of air',
    'const float N = 2.545E25; // number of molecules per unit volume for air at',
    '// 288.15K and 1013mb (sea level -45 celsius)',
    'const float pn = 0.035;  // depolatization factor for standard air',

    '// mie stuff',
    '// K coefficient for the primaries',
    'const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);',
    'const vec3 K = vec3(0.686, 0.678, 0.666);',
    'const float v = 4.0;',

    '// optical length at zenith for molecules',
    'const float rayleighZenithLength = 8.4E3;',
    'const float mieZenithLength = 1.25E3;',
    'const vec3 up = vec3(0.0, 1.0, 0.0);',

    'const float sunEE = 1360.0;',
    '//This varies with the phase of the moon',
    '//const float moonEE',

    '// mathematical constants',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float pi = 3.141592653589793238462643383279502884197169;',
    'const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;',
    'const float piOver2 = 1.570796326794896619231321691639751442098584699687552910487;',
    'const float deg2Rad = 0.017453292519943295769236907684886127134428718885417254560;',

    '//More sky stuff that happens to need pi',
    '// earth shadow hack',
    'const float cutoffAngle = pi/1.95;',
    'const float steepness = 1.5;',

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

    '//Sun Data',
    'uniform mediump vec2 sunPosition;',
    'const float angularRadiusOfTheSun = 0.0245; //Real Values',
    '//const float angularRadiusOfTheSun = 0.054; //FakeyValues',

    '//Sky Surface data',
    'varying vec3 normal;',
    'varying vec2 binormal;',

    '//Moon Data',
    'uniform float moonEE;',
    'uniform sampler2D moonTexture;',
    'uniform sampler2D moonNormalMap;',
    'uniform vec2 moonAzimuthAndAltitude;',
    'uniform vec3 moonTangentSpaceSunlight;',
    'uniform vec3 moonPosition;',
    'uniform vec3 moonTangent;',
    'uniform vec3 moonBitangent;',
    'const float angularRadiusOfTheMoon = 0.024;',
    '//const float angularRadiusOfTheMoon = 0.055; //Fakey Values',
    'const float earthshine = 0.02;',

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

    'vec3 rgb2Linear(vec3 rgbColor){',
      'return pow(rgbColor, vec3(2.2));',
    '}',

    'vec3 linear2Rgb(vec3 linearColor){',
      'return pow(linearColor, vec3(0.454545454545454545));',
    '}',

    '//From http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl',
    '//Via: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl',
    'vec3 hsv2rgb(vec3 c)',
    '{',
        'vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',
        'vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',
        'return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',
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
    'vec3 haversineDistance(float az_0, float alt_0, float az_1, float alt_1){',
      '//There is a chance that our compliment (say moon at az_0 at 0 degree and az_2 at 364.99)',
      '//Results in an inaccurately large angle, thus we must check the compliment in addition to',
      '//our regular diff.',
      'float deltaAZ = az_0 - az_1;',
      'float compliment = -1.0 * max(2.0 * pi - abs(deltaAZ), 0.0) * sign(deltaAZ);',
      'deltaAZ = abs(deltaAZ) < abs(compliment) ? deltaAZ : compliment;',

      '//Luckily we don not need to worry about this compliment stuff here because alt only goes between -pi and pi',
      'float deltaAlt = alt_1 - alt_0;',

      'float sinOfDeltaAzOver2 = sin(deltaAZ / 2.0);',
      'float sinOfDeltaAltOver2 = sin(deltaAlt / 2.0);',

      'float haversineDistance = 2.0 * asin(sqrt(sinOfDeltaAltOver2 * sinOfDeltaAltOver2 + cos(alt_0) * cos(alt_1) * sinOfDeltaAzOver2 * sinOfDeltaAzOver2));',

      '//Presuming that most of our angular objects are small, we will simply use',
      '//this simple approximation... http://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/',
      'return vec3(deltaAZ, deltaAlt, haversineDistance);',
    '}',

    '//This function combines our colors so that different layers can exist at the right locations',
    'vec4 clipImageWithAveragedEdge(vec4 imageColor, vec4 backgroundColor){',
      'return imageColor.a > 0.95 ? vec4(imageColor.rgb, 1.0) : vec4(mix(imageColor.xyz, backgroundColor.xyz, (1.0 - imageColor.w)), 1.0);',
    '}',

    'vec4 mixSunLayer(vec4 sun, vec4 stars){',
      'if(sqrt(clamp(dot(sun.xyz, sun.xyz)/3.0, 0.0, 1.0)) > 0.9){',
        '//Note to self, replace sun by giant glowing orb',
        'return vec4(sun.rgb, 1.0);',
      '}',
      'return stars;',
    '}',

    'struct skyWithAndWithoutStars{',
      'vec4 starLayer;',
      'vec4 starlessLayer;',
    '};',

    'skyWithAndWithoutStars starLayerBlending(vec4 starColor, vec4 skyColor, float sunE){',
      '//The magnitude of the stars is dimmed according to the current brightness',
      '//but we now wish to keep the sky color the same',
      'vec4 starlessLight = skyColor;',
      'vec4 combinedLight = vec4(linear2Rgb(rgb2Linear(starColor.rgb) * (1.0 - clamp(sunE / 150.0, 0.0, 1.0)) + rgb2Linear(skyColor.rgb)), 1.0);',

      'return skyWithAndWithoutStars(combinedLight, starlessLight);',
    '}',

    'vec4 moonLayerBlending(vec4 moonColor, vec4 skyColor, vec4 inColor){',
      'vec3 combinedLight = clamp(linear2Rgb(rgb2Linear(moonColor.rgb) + rgb2Linear(skyColor.rgb)), 0.0, 1.0);',

      'return vec4(mix(combinedLight.rgb, inColor.xyz, (1.0 - moonColor.a)), 1.0);',
    '}',

    'struct skyparams{',
      'float cosTheta;',
      'float cosThetaMoon;',
      'vec3 Fex;',
      'vec3 FexMoon;',
      'float sunE;',
      'float moonE;',
      'vec3 Lin;',
      'vec3 LinMoon;',
      'float sunfade;',
      'float moonfade;',
      'vec4 skyColor;',
    '};',

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

    'vec4 drawStar(vec2 raAndDec, vec2 raAndDecOfStar, float magnitudeOfStar, vec3 starColor, float altitudeOfPixel){',
      '//float maxRadiusOfStar = 1.4 * (2.0/360.0) * piTimes2;',
      'const float maxRadiusOfStar = 0.0488692191;',
      'float normalizedMagnitude = (1.0 - (magnitudeOfStar + 1.46) / 7.96);',
      'float radiusOfStar = clamp(maxRadiusOfStar * normalizedMagnitude, 0.0, maxRadiusOfStar);',

      '//Get the stars altitude',
      'float starAlt = getAltitude(raAndDecOfStar.x, raAndDecOfStar.y);',

      '//Determine brightness',
      'float brightnessVariation = 0.99 * pow((1.0 - starAlt / piOver2), 0.5);',
      'float brightneesRemainder = 1.0 - brightnessVariation;',
      'float twinkleDust = 0.002;',
      'float randSeed = uTime * twinkleDust * (1.0 + rand(rand(raAndDecOfStar.x) + rand(raAndDecOfStar.y)));',

      'float lacunarity= 0.8;',
      'float gain = 0.55;',
      'float initialAmplitude = 1.0;',
      'float initialFrequency = 2.0;',
      'float randomness = brightneesRemainder + brightnessVariation * brownianNoise(lacunarity, gain, initialAmplitude, initialFrequency, randSeed);',
      'radiusOfStar = radiusOfStar * randomness;',

      '//Draw the star out from this data',
      'vec3 positionData = haversineDistance(raAndDec.x, raAndDec.y, raAndDecOfStar.x, raAndDecOfStar.y);',
      'vec4 returnColor = vec4(0.0);',
      'if(positionData.z < radiusOfStar){',
        '//Determine color',
        'lacunarity= 0.8;',
        'gain = 0.5;',
        'initialAmplitude = 1.0;',
        'initialFrequency = 0.5;',
        'float hue = brownianNoise(lacunarity, gain, initialAmplitude, initialFrequency, randSeed);',
        'float lightness = exp(12.0 * ((radiusOfStar - positionData.z)/radiusOfStar)) / exp(12.0);',
        'vec3 colorOfSky = vec3(0.1, 0.2, 1.0);',
        'vec3 starColorVariation = hsv2rgb(vec3(hue, clamp(pow((1.0 - starAlt / piOver2), 3.0) / 2.0, 0.0, 0.2), 1.0));',
        '//vec3 colorOfPixel = mix(mix(starColorVariation, colorOfSky, (radiusOfStar - positionData.z)/(1.2 * radiusOfStar)), vec3(1.0), lightness);',
        'vec3 colorOfPixel = mix(mix(starColor, colorOfSky, (radiusOfStar - positionData.z)/(1.2 * radiusOfStar)), starColorVariation, lightness);',
        'returnColor = vec4(colorOfPixel, lightness);',
      '}',

      'return returnColor;',
    '}',

    '//',
    '//STARS',
    '//',
    'vec4 drawStarLayer(float azimuthOfPixel, float altitudeOfPixel, vec4 skyColor){',
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
      'highp float normalizedDec = (pixelDec + piOver2) / pi;',

      '//We will include all texture components over a certain range so we might as well start at 0',
      'highp float startingPointX = activeImageWidth * normalizedRa;',
      'highp float startingPointY = activeImageHeight * normalizedDec;',

      '//Main draw loop',
      '//Dropping those last two calls is a big deal!',
      'vec4 returnColor = vec4(skyColor);',
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
            'returnColor = clipImageWithAveragedEdge(drawStar(vec2(pixelRa, pixelDec), vec2(starRa, starDec), magnitude, starColor, altitudeOfPixel), returnColor);',
          '}',
        '}',
      '}',

      'return returnColor;',
    '}',

    '//',
    '//SKY',
    '//',

    'vec3 totalRayleigh(vec3 lambda){',
      'return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));',
    '}',

    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',
    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',
    'vec3 simplifiedRayleigh(){',
      'return 0.0005 / vec3(94, 40, 18);',
    '}',

    'float rayleighPhase(float cosTheta){',
      '//TODO: According to, http://amd-dev.wpengine.netdna-cdn.com/wordpress/media/2012/10/ATI-LightScattering.pdf',
      '//There should also be a Reileigh Coeficient in this equation - it is set to 1 here.',
      'float reigleighCoefficient = 1.0;',
      'return (3.0 / (16.0*pi)) * reigleighCoefficient * (1.0 + pow(cosTheta, 2.0));',
    '}',

    'vec3 totalMie(vec3 lambda, vec3 K, float T){',
      'float c = (0.2 * T ) * 10E-18;',
      'return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;',
    '}',

    'float hgPhase(float cosTheta, float g){',
      'return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));',
    '}',

    'float lightIntensity(float zenithAngleCos, float EE){',
      'return EE * max(0.0, 1.0 - exp(-((cutoffAngle - acos(zenithAngleCos))/steepness)));',
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

    '//',
    '//MOON',
    '//',
    'vec4 drawMoonLayer(float azimuthOfPixel, float altitudeOfPixel, skyparams skyParams){',
      '//calculate the location of this pixels on the unit sphere',
      'float zenithOfPixel = piOver2 - altitudeOfPixel;',
      'float pixelX = sin(zenithOfPixel) * cos(azimuthOfPixel);',
      'float pixelY = sin(zenithOfPixel) * sin(azimuthOfPixel);',
      'float pixelZ = cos(zenithOfPixel);',
      'vec3 pixelPos = vec3(pixelX, pixelY, pixelZ);',

      '//Get the vector between the moons center and this pixels',
      'vec3 vectorBetweenPixelAndMoon = pixelPos - moonPosition;',

      '//Now dot this with the tangent and bitangent vectors to get our location.',
      'float deltaX = dot(vectorBetweenPixelAndMoon, moonTangent);',
      'float deltaY = dot(vectorBetweenPixelAndMoon, moonBitangent);',
      'float angleOfPixel = atan(deltaX, deltaY);',

      '//And finally, get the magnitude of the vector so that we can calculate the x and y positio',
      '//below...',
      'float radiusOfDistanceBetweenPixelAndMoon = length(vectorBetweenPixelAndMoon);',

      'vec4 returnColor = vec4(0.0);',
      'if(radiusOfDistanceBetweenPixelAndMoon < angularRadiusOfTheMoon){',
        '//Hey! We are in the moon! convert our distance into a linear interpolation',
        '//of half pixel radius on our sampler',
        'float xPosition = (1.0 + (radiusOfDistanceBetweenPixelAndMoon / angularRadiusOfTheMoon) * sin(angleOfPixel)) / 2.0;',
        'float yPosition = (1.0 + (radiusOfDistanceBetweenPixelAndMoon  / angularRadiusOfTheMoon) * cos(angleOfPixel)) / 2.0;',

        'vec2 position = vec2(xPosition, yPosition);',

        '//Now to grab that color!',
        'vec4 moonColor = texture2D(moonTexture, position.xy);',

        '//Get the moon shadow using the normal map',
        '//Thank you, https://beesbuzz.biz/code/hsv_color_transforms.php!',
        'vec3 moonSurfaceNormal = normalize(2.0 * texture2D(moonNormalMap, position.xy).rgb - 1.0);',

        '//We should probably convert these over to magnitudes before performing our dot product and then convert it back again.',

        '//The moon is presumed to be a lambert shaded object, as per:',
        '//https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Diffuse_Reflection',
        'moonColor = vec4(moonColor.rgb * max(earthshine, dot(moonSurfaceNormal, moonTangentSpaceSunlight)), moonColor.a);',

        '//Now that we have the moon color, implement atmospheric effects, just like with the sun',
        'float moonAngularDiameterCos = cos(angularRadiusOfTheMoon);',
        'float moondisk = smoothstep(moonAngularDiameterCos,moonAngularDiameterCos+0.00002, skyParams.cosThetaMoon);',

        'vec3 L0 = (skyParams.moonE * 19000.0 * skyParams.FexMoon) * moondisk;',
        'L0 *= 0.04;',
        'L0 += vec3(0.0,0.001,0.0025)*0.3;',

        'float g_fMaxLuminance = 1.0;',
        'float fLumScaled = 0.1 / luminance;',
        'float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);',

        'float ExposureBias = fLumCompressed;',

        'vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));',
        'vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*L0);',

        'vec3 color = curr*whiteScale;',
        'color = pow(color,abs(vec3(1.0/(1.2+(1.2* (skyParams.moonfade)))) ));',

        'vec3 colorIntensity = pow(color, vec3(2.2));',
        'vec3 moonIntensity = pow(moonColor.xyz, vec3(2.2));',
        'vec3 combinedIntensity = 0.5 * colorIntensity * moonIntensity + 0.5 * moonIntensity;',

        '//TODO: We have both colors together, now we just have to appropriately mix them',
        'returnColor = vec4(pow(combinedIntensity, vec3(1.0/2.2)), moonColor.a);',
      '}',

      '//Otherwise, we shall return nothing for now. In the future, perhaps we will implement the',
      'return returnColor;',
    '}',

    'skyparams drawSkyLayer(float azimuthOfPixel, float altitudeOfPixel){',
      '//Get the fading of the sun and the darkening of the sky',
      'float sunAz = sunPosition.x;',
      'float sunAlt = sunPosition.y;',
      'float zenithAngle = piOver2 - sunAlt; //This is not a zenith angle, this is altitude',
      'float sunX = sin(zenithAngle) * cos(sunAz + pi);',
      'float sunZ = sin(zenithAngle) * sin(sunAz + pi);',
      'float sunY = cos(zenithAngle);',
      'float moonAz = moonAzimuthAndAltitude.x;',
      'float moonAlt = moonAzimuthAndAltitude.y;',
      'float moonZenithAngle = piOver2 - moonAlt;',
      'float moonX = sin(moonZenithAngle) * cos(moonAz + pi);',
      'float moonZ = sin(moonZenithAngle) * sin(moonAz + pi);',
      'float moonY = cos(moonZenithAngle);',

      'float heightOfSunInSky = 5000.0 * sunZ; //5000.0 is presumed to be the radius of our sphere',
      'float heightOfMoonInSky = 5000.0 * moonZ;',
      'float sunfade = 1.0-clamp(1.0-exp(heightOfSunInSky/5000.0),0.0,1.0);',
      'float moonfade = 1.0-clamp(1.0-exp(heightOfMoonInSky/5000.0),0.0,1.0);',
      'float reileighCoefficientOfSun = reileigh - (1.0-sunfade);',
      'float reileighCoefficientOfMoon = reileigh - (1.0-moonfade);',

      '//Get the sun intensity',
      '//Using dot(a,b) = ||a|| ||b|| * cos(a, b);',
      '//Here, the angle between up and the sun direction is always the zenith angle',
      '//Note in the original code, we normalized the sun direction at this point so that',
      '//the magnitude of that vector will always be one.',
      '//while',
      'vec3 floatSunPosition = normalize(vec3(sunX, sunY, sunZ));',
      'vec3 floatMoonPosition = normalize(vec3(moonX, moonY, moonZ));',
      'float dotOfSunDirectionAndUp = dot(floatSunPosition, up);',
      'float dotOfMoonDirectionAndUp = dot(floatMoonPosition, up);',
      'float sunE = lightIntensity(dotOfSunDirectionAndUp, sunEE);',
      'float moonE = lightIntensity(dotOfMoonDirectionAndUp, moonEE);',

      '//Acquire betaR and betaM',
      'vec3 betaRSun = simplifiedRayleigh() * reileighCoefficientOfSun;',
      'vec3 betaRMoon = simplifiedRayleigh() * reileighCoefficientOfMoon;',
      'vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;',

      '// Get the current optical length',
      '// cutoff angle at 90 to avoid singularity in next formula.',
      '//presuming here that the dot of the sun direction and up is also cos(zenith angle)',
      'float sunR = rayleighZenithLength / (dotOfSunDirectionAndUp + 0.15 * pow(clamp(93.885 - (zenithAngle / deg2Rad), 0.0, 360.0), -1.253));',
      'float moonR = rayleighZenithLength / (dotOfMoonDirectionAndUp + 0.15 * pow(clamp(93.885 - (moonZenithAngle / deg2Rad), 0.0, 360.0), -1.253));',
      'float sunM = mieZenithLength / (dotOfSunDirectionAndUp + 0.15 * pow(clamp(93.885 - (zenithAngle / deg2Rad), 0.0, 360.0), -1.253));',
      'float moonM = mieZenithLength / (dotOfMoonDirectionAndUp + 0.15 * pow(clamp(93.885 - (moonZenithAngle / deg2Rad), 0.0, 360.0), -1.253));',

      '// combined extinction factor',
      'vec3 Fex = exp(-(betaRSun * sunR + betaM * sunM));',
      'vec3 FexMoon = exp(-(betaRMoon * moonR + betaM * moonM));',

      '// in scattering',
      'float cosTheta = dot(normalize(vWorldPosition - vec3(0.0)), floatSunPosition);',
      'float cosThetaMoon = dot(normalize(vWorldPosition - vec3(0.0)), floatMoonPosition);',

      'float rPhase = rayleighPhase(cosTheta*0.5+0.5);',
      'float rPhaseOfMoon = rayleighPhase(cosThetaMoon * 0.5 + 0.5);',
      'vec3 betaRTheta = betaRSun * rPhase;',
      'vec3 betaRThetaMoon = betaRMoon * rPhaseOfMoon;',

      'float mPhase = hgPhase(cosTheta, mieDirectionalG);',
      'float mPhaseOfMoon = hgPhase(cosThetaMoon, mieDirectionalG);',
      'vec3 betaMTheta = betaM * mPhase;',
      'vec3 betaMThetaOfMoon = betaM * mPhaseOfMoon;',

      'vec3 Lin = pow((sunE) * ((betaRTheta + betaMTheta) / (betaRSun + betaM)) * (1.0 - Fex),vec3(1.5));',
      'Lin *= mix(vec3(1.0),pow((sunE) * ((betaRTheta + betaMTheta) / (betaRSun + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0));',
      'vec3 LinOfMoon = pow((moonE) * ((betaRThetaMoon + betaMThetaOfMoon) / (betaRMoon + betaM)) * (1.0 - FexMoon),vec3(1.5));',
      'LinOfMoon *= mix(vec3(1.0),pow((moonE) * ((betaRThetaMoon + betaMThetaOfMoon) / (betaRMoon + betaM)) * FexMoon,vec3(1.0/2.0)),clamp(pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0,1.0));',

      '//nightsky',
      'vec2 uv = vec2(azimuthOfPixel, (piOver2 - altitudeOfPixel)) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);',
      'vec3 L0 = vec3(0.1) * (Fex);',

      '//Final lighting, duplicated above for coloring of sun',
      'vec3 texColor = (Lin + LinOfMoon + L0);',
      'texColor *= 0.04 ;',
      'texColor += vec3(0.0,0.001,0.0025)*0.3;',

      'float g_fMaxLuminance = 1.0;',
      'float fLumScaled = 0.1 / luminance;',
      'float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);',

      'float ExposureBias = fLumCompressed;',

      'vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));',
      'vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);',
      'vec3 color = curr*whiteScale;',

      'vec3 retColor = pow(abs(color),vec3(1.0/(1.2+(1.2* (sunfade + moonfade)))));',

      'return skyparams(cosTheta, cosThetaMoon, Fex, FexMoon, sunE, moonE, Lin, LinOfMoon, sunfade, moonfade, vec4(retColor, 1.0));',
    '}',

    '//',
    '//Sun',
    '//',
    'vec4 drawSunLayer(float azimuthOfPixel, float altitudeOfPixel, skyparams skyParams){',
      '//It seems we need to rotate our sky by pi radians.',
      'vec4 returnColor = vec4(0.0);',
      'float sunAngularDiameterCos = cos(angularRadiusOfTheSun);',
      'float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002, skyParams.cosTheta);',

      'vec3 L0 = (skyParams.sunE * 19000.0 * skyParams.Fex) * sundisk;',
      'L0 *= 0.04 ;',
      'L0 += vec3(0.0,0.001,0.0025)*0.3;',

      'float g_fMaxLuminance = 1.0;',
      'float fLumScaled = 0.1 / luminance;',
      'float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);',

      'float ExposureBias = fLumCompressed;',

      'vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));',
      'vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*L0);',

      'vec3 color = curr*whiteScale;',
      'color = pow(color,abs(vec3(1.0/(1.2+(1.2* skyParams.sunfade)))) );',
      'returnColor = vec4(color, sqrt(dot(color, color)) );',

      'return returnColor;',
    '}',

    '//',
    '//Draw main loop',
    '//',
    'void main(){',
      'vec3 pointCoord = normalize(vWorldPosition.xyz);',
      'float altitude = piOver2 - acos(pointCoord.y);',
      'float azimuth = atan(pointCoord.z, pointCoord.x) + pi;',

      'vec4 baseColor = vec4(0.0);',

      '//Even though everything else is behind the sky, we need this to decide the brightness of the colors returned below.',
      '//Also, whenever the sun falls below the horizon, everything explodes in the original code.',
      '//Thus, I have taken the liberty of killing the sky when that happens to avoid explody code.',
      'skyparams skyParams = drawSkyLayer(azimuth, altitude);',
      'vec4 skyColor = skyParams.skyColor;',

      'skyWithAndWithoutStars starLayerData = starLayerBlending(drawStarLayer(azimuth, altitude, baseColor), skyColor, skyParams.sunE);',
      'vec4 outColor = starLayerData.starLayer;',

      'outColor = mixSunLayer(drawSunLayer(azimuth, altitude, skyParams), outColor);',

      'outColor = moonLayerBlending(drawMoonLayer(azimuth, altitude, skyParams), starLayerData.starlessLayer, outColor);',

    '	gl_FragColor = outColor;',
    '}',
  ].join('\n')
});



//
//TODO: Simplify equations, implement Hoerners Method and maybe save some variables
//TODO: Seperate out our various astronomical bodies into their own Javascript objects and files
//We don't need a 500 LOC object here if we can avoid it and seperate concerns to the appropriate objects.
//This is also keeping in line with object oriented code which is kind of a big deal.
//
var aDynamicSky = {
  latitude : 0.0,
  longitude : 0.0,
  radLatitude : 0.0,
  radLongitude : 0.0,
  year : 0.0,
  dayOfTheYear : 0.0,
  hourInDay : 0.0,
  julianDay : 0.0,
  sunPosition : null,
  deg2Rad: Math.PI / 180.0,

  update: function(skyData){
    this.radLatitude = this.latitude * this.deg2Rad;
    this.radLongitude = this.longitude * this.deg2Rad;
    this.year = skyData.year;
    this.daysInYear = this.getDaysInYear();
    this.dayOfTheYear = skyData.dayOfTheYear;

    //Get the time at Greenwhich
    var utcOffsetInSeconds = skyData.utcOffset != null ? skyData.utcOffset * 3600 : (240 * this.longitude);
    var utcDate = new Date(this.year, 0);
    utcDate.setSeconds( (this.dayOfTheYear - 1.0) * 86400 + skyData.timeOffset + utcOffsetInSeconds);

    //Update our time constants to UTC time
    this.year = utcDate.getFullYear();
    this.dayOfTheYear = dynamicSkyEntityMethods.getDayOfTheYearFromYMD(utcDate.getFullYear(), utcDate.getMonth() + 1, utcDate.getDate());
    this.timeInDay = utcDate.getHours() * 3600 + utcDate.getMinutes() * 60 + utcDate.getSeconds();

    this.julianDay = this.calculateJulianDay();
    this.julianCentury =this.calculateJulianCentury();

    //Useful constants
    this.calculateSunAndMoonLongitudeElgonationAndAnomoly();
    this.calculateNutationAndObliquityInEclipticAndLongitude();
    this.greenwhichMeanSiderealTime = this.calculateGreenwhichSiderealTime();
    this.greenwhichApparentSiderealTime = this.calculateApparentSiderealTime();
    this.localApparentSiderealTime = this.check4GreaterThan360(this.greenwhichApparentSiderealTime + this.longitude);
    this.localApparentSiderealTimeForUniform = -1.0 * (this.localApparentSiderealTime) * this.deg2Rad;

    //Get our actual positions
    this.sunPosition = this.getSunPosition();
    this.moonPosition = this.getMoonPosition();

    var moonMappingData = this.getMoonTangentSpaceSunlight(this.moonPosition.azimuth, this.moonPosition.altitude, this.sunPosition.azimuth, this.sunPosition.altitude);
    this.moonMappingTangentSpaceSunlight = moonMappingData.moonTangentSpaceSunlight;
    this.moonMappingPosition = moonMappingData.moonPosition;
    this.moonMappingTangent = moonMappingData.moonTangent;
    this.moonMappingBitangent = moonMappingData.moonBitangent;
  },

  calculateJulianDay: function(){
    var fractionalTime = this.timeInDay / 86400;

    var month;
    var day;
    var daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    //Check if this is a leap year, if so, then add one day to the month of feburary...
    if(this.daysInYear == 366){
      daysInEachMonth[1] = 29;
    }

    var daysPast = 0;
    var previousMonthsDays = 0;
    for(var m = 0; m < 12; m++){
      previousMonthsDays = daysPast;
      daysPast += daysInEachMonth[m];
      if(daysPast >= this.dayOfTheYear){
        month = m + 1;
        day = this.dayOfTheYear - previousMonthsDays;
        break;
      }
    }
    day = day + fractionalTime;
    var year = this.year;

    if(month <= 2){
      year = year - 1;
      month = month + 12;
    }

    //Note: Meeus defines INT to be the greatest integer less than or equal x
    //Page 60, so I think floor does the best job of showing this, not trunc.

    //Roughly check that we are in the julian or gregorian calender.
    //Thank you https://github.com/janrg/MeeusSunMoon/blob/master/src/MeeusSunMoon.js
    var gregorianCutoff = new Date("1582-10-15 12:00:00");
    var hour = Math.floor(this.timeInDay / 3600);
    var minute = Math.floor((this.timeInDay % 3600) /60);
    var second = Math.floor(this.timeInDay % 60);
    var todayAsADate = new Date(year, month, day, hour, minute, second);
    var B = 0;
    if (todayAsADate > gregorianCutoff) {
      var A = Math.floor(year / 100);
      var B = 2 - A + Math.floor(A / 4);
    }
    var julianDay = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;

    return julianDay;
  },

  check4GreaterThan360: function(inDegrees){
    var outDegrees = inDegrees % 360;
    if(outDegrees < 0.0){
      return (360 + outDegrees);
    }
    else if(outDegrees == 360.0){
      return 0.0;
    }
    return outDegrees;
  },

  checkBetweenMinus90And90: function(inDegs){
    var outDegs = this.check4GreaterThan360(inDegs + 90);
    return (outDegs - 90);
  },

  checkBetweenMinus180And180: function(inDegs){
    var outDegs = this.check4GreaterThan360(inDegs + 180);
    return (outDegs - 180);
  },

  check4GreaterThan2Pi: function(inRads){
    var outRads = inRads % (2 * Math.PI);
    if(outRads < 0.0){
      return (Math.PI * 2.0 + outRads);
    }
    else if(outRads == (Math.PI * 2.0)){
      return 0.0;
    }
    return outRads;
  },

  checkBetweenMinusPiOver2AndPiOver2: function(inRads){
    var outRads = this.check4GreaterThan2Pi(inRads + Math.PI/2.0);
    return (outRads - (Math.PI / 2.0));
  },

  checkBetweenMinusPiAndPi: function(inRads){
    var outRads = this.check4GreaterThan2Pi(inRads + Math.PI);
    return (outRads - Math.PI);
  },

  calculateJulianCentury(){
    return (this.julianDay - 2451545.0) / 36525.0;
  },

  calculateGreenwhichSiderealTime: function(){
    //Meeus 87
    var julianDayAt0hUTC = Math.trunc(this.julianDay) + 0.5;
    var T = (julianDayAt0hUTC - 2451545.0) / 36525.0;

    var gmsrt = this.check4GreaterThan360(280.46061837 + 360.98564736629 * (this.julianDay - 2451545.0) + T * T * 0.000387933 - ((T * T * T) / 38710000.0));
    return gmsrt;
  },

  calculateApparentSiderealTime: function(){
    var nutationInRightAscensionInSeconds = (this.nutationInLongitude * 3600 * Math.cos(this.trueObliquityOfEcliptic * this.deg2Rad) )/ 15.0;
    var nutationInRightAscensionInDegs = nutationInRightAscensionInSeconds * (360) / 86400;
    var gasrt = this.greenwhichMeanSiderealTime + nutationInRightAscensionInDegs;

    return gasrt;
  },

  //With a little help from: http://www.convertalot.com/celestial_horizon_co-ordinates_calculator.html
  //and: http://www.geoastro.de/elevaz/basics/meeus.htm
  getAzimuthAndAltitude: function(rightAscension, declination){
    var latitude = this.latitude;

    //Calculated from page 92 of Meeus
    var hourAngle = this.check4GreaterThan360(this.localApparentSiderealTime - rightAscension);
    var hourAngleInRads = hourAngle * this.deg2Rad;
    var latitudeInRads =  latitude * this.deg2Rad;
    var declinationInRads = declination * this.deg2Rad;

    var az = Math.atan2(Math.sin(hourAngleInRads), ((Math.cos(hourAngleInRads) * Math.sin(latitudeInRads)) - (Math.tan(declinationInRads) * Math.cos(latitudeInRads))));
    var alt = Math.asin(Math.sin(latitudeInRads) * Math.sin(declinationInRads) + Math.cos(latitudeInRads) * Math.cos(declinationInRads) * Math.cos(hourAngleInRads));

    az = this.check4GreaterThan2Pi(az + Math.PI);
    alt = this.checkBetweenMinusPiOver2AndPiOver2(alt);

    return {azimuth: az, altitude: alt};
  },

  //I love how chapter 22 precedes chapter 13 :P
  //But anyways, using the shorter version from 144 - this limits the accuracy of
  //everything else to about 2 or 3 decimal places, but we will survive but perfection isn't our goal here
  calculateNutationAndObliquityInEclipticAndLongitude: function(){
    var T = this.julianCentury;
    var omega = this.LongitudeOfTheAscendingNodeOfTheMoonsOrbit * this.deg2Rad;
    var sunsMeanLongitude = this.sunsMeanLongitude * this.deg2Rad;
    var moonsMeanLongitude = this.moonMeanLongitude * this.deg2Rad;

    this.nutationInLongitude = (-17.2 * Math.sin(omega) - 1.32 * Math.sin(2 * sunsMeanLongitude) - 0.23 * Math.sin(2 * moonsMeanLongitude) + 0.21 * Math.sin(omega)) / 3600.0;
    this.deltaObliquityOfEcliptic = (9.2 * Math.cos(omega) + 0.57 * Math.cos(2 * sunsMeanLongitude) + 0.1 * Math.cos(2 * moonsMeanLongitude) - 0.09 * Math.cos(2 * omega)) / 3600;
    this.meanObliquityOfTheEclipitic = this.astroDegrees2NormalDegs(23, 26, 21.448) - ((T * 46.8150) / 3600)  - ((0.00059 * T * T) / 3600) + ((0.001813 * T * T * T) / 3600);
    this.trueObliquityOfEcliptic = this.meanObliquityOfTheEclipitic + this.deltaObliquityOfEcliptic;
  },

  //With a little help from: http://aa.usno.navy.mil/faq/docs/SunApprox.php and of course, Meeus
  getSunPosition: function(){
    var T = this.julianCentury;
    var sunsMeanAnomoly = this.sunsMeanAnomoly * this.deg2Rad;
    var sunsMeanLongitude = this.sunsMeanLongitude;
    var eccentricityOfEarth = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
    var sunsEquationOfCenter = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(sunsMeanAnomoly) + (0.019993 - 0.000101 * T) * Math.sin(2 * sunsMeanAnomoly) + 0.000289 * Math.sin(3 * sunsMeanAnomoly);
    var sunsTrueLongitude = (sunsMeanLongitude + sunsEquationOfCenter) * this.deg2Rad;
    this.longitudeOfTheSun = sunsTrueLongitude;
    var meanObliquityOfTheEclipitic = this.meanObliquityOfTheEclipitic * this.deg2Rad;
    var rightAscension = this.check4GreaterThan2Pi(Math.atan2(Math.cos(meanObliquityOfTheEclipitic) * Math.sin(sunsTrueLongitude), Math.cos(sunsTrueLongitude)));
    var declination = this.checkBetweenMinusPiOver2AndPiOver2(Math.asin(Math.sin(meanObliquityOfTheEclipitic) * Math.sin(sunsTrueLongitude)));

    //While we're here, let's calculate the distance from the earth to the sun, useful for figuring out the illumination of the moon
    this.distanceFromEarthToSun = (1.000001018 * (1 - (eccentricityOfEarth * eccentricityOfEarth))) / (1 + eccentricityOfEarth * Math.cos(sunsEquationOfCenter * this.deg2Rad)) * 149597871;

    //Because we use these elsewhere...
    this.sunsRightAscension = rightAscension / this.deg2Rad;
    this.sunsDeclination = declination / this.deg2Rad;
    return this.getAzimuthAndAltitude(this.sunsRightAscension, this.sunsDeclination);
  },

  calculateSunAndMoonLongitudeElgonationAndAnomoly: function(){
    var T = this.julianCentury;
    this.moonMeanLongitude = this.check4GreaterThan360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0 - (T * T * T * T) / 65194000.0 );
    this.moonMeanElongation = this.check4GreaterThan360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0  - (T * T * T * T) / 113065000.0 );
    this.moonsMeanAnomaly = this.check4GreaterThan360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699 - (T * T * T * T) / 14712000);
    this.moonsArgumentOfLatitude = this.check4GreaterThan360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0 + (T * T * T * T) / 863310000.0);
    this.LongitudeOfTheAscendingNodeOfTheMoonsOrbit = this.check4GreaterThan360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + ((T * T *T) /450000));
    this.sunsMeanAnomoly = this.check4GreaterThan360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0);
    this.sunsMeanLongitude = this.check4GreaterThan360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  },

  getMoonEE(D, M, MP){
    //From approximation 48.4 in Meeus, page 346
    var lunarPhaseAngleI = 180 - D - 6.289 * Math.sin(this.deg2Rad * MP) + 2.1 * Math.sin(this.deg2Rad * M) - 1.274 * Math.sin(this.deg2Rad * (2.0 * D - MP)) - 0.658 * Math.sin(this.deg2Rad * (2.0 * D));
    lunarPhaseAngleI += -0.214 * Math.sin(this.deg2Rad * (2 * MP)) - 0.110 * Math.sin(this.deg2Rad * D);
    var fullLunarIllumination = 29;

    //Using HN Russell's data as a guide and guestimating a rough equation for the intensity of moonlight from the phase angle...
    var fractionalIntensity = 1.032391 * Math.exp(-0.0257614 * Math.abs(lunarPhaseAngleI));

    //Using the square of the illuminated fraction of the moon for a faster falloff
    var partialLunarIllumination = fullLunarIllumination * fractionalIntensity;
    this.moonEE = partialLunarIllumination;
  },

  //With help from Meeus Chapter 47...
  getMoonPosition: function(){
    var T = this.julianCentury;
    var moonMeanLongitude = this.check4GreaterThan360(this.moonMeanLongitude);
    var moonMeanElongation = this.moonMeanElongation;
    var sunsMeanAnomoly = this.sunsMeanAnomoly;
    var moonsMeanAnomaly = this.moonsMeanAnomaly;
    var moonsArgumentOfLatitude = this.check4GreaterThan360(this.moonsArgumentOfLatitude);
    var a_1 = this.check4GreaterThan360(119.75 + 131.849 * T);
    var a_2 = this.check4GreaterThan360(53.09 + 479264.290 * T);
    var a_3 = this.check4GreaterThan360(313.45 + 481266.484 * T);
    var e_parameter = 1 - 0.002516 * T - 0.0000074 * T * T;

    //For the love of cheese why?!
    //TODO: kill off some of these terms. If we're limiting ourselves to 0.01
    //degrees of accuracy, we don't require this many terms by far!
    var D_coeficients = [0,2,2,0, 0,0,2,2, 2,2,0,1, 0,2,0,0, 4,0,4,2, 2,1,1,2, 2,4,2,0, 2,2,1,2,
    0,0,2,2, 2,4,0,3, 2,4,0,2 ,2,2,4,0, 4,1,2,0, 1,3,4,2, 0,1,2,2];
    var M_coeficients = [0,0,0,0,1,0,0,-1,0,-1,1,0,1,0,0,0,0,0,0,1,1,0,1,-1,0,0,0,1,0,-1,0,-2,
    1,2,-2,0,0,-1,0,0,1,-1,2,2,1,-1,0,0,-1,0,1,0,1,0,0,-1,2,1,0,0];
    var M_prime_coeficients = [1,-1,0,2,0,0,-2,-1,1,0,-1,0,1,0,1,1,-1,3,-2,-1,0,-1,0,1,2,0,-3,-2,-1,-2,1,0,
    2,0,-1,1,0,-1,2,-1,1,-2,-1,-1,-2,0,1,4,0,-2,0,2,1,-2,-3,2,1,-1,3,-1];
    var F_coeficients = [0,0,0,0,0,2,0,0,0,0,0,0,0,-2,2,-2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,
    0,0,0,-2,2,0,2,0,0,0,0,0,0,-2,0,0,0,0,-2,-2,0,0,0,0,0,0,0,-2];
    var l_sum_coeficients = [6288774, 1274027, 658314, 213618, -185116, -114332, 58793, 57066,
    53322, 45758, -40923, -34720, -30383, 15327, -12528, 10980, 10675, 10034, 8548, -7888, -6766,
    -5163, 4987, 4036, 3994, 3861, 3665, -2689, -2602, 2390, -2348, 2236,
    -2120, -2069, 2048, -1773, -1595, 1215, -1110, -892, -810, 759, -713, -700, 691, 596, 549, 537,
    520, -487, -399, -381, 351, -340, 330, 327, -323, 299, 294, 0];
    var r_sum_coeficients = [-20905355, -3699111, -2955968, -569925, 48888, -3149, 246158, -152138, -170733,
      -204586, -129620, 108743, 104755, 10321, 0, 79661, -34782, -23210, -21636, 24208,
    30824, -8379, -16675, -12831, -10445, -11650, 14403, -7003, 0, 10056, 6322, -9884,
    5751, 0, -4950, 4130, 0, -3958, 0, 3258, 2616, -1897, -2117, 2354, 0, 0, -1423, -1117,
    -1571, -1739, 0, -4421, 0, 0, 0, 0, 1165, 0, 0, 8752];
    var sum_l = 0.0;
    var sum_r = 0.0;

    for(var i = 0; i < D_coeficients.length; i++){
      //Get our variables for this ith component;
      var D_coeficient = D_coeficients[i];
      var M_coeficient = M_coeficients[i];
      var M_prime_coeficient = M_prime_coeficients[i];
      var F_coeficient = F_coeficients[i];
      var l_sum_coeficient = l_sum_coeficients[i];
      var r_sum_coeficient = r_sum_coeficients[i];

      var D = D_coeficient * moonMeanElongation;
      var M = M_coeficient * sunsMeanAnomoly;
      var Mp = M_prime_coeficient * moonsMeanAnomaly;
      var F = F_coeficient * moonsArgumentOfLatitude;
      var sumOfTerms = D + M + Mp + F;

      var e_coeficient = 1.0;
      if(Math.abs(M_coeficient) === 1){
        e_coeficient = e_parameter;
      }
      else if(Math.abs(M_coeficient) === 2){
        e_coeficient = e_parameter * e_parameter;
      }
      sum_l += e_coeficient * l_sum_coeficient * Math.sin(this.check4GreaterThan360(sumOfTerms) * this.deg2Rad);
      sum_r += e_coeficient * r_sum_coeficient * Math.cos(this.check4GreaterThan360(sumOfTerms) * this.deg2Rad);
    }

    //For B while we're at it :D
    //TODO: kill off some of these terms. If we're limiting ourselves to 0.01
    //degrees of accuracy, we don't require this many terms by far!
    D_coeficients = [0,0,0,2, 2,2,2,0,2,0,2,2,2,2,2,2,2,0,4,0,0,0,1,0,
      0,0,1,0,4,4,0,4,2,2,2,2,0,2,2,2,2,4,2,2,0,2,1,1,0,2,1,2,0,4,4,1,4,1,4,2];
    M_coeficients = [0,0,0,0,0,0,0,0,0,0,-1,0,0,1,-1,-1,-1,1,0,1,0,1,0,1,
      1,1,0,0,0,0,0,0,0,0,-1,0,0,0,0,1,1,0,-1,-2,0,1,1,1,1,1,0,-1,1,0,-1,0,0,0,-1,-2];
    M_prime_coeficients = [0,1,1,0,-1,-1,0,2,1,2,0,-2,1,0,-1,0,-1,-1,-1,0,0,-1,0,1,
      1,0,0,3,0,-1,1,-2,0,2,1,-2,3,2,-3,-1,0,0,1,0,1,1,0,0,-2,-1,1,-2,2,-2,-1,1,1,-1,0,0];
    F_coeficients = [1,1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,1,3,1,1,1,
      -1,-1,-1,1,-1,1,-3,1,-3,-1,-1,1,-1,1,-1,1,1,1,1,-1,3,-1,-1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1,-1,1];
    var b_sum_coeficients = [5128122,280602,277693,173237,55413,46271, 32573, 17198,
      9266,8822,8216,4324,4200,-3359,2463,2211,2065,-1870,1828,-1794,
      -1749,-1565,-1491,-1475,-1410,-1344,-1335,1107,1021,833,
      777,671,607,596,491,-451,439,422,421,-366,-351,331,315,302,-283,-229,
      223,223,-220,-220,-185, 181,-177,176,166,-164,132,-119,115,107];

    var sum_b = 0.0;
    for(var i = 0; i < D_coeficients.length; i++){
      var D_coeficient = D_coeficients[i];
      var M_coeficient = M_coeficients[i];
      var M_prime_coeficient = M_prime_coeficients[i];
      var F_coeficient = F_coeficients[i];
      var b_sum_coeficient = b_sum_coeficients[i];

      //And for the sunsEquation
      var D = D_coeficient * moonMeanElongation;
      var M = M_coeficient * sunsMeanAnomoly;
      var Mp = M_prime_coeficient * moonsMeanAnomaly;
      var F = F_coeficient * moonsArgumentOfLatitude;

      var e_coeficient = 1.0;
      if(Math.abs(M_coeficient) === 1){
        e_coeficient = e_parameter;
      }
      else if(Math.abs(M_coeficient) === 2){
        e_coeficient = e_parameter * e_parameter;
      }

      sum_b += e_coeficient * b_sum_coeficient * Math.sin(this.check4GreaterThan360(D + M + Mp + F) * this.deg2Rad);
    }

    //Additional terms
    var moonMeanLongitude = this.check4GreaterThan360(moonMeanLongitude);
    var moonsArgumentOfLatitude = this.check4GreaterThan360(moonsArgumentOfLatitude);
    var moonsMeanAnomaly = this.check4GreaterThan360(moonsMeanAnomaly);
    sum_l = sum_l + 3958.0 * Math.sin(a_1 * this.deg2Rad) + 1962.0 * Math.sin((moonMeanLongitude - moonsArgumentOfLatitude) * this.deg2Rad) + 318.0 * Math.sin(a_2 * this.deg2Rad);
    sum_b = sum_b - 2235.0 * Math.sin(moonMeanLongitude * this.deg2Rad) + 382.0 * Math.sin(a_3 * this.deg2Rad) + 175.0 * Math.sin((a_1 - moonsArgumentOfLatitude) * this.deg2Rad) + 175 * Math.sin((a_1 + moonsArgumentOfLatitude) * this.deg2Rad);
    sum_b = sum_b + 127.0 * Math.sin((moonMeanLongitude - moonsMeanAnomaly) * this.deg2Rad) - 115.0 * Math.sin((moonMeanLongitude + moonsMeanAnomaly) * this.deg2Rad);

    var lambda = (moonMeanLongitude + (sum_l / 1000000));
    var beta = (sum_b / 1000000);
    this.distanceFromEarthToMoon = 385000.56 + (sum_r / 1000); //In kilometers
    var raAndDec = this.lambdaBetaDegToRaDec(lambda, beta);
    var rightAscension = raAndDec.rightAscension;
    var declination = raAndDec.declination;

    var geocentricElongationOfTheMoon = Math.acos(Math.cos(beta) * Math.cos(this.longitudeOfTheSun - lambda))
    this.getMoonEE(moonMeanElongation, sunsMeanAnomoly, moonsMeanAnomaly);

    //Because we use these elsewhere...
    this.moonsRightAscension = rightAscension;
    this.moonsDeclination = declination;

    //Just return these values for now, we can vary the bright
    return this.getAzimuthAndAltitude(rightAscension, declination);
  },

  getMoonTangentSpaceSunlight(moonAzimuth, moonAltitude, solarAzimuth, solarAltitude){
    //Calculate our normal, tangent and bitangent for the moon for normal mapping
    //We don't need these for each face because our moon is effectively a billboard
    var moonZenith = (Math.PI / 2.0) - moonAltitude;

    //First acquire our normal vector for the moon.
    var sinMZ = Math.sin(moonZenith);
    var cosMZ = Math.cos(moonZenith);
    var sinMA = Math.sin(moonAzimuth);
    var cosMA = Math.cos(moonAzimuth);
    var moonXCoordinates = sinMZ * cosMA;
    var moonYCoordinates = sinMZ * sinMA;
    var moonZCoordinates = cosMZ;
    var moonCoordinates = new THREE.Vector3(moonXCoordinates, moonYCoordinates, moonZCoordinates);

    //Get the unit vectors, x, y and z for our moon.
    //https://math.stackexchange.com/questions/70493/how-do-i-convert-a-vector-field-in-cartesian-coordinates-to-spherical-coordinate
    var sphericalUnitVectors = new THREE.Matrix3();
    sphericalUnitVectors.set(
      sinMZ*cosMA, sinMZ*sinMA, cosMZ,
      cosMZ*cosMA, cosMZ*sinMA, -sinMZ,
      -sinMA, cosMA, 0.0
    );
    var inverseOfSphericalUnitVectors = new THREE.Matrix3();
    inverseOfSphericalUnitVectors.getInverse(sphericalUnitVectors);

    var unitRVect = new THREE.Vector3(1.0, 0.0, 0.0);
    var unitAzVect = new THREE.Vector3(0.0, 0.0, 1.0);
    var moonNormal = unitRVect.applyMatrix3(inverseOfSphericalUnitVectors).normalize().negate().clone();
    var moonTangent = unitAzVect.applyMatrix3(inverseOfSphericalUnitVectors).normalize().clone();

    //Instead of just using the unit alt vector, I take the cross betweent the normal and the
    //azimuth vectors to preserve direction when crossing altitude = 0
    var moonBitangent = moonNormal.clone();
    moonBitangent.cross(moonTangent);

    var toTangentMoonSpace = new THREE.Matrix3();
    toTangentMoonSpace.set(
      moonTangent.x, moonBitangent.x, moonNormal.x,
      moonTangent.y, moonBitangent.y, moonNormal.y,
      moonTangent.z, moonBitangent.z, moonNormal.z);
    toTangentMoonSpace.transpose();

    var solarZenith = (Math.PI / 2.0) - solarAltitude;
    sinOfSZenith = Math.sin(solarZenith);
    cosOfSZenith = Math.cos(solarZenith);
    sinOfSAzimuth = Math.sin(solarAzimuth);
    cosOfSAzimuth = Math.cos(solarAzimuth);
    var solarXCoordinates = sinOfSZenith * cosOfSAzimuth;
    var solarYCoordinates = sinOfSZenith * sinOfSAzimuth;
    var solarZCoordinates = cosOfSZenith;
    var solarCoordinates = new THREE.Vector3(solarXCoordinates, solarYCoordinates, solarZCoordinates);
    solarCoordinates.normalize();

    var moonTangentSpaceSunlight = solarCoordinates.clone();
    moonTangentSpaceSunlight.applyMatrix3(toTangentMoonSpace);

    return {moonTangentSpaceSunlight: moonTangentSpaceSunlight, moonTangent: moonTangent, moonBitangent: moonBitangent, moonPosition: moonCoordinates};
  },

  getDaysInYear: function(){
    var daysInThisYear = dynamicSkyEntityMethods.getIsLeapYear(this.year) ? 366 : 365;

    return daysInThisYear;
  },

  convert2NormalizedGPUCoords: function(azimuth, altitude){
    var x = Math.sin(azimuth) * Math.cos(altitude - 3 * Math.PI / 2); //Define me as true north, switch to minus one to define me as south.
    var y = Math.sin(azimuth) * Math.sin(altitude - 3 * Math.PI / 2);
    var z = Math.cos(altitude - 3 * Math.PI / 2);

    return {x: x, y: y, z: z};
  },

  lambdaBetaDegToRaDec: function(lambda, beta){
    var radLambda = lambda * this.deg2Rad;
    var radBeta = beta * this.deg2Rad;
    var epsilon = this.trueObliquityOfEcliptic * this.deg2Rad

    //Use these to acquire the equatorial solarGPUCoordinates
    var rightAscension = this.check4GreaterThan2Pi(Math.atan2(Math.sin(radLambda) * Math.cos(epsilon) - Math.tan(radBeta) * Math.sin(epsilon), Math.cos(radLambda)));
    var declination = this.checkBetweenMinusPiOver2AndPiOver2(Math.asin(Math.sin(radBeta) * Math.cos(epsilon) + Math.cos(radBeta) * Math.sin(epsilon) * Math.sin(radLambda)));

    //Convert these back to degrees because we don't actually convert them over to radians until our final conversion to azimuth and altitude
    rightAscension = rightAscension / this.deg2Rad;
    declination = declination / this.deg2Rad;

    return {rightAscension: rightAscension, declination: declination};
  },

  //
  //Useful for debugging purposes
  //
  radsToAstroDegreesString: function(radianVal){
    var returnObj = this.radsToAstroDegrees(radianVal);
    return `${returnObj.degrees}°${returnObj.minutes}'${returnObj.seconds}''`;
  },

  radsToAstroDegrees: function(radianVal){
    var degreeValue = this.check4GreaterThan360(radianVal / this.deg2Rad);
    var degrees = Math.trunc(degreeValue);
    var remainder = Math.abs(degreeValue - degrees);
    var arcSeconds = 3600 * remainder;
    var arcMinutes = Math.floor(arcSeconds / 60);
    arcSeconds = arcSeconds % 60;

    return {degrees: degrees, minutes: arcMinutes, seconds: arcSeconds};
  },

  astroDegrees2Rads: function(degrees, arcminutes, arcseconds){
    return this.deg2Rad * this.astroDegrees2NormalDegs(degrees, arcminutes, arcseconds);
  },

  astroDegrees2NormalDegs: function(degrees, arcminutes, arcseconds){
    var fractDegrees = 0;
    if(degrees !== 0){
      fractDegrees = this.check4GreaterThan360(Math.sign(degrees) * (Math.abs(degrees) + (arcminutes / 60.0) + (arcseconds / 3600.0) ));
    }
    else if(arcminutes !== 0){
      fractDegrees = this.check4GreaterThan360(Math.sign(arcminutes) * ( (Math.abs(arcminutes) / 60.0) + (arcseconds / 3600.0) ));
    }
    else if(arcseconds !== 0){
      fractDegrees = this.check4GreaterThan360(arcseconds / 3600.0);
    }

    return fractDegrees;
  },

  radToHoursMinutesSecondsString: function(radianVal){
    var returnObj = this.radToHoursMinutesSeconds(radianVal);
    return `${returnObj.hours}:${returnObj.minutes}:${returnObj.seconds}`;
  },

  radToHoursMinutesSeconds: function(radianVal){
    var degreeValue = this.check4GreaterThan360(radianVal / this.deg2Rad);
    var fractionalHours = degreeValue / 15;
    var hours = Math.floor(fractionalHours);
    var remainder = fractionalHours - hours;
    var totalSeconds = remainder * 3600;
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;

    return {hours: hours, minutes: minutes, seconds: seconds,
      addSeconds: function(seconds){
        this.seconds += seconds;
        if(this.seconds > 60){
          this.minutes += Math.floor(this.seconds / 60);
          this.seconds = this.seconds % 60;
        }
        if(this.minutes > 60){
          this.hours += Math.floor(this.minutes / 60);
          this.hours = this.hours % 24;
          this.minutes = this.minutes % 60;
        }
      }
    };
  },

  astroHoursMinuteSeconds2Degs: function(hours, minutes, seconds){
    return (360.0 * (hours * 3600.0 + minutes * 60.0 + seconds) / 86400.0);
  }
}

//For Mocha testing


var dynamicSkyEntityMethods = {
  currentDate: new Date(),
  getDayOfTheYear: function(){
    var month = this.currentDate.getMonth() + 1;
    var dayOfThisMonth = this.currentDate.getDate();
    var year = this.currentDate.getFullYear();

    return this.getDayOfTheYearFromYMD(year, month, dayOfThisMonth);
  },

  getNowFromData: function(data){
    //Initialize our day
    var outDate = new Date(data.year, 0);
    outDate.setDate(data.dayOfTheYear);
    outDate.setSeconds(data.timeOffset);

    return new Date(outDate);
  },

  getDayOfTheYearFromYMD: function(year, month, day){
    var daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if(year == 0.0 || (year % 4 == 0.0) ){
      daysInEachMonth[1] = 29;
    }
    var currentdayOfTheYear = 0;

    for(var m = 0; m < (month - 1); m++){
      currentdayOfTheYear += daysInEachMonth[m];
    }
    currentdayOfTheYear += day;

    return currentdayOfTheYear.toString();
  },

  getIsLeapYear: function(year){
    if(((year % 4 == 0 || year == 0) && (((year % 100 == 0) && (year % 400 == 0)) || (year % 100 != 0)))){
      return true;
    }
    return false;
  },

  getSecondOfDay: function(){
    var midnightOfPreviousDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate(), 0,0,0);
    return (this.currentDate - midnightOfPreviousDay) / 1000.0;
  },

  getYear: function(){
    return Math.trunc(this.currentDate.getFullYear().toString());
  },
}

//For Mocha testing




// The mesh mixin provides common material properties for creating mesh-based primitives.
// This makes the material component a default component and maps all the base material properties.
var meshMixin = AFRAME.primitives.getMeshMixin();

//Create primitive data associated with this, based off a-sky
//https://github.com/aframevr/aframe/blob/master/src/extras/primitives/primitives/a-sky.js
AFRAME.registerPrimitive('a-sky-forge', AFRAME.utils.extendDeep({}, meshMixin, {
    // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
    defaultComponents: {
      geometry: {
        primitive: 'sphere',
        radius: 5000,
        segmentsWidth: 64,
        segmentsHeight: 32
      },
      scale: '-1, 1, 1',
      "geo-coordinates": 'lat: 37.7749; long: -122.4194',
      "sky-time": `timeOffset: ${Math.round(dynamicSkyEntityMethods.getSecondOfDay())}; utcOffset: 0; timeMultiplier: 1.0; dayOfTheYear: ${Math.round(dynamicSkyEntityMethods.getDayOfTheYear())}; year: ${Math.round(dynamicSkyEntityMethods.getYear())}`
    }
  }
));

//Register associated components
AFRAME.registerComponent('geo-coordinates', {
  schema: {
    lat: {type: 'number', default: 37.7749},
    long: {type: 'number', default: -122.4194}
  }
});

AFRAME.registerComponent('sky-time', {
  fractionalSeconds: 0,
  dependencies: ['geo-coordinates', 'a-sky-forge'],
  schema: {
    timeOffset: {type: 'number', default: dynamicSkyEntityMethods.getSecondOfDay()},
    timeMultiplier: {type: 'number', default: 1.0},
    utcOffset: {type: 'int', default: 0},
    dayOfTheYear: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getDayOfTheYear())},
    month: {type: 'int', default: -1},
    day: {type: 'int', default: -1},
    year: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getYear())},
    imgDir: {type: 'string', default: '../images/'},
    moonTexture: {type: 'map', default: 'moon-dif-1024.png'},
    moonNormalMap: {type: 'map', default: 'moon-nor-1024-padded.png'},
    starMask: {type: 'map', default:'padded-starry-sub-data-0.png'},
    starRas: {type: 'map', default:'padded-starry-sub-data-1.png'},
    starDecs: {type: 'map', default:'padded-starry-sub-data-2.png'},
    starMags: {type: 'map', default:'padded-starry-sub-data-3.png'},
    starColors: {type: 'map', default:'padded-starry-sub-data-4.png'},
  },

  init: function(){
    if(this.data.month != -1 && this.data.day != -1){
      this.data.dayOfTheYear = dynamicSkyEntityMethods.getDayOfTheYearFromYMD(this.data.year, this.data.month, this.data.day);
    }

    this.lastCameraDirection = {x: 0.0, y: 0.0, z: 0.0};
    this.dynamicSkyObj = aDynamicSky;
    this.dynamicSkyObj.latitude = this.el.components['geo-coordinates'].data.lat;
    this.dynamicSkyObj.longitude = this.el.components['geo-coordinates'].data.long;
    this.dynamicSkyObj.update(this.data);
    this.el.components.material.material.uniforms.sunPosition.value.set(this.dynamicSkyObj.sunPosition.azimuth, this.dynamicSkyObj.sunPosition.altitude);

    //Load our normal maps for the moon
    var textureLoader = new THREE.TextureLoader();
    var moonTexture = textureLoader.load(this.data.imgDir + this.data.moonTexture);
    var moonNormalMap = textureLoader.load(this.data.imgDir + this.data.moonNormalMap);

    //
    //Note: We might want to min map our moon texture and normal map so that
    //Note: we can get better texture results in our view
    //

    //Populate this data into an array because we're about to do some awesome stuff
    //to each texture with Three JS.
    //Note that,
    //We use a nearest mag and min filter to avoid fuzzy pixels, which kill good data
    //We use repeat wrapping on wrap s, to horizontally flip to the other side of the image along RA
    //And we use mirrored mapping on wrap w to just reflect back, although internally we will want to subtract 0.5 from this.
    //we also use needs update to make all this work as per, https://codepen.io/SereznoKot/pen/vNjJWd
    var starMask = textureLoader.load(this.data.imgDir + this.data.starMask, function(starMask){
      starMask.magFilter = THREE.NearestFilter;
      starMask.minFilter = THREE.NearestFilter;
      starMask.wrapS = THREE.RepeatWrapping;
      starMask.wrapW = THREE.MirroredRepeatWrapping;
      starMask.needsUpdate = true;
    });

    var starRas = textureLoader.load(this.data.imgDir + this.data.starRas, function(starRas){
      starRas.magFilter = THREE.NearestFilter;
      starRas.minFilter = THREE.NearestFilter;
      starRas.wrapS = THREE.RepeatWrapping;
      starRas.wrapW = THREE.MirroredRepeatWrapping;
      starRas.needsUpdate = true;
    });

    var starDecs = textureLoader.load(this.data.imgDir + this.data.starDecs, function(starDecs){
      starDecs.magFilter = THREE.NearestFilter;
      starDecs.minFilter = THREE.NearestFilter;
      starDecs.wrapS = THREE.RepeatWrapping;
      starDecs.wrapW = THREE.MirroredRepeatWrapping;
      starDecs.needsUpdate = true;
    });

    var starMags = textureLoader.load(this.data.imgDir + this.data.starMags, function(starMags){
      starMags.magFilter = THREE.NearestFilter;
      starMags.minFilter = THREE.NearestFilter;
      starMags.wrapS = THREE.RepeatWrapping;
      starMags.wrapW = THREE.MirroredRepeatWrapping;
      starMags.needsUpdate = true;
    });

    var starColors = textureLoader.load(this.data.imgDir + this.data.starColors, function(){
      starColors.magFilter = THREE.NearestFilter;
      starColors.minFilter = THREE.NearestFilter;
      starColors.wrapS = THREE.RepeatWrapping;
      starColors.wrapW = THREE.MirroredRepeatWrapping;
      starColors.needsUpdate = true;
    });

    //We only load our textures once upon initialization
    this.el.components.material.material.uniforms.moonTexture.value = moonTexture;
    this.el.components.material.material.uniforms.moonNormalMap.value = moonNormalMap;
    this.el.components.material.material.uniforms.starMask.value = starMask;
    this.el.components.material.material.uniforms.starRas.value = starRas;
    this.el.components.material.material.uniforms.starDecs.value = starDecs;
    this.el.components.material.material.uniforms.starMags.value = starMags;
    this.el.components.material.material.uniforms.starColors.value = starColors;

    //Set up our screen width
    this.el.components.material.material.uniforms.u_resolution.value.set(window.screen.width, window.screen.height);

    //Hook up our interpolator and set the various uniforms we wish to track and
    //interpolate during each frame.
    this.currentTime = dynamicSkyEntityMethods.getNowFromData(this.data);
    this.initializationTime = new Date(this.currentTime.getTime());
    //Update at most, once a second (if more than five minutes normal time pass in that second)
    if(this.data.timeMultiplier != 0.0){
      this.hasLinearInterpolation = true;
      var interpolationLengthInSeconds = 300.0 > this.data.timeMultiplier ? 300.0 / this.data.timeMultiplier : 1.0;

      this.interpolator = new aSkyInterpolator(this.initializationTime, this.data.timeMultiplier, interpolationLengthInSeconds, this.dynamicSkyObj, this.data);

      //All of our interpolation hookups occur here
      this.interpolator.setLinearInterpolationForScalar('sunAzimuth', ['sunPosition', 'azimuth'], false,);
      this.interpolator.setLinearInterpolationForScalar('sunAltitude', ['sunPosition', 'altitude'], false);
      this.interpolator.setAngularLinearInterpolationForScalar('localSiderealTime', ['localApparentSiderealTimeForUniform'], false);

      this.interpolator.setLinearInterpolationForScalar('moonAzimuth', ['moonPosition', 'azimuth'], false,);
      this.interpolator.setLinearInterpolationForScalar('moonAltitude', ['moonPosition', 'altitude'], false);
      this.interpolator.setLinearInterpolationForScalar('moonEE', ['moonEE'], false);
      this.interpolator.setSLERPFor3Vect('moonMappingTangentSpaceSunlight', ['moonMappingTangentSpaceSunlight'], false);
      this.interpolator.setSLERPFor3Vect('moonMappingPosition', ['moonMappingPosition'], false);
      this.interpolator.setSLERPFor3Vect('moonMappingTangent', ['moonMappingTangent'], false);
      this.interpolator.setSLERPFor3Vect('moonMappingBitangent', ['moonMappingBitangent'], false);

      //Once all of these are set up - prime the buffer the first time.
      this.interpolator.primeBuffer();
    }
    else{
      this.hasLinearInterpolation = false;
    }
  },

  update: function () {
    this.fractionalSeconds = 0;
  },

  tick: function (time, timeDelta) {
    //Standard Sky Animations
    this.el.components.material.material.uniforms.uTime.value = time;

    //Interpolated Sky Position Values
    if(this.hasLinearInterpolation){
      this.currentTime.setTime(this.initializationTime.getTime() + time * this.data.timeMultiplier);

      var interpolatedValues = this.interpolator.getValues(this.currentTime);

      this.el.components.material.material.uniforms.sunPosition.value.set(interpolatedValues.sunAzimuth, interpolatedValues.sunAltitude);
      this.el.components.material.material.uniforms.localSiderealTime.value = interpolatedValues.localSiderealTime;

      var mtss = interpolatedValues.moonMappingTangentSpaceSunlight;
      var mp = interpolatedValues.moonMappingPosition;
      var mmt = interpolatedValues.moonMappingTangent;
      var mmb = interpolatedValues.moonMappingBitangent;

      this.el.components.material.material.uniforms.moonTangentSpaceSunlight.value.set(mtss.x, mtss.y, mtss.z);
      this.el.components.material.material.uniforms.moonAzimuthAndAltitude.value.set(interpolatedValues.moonAzimuth, interpolatedValues.moonAltitude);
      this.el.components.material.material.uniforms.moonEE.value = interpolatedValues.moonEE;
      this.el.components.material.material.uniforms.moonPosition.value.set(mp.x, mp.y, mp.z);
      this.el.components.material.material.uniforms.moonTangent.value.set(mmt.x, mmt.y, mmt.z);
      this.el.components.material.material.uniforms.moonBitangent.value.set(mmb.x, mmb.y, mmb.z);
    }
  }
});



var aSkyInterpolator = function(initializationTime, timeMultiplier, interpolationLengthInSeconds, dynamicSkyObject, originalSkyData){
  var self = this;
  this.skyDataObjects = [];
  this.skyDataTimes = [];

  //This is a means of updating our sky time so that we can set our dynamic sky objects
  //to the correct positions in the sky...
  this.skyDataFromTime = function(time, timerID){
    //Clone our sky data
    if(self.skyDataObjects[timerID] === undefined){
      self.skyDataObjects[timerID] = JSON.parse(self.skyDataObjectString);
    }
    if(self.skyDataTimes[timerID] === undefined){
      self.skyDataTimes[timerID] = self.initializationTime.getTime();
    }
    var skyDataClone = self.skyDataObjects[timerID];

    //Get the difference between the time provided and the initial time for our function
    //We divide by 1000 because this returns the difference in milliseconds
    var timeDiffInSeconds = (time.getTime() - self.skyDataTimes[timerID]) / 1000.0;
    self.skyDataTimes[timerID] = time.getTime();
    skyDataClone.timeOffset += timeDiffInSeconds;

    if(skyDataClone.timeOffset > 86400.0){
      //It's a new day!
      skyDataClone.dayOfTheYear += 1;
      skyDataClone.timeOffset = skyDataClone.timeOffset % 86400.00;
      if(skyDataClone.dayOfTheYear > skyDataClone.yearPeriod){
        //Reset everything! But presume we're on the same day
        //TODO: I doubt this will run for longer than a single year, but we might need to reset the year period...
        skyDataClone.dayOfTheYear = 1;
        skyDataClone.year += 1;
      }
    }

    //Update the string in use
    return skyDataClone;
  };

  //A way of diving deep into a variable to hunt for nested values
  this.searchForVariable = function(objectPathRef, nestedArray){
    var objectPath = objectPathRef.slice(0); //We wish to copy this, we're not after the original

    var returnValue = null;
    if(objectPath.length > 1){
      var currentVarName = objectPath.shift();
      returnValue = self.searchForVariable(objectPath, nestedArray[currentVarName]);
    }
    else{
      returnValue = nestedArray[objectPath[0]];
    }

    return returnValue;
  };

  //
  //Methods that set our interpolations
  //
  this.setSLERPFor3Vect = function(name, objectPath, isBuffered, callback = false){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var vec_0 = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0).clone();
    var vec_f = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f).clone();

    var timeNormalizer = 1.0 / (t_f - t_0);
    var omega = vec_0.angleTo(vec_f);
    var vec_0_array = vec_0.toArray();
    var vec_f_array = vec_f.toArray();
    var coeficient_a = [];
    var coeficient_b = [];
    for(var i = 0; i < vec_0_array.length; i++){
      coeficient_a.push(vec_0_array[i] / Math.sin(omega));
      coeficient_b.push(vec_f_array[i] / Math.sin(omega));
    }

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setSLERPFor3Vect,
      callback: callback,
      coeficient_a: coeficient_a,
      coeficient_b: coeficient_b,
      omega: omega,
      timeNormalizer: timeNormalizer,
      t_0: t_0,
      interpolate: callback ? function(time){
        var normalizedTime = (time - this.t_0) * this.timeNormalizer;
        var slerpArray= [];
        for(var i = 0; i < coeficient_a.length; i++){
          slerpArray.push((Math.sin((1 - normalizedTime) * this.omega) * this.coeficient_a[i]) + Math.sin(normalizedTime * this.omega) * this.coeficient_b[i]);
        }
        var returnVect = new THREE.Vector3(slerpArray[0], slerpArray[1],  slerpArray[2]);
        return this.callback(returnVect);
      } : function(time){
        var normalizedTime = (time - this.t_0) * this.timeNormalizer;
        var slerpArray= [];
        for(var i = 0; i < coeficient_a.length; i++){
          slerpArray.push((Math.sin((1 - normalizedTime) * this.omega) * this.coeficient_a[i]) + Math.sin(normalizedTime * this.omega) * this.coeficient_b[i]);
        }
        var returnVect = new THREE.Vector3(slerpArray[0], slerpArray[1],  slerpArray[2]);
        return returnVect;
      }
    };
  };

  //Presumes that values are over a full circle, possibly offset below like with -180
  this.setAngularLinearInterpolationForScalar = function(name, objectPath, isBuffered, callback = false, offset = 0){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var x_0 = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0)));
    var x_f = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f)));

    function modulo(a, b){
      return (a - Math.floor(a/b) * b);
    }

    var offset = offset;
    var offsetX0 = x_0 + offset;
    var offsetXF = x_f + offset;
    var diff = offsetXF - offsetX0;
    var angularDifference = modulo((diff + Math.PI), (2.0 * Math.PI)) - Math.PI;
    var timeNormalizer = 1.0 / (t_f - t_0);

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setAngularLinearInterpolationForScalar,
      callback: callback,
      offset: offset,
      offsetX0: offsetX0,
      interpolate: callback ? function(time){
        var returnVal = offsetX0 + (time - t_0) * timeNormalizer * angularDifference;
        returnVal = returnVal - offset;
        return this.callback(returnVal);
      } : function(time){
        var returnVal = offsetX0 + (time - t_0) * timeNormalizer * angularDifference;
        returnVal = returnVal - offset;
        return returnVal;
      }
    };
  };

  this.setLinearInterpolationForScalar = function(name, objectPath, isBuffered, callback = false){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var x_0 = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0)));
    var x_f = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f)));

    var slope = (x_f - x_0) / (t_f - t_0);
    var intercept = x_0 - slope * t_0;

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setLinearInterpolationForScalar,
      slope: slope,
      intercept: intercept,
      callback: callback,
      interpolate: callback ? function(time){
        return this.callback(this.slope * time + this.intercept);
      } : function(time){
        return (this.slope * time + this.intercept);
      }
    };
  };

  this.setLinearInterpolationForVect = function(name, objectPath, isBuffered, callback = false){
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var vec_0 = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0).toArray();
    var vec_f = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f).toArray();

    var slope = [];
    var intercept = [];
    var slopeDenominator = 1.0 / (t_f - t_0);
    var vectorLength = vec_0.length;
    for(var i = 0; i < vectorLength; i++){
      slope.push((vec_f[i] - vec_0[i]) * slopeDenominator);
      intercept.push(vec_0[i] - slope[i] * t_0);
    }

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setLinearInterpolationForVect,
      callback: callback,
      slope: slope.splice(0),
      intercept: intercept.splice(0),
      interpolate: callback ? function(time){
        var returnArray = [];
        for(i = 0; i < vectorLength; i++){
          returnArray.push(this.slope[i] * time + this.intercept[i]);
        }

        var returnVect;
        if(vectorLength == 2){
          returnVect = new THREE.Vector2(returnArray[0], returnArray[1]);
        }
        else if(vectorLength == 3){
          returnVect = new THREE.Vector3(returnArray[0], returnArray[1],  returnArray[2]);
        }
        else{
          returnVect = new THREE.Vector4(returnArray[0], returnArray[1],  returnArray[2], returnArray[3]);
        }

        return this.callback(returnVect);
      } : function(time){
        var returnArray = [];
        for(i = 0; i < vectorLength; i++){
          returnArray.push(this.slope[i] * time + this.intercept[i]);
        }

        var returnVect;
        if(vectorLength == 2){
          returnVect = new THREE.Vector2(returnArray[0], returnArray[1]);
        }
        else if(vectorLength == 3){
          returnVect = new THREE.Vector3(returnArray[0], returnArray[1],  returnArray[2]);
        }
        else{
          returnVect = new THREE.Vector4(returnArray[0], returnArray[1],  returnArray[2], returnArray[3]);
        }

        return returnVect;
      }
    };
  };

  //
  //This is the big one, the method that we call repeatedly to give us the values we want
  //it mostly just runs a bunch of linear functions - one for each of our uniforms
  //in order to create an interpolated sky. On occasion, it also requests a new set of interpolations
  //after cloning the cached interpolation set.
  //
  this.getValues = function(time){
    //In the event that the time falls outside of or current range
    //swap the buffer with the current system and update our times
    //and clear the buffer.
    var requestBufferUpdate = false;

    if(time > self.finalTime){
      //Supposedly pretty quick and dirty, even though a built in clone method would work better
      self.currentInterpolations = cloner.deep.copy(self.bufferedInterpolations);
      requestBufferUpdate = true;
    }

    //Create an object with all the values we're interpolating
    var interpolatedValues = {};
    for(var varName in self.currentInterpolations){
      var outVarValue = self.currentInterpolations[varName].interpolate((time.getTime())/1000.0);
      interpolatedValues[varName] = outVarValue;
    }

    if(self.bufferHasRunForTesting && self.numberOfTestRuns < 10){
      self.numberOfTestRuns += 1;
    }

    //Prime the buffer again if need be.
    if(requestBufferUpdate){
      //Presumes the buffer is within range of the next time object
      self.initialTime = new Date(time.getTime());
      self.finalTime = new Date(time.getTime() + self.interpolationLengthInSeconds * 1000.0 * self.timeMultiplier);
      self.bufferedTime = new Date(self.finalTime.getTime() + self.interpolationLengthInSeconds * 1000.0 * self.timeMultiplier);

      self.primeBuffer();
    }

    //Return this object the values acquired
    return interpolatedValues;
  };

  this.primeBuffer = async function(){
    //Change the adynamic sky function to five minutes after the final time
    var skytime_0 = self.skyDataFromTime(self.finalTime, 2);
    var skytime_f = self.skyDataFromTime(self.bufferedTime, 3);
    self.dynamicSkyObjectAt_t_0.update(skytime_0);
    self.dynamicSkyObjectAt_t_f.update(skytime_f);

    //create new interpolations for all the functions in the linear interpolations list
    //Note that we cannot buffer anything that isn't in current.
    for(var name in self.currentInterpolations) {
      //Create buffered interpolations for use in the next go round
      if(self.currentInterpolations[name].callback){
        self.currentInterpolations[name].setFunction(name, self.currentInterpolations[name].objectPath, true, self.currentInterpolations[name].callback);
      }
      else{
        self.currentInterpolations[name].setFunction(name, self.currentInterpolations[name].objectPath, true);
      }
    }

    self.bufferHasRunForTesting = true;
  };

  //Prepare our function before we initialize everything.
  this.timeMultiplier = timeMultiplier;
  this.interpolationLengthInSeconds = interpolationLengthInSeconds;
  this.interpolationCount = 1;
  this.initializationTime = initializationTime;
  this.initializationMilliseconds = initializationTime.getTime();
  this.initialTime =new Date(initializationTime.getTime());
  this.finalTime = new Date(initializationTime.getTime() + interpolationLengthInSeconds * this.timeMultiplier * 1000.0);
  this.bufferedTime = new Date(initializationTime.getTime() + interpolationLengthInSeconds * this.timeMultiplier * 2000.0);

  //Clone our dynamic sky object for the purposes of linear interpolation
  //And set them to the initial and final time with all other variables
  //held constant...
  this.skyDataObjectString = JSON.stringify(originalSkyData);

  this.dynamicSkyObjectAt_t_0 = cloner.deep.copy(dynamicSkyObject);
  this.dynamicSkyObjectAt_t_0.update(this.skyDataFromTime(this.initialTime, 0));
  this.dynamicSkyObjectAt_t_f = cloner.deep.copy(dynamicSkyObject);
  this.dynamicSkyObjectAt_t_f.update(this.skyDataFromTime(this.finalTime, 1));

  this.currentInterpolations = {};
  this.bufferedInterpolations = {};

  self.numberOfTestRuns = 1;
  self.bufferHasRunForTesting = false;
}
