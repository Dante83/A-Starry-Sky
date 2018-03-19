// The mesh mixin provides common material properties for creating mesh-based primitives.
// This makes the material component a default component and maps all the base material properties.
var meshMixin = AFRAME.primitives.getMeshMixin();

var dynamicSkyEntityMethods = {
  currentDate: new Date(),
  getDayOfTheYear: function(){
    var month = this.currentDate.getMonth();
    var dayOfThisMonth = this.currentDate.getDate();
    var year = this.currentDate.getYear();
    var daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var currentDayOfYear = 0;
    for(var m = 0; m < month; m++){
      currentDayOfYear += daysInEachMonth[m];
    }
    currentDayOfYear += dayOfThisMonth;
    return currentDayOfYear.toString();
  },

  getSecondOfDay: function(){
    return (this.currentDate.getHours() * 3600 + this.currentDate.getMinutes() * 60 + this.currentDate.getSeconds()).toString();
  },

  getYear: function(){
    return this.currentDate.getFullYear().toString();
  },
}

//Create primitive data associated with this, based off a-sky
//https://github.com/aframevr/aframe/blob/master/src/extras/primitives/primitives/a-sky.js
AFRAME.registerPrimitive('a-sky-forge', AFRAME.utils.extendDeep({}, meshMixin, {
    // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
    defaultComponents: {
      geometry: {
        primitive: 'sphere',
        radius: 5000,
        segmentsWidth: 64,
        segmentsHeight: 32
      },
      scale: '-1, 1, 1',
      "geo-coordinates": 'lat: 37.7749; long: -122.4194',
      "sky-time": `timeOffset: ${Math.round(dynamicSkyEntityMethods.getSecondOfDay())}; utcOffset: 0; dayPeriod: 86400; dayOfTheYear: ${Math.round(dynamicSkyEntityMethods.getDayOfTheYear())}; yearPeriod: 365; year: ${Math.round(dynamicSkyEntityMethods.getYear())}`,
    }
  }
));

//Register associated components
AFRAME.registerComponent('geo-coordinates', {
  schema: {
    lat: {type: 'number', default: 37.7749},
    long: {type: 'number', default: -122.4194}
  }
});

