var dynamicSkyEntityMethods = {
  currentDate: new Date(),
  getDayOfTheYear: function(){
    var month = this.currentDate.getMonth() + 1;
    var dayOfThisMonth = this.currentDate.getDate();
    var year = this.currentDate.getFullYear();

    return this.getDayOfTheYearFromYMD(year, month, dayOfThisMonth);
  },

  getNowFromData: function(data){
    //Initialize our day
    var outDate = new Date(data.year, 0);
    outDate.setDate(data.dayOfTheYear);
    outDate.setSeconds(data.timeOffset);

    return new Date(outDate);
  },

  getDayOfTheYearFromYMD: function(year, month, day){
    var daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if(year == 0.0 || (year % 4 == 0.0) ){
      daysInEachMonth[1] = 29;
    }
    var currentdayOfTheYear = 0;

    for(var m = 0; m < (month - 1); m++){
      currentdayOfTheYear += daysInEachMonth[m];
    }
    currentdayOfTheYear += day;

    return currentdayOfTheYear.toString();
  },

  getIsLeapYear: function(year){
    if(((year % 4 == 0 || year == 0) && (((year % 100 == 0) && (year % 400 == 0)) || (year % 100 != 0)))){
      return true;
    }
    return false;
  },

  getSecondOfDay: function(){
    var midnightOfPreviousDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate(), 0,0,0);
    return (this.currentDate - midnightOfPreviousDay) / 1000.0;
  },

  getYear: function(){
    return Math.trunc(this.currentDate.getFullYear().toString());
  },
}

//For Mocha testing




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
      "sky-params": 'luminance: 1.0; turbidity: 2.0; rayleigh: 1.0; mieCoefficient: 0.005; mieDirectionalG: 0.8;',
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

var skyParamsUniformsData = {turbidity: 2.0, rayleigh: 1.0, mieCoefficient: 0.005, angularDiameterOfTheMoon: 0.025, angularDiameterOfTheSun: 0.026};
AFRAME.registerComponent('sky-params', {
  dependencies: ['a-sky-forge'],
  schema:{
    luminance: { type: 'number', default: 1.0, max: 2.0, min: 0.0, is: 'uniform' },
    turbidity: { type: 'number', default: 2.0, max: 20.0, min: 0.0, is: 'uniform' },
    rayleigh: { type: 'number', default: 1.0, max: 4.0, min: 0.0, is: 'uniform' },
    mieCoefficient: { type: 'number', default: 0.005, min: 0.0, max: 0.1, is: 'uniform' },
    mieDirectionalG: { type: 'number', default: 0.8, min: 0.0, max: 1, is: 'uniform' },
    angularDiameterOfTheSun: { type: 'number', default: 0.030, is: 'uniform' },
    angularDiameterOfTheMoon: { type: 'number', default: 0.030, is: 'uniform' }
  },

  init: function(){
    this.material = this.el.getOrCreateObject3D('mesh').material = skyShaderMaterial;
    skyParamsUniformsData.turbidity = this.data.turbidity;
    skyParamsUniformsData.rayleigh = this.data.rayleigh;
    sunShaderMaterial.uniforms['rayleigh'].value = this.data.rayleigh;
    skyShaderMaterial.uniforms['rayleigh'].value = this.data.rayleigh;
    skyParamsUniformsData.mieCoefficient = this.data.mieCoefficient;
    sunShaderMaterial.uniforms['luminance'].value = this.data.luminance;
    moonShaderMaterial.uniforms['luminance'].value = this.data.luminance;
    skyShaderMaterial.uniforms['luminance'].value = this.data.luminance;
    sunShaderMaterial.uniforms['mieDirectionalG'].value = this.data.mieDirectionalG;
    moonShaderMaterial.uniforms['mieDirectionalG'].value = this.data.mieDirectionalG;
    skyShaderMaterial.uniforms['mieDirectionalG'].value = this.data.mieDirectionalG;
    sunShaderMaterial.uniforms['angularDiameterOfTheSun'].value = this.data.angularDiameterOfTheSun;
    skyParamsUniformsData.angularDiameterOfTheSun = this.data.angularDiameterOfTheSun;
    skyParamsUniformsData.angularDiameterOfTheMoon = this.data.angularDiameterOfTheMoon;
  }
});

AFRAME.registerComponent('sky-time', {
  fractionalSeconds: 0,
  moon: null,
  ambientLight: null,
  dependencies: ['geo-coordinates', 'a-sky-forge'],
  schema: {
    timeOffset: {type: 'number', default: dynamicSkyEntityMethods.getSecondOfDay()},
    timeMultiplier: {type: 'number', default: 1.0},
    utcOffset: {type: 'int', default: 0},
    dayOfTheYear: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getDayOfTheYear())},
    month: {type: 'int', default: -1},
    day: {type: 'int', default: -1},
    year: {type: 'int', default: Math.round(dynamicSkyEntityMethods.getYear())},
    imgDir: {type: 'string', default: '../images/'},
    sunTexture: {type: 'map', default: 'sun-tex-256.png'},
    moonTexture: {type: 'map', default: 'moon-tex-512.png'},
    moonNormalMap: {type: 'map', default: 'moon-nor-512.png'},
    starIndexer: {type: 'map', default:'star-index.png'},
    starData: {type: 'map', default:'star-data.png'},
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

    //Load our normal maps for the moon
    let textureLoader = new THREE.TextureLoader();
    let sunTextureDir = this.data.imgDir + this.data.sunTexture;
    let moonTextureDir = this.data.imgDir + this.data.moonTexture;
    let moonNormalMapDir = this.data.imgDir + this.data.moonNormalMap;
    let skyDomeRadius = this.el.components.geometry.data.radius;
    let sceneRef = this.el.sceneEl.object3D;
    this.moon = new Moon(moonTextureDir, moonNormalMapDir, skyDomeRadius, sceneRef, textureLoader, skyParamsUniformsData.angularDiameterOfTheMoon);
    this.sun = new Sun(skyDomeRadius, sceneRef, sunTextureDir, textureLoader);

    //Populate this data into an array because we're about to do some awesome stuff
    //to each texture with Three JS.
    //Note that,
    //We use a nearest mag and min filter to avoid fuzzy pixels, which kill good data
    //We use repeat wrapping on wrap s, to horizontally flip to the other side of the image along RA
    //And we use mirrored mapping on wrap w to just reflect back, although internally we will want to subtract 0.5 from this.
    //we also use needs update to make all this work as per, https://codepen.io/SereznoKot/pen/vNjJWd
    var starIndexer = textureLoader.load(this.data.imgDir + this.data.starIndexer, function(starIndexer){
      starIndexer.magFilter = THREE.NearestFilter;
      starIndexer.minFilter = THREE.NearestFilter;
      starIndexer.wrapS = THREE.RepeatWrapping;
      starIndexer.wrapW = THREE.MirroredRepeatWrapping;
      starIndexer.needsUpdate = true;
    });

    var starData = textureLoader.load(this.data.imgDir + this.data.starData, function(starData){
      starData.magFilter = THREE.NearestFilter;
      starData.minFilter = THREE.NearestFilter;
      starData.wrapS = THREE.RepeatWrapping;
      starData.wrapW = THREE.MirroredRepeatWrapping;
      starData.needsUpdate = true;
    });

    //Create our Bayer Matrix
    //Thanks to http://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/
    let data = [
    0, 32,  8, 40,  2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44,  4, 36, 14, 46,  6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43,  1, 33,  9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47,  7, 39, 13, 45,  5, 37,
    63, 31, 55, 23, 61, 29, 53, 21];

    let gl = this.el.sceneEl.renderer.getContext();
    let bayerImage = gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array(data))

    var bayerMatrix = textureLoader.load(bayerImage, function(){
      starColors.magFilter = THREE.NearestFilter;
      starColors.minFilter = THREE.NearestFilter;
      starColors.wrapS = THREE.RepeatWrapping;
      starColors.wrapW = THREE.RepeatWrapping;
      starColors.needsUpdate = true;
    });

    //We only load our textures once upon initialization
    skyShaderMaterial.uniforms['starIndexer'].value = starIndexer;
    skyShaderMaterial.uniforms['starData'].value = starData;
    skyShaderMaterial.uniforms['bayerMatrix'].value = bayerMatrix;
    sunShaderMaterial.uniforms['bayerMatrix'].value = bayerMatrix;
    moonShaderMaterial.uniforms['bayerMatrix'].value = bayerMatrix;

    //Initialize our ambient lighting
    this.ambientLight = new THREE.AmbientLight(0x000000);
    sceneRef.add(this.ambientLight);

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

      this.interpolator.setLinearInterpolationForScalar('moonAzimuth', ['moonPosition', 'azimuth'], false,);
      this.interpolator.setLinearInterpolationForScalar('moonAltitude', ['moonPosition', 'altitude'], false);
      this.interpolator.setLinearInterpolationForScalar('moonEE', ['moonEE'], false);

      this.interpolator.setSLERPFor3Vect('sunXYZPosition', ['sunXYZPosition'], false);
      this.interpolator.setSLERPFor3Vect('moonXYZPosition', ['moonXYZPosition'], false);

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
    skyShaderMaterial.uniforms['uTime'].value = time;

    //Interpolated Sky Position Values
    if(this.hasLinearInterpolation){
      this.currentTime.setTime(this.initializationTime.getTime() + time * this.data.timeMultiplier);

      let interpolatedValues = this.interpolator.getValues(this.currentTime);
      skyShaderMaterial.uniforms['localSiderealTime'].value = interpolatedValues.localSiderealTime;

      //Hopefully SLERP is my answer for avoiding moon novas in the middle of the night
      let sXYZ = interpolatedValues.sunXYZPosition;
      let mXYZ = interpolatedValues.moonXYZPosition;

      //
      //update our uniforms
      //
      let rayleigh = skyParamsUniformsData.rayleigh;
      let mieCoefficient = skyParamsUniformsData.mieCoefficient;
      let sunFade = 1.0 - Math.min(Math.max(1.0 - Math.exp(sXYZ.z), 0.0), 1.0);
      sunShaderMaterial.uniforms['sunFade'].value = sunFade;
      moonShaderMaterial.uniforms['sunFade'].value = sunFade;
      skyShaderMaterial.uniforms['sunFade'].value = sunFade;
      let moonFade = 1.0 - Math.min(Math.max(1.0 - Math.exp(mXYZ.z), 0.0), 1.0);
      sunShaderMaterial.uniforms['moonFade'].value = moonFade;
      moonShaderMaterial.uniforms['moonFade'].value = moonFade;
      skyShaderMaterial.uniforms['moonFade'].value = moonFade;
      let rayleighCoefficientOfSun = rayleigh + sunFade - 1.0;
      moonShaderMaterial.uniforms['rayleighCoefficientOfSun'].value = rayleighCoefficientOfSun;
      skyShaderMaterial.uniforms['rayleighCoefficientOfSun'].value = rayleighCoefficientOfSun;
      let rayleighCoefficientOfMoon = rayleigh + moonFade - 1.0;
      moonShaderMaterial.uniforms['rayleighCoefficientOfMoon'].value = rayleighCoefficientOfMoon;
      skyShaderMaterial.uniforms['rayleighCoefficientOfMoon'].value =rayleighCoefficientOfMoon;

      //
      //Implement solar ecclipses
      //
      let solarEcclipseModifier = 1.0;
      //Get the haversine distance between the sun and moon
      //https://gist.github.com/rochacbruno/2883505
      let sunAz = Math.atan2(sXYZ.z, sXYZ.x) + Math.PI;
      let sunAlt = (Math.PI * 0.5) - Math.acos(sXYZ.y);
      let moonAz = Math.atan2(mXYZ.z, mXYZ.x) + Math.PI;
      let moonAlt = (Math.PI * 0.5) - Math.acos(mXYZ.y);
      let modifiedSunAz = sunAz - Math.PI;
      let modifiedMoonAz = moonAz - Math.PI;
      let dlat = modifiedMoonAz-modifiedSunAz;
      let dlon = moonAlt-sunAlt;
      let haversine_a = Math.sin(dlat/2.0) * Math.sin(dlat/2.0) + Math.cos(modifiedSunAz) * Math.cos(modifiedMoonAz) * Math.sin(dlon/2.0) * Math.sin(dlon/2.0);
      let haversineDistance = 2.0 * Math.atan2(Math.sqrt(haversine_a), Math.sqrt(1.0-haversine_a));

      //Now to determine the ecclipsed area
      //https://www.xarg.org/2016/07/calculate-the-intersection-area-of-two-circles/
      let sunRadius = 0.5 * Math.sin(skyParamsUniformsData.angularDiameterOfTheSun);
      let moonRadius = 0.5 * Math.sin(skyParamsUniformsData.angularDiameterOfTheMoon);
      const sunRadiusSquared = sunRadius * sunRadius;
      const moonRadiusSquared  = moonRadius * moonRadius;
      if(haversineDistance < (sunRadius + moonRadius)){
          x = (sunRadiusSquared - moonRadiusSquared + haversineDistance * haversineDistance)/(2.0 * haversineDistance);
          z = x * x;
          y = Math.sqrt(sunRadiusSquared - z);

          let ecclipsedArea;
          if (haversineDistance < Math.abs(moonRadius - sunRadius)) {
            ecclipsedArea = Math.PI * Math.min(sunRadiusSquared, moonRadiusSquared);
          }
          else{
            ecclipsedArea = sunRadiusSquared * Math.asin(y/sunRadius) + moonRadiusSquared * Math.asin(y/moonRadius) - y * (x + Math.sqrt(z + moonRadiusSquared - sunRadiusSquared));
          }
          let surfaceAreaOfSun = Math.PI * sunRadiusSquared;
          solarEcclipseModifier = Math.max(Math.min((surfaceAreaOfSun - ecclipsedArea)/surfaceAreaOfSun, 1.0), 0.0);
          solarEcclipseModifier = Math.pow(solarEcclipseModifier, 2.0);
      }

      //
      //Calculate Total Mie
      //
      const lambda = new THREE.Vector3(680e-9, 550e-9, 450e-9);
      const k = new THREE.Vector3(0.686, 0.678, 0.666);
      const piTimes2 = 2.0 * Math.PI;
      let c = (0.2 * skyParamsUniformsData.turbidity) * 10.0e-18;
      let totalMie = new THREE.Vector3(piTimes2, piTimes2, piTimes2);
      totalMie.divide(lambda);
      totalMie.multiply(totalMie); // raise to the power of v - 2.0 where v is 4.0, so square it
      totalMie.multiply(k).multiplyScalar(0.434 * c * Math.PI);

      let betaM = totalMie.multiplyScalar(mieCoefficient);
      sunShaderMaterial.uniforms['betaM'].value = betaM;
      moonShaderMaterial.uniforms['betaM'].value = betaM;
      skyShaderMaterial.uniforms['betaM'].value = betaM;
      const up = new THREE.Vector3(0.0, 1.0, 0.0);
      let dotOfMoonDirectionAndUp = mXYZ.dot(up);
      let dotOfSunDirectionAndUp = sXYZ.dot(up);
      let cutoffAngle = Math.PI / 1.95;
      let steepness = 1.5;
      let moonE = interpolatedValues.moonEE * Math.max(0.0, 1.0 - Math.exp(-((cutoffAngle - Math.acos(dotOfMoonDirectionAndUp))/steepness)));
      sunShaderMaterial.uniforms['moonE'].value = moonE;
      moonShaderMaterial.uniforms['moonE'].value = moonE;
      skyShaderMaterial.uniforms['moonE'].value = moonE;
      let sunE = 1000.0 * Math.max(0.0, 1.0 - Math.exp(-((cutoffAngle - Math.acos(dotOfSunDirectionAndUp))/steepness))) * solarEcclipseModifier;
      sunShaderMaterial.uniforms['sunE'].value = sunE;
      moonShaderMaterial.uniforms['sunE'].value = sunE;
      skyShaderMaterial.uniforms['sunE'].value = sunE;
      //These are used to fade our objects out a bit during the day as our eyes are contracted due to higher light levels
      //The numbers are basically ad hoc to make them feel 'about right'
      let sunFadeTimesSunE = sunFade * sunE;
      let exposureCoeficient = -(sunFadeTimesSunE + moonFade * moonE);
      moonShaderMaterial.uniforms['moonExposure'].value =  Math.exp(exposureCoeficient * 0.0025);
      skyShaderMaterial.uniforms['starsExposure'].value =  Math.exp(exposureCoeficient * 0.05);
      let linMoonCoefficient2 = Math.min(Math.max(Math.pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0),1.0);
      sunShaderMaterial.uniforms['linMoonCoefficient2'].value =linMoonCoefficient2;
      moonShaderMaterial.uniforms['linMoonCoefficient2'].value =linMoonCoefficient2;
      skyShaderMaterial.uniforms['linMoonCoefficient2'].value = linMoonCoefficient2;
      let linSunCoefficient2 = Math.min(Math.max(Math.pow(1.0-dotOfSunDirectionAndUp,5.0),0.0),1.0);
      sunShaderMaterial.uniforms['linSunCoefficient2'].value =linSunCoefficient2
      moonShaderMaterial.uniforms['linSunCoefficient2'].value =linSunCoefficient2
      skyShaderMaterial.uniforms['linSunCoefficient2'].value = linSunCoefficient2;
      sunShaderMaterial.uniforms['sunXYZPosition'].value.set(sXYZ.x, sXYZ.y, sXYZ.z);
      moonShaderMaterial.uniforms['sunXYZPosition'].value.set(sXYZ.x, sXYZ.y, sXYZ.z);
      skyShaderMaterial.uniforms['sunXYZPosition'].value.set(sXYZ.x, sXYZ.y, sXYZ.z);
      const simplifiedRayleigh = new THREE.Vector3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);
      let betaRSun = simplifiedRayleigh.clone().multiplyScalar(rayleigh - (1.0 - sunFade));
      sunShaderMaterial.uniforms['betaRSun'].value.set(betaRSun.x, betaRSun.y, betaRSun.z);
      moonShaderMaterial.uniforms['betaRSun'].value.set(betaRSun.x, betaRSun.y, betaRSun.z);
      skyShaderMaterial.uniforms['betaRSun'].value.set(betaRSun.x, betaRSun.y, betaRSun.z);
      let betaRMoon = simplifiedRayleigh.clone().multiplyScalar(rayleigh - (1.0 - moonFade));
      sunShaderMaterial.uniforms['betaRMoon'].value.set(betaRMoon.x, betaRMoon.y, betaRMoon.z);
      moonShaderMaterial.uniforms['betaRMoon'].value.set(betaRMoon.x, betaRMoon.y, betaRMoon.z);
      skyShaderMaterial.uniforms['betaRMoon'].value.set(betaRMoon.x, betaRMoon.y, betaRMoon.z);
      sunShaderMaterial.uniforms['moonXYZPosition'].value.set(mXYZ.x,mXYZ.y,mXYZ.z);
      moonShaderMaterial.uniforms['moonXYZPosition'].value.set(mXYZ.x,mXYZ.y,mXYZ.z);
      skyShaderMaterial.uniforms['moonXYZPosition'].value.set(mXYZ.x,mXYZ.y,mXYZ.z);

      this.sun.update(sXYZ, betaRSun, betaM, sunE, sunFade);
      lunarIntensityModifier = Math.exp(exposureCoeficient * 0.1);
      this.moon.update(mXYZ, sXYZ, moonAz, moonAlt, betaRMoon, betaM, moonE, moonFade, lunarIntensityModifier, sunFadeTimesSunE);

      let combinedColorBase = this.sun.ambientColor.clone().multiply(this.sun.ambientColor).add(this.moon.ambientColor.clone().multiply(this.moon.ambientColor));
      combinedColorBase.x = Math.sqrt(combinedColorBase.x);
      combinedColorBase.y = Math.sqrt(combinedColorBase.y);
      combinedColorBase.z = Math.sqrt(combinedColorBase.z);
      let combinedIntensity = Math.sqrt(this.sun.ambientIntensity * this.sun.ambientIntensity + this.moon.ambientIntensity * this.moon.ambientIntensity);
      this.ambientLight.color.setRGB(combinedColorBase.x, combinedColorBase.y, combinedColorBase.z);
      this.ambientLight.intensity = Math.max(combinedIntensity, 0.02);
    }
  }
});



