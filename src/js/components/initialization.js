StarrySky.Initialization = function(parentComponent){
  this.renderer = self.el.sceneEl.renderer;
  this.scene = self.el.sceneEl.object3D;
  this.properties;
  this.assets;
  this.LUTLibraries;
  this.renderers;
  this.solarSystem;
  this.webAssemblyWorker;
  this.webAssembly;
  this.renderers;

  window.addEventListener('DOMContentLoaded', function(){
    //Grab all of our assets
    let assetLoader = new StarrySky.AssetLoader(this);

  });
  window.addEventListener('starry-sky-assets-loaded', function(){
    //Initialize all of our LUT Libraries

    //Prepare web workers to perform claculations

    //Prepare all of our renderers to display stuff

    //Update our tick and tock functions
    parentComponent.tick = function(){

    }
    parentComponent.tock = function(){

    }
    parentComponent.skyEngine = self;
  });
}
