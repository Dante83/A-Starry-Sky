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
    u_resolution: {type: 'vec2', default: {x: 1280, y: 720}, is: 'uniform'}
  },

  vertexShader: [
    'varying vec3 vWorldPosition;',
    'varying vec3 tangentSpaceSunlight;',

    'uniform mediump vec3 sunPosition;',
    'uniform mediump vec3 moonAzAltAndParallacticAngle;',

    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float pi = 3.141592653589793238462643383279502884197169;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
      'vWorldPosition = worldPosition.xyz;',

      '//Let us break this out into components',
      'float altitude = moonAzAltAndParallacticAngle.y;',
      'float azimuth = moonAzAltAndParallacticAngle.x;',

      '//Calculate the normal and binormal from the surface of a sphere using a radius of 1.0 then invert it by multiplying everything by -1.0',
      'vec3 faceNormal = normalize(vec3(sin((pi / 2.0) - altitude) * cos(azimuth), sin((pi / 2.0) - altitude) * sin(azimuth), cos(azimuth)));',
      '//Because were centered at the origin, we can just get the cross product of the noraml vector and the z-axis.',
      '//Via: https://math.stackexchange.com/questions/1112719/get-tangent-vector-from-point-to-sphere-vector',
      '//NOTE: Do I possibly have my tangent and bi-tangent reversed?',
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

    '//Positions of our astronomical bodies',
    'uniform mediump vec3 sunPosition; //Already passed into the vertex shader',

    '//Status of the sky',
    'uniform float luminance;',
    'uniform float turbidity;',
    'uniform float reileigh;',
    'uniform float mieCoefficient;',
    'uniform float mieDirectionalG;',

    '// mathematical constants',
    'const float e = 2.71828182845904523536028747135266249775724709369995957;',
    'const float pi = 3.141592653589793238462643383279502884197169;',

    '//Star Data',
    '//uniform vec2 starAzimuthsAndAltitudes[8912];',
    '//uniform float starMagnitudes[8912];',
    '//uniform vec3 starColors[8912];',

    '//',
    '//NOTE: IN PROGRESS',
    '//',

    '//Sky Surface data',
    'varying vec3 normal;',
    'varying vec2 binormal;',

    '//',
    '//NOTE: IN PROGRESS',
    '//',

    '//Moon Data',
    'uniform mediump vec3 moonAzAltAndParallacticAngle;',
    'uniform float brightLimbOfMoon;',
    'uniform float illuminatedFractionOfMoon;',
    'uniform sampler2D moonTexture;',
    'uniform sampler2D moonNormalMap;',
    'const float angularRadiusOfTheMoon = 0.075;',
    'varying vec3 tangentSpaceSunlight;',
    'const float earthshine = 0.02;',

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

    '//',
    '//TODO: Draw the moon atmospheric effect layer',
    '//',

    'void main()',
    '{',
      '//vec2 moonPosition = vec2(moonAzAltAndParallacticAngle.x, moonAzAltAndParallacticAngle.y);',
      '//float cosTheta = dot(normalize(vWorldPosition - cameraPos), moonPosition);',
      'vec3 azAndAlt = normalize(vWorldPosition.xyz);',
      'float altitude = azAndAlt.y;',
      'float azimuth = atan(azAndAlt.z, azAndAlt.x) + pi;',

      '//This is just a test to see that we can get the appropriate coordinates from our pixel coordinates and Uniforms',
      '//Once we know our results are accurate, we can jump into producing various astronomical bodies here.',
      'vec4 color = addImageWithAveragedEdge(drawMoonLayer(azimuth, altitude), vec4(0.0,0.0,0.0,1.0));',

    '	gl_FragColor = color;',
    '}',
  ].join('\n')
});
