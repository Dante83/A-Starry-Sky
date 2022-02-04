import RGBAFormat, LuminanceFormat, sRGBEncoding, LinearEncoding, LinearMipmapLinear,
Linear, ClampToEdgeWrapping, LinearFilter, NearestFilter, TextureLoader, RepeatWrapping,
CubeTextureLoader from THREE;
import StellarLUTLibrary from '../lut_libraries/StellarLUTLibrary.js'

export default class AssetManager{
  constructor(skyDirector){
    this.data = {};
    this.images = {
      moonImages: {},
      starImages: {},
      blueNoiseImages: {},
      solarEclipseImage: null
    };
    this.hasLoadedImages = false;

    //Internal variables
    this.skyDataSetsLength = 0;
    this.numberOfTexturesLoaded = 0;
    this.totalNumberOfTextures = 0;
    this.skyDirector = skyDirector;
  }

  init(){
    const skyDirector = this.skyDirector;
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
    let skyLocationTag;
    let skyTimeTag;
    let skyAtmosphericParametersTag;
    let skyLightingTag;
    let loadSkyDataHasNotRun = true;
    const activeTags = [];
    if(skyLocationTags.length === 1){
      ++this.skyDataSetsLength;
      skyLocationTag = skyLocationTags[0];
      activeTags.push(skyLocationTag);
    }
    if(skyTimeTags.length === 1){
      ++this.skyDataSetsLength;
      skyTimeTag = skyTimeTags[0];
      activeTags.push(skyTimeTag);
    }
    if(skyAtmosphericParametersTags.length === 1){
      ++this.skyDataSetsLength;
      skyAtmosphericParametersTag = skyAtmosphericParametersTags[0];
      activeTags.push(skyAtmosphericParametersTag);
    }
    if(skyAssetsTags.length > 0){
      this.skyDataSetsLength += skyAssetsTags.length;
      activeTags.push(...skyAssetsTags);
    }
    if(skyLightingTags.length === 1){
      ++this.skyDataSetsLength;
      skyLightingTag = skyLightingTags[0];
      activeTags.push(skyLightingTag);
    }
    for(activeTag of activeTags){
      this.checkIfAllHTMLDataLoaded(activeTag);
    }

    if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
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
    //Reference for easier coding
    const skyDirector = this.skyDirector;
    const renderers = skyDirector.renderers;

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
    this.totalNumberOfTextures = numberOfMoonTextures + numberOfStarTextures + numberOfBlueNoiseTextures + oneSolarEclipseImage;

    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    for(let i = 0; i < numberOfMoonTextures; ++i){
      const texturePromise = new Promise(function(resolve, reject){
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
        this.images.moonImages[moonTextures[i]] = texture;

        //If the renderer already exists, go in and update the uniform
        if(renderers?.moonRenderer !== undefined){
          const textureRef = renderers.moonRenderer.baseMoonVar.uniforms[moonTextures[i]];
          textureRef.value = texture;
          textureRef.needsUpdate = true;
        }

        this.numberOfTexturesLoaded++;
        if(this.numberOfTexturesLoaded === this.totalNumberOfTextures){
          this.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    }

    //Load our star color LUT
    const texturePromise = new Promise(function(resolve, reject){
      textureLoader.load(StarrySky.assetPaths.starColorMap, (texture)=>{resolve(texture);});
    });
    texturePromise.then(function(texture){
      //Fill in the details of our texture
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.magFilter = LinearFilter;
      texture.minFilter = LinearFilter;
      texture.encoding = LinearEncoding;
      texture.format = RGBAFormat;
      texture.generateMipmaps = true;
      this.images.starImages.starColorMap = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(skyDirector?.renderers?.moonRenderer !== undefined){
        renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starColorMap.value = texture;
        moonRenderer.baseMoonVar.material.uniforms.starColorMap.value = texture;
      }

      this.numberOfTexturesLoaded++;
      if(this.numberOfTexturesLoaded === this.totalNumberOfTextures){
        this.hasLoadedImages = true;
      }
    }, function(err){
      console.error(err);
    });

    //Set up our star hash cube map
    const loader = new CubeTextureLoader();
    const texturePromise2 = new Promise(function(resolve, reject){
      loader.load(StarrySky.assetPaths.starHashCubemap, (cubemap)=>{resolve(cubemap);});
    });
    texturePromise2.then(function(cubemap){
      //Make sure that our cubemap is using the appropriate settings
      cubemap.magFilter = NearestFilter;
      cubemap.minFilter = NearestFilter;
      cubemap.format = RGBAFormat;
      cubemap.encoding = LinearEncoding;
      cubemap.generateMipmaps = false;

      this.numberOfTexturesLoaded++;
      if(this.numberOfTexturesLoaded === this.totalNumberOfTextures){
        this.hasLoadedImages = true;
      }
      this.images.starImages.starHashCubemap = cubemap;

      if(this.skyDirector?.renderers?.moonRenderer !== undefined){
        const atmosphereCubemapRef = this.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starHashCubemap;
        atmosphereCubemapRef.value = cubemap;

        const moonCubemapRef = this.renderers.moonRenderer.baseMoonVar.material.uniforms.starHashCubemap;
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
    for(let i = 0; i < 4; ++i){
      const texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.dimStarDataMaps[i], (texture)=>{resolve(texture);});
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

        numberOfDimStarChannelsLoaded++;
        if(numberOfDimStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          skyDirector.stellarLUTLibrary.dimStarMapPass(dimStarChannelImages.r, dimStarChannelImages.g, dimStarChannelImages.b, dimStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(this.skyDirector?.renderers?.moonRenderer !== undefined){
            renderers.atmosphereRenderer.atmosphereMaterial.uniforms.dimStarData.value = skyDirector.stellarLUTLibrary.dimStarDataMap;
            renderers.moonRenderer.baseMoonVar.material.uniforms.dimStarData.value = skyDirector.stellarLUTLibrary.dimStarDataMap;
          }

          this.numberOfTexturesLoaded++;
          if(this.numberOfTexturesLoaded === this.totalNumberOfTextures){
            this.hasLoadedImages = true;
          }
        }
      }, function(err){
        console.error(err);
      });
    }

    //Load all of our bright star data maps
    let numberOfMedStarChannelsLoaded = 0;
    const medStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    for(let i = 0; i < 4; ++i){
      const texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.medStarDataMaps[i], (texture)=>{resolve(texture);});
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
            renderers.atmosphereRenderer.atmosphereMaterial.uniforms.medStarData.value = skyDirector.stellarLUTLibrary.medStarDataMap;
            renderers.moonRenderer.baseMoonVar.material.uniforms.medStarData.value = skyDirector.stellarLUTLibrary.medStarDataMap;
          }

          this.numberOfTexturesLoaded++;
          if(this.numberOfTexturesLoaded === this.totalNumberOfTextures){
            this.hasLoadedImages = true;
          }
        }
      }, function(err){
        console.error(err);
      });
    }

