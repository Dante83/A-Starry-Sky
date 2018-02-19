aDynamicSky.imageUtils = {
  sendDataAsGLTexture(data){
    var arrayLength = data.length;
    var typedData = new Float32Array(data.length);
    for(var i = 0; i < arrayLength; i++){
      if(typeof(data) == 'number'){
        typedData[i] = data[i];
      }
      else{
        console.log("The value in this data set at element " + i + ", is not a number and hence not convertible to type 32f");
      }
    }

    //Cool this is neat, but how do we get it and how do we use it?
    void gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, arrayLength, 1, 0, gl.R32F, gl.FLOAT, ArrayBufferView typedData, 0);
  }
}
