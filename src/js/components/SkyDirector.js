// This loads the wasm generated glue code
importScripts('../../cpp/sky-interpolation-controller/sky-interpolator-module.js');

StarrySky.SkyDirector = function(parentComponent){
  this.skyDirectorWASMIsReady = false;
  this.assetManagerInitialized = false;
  this.skyState;
  this.EVENT_INITIALIZE = 0;
  this.EVENT_INITIALIZATION_RESPONSE = 1;
  this.EVENT_UPDATE_LATEST = 2;
  this.EVENT_RETURN_LATEST = 3;
  //7 Astronomical RAs and HAs (14), 7(21) brightnesses, the LSRT(22), Lunar Parallactic Angle(23)
  //Earthshine Intensity(24), Solar and Lunar Scale Multiplier(26) or 26 variables
  //14 of these require rotational transformations
  //10 are linear interpolations
  //1 (LSRT) is a rotational interpolation
  const BYTES_PER_32_BIT_FLOAT = 4;
  const NUMBER_OF_FLOATS = 26;
  const NUMBER_OF_ROTATIONAL_TRANSFORMATIONS = 14;
  const NUMBER_OF_LINEAR_INTERPOLATIONS = 11;
  const NUMBER_OF_ROTATIONAL_INTERPOLATIONS = 1;
  const TOTAL_BYTES_FOR_WORKER_BUFFERS = BYTES_PER_32_BIT_FLOAT * NUMBER_OF_FLOATS;
  const FIVE_MINUTES = 60.0 * 5.0 * 1000.0;
  let transferrableInitialStateBuffer = new ArrayBuffer(TOTAL_BYTES_FOR_WORKER_BUFFERS);
  this.transferrableFinalStateBuffer = new ArrayBuffer(TOTAL_BYTES_FOR_WORKER_BUFFERS);
  this.finalStateFloat32Array = new Float32Array(this.transferrableFinalStateBuffer);
  this.astroPositions_0_ptr;
  this.astroPositions_f_ptr;
  this.rotatedAstroPositions_ptr;
  this.rotatedAstroPositions;
  this.linearValues_0_ptr;
  this.linearValues_f_ptr;
  this.linearValues_ptr;
  this.linearValues;
  this.finalLSRT;
  this.parentComponent = parentComponent;
  this.renderer = parentComponent.el.sceneEl.renderer;
  this.scene = parentComponent.el.sceneEl.object3D;
  this.lastUpdateT;
  //
  //TODO: Come back here and grab the camera. This is important for attaching child objects in our sky
  //that will follow this object around.
  //
  // this.camera = self.el.sceneEl.camera;
  this.assetManager;
  this.LUTLibraries;
  this.renderers;
  this.interpolator = null;
  let self = this;

  this.initializeRenderers = function(assetManager = false){
    //All systems must be up and running before we are ready to begin
    if(self.skyDirectorWASMIsReady && self.assetManagerInitialized){
      //Prepare all of our renderers to display stuff
      self.renderers.atmosphereRenderer = new StarrySky.Renderers.AtmosphereRenderer(self);
      self.start();
    }
    if(assetManager !== false){
      self.assetManager = assetManager;
    }
  }

  this.updateFinalSkyState = function(lsrt_0, lsrt_f){
    //Set initial values to final values in module and update our final values to the values
    //returned from our worker.
    Module._updateFinalValues(self.astroPositions_f_ptr, self.linearValues_f_ptr);
    Module._updateTimeData(0.0, FIVE_MINUTES, lsrt_0, lsrt_f);

    //Return the final state back to the worker thread so it can determine the state five minutes from now
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_UPDATE_LATEST,
      transferrableFinalStateBuffer: self.transferrableFinalStateBuffer
    }, [self.transferrableFinalStateBuffer]);
  }

  this.tick = function(t){
    //Update our sky state
    let relativeT = t - self.lastUpdateT;
    Module._tick(relativeT);

    //Update our astronomical positions
    self.skyState.sun.azimuth = self.rotatedAstroPositions[0];
    self.skyState.sun.altitude = self.rotatedAstroPositions[1];
    self.skyState.moon.azimuth = self.rotatedAstroPositions[2];
    self.skyState.moon.altitude = self.rotatedAstroPositions[3];
    self.skyState.mercury.azimuth = self.rotatedAstroPositions[4];
    self.skyState.mercury.altitude = self.rotatedAstroPositions[5];
    self.skyState.venus.azimuth = self.rotatedAstroPositions[6];
    self.skyState.venus.altitude = self.rotatedAstroPositions[7];
    self.skyState.mars.azimuth = self.rotatedAstroPositions[8];
    self.skyState.mars.altitude = self.rotatedAstroPositions[9];
    self.skyState.jupiter.azimuth = self.rotatedAstroPositions[10];
    self.skyState.jupiter.altitude = self.rotatedAstroPositions[11];
    self.skyState.saturn.azimuth = self.rotatedAstroPositions[12];
    self.skyState.saturn.altitude = self.rotatedAstroPositions[13];

    //Update our linear values
    self.skyState.sun.intensity = self.linearValues[0];
    self.skyState.sun.scale = self.linearValues[1];
    self.skyState.moon.intensity = self.linearValues[2];
    self.skyState.moon.scale = self.linearValues[3];
    self.skyState.moon.parallacticAngle = self.linearValues[4];
    self.skyState.moon.earthshine = self.linearValues[5];
    self.skyState.mercury.intensity = self.linearValues[6];
    self.skyState.venus.intensity = self.linearValues[7];
    self.skyState.mars.intensity = self.linearValues[8];
    self.skyState.jupiter.intensity = self.linearValues[9];
    self.skyState.saturn.intensity = self.linearValues[10];

    //Check if we need to update our final state again
    if(relativeT >= FIVE_MINUTES){
      self.updateFinalSkyState(0.0, FIVE_MINUTES, self.finalLSRT, self.finalStateFloat32Array[0]);
      self.finalLSRT = self.finalStateFloat32Array[0];
      self.lastUpdateT = t;
    }
  }

  //Prepare our WASM Modules
  this.skyStateWebWorker = new Worker("../src/cpp/sky-state-controller/starry-sky-web-worker.js", { type: "module" });
  this.webAssemblyWorker.addEventListener('message', function(e){
    let postObject = e.data;
    if(postObject.eventType === this.EVENT_RETURN_LATEST){
      //Attach our 32 bit float array buffers back to this thread again
      self.transferrableFinalStateBuffer = postObject.transferrableFinalStateBuffer;
      let finalStateFloat32Array = new Float32Array(transferrableFinalStateBuffer);
    }
    else if(postObject.eventType === this.EVENT_INITIALIZATION_RESPONSE){
      //Attach our 32 bit float array buffers back to this thread again
      transferrableInitialStateBuffer = postObject.transferrableInitialStateBuffer;
      self.transferrableFinalStateBuffer = postObject.transferrableFinalStateBuffer;
      let initialStateFloat32Array = new Float32Array(transferrableInitialStateBuffer);

      //Prepare the heap memory for our interpolation engine
      self.astroPositions_0_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(1, 1 + NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astroPositions_f_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(1, 1 + NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.rotatedAstroPositions_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      self.linearValues_0_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(1 + NUMBER_OF_ROTATIONAL_TRANSFORMATIONS, NUMBER_OF_FLOATS), self.linearValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.linearValues_f_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(1 + NUMBER_OF_ROTATIONAL_TRANSFORMATIONS, NUMBER_OF_FLOATS), self.linearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.linearValues_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);

      //Attach references to our interpolated values
      self.rotatedAstroPositions = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroPositions_ptr, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS);
      self.linearValues = new Float32Array(Module.HEAPF32.buffer, self.linearValues_ptr, NUMBER_OF_LINEAR_INTERPOLATIONS);

      //Run our sky interpolator to determine our azimuth, altitude and other variables
      let latitude = assetManager.data.skyLocationData.latitude;
      Module._initialize(latitude, self.astroPositions_0_ptr, self.rotatedAstroPositions_ptr, self.linearValues_0_ptr, self.linearValues_ptr);
      Module._updateFinalValues(this.astroPositions_f_ptr, this.linearValues_f_ptr);
      self.finalLSRT = self.finalStateFloat32Array[0];
      Module._updateTimeData(0.0, FIVE_MINUTES, initialStateFloat32Array[0], self.finalLSRT);
      self.skyState = {
        sun: {},
        moon: {},
        mercury: {},
        venus: {},
        mars: {},
        jupiter: {},
        saturn: {}
      };
      self.tick(0.0);

      //Return the final state back to the worker thread so it can determine the state five minutes from now
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_UPDATE_LATEST,
        transferrableFinalStateBuffer: self.transferrableFinalStateBuffer
      }, [self.transferrableFinalStateBuffer]);

      //Proceed to renderer setup
      self.initializeRenderers(self.assetManager);
    }
    return false;
  });
  Module['onRuntimeInitialized'] = function(){
    self.skyDirectorWASMIsReady = true;
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_INITIALIZE,
      latitude: self.latitude,
      longitude: self.longitude,
      date: self.date,
      timeMultiplier: self.timeMultiplier,
      utcOffset: self.utcOffset,
      transferrableInitialStateBuffer: transferrableInitialStateBuffer,
      transferrableFinalStateBuffer: this.transferrableFinalStateBuffer
    }, [transferrableInitialStateBuffer, this.transferrableFinalStateBuffer]);
  };
  this.renderers = {};

  this.start = function(){
    //Update our tick and tock functions
    parentComponent.tick = function(){
      //Run our interpolation engine
      self.tick();

      //Update all of our renderers
      self.renderers.atmosphereRenderer.tick();
    }
    parentComponent.initialized = true;
  }

  window.addEventListener('DOMContentLoaded', function(){
    //Grab all of our assets
    self.assetManager = new StarrySky.AssetManager(self);
  });
}
