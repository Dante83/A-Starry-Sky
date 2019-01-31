#include "SkyManager.cpp"
#include <vector>

class AstronomicalBody{
protected:
  SkyManager* skyManager;
  double rightAscension;
  double declination;
  double lambda;
  double beta;
  double azimuth;
  double altitude;
  double gpuCoords[3];
  void convertRAAndDecToAzAndAlt();
  void convertLambdaAndBetaToRaAndDec();
  void convert2NormalizedGPUCoords();
  double check4GreaterThan2Pi(double& inNum);
  double check4GreaterThan360(double& inNum);
  double checkBetweenMinusPiOver2AndPiOver2(double& inNum);
public:
  AstronomicalBody(SkyManager* skyManagerRef);
  void virtual update();
}
