function StarrySkyEngine(starrySkyComponent){
  //------------------------
  //Capture all the information from our child elements for our usage here.
  //------------------------
  //Location
  this.latitude;
  this.longitude;

  //Time
  this.date;
  this.utcOffset;
  this.timeMultiplier;

  //Sky Parameters
  this.luminance;
  this.mieCoefficient;
  this.mieDirectionalG;
  this.reileigh;
  this.turbidity;

  //Asset Locations
  this.moonImgSrc;
  this.moonNormalSrc;

  //------------------------
  //Initialize the state of our sky
  //------------------------

  //------------------------
  //Load our moon images
  //------------------------

  //------------------------
  //Load our the star location data binary blob
  //------------------------

  //------------------------
  //Construct our atmosphere dome
  //------------------------

  //------------------------
  //Construct our star dome
  //------------------------

  //------------------------
  //Construct our astronomical body particles, moon, sun, planets
  //------------------------

  //
  //NOTE: We may want to move this over to web assembly functions
  //
  this.tick = function(){
    //Check if any of our sky variables need updating and if so, grab them on a new web worker

    //Else run our SLERPs for each of our planetary bodies and the star dome

    //Construct color intensities

    //Construct masks

  }

  this.tock = function(){
    //Implement bloom

    //Implement god rays

    //Convert from HDR image to RGB image and merge

    //Draw this as the background texture for our screen.

  }
};
