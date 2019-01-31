//child tags
window.customElements.define('sky-latitude', class extends HTMLElement{});
window.customElements.define('sky-longitude', class extends HTMLElement{});

//Parent method
class SkyLocation extends HTMLElement {
  constructor(){
    super();

    //Get the child values and make sure both are present or default to San Francisco
    //And throw a console warning
    this.latitude;
    this.longitude;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let latitudeTags = self.getElementsByTagName('sky-luminance');
      let longitudeTags = self.getElementsByTagName('sky-mie-coefficient');

      [latitudeTags, longitudeTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-location> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
        else if(tags.length === 0){
          console.error(`The <sky-location> tag is missing a <${tags[0].tagName}> tag. In order to set the location, both a <latitude> and <longitude> tag are required.`);
        }
      });

      //Set the params to appropriate values or default
      self.luminence = luminanceTags.length > 0 ? parseFloat(luminanceTags[0].innerHTML) : null;
      self.mieCoefficient = mieCoefficientTags.length > 0 ? parseFloat(mieCoefficientTags[0].innerHTML) : null;
    });
  };
}
window.customElements.define('sky-location', SkyLocation);
