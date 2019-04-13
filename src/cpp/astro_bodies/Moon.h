#include "Sun.cpp"
#include "AstronomicalBody.cpp"

#ifndef MOON
#define MOON
class Moon:AstronomicalBody{
private:
  Sun* sun;
  double meanLongitude;
  double meanElongation;
  double meanAnomaly;
  double argumentOfLatitude;
  double longitudeOfTheAscendingNodeOfOrbit;
  double e_parameter;
  double e_parameter_squared;
  double distanceFromEarthInMeters;
  double moon_EE
public:
  Moon(SkyManager& skyManagerRef, Sun* sunRef);
  void updatePosition();
  void updatePosition(double secondsTillNextUpdate);
  void setMeanLongitude(double inValue);
  void setMeanElongation(double inValue);
  void setMeanAnomaly(double inValue);
  void setArgumentOfLatitude(double inValue);
  void setLongitudeOfTheAscendingNodeOfOrbit(double inValue);

  double& getMeanLongitude();
  double& getMeanElongation();
  double& getMeanAnomaly();
  double& getArgumentOfLatitude();
  double& getLongitudeOfTheAscendingNodeOfOrbit();
}
#endif
