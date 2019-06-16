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
  this.moonRadiusFromCamera = 0.68 * skyDomeRadius;

  //Create a three JS plane for our moon to live on in a hidden view
  this.angularRadiusOfTheMoon = angularDiameterOfTheMoon;
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

  //Create a directional light for the moon
  this.oneVector = new THREE.Vector3(1.0, 1.0, 1.0);
  this.up = new THREE.Vector3(0.0, 1.0, 0.0);
  this.light = new THREE.DirectionalLight(0xffffff, 1.0);
  this.light.castShadow = true;
  this.light.shadow.mapSize.width = 512*2;
  this.light.shadow.mapSize.height = 512*2;
  this.light.shadow.camera.near = 10.0;
  this.light.shadow.camera.far = this.moonRadiusFromCamera * 2.0;
  this.sceneRef.add(this.light);
  this.fexMoon = new THREE.Vector3();
  this.directlightColor = new THREE.Color();
  this.directLightIntensity;
  this.ambientColor = new THREE.Vector3();
  this.ambientIntensity;

  this.update = function(moonPosition, sunPosition, betaRMoon, betaM, moonE, moonFade, lunarIntensityModifier){
    //move and rotate the moon
    let p = this.plane;
    this.position.set(moonPosition.x, moonPosition.y, moonPosition.z).multiplyScalar(this.moonRadiusFromCamera);
    p.position.set(this.position.x, this.position.y, this.position.z);
    p.lookAt(0.0,0.0,0.0);
    p.updateMatrix();

    let l = this.light;

    l.position.set(this.position.x, this.position.y, this.position.z);
    let cosZenithAngleOfMoon = Math.max(0.0, this.up.dot(moonPosition));
    let zenithAngleOfMoon = Math.acos(cosZenithAngleOfMoon);
    let angleOfMoon = (0.5 * Math.PI) - zenithAngleOfMoon
    let sinOfAngleOfMoon = Math.sin(angleOfMoon);
    let inverseSDenominator = 1.0 / (cosZenithAngleOfMoon + 0.15 * Math.pow(93.885 - (zenithAngleOfMoon * 180.0 / Math.PI), -1.253));
    const rayleighAtmosphereHeight = 8.4E3;
    const mieAtmosphereHeight = 1.25E3;
    let sR = rayleighAtmosphereHeight * inverseSDenominator;
    let sM = mieAtmosphereHeight * inverseSDenominator;
    let betaMTimesSM = betaM.clone().multiplyScalar(sM);
    this.fexMoon.set(
      Math.max(Math.min(Math.exp(-(betaRMoon.x * sR + betaMTimesSM.x)), 1.0), 0.0),
      Math.max(Math.min(Math.exp(-(betaRMoon.y * sR + betaMTimesSM.y)), 1.0), 0.0),
      Math.max(Math.min(Math.exp(-(betaRMoon.z * sR + betaMTimesSM.z)), 1.0), 0.0)
    );
    l.color.setRGB(this.fexMoon.x, this.fexMoon.y, this.fexMoon.z);

    let lunarLightBaseIntensitySquared = moonE / 700.0;
    let lunarLightBaseIntensity = Math.sqrt(lunarLightBaseIntensitySquared) * lunarIntensityModifier;
    l.color = this.directlightColor;
    l.intensity = lunarLightBaseIntensity;
    let ambientColorVec = this.oneVector.clone().sub(this.fexMoon);
    this.ambientColor = ambientColorVec;
    this.ambientIntensity = lunarLightBaseIntensity * moonFade;

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