//
//TODO: Simplify equations, implement Hoerners Method and maybe save some variables
//TODO: Seperate out our various astronomical bodies into their own Javascript objects and files
//We don't need a 500 LOC object here if we can avoid it and seperate concerns to the appropriate objects.
//This is also keeping in line with object oriented code which is kind of a big deal.
//
var aDynamicSky = {
  latitude : 0.0,
  longitude : 0.0,
  radLatitude : 0.0,
  radLongitude : 0.0,
  year : 0.0,
  dayOfTheYear : 0.0,
  hourInDay : 0.0,
  julianDay : 0.0,
  sunPosition : null,
  deg2Rad: Math.PI / 180.0,

  update: function(skyData){
    this.radLatitude = this.latitude * this.deg2Rad;
    this.radLongitude = this.longitude * this.deg2Rad;
    this.year = skyData.year;
    this.daysInYear = this.getDaysInYear();
    this.dayOfTheYear = skyData.dayOfTheYear;

    //Get the time at Greenwhich
    var utcOffsetInSeconds = skyData.utcOffset != null ? skyData.utcOffset * 3600 : (240 * this.longitude);
    var utcDate = new Date(this.year, 0);
    utcDate.setSeconds( (this.dayOfTheYear - 1.0) * 86400 + skyData.timeOffset + utcOffsetInSeconds);

    //Update our time constants to UTC time
    this.year = utcDate.getFullYear();
    this.dayOfTheYear = dynamicSkyEntityMethods.getDayOfTheYearFromYMD(utcDate.getFullYear(), utcDate.getMonth() + 1, utcDate.getDate());
    this.timeInDay = utcDate.getHours() * 3600 + utcDate.getMinutes() * 60 + utcDate.getSeconds();
    this.julianDay = this.calculateJulianDay();
    this.julianCentury =this.calculateJulianCentury();

    //Useful constants
    this.calculateSunAndMoonLongitudeElgonationAndAnomoly();
    this.calculateNutationAndObliquityInEclipticAndLongitude();
    this.greenwhichMeanSiderealTime = this.calculateGreenwhichSiderealTime();
    this.greenwhichApparentSiderealTime = this.calculateApparentSiderealTime();
    this.localApparentSiderealTime = this.check4GreaterThan360(this.greenwhichApparentSiderealTime + this.longitude);
    this.localApparentSiderealTimeForUniform = -1.0 * (this.localApparentSiderealTime) * this.deg2Rad;

    //Get our actual positions
    this.sunPosition = this.getSunPosition();
    this.moonPosition = this.getMoonPosition();

    //Convert these values to x, y and z, coordinates on the sky dome
    this.sunXYZPosition = this.azAndAlt2XYZOnUnitSphereSkydome(this.sunPosition.azimuth, this.sunPosition.altitude);
    this.moonXYZPosition = this.azAndAlt2XYZOnUnitSphereSkydome(this.moonPosition.azimuth, this.moonPosition.altitude);

    //var moonMappingData = this.getMoonTangentSpaceSunlight(this.moonPosition.azimuth, this.moonPosition.altitude, this.sunPosition.azimuth, this.sunPosition.altitude);
    //this.moonMappingTangentSpaceSunlight = moonMappingData.moonTangentSpaceSunlight;
    //this.moonMappingPosition = moonMappingData.moonPosition;
    // this.moonMappingTangent = moonMappingData.moonTangent;
    // this.moonMappingBitangent = moonMappingData.moonBitangent;
  },

  calculateJulianDay: function(){
    var fractionalTime = this.timeInDay / 86400;

    var month;
    var day;
    var daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    //Check if this is a leap year, if so, then add one day to the month of feburary...
    if(this.daysInYear == 366){
      daysInEachMonth[1] = 29;
    }

    var daysPast = 0;
    var previousMonthsDays = 0;
    for(var m = 0; m < 12; m++){
      previousMonthsDays = daysPast;
      daysPast += daysInEachMonth[m];
      if(daysPast >= this.dayOfTheYear){
        month = m + 1;
        day = this.dayOfTheYear - previousMonthsDays;
        break;
      }
    }
    day = day + fractionalTime;
    var year = this.year;

    if(month <= 2){
      year = year - 1;
      month = month + 12;
    }

    //Note: Meeus defines INT to be the greatest integer less than or equal x
    //Page 60, so I think floor does the best job of showing this, not trunc.

    //Roughly check that we are in the julian or gregorian calender.
    //Thank you https://github.com/janrg/MeeusSunMoon/blob/master/src/MeeusSunMoon.js
    var gregorianCutoff = new Date("1582-10-15 12:00:00");
    var hour = Math.floor(this.timeInDay / 3600);
    var minute = Math.floor((this.timeInDay % 3600) /60);
    var second = Math.floor(this.timeInDay % 60);
    var todayAsADate = new Date(year, month, day, hour, minute, second);
    var B = 0;
    if (todayAsADate > gregorianCutoff) {
      var A = Math.floor(year / 100);
      var B = 2 - A + Math.floor(A / 4);
    }

    var julianDay = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    return julianDay;
  },

  check4GreaterThan360: function(inDegrees){
    var outDegrees = inDegrees % 360;
    if(outDegrees < 0.0){
      return (360 + outDegrees);
    }
    else if(outDegrees == 360.0){
      return 0.0;
    }
    return outDegrees;
  },

  checkBetweenMinus90And90: function(inDegs){
    var outDegs = this.check4GreaterThan360(inDegs + 90);
    return (outDegs - 90);
  },

  checkBetweenMinus180And180: function(inDegs){
    var outDegs = this.check4GreaterThan360(inDegs + 180);
    return (outDegs - 180);
  },

  check4GreaterThan2Pi: function(inRads){
    var outRads = inRads % (2 * Math.PI);
    if(outRads < 0.0){
      return (Math.PI * 2.0 + outRads);
    }
    else if(outRads == (Math.PI * 2.0)){
      return 0.0;
    }
    return outRads;
  },

  checkBetweenMinusPiOver2AndPiOver2: function(inRads){
    var outRads = this.check4GreaterThan2Pi(inRads + Math.PI/2.0);
    return (outRads - (Math.PI / 2.0));
  },

  checkBetweenMinusPiAndPi: function(inRads){
    var outRads = this.check4GreaterThan2Pi(inRads + Math.PI);
    return (outRads - Math.PI);
  },

  calculateJulianCentury(){
    return (this.julianDay - 2451545.0) / 36525.0;
  },

  calculateGreenwhichSiderealTime: function(){
    //Meeus 87
    var julianDayAt0hUTC = Math.trunc(this.julianDay) + 0.5;
    var T = (julianDayAt0hUTC - 2451545.0) / 36525.0;

    var gmsrt = this.check4GreaterThan360(280.46061837 + 360.98564736629 * (this.julianDay - 2451545.0) + T * T * 0.000387933 - ((T * T * T) / 38710000.0));
    return gmsrt;
  },

  calculateApparentSiderealTime: function(){
    var nutationInRightAscensionInSeconds = (this.nutationInLongitude * 3600 * Math.cos(this.trueObliquityOfEcliptic * this.deg2Rad) )/ 15.0;
    var nutationInRightAscensionInDegs = nutationInRightAscensionInSeconds * (360) / 86400;
    var gasrt = this.greenwhichMeanSiderealTime + nutationInRightAscensionInDegs;

    return gasrt;
  },

  //With a little help from: http://www.convertalot.com/celestial_horizon_co-ordinates_calculator.html
  //and: http://www.geoastro.de/elevaz/basics/meeus.htm
  getAzimuthAndAltitude: function(rightAscension, declination){
    var latitude = this.latitude;

    //Calculated from page 92 of Meeus
    var hourAngle = this.check4GreaterThan360(this.localApparentSiderealTime - rightAscension);
    var hourAngleInRads = hourAngle * this.deg2Rad;
    var latitudeInRads =  latitude * this.deg2Rad;
    var declinationInRads = declination * this.deg2Rad;

    var az = Math.atan2(Math.sin(hourAngleInRads), ((Math.cos(hourAngleInRads) * Math.sin(latitudeInRads)) - (Math.tan(declinationInRads) * Math.cos(latitudeInRads))));
    var alt = Math.asin(Math.sin(latitudeInRads) * Math.sin(declinationInRads) + Math.cos(latitudeInRads) * Math.cos(declinationInRads) * Math.cos(hourAngleInRads));

    az = this.check4GreaterThan2Pi(az + Math.PI);
    alt = this.checkBetweenMinusPiOver2AndPiOver2(alt);

    return {azimuth: az, altitude: alt};
  },

  //I love how chapter 22 precedes chapter 13 :P
  //But anyways, using the shorter version from 144 - this limits the accuracy of
  //everything else to about 2 or 3 decimal places, but we will survive but perfection isn't our goal here
  calculateNutationAndObliquityInEclipticAndLongitude: function(){
    var T = this.julianCentury;
    var omega = this.LongitudeOfTheAscendingNodeOfTheMoonsOrbit * this.deg2Rad;
    var sunsMeanLongitude = this.sunsMeanLongitude * this.deg2Rad;
    var moonsMeanLongitude = this.moonMeanLongitude * this.deg2Rad;

    this.nutationInLongitude = (-17.2 * Math.sin(omega) - 1.32 * Math.sin(2 * sunsMeanLongitude) - 0.23 * Math.sin(2 * moonsMeanLongitude) + 0.21 * Math.sin(omega)) / 3600.0;
    this.deltaObliquityOfEcliptic = (9.2 * Math.cos(omega) + 0.57 * Math.cos(2 * sunsMeanLongitude) + 0.1 * Math.cos(2 * moonsMeanLongitude) - 0.09 * Math.cos(2 * omega)) / 3600;
    this.meanObliquityOfTheEclipitic = this.astroDegrees2NormalDegs(23, 26, 21.448) - ((T * 46.8150) / 3600)  - ((0.00059 * T * T) / 3600) + ((0.001813 * T * T * T) / 3600);
    this.trueObliquityOfEcliptic = this.meanObliquityOfTheEclipitic + this.deltaObliquityOfEcliptic;
  },

  //With a little help from: http://aa.usno.navy.mil/faq/docs/SunApprox.php and of course, Meeus
  getSunPosition: function(){
    var T = this.julianCentury;
    var sunsMeanAnomoly = this.sunsMeanAnomoly * this.deg2Rad;
    var sunsMeanLongitude = this.sunsMeanLongitude;
    var eccentricityOfEarth = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
    var sunsEquationOfCenter = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(sunsMeanAnomoly) + (0.019993 - 0.000101 * T) * Math.sin(2 * sunsMeanAnomoly) + 0.000289 * Math.sin(3 * sunsMeanAnomoly);
    var sunsTrueLongitude = (sunsMeanLongitude + sunsEquationOfCenter) * this.deg2Rad;
    this.longitudeOfTheSun = sunsTrueLongitude;
    var meanObliquityOfTheEclipitic = this.meanObliquityOfTheEclipitic * this.deg2Rad;
    var rightAscension = this.check4GreaterThan2Pi(Math.atan2(Math.cos(meanObliquityOfTheEclipitic) * Math.sin(sunsTrueLongitude), Math.cos(sunsTrueLongitude)));
    var declination = this.checkBetweenMinusPiOver2AndPiOver2(Math.asin(Math.sin(meanObliquityOfTheEclipitic) * Math.sin(sunsTrueLongitude)));

    //While we're here, let's calculate the distance from the earth to the sun, useful for figuring out the illumination of the moon
    this.distanceFromEarthToSun = (1.000001018 * (1 - (eccentricityOfEarth * eccentricityOfEarth))) / (1 + eccentricityOfEarth * Math.cos(sunsEquationOfCenter * this.deg2Rad)) * 149597871;

    //Because we use these elsewhere...
    this.sunsRightAscension = rightAscension / this.deg2Rad;
    this.sunsDeclination = declination / this.deg2Rad;
    return this.getAzimuthAndAltitude(this.sunsRightAscension, this.sunsDeclination);
  },

  calculateSunAndMoonLongitudeElgonationAndAnomoly: function(){
    var T = this.julianCentury;
    this.moonMeanLongitude = this.check4GreaterThan360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0 - (T * T * T * T) / 65194000.0 );
    this.moonMeanElongation = this.check4GreaterThan360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0  - (T * T * T * T) / 113065000.0 );
    this.moonsMeanAnomaly = this.check4GreaterThan360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699 - (T * T * T * T) / 14712000);
    this.moonsArgumentOfLatitude = this.check4GreaterThan360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0 + (T * T * T * T) / 863310000.0);
    this.LongitudeOfTheAscendingNodeOfTheMoonsOrbit = this.check4GreaterThan360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + ((T * T *T) /450000));
    this.sunsMeanAnomoly = this.check4GreaterThan360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000.0);
    this.sunsMeanLongitude = this.check4GreaterThan360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  },

  getMoonEE(D, M, MP){
    //From approximation 48.4 in Meeus, page 346
    var lunarPhaseAngleI = 180 - D - 6.289 * Math.sin(this.deg2Rad * MP) + 2.1 * Math.sin(this.deg2Rad * M) - 1.274 * Math.sin(this.deg2Rad * (2.0 * D - MP)) - 0.658 * Math.sin(this.deg2Rad * (2.0 * D));
    lunarPhaseAngleI += -0.214 * Math.sin(this.deg2Rad * (2 * MP)) - 0.110 * Math.sin(this.deg2Rad * D);
    var fullLunarIllumination = 29;

    //Using HN Russell's data as a guide and guestimating a rough equation for the intensity of moonlight from the phase angle...
    var fractionalIntensity = 1.032391 * Math.exp(-0.0257614 * Math.abs(lunarPhaseAngleI));

    //Using the square of the illuminated fraction of the moon for a faster falloff
    var partialLunarIllumination = fullLunarIllumination * fractionalIntensity;
    this.moonEE = partialLunarIllumination;
  },

  //With help from Meeus Chapter 47...
  getMoonPosition: function(){
    var T = this.julianCentury;
    var moonMeanLongitude = this.check4GreaterThan360(this.moonMeanLongitude);
    var moonMeanElongation = this.moonMeanElongation;
    var sunsMeanAnomoly = this.sunsMeanAnomoly;
    var moonsMeanAnomaly = this.moonsMeanAnomaly;
    var moonsArgumentOfLatitude = this.check4GreaterThan360(this.moonsArgumentOfLatitude);
    var a_1 = this.check4GreaterThan360(119.75 + 131.849 * T);
    var a_2 = this.check4GreaterThan360(53.09 + 479264.290 * T);
    var a_3 = this.check4GreaterThan360(313.45 + 481266.484 * T);
    var e_parameter = 1 - 0.002516 * T - 0.0000074 * T * T;

    //For the love of cheese why?!
    //TODO: kill off some of these terms. If we're limiting ourselves to 0.01
    //degrees of accuracy, we don't require this many terms by far!
    var D_coeficients = [0,2,2,0, 0,0,2,2, 2,2,0,1, 0,2,0,0, 4,0,4,2, 2,1,1,2, 2,4,2,0, 2,2,1,2,
    0,0,2,2, 2,4,0,3, 2,4,0,2 ,2,2,4,0, 4,1,2,0, 1,3,4,2, 0,1,2,2];
    var M_coeficients = [0,0,0,0,1,0,0,-1,0,-1,1,0,1,0,0,0,0,0,0,1,1,0,1,-1,0,0,0,1,0,-1,0,-2,
    1,2,-2,0,0,-1,0,0,1,-1,2,2,1,-1,0,0,-1,0,1,0,1,0,0,-1,2,1,0,0];
    var M_prime_coeficients = [1,-1,0,2,0,0,-2,-1,1,0,-1,0,1,0,1,1,-1,3,-2,-1,0,-1,0,1,2,0,-3,-2,-1,-2,1,0,
    2,0,-1,1,0,-1,2,-1,1,-2,-1,-1,-2,0,1,4,0,-2,0,2,1,-2,-3,2,1,-1,3,-1];
    var F_coeficients = [0,0,0,0,0,2,0,0,0,0,0,0,0,-2,2,-2,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,
    0,0,0,-2,2,0,2,0,0,0,0,0,0,-2,0,0,0,0,-2,-2,0,0,0,0,0,0,0,-2];
    var l_sum_coeficients = [6288774, 1274027, 658314, 213618, -185116, -114332, 58793, 57066,
    53322, 45758, -40923, -34720, -30383, 15327, -12528, 10980, 10675, 10034, 8548, -7888, -6766,
    -5163, 4987, 4036, 3994, 3861, 3665, -2689, -2602, 2390, -2348, 2236,
    -2120, -2069, 2048, -1773, -1595, 1215, -1110, -892, -810, 759, -713, -700, 691, 596, 549, 537,
    520, -487, -399, -381, 351, -340, 330, 327, -323, 299, 294, 0];
    var r_sum_coeficients = [-20905355, -3699111, -2955968, -569925, 48888, -3149, 246158, -152138, -170733,
      -204586, -129620, 108743, 104755, 10321, 0, 79661, -34782, -23210, -21636, 24208,
    30824, -8379, -16675, -12831, -10445, -11650, 14403, -7003, 0, 10056, 6322, -9884,
    5751, 0, -4950, 4130, 0, -3958, 0, 3258, 2616, -1897, -2117, 2354, 0, 0, -1423, -1117,
    -1571, -1739, 0, -4421, 0, 0, 0, 0, 1165, 0, 0, 8752];
    var sum_l = 0.0;
    var sum_r = 0.0;

    for(var i = 0; i < D_coeficients.length; i++){
      //Get our variables for this ith component;
      var D_coeficient = D_coeficients[i];
      var M_coeficient = M_coeficients[i];
      var M_prime_coeficient = M_prime_coeficients[i];
      var F_coeficient = F_coeficients[i];
      var l_sum_coeficient = l_sum_coeficients[i];
      var r_sum_coeficient = r_sum_coeficients[i];

      var D = D_coeficient * moonMeanElongation;
      var M = M_coeficient * sunsMeanAnomoly;
      var Mp = M_prime_coeficient * moonsMeanAnomaly;
      var F = F_coeficient * moonsArgumentOfLatitude;
      var sumOfTerms = D + M + Mp + F;

      var e_coeficient = 1.0;
      if(Math.abs(M_coeficient) === 1){
        e_coeficient = e_parameter;
      }
      else if(Math.abs(M_coeficient) === 2){
        e_coeficient = e_parameter * e_parameter;
      }
      sum_l += e_coeficient * l_sum_coeficient * Math.sin(this.check4GreaterThan360(sumOfTerms) * this.deg2Rad);
      sum_r += e_coeficient * r_sum_coeficient * Math.cos(this.check4GreaterThan360(sumOfTerms) * this.deg2Rad);
    }

    //For B while we're at it :D
    //TODO: kill off some of these terms. If we're limiting ourselves to 0.01
    //degrees of accuracy, we don't require this many terms by far!
    D_coeficients = [0,0,0,2, 2,2,2,0,2,0,2,2,2,2,2,2,2,0,4,0,0,0,1,0,
      0,0,1,0,4,4,0,4,2,2,2,2,0,2,2,2,2,4,2,2,0,2,1,1,0,2,1,2,0,4,4,1,4,1,4,2];
    M_coeficients = [0,0,0,0,0,0,0,0,0,0,-1,0,0,1,-1,-1,-1,1,0,1,0,1,0,1,
      1,1,0,0,0,0,0,0,0,0,-1,0,0,0,0,1,1,0,-1,-2,0,1,1,1,1,1,0,-1,1,0,-1,0,0,0,-1,-2];
    M_prime_coeficients = [0,1,1,0,-1,-1,0,2,1,2,0,-2,1,0,-1,0,-1,-1,-1,0,0,-1,0,1,
      1,0,0,3,0,-1,1,-2,0,2,1,-2,3,2,-3,-1,0,0,1,0,1,1,0,0,-2,-1,1,-2,2,-2,-1,1,1,-1,0,0];
    F_coeficients = [1,1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,1,3,1,1,1,
      -1,-1,-1,1,-1,1,-3,1,-3,-1,-1,1,-1,1,-1,1,1,1,1,-1,3,-1,-1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1,-1,1];
    var b_sum_coeficients = [5128122,280602,277693,173237,55413,46271, 32573, 17198,
      9266,8822,8216,4324,4200,-3359,2463,2211,2065,-1870,1828,-1794,
      -1749,-1565,-1491,-1475,-1410,-1344,-1335,1107,1021,833,
      777,671,607,596,491,-451,439,422,421,-366,-351,331,315,302,-283,-229,
      223,223,-220,-220,-185, 181,-177,176,166,-164,132,-119,115,107];

    var sum_b = 0.0;
    for(var i = 0; i < D_coeficients.length; i++){
      var D_coeficient = D_coeficients[i];
      var M_coeficient = M_coeficients[i];
      var M_prime_coeficient = M_prime_coeficients[i];
      var F_coeficient = F_coeficients[i];
      var b_sum_coeficient = b_sum_coeficients[i];

      //And for the sunsEquation
      var D = D_coeficient * moonMeanElongation;
      var M = M_coeficient * sunsMeanAnomoly;
      var Mp = M_prime_coeficient * moonsMeanAnomaly;
      var F = F_coeficient * moonsArgumentOfLatitude;

      var e_coeficient = 1.0;
      if(Math.abs(M_coeficient) === 1){
        e_coeficient = e_parameter;
      }
      else if(Math.abs(M_coeficient) === 2){
        e_coeficient = e_parameter * e_parameter;
      }

      sum_b += e_coeficient * b_sum_coeficient * Math.sin(this.check4GreaterThan360(D + M + Mp + F) * this.deg2Rad);
    }

    //Additional terms
    var moonMeanLongitude = this.check4GreaterThan360(moonMeanLongitude);
    var moonsArgumentOfLatitude = this.check4GreaterThan360(moonsArgumentOfLatitude);
    var moonsMeanAnomaly = this.check4GreaterThan360(moonsMeanAnomaly);
    sum_l = sum_l + 3958.0 * Math.sin(a_1 * this.deg2Rad) + 1962.0 * Math.sin((moonMeanLongitude - moonsArgumentOfLatitude) * this.deg2Rad) + 318.0 * Math.sin(a_2 * this.deg2Rad);
    sum_b = sum_b - 2235.0 * Math.sin(moonMeanLongitude * this.deg2Rad) + 382.0 * Math.sin(a_3 * this.deg2Rad) + 175.0 * Math.sin((a_1 - moonsArgumentOfLatitude) * this.deg2Rad) + 175 * Math.sin((a_1 + moonsArgumentOfLatitude) * this.deg2Rad);
    sum_b = sum_b + 127.0 * Math.sin((moonMeanLongitude - moonsMeanAnomaly) * this.deg2Rad) - 115.0 * Math.sin((moonMeanLongitude + moonsMeanAnomaly) * this.deg2Rad);

    var lambda = (moonMeanLongitude + (sum_l / 1000000));
    var beta = (sum_b / 1000000);
    this.distanceFromEarthToMoon = 385000.56 + (sum_r / 1000); //In kilometers
    var raAndDec = this.lambdaBetaDegToRaDec(lambda, beta);
    var rightAscension = raAndDec.rightAscension;
    var declination = raAndDec.declination;

    var geocentricElongationOfTheMoon = Math.acos(Math.cos(beta) * Math.cos(this.longitudeOfTheSun - lambda))
    this.getMoonEE(moonMeanElongation, sunsMeanAnomoly, moonsMeanAnomaly);

    //Because we use these elsewhere...
    this.moonsRightAscension = rightAscension;
    this.moonsDeclination = declination;

    //Just return these values for now, we can vary the bright
    return this.getAzimuthAndAltitude(rightAscension, declination);
  },

  getDaysInYear: function(){
    var daysInThisYear = dynamicSkyEntityMethods.getIsLeapYear(this.year) ? 366 : 365;

    return daysInThisYear;
  },

  convert2NormalizedGPUCoords: function(azimuth, altitude){
    var x = Math.sin(azimuth) * Math.cos(altitude - 3 * Math.PI / 2); //Define me as true north, switch to minus one to define me as south.
    var y = Math.sin(azimuth) * Math.sin(altitude - 3 * Math.PI / 2);
    var z = Math.cos(altitude - 3 * Math.PI / 2);

    return {x: x, y: y, z: z};
  },

  lambdaBetaDegToRaDec: function(lambda, beta){
    var radLambda = lambda * this.deg2Rad;
    var radBeta = beta * this.deg2Rad;
    var epsilon = this.trueObliquityOfEcliptic * this.deg2Rad

    //Use these to acquire the equatorial solarGPUCoordinates
    var rightAscension = this.check4GreaterThan2Pi(Math.atan2(Math.sin(radLambda) * Math.cos(epsilon) - Math.tan(radBeta) * Math.sin(epsilon), Math.cos(radLambda)));
    var declination = this.checkBetweenMinusPiOver2AndPiOver2(Math.asin(Math.sin(radBeta) * Math.cos(epsilon) + Math.cos(radBeta) * Math.sin(epsilon) * Math.sin(radLambda)));

    //Convert these back to degrees because we don't actually convert them over to radians until our final conversion to azimuth and altitude
    rightAscension = rightAscension / this.deg2Rad;
    declination = declination / this.deg2Rad;

    return {rightAscension: rightAscension, declination: declination};
  },

  //
  //Useful for debugging purposes
  //
  radsToAstroDegreesString: function(radianVal){
    var returnObj = this.radsToAstroDegrees(radianVal);
    return `${returnObj.degrees}°${returnObj.minutes}'${returnObj.seconds}''`;
  },

  radsToAstroDegrees: function(radianVal){
    var degreeValue = this.check4GreaterThan360(radianVal / this.deg2Rad);
    var degrees = Math.trunc(degreeValue);
    var remainder = Math.abs(degreeValue - degrees);
    var arcSeconds = 3600 * remainder;
    var arcMinutes = Math.floor(arcSeconds / 60);
    arcSeconds = arcSeconds % 60;

    return {degrees: degrees, minutes: arcMinutes, seconds: arcSeconds};
  },

  astroDegrees2Rads: function(degrees, arcminutes, arcseconds){
    return this.deg2Rad * this.astroDegrees2NormalDegs(degrees, arcminutes, arcseconds);
  },

  astroDegrees2NormalDegs: function(degrees, arcminutes, arcseconds){
    var fractDegrees = 0;
    if(degrees !== 0){
      fractDegrees = this.check4GreaterThan360(Math.sign(degrees) * (Math.abs(degrees) + (arcminutes / 60.0) + (arcseconds / 3600.0) ));
    }
    else if(arcminutes !== 0){
      fractDegrees = this.check4GreaterThan360(Math.sign(arcminutes) * ( (Math.abs(arcminutes) / 60.0) + (arcseconds / 3600.0) ));
    }
    else if(arcseconds !== 0){
      fractDegrees = this.check4GreaterThan360(arcseconds / 3600.0);
    }

    return fractDegrees;
  },

  radToHoursMinutesSecondsString: function(radianVal){
    var returnObj = this.radToHoursMinutesSeconds(radianVal);
    return `${returnObj.hours}:${returnObj.minutes}:${returnObj.seconds}`;
  },

  radToHoursMinutesSeconds: function(radianVal){
    var degreeValue = this.check4GreaterThan360(radianVal / this.deg2Rad);
    var fractionalHours = degreeValue / 15;
    var hours = Math.floor(fractionalHours);
    var remainder = fractionalHours - hours;
    var totalSeconds = remainder * 3600;
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;

    return {hours: hours, minutes: minutes, seconds: seconds,
      addSeconds: function(seconds){
        this.seconds += seconds;
        if(this.seconds > 60){
          this.minutes += Math.floor(this.seconds / 60);
          this.seconds = this.seconds % 60;
        }
        if(this.minutes > 60){
          this.hours += Math.floor(this.minutes / 60);
          this.hours = this.hours % 24;
          this.minutes = this.minutes % 60;
        }
      }
    };
  },

  astroHoursMinuteSeconds2Degs: function(hours, minutes, seconds){
    return (360.0 * (hours * 3600.0 + minutes * 60.0 + seconds) / 86400.0);
  },

  azAndAlt2XYZOnUnitSphereSkydome: function(azimuth, altitude){
    var zenithAngle = (Math.PI/ 2.0) - altitude;
    var x = Math.sin(zenithAngle) * Math.cos(azimuth + Math.PI);
    var z = Math.sin(zenithAngle) * Math.sin(azimuth + Math.PI);
    var y = Math.cos(zenithAngle);
    return new THREE.Vector3(x, y, z);
  }
}

