
vec3 totalRayleigh(vec3 lambda){
  return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));
}

// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness
// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE
vec3 simplifiedRayleigh(){
  return 0.0005 / vec3(94, 40, 18);
}

float rayleighPhase(float cosTheta){
  //TODO: According to, http://amd-dev.wpengine.netdna-cdn.com/wordpress/media/2012/10/ATI-LightScattering.pdf
  //There should also be a rayleigh Coeficient in this equation - it is set to 1 here.
  float reigleighCoefficient = 1.0;
  return (3.0 / (16.0*pi)) * reigleighCoefficient * (1.0 + pow(cosTheta, 2.0));
}

vec3 totalMie(vec3 lambda, vec3 K, float T){
  float c = (0.2 * T ) * 10E-18;
  return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
}

float hgPhase(float cosTheta, float g){
  return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosTheta + pow(g, 2.0), 1.5));
}

float lightIntensity(float zenithAngleCos, float EE){
  return EE * max(0.0, 1.0 - exp(-((cutoffAngle - acos(zenithAngleCos))/steepness)));
}

// Filmic ToneMapping http://filmicgames.com/archives/75
const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;
const float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x){
  return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

//
//MOON
//
vec4 drawMoonLayer(float azimuthOfPixel, float altitudeOfPixel, skyparams skyParams){
  //calculate the location of this pixels on the unit sphere
  float zenithOfPixel = piOver2 - altitudeOfPixel;
  float pixelX = sin(zenithOfPixel) * cos(azimuthOfPixel);
  float pixelY = sin(zenithOfPixel) * sin(azimuthOfPixel);
  float pixelZ = cos(zenithOfPixel);
  vec3 pixelPos = vec3(pixelX, pixelY, pixelZ);

  //Get the vector between the moons center and this pixels
  vec3 vectorBetweenPixelAndMoon = moonPosition - pixelPos;

  //Now dot this with the tangent and bitangent vectors to get our location.
  float deltaX = dot(vectorBetweenPixelAndMoon, moonTangent);
  float deltaY = dot(vectorBetweenPixelAndMoon, moonBitangent);
  float angleOfPixel = atan(deltaX, deltaY);

  //And finally, get the magnitude of the vector so that we can calculate the x and y positio
  //below...
  float radiusOfDistanceBetweenPixelAndMoon = length(vectorBetweenPixelAndMoon);

  vec4 returnColor = vec4(0.0);
  if(radiusOfDistanceBetweenPixelAndMoon < angularRadiusOfTheMoon){
    //Hey! We are in the moon! convert our distance into a linear interpolation
    //of half pixel radius on our sampler
    float xPosition = (1.0 + (radiusOfDistanceBetweenPixelAndMoon / angularRadiusOfTheMoon) * sin(angleOfPixel)) / 2.0;
    float yPosition = (1.0 + (radiusOfDistanceBetweenPixelAndMoon  / angularRadiusOfTheMoon) * cos(angleOfPixel)) / 2.0;

    vec2 position = vec2(xPosition, yPosition);

    //Now to grab that color!
    vec4 moonColor = texture2D(moonTexture, position.xy);

    //Get the moon shadow using the normal map
    //Thank you, https://beesbuzz.biz/code/hsv_color_transforms.php!
    vec3 moonNormalMapRGB = texture2D(moonNormalMap, position.xy).rgb;
    vec3 moonNormalMapInverted = vec3(1.0 - moonNormalMapRGB.r, 1.0 - moonNormalMapRGB.g, moonNormalMapRGB.b);
    vec3 moonSurfaceNormal = normalize(2.0 * moonNormalMapInverted.rgb - 1.0);

    //The moon is presumed to be a lambert shaded object, as per:
    //https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Diffuse_Reflection
    moonColor = vec4(moonColor.rgb * max(earthshine, dot(moonSurfaceNormal, moonTangentSpaceSunlight)), moonColor.a);

    //Now that we have the moon color, implement atmospheric effects, just like with the sun
    float moonAngularDiameterCos = cos(angularRadiusOfTheMoon);
    float moondisk = smoothstep(moonAngularDiameterCos,moonAngularDiameterCos+0.00002, skyParams.cosThetaMoon);

    vec3 L0 = (skyParams.moonE * 19000.0 * skyParams.FexMoon) * moondisk;
    L0 *= 0.04;
    L0 += vec3(0.0,0.001,0.0025)*0.3;

    float g_fMaxLuminance = 1.0;
    float fLumScaled = 0.1 / luminance;
    float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);

    float ExposureBias = fLumCompressed;

    vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));
    vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*L0);

    vec3 color = curr*whiteScale;
    color = pow(color,abs(vec3(1.0/(1.2+(1.2* (skyParams.moonfade)))) ));

    vec3 colorIntensity = pow(color, vec3(2.2));
    vec3 moonIntensity = pow(moonColor.xyz, vec3(2.2));
    vec3 combinedIntensity = colorIntensity * moonIntensity;

    //TODO: We have both colors together, now we just have to appropriately mix them
    returnColor = vec4(pow(combinedIntensity, vec3(1.0/2.2)), moonColor.a);
  }

  //Otherwise, we shall return nothing for now. In the future, perhaps we will implement the
  return returnColor;
}

