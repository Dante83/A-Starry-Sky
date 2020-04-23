//Child tags
window.customElements.define('sky-solar-intensity', class extends HTMLElement{});
window.customElements.define('sky-lunar-max-intensity', class extends HTMLElement{});
window.customElements.define('sky-rayleigh-molecular-density', class extends HTMLElement{});
window.customElements.define('sky-air-index-of-refraction', class extends HTMLElement{});
window.customElements.define('sky-solar-color', class extends HTMLElement{});
window.customElements.define('sky-lunar-color', class extends HTMLElement{});
window.customElements.define('sky-color-red', class extends HTMLElement{});
window.customElements.define('sky-color-green', class extends HTMLElement{});
window.customElements.define('sky-color-blue', class extends HTMLElement{});
window.customElements.define('sky-mie-directional-g', class extends HTMLElement{});
window.customElements.define('sky-number-of-ray-steps', class extends HTMLElement{});
window.customElements.define('sky-number-of-gathering-steps', class extends HTMLElement{});
window.customElements.define('sky-ozone-enabled', class extends HTMLElement{});
window.customElements.define('sky-sun-angular-diameter', class extends HTMLElement{});

StarrySky.DefaultData.skyAtmosphericParameters = {
  solarIntensity: 1367.0,
  lunarMaxIntensity: 29,
  rayleighMolecularDensity: 2.545E25,
  indexOfRefractionofAir: 1.0003,
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
  sunAngularDiameter: 0.59
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

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let solarIntensityTags = self.getElementsByTagName('sky-solar-intensity');
      let lunarMaxIntensityTags = self.getElementsByTagName('sky-lunar-max-intensity');
      let rayleighMolecularDensityTags = self.getElementsByTagName('sky-rayleigh-molecular-density');
      let airIndexOfRefractionTags = self.getElementsByTagName('sky-air-index-of-refraction');
      let solarColorTags = self.getElementsByTagName('sky-solar-color');
      let lunarColorTags = self.getElementsByTagName('sky-lunar-color');
      let mieBetaTags = self.getElementsByTagName('sky-lunar-color');
      let mieDirectionalGTags = self.getElementsByTagName('sky-mie-directional-g');
      let numberOfRayStepsTags = self.getElementsByTagName('sky-number-of-ray-steps');
      let numberOfGatheringStepsTags = self.getElementsByTagName('sky-number-of-gathering-steps');
      let ozoneEnabledTags = self.getElementsByTagName('sky-ozone-enabled');
      let sunAngularDiameterTags = self.getElementsByTagName('sky-sun-angular-diameter');

      [solarIntensityTags, lunarMaxIntensityTags, rayleighMolecularDensityTags, airIndexOfRefractionTags,
      solarColorTags, lunarColorTags, mieBetaTags, mieDirectionalGTags, numberOfRayStepsTags,
      numberOfGatheringStepsTags, ozoneEnabledTags, sunAngularDiameterTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //With special subcases for our solar and color tags
      [solarColorTags, lunarColorTags, mieBetaTags].forEach(function(tags){
        if(tags.length === 1){
          //Check that it only contains one of each of the following child tags
          let redTags = tags[0].getElementsByTagName('sky-color-red');
          let greenTags = tags[0].getElementsByTagName('sky-color-green');
          let blueTags = tags[0].getElementsByTagName('sky-color-blue');
          [redTags, greenTags, blueTags].forEach(function(colorTags){
            if(tags.length !== 1){
              console.error(`The <${tags[0].tagName}> tag must contain 1 and only 1 tag of type <${colorTags[0].tagName}>. ${colorTags.length} found.`);
            }
          });
        }
      });

      //Set the params to appropriate values or default
      this.data.solarIntensity = solarIntensityTags.length > 0 ? parseFloat(solarIntensityTags[0].innerHTML) : this.data.solarIntensity;
      this.data.lunarMaxIntensity = lunarMaxIntensityTags.length > 0 ? parseFloat(lunarMaxIntensityTags[0].innerHTML) : this.data.lunarMaxIntensity;
      this.data.rayleighMolecularDensity = rayleighMolecularDensityTags.length > 0 ? parseFloat(rayleighMolecularDensityTags[0].innerHTML) : this.data.rayleighMolecularDensity;
      this.data.indexOfRefractionofAir = airIndexOfRefractionTags.length > 0 ? parseFloat(airIndexOfRefractionTags[0].innerHTML) : this.data.indexOfRefractionofAir;
      this.data.mieDirectionalG = mieDirectionalGTags.length > 0 ? parseFloat(mieDirectionalGTags[0].innerHTML) : this.data.mieDirectionalG;
      this.data.numberOfRaySteps = numberOfRayStepsTags.length > 0 ? parseFloat(numberOfRayStepsTags[0].innerHTML) : this.data.numberOfRaySteps;
      this.data.numberOfGatheringSteps = numberOfGatheringStepsTags.length > 0 ? parseFloat(numberOfGatheringStepsTags[0].innerHTML) : this.data.numberOfGatheringSteps;
      this.data.ozoneEnabled = ozoneEnabledTags.length > 0 ? JSON.parse(ozoneEnabledTags[0].innerHTML.toLowerCase()) === true : this.data.ozoneEnabled;
      this.data.sunAngularDiameter = sunAngularDiameterTags.length > 0 ? parseFlot(sunAngularDiameterTags[0].innerHTML) : this.data.sunAngularDiameter;

      let listOfColorBasedTags = [solarColorTags, lunarColorTags, mieBetaTags];
      let listOfDatas = [this.data.solarColor, this.data.lunarColor, this.data.mieBeta]

      for(let i = 0; i < listOfColorBasedTags.length; ++i){
        let colorBasedTags = listOfColorBasedTags[i];
        let correspondingData = listOfDatas[i];
        if(colorBasedTags.length === 1){
          if(colorBasedTags.getElementsByTagName('sky-color-red').length > 0){
            correspondingData.red = parseFloat(solarIntensityTags.getElementsByTagName('sky-color-red')[0].innerHTML);
          }
          if(colorBasedTags.getElementsByTagName('sky-color-green').length > 0){
            correspondingData.green = parseFloat(solarIntensityTags.getElementsByTagName('sky-color-green')[0].innerHTML);
          }
          if(colorBasedTags.getElementsByTagName('sky-color-blue').length > 0){
            correspondingData.blue = parseFloat(solarIntensityTags.getElementsByTagName('sky-color-blue')[0].innerHTML);
          }
        }
      }

      //Clamp our results to the appropriate ranges
      let clampAndWarn = function(inValue, minValue, maxValue, tagName){
        let result = Math.min(Math.max(inValue, minValue), maxValue);
        if(inValue > maxValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a max value of ${maxValue} and a minimum value of ${minValue}.`);
        }
        else if(inValue < minValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a minmum value of ${minValue} and a minimum value of ${minValue}.`);
        }
        return result;
      };

      this.data.solarIntensity = clampAndWarn(this.data.solarIntensity, 0.0, 10000.0, '<sky-solar-intensity>');
      this.data.lunarMaxIntensity = clampAndWarn(this.data.solarIntensity, 0.0, 10000.0, '<sky-lunar-max-intensity>');
      this.data.rayleighMolecularDensity = clampAndWarn(this.data.rayleighMolecularDensity, 2.545E21, 2.545E34, '<sky-rayleigh-molecular-density>');
      this.data.indexOfRefractionofAir = clampAndWarn(this.data.indexOfRefractionofAir, 1.0, 2.5, '<sky-air-index-of-refraction>');
      this.data.mieDirectionalG = clampAndWarn(this.data.mieDirectionalG, -1.0, 1.0, '<sky-mie-directional-g>');
      this.data.numberOfRaySteps = clampAndWarn(this.data.numberOfRaySteps, 2, 1000, '<sky-number-of-ray-steps>');
      this.data.numberOfGatheringSteps = clampAndWarn(this.data.numberOfGatheringSteps, 2, 1000, '<sky-number-of-gathering-steps>');
      this.data.sunAngularDiameter = clampAndWarn(this.data.sunAngularDiameter, 0.1, 90.0, '<sky-sun-angular-diameter>');

      //
      //TODO: Clamp and warn each of our color systems.
      //

      self.skyDataLoaded = true;
      self.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-atmospheric-parameters', SkyAtmosphericParameters);
