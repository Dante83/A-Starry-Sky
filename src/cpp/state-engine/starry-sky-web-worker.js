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
    let updatedFloat32Array = new Float32Array(arrayReference, 0.0, NUMBER_OF_ASTRONOMICAL_FLOATS);
    updatedFloat32Array.set(skyState.astroValuesFloat32Array, 0, NUMBER_OF_ASTRONOMICAL_FLOATS);
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
    let initialStateFloat32Array = new Float32Array(initialStateBuffer, 0.0, NUMBER_OF_ASTRONOMICAL_FLOATS);
    skyState.astroValuesFloat32Array = new Float32Array(Module.HEAPF32.buffer, skyState.memoryPtr, NUMBER_OF_ASTRONOMICAL_FLOATS);
    initialStateFloat32Array.set(skyState.astroValuesFloat32Array, 0, NUMBER_OF_ASTRONOMICAL_FLOATS);

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
  const transmittanceBufferLength = postObject.transmittanceTextureSize * 3;
  const groundColorBufferLength = 3;
  lightingState.skyMeteringSurveyMemoryPtr = Module._malloc(meteringSurveyBufferLength * BYTES_PER_32_BIT_FLOAT);
  lightingState.skyDirectionalVectorMemoryPtr = Module._malloc(directionalSurveyBufferLength * BYTES_PER_32_BIT_FLOAT);
  lightingState.skyMaskPtr = Module._malloc(skyMaskBufferLength * BYTES_PER_32_BIT_FLOAT);
  lightingState.transmittanceLUTPtr = Module._malloc(transmittanceBufferLength * BYTES_PER_32_BIT_FLOAT);
  lightingState.transmittanceLUTPtr.set(postObject.transmittanceLUT, 0, postObject.transmittanceLUT.bufferSize.length);
  lightingState.directLightingColorPtr = Module._malloc(3 * BYTES_PER_32_BIT_FLOAT); //Three colors of our direct lighting color
  lightingState.skyHemisphericalLightColorPtr = Module._malloc(21 * BYTES_PER_32_BIT_FLOAT); // 3 colors channels for all sides of the cube and 1 for the fog color
  lightingState.groundColorPtr = Module._malloc(3 * BYTES_PER_32_BIT_FLOAT);
  lightingState.groundColorPtr.set(postObject.groundColor, 0, 3 * BYTES_PER_32_BIT_FLOAT);

  //Start by intializing our masks and directional vectors
  Module._initializeMeteringAndLightingDependencies(meteringSurveyTextureSize, postObject.transmittanceTextureSize,
    lightingState.skyDirectionalVectorMemoryPtr, lightingState.skyMaskPtr, lightingState.groundColorPtr, lightingState.transmittanceLUTPtr);

  //We only return the color of the sky for hemispherical lighting and the exposure to scale the sky color
  lightingState.skyMeteringSurveyFloatArray = new Float32Array(Module.HEAPF32.buffer, lightingState.skyMeteringSurveyMemoryPtr, meteringSurveyBufferLength);
  lightingState.skyHemisphericalLightColorFloatArray = new Float32Array(Module.HEAPF32.buffer, lightingState.skyHemisphericalLightColorPtr, 21);
  lightingState.skyMeteringSurveyFloatArray.set(postObject.meteringSurveyFloatArray0, 0, meteringSurveyBufferLength);
  const exposureCoefficient0 = Module._updateMeteringData(lightingState.skyMeteringSurveyMemoryPtr);
  let directLightingColor0 = new Float32Array(3);
  lightingState.directLightingColorFloatArray.set(directLightingColor, 0, directLightingColor.bufferSize * BYTES_PER_32_BIT_FLOAT);
  const dominantLightY = Module._updateDirectLighting(postObject.heightOfCamera, postObject.sunYPosition0, postObject.sunRadius0, postObject.moonRadius0 postObject.moonYPosition0, postObject.sunIntensity0, postObject.moonIntensity0, exposureCoefficient0, lightingState.directLightingColorBuffer);
  let sunYPosition0 = postObject.sunYPosition0;
  let moonYPosition0 = postObject.moonYPosition0;
  if(postObject.sunYPosition0 > (2.0 * sunRadius0)){
    sunYPosition0 = dominantLightY0;
  }
  else{
    moonYPosition0 = dominantLightY0;
  }
  let hemisphericalLightingAndFogColors0 = new Float32Array(21);
  lightingState.skyHemisphericalColorArray.set(hemisphericalLightingAndFogColors, 0, hemisphericalLightingAndFogColors.bufferSize * BYTES_PER_32_BIT_FLOAT);
  Module._updateHemisphericalLightingData(lightingState.skyMeteringSurveyMemoryPtr, lightingState.skyMeteringSurveyfPtr, postObject.hmdViewX, postObject.hmdViewZ);

  lightingState.skyMeteringSurveyFloatArray.set(postObject.meteringSurveyFloatArrayf, 0, meteringSurveyBufferLength);
  const exposureCoefficientf = Module._updateMeteringData(lightingState.skyMeteringSurveyMemoryPtr);
  let directLightingColorf = new Float32Array(3);
  lightingState.directLightingColorFloatArray.set(directLightingColor, 0, directLightingColor.bufferSize * BYTES_PER_32_BIT_FLOAT);
  const dominantLightY = Module._updateDirectLighting(postObject.heightOfCamera, postObject.sunYPositionf, postObject.sunRadiusf, postObject.moonRadiusf postObject.moonYPositionf, postObject.sunIntensityf, postObject.moonIntensityf, exposureCoefficientf, lightingState.directLightingColorBuffer);
  let sunYPositionf = postObject.sunYPositionf;
  let moonYPositionf = postObject.moonYPositionf;
  if(postObject.sunYPositionf > (2.0 * sunRadiusf)){
    sunYPositionf = dominantLightYf;
  }
  else{
    moonYPositionf = dominantLightYf;
  }
  let hemisphericalLightingAndFogColorsf = new Float32Array(21);
  lightingState.skyHemisphericalColorArray.set(hemisphericalLightingAndFogColors, 0, hemisphericalLightingAndFogColors.bufferSize * BYTES_PER_32_BIT_FLOAT);
  Module._updateHemisphericalLightingData(lightingState.skyMeteringSurveyMemoryPtr, lightingState.skyMeteringSurveyfPtr, postObject.hmdViewX, postObject.hmdViewZ);

  postMessage({
    eventType: EVENT_INITIALIZATION_AUTOEXPOSURE_RESPONSE,
    exposureCoefficient0: exposureCoefficient0,
    exposureCoefficientf: exposureCoefficientf,
    sunYPosition0: sunYPosition0,
    sunYPositionf: sunYPositionf,
    moonYPosition0: moonYPosition0,
    moonYPositionf: moonYPositionf,
    meteringSurveyFloatArray: postObject.meteringSurveyFloatArrayf,
    directLightingColor0: directLightingColorFloatArray0,
    directLightingColorf: directLightingColorFloatArray,
    hemisphericalLightingColor0: skyHemisphericalColorArray0,
    hemisphericalLightingColorf: skyHemisphericalColorArray,
  }, [postObject.meteringSurveyFloatArrayf.buffer,
    directLightingColorFloatArray0.buffer,
    directLightingColorFloatArray.buffer,
    skyHemisphericalColorArray0.buffer,
    skyHemisphericalColorArray
  ]);
}

