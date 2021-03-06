#pragma once
#include "AstronomicalBody.h"
#include "Sun.h"
#include "../world_state/AstroTime.h"

class Moon : public AstronomicalBody{
public:
  Moon(AstroTime* astroTimeRef);
  Sun* sun;
  double meanLongitude;
  double meanLongitudeInRads;
  double meanElongation;
  double meanElongationInRads;
  double meanAnomaly;
  double meanAnomalyInRads;
  double argumentOfLatitude;
  double argumentOfLatitudeInRads;
  double longitudeOfTheAscendingNodeOfOrbit;
  double distanceFromEarthInMeters;
  double earthShineIntensity;
  double angularDiameterMultiplier;
  double parallacticAngle;
  double scale;
  double irradianceFromEarth;
  double illuminatedFractionOfMoon;
  void updatePosition(double trueObliquityOfEclipticInRads);
  void setMeanLongitude(double inValue);
  void setMeanElongation(double inValue);
  void setMeanAnomaly(double inValue);
  void setArgumentOfLatitude(double inValue);
  void setLongitudeOfTheAscendingNodeOfOrbit(double inValue);
  void updateParalacticAngle();
};
