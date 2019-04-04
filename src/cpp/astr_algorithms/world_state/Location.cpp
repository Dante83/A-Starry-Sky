#include "../../Constants.h"
#include "Location.h"

//
//Constructor
//
Location::Location(){};//Default constructor
Location::Location(double latitude, double longitude){
  lat = latitude;
  lng = longitude;
  latInRads = latitude * DEG2RAD;
  lonInRads = longitude * DEG2RAD;
};

//
//Getters
//
double& Location::getLatitude(){
  return lat;
}

double& Location::getLongitude(){
  return lng;
}

double& Location::getLatitudeInRads(){
  return latInRads;
}

double& Location::getLongitudeInRads(){
  return lonInRads;
}

//
//Setters
//
void Location::setLatitudeAndLongitude(double latitude, double longitude){
  lat = latitude;
  lng = longitude;
  latInRads = latitude * DEG2RAD;
  lonInRads = longitude * DEG2RAD;
}
