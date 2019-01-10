#include AstronomicalBody.cpp;

class Sun:AstronomicalBody{
  private:
    AstronomicalBody positionData;
  public:
    Sun::Sun(WorldState worldState);
}
