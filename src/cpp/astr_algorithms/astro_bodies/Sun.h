#include "AstronomicalBody.cpp";

class Sun:AstronomicalBody{
private:
  double distance2Earth;
  double longitude;
  double meanAnomoly;
  double meanLongitude;
public:
  Sun(SkyManager* skyManagerRef);
  void updatePosition();
  void updatePosition(double secondsTillNextUpdate);
  void setLongitude(double inValue);
  void setMeanAnomaly(double inValue);
  double& getLongitude();
  double& getMeanAnomaly();
}
