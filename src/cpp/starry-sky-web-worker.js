// This loads the wasm generated glue code
importScripts('starry-sky-module.js');

//
//Return of global variables - because this is actually it's own little world
//and so anarcho-communism still works perfectly fine... for now.
//
var wasmModule;
var initialize;
var skyState;
var wasmIsReady = false;
var skyStateIsReady = false;
var update;
var starrySkyCanvas;
var ctx;
var timeSinceLastUpdate = 1 / 12; //Assume we start off with 1/60 time times 5 frames per update
var ticksUntilUpdate = 5;
var updatesUntilInterpolateRAandDec = 100;
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

let attemptInitializiation = function(){
  if(wasmIsReady && skyStateIsReady){
    console.log('Initialize Starry Sky');
    let test1 = performance.now();
    let julianDay = Module._initializeStarrySky(
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
    let test2 = performance.now();
    console.log(test2 - test1);
    console.log(Module._getSunRightAscension());
    console.log(Module._getSunDeclination());
    console.log(Module);

    //Grab all values associated with our current sky state.

    //Respond to the main thread with the current data.

 }
};

onmessage = function(e){
  let postObject = e.data;
  if(postObject.tick){
    ticksUntilUpdate--;

    //Request the next image set from web assembly


    if(ticksUntilUpdate === 0){
      timeSinceLastUpdate = timeSinceLastUpdate - runningTime * skyState.timeMultiplier;

      //Send our canvas over for updating.
      self.postMessage({imageUpdateReady: true, canvas: starrySkyCanvas}, [starrySkyCanvas]);
    }
  }
  else if(postObject.returnCanvas){
    //Get our canvas back
    starrySkyCanvas = postObject.canvas;

    //Now reset our ticks
    ticksUntilUpdate = 5;
  }
  if(postObject.initializeSky){
    //Set the current date time.
    let dt = new Date(postObject.date);
    let seconds = dt.getSeconds() + (dt.getMilliseconds() * 0.001);

    //Initialize our 3D environment
    starrySkyCanvas = postObject.canvas;
    ctx = starrySkyCanvas.getContext('webgl2');

    console.log(`UTC Offset in worker: ${postObject.utcOffset}`);

    //Construct the state
    skyState = {
      latitude: postObject.latitude,
      longitude: postObject.longitude,
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      day: dt.getDate(),
      hour: dt.getHours(),
      minute: dt.getMinutes(),
      second: seconds,
      utcOffset: postObject.utcOffset,
      timeMultiplier: postObject.timeMultiplier
    };
    if(isNaN(skyState.minute)){
      throw 'Invalid date object. Perhaps use the date formate year-month-day hour:minute:second?';
    }
    timeSinceLastUpdate *= skyState.timeMultiplier;
    wasmModule = postObject.WASMModule;
    skyStateIsReady = true;

    attemptInitializiation();

    //When we first begin, it's a crazy panic to get everything rendered to screen as quickly as
    //possible.
    //self.postMessage({imageUpdateReady: true, canvas: starrySkyCanvas}, [starrySkyCanvas]);
  }

  return true;
};
