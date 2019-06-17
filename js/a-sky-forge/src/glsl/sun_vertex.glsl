#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec3 vWorldPosition;
varying vec3 betaRPixel;
varying vec2 vUv;

uniform float rayleigh;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vec3 normalizedWorldPosition = normalize(worldPosition.xyz);

  vUv = uv;

  vec3 simplifiedRayleigh = vec3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);
  float pixelFade = 1.0 - clamp(1.0 - exp(normalizedWorldPosition.z), 0.0, 1.0);
  betaRPixel = simplifiedRayleigh * (rayleigh - (1.0 - pixelFade));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
