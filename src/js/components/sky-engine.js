AFRAME.registerComponent('skyengine', {
  init: function(){
    let self = this;
    window.addEventListener('DOMContentLoaded', function(){
      self.starrySkyLoader = new StarrySkyLoader(self);
      self.tick = self.starrySkyLoader.tick;
      self.tock = self.starrySkyLoader.tock;
    });
  },
  tick: this.starrySkyLoader ? this.starrySkyLoader.tick : null,
  tock: this.starrySkyLoader ? this.starrySkyLoader.tock : null,
});
