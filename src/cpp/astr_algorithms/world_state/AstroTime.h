#include "Constants.h"

#ifndef ASTROTIME
#define ASTROTIME
class AstroTime{
private:
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
  bool isLeapYear;
  static int daysInLeapYear[];
  static int daysInNormalYear[];
  int* daysUpToMonth;
  void updateIsLeapYear();
  void updateDayOfTheYear(int& dayOfMonth);
  void updateJulianDayAndCentury();
  double inline check4GreaterThan360(double inValue);
public:
  //Constructor
  AstroTime();
  AstroTime(int yr, int mnth, int d, int h, int m, double s, double uOffset);

  //Updaters
  void updateLocalApparentSiderealTime(double longitude);

  //Getters and setters
  void setAstroTimeFromYMDHMSTZ(int yr, int mnth, int d, int h, int m, double s, double uOffset);
  void addSeconds(double seconds);
  void setGreenwhichSiderealTime(double inValue);
  void setApparentGreenwhichSiderealTimeFromNutationInRAInDegs(double inValue);
  double& getJulianDay();
  double& getJulianCentury();
  double& getGreenwhichSiderealTime();
  double& getApparentGreenwhichSiderealTime();
};
#endif
