StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
  //
  //TODO: Replace the sky dome with a plane
  //
  this.skyGeometry = new THREE.SphereGeometry(5000.0, 64, 32, 0, 2.0 * Math.PI, 0.0, 2.0 * Math.PI);

  //Create our material late
  let atmosphericShader;
  let atmospherePass = StarrySky.Materials.Atmosphere.atmosphereShader;
  console.log("BING!");
  console.log(skyDirector);
  let lutLibrary = new StarrySky.LUTlibraries.AtmosphericLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer);
  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(atmospherePass.uniforms)),
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    transparent: false,
    lights: false,
    flatShading: true,
    clipping: true,
    vertexShader: atmospherePass.vertexShader,
    fragmentShader: atmospherePass.fragmentShader(mieG, packingWidth, packingHeight, lutLibrary.atmosphereFunctionsString)
  });

  //Populate all of uniform values

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(geometry, this.atmosphereMaterial);

  //Initialize the position of the sky at the location of the camera
  this.skyMesh.position.set(0.0, 0.0, 0.0);

  //Add this object to the scene
  parentAssetLoader.starrySkyComponent.scene.add(plane);
}

StarrySky.Renderers.AtmosphereRenderer.prototype.tick = function(){
  //Get all the data for our current view to update the view parameters of our component

  //Update the uniforms so that we can see where we are on this sky.

  //Request an update to our shader

}
