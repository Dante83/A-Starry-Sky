//Child tags
window.customElements.define('sky-parameters-color-red', class extends HTMLElement{});
window.customElements.define('sky-parameters-color-green', class extends HTMLElement{});
window.customElements.define('sky-parameters-color-blue', class extends HTMLElement{});
window.customElements.define('sky-sun-color', class extends HTMLElement{});
window.customElements.define('sky-moon-color', class extends HTMLElement{});
window.customElements.define('sky-mie-beta', class extends HTMLElement{});
window.customElements.define('sky-rayleigh-beta', class extends HTMLElement{});
window.customElements.define('sky-ozone-beta', class extends HTMLElement{});
window.customElements.define('sky-number-of-atmospheric-lut-ray-steps', class extends HTMLElement{});
window.customElements.define('sky-number-of-atmospheric-lut-gathering-steps', class extends HTMLElement{});
window.customElements.define('sky-number-of-scattering-orders', class extends HTMLElement{});
window.customElements.define('sky-camera-height', class extends HTMLElement{});
window.customElements.define('sky-atmosphere-height', class extends HTMLElement{});
window.customElements.define('sky-radius-of-earth', class extends HTMLElement{});
window.customElements.define('sky-rayleigh-scale-height', class extends HTMLElement{});
window.customElements.define('sky-mie-scale-height', class extends HTMLElement{});
window.customElements.define('sky-ozone-percent-of-rayleigh', class extends HTMLElement{});
window.customElements.define('sky-mie-directional-g', class extends HTMLElement{});
window.customElements.define('sky-sun-angular-diameter', class extends HTMLElement{});
window.customElements.define('sky-moon-angular-diameter', class extends HTMLElement{});

