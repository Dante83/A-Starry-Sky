**Version 1.3.0**
* Added the **Milky Way**, drawn from two equirectangular galactic-coordinate maps: emission from galpy's `MWPotential2014` stellar density integrated along each line of sight, and dust extinction from [Schlegel, Finkbeiner & Davis (1998)](https://doi.org/10.1086/305772) applied per channel, so the lanes warm rather than merely darken. On by default via a new `<sky-milky-way>` tag; both maps regenerate from `src/python/milky-way-mapper/`.
* Fixed stellar scintillation, which summed non-negative noise and so could only ever *brighten* a star — averaging 1.2 to 5 times its true value and never once dimming. The centred version is driven by real relative airmass and is near magnitude-independent, as the physics requires.
* Reworked star brightness. A star's point spread is no longer folded into the same square root as its magnitude compression, tightening each halo by 5 to 15 times without touching its peak. Sky washout is now logarithmic in sky brightness instead of linear in an sRGB-encoded radiance, so moonlight properly thins the faint field, and stars fade out entirely once the sun clears the horizon.

**Version 1.2.0**
* Upgraded from A-Frame 1.3.0 to **A-Frame 1.7.0** (Three.js r173).
* Fixed several atmospheric physics bugs: corrected Rayleigh phase function, missing Mie density weighting in transmittance, and a Rayleigh/Mie density swap in the scattering LUT bake passes — resulting in more accurate sky colors, particularly at sunset.
* Added a physically accurate ozone density profile peaking at 25 km altitude for deeper, more saturated twilight reds during civil and nautical twilight.
* Overhauled the sun bloom pipeline to operate in **HDR linear space**, giving the sun disk a much brighter and more physically distinct glow compared to the surrounding sky. Sun bloom threshold now scales with solar altitude for more natural horizon bloom.
* Significantly improved cloud rendering: replaced the old empirical approach with a physically correct Beer's-law volumetric integrand using the local cloud density at each ray step; added a dual-lobe Henyey-Greenstein phase function for realistic silver linings around backlit cloud edges; implemented Beer's-law-consistent cone shadowing with reduced-extinction multiple scattering for interior glow; and introduced a cloud-local horizon calculation so elevated clouds remain lit after the sun passes the world horizon.
* Fixed several aurora and fog bugs, including an incorrect light-direction coordinate swap in the atmospheric perspective shader that was placing the sun and moon 90° off in azimuth.
* Upgraded the *advanced* atmospheric fog to an Elek-consistent analytic model matching the sky LUT scattering coefficients, so fogged geometry and the sky agree at sunset and during twilight. Atmospheric fog density is now geometry-based (constant) rather than sky-brightness-modulated, eliminating unphysical fog pulsing with time of day.
* Added earthshine to the lunar shader, giving the dark side of crescent moons the characteristic blue-tinted glow — "the old moon in the new moon's arms."
* Fixed solar limb darkening to apply wavelength-dependent (chromatic) coefficients per Hestroffer & Magnan 1998, giving the sun's limb a visible reddish tint that complements atmospheric reddening at sunset. The limb darkening value was previously computed but never multiplied into the output color.
* Corrected the earth's shadow density formula to use proper geometric altitude rather than an approximate Y-coordinate proxy, producing smoother and physically correct belt-of-Venus transitions during twilight.
* Overhauled lunar eclipse rendering using a physically based Eclipse-Shadow LuT from [Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*](https://doi.org/10.1111/cgf.70017), repackaged from the CC0-licensed `earthShadow.tif` shipped with the authors' [CosmoScout VR](https://github.com/cosmoscout/cosmoscout-vr) (full extended-Bruneton multi-scattering + refraction + limb-view integration baked in). The LuT now drives the moon disk, halo, directional light, ground bounce, and per-channel SH ambient together with a temporally-jittered 16-frame EMA, with a perceptual gamma lift so the radiometrically-tiny umbra reads as blood-red rather than collapsing to black; non-eclipse full moons stay untinted. Configured via a new `<sky-eclipse-shadow-lut>` asset tag, default at `assets/lunar_eclipse/eclipse-shadow-lut.webp`, regeneratable from `src/python/eclipse-lut-baker/`.
* Replaced the per-frame ambient light metering survey with a precomputed sky-irradiance LUT, improving ambient lighting accuracy and eliminating the visible half-second ambient update cycle.
* Corrected stellar brightness to use the physically correct Pogson 100^(1/5) magnitude ratio (was 150^(1/5)), improving the relative brightness of bright versus dim stars.
* Improved the sun bloom halo: outer bloom mips now have a warm tint (progressing from white to orange) for a more natural solar corona appearance, and the Gaussian kernel sigma was corrected from `kernelRadius` to `kernelRadius / 2` for a properly spread bloom kernel.
* Fixed aurora blue-noise ray jitter, which was broken — the noise UV was computed in world-space (causing the jitter pattern to drift with camera movement) and the sample was subtracted by 1.0 (making offsets always negative, consistently shortening step sizes instead of randomizing them). Now uses screen-space UV with correct range, so the banding reduction claimed in v1.1.0 actually works.
* Fixed multiple JavaScript bugs around render target resolution, falsy-zero settings, atmospheric perspective parameters, and asset path handling.
* Halved the default ray-march step count for both clouds and aurora (64 → 32) for better out-of-the-box performance, with the option to increase via `<sky-cloud-raymarch-steps>` and `<sky-aurora-raymarch-steps>`.
* Updated clouds to use a more realistic atmospheric perspective that also fixes a bug with the earth's shadow appearing on the surface of clouds.
* Fixed a bug that blocked assets from loading the first time on occasion due to a race condition.

**Version 1.1.0**
* Added ray-marched clouds using 3D Simplex Noise combined with FBM worley noise, first contact transmittance/ambient lighting and Beer's Law/Henyay-Greenstein lighting. Based roughly around the ideas described in [Rendering volumetric clouds using signed distance fields](https://blog.uhawkvr.com/rendering/rendering-volumetric-clouds-using-signed-distance-fields/).
* Added support for ray-marched aurora borealis using blue noise ray-jittering to reduce banding effects as described in [Ray Marching Fog With Blue Noise](https://blog.demofox.org/2020/05/10/ray-marching-fog-with-blue-noise/) and using the caustic shader effect from [Believable Caustics Reflectionsv](https://www.alanzucconi.com/2019/09/13/believable-caustics-reflections/).
* Provide advanced atmospheric perspective using a modified Preetham model described via the code in [Three.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/Sky.js) as the basic source.
* Approximated the Earth's shadow and fixed some bugs in our sphere ray tracing methods.
* Swapped out emulated 3D textures for Web GL 2 3D textures.
* Fixed bug with lunar intensity and eliminated crusty moon edges by adding in mipmapping and increased anisotropic sampling.
* Swapped out the native bloom effect for Three.js's bloom postprocessing pipeline.
* Switch from gamma based correct to Linear-sRGB correction for lighting colors in shaders.
* Added support for changing the intensity of the sun, moon and ambient lighting intensities.
* Added the ability to change the bloom parameters for the sun and moon.
* Added the ability to change more atmospheric parameters, including starting camera height, sun intensity, moon intensity, mie beta, rayleigh beta, ozone beta, atmospheric height, radius of the planet, rayleigh scale height, mie scale height, ozone percent of rayleigh, number of lut raytrace steps and lut rotational ray trace steps.
* Fixed bug where sky, moon and sun would not track the camera position as it moved.
* Implemented support for a few basic getters and even a setter for very rudimentary programmatic API for the sky in the event that someone might want access to some of the values associated with the sky while being sure they are getting the objects associated with the sky itself. These include `getSunPosition()`, `getMoonPosition()`, `getSunRadius()`, `getMoonRadius()`, `getDominantLightColor()`, `getDominantLightIntensity()`, `getIsDominantLightSun()`, `getAmbientLights()`, `getActiveCamera()` and `setActiveCamera(camera)`. These functions can be accessed from the global namespace, `StarrySky.Methods`.

**Version 1.0.1**
* Fixed issues associated with build 137 of THREE which is found in A-Frame Version 1.3.0.

**Version 1.0.0**
* **!Important:** In version 1.0.0 and above, you must use a new XML based syntax to control the state of your sky. Variables have also changed to reflect updates to brand new engine architecture.
* Swapped out property based syntax with XML based value syntax with custom HTML components for a more organized developer experience.
* Completely updated code to a new architecture for better organization, improved rendering pipeline and to support new features like web assembly and compute shader programs.
* Moved from the analytical model, [A-Sun-Sky Project](https://github.com/ngokevin/kframe/tree/master/components/sun-sky) to a Look Up Table (LUT) approach by Oskar Elek, [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* for improved visualizations and performance.
* Converted all astronomical calculations to web assembly on a separate thread through web workers and moved primary calculations on the main thread to web assembly for reduce CPU load.
* Switched to procedurally generated sun disk with solar limb darkening, using the parameterization from [Joseph Bayley's Solar Limb Darkening](https://web.archive.org/web/20241213183923/https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf)
* Implemented  multi-pass bloom effect for the sun and moon.
* Moved normal mapping from fragment shader to vertex shader with improved diffuse and height maps from the [NASA CGI Moon Kit](https://svs.gsfc.nasa.gov/4720), with direct baking of the lunar normal map in Blender.
* Switched from a regular Lambertian shader to an [Oren Nayar Material](https://patapom.com/blog/BRDF/MSBRDFEnergyCompensation/#fn:4) driven by roughness data from [LOLA](https://sos.noaa.gov/datasets/moon-surface-roughness/).
* Added parallactic rotations for the moon.
* Implemented solar area lighting via [Christopher Oat and Pedro Sanders'](https://www.cse.ust.hk/~psander/docs/aperture.pdf) *Ambient Aperture Lighting* model for improved smooth shadows on lunar surface.
* Switched from PNG to WebP format where such files reduce file download times.
* Used nearest neighbor grouping to organize stars into two LUTs with x, y, z coordinates, driven by a bit-packed stellar lookup cubemap dramatically speeding up our stellar lighting calculations, while increasing the number of visible stars.
* Switched stellar color model from single highest intensity model to a full spectrum model driven by the python [Colour-Science Library](https://www.colour-science.org/).
* Switched from a position based fake HDR system to a periodic metering sky-survey based solution.
* Added VSOP87 Planet support for Mercury, Venus, Mars, Jupiter and Saturn using the terms from Appendix II of Meeus' Astronomical Algorithms with variable magnitudes.
* Implemented dynamic switching between sun and moon direct lighting to reduce overhead calculations and changed the lighting color method from an analytic solution to a transmittance LUT interpolated result with HSL based interpolation.
* Added support for dynamic, single-color, atmospheric perspective using the current sky lighting conditions and the camera vector with HSL based interpolation.
* Switched ambient lighting model with a 3 orthogonal axis hemispherical lighting model with support for a user defined ground color.
* Replaced Bayer Matrix dithering method with time dependent, tiling blue noise textures provided by [Moments in Graphics  by Christoph Peters](http://momentsingraphics.de/BlueNoise.html). Switched the file format to raw bitmap, which strangely has the smallest download footprint.
* Added a corona around the solar eclipse using the NASA photograph by [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).

**Version 0.3.0**
* **!Important:** In version 0.3.0 and above, you should no longer include the  ```material="shader: sky;"``` attribute as all of our shaders have been internalized.
* Updated the stellar LUTs to greatly reduce texture lookup times and greatly improve performance.
* Updated the lunar texture and normal maps so that they better reflect the familiar face of the moon.
* Pulled out our lunar and solar code into sperate shaders and meshes for better control and cleaner images through rectangular texture coordinates.
* Re-architectured the shader code from add hoc lighting combination methods to light addition and subtraction methods.
* Hooked solar and lunar object up to directional and ambient light sources, which implement lighting conservation.
* Eliminated banding artifacts in the sky by implementing a Bayer Matrix (http://www.anisopteragames.com/how-to-fix-color-banding-with-dithering/).
* Improved stellar twinkle animation to avoid motion-based sparkling and resulting in an improved visual experience.
* Implemented solar eclipses and integrated them into the inscattering and direct lighting both in the scene and the sky.
* Implemented lunar eclipses and integrated them into the inscattering and direct lighting both in the scene and the sky.
* Improved earth shine according to Muller, Engel and Dollner's *Single-Pass Rendering of Day and Night Sky Phenomena*.
* Integrated a solar texture to improve the visual quality of the sun in the sky by Mike Hosker (https://opengameart.org/content/sun-0).

**Version 0.2.1**
* Fixed a bug which cased the sky to flicker white when it collided with the distance culling radius.

**Version 0.2.0**
* Fixed a bug in the sky coloring so that the full sky is visible again.
* Improved the quality of our lunar textures with assets from the Celestia Motherload, (http://www.celestiamotherlode.net/catalog/moon.php).
* Improved the quality of the stars and improved the speed by reducing the search radius on our stellar LUTs.
* Added lunar single pass inscattering from the moon.
* Removed twinkling edge artifacts from the sun and moon.
* Set stellar scintillation to have zenith dependence and added color variation to twinkling.

**Version 0.1.0**
* Based on the initial work by NGO-Kevin's A-Sun-Sky (https://github.com/supermedium/superframe/tree/master/components/sun-sky/)
* Added a moon texture to the sky by Josip Kladaric (https://opengameart.org/content/the-moon).
* Added stars to the sky using the HYG Dataset.
* Hooked up the sun, moon and stars to an astronomical equations from Meeus.
