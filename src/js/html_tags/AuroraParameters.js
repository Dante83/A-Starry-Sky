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
window.customElements.define('sky-aurora-color-red', class extends HTMLElement{});
window.customElements.define('sky-aurora-color-green', class extends HTMLElement{});
window.customElements.define('sky-aurora-color-blue', class extends HTMLElement{});

StarrySky.DefaultData.auroraParameters = {
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
  auroraEnabled: false
};

class SkyAuroraParameters extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.auroraParameters;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //The mere presence of this tag enables aurora
      self.data.auroraEnabled = true;
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

      [nitrogenColorTags, nitrogenCutoffTags, nitrogenIntensityTags, molecularOxygenColorTags, molecularOxygenCutoffTags, molecularOxygenIntensityTags,
      atomicOxygenColorTags, atomicOxygenCutoffTags, atomicOxygenIntensityTags, raymarchStepsTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-aurora-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
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
      self.data.nitrogenCutOff = nitrogenCutoffTags.length > 0 ? parseFloat(nitrogenCutoffTags[0].innerHTML) : self.data.nitrogenCutOff;
      self.data.nitrogenIntensity = nitrogenIntensityTags.length > 0 ? parseFloat(nitrogenIntensityTags[0].innerHTML) : self.data.nitrogenIntensity;
      self.data.molecularOxygenCutOff = molecularOxygenCutoffTags.length > 0 ? parseFloat(molecularOxygenCutoffTags[0].innerHTML) : self.data.molecularOxygenCutOff;
      self.data.molecularOxygenIntensity = molecularOxygenIntensityTags.length > 0 ? parseFloat(molecularOxygenIntensityTags[0].innerHTML) : self.data.molecularOxygenIntensity;
      self.data.atomicOxygenCutOff = atomicOxygenCutoffTags.length > 0 ? parseFloat(atomicOxygenCutoffTags[0].innerHTML) : self.data.atomicOxygenCutOff;
      self.data.atomicOxygenIntensity = atomicOxygenIntensityTags.length > 0 ? parseFloat(atomicOxygenIntensityTags[0].innerHTML) : self.data.atomicOxygenIntensity;
      self.data.raymarchSteps = raymarchStepsTags.length > 0 ? parseInt(raymarchStepsTags[0].innerHTML) : self.data.raymarchSteps;

      //Clamp our results to the appropriate ranges
      const clampAndWarn = function(inValue, minValue, maxValue, tagName){
        const result = Math.min(Math.max(inValue, minValue), maxValue);
        if(inValue > maxValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a max value of ${maxValue} and a minimum value of ${minValue}.`);
        }
        else if(inValue < minValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a minmum value of ${minValue} and a minimum value of ${minValue}.`);
        }
        return result;
      };

      //Clamp the values in our tags
      self.data.nitrogenCutOff = clampAndWarn(self.data.nitrogenCutOff, 0.0, 1.0, '<sky-nitrogen-cutoff>');
      self.data.molecularOxygenCutOff = clampAndWarn(self.data.molecularOxygenCutOff, 0.0, 1.0, '<sky-molecular-oxygen-cutoff>');
      self.data.atomicOxygenCutOff = clampAndWarn(self.data.atomicOxygenCutOff, 0.0, 1.0, '<sky-atomic-oxygen-cutoff>');

      self.data.nitrogenIntensity = clampAndWarn(self.data.nitrogenIntensity, 0.0, Infinity, '<sky-nitrogen-intensity>');
      self.data.molecularOxygenIntensity = clampAndWarn(self.data.molecularOxygenIntensity, 0.0, Infinity, '<sky-molecular-oxygen-intensity>');
      self.data.atomicOxygenIntensity = clampAndWarn(self.data.atomicOxygenIntensity, 0.0, Infinity, '<sky-atomic-oxygen-intensity>');

      self.data.raymarchSteps = clampAndWarn(self.data.raymarchSteps, 4, Infinity, '<sky-aurora-raymarch-steps>');

      //Parse our nitrogen color
      if(nitrogenColorTags.length === 1){
        const firstNitrogenColorTagGroup = nitrogenColorTags[0];
        if(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-red').length > 0){
          self.data.nitrogenColor.red = clampAndWarn(parseInt(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-red')[0].innerHTML), 0, 255, 'sky-aurora-color-red');
        }
        if(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-green').length > 0){
          self.data.nitrogenColor.green = clampAndWarn(parseInt(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-green')[0].innerHTML), 0, 255, 'sky-aurora-color-green');
        }
        if(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-blue').length > 0){
          self.data.nitrogenColor.blue = clampAndWarn(parseInt(firstNitrogenColorTagGroup.getElementsByTagName('sky-aurora-color-blue')[0].innerHTML), 0, 255, 'sky-aurora-color-blue');
        }
      }

      //Parse our molecular oxygen color
      if(molecularOxygenColorTags.length === 1){
        const firstMolecularOxygenColorTagGroup = molecularOxygenColorTags[0];
        if(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-red').length > 0){
          self.data.molecularOxygenColor.red = clampAndWarn(parseInt(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-red')[0].innerHTML), 0, 255, 'sky-aurora-color-red');
        }
        if(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-green').length > 0){
          self.data.molecularOxygenColor.green = clampAndWarn(parseInt(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-green')[0].innerHTML), 0, 255, 'sky-aurora-color-green');
        }
        if(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-blue').length > 0){
          self.data.molecularOxygenColor.blue = clampAndWarn(parseInt(firstMolecularOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-blue')[0].innerHTML), 0, 255, 'sky-aurora-color-blue');
        }
      }

      //Parse our atomic oxygen color
      if(atomicOxygenColorTags.length === 1){
        const firstAtomicOxygenColorTagGroup = atomicOxygenColorTags[0];
        if(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-red').length > 0){
          self.data.atomicOxygenColor.red = clampAndWarn(parseInt(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-red')[0].innerHTML), 0, 255, 'sky-aurora-color-red');
        }
        if(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-green').length > 0){
          self.data.atomicOxygenColor.green = clampAndWarn(parseInt(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-green')[0].innerHTML), 0, 255, 'sky-aurora-color-green');
        }
        if(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-blue').length > 0){
          self.data.atomicOxygenColor.blue = clampAndWarn(parseInt(firstAtomicOxygenColorTagGroup.getElementsByTagName('sky-aurora-color-blue')[0].innerHTML), 0, 255, 'sky-aurora-color-blue');
        }
      }

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  }
};
window.customElements.define('sky-aurora-parameters', SkyAuroraParameters);
