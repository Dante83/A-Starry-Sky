StarrySky.LUTlibraries.AtmosphericDataMRT = class AtmosphericDataMRT extends THREE.WebGLMultiRenderTarget{
  constructor(width, height){
    super(width, height);

    this.minFilter = THREE.LinearFilter;
    this.magFilter = THREE.LinearFilter;
    this.wrapS = THREE.MirroredRepeatWrapping;
    this.wrapT = THREE.ClampToEdgeWrapping;
  }
}
