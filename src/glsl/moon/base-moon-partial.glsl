//We enter and leave with additionalPassColor, which we add our moon direct
//lighting to, after it has been attenuated by our transmittance.

//Our moon is located in the middle square of our quad, so that we give our
//solar bloom enough room to expand into without clipping the edge.
//We also fade out our quad towards the edge to reduce the visibility of sharp
//edges.
float pixelDistanceFromMoon = distance(vUv, vec2(0.5));

//Calculate the light from the moon. Note that our normal is on a quad, which makes
//transforming our normals really easy, as we just have to transform them by the world matrix.
//and everything should work out. Furthermore, the light direction for the moon should just
//be our sun position in the sky.
vec3 moonDiffuseTexel = texture2D(moonDiffuseMap, offsetUV).rgb;
vec3 texelNormal = normalize(2.0 * texture2D(moonNormalMap, offsetUV).rgb - 1.0);

//Lunar surface roughness from https://sos.noaa.gov/datasets/moon-surface-roughness/
vec3 moonRoughnessTexel = 1.0 - texture2D(moonRoughnessMap, offsetUV).rgb;

//I opt to use the Improved Oren-Nayar model over Hapke-Lommel-Seeliger
//As Oren-Nayar lacks a lunar phase component and is more extensible for
//Additional parameters.
//https://mimosa-pudica.net/improved-oren-nayar.html
float NDotL = max(dot(texelNormal, tangentSpaceSunLightDirection), 0.0);

vec3 moonTexel = NDotL * moonDiffuseTexel * transmittanceFade;
