//Derivative of Unreal Bloom Pass from Three.JS
//Thanks spidersharma / http://eduperiment.com/
//
uniform sampler2D sourceTexture;
uniform vec2 direction;

//Based on Luminosity High Pass Shader
//Originally created by bhouston / http://clara.io/
void main(){
  vec2 vUv = gl_FragCoord.xy / resolution.xy;
  float weightedSum = $gaussian_pdf_at_x_0;
  vec3 diffuseSum = texture2D(sourceTexture, vUv).rgb * weightedSum;

  //Unrolled for loop (completed in material function)
  $unrolled_for_loop

  gl_FragColor = vec4(abs(diffuseSum/weightedSum), 1.0);
}
