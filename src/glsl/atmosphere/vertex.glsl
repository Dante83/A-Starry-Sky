varying vec3 vWorldPosition;
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
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = normalize(vec3(-worldPosition.z, worldPosition.y, -worldPosition.x));

  //Convert coordinate position to RA and DEC
  float altitude = piOver2 - acos(vWorldPosition.y);
  float azimuth = pi - atan(vWorldPosition.z, vWorldPosition.x);
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

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
