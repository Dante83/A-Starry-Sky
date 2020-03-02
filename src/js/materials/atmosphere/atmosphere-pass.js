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

    'vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 vWorldPosition, sampler2D mieLookupTable, sampler2D rayleighLookupTable){',
      'float cosOfViewAngle = vWorldPosition.y;',
      'float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, vWorldPosition);',
      'float cosOFAngleBetweenZenithAndSource = sourcePosition.y;',
      'vec3 uv3 = vec3(parameterizationOfCosOfViewZenithToX(cosOfViewAngle), parameterizationOfHeightToY(RADIUS_OF_EARTH), parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));',
      'float depthInPixels = $textureDepth;',
      'float floorPixelValue = (floor(uv3.z * depthInPixels) + ceil(floor(uv3.z * depthInPixels))) / 2.0;',
      'float floorValue = clamp(floor(floorPixelValue + 1.0) / depthInPixels, 0.0, 1.0);',
      'float ceilingValue = clamp(ceil(floorPixelValue - 1.0) / depthInPixels, 0.0, 1.0);',
      'vec2 uv2_0 = getUV2From3DUV(vec3(uv3.xy, floorValue));',
      'vec2 uv2_f = getUV2From3DUV(vec3(uv3.xy, ceilingValue));',
      'float interpolationFraction = clamp((uv3.z - floorValue) / (ceilingValue - floorValue), 0.0, 1.0);',

      '//Interpolated scattering values',
      'vec3 interpolatedMieScattering = mix(texture2D(mieLookupTable, uv2_f).rgb, texture2D(mieLookupTable, uv2_0).rgb, interpolationFraction);',
      'vec3 interpolatedRayleighScattering = mix(texture2D(rayleighLookupTable, uv2_0).rgb, texture2D(rayleighLookupTable, uv2_f).rgb, interpolationFraction);',

      'return miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering;',
    '}',

    '// Filmic ToneMapping http://filmicgames.com/archives/75',
    'const float A = 0.15;',
    'const float B = 0.50;',
    'const float C = 0.10;',
    'const float D = 0.20;',
    'const float E = 0.02;',
    'const float F = 0.30;',
    'const float W = 1000.0;',

    'vec3 Uncharted2Tonemap(vec3 x){',
      'return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;',
    '}',

    'void main(){',
      '//Figure out where we are',

      '//Initialize our color to zero light',
      'vec3 outColor = vec3(0.0);',

      '//Milky Way Pass',


      '//Star Pass',


      '//Planet Pass',


      '//Atmosphere',
      'vec3 sunPosition = normalize(vec3(0.0, 1.0, 0.0));',
      'vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, vWorldPosition, solarMieInscatteringSum, solarRayleighInscatteringSum);',

      '//Color Adjustment Pass',
      'vec3 toneMappedColor = Uncharted2ToneMapping(LinearTosRGB(vec4(solarAtmosphericPass.rgb, 1.0)).rgb);',

      '//Triangular Blue Noise Adjustment Pass',
      'gl_FragColor = vec4(toneMappedColor, 1.0);',
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
