varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = normalize(worldPosition.xyz);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
