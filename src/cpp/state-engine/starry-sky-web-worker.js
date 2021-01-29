// This loads the wasm generated glue code
// import * as Module from './starry-sky-module.js';
importScripts('./state-engine.js');

//
//Return of global variables - because this is actually it's own little world
//and so anarcho-communism still works perfectly fine... for now.
//
const BYTES_PER_32_BIT_FLOAT = 4;
const NUMBER_OF_ASTRONOMICAL_FLOATS = 26;

const EVENT_INITIALIZE_SKY_STATE = 0;
const EVENT_INITIALIZATION_SKY_STATE_RESPONSE = 1;
const EVENT_UPDATE_LATEST_SKY_STATE = 2;
const EVENT_RETURN_LATEST_SKY_STATE = 3;
const EVENT_INITIALIZE_AUTOEXPOSURE = 4;
const EVENT_INITIALIZATION_AUTOEXPOSURE_RESPONSE = 5;
const EVENT_UPDATE_AUTOEXPOSURE = 6;
const EVENT_RETURN_AUTOEXPOSURE = 7;
const MINUTES_BETWEEN_SKY_STATE_UPDATES = 20.0;
const SECONDS_BETWEEN_SKY_STATE_UPDATES = 20.0 * 60.0;
var numberOfUpdates;
var updateLoop;
var wasmModule;
var initialize;
var skyState;
var initialAstronomicalPostObject;
var wasmIsReady = false;
var initialSkyDateReceived = false;
var skyStateIsReady = false;
var meteringSurveyTextureSize;
var skyMaskBufferLength;
var meteringSurveyBufferLength;
var directionaSurveyBufferLength;
var lightingStateIsReady = false;
var skyState;
var lightingState = {};
var update;
var requests = [];
var hemisphericalSkyColorFloatArray;

var updateSkyState = function(arrayReference){
  if(wasmIsReady && skyStateIsReady){
    //Update our sky state from the data provided
    Module._updateSky(
      skyState.year,
      skyState.month,
      skyState.day,
      skyState.hour,
      skyState.minute,
      skyState.second
    );

    //Copy the data from our starry sky web assembly heap to the transferable memory
    let updatedFloat32Array = new Float32Array(arrayReference);
    updatedFloat32Array.set(skyState.astroValuesFloat32Array);
    return true;
  }
  return false;
}

function initializeSkyAstronomicalState(){
  if(wasmIsReady && initialSkyDateReceived){
    //Set the current date time.
    const dateAtLocation = new Date(initialAstronomicalPostObject.date);
    let dateAtUTC = new Date(dateAtLocation.getTime() + (initialAstronomicalPostObject.utcOffset * 3600.0) * 1000.0);

    //Construct the initial sky state
    skyState = {
      initialDate: dateAtLocation,
      latitude: initialAstronomicalPostObject.latitude,
      longitude: initialAstronomicalPostObject.longitude,
      year: dateAtUTC.getFullYear(),
      month: dateAtUTC.getMonth() + 1,
      day: dateAtUTC.getDate(),
      hour: dateAtUTC.getHours(),
      minute: dateAtUTC.getMinutes(),
      second: dateAtUTC.getSeconds() + (dateAtUTC.getMilliseconds() * 0.001),
      memoryPtr: null,
      astroValuesFloat32Array: null,
      bufferSize: null
    };

    if(isNaN(skyState.minute)){
      throw 'Invalid date object. Perhaps use the date formate year-month-day hour:minute:second?';
    }
    wasmModule = initialAstronomicalPostObject.WASMModule;
    skyStateIsReady = true;
    let initialStateBuffer = initialAstronomicalPostObject.transferableInitialStateBuffer;
    skyState.memoryPtr = Module._malloc(NUMBER_OF_ASTRONOMICAL_FLOATS * BYTES_PER_32_BIT_FLOAT);
    Module._setupSky(
      skyState.latitude,
      skyState.longitude,
      skyState.year,
      skyState.month,
      skyState.day,
      skyState.hour,
      skyState.minute,
      skyState.second,
      skyState.memoryPtr
    );
    let initialStateFloat32Array = new Float32Array(initialStateBuffer);
    skyState.astroValuesFloat32Array = new Float32Array(Module.HEAPF32.buffer, skyState.memoryPtr, NUMBER_OF_ASTRONOMICAL_FLOATS);
    initialStateFloat32Array.set(skyState.astroValuesFloat32Array);

    //Construct the sky state five minutes from now
    numberOfUpdates = 1;
    dateAtUTC = new Date(dateAtLocation.getTime() + (SECONDS_BETWEEN_SKY_STATE_UPDATES + initialAstronomicalPostObject.utcOffset * 3600.0) * 1000.0);
    skyState.year = dateAtUTC.getFullYear();
    skyState.month = dateAtUTC.getMonth() + 1;
    skyState.day = dateAtUTC.getDate();
    skyState.hour = dateAtUTC.getHours();
    skyState.minute = dateAtUTC.getMinutes();
    skyState.second = dateAtUTC.getSeconds() + (dateAtUTC.getMilliseconds() * 0.001);
    let finalStateBuffer = initialAstronomicalPostObject.transferableFinalStateBuffer;
    updateSkyState(finalStateBuffer);

    const initialFloatArray = new Float32Array(initialStateBuffer);
    const finalFloatArray = new Float32Array(finalStateBuffer);

    //Once finished, return these memory objects back to the primary thread to
    //begin rotating our sky.
    postMessage({
      eventType: EVENT_INITIALIZATION_SKY_STATE_RESPONSE,
      transferableInitialStateBuffer: initialStateBuffer,
      transferableFinalStateBuffer: finalStateBuffer
    }, [initialStateBuffer, finalStateBuffer]);
  }
}

