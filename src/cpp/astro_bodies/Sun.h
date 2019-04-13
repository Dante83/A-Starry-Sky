#include "AstronomicalBody.cpp";

#ifndef SUN
#define SUN
class Sun:AstronomicalBody{
private:
  double distance2Earth;
  double longitude;
  double meanAnomoly;
  double meanLongitude;
  double trueLongitude;
public:
  Sun(SkyManager* skyManagerRef);
  void updatePosition();
  void setLongitude(double inValue);
  void setMeanAnomaly(double inValue);
  void setTrueLongitude(double inValue);
  double& getLongitude();
  double& getMeanLongitude();
  double& getMeanAnomaly();
}
#endif
