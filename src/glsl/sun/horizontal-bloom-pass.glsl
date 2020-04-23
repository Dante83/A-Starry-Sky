uniform sampler2D basePass;
//uniform sampler2D bloomPass;

void main(){
  //vec3 combinedPass = basePass + bloomPass;
  combinedPass = basePass;

  //Color Adjustment Pass
  vec3 toneMappedColor = OptimizedCineonToneMapping(combinedPass);

  //Late triangular blue noise

  //Return our tone mapped color when everything else is done
  gl_FragColor = vec4(toneMappedColor, 1.0);
}