function initializeHemisphericalLighting(postObject){
  const meteringSurveyTextureSize = postObject.meteringSurveyTextureSize;
  const skyMaskBufferLength = meteringSurveyTextureSize * meteringSurveyTextureSize;
  const meteringSurveyBufferLength = skyMaskBufferLength * 4;
  const directionalSurveyBufferLength = skyMaskBufferLength * 3;

  //AVENGE ME!!!
  //AVENGED
  const numPixelsInTransmittanceTexture = postObject.transmittanceTextureSize * postObject.transmittanceTextureSize;
  const transmittanceBufferLength = numPixelsInTransmittanceTexture * 3;
  let transmittanceRGB = new Float32Array(transmittanceBufferLength);
  for(let i = 0; i < numPixelsInTransmittanceTexture; ++i){
    const iTimes4 = i * 4;
    const iTimes3 = i * 3;
    transmittanceRGB[iTimes3] = postObject.transmittanceTextureLUT[iTimes4];
    transmittanceRGB[iTimes3 + 1] = postObject.transmittanceTextureLUT[iTimes4 + 1];
    transmittanceRGB[iTimes3 + 2] = postObject.transmittanceTextureLUT[iTimes4 + 2];
  }
  lightingState.skyMeteringSurveyMemoryPtr = Module._malloc(meteringSurveyBufferLength * BYTES_PER_32_BIT_FLOAT);
  lightingState.skyDirectionalVectorMemoryPtr = Module._malloc(directionalSurveyBufferLength * BYTES_PER_32_BIT_FLOAT);
  lightingState.skyMaskPtr = Module._malloc(skyMaskBufferLength * BYTES_PER_32_BIT_FLOAT);
  //AVENGE ME!!!
  //AVENGED
  lightingState.transmittanceLUTPtr = Module._malloc(transmittanceBufferLength * BYTES_PER_32_BIT_FLOAT);
  Module.HEAPF32.set(transmittanceRGB, lightingState.transmittanceLUTPtr / BYTES_PER_32_BIT_FLOAT);
  lightingState.directLightingColorPtr = Module._malloc(3 * BYTES_PER_32_BIT_FLOAT); //Three colors of our direct lighting color
  lightingState.skyHemisphericalLightColorPtr = Module._malloc(18 * BYTES_PER_32_BIT_FLOAT); // 3 colors channels for all sides of the cube and 1 for the fog color
  lightingState.groundColorPtr = Module._malloc(3 * BYTES_PER_32_BIT_FLOAT);
  Module.HEAPF32.set(postObject.groundColor.slice(), lightingState.groundColorPtr / BYTES_PER_32_BIT_FLOAT);
  lightingState.fogColorPtr = Module._malloc(3 * BYTES_PER_32_BIT_FLOAT);

  //Start by intializing our masks and directional vectors
  //void initializeMeteringAndLightingDependencies(int widthOfMeteringTexture, int transmittanceTextureSize,
  //float* xyzPtr, float* pixelWeightsPtr, float* groundColor, float* transmittanceLUT, float* fogColor);
  Module._initializeMeteringAndLightingDependencies(meteringSurveyTextureSize, postObject.transmittanceTextureSize,
    lightingState.skyDirectionalVectorMemoryPtr, lightingState.skyMaskPtr, lightingState.groundColorPtr, lightingState.transmittanceLUTPtr, lightingState.fogColorPtr);

  //We only return the color of the sky for hemispherical lighting and the exposure to scale the sky color
  //AVENGE ME!!!
  lightingState.skyHemisphericalLightColorFloatArray = new Float32Array(Module.HEAPF32.buffer, lightingState.skyHemisphericalLightColorPtr, 18);
  Module.HEAPF32.set(postObject.meteringSurveyFloatArray0, lightingState.skyMeteringSurveyMemoryPtr / BYTES_PER_32_BIT_FLOAT);
  const exposureCoefficient0 = Module._updateMeteringData(lightingState.skyMeteringSurveyMemoryPtr);
  //AVENGE ME!!!
  //AVENGED
  const dominantLightY0 = Module._updateDirectLighting(postObject.heightOfCamera, postObject.sunYPosition0,
    postObject.sunRadius0, postObject.moonRadius0, postObject.moonYPosition0, postObject.sunIntensity0 * 0.01,
    postObject.moonIntensity0, exposureCoefficient0, lightingState.directLightingColorPtr);
  Module._updateHemisphericalLightingData(lightingState.skyMeteringSurveyMemoryPtr, lightingState.skyHemisphericalLightColorPtr, postObject.hmdViewX, postObject.hmdViewZ);

  //Copy our results into a new transferrable buffer that we will pass back to CPU 0
  //AVENGE ME!!!
  //AVENGED
  const directLightingPointerStart = lightingState.directLightingColorPtr / BYTES_PER_32_BIT_FLOAT;
  const hemisphericalLightingPointerStart = lightingState.skyHemisphericalLightColorPtr / BYTES_PER_32_BIT_FLOAT;
  const fogColorPointerStart = lightingState.fogColorPtr / BYTES_PER_32_BIT_FLOAT;
  let lightingColorArray0 = new Float32Array(24);
  lightingColorArray0.set(Module.HEAPF32.slice(hemisphericalLightingPointerStart, hemisphericalLightingPointerStart + 18), 0);
  lightingColorArray0.set(Module.HEAPF32.slice(directLightingPointerStart, directLightingPointerStart + 3), 18);
  lightingColorArray0.set(Module.HEAPF32.slice(fogColorPointerStart, fogColorPointerStart + 3), 21);

  Module.HEAPF32.set(postObject.meteringSurveyFloatArrayf, lightingState.skyMeteringSurveyMemoryPtr / BYTES_PER_32_BIT_FLOAT);
  const exposureCoefficientf = Module._updateMeteringData(lightingState.skyMeteringSurveyMemoryPtr);

  //AVENGE ME!!!
  //AVENGED
  const dominantLightYf = Module._updateDirectLighting(postObject.heightOfCamera, postObject.sunYPositionf,
    postObject.sunRadiusf, postObject.moonRadiusf, postObject.moonYPositionf, postObject.sunIntensityf * 0.01,
    postObject.moonIntensityf, exposureCoefficientf, lightingState.directLightingColorPtr);
  Module._updateHemisphericalLightingData(lightingState.skyMeteringSurveyMemoryPtr, lightingState.skyHemisphericalLightColorPtr, postObject.hmdViewX, postObject.hmdViewZ);

  //Copy our results into a new transferrable buffer that we will pass back to CPU 0
  //AVENGE ME!!!
  //AVENGED
  let lightingColorArrayf = new Float32Array(24);
  lightingColorArrayf.set(Module.HEAPF32.slice(hemisphericalLightingPointerStart, hemisphericalLightingPointerStart + 18), 0);
  lightingColorArrayf.set(Module.HEAPF32.slice(directLightingPointerStart, directLightingPointerStart + 3), 18);
  lightingColorArrayf.set(Module.HEAPF32.slice(fogColorPointerStart, fogColorPointerStart + 3), 21);

  //AVENGE ME!!!
  //AVENGED
  //The code below has been borked to allow us to pass back null things
  postMessage({
    eventType: EVENT_INITIALIZATION_AUTOEXPOSURE_RESPONSE,
    exposureCoefficient0: exposureCoefficient0,
    exposureCoefficientf: exposureCoefficientf,
    dominantLightY0: dominantLightY0,
    dominantLightYf: dominantLightYf,
    meteringSurveyFloatArray: postObject.meteringSurveyFloatArrayf,
    lightingColorArray0: lightingColorArray0,
    lightingColorArrayf: lightingColorArrayf,
  }, [postObject.meteringSurveyFloatArrayf.buffer,
    lightingColorArray0.buffer,
    lightingColorArrayf.buffer
  ]);
}

