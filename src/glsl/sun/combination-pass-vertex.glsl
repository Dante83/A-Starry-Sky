varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  //We offset our sun z-position by 0.01 to avoid Z-Fighting with the back sky plane
  gl_Position.z -= 0.02;
}
