//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Atmosphere.atmosphereShader = {
  uniforms: function(isSunShader = false, isMoonShader = false, isMeteringShader = false){
    let uniforms = {
      uTime: {type: 'f', value: 0.0},
      localSiderealTime: {type: 'f', value: 0.0},
      latitude: {type: 'f', value: 0.0},
      sunPosition: {type: 'vec3', value: new THREE.Vector3()},
      moonPosition: {type: 'vec3', value: new THREE.Vector3()},
      mieInscatteringSum: {type: 't', value: null},
      rayleighInscatteringSum: {type: 't', value: null},
      transmittance: {type: 't', value: null},
      sunHorizonFade: {type: 'f', value: 1.0},
      moonHorizonFade: {type: 'f', value: 1.0},
      scatteringSunIntensity: {type: 'f', value: 20.0},
      scatteringMoonIntensity: {type: 'f', value: 1.4}
    }

    if(!isSunShader && !isMoonShader && !isMeteringShader){
      uniforms.blueNoiseTexture = {type: 't', value: null};
    }

    //Pass our specific uniforms in here.
    if(isSunShader){
      uniforms.sunAngularDiameterCos = {type: 'f', value: 1.0};
      uniforms.radiusOfSunPlane = {type: 'f', value: 1.0};
      uniforms.moonRadius = {type: 'f', value: 1.0};
      uniforms.worldMatrix = {type: 'mat4', value: new THREE.Matrix4()};
      uniforms.solarEclipseMap = {type: 't', value: null};
      uniforms.moonDiffuseMap = {type: 't', value: null};
    }
    else if(isMoonShader){
      uniforms.moonExposure = {type: 'f', value: 1.0};
      uniforms.moonAngularDiameterCos = {type: 'f', value: 1.0};
      uniforms.sunRadius = {type: 'f', value: 1.0};
      uniforms.radiusOfMoonPlane = {type: 'f', value: 1.0};
      uniforms.worldMatrix = {type: 'mat4', value: new THREE.Matrix4()};
      uniforms.sunLightDirection = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.moonDiffuseMap = {type: 't', value: null};
      uniforms.moonNormalMap = {type: 't', value: null};
      uniforms.moonRoughnessMap = {type: 't', value: null};
      uniforms.moonAperatureSizeMap = {type: 't', value: null};
      uniforms.moonAperatureOrientationMap = {type: 't', value: null};
    }

    if(!isSunShader){
      uniforms.starHashCubemap = {type: 't', value: null};
      uniforms.dimStarData = {type: 't', value: null};
      uniforms.medStarData = {type: 't', value: null};
      uniforms.brightStarData = {type: 't', value: null};
      uniforms.starColorMap = {type: 't', value: null};

      uniforms.mercuryPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.venusPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.marsPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.jupiterPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.saturnPosition = {type: 'vec3', value: new THREE.Vector3()};

      uniforms.mercuryBrightness = {type: 'f', value: 0.0};
      uniforms.venusBrightness = {type: 'f', value: 0.0};
      uniforms.marsBrightness = {type: 'f', value: 0.0};
      uniforms.jupiterBrightness = {type: 'f', value: 0.0};
      uniforms.saturnBrightness = {type: 'f', value: 0.0};
    }

    if(!isSunShader && !isMeteringShader){
      uniforms.starsExposure = {type: 'f', value: -4.0};
    }

    if(isMeteringShader){
      uniforms.sunLuminosity = {type: 'f', value: 20.0};
      uniforms.moonLuminosity = {type: 'f', value: 1.4};
    }

    return uniforms;
  },
  vertexShader: [
    'varying vec3 vWorldPosition;',
    'varying vec3 galacticCoordinates;',
    'varying vec2 screenPosition;',
    'uniform float latitude;',
    'uniform float localSiderealTime;',
    'const float northGalaticPoleRightAscension = 3.36601290657539744989;',
    'const float northGalaticPoleDec = 0.473507826066061614219;',
    'const float sinOfNGP = 0.456010959101623894601;',
    'const float cosOfNGP = 0.8899741598379231031239;',
    'const float piTimes2 = 6.283185307179586476925286;',
    'const float piOver2 = 1.5707963267948966192313;',
    'const float threePiOverTwo = 4.712388980384689857693;',
    'const float pi = 3.141592653589793238462;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = normalize(vec3(-worldPosition.z, worldPosition.y, -worldPosition.x));',

      '//Convert coordinate position to RA and DEC',
      'float altitude = piOver2 - acos(vWorldPosition.y);',
      'float azimuth = pi - atan(vWorldPosition.z, vWorldPosition.x);',
      'float declination = asin(sin(latitude) * sin(altitude) - cos(latitude) * cos(altitude) * cos(azimuth));',
      'float hourAngle = atan(sin(azimuth), (cos(azimuth) * sin(latitude) + tan(altitude) * cos(latitude)));',

      '//fmodulo return (a - (b * floor(a / b)));',
      'float a = localSiderealTime - hourAngle;',
      'float rightAscension = a - (piTimes2 * floor(a / piTimes2));',

      '//Convert coordinate position to Galactic Coordinates',
      'float sinOfDec = sin(declination);',
      'float cosOfDec = cos(declination);',
      'float cosOfRaMinusGalacticNGPRa = cos(rightAscension - northGalaticPoleRightAscension);',
      'float galaticLatitude = threePiOverTwo - asin(sinOfNGP * sinOfDec + cosOfNGP * cosOfDec * cosOfRaMinusGalacticNGPRa);',
      'float galaticLongitude = cosOfDec * sin(rightAscension - northGalaticPoleRightAscension);',
      'galaticLongitude = atan(galaticLongitude, cosOfNGP * sinOfDec - sinOfNGP * cosOfDec * cosOfRaMinusGalacticNGPRa) + pi;',
      'galacticCoordinates.x = sin(galaticLatitude) * cos(galaticLongitude);',
      'galacticCoordinates.y = cos(galaticLatitude);',
      'galacticCoordinates.z = sin(galaticLatitude) * sin(galaticLongitude);',

      'vec4 projectionPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      'vec3 normalizedPosition = projectionPosition.xyz / projectionPosition.w;',
      'screenPosition = vec2(0.5) + 0.5 * normalizedPosition.xy;',
      'gl_Position = projectionPosition;',
    '}',
  ].join('\n'),
  fragmentShader: function(mieG, textureWidth, textureHeight, packingWidth, packingHeight, atmosphereFunctions, sunCode = false, moonCode = false, meteringCode = false){
    let originalGLSL = [
    'precision mediump float;',

    'varying vec3 vWorldPosition;',
    'varying vec3 galacticCoordinates;',
    'varying vec2 screenPosition;',

    'uniform float uTime;',
    'uniform vec3 sunPosition;',
    'uniform vec3 moonPosition;',
    'uniform float sunHorizonFade;',
    'uniform float moonHorizonFade;',
    'uniform float scatteringMoonIntensity;',
    'uniform float scatteringSunIntensity;',
    'uniform sampler2D mieInscatteringSum;',
    'uniform sampler2D rayleighInscatteringSum;',
    'uniform sampler2D transmittance;',

    '#if(!$isSunPass && !$isMoonPass && !$isMeteringPass)',
    'uniform sampler2D blueNoiseTexture;',
    '#endif',

    '#if(!$isSunPass && !$isMeteringPass)',
      'uniform samplerCube starHashCubemap;',
      'uniform sampler2D dimStarData;',
      'uniform sampler2D medStarData;',
      'uniform sampler2D brightStarData;',
      'uniform sampler2D starColorMap;',

      'uniform vec3 mercuryPosition;',
      'uniform vec3 venusPosition;',
      'uniform vec3 marsPosition;',
      'uniform vec3 jupiterPosition;',
      'uniform vec3 saturnPosition;',

      'uniform float mercuryBrightness;',
      'uniform float venusBrightness;',
      'uniform float marsBrightness;',
      'uniform float jupiterBrightness;',
      'uniform float saturnBrightness;',

      'const vec3 mercuryColor = vec3(1.0);',
      'const vec3 venusColor = vec3(0.913, 0.847, 0.772);',
      'const vec3 marsColor = vec3(0.894, 0.509, 0.317);',
      'const vec3 jupiterColor = vec3(0.901, 0.858, 0.780);',
      'const vec3 saturnColor = vec3(0.905, 0.772, 0.494);',
    '#endif',

    'const float piOver2 = 1.5707963267948966192313;',
    'const float piTimes2 = 6.283185307179586476925286;',
    'const float pi = 3.141592653589793238462;',
    'const vec3 inverseGamma = vec3(0.454545454545454545454545);',
    'const vec3 gamma = vec3(2.2);',

    '#if($isSunPass)',
      'uniform float sunAngularDiameterCos;',
      'uniform float moonRadius;',
      'uniform sampler2D moonDiffuseMap;',
      'uniform sampler2D solarEclipseMap;',
      'varying vec2 vUv;',
      'const float sunDiskIntensity = 30.0;',

      '//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',
      'const float ac1 = 0.46787619;',
      'const float ac2 = 0.67104811;',
      'const float ac3 = -0.06948355;',
    '#elif($isMoonPass)',
      'uniform float starsExposure;',
      'uniform float moonExposure;',
      'uniform float moonAngularDiameterCos;',
      'uniform float sunRadius;',
      'uniform sampler2D moonDiffuseMap;',
      'uniform sampler2D moonNormalMap;',
      'uniform sampler2D moonRoughnessMap;',
      'uniform sampler2D moonAperatureSizeMap;',
      'uniform sampler2D moonAperatureOrientationMap;',
      'varying vec2 vUv;',

      '//Tangent space lighting',
      'varying vec3 tangentSpaceSunLightDirection;',
      'varying vec3 tangentSpaceViewDirection;',
    '#elif($isMeteringPass)',
      'varying vec2 vUv;',
      'uniform float moonLuminosity;',
      'uniform float sunLuminosity;',
    '#else',
      'uniform float starsExposure;',
    '#endif',

    '$atmosphericFunctions',

    '#if(!$isSunPass && !$isMeteringPass)',
      'vec3 getSpectralColor(){',
        'return vec3(1.0);',
      '}',

      '//From http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/',
      'float rand(float x){',
        'float a = 12.9898;',
        'float b = 78.233;',
        'float c = 43758.5453;',
        'float dt= dot(vec2(x, x) ,vec2(a,b));',
        'float sn= mod(dt,3.14);',
        'return fract(sin(sn) * c);',
      '}',

      '//From The Book of Shaders :D',
      '//https://thebookofshaders.com/11/',
      'float noise(float x){',
        'float i = floor(x);',
        'float f = fract(x);',
        'float y = mix(rand(i), rand(i + 1.0), smoothstep(0.0,1.0,f));',

        'return y;',
      '}',

      'float brownianNoise(float lacunarity, float gain, float initialAmplitude, float initialFrequency, float timeInSeconds){',
        'float amplitude = initialAmplitude;',
        'float frequency = initialFrequency;',

        '// Loop of octaves',
        'float y = 0.0;',
        'float maxAmplitude = initialAmplitude;',
        'for (int i = 0; i < 5; i++) {',
        '	y += amplitude * noise(frequency * timeInSeconds);',
        '	frequency *= lacunarity;',
        '	amplitude *= gain;',
        '}',

        'return y;',
      '}',

      'const float twinkleDust = 0.0010;',
      'float twinkleFactor(vec3 starposition, float atmosphericDistance, float starBrightness){',
        'float randSeed = uTime * twinkleDust + (starposition.x + starposition.y + starposition.z) * 10000.0;',

        '//lacunarity, gain, initialAmplitude, initialFrequency',
        'return 1.0 + (1.0 - atmosphericDistance) * brownianNoise(0.5, 0.2, starBrightness, 6.0, randSeed);',
      '}',

      'float colorTwinkleFactor(vec3 starposition){',
        'float randSeed = uTime * 0.0007 + (starposition.x + starposition.y + starposition.z) * 10000.0;',

        '//lacunarity, gain, initialAmplitude, initialFrequency',
        'return 0.7 * (2.0 * noise(randSeed) - 1.0);',
      '}',

      'float fastAiry(float r){',
        '//Variation of Airy Disk approximation from https://www.shadertoy.com/view/tlc3zM to create our stars brightness',
        'float one_over_r_cubed = 1.0 / abs(r * r * r);',
        'float gauss_r_over_1_4 = exp(-.5 * (0.71428571428 * r) * (0.71428571428 * r));',
        'return abs(r) < 1.88 ? gauss_r_over_1_4 : abs(r) > 6.0 ? 1.35 * one_over_r_cubed : (gauss_r_over_1_4 + 2.7 * one_over_r_cubed) * 0.5;',
      '}',

      'vec2 getUV2OffsetFromStarColorTemperature(float zCoordinate, float normalizedYPosition, float noise){',
        'float row = clamp(floor(zCoordinate / 4.0), 0.0, 8.0); //range: [0-8]',
        'float col = clamp(zCoordinate - row * 4.0, 0.0, 3.0); //range: [0-3]',

        '//Note: We are still in pixel space, our texture areas are 32 pixels wide',
        '//even though our subtextures are only 30x14 pixels due to 1 pixel padding.',
        'float xOffset = col * 32.0 + 15.0;',
        'float yOffset = row * 16.0 + 1.0;',

        'float xPosition =  xOffset + 13.0 * noise;',
        'float yPosition = yOffset + 15.0 * normalizedYPosition;',

        'return vec2(xPosition / 128.0, yPosition / 128.0);',
      '}',

      'vec3 getStarColor(float temperature, float normalizedYPosition, float noise){',
        '//Convert our temperature to a z-coordinate',
        'float zCoordinate = floor(sqrt((temperature - 2000.0) * (961.0 / 15000.0)));//range: [0-31]',
        'vec2 uv = getUV2OffsetFromStarColorTemperature(zCoordinate, normalizedYPosition, noise);',

        '//Interpolate between the 2 colors (ZCoordinateC and zCoordinate are never more then 1 apart)',
        'return texture2D(starColorMap, uv).rgb;',
      '}',

      'vec3 drawStarLight(vec4 starData, vec3 galacticSphericalPosition, vec3 skyPosition, float starAndSkyExposureReduction){',
        '//I hid the temperature inside of the magnitude of the stars equitorial position, as the position vector must be normalized.',
        'float temperature = sqrt(dot(starData.xyz, starData.xyz));',
        'vec3 normalizedStarPosition = starData.xyz / temperature;',

        '//Get the distance the light ray travels',
        'vec2 skyIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), normalize(vec2(length(vec2(skyPosition.xz)), skyPosition.y)));',
        'vec2 normalizationIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), vec2(1.0, 0.0));',
        'float distanceToEdgeOfSky = clamp((1.0 - distance(vec2(0.0, RADIUS_OF_EARTH), skyIntersectionPoint) / distance(vec2(0.0, RADIUS_OF_EARTH), normalizationIntersectionPoint)), 0.0, 1.0);',

        "//Use the distance to the star to determine it's perceived twinkling",
        'float starBrightness = pow(100.0, (-starData.a + starAndSkyExposureReduction) * 0.2);',
        'float approximateDistanceOnSphereStar = distance(galacticSphericalPosition, normalizedStarPosition) * 1400.0;',

        '//Modify the intensity and color of this star using approximation of stellar scintillation',
        'vec3 starColor = getStarColor(temperature, distanceToEdgeOfSky, colorTwinkleFactor(normalizedStarPosition));',

        '//Pass this brightness into the fast Airy function to make the star glow',
        'starBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0) * twinkleFactor(normalizedStarPosition, distanceToEdgeOfSky, sqrt(starBrightness) + 3.0);',
        'return sqrt(vec3(starBrightness)) * starColor;',
      '}',

      'vec3 drawPlanetLight(vec3 planetColor, float planetMagnitude, vec3 planetPosition, vec3 skyPosition, float starAndSkyExposureReduction){',
        "//Use the distance to the star to determine it's perceived twinkling",
        'float planetBrightness = pow(100.0, (-planetMagnitude + starAndSkyExposureReduction) * 0.2);',
        'float approximateDistanceOnSphereStar = distance(skyPosition, planetPosition) * 1400.0;',

        '//Pass this brightness into the fast Airy function to make the star glow',
        'planetBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0);',
        'return sqrt(vec3(planetBrightness)) * planetColor;',
      '}',
    '#endif',

    'vec3 linearAtmosphericPass(vec3 sourcePosition, float sourceIntensity, vec3 sphericalPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){',
      'float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, sphericalPosition);',
      'float cosOFAngleBetweenZenithAndSource = sourcePosition.y;',
      'vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));',
      'float depthInPixels = $textureDepth;',
      'UVInterpolatants solarUVInterpolants = getUVInterpolants(uv3, depthInPixels);',

      '//Interpolated scattering values',
      'vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, solarUVInterpolants.uv0).rgb, texture2D(mieLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);',
      'vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, solarUVInterpolants.uv0).rgb, texture2D(rayleighLookupTable, solarUVInterpolants.uvf).rgb, solarUVInterpolants.interpolationFraction);',

      'return intensityFader * sourceIntensity * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);',
    '}',

    'void main(){',

      '#if($isMeteringPass)',
        'float rho = length(vUv.xy);',
        'float height = sqrt(1.0 - rho * rho);',
        'float phi = piOver2 - atan(height, rho);',
        'float theta = atan(vUv.y, vUv.x);',
        'vec3 sphericalPosition;',
        'sphericalPosition.x = sin(phi) * cos(theta);',
        'sphericalPosition.z = sin(phi) * sin(theta);',
        'sphericalPosition.y = cos(phi);',
        'sphericalPosition = normalize(sphericalPosition);',
      '#else',
        'vec3 sphericalPosition = normalize(vWorldPosition);',
      '#endif',

      '//Get our transmittance for this texel',
      '//Note that for uv2OfTransmittance, I am clamping the cosOfViewAngle',
      '//to avoid edge interpolation in the 2-D texture with a different z',
      'float cosOfViewAngle = sphericalPosition.y;',
      'vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(max(cosOfViewAngle, 0.03125)), parameterizationOfHeightToY(RADIUS_OF_EARTH));',
      'vec3 transmittanceFade = texture2D(transmittance, uv2OfTransmittance).rgb;',

      '//In the event that we have a moon shader, we need to block out all astronomical light blocked by the moon',
      '#if($isMoonPass)',
        '//Get our lunar occlusion texel',
        'vec2 offsetUV = vUv * 2.0 - vec2(0.5);',
        'vec4 lunarDiffuseTexel = texture2D(moonDiffuseMap, offsetUV);',
        'vec2 uvClamp1 = 1.0 - vec2(step(offsetUV.x, 0.0), step(offsetUV.y, 0.0));',
        'vec2 uvClamp2 = 1.0 - vec2(step(1.0 - offsetUV.x, 0.0), step(1.0 - offsetUV.y, 0.0));',
        'vec3 lunarDiffuseColor = lunarDiffuseTexel.rgb;',
        'float lunarMask = lunarDiffuseTexel.a * uvClamp1.x * uvClamp1.y * uvClamp2.x * uvClamp2.y;',
      '#elif($isSunPass)',
        '//Get our lunar occlusion texel in the frame of the sun',
        'float lunarMask = texture2D(moonDiffuseMap, vUv).a;',
      '#endif',

      '//Atmosphere',
      'vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);',
      'vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, moonHorizonFade, uv2OfTransmittance);',

      '//This stuff never shows up near our sun, so we can exclude it',
      '#if(!$isSunPass && !$isMeteringPass)',
        '//Get the intensity of our sky color',
        'vec3 intensityVector = vec3(0.3, 0.59, 0.11);',
        'float starAndSkyExposureReduction =  starsExposure - 10.0 * dot(pow(solarAtmosphericPass + lunarAtmosphericPass, inverseGamma), intensityVector);',

        '//Get the stellar starting id data from the galactic cube map',
        'vec3 normalizedGalacticCoordinates = normalize(galacticCoordinates);',
        'vec4 starHashData = textureCube(starHashCubemap, normalizedGalacticCoordinates);',

        '//Red',
        'float scaledBits = starHashData.r * 255.0;',
        'float leftBits = floor(scaledBits / 2.0);',
        'float starXCoordinate = leftBits / 127.0; //Dim Star',
        'float rightBits = scaledBits - leftBits * 2.0;',

        '//Green',
        'scaledBits = starHashData.g * 255.0;',
        'leftBits = floor(scaledBits / 8.0);',
        'float starYCoordinate = (rightBits + leftBits * 2.0) / 63.0; //Dim Star',
        'rightBits = scaledBits - leftBits * 8.0;',

        '//Add the dim stars lighting',
        'vec4 starData = texture2D(dimStarData, vec2(starXCoordinate, starYCoordinate));',
        'vec3 galacticLighting = max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        '//Blue',
        'scaledBits = starHashData.b * 255.0;',
        'leftBits = floor(scaledBits / 64.0);',
        'starXCoordinate = (rightBits + leftBits * 8.0) / 31.0; //Medium Star',
        'rightBits = scaledBits - leftBits * 64.0;',
        'leftBits = floor(rightBits / 2.0);',
        'starYCoordinate = (leftBits  / 31.0); //Medium Star',

        '//Add the medium stars lighting',
        'starData = texture2D(medStarData, vec2(starXCoordinate, starYCoordinate));',
        'galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        '//Alpha',
        'scaledBits = starHashData.a * 255.0;',
        'leftBits = floor(scaledBits / 32.0);',
        'starXCoordinate = leftBits / 7.0;',
        'rightBits = scaledBits - leftBits * 32.0;',
        'leftBits = floor(rightBits / 4.0);',
        'starYCoordinate = leftBits  / 7.0;',

        '//Add the bright stars lighting',
        'starData = texture2D(brightStarData, vec2(starXCoordinate, starYCoordinate));',
        'galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        '//Check our distance from each of the four primary planets',
        'galacticLighting += max(drawPlanetLight(mercuryColor, mercuryBrightness, mercuryPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting += max(drawPlanetLight(venusColor, venusBrightness, venusPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting += max(drawPlanetLight(marsColor, marsBrightness, marsPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting += max(drawPlanetLight(jupiterColor, jupiterBrightness, jupiterPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting += max(drawPlanetLight(saturnColor, saturnBrightness, saturnPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        '//Apply the transmittance function to all of our light sources',
        'galacticLighting = pow(galacticLighting, gamma) * transmittanceFade;',
      '#endif',

      '//Sun and Moon layers',
      '#if($isSunPass)',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass;',

        '$draw_sun_pass',

        'combinedPass = pow(ACESFilmicToneMapping(combinedPass + pow(sunTexel, gamma)), inverseGamma);',
      '#elif($isMoonPass)',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass;',

        '$draw_moon_pass',

        '//Now mix in the moon light',
        'combinedPass = mix(combinedPass + galacticLighting, combinedPass + moonTexel, lunarMask);',

        '//And bring it back to the normal gamma afterwards',
        'combinedPass = pow(ACESFilmicToneMapping(combinedPass), inverseGamma);',
      '#elif($isMeteringPass)',
        '//Cut this down to the circle of the sky ignoring the galatic lighting',
        'float circularMask = 1.0 - step(1.0, rho);',
        'vec3 combinedPass = (lunarAtmosphericPass + solarAtmosphericPass) * circularMask;',

        '//Combine the colors together and apply a transformation from the scattering intensity to the moon luminosity',
        'vec3 intensityPassColors = lunarAtmosphericPass * (moonLuminosity / scatteringMoonIntensity) + solarAtmosphericPass * (sunLuminosity / scatteringSunIntensity);',

        '//Get the greyscale color of the sky for the intensity pass verses the r, g and b channels',
        'float intensityPass = (0.3 * intensityPassColors.r + 0.59 * intensityPassColors.g + 0.11 * intensityPassColors.b) * circularMask;',

        '//Now apply the ACESFilmicTonemapping',
        'combinedPass = pow(ACESFilmicToneMapping(combinedPass), inverseGamma);',
      '#else',
        '//Regular atmospheric pass',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + galacticLighting;',

        '//Now apply the ACESFilmicTonemapping',
        'combinedPass = pow(ACESFilmicToneMapping(combinedPass), inverseGamma);',

        '//Now apply the blue noise',
        'combinedPass += ((texture2D(blueNoiseTexture, screenPosition.xy * 11.0).rgb - vec3(0.5)) / vec3(128.0));',
      '#endif',

      '#if($isMeteringPass)',
        'gl_FragColor = vec4(combinedPass, intensityPass);',
      '#else',
        '//Triangular Blue Noise Dithering Pass',
        'gl_FragColor = vec4(combinedPass, 1.0);',
      '#endif',
    '}',
    ];

    let mieGSquared = mieG * mieG;
    let miePhaseFunctionCoefficient = (1.5 * (1.0 - mieGSquared) / (2.0 + mieGSquared));
    let textureDepth = packingWidth * packingHeight;

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$atmosphericFunctions/g, atmosphereFunctions);
      updatedGLSL = updatedGLSL.replace(/\$mieG/g, mieG.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$mieGSquared/g, mieGSquared.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$miePhaseFunctionCoefficient/g, miePhaseFunctionCoefficient.toFixed(16));

      //Texture constants
      updatedGLSL = updatedGLSL.replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureDepth/g, textureDepth.toFixed(1));

      //Additional injected code for sun and moon
      if(moonCode !== false){
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '1');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, moonCode);
        updatedGLSL = updatedGLSL.replace(/\$isMeteringPass/g, '0');
      }
      else if(sunCode !== false){
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '1');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, sunCode);
        updatedGLSL = updatedGLSL.replace(/\$isMeteringPass/g, '0');
      }
      else if(meteringCode !== false){
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isMeteringPass/g, '1');
      }
      else{
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isMeteringPass/g, '0');
      }

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
}
