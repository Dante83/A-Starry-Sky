//This is so super derivative of the UnrealBloom Pass in Three.JS
//Thanks spidersharma / http://eduperiment.com/, kupo!
//That it practically breaks calculus :D :D :D
//But - hey, it's integral to the objectives I'm trying to achieve with all these
//blooming glow effects. GLOW ALL TEH THINGS!
//Note, bloom radius is applied at the end, when combining our bloom with the original image
export default class BloomRenderer{
  constructor(skyDirector, targetName, threshold){
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
    let mipSizes = [265, 128, 64, 32, 16];
    let baseSize = skyDirector.moonAndSunRendererSize;
    for(let i = 0; i < 5; ++i){
      baseSize = baseSize >> 1; //Divide by two
      mipSizes[i] = baseSize;
    }
    const kernelSizeArray = [3, 5, 7, 9, 11];

    this.highPassRenderer = new THREE.StarrySkyComputationRenderer(1024, 1024, this.renderer);

    //Set up our transmittance texture
    this.highPassFilterTexture = this.highPassRenderer.createTexture();
    this.highPassFilterVar = this.highPassRenderer.addVariable(`${targetName}.highPassFilter`,
      materials.highPassFilter.fragmentShader,
      this.highPassFilterTexture
    );
    this.highPassRenderer.setVariableDependencies(this.highPassFilterVar, []);
    this.highPassFilterVar.material.uniforms = JSON.parse(JSON.stringify(materials.highPassFilter.uniforms));
    this.highPassFilterVar.material.uniforms.luminosityThreshold.value = this.threshold;
    this.highPassFilterVar.minFilter = THREE.LinearFilter;
    this.highPassFilterVar.magFilter = THREE.LinearFilter;
    this.highPassFilterVar.wrapS = THREE.ClampToEdgeWrapping;
    this.highPassFilterVar.wrapT = THREE.ClampToEdgeWrapping;

    //Check for any errors in initialization
    let error1 = this.highPassRenderer.init();
    if(error1 !== null){
      console.error(`High Pass Renderer: ${error1}`);
    }

    let kernalRadius = 3;
    for(let i = 0; i < 5; ++i){
      let mipSize = mipSizes[i];
      let kernalSize = kernelSizeArray[i];
      this.seperableBlurHorizontalRenderers.push(new THREE.StarrySkyComputationRenderer(mipSize, mipSize, this.renderer));
      this.seperableBlurHorizontalTextures.push(this.seperableBlurHorizontalRenderers[i].createTexture());
      this.seperableBlurHorizontalVars.push(this.seperableBlurHorizontalRenderers[i].addVariable(`${targetName}.seperableHorizontalBlur.${i}`,
        materials.seperableBlurFilter.fragmentShader(kernalSize, mipSize),
        this.seperableBlurHorizontalTextures[i]
      ));
      this.seperableBlurHorizontalRenderers[i].setVariableDependencies(this.seperableBlurHorizontalVars[i], []);
      this.seperableBlurHorizontalVars[i].material.uniforms = JSON.parse(JSON.stringify(materials.seperableBlurFilter.uniforms));
      this.seperableBlurHorizontalVars[i].material.uniforms.direction.value = blurDirectionX;
      this.seperableBlurHorizontalVars[i].minFilter = THREE.LinearFilter;
      this.seperableBlurHorizontalVars[i].magFilter = THREE.LinearMipmapLinear;
      this.seperableBlurHorizontalVars[i].wrapS = THREE.ClampToEdgeWrapping;
      this.seperableBlurHorizontalVars[i].wrapT = THREE.ClampToEdgeWrapping;

      let error2 = this.seperableBlurHorizontalRenderers[i].init();
      if(error2 !== null){
        console.error(`Blur Horizontal Renderer ${i}: ${error2}`);
      }

      this.seperableBlurVerticalRenderers.push(new THREE.StarrySkyComputationRenderer(mipSize, mipSize, this.renderer));
      this.seperableBlurVerticalTextures.push(this.seperableBlurVerticalRenderers[i].createTexture());
      this.seperableBlurVerticalVars.push(this.seperableBlurVerticalRenderers[i].addVariable(`${targetName}.seperableVerticalBlur.${i}`,
        materials.seperableBlurFilter.fragmentShader(kernalSize, mipSize),
        this.seperableBlurVerticalTextures[i]
      ));
      this.seperableBlurVerticalRenderers[i].setVariableDependencies(this.seperableBlurVerticalVars[i], []);
      this.seperableBlurVerticalVars[i].material.uniforms = JSON.parse(JSON.stringify(materials.seperableBlurFilter.uniforms));
      this.seperableBlurVerticalVars[i].material.uniforms.direction.value = blurDirectionY;
      this.seperableBlurVerticalVars[i].minFilter = THREE.LinearFilter;
      this.seperableBlurVerticalVars[i].magFilter = THREE.LinearFilter;
      this.seperableBlurVerticalVars[i].wrapS = THREE.ClampToEdgeWrapping;
      this.seperableBlurVerticalVars[i].wrapT = THREE.ClampToEdgeWrapping;

      let error3 = this.seperableBlurVerticalRenderers[i].init();
      if(error3 !== null){
        console.error(`Blur Vertical Renderer ${i}: ${error3}`);
      }

      kernalRadius += 2;
    }
  }

  setThreshold(threshhold){
    this.highPassFilterVar.material.uniforms.luminosityThreshold.value = this.threshold;
  }

  render(inTexture){
    //Get our high pass filter of the injected texture
    self.highPassFilterVar.material.uniforms.sourceTexture.value = inTexture;
    self.highPassFilterVar.material.uniforms.sourceTexture.needsUpdate = true;
    self.highPassRenderer.compute();
    let previousPass = self.highPassRenderer.getCurrentRenderTarget(self.highPassFilterVar).texture;

    //Pass this into our blur filter create our various levels of bloom
    let bloomTextures = [];
    for(let i = 0; i < 5; ++i){
      self.seperableBlurHorizontalVars[i].material.uniforms.sourceTexture.value = previousPass;
      self.seperableBlurHorizontalVars[i].material.uniforms.sourceTexture.needsUpdate = true;
      self.seperableBlurHorizontalRenderers[i].compute();
      let horizontalTexture = self.seperableBlurHorizontalRenderers[i].getCurrentRenderTarget(self.seperableBlurHorizontalVars[i]).texture;

      self.seperableBlurVerticalVars[i].material.uniforms.sourceTexture.value = horizontalTexture;
      self.seperableBlurVerticalVars[i].material.uniforms.sourceTexture.needsUpdate = true;
      self.seperableBlurVerticalRenderers[i].compute();
      bloomTextures.push(self.seperableBlurVerticalRenderers[i].getCurrentRenderTarget(self.seperableBlurVerticalVars[i]).texture);

      previousPass = bloomTextures[i];
    }

    return bloomTextures;
  }
}
