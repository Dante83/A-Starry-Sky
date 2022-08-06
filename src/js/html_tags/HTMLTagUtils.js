//A collection of utilities for creating our custom HTML tags
StarrySky.HTMLTagUtils = {};

StarrySky.HTMLTagUtils.clampAndWarn = function(inValue, minValue, maxValue, tagName){
  const result = Math.min(Math.max(inValue, minValue), maxValue);
  if(inValue > maxValue){
    console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a max value of ${maxValue} and a minimum value of ${minValue}.`);
  }
  else if(inValue < minValue){
    console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a minmum value of ${minValue} and a minimum value of ${minValue}.`);
  }
  return result;
};
