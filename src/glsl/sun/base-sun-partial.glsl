//We enter and leave with additionalPassColor, which we add our sun direct
//lighting to, after it has been attenuated by our transmittance.

//Our sun is located in the middle square of our quad, so that we give our
//solar bloom enough room to expand into without clipping the edge.
//We also fade out our quad towards the edge to reduce the visibility of sharp
//edges.
vec2 offsetUV = vUv * 2.0 - vec2(0.5);
float pixelDistanceFromSun = distance(offsetUV, vec2(0.5));

//From https://github.com/supermedium/superframe/blob/master/components/sun-sky/shaders/fragment.glsl
float sundisk = smoothstep(0.0, 0.1, (0.5 - (pixelDistanceFromSun)));

//We can use this for our solar limb darkening
//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf
float rOverR = pixelDistanceFromSun / 0.5;
float mu = sqrt(clamp(1.0 - rOverR * rOverR, 0.0, 1.0));
float limbDarkening = (ac1 + ac2 * mu + 2.0 * ac3 * mu * mu);

//Apply transmittance to our sun disk direct lighting
vec3 sunTexel = sundisk * sunDiskIntensity * transmittanceFade * limbDarkening;
