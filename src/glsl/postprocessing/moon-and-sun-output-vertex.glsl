varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vUv = uv;

  vec4 projectionPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 normalizedPosition = projectionPosition.xyz / projectionPosition.w;
  gl_Position = projectionPosition;

  //We offset our sun z-position by 0.01 to avoid Z-Fighting with the back sky plane
  gl_Position.z -= 0.01;
}