//For Mocha testing




var aSkyInterpolator = function(initializationTime, timeMultiplier, interpolationLengthInSeconds, dynamicSkyObject, originalSkyData){
  var self = this;
  this.skyDataObjects = [];
  this.skyDataTimes = [];

  //This is a means of updating our sky time so that we can set our dynamic sky objects
  //to the correct positions in the sky...
  this.skyDataFromTime = function(time, timerID){
    //Clone our sky data
    if(self.skyDataObjects[timerID] === undefined){
      self.skyDataObjects[timerID] = JSON.parse(self.skyDataObjectString);
    }
    if(self.skyDataTimes[timerID] === undefined){
      self.skyDataTimes[timerID] = self.initializationTime.getTime();
    }
    var skyDataClone = self.skyDataObjects[timerID];

    //Get the difference between the time provided and the initial time for our function
    //We divide by 1000 because this returns the difference in milliseconds
    var timeDiffInSeconds = (time.getTime() - self.skyDataTimes[timerID]) / 1000.0;
    self.skyDataTimes[timerID] = time.getTime();
    skyDataClone.timeOffset += timeDiffInSeconds;

    if(skyDataClone.timeOffset > 86400.0){
      //It's a new day!
      skyDataClone.dayOfTheYear += 1;
      skyDataClone.timeOffset = skyDataClone.timeOffset % 86400.00;
      if(skyDataClone.dayOfTheYear > skyDataClone.yearPeriod){
        //Reset everything! But presume we're on the same day
        //TODO: I doubt this will run for longer than a single year, but we might need to reset the year period...
        skyDataClone.dayOfTheYear = 1;
        skyDataClone.year += 1;
      }
    }

    //Update the string in use
    return skyDataClone;
  };

  //A way of diving deep into a variable to hunt for nested values
  this.searchForVariable = function(objectPathRef, nestedArray){
    var objectPath = objectPathRef.slice(0); //We wish to copy this, we're not after the original

    var returnValue = null;
    if(objectPath.length > 1){
      var currentVarName = objectPath.shift();
      returnValue = self.searchForVariable(objectPath, nestedArray[currentVarName]);
    }
    else{
      returnValue = nestedArray[objectPath[0]];
    }

    return returnValue;
  };

  //
  //Methods that set our interpolations
  //
  this.setSLERPFor3Vect = function(name, objectPath, isBuffered, callback = false){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var vec_0 = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0).clone();
    var vec_f = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f).clone();

    var timeNormalizer = 1.0 / (t_f - t_0);
    var omega = vec_0.angleTo(vec_f);
    var vec_0_array = vec_0.toArray();
    var vec_f_array = vec_f.toArray();
    var coeficient_a = [];
    var coeficient_b = [];
    for(var i = 0; i < vec_0_array.length; i++){
      coeficient_a.push(vec_0_array[i] / Math.sin(omega));
      coeficient_b.push(vec_f_array[i] / Math.sin(omega));
    }

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setSLERPFor3Vect,
      callback: callback,
      coeficient_a: coeficient_a,
      coeficient_b: coeficient_b,
      omega: omega,
      timeNormalizer: timeNormalizer,
      t_0: t_0,
      interpolate: callback ? function(time){
        var normalizedTime = (time - this.t_0) * this.timeNormalizer;
        var slerpArray= [];
        for(var i = 0; i < coeficient_a.length; i++){
          slerpArray.push((Math.sin((1 - normalizedTime) * this.omega) * this.coeficient_a[i]) + Math.sin(normalizedTime * this.omega) * this.coeficient_b[i]);
        }
        var returnVect = new THREE.Vector3(slerpArray[0], slerpArray[1],  slerpArray[2]);
        return this.callback(returnVect);
      } : function(time){
        var normalizedTime = (time - this.t_0) * this.timeNormalizer;
        var slerpArray= [];
        for(var i = 0; i < coeficient_a.length; i++){
          slerpArray.push((Math.sin((1 - normalizedTime) * this.omega) * this.coeficient_a[i]) + Math.sin(normalizedTime * this.omega) * this.coeficient_b[i]);
        }
        var returnVect = new THREE.Vector3(slerpArray[0], slerpArray[1],  slerpArray[2]);
        return returnVect;
      }
    };
  };

  //Presumes that values are over a full circle, possibly offset below like with -180
  this.setAngularLinearInterpolationForScalar = function(name, objectPath, isBuffered, callback = false, offset = 0){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var x_0 = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0)));
    var x_f = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f)));

    function modulo(a, b){
      return (a - Math.floor(a/b) * b);
    }

    var offset = offset;
    var offsetX0 = x_0 + offset;
    var offsetXF = x_f + offset;
    var diff = offsetXF - offsetX0;
    var angularDifference = modulo((diff + Math.PI), (2.0 * Math.PI)) - Math.PI;
    var timeNormalizer = 1.0 / (t_f - t_0);

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setAngularLinearInterpolationForScalar,
      callback: callback,
      offset: offset,
      offsetX0: offsetX0,
      interpolate: callback ? function(time){
        var returnVal = offsetX0 + (time - t_0) * timeNormalizer * angularDifference;
        returnVal = returnVal - offset;
        return this.callback(returnVal);
      } : function(time){
        var returnVal = offsetX0 + (time - t_0) * timeNormalizer * angularDifference;
        returnVal = returnVal - offset;
        return returnVal;
      }
    };
  };

  this.setLinearInterpolationForScalar = function(name, objectPath, isBuffered, callback = false){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var x_0 = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0)));
    var x_f = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f)));

    var slope = (x_f - x_0) / (t_f - t_0);
    var intercept = x_0 - slope * t_0;

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setLinearInterpolationForScalar,
      slope: slope,
      intercept: intercept,
      callback: callback,
      interpolate: callback ? function(time){
        return this.callback(this.slope * time + this.intercept);
      } : function(time){
        return (this.slope * time + this.intercept);
      }
    };
  };

  this.setLinearInterpolationForVect = function(name, objectPath, isBuffered, callback = false){
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var vec_0 = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0).toArray();
    var vec_f = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f).toArray();

    var slope = [];
    var intercept = [];
    var slopeDenominator = 1.0 / (t_f - t_0);
    var vectorLength = vec_0.length;
    for(var i = 0; i < vectorLength; i++){
      slope.push((vec_f[i] - vec_0[i]) * slopeDenominator);
      intercept.push(vec_0[i] - slope[i] * t_0);
    }

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setLinearInterpolationForVect,
      callback: callback,
      slope: slope.splice(0),
      intercept: intercept.splice(0),
      interpolate: callback ? function(time){
        var returnArray = [];
        for(i = 0; i < vectorLength; i++){
          returnArray.push(this.slope[i] * time + this.intercept[i]);
        }

        var returnVect;
        if(vectorLength == 2){
          returnVect = new THREE.Vector2(returnArray[0], returnArray[1]);
        }
        else if(vectorLength == 3){
          returnVect = new THREE.Vector3(returnArray[0], returnArray[1],  returnArray[2]);
        }
        else{
          returnVect = new THREE.Vector4(returnArray[0], returnArray[1],  returnArray[2], returnArray[3]);
        }

        return this.callback(returnVect);
      } : function(time){
        var returnArray = [];
        for(i = 0; i < vectorLength; i++){
          returnArray.push(this.slope[i] * time + this.intercept[i]);
        }

        var returnVect;
        if(vectorLength == 2){
          returnVect = new THREE.Vector2(returnArray[0], returnArray[1]);
        }
        else if(vectorLength == 3){
          returnVect = new THREE.Vector3(returnArray[0], returnArray[1],  returnArray[2]);
        }
        else{
          returnVect = new THREE.Vector4(returnArray[0], returnArray[1],  returnArray[2], returnArray[3]);
        }

        return returnVect;
      }
    };
  };

  //
  //This is the big one, the method that we call repeatedly to give us the values we want
  //it mostly just runs a bunch of linear functions - one for each of our uniforms
  //in order to create an interpolated sky. On occasion, it also requests a new set of interpolations
  //after cloning the cached interpolation set.
  //
  this.getValues = function(time){
    //In the event that the time falls outside of or current range
    //swap the buffer with the current system and update our times
    //and clear the buffer.
    var requestBufferUpdate = false;

    if(time > self.finalTime){
      //Supposedly pretty quick and dirty, even though a built in clone method would work better
      self.currentInterpolations = cloner.deep.copy(self.bufferedInterpolations);
      requestBufferUpdate = true;
    }

    //Create an object with all the values we're interpolating
    var interpolatedValues = {};
    for(var varName in self.currentInterpolations){
      var outVarValue = self.currentInterpolations[varName].interpolate((time.getTime())/1000.0);
      interpolatedValues[varName] = outVarValue;
    }

    if(self.bufferHasRunForTesting && self.numberOfTestRuns < 10){
      self.numberOfTestRuns += 1;
    }

    //Prime the buffer again if need be.
    if(requestBufferUpdate){
      //Presumes the buffer is within range of the next time object
      self.initialTime = new Date(time.getTime());
      self.finalTime = new Date(time.getTime() + self.interpolationLengthInSeconds * 1000.0 * self.timeMultiplier);
      self.bufferedTime = new Date(self.finalTime.getTime() + self.interpolationLengthInSeconds * 1000.0 * self.timeMultiplier);

      self.primeBuffer();
    }

    //Return this object the values acquired
    return interpolatedValues;
  };

  this.primeBuffer = async function(){
    //Change the adynamic sky function to five minutes after the final time
    var skytime_0 = self.skyDataFromTime(self.finalTime, 2);
    var skytime_f = self.skyDataFromTime(self.bufferedTime, 3);
    self.dynamicSkyObjectAt_t_0.update(skytime_0);
    self.dynamicSkyObjectAt_t_f.update(skytime_f);

    //create new interpolations for all the functions in the linear interpolations list
    //Note that we cannot buffer anything that isn't in current.
    for(var name in self.currentInterpolations) {
      //Create buffered interpolations for use in the next go round
      if(self.currentInterpolations[name].callback){
        self.currentInterpolations[name].setFunction(name, self.currentInterpolations[name].objectPath, true, self.currentInterpolations[name].callback);
      }
      else{
        self.currentInterpolations[name].setFunction(name, self.currentInterpolations[name].objectPath, true);
      }
    }

    self.bufferHasRunForTesting = true;
  };

  //Prepare our function before we initialize everything.
  this.timeMultiplier = timeMultiplier;
  this.interpolationLengthInSeconds = interpolationLengthInSeconds;
  this.interpolationCount = 1;
  this.initializationTime = initializationTime;
  this.initializationMilliseconds = initializationTime.getTime();
  this.initialTime =new Date(initializationTime.getTime());
  this.finalTime = new Date(initializationTime.getTime() + interpolationLengthInSeconds * this.timeMultiplier * 1000.0);
  this.bufferedTime = new Date(initializationTime.getTime() + interpolationLengthInSeconds * this.timeMultiplier * 2000.0);

  //Clone our dynamic sky object for the purposes of linear interpolation
  //And set them to the initial and final time with all other variables
  //held constant...
  this.skyDataObjectString = JSON.stringify(originalSkyData);

  this.dynamicSkyObjectAt_t_0 = cloner.deep.copy(dynamicSkyObject);
  this.dynamicSkyObjectAt_t_0.update(this.skyDataFromTime(this.initialTime, 0));
  this.dynamicSkyObjectAt_t_f = cloner.deep.copy(dynamicSkyObject);
  this.dynamicSkyObjectAt_t_f.update(this.skyDataFromTime(this.finalTime, 1));

  this.currentInterpolations = {};
  this.bufferedInterpolations = {};

  self.numberOfTestRuns = 1;
  self.bufferHasRunForTesting = false;
}

