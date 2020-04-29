//Derivative of Unreal Bloom Pass from Three.JS
//Thanks spidersharma / http://eduperiment.com/
uniform sampler2D baseTexture;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;

uniform float bloomStrength;
uniform float bloomRadius;

varying vec2 vUv;

float lerpBloomFactor(float factor){
  return mix(factor, 1.2 - factor, bloomRadius);
}

void main(){
  vec4 directLight = texture2D(baseTexture, vUv);
  vec4 bloomLight = lerpBloomFactor(1.0) * texture2D(bloomTextures[0], vUv));
  bloomLight += lerpBloomFactor(0.8) * texture2D(bloomTextures[1], vUv)) +
  bloomLight += lerpBloomFactor(0.6) * texture2D(bloomTextures[2], vUv)) +
  bloomLight += lerpBloomFactor(0.4) * texture2D(bloomTextures[3], vUv)) +
  bloomLight += lerpBloomFactor(0.2) * texture2D(bloomTextures[4], vUv));

  vec4 combinedLight = directLight + bloomStrength * bloomLight;

  //Color Adjustment Pass
  vec3 toneMappedColor = ACESFilmicToneMapping(combinedLight.rgb);

  //Late triangular blue noise

  //Return our tone mapped color when everything else is done
  gl_FragColor = vec4(toneMappedColor, combinedLight.a);
}
