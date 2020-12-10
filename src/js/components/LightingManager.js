//The lighting for our scene contains 3 hemispherical lights and 1 directional light
//with shadows enabled. The shadow enabled directional light is shared between the sun
//and the moon in order to reduce the rendering load.
StarrySky.LightingManager = function(parentComponent, transmittanceLUT){
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
  this.updateLighting(directionalLightData, hemisphericalLightData, fogData){
    //We update our directional light so that it's always targetting a
    //point in front of the camera, s.t. everything 100 m behind the camera casts a shadow, and everything 900m
    //in front of the camera casts a shadow. The color of the light is chosen from the transmittance
    //LUT and is done in WASM, while the intensity is determined by whether the sun
    //or moon is in use and transitions between the two.

    //The hemispherical light colors replace ambient lighting and are calculated
    //in a web worker along with our sky metering. They are the light colors in the
    //directions of x, y and z. The intensity is scaled such that it is the remainder
    //of the direct lighting intensity * (1 - transmittance)

    //The fog color is taken from sky color hemispherical data alone (excluding ground color)
    //and is the color taken by dotting the camera direction with the colors of our
    //hemispherical lighting along the x, z axis.

  }
};
