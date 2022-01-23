import RGBAFormat, LuminanceFormat, sRGBEncoding, LinearEncoding, LinearMipmapLinear,
Linear, ClampToEdgeWrapping, LinearFilter, NearestFilter, TextureLoader, RepeatWrapping,
CubeTextureLoader from THREE;
import StellarLUTLibrary from '../lut_libraries/StellarLUTLibrary.js'

export default class AssetManager{
  constructor(){
    this.data = {};
    this.images = {
      moonImages: {},
      starImages: {},
      blueNoiseImages: {},
      solarEclipseImage: null
    };
    this.hasLoadedImages = false;
  }

  init(skyDirector){
    const starrySkyComponent = skyDirector.parentComponent;

    //------------------------
    //Capture all the information from our child elements for our usage here.
    //------------------------
    //Get all of our tags
    const skyLocationTags = starrySkyComponent.el.getElementsByTagName('sky-location');
    const skyTimeTags = starrySkyComponent.el.getElementsByTagName('sky-time');
    const skyAtmosphericParametersTags = starrySkyComponent.el.getElementsByTagName('sky-atmospheric-parameters');
    ([skyLocationTags, skyTimeTags, skyAtmosphericParametersTags]).forEach(function(tags){
      if(tags.length > 1){
        console.error(`The <a-starry-sky> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
      }
    });
    const skyLightingTags = starrySkyComponent.el.getElementsByTagName('sky-lighting');
    const skyAssetsTags = starrySkyComponent.el.getElementsByTagName('sky-assets-dir');

    //Now grab each of or our elements and check for events.
    let skyDataSetsLoaded = 0;
    let skyDataSetsLength = 0;
    let skyLocationTag;
    let skyTimeTag;
    let skyAtmosphericParametersTag;
    let skyLightingTag;
    let loadSkyDataHasNotRun = true;
    let numberOfTexturesLoaded = 0;
    let totalNumberOfTextures;

    const activeTags = [];
    if(skyLocationTags.length === 1){
      ++skyDataSetsLength;
      skyLocationTag = skyLocationTags[0];
      hasSkyDataLoadedEventListener = false;
      activeTags.push(skyLocationTag);
    }
    if(skyTimeTags.length === 1){
      ++skyDataSetsLength;
      skyTimeTag = skyTimeTags[0];
      activeTags.push(skyTimeTag);
    }
    if(skyAtmosphericParametersTags.length === 1){
      ++skyDataSetsLength;
      skyAtmosphericParametersTag = skyAtmosphericParametersTags[0];
      activeTags.push(skyAtmosphericParametersTag);
    }
    if(skyAssetsTags.length > 0){
      skyDataSetsLength += skyAssetsTags.length;
      activeTags.push(...skyAssetsTags);
    }
    if(skyLightingTags.length === 1){
      ++skyDataSetsLength;
      skyLightingTag = skyLightingTags[0];
      activeTags.push(skyLightingTag);
    }
    for(activeTag of activeTags){
      this.checkIfAllHTMLDataLoaded(activeTag);
    }

    if(skyDataSetsLength === 0 || skyDataSetsLoaded === skyDataSetsLength){
      if(loadSkyDataHasNotRun){
        //Don't run this twice
        loadSkyDataHasNotRun = false;

        //Now that we have verified our tags, let's grab the first one in each.
        const defaultValues = starrySkyComponent.defaultValues;
        this.data.skyLocationData = skyLocationTags.length === 1 ? skyLocationTag.data : defaultValues.location;
        this.data.skyTimeData = skyTimeTags.length === 1 ? skyTimeTag.data : defaultValues.time;
        this.data.skyAtmosphericParameters = skyAtmosphericParametersTags.length === 1 ? skyAtmosphericParametersTag.data : defaultValues.skyAtmosphericParameters;
        this.data.skyLighting = skyLightingTags.length === 1 ? skyLightingTag.data : defaultValues.lighting;
        this.data.skyAssetsData = skyAssetsTags.length > 0 ? StarrySky.assetPaths : StarrySky.DefaultData.skyAssets;
        this.loadImageAssets(skyDirector.renderer);

        skyDirector.assetManagerInitialized = true;
        skyDirector.initializeSkyDirectorWebWorker();
      }
    }
  }

  loadImageAssets(renderer){
    //Just use our THREE Texture Loader for now
    const textureLoader = new TextureLoader();

    //The amount of star texture data
    const numberOfStarTextures = 4;

    //Load all of our moon textures
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap', 'moonApertureSizeMap', 'moonApertureOrientationMap'];
    const moonFormats = [RGBAFormat, RGBAFormat, LuminanceFormat, LuminanceFormat, RGBAFormat];
    const moonEncodings = [sRGBEncoding, LinearEncoding, LinearEncoding, LinearEncoding, LinearEncoding];
    const numberOfMoonTextures = moonTextures.length;
    const numberOfBlueNoiseTextures = 5;
    const oneSolarEclipseImage = 1;
    totalNumberOfTextures = numberOfMoonTextures + numberOfStarTextures + numberOfBlueNoiseTextures + oneSolarEclipseImage;

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
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.magFilter = Linear;
        texture.minFilter = LinearMipmapLinear;
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

    //Load our star color LUT
    let texturePromise = new Promise(function(resolve, reject){
      textureLoader.load(StarrySky.assetPaths.starColorMap, function(texture){resolve(texture);});
    });
    texturePromise.then(function(texture){
      //Fill in the details of our texture
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.magFilter = LinearFilter;
      texture.minFilter = LinearFilter;
      texture.encoding = LinearEncoding;
      texture.format = RGBAFormat;
      //Swap this tomorrow and implement custom mip-maps
      texture.generateMipmaps = true;
      self.images.starImages.starColorMap = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(skyDirector?.renderers?.moonRenderer !== undefined){
        const atmosphereTextureRef = skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starColorMap;
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
    const loader = new CubeTextureLoader();

    let texturePromise2 = new Promise(function(resolve, reject){
      loader.load(StarrySky.assetPaths.starHashCubemap, function(cubemap){resolve(cubemap);});
    });
    texturePromise2.then(function(cubemap){

      //Make sure that our cubemap is using the appropriate settings
      cubemap.magFilter = NearestFilter;
      cubemap.minFilter = NearestFilter;
      cubemap.format = RGBAFormat;
      cubemap.encoding = LinearEncoding;
      cubemap.generateMipmaps = false;

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
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.format = RGBAFormat;
        texture.encoding = LinearEncoding;
        texture.generateMipmaps = false;
        dimStarChannelImages[channels[i]] = texture;

        numberOfDimStarChannelsLoaded += 1;
        if(numberOfDimStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
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
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.format = RGBAFormat;
        texture.encoding = LinearEncoding;
        texture.generateMipmaps = false;
        medStarChannelImages[channels[i]] = texture;

        numberOfMedStarChannelsLoaded += 1;
        if(numberOfMedStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
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
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.format = RGBAFormat;
        texture.encoding = LinearEncoding;
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
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.magFilter = Linear;
        texture.minFilter = LinearMipmapLinear;
        texture.encoding = LinearEncoding;
        texture.format = RGBAFormat;
        texture.generateMipmaps = true;
        self.images.blueNoiseImages[i] = texture;

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
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.magFilter = LinearFilter;
      texture.minFilter = LinearMipmapLinear;
      texture.encoding = LinearEncoding;
      texture.format = LuminanceFormat;
      texture.generateMipmaps = true;
      self.images.solarEclipseImage = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(skyDirector?.renderers?.SunRenderer !== undefined){
        const atmosphereTextureRef = skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.solarEclipseMap;
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
  };

  checkIfAllHTMLDataLoaded(tag){
    //This is the function that gets called each time our data loads.
    //In the event that we have loaded everything the number of tags should
    //equal the number of events.
    let checkIfNeedsToLoadSkyData = (e = false) => {
      ++skyDataSetsLoaded;
      if(skyDataSetsLoaded >= skyDataSetsLength){
        if(!e || (e.nodeName.toLowerCase() !== "sky-assets-dir" || e.isRoot)){
          this.loadSkyData();
        }
      }
    };

    if(!tag.skyDataLoaded || !checkIfNeedsToLoadSkyData()){
      //Tags still yet exist to be loaded? Add a listener for the next event
      tag.addEventListener('Sky-Data-Loaded', (e) => checkIfNeedsToLoadSkyData(e));
    }
  }

  get data(){
    return this.data;
  }

  get images(){
    return this.images;
  }

  get hasLoadedImages(){
    return this.hasLoadedImages
  }
};
