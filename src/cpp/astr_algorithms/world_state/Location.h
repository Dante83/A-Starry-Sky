#include "Constants.h"

#ifndef LOCATION
#define LOCATION
class Location{
private:
  double lat;
  double lng;
  double latInRads;
  double lonInRads;
public:
  //Constructor
  Location();
  Location(double latitude, double longitude);

  //Getters and setters
  void setLatitudeAndLongitude(double latitude, double longitude);
  double& getLatitude();
  double& getLongitude();
  double& getLatitudeInRads();
  double& getLongitudeInRads();
};
#endif
