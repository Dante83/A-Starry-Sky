#include "../world_state/AstroTime.h"
#include "../Constants.h"
#include "Planet.h"
#include "Earth.h"
#include <cmath>

//
//Constructor
//
Earth::Earth(AstroTime* astroTimeRef, Sun* sunRef) : Planet(astroTimeRef, sunRef){
  //
  //Default constructor
  //
};

void Earth::void updatePosition(){
  updateEclipticalLongitude();
  updateEclipticalLatitude();
  updateRadiusVector();

  //Calculate earths distance from the sun
  heliocentric_x = radiusVector * cos(eclipticalLatitude) * cos(eclipticalLongitude);
  heliocentric_y = radiusVector * cos(eclipticalLatitude) * sin(eclipticalLongitude);
  heliocentric_z = radiusVector * sin(eclipticalLatitude);
  distanceFromSun = sqrt(heliocentric_x * heliocentric_x + heliocentric_y * heliocentric_y + heliocentric_z * heliocentric_z);
}

//From ftp://ftp.imcce.fr/pub/ephem/planets/vsop87
void Earth::updateEclipticalLongitude(){
  const double L_0_A[64] = {175347046.0, 3341656.0, 34894.0, 3497.0, 3418.0, 3136.0
  2676.0, 2343.0, 1324.0, 1273.0, 1199.0, 990.0, 902.0, 857.0, 780.0, 753.0, 505.0
  492.0, 357.0, 317.0, 284.0, 271.0, 243.0, 206.0, 205.0, 202.0, 156.0, 132.0, 126.0,
  115.0, 103.0, 102.0, 102.0, 99.0, 98.0, 86.0, 85.0, 85.0, 80.0, 79.0, 75.0, 74.0, 74.0
  70.0, 62.0, 61.0, 57.0, 56.0, 56.0, 52.0, 52.0, 51.0, 49.0, 41.0, 41.0, 39.0, 37.0
  37.0, 36.0, 36.0, 33.0, 30.0, 30.0, 25.0};
  const double L_0_B[64] = {0.0, 4.6692568, 4.6261, 2.7441, 2.8289, 3.6277, 4.4181, 6.1352,
  0.7425, 2.0371, 1.1096, 5.233, 2.045, 3.508, 1.179, 2.533, 4.583, 4.205, 2.920, 5.849,
  1.899, 0.315, 0.345, 4.806, 1.869, 2.458, 0.833, 3.411, 1.083, 0.645, 0.636, 0.976,
  4.267, 6.21, 0.68, 5.98, 1.30, 3.67, 1.81, 3.04, 1.76, 3.50, 4.68, 0.83, 3.98, 1.82,
  2.78, 4.39, 3.47, 0.19, 1.33, 0.28, 0.49, 5.37, 2.40, 6.17, 6.04, 2.57, 1.71, 1.78, 0.59,
  0.44, 2.74, 3.16};
  const double L_0_C[64] = {6283.07585, 12566.1517, 5753.3849, 3.5231, 77713.7715,
  7860.4194, 3930.2097, 11506.7698, 529.691, 1577.3435, 5884.927, 26.298, 398.149,
  5223.694, 5507.553, 18849.228, 775.523, 0.067, 11790.629, 796.298, 10977.079,
  5486.778, 2544.314, 5573.143, 6069.777, 213.299, 2942.463, 20.775, 0.980, 4694.003,
  15720.839, 7.114, 2146.17, 155.42, 161000.69, 6275.96, 71430.70, 17260.15,
  12036.46, 5088.63, 3154.69, 801.82, 9437.76, 8827.39, 7084.90, 6286.60, 14143.50,
  6279.55, 12139.55, 1748.02, 5856.48, 1194.45, 8429.24, 19651.05, 10447.39, 10213.29,
  1059.38, 2352.87, 6812.77, 17789.85, 83996.85, 1349.87, 4690.48};
  const tenToTheMinus8 = pow(10.0, -8);
  //JDE isn't all that different then JD for the sake of measuring planetary position
  //so we will just re-use our julian century which uses JD.
  double L0 = 0.0;
  for(int i = 0; i < 64; ++i){
    L0 += tenToTheMinus8 * L_0_A[i] * cos(L_0_B[i] + L_0_C[i] * astroTimeRef->julianCentury);
  }

  const double L_1_A[34] = {628331966747.0, 206059.0, 4303.0, 425.0, 119.0, 109.0,
  93.0, 72.0, 68.0, 67.0, 59.0, 56.0, 45.0, 36.0, 29.0, 21.0, 19.0, 19.0, 17.0,
  16.0, 16.0, 15.0, 12.0, 12.0, 12.0, 12.0, 11.0, 10.0, 10.0, 9.0, 9.0, 8.0, 6.0, 6.0};
  const double L_1_B[34] = {0.0, 2.678235, 2.6351, 1.590, 5.796, 2.966, 2.59, 1.14,
  1.87, 4.41, 2.89, 2.17, 0.40, 0.47, 2.65, 5.34, 1.85, 4.97, 2.99, 0.03, 1.43, 1.21,
  2.83, 3.26, 5.27, 2.08, 0.77, 1.30, 4.24, 2.70, 5.64, 5.30, 2.65, 4.67};
  const double L_1_C[34] = {0.0, 6283.075850, 12566.1517, 3.523, 26.298, 1577.344,
  18849.23, 529.69, 398.15, 5507.55, 5223.69, 155.42, 796.30, 775.52, 7.11, 0.98,
  5486.78, 213.30, 6275.96, 2544.31, 2146.17, 10977.08, 1748.02, 5088.63, 1194.45,
  4694.00, 553.57, 6286.60, 1349.87, 242.73, 951.72, 2353.87, 9437.76, 4690.48};
  double L1 = 0.0;
  for(int i = 0; i < 34; ++i){
    L1 += tenToTheMinus8 * L_1_A[i] * cos(L_1_B[i] + L_1_C[i] * astroTimeRef->julianCentury);
  }

  const double L_2_A[20] = {52919.0, 8720.0, 309.0, 27.0, 16.0, 16.0, 10.0, 9.0,
  7.0, 5.0, 4.0, 4.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 2.0, 2.0};
  const double L_2_B[20] = {0.0, 1.0721, 0.867, 0.05, 5.19, 3.68, 0.76, 2.06, 0.83,
  4.66, 1.03, 3.44, 5.14, 6.05, 1.19, 6.12, 0.31, 2.28, 4.38, 3.75};
  const double L_2_C[20] = {0.0, 6283.0758, 12566.152, 3.52, 26.3, 155.42, 18849.23,
  77713.77, 775.52, 1577.34, 7.11, 5573.14, 796.30, 5507.55, 242.73, 529.69, 398.15,
  553.57, 5223.69, 0.98};
  double L2 = 0.0;
  for(int i = 0; i < 20; ++i){
    L2 += tenToTheMinus8 * L_2_A[i] * cos(L_2_B[i] + L_2_C[i] * astroTimeRef->julianCentury);
  }

  const double L_3_A[7] = {289.0, 35.0, 17.0, 3.0, 1.0, 1.0, 1.0};
  const double L_3_B[7] = {5.844, 0.0, 5.49, 5.20, 4.72, 5.30, 5.97};
  const double L_3_C[7] = {6283.076, 0.0, 12566.15, 155.42, 3.52, 18849.23, 242.73};
  double L3 = 0.0;
  for(int i = 0; i < 7; ++i){
    L3 += tenToTheMinus8 * L_3_A[i] * cos(L_3_B[i] + L_3_C[i] * astroTimeRef->julianCentury);
  }

  const double L_4_A[3] = {114.0, 8.0, 1.0};
  const double L_4_B[3] = {3.142, 4.13, 3.84};
  const double L_4_C[3] = {0.0, 6283.08, 12566.15};
  double L4 = 0.0;
  for(int i = 0; i < 3; ++i){
    L4 += tenToTheMinus8 * L_4_A[i] * cos(L_4_B[i] + L_4_C[i] * astroTimeRef->julianCentury);
  }

  const double L_5_A = 1.0;
  const double L_5_B = 3.14;
  const double L_5_C = 0.0;
  double L5 = tenToTheMinus8 * L_5_A[i] * cos(L_5_B[i] + L_5_C[i] * astroTimeRef->julianCentury);

  double julianCenturyMultiple = 1.0;
  double LValues[5] = {L0, L1, L2, L3, L4, L5};
  elipticalLongitude = 0.0;
  for(int i = 0; i < 5; ++i){
    elipticalLongitude += LValues[i] * julianCenturyMultiple;
    julianCenturyMultiple *= astroTime->julianCentury;
  }
  elipticalLongitude = elipticalLongitude / tenToTheMinus8;
}

