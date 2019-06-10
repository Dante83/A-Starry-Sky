function Moon(moonTextureDir, moonNormalMapDir, skyDomeRadius, sceneRef, textureLoader, angularDiameterOfTheMoon){
  this.moonTexture = textureLoader.load(moonTextureDir, function(moonTexture){
    moonTexture.magFilter = THREE.LinearFilter;
    moonTexture.minFilter = THREE.LinearMipMapLinearFilter;
    moonTexture.wrapS = THREE.ClampToEdgeWrapping;
    moonTexture.wrapW = THREE.ClampToEdgeWrapping;
    moonTexture.needsUpdate = true;
  });
  moonShaderMaterial.uniforms['moonTexture'].value = this.moonTexture;

  this.moonNormalMap = textureLoader.load(moonNormalMapDir, function(moonNormalTexture){
    moonNormalTexture.magFilter = THREE.LinearFilter;
    moonNormalTexture.minFilter = THREE.LinearMipMapLinearFilter;
    moonNormalTexture.wrapS = THREE.ClampToEdgeWrapping;
    moonNormalTexture.wrapW = THREE.ClampToEdgeWrapping;
    moonNormalTexture.needsUpdate = true;
  });
  moonShaderMaterial.uniforms['moonNormalMap'].value = this.moonNormalMap;

  this.xyzPosition;
  this.moonTangentSpaceSunlight;
  this.sceneRef = sceneRef;
  this.moonRadiusFromCamera = 0.75 * skyDomeRadius;

  //Create a three JS plane for our moon to live on in a hidden view
  let diameterOfMoonPlane = 2.0 * this.moonRadiusFromCamera * Math.sin(angularDiameterOfTheMoon);
  this.geometry = new THREE.PlaneGeometry(diameterOfMoonPlane, diameterOfMoonPlane, 1);
  this.geometry.translate(0.0, -0.0 * diameterOfMoonPlane, 0.0);

  //Apply this shader to our plane
  this.plane = new THREE.Mesh(this.geometry, moonShaderMaterial);
  this.plane.matrixAutoUpdate = false;
  this.sceneRef.add(this.plane);
  this.position = new THREE.Vector3();
  this.planeNormal = new THREE.Vector3();
  this.origin = new THREE.Vector3();
  this.planeU = new THREE.Vector3();
  this.planeV = new THREE.Vector3();
  this.translationToTangentSpace = new THREE.Matrix3();
  this.lightDirection = new THREE.Vector3();

  this.update = function(moonPosition, sunPosition){
    //move and rotate the moon
    let p = this.plane;
    this.position.set(moonPosition.x, moonPosition.y, moonPosition.z).multiplyScalar(this.moonRadiusFromCamera);
    p.position.set(this.position.x, this.position.y, this.position.z);
    p.lookAt(0.0,0.0,0.0);
    p.updateMatrix();

    //update our uv coordinates
    let vertices = p.geometry.vertices;
    p.updateMatrixWorld();
    this.origin.set(vertices[0].x, vertices[0].y, vertices[0].z);
    this.origin.applyMatrix4(p.matrixWorld);
    this.planeU.set(vertices[1].x, vertices[1].y, vertices[1].z);
    this.planeU.applyMatrix4(p.matrixWorld).sub(this.origin);
    this.planeU.normalize();
    this.planeV.set(vertices[2].x, vertices[2].y, vertices[2].z);
    this.planeV.applyMatrix4(p.matrixWorld).sub(this.origin);
    this.planeV.normalize();
    let normal = this.planeNormal.set(moonPosition.x, moonPosition.y, moonPosition.z).multiplyScalar(-1.0);
    this.translationToTangentSpace.set(
      this.planeU.x, this.planeV.x, normal.x,
      this.planeU.y, this.planeV.y, normal.y,
      this.planeU.z, this.planeV.z, normal.z,
    );
    this.translationToTangentSpace.transpose();
    this.lightDirection.set(sunPosition.x, sunPosition.y, sunPosition.z);
    this.lightDirection.applyMatrix3(this.translationToTangentSpace);

    moonShaderMaterial.uniforms['moonTangentSpaceSunlight'].value = this.lightDirection;
  }
}
