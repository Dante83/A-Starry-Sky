#include "Sun.h"
#include "Moon.h"
#include "SkyState.h"
#include "Constants.h" //Local constants
#include "../Constants.h" //Global constants

SkyLUTGenerator(double mieDirectioanlG, double stepsPerKilo, int numRotationalSteps){
  stepsPerkm = stepsPerKilo;
  mieG = mieDirectioanlG;
  numRotSteps = numRotationalSteps;
}

void SkyLUTGenerator::constructLUTs(){
  //Initialize our final targets
  uint8_t transmittanceStridedLUT[12288]; //32 x 128 x 3
  uint8_t scatteringStridedLUT[393216]; //32 x 128 x 32 x 3
  transmittanceStridedLUTPtr = &transmittanceStridedLUT;
  scatteringStridedLUTPrt = &scatteringStridedLUT;

  //General constants
  double mieGSquared = mieG * mieG;
  std::valarray<double> rayleighBeta({EARTH_RAYLEIGH_RED_BETA, EARTH_RAYLEIGH_GREEN_BETA, EARTH_RAYLEIGH_BLUE_BETA}, 3);
  std::valarray<double> betaRayleighOver4PI({EARTH_RAYLEIGH_RED_BETA_OVER_FOUR_PI, EARTH_RAYLEIGH_GREEN_BETA_OVER_FOUR_PI, EARTH_RAYLEIGH_BLUE_BETA_OVER_FOUR_PI}, 3);

  //As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
  double moleculesPerMeterCubedAtSeaLevel = pow(2.545, 25);
  std::valarray<double> ozoneBeta({pow(2.0, -25), pow(2.0, -25), pow(7.0, -27)}, 3);
  ozoneBeta = ozoneBeta * moleculesPerMeterCubedAtSeaLevel;

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
  std::vector<std::valarray<double>> transmittanceFromPaToP[32][128];
  std::valarray<double> doubleTransmittanceFromPaToPb[32][128];
  for(int x = 0; x < 32; ++x){
    double startingHeight = heightTable[x];
    double firstRayleighValue = exp(-startingHeight * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);;
    double firstMieValue = exp(-startingHeight * ONE_OVER_MIE_SCALE_HEIGHT);

    std::valarray<double> p_start({0.0, startingHeight + RADIUS_OF_EARTH}, 2);
    for(int y = 0; y < 128; ++y){
      //Get the vector in the direction from Pa to Pb
      std::valarray<double> Pa2PbVect = pa2PbVects[x][y];

      double integralOfRayleighDensityFunction = 0.0;
      double integralOfMieDensityFunction = 0.0;
      double integralOfOzoneDensityFunction;
      int numberOfSteps = numPointsBetweenPaAndPb[x][y];
      std::valarray<double> deltaP = Pa2PbVect / static_cast<double>(numberOfSteps - 1);
      //h_0 is just the starting height for for our view camera
      double previousRayleighValue = firstRayleighValue;
      double previousMieValue = firstMieValue;
      std::vector<std::valarray<double>> transmittanceFromPbToPTimesMieDensityInnerArray;
      std::vector<std::valarray<double>> transmittanceFromPbToPTimesRayleighDensityInnerArray;
      std::valarray<double> p(p_start); //Starting location of our camera
      double h_0 = startingHeight;

      //We have an N-1 problem below. Each trapezoidal integration removes one data
      //point from our result and is only valid for values after one delta P.
      //therefore, we must pad the beginning of our result with a first value of zero.
      //as the area under a zero width element. This results in a transmittance of 1.0
      std::valarray<double> transmittance({1.0, 1.0, 1.0}, 3);

      //For our future caching of transmittance times mie or rayleigh density
      std::valarray<double> transmittanceTimesMieDensity = transmittance * exp(-h_f * ONE_OVER_MIE_SCALE_HEIGHT);
      std::valarray<double> transmittanceTimesRayleighDensity = transmittance * exp(-h_f * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);

      //Store our results for future use
      transmittanceFromPaToP[x][y].push_back(transmittance);
      transmittanceFromPaToPTimesMieDensity.push_back(transmittanceTimesMieDensity);
      transmittanceFromPaToPTimesRayleighDensity.push_back(transmittanceTimesRayleighDensity);
      pVectors[x][y].push_back(p);

      //Now that our loop is primed, commence the primary loop from Pa to Pb
      //Note that we got to number of steps plus 1 to take care of the N-1 outcome
      //of trapezoidal integration.
      for(int i = 1; i < numberOfSteps; ++i){
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

        //Store the current sum up in our transmission table up to this point P for future use
        double integralOfOzoneDensityFunction = integralOfRayleighDensityFunction * OZONE_PERCENT_OF_RAYLEIGH;
        double mieTransmittanceExponent = -EARTH_MIE_BETA_EXTINCTION * integralOfMieDensityFunction;
        //Using http://skyrenderer.blogspot.com/
        std::valarray<double> mieTransmittanceVector(mieTransmittanceExponent, 3);
        transmittance = exp(-1.0 * rayleighBeta * integralOfRayleighDensityFunction - mieTransmittanceVector - ozoneBeta * integralOfOzoneDensityFunction);

        //For our future caching of transmittance times mie or rayleigh density
        std::valarray<double> transmittanceTimesMieDensity = transmittance * exp(-h_f * ONE_OVER_MIE_SCALE_HEIGHT);
        std::valarray<double> transmittanceTimesRayleighDensity = transmittance * exp(-h_f * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);

        //Store our results for future use
        transmittanceFromPaToP[x][y].push_back(transmittance);
        transmittanceFromPaToPTimesMieDensity.push_back(transmittanceTimesMieDensity);
        transmittanceFromPaToPTimesRayleighDensity.push_back(transmittanceTimesRayleighDensity);

        pVectors[x][y].push_back(p);
        h_0 = h_f;
      }

      //Copy our final value over to our output transmission table
      std::copy(begin(end(transmittanceFromPaToP[x][y])), end(end(transmittanceFromPaToP[x][y])), doubleTransmittanceFromPaToPb[x][y]);
    }
  }

  //Intialize our variable for our scattering calculations
  std::valarray<double> sumInscatteringIntensityMie[32][128][32];
  std::valarray<double> sumInscatteringIntensityRayleigh[32][128][32];
  std::valarray<double> inscatteringIntensityMieKMinusOne[32][128][32];
  std::valarray<double> inscatteringIntensityRayleighKMinusOne[32][128][32];

  //Perform our single scattering integration
  std::valarray<double> inscatteringIntensityMie0[32][128][32];
  std::valarray<double> inscatteringIntensityRayleigh0[32][128][32];
  for(int x = 0; x < 32; ++x){
    double height = heightTable[x];
    double radiusOfCamera = height + RADIUS_OF_EARTH;
    std::valarray<double> initialPosition({0.0, radiusOfCamera}, 2);
    //For each view angle theta
    for(int y = 0; y < 128; ++y){
      double cosViewAngle = cosViewZenithTable[x][y];
      double sinViewZenith = sinViewZenithTable[x][y];
      std::valarray<double> deltaP({cosViewAngle, sinViewAngle}, 2);

      //Get P
      std::valarray<double> p({0.0, radiusOfCamera}, 2);
      int numberOfSteps = numPointsBetweenPaAndPb[x][y];
      double zeroPointFiveTimesdeltaH = (0.5 * pa2PbVects[x][y][1]) / static_cast<double>(numberOfSteps - 1);

      //For each sun angle phi
      for(int z = 0; z < 32; ++z){
        double cosLightAngle = cosLightAngleTable[z];
        double sinLightAngle = sinLightAngleTable[z];
        double intialLightAngle = thetaOfLightAngleTable[z];

        //We don't need to reset the transmittance location for this one as we are starting at the camera
        //so we just need the angle between our altitude and the sun.
        int yLightView = parameterizeViewZenith(cosLightAngleTable[z]);
        //NOTE: We should really interpolate this for better results.
        std::valarray<double> transmittanceFromPToPc = doubleTransmittanceFromPaToPb[x][yLightView];

        //Calculate the first integrand element
        double nextMieElement;
        double nextRayleighElement;
        double previousMieElement = transmittanceFromPaToPTimesMieDensity[x][y][0] * transmittanceFromPToPc;
        double previousRayleighElement = transmittanceFromPaToPTimesRayleighDensity[x][y][0] * transmittanceFromPToPc;
        double previousAltitude = height;
        double integrandOfMieElements = 0.0;
        double integrandOfRayleighElements = 0.0;
        //Walk along the path from Pa to Pb
        for(int i = 1; i < numPoints; ++i){
          //Get our location, p
          std::valarray<double> p = pVectors[x][y][i];

          //Instead of calculating our transmittance again, we shall presume that p, is just a new camera
          //with a new height and a new angle (the vector to the sun).
          double magnitudeOfPToOrigin = sqrt(p[0] * p[0] + p[1] * p[1]);
          double altitudeOfPAtP = magnitudeOfPToOrigin - RADIUS_OF_EARTH;
          double deltaAltitude =  altitudeOfPAtP - previousAltitude;
          double negativeAngleBetweenPAndPa = acos(p[1] / magnitudeOfPToOrigin);

          //Rotate the angle to the sun by the above
          double pLightAngle = intialLightAngle - negativeAngleBetweenPAndPa;

          //Convert our light angle back into a valid pixel location
          double cosLightAngle = cos(pLightAngle);
          double sinLightAngle = sin(pLightAngle);

          //Now convert this over to a transmittance lookup
          //Use the method recommended by page 54 of Stefan Sperlhofer
          //https://www.gamedevs.org/uploads/deferred-rendering-of-planetary-terrains-with-accurate-atmospheres.pdf
          //if sinLightAngle < 0
          numPointsMinus1 = numPointsBetweenPaAndPb[xLightView][yLightView] - 1;
          std::valarray<double> transmittanceFromPToPc;
          if(sinLightAngle < 0.0){
            int xLightView = updateHeight(altitudeOfPAtP);
            int yLightView = parameterizeViewZenith(cos(pLightAngle));
            transmittanceFromPToPc = doubleTransmittanceFromPaToPb[xLightView][yLightView][numPointsMinus1];
          }
          else{
            //Start by grabbign the transmittance in the opposite direction, from P
            //to the opposition of the light source.
            //Add Pi to our light angle, this just multiplies our light angle by -1.0
            cosLightAngle *= -1.0;
            int xLightView = updateHeight(altitudeOfPAtP);
            int yLightView = parameterizeViewZenith(cosLightAngle);
            double transmittanceFromPToPexit = doubleTransmittanceFromPaToPb[xLightView][yLightView][numPointsMinus1];

            //Set our camera to the point where the sun is looking into the atmosphere
            //towards point P.
            xLightView = updateHeight(ATMOSPHERE_HEIGHT);
            yLightView = parameterizeViewZenith(cos(pLightAngle));

            //Get the transmittance over the length from this new height to the
            //exit point.
            double transmittanceFromPexitToPc = doubleTransmittanceFromPaToPb[x2][y2][numPointsMinus1];

            //Divide it by the transmittance from the point P to the exit point on the horizon.
            transmittanceFromPToPc = transmittanceFromPexitToPc / transmittanceFromPToPexit;
          }

          nextMieElement = transmittanceFromPaToPTimesMieDensity[x][y][i] * transmittanceFromPToPc;
          nextRayleighElement = transmittanceFromPaToPTimesRayleighDensity[x][y][i] * transmittanceFromPToPc;
          integrandOfMieElements += 0.5 * deltaAltitude * (nextMieElement + previousMieElement);
          integrandOfRayleighElements += 0.5 * deltaAltitude * (nextRayleighElement + previousRayleighElement);
          previousMieElement = nextMieElement;
          previousRayleighElement = nextRayleighElement;

          previousAltitude = altitudeOfPAtP;
        }
        std::valarray<double> inscatteringMie = EARTH_MIE_BETA_OVER_FOUR_PI * integrandOfMieElements;
        std::valarray<double> inscatteringRayleigh = betaRayleighOver4PI * integrandOfRayleighElements;
        totalInscatteringMie[x][y][z] = inscatteringMie;
        totalInscatteringRayleigh[x][y][z] = inscatteringRayleigh;

        inscatteringIntensityMieKMinusOne[x][y][z] = inscatteringMie;
        inscatteringIntensityRayleighKMinusOne[x][y][z] = inscatteringRayleigh;
        sumInscatteringIntensityMie[x][y][z] = sumInscatteringIntensityMie[x][y][z] + inscatteringMie;
        sumInscatteringIntensityRayleigh[x][y][z] = sumInscatteringIntensityRayleigh[x][y][z] + inscatteringRayleigh;
      }
    }
  }

  //Iterate over our multiple scattering lookups
  std::valarray<double> gatheringSum[32][32];
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 64; ++y){
      //Initialize our gathering sum
      std::valarray<double> gatheringSumMie[x][y](0.0, 3);
      std::valarray<double> gatheringSumRayleigh[x][y](0.0, 3);
    }
  }

  double deltaTheta = PI_TIMES_TWO / numRotSteps;
  double miePhaseAtZero = getMiePhaseAtThetaEqualsZero();
  for(int k = 1; k < NUMBER_OF_SCATTERING_ORDERS; ++k){
    //Precompute our gathering and gathering sum LUTs
    //Note: the code in Bodare seperates out gathered light by mie light and
    //rayleigh light, but I cannot see why our inscattered light, scattered back to the origin
    //would be able to differentiate between light that came from a mie scattering and
    //light that came from rayleigh scattering. Thus, I am just going to sum the two.
    std::valarray<double> gatheredScattering[32][32];
    for(int x = 0; x < 32; ++x){
      double height = heightTable[x];
      for(int z = 0; z < 32; ++z){
        double thetaLightAngle = thetaOfLightAngleTable[z];
        double cosLightAngle = cosLightAngleTable[z];

        //
        //Note: I'm a bit worried that our view angle integration here isn't considering
        //light angles that fall below the horizon.
        //

        //Integrate between 0 and 2pi along theta
        //even though this is a spherical integral, we only
        //integrate along one axis and ignore the other one which saves a
        //lot of time.
        //Because we're rotating the full 2 pi, it doesn't matter where our starting angle 'is'
        //relative to the view angle as every angle will ultimately be integrated. If we were to
        //exclude certain angles (perhaps because scattering was blocked) this would not be the case.
        double theta = 0.0;
        double y = parameterizeViewZenith(1.0); //cos of 0 is 1
        double miePhase = miePhaseAtZero; //This should just be a constant when we start this up
        double intensityMie = inscatteringIntensityMieKMinusOne[x][y][z];
        std::valarray<double> intensityRayleigh = inscatteringIntensityRayleighKMinusOne[x][y][z];
        std::valarray<double> zerothGatheredMieScattering = miePhase * intensityMie;
        std::valarray<double> zerothGatheredRayleighScattering = RAYLEIGH_PHASE_AT_ZERO_DEGREES * intensityRayleigh;
        std::valarray<double> gatheredMieScattering(3);
        std::valarray<double> gatheredRayleighScattering(3);
        int numRotStepsMinusOne = numRotSteps - 1;
        for(int i = 1; i < numRotStepsMinusOne; ++i){
          theta = i * deltaTheta;
          //This theta acts as a new view angle for our camera moved to point P
          //We use this information to look up our previous intensity so that we can
          //add the light value to our total.
          double cosOfTheta = cos(theta);
          double cosOfThetaSquared = cosOfTheta * cosOfTheta;
          int y = parameterizeViewZenith(cosOfTheta); //This view angle is actually the angle of incoming scattered light

          //These would normally be the angle between the sun and the incident light scattering direction
          //but because we're integrating over all angles, we can just use our initial view theta here.
          miePhase = getMiePhase(cosOfThetaSquared);
          intensityMie = inscatteringIntensityMieKMinusOne[x][y][z];
          douuble rayleighPhase = getRayleighPhase(cosOfThetaSquared);
          intensityRayleigh = inscatteringIntensityRayleighKMinusOne[x][y][z];

          gatheredMieScattering += miePhase * intensityMie;
          gatheredRayleighScattering += rayleighPhase * intensityRayleigh;
        }
        //Because we're going full circle, the 0th gathering order is the Nth gathering order
        //this allows the 2.0 to be facotred out and cancels out the 2 in the denominator of theta / 2.0
        gatheredMieScattering = deltaTheta * (gatheredMieScattering + zerothGatheredMieScattering);
        gatheredRayleighScattering = deltaTheta * (gatheredRayleighScattering + zerothGatheredRayleighScattering);

        //Combine the two scatterings together to get our gathering LUT
        gatheredScattering[x][z] = gatheredMieScattering + gatheredRayleighScattering;

        //Add these to our gathering SUM LUT
        gatheringSum[x][z] += gatheredScattering[x][z];
      }
    }

    //Use our precomputed gathering data to calculate the next order of scattering
    for(int x = 0; x < 32; ++x){
      double height = heightTable[x];
      updateHeight(height);
      for(int y = 0; y < 128; ++y){
        double cosViewAngle = cosViewZenithTable[x][y];
        double sinViewZenith = sinViewZenithTable[x][y];
        std::valarray<double> deltaP({cosViewAngle, sinViewAngle}, 2);

        //Get P
        std::valarray<double> p({0.0, radiusOfCamera}, 2);
        int numberOfSteps = numPointsBetweenPaAndPb[x][y];
        double zeroPointFiveTimesdeltaH = (0.5 * pa2PbVects[x][y][1]) / static_cast<double>(numberOfSteps - 1);
        for(int z = 0; z < 32; ++z){
          double cosLightAngle = cosLightAngleTable[z];
          double sinLightAngle = sinLightAngleTable[z];
          double intialLightAngle = thetaOfLightAngleTable[z];

          //Zero here is the zeroth element as we're running down the same path from the camera to the atmosphere
          //every time.
          std::valarray<double> previousMieElement = gatheredScattering[x][z] * transmittanceFromPaToPTimesMieDensity[x][y][0];
          std::valarray<double> previousRayleighElement = gatheredScattering[x][z] * transmittanceFromPaToPTimesRayleighDensity[x][y][0];
          std::valarray<double> nextMieElement(3);
          std::valarray<double> nextRayleighElement(3);

          double integrandOfMieElements = 0.0;
          double integrandOfRayleighElements = 0.0;
          //Walk along the path from Pa to Pb
          for(int i = 1; i < numStepsMinus1; ++i){
            //Get our transmittance from P to Pa
            std::valarray<double> transmittanceFromPToPa = transmittanceFromPToPaLUT[x][y][z][i];

            //Get our location, p
            std::valarray<double> p = pVectors[x][y][i];

            //Get our gathering light intensity at this current p by rotating our solar angle
            //Instead of calculating our transmittance again, we shall presume that p, is just a new camera
            //with a new height and a new angle (the vector to the sun).
            double magnitudeOfPToOrigin = sqrt(p[0] * p[0] + p[1] * p[1]);
            double altitudeOfPAtP = magnitudeOfPToOrigin - RADIUS_OF_EARTH;
            double deltaAltitude =  altitudeOfPAtP - previousAltitude;
            double negativeAngleBetweenPAndPa = acos(p[1] / magnitudeOfPToOrigin);

            //Rotate the angle to the sun by the above
            double pLightAngle = intialLightAngle - negativeAngleBetweenPAndPa;

            //Convert our light angle back into a valid pixel location
            double cosLightAngle = cos(pLightAngle);
            int xLight = updateHeight(height);
            int zLight = parameterizeViewZenith(cosLightAngle);

            //Multiply this by our transmittance from P to Pa and our density at the current altitude
            nextMieElement = gatheredScattering[xLight][zLight] * transmittanceFromPaToPTimesMieDensity[x][y][i];
            nextRayleighElement = gatheredScattering[xLight][zLight] * transmittanceFromPaToPTimesRayleighDensity[x][y][i];
            integrandOfMieElements += 0.5 * altitudeOfPAtP * (nextMieElement + previousMieElement);
            integrandOfRayleighElements += 0.5 * altitudeOfPAtP * (nextRayleighElement + previousRayleighElement);

            //Prepare our variables for the net iteration of the loop
            previousMieElement = nextMieElement;
            previousRayleighElement = nextRayleighElement;
            previousAltitude = altitudeOfPAtP;
            p = p + deltaP;
          }

          //Multiply our constants and set our LUTs
          inscatteringIntensityMieKMinusOne[x][y][z] = EARTH_MIE_BETA_OVER_FOUR_PI * integrandOfMieElements;
          inscatteringIntensityRayleighKMinusOne[x][y][z] = betaRayleighOver4PI * integrandOfRayleighElements;
          sumInscatteringIntensityMie[x][y][z] = sumInscatteringIntensityMie[x][y][z] + inscatteringIntensityMieKMinusOne[x][y][z];
          sumInscatteringIntensityRayleigh[x][y][z] = sumInscatteringIntensityRayleigh[x][y][z] + inscatteringIntensityRayleighKMinusOne[x][y][z];
        }
      }
    }
  }

  //Export our results to the main program as strided LUTs
  //Transmittance
  int i = 0;
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 128; ++y){
      for(int c = 0; c < 4; ++c){
        //Set our LUT here
        transmittanceStridedLUT[i] = static_cast<int>(doubleTransmittanceFromPaToPb[x][y][c] * 255.0);
        i++;
      }
      i++;
    }
    i++;
  }

  //Inscattering
  int i = 0;
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 128; ++y){
      for(int z = 0; z < 32; ++z){
        for(int c = 0; c < 4; ++c){
          //Set our LUT here
          transmittanceStridedLUT[i] = static_cast<int>((sumInscatteringIntensityRayleigh[x][y][z][c] + sumInscatteringIntensityMie[x][y][z][c]) * 255.0);
          i++;
        }
        i++;
      }
      i++;
    }
    i++;
  }
}

