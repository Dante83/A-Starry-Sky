#include "SkyManager.cpp"

class AstronomicalBody{
protected:
  SkyManager* skyManager;
  AstroTime* astroTime;
  double rightAscension;
  double declination;
  double lambda;
  double beta;
  double azimuth[2];
  double altitude[2];
  double timeBetweenInterpolationPoints;
  void convertRAAndDecToAzAndAlt();
  void convertLambdaAndBetaToRaAndDec();
  void convert2NormalizedGPUCoords();
  double inline check4GreaterThan2Pi(double& inNum);
  double inline check4GreaterThan360(double& inNum);
  double inline checkBetweenMinusPiOver2AndPiOver2(double& inNum);
public:
  AstronomicalBody(SkyManager* skyManagerRef);
}
