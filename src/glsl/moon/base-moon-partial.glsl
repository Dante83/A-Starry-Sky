//We enter and leave with additionalPassColor, which we add our moon direct
//lighting to, after it has been attenuated by our transmittance.

//Our moon is located in the middle square of our quad, so that we give our
//solar bloom enough room to expand into without clipping the edge.
//We also fade out our quad towards the edge to reduce the visibility of sharp
//edges.
vec2 offsetUV = vUv * 3.0 - vec2(1.0);
float pixelDistanceFromMoon = distance(offsetUV, vec2(0.5));

//Get lunar eclipse lightning

//Determine solar brihgtness based on exposed area of the sun

//Get the lunar BRDF from
//https://graphics.stanford.edu/~henrik/papers/nightsky/nightsky.pdf

//Get stone BRDF for basalt

//Add specular lighting to our basalt map

//Mix these based on the specular map

//Add ambient occlusion lighting

//Apply a the opacity map to hiden our moon at the end.

//Apply transmittance to our sun disk direct lighting
vec3 moonTexel = moonDirectLight * transmittanceFade;
