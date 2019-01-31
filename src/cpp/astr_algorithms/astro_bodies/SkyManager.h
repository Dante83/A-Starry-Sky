#include "Moon.cpp"
#include "Sun.cpp"
#include "Planet.cpp"

class SkyManager{
private:
  WorldState& worldState;
  Moon moon;
  Sun sun;
  Planet planets[4];
public:
  SkyManager(WorldState& worldStateRef);
  Moon* getMoon();
  Sun* getSun();
  Planet* getPlanetByNumber(planetNumber);
  void update();
}
