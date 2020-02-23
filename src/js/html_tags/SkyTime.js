//Child tags
window.customElements.define('sky-date', class extends HTMLElement{});
window.customElements.define('sky-time-multiplier', class extends HTMLElement{});
window.customElements.define('sky-utc-offset', class extends HTMLElement{});

let hideStarrySkyTemplate = document.createElement('template');
hideStarrySkyTemplate.innerHTML = `<style display="none;">{ ... }</style>`;

StarrySky.DefaultData.skyTime = {
  date: (new Date()).toLocaleDateString(),
  utcOffset: -7,
  timeMultiplier: 1.0
};

//Parent tag
class SkyTime extends HTMLElement {
  constructor(){
    super();

    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyTime;
  };

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let skyDateTags = self.getElementsByTagName('sky-date');
      let timeMultiplierTags = self.getElementsByTagName('sky-time-multiplier');
      let utcOffsetTags = self.getElementsByTagName('sky-utc-offset');

      [skyDateTags, utcOffsetTags, timeMultiplierTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-time> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      self.data.date = skyDateTags.length > 0 ? skyDateTags[0].innerHTML : null;
      self.data.utcOffset = utcOffsetTags.length > 0 ? parseFloat(utcOffsetTags[0].innerHTML) : null;
      self.data.timeMultiplier = timeMultiplierTags.length > 0 ? parseFloat(timeMultiplierTags[0].innerHTML) : null;

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
      self.data.utcOffset = self.data.utcOffset ? clampAndWarn(self.data.utcOffset, -12.0, 14.0, '<sky-utc-offset>') : null;
      self.data.timeMultiplier = self.data.timeMultiplier ? clampAndWarn(self.data.timeMultiplier, 0.0, 1000.0, '<sky-time-multiplier>') :null;
      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-time', SkyTime);
