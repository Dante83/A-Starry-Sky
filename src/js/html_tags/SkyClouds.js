//child tags
window.customElements.define('sky-cloud-coverage', class extends HTMLElement{});
window.customElements.define('sky-cloud-type', class extends HTMLElement{});
window.customElements.define('sky-cloud-start-height', class extends HTMLElement{});
window.customElements.define('sky-cloud-end-height', class extends HTMLElement{});
window.customElements.define('sky-cloud-fade-out-start-percent', class extends HTMLElement{});
window.customElements.define('sky-cloud-fade-in-end-percent', class extends HTMLElement{});
window.customElements.define('sky-cloud-velocity-x', class extends HTMLElement{});
window.customElements.define('sky-cloud-velocity-y', class extends HTMLElement{});
window.customElements.define('sky-cloud-start-seed', class extends HTMLElement{});
window.customElements.define('sky-cloud-raymarch-steps', class extends HTMLElement{});
window.customElements.define('sky-cloud-cutoff-distance', class extends HTMLElement{});
window.customElements.define('sky-mid-cloud-coverage', class extends HTMLElement{});
window.customElements.define('sky-mid-cloud-type', class extends HTMLElement{});
window.customElements.define('sky-mid-cloud-height', class extends HTMLElement{});

StarrySky.DefaultData.skyCloud = {
  coverage: 70.0,
  //0 stratus, 0.25 stratocumulus, 0.5 cumulus, 0.75 congestus, 1 cumulonimbus --
  //the same scale as the-cloud-factory's low deck.
  type: 0.5,
  //The condensation level, where cumulus bases sit; each species' own base and
  //depth come from the meteorology relative to it (cloud-density.glsl).
  startHeight: 1000.0,
  //A cap on how high anything builds -- by default the tropopause, so cumulonimbus
  //can reach their 11km tops.
  endHeight: 12000.0,
  fadeOutStartPercent: 90.0,
  fadeInEndPercent: 10.0,
  velocity: new THREE.Vector2(40.0, 40.0),
  startSeed: Date.now() % (86400 * 365),
  numberOfRayMarchSteps: 32.0,
  //Clouds now follow the curve of the Earth down to the horizon, which from the
  //ground is ~110km away for a 1km cloud base. They thin out over the last 40% of
  //this distance rather than stopping dead.
  cutoffDistance: 160000.0,
  //A second deck above the first: 0 altocumulus .. 1 altostratus, off by default.
  midCoverage: 0.0,
  midType: 0.0,
  //Its base, in meters above the observer. Mid level clouds live 2 to 7km up.
  midHeight: 4000.0,
  cloudsEnabled: false
};

