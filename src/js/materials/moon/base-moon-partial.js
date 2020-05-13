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
    'vec3 moonDiffuseTexel = texture2D(moonDiffuseMap, offsetUV).rgb;',
    'vec3 texelNormal = normalize(2.0 * texture2D(moonNormalMap, offsetUV).rgb - 1.0);',

    '//Lunar surface roughness from https://sos.noaa.gov/datasets/moon-surface-roughness/',
    'vec3 moonRoughnessTexel = 1.0 - texture2D(moonRoughnessMap, offsetUV).rgb;',

    '//I opt to use the Improved Oren-Nayar model over Hapke-Lommel-Seeliger',
    '//As Oren-Nayar lacks a lunar phase component and is more extensible for',
    '//Additional parameters.',
    '//https://mimosa-pudica.net/improved-oren-nayar.html',
    'float NDotL = max(dot(texelNormal, tangentSpaceSunLightDirection), 0.0);',

    'vec3 moonTexel = NDotL * moonDiffuseTexel * transmittanceFade;',
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

    'void main() {',
      'vec4 worldPosition = worldMatrix * vec4(position * radiusOfMoonPlane, 1.0);',
      'vWorldPosition = normalize(worldPosition.xyz);',
      'vUv = uv;',

      '//Other then our bitangent, all of our other values are already normalized',
      'vec3 bitangent = normalize((tangent.w * cross(normal, tangent.xyz)));',
      'vec3 cameraSpaceTangent = (worldMatrix * vec4(tangent.xyz, 0.0)).xyz;',
      'vec3 b = (worldMatrix * vec4(bitangent.xyz, 0.0)).xyz;',
      'vec3 n = (worldMatrix * vec4(normal.xyz, 0.0)).xyz;',

      '//There is no matrix transpose, so we will do this ourselves',
      'mat3 TBNMatrix = mat3(vec3(cameraSpaceTangent.x, b.x, n.x), vec3(cameraSpaceTangent.y, b.y, n.y), vec3(cameraSpaceTangent.z, b.z, n.z));',
      'tangentSpaceSunLightDirection = normalize(TBNMatrix * sunLightDirection);',
      'tangentSpaceViewDirection = normalize(TBNMatrix * vWorldPosition);',

      'gl_Position = vec4(position, 1.0);',
    '}',
  ].join('\n'),
}
