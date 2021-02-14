//Child classes
window.customElements.define('sky-state-engine-path', class extends HTMLElement{});
window.customElements.define('sky-interpolation-engine-path', class extends HTMLElement{});
window.customElements.define('sky-moon-diffuse-map', class extends HTMLElement{});
window.customElements.define('sky-moon-normal-map', class extends HTMLElement{});
window.customElements.define('sky-moon-roughness-map', class extends HTMLElement{});
window.customElements.define('sky-moon-aperature-size-map', class extends HTMLElement{});
window.customElements.define('sky-moon-aperature-orientation-map', class extends HTMLElement{});
window.customElements.define('sky-star-cubemap-maps', class extends HTMLElement{});
window.customElements.define('sky-dim-star-maps', class extends HTMLElement{});
window.customElements.define('sky-med-star-maps', class extends HTMLElement{});
window.customElements.define('sky-bright-star-maps', class extends HTMLElement{});
window.customElements.define('sky-star-color-map', class extends HTMLElement{});
window.customElements.define('sky-blue-noise-maps', class extends HTMLElement{});
window.customElements.define('sky-solar-eclipse-map', class extends HTMLElement{});

StarrySky.DefaultData.fileNames = {
  moonDiffuseMap: 'lunar-diffuse-map.webp',
  moonNormalMap: 'lunar-normal-map.webp',
  moonRoughnessMap: 'lunar-roughness-map.webp',
  moonAperatureSizeMap: 'lunar-aperature-size-map.webp',
  moonAperatureOrientationMap: 'lunar-aperature-orientation-map.webp',
  starHashCubemap: [
    'star-dictionary-cubemap-px.png',
    'star-dictionary-cubemap-nx.png',
    'star-dictionary-cubemap-py.png',
    'star-dictionary-cubemap-ny.png',
    'star-dictionary-cubemap-pz.png',
    'star-dictionary-cubemap-nz.png',
  ],
  dimStarDataMaps: [
    'dim-star-data-r-channel.png',
    'dim-star-data-g-channel.png',
    'dim-star-data-b-channel.png',
    'dim-star-data-a-channel.png'
  ],
  medStarDataMaps: [
    'med-star-data-r-channel.png',
    'med-star-data-g-channel.png',
    'med-star-data-b-channel.png',
    'med-star-data-a-channel.png'
  ],
  brightStarDataMaps:[
    'bright-star-data-r-channel.png', //We choose to use PNG for the bright star data as webp is actually twice as big
    'bright-star-data-g-channel.png',
    'bright-star-data-b-channel.png',
    'bright-star-data-a-channel.png'
  ],
  starColorMap: 'star-color-map.png',
  blueNoiseMaps:[
    'blue-noise-0.bmp',
    'blue-noise-1.bmp',
    'blue-noise-2.bmp',
    'blue-noise-3.bmp',
    'blue-noise-4.bmp'
  ],
  solarEclipseMap: 'solar-eclipse-map.webp'
};

StarrySky.DefaultData.assetPaths = {
  skyStateEnginePath: './wasm/',
  skyInterpolationEnginePath: './wasm/',
  moonDiffuseMap: './assets/moon/webp_files/' + StarrySky.DefaultData.fileNames.moonDiffuseMap,
  moonNormalMap: './assets/moon/webp_files/' + StarrySky.DefaultData.fileNames.moonNormalMap,
  moonRoughnessMap: './assets/moon/webp_files/' + StarrySky.DefaultData.fileNames.moonRoughnessMap,
  moonAperatureSizeMap: './assets/moon/webp_files/' + StarrySky.DefaultData.fileNames.moonAperatureSizeMap,
  moonAperatureOrientationMap: './assets/moon/webp_files/' + StarrySky.DefaultData.fileNames.moonAperatureOrientationMap,
  solarEclipseMap: './assets/solar_eclipse/' + StarrySky.DefaultData.fileNames.solarEclipseMap,
  starHashCubemap: StarrySky.DefaultData.fileNames.starHashCubemap.map(x => './assets/star_data/' + x),
  dimStarDataMaps: StarrySky.DefaultData.fileNames.dimStarDataMaps.map(x => './assets/star_data/' + x),
  medStarDataMaps: StarrySky.DefaultData.fileNames.medStarDataMaps.map(x => './assets/star_data/' + x),
  brightStarDataMaps: StarrySky.DefaultData.fileNames.brightStarDataMaps.map(x => './assets/star_data/' + x),
  starColorMap: './assets/star_data/' + StarrySky.DefaultData.fileNames.starColorMap,
  blueNoiseMaps: StarrySky.DefaultData.fileNames.blueNoiseMaps.map(x => './assets/blue_noise/' + x)
};

