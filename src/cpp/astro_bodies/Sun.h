#pragma once
#include "../world_state/AstroTime.h"
#include "AstronomicalBody.h"

class Sun : public AstronomicalBody{
public:
  Sun(AstroTime& astroTimeRef);
  double distance2Earth;
  double equationOfCenter;
  double longitude;
  double meanAnomoly;
  double meanLongitude;
  double trueLongitude;
  void updatePosition();
  void setLongitude(double inValue);
  void setMeanAnomaly(double& inValue);
  void setTrueLongitude(double& inValue);
};