void Earth::updateEclipticalLatitude(){
  const double B_0_A[5] = {280.0, 102.0, 80.0, 44.0, 32.0};
  const double B_0_B[5] = {3.199, 5.422, 3.88, 3.70, 4.00};
  const double B_0_C[5] = {84334.662, 5507.553, 5223.69, 2352.87, 1577.34};
  const tenToTheMinus8 = pow(10.0, -8);
  //JDE isn't all that different then JD for the sake of measuring planetary position
  //so we will just re-use our julian century which uses JD.
  double B0 = 0.0;
  for(int i = 0; i < 5; ++i){
    B0 += tenToTheMinus8 * B_0_A[i] * cos(B_0_B[i] + B_0_C[i] * astroTimeRef->julianCentury);
  }

  const double B_1_A[2] = {9.0, 6.0};
  const double B_1_B[2] = {3.90, 1.73};
  const double B_1_C[2] = {5507.55, 5223.69};
  double B1 = 0.0;
  for(int i = 0; i < 2; ++i){
    B1 += tenToTheMinus8 * B_1_A[i] * cos(B_1_B[i] + B_1_C[i] * astroTimeRef->julianCentury);
  }

  elipticalLatitude = (B0 + B1 * astroTime->julianCentury) / tenToTheMinus8;
}

void Earth::updateRadiusVector(){
  const double R_0_A[40] = {};
  const double R_0_B[40] = {};
  const double R_0_C[40] = {};

  const double R_1_A[10] = {};
  const double R_1_B[10] = {};
  const double R_1_C[10] = {};

  const double R_2_A[6] = {};
  const double R_2_B[6] = {};
  const double R_2_C[6] = {};

  const double R_3_A[2] = {};
  const double R_3_B[2] = {};
  const double R_3_C[2] = {};

  const double R_4_A = 4.0;
  const double R_4_B = 2.56;
  const double R_4_C = 6283.08;
}
