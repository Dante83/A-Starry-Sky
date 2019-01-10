#include "../../Constants.h"
#include "Location.h"

//
//Getters
//
float * Location::GetLatitude(){
  return lat;
}

float * Location::GetLongitude(){
  return long;
}

double * Location::GetLatitudeInRads(){
  return long;
}

double * Location::GetLongitudeInRads(){
  return long;
}

//
//Setters
//
void Location::SetLatitudeAndLongitude(double latitude, double longitude){
  lat = latitude;
  lon = longitude;
  latInRads = static_cast<double>(latitude) * DEG2RAD;
  lonInRads = static_cast<double>(longitude) * DEG2RAD;
}
