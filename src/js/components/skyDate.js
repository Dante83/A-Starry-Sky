AFRAME.registerComponent('sky_date', {
  schema:{
    dateString: {type: 'string', default: '2001-01-01 00:00:00'},
    timeMultiplier: {type: 'number', default: 1.0},
    utcOffset: {type: 'int', default: 0}
  }
});
