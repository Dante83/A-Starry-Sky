//Create primitive data associated with this, based off a-sky
//https://github.com/aframevr/aframe/blob/master/src/extras/primitives/primitives/a-sky.js
AFRAME.registerPrimitive('a-starry-sky', AFRAME.utils.extendDeep({}, AFRAME.primitives.getMeshMixin(), {
  // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
  defaultComponents: {
    skyengine: {}
  }
}));
