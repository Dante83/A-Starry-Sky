#include "Sun.h"
#include "Moon.h"
#include "SkyState.h"
#include "Constants.h" //Local constants
#include "../Constants.h" //Global constants

AtmosphericSkyEngine(double kmAboveSeaLevel, int numberOfRayleighTransmissionSteps, int numberOfMieTransmissionSteps, double stepsPerKilo){
  //Set the Rayleigh Scattering Beta Coefficient
  rayleighDensity = exp(-kmAboveSeaLevel * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
  mieDensity = exp(-kmAboveSeaLevel * ONE_OVER_MIE_SCALE_HEIGHT);
  stepsPerkm = stepsPerKilo;
  //As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
  double moleculesPerMeterCubedAtSeaLevel = pow(2.545, 25);
  ozoneRedBeta = pow(2.0, -25) * moleculesPerMeterCubedAtSeaLevel;
  ozoneGreenBeta = pow(2.0, -25) * moleculesPerMeterCubedAtSeaLevel;
  ozoneBlueBeta = pow(7.0, -27) * moleculesPerMeterCubedAtSeaLevel;
}


void AtmosphericSkyEngine::computeTransmittance(double h_0, double h_f, valarray* transmittance, int numberOfSteps){
  //Initialize our functions at x_0 + x_n
  double integralOfRayleighDensityFunction = 0.0;
  double integralOfMieDensityFunction = 0.0;
  double integralOfOzoneDensityFunction;
  int numberOfStepsMinusOne = numberOfSteps - 1;
  double deltaH = (h_f - h_0) / numberOfSteps;
  double percentOfRayleighScaleHeight = -deltaH * ONE_OVER_RAYLEIGH_SCALE_HEIGHT;
  double percentOfMieScaleHeight = -deltaH * ONE_OVER_MIE_SCALE_HEIGHT;
  double h_i = -h_0; //Initialize to this
  for(int i = 1; i < numberOfStepsMinusOne; ++i){
    h_i -= deltaH;
    integralOfRayleighDensityFunction += exp(h_i * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
    integralOfMieDensityFunction += exp(h_i * ONE_OVER_MIE_SCALE_HEIGHT);
  }
  //Add x_0 and x_n after multiplying by 2
  integralOfRayleighDensityFunction = 0.5 * deltaH * (2.0 * integralOfRayleighDensityFunction + exp(h_0 * ONE_OVER_RAYLEIGH_SCALE_HEIGHT) + exp(h_f * ONE_OVER_RAYLEIGH_SCALE_HEIGHT));
  integralOfOzoneDensityFunction = integralOfRayleighDensityFunction * 0.0000006;
  integralOfMieDensityFunction = 0.5 * deltaH * (2.0 * integralOfRayleighDensityFunction + exp(h_0 * ONE_OVER_MIE_SCALE_HEIGHT) + exp(h_f * ONE_OVER_MIE_SCALE_HEIGHT));
  double mieTransmittanceExponent = -EARTH_MIE_BETA_EXTINCTION * integralOfMieDensityFunction;
  //Using http://skyrenderer.blogspot.com/
  std::valarray mieTransmittanceVector(mieTransmittanceExponent, 3);
  std::valarray ozoneBeta({ozoneRedBeta, ozoneGreenBeta, ozoneBlueBeta});
  std::valarray rayleighBeta({EARTH_RAYLEIGH_RED_BETA, EARTH_RAYLEIGH_GREEN_BETA, EARTH_RAYLEIGH_BLUE_BETA}, 3);
  transmittance = exp(-1.0 * rayleighBeta * integralOfRayleighDensityFunction - mieTransmittanceVector - ozoneBeta * integralOfOzoneDensityFunction);
}

void AtmosphericSkyEngine::constructLUTs(){
  //General constants
  double kmsPerStep = 1.0 / stepsPerkm;
  std::valarray betaRayleighOver4PI({EARTH_RAYLEIGH_RED_BETA_OVER_FOUR_PI, EARTH_RAYLEIGH_GREEN_BETA_OVER_FOUR_PI, EARTH_RAYLEIGH_BLUE_BETA_OVER_FOUR_PI}, 3);

  //Convert our pixel data to local coordinates
  double heightTable[32];
  double cosViewAngleTable[32][128];
  double sinViewAngleTable[32][128];
  double cosLightAngleTable[32];
  double sinLightAngleTable[32];
  for(int x = 0; x < 32; ++x){
    heightTable[x] = updateHeightFromParameter(static_cast<double>(x));
    for(int y = 0; y < 128; ++y){
      cosViewAngle = cosViewAngleFromParameter(static_cast<double>(y));
      cosViewZenithTable[x][y] = cosViewZenith;
      sinViewAngleTable[x][y] = sqrt(1.0 - cosViewAngle * cosViewAngle);
    }
  }
  for(int z = 0; z < 32; ++z){
    cosLightAngleTable[z] = cosLightZenithFromParameter(static_cast<double>(z));
    sinLightAngleTable[z] = sqrt(1.0 - cosLightAngle * cosLightAngle);
  }

  //Precalulate our geometry data
  //Construct our ray paths from P_a to P_b
  //And from every P to P_c
  int numPointsBetweenPbAndPa[32][128];
  std::valarray* Pb2PaVect[32][128];
  int* numPointsFromPToPc[32][64];
  std::valarray** Pc2PVect[32][64];
  for(int x = 0; x < 32; ++x){
    double height = heightTable[x];
    double heightSquared = height * height;
    std::valarray<double> origin({0.0, height}, 2);

    for(int y = 0; y < 64; ++y){
      //Get the view angle
      double cosViewAngle = cosViewZenithTable[x][y];
      double sinViewAngle = sinViewAngleTable[x][y];
      double sinViewAngleSquared = sinViewAngle * sinViewAngle;

      //Simplifying the results from https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
      double t_intersection = height * sinViewAngle + sqrt(ATMOSPHERE_HEIGHT_SQUARED - heightSquared * (1.0 - sinViewAngleSquared));
      std::valarray<double> pb({cosViewZenith * t_intersection, sinViewAngle * t_intersection}, 2);

      //Determine the number of points between P and Pb
      std::valarray<double> vectorFromPbToP = pb - origin;
      double distanceFromPbToP = sqrt(vectorFromPbToOrigin[0] * vectorFromPbToOrigin[0] + vectorFromPbToOrigin[1] * vectorFromPbToOrigin[1]);
      int numPointsFromPbToP = ceil(distanceFromPbToP * kmsPerStep);
      numPointsBetweenPaAndPb[x][y] = numPointsFromPbToP;
      Pb2PVect[x][y] = &vectorFromPbToP;
      std::valarray<double> deltaPbToP = vectorFromPbToP / numPointsFromPbToP;

      //Only calculate our vectors from P to the Light for half of our view angles
      //But if we do, start by iterating over each P along our vector between
      int numPointsFromPbToPInnerArray[numPointsFromPbToP][32];
      double* Pc2PVectInnerArray[numPointsFromPbToP][32];
      for(int i = 0; i < numPointsFromPbToP; ++i){
        std::valarray<double> currentP = deltaPbToP * i;
        double pHeight = currentP[1];
        double pHeightSquared = pHeight * pHeight;
        for(int z = 0; z < 32; ++z){
          double cosLightAngle = cosLightAngleTable[z];
          double sinLightAngle = sinLightAngleTable[z];
          double sinLightAngleSquared = sinLightAngle * sinLightAngle;

          double t_intersection_of_p_to_pc = pHeight * sinViewAngle + sqrt(ATMOSPHERE_HEIGHT_SQUARED - pHeightSquared * (1.0 - sinLightAngleSquared));
          std::valarray<double> pc({cosLightAngle * t_intersection_of_p_to_pc, sinLightAngle * t_intersection_of_p_to_pc}, 2);

          //Determine the number of points between P and Pb
          std::valarray<double> vectorFromPcToP = pc - currentP;
          double distanceFromPcToP = sqrt(vectorFromPcToP[0] * vectorFromPcToP[0] + vectorFromPcToP[1] * vectorFromPcToP[1]);
          int numPointsFromPbToP = ceil(distanceFromPcToP * kmsPerStep);
          numPointsFromPbToPInnerArray[i][z] = numPointsFromPbToP;
          Pc2PVectInnerArray[i][z] = &vectorFromPcToP;
        }
      }
      numPointsFromPToPc[x][y] = &numPointsFromPbToPInnerArray;
      Pc2PVect[x][y] = &Pc2PVectInnerArray;
    }
    //From 64 on up, we don't worry about inscattering geometery
    for(int y = 64; y < 128; ++y){
      //Get the view angle
      double cosViewAngle = cosViewZenithTable[x][y];
      double sinViewAngle = sinViewAngleTable[x][y];
      double sinViewAngleSquared = sinViewAngle * sinViewAngle;

      //Simplifying the results from https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
      double t_intersection = height * sinViewAngle + sqrt(ATMOSPHERE_HEIGHT_SQUARED - heightSquared * (1.0 - sinViewAngleSquared));
      std::valarray<double> pb({cosViewZenith * t_intersection, sinViewAngle * t_intersection}, 2);

      //Determine the number of points between P and Pb
      std::valarray<double> vectorFromPbToP = pb - origin;
      double distanceFromPbToP = sqrt(vectorFromPbToOrigin[0] * vectorFromPbToOrigin[0] + vectorFromPbToOrigin[1] * vectorFromPbToOrigin[1]);
      int numPointsFromPbToP = ceil(distanceFromPbToP * kmsPerStep);
      numPointsBetweenPaAndPb[x][y] = numPointsFromPbToP;
      Pb2PVect[x][y] = &vectorFromPbToP;
    }
  }

  //Connect our geometry data up to transmittance data
  std::valarray* transmittanceFromPbToP[32][128];
  std::valarray transmittanceFromPbToPa[32][128];
  int integerTransmittanceFromPbToPA[32][128][3];
  std::valarray* transmittanceFromPbToP[32][128];
  std::valarray* transmittanceFromPcToP[32][128];
  for(int x = 0; x < 32; ++x){
    height = heightTable[x];

    for(int y = 0; y < 128; ++y){
      //Get the view angle
      Pc2PVectInnerArrays = Pc2PVect[x][y];

      double integralOfRayleighDensityFunction = 0.0;
      double integralOfMieDensityFunction = 0.0;
      double integralOfOzoneDensityFunction = 0.0;
      int numberOfSteps = numPointsBetweenPbAndPa[x][y];
      int numberOfStepsMinusOne = numberOfSteps - 1;
      std::valarray<double> deltaPbToP = vectorFromPbToP / numberOfSteps;
      std::valarray<double> p(2);
      double deltaH = deltaPbToP[1];
      double percentOfRayleighScaleHeight = -deltaH * ONE_OVER_RAYLEIGH_SCALE_HEIGHT;
      double percentOfMieScaleHeight = -deltaH * ONE_OVER_MIE_SCALE_HEIGHT;
      double previousRayleighValue = exp(h_0 * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
      double previousMieValue = exp(h_0 * ONE_OVER_MIE_SCALE_HEIGHT);
      std::valarray transmittanceFromPbToPInnerArray[numberOfStepsMinusOne];
      std::valarray transmittanceFromPcToPInnerArray[numberOfStepsMinusOne];
      std::valarray p({0.0, height}, 2);
      p = p + vectorFromPbToP;//Get p in global coordinates
      std::valarray* transmittanceFromPcToPInnerArray[numberOfStepsMinusOne][32];
      for(int i = 0; i < numberOfStepsMinusOne; ++i){
        p = p - i * deltaPbToP;
        h_0 = p[1];
        h_f = p[1] - deltaPbToP[1];
        double currentRayleighValue = exp(h_f * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
        double currentMieValue = exp(h_f * ONE_OVER_MIE_SCALE_HEIGHT);
        integralOfRayleighDensityFunction += 0.5 * (previousRayleighValue - currentRayleighValue) * deltaH;
        integralOfMieDensityFunction += 0.5 * (previousMieValue - currentMieValue) * deltaH;
        previousRayleighValue = currentRayleighValue;
        previousMieValue = currentMieValue;

        //Store the current sum up in our transmission table
        integralOfRayleighDensityFunction = 0.5 * deltaH * (2.0 * integralOfRayleighDensityFunction + exp(h_0 * ONE_OVER_RAYLEIGH_SCALE_HEIGHT) + exp(h_f * ONE_OVER_RAYLEIGH_SCALE_HEIGHT));
        integralOfOzoneDensityFunction = integralOfRayleighDensityFunction * 0.0000006;
        integralOfMieDensityFunction = 0.5 * deltaH * (2.0 * integralOfRayleighDensityFunction + exp(h_0 * ONE_OVER_MIE_SCALE_HEIGHT) + exp(h_f * ONE_OVER_MIE_SCALE_HEIGHT));
        double mieTransmittanceExponent = -EARTH_MIE_BETA_EXTINCTION * integralOfMieDensityFunction;
        //Using http://skyrenderer.blogspot.com/
        std::valarray mieTransmittanceVector(mieTransmittanceExponent, 3);
        std::valarray ozoneBeta({ozoneRedBeta, ozoneGreenBeta, ozoneBlueBeta});
        std::valarray rayleighBeta({EARTH_RAYLEIGH_RED_BETA, EARTH_RAYLEIGH_GREEN_BETA, EARTH_RAYLEIGH_BLUE_BETA}, 3);
        transmittance = exp(-1.0 * rayleighBeta * integralOfRayleighDensityFunction - mieTransmittanceVector - ozoneBeta * integralOfOzoneDensityFunction);
        transmittanceFromPbToPInnerArray[i] = transmittance;

        //While we're here, let's also grab the P to Pc transmission value
        for(int z = 0; z < 32; z++){
          std::valarray pToPcTransmittance({0.0}, 3);
          computeTransmittance(p[1], Pc2PVectInnerArrays[i][z][1], pToPcTransmittance, numPointsFromPToPc[x][y][i][z]);
          transmittanceFromPcToPInnerArray = &pToPcTransmittance;
        }
      }
      transmittanceFromPbToP[x][y] = &transmittanceFromPbToPInnerArray;
      transmittanceFromPcToP[x][y] = &transmittanceFromPcToPInnerArray;

      //Copy our final value over to our output transmission table
      transmittanceFromPbToPa[x][y] = transmittanceFromPbToPInnerArray[numberOfStepsMinusOne];
      std::copy(begin(transmittanceFromPbToPa[x][y]), end(transmittanceFromPbToPa[x][y]), integerTransmittanceFromPbToPA[x][y]);
    }
  }

  //Perform our single scattering integration
  //Using our geometry data and transmittance data.
  std::valarray intensityMie[32][64][32];
  std::valarray intensityRayleigh[32][64][32];
  for(int x = 0; x < 32; ++x){
    height = heightTable[x];
    //For each view angle theta
    for(int y = 0; y < 64; ++y){
      double mieDensityCoefficient;
      double rayleighDensityCoefficient;
      std::valarray tPc2P;
      std::valarray tPb2P;
      std::valarray pc;
      cosViewZenith = cosViewZenithTable[y];
      //Calculate Pb, the vector between our view camera and our atmosphere
      std::valarray vectorFromPbToPa = Pb2PaVect[x][y];
      std::valarray p({0.0, height}, 2);
      p = p + vectorFromPbToPa;//Get p in global coordinates
      int numSteps = numPointsBetweenPbAndPa[x][y];
      int numStepsMinus1 = numSteps - 1;
      double deltaH = p[1] / numSteps;
      double saved_h_0 = p[1];

      //For each sun angle phi
      for(int z = 0; z < 32; ++z){
        std::arrayval inscatteringMieIntegration(0.0, 3);
        std::arrayval inscatteringRayleighIntegration(0.0, 3);

        double h = saved_h_0;

        //Compute the first element
        mieDensityCoefficient = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
        rayleighDensityCoefficient = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
        tPc2P = transmittanceFromPbToP[x][y][numStepsMinus1][z];
        tPb2P = transmittanceFromPcToP[x][y][numStepsMinus1][z];
        pc = transmittanceFromPcToP[x][y][numStepsMinus1][z];
        std::valarray mieElement0(0.0, 3);
        mieElement0 = mieDensityCoefficient * tPc2P * tPb2P;
        std::valarray rayleighElement0(0.0, 3);
        rayleighElement0 = rayleighDensityCoefficient * tPc2P * tPb2P;

        for(int i = 1; i < numStepsMinus1; ++i){
          //Iterate our height
          h -= deltaH;

          //Grab the transmittance between this P and Pa and this P and Pc
          tPc2P = transmittanceFromPbToP[x][y][i][z];
          tPb2P = transmittanceFromPcToP[x][y][i][z];
          pc = transmittanceFromPcToP[x][y][i][z];

          mieDensityCoefficient = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
          rayleighDensityCoefficient = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
          inscatteringMieIntegration = inscatteringMieIntegration + mieDensityCoefficient * tPc2P * tPb2P;
          inscatteringRayleighIntegration = inscatteringRayleighIntegration + rayleighDensityCoefficient * tPc2P * tPb2P;
        }

        //Compute the last element
        h -= deltaH;
        mieDensityCoefficient = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
        rayleighDensityCoefficient = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);
        tPc2P = transmittanceFromPbToP[x][y][0][z];
        tPb2P = transmittanceFromPcToP[x][y][0][z];
        pc = transmittanceFromPcToP[x][y][0][z];
        std::valarray mieElementf(0.0, 3);
        mieElementf = mieDensityCoefficient * tPc2P * tPb2P;
        std::valarray rayleighElementf(0.0, 3);
        rayleighElementf = rayleighDensityCoefficient * tPc2P * tPb2P;

        //Combine the results
        intensityMie[x][y][z] = 0.5 * deltaH * betaRayleighOver4PI * (mieElement0 + 2.0 * inscatteringMieIntegration + mieElementf);
        intensityRayleigh[x][y][z] =  0.5 * deltaH * (rayleighElementf + 2.0 * inscatteringRayleighIntegration + rayleighElementf);
      }
    }
  }

  //Iterate over our multiple scattering lookups
  for(int k = 1; k < 1; ++k){
    for(int x = 0; x < 32; ++x){
      height = heightTable[x];
      for(int y = 0; y < 64; ++y){
        for(int z = 0; z < 32; ++z){

          //Integrate G

          //Drop the results of G into our next Ith scattering equation and integrate between Pb and Pa
          for(int i = 0; i < ){
            //Iterate our p

            //transmittance from p to pc

            //Get the mie density

            //get the rayleigh  scattering and multiply by our transmittance

            //add to the total inscattering of mie

            //add to the total inscattering of rayleigh
          }

          cosOfSunZenithAngle = cosSunZenithTable[z];
        }
      }
    }
  }

  //Swap the ordering of our results for easier lookups
  //As we don't change our height too often, and the sun position only
  //changes once every few frames, but the view angle changes often.
  //Therefore, we might only wish to set one texture for our height
  //then every few frames, change our sun angle and then finally,
  //we can change our view angle.
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 64; ++y){
      for(int z = 0; z < 32; ++z){
        intScatteringInterpolationTarget[x][z][y] = scatteringInterpolationTarget[x][y][z];
      }
    }
  }
}

//
//NOTE: When using these functions, if you change the height, it is important to call update height first.
//all the other components will depend upon this first request
//
void AtmosphericSkyEngine::updateHeight(double kmAboveSeaLevel){
  parameterizedHeight = sqrt(kmAboveSeaLevel * ONE_OVER_HEIGHT_OF_ATMOSPHERE);
  parameterizedViewZenithConst = -sqrt(kmAboveSeaLevel * (TWO_TIMES_THE_RADIUS_OF_THE_EARTH + kmAboveSeaLevel)) / (RADIUS_OF_EARTH + kmAboveSeaLevel);
  //parameterized viewZenith conversions.
  oneOverOneMinusParameterizedHeight = NUMERATOR_FOR_ONE_PLUS_OR_MINUS_PARAMETERIZED_HEIGHTS / (1.0 - parameterizedHeight);
  oneOverOnePlusParamaeterizedHeight = NUMERATOR_FOR_ONE_PLUS_OR_MINUS_PARAMETERIZED_HEIGHTS / (1.0 + parameterizedHeight);
  distancePreCalculation = ATMOSPHERE_HEIGHT_SQUARED / (kmAboveSeaLevel * kmAboveSeaLevel);
}

double AtmosphericSkyEngine::parameterizeViewZenith(double cosViewZenith){
  if(cosViewZenith > parameterizedViewZenithConst){
    return pow((cosViewZenith - parameterizedHeight) * oneOverOneMinusParameterizedHeight, 0.2);
  }
  return pow((cosViewZenith - parameterizedHeight) * oneOverOnePlusParamaeterizedHeight, 0.2);
}

double AtmosphericSkyEngine::parameterizeSunZenith(double cosSunZenith){
  return atan2(max(cosSunZenith, -0.1975) * TAN_OF_ONE_POINT_THREE_EIGHT_SIX) * ZERO_POINT_FIVE_OVER_ONE_POINT_ONE + 0.37;
}

double AtmosphericSkyEngine::updateHeightFromParameter(double parameterKMAboveSeaLevel){
  kmAboveSeaLevel = parameterKMAboveSeaLevel * HEIGHT_OF_RAYLEIGH_ATMOSPHERE;
  parameterizedViewZenithConst = - sqrt(kmAboveSeaLevel * (TWO_TIMES_THE_RADIUS_OF_THE_EARTH + kmAboveSeaLevel)) / (RADIUS_OF_EARTH + kmAboveSeaLevel);
  oneMinusParameterizedViewAngle = 1.0 - parameterizedViewZenithConst;
  onePlusParameterizedViewAngle = 1.0 + parameterizedViewZenithConst;

  return kmAboveSeaLevel;
}

double AtmosphericSkyEngine::cosViewAngleFromParameter(double parameterizedViewZenith){
  if(parameterizedViewZenith > 0.5){
    return PARAMETER_TO_COS_OF_SUN_VIEW_CONST + pow((parameterizedViewZenith - 0.5), 5) * oneMinusParameterizedViewAngle;
  }
  return PARAMETER_TO_COS_OF_SUN_VIEW_CONST - pow(parameterizedViewZenith, 5) * onePlusParameterizedViewAngle;
}

double AtmosphericSkyEngine::cosSunZenithFromParameter(double parameterizedSunZenith){
  return tan(1.5 * parameterizedSunZenith - 0.555) * PARAMETER_TO_COS_ZENITH_OF_SUN_CONST;
}
