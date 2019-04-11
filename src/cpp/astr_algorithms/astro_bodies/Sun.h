#include "AstronomicalBody.cpp";

class Sun:AstronomicalBody{
private:
  double distance2Earth;
  double longitude;
  double meanAnomoly;
  double meanLongitude;
public:
  Sun();
  Sun(SkyManager* skyManagerRef);
  void updateAstronomicalState();
}
