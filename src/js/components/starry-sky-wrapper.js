import DefaultData from '../DefaultData.js'
import {SkyDirector} from "./SkyDirector.js";
import registerComponent from 'AFRAME';

Aframe.registerComponent('starryskywrapper', {
  defaultValues: DefaultData,
  skyDirector: null,
  initialized: false,
  init: function(){
    this.skyDirector = new SkyDirector(this, this.el.getAttribute('web-worker-src'));
  },
  tick: function(time, timeDelta){
    /*Do Nothing*/
  }
});
