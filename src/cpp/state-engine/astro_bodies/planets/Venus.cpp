#include "../../world_state/AstroTime.h"
#include "../../Constants.h"
#include "../OtherPlanet.h"
#include "Earth.h"
#include "Venus.h"
#include <cmath>

//
//Constructor
//
Venus::Venus(AstroTime* astroTimeRef) : OtherPlanet(astroTimeRef){
  //
  //Default constructor
  //
};

//From page 286 of Meeus
void Venus::updateMagnitudeOfPlanet(){
  double distanceFromEarthInAU = distanceFromEarth / AVERAGE_SOLAR_DISTANCE;
  double distanceFromSunInAU = distanceFromSun / AVERAGE_SOLAR_DISTANCE;
  double phaseAngle = getPhaseAngleInDegrees();
  double phaseAngleComponent = 0.0009 * phaseAngle + 0.000239 * phaseAngle * phaseAngle - 0.00000065 * phaseAngle * phaseAngle * phaseAngle;
  irradianceFromEarth = -4.40 + 5.0 * log10(distanceFromEarthInAU * distanceFromSunInAU) + phaseAngleComponent;
}

void Venus::updateEclipticalLongitude(){
  const double L_0_A[24] = {317614667.0, 1353968.0, 89892.0, 5477.0, 3456.0, 2372.0,
    1664.0, 1438.0, 1317.0, 1201.0, 769.0, 761.0, 708.0, 585.0, 500.0, 429.0, 327.0,
    326.0, 232.0, 180.0, 155.0, 128.0, 128.0, 106.0};
  const double L_0_B[24] = {0.0, 5.5931332, 5.3065, 4.4163, 2.6996, 2.9938, 4.2502,
    4.1575, 5.1867, 6.1536, 0.816, 1.950, 1.065, 3.998, 4.123, 3.586, 5.677, 4.591,
    3.163, 4.653, 5.570, 4.226, 0.962, 1.537};
  const double L_0_C[24] = {0.0, 10213.2855462, 20426.57109, 7860.4194, 11790.6291,
    3930.2097, 1577.3435, 9683.5946, 26.2983, 30639.8566, 9437.763, 529.691,
    775.523, 191.448, 15720.839, 19367.189, 5507.553, 10404.734, 9153.904,
    1109.379, 19651.048, 20.775, 5661.332, 801.821};

  double L0 = 0.0;
  for(int i = 0; i < 24; ++i){
    L0 += L_0_A[i] * cos(L_0_B[i] + L_0_C[i] * astroTime->julianMilliennia);
  }

  const double L_1_A[12] = {1021352943053.0, 95708.0, 14445.0, 213.0, 174.0, 152.0,
    82.0, 70.0, 52.0, 38.0, 30.0, 25.0};
  const double L_1_B[12] = {0.0, 2.46424, 0.51625, 1.795, 2.655, 6.106, 5.7,
    2.68, 3.6, 1.03, 1.25, 6.11};
  const double L_1_C[12] = {0.0, 10213.28555, 20426.57109, 30639.857, 26.298, 1577.344,
    191.45, 9437.76, 775.52, 529.69, 5507.55, 10404.73};

  double L1 = 0.0;
  for(int i = 0; i < 12; ++i){
    L1 += L_1_A[i] * cos(L_1_B[i] + L_1_C[i] * astroTime->julianMilliennia);
  }

  const double L_2_A[8] = {54127.0, 3891.0, 1338.0, 24.0, 19.0, 10.0, 7.0, 6.0};
  const double L_2_B[8] = {0.0, 0.3451, 2.0201, 2.05, 3.54, 3.97, 1.52, 1.0};
  const double L_2_C[8] = {0.0, 10213.2855, 20426.5711, 26.3, 30639.86, 775.52, 1577.34, 191.45};

  double L2 = 0.0;
  for(int i = 0; i < 8; ++i){
    L2 += L_2_A[i] * cos(L_2_B[i] + L_2_C[i] * astroTime->julianMilliennia);
  }

  const double L_3_A[3] = {136.0, 78.0, 26.0};
  const double L_3_B[3] = {4.804, 3.67, 0.0};
  const double L_3_C[3] = {10213.286, 20426.57, 0.0};

  double L3 = 0.0;
  for(int i = 0; i < 3; ++i){
    L3 += L_3_A[i] * cos(L_3_B[i] + L_3_C[i] * astroTime->julianMilliennia);
  }

  const double L_4_A[3] = {114.0, 3.0, 2.0};
  const double L_4_B[3] = {3.1416, 5.21, 2.51};
  const double L_4_C[3] = {0.0, 20426.57, 10213.29};

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
  eclipticalLongitude *= 1.0e-8;
  eclipticalLongitude = fmod(eclipticalLongitude, PI_TIMES_TWO);
  eclipticalLongitude = eclipticalLongitude < 0 ?  PI_TIMES_TWO + eclipticalLongitude : eclipticalLongitude;
}

