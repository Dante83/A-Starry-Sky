#include "../../world_state/AstroTime.h"
#include "../../Constants.h"
#include "../OtherPlanet.h"
#include "Earth.h"
#include "Mercury.h"
#include <cmath>

//
//Constructor
//
Mercury::Mercury(AstroTime* astroTimeRef) : OtherPlanet(astroTimeRef){
  //
  //Default constructor
  //
};

//From page 286 of Meeus
void Mercury::updateMagnitudeOfPlanet(){
  double distanceFromEarthInAU = distanceFromEarth / AVERAGE_SOLAR_DISTANCE;
  double distanceFromSunInAU = distanceFromSun / AVERAGE_SOLAR_DISTANCE;
  double phaseAngle = getPhaseAngleInDegrees();
  double phaseAngleTerms = 0.0380 * phaseAngle - 0.000273 * phaseAngle * phaseAngle + 0.000002 * phaseAngle * phaseAngle * phaseAngle;
  irradianceFromEarth = -0.42 + 5.0 * log10(distanceFromEarthInAU * distanceFromSunInAU) + phaseAngleTerms;
}

void Mercury::updateEclipticalLongitude(){
  const double L_0_A[38] = {440250710.0, 40989415.0, 5046294.0, 855347.0, 165590.0,
    34562.0, 7583.0, 3560.0, 1803.0, 1726.0, 1590.0, 1365.0, 1017.0, 714.0, 644.0,
    451.0, 404.0, 352.0, 345.0, 343.0, 339.0, 325.0, 273.0, 264.0, 260.0, 239.0, 235.0,
    217.0, 209.0, 183.0, 182.0, 176.0, 173.0, 142.0, 138.0, 125.0, 118.0, 106.0};
  const double L_0_B[38] = {0.0, 1.48302034, 4.4778549, 1.165203, 4.119692, 0.77931,
    3.7135, 1.512, 4.1033, 0.3583, 2.9951, 4.5992, 0.8803, 1.541, 5.303, 6.050,
    3.282, 5.242, 2.792, 5.765, 5.863, 1.337, 2.495, 3.917, 0.987, 0.113, 0.267,
    0.660, 2.092, 2.629, 2.434, 4.536, 2.452, 3.36, 0.291, 3.721, 2.781, 4.206};
  const double L_0_C[38] = {0.0, 26087.90314157, 52175.8062831, 78263.706425, 104351.612566,
    130439.51571, 156527.4188, 1109.3786, 5661.332, 182615.322, 25028.5212, 27197.2817,
    31749.2352, 24978.525, 21535.95, 51116.424, 208703.225, 20426.571, 15874.618, 955.6,
    2558.212, 53285.185, 529.691, 57837.138, 4551.953, 1059.382, 11322.664, 13521.751,
    47623.853, 27043.503, 25661.305, 51066.428, 24498.830, 37410.567, 10213.286,
    39609.655, 77204.327, 19804.827};

  double L0 = 0.0;
  for(int i = 0; i < 38; ++i){
    L0 += L_0_A[i] * cos(L_0_B[i] + L_0_C[i] * astroTime->julianMilliennia);
  }

  const double L_1_A[16] = {2608814706223.0, 1126008.0, 303471.0, 80538.0, 21245.0,
    5592.0, 1472.0, 388.0, 352.0, 103.0, 94.0, 91.0, 52.0, 44.0, 28.0, 27.0};
  const double L_1_B[16] = {0.0, 6.2170397, 3.055655, 6.10455, 2.83532, 5.8268,
    2.5185, 5.48, 3.052, 2.149, 6.12, 0.0, 5.62, 4.57, 3.04, 5.09};
  const double L_1_C[16] = {0.0, 26087.9031416, 52175.806283, 78263.70942,
    104351.61257, 130439.5157, 156527.4188, 182615.322, 1109.379, 208703.225,
    27197.28, 24978.52, 5661.33, 25028.52, 51066.43, 234791.13};

  double L1 = 0.0;
  for(int i = 0; i < 16; ++i){
    L1 += L_1_A[i] * cos(L_1_B[i] + L_1_C[i] * astroTime->julianMilliennia);
  }

  const double L_2_A[10] = {53050.0, 16904.0, 7397.0, 3018.0, 1107.0, 378.0, 123.0, 39.0, 15.0, 12.0};
  const double L_2_B[10] = {0.0, 4.69072, 1.3474, 4.4564, 1.2623, 4.32, 1.069, 4.08, 4.63, 0.79};
  const double L_2_C[10] = {0.0, 26087.90314, 52175.8063, 78263.7094, 104351.6126, 130439.516,
    156527.419, 182615.32, 1109.38, 208703.23};

  double L2 = 0.0;
  for(int i = 0; i < 10; ++i){
    L2 += L_2_A[i] * cos(L_2_B[i] + L_2_C[i] * astroTime->julianMilliennia);
  }

  const double L_3_A[8] = {188.0, 142.0, 97.0, 44.0, 35.0, 18.0, 7.0, 3.0};
  const double L_3_B[8] = {0.035, 3.125, 3.0, 6.02, 0.0, 2.78, 5.82, 2.57};
  const double L_3_C[8] = {52175.806, 26087.903, 78263.71, 104351.61, 0.0, 130439.52, 156527.42, 182615.32};

  double L3 = 0.0;
  for(int i = 0; i < 8; ++i){
    L3 += L_3_A[i] * cos(L_3_B[i] + L_3_C[i] * astroTime->julianMilliennia);
  }

  const double L_4_A[6] = {114.0, 3.0, 2.0, 2.0, 1.0, 1.0};
  const double L_4_B[6] = {3.1416, 2.03, 1.42, 4.5, 4.5, 1.27};
  const double L_4_C[6] = {0.0, 26087.9, 78263.71, 52175.81, 104351.61, 130439.52};

  double L4 = 0.0;
  for(int i = 0; i < 6; ++i){
    L4 += L_4_A[i] * cos(L_4_B[i] + L_4_C[i] * astroTime->julianMilliennia);
  }

  const double L_5_A = 1.0;
  const double L_5_B = 3.14;
  const double L_5_C = 0.0;
  double L5 = L_5_A * cos(L_5_B + L_5_C * astroTime->julianMilliennia);

  double julianMillienniaMultiple = 1.0;
  double LValues[6] = {L0, L1, L2, L3, L4, L5};
  eclipticalLongitude = 0.0;
  for(int i = 0; i < 6; ++i){
    eclipticalLongitude += LValues[i] * julianMillienniaMultiple;
    julianMillienniaMultiple *= astroTime->julianMilliennia;
  }
  eclipticalLongitude *= 1.0e-8;
  eclipticalLongitude = fmod(eclipticalLongitude, PI_TIMES_TWO);
  eclipticalLongitude = eclipticalLongitude < 0 ?  PI_TIMES_TWO + eclipticalLongitude : eclipticalLongitude;
}

