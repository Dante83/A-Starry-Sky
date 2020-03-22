#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "AstronomicalBody.h"
#include "Moon.h"
#include <cmath>

//
//Constructor
//
Moon::Moon(AstroTime* astroTimeRef) : AstronomicalBody(astroTimeRef){
  //
  //Default constructor
  //
};

//
//Methods
//
void Moon::updatePosition(){
  double julianCentury = astroTime->julianCentury;
  double a_1 = check4GreaterThan360(119.75 + 131.849 * julianCentury) * DEG_2_RAD;
  double a_2 = check4GreaterThan360(53.09 + 479264.290 * julianCentury) * DEG_2_RAD;
  double a_3 = check4GreaterThan360(313.45 + 481266.484 * julianCentury) * DEG_2_RAD;
  double one = 1.0;
  double e_parameter = 1.0 - 0.002516 * julianCentury - 0.0000074 * julianCentury * julianCentury;
  double e_parameter_squared = e_parameter * e_parameter;
  double* onePointer = &one;
  double* e_parameterPointer = &e_parameter;
  double* e_parameter_squaredPointer = &e_parameter_squared;

  //STILL! For the love of cheese why?! BTW, there are 60 of these terms.
  const double D_coeficients[60] = {0.0, 2.0, 2.0, 0.0, 0.0, 0.0, 2.0, 2.0, 2.0,
  2.0, 0.0, 1.0, 0.0, 2.0, 0.0, 0.0, 4.0, 0.0, 4.0, 2.0, 2.0, 1.0, 1.0, 2.0,
  2.0, 4.0, 2.0, 0.0, 2.0, 2.0, 1.0, 2.0, 0.0, 0.0, 2.0, 2.0, 2.0, 4.0, 0.0,
  3.0, 2.0, 4.0, 0.0, 2.0, 2.0, 2.0, 4.0, 0.0, 4.0, 1.0, 2.0, 0.0, 1.0, 3.0,
  4.0, 2.0, 0.0, 1.0, 2.0, 2.0};
  const double M_coeficients[60] = {0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0,
  -1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, -1.0,
  0.0, 0.0, 0.0, 1.0, 0.0, -1.0, 0.0, -2.0, 1.0, 2.0, -2.0, 0.0, 0.0, -1.0, 0.0,
  0.0, 1.0, -1.0, 2.0, 2.0, 1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 1.0, 0.0,
  0.0, -1.0, 2.0, 1.0, 0.0, 0.0};
  const double M_prime_coeficients[60] = {1.0, -1.0, 0.0, 2.0, 0.0, 0.0, -2.0,
  -1.0, 1.0, 0.0, -1.0, 0.0, 1.0, 0.0, 1.0, 1.0, -1.0, 3.0, -2.0, -1.0, 0.0,
  -1.0, 0.0, 1.0, 2.0, 0.0, -3.0, -2.0, -1.0, -2.0, 1.0, 0.0, 2.0, 0.0, -1.0,
  1.0, 0.0, -1.0, 2.0, -1.0, 1.0, -2.0, -1.0, -1.0, -2.0, 0.0, 1.0, 4.0, 0.0,
  -2.0, 0.0, 2.0, 1.0, -2.0, -3.0, 2.0, 1.0, -1.0, 3.0, -1.0};
  const double F_coeficients[60] = {0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0,
  0.0, 0.0, 0.0, 0.0, -2.0, 2.0, -2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -2.0, 2.0, 0.0, 2.0,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -2.0, 0.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 0.0, -2.0};
  const double l_sum_coeficients[60] = {6288774.0, 1274027.0, 658314.0, 213618.0,
  -185116.0, -114332.0, 58793.0, 57066.0, 53322.0, 45758.0, -40923.0, -34720.0,
  -30383.0, 15327.0, -12528.0, 10980.0, 10675.0, 10034.0, 8548.0, -7888.0,
  -6766.0, -5163.0, 4987.0, 4036.0, 3994.0, 3861.0, 3665.0, -2689.0, -2602.0,
  2390.0, -2348.0, 2236.0, -2120.0, -2069.0, 2048.0, -1773.0, -1595.0, 1215.0,
  -1110.0, -892.0, -810.0, 759.0, -713.0, -700.0, 691.0, 596.0, 549.0, 537.0,
  520.0, -487.0, -399.0, -381.0, 351.0, -340.0, 330.0, 327.0, -323.0, 299.0,
  294.0, 0.0};
  const double r_sum_coeficients[60] = {-20905355.0, -3699111.0, -2955968.0,
  -569925.0, 48888.0, -3149.0, 246158.0, -152138.0, -170733.0, -204586.0,
  -129620.0, 108743.0, 104755.0, 10321.0, 0.0, 79661.0, -34782.0, -23210.0,
  -21636.0, 24208.0, 30824.0, -8379.0, -16675.0, -12831.0, -10445.0, -11650.0,
  14403.0, -7003.0, 0.0, 10056.0, 6322.0, -9884.0, 5751.0, 0.0, -4950.0, 4130.0,
  0.0, -3958.0, 0.0, 3258.0, 2616.0, -1897.0, -2117.0, 2354.0, 0.0, 0.0, -1423.0,
  -1117.0, -1571.0, -1739.0, 0.0, -4421.0, 0.0, 0.0, 0.0, 0.0, 1165.0, 0.0, 0.0, 8752.0};
  double* e_coeficients[60] = {onePointer, onePointer, onePointer, onePointer, e_parameterPointer, onePointer,
  onePointer, e_parameterPointer, onePointer, e_parameterPointer, e_parameterPointer, onePointer, e_parameterPointer, onePointer,
  onePointer, onePointer, onePointer, onePointer, onePointer, e_parameterPointer, e_parameterPointer, onePointer, e_parameterPointer,
  e_parameterPointer, onePointer, onePointer, onePointer, e_parameterPointer, onePointer, e_parameterPointer, onePointer,
  e_parameter_squaredPointer, e_parameterPointer, e_parameter_squaredPointer, e_parameter_squaredPointer,
  onePointer, onePointer, e_parameterPointer, onePointer, onePointer, e_parameterPointer, e_parameterPointer, e_parameter_squaredPointer,
  e_parameter_squaredPointer, e_parameterPointer, e_parameterPointer, onePointer, onePointer, e_parameterPointer, onePointer,
  e_parameterPointer, onePointer, e_parameterPointer, onePointer, onePointer, e_parameterPointer, e_parameter_squaredPointer,
  e_parameterPointer, onePointer, onePointer};
  double sum_l = 0.0;
  double sum_r = 0.0;

  //Pre define our variables so we just overwrite their values;
  double D_coeficient;
  double M_coeficient;
  double M_prime_coeficient;
  double F_coeficient;
  double l_sum_coeficient;
  double r_sum_coeficient;
  double DCoeficientTimesMoonElongation;
  double MCoeficientTimesSunsElongation;
  double MPrimeCoeficientTimesMoonsMeanAnomoly;
  double FCoeficientTimesMoonArgumentOfLatitude;
  double sumOfTerms;
  double e_coeficient;
  double absOfMCoeficient;
  double sunsMeanAnomoly = sun->meanAnomaly;
  for(int i=0; i < 60; ++i){
    sumOfTerms = check4GreaterThan360(D_coeficients[i] * meanElongation + M_coeficients[i] * sunsMeanAnomoly + M_prime_coeficients[i] * meanAnomaly + F_coeficients[i] * argumentOfLatitude) * DEG_2_RAD;
    sum_l += (*e_coeficients[i]) * l_sum_coeficients[i] * sin(sumOfTerms);
    sum_r += (*e_coeficients[i]) * r_sum_coeficients[i] * cos(sumOfTerms);
  }

  //For B while we're at it :D. As a side note, there are 60 of these, too.
  const double D_coeficients_2[60] = {0.0, 0.0, 0.0, 2.0,  2.0, 2.0, 2.0, 0.0, 2.0, 0.0, 2.0, 2.0,
  2.0, 2.0, 2.0, 2.0, 2.0, 0.0, 4.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
  4.0, 4.0, 0.0, 4.0, 2.0, 2.0, 2.0, 2.0, 0.0, 2.0, 2.0, 2.0, 2.0, 4.0, 2.0, 2.0,
  0.0, 2.0, 1.0, 1.0, 0.0, 2.0, 1.0, 2.0, 0.0, 4.0, 4.0, 1.0, 4.0, 1.0, 4.0, 2.0};
  const double M_coeficients_2[60] = {0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0,
  0.0, 1.0, -1.0, -1.0, -1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0,
  -1.0, -2.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, 0.0, 0.0,
  0.0, -1.0, -2.0};
  const double M_prime_coeficients_2[60] = {0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 2.0, 1.0, 2.0,
  0.0, -2.0, 1.0, 0.0, -1.0, 0.0, -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 1.0,
  0.0, 0.0, 3.0, 0.0, -1.0, 1.0, -2.0, 0.0, 2.0, 1.0, -2.0, 3.0, 2.0, -3.0, -1.0,
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, -2.0, -1.0, 1.0, -2.0, 2.0, -2.0, -1.0,
  1.0, 1.0, -1.0, 0.0, 0.0};
  const double F_coeficients_2[60] = {1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0,
  -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, 3.0, 1.0, 1.0, 1.0, -1.0, -1.0,
  -1.0, 1.0, -1.0, 1.0, -3.0, 1.0, -3.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0,
  1.0, 1.0, 1.0, -1.0, 3.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0,
  -1.0, -1.0, -1.0, -1.0, -1.0, 1.0};
  const double b_sum_coeficients[60] = {5128122.0, 280602.0, 277693.0, 173237.0, 55413.0, 46271.0,
    32573.0,  17198.0, 9266.0, 8822.0, 8216.0, 4324.0, 4200.0, -3359.0, 2463.0,
    2211.0, 2065.0, -1870.0, 1828.0, -1794.0, -1749.0, -1565.0, -1491.0, -1475.0,
    -1410.0, -1344.0, -1335.0, 1107.0, 1021.0, 833.0, 777.0, 671.0, 607.0, 596.0,
    491.0, -451.0, 439.0, 422.0, 421.0, -366.0, -351.0, 331.0, 315.0, 302.0,
    -283.0, -229.0, 223.0, 223.0, -220.0, -220.0, -185.0,  181.0, -177.0, 176.0,
    166.0, -164.0, 132.0, -119.0, 115.0, 107};
  double* e_coeficients_2[60] = {onePointer, onePointer, onePointer, onePointer, onePointer, onePointer, onePointer,
    onePointer, onePointer, onePointer, e_parameterPointer, onePointer, onePointer, e_parameterPointer, e_parameterPointer,
    e_parameterPointer, e_parameterPointer, e_parameterPointer, onePointer, e_parameterPointer, onePointer,
    e_parameterPointer, onePointer, e_parameterPointer, e_parameterPointer, e_parameterPointer, onePointer,
    onePointer, onePointer, onePointer, onePointer, onePointer, onePointer, onePointer, e_parameterPointer, onePointer, onePointer,
    onePointer, onePointer, e_parameterPointer, e_parameterPointer, onePointer, e_parameterPointer,
    e_parameter_squaredPointer, onePointer, e_parameterPointer, e_parameterPointer,
    e_parameterPointer, e_parameterPointer, e_parameterPointer, onePointer, e_parameterPointer, e_parameterPointer,
    onePointer, e_parameterPointer, onePointer, onePointer, onePointer, e_parameterPointer, e_parameter_squaredPointer};

  double sum_b = 0.0;
  for(int i=0; i < 60; ++i){
    sumOfTerms = check4GreaterThan360(D_coeficients[i] * meanElongation + M_coeficients[i] * sunsMeanAnomoly + M_prime_coeficients[i] * meanAnomaly + F_coeficients[i] * argumentOfLatitude) * DEG_2_RAD;
    sum_b += (*e_coeficients_2[i]) * b_sum_coeficients[i] * sin(sumOfTerms);
  }

  //Additional terms
  sum_l += 3958.0 * sin(a_1) + 1962.0 * sin(meanLongitudeInRads - argumentOfLatitudeInRads) + 318.0 * sin(a_2);
  sum_b += -2235.0 * sin(meanLongitudeInRads) + 382.0 * sin(a_3) + 175.0 * sin(a_1 - argumentOfLatitudeInRads) + 175.0 * sin(a_1 + argumentOfLatitudeInRads);
  sum_b += 127.0 * sin(meanLongitudeInRads - meanAnomalyInRads) - 115.0 * sin(meanLongitudeInRads + meanAnomalyInRads);

  double eclipticalLongitude = (meanLongitude + (sum_l * 0.000001)) * DEG_2_RAD;
  double eclipticalLatitude = (sum_b * 0.000001) * DEG_2_RAD;
  double cos_eclipticalLatitude = cos(eclipticalLatitude);
  double sin_eclipticalLongitude = sin(eclipticalLongitude);
  distanceFromEarthInMeters = 385000560.0 + sum_r;
  #define MEAN_LUNAR_DISTANCE_FROM_EARTH 384400000.0
  scale = MEAN_LUNAR_DISTANCE_FROM_EARTH / distanceFromEarthInMeters;
  //NOTE: We are using a lunar magnitude of 2.0 for now as
  //we do not yet have HDR implemented.
  #define LUNAR_MAGNITUDE 2.0
  irradianceFromEarth = LUNAR_MAGNITUDE * scale * scale;

  //From all of the above, we can get our right ascension and declination
  convertEclipticalLongitudeAndLatitudeToRaAndDec(eclipticalLongitude, sin_eclipticalLongitude, eclipticalLatitude, cos_eclipticalLatitude);

  double geocentricElongationOfTheMoon = acos(cos_eclipticalLatitude * cos((sun->longitude * DEG_2_RAD) - eclipticalLongitude));

  //Finally,update our moon brightness
  //From approximation 48.4 in Meeus, page 346
  double twoTimesMeanElongationInRads = 2.0 * meanAnomalyInRads;
  double lunarPhaseAngleI = 180.0 - meanElongation - 6.289 * sin(meanAnomalyInRads) + 2.1 * sin(sun->meanAnomaly * DEG_2_RAD)
  - 1.274 * sin(twoTimesMeanElongationInRads - meanAnomalyInRads) - 0.658 * sin(twoTimesMeanElongationInRads)
  - 0.214 * sin(2.0 * meanAnomalyInRads) - 0.110 * sin(meanElongationInRads);
  double lunarPhaseAngleInRads = lunarPhaseAngleI * DEG_2_RAD;

  //Changing our lunar intensity model over to the one used by A Physically-Based Night Sky Model
  //by Henrik Jensen et. al.
  #define AVERAGE_ALBEDO_OF_MOON 0.072
  #define RADIUS_OF_THE_MOON_IN_M 1737100.0
  #define TWO_THIRDS 0.6666666666666
  double illuminationOfMoonCoefficient = TWO_THIRDS * AVERAGE_ALBEDO_OF_MOON * (RADIUS_OF_THE_MOON_IN_M * RADIUS_OF_THE_MOON_IN_M) / (distanceFromEarthInMeters * distanceFromEarthInMeters);
  double phiMinusPiOverTwo = 0.5 * (PI - lunarPhaseAngleInRads);
  #define FULL_EARTHSHINE 0.19
  #define IRRADIANCE_OF_SUN 28.8
  double phiOverTwo = 0.5 * lunarPhaseAngleInRads;
  earthShineIntensity = 0.5 * FULL_EARTHSHINE * (1.0 - sin(phiMinusPiOverTwo) * tan(phiMinusPiOverTwo) * log(0.5 * phiMinusPiOverTwo));
  irradianceFromEarth = illuminationOfMoonCoefficient * (earthShineIntensity + IRRADIANCE_OF_SUN * (1.0 - sin(phiOverTwo) * tan(phiOverTwo) * log(0.5 *phiOverTwo)));

  //Update the paralactic angle
  updateParalacticAngle();
}