onmessage = function(e){
  let postObject = e.data;
  if(postObject.eventType === EVENT_UPDATE_AUTOEXPOSURE){
    lightingState.skyMeteringSurveyFloatArray.set(postObject.meteringSurveyFloatArrayf, 0, meteringSurveyBufferLength);
    const exposureCoefficientf = Module._updateMeteringData(lightingState.skyMeteringSurveyMemoryPtr);
    let directLightingColor = new Float32Array(3);
    lightingState.directLightingColorFloatArray.set(directLightingColor, 0, directLightingColor.bufferSize * BYTES_PER_32_BIT_FLOAT);
    const dominantLightY = Module._updateDirectLighting(postObject.heightOfCamera, postObject.sunYPosition, postObject.sunRadius, postObject.moonRadius postObject.moonYPosition, postObject.sunIntensity, postObject.moonIntensity, exposureCoefficientf, lightingState.directLightingColorBuffer);
    let sunYPosition = postObject.sunYPosition;
    let moonYPosition = postObject.moonYPosition;
    if(postObject.sunYPosition > (2.0 * sunRadius)){
      sunYPosition = dominantLightY;
    }
    else{
      moonYPosition = dominantLightY;
    }
    let hemisphericalLightingAndFogColors = new Float32Array(21);
    lightingState.skyHemisphericalColorArray.set(hemisphericalLightingAndFogColors, 0, hemisphericalLightingAndFogColors.bufferSize * BYTES_PER_32_BIT_FLOAT);
    Module._updateHemisphericalLightingData(lightingState.skyMeteringSurveyMemoryPtr, lightingState.skyMeteringSurveyfPtr, postObject.hmdViewX, postObject.hmdViewZ);

    postMessage({
      eventType: EVENT_RETURN_AUTOEXPOSURE,
      exposureCoefficientf: exposureCoefficientf,
      sunYPosition: sunYPosition,
      moonYPosition: moonYPosition,
      meteringSurveyFloatArray: postObject.meteringSurveyFloatArrayf,
      directLightingColor: lightingState.directLightingColorFloatArray,
      hemisphericalLightingColor: lightingState.skyHemisphericalColorArray,
    }, [postObject.meteringSurveyFloatArrayf.buffer,
      lightingState.directLightingColorFloatArray.buffer,
      lightingState.skyHemisphericalColorArray.buffer
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
