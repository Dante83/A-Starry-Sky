varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec2 vUv;

void main() {
  //Just pass over the texture coordinates
  vUv = uv * 2.0 - 1.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
