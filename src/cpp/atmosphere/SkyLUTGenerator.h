#pragma once
#include "../world_state/AstroTime.h"

class SkyLUTGenerator{
public:
  SkyLUTGenerator(double stepsPerKilo, int numRotationalSteps, double mieDirectioanlG);
  void constructLUTs();
  uint8_t* transmittanceStridedLUTPtr;
  uint8_t* scatteringStridedLUTPrt;
private:
  double stepsPerkm;
  int numRotationalSteps;
  double mieDirectioanlG;
  double mieG;
  double parameterizedViewZenithConst;
  double oneOverOneMinusParameterizedHeight;
  double oneOverOnePlusParamaeterizedHeight;
  double getMiePhaseAtThetaEqualsZero();
  double getMiePhase(double cosThetaSquared);
  double getRayleighPhase(double cosThetaSquared);
  int updateHeight(double kmAboveSeaLevel);
  double parameterizeViewZenith(double cosViewZenith);
  double parameterizeLightZenith(double cosSunZenith);
  double updateHeightFromParameter(double parameterKMAboveSeaLevel);
  double cosViewAngleFromParameter(double parameterizedViewZenith);
  double cosLightZenithFromParameter(double parameterizedSunZenith);
};
