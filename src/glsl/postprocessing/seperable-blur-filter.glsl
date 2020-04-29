//Derivative of Unreal Bloom Pass from Three.JS
//Thanks spidersharma / http://eduperiment.com/
//
uniform sampler2D sourceTexture;
uniform vec2 direction;

varying vec2 vUv;

//Based on Luminosity High Pass Shader
//Originally created by bhouston / http://clara.io/
void main(){
  float weightedSum = $gaussian_pdf_at_x_0;
  vec3 diffuseSum = texture2D(sourceTexture, vUv).rgb;

  //Unrolled for loop (completed in material function)
  $unrolled_for_loop

  gl_FragColor = vec4(diffuseSum/weightedSum, 1.0);
}
