uniform sampler2D basePass;
//uniform sampler2D bloomPass;

varying vec2 vUv;

void main(){
  //vec3 combinedPass = basePass + bloomPass;
  vec4 combinedPass = texture2D(basePass, vUv);

  //Color Adjustment Pass
  vec3 toneMappedColor = OptimizedCineonToneMapping(combinedPass.rgb);

  //Late triangular blue noise

  //Return our tone mapped color when everything else is done
  gl_FragColor = toneMappedColor;
}
