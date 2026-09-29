//Child tags
window.customElements.define('sky-halo-ice-cloud', class extends HTMLElement{});
window.customElements.define('sky-halo-intensity', class extends HTMLElement{});
window.customElements.define('sky-halo-random-crystals', class extends HTMLElement{});
window.customElements.define('sky-halo-plate-crystals', class extends HTMLElement{});
window.customElements.define('sky-halo-column-crystals', class extends HTMLElement{});
window.customElements.define('sky-halo-moon-intensity', class extends HTMLElement{});

StarrySky.DefaultData.skyHalos = {
  //How much thin, high ice cloud (cirrostratus) is up there, 0 to 1. Halos are sunlight
  //turned by ice crystals, so with no ice in the sky there is nothing to see. Every halo
  //scales with it. AtmosphereRenderer reads it every frame, so it can be changed while
  //the sky runs -- fade it up as a front approaches, which is the classic halo forecast.
  iceCloud: 0.6,
  //Overall brightness of every halo, sun and moon alike.
  intensity: 1.0,
  //How much of the ice is in each crystal population. Each makes different halos.
  //  random   the 22 and 46 degree rings
  //  plate    sundogs, the parhelic circle and the circumzenithal arc
  //  column   the upper and lower tangent arcs and the circumscribed halo
  randomCrystals: 1.0,
  plateCrystals: 1.0,
  columnCrystals: 0.6,
  //Moon halos, on top of the overall intensity. They are colourless and much fainter.
  moonIntensity: 1.0,
  //Baked radiance to sky radiance: how bright the peak of a halo is against the sun's own
  //scattered light. Not a tag; it is the calibration of the bake against this sky.
  radianceScale: 0.3,
  //The layout of the baked atlas. This must match src/python/halo-baker/bake.py, which
  //checks it (`./run.sh --check-js`), and the layer order is mirrored by the HALO_*_LAYER
  //constants in halo-functions.glsl: layer 0 is the random population, then one plate
  //layer per sun elevation step, then one column layer per step.
  atlas: {
    tileWidth: 320,
    tileHeight: 128,
    columns: 5,
    thetaMaxDegrees: 100.0,
    elevationStepDegrees: 6.0,
    elevationLayers: 12
  },
  //The mere presence of <sky-halos> switches this on.
  halosEnabled: false
};

class SkyHalos extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyHalos;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Data Ref
      const dataRef = self.data;

      //The mere presence of this tag enables halos
      dataRef.halosEnabled = true;
      const iceCloudTags = self.getElementsByTagName('sky-halo-ice-cloud');
      const intensityTags = self.getElementsByTagName('sky-halo-intensity');
      const randomTags = self.getElementsByTagName('sky-halo-random-crystals');
      const plateTags = self.getElementsByTagName('sky-halo-plate-crystals');
      const columnTags = self.getElementsByTagName('sky-halo-column-crystals');
      const moonIntensityTags = self.getElementsByTagName('sky-halo-moon-intensity');

      [iceCloudTags, intensityTags, randomTags, plateTags, columnTags, moonIntensityTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-halos> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Parse the values in our tags
      dataRef.iceCloud = iceCloudTags.length > 0 ? parseFloat(iceCloudTags[0].innerHTML) : dataRef.iceCloud;
      dataRef.intensity = intensityTags.length > 0 ? parseFloat(intensityTags[0].innerHTML) : dataRef.intensity;
      dataRef.randomCrystals = randomTags.length > 0 ? parseFloat(randomTags[0].innerHTML) : dataRef.randomCrystals;
      dataRef.plateCrystals = plateTags.length > 0 ? parseFloat(plateTags[0].innerHTML) : dataRef.plateCrystals;
      dataRef.columnCrystals = columnTags.length > 0 ? parseFloat(columnTags[0].innerHTML) : dataRef.columnCrystals;
      dataRef.moonIntensity = moonIntensityTags.length > 0 ? parseFloat(moonIntensityTags[0].innerHTML) : dataRef.moonIntensity;

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.iceCloud = clampAndWarn(dataRef.iceCloud, 0.0, 1.0, '<sky-halo-ice-cloud>');
      dataRef.intensity = clampAndWarn(dataRef.intensity, 0.0, Infinity, '<sky-halo-intensity>');
      dataRef.randomCrystals = clampAndWarn(dataRef.randomCrystals, 0.0, Infinity, '<sky-halo-random-crystals>');
      dataRef.plateCrystals = clampAndWarn(dataRef.plateCrystals, 0.0, Infinity, '<sky-halo-plate-crystals>');
      dataRef.columnCrystals = clampAndWarn(dataRef.columnCrystals, 0.0, Infinity, '<sky-halo-column-crystals>');
      dataRef.moonIntensity = clampAndWarn(dataRef.moonIntensity, 0.0, Infinity, '<sky-halo-moon-intensity>');

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  }
};
window.customElements.define('sky-halos', SkyHalos);
