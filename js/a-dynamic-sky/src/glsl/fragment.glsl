//
//Many thanks to https://github.com/wwwtyro/glsl-atmosphere, which was useful in setting up my first GLSL project :D
//

#ifdef GL_ES
precision mediump float;
#endif

//Camera data
varying vec3 vWorldPosition;
uniform vec2 u_resolution;

//Positions of our astronomical bodies
uniform mediump vec3 sunPosition; //Already passed into the vertex shader

//Status of the sky
uniform float luminance;
uniform float turbidity;
uniform float reileigh;
uniform float mieCoefficient;
uniform float mieDirectionalG;

// mathematical constants
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;

//Star Data
//uniform vec2 starAzimuthsAndAltitudes[8912];
//uniform float starMagnitudes[8912];
//uniform vec3 starColors[8912];

//
//NOTE: IN PROGRESS
//

//Sky Surface data
varying vec3 normal;
varying vec2 binormal;

//
//NOTE: IN PROGRESS
//

//Moon Data
uniform mediump vec3 moonAzAltAndParallacticAngle;
uniform float brightLimbOfMoon;
uniform float illuminatedFractionOfMoon;
uniform sampler2D moonTexture;
uniform sampler2D moonNormalMap;
const float angularRadiusOfTheMoon = 0.075;
varying vec3 tangentSpaceSunlight;
const float earthshine = 0.02;

//This fellow is useful for the disks of the sun and the moon
//and the glow of stars... It is fast and efficient at small angles
vec3 angularDistanceApproximation(float az_0, float alt_0, float az_1, float alt_1){
  //There is a chance that our compliment (say moon at az_0 at 0 degree and az_2 at 364.99)
  //Results in an inaccurately large angle, thus we must check the compliment in addition to
  //our regular diff.
  float deltaAZ = az_0 - az_1;
  float compliment = -1.0 * max(2.0 * pi - abs(deltaAZ), 0.0) * sign(deltaAZ);
  deltaAZ = abs(deltaAZ) < abs(compliment) ? deltaAZ : compliment;

  //Luckily we don not need to worry about this compliment stuff here because alt only goes between -pi and pi
  float diff2 = alt_1 - alt_0;

  //Presuming that most of our angular objects are small, we will simply use
  //this simple approximation... http://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/
  float deltaAlt = diff2;
  return vec3(deltaAZ, deltaAlt, sqrt(deltaAZ * deltaAZ + deltaAlt * deltaAlt));
}

vec4 addImageWithAveragedEdge(vec4 imageColor, vec4 backgroundColor){
  return imageColor.a > 0.95 ? vec4(imageColor.rgb, 1.0) : vec4(mix(imageColor.xyz, backgroundColor.xyz, (1.0 - imageColor.w)), 1.0);
}

vec4 drawMoonLayer(float azimuthOfPixel, float altitudeOfPixel){
  //Let us use the small angle approximation of this for now, in the future, we might Implement
  vec3 positionData = angularDistanceApproximation(moonAzAltAndParallacticAngle.x, moonAzAltAndParallacticAngle.y, azimuthOfPixel, altitudeOfPixel);

  //Well, really 2x the angular radius of the moon because we wanna see it for now...
  vec4 returnColor = vec4(0.0);

  if(positionData.z < angularRadiusOfTheMoon){
    //Hey! We are in the moon! convert our distance into a linear interpolation
    //of half pixel radius on our sampler
    //float altAzimuthOfPixel = 2.0 * pi - abs(azimuthOfPixel);
    //azimuthOfPixel = azimuthOfPixel <= altAzimuthOfPixel ? azimuthOfPixel : -1.0 * altAzimuthOfPixel;
    vec2 position = (positionData.xy + vec2(angularRadiusOfTheMoon)) / (2.0 * angularRadiusOfTheMoon);
    //TODO: If we want to utilize rotations, we should multiply this by an appropriate rotation matrix first!

    //Now to grab that color!
    vec4 moonColor = texture2D(moonTexture, position.xy);

    //Get the moon shadow using the normal map (if it exists) - otherwise use the bright limb stuff
    //Thank you, https://beesbuzz.biz/code/hsv_color_transforms.php!
    vec3 moonSurfaceNormal = 2.0 * texture2D(moonNormalMap, position.xy).rgb - 1.0;

    //The moon is presumed to be a lambert shaded object, as per:
    //https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Diffuse_Reflection
    moonColor = vec4(moonColor.rgb * max(earthshine, dot(moonSurfaceNormal, tangentSpaceSunlight)), moonColor.a);

    returnColor = moonColor;
  }

  //Otherwise, we shall return nothing for now. In the future, perhaps we will implement the
  return returnColor;
}

//
//TODO: Draw the moon atmospheric effect layer
//

void main()
{
  //vec2 moonPosition = vec2(moonAzAltAndParallacticAngle.x, moonAzAltAndParallacticAngle.y);
  //float cosTheta = dot(normalize(vWorldPosition - cameraPos), moonPosition);
  vec3 azAndAlt = normalize(vWorldPosition.xyz);
  float altitude = azAndAlt.y;
  float azimuth = atan(azAndAlt.z, azAndAlt.x) + pi;

  //This is just a test to see that we can get the appropriate coordinates from our pixel coordinates and Uniforms
  //Once we know our results are accurate, we can jump into producing various astronomical bodies here.
  vec4 color = addImageWithAveragedEdge(drawMoonLayer(azimuth, altitude), vec4(0.0,0.0,0.0,1.0));

	gl_FragColor = color;
}
