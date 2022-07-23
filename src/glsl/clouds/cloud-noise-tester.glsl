precision highp sampler3D;

uniform sampler3D noiseTester;
uniform float uTime;

varying vec2 vUv;

float fModulo(float a, float b){
  return (a - (b * floor(a / b)));
}

void main(){
  vec2 p = vUv.xy;
  float x = fModulo(p.x, 0.25) / 0.25;
  float y = fModulo(p.y, 0.25) / 0.25;
  float z = fModulo(uTime, 20000.0) / 20000.0;

  gl_FragColor = vec4(vec3(texture(noiseTester, vec3(x, y, 0.0)).a), 1.0);
}
