const assert = require('chai').assert;
const aSkyForge = require('../js/a-sky-forge/src/js/a-sky-forge.js');

//
//Do some testing Using Meeus
//
describe('A-Frame Sky-Forge astral coordinate transformations', function() {
  var aDynamicSky = aSkyForge.aDynamicSky;
  beforeEach(function(done) {
      //As we are testing our data sets on natural time frames, a few things will
      //stay consistant between tests.
      aDynamicSky.timeInDay = null; //Natural number of seconds in a day
      aDynamicSky.dayOfYear = null;
      aDynamicSky.year = null;
      aDynamicSky.daysInYear = null;
      done();
  });

  //
  //NOTE: Our Julian days only work for the Gregorian Calender.
  //
  it('julian day function should be 2436116.31 on October 4.81 in the yeear 1957.',function(){
    aDynamicSky.dayOfYear =  277;
    aDynamicSky.timeInDay = 0.81 * 86400;
    aDynamicSky.year = 1957;
    aDynamicSky.daysInYear = 365;
    assert.closeTo(aDynamicSky.calculateJulianDay(), 2436116.31, 0.05);
  });

  it('julian day function should be 2451545.0 on January 1.5 in the yeear 2000.',function(){
    aDynamicSky.dayOfYear =  1;
    aDynamicSky.timeInDay = 0.5 * 86400;
    aDynamicSky.year = 2000;
    aDynamicSky.daysInYear = 366;//It's a leap year
    assert.closeTo(aDynamicSky.calculateJulianDay(), 2451545.0, 0.1);
  });

  it('julian day function should be 2447187.5 on January 27.0 in the yeear 1988.',function(){
    aDynamicSky.dayOfYear =  27;
    aDynamicSky.timeInDay = 0.0;
    aDynamicSky.year = 1988;
    aDynamicSky.daysInYear = 366;
    assert.closeTo(aDynamicSky.calculateJulianDay(), 2447187.5, 0.1);
  });

  it('julian day function should be 2447332.0 on Jun 19.5 in the yeear 1988.',function(){
    aDynamicSky.dayOfYear =  171;
    aDynamicSky.timeInDay = 0.5 * 86400;
    aDynamicSky.year = 1988;
    aDynamicSky.daysInYear = 366;
    assert.closeTo(aDynamicSky.calculateJulianDay(), 2447332.0, 0.1);
  });

  it('julian day function should be 2446966.0 on Jun 12.5 in the yeear 1987.',function(){
    aDynamicSky.dayOfYear =  170;
    aDynamicSky.timeInDay = 0.5 * 86400;
    aDynamicSky.year = 1987;
    aDynamicSky.daysInYear = 365;
    assert.closeTo(aDynamicSky.calculateJulianDay(), 2446966.0, 0.1);
  });

  it('julian day function should be 2446822.5 on Jan 27.0 in the yeear 1987.',function(){
    aDynamicSky.dayOfYear =  27;
    aDynamicSky.timeInDay = 0.0 * 86400;
    aDynamicSky.year = 1987;
    aDynamicSky.daysInYear = 365;
    assert.closeTo(aDynamicSky.calculateJulianDay(), 2446822.5, 0.1);
  });

  it('has a check for greater than 360 degree method that returns the right angle.', function(){
    //assert.equal(aDynamicSky.check4GreaterThan360(0.0), 0.0);
    assert.equal(aDynamicSky.check4GreaterThan360(360.0), 0.0);
    assert.equal(aDynamicSky.check4GreaterThan360(361.0), 1.0);
    assert.equal(aDynamicSky.check4GreaterThan360(-1.0), 359.0);
    assert.equal(aDynamicSky.check4GreaterThan360(-360.0), 0.0);
    assert.equal(aDynamicSky.check4GreaterThan360(-361.0), 359.0);
  });

  it('has a check for greater than pi degree method that returns the right angle.', function(){
    //assert.equal(aDynamicSky.check4GreaterThan360(0.0), 0.0);
    var piTimes2 = Math.PI * 2;
    var piOver4 = Math.PI / 4.0;
    assert.equal(aDynamicSky.check4GreaterThan2Pi(piTimes2), 0.0);
    assert.equal(aDynamicSky.check4GreaterThan2Pi((piTimes2 + piOver4)), piOver4);
    assert.equal(aDynamicSky.check4GreaterThan2Pi(-piOver4), piTimes2 - piOver4);
    assert.equal(aDynamicSky.check4GreaterThan2Pi(-piTimes2), 0.0);
    assert.equal(aDynamicSky.check4GreaterThan2Pi(-piTimes2 - piOver4), piTimes2 - piOver4);
  });

  it('should calculate the appropriate nutation and true obliquity of the ecliptic corresponding to April 10.0 1987.', function(){
    aDynamicSky.dayOfYear =  100;
    aDynamicSky.timeInDay = 0.0;
    aDynamicSky.year = 1987;
    aDynamicSky.daysInYear = 365;
    aDynamicSky.julianDay = aDynamicSky.calculateJulianDay();
    aDynamicSky.julianCenturies = aDynamicSky.calculateJulianCenturies();
    assert.closeTo(aDynamicSky.julianDay, 2446895.5, 0.1);
    assert.closeTo(aDynamicSky.julianCenturies, -0.127296372348, 0.000000000005);

    //Check the values for D, M, MP, F, Omega, Delta Psi, delta epsilon, epsilon nod and epsilon
    aDynamicSky.calculateSunAndMoonLongitudeElgonationAndAnomoly();
    assert.closeTo(aDynamicSky.moonMeanElongation, 136.9623, 0.0005);//D is elongation of the moon from the sun
    assert.closeTo(aDynamicSky.sunsMeanAnomoly, 94.9792, 0.0005);//M is anomoly of the sun
    assert.closeTo(aDynamicSky.moonsMeanAnomaly, 229.2784, 0.0005)//M' is anomoly of the moon
    assert.closeTo(aDynamicSky.moonsArgumentOfLatitude, 143.4079, 0.0005);//F is moons argument of latitude
    assert.closeTo(aDynamicSky.LongitudeOfTheAscendingNodeOfTheMoonsOrbit, 11.2531, 0.0005);//Omega is ascending node of moons mean orbit

    //After checking the results of our sky variables, let's check the actual equation we came here for.
    aDynamicSky.calculateNutationAndObliquityInEclipticAndLongitude();
    //We're using the simplified equations here, resulting in some degredation in our error as time progresses
    assert.closeTo(aDynamicSky.check4GreaterThan360(aDynamicSky.nutationInLongitude), aDynamicSky.astroDegrees2NormalDegs(0, 0, -3.788), 0.0005);
    assert.closeTo(aDynamicSky.deltaObliquityOfEcliptic, aDynamicSky.astroDegrees2NormalDegs(0, 0, 9.443), 0.0005);
    assert.closeTo(aDynamicSky.meanObliquityOfTheEclipitic, aDynamicSky.astroDegrees2NormalDegs(23, 26, 24.407), 0.05);

    //NOTE: As this shows, we're nearly off by up to half a degree, which is about half a pinky width at full arms length
    //That's actually about half the width of the moon :/. It might be worth our time to make these formulas more
    //accurate, but I'm not sure these values change particularly often, so they might be fine for our purposes. But as the below shows,
    //we can still get very good values below even with such big errors.
    assert.closeTo(aDynamicSky.trueObliquityOfEcliptic, aDynamicSky.astroDegrees2NormalDegs(23, 26, 36.850), 0.5);
  });

  it('should calculate the correct Mean and Apparent Greenwhich Sidereal Time on April 10.0 1987.', function(){
    aDynamicSky.dayOfYear =  100;
    aDynamicSky.timeInDay = 0.0;
    aDynamicSky.year = 1987;
    aDynamicSky.daysInYear = 365;
    aDynamicSky.julianDay = aDynamicSky.calculateJulianDay();
    aDynamicSky.julianCenturies = aDynamicSky.calculateJulianCenturies();
    assert.closeTo(aDynamicSky.julianDay, 2446895.5, 0.1);
    assert.closeTo(aDynamicSky.julianCenturies, -0.127296372348, 0.000000000005);
    aDynamicSky.siderealTime = aDynamicSky.calculateGreenwhichSiderealTime();
    assert.closeTo(aDynamicSky.siderealTime / aDynamicSky.deg2Rad, 197.69320, 0.00005);

    //Tested for the same date above
    aDynamicSky.calculateSunAndMoonLongitudeElgonationAndAnomoly();
    aDynamicSky.calculateNutationAndObliquityInEclipticAndLongitude();

    assert.closeTo(aDynamicSky.calculateApparentSiderealTime(), 197.69224, 0.00005);
  });

  it("should calculate the correct azimuth and altitude from right ascension and declination of venus on April 10th, \
  1987 at 19:21:00 at the US Naval Observatory longitude = 77*03'56'' and latitude 38*55'17''.", function(){
    var skyData = {
      dayOfTheYear:  100,
      year: 1987,
      yearPeriod: 365,
      dayPeriod: 86400,
      timeOffset: 69660,
      utcOffset: null,
    };
    aDynamicSky.latitude = 38.92138889;
    aDynamicSky.longitude = -77.06555556; // In persuasion to Meeus' defiance of international standards

    //All we need is pulled together now in...
    aDynamicSky.update(skyData);

    //From Meeus 95
    var rightAscensionOfVenus = aDynamicSky.astroHoursMinuteSeconds2Degs(23, 09, 16.641);
    var declinationOfVenus = aDynamicSky.astroDegrees2NormalDegs(-6, 43, 11.61);
    //Sanity check these are correct
    assert.closeTo(rightAscensionOfVenus, 347.3193375, 0.0000005);
    assert.closeTo(declinationOfVenus, 353.2801083, 0.0000005);
    assert.closeTo(aDynamicSky.apparentSideRealTime, 128.73689, 0.00005);

    //Now for the main show
    var results = aDynamicSky.getAzimuthAndAltitude(rightAscensionOfVenus, declinationOfVenus);
    assert.closeTo(results.azimuth, 68.0337 * aDynamicSky.deg2Rad, 0.0005);
    assert.closeTo(results.altitude, 15.1249 * aDynamicSky.deg2Rad,0.0005);
  });

  it( 'should calculate the suns position appropriately on 13th of October at 0h  1992.', function(){
    var skyData = {
      dayOfTheYear:  287, //Leap year! :D
      year: 1992,
      yearPeriod: 366,
      dayPeriod: 86400,
      timeOffset: 0,
      utcOffset: null,
    };
    //These are independent of the right ascension and declination, but allow us to just use the update command.
    aDynamicSky.latitude = 38.92138889;
    aDynamicSky.longitude = -77.06555556;

    aDynamicSky.update(skyData);

    var rightAscensionOfTheSunShouldBe = aDynamicSky.astroHoursMinuteSeconds2Degs(13, 13, 31.4);
    var declinationOfTheSunShouldBe  = -7.78507;

    assert.closeTo(aDynamicSky.sunsRightAscension, rightAscensionOfTheSunShouldBe, 0.05);
    assert.closeTo(aDynamicSky.sunsDeclination, declinationOfTheSunShouldBe, 0.05);
  });

  it( 'should calculate the moons position appropriately on 12th of April at 0h 1992.', function(){
    var skyData = {
      dayOfTheYear: 103, //Leap year! :D
      year: 1992,
      yearPeriod: 366,
      dayPeriod: 86400,
      timeOffset: 0,
      utcOffset: null,
    };
    //These are independent of the right ascension and declination, but allow us to just use the update command.
    aDynamicSky.latitude = 38.92138889;
    aDynamicSky.longitude = -77.06555556;

    //Sanity check for when things go hay-wire
    aDynamicSky.moonSumL;
    aDynamicSky.moonSumB;
    aDynamicSky.moonLambda;
    aDynamicSky.moonBeta;

    aDynamicSky.update(skyData);

    var rightAscensionOfTheMoonShouldBe = 134.688470;
    var declinationOfTheMoonShouldBe  = 13.768368;

    assert.closeTo(aDynamicSky.moonsRightAscension, rightAscensionOfTheMoonShouldBe, 0.05);
    assert.closeTo(aDynamicSky.moonsDeclination, declinationOfTheMoonShouldBe, 0.05);
  });
});
