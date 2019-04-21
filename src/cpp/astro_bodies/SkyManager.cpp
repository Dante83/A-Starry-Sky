#include "../world_state/AstroTime.h"
#include "../world_state/Location.h"
#include "SkyManager.h"
#include "Sun.h"
#include "Moon.h"
#include "../Constants.h"
#include <stdbool.h>
#include <cmath>
#include<iostream>

SkyManager::SkyManager(AstroTime* astroTimeRef, Location* locationRef): sun(astroTimeRef), moon(astroTimeRef){
  astroTime = astroTimeRef;
  location = locationRef;

  //Now that our sun and moon are created, we can set the sun pointer for our moon
  moon.sun = &sun;

  //For a standard sky we have one sun, one moon and four planets
  //which are visible to the naked eye (we ignore Mercury and anything past Saturn).
  update(1);
  sun.eccentricityOfTheEarth = &eccentricityOfTheEarth;
  sun.meanObliquityOfTheEclipitic = &meanObliquityOfTheEclipitic;
  moon.trueObliquityOfEclipticInRads = &trueObliquityOfEclipticInRads;
  sun.updatePosition();
  moon.updatePosition();

  //
  //TODO: Implement planets
  //
  //Planets
  // Planet[0] = Venus(this);
  // Planet[1] = Mars(this);
  // Planet[2] = Jupiter(this);
  // Planet[3] = Saturn(this);
}

