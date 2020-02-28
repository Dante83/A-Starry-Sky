#pragma once
#include "AstronomicalBody.h"
#include "Sun.h"
#include "../world_state/AstroTime.h"

class Venus : public Planet{
public:
  Venus(SkyManager* skyManager, Sun* sunRef);
  void updatePosition();
};
