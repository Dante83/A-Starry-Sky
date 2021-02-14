//We enter and leave with additionalPassColor, which we add our moon direct
//lighting to, after it has been attenuated by our transmittance.

//Calculate the light from the moon. Note that our normal is on a quad, which makes
//transforming our normals really easy, as we just have to transform them by the world matrix.
//and everything should work out. Furthermore, the light direction for the moon should just
//be our sun position in the sky.
vec3 texelNormal = normalize(2.0 * texture2D(moonNormalMap, offsetUV).rgb - 1.0);

//Lunar surface roughness from https://sos.noaa.gov/datasets/moon-surface-roughness/
float moonRoughnessTexel = piOver2 - (1.0 - texture2D(moonRoughnessMap, offsetUV).r);

//Implmentatation of the Ambient Appeture Lighting Equation
float sunArea = pi * sunRadius * sunRadius;
float aperatureRadius = acos(1.0 - texture2D(moonAperatureSizeMap, offsetUV).r);
vec3 aperatureOrientation = normalize(2.0 * texture2D(moonAperatureOrientationMap, offsetUV).rgb - 1.0);
float aperatureToSunHaversineDistance = acos(dot(aperatureOrientation, tangentSpaceSunLightDirection));

float observableSunFraction;
vec3 test = vec3(0.0);
if(aperatureToSunHaversineDistance >= (aperatureRadius + sunRadius)){
  observableSunFraction = 0.0;
}
else if(aperatureToSunHaversineDistance <= (aperatureRadius - sunRadius)){
  observableSunFraction = 1.0;
}
else{
  float absOfRpMinusRl = abs(aperatureRadius - sunRadius);
  observableSunFraction = smoothstep(0.0, 1.0, 1.0 - ((aperatureToSunHaversineDistance - absOfRpMinusRl) / (aperatureRadius + sunRadius - absOfRpMinusRl)));
}
float omega = (sunRadius - aperatureRadius + aperatureToSunHaversineDistance) / (2.0 * aperatureToSunHaversineDistance);
vec3 bentTangentSpaceSunlightDirection = normalize(mix(tangentSpaceSunLightDirection, aperatureOrientation, omega));

//I opt to use the Oren-Nayar model over Hapke-Lommel-Seeliger
//As Oren-Nayar lacks a lunar phase component and is more extensible for
//Additional parameters, I used the following code as a guide
//https://patapom.com/blog/BRDF/MSBRDFEnergyCompensation/#fn:4
float NDotL = max(dot(bentTangentSpaceSunlightDirection, texelNormal), 0.0);
float NDotV = max(dot(tangentSpaceViewDirection, texelNormal), 0.0);
float gamma = dot(tangentSpaceViewDirection - texelNormal * NDotV, bentTangentSpaceSunlightDirection - texelNormal * NDotL);
gamma = gamma / (sqrt(clamp(1.0 - NDotV * NDotV, 0.0, 1.0)) * sqrt(clamp(1.0 - NDotL * NDotL, 0.0, 1.0)));
float roughnessSquared = moonRoughnessTexel * moonRoughnessTexel;
float A = 1.0 - 0.5 * (roughnessSquared / (roughnessSquared + 0.33));
float B = 0.45 * (roughnessSquared / (roughnessSquared + 0.09));
vec2 cos_alpha_beta = NDotV < NDotL ? vec2(NDotV, NDotL) : vec2(NDotL, NDotV);
vec2 sin_alpha_beta = sqrt(clamp(1.0 - cos_alpha_beta * cos_alpha_beta, 0.0, 1.0));
float C = sin_alpha_beta.x * sin_alpha_beta.y / (1e-6 + cos_alpha_beta.y);

vec3 moonTexel = 2.0 * observableSunFraction * NDotL * (A + B * max(0.0, gamma) * C) * lunarDiffuseColor * transmittanceFade * earthsShadow;
