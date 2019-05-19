#include "Location.h"
#include "../Constants.h"
#include <cmath>

//
//Constructor
//
Location::Location(double latitude, double longitude){
  lat = latitude;
  lng = longitude;
  latInRads = latitude * DEG_2_RAD;
  lonInRads = longitude * DEG_2_RAD;
  cosOfLatitude = cos(latInRads);
  sinOfLatitude = sin(lonInRads);
}
