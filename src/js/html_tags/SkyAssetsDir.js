//Child classes
window.customElements.define('sky-moon-diffuse-map', class extends HTMLElement{});
window.customElements.define('sky-moon-normal-map', class extends HTMLElement{});
window.customElements.define('sky-moon-roughness-map', class extends HTMLElement{});
window.customElements.define('sky-moon-aperture-size-map', class extends HTMLElement{});
window.customElements.define('sky-moon-aperture-orientation-map', class extends HTMLElement{});
window.customElements.define('sky-star-cubemap-maps', class extends HTMLElement{});
window.customElements.define('sky-dim-star-maps', class extends HTMLElement{});
window.customElements.define('sky-med-star-maps', class extends HTMLElement{});
window.customElements.define('sky-bright-star-maps', class extends HTMLElement{});
window.customElements.define('sky-star-color-map', class extends HTMLElement{});
window.customElements.define('sky-blue-noise-maps', class extends HTMLElement{});
window.customElements.define('sky-solar-eclipse-map', class extends HTMLElement{});
window.customElements.define('sky-eclipse-shadow-lut', class extends HTMLElement{});
window.customElements.define('sky-aurora-maps', class extends HTMLElement{});
window.customElements.define('sky-milky-way-emission-map', class extends HTMLElement{});
window.customElements.define('sky-milky-way-absorption-map', class extends HTMLElement{});

StarrySky.DefaultData.fileNames = {
  moonDiffuseMap: 'lunar-diffuse-map.webp',
  moonNormalMap: 'lunar-normal-map.webp',
  moonRoughnessMap: 'lunar-roughness-map.webp',
  moonApertureSizeMap: 'lunar-aperture-size-map.webp',
  moonApertureOrientationMap: 'lunar-aperture-orientation-map.webp',
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
  solarEclipseMap: 'solar-eclipse-map.webp',
  eclipseShadowLUT: 'eclipse-shadow-lut.webp',
  auroraMaps: [
    'aurora-map.webp'
  ],
  milkyWayEmissionMap: 'milky-way-emission-map.webp',
  milkyWayAbsorptionMap: 'milky-way-absorption-map.webp'
};

