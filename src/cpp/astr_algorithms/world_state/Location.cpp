#include "../../Constants.h"
#include "Location.h"

//
//Getters
//
float& Location::GetLatitude(){
  return lat;
}

float& Location::GetLongitude(){
  return long;
}

double& Location::GetLatitudeInRads(){
  return long;
}

double& Location::GetLongitudeInRads(){
  return long;
}

//
//Setters
//
void Location::SetLatitudeAndLongitude(double latitude, double longitude){
  lat = latitude;
  lon = longitude;
  latInRads = ((double) latitude) * DEG2RAD;
  lonInRads = ((double) longitude) * DEG2RAD;
}
