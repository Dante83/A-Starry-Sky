#pragma once

class AstroTime{
public:
  //Constructor
  AstroTime(int yr, int mnth, int d, int h, int m, double s);
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
  double julianDay;
  double julianCentury;
  double julianMilliennia;
  double greenwhichSiderealTime;
  double greenwhichApparentSiderealTime;
  double localApparentSiderealTime;
  double apparentSiderealTime;

  //Updaters
  void updateLocalApparentSiderealTime(double longitude);
  void setAstroTimeFromYMDHMSTZ(int yr, int mnth, int d, int h, int m, double s);
  void setGreenwhichSiderealTime(double inValue);
private:
  void convertToUTC(double seconds);
  void updateJulianDayAndCentury();
  double check4GreaterThan360(double inValue);
};
