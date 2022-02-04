import { AtmosphericDataMRT } from "./AtmosphericDataMRT.js";

export default class AtmosphericDataLUTDirector{
  constructor(scene, renderer, width, height, depth){
    this.scene = scene;
    this.renderer = renderer;
    this.width = width;
    this.height = height;
    this.depth = depth;

    const BYTES_PER_32_BIT_FLOAT = 4;
    this.NUMBER_OF_PIXEL_CHANNELS_IN_SCATTERING_SLICE = width * height * 4;
    this.SCATTERING_DATA_SLICE_SIZE = BYTES_PER_32_BIT_FLOAT * this.NUMBER_OF_PIXEL_CHANNELS_IN_SCATTERING_SLICE;
    this.SCATTERING_DATA_SIZE = this.SCATTERING_DATA_SLICE_SIZE * depth;
    this.mrtRenderTarget = new AtmosphericDataMRT(width, height, 2);

    this.rayleighDataArraySliceBuffer = new ArrayBuffer(SCATTERING_DATA_SLICE_SIZE);
    this.rayleighDataArraySlice = new Float32Array(rayleighDataArraySliceBuffer);
    this.meiDataArraySliceBuffer = new ArrayBuffer(SCATTERING_DATA_SLICE_SIZE);
    this.meiDataArraySlice = new Float32Array(meiDataArraySliceBuffer);
  }

  render(material){
    const meiDataArrayBuffer = new ArrayBuffer(this.SCATTERING_DATA_SIZE);
    const meiData = new Float32Array(meiDataArrayBuffer);
    const rayleighDataArrayBuffer = new ArrayBuffer(this.SCATTERING_DATA_SIZE);
    const rayleighData = new Float32Array(rayleighDataArrayBuffer);

    this.scene.setShaderMaterial(material);
    for(let i = 0; i < this.depth; ++i){
      //Set up the shader...
      material.uniforms.uvz = i / this.scatteringTextureDepth;
      this.renderer.renderTo(this.mrtRenderTarget);

      //Read the target pixels into the array buffer to be consumed by the 3D Texture
      this.renderer.readRenderTargetPixels(this.mrtRenderTarget.texture[0], 0, 0, this.width, this.height, rayleighDataArraySlice);
      this.renderer.readRenderTargetPixels(this.mrtRenderTarget.texture[1], 0, 0, this.width, this.height, meiDataArraySlice);

      //Copy these values into the main buffers
      rayleighDataArrayBuffer.set(i * NUMBER_OF_PIXEL_CHANNELS_IN_SCATTERING_SLICE, rayleighDataArraySlice);
      meiDataArrayBuffer.set(i * NUMBER_OF_PIXEL_CHANNELS_IN_SCATTERING_SLICE, meiDataArraySlice);
    }

    return {
      rayleigh: new StarrySky.LUTlibraries.AtmosphericDataLUT(rayleighData, this.scatteringTextureWidth, this.scatteringTextureHeight),
      mei: new StarrySky.LUTlibraries.AtmosphericDataLUT(meiData, this.scatteringTextureWidth, this.scatteringTextureHeight)
    };
  }
};
