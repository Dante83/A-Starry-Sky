# A Sky Forge

A-Sky-Forge is a sky dome for [A-Frame Web Framework](https://aframe.io/). It builds upon on the work of [A-Sun-Sky Project](https://github.com/ngokevin/kframe/tree/master/components/sun-sky) to provide a vibrant living sky for your metaverse. Click [here](http://code-panda.com/pages/projects/a_sky_forge_example) to see this project in action (**Warning: requires a powerful GPU do not open on a mobile phone**).

## Prerequisites

This is built for the [A-Frame Web Framework](https://aframe.io/).

`https://aframe.io/releases/0.8.0/aframe.min.js`

## Installing

When installing A-Sky-Forge, you'll want the code located in js/a-sky-forge/dist.
Copy the minified file, askyforge.v0.1.0.js into your javascripts directory and the images in copy_me_to_image_dir into your image directory.

On your webpage make sure that the script link to ask forge goes below aframe, like so

```html
<script src="https://aframe.io/releases/0.7.0/aframe.min.js"></script>
<script src="../js/a-sky-forge/dist/askyforge.v0.1.0.min.js"></script>
```

Once these references are set up, add the a-sky-forge component into your a-scene-tag.
For **version 0.7.0** and below:

```html
<a-scene>
  <a-sky-forge material="shader: sky;"></a-sky-forge>
</a-scene>
```

For **version 0.8.0** [See issue here](https://github.com/aframevr/aframe/issues/3428):
```html
<a-scene>
  <a-sky-forge material="shader: sky; side:back;"></a-sky-forge>
</a-scene>
```

This barebones code will provide you with a sky that moves in real time at the latitude and longitude of San Francisco, California.

A-Sky-Forge also presumes that your images will be located in the directory, ../images. Chances are, this the last place your application put these images. However, you can easily define a custom directory with imgDir property of the sky-time attribute, like so,

Suppose we copied our images into the `../resources/assets/images/` directory, the result code would look as follows:
```html
<a-scene>
  <a-sky-forge sky-time="imgDir:../resources/assets/images/;" material="shader: sky;"></a-sky-forge>
</a-scene>
```

**!Important:** Notice that we include the trailing / in our string, but more importantly, we do not surround our string with "s or 's which appears to mess with A-Frames attribute system.

Now let's get to something a little more fun, changing our location, which is performed using the `lat` and `long` properties in the `geo-coordinates` attribute:

**Let's go to Tokyo!**
```html
<a-scene>
  <a-sky-forge geo-coordinates="lat: 35.68, long:139.69" material="shader: sky;"></a-sky-forge>
</a-scene>
```

If you do change the location, make sure to also change the time-offset from UTC time in the sky-time attributes, measured in hours.

**Tokyo is 9 hours ahead of UTC**
```html
<a-scene>
  <a-sky-forge sky-time="utcOffset: 9;" geo-coordinates="lat: 35.68, long:139.69" material="shader: sky;"></a-sky-forge>
</a-scene>
```

Besides changing your location, you can also change the date and time...
One important caveat is that the time during the day is set in seconds via the `timeOffset` property in the `sky-time` attribute.
**There are 86400 seconds in a day**, which should help you get to a specific time during any given day.

**Party like it's 1999! @_@**
```html
<a-scene>
  <a-sky-forge sky-time="month: 12, day: 31, year: 1999; timeOffset: 86390" material="shader: sky;"></a-sky-forge>
</a-scene>
```

Another cool feature that may prove useful, is that we can speed up time in our universe using the `timeMultiplier` property in the sky-time `attribute`. Note that even though we are *speeding* up time, the effects like star twinkling will be unchanged by this attribute. It only impacts the positions of heavenly bodies, namely the sun, the moon and the stars.

**Time goes 8 times as fast!**
```html
<a-scene>
  <a-sky-forge sky-time="timeMultiplier: 8;" material="shader: sky;"></a-sky-forge>
</a-scene>
```

**Time is stopped (stars will still twinkle and stuff, but the sky elements won't move.)**
```html
<a-scene>
  <a-sky-forge sky-time="timeMultiplier: 0;" material="shader: sky;"></a-sky-forge>
</a-scene>
```

## Authors
* **David Evans / Dante83** - *Initial work*

## References & Special Thanks
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Abso-frigging-lutely esential for positioning astronomical bodies*
* **[ngoKevin](https://www.npmjs.com/~ngokevin) / [A-Sun-Sky Project](https://github.com/ngokevin/kframe/tree/master/components/sun-sky)** - *Created the initial base shader for my sky shader.*
* **[Andrea Giammarchi](https://github.com/WebReflection) / [Deep Cloner](https://github.com/WebReflection/cloner)** - *Used for cloning JS objects, which isn't entirely trivial.*
* *And plenty of other websites and individuals. Thank you for giving us the opportunity to stand on your giant-like shoulders.*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
