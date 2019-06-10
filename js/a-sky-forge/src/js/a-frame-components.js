if(typeof exports !== 'undefined') {
  const dynamicSkyEntityMethodsExports = require('./a-dynamic-sky-entity-methods.js');
  const aSkyInterpolationMethodExports = require('./a-sky-interpolation-methods.js');
  const aSkyForgeMethodExports = require('./a-sky-forge.js')
  //Give this global scope by leaving off the var
  dynamicSkyEntityMethods = dynamicSkyEntityMethodsExports.dynamicSkyEntityMethods;
  aSkyInterpolator = aSkyInterpolationMethodExports.aSkyInterpolator;
  aDynamicSky = aSkyForgeMethodExports.aDynamicSky;
}

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

var skyParamsUniformsData = {turbidity: 2.0, rayleigh: 1.0, mieCoefficient: 0.005, angularDiameterOfTheMoon: 0.055};
AFRAME.registerComponent('sky-params', {
  dependencies: ['a-sky-forge'],
  schema:{
    luminance: { type: 'number', default: 1.0, max: 2.0, min: 0.0, is: 'uniform' },
    turbidity: { type: 'number', default: 2.0, max: 20.0, min: 0.0, is: 'uniform' },
    rayleigh: { type: 'number', default: 1.0, max: 4.0, min: 0.0, is: 'uniform' },
    mieCoefficient: { type: 'number', default: 0.005, min: 0.0, max: 0.1, is: 'uniform' },
    mieDirectionalG: { type: 'number', default: 0.8, min: 0.0, max: 1, is: 'uniform' },
    angularDiameterOfTheSun: { type: 'number', default: 0.057, is: 'uniform' },
    angularDiameterOfTheMoon: { type: 'number', default: 0.055, is: 'uniform' }
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
    skyParamsUniformsData.angularDiameterOfTheMoon = this.data.angularDiameterOfTheMoon
  }
});

AFRAME.registerComponent('sky-time', {
  fractionalSeconds: 0,
  moon: null,
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
    moonTexture: {type: 'map', default: 'moon-tex-1024.png'},
    moonNormalMap: {type: 'map', default: 'moon-nor-1024.png'},
    starMask: {type: 'map', default:'padded-starry-sub-data-0.png'},
    starRas: {type: 'map', default:'padded-starry-sub-data-1.png'},
    starDecs: {type: 'map', default:'padded-starry-sub-data-2.png'},
    starMags: {type: 'map', default:'padded-starry-sub-data-3.png'},
    starColors: {type: 'map', default:'padded-starry-sub-data-4.png'},
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
    let moonTextureDir = this.data.imgDir + this.data.moonTexture;
    let moonNormalMapDir = this.data.imgDir + this.data.moonNormalMap;
    let skyDomeRadius = this.el.components.geometry.data.radius;
    let sceneRef = this.el.sceneEl.object3D;
    this.moon = new Moon(moonTextureDir, moonNormalMapDir, skyDomeRadius, sceneRef, textureLoader, skyParamsUniformsData.angularDiameterOfTheMoon);
    this.sun = new Sun(skyDomeRadius, sceneRef);

    //Populate this data into an array because we're about to do some awesome stuff
    //to each texture with Three JS.
    //Note that,
    //We use a nearest mag and min filter to avoid fuzzy pixels, which kill good data
    //We use repeat wrapping on wrap s, to horizontally flip to the other side of the image along RA
    //And we use mirrored mapping on wrap w to just reflect back, although internally we will want to subtract 0.5 from this.
    //we also use needs update to make all this work as per, https://codepen.io/SereznoKot/pen/vNjJWd
    var starMask = textureLoader.load(this.data.imgDir + this.data.starMask, function(starMask){
      starMask.magFilter = THREE.NearestFilter;
      starMask.minFilter = THREE.NearestFilter;
      starMask.wrapS = THREE.RepeatWrapping;
      starMask.wrapW = THREE.MirroredRepeatWrapping;
      starMask.needsUpdate = true;
    });

    var starRas = textureLoader.load(this.data.imgDir + this.data.starRas, function(starRas){
      starRas.magFilter = THREE.NearestFilter;
      starRas.minFilter = THREE.NearestFilter;
      starRas.wrapS = THREE.RepeatWrapping;
      starRas.wrapW = THREE.MirroredRepeatWrapping;
      starRas.needsUpdate = true;
    });

    var starDecs = textureLoader.load(this.data.imgDir + this.data.starDecs, function(starDecs){
      starDecs.magFilter = THREE.NearestFilter;
      starDecs.minFilter = THREE.NearestFilter;
      starDecs.wrapS = THREE.RepeatWrapping;
      starDecs.wrapW = THREE.MirroredRepeatWrapping;
      starDecs.needsUpdate = true;
    });

    var starMags = textureLoader.load(this.data.imgDir + this.data.starMags, function(starMags){
      starMags.magFilter = THREE.NearestFilter;
      starMags.minFilter = THREE.NearestFilter;
      starMags.wrapS = THREE.RepeatWrapping;
      starMags.wrapW = THREE.MirroredRepeatWrapping;
      starMags.needsUpdate = true;
    });

    var starColors = textureLoader.load(this.data.imgDir + this.data.starColors, function(){
      starColors.magFilter = THREE.NearestFilter;
      starColors.minFilter = THREE.NearestFilter;
      starColors.wrapS = THREE.RepeatWrapping;
      starColors.wrapW = THREE.MirroredRepeatWrapping;
      starColors.needsUpdate = true;
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
    skyShaderMaterial.uniforms['starMask'].value = starMask;
    skyShaderMaterial.uniforms['starRas'].value = starRas;
    skyShaderMaterial.uniforms['starDecs'].value = starDecs;
    skyShaderMaterial.uniforms['starMags'].value = starMags;
    skyShaderMaterial.uniforms['starColors'].value = starColors;
    skyShaderMaterial.uniforms['bayerMatrix'].value = bayerMatrix;
    sunShaderMaterial.uniforms['bayerMatrix'].value = bayerMatrix;
    moonShaderMaterial.uniforms['bayerMatrix'].value = bayerMatrix;

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
      let sunE = 1000.0 * Math.max(0.0, 1.0 - Math.exp(-((cutoffAngle - Math.acos(dotOfSunDirectionAndUp))/steepness)));
      sunShaderMaterial.uniforms['sunE'].value = sunE;
      moonShaderMaterial.uniforms['sunE'].value = sunE;
      skyShaderMaterial.uniforms['sunE'].value = sunE;
      //These are used to fade our objects out a bit during the day as our eyes are contracted due to higher light levels
      //The numbers are basically ad hoc to make them feel 'about right'
      //sunFade * sunE + moonFade * moonE
      let exposureCoeficient = -(sunFade * sunE + moonFade * moonE);
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

      this.sun.update(sXYZ);
      this.moon.update(mXYZ, sXYZ);
    }
  }
});
