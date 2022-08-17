//Child tags
window.customElements.define('sky-date', class extends HTMLElement{});
window.customElements.define('sky-speed', class extends HTMLElement{});
window.customElements.define('sky-utc-offset', class extends HTMLElement{});

let hideStarrySkyTemplate = document.createElement('template');
hideStarrySkyTemplate.innerHTML = `<style display="none;">{ ... }</style>`;

StarrySky.DefaultData.time;
(function setupAStarrySkyDefaultTimeData(){
  //Using https://stackoverflow.com/questions/10632346/how-to-format-a-date-in-mm-dd-yyyy-hhmmss-format-in-javascript
  const now = new Date();
  StarrySky.DefaultData.time = {
    date: [now.getMonth()+1,
               now.getDate(),
               now.getFullYear()].join('/')+' '+
              [now.getHours(),
               now.getMinutes(),
               now.getSeconds()].join(':'),
    utcOffset: 7,
    speed: 1.0
  };
})();

//Parent tag
class SkyTime extends HTMLElement {
  constructor(){
    super();

    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.time;
  };

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let skyDateTags = self.getElementsByTagName('sky-date');
      let speedTags = self.getElementsByTagName('sky-speed');
      let utcOffsetTags = self.getElementsByTagName('sky-utc-offset');

      [skyDateTags, utcOffsetTags, speedTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-time> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      self.data.date = skyDateTags.length > 0 ? skyDateTags[0].innerHTML : self.data.date;
      self.data.utcOffset = utcOffsetTags.length > 0 ? -parseFloat(utcOffsetTags[0].innerHTML) : self.data.utcOffset;
      self.data.speed = speedTags.length > 0 ? parseFloat(speedTags[0].innerHTML) : self.data.speed;

      //By some horrible situation. The maximum and minimum offset for UTC timze is 26 hours apart.
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      self.data.utcOffset = self.data.utcOffset ? clampAndWarn(self.data.utcOffset, -14.0, 12.0, '<sky-utc-offset>') : null;
      self.data.speed = self.data.speed ? clampAndWarn(self.data.speed, 0.0, 10000.0, '<sky-speed>') :null;
      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-time', SkyTime);
