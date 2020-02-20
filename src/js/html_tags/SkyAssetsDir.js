//Child classes
window.customElements.define('sky-moon-diffuse-texture', class extends HTMLElement{});
window.customElements.define('sky-moon-specular-map', class extends HTMLElement{});
window.customElements.define('sky-moon-normal-map', class extends HTMLElement{});
window.customElements.define('sky-star-data-libary', class extends HTMLElement{});
window.customElements.define('sky-star-hash-map', class extends HTMLElement{});

StarrySky.DefaultData.skyAssets = {
  moonDiffuseTexture: '../copy_me_to_assets_dir/moon-dif.png',
  moonSpecularMap: '../copy_me_to_assets_dir/moon-spec.png',
  moonNormalTexture: '../copy_me_to_assets_dir/moon-norm.png',
  starDataLibrary: '../copy_me_to_assets_dir/stars.dat',
  starHashMap: '../copy_me_to_assets_dir/star-hash.dat'
};

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
      //Get child tags and acquire their values.
      let moonDiffuseTextureTags = self.getElementsByTagName('sky-moon-diffuse-texture');
      let moonSpecularTextureTags = self.getElementsByTagName('sky-moon-specular-map');
      let moonNormalTextureTags = self.getElementsByTagName('sky-moon-normal-map');
      let starDataLibaryTags = self.getElementsByTagName('sky-star-data-libary');
      let starHashMapTags = self.getElementsByTagName('sky-star-hash-map');

      [moonDiffuseTextureTags, moonNormalTextureTags, starDataLibaryTags, starHashMapTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-assets-dir> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      let prefix = 'dir' in self.attributes ? self.attributes.dir.value : '';

      //Set the params to appropriate values or default
      self.data.moonDiffuseTexture = moonDiffuseTextureTags.length > 0 ? prefix.concat(moonDiffuseTextureTags[0].innerHTML) : null;
      self.data.moonSpecularMap = moonSpecularTextureTags.length > 0 ? prefix.concat(moonSpecularTextureTags[0].innerHTML) : null;
      self.data.moonNormalTexture = moonNormalTextureTags.length > 0 ? prefix.concat(moonNormalTextureTags[0].innerHTML) : null;
      self.data.starDataLibrary = starDataLibaryTags.length > 0 ? prefix.concat(starDataLibaryTags[0].innerHTML) : null;
      self.data.starHashMap = starHashMapTags.length > 0 ? prefix.concat(starHashMapTags[0].innerHTML) : null;
      self.skyDataLoaded = true;

      self.dispatchEvent(new Event('Sky-Data-Loaded'));
    });

    this.loaded = true;
  };
}
window.customElements.define('sky-assets-dir', SkyAssetsDir);
