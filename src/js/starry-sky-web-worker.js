//
//Return of global variables - because this is actually it's own little world
//and so anarcho-communism still works perfectly fine... for now.
//
var initializationTime;
var initializeSkyState;
var swapSkyState;
var getSkyStateNSecondsFromNow;

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

onmessage = function(e){
  let data = e.data;
  if(data.initializeSky){
    console.log('data inside of the web worker');
    console.log(data);
  }

  return true;
};
