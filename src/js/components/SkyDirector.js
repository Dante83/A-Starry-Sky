StarrySky.SkyDirector = function(parentComponent){
  this.skyDirectorWASMIsReady = false;
  this.skyInterpolatorWASMIsReady = false;
  this.assetManagerInitialized = false;
  this.skyState;
  this.EVENT_INITIALIZE_SKY_STATE = 0;
  this.EVENT_INITIALIZATION_SKY_STATE_RESPONSE = 1;
  this.EVENT_UPDATE_LATEST_SKY_STATE = 2;
  this.EVENT_RETURN_LATEST_SKY_STATE = 3;
  this.EVENT_INITIALIZE_AUTOEXPOSURE = 4;
  this.EVENT_INITIALIZATION_AUTOEXPOSURE_RESPONSE = 5;
  this.EVENT_UPDATE_AUTOEXPOSURE = 6;
  this.EVENT_RETURN_AUTOEXPOSURE = 7;
  //7 Astronomical RAs and Decs (14), 7(21) brightnesses, Lunar Parallactic Angle(22)
  //Earthshine Intensity(23), Solar and Lunar Scale Multiplier(25) or 25 variables
  //14 of these require rotational transformations
  //10 are linear interpolations
  //1 (LSRT) is a rotational interpolation
  const RADIUS_OF_SKY = 5000.0;
  const BYTES_PER_32_BIT_FLOAT = 4;
  const NUMBER_OF_FLOATS = 25;
  const NUMBER_OF_ROTATIONAL_OBJECTS = 7;
  const NUMBER_OF_HORIZON_FADES = 2;
  const NUMBER_OF_PARALLACTIC_ANGLES = 1;
  const NUMBER_OF_ROTATIONAL_TRANSFORMATIONS = NUMBER_OF_ROTATIONAL_OBJECTS * 2;
  const NUMBER_OF_ROTATION_OUTPUT_VALUES = NUMBER_OF_ROTATIONAL_OBJECTS * 3;
  const NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES = NUMBER_OF_HORIZON_FADES + NUMBER_OF_PARALLACTIC_ANGLES;
  const NUMBER_OF_LINEAR_INTERPOLATIONS = 11;
  const LINEAR_ARRAY_START = NUMBER_OF_ROTATIONAL_TRANSFORMATIONS + 1;
  const TOTAL_BYTES_FOR_WORKER_BUFFERS = BYTES_PER_32_BIT_FLOAT * NUMBER_OF_FLOATS;
  const ONE_MINUTE = 60.0;
  const TWO_SECONDS = 2.0;
  const TWENTY_MINUTES = 20.0 * ONE_MINUTE;
  let transferrableInitialStateBuffer = new ArrayBuffer(TOTAL_BYTES_FOR_WORKER_BUFFERS);
  this.transferrableFinalStateBuffer = new ArrayBuffer(TOTAL_BYTES_FOR_WORKER_BUFFERS);
  this.finalStateFloat32Array = new Float32Array(this.transferrableFinalStateBuffer);
  this.astroPositions_0_ptr;
  this.astroPositions_f_ptr;
  this.rotatedAstroPositions_ptr;
  this.rotatedAstroPositions;
  this.astronomicalLinearValues_0_ptr;
  this.astronomicalLinearValues_f_ptr;
  this.astronomicalLinearValues_ptr;
  this.astronomicalLinearValues;
  this.lightingLinearValues_0_ptr;
  this.lightingLinearValues_f_ptr;
  this.lightingLinearValues_ptr;
  this.lightingLinearValues;
  this.rotatedAstroDependentValues;
  this.finalLSRT;
  this.speed;
  this.interpolationT = 0.0;
  this.finalT = TWENTY_MINUTES;
  this.updateExposureT = ONE_MINUTE;
  this.ready = false;
  this.parentComponent = parentComponent;
  this.renderer = parentComponent.el.sceneEl.renderer;
  this.scene = parentComponent.el.sceneEl.object3D;
  this.assetManager;
  this.LUTLibraries;
  this.renderers;
  this.interpolator = null;
  this.camera;
  this.pixelsPerRadian;
  this.atmosphereLUTLibrary;
  this.stellarLUTLibrary;
  this.moonAndSunRendererSize;
  this.exposureVariables = {
    sunPosition: new THREE.Vector3(),
    moonPosition: new THREE.Vector3(),
    sunHorizonFade: 0.0,
    moonHorizonFade: 0.0,
  }

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
        eventType: self.EVENT_INITIALIZE_SKY_STATE,
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
      //Attach our camera, which should be loaded by now.
      const DEG_2_RAD = Math.PI / 180.0;
      self.camera = self.parentComponent.el.sceneEl.camera;
      self.pixelsPerRadian = screen.width / (this.camera.fov * DEG_2_RAD);

      //Determine the best texture size for our renderers
      const sunAngularDiameterInRadians = self.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD;
      const sunRendererTextureSize = Math.floor(self.pixelsPerRadian * sunAngularDiameterInRadians * 2.0);
      //Floor and ceiling to nearest power of 2, Page 61 of Hacker's Delight
      const ceilSRTS = Math.min(parseInt(1 << (32 - Math.clz32(sunRendererTextureSize - 1), 10)), 1024);
      const floorSRTS = ceilSRTS >> 1; //Divide by 2! Without the risk of floating point errors
      const SRTSToNearestPowerOfTwo = Math.abs(sunRendererTextureSize - floorSRTS) <= Math.abs(sunRendererTextureSize - ceilSRTS) ? floorSRTS : ceilSRTS;

      const moonAngularDiameterInRadians = self.assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD;
      const moonRendererTextureSize = Math.floor(self.pixelsPerRadian * moonAngularDiameterInRadians * 2.0);
      //Floor and ceiling to nearest power of 2, Page 61 of Hacker's Delight
      const ceilMRTS = Math.min(parseInt(1 << (32 - Math.clz32(moonRendererTextureSize - 1), 10)), 1024);
      const floorMRTS = ceilMRTS >> 1; //Divide by 2! Without the risk of floating point errors
      const MRTSToNearestPowerOfTwo = Math.abs(moonRendererTextureSize - floorMRTS) <= Math.abs(moonRendererTextureSize - ceilMRTS) ? floorMRTS : ceilMRTS;

      if(SRTSToNearestPowerOfTwo !== MRTSToNearestPowerOfTwo){
        console.warn("The moon and sun should be a similiar angular diameters to avoid unwanted texture artifacts.");
      }

      //Choose the bigger of the two textures
      self.moonAndSunRendererSize = Math.max(SRTSToNearestPowerOfTwo, MRTSToNearestPowerOfTwo);

      //Prepare all of our renderers to display stuff
      self.speed = self.assetManager.data.skyTimeData.speed;
      self.renderers.atmosphereRenderer = new StarrySky.Renderers.AtmosphereRenderer(self);
      self.renderers.bloomRenderer = new StarrySky.Renderers.BloomRenderer(self, 'shared', 4.0);
      self.renderers.sunRenderer = new StarrySky.Renderers.SunRenderer(self);
      self.renderers.moonRenderer = new StarrySky.Renderers.MoonRenderer(self);
      self.renderers.meteringSurveyRenderer = new StarrySky.Renderers.MeteringSurveyRenderer(self);

      //Now set up our auto-exposure system
      self.initializeAutoExposure();

      //Run the animation as we wait for the exposure, hopefully the default will work well enough
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
    insertIndex = self.astronomicalLinearValues_0_ptr / BYTES_PER_32_BIT_FLOAT;
    copyFromIndex = self.astronomicalLinearValues_f_ptr / BYTES_PER_32_BIT_FLOAT;
    copyEndIndex = copyFromIndex + NUMBER_OF_LINEAR_INTERPOLATIONS;
    Module.HEAPF32.copyWithin(insertIndex, copyFromIndex, copyEndIndex);
    self.finalLSRT = self.finalStateFloat32Array[14];
    Module.HEAPF32.set(self.finalStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT);
    Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, NUMBER_OF_LINEAR_INTERPOLATIONS), self.astronomicalLinearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);

    //Set initial values to final values in module and update our final values to the values
    //returned from our worker.
    Module._updateFinalAstronomicalValues(self.astroPositions_f_ptr, self.astronomicalLinearValues_f_ptr);
    self.finalT = self.interpolationT + TWENTY_MINUTES;
    Module._updateAstronomicalTimeData(self.interpolationT, self.finalT, lsrt_0, self.finalLSRT);

    //Return the final state back to the worker thread so it can determine the state five minutes from now
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_UPDATE_LATEST_SKY_STATE,
      transferrableFinalStateBuffer: self.transferrableFinalStateBuffer
    }, [self.transferrableFinalStateBuffer]);
  }

  this.i = 0;

  this.tick = function(time, timeDelta){
    if(parentComponent.initialized){
      self.interpolationT += timeDelta * self.speed * 0.001;

      //Update our sky state
      self.skyState.LSRT = Module._tick(self.interpolationT);

      //Update our astronomical positions
      self.skyState.sun.position.fromArray(self.rotatedAstroPositions.slice(0, 3));
      let sp = self.skyState.sun.position;
      self.skyState.sun.quadOffset.set(-sp.z, sp.y, -sp.x).normalize().multiplyScalar(RADIUS_OF_SKY);
      self.skyState.moon.position.fromArray(self.rotatedAstroPositions.slice(3, 6));
      let mp = self.skyState.moon.position;
      self.skyState.moon.quadOffset.set(-mp.z, mp.y, -mp.x).normalize().multiplyScalar(RADIUS_OF_SKY);
      self.skyState.moon.parallacticAngle = self.rotatedAstroDependentValues[2];
      self.skyState.mercury.position.fromArray(self.rotatedAstroPositions.slice(9, 12));
      self.skyState.venus.position.fromArray(self.rotatedAstroPositions.slice(12, 15));
      self.skyState.jupiter.position.fromArray(self.rotatedAstroPositions.slice(15, 18));
      self.skyState.saturn.position.fromArray(self.rotatedAstroPositions.slice(18, 21));

      //Update our linear values
      self.skyState.sun.intensity = self.astronomicalLinearValues[0];
      self.skyState.sun.horizonFade = self.rotatedAstroDependentValues[0];
      self.skyState.sun.scale = self.astronomicalLinearValues[1];
      self.skyState.moon.intensity = self.astronomicalLinearValues[2];
      self.skyState.moon.horizonFade = self.rotatedAstroDependentValues[1];
      self.skyState.moon.scale = self.astronomicalLinearValues[3];
      self.skyState.moon.earthshineIntensity = self.astronomicalLinearValues[5];
      self.skyState.mercury.intensity = self.astronomicalLinearValues[6];
      self.skyState.venus.intensity = self.astronomicalLinearValues[7];
      self.skyState.mars.intensity = self.astronomicalLinearValues[8];
      self.skyState.jupiter.intensity = self.astronomicalLinearValues[9];
      self.skyState.saturn.intensity = self.astronomicalLinearValues[10];

      //Check if we need to update our final state again
      if(self.interpolationT >= self.finalT){
        self.updateFinalSkyState(self.finalLSRT, self.finalStateFloat32Array[14]);
      }

      //Check if we need to update our auto-exposure final state again
    }
  }

  //Prepare our WASM Modules
  this.webAssemblyWorker = new Worker("../src/cpp/state-engine/starry-sky-web-worker.js");
  this.webAssemblyWorker.addEventListener('message', function(e){
    let postObject = e.data;
    if(postObject.eventType === self.EVENT_RETURN_LATEST_SKY_STATE){
      //Attach our 32 bit float array buffers back to this thread again
      self.transferrableFinalStateBuffer = postObject.transferrableFinalStateBuffer;
      self.finalStateFloat32Array = new Float32Array(self.transferrableFinalStateBuffer);
    }
    else if(postObject.eventType === self.EVENT_INITIALIZATION_SKY_STATE_RESPONSE){
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
      self.rotatedAstroDepedentValues_ptr = Module._malloc(NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES * BYTES_PER_32_BIT_FLOAT);

      self.astronomicalLinearValues_0_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(LINEAR_ARRAY_START, NUMBER_OF_LINEAR_INTERPOLATIONS), self.astronomicalLinearValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astronomicalLinearValues_f_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, NUMBER_OF_LINEAR_INTERPOLATIONS), self.astronomicalLinearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astronomicalLinearValues_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);

      //Attach references to our interpolated values
      self.rotatedAstroPositions = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroPositions_ptr, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS);
      self.astronomicalLinearValues = new Float32Array(Module.HEAPF32.buffer, self.astronomicalLinearValues_ptr, NUMBER_OF_LINEAR_INTERPOLATIONS);
      self.rotatedAstroDependentValues = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroDepedentValues_ptr, NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES);

      //Run our sky interpolator to determine our azimuth, altitude and other variables
      let latitude = self.assetManager.data.skyLocationData.latitude;
      Module._initializeAstromicalValues(latitude, self.astroPositions_0_ptr, self.rotatedAstroPositions_ptr, self.astronomicalLinearValues_0_ptr, self.astronomicalLinearValues_ptr, self.rotatedAstroDepedentValues_ptr);
      Module._updateFinalAstronomicalValues(self.astroPositions_f_ptr, self.astronomicalLinearValues_f_ptr);
      self.finalLSRT = self.finalStateFloat32Array[14];
      Module._updateAstronomicalTimeData(self.interpolationT, self.interpolationT + TWENTY_MINUTES, initialStateFloat32Array[14], self.finalLSRT);
      self.skyState = {
        sun: {
          position: new THREE.Vector3(),
          quadOffset: new THREE.Vector3()
        },
        moon: {
          position: new THREE.Vector3(),
          quadOffset: new THREE.Vector3(),
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
        eventType: self.EVENT_UPDATE_LATEST_SKY_STATE,
        transferrableFinalStateBuffer: self.transferrableFinalStateBuffer
      }, [self.transferrableFinalStateBuffer]);

      //Proceed to renderer setup
      self.skyDirectorWASMIsReady = true;
      self.initializeRenderers();
    }
    else if(postObject.eventType === this.EVENT_INITIALIZATION_AUTOEXPOSURE_RESPONSE){
      //Once we get back the results, send these off to our linear interpolator

    }
    else if(postObject.eventType === this.EVENT_RETURN_AUTOEXPOSURE){
      //Once I get back this result shift our linear interpolator again

    }

    return false;
  });

  this.initializeAutoExposure = async function(){
      //Get the initial position of our sun and moon
      //and pass them into our metering survey
      Module._setSunAndMoonTimeTo(0.0);
      self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
      self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
      self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
      self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
      self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);
      const meteringSurveyBuffer1 = self.renderers.meteringSurveyRenderer.meteringSurveyData.slice(0);

      //Get our position for the sun and moon 2 seconds from now
      Module._setSunAndMoonTimeTo(TWO_SECONDS);
      self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
      self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
      self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
      self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
      self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);

      //Pass this information to our web worker to get our exposure value
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_INITIALIZE_AUTOEXPOSURE,
        meteringSurveyTextureSize: self.renderers.meteringSurveyRenderer.meteringSurveyTextureSize,
        meteringSurveyBuffer0: meteringSurveyBuffer1,
        meteringSurveyBufferf: self.renderers.meteringSurveyRenderer.meteringSurveyData
      }, [meteringSurveyBuffer1, self.renderers.meteringSurveyRenderer.meteringSurveyData]);
  }

  this.updateAutoExposure = async function(now){
    Module._setSunAndMoonTimeTo(now + TWO_SECONDS);
    self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
    self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
    self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
    self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
    self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);

    //Pass this information to our web worker to get our exposure value
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_INITIALIZE_AUTOEXPOSURE,
      meteringSurveyBufferf: self.renderers.meteringSurveyRenderer.meteringSurveyData
    }, [meteringSurveyBuffer1, self.renderers.meteringSurveyRenderer.meteringSurveyData]);
  }

  this.renderers = {};

  this.start = function(){
    //Update our tick and tock functions
    parentComponent.tick = function(time, timeDelta){
      //Run our interpolation engine
      self.tick(time, timeDelta);

      //Update all of our renderers
      self.renderers.atmosphereRenderer.firstTick();
      self.renderers.sunRenderer.firstTick();
      self.renderers.moonRenderer.firstTick();
      self.setupNextTick();
    }
    parentComponent.initialized = true;
  }

  this.setupNextTick = function(){
    parentComponent.tick = function(time, timeDelta){
      //Run our interpolation engine
      self.tick(time, timeDelta);

      //Update all of our renderers
      self.renderers.atmosphereRenderer.tick(time);
      self.renderers.sunRenderer.tick(time);
      self.renderers.moonRenderer.tick(time);
    }
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