void Venus::updateEclipticalLatitude(){
  const double B_0_A[9] = {5923638.0, 40108.0, 32815.0, 1011.0, 149.0, 138.0, 130.0, 120.0, 108.0};
  const double B_0_B[9] = {0.2670278, 1.14737, 3.14159, 1.0895, 6.254, 0.86, 3.672, 3.705, 4.539};
  const double B_0_C[9] = {10213.2855462, 20426.57109, 0.0, 30639.8566, 18073.705, 1577.344, 9437.763, 2352.866, 22003.915};

  double B0 = 0.0;
  for(int i = 0; i < 9; ++i){
    B0 += B_0_A[i] * cos(B_0_B[i] + B_0_C[i] * astroTime->julianMilliennia);
  }

  const double B_1_A[4] = {513348.0, 4380.0, 199.0, 197.0};
  const double B_1_B[4] = {1.803643, 3.3862, 0.0, 2.53};
  const double B_1_C[4] = {10213.285546, 20426.5711, 0.0, 30639.857};

  double B1 = 0.0;
  for(int i = 0; i < 4; ++i){
    B1 += B_1_A[i] * cos(B_1_B[i] + B_1_C[i] * astroTime->julianMilliennia);
  }

  const double B_2_A[4] = {22378.0, 282.0, 173.0, 27.0};
  const double B_2_B[4] = {3.38509, 0.0, 5.256, 3.87};
  const double B_2_C[4] = {10213.28555, 0.0, 20426.571, 30639.86};

  double B2 = 0.0;
  for(int i = 0; i < 4; ++i){
    B2 += B_2_A[i] * cos(B_2_B[i] + B_2_C[i] * astroTime->julianMilliennia);
  }

  const double B_3_A[4] = {647.0, 20.0, 6.0, 3.0};
  const double B_3_B[4] = {4.992, 3.14, 0.77, 5.44};
  const double B_3_C[4] = {10213.286, 0.0, 20426.57, 30639.86};

  double B3 = 0.0;
  for(int i = 0; i < 4; ++i){
    B3 += B_3_A[i] * cos(B_3_B[i] + B_3_C[i] * astroTime->julianMilliennia);
  }

  const double B_4_A = 14.0;
  const double B_4_B = 0.32;
  const double B_4_C = 10213.29;
  double B4 = B_4_A * cos(B_4_B + B_4_C * astroTime->julianMilliennia);

  double julianMillienniaMultiple = 1.0;
  double BValues[5] = {B0, B1, B2, B3, B4};
  eclipticalLatitude = 0.0;
  for(int i = 0; i < 5; ++i){
    eclipticalLatitude += BValues[i] * julianMillienniaMultiple;
    julianMillienniaMultiple *= astroTime->julianMilliennia;
  }
  eclipticalLatitude *= 1.0e-8;
}

void Venus::updateRadiusVector(){
  const double R_0_A[12] = {72334821.0, 489824.0, 1658.0, 1632.0, 1378.0, 498.0,
    374.0, 264.0, 237.0, 222.0, 126.0, 119};
  const double R_0_B[12] = {0.0, 4.021518, 4.9021, 2.8455, 1.1285, 2.587, 1.423,
    5.529, 2.551, 2.013, 2.728, 3.02};
  const double R_0_C[12] = {0.0, 10213.285546, 20426.5711, 7860.4194, 11790.6291,
    9683.595, 3930.21, 9437.763, 15720.839, 19367.189, 1577.344, 10404.734};

  double R0 = 0.0;
  for(int i = 0; i < 12; ++i){
    R0 += R_0_A[i] * cos(R_0_B[i] + R_0_C[i] * astroTime->julianMilliennia);
  }

  const double R_1_A[3] = {34551.0, 234.0, 234.0};
  const double R_1_B[3] = {0.89199, 1.772, 3.142};
  const double R_1_C[3] = {10213.28555, 20426.571, 0.0};

  double R1 = 0.0;
  for(int i = 0; i < 3; ++i){
    R1 += R_1_A[i] * cos(R_1_B[i] + R_1_C[i] * astroTime->julianMilliennia);
  }

  const double R_2_A[3] = {1407.0, 16.0, 13.0};
  const double R_2_B[3] = {5.0637, 5.47, 0.0};
  const double R_2_C[3] = {10213.28555, 20426.571, 0.0};

  double R2 = 0.0;
  for(int i = 0; i < 3; ++i){
    R2 += R_2_A[i] * cos(R_2_B[i] + R_2_C[i] * astroTime->julianMilliennia);
  }

  const double R_3_A = 50.0;
  const double R_3_B = 3.22;
  const double R_3_C = 10213.29;
  double R3 = R_3_A * cos(R_3_B + R_3_C * astroTime->julianMilliennia);

  const double R_4_A = 1.0;
  const double R_4_B = 0.92;
  const double R_4_C = 10213.29;
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
