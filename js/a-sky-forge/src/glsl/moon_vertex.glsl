varying vec3 vWorldPosition;
varying float sR;
varying float sM;

uniform float rayleighCoefficientOfSun;
uniform float rayleighCoefficientOfMoon;
const vec3 up = vec3(0.0, 1.0, 0.0);
const vec3 simplifiedRayleighVal = vec3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);
const float rayleighAtmosphereHeight = 8.4E3;
const float mieAtmosphereHeight = 1.25E3;
const float rad2Deg = 57.29577951308232087679815481410517033240547246656432154916;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  //Using dot(a,b) = ||a|| ||b|| * cos(a, b);
  //Here, the angle between up and the sun direction is always the zenith angle
  //Note in the original code, we normalized the sun direction at this point so that
  //the magnitude of that vector will always be one.
  //while
  vec3 betaRSun = simplifiedRayleighVal * rayleighCoefficientOfSun;
  vec3 betaRMoon = simplifiedRayleighVal * rayleighCoefficientOfMoon;

  // Get the current optical length
  // cutoff angle at 90 to avoid singularity in next formula.
  //presuming here that the dot of the sun direction and up is also cos(zenith angle)
  float cosOfZenithAngleOfCamera = max(0.0, dot(up, normalize(vWorldPosition)));
  float zenithAngleOfCamera = acos(cosOfZenithAngleOfCamera);
  float inverseSDenominator = 1.0 / cosOfZenithAngleOfCamera + 0.15 * pow(93.885 - (zenithAngleOfCamera * rad2Deg), -1.253);
  sR = rayleighAtmosphereHeight * inverseSDenominator;
  sM = mieAtmosphereHeight * inverseSDenominator;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
