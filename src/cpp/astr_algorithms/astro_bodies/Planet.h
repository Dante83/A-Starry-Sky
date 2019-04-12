#include "Sun.cpp"
#include "AstronomicalBody.cpp"

class Planet:AstronomicalBody{
private:
  Sun* sun;
public:
  Planet(SkyManager& skyManager, Sun& sunRef);
}
