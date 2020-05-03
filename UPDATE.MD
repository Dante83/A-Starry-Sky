**Version 0.1.0**
* Based on the initial work by NGO-Kevin's A-Sun-Sky (https://github.com/supermedium/superframe/tree/master/components/sun-sky/)
* Added a moon texture to the sky by Josip Kladaric (https://opengameart.org/content/the-moon).
* Added stars to the sky using the HYG Dataset.
* Hooked up the sun, moon and stars to an astronomical equations from Meeus.

**Version 0.2.0**
* Fixed a bug in the sky coloring so that the full sky is visible again.
* Improved the quality of our lunar textures with assets from the Celestia Motherload, (http://www.celestiamotherlode.net/catalog/moon.php).
* Improved the quality of the stars and improved the speed by reducing the search radius on our stellar LUTs.
* Added lunar single pass inscattering from the moon.
* Removed twinkling edge artifacts from the sun and moon.
* Set stellar scintillation to have zenith dependence and added color variation to twinkling.

**Version 0.2.1**
* Fixed a bug which cased the sky to flicker white when it collided with the distance culling radius.

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

**Version 1.0.0**
* **!Important:** In version 1.0.0 and above, you must use a new XML based syntax to control the state of your sky. Variables have also changed to reflect updates to brand new engine architecture.
* Swapped out property based syntax with XML based value syntax with custom HTML components for a more organized developer experience.
* Completely updated code to a new architecture to meet the needs of new features.
* Moved from the analytical model, [A-Sun-Sky Project](https://github.com/ngokevin/kframe/tree/master/components/sun-sky) to a Look Up Table (LUT) approach by Oskar Elek, [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* for improved visualizations and performance.
* Converted all astronomical calculations to web assembly on a separate thread through web workers and moved primary calculations on the main thread to web assembly for reduce CPU load.
* Switched to procedurally generated sun disk with solar limb darkening, using the parameterization from [Joseph Bayley's Solar Limb Darkening](https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf) with a reimplementation of the Unreal Bloom postprocessing effect for a procedurally generated glow effect.
