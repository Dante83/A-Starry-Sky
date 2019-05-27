function Moon(moonTextureDir, moonNormalMapDir, skyDomeRadius, sceneRef, textureLoader){
  let ddsLoader = new THREE.DDSLoader();
  this.moonTexture = ddsLoader.load(moonTextureDir, function(moonTexture){
    moonTexture.magFilter = THREE.LinearFilter;
    moonTexture.minFilter = THREE.LinearMipMapLinearFilter;
    moonTexture.wrapS = THREE.ClampToEdgeWrapping;
    moonTexture.wrapW = THREE.ClampToEdgeWrapping;
    moonTexture.needsUpdate = true;
  });
  moonShaderMaterial.uniforms['moonTexture'].value = this.moonTexture;

  this.moonNormalMap = ddsLoader.load(moonNormalMapDir, function(moonNormalTexture){
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
  this.moonRadiusFromCamera = 0.1 * skyDomeRadius;

  //Create a three JS plane for our moon to live on in a hidden view
  //let angularRadiusOfMoon = 0.024;
  let angularRadiusOfMoon = 0.055;
  let diameterOfMoonPlane = 2.0 * this.moonRadiusFromCamera * Math.sin(angularRadiusOfMoon);
  this.geometry = new THREE.PlaneGeometry(diameterOfMoonPlane, diameterOfMoonPlane, 1);
  this.geometry.translate(0.0, -0.0 * diameterOfMoonPlane, 0.0);

  //Set up our shader
  this.material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});

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

  function totalMie(T){
    const lambda = new THREE.Vector3(680e-9, 550e-9, 450e-9);
    const k = new THREE.Vector3(0.686, 0.678, 0.666);
    const piTimes2 = 2.0 * Math.PI;
    let c = (0.2 * T) * 10.0e-18;
    let v = new THREE.Vector3(piTimes2, piTimes2, piTimes2);
    v.divide(lambda);
    v.multiply(v); // raise to the power of v - 2.0 where v is 4.0, so square it
    return v.multiply(k).multiplyScalar(0.434 * c * Math.PI);
  }

  this.update = function(moonPosition, sunPosition, moonAzimuth, moonAltitude, moonEE, mieDirectionalG, mieCoefficient, luminance, rayleigh, turbidty){
    //
    //update our uniforms
    //
    let sunFade = 1.0 - Math.min(Math.max(1.0 - Math.exp(sunPosition.z), 0.0), 1.0);
    let moonFade = 1.0 - Math.min(Math.max(1.0 - Math.exp(moonPosition.z), 0.0), 1.0);
    moonShaderMaterial.uniforms['sunFade'].value = sunFade;
    moonShaderMaterial.uniforms['moonFade'].value = moonFade;
    moonShaderMaterial.uniforms['rayleighCoefficientOfSun'].value = rayleigh - (1.0 - sunFade);
    moonShaderMaterial.uniforms['rayleighCoefficientOfMoon'].value = rayleigh - (1.0 - moonFade);
    moonShaderMaterial.uniforms['mieDirectionalG'].value = mieDirectionalG;
    let mieCoefficientVec3 = new THREE.Vector3(mieCoefficient, mieCoefficient, mieCoefficient);
    moonShaderMaterial.uniforms['betaM'].value = mieCoefficientVec3.multiply(totalMie(turbidty));
    const up = new THREE.Vector3(0.0, 1.0, 0.0);
    let dotOfMoonDirectionAndUp = moonPosition.dot(up);
    let dotOfSunDirectionAndUp = sunPosition.dot(up);
    moonShaderMaterial.uniforms['moonE'].value = moonEE * Math.max(0.0, 1.0 - Math.exp(-(((Math.PI / 1.95) - Math.acos(dotOfMoonDirectionAndUp))/1.5)));
    moonShaderMaterial.uniforms['sunE'].value = 1000.0 * Math.max(0.0, 1.0 - Math.exp(-(((Math.PI / 1.95) - Math.acos(dotOfSunDirectionAndUp))/1.5)));
    moonShaderMaterial.uniforms['linMoonCoefficient2'].value = Math.min(Math.max(Math.pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0),1.0);
    moonShaderMaterial.uniforms['linSunCoefficient2'].value = Math.min(Math.max(Math.pow(1.0-dotOfSunDirectionAndUp,5.0),0.0),1.0);
    moonShaderMaterial.uniforms['sunXYZPosition'].value = sunPosition;
    const simplifiedRayleigh = new THREE.Vector3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);
    moonShaderMaterial.uniforms['betaRSun'].value = simplifiedRayleigh.clone().multiplyScalar(rayleigh - (1.0 - sunFade));
    moonShaderMaterial.uniforms['betaRMoon'].value = simplifiedRayleigh.clone().multiplyScalar(rayleigh - (1.0 - moonFade));
    moonShaderMaterial.uniforms['moonXYZPosition'].value = moonPosition;

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
