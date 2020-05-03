uniform float radiusOfMoonPlane;
uniform mat4 worldMatrix;
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec4 worldPosition = worldMatrix * vec4(position * radiusOfMoonPlane, 1.0);
  vWorldPosition = normalize(worldPosition.xyz);
  vUv = uv;

  gl_Position = vec4(position, 1.0);
}
