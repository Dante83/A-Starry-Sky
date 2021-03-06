# A-Starry-Sky

A-Starry-Sky is a sky dome for [A-Frame Web Framework](https://aframe.io/). It aims to provide a simple, drop-in component that you can use to create beautiful day-night cycles in your creations. Click [here](https://code-panda.com/pages/projects/v_1_0_0/a_starry_sky_example) to see this project in action (**Warning: requires a powerful GPU - do not open on a mobile phone**).

[Solar Eclipse Example](https://code-panda.com/pages/projects/v_1_0_0/a_starry_sky_solar_eclipse_example)
[Lunar Eclipse Example](https://code-panda.com/pages/projects/v_1_0_0/a_starry_sky_lunar_eclipse_example)
[Christmas Star Example](https://code-panda.com/pages/projects/v_1_0_0/a_starry_sky_christmas_star_example)

## Prerequisites

This is built for the [A-Frame Web Framework](https://aframe.io/) version 1.2.0+. It also requires a Web XR compatible web browser.

`https://aframe.io/releases/1.2.0/aframe.min.js`

## Installing

When installing A-Starry-Sky, you'll want to copy the *a-starry-sky.v1.0.0.min.js* file, along with the *assets** and *wasm* folders into their own directory in your JavaScript folder. Afterwards, add the minified file into a script tag in your html, along with a reference to the interpolation engine JavaScript file in the WASM folder. You should not add a reference to the starry-sky-web-worker or state-engine JavaScript bootstrap file, here, however, but instead inject this into the `<a-starry-sky>` tag.

```html
<script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.0.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

Once these references are set up, add the `<a-starry-sky>` component into your `<a-scene>` tag from A-Frame with a reference to your sky-state web worker url like so.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

This barebones code will provide you with a sky that moves in real time at the latitude and longitude of San Francisco, California. However, we can do much more then this. A-Starry-Sky comes with a host of custom html tags to help customize
your sky state.

**NOTE: This sky box is immutable. That means that the settings you start with will remain constant on any given page. Unfortunately, at this time, it is just too difficult to make the code mutable.**

## Setting The Location

**Tag** | **Description**
:--- | :---
`<sky-location>` | Parent tag. Contains sky latitude and sky-longitude child tags.
`<sky-latitude>` | Set latitude of the location. North of the equator is **positive**.
`<sky-longitude>` | Set the longitude of the location. West of [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) is **negative**.

You can set your sky to any latitude and longitude on planet Earth. Locations are useful to provide a sense of seasons to your players, by changing the arcs of the sun or the moon. The latitude will also dictate which stars are visible in your night sky. Both the latitude and longitude are also critical to time-dependent events such as solar and lunar eclipses. This is especially true for solar eclipses if you are looking to experience a total solar eclipse. That said, setting the location is easier then deciding where to be. Just grab the location you want from [Google Earth](https://earth.google.com/web/) or some other map source, and enter the values into their respective tags like so,

Let's go to New York!
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>
  </a-starry-sky>
</a-scene>
```

Ok, but what about Perth Australia?
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-location>
      <sky-latitude>-32</sky-latitude>
      <sky-longitude>116</sky-longitude>
    </sky-location>
  </a-starry-sky>
</a-scene>
```

One important thing to notice is that our `<sky-latitude>` and `<sky-longitude>` tags all live inside of a `<sky-location>` tag. This keeps our code organized by giving different sections for different property groups of our sky. It might not seem important now, but it will help provide a clean coding experience as you wish to add more and more properties to your sky. Additionally, I should point out that longitudes west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) are negative, like New York or Beaunos Aires.

## Setting The Time

**Tag** | **Description**
:--- | :---
`<sky-time>` | Parent tag. Contains all child tags related to the date or time elements.
`<sky-date>` | The local date-time string in the format **YEAR-MONTH-DAY HOUR:MINUTE:SECOND**/*2021-03-21 13:45:51*. Hour values are also based on a 0-23 hour system. 0 is 12 AM and 23 is 11PM.
`<sky-utc-offset>` | The UTC-Offset for this location. Negative values are west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian), contrary to longitude values. **Note that UTC Time does not follow DST**
`<sky-speed>` | The time multiplier used to speed up the astronomical calculations, or slow them down.

The sister setting to the location tag is the time tag. There are two strategies here. Either you wish to set the sky-time to UTC time and the sky-utc-offset to 0, or you wish to set the sky-time to your users location and set the UTC time to match. For instance, if you were setting up a user known to be in New York City, the local time on their machine is expected to be 4 hours behind UTC time. Furthermore, to match their location, you would also need to set their latitude and longitude to the location of New York City.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Previous Location Seetings -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- You can set up the utc offset like so! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Notice that you will once again add in parent `<sky-time>` tag that contains all the relevant child tags for our time settings.

That said, you don't just have to stick with the local machines time. Why don't we do something a bit more interesting, like time travel! I heard there will be an exciting [solar eclipse](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) on [April 8th of 2024 at 1:27PM (13:27 24 hour time) in Del Rio Texas](https://nationaleclipse.com/cities_total.html). Let's go check it out!

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-location>
      <sky-latitude>29.3709</sky-latitude>
      <sky-longitude>-100.8959</sky-longitude>
    </sky-location>
    <sky-time>
      <sky-date>2024-04-08 13:27:00</sky-date>
      <sky-utc-offset>-5</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Did you miss the [Christmas Star](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? No, no. Not that one. The one in the year 1226 AD. Well, it's a good thing we have a time machine and A-Starry-Sky now supports planets :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

This time travel is fun, but you might also be interested in change the *speed* of time. Day-Night cycles often go faster in game world then in reality, or you might wish to permanently stop time to capture a specific moment for your lighting purposes. To do this, add in the `<sky-speed>` tag.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- There will now be eight in-world days for every real life day.-->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Of course, if you're doing this in a persistent world, make sure to take the accelerated flow of time into account when creating your HTML. Setting up dynamic HTML for your sky is up to you however.

## Modifying Atmospheric Settings

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Parent tag. Contains all child tags related to atmospheric settings. | N/A
`<sky-sun-angular-diameter>` | The angular diameter of the sun as it appears in the sky. | 3.38 degrees
`<sky-moon-angular-diameter>` | The angular diameter of the moon as it appears in the sky.  | 3.15 degrees
`<sky-mie-directional-g>` | Describes how much light is forward scattered by mie scattering, which is the whitish halo seen around the sun caused by larger particles in the atmosphere. The higher the mie-directional G, the dustier the atmosphere appears. | 0.8

The atmospheric parameters has one of the most extensive API in the entire code base. While these values can be used to create custom skies for the skilled developer most users will want to stick with the defaults. A few values in here are particularly useful however and fairly easy to understand.

One of the most likely elements you might want to change is the size of the sun and the moon. In real life the sun has an angular diameter of 0.53 degrees and the moon has an angular diameter of 0.50 degrees. Using these values in the simulator will better represent real life, but they tend to be too small in most simulations, especially on non-vr devices like monitors. To change these values to bigger or smaller values, however, just change the values in the corresponding tags.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <sky-sun-angular-diameter>0.53</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.5</sky-moon-angular-diameter>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Modifying Lighting Defaults

**Tag** | **Description**
:--- | :---
`<sky-lighting>` | Parent tag. Contains all child tags related to the lighting of the scene.
`<sky-ground-color>` | Parent tag. Contains `<sky-ground-color-{color-channel}>` tags to describe the base color of the ground for reflective lighting from the surface.
`<sky-ground-color-red>` | Used to describe **red** color channel changes to `<sky-ground-color>` tags.
`<sky-ground-color-green>` | Used to describe **green** color channel changes to `<sky-ground-color>` tags.
`<sky-ground-color-blue>` | Used to describe **blue** color channel changes to `<sky-ground-color>` tags.
`<sky-atmospheric-perspective-density>` | The maximum amount of atmospheric perspective possible. That is, the exponential fog effect that causes distant objects to appear more blue in the day.
`<sky-shadow-camera-size>` | The size of the camera area used to cast shadows. Larger sizes result in more area covered by shadows, but also causes aliasing issues by spreading each pixel of the camera over a wider area.
`<sky-shadow-camera-resolution>` | The resolution, in pixels, of the direct lighting camera used to produce shadows. Higher values produce higher quality shadows at an increased cost in code.

The sky lighting tags are useful for controlling attributes of the direct and indirect lighting in the scene. In version 1.0.0, the sky has reduced the number of direction lights from 2 (sun and moon) to 1 (just one for the most dominant light source). The directional light is always focused on the users camera and creates shadows around this camera. While the directional light can support various shadow types, this library actually isn't the place to control this. Instead, the shadow type is set in the `<a-scene>` tag, as described [here](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). That is, you can set the values to any of the following.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

```html
<a-scene shadow="type: pcf">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

```html
<a-scene shadow="type: basic">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Unfortunately, at the time of writing this, A-Frame does not yet support variance shadow maps, though there is an open issue for this. Also, the shadow type you choose for your sun and moon lighting will also be the shadow type for all other lights within your scene, so take this into account when choosing your shadows.

While changing the shadow type is done in A-Frame at the scene level, you can still impact the quality of your shadows by changing the size and resolution of your shadow camera. Because the shadow cameras are orthographic, all direct lighting cameras are set to the distance of the sun and moons location for casting shadows. However, this does not result in shadows infinitely far away, nor does it result in infinitely crisp shadows. Unfortunately, to draw objects further away, you must increase the size of the camera frustum like so,

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <sky-shadow-camera-size>
        <!-- Let's set the minimum forward draw distance to 120m -->
        120
      <sky-shadow-camera-size>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

However, if you do increase the size of your frustum to allow more things to cast shadows, you might soon find a problem. Your shadows may start to become pixelated. This is a bit troubling, but we can solve this issue as well. Just increase the resolution of your camera!

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <sky-shadow-camera-size>
        <!-- Let's set the minimum forward draw distance to 120m -->
        120
      <sky-shadow-camera-size>
      <sky-shadow-camera-resolution>
        <!-- As our resolution is square we only have to set one of these values -->
        4096
      </sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

There. Nice crisp shadows. Unfortunately, this introduces another problem. The higher the resolution on your shadow camera, the more weight it produces on your GPU. While cascading shadow maps would be an ideal solution for this, they were not available at this iteration of the code. Therefore, the best way to approach this problem is to balance the size and resolution of your camera frustum. Another thing you may wish to do is disable shadows on your environment mesh as it's large size means that most of it will likely be outside of the frustum no matter how large you make it resulting in an odd square shadow edge.

Once you have the shadows in your scene just right, you will probably also wish to adjust the color of your 'ground'. A-Starry-Sky now supports a triple hemispherical lighting setup that uses a convolution over the colors of the sky combined with a ground light scattering model on a separate CPU thread via web workers. However, the default color of the ground is brown. You might have a grassy field or a cerulean ocean. To set the color of your ground, you can use the `<sky-ground-color>` tag along with its child ground color channel tags. Let's say we wanted to set the ground to a brilliant green for a lush field of grass.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <sky-ground-color>
        <sky-ground-color-red>85</sky-ground-color-red>
        <sky-ground-color-green>231</sky-ground-color-green>
        <sky-ground-color-blue>5</sky-ground-color-blue>
      </sky-ground-color>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Notice that the values above are normalized between values of 0 and 255. So, the r, g, b combo 0, 0, 0 is black and 255, 255, 255 is white. The above color might also be a bit bright making the ground appear to 'glow' with the slightest bit of light. To dim this effect, you can just dim the color a bit.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <sky-ground-color>
        <sky-ground-color-red>33</sky-ground-color-red>
        <sky-ground-color-green>90</sky-ground-color-green>
        <sky-ground-color-blue>2</sky-ground-color-blue>
      </sky-ground-color>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

That said, if any of your color channels go over 255, there is no way to 'strengthen the color' or to make the ground appear to 'glow in the dark' at this time, unfortunately. Furthermore, the ground color is a constant at all points, so if you have multiple colors in your scene it's probably best to choose one that exists in the middle of all the other colors.

The final element of the sky lighting you will likely want to change is the atmospheric perspective density. Atmospheric perspective is the effect that causes distant mountains to turn blue with distance on a clear day. The effect is not constant, as more light is scattered back to the camera during the day then the night and the color of the distant mountains varies based on the overall lighting conditions in the sky and calculated on a separate web worker every half a second in user time. However, the effects chosen for the current atmospheric perspective tends to be a bit strong to insure that the effect is visible even in small scenes. That said, atmospheric perspective is typically visible over very long distances so you may wish to reduce the effect to provide a more realistic experience.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <sky-ground-color>
        <!-- while the default is 0.007 the atmospheric perspective density is very
        tempermental to change so only small changes are needed. -->
        <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
      </sky-ground-color>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Setting The Asset Directories

**Tag** | **Description**
:--- | :---
`<sky-assets-dir>` | Parent tag. Contains all child tags related to asset locations. Can contain *dir*, *texture-path*, *moon-path*, *star-path* and *wasm-path* attributes to guide the system to entire groups of data at a time.
`<sky-moon-diffuse-map>` | Defines a moon diffuse map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-normal-map>` | Defines a moon normal map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-roughness-map>` | Defines a moon roughness map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-aperture-size-map>` | Defines a moon aperture size map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-aperture-orientation-map>` | Defines a moon aperture orientation map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-star-cubemap-maps>` | Defines the location of all sky cubemap LUT keys that are used to find the stars in the sky.
`<sky-dim-star-maps>` | Defines the location of all dim star LUTs used to show all the dim stars in the sky.
`<sky-med-star-maps>` | Defines the location of all medium star LUTs used to show all the dim stars in the sky.
`<sky-bright-star-maps>` | Defines the location of all bright star LUTs used to show all the dim stars in the sky.
`<sky-star-color-map>` | Defines the location of the star color LUT, which is used to provide the correct colors to stars based on their temperature.
`<sky-blue-noise-maps>` | Defines the location the tiling blue noise maps which are used to provide temporal dithering to eliminate banding.
`<sky-solar-eclipse-map>` | Defines the location of the solar eclipse texture used to provide the corona on the solar eclipse during a total solar eclipse.

While it is my hope that most people will rarely require it, experience has shown me that most web applications have their own ideas when it comes to asset pipelines. A website's image assets and JavaScript assets may not cohabitate the same folder structure and may indeed be scattered across the page at different URIs. To this end, I attempted to include a fairly robust asset system to help recollect these distant assets so that A-Starry-Sky knows where to gather resources.

Let's start by attempting to navigate to *../../precompiled_assets/my_images/a-starry-sky-images*, which is where we will store all of our images in a fictional universe. We use the *dir* attribute in the `<sky-assets-dir>` tag to move between folders like this.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images" wasm-path>
        <!-- This is the folder where all of our images live -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Once we've gotten to the folder, we have several ways to specify where our images live. The most basic mechanism we probably want is to use attributes for each of our key groups of images, *texture-path*, *moon-path* and *star-path*. Whatever folder names are associated with each of these paths, it is assumed the files live within them with their default names. The exception to this is the solar eclipse map, as there is only one image for this particular file, so we will show where that file lives by just dropping the tag inside of the asset directory.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images" wasm-path>
        <!-- Note that 'moon_images', 'star_images', 'blue_noise_maps' and 'solar_eclipse_picture'
        all folder names. The files themselves are expected to be found within these folders.-->
        <sky-assets-dir dir="moon_images" moon-path></sky-assets-dir>
        <sky-assets-dir dir="star_images" star-path></sky-assets-dir>
        <sky-assets-dir dir="blue_noise_maps" blue-noise-path></sky-assets-dir>
        <sky-assets-dir dir="solar_eclipse_picture">
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

As you might notice, we could have also provided links to each of the individual groups of pictures for improved control, although this is not recommended.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures" wasm-path>
        <!-- Someone likes folders X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        <sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        <sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--Even though these are single tags, all the files associated
          with this tag are expected to live in this folder-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        <sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--Even though this a single tag, all the files associated
          with this tag are expected to live in this folder-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        <sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>

          <!--Even though this a single tag, all the files associated
          with this tag are expected to live in this folder-->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Using the above methods, you should be able to direct A-Starry-Sky to your assets no matter where they live in your application.

## Author
* **David Evans / Dante83** - *Main Developer*

## References & Special Thanks
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Abso-frigging-lutely essential for positioning astronomical bodies*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* which was so helpful in creating this new amazing LUT based sky.
* [Efficient and Dynamic Atmospheric Scattering ](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), which was super helpful in figuring out the details implementing the LUT code and to help determine if I was on the write path with how those LUTs looked.
* The [Colour-Science Library](https://www.colour-science.org/) library for better star color LUTs.
* The great blue noise textures by [Moments in Graphics  by Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* The solar corona texture by [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* All the amazing work that has gone into [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) and [Emscripten](https://emscripten.org/).
* *And so so many other websites and individuals. Thank you for giving us the opportunity to stand on your giant-like shoulders.*

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
