StarrySky.AssetLoader = function(starrySkyComponent){
  //------------------------
  //Capture all the information from our child elements for our usage here.
  //------------------------
  //Get all of our tags
  let tagLists = [];
  let skyLocationTags = starrySkyComponent.el.getElementsByTagName('sky-location');
  tagLists.push(skyLocationTags);
  let skyTimeTags = starrySkyComponent.el.getElementsByTagName('sky-time');
  tagLists.push(skyTimeTags);
  let skyParametersTags = starrySkyComponent.el.getElementsByTagName('sky-parameters');
  tagLists.push(skyParametersTags);
  let skyAssetsTags = starrySkyComponent.el.getElementsByTagName('sky-assets-dir');
  tagLists.push(skyAssetsTags);
  tagLists.forEach(function(tags){
    if(tags.length > 1){
      console.error(`The <a-starry-sky> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
    }
  });

  //Now grab each of or our elements and check for events.
  this.starrySkyComponent = starrySkyComponent;
  this.skyDataSetsLoaded = 0;
  this.skyDataSetsLength = tagLists.length;
  this.skyLocationTag;
  this.hasSkyLocationTag = false;
  this.skyTimeTag;
  this.hasSkyTimeTag = false;
  this.skyParametersTag;
  this.hasSkyParametersTag = false;
  this.skyAssetsTag;
  this.hasSkyAssetsTag = false;
  this.readyForTickTock = false;
  this.tickSinceLastUpdateRequest = 5;
  this.skyWorker = new Worker("../src/cpp/starry-sky-web-worker.js", { type: "module" });
  let self = this;

  //This is the function that gets called each time our data loads.
  //In the event that we have loaded everything the number of tags should
  //equal the number of events.
  let checkIfNeedsToLoadSkyData = function(){
    self.skyDataSetsLoaded += 1;
    if(self.skyDataSetsLoaded >= self.skyDataSetsLength){
      self.loadSkyData();
      return true;
    }
    return false;
  };

  if(skyLocationTags.length === 1){
    this.skyLocationTag = skyLocationTags[0];
    this.hasSkyLocationTag = true;
    if(this.skyLocationTag.skyDataLoaded && checkIfNeedsToLoadSkyData()){
      return true;
    }
    else{
      this.skyLocationTag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }
  if(skyTimeTags.length === 1){
    this.skyTimeTag = skyTimeTags[0];
    this.hasSkyTimeTag = true;
    if(this.skyTimeTag.skyDataLoaded && checkIfNeedsToLoadSkyData()){
      return true;
    }
    else{
      this.skyTimeTag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }
  if(skyParametersTags.length === 1){
    this.skyParametersTag = skyParametersTags[0];
    this.hasSkyParametersTag = true;
    if(this.skyParametersTag.skyDataLoaded && checkIfNeedsToLoadSkyData()){
      return true;
    }
    else{
      this.skyParametersTag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }
  if(skyAssetsTags.length === 1){
    this.skyAssetsTag = skyAssetsTags[0];
    this.hasSkyAssetsTag = true;
    if(this.skyAssetsTag.skyDataLoaded && checkIfNeedsToLoadSkyData()){
      return true;
    }
    else{
      this.skyParametersTag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }
  if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
    this.loadSkyData();
    return true;
  }

  return false;
};

StarrySky.AssetLoader.prototype.loadSkyData = function(){
  //Now that we have verified our tags, let's grab the first one in each.
  let defaultValues = this.starrySkyComponent.defaultValues;
  let skyLocationData = this.hasSkyLocationTag ? this.skyLocationTag.data : defaultValues.location;
  let skyTimeData = this.hasSkyTimeTag ? this.skyTimeTag.data : defaultValues.time;
  let skyParametersData = this.hasSkyParametersTag ? this.skyParametersTag.data : defaultValues.skyParameters;
  let skyAssetsData = this.hasSkyAssetsTag ? this.skyAssetsTag.data : defaultValues.assets;

  //Prepare a location for all of our data
  this.data = {};

  //Location
  this.data.location = {};
  this.data.location.latitude = skyLocationData.latitude;
  this.data.location.longitude = skyLocationData.longitude;

  //Time
  let skyTimeTag
  this.data.time = {};
  this.data.time.date = skyTimeData.date;
  this.data.time.utcOffset = skyTimeData.utcOffset;
  this.data.time.timeMultiplier = skyTimeData.timeMultiplier;

  //Sky Parameters
  let skyParametersTag;
  this.data.skyParameters = {};
  this.data.skyParameters.luminance = skyParametersData.luminance;
  this.data.skyParameters.mieCoefficient = skyParametersData.mieCoefficient;
  this.data.skyParameters.mieDirectionalG = skyParametersData.mieDirectionalG;
  this.data.skyParameters.rayleigh = skyParametersData.rayleigh;
  this.data.skyParameters.turbidity = skyParametersData.turbidity;
  this.data.skyParameters.numberOfRaySteps = skyParametersData.numberOfRaySteps;

  //Asset Locations
  let skyAssetsTag;
  this.data.skyAssets = {};
  this.data.skyAssets.moonImgSrc = skyAssetsData.moonTexture;
  this.data.skyAssets.moonNormalSrc = skyAssetsData.moonNormalTexture;
  this.data.skyAssets.starDataBlobSrc = skyAssetsData.starBinaryData;

  //Proceed on to load all of our assets from the webpage.
  this.loadAssets();
};

StarrySky.AssetLoader.prototype.loadAssets = function(){
  //Prepare our atmospheric LUT data
  let atmosphericLUT = StarrySky.AtmosphericLUTLibrary(this);

  //Load our sun texture

  //Load our moon textures

  //Load our star textures

  //Load our planet textures

  //All assets have been loaded. Request the first data set from our sky
  //this.initializeSkyWorker();
}

StarrySky.AssetLoader.prototype.EVENT_INITIALIZE = 0;
StarrySky.AssetLoader.prototype.EVENT_UPDATE = 1;
StarrySky.AssetLoader.prototype.initializeSkyWorker = function(){
  let self = this;

  //Initialize the state of our sky
  this.skyWorker.postMessage({
    eventType: self.EVENT_INITIALIZE,
    latitude: self.latitude,
    longitude: self.longitude,
    date: self.date,
    timeMultiplier: self.timeMultiplier,
    utcOffset: self.utcOffset
  });
};

StarrySky.AssetLoader.prototype.requestSkyUpdate = function(){
  let self = this;

  //Initialize the state of our sky
  this.skyWorker.postMessage({
    eventType: self.UPDATE,
    date: self.date
  });
};
