//
//Many thanks to https://github.com/wwwtyro/glsl-atmosphere, which was useful in setting up my first GLSL project :D
//

#ifdef GL_ES
precision mediump float;
#endif

//Camera data
varying vec3 vWorldPosition;
uniform vec2 u_resolution;

//Status of the sky
uniform float luminance;
uniform float turbidity;
uniform float reileigh;
uniform float mieCoefficient;
uniform float mieDirectionalG;

// mathematical constants
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;
const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;
const float deg2Rad = 0.017453292519943295769236907684886127134428718885417254560;

//Star Data (passed from our fragment shader)
uniform sampler2D starData;
const int starDataImgWidth = 512;
const int starDataImgHeight = 256;
const float starRadiusMagnitudeMultiplier = 0.01;
const int starOffsetBorder = 5;

//Sun Data
uniform mediump vec3 sunPosition;
const float angularRadiusOfTheSun = 0.074; //The sun and the moon should be able the same size

//
//NOTE: These values are interpolated, so we are probably not getting the values
//NOTE: we think we are getting. We would have to uninterpolate them and that would really
//NOTE: stink.
//
//Sky Surface data
varying vec3 normal;
varying vec2 binormal;

//Moon Data
uniform mediump vec3 moonAzAltAndParallacticAngle;
uniform float brightLimbOfMoon;
uniform float illuminatedFractionOfMoon;
uniform sampler2D moonTexture;
uniform sampler2D moonNormalMap;
const float angularRadiusOfTheMoon = 0.075;
varying vec3 tangentSpaceSunlight;
const float earthshine = 0.02;

//Earth data
uniform vec2 latLong;
uniform float hourAngle;
uniform float localSiderealTime;

//
//NOTE: Subtract 67 from any errors to get the apropriate line number
//

//
//UTIL FUNCTIONS
//

int modulo(float a, float b){
  return int(a - (b * floor(a/b)));
}

//This converts our local sky coordinates from azimuth and altitude
//into ra and dec, which is useful for picking out stars
vec2 getRaAndDec(float az, float alt){
  //What they normally are
  float rightAscension = localSiderealTime - latLong.y - hourAngle;
  float declination = asin(sin(latLong.x) * sin(alt) - cos(latLong.x) * cos(alt) * cos(az));

  return vec2(rightAscension, declination);
}

//This is useful for converting our values from rgb colors into floats
float rgba2Float(vec4 colorIn){
  vec4 colorIn255bits = floor(colorIn * 255.0);

  int floatSign = (modulo(colorIn255bits.a, 2.0)) == 0 ? -1 : 1;
  float floatExponential = float(((int(colorIn255bits.a) + ((floatSign + 1) / 2)) / 2) - 64);
  float floatValue = float(floatSign) * (colorIn255bits.r * 256.0 * 256.0 + colorIn255bits.g * 256.0 + colorIn255bits.b) * pow(10.0, floatExponential);

  return floatValue;
}

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

//This function combines our colors so that different layers can exist at the right locations
vec4 addImageWithAveragedEdge(vec4 imageColor, vec4 backgroundColor){
  return imageColor.a > 0.95 ? vec4(imageColor.rgb, 1.0) : vec4(mix(imageColor.xyz, backgroundColor.xyz, (1.0 - imageColor.w)), 1.0);
}

//
//SUN
//
vec4 drawSunLayer(float azimuthOfPixel, float altitudeOfPixel){
  vec3 positionData = angularDistanceApproximation(sunPosition.x, sunPosition.y, azimuthOfPixel, altitudeOfPixel);

  vec4 returnColor = vec4(0.0);
  if(positionData.z < angularRadiusOfTheSun){
    //For now we will just return the color white -- in the future we will probably use a better model for the inner sunlight...
    returnColor = vec4(1.0);
  }

  return returnColor;
}

