StarrySky.Renderers.AtmosphereRenderer = function(skyEngine){
  //Create a plane that's big enough to cover the entire screen
  this.drawPlaneGeometry = new THREE.PlaneBufferGeometry(1.0, 1.0, 32, 128);

  //Set up our shader material to render out the color of the sky on this plane
  this.atmosphericMaterial = new THREE.MeshBasicMaterial({
    side: THREE.FrontSide,
    map: scatteringSum,
  });
  this.atmosphericMaterial.flatShading = true;
  this.atmosphericMaterial.clipping = true;

  //Attach the material to our plane
  let plane = new THREE.Mesh(geometry, testMaterial);

  //Position our plane as far away from us that it's almost outside of the draw plane
  //and then orient it to face us.
  plane.position.set(0.0, 1.5, -1.0);

  //Add the plane to the scene.
  parentAssetLoader.starrySkyComponent.scene.add(plane);
}

StarrySky.Renderers.AtmosphereRenderer.prototype.tick(){
  //Move the draw plane so that it is back in the view and rotate it so that it is facing us

  //Update the uniforms so that we can see where we are on this sky.

  //Request an update to our shader

}
