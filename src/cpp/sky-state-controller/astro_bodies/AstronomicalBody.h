#pragma once
#include "../world_state/AstroTime.h"
#include "../world_state/Location.h"

class AstronomicalBody{
public:
  AstronomicalBody(AstroTime* astroTimeRef);
  AstroTime* astroTime;
  Location* location;
  double* trueObliquityOfEclipticInRads;
  double rightAscension;
  double declination;
  double irradianceFromEarth;
  void convertEclipticalLongitudeAndLatitudeToRaAndDec(double eclipticalLongitude, double cos_eclipticalLongitude, double eclipticalLatitude, double cos_eclipticalLatitude);
  double check4GreaterThan2Pi(double inNum);
  double check4GreaterThan360(double inNum);
  double checkBetweenMinusPiOver2AndPiOver2(double inNum);
};
