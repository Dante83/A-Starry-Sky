varying vec2 vUv;

//A full target quad. The cloud passes draw with a bare THREE.Camera whose matrices
//are identity, so the plane's vertices are already in clip space.
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
