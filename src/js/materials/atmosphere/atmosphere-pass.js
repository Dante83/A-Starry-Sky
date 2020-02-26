//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Atmosphere.atmosphereShader = {
  uniforms: {
    sunPosition: {type: 'vec3', value: new THREE.Vector3()},
    solarMieInscatteringSum: {type: 't', value: null},
    solarRayleighInscatteringSum: {type: 't', value: null},
  },
  vertexShader: [
    'varying vec3 vWorldPosition;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = normalize(worldPosition.xyz);',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}',
  ].join('\n'),
  fragmentShader: function(mieG, textureWidth, textureHeight, packingWidth, packingHeight, atmosphereFunctions){
    let originalGLSL = [
    'varying vec3 vWorldPosition;',

    'uniform vec3 sunPosition;',
    'uniform sampler2D solarMieInscatteringSum;',
    'uniform sampler2D solarRayleighInscatteringSum;',

    '$atmosphericFunctions',

    '//Modified from https://community.khronos.org/t/constant-vec3-array-no-go/60184',
    'vec3 trilinearInterpolation(vec3 V000, vec3 V100, vec3 V010, vec3 V001, vec3 V101, vec3 V011, vec3 V110, vec3 V111, vec3 uv3){',
      'vec3 oneMinusX = (vec3(1.0) - uv3.x);',
      'vec3 oneMinusY = (vec3(1.0) - uv3.y);',
      'vec3 oneMinusZ = (vec3(1.0) - uv3.z);',
      'vec3 term1 = V000 * oneMinusX * oneMinusY * oneMinusZ;',
      'vec3 term2 = uv3.x * (V100 * oneMinusY * oneMinusZ + V101 * oneMinusY * uv3.z + V011 * uv3.y * oneMinusZ + V111 * uv3.y * uv3.z);',
      'vec3 term3 = oneMinusX * (V010 * uv3.y * oneMinusZ + V001  * oneMinusY * uv3.z + V011 * uv3.y * uv3.z);',
      'return term1 + term2 + term3;',
    '}',

    'vec3 atmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable){',
      'float cosOfViewAngle = vWorldPosition.y;',
      'float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);',
      'float cosOFAngleBetweenZenithAndSource = sourcePosition.y;',
      'vec3 uv3 = vec3(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH), parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));',
      'vec3 uv3dimensions = vec3($textureWidth, $textureHeight, $textureDepth);',
      'vec3 pixelValue = uv3 * uv3dimensions;',
      'vec3 floorValue = clamp((floor(pixelValue) - vec3(1.0)) / uv3dimensions, vec3(0.0), vec3(1.0));',
      'vec3 ceilingValue = clamp(floor(pixelValue) / uv3dimensions, vec3(0.0), vec3(1.0));',

      '//Now get the eight sides of our three-d lookup cube',
      'vec3 V000 = vec3(floorValue.x, floorValue.y, floorValue.z);',
      'vec3 V100 = vec3(ceilingValue.x, floorValue.y, floorValue.z);',
      'vec3 V010 = vec3(floorValue.x, ceilingValue.y, floorValue.z);',
      'vec3 V001 = vec3(floorValue.x, floorValue.y, ceilingValue.z);',
      'vec3 V101 = vec3(ceilingValue.x, floorValue.y, ceilingValue.z);',
      'vec3 V011 = vec3(floorValue.x, ceilingValue.y, ceilingValue.z);',
      'vec3 V110 = vec3(ceilingValue.x, ceilingValue.y, floorValue.z);',
      'vec3 V111 = vec3(ceilingValue.x, ceilingValue.y, ceilingValue.z);',

      '//As we do not natively support 3D textures, we must linearly interpolate between values ourselves.',
      'vec2 UV2_V000 = getUV2From3DUV(V000);',
      'vec2 UV2_V100 = getUV2From3DUV(V100);',
      'vec2 UV2_V010 = getUV2From3DUV(V010);',
      'vec2 UV2_V001 = getUV2From3DUV(V001);',
      'vec2 UV2_V101 = getUV2From3DUV(V101);',
      'vec2 UV2_V011 = getUV2From3DUV(V011);',
      'vec2 UV2_V110 = getUV2From3DUV(V110);',
      'vec2 UV2_V111 = getUV2From3DUV(V111);',

      '//Mie Pass',
      'vec3 MT000 = texture2D(mieLookupTable, UV2_V000).rgb;',
      'vec3 MT100 = texture2D(mieLookupTable, UV2_V100).rgb;',
      'vec3 MT010 = texture2D(mieLookupTable, UV2_V010).rgb;',
      'vec3 MT001 = texture2D(mieLookupTable, UV2_V001).rgb;',
      'vec3 MT101 = texture2D(mieLookupTable, UV2_V101).rgb;',
      'vec3 MT011 = texture2D(mieLookupTable, UV2_V011).rgb;',
      'vec3 MT110 = texture2D(mieLookupTable, UV2_V110).rgb;',
      'vec3 MT111 = texture2D(mieLookupTable, UV2_V111).rgb;',
      'vec3 trilinearlyInterpolatedMie = trilinearInterpolation(MT000, MT100, MT010, MT001, MT101, MT011, MT110, MT111, uv3);',

      '//Rayleigh Pass',
      'vec3 RT000 = texture2D(rayleighLookupTable, UV2_V000).rgb;',
      'vec3 RT100 = texture2D(rayleighLookupTable, UV2_V100).rgb;',
      'vec3 RT010 = texture2D(rayleighLookupTable, UV2_V010).rgb;',
      'vec3 RT001 = texture2D(rayleighLookupTable, UV2_V001).rgb;',
      'vec3 RT101 = texture2D(rayleighLookupTable, UV2_V101).rgb;',
      'vec3 RT011 = texture2D(rayleighLookupTable, UV2_V011).rgb;',
      'vec3 RT110 = texture2D(rayleighLookupTable, UV2_V110).rgb;',
      'vec3 RT111 = texture2D(rayleighLookupTable, UV2_V111).rgb;',
      'vec3 trilinearlyInterpolatedRayleigh = trilinearInterpolation(RT000, RT100, RT010, RT001, RT101, RT011, RT110, RT111, uv3);',

      'return miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * trilinearlyInterpolatedMie + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * trilinearlyInterpolatedRayleigh;',
    '}',

    'void main(){',
      '//Figure out where we are',

      '//Initialize our color to zero light',
      'vec3 outColor = vec3(0.0);',

      '//Milky Way Pass',


      '//Star Pass',


      '//Planet Pass',


      '//Atmosphere',
      'vec3 sunPosition = normalize(vec3(1.0, 1.0, 0.0));',
      'vec3 solarAtmosphericPass = atmosphericPass(sunPosition, vWorldPosition, solarMieInscatteringSum, solarRayleighInscatteringSum);',

      '//Color Adjustment Pass',

      '//Triangular Blue Noise Adjustment Pass',

      'gl_FragColor = vec4(solarAtmosphericPass, 1.0);',
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

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
}
