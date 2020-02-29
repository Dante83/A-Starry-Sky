#pragma once
#include "planets/Earth.cpp"
#include "Sun.h"

class Planet : public AstronomicalBody{
public:
  Planet(AstroTime* astroTimeRef, Sun* sunRef);
  Sun* sun;
  double eclipticalLongitude; //L
  double eclipticalLatitude; //B
  double radiusVector; //R
  double heliocentric_x;
  double heliocentric_y;
  double heliocentric_z;
  double distanceFromSun;
protected:
  virtual void updatePosition();
  virtual void updateEclipticalLongitude();
  virtual void updateEclipticalLatitude();
  virtual void updateRadiusVector();
};
