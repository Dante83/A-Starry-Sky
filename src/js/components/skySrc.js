AFRAME.registerComponent('sky_src', {
  schema:{
    imgDir: {type: 'string', default: '../images/'},
    moonTexture: {type: 'map', default: 'moon-dif-1024.png'},
    moonNormalMap: {type: 'map', default: 'moon-nor-1024-padded.png'}
  },
  init:{
    //Load all of our components.

  }
});
