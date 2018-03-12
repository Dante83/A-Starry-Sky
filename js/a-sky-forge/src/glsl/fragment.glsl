//
//Many thanks to https://github.com/wwwtyro/glsl-atmosphere, which was useful in setting up my first GLSL project :D
//

#ifdef GL_ES
precision mediump float;
precision mediump int;
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
const float piOver2 = 1.570796326794896619231321691639751442098584699687552910487;
const float deg2Rad = 0.017453292519943295769236907684886127134428718885417254560;

//Star Data (passed from our fragment shader)
uniform sampler2D starMask;
uniform sampler2D starRas;
uniform sampler2D starDecs;
uniform sampler2D starMags;
uniform sampler2D starColors;
const int starDataImgWidth = 512;
const int starDataImgHeight = 256;
const float starRadiusMagnitudeMultiplier = 0.01;
const int starOffsetBorder = 5;

//Sun Data
uniform mediump vec2 sunPosition;
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
uniform float localSiderealTime;

//
//UTIL FUNCTIONS
//

int modulo(float a, float b){
  return int(a - (b * floor(a/b)));
}

float fModulo(float a, float b){
  return (a - (b * floor(a / b)));
}

//This converts our local sky coordinates from azimuth and altitude
//into ra and dec, which is useful for picking out stars
//With a bit of help from https://mathematica.stackexchange.com/questions/69330/astronomy-transform-coordinates-from-horizon-to-equatorial
//Updated with help from https://en.wikipedia.org/wiki/Celestial_coordinate_system
vec2 getRaAndDec(float az, float alt){
  float declination = asin(sin(latLong.x) * sin(alt) - cos(latLong.x) * cos(alt) * cos(az));
  float hourAngle = atan(sin(az), (cos(az) * sin(latLong.x) + tan(alt) * cos(latLong.x)));
  float rightAscension = localSiderealTime - hourAngle;

  return vec2(rightAscension, declination);
}

//This is useful for converting our values from rgb colors into floats
float rgba2Float(vec4 colorIn){
  vec4 colorIn255bits = floor(colorIn * 255.0);

  int floatSign = (modulo(colorIn255bits.a, 2.0)) == 0 ? -1 : 1;
  float floatExponential = float(((int(colorIn255bits.a)) / 2) - 64);
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
    returnColor = vec4(1.0, 0.85, 0.0, 1.0);
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

vec4 drawStar(vec2 raAndDec, vec2 raAndDecOfStar, float magnitudeOfStar, vec3 starColor){
  float maxRadiusOfStar = (2.0/360.0) * piTimes2;
  float normalizedMagnitude = (7.96 - (magnitudeOfStar + 1.46)) / 7.96;
  float radiusOfStar = maxRadiusOfStar * normalizedMagnitude;

  vec3 positionData = angularDistanceApproximation(raAndDec.x, raAndDec.y, raAndDecOfStar.x, raAndDecOfStar.y);
  vec4 returnColor = vec4(0.0);
  if(positionData.z < radiusOfStar){
    float lightness = exp(1.5 * 7.96 * ((radiusOfStar - positionData.z)/radiusOfStar)) / exp(1.5 * 7.96);
    vec3 colorOfSky = vec3(0.1, 0.2, 1.0);
    vec3 colorOfPixel = mix(mix(starColor, colorOfSky, (radiusOfStar - positionData.z)/(1.2 * radiusOfStar)), vec3(1.0), lightness);
    returnColor = vec4(colorOfPixel, lightness);
  }

  return returnColor;
}

//
//STARS
//
vec4 drawStarLayer(float azimuthOfPixel, float altitudeOfPixel){
  int padding = 5; //Should be the same as the value used to create our image in convert_stars_to_image.py
  int scanWidth = 2 * padding + 1;
  int paddingSquared = scanWidth * scanWidth;

  //Convert our ra and dec varying into pixel coordinates.
  vec2 raAndDecOfPixel = getRaAndDec(azimuthOfPixel, altitudeOfPixel);
  float pixelRa = raAndDecOfPixel.x;
  float pixelDec = raAndDecOfPixel.y;

  pixelRa = azimuthOfPixel;
  pixelDec = altitudeOfPixel;

  //float normalizedpixelRa = pixelRa / piTimes2;
  //float normalizedpixelDec = (pixelDec + piOver2) / pi;

  highp float activeImageWidth = float(starDataImgWidth - 2 * padding); //Should be 502
  highp float activeImageHeight = float(starDataImgHeight - 2 * padding); //Should be 246
  highp float normalizedRa = pixelRa / piTimes2;
  highp float normalizedDec = (pixelDec + piOver2) / pi;

  //We will include all texture components over a certain range so we might as well start at 0
  highp float startingPointX = activeImageWidth * normalizedRa;
  highp float startingPointY = activeImageHeight * normalizedDec;

  //return vec4(vec3(normalizedDec), 1.0);

  //Main draw loop
  vec4 returnColor = vec4(0.0);
  for(highp int i = 0; i <= 10; ++i){
    for(highp int j = 0; j <= 10; ++j){
      highp float xLoc = startingPointX + float(i);
      highp float yLoc = startingPointY + float(j);

      //Now, normalize these locations with respect to the width of the image
      highp vec2 searchPosition = vec2(xLoc / float(starDataImgWidth), yLoc / float(starDataImgHeight));

      //Hey! No texelfetch until web gl 2.0, screw my life O_o.
      //I also can not import textures that are multiples of 2, which is why we have so many textures
      //May anti-aliasing not make our life hell
      vec4 isStar = texture2D(starMask, searchPosition);

      if(isStar.r > 0.0){
        //If our value is red, we found a star. Get the values for this star
        //by converting our ras, decs, and intensities. The color should just be the color.
        vec4 starRaColor = texture2D(starRas, searchPosition);
        vec4 starDecColor = texture2D(starDecs, searchPosition);
        vec4 starMagColor = texture2D(starMags, searchPosition);
        vec3 starColor = texture2D(starColors, searchPosition).rgb;

        //Convert colors into final forms we desire
        float starRa = rgba2Float(starRaColor);
        float starDec = -1.0 * rgba2Float(starDecColor); //Not sure why this needs to be multiplied by a negative one.
        float magnitude = rgba2Float(starMagColor);

        //Go on and use this to create our color here.
        returnColor = addImageWithAveragedEdge(drawStar(vec2(pixelRa, pixelDec), vec2(starRa, starDec), magnitude, starColor), returnColor);
      }
    }
  }

  return returnColor;
}

//
//SKY
//

//
//Draw main loop
//
void main()
{
  vec3 pointCoord = normalize(vWorldPosition.xyz);
  float altitude = piOver2 - acos(pointCoord.y);
  float azimuth = atan(pointCoord.z, pointCoord.x) + pi;

  //Starting color is black, the color of space!
  vec4 color = vec4(0.0,0.0,0.0,1.0);

  //As the the most distant objects in our world, we must draw our stars first
  color = addImageWithAveragedEdge(drawStarLayer(azimuth, altitude), color);

  //Then comes the sun
  color = addImageWithAveragedEdge(drawSunLayer(azimuth, altitude), color);

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
