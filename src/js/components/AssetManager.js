StarrySky.AssetManager = function(skyDirector){
  this.skyDirector = skyDirector;
  this.data = {};
  this.images = {
    moonImages: {},
    stellarImages: {}
  };
  const starrySkyComponent = skyDirector.parentComponent;

  //------------------------
  //Capture all the information from our child elements for our usage here.
  //------------------------
  //Get all of our tags
  var tagLists = [];
  const skyLocationTags = starrySkyComponent.el.getElementsByTagName('sky-location');
  tagLists.push(skyLocationTags);
  const skyTimeTags = starrySkyComponent.el.getElementsByTagName('sky-time');
  tagLists.push(skyTimeTags);
  const skyAtmosphericParametersTags = starrySkyComponent.el.getElementsByTagName('sky-atmospheric-parameters');
  tagLists.push(skyAtmosphericParametersTags);
  tagLists.forEach(function(tags){
    if(tags.length > 1){
      console.error(`The <a-starry-sky> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
    }
  });
  //These are excluded from our search above :D
  const skyAssetsTags = starrySkyComponent.el.getElementsByTagName('sky-assets-dir');

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
  this.loadSkyDataHasNotRun = true;
  this.tickSinceLastUpdateRequest = 5;
  const self = this;

  //Asynchronously load all of our images because, we don't care about when these load
  this.loadImageAssets = async function(renderer){
    //Just use our THREE Texture Loader for now
    const textureLoader = new THREE.TextureLoader();

    //Load all of our moon textures
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap', 'moonAperatureSizeMap', 'moonAperatureOrientationMap'];
    const moonFormats = [THREE.RGBAFormat, THREE.RGBFormat, THREE.LuminanceFormat, THREE.LuminanceFormat, THREE.RGBFormat];
    const moonEncodings = [THREE.sRGBEncoding, THREE.LinearEncoding, THREE.LinearEncoding, THREE.LinearEncoding, THREE.LinearEncoding];
    const starTextuers = ['stellarData1', 'stellarData2'];
    const numberOfMoonTextures = moonTextures.length;
    const numberOfStellarDataSets = 2;
    const numberOfStellarTextures = starTextures.length;
    const totalNumberOfTextures = numberOfMoonTextures + numberOfStellarDataSets;
    let numberOfTexturesLoaded = 0;

    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewTexturePromise(i){
      let next = i + 1;
      if(next < totalNumberOfTextures){
        createNewTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths[moonTextures[i]], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.encoding = moonEncodings[i];
        texture.format = moonFormats[i];
        //Swap this tomorrow and implement custom mip-maps
        texture.generateMipmaps = true;
        self.images.moonImages[moonTextures[i]] = texture;

        //If the renderer already exists, go in and update the uniform
        if(self.skyDirector?.renderers?.moonRenderer !== undefined){
          const textureRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms[moonTextures[i]];
          textureRef.value = texture;
          textureRef.needsUpdate = true;
        }

        numberOfTexturesLoaded += 1;
        if(numberOfTexturesLoaded === totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load and unzip our star data
    (async function createNewStarDataLoaderPromise(i){
      let next = i + 1;
      const StellarDataSet = i + 1;
      if(next < numberOfStellarDataSets){
      createNewStarDataLoaderPromise(next);
      }

      let httpRequest = new XMLHttpRequest();
      httpRequest.open("GET", StarrySky.assetPaths.stellarPositionData[i], false);
      httpRequest.onreadystatechange = function (){
        if(httpRequest.readyState === 4){
          if(httpRequest.status === 200 || httpRequest.status == 0){
            const inflatedBinaryBlob = pako.inflate(httpRequest.responseText);
            const floatArrayView = new Float32Array(inflatedBinaryBlob);

            //Convert our float array into a data texture
            let dataTexture = new THREE.DataTexture(
              floatArrayView,
              1024,
              1024,
              THREE.RGBAFormat,
              ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType,
              THREE.RepeatWrapping,
              THREE.ClampToEdgeWrapping,
              THREE.NearestFilter,
              THREE.NearestFilter
            );
            dataTexture.needsUpdate = true;
            self.images.stellarImages[`stellarData${StarDataSet}`] = texture;

            //If the renderer already exists, go in and update the uniform
            if(self.skyDirector?.renderers?.atmosphereRenderer !== undefined){
              const textureRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms[`stellarData${StarDataSet}`];
              textureRef.value = texture;
              textureRef.needsUpdate = true;
            }

            numberOfTexturesLoaded += 1;
            if(numberOfTexturesLoaded === totalNumberOfTextures){
              self.hasLoadedImages = true;
            }
          }
          else{
            console.error(`The request for starry sky data returned an HTTP status of ${httpRequest.status}`);
          }
        }
      }
      httpRequest.send();
    })(0);

    //Load any additional textures
  }

  //Internal function for loading our sky data once the DOM is ready
  this.loadSkyData = function(){
    if(self.loadSkyDataHasNotRun){
      //Don't run this twice
      self.loadSkyDataHasNotRun = false;

      //Now that we have verified our tags, let's grab the first one in each.
      const defaultValues = self.starrySkyComponent.defaultValues;
      self.data.skyLocationData = self.hasSkyLocationTag ? self.skyLocationTag.data : defaultValues.location;
      self.data.skyTimeData = self.hasSkyTimeTag ? self.skyTimeTag.data : defaultValues.time;
      self.data.skyAtmosphericParameters = self.hasSkyAtmosphericParametersTag ? self.skyAtmosphericParametersTag.data : defaultValues.skyAtmosphericParameters;
      self.data.skyAssetsData = self.hasSkyAssetsTag ? StarrySky.assetPaths : StarrySky.DefaultData.skyAssets;
      self.loadImageAssets(self.skyDirector.renderer);

      skyDirector.assetManagerInitialized = true;
      skyDirector.initializeSkyDirectorWebWorker();
    }
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
