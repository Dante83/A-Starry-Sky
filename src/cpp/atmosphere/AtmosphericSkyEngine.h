#pragma once
#include "../world_state/AstroTime.h"

//Note, in our original model
//lightIntensity = (sun/moon)EE
//fadeCoeficient = (sun/moon)fade
//rayleigh

class AtmosphericSkyEngine{
public:
  AtmosphericSkyEngine(double kmAboveSeaLevel, int numberOfRayleighTransmissionSteps, int numberOfMieTransmissionSteps);
  *SkyState skyState;
  double rayleighDensity;
  double meiDensity;
  double stepsPerkm;
  double parameterizedHeight;
private:
  double ozoneRedBeta;
  double ozoneGreenBeta;
  double ozoneBlueBeta;
  double parameterizedViewZenithConst;
  double oneOverOneMinusParameterizedHeight;
  double oneOverOnePlusParamaeterizedHeight;
  double transmitance(double p_0, double p_f, int numSteps);
  void updateHeight(double kmAboveSeaLevel);
  double parameterizeViewZenith(double cosViewZenith);
  double parameterizeSunZenith(double cosSunZenith);
};