//Parent method
class SkyClouds extends HTMLElement {
  constructor(){
    super();

    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyCloud;
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
      const cloudTypeTags = self.getElementsByTagName('sky-cloud-type');
      const startHeightTags = self.getElementsByTagName('sky-cloud-start-height');
      const endHeightTags = self.getElementsByTagName('sky-cloud-end-height');
      const fadeOutStartPercentTags = self.getElementsByTagName('sky-cloud-fade-out-start-percent');
      const fadeInEndPercentTags = self.getElementsByTagName('sky-cloud-fade-in-end-percent');
      const cloudVelocityXTags = self.getElementsByTagName('sky-cloud-velocity-x');
      const cloudVelocityYTags = self.getElementsByTagName('sky-cloud-velocity-y');
      const startSeedTags = self.getElementsByTagName('sky-cloud-start-seed');
      const raymarchStepsTags = self.getElementsByTagName('sky-cloud-raymarch-steps');
      const cutoffDistanceTags = self.getElementsByTagName('sky-cloud-cutoff-distance');
      const midCoverageTags = self.getElementsByTagName('sky-mid-cloud-coverage');
      const midTypeTags = self.getElementsByTagName('sky-mid-cloud-type');
      const midHeightTags = self.getElementsByTagName('sky-mid-cloud-height');

      [cloudCoverageTags, cloudTypeTags, startHeightTags, endHeightTags, endHeightTags, fadeOutStartPercentTags,
      fadeInEndPercentTags, cloudVelocityXTags, cloudVelocityYTags, startSeedTags,
      raymarchStepsTags, cutoffDistanceTags, midCoverageTags, midTypeTags, midHeightTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-cloud-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      dataRef.coverage = cloudCoverageTags.length > 0 ? parseFloat(cloudCoverageTags[0].innerHTML) : dataRef.coverage;
      dataRef.type = cloudTypeTags.length > 0 ? parseFloat(cloudTypeTags[0].innerHTML) : dataRef.type;
      dataRef.startHeight = startHeightTags.length > 0 ? parseFloat(startHeightTags[0].innerHTML) : dataRef.startHeight;
      dataRef.endHeight = endHeightTags.length > 0 ? parseFloat(endHeightTags[0].innerHTML) : dataRef.endHeight;
      dataRef.fadeOutStartPercent = fadeOutStartPercentTags.length > 0 ? parseFloat(fadeOutStartPercentTags[0].innerHTML) : dataRef.fadeOutStartPercent;
      dataRef.fadeInEndPercent = fadeInEndPercentTags.length > 0 ? parseFloat(fadeInEndPercentTags[0].innerHTML) : dataRef.fadeInEndPercent;
      dataRef.startSeed = startSeedTags.length > 0 ? parseInt(startSeedTags[0].innerHTML) : dataRef.startSeed;
      dataRef.numberOfRayMarchSteps = raymarchStepsTags.length > 0 ? parseInt(raymarchStepsTags[0].innerHTML) : dataRef.numberOfRayMarchSteps;
      dataRef.cutoffDistance = cutoffDistanceTags.length > 0 ? parseFloat(cutoffDistanceTags[0].innerHTML) : dataRef.cutoffDistance;
      dataRef.midCoverage = midCoverageTags.length > 0 ? parseFloat(midCoverageTags[0].innerHTML) : dataRef.midCoverage;
      dataRef.midType = midTypeTags.length > 0 ? parseFloat(midTypeTags[0].innerHTML) : dataRef.midType;
      dataRef.midHeight = midHeightTags.length > 0 ? parseFloat(midHeightTags[0].innerHTML) : dataRef.midHeight;

      //Handle the special case of our xy values
      let velocityDataX = cloudVelocityXTags.length > 0 ? parseFloat(cloudVelocityXTags[0].innerHTML) : dataRef.velocity.x;
      let velocityDataY = cloudVelocityYTags.length > 0 ? parseFloat(cloudVelocityYTags[0].innerHTML) : dataRef.velocity.y;

      //Clamp the values in our tags
      const clampAndWarn = StarrySky.HTMLTagUtils.clampAndWarn;
      dataRef.coverage = clampAndWarn(dataRef.coverage, 0.0, 100.0, '<sky-cloud-coverage>');
      //A plain fraction now. The old remap was a threshold tuned to the retired fBm
      //density; the new density takes coverage directly (see cloud-density.glsl).
      dataRef.coverage = dataRef.coverage / 100.0;
      dataRef.type = clampAndWarn(dataRef.type, 0.0, 1.0, '<sky-cloud-type>');
      dataRef.startHeight = clampAndWarn(dataRef.startHeight, 0.0, 100000.0, '<sky-cloud-start-height>');
      dataRef.endHeight = clampAndWarn(dataRef.endHeight, 0.1, 9999999.9, '<sky-cloud-end-height>');
      dataRef.fadeOutStartPercent = clampAndWarn(dataRef.fadeOutStartPercent, 0.01, 100.0, '<sky-cloud-fade-out-start-percent>') / 100.0;
      dataRef.fadeInEndPercent = clampAndWarn(dataRef.fadeInEndPercent, 0.0, 99.99, '<sky-cloud-fade-in-end-percent>') / 100.0;
      dataRef.startSeed = clampAndWarn(dataRef.startSeed, 0, Number.MAX_SAFE_INTEGER, '<sky-cloud-start-seed>');
      dataRef.cutoffDistance = clampAndWarn(dataRef.cutoffDistance, 0.1, 9999999.9, '<sky-cloud-cutoff-distance>');
      dataRef.midCoverage = clampAndWarn(dataRef.midCoverage, 0.0, 100.0, '<sky-mid-cloud-coverage>') / 100.0;
      dataRef.midType = clampAndWarn(dataRef.midType, 0.0, 1.0, '<sky-mid-cloud-type>');
      dataRef.midHeight = clampAndWarn(dataRef.midHeight, 0.0, 100000.0, '<sky-mid-cloud-height>');
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
