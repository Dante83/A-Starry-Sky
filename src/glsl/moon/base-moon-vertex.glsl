attribute vec4 tangent;

uniform float radiusOfMoonPlane;
uniform mat4 worldMatrix;
uniform vec3 sunLightDirection;

varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;
varying vec3 tangentSpaceSunLightDirection;
varying vec3 tangentSpaceViewDirection;

varying vec3 galacticCoordinates;
uniform float latitude;
uniform float localSiderealTime;
const float northGalaticPoleRightAscension = 3.36601290657539744989;
const float northGalaticPoleDec = 0.473507826066061614219;
const float sinOfNGP = 0.456010959101623894601;
const float cosOfNGP = 0.8899741598379231031239;
const float piTimes2 = 6.283185307179586476925286;
const float piOver2 = 1.5707963267948966192313;
const float threePiOverTwo = 4.712388980384689857693;
const float pi = 3.141592653589793238462;

void main() {
  mat4 worldMatrixIn = worldMatrix;
  vec4 worldMatrixTranslation = worldMatrixIn[3];
  worldMatrixIn[3] = worldMatrixTranslation - vec4(cameraPosition, 0.0);
  vec4 worldPosition = worldMatrixIn * vec4(position * radiusOfMoonPlane * 2.0, 1.0);
  vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);
  vLocalPosition = normalize(vWorldPosition.xyz);
  vec3 normalizedWorldPosition = normalize(vWorldPosition);
  worldPosition = worldMatrix * vec4(position * radiusOfMoonPlane * 2.0, 1.0);

  vUv = uv;

  //Other then our bitangent, all of our other values are already normalized
  vec3 bitangent = normalize((tangent.w * cross(normal, tangent.xyz)));
  vec3 cameraSpaceTangent = (worldMatrix * vec4(tangent.xyz, 0.0)).xyz;
  vec3 b = (worldMatrix * vec4(bitangent.xyz, 0.0)).xyz;
  vec3 n = (worldMatrix * vec4(normal.xyz, 0.0)).xyz;

  //There is no matrix transpose, so we will do this ourselves
  mat3 TBNMatrix = mat3(vec3(cameraSpaceTangent.x, b.x, n.x), vec3(cameraSpaceTangent.y, b.y, n.y), vec3(cameraSpaceTangent.z, b.z, n.z));
  tangentSpaceSunLightDirection = normalize(TBNMatrix * sunLightDirection);
  tangentSpaceViewDirection = normalize(TBNMatrix * -normalizedWorldPosition);

  //Convert coordinate position to RA and DEC
  float altitude = piOver2 - acos(vLocalPosition.y);
  float azimuth = pi - atan(vLocalPosition.z, vLocalPosition.x);
  float declination = asin(sin(latitude) * sin(altitude) - cos(latitude) * cos(altitude) * cos(azimuth));
  float hourAngle = atan(sin(azimuth), (cos(azimuth) * sin(latitude) + tan(altitude) * cos(latitude)));

  //fmodulo return (a - (b * floor(a / b)));
  float a = localSiderealTime - hourAngle;
  float rightAscension = a - (piTimes2 * floor(a / piTimes2));

  //Convert coordinate position to Galactic Coordinates
  float sinOfDec = sin(declination);
  float cosOfDec = cos(declination);
  float cosOfRaMinusGalacticNGPRa = cos(rightAscension - northGalaticPoleRightAscension);
  float galaticLatitude = threePiOverTwo - asin(sinOfNGP * sinOfDec + cosOfNGP * cosOfDec * cosOfRaMinusGalacticNGPRa);
  float galaticLongitude = cosOfDec * sin(rightAscension - northGalaticPoleRightAscension);
  galaticLongitude = atan(galaticLongitude, cosOfNGP * sinOfDec - sinOfNGP * cosOfDec * cosOfRaMinusGalacticNGPRa) + pi;
  galacticCoordinates.x = sin(galaticLatitude) * cos(galaticLongitude);
  galacticCoordinates.y = cos(galaticLatitude);
  galacticCoordinates.z = sin(galaticLatitude) * sin(galaticLongitude);

  gl_Position = vec4(position, 1.0);
}
