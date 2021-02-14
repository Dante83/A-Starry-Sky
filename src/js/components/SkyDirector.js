StarrySky.SkyDirector = function(parentComponent){
  this.skyDirectorWASMIsReady = false;
  this.skyInterpolatorWASMIsReady = false;
  this.assetManagerInitialized = false;
  this.lightingManager = false;
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
  const NUMBER_OF_FLOATS = 27;
  const NUMBER_OF_ROTATIONAL_OBJECTS = 7;
  const NUMBER_OF_HORIZON_FADES = 2;
  const NUMBER_OF_PARALLACTIC_ANGLES = 1;
  const NUMBER_OF_LUNAR_ECLIPSE_UNIFORMS = 8;
  const NUMBER_OF_ROTATIONAL_TRANSFORMATIONS = NUMBER_OF_ROTATIONAL_OBJECTS * 2;
  const NUMBER_OF_ROTATION_OUTPUT_VALUES = NUMBER_OF_ROTATIONAL_OBJECTS * 3;
  const START_OF_LUNAR_ECLIPSE_INDEX = NUMBER_OF_HORIZON_FADES + NUMBER_OF_PARALLACTIC_ANGLES;
  const NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES = NUMBER_OF_HORIZON_FADES + NUMBER_OF_PARALLACTIC_ANGLES + NUMBER_OF_LUNAR_ECLIPSE_UNIFORMS;
  const NUMBER_OF_LINEAR_INTERPOLATIONS = 12;
  const NUMBER_OF_LIGHTING_COLOR_CHANNELS = 25;
  const NUMBER_OF_LIGHTING_OUT_VALUES = 35;
  const LINEAR_ARRAY_START = NUMBER_OF_ROTATIONAL_TRANSFORMATIONS + 1;
  const LINEAR_ARRAY_END = LINEAR_ARRAY_START + NUMBER_OF_LINEAR_INTERPOLATIONS + 1;
  const COLOR_ARRAY_START = LINEAR_ARRAY_END + 1;
  const COLOR_ARRAY_END = COLOR_ARRAY_START + NUMBER_OF_LIGHTING_COLOR_CHANNELS + 1;
  const TOTAL_BYTES_FOR_WORKER_BUFFERS = BYTES_PER_32_BIT_FLOAT * NUMBER_OF_FLOATS;
  const ONE_MINUTE = 60.0;
  const HALF_A_SECOND = 0.5;
  const FOUR_SECONDS = 4.0;
  const TWENTY_MINUTES = 20.0 * ONE_MINUTE;
  const PI_OVER_TWO = Math.PI * 0.5;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  let transferableInitialStateBuffer = new ArrayBuffer(TOTAL_BYTES_FOR_WORKER_BUFFERS);
  this.transferableFinalStateBuffer = new ArrayBuffer(TOTAL_BYTES_FOR_WORKER_BUFFERS);
  this.finalStateFloat32Array = new Float32Array(this.transferableFinalStateBuffer);
  this.astroPositions_0_ptr;
  this.astroPositions_f_ptr;
  this.rotatedAstroPositions_ptr;
  this.rotatedAstroPositions;
  this.astronomicalLinearValues_0_ptr;
  this.astronomicalLinearValues_f_ptr;
  this.astronomicalLinearValues_ptr;
  this.astronomicalLinearValues;
  this.rotatedAstroDependentValues;
  this.lightingColorValues_0_ptr;
  this.lightingColorValues_f_ptr;
  this.lightingColorValues_ptr;
  this.finalLSRT;
  this.speed;
  this.interpolationT = 0.0;
  this.finalAstronomicalT = TWENTY_MINUTES;
  this.exposureT = 0.0;
  this.time = 0.0;
  this.interpolatedSkyIntensityMagnitude = 1.0;
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
  this.dominantLightIsSun0;
  this.dominantLightIsSunf;
  this.dominantLightY0;
  this.dominantLightYf;
  this.exposureVariables = {
    sunPosition: new THREE.Vector3(),
    moonPosition: new THREE.Vector3(),
    sunHorizonFade: 0.0,
    moonHorizonFade: 0.0,
    exposureCoefficient0: 0.0,
    starsExposure: 0.0,
    moonExposure: 0.0,
    exposureCoefficientf: 0.0,
  };
  let transferableIntialLightingFloat32Array;
  this.transferableSkyFinalLightingBuffer;
  this.transferableSkyFinalLightingFloat32Array;
  this.lightingColorBufferf;
  this.lightingColorArrayf;
  this.currentCameraLookAtTarget = new THREE.Vector3();
  this.previousCameraLookAtVector = new THREE.Vector3();
  this.clonedPreviousCameraLookAtVector = new THREE.Vector3();
  this.previousCameraHeight = 0.0;
  this.lookAtInterpolationQuaternion = new THREE.Quaternion();
  this.lookAtInterpolatedQuaternion = new THREE.Quaternion();
  this.randomBlueNoiseTexture = 0;
  this.sunRadius;
  this.moonRadius;
  this.distanceForSolarEclipse;

  //Set up our web assembly hooks
  let self = this;

  //Called from the asset manager when all of our assets have finished loading
  //Also colled when our local web assembly has finished loading as both are pre-requisites
  //for running the responses produced by our web worker
  this.initializeSkyDirectorWebWorker = function(){
    //Attach our asset manager if it has been passed over
    if(self.assetManagerInitialized && self.skyInterpolatorWASMIsReady){
      self.sunRadius = Math.sin(this.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5);
      self.moonRadius = Math.sin(this.assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5);
      self.distanceForSolarEclipse = 2.0 * Math.SQRT2 * Math.max(self.sunRadius, self.moonRadius);

      //Post our message to the web worker to get the initial state of our sky
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_INITIALIZE_SKY_STATE,
        latitude: self.assetManager.data.skyLocationData.latitude,
        longitude: self.assetManager.data.skyLocationData.longitude,
        date: self.assetManager.data.skyTimeData.date,
        utcOffset: self.assetManager.data.skyTimeData.utcOffset,
        transferableInitialStateBuffer: transferableInitialStateBuffer,
        transferableFinalStateBuffer: self.transferableFinalStateBuffer
      }, [transferableInitialStateBuffer, self.transferableFinalStateBuffer]);

      //Iitialize one of our key constants
      BASE_RADIUS_OF_SUN = self.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;

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
      self.previousCameraHeight = self.camera.position.y;
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
      self.renderers.bloomRenderer = new StarrySky.Renderers.BloomRenderer(self, 'shared', 0.98);
      self.renderers.sunRenderer = new StarrySky.Renderers.SunRenderer(self);
      self.renderers.moonRenderer = new StarrySky.Renderers.MoonRenderer(self);
      self.renderers.meteringSurveyRenderer = new StarrySky.Renderers.MeteringSurveyRenderer(self);

      //Now set up our auto-exposure system
      self.initializeAutoExposure();
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
    Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, LINEAR_ARRAY_END), self.astronomicalLinearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);

    //Set initial values to final values in module and update our final values to the values
    //returned from our worker.
    Module._updateFinalAstronomicalValues(self.astroPositions_f_ptr, self.astronomicalLinearValues_f_ptr);
    self.finalAstronomicalT = self.interpolationT + TWENTY_MINUTES;
    Module._updateAstronomicalTimeData(self.interpolationT, self.finalAstronomicalT, lsrt_0, self.finalLSRT);

    //Return the final state back to the worker thread so it can determine the state five minutes from now
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_UPDATE_LATEST_SKY_STATE,
      transferableFinalStateBuffer: self.transferableFinalStateBuffer
    }, [self.transferableFinalStateBuffer]);
  }

  this.i = 0;

  this.tick = function(time, timeDelta){
    if(parentComponent.initialized){
      const timeDeltaInSeconds = timeDelta * 0.001;
      self.exposureT += timeDeltaInSeconds;
      self.time = time * 0.001;
      self.interpolationT += timeDeltaInSeconds * self.speed;

      //Update our sky state
      self.skyState.LSRT = Module._tick_astronomicalInterpolations(self.interpolationT);

      //Update our astronomical positions
      self.skyState.sun.position.fromArray(self.rotatedAstroPositions.slice(0, 3));
      let sp = self.skyState.sun.position;
      self.skyState.sun.quadOffset.set(-sp.z, sp.y, -sp.x).normalize().multiplyScalar(RADIUS_OF_SKY);
      self.skyState.moon.position.fromArray(self.rotatedAstroPositions.slice(3, 6));
      let mp = self.skyState.moon.position;
      self.skyState.moon.quadOffset.set(-mp.z, mp.y, -mp.x).normalize().multiplyScalar(RADIUS_OF_SKY);
      self.skyState.moon.parallacticAngle = self.rotatedAstroDependentValues[2] - PI_OVER_TWO;
      self.skyState.mercury.position.fromArray(self.rotatedAstroPositions.slice(6, 9));
      self.skyState.venus.position.fromArray(self.rotatedAstroPositions.slice(9, 12));
      self.skyState.mars.position.fromArray(self.rotatedAstroPositions.slice(12, 15));
      self.skyState.jupiter.position.fromArray(self.rotatedAstroPositions.slice(15, 18));
      self.skyState.saturn.position.fromArray(self.rotatedAstroPositions.slice(18, 21));

      //Update our linear values
      self.skyState.sun.luminosity = 100000.0 * self.astronomicalLinearValues[0] / 1300.0;
      self.skyState.sun.intensity = 10.0 *  self.astronomicalLinearValues[0] / 1300.0;
      self.skyState.sun.horizonFade = self.rotatedAstroDependentValues[0];
      self.skyState.sun.scale = self.astronomicalLinearValues[1];
      self.skyState.moon.luminosity = 200.0 * self.astronomicalLinearValues[2];
      self.skyState.moon.intensity = 500.0 * self.astronomicalLinearValues[2];
      self.skyState.moon.horizonFade = self.rotatedAstroDependentValues[1];
      self.skyState.moon.scale = self.astronomicalLinearValues[3];
      self.skyState.moon.earthshineIntensity = self.astronomicalLinearValues[5];
      self.skyState.mercury.intensity = self.astronomicalLinearValues[6];
      self.skyState.venus.intensity = self.astronomicalLinearValues[7];
      self.skyState.mars.intensity = self.astronomicalLinearValues[8];
      self.skyState.jupiter.intensity = self.astronomicalLinearValues[9];
      self.skyState.saturn.intensity = self.astronomicalLinearValues[10];

      //Update values associated with lunar eclipses
      self.skyState.moon.distanceToEarthsShadowSquared = self.rotatedAstroDependentValues[START_OF_LUNAR_ECLIPSE_INDEX];
      self.skyState.moon.oneOverNormalizedLunarDiameter = self.rotatedAstroDependentValues[START_OF_LUNAR_ECLIPSE_INDEX + 1];
      self.skyState.moon.earthsShadowPosition.fromArray(self.rotatedAstroDependentValues.slice(START_OF_LUNAR_ECLIPSE_INDEX + 2, START_OF_LUNAR_ECLIPSE_INDEX + 5));
      self.skyState.moon.lightingModifier.fromArray(self.rotatedAstroDependentValues.slice(START_OF_LUNAR_ECLIPSE_INDEX + 5, START_OF_LUNAR_ECLIPSE_INDEX + 8));

      //Check if we need to update our final state again
      if(self.interpolationT >= self.finalAstronomicalT){
        self.updateFinalSkyState(self.finalLSRT, self.finalStateFloat32Array[14]);
      }

      //Interpolate our log average of the sky intensity
      Module._tick_lightingInterpolations(self.time);
      self.interpolatedSkyIntensityMagnitude = self.lightingColorValues[28];
      self.exposureVariables.starsExposure = Math.min(6.8 - self.interpolatedSkyIntensityMagnitude, 3.7);

      //Tick our light positions before we might just use them to set up the next interpolation
      self.lightingManager.tick(self.lightingColorValues);

      //Update our random blue noise texture
      self.randomBlueNoiseTexture = Math.floor(Math.random() * 4.9999);

      //Check if we need to update our auto-exposure final state again
      if(self.exposureT >= HALF_A_SECOND && self.transferableSkyFinalLightingBuffer.byteLength !== 0){
        self.exposureT = 0.0;
        //Our colors are normalized and the brightnesses pulled out of them
        //so we need to inject those values back in before updating all of our colors again
        Module._denormalizeSkyIntensity0();
        Module.HEAPF32.set(self.lightingColorValues.slice(0, NUMBER_OF_LIGHTING_COLOR_CHANNELS), self.lightingColorValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
        Module.HEAPF32.set(self.lightingColorArrayf.slice(0, NUMBER_OF_LIGHTING_COLOR_CHANNELS), self.lightingColorValues_f_ptr / BYTES_PER_32_BIT_FLOAT);

        //While we are still on this thread, we need to copy the previous look up vector before it
        //gets changed below, as the upcoming methods invoke async
        this.clonedPreviousCameraLookAtVector.copy(this.previousCameraLookAtVector);
        this.clonedPreviousCameraLookAtVector.normalize();

        //We should also save the last position for the sun to determine if the dominant light is the sun or not
        const sunRadiusf = Math.sin(self.renderers.sunRenderer.sunAngularRadiusInRadians * self.skyState.sun.scale);
        self.dominantLightIsSun0 = true;
        let dominantLightY0 = sp.y;
        if(self.skyState.sun.position.y < -sunRadiusf){
          self.dominantLightIsSun0 = false;
          dominantLightY0 = mp.y;
        }

        //Is this what they mean by dependency injection overload?
        //void updateLightingValues(float skyIntensity0, float skyIntensityf, bool dominantLightIsSun0,
        //bool dominantLightIsSunf, float dominantLightY0, float dominantLightf, float dominantLightIntensity0,
        //float dominantLightIntensityf, float* lightColors0, float* lightColorsf, float t_0, float t_f);
        Module._updateLightingValues(self.interpolatedSkyIntensityMagnitude, self.exposureVariables.exposureCoefficientf,
          self.dominantLightIsSun0, self.dominantLightIsSunf,
          dominantLightY0, self.dominantLightYf,
          self.lightingColorValues_ptr, self.lightingColorValues_f_ptr,
          self.time, self.time + HALF_A_SECOND);

        self.updateAutoExposure(timeDeltaInSeconds);

        //Set our previous lookup target
        const cameraLookAtTarget = new THREE.Vector3(self.camera.matrix[8], self.camera.matrix[9], self.camera.matrix[10]);
        this.previousCameraLookAtVector.set(cameraLookAtTarget.xyz);
        this.previousCameraHeight = self.camera.position.y;
      }
    }
  }

  //Prepare our WASM Modules
  this.webAssemblyWorker = new Worker("../src/cpp/state-engine/starry-sky-web-worker.js");
  this.webAssemblyWorker.addEventListener('message', function(e){
    let postObject = e.data;
    if(postObject.eventType === self.EVENT_RETURN_LATEST_SKY_STATE){
      //Attach our 32 bit float array buffers back to this thread again
      self.transferableFinalStateBuffer = postObject.transferableFinalStateBuffer;
      self.finalStateFloat32Array = new Float32Array(self.transferableFinalStateBuffer);
    }
    else if(postObject.eventType === self.EVENT_INITIALIZATION_SKY_STATE_RESPONSE){
      //Attach our 32 bit float array buffers back to this thread again
      transferableInitialStateBuffer = postObject.transferableInitialStateBuffer;
      self.transferableFinalStateBuffer = postObject.transferableFinalStateBuffer;
      self.finalStateFloat32Array = new Float32Array(self.transferableFinalStateBuffer);
      let initialStateFloat32Array = new Float32Array(transferableInitialStateBuffer);

      //Prepare the heap memory for our interpolation engine
      self.astroPositions_0_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astroPositions_f_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.rotatedAstroPositions_ptr = Module._malloc(NUMBER_OF_ROTATION_OUTPUT_VALUES * BYTES_PER_32_BIT_FLOAT);
      self.rotatedAstroDepedentValues_ptr = Module._malloc(NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES * BYTES_PER_32_BIT_FLOAT);

      self.astronomicalLinearValues_0_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(LINEAR_ARRAY_START, LINEAR_ARRAY_END), self.astronomicalLinearValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astronomicalLinearValues_f_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, LINEAR_ARRAY_END), self.astronomicalLinearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astronomicalLinearValues_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);

      //Setting this buffer is deffered until our lighting worker is complete
      self.lightingColorValues_0_ptr = Module._malloc(NUMBER_OF_LIGHTING_COLOR_CHANNELS * BYTES_PER_32_BIT_FLOAT);
      self.lightingColorValues_f_ptr = Module._malloc(NUMBER_OF_LIGHTING_COLOR_CHANNELS * BYTES_PER_32_BIT_FLOAT);
      self.lightingColorValues_ptr = Module._malloc(NUMBER_OF_LIGHTING_OUT_VALUES * BYTES_PER_32_BIT_FLOAT);

      //Attach references to our interpolated values
      self.rotatedAstroPositions = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroPositions_ptr, NUMBER_OF_ROTATION_OUTPUT_VALUES);
      self.astronomicalLinearValues = new Float32Array(Module.HEAPF32.buffer, self.astronomicalLinearValues_ptr, NUMBER_OF_LINEAR_INTERPOLATIONS);
      self.rotatedAstroDependentValues = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroDepedentValues_ptr, NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES);

      //Run our sky interpolator to determine our azimuth, altitude and other variables
      let latitude = self.assetManager.data.skyLocationData.latitude;
      const twiceTheSinOfSolarRadius = 2.0 * Math.sin(self.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5);
      Module._setupInterpolators(latitude, twiceTheSinOfSolarRadius, self.sunRadius, self.moonRadius, self.distanceForSolarEclipse,
        self.astroPositions_0_ptr, self.rotatedAstroPositions_ptr, self.astronomicalLinearValues_0_ptr,
        self.astronomicalLinearValues_ptr, self.rotatedAstroDepedentValues_ptr);
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
          distanceToEarthsShadowSquared: 0.0,
          oneOverNormalizedLunarDiameter: 0.0,
          earthsShadowPosition: new THREE.Vector3(),
          lightingModifier: new THREE.Vector3()
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
        transferableFinalStateBuffer: self.transferableFinalStateBuffer
      }, [self.transferableFinalStateBuffer]);

      //Proceed to renderer setup
      self.skyDirectorWASMIsReady = true;
      self.initializeRenderers();
    }
    else if(postObject.eventType === self.EVENT_INITIALIZATION_AUTOEXPOSURE_RESPONSE){
      //Hook up our intial color buffers that were created on the web worker
      const lightingColorArray0 = postObject.lightingColorArray0;
      self.lightingColorArrayf = postObject.lightingColorArrayf;

      //Set up our lighting color values for the first time
      Module.HEAPF32.set(lightingColorArray0, self.lightingColorValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.lightingColorArrayf, self.lightingColorValues_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.lightingColorValues = new Float32Array(Module.HEAPF32.buffer, self.lightingColorValues_ptr, NUMBER_OF_LIGHTING_OUT_VALUES);

      //Hook up our output lighting value array so we can get back multiple values from interpolating our lighting
      Module._initializeLightingValues(self.lightingColorValues_ptr);
      Module._updateLightingValues(postObject.exposureCoefficient0,  postObject.exposureCoefficientf,
        self.dominantLightIsSun0, self.dominantLightIsSunf,
        postObject.dominantLightY0, postObject.dominantLightYf,
        self.lightingColorValues_0_ptr, self.lightingColorValues_f_ptr,
        self.time, self.time + HALF_A_SECOND);

      //Now re-attach our array for use in the renderer
      self.transferableSkyFinalLightingBuffer = postObject.meteringSurveyFloatArray.buffer;

      //Hook up our results to our interpolator for constant exposure variation
      self.exposureVariables.exposureCoefficient0 = postObject.exposureCoefficient0;
      self.exposureVariables.exposureCoefficientf = postObject.exposureCoefficientf;

      //Hook up lighting values for interpolation for our hemispherical, direct lighting and fog
      self.lightingManager = new StarrySky.LightingManager(self);

      //Pass the data back to the worker to get the next data set
      const deltaT = 1.0 / 60.0; //Presume 60 FPS on this first frame
      self.updateAutoExposure(deltaT);

      //Start the sky here - as we should have everything back and ready by now
      self.start();
    }
    else if(postObject.eventType === self.EVENT_RETURN_AUTOEXPOSURE){
      ///Hook up our intial color buffers that were created on the web worker
      self.lightingColorArrayf = postObject.lightingColorArrayf;
      self.lightingColorValuesf = new Float32Array(Module.HEAPF32.buffer, self.lightingColorValues_f_ptr, NUMBER_OF_LIGHTING_COLOR_CHANNELS);

      //Hook up our results to our interpolator for constant exposure variation
      self.exposureVariables.exposureCoefficientf = postObject.exposureCoefficientf;

      //Now re-attach our array for use in the renderer
      self.transferableSkyFinalLightingBuffer = postObject.meteringSurveyFloatArray.buffer;
    }

    return false;
  });

  this.initializeAutoExposure = async function(){
      const meteringTextureSize = self.renderers.meteringSurveyRenderer.meteringSurveyTextureSize;
      const numberOfPixelsInMeteringBuffer = meteringTextureSize * meteringTextureSize;
      const numberOfColorChannelsInMeteringPixel = 4;
      const groundColorRef = self.assetManager.data.skyLighting.groundColor;
      const groundColorArray = new Float32Array(3);
      groundColorArray[0] = groundColorRef.red / 255.0;
      groundColorArray[1] = groundColorRef.green / 255.0;
      groundColorArray[2] = groundColorRef.blue / 255.0;

      //Get the initial position of our sun and moon
      //and pass them into our metering survey
      Module._setSunAndMoonTimeTo(0.0);
      self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
      self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
      const sunYPos0 = self.rotatedAstroPositions[1];
      const moonYPos0 = self.rotatedAstroPositions[4];
      const sunRadius0 = Math.sin(self.renderers.sunRenderer.sunAngularRadiusInRadians * self.astronomicalLinearValues[1]);
      const moonRadius0 = Math.sin(self.renderers.moonRenderer.moonAngularRadiusInRadians * self.astronomicalLinearValues[3]);
      const sunIntensity0 = self.astronomicalLinearValues[0];
      const moonIntensity0 = self.astronomicalLinearValues[2];
      self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
      self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
      let skyRenderTarget = self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);
      transferableSkyIntialLightingBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * numberOfPixelsInMeteringBuffer * numberOfColorChannelsInMeteringPixel);
      transferableIntialSkyLightingFloat32Array = new Float32Array(transferableSkyIntialLightingBuffer);
      self.renderer.readRenderTargetPixels(skyRenderTarget, 0, 0, meteringTextureSize, meteringTextureSize, transferableIntialSkyLightingFloat32Array);

      //Determine if our sun is the dominant light source when we start
      self.dominantLightIsSun0 = true;
      self.dominantLightY0 = sunYPos0;
      if(sunYPos0 < -sunRadius0){
        self.dominantLightIsSun0 = false;
        self.dominantLightY0 = moonYPos0;
      }

      //Get our position for the sun and moon 2 seconds from now
      Module._setSunAndMoonTimeTo(HALF_A_SECOND * self.speed);
      self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
      self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
      const sunYPosf = self.rotatedAstroPositions[1];
      const moonYPosf = self.rotatedAstroPositions[4];
      const sunRadiusf = Math.sin(self.renderers.sunRenderer.sunAngularRadiusInRadians * self.astronomicalLinearValues[1]);
      const moonRadiusf = Math.sin(self.renderers.moonRenderer.moonAngularRadiusInRadians * self.astronomicalLinearValues[3]);
      const sunIntensityf = self.astronomicalLinearValues[0];
      const moonIntensityf = self.astronomicalLinearValues[2];
      self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
      self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
      skyRenderTarget = self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);
      self.transferableSkyFinalLightingBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * numberOfPixelsInMeteringBuffer * numberOfColorChannelsInMeteringPixel);
      self.transferableSkyFinalLightingFloat32Array = new Float32Array(transferableSkyIntialLightingBuffer);
      self.renderer.readRenderTargetPixels(skyRenderTarget, 0, 0, meteringTextureSize, meteringTextureSize, self.transferableSkyFinalLightingFloat32Array);

      //Get the look at target for our camera to see where we are looking
      const cameraLookAtTarget = new THREE.Vector3(self.camera.matrix[8], self.camera.matrix[9], self.camera.matrix[10]);
      this.previousCameraHeight = self.camera.position.y;
      this.previousCameraLookAtVector.set(cameraLookAtTarget.xyz);

      //Determine if our sun is the dominant light source when we end this interpolation
      self.dominantLightIsSunf = true;
      self.dominantLightYf = sunYPosf;
      if(sunYPosf < -sunRadiusf){
        self.dominantLightIsSunf = false;
        self.dominantLightYf = moonYPosf;
      }

      //Pass this information to our web worker to get our exposure value
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_INITIALIZE_AUTOEXPOSURE,
        heightOfCamera: this.previousCameraHeight,
        hmdViewX: this.previousCameraLookAtVector.x,
        hmdViewZ: this.previousCameraLookAtVector.z,
        sunYPosition0: sunYPos0,
        sunYPositionf: sunYPosf,
        sunRadius0: sunRadius0,
        sunRadiusf: sunRadiusf,
        sunIntensity0: sunIntensity0,
        sunIntensityf: sunIntensityf,
        moonYPosition0: moonYPos0,
        moonYPositionf: moonYPosf,
        moonRadius0: moonRadius0,
        moonRadiusf: moonRadiusf,
        moonIntensity0: moonIntensity0,
        moonIntensityf: moonIntensityf,
        transmittanceTextureSize: self.atmosphereLUTLibrary.transmittanceTextureSize,
        meteringSurveyTextureSize: self.renderers.meteringSurveyRenderer.meteringSurveyTextureSize,
        meteringSurveyFloatArray0: transferableIntialSkyLightingFloat32Array,
        meteringSurveyFloatArrayf: self.transferableSkyFinalLightingFloat32Array,
        transmittanceTextureLUT: self.atmosphereLUTLibrary.transferableTransmittanceFloat32Array,
        groundColor: groundColorArray,
      }, [
        transferableSkyIntialLightingBuffer,
        self.transferableSkyFinalLightingBuffer,
        self.atmosphereLUTLibrary.transferrableTransmittanceBuffer,
        groundColorArray.buffer
      ]);
  }

  this.updateAutoExposure = function(deltaT){
    const meteringTextureSize = self.renderers.meteringSurveyRenderer.meteringSurveyTextureSize;

    Module._setSunAndMoonTimeTo(self.interpolationT + 2.0 * HALF_A_SECOND * self.speed);
    self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
    self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
    self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
    self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
    const sunYPosf = self.rotatedAstroPositions[1];
    const moonYPosf = self.rotatedAstroPositions[4];
    const sunRadiusf = Math.sin(self.renderers.sunRenderer.sunAngularRadiusInRadians * self.astronomicalLinearValues[1]);
    const moonRadiusf = Math.sin(self.renderers.moonRenderer.moonAngularRadiusInRadians * self.astronomicalLinearValues[3]);
    const sunIntensityf = self.astronomicalLinearValues[0];
    const moonIntensityf = self.astronomicalLinearValues[2];
    const renderTarget = self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);
    self.transferableSkyFinalLightingFloat32Array = new Float32Array(self.transferableSkyFinalLightingBuffer);
    self.renderer.readRenderTargetPixels(renderTarget, 0, 0, meteringTextureSize, meteringTextureSize, self.transferableSkyFinalLightingFloat32Array);

    //Once we know what the final estimated position will be, we determine if the final dominant light will be the sun
    //or not
    self.dominantLightIsSunf = true;
    self.dominantLightYf = sunYPosf;
    if(sunYPosf < -sunRadiusf){
      self.dominantLightIsSunf = false;
      self.dominantLightYf = moonYPosf;
    }

    //Just use the current cameras position as an estimate for where the camera will be in 0.5 seconds
    self.camera.getWorldDirection( self.currentCameraLookAtTarget );

    //Pass this information to our web worker to get our exposure value
    //This is a dummy post for above
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_UPDATE_AUTOEXPOSURE,
      sunYPositionf: sunYPosf,
      moonYPositionf: moonYPosf,
      sunRadiusf: sunRadiusf,
      moonRadiusf: moonRadiusf,
      sunIntensityf: sunIntensityf,
      moonIntensityf: moonIntensityf,
      heightOfCamera: 2.0 * self.camera.position.y - self.previousCameraHeight,
      hmdViewX: self.currentCameraLookAtTarget.x,
      hmdViewZ: self.currentCameraLookAtTarget.z,
      meteringSurveyFloatArrayf: self.transferableSkyFinalLightingFloat32Array
    }, [self.transferableSkyFinalLightingBuffer]);
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

  //
  //These hooks are here as user functions because users may wish to
  //disable atmospheric perspective.
  //
  this.disableAtmosphericPerspective = function(){
    self.assetManager.data.atmosphericPerspectiveEnabled = false;
  }

  this.enableAtmosphericPerspective = function(){
    self.assetManager.data.atmosphericPerspectiveEnabled = true;
  }

  function onRuntimeInitialized() {
      self.skyInterpolatorWASMIsReady = true;
      self.initializeSkyDirectorWebWorker();
  }
  Module['onRuntimeInitialized'] = onRuntimeInitialized;
}
