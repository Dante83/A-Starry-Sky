StarrySky.AtmosphericLUTLibrary = function(parentAssetLoader){
  let renderer = parentAssetLoader.starrySkyComponent.renderer;
  document.body.appendChild(renderer.domElement);

  let transmittanceRenderer = new THREE.GPUComputationRenderer(512, 512, renderer);

  //Using a 3D look up table of 256x32x32, I can have 2 256x32 textures per row
  //and 16*32 rows, using this structure allows us to directly compute the 3D texture
  //in one go.
  let singleScatteringRenderer = new THREE.GPUComputationRenderer(512, 512, renderer);

  let skyParameters = parentAssetLoader.data.skyParameters;
  let materials = StarrySky.materials.atmosphere;

  //Depth texture parameters. Note that texture depth is packing width * packing height
  const scatteringTextureWidth = 256;
  const scatteringTextureHeight = 32;
  const scatteringTexturePackingWidth = 2;
  const scatteringTexturePackingHeight = 16;

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

  //Run the actual shader
  transmittanceRenderer.compute();
  let transmittanceLUT = transmittanceRenderer.getCurrentRenderTarget(transmittanceVar).texture;

  //Set up our single scattering texture
  let singleScatteringTexture = singleScatteringRenderer.createTexture();
  let singleScatteringVar = singleScatteringRenderer.addVariable('singleScatteringTexture',
    materials.singleScatteringMaterial.fragmentShader(
      skyParameters.numberOfRaySteps,
      scatteringTextureWidth,
      scatteringTextureHeight,
      scatteringTexturePackingWidth,
      scatteringTexturePackingHeight
    ),
    singleScatteringTexture
  );
  singleScatteringRenderer.setVariableDependencies(singleScatteringVar, []);
  singleScatteringVar.material.uniforms = JSON.parse(JSON.stringify(materials.singleScatteringMaterial.uniforms));
  singleScatteringVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;

  //Check for any errors in initialization
  let error2 = singleScatteringRenderer.init();
  if(error2 !== null){
    console.error(`Single Scattering Renderer: ${error2}`);
  }

  //Run the actual shader
  singleScatteringRenderer.compute();
  let singleScatteringLUT = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringVar).texture;

  //For testing purposes
  let geometry = new THREE.PlaneBufferGeometry(1.0, 1.0, 32, 128);
  let testMaterial = new THREE.MeshBasicMaterial({
   side: THREE.FrontSide,
   map: singleScatteringLUT,
  });
  testMaterial.flatShading = true;
  let plane = new THREE.Mesh(geometry, testMaterial);
  plane.position.set(0.0, 1.5, -1.0);
  parentAssetLoader.starrySkyComponent.scene.add(plane);

  return transmittanceLUT;
}
