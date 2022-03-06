StarrySky.Materials.Sun.combinationPass = {
  uniforms: {
    baseTexture: {'value': null},
    bloomEnabled: {'value': 0},
    blurTexture1: {'value': null},
    blurTexture2: {'value': null},
    blurTexture3: {'value': null},
    blurTexture4: {'value': null},
    blurTexture5: {'value': null},
    bloomStrength: {'value': null},
    bloomRadius: {'value': null},
    blueNoiseTexture: {'value': null}
  },
  vertexShader: [
    'varying vec3 vWorldPosition;',
    'varying vec2 vUv;',
    'varying vec2 screenPosition;',

    'void main() {',
      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',
      'vWorldPosition = worldPosition.xyz;',
      'vUv = uv;',

      'vec4 projectionPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      'vec3 normalizedPosition = projectionPosition.xyz / projectionPosition.w;',
      'screenPosition = vec2(0.5) + 0.5 * normalizedPosition.xy;',
      'gl_Position = projectionPosition;',

      '//We offset our sun z-position by 0.01 to avoid Z-Fighting with the back sky plane',
      'gl_Position.z -= 0.01;',
    '}',
  ].join('\n'),
  fragmentShader: [
    '//Derivative of Unreal Bloom Pass from Three.JS',
    '//Thanks spidersharma / http://eduperiment.com/',
    'uniform sampler2D baseTexture;',
    'uniform bool bloomEnabled;',
    'uniform sampler2D blurTexture1;',
    'uniform sampler2D blurTexture2;',
    'uniform sampler2D blurTexture3;',
    'uniform sampler2D blurTexture4;',
    'uniform sampler2D blurTexture5;',
    'uniform sampler2D blueNoiseTexture;',

    'uniform float bloomStrength;',
    'uniform float bloomRadius;',

    'varying vec2 vUv;',
    'varying vec2 screenPosition;',

    'float lerpBloomFactor(float factor){',
      'return mix(factor, 1.2 - factor, bloomRadius);',
    '}',

    'void main(){',
      '//Fade this plane out towards the edges to avoid rough edges',
      'vec2 offsetUV = vUv * 2.0 - vec2(0.5);',
      'float pixelDistanceFromSun = distance(offsetUV, vec2(0.5));',
      'float falloffDisk = smoothstep(0.0, 1.0, (1.5 - (pixelDistanceFromSun)));',

      '//Determine the bloom effect',
      'vec3 combinedLight = texture2D(baseTexture, vUv).rgb;',
      'if(bloomEnabled){',
        '//Bloom is only enabled when the sun has set so that we can share the bloom',
        '//shader betweeen the sun and the moon.',
        'vec3 bloomLight = lerpBloomFactor(1.0) * texture2D(blurTexture1, vUv).rgb;',
        'bloomLight += lerpBloomFactor(0.8) * texture2D(blurTexture2, vUv).rgb;',
        'bloomLight += lerpBloomFactor(0.6) * texture2D(blurTexture3, vUv).rgb;',
        'bloomLight += lerpBloomFactor(0.4) * texture2D(blurTexture4, vUv).rgb;',
        'bloomLight += lerpBloomFactor(0.2) * texture2D(blurTexture5, vUv).rgb;',
        'combinedLight += abs(bloomStrength * bloomLight);',
      '}',

      '//Late triangular blue noise',
      'combinedLight += ((texture2D(blueNoiseTexture, screenPosition.xy * 11.0).rgb - vec3(0.5)) / vec3(128.0));',

      '//Return our tone mapped color when everything else is done',
      'gl_FragColor = vec4(combinedLight, 1.0);',
    '}',
  ].join('\n')
};
