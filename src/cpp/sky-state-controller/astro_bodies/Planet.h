#pragma once
#include "Sun.h"

class Planet : public AstronomicalBody{
public:
  Planet(AstroTime* astroTimeRef);
  Sun* sun;
  double eclipticalLongitude; //L
  double eclipticalLatitude; //B
  double radiusVector; //R
  double heliocentric_x;
  double heliocentric_y;
  double heliocentric_z;
  double distanceFromSun;
protected:
  virtual void updatePosition() = 0;
  virtual void updateEclipticalLongitude() = 0;
  virtual void updateEclipticalLatitude() = 0;
  virtual void updateRadiusVector() = 0;
};
