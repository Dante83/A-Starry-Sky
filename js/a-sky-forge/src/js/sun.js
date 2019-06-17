function Sun(skyDomeRadius, sceneRef, sunTextureDir, textureLoader){
  this.sunTexture = textureLoader.load(sunTextureDir, function(sunTexture){
    sunTexture.magFilter = THREE.LinearFilter;
    sunTexture.minFilter = THREE.LinearMipMapLinearFilter;
    sunTexture.wrapS = THREE.ClampToEdgeWrapping;
    sunTexture.wrapW = THREE.ClampToEdgeWrapping;
    sunTexture.needsUpdate = true;
  });
  sunShaderMaterial.uniforms['sunTexture'].value = this.sunTexture;

  this.xyzPosition;
  this.sceneRef = sceneRef;
  this.sunRadiusFromCamera = 0.8 * skyDomeRadius;

  //Create a three JS plane for our sun to live on in a hidden view
  let angularDiameterOfTheSun = 0.059;
  this.angularDiameterOfTheSun = angularDiameterOfTheSun;
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

  //Create a directional light for the sun
  this.oneVector = new THREE.Vector3(1.0, 1.0, 1.0);
  this.up = new THREE.Vector3(0.0, 1.0, 0.0);
  this.light = new THREE.DirectionalLight(0xffffff, 1.0);
  this.light.castShadow = true;
  this.light.shadow.mapSize.width = 512*2;
  this.light.shadow.mapSize.height = 512*2;
  this.light.shadow.camera.near = 10.0;
  this.light.shadow.camera.far = this.sunRadiusFromCamera * 2.0;
  this.sceneRef.add(this.light);
  this.fexSun = new THREE.Vector3();
  this.directlightColor = new THREE.Color();
  this.directLightIntensity;
  this.ambientColor = new THREE.Vector3();
  this.ambientIntensity;

  this.update = function(sunPosition, betaRSun, betaM, sunE, sunFade){
    //move and rotate the sun
    let p = this.plane;
    this.position.set(sunPosition.x, sunPosition.y, sunPosition.z).multiplyScalar(this.sunRadiusFromCamera);
    p.position.set(this.position.x, this.position.y, this.position.z);
    p.lookAt(0.0,0.0,0.0);
    p.updateMatrix();
    p.updateMatrixWorld();

    let l = this.light;

    l.position.set(this.position.x, this.position.y, this.position.z);
    let cosZenithAngleOfSun = Math.max(0.0, this.up.dot(sunPosition));
    let zenithAngleOfSun = Math.acos(cosZenithAngleOfSun);
    let inverseSDenominator = 1.0 / (cosZenithAngleOfSun + 0.15 * Math.pow(93.885 - (zenithAngleOfSun * 180.0 / Math.PI), -1.253));
    const rayleighAtmosphereHeight = 8.4E3;
    const mieAtmosphereHeight = 1.25E3;
    let sR = rayleighAtmosphereHeight * inverseSDenominator;
    let sM = mieAtmosphereHeight * inverseSDenominator;
    let betaMTimesSM = betaM.clone().multiplyScalar(sM);
    this.fexSun.set(
      Math.max(Math.min(Math.exp(-(betaRSun.x * sR + betaMTimesSM.x)), 1.0), 0.0),
      Math.max(Math.min(Math.exp(-(betaRSun.y * sR + betaMTimesSM.y)), 1.0), 0.0),
      Math.max(Math.min(Math.exp(-(betaRSun.z * sR + betaMTimesSM.z)), 1.0), 0.0)
    );
    l.color.setRGB(this.fexSun.x, this.fexSun.y, this.fexSun.z);

    let solarLightBaseIntensitySquared = sunE / 700.0;
    let solarLightBaseIntensity = Math.sqrt(solarLightBaseIntensitySquared);
    l.color = this.directlightColor;
    l.intensity = solarLightBaseIntensity;
    let ambientColorVec = this.oneVector.clone().sub(this.fexSun);
    this.ambientColor = ambientColorVec;
    this.ambientIntensity = solarLightBaseIntensity * sunFade;
  };
}
