#include <ctime>
#include <string>
#include "Constants.h"

using namespace std;

class AstroTime{
private:
  unsigned short dayOfTheYear;
  short year;
  unsigned short daysInYear;
  unsigned char month;
  unsigned char hour;
  unsigned char minute;
  unsigned char second;
  float utcOffset;
  double julianDay;
  double julianCentury;
  bool isLeapYear;
  unsigned short daysUpToMonth[11];
  void updateIsLeapYear();
  void updateDayOfTheYear(unsigned short& dayOfMonth);
  void updateJulianDayAndCentury();
public:
  //
  //Constructors
  //
  AstroTime(short yr, unsigned char mnth, unsigned char d, unsigned char h, unsigned char m, unsigned char s, float uOffset){
    //Initialize all of our variables and get everything running no matter what
    year = yr;
    month = mnth;
    day = d;
    hour = h;
    minute = m;
    second = s;
    utcOffset = uOffset;
    this.updateIsLeapYear();
    this.updateDayOfTheYear(day);
    this.updateJulianDayAndCentury();
  };

  //
  //Public Methods
  //
  void setAstroTimeFromYMDHMSTZ(short yr, unsigned char mnth, unsigned char d, unsigned char h, unsigned char m, unsigned char s, float uOffset);
  void addSeconds(unsigned short seconds);

  //Getters and setters
  double* getJulianDay();
  double* getJulianCentury();
}
