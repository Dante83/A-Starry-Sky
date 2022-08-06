uniform float radiusOfSunPlane;
uniform mat4 worldMatrix;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;

void main() {
  mat4 worldMatrixIn = worldMatrix;
  vec4 worldMatrixTranslation = worldMatrixIn[3];
  worldMatrixIn[3] = worldMatrixTranslation - vec4(cameraPosition, 0.0);
  vec4 worldPosition = worldMatrixIn * vec4(position * radiusOfSunPlane * 2.0, 1.0);
  vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);
  vLocalPosition = normalize(vWorldPosition.xyz);
  worldPosition = worldMatrix * vec4(position * radiusOfSunPlane * 2.0, 1.0);
  vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);

  vUv = uv;

  gl_Position = vec4(position, 1.0);
}
