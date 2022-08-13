StarrySky.AssetManager = function(skyDirector){
  this.skyDirector = skyDirector;
  this.data = {};
  this.images = {
    moonImages: {},
    starImages: {},
    blueNoiseImages: {},
    auroraImages: {},
    solarEclipseImage: null
  };
  const starrySkyComponent = skyDirector.parentComponent;

  //------------------------
  //Capture all the information from our child elements for our usage here.
  //------------------------
  //Get all of our tags
  let tagLists = [];
  const skyLocationTags = starrySkyComponent.el.getElementsByTagName('sky-location');
  tagLists.push(skyLocationTags);
  const skyTimeTags = starrySkyComponent.el.getElementsByTagName('sky-time');
  tagLists.push(skyTimeTags);
  const skyAtmosphericParametersTags = starrySkyComponent.el.getElementsByTagName('sky-atmospheric-parameters');
  tagLists.push(skyAtmosphericParametersTags);
  const skyLightingTags = starrySkyComponent.el.getElementsByTagName('sky-lighting');
  tagLists.push(skyLightingTags);
  const skyAuroraTags = starrySkyComponent.el.getElementsByTagName('sky-aurora');
  tagLists.push(skyAuroraTags);
  const skyCloudTags = starrySkyComponent.el.getElementsByTagName('sky-clouds');
  tagLists.push(skyCloudTags);
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
  this.skyLightingTag;
  this.hasSkyLightingTag = false;
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
    const numberOfStarTextures = 4;

    //Load all of our moon textures
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap', 'moonApertureSizeMap', 'moonApertureOrientationMap'];
    const numberOfMoonTextures = moonTextures.length;
    const numberOfBlueNoiseTextures = 5;
    const oneSolarEclipseImage = 1;
    const numberOfAuroraTextures = 1;
    this.totalNumberOfTextures = numberOfMoonTextures + numberOfStarTextures + numberOfBlueNoiseTextures + oneSolarEclipseImage + numberOfAuroraTextures;

    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewMoonTexturePromise(i){
      let next = i + 1;
      if(next < numberOfMoonTextures){
        createNewMoonTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths[moonTextures[i]], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.format = THREE.RGBAFormat;
        texture.type = THREE.FloatType;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.anisotropy = 4;
        texture.samples = 8;
        texture.generateMipmaps = true;
        texture.encoding = THREE.LinearEncoding;
        self.images.moonImages[moonTextures[i]] = texture;

        //If the renderer already exists, go in and update the uniform
        if(self.skyDirector?.renderers?.moonRenderer !== undefined){
          const textureRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms[moonTextures[i]];
          textureRef.value = texture;
        }

        self.numberOfTexturesLoaded += 1;
        if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load our star color LUT
    let texturePromise = new Promise(function(resolve, reject){
      textureLoader.load(StarrySky.assetPaths.starColorMap, function(texture){resolve(texture);});
    });
    texturePromise.then(function(texture){
      //Fill in the details of our texture
      texture.format = THREE.RGBAFormat;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.encoding = THREE.LinearEncoding;
      texture.type = THREE.FloatType;
      texture.generateMipmaps = true;
      //Swap this tomorrow and implement custom mip-maps
      self.images.starImages.starColorMap = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(self.skyDirector?.renderers?.moonRenderer !== undefined){
        const atmosphereTextureRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starColorMap;
        atmosphereTextureRef.value = texture;

        const moonTextureRef = skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.starColorMap;
        moonTextureRef.value = texture;
      }

      self.numberOfTexturesLoaded += 1;
      if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
        self.hasLoadedImages = true;
      }
    }, function(err){
      console.error(err);
    });

    //Set up our star hash cube map
    const loader = new THREE.CubeTextureLoader();

    let texturePromise2 = new Promise(function(resolve, reject){
      loader.load(StarrySky.assetPaths.starHashCubemap, function(cubemap){resolve(cubemap);});
    });
    texturePromise2.then(function(cubemap){
      //Make sure that our cubemap is using the appropriate settings
      cubemap.format = THREE.RGBAFormat;
      cubemap.magFilter = THREE.NearestFilter;
      cubemap.minFilter = THREE.NearestFilter;
      cubemap.encoding = THREE.LinearEncoding;
      cubemap.type = THREE.FloatType;

      self.numberOfTexturesLoaded += 1;
      if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
        self.hasLoadedImages = true;
      }
      self.images.starImages.starHashCubemap = cubemap;

      if(self.skyDirector?.renderers?.moonRenderer !== undefined){
        const atmosphereCubemapRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starHashCubemap;
        atmosphereCubemapRef.value = cubemap;

        const moonCubemapRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.starHashCubemap;
        moonCubemapRef.value = cubemap;
      }
    });

    //Load all of our dim star data maps
    let numberOfDimStarChannelsLoaded = 0;
    const channels = ['r', 'g', 'b', 'a'];
    const dimStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewDimStarTexturePromise(i){
      const next = i + 1;
      if(next < 4){
        createNewDimStarTexturePromise(next);
      }

      const texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.dimStarDataMaps[i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.format = THREE.RGBAFormat;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        dimStarChannelImages[channels[i]] = texture;

        numberOfDimStarChannelsLoaded += 1;
        if(numberOfDimStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          skyDirector.stellarLUTLibrary.dimStarMapPass(dimStarChannelImages.r, dimStarChannelImages.g, dimStarChannelImages.b, dimStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(self.skyDirector?.renderers?.moonRenderer !== undefined){
            const atmosphereTextureRef = skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.dimStarData;
            atmosphereTextureRef.value = skyDirector.stellarLUTLibrary.dimStarDataMap;

            const moonTextureRef = skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.dimStarData;
            moonTextureRef.value = skyDirector.stellarLUTLibrary.dimStarDataMap;
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
    let numberOfMedStarChannelsLoaded = 0;
    let medStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewMedStarTexturePromise(i){
      let next = i + 1;
      if(next < 4){
        createNewMedStarTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.medStarDataMaps[i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.format = THREE.RGBAFormat;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        medStarChannelImages[channels[i]] = texture;

        numberOfMedStarChannelsLoaded += 1;
        if(numberOfMedStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          skyDirector.stellarLUTLibrary.medStarMapPass(medStarChannelImages.r, medStarChannelImages.g, medStarChannelImages.b, medStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(skyDirector?.renderers?.moonRenderer !== undefined){
            const atmosphereTextureRef = skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.medStarData;
            atmosphereTextureRef.value = skyDirector.stellarLUTLibrary.medStarDataMap;

            const moonTextureRef = skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.medStarData;
            moonTextureRef.value = skyDirector.stellarLUTLibrary.medStarDataMap;
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
        texture.format = THREE.RGBAFormat;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        brightStarChannelImages[channels[i]] = texture;

        numberOfBrightStarChannelsLoaded += 1;
        if(numberOfBrightStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          const skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          skyDirector.stellarLUTLibrary.brightStarMapPass(brightStarChannelImages.r, brightStarChannelImages.g, brightStarChannelImages.b, brightStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(skyDirector?.renderers?.moonRenderer !== undefined){
            const atmosphereTextureRef = skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.brightStarData;
            atmosphereTextureRef.value = skyDirector.stellarLUTLibrary.brightStarDataMap;

            const moonTextureRef = skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.brightStarData;
            moonTextureRef.value = skyDirector.stellarLUTLibrary.brightStarDataMap;
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

    //Load blue noise textures
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewBlueNoiseTexturePromise(i){
      let next = i + 1;
      if(next < numberOfBlueNoiseTextures){
        createNewBlueNoiseTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths['blueNoiseMaps'][i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.format = THREE.RGBAFormat;
        texture.generateMipmaps = true;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        self.images.blueNoiseImages[i] = texture;

        self.numberOfTexturesLoaded += 1;
        if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load aurora textures
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewAuroraTexturePromise(i){
      let next = i + 1;
      if(next < numberOfAuroraTextures){
        createNewAuroraTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths['auroraMaps'][i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.format = THREE.RGBAFormat;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        self.images.auroraImages[i] = texture;

        self.numberOfTexturesLoaded += 1;
        if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    let solarEclipseTexturePromise = new Promise(function(resolve, reject){
      textureLoader.load(StarrySky.assetPaths.solarEclipseMap, function(texture){resolve(texture);});
    });
    solarEclipseTexturePromise.then(function(texture){
      //Fill in the details of our texture
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.encoding = THREE.LinearEncoding;
      texture.type = THREE.FloatType;
      self.images.solarEclipseImage = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(self.skyDirector?.renderers?.SunRenderer !== undefined){
        const atmosphereTextureRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.solarEclipseMap;
        atmosphereTextureRef.value = texture;
      }

      self.numberOfTexturesLoaded += 1;
      if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
        self.hasLoadedImages = true;
      }
    }, function(err){
      console.error(err);
    });

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
      self.data.skyLighting = self.hasSkyLightingTag ? self.skyLightingTag.data : defaultValues.lighting;
      self.data.skyAurora = self.hasAuroraTag ? self.skyAuroraTag.data : defaultValues.skyAurora;
      self.data.skyCloud = self.hasCloudTag ? self.skyCloudTag.data : defaultValues.skyCloud;
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
  if(skyLightingTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyLightingTag = skyLightingTags[0];
    this.hasSkyLightingTag = true;
    activeTags.push(this.skyLightingTag);
  }
  if(skyAuroraTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyAuroraTag = skyAuroraTags[0];
    this.hasAuroraTag = true;
    activeTags.push(this.skyAuroraTag);
  }
  if(skyCloudTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyCloudTag = skyCloudTags[0];
    this.hasCloudTag = true;
    activeTags.push(this.skyCloudTag);
  }
  for(let i = 0; i < activeTags.length; ++i){
    checkIfAllHTMLDataLoaded(activeTags[i]);
  }

  if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
    this.loadSkyData();
  }
};
