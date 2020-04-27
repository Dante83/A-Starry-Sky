StarrySky.AssetManager = function(skyDirector){
  this.skyDirector = skyDirector;
  this.data = {};
  this.images = {};
  let starrySkyComponent = skyDirector.parentComponent;

  //------------------------
  //Capture all the information from our child elements for our usage here.
  //------------------------
  //Get all of our tags
  let tagLists = [];
  let skyLocationTags = starrySkyComponent.el.getElementsByTagName('sky-location');
  tagLists.push(skyLocationTags);
  let skyTimeTags = starrySkyComponent.el.getElementsByTagName('sky-time');
  tagLists.push(skyTimeTags);
  let skyAtmosphericParametersTags = starrySkyComponent.el.getElementsByTagName('sky-atmospheric-parameters');
  tagLists.push(skyAtmosphericParametersTags);
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
  this.skyDataSetsLength = 0;
  this.skyLocationTag;
  this.hasSkyLocationTag = false;
  this.skyTimeTag;
  this.hasSkyTimeTag = false;
  this.skyAtmosphericParametersTag;
  this.hasSkyAtmosphericParametersTag = false;
  this.skyAssetsTag;
  this.hasSkyAssetsTag = false;
  this.readyForTickTock = false;
  this.tickSinceLastUpdateRequest = 5;
  let self = this;

  //Internal function for loading our sky data once the DOM is ready
  this.loadSkyData = function(){
    //Remove our event listener for loading sky data from the DOM
    //and attach a new listener for loading all of our visual assets and data
    self.skyAssetsTag.removeEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);

    //Now that we have verified our tags, let's grab the first one in each.
    let defaultValues = self.starrySkyComponent.defaultValues;
    self.data.skyLocationData = self.hasSkyLocationTag ? self.skyLocationTag.data : defaultValues.location;
    self.data.skyTimeData = self.hasSkyTimeTag ? self.skyTimeTag.data : defaultValues.time;
    self.data.skyAtmosphericParameters = self.hasSkyAtmosphericParametersTag ? self.skyAtmosphericParametersTag.data : defaultValues.skyAtmosphericParameters;
    self.data.skyAssetsData = self.hasSkyAssetsTag ? self.skyAssetsTag.data : defaultValues.assets;

    //Use the assets we have to load all of our asset images and populate the engine
    //TODO: Right now, we do not need any images
    skyDirector.assetManagerInitialized = true;
    skyDirector.initializeSkyDirectorWebWorker();
  };

  //This is the function that gets called each time our data loads.
  //In the event that we have loaded everything the number of tags should
  //equal the number of events.
  let checkIfNeedsToLoadSkyData = function(){
    self.skyDataSetsLoaded += 1;
    if(self.skyDataSetsLoaded >= self.skyDataSetsLength){
      self.loadSkyData();
    }
  };

  //Closure to simplify our code below to avoid code duplication.
  function checkIfAllHTMLDataLoaded(tag){
    if(!tag.skyDataLoaded || !checkIfNeedsToLoadSkyData()){
      //Tags still yet exist to be loaded? Add a listener for the next event
      tag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }

  let activeTags = [];
  if(skyLocationTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyLocationTag = skyLocationTags[0];
    this.hasSkyLocationTag = true;
    hasSkyDataLoadedEventListener = false;
    activeTags.push(this.skyLocationTag);
  }
  if(skyTimeTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyTimeTag = skyTimeTags[0];
    this.hasSkyTimeTag = true;
    activeTags.push(this.skyTimeTag);
  }
  if(skyAtmosphericParametersTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyAtmosphericParametersTag = skyAtmosphericParametersTags[0];
    this.hasSkyAtmosphericParametersTag = true;
    activeTags.push(this.skyAtmosphericParametersTag);
  }
  if(skyAssetsTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyAssetsTag = skyAssetsTags[0];
    this.hasSkyAssetsTag = true;
    activeTags.push(this.skyAssetsTag);
  }
  for(let i = 0; i < activeTags.length; ++i){
    checkIfAllHTMLDataLoaded(activeTags[i]);
  }

  if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
    this.loadSkyData();
  }
};
