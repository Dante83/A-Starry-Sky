#include "world_state/AstroTime.cpp"
#include "world_state/Location.cpp"

#ifndef SKYSTATE
#define SKYSTATE

class SkyState{
private:
  Location location;
  AstroTime astroTime;
  SkyManager skyManager;
  void updateSunAndMoon();
  void updateEverything();
public:
  SkyState();
  SkyState(double latitude, double longitude, int year, int month, int day, int hour, int minute, double second, double utcOffset);
  AstroTime& getAstroTime();
  SkyManager& getSkyManager();
};
#endif
