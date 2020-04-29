//This is so super derivative of the UnrealBloom Pass in Three.JS
//Thanks spidersharma / http://eduperiment.com/, kupo!
//That it practically breaks calculus :D :D :D
//But - hey, it's integral to the objectives I'm trying to achieve with all these
//blooming glow effects. GLOW ALL TEH THINGS!
//Note, bloom radius is applied at the end, when combining our bloom with the original image
StarrySky.Renderers.BloomRenderer = function(skyDirector, targetName, threshold){
  this.strength = strength;
  this.radius = radius;
  this.threshold = threshold;
  this.renderer = skyDirector.renderer
  this.seperableBlurHorizontalRenderers = [];
  this.seperableBlurHorizontalTextures = [];
  this.seperableBlurVerticalRenderers = [];
  this.seperableBlurVerticalTextures = [];
  this.seperableBlurHorizontalVars = [];
  this.seperableBlurVerticalVars = [];
  let materials = StarrySky.Materials.Postprocessing;
  const blurDirectionX = new THREE.Vector2(1.0, 0.0);
  const blurDirectionY = new THREE.Vector2(0.0, 1.0);
  const textureSize = 512;

  this.highPassRenderer = new THREE.GPUComputationRenderer(textureSize, textureSize, this.renderer);

  //Set up our transmittance texture
  this.highPassFilterTexture = this.highPassRenderer.createTexture();
  this.highPassFilterVar = this.highPassRenderer.addVariable(`${targetName}.highPassFilter`,
    materials.Postprocessing.highPassFilter.fragmentShader,
    this.highPassFilterTexture
  );
  this.highPassRenderer.setVariableDependencies(this.highPassFilterVar, []);
  this.highPassFilterVar.material.uniforms = JSON.parse(JSON.stringify(materials.Postprocessing.uniforms));
  this.highPassFilterVar.material.uniforms.luminosityThreshold.value = this.threshold;
  this.highPassFilterVar.material.uniforms.luminosityThreshold.needsUpdate = true;
  this.highPassFilterVar.minFilter = THREE.LinearFilter;
  this.highPassFilterVar.magFilter = THREE.LinearFilter;

  //Check for any errors in initialization
  let error1 = this.highPassRenderer.init();
  if(error1 !== null){
    console.error(`High Pass Renderer: ${error1}`);
  }

  let mipSize = textureSize * 0.5;
  let kernalRadius = 3;
  for(let i = 0; i < 5; ++i){
    this.seperableBlurHorizontalRenderers.push(new THREE.GPUComputationRenderer(mipSize, mipSize, this.renderer));

    this.seperableBlurHorizontalTextures.push(this.seperableBlurHorizontalRenderers[i].createTexture());
    this.seperableBlurHorizontalVars.push(this.seperableBlurHorizontalRenderers[i].addVariable(`${targetName}.seperableHorizontalBlur.${i}`,
      materials.Postprocessing.highPassFilter.fragmentShader(kernalRadius, mipSize),
      this.seperableBlurHorizontalTextures[i]
    ));
    this.seperableBlurHorizontalRenderers[i].setVariableDependencies(this.seperableBlurHorizontalVars[i], []);
    this.seperableBlurHorizontalVars[i].material.uniforms = JSON.parse(JSON.stringify(materials.Postprocessing.uniforms));
    this.seperableBlurHorizontalVars[i].material.uniforms.direction.value = blurDirectionX;
    this.seperableBlurHorizontalVars[i].material.uniforms.direction.needsUpdate = true;
    this.seperableBlurHorizontalVars[i].minFilter = THREE.LinearFilter;
    this.seperableBlurHorizontalVars[i].magFilter = THREE.LinearFilter;

    let error2 = this.seperableBlurHorizontalRenderers[i].init();
    if(error2 !== null){
      console.error(`Blur Horizontal Renderer ${i}: ${error2}`);
    }

    this.seperableBlurVerticalTextures.push(this.seperableBlurVerticalRenderers[i].createTexture());
    this.seperableBlurVerticalVars.push(this.seperableBlurVerticalRenderers[i].addVariable(`${targetName}.seperableVerticalBlur.${i}`,
      materials.Postprocessing.highPassFilter.fragmentShader(kernalRadius, mipSize),
      this.seperableBlurVerticalTextures[i]
    ));
    this.seperableBlurVerticalRenderers[i].setVariableDependencies(this.seperableBlurVerticalVars[i], []);
    this.seperableBlurVerticalVars[i].material.uniforms = JSON.parse(JSON.stringify(materials.Postprocessing.uniforms));
    this.seperableBlurVerticalVars[i].material.uniforms.direction.value = blurDirectionY;
    this.seperableBlurVerticalVars[i].material.uniforms.direction.needsUpdate = true;
    this.seperableBlurVerticalVars[i].minFilter = THREE.LinearFilter;
    this.seperableBlurVerticalVars[i].magFilter = THREE.LinearFilter;

    let error3 = this.seperableBlurVerticalRenderers[i].init();
    if(error3 !== null){
      console.error(`Blur Vertical Renderer ${i}: ${error3}`);
    }

    kernalRadius += 2;
    mipSize *= 0.5;
  }

  let self = this;
  this.setThreshold = function(threshold){
    self.highPassFilterVar.material.uniforms.luminosityThreshold.value = self.threshold;
    self.highPassFilterVar.material.uniforms.luminosityThreshold.needsUpdate = true;
  }

  this.render = function(inTexture){
    //Get our high pass filter of the injected texture
    self.highPassFilterVar.material.uniforms.sourceTexture.value = inTexture;
    self.highPassFilterVar.material.uniforms.sourceTexture.needsUpdate = true;
    self.highPassRenderer.compute();
    let highPassTexture = self.highPassRenderer.getCurrentRenderTarget(self.highPassFilterVar).texture;

    //Pass this into our blur filter create our various levels of bloom
    let bloomTextures = [];
    for(let i = 0; i < 5; ++i){
      self.seperableBlurHorizontalVars[i].material.uniforms.sourceTexture.value = highPassTexture;
      self.seperableBlurHorizontalVars[i].material.uniforms.sourceTexture.needsUpdate = true;
      self.seperableBlurHorizontalRenderers[i].compute();
      let horizontalTexture = self.seperableBlurHorizontalRenderers[i].getCurrentRenderTarget(self.seperableBlurHorizontalVars[i]).texture;

      self.seperableBlurVerticalVars[i].material.uniforms.sourceTexture.value = horizontalTexture;
      self.seperableBlurVerticalVars[i].material.uniforms.sourceTexture.needsUpdate = true;
      self.seperableBlurVerticalRenderers[i].compute();
      bloomTextures.push(self.seperableBlurVerticalRenderers[i].getCurrentRenderTarget(self.seperableBlurVerticalVars[i]).texture);
    }

    return bloomTextures;
  }
}