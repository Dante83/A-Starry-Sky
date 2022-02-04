import OctahedronBufferGeometry, Mesh, BackSide, NormalBlending from "THREE";
import AtmosphereShader from '../materials/atmosphere/AtmosphereShader.js'
import MieDirectionalG, DegreesToRadians from '../Constants.js'

export default class AtmosphereRenderer{
  constructor(skyDirector){
    this.skyDirector = skyDirector;
    this.geometry = new OctahedronBufferGeometry(5000.0, 5);

    //Create our material late
    const atmosphereShader = AtmosphereShader();
    this.atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms())),
      side: BackSide,
      blending: NormalBlending,
      transparent: false,
      flatShading: true,
      vertexShader: atmosphereShader.vertexShader,
      fragmentShader: atmosphereShader.fragmentShader(MieDirectionalG)
    });
    const atmosphereLUTLibrary = skyDirector.atmosphereLUTLibrary;
    const atmosphericMaterialUniforms = this.atmosphereMaterial.uniforms;
    atmosphericMaterialUniforms.rayleighInscatteringSum.value = atmosphereLUTLibrary.rayleighScatteringSum;
    atmosphericMaterialUniforms.mieInscatteringSum.value = atmosphereLUTLibrary.mieScatteringSum;
    atmosphericMaterialUniforms.transmittance.value = atmosphereLUTLibrary.transmittance;

    if(this.skyDirector.assetManager.hasLoadedImages){
      atmosphericMaterialUniforms.starColorMap.value = this.skyDirector.assetManager.images.starImages.starColorMap;
    }

    //Attach the material to our geometry
    this.skyMesh = new Mesh(this.geometry, this.atmosphereMaterial);
    this.skyMesh.castShadow = false;
    this.skyMesh.receiveShadow = false;
    this.skyMesh.fog = false;
  }

  tick(t){
    const skyDirector = this.skyDirector;
    this.skyMesh.position.copy(skyDirector.camera.position.cameraWorldPosition);

    //Update the uniforms so that we can see where we are on this sky.
    const atmosphereMaterialUniforms = this.atmosphereMaterial.uniforms;
    const skyState = skyDirector.skyState;
    atmosphereMaterialUniforms.sunHorizonFade.value = skyState.sun.horizonFade;
    atmosphereMaterialUniforms.moonHorizonFade.value = skyState.moon.horizonFade;
    atmosphereMaterialUniforms.uTime.value = t;
    atmosphereMaterialUniforms.localSiderealTime.value = skyState.LSRT;
    atmosphereMaterialUniforms.starsExposure.value = skyDirector.exposureVariables.starsExposure;
    atmosphereMaterialUniforms.scatteringSunIntensity.value = skyState.sun.intensity;
    atmosphereMaterialUniforms.scatteringMoonIntensity.value = skyState.moon.intensity;

    const blueNoiseTextureRef = skyDirector.assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];
    atmosphereMaterialUniforms.blueNoiseTexture.value = blueNoiseTextureRef;
  }

  firstTick(t){
    const skyDirector = this.skyDirector;

    //Connect up our reference values
    const atmosphereMaterialUniforms = this.atmosphereMaterial.uniforms;
    const skyState = skyDirector.skyState;
    atmosphereMaterialUniforms.sunPosition.value = skyState.sun.position;
    atmosphereMaterialUniforms.moonPosition.value = skyState.moon.position;
    atmosphereMaterialUniforms.latitude.value = skyDirector.assetManager.data.skyLocationData.latitude * DegreesToRadians;

    atmosphereMaterialUniforms.mercuryPosition.value = skyState.mercury.position;
    atmosphereMaterialUniforms.venusPosition.value = skyState.venus.position;
    atmosphereMaterialUniforms.marsPosition.value = skyState.mars.position;
    atmosphereMaterialUniforms.jupiterPosition.value = skyState.jupiter.position;
    atmosphereMaterialUniforms.saturnPosition.value = skyState.saturn.position;

    atmosphereMaterialUniforms.mercuryBrightness.value = skyState.mercury.intensity;
    atmosphereMaterialUniforms.venusBrightness.value = skyState.venus.intensity;
    atmosphereMaterialUniforms.marsBrightness.value = skyState.mars.intensity;
    atmosphereMaterialUniforms.jupiterBrightness.value = skyState.jupiter.intensity;
    atmosphereMaterialUniforms.saturnBrightness.value = skyState.saturn.intensity;
    atmosphereMaterialUniforms.moonLightColor.value = skyState.moon.lightingModifier;

    //Connect up our images if they don't exist yet
    if(skyDirector.assetManager){
      atmosphereMaterialUniforms.starHashCubemap.value = skyDirector.assetManager.images.starImages.starHashCubemap;
      atmosphereMaterialUniforms.dimStarData.value = skyDirector.stellarLUTLibrary.dimStarDataMap;
      atmosphereMaterialUniforms.medStarData.value = skyDirector.stellarLUTLibrary.medStarDataMap;
      atmosphereMaterialUniforms.brightStarData.value = skyDirector.stellarLUTLibrary.brightStarDataMap;
    }

    //Proceed with the first tick
    this.tick(t);

    //Add this object to the scene
    skyDirector.scene.add(this.skyMesh);
  }
}
