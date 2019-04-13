#include "SkyManager.cpp"

#ifndef ASTRONOMICAL_BODY
#define ASTRONOMICAL_BODY
class AstronomicalBody{
protected:
  SkyManager& skyManager;
  AstroTime& astroTime;
  Location& location;
  double rightAscension0;
  double declination0;
  double rightAscension1;
  double declination1;
  double rightAscension;
  double declination;
  double azimuth0;
  double altitude0;
  double azimuth1;
  double altitude1;
  double azimuth;
  double altitude;
  void convertLambdaAndBetaToRaAndDec();
  inline void convert2NormalizedGPUCoords();
  inline void updateAzimuthAndAltitudeFromRAAndDec(double ra, double dec);
  inline double check4GreaterThan2Pi(double inNum);
  inline double check4GreaterThan360(double inNum);
  inline double checkBetweenMinusPiOver2AndPiOver2(double inNum);
public:
  AstronomicalBody();
  double& getAzimuth0();
  double& getAzimuth1();
  double& getAltitude0();
  double& getAltitude1();
  void interpolateAzimuthAndAltitude(double fraction);
  double& getInterpolatedAzimuth();
  double& getInterpolatedAltitude();
}
#endif