skyparams drawSkyLayer(float azimuthOfPixel, float altitudeOfPixel){
  //Get the fading of the sun and the darkening of the sky
  float sunAz = sunPosition.x;
  float sunAlt = sunPosition.y;
  float zenithAngle = piOver2 - sunAlt; //This is not a zenith angle, this is altitude
  float sunX = sunXYZPosition.x;
  float sunZ = sunXYZPosition.z;
  float sunY = sunXYZPosition.y;
  float moonAz = moonAzimuthAndAltitude.x;
  float moonAlt = moonAzimuthAndAltitude.y;
  float moonZenithAngle = piOver2 - moonAlt;
  float moonX = moonXYZPosition.x;
  float moonZ = moonXYZPosition.z;
  float moonY = moonXYZPosition.y;

  float sunfade = 1.0-clamp(1.0-exp(sunZ),0.0,1.0);
  float moonfade = 1.0-clamp(1.0-exp(moonZ),0.0,1.0);
  float rayleighCoefficientOfSun = rayleigh - (1.0-sunfade);
  float rayleighCoefficientOfMoon = rayleigh - (1.0-moonfade);

  //Get the sun intensity
  //Using dot(a,b) = ||a|| ||b|| * cos(a, b);
  //Here, the angle between up and the sun direction is always the zenith angle
  //Note in the original code, we normalized the sun direction at this point so that
  //the magnitude of that vector will always be one.
  //while
  vec3 floatSunPosition = normalize(vec3(sunX, sunY, sunZ));
  vec3 floatMoonPosition = normalize(vec3(moonX, moonY, moonZ));
  float dotOfSunDirectionAndUp = dot(floatSunPosition, up);
  float dotOfMoonDirectionAndUp = dot(floatMoonPosition, up);
  float sunE = lightIntensity(dotOfSunDirectionAndUp, sunEE);
  float moonE = lightIntensity(dotOfMoonDirectionAndUp, moonEE);

  //Acquire betaR and betaM
  vec3 simplifiedRayleighVal = simplifiedRayleigh();
  vec3 betaRSun = simplifiedRayleighVal * rayleighCoefficientOfSun;
  vec3 betaRMoon = simplifiedRayleighVal * rayleighCoefficientOfMoon;
  vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;

  // Get the current optical length
  // cutoff angle at 90 to avoid singularity in next formula.
  //presuming here that the dot of the sun direction and up is also cos(zenith angle)
  float zenithAngleOfCamera = acos(max(0.0, dot(up, normalize(vWorldPosition))));
  float sR = rayleighZenithLength / (cos(zenithAngleOfCamera) + 0.15 * pow(93.885 - ((zenithAngleOfCamera * 180.0) / pi), -1.253));
  float sM = mieZenithLength / (cos(zenithAngleOfCamera) + 0.15 * pow(93.885 - ((zenithAngleOfCamera * 180.0) / pi), -1.253));

  // combined extinction factor
  vec3 Fex = exp(-(betaRSun * sR + betaM * sM));
  vec3 FexMoon = exp(-(betaRMoon * sR + betaM * sM));

  // in scattering
  float cosTheta = dot(normalize(vWorldPosition - vec3(0.0)), floatSunPosition);
  float cosThetaMoon = dot(normalize(vWorldPosition - vec3(0.0)), floatMoonPosition);

  float rPhase = rayleighPhase(cosTheta*0.5+0.5);
  float rPhaseOfMoon = rayleighPhase(cosThetaMoon * 0.5 + 0.5);
  vec3 betaRTheta = betaRSun * rPhase;
  vec3 betaRThetaMoon = betaRMoon * rPhaseOfMoon;

  float mPhase = hgPhase(cosTheta, mieDirectionalG);
  float mPhaseOfMoon = hgPhase(cosThetaMoon, mieDirectionalG);
  vec3 betaMTheta = betaM * mPhase;
  vec3 betaMThetaOfMoon = betaM * mPhaseOfMoon;

  vec3 Lin = pow((sunE) * ((betaRTheta + betaMTheta) / (betaRSun + betaM)) * (1.0 - Fex),vec3(1.5));
  Lin *= mix(vec3(1.0),pow((sunE) * ((betaRTheta + betaMTheta) / (betaRSun + betaM)) * Fex,vec3(1.0/2.0)),clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0));
  vec3 LinOfMoon = pow((moonE) * ((betaRThetaMoon + betaMThetaOfMoon) / (betaRMoon + betaM)) * (1.0 - FexMoon),vec3(1.5));
  LinOfMoon *= mix(vec3(1.0),pow((moonE) * ((betaRThetaMoon + betaMThetaOfMoon) / (betaRMoon + betaM)) * FexMoon,vec3(1.0/2.0)),clamp(pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0,1.0));

  //nightsky
  vec2 uv = vec2(azimuthOfPixel, (piOver2 - altitudeOfPixel)) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);
  vec3 L0 = vec3(0.1) * (Fex + FexMoon);

  //Final lighting, duplicated above for coloring of sun
  vec3 texColor = (Lin + LinOfMoon + L0);
  texColor *= 0.04 ;
  texColor += vec3(0.0,0.001,0.0025)*0.3;

  float g_fMaxLuminance = 1.0;
  float fLumScaled = 0.1 / luminance;
  float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);

  float ExposureBias = fLumCompressed;

  vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));
  vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);
  vec3 color = curr*whiteScale;

  vec3 retColor = pow(abs(color),vec3(1.0/(1.2+(1.2* (sunfade + moonfade)))));

  return skyparams(cosTheta, cosThetaMoon, Fex, FexMoon, sunE, moonE, Lin, LinOfMoon, sunfade, moonfade, vec4(retColor, 1.0));
}

void main(){
  vec3 pointCoord = normalize(vWorldPosition.xyz);
  float altitude = piOver2 - acos(pointCoord.y);
  float azimuth = atan(pointCoord.z, pointCoord.x) + pi;
  vec4 baseColor = vec4(0.0);

  //Even though everything else is behind the sky, we need this to decide the brightness of the colors returned below.
  //Also, whenever the sun falls below the horizon, everything explodes in the original code.
  //Thus, I have taken the liberty of killing the sky when that happens to avoid explody code.
  skyparams skyParams = drawSkyLayer(azimuth, altitude);
  vec4 skyColor = skyParams.skyColor;

  skyWithAndWithoutStars starLayerData = starLayerBlending(drawStarLayer(azimuth, altitude, baseColor), skyColor, skyParams.sunE);
  vec4 outColor = starLayerData.starLayer;

	gl_FragColor = outColor;
}
