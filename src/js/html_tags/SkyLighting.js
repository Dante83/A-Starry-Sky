//Child tags
window.customElements.define('sky-ground-color', class extends HTMLElement{});
window.customElements.define('sky-ground-color-red', class extends HTMLElement{});
window.customElements.define('sky-ground-color-green', class extends HTMLElement{});
window.customElements.define('sky-ground-color-blue', class extends HTMLElement{});
window.customElements.define('sky-atmospheric-perspective-density', class extends HTMLElement{});
window.customElements.define('sky-atmospheric-perspective-type', class extends HTMLElement{});
window.customElements.define('sky-atmospheric-perspective-distance-multiplier', class extends HTMLElement{});
window.customElements.define('sky-shadow-camera-size', class extends HTMLElement{});
window.customElements.define('sky-shadow-camera-resolution', class extends HTMLElement{});

StarrySky.DefaultData.lighting = {
  groundColor: {
    red: 66,
    green: 44,
    blue: 2
  },
  atmosphericPerspectiveDensity: 0.007,
  atmosphericPerspectiveDistanceMultiplier: 5.0,
  atmosphericPerspectiveType: Symbol('normal'),
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
      const atmosphericPerspectiveTypeTags = self.getElementsByTagName('sky-atmospheric-perspective-type');
      const atmosphericPerspectiveDensityTags = self.getElementsByTagName('sky-atmospheric-perspective-density');
      const atmosphericPerspectiveDistanceMultiplierTags = self.getElementsByTagName('sky-atmospheric-perspective-distance-multiplier');
      const shadowCameraSizeTags = self.getElementsByTagName('sky-shadow-camera-size');
      const shadowCameraResolutionTags = self.getElementsByTagName('sky-shadow-camera-resolution');

      [groundColorTags, atmosphericPerspectiveTypeTags, atmosphericPerspectiveDensityTags,
      atmosphericPerspectiveDistanceMultiplierTags, shadowCameraSizeTags,
      shadowCameraResolutionTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-lighting-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
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
      dataRef.atmosphericPerspectiveType = Symbol('none');
      const hasAtmosphericPerspecitiveDensityTags = atmosphericPerspectiveDensityTags.length > 0;
      const hasAtmosphericPerspecitiveDistanceMultiplierTags = atmosphericPerspectiveDistanceMultiplierTags.length > 0;
      const hasAtmosphericPerspectiveTypeNamed = false;
      if(atmosphericPerspectiveDensityTags.length > 0 &&
      atmosphericPerspectiveDistanceMultiplierTags.length > 0){
        console.warn("Having both the <sky-atmospheric-perspective-density> and " +
        "<sky-atmospheric-perspective-distance-multiplier> tags are unnecessary. " +
        "Please choose one based on the atmospheric perspective model of your choice. " +
        "<sky-atmospheric-perspective-density> for normal and <sky-atmospheric-perspective-distance-multiplier> " +
        "for advanced, respectively.");
      }
      if(atmosphericPerspectiveTypeTags.length > 0){
        const atmType = atmosphericPerspectiveDensityTags[0].innerHTML;
        const lcAtmType = atmType.toLowerCase();veDensityTags[0].innerHTML.toLowerCase();
        if(['none', 'normal', 'advanced'].includes(lcAtmType)){
          hasAtmosphericPerspectiveTypeNamed = true;
          dataRef.atmosphericPerspectiveType = Symbol(lcAtmType);
        }
        else{
          console.error(`The value ${atmType} is not a valid value of the <sky-atmospheric-perspective-type> tag. Please use the values none, normal or advanced.`);
        }
      }
      if(hasAtmosphericPerspectiveTypeNamed){
        if(dataRef.atmosphericPerspectiveType == Symbol('normal')){
          dataRef.atmosphericPerspectiveDensity = atmosphericPerspectiveDensityTags.length > 0 ? parseFloat(atmosphericPerspectiveDensityTags[0].innerHTML) : dataRef.atmosphericPerspectiveDensity;
        }
        else if(dataRef.atmosphericPerspectiveType == Symbol('advanced')){
          dataRef.atmosphericPerspectiveDistanceMultiplier = atmosphericPerspectiveDistanceMultiplierTags.length > 0 ? parseFloat(atmosphericPerspectiveDistanceMultiplierTags[0].innerHTML) : dataRef.atmosphericPerspectiveDistanceMultiplier;
        }
      }
      else{
        if(hasAtmosphericPerspecitiveDensityTags){
          console.warn('Atmospheric perspective type not explicitly named in a <sky-atmospheric-perspective> tag '+
          'defaulting to normal because of the presense of an <sky-atmospheric-perspective-density> tag.');
          dataRef.atmosphericPerspectiveType = Symbol('normal');
          dataRef.atmosphericPerspectiveDensity = atmosphericPerspectiveDensityTags.length > 0 ? parseFloat(atmosphericPerspectiveDensityTags[0].innerHTML) : dataRef.atmosphericPerspectiveDensity;
        }
        else if(hasAtmosphericPerspecitiveDistanceMultiplierTags){
          dataRef.atmosphericPerspectiveType = Symbol('advanced');
          dataRef.atmosphericPerspectiveDistanceMultiplier = atmosphericPerspectiveDistanceMultiplierTags.length > 0 ? parseFloat(atmosphericPerspectiveDistanceMultiplierTags[0].innerHTML) : dataRef.atmosphericPerspectiveDistanceMultiplier;
          console.warn('Atmospheric perspective type not explicitly named in a <sky-atmospheric-perspective> tag '+
          'defaulting to advanced because of the presense of an <sky-atmospheric-perspective-distance-multiplier> tag.');
        }
      }

      dataRef.shadowCameraSize = shadowCameraSizeTags.length > 0 ? parseFloat(shadowCameraSizeTags[0].innerHTML) : dataRef.shadowCameraSize;
      dataRef.shadowCameraResolution = shadowCameraResolutionTags.length > 0 ? parseFloat(shadowCameraResolutionTags[0].innerHTML) : dataRef.shadowCameraResolution;

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.atmosphericPerspectiveDensity = clampAndWarn(dataRef.atmosphericPerspectiveDensity, 0.0, Infinity, '<sky-atmospheric-perspective-density>');
      dataRef.atmosphericPerspectiveDensity = clampAndWarn(dataRef.atmosphericPerspectiveDistanceMultiplier, 0.0, Infinity, '<sky-atmospheric-perspective-distance-multiplier>');
      dataRef.shadowCameraSize = clampAndWarn(dataRef.shadowCameraSize, 0.0, Infinity, '<sky-shadow-camera-size>');
      dataRef.shadowCameraResolution = clampAndWarn(dataRef.shadowCameraResolution, 32, 15360, '<sky-shadow-camera-resolution>');

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
