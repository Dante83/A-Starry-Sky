//Child tags
window.customElements.define('sky-nitrogen-color', class extends HTMLElement{});
window.customElements.define('sky-nitrogen-cutoff', class extends HTMLElement{});
window.customElements.define('sky-nitrogen-intensity', class extends HTMLElement{});
window.customElements.define('sky-molecular-oxygen-color', class extends HTMLElement{});
window.customElements.define('sky-molecular-oxygen-cutoff', class extends HTMLElement{});
window.customElements.define('sky-molecular-oxygen-intensity', class extends HTMLElement{});
window.customElements.define('sky-atomic-oxygen-color', class extends HTMLElement{});
window.customElements.define('sky-atomic-oxygen-cutoff', class extends HTMLElement{});
window.customElements.define('sky-atomic-oxygen-intensity', class extends HTMLElement{});
window.customElements.define('sky-aurora-raymarch-steps', class extends HTMLElement{});
window.customElements.define('sky-aurora-cutoff-distance', class extends HTMLElement{});
window.customElements.define('sky-aurora-color-red', class extends HTMLElement{});
window.customElements.define('sky-aurora-color-green', class extends HTMLElement{});
window.customElements.define('sky-aurora-color-blue', class extends HTMLElement{});

StarrySky.DefaultData.skyAurora = {
  nitrogenColor: {
    red: 189,
    green: 98,
    blue: 255
  },
  molecularOxygenColor: {
    red: 81,
    green: 255,
    blue: 143
  },
  atomicOxygenColor: {
    red: 255,
    green: 0,
    blue: 37
  },
  nitrogenCutOff: 0.12,
  nitrogenIntensity: 4.0,
  molecularOxygenCutOff: 0.02,
  molecularOxygenIntensity: 2.0,
  atomicOxygenCutOff: 0.12,
  atomicOxygenIntensity: 0.3,
  raymarchSteps: 64,
  cutoffDistance: 1000,
  auroraEnabled: false
};

