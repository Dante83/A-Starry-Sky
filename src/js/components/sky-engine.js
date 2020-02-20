AFRAME.registerComponent('skyengine', {
  defaultValues: StarrySky.DefaultData,
  skyDirector: null,
  initialized: false,
  init: function(){
    this.skyDirector = new StarrySky.SkyDirector(this);
  },
  tick: this.readyToTick ? function(){/*Do nothing*/} : null,
  tock: this.readyToTick ? function(){/*Do nothing*/} : null,
});
