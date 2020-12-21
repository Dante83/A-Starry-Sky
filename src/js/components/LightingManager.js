//The lighting for our scene contains 3 hemispherical lights and 1 directional light
//with shadows enabled. The shadow enabled directional light is shared between the sun
//and the moon in order to reduce the rendering load.
StarrySky.LightingManager = function(parentComponent){
  this.skyDirector = parentComponent;
  this.sourceLight = new THREE.DirectionLight(0xffffff, 1.0);
  this.sourceLight.castShadow = true;
  this.sourceLight.shadow.mapSize.width = 512;
  this.sourceLight.shadow.mapSize.height = 512;
  this.sourceLight.shadow.camera.near = 1.0;
  this.sourceLight.shadow.camera.far = 256.0;

  this.xAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0);
  this.yAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0);
  this.zAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0);
  this.xAxisHemisphericalLight.position = new THREE.Vector3(1, 0, 0);
  this.yAxisHemisphericalLight.position = new THREE.Vector3(0, 1, 0);
  this.zAxisHemisphericalLight.position = new THREE.Vector3(0, 0, 1);

  this.fogColor = new THREE.FogExp2(0x000000, 0);

  parentComponent.scene.append(this.sourceLight);
  parentComponent.scene.append(this.xAxisHemisphericalLight);
  parentComponent.scene.append(this.yAxisHemisphericalLight);
  parentComponent.scene.append(this.zAxisHemisphericalLight);
  parentComponent.scene.fog = this.fog;

  this.cameraRef = parentComponent.camera;
  const self = this;
  this.updateLighting = function(colorValues, directionalLightValues){
    //We still have to hook this up to our code in our interpolator
    //I also don't have the code fulling worked out for getting our position
    //and target as we just get the direction of the light, but need to consider
    //the best place to put our light such that it gives the best shadows for our
    //camera.

    //I also need to hook in the code from our tags for fog density under
    //sky-atmospheric-parameters and hook that value into this upon starting.
    //And drive the shadow type based on teh shadow provided in sky-lighting.

    //We update our directional light so that it's always targetting a
    //point in front of the camera, s.t. everything 100 m behind the camera casts a shadow, and everything 900m
    //in front of the camera casts a shadow. The color of the light is chosen from the transmittance
    //LUT and is done in WASM, while the intensity is determined by whether the sun
    //or moon is in use and transitions between the two.
    self.sourceLight.color.fromArray(colorValues, 18);
    self.sourceLight.position.fromArray(directionalLightValues, 0);
    self.sourceLight.target.fromArray(directionalLightValues, 3);
    self.sourceLight.intensity = directionalLightValues[7];

    //The hemispherical light colors replace ambient lighting and are calculated
    //in a web worker along with our sky metering. They are the light colors in the
    //directions of x, y and z.
    self.xAxisHemisphericalLight.color.fromArray(colorValues, 0);
    self.yAxisHemisphericalLight.color.fromArray(colorValues, 3);
    self.zAxisHemisphericalLight.color.fromArray(colorValues, 6);
    self.xAxisHemisphericalLight.groundColor.fromArray(colorValues, 9);
    self.yAxisHemisphericalLight.groundColor.fromArray(colorValues, 12);
    self.zAxisHemisphericalLight.groundColor.fromArray(colorValues, 15);

    //The fog color is taken from sky color hemispherical data alone (excluding ground color)
    //and is the color taken by dotting the camera direction with the colors of our
    //hemispherical lighting along the x, z axis.
    self.fogColor.color.fromArray(colorValues, 21);
  }
};
