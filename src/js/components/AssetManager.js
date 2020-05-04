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
  this.hasLoadedImages = false;
  this.readyForTickTock = false;
  this.tickSinceLastUpdateRequest = 5;
  let self = this;

  //Asynchronously load all of our images
  this.loadImageAssets = async function(renderer){
    self.textureLoader = new THREE.BasisTextureLoader();
    let useBasisTextures = true;
    textureLoader.setTranscoderPath(StarrySky.AssetPaths.basisTranscoder);
    try{
      textureLoader.detectSupport(renderer);
    }
    catch(error){
      //Replace it with a regular texture loader and just load our png files
      console.warn("BASIS file format not supported. Falling back to PNG files.");
      useBasisTextures = false;
      textureLoader.dispose();
      textureLoader = new THREE.TextureLoader();
    }

    //Load all of our moon textures
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonOpacityMap', 'moonSpecularMap', 'moonAOMap'];
    const formats = [THREE.RGBFormat, THREE.RGBFormat, THREE.RedFormat, THREE.RGBFormat, THREE.RedFormat];
    const numberOfMoonTextures = moonTextures.length;
    let totalNumberOfTextures = numberOfMoonTextures + 1; //An impossible task! But, maybe, one day we'll make this possible
    let numberOfTexturesLoaded = 0;
    let moonCallbackFunctions = [];
    let moonCallbackFunction = function(moonTextureProperty){
      this.moonTextureProperty = moonTextureProperty;
    };
    moonCallbackFunction.prototype.callback = function(texture){
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
    for(let i = 0; i < numberOfMoonTextures; ++i){
      let textureProperty = moonTextures[i];
      let textureURI = StarrySky.AssetPaths[textureProperty];
      if(!useBasisTextures){
        //Swap out our BASIS texture for a png texture
        textureURI = textureURI.slice(0, textureURI.length - 7).concat('.png');
      }

      //We create a new function, that comically can act as an object
      moonCallbackFunctions.push(
        new moonCallbackFunction(moonTextureProperty);
      );
      textureLoader.load(textureURI, moonCallbackFunctions[i].callback, undefined, function(err){
        if(useBasisTextures){
          const errorMsg = `An error occurred while trying to download an image: ${err}. Falling back to PNG loader.`;
          console.warning(errorMsg);
          throw new Error(errorMsg);
        }
      });
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
    //Remove our event listener for loading sky data from the DOM
    //and attach a new listener for loading all of our visual assets and data
    self.skyAssetsTags.removeEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);

    //Now that we have verified our tags, let's grab the first one in each.
    let defaultValues = self.starrySkyComponent.defaultValues;
    self.data.skyLocationData = self.hasSkyLocationTag ? self.skyLocationTag.data : defaultValues.location;
    self.data.skyTimeData = self.hasSkyTimeTag ? self.skyTimeTag.data : defaultValues.time;
    self.data.skyAtmosphericParameters = self.hasSkyAtmosphericParametersTag ? self.skyAtmosphericParametersTag.data : defaultValues.skyAtmosphericParameters;
    self.data.skyAssetsData = self.hasSkyAssetsTag ? self.skyAssetsTag.data : defaultValues.assets;

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
  if(skyAssetsTags.length > 0){
    this.skyDataSetsLength += 1;
    this.skyAssetsTags = skyAssetsTags;
    this.hasSkyAssetsTag = true;
    activeTags.push(this.skyAssetsTags);
  }
  for(let i = 0; i < activeTags.length; ++i){
    checkIfAllHTMLDataLoaded(activeTags[i]);
  }

  if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
    this.loadSkyData();
  }
};
