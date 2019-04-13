#include "Moon.cpp"
#include "Sun.cpp"
#include "../world_state/AstroTime.cpp"
#include "../world_state/Location.cpp"
#include "planets/Venus.cpp"
#include "planets/Mars.cpp"
#include "planets/Jupiter.cpp"
#include "planets/Saturn.cpp"

#ifndef SKY_MANAGER
#define SKY_MANAGER
class SkyManager{
private:
  AstroTime& astroTime;
  Location& location;
  Moon moon;
  Sun sun;
  Planet planets[4];

  double nutationInLongitude;
  double deltaObliquityOfEcliptic;
  double meanObliquityOfTheEclipitic;
  double trueObliquityOfEcliptic;
  double trueObliquityOfEclipticInRads;
  double eccentricityOfTheEarth;
public:
  SkyManager(AstroTime& astroTime, Location& location);
  Moon& getMoon();
  Sun& getSun();
  Planet& getPlanetByNumber(int planetNumber);
  AstroTime& getAstroTime();
  Location& getLocation();
  double& getMeanObliquityOfTheEclipitic();
  double& getEccentricityOfTheEarth();
  double& getTrueObliquityOfEclipticInRads();
  void update();
}
#endif
