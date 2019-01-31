//Child tags
window.customElements.define('sky-luminance', class extends HTMLElement{});
window.customElements.define('sky-mie-coefficient', class extends HTMLElement{});
window.customElements.define('sky-mie-directional-g', class extends HTMLElement{});
window.customElements.define('sky-reileigh', class extends HTMLElement{});
window.customElements.define('sky-turbity', class extends HTMLElement{});

//Parent tag
class SkyParameters extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.luminence;
    this.mieCoefficient;
    this.mieDirectionalG;
    this.reileigh;
    this.turbidity;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let luminanceTags = self.getElementsByTagName('sky-luminance');
      let mieCoefficientTags = self.getElementsByTagName('sky-mie-coefficient');
      let mieDirectionalGTags = self.getElementsByTagName('sky-mie-directional-g');
      let reileighTags = self.getElementsByTagName('sky-reileigh');
      let turbidityTags = self.getElementsByTagName('sky-turbity');

      [luminanceTags, mieCoefficientTags, mieDirectionalGTags, reileighTags, turbidityTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      self.luminence = luminanceTags.length > 0 ? parseFloat(luminanceTags[0].innerHTML) : null;
      self.mieCoefficient = mieCoefficientTags.length > 0 ? parseFloat(mieCoefficientTags[0].innerHTML) : null;
      self.mieDirectionalG = mieDirectionalGTags.length > 0 ? parseFloat(mieDirectionalGTags[0].innerHTML) : null;
      self.reileigh = reileighTags.length > 0 ? parseFloat(reileighTags[0].innerHTML) : null;
      self.turbidity = turbidityTags.length > 0 ? turbidityTags[0].innerHTML) : null;
    });
  };
}
window.customElements.define('sky-parameters', SkyParameters);
