#include "../world_state/AstroTime.h"
#include "../world_state/Location.h"
#include "SkyManager.h"
#include "Sun.h"
#include "Moon.h"
#include "SkyManagerData.h"
#include "../Constants.h"

SkyManager::SkyManager(AstroTime &astroTimeRef, Location &locationRef){
  astroTime = astroTimeRef;
  location = locationRef;

  //For a standard sky we have one sun, one moon and four planets
  //which are visible to the naked eye (we ignore Mercury and anything past Saturn).
  sun = new Sun(astroTimeRef);
  moon = new Moon(astroTimeRef);
  skyManagerData = new SkyManagerData(astroTimeRef, locationRef, &sun, &moon);
  sun.skyManagerData = &skyManagerData;
  moon.skyManagerData = &skyManagerData;
  skyManagerData.update();
  sun.updatePosition();
  moon.updatePosition();

  //
  //TODO: Implement planets
  //
  //Planets
  // Planet[0] = Venus(this);
  // Planet[1] = Mars(this);
  // Planet[2] = Jupiter(this);
  // Planet[3] = Saturn(this);
}