class SkyAurora extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyAurora;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Data Ref
      const dataRef = self.data;

      //The mere presence of this tag enables aurora
      dataRef.auroraEnabled = true;
      const nitrogenColorTags = self.getElementsByTagName('sky-nitrogen-color');
      const nitrogenCutoffTags = self.getElementsByTagName('sky-nitrogen-cutoff');
      const nitrogenIntensityTags = self.getElementsByTagName('sky-nitrogen-intensity');
      const molecularOxygenColorTags = self.getElementsByTagName('sky-molecular-oxygen-color');
      const molecularOxygenCutoffTags = self.getElementsByTagName('sky-molecular-oxygen-cutoff');
      const molecularOxygenIntensityTags = self.getElementsByTagName('sky-molecular-oxygen-intensity');
      const atomicOxygenColorTags = self.getElementsByTagName('sky-atomic-oxygen-color');
      const atomicOxygenCutoffTags = self.getElementsByTagName('sky-atomic-oxygen-cutoff');
      const atomicOxygenIntensityTags = self.getElementsByTagName('sky-atomic-oxygen-intensity');
      const raymarchStepsTags = self.getElementsByTagName('sky-aurora-raymarch-steps');
      const raymarchCutoffDistanceTags = self.getElementsByTagName('sky-aurora-cutoff-distance');

      [nitrogenColorTags, nitrogenCutoffTags, nitrogenIntensityTags, molecularOxygenColorTags, molecularOxygenCutoffTags, molecularOxygenIntensityTags,
      atomicOxygenColorTags, atomicOxygenCutoffTags, atomicOxygenIntensityTags, raymarchStepsTags,
      raymarchCutoffDistanceTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-aurora> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //With special subcases for our ground color tags
      [nitrogenColorTags, molecularOxygenColorTags, atomicOxygenColorTags].forEach(function(tags){
        if(tags.length === 1){
          //Check that it only contains one of each of the following child tags
          const redTags = tags[0].getElementsByTagName('sky-aurora-color-red');
          const greenTags = tags[0].getElementsByTagName('sky-aurora-color-green');
          const blueTags = tags[0].getElementsByTagName('sky-aurora-color-blue');
          [redTags, greenTags, blueTags].forEach(function(colorTags){
            if(tags.length !== 1){
              console.error(`The <${tags[0].tagName}> tag must contain 1 and only 1 tag of type <${colorTags[0].tagName}>. ${colorTags.length} found.`);
            }
          });
        }
      });

      //Parse the values in our tags
      dataRef.nitrogenCutOff = nitrogenCutoffTags.length > 0 ? parseFloat(nitrogenCutoffTags[0].innerHTML) : dataRef.nitrogenCutOff;
      dataRef.nitrogenIntensity = nitrogenIntensityTags.length > 0 ? parseFloat(nitrogenIntensityTags[0].innerHTML) : dataRef.nitrogenIntensity;
      dataRef.molecularOxygenCutOff = molecularOxygenCutoffTags.length > 0 ? parseFloat(molecularOxygenCutoffTags[0].innerHTML) : dataRef.molecularOxygenCutOff;
      dataRef.molecularOxygenIntensity = molecularOxygenIntensityTags.length > 0 ? parseFloat(molecularOxygenIntensityTags[0].innerHTML) : dataRef.molecularOxygenIntensity;
      dataRef.atomicOxygenCutOff = atomicOxygenCutoffTags.length > 0 ? parseFloat(atomicOxygenCutoffTags[0].innerHTML) : dataRef.atomicOxygenCutOff;
      dataRef.atomicOxygenIntensity = atomicOxygenIntensityTags.length > 0 ? parseFloat(atomicOxygenIntensityTags[0].innerHTML) : dataRef.atomicOxygenIntensity;
      dataRef.raymarchSteps = raymarchStepsTags.length > 0 ? parseInt(raymarchStepsTags[0].innerHTML) : dataRef.raymarchSteps;
      dataRef.cutoffDistance = raymarchCutoffDistanceTags.length > 0 ? parseInt(raymarchCutoffDistanceTags[0].innerHTML) : dataRef.cutoffDistance;

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.nitrogenCutOff = clampAndWarn(dataRef.nitrogenCutOff, 0.0, 1.0, '<sky-nitrogen-cutoff>');
      dataRef.molecularOxygenCutOff = clampAndWarn(dataRef.molecularOxygenCutOff, 0.0, 1.0, '<sky-molecular-oxygen-cutoff>');
      dataRef.atomicOxygenCutOff = clampAndWarn(dataRef.atomicOxygenCutOff, 0.0, 1.0, '<sky-atomic-oxygen-cutoff>');

      dataRef.nitrogenIntensity = clampAndWarn(dataRef.nitrogenIntensity, 0.0, Infinity, '<sky-nitrogen-intensity>');
      dataRef.molecularOxygenIntensity = clampAndWarn(dataRef.molecularOxygenIntensity, 0.0, Infinity, '<sky-molecular-oxygen-intensity>');
      dataRef.atomicOxygenIntensity = clampAndWarn(dataRef.atomicOxygenIntensity, 0.0, Infinity, '<sky-atomic-oxygen-intensity>');

      dataRef.raymarchSteps = clampAndWarn(dataRef.raymarchSteps, 4, Infinity, '<sky-aurora-raymarch-steps>');
      dataRef.cutoffDistance = clampAndWarn(dataRef.cutoffDistance, 1, 10000, '<sky-aurora-cutoff-distance>');

      //Parse our nitrogen color
      if(nitrogenColorTags.length === 1){
        const firstNitrogenColorTagGroup = nitrogenColorTags[0];
        const nitrogenColor = dataRef.nitrogenColor;
        if(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-red').length > 0){
          nitrogenColor.red = clampAndWarn(parseInt(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-red')[0].innerHTML), 0, 255, 'sky-aurora-color-red');
        }
        if(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-green').length > 0){
          nitrogenColor.green = clampAndWarn(parseInt(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-green')[0].innerHTML), 0, 255, 'sky-aurora-color-green');
        }
        if(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-blue').length > 0){
          nitrogenColor.blue = clampAndWarn(parseInt(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-blue')[0].innerHTML), 0, 255, 'sky-aurora-color-blue');
        }
      }

      //Parse our molecular oxygen color
      if(molecularOxygenColorTags.length === 1){
        const firstMolecularOxygenColorTagGroup = molecularOxygenColorTags[0];
        const molecularOxygenColor = dataRef.molecularOxygenColor;
        if(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-red').length > 0){
          molecularOxygenColor.red = clampAndWarn(parseInt(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-red')[0].innerHTML), 0, 255, 'sky-aurora-color-red');
        }
        if(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-green').length > 0){
          molecularOxygenColor.green = clampAndWarn(parseInt(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-green')[0].innerHTML), 0, 255, 'sky-aurora-color-green');
        }
        if(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-blue').length > 0){
          molecularOxygenColor.blue = clampAndWarn(parseInt(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-blue')[0].innerHTML), 0, 255, 'sky-aurora-color-blue');
        }
      }

      //Parse our atomic oxygen color
      if(atomicOxygenColorTags.length === 1){
        const firstAtomicOxygenColorTagGroup = atomicOxygenColorTags[0];
        const atomicOxygenColor = dataRef.atomicOxygenColor;
        if(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-red').length > 0){
          atomicOxygenColor.red = clampAndWarn(parseInt(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-red')[0].innerHTML), 0, 255, 'sky-aurora-color-red');
        }
        if(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-green').length > 0){
          atomicOxygenColor.green = clampAndWarn(parseInt(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-green')[0].innerHTML), 0, 255, 'sky-aurora-color-green');
        }
        if(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-blue').length > 0){
          atomicOxygenColor.blue = clampAndWarn(parseInt(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-blue')[0].innerHTML), 0, 255, 'sky-aurora-color-blue');
        }
      }

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  }
};
window.customElements.define('sky-aurora', SkyAurora);
