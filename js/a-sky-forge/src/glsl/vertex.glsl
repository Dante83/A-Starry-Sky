varying vec3 vWorldPosition;
varying vec3 tangentSpaceSunlight;

//For calculating the solar and and lunar data
uniform mediump vec3 sunPosition;
uniform mediump vec3 moonAzAltAndParallacticAngle;

//Thanks Wolfram Alpha!
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;
const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;
const float deg2Rad = 0.017453292519943295769236907684886127134428718885417254560;

void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;

  //
  //STARS
  //

  //Let us break this out into components
  float mAltitude = moonAzAltAndParallacticAngle.y;
  float mAzimuth = moonAzAltAndParallacticAngle.x;

  //
  //LUNAR SHADOWS
  //

  //TODO: Something is still off here, but we will come back to this in the future...

  //Calculate the normal and binormal from the surface of a sphere using a radius of 1.0 then invert it by multiplying everything by -1.0
  vec3 faceNormal = normalize(vec3(sin((pi / 2.0) - mAltitude) * cos(mAzimuth), sin((pi / 2.0) - mAltitude) * sin(mAzimuth), cos(mAzimuth)));
  //Because were centered at the origin, we can just get the cross product of the noraml vector and the z-axis.
  //Via: https://math.stackexchange.com/questions/1112719/get-tangent-vector-from-point-to-sphere-vector
  //NOTE: We should probably rotate the tangent and bitangent by the parallactic angle to preserve shading under rotation

  //Note: We pass in a UV attribute, perhaps we should use these vectors to determine our tangent, bitangent and normal vectors?
  vec3 faceTangent = normalize(vec3(sin(-mAltitude) * cos(mAzimuth), sin(- mAltitude) * sin(mAzimuth), cos(mAzimuth)));
  vec3 faceBitangent = normalize(cross(faceNormal, faceTangent));//And then we are going to cross the two to get our bi-vector
  //vec3 faceBinormal = normalize(cross(faceNormal, faceTangent));//And then we are going to cross the two to get our bi-vector

  mat3 toTangentSpace = mat3(
      faceTangent.x, faceBitangent.x, faceNormal.x,
      faceTangent.y, faceBitangent.y, faceNormal.y,
      faceTangent.z, faceBitangent.z, faceNormal.z
  );

  //All of this lighting happens very far away, so we dont have to worry about our camera position
  tangentSpaceSunlight = toTangentSpace * sunPosition;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
