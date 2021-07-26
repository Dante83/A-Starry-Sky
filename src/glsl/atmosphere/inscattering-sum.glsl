#version 300 es
layout(location = 0) out vec4 inscatteringSumRayleigh_Color;
layout(location = 1) out vec4 inscatteringSumMei_Color;
//Based on the work of Oskar Elek
//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf
//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
//by Gustav Bodare and Edvard Sandberg

uniform sampler3D inscatteringRayleighTexture;
uniform sampler3D inscatteringMeiTexture;
uniform sampler3D previousInscatteringRayleighSum;
uniform sampler3D previousInscatteringMeiSum;
uniform float uvz;
uniform bool isNotFirstIteration;

void main(){
  vec3 uv = vec3(gl_FragCoord.xy / resolution.xy, uvz);

  vec4 kthInscatteringRayleigh = vec4(0.0);
  vec4 kthInscatteringMei = vec4(0.0);
  if(isNotFirstIteration){
    kthInscatteringRayleigh = texture2D(previousInscatteringRayleighSum, uv);
    kthInscatteringMei = texture(previousInscatteringMeiSum, uv);
  }
  inscatteringSumRayleigh_Color = vec4(max(kthInscatteringRayleigh + texture(inscatteringRayleighTexture, uv).rgb, vec3(0.0)), 1.0);
  inscatteringSumMei_Color = vec4(max(kthInscatteringMei + texture(previousInscatteringMeiSum, uv).rgb, vec3(0.0)), 1.0);
}
