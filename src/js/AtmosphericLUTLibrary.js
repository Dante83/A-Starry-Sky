StarrySky.AtmosphericLUTLibrary = function(parentAssetLoader){
  let renderer = parentAssetLoader.starrySkyComponent.renderer;
  document.body.appendChild(renderer.domElement);

  let transmittanceRenderer = new THREE.GPUComputationRenderer(32, 128, renderer);
  // this.singleScatteringRender = new THREE.GPUComputationRenderer(32, 128, this.renderer);
  // this.gatheringSumRenderer = new THREE.GPUComputationRenderer(32, 32, this.renderer);
  // this.aerialPerspectiveRender = new THREE.GPUComputationRenderer(32, 32, this.renderer);

  let skyParameters = parentAssetLoader.data.skyParameters;

  //Set up our transmittance texture
  let transmittanceTexture = transmittanceRenderer.createTexture();
  let transmittanceVar = transmittanceRenderer.addVariable('transmittanceTexture',
    StarrySky.materials.atmosphere.transmittanceMaterial.fragmentShader(skyParameters.numberOfRaySteps),
    transmittanceTexture
  );
  transmittanceRenderer.setVariableDependencies(transmittanceVar, []);
  transmittanceRenderer.compute();
  transmittanceRenderer.compute();

  let transmittanceLUT = transmittanceRenderer.getCurrentRenderTarget(transmittanceVar).texture;

  return transmittanceLUT;
}
