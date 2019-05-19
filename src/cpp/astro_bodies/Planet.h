#include "planets/Venus.cpp"
#include "planets/Mars.cpp"
#include "planets/Jupiter.cpp"
#include "planets/Saturn.cpp"

class Planet : public AstronomicalBody{
private:
  Sun* sun;
public:
  Planet(SkyManager& skyManager, Sun& sunRef);
};
