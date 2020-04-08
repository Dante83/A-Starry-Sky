#include "AstroTime.h"
#include "../Constants.h"
#include <cmath>

//
//Constructors
//
AstroTime::AstroTime(int yr, int mnth, int d, int h, int m, double s, double uOffset){
  //Initialize all of our variables and get everything running no matter what
  year = yr;
  dblYear = static_cast<double>(year);
  month = mnth;
  day = d;
  hour = h;
  minute = m;
  second = s;
  timeOfDayInSeconds = static_cast<double>(((h * 60) + m) * 60) + s;
  utcOffset = uOffset;

  //Run internal methods
  updateIsLeapYear();
  updateDayOfTheYear();
  addSeconds(utcOffset * SECONDS_IN_HOUR);
  updateJulianDayAndCentury();
};

//
//Static variables
//
int AstroTime::daysInLeapYear[] = {31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335};
int AstroTime::daysInNormalYear[] = {31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334};
int AstroTime::daysInMonthLeapYear[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
int AstroTime::daysInMonthNormalYear[] = {31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

//
//Functions
//
void AstroTime::addSeconds(double seconds){
  timeOfDayInSeconds += seconds;
  if(timeOfDayInSeconds < 0.0){
    timeOfDayInSeconds = fmod(timeOfDayInSeconds, SECONDS_IN_A_DAY);
    double utcIsXDaysAgo = abs(floor(timeOfDayInSeconds * INV_SECONDS_IN_DAY));
    dayOfTheYear -= utcIsXDaysAgo;
    day -= utcIsXDaysAgo;
    if(dayOfTheYear < 0){
      year -= 1;
      dblYear = static_cast<double>(year);
      month = 12;

      //Get the number of days in this year
      updateIsLeapYear();
      dayOfTheYear = daysInYear + dayOfTheYear; //Note that our day of the year is negative
      day = dayOfTheYear - daysUpToMonth[10]; //daysUpToMonth[10] is November
    }

    //Convert our day of the year back to a normal calender day
    //Should not happen with the above.
    if(day < 0){
      month -= 1;
      day = daysUpToMonth[month - 2] - dayOfTheYear; //month - 2 is last month
    }
  }
  else if(timeOfDayInSeconds >= SECONDS_IN_A_DAY){
    timeOfDayInSeconds = fmod(timeOfDayInSeconds, SECONDS_IN_A_DAY);
    double utcIsXDaysFromNow = abs(floor(timeOfDayInSeconds * INV_SECONDS_IN_DAY));
    dayOfTheYear += utcIsXDaysFromNow;
    day += utcIsXDaysFromNow;
    if(dayOfTheYear > daysInYear){
      year += 1;
      dblYear = static_cast<double>(year);
      month = 1;

      //Get the number of days in this year
      dayOfTheYear -= daysInYear; //This is still the previous years days
      day = dayOfTheYear; //Because we are in january, both of these should be the same
      updateIsLeapYear();
    }

    //Convert our day of the year back to a normal calender day
    //Should not happen with the above.
    if(day > daysInMonth[month - 1]){
      month += 1;
      day -= daysInMonth[month - 1];
    }
  }
  hour = floor(timeOfDayInSeconds * INV_SECONDS_IN_HOUR);
  minute = (timeOfDayInSeconds - hour * SECONDS_IN_HOUR) * INV_SECONDS_IN_MINUTE;
  second = timeOfDayInSeconds - hour * SECONDS_IN_HOUR - minute * SECONDS_IN_MINUTE;
}

void AstroTime::setAstroTimeFromYMDHMSTZ(int yr, int mnth, int d, int h, int m, double s, double uOffset){
  //Initialize all of our variables.
  month = mnth;
  hour = h;
  minute = m;
  second = s;
  utcOffset = uOffset;
  timeOfDayInSeconds = static_cast<double>(((hour * 60) + minute) * 60) + second;
  if(yr != year){
    year = yr;
    dblYear = static_cast<double>(year);
    updateIsLeapYear();
  }
  if(d != day){
    day = d;
    updateDayOfTheYear();
  }
  addSeconds(utcOffset * SECONDS_IN_HOUR);
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

void AstroTime::updateIsLeapYear(){
  if(dblYear == 0.0 || fmod(dblYear, 4.0) == 0.0){
    daysUpToMonth = AstroTime::daysInLeapYear;
    daysInMonth = AstroTime::daysInMonthLeapYear;
  }
  else{
    daysUpToMonth = AstroTime::daysInNormalYear;
    daysInMonth = AstroTime::daysInMonthNormalYear;
  }
  isLeapYear = (fmod(dblYear, 4.0) == 0.0 || dblYear == 0.0) && (((fmod(dblYear, 100.0) == 0.0) && (fmod(dblYear, 400.0) == 0.0)) || (fmod(dblYear, 100.0) != 0.0));
  daysInYear = isLeapYear ? 366 : 365;
}

void AstroTime::updateDayOfTheYear(){
  dayOfTheYear = month > 1 ? (daysUpToMonth[month - 2] + day) : day;
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
