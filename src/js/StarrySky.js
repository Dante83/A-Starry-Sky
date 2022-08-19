//Basic skeleton for the overall namespace of the A-Starry-Sky
StarrySky = {
  skyDirectorRef: null,
  assetPaths: {},
  DefaultData: {},
  LUTlibraries: {},
  Materials: {
    Atmosphere: {},
    Autoexposure: {},
    Clouds: {},
    Fog: {},
    Moon: {},
    Postprocessing: {},
    Stars: {},
    Sun: {}
  },
  Renderers: {},
  Methods: {
    getSunPosition: () => {return new Vector3();},
    getMoonPosition: () => {return new Vector3();},
    getSunRadius: () => {return 0.0;},
    getMoonRadius: () => {return 0.0;},
    getDominantLightColor: () => {return new Vector3();},
    getDominantLightIntensity: () => {return 0.0;},
    getIsDominantLightSun: () => {return false;},
    getAmbientLights: () => {return {
      x: null,
      y: null,
      z: null
    }},
    setActiveCamera: (camera) => {
      if(StarrySky.skyDirectorRef !== null){
        StarrySky.skyDirectorRef.camera = camera;
      }
    },
    getActiveCamera: () => {
      if(StarrySky.skyDirectorRef !== null){
        return StarrySky.skyDirectorRef.camera;
      }
      return false;
    }
  }
};
