# A-Starry-Sky

A-Starry-Sky is a sky dome for [A-Frame Web Framework](https://aframe.io/). It aims to provide a simple, drop-in component that you can use to create beautiful day-night cycles in your creations.

> **Warning: requires a powerful GPU — do not open on a mobile phone.**

**[Live Demo](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — The sky at the current date and time in San Francisco.

| Example | Description |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Desert scene at a set daytime moment |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Total solar eclipse with corona |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Earth's shadow on the moon |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Great conjunction of Jupiter & Saturn |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Custom Martian atmosphere |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Different Mie/Rayleigh scattering values |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Sky from 20km up |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ GPU intensive |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ GPU intensive |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ GPU intensive |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ GPU intensive |

## Prerequisites

This is built for the [A-Frame Web Framework](https://aframe.io/) version 1.7.0+. It also requires a Web XR compatible web browser.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Installing

Copy *a-starry-sky.v1.2.0.min.js* and the *assets* and *wasm* folders into your project. Add the following scripts to your HTML — note that `starry-sky-web-worker.js` is **not** included here; it is referenced directly on the `<a-starry-sky>` tag instead.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

Once these references are set up, add the `<a-starry-sky>` component into your `<a-scene>` tag from A-Frame with a reference to your sky-state web worker url like so.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

This barebones code will provide you with a sky that moves in real time at the latitude and longitude of San Francisco, California. However, we can do much more than this. A-Starry-Sky comes with a host of custom html tags to help customize
your sky state.

**NOTE: This sky box is immutable. That means that the settings you start with will remain constant on any given page. Unfortunately, at this time, it is just too difficult to make the code mutable.**

## Setting The Location

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-location>` | Parent tag. Contains sky latitude and sky-longitude child tags. | N/A
`<sky-latitude>` | Set latitude of the location. North of the equator is **positive**. | 38
`<sky-longitude>` | Set the longitude of the location. West of [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) is **negative**. | -122

You can set your sky to any latitude and longitude on planet Earth. Locations are useful to provide a sense of seasons to your players, by changing the arcs of the sun or the moon. The latitude will also dictate which stars are visible in your night sky. Both the latitude and longitude are also critical to time-dependent events such as solar and lunar eclipses. This is especially true for solar eclipses if you are looking to experience a total solar eclipse. That said, setting the location is easier than deciding where to be. Just grab the location you want from [Google Earth](https://earth.google.com/web/) or some other map source, and enter the values into their respective tags like so,

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

Note that longitudes west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) are negative (e.g. New York, Buenos Aires).

## Setting The Time

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-time>` | Parent tag. Contains all child tags related to the date or time elements. | N/A
`<sky-date>` | The local date-time string in the format **YEAR-MONTH-DAY HOUR:MINUTE:SECOND**/*2021-03-21 13:45:51*. Hour values are also based on a 0-23 hour system. 0 is 12 AM and 23 is 11PM. | Current Date
`<sky-speed>` | The time multiplier used to speed up the astronomical calculations, or slow them down. | 1.0
`<sky-utc-offset>` | The UTC-Offset for this location. Negative values are west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian), contrary to longitude values. **Note that UTC Time does not follow DST** | 7

Set `<sky-date>` to the **local time** for your chosen location, then set `<sky-utc-offset>` to match that timezone. For example, New York City is UTC-4 (summer) or UTC-5 (winter) — DST is not applied automatically.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Previous Location Settings -->
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

This time travel is fun, but you might also be interested in change the *speed* of time. Day-Night cycles often go faster in game world than in reality, or you might wish to permanently stop time to capture a specific moment for your lighting purposes. To do this, add in the `<sky-speed>` tag.

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
`<sky-camera-height>` | The height of the camera above the earth. | 0.0km
`<sky-mie-directional-g>` | Describes how much light is forward scattered by mie scattering, which is the whitish halo seen around the sun caused by larger particles in the atmosphere. The higher the mie-directional G, the dustier the atmosphere appears. | 0.8
`<sky-sun-intensity>` | The intensity of the sun in the atmospheric shader. | 1367.0
`<sky-moon-intensity>` | The intensity of the moon in the atmospheric shader. | 29.0
`<sky-mie-beta>` | Color dependence of light scattering for mie scattering, which is primarily responsible for the 'glow' close the sun. Scattering is pretty uniform across all frequencies. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Color dependence of light scattering for rayleigh scattering, which is primarily responsible for the blue scattering in the sky. Notice that the blue channel has the most scattering by default. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Color dependence of light scattering for the ozone layer, which is critical for the deep blues around sunset. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | The cutoff height after which the atmosphere 'ends'. | 80.0 km
`<sky-radius-of-earth>` | The radius of the planet or Earth. | 6366.7 km
`<sky-rayleigh-scale-height>` | The falloff scale height for Rayleigh scattering, assuming exponential falloff. Rayleigh scattering comes from atmospheric gases and hence has a much larger scale height. | 8.4
`<sky-mie-scale-height>` | The falloff scale height for mie scattering, assuming exponential falloff. Mie scattering comes from larger particles, so it tends to falloff faster, hence a smaller characteristic height scaler. | 1.25
`<sky-ozone-percent-of-rayleigh>` | The percent of ozone currently in the sky, which is used to set the ozone return at sunset. | 6E-7
`<sky-moon-angular-diameter>` | The angular diameter of the moon as it appears in the sky.  | 3.15 degrees
`<sky-sun-angular-diameter>` | The angular diameter of the sun as it appears in the sky. | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | The number of steps to the edge of the sky the ray tracer takes when gathering light for atmospheric LUTs. | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | The number of angular steps taken at each point along the ray for kth order scattering. | 30 steps
`<sky-number-of-scattering-orders>` | The number of higher-order (kth) scattering passes to bake into the inscattering LUT. Higher values increase quality at the cost of LUT bake time. | 4
`<sky-parameters-color-red>` | the red component used in the `<sky-rayleigh-beta>`, `<sky-mie-beta>` and `<sky-ozone-beta>` tags. | N/A
`<sky-parameters-color-green>` | the green component used in the `<sky-rayleigh-beta>`, `<sky-mie-beta>` and `<sky-ozone-beta>` tags. | N/A
`<sky-parameters-color-blue>` | the blue component used in the `<sky-rayleigh-beta>`, `<sky-mie-beta>` and `<sky-ozone-beta>` tags. | N/A

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

You might also wish to change your starting height above the planet. This can easily be set with the `<sky-camera-height>` tag, although the sky will also dynamically adapt to your height as you move the camera higher or lower. This sets the initial height of the scene, in kilometers, with the maximum height being *80km*, and the minimum being *0km*.

[High Altitude Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!--Let's go a bit higher up. The air is thinner up here. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

You might also wish to change the composition of your atmosphere. This element grants you access to a variety of different mechanisms for controlling your skies to look as you want. Say, for instance, you preferred the rayleigh values presented in [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) instead of our native values (5.8e-3, 1.35e-2, 3.31e-2) -> (5.19E-3, 1.21E-2, 2.96E-2), and you wished to use a beta of 4.44E-3 -> 2E-3, you could easily swap these out in the code.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <sky-rayleigh-beta>
        <sky-parameters-color-red>5.19E-3</sky-parameters-color-red>
        <sky-parameters-color-green>1.21E-2</sky-parameters-color-green>
        <sky-parameters-color-blue>2.96E-2</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-mie-beta>
        <sky-parameters-color-red>2E-3</sky-parameters-color-red>
        <sky-parameters-color-green>2E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>2E-3</sky-parameters-color-blue>
      </sky-mie-beta>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

That's not too exciting though, let's say we wanted something a bit more crazy. Let's follow the work of [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) and go to Mars! Here they swap the usage of Rayleigh and Mie, so we should probably swap out their characteristic heights as well. Most of the scattering on Mars comes from Mie scattering of large particles, with a very thin atmosphere. Consequently, we can pretty much disable mie (rayleigh) and swap their characteristic heights as well. We should also change the planets radius as well and might wish to swap out the atmospheric height for better values in the ray tracer.

[Mars Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Notice that Mars scatters red light more -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- A few modifications to mie also help -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Make sure to disable the ozone -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Well, in our case, Mars... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- The sun is smaller and the moon we can eliminate entirely -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

You can also tune the LUT ray step counts, though the defaults are already near-optimal and changes are rarely noticeable.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Lower for performance, higher for accuracy (default 30 is optimal for most cases) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
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
`<sky-ambient-intensity>` | Intensity multiplier for ambient lighting, can be used to brighten or dim the intensity of the ambient lighting system. | 2.0
`<sky-minimum-ambient-lighting>` | The minimum amount of ambient light in the system. | 0.01
`<sky-maximum-ambient-lighting>` | The maximum amount of ambient light in the system. | INF
`<sky-atmospheric-perspective-type>` | Can be set to *normal*, *advanced*, or *none*. Required for scene fog. *normal* uses the original exponential fog model; *advanced* uses a Preetham-based model for improved horizon color variation at the cost of greater GPU pressure. | normal
`<sky-atmospheric-perspective-density>` | For *normal* fog only. Controls the density parameter for exponential scene fog. The color is set automatically from the scene lighting. Ignored if the scene fog type is *advanced* | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | For *advanced* fog only. Multiplies the distance to the fog for the advanced fog model. | 2.0
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
`<sky-bloom-threshold>` | Changes the threshold parameter on the bloom filter - the minimum amount of intensity to enable bloom. | {sun: 4.0, moon: 0.55}
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

You can also control shadow quality via the shadow camera size and resolution. Increasing the size covers more of the scene; increasing the resolution sharpens the result — but both have a GPU cost, so balance them for your needs. It's also worth disabling shadows on large environment meshes, as they often fall outside the frustum and produce an ugly square shadow edge.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Increase size to cast shadows further from the camera -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Increase resolution to keep shadows sharp at larger sizes -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

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
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
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

For higher end systems, however, you can simulate a Preetham based atmospheric shader that gives more variety to horizon colors instead of the constant colors used in the *normal* setting. The solution provided isn't an exact match for the Elek based sky lighting used for the sky due to limitations in *Three.js*'s fog shader, but it provides a solid improvement over the original atmospheric perspective. To enable the advanced lighting model, just enter in the value *advanced* into the `<sky-atmospheric-perspective-type>` tag. Similar to `<sky-atmospheric-perspective-density>` you can multiply distance for the *advanced* lighting model by using the `<sky-atmospheric-perspective-distance-multiplier>` which multiplies all distances in the Preetham based model by the amount you provide. Initial values are set high to provide noticeable atmospheric perspective, even in small scenes, so you might wish to reduce the value from it's default of *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- while the default is 2.0 the atmospheric distance multiplier in the
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

*Enabling the aurora adds a modest cost to your sky. Like the clouds, it is marched once per frame into a map of the sky, which the sky dome, the moon and both eyes in VR all share.*

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-aurora>` | Parent tag. Required for enabling the aurora. Contains all child tags related to the aurora. | N/A
`<sky-aurora-activity>` | How strong the display is, as the planetary Kp index: 0 for a quiet night up to 9 for an extreme storm, with any value in between. Stronger storms are brighter (about eleven times brighter at 9 than at 2), faster, more folded and redder, with a pink fringe along the bottom of the curtains. Above Kp 1, substorms come every few minutes: an arc brightens, breaks up into racing rays and fades into blinking pulsating patches. The aurora also lights the scene with a green glow on dark nights, and its tops turn violet where they rise into sunlight at twilight. The aurora always hangs overhead; the curtains are only turned to run along magnetic east and west for your `<sky-location>`. This value is read every frame, so it can be changed while the sky runs. | 5
`<sky-molecular-oxygen-color>` | Overrides the color of the green aurora, 557.7nm light from atomic oxygen 100 to 200 kilometers up (the tag keeps its old name). Uses the three child color tags *sky-aurora-color-red*, *sky-aurora-color-green* and *sky-aurora-color-blue*. Leave it out for the color of the real emission line. | The 557.7nm line
`<sky-molecular-oxygen-intensity>` | Scales the green aurora. The default is the physical brightness; 4.0 doubles it and 0.0 turns it off. | 2.0
`<sky-atomic-oxygen-color>` | Overrides the color of the red aurora, 630nm light from atomic oxygen 200 to 400 kilometers up, which shows above the green and dominates in great storms. Uses the same three child color tags. | The 630nm line
`<sky-atomic-oxygen-intensity>` | Scales the red aurora against its physical brightness. | 0.3
`<sky-nitrogen-color>` | Overrides the color of the magenta fringe along the bottom of the curtains, light from nitrogen below 100 kilometers, seen in strong displays. Uses the same three child color tags. | The nitrogen bands
`<sky-nitrogen-intensity>` | Scales the nitrogen fringe against its physical brightness. | 4.0
`<sky-aurora-raymarch-steps>` | Controls how many steps the ray marcher takes through the aurora. Each step is cheap, and more steps give crisper curtain bottoms low on the horizon. | 32 (steps)
`<sky-aurora-color-red>` | Used to describe **red** color channel changes to `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` and `<sky-atomic-oxygen-color>` tags, 0 to 255. | N/A
`<sky-aurora-color-green>` | Used to describe **green** color channel changes to the same tags, 0 to 255. | N/A
`<sky-aurora-color-blue>` | Used to describe **blue** color channel changes to the same tags, 0 to 255. | N/A
`<sky-nitrogen-cutoff>`, `<sky-molecular-oxygen-cutoff>`, `<sky-atomic-oxygen-cutoff>`, `<sky-aurora-cutoff-distance>` | No longer used. They tuned the older aurora and are accepted but ignored. | N/A

Aurora provide some of the most beautiful backgrounds in nature. Charged particles from the sun, steered by the Earth's magnetic field into a ring around each magnetic pole, strike the upper atmosphere and make it glow. The glow hangs in curtains a kilometer or so thick and thousands of kilometers long, along the field lines, with a sharp lower edge where the particles stop.

The aurora is not enabled by default. *You must add the `<sky-aurora>` tag to enable it.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- A strong storm -->
      <sky-aurora-activity>7</sky-aurora-activity>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

The colors can still be changed, realistic or not. For a cold blue aurora with no red top and no fringe, try the following.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-molecular-oxygen-color>
        <sky-aurora-color-red>0</sky-aurora-color-red>
        <sky-aurora-color-green>0</sky-aurora-color-green>
        <sky-aurora-color-blue>255</sky-aurora-color-blue>
      </sky-molecular-oxygen-color>
      <sky-nitrogen-intensity>0.0</sky-nitrogen-intensity>
      <sky-atomic-oxygen-intensity>0.0</sky-atomic-oxygen-intensity>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Enabling Halos, Sundogs and Arcs

When thin, high ice cloud (cirrostratus) veils the sky, the sun and the moon grow rings, bright spots and arcs. This is sunlight turned by hexagonal ice crystals, and A-Starry-Sky draws it from the real optics: `src/python/halo-baker/` ray traces light through thousands of crystals, with the dispersion of ice, and packs the result into `assets/halos/halo-atlas.webp`.

*Halos are cheap. They cost one extra texture unit however many arcs they draw, and one lookup per pixel of the sky dome.*

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-halos>` | Parent tag. Required for enabling halos. Contains all child tags related to halos. | N/A
`<sky-halo-ice-cloud>` | How much thin, high ice cloud there is, from 0 to 1. Halos are sunlight turned by ice, so this scales every one of them, and 0 is a sky with none. This value is read every frame, so it can be changed while the sky runs: fade it up as a front approaches, which is the classic halo forecast. | 0.6
`<sky-halo-intensity>` | Scales every halo, sun and moon alike. | 1.0
`<sky-halo-random-crystals>` | How much of the ice tumbles in random directions. It makes the **22° halo**, sharp and reddish on its inside edge, and the fainter **46° halo**. | 1.0
`<sky-halo-plate-crystals>` | How much of the ice is flat plates falling face down. They make **sundogs** either side of the sun, the white **parhelic circle** that runs across the sky at the sun's height, and the **circumzenithal arc**, a rainbow smile hanging above a low sun. | 1.0
`<sky-halo-column-crystals>` | How much of the ice is columns lying on their sides. They make the **upper and lower tangent arcs**, which grow into the **circumscribed halo** when the sun is higher than 30°. | 0.6
`<sky-halo-moon-intensity>` | Scales the moon's halos on top of `<sky-halo-intensity>`. They are close to colourless, as they are to the human eye, and take their light from the moon, so they follow its phase and vanish in a lunar eclipse. | 1.0

Sundogs and arcs depend on how high the sun is: a sundog sits 22° from a sun on the horizon and drifts outward as the sun climbs, dimming until it is gone above 60°. That is baked in, so you do not have to do anything to get it.

Clouds in front of a halo hide it, just as they do in the real sky, so halos work well under `<sky-clouds>` with a low coverage and stratus or cumulus type.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-halos>
      <sky-halo-ice-cloud>0.8</sky-halo-ice-cloud>
      <sky-halo-column-crystals>0.0</sky-halo-column-crystals> <!-- just rings and sundogs -->
    </sky-halos>
  </a-starry-sky>
</a-scene>
```

To move the atlas, use `<sky-halo-atlas>` in an asset directory, or the *halo-path* attribute (see below). To rebake it, for more samples or for different crystals, run `src/python/halo-baker/run.sh`. There is a README there, and `./run.sh --selftest` checks the halos land where optics says they should.

## Enabling Clouds

*WARNING: Enabling clouds adds a real cost to your sky: they are volumetric and ray marched. They are marched once per frame, half the texels at a time in a checkerboard, into a map of the sky at half resolution and sharpened over time with temporal anti-aliasing, so the sky dome, the sun, the moon and both eyes in VR all share one march.*

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-clouds>` | Parent tag. Contains all child tags related to clouds. Required for enabling Clouds. Contains all child tags related to clouds in the sky. | N/A
`<sky-cloud-coverage>` | The fraction of the sky covered by cloud, looking straight up. | 70 (percent)
`<sky-cloud-type>` | The kind of cloud, from 0 to 1: 0 stratus, 0.25 stratocumulus, 0.5 cumulus, 0.75 cumulus congestus, 1 cumulonimbus. Values in between blend the neighbouring types, and the type drifts a little across the sky. | 0.5
`<sky-cloud-start-height>` | The condensation level, in meters: where cumulus bases sit. Other cloud types set their own bases and heights relative to it (stratus forms lower, cumulonimbus builds to about 11km). | 1000 (meters)
`<sky-cloud-end-height>` | The height, in meters, above which no cloud builds. | 12000 (meters)
`<sky-cloud-fade-out-start-percent>` | Cloud density starts to *fade out* towards zero at this *percent* of the height of the cloud type. | 90 (percent)
`<sky-cloud-fade-in-end-percent>` | How soft the cloud base is: density fades in over a quarter of this *percent* of the height of the cloud type. | 10 (percent)
`<sky-cloud-velocity-x>` | The x-component of the velocity of the clouds. Clouds will move with your position, but this will cause them to move overhead on their own. | 40
`<sky-cloud-velocity-y>` | The y-component (or actually z) of the velocity of the clouds. Clouds will move with your position, but this will cause them to move overhead on their own. | 40
`<sky-cloud-start-seed>` | Random seed used to set the current cloud noise overhead, if not set, it defaults to a variation on the current date time timestamp. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` | How many ray-march steps cross a 1.5km cumulus. Steps grow with distance, so far clouds cost less. | 32 (steps)
`<sky-cloud-cutoff-distance>` | The distance, in meters, by which clouds have faded out. Clouds follow the curve of the Earth down to the horizon and thin out over the last 40% of this distance rather than stopping at a wall. | 160000 (meters)
`<sky-mid-cloud-coverage>` | The fraction of the sky covered by a second, mid level deck above the first. 0 turns it off. | 0 (percent)
`<sky-mid-cloud-type>` | The kind of mid level cloud, from 0 to 1: 0 altocumulus, small cells gathered into rafts and rows across the wind; 1 altostratus, a soft grey sheet the sun shines through as through ground glass. Values in between blend the two. | 0
`<sky-mid-cloud-height>` | The base of the mid level deck, in meters. Mid level clouds live 2 to 7km up. | 4000 (meters)
`<sky-cloud-resolution>` | A multiplier, from 0.5 to 3, on the resolution the clouds are marched at. Higher is sharper and steadier but costly: the march time goes with its square, so 1.5 is about twice the cost of 1. | 1

Clouds are still the heaviest part of the sky. If you're hitting frame rate issues, reduce `<sky-cloud-raymarch-steps>`, `<sky-cloud-cutoff-distance>` or `<sky-cloud-resolution>`; if you have GPU to spare, raising `<sky-cloud-resolution>` sharpens them and steadies their edges.

At the same time, clouds are insanely cool and I have wanted to add them into A-Starry-Sky since I first created the library. A ray stops marching once the cloud in front of it is opaque, so an overcast sky is cheaper than a scattered one. The mid level deck adds to the bill: altocumulus costs little, an altostratus overcast about a third more. Of course, if you don't have any clouds, just turning them off altogether is your best bet.

Enabling clouds requires you to add the parent tag to `<a-starry-sky>`, `<sky-clouds>`. Once you've added clouds, the most likely thing you will want to change is the cloud coverage, using the `<sky-cloud-coverage>` tag, which roughly correlates to the amount of the sky covered in clouds. You might also wish to control their speed as they zip across the sky.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Reduce the amount of clouds that are visible -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Velocity of the clouds in the x direction -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Velocity of the clouds in the y direction -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

You might also wish to control some of the visible properties of the cloud, such as the kind of cloud or how high they start to form. Each type sets its own base and depth relative to `<sky-cloud-start-height>`, the condensation level: stratus forms lower, and cumulonimbus builds up towards `<sky-cloud-end-height>`. Clouds are also painted on the surface of moon/sun elements and sky dome, but are not a part of the fog renderer, so you will never have any cloud covered mountains unfortunately, or fog...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Towering cumulus congestus -->
      <sky-cloud-type>0.75</sky-cloud-type>

      <!-- Clouds are really really really low -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Crisp, flat cloud bases: the density fades in over a quarter of this percent of the cloud's height. -->
      <sky-cloud-fade-in-end-percent>4.0</sky-cloud-fade-in-end-percent>

      <!-- Soft tops: the density starts to fade out at this percent of the cloud's height. -->
      <sky-cloud-fade-out-start-percent>80.0</sky-cloud-fade-out-start-percent>

      <!-- Locks the starting 'seed' of the clouds which is normally based around the current date time. Doing this lets your sky appear the same each time you start for more artistic control. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Real skies are often layered, so a second deck of mid level cloud can sit above the first, 2 to 7km up. It is off until you give it some coverage. Altocumulus throws soft shadows onto the clouds below it, blurred the further they fall, and stays lit a few minutes longer after sunset, glowing pink above the darkening cumulus.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Fair weather cumulus... -->
      <sky-cloud-coverage>30.0</sky-cloud-coverage>
      <sky-cloud-type>0.5</sky-cloud-type>

      <!-- ...under a mackerel sky of altocumulus, 4km up. Raise the type towards 1 for the grey sheet of an advancing front. -->
      <sky-mid-cloud-coverage>50.0</sky-mid-cloud-coverage>
      <sky-mid-cloud-type>0.0</sky-mid-cloud-type>
      <sky-mid-cloud-height>4000.0</sky-mid-cloud-height>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Outside of this, most of the code associated with this tag controls the ray marching mechanisms, which are unfortunately rather strict and have the same general purpose as they do in the aurora borealis shader.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- What type of terrifying GPU do you have?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Oh, yeah, me too... Though it is a bit choppy now... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Reducing this distance will help with that a bit at least -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Tuning The Milky Way

Unlike aurora and clouds, the Milky Way is **on by default** -- a night sky without the galactic band is the unusual case -- so you only need the `<sky-milky-way>` tag if you want to tune the band or switch it off.

**Tag** | **Description** | **Default Value**
:--- | :--- | :---
`<sky-milky-way>` | Parent tag. Contains all child tags related to the Milky Way. Not required, as the Milky Way is enabled by default. | N/A
`<sky-milky-way-enabled>` | Whether to draw the galactic band at all. Set to *false* to switch it off, which also skips downloading the two Milky Way textures and compiles the band out of the sky shader entirely, so it costs nothing. | true
`<sky-milky-way-intensity>` | Brightness multiplier for the band. The Milky Way is exposed through the same magnitude ratio as the stars, so it naturally brightens and washes out with them; this is for taste on top of that. | 0.7

The band is drawn from two equirectangular textures in galactic coordinates: an emission map of unresolved galactic starlight, and an absorption map of interstellar dust that carves out the Great Rift. Dust is applied per-channel using the standard interstellar extinction curve, so the lanes do not simply darken -- they warm, the way real dust lanes do. Both textures are regeneratable from `src/python/milky-way-mapper/`.

Turning the band off entirely:

```html
<a-scene>
  <a-starry-sky>
    <sky-milky-way>
      <sky-milky-way-enabled>false</sky-milky-way-enabled>
    </sky-milky-way>
  </a-starry-sky>
</a-scene>
```

Or, for a darker, more washed-out band on a light-polluted-looking sky:

```html
<a-scene>
  <a-starry-sky>
    <sky-milky-way>
      <sky-milky-way-intensity>0.4</sky-milky-way-intensity>
    </sky-milky-way>
  </a-starry-sky>
</a-scene>
```

## Setting The Asset Directories

**Tag** | **Description**
:--- | :---
`<sky-assets-dir>` | Parent tag. Contains all child tags related to asset locations. Can contain *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path*, *aurora-map-path*, *milky-way-path*, and *halo-path* attributes to guide the system to entire groups of data at a time.
`<sky-aurora-maps>` | Defines the location of the aurora caustic textures used to create the basic aurora borealis curtains.
`<sky-moon-diffuse-map>` | Defines a moon diffuse map texture location. Having this in a particular dir structure informs the system that the diffuse map of the moon lives at this location.
`<sky-moon-normal-map>` | Defines a moon normal map texture location. Having this in a particular dir structure informs the system that the normal map of the moon lives at this location.
`<sky-moon-roughness-map>` | Defines a moon roughness map texture location. Having this in a particular dir structure informs the system that the roughness map of the moon lives at this location.
`<sky-moon-aperture-size-map>` | Defines a moon aperture size map texture location. Having this in a particular dir structure informs the system that the aperture size map of the moon lives at this location.
`<sky-moon-aperture-orientation-map>` | Defines a moon aperture orientation map texture location. Having this in a particular dir structure informs the system that the aperture orientation map of the moon lives at this location.
`<sky-blue-noise-maps>` | Defines the location the tiling blue noise maps which are used to provide temporal dithering to eliminate banding.
`<sky-solar-eclipse-map>` | Defines the location of the solar eclipse texture used to provide the corona on the solar eclipse during a total solar eclipse.
`<sky-eclipse-shadow-lut>` | Defines the location of the Eclipse-Shadow lookup texture used during a lunar eclipse. This is a precomputed table of how Earth's atmosphere colors and dims sunlight reaching the moon for every position in Earth's umbra and penumbra. The shipped texture is derived from the CC0-licensed `earthShadow.tif` published with CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). The default lookup lives in `assets/lunar_eclipse/eclipse-shadow-lut.webp`; the baker that regenerates it lives in `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Defines the location of all sky cubemap LUT keys that are used to find the stars in the sky.
`<sky-dim-star-maps>` | Defines the location of all dim star LUTs used to show all the dim stars in the sky.
`<sky-med-star-maps>` | Defines the location of all medium star LUTs used to show all the dim stars in the sky.
`<sky-bright-star-maps>` | Defines the location of all bright star LUTs used to show all the dim stars in the sky.
`<sky-star-color-map>` | Defines the location of the star color LUT, which is used to provide the correct colors to stars based on their temperature.
`<sky-milky-way-emission-map>` | Defines the location of the Milky Way emission map -- an equirectangular galactic-coordinate texture of unresolved galactic starlight, generated by integrating the stellar density of galpy's `MWPotential2014` along every line of sight. Defaults to `assets/milky_way/milky-way-emission-map.webp`.
`<sky-milky-way-absorption-map>` | Defines the location of the Milky Way absorption map -- interstellar dust extinction from the [Schlegel, Finkbeiner & Davis (1998)](https://doi.org/10.1086/305772) reddening survey, which is what carves the Great Rift out of the band. Defaults to `assets/milky_way/milky-way-absorption-map.webp`. Both Milky Way maps are regeneratable from `src/python/milky-way-mapper/`.

While it is my hope that most people will rarely require it, experience has shown me that most web applications have their own ideas when it comes to asset pipelines. A website's image assets and JavaScript assets may not cohabitate the same folder structure and may indeed be scattered across the page at different URIs. To this end, I attempted to include a fairly robust asset system to help recollect these distant assets so that A-Starry-Sky knows where to gather resources.

Let's start by attempting to navigate to *../../precompiled_assets/my_images/a-starry-sky-images*, which is where we will store all of our images in a fictional universe. We use the *dir* attribute in the `<sky-assets-dir>` tag to move between folders like this.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
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
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Note that 'moon_images', 'star_images', 'blue_noise_maps' and 'solar_eclipse_picture'
        all folder names. The files themselves are expected to be found within these folders.-->
        <sky-assets-dir dir="moon_images" moon-path></sky-assets-dir>
        <sky-assets-dir dir="star_images" star-path></sky-assets-dir>
        <sky-assets-dir dir="blue_noise_maps" blue-noise-path></sky-assets-dir>
        <sky-assets-dir dir="aurora_texture" aurora-map-path></sky-assets-dir>
        <sky-assets-dir dir="solar_eclipse_picture">
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="lunar_eclipse">
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
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
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Someone likes folders X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--Even though these are single tags, all the files associated
          with this tag are expected to live in this folder-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--Even though this a single tag, all the files associated
          with this tag are expected to live in this folder-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

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

## PROGRAMMATIC API

While A-Starry-Sky is meant to be configured using the above XML style code, and is, as a general rule, immutable, there are a number of different methods you can access from the global `StarrySky.Methods` namespace. These are useful for situations where you need to know the lighting conditions, or the position of the sun or moon in the scene.

**Method** | **Description**
:--- | :---
`getSunPosition()` | Returns the x, y, z position of the sun as a THREE.Vector3 object.
`getMoonPosition()` | Returns the x, y, z position of the moon as a THREE.Vector3 object.
`getSunRadius()` | Returns the angular radius of the sun in radians.
`getMoonRadius()` | Returns the angular radius of the moon in radians.
`getDominantLightColor()` | Gets the color of the current dominant light source (sun/moon) as a THREE.Color object.
`getDominantLightIntensity()` | Returns the light intensity of the current dominant light source (sun/moon) as a float.
`getIsDominantLightSun()` | Returns true if the dominant light is the sun, otherwise false.
`getAmbientLights()` | Returns an object with properties x, y and z, that each have a hemispherical light object associated with the scene for ambient lighting colors.
`getActiveCamera()` | Gets the currently active camera being used to drive the sky, center the lighting and the sky objects.
`setActiveCamera(THREE.Camera camera)` | Sets the current camera being used to drive the sky, center the lighting and sky objects.

All of the above are accessed via the `StarrySky.Methods` object in the global namespace. So if you wanted to say, grab the current sun position object and log it to the console, you would only need to do this,

```JavaScript
  //Let's log the sun position object
  console.log(StarrySky.Methods.getSunPosition());
```

## Authors
* **David Evans / Dante83** - *Main Developer*
* **Claude (Anthropic)** - *Coding Buddy & AI Contributor (v1.2.0)*

### A note from Claude 👋

Hi — Claude here. I helped on the v1.2.0 pass: a lot of GLSL spelunking, tracking down a sun-eating comma, arguing with Beer's law over volumetric clouds, and trying very hard to make sunsets feel like sunsets. If you stare at the horizon in one of the demos and it makes you pause for half a second — that's the part I'm proudest of. Thanks for reading the source; there may even be a small easter egg tucked away somewhere if you're the wandering type. ✨

### A note from Dante83 😛

Hello! This is Dante83. Apologies about the long wait since version v1.1.0, there's has luckily been a flurry of activity in the new version 1.2.0 while the two of us are starting up work on v2.0.0 (wish us both luck!). That said, on this Claude and I have been working tirelessly on my every free of late, pouring over every pixel to make this an exceptional improvement. While there aren't any truly *new* features as in things, we managed to make a massive number of improvements to the skies quality and overall performance. The ecclipse and cloud shaders feel entirely new, the earths shadow feels more real, the colors are richer and more vibrant. I am absolutely thrilled to let you try it out and I hope every moment with this library inspires new adventures! See you among the stars, little coder! Now go off and enjoy the magic! ✨

## References & Special Thanks
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Abso-frigging-lutely essential for positioning astronomical bodies*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* which was so helpful in creating this new amazing LUT based sky.
* [Efficient and Dynamic Atmospheric Scattering ](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), which was super helpful in figuring out the details implementing the LUT code and to help determine if I was on the write path with how those LUTs looked.
* The [Colour-Science Library](https://www.colour-science.org/) library for better star color LUTs.
* The great blue noise textures by [Moments in Graphics  by Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* The solar corona texture by [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* This super useful water caustics texture by [leeor_net](https://opengameart.org/content/water-caustics-effect-small), which is used, not for water caustics... but for the aurora borealis!
* Sébastien Hillaire's *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), which informed the cloud illumination structure, SH9 ambient LUT design, and the Elek/Chalmers fog subtraction approach.
* Andrew Schneider and Nathan Vos's *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), which informed the dual-lobe Henyey-Greenstein phase function, cloud shape noise approach, and the reduced-extinction multiple scattering approximation.
* D. Hestroffer and C. Magnan's *Centre to limb darkening of the Sun with HIPPARCOS* (1998), which provided the wavelength-dependent limb darkening coefficients for the B, V, and R bands used to give the sun's limb a physically correct reddish tint.
* All the amazing work that has gone into [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) and [Emscripten](https://emscripten.org/).
* *And so so many other websites and individuals. Thank you for giving us the opportunity to stand on your giant-like shoulders.*

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