//
//Thank you Andrea! :D
//
var cloner = (function (O) {'use strict';

  // (C) Andrea Giammarchi - Mit Style

  var

    // constants
    VALUE   = 'value',
    PROTO   = '__proto__', // to avoid jshint complains

    // shortcuts
    isArray = Array.isArray,
    create  = O.create,
    dP      = O.defineProperty,
    dPs     = O.defineProperties,
    gOPD    = O.getOwnPropertyDescriptor,
    gOPN    = O.getOwnPropertyNames,
    gOPS    = O.getOwnPropertySymbols ||
              function (o) { return Array.prototype; },
    gPO     = O.getPrototypeOf ||
              function (o) { return o[PROTO]; },
    hOP     = O.prototype.hasOwnProperty,
    oKs     = (typeof Reflect !== typeof oK) &&
              Reflect.ownKeys ||
              function (o) { return gOPS(o).concat(gOPN(o)); },
    set     = function (descriptors, key, descriptor) {
      if (key in descriptors) dP(descriptors, key, {
        configurable: true,
        enumerable: true,
        value: descriptor
      });
      else descriptors[key] = descriptor;
    },

    // used to avoid recursions in deep copy
    index   = -1,
    known   = null,
    blown   = null,
    clean   = function () { known = blown = null; },

    // utilities
    New = function (source, descriptors) {
      var out = isArray(source) ? [] : create(gPO(source));
      return descriptors ? Object.defineProperties(out, descriptors) : out;
    },

    // deep copy and merge
    deepCopy = function deepCopy(source) {
      var result = New(source);
      known = [source];
      blown = [result];
      deepDefine(result, source);
      clean();
      return result;
    },
    deepMerge = function (target) {
      known = [];
      blown = [];
      for (var i = 1; i < arguments.length; i++) {
        known[i - 1] = arguments[i];
        blown[i - 1] = target;
      }
      merge.apply(true, arguments);
      clean();
      return target;
    },

    // shallow copy and merge
    shallowCopy = function shallowCopy(source) {
      clean();
      for (var
        key,
        descriptors = {},
        keys = oKs(source),
        i = keys.length; i--;
        set(descriptors, key, gOPD(source, key))
      ) key = keys[i];
      return New(source, descriptors);
    },
    shallowMerge = function () {
      clean();
      return merge.apply(false, arguments);
    },

    // internal methods
    isObject = function isObject(value) {
      /*jshint eqnull: true */
      return value != null && typeof value === 'object';
    },
    shouldCopy = function shouldCopy(value) {
      /*jshint eqnull: true */
      index = -1;
      if (isObject(value)) {
        if (known == null) return true;
        index = known.indexOf(value);
        if (index < 0) return 0 < known.push(value);
      }
      return false;
    },
    deepDefine = function deepDefine(target, source) {
      for (var
        key, descriptor,
        descriptors = {},
        keys = oKs(source),
        i = keys.length; i--;
      ) {
        key = keys[i];
        descriptor = gOPD(source, key);
        if (VALUE in descriptor) deepValue(descriptor);
        set(descriptors, key, descriptor);
      }
      dPs(target, descriptors);
    },
    deepValue = function deepValue(descriptor) {
      var value = descriptor[VALUE];
      if (shouldCopy(value)) {
        descriptor[VALUE] = New(value);
        deepDefine(descriptor[VALUE], value);
        blown[known.indexOf(value)] = descriptor[VALUE];
      } else if (-1 < index && index in blown) {
        descriptor[VALUE] = blown[index];
      }
    },
    merge = function merge(target) {
      for (var
        source,
        keys, key,
        value, tvalue,
        descriptor,
        deep = this.valueOf(),
        descriptors = {},
        i, a = 1;
        a < arguments.length; a++
      ) {
        source = arguments[a];
        keys = oKs(source);
        for (i = 0; i < keys.length; i++) {
          key = keys[i];
          descriptor = gOPD(source, key);
          if (hOP.call(target, key)) {
            if (VALUE in descriptor) {
              value = descriptor[VALUE];
              if (shouldCopy(value)) {
                descriptor = gOPD(target, key);
                if (VALUE in descriptor) {
                  tvalue = descriptor[VALUE];
                  if (isObject(tvalue)) {
                    merge.call(deep, tvalue, value);
                  }
                }
              }
            }
          } else {
            if (deep && VALUE in descriptor) {
              deepValue(descriptor);
            }
          }
          set(descriptors, key, descriptor);
        }
      }
      return dPs(target, descriptors);
    }
  ;

  return {
    deep: {
      copy: deepCopy,
      merge: deepMerge
    },
    shallow: {
      copy: shallowCopy,
      merge: shallowMerge
    }
  };

}(Object));