double SkyLUTGenerator::getMiePhaseAtThetaEqualsZero(){
  return -3.0 / ((2.0 + mieGSquared) * sqrt(mieGSquared - 1.0));
}

double SkyLUTGenerator::getMiePhase(double cosThetaSquared){
  return (1.5 * (1.0 - mieGSquared) * (1.0 + cosThetaSquared)) / ((2.0 + mieGSquared) * pow((1.0 + mieGSquared - 2.0 * cosThetaSquared), 1.5));
}

double SkyLUTGenerator::getRayleighPhase(double cosThetaSquared){
  return 0.75 * (1.0 + cosThetaSquared)
}

//
//NOTE: When using these functions, if you change the view angle, it is important to call update height first.
//all the other components will depend upon this first request
//
int SkyLUTGenerator::updateHeight(double kmAboveSeaLevel){
  parameterizedHeight = sqrt(kmAboveSeaLevel * ONE_OVER_HEIGHT_OF_ATMOSPHERE);
  parameterizedViewZenithConst = -sqrt(kmAboveSeaLevel * (TWO_TIMES_THE_RADIUS_OF_THE_EARTH + kmAboveSeaLevel)) / (RADIUS_OF_EARTH + kmAboveSeaLevel);
  //parameterized viewZenith conversions.
  oneOverOneMinusParameterizedHeight = NUMERATOR_FOR_ONE_PLUS_OR_MINUS_PARAMETERIZED_HEIGHTS / (1.0 - parameterizedHeight);
  oneOverOnePlusParamaeterizedHeight = NUMERATOR_FOR_ONE_PLUS_OR_MINUS_PARAMETERIZED_HEIGHTS / (1.0 + parameterizedHeight);

  return static_cast<int>(parameterizedHeight);
}

