#pragma once

class SkyLUTGenerator{
public:
  SkyLUTGenerator(double mieDirectioanlG, int stepsPerKilo, int numRotationalSteps);
  void constructLUTs();
  int* transmittanceStridedLUTPtr;
  int* scatteringStridedLUTPrt;
private:
  int stepsPerkm;
  int numRotSteps;
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
  double cosViewZenithFromParameter(double parameterizedViewZenith);
  double cosLightZenithFromParameter(double parameterizedSunZenith);
};
