//child tags
window.customElements.define('sky-latitude', class extends HTMLElement{});
window.customElements.define('sky-longitude', class extends HTMLElement{});

StarrySky.DefaultData.location = {
  latitude: 38,
  longitude: -122
};

//Parent method
class SkyLocation extends HTMLElement {
  constructor(){
    super();

    //Get the child values and make sure both are present or default to San Francisco
    //And throw a console warning
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.location;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let latitudeTags = self.getElementsByTagName('sky-latitude');
      let longitudeTags = self.getElementsByTagName('sky-longitude');

      [latitudeTags, longitudeTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-location> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Logical XOR ( a || b ) && !( a && b )
      let conditionA = latitudeTags.length === 1;
      let conditionB = longitudeTags.length === 1;
      if((conditionA || conditionB) && !(conditionA && conditionB)){
        if(conditionA){
          console.error('The <sky-location> tag must contain both a <sky-latitude> and <sky-longitude> tag. Only a <sky-latitude> tag was found.');
        }
        else{
          console.error('The <sky-location> tag must contain both a <sky-latitude> and <sky-longitude> tag. Only a <sky-longitude> tag was found.');
        }
      }

      //Set the params to appropriate values or default
      self.data.latitude = latitudeTags.length > 0 ? parseFloat(latitudeTags[0].innerHTML) : null;
      self.data.longitude = longitudeTags.length > 0 ? parseFloat(longitudeTags[0].innerHTML) : null;

      //Clamp the results
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

      //By some horrible situation. The maximum and minimum offset for UTC timze is 26 hours apart.
      self.data.latitude = self.data.latitude ? clampAndWarn(self.data.latitude, -90.0, 90.0, '<sky-latitude>') : null;
      self.data.longitude = self.data.longitude ? clampAndWarn(self.data.longitude, -180.0, 180.0, '<sky-longitude>') : null;
      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-location', SkyLocation);
