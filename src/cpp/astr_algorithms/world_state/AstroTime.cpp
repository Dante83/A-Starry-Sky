#include "AstroTime.h"
#include <algorithm>
#include <cmath>

//
//Constructors
//
AstroTime::AstroTime(){};
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
  updateDayOfTheYear(day);
  updateJulianDayAndCentury();
};

//
//Static variables
//
int AstroTime::daysInLeapYear[] = {31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335};
int AstroTime::daysInNormalYear[] = {31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334};

//
//Functions
//
void AstroTime::setAstroTimeFromYMDHMSTZ(int yr, int mnth, int d, int h, int m, double s, double uOffset){
  //Initialize all of our variables.
  year = yr;
  dblYear = static_cast<double>(year);
  int potentialNewYear = yr;
  if(potentialNewYear != year){
    updateIsLeapYear();
  }
  month = mnth;
  day = d;
  hour = h;
  minute = m;
  second = s;
  utcOffset = uOffset;
  timeOfDayInSeconds = static_cast<double>(((h * 60) + m) * 60) + s;
  updateJulianDayAndCentury();
}

inline void AstroTime::updateIsLeapYear(){
  isLeapYear = (fmod(dblYear, 4.0) == 0.0 || dblYear == 0.0) && (((fmod(dblYear, 100.0) == 0.0) && (fmod(dblYear, 400.0) == 0.0)) || (fmod(dblYear, 100.0) != 0.0));
  daysInYear = isLeapYear ? 366 : 365;
}

inline void AstroTime::updateDayOfTheYear(int& dayOfMonth){
  if(dblYear == 0.0 || fmod(dblYear, 4.0) == 0.0){
    daysUpToMonth = AstroTime::daysInLeapYear;
  }
  else{
    daysUpToMonth = AstroTime::daysInNormalYear;
  }

  dayOfTheYear = daysUpToMonth[month] + dayOfMonth;
}

inline void AstroTime::updateJulianDayAndCentury(){
  double fractionalTime = timeOfDayInSeconds * INV_SECONDS_IN_DAY;
  int jMonth = 0;
  int jDay = 0;
  int daysPast = 0;
  int previousMonthsDays = 0;

  //January...
  if(daysUpToMonth[0] >= dayOfTheYear){
    jMonth = 1;
    jDay = dayOfTheYear;
  }
  else{
    //Febuary...
    if(daysUpToMonth[1] >= dayOfTheYear){
      jMonth = 2;
      jDay = dayOfTheYear - daysUpToMonth[0];
    }
    else{
      //The rest of the year...
      for(int m = 2; m < 12; m++){
        if(daysUpToMonth[m] >= dayOfTheYear){
          jMonth = m + 1;
          jDay = dayOfTheYear - daysUpToMonth[m - 1];
        }
      }
    }
  }

  double fractionalDay = static_cast<double>(jDay) + fractionalTime;
  double jYear = static_cast<double>(year);
  if(month <= 2){
    jYear = --jYear;
    jMonth = jMonth + 12;
  }

  int jHour = floor(timeOfDayInSeconds * INV_SECONDS_IN_HOUR);
  int jMinute = floor(fmod(timeOfDayInSeconds, SECONDS_IN_HOUR) * INV_SECONDS_IN_MINUTE);
  int jSecond = floor(fmod(timeOfDayInSeconds, SECONDS_IN_MINUTE));
  double B = 0.0;
  //Does this happen after the Gregorian date of 1582-10-15 15:00:00
  if (1582 < jYear || 10.0 < jYear || 15 < jDay || 12 < jHour || 0 < jMinute || 0 < jSecond) {
    double A = floor(jYear * 0.01);
    B = 2.0 - A + floor(A * 0.25);
  }
  julianDay = floor(365.25 * (jYear + 4716.0)) + floor(30.6001 * ((double) jMonth + 1.0)) + (double) jDay + B - 1524.5;

  //Finally let's calculate the Julian Century
  //(julianDay - 2451545.0) / 36525.0;
  julianCentury = (julianDay - 2451545.0) * JULIAN_CENTURY_DENOMINATOR;
}

//
//Getters
//
double& AstroTime::getJulianDay(){
  return julianDay;
};
double& AstroTime::getJulianCentury(){
  return julianCentury;
};
