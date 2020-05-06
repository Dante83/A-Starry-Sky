AFRAME.registerComponent('starryskywrapper', {
  defaultValues: StarrySky.DefaultData,
  skyDirector: null,
  initialized: false,
  init: function(){
    this.skyDirector = new StarrySky.SkyDirector(this);
  },
  tick: function(time, timeDelta){
    /*Do Nothing*/
  }
});
