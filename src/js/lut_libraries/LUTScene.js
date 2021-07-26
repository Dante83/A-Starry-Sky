StarrySky.LUTlibraries.LUTScene = class LUTScene{
  constructor(renderer){
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    this.camera.z = 1;

    const basicMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.FrontSide});
    let planeGeometry = new THREE.PlaneBufferGeometry(2, 2);
  	this.mesh = new THREE.Mesh(planeGeometry, basicMaterial);
    THREE.BufferGeometryUtils.computeTangents(planeGeometry);
  	this.scene.add(this.mesh);
  }

  function setShaderMaterial(material){
    this.mesh = material;
  }

  function renderTo(renderTarget){
  		mesh.material = material;

  		//Using guidance from https://github.com/mrdoob/three.js/issues/18746#issuecomment-591441598
  		let xrEnabled = this.renderer.xr.enabled;
  		let shadowMapAutoUpdates = this.renderer.shadowMap.autoUpdate;

  		this.renderer.xr.enabled = false;
  		this.renderer.shadowMap.autoUpdate = false;

  		this.renderer.setRenderTarget(output);
  		this.renderer.clear();

      renderer.render(scene, camera);

  		renderer.xr.enabled = xrEnabled;
  		renderer.shadowMap.autoUpdate = shadowMapAutoUpdates;
  }
}