    //Load all of our bright star data maps
    let numberOfBrightStarChannelsLoaded = 0;
    const brightStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    for(let i = 0; i < 4; ++i){
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

        numberOfBrightStarChannelsLoaded++;
        if(numberOfBrightStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          skyDirector.stellarLUTLibrary.brightStarMapPass(brightStarChannelImages.r, brightStarChannelImages.g, brightStarChannelImages.b, brightStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(skyDirector?.renderers?.moonRenderer !== undefined){
            const atmosphereTextureRef = renderers.atmosphereRenderer.atmosphereMaterial.uniforms.brightStarData;
            atmosphereTextureRef.value = skyDirector.stellarLUTLibrary.brightStarDataMap;

            const moonTextureRef = renderers.moonRenderer.baseMoonVar.material.uniforms.brightStarData;
            moonTextureRef.value = skyDirector.stellarLUTLibrary.brightStarDataMap;
          }

          this.numberOfTexturesLoaded++;
          if(this.numberOfTexturesLoaded === this.totalNumberOfTextures){
            this.hasLoadedImages = true;
          }
        }
      }, function(err){
        console.error(err);
      });
    }

    //Load blue noise textures
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    for(let i = 0; i < numberOfBlueNoiseTextures; ++i){
      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths['blueNoiseMaps'][i], (texture)=>{resolve(texture);});
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
        this.images.blueNoiseImages[i] = texture;

        this.numberOfTexturesLoaded++;
        if(this.numberOfTexturesLoaded === this.totalNumberOfTextures){
          this.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    }

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
      this.images.solarEclipseImage = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(skyDirector?.renderers?.SunRenderer !== undefined){
        renderers.atmosphereRenderer.atmosphereMaterial.uniforms.solarEclipseMap.value = texture;
      }

      this.numberOfTexturesLoaded++;
      if(this.numberOfTexturesLoaded === this.totalNumberOfTextures){
        this.hasLoadedImages = true;
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
      ++this.skyDataSetsLoaded;
      if(this.skyDataSetsLoaded >= this.skyDataSetsLength){
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
