//Child tags
window.customElements.define('sky-milky-way-enabled', class extends HTMLElement{});
window.customElements.define('sky-milky-way-intensity', class extends HTMLElement{});

StarrySky.DefaultData.skyMilkyWay = {
  //Unlike <sky-aurora> and <sky-clouds>, whose mere presence switches the
  //feature on, the Milky Way is on by default -- a night sky without the
  //galactic band is the unusual case. So this default is true, and
  //<sky-milky-way-enabled>false</sky-milky-way-enabled> is the opt-out.
  milkyWayEnabled: true,
  milkyWayIntensity: 0.7
};

class SkyMilkyWay extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyMilkyWay;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Data Ref
      const dataRef = self.data;

      const enabledTags = self.getElementsByTagName('sky-milky-way-enabled');
      const intensityTags = self.getElementsByTagName('sky-milky-way-intensity');

      [enabledTags, intensityTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-milky-way> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Parse the values in our tags
      if(enabledTags.length > 0){
        dataRef.milkyWayEnabled = enabledTags[0].innerHTML.trim().toLowerCase() !== 'false';
      }
      dataRef.milkyWayIntensity = intensityTags.length > 0 ? parseFloat(intensityTags[0].innerHTML) : dataRef.milkyWayIntensity;

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.milkyWayIntensity = clampAndWarn(dataRef.milkyWayIntensity, 0.0, Infinity, '<sky-milky-way-intensity>');

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  }
};
window.customElements.define('sky-milky-way', SkyMilkyWay);
