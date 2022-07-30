//Child tags
window.customElements.define('sky-mie-directional-g', class extends HTMLElement{});
window.customElements.define('sky-sun-angular-diameter', class extends HTMLElement{});
window.customElements.define('sky-moon-angular-diameter', class extends HTMLElement{});

StarrySky.DefaultData.skyAtmosphericParameters = {
  solarIntensity: 1367.0,
  lunarMaxIntensity: 29,
  solarColor: {
    red: 6.5E-7,
    green: 5.1E-7,
    blue: 4.75E-7
  },
  lunarColor: {
    red: 6.5E-7,
    green: 5.1E-7,
    blue: 4.75E-7
  },
  mieBeta: {
    red: 2E-6,
    green: 2E-6,
    blue: 2E-6
  },
  mieDirectionalG: 0.8,
  numberOfRaySteps: 30,
  numberOfGatheringSteps: 30,
  ozoneEnabled: true,
  sunAngularDiameter: 3.38,
  moonAngularDiameter: 3.15,
};

//Parent tag
class SkyAtmosphericParameters extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyAtmosphericParameters;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Data Ref
      const dataRef = self.data;

      //Get child tags and acquire their values.
      const mieDirectionalGTags = self.getElementsByTagName('sky-mie-directional-g');
      const sunAngularDiameterTags = self.getElementsByTagName('sky-sun-angular-diameter');
      const moonAngularDiameterTags = self.getElementsByTagName('sky-moon-angular-diameter');

      [mieDirectionalGTags, sunAngularDiameterTags, moonAngularDiameterTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      dataRef.mieDirectionalG = mieDirectionalGTags.length > 0 ? parseFloat(mieDirectionalGTags[0].innerHTML) : dataRef.mieDirectionalG;
      dataRef.sunAngularDiameter = sunAngularDiameterTags.length > 0 ? parseFloat(sunAngularDiameterTags[0].innerHTML) : dataRef.sunAngularDiameter;
      dataRef.moonAngularDiameter = moonAngularDiameterTags.length > 0 ? parseFloat(moonAngularDiameterTags[0].innerHTML) : dataRef.moonAngularDiameter;

      //Clamp and warn our values
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.mieDirectionalG = clampAndWarn(dataRef.mieDirectionalG, -1.0, 1.0, '<sky-mie-directional-g>');
      dataRef.sunAngularDiameter = clampAndWarn(dataRef.sunAngularDiameter, 0.1, 90.0, '<sky-sun-angular-diameter>');
      dataRef.moonAngularDiameter = clampAndWarn(dataRef.moonAngularDiameter, 0.1, 90.0, '<sky-moon-angular-diameter>');

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-atmospheric-parameters', SkyAtmosphericParameters);
