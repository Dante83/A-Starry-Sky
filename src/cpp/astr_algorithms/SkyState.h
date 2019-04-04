#include "world_state/AstroTime.cpp"
#include "world_state/Location.cpp"

#ifndef SKYSTATE
#define SKYSTATE

class SkyState{
public:
  SkyState();
  SkyState(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
  void addSeconds();
  double getJulianDay();
private:
  Location location;
  AstroTime time;
};
#endif
