if(typeof exports !== 'undefined') {
  const dynamicSkyEntityMethodsExports = require('./a-dynamic-sky-entity-methods.js');
  const clonerMethodsExports = require('./cloner.js');
  //Give this global scope by leaving off the var
  cloner = clonerMethodsExports.dynamicSkyEntityMethods;
}

var aSkyInterpolator = function(initializationTime, timeMultiplier, interpolationLengthInSeconds, dynamicSkyObject, originalSkyData){
  var self = this;

  //This is a means of updating our sky time so that we can set our dynamic sky objects
  //to the correct positions in the sky...
  this.skyDataFromTime = function(time){
    //Clone our sky data
    var cloneOfSkyDataObjectString = self.skyDataObjectString;
    var skyDataClone = JSON.parse(cloneOfSkyDataObjectString);

    //Get the difference between the time provided and the initial time for our function
    //We divide by 1000 because this returns the difference in milliseconds
    var timeDiffInSeconds = (time.getTime() - self.initializationTime.getTime()) / 1000.0;
    skyDataClone.timeOffset += timeDiffInSeconds;

    if(skyDataClone.timeOffset > 86400.0){
      //It's a new day!
      skyDataClone.dayOfYear += 1;
      skyDataClone.timeOffset = skyDataClone.timeOffset % 86400.00;
      if(skyDataClone.dayOfYear > skyDataClone.yearPeriod){
        //Reset everything!
        skyDataClone.dayOfTheYear = 1;
        skyDataClone.year += 1;
      }
    }

    return skyDataClone;
  };

  //A way of diving deep into a variable to hunt for nested values
  this.searchForVariable = function(objectPathRef, nestedArray){
    var objectPath = objectPathRef.slice(0); //We wish to copy this, we're not after the original

    var returnValue = null;
    if(objectPath.length > 1){
      var currentVarName = objectPath.shift();
      returnValue = self.searchForVariable(objectPath, nestedArray[currentVarName]);
    }
    else{
      returnValue = nestedArray[objectPath[0]];
    }

    return returnValue;
  };

  //
  //Methods that set our interpolations
  //
  this.setSLERPFor3Vect = function(name, objectPath, isBuffered, callback = false){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var vec_0 = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0).clone();
    var vec_f = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f).clone();

    var timeNormalizer = 1.0 / (t_f - t_0);
    var omega = vec_0.angleTo(vec_f);
    var vec_0_array = vec_0.toArray();
    var vec_f_array = vec_f.toArray();
    var coeficient_a = [];
    var coeficient_b = [];
    for(var i = 0; i < vec_0_array.length; i++){
      coeficient_a.push(vec_0_array[i] / Math.sin(omega));
      coeficient_b.push(vec_f_array[i] / Math.sin(omega));
    }

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setSLERPFor3Vect,
      callback: callback,
      coeficient_a: coeficient_a,
      coeficient_b: coeficient_b,
      omega: omega,
      timeNormalizer: timeNormalizer,
      t_0: t_0,
      interpolate: callback ? function(time){
        var normalizedTime = (time - this.t_0) * this.timeNormalizer;
        var slerpArray= [];
        for(var i = 0; i < coeficient_a.length; i++){
          slerpArray.push((Math.sin((1 - normalizedTime) * this.omega) * this.coeficient_a[i]) + Math.sin(normalizedTime * this.omega) * this.coeficient_b[i]);
        }
        var returnVect = new THREE.Vector3(slerpArray[0], slerpArray[1],  slerpArray[2]);
        return this.callback(returnVect);
      } : function(time){
        var normalizedTime = (time - this.t_0) * this.timeNormalizer;
        var slerpArray= [];
        for(var i = 0; i < coeficient_a.length; i++){
          slerpArray.push((Math.sin((1 - normalizedTime) * this.omega) * this.coeficient_a[i]) + Math.sin(normalizedTime * this.omega) * this.coeficient_b[i]);
        }
        var returnVect = new THREE.Vector3(slerpArray[0], slerpArray[1],  slerpArray[2]);
        return returnVect;
      }
    };
  };

  //Presumes that values are over a full circle, possibly offset below like with -180
  this.setAngularLinearInterpolationForScalar = function(name, objectPath, isBuffered, callback = false, offset = 0){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var x_0 = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0)));
    var x_f = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f)));

    function modulo(a, b){
      return (a - Math.floor(a/b) * b);
    }

    var offset = offset;
    var offsetX0 = x_0 + offset;
    var offsetXF = x_f + offset;
    var diff = offsetXF - offsetX0;
    var angularDifference = modulo((diff + Math.PI), (2.0 * Math.PI)) - Math.PI;
    var timeNormalizer = 1.0 / (t_f - t_0);

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setAngularLinearInterpolationForScalar,
      callback: callback,
      offset: offset,
      offsetX0: offsetX0,
      interpolate: callback ? function(time){
        var returnVal = offsetX0 + (time - t_0) * timeNormalizer * angularDifference;
        returnVal = returnVal - offset;
        return this.callback(returnVal);
      } : function(time){
        var returnVal = offsetX0 + (time - t_0) * timeNormalizer * angularDifference;
        returnVal = returnVal - offset;
        return returnVal;
      }
    };
  };

  this.setLinearInterpolationForScalar = function(name, objectPath, isBuffered, callback = false){
    //
    //Prime function for super fast calculations
    //This stuff is calculated once at construction and then used repeatedly at super-speed!
    //
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var x_0 = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0)));
    var x_f = JSON.parse(JSON.stringify(self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f)));

    var slope = (x_f - x_0) / (t_f - t_0);
    var intercept = x_0 - slope * t_0;

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setLinearInterpolationForScalar,
      slope: slope,
      intercept: intercept,
      callback: callback,
      interpolate: callback ? function(time){
        return this.callback(this.slope * time + this.intercept);
      } : function(time){
        return (this.slope * time + this.intercept);
      }
    };
  };

  this.setLinearInterpolationForVect = function(name, objectPath, isBuffered, callback = false){
    var currentInterpolation
    var t_0;
    var t_f;
    if(isBuffered){
      interpolations = self.bufferedInterpolations;
      t_0 = self.finalTime.getTime() / 1000.0;
      t_f = self.bufferedTime.getTime() / 1000.0;
    }
    else{
      interpolations = self.currentInterpolations;
      t_0 = self.initialTime.getTime() / 1000.0;
      t_f = self.finalTime.getTime() / 1000.0;
    }
    var vec_0 = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_0).toArray();
    var vec_f = self.searchForVariable(objectPath, self.dynamicSkyObjectAt_t_f).toArray();

    var slope = [];
    var intercept = [];
    var slopeDenominator = 1.0 / (t_f - t_0);
    var vectorLength = vec_0.length;
    for(var i = 0; i < vectorLength; i++){
      slope.push((vec_f[i] - vec_0[i]) * slopeDenominator);
      intercept.push(vec_0[i] - slope[i] * t_0);
    }

    interpolations[name] = {
      objectPath: objectPath.splice(0),
      setFunction: self.setLinearInterpolationForVect,
      callback: callback,
      slope: slope.splice(0),
      intercept: intercept.splice(0),
      interpolate: callback ? function(time){
        var returnArray = [];
        for(i = 0; i < vectorLength; i++){
          returnArray.push(this.slope[i] * time + this.intercept[i]);
        }

        var returnVect;
        if(vectorLength == 2){
          returnVect = new THREE.Vector2(returnArray[0], returnArray[1]);
        }
        else if(vectorLength == 3){
          returnVect = new THREE.Vector3(returnArray[0], returnArray[1],  returnArray[2]);
        }
        else{
          returnVect = new THREE.Vector4(returnArray[0], returnArray[1],  returnArray[2], returnArray[3]);
        }

        return this.callback(returnVect);
      } : function(time){
        var returnArray = [];
        for(i = 0; i < vectorLength; i++){
          returnArray.push(this.slope[i] * time + this.intercept[i]);
        }

        var returnVect;
        if(vectorLength == 2){
          returnVect = new THREE.Vector2(returnArray[0], returnArray[1]);
        }
        else if(vectorLength == 3){
          returnVect = new THREE.Vector3(returnArray[0], returnArray[1],  returnArray[2]);
        }
        else{
          returnVect = new THREE.Vector4(returnArray[0], returnArray[1],  returnArray[2], returnArray[3]);
        }

        //console.log(returnVect);

        return returnVect;
      }
    };
  };

  //
  //This is the big one, the method that we call repeatedly to give us the values we want
  //it mostly just runs a bunch of linear functions - one for each of our uniforms
  //in order to create an interpolated sky. On occasion, it also requests a new set of interpolations
  //after cloning the cached interpolation set.
  //
  this.getValues = function(time){
    //In the event that the time falls outside of or current range
    //swap the buffer with the current system and update our times
    //and clear the buffer.
    var requestBufferUpdate = false;

    if(time > self.finalTime){
      //Supposedly pretty quick and dirty, even though a built in clone method would work better
      self.currentInterpolations = cloner.deep.copy(self.bufferedInterpolations);
      requestBufferUpdate = true;
    }

    //Create an object with all the values we're interpolating
    var interpolatedValues = {};
    for(var varName in self.currentInterpolations){
      var outVarValue = self.currentInterpolations[varName].interpolate((time.getTime())/1000.0);
      interpolatedValues[varName] = outVarValue;
    }

    if(self.bufferHasRunForTesting && self.numberOfTestRuns < 10){
      self.numberOfTestRuns += 1;
    }

    //Prime the buffer again if need be.
    if(requestBufferUpdate){
      //Presumes the buffer is within range of the next time object
      self.initialTime = new Date(time.getTime());
      self.finalTime = new Date(time.getTime() + self.interpolationLengthInSeconds * 1000.0 * self.timeMultiplier);
      self.bufferedTime = new Date(self.finalTime.getTime() + self.interpolationLengthInSeconds * 1000.0 * self.timeMultiplier);

      self.primeBuffer();
    }

    //Return this object the values acquired
    return interpolatedValues;
  };

  this.primeBuffer = async function(){
    //Change the adynamic sky function to five minutes after the final time
    var skytime_0 = self.skyDataFromTime(self.finalTime);
    var skytime_f = self.skyDataFromTime(self.bufferedTime);
    self.dynamicSkyObjectAt_t_0.update(skytime_0);
    self.dynamicSkyObjectAt_t_f.update(skytime_f);

    //create new interpolations for all the functions in the linear interpolations list
    //Note that we cannot buffer anything that isn't in current.
    for(var name in self.currentInterpolations) {
      //Create buffered interpolations for use in the next go round
      if(self.currentInterpolations[name].callback){
        self.currentInterpolations[name].setFunction(name, self.currentInterpolations[name].objectPath, true, self.currentInterpolations[name].callback);
      }
      else{
        self.currentInterpolations[name].setFunction(name, self.currentInterpolations[name].objectPath, true);
      }
    }

    self.bufferHasRunForTesting = true;
  };

  //Prepare our function before we initialize everything.
  this.timeMultiplier = timeMultiplier;
  this.interpolationLengthInSeconds = interpolationLengthInSeconds;
  this.interpolationCount = 1;
  this.initializationTime = initializationTime;
  this.initializationMilliseconds = initializationTime.getTime();
  this.initialTime =new Date(initializationTime.getTime());
  this.finalTime = new Date(initializationTime.getTime() + interpolationLengthInSeconds * this.timeMultiplier * 1000.0);
  this.bufferedTime = new Date(initializationTime.getTime() + interpolationLengthInSeconds * this.timeMultiplier * 2000.0);

  //Clone our dynamic sky object for the purposes of linear interpolation
  //And set them to the initial and final time with all other variables
  //held constant...
  this.skyDataObjectString = JSON.stringify(originalSkyData);

  this.dynamicSkyObjectAt_t_0 = cloner.deep.copy(dynamicSkyObject);
  this.dynamicSkyObjectAt_t_0.update(this.skyDataFromTime(this.initialTime));
  this.dynamicSkyObjectAt_t_f = cloner.deep.copy(dynamicSkyObject);
  this.dynamicSkyObjectAt_t_f.update(this.skyDataFromTime(this.finalTime));

  this.currentInterpolations = {};
  this.bufferedInterpolations = {};

  self.numberOfTestRuns = 1;
  self.bufferHasRunForTesting = false;
}
