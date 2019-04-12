#include "Sun.cpp"
#include "AstronomicalBody.cpp"

class Moon:AstronomicalBody{
private:
  Sun* sun;
  double meanLongitude;
  double meanElongation;
  double meanAnomaly;
  double argumentOfLatitude;
  double longitudeOfTheAscendingNodeOfOrbit;
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
