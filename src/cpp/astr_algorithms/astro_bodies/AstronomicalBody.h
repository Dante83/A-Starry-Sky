#include "SkyManager.cpp"

class AstronomicalBody{
protected:
  SkyManager& skyManager;
  AstroTime& astroTime;
  Location& location;
  double azimuth0;
  double altitude0;
  double azimuth1;
  double altitude1;
  double azimuth;
  double altitude;
  void convertRAAndDecToAzAndAlt();
  void convertLambdaAndBetaToRaAndDec();
  void convert2NormalizedGPUCoords();
  double inline check4GreaterThan2Pi(double& inNum);
  double inline check4GreaterThan360(double& inNum);
  double inline checkBetweenMinusPiOver2AndPiOver2(double& inNum);
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
