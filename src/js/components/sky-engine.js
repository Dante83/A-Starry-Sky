AFRAME.registerComponent('skyengine', {
  schema:{
    date: {type: 'string', default: '2001-01-01 00:00:00'},
    timeMultiplier: {type: 'number', default: 1.0},
    utcOffset: {type: 'int', default: 0}
  },
  init: function(){
    this.starrySkyState = new StarrySkyEngine(this);
    this.tick = this.starrySkyState.tick;
    this.tock = this.starrySkyState.tock;
  },
  tick: this.starrySkyState ? this.starrySkyState.tick : null,
  tock: this.starrySkyState ? this.starrySkyState.tock : null,
});
