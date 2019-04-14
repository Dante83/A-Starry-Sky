#pragma once
#include "../world_state/AstroTime.h"
#include "../world_state/Location.h"
#include "SkyManagerData.h"
#include "Sun.h"
#include "Moon.h"

class SkyManager{
public:
  SkyManager(AstroTime& astroTimeRef, Location& locationRef);
  AstroTime* astroTime;
  Location* location;
  Moon moon;
  Sun sun;
  SkyManagerData skyManagerData;
  double nutationInLongitude;
  double deltaObliquityOfEcliptic;
  double meanObliquityOfTheEclipitic;
  double trueObliquityOfEcliptic;
  double trueObliquityOfEclipticInRads;
  double eccentricityOfTheEarth;
  void update();
};
