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
  //7 Astronomical RAs and HAs (14), 7(21) brightnesses, Lunar Parallactic Angle(22)
  //Earthshine Intensity(23), Solar and Lunar Scale Multiplier(25) or 25 variables
  //14 of these require rotational transformations
  //10 are linear interpolations
  //1 (LSRT) is a rotational interpolation
  const BYTES_PER_32_BIT_FLOAT = 4;
  const NUMBER_OF_FLOATS = 25;
  const NUMBER_OF_ROTATIONAL_OBJECTS = 7;
  const NUMBER_OF_ROTATIONAL_TRANSFORMATIONS = NUMBER_OF_ROTATIONAL_OBJECTS * 2;
  const NUMBER_OF_ROTATION_OUTPUT_VALUES = NUMBER_OF_ROTATIONAL_OBJECTS * 3;
  const NUMBER_OF_LINEAR_INTERPOLATIONS = 11;
  const LINEAR_ARRAY_START = NUMBER_OF_ROTATIONAL_TRANSFORMATIONS + 1;
  const LINEAR_ARRAY_END = LINEAR_ARRAY_START + NUMBER_OF_LINEAR_INTERPOLATIONS;
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
  this.timeMultiplier;
  this.interpolationT = 0.0;
  this.parentComponent = parentComponent;
  this.renderer = parentComponent.el.sceneEl.renderer;
  this.scene = parentComponent.el.sceneEl.object3D;
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
    if(self.skyDirectorWASMIsReady  && self.assetManagerInitialized){
      //Prepare all of our renderers to display stuff
      self.timeMultiplier = self.assetManager.data.skyTimeData.timeMultiplier;
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

  this.tick = function(time, timeDelta){
    self.interpolationT += timeDelta * self.timeMultiplier;

    //Update our sky state
    Module._tick(timeAcceleratedT);

    //Update our astronomical positions
    self.skyState.sun.position.fromArray(self.rotatedAstroPositions.slice(0, 3));
    self.skyState.moon.position.fromArray(self.rotatedAstroPositions.slice(3, 6));
    self.skyState.mercury.position.fromArray(self.rotatedAstroPositions.slice(9, 12));
    self.skyState.venus.position.fromArray(self.rotatedAstroPositions.slice(12, 15));
    self.skyState.jupiter.position.fromArray(self.rotatedAstroPositions.slice(15, 18));
    self.skyState.saturn.position.fromArray(self.rotatedAstroPositions.slice(18, 21));

    //Update our linear values
    self.skyState.sun.intensity = self.linearValues[0];
    self.skyState.sun.scale = self.linearValues[1];
    self.skyState.moon.intensity = self.linearValues[2];
    self.skyState.moon.scale = self.linearValues[3];
    self.skyState.moon.parallacticAngle = self.linearValues[4];
    self.skyState.moon.earthshineIntensity = self.linearValues[5];
    self.skyState.mercury.intensity = self.linearValues[6];
    self.skyState.venus.intensity = self.linearValues[7];
    self.skyState.mars.intensity = self.linearValues[8];
    self.skyState.jupiter.intensity = self.linearValues[9];
    self.skyState.saturn.intensity = self.linearValues[10];

    //Check if we need to update our final state again
    if(self.interpolationT >= FIVE_MINUTES){
      self.updateFinalSkyState(0.0, FIVE_MINUTES, self.finalLSRT, self.finalStateFloat32Array[0]);
      self.finalLSRT = self.finalStateFloat32Array[0];
      self.interpolationT = self.interpolationT - FIVE_MINUTES;
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
      Module.HEAPF32.set(initialStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astroPositions_f_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.rotatedAstroPositions_ptr = Module._malloc(NUMBER_OF_ROTATION_OUTPUT_VALUES * BYTES_PER_32_BIT_FLOAT);

      self.linearValues_0_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(LINEAR_ARRAY_START, NUMBER_OF_LINEAR_VALUES), self.linearValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.linearValues_f_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, NUMBER_OF_LINEAR_VALUES), self.linearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.linearValues_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);

      //Attach references to our interpolated values
      self.rotatedAstroPositions = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroPositions_ptr, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS);
      self.linearValues = new Float32Array(Module.HEAPF32.buffer, self.linearValues_ptr, NUMBER_OF_LINEAR_INTERPOLATIONS);

      //Run our sky interpolator to determine our azimuth, altitude and other variables
      let latitude = assetManager.data.skyLocationData.latitude;
      Module._initialize(latitude, self.astroPositions_0_ptr, self.rotatedAstroPositions_ptr, self.linearValues_0_ptr, self.linearValues_ptr);
      Module._updateFinalValues(this.astroPositions_f_ptr, this.linearValues_f_ptr);
      self.finalLSRT = self.finalStateFloat32Array[14];
      Module._updateTimeData(0.0, FIVE_MINUTES, initialStateFloat32Array[14], self.finalLSRT);
      self.skyState = {
        sun: {
          position: new THREE.Vector3()
        },
        moon: {
          position: new THREE.Vector3()
        },
        mercury: {
          position: new THREE.Vector3()
        },
        venus: {
          position: new THREE.Vector3()
        },
        mars: {
          position: new THREE.Vector3()
        },
        jupiter: {
          position: new THREE.Vector3()
        },
        saturn: {
          position: new THREE.Vector3()
        }
      };

      //Return the final state back to the worker thread so it can determine the state five minutes from now
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_UPDATE_LATEST,
        transferrableFinalStateBuffer: self.transferrableFinalStateBuffer
      }, [self.transferrableFinalStateBuffer]);

      //Proceed to renderer setup
      self.skyDirectorWASMIsReady = true;
      self.initializeRenderers();
    }
    return false;
  });
  Module['onRuntimeInitialized'] = function(){
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
    parentComponent.tick = function(time, timeDelta){
      //Run our interpolation engine
      self.tick(time, timeDelta);

      //Update all of our renderers
      self.renderers.atmosphereRenderer.firstTick();
    }
    parentComponent.initialized = true;
  }

  window.addEventListener('DOMContentLoaded', function(){
    //Grab all of our assets
    self.assetManager = new StarrySky.AssetManager(self);
  });
}
