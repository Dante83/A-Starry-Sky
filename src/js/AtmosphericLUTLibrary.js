StarrySky.AtmosphericLUTLibrary = function(parentAssetLoader){
  let renderer = parentAssetLoader.starrySkyComponent.renderer;
  document.body.appendChild(renderer.domElement);

  let transmittanceRenderer = new THREE.GPUComputationRenderer(512, 512, renderer);
  // this.singleScatteringRender = new THREE.GPUComputationRenderer(32, 128, this.renderer);
  // this.gatheringSumRenderer = new THREE.GPUComputationRenderer(32, 32, this.renderer);
  // this.aerialPerspectiveRender = new THREE.GPUComputationRenderer(32, 32, this.renderer);

  let skyParameters = parentAssetLoader.data.skyParameters;
  let materials = StarrySky.materials.atmosphere;

  //Set up our transmittance texture
  let transmittanceTexture = transmittanceRenderer.createTexture();
  let transmittanceVar = transmittanceRenderer.addVariable('transmittanceTexture',
    materials.transmittanceMaterial.fragmentShader(skyParameters.numberOfRaySteps),
    transmittanceTexture
  );
  transmittanceRenderer.setVariableDependencies(transmittanceVar, []);
  transmittanceVar.material.uniforms = {};

  //Check for any errors in initialization
  let error1 = transmittanceRenderer.init();
  if(error1 !== null){
    console.error(`Transmittance Renderer: ${error1}`);
  }

  //Fire up our compute shader twice to fill in both renderers
  transmittanceRenderer.compute();
  let transmittanceLUT = transmittanceRenderer.getCurrentRenderTarget(transmittanceVar).texture;

  //For testing purposes
  let geometry = new THREE.PlaneBufferGeometry(1.0, 1.0, 32, 128);
  let testMaterial = new THREE.MeshBasicMaterial({
   side: THREE.FrontSide,
   map: transmittanceLUT,
  });
  testMaterial.flatShading = true;
  let plane = new THREE.Mesh(geometry, testMaterial);
  plane.position.set(0.0, 1.5, -1.0);
  parentAssetLoader.starrySkyComponent.scene.add(plane);

  return transmittanceLUT;
}