//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
var moonShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    rayleighCoefficientOfSun: {type: 'f', value: 0.0},
    rayleighCoefficientOfMoon: {type: 'f',value: 0.0},
    sunFade: {type: 'f',value: 0.0},
    moonFade: {type: 'f',value: 0.0},
    luminance: {type: 'f',value: 0.0},
    mieDirectionalG: {type: 'f',value: 0.0},
    moonE: {type: 'f',value: 0.0},
    earthshineE: {type: 'f', value: 0.0},
    sunE: {type: 'f',value: 0.0},
    linMoonCoefficient2: {type: 'f',value: 0.0},
    linSunCoefficient2: {type: 'f',value: 0.0},
    moonExposure: {type: 'f', value: 0.0},
    azimuthEarthsShadow: {type: 'f', value: 0.0},
    altitudeEarthsShadow: {type: 'f', value: 0.0},
    distanceToEarthsShadow: {type: 'f', value: 0.0},
    normalizedLunarDiameter: {type: 'f', value: 0.0},
    betaM: {type: 'v3',value: new THREE.Vector3()},
    sunXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    betaRSun: {type: 'v3', value: new THREE.Vector3()},
    betaRMoon: {type: 'v3', value: new THREE.Vector3()},
    moonTangentSpaceSunlight: {type: 'v3', value: new THREE.Vector3()},
    moonXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    moonLightColor: {type: 'v3', value: new THREE.Vector3()},
    moonTexture: {type: 't', value: null},
    moonNormalMap: {type: 't', value: null},
    bayerMatrix: {type: 't', value: null}
  },

  transparent: true,
  lights: false,
  flatShading: true,
  clipping: true,

  vertexShader: [

    '#ifdef GL_ES',

    'precision mediump float;',

    'precision mediump int;',

    '#endif',



    'varying vec3 vWorldPosition;',

    'varying vec2 vUv;',



    'void main() {',

      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',

      'vWorldPosition = worldPosition.xyz;',

      'vUv = uv;',

      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

    '}',
  ].join('\n'),

  fragmentShader: [

    '#ifdef GL_ES',

    'precision mediump float;',

    'precision mediump int;',

    '#endif',



    '//Varyings',

    'varying vec3 vWorldPosition;',

    'varying vec2 vUv;',



    '//Uniforms',

    'uniform float sunFade;',

    'uniform float moonFade;',

    'uniform float luminance;',

    'uniform float mieDirectionalG;',

    'uniform vec3 betaM;',

    'uniform vec3 betaRSun;',

    'uniform vec3 betaRMoon;',

    'uniform sampler2D moonTexture;',

    'uniform sampler2D moonNormalMap;',

    'uniform vec3 moonTangentSpaceSunlight;',

    'uniform vec3 sunXYZPosition;',

    'uniform vec3 moonXYZPosition;',

    'uniform vec3 moonLightColor;',

    'uniform float azimuthEarthsShadow;',

    'uniform float altitudeEarthsShadow;',

    'uniform float distanceToEarthsShadow;',

    'uniform float normalizedLunarDiameter;',

    'uniform float moonE;',

    'uniform float sunE;',

    'uniform float earthshineE;',

    'uniform float linMoonCoefficient2; //clamp(pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0,1.0)',

    'uniform float linSunCoefficient2; //clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0)',

    'uniform float moonExposure;',

    'uniform sampler2D bayerMatrix;',



    '//Constants',

    'const vec3 up = vec3(0.0, 1.0, 0.0);',

    'const float e = 2.71828182845904523536028747135266249775724709369995957;',

    'const float pi = 3.141592653589793238462643383279502884197169;',

    'const float piOver2 = 1.570796326794896619231321691639751442098584699687552910487;',

    'const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;',

    'const float oneOverFourPi = 0.079577471545947667884441881686257181017229822870228224373;',

    'const float rayleighPhaseConst = 0.059683103659460750913331411264692885762922367152671168280;',

    'const float rayleighAtmosphereHeight = 8.4E3;',

    'const float mieAtmosphereHeight = 1.25E3;',

    'const float rad2Deg = 57.29577951308232087679815481410517033240547246656432154916;',



    '//I decided to go with a slightly more bluish earthshine as I have seen them get pretty',

    '//blue overall.',

    'const vec3 earthshineColor = vec3(0.65,0.86,1.00);',



    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',

    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',

    'vec2 rayleighPhase(vec2 cosTheta){',

      'return rayleighPhaseConst * (1.0 + cosTheta * cosTheta);',

    '}',



    'vec2 hgPhase(vec2 cosTheta){',

      'return oneOverFourPi * ((1.0 - mieDirectionalG * mieDirectionalG) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + (mieDirectionalG * mieDirectionalG), vec2(1.5)));',

    '}',



    'vec3 getDirectInscatteredIntensity(vec3 normalizedWorldPosition, vec3 FexSun, vec3 FexMoon){',

      '//Cos theta of sun and moon',

      'vec2 cosTheta = vec2(dot(normalizedWorldPosition, sunXYZPosition), dot(normalizedWorldPosition, moonXYZPosition));',

      'vec2 rPhase = rayleighPhase(vec2(0.5) * (vec2(1.0) + cosTheta));',

      'vec3 betaRThetaSun = betaRSun * rPhase.x;',

      'vec3 betaRThetaMoon = betaRMoon * rPhase.y;',



      '//Calculate the mie phase angles',

      'vec2 mPhase = hgPhase(cosTheta);',

      'vec3 betaMSun = betaM * mPhase.x;',

      'vec3 betaMMoon = betaM * mPhase.y;',



      'vec3 LinSunCoefficient = (sunE * (betaRThetaSun + betaMSun)) / (betaRSun + betaM);',

      'vec3 LinMoonCoefficient = moonLightColor * (moonE * (betaRThetaMoon + betaMMoon)) / (betaRMoon + betaM);',

      'vec3 LinSun = pow(LinSunCoefficient * (1.0 - FexSun), vec3(1.5)) * mix(vec3(1.0),pow(LinSunCoefficient * FexSun, vec3(0.5)), linSunCoefficient2);',

      'vec3 LinMoon = pow(LinMoonCoefficient * (1.0 - FexMoon),vec3(1.5)) * mix(vec3(1.0),pow(LinMoonCoefficient * FexMoon,vec3(0.5)), linMoonCoefficient2);',



      '//Final lighting, duplicated above for coloring of sun',

      'return LinSun + LinMoon;',

    '}',



    'float haversineDistance(float az_0, float alt_0, float az_1, float alt_1){',

      '//There is a chance that our compliment (say moon at az_0 at 0 degree and az_2 at 364.99)',

      '//Results in an inaccurately large angle, thus we must check the compliment in addition to',

      '//our regular diff.',

      'float deltaAZ = az_0 - az_1;',

      'float compliment = -1.0 * max(piTimes2 - abs(deltaAZ), 0.0) * sign(deltaAZ);',

      'deltaAZ = abs(deltaAZ) < abs(compliment) ? deltaAZ : compliment;',



      '//Luckily we don not need to worry about this compliment stuff here because alt only goes between -pi and pi',

      'float deltaAlt = alt_1 - alt_0;',



      'float sinOfDeltaAzOver2 = sin(deltaAZ / 2.0);',

      'float sinOfDeltaAltOver2 = sin(deltaAlt / 2.0);',



      '//Presuming that most of our angular objects are small, we will simply use',

      '//this simple approximation... http://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/',

      'return 2.0 * asin(sqrt(sinOfDeltaAltOver2 * sinOfDeltaAltOver2 + cos(alt_0) * cos(alt_1) * sinOfDeltaAzOver2 * sinOfDeltaAzOver2));',

    '}',



    '//From http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl',

    '//Via: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl',

    'vec3 hsv2rgb(vec3 c)',

    '{',

        'vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',

        'vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',

        'return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',

    '}',



    '//From https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl',

    'vec3 rgb2hsv(vec3 c){',

      'vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);',

      'vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));',

      'vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));',



      'float d = q.x - min(q.w, q.y);',

      'float e = 1.0e-10;',

      'return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);',

    '}',



    'vec3 getLunarEcclipseShadow(float azimuthOfPixel, float altitudeOfPixel){',

      '//Determine the distance from this pixel to the center of the sun.',

      'float haversineDistanceToPixel = haversineDistance(azimuthOfPixel, altitudeOfPixel, azimuthEarthsShadow, altitudeEarthsShadow);',

      'float pixelToCenterDistanceInMoonDiameter = haversineDistanceToPixel / normalizedLunarDiameter;',

      'float umbDistSq = pixelToCenterDistanceInMoonDiameter * pixelToCenterDistanceInMoonDiameter;',

      'float pUmbDistSq = umbDistSq / 4.0;',

      'float umbraBrightness = 0.15 + 0.85 * clamp(umbDistSq, 0.0, 1.0);',

      'float penumbraBrightness = 0.5 + 0.5 * clamp(pUmbDistSq, 0.0, 1.0);',

      'float totalBrightness = clamp(min(umbraBrightness, penumbraBrightness), 0.0, 1.0);',



      '//Get color intensity based on distance from penumbra',

      'vec3 colorOfLunarEcclipse = vec3(1.0, 0.45, 0.05);',

      '// float centerToCenterDistanceInMoons = clamp(distanceToEarthsShadow/normalizedLunarDiameter, 0.0, 1.0);',

      'float colorIntensity = clamp((distanceToEarthsShadow * distanceToEarthsShadow) / (normalizedLunarDiameter * normalizedLunarDiameter), 0.0, 1.0);',

      '// float colorIntensityFactor2 = clamp(pixelToCenterDistanceInMoonDiameter / (0.5 * normalizedLunarDiameter), 0.0, 1.0);',

      'colorOfLunarEcclipse = clamp(colorOfLunarEcclipse + (1.0 - colorOfLunarEcclipse) * colorIntensity, 0.0, 1.0);',

      '//colorOfLunarEcclipse = (1.0 - colorOfLunarEcclipse) * clamp(distanceToEarthsShadow / (1.5 * normalizedLunarDiameter), 0.0, 1.0);',



      'return totalBrightness * colorOfLunarEcclipse;',

    '}',



    'vec3 getDirectLunarIntensity(vec3 moonTextureColor, vec2 uvCoords, vec3 earthShadow){',

      'vec3 baseMoonIntensity = moonTextureColor;',



      '//Get the moon shadow using the normal map',

      '//Thank you, https://beesbuzz.biz/code/hsv_color_transforms.php!',

      'vec3 moonNormalMapRGB = texture2D(moonNormalMap, uvCoords).rgb;',

      'vec3 moonNormalMapInverted = vec3(moonNormalMapRGB.r, 1.0 - moonNormalMapRGB.g, moonNormalMapRGB.b);',

      'vec3 moonSurfaceNormal = normalize(2.0 * moonNormalMapInverted - 1.0);',



      '//The moon is presumed to be a lambert shaded object, as per:',

      '//https://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Diffuse_Reflection',

      'float normalLighting = clamp(dot(moonSurfaceNormal, moonTangentSpaceSunlight), 0.0, 1.0);',

      'return vec3(clamp(earthshineE * earthshineColor + normalLighting * earthShadow, 0.0, 1.0) * baseMoonIntensity);',

    '}',



    '// Filmic ToneMapping http://filmicgames.com/archives/75',

    'const float A = 0.15;',

    'const float B = 0.50;',

    'const float C = 0.10;',

    'const float D = 0.20;',

    'const float E = 0.02;',

    'const float F = 0.30;',

    'const float W = 1000.0;',

    'const float unchartedW = 0.93034292920990640579589580673035390594971634341319642;',



    'vec3 Uncharted2Tonemap(vec3 x){',

      'return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;',

    '}',



    'vec3 applyToneMapping(vec3 outIntensity, vec3 L0){',

      'outIntensity *= 0.04;',

      'outIntensity += vec3(0.0, 0.0003, 0.00075);',



      'vec3 color = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))* outIntensity) / unchartedW;',

      'return pow(abs(color),vec3(1.0/(1.2 *(1.0 + (sunFade + moonFade)))));',

    '}',



    'void main(){',

      '//Get our lunar texture first in order to discard unwanted pixels',

      'vec4 moonTextureColor = texture2D(moonTexture, vUv);',

      'if (moonTextureColor.a < 0.05){',

          'discard;',

      '}',



      '//Get our position in the sky',

      'vec3 normalizedWorldPosition = normalize(vWorldPosition.xyz);',

      'float altitude = piOver2 - acos(normalizedWorldPosition.y);',

      'float azimuth = atan(normalizedWorldPosition.z, normalizedWorldPosition.x) + pi;',



      '// Get the current optical length',

      '// cutoff angle at 90 to avoid singularity in next formula.',

      '//presuming here that the dot of the sun direction and up is also cos(zenith angle)',

      'float cosOfZenithAngleOfCamera = max(0.0, dot(up, normalizedWorldPosition));',

      'float zenithAngleOfCamera = acos(cosOfZenithAngleOfCamera);',

      'float inverseSDenominator = 1.0 / (cosOfZenithAngleOfCamera + 0.15 * pow(93.885 - (zenithAngleOfCamera * rad2Deg), -1.253));',

      'float sR = rayleighAtmosphereHeight * inverseSDenominator;',

      'float sM = mieAtmosphereHeight * inverseSDenominator;',



      '// combined extinction factor',

      'vec3 betaMTimesSM = betaM * sM;',

      'vec3 FexSun = exp(-(betaRSun * sR + betaMTimesSM));',

      'vec3 FexMoon = exp(-(betaRMoon * sR + betaMTimesSM));',



      '//Get our night sky intensity',

      'vec3 L0 = 0.1 * FexMoon;',



      '//Get the inscattered light from the sun or the moon',

      'vec3 outIntensity = applyToneMapping(getDirectInscatteredIntensity(normalizedWorldPosition, FexSun, FexMoon) + L0, L0);',



      '//Apply dithering via the Bayer Matrix',

      '//Thanks to http://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/',

      'outIntensity += vec3(texture2D(bayerMatrix, gl_FragCoord.xy / 8.0).r / 32.0 - (1.0 / 128.0));',



      '//Get direct illumination from the moon',

      'vec3 earthShadow = getLunarEcclipseShadow(azimuth, altitude);',

      'vec3 lunarDirectLight = getDirectLunarIntensity(moonTextureColor.rgb, vUv, earthShadow);',

      'vec3 lunarColor = 1.5 * FexMoon * lunarDirectLight * moonExposure;',

      'outIntensity = clamp(sqrt(outIntensity * outIntensity + lunarColor * lunarColor), 0.0, 1.0);',



      '//Apply tone mapping to the result',

    '	gl_FragColor = vec4(outIntensity, moonTextureColor.a);',

    '}',
  ].join('\n')
});

