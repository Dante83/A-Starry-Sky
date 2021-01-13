//The lighting for our scene contains 3 hemispherical lights and 1 directional light
//with shadows enabled. The shadow enabled directional light is shared between the sun
//and the moon in order to reduce the rendering load.
StarrySky.LightingManager = function(parentComponent){
  this.skyDirector = parentComponent;
  const lightingData = this.skyDirector.assetManager.data.skyLighting;
  this.sourceLight = new THREE.DirectionalLight(0xffffff, 1.0);
  const shadow = this.sourceLight.shadow;
  this.sourceLight.castShadow = true;
  shadow.mapSize.width = lightingData.shadowCameraResolution;
  shadow.mapSize.height = lightingData.shadowCameraResolution;
  shadow.camera.near = 1E-4;
  shadow.camera.far = Math.sqrt(2.0) * Math.max(lightingData.shadowDrawDistance, lightingData.shadowDrawBehindDistance);
  shadow.camera.left = 0.0;
  const  totalDistance = lightingData.shadowDrawDistance + lightingData.shadowDrawBehindDistance;
  shadow.camera.right = totalDistance;
  shadow.camera.top = 0.5 * totalDistance;
  shadow.camera.bottom = 0.5 * totalDistance;
  this.targetScalar = 0.5 * totalDistance - lightingData.shadowDrawBehindDistance;
  this.shadowTarget = new THREE.Vector3();
  this.shadowTargetOffset = new THREE.Vector3();
  this.skyColorVector = new THREE.Vector3();

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
  //AVENGE ME!
  // scene.add(this.xAxisHemisphericalLight);
  // scene.add(this.yAxisHemisphericalLight);
  // scene.add(this.zAxisHemisphericalLight);

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

    //We update our directional light so that it's always targetting a
    //point in front of the camera as described by the draw and draw behind distance.
    //The color of the light is chosen from the transmittance
    //LUT and is done in WASM, while the intensity is determined by whether the sun
    //or moon is in use and transitions between the two.
    //The target is a position weighted by the
    self.shadowTarget.copy(self.skyDirector.camera.position);
    self.skyDirector.camera.getWorldDirection(self.shadowTargetOffset);
    self.shadowTargetOffset.multiplyScalar(self.targetScalar);
    self.shadowTarget.add(self.shadowTargetOffset);
    self.sourceLight.target.position.copy(self.shadowTarget);
    self.sourceLight.color.fromArray(lightingState, 18);
    self.sourceLight.position.fromArray(lightingState, 25);
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
