// This loads the wasm generated glue code
importScripts('sky-state.js');

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

//Sun and Moon for t_0 and t_f (2*2) + Venus, Mars, Jupiter, Saturn (4*2) = 4+8=12
//Note that we only store the right ascension and declination
//azimuth and altitude are calculated during the interpolation process instead.
//const astronomicalLocations = new Float32Array(12);

//Interpolation constants for sun and moon (planets presumed effectively static and change only once a day
//when they are out of sight.
// const astronomicalInterpolationConstants = new Float32Array(12);
// const cameraViewBox = new Float32Array(4);

//These values remain relatively constant, some change by the 'minute' others should be updated
//maybe once a day or only when out of view and then every 4 hour or so...
//year, month, day, hour, minute
//const dateStatus = new UInt32Array(5);

//latitude, longitude, utc-offset-in-seconds, moonMeanLongitude, moonMeanElongation, moonsMeanAnomaly
//moonsArgumentOfLatitude, LongitudeOfTheAscendingNodeOfTheMoonsOrbit, sunsMeanAnomoly, sunsMeanLongitude
//const locationData = new Float32Array(10);

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
    console.log(julianDay);

    //Grab all values associated with our current sky state.

    //Respond to the main thread with the current data.

 }
};

onmessage = function(e){
  let postObject = e.data;
  if(postObject.initializeSky){
    let dt = new Date(postObject.date);
    let seconds = dt.getSeconds() + (dt.getMilliseconds() * 0.001);
    skyState = {
      latitude: postObject.latitude,
      longitude: postObject.longitude,
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      day: dt.getDate(),
      hour: dt.getHours(),
      minute: dt.getMinutes(),
      second: seconds,
      utcOffset: postObject.utcOffset
    };
    if(isNaN(skyState.minute)){
      throw 'Invalid date object. Perhaps use the date formate year-month-day hour:minute:second?';
    }
    wasmModule = postObject.WASMModule;
    skyStateIsReady = true;
    attemptInitializiation();
  }

  return true;
};
