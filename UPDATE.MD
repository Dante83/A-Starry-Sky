**Version 1.1.0**


**Version 1.0.0**
* **!Important:** In version 1.0.0 and above, you must use a new XML based syntax to control the state of your sky. Variables have also changed to reflect updates to brand new engine architecture.
* Swapped out property based syntax with XML based value syntax with custom HTML components for a more organized developer experience.
* Completely updated code to a new architecture for better organization, improved rendering pipeline and to support new features like web assembly and compute shader programs.
* Moved from the analytical model, [A-Sun-Sky Project](https://github.com/ngokevin/kframe/tree/master/components/sun-sky) to a Look Up Table (LUT) approach by Oskar Elek, [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* for improved visualizations and performance.
* Converted all astronomical calculations to web assembly on a separate thread through web workers and moved primary calculations on the main thread to web assembly for reduce CPU load.
* Switched to procedurally generated sun disk with solar limb darkening, using the parameterization from [Joseph Bayley's Solar Limb Darkening](https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf)
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
