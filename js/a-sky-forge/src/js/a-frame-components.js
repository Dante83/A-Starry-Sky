// The mesh mixin provides common material properties for creating mesh-based primitives.
// This makes the material component a default component and maps all the base material properties.
var meshMixin = AFRAME.primitives.getMeshMixin();

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
      "sky-time": `timeOffset: ${Math.round(dynamicSkyEntityMethods.getSecondOfDay())}; utcOffset: 0; timeMultiplier: 1.0; dayOfTheYear: ${Math.round(dynamicSkyEntityMethods.getDayOfTheYear())}; year: ${Math.round(dynamicSkyEntityMethods.getYear())}`
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
    timeOffset: {type: 'number', default: dynamicSkyEntityMethods.getSecondOfDay()},
    timeMultiplier: {type: 'number', default: 1.0},
    utcOffset: {type: 'int', default: 0},
    dayOfTheYear: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getDayOfTheYear())},
    month: {type: 'int', default: -1},
    day: {type: 'int', default: -1},
    year: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getYear())},
    moonTexture: {type: 'map', default: '../images/moon-dif-512.png'},
    moonNormalMap: {type: 'map', default: '../images/moon-nor-512-padded.gif'},
    starMask: {type: 'map', default:'../images/padded-starry-sub-data-0.png'},
    starRas: {type: 'map', default:'../images/padded-starry-sub-data-1.png'},
    starDecs: {type: 'map', default:'../images/padded-starry-sub-data-2.png'},
    starMags: {type: 'map', default:'../images/padded-starry-sub-data-3.png'},
    starColors: {type: 'map', default:'../images/padded-starry-sub-data-4.png'},
  },

  init: function(){
    if(this.data.month != -1 && this.data.day != -1){
      this.data.dayOfTheYear = dynamicSkyEntityMethods.getDayOfTheYearFromYMD(this.data.year, this.data.month, this.data.day);
    }

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

    //Set up our screen width
    this.el.components.material.material.uniforms.u_resolution.value.set(window.screen.width, window.screen.height);

    //Hook up our interpolator and set the various uniforms we wish to track and
    //interpolate during each frame.
    this.currentTime = dynamicSkyEntityMethods.getNowFromData(this.data);
    this.initializationTime = new Date(this.currentTime.getTime());
    //Update at most, once a second (if more than five minutes normal time pass in that second)
    if(this.data.timeMultiplier != 0.0){
      this.hasLinearInterpolation = true;
      var interpolationLengthInSeconds = 300.0 > this.data.timeMultiplier ? 300.0 / this.data.timeMultiplier : 1.0;

      this.interpolator = new aSkyInterpolator(this.initializationTime, this.data.timeMultiplier, interpolationLengthInSeconds, this.dynamicSkyObj, this.data);

      //All of our interpolation hookups occur here
      this.interpolator.setLinearInterpolationForScalar('sunAzimuth', ['sunPosition', 'azimuth'], false,);
      this.interpolator.setLinearInterpolationForScalar('sunAltitude', ['sunPosition', 'altitude'], false);
      this.interpolator.setAngularLinearInterpolationForScalar('localSiderealTime', ['localApparentSiderealTimeForUniform'], false);

      this.interpolator.setSLERPFor3Vect('moonMappingTangentSpaceSunlight', ['moonMappingTangentSpaceSunlight'], false);
      this.interpolator.setSLERPFor3Vect('moonMappingPosition', ['moonMappingPosition'], false);
      this.interpolator.setSLERPFor3Vect('moonMappingTangent', ['moonMappingTangent'], false);
      this.interpolator.setSLERPFor3Vect('moonMappingBitangent', ['moonMappingBitangent'], false);

      //Once all of these are set up - prime the buffer the first time.
      this.interpolator.primeBuffer();
    }
    else{
      this.hasLinearInterpolation = false;
    }
  },

  update: function () {
    this.fractionalSeconds = 0;
  },

  tick: function (time, timeDelta) {
    //Standard Sky Animations
    this.el.components.material.material.uniforms.uTime.value = time;

    //Interpolated Sky Position Values
    if(this.hasLinearInterpolation){
      this.currentTime.setTime(this.initializationTime.getTime() + time * this.data.timeMultiplier);

      var interpolatedValues = this.interpolator.getValues(this.currentTime);

      this.el.components.material.material.uniforms.sunPosition.value.set(interpolatedValues.sunAzimuth, interpolatedValues.sunAltitude);
      this.el.components.material.material.uniforms.localSiderealTime.value = interpolatedValues.localSiderealTime;

      var mtss = interpolatedValues.moonMappingTangentSpaceSunlight;
      var mp = interpolatedValues.moonMappingPosition;
      var mmt = interpolatedValues.moonMappingTangent;
      var mmb = interpolatedValues.moonMappingBitangent;

      this.el.components.material.material.uniforms.moonTangentSpaceSunlight.value.set(mtss.x, mtss.y, mtss.z);
      this.el.components.material.material.uniforms.moonPosition.value.set(mp.x, mp.y, mp.z);
      this.el.components.material.material.uniforms.moonTangent.value.set(mmt.x, mmt.y, mmt.z);
      this.el.components.material.material.uniforms.moonBitangent.value.set(mmb.x, mmb.y, mmb.z);
    }
  }
});