StarrySky.DefaultData.assetPaths = {
  moonDiffuseMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonDiffuseMap,
  moonNormalMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonNormalMap,
  moonRoughnessMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonRoughnessMap,
  moonApertureSizeMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonApertureSizeMap,
  moonApertureOrientationMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonApertureOrientationMap,
  solarEclipseMap: './assets/solar_eclipse/' + StarrySky.DefaultData.fileNames.solarEclipseMap,
  eclipseShadowLUT: './assets/lunar_eclipse/' + StarrySky.DefaultData.fileNames.eclipseShadowLUT,
  starHashCubemap: StarrySky.DefaultData.fileNames.starHashCubemap.map(x => './assets/star_data/' + x),
  dimStarDataMaps: StarrySky.DefaultData.fileNames.dimStarDataMaps.map(x => './assets/star_data/' + x),
  medStarDataMaps: StarrySky.DefaultData.fileNames.medStarDataMaps.map(x => './assets/star_data/' + x),
  brightStarDataMaps: StarrySky.DefaultData.fileNames.brightStarDataMaps.map(x => './assets/star_data/' + x),
  starColorMap: './assets/star_data/' + StarrySky.DefaultData.fileNames.starColorMap,
  blueNoiseMaps: StarrySky.DefaultData.fileNames.blueNoiseMaps.map(x => './assets/blue_noise/' + x),
  auroraMaps: StarrySky.DefaultData.fileNames.auroraMaps.map(x => './assets/aurora_maps/' + x),
  milkyWayEmissionMap: './assets/milky_way/' + StarrySky.DefaultData.fileNames.milkyWayEmissionMap,
  milkyWayAbsorptionMap: './assets/milky_way/' + StarrySky.DefaultData.fileNames.milkyWayAbsorptionMap,
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
      let i = 0;
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
          path = path.startsWith('/') ? path.slice(1) : path;
          path = path.endsWith('/') ? path.slice(0, -1) : path;
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

      //Mapping from child tag name to the asset path key it overrides.
      const childTagToAssetKey = {
        'sky-moon-diffuse-map': 'moonDiffuseMap',
        'sky-moon-normal-map': 'moonNormalMap',
        'sky-moon-roughness-map': 'moonRoughnessMap',
        'sky-moon-aperture-size-map': 'moonApertureSizeMap',
        'sky-moon-aperture-orientation-map': 'moonApertureOrientationMap',
        'sky-star-cubemap-maps': 'starHashCubemap',
        'sky-dim-star-maps': 'dimStarDataMaps',
        'sky-med-star-maps': 'medStarDataMaps',
        'sky-bright-star-maps': 'brightStarDataMaps',
        'sky-star-color-map': 'starColorMap',
        'sky-blue-noise-maps': 'blueNoiseMaps',
        'sky-solar-eclipse-map': 'solarEclipseMap',
        'sky-eclipse-shadow-lut': 'eclipseShadowLUT',
        'sky-aurora-maps': 'auroraMaps',
        'sky-milky-way-emission-map': 'milkyWayEmissionMap',
        'sky-milky-way-absorption-map': 'milkyWayAbsorptionMap'
      };

      if(self.hasAttribute('texture-path') && self.getAttribute('texture-path').toLowerCase() !== 'false'){
        const singleTextureKeys = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap',
        'moonApertureSizeMap', 'moonApertureOrientationMap', 'starColorMap', 'solarEclipseMap',
        'eclipseShadowLUT', 'milkyWayEmissionMap', 'milkyWayAbsorptionMap'];
        const multiTextureKeys = ['starHashCubemap', 'dimStarDataMaps', 'medStarDataMaps', 'brightStarDataMaps',
        'blueNoiseMaps', 'auroraMaps'];

        //Process single texture keys
        for(let i = 0; i < singleTextureKeys.length; ++i){
          const textureKey = singleTextureKeys[i];
          StarrySky.assetPaths[textureKey] = `${path}/${StarrySky.DefaultData.fileNames[textureKey]}`;
        }

        //Process multi texture keys
        for(let i = 0; i < multiTextureKeys.length; ++i){
          const multiTextureKey = multiTextureKeys[i];
          const fileNameArray = StarrySky.DefaultData.fileNames[multiTextureKey];
          const assetPathArray = StarrySky.assetPaths[multiTextureKey];
          for(let j = 0; j < fileNameArray.length; ++j){
            assetPathArray[j] = `${path}/${fileNameArray[j]}`;
          }
        }
      }
      else if(self.hasAttribute('moon-path') && self.getAttribute('moon-path').toLowerCase() !== 'false'){
        const moonTextureKeys = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap',
        'moonApertureSizeMap', 'moonApertureOrientationMap'];
        for(let i = 0; i < moonTextureKeys.length; ++i){
          const moonTextureKey = moonTextureKeys[i];
          StarrySky.assetPaths[moonTextureKey] = `${path}/${StarrySky.DefaultData.fileNames[moonTextureKey]}`;
        }
      }
      else if(self.hasAttribute('star-path') && self.getAttribute('star-path').toLowerCase() !== 'false'){
        const starTextureKeys = ['starHashCubemap', 'dimStarDataMaps', 'medStarDataMaps', 'brightStarDataMaps'];
        for(let i = 0; i < starTextureKeys.length; ++i){
          const starMapFileNames =  StarrySky.DefaultData.fileNames[starTextureKeys[i]];
          const starTextureKey = starTextureKeys[i];
          const starAssetPathArray = StarrySky.assetPaths[starTextureKey];
          for(let j = 0; j < starMapFileNames.length; ++j){
            starAssetPathArray[j] = `${path}/${starMapFileNames[j]}`;
          }
        }

        StarrySky.assetPaths['starColorMap'] = `${path}/${StarrySky.DefaultData.fileNames['starColorMap']}`;
      }
      else if(self.hasAttribute('blue-noise-path') && self.getAttribute('blue-noise-path').toLowerCase() !== 'false'){
        const blueNoiseAssetPath = StarrySky.assetPaths['blueNoiseMaps'];
        const blueNoiseFileNameStrings = StarrySky.DefaultData.fileNames['blueNoiseMaps'];
        for(let i = 0; i < 5; ++i){
          blueNoiseAssetPath[i] = `${path}/${blueNoiseFileNameStrings[i]}`;
        }
      }
      else if(self.hasAttribute('solar-eclipse-path') && self.getAttribute('solar-eclipse-path').toLowerCase() !== 'false'){
        StarrySky.assetPaths['solarEclipseMap'] = `${path}/${StarrySky.DefaultData.fileNames['solarEclipseMap']}`;
      }
      else if(self.hasAttribute('lunar-eclipse-path') && self.getAttribute('lunar-eclipse-path').toLowerCase() !== 'false'){
        StarrySky.assetPaths['eclipseShadowLUT'] = `${path}/${StarrySky.DefaultData.fileNames['eclipseShadowLUT']}`;
      }
      else if(self.hasAttribute('aurora-map-path') && self.getAttribute('aurora-map-path').toLowerCase() !== 'false'){
        const auroraMapPaths = StarrySky.assetPaths['auroraMaps'];
        for(let i = 0; i < 1; ++i){
          auroraMapPaths[i] = `${path}/${StarrySky.DefaultData.fileNames['auroraMaps'][i]}`;
        }
      }
      else if(self.hasAttribute('milky-way-path') && self.getAttribute('milky-way-path').toLowerCase() !== 'false'){
        StarrySky.assetPaths['milkyWayEmissionMap'] = `${path}/${StarrySky.DefaultData.fileNames['milkyWayEmissionMap']}`;
        StarrySky.assetPaths['milkyWayAbsorptionMap'] = `${path}/${StarrySky.DefaultData.fileNames['milkyWayAbsorptionMap']}`;
      }
      else{
        //No category attribute - look for individual asset child tags and apply
        //this directory to each one. This is the form documented in the README,
        //e.g. <sky-assets-dir dir="lunar_eclipse"><sky-eclipse-shadow-lut/></sky-assets-dir>.
        for(const child of self.children){
          const assetKey = childTagToAssetKey[child.nodeName.toLowerCase()];
          if(!assetKey) continue;
          const fileNames = StarrySky.DefaultData.fileNames[assetKey];
          if(Array.isArray(fileNames)){
            const assetPathArray = StarrySky.assetPaths[assetKey];
            for(let i = 0; i < fileNames.length; ++i){
              assetPathArray[i] = `${path}/${fileNames[i]}`;
            }
          }
          else{
            StarrySky.assetPaths[assetKey] = `${path}/${fileNames}`;
          }
        }
      }

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });

    this.loaded = true;
  };
}
window.customElements.define('sky-assets-dir', SkyAssetsDir);
