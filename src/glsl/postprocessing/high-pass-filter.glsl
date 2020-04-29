uniform sampler2D sourceTexture;
uniform float luminosityThreshold;

varying vec2 vUv;

const vec3 luma = vec3(0.299, 0.587, 0.144);

//Based on Luminosity High Pass Shader
//Originally created by bhouston / http://clara.io/
void main(){
  vec4 sourceTexture = texture2D(sourceTexture, vUv);
  float v = dot(sourceTexture.rgb * luma);
  vec4 outputColor = vec4(vec3(0.0), 1.0);

  //Note: for the bloom pass our the Unreal Shader sets smoothWidth to 0.01
  float alpha = smoothstep(luminosityThreshold, luminosityThreshold + 0.01, v)
  gl_FragColor = mix(outputColor, sourceTexture, alpha);
}