function Moon(moonTextureDir, moonNormalMapDir, skyDomeRadius, sceneRef, textureLoader, angularDiameterOfTheMoon){
  this.moonTexture = textureLoader.load(moonTextureDir, function(moonTexture){
    moonTexture.magFilter = THREE.LinearFilter;
    moonTexture.minFilter = THREE.LinearMipMapLinearFilter;
    moonTexture.wrapS = THREE.ClampToEdgeWrapping;
    moonTexture.wrapW = THREE.ClampToEdgeWrapping;
    moonTexture.needsUpdate = true;
  });
  moonShaderMaterial.uniforms['moonTexture'].value = this.moonTexture;

  this.moonNormalMap = textureLoader.load(moonNormalMapDir, function(moonNormalTexture){
    moonNormalTexture.magFilter = THREE.LinearFilter;
    moonNormalTexture.minFilter = THREE.LinearMipMapLinearFilter;
    moonNormalTexture.wrapS = THREE.ClampToEdgeWrapping;
    moonNormalTexture.wrapW = THREE.ClampToEdgeWrapping;
    moonNormalTexture.needsUpdate = true;
  });
  moonShaderMaterial.uniforms['moonNormalMap'].value = this.moonNormalMap;

  this.xyzPosition;
  this.moonTangentSpaceSunlight;
  this.sceneRef = sceneRef;
  this.moonRadiusFromCamera = 0.68 * skyDomeRadius;

  //Create a three JS plane for our moon to live on in a hidden view
  this.angularRadiusOfTheMoon = angularDiameterOfTheMoon;
  let diameterOfMoonPlane = 2.0 * this.moonRadiusFromCamera * Math.sin(angularDiameterOfTheMoon);
  this.geometry = new THREE.PlaneGeometry(diameterOfMoonPlane, diameterOfMoonPlane, 1);
  this.geometry.translate(0.0, -0.0 * diameterOfMoonPlane, 0.0);

  //Set up our lunar diameter once, while we are here
  this.normalizedLunarDiameter = Math.sin(angularDiameterOfTheMoon);
  moonShaderMaterial.uniforms['normalizedLunarDiameter'].value = this.normalizedLunarDiameter;
  this.lightingColor =  new THREE.Vector3(1.0, 0.45, 0.05);

  //Apply this shader to our plane
  this.plane = new THREE.Mesh(this.geometry, moonShaderMaterial);
  this.plane.matrixAutoUpdate = false;
  this.sceneRef.add(this.plane);
  this.position = new THREE.Vector3();
  this.planeNormal = new THREE.Vector3();
  this.origin = new THREE.Vector3();
  this.planeU = new THREE.Vector3();
  this.planeV = new THREE.Vector3();
  this.translationToTangentSpace = new THREE.Matrix3();
  this.lightDirection = new THREE.Vector3();

  //Create a directional light for the moon
  this.oneVector = new THREE.Vector3(1.0, 1.0, 1.0);
  this.up = new THREE.Vector3(0.0, 1.0, 0.0);
  this.light = new THREE.DirectionalLight(0xffffff, 1.0);
  this.light.castShadow = true;
  this.light.shadow.mapSize.width = 512*2;
  this.light.shadow.mapSize.height = 512*2;
  this.light.shadow.camera.near = 10.0;
  this.light.shadow.camera.far = this.moonRadiusFromCamera * 2.0;
  this.sceneRef.add(this.light);
  this.fexMoon = new THREE.Vector3();
  this.directlightColor = new THREE.Color();
  this.directLightIntensity;
  this.ambientColor = new THREE.Vector3();
  this.ambientIntensity;

  this.update = function(moonPosition, sunPosition, moonAz, moonAlt, betaRMoon, betaM, moonE, moonFade, lunarIntensityModifier, sunFadeTimesSunE){
    //move and rotate the moon
    let p = this.plane;
    this.position.set(moonPosition.x, moonPosition.y, moonPosition.z).multiplyScalar(this.moonRadiusFromCamera);
    p.position.set(this.position.x, this.position.y, this.position.z);
    p.lookAt(0.0,0.0,0.0);
    p.updateMatrix();

    let l = this.light;

    l.position.set(this.position.x, this.position.y, this.position.z);
    let cosZenithAngleOfMoon = Math.max(0.0, this.up.dot(moonPosition));
    let zenithAngleOfMoon = Math.acos(cosZenithAngleOfMoon);
    let angleOfMoon = (0.5 * Math.PI) - zenithAngleOfMoon
    let sinOfAngleOfMoon = Math.sin(angleOfMoon);
    let inverseSDenominator = 1.0 / (cosZenithAngleOfMoon + 0.15 * Math.pow(93.885 - (zenithAngleOfMoon * 180.0 / Math.PI), -1.253));
    const rayleighAtmosphereHeight = 8.4E3;
    const mieAtmosphereHeight = 1.25E3;
    let sR = rayleighAtmosphereHeight * inverseSDenominator;
    let sM = mieAtmosphereHeight * inverseSDenominator;
    let betaMTimesSM = betaM.clone().multiplyScalar(sM);
    this.fexMoon.set(
      Math.max(Math.min(this.lightingColor.x * Math.exp(-(betaRMoon.x * sR + betaMTimesSM.x)), 1.0), 0.0),
      Math.max(Math.min(this.lightingColor.y * Math.exp(-(betaRMoon.y * sR + betaMTimesSM.y)), 1.0), 0.0),
      Math.max(Math.min(this.lightingColor.z * Math.exp(-(betaRMoon.z * sR + betaMTimesSM.z)), 1.0), 0.0)
    );
    l.color.setRGB(this.fexMoon.x, this.fexMoon.y, this.fexMoon.z);

    let lunarLightBaseIntensitySquared = moonE / (40.0 + Math.sqrt(sunFadeTimesSunE) * 0.001);
    let lunarLightBaseIntensity = Math.sqrt(lunarLightBaseIntensitySquared) * lunarIntensityModifier;
    l.intensity = lunarLightBaseIntensity;
    let ambientColorVec = this.oneVector.clone().sub(this.fexMoon);
    this.ambientColor = ambientColorVec;
    this.ambientIntensity = lunarLightBaseIntensity * moonFade;

    //Update our earthshine
    //Note that our sun and moon positions are always normalized.
    let phaseAngle = Math.PI - Math.acos(moonPosition.clone().dot(sunPosition));

    //From
    //https://pdfs.semanticscholar.org/fce4/4229921fcb850540a636bd28b33e30b18c3f.pdf
    let earthShine = -0.0061 * phaseAngle * phaseAngle * phaseAngle + 0.0289 * phaseAngle * phaseAngle - 0.0105 * Math.sin(phaseAngle);
    moonShaderMaterial.uniforms['earthshineE'].value = earthShine * 1.15;

    //Update our data for our lunar ecclipses
    //Get the opposite location of our sun in the sky
    let earthShadowCenter = sunPosition.clone().negate();

    //Calculate the haverstine distance between the moon and the earths shadow
    //Determine the azimuth and altitude of this location
    let azimuthOfEarthsShadow = Math.atan2(earthShadowCenter.z, earthShadowCenter.x) + Math.PI;
    let altitudeOfEarthsShadow = (Math.PI * 0.5) - Math.acos(earthShadowCenter.y);
    moonShaderMaterial.uniforms['azimuthEarthsShadow'].value = azimuthOfEarthsShadow;
    moonShaderMaterial.uniforms['altitudeEarthsShadow'].value = altitudeOfEarthsShadow;

    //Determine the haversine distance between the moon and this location
    let modifiedAzMoon = moonAz - Math.PI;
    let modifiedAzShadow = azimuthOfEarthsShadow - Math.PI;
    let deltaAZ = modifiedAzMoon-modifiedAzShadow;
    let compliment = -1.0 * Math.max(2.0 * Math.PI - Math.abs(deltaAZ), 0.0) * Math.sign(deltaAZ);
    deltaAZ = Math.abs(deltaAZ) < Math.abs(compliment) ? deltaAZ : compliment;

    //Luckily we don not need to worry about this compliment stuff here because alt only goes between -pi and pi
    let deltaAlt = moonAlt-altitudeOfEarthsShadow;

    let sinOfDeltaAzOver2 = Math.sin(deltaAZ / 2.0);
    let sinOfDeltaAltOver2 = Math.sin(deltaAlt / 2.0);

    //Presuming that most of our angular objects are small, we will simply use
    //this simple approximation... http://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/
    distanceToEarthsShadow = 2.0 * Math.asin(Math.sqrt(sinOfDeltaAltOver2 * sinOfDeltaAltOver2 + Math.cos(moonAlt) * Math.cos(altitudeOfEarthsShadow) * sinOfDeltaAzOver2 * sinOfDeltaAzOver2));
    moonShaderMaterial.uniforms['distanceToEarthsShadow'].value = distanceToEarthsShadow;

    //Determine the color of the moonlight used for atmospheric scattering
    this.lightingColor.set(1.0, 0.5, 0.1);
    let colorIntensity = Math.min(Math.max((distanceToEarthsShadow * distanceToEarthsShadow) / (this.normalizedLunarDiameter * this.normalizedLunarDiameter), 0.0), 1.0);
    let lightIntensity = Math.min(Math.max((distanceToEarthsShadow * distanceToEarthsShadow) / (this.normalizedLunarDiameter * this.normalizedLunarDiameter), 0.0), 0.8);
    this.lightingColor.x = Math.min(Math.max(this.lightingColor.x + (1.0 - this.lightingColor.x) * colorIntensity, 0.0), 1.0);
    this.lightingColor.y = Math.min(Math.max(this.lightingColor.y + (1.0 - this.lightingColor.y) * colorIntensity, 0.0), 1.0);
    this.lightingColor.z = Math.min(Math.max(this.lightingColor.z + (1.0 - this.lightingColor.z) * colorIntensity, 0.0), 1.0);
    this.lightingColor.multiplyScalar(lightIntensity + 0.2);
    skyShaderMaterial.uniforms['moonLightColor'].value.set(this.lightingColor.x, this.lightingColor.y, this.lightingColor.z);
    sunShaderMaterial.uniforms['moonLightColor'].value.set(this.lightingColor.x, this.lightingColor.y, this.lightingColor.z);
    moonShaderMaterial.uniforms['moonLightColor'].value.set(this.lightingColor.x, this.lightingColor.y, this.lightingColor.z);

    //update our uv coordinates
    let vertices = p.geometry.vertices;
    p.updateMatrixWorld();
    this.origin.set(vertices[0].x, vertices[0].y, vertices[0].z);
    this.origin.applyMatrix4(p.matrixWorld);
    this.planeU.set(vertices[1].x, vertices[1].y, vertices[1].z);
    this.planeU.applyMatrix4(p.matrixWorld).sub(this.origin);
    this.planeU.normalize();
    this.planeV.set(vertices[2].x, vertices[2].y, vertices[2].z);
    this.planeV.applyMatrix4(p.matrixWorld).sub(this.origin);
    this.planeV.normalize();
    let normal = this.planeNormal.set(moonPosition.x, moonPosition.y, moonPosition.z).multiplyScalar(-1.0);
    this.translationToTangentSpace.set(
      this.planeU.x, this.planeV.x, normal.x,
      this.planeU.y, this.planeV.y, normal.y,
      this.planeU.z, this.planeV.z, normal.z,
    );
    this.translationToTangentSpace.transpose();
    this.lightDirection.set(sunPosition.x, sunPosition.y, sunPosition.z);
    this.lightDirection.applyMatrix3(this.translationToTangentSpace);

    moonShaderMaterial.uniforms['moonTangentSpaceSunlight'].value = this.lightDirection;
  }
}

