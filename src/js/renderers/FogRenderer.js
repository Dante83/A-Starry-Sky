StarrySky.Renderers.FogRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  const assetManager = skyDirector.assetManager;
  const atmosphericParameters = assetManager.data.skyAtmosphericParameters;
  const skyState = skyDirector.skyState;
  const mieCoefficient = 0.01;
  const mieDirectionalG = atmosphericParameters.mieDirectionalG;
  const turbidity = 10.0;
  const rayleigh = 3.0;
  const fogDensity = 0.0005;
  const exposure = 1.0;
  THREE.ShaderChunk.fog_pars_fragment = StarrySky.Materials.Fog.fogParsMaterial.fragmentShader(mieDirectionalG, rayleigh, fogDensity, exposure);
  THREE.ShaderChunk.fog_pars_vertex = StarrySky.Materials.Fog.fogParsMaterial.vertexShader(rayleigh, turbidity, mieCoefficient);
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
    const moonAzimuth = Math.atan(skyState.moon.position.x / skyState.moon.position.z) - Math.PI;
    const moonIntensity = skyState.moon.intensity;

    //Inject the intensity for the moon
    this.fog.color.fromArray([sunAltitude, sunAzimuth, moonAltitude]);
    this.fog.near = moonAzimuth;
    this.fog.far = (1000.0 * moonIntensity) / 20.0;
  }
}
