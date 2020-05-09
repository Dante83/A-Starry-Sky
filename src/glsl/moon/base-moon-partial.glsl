//We enter and leave with additionalPassColor, which we add our moon direct
//lighting to, after it has been attenuated by our transmittance.

//Our moon is located in the middle square of our quad, so that we give our
//solar bloom enough room to expand into without clipping the edge.
//We also fade out our quad towards the edge to reduce the visibility of sharp
//edges.
float pixelDistanceFromMoon = distance(offsetUV, vec2(0.5));

//Calculate lunar lighting with the

//Calculate the light from the moon.
vec3 moonDiffuseTexel = texture2D(moonDiffuseMap, offsetUV).rgb;
vec3 moonNormalTexel = texture2D(moonDiffuseMap, offsetUV).rgb;
vec3 moonSpecularTexel = texture2D(moonDiffuseMap, offsetUV).rgb;
vec3 moonAOTexel = texture2D(moonDiffuseMap, offsetUV).rgb;

vec3 moonTexel = moonDiffuseTexel * transmittanceFade;
