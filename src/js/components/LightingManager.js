//The lighting for our scene contains 3 hemispherical lights and 1 directional light
//with shadows enabled. The shadow enabled directional light is shared between the sun
//and the moon in order to reduce the rendering load.
StarrySky.LightingManager = function(skyDirector){
  const RADIUS_OF_SKY = 5000.0;
  const lightingData = skyDirector.assetManager.data.skyLighting;
  const skyState = skyDirector.skyState;
  const sunRenderer = skyDirector.renderers.sunRenderer;
  const lunarEclipseLightingModifier = skyState.moon.lightingModifier;
  this.sourceLight = new THREE.DirectionalLight(0xffffff, 4.0);
  const shadow = this.sourceLight.shadow;
  this.sourceLight.castShadow = true;
  shadow.mapSize.width = lightingData.shadowCameraResolution;
  shadow.mapSize.height = lightingData.shadowCameraResolution;
  shadow.camera.near = 128.0;
  shadow.camera.far = RADIUS_OF_SKY * 2.0;
  const directLightingCameraSize = lightingData.shadowCameraSize;
  shadow.camera.left = -directLightingCameraSize;
  shadow.camera.right = directLightingCameraSize;
  shadow.camera.bottom = -directLightingCameraSize;
  shadow.camera.top = directLightingCameraSize;
  this.sourceLight.target = skyDirector.camera;
  const  totalDistance = lightingData.shadowDrawDistance + lightingData.shadowDrawBehindDistance;
  this.targetScalar = 0.5 * totalDistance - lightingData.shadowDrawBehindDistance;
  this.shadowTarget = new THREE.Vector3();
  this.shadowTargetOffset = new THREE.Vector3();
  this.fogColorVector = new THREE.Color();
  this.xAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 1.0);
  this.yAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 1.0);
  this.zAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 1.0);
  this.xAxisHemisphericalLight.position.set(1,0,0);
  this.yAxisHemisphericalLight.position.set(0,1,0);
  this.zAxisHemisphericalLight.position.set(0,0,1);
  const isNormalLighting = lightingData.atmosphericPerspectiveType === 'normal';
  let maxFogDensity;
  if(isNormalLighting){
    maxFogDensity = lightingData.atmosphericPerspectiveDensity;
    this.fog = new THREE.FogExp2(0xFFFFFF, maxFogDensity);
    skyDirector.scene.fog = this.fog;
  }

  const scene = skyDirector.scene;
  scene.add(this.sourceLight);
  scene.add(this.xAxisHemisphericalLight);
  scene.add(this.yAxisHemisphericalLight);
  scene.add(this.zAxisHemisphericalLight);
  this.cameraRef = skyDirector.camera;
  const self = this;
  StarrySky.Methods.getDominantLightColor = function(){
		return self.sourceLight.color;
	};
	StarrySky.Methods.getDominantLightIntensity = function(){
		return self.sourceLight.intensity;
	}
	StarrySky.Methods.getAmbientLights = function(){
		return {
      x: self.xAxisHemisphericalLight,
      y: self.yAxisHemisphericalLight,
      z: self.zAxisHemisphericalLight
    };
	}
  this.tick = function(lightingState){
    //I also need to hook in the code from our tags for fog density under
    //sky-atmospheric-parameters and hook that value into this upon starting.
    //And drive the shadow type based on the shadow provided in sky-lighting.
    if(isNormalLighting){
      self.fogColorVector.fromArray(lightingState, 21);
      const maxColor = Math.max(self.fogColorVector.r, self.fogColorVector.g, self.fogColorVector.b);

      //The fog color is taken from sky color hemispherical data alone (excluding ground color)
      //and is the color taken by dotting the camera direction with the colors of our
      //hemispherical lighting along the x, z axis.
      self.fog.density = Math.pow(maxColor, 0.3) * maxFogDensity;
      self.fog.color.copy(self.fogColorVector);
    }

    const sunRadius = Math.sin(sunRenderer.sunAngularRadiusInRadians * skyState.sun.scale);
    const dominantLightIsSun = skyState.sun.position.y >= -sunRadius;

    //We update our directional light so that it's always targetting the camera.
    //We originally were going to target a point in front of the camera
    //but this resulted in terrible artifacts that caused the shadow to shimer
    //from the aliasing of the texture - without this shimmering
    //we can greatly reduce the size of our shadow map for the same quality.
    //LUT and is done in WASM, while the intensity is determined by whether the sun
    //or moon is in use and transitions between the two.
    //The target is a position weighted by the
    self.sourceLight.position.x = -RADIUS_OF_SKY * lightingState[27];
    self.sourceLight.position.y = RADIUS_OF_SKY * lightingState[26];
    self.sourceLight.position.z = -RADIUS_OF_SKY * lightingState[25];
    self.sourceLight.color.r = lunarEclipseLightingModifier.x * lightingState[18];
    self.sourceLight.color.g = lunarEclipseLightingModifier.y * lightingState[19];
    self.sourceLight.color.b = lunarEclipseLightingModifier.z * lightingState[20];
    self.sourceLight.intensity = lightingState[24] * 0.5 * (dominantLightIsSun ? lightingData.sunIntensity : lightingData.moonIntensity);

    //The hemispherical light colors replace ambient lighting and are calculated
    //in a web worker along with our sky metering. They are the light colors in the
    //directions of x, y and z.
    self.xAxisHemisphericalLight.color.fromArray(lightingState, 0);
    self.yAxisHemisphericalLight.color.fromArray(lightingState, 3);
    self.zAxisHemisphericalLight.color.fromArray(lightingState, 6);
    self.xAxisHemisphericalLight.groundColor.fromArray(lightingState, 9);
    self.yAxisHemisphericalLight.groundColor.fromArray(lightingState, 12);
    self.zAxisHemisphericalLight.groundColor.fromArray(lightingState, 15);
    const intensityModifier = Math.min(Math.max(lightingState[24] * 2.0, 0.0), 0.1) * 10.0;
    const indirectLightIntensity = Math.min(Math.max(lightingData.ambientIntensity * intensityModifier * 0.15, lightingData.minimumAmbientLighting), lightingData.maximumAmbientLighting);
    self.xAxisHemisphericalLight.intensity = indirectLightIntensity;
    self.yAxisHemisphericalLight.intensity = indirectLightIntensity;
    self.zAxisHemisphericalLight.intensity = indirectLightIntensity;
  }
};
