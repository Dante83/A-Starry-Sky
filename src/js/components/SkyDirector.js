StarrySky.SkyDirector = function(parentComponent){
  this.parentComponent = parentComponent;
  this.renderer = self.el.sceneEl.renderer;
  this.scene = self.el.sceneEl.object3D;
  //
  //TODO: Come back here and grab the camera. This is important for attaching child objects in our sky
  //that will follow this object around.
  //
  // this.camera = self.el.sceneEl.camera;
  this.data;
  this.assets;
  this.LUTLibraries;
  this.renderers;
  this.solarSystem;
  this.webAssemblyWorker = new Worker("../src/cpp/starry-sky-web-worker.js", { type: "module" });
  this.webAssembly;
  this.renderers = {
    atmosphereRenderer: new StarrySky.Renderers.AtmosphereRenderer(this)
  };

  let self = this;
  window.addEventListener('DOMContentLoaded', function(){
    //Grab all of our assets
    let assetLoader = new StarrySky.AssetLoader(self);
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
  window.addEventListener( 'resize', function(){
    //Update each of our renderers

  }, false );
}

StarrySky.Initialization.prototype.EVENT_INITIALIZE = 0;
StarrySky.Initialization.prototype.EVENT_UPDATE = 1;
StarrySky.Initialization.prototype.initializeSkyWorker = function(){
  let self = this;

  //Initialize the state of our sky
  this.webAssemblyWorker.postMessage({
    eventType: self.EVENT_INITIALIZE,
    latitude: self.latitude,
    longitude: self.longitude,
    date: self.date,
    timeMultiplier: self.timeMultiplier,
    utcOffset: self.utcOffset
  });
};

StarrySky.Initialization.prototype.requestSkyUpdate = function(){
  let self = this;

  //Initialize the state of our sky
  this.webAssemblyWorker.postMessage({
    eventType: self.UPDATE,
    date: self.date
  });
};
