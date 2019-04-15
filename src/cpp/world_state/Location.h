#pragma once

class Location{
public:
  Location(double latitude, double longitude);
  double lat;
  double lng;
  double latInRads;
  double lonInRads;
  double cosOfLatitude;
  double sinOfLatitude;
};
