AFRAME.registerComponent('sky_params', {
  schema:{
    luminance: { type: 'number', default: 1.0, max: 2.0, min: 0.0, is: 'uniform' },
    turbidity: { type: 'number', default: 2.0, max: 20.0, min: 0.0, is: 'uniform' },
    rayleigh: { type: 'number', default: 1.0, max: 4.0, min: 0.0, is: 'uniform' },
    mieCoefficient: { type: 'number', default: 0.005, min: 0.0, max: 0.1, is: 'uniform' },
    mieDirectionalG: { type: 'number', default: 0.8, min: 0.0, max: 1, is: 'uniform' }
  }
});
