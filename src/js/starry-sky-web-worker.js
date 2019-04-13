//Copying from A-Frame so we can use Three.JS
let THREE = global.THREE = require('super-three');

// Allow cross-origin images to be loaded.

// This should not be on `THREE.Loader` nor `THREE.ImageUtils`.
// Must be on `THREE.TextureLoader`.
if (THREE.TextureLoader) {
  THREE.TextureLoader.prototype.crossOrigin = 'anonymous';
}

// This is for images loaded from the model loaders.
if (THREE.ImageLoader) {
  THREE.ImageLoader.prototype.crossOrigin = 'anonymous';
}

// In-memory caching for XHRs (for images, audio files, textures, etc.).
if (THREE.Cache) {
  THREE.Cache.enabled = true;
}

require('super-three/examples/js/loaders/GLTFLoader');  // THREE.GLTFLoader
THREE.GLTFLoader.prototype.crossOrigin = 'anonymous';
module.exports = THREE;

//
//Return of global variables - because this is actually it's own little world
//and so anarcho-communism still works perfectly fine... for now.
//
let wasmModule;
let initialize;
let skyState;
let wasmIsReady = false;
let skyStateIsReady = false;
let update;
let starrySkyCanvas;

let attemptInitializiation = function(){
  let julianDay = Module._initializeStarrySky(
    skyState.latitude,
    skyState.longitude,
    skyState.year,
    skyState.month,
    skyState.day,
    skyState.hour,
    skyState.minute,
    skyState.second,
    postObject.utcOffset
  );
}

onmessage = function(e){
  let postObject = e.data;
  if(postObject.requestUpdate){
    self.postMessage({imageUpdateReady: true, canvas: starrySkyCanvas}, [starrySkyCanvas]);
  }
  else if(postObject.returnCanvas){
    starrySkyCanvas = postObject.canvas;
  }
  else if(postObject.initializeSky){
    //Set the current date time.
    let dt = new Date(postObject.date);
    let seconds = dt.getSeconds() + (dt.getMilliseconds() * 0.001);

    //Initialize our 3D environment
    starrySkyCanvas = postObject.canvas;
    offscreenCanvas.getContext('webgl2');

    //Construct the state
    skyState = {
      latitude: postObject.latitude,
      longitude: postObject.longitude,
      year: dt.getYear(),
      month: dt.getMonth(),
      day: dt.getDate(),
      hour: dt.getHours(),
      minute: dt.getMinutes(),
      second: seconds,
      utcOffset: postObject.utcOffset
    };
    wasmModule = postObject.WASMModule;
    skyStateIsReady = true;

    //Initialize our WASM now and update it five minutes from now
    console.log("Three js in a web worker");
    console.log(THREE);
  }

  return true;
};

// This loads the wasm generated glue code
importScripts('../cpp/astr_algorithms/sky-state.js');
