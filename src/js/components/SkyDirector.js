StarrySky.SkyDirector = function(parentComponent){
  this.skyDirectorWASMIsReady = false;
  this.skyInterpolatorWASMIsReady = false;
  this.assetManagerInitialized = false;
  this.skyState;
  this.EVENT_INITIALIZE = 0;
  this.EVENT_INITIALIZATION_RESPONSE = 1;
  this.EVENT_UPDATE_LATEST = 2;
  this.EVENT_RETURN_LATEST = 3;
  //7 Astronomical RAs and Decs (14), 7(21) brightnesses, Lunar Parallactic Angle(22)
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
  const TOTAL_BYTES_FOR_WORKER_BUFFERS = BYTES_PER_32_BIT_FLOAT * NUMBER_OF_FLOATS;
  const TWENTY_MINUTES = 20.0 * 60.0;
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
  this.speed;
  this.interpolationT = 0.0;
  this.finalT = TWENTY_MINUTES;
  this.ready = false;
  this.parentComponent = parentComponent;
  this.renderer = parentComponent.el.sceneEl.renderer;
  this.scene = parentComponent.el.sceneEl.object3D;
  this.assetManager;
  this.LUTLibraries;
  this.renderers;
  this.interpolator = null;
  this.camera;
  this.atmosphereLUTLibrary;

  //Set up our web assembly hooks
  let self = this;

  //Called from the asset manager when all of our assets have finished loading
  //Also colled when our local web assembly has finished loading as both are pre-requisites
  //for running the responses produced by our web worker
  this.initializeSkyDirectorWebWorker = function(){
    //Attach our asset manager if it has been passed over
    if(self.assetManagerInitialized && self.skyInterpolatorWASMIsReady){
      //Post our message to the web worker to get the initial state of our sky
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_INITIALIZE,
        latitude: self.assetManager.data.skyLocationData.latitude,
        longitude: self.assetManager.data.skyLocationData.longitude,
        date: self.assetManager.data.skyTimeData.date,
        utcOffset: self.assetManager.data.skyTimeData.utcOffset,
        transferrableInitialStateBuffer: transferrableInitialStateBuffer,
        transferrableFinalStateBuffer: self.transferrableFinalStateBuffer
      }, [transferrableInitialStateBuffer, self.transferrableFinalStateBuffer]);

      //Initialize our LUTs
      self.atmosphereLUTLibrary = new StarrySky.LUTlibraries.AtmosphericLUTLibrary(self.assetManager.data, self.renderer, self.scene);
    }
  }

  this.initializeRenderers = function(){
    //All systems must be up and running before we are ready to begin
    if(self.assetManagerInitialized && self.skyDirectorWASMIsReady){
      //Prepare all of our renderers to display stuff
      self.speed = self.assetManager.data.skyTimeData.speed;
      self.renderers.atmosphereRenderer = new StarrySky.Renderers.AtmosphereRenderer(self);
      self.renderers.bloomRenderer = new StarrySky.Renderers.BloomRenderer(self, 'shared', 4.0);
      self.renderers.sunRenderer = new StarrySky.Renderers.SunRenderer(self);
      self.renderers.moonRenderer = new StarrySky.Renderers.MoonRenderer(self);

      self.start();
    }
  }

  this.updateFinalSkyState = function(lsrt_0, lsrt_f){
    //Update the Module Heap and final LSRT
    let intitialLSRT = self.finalLSRT;
    //let strtingPtr2 = self.astroPositions_f_ptr;
    let insertIndex = self.astroPositions_0_ptr / BYTES_PER_32_BIT_FLOAT;
    let copyFromIndex = self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT;
    let copyEndIndex = copyFromIndex + NUMBER_OF_ROTATIONAL_TRANSFORMATIONS;
    Module.HEAPF32.copyWithin(insertIndex, copyFromIndex, copyEndIndex);
    insertIndex = self.linearValues_0_ptr / BYTES_PER_32_BIT_FLOAT;
    copyFromIndex = self.linearValues_f_ptr / BYTES_PER_32_BIT_FLOAT;
    copyEndIndex = copyFromIndex + NUMBER_OF_LINEAR_INTERPOLATIONS;
    Module.HEAPF32.copyWithin(insertIndex, copyFromIndex, copyEndIndex);
    self.finalLSRT = self.finalStateFloat32Array[14];
    Module.HEAPF32.set(self.finalStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT);
    Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, NUMBER_OF_LINEAR_INTERPOLATIONS), self.linearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);

    //Set initial values to final values in module and update our final values to the values
    //returned from our worker.
    Module._updateFinalValues(self.astroPositions_f_ptr, self.linearValues_f_ptr);
    self.finalT = self.interpolationT + TWENTY_MINUTES;
    Module._updateTimeData(self.interpolationT, self.finalT, lsrt_0, self.finalLSRT);

    //Return the final state back to the worker thread so it can determine the state five minutes from now
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_UPDATE_LATEST,
      transferrableFinalStateBuffer: self.transferrableFinalStateBuffer
    }, [self.transferrableFinalStateBuffer]);
  }

  this.i = 0;

  this.tick = function(time, timeDelta){
    if(parentComponent.initialized){
      self.interpolationT += timeDelta * self.speed * 0.001;

      //Update our sky state
      Module._tick(self.interpolationT);

      //Update our astronomical positions
      self.skyState.sun.position.fromArray(self.rotatedAstroPositions.slice(0, 3));
      self.skyState.moon.position.fromArray(self.rotatedAstroPositions.slice(3, 6));
      self.skyState.mercury.position.fromArray(self.rotatedAstroPositions.slice(9, 12));
      self.skyState.venus.position.fromArray(self.rotatedAstroPositions.slice(12, 15));
      self.skyState.jupiter.position.fromArray(self.rotatedAstroPositions.slice(15, 18));
      self.skyState.saturn.position.fromArray(self.rotatedAstroPositions.slice(18, 21));

      //Update our linear values
      self.skyState.sun.intensity = self.linearValues[0];
      self.skyState.sun.horizonFade = Math.min(Math.max(1.7 * self.skyState.sun.position.y + 1.1, 0.0), 1.0);
      self.skyState.sun.scale = self.linearValues[1];
      self.skyState.moon.intensity = self.linearValues[2];
      self.skyState.moon.horizonFade = Math.min(Math.max(1.7 * self.skyState.moon.position.y + 1.1, 0.0), 1.0);
      self.skyState.moon.scale = self.linearValues[3];
      self.skyState.moon.parallacticAngle = self.linearValues[4];
      self.skyState.moon.earthshineIntensity = self.linearValues[5];
      self.skyState.mercury.intensity = self.linearValues[6];
      self.skyState.venus.intensity = self.linearValues[7];
      self.skyState.mars.intensity = self.linearValues[8];
      self.skyState.jupiter.intensity = self.linearValues[9];
      self.skyState.saturn.intensity = self.linearValues[10];

      //Check if we need to update our final state again
      if(self.interpolationT >= self.finalT){
        self.updateFinalSkyState(self.finalLSRT, self.finalStateFloat32Array[14]);
      }
    }
  }

  //Prepare our WASM Modules
  this.webAssemblyWorker = new Worker("../src/cpp/state-engine/starry-sky-web-worker.js");
  this.webAssemblyWorker.addEventListener('message', function(e){
    let postObject = e.data;
    if(postObject.eventType === self.EVENT_RETURN_LATEST){
      //Attach our 32 bit float array buffers back to this thread again
      self.transferrableFinalStateBuffer = postObject.transferrableFinalStateBuffer;
      self.finalStateFloat32Array = new Float32Array(self.transferrableFinalStateBuffer);
    }
    else if(postObject.eventType === self.EVENT_INITIALIZATION_RESPONSE){
      //Attach our 32 bit float array buffers back to this thread again
      transferrableInitialStateBuffer = postObject.transferrableInitialStateBuffer;
      self.transferrableFinalStateBuffer = postObject.transferrableFinalStateBuffer;
      self.finalStateFloat32Array = new Float32Array(self.transferrableFinalStateBuffer);
      let initialStateFloat32Array = new Float32Array(transferrableInitialStateBuffer);

      //Prepare the heap memory for our interpolation engine
      self.astroPositions_0_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astroPositions_f_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.rotatedAstroPositions_ptr = Module._malloc(NUMBER_OF_ROTATION_OUTPUT_VALUES * BYTES_PER_32_BIT_FLOAT);

      self.linearValues_0_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(LINEAR_ARRAY_START, NUMBER_OF_LINEAR_INTERPOLATIONS), self.linearValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.linearValues_f_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, NUMBER_OF_LINEAR_INTERPOLATIONS), self.linearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.linearValues_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);

      //Attach references to our interpolated values
      self.rotatedAstroPositions = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroPositions_ptr, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS);
      self.linearValues = new Float32Array(Module.HEAPF32.buffer, self.linearValues_ptr, NUMBER_OF_LINEAR_INTERPOLATIONS);

      //Run our sky interpolator to determine our azimuth, altitude and other variables
      let latitude = self.assetManager.data.skyLocationData.latitude;
      Module._initialize(latitude, self.astroPositions_0_ptr, self.rotatedAstroPositions_ptr, self.linearValues_0_ptr, self.linearValues_ptr);
      Module._updateFinalValues(self.astroPositions_f_ptr, self.linearValues_f_ptr);
      self.finalLSRT = self.finalStateFloat32Array[14];
      Module._updateTimeData(self.interpolationT, self.interpolationT + TWENTY_MINUTES, initialStateFloat32Array[14], self.finalLSRT);
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
  this.renderers = {};

  this.start = function(){
    //Attach our camera, which should be loaded by now.
    self.camera = self.parentComponent.el.sceneEl.camera;

    //Update our tick and tock functions
    parentComponent.tick = function(time, timeDelta){
      //Run our interpolation engine
      self.tick(time, timeDelta);

      //Update all of our renderers
      self.renderers.atmosphereRenderer.firstTick();
      self.renderers.sunRenderer.firstTick();
    }
    parentComponent.initialized = true;
  }

  window.addEventListener('DOMContentLoaded', function(){
    //Grab all of our assets
    self.assetManager = new StarrySky.AssetManager(self);
  });

  function onRuntimeInitialized() {
      self.skyInterpolatorWASMIsReady = true;
      self.initializeSkyDirectorWebWorker();
  }
  Module['onRuntimeInitialized'] = onRuntimeInitialized;
}
