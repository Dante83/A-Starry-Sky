#include "../world_state/AstroTime.h"
#include "../world_state/Location.h"
#include "SkyManager.h"
#include "Sun.h"
#include "Moon.h"
#include "planets/Earth.h"
#include "planets/Mercury.h"
#include "planets/Venus.h"
#include "planets/Mars.h"
#include "planets/Jupiter.h"
#include "planets/Saturn.h"
#include "../Constants.h"
#include <stdbool.h>
#include <cmath>

SkyManager::SkyManager(AstroTime* astroTimeRef, Location* locationRef): sun(astroTimeRef), moon(astroTimeRef),
earth(astroTimeRef), mercury(astroTimeRef), venus(astroTimeRef), mars(astroTimeRef), jupiter(astroTimeRef),
saturn(astroTimeRef){
  astroTime = astroTimeRef;
  location = locationRef;

  //Now that our sun and moon are created, we can set the sun pointer for our moon
  moon.sun = &sun;

  //We can also hook up our pointer to the sun for each of our planets
  Planet* planets[6] = {&mercury, &venus, &earth, &mars, &jupiter, &saturn};
  for(int i = 0; i < 6; ++i){
    planets[i]->sun = &sun;
  }

  //And hook up our earth to each of our observable planets
  OtherPlanet* otherPlanets[5] = {&mercury, &venus, &mars, &jupiter, &saturn};
  for(int i = 0; i < 5; ++i){
    otherPlanets[i]->earth = &earth;
  }

  //For a standard sky we have one sun, one moon and five planets
  update();
}

void SkyManager::update(){
  double julianCentury = astroTime->julianCentury;
  double julianCentury_pow2 = julianCentury * julianCentury;
  double julianCentury_pow3 = julianCentury * julianCentury_pow2;
  double julianCentury_pow4 = julianCentury_pow2 * julianCentury_pow2;

  moon.setMeanLongitude(218.3164477 + 481267.88123421 * julianCentury - 0.0015786 * julianCentury_pow2 + (julianCentury_pow3 / 538841.0) - (julianCentury_pow4 / 65194000.0));
  moon.setMeanElongation(297.8501921 + 445267.1114034 * julianCentury - 0.0018819 * julianCentury_pow2 + (julianCentury_pow3 / 545868.0)  - (julianCentury_pow4 / 113065000.0));
  moon.setMeanAnomaly(134.9633964 + 477198.8675055 * julianCentury + 0.0087414 * julianCentury_pow2 + (julianCentury_pow3 / 69699.0) - (julianCentury_pow4 / 14712000.0));
  moon.setArgumentOfLatitude(93.2720950 + 483202.0175233 * julianCentury - 0.0036539 * julianCentury_pow2 - (julianCentury_pow3 / 3526000.0) + (julianCentury_pow4 / 863310000.0));
  moon.setLongitudeOfTheAscendingNodeOfOrbit(125.04452 - 1934.136261 * julianCentury + 0.0020708 * julianCentury_pow2 + (julianCentury_pow3 / 450000.0));
  sun.setMeanAnomaly(357.5291092 + 35999.0502909 * julianCentury - 0.0001536 * julianCentury_pow2 + julianCentury_pow3 / 24490000.0);
  sun.setMeanLongitude(280.46646 + 36000.76983 * julianCentury + 0.0003032 * julianCentury_pow2);

  double omega = moon.longitudeOfTheAscendingNodeOfOrbit * DEG_2_RAD;
  double sunsMeanLongitudeInRadsTimes2 = sun.meanLongitudeInRads * 2.0;
  double moonsMeanLongitudeInRadsTimes2 = moon.meanLongitudeInRads * 2.0;

  #define ONE_OVER_THIRTY_SIX_HUNDRED 0.0002777777777777777777777777777777777777
  #define HMS_23_26_21_448_2_DEGS 23.439291111111111
  nutationInLongitude = (-17.2 * sin(omega) - 1.32 * sin(sunsMeanLongitudeInRadsTimes2) - 0.23 * sin(moonsMeanLongitudeInRadsTimes2) + 0.21 * sin(2.0 * omega)) * ONE_OVER_THIRTY_SIX_HUNDRED;
  deltaObliquityOfEcliptic = (9.2 * cos(omega) + 0.57 * cos(sunsMeanLongitudeInRadsTimes2) + 0.1 * cos(moonsMeanLongitudeInRadsTimes2) - 0.09 * cos(2.0 * omega)) * ONE_OVER_THIRTY_SIX_HUNDRED;
  meanObliquityOfTheEclipitic = HMS_23_26_21_448_2_DEGS + (0.001813 * julianCentury_pow3 - 46.8150 * julianCentury - 0.00059 * julianCentury_pow2) * ONE_OVER_THIRTY_SIX_HUNDRED;
  trueObliquityOfEclipticInRads = (meanObliquityOfTheEclipitic + deltaObliquityOfEcliptic) * DEG_2_RAD;

  //Now for our sidereal times
  //Normally we would include these in our astro time object, but they just fit better here.
  //Meeus 87
  double julianDay = astroTime->julianDay;
  double truncJulianDay;
  double fractPart = modf(julianDay, &truncJulianDay);
  double julianDayAt0hUTC = truncJulianDay + 0.5;
  // 1.0 / 36525.0
  #define GMSRT_CONST1 0.0000273785078713210130047912388774811772758384668035592
  double gmsrtT = (julianDayAt0hUTC - 2451545.0) * GMSRT_CONST1;
  // 1.0 / 38710000.0
  #define GMSRT_CONST2 0.0000000258331180573495220873159390338413846551278739343
  astroTime->setGreenwhichSiderealTime(280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + gmsrtT * (0.000387933 - ((gmsrtT * gmsrtT) * GMSRT_CONST2)));

  #define THREE_THOUSAND_SIX_HUNDRED_OVER_FIFTEEN 240.0
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
  sun.setTrueLongitude((sun.meanLongitude + sun.equationOfCenter) * DEG_2_RAD);

  //Update the state of our sky from this information
  sun.eccentricityOfTheEarth = &eccentricityOfTheEarth;
  sun.meanObliquityOfTheEclipitic = &meanObliquityOfTheEclipitic;
  sun.updatePosition();
  earth.updatePosition(trueObliquityOfEclipticInRads);
  moon.updatePosition(trueObliquityOfEclipticInRads);
  OtherPlanet* otherPlanets[5] = {&mercury, &venus, &mars, &jupiter, &saturn};
  for(int i = 0; i < 5; ++i){
    otherPlanets[i]->updatePosition(trueObliquityOfEclipticInRads);
    otherPlanets[i]->updateMagnitudeOfPlanet();
  }
}
