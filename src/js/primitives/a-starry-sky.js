//Create primitive data associated with this, based off a-sky
//https://github.com/aframevr/aframe/blob/master/src/extras/primitives/primitives/a-sky.js
AFRAME.registerPrimitive('a-starry-sky', AFRAME.utils.extendDeep({}, AFRAME.primitives.getMeshMixin(), {
  // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
  defaultComponents: {
    geometry: {
      primitive: 'sphere',
      radius: 5000,
      segmentsWidth: 64,
      segmentsHeight: 32
    },
    scale: '-1, 1, 1',
    skyengine: {}, //Extends the primitive to grant it magical init, tick and tock methods
    defaultValues: {
      assets: {
        moonImgSrc: '../images/moon-dif-1024.png',
        moonNormalSrc: '../images/moon-nor-1024-padded.png',
        starDataBlobSrc: '../images/star-data.blob'
      },
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      parameters: {
        luminance: 1.0,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        rayleigh: 1.0,
        turbidity: 2.0
      },
      time: {
        date: '2001-01-01 00:00:00',
        timeMultiplier: 1.0,
        utcOffset: 0.0
      }
    }
  }
}));
