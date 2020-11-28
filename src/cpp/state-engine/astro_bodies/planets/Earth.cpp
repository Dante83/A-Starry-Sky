#include "../../world_state/AstroTime.h"
#include "../../Constants.h"
#include "../Planet.h"
#include "Earth.h"
#include <cmath>

//
//Constructor
//
Earth::Earth(AstroTime* astroTimeRef) : Planet(astroTimeRef){
  //
  //Default constructor
  //
};

void Earth::updatePosition(double trueObliquityOfEclipticInRads){
  updateEclipticalLongitude();
  updateEclipticalLatitude();
  updateRadiusVector();

  //Calculate earths distance from the sun
  heliocentric_x = radiusVector * cos(eclipticalLatitude) * cos(eclipticalLongitude);
  heliocentric_y = radiusVector * cos(eclipticalLatitude) * sin(eclipticalLongitude);
  heliocentric_z = radiusVector * sin(eclipticalLatitude);
  distanceFromSun = sqrt(heliocentric_x * heliocentric_x + heliocentric_y * heliocentric_y + heliocentric_z * heliocentric_z) * AVERAGE_SOLAR_DISTANCE;
  sun->setScaleAndIrradiance(distanceFromSun);
}

void Earth::updateEclipticalLongitude(){
  const double L_0_A[64] = {175347046.0, 3341656.0, 34894.0, 3497.0, 3418.0, 3136.0,
    2676.0, 2343.0, 1324.0, 1273.0, 1199.0, 990.0, 902.0, 857.0, 780.0, 753.0,
    505.0, 492.0, 357.0, 317.0, 284.0, 271.0, 243.0, 206.0, 205.0, 202.0, 156.0,
    132.0, 126.0, 115.0, 103.0, 102.0, 99.0, 98.0, 86.0, 85.0, 85.0, 80.0, 79.0,
    75.0, 74.0, 74.0, 70.0, 62.0, 61.0, 57.0, 56.0, 56.0, 52.0, 52.0, 51.0, 49.0,
    41.0, 41.0, 39.0, 37.0, 37.0, 36.0, 36.0, 33.0, 30.0, 30.0, 25.0};
  const double L_0_B[64] = {4.6692568, 4.6261, 2.7441, 2.8289, 3.6277, 4.4181,
    6.1352, 0.7425, 2.0371, 1.1096, 5.233, 2.045, 3.508, 1.179, 2.533, 4.583,
    4.205, 2.92, 5.849, 1.899, 0.315, 0.345, 4.806, 1.869, 2.458, 0.833, 3.411,
    1.083, 0.645, 0.636, 0.976, 4.267, 6.21, 0.68, 5.98, 1.3, 3.67, 1.81, 3.04,
    1.76, 3.5, 4.68, 0.83, 3.98, 1.82, 2.78, 4.39, 3.47, 0.19, 1.33, 0.28, 0.49,
    5.37, 2.4, 6.17, 6.04, 2.57, 1.71, 1.78, 0.59, 0.44, 2.74, 3.16};
  const double L_0_C[64] = {6283.07585, 12566.1517, 5753.3849, 3.5231, 77713.7715,
    7860.4194, 3930.2097, 11506.7698, 529.691, 1577.3435, 5884.927, 26.298, 398.149,
    5223.694, 5507.553, 18849.228, 775.523, 0.067, 11790.629, 796.298, 10977.079,
    5486.778, 2544.314, 5573.143, 6069.777, 213.299, 2942.463, 20.775, 0.98,
    4694.003, 15720.839, 7.114, 2146.17, 155.42, 161000.69, 6275.96, 71430.70,
    17260.15, 12036.46, 5088.63, 3154.69, 801.82, 9437.76, 8827.39, 7084.90,
    6286.60, 14143.50, 6279.55, 12139.55, 1748.02, 5856.48, 1194.45, 8429.24,
    19651.05, 10447.39, 10213.29, 1059.38, 2352.87, 6812.77, 17789.85, 83996.85,
    1349.87, 4690.48};

  double L0 = 0.0;
  for(int i = 0; i < 64; ++i){
    L0 += L_0_A[i] * cos(L_0_B[i] + L_0_C[i] * astroTime->julianMilliennia);
  }

  const double L_1_A[34] = {628331966747.0, 206059.0, 4303.0, 425.0, 119.0, 109.0,
    93.0, 72.0, 68.0, 67.0, 59.0, 56.0, 45.0, 36.0, 29.0, 21.0, 19.0, 19.0, 17.0,
    16.0, 16.0, 15.0, 12.0, 12.0, 12.0, 12.0, 11.0, 10.0, 10.0, 9.0, 9.0, 8.0, 6.0, 6.0};
  const double L_1_B[34] = {0.0, 2.678235, 2.6351, 1.59, 5.796, 2.966, 2.59, 1.14,
    1.87, 4.41, 2.89, 2.17, 0.4, 0.47, 2.65, 5.34, 1.85, 4.97, 2.99, 0.03, 1.43,
    1.21, 2.83, 3.26, 5.27, 2.08, 0.77, 1.3, 4.24, 2.7, 5.64, 5.3, 2.65, 4.67};
  const double L_1_C[34] = {0.0, 6283.07585, 12566.1517, 3.523, 26.298, 1577.377,
    18849.23, 529.69, 398.15, 5507.55, 5223.69, 155.42, 796.30, 775.52, 7.11, 0.98,
    5486.78, 213.30, 6275.96, 2544.31, 2146.17, 10977.08, 1748.02, 5088.63, 1194.45,
    4694.0, 553.57, 6286.6, 1349.87, 242.73, 951.72, 2352.87, 9437.76, 4690.48};

  double L1 = 0.0;
  for(int i = 0; i < 34; ++i){
    L1 += L_1_A[i] * cos(L_1_B[i] + L_1_C[i] * astroTime->julianMilliennia);
  }

  const double L_2_A[20] = {52919.0, 8720.0, 309.0, 27.0, 16.0, 16.0, 10.0, 9.0,
    7.0, 5.0, 4.0, 4.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 2.0, 2.0};
  const double L_2_B[20] = {0.0, 1.0721, 0.867, 0.05, 5.19, 3.68, 0.76, 2.06, 0.83,
    4.66, 1.03, 3.44, 5.14, 6.05, 1.19, 6.12, 0.31, 2.28, 4.38, 3.75};
  const double L_2_C[20] = {0.0, 6283.0758, 12566.152, 3.52, 26.30, 155.42,
    18849.23, 77713.77, 775.52, 1577.34, 7.11, 5573.14, 796.30, 5507.55, 242.73,
    529.69, 398.15, 553.57, 5223.69, 0.98};

  double L2 = 0.0;
  for(int i = 0; i < 20; ++i){
    L2 += L_2_A[i] * cos(L_2_B[i] + L_2_C[i] * astroTime->julianMilliennia);
  }

  const double L_3_A[7] = {289.0, 35.0, 17.0, 3.0, 1.0, 1.0, 1.0};
  const double L_3_B[7] = {5.844, 0.0, 5.49, 5.2, 4.72, 5.3, 5.97};
  const double L_3_C[7] = {6283.076, 0.0, 12566.15, 155.42, 3.52, 18849.23, 242.73};

  double L3 = 0.0;
  for(int i = 0; i < 7; ++i){
    L3 += L_3_A[i] * cos(L_3_B[i] + L_3_C[i] * astroTime->julianMilliennia);
  }

  const double L_4_A[3] = {114.0, 8.0, 1.0};
  const double L_4_B[3] = {3.142, 4.13, 3.84};
  const double L_4_C[3] = {0.0, 6283.08, 12566.15};

  double L4 = 0.0;
  for(int i = 0; i < 3; ++i){
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
  eclipticalLongitude *=  1.0e-8;
}

void Earth::updateEclipticalLatitude(){
  const double B_0_A[5] = {280.0, 102.0, 80.0, 44.0, 32.0};
  const double B_0_B[5] = {3.199, 5.422, 3.88, 3.7, 4.0};
  const double B_0_C[5] = {84334.662, 5507.553, 5223.69, 2352.87, 1577.34};

  double B0 = 0.0;
  for(int i = 0; i < 5; ++i){
    B0 += B_0_A[i] * cos(B_0_B[i] + B_0_C[i] * astroTime->julianMilliennia);
  }

  const double B_1_A[2] = {9.0, 6.0};
  const double B_1_B[2] = {3.9, 1.73};
  const double B_1_C[2] = {5507.55, 5223.69};

  double B1 = 0.0;
  for(int i = 0; i < 2; ++i){
    B1 += B_1_A[i] * cos(B_1_B[i] + B_1_C[i] * astroTime->julianMilliennia);
  }

  double julianMillienniaMultiple = 1.0;
  double BValues[2] = {B0, B1};
  eclipticalLatitude = 0.0;
  for(int i = 0; i < 2; ++i){
    eclipticalLatitude += BValues[i] * julianMillienniaMultiple;
    julianMillienniaMultiple *= astroTime->julianMilliennia;
  }
  eclipticalLatitude *=  1.0e-8;
}

void Earth::updateRadiusVector(){
  const double R_0_A[40] = {100013989.0, 1670700.0, 13956.0, 3084.0, 1628.0, 1576.0,
    925.0, 542.0, 472.0, 346.0, 329.0, 307.0, 243.0, 212.0, 186.0, 175.0, 110.0,
    98.0, 86.0, 86.0, 65.0, 63.0, 57.0, 56.0, 49.0, 47.0, 45.0, 43.0, 39.0, 38.0,
    37.0, 37.0, 36.0, 35.0, 33.0, 32.0, 32.0, 28.0, 28.0, 26.0};
  const double R_0_B[40] = {0.0, 3.0984635, 3.05525, 5.1985, 1.1739, 2.8469, 5.453,
    4.564, 3.661, 0.964, 5.9, 0.299, 4.273, 5.847, 5.022, 3.012, 5.055, 0.89,
    5.69, 1.27, 0.27, 0.92, 2.01, 5.24, 3.25, 2.58, 5.54, 6.01, 5.36, 2.39, 0.83,
    4.9, 1.67, 1.84, 0.24, 0.18, 1.78, 1.21, 1.9, 4.59};
  const double R_0_C[40] = {0.0, 6283.07585, 12566.1517, 77713.7715, 5753.3849,
    7860.4194, 11506.77, 3930.21, 5884.927, 5507.553, 5223.694, 5573.143,
    11790.629, 1577.344, 10977.079, 18849.228, 5486.778, 6069.78, 15720.84,
    161000.69, 17260.15, 529.69, 83996.85, 71430.70, 2544.31, 775.52, 9437.76,
    6275.96, 4694.0, 8827.39, 19651.05, 12139.55, 12036.46, 2942.46, 7084.9,
    5088.63, 389.15, 6286.6, 6279.55, 10447.39};

  double R0 = 0.0;
  for(int i = 0; i < 40; ++i){
    R0 += R_0_A[i] * cos(R_0_B[i] + R_0_C[i] * astroTime->julianMilliennia);
  }

  const double R_1_A[10] = {103019.0, 1721.0, 702.0, 32.0, 31.0, 25.0, 18.0, 10.0, 9.0, 9.0};
  const double R_1_B[10] = {1.10749, 1.0644, 3.142, 1.02, 2.84, 1.32, 1.42, 5.91, 1.42, 0.27};
  const double R_1_C[10] = {6283.07585, 12566.1517, 0.0, 18849.23, 5507.55, 5223.69,
    1577.34, 10977.08, 6275.96, 5486.78};

  double R1 = 0.0;
  for(int i = 0; i < 10; ++i){
    R1 += R_1_A[i] * cos(R_1_B[i] + R_1_C[i] * astroTime->julianMilliennia);
  }

  const double R_2_A[6] = {4359.0, 124.0, 12.0, 9.0, 6.0, 3.0};
  const double R_2_B[6] = {5.7846, 5.579, 3.14, 3.63, 1.87, 5.47};
  const double R_2_C[6] = {6283.0758, 12566.152, 0.0, 77713.77, 5573.14, 18849.23};

  double R2 = 0.0;
  for(int i = 0; i < 6; ++i){
    R2 += R_2_A[i] * cos(R_2_B[i] + R_2_C[i] * astroTime->julianMilliennia);
  }

  const double R_3_A[2] = {145.0, 7.0};
  const double R_3_B[2] = {4.273, 3.92};
  const double R_3_C[2] = {6283.076, 12566.15};

  double R3 = 0.0;
  for(int i = 0; i < 2; ++i){
    R3 += R_3_A[i] * cos(R_3_B[i] + R_3_C[i] * astroTime->julianMilliennia);
  }

  const double R_4_A = 4.0;
  const double R_4_B = 2.56;
  const double R_4_C = 6283.08;
  double R4 = R_4_A * cos(R_4_B + R_4_C * astroTime->julianMilliennia);

  double julianMillienniaMultiple = 1.0;
  double RValues[5] = {R0, R1, R2, R3, R4};
  radiusVector = 0.0;
  for(int i = 0; i < 5; ++i){
    radiusVector += RValues[i] * julianMillienniaMultiple;
    julianMillienniaMultiple *= astroTime->julianMilliennia;
  }
  radiusVector *= 1.0e-8;
}
