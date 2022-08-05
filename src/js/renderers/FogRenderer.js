StarrySky.Renderers.FogRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  const assetManager = skyDirector.assetManager;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  const skyState = skyDirector.skyState;
  const mieCoefficient = 0.005;
  const mieDirectionalG = atmosphericParameters.mieDirectionalG;
  const turbidity = 10.0;
  const rayleigh = 3.0;
  const groundDistanceMultp = 1.0;
  const exposure = 0.35;
  const enhancedAtmosphericPerspectiveEnabled = false;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const sunRadius = Math.sin(atmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5);
  const moonRadius = Math.sin(atmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5);
  const distanceForSolarEclipse = 2.0 * Math.SQRT2 * Math.max(self.sunRadius, self.moonRadius);
  THREE.ShaderChunk.fog_pars_fragment = StarrySky.Materials.Fog.fogParsMaterial.fragmentShader(mieDirectionalG, rayleigh, exposure, groundDistanceMultp);
  THREE.ShaderChunk.fog_pars_vertex = StarrySky.Materials.Fog.fogParsMaterial.vertexShader(rayleigh, turbidity, mieCoefficient, groundDistanceMultp, sunRadius, moonRadius, distanceForSolarEclipse);
  THREE.ShaderChunk.fog_fragment = StarrySky.Materials.Fog.fogMaterial.fragmentShader;
  THREE.ShaderChunk.fog_vertex = StarrySky.Materials.Fog.fogMaterial.vertexShader;

  this.fog = new THREE.Fog(new THREE.Vector3(), 0.0, 1.0);
  skyDirector.scene.fog = this.fog;

  const self = this;
  this.tick = function(t){
    //Convert our sun and moon position to rho and phi
    const sunAltitude = Math.acos(skyState.sun.position.y);
    const sunAzimuth = Math.atan2(skyState.sun.position.x, skyState.sun.position.z) - Math.PI;
    const moonAltitude = Math.acos(skyState.moon.position.y);
    const moonAzimuth = Math.atan2(skyState.moon.position.x, skyState.moon.position.z) - Math.PI;
    const moonIntensity = Math.pow(skyState.moon.horizonFade , 3.0) * skyState.moon.intensity;

    //Inject the intensity for the moon
    this.fog.color.fromArray([sunAltitude, sunAzimuth, moonAltitude]);
    this.fog.near = moonAzimuth;
    this.fog.far = (1300.0 * moonIntensity) / 20.0;
  }
}
