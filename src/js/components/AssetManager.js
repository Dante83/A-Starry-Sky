StarrySky.AssetManager = function(skyDirector){
  this.skyDirector = skyDirector;
  this.data = {};
  this.images = {
    moonImages: {},
    starImages: {},
    blueNoiseImages: {},
    auroraImages: {},
    milkyWayImages: {},
    haloImages: {},
    solarEclipseImage: null,
    eclipseShadowLUTImage: null
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
  const skyMilkyWayTags = starrySkyComponent.el.getElementsByTagName('sky-milky-way');
  tagLists.push(skyMilkyWayTags);
  const skyHalosTags = starrySkyComponent.el.getElementsByTagName('sky-halos');
  tagLists.push(skyHalosTags);
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

  //Blits the five staged lunar maps into the layers of one texture array and hands back
  //its texture. Layer order is the order of `moonTextures`, and it is mirrored by the
  //MOON_*_LAYER constants in atmosphere-pass.glsl -- the two lists must not drift apart.
  //
  //The staging textures are disposed on the way out: they have been copied onto the GPU
  //already, and holding them would keep the memory this consolidation is meant to recover.
  this.buildMoonTextureArray = function(renderer, moonTextures, stagingTextures, size){
    const builder = StarrySky.TextureArrayBuilder;
    const arrayRenderTarget = builder.build({
      width: size,
      height: size,
      layers: moonTextures.length,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearMipmapLinearFilter,
      format: THREE.RGBAFormat,
      //The sources are 8 bit PNG and WebP. Uploading them as float, as we used to, spends
      //four times the memory to store exactly the same values -- a sampler returns b/255
      //either way, and it is the sampler's precision qualifier, not the storage type, that
      //decides whether that value survives.
      type: THREE.UnsignedByteType,
      colorSpace: THREE.LinearSRGBColorSpace,
      anisotropy: 4,
      generateMipmaps: true
    });

    for(let i = 0; i < moonTextures.length; ++i){
      builder.copyTextureToLayer(renderer, arrayRenderTarget, i, stagingTextures[moonTextures[i]]);
    }

    const moonMaps = builder.finalize(renderer, arrayRenderTarget);

    for(let i = 0; i < moonTextures.length; ++i){
      stagingTextures[moonTextures[i]].dispose();
      delete stagingTextures[moonTextures[i]];
    }

    this.images.moonImages.moonMaps = moonMaps;
    return moonMaps;
  };

  //Unpacks the halo atlas -- one WebP holding every halo layer in a grid of tiles -- into a
  //sampler2DArray, one tile per layer, in the layer order src/python/halo-baker/bake.py
  //wrote them (and halo-functions.glsl reads them): the random population, then a plate
  //layer per sun elevation step, then a column layer per step.
  //
  //The whole family is one sampler however many layers it has, which is the point: the sky
  //dome is already carrying stars, the Milky Way, clouds and aurora against a guaranteed
  //sixteen texture units. The layers keep bilinear filtering and no mips, because a tile
  //of an atlas would bleed into its neighbour under both and a layer of an array cannot.
  //
  //The atlas is staged with NearestFilter so each layer texel takes exactly one atlas
  //texel, and disposed once it has been blitted. Its bytes are the baker's gamma 2 encoded
  //radiance, never colour, so LinearSRGBColorSpace stops three decoding them on the way.
  this.buildHaloTextureArray = function(renderer, atlasTexture, atlas){
    const builder = StarrySky.TextureArrayBuilder;
    const numberOfLayers = 1 + 2 * atlas.elevationLayers;
    const numberOfRows = Math.ceil(numberOfLayers / atlas.columns);
    const arrayRenderTarget = builder.build({
      width: atlas.tileWidth,
      height: atlas.tileHeight,
      layers: numberOfLayers,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      colorSpace: THREE.LinearSRGBColorSpace,
      generateMipmaps: false
    });

    //Layer row 0 is psi = 0, the top row of a tile. A loaded image is flipped so that its top
    //row sits at v = 1, hence the 1 - .. below. The layer's pixel centres land exactly on the
    //atlas's, so with Nearest this is a byte for byte copy.
    const blitMaterial = builder.createMaterial([
      'precision highp float;',
      'uniform sampler2D atlasTexture;',
      'uniform vec2 tile;',
      'uniform vec2 grid;',
      'void main(){',
      '  vec2 layerUV = gl_FragCoord.xy / resolution.xy;',
      '  gl_FragColor = texture(atlasTexture, vec2((tile.x + layerUV.x) / grid.x, 1.0 - (tile.y + layerUV.y) / grid.y));',
      '}'
    ].join('\n'), {
      atlasTexture: {value: atlasTexture},
      tile: {value: new THREE.Vector2()},
      grid: {value: new THREE.Vector2(atlas.columns, numberOfRows)}
    });

    for(let i = 0; i < numberOfLayers; ++i){
      blitMaterial.uniforms.tile.value.set(i % atlas.columns, Math.floor(i / atlas.columns));
      builder.renderLayer(renderer, arrayRenderTarget, i, blitMaterial);
    }
    blitMaterial.dispose();
    atlasTexture.dispose();

    const haloMaps = builder.finalize(renderer, arrayRenderTarget);
    this.images.haloImages.haloMaps = haloMaps;
    return haloMaps;
  };

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
    const oneEclipseShadowLUT = 1;
    //Emission + absorption, but only when the band is switched on -- a disabled
    //Milky Way should not cost the user a download.
    const milkyWayEnabled = this.data.skyMilkyWay.milkyWayEnabled;
    const numberOfMilkyWayTextures = milkyWayEnabled ? 2 : 0;
    //One atlas image, whatever the number of halo layers, and only when halos are switched on.
    const halosEnabled = this.data.skyHalos.halosEnabled;
    const numberOfHaloTextures = halosEnabled ? 1 : 0;
    this.totalNumberOfTextures = numberOfMoonTextures + numberOfStarTextures + numberOfBlueNoiseTextures + oneSolarEclipseImage + oneEclipseShadowLUT + numberOfMilkyWayTextures + numberOfHaloTextures;

    //All five lunar maps are 512x512, share their filtering and wrapping, and are sampled
    //at the same UV, so they are one family and collapse into a single sampler2DArray.
    //That is four texture units back for the moon pass, which was asking for nineteen
    //against a guaranteed sixteen.
    //
    //Each map loads as a staging texture that exists only to be blitted into its layer and
    //then disposed. Staging wants NearestFilter and no mips: the blit is 1:1, so nearest
    //makes it byte-exact, and mips on a texture we are about to throw away are wasted work.
    //The array itself carries the filtering the moon actually renders with.
    const MOON_MAP_SIZE = 512;
    const moonStagingTextures = {};
    let numberOfMoonTexturesLoaded = 0;

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
        //Fill in the details of our staging texture
        texture.format = THREE.RGBAFormat;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.LinearSRGBColorSpace;
        moonStagingTextures[moonTextures[i]] = texture;

        numberOfMoonTexturesLoaded += 1;
        if(numberOfMoonTexturesLoaded === numberOfMoonTextures){
          const moonMaps = self.buildMoonTextureArray(renderer, moonTextures, moonStagingTextures, MOON_MAP_SIZE);

          //If the renderer already exists, go in and update the uniform
          if(self.skyDirector?.renderers?.moonRenderer?.moonMaterial !== undefined){
            self.skyDirector.renderers.moonRenderer.moonMaterial.uniforms.moonMaps.value = moonMaps;
          }
        }

        self.numberOfTexturesLoaded += 1;
        if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load the halo atlas and unpack it into a texture array.
    if(halosEnabled){
      const haloTexturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.haloAtlas, function(texture){resolve(texture);}, undefined, reject);
      });
      haloTexturePromise.then(function(texture){
        texture.format = THREE.RGBAFormat;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.LinearSRGBColorSpace;

        const haloMaps = self.buildHaloTextureArray(renderer, texture, self.data.skyHalos.atlas);

        //If the renderer already exists, go in and update the uniform
        if(self.skyDirector?.renderers?.atmosphereRenderer?.atmosphereMaterial?.uniforms?.haloMaps !== undefined){
          self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.haloMaps.value = haloMaps;
        }

        self.numberOfTexturesLoaded += 1;
        if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(`Could not load the halo atlas from ${StarrySky.assetPaths.haloAtlas}. Run src/python/halo-baker/run.sh to bake it, or point <sky-halo-atlas> somewhere that has it.`, err);
      });
    }

    //Load our Milky Way maps -- emission (unresolved galactic starlight) and
    //absorption (interstellar dust). Both are equirectangular in galactic
    //coordinates and are sampled with a single UV, so they must share their
    //wrapping and filtering: repeat in S because galactic longitude wraps at
    //l=180, clamp in T because latitude does not.
    if(milkyWayEnabled){
      const milkyWayMaps = [
        {assetKey: 'milkyWayEmissionMap', uniformName: 'milkyWayEmissionMap'},
        {assetKey: 'milkyWayAbsorptionMap', uniformName: 'milkyWayAbsorptionMap'}
      ];
      for(let i = 0; i < milkyWayMaps.length; ++i){
        const milkyWayMap = milkyWayMaps[i];
        const milkyWayTexturePromise = new Promise(function(resolve, reject){
          textureLoader.load(StarrySky.assetPaths[milkyWayMap.assetKey], function(texture){resolve(texture);});
        });
        milkyWayTexturePromise.then(function(texture){
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.magFilter = THREE.LinearFilter;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.generateMipmaps = true;
          //The band is grazed at shallow angles across most of the sky, which is
          //exactly where trilinear filtering smears it into a grey smudge.
          texture.anisotropy = 4;
          //These carry brightness and optical depth, not color -- no sRGB decode.
          texture.colorSpace = THREE.LinearSRGBColorSpace;
          self.images.milkyWayImages[milkyWayMap.assetKey] = texture;

          if(self.skyDirector?.renderers?.moonRenderer?.moonMaterial !== undefined){
            self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms[milkyWayMap.uniformName].value = texture;
            skyDirector.renderers.moonRenderer.moonMaterial.uniforms[milkyWayMap.uniformName].value = texture;
          }

          self.numberOfTexturesLoaded += 1;
          if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
            self.hasLoadedImages = true;
          }
        }, function(err){
          console.error(err);
        });
      }
    }

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
      texture.colorSpace = THREE.LinearSRGBColorSpace;
      texture.generateMipmaps = true;
      //Swap this tomorrow and implement custom mip-maps
      self.images.starImages.starColorMap = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(self.skyDirector?.renderers?.moonRenderer?.moonMaterial !== undefined){
        const atmosphereTextureRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starColorMap;
        atmosphereTextureRef.value = texture;

        const moonTextureRef = skyDirector.renderers.moonRenderer.moonMaterial.uniforms.starColorMap;
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
      cubemap.colorSpace = THREE.LinearSRGBColorSpace;

      self.numberOfTexturesLoaded += 1;
      if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
        self.hasLoadedImages = true;
      }
      self.images.starImages.starHashCubemap = cubemap;

      if(self.skyDirector?.renderers?.moonRenderer?.moonMaterial !== undefined){
        const atmosphereCubemapRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starHashCubemap;
        atmosphereCubemapRef.value = cubemap;

        const moonCubemapRef = self.skyDirector.renderers.moonRenderer.moonMaterial.uniforms.starHashCubemap;
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
        texture.colorSpace = THREE.LinearSRGBColorSpace;
        dimStarChannelImages[channels[i]] = texture;

        numberOfDimStarChannelsLoaded += 1;
        if(numberOfDimStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          const starDataArray = skyDirector.stellarLUTLibrary.dimStarMapPass(dimStarChannelImages.r, dimStarChannelImages.g, dimStarChannelImages.b, dimStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          //The array is only handed back once all three tiers have been baked into it, so
          //this stays null until then rather than pointing at half-filled layers.
          if(starDataArray !== undefined && skyDirector?.renderers?.moonRenderer?.moonMaterial !== undefined){
            skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starData.value = starDataArray;
            skyDirector.renderers.moonRenderer.moonMaterial.uniforms.starData.value = starDataArray;
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
        texture.colorSpace = THREE.LinearSRGBColorSpace;
        medStarChannelImages[channels[i]] = texture;

        numberOfMedStarChannelsLoaded += 1;
        if(numberOfMedStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          const starDataArray = skyDirector.stellarLUTLibrary.medStarMapPass(medStarChannelImages.r, medStarChannelImages.g, medStarChannelImages.b, medStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(starDataArray !== undefined && skyDirector?.renderers?.moonRenderer?.moonMaterial !== undefined){
            skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starData.value = starDataArray;
            skyDirector.renderers.moonRenderer.moonMaterial.uniforms.starData.value = starDataArray;
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
        texture.colorSpace = THREE.LinearSRGBColorSpace;
        brightStarChannelImages[channels[i]] = texture;

        numberOfBrightStarChannelsLoaded += 1;
        if(numberOfBrightStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          const skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          const starDataArray = skyDirector.stellarLUTLibrary.brightStarMapPass(brightStarChannelImages.r, brightStarChannelImages.g, brightStarChannelImages.b, brightStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(starDataArray !== undefined && skyDirector?.renderers?.moonRenderer?.moonMaterial !== undefined){
            skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starData.value = starDataArray;
            skyDirector.renderers.moonRenderer.moonMaterial.uniforms.starData.value = starDataArray;
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
        texture.colorSpace = THREE.LinearSRGBColorSpace;
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
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.colorSpace = THREE.LinearSRGBColorSpace;
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

    //Eclipse-Shadow LuT (Schneegans 2025 parameterization). Sampled by the
    //moon shader to give the umbra its wavelength-dependent shadow color.
    //Baked offline in linear-light RGB but stored as sRGB-encoded 8-bit PNG
    //for precision in the dark umbra range -- Three.js auto-decodes back to
    //linear via colorSpace = SRGBColorSpace. ClampToEdge so we don't wrap
    //past the LuT's coordinate domain.
    let eclipseShadowLUTPromise = new Promise(function(resolve, reject){
      textureLoader.load(StarrySky.assetPaths.eclipseShadowLUT, function(texture){resolve(texture);});
    });
    eclipseShadowLUTPromise.then(function(texture){
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      self.images.eclipseShadowLUTImage = texture;

      //CPU-side copy of the LuT pixels so SkyDirector / LightingManager can
      //sample it without a GPU round-trip. We need this for the directional
      //light color (which gets multiplied into the scene's lighting on the
      //CPU) and for the atmosphere shader's moonLightColor uniform (which
      //tints sky scattering by the eclipse color).
      const img = texture.image;
      if(img && img.width > 0){
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        self.eclipseShadowLUTWidth = img.width;
        self.eclipseShadowLUTHeight = img.height;
        self.eclipseShadowLUTPixels = ctx.getImageData(0, 0, img.width, img.height).data;
      }

      if(self.skyDirector?.renderers?.moonRenderer !== undefined){
        const moonUniforms = self.skyDirector.renderers.moonRenderer.moonMaterial.uniforms;
        if(moonUniforms.eclipseShadowLUT){
          moonUniforms.eclipseShadowLUT.value = texture;
        }
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

  //CPU-side bilinear sample of the Eclipse-Shadow LuT, returning linear-light
  //RGB as a 3-element array. Returns null if the LuT isn't loaded yet.
  //u, v are clamped to [0, 1]. The PNG file has v=1 at the top (umbra row at
  //the bottom, matching Figure 9 of the Schneegans paper), so we flip the
  //v axis when indexing pixels.
  const srgbToLinear = function(c){
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  this.sampleEclipseShadowLUT = function(u, v){
    const pixels = self.eclipseShadowLUTPixels;
    if(!pixels){
      return null;
    }
    const w = self.eclipseShadowLUTWidth;
    const h = self.eclipseShadowLUTHeight;
    u = Math.max(0.0, Math.min(1.0, u));
    v = Math.max(0.0, Math.min(1.0, v));
    const xPixel = u * (w - 1);
    const yPixel = (1.0 - v) * (h - 1);
    const x0 = Math.floor(xPixel);
    const y0 = Math.floor(yPixel);
    const x1 = Math.min(x0 + 1, w - 1);
    const y1 = Math.min(y0 + 1, h - 1);
    const fx = xPixel - x0;
    const fy = yPixel - y0;
    const i00 = (y0 * w + x0) * 4;
    const i10 = (y0 * w + x1) * 4;
    const i01 = (y1 * w + x0) * 4;
    const i11 = (y1 * w + x1) * 4;
    const out = [0, 0, 0];
    for(let i = 0; i < 3; ++i){
      const c00 = srgbToLinear(pixels[i00 + i] / 255.0);
      const c10 = srgbToLinear(pixels[i10 + i] / 255.0);
      const c01 = srgbToLinear(pixels[i01 + i] / 255.0);
      const c11 = srgbToLinear(pixels[i11 + i] / 255.0);
      const top = c00 * (1.0 - fx) + c10 * fx;
      const bot = c01 * (1.0 - fx) + c11 * fx;
      out[i] = top * (1.0 - fy) + bot * fy;
    }
    return out;
  };

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
      self.data.skyMilkyWay = self.hasMilkyWayTag ? self.skyMilkyWayTag.data : defaultValues.skyMilkyWay;
      self.data.skyHalos = self.hasHalosTag ? self.skyHalosTag.data : defaultValues.skyHalos;
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
  if(skyMilkyWayTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyMilkyWayTag = skyMilkyWayTags[0];
    this.hasMilkyWayTag = true;
    activeTags.push(this.skyMilkyWayTag);
  }
  if(skyHalosTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyHalosTag = skyHalosTags[0];
    this.hasHalosTag = true;
    activeTags.push(this.skyHalosTag);
  }
  for(let i = 0; i < activeTags.length; ++i){
    checkIfAllHTMLDataLoaded(activeTags[i]);
  }

  if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
    this.loadSkyData();
  }
};
