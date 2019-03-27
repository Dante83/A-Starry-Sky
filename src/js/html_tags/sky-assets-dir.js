//Child classes
window.customElements.define('sky-moon-texture', class extends HTMLElement{});
window.customElements.define('sky-moon-normal-map', class extends HTMLElement{});
window.customElements.define('sky-stars', class extends HTMLElement{});

//Parent class
class SkyAssetsDir extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = {
      moonTexture: null,
      moonNormalTexture: null,
      starBinaryData: null
    };
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let moonTextureTags = self.getElementsByTagName('sky-moon-texture');
      let moonNormalTextureTags = self.getElementsByTagName('sky-moon-normal-map');
      let starBinaryDataTags = self.getElementsByTagName('sky-stars');

      [moonTextureTags, moonNormalTextureTags, starBinaryDataTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-assets-dir> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      let prefix = 'dir' in self.attributes ? self.attributes.dir.value : '';

      //Set the params to appropriate values or default
      self.data.moonTexture = moonTextureTags.length > 0 ? prefix.concat(moonTextureTags[0].innerHTML) : null;
      self.data.moonNormalTexture = moonNormalTextureTags.length > 0 ? prefix.concat(moonNormalTextureTags[0].innerHTML) : null;
      self.data.starBinaryData = starBinaryDataTags.length > 0 ? prefix.concat(starBinaryDataTags[0].innerHTML) : null;
      self.skyDataLoaded = true;

      self.dispatchEvent(new Event('Sky-Data-Loaded'));
    });

    this.loaded = true;
  };
}
window.customElements.define('sky-assets-dir', SkyAssetsDir);
