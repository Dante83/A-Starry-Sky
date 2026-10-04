StarrySky.Materials.Clouds.cloudGroundShadowMap = {
  uniforms: function(){
    return {
      sunPosition: {value: new THREE.Vector3()},
      moonPosition: {value: new THREE.Vector3()},
      groundShadowCascade: {value: new THREE.Vector4(0.0, 0.0, 8000.0, 0.0)},
      groundShadowCentre: {value: new THREE.Vector2()},
      groundShadowPlaneHeight: {value: 0.0},
      groundShadowSunOn: {value: 1.0},
      groundShadowMoonOn: {value: 0.0}

      //The cloud-density.glsl uniforms are shared with the march material by
      //CloudRenderer, so the shadows always belong to the clouds being drawn.
    };
  },
  vertexShader: [
    'varying vec2 vUv;',

    '//A full target quad. The cloud passes draw with a bare THREE.Camera whose matrices',
    "//are identity, so the plane's vertices are already in clip space.",
    'void main(){',
      'vUv = uv;',
      'gl_Position = vec4(position, 1.0);',
    '}',
  ].join('\n'),
  fragmentShader: function(){
    let originalGLSL = [
    'precision highp sampler3D;',

    '//Bakes how much sun and moon light gets through BOTH cloud decks, for everything',
    '//beneath them -- the ground, the sea, every object, and later every sample of air',
    '//the god rays march through. This is the map the world reads (see',
    "//starry-world-lighting-pars.glsl); the mid deck's own map (cloud-shadow-map.glsl)",
    '//stays behind for the clouds.',
    '//',
    '//Each texel is a point on a reference plane at the lowest base any low cloud can',
    "//have (or the mid deck's base when there is no low deck). The light is integrated",
    '//up from there, through every deck, to the top. A point anywhere below the plane',
    '//finds its light by projecting itself along the light onto the plane and reading',
    '//the texel there, which is exact: nothing between it and the plane can shade it.',
    '//',
    '//Transmittance goes in the map, never optical depth, for the same reason as the',
    "//mid deck's map: the mips average the LIGHT that arrives from across a patch of",
    '//cloud, and the mean of exp(-tau) is not exp(-mean tau).',
    '//',
    '//  r  sun, direct:  exp(-tau)',
    '//  g  sun, diffuse: 1 / (1 + K tau) - direct, the forward scattered rest',
    '//  b, a             the same for the moon',
    '//',
    '//Two cascades in one array texture, one layer each, both centred on the observer:',
    '//a fine one for the shadows the eye actually resolves, and a wide one for the far',
    '//ground and the long shadows of a low sun.',
    '//',
    '//Each cascade is TOROIDAL in the cloud field. The clouds never change shape -- the',
    '//wind only slides the whole field (cloudNoiseOffset) -- so a texel is pinned to a',
    '//place in the field, at uv = fract(field / extent), and stays right however the',
    '//observer and the wind move. The window it covers is the extent around the',
    "//place the observer's own ray to the light crosses the plane, so the ground around",
    '//them reads the fine cascade even under a low sun, whose light reaches the plane',
    '//kilometres away from it. A texel that the window has wrapped onto a new place is refreshed when',
    '//CloudRenderer next bakes its strip of rows, a few frames later, out at the edge',
    '//where the wide cascade has taken over anyway. So each frame bakes a strip, not',
    '//the whole map.',

    'varying vec2 vUv;',

    'uniform vec3 sunPosition;',
    'uniform vec3 moonPosition;',
    'uniform vec4 groundShadowCascade;       //xy the observer in the cloud field (cloudNoiseOffset), meters; z extent, meters',
    'uniform vec2 groundShadowCentre;        //Centre of the window, sky frame meters from the observer',
    'uniform float groundShadowPlaneHeight;  //Meters above the observer',
    'uniform float groundShadowSunOn;        //1 while the sun can light the ground, else 0',
    'uniform float groundShadowMoonOn;       //1 while the moon can light the ground, else 0',

    '//Matches CLOUD_DIFFUSION_K in cloud-march.glsl and CLOUD_SHADOW_DIFFUSION_K in',
    '//cloud-shadow-map.glsl.',
    'const float CLOUD_GROUND_SHADOW_DIFFUSION_K = 0.11;',
    'const int CLOUD_GROUND_SHADOW_SAMPLES = 24;',
    '//A grazing light crosses the decks over tens of kilometres; past this the far fade',
    '//has taken the clouds anyway.',
    'const float CLOUD_GROUND_SHADOW_MAX_PATH = 60000.0;',

    '$cloudDensityFunctions',

    '//Height span that holds any cloud at all, so no sample is spent in empty air.',
    'vec2 cloudGroundShadowSpan(){',
      'float bottom = 1e9;',
      'float top = -1e9;',
      'if(cloudCoverage > 0.0){',
        'bottom = cloudShellBaseHeight();',
        'top = cloudShellTopHeight();',
      '}',
      'if(midCloudCoverage > 0.0){',
        'bottom = min(bottom, midCloudBase());',
        'top = max(top, midCloudTop());',
      '}',
      'return vec2(bottom, top);',
    '}',

    '//Direct and diffuse transmittance through every deck, along a light, up from the',
    '//point c on the reference plane.',
    'vec2 cloudGroundShadowBake(vec3 c, vec3 light){',
      'vec2 span = cloudGroundShadowSpan();',
      'if(span.y <= span.x){',
        'return vec2(1.0, 0.0);',
      '}',
      'vec3 up = cloudLocalUp(c);',
      'float cosLight = max(dot(light, up), 0.02);',
      'float h = cloudHeight(c);',
      'float start = max(span.x - h, 0.0) / cosLight;',
      'float end = min(max(span.y - h, 0.0) / cosLight, CLOUD_GROUND_SHADOW_MAX_PATH);',
      'if(end <= start){',
        'return vec2(1.0, 0.0);',
      '}',
      'float stepLength = (end - start) / float(CLOUD_GROUND_SHADOW_SAMPLES);',
      'float opticalDepth = 0.0;',
      'for(int i = 0; i < CLOUD_GROUND_SHADOW_SAMPLES; ++i){',
        'vec3 q = c + light * (start + (float(i) + 0.5) * stepLength);',
        'opticalDepth += stepLength * cloudDensityCheap(q, length(q));',
      '}',
      'float direct = exp(-opticalDepth);',
      'return vec2(direct, max(1.0 / (1.0 + CLOUD_GROUND_SHADOW_DIFFUSION_K * opticalDepth) - direct, 0.0));',
    '}',

    'void main(){',
      "//The place in the field this texel is pinned to, nearest the window's centre, and",
      '//so where it is in the frame around the observer. Then a point on the reference plane there;',
      '//the plane is a spherical shell, so it sits a little lower away from the observer.',
      'float extent = groundShadowCascade.z;',
      'vec2 xz = vUv * extent - groundShadowCascade.xy;',
      'xz -= extent * floor((xz - groundShadowCentre) / extent + 0.5);',
      'vec3 c = vec3(xz.x, groundShadowPlaneHeight - dot(xz, xz) / (2.0 * cloudObserverRadius), xz.y);',

      'vec2 sun = groundShadowSunOn > 0.5 ? cloudGroundShadowBake(c, sunPosition) : vec2(1.0, 0.0);',
      'vec2 moon = groundShadowMoonOn > 0.5 ? cloudGroundShadowBake(c, moonPosition) : vec2(1.0, 0.0);',
      'gl_FragColor = vec4(sun, moon);',
    '}',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      updatedLines.push(originalGLSL[i].replace(/\$cloudDensityFunctions/g, StarrySky.Materials.Clouds.cloudDensity.partialFragmentShader));
    }

    return updatedLines.join('\n');
  }
};
