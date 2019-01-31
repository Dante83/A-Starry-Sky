#include "AstroTime.h"
#include <cmath>
namespace "std";

void AstroTime::setAstroTimeFromYMDHMSTZ(short yr, unsigned char mnth, unsigned char d, unsigned char h, unsigned char m, unsigned char s, float uOffset){
  //Initialize all of our variables.
  short potentialNewYear = yr;
  if(potentialNewYear != year){
    this.updateIsLeapYear();
  }
  month = mnth;
  day = d;
  hour = h;
  minute = m;
  second = s;
  utcOffset = uOffset;
  this.updateJulianDayAndCentury();
}

void AstroTime::updateIsLeapYear(){
  float fltYear = static_cast<float>(year);
  isLeapYear = (fltYear % 4.0 == 0.0 || fltYear == 0.0) && (((fltYear % 100.0 == 0.0) && (fltYear % 400.0 == 0.0)) || (fltYear % 100.0 != 0.0);
  daysInYear = isLeapYear ? 366 : 365;
}

void AstroTime::updateDayOfTheYear(unsigned short& dayOfMonth){
  unsigned short daysUpToMonth[11];
  float fltYear = static_cast<float>(year);
  if(fltYear == 0.0 || year % 4 == 0.0){
    daysUpToMonth = {31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334};
  }
  else{
    daysUpToMonth = {31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335};
  }

  dayOfTheYear = daysUpToMonth[month] + dayOfMonth;
}

void AstroTime::updateJulianDayAndCentury(){
  //
  //NOTE: We still haven't set this timeInDay thing
  //
  double fractionalTime = timeInDay * INV_SECONDS_IN_DAY;
  short unsigned jMonth = 0;
  short unsigned jDay = 0;
  short jYear;
  short unsigned daysPast = 0;
  short unsigned previousMonthsDays = 0;

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
  jYear = year;
  if(cMonth <= 2){
    jYear = --jYear;
    jMonth = jMonth + 12;
  }

  short unsigned jHour = floor(timeInDay * INV_SECONDS_IN_HOUR);
  short unsigned jMinute = floor((timeInDay % SECONDS_IN_HOUR) * INV_SECONDS_IN_MINUTE);
  short unsigned jSecond = floor(timeInDay % SECONDS_IN_MINUTE);
  double B = 0.0;
  //Does this happen after the Gregorian date of 1582-10-15 15:00:00
  if (1582 < jYear || 10 < jYear || 15 < jDay || 12 < jHour || 0 < jMinute || 0 < jSecond) {
    double A = floor((double) jYear * 0.01);
    B = 2.0 - A + floor(A * 0.25);
  }
  julianDay = floor(365.25 * ((double) jYear + 4716.0)) + floor(30.6001 * ((double) jMonth + 1.0)) + (double) jDay + B - 1524.5;

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
