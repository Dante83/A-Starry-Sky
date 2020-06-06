uniform sampler2D textureRChannel;
uniform sampler2D textureGChannel;
uniform sampler2D textureBChannel;
uniform sampler2D textureAChannel;

int modulo(float a, float b){
  return int(a - (b * floor(a/b)));
}

//This is useful for converting our values from rgb colors into floats
float rgba2Float(vec4 colorIn){
  vec4 colorIn255bits = clamp(colorIn * 255.0, 0.0, 255.0);

  float floatSign = (step(0.5,  float(modulo(colorIn255bits.a, 2.0)) ) - 0.5) * 2.0;
  float floatExponential = float(((int(colorIn255bits.a)) / 2) - 64);
  float floatValue = floatSign * (colorIn255bits.r * 256.0 * 256.0 + colorIn255bits.g * 256.0 + colorIn255bits.b) * pow(10.0, floatExponential);

  return floatValue;
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  float r = rgba2Float(texture2D(textureRChannel));
  float g = rgba2Float(texture2D(textureGChannel));
  float b = rgba2Float(texture2D(textureBChannel));
  float a = rgba2Float(texture2D(textureAChannel));

  gl_FragColor = vec4(r, g, b, a);
}
