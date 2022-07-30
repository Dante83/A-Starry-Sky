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

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Data ref
      const dataRef = self.dataRef;

      //Get child tags and acquire their values.
      const latitudeTags = self.getElementsByTagName('sky-latitude');
      const longitudeTags = self.getElementsByTagName('sky-longitude');

      [latitudeTags, longitudeTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-location> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Logical XOR ( a || b ) && !( a && b )
      const conditionA = latitudeTags.length === 1;
      const conditionB = longitudeTags.length === 1;
      if((conditionA || conditionB) && !(conditionA && conditionB)){
        if(conditionA){
          console.error('The <sky-location> tag must contain both a <sky-latitude> and <sky-longitude> tag. Only a <sky-latitude> tag was found.');
        }
        else{
          console.error('The <sky-location> tag must contain both a <sky-latitude> and <sky-longitude> tag. Only a <sky-longitude> tag was found.');
        }
      }

      //Set the params to appropriate values or default
      dataRef.latitude = latitudeTags.length > 0 ? parseFloat(latitudeTags[0].innerHTML) : dataRef.latitude;
      dataRef.longitude = longitudeTags.length > 0 ? parseFloat(longitudeTags[0].innerHTML) : dataRef.longitude;

      //By some horrible situation. The maximum and minimum offset for UTC timze is 26 hours apart.
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.latitude = dataRef.latitude ? clampAndWarn(dataRef.latitude, -90.0, 90.0, '<sky-latitude>') : null;
      dataRef.longitude = dataRef.longitude ? clampAndWarn(dataRef.longitude, -180.0, 180.0, '<sky-longitude>') : null;
      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-location', SkyLocation);
