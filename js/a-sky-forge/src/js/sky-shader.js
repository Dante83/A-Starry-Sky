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
    sunPosition: { type: 'vec3', default: {x: 0.0,y: 0.0,z: 0.0}, is: 'uniform' },
    moonAzAltAndParallacticAngle: {type: 'vec3', default: {x: 0.0,y: 0.0,z: 0.0}, is: 'uniform'},
    illuminatedFractionOfMoon: {type: 'number', default: 0.0, max: 1.0, min: 0.0, is: 'uniform'},
    brightLimbOfMoon: {type: 'number', default: 0.0, max: 6.283185307, min: 0.0, is: 'uniform'},
    moonTexture: {type: 'map', src:'images/moon-dif-512.png', is: 'uniform'},
    moonNormalMap: {type: 'map', src:'moon-nor-512.png', is: 'uniform'},
    starData: {type: 'map', src:'', is: 'uniform'},
    u_resolution: {type: 'vec2', default: {x: 1280, y: 720}, is: 'uniform'}
  },

  vertexShader: [
    'varying vec3 vWorldPosition;',
    'varying vec3 tangentSpaceSunlight;',

    '//For calculating the stellar positions',
    'uniform mediump float apparentSideRealTime;',
    'uniform mediump float localLatitude;',
    'attribute int starArrayLength;',
    'attribute mediump float[] starRAS;',
    'attribute mediump float[] starDECs;',
    'attribute mediump float[] starBrightness;',
    'attribute mediump vec3[] starColors;',

    'varying int frag_starArrayLength;',
    'varying mediump float[] starAzs;',
    'varying mediump float[] starAlts;',
    'varying mediump float[] frag_starBrightness;',
    'varying mediump vec3[] frag_starColors;',

    '//For calculating the solar and and lunar data',
    'uniform mediump vec3 sunPosition;',
    'uniform mediump vec3 moonAzAltAndParallacticAngle;',

    '//Thanks Wolfram Alpha!',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float pi = 3.141592653589793238462643383279502884197169;',
    'const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;',
    'const float deg2Rad = 0.017453292519943295769236907684886127134428718885417254560;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
      'vWorldPosition = worldPosition.xyz;',

      '//Let us break this out into components',
      'float altitude = moonAzAltAndParallacticAngle.y;',
      'float azimuth = moonAzAltAndParallacticAngle.x;',

      '//',
      '//LUNAR SHADOWS',
      '//',

      '//TODO: Something is still off here, but we will come back to this in the future...',

      '//Calculate the normal and binormal from the surface of a sphere using a radius of 1.0 then invert it by multiplying everything by -1.0',
      'vec3 faceNormal = normalize(vec3(sin((pi / 2.0) - altitude) * cos(azimuth), sin((pi / 2.0) - altitude) * sin(azimuth), cos(azimuth)));',
      '//Because were centered at the origin, we can just get the cross product of the noraml vector and the z-axis.',
      '//Via: https://math.stackexchange.com/questions/1112719/get-tangent-vector-from-point-to-sphere-vector',
      '//NOTE: We should probably rotate the tangent and bitangent by the parallactic angle to preserve shading under rotation',

      'vec3 faceTangent = normalize(vec3(sin(-altitude) * cos(azimuth), sin(- altitude) * sin(azimuth), cos(azimuth)));',
      'vec3 faceBitangent = normalize(cross(faceNormal, faceTangent));//And then we are going to cross the two to get our bi-vector',
      '//vec3 faceBinormal = normalize(cross(faceNormal, faceTangent));//And then we are going to cross the two to get our bi-vector',

      'mat3 toTangentSpace = mat3(',
          'faceTangent.x, faceBitangent.x, faceNormal.x,',
          'faceTangent.y, faceBitangent.y, faceNormal.y,',
          'faceTangent.z, faceBitangent.z, faceNormal.z',
      ');',

      '//All of this lighting happens very far away, so we dont have to worry about our camera position',
      'tangentSpaceSunlight = toTangentSpace * sunPosition;',

      '//',
      '//STAR DATA CONVERSION',
      '//',

      '//Go through each of our stars and convert them into an azimuth and altitude...',
      '//And prepare our colors and brightness for the final visual',
      'starAzs = float[starArrayLength];',
      'starAlts = float[starArrayLength];',
      'frag_starBrightness = float[starArrayLength];',
      'frag_starColors = float[starArrayLength];',
      'frag_starArrayLength = starArrayLength;',
      'for(int i = 0; i < starArrayLength; i++){',
        'float currentRA;',
        'float currentDec;',
        'float meeusLongitude = -1.0 longitude;',

        '//Calculated from page 92 of Meeus',
        'float hourAngle = apparentSideRealTime - meeusLongitude - rightAscension;',
        'hourAngle = (hourAngle > 0.0) ? mod(hourAngle, 360.0) : 360.0 + mod(hourAngle, 360.0);',
        'hourAngle = hourAngle * deg2Rad;',
        'float latitudeInRads = latitude * deg2Rad;',
        'float declinationInRads = declination * deg2Rad;',

        'float alt = asin(sin(declinationInRads) * sin(latitudeInRads) + cos(declinationInRads) * cos(latitudeInRads) * cos(hourAngle));',
        'float az = atan(sin(hourAngle), ((cos(hourAngle) * sin(latitudeInRads)) - (tan(declinationInRads) * cos(latitudeInRads))));',
        'float az = (az >= 0.0) ? az : az + piTimes2;',

        'alt = (alt > 0.0) ? mod(alt, piTimes2) : piTimes2 + mod(alt, piTimes2);',
        'az = (az > 0.0) ? mod(az, piTimes2) : piTimes2 + mod(az, piTimes2);',

        '//Now set all our variables for the fragment shader',
        'starAzs[i] = az;',
        'starAlts[i] = alt;',
        'frag_starBrightness[i] = starBrightness[i];',
        'frag_starColors[i] = starColors[i];',
      '}',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}',
  ].join('\n'),

  fragmentShader: [
    '//',
    '//Many thanks to https://github.com/wwwtyro/glsl-atmosphere, which was useful in setting up my first GLSL project :D',
    '//',

    '#ifdef GL_ES',
    'precision mediump float;',
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

    '// mathematical constants',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float pi = 3.141592653589793238462643383279502884197169;',
    'const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;',
    'const float deg2Rad = 0.017453292519943295769236907684886127134428718885417254560;',

    '//Sun Data',
    'uniform mediump vec3 sunPosition;',
    'const float angularRadiusOfTheSun = 0.074; //The sun and the moon should be able the same size',

    '//Star Data (passed from our fragment shader)',
    'const starRadiusMagnitudeMultiplier = 0.01;',
    'varying int frag_starArrayLength;',
    'varying mediump float[] starAzs;',
    'varying mediump float[] starAlts;',
    'varying mediump float[] frag_starBrightness;',
    'varying mediump vec3[] frag_starColors;',

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

    '//',
    '//UTIL FUNCTIONS',
    '//',

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
        'returnColor = vec4(1.0,1.0, 1.0, 1.0);',
      '}',

      'return returnColor;',
    '}',

    'vec4 drawSunGlow(float azimuthOfPixel, float altitudeOfPixel){',
      'return vec4(0.0);',
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

    'vec4 drawMoonGlow(float azimuthOfPixel, float altitudeOfPixel){',
      'return vec4(0.0);',
    '}',

    '//',
    '//STARS',
    '//',
    'vec4 drawStar(float starAzimuth, float starAltitude, float starBrightness, vec3 starColor, float azimuthOfPixel, float altitudeOfPixel){',
      'vec3 positionData = angularDistanceApproximation(starAzimuth, starAltitude, azimuthOfPixel, altitudeOfPixel);',

      '//Linear interpolation probably does not work, but I am just going to try it to see if we can draw the stars',
      'vec4 returnColor = vec4(0.0);',
      'float starRadius = starRadiusMagnitudeMultiplier * starBrightness;',
      'if(positionData.z < starRadius){',
        '//For now we will just return the color white -- in the future we will probably use a better model for the inner sunlight...',
        'returnColor = starColor;',
      '}',
      'else if( (positionData.z - starRadius) < 1.0 / max(u_resolution)){',
        'returnColor = starColor * starBrightness;',
      '}',

      'return returnColor;',
    '}',

    'vec4 drawStarGlow(float azimuthOfPixel, float altitudeOfPixel){',
      'return vec4(0.0);',
    '}',

    '//',
    '//SKY',
    '//',

    'void main()',
    '{',
      '//vec2 moonPosition = vec2(moonAzAltAndParallacticAngle.x, moonAzAltAndParallacticAngle.y);',
      '//float cosTheta = dot(normalize(vWorldPosition - cameraPos), moonPosition);',
      'vec3 azAndAlt = normalize(vWorldPosition.xyz);',
      'float altitude = azAndAlt.y;',
      'float azimuth = atan(azAndAlt.z, azAndAlt.x) + pi;',

      '//Starting color;',
      'vec4 color = vec4(0.0,0.0,0.0,1.0);',

      '//As the the most distant objects in our world, we must draw our stars first',
      'for(int i = 0; i < frag_starArrayLength; i++){',
        'color = addImageWithAveragedEdge(drawStar(starAzs[i], starAlts[i], frag_starBrightness[i], frag_starColors[i], azimuth, altitude), color);',
      '}',

      '//Then comes the sun',
      'color = addImageWithAveragedEdge(drawSunLayer(azimuth, azimuth))',

      '//And finally the moon...',
      'color = addImageWithAveragedEdge(drawMoonLayer(azimuth, altitude), vec4(0.0,0.0,0.0,1.0));',

      '//Once we have draw each of these, we will add their light to the light of the sky in the original sky model',


      '//And then we will add the glow of the sun, moon and stars...',


      '//This is where we would put clouds if the GPU does not turn to molten silicon',


    '	gl_FragColor = color;',
    '}',
  ].join('\n')
});
