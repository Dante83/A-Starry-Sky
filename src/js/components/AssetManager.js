StarrySky.AssetManager = function(skyDirector){
  this.skyDirector = skyDirector;
  this.data = {};
  this.images = {};
  this.textureLoader;
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
  tagLists.forEach(function(tags){
    if(tags.length > 1){
      console.error(`The <a-starry-sky> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
    }
  });
  //These are excluded from our search above :D
  let skyAssetsTags = starrySkyComponent.el.getElementsByTagName('sky-assets-dir');

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
  this.skyAssetsTags;
  this.hasSkyAssetsTag = false;
  this.hasLoadedImages = false;
  this.readyForTickTock = false;
  this.tickSinceLastUpdateRequest = 5;
  let self = this;

  //Asynchronously load all of our images
  this.loadImageAssets = async function(renderer){
    self.textureLoader = new THREE.BasisTextureLoader();
    let useBasisTextures = true;
    self.textureLoader.setTranscoderPath(self.data.skyAssetsData.basisTranscoder);
    try{
      self.textureLoader.detectSupport(renderer);
    }
    catch(err){
      //Replace it with a regular texture loader and just load our png files
      console.warn(err);
      console.warn("BASIS file format not supported. Falling back to PNG files.");
      useBasisTextures = false;
      self.textureLoader.dispose();
      self.textureLoader = new THREE.TextureLoader();
    }

    //Load all of our moon textures
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonOpacityMap', 'moonSpecularMap', 'moonAOMap'];
    const formats = [THREE.RGBFormat, THREE.RGBFormat, THREE.RedFormat, THREE.RGBFormat, THREE.RedFormat];
    const numberOfMoonTextures = moonTextures.length;
    let totalNumberOfTextures = numberOfMoonTextures + 1; //An impossible task! But, maybe, one day we'll make this possible
    let numberOfTexturesLoaded = 0;
    let moonCallbackFunctions = [];
    function MoonCallbackFunction(moonTextureProperty){
      this.moonTextureProperty = moonTextureProperty;
    };
    MoonCallbackFunction.prototype.callback = function(texture){
      //Callback when done
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.format = formats[this.moonTextureProperty];
      self.images[this.moonTextureProperty] = texture;

      //If the renderer already exists, go in and update the uniform
      if(self.skyDirector?.renderers?.moonRenderer !== undefined){
        let textureRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms[this.moonTextureProperty];
        textureRef.value = texture;
        textureRef.needsUpdate = true;
      }
      numberOfTexturesLoaded++;
      if(numberOfTexturesLoaded === totalNumberOfTextures){
        self.hasLoadedImages = true;
        self.textureLoader.dispose();
      }
    }
    for(let i = 0; i < 2; ++i){
      let textureProperty = moonTextures[i];
      let textureURI = StarrySky.assetPaths[textureProperty];
      if(!useBasisTextures){
        //Swap out our BASIS texture for a png texture
        textureURI = textureURI.slice(0, textureURI.length - 7).concat('.png');
      }

      //We create a new function, that comically can act as an object
      moonCallbackFunctions.push(new MoonCallbackFunction(textureProperty));
      try{
        let load = self.textureLoader.load(textureURI, moonCallbackFunctions[i].callback);
      }
      catch(err){
        if(useBasisTextures){
          useBasisTextures = false;
          self.textureLoader.dispose();
          self.textureLoader = new THREE.TextureLoader();
        }
        self.textureLoader.load(textureURI, moonCallbackFunctions[i].callback, undefined, function(err){
          console.error(err);
        });
      }
    };

    totalNumberOfTextures--; //The impossible is possible again!
    if(numberOfTexturesLoaded === totalNumberOfTextures){
      self.hasLoadedImages = true;

      //We need to hook into each of our textures and update their uniforms if the renderer exists
      if(self.skyDirector?.renderers?.moonRenderer !== undefined){
        for(let i = 0; i < moonTextures.length; ++i){
          let moonTextureProperty = moonTextures[i];
          let textureRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms[moonTextureProperty];
          textureRef.value = texture;
          textureRef.needsUpdate = true;
        }
      }

      self.textureLoader.dispose();
    }
  }

  //Internal function for loading our sky data once the DOM is ready
  this.loadSkyData = function(){
    //Now that we have verified our tags, let's grab the first one in each.
    let defaultValues = self.starrySkyComponent.defaultValues;
    self.data.skyLocationData = self.hasSkyLocationTag ? self.skyLocationTag.data : defaultValues.location;
    self.data.skyTimeData = self.hasSkyTimeTag ? self.skyTimeTag.data : defaultValues.time;
    self.data.skyAtmosphericParameters = self.hasSkyAtmosphericParametersTag ? self.skyAtmosphericParametersTag.data : defaultValues.skyAtmosphericParameters;
    self.data.skyAssetsData = self.hasSkyAssetsTag ? StarrySky.assetPaths : StarrySky.DefaultData.skyAssets;
    self.loadImageAssets(self.skyDirector.renderer);

    skyDirector.assetManagerInitialized = true;
    skyDirector.initializeSkyDirectorWebWorker();
  };

  //This is the function that gets called each time our data loads.
  //In the event that we have loaded everything the number of tags should
  //equal the number of events.
  let checkIfNeedsToLoadSkyData = function(e = false){
    self.skyDataSetsLoaded += 1;
    if(self.skyDataSetsLoaded >= self.skyDataSetsLength){
      if(!e || (e.nodeName.toLowerCase() !== "sky-assets-dir" || e.isRoot)){
        self.loadSkyData();
      }
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
  if(skyAssetsTags.length > 0){
    this.skyDataSetsLength += skyAssetsTags.length;
    this.skyAssetsTags = skyAssetsTags;
    this.hasSkyAssetsTag = true;
    for(let i = 0; i < skyAssetsTags.length; ++i){
      activeTags.push(skyAssetsTags[i]);
    }
  }
  for(let i = 0; i < activeTags.length; ++i){
    checkIfAllHTMLDataLoaded(activeTags[i]);
  }

  if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
    this.loadSkyData();
  }
};
