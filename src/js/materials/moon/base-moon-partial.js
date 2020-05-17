//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Moon.baseMoonPartial = {
  fragmentShader: function(moonAngularDiameter){
    let originalGLSL = [
    '//We enter and leave with additionalPassColor, which we add our moon direct',
    '//lighting to, after it has been attenuated by our transmittance.',

    '//Our moon is located in the middle square of our quad, so that we give our',
    '//solar bloom enough room to expand into without clipping the edge.',
    '//We also fade out our quad towards the edge to reduce the visibility of sharp',
    '//edges.',
    'float pixelDistanceFromMoon = distance(vUv, vec2(0.5));',

    '//Calculate the light from the moon. Note that our normal is on a quad, which makes',
    '//transforming our normals really easy, as we just have to transform them by the world matrix.',
    '//and everything should work out. Furthermore, the light direction for the moon should just',
    '//be our sun position in the sky.',
    'vec3 texelNormal = normalize(2.0 * texture2D(moonNormalMap, offsetUV).rgb - 1.0);',

    '//Lunar surface roughness from https://sos.noaa.gov/datasets/moon-surface-roughness/',
    'float moonRoughnessTexel = piOver2 - (1.0 - texture2D(moonRoughnessMap, offsetUV).r);',

    '//Implmentatation of the Ambient Appeture Lighting Equation',
    'float sunArea = pi * sunRadius * sunRadius;',
    'float aperatureRadius = texture2D(moonAperatureSizeMap, offsetUV).r * piOver2;',
    'vec3 aperatureOrientation = normalize(2.0 * texture2D(moonAperatureOrientationMap, offsetUV).rgb - 1.0);',
    'float aperatureToSunHaversineDistance = acos(dot(aperatureOrientation, tangentSpaceSunLightDirection));',

    'float observableSunFraction;',
    'vec3 test = vec3(0.0);',
    'if(aperatureToSunHaversineDistance >= (aperatureRadius + sunRadius)){',
      'observableSunFraction = 0.0;',
    '}',
    'else if(aperatureToSunHaversineDistance <= (aperatureRadius - sunRadius)){',
      'observableSunFraction = 1.0;',
    '}',
    'else{',
      'float absOfRpMinusRl = abs(aperatureRadius - sunRadius);',
      'observableSunFraction = smoothstep(0.0, 1.0, 1.0 - ((aperatureToSunHaversineDistance - absOfRpMinusRl) / (aperatureRadius + sunRadius - absOfRpMinusRl)));',
    '}',
    'float omega = (sunRadius - aperatureRadius + aperatureToSunHaversineDistance) / (2.0 * aperatureToSunHaversineDistance);',
    'vec3 bentTangentSpaceSunlightDirection = normalize(mix(tangentSpaceSunLightDirection, aperatureOrientation, omega));',

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

    'vec3 moonTexel = 2.0 * observableSunFraction * NDotL * (A + B * max(0.0, gamma) * C) * lunarDiffuseColor * transmittanceFade;',
    '//vec3 moonTexel = vec3(observableSunFraction);',
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
    'varying vec2 vUv;',
    'varying vec3 tangentSpaceSunLightDirection;',
    'varying vec3 tangentSpaceViewDirection;',
    'varying mat3 TBNMatrix;',

    'void main() {',
      'vec4 worldPosition = worldMatrix * vec4(position * radiusOfMoonPlane, 1.0);',
      'vec3 normalizedWorldPosition = normalize(worldPosition.xyz);',
      'vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);',
      'vUv = uv;',

      '//Other then our bitangent, all of our other values are already normalized',
      'vec3 bitangent = normalize((tangent.w * cross(normal, tangent.xyz)));',
      'vec3 cameraSpaceTangent = (worldMatrix * vec4(tangent.xyz, 0.0)).xyz;',
      'vec3 b = (worldMatrix * vec4(bitangent.xyz, 0.0)).xyz;',
      'vec3 n = (worldMatrix * vec4(normal.xyz, 0.0)).xyz;',

      '//There is no matrix transpose, so we will do this ourselves',
      'TBNMatrix = mat3(vec3(cameraSpaceTangent.x, b.x, n.x), vec3(cameraSpaceTangent.y, b.y, n.y), vec3(cameraSpaceTangent.z, b.z, n.z));',
      'tangentSpaceSunLightDirection = normalize(TBNMatrix * sunLightDirection);',
      'tangentSpaceViewDirection = normalize(TBNMatrix * -normalizedWorldPosition);',

      'gl_Position = vec4(position, 1.0);',
    '}',
  ].join('\n'),
}
