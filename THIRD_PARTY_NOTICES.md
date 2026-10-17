# Third Party Notices

A-Starry-Sky is MIT licensed (see [LICENSE.md](LICENSE.md)). It stands on the work of others, and this file credits the code, data and ideas it uses. Licences below are as we understand them -- please check each upstream project for the authoritative text.

## Code and constants

| Project | Used for | Licence |
|:---|:---|:---|
| [three-geospatial](https://github.com/takram-design-engineering/three-geospatial) (takram design engineering), `three-clouds` | The cloud recipe: noise baking, density and detail constants, two-lobe phase function, multiple scattering octaves | MIT |
| [superframe `sun-sky`](https://github.com/supermedium/superframe/blob/master/components/sun-sky/shaders/fragment.glsl) (Supermedium) | The basis of the sun shader | MIT |
| [CosmoScout VR](https://github.com/cosmoscout/cosmoscout-vr) | `earthShadow.tif`, the eclipse shadow LuT, repackaged as `eclipse-shadow-lut.webp` | MIT code, CC0 texture |
| [ETEngine](https://github.com/Illation/ETEngine) (Illation) | Atmosphere helper functions | MIT |
| [Khronos PBR Neutral tone mapper](https://github.com/KhronosGroup/ToneMapping/tree/main/PBR_Neutral) | The sky's tone mapping, also used in the fog | Apache-2.0 |
| [A minimal AgX implementation](https://iolite-engine.com/blog_posts/minimal_agx_implementation) (iolite) | The optional AgX tone mapper | See the source |
| [three.js](https://threejs.org/) | `Sky.js` as the basis of the advanced atmospheric perspective, and the bloom post processing pipeline | MIT |

## Data and assets

* Blue noise textures by [Christoph Peters, Moments in Graphics](http://momentsingraphics.de/BlueNoise.html) (CC0).
* Solar corona texture by [Carla Thomas / NASA](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* [Water caustics texture](https://opengameart.org/content/water-caustics-effect-small) by leeor_net, reused for the aurora.
* Milky Way maps are generated with [galpy](https://github.com/jobovy/galpy) (BSD-3-Clause) and the dust reddening map of [Schlegel, Finkbeiner & Davis (1998)](https://doi.org/10.1086/305772).

## Ideas and papers

Andrew Schneider and Nathan Vos (*The Real-time Volumetric Cloudscapes of Horizon Zero Dawn*), Sébastien Hillaire (*Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite*), Oskar Elek's sky model, Schneegans et al. (2025, *Physically Based Real-Time Rendering of Eclipses*), Hestroffer & Magnan (1998) on limb darkening, and the Skybolt cloud coverage profile. These are techniques described in talks and papers; no code is taken from them.