//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
var skyShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    rayleigh: {type: 'f', value: 0.0},
    rayleighCoefficientOfSun: {type: 'f', value: 0.0},
    rayleighCoefficientOfMoon: {type: 'f', value: 0.0},
    sunFade: {type: 'f', value: 0.0},
    moonFade: {type: 'f', value: 0.0},
    luminance: {type: 'f', value: 0.0},
    mieDirectionalG: {type: 'f', value: 0.0},
    moonE: {type: 'f', value: 0.0},
    sunE: {type: 'f', value: 0.0},
    linMoonCoefficient2: {type: 'f', value: 0.0},
    linSunCoefficient2: {type: 'f', value: 0.0},
    starsExposure: {type: 'f', value: 0.0},
    betaM: {type: 'v3',value: new THREE.Vector3()},
    sunXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    betaRSun: {type: 'v3', value: new THREE.Vector3()},
    betaRMoon: {type: 'v3', value: new THREE.Vector3()},
    moonTangentSpaceSunlight: {type: 'v3', value: new THREE.Vector3()},
    moonXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    moonLightColor: {type: 'v3', value: new THREE.Vector3()},
    uTime: {type: 'f', default: 0.005},
    latLong: {type: 'v2', value: new THREE.Vector2()},
    hourAngle: {type: 'f', value: 0.0},
    localSiderealTime: {type: 'f', value: 0.0},
    starIndexer: {type: 't', value: null},
    starData: {type: 't', value: null},
    bayerMatrix: {type: 't', value: null}
  },

  side: THREE.BackSide,
  blending: THREE.NormalBlending,
  transparent: false,

  vertexShader: [

    '#ifdef GL_ES',

    'precision mediump float;',

    'precision mediump int;',

    '#endif',



    'varying vec3 vWorldPosition;',

    'varying vec3 betaRPixel;',



    'uniform float rayleigh;',



    'void main() {',

      'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',

      'vWorldPosition = worldPosition.xyz;',

      'vec3 normalizedWorldPosition = normalize(vWorldPosition);',



      'vec3 simplifiedRayleigh = vec3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);',

      'float pixelFade = 1.0 - clamp(1.0 - exp(normalizedWorldPosition.z), 0.0, 1.0);',

      'betaRPixel = simplifiedRayleigh * (rayleigh - (1.0 - pixelFade));',



      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}',
  ].join('\n'),

  fragmentShader: [

    '//',

    '//Many thanks to https://github.com/wwwtyro/glsl-atmosphere, which was useful in setting up my first GLSL project :D',

    '//',



    '#ifdef GL_ES',

    'precision mediump float;',

    'precision mediump int;',

    '#endif',



    '//Varyings',

    'varying vec3 vWorldPosition;',

    'varying vec3 betaRPixel;',



    '//Uniforms',

    'uniform float rayleigh;',

    'uniform float sunFade;',

    'uniform float moonFade;',

    'uniform float luminance;',

    'uniform float mieDirectionalG;',

    'uniform vec3 betaM;',

    'uniform vec3 sunXYZPosition;',

    'uniform vec3 betaRSun;',

    'uniform vec3 betaRMoon;',

    'uniform sampler2D moonTexture;',

    'uniform sampler2D moonNormalMap;',

    'uniform vec3 moonTangentSpaceSunlight;',

    'uniform vec3 moonXYZPosition;',

    'uniform vec3 moonLightColor;',

    'uniform float moonE;',

    'uniform float sunE;',

    'uniform float linMoonCoefficient2; //clamp(pow(1.0-dotOfMoonDirectionAndUp,5.0),0.0,1.0)',

    'uniform float linSunCoefficient2; //clamp(pow(1.0-dotOfSunDirectionAndUp,5.0),0.0,1.0)',

    'uniform float starsExposure;',

    'uniform sampler2D bayerMatrix;',



    '//Constants',

    'const vec3 up = vec3(0.0, 1.0, 0.0);',

    'const float e = 2.71828182845904523536028747135266249775724709369995957;',

    'const float piOver2 = 1.570796326794896619231321691639751442098584699687552910487;',

    'const float oneOverFourPi = 0.079577471545947667884441881686257181017229822870228224373;',

    'const float piTimes2 = 6.283185307179586476925286766559005768394338798750211641949;',

    'const float pi = 3.141592653589793238462643383279502884197169;',

    'const float rayleighPhaseConst = 0.059683103659460750913331411264692885762922367152671168280;',

    'const float rayleighAtmosphereHeight = 8.4E3;',

    'const float mieAtmosphereHeight = 1.25E3;',

    'const float rad2Deg = 57.29577951308232087679815481410517033240547246656432154916;',

    'const float angularRadiusOfTheSun = 0.0245;',



    '//Time',

    'uniform float uTime;',



    '//Star Data (passed from our fragment shader)',

    'uniform sampler2D starIndexer;',

    'uniform sampler2D starData;',



    '//Earth data',

    'uniform vec2 latLong;',

    'uniform float localSiderealTime;',



    '//',

    '//UTIL FUNCTIONS',

    '//',



    '//Thanks to, https://github.com/msfeldstein/glsl-map/blob/master/index.glsl',

    'float map(float value, float inMin, float inMax, float outMin, float outMax) {',

      'return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);',

    '}',



    'int modulo(float a, float b){',

      'return int(a - (b * floor(a/b)));',

    '}',



    'float fModulo(float a, float b){',

      'return (a - (b * floor(a / b)));',

    '}',



    '//From http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl',

    '//Via: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl',

    'vec3 hsv2rgb(vec3 c)',

    '{',

        'vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',

        'vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',

        'return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',

    '}',



    '//From https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl',

    'vec3 rgb2hsv(vec3 c){',

      'vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);',

      'vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));',

      'vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));',



      'float d = q.x - min(q.w, q.y);',

      'float e = 1.0e-10;',

      'return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);',

    '}',



    '//From http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/',

    'float rand(float x){',

        'float a = 12.9898;',

        'float b = 78.233;',

        'float c = 43758.5453;',

        'float dt= dot(vec2(x, x) ,vec2(a,b));',

        'float sn= mod(dt,3.14);',

        'return fract(sin(sn) * c);',

    '}',



    '//This converts our local sky coordinates from azimuth and altitude',

    '//into ra and dec, which is useful for picking out stars',

    '//With a bit of help from https://mathematica.stackexchange.com/questions/69330/astronomy-transform-coordinates-from-horizon-to-equatorial',

    '//Updated with help from https://en.wikipedia.org/wiki/Celestial_coordinate_system',

    'vec2 getRaAndDec(float az, float alt){',

      'float declination = asin(sin(latLong.x) * sin(alt) - cos(latLong.x) * cos(alt) * cos(az));',

      'float hourAngle = atan(sin(az), (cos(az) * sin(latLong.x) + tan(alt) * cos(latLong.x)));',

      'float rightAscension = fModulo(localSiderealTime - hourAngle, piTimes2);',



      'return vec2(rightAscension, declination);',

    '}',



    'float getAltitude(float rightAscension, float declination){',

      '//Get the hour angle from the right ascension and declination of the star',

      'float hourAngle = fModulo(localSiderealTime - rightAscension, piTimes2);',



      '//Use this information to derive the altitude of the star',

      'return asin(sin(latLong.x) * sin(declination) + cos(latLong.x) * cos(declination) * cos(hourAngle));',

    '}',



    '//This is useful for converting our values from rgb colors into floats',

    'float rgba2Float(vec4 colorIn){',

      'vec4 colorIn255bits = floor(colorIn * 255.0);',



      'float floatSign = (step(0.5,  float(modulo(colorIn255bits.a, 2.0)) ) - 0.5) * 2.0;',

      'float floatExponential = float(((int(colorIn255bits.a)) / 2) - 64);',

      'float floatValue = floatSign * (colorIn255bits.r * 256.0 * 256.0 + colorIn255bits.g * 256.0 + colorIn255bits.b) * pow(10.0, floatExponential);',



      'return floatValue;',

    '}',



    '//This fellow is useful for the disks of the sun and the moon',

    '//and the glow of stars... It is fast and efficient at small angles',

    'float haversineDistance(float az_0, float alt_0, float az_1, float alt_1){',

      '//There is a chance that our compliment (say moon at az_0 at 0 degree and az_2 at 364.99)',

      '//Results in an inaccurately large angle, thus we must check the compliment in addition to',

      '//our regular diff.',

      'float deltaAZ = az_0 - az_1;',

      'float compliment = -1.0 * max(piTimes2 - abs(deltaAZ), 0.0) * sign(deltaAZ);',

      'deltaAZ = abs(deltaAZ) < abs(compliment) ? deltaAZ : compliment;',



      '//Luckily we don not need to worry about this compliment stuff here because alt only goes between -pi and pi',

      'float deltaAlt = alt_1 - alt_0;',



      'float sinOfDeltaAzOver2 = sin(deltaAZ / 2.0);',

      'float sinOfDeltaAltOver2 = sin(deltaAlt / 2.0);',



      '//Presuming that most of our angular objects are small, we will simply use',

      '//this simple approximation... http://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/',

      'return 2.0 * asin(sqrt(sinOfDeltaAltOver2 * sinOfDeltaAltOver2 + cos(alt_0) * cos(alt_1) * sinOfDeltaAzOver2 * sinOfDeltaAzOver2));',

    '}',



    '//From The Book of Shaders :D',

    '//https://thebookofshaders.com/11/',

    'float noise(float x){',

      'float i = floor(x);',

      'float f = fract(x);',

      'float y = mix(rand(i), rand(i + 1.0), smoothstep(0.0,1.0,f));',



      'return y;',

    '}',



    'float brownianNoise(float lacunarity, float gain, float initialAmplitude, float initialFrequency, float timeInSeconds){',

      'float amplitude = initialAmplitude;',

      'float frequency = initialFrequency;',



      '// Loop of octaves',

      'float y = 0.0;',

      'float maxAmplitude = initialAmplitude;',

      'for (int i = 0; i < 5; i++) {',

      '	y += amplitude * noise(frequency * timeInSeconds);',

      '	frequency *= lacunarity;',

      '	amplitude *= gain;',

      '}',



      'return y;',

    '}',



    '//This whole method is one big exercise in ad hoc math for the fun of it.',

    '//const vec3 colorizeColor = vec3(0.265, 0.46875, 0.87890);',

    'const vec3 colorizeColor = vec3(0.21, 0.37, 0.50);',

    'const float twinkleDust = 0.002;',

    'vec3 drawStar(vec2 raAndDec, vec2 raAndDecOfStar, float magnitudeOfStar, vec3 starColor, float altitudeOfPixel){',

      '//float maxRadiusOfStar = 1.4 * (2.0/360.0) * piTimes2;',

      'float normalizedMagnitude = (1.0 - (magnitudeOfStar + 1.46) / 7.96) / 15.0;',



      '//Get the stars altitude',

      'float starAlt = getAltitude(raAndDecOfStar.x, raAndDecOfStar.y);',



      '//Determine brightness',

      'float brightnessVariation = 0.99 * pow((1.0 - starAlt / piOver2), 0.5);',

      'float randSeed = uTime * twinkleDust * (1.0 + rand(rand(raAndDecOfStar.x) + rand(raAndDecOfStar.y)));',



      '// float lacunarity= 0.8;',

      '// float gain = 0.55;',

      '// float initialAmplitude = 1.0;',

      '// float initialFrequency = 2.0;',

      '//lacunarity, gain, initialAmplitude, initialFrequency',

      'float brightnessCoeficient = 1.0 + brightnessVariation * (brownianNoise(0.8, 0.55, 1.0, 2.0, randSeed) - 1.0);',

      'float brightness = brightnessCoeficient * normalizedMagnitude * normalizedMagnitude;',



      '//Draw the star out from this data',

      '//distance from star over normalizing factor',

      'float distanceFromStar = haversineDistance(raAndDec.x, raAndDec.y, raAndDecOfStar.x, raAndDecOfStar.y) * 600.0;',

      'float oneOverDistanceSquared = 1.0 / (distanceFromStar * distanceFromStar);',

      '//Determine color',

      '// lacunarity= 0.8;',

      '// gain = 0.0;',

      '// initialAmplitude = 0.65;',

      '// initialFrequency = 1.0;',

      'float hue = brownianNoise(0.8, 0.0, 0.65, 1.0, randSeed);',

      'vec3 starColorVariation = vec3(hue, clamp(pow((1.0 - starAlt / piOver2), 3.0) / 2.0, 0.0, 0.2), 1.0);',

      'vec3 pixelColor = starColor;',

      'vec3 pixelHSV = rgb2hsv(pixelColor);',

      'pixelHSV.x = pixelHSV.x + starColorVariation.x;',

      'pixelHSV.y = clamp(pixelHSV.y + starColorVariation.x - 0.8, 0.0, 1.0);',

      'pixelColor = hsv2rgb(pixelHSV);',

      'vec3 coloredstarLight = 1200.0 * pixelColor * clamp(brightness * oneOverDistanceSquared, 0.0, brightness);',

      'float avgStarLightRGB = (coloredstarLight.x + coloredstarLight.y + coloredstarLight.z) / 3.0;',

      'vec3 colorize = avgStarLightRGB * colorizeColor / sqrt(dot(colorizeColor, colorizeColor));',

      'coloredstarLight = mix(coloredstarLight, colorize, 0.8);',



      'return coloredstarLight;',

    '}',



    '//',

    '//STARS',

    '//',

    'vec3 drawStarLayer(float azimuthOfPixel, float altitudeOfPixel){',

      '//Convert our ra and dec varying into pixel coordinates.',

      'vec2 raAndDecOfPixel = getRaAndDec(azimuthOfPixel, altitudeOfPixel);',

      'float pixelRa = raAndDecOfPixel.x;',

      'float pixelDec = raAndDecOfPixel.y;',

      'vec2 searchPosition = vec2(pixelRa / piTimes2, 0.5 * ((pixelDec / pi) + 0.5));',



      'vec4 starIndexerPixel = texture2D(starIndexer, searchPosition);',

      'vec2 starIndex1 = starIndexerPixel.rg;',

      'vec2 starIndex2 = starIndexerPixel.ba;',



      '//Get our data',

      'float star1Ra = rgba2Float(texture2D(starData, starIndex1));',

      'float star2Ra = rgba2Float(texture2D(starData, starIndex2));',



      'vec4 decCoord12 = starIndexerPixel + vec4(0.5, 0.0, 0.5, 0.0);',

      'float star1Dec = rgba2Float(texture2D(starData, decCoord12.rg));',

      'float star2Dec = rgba2Float(texture2D(starData, decCoord12.ba));',



      'vec4 magCoord12 = starIndexerPixel + vec4(0.0, 0.5, 0.0, 0.5);',

      'float star1Mag = rgba2Float(texture2D(starData, magCoord12.rg));',

      'float star2Mag = rgba2Float(texture2D(starData, magCoord12.ba));',



      'vec4 colorCoord12 = starIndexerPixel + vec4(0.5, 0.5, 0.5, 0.5);',

      'vec3 star1Color = texture2D(starData, colorCoord12.rg).rgb;',

      'vec3 star2Color = texture2D(starData, colorCoord12.ba).rgb;',



      'vec3 returnColor = vec3(0.0);',

      'vec3 starLight = drawStar(vec2(pixelRa, pixelDec), vec2(star1Ra, star1Dec), star1Mag, star1Color, altitudeOfPixel);',

      'returnColor += starLight * starLight;',



      'starLight = drawStar(vec2(pixelRa, pixelDec), vec2(star2Ra, star2Dec), star2Mag, star2Color, altitudeOfPixel);',

      'returnColor += starLight * starLight;',



      '//Now do the same thing with the second set of stars',

      'searchPosition.y += 0.5;',



      'starIndexerPixel = texture2D(starIndexer, searchPosition);',

      'starIndex1 = starIndexerPixel.rg;',

      'starIndex2 = starIndexerPixel.ba;',



      'star1Ra = rgba2Float(texture2D(starData, starIndex1));',

      'star2Ra = rgba2Float(texture2D(starData, starIndex2));',



      'decCoord12 = starIndexerPixel + vec4(0.5, 0.0, 0.5, 0.0);',

      'star1Dec = rgba2Float(texture2D(starData, decCoord12.rg));',

      'star2Dec = rgba2Float(texture2D(starData, decCoord12.ba));',



      'magCoord12 = starIndexerPixel + vec4(0.0, 0.5, 0.0, 0.5);',

      'star1Mag = rgba2Float(texture2D(starData, magCoord12.rg));',

      'star2Mag = rgba2Float(texture2D(starData, magCoord12.ba));',



      'colorCoord12 = starIndexerPixel + vec4(0.5, 0.5, 0.5, 0.5);',

      'star1Color = texture2D(starData, colorCoord12.rg).rgb;',

      'star2Color = texture2D(starData, colorCoord12.ba).rgb;',



      'starLight = drawStar(vec2(pixelRa, pixelDec), vec2(star1Ra, star1Dec), star1Mag, star1Color, altitudeOfPixel);',

      'returnColor += starLight * starLight;',



      'starLight = drawStar(vec2(pixelRa, pixelDec), vec2(star2Ra, star2Dec), star2Mag, star2Color, altitudeOfPixel);',

      'returnColor += starLight * starLight;',

      'return returnColor;',

    '}',



    '//',

    '//SKY',

    '//',



    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',

    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',

    'vec2 rayleighPhase(vec2 cosTheta){',

      'return rayleighPhaseConst * (1.0 + cosTheta * cosTheta);',

    '}',



    'vec2 hgPhase(vec2 cosTheta){',

      'return oneOverFourPi * ((1.0 - mieDirectionalG * mieDirectionalG) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + (mieDirectionalG * mieDirectionalG), vec2(1.5)));',

    '}',



    'vec3 drawSkyLayer(vec2 cosTheta, vec3 FexSun, vec3 FexMoon){',

      'vec2 rPhase = rayleighPhase(vec2(0.5) * (vec2(1.0) + cosTheta));',

      'vec3 betaRThetaSun = betaRSun * rPhase.x;',

      'vec3 betaRThetaMoon = betaRMoon * rPhase.y;',



      '//Calculate the mie phase angles',

      'vec2 mPhase = hgPhase(cosTheta);',

      'vec3 betaMSun = betaM * mPhase.x;',

      'vec3 betaMMoon = betaM * mPhase.y;',



      'vec3 LinSunCoefficient = (sunE * (betaRThetaSun + betaMSun)) / (betaRSun + betaM);',

      'vec3 LinMoonCoefficient = moonLightColor * (moonE * (betaRThetaMoon + betaMMoon)) / (betaRMoon + betaM);',

      'vec3 LinSun = pow(LinSunCoefficient * (1.0 - FexSun), vec3(1.5)) * mix(vec3(1.0),pow(LinSunCoefficient * FexSun, vec3(0.5)), linSunCoefficient2);',

      'vec3 LinMoon = pow(LinMoonCoefficient * (1.0 - FexMoon),vec3(1.5)) * mix(vec3(1.0),pow(LinMoonCoefficient * FexMoon,vec3(0.5)), linMoonCoefficient2);',



      '//Final lighting, duplicated above for coloring of sun',

      'return LinSun + LinMoon;',

    '}',



    '//',

    '//Tonemapping',

    '//',

    '// Filmic ToneMapping http://filmicgames.com/archives/75',

    'const float A = 0.15;',

    'const float B = 0.50;',

    'const float C = 0.10;',

    'const float D = 0.20;',

    'const float E = 0.02;',

    'const float F = 0.30;',

    'const float W = 1000.0;',

    'const float unchartedW = 0.93034292920990640579589580673035390594971634341319642;',



    'vec3 Uncharted2Tonemap(vec3 x){',

      'return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;',

    '}',



    'vec3 applyToneMapping(vec3 outIntensity, vec3 L0){',

      'outIntensity *= 0.04;',

      'outIntensity += vec3(0.0, 0.0003, 0.00075);',



      'vec3 color = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))* outIntensity) / unchartedW;',

      'return pow(abs(color),vec3(1.0/(1.2 *(1.0 + (sunFade + moonFade)))));',

    '}',



    '//',

    '//Draw main loop',

    '//',

    'void main(){',

      'vec3 normalizedWorldPosition = normalize(vWorldPosition.xyz);',

      'float altitude = piOver2 - acos(normalizedWorldPosition.y);',

      'float azimuth = atan(normalizedWorldPosition.z, normalizedWorldPosition.x) + pi;',



      '// Get the current optical length',

      '// cutoff angle at 90 to avoid singularity in next formula.',

      '//presuming here that the dot of the sun direction and up is also cos(zenith angle)',

      'float cosOfZenithAngleOfCamera = max(0.0, dot(up, normalizedWorldPosition));',

      'float zenithAngleOfCamera = acos(cosOfZenithAngleOfCamera);',

      'float inverseSDenominator = 1.0 / (cosOfZenithAngleOfCamera + 0.15 * pow(93.885 - (zenithAngleOfCamera * rad2Deg), -1.253));',

      'float sR = rayleighAtmosphereHeight * inverseSDenominator;',

      'float sM = mieAtmosphereHeight * inverseSDenominator;',



      '// combined extinction factor',

      'vec3 betaMTimesSM = betaM * sM;',

      'vec3 FexSun = exp(-(betaRSun * sR + betaMTimesSM));',

      'vec3 FexMoon = exp(-(betaRMoon * sR + betaMTimesSM));',

      'vec3 FexPixel = exp(-(betaRPixel * sR + betaMTimesSM));',



      '//Get our night sky intensity',

      'vec3 L0 = 0.1 * FexMoon;',



      '//Even though everything else is behind the sky, we need this to decide the brightness of the colors returned below.',

      '//Also, whenever the sun falls below the horizon, everything explodes in the original code.',

      '//Thus, I have taken the liberty of killing the sky when that happens to avoid explody code.',

      'vec2 cosTheta = vec2(dot(normalizedWorldPosition, sunXYZPosition), dot(normalizedWorldPosition, moonXYZPosition));',

      'vec3 skyColor = applyToneMapping(drawSkyLayer(cosTheta, FexSun, FexMoon) + L0, L0);',



      '//Apply dithering via the Bayer Matrix',

      '//Thanks to http://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/',

      'skyColor += vec3(texture2D(bayerMatrix, gl_FragCoord.xy / 8.0).r / 32.0 - (1.0 / 128.0));',



      'vec3 skyColorSquared = (drawStarLayer(azimuth, altitude) * FexPixel) * starsExposure + skyColor * skyColor;',



      'gl_FragColor = vec4(clamp(sqrt(skyColorSquared), 0.0, 1.0), 1.0);',

    '}',
  ].join('\n')
});

