//Child tags
window.customElements.define('sky-ground-color', class extends HTMLElement{});
window.customElements.define('sky-ground-color-red', class extends HTMLElement{});
window.customElements.define('sky-ground-color-green', class extends HTMLElement{});
window.customElements.define('sky-ground-color-blue', class extends HTMLElement{});
window.customElements.define('sky-sun-intensity', class extends HTMLElement{});
window.customElements.define('sky-moon-intensity', class extends HTMLElement{});
window.customElements.define('sky-ambient-intensity', class extends HTMLElement{});
window.customElements.define('sky-minimum-ambient-lighting', class extends HTMLElement{});
window.customElements.define('sky-maximum-ambient-lighting', class extends HTMLElement{});
window.customElements.define('sky-atmospheric-perspective-density', class extends HTMLElement{});
window.customElements.define('sky-atmospheric-perspective-type', class extends HTMLElement{});
window.customElements.define('sky-atmospheric-perspective-distance-multiplier', class extends HTMLElement{});
window.customElements.define('sky-shadow-camera-size', class extends HTMLElement{});
window.customElements.define('sky-shadow-camera-resolution', class extends HTMLElement{});
window.customElements.define('sky-moon-bloom', class extends HTMLElement{});
window.customElements.define('sky-sun-bloom', class extends HTMLElement{});
window.customElements.define('sky-bloom-enabled', class extends HTMLElement{});
window.customElements.define('sky-bloom-exposure', class extends HTMLElement{});
window.customElements.define('sky-bloom-threshold', class extends HTMLElement{});
window.customElements.define('sky-bloom-strength', class extends HTMLElement{});

StarrySky.DefaultData.lighting = {
  groundColor: {
    red: 66,
    green: 44,
    blue: 2
  },
  sunBloom: {
    bloomEnabled: true,
    exposure: 1.0,
    threshold: 0.98,
    strength: 1.0,
    radius: 1.0
  },
  moonBloom: {
    bloomEnabled: true,
    exposure: 1.0,
    threshold: 0.55,
    strength: 0.9,
    radius: 1.4
  },
  sunIntensity: 1.0,
  moonIntensity: 1.0,
  ambientIntensity: 1.0,
  minimumAmbientLighting: 0.01,
  maximumAmbientLighting: Infinity,
  atmosphericPerspectiveDensity: 0.007,
  atmosphericPerspectiveDistanceMultiplier: 5.0,
  atmosphericPerspectiveType: 'normal',
  shadowCameraSize: 32.0,
  shadowCameraResolution: 2048
};

