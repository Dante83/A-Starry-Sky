uniform sampler2D kthInscatteringMie;
uniform sampler2D kthInscatteringRayleigh;
uniform sampler2D previousInscatteringSum;
uniform bool isNotFirstIteration;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 kthInscattering = vec4(0.0);
  if(isNotFirstIteration){
    kthInscattering = texture2D(previousInscatteringSum, uv);
  }
  kthInscattering += max(texture2D(kthInscatteringRayleigh, uv), vec4(0.0));
  kthInscattering += max(texture2D(kthInscatteringMie, uv), vec4(0.0));

  gl_FragColor = vec4(kthInscattering.rgb, 1.0);
}
