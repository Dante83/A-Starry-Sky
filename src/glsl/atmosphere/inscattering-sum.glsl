//Based on the work of Oskar Elek
//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf
//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
//by Gustav Bodare and Edvard Sandberg

uniform sampler2D inscatteringTexture;
uniform sampler2D previousInscatteringSum;
uniform bool isNotFirstIteration;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 kthInscattering = vec4(0.0);
  if(isNotFirstIteration){
    kthInscattering = texture2D(previousInscatteringSum, uv);
  }
  kthInscattering += max(texture2D(inscatteringTexture, uv), vec4(0.0));

  gl_FragColor = vec4(kthInscattering.rgb, 1.0);
}
