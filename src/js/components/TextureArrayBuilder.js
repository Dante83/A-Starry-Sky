//Collapses a family of same-shape textures into a single sampler2DArray, so that
//N texture units become 1. WebGL2 only guarantees MAX_TEXTURE_IMAGE_UNITS >= 16 and
//our moon pass was asking for 19, which does not link at all on such a device -- there
//is no degraded path, the program simply fails.
//
//Every family is built the same way: render each member into one layer of a
//WebGLArrayRenderTarget. We deliberately avoid composing arrays on the CPU through a
//2D canvas, because getImageData round-trips through premultiplied alpha and the lunar
//diffuse map's alpha channel is the moon's occlusion mask. A GPU blit is exact, and it
//is the same code path a render-target family (our star data LUTs) needs anyway.
//
//Layers may be smaller than the array. A smaller member is rendered at its native size
//into the bottom-left corner of its layer via the viewport, so the member's own shader
//keeps seeing the resolution it was written for. Consumers must then read the array with
//texelFetch and integer indices rather than normalized UVs, since the unused remainder of
//the layer would otherwise be inside the [0, 1] range.
StarrySky.TextureArrayBuilder = (function(){
  //One quad, one camera, one scene, shared by every build. THREE.Camera has identity
  //matrices, so the vertex shader below can write clip space directly.
  let scene = null;
  let camera = null;
  let mesh = null;
  let copyMaterial = null;

  const vertexShader = [
    'void main(){',
    '  gl_Position = vec4(position, 1.0);',
    '}'
  ].join('\n');

  //A 1:1 blit. The source is bound with NearestFilter by the caller, so each destination
  //texel takes exactly one source texel and an 8 bit source round-trips byte-exact
  //through an 8 bit destination.
  const copyFragmentShader = [
    'precision highp float;',
    'uniform sampler2D sourceTexture;',
    'void main(){',
    '  gl_FragColor = texture(sourceTexture, gl_FragCoord.xy / resolution.xy);',
    '}'
  ].join('\n');

  const lazyInitialize = function(){
    if(scene !== null){
      return;
    }
    scene = new THREE.Scene();
    camera = new THREE.Camera();
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    mesh.frustumCulled = false;
    scene.add(mesh);

    copyMaterial = new THREE.ShaderMaterial({
      uniforms: {sourceTexture: {value: null}},
      vertexShader: vertexShader,
      fragmentShader: copyFragmentShader,
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false
    });
  };

  return {
    vertexShader: vertexShader,

    //Materials handed to renderLayer must use this vertex shader and must read their
    //destination size from the `resolution` define, exactly as the GPGPU bakes do.
    createMaterial: function(fragmentShader, uniforms){
      lazyInitialize();
      return new THREE.ShaderMaterial({
        uniforms: uniforms === undefined ? {} : uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        blending: THREE.NoBlending,
        depthTest: false,
        depthWrite: false
      });
    },

    build: function(options){
      const renderTarget = new THREE.WebGLArrayRenderTarget(options.width, options.height, options.layers, {
        wrapS: options.wrapS === undefined ? THREE.ClampToEdgeWrapping : options.wrapS,
        wrapT: options.wrapT === undefined ? THREE.ClampToEdgeWrapping : options.wrapT,
        minFilter: options.minFilter === undefined ? THREE.NearestFilter : options.minFilter,
        magFilter: options.magFilter === undefined ? THREE.NearestFilter : options.magFilter,
        format: options.format === undefined ? THREE.RGBAFormat : options.format,
        type: options.type === undefined ? THREE.UnsignedByteType : options.type,
        colorSpace: options.colorSpace === undefined ? THREE.LinearSRGBColorSpace : options.colorSpace,
        anisotropy: options.anisotropy === undefined ? 1 : options.anisotropy,
        generateMipmaps: options.generateMipmaps === true,
        stencilBuffer: false,
        depthBuffer: false
      });

      //Older and newer three builds disagree about whether generateMipmaps survives the
      //options object, and it has to be true before the first setRenderTarget or the
      //texture gets allocated with a single mip level.
      renderTarget.texture.generateMipmaps = options.generateMipmaps === true;
      renderTarget.texture.anisotropy = options.anisotropy === undefined ? 1 : options.anisotropy;

      return renderTarget;
    },

    //Draws one member into `layerIndex`. `width` and `height` default to the full layer;
    //pass smaller values for a member that only occupies a corner of it.
    renderLayer: function(renderer, arrayRenderTarget, layerIndex, material, width, height){
      lazyInitialize();

      const layerWidth = width === undefined ? arrayRenderTarget.width : width;
      const layerHeight = height === undefined ? arrayRenderTarget.height : height;

      //The member's shader reads its own size from `resolution`, so it has to describe the
      //viewport we are about to set, not the array. A define only reaches the program
      //through a recompile, so one material shared across differently sized layers has to
      //ask for one -- but only when the value actually moved.
      if(material.defines === undefined){
        material.defines = {};
      }
      const resolutionDefine = 'vec2( ' + layerWidth.toFixed(1) + ', ' + layerHeight.toFixed(1) + ' )';
      if(material.defines.resolution !== resolutionDefine){
        material.defines.resolution = resolutionDefine;
        material.needsUpdate = true;
      }

      const previousRenderTarget = renderer.getRenderTarget();
      const previousActiveCubeFace = renderer.getActiveCubeFace();
      const previousActiveMipmapLevel = renderer.getActiveMipmapLevel();
      const previousAutoClear = renderer.autoClear;
      const previousXrEnabled = renderer.xr.enabled;
      const previousShadowAutoUpdate = renderer.shadowMap.autoUpdate;

      renderer.xr.enabled = false;
      renderer.shadowMap.autoUpdate = false;
      //Nothing outside the viewport is ever read, and clearing would only cost us a
      //full-layer wipe per member.
      renderer.autoClear = false;

      mesh.material = material;
      //The viewport rides on the render target, NOT on renderer.setViewport. A bound
      //target takes its viewport from renderTarget.viewport, and that path is not scaled
      //by the device pixel ratio -- setViewport is, so on a retina display it would blow a
      //32x32 member up to 64x64. Binding the target also restores the scissor state from
      //the target itself, so a scissor rect A-Frame left behind cannot clip the blit.
      arrayRenderTarget.viewport.set(0, 0, layerWidth, layerHeight);
      renderer.setRenderTarget(arrayRenderTarget, layerIndex);
      renderer.render(scene, camera);

      //Hand the quad back a real material: a null one would throw if anything else ever
      //walked this scene.
      mesh.material = copyMaterial;
      renderer.autoClear = previousAutoClear;
      renderer.xr.enabled = previousXrEnabled;
      renderer.shadowMap.autoUpdate = previousShadowAutoUpdate;
      renderer.setRenderTarget(previousRenderTarget, previousActiveCubeFace, previousActiveMipmapLevel);
    },

    //Convenience wrapper for an image-backed family: blit each loaded texture into its
    //own layer. The sources are left untouched, so the caller can dispose them.
    copyTextureToLayer: function(renderer, arrayRenderTarget, layerIndex, sourceTexture, width, height){
      lazyInitialize();
      copyMaterial.uniforms.sourceTexture.value = sourceTexture;
      this.renderLayer(renderer, arrayRenderTarget, layerIndex, copyMaterial, width, height);
      copyMaterial.uniforms.sourceTexture.value = null;
    },

    //Call after the last layer is written, and use the texture it hands back.
    //
    //Mipmaps need no help from us: three ends every render() by calling
    //updateRenderTargetMipmap on the bound target, and that resolves its texture target
    //through getTargetType, which answers TEXTURE_2D_ARRAY for an array render target.
    //So each layer render regenerates the whole chain from every layer's level zero, and
    //the pass that follows the last layer is the one that ends up on screen.
    finalize: function(renderer, arrayRenderTarget){
      return arrayRenderTarget.texture;
    }
  };
})();
