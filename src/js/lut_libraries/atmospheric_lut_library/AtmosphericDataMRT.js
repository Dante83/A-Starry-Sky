import { WebGLMultipleRenderTargets } from "../../../js/three_js_extensions/WebGLMultipleRenderTargets.js";

class AtmosphericDataMRT extends WebGLMultipleRenderTargets{
  constructor(width, height){
    super(width, height);

    this.minFilter = THREE.LinearFilter;
    this.magFilter = THREE.LinearFilter;
    this.wrapS = THREE.MirroredRepeatWrapping;
    this.wrapT = THREE.ClampToEdgeWrapping;
  }
}

export { AtmosphericDataMRT };
