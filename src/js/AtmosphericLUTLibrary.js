StarrySky.AtmosphericLUTLibrary = function(parentAssetLoader){
  let renderer = parentAssetLoader.starrySkyComponent.renderer;
  document.body.appendChild(renderer.domElement);

  let transmittanceRenderer = new THREE.GPUComputationRenderer(512, 512, renderer);

  //Using a 3D look up table of 256x32x32, I can have 2 256x32 textures per row
  //and 16*32 rows, using this structure allows us to directly compute the 3D texture
  //in one go.
  let singleScatteringRenderer = new THREE.GPUComputationRenderer(512, 512, renderer);
  let scatteringSumRenderer = new THREE.GPUComputationRenderer(512, 512, renderer);

  let skyParameters = parentAssetLoader.data.skyParameters;
  let materials = StarrySky.materials.atmosphere;

  //Depth texture parameters. Note that texture depth is packing width * packing height
  const scatteringTextureWidth = 256;
  const scatteringTextureHeight = 32;
  const scatteringTexturePackingWidth = 2;
  const scatteringTexturePackingHeight = 16;
  const mieGCoefficient = 1.0; //TODO: Update this

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

  //
  //Set up our single scattering texture
  //
  //Mie
  let singleScatteringMieTexture = singleScatteringRenderer.createTexture();
  let singleScatteringMieVar = singleScatteringRenderer.addVariable('kthInscatteringMie',
    materials.singleScatteringMaterial.fragmentShader(
      skyParameters.numberOfRaySteps,
      scatteringTextureWidth,
      scatteringTextureHeight,
      scatteringTexturePackingWidth,
      scatteringTexturePackingHeight,
      false //Is Rayleigh
    ),
    singleScatteringMieTexture
  );
  singleScatteringRenderer.setVariableDependencies(singleScatteringMieVar, []);
  singleScatteringMieVar.material.uniforms = JSON.parse(JSON.stringify(materials.singleScatteringMaterial.uniforms));
  singleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;

  //Rayleigh
  let singleScatteringRayleighTexture = singleScatteringRenderer.createTexture();
  let singleScatteringRayleighVar = singleScatteringRenderer.addVariable('kthInscatteringRayleigh',
    materials.singleScatteringMaterial.fragmentShader(
      skyParameters.numberOfRaySteps,
      scatteringTextureWidth,
      scatteringTextureHeight,
      scatteringTexturePackingWidth,
      scatteringTexturePackingHeight,
      true //Is Rayleigh
    ),
    singleScatteringRayleighTexture
  );
  singleScatteringRenderer.setVariableDependencies(singleScatteringRayleighVar, []);
  singleScatteringRayleighVar.material.uniforms = JSON.parse(JSON.stringify(materials.singleScatteringMaterial.uniforms));
  singleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;

  //Check for any errors in initialization
  let error2 = singleScatteringRenderer.init();
  if(error2 !== null){
    console.error(`Single Scattering Renderer: ${error2}`);
  }

  //Run the scattering shader
  singleScatteringRenderer.compute();
  let mieScattering = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringMieVar).texture;
  let rayleighScattering = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringRayleighVar).texture;

  //Combine our two shaders together into an inscattering sum texture
  let inscatteringSumTexture = scatteringSumRenderer.createTexture();
  let inscatteringSumVar = scatteringSumRenderer.addVariable('inscatteringSumTexture',
    materials.inscatteringSumMaterial.fragmentShader, //Initializing
    inscatteringSumTexture
  );
  scatteringSumRenderer.setVariableDependencies(inscatteringSumVar, []);
  inscatteringSumVar.material.uniforms = JSON.parse(JSON.stringify(materials.inscatteringSumMaterial.uniforms));
  inscatteringSumVar.material.uniforms.isNotFirstIteration.value = 0;
  inscatteringSumVar.material.uniforms.kthInscatteringMie.value = mieScattering;
  inscatteringSumVar.material.uniforms.kthInscatteringRayleigh.value = rayleighScattering;

  //Check for any errors in initialization
  let error3 = scatteringSumRenderer.init();
  if(error3 !== null){
    console.error(`Single Scattering Sum Renderer: ${error3}`);
  }
  scatteringSumRenderer.compute();
  let scatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringSumVar).texture;

  //
  //Set up our multiple scattering textures
  //
  let multipleScatteringRenderer = new THREE.GPUComputationRenderer(512, 512, renderer);

  //Mie
  let multipleScatteringMieTexture = multipleScatteringRenderer.createTexture();
  let multipleScatteringMieVar = multipleScatteringRenderer.addVariable('kthInscatteringMie',
    materials.kthInscatteringMaterial.fragmentShader(
      skyParameters.numberOfRaySteps,
      scatteringTextureWidth,
      scatteringTextureHeight,
      scatteringTexturePackingWidth,
      scatteringTexturePackingHeight,
      mieGCoefficient,
      false //Is Rayleigh
    ),
    multipleScatteringMieTexture
  );
  multipleScatteringRenderer.setVariableDependencies(multipleScatteringMieVar, []);
  multipleScatteringMieVar.material.uniforms = JSON.parse(JSON.stringify(materials.kthInscatteringMaterial.uniforms));
  multipleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  multipleScatteringMieVar.material.uniforms.kMinusOneMieInscattering.value = mieScattering;
  multipleScatteringMieVar.material.uniforms.kMinusOneRayleighInscattering.value = rayleighScattering;

  //Rayleigh
  let multipleScatteringRayleighTexture = multipleScatteringRenderer.createTexture();
  let multipleScatteringRayleighVar = multipleScatteringRenderer.addVariable('kthInscatteringRayleigh',
    materials.kthInscatteringMaterial.fragmentShader(
      skyParameters.numberOfRaySteps,
      scatteringTextureWidth,
      scatteringTextureHeight,
      scatteringTexturePackingWidth,
      scatteringTexturePackingHeight,
      mieGCoefficient,
      true //Is Rayleigh
    ),
    multipleScatteringRayleighTexture
  );
  multipleScatteringRenderer.setVariableDependencies(multipleScatteringRayleighVar, []);
  multipleScatteringRayleighVar.material.uniforms = JSON.parse(JSON.stringify(materials.kthInscatteringMaterial.uniforms));
  multipleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  multipleScatteringRayleighVar.material.uniforms.kMinusOneMieInscattering.value = mieScattering;
  multipleScatteringRayleighVar.material.uniforms.kMinusOneRayleighInscattering.value = rayleighScattering;

  //Check for any errors in initialization
  let error4 = multipleScatteringRenderer.init();
  if(error4 !== null){
    console.error(`Multiple Scattering Renderer: ${error4}`);
  }

  //Run the multiple scattering shader
  multipleScatteringRenderer.compute();
  mieScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar).texture;
  rayleighScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar).texture;

  //Sum
  inscatteringSumVar.material.uniforms.isNotFirstIteration.value = 1;
  inscatteringSumVar.material.uniforms.kthInscatteringMie.value = mieScattering;
  inscatteringSumVar.material.uniforms.kthInscatteringRayleigh.value = rayleighScattering;
  inscatteringSumVar.material.uniforms.previousInscatteringSum.value = scatteringSum;
  scatteringSumRenderer.compute();
  scatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringSumVar).texture;

  //Let's just focus on the second order scattering until that looks correct, possibly giving
  //another look over the first order scattering to make sure we have that correct as well.
  // for(let i = 0; i < 7; ++i){
  //   //Mie
  //   multipleScatteringMieVar.material.uniforms.kMinusOneMieInscattering.value = mieScattering;
  //   multipleScatteringMieVar.material.uniforms.kMinusOneRayleighInscattering.value = rayleighScattering;
  //
  //   //Rayleigh
  //   multipleScatteringRayleighVar.material.uniforms.kMinusOneMieInscattering.value = mieScattering;
  //   multipleScatteringRayleighVar.material.uniforms.kMinusOneRayleighInscattering.value = rayleighScattering;
  //
  //   //Compute this mie and rayliegh scattering order
  //   multipleScatteringRenderer.compute();
  //   mieScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar).texture;
  //   rayleighScattering = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar).texture;
  //
  //   //Add these into the sum
  //   inscatteringSumVar.material.uniforms.kthInscatteringMie.value = mieScattering;
  //   inscatteringSumVar.material.uniforms.kthInscatteringRayleigh.value = rayleighScattering;
  //   inscatteringSumVar.material.uniforms.previousInscatteringSum.value = scatteringSum;
  //   scatteringSumRenderer.compute();
  //   scatteringSum = scatteringSumRenderer.getCurrentRenderTarget(inscatteringSumVar).texture;
  // }

  //For testing purposes
  let geometry = new THREE.PlaneBufferGeometry(1.0, 1.0, 32, 128);
  let testMaterial = new THREE.MeshBasicMaterial({
   side: THREE.FrontSide,
   map: scatteringSum,
  });
  testMaterial.flatShading = true;
  let plane = new THREE.Mesh(geometry, testMaterial);
  plane.position.set(0.0, 1.5, -1.0);
  parentAssetLoader.starrySkyComponent.scene.add(plane);

  return transmittanceLUT;
}
