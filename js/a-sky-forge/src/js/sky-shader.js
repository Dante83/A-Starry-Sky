//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
AFRAME.registerShader('sky', {
  schema: {
    luminance: { type: 'number', default: 1, max: 0, min: 2, is: 'uniform' },
    turbidity: { type: 'number', default: 2, max: 0, min: 20, is: 'uniform' },
    reileigh: { type: 'number', default: 1, max: 0, min: 4, is: 'uniform' },
    mieCoefficient: { type: 'number', default: 0.005, min: 0, max: 0.1, is: 'uniform' },
    mieDirectionalG: { type: 'number', default: 0.8, min: 0, max: 1, is: 'uniform' },
    sunPosition: { type: 'vec2', default: {x: 0.0,y: 0.0}, is: 'uniform' },
    moonAzAltAndParallacticAngle: {type: 'vec3', default: {x: 0.0,y: 0.0,z: 0.0}, is: 'uniform'},
    illuminatedFractionOfMoon: {type: 'number', default: 0.0, max: 1.0, min: 0.0, is: 'uniform'},
    brightLimbOfMoon: {type: 'number', default: 0.0, max: 6.283185307, min: 0.0, is: 'uniform'},
    moonTexture: {type: 'map', src:'../images/moon-dif-512.png', is: 'uniform'},
    moonNormalMap: {type: 'map', src:'../images/moon-nor-512.png', is: 'uniform'},
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
    'varying vec3 tangentSpaceSunlight;',

    '//For calculating the solar and and lunar data',
    'uniform mediump vec2 sunPosition;',
    'uniform mediump vec3 moonAzAltAndParallacticAngle;',

    '//Thanks Wolfram Alpha!',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float pi = 3.141592653589793238462643383279502884197169;',
    'const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;',
    'const float piOver2 = 1.5707963267948966192313216916397514420985846996875529;',
    'const float deg2Rad = 0.017453292519943295769236907684886127134428718885417254560;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
      'vWorldPosition = worldPosition.xyz;',

      '//',
      '//LUNAR SHADOWS',
      '//',

      '//Let us break this out into components',
      'float mAltitude = moonAzAltAndParallacticAngle.y;',
      'float mAzimuth = moonAzAltAndParallacticAngle.x;',

      '//TODO: Something is still off here, but we will come back to this in the future...',

      '//Calculate the normal and binormal from the surface of a sphere using a radius of 1.0 then invert it by multiplying everything by -1.0',
      'vec3 faceNormal = normalize(vec3(sin((pi / 2.0) - mAltitude) * cos(mAzimuth), sin((pi / 2.0) - mAltitude) * sin(mAzimuth), cos(mAzimuth)));',
      '//Because were centered at the origin, we can just get the cross product of the noraml vector and the z-axis.',
      '//Via: https://math.stackexchange.com/questions/1112719/get-tangent-vector-from-point-to-sphere-vector',
      '//NOTE: We should probably rotate the tangent and bitangent by the parallactic angle to preserve shading under rotation',

      '//Note: We pass in a UV attribute, perhaps we should use these vectors to determine our tangent, bitangent and normal vectors?',
      'vec3 faceTangent = normalize(vec3(sin(mAltitude) * cos(mAzimuth), sin(mAltitude) * sin(mAzimuth), cos(mAzimuth)));',
      'vec3 faceBitangent = normalize(cross(faceNormal, faceTangent));//And then we are going to cross the two to get our bi-vector',
      '//vec3 faceBinormal = normalize(cross(faceNormal, faceTangent));//And then we are going to cross the two to get our bi-vector',

      'mat3 toTangentSpace = mat3(',
          'faceTangent.x, faceBitangent.x, faceNormal.x,',
          'faceTangent.y, faceBitangent.y, faceNormal.y,',
          'faceTangent.z, faceBitangent.z, faceNormal.z',
      ');',

      '//Convert our solar position into x, y and z coordinates -- we are going to put this at 5000 meters just to align with our sphere.',
      'float solarAzimuth = sunPosition.x;',
      'float solarAltitude = sunPosition.y;',
      'float solarTheta = (pi - (solarAltitude + piOver2)) - piOver2;',
      'float solarXCoordinates = 1.0 * sin(solarTheta) * cos(solarAltitude);',
      'float solarYCoordinates = 1.0 * sin(solarTheta) * sin(solarAltitude);',
      'float solarZCoordinates = 1.0 * cos(solarTheta);',
      'vec3 normalizedSolarCoordinates = normalize(vec3(solarXCoordinates, solarYCoordinates, solarZCoordinates));',

      '//All of this lighting happens very far away, so we dont have to worry about our camera position',
      'tangentSpaceSunlight = toTangentSpace * normalizedSolarCoordinates;',

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

    'const float EE = 1000.0;',

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
    'const float angularRadiusOfTheSun = 0.074; //The sun and the moon should be able the same size',

    '//',
    '//NOTE: These values are interpolated, so we are probably not getting the values',
    '//NOTE: we think we are getting. We would have to uninterpolate them and that would really',
    '//NOTE: stink.',
    '//',
    '//Sky Surface data',
    'varying vec3 normal;',
    'varying vec2 binormal;',

    '//Moon Data',
    'uniform mediump vec3 moonAzAltAndParallacticAngle;',
    'uniform float brightLimbOfMoon;',
    'uniform float illuminatedFractionOfMoon;',
    'uniform sampler2D moonTexture;',
    'uniform sampler2D moonNormalMap;',
    'const float angularRadiusOfTheMoon = 0.075;',
    'varying vec3 tangentSpaceSunlight;',
    'const float earthshine = 0.02;',

    '//Earth data',
    'uniform vec2 latLong;',
    'uniform float localSiderealTime;',

    '//',
    '//UTIL FUNCTIONS',
    '//',

    'int modulo(float a, float b){',
      'return int(a - (b * floor(a/b)));',
    '}',

    'float fModulo(float a, float b){',
      'return (a - (b * floor(a / b)));',
    '}',

    '//This converts our local sky coordinates from azimuth and altitude',
    '//into ra and dec, which is useful for picking out stars',
    '//With a bit of help from https://mathematica.stackexchange.com/questions/69330/astronomy-transform-coordinates-from-horizon-to-equatorial',
    '//Updated with help from https://en.wikipedia.org/wiki/Celestial_coordinate_system',
    'vec2 getRaAndDec(float az, float alt){',
      'float declination = asin(sin(latLong.x) * sin(alt) - cos(latLong.x) * cos(alt) * cos(az));',
      'float hourAngle = atan(sin(az), (cos(az) * sin(latLong.x) + tan(alt) * cos(latLong.x)));',
      'float rightAscension = localSiderealTime - hourAngle;',

      'return vec2(rightAscension, declination);',
    '}',

    '//This is useful for converting our values from rgb colors into floats',
    'float rgba2Float(vec4 colorIn){',
      'vec4 colorIn255bits = floor(colorIn * 255.0);',

      'int floatSign = (modulo(colorIn255bits.a, 2.0)) == 0 ? -1 : 1;',
      'float floatExponential = float(((int(colorIn255bits.a)) / 2) - 64);',
      'float floatValue = float(floatSign) * (colorIn255bits.r * 256.0 * 256.0 + colorIn255bits.g * 256.0 + colorIn255bits.b) * pow(10.0, floatExponential);',

      'return floatValue;',
    '}',

    '//This fellow is useful for the disks of the sun and the moon',
    '//and the glow of stars... It is fast and efficient at small angles',
    'vec3 angularDistanceApproximation(float az_0, float alt_0, float az_1, float alt_1){',
      '//There is a chance that our compliment (say moon at az_0 at 0 degree and az_2 at 364.99)',
      '//Results in an inaccurately large angle, thus we must check the compliment in addition to',
      '//our regular diff.',
      'float deltaAZ = az_0 - az_1;',
      'float compliment = -1.0 * max(2.0 * pi - abs(deltaAZ), 0.0) * sign(deltaAZ);',
      'deltaAZ = abs(deltaAZ) < abs(compliment) ? deltaAZ : compliment;',

      '//Luckily we don not need to worry about this compliment stuff here because alt only goes between -pi and pi',
      'float diff2 = alt_1 - alt_0;',

      '//Presuming that most of our angular objects are small, we will simply use',
      '//this simple approximation... http://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/',
      'float deltaAlt = diff2;',
      'return vec3(deltaAZ, deltaAlt, sqrt(deltaAZ * deltaAZ + deltaAlt * deltaAlt));',
    '}',

    '//This function combines our colors so that different layers can exist at the right locations',
    'vec4 addImageWithAveragedEdge(vec4 imageColor, vec4 backgroundColor){',
      'return imageColor.a > 0.95 ? vec4(imageColor.rgb, 1.0) : vec4(mix(imageColor.xyz, backgroundColor.xyz, (1.0 - imageColor.w)), 1.0);',
    '}',

    '//',
    '//SUN',
    '//',
    'vec4 drawSunLayer(float azimuthOfPixel, float altitudeOfPixel){',
      'vec3 positionData = angularDistanceApproximation(sunPosition.x, sunPosition.y, azimuthOfPixel, altitudeOfPixel);',

      'vec4 returnColor = vec4(0.0);',
      'if(positionData.z < angularRadiusOfTheSun){',
        '//For now we will just return the color white -- in the future we will probably use a better model for the inner sunlight...',
        'returnColor = vec4(1.0, 0.85, 0.0, 1.0);',
      '}',

      'return returnColor;',
    '}',

    '//',
    '//MOON',
    '//',

    'vec4 drawMoonLayer(float azimuthOfPixel, float altitudeOfPixel){',
      '//Let us use the small angle approximation of this for now, in the future, we might Implement',
      'vec3 positionData = angularDistanceApproximation(moonAzAltAndParallacticAngle.x, moonAzAltAndParallacticAngle.y, azimuthOfPixel, altitudeOfPixel);',

      '//Well, really 2x the angular radius of the moon because we wanna see it for now...',
      'vec4 returnColor = vec4(0.0);',

      'if(positionData.z < angularRadiusOfTheMoon){',
        '//Hey! We are in the moon! convert our distance into a linear interpolation',
        '//of half pixel radius on our sampler',
        '//float altAzimuthOfPixel = 2.0 * pi - abs(azimuthOfPixel);',
        '//azimuthOfPixel = azimuthOfPixel <= altAzimuthOfPixel ? azimuthOfPixel : -1.0 * altAzimuthOfPixel;',
        'vec2 position = (positionData.xy + vec2(angularRadiusOfTheMoon)) / (2.0 * angularRadiusOfTheMoon);',
        '//TODO: If we want to utilize rotations, we should multiply this by an appropriate rotation matrix first!',

        '//Now to grab that color!',
        'vec4 moonColor = texture2D(moonTexture, position.xy);',

        '//Get the moon shadow using the normal map (if it exists) - otherwise use the bright limb stuff',
        '//Thank you, https://beesbuzz.biz/code/hsv_color_transforms.php!',
        'vec3 moonSurfaceNormal = 2.0 * texture2D(moonNormalMap, position.xy).rgb - 1.0;',

        '//The moon is presumed to be a lambert shaded object, as per:',
        '//https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Diffuse_Reflection',
        'moonColor = vec4(moonColor.rgb * max(earthshine, dot(moonSurfaceNormal, tangentSpaceSunlight)), moonColor.a);',

        'returnColor = moonColor;',
      '}',

      '//Otherwise, we shall return nothing for now. In the future, perhaps we will implement the',
      'return returnColor;',
    '}',

    'vec4 drawStar(vec2 raAndDec, vec2 raAndDecOfStar, float magnitudeOfStar, vec3 starColor){',
      'float maxRadiusOfStar = (2.0/360.0) * piTimes2;',
      'float normalizedMagnitude = (7.96 - (magnitudeOfStar + 1.46)) / 7.96;',
      'float radiusOfStar = clamp(maxRadiusOfStar * normalizedMagnitude, 0.0, 1.0);',

      '//',
      '//NOTE: We should probably avoid our movement twinkling and the color mix of the sky in colorOfSky shoud',
      '//probably come from the background of the skies refractive angle and original sky color (at dusk and dawn)',
      '//and not remain a constant.',
      '//',

      'vec3 positionData = angularDistanceApproximation(raAndDec.x, raAndDec.y, raAndDecOfStar.x, raAndDecOfStar.y);',
      'vec4 returnColor = vec4(0.0);',
      'if(positionData.z < radiusOfStar){',
        'float lightness = exp(1.5 * 7.96 * ((radiusOfStar - positionData.z)/radiusOfStar)) / exp(1.5 * 7.96);',
        'vec3 colorOfSky = vec3(0.1, 0.2, 1.0);',
        'vec3 colorOfPixel = mix(mix(starColor, colorOfSky, (radiusOfStar - positionData.z)/(1.2 * radiusOfStar)), vec3(1.0), lightness);',
        'returnColor = vec4(colorOfPixel, lightness);',
      '}',

      'return returnColor;',
    '}',

    '//',
    '//STARS',
    '//',
    'vec4 drawStarLayer(float azimuthOfPixel, float altitudeOfPixel){',
      'int padding = 5; //Should be the same as the value used to create our image in convert_stars_to_image.py',
      'int scanWidth = 2 * padding + 1;',
      'int paddingSquared = scanWidth * scanWidth;',

      '//Convert our ra and dec varying into pixel coordinates.',
      'vec2 raAndDecOfPixel = getRaAndDec(azimuthOfPixel, altitudeOfPixel);',
      'float pixelRa = raAndDecOfPixel.x;',
      'float pixelDec = raAndDecOfPixel.y;',

      'pixelRa = azimuthOfPixel;',
      'pixelDec = altitudeOfPixel;',

      '//float normalizedpixelRa = pixelRa / piTimes2;',
      '//float normalizedpixelDec = (pixelDec + piOver2) / pi;',

      'highp float activeImageWidth = float(starDataImgWidth - 2 * padding); //Should be 502',
      'highp float activeImageHeight = float(starDataImgHeight - 2 * padding); //Should be 246',
      'highp float normalizedRa = pixelRa / piTimes2;',
      'highp float normalizedDec = (pixelDec + piOver2) / pi;',

      '//We will include all texture components over a certain range so we might as well start at 0',
      'highp float startingPointX = activeImageWidth * normalizedRa;',
      'highp float startingPointY = activeImageHeight * normalizedDec;',

      '//return vec4(vec3(normalizedDec), 1.0);',

      '//Main draw loop',
      'vec4 returnColor = vec4(0.0);',
      'for(highp int i = 0; i <= 10; ++i){',
        'for(highp int j = 0; j <= 10; ++j){',
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
            'returnColor = addImageWithAveragedEdge(drawStar(vec2(pixelRa, pixelDec), vec2(starRa, starDec), magnitude, starColor), returnColor);',
          '}',
        '}',
      '}',

      'return returnColor;',
    '}',

    '//',
    '//SKY',
    '//',

    'vec3 totalRayleigh(vec3 lambda)',
    '{',
      'return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));',
    '}',

    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',
    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',
    'vec3 simplifiedRayleigh()',
    '{',
      'return 0.0005 / vec3(94, 40, 18);',
    '}',

    'float rayleighPhase(float cosTheta)',
    '{',
      'return (3.0 / (16.0*pi)) * (1.0 + pow(cosTheta, 2.0));',
    '}',

    'vec3 totalMie(vec3 lambda, vec3 K, float T)',
    '{',
      'float c = (0.2 * T ) * 10E-18;',
      'return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;',
    '}',

    'float hgPhase(float cosTheta, float g)',
    '{',
      'return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));',
    '}',

    'float sunIntensity(float zenithAngleCos)',
    '{',
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

    'vec3 Uncharted2Tonemap(vec3 x)',
    '{',
      'return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;',
    '}',

    'vec4 drawSkyLayer(float azimuthOfPixel, float altitudeOfPixel){',
      '//Get the fading of the sun and the darkening of the sky',
      '//TODO: Come back here and decide how to get sunPosition.y',
      'float sunAz = sunPosition.x;',
      'float sunAlt = sunPosition.y;',
      'float zenithAngle = pi - sunAlt;',
      'float sunX = cos(zenithAngle);',
      'float sunY = sin(zenithAngle);',
      'float sunZ = cos(sunAz);',
      'float heightOfSunInSky = 5000.0 * sin(sunAlt); //5000.0 is presumed to be the radius of our sphere',
      'float sunfade = 1.0-clamp(1.0-exp(heightOfSunInSky/5000.0),0.0,1.0);',
      'float reileighCoefficient = reileigh - (1.0 * (1.0-sunfade));',

      '//Get the sun intensity',
      '//Using dot(a,b) = ||a|| ||b|| * cos(a, b);',
      '//Here, the angle between up and the sun direction is always the zenith angle',
      '//Note in the original code, we normalized the sun direction at this point so that',
      '//the magnitude of that vector will always be one.',
      '//while',
      'vec3 floatSunPosition = normalize(vec3(sunX, sunY, sunZ));',
      'float dotOfSunDirectionAndUp = dot(floatSunPosition, up);',
      'float sunE = sunIntensity(dotOfSunDirectionAndUp);',

      '//Acquire betaR and betaM',
      'vec3 betaR = simplifiedRayleigh() * reileighCoefficient;',
      'vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;',

      '// Get the current optical length',
      '// cutoff angle at 90 to avoid singularity in next formula.',
      '//presuming here that the dot of the sun direction and up is also cos(zenith angle)',
      'float sR = rayleighZenithLength / (dotOfSunDirectionAndUp + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));',
      'float sM = mieZenithLength / (dotOfSunDirectionAndUp + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));',

      '// combined extinction factor',
      'vec3 Fex = exp(-(betaR * sR + betaM * sM));',

      '// in scattering',
      '//TODO: Come back here and decide how we shoud calculate cosTheta using angles, right now I am using vec3(0.0) as camera position',
      'float cosTheta = dot(normalize(vWorldPosition - vec3(0.0)), floatSunPosition);',

      'float rPhase = rayleighPhase(cosTheta*0.5+0.5);',
      'vec3 betaRTheta = betaR * rPhase;',

      'float mPhase = hgPhase(cosTheta, mieDirectionalG);',
      'vec3 betaMTheta = betaM * mPhase;',

      'vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex),vec3(1.5));',
      'Lin *= mix(vec3(1.0),pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0));',

      '//nightsky',
      '//TODO This would be a great place to figure out our phi and theta and stuff back into dots',
      'vec2 uv = vec2(azimuthOfPixel, (piOver2 - altitudeOfPixel)) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);',
      'vec3 L0 = vec3(0.1) * Fex;',

      '//Solar disk stuff, we really need to split this apart between here and the sun stuff above',
      'float sunAngularDiameterCos = cos(angularRadiusOfTheSun);',
      'float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);',
      'L0 += (sunE * 19000.0 * Fex)*sundisk;',

      'vec3 texColor = (Lin+L0);',
      'texColor *= 0.04 ;',
      'texColor += vec3(0.0,0.001,0.0025)*0.3;',

      'float g_fMaxLuminance = 1.0;',
      'float fLumScaled = 0.1 / luminance;',
      'float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);',

      'float ExposureBias = fLumCompressed;',

      'vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));',
      'vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);',
      'vec3 color = curr*whiteScale;',

      'vec3 retColor = pow(color,vec3(1.0/(1.2+(1.2*sunfade))));',

      'return vec4(retColor, 1.0);',
    '}',

    '//',
    '//Draw main loop',
    '//',
    'void main()',
    '{',
      'vec3 pointCoord = normalize(vWorldPosition.xyz);',
      'float altitude = piOver2 - acos(pointCoord.y);',
      'float azimuth = atan(pointCoord.z, pointCoord.x) + pi;',

      '//Starting color is black, the color of space!',
      'vec4 color = vec4(0.0,0.0,0.0,1.0);',

      '//As the the most distant objects in our world, we must draw our stars first',
      'color = addImageWithAveragedEdge(drawStarLayer(azimuth, altitude), color);',

      '//Then comes the sun',
      '//TODO: We need to branch our our solar disk frome below to here so that we never accidently draw the moon behind the sun',
      '//But the glowing stuff can go in front of our sky - but will probably go behind clouds if we add them.',
      'color = addImageWithAveragedEdge(drawSunLayer(azimuth, altitude), color);',

      '//And finally the moon...',
      'color = addImageWithAveragedEdge(drawMoonLayer(azimuth, altitude), color);',

      '//',
      '//The astronomical stuff is now done, so we should be able to proceed with stuff like the glow of the sky.',
      '//',

      '//Once we have draw each of these, we will add their light to the light of the sky in the original sky model',
      '//TODO: Implement having this tint the sky rather than paint over the top of it, so that all of our objects shine through it',
      '//Rather than being covered by it',
      'color = addImageWithAveragedEdge(drawSkyLayer(azimuth, altitude), color);',

      '//And then we will add the glow of the sun, moon and stars...',


      '//This is where we would put clouds if the GPU does not turn to molten silicon',


    '	gl_FragColor = color;',
    '}',
  ].join('\n')
});