skyShaderMaterial.clipping = true;
skyShaderMaterial.flatShading = true;

//This helps
//--------------------------v
//https://github.com/mrdoob/three.js/wiki/Uniforms-types
var sunShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    rayleigh: {type: 'f', value: 0.0},
    rayleighCoefficientOfSun: {type: 'f', value: 0.0},
    sunFade: {type: 'f',value: 0.0},
    moonFade: {type: 'f', value: 0.0},
    luminance: {type: 'f',value: 0.0},
    mieDirectionalG: {type: 'f',value: 0.0},
    sunE: {type: 'f',value: 0.0},
    moonE: {type: 'f',value: 0.0},
    linMoonCoefficient2: {type: 'f',value: 0.0},
    linSunCoefficient2: {type: 'f',value: 0.0},
    angularDiameterOfTheSun: {type: 'f', value: 0.0},
    betaM: {type: 'v3',value: new THREE.Vector3()},
    betaRSun: {type: 'v3', value: new THREE.Vector3()},
    betaRMoon: {type: 'v3', value: new THREE.Vector3()},
    sunXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    moonXYZPosition: {type: 'v3', value: new THREE.Vector3()},
    moonLightColor: {type: 'v3', value: new THREE.Vector3()},
    bayerMatrix: {type: 't', value: null},
    sunTexture: {type: 't', value: null}
  },

  transparent: true,
  lights: false,
  flatShading: true,
  clipping: true,

  vertexShader: [

    '#ifdef GL_ES',

    'precision mediump float;',

    'precision mediump int;',

    '#endif',



    'varying vec3 vWorldPosition;',

    'varying vec3 betaRPixel;',

    'varying vec2 vUv;',



    'uniform float rayleigh;',



    'void main() {',

      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',

      'vWorldPosition = worldPosition.xyz;',

      'vec3 normalizedWorldPosition = normalize(worldPosition.xyz);',



      'vUv = uv;',



      'vec3 simplifiedRayleigh = vec3(0.0005 / 94.0, 0.0005 / 40.0, 0.0005 / 18.0);',

      'float pixelFade = 1.0 - clamp(1.0 - exp(normalizedWorldPosition.z), 0.0, 1.0);',

      'betaRPixel = simplifiedRayleigh * (rayleigh - (1.0 - pixelFade));',



      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

    '}',
  ].join('\n'),

  fragmentShader: [

    '#ifdef GL_ES',

    'precision mediump float;',

    'precision mediump int;',

    '#endif',



    '//Varyings',

    'varying vec3 vWorldPosition;',

    'varying vec3 betaRPixel;',

    'varying vec2 vUv;',



    '//Uniforms',

    'uniform float sunFade;',

    'uniform float moonFade;',

    'uniform float luminance;',

    'uniform float mieDirectionalG;',

    'uniform vec3 betaM;',

    'uniform vec3 betaRSun;',

    'uniform vec3 betaRMoon;',

    'uniform vec3 sunXYZPosition;',

    'uniform vec3 moonXYZPosition;',

    'uniform vec3 moonLightColor;',

    'uniform float sunE;',

    'uniform float moonE;',

    'uniform float linMoonCoefficient2;',

    'uniform float linSunCoefficient2;',

    'uniform float angularDiameterOfTheSun;',

    'uniform sampler2D bayerMatrix;',

    'uniform sampler2D sunTexture;',



    '//Constants',

    'const vec3 up = vec3(0.0, 1.0, 0.0);',

    'const float e = 2.71828182845904523536028747135266249775724709369995957;',

    'const float oneOverFourPi = 0.079577471545947667884441881686257181017229822870228224373;',

    'const float rayleighPhaseConst = 0.059683103659460750913331411264692885762922367152671168280;',

    'const float rayleighAtmosphereHeight = 8.4E3;',

    'const float mieAtmosphereHeight = 1.25E3;',

    'const float rad2Deg = 57.29577951308232087679815481410517033240547246656432154916;',



    '// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness',

    '// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE',

    'vec2 rayleighPhase(vec2 cosTheta){',

      'return rayleighPhaseConst * (1.0 + cosTheta * cosTheta);',

    '}',



    'vec2 hgPhase(vec2 cosTheta){',

      'return oneOverFourPi * ((1.0 - mieDirectionalG * mieDirectionalG) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + (mieDirectionalG * mieDirectionalG), vec2(1.5)));',

    '}',



    'vec3 getDirectInscatteredIntensity(vec3 normalizedWorldPosition, vec3 FexSun, vec3 FexMoon){',

      '//Cos theta of sun and moon',

      'vec2 cosTheta = vec2(dot(normalizedWorldPosition, sunXYZPosition), dot(normalizedWorldPosition, moonXYZPosition));',

      'vec2 rPhase = rayleighPhase(vec2(0.5) * (vec2(1.0) + cosTheta));',

      'vec3 betaRThetaSun = betaRSun * rPhase.x;',

      'vec3 betaRThetaMoon = betaRMoon * rPhase.y;',



      '//Calculate the mie phase angles',

      'vec2 mPhase = hgPhase(cosTheta);',

      'vec3 betaMSun = betaM * mPhase.x;',

      'vec3 betaMMoon = betaM * mPhase.y;',



      'vec3 LinSunCoefficient = (sunE * (betaRThetaSun + betaMSun)) / (betaRSun + betaM);',

      'vec3 LinMoonCoefficient = moonLightColor * (moonE * (betaRThetaMoon + betaMMoon)) / (betaRMoon + betaM);',

      'vec3 LinSun = pow(LinSunCoefficient * (1.0 - FexSun), vec3(1.5)) * mix(vec3(1.0),pow(LinSunCoefficient * FexSun, vec3(0.5)), linSunCoefficient2);',

      'vec3 LinMoon = pow(LinMoonCoefficient * (1.0 - FexMoon),vec3(1.5)) * mix(vec3(1.0),pow(LinMoonCoefficient * FexMoon,vec3(0.5)), linMoonCoefficient2);',



      '//Final lighting, duplicated above for coloring of sun',

      'return LinSun + LinMoon;',

    '}',



    '// Filmic ToneMapping http://filmicgames.com/archives/75',

    'const float A = 0.15;',

    'const float B = 0.50;',

    'const float C = 0.10;',

    'const float D = 0.20;',

    'const float E = 0.02;',

    'const float F = 0.30;',

    'const float W = 1000.0;',

    'const float unchartedW = 0.93034292920990640579589580673035390594971634341319642;',



    'vec3 Uncharted2Tonemap(vec3 x){',

      'return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;',

    '}',



    'vec3 applyToneMapping(vec3 outIntensity, vec3 L0){',

      'outIntensity *= 0.04;',

      'outIntensity += vec3(0.0, 0.0003, 0.00075);',



      'vec3 color = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))* outIntensity) / unchartedW;',

      'return pow(abs(color),vec3(1.0/(1.2 *(1.0 + (sunFade + moonFade)))));',

    '}',



    '//',

    '//Sun',

    '//',

    'vec4 drawSunLayer(vec3 FexPixel, float cosThetaOfSun){',

      '//It seems we need to rotate our sky by pi radians.',

      'float sunAngularDiameterCos = cos(angularDiameterOfTheSun);',

      '//float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002, cosThetaOfSun);',

      'vec4 sundisk = texture2D(sunTexture, vUv);',



      'vec3 L0 = (sunE * 19000.0 * FexPixel) * sundisk.rgb;',

      'L0 *= 0.04 ;',

      'L0 += vec3(0.0,0.001,0.0025)*0.3;',



      'vec3 curr = Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*L0);',

      'vec3 color = curr / unchartedW;',

      'color = pow(color,abs(vec3(1.0/(1.2+(1.2 * sunFade)))) );',

      'return vec4(color, sundisk.a);',

    '}',



    'void main(){',

      'vec3 normalizedWorldPosition = normalize(vWorldPosition.xyz);',



      'float cosOfZenithAngleOfCamera = max(0.0, dot(up, normalizedWorldPosition));',

      'float zenithAngleOfCamera = acos(cosOfZenithAngleOfCamera);',

      'float inverseSDenominator = 1.0 / (cosOfZenithAngleOfCamera + 0.15 * pow(93.885 - (zenithAngleOfCamera * rad2Deg), -1.253));',

      'float sR = rayleighAtmosphereHeight * inverseSDenominator;',

      'float sM = mieAtmosphereHeight * inverseSDenominator;',



      'vec3 betaMTimesSM = betaM * sM;',

      'vec3 FexSun = exp(-(betaRSun * sR + betaMTimesSM));',

      'vec3 FexMoon = exp(-(betaRMoon * sR + betaMTimesSM));',

      'vec3 FexPixel = exp(-(betaRPixel * sR + betaMTimesSM));',



      '//Get our night sky intensity',

      'vec3 L0 = 0.1 * FexMoon;',



      '//Get the inscattered light from the sun or the moon',

      'vec3 inscatteringColor = applyToneMapping(getDirectInscatteredIntensity(normalizedWorldPosition, FexSun, FexMoon) + L0, L0);',



      '//Apply dithering via the Bayer Matrix',

      '//Thanks to http://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/',

      'inscatteringColor += vec3(texture2D(bayerMatrix, gl_FragCoord.xy / 8.0).r / 32.0 - (1.0 / 128.0));',



      '//Apply tone mapping to the result',

      'float cosTheta = dot(normalizedWorldPosition, sunXYZPosition);',

      'vec4 sunIntensity = drawSunLayer(FexPixel, cosTheta);',

    '	gl_FragColor =vec4(sqrt(sunIntensity.rgb * sunIntensity.rgb + inscatteringColor * inscatteringColor), sunIntensity.a);',

    '}',
  ].join('\n')
});

function Sun(skyDomeRadius, sceneRef, sunTextureDir, textureLoader){
  this.sunTexture = textureLoader.load(sunTextureDir, function(sunTexture){
    sunTexture.magFilter = THREE.LinearFilter;
    sunTexture.minFilter = THREE.LinearMipMapLinearFilter;
    sunTexture.wrapS = THREE.ClampToEdgeWrapping;
    sunTexture.wrapW = THREE.ClampToEdgeWrapping;
    sunTexture.needsUpdate = true;
  });
  sunShaderMaterial.uniforms['sunTexture'].value = this.sunTexture;

  this.xyzPosition;
  this.sceneRef = sceneRef;
  this.sunRadiusFromCamera = 0.8 * skyDomeRadius;

  //Create a three JS plane for our sun to live on in a hidden view
  let angularDiameterOfTheSun = 0.059;
  this.angularDiameterOfTheSun = angularDiameterOfTheSun;
  let diameterOfSunPlane = 2.0 * this.sunRadiusFromCamera * Math.sin(angularDiameterOfTheSun);
  this.geometry = new THREE.PlaneGeometry(diameterOfSunPlane, diameterOfSunPlane, 1);
  this.geometry.translate(0.0, -0.0 * diameterOfSunPlane, 0.0);

  //Apply this shader to our plane
  this.plane = new THREE.Mesh(this.geometry, sunShaderMaterial);
  this.plane.matrixAutoUpdate = false;
  this.sceneRef.add(this.plane);
  this.position = new THREE.Vector3();
  this.planeNormal = new THREE.Vector3();
  this.origin = new THREE.Vector3();
  this.planeU = new THREE.Vector3();
  this.planeV = new THREE.Vector3();
  this.translationToTangentSpace = new THREE.Matrix3();
  this.lightDirection = new THREE.Vector3();

  //Create a directional light for the sun
  this.oneVector = new THREE.Vector3(1.0, 1.0, 1.0);
  this.up = new THREE.Vector3(0.0, 1.0, 0.0);
  this.light = new THREE.DirectionalLight(0xffffff, 1.0);
  this.light.castShadow = true;
  this.light.shadow.mapSize.width = 512*2;
  this.light.shadow.mapSize.height = 512*2;
  this.light.shadow.camera.near = 10.0;
  this.light.shadow.camera.far = this.sunRadiusFromCamera * 2.0;
  this.sceneRef.add(this.light);
  this.fexSun = new THREE.Vector3();
  this.directlightColor = new THREE.Color();
  this.directLightIntensity;
  this.ambientColor = new THREE.Vector3();
  this.ambientIntensity;

  this.update = function(sunPosition, betaRSun, betaM, sunE, sunFade){
    //move and rotate the sun
    let p = this.plane;
    this.position.set(sunPosition.x, sunPosition.y, sunPosition.z).multiplyScalar(this.sunRadiusFromCamera);
    p.position.set(this.position.x, this.position.y, this.position.z);
    p.lookAt(0.0,0.0,0.0);
    p.updateMatrix();
    p.updateMatrixWorld();

    let l = this.light;

    l.position.set(this.position.x, this.position.y, this.position.z);
    let cosZenithAngleOfSun = Math.max(0.0, this.up.dot(sunPosition));
    let zenithAngleOfSun = Math.acos(cosZenithAngleOfSun);
    let inverseSDenominator = 1.0 / (cosZenithAngleOfSun + 0.15 * Math.pow(93.885 - (zenithAngleOfSun * 180.0 / Math.PI), -1.253));
    const rayleighAtmosphereHeight = 8.4E3;
    const mieAtmosphereHeight = 1.25E3;
    let sR = rayleighAtmosphereHeight * inverseSDenominator;
    let sM = mieAtmosphereHeight * inverseSDenominator;
    let betaMTimesSM = betaM.clone().multiplyScalar(sM);
    this.fexSun.set(
      Math.max(Math.min(Math.exp(-(betaRSun.x * sR + betaMTimesSM.x)), 1.0), 0.0),
      Math.max(Math.min(Math.exp(-(betaRSun.y * sR + betaMTimesSM.y)), 1.0), 0.0),
      Math.max(Math.min(Math.exp(-(betaRSun.z * sR + betaMTimesSM.z)), 1.0), 0.0)
    );
    l.color.setRGB(this.fexSun.x, this.fexSun.y, this.fexSun.z);

    let solarLightBaseIntensitySquared = sunE / 700.0;
    let solarLightBaseIntensity = Math.sqrt(solarLightBaseIntensitySquared);
    l.intensity = solarLightBaseIntensity;
    let ambientColorVec = this.oneVector.clone().sub(this.fexSun);
    this.ambientColor = ambientColorVec;
    this.ambientIntensity = solarLightBaseIntensity * sunFade;
  };
}
