AFRAME.registerComponent('skyengine', {
  defaultValues: {
    location: {
      latitude: -111.0,
      longitude: 127.0
    },
    time: {
      date: (new Date()).toLocaleDateString(),
      utcOffset: -7,
      timeMultiplier: 200.0
    },
    skyParameters: {
      luminance: 1.0,
      mieCoefficient: 1.0,
      mieDirectionalG: 1.0,
      rayleigh: 1.0,
      turbidity: 1.0
    },
    assets:{
      moonImgSrc: null,
      moonNormalSrc: null,
      starDataBlobSrc: null,
    }
  },
  init: function(){
    this.renderer = this.el.sceneEl.renderer;
    let self = this;

    window.addEventListener('DOMContentLoaded', function(){
      self.assetLoader = new StarrySky.AssetLoader(self);
      // self.starrySkyRenderer = new StarrySky.Renderer(self);
      // self.tick = self.starrySkyRenderer.tick;
      // self.tock = self.starrySkyRenderer.tock;
    });
  },
  tick: this.starrySkyRenderer ? this.starrySkyRenderer.tick : null,
  tock: this.starrySkyRenderer ? this.starrySkyRenderer.tock : null,
});
