#include "Moon.cpp"
#include "Sun.cpp"
#include "Planet.cpp"
#include "AstroTime.cpp"

class SkyManager{
private:
  AstroTime* astrotime;
  Location* location;
  Moon moon;
  Sun sun;
  Planet planets[4];
public:
  SkyManager(AstroTime* astroTime, *Location location);
  Moon* getMoon();
  Sun* getSun();
  Planet* getPlanetByNumber(int planetNumber);
  AstroTime* getAstroTime();
  Location* getLocation();
  void updateSkyState();
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
