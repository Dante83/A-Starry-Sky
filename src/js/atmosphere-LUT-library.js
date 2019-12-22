function AtmosphereLUTLibrary(parentSkyEngine){
  this.parentSkyEngine = parentSkyEngine;
  this.renderer = parentSkyEngine.renderer;
  this.transmittanceRenderer = new THREE.GPUComputationRenderer(32, 128, this.renderer);
  this.singleScatteringRender = new THREE.GPUComputationRenderer(32, 128, this.renderer);
  this.gatheringSumRenderer = new THREE.GPUComputationRenderer(32, 32, this.renderer);
  this.aerialPerspectiveRender = new THREE.GPUComputationRenderer(32, 32, this.renderer);

  //Set up our transmittance texture
  let transmittanceGPUCompute = this.transmittanceRenderer;
  this.transmittanceTexture = transmittanceGPUCompute.createTexture();
  this.transmittanceVar = transmittanceGPUCompute.addVariable('transmittanceTexture', transmittanceMaterial.fragmentShader, this.transmittanceTexture);
  transmittanceGPUCompute.compute();
  transmittanceGPUCompute.compute();
}