double SkyLUTGenerator::parameterizeViewZenith(double cosViewZenith){
  if(cosViewZenith > parameterizedViewZenithConst){
    return pow((cosViewZenith - parameterizedHeight) * oneOverOneMinusParameterizedHeight, 0.2);
  }
  return pow((cosViewZenith - parameterizedHeight) * oneOverOnePlusParamaeterizedHeight, 0.2);
}

double SkyLUTGenerator::parameterizeLightZenith(double cosSunZenith){
  return atan2(max(cosSunZenith, -0.1975) * TAN_OF_ONE_POINT_THREE_EIGHT_SIX) * ZERO_POINT_FIVE_OVER_ONE_POINT_ONE + 0.37;
}

double SkyLUTGenerator::updateHeightFromParameter(double parameterKMAboveSeaLevel){
  kmAboveSeaLevel = parameterKMAboveSeaLevel * HEIGHT_OF_RAYLEIGH_ATMOSPHERE;
  parameterizedViewZenithConst = - sqrt(kmAboveSeaLevel * (TWO_TIMES_THE_RADIUS_OF_THE_EARTH + kmAboveSeaLevel)) / (RADIUS_OF_EARTH + kmAboveSeaLevel);
  oneMinusParameterizedViewAngle = 1.0 - parameterizedViewZenithConst;
  onePlusParameterizedViewAngle = 1.0 + parameterizedViewZenithConst;

  return kmAboveSeaLevel;
}

double SkyLUTGenerator::cosViewAngleFromParameter(double parameterizedViewZenith){
  if(parameterizedViewZenith > 0.5){
    return PARAMETER_TO_COS_OF_SUN_VIEW_CONST + pow((parameterizedViewZenith - 0.5), 5) * oneMinusParameterizedViewAngle;
  }
  return PARAMETER_TO_COS_OF_SUN_VIEW_CONST - pow(parameterizedViewZenith, 5) * onePlusParameterizedViewAngle;
}

double SkyLUTGenerator::cosLightZenithFromParameter(double parameterizedSunZenith){
  return tan(1.5 * parameterizedSunZenith - 0.555) * PARAMETER_TO_COS_ZENITH_OF_SUN_CONST;
}
