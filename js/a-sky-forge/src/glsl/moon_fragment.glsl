#ifdef GL_ES
precision highp float;
precision highp int;
#endif

//Varyings
varying vec3 vWorldPosition;
varying float sR;
varying float sM;
varying vec2 vUv;

//Uniforms
uniform float sunFade;
uniform float moonFade;
uniform float luminance;
uniform float mieDirectionalG;
uniform vec3 betaM;
uniform vec3 sunXYZPosition;
uniform vec3 betaRSun;
uniform vec3 betaRMoon;
uniform sampler2D moonTexture;
uniform sampler2D moonNormalMap;
uniform vec3 moonTangentSpaceSunlight;
uniform vec3 moonXYZPosition;
uniform float moonE;
uniform float sunE;
uniform float linMoonCoefficient2; //clamp(pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0,1.0)
uniform float linSunCoefficient2; //clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0)

//Constants
const float earthshine = 0.02;
const vec3 up = vec3(0.0, 1.0, 0.0);
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float piOver2 = 1.570796326794896619231321691639751442098584699687552910487;
const float oneOverFourPi = 0.079577471545947667884441881686257181017229822870228224373;
const float rayleighPhaseConst = 0.059683103659460750913331411264692885762922367152671168280;

// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness
// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE
vec2 rayleighPhase(vec2 cosTheta){
  return rayleighPhaseConst * (1.0 + cosTheta * cosTheta);
}

vec2 hgPhase(vec2 cosTheta){
  return oneOverFourPi * ((1.0 - mieDirectionalG * mieDirectionalG) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + (mieDirectionalG * mieDirectionalG), vec2(1.5)));
}

vec3 getDirectInscatteredIntensity(vec3 normalizedWorldPosition, vec3 FexSun, vec3 FexMoon){
  //Cos theta of sun and moon
  vec2 cosTheta = vec2(dot(normalizedWorldPosition, sunXYZPosition), dot(normalizedWorldPosition, moonXYZPosition));
  vec2 rPhase = rayleighPhase(vec2(0.5) * (vec2(1.0) + cosTheta));
  vec3 betaRThetaSun = betaRSun * rPhase.x;
  vec3 betaRThetaMoon = betaRMoon * rPhase.y;

  //Calculate the mie phase angles
  vec2 mPhase = hgPhase(cosTheta);
  vec3 betaMSun = betaM * mPhase.x;
  vec3 betaMMoon = betaM * mPhase.y;

  vec3 LinSunCoefficient = (sunE * (betaRThetaSun + betaMSun)) / (betaRSun + betaM);
  vec3 LinMoonCoefficient = (moonE * (betaRThetaMoon + betaMMoon)) / (betaRMoon + betaM);
  vec3 LinSun = pow(LinSunCoefficient * (1.0 - FexSun), vec3(1.5)) * mix(vec3(1.0),pow(LinSunCoefficient * FexSun, vec3(0.5)), linSunCoefficient2);
  vec3 LinMoon = pow(LinMoonCoefficient * (1.0 - FexMoon),vec3(1.5)) * mix(vec3(1.0),pow(LinMoonCoefficient * FexMoon,vec3(0.5)), linMoonCoefficient2);

  //Final lighting, duplicated above for coloring of sun
  return LinSun + LinMoon;
}

vec4 getDirectLunarIntensity(vec2 uvCoords){
  vec4 baseMoonIntensity = texture2D(moonTexture, uvCoords);

  //Get the moon shadow using the normal map
  //Thank you, https://beesbuzz.biz/code/hsv_color_transforms.php!
  vec3 moonNormalMapRGB = texture2D(moonNormalMap, uvCoords).rgb;
  vec3 moonSurfaceNormal = normalize(2.0 * moonNormalMapRGB.rgb - 1.0);

  //The moon is presumed to be a lambert shaded object, as per:
  //https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Diffuse_Reflection

  return vec4(baseMoonIntensity.rgb * min(earthshine + dot(moonSurfaceNormal, moonTangentSpaceSunlight), 1.0), baseMoonIntensity.a);
}

// Filmic ToneMapping http://filmicgames.com/archives/75
const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;
const float W = 1000.0;

vec3 Uncharted2Tonemap(vec3 x){
  return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

vec3 applyToneMapping(vec3 outIntensity, vec3 L0){
  outIntensity += L0;
  outIntensity *= 0.04;
  outIntensity += vec3(0.0, 0.0003, 0.00075);

  vec3 color = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*L0) / Uncharted2Tonemap(vec3(W));
  return pow(abs(color),vec3(1.0/(1.2 + (1.2 + sunFade + moonFade))));
}

void main(){
  vec3 normalizedWorldPosition = normalize(vWorldPosition.xyz);

  // combined extinction factor
  vec3 betaMTimesSM = betaM * sM;
  vec3 FexSun = exp(-(betaRSun * sR + betaMTimesSM));
  vec3 FexMoon = exp(-(betaRMoon * sR + betaMTimesSM));

  //Get our night sky intensity
  vec3 L0 = 0.1 * (FexSun + FexMoon);

  //Get the inscattered light from the sun or the moon
  //vec4 outIntensity = vec4(getDirectInscatteredIntensity(normalizedWorldPosition, FexSun, FexMoon) + L0, 1.0);
  //vec4 outIntensity = vec4(0.0);

  //Get direct illumination from the moon
  vec4 outIntensity = getDirectLunarIntensity(vUv);

  //Apply tone mapping to the result
	gl_FragColor = vec4(applyToneMapping(outIntensity.rgb, L0), outIntensity.a);
}
