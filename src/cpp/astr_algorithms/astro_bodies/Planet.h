#include AstronomicalBody.cpp;
#include Sun.cpp;

class Planet:AstronomicalBody{
private:
  Sun sun;
  AstronomicalBody positionData;
public:
  Planet::Planet(WorldState worldState);
}
