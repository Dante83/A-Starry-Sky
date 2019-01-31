//Child classes
window.customElements.define('sky-moon-texture', class extends HTMLElement{});
window.customElements.define('sky-moon-normal-map', class extends HTMLElement{});
window.customElements.define('sky-stars', class extends HTMLElement{});

//Parent class
class SkyAssetDir extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.moonTexture;
    this.moonNormalTexture;
    this.starBinaryData;
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
          console.error(`The <sky-asset-dir> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      self.moonTexture = moonTextureTags.length > 0 ? parseFloat(moonTextureTags[0].innerHTML) : null;
      self.moonNormalTexture = moonNormalTextureTags.length > 0 ? parseFloat(moonNormalTextureTags[0].innerHTML) : null;
      this.starBinaryData = starBinaryDataTags.length > 0 ? parseFloat(starBinaryDataTags[0].innerHTML) : null;
    });
  };
}
window.customElements.define('sky-asset-dir', SkyAssetDir);
