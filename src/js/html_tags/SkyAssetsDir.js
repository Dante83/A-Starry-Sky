//Child classes
window.customElements.define('sky-state-engine-path', class extends HTMLElement{});
window.customElements.define('sky-interpolation-engine-path', class extends HTMLElement{});
window.customElements.define('sky-moon-diffuse-map', class extends HTMLElement{});
window.customElements.define('sky-moon-normal-map', class extends HTMLElement{});
window.customElements.define('sky-moon-roughness-map', class extends HTMLElement{});
window.customElements.define('sky-moon-aperature-size-map', class extends HTMLElement{});
window.customElements.define('sky-moon-aperature-orientation-map', class extends HTMLElement{});
window.customElements.define('sky-stellar-position-data', class extends HTMLElement{});

StarrySky.DefaultData.fileNames = {
  moonDiffuseMap: 'lunar-diffuse-map.webp',
  moonNormalMap: 'lunar-normal-map.webp',
  moonRoughnessMap: 'lunar-roughness-map.webp',
  moonAperatureSizeMap: 'lunar-aperature-size-map.webp',
  moonAperatureOrientationMap: 'lunar-aperature-orientation-map.webp',
  stellarPositionData: ['stellar-position-data-1.dat.gz', 'stellar-position-data-2.dat.gz']
};

StarrySky.DefaultData.skyAssets = {
  skyStateEnginePath: './wasm/',
  skyInterpolationEnginePath: './wasm/',
  moonDiffuseMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonDiffuseMap,
  moonNormalMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonNormalMap,
  moonRoughnessMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonRoughnessMap,
  moonAperatureSizeMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonAperatureSizeMap,
  moonAperatureOrientationMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonAperatureOrientationMap,
  stellarPositionData: ['./assets/star_data/' + StarrySky.DefaultData.fileNames.stellarPositionData[0],
    './assets/star_data/' + StarrySky.DefaultData.fileNames.stellarPositionData[1]],
};

//Clone the above, in the event that any paths are found to differ, we will
//replace them.
StarrySky.assetPaths = JSON.parse(JSON.stringify(StarrySky.DefaultData));

//Parent class
class SkyAssetsDir extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyAssets;
    this.isRoot = false;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Check this this has a parent sky-assets-dir
      self.isRoot = self.parentElement.nodeName.toLowerCase() !== 'sky-assets-dir';
      const path = 'dir' in self.attributes ? self.attributes.dir.value : '/';
      const parentTag = self.parentElement;

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
      const moonAperatureOrientationMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-aperature-orientation-map');
      const stellarPositionDataTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-stellar-position-data');

      const objectProperties = ['skyStateEngine', 'skyInterpolationEngine','moonDiffuseMap', 'moonNormalMap',
        'moonRoughnessMap', 'moonAperatureSizeMap', 'moonAperatureOrientationMap', 'stellarPositionData']
      const tagsList = [skyStateEngineTags, skyInterpolationEngineTags, moonDiffuseMapTags, moonNormalMapTags,
        moonRoughnessMapTags, moonAperatureSizeMapTags, moonAperatureOrientationMapTags, stellarPositionDataTags];
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
        const textureKeys = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap',
        'moonAperatureSizeMap', 'moonAperatureOrientationMap', 'stellarPositionData'];
        for(let i = 0; i < textureKeys.length; ++i){
          StarrySky.assetPaths[textureKeys[i]] = path + '/' + StarrySky.DefaultData.fileNames[textureKeys[i]];
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
        const starTextureKeys = ['stellarPositionData'];
        for(let i = 0; i < starTextureKeys.length; ++i){
          StarrySky.assetPaths[starTextureKeys[i]] = path + '/' + StarrySky.DefaultData.fileNames[starTextureKeys[i]];
        }
      }
      else{
        for(let i = 0; i < numberOfTagTypes; ++i){
          const tags = tagsList[i];
          const propertyName = objectProperties[i];
          const tagName = tags[0].tagName;
          if(tagName !== 'sky-stellar-position-data'){
            tag = tags[0]
            if(tags.length > 1){
              console.error(`The <sky-assets-dir> tag can only contain 1 tag of type <${tagName}>. ${tags.length} found.`);
            }
            else if(tags.length > 0){
              if(StarrySky.assetPaths[propertyName] &&
                StarrySky.assetPaths[propertyName] !== StarrySky.DefaultData.skyAssets[propertyName]){
                //As the above should be copied over from a JSON parse, we must have changed this
                //someplace else.
                console.warn(`A page can only have one tag of type <${tagName}>. Two were discovered. Switching data to latest url.`);
              }
              //Try the default file name if no html was provided
              StarrySky.assetPaths[propertyName] = tag.innerHTML !== '' ? path.concat(tag.innerHTML) : path.concat(StarrySky.DefaultData.fileNames[propertyName]);
            }
          }
          else{
            if(tags.length !== 2){
              console.error(`The <sky-assets-dir> must contain exactly 2 tags of type <${tagName}>. ${tags.length} found.`);
            }
            else{
              const tag1 = tags[0];
              const tag2 = tags[1];

              //Try the default file name if no html was provided
              StarrySky.assetPaths['stellarPositionData'][0] = tag1.innerHTML !== '' ? path.concat(tag1.innerHTML) : path.concat(StarrySky.DefaultData.fileNames['stellarPositionData'][0]);
              StarrySky.assetPaths['stellarPositionData'][1] = tag2.innerHTML !== '' ? path.concat(tag2.innerHTML) : path.concat(StarrySky.DefaultData.fileNames['stellarPositionData'][1]);
            }
          }
        }
      }

      self.skyDataLoaded = true;
      self.dispatchEvent(new Event('Sky-Data-Loaded'));
    });

    this.loaded = true;
  };
}
window.customElements.define('sky-assets-dir', SkyAssetsDir);
