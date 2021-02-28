AFRAME.registerComponent('starryskywrapper', {
  defaultValues: StarrySky.DefaultData,
  skyDirector: null,
  initialized: false,
  init: function(){
    this.skyDirector = new StarrySky.SkyDirector(this, this.el.getAttribute('web-worker-src'));
  },
  tick: function(time, timeDelta){
    /*Do Nothing*/
  }
});
