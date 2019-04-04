#include "Moon.cpp"
#include "Sun.cpp"
#include "Planet.cpp"

class SkyManager{
private:
  Moon moon;
  Sun sun;
  Planet planets[4];
public:
  SkyManager();
  Moon* getMoon();
  Sun* getSun();
  Planet* getPlanetByNumber(planetNumber);
  void update();
}
