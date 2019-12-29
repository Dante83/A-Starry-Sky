//Child tags
window.customElements.define('sky-luminance', class extends HTMLElement{});
window.customElements.define('sky-mie-coefficient', class extends HTMLElement{});
window.customElements.define('sky-mie-directional-g', class extends HTMLElement{});
window.customElements.define('sky-rayleigh', class extends HTMLElement{});
window.customElements.define('sky-turbity', class extends HTMLElement{});
window.customElements.define('sky-number-of-ray-steps', class extends HTMLElement{});

//Parent tag
class SkyParameters extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = {
      luminance: null,
      mieCoefficient: null,
      mieDirectionalG: null,
      rayleigh: null,
      turbidity: null,
      numberOfRaySteps: null,
    };
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
      let rayleighTags = self.getElementsByTagName('sky-rayleigh');
      let turbidityTags = self.getElementsByTagName('sky-turbidity');
      let numberOfRayStepsTags = self.getElementsByTagName('sky-number-of-ray-steps');

      [luminanceTags, mieCoefficientTags, mieDirectionalGTags, rayleighTags, turbidityTags, numberOfRayStepsTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      self.data.luminance = luminanceTags.length > 0 ? parseFloat(luminanceTags[0].innerHTML) : null;
      self.data.mieCoefficient = mieCoefficientTags.length > 0 ? parseFloat(mieCoefficientTags[0].innerHTML) : null;
      self.data.mieDirectionalG = mieDirectionalGTags.length > 0 ? parseFloat(mieDirectionalGTags[0].innerHTML) : null;
      self.data.rayleigh = rayleighTags.length > 0 ? parseFloat(rayleighTags[0].innerHTML) : null;
      self.data.turbidity = turbidityTags.length > 0 ? parseFloat(turbidityTags[0].innerHTML) : null;
      self.data.numberOfRaySteps = numberOfRayStepsTags.length > 0 ? parseInt(numberOfRayStepsTags[0].innerHTML) : null;

      //Clamp our results to the appropriate ranges
      let clampAndWarn = function(inValue, minValue, maxValue, tagName){
        let result = Math.min(Math.max(inValue, minValue), maxValue);
        if(inValue > maxValue || inValue < minValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a max value of ${maxValue} and a minimum value of ${minValue}.`);
        }
        return result;
      };

      self.data.luminance = self.data.luminance ? clampAndWarn(self.data.luminance, 0.0, 2.0, '<sky-luminance>') : null;
      self.data.mieCoefficient = self.data.mieCoefficient ? clampAndWarn(self.data.mieCoefficient, 0.0, 0.1, '<sky-mie-coefficient>') : null;
      self.data.mieDirectionalG = self.data.mieDirectionalG ? clampAndWarn(self.data.mieDirectionalG, 0.0, 1.0, '<sky-mie-directional-g>') : null;
      self.data.rayleigh = self.data.rayleigh ? clampAndWarn(self.data.rayleigh, 0.0, 4.0, '<sky-rayleigh>') : null;
      self.data.turbidity = self.data.turbidity ? clampAndWarn(self.data.turbidity, 0.0, 20.0, '<sky-turbidity>') : null;
      self.data.numberOfRaySteps = self.data.numberOfRaySteps ? clampAndWarn(self.data.numberOfRaySteps, 3, 1000, '<sky-number-of-ray-steps>') : null;
      self.skyDataLoaded = true;
      self.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-parameters', SkyParameters);
