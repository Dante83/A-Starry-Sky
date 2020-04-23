//We enter and leave with additionalPassColor, which we add our sun direct
//lighting to, after it has been attenuated by our transmittance.

//We're going to do this ever render pass, but in the future, we will just
//do a lookup of this value from a downloaded texture.
//We can use this for our solar limb darkening
//https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf
float pixelDistanceFromSun = distance(sunPosition, sphericalPosition);

//From https://github.com/supermedium/superframe/blob/master/components/sun-sky/shaders/fragment.glsl
float sundisk = smoothstep($sunAngularDiameter, $sunAngularDiameter+0.00002, pixelDistanceFromSun);

//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf
float limbDarkening;

//Apply transmittance to our sun disk direct lighting
vec4 sunDiskColor = vec3(1.0, sundisk);
sunDiskColor = sunDiskColor * transmittanceFade;

//For now, let us just use the intensity of the sun disk to set it's transparency
float sunPassTransparency = sundisk;
