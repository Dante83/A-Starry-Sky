//Child classes
window.customElements.define('sky-basis-transcoder-wasm', class extends HTMLElement{});
window.customElements.define('sky-state-engine-wasm', class extends HTMLElement{});
window.customElements.define('sky-interpolation-engine-wasm', class extends HTMLElement{});
window.customElements.define('sky-moon-diffuse-map', class extends HTMLElement{});
window.customElements.define('sky-moon-normal-map', class extends HTMLElement{});
window.customElements.define('sky-moon-opacity-map', class extends HTMLElement{});
window.customElements.define('sky-moon-specular-map', class extends HTMLElement{});
window.customElements.define('sky-moon-ao-map', class extends HTMLElement{});

StarrySky.DefaultData.fileNames = {
  basisTranscoder: 'basis-transcoder.wasm',
  skyStateEngine: 'state-engine.wasm',
  skyInterpolationEngine: 'interpolation-engine.wasm',
  moonDiffuseMap: 'lunar-diffuse-map.basis',
  moonNormalMap: 'lunar-normal-map.basis',
  moonOpacityMap: 'lunar-opacity-map.basis',
  moonSpecularMap: 'lunar-specular-map.basis',
  moonAOMap: 'lunar-ao-map.basis'
};

StarrySky.DefaultData.skyAssets = {
  basisTranscoder: '../wasm/' + StarrySky.DefaultData.fileNames.basisTranscoder,
  skyStateEngine: '../wasm/' + StarrySky.DefaultData.fileNames.skyStateEngine,
  skyInterpolationEngine: '../wasm/' + StarrySky.DefaultData.fileNames.skyInterpolationEngine,
  moonDiffuseMap: '../assets/' + StarrySky.DefaultData.fileNames.moonDiffuseMap,
  moonNormalMap: '../assets/' + StarrySky.DefaultData.fileNames.moonNormalMap,
  moonOpacityMap: '../assets/' + StarrySky.DefaultData.fileNames.moonOpacityMap,
  moonSpecularMap: '../assets/' + StarrySky.DefaultData.fileNames.moonSpecularMap,
  moonAOMap: '../assets' + StarrySky.DefaultData.fileNames.moonAOMap,
};

//Clone the above, in the event that any paths are found to differ, we will
//replace them.
StarrySky.AssetPaths = JSON.parse(JSON.stringify(StarrySky.DefaultData));

//Parent class
class SkyAssetsDir extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyAssets;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Check this this has a parent sky-assets-dir
      let isRoot = self.parentElement.nodeName !== 'sky-assets-dir';
      let path = 'dir' in self.attributes ? self.attributes.dir.value : '/';
      let parentTag = self.parentElement;

      //If this isn't root, we should recursively travel up the tree until we have constructed
      //our path.
      let i = 0;
      while(parentTag.nodeName === 'sky-assets-dir'){
        let parentDir;
        if('dir' in parentTag.attributes){
          parentDir = self.attributes.dir.value;
        }
        else{
          parentDir = '/';
          console.warn("A sky-assets-dir tag was found without a dir path attribute. Paths are constructed recursively, so there is no reason to have this tag without the corresponding attribute.");
        }
        parentDir = parentDir.endsWith('/') ? parentDir : parentDir + '/';
        path = path.beginsWith('/') ? path.slice(1, path.length - 1) : path;
        path = parentDir + path;
        parentTag = parentTag.parentElement;
        i++;
        if(i > 100){
          console.error("Why do you need a hundred of these?! You should be able to use like... 2. Maybe 3? I'm breaking to avoid freezing your machine.");
          return; //Oh, no, you don't just get to break, we're shutting down the entire function
        }
      }

      //Get child tags and acquire their values.
      let basisTranscoderTags = self.getElementsByTagName('sky-basis-transcoder-wasm');
      let skyStateEngineTags = self.getElementsByTagName('sky-state-engine-wasm');
      let skyInterpolationEngineTags = self.getElementsByTagName('sky-interpolation-engine-wasm');
      let moonDiffuseMapTags = self.getElementsByTagName('sky-moon-diffuse-map');
      let moonNormalMapTags = self.getElementsByTagName('sky-moon-normal-map');
      let moonOpacityMapTags = self.getElementsByTagName('sky-moon-opacity-map');
      let moonSpecularMapTags = self.getElementsByTagName('sky-moon-specular-map');
      let moonAOMapTags = self.getElementsByTagName('sky-moon-ao-map');

      const objectProperties = ['basisTranscoder', 'skyStateEngine', 'skyInterpolationEngine',
        'moonDiffuseMap', 'moonNormalMap', 'moonOpacityMap', 'moonSpecularMap', 'moonAOMap']
      let tagsList = [basisTranscoderTags, skyStateEngineTags, skyInterpolationEngineTags,
        moonDiffuseMapTags, moonNormalMapTags, moonOpacityMapTags, moonSpecularMapTags, moonAOMapTags];
      const numberOfTags = tagsList.length;
      for(let i = 0; i < numberOfTags; ++i){
        let tags = tagsList[i];
        let propertyName = objectProperties[i];
        if(tags.length > 1){
          console.error(`The <sky-assets-dir> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
        else if(tags.length > 0){
          if(StarrySky.AssetPaths[propertyName] !== StarrySky.DefaultData.skyAssets[propertyName]){
            //As the above should be copied over from a JSON parse, we must have changed this
            //someplace else.
            console.warn(`A page can only have one tag of type <${tags[0].tagName}>. Two were discovered. Switching data to latest url.`);
          }
          //Try the default file name if no html was provided
          StarrySky.AssetPaths[propertyName] = tags[0].innerHTML !== '' ? path.concat(tags[0].innerHTML) : path.concat(StarrySky.DefaultData.fileNames[propertyName]);
        }
      }

      self.skyDataLoaded = true;

      if(isRoot){
        //Only notify the asset manager that all information has been loaded once the root
        //tag has finished loading all children and filled in their information.
        self.dispatchEvent(new Event('Sky-Data-Loaded'));
      }
    });

    this.loaded = true;
  };
}
window.customElements.define('sky-assets-dir', SkyAssetsDir);