void Mercury::updateEclipticalLatitude(){
  const double B_0_A[14] = {11737529.0, 2388077.0, 1222840.0, 543252.0, 129779.0,
    31867.0, 7963.0, 2014.0, 514.0, 209.0, 208.0, 132.0, 121.0, 100.0};
  const double B_0_B[14] = {1.98357499, 5.0373896, 3.1415927, 1.796444, 4.832325,
    1.58088, 4.6097, 1.3532, 4.378, 2.02, 4.918, 1.119, 1.813, 5.657};
  const double B_0_C[14] = {26087.90314157, 52175.8062831, 0.0, 78263.709425,
    104351.612566, 130439.51571, 156527.4188, 182615.322, 208703.225, 24978.525,
    27197.282, 234791.128, 53285.185, 20426.571};

  double B0 = 0.0;
  for(int i = 0; i < 14; ++i){
    B0 += B_0_A[i] * cos(B_0_B[i] + B_0_C[i] * astroTime->julianMilliennia);
  }

  const double B_1_A[11] = {429151.0, 146234.0, 22675.0, 10895.0, 6353.0, 2496.0,
    860.0, 278.0, 86.0, 28.0, 26.0};
  const double B_1_B[11] = {3.501698, 3.141593, 0.01515, 0.4854, 3.4294, 0.1605,
    3.185, 6.21, 2.95, 0.29, 5.98};
  const double B_1_C[11] = {26087.903142, 0.0, 52175.806028, 78263.70942, 104351.6126,
    130439.5157, 156527.419, 182615.322, 208703.23, 27197.28, 234791.13};

  double B1 = 0.0;
  for(int i = 0; i < 11; ++i){
    B1 += B_1_A[i] * cos(B_1_B[i] + B_1_C[i] * astroTime->julianMilliennia);
  }

  const double B_2_A[9] = {11831.0, 1914.0, 1045.0, 266.0, 170.0, 96.0, 45.0, 18.0, 7.0};
  const double B_2_B[9] = {4.79066, 0.0, 1.2122, 4.434, 1.623, 4.8, 1.61, 4.67, 1.43};
  const double B_2_C[9] = {26087.90314, 0.0, 52175.8063, 78263.709, 104351.613, 130439.52, 156527.42, 182615.32, 208703.23};

  double B2 = 0.0;
  for(int i = 0; i < 9; ++i){
    B2 += B_2_A[i] * cos(B_2_B[i] + B_2_C[i] * astroTime->julianMilliennia);
  }

  const double B_3_A[7] = {235.0, 161.0, 19.0, 6.0, 5.0, 3.0, 2.0};
  const double B_3_B[7] = {0.354, 0.0, 4.36, 2.51, 6.14, 3.12, 6.27};
  const double B_3_C[7] = {26087.903, 0.0, 52175.81, 78263.71, 104351.61, 130439.52, 156527.42};

  double B3 = 0.0;
  for(int i = 0; i < 7; ++i){
    B3 += B_3_A[i] * cos(B_3_B[i] + B_3_C[i] * astroTime->julianMilliennia);
  }

  const double B_4_A[2] = {4.0, 1.0};
  const double B_4_B[2] = {1.75, 3.14};
  const double B_4_C[2] = {26087.9, 0.0};

  double B4 = 0.0;
  for(int i = 0; i < 2; ++i){
    B4 += B_4_A[i] * cos(B_4_B[i] + B_4_C[i] * astroTime->julianMilliennia);
  }

  double julianMillienniaMultiple = 1.0;
  double BValues[5] = {B0, B1, B2, B3, B4};
  eclipticalLatitude = 0.0;
  for(int i = 0; i < 5; ++i){
    eclipticalLatitude += BValues[i] * julianMillienniaMultiple;
    julianMillienniaMultiple *= astroTime->julianMilliennia;
  }
  eclipticalLatitude *= 1.0e-8;
}

