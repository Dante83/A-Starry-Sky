#include "Moon.cpp"
#include "Sun.cpp"
#include "../world_state/AstroTime.cpp"
#include "../world_state/Location.cpp"
#include "planets/Venus.cpp"
#include "planets/Mars.cpp"
#include "planets/Jupiter.cpp"
#include "planets/Saturn.cpp"

class SkyManager{
private:
  AstroTime* astrotime;
  Location* location;
  Moon moon;
  Sun sun;
  Planet planets[4];

  double nutationInLongitude;
  double deltaObliquityOfEcliptic;
  double meanObliquityOfTheEclipitic;
  double trueObliquityOfEcliptic;
public:
  SkyManager(AstroTime* astroTime, *Location location);
  Moon* getMoon();
  Sun* getSun();
  Planet* getPlanetByNumber(int planetNumber);
  AstroTime* getAstroTime();
  Location* getLocation();
  void update();
  double* getMeanObliquityOfTheEclipitic();
  void updateSunRaAndDec();
  void updateMoonRaAndDec();
  void updatePlanetsRaAndDec(int planetNumber);
  void swapAllAzimuthsAndAltitudes();
  void interpolateAzimuthAndAltitudes();
  double swapSunAzimuth();
  double swapSunAltititude();
  double swapMoonAzimuth();
  double swapMoonAlititude();
  double swapPlanetAzimuth(int planetNumber);
  double swapPlanetAlititude(int planetNumber);
}
