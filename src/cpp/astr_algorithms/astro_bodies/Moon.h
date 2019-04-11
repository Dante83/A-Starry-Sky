#include "AstronomicalBody.cpp"

class Moon:AstronomicalBody{
private:
  Sun* sun;
public:
  Moon(SkyManager& skyManagerRef, Sun* sunRef);
  void updateAstronomicalState();
}
