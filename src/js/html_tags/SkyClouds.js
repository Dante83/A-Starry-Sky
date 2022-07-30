//child tags
window.customElements.define('sky-cloud-coverage', class extends HTMLElement{});
window.customElements.define('sky-cloud-start-height', class extends HTMLElement{});
window.customElements.define('sky-cloud-end-height', class extends HTMLElement{});
window.customElements.define('sky-cloud-fade-out-start-percent', class extends HTMLElement{});
window.customElements.define('sky-cloud-fade-in-end-percent', class extends HTMLElement{});
window.customElements.define('sky-cloud-velocity-x', class extends HTMLElement{});
window.customElements.define('sky-cloud-velocity-y', class extends HTMLElement{});
window.customElements.define('sky-cloud-start-seed', class extends HTMLElement{});
window.customElements.define('sky-cloud-raymarch-steps', class extends HTMLElement{});
window.customElements.define('sky-cloud-cutoff-distance', class extends HTMLElement{});

StarrySky.DefaultData.cloudParameters = {
  coverage: 50.0,
  startHeight: 1000.0,
  endHeight: 2500.0,
  fadeOutStartPercent: 90.0,
  fadeInEndPercent: 5.0,
  velocity: new THREE.Vector2(0.0, 0.0),
  startSeed: Date.now() % (86400 * 365),
  numberOfRayMarchSteps: 64.0,
  cutoffDistance: 40000.0,
  cloudsEnabled: false
};

//Parent method
class SkyClouds extends HTMLElement {
  constructor(){
    super();

    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.cloudParameters;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Data Ref
      const dataRef = self.data;

      //The mere presence of this tag enables clouds
      dataRef.cloudsEnabled = true;
      const cloudCoverageTags = self.getElementsByTagName('sky-cloud-coverage');
      const startHeightTags = self.getElementsByTagName('sky-cloud-start-height');
      const endHeightTags = self.getElementsByTagName('sky-cloud-end-height');
      const fadeOutStartPercentTags = self.getElementsByTagName('sky-cloud-fade-out-start-percent');
      const fadeInEndPercentTags = self.getElementsByTagName('sky-cloud-fade-in-end-percent');
      const cloudVelocityXTags = self.getElementsByTagName('sky-cloud-velocity-x');
      const cloudVelocityYTags = self.getElementsByTagName('sky-cloud-velocity-y');
      const startSeedTags = self.getElementsByTagName('sky-cloud-start-seed');
      const raymarchStepsTags = self.getElementsByTagName('sky-cloud-raymarch-steps');
      const cutoffDistanceTags = self.getElementsByTagName('sky-cloud-cutoff-distance');

      [cloudCoverageTags, startHeightTags, endHeightTags, endHeightTags, fadeOutStartPercentTags,
      fadeInEndPercentTags, cloudVelocityXTags, cloudVelocityYTags, startSeedTags,
      raymarchStepsTags, cutoffDistanceTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-cloud-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      dataRef.coverage = cloudCoverageTags.length > 0 ? parseFloat(cloudCoverageTags[0].innerHTML) : dataRef.coverage;
      dataRef.startHeight = startHeightTags.length > 0 ? parseFloat(startHeightTags[0].innerHTML) : dataRef.startHeight;
      dataRef.endHeight = endHeightTags.length > 0 ? parseFloat(endHeightTags[0].innerHTML) : dataRef.endHeight;
      dataRef.fadeOutStartPercent = fadeOutStartPercentTags.length > 0 ? parseFloat(fadeOutStartPercentTags[0].innerHTML) : dataRef.fadeOutStartPercent;
      dataRef.fadeInEndPercent = fadeInEndPercentTags.length > 0 ? parseFloat(fadeInEndPercentTags[0].innerHTML) : dataRef.fadeInEndPercent;
      dataRef.startSeed = startSeedTags.length > 0 ? parseInt(startSeedTags[0].innerHTML) : dataRef.startSeed;
      dataRef.numberOfRayMarchSteps = raymarchStepsTags.length > 0 ? parseInt(raymarchStepsTags[0].innerHTML) : dataRef.numberOfRayMarchSteps;
      dataRef.cutoffDistance = cutoffDistanceTags.length > 0 ? parseFloat(cutoffDistanceTags[0].innerHTML) : dataRef.cutoffDistance;

      //Handle the special case of our xy values
      let velocityDataX = cloudVelocityXTags.length > 0 ? parseFloat(cloudVelocityXTags[0].innerHTML) : dataRef.velocity.x;
      let velocityDataY = cloudVelocityYTags.length > 0 ? parseFloat(cloudVelocityYTags[0].innerHTML) : dataRef.velocity.y;

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.coverage = clampAndWarn(dataRef.coverage, 0.0, 100.0, '<sky-cloud-coverage>');
      dataRef.coverage = (100.0 - (dataRef.coverage + 20.0) * 0.5833333333333) / 100.0; //Clouds don't start until 20% and end at 70%
      dataRef.startHeight = clampAndWarn(dataRef.startHeight, 0.0, 100000.0, '<sky-cloud-start-height>');
      dataRef.endHeight = clampAndWarn(dataRef.endHeight, 0.1, 9999999.9, '<sky-cloud-end-height>');
      dataRef.fadeOutStartPercent = clampAndWarn(dataRef.fadeOutStartPercent, 0.01, 100.0, '<sky-cloud-fade-out-start-percent>') / 100.0;
      dataRef.fadeInEndPercent = clampAndWarn(dataRef.fadeInEndPercent, 0.0, 99.99, '<sky-cloud-fade-in-end-percent>') / 100.0;
      dataRef.startSeed = clampAndWarn(dataRef.startSeed, 0, Number.MAX_SAFE_INTEGER, '<sky-cloud-start-seed>');
      dataRef.cutoffDistance = clampAndWarn(dataRef.cutoffDistance, 0.1, 9999999.9, '<sky-cloud-cutoff-distance>');
      velocityDataX = clampAndWarn(velocityDataX, -9999.0, 9999.0, '<sky-cloud-velocity-x>');
      velocityDataY = clampAndWarn(velocityDataY, -9999.0, 9999.0, '<sky-cloud-velocity-y>');
      dataRef.velocity.x = velocityDataX;
      dataRef.velocity.y = velocityDataY;

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  }
}
window.customElements.define('sky-clouds', SkyClouds);
