function aSkyInterpolator(initialTime, interpolationLengthInSeconds, dynamicSkyObject, originalSkyData){
  this.initialTime = initialTime;
  this.finalTime = new Date(this.initialTime.getTime() + interpolationLengthInSeconds * 1000);

  //Clone our dynamic sky object for the purposes of linear interpolation
  //And set them to the initial and final time with all other variables
  //held constant...
  this.skyDataObjectString = JSON.stringify(originalSkyData);
  this.dynamicSkyObjectAt_t_0 = cloner.deep.copy(this.dynamicSkyObject);
  this.dynamicSkyObjectAt_t_0.update(this.skyDataFromTime(this.initialTime));
  this.dynamicSkyObjectAt_t_f = cloner.deep.copy(this.dynamicSkyObject);
  this.dynamicSkyObjectAt_t_0.update(this.skyDataFromTime(this.finalTime));

  this.currentInterpolations = {};
  this.bufferedInterpolations = {};
  var self = this;

  //This is a means of updating our sky time so that we can set our dynamic sky objects
  //to the correct positions in the sky...
  this.skyDataFromTime = function(time){
    //Clone our sky data
    var skySkyDataClone = JSON.parse(self.skyDataObjectString);

    //Get the difference between the time provided and the initial time for our function
    var timeDiffInSeconds = (time.getTime() - initialTime.getTime()) / 1000.0;
    skySkyDataClone.timeOffset += timeDiffInSeconds;

    if(skySkyDataClone.timeOffset > 86400.0){
      //It's a new day!
      skySkyDataClone.dayOfYear += 1;
      skySkyDataClone.timeOffset = skySkyDataClone.timeOffset % 86400.00;
      if(skySkyDataClone.dayOfYear > skySkyDataClone.yearPeriod){
        //Reset everything!
        skySkyDataClone.dayOfTheYear = 1;
        skySkyDataClone.year += 1;
      }
    }

    return skySkyDataClone;
  }

  //A way of diving deep into a variable to hunt for nested values
  this.searchForVariable = function(objectPath, nestedArray){
    var returnValue = null;
    if(objectPath.length > 1){
      var currentVarName = objectPath.shift();
      returnValue = self.searchForVariable(objectPath, nestedArray[currentVarName]);
    }
    else{
      returnValue = nestedArray[objectPath[0]];
    }

    return returnValue;
  }

  //
  //Methods that set our interpolations
  //
  this.setLinearInterpolationForScalar = function(name, objectPath, isBuffered){
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      currentInterpolation = self.bufferedInterpolations;
      t_0 = this.finalTime;
      t_f = this.bufferedTime;
    }
    else{
      currentInterpolation = self.currentInterpolations;
      t_0 = this.initialTime;
      t_f = this.finalTime;
    }

    //Get our values to interpolate between
    var x_0 = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0);
    var x_f = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f);

    currentInterpolation['name'] = new function(time){
      this.objectPath = objectPath.splice(0);
      this.setFunction = self.setLinearInterpolationForScalar;
      return (time * (x_f - x_0) / (t_f - t_0));
    };
  }

  this.setLinearInterpolationForVect = function(name, objectPath, isBuffered){
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      currentInterpolation = self.bufferedInterpolations;
      t_0 = this.finalTime;
      t_f = this.bufferedTime;
    }
    else{
      currentInterpolation = self.currentInterpolations;
      t_0 = this.initialTime;
      t_f = this.finalTime;
    }

    //Get our values to interpolate between
    var vec2_0 = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0);
    var vec2_f = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f);

    currentInterpolation['name'] = new function(time){
      this.objectPath = objectPath.splice(0);
      this.setFunction = self.setLinearInterpolationForVect;
      var returnVar = vec2_f.add(vec2_0.negate()).divideScalar(t_f - t_0);
    };
  }

  //
  //This is the big one, the method that we call repeatedly to give us the values we want
  //it mostly just runs a bunch of linear functions - one for each of our uniforms
  //in order to create an interpolated sky. On occasion, it also requests a new set of interpolations
  //after cloning the cached interpolation set.
  //
  this.getValues = function(var time){
    //In the event that the time falls outside of or current range
    //swap the buffer with the current system and update our times
    //and clear the buffer.
    var requestBufferUpdate = false;
    if(time > self.finalTime){
      //Presumes the buffer is within range of the next time object
      self.initialTime = new Date(self.finalTime);
      self.finalTime = new Date(self.bufferedTime);

      //Supposedly pretty quick and dirty, even though a built in clone method would work better
      self.currentInterpolations = cloner.deep.copy(self.bufferedInterpolations);
      requestBufferUpdate = true;
    }

    //Create an object with all the values we're interpolating
    var interpolatedValues = {};
    Object.entries(self.currentInterpolations).forEach(
        ([name, namedFunct]) => interpolatedValues[name] = namedFunct(time)
    );

    //Prime the buffer again if need be.
    if(requestBufferUpdate){
      self.primeBuffer();
    }

    //Return this object the values acquired
    return interpolatedValues;
  }

  this.primeBuffer = async function(){
    //Change the adynamic sky function to five minutes after the final time
    self.bufferedTime = new Date(self.finalTime + interpolationLengthInSeconds * 1000);
    var skytime_0 = self.skyDataFromTime();
    var skytime_f = self.skyDataFromTime();
    this.dynamicSkyObjectAt_t_0.update(skytime_0);
    this.dynamicSkyObjectAt_t_f.update(skytime_f);

    //create new interpolations for all the functions in the linear interpolations list
    //Note that we cannot buffer anything that isn't in current.
    for(var name in self.currentInterpolations) {
      //Create buffered interpolations for use in the next go round
      self.currentInterpolations.setFunction(name, self.currentInterpolations.objectPath, true);
    }
  }
}
