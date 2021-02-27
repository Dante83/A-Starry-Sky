#include "AstroTime.h"
#include "../Constants.h"
#include <cmath>

//
//Constructors
//
AstroTime::AstroTime(int yr, int mnth, int d, int h, int m, double s){
  //Initialize all of our variables and get everything running no matter what
  year = yr;
  dblYear = static_cast<double>(year);
  month = mnth;
  day = d;
  hour = h;
  minute = m;
  second = s;
  timeOfDayInSeconds = static_cast<double>(((h * 60) + m) * 60) + s;

  //Run internal methods
  updateJulianDayAndCentury();
};

void AstroTime::setAstroTimeFromYMDHMSTZ(int yr, int mnth, int d, int h, int m, double s){
  //Initialize all of our variables.
  month = mnth;
  hour = h;
  minute = m;
  second = s;
  timeOfDayInSeconds = static_cast<double>(((hour * 60) + minute) * 60) + second;
  if(yr != year){
    year = yr;
    dblYear = static_cast<double>(year);
  }
  if(d != day){
    day = d;
  }
  updateJulianDayAndCentury();
}

double AstroTime::check4GreaterThan360(double inNum){
  double outDegrees = fmod(inNum, 360.0);
  if(outDegrees < 0.0){
    return (360 + outDegrees);
  }
  else if(outDegrees == 360.0){
    return 0.0;
  }
  return outDegrees;
}

void AstroTime::updateJulianDayAndCentury(){
  double fractionalTime = timeOfDayInSeconds * INV_SECONDS_IN_DAY;
  double jYear = dblYear;
  double jMonth = static_cast<double>(month);
  double jDay = static_cast<double>(day) + fractionalTime;

  if(jMonth <= 2.0){
    jYear -= 1.0;
    jMonth += 12.0;
  }

  double B = 0.0;
  //Does this happen after the Gregorian date of 1582-10-15 15:00:00
  if(jYear > 1582.0 || (jYear == 1582.0 && (jMonth > 10.0 || (jMonth == 10.0 && jDay > 15.5) ) ) ){
    double A = floor(dblYear * 0.01);
    B = 2.0 - A + floor(A * 0.25);
  }

  julianDay = floor(365.25 * (jYear + 4716.0)) + floor(30.6001 * (jMonth + 1.0)) + jDay + B - 1524.5;

  //Finally let's calculate the Julian Century
  //(julianDay - 2451545.0) / 36525.0;
  julianCentury = (julianDay - 2451545.0) * JULIAN_CENTURY_DENOMINATOR;
  julianMilliennia = julianCentury * 0.1;
}

void AstroTime::updateLocalApparentSiderealTime(double longitude){
  localApparentSiderealTime = check4GreaterThan360(apparentSiderealTime + longitude);
}

//
//Getters and Setters
//
void AstroTime::setGreenwhichSiderealTime(double inValue){
  greenwhichSiderealTime = check4GreaterThan360(inValue);
}
