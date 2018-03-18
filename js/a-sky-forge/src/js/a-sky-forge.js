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
      var solarAzimuth = 0.0;
      var solarAltitude = 3.14159/4.0;
      this.el.components.material.material.uniforms.sunPosition.value.set(solarAzimuth, solarAltitude);
      var lunarAzimuth = 1.5 * 3.14159;
      var lunarAltitude = 1.0 * 3.14159/4.0;
      this.el.components.material.material.uniforms.moonAzAltAndParallacticAngle.value.set(lunarAzimuth, lunarAltitude);

      var moonMappingData = this.dynamicSkyObj.getMoonTangentSpaceSunlight(lunarAzimuth, lunarAltitude, solarAzimuth, solarAltitude);
      var moonTangentSpaceSunlight = moonMappingData.moonTangentSpaceSunlight;
      var moonPosition = moonMappingData.moonPosition;
      var moonTangent = moonMappingData.moonTangent;
      var moonBitangent = moonMappingData.moonBitangent;

      this.el.components.material.material.uniforms.moonTangentSpaceSunlight.value.set(moonTangentSpaceSunlight.x, moonTangentSpaceSunlight.y, moonTangentSpaceSunlight.z);
      this.el.components.material.material.uniforms.moonPosition.value.set(moonPosition.x, moonPosition.y, moonPosition.z);
      this.el.components.material.material.uniforms.moonTangent.value.set(moonTangent.x, moonTangent.y, moonTangent.z);
      this.el.components.material.material.uniforms.moonBitangent.value.set(moonBitangent.x, moonBitangent.y, moonBitangent.z);

      //Set the sidereal time for our calculation of right ascension and declination of each point in the sky
      this.el.components.material.material.uniforms.localSiderealTime.value = this.dynamicSkyObj.localSiderealTime;

      //this.el.components.material.material.uniforms.sunPosition.value.set(this.dynamicSkyObj.sunPosition.azimuth, this.dynamicSkyObj.sunPosition.altitude);
      //this.el.components.material.material.uniforms.moonAzAltAndParallacticAngle.value.set(this.dynamicSkyObj.moonPosition.azimuth, this.dynamicSkyObj.moonPosition.altitude, this.dynamicSkyObj.moonsParallacticAngle);


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
  yearPeriod : 0.0,
  dayOfYear : 0.0,
  dayPeriod : 0.0,
  hourInDay : 0.0,
  julianDay : 0.0,
  sunPosition : null,
  deg2Rad: Math.PI / 180.0,
  illuminatedFractionOfMoon: 0.0,
  brightLimbOfMoon: 0.0,
  starVPTree: null,

  update: function(skyData){
    this.radLatitude = this.latitude * this.deg2Rad;
    this.radLongitude = this.longitude * this.deg2Rad;
    this.year = skyData.year;
    this.daysInYear = this.getDaysInYear();
    this.yearPeriod = skyData.yearPeriod;
    this.dayOfYear = skyData.dayOfTheYear * (this.daysInYear / this.yearPeriod);
    this.dayPeriod = skyData.dayPeriod;
    this.timeInDay =  skyData.timeOffset * 86400 / this.dayPeriod; //Implementation of time dialation
    this.utcOffset = skyData.utcOffset ? skyData.utcOffset * 3600 : (240 * this.longitude);
    this.julianDay = this.calculateJulianDay();
    this.julianCenturies = (this.julianDay - 2451545.0) / 36525.0;

    //Useful constants
    this.calculateSunAndMoonLongitudeElgonationAndAnomoly();
    this.calculateNutationAndObliquityInEclipticAndLongitude();
    this.siderealTime = this.calculateGreenwhichSiderealTime();
    this.localSiderealTime = this.siderealTime - this.radLongitude;
    this.apparentSideRealTime = this.calculateApparentSiderealTime();

    //Get our actual positions
    this.sunPosition = this.getSunPosition();
    this.moonPosition = this.getMoonPosition();
  },

  calculateJulianDay(){
    var fractionalTime = this.timeInDay / 86400;
    //What happens when we change over the years
    if(this.dayOfYear >= this.daysInYear){
      year = this.year + ((day >= daysInThisYear) ? 1 : 0);
      this.dayOfYear = 1;
      this.year += 1;
      this.daysInYear = this.getDaysInYear();
    }
    daysRemaining =this.dayOfYear;
    var month;
    var day;
    var daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    //Check if this is a leap year, if so, then add one day to the month of feburary...
    if(this.daysInYear == 366){
      daysInEachMonth[1] = 29;
    }

    for(var m = 0; m < 12; m++){
      day = daysRemaining;
      daysRemaining -= daysInEachMonth[m];
      if(daysRemaining < 0){
        month = m + 1;
        break;
      }
    }
    day += fractionalTime;
    var year = this.year;

    if(month <= 2){
      year = year - 1;
      month = month + 12;
    }

    //From Meeus, pg 61
    var A = Math.round(year / 100);
    var B = 2 - A + Math.round(A / 4);
    var julianDay = Math.trunc(365.25 * (year + 4716)) + Math.trunc(30.6 * (month + 1)) + day + B - 1524.5;

    return julianDay;
  },

  check4GreaterThan360: function(inDegrees){
    var outDegrees;
    if(inDegrees > 0){
      outDegrees = inDegrees % 360;
    }
    else{
      outDegrees = 360 + (inDegrees % 360);
    }

    return outDegrees;
  },

  check4GreaterThan2Pi: function(inRads){
    var outRads;

    if(inRads > 0){
      outRads = inRads % (2 * Math.PI);
    }
    else{
      outRads = (2 * Math.PI) + (inRads % (2 * Math.PI));
    }

    return outRads;
  },

  unitSphereHaversteinDistance(coords1, coords2){
    //From: https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
    //Thank you Nathan! :D
    var lon1 = coords1[0];
    var lat1 = coords1[1];

    var lon2 = coords2[0];
    var lat2 = coords2[1];

    //Presume our results are already in radians
    var dLat = lat2 - lat1;
    var dLon = lon2 - lon1;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return d;
  },

  calculateGreenwhichSiderealTime: function(){
    //Meeus 87
    var T = this.julianCenturies;
    var greenwhichSideRealTime= 280.46061837 + 360.98564736629 * (this.julianDay - 2451545.0) + T * T * (0.0003879933 - (T / 38710000.0));
    greenwhichSideRealTime = this.check4GreaterThan360(greenwhichSideRealTime) * this.deg2Rad;

    return greenwhichSideRealTime;
  },

  calculateApparentSiderealTime: function(){
    var sideRealTimeInHoursMinutesSeconds = this.radToHoursMinutesSeconds(this.siderealTime);
    sideRealTimeInHoursMinutesSeconds.addSeconds(-3.868 * (Math.cos(this.trueObliquityOfEcliptic * this.deg2Rad) / 15) );

    //Now convert this back to degrees
    return this.astroHoursMinuteSeconds2Degs(sideRealTimeInHoursMinutesSeconds.hours, sideRealTimeInHoursMinutesSeconds.minutes, sideRealTimeInHoursMinutesSeconds.seconds);
  },

  //With a little help from: http://www.convertalot.com/celestial_horizon_co-ordinates_calculator.html
  //and: http://www.geoastro.de/elevaz/basics/meeus.htm
  getAzimuthAndAltitude: function(rightAscension, declination){
    var apparentSideRealTime = this.apparentSideRealTime;
    var latitude = this.latitude;
    //We use a negative one here so that we can convert between the standard longitude and the longitude in Meeus
    //The astronomical union decided that west longitudes are negative and east longitudes are positive, while meeus
    //uses the convention that west is positive and east is negative ^_^. It's an astronomical revolution!
    var longitude =-1 * this.longitude;

    //Calculated from page 92 of Meeus
    var hourAngle = this.check4GreaterThan360(apparentSideRealTime - longitude - rightAscension) * this.deg2Rad;
    latitudeInRads = latitude * this.deg2Rad;
    declinationInRads = declination * this.deg2Rad;

    var alt = Math.asin(Math.sin(declinationInRads) * Math.sin(latitudeInRads) + Math.cos(declinationInRads) * Math.cos(latitudeInRads) * Math.cos(hourAngle));
    var az = Math.atan2(Math.sin(hourAngle), ((Math.cos(hourAngle) * Math.sin(latitudeInRads)) - (Math.tan(declinationInRads) * Math.cos(latitudeInRads))));
    az = az >= 0.0 ? az : az + (2 * Math.PI);

    alt = this.check4GreaterThan2Pi(alt);
    az = this.check4GreaterThan2Pi(az);

    return {azimuth: az, altitude: alt};
  },

  //I love how chapter 22 precedes chapter 13 :P
  //But anyways, using the shorter version from 144 - this limits the accuracy of
  //everything else to about 2 or 3 decimal places, but we will survive but perfection isn't our goal here
  calculateNutationAndObliquityInEclipticAndLongitude: function(){
    var T = this.julianCenturies;
    var omega = this.LongitudeOfTheAscendingNodeOfTheMoonsOrbit * this.deg2Rad;
    var sunsMeanLongitude = this.sunsMeanLongitude;
    var moonsMeanLongitude = this.moonMeanLongitude;

    this.nutationInLongitude = (-17.2 * Math.sin(omega) - 1.32 * Math.sin(2 * sunsMeanLongitude) - 0.23 * Math.sin(2 * moonsMeanLongitude) + 0.21 * Math.sin(omega)) / 3600;
    this.deltaObliquityOfEcliptic = (9.2 * Math.cos(omega) + 0.57 * Math.cos(2 * sunsMeanLongitude) + 0.1 * Math.cos(2 * moonsMeanLongitude) - 0.09 * Math.cos(2 * omega)) / 3600;
    this.meanObliquityOfTheEclipitic = this.astroDegrees2NormalDegs(23, 26, 21.448) - ((T * 46.8150) / 3600)  - ((0.00059 * T * T) / 3600) + ((0.001813 * T * T * T) / 3600);
    this.trueObliquityOfEcliptic = this.meanObliquityOfTheEclipitic + this.deltaObliquityOfEcliptic;
  },

  //With a little help from: http://aa.usno.navy.mil/faq/docs/SunApprox.php and of course, Meeus
  getSunPosition: function(){
    var T = this.julianCenturies;
    var sunsMeanAnomoly = this.sunsMeanAnomoly * this.deg2Rad;
    var sunsMeanLongitude = this.sunsMeanLongitude;
    var eccentricityOfEarth = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
    var sunsEquationOfCenter = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(sunsMeanAnomoly) + (0.019993 - 0.000101 * T) * Math.sin(2 * sunsMeanAnomoly) + 0.000289 * Math.sin(3 * sunsMeanAnomoly);
    var sunsTrueLongitude = this.check4GreaterThan360(sunsMeanLongitude + sunsEquationOfCenter) * this.deg2Rad;
    var trueObliquityOfEcliptic = this.trueObliquityOfEcliptic * this.deg2Rad;
    var rightAscension = this.check4GreaterThan2Pi(Math.atan2(Math.cos(trueObliquityOfEcliptic) * Math.sin(sunsTrueLongitude), Math.cos(sunsTrueLongitude)));
    var declination = this.check4GreaterThan2Pi(Math.asin(Math.sin(trueObliquityOfEcliptic) * Math.sin(sunsTrueLongitude)));

    //While we're here, let's calculate the distance from the earth to the sun, useful for figuring out the illumination of the moon
    this.distanceFromEarthToSun = (1.000001018 * (1 - (eccentricityOfEarth * eccentricityOfEarth))) / (1 + eccentricityOfEarth * Math.cos(sunsEquationOfCenter * this.deg2Rad)) * 149597871;

    //Because we use these elsewhere...
    this.sunsRightAscension = rightAscension;
    this.sunsDeclination = declination;
    return this.getAzimuthAndAltitude(rightAscension, declination);
  },

  calculateParallacticAngle: function(hourAngle, declination){
    return Math.atan2(Math.sin(hourAngle), (Math.tan(this.radLongitude) * Math.cos(declination) - Math.sin(declination) * Math.cos(hourAngle)));
  },

  calculateSunAndMoonLongitudeElgonationAndAnomoly: function(){
    var T = this.julianCenturies;
    this.moonMeanLongitude = this.check4GreaterThan360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 65194000);
    this.moonMeanElongation = this.check4GreaterThan360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 113065000);
    this.moonsMeanAnomaly = this.check4GreaterThan360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699 - (T * T * T * T) / 14712000);
    this.moonsArgumentOfLatitude = this.check4GreaterThan360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000 + (T * T * T * T) / 863310000);
    this.LongitudeOfTheAscendingNodeOfTheMoonsOrbit = this.check4GreaterThan360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + ((T * T *T) /450000));
    this.sunsMeanAnomoly = this.check4GreaterThan360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000);
    this.sunsMeanLongitude = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  },

  //With help from Meeus Chapter 47...
  getMoonPosition: function(){
    var T = this.julianCenturies;
    var moonMeanLongitude = this.moonMeanLongitude;
    var moonMeanElongation = this.moonMeanElongation;
    var sunsMeanAnomoly = this.sunsMeanAnomoly;
    var moonsMeanAnomaly = this.moonsMeanAnomaly;
    var moonsArgumentOfLatitude = this.moonsArgumentOfLatitude;
    var a_1 = this.check4GreaterThan360(119.75 + 131.849 * T);
    var a_2 = this.check4GreaterThan360(53.09 + 479264.290 * T);
    var a_3 = this.check4GreaterThan360(313.45 + 481266.484 * T);
    var e_parameter = 1 - 0.002516 * T - 0.0000074 * T * T;

    //For the love of cheese why?!
    //TODO: kill off some of these terms. If we're limiting ourselves to 0.01
    //degrees of accuracy, we don't require this many terms by far!
    var D_coeficients = [0,2,2,0,0,0,2,2,2,2,0,1,0,2,0,0,4,0,4,2,2,1,1,2,2,4,2,0,2,2,1,2,
    0,0,2,2,2,4,0,3,2,4,0,2,2,2,4,0,4,1,2,0,1,3,4,2,0,1,2,2];
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
    D_coeficients = [0,0,0,2,2,2,2,0,2,0,2,2,2,2,2,2,2, 0, 4, 0,0,0,1,0,0,0,1,0,4,4,
    0,4,2,2,2,2,0,2,2,2,2,4,2,2,0,2,1,1,0,2,1,2,0,4,4,1,4,1,4,2];
    M_coeficients = [0, 0,0,0,0,0,0,0,0,0,0-1,0,0,1,-1,-1,-1,1,0,1,0,1,0,1,1,1,0,0,0,0,
    0,0,0,0,-1,0,0,0,0,1,1,0,-1,-2,0,1,1,1,1,1,0,-1,1,0,-1,0,0,0,-1,-2];
    M_prime_coeficients = [0,1,1,0,-1,-1,0,2,1,2,0,-2,1,0,-1,0,-1,-1,-1,0,0,-1,0,1,1,0,0,3,0,-1,
    1,-2,0,2,1,-2,3,2,-3,-1,0,0,1,0,1,1,0,0,-2,-1,1,-2,2,-2,-1,1,1,-1,0,0];
    F_coeficients = [1,1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,1,3,1,1,1,-1,-1,-1,1,-1,1,
    -3,1,-3,-1,-1,1,-1,1,-1,1,1,1,1,-1,3,-1,-1,1,-1,-1,1,-1,1,-1,-1,-1,-1,-1,-1,1];
    var b_sum_coeficients = [5128122,280602,277693,173237,55413,46271, 32573, 17198,9266,8822,8216,4324,
      4200,-3359,2463,2211,2065,-1870,1828,-1794,-1749,-1565,-1491,-1475,-1410,-1344,-1335,1107,1021,833,
    777,671,607,596,491,-451,439,422,421,-366,-351,331,315,302,-283,-229,223,223,-220,-220,-185,
    181,-177,176,166,-164,132,-119,115,107];

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
      else if(Math.abs(M_coeficient) === 1){
        e_coeficient = e_parameter * e_parameter;
      }

      sum_b += e_coeficient * b_sum_coeficient * Math.sin(this.check4GreaterThan360(D + M + Mp + F) * this.deg2Rad);
    }

    //Additional terms
    var moonMeanLongitude = this.check4GreaterThan360(moonMeanLongitude);
    var moonsArgumentOfLatitude = this.check4GreaterThan360(moonsArgumentOfLatitude);
    var moonsMeanAnomaly = this.check4GreaterThan360(moonsMeanAnomaly);
    sum_l = sum_l + 3958 * Math.sin(a_1 * this.deg2Rad) + 1962 * Math.sin(this.check4GreaterThan360(moonMeanLongitude - moonsArgumentOfLatitude) * this.deg2Rad) + 318 * Math.sin(a_2 * this.deg2Rad);
    sum_b = sum_b - 2235 * Math.sin(moonMeanLongitude * this.deg2Rad) + 382 * Math.sin(a_3 * this.deg2Rad) + 175 * Math.sin(this.check4GreaterThan360(a_1 - moonsArgumentOfLatitude) * this.deg2Rad) + 175 * Math.sin(this.check4GreaterThan360(a_1 + moonsArgumentOfLatitude) * this.deg2Rad);
    sum_b = sum_b + 127 * Math.sin(this.check4GreaterThan360(moonMeanLongitude - moonsMeanAnomaly) * this.deg2Rad) - 115 * Math.sin(this.check4GreaterThan360(moonMeanLongitude + moonsMeanAnomaly) * this.deg2Rad);

    var lambda = this.check4GreaterThan360((moonMeanLongitude + (sum_l / 1000000)));
    var beta = this.check4GreaterThan360((sum_b / 1000000));
    this.distanceFromEarthToMoon = 385000.56 + (sum_r / 1000); //In kilometers
    var raAndDec = this.lambdaBetaDegToRaDec(lambda, beta);
    var rightAscension = raAndDec.rightAscension;
    var declination = raAndDec.declination;

    //Because we use these elsewhere...
    this.moonsRightAscension = rightAscension;
    this.moonsDeclination = declination;

    this.moonsParallacticAngle = this.calculateParallacticAngle(this.hourAngle, declination);

    //Just return these values for now, we can vary the bright
    return this.getAzimuthAndAltitude(rightAscension, declination);
  },

  //For controls go to line 173
  getMoonTangentSpaceSunlight(moonAzimuth, moonAltitude, solarAzimuth, solarAltitude){
    //Calculate our normal, tangent and bitangent for the moon for normal mapping
    //We don't need these for each face because our moon is effectively a billboard
    var moonZenith = (Math.PI / 2.0) - moonAltitude;

    //First acquire our normal vector for the moon.
    var sinMZ = Math.sin(moonZenith);
    var cosMZ = Math.cos(moonZenith);
    var sinMA = Math.sin(moonAzimuth);
    var cosMA = Math.cos(moonAzimuth);
    var moonXCoordinates = sinMZ * cosMA;
    var moonYCoordinates = sinMZ * sinMA;
    var moonZCoordinates = cosMZ;
    var moonCoordinates = new THREE.Vector3(moonXCoordinates, moonYCoordinates, moonZCoordinates);

    //Get the unit vectors, x, y and z for our moon.
    //https://math.stackexchange.com/questions/70493/how-do-i-convert-a-vector-field-in-cartesian-coordinates-to-spherical-coordinate
    var sphericalUnitVectors = new THREE.Matrix3();
    sphericalUnitVectors.set(
      sinMZ*cosMA, sinMZ*sinMA, cosMZ,
      cosMZ*cosMA, cosMZ*sinMA, -sinMZ,
      -sinMA, cosMA, 0.0
    );
    var inverseOfSphericalUnitVectors = new THREE.Matrix3();
    inverseOfSphericalUnitVectors.getInverse(sphericalUnitVectors);

    var unitRVect = new THREE.Vector3(1.0, 0.0, 0.0);
    var unitAzVect = new THREE.Vector3(0.0, 0.0, 1.0);
    var moonNormal = unitRVect.applyMatrix3(inverseOfSphericalUnitVectors).normalize().negate().clone();
    var moonTangent = unitAzVect.applyMatrix3(inverseOfSphericalUnitVectors).normalize().clone();

    //Instead of just using the unit alt vector, I take the cross betweent the normal and the
    //azimuth vectors to preserve direction when crossing altitude = 0
    var moonBitangent = moonNormal.clone();
    moonBitangent.cross(moonTangent);

    var toTangentMoonSpace = new THREE.Matrix3();
    toTangentMoonSpace.set(
      moonTangent.x, moonBitangent.x, moonNormal.x,
      moonTangent.y, moonBitangent.y, moonNormal.y,
      moonTangent.z, moonBitangent.z, moonNormal.z);
    toTangentMoonSpace.transpose();

    var solarZenith = (Math.PI / 2.0) - solarAltitude;
    sinOfSZenith = Math.sin(solarZenith);
    cosOfSZenith = Math.cos(solarZenith);
    sinOfSAzimuth = Math.sin(solarAzimuth);
    cosOfSAzimuth = Math.cos(solarAzimuth);
    var solarXCoordinates = sinOfSZenith * cosOfSAzimuth;
    var solarYCoordinates = sinOfSZenith * sinOfSAzimuth;
    var solarZCoordinates = cosOfSZenith;
    var solarCoordinates = new THREE.Vector3(solarXCoordinates, solarYCoordinates, solarZCoordinates);
    solarCoordinates.normalize();

    var moonTangentSpaceSunlight = solarCoordinates.clone();
    moonTangentSpaceSunlight.applyMatrix3(toTangentMoonSpace);

    return {moonTangentSpaceSunlight: moonTangentSpaceSunlight, moonTangent: moonTangent, moonBitangent: moonBitangent, moonPosition: moonCoordinates};
  },

  getDaysInYear: function(){
    var daysInThisYear = ((this.year % 4 == 0) && (((this.year % 100 == 0) && (this.year % 400 == 0)) || (this.year % 100 != 0))) ? 366 : 365;

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
    var declination = this.check4GreaterThan2Pi(Math.asin(Math.sin(radBeta) * Math.cos(epsilon) + Math.cos(radBeta) * Math.sin(epsilon) * Math.sin(radLambda)));

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
    var fractDegrees = this.check4GreaterThan360(degrees) + (arcminutes / 60) + (arcseconds / 3600);
    return this.deg2Rad * this.astroDegrees2NormalDegs(degrees, arcminutes, arcseconds);
  },

  astroDegrees2NormalDegs: function(degrees, arcminutes, arcseconds){
    var fractDegrees = 0;
    if(degrees !== 0){
      fractDegrees = this.check4GreaterThan360(Math.sign(degrees) * (Math.abs(degrees) + arcminutes / 60 + arcseconds / 3600));
    }
    else if(arcminutes !== 0){
      fractDegrees = this.check4GreaterThan360(Math.sign(arcminutes) * (Math.abs(arcminutes) / 60 + arcseconds / 3600));
    }
    else if(arcseconds !== 0){
      fractDegrees = this.check4GreaterThan360(arcseconds / 3600);
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
    return ((hours + minutes / 60 + seconds / 3600) / 24) * 360;
  }
}
