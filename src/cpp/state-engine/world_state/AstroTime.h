#pragma once

class AstroTime{
public:
  //Constructor
  AstroTime(int yr, int mnth, int d, int h, int m, double s, double uOffset);
  //variables
  int dayOfTheYear;
  int year;
  double dblYear;
  int daysInYear;
  int month;
  int day;
  int hour;
  int minute;
  double second;
  double timeOfDayInSeconds;
  double utcOffset;
  double julianDay;
  double julianCentury;
  double greenwhichSiderealTime;
  double greenwhichApparentSiderealTime;
  double localApparentSiderealTime;
  double apparentSiderealTime;

  //Updaters
  void updateLocalApparentSiderealTime(double longitude);
  void setAstroTimeFromYMDHMSTZ(int yr, int mnth, int d, int h, int m, double s, double uOffset);
  void setGreenwhichSiderealTime(double inValue);
private:
  bool isLeapYear;
  static int daysInLeapYear[];
  static int daysInNormalYear[];
  static int daysInMonthLeapYear[];
  static int daysInMonthNormalYear[];
  int* daysUpToMonth;
  int* daysInMonth;

  void addSeconds(double seconds);
  void updateIsLeapYear();
  void updateDayOfTheYear();
  void updateJulianDayAndCentury();
  double check4GreaterThan360(double inValue);
};
