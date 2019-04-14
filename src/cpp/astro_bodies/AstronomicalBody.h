#pragma once
#include "../world_state/AstroTime.h"

class AstronomicalBody{
public:
  AstronomicalBody(AstroTime& astroTimeRef);
  AstroTime* astroTime;
  double* trueObliquityOfEclipticInRadsRef;
  double* eccentricityOfTheEarthRef;
  double* meanObliquityOfTheEclipiticRef;
  double rightAscension0;
  double declination0;
  double rightAscension1;
  double declination1;
  double rightAscension;
  double declination;
  double previousMeasurementTime; //In Julian days.
  double timeBetweenMeasurements; //Converting between julian days and seconds.
  void convertLambdaAndBetaToRaAndDec(double lambda, double beta, double cosBeta);
  void updateTimeBetweenMeasurements(double newMeasurementTime);
  inline double check4GreaterThan2Pi(double inNum);
  inline double check4GreaterThan360(double inNum);
  inline double checkBetweenMinusPiOver2AndPiOver2(double inNum);
  void interpolateRightAscensionAndDeclination(double fraction);
};
