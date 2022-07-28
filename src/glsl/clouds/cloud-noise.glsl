precision highp sampler3D;

//From https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83


/* discontinuous pseudorandom uniformly distributed in [0.0, +0.0]^3 */
float random(float seed) {
		vec2 seedVec2 = vec2(seed, seed);
    return fract(sin(dot(seedVec2.xy, vec2(12.9898,78.23309)))* 43758.5453123) + 0.5;
}

//3D Tileable Worley Noise
float tileableWorleyNoise(vec3 uv3, float numPoints){
  float minDistance = 1000.0;
	float seed = random(2243.2 * numPoints);
  for(float x = -1.0; x <= 1.0; ++x){
    for(float y = -1.0; y <= 1.0; ++y){
      for(float z = -1.0; z <= 1.0; ++z){
				for(float i = 0.0; i < numPoints; ++i){
					//The seed numbers below are meant to give constant values but different random locations
					//for each seed.
					vec3 randomPosition = vec3(random(i / seed),  random(i * 968.542 / seed), random(i * 234.12 / seed));
	        vec3 vec2Point = uv3 - randomPosition + vec3(x, y, z);
	        minDistance = min(dot(vec2Point, vec2Point), minDistance);
				}
      }
    }
  }

  return clamp(1.0 - sqrt(minDistance) * pow(numPoints, 1.0 / 3.0), 0.0, 1.0);
}

//Presume the width of our texture is 128x128x128
//Presume an output texture width of 2048x1024
//The latter being 16 128x128 textures wide and 8 128x128 textures high
vec3 pixel2DLocTo3DLoc(vec2 fragCoordinate){
	int xIndex = int(floor(fragCoordinate.x / 128.0));
	int yIndex = int(floor(fragCoordinate.y / 128.0));
	float z = float(xIndex + yIndex * 16) / 128.0;
	float x = (fragCoordinate.x - float(xIndex * 128)) / 128.0;
	float y = (fragCoordinate.y - float(yIndex * 128)) / 128.0;
	return vec3(x, y, z);
}

void main(){
  vec2 p = gl_FragCoord.xy;
	vec3 p3 = pixel2DLocTo3DLoc(p);

  //Worley noise octaves
  float worleyNoise1 = tileableWorleyNoise(p3, 5.0);
  float worleyNoise2 = tileableWorleyNoise(p3, 45.0);
  float worleyNoise3 = tileableWorleyNoise(p3, 405.0);
	float cloudNoise = worleyNoise1 * .625 + worleyNoise2 * .125 + worleyNoise3 * 0.25;

  gl_FragColor = vec4(worleyNoise1, worleyNoise2, worleyNoise3, cloudNoise);
}
