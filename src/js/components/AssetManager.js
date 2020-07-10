StarrySky.AssetManager = function(skyDirector){
  this.skyDirector = skyDirector;
  this.data = {};
  this.images = {
    moonImages: {},
    starImages: {}
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
  this.numberOfTexturesLoaded = 0;
  this.totalNumberOfTextures;
  const self = this;

  //Asynchronously load all of our images because, we don't care about when these load
  this.loadImageAssets = async function(renderer){
    //Just use our THREE Texture Loader for now
    const textureLoader = new THREE.TextureLoader();

    //The amount of star texture data
    const numberOfStarTextures = 3;

    //Load all of our moon textures
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap', 'moonAperatureSizeMap', 'moonAperatureOrientationMap'];
    const moonFormats = [THREE.RGBAFormat, THREE.RGBFormat, THREE.LuminanceFormat, THREE.LuminanceFormat, THREE.RGBFormat];
    const moonEncodings = [THREE.sRGBEncoding, THREE.LinearEncoding, THREE.LinearEncoding, THREE.LinearEncoding, THREE.LinearEncoding];
    const numberOfMoonTextures = moonTextures.length;
    this.totalNumberOfTextures = numberOfMoonTextures + numberOfStarTextures;

    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewMoonTexturePromise(i){
      let next = i + 1;
      if(next < numberOfMoonTextures){
        createNewMoonTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        console.log(StarrySky.assetPaths[moonTextures[i]]);
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

        self.numberOfTexturesLoaded += 1;
        if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Set up our star hash cube map
    const loader = new THREE.CubeTextureLoader();

    let texturePromise2 = new Promise(function(resolve, reject){
      loader.load([
        'assets/star_data/webp_files/star-dictionary-cubemap-px.webp',
        'assets/star_data/webp_files/star-dictionary-cubemap-nx.webp',
        'assets/star_data/webp_files/star-dictionary-cubemap-py.webp',
        'assets/star_data/webp_files/star-dictionary-cubemap-ny.webp',
        'assets/star_data/webp_files/star-dictionary-cubemap-pz.webp',
        'assets/star_data/webp_files/star-dictionary-cubemap-nz.webp',
      ], function(texture){resolve(texture);});
    });
    texturePromise2.then(function(texture){
      self.numberOfTexturesLoaded += 1;
      self.images.starImages.starHashCubemap = texture;

      if(self.skyDirector?.renderers?.moonRenderer !== undefined){
        console.log("Loaded?");
          let moonCubemapRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starHashCubemap;
          moonCubemapRef.value = cubemap;
          moonCubemapRef.needsUpdate = true;

          let atmosphereCubemapRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms.starHashCubemap;
          atmosphereCubemapRef.value = cubemap;
          atmosphereCubemapRef.needsUpdate = true;
      }
    });

    // let cubemapLoader = new THREE.CubeTextureLoader();
    //
    //
    //
    // starHashCubemap = cubemapLoader.load([
    //   'http://localhost:8080/examples/assets/star_data/png_files/star-dictionary-cubemap-px.png',
    //   'http://localhost:8080/examples/assets/star_data/png_files/star-dictionary-cubemap-nx.png',
    //   'http://localhost:8080/examples/assets/star_data/png_files/star-dictionary-cubemap-py.png',
    //   'http://localhost:8080/examples/assets/star_data/png_files/star-dictionary-cubemap-ny.png',
    //   'http://localhost:8080/examples/assets/star_data/png_files/star-dictionary-cubemap-pz.png',
    //   'http://localhost:8080/examples/assets/star_data/png_files/star-dictionary-cubemap-nz.png'
    // ]);

    // cubemapStarHashPromise.then(function(cubemap){
    //   console.log(cubemap);
    //   console.log("Cubemap loaded");
    //
    //   //Make sure that our cubemap is using the appropriate settings
    //   // cubemap.magFilter = THREE.NearestFilter;
    //   // cubemap.minFilter = THREE.NearestFilter;
    //   // cubemap.format = THREE.RGBFormat;
    //   // cubemap.encoding = THREE.LinearEncoding;
    //   // cubemap.generateMipmaps = false;
    //
    //   //And send it off as a uniform for our atmospheric renderer
    //   self.images.starImages.starHashCubemap = cubemap;
    //   if(self.skyDirector?.renderers?.moonRenderer !== undefined){
    //     const cubemapRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms.starHashCubemap;
    //     cubemapRef.value = cubemap;
    //     cubemapRef.needsUpdate = true;
    //   }
    //
    //   if(self.skyDirector?.renderers?.atmosphereRenderer !== undefined){
    //     const cubemapRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starHashCubemap;
    //     cubemapRef.value = cubemap;
    //     cubemapRef.needsUpdate = true;
    //   }
    //
    //   self.numberOfTexturesLoaded += 1;
    //   if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
    //     self.hasLoadedImages = true;
    //   }
    // });

    //Load all of our dim star data maps
    let numberOfDimStarChannelsLoaded = 0;
    const channels = ['r', 'g', 'b', 'a'];
    let dimStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewDimStarTexturePromise(i){
      let next = i + 1;
      if(next < 4){
        createNewDimStarTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.dimStarDataMaps[i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.RGBAFormat;
        texture.format = THREE.LinearEncoding;
        texture.generateMipmaps = false;
        dimStarChannelImages[channels[i]] = texture;

        numberOfDimStarChannelsLoaded += 1;
        if(numberOfDimStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          let floatingPointTexture = skyDirector.stellarLUTLibrary.starMapPass(128, 64, dimStarChannelImages.r, dimStarChannelImages.g, dimStarChannelImages.b, dimStarChannelImages.a, 'dimStarData');

          //And send it off as a uniform for our atmospheric renderer
          self.images.starImages.dimStarData = floatingPointTexture;
          if(self.skyDirector?.renderers?.moonRenderer !== undefined){
            const textureRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms.dimStarData;
            textureRef.value = floatingPointTexture;
            textureRef.needsUpdate = true;
          }

          if(self.skyDirector?.renderers?.atmosphereRenderer !== undefined){
            const textureRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.dimStarData;
            textureRef.value = floatingPointTexture;
            textureRef.needsUpdate = true;
          }

          self.numberOfTexturesLoaded += 1;
          if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
            self.hasLoadedImages = true;
          }
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load all of our bright star data maps
    let numberOfBrightStarChannelsLoaded = 0;
    let brightStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewBrightStarTexturePromise(i){
      let next = i + 1;
      if(next < 4){
        createNewBrightStarTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.brightStarDataMaps[i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.RGBAFormat;
        texture.format = THREE.LinearEncoding;
        texture.generateMipmaps = false;
        brightStarChannelImages[channels[i]] = texture;

        numberOfBrightStarChannelsLoaded += 1;
        if(numberOfBrightStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          let floatingPointTexture = skyDirector.stellarLUTLibrary.starMapPass(64, 32, brightStarChannelImages.r, brightStarChannelImages.g, brightStarChannelImages.b, brightStarChannelImages.a, 'brightStarData');

          //And send it off as a uniform for our atmospheric renderer
          self.images.starImages.brightStarData = floatingPointTexture;
          if(self.skyDirector?.renderers?.moonRenderer !== undefined){
            const textureRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms.brightStarData;
            textureRef.value = floatingPointTexture;
            textureRef.needsUpdate = true;
          }

          if(self.skyDirector?.renderers?.atmosphereRenderer !== undefined){
            const textureRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.brightStarData;
            textureRef.value = floatingPointTexture;
            textureRef.needsUpdate = true;
          }

          self.numberOfTexturesLoaded += 1;
          if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
            self.hasLoadedImages = true;
          }
        }
      }, function(err){
        console.error(err);
      });
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
