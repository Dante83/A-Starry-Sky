AFRAME.registerComponent('skyengine', {
  defaultValues: StarrySky.DefaultData,
  skyDirector: null,
  init: function(){
    new StarrySky.SkyDirector(this)
  }
  tick: this.skyEngine ? this.skyEngine.tick : null,
  tock: this.skyEngine ? this.skyEngine.tock : null,
});
