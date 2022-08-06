//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Moon.baseMoonPartial = {
  fragmentShader: function(moonAngularDiameter){
    let originalGLSL = [
    '//We enter and leave with additionalPassColor, which we add our moon direct',
    '//lighting to, after it has been attenuated by our transmittance.',

    '//Calculate the light from the moon. Note that our normal is on a quad, which makes',
    '//transforming our normals really easy, as we just have to transform them by the world matrix.',
    '//and everything should work out. Furthermore, the light direction for the moon should just',
    '//be our sun position in the sky.',
    'vec3 texelNormal = normalize(2.0 * texture2D(moonNormalMap, offsetUV).rgb - 1.0);',

    '//Lunar surface roughness from https://sos.noaa.gov/datasets/moon-surface-roughness/',
    'float moonRoughnessTexel = piOver2 - (1.0 - texture2D(moonRoughnessMap, offsetUV).r);',

    '//Implmentatation of the Ambient Appeture Lighting Equation',
    'float sunArea = pi * sunRadius * sunRadius;',
    'float apertureRadius = acos(1.0 - texture2D(moonApertureSizeMap, offsetUV).r);',
    'vec3 apertureOrientation = normalize(2.0 * texture2D(moonApertureOrientationMap, offsetUV).rgb - 1.0);',
    'float apertureToSunHaversineDistance = acos(dot(apertureOrientation, tangentSpaceSunLightDirection));',

    'float observableSunFraction;',
    'vec3 test = vec3(0.0);',
    'if(apertureToSunHaversineDistance >= (apertureRadius + sunRadius)){',
      'observableSunFraction = 0.0;',
    '}',
    'else if(apertureToSunHaversineDistance <= (apertureRadius - sunRadius)){',
      'observableSunFraction = 1.0;',
    '}',
    'else{',
      'float absOfRpMinusRl = abs(apertureRadius - sunRadius);',
      'observableSunFraction = smoothstep(0.0, 1.0, 1.0 - ((apertureToSunHaversineDistance - absOfRpMinusRl) / (apertureRadius + sunRadius - absOfRpMinusRl)));',
    '}',
    'float omega = (sunRadius - apertureRadius + apertureToSunHaversineDistance) / (2.0 * apertureToSunHaversineDistance);',
    'vec3 bentTangentSpaceSunlightDirection = normalize(mix(tangentSpaceSunLightDirection, apertureOrientation, omega));',

    '//I opt to use the Oren-Nayar model over Hapke-Lommel-Seeliger',
    '//As Oren-Nayar lacks a lunar phase component and is more extensible for',
    '//Additional parameters, I used the following code as a guide',
    '//https://patapom.com/blog/BRDF/MSBRDFEnergyCompensation/#fn:4',
    'float NDotL = max(dot(bentTangentSpaceSunlightDirection, texelNormal), 0.0);',
    'float NDotV = max(dot(tangentSpaceViewDirection, texelNormal), 0.0);',
    'float gamma = dot(tangentSpaceViewDirection - texelNormal * NDotV, bentTangentSpaceSunlightDirection - texelNormal * NDotL);',
    'gamma = gamma / (sqrt(clamp(1.0 - NDotV * NDotV, 0.0, 1.0)) * sqrt(clamp(1.0 - NDotL * NDotL, 0.0, 1.0)));',
    'float roughnessSquared = moonRoughnessTexel * moonRoughnessTexel;',
    'float A = 1.0 - 0.5 * (roughnessSquared / (roughnessSquared + 0.33));',
    'float B = 0.45 * (roughnessSquared / (roughnessSquared + 0.09));',
    'vec2 cos_alpha_beta = NDotV < NDotL ? vec2(NDotV, NDotL) : vec2(NDotL, NDotV);',
    'vec2 sin_alpha_beta = sqrt(clamp(1.0 - cos_alpha_beta * cos_alpha_beta, 0.0, 1.0));',
    'float C = sin_alpha_beta.x * sin_alpha_beta.y / (1e-6 + cos_alpha_beta.y);',

    'vec3 moonTexel = 2.0 * observableSunFraction * NDotL * (A + B * max(0.0, gamma) * C) * lunarDiffuseColor * transmittanceFade * earthsShadow;',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$moonAngularDiameter/g, moonAngularDiameter.toFixed(5));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  },
  vertexShader: [
    'attribute vec4 tangent;',

    'uniform float radiusOfMoonPlane;',
    'uniform mat4 worldMatrix;',
    'uniform vec3 sunLightDirection;',

    'varying vec3 vWorldPosition;',
    'varying vec3 vLocalPosition;',
    'varying vec2 vUv;',
    'varying vec3 tangentSpaceSunLightDirection;',
    'varying vec3 tangentSpaceViewDirection;',

    'varying vec3 galacticCoordinates;',
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
      'mat4 worldMatrixIn = worldMatrix;',
      'vec4 worldMatrixTranslation = worldMatrixIn[3];',
      'worldMatrixIn[3] = worldMatrixTranslation - vec4(cameraPosition, 0.0);',
      'vec4 worldPosition = worldMatrixIn * vec4(position * radiusOfMoonPlane * 2.0, 1.0);',
      'vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);',
      'vLocalPosition = normalize(vWorldPosition.xyz);',
      'vec3 normalizedWorldPosition = normalize(vWorldPosition);',
      'worldPosition = worldMatrix * vec4(position * radiusOfMoonPlane * 2.0, 1.0);',

      'vUv = uv;',

      '//Other then our bitangent, all of our other values are already normalized',
      'vec3 bitangent = normalize((tangent.w * cross(normal, tangent.xyz)));',
      'vec3 cameraSpaceTangent = (worldMatrix * vec4(tangent.xyz, 0.0)).xyz;',
      'vec3 b = (worldMatrix * vec4(bitangent.xyz, 0.0)).xyz;',
      'vec3 n = (worldMatrix * vec4(normal.xyz, 0.0)).xyz;',

      '//There is no matrix transpose, so we will do this ourselves',
      'mat3 TBNMatrix = mat3(vec3(cameraSpaceTangent.x, b.x, n.x), vec3(cameraSpaceTangent.y, b.y, n.y), vec3(cameraSpaceTangent.z, b.z, n.z));',
      'tangentSpaceSunLightDirection = normalize(TBNMatrix * sunLightDirection);',
      'tangentSpaceViewDirection = normalize(TBNMatrix * -normalizedWorldPosition);',

      '//Convert coordinate position to RA and DEC',
      'float altitude = piOver2 - acos(vLocalPosition.y);',
      'float azimuth = pi - atan(vLocalPosition.z, vLocalPosition.x);',
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

      'gl_Position = vec4(position, 1.0);',
    '}',
  ].join('\n'),
}
