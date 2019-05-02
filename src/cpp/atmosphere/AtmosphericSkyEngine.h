#pragma once
#include "../world_state/AstroTime.h"

class AtmosphericSkyEngine{
public:
  AtmosphericSkyEngine(double kmAboveSeaLevel, int numberOfRayleighTransmissionSteps, int numberOfMieTransmissionSteps);
  *SkyState skyState;
  double rayleighDensity;
  double meiDensity;
  double stepsPerkm;
  double parameterizedHeight;
  //Height, View Angle
  double transmittanceInterpolationTarget[32][128][3];
  int intTransmittanceInterpolationTarget[32][128][3];
  //Height, View Angle, Sun Angle
  double scatteringInterpolationTarget[32][64][32][4];
  //Height, Sun Angle, View Angle
  int intScatteringInterpolationTarget[32][32][64][4];
  double gatheringSumInterpolationTarget[32][32][4];
  int arialPerspective[32][32][16][4];
  int transmittanceFromCamera[32][32][16][4];
private:
  double ozoneRedBeta;
  double ozoneGreenBeta;
  double ozoneBlueBeta;
  double parameterizedViewZenithConst;
  double oneOverOneMinusParameterizedHeight;
  double oneOverOnePlusParamaeterizedHeight;
  double distancePreCalculation;
  double transmitance(double p_0, double p_f, int numSteps);
  void updateHeight(double kmAboveSeaLevel);
  double parameterizeViewZenith(double cosViewZenith);
  double parameterizeSunZenith(double cosSunZenith);
};
