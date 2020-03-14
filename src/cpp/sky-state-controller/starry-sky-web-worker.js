// This loads the wasm generated glue code
importScripts('starry-sky-module.js');

//
//Return of global variables - because this is actually it's own little world
//and so anarcho-communism still works perfectly fine... for now.
//
const EVENT_INITIALIZE = 0;
const EVENT_INITIALIZATION_RESPONSE = 1;
const EVENT_UPDATE_LATEST = 2;
const EVENT_RETURN_LATEST = 3;
const FIVE_MINUTES = 60.0 * 5.0 * 1000.0;
const MINUTES_BETWEEN_UPDATES = 5.0;
var date;
var updateLoop;
var wasmModule;
var initialize;
var skyState;
var wasmIsReady = false;
var skyStateIsReady = false;
var update;
var requests = [];

//
//Replacing all of the above with one giant float buffer for easy modification
//
// const float32DataArray = new Float32Array(12 + 12 + 4 + 10);
// const uInt32DataArray = new Int32Array(5);
// var buffer;
Module['onRuntimeInitialized'] = function() {
  wasmIsReady = true;
  attemptInitializiation();
};

var updateSkyState = function(arrayReference){
  if(wasmIsReady && skyStateIsReady){
    //Update our sky state from the data provided
    Module.HEAPF32.set(arrayReference, skyState.memoryPtr / arrayReference.BYTES_PER_ELEMENT);
    let julianDay = Module._updateSky(
      skyState.year,
      skyState.month,
      skyState.day,
      skyState.hour,
      skyState.minute,
      skyState.second,
      skyState.utcOffset
    );

    //Copy the data from our starry sky web assembly heap to the transfferable memory
    arrayReference.set(Module.HEAPF32.buffer, skyState.memoryPtr, arrayReference.length);
    return arrayReference;
  }
  return false;
}

onmessage = function(e){
  let postObject = e.data;
  if(postObject.eventType === EVENT_UPDATE_LATEST){
    skyState.date = skyState.date.setMinutes(skyState.date.getMinutes() + MINUTES_BETWEEN_UPDATES);
    skyState.year = date.getFullYear();
    skyState.month = date.getMonth() + 1;
    skyState.day = date.getDate();
    skyState.hour = date.getHours();
    skyState.minute = date.getMinutes();
    skyState.second = date.getSeconds() + (date.getMilliseconds() * 0.001);
    let finalStateBuffer = postObject.transferrableFinalStateBuffer;
    finalStateBuffer = updateSkyState(finalStateBuffer);

    //Once finished, return these memory objects back to the primary thread to
    //begin rotating our sky.
    self.webAssemblyWorker.postMessage({
      eventType: EVENT_RETURN_LATEST,
      transferrableFinalStateBuffer: finalStateBuffer
    }, [finalStateBuffer]);
  }
  else if(postObject.eventType === EVENT_INITIALIZE){
    //Set the current date time.
    date = new Date(postObject.date);

    //Construct the initial sky state
    skyState = {
      date: date,
      latitude: postObject.latitude,
      longitude: postObject.longitude,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds() + (date.getMilliseconds() * 0.001),
      utcOffset: postObject.utcOffset,
      timeMultiplier: postObject.timeMultiplier,
      memoryPtr: null,
      bufferSize: null
    };
    if(isNaN(skyState.minute)){
      throw 'Invalid date object. Perhaps use the date formate year-month-day hour:minute:second?';
    }
    wasmModule = postObject.WASMModule;
    skyStateIsReady = true;
    let initialStateBuffer = postObject.transferrableInitialStateBuffer;
    skyState.memoryPtr = Module._malloc(initialStateBuffer.length * initialStateBuffer.BYTES_PER_ELEMENT);
    Module._setupSky(
      skyState.latitude,
      skyState.longitude,
      skyState.year,
      skyState.month,
      skyState.day,
      skyState.hour,
      skyState.minute,
      skyState.second,
      skyState.utcOffset
    );
    initialStateBuffer.set(Module.HEAPF32.buffer, skyState.memoryPtr, arrayReference.length);

    //Construct the sky state five minutes from now
    skyState.date = skyState.date.setMinutes(skyState.date.getMinutes() + MINUTES_BETWEEN_UPDATES);
    skyState.year = date.getFullYear();
    skyState.month = date.getMonth() + 1;
    skyState.day = date.getDate();
    skyState.hour = date.getHours();
    skyState.minute = date.getMinutes();
    skyState.second = date.getSeconds() + (date.getMilliseconds() * 0.001);
    let finalStateBuffer = postObject.transferrableFinalStateBuffer;
    finalStateBuffer = updateSkyState(finalStateBuffer);

    //Once finished, return these memory objects back to the primary thread to
    //begin rotating our sky.
    self.webAssemblyWorker.postMessage({
      eventType: EVENT_INITIALIZATION_RESPONSE,
      transferrableInitialStateBuffer: initialStateBuffer,
      transferrableFinalStateBuffer: finalStateBuffer
    }, [initialStateBuffer, finalStateBuffer]);
  }

  return true;
};
