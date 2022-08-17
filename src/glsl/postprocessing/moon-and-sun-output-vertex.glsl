varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vLocalPosition = normalize(vec3(-position.z, position.y, -position.x));
  vWorldPosition = vec3(-worldPosition.z, -worldPosition.y, -worldPosition.x);
  vUv = uv;

  vec4 projectionPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 normalizedPosition = projectionPosition.xyz / projectionPosition.w;
  gl_Position = projectionPosition;

  //We offset our sun z-position by 0.01 to avoid Z-Fighting with the back sky plane
  gl_Position.z -= 0.01;
}
