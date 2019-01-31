#include "Constants.h"

class Location{
private:
  float lat;
  float lon;
  double latInRads;
  double lonInRads;
public:
  Location::Location(float latitude, float longitude){
    latitude = (lat == NULL) ? DEFAULT_LATITUDE : latitude;
    longitude = (lon == NULL) ? DEFAULT_LONGITUDE : longitude;
    this.SetLatitudeAndLongitude(latitude, longitude);
  }

  float& GetLatitude();
  float& GetLongitude();
  float& GetLatitudeInRads();
  float& GetLongitudeInRads();
  void SetLatitudeAndLongitude(double latitude, double longitude);
}
