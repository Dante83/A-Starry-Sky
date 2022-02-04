import LinearFilter, MirroredRepeatWrapping, ClampToEdgeWrapping from 'THREE';
import { WebGLMultipleRenderTargets } from "../../../js/three_js_extensions/WebGLMultipleRenderTargets.js";

export default class AtmosphericDataMRT extends WebGLMultipleRenderTargets{
  constructor(width, height){
    super(width, height);

    this.minFilter = LinearFilter;
    this.magFilter = LinearFilter;
    this.wrapS = MirroredRepeatWrapping;
    this.wrapT = ClampToEdgeWrapping;
  }
}
