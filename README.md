# A-Starry-Sky

A-Starry-Sky is a sky dome for [A-Frame Web Framework](https://aframe.io/). It aims to provide a simple, drop-in component that you can use to create beautiful day-night cycles in your creations. Click [here](https://code-panda.com/pages/projects/v_1_0_0/a_starry_sky_example) to see this project in action (**Warning: requires a powerful GPU - do not open on a mobile phone**).

[Solar Eclipse Example](https://code-panda.com/pages/projects/v_1_0_0/a_starry_sky_solar_eclipse_example)

[Lunar Eclipse Example](https://code-panda.com/pages/projects/v_1_0_0/a_starry_sky_lunar_eclipse_example)

[Christmas Star Example](https://code-panda.com/pages/projects/v_1_0_0/a_starry_sky_christmas_star_example)

## Prerequisites

This is built for the [A-Frame Web Framework](https://aframe.io/) version 1.3.0+. It also requires a Web XR compatible web browser.

`https://aframe.io/releases/1.3.0/aframe.min.js`

## Installing

When installing A-Starry-Sky, you'll want to copy the *a-starry-sky.v1.0.1.min.js* file, along with the *assets** and *wasm* folders into their own directory in your JavaScript folder. Afterwards, add the minified file into a script tag in your html, along with a reference to the interpolation engine JavaScript file in the WASM folder. You should not add a reference to the starry-sky-web-worker or state-engine JavaScript bootstrap file, here, however, but instead inject this into the `<a-starry-sky>` tag.

```html
<script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.0.1.min.js"></script>
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
`<sky-speed>` | The time multiplier used to speed up the astronomical calculations, or slow them down.
`<sky-utc-offset>` | The UTC-Offset for this location. Negative values are west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian), contrary to longitude values. **Note that UTC Time does not follow DST**

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
`<sky-mie-directional-g>` | Describes how much light is forward scattered by mie scattering, which is the whitish halo seen around the sun caused by larger particles in the atmosphere. The higher the mie-directional G, the dustier the atmosphere appears. | 0.8
`<sky-moon-angular-diameter>` | The angular diameter of the moon as it appears in the sky.  | 3.15 degrees
`<sky-sun-angular-diameter>` | The angular diameter of the sun as it appears in the sky. | 3.38 degrees

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

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-lighting>` | Parent tag. Contains all child tags related to the lighting of the scene. | N/A
`<sky-sun-intensity>` | Intensity multiplier for sunlight, can be used to brighten or dim the intensity of solar directional lighting. | 1.0
`<sky-moon-intensity>` | Intensity multiplier for moonlight, can be used to brighten or dim the intensity of lunar directional lighting. | 1.0
`<sky-ambient-intensity>` | Intensity multiplier for ambient lighting, can be used to brighten or dim the intensity of the ambient lighting system. | 1.0
`<sky-minimum-ambient-lighting>` | The minimum amount of ambient light in the system. | 0.01
`<sky-maximum-ambient-lighting>` | The minimum amount of ambient light in the system. | INF
`<sky-atmospheric-perspective-type>` | Can be set set to possible values of *normal* or  *advanced* or *none*. Required for scene fog. *normal* uses the orginal exponential fog model while *advanced* uses a Preetham based lighting model for improved color variation at the expense of greater hardware pressure. | normal
`<sky-atmospheric-perspective-density>` | For *normal* fog only. Controls the density parameter for exponential scene fog. The color is set automatically from the scene lighting. Ignored if the scene fog type is *advanced* | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | For *advanced* fog only. Multiplies the distance to the fog for the advanced fog model. | 5.0
`<sky-ground-color>` | Parent tag. Contains `<sky-ground-color-{color-channel}>` tags to describe the base color of the ground for reflective lighting from the surface. | N/A
`<sky-ground-color-red>` | Used to describe **red** color channel changes to `<sky-ground-color>` tags. | 66
`<sky-ground-color-green>` | Used to describe **green** color channel changes to `<sky-ground-color>` tags. | 44
`<sky-ground-color-blue>` | Used to describe **blue** color channel changes to `<sky-ground-color>` tags. | 2
`<sky-shadow-camera-resolution>` | The resolution, in pixels, of the direct lighting camera used to produce shadows. Higher values produce higher quality shadows at an increased cost in code. | 2048
`<sky-shadow-camera-size>` | The size of the camera area used to cast shadows. Larger sizes result in more area covered by shadows, but also causes aliasing issues by spreading each pixel of the camera over a wider area. | 32.0
`<sky-sun-bloom>` | Parent tag, contains all properties of the sun bloom render pass. | N/A
`<sky-moon-bloom>` | Parent tag, contains all properties of the moon bloom render pass. | N/A
`<sky-bloom-enabled>` | Enables (true) or disables (false) bloom on this astronomical object. | true
`<sky-bloom-exposure>` | Changes the exposure parameter on the bloom filter - the amount to multiply light by returned to the camera. | 1.0
`<sky-bloom-threshold>` | Changes the threshold parameter on the bloom filter - the minimum amount of intensity to enable bloom. | {sun: 0.98, moon: 0.55}
`<sky-bloom-strength>` | Changes the strength parameter on the bloom filter - how much to 'bloom' for selected pixels. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | Changes the radius parameter on the bloom filter - the distance for the bloom filter to spread over. | {sun: 1.0, moon: 1.4}

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

In addition to support for ground lighting, you can now directly control the intensities of the direct lighting and ambient lighting intensities. Changing the intensity of the sun or moon is easy, as you just use a multiple of the default value to set how much brighter or dimmer you want that astronomical body to be. You can also use the same method to amplify or dim ambient intensity to increase or decrease the amount of ambient lighting in the scene.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Let's make the sun twice as bright -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- But let's make the moon half as bright -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- But let's have ten times the amount of ambient lighting -->
      <sky-moon-intensity>10.0</sky-moon-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

You may also wish to control the floor or ceiling for the ambient lighting, to ensure that you always have a certain amount of light, or a maximum amount of light.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Let's brighten things up -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- But don't make it too much. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

At some point, you may wish to change the parameters for the bloom effects added to the sun or the moon in the sky. *a-starry-sky* makes use of the [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) from THREE.JS. The intensity for all astronomical objects are controlled separately with parent `<sky-sun-bloom>` and `<sky-moon-bloom>` tags respectively. The child tags for these control the features of the bloom.

Let's start by changing a few parameters

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Let's dim the sun down a bit -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- But let's also increase the intensity of the moon -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

But we can also disable the bloom entirely, which reduces the load on the GPU by just a little.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <sky-sun-bloom>
        <sky-bloom-enabled>false</sky-bloom-enabled>
      </sky-sun-bloom>
      <sky-moon-bloom>
        <sky-bloom-enabled>false</sky-bloom-enabled>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

The final element of the sky lighting you will likely want to change is the atmospheric perspective density. *a-starry-sky* comes with two different fog models according to your needs.
For lower-end systems, it supports the basic exponential atmospheric perspective, which gathers light over the entire sky on a web worker, and then applies it just like normal exponential fog. To control the density parameter of the exponential lighting, use the `<sky-atmospheric-perspective-density>` tag. Initial values are set high to provide noticeable atmospheric perspective, even in small scenes, so you might wish to reduce the value from it's default of *0.007*. Also make sure to set the current perspective type to *normal* in the `<sky-atmospheric-perspective-type>` tag.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- while the default is 0.007 the atmospheric perspective density is very
      tempermental to change so only small changes are needed. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

For higher end systems, however, you can simulate a Preetham based atmospheric shader that gives more variety to horizon colors instead of the constant colors used in the *normal* setting. The solution provided isn't an exact match for the Elok based sky lighting used for the sky due to limitations in *Three.js*'s fog shader, but it provides a solid improvement over the original atmospheric perspective. To enable the advanced lighting model, just enter in the value *advanced* into the `<sky-atmospheric-perspective-type>` tag. Similiar to `<sky-atmospheric-perspective-density>` you can multiply distance for the *advanced* lighting model by using the `<sky-atmospheric-perspective-distance-multiplier>` which multiplies all distances in the Preetham based model by the amount you provide. Initial values are set high to provide noticeable atmospheric perspective, even in small scenes, so you might wish to reduce the value from it's default of *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- while the default is 5.0 the atmospheric distance multiplier in the
      advanced model we can reduce this down if we want to 1.0 for a less dramatic effect. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Finally, you can disable all atmospheric perspective by setting the value in the `<sky-atmospheric-perspective-type>` tag to *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Turn off atmospheric perspective -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Enabling Aurora Borealis

*WARNING: Enabling Aurora Borealis will dramatically increase the computational weight of your sky, as the aurora shader provided uses a ray marching method to produce this beautiful natural phenomena.*

**Tag** | **Description**
:--- | :--- | :---
`<sky-aurora>` | Parent tag. Required for enabling Aurora Borealis. Contains all child tags related to the aurora. | N/A
:--- | :--- | :---
`<sky-atomic-oxygen-color>` | Triggered by excited atomic oxygen molecules located between 150 and 600 meters from the planetary surface, atomic oxygen typically causes a bright red curtain at the top of the aurora borealis and is typically seen in more extreme displays. This tag controls these colors using three child color tags *sky-aurora-color-red*, *sky-aurora-color-green* and *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` | Determines how much of the atomic oxygen aurora is likely to be present in the display. Lower numbers are associated with more aurora, with a maximum of 1.0 being associated with no aurora. | 0.12
`<sky-atomic-oxygen-intensity>` | Determines the brightness of this aurora segment, with typical values being less then 5. | 0.3
:--- | :--- | :---
`<sky-molecular-oxygen-color>` | Triggered by excited molecular oxygen molecules located between 100 and 250 meters from the planetary surface, molecular oxygen typically provides the iconic bright green associated with the aurora borealis and is typically seen in most displays. This tag controls these colors using three child color tags *sky-aurora-color-red*, *sky-aurora-color-green* and *sky-aurora-color-blue*, just in case you want a different color for your aurora. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` | Determines how much of the molecular oxygen aurora is likely to be present in the display. Lower numbers are associated with more aurora, with a maximum of 1.0 being associated with no aurora. | 0.02
`<sky-molecular-oxygen-intensity>` | Determines the brightness of this aurora segment, with typical values being less then 5. | 2.0
:--- | :--- | :---
`<sky-nitrogen-color>` | Triggered by excited nitrogen molecules located between 60 and 120 meters from the planetary surface, nitrogen typically provides a magenta curtain around the base of aurora borealis and is typically seen in more extreme displays. This tag controls these colors using three child color tags *sky-aurora-color-red*, *sky-aurora-color-green* and *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` | Determines how much of the nitrogen aurora is likely to be present in the display. Lower numbers are associated with more aurora, with a maximum of 1.0 being associated with no aurora. | 0.12
`<sky-nitrogen-intensity>` | Determines the brightness of this aurora segment, with typical values being less then 5. | 4.0
:--- | :--- | :---
`<sky-aurora-raymarch-steps>` | Number of steps that the ray-marcher takes per pixel. | 64 (steps)
`<sky-aurora-cutoff-distance>` | The distance after which the aurora no longer renders to help improve raymarching quality at the cost of not rendering clouds that are further away as SDF are not presently calculated for our noise generators. | 1000 (kilometers - approximate)
:--- | :--- | :---
`<sky-aurora-color-red>` | Used to describe **red** color channel changes to `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` and `<sky-atomic-oxygen-color>` tags. | N/A
`<sky-aurora-color-green>` | Used to describe **green** color channel changes to `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` and `<sky-atomic-oxygen-color>` tags. | N/A
`<sky-aurora-color-blue>` | Used to describe **blue** color channel changes to `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` and `<sky-atomic-oxygen-color>` tags. | N/A

Aurora Borealis provide some of the most beautiful backgrounds in nature. Typically existing near the north and south poles, these sky phenomena represent the interaction of high velocity particles from the sun as they are pulled into the Earth's magnetosphere and interact with various atoms and molecules. These excited molecules then radiate light in the visible spectrum, result in beautiful mesmerizing curtains that 'dance' in the night sky.

Adding aurora borealis to your sky is relatively easy, but it is not enabled by default. *You must add the `<sky-aurora>` tag for aurora borealis to be enabled.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- You don't require any additional parameters to get the default setup -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Each of the different atomic and molecular aurora are controllable by the code above allowing you to customize your aurora displays and even change the colors that are emitted (realistic or not). For instance, if you wanted a cold blue aurora, covering the entire molecular oxygen range, you could do so with the following code.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-molecular-oxygen-cutoff>0.0</<sky-atomic-oxygen-cutoff>
      <sky-molecular-oxygen-intensity>5.0</<sky-atomic-oxygen-cutoff>
      <sky-molecular-oxygen-color>
        <sky-aurora-color-red>0.0</sky-aurora-color-red>
        <sky-aurora-color-green>0.0</sky-aurora-color-gree>
        <sky-aurora-color-blue>255</sky-aurora-color-blue>
      </sky-molecular-oxygen-color>
      <sky-nitrogen-intensity>0.0</<sky-atomic-oxygen-cutoff>
      <sky-atomic-oxygen-intensity>0.0</<sky-atomic-oxygen-cutoff>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

On the other hand, if you only want a light amount of green aurora, you could go for a slightly more subtle effect with the following code.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-molecular-oxygen-cutoff>0.2</<sky-molecular-oxygen-cutoff>
      <sky-molecular-oxygen-intensity>1.5</<sky-molecular-oxygen-cutoff>
      <sky-atomic-oxygen-intensity>0.0</<sky-atomic-oxygen-cutoff>
      <sky-nitrogen-intensity>0.0</<sky-nitrogen-cutoff>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

In addition to changing the colors of the sky, you can also change the number of steps taken by the raymarcher when rendering the sky. The more steps you take, the better the sky will look, but the more of a load you will put on your GPU. Therefore, a balance is needed between performance and quality. By default, the shader uses 64 steps when raymarching the volume. To increase this, you can do the following

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</<sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Enabling Clouds

*WARNING: Enabling clouds will dramatically increase the computational weight of your sky, as the cloud shader provided uses a ray marching method to produce this beautiful natural phenomena.*

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-clouds>` | Parent tag. Contains all child tags related to clouds. Required for enabling Clouds. Contains all child tags related to clouds in the sky. | N/A
`<sky-cloud-coverage>` | Roughly correlates to the amount of the sky covered in clouds. | 50 (percent)
`<sky-cloud-start-height>` | The height, in meters, at which clouds start to form. | 1000 (meters)
`<sky-cloud-end-height>` | The height, in meters at which clouds stop forming. | 2500 (meters)
`<sky-cloud-fade-out-start-percent>` | Cloud coverage starts to *fade out* towards zero at this *percent* of height of the cloud. | 80 (percent)
`<sky-cloud-fade-in-end-percent>` | Cloud coverage starts to *fade in* towards 100% at this *percent* of height of the cloud. | 20 (percent)
`<sky-cloud-velocity-x>` | The x-component of the velocity of the clouds. Clouds will move with your position, but this will cause them to move overhead on their own. | 0 (m/s)
`<sky-cloud-velocity-y>` | The y-component (or actually z) of the velocity of the clouds. Clouds will move with your position, but this will cause them to move overhead on their own. | 0 (m/s)
`<sky-cloud-start-seed>` | Random seed used to set the current cloud noise overhead, if not set, it defaults to a variation on the current date time timestamp. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` | The number of ray-march steps used to provide the cloud color. | 64 (steps)
`<sky-cloud-cutoff-distance>` | The distance after which the clouds no longer render to help improve raymarching quality at the cost of not rendering clouds that are further away as SDF are not presently calculated for our noise generators. | 40000 (meters - approximate)



## Setting The Asset Directories

**Tag** | **Description**
:--- | :---
`<sky-assets-dir>` | Parent tag. Contains all child tags related to asset locations. Can contain *dir*, *texture-path*, *moon-path*, *star-path* and *wasm-path* attributes to guide the system to entire groups of data at a time.
`<sky-aurora-maps>` | Defines the location of the aurora caustic textures used to create the basic aurora borealis curtains.
`<sky-moon-diffuse-map>` | Defines a moon diffuse map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-normal-map>` | Defines a moon normal map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-roughness-map>` | Defines a moon roughness map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-aperture-size-map>` | Defines a moon aperture size map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-aperture-orientation-map>` | Defines a moon aperture orientation map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-blue-noise-maps>` | Defines the location the tiling blue noise maps which are used to provide temporal dithering to eliminate banding.
`<sky-solar-eclipse-map>` | Defines the location of the solar eclipse texture used to provide the corona on the solar eclipse during a total solar eclipse.
`<sky-star-cubemap-maps>` | Defines the location of all sky cubemap LUT keys that are used to find the stars in the sky.
`<sky-dim-star-maps>` | Defines the location of all dim star LUTs used to show all the dim stars in the sky.
`<sky-med-star-maps>` | Defines the location of all medium star LUTs used to show all the dim stars in the sky.
`<sky-bright-star-maps>` | Defines the location of all bright star LUTs used to show all the dim stars in the sky.
`<sky-star-color-map>` | Defines the location of the star color LUT, which is used to provide the correct colors to stars based on their temperature.

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
