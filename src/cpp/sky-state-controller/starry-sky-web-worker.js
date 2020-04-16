// This loads the wasm generated glue code
// import * as Module from './starry-sky-module.js';
importScripts('./starry-sky-module.js');

//
//Return of global variables - because this is actually it's own little world
//and so anarcho-communism still works perfectly fine... for now.
//
const BYTES_PER_32_BIT_FLOAT = 4;
const NUMBER_OF_FLOATS = 25;

const EVENT_INITIALIZE = 0;
const EVENT_INITIALIZATION_RESPONSE = 1;
const EVENT_UPDATE_LATEST = 2;
const EVENT_RETURN_LATEST = 3;
const MINUTES_BETWEEN_UPDATES = 20.0;
var date;
var updateLoop;
var wasmModule;
var initialize;
var skyState;
var initialPostObject;
var wasmIsReady = false;
var initialSkyDateReceived = false;
var skyStateIsReady = false;
var skyState
var update;
var requests = [];

var updateSkyState = function(arrayReference){
  if(wasmIsReady && skyStateIsReady){
    //Update our sky state from the data provided
    Module._updateSky(
      skyState.year,
      skyState.month,
      skyState.day,
      skyState.hour,
      skyState.minute,
      skyState.second,
      skyState.utcOffset
    );

    //Copy the data from our starry sky web assembly heap to the transfferable memory
    let updatedFloat32Array = new Float32Array(arrayReference, 0.0, NUMBER_OF_FLOATS);
    updatedFloat32Array.set(skyState.astroValuesFloat32Array, 0, NUMBER_OF_FLOATS);
    return true;
  }
  return false;
}

function initializeSkyState(self){
  if(wasmIsReady && initialSkyDateReceived){
    //Set the current date time.
    date = new Date(initialPostObject.date);

    //Construct the initial sky state
    skyState = {
      date: date,
      latitude: initialPostObject.latitude,
      longitude: initialPostObject.longitude,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds() + (date.getMilliseconds() * 0.001),
      utcOffset: initialPostObject.utcOffset,
      memoryPtr: null,
      astroValuesFloat32Array: null,
      bufferSize: null
    };
    if(isNaN(skyState.minute)){
      throw 'Invalid date object. Perhaps use the date formate year-month-day hour:minute:second?';
    }
    wasmModule = initialPostObject.WASMModule;
    skyStateIsReady = true;
    let initialStateBuffer = initialPostObject.transferrableInitialStateBuffer;
    skyState.memoryPtr = Module._malloc(NUMBER_OF_FLOATS * BYTES_PER_32_BIT_FLOAT);
    Module.HEAPF32.set(skyState.memoryPtr, skyState.memoryPtr / BYTES_PER_32_BIT_FLOAT);
    Module._setupSky(
      skyState.latitude,
      skyState.longitude,
      skyState.year,
      skyState.month,
      skyState.day,
      skyState.hour,
      skyState.minute,
      skyState.second,
      skyState.utcOffset,
      skyState.memoryPtr
    );
    let initialStateFloat32Array = new Float32Array(initialStateBuffer, 0.0, NUMBER_OF_FLOATS);
    skyState.astroValuesFloat32Array = new Float32Array(Module.HEAPF32.buffer, skyState.memoryPtr, NUMBER_OF_FLOATS);
    initialStateFloat32Array.set(skyState.astroValuesFloat32Array, 0, NUMBER_OF_FLOATS);

    //Construct the sky state five minutes from now
    skyState.date.setMinutes(skyState.date.getMinutes() + MINUTES_BETWEEN_UPDATES);
    skyState.year = date.getFullYear();
    skyState.month = date.getMonth() + 1;
    skyState.day = date.getDate();
    skyState.hour = date.getHours();
    skyState.minute = date.getMinutes();
    skyState.second = date.getSeconds() + (date.getMilliseconds() * 0.001);
    let finalStateBuffer = initialPostObject.transferrableFinalStateBuffer;
    updateSkyState(finalStateBuffer);

    console.log("Sky state");
    console.log(initialStateFloat32Array);
    console.log(skyState.astroValuesFloat32Array);

    //Once finished, return these memory objects back to the primary thread to
    //begin rotating our sky.
    self.postMessage({
      eventType: EVENT_INITIALIZATION_RESPONSE,
      transferrableInitialStateBuffer: initialStateBuffer,
      transferrableFinalStateBuffer: finalStateBuffer
    }, [initialStateBuffer, finalStateBuffer]);
  }
}

onmessage = function(e){
  let postObject = e.data;
  if(postObject.eventType === EVENT_UPDATE_LATEST){
    skyState.date.setMinutes(skyState.date.getMinutes() + MINUTES_BETWEEN_UPDATES);
    skyState.year = date.getFullYear();
    skyState.month = date.getMonth() + 1;
    skyState.day = date.getDate();
    skyState.hour = date.getHours();
    skyState.minute = date.getMinutes();
    skyState.second = date.getSeconds() + (date.getMilliseconds() * 0.001);
    let finalStateBuffer = postObject.transferrableFinalStateBuffer;
    updateSkyState(finalStateBuffer);

    //Once finished, return these memory objects back to the primary thread to
    //begin rotating our sky.
    self.postMessage({
      eventType: EVENT_RETURN_LATEST,
      transferrableFinalStateBuffer: finalStateBuffer
    }, [finalStateBuffer]);
  }
  else if(postObject.eventType === EVENT_INITIALIZE){
    initialPostObject = postObject;
    initialSkyDateReceived = true;
    initializeSkyState();
  }

  return true;
};

function onRuntimeInitialized() {
    wasmIsReady = true;
    initializeSkyState(self);
}
Module['onRuntimeInitialized'] = onRuntimeInitialized;
