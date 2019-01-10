#include AstronomicalBody.cpp;
#include Sun.cpp;

class Moon:AstronomicalBody{
  private:
    Sun sun;
    AstronomicalBody positionData;
  public:
    Moon::Moon(WorldState worldState);
}
