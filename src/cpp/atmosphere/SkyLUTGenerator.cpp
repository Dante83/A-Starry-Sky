#include "Constants.h" //Local constants
#include "../Constants.h" //Global constants
#include "SkyLUTGenerator.h"
#include "../lin_algebra/Vector2.h"
#include "../lin_algebra/Vector3.h"
#include <cmath>
#include <vector>
using namespace std;

SkyLUTGenerator::SkyLUTGenerator(double mieDirectioanlG, int stepsPerKilo, int numRotationalSteps){
  stepsPerkm = stepsPerKilo;
  mieG = mieDirectioanlG;
  numRotSteps = numRotationalSteps;
}

void SkyLUTGenerator::constructLUTs(){
  //Initialize our final targets
  int* transmittanceStridedLUTPtr = new int[12288]; //32 x 128 x 3
  int* scatteringStridedLUTPrt = new int[393216]; //32 x 128 x 32 x 3

  //General constants
  double mieGSquared = mieG * mieG;
  VectorD3 rayleighBeta = VectorD3(EARTH_RAYLEIGH_RED_BETA, EARTH_RAYLEIGH_GREEN_BETA, EARTH_RAYLEIGH_BLUE_BETA);
  VectorD3 betaRayleighOver4PI = VectorD3(EARTH_RAYLEIGH_RED_BETA_OVER_FOUR_PI, EARTH_RAYLEIGH_GREEN_BETA_OVER_FOUR_PI, EARTH_RAYLEIGH_BLUE_BETA_OVER_FOUR_PI);

  //As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html
  double moleculesPerMeterCubedAtSeaLevel = pow(2.545, 25);
  VectorD3 ozoneBeta = VectorD3(pow(2.0, -25), pow(2.0, -25), pow(7.0, -27));
  ozoneBeta *= moleculesPerMeterCubedAtSeaLevel;

  //Convert our pixel data to local coordinates
  double heightTable[32];
  double cosViewZenithTable[32][128];
  double sinViewZenithTable[32][128];
  double cosLightZenithTable[32];
  double sinLightZenithTable[32];
  double thetaOfLightZenithTable[32];
  for(int x = 0; x < 32; ++x){
    heightTable[x] = updateHeightFromParameter(static_cast<double>(x));
    for(int y = 0; y < 128; ++y){
      double cosViewZenith = cosViewZenithFromParameter(static_cast<double>(y));
      cosViewZenithTable[x][y] = cosViewZenith;
      sinViewZenithTable[x][y] = sqrt(1.0 - cosViewZenith * cosViewZenith);
    }
  }
  for(int z = 0; z < 32; ++z){
    double cosLightZenith = cosLightZenithFromParameter(static_cast<double>(z));
    cosLightZenithTable[z] = cosLightZenith;
    sinLightZenithTable[z] = sqrt(1.0 - cosLightZenith * cosLightZenith);
    thetaOfLightZenithTable[z] = atan2(sinLightZenithTable[z], cosLightZenith);
  }

  //Precalulate our geometry data
  //Construct our ray paths from P_a to P_b
  //And from every P to P_c
  int numPointsBetweenPaAndPb[32][128];
  VectorD2 pa2PbVects[32][128];
  for(int x = 0; x < 32; ++x){
    double height = heightTable[x];
    double radiusOfCamera = height + RADIUS_OF_EARTH;
    double radiusOfCameraSquared = radiusOfCamera * radiusOfCamera;
    VectorD2 cameraPosition(0.0, radiusOfCamera);

    for(int y = 0; y < 128; ++y){
      //Get the view angle
      double cosViewZenith = cosViewZenithTable[x][y];
      double sinViewZenith = sinViewZenithTable[x][y];

      //Simplifying the results from https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
      double t_intersection = radiusOfCamera * sinViewZenith + sqrt(ATMOSPHERE_HEIGHT_SQUARED - radiusOfCameraSquared * (1.0 - sinViewZenith * sinViewZenith));
      VectorD2 vectorFromPaToPb = vectorFromPaToPb(cosViewZenith * t_intersection, sinViewZenith * t_intersection);

      //Determine the number of points between P and Pb
      VectorD2 vectorFromPaToPb -= cameraPosition;
      int numPointsFromPaToPb = ceil(sqrt(vectorFromPaToPb.dot(vectorFromPaToPb)) * stepsPerkm) + 1;
      numPointsBetweenPaAndPb[x][y] = numPointsFromPaToPb;
      pa2PbVects[x][y] = new VectorD2(vectorFromPaToPb);
    }
  }

  //Connect our geometry data up to transmittance data
  std::vector<VectorD2> pVectors[32][128];
  std::vector<VectorD3> transmittanceFromPaToPTimesMieDensity[32][128];
  std::vector<VectorD3> transmittanceFromPaToPTimesRayleighDensity[32][128];
  std::vector<VectorD3> transmittanceFromPaToP[32][128];
  VectorD3 doubleTransmittanceFromPaToPb[32][128];
  for(int x = 0; x < 32; ++x){
    double startingHeight = heightTable[x];
    double firstRayleighValue = exp(-startingHeight * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);
    double firstMieValue = exp(-startingHeight * ONE_OVER_MIE_SCALE_HEIGHT);

    VectorD2 p_start(0.0, startingHeight + RADIUS_OF_EARTH);
    for(int y = 0; y < 128; ++y){
      //Get the vector in the direction from Pa to Pb
      double integralOfRayleighDensityFunction = 0.0;
      double integralOfMieDensityFunction = 0.0;
      double integralOfOzoneDensityFunction;
      int numberOfSteps = numPointsBetweenPaAndPb[x][y];
      VectorD2 deltaP = VectorD2(pa2PbVects[x][y] / static_cast<double>(numberOfSteps - 1));
      //h_0 is just the starting height for for our view camera
      double previousRayleighValue = firstRayleighValue;
      double previousMieValue = firstMieValue;
      VectorD2 p = VectorD2(p_start); //Starting location of our camera
      double h_0 = startingHeight;

      //We have an N-1 problem below. Each trapezoidal integration removes one data
      //point from our result and is only valid for values after one delta P.
      //therefore, we must pad the beginning of our result with a first value of zero.
      //as the area under a zero width element. This results in a transmittance of 1.0
      VectorD3 transmittance = VectorD3(1.0, 1.0, 1.0);

      //For our future caching of transmittance times mie or rayleigh density
      VectorD3 transmittanceTimesMieDensity = transmittance * exp(-h_0 * ONE_OVER_MIE_SCALE_HEIGHT);
      VectorD3 transmittanceTimesRayleighDensity = transmittance * exp(-h_0 * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);

      //Store our results for future use
      transmittanceFromPaToP[x][y] = new std::Vector();
      transmittanceFromPaToP[x][y].push_back(new VectorD3(transmittance));
      transmittanceFromPaToPTimesMieDensity[x][y] = new std::Vector();
      transmittanceFromPaToPTimesMieDensity[x][y].push_back(new VectorD3(transmittanceTimesMieDensity));
      transmittanceFromPaToPTimesRayleighDensity[x][y] = new std::Vector();
      transmittanceFromPaToPTimesRayleighDensity[x][y].push_back(new VectorD3(transmittanceTimesRayleighDensity));
      pVectors[x][y] = new std::Vector();
      pVectors[x][y].push_back(new VectorD2(p));

      //Now that our loop is primed, commence the primary loop from Pa to Pb
      //Note that we got to number of steps plus 1 to take care of the N-1 outcome
      //of trapezoidal integration.
      for(int i = 1; i < numberOfSteps; ++i){
        p += deltaP;
        double h_f = sqrt(p.dot(p)) - RADIUS_OF_EARTH;
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
        VectorD3 mieTransmittanceVector(mieTransmittanceExponent, mieTransmittanceExponent, mieTransmittanceExponent);
        for(int j = 0; j < 3; ++j){
          transmittance[j] = exp(-1.0 * rayleighBeta[j] * integralOfRayleighDensityFunction - mieTransmittanceVector[j] - ozoneBeta[j] * integralOfOzoneDensityFunction);
        }

        //For our future caching of transmittance times mie or rayleigh density
        VectorD3 transmittanceTimesMieDensity = transmittance * exp(-h_f * ONE_OVER_MIE_SCALE_HEIGHT);
        VectorD3 transmittanceTimesRayleighDensity = transmittance * exp(-h_f * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);

        //Store our results for future use
        transmittanceFromPaToP[x][y].push_back(new VectorD3(transmittance));
        transmittanceFromPaToPTimesMieDensity.push_back(new VectorD3(transmittanceTimesMieDensity));
        transmittanceFromPaToPTimesRayleighDensity.push_back(new VectorD3(transmittanceTimesRayleighDensity));
        pVectors[x][y].push_back(new VectorD2(p));

        h_0 = h_f;
      }

      //Copy our final value over to our output transmission table
      doubleTransmittanceFromPaToPb[x][y] = new VectorD3(transmittance);
    }
  }

  //Intialize our variable for our scattering calculations
  VectorD3 sumInscatteringIntensityMie[32][128][32];
  VectorD3 sumInscatteringIntensityRayleigh[32][128][32];
  VectorD3 inscatteringIntensityMieKMinusOne[32][128][32];
  VectorD3 inscatteringIntensityRayleighKMinusOne[32][128][32];

  //Perform our single scattering integration
  VectorD3 inscatteringIntensityMie0[32][128][32];
  VectorD3 inscatteringIntensityRayleigh0[32][128][32];
  for(int x = 0; x < 32; ++x){
    double height = heightTable[x];
    double radiusOfCamera = height + RADIUS_OF_EARTH;
    VectorD2 initialPosition(0.0, radiusOfCamera);

    //For each view angle theta
    for(int y = 0; y < 128; ++y){
      double cosViewZenith = cosViewZenithTable[x][y];
      double sinViewZenith = sinViewZenithTable[x][y];
      VectorD2 deltaP(cosViewZenith, sinViewZenith);

      //Get P
      VectorD2 p(0.0, radiusOfCamera);
      int numberOfSteps = numPointsBetweenPaAndPb[x][y];
      double zeroPointFiveTimesdeltaH = (0.5 * pa2PbVects[x][y].y) / static_cast<double>(numberOfSteps - 1);

      //For each sun angle phi
      for(int z = 0; z < 32; ++z){
        double cosLightZenith = cosLightZenithTable[z];
        double sinLightZenith = sinLightZenithTable[z];
        double intialLightZenith = thetaOfLightZenithTable[z];

        //We don't need to reset the transmittance location for this one as we are starting at the camera
        //so we just need the angle between our altitude and the sun.
        int yLightView = parameterizeViewZenith(cosLightZenithTable[z]);
        //NOTE: We should really interpolate this for better results.
        VectorD3 transmittanceFromPToPc = doubleTransmittanceFromPaToPb[x][yLightView];

        //Calculate the first integrand element
        double nextMieElement;
        double nextRayleighElement;
        VectorD3 previousMieElement = transmittanceFromPaToPTimesMieDensity[x][y][0] * transmittanceFromPToPc;
        VectorD3 previousRayleighElement = transmittanceFromPaToPTimesRayleighDensity[x][y][0] * transmittanceFromPToPc;
        double previousAltitude = height;
        double integrandOfMieElements = 0.0;
        double integrandOfRayleighElements = 0.0;
        //Walk along the path from Pa to Pb
        for(int i = 1; i < numPoints; ++i){
          //Get our location, p
          VectorD2 p = pVectors[x][y];

          //Instead of calculating our transmittance again, we shall presume that p, is just a new camera
          //with a new height and a new angle (the vector to the sun).
          double magnitudeOfPToOrigin = sqrt(p.dot(p));
          double altitudeOfPAtP = magnitudeOfPToOrigin - RADIUS_OF_EARTH;
          double deltaAltitude =  altitudeOfPAtP - previousAltitude;
          double negativeAngleBetweenPAndPa = acos(p.y / magnitudeOfPToOrigin);

          //Rotate the angle to the sun by the above
          double pLightZenith = intialLightZenith - negativeAngleBetweenPAndPa;

          //Convert our light angle back into a valid pixel location
          double cosLightZenith = cos(pLightZenith);
          double sinLightZenith = sin(pLightZenith);

          //Now convert this over to a transmittance lookup
          //Use the method recommended by page 54 of Stefan Sperlhofer
          //https://www.gamedevs.org/uploads/deferred-rendering-of-planetary-terrains-with-accurate-atmospheres.pdf
          //if sinLightZenith < 0
          numPointsMinus1 = numPointsBetweenPaAndPb[xLightView][yLightView] - 1;
          std::valarray<double> transmittanceFromPToPc;
          if(sinLightZenith < 0.0){
            int xLightView = updateHeight(altitudeOfPAtP);
            int yLightView = parameterizeViewZenith(cos(pLightZenith));
            transmittanceFromPToPc = doubleTransmittanceFromPaToPb[xLightView][yLightView][numPointsMinus1];
          }
          else{
            //Start by grabbign the transmittance in the opposite direction, from P
            //to the opposition of the light source.
            //Add Pi to our light angle, this just multiplies our light angle by -1.0
            cosLightZenith *= -1.0;
            int xLightView = updateHeight(altitudeOfPAtP);
            int yLightView = parameterizeViewZenith(cosLightZenith);
            double transmittanceFromPToPexit = doubleTransmittanceFromPaToPb[xLightView][yLightView][numPointsMinus1];

            //Set our camera to the point where the sun is looking into the atmosphere
            //towards point P.
            xLightView = updateHeight(ATMOSPHERE_HEIGHT);
            yLightView = parameterizeViewZenith(cos(pLightZenith));

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
        VectorD3 inscatteringMie = EARTH_MIE_BETA_OVER_FOUR_PI * integrandOfMieElements;
        VectorD3 inscatteringRayleigh = betaRayleighOver4PI * integrandOfRayleighElements;
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
  VectorD3 gatheringSum[32][32];
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 64; ++y){
      //Initialize our gathering sum
      gatheringSum[x][y] = new VectorD3();
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
    VectorD3 gatheredScattering[32][32];
    for(int x = 0; x < 32; ++x){
      double height = heightTable[x];
      for(int z = 0; z < 32; ++z){
        double thetaLightZenith = thetaOfLightZenithTable[z];
        double cosLightZenith = cosLightZenithTable[z];

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
        //double theta = 0.0;
        double y = parameterizeViewZenith(1.0); //cos of 0 is 1
        double miePhase = miePhaseAtZero; //This should just be a constant when we start this up
        double intensityMie = inscatteringIntensityMieKMinusOne[x][y][z];
        VectorD3 intensityRayleigh = inscatteringIntensityRayleighKMinusOne[x][y][z];
        VectorD3 zerothGatheredMieScattering = miePhase * intensityMie;
        VectorD3 zerothGatheredRayleighScattering = RAYLEIGH_PHASE_AT_ZERO_DEGREES * intensityRayleigh;
        VectorD3 gatheredMieScattering = VectorD3();
        VectorD3 gatheredRayleighScattering = VectorD3();
        int numRotStepsMinusOne = numRotSteps - 1;
        for(int i = 1; i < numRotStepsMinusOne; ++i){
          double theta = i * deltaTheta;
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
        gatheredScattering[x][z] = VectorD3(gatheredMieScattering + gatheredRayleighScattering);

        //Add these to our gathering SUM LUT
        gatheringSum[x][z] += gatheredScattering[x][z];
      }
    }

    //Use our precomputed gathering data to calculate the next order of scattering
    for(int x = 0; x < 32; ++x){
      double height = heightTable[x];
      updateHeight(height);
      for(int y = 0; y < 128; ++y){
        double cosViewZenith = cosViewZenithTable[x][y];
        double sinViewZenith = sinViewZenithTable[x][y];
        VectorD2 deltaP = VectorD2(cosViewZenith, sinViewZenith);

        //Get P
        VectorD2 p = VectorD2(0.0, radiusOfCamera);
        int numberOfSteps = numPointsBetweenPaAndPb[x][y];
        double zeroPointFiveTimesdeltaH = (0.5 * pa2PbVects[x][y].y) / static_cast<double>(numberOfSteps - 1);
        for(int z = 0; z < 32; ++z){
          double cosLightZenith = cosLightZenithTable[z];
          double sinLightZenith = sinLightZenithTable[z];
          double intialLightZenith = thetaOfLightZenithTable[z];

          //Zero here is the zeroth element as we're running down the same path from the camera to the atmosphere
          //every time.
          VectorD3 previousMieElement = gatheredScattering[x][z] * transmittanceFromPaToPTimesMieDensity[x][y][0];
          VectorD3 previousRayleighElement = gatheredScattering[x][z] * transmittanceFromPaToPTimesRayleighDensity[x][y][0];
          VectorD3 nextMieElement = VectorD3();
          VectorD3 nextRayleighElement = VectorD3();

          double integrandOfMieElements = 0.0;
          double integrandOfRayleighElements = 0.0;
          //Walk along the path from Pa to Pb
          for(int i = 1; i < numStepsMinus1; ++i){
            //Get our transmittance from P to Pa
            VectorD3 transmittanceFromPToPa = transmittanceFromPToPaLUT[x][y][z][i];

            //Get our location, p
            VectorD2 p = pVectors[x][y][i];

            //Get our gathering light intensity at this current p by rotating our solar angle
            //Instead of calculating our transmittance again, we shall presume that p, is just a new camera
            //with a new height and a new angle (the vector to the sun).
            double magnitudeOfPToOrigin = sqrt(p.dot(p));
            double altitudeOfPAtP = magnitudeOfPToOrigin - RADIUS_OF_EARTH;
            double deltaAltitude =  altitudeOfPAtP - previousAltitude;
            double negativeAngleBetweenPAndPa = acos(p.y / magnitudeOfPToOrigin);

            //Rotate the angle to the sun by the above
            double pLightZenith = intialLightZenith - negativeAngleBetweenPAndPa;

            //Convert our light angle back into a valid pixel location
            double cosLightZenith = cos(pLightZenith);
            int xLight = updateHeight(height);
            int zLight = parameterizeViewZenith(cosLightZenith);

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
          inscatteringIntensityMieKMinusOne[x][y][z] = new VectorD3(EARTH_MIE_BETA_OVER_FOUR_PI * integrandOfMieElements);
          inscatteringIntensityRayleighKMinusOne[x][y][z] = new VectorD3(betaRayleighOver4PI * integrandOfRayleighElements);
          sumInscatteringIntensityMie[x][y][z] = new VectorD3(sumInscatteringIntensityMie[x][y][z] + inscatteringIntensityMieKMinusOne[x][y][z]);
          sumInscatteringIntensityRayleigh[x][y][z] = new VectorD3(sumInscatteringIntensityRayleigh[x][y][z] + inscatteringIntensityRayleighKMinusOne[x][y][z]));
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
        ++i;
      }
      ++i;
    }
    ++i;
  }

  //Inscattering
  int i = 0;
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 128; ++y){
      for(int z = 0; z < 32; ++z){
        for(int c = 0; c < 4; ++c){
          //Set our LUT here
          transmittanceStridedLUT[i] = static_cast<int>((sumInscatteringIntensityRayleigh[x][y][z][c] + sumInscatteringIntensityMie[x][y][z][c]) * 255.0);
          ++i;
        }
        ++i;
      }
      ++i;
    }
    ++i;
  }

  //Free up our memory
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 128; ++y){
      VectorD2 pa2PbVects[32][128];
      int numPVectors = pVectors[x][y].size();
      for(int j = 0; j < numPVectors; ++j){
        delete pVectors[x][y][j];
      }
      delete pVectors[x][y];

      int numTransmittanceFromPaToPTimesMieDensity = transmittanceFromPaToPTimesMieDensity[x][y].size();
      for(int j = 0; j < numTransmittanceFromPaToPTimesMieDensity; ++j){
        delete transmittanceFromPaToPTimesMieDensity[x][y][j];
        delete transmittanceFromPaToPTimesRayleighDensity[x][y][j];
        delete transmittanceFromPaToP[x][y][j]
      }
      delete transmittanceFromPaToPTimesMieDensity[x][y];
      delete transmittanceFromPaToPTimesMieDensity[x][y];
      delete transmittanceFromPaToP[x][y];
      delete doubleTransmittanceFromPaToPb[x][y];
    }
  }
  for(int x = 0; x < 32; ++x){
    for(int y = 0; y < 32; ++y){
      delete pa2PbVects[x][y];
    }
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

double SkyLUTGenerator::cosViewZenithFromParameter(double parameterizedViewZenith){
  if(parameterizedViewZenith > 0.5){
    return PARAMETER_TO_COS_OF_SUN_VIEW_CONST + pow((parameterizedViewZenith - 0.5), 5) * oneMinusParameterizedViewAngle;
  }
  return PARAMETER_TO_COS_OF_SUN_VIEW_CONST - pow(parameterizedViewZenith, 5) * onePlusParameterizedViewAngle;
}

double SkyLUTGenerator::cosLightZenithFromParameter(double parameterizedSunZenith){
  return tan(1.5 * parameterizedSunZenith - 0.555) * PARAMETER_TO_COS_ZENITH_OF_SUN_CONST;
}
