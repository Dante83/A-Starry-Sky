StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
  //
  //TODO: Replace the sky dome with a plane
  //
  this.skyGeometry = new THREE.SphereGeometry(5000.0, 128, 64, 0, 2.0 * Math.PI, 0.0, 2.0 * Math.PI);

  //Create our material late
  let lutLibrary = new StarrySky.LUTlibraries.AtmosphericLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms)),
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    transparent: false,
    lights: false,
    flatShading: true,
    clipping: true,
    vertexShader: StarrySky.Materials.Atmosphere.atmosphereShader.vertexShader,
    fragmentShader: StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      skyDirector.assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      lutLibrary.scatteringTextureWidth,
      lutLibrary.scatteringTextureHeight,
      lutLibrary.scatteringTexturePackingWidth,
      lutLibrary.scatteringTexturePackingHeight,
      lutLibrary.atmosphereFunctionsString
    )
  });
  this.atmosphereMaterial.uniforms.solarRayleighInscatteringSum.value = lutLibrary.rayleighScatteringSum;
  this.atmosphereMaterial.uniforms.solarRayleighInscatteringSum.needsUpdate = true;
  this.atmosphereMaterial.uniforms.solarMieInscatteringSum.value = lutLibrary.mieScatteringSum;
  this.atmosphereMaterial.uniforms.solarMieInscatteringSum.needsUpdate = true;

  //Populate all of uniform values

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(this.skyGeometry, this.atmosphereMaterial);

  //Initialize the position of the sky at the location of the camera
  this.skyMesh.position.set(0.0, 0.0, 0.0);

  //Add this object to the scene
  skyDirector.scene.add(this.skyMesh);
}

StarrySky.Renderers.AtmosphereRenderer.prototype.tick = function(){
  //Get all the data for our current view to update the view parameters of our component

  //Update the uniforms so that we can see where we are on this sky.

  //Request an update to our shader

}