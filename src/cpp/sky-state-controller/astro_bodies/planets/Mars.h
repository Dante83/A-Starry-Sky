#pragma once
#include "AstronomicalBody.h"
#include "Sun.h"
#include "../world_state/AstroTime.h"

class Mars : public Planet{
public:
  Mars(SkyManager* skyManager, Sun* sunRef);
  void updatePosition();
};