//
//MOON
//

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
//STARS
//
vec4 drawStars(float azimuthOfPixel, float altitudeOfPixel){
  int padding = 5; //Should be the same as the value used to create our image in convert_stars_to_image.py
  int scanWidth = 2 * padding + 1;
  int paddingSquared = scanWidth * scanWidth;

  //Convert our ra and dec varying into pixel coordinates.
  vec2 raAndDecOfPixel = getRaAndDec(azimuthOfPixel, altitudeOfPixel);
  float rightAscensionOfPixel = raAndDecOfPixel.x;
  float declinationOfPixel = raAndDecOfPixel.y;
  int raInImageSpace = int(clamp(float(starDataImgWidth - 2 * padding) * (rightAscensionOfPixel / piTimes2) + float(padding), float(padding), float(starDataImgWidth - padding)));
  int decInImageSpace = int(clamp(float(starDataImgHeight - 2 * padding) * ((declinationOfPixel + (pi / 2.0)) / pi) + float(padding), float(padding), float(starDataImgHeight - padding)));

  //Now get the coordinates of our subimage we wish to iterate over
  int startX = raInImageSpace - padding;
  int endX = raInImageSpace + padding;
  int startY = decInImageSpace - padding;
  int endY = decInImageSpace + padding;

  //Carve out space for half our pixels to be filled - ignore the rest.
  // int halfSpace = (paddingSquared + 1) / 2;
  //Manual calculation of the above
  int halfSpace = (paddingSquared + 1) / 2;
  float starRas[66];
  float starDecs[66];
  float starIntensities[66];
  vec3 starColors[66];

  //Initialize all our stars to null stars - we will fill them in afterwards if they exist
  for(int i = 0; i < halfSpace; i++){
    starRas[i] = 0.0;
    starDecs[i] = 0.0;
    starIntensities[i] = 0.0;
    starColors[i] = vec3(0.0);
  }

  //For each pixel in this sub image...
  int star = 0;
  for(int i = startX; i <= endX; ++i){
    for(int j = startY; j <= endY; ++j){
      vec4 isStar = texelFetch(starData, ivec2(i, j), 0);

      if(isStar.r == 1.0){
        //If our value is red, we found a star. Get the values for this star
        //by converting our ras, decs, and intensities. The color should just be the color.
        vec4 starRAColor = texelFetch(starData, ivec2((i + starDataImgWidth), j), 0);
        vec4 starDecColor = texelFetch(starData, ivec2((i + 2 * starDataImgWidth), j), 0);
        vec4 starIntensityColor = texelFetch(starData, ivec2((i + 3 * starDataImgWidth), j), 0);
        vec4 starColor = texelFetch(starData, ivec2(i + 4 * starDataImgWidth, j), 0);

        //Convert colors into final forms we desire
        starRas[star] = rgba2Float(starRAColor);
        starDecs[star] = rgba2Float(starDecColor);
        starIntensities[star] = rgba2Float(starIntensityColor);
        starColors[star] = starColor.rgb
      }

      //because we added a star, iterate this variable.
      star += 1;
    }
  }

  //For every star, determine the distance of this pixel from the star
  //NOTE: We are presuming that the light from each star is too little to worry about if they glow around the moon or sun.
  vec4 returnColor = vec4(0.0);
  float radiusOfStar;
  float maxRadiusOfStar = (1.0/360.0) * piTimes2;
  for(int i = 0; i < halfSpace; ++i){
    //Because we are still using two angular values, we can still use this to estimate our distance.
    float distanceToStar = angularDistanceApproximation(rightAscensionOfPixel, declinationOfPixel, starRas[i], starDecs[i]);

    //Implement star light and glow.
    //TODO: Implement star twinkle here.
    radiusOfStar = maxRadiusOfStar * ((starIntensities[i] + 1.5) / 8.0);
    returnColor = addImageWithAveragedEdge(color, clamp(smoothstep(radiusOfStar - distanceToStar, vec4(1.0), vec4(starColors[i], 0.0)), vec3(0.0), vec4(1.0)));
  }

  return returnColor;
}

//
//SKY
//

void main()
{
  //vec2 moonPosition = vec2(moonAzAltAndParallacticAngle.x, moonAzAltAndParallacticAngle.y);
  //float cosTheta = dot(normalize(vWorldPosition - cameraPos), moonPosition);
  vec3 azAndAlt = normalize(vWorldPosition.xyz);
  float altitude = azAndAlt.y;
  float azimuth = atan(azAndAlt.z, azAndAlt.x) + pi;

  //Starting color is black, the color of space!
  vec4 color = vec4(0.0,0.0,0.0,1.0);

  //As the the most distant objects in our world, we must draw our stars first
  color = addImageWithAveragedEdge(drawStars(float azimuthOfPixel, float altitudeOfPixel), color);

  //Then comes the sun
  color = addImageWithAveragedEdge(drawSunLayer(azimuth, azimuth), color);

  //And finally the moon...
  color = addImageWithAveragedEdge(drawMoonLayer(azimuth, altitude), color);

  //
  //The astronomical stuff is now done, so we should be able to proceed with stuff like the glow of the sky.
  //

  //Once we have draw each of these, we will add their light to the light of the sky in the original sky model


  //And then we will add the glow of the sun, moon and stars...


  //This is where we would put clouds if the GPU does not turn to molten silicon


	gl_FragColor = color;
}
