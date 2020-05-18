//Derivative of Unreal Bloom Pass from Three.JS
//Thanks spidersharma / http://eduperiment.com/
uniform sampler2D baseTexture;
uniform bool bloomEnabled;
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
  //Fade this plane out towards the edges to avoid rough edges
  vec2 offsetUV = vUv * 2.0 - vec2(0.5);
  float pixelDistanceFromMoon = distance(offsetUV, vec2(0.5));
  float falloffDisk = smoothstep(0.0, 1.0, (1.5 - (pixelDistanceFromMoon)));

  //Add our post processing effects
  vec3 combinedLight = abs(texture2D(baseTexture, vUv).rgb);
  if(bloomEnabled){
    //Bloom is only enabled when the sun has set so that we can share the bloom
    //shader betweeen the sun and the moon.
    vec3 bloomLight = lerpBloomFactor(1.0) * texture2D(blurTexture1, vUv).rgb;
    bloomLight += lerpBloomFactor(0.8) * texture2D(blurTexture2, vUv).rgb;
    bloomLight += lerpBloomFactor(0.6) * texture2D(blurTexture3, vUv).rgb;
    bloomLight += lerpBloomFactor(0.4) * texture2D(blurTexture4, vUv).rgb;
    bloomLight += lerpBloomFactor(0.2) * texture2D(blurTexture5, vUv).rgb;

    combinedLight += abs(bloomStrength * bloomLight);
  }
  combinedLight = ACESFilmicToneMapping(combinedLight);

  //Late triangular blue noise

  //Return our tone mapped color when everything else is done
  gl_FragColor = vec4(combinedLight, falloffDisk);
}
