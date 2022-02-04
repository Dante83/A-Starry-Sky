import DataTexture3D from 'THREE';

export default class AtmosphericDataTexture3D extends DataTexture3D{
  constructor(data, width, height, depth){
    super(data, width, height, depth);

    this.type = (/(iPad|iPhone|iPod)/g.test( navigator.userAgent )) ? THREE.HalfFloatType : THREE.FloatType;
    this.format = THREE.RGBAFormat;
    this.minFilter = THREE.LinearFilter;
    this.magFilter = THREE.LinearFilter;
    this.wrapS = THREE.MirroredRepeatWrapping;
    this.wrapT = THREE.ClampToEdgeWrapping;
    this.wrapR = THREE.MirroredRepeatWrapping;
    this.stencilBuffer = THREE.MirroredRepeatWrapping;
    this.depthBuffer = THREE.MirroredRepeatWrapping;
  }
}
