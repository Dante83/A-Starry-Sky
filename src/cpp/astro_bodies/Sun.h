#pragma once
#include "../world_state/AstroTime.h"
#include "AstronomicalBody.h"

class Sun : public AstronomicalBody{
public:
  Sun(AstroTime* astroTimeRef);
  double* eccentricityOfTheEarth;
  double* meanObliquityOfTheEclipitic;
  double distance2Earth;
  double equationOfCenter;
  double longitude;
  double meanAnomaly;
  double meanLongitude;
  double meanLongitudeInRads;
  double trueLongitude;
  void updatePosition();
  void setLongitude(double inValue);
  void setMeanAnomaly(double inValue);
  void setMeanLongitude(double inValue);
  void setTrueLongitude(double& inValue);
};
