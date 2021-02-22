# A-Starry-Sky
======

A-Starry-Sky is a sky dome for [A-Frame Web Framework](https://aframe.io/). It aims to provide a simple, drop-in component that you can use to create beautiful day-night cycles in your creations. Click [here](http://code-panda.com/pages/projects/v1_0_0/a_sky_forge_example) to see this project in action (**Warning: requires a powerful GPU - do not open on a mobile phone**).

## Prerequisites
======

This is built for the [A-Frame Web Framework](https://aframe.io/).

`https://aframe.io/releases/1.2.0/aframe.min.js`

## Installing
======

When installing A-Starry-Sky, you'll want to copy the *a-starry-sky.v1.0.0.min.js* file, along with the *assets** and *wasm* folders into their own directory in your JavaScript folder. Afterwards, add the minified file into a script tag in your html, along with a reference to the interpolation engine JavaScript file in the WASM folder. You should not add a reference to the state-engine JavaScript bootstrap file, however as this module is loaded internally by the code.

```html
<script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.0.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

Once these references are set up, add the `<a-starry-sky>` component into your `<a-scene>` tag from A-Frame.

```html
<a-scene>
  <a-starry-sky></a-starry-sky>
</a-scene>
```

This barebones code will provide you with a sky that moves in real time at the latitude and longitude of San Francisco, California. However, we can do much more then this. A-Starry-Sky comes with a host of custom html tags to help customize
your sky state.

##Setting The Location
======

**Tag** | **Description**
:--- | :---
`<sky-location>` | Parent tag. Contains sky latitude and sky-longitude child tags.
`<sky-latitude>` | Set latitude of the location. North of the equator is **positive**.
`<sky-longitude>` | Set the longitude of the location. West of [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) is **negative**.

You can set your sky to any latitude and longitude on planet Earth. Locations are useful to provide a sense of seasons to your players, by changing the arcs of the sun or the moon. The latitude will also dictate which stars are visible in your night sky. Both the latitude and longitude are also critical to time-dependent events such as solar and lunar eclipses. This is especially true for solar eclipses if you are looking to experience a total solar eclipse. That said, setting the location is easier then deciding where to be. Just grab the location you want from [Google Earth](https://earth.google.com/web/) or some other map source, and enter the values into their respective tags like so,

Let's go to New York!
```html
<a-scene>
  <a-starry-sky>
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
  <a-starry-sky>
    <sky-location>
      <sky-latitude>-32</sky-latitude>
      <sky-longitude>116</sky-longitude>
    </sky-location>
  </a-starry-sky>
</a-scene>
```

One important thing to notice is that our `<sky-latitude>` and `<sky-longitude>` tags all live inside of a `<sky-location>` tag. This keeps our code organized by giving different sections for different property groups of our sky. It might not seem important now, but it will help provide a clean coding experience as you wish to add more and more properties to your sky. Additionally, I should point out that longitudes west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) are negative, like New York or Beaunos Aires.

##Setting The Time
======

**Tag** | **Description**
:--- | :---
`<sky-time>` | Parent tag. Contains all child tags related to the date or time elements.
`<sky-date>` | The local date-time string in the format **YEAR-MONTH-DAY HOUR:MINUTE:SECOND**/*2021-03-21 13:45:51*. Hour values are also based on a 0-23 hour system. 0 is 12 AM and 23 is 11PM.
`<sky-utc-offset>` | The UTC-Offset for this location. Negative values are west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian), contrary to longitude values. **Note that UTC Time does not follow DST**
`<sky-speed>` | The time multiplier used to speed up the astronomical calculations, or slow them down.

The sister setting to the location tag is the time tag. At the very least, you will want to use this tag with the above tag to set the UTC offset of your location, which you can get with a simple google search, e.g. [What is the UTC offset of New York](https://www.google.com/search?q=what+is+the+utc+offset+of+new+york). Notice that the UTC offset for times west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) are negative, as opposed to positive.

```html
<a-scene>
  <a-starry-sky>
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

The UTC-Offset is pretty boring. Why don't we do something a bit more interesting, like time travel! I heard there will be an exciting [solar eclipse](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) on April 8th of 2024. Let's go check it out!

```html
<a-scene>
  <a-starry-sky>
    <!-- It looks like there will be some good viewing in Texas! -->
    <sky-location>
      <sky-latitude>30.05</sky-latitude>
      <sky-longitude>-99.18</sky-longitude>
    </sky-location>

    <!-- Let's get there just in time to have a look :D -->
    <sky-time>
      <sky-date>2024-04-08 8:00:00</sky-date>
      <sky-utc-offset>-6</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Did you miss the [Christmas Star](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? No, no. Not that one. The one in the year 1226. Well, it's a good thing we have a time machine and A-Starry-Sky now supports planets :D.

```html
<a-scene>
  <a-starry-sky>
    <sky-time>
      <sky-date>1226-12-18 17:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

This time travel is fun, but you might also be interested in change the *speed* of time. Day-Night cycles often go faster in game world then in reality, or you might wish to permanently stop time to capture a specific moment for your lighting purposes. To do this, add in the `<sky-speed>` tag.

```html
<a-scene>
  <a-starry-sky>
    <sky-time>
      <!-- There will now be eight in-world days for every real life day.-->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Of course, if you're doing this in a persistent world, make sure to take the accelerated flow of time into account.

##Modifying Atmospheric Settings
======

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Parent tag. Contains all child tags related to atmospheric settings. | N/A
`<sky-sun-angular-diameter>` | The angular diameter of the sun as it appears in the sky. | 3.38 degrees
`<sky-moon-angular-diameter>` | The angular diameter of the moon as it appears in the sky.  | 3.15 degrees
`<sky-rayleigh-molecular-density>` | Describes how the density of smaller particles in the air responcible for the 'blues' and 'reds' seen in the sky in the middle of the day and at night. | 2.545E25
`<sky-mie-directional-g>` | Describes how much light is forward scattered by mie scattering, which is the whitish halo seen around the sun caused by larger particles in the atmosphere. The higher the mie-directional G, the dustier the atmosphere appears. | 0.8
`<sky-air-index-of-refraction>` | Describes how light beds as it is bent after entering the atmosphere. | 1.0003
`<sky-solar-color>` | Parent tag. Contains `<sky-color-{color-channel}>` tags to describe the base color of the sun. | rgb()
`<sky-lunar-color>` | Parent tag. Contains `<sky-color-{color-channel}>` tags to describe the base color of the moon. | rgb()
`<sky-color-red>` | Used to describe **red** color channel changes to `<sky-solar-color>` and `<sky-solar-color>` tags. | See parent tag.
`<sky-color-green>` | Used to describe **green** color channel changes to `<sky-solar-color>` and `<sky-solar-color>` tags. | See parent tag.
`<sky-color-blue>` | Used to describe **blue** color channel changes to `<sky-solar-color>` and `<sky-solar-color>` tags. | See parent tag.
`<sky-number-of-ray-steps>` | The number of points between the top of the atmosphere and the ground to simulate along each ray when building the atmospheric scattering LUT. | 30
`<sky-number-of-gathering-steps>` | The number of rotational angles to simulate when simulating secondary scattering in the atmospheric scattering LUT. | 30
`<sky-ozone-enabled>` | Enables to disables Ozone simulation in the atmospheric simulation. | true

The atmospheric parameters has one of the most extensive API in the entire code base. While these values can be used to create custom skies for the skilled developer most users will want to stick with the defaults. A few values in here are particularly useful however and fairly easy to understand.

One of the most likely elements you might want to change is the size of the sun and the moon. In real life the sun has an angular diameter of 0.53 degrees and the moon has an angular diameter of 0.50 degrees. Using these values in the simulator will better represent real life, but they tend to be too small in most simulations, especially on non-vr devices like monitors. To change these values to bigger or smaller values, however, just change the values in the corresponding tags.

```html
<a-scene>
  <a-starry-sky>
    <sky-atmospheric-parameters>
      <sky-sun-angular-diameter>0.53</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.5</sky-moon-angular-diameter>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```



##Modifying Lighting Defaults
======
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



##Setting The Asset Directories
======
**Tag** | **Description**
:--- | :---
`<sky-assets-dir>` | Parent tag. Contains all child tags related to asset locations. Can contain *dir*, *texture-path*, *moon-path*, *star-path* and *wasm-path* attributes to guide the system to entire groups of data at a time.
`<sky-state-engine-path>` | The location of the WASM state engine JavaScript file, which runs on a separate CPU core via a web worker. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
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
  <a-starry-sky>
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
  <a-starry-sky>
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
  <a-starry-sky>
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

In addition to having images, there is also a JavaScript file to the web-worker WASM controller. If we suppose this lives at *../../precompiled_assets/custom_js/wasm/starry-sky-wasm* then we might note that there is a split at precompiled assets and the rest of our folder. We can actually use the xml structure of our tags to our advantage, first navigating to the *../../precompiled_assets* in one `<sky-assets-dir>` and then to the other paths in seperate code branches.

```html
<a-scene>
  <a-starry-sky>
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/">
        <!--This is our new WASM path, it starts at precompiled assets above and we can work from here -->
        <sky-assets-dir dir="custom_js/wasm/">
          <sky-assets-dir dir="starry-sky-wasm" wasm-path></sky-assets-dir>
        </sky-assets-dir>

        <!--Our images directory is still sitting at precompiled assets and we can start from that directory here -->
        <sky-assets-dir dir="my_images/a-starry-sky-images">
          <sky-assets-dir dir="moon_images" moon-path></sky-assets-dir>
          <sky-assets-dir dir="star_images" star-path></sky-assets-dir>
          <sky-assets-dir dir="blue_noise_maps" blue-noise-path></sky-assets-dir>
          <sky-assets-dir dir="solar_eclipse_picture">
            <sky-solar-eclipse-map></sky-solar-eclipse-map>
          </sky-assets-dir>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Using the above methods, you should be able to direct A-Starry-Sky to your assets no matter where they live in your application.

## Author
======
* **David Evans / Dante83** - *Main Developer*

## References & Special Thanks
======
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Abso-frigging-lutely esential for positioning astronomical bodies*
* *And plenty of other websites and individuals. Thank you for giving us the opportunity to stand on your giant-like shoulders.*

## License
======
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
