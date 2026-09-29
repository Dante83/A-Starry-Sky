//Child tags
window.customElements.define('sky-halo-display', class extends HTMLElement{});
window.customElements.define('sky-halo-moon-display', class extends HTMLElement{});
window.customElements.define('sky-halo-temperature', class extends HTMLElement{});
window.customElements.define('sky-halo-turbulence', class extends HTMLElement{});
window.customElements.define('sky-halo-crystal-size', class extends HTMLElement{});
window.customElements.define('sky-halo-ice-cloud', class extends HTMLElement{});
window.customElements.define('sky-halo-intensity', class extends HTMLElement{});
window.customElements.define('sky-halo-sun-intensity', class extends HTMLElement{});
window.customElements.define('sky-halo-moon-intensity', class extends HTMLElement{});
window.customElements.define('sky-halo-random-crystals', class extends HTMLElement{});
window.customElements.define('sky-halo-plate-crystals', class extends HTMLElement{});
window.customElements.define('sky-halo-column-crystals', class extends HTMLElement{});

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

  //WHICH halos show depends on the ice: its shape, how it is oriented and how big it is.
  //These describe that ice, and StarrySky.HaloCrystals.resolve turns them into the strength
  //of the three baked crystal populations every frame, so all of them can change while the
  //sky runs. From strongest to weakest, the crystal mix comes from
  //  1. the <sky-halo-random/plate/column-crystals> tags, each for its own share
  //  2. <sky-halo-display>, a named mix:
  //       ring     the 22 degree halo, and the faint 46 degree halo
  //       sundogs  sundogs, the parhelic circle and the circumzenithal arc, over a faint ring
  //       arcs     tangent arcs and the circumscribed halo, over a faint ring
  //       mixed    all of them at once
  //  3. <sky-halo-temperature>, the temperature where the ice grew, which decides whether it
  //     grew plates or columns
  //  4. otherwise `ring`.
  display: null,
  temperature: null,
  //Ice only stays lined up in calm air. In turbulence the crystals tumble, and only the
  //rings, which need no alignment, survive. 0 is perfectly calm, 1 is a gale.
  turbulence: 0.0,
  //Diameter of the crystals in micrometres. Small crystals diffract the light into a blur
  //and are too light to stay oriented; sundogs and arcs need larger ones than rings do.
  crystalSize: 50.0,
  //The moon takes the sun's mix unless <sky-halo-moon-display> gives it a display of its own.
  moonDisplay: null,
  //Set by the crystal tags; null leaves that share to the display or the temperature.
  crystalOverrides: {random: null, plate: null, column: null},

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

