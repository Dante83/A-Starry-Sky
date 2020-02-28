#pragma once
#include "AstronomicalBody.h"
#include "Sun.h"
#include "../world_state/AstroTime.h"

class Jupiter : public Planet{
public:
  Jupiter(SkyManager* skyManager, Sun* sunRef);
  void updatePosition();
};
