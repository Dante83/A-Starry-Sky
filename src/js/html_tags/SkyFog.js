//Child tags
window.customElements.define('sky-fog-mie-coeficient', class extends HTMLElement{});
window.customElements.define('sky-fog-turbidity', class extends HTMLElement{});
window.customElements.define('sky-fog-rayleigh', class extends HTMLElement{});
window.customElements.define('sky-fog-exposure', class extends HTMLElement{});
window.customElements.define('sky-fog-distance-multiplier', class extends HTMLElement{});

StarrySky.DefaultData.fog = {
  enhancedPerspectiveEnabled: false,
  mieCoefficient: 0.005,
  turbidity: 10.0,
  rayleigh: 3.0,
  exposure: 0.35,
  atmosphericDistanceMultiplier: 1.0
};

//Parent tag
class SkyFog extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.lighting;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      const dataRef = self.data;


      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-fog', SkyFog);
