#include "Sun.h"
#include "Moon.h"
#include "SkyState.h"
#include "Constants.h" //Local constants
#include "../Constants.h" //Global constants

AtmosphericSkyEngine(double kmAboveSeaLevel, int numberOfRayleighTransmissionSteps, int numberOfMieTransmissionSteps, double stepsPerKilo, int numRotationalSteps, double mieDirectioanlG){
  //Set the Rayleigh Scattering Beta Coefficient
  rayleighDensity = exp(-kmAboveSeaLevel * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
  mieDensity = exp(-kmAboveSeaLevel * ONE_OVER_MIE_SCALE_HEIGHT);
  stepsPerkm = stepsPerKilo;
  mieG = mieDirectioanlG;
  numRotSteps = numRotationalSteps;
  //As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
  double moleculesPerMeterCubedAtSeaLevel = pow(2.545, 25);
  double ozoneRedBeta = pow(2.0, -25) * moleculesPerMeterCubedAtSeaLevel;
  double ozoneGreenBeta = pow(2.0, -25) * moleculesPerMeterCubedAtSeaLevel;
  double ozoneBlueBeta = pow(7.0, -27) * moleculesPerMeterCubedAtSeaLevel;
  std::valarray<double> ozoneBeta({ozoneRedBeta, ozoneGreenBeta, ozoneBlueBeta}, 3);
}

void AtmosphericSkyEngine::constructLUTs(){
  //General constants
  std::valarray rayleighBeta({EARTH_RAYLEIGH_RED_BETA, EARTH_RAYLEIGH_GREEN_BETA, EARTH_RAYLEIGH_BLUE_BETA}, 3);
  std::valarray betaRayleighOver4PI({EARTH_RAYLEIGH_RED_BETA_OVER_FOUR_PI, EARTH_RAYLEIGH_GREEN_BETA_OVER_FOUR_PI, EARTH_RAYLEIGH_BLUE_BETA_OVER_FOUR_PI}, 3);

  //Convert our pixel data to local coordinates
  double heightTable[32];
  double cosViewAngleTable[32][128];
  double sinViewAngleTable[32][128];
  double cosLightAngleTable[32];
  double sinLightAngleTable[32];
  double thetaOfLightAngleTable[32];
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
    thetaOfLightAngleTable[z] = atan2(sinLightAngleTable[z], cosLightAngleTable[z]);
  }

  //Precalulate our geometry data
  //Construct our ray paths from P_a to P_b
  //And from every P to P_c
  int numPointsBetweenPaAndPb[32][128];
  std::valarray<double> pa2PbVects[32][128];
  for(int x = 0; x < 32; ++x){
    double height = heightTable[x];
    double radiusOfCamera = height + RADIUS_OF_EARTH;
    double radiusOfCameraSquared = radiusOfCamera * radiusOfCamera;
    std::valarray<double> cameraPosition({0.0, radiusOfCamera}, 2);

    for(int y = 0; y < 128; ++y){
      //Get the view angle
      double cosViewAngle = cosViewZenithTable[x][y];
      double sinViewAngle = sinViewAngleTable[x][y];

      //Simplifying the results from https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
      double t_intersection = radiusOfCamera * sinViewAngle + sqrt(ATMOSPHERE_HEIGHT_SQUARED - radiusOfCameraSquared * (1.0 - sinViewAngle * sinViewAngle));
      std::valarray<double> pb({cosViewZenith * t_intersection, sinViewAngle * t_intersection}, 2);

      //Determine the number of points between P and Pb
      std::valarray<double> vectorFromPaToPb = pb - cameraPosition;
      int numPointsFromPaToPb = ceil(sqrt(vectorFromPaToPb[0] * vectorFromPaToPb[0] + vectorFromPaToPb[1] * vectorFromPaToPb[1]) * stepsPerkm) + 1;
      numPointsBetweenPaAndPb[x][y] = numPointsFromPaToPb;
      pa2PbVects[x][y] = vectorFromPaToPb;
    }
  }

  //Connect our geometry data up to transmittance data
  std::vector<std::valarray<double>> pVectors[32][128];
  std::vector<std::valarray<double>> transmittanceFromPaToPTimesMieDensity[32][128];
  std::vector<std::valarray<double>> transmittanceFromPaToPTimesRayleighDensity[32][128];
  std::valarray<double> transmittanceFromP1ToP2[32][128];
  int integerTransmittanceFromPaToPb[32][128][3];
  for(int x = 0; x < 32; ++x){
    height = heightTable[x];

    std::valarray<double> p_start({0.0, height + RADIUS_OF_EARTH}, 2);
    double h_start = p_start[1] - RADIUS_OF_EARTH;
    for(int y = 0; y < 128; ++y){
      //Get the vector in the direction from Pa to Pb
      std::valarray<double> Pa2PbVect = pa2PbVects[x][y];

      double integralOfRayleighDensityFunction = 0.0;
      double integralOfMieDensityFunction = 0.0;
      double integralOfOzoneDensityFunction = 0.0;
      int numberOfSteps = numPointsBetweenPaAndPb[x][y];
      int numberOfStepsMinusOne = numberOfSteps - 1;
      std::valarray<double> deltaP = Pa2PbVect / static_cast<double>(numberOfSteps);
      //h_0 is just the starting height for for our view camera
      double previousRayleighValue = exp(-height * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
      double previousMieValue = exp(-height * ONE_OVER_MIE_SCALE_HEIGHT);
      std::vector<std::valarray<double>> transmittanceFromPbToPTimesMieDensityInnerArray;
      std::vector<std::valarray<double>> transmittanceFromPbToPTimesRayleighDensityInnerArray;
      std::valarray<double> p(p_start); //Starting location of our camera
      double h_0 = h_start;
      std::valarray<double> transmittance(3);
      for(int i = 0; i < numberOfStepsMinusOne; ++i){
        p = p + deltaP;
        double height = p[1];
        h_f = sqrt(p[0] * p[0] + height * height) - RADIUS_OF_EARTH;
        double currentRayleighValue = exp(-h_f * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
        double currentMieValue = exp(-h_f * ONE_OVER_MIE_SCALE_HEIGHT);
        double zeroPointFiveOverDeltaH = 0.5 / (h_f - h_0);
        integralOfRayleighDensityFunction += (previousRayleighValue - currentRayleighValue) * zeroPointFiveOverDeltaH;
        integralOfMieDensityFunction += (previousMieValue - currentMieValue) * zeroPointFiveOverDeltaH;
        previousRayleighValue = currentRayleighValue;
        previousMieValue = currentMieValue;

        //Store the current sum up in our transmission table
        integralOfOzoneDensityFunction = integralOfRayleighDensityFunction * 0.0000006;
        double mieTransmittanceExponent = -EARTH_MIE_BETA_EXTINCTION * integralOfMieDensityFunction;
        //Using http://skyrenderer.blogspot.com/
        std::valarray<double> mieTransmittanceVector(mieTransmittanceExponent, 3);
        transmittance = exp(-1.0 * rayleighBeta * integralOfRayleighDensityFunction - mieTransmittanceVector - ozoneBeta * integralOfOzoneDensityFunction);

        std::valarray<double> transmittanceTimesMieDensity(transmittance);
        transmittanceTimesMieDensity = transmittanceTimesMieDensity * exp(-height * ONE_OVER_MIE_SCALE_HEIGHT);
        std::valarray<double> transmittanceTimesRayleighDensity(transmittance);
        transmittanceTimesRayleighDensity = transmittanceTimesRayleighDensity * exp(-height * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);

        pVectors[x][y].push_back(p);
        transmittanceFromPbToPTimesMieDensityInnerArray.push_back(transmittanceTimesMieDensity);
        transmittanceFromPbToPTimesRayleighDensityInnerArray.push_back(transmittanceTimesRayleighDensity)
        h_0 = h_f;
      }
      transmittanceFromPaToP[x][y] = transmittanceFromPbToPInnerArray;

      //Copy our final value over to our output transmission table
      std::copy(begin(transmittance), end(transmittance), integerTransmittanceFromPbToPA[x][y]);
    }
  }

  //Perform our single scattering integration
  //Using our geometry data and transmittance data.
  double inscatteringMie[32][64][32];
  std::valarray<double> inscatteringRayleigh[32][64][32];
  for(int x = 0; x < 32; ++x){
    double height = heightTable[x];
    double radiusOfCamera = height + RADIUS_OF_EARTH;
    std::valarray<double> initialPosition({0.0, radiusOfCamera}, 2);
    //For each view angle theta
    for(int y = 0; y < 64; ++y){
      double cosViewAngle = cosViewZenithTable[x][y];
      double sinViewZenith = sinViewZenithTable[x][y];
      std::valarray<double> deltaP({cosViewAngle, sinViewAngle}, 2);

      //Get P
      std::valarray<double> p({0.0, radiusOfCamera}, 2);
      int numPoints = numPointsBetweenPaAndPb[x][y];
      double zeroPointFiveTimesdeltaX = 0.5 * pa2PbVects[x][y][0] / static_cast<double>(numPoints);

      //For each sun angle phi
      for(int z = 0; z < 32; ++z){
        double cosLightAngle = cosLightAngleTable[z];
        double sinLightAngle = sinLightAngleTable[z];
        double intialLightAngle = thetaOfLightAngleTable[z];

        //Calculate the initial iteration
        std::valarray<double> transmittanceFromPaToP(transmittanceFromP1ToP2[x][y][0]);

        //We don't need to reset the transmittance location for this one as we are starting at the camera
        //so we just need the angle between our altitude and the sun.
        int y2 = parameterizeViewZenith(cosLightAngleTable[z]);
        std::valarray<double> transmittanceFromPToPc(transmittanceFromP1ToP2[x][y2][numStepsMinus1]);

        //Calculate the first integrand element
        double mieIntegrandFirstAndLastElements = transmittanceFromPaToPTimesMieDensity[x][y][0] * transmittanceFromPToPc;
        double rayleighIntegrandFirstAndLastElements = transmittanceFromPaToPTimesRayleighDensity[x][y][0] * transmittanceFromPToPc;

        double mieIntegrandInnerSum = 0.0;
        double rayleighIntegrandInnerSum = 0.0;
        //Walk along the path from Pa to Pb
        for(int i = 1; i < numStepsMinus1; ++i){
          //Get our transmittance
          std::valarray<double> transmittanceFromPaToP(transmittanceFromP1ToP2[x][y][i]);

          //Get our location, p
          std::valarray<double> p(pVectors[x][y][i]);

          //Instead of calculating our transmittance again, we shall presume that p, is just a new camera
          //with a new height and a new angle (the vector to the sun)
          double magnitudeOfPToOrigin = sqrt(p[0] * p[0] + p[1] * p[1]);
          double altitudeOfPAtP = magnitudeOfPToOrigin - RADIUS_OF_EARTH;
          double negativeAngleBetweenPAndPa = acos(p[1] / magnitudeOfPToOrigin);

          //Rotate the angle to the sun by the above
          double pLightAngle = intialLightAngle - negativeAngleBetweenPAndPa;

          //Convert our light angle back into a valid pixel location
          int x2 = updateHeight(altitudeOfPAtP);
          int y2 = parameterizeViewZenith(cos(pLightAngle));

          //Now convert this over to a transmittance lookup
          std::valarray<double> transmittanceFromPToPc(transmittanceFromP1ToP2[x2][y2][numStepsMinus1]);

          mieIntegrandInnerSum += transmittanceFromPaToPTimesMieDensity[x][y][i] * transmittanceFromPToPc;
          rayleighIntegrandInnerSum += transmittanceFromPaToPTimesRayleighDensity[x][y][i] * transmittanceFromPToPc;

          p = p + deltaP;
        }
        //Calculate the final iteration.
        std::valarray<double> transmittanceFromPaToP(transmittanceFromP1ToP2[x][y][numStepsMinus1]);
        double magnitudeOfPToOrigin = sqrt(p[0] * p[0] + p[1] * p[1]);
        double altitudeOfPAtP = magnitudeOfPToOrigin - RADIUS_OF_EARTH;
        double negativeAngleBetweenPAndPa = acos(p[1] / magnitudeOfPToOrigin);

        //Rotate the angle to the sun by the above
        double pLightAngle = intialLightAngle - negativeAngleBetweenPAndPa;

        //Convert our light angle back into a valid pixel location
        int x2 = updateHeight(altitudeOfPAtP);
        int y2 = parameterizeViewZenith(cos(pLightAngle));

        //Now convert this over to a transmittance lookup
        std::valarray<double> transmittanceFromPToPc(transmittanceFromP1ToP2[x2][y2][numStepsMinus1]);

        //Calculate the final integrand element
        mieIntegrandFirstAndLastElements += transmittanceFromPaToPTimesMieDensity[x][y][numStepsMinus1] * transmittanceFromPToPc;
        rayleighIntegrandFirstAndLastElements += transmittanceFromPaToPTimesRayleighDensity[x][y][numStepsMinus1] * transmittanceFromPToPc;

        totalInscatteringMie = zeroPointFiveTimesdeltaX * (mieIntegrandFirstAndLastElements + 2.0 * mieIntegrandInnerSum);
        totalInscatteringRayleigh = zeroPointFiveTimesdeltaX * (rayleighIntegrandFirstAndLastElements + 2.0 * rayleighIntegrandInnerSum);
      }
    }
  }

  //Iterate over our multiple scattering lookups
  std::valarray<double> gatheringOrderMie[32][64];
  std::valarray<double> gatheringOrderRayleigh[32][64];
  std::valarray<double> gatheringSumMie[32][64];
  std::valarray<double> gatheringSumRayleigh[32][64];
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 64; ++y){
      //Initialize our gathering sum
      std::valarray<double> gatheringSumMie[x][y](0.0, 3);
      std::valarray<double> gatheringSumRayleigh[x][y](0.0, 3);
    }
  }

  int numRotStepsTimes2 = numRotSteps * 2;
  double deltaThetaOrPhi = PI / numRotSteps;
  for(int k = 1; k < NUMBER_OF_SCATTERING_ORDERS; ++k){
    for(int x = 0; x < 32; ++x){
      double height = heightTable[x];
      for(int y = 0; y < 64; ++y){
        double cosViewAngle = cosViewZenithTable[x][y];
        double sinViewZenith = sinViewZenithTable[x][y];
        double viewAngle = atan2(sinViewAngle, cosViewAngle);
        //Precompute our gathering from scattered light
        //from the previous order.
        //Note that the integral for G is often just left as an integral over 4 pi
        //in much of the literature, leaving us to scratch our heads as to how to
        //procede with the result. Thankfully, we learn this is a short-hand for
        //a solid angle integration as described in
        //https://www.gamedevs.org/uploads/deferred-rendering-of-planetary-terrains-with-accurate-atmospheres.pdf
        std::valarray<double> gatheringOrderMie[x][y](0.0, 3);
        std::valarray<double> gatheringOrderRayleigh[x][y](0.0, 3);
        double theta = 0.0;
        for(int i_phi = 0; i_phi < numRotStepsTimes2; ++i_phi){
          double phi = 0.0;
          for(int i_theta = 0; i_theta < numRotSteps; ++i_theta){
            double phaseFunctionMie;
            double phaseFunctionRayleigh;
            std::double<double> omega({cos(phi) * sin(theta), sin(phi) * sin(theta), cos(theta)});

            //Implement the double integrand of our results.

            theta += deltaThetaOrPhi;
          }
          phi += deltaThetaOrPhi;
        }

        //Add to our gathering sum
        gatheringSumMie[x][y] = gatheringSumMie[x][y] + gatheringOrderMie[x][y];
        gatheringSumRayleigh[x][y] = gatheringSumRayleigh[x][y] + gatheringOrderRayleigh[x][y];
      }
    }

    //Use our precomputed gathering data to calculate the next order of scattering
    for(int x = 0; x < 32; ++x){
      for(int y = 0; y < 64; ++y){
        //Grab our precalculated gathering function
        std::valarray<double> gathering = gatheringSum[x][y];
        for(int z = 0; z < 32; ++z){
          //Calculate the first integrand element
          double mieIntegrandFirstAndLastElements = transmittanceFromPaToPTimesMieDensity[x][y][0] * ;
          double rayleighIntegrandFirstAndLastElements = transmittanceFromPaToPTimesRayleighDensity[x][y][0];

          double mieIntegrandInnerSum = 0.0;
          double rayleighIntegrandInnerSum = 0.0;
          //Walk along the path from Pa to Pb
          for(int i = 1; i < numStepsMinus1; ++i){
            //Get our location, p
            std::valarray<double> p(pVectors[x][y][i]);

            //Instead of calculating our transmittance again, we shall presume that p, is just a new camera
            //with a new height and a new angle (the vector to the sun)
            double magnitudeOfPToOrigin = sqrt(p[0] * p[0] + p[1] * p[1]);
            double altitudeOfPAtP = magnitudeOfPToOrigin - RADIUS_OF_EARTH;
            double negativeAngleBetweenPAndPa = acos(p[1] / magnitudeOfPToOrigin);

            //Rotate the angle to the sun by the above
            double pLightAngle = intialLightAngle - negativeAngleBetweenPAndPa;

            //Convert our light angle back into a valid pixel location
            int x2 = updateHeight(altitudeOfPAtP);

            mieIntegrandInnerSum += transmittanceFromPaToPTimesMieDensity[x2][y2][i] * gathering[x2][y2];
            rayleighIntegrandInnerSum += transmittanceFromPaToPTimesRayleighDensity[x2][y2][i] * gathering[x2][y2];

            p = p + deltaP;
          }
          //Calculate the final iteration.
          double magnitudeOfPToOrigin = sqrt(p[0] * p[0] + p[1] * p[1]);
          double altitudeOfPAtP = magnitudeOfPToOrigin - RADIUS_OF_EARTH;
          double negativeAngleBetweenPAndPa = acos(p[1] / magnitudeOfPToOrigin);

          //Rotate the angle to the sun by the above
          double pLightAngle = intialLightAngle - negativeAngleBetweenPAndPa;

          //Convert our light angle back into a valid pixel location
          int x2 = updateHeight(altitudeOfPAtP);

          //Now convert this over to a transmittance lookup
          std::valarray<double> transmittanceFromPToPc(transmittanceFromP1ToP2[x2][y2][numStepsMinus1]);

          //Calculate the final integrand element
          mieIntegrandFirstAndLastElements += transmittanceFromPaToPTimesMieDensity[x][y][numStepsMinus1];
          rayleighIntegrandFirstAndLastElements += transmittanceFromPaToPTimesRayleighDensity[x][y][numStepsMinus1];

          totalInscatteringMie += zeroPointFiveTimesdeltaX * (mieIntegrandFirstAndLastElements + 2.0 * mieIntegrandInnerSum);
          totalInscatteringRayleigh += zeroPointFiveTimesdeltaX * (rayleighIntegrandFirstAndLastElements + 2.0 * rayleighIntegrandInnerSum);
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
int AtmosphericSkyEngine::updateHeight(double kmAboveSeaLevel){
  parameterizedHeight = sqrt(kmAboveSeaLevel * ONE_OVER_HEIGHT_OF_ATMOSPHERE);
  parameterizedViewZenithConst = -sqrt(kmAboveSeaLevel * (TWO_TIMES_THE_RADIUS_OF_THE_EARTH + kmAboveSeaLevel)) / (RADIUS_OF_EARTH + kmAboveSeaLevel);
  //parameterized viewZenith conversions.
  oneOverOneMinusParameterizedHeight = NUMERATOR_FOR_ONE_PLUS_OR_MINUS_PARAMETERIZED_HEIGHTS / (1.0 - parameterizedHeight);
  oneOverOnePlusParamaeterizedHeight = NUMERATOR_FOR_ONE_PLUS_OR_MINUS_PARAMETERIZED_HEIGHTS / (1.0 + parameterizedHeight);
  distancePreCalculation = ATMOSPHERE_HEIGHT_SQUARED / (kmAboveSeaLevel * kmAboveSeaLevel);

  return static_cast<int>(parameterizedHeight);
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
