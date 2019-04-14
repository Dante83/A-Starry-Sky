#include "Location.h"
#include <cmath>

//
//Constructor
//
Location::Location(double latitude, double longitude){
  this->lat = latitude;
  this->lng = longitude;
  this->latInRads = latitude * DEG_2_RAD;
  this->lonInRads = longitude * DEG_2_RAD;
  this->cosOfLatitude = cos(this->latInRads);
  this->sinOfLatitude = sin(this->lonInRads);
}

//
//Setters
//
void Location::setLatitudeAndLongitude(double latitude, double longitude){
  this->lat = latitude;
  this->lng = longitude;
  this->latInRads = latitude * DEG_2_RAD;
  this->lonInRads = longitude * DEG_2_RAD;
}
