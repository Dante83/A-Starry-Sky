//Child tags
window.customElements.define('sky-date', class extends HTMLElement{});
window.customElements.define('sky-time-multiplier', class extends HTMLElement{});
window.customElements.define('sky-utc-offset', class extends HTMLElement{});

let hideStarrySkyTemplate = document.createElement('template');
hideStarrySkyTemplate.innerHTML = `<style display="none;">{ ... }</style>`;

//Parent tag
class SkyTime extends HTMLElement {
  constructor(){
    super();

    //Set this to hidden
    this.date = null;
    this.utcOffset = null;
    this.timeMultiplier = null;
  };

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let skyDateTags = self.getElementsByTagName('sky-date');
      let utcOffsetTags = self.getElementsByTagName('sky-time-multiplier');
      let timeMultiplierTags = self.getElementsByTagName('sky-utc-offset');

      [skyDateTags, utcOffsetTags, timeMultiplierTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-time> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      self.date = skyDateTags.length > 0 ? skyDateTags[0].innerHTML : null;
      self.utcOffset = utcOffsetTags.length > 0 ? parseFloat(utcOffsetTags[0].innerHTML) : null;
      self.timeMultiplier = timeMultiplierTags.length > 0 ? parseFloat(imeMultiplierTags[0].innerHTML) : null;
    });
  };
}
window.customElements.define('sky-time', SkyTime);