AFRAME.registerComponent('sky-time', {
  fractionalSeconds: 0,

  dependencies: ['geo-coordinates', 'a-sky-forge'],

  schema: {
    timeOffset: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getSecondOfDay())},
    utcOffset: {type: 'int', default: 0},
    dayPeriod: {type: 'number', default: 86400.0},
    dayOfTheYear: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getDayOfTheYear())},
    yearPeriod: {type: 'number', default: 365.0},
    year: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getYear())},
    moonTexture: {type: 'map', default: '../images/moon-dif-512.png'},
    moonNormalMap: {type: 'map', default: '../images/moon-nor-512.png'},
    starMask: {type: 'map', default:'../images/padded-starry-sub-data-0.png'},
    starRas: {type: 'map', default:'../images/padded-starry-sub-data-1.png'},
    starDecs: {type: 'map', default:'../images/padded-starry-sub-data-2.png'},
    starMags: {type: 'map', default:'../images/padded-starry-sub-data-3.png'},
    starColors: {type: 'map', default:'../images/padded-starry-sub-data-4.png'},
  },

  init: function(){
    this.lastCameraDirection = {x: 0.0, y: 0.0, z: 0.0};
    this.dynamicSkyObj = aDynamicSky;
    this.dynamicSkyObj.latitude = this.el.components['geo-coordinates'].data.lat;
    this.dynamicSkyObj.longitude = this.el.components['geo-coordinates'].data.long;
    this.dynamicSkyObj.update(this.data);
    this.el.components.material.material.uniforms.sunPosition.value.set(this.dynamicSkyObj.sunPosition.azimuth, this.dynamicSkyObj.sunPosition.altitude);

    //Load our normal maps for the moon
    var textureLoader = new THREE.TextureLoader();
    var moonTexture = textureLoader.load(this.data.moonTexture);
    var moonNormalMap = textureLoader.load(this.data.moonNormalMap);

    //
    //Note: We might want to min map our moon texture and normal map so that
    //Note: we can get better texture results in our view
    //

    //Populate this data into an array because we're about to do some awesome stuff
    //to each texture with Three JS.
    //Note that,
    //We use a nearest mag and min filter to avoid fuzzy pixels, which kill good data
    //We use repeat wrapping on wrap s, to horizontally flip to the other side of the image along RA
    //And we use mirrored mapping on wrap w to just reflect back, although internally we will want to subtract 0.5 from this.
    //we also use needs update to make all this work as per, https://codepen.io/SereznoKot/pen/vNjJWd
    var starMask = textureLoader.load(this.data.starMask);
    starMask.magFilter = THREE.NearestFilter;
    starMask.minFilter = THREE.NearestFilter;
    starMask.wrapS = THREE.RepeatWrapping;
    starMask.wrapW = THREE.MirroredRepeatWrapping;
    starMask.needsUpdate = true;
    var starRas = textureLoader.load(this.data.starRas);
    starRas.magFilter = THREE.NearestFilter;
    starRas.minFilter = THREE.NearestFilter;
    starRas.wrapS = THREE.RepeatWrapping;
    starRas.wrapW = THREE.MirroredRepeatWrapping;
    starRas.needsUpdate = true;
    var starDecs = textureLoader.load(this.data.starDecs);
    starDecs.magFilter = THREE.NearestFilter;
    starDecs.minFilter = THREE.NearestFilter;
    starDecs.wrapS = THREE.RepeatWrapping;
    starDecs.wrapW = THREE.MirroredRepeatWrapping;
    starDecs.needsUpdate = true;
    var starMags = textureLoader.load(this.data.starMags);
    starMags.magFilter = THREE.NearestFilter;
    starMags.minFilter = THREE.NearestFilter;
    starMags.wrapS = THREE.RepeatWrapping;
    starMags.wrapW = THREE.MirroredRepeatWrapping;
    starMags.needsUpdate = true;
    var starColors = textureLoader.load(this.data.starColors);
    starColors.magFilter = THREE.NearestFilter;
    starColors.minFilter = THREE.NearestFilter;
    starColors.wrapS = THREE.RepeatWrapping;
    starColors.wrapW = THREE.MirroredRepeatWrapping;
    starColors.needsUpdate = true;

    //We only load our textures once upon initialization
    this.el.components.material.material.uniforms.moonTexture.value = moonTexture;
    this.el.components.material.material.uniforms.moonNormalMap.value = moonNormalMap;
    this.el.components.material.material.uniforms.starMask.value = starMask;
    this.el.components.material.material.uniforms.starRas.value = starRas;
    this.el.components.material.material.uniforms.starDecs.value = starDecs;
    this.el.components.material.material.uniforms.starMags.value = starMags;
    this.el.components.material.material.uniforms.starColors.value = starColors;
  },

  update: function () {
    this.fractionalSeconds = 0;
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
    this.fractionalSeconds += timeDelta;

    //Animate our world, passing the time
    this.el.components.material.material.uniforms.uTime.value = time;

    //Only update the sky every five seconds
    if(this.fractionalSeconds > 1000){
      //March time forward by another second
      this.data.timeOffset += Math.floor(this.fractionalSeconds / 1000);
      this.fractionalSeconds = this.fractionalSeconds % 1000;

      //Update our camera specs - we should get the active cameras fov and
      //transform this into a horizontal and vertical fov and get the sky
      //angle from the currently pointed direction.
      //Note that current our camera has a vertical FOV of 80, while Occulus is supposed to
      //have a vertical FOV of 90 and a vertical FOV of about 80.
      //var verticalFOV = camera.fov * (2.0 * Math.PI / 360.0);
      //var horizontalFOV = 2.0 * Math.atan(camera.aspect * Math.tan(verticalFOV / 2.0));
      var selectedCanvas = document.getElementsByClassName('a-canvas')[0]; //We presume there should only be one canvas in A-Frame.

      //
      //NOTE: For some reason, these are giving really screwed up widths and heights for our resolution
      //This might have to do with VR - we should check this out later.
      //
      this.el.components.material.material.uniforms.u_resolution.value.set(window.screen.width, window.screen.height);

      //Update our data for the dynamic sky object
      //For method go to line 567
      this.dynamicSkyObj.update(this.data);

      //TODO: This is giving the opposite phase of the moon than I should have
      //TODO: It also still goes completely black at sunrise and sunset.

      var lunarAzimuth = this.dynamicSkyObj.moonPosition.azimuth;
      var lunarAltitude = this.dynamicSkyObj.moonPosition.altitude;
      //lunarAltitude = lunarAltitude < 0.0 ? lunarAltitude + Math.PI * 2.0 : solarAltitude;
      var solarAzimuth = this.dynamicSkyObj.sunPosition.azimuth;
      var solarAltitude = this.dynamicSkyObj.sunPosition.altitude;
      solarAltitude = solarAltitude <= 0.0 ? solarAltitude + Math.PI * 2.0 : solarAltitude;

      this.el.components.material.material.uniforms.sunPosition.value.set(solarAzimuth, solarAltitude);
      this.el.components.material.material.uniforms.moonAzAltAndParallacticAngle.value.set(lunarAzimuth, lunarAltitude, 0.0);

      //Set the sidereal time for our calculation of right ascension and declination of each point in the sky
      this.el.components.material.material.uniforms.localSiderealTime.value = this.dynamicSkyObj.localSiderealTime;

      var moonMappingData = this.dynamicSkyObj.getMoonTangentSpaceSunlight(lunarAzimuth, lunarAltitude, solarAzimuth, solarAltitude);
      var moonTangentSpaceSunlight = moonMappingData.moonTangentSpaceSunlight;
      var moonPosition = moonMappingData.moonPosition;
      var moonTangent = moonMappingData.moonTangent;
      var moonBitangent = moonMappingData.moonBitangent;

      this.el.components.material.material.uniforms.moonTangentSpaceSunlight.value.set(moonTangentSpaceSunlight.x, moonTangentSpaceSunlight.y, moonTangentSpaceSunlight.z);
      this.el.components.material.material.uniforms.moonPosition.value.set(moonPosition.x, moonPosition.y, moonPosition.z);
      this.el.components.material.material.uniforms.moonTangent.value.set(moonTangent.x, moonTangent.y, moonTangent.z);
      this.el.components.material.material.uniforms.moonBitangent.value.set(moonBitangent.x, moonBitangent.y, moonBitangent.z);

      /*var starLocations = [];
      this.dynamicSkyObj.stars.forEach(function(star) {
        starLocations.push({x: star.azimuth, y: star.altitude});
      });
      //this.el.components.material.material.uniforms.brightLimbOfMoon.value.set(starLocations);*/

      if(this.schema.timeOffset > this.schema.dayPeriod){
        //It's a new day!
        this.schema.dayOfTheYear += 1;
        this.schema.timeOffset = this.schema.timeOffset % this.schema.dayPeriod;
        if(this.schema.dayOfTheYear > this.schema.yearPeriod){
          //Reset everything!
          this.schema.dayOfTheYear = 0;
          this.schema.year += 1;
        }
      }
    }
  }
});