void SkyManager::update(int updatePlanets){
  double julianCentury = astroTime->julianCentury;
  double julianCentury_pow2 = julianCentury * julianCentury;
  double julianCentury_pow3 = julianCentury * julianCentury_pow2;
  double julianCentury_pow4 = julianCentury_pow2 * julianCentury_pow2;

  //
  //Lunar constants
  // 1.0 / 538841.0
  #define MML_CONST1 0.000001855835023689734077399455498004049432021690999756885
  // 1.0 / 65194000.0
  #define MML_CONST2 0.000000015338834862103874589686167438721354725895021014203
  moon.setMeanLongitude(218.3164477 + 481267.88123421 * julianCentury - 0.0015786 * julianCentury_pow2 + julianCentury_pow3 * MML_CONST1 - julianCentury_pow4 * MML_CONST2);
  // 1.0 / 545868.0
  #define MME_CONST1 0.000100183194471923615232986729392453853312522441322810642
  // 1.0 / 113065000.0
  #define MME_CONST2 0.0000000088444699951355415026754521735285013045593242824
  moon.setMeanElongation(297.8501921 + 445267.1114034 * julianCentury - 0.0018819 * julianCentury_pow2 + julianCentury_pow3 * MME_CONST1  - julianCentury_pow4 * MME_CONST2);
  // 1.0 / 69699.0
  #define MMA_CONST1 0.000014347408140719379044175669665274968077016886899381626
  // 1.0 / 14712000
  #define MMA_CONST2 0.00000006797172376291462751495377922784121805328983143012
  moon.setMeanAnomaly(134.9633964 + 477198.8675055 * julianCentury + 0.0087414 * julianCentury_pow2 + julianCentury_pow3 * MMA_CONST1 - julianCentury_pow4 * MMA_CONST2);
  // 1.0 / 3526000.0
  #define MAOL_CONST1 0.0000002836074872376630743051616562677254679523539421440
  // 1.0 / 863310000.0
  #define MAOL_CONST2 0.0000000011583324645839848953446618248369647056098041259
  moon.setArgumentOfLatitude(93.2720950 + 483202.0175233 * julianCentury - 0.0036539 * julianCentury_pow2 - julianCentury_pow3 * MAOL_CONST1 + julianCentury_pow4 * MAOL_CONST2);
  // 1.0 / 450000
  #define LOTANOTMO_CONST1 0.000002222222222222222222222222222222222222222222222
  moon.setLongitudeOfTheAscendingNodeOfOrbit(125.04452 - 1934.136261 * julianCentury + 0.0020708 * julianCentury_pow2 + julianCentury_pow3 * LOTANOTMO_CONST1);

  //
  //Solar Constants
  #define SMA_CONST1 0.000000040832993058391180073499387505104124132298897509187
  sun.setMeanAnomaly(357.5291092 + 35999.0502909 * julianCentury - 0.0001536 * julianCentury_pow2 + julianCentury_pow3 * SMA_CONST1);
  sun.setMeanLongitude(280.46646 + 36000.76983 * julianCentury + 0.0003032 * julianCentury_pow2);

  double omega = moon.longitudeOfTheAscendingNodeOfOrbit * DEG_2_RAD;
  double omegaTimes2 = omega * 2.0;
  double sunsMeanLongitudeInRadsTimes2 = sun.meanLongitudeInRads * 2.0;
  double moonsMeanLongitudeInRadsTimes2 = moon.meanLongitudeInRads * 2.0;
  double sinOmega = sin(omega);

  //NOTE: I could potentially factor out a number in each of the below sets
  //resulting in one less multiplication per line? I don't know if it's worth it though...
  #define ONE_OVER_THIRTY_SIX_HUNDRED 0.0002777777777777777777777777777777777777
  #define HMS_23_26_21_448_2_DEGS 23.439291111111111
  nutationInLongitude = (-17.2 * sin(omega) - 1.32 * sin(sunsMeanLongitudeInRadsTimes2) - 0.23 * sin(moonsMeanLongitudeInRadsTimes2) + 0.21 * sin(omegaTimes2)) * ONE_OVER_THIRTY_SIX_HUNDRED;
  deltaObliquityOfEcliptic = (9.2 * cos(omega) + 0.57 * cos(sunsMeanLongitudeInRadsTimes2) + 0.1 * cos(moonsMeanLongitudeInRadsTimes2) - 0.09 * cos(omegaTimes2)) * ONE_OVER_THIRTY_SIX_HUNDRED;
  meanObliquityOfTheEclipitic = HMS_23_26_21_448_2_DEGS + (0.001813 * julianCentury_pow3 - 46.8150 * julianCentury - 0.00059 * julianCentury_pow2) * ONE_OVER_THIRTY_SIX_HUNDRED;
  trueObliquityOfEclipticInRads = (meanObliquityOfTheEclipitic + deltaObliquityOfEcliptic) * DEG_2_RAD;

  //Now for our sidereal times
  //Normally we would include these in our astro time object, but they just fit better here.
  //Meeus 87
  double julianDay = astroTime->julianDay;
  double truncJulianDay;
  double fractPart = modf(julianDay, &truncJulianDay);
  double julianDayAt0hUTC =  truncJulianDay + 0.5;
  // 1.0 / 36525.0
  #define GMSRT_CONST1 0.0000273785078713210130047912388774811772758384668035592
  double gmsrtT = (julianDayAt0hUTC - 2451545.0) * GMSRT_CONST1;
  // 1.0 / 38710000.0
  #define GMSRT_CONST2 0.0000000258331180573495220873159390338413846551278739343
  astroTime->setGreenwhichSiderealTime(280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + gmsrtT * (0.000387933 - ((gmsrtT * gmsrtT) * GMSRT_CONST2)));

  #define THREE_THOUSAND_SIX_HUNDRED_OVER_FIFTEEN 240
  double nutationInRightAscensionInSeconds = (nutationInLongitude * cos(trueObliquityOfEclipticInRads)) * THREE_THOUSAND_SIX_HUNDRED_OVER_FIFTEEN;
  #define THREE_SIXTY_OVER_EIGHTY_SIX_THOUSAND_FOUR_HUNDRED 0.00416666666666666666666666666666666666666666
  double nutationInRightAscensionInDegs = nutationInRightAscensionInSeconds * THREE_SIXTY_OVER_EIGHTY_SIX_THOUSAND_FOUR_HUNDRED;
  astroTime->apparentSiderealTime = astroTime->greenwhichSiderealTime + nutationInRightAscensionInDegs;
  astroTime->updateLocalApparentSiderealTime(location->lng);

  //And back to our sun again
  double sunsMeanAnomolyInRads = sun.meanAnomaly * DEG_2_RAD;
  double sunsMeanLongitude = sunsMeanLongitude;
  eccentricityOfTheEarth = 0.016708634 - 0.000042037 * julianCentury - 0.0000001267 * julianCentury_pow2;
  sun.equationOfCenter = (1.914602 - 0.004817 * julianCentury - 0.000014 * julianCentury_pow2) * sin(sunsMeanAnomolyInRads) + (0.019993 - 0.000101 * julianCentury) * sin(2 * sunsMeanAnomolyInRads) + 0.000289 * sin(3 * sunsMeanAnomolyInRads);

  std::cout << "Chickens!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" <<std::endl;
  std::cout << "Suns Mean Longitude:" << sun.meanLongitude <<std::endl;
  std::cout << "SunsEquation of Center:" << sun.equationOfCenter <<std::endl;
  std::cout << "SunsEquation of Center:" << sun.equationOfCenter <<std::endl;
  sun.setTrueLongitude((sun.meanLongitude + sun.equationOfCenter) * DEG_2_RAD);
  std::cout << "Suns True Longitude:" << sun.trueLongitude <<std::endl;
  std::cout << "DEG 2 RADS" << DEG_2_RAD <<std::endl;
  std::cout << "Moons Mean Longitude:" << moon.meanLongitude <<std::endl;
  std::cout << "Moons Mean Elongation:" << moon.meanElongation <<std::endl;
  std::cout << "Moons Mean Anomaly:" << moon.meanAnomaly <<std::endl;
  std::cout << "Moons Argument Of Latitude:" << moon.argumentOfLatitude <<std::endl;
  std::cout << "Moons Longitude of Ascending Node:" << moon.longitudeOfTheAscendingNodeOfOrbit <<std::endl;
  std::cout << "Suns Mean Anomaly:" << sun.meanAnomaly <<std::endl;
  std::cout << "Suns Mean Longitude:" << sun.meanLongitude <<std::endl;
  std::cout << "Nutation In Longitude:" << nutationInLongitude <<std::endl;
  std::cout << "Delta Obliquity Of the Ecliptic:" << deltaObliquityOfEcliptic <<std::endl;
  std::cout << "Mean Obliquity of the Eccliptic:" << meanObliquityOfTheEclipitic <<std::endl;
  std::cout << "True Obliquity of the Eccliptic (In Rads):" << trueObliquityOfEclipticInRads <<std::endl;
  std::cout << "Greenwhich Sidereal Time:" << astroTime->greenwhichSiderealTime <<std::endl;
  std::cout << "Suns Mean Anomaly:" << sun.meanAnomaly <<std::endl;
  std::cout << "Suns Mean Longitude:" << sun.meanLongitude <<std::endl;
  std::cout << "Eccentricty of the Earth:" << eccentricityOfTheEarth <<std::endl;
  std::cout << "Suns Equation of Center:" << sun.equationOfCenter <<std::endl;
  std::cout << "Suns True Longitude:" << sun.trueLongitude <<std::endl;
  std::cout << "Suns Right Ascension:" << sun.rightAscension1 <<std::endl;
  std::cout << "Suns Declination:" << sun.declination1 <<std::endl;
}