//Parent tag
class SkyLighting extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.lighting;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      const dataRef = self.data;

      //Get child tags and acquire their values.
      const groundColorTags = self.getElementsByTagName('sky-ground-color');
      const sunIntensityTags = self.getElementsByTagName('sky-sun-intensity');
      const moonIntensityTags = self.getElementsByTagName('sky-moon-intensity');
      const ambientIntensityTags = self.getElementsByTagName('sky-ambient-intensity');
      const minimumAmbientLightingTags = self.getElementsByTagName('sky-minimum-ambient-lighting');
      const maximumAmbientLightingTags = self.getElementsByTagName('sky-maximum-ambient-lighting');
      const atmosphericPerspectiveTypeTags = self.getElementsByTagName('sky-atmospheric-perspective-type');
      const atmosphericPerspectiveDensityTags = self.getElementsByTagName('sky-atmospheric-perspective-density');
      const atmosphericPerspectiveDistanceMultiplierTags = self.getElementsByTagName('sky-atmospheric-perspective-distance-multiplier');
      const shadowCameraSizeTags = self.getElementsByTagName('sky-shadow-camera-size');
      const shadowCameraResolutionTags = self.getElementsByTagName('sky-shadow-camera-resolution');
      const sunBloomtags = self.getElementsByTagName('sky-sun-bloom');
      const moonBloomtags = self.getElementsByTagName('sky-moon-bloom');

      [groundColorTags, sunIntensityTags, moonIntensityTags, ambientIntensityTags,
      minimumAmbientLightingTags, maximumAmbientLightingTags, atmosphericPerspectiveTypeTags,
      atmosphericPerspectiveDensityTags, atmosphericPerspectiveDistanceMultiplierTags,
      shadowCameraSizeTags, shadowCameraResolutionTags, sunBloomtags, moonBloomtags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-lighting-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //And make sure they only have one of their respective child elements
      //then set their values if they exist...
      [sunBloomtags, moonBloomtags].forEach(function(tags){
        const tag = tags.length > 0 ? tags[0] : false;
        if(tag){
          const bloomEnabledTags = tag.getElementsByTagName('sky-bloom-enabled');
          const exposureTags = tag.getElementsByTagName('sky-bloom-exposure');
          const thresholdTags = tag.getElementsByTagName('sky-bloom-threshold');
          const strengthTags = tag.getElementsByTagName('sky-bloom-strength');
          const radiusTags = tag.getElementsByTagName('sky-bloom-radius');
          let bloomEnabled = true;
          if(bloomEnabledTags.length > 0 && bloomEnabledTags[0].innerHTML.toLowerCase() !== 'true'){
            bloomEnabled = false;
          }
          if(bloomEnabled){
            [bloomEnabledTags, exposureTags, thresholdTags, strengthTags, radiusTags].forEach(function(childTags){
              if(childTags.length > 1){
                console.error(`The <${tag.tagName}> tag must contain 1 and only 1 tag of type <${childTags[0].tagName}>. ${childTags.length} found.`);
              }
            });
          }
          else{
            [exposureTags, thresholdTags, strengthTags, radiusTags].forEach(function(childTags){
              if(childTags.length !== 0){
                console.warning(`The <${tag.tagName}> cannot contain any tags of type <${childTags[0].tagName}>. It won't break, it just won't do anything.`);
              }
            });
          }
        }
      });

      //With special subcases for our ground color tags
      [groundColorTags].forEach(function(tags){
        if(tags.length === 1){
          //Check that it only contains one of each of the following child tags
          const redTags = tags[0].getElementsByTagName('sky-ground-color-red');
          const greenTags = tags[0].getElementsByTagName('sky-ground-color-green');
          const blueTags = tags[0].getElementsByTagName('sky-ground-color-blue');
          [redTags, greenTags, blueTags].forEach(function(colorTags){
            if(tags.length !== 1){
              console.error(`The <${tags[0].tagName}> tag must contain 1 and only 1 tag of type <${colorTags[0].tagName}>. ${colorTags.length} found.`);
            }
          });
        }
      });

      //Parse the values in our tags
      dataRef.atmosphericPerspectiveType = 'none';
      const hasAtmosphericPerspecitiveDensityTags = atmosphericPerspectiveDensityTags.length > 0;
      const hasAtmosphericPerspecitiveDistanceMultiplierTags = atmosphericPerspectiveDistanceMultiplierTags.length > 0;
      let hasAtmosphericPerspectiveTypeNamed = false;
      if(atmosphericPerspectiveDensityTags.length > 0 &&
      atmosphericPerspectiveDistanceMultiplierTags.length > 0){
        console.warn("Having both the <sky-atmospheric-perspective-density> and " +
        "<sky-atmospheric-perspective-distance-multiplier> tags are unnecessary. " +
        "Please choose one based on the atmospheric perspective model of your choice. " +
        "<sky-atmospheric-perspective-density> for normal and <sky-atmospheric-perspective-distance-multiplier> " +
        "for advanced, respectively.");
      }
      if(atmosphericPerspectiveTypeTags.length > 0){
        const atmType = atmosphericPerspectiveTypeTags[0].innerHTML;
        const lcAtmType = atmType.toLowerCase();
        if(['none', 'normal', 'advanced'].includes(lcAtmType)){
          hasAtmosphericPerspectiveTypeNamed = true;
          dataRef.atmosphericPerspectiveType = lcAtmType;
        }
        else{
          console.error(`The value ${atmType} is not a valid value of the <sky-atmospheric-perspective-type> tag. Please use the values none, normal or advanced.`);
        }
      }
      if(hasAtmosphericPerspectiveTypeNamed){
        if(dataRef.atmosphericPerspectiveType == 'normal'){
          dataRef.atmosphericPerspectiveDensity = atmosphericPerspectiveDensityTags.length > 0 ? parseFloat(atmosphericPerspectiveDensityTags[0].innerHTML) : dataRef.atmosphericPerspectiveDensity;
        }
        else if(dataRef.atmosphericPerspectiveType == 'advanced'){
          dataRef.atmosphericPerspectiveDistanceMultiplier = atmosphericPerspectiveDistanceMultiplierTags.length > 0 ? parseFloat(atmosphericPerspectiveDistanceMultiplierTags[0].innerHTML) : dataRef.atmosphericPerspectiveDistanceMultiplier;
        }
      }
      else{
        if(hasAtmosphericPerspecitiveDensityTags){
          console.warn('Atmospheric perspective type not explicitly named in a <sky-atmospheric-perspective> tag '+
          'defaulting to normal because of the presense of an <sky-atmospheric-perspective-density> tag.');
          dataRef.atmosphericPerspectiveType = 'normal';
          dataRef.atmosphericPerspectiveDensity = atmosphericPerspectiveDensityTags.length > 0 ? parseFloat(atmosphericPerspectiveDensityTags[0].innerHTML) : dataRef.atmosphericPerspectiveDensity;
        }
        else if(hasAtmosphericPerspecitiveDistanceMultiplierTags){
          dataRef.atmosphericPerspectiveType = 'advanced';
          dataRef.atmosphericPerspectiveDistanceMultiplier = atmosphericPerspectiveDistanceMultiplierTags.length > 0 ? parseFloat(atmosphericPerspectiveDistanceMultiplierTags[0].innerHTML) : dataRef.atmosphericPerspectiveDistanceMultiplier;
          console.warn('Atmospheric perspective type not explicitly named in a <sky-atmospheric-perspective> tag '+
          'defaulting to advanced because of the presense of an <sky-atmospheric-perspective-distance-multiplier> tag.');
        }
      }

      dataRef.sunIntensity = sunIntensityTags.length > 0 ? parseFloat(sunIntensityTags[0].innerHTML) : dataRef.sunIntensity;
      dataRef.moonIntensity = moonIntensityTags.length > 0 ? parseFloat(moonIntensityTags[0].innerHTML) : dataRef.moonIntensity;
      dataRef.ambientIntensity = ambientIntensityTags.length > 0 ? parseFloat(ambientIntensityTags[0].innerHTML) : dataRef.ambientIntensity;
      const minimumAmbientLighting = minimumAmbientLightingTags.length > 0 ? parseFloat(minimumAmbientLightingTags[0].innerHTML) : dataRef.minimumAmbientLighting;
      const maximumAmbientLighting = maximumAmbientLightingTags.length > 0 ? parseFloat(maximumAmbientLightingTags[0].innerHTML) : dataRef.maximumAmbientLighting;
      if(minimumAmbientLighting <= maximumAmbientLighting){
        dataRef.minimumAmbientLighting = minimumAmbientLighting;
        dataRef.maximumAmbientLighting = maximumAmbientLighting;
      }
      else{
        console.error("Cannot set the minimum ambient lighting greater than the maximum ambient lighting. Setting to defaults.");
      }
      dataRef.shadowCameraSize = shadowCameraSizeTags.length > 0 ? parseFloat(shadowCameraSizeTags[0].innerHTML) : dataRef.shadowCameraSize;
      dataRef.shadowCameraResolution = shadowCameraResolutionTags.length > 0 ? parseFloat(shadowCameraResolutionTags[0].innerHTML) : dataRef.shadowCameraResolution;

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.sunIntensity = clampAndWarn(dataRef.sunIntensity, 0.0, Infinity, '<sky-sun-intensity>');
      dataRef.moonIntensity = clampAndWarn(dataRef.moonIntensity, 0.0, Infinity, '<sky-moon-intensity>');
      dataRef.ambientIntensity = clampAndWarn(dataRef.ambientIntensity, 0.0, Infinity, '<sky-ambient-intensity>');
      dataRef.minimumAmbientLighting = clampAndWarn(dataRef.minimumAmbientLighting, 0.0, Infinity, '<sky-minimum-ambient-lighting>');
      dataRef.maximumAmbientLighting = clampAndWarn(dataRef.maximumAmbientLighting, 0.0, Infinity, '<sky-maximum-ambient-lighting>');
      dataRef.atmosphericPerspectiveDensity = clampAndWarn(dataRef.atmosphericPerspectiveDensity, 0.0, Infinity, '<sky-atmospheric-perspective-density>');
      dataRef.atmosphericPerspectiveDensity = clampAndWarn(dataRef.atmosphericPerspectiveDistanceMultiplier, 0.0, Infinity, '<sky-atmospheric-perspective-distance-multiplier>');
      dataRef.shadowCameraSize = clampAndWarn(dataRef.shadowCameraSize, 0.0, Infinity, '<sky-shadow-camera-size>');
      dataRef.shadowCameraResolution = clampAndWarn(dataRef.shadowCameraResolution, 32, 15360, '<sky-shadow-camera-resolution>');

      //Parse our sky sun bloom data
      if(sunBloomtags.length === 1){
        const tagGroup = sunBloomtags[0];
        const bloomDataRef = dataRef.sunBloom;
        const bloomEnabledTags = tagGroup.getElementsByTagName('sky-bloom-enabled');
        let bloomEnabled = true;
        if(bloomEnabledTags.length > 0 && bloomEnabledTags[0].innerHTML.toLowerCase() !== 'true'){
          bloomEnabled = false;
        }
        if(bloomEnabled){
          if(tagGroup.getElementsByTagName('sky-bloom-exposure').length > 0){
            bloomDataRef.exposure = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-bloom-exposure')[0].innerHTML), 0.0, 2.0, 'sky-bloom-exposure');
          }
          if(tagGroup.getElementsByTagName('sky-bloom-threshold').length > 0){
            bloomDataRef.threshold = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-bloom-threshold')[0].innerHTML), 0.0, 1.0, 'sky-bloom-threshold');
          }
          if(tagGroup.getElementsByTagName('sky-bloom-strength').length > 0){
            bloomDataRef.strength = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-bloom-strength')[0].innerHTML), 0.0, 3.0, 'sky-bloom-strength');
          }
          if(tagGroup.getElementsByTagName('sky-bloom-radius').length > 0){
            bloomDataRef.radius = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-bloom-radius')[0].innerHTML), 0.0, 1.0, 'sky-bloom-radius');
          }
          bloomDataRef.bloomEnabled = true;
        }
        else{
          bloomDataRef.bloomEnabled = false;
        }
      }

      //Parse our sky moon bloom data
      if(moonBloomtags.length === 1){
        const tagGroup = moonBloomtags[0];
        const bloomDataRef = dataRef.moonBloom;
        const bloomEnabledTags = tagGroup.getElementsByTagName('sky-bloom-enabled');
        let bloomEnabled = true;
        if(bloomEnabledTags.length > 0 && bloomEnabledTags[0].innerHTML.toLowerCase() !== 'true'){
          bloomEnabled = false;
        }
        if(bloomEnabled){
          if(tagGroup.getElementsByTagName('sky-bloom-exposure').length > 0){
            bloomDataRef.exposure = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-bloom-exposure')[0].innerHTML), 0.0, 2.0, 'sky-bloom-exposure');
          }
          if(tagGroup.getElementsByTagName('sky-bloom-threshold').length > 0){
            bloomDataRef.threshold = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-bloom-threshold')[0].innerHTML), 0.0, 1.0, 'sky-bloom-threshold');
          }
          if(tagGroup.getElementsByTagName('sky-bloom-strength').length > 0){
            bloomDataRef.strength = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-bloom-strength')[0].innerHTML), 0.0, 3.0, 'sky-bloom-strength');
          }
          if(tagGroup.getElementsByTagName('sky-bloom-radius').length > 0){
            bloomDataRef.radius = clampAndWarn(parseFloat(tagGroup.getElementsByTagName('sky-bloom-radius')[0].innerHTML), 0.0, 1.0, 'sky-bloom-radius');
          }
          bloomDataRef.bloomEnabled = true;
        }
        else{
          bloomDataRef.bloomEnabled = false;
        }
      }

      //Parse our ground color
      if(groundColorTags.length === 1){
        const firstGroundColorTagGroup = groundColorTags[0];
        if(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-red').length > 0){
          dataRef.groundColor.red = clampAndWarn(parseInt(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-red')[0].innerHTML), 0, 255, 'sky-ground-color-red');
        }
        if(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-green').length > 0){
          dataRef.groundColor.green = clampAndWarn(parseInt(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-green')[0].innerHTML), 0, 255, 'sky-ground-color-green');
        }
        if(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-blue').length > 0){
          dataRef.groundColor.blue = clampAndWarn(parseInt(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-blue')[0].innerHTML), 0, 255, 'sky-ground-color-blue');
        }
      }

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-lighting', SkyLighting);
