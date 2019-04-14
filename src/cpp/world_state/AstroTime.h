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

  //Updaters
  void updateLocalApparentSiderealTime(double* longitude);
  void setAstroTimeFromYMDHMSTZ(int yr, int mnth, int d, int h, int m, double s, double uOffset);
  void setGreenwhichSiderealTime(double* inValue);
  void setApparentGreenwhichSiderealTimeFromNutationInRAInDegs(double* inValue);
private:
  bool isLeapYear;
  static int daysInLeapYear[];
  static int daysInNormalYear[];
  int* daysUpToMonth;

  inline void updateIsLeapYear();
  inline void updateDayOfTheYear(int dayOfMonth);
  inline void updateJulianDayAndCentury();
  inline double check4GreaterThan360(double dayOfTheMonth);
};
