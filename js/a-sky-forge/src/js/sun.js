function Sun(skyDomeRadius, sceneRef){
  this.xyzPosition;
  this.sceneRef = sceneRef;
  this.sunRadiusFromCamera = 0.8 * skyDomeRadius;

  //Create a three JS plane for our moon to live on in a hidden view
  let angularDiameterOfTheSun = 0.059;
  let diameterOfSunPlane = 2.0 * this.sunRadiusFromCamera * Math.sin(angularDiameterOfTheSun);
  this.geometry = new THREE.PlaneGeometry(diameterOfSunPlane, diameterOfSunPlane, 1);
  this.geometry.translate(0.0, -0.0 * diameterOfSunPlane, 0.0);

  //Apply this shader to our plane
  this.plane = new THREE.Mesh(this.geometry, sunShaderMaterial);
  this.plane.matrixAutoUpdate = false;
  this.sceneRef.add(this.plane);
  this.position = new THREE.Vector3();
  this.planeNormal = new THREE.Vector3();
  this.origin = new THREE.Vector3();
  this.planeU = new THREE.Vector3();
  this.planeV = new THREE.Vector3();
  this.translationToTangentSpace = new THREE.Matrix3();
  this.lightDirection = new THREE.Vector3();

  this.update = function(sunPosition){
    //move and rotate the moon
    let p = this.plane;
    this.position.set(sunPosition.x, sunPosition.y, sunPosition.z).multiplyScalar(this.sunRadiusFromCamera);
    p.position.set(this.position.x, this.position.y, this.position.z);
    p.lookAt(0.0,0.0,0.0);
    p.updateMatrix();
    p.updateMatrixWorld();
  }
}
