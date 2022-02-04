import Scene, Camera, MeshBasicMaterial, PlaneBufferGeometry, Mesh, BufferGeometryUtils from 'THREE';

export default class LUTScene {
  constructor(renderer){
    this.renderer = renderer;
    this.scene = new Scene();
    this.camera = new Camera();
    this.camera.z = 1;

    const basicMaterial = new MeshBasicMaterial({color: 0xffff00, side: FrontSide});
    let planeGeometry = new PlaneBufferGeometry(2, 2);
  	this.mesh = new Mesh(planeGeometry, basicMaterial);
    BufferGeometryUtils.computeTangents(planeGeometry);
  	this.scene.add(this.mesh);
  }

  setShaderMaterial(material){
    this.mesh.material = material;
  }

  renderTo(renderTarget){
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
};
