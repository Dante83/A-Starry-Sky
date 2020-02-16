AFRAME.registerComponent('skyengine', {
  defaultValues: {
    location: {

    },
    time: {

    },
    skyParameters: {

    },
    assets: {

    }
  },
  skyEngine: null,
  init: new StarrySky.Initialization(this),
  tick: this.skyEngine ? this.skyEngine.tick : null,
  tock: this.skyEngine ? this.skyEngine.tock : null,
});