onmessage = function(e){
  let postObject = e.data;
  if(postObject.eventType === EVENT_UPDATE_AUTOEXPOSURE){
    Module.HEAPF32.set(postObject.meteringSurveyFloatArrayf, lightingState.skyMeteringSurveyMemoryPtr  / BYTES_PER_32_BIT_FLOAT);
    const exposureCoefficientf = Module._updateMeteringData(lightingState.skyMeteringSurveyMemoryPtr);
    //AVENGE ME!!!
    //AVENGED
    let directLightingColorf = new Float32Array(3);
    const dominantLightYf = Module._updateDirectLighting(postObject.heightOfCamera, postObject.sunYPositionf,
      postObject.sunRadiusf, postObject.moonRadiusf, postObject.moonYPositionf, postObject.sunIntensityf * 0.01,
      postObject.moonIntensityf, exposureCoefficientf, lightingState.directLightingColorPtr);
    //console.log(`Dominant Light Y: ${dominantLightYf}`);
    //console.log(`Dominant Light Color Ptr: ${lightingState.directLightingColorPtr}`);
    Module._updateHemisphericalLightingData(lightingState.skyMeteringSurveyMemoryPtr, lightingState.skyHemisphericalLightColorPtr, postObject.hmdViewX, postObject.hmdViewZ);
    //
    // //Copy our results into a new transferrable buffer that we will pass back to CPU 0
    const directLightingPointerStart = lightingState.directLightingColorPtr / BYTES_PER_32_BIT_FLOAT;
    const hemisphericalLightingPointerStart = lightingState.skyHemisphericalLightColorPtr / BYTES_PER_32_BIT_FLOAT;
    const fogColorPointerStart = lightingState.fogColorPtr / BYTES_PER_32_BIT_FLOAT;
    let lightingColorArrayf = new Float32Array(24);
    lightingColorArrayf.set(Module.HEAPF32.slice(hemisphericalLightingPointerStart, hemisphericalLightingPointerStart + 18), 0);
    lightingColorArrayf.set(Module.HEAPF32.slice(directLightingPointerStart, directLightingPointerStart + 3), 18);
    lightingColorArrayf.set(Module.HEAPF32.slice(fogColorPointerStart, fogColorPointerStart + 3), 21);

    //console.log(Module.HEAPF32.slice(directLightingPointerStart, directLightingPointerStart + 3));

    // console.log(`Metering in the web worker: ${lightingColorArrayf}`);
    // console.log("Values in web worker");
    console.log(lightingColorArrayf);

    postMessage({
      eventType: EVENT_RETURN_AUTOEXPOSURE,
      exposureCoefficientf: exposureCoefficientf,
      dominantLightYf: dominantLightYf,
      meteringSurveyFloatArray: postObject.meteringSurveyFloatArrayf,
      lightingColorArrayf: lightingColorArrayf,
    }, [postObject.meteringSurveyFloatArrayf.buffer,
      lightingColorArrayf.buffer
    ]);
  }
  else if(postObject.eventType === EVENT_UPDATE_LATEST_SKY_STATE){
    numberOfUpdates += 1;
    dateAtUTC = new Date(skyState.initialDate.getTime() + ((numberOfUpdates * SECONDS_BETWEEN_SKY_STATE_UPDATES) + initialAstronomicalPostObject.utcOffset * 3600.0) * 1000.0);
    skyState.year = dateAtUTC.getFullYear();
    skyState.month = dateAtUTC.getMonth() + 1;
    skyState.day = dateAtUTC.getDate();
    skyState.hour = dateAtUTC.getHours();
    skyState.minute = dateAtUTC.getMinutes();
    skyState.second = dateAtUTC.getSeconds() + (dateAtUTC.getMilliseconds() * 0.001);
    let finalStateBuffer = postObject.transferableFinalStateBuffer;
    updateSkyState(finalStateBuffer);

    //Once finished, return these memory objects back to the primary thread to
    //begin rotating our sky.
    postMessage({
      eventType: EVENT_RETURN_LATEST_SKY_STATE,
      transferableFinalStateBuffer: finalStateBuffer
    }, [finalStateBuffer]);
  }
  else if(postObject.eventType === EVENT_INITIALIZE_SKY_STATE){
    initialAstronomicalPostObject = postObject;
    initialSkyDateReceived = true;
    initializeSkyAstronomicalState();
  }
  else if(postObject.eventType === EVENT_INITIALIZE_AUTOEXPOSURE){
    initializeHemisphericalLighting(postObject);
  }

  return true;
};

function onRuntimeInitialized() {
    wasmIsReady = true;
    initializeSkyAstronomicalState();
}
Module['onRuntimeInitialized'] = onRuntimeInitialized;
