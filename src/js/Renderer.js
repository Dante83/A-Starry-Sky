StarrySky.Renderer = function(data, skyLoader, interpolator){
  this.data = data;
  this.webGLRenderer = skyLoader.starrySkyComponent.renderer;
  this.skyLoader = skyLoader;
  this.interpolator = interpolator;

  let self = this;
  intializer.skyWorker.addEventListener('message', function(e){
    if(true){
      //This is an initialization response. Set up our interpolator with beginning and ending values.

    }
    else{
      //This is an update response. Update the interpolator with a new endpoint, and use the current
      //position as the starting point.
    }
  });

  this.tick = function(time){
    //Update our shaders

  }

  this.tock = function(time){
    //Check if we need to update our

  }
};
