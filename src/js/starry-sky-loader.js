function StarrySkyLoader(starrySkyComponent){
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
  let self = this;

  //This is the function that gets called each time our data loads.
  //In the event that we have loaded everything the number of tags should
  //equal the number of events.
  let checkIfNeedsToLoadSkyData = function(){
    self.skyDataSetsLoaded += 1;
    if(self.skyDataSetsLoaded >= self.skyDataSetsLength){
      self.loadSkyData();
    }
  };

  if(skyLocationTags.length === 1){
    this.skyLocationTag = skyLocationTags[0];
    this.hasSkyLocationTag = true;
    if(this.skyLocationTag.skyDataLoaded){
      checkIfNeedsToLoadSkyData();
    }
    else{
      this.skyLocationTag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }
  if(skyTimeTags.length === 1){
    this.skyTimeTag = skyTimeTags[0];
    this.hasSkyTimeTag = true;
    if(this.skyTimeTag.skyDataLoaded){
      checkIfNeedsToLoadSkyData();
    }
    else{
      this.skyTimeTag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }
  if(skyParametersTags.length === 1){
    this.skyParametersTag = skyParametersTags[0];
    this.hasSkyParametersTag = true;
    if(this.skyParametersTag.skyDataLoaded){
      checkIfNeedsToLoadSkyData();
    }
    else{
      this.skyParametersTag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }
  if(skyAssetsTags.length === 1){
    this.skyAssetsTag = skyAssetsTags[0];
    this.hasSkyAssetsTag = true;
    if(this.skyAssetsTag.skyDataLoaded){
      checkIfNeedsToLoadSkyData();
    }
    else{
      this.skyParametersTag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }
  if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
    this.loadSkyData();
  }
};

StarrySkyLoader.prototype.loadSkyData = function(){
  //Now that we have verified our tags, let's grab the first one in each.
  let defaultValues = this.starrySkyComponent.defaultValues;
  let skyLocationData = this.hasSkyLocationTag ? this.skyLocationTag.data : defaultValues.location;
  let skyTimeData = this.hasSkyTimeTag ? this.skyTimeTag.data : defaultValues.time;
  let skyParametersData = this.hasSkyParametersTag ? this.skyParametersTag.data : defaultValues.parameters;
  let skyAssetsData = this.hasSkyAssetsTag ? this.skyAssetsTag.data : defaultValues.assets;

  //Location
  this.latitude = skyLocationData.latitude;
  this.longitude = skyLocationData.longitude;

  //Time
  let skyTimeTag
  this.date = skyTimeData.date;
  this.utcOffset = skyTimeData.utcOffset;
  this.timeMultiplier = skyTimeData.timeMultiplier;

  //Sky Parameters
  let skyParametersTag;
  this.luminance = skyParametersData.luminance;
  this.mieCoefficient = skyParametersData.mieCoefficient;
  this.mieDirectionalG = skyParametersData.mieDirectionalG;
  this.rayleigh = skyParametersData.rayleigh;
  this.turbidity = skyParametersData.turbidity;

  //Asset Locations
  let skyAssetsTag;
  this.moonImgSrc = skyAssetsData.moonTexture;
  this.moonNormalSrc = skyAssetsData.moonNormalTexture;
  this.starDataBlobSrc = skyAssetsData.starBinaryData;

  //Proceed on to load all of our assets from the webpage.
  this.loadAssets();
};

StarrySkyLoader.prototype.loadAssets = function(){
    //------------------------
    //Load our moon images
    //------------------------

    //------------------------
    //Load our the star location data binary blob
    //------------------------

    this.initializeSkyEngine();
}

StarrySkyLoader.prototype.initializeSkyEngine = function(){
  //------------------------
  //Initialize the state of our sky
  //------------------------


  //------------------------
  //Construct our atmosphere dome
  //------------------------

  //------------------------
  //Construct our star dome
  //------------------------

  //------------------------
  //Construct our astronomical body particles, moon, sun, planets
  //------------------------
}

StarrySkyLoader.prototype.tick = function(){
  //Check if any of our sky variables need updating and if so, grab them on a new web worker

  //Else run our SLERPs for each of our planetary bodies and the star dome

  //Construct color intensities

  //Construct masks

};

StarrySkyLoader.prototype.tock = function(){
  //Implement bloom

  //Implement god rays

  //Convert from HDR image to RGB image and merge

  //Draw this as the background texture for our screen.

};
