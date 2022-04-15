StarrySky.Materials.Atmosphere.atmosphereShader = {
  uniforms: function(isSunShader = false, isMoonShader = false, isMeteringShader = false){
    let uniforms = {
      uTime: {value: 0.0},
      localSiderealTime: {value: 0.0},
      latitude: {value: 0.0},
      sunPosition: {value: new THREE.Vector3()},
      moonPosition: {value: new THREE.Vector3()},
      moonLightColor: {value: new THREE.Vector3()},
      mieInscatteringSum: {value: new THREE.DataTexture3D()},
      rayleighInscatteringSum: {value: new THREE.DataTexture3D()},
      transmittance: {value: null},
      sunHorizonFade: {value: 1.0},
      moonHorizonFade: {value: 1.0},
      scatteringSunIntensity: {value: 20.0},
      scatteringMoonIntensity: {value: 1.4}
    }

    if(!isSunShader){
      uniforms.blueNoiseTexture = {value: null};
      uniforms.auroraSampler1 = {value: null};
      uniforms.auroraSampler2 = {value: null};
    }

    //Pass our specific uniforms in here.
    if(isSunShader){
      uniforms.sunAngularDiameterCos = {value: 1.0};
      uniforms.radiusOfSunPlane = {value: 1.0};
      uniforms.moonRadius = {value: 1.0};
      uniforms.worldMatrix = {value: new THREE.Matrix4()};
      uniforms.solarEclipseMap = {value: null};
      uniforms.moonDiffuseMap = {value: null};
    }
    else if(isMoonShader){
      uniforms.moonExposure = {value: 1.0};
      uniforms.moonAngularDiameterCos = {value: 1.0};
      uniforms.sunRadius = {value: 1.0};
      uniforms.radiusOfMoonPlane = {value: 1.0};
      uniforms.distanceToEarthsShadowSquared = {value: 1.0};
      uniforms.oneOverNormalizedLunarDiameter = {value: 1.0};
      uniforms.worldMatrix = {value: new THREE.Matrix4()};
      uniforms.sunLightDirection = {value: new THREE.Vector3()};
      uniforms.earthsShadowPosition = {value: new THREE.Vector3()};
      uniforms.moonDiffuseMap = {value: null};
      uniforms.moonNormalMap = {value: null};
      uniforms.moonRoughnessMap = {value: null};
      uniforms.moonApertureSizeMap = {value: null};
      uniforms.moonApertureOrientationMap = {value: null};
    }

    if(!isSunShader){
      uniforms.starHashCubemap = {value: null};
      uniforms.dimStarData = {value: null};
      uniforms.medStarData = {value: null};
      uniforms.brightStarData = {value: null};
      uniforms.starColorMap = {value: null};

      uniforms.mercuryPosition = {value: new THREE.Vector3()};
      uniforms.venusPosition = {value: new THREE.Vector3()};
      uniforms.marsPosition = {value: new THREE.Vector3()};
      uniforms.jupiterPosition = {value: new THREE.Vector3()};
      uniforms.saturnPosition = {value: new THREE.Vector3()};

      uniforms.mercuryBrightness = {value: 0.0};
      uniforms.venusBrightness = {value: 0.0};
      uniforms.marsBrightness = {value: 0.0};
      uniforms.jupiterBrightness = {value: 0.0};
      uniforms.saturnBrightness = {value: 0.0};
    }

    if(!isSunShader && !isMeteringShader){
      uniforms.starsExposure = {value: -4.0};
    }

    if(isMeteringShader){
      uniforms.sunLuminosity = {value: 20.0};
      uniforms.moonLuminosity = {value: 1.4};
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
    'precision highp sampler3D;',

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
    'uniform vec3 moonLightColor;',
    'uniform sampler3D mieInscatteringSum;',
    'uniform sampler3D rayleighInscatteringSum;',
    'uniform sampler2D transmittance;',

    '#if(!$isSunPass)',
      'uniform sampler2D blueNoiseTexture;',
      'uniform sampler2D auroraSampler1;',
      'uniform sampler2D auroraSampler2;',
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
      'uniform float distanceToEarthsShadowSquared;',
      'uniform float oneOverNormalizedLunarDiameter;',
      'uniform vec3 earthsShadowPosition;',
      'uniform sampler2D moonDiffuseMap;',
      'uniform sampler2D moonNormalMap;',
      'uniform sampler2D moonRoughnessMap;',
      'uniform sampler2D moonApertureSizeMap;',
      'uniform sampler2D moonApertureOrientationMap;',
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

    '#if(!$isSunPass)',
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
    '#endif',

    '#if(!$isSunPass && !$isMeteringPass)',
      'vec3 getSpectralColor(){',
        'return vec3(1.0);',
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

        'vec3 starColor = texture(starColorMap, uv).rgb;',
        '//TODO: Vary these to change the color colors',
        '// starColor *= starColor;',
        '// starColor.r *= max((zCoordinate / 31.0), 1.0);',
        '// starColor.g *= max((zCoordinate / 31.0), 1.0);',
        '// starColor.b *= max((zCoordinate / 10.0), 1.0);',
        '// starColor = sqrt(starColor);',

        '//Interpolate between the 2 colors (ZCoordinateC and zCoordinate are never more then 1 apart)',
        'return starColor;',
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
        'float starBrightness = pow(150.0, (-starData.a + min(starAndSkyExposureReduction, 2.7)) * 0.20);',
        'float approximateDistanceOnSphereStar = distance(galacticSphericalPosition, normalizedStarPosition) * 1700.0;',

        '//Modify the intensity and color of this star using approximation of stellar scintillation',
        'vec3 starColor = getStarColor(temperature, distanceToEdgeOfSky, colorTwinkleFactor(normalizedStarPosition));',

        '//Pass this brightness into the fast Airy function to make the star glow',
        'starBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0) * twinkleFactor(normalizedStarPosition, distanceToEdgeOfSky, sqrt(starBrightness) + 3.0);',
        'return vec3(sqrt(starBrightness)) * pow(starColor, vec3(1.2));',
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

    '#if($isMoonPass)',
    'vec3 getLunarEcclipseShadow(vec3 sphericalPosition){',
      '//Determine the distance from this pixel to the center of the sun.',
      'float distanceToPixel = distance(sphericalPosition, earthsShadowPosition);',
      'float pixelToCenterDistanceInMoonDiameter = 4.0 * distanceToPixel * oneOverNormalizedLunarDiameter;',
      'float umbDistSq = pixelToCenterDistanceInMoonDiameter * pixelToCenterDistanceInMoonDiameter * 0.5;',
      'float pUmbDistSq = umbDistSq * 0.3;',
      'float umbraBrightness = 0.5 + 0.5 * clamp(umbDistSq, 0.0, 1.0);',
      'float penumbraBrightness = 0.15 + 0.85 * clamp(pUmbDistSq, 0.0, 1.0);',
      'float totalBrightness = clamp(min(umbraBrightness, penumbraBrightness), 0.0, 1.0);',

      '//Get color intensity based on distance from penumbra',
      'vec3 colorOfLunarEcclipse = vec3(1.0, 0.45, 0.05);',
      'float colorIntensity = clamp(16.0 * distanceToEarthsShadowSquared * oneOverNormalizedLunarDiameter * oneOverNormalizedLunarDiameter, 0.0, 1.0);',
      'colorOfLunarEcclipse = clamp(colorOfLunarEcclipse + (1.0 - colorOfLunarEcclipse) * colorIntensity, 0.0, 1.0);',

      'return totalBrightness * colorOfLunarEcclipse;',
    '}',
    '#endif',

    '#if(!$isSunPass)',
      "//I'm gonna do something weird. I propose that aurora look an aweful lot",
      '//like water caustics - slower, with some texture ripples introduced with',
      '//perlin noise.',
      '//',
      "//To create my fake water caustics, I'm going to linearize and combine",
      '//multiple tileable shader items to create the effect.',
      '//From https://www.shadertoy.com/view/Msf3WH (MIT License)',
      'vec2 hash(vec2 p){',
        'vec2 p2 = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));',
        'return 2.0 * fract(sin(p2) * 43758.5453123) - 1.0;',
      '}',

      'float perlinNoise(vec2 p){',
        'const float K1 = 0.366025404; // (sqrt(3)-1)/2;',
        'const float K2 = 0.211324865; // (3-sqrt(3))/6;',

        'vec2  i = floor(p + (p.x + p.y) * K1);',
        'vec2  a = p - i + (i.x + i.y) * K2;',
        'float m = step(a.y, a.x);',
        'vec2  o = vec2(m, 1.0 - m);',
        'vec2  b = a - o + K2;',
        'vec2  c = a - 1.0 + 2.0 * K2;',
        'vec3  h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c) ), 0.0);',
        'vec3  n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));',

        'return dot(n, vec3(70.0));',
      '}',

      'float auroraHeightmap(vec2 uv, float t){',
        'float halfTime = 0.5 * t;',
        'float quarterTime = 0.5 * halfTime;',

        '//Offsets from the perlin noise',
        'float perlinOffset1 = perlinNoise(16.0 * (uv + vec2(0.1, 0.2) * t));',
        'float perlinOffset2 = perlinNoise(16.0 * (uv - vec2(0.4, 0.3) * halfTime));',
        'vec2 pSample = vec2(perlinOffset1, perlinOffset2);',

        '//Sample our caustic shader',
        'float aSample1 = texture(auroraSampler1, (uv + vec2(0.8, 0.1) * quarterTime + pSample * 0.025) * 0.25).r;',
        'float aSample2 = texture(auroraSampler1, (uv + vec2(0.8, 0.1) * quarterTime) * 0.25).r;',
        'float aSample3 = texture(auroraSampler2, (uv - vec2(0.2, 0.7) * quarterTime) * 0.25).r;',
        'float aSample4 = texture(auroraSampler2, (uv - vec2(0.2, 0.7) * quarterTime + pSample * 0.025) * 0.25).r;',

        '//Combine our caustic shader results',
        'float cSample1 = max(pow(aSample1, 2.2), pow(aSample2, 2.2));',
        'float cSample2 = max(pow(aSample3, 2.2), pow(aSample4, 2.2));',
        'float cCombined1 = 1.7 * pow(min(cSample1, cSample2), inverseGamma.x);',

        'return cCombined1 * cCombined1;',
      '}',

      '//Is this scientifically correct?! No, I doubt it. I just grabbed some relative values',
      "//and I'm hoping this will give me a nice sense of varying these things.",
      '//Note that both magenta nitrogen aurora and red aurora are rather rare, so you are',
      '//unlikely to see them, their values are set as such below, and use electron velocity',
      "//in combination with the aurora 'height' (which is a rough estimate for quantity)",
      '//to determine which aurora is visible. At this point, we are just faking it till',
      '//we can get more accurate values for simulating this.',
      'vec3 auroraColor(float auroraNoiseValue, float heightOfRay, float avgElectronVelocityScalar){',
        'vec3 excitedNitrogenSpectrumEmission = pow(vec3(0.74, 0.384, 1.0), gamma); //Visible in intense displays below 60-120km. (magenta)',
        'vec3 molecularO2SpectralEmission = pow(vec3(0.318, 1.0, 0.56), gamma); //Below 100km-250km.',
        'vec3 atomicOxygenSpectralEmission = pow(vec3(1.0, 0.0, 0.145), gamma); //Beginning at 150km-600km (red)',

        'float h = heightOfRay - RADIUS_OF_EARTH;',
        'vec3 outputLightIntensity = vec3(0.0);',
        'float centroidValue;',
        'float linearIntensityFader;',

        '//Nitrogen contribution',
        'if(h > 60.0 && h < 120.0){',
          'centroidValue = (h - 90.0) / 70.0;',
          '//linearIntensityFader = clamp(auroraNoiseValue - 0.8, 0.0, 1.0) * clamp(avgElectronVelocityScalar - 0.8, 0.0, 1.0);',
          'linearIntensityFader = clamp(auroraNoiseValue - 0.12, 0.0, 1.0);',
          'outputLightIntensity += 4.0 * excitedNitrogenSpectrumEmission * linearIntensityFader * exp(-centroidValue * centroidValue);',
        '}',

        '//Molecular oxygen contribution',
        'if(h > 100.0 && h < 250.0){',
          'centroidValue = (h - 175.0) / 50.5;',
          '//linearIntensityFader = clamp(auroraNoiseValue, 0.0, 1.0) * clamp(avgElectronVelocityScalar - 0.2, 0.0, 1.0);',
          'linearIntensityFader = clamp(auroraNoiseValue - 0.02, 0.0, 1.0);',
          'outputLightIntensity += 2.0 * molecularO2SpectralEmission * linearIntensityFader * exp(-centroidValue * centroidValue);',
        '}',

        '//Atomic oxygen contribution',
        'if(h > 150.0 && h < 600.0){',
          'centroidValue = (h - 375.0) / 80.5;',
          'linearIntensityFader = clamp(auroraNoiseValue - 0.12, 0.0, 1.0);',
          'outputLightIntensity += 0.3 * atomicOxygenSpectralEmission * linearIntensityFader * exp(-centroidValue * centroidValue);',
        '}',

        'return max(vec3(outputLightIntensity), 0.0);',
      '}',

      'float interceptPlaneSurface(vec3 rayStartPosition, vec3 rayDirection, float height){',
        'return rayDirection.y == 0.0 ? -1.0 : (height - rayStartPosition.y) / rayDirection.y;',
      '}',

      'vec3 auroraRayMarchPass(vec3 rayStartPosition, vec3 rayDirection, float starAndSkyExposureReduction){',
        '//Set up the initial conditions of our ray marcher.',
        '//Note that our aurora ray marcher is a little different',
        '//then a standard ray marcher as we expect less contributions from greater',
        '//heights, allowing us to take expontial steps to reduce the number of texture',
        '//samples.',
        'float numberOfStepFloat = 64.0;',
        'float uvScaling = 4.0;',
        'float rayInterceptStartTime = min(interceptPlaneSurface(rayStartPosition, rayDirection, RADIUS_OF_AURORA_BOTTOM), 2500.0);',
        'float rayInterceptEndTime = min(interceptPlaneSurface(rayStartPosition, rayDirection, RADIUS_OF_AURORA_TOP), 3300.0);',
        'float rayDeltaT = (rayInterceptEndTime - rayInterceptStartTime) / numberOfStepFloat;',
        'float auroraNoiseValue;',
        'vec3 auroraColorValue0;',
        'vec3 auroraColorValuef;',
        'vec3 lastPosition;',
        'vec3 linearAuroraGlow = vec3(0.0);',
        'float auroraBrightness = pow(150.0, min(starAndSkyExposureReduction, 2.7) * 0.20);',
        'if(rayInterceptStartTime > 0.0){',
          'lastPosition = rayStartPosition + rayInterceptStartTime * rayDirection;',
          'vec2 auroraNoiseTextureUV = vec2(lastPosition.x, lastPosition.z);',
          'auroraNoiseValue = auroraHeightmap(auroraNoiseTextureUV / 512.0, uTime / 16000.0);',
          'auroraColorValue0 = auroraColor(auroraNoiseValue, lastPosition.y, 0.5); //Setting the velocity value to a constant while we test this out.',
          'float totalD = 0.0;',
          'for(float i = 1.0; i < numberOfStepFloat; i++){',
            '//Determine the position of our raymarcher in the sky',
            'float blueNoise = texture(blueNoiseTexture, vec2(lastPosition.x, lastPosition.z) / 128.0).r;',
            'vec3 currentPosition = lastPosition + rayDirection * (rayDeltaT  * blueNoise);',
            'float d = distance(currentPosition, lastPosition);',
            'totalD += d;',

            '//Get our spherical coordinates for spherical uv mapping',

            'auroraNoiseTextureUV = vec2(currentPosition.x, currentPosition.z);',
            'auroraNoiseValue = auroraHeightmap(auroraNoiseTextureUV / 1600.0, uTime / 16000.0);',
            'auroraColorValuef = auroraColor(auroraNoiseValue, currentPosition.y, 0.5); //Setting the velocity value to a constant while we test this out.',
            'linearAuroraGlow += 0.5 * (auroraColorValue0 + auroraColorValuef) * d;//We linearly scale by the longer distances to cancel out the effect of fewer samples',

            '//Save the current position as the last position so we can determine the distance between points the next time',
            'lastPosition = currentPosition;',
            'auroraColorValue0 = auroraColorValuef;',
          '}',
          'linearAuroraGlow = 0.2 * linearAuroraGlow / (RADIUS_OF_AURORA_TOP - RADIUS_OF_AURORA_BOTTOM);',
        '}',

        'return linearAuroraGlow * auroraBrightness; //Linear multiplier for artistic control',
      '}',
    '#endif',

    'vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 sourceIntensity, vec3 sphericalPosition, sampler3D mieLookupTable, sampler3D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){',
      'float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, sphericalPosition);',
      'float cosOFAngleBetweenZenithAndSource = sourcePosition.y;',
      'vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));',

      '//Interpolated scattering values',
      'vec3 interpolatedMieScattering = texture(mieLookupTable, uv3).rgb;',
      'vec3 interpolatedRayleighScattering = texture(rayleighLookupTable, uv3).rgb;',

      'return intensityFader * sourceIntensity * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);',
    '}',

    '//Including this because someone removed this in a future version of THREE. Why?!',
    'vec3 MyAESFilmicToneMapping(vec3 color) {',
      'return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);',
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
      'vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(max(cosOfViewAngle, 0.0)), parameterizationOfHeightToY(RADIUS_OF_EARTH));',
      'vec3 transmittanceFade = texture(transmittance, uv2OfTransmittance).rgb;',

      '//In the event that we have a moon shader, we need to block out all astronomical light blocked by the moon',
      '#if($isMoonPass)',
        '//Get our lunar occlusion texel',
        'vec2 offsetUV = clamp(vUv * 4.0 - vec2(1.5), vec2(0.0), vec2(1.0));',
        'vec4 lunarDiffuseTexel = texture(moonDiffuseMap, offsetUV);',
        'vec3 lunarDiffuseColor = lunarDiffuseTexel.rgb;',
      '#elif($isSunPass)',
        '//Get our lunar occlusion texel in the frame of the sun',
        'vec2 offsetUV = clamp(vUv * 4.0 - vec2(1.5), vec2(0.0), vec2(1.0));',
        'float lunarMask = texture(moonDiffuseMap, offsetUV).a;',
      '#endif',

      '//Atmosphere (We multiply the scattering sun intensity by vec3 to convert it to a vector)',
      'vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity * vec3(1.0), sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);',
      'vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity * moonLightColor, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, moonHorizonFade, uv2OfTransmittance);',
      'vec3 baseSkyLighting = 0.25 * vec3(2E-3, 3.5E-3, 9E-3) * transmittanceFade;',

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
        'vec4 starData = texture(dimStarData, vec2(starXCoordinate, starYCoordinate));',
        'vec3 galacticLighting = max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        '//Blue',
        'scaledBits = starHashData.b * 255.0;',
        'leftBits = floor(scaledBits / 64.0);',
        'starXCoordinate = (rightBits + leftBits * 8.0) / 31.0; //Medium Star',
        'rightBits = scaledBits - leftBits * 64.0;',
        'leftBits = floor(rightBits / 2.0);',
        'starYCoordinate = (leftBits  / 31.0); //Medium Star',

        '//Add the medium stars lighting',
        'starData = texture(medStarData, vec2(starXCoordinate, starYCoordinate));',
        'galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        '//Alpha',
        'scaledBits = starHashData.a * 255.0;',
        'leftBits = floor(scaledBits / 32.0);',
        'starXCoordinate = leftBits / 7.0;',
        'rightBits = scaledBits - leftBits * 32.0;',
        'leftBits = floor(rightBits / 4.0);',
        'starYCoordinate = leftBits  / 7.0;',

        '//Add the bright stars lighting',
        'starData = texture(brightStarData, vec2(starXCoordinate, starYCoordinate));',
        'galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        '//Check our distance from each of the four primary planets',
        'galacticLighting += max(drawPlanetLight(mercuryColor, mercuryBrightness, mercuryPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting += max(drawPlanetLight(venusColor, venusBrightness, venusPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting += max(drawPlanetLight(marsColor, marsBrightness, marsPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting += max(drawPlanetLight(jupiterColor, jupiterBrightness, jupiterPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting += max(drawPlanetLight(saturnColor, saturnBrightness, saturnPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',
        'galacticLighting = pow(galacticLighting, gamma);',

        '//Add our aurora light to all of this',
        'galacticLighting += auroraRayMarchPass(vec3(0.0, RADIUS_OF_EARTH, 0.0), sphericalPosition, starAndSkyExposureReduction);',

        '//Apply the transmittance function to all of our light sources',
        'galacticLighting = galacticLighting * transmittanceFade;',
      '#endif',

      '//Sun and Moon layers',
      '#if($isSunPass)',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting;',

        '$draw_sun_pass',

        'combinedPass = pow(MyAESFilmicToneMapping(combinedPass + sunTexel), inverseGamma);',
      '#elif($isMoonPass)',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting;',
        'vec3 earthsShadow = getLunarEcclipseShadow(sphericalPosition);',

        '$draw_moon_pass',

        '//Now mix in the moon light',
        'combinedPass = mix(combinedPass + galacticLighting, combinedPass + moonTexel, lunarDiffuseTexel.a);',

        '//And bring it back to the normal gamma afterwards',
        'combinedPass = pow(MyAESFilmicToneMapping(combinedPass), inverseGamma);',
      '#elif($isMeteringPass)',
        '//Cut this down to the circle of the sky ignoring the galatic lighting',
        'float circularMask = 1.0 - step(1.0, rho);',
        'vec3 combinedPass = (lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting) * circularMask;',

        '//Combine the colors together and apply a transformation from the scattering intensity to the moon luminosity',
        'vec3 intensityPassColors = lunarAtmosphericPass * (moonLuminosity / scatteringMoonIntensity) + solarAtmosphericPass * (sunLuminosity / scatteringSunIntensity);',

        '//Get the greyscale color of the sky for the intensity pass verses the r, g and b channels',
        'float intensityPass = (0.3 * intensityPassColors.r + 0.59 * intensityPassColors.g + 0.11 * intensityPassColors.b) * circularMask;',

        '//Now apply the ACESFilmicTonemapping',
        'combinedPass = pow(MyAESFilmicToneMapping(combinedPass), inverseGamma);',
      '#else',
        '//Regular atmospheric pass',
        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + galacticLighting + baseSkyLighting;',

        '//Now apply the ACESFilmicTonemapping',
        'combinedPass = pow(MyAESFilmicToneMapping(combinedPass), inverseGamma);',

        '//Now apply the blue noise',
        'combinedPass += (texelFetch(blueNoiseTexture, (ivec2(gl_FragCoord.xy) + ivec2(128.0 * noise(uTime),  128.0 * noise(uTime + 511.0))) % 128, 0).rgb - vec3(0.5)) / vec3(128.0);',
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
