precision highp float;

uniform sampler2D textureRChannel;
uniform sampler2D textureGChannel;
uniform sampler2D textureBChannel;
uniform sampler2D textureAChannel;

float rgba2Float(vec4 rgbaValue, float minValue, float maxValue){
  vec4 v = rgbaValue * 256.0;

  //First convert this to the unscaled integer values
  float scaledIntValue = v.a + (256.0 * v.b - 1.0) + (65536.0 * v.g - 1.0) + (16777216.0 * v.r - 1.0);

  //Now scale the float down to the appropriate range
  return (scaledIntValue / 4294967295.0) * (maxValue - minValue) + minValue;
}

void main(){
  vec2 vUv = gl_FragCoord.xy / resolution.xy;

  float r = rgba2Float(texture2D(textureRChannel, vUv), -1.0, 1.0);
  float g = rgba2Float(texture2D(textureGChannel, vUv), -1.0, 1.0);
  float b = rgba2Float(texture2D(textureBChannel, vUv), -1.0, 1.0);
  float a = rgba2Float(texture2D(textureAChannel, vUv), -2.0, 7.0);

  gl_FragColor = vec4(r, g, b, a);
}