void Mercury::updateRadiusVector(){
  const double R_0_A[13] = {39528272.0, 7834132.0, 795526.0, 121282.0, 21922.0,
    4354.0, 918.0, 290.0, 260.0, 202.0, 201.0, 142.0, 100.0};
  const double R_0_B[13] = {0.0, 6.1923372, 2.959897, 6.010642, 2.7782, 5.8289, 2.597,
    1.424, 3.028, 5.647, 5.592, 6.253, 3.734};
  const double R_0_C[13] = {0.0, 26087.9031416, 52175.806283, 7826.709425, 104351.61257,
    130439.5157, 156527.419, 25028.521, 27197.282, 182615.322, 31749.235, 24978.525, 21535.950};

  double R0 = 0.0;
  for(int i = 0; i < 13; ++i){
    R0 += R_0_A[i] * cos(R_0_B[i] + R_0_C[i] * astroTime->julianMilliennia);
  }

  const double R_1_A[8] = {217348.0, 44142.0, 10094.0, 2433.0, 1624.0, 604.0, 153.0, 39};
  const double R_1_B[8] = {4.656172, 1.42386, 4.47466, 1.2423, 0.0, 4.293, 1.061, 4.11};
  const double R_1_C[8] = {26087.903142, 52175.80628, 78263.70942, 104351.6126, 0.0, 130439.516, 156527.419, 182615.32};

  double R1 = 0.0;
  for(int i = 0; i < 8; ++i){
    R1 += R_1_A[i] * cos(R_1_B[i] + R_1_C[i] * astroTime->julianMilliennia);
  }

  const double R_2_A[7] = {3118.0, 1245.0, 425.0, 136.0, 42.0, 22.0, 13.0};
  const double R_2_B[7] = {3.0823, 6.1518, 2.926, 5.98, 2.75, 3.14, 5.8};
  const double R_2_C[7] = {26087.9031, 52175.8063, 78263.709, 104351.613, 130439.52, 0.0, 156527.42};

  double R2 = 0.0;
  for(int i = 0; i < 7; ++i){
    R2 += R_2_A[i] * cos(R_2_B[i] + R_2_C[i] * astroTime->julianMilliennia);
  }

  const double R_3_A[5] = {33.0, 24.0, 12.0, 5.0, 2.0};
  const double R_3_B[5] = {1.68, 4.63, 1.39, 4.44, 1.21};
  const double R_3_C[5] = {26087.9, 52175.81, 78263.71, 104351.61, 130439.52};

  double R3 = 0.0;
  for(int i = 0; i < 5; ++i){
    R3 += R_3_A[i] * cos(R_3_B[i] + R_3_C[i] * astroTime->julianMilliennia);
  }

  double julianMillienniaMultiple = 1.0;
  double RValues[4] = {R0, R1, R2, R3};
  radiusVector = 0.0;
  for(int i = 0; i < 4; ++i){
    radiusVector += RValues[i] * julianMillienniaMultiple;
    julianMillienniaMultiple *= astroTime->julianMilliennia;
  }
  radiusVector *= 1.0e-8;
}