//These are defined in sky lighting and serve about the same purpose
// window.customElements.define('sun-intensity', class extends HTMLElement{});
// window.customElements.define('moon-intensity', class extends HTMLElement{});

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
  rayleighBeta: {
    red: 5.8e-3,
    green: 1.35e-2,
    blue: 3.31e-2
  },
  ozoneBeta: {
    red: 413.470734338,
    green: 413.470734338,
    blue: 2.1112886E-13
  },
  mieScaleHeight: 1.2,
  rayleighScaleHeight: 8.0,
  atmosphereHeight: 80.0,
  cameraHeight: 0.0,
  radiusOfEarth: 6000.0,
  ozonePercentOfRayleigh: 6e-7,
  mieDirectionalG: 0.8,
  numberOfRaySteps: 30,
  numberOfGatheringSteps: 30,
  numberOfScatteringOrders: 7,
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
      const skySunColorTags = self.getElementsByTagName('sky-sun-color');
      const skyMoonColorTags = self.getElementsByTagName('sky-moon-color');
      const skyMieBetaTags = self.getElementsByTagName('sky-mie-beta');
      const skyRayleighBetaTags = self.getElementsByTagName('sky-rayleigh-beta');
      const mieScaleHeightTags = self.getElementsByTagName('sky-mie-scale-height');
      const rayleighScaleHeightTags = self.getElementsByTagName('sky-rayleigh-scale-height');
      const skyOzoneBetaTags = self.getElementsByTagName('sky-ozone-beta');
      const numberOfRayStepTags = self.getElementsByTagName('sky-number-of-atmospheric-lut-ray-steps');
      const numberOfLUTGatheringStepsTags = self.getElementsByTagName('sky-number-of-atmospheric-lut-gathering-steps');
      const numberOfScatteringOrderTags = self.getElementsByTagName('sky-number-of-scattering-orders');
      const cameraHeightTags = self.getElementsByTagName('sky-camera-height');
      const ozonePercentOfRayleighTags = self.getElementsByTagName('sky-ozone-percent-of-rayleigh');
      const radiusOfEarthTags = self.getElementsByTagName('sky-radius-of-earth');
      const sunIntensityTags = self.getElementsByTagName('sky-sun-intensity');
      const moonIntensityTags = self.getElementsByTagName('sky-moon-intensity');

      [mieDirectionalGTags, sunAngularDiameterTags, moonAngularDiameterTags,
      mieScaleHeightTags, rayleighScaleHeightTags, numberOfRayStepTags, numberOfScatteringOrderTags,
      numberOfLUTGatheringStepsTags, cameraHeightTags, ozonePercentOfRayleighTags,
      radiusOfEarthTags, sunIntensityTags, moonIntensityTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //With special subcases for our color tags
      [skySunColorTags, skyMoonColorTags, skyMieBetaTags, skyRayleighBetaTags, skyOzoneBetaTags].forEach(function(tags){
        if(tags.length === 1){
          //Check that it only contains one of each of the following child tags
          const redTags = tags[0].getElementsByTagName('sky-parameters-color-red');
          const greenTags = tags[0].getElementsByTagName('sky-parameters-color-green');
          const blueTags = tags[0].getElementsByTagName('sky-parameters-color-blue');
          [redTags, greenTags, blueTags].forEach(function(colorTags){
            if(tags.length !== 1){
              console.error(`The <${tags[0].tagName}> tag must contain 1 and only 1 tag of type <${colorTags[0].tagName}>. ${colorTags.length} found.`);
            }
          });
        }
      });

      //Set the params to appropriate values or default
      dataRef.mieDirectionalG = mieDirectionalGTags.length > 0 ? parseFloat(mieDirectionalGTags[0].innerHTML) : dataRef.mieDirectionalG;
      dataRef.sunAngularDiameter = sunAngularDiameterTags.length > 0 ? parseFloat(sunAngularDiameterTags[0].innerHTML) : dataRef.sunAngularDiameter;
      dataRef.moonAngularDiameter = moonAngularDiameterTags.length > 0 ? parseFloat(moonAngularDiameterTags[0].innerHTML) : dataRef.moonAngularDiameter;
      dataRef.numberOfRaySteps = numberOfRayStepTags.length > 0 ? parseInt(numberOfRayStepTags[0].innerHTML) : dataRef.numberOfRaySteps;
      dataRef.numberOfGatheringSteps = numberOfLUTGatheringStepsTags.length > 0 ? parseInt(numberOfLUTGatheringStepsTags[0].innerHTML) : dataRef.numberOfGatheringSteps;
      dataRef.numberOfScatteringOrders = numberOfScatteringOrderTags.length > 0 ? parseInt(numberOfScatteringOrderTags[0].innerHTML) : dataRef.numberOfScatteringOrders;
      dataRef.mieScaleHeight = mieScaleHeightTags.length > 0 ? parseFloat(parseFloat(mieScaleHeightTags[0].innerHTML)) : dataRef.mieScaleHeight;
      dataRef.rayleighScaleHeight = rayleighScaleHeightTags.length > 0 ? parseFloat(parseFloat(rayleighScaleHeightTags[0].innerHTML)) : dataRef.rayleighScaleHeight;
      dataRef.cameraHeight = cameraHeightTags.length > 0 ? parseFloat(cameraHeightTags[0].innerHTML) : dataRef.cameraHeight;
      dataRef.ozonePercentOfRayleigh = ozonePercentOfRayleighTags.length > 0 ? parseFloat(ozonePercentOfRayleighTags[0].innerHTML) : dataRef.ozonePercentOfRayleigh;
      dataRef.radiusOfEarth = radiusOfEarthTags.length > 0 ? parseFloat(radiusOfEarthTags[0].innerHTML) : dataRef.radiusOfEarth;
      dataRef.solarIntensity = sunIntensityTags.length > 0 ? parseFloat(sunIntensityTags[0].innerHTML) : dataRef.solarIntensity;
      dataRef.lunarMaxIntensity = moonIntensityTags.length > 0 ? parseFloat(moonIntensityTags[0].innerHTML) : dataRef.lunarMaxIntensity;

      //Clamp and warn our values
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.mieDirectionalG = clampAndWarn(dataRef.mieDirectionalG, -1.0, 1.0, '<sky-mie-directional-g>');
      dataRef.sunAngularDiameter = clampAndWarn(dataRef.sunAngularDiameter, 0.1, 90.0, '<sky-sun-angular-diameter>');
      dataRef.moonAngularDiameter = clampAndWarn(dataRef.moonAngularDiameter, 0.1, 90.0, '<sky-moon-angular-diameter>');
      dataRef.numberOfRaySteps = clampAndWarn(dataRef.numberOfRaySteps, 4, 1024, '<sky-number-of-atmospheric-lut-ray-steps>');
      dataRef.numberOfGatheringSteps = clampAndWarn(dataRef.numberOfGatheringSteps, 4, 1024, '<sky-number-of-atmospheric-lut-gathering-steps>');
      dataRef.numberOfScatteringOrders = clampAndWarn(dataRef.numberOfScatteringOrders, 1, 100, '<sky-number-of-scattering-orders>');
      dataRef.mieScaleHeight = clampAndWarn(dataRef.mieScaleHeight, 0.0, 1000.0, '<sky-mie-scale-height>');
      dataRef.rayleighScaleHeight = clampAndWarn(dataRef.rayleighScaleHeight, 0.0, 1E6, '<sky-rayleigh-scale-height>');
      dataRef.cameraHeight = clampAndWarn(dataRef.cameraHeight, 0.0, 80.0, '<sky-camera-height>');
      dataRef.ozonePercentOfRayleigh = clampAndWarn(dataRef.ozonePercentOfRayleigh, 0.0, 1.0, '<sky-ozone-percent-of-rayleigh>');
      dataRef.radiusOfEarth = clampAndWarn(dataRef.radiusOfEarth, 0.1, 1E6, '<sky-radius-of-earth>');
      dataRef.solarIntensity = clampAndWarn(dataRef.solarIntensity, 0.0, 1e6, '<sky-sun-intensity>');
      dataRef.lunarMaxIntensity = clampAndWarn(dataRef.lunarMaxIntensity, 0.0, 1e6, '<sky-moon-intensity>');

      //Parse our sky sun color
      if(skySunColorTags.length === 1){
        const tagGroup = skySunColorTags[0];
        const colorRef = dataRef.solarColor;
        if(tagGroup.getElementsByTagName('sky-parameters-color-red').length > 0){
          colorRef.red = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-red')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-red');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-green').length > 0){
          colorRef.green = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-green')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-green');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-blue').length > 0){
          colorRef.blue = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-blue')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-blue');
        }
      }

      //Parse our sky moon color
      if(skyMoonColorTags.length === 1){
        const tagGroup = skyMoonColorTags[0];
        const colorRef = dataRef.lunarColor;
        if(tagGroup.getElementsByTagName('sky-parameters-color-red').length > 0){
          colorRef.red = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-red')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-red');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-green').length > 0){
          colorRef.green = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-green')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-green');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-blue').length > 0){
          colorRef.blue = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-blue')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-blue');
        }
      }

      //Parse our mie beta color
      if(skyMieBetaTags.length === 1){
        const tagGroup = skyMieBetaTags[0];
        const colorRef = dataRef.mieBeta;
        if(tagGroup.getElementsByTagName('sky-parameters-color-red').length > 0){
          colorRef.red = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-red')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-red');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-green').length > 0){
          colorRef.green = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-green')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-green');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-blue').length > 0){
          colorRef.blue = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-blue')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-blue');
        }
      }

      //Parse our rayleigh beta color
      if(skyRayleighBetaTags.length === 1){
        const tagGroup = skyRayleighBetaTags[0];
        const colorRef = dataRef.rayleighBeta;
        if(tagGroup.getElementsByTagName('sky-parameters-color-red').length > 0){
          colorRef.red = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-red')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-red');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-green').length > 0){
          colorRef.green = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-green')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-green');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-blue').length > 0){
          colorRef.blue = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-blue')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-blue');
        }
      }

      //Parse our rayleigh beta color
      if(skyOzoneBetaTags.length === 1){
        const tagGroup = skyOzoneBetaTags[0];
        const colorRef = dataRef.ozoneBeta;
        if(tagGroup.getElementsByTagName('sky-parameters-color-red').length > 0){
          colorRef.red = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-red')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-red');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-green').length > 0){
          colorRef.green = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-green')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-green');
        }
        if(tagGroup.getElementsByTagName('sky-parameters-color-blue').length > 0){
          colorRef.blue = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-parameters-color-blue')[0].innerHTML), 0.0, 1.0, 'sky-parameters-color-blue');
        }
      }

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-atmospheric-parameters', SkyAtmosphericParameters);
