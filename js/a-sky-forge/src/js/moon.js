function Moon(moonTextureDir, moonNormalMapDir, skyDomeRadius, sceneRef, textureLoader){
  this.moonTexture = textureLoader.load(moonTextureDir);
  this.moonNormalMap = textureLoader.load(moonNormalMapDir);
  this.xyzPosition;
  this.moonTangentSpaceSunlight;
  this.sceneRef = sceneRef;
  this.moonRadiusFromCamera = 0.1 * skyDomeRadius;

  //Create a three JS plane for our moon to live on in a hidden view
  //let angularRadiusOfMoon = 0.024;
  let angularRadiusOfMoon = 0.055;
  let diameterOfMoonPlane = 2.0 * this.moonRadiusFromCamera * Math.sin(angularRadiusOfMoon);
  this.geometry = new THREE.PlaneGeometry(diameterOfMoonPlane, diameterOfMoonPlane, 1);
  this.geometry.translate(0.0, -0.25 * diameterOfMoonPlane, 0.0);

  //Set up our shader
  this.material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});

  //Apply this shader to our plane
  this.plane = new THREE.Mesh(this.geometry, this.material);
  this.plane.matrixAutoUpdate = false;
  this.sceneRef.add(this.plane);
  this.position = new THREE.Vector3();

  this.update = function(moonPosition, sunPosition, moonAzimuth, moonAltitude, moonEE){
    //update our uniforms

    //move and rotate the moon
    this.position.set(moonPosition.x, moonPosition.y, moonPosition.z).multiplyScalar(this.moonRadiusFromCamera);
    this.plane.position.set(this.position.x, this.position.y, this.position.z);
    this.plane.lookAt(0.0,0.0,0.0);
    this.plane.updateMatrix();
  }
}
