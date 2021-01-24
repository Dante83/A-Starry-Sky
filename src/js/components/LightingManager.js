//The lighting for our scene contains 3 hemispherical lights and 1 directional light
//with shadows enabled. The shadow enabled directional light is shared between the sun
//and the moon in order to reduce the rendering load.
StarrySky.LightingManager = function(parentComponent){
  const RADIUS_OF_SKY = 4990.0;
  this.skyDirector = parentComponent;
  const lightingData = this.skyDirector.assetManager.data.skyLighting;
  this.sourceLight = new THREE.DirectionalLight(0xffffff, 4.0);
  const shadow = this.sourceLight.shadow;
  this.sourceLight.castShadow = true;
  shadow.mapSize.width = lightingData.shadowCameraResolution;
  shadow.mapSize.height = lightingData.shadowCameraResolution;
  shadow.camera.near = RADIUS_OF_SKY - 128.0;
  shadow.camera.far = RADIUS_OF_SKY * 2.0;
  shadow.camera.left = -64.0;
  shadow.camera.right = 64.0;
  shadow.camera.bottom = -64.0;
  shadow.camera.top = 64.0;
  shadow.bias = -0.0003;
  //shadow.normalBias = 0.0001;
  const  totalDistance = lightingData.shadowDrawDistance + lightingData.shadowDrawBehindDistance;
  this.targetScalar = 0.5 * totalDistance - lightingData.shadowDrawBehindDistance;
  this.shadowTarget = new THREE.Vector3();
  this.shadowTargetOffset = new THREE.Vector3();
  this.skyColorVector = new THREE.Vector3();
  //shadow.radius = 4.0;

  //AVENGE ME!
  // this.xAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0);
  // this.yAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0);
  // this.zAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0);
  // this.xAxisHemisphericalLight.position = new THREE.Vector3(1, 0, 0);
  // this.yAxisHemisphericalLight.position = new THREE.Vector3(0, 1, 0);
  // this.zAxisHemisphericalLight.position = new THREE.Vector3(0, 0, 1);

  //AVENGE ME!
  // if(lightingData.atmosphericPerspectiveEnabled){
  //   this.fog = new THREE.FogExp2(0x000000, 0);
  //   this.maxFogDensity = lightingData.atmosphericPerspectiveMaxFogDensity;
  //   parentComponent.scene.fog = this.fog;
  // }

  const scene = parentComponent.scene;
  scene.add(this.sourceLight);
  scene.add(this.sourceLight.target)
  //AVENGE ME!
  // scene.add(this.xAxisHemisphericalLight);
  // scene.add(this.yAxisHemisphericalLight);
  // scene.add(this.zAxisHemisphericalLight);

  let helper = new THREE.DirectionalLightHelper(this.sourceLight, 5 , 0xffffff);
  let shadowHelper = new THREE.CameraHelper( this.sourceLight.shadow.camera, 5, 0xffffff);
  scene.add(helper);
  scene.add(shadowHelper);

  this.cameraRef = parentComponent.camera;
  const self = this;
  this.tick = function(lightingState){
    //
    //TODO: We should move our fog color to a shader hack approach,
    //as described in https://snayss.medium.com/three-js-fog-hacks-fc0b42f63386
    //along with adding a volumetric fog system.
    //
    //The colors for this fog could then driven by a shader as described in
    //http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
    //

    //I also need to hook in the code from our tags for fog density under
    //sky-atmospheric-parameters and hook that value into this upon starting.
    //And drive the shadow type based on the shadow provided in sky-lighting.
    if(this.skyDirector.assetManager.data.skyLighting.atmosphericPerspectiveEnabled){
      self.skyColorVector.fromArray(lightingState, 21);
      const magnitudeOfSkySquared = self.skyColorVector.lengthSquared();
      self.skyColorVector.divideScalar(Math.sqrt(magnitudeOfSkySquared));
      self.fog.density = magnitudeOfSkySquared * self.maxFogDensity;

      //The fog color is taken from sky color hemispherical data alone (excluding ground color)
      //and is the color taken by dotting the camera direction with the colors of our
      //hemispherical lighting along the x, z axis.
      self.fog.color.copy(self.skyColorVector);
    }

    //We update our directional light so that it's always targetting the camera.
    //We originally were going to target a point in front of the camera
    //but this resulted in terrible artifacts that caused the shadow to shimer
    //from the aliasing of the texture - without this shimmering
    //we can greatly reduce the size of our shadow map for the same quality.
    //LUT and is done in WASM, while the intensity is determined by whether the sun
    //or moon is in use and transitions between the two.
    //The target is a position weighted by the
    //console.log(`x: ${this.shadowTarget.x} y: ${this.shadowTarget.y} z: ${this.shadowTarget.z}`);
    self.sourceLight.target.position = self.skyDirector.camera.position;
    //console.log(`R: ${lightingState[18]} G: ${lightingState[19]} B: ${lightingState[20]}`);
    self.sourceLight.position.x = -RADIUS_OF_SKY * lightingState[27];
    self.sourceLight.position.y = RADIUS_OF_SKY * lightingState[26];
    self.sourceLight.position.z = -RADIUS_OF_SKY * lightingState[25];
    self.sourceLight.color.fromArray(lightingState, 18);
    self.sourceLight.intensity = lightingState[24];

    //The hemispherical light colors replace ambient lighting and are calculated
    //in a web worker along with our sky metering. They are the light colors in the
    //directions of x, y and z.
    //AVENGE ME!!!
    // self.xAxisHemisphericalLight.color.fromArray(lightingState, 0);
    // self.yAxisHemisphericalLight.color.fromArray(lightingState, 3);
    // self.zAxisHemisphericalLight.color.fromArray(lightingState, 6);
    // self.xAxisHemisphericalLight.groundColor.fromArray(lightingState, 9);
    // self.yAxisHemisphericalLight.groundColor.fromArray(lightingState, 12);
    // self.zAxisHemisphericalLight.groundColor.fromArray(lightingState, 15);
  }
};
