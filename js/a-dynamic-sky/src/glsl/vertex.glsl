varying vec3 vWorldPosition;
varying vec3 tangentSpaceSunlight;

//For calculating the stellar positions
uniform mediump float apparentSideRealTime;
uniform mediump float localLatitude;
attribute int starArrayLength;
attribute mediump float[] starRAS;
attribute mediump float[] starDECs;
attribute mediump float[] starBrightness;
attribute mediump vec3[] starColors;

varying int frag_starArrayLength;
varying mediump float[] starAzs;
varying mediump float[] starAlts;
varying mediump float[] frag_starBrightness;
varying mediump vec3[] frag_starColors;

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

  //Let us break this out into components
  float altitude = moonAzAltAndParallacticAngle.y;
  float azimuth = moonAzAltAndParallacticAngle.x;

  //
  //LUNAR SHADOWS
  //

  //TODO: Something is still off here, but we will come back to this in the future...

  //Calculate the normal and binormal from the surface of a sphere using a radius of 1.0 then invert it by multiplying everything by -1.0
  vec3 faceNormal = normalize(vec3(sin((pi / 2.0) - altitude) * cos(azimuth), sin((pi / 2.0) - altitude) * sin(azimuth), cos(azimuth)));
  //Because were centered at the origin, we can just get the cross product of the noraml vector and the z-axis.
  //Via: https://math.stackexchange.com/questions/1112719/get-tangent-vector-from-point-to-sphere-vector
  //NOTE: We should probably rotate the tangent and bitangent by the parallactic angle to preserve shading under rotation

  vec3 faceTangent = normalize(vec3(sin(-altitude) * cos(azimuth), sin(- altitude) * sin(azimuth), cos(azimuth)));
  vec3 faceBitangent = normalize(cross(faceNormal, faceTangent));//And then we are going to cross the two to get our bi-vector
  //vec3 faceBinormal = normalize(cross(faceNormal, faceTangent));//And then we are going to cross the two to get our bi-vector

  mat3 toTangentSpace = mat3(
      faceTangent.x, faceBitangent.x, faceNormal.x,
      faceTangent.y, faceBitangent.y, faceNormal.y,
      faceTangent.z, faceBitangent.z, faceNormal.z
  );

  //All of this lighting happens very far away, so we dont have to worry about our camera position
  tangentSpaceSunlight = toTangentSpace * sunPosition;

  //
  //STAR DATA CONVERSION
  //

  //Go through each of our stars and convert them into an azimuth and altitude...
  //And prepare our colors and brightness for the final visual
  starAzs = float[starArrayLength];
  starAlts = float[starArrayLength];
  frag_starBrightness = float[starArrayLength];
  frag_starColors = float[starArrayLength];
  frag_starArrayLength = starArrayLength;
  for(int i = 0; i < starArrayLength; i++){
    float currentRA;
    float currentDec;
    float meeusLongitude = -1.0 longitude;

    //Calculated from page 92 of Meeus
    float hourAngle = apparentSideRealTime - meeusLongitude - rightAscension;
    hourAngle = (hourAngle > 0.0) ? mod(hourAngle, 360.0) : 360.0 + mod(hourAngle, 360.0);
    hourAngle = hourAngle * deg2Rad;
    float latitudeInRads = latitude * deg2Rad;
    float declinationInRads = declination * deg2Rad;

    float alt = asin(sin(declinationInRads) * sin(latitudeInRads) + cos(declinationInRads) * cos(latitudeInRads) * cos(hourAngle));
    float az = atan(sin(hourAngle), ((cos(hourAngle) * sin(latitudeInRads)) - (tan(declinationInRads) * cos(latitudeInRads))));
    float az = (az >= 0.0) ? az : az + piTimes2;

    alt = (alt > 0.0) ? mod(alt, piTimes2) : piTimes2 + mod(alt, piTimes2);
    az = (az > 0.0) ? mod(az, piTimes2) : piTimes2 + mod(az, piTimes2);

    //Now set all our variables for the fragment shader
    starAzs[i] = az;
    starAlts[i] = alt;
    frag_starBrightness[i] = starBrightness[i];
    frag_starColors[i] = starColors[i];
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
