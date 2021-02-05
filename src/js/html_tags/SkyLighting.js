//Child tags
window.customElements.define('sky-ground-color', class extends HTMLElement{});
window.customElements.define('sky-ground-color-red', class extends HTMLElement{});
window.customElements.define('sky-ground-color-green', class extends HTMLElement{});
window.customElements.define('sky-ground-color-blue', class extends HTMLElement{});
window.customElements.define('sky-atmospheric-perspective-density', class extends HTMLElement{});
window.customElements.define('sky-shadow-camera-size', class extends HTMLElement{});
window.customElements.define('sky-shadow-camera-resolution', class extends HTMLElement{});

StarrySky.DefaultData.lighting = {
  groundColor: {
    red: 101,
    green: 67,
    blue: 3
  },
  atmosphericPerspectiveEnabled: true,
  atmosphericPerspectiveDensity: 0.007,
  shadowCameraSize: 32.0,
  shadowCameraResolution: 2048
};

//Parent tag
class SkyLighting extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.lightingParameters;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let groundColorTags = self.getElementsByTagName('sky-ground-color');
      let atmosphericPerspectiveDensityTags = self.getElementsByTagName('sky-atmospheric-perspective-density');
      let shadowCameraSizeTags = self.getElementsByTagName('sky-shadow-camera-size');
      let shadowCameraResolutionTags = self.getElementsByTagName('sky-shadow-camera-resolution');

      [groundColorTags, atmosphericPerspectiveDisabledTags, shadowCameraSizeTags, shadowCameraResolutionTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-lighting-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //With special subcases for our ground color tags
      [groundColor].forEach(function(tags){
        if(tags.length === 1){
          //Check that it only contains one of each of the following child tags
          let redTags = tags[0].getElementsByTagName('sky-ground-color-red');
          let greenTags = tags[0].getElementsByTagName('sky-ground-color-green');
          let blueTags = tags[0].getElementsByTagName('sky-ground-color-blue');
          [redTags, greenTags, blueTags].forEach(function(colorTags){
            if(tags.length !== 1){
              console.error(`The <${tags[0].tagName}> tag must contain 1 and only 1 tag of type <${colorTags[0].tagName}>. ${colorTags.length} found.`);
            }
          });
        }
      });

      //Parse the values in our tags
      self.data.atmosphericPerspectiveDensity = atmosphericPerspectiveDensityTags.length > 0 ? parseFloat(atmosphericPerspectiveDensityTags[0].innerHTML) : self.data.atmosphericPerspectiveDensity;
      self.data.atmosphericPerspectiveEnabled = self.data.atmosphericPerspectiveDensity > 0.0;
      self.data.shadowCameraSize = shadowCameraSizeTags.length > 0 ? parseFloat(shadowCameraSizeTags[0].innerHTML) : self.data.shadowCameraSize;
      self.data.shadowCameraResolution = shadowCameraResolutionTags.length > 0 ? parseFloat(shadowCameraResolutionTags[0].innerHTML) : self.data.shadowCameraResolution;

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

      //Clamp the values in our tags
      self.data.atmosphericPerspectiveDensity = clampAndWarn(self.data.atmosphericPerspectiveDensity, 0.0, Infinity, '<sky-atmospheric-perspective-density>');
      self.data.shadowCameraSize = clampAndWarn(self.data.shadowCameraSize, 0.0, Infinity, '<sky-shadow-camera-size>');
      self.data.shadowCameraResolution = clampAndWarn(self.data.shadowCameraResolution, 32, 15360, '<sky-shadow-camera-resolution>');

      //Parse our ground color
      if(groundColor.length === 1){
        if(groundColor.getElementsByTagName('sky-ground-color-red').length > 0){
          self.data.groundColor.red = clampAndWarn(parseInt(solarIntensityTags.getElementsByTagName('sky-ground-color-red')[0].innerHTML), 0, 255, 'sky-ground-color-red');
        }
        if(groundColor.getElementsByTagName('sky-ground-color-green').length > 0){
          self.data.groundColor.green = clampAndWarn(parseInt(solarIntensityTags.getElementsByTagName('sky-ground-color-green')[0].innerHTML), 0, 255, 'sky-ground-color-red');
        }
        if(groundColor.getElementsByTagName('sky-ground-color-blue').length > 0){
          self.data.groundColor.blue = clampAndWarn(parseInt(solarIntensityTags.getElementsByTagName('sky-ground-color-blue')[0].innerHTML), 0, 255, 'sky-ground-color-red');
        }
      }

      self.skyDataLoaded = true;
      self.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-lighting', SkyLighting);
