# A Sky Forge

A-Sky-Forge is a sky dome for [A-Frame Web Framework](https://aframe.io/). It builds upon on the work of [A-Sun-Sky Project](https://github.com/ngokevin/kframe/tree/master/components/sun-sky) to provide a vibrant living sky for your metaverse. Click [here](http://code-panda.com/pages/projects/v_0_3_0/a_sky_forge_example) to see this project in action (**Warning: Still not suitable for mobile environments.**).

[Solar Eclipse Example](http://code-panda.com/pages/projects/v_0_3_0/a_sky_forge_solar_eclipse_example)

[Lunar Eclipse Example](http://code-panda.com/pages/projects/v_0_3_0/a_sky_forge_lunar_eclipse_example)

## Prerequisites

This is built for the [A-Frame Web Framework](https://aframe.io/).

`https://aframe.io/releases/0.9.0/aframe.min.js`

## Installing

When installing A-Sky-Forge, you'll want the code located in js/a-sky-forge/dist.
Copy the minified file, askyforge.v0.3.0.js into your javascripts directory and the images in copy_me_to_image_dir into your image directory.

On your webpage make sure that the script link to ask forge goes below aframe, like so

```html
<script src="https://aframe.io/releases/0.9.0/aframe.min.js"></script>
<script src="../js/a-sky-forge/dist/askyforge.v0.3.0.min.js"></script>
```

**!Important:** In version 0.3.0 and above, you should no longer include the  ```material="shader: sky;"``` attribute as all of our shaders have been internalized.

This barebones code will provide you with a sky that moves in real time at the latitude and longitude of San Francisco, California.

A-Sky-Forge also presumes that your images will be located in the directory, ../images. Chances are, this the last place your application put these images. However, you can easily define a custom directory with imgDir property of the sky-time attribute, like so,

Suppose we copied our images into the `../resources/assets/images/` directory, the result code would look as follows:
```html
<a-scene>
  <a-sky-forge sky-time="imgDir:../resources/assets/images/;"></a-sky-forge>
</a-scene>
```

**!Important:** Notice that we include the trailing / in our string, but more importantly, we do not surround our string with 's which appears to mess with the custom attributes.

Now let's get to something a little more fun, changing our location, which is performed using the `lat` and `long` properties in the `geo-coordinates` attribute:

**Let's go to Tokyo!**
```html
<a-scene>
  <a-sky-forge geo-coordinates="lat: 35.68; long:139.69;"></a-sky-forge>
</a-scene>
```


**But wait! We live in New York!**
```html
<a-scene>
  <a-sky-forge sky-time="utcOffset: +5;" geo-coordinates="lat: 35.68; long:139.69;"></a-sky-forge>
</a-scene>
```

**!Important:** The UTC Offset is not the offset of the latitude and longitude of the coordinates you are moving to,
but the UTC offset of your current clock. So if you are in New York trying to simulate Japan, set your utcoffset to +5, not -9.

Besides changing your location, you can also change the date and time...
One important caveat is that the time during the day is set in seconds via the `timeOffset` property in the `sky-time` attribute.
**There are 86400 seconds in a day**, which should help you get to a specific time during any given day.

**Party like it's 1999! @_@**
```html
<a-scene>
  <a-sky-forge sky-time="month: 12; day: 31; year: 1999; timeOffset: 86390;"></a-sky-forge>
</a-scene>
```

Another cool feature that may prove useful, is that we can speed up time in our universe using the `timeMultiplier` property in the `sky-time` attribute. Note that even though we are *speeding* up time, the effects like star twinkling will be unchanged by this attribute. It only impacts the positions of heavenly bodies, namely the sun, the moon and the stars.

**Time goes 8 times as fast!**
```html
<a-scene>
  <a-sky-forge sky-time="timeMultiplier: 8;"></a-sky-forge>
</a-scene>
```

**While we cannot stop time without an error, we can slow it down a lot.
The stars will continue to twinkle as normal, but the sky will not move.**
```html
<a-scene>
  <a-sky-forge sky-time="timeMultiplier: 0.0001;"></a-sky-forge>
</a-scene>
```

**Let's Change Our Sky Params**

In addition to changing date time parameters, you can also change the attributes of the atmosphere itself, using the `sky-params` attribute, using the properties `luminance`, `turbidity`, `reileigh`, `mieCoefficient` and `mieDirectionalG`.

```html
<a-scene>
  <a-sky-forge sky-params="turbidity: 0.1"></a-sky-forge>
</a-scene>
```

Each of the attributes above changes a different property of the atmosphere for redder sunsets or more dust in the sky.

## Sky Param Attributes
* **luminance** is a value between 0.0 and 2.0. The default glow of the sky. Lower is higher, and this is best kept about 1.0.
* **turbidity** is a value between 0.0 and 20.0. Changes the amount of particles in the air, which can adjust the intensity of light scattered.
* **reileigh** is a value between 0.0 and 4.0. Changes the wavelength scattering of particles, resulting in bluer skies and redder sunsets.
* **mieCoefficient** is a value between 0.0 and 0.1. Adjusts the Mie Scattering coefficient so that all light reaches you or is scattered appropriately.
* **mieDirectionalG** is a value between 0.0 and 1.0.
* **angularDiameterOfTheSun** the diameter of the sun texture rendered in the sky.
* **angularDiameterOfTheMoon** the diameter of the moon texture rendered in the sky.

## Dependent Work
* **[ngoKevin](https://www.npmjs.com/~ngokevin) / [A-Sun-Sky Project](https://github.com/ngokevin/kframe/tree/master/components/sun-sky)** - *Created the initial base shader for my sky shader. Appears to be based on the work of blurspline's sun-sky code for THREE.js.*
* **[Andrea Giammarchi](https://github.com/WebReflection) / [Deep Cloner](https://github.com/WebReflection/cloner)** - *Used for cloning JS objects, which isn't entirely trivial.*

## Author
* **David Evans / Dante83** - *Main Developer*

## References & Special Thanks
* **Aframe. Period. This library makes the sky go round. (https://aframe.io/)**

* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Abso-frigging-lutely essential for positioning astronomical bodies*

* **Moon textures From the Celestia Motherload (http://www.celestiamotherlode.net/catalog/moon.php)**

* **Sun texture by Mystic Mike (Mike Hosker) (https://opengameart.org/content/sun-0)**

* **The mountain tutorial by Lars Mezaka (https://www.youtube.com/watch?v=oBtsbs9aiW8)**

* **Mountain texture files by @lentebriesje (https://www.planetminecraft.com/blog/a-present-3025954/)**

* **Everyone on the A-Frame Slack group for being such a friendly help community (https://aframe.io/slack)**

* *And plenty of other websites and individuals. Thank you for giving me the opportunity to stand on the shoulders of giants.*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