//
//Getters and Setters
//
void Moon::setMeanLongitude(double inValue){
  meanLongitude = check4GreaterThan360(inValue);
  meanLongitudeInRads = meanLongitude * DEG_2_RAD;
}

void Moon::setMeanElongation(double inValue){
  meanElongation = check4GreaterThan360(inValue);
  meanElongationInRads = meanElongation * DEG_2_RAD;
}

void Moon::setMeanAnomaly(double inValue){
  meanAnomaly = check4GreaterThan360(inValue);
  meanAnomalyInRads = meanAnomaly * DEG_2_RAD;
}

void Moon::setArgumentOfLatitude(double inValue){
  argumentOfLatitude = check4GreaterThan360(inValue);
  argumentOfLatitudeInRads = argumentOfLatitude * DEG_2_RAD;
}

void Moon::setLongitudeOfTheAscendingNodeOfOrbit(double inValue){
  longitudeOfTheAscendingNodeOfOrbit = check4GreaterThan360(inValue);
}

void Moon::updateParalacticAngle(){
  double hourAngle = (astroTime->greenwhichSiderealTime * DEG_2_RAD) - location->lonInRads - rightAscension;
  double parallacticAngleDenominator = tan(location->latInRads) * cos(declination) - sin(declination) * cos(hourAngle);
  parallacticAngle = parallacticAngleDenominator != 0.0 ? sin(hourAngle) / parallacticAngleDenominator : PI_OVER_TWO;
}
