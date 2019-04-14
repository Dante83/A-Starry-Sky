#pragma once
#include "AstronomicalBody.h"
#include "../world_state/AstroTime.h"


class Moon : public AstronomicalBody{
public:
  Moon(AstroTime& astroTimeRef);
  double meanLongitude;
  double meanElongation;
  double meanAnomaly;
  double argumentOfLatitude;
  double longitudeOfTheAscendingNodeOfOrbit;
  double distanceFromEarthInMeters;
  double moon_EE;
  void updatePosition();
  void updatePosition(double secondsTillNextUpdate);
  void setMeanLongitude(double inValue);
  void setMeanElongation(double inValue);
  void setMeanAnomaly(double inValue);
  void setArgumentOfLatitude(double inValue);
  void setLongitudeOfTheAscendingNodeOfOrbit(double inValue);
};
