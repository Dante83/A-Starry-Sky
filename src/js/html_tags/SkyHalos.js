//Child tags
window.customElements.define('sky-halo-display', class extends HTMLElement{});
window.customElements.define('sky-halo-ice-cloud', class extends HTMLElement{});
window.customElements.define('sky-halo-intensity', class extends HTMLElement{});
window.customElements.define('sky-halo-random-crystals', class extends HTMLElement{});
window.customElements.define('sky-halo-plate-crystals', class extends HTMLElement{});
window.customElements.define('sky-halo-column-crystals', class extends HTMLElement{});
window.customElements.define('sky-halo-sun-intensity', class extends HTMLElement{});
window.customElements.define('sky-halo-moon-intensity', class extends HTMLElement{});
window.customElements.define('sky-halo-moon-display', class extends HTMLElement{});

StarrySky.DefaultData.skyHalos = {
  //How much thin, high ice cloud (cirrostratus) is up there, 0 to 1. Halos are sunlight
  //turned by ice crystals, so with no ice in the sky there is nothing to see. Every halo
  //scales with it. AtmosphereRenderer reads it every frame, so it can be changed while
  //the sky runs -- fade it up as a front approaches, which is the classic halo forecast.
  iceCloud: 0.6,
  //Overall brightness of every halo, sun and moon alike.
  intensity: 1.0,
  //The sun's halos and the moon's are set separately, on top of the overall intensity, so
  //either can be turned right down or up. Physically the moon's are the easier to see: the
  //ice turns moonlight just as it turns sunlight, but against a dark sky, to eyes that
  //have adapted to the dark, with no glare beside them -- so a night can show a clear lunar
  //halo under a veil the noon sun could not light. Neither follows the other.
  sunIntensity: 1.0,
  //Colourless and fainter by default: the eye cannot see the colour of a halo in the dark.
  moonIntensity: 0.3,
  //Which halos to show. Real skies rarely show every halo at once: which appear depends on
  //the shape and orientation of the ice that day. This picks how much of each crystal
  //population there is, and the three tags below override it.
  //  ring     the 22 degree halo, and the faint 46 degree halo   (default)
  //  sundogs  sundogs, the parhelic circle and the circumzenithal arc, over a faint ring
  //  arcs     tangent arcs and the circumscribed halo, over a faint ring
  //  mixed    all of them at once
  display: 'ring',
  //How much of the ice is in each crystal population. Each makes different halos.
  //  random   the 22 and 46 degree rings
  //  plate    sundogs, the parhelic circle and the circumzenithal arc
  //  column   the upper and lower tangent arcs and the circumscribed halo
  //Set from `display` unless a tag gives its own, and read every frame.
  randomCrystals: 1.0,
  plateCrystals: 0.0,
  columnCrystals: 0.0,
  //The moon's crystal mix, from its own display. It follows the sun's, tags included,
  //unless <sky-halo-moon-display> gives it a display of its own.
  moonDisplay: null,
  moonRandomCrystals: 1.0,
  moonPlateCrystals: 0.0,
  moonColumnCrystals: 0.0,
  //Baked radiance to sky radiance: how bright the peak of a halo is against the sun's own
  //scattered light. Not a tag; it is the calibration of the bake against this sky.
  radianceScale: 0.05,
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
      const displayTags = self.getElementsByTagName('sky-halo-display');
      const moonDisplayTags = self.getElementsByTagName('sky-halo-moon-display');
      const sunIntensityTags = self.getElementsByTagName('sky-halo-sun-intensity');
      const iceCloudTags = self.getElementsByTagName('sky-halo-ice-cloud');
      const intensityTags = self.getElementsByTagName('sky-halo-intensity');
      const randomTags = self.getElementsByTagName('sky-halo-random-crystals');
      const plateTags = self.getElementsByTagName('sky-halo-plate-crystals');
      const columnTags = self.getElementsByTagName('sky-halo-column-crystals');
      const moonIntensityTags = self.getElementsByTagName('sky-halo-moon-intensity');

      [displayTags, moonDisplayTags, sunIntensityTags, iceCloudTags, intensityTags, randomTags, plateTags, columnTags, moonIntensityTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-halos> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //The display picks the crystal mix; a crystal tag overrides its own share of it.
      const displays = {
        ring: [1.0, 0.0, 0.0],
        sundogs: [0.3, 1.0, 0.0],
        arcs: [0.3, 0.0, 1.0],
        mixed: [1.0, 0.6, 0.4]
      };
      const readDisplay = function(tags, current){
        if(tags.length === 0){
          return current;
        }
        const display = tags[0].innerHTML.trim().toLowerCase();
        if(display in displays){
          return display;
        }
        console.error(`<${tags[0].tagName.toLowerCase()}> must be one of ${Object.keys(displays).join(', ')}. "${display}" found.`);
        return current;
      };
      dataRef.display = readDisplay(displayTags, dataRef.display);
      dataRef.moonDisplay = readDisplay(moonDisplayTags, dataRef.moonDisplay);
      [dataRef.randomCrystals, dataRef.plateCrystals, dataRef.columnCrystals] = displays[dataRef.display];

      //Parse the values in our tags
      dataRef.iceCloud = iceCloudTags.length > 0 ? parseFloat(iceCloudTags[0].innerHTML) : dataRef.iceCloud;
      dataRef.sunIntensity = sunIntensityTags.length > 0 ? parseFloat(sunIntensityTags[0].innerHTML) : dataRef.sunIntensity;
      dataRef.intensity = intensityTags.length > 0 ? parseFloat(intensityTags[0].innerHTML) : dataRef.intensity;
      dataRef.randomCrystals = randomTags.length > 0 ? parseFloat(randomTags[0].innerHTML) : dataRef.randomCrystals;
      dataRef.plateCrystals = plateTags.length > 0 ? parseFloat(plateTags[0].innerHTML) : dataRef.plateCrystals;
      dataRef.columnCrystals = columnTags.length > 0 ? parseFloat(columnTags[0].innerHTML) : dataRef.columnCrystals;
      dataRef.moonIntensity = moonIntensityTags.length > 0 ? parseFloat(moonIntensityTags[0].innerHTML) : dataRef.moonIntensity;

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.iceCloud = clampAndWarn(dataRef.iceCloud, 0.0, 1.0, '<sky-halo-ice-cloud>');
      dataRef.sunIntensity = clampAndWarn(dataRef.sunIntensity, 0.0, Infinity, '<sky-halo-sun-intensity>');
      dataRef.intensity = clampAndWarn(dataRef.intensity, 0.0, Infinity, '<sky-halo-intensity>');
      dataRef.randomCrystals = clampAndWarn(dataRef.randomCrystals, 0.0, Infinity, '<sky-halo-random-crystals>');
      dataRef.plateCrystals = clampAndWarn(dataRef.plateCrystals, 0.0, Infinity, '<sky-halo-plate-crystals>');
      dataRef.columnCrystals = clampAndWarn(dataRef.columnCrystals, 0.0, Infinity, '<sky-halo-column-crystals>');
      dataRef.moonIntensity = clampAndWarn(dataRef.moonIntensity, 0.0, Infinity, '<sky-halo-moon-intensity>');

      //The moon takes its own display's mix if it was given one, else the sun's, tags and all.
      if(dataRef.moonDisplay !== null){
        [dataRef.moonRandomCrystals, dataRef.moonPlateCrystals, dataRef.moonColumnCrystals] = displays[dataRef.moonDisplay];
      }
      else{
        dataRef.moonRandomCrystals = dataRef.randomCrystals;
        dataRef.moonPlateCrystals = dataRef.plateCrystals;
        dataRef.moonColumnCrystals = dataRef.columnCrystals;
      }

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  }
};
window.customElements.define('sky-halos', SkyHalos);