//Turns a description of the ice into the strength of each baked crystal population.
StarrySky.HaloCrystals = (function(){
  //[random, plate, column]
  const displays = {
    ring: [1.0, 0.0, 0.0],
    sundogs: [0.3, 1.0, 0.0],
    arcs: [0.3, 0.0, 1.0],
    mixed: [1.0, 0.6, 0.4]
  };

  const smoothstep = function(x, edge0, edge1){
    const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0.0), 1.0);
    return t * t * (3.0 - 2.0 * t);
  };
  const bump = function(x, center, width){
    const t = (x - center) / width;
    return Math.exp(-t * t);
  };

  //What grows where, after Nakaya's habit diagram: plates just under freezing and around
  //-15 C, columns from -4 to -10 C, and columns again -- with a few thick plates -- once it
  //is colder than about -22 C, which is where cirrus lives. Approximate on purpose: the
  //real answer also depends on how saturated the air is, which the sky does not know.
  const mixFromTemperature = function(celsius){
    const plate = Math.max(bump(celsius, -15.0, 5.5), 0.6 * bump(celsius, -1.5, 2.0), 0.25 * smoothstep(celsius, -25.0, -40.0));
    const column = Math.max(bump(celsius, -6.0, 2.5), 0.8 * smoothstep(celsius, -20.0, -32.0));
    return [1.0, plate, column];
  };

  const baseMix = function(display, data){
    if(display !== null){
      return displays[display].slice();
    }
    if(data.temperature !== null){
      return mixFromTemperature(data.temperature);
    }
    return displays.ring.slice();
  };

  return {
    displays: displays,
    mixFromTemperature: mixFromTemperature,

    //Returns {sun: [random, plate, column], moon: [random, plate, column]}, each including
    //the effect of turbulence and crystal size.
    resolve: function(data){
      const sun = baseMix(data.display, data);
      const overrides = [data.crystalOverrides.random, data.crystalOverrides.plate, data.crystalOverrides.column];
      for(let i = 0; i < 3; ++i){
        if(overrides[i] !== null){
          sun[i] = overrides[i];
        }
      }
      //The moon follows the sun, tags and all, unless it was given a display of its own.
      const moon = data.moonDisplay !== null ? displays[data.moonDisplay].slice() : sun.slice();

      //Turbulence and size only touch the ice that needs to stay lined up, and size dims
      //every halo as the crystals shrink to nothing.
      const oriented = (1.0 - data.turbulence) * smoothstep(data.crystalSize, 20.0, 45.0);
      const visible = smoothstep(data.crystalSize, 8.0, 25.0);
      const shape = function(mix){
        mix[0] *= visible;
        mix[1] *= visible * oriented;
        mix[2] *= visible * oriented;
        return mix;
      };
      return {sun: shape(sun), moon: shape(moon)};
    }
  };
})();

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
      const temperatureTags = self.getElementsByTagName('sky-halo-temperature');
      const turbulenceTags = self.getElementsByTagName('sky-halo-turbulence');
      const crystalSizeTags = self.getElementsByTagName('sky-halo-crystal-size');
      const sunIntensityTags = self.getElementsByTagName('sky-halo-sun-intensity');
      const iceCloudTags = self.getElementsByTagName('sky-halo-ice-cloud');
      const intensityTags = self.getElementsByTagName('sky-halo-intensity');
      const randomTags = self.getElementsByTagName('sky-halo-random-crystals');
      const plateTags = self.getElementsByTagName('sky-halo-plate-crystals');
      const columnTags = self.getElementsByTagName('sky-halo-column-crystals');
      const moonIntensityTags = self.getElementsByTagName('sky-halo-moon-intensity');

      [displayTags, moonDisplayTags, temperatureTags, turbulenceTags, crystalSizeTags, sunIntensityTags,
      iceCloudTags, intensityTags, randomTags, plateTags, columnTags, moonIntensityTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-halos> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      const readDisplay = function(tags, current){
        if(tags.length === 0){
          return current;
        }
        const display = tags[0].innerHTML.trim().toLowerCase();
        if(display in StarrySky.HaloCrystals.displays){
          return display;
        }
        console.error(`<${tags[0].tagName.toLowerCase()}> must be one of ${Object.keys(StarrySky.HaloCrystals.displays).join(', ')}. "${display}" found.`);
        return current;
      };
      dataRef.display = readDisplay(displayTags, dataRef.display);
      dataRef.moonDisplay = readDisplay(moonDisplayTags, dataRef.moonDisplay);

      //Parse the values in our tags
      const readNumber = function(tags, current){
        return tags.length > 0 ? parseFloat(tags[0].innerHTML) : current;
      };
      dataRef.temperature = readNumber(temperatureTags, dataRef.temperature);
      dataRef.turbulence = readNumber(turbulenceTags, dataRef.turbulence);
      dataRef.crystalSize = readNumber(crystalSizeTags, dataRef.crystalSize);
      dataRef.iceCloud = readNumber(iceCloudTags, dataRef.iceCloud);
      dataRef.sunIntensity = readNumber(sunIntensityTags, dataRef.sunIntensity);
      dataRef.intensity = readNumber(intensityTags, dataRef.intensity);
      dataRef.moonIntensity = readNumber(moonIntensityTags, dataRef.moonIntensity);
      dataRef.crystalOverrides.random = readNumber(randomTags, dataRef.crystalOverrides.random);
      dataRef.crystalOverrides.plate = readNumber(plateTags, dataRef.crystalOverrides.plate);
      dataRef.crystalOverrides.column = readNumber(columnTags, dataRef.crystalOverrides.column);

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      if(dataRef.temperature !== null){
        dataRef.temperature = clampAndWarn(dataRef.temperature, -90.0, 30.0, '<sky-halo-temperature>');
      }
      dataRef.turbulence = clampAndWarn(dataRef.turbulence, 0.0, 1.0, '<sky-halo-turbulence>');
      dataRef.crystalSize = clampAndWarn(dataRef.crystalSize, 1.0, 1000.0, '<sky-halo-crystal-size>');
      dataRef.iceCloud = clampAndWarn(dataRef.iceCloud, 0.0, 1.0, '<sky-halo-ice-cloud>');
      dataRef.sunIntensity = clampAndWarn(dataRef.sunIntensity, 0.0, Infinity, '<sky-halo-sun-intensity>');
      dataRef.intensity = clampAndWarn(dataRef.intensity, 0.0, Infinity, '<sky-halo-intensity>');
      dataRef.moonIntensity = clampAndWarn(dataRef.moonIntensity, 0.0, Infinity, '<sky-halo-moon-intensity>');
      ['random', 'plate', 'column'].forEach(function(population){
        if(dataRef.crystalOverrides[population] !== null){
          dataRef.crystalOverrides[population] = clampAndWarn(dataRef.crystalOverrides[population], 0.0, Infinity, `<sky-halo-${population}-crystals>`);
        }
      });

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  }
};
window.customElements.define('sky-halos', SkyHalos);