//Clone the above, in the event that any paths are found to differ, we will
//replace them.
StarrySky.assetPaths = JSON.parse(JSON.stringify(StarrySky.DefaultData.assetPaths));

//Parent class
class SkyAssetsDir extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.assetPaths;
    this.isRoot = false;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Check this this has a parent sky-assets-dir
      self.isRoot = self.parentElement.nodeName.toLowerCase() !== 'sky-assets-dir';
      let path = 'dir' in self.attributes ? self.attributes.dir.value : '/';
      let parentTag = self.parentElement;

      //If this isn't root, we should recursively travel up the tree until we have constructed
      //our path.
      var i = 0;
      while(parentTag.nodeName.toLowerCase() === 'sky-assets-dir'){
        let parentDir;
        if('dir' in parentTag.attributes){
          parentDir = parentTag.attributes.dir.value;
        }
        else{
          parentDir = '';
        }
        if(parentDir.length > 0){
          //We add the trailing / back in if we are going another level deeper
          parentDir = parentDir.endsWith('/') ? parentDir : parentDir + '/';

          //Remove the trailing and ending /s for appropriate path construction
          path = path.startsWith('/') ? path.slice(1, path.length - 1) : path;
          path = path.endsWith('/') ? path.slice(0, path.length - 2) : path;
          path = parentDir + path;
        }
        else{
          path = parentDir + path;
        }
        parentTag = parentTag.parentElement;
        i++;
        if(i > 100){
          console.error("Why do you need a hundred of these?! You should be able to use like... 2. Maybe 3? I'm breaking to avoid freezing your machine.");
          return; //Oh, no, you don't just get to break, we're shutting down the entire function
        }
      }

      //Get child tags and acquire their values.
      const childNodes = Array.from(self.children);
      const skyStateEngineTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-state-engine-path');
      const skyInterpolationEngineTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-interpolation-engine-path');
      const moonDiffuseMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-diffuse-map');
      const moonNormalMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-normal-map');
      const moonRoughnessMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-roughness-map');
      const moonAperatureSizeMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-aperature-size-map');
      const solarEclipseMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-solar-eclipse-map');
      const moonAperatureOrientationMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-aperature-orientation-map');
      const starCubemapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-star-cubemap-map');
      const dimStarMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-dim-star-map');
      const medStarMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-med-star-map');
      const brightStarMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-bright-star-map');
      const starColorMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-star-color-map');
      const blueNoiseMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-blue-noise-maps');

      const objectProperties = ['skyStateEngine', 'skyInterpolationEngine','moonDiffuseMap', 'moonNormalMap',
        'moonRoughnessMap', 'moonAperatureSizeMap', 'moonAperatureOrientationMap', 'starHashCubemap',
        'dimStarMaps', 'medStarMaps', 'brightStarMaps', 'starColorMap', 'blueNoiseMaps', 'solarEclipseMap']
      const tagsList = [skyStateEngineTags, skyInterpolationEngineTags, moonDiffuseMapTags, moonNormalMapTags,
        moonRoughnessMapTags, moonAperatureSizeMapTags, moonAperatureOrientationMapTags, starCubemapTags,
        medStarMapTags, dimStarMapTags, brightStarMapTags, starColorMapTags, blueNoiseMapTags, solarEclipseMapTags];
      const numberOfTagTypes = tagsList.length;
      if(self.hasAttribute('wasm-path') && self.getAttribute('wasm-path').toLowerCase() !== 'false'){
        const wasmKeys = ['skyStateEngine', 'skyInterpolationEngine'];
        for(let i = 0; i < wasmKeys.length; ++i){
          //Must end with a / because basis texture loader will eventually just append the file name
          //We want to use .BASIS in the future, but right now it lacks the quality desired for our target
          //platform of medium to high powered desktops.
          StarrySky.assetPaths[wasmKeys[i]] = path + '/';
        }
      }
      else if(self.hasAttribute('texture-path') && self.getAttribute('texture-path').toLowerCase() !== 'false'){
        const singleTextureKeys = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap',
        'moonAperatureSizeMap', 'moonAperatureOrientationMap', 'starColorMap', 'solarEclipseMap'];
        const multiTextureKeys = ['starHashCubemap','dimStarDataMaps', 'medStarDataMaps', 'brightStarDataMaps',
        'blueNoiseMaps'];

        //Process single texture keys
        for(let i = 0; i < singleTextureKeys.length; ++i){
          StarrySky.assetPaths[singleTextureKeys[i]] = path + '/' + StarrySky.DefaultData.fileNames[singleTextureKeys[i]];
        }

        //Process multi texture keys
        for(let i = 0; i < multiTextureKeys.length; ++i){
          let multiTextureFileNames = multiTextureKeys[i];
          for(let j = 0; j < multiTextureFileNames.length; ++j){
            StarrySky.assetPaths[multiTextureFileNames[i]][j] = path + '/' + StarrySky.DefaultData.fileNames[singleTextureKeys[i]][j];
          }
        }
      }
      else if(self.hasAttribute('moon-path') && self.getAttribute('moon-path').toLowerCase() !== 'false'){
        const moonTextureKeys = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap',
        'moonAperatureSizeMap', 'moonAperatureOrientationMap'];
        for(let i = 0; i < moonTextureKeys.length; ++i){
          StarrySky.assetPaths[moonTextureKeys[i]] = path + '/' + StarrySky.DefaultData.fileNames[moonTextureKeys[i]];
        }
      }
      else if(self.hasAttribute('star-path') && self.getAttribute('star-path').toLowerCase() !== 'false'){
        const starTextureKeys = ['starHashCubemap', 'dimStarDataMaps', 'medStarDataMaps', 'brightStarDataMaps'];
        for(let i = 0; i < starTextureKeys.length; ++i){
          let starMapFileNames =  StarrySky.DefaultData.fileNames[starTextureKeys[i]];
          for(let j = 0; j < starMapFileNames.length; ++j){
            StarrySky.assetPaths[starTextureKeys[i]][j] = path + '/' + starMapFileNames[j];
          }
        }

        StarrySky.assetPaths['starColorMap'] = path + '/' + StarrySky.DefaultData.fileNames['starColorMap'];
      }
      else if(self.hasAttribute('blue-noise-path') && self.getAttribute('blue-noise-path').toLowerCase() !== 'false'){
        for(let i = 0; i < 5; ++i){
          let blueNoiseFileNames =  StarrySky.DefaultData.fileNames['blue-noise-' + i];
          StarrySky.assetPaths['blueNoiseMaps'][i] = path + '/' + StarrySky.DefaultData.fileNames['blueNoiseMaps'][i];
        }
      }
      else{
        console.warn("Invalid code path detected for the sky assets dirs. This should not happen.");
      }

      self.skyDataLoaded = true;
      self.dispatchEvent(new Event('Sky-Data-Loaded'));
    });

    this.loaded = true;
  };
}
window.customElements.define('sky-assets-dir', SkyAssetsDir);
