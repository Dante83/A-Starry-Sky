if(typeof exports !== 'undefined') {
  const dynamicSkyEntityMethodsExports = require('./a-dynamic-sky-entity-methods.js');
  //Give this global scope by leaving off the var
  dynamicSkyEntityMethods = dynamicSkyEntityMethodsExports.dynamicSkyEntityMethods;
}

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
  dayOfYear : 0.0,
  hourInDay : 0.0,
  julianDay : 0.0,
  sunPosition : null,
  deg2Rad: Math.PI / 180.0,

  update: function(skyData){
    this.radLatitude = this.latitude * this.deg2Rad;
    this.radLongitude = this.longitude * this.deg2Rad;
    this.year = skyData.year;
    this.daysInYear = this.getDaysInYear();
    this.dayOfYear = skyData.dayOfTheYear;

    //Get the time at Greenwhich
    //NOTE: ALl of these time thingies should be tested at turn-overs and crud
    //As they might only work mid-year and screw up at years end.
    var utcOffsetInSeconds = skyData.utcOffset != null ? skyData.utcOffset * 3600 : (240 * this.longitude);
    var utcDate = new Date(this.year, 0);
    utcDate.setSeconds( (this.dayOfYear - 1.0) * 86400 + skyData.timeOffset + utcOffsetInSeconds);

    //Update our time constants to UTC time
    this.year = utcDate.getFullYear();
    this.dayOfYear = dynamicSkyEntityMethods.getDayOfTheYearFromYMD(utcDate.getFullYear(), utcDate.getMonth() + 1, utcDate.getDate());
    this.timeInDay = utcDate.getHours() * 3600 + utcDate.getMinutes() * 60 + utcDate.getSeconds();

    this.julianDay = this.calculateJulianDay();
    this.julianCentury =this.calculateJulianCentury();

    //Useful constants
    this.calculateSunAndMoonLongitudeElgonationAndAnomoly();
    this.calculateNutationAndObliquityInEclipticAndLongitude();
    this.greenwhichMeanSiderealTime = this.calculateGreenwhichSiderealTime();
    this.greenwhichApparentSiderealTime = this.calculateApparentSiderealTime();
    this.localApparentSiderealTime = this.check4GreaterThan360(this.greenwhichApparentSiderealTime + this.longitude);

    //Get our actual positions
    //
    //NOTE: I've narrowed it down to here, somehow we're not getting the right azimuth and altitude for our sun and moon
    //
    this.sunPosition = this.getSunPosition();
    this.moonPosition = this.getMoonPosition();
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
      if(daysPast >= this.dayOfYear){
        month = m + 1;
        day = this.dayOfYear - previousMonthsDays;
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
    this.moonMeanLongitude = this.check4GreaterThan360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 65194000);
    this.moonMeanElongation = this.check4GreaterThan360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 113065000);
    this.moonsMeanAnomaly = this.check4GreaterThan360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699 - (T * T * T * T) / 14712000);
    this.moonsArgumentOfLatitude = this.check4GreaterThan360(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000 + (T * T * T * T) / 863310000);
    this.LongitudeOfTheAscendingNodeOfTheMoonsOrbit = this.check4GreaterThan360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + ((T * T *T) /450000));
    this.sunsMeanAnomoly = this.check4GreaterThan360(357.52772 + 35999.0500340 * T - 0.0001603 * T * T + (T * T * T) / 300000);
    this.sunsMeanLongitude = this.check4GreaterThan360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
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
    sum_l = sum_l + 3958 * Math.sin(a_1 * this.deg2Rad) + 1962 * Math.sin((moonMeanLongitude - moonsArgumentOfLatitude) * this.deg2Rad) + 318 * Math.sin(a_2 * this.deg2Rad);
    sum_b = sum_b - 2235 * Math.sin(moonMeanLongitude * this.deg2Rad) + 382 * Math.sin(a_3 * this.deg2Rad) + 175 * Math.sin((a_1 - moonsArgumentOfLatitude) * this.deg2Rad) + 175 * Math.sin((a_1 + moonsArgumentOfLatitude) * this.deg2Rad);
    sum_b = sum_b + 127 * Math.sin((moonMeanLongitude - moonsMeanAnomaly) * this.deg2Rad) - 115 * Math.sin((moonMeanLongitude + moonsMeanAnomaly) * this.deg2Rad);

    var lambda = (moonMeanLongitude + (sum_l / 1000000));
    var beta = (sum_b / 1000000);
    this.distanceFromEarthToMoon = 385000.56 + (sum_r / 1000); //In kilometers
    var raAndDec = this.lambdaBetaDegToRaDec(lambda, beta);
    var rightAscension = raAndDec.rightAscension;
    var declination = raAndDec.declination;

    //Because we use these elsewhere...
    this.moonsRightAscension = rightAscension;
    this.moonsDeclination = declination;

    //Just return these values for now, we can vary the bright
    return this.getAzimuthAndAltitude(rightAscension, declination);
  },

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
  }
}

//For Mocha testing
if(typeof exports !== 'undefined') {
  exports.aDynamicSky = aDynamicSky;
}
