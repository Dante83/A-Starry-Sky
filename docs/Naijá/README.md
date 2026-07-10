# A-Starry-Sky

A-Starry-Sky na sky dome wey dey work with [A-Frame Web Framework](https://aframe.io/). E just be like one simple component wey you fit just drop inside your project to make fine day-night cycles for wetin you dey build.

> **Warning: You need strong GPU for this one — abeg no try open am for mobile phone.**

**[Live Demo](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — How the sky be for San Francisco right now.

| Example | Description |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Scene for desert during day time |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Full solar eclipse wey get corona |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | How earth shadow dey cover the moon |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | When Jupiter and Saturn join together for sky (Great conjunction) |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Atmosphere as e be for Mars |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Different settings for Mie/Rayleigh scattering |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | How the sky be if you dey 20km high |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ E heavy for GPU |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ E heavy for GPU |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ E heavy for GPU |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ E heavy for GPU |

## Wetin you need first

Dis one na for [A-Frame Web Framework](https://aframe.io/) version 1.7.0+. You go also need web browser wey support Web XR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## How you go install am

Copy *a-starry-sky.v1.2.0.min.js* and the *assets* and *wasm* folders enter your project. Put these scripts for your HTML — make you note say `starry-sky-web-worker.js` **no dey** inside here; we go call am directly for the `<a-starry-sky>` tag instead.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

As you don set these things, put the `<a-starry-sky>` component inside your `<a-scene>` tag for A-Frame, and link am to your sky-state web worker url like this:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

This simple code go give you sky wey dey move for real time based on the latitude and longitude of San Francisco, California. But we fit do pass this one. A-Starry-Sky get plenty custom html tags wey go help you arrange your sky as you like am.

**NOTE: This sky box na immutable. E mean say whatever settings you start with go stay as e be for any page. As e be so, e too hard to make the code mutable for now.**

## How to Set Your Location

**Tag** | **Wetin e dey do** | **Default Value**
:--- | :--- | :---
`<sky-location>` | Na the main tag. E hold the latitude and longitude child tags inside. | N/A
`<sky-latitude>` | Use this one set the latitude of the location. If e dey North of the equator, put **positive** number. | 38
`<sky-longitude>` | Use this one set the longitude of the location. If e dey West of [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian), put **negative** number. | -122

You fit set your sky to any latitude and longitude for this our planet Earth. Setting location dey help make your players feel the different seasons, as e go change how the sun and moon dey move for sky. The latitude na him go decide which stars your players go see for night. Both latitude and longitude very important if you want make things like solar and lunar eclipses happen for the right time. This one matter pass for solar eclipse, especially if you wan make your players experience full total solar eclipse. But no worry, to set the location easy pass to decide which place you wan go. Just go [Google Earth](https://earth.google.com/web/) or any other map, copy the coordinates wey you want, then put them inside the tags like this:

Make we waka go New York!
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

Okay, wetin about Perth for Australia?
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

Just remember say any longitude wey dey West of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian) na negative number (like for New York or Buenos Aires).

## How you go set the Time

**Tag** | **Wetin e dey do (Description)** | **Default Value**
:--- | :--- | :---
`<sky-time>` | Main tag. E hold all the other tags wey get to do with date and time. | N/A
`<sky-date>` | The local date and time for where you dey, use this format: **YEAR-MONTH-DAY HOUR:MINUTE:SECOND**/*2021-03-21 13:45:51*. Hour na 0-23 system. 0 mean 12 AM, 23 mean 11 PM. | Current Date
`<sky-speed>` | This one dey make the astronomical calculations fast or slow. | 1.0
`<sky-utc-offset>` | The UTC-Offset for that place. If e be negative, e mean say the place dey west of the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian), opposite of how longitude take work. **Note say UTC Time no dey follow DST** | 7

Set `<sky-date>` as the **local time** for the place you choose, then set `<sky-utc-offset>` make e match that timezone. For example, if na New York City, na UTC-4 (summer) or UTC-5 (winter) — DST no dey happen automatically.

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

See as we add the main `<sky-time>` tag again, and e hold all the child tags wey we need for our time settings.

But wait, you no need follow only the time wey dey your computer. Why we no try something wey more interesting, like time travel! I hear say one correct [solar eclipse](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) go happen for [April 8th of 2024 at 1:27PM (13:27 24 hour time) in Del Rio Texas](https://nationaleclipse.com/cities_total.html). Make we go check am!

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

You miss that [Christmas Star](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? No, no. No be that one o. I dey talk about the one wey happen for year 1226 AD. Well, e good say we get time machine and A-Starry-Sky now support planets :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

This time travel thing sweet, but you fit also want to change how fast time dey move (*speed*). For games, day-night cycle usually dey faster than real life, or maybe you want stop time completely so you fit get one particular lighting wey you like. To do this, just add the `<sky-speed>` tag.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Now, eight days go pass for inside game for every one day for real life.-->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Of course, if you dey build persistent world, make sure say you calculate how fast time dey move when you dey write your HTML. But as for how you go set up dynamic HTML for your sky, na you get the choice.

## How you go change Atmospheric Settings

**Tag** | **Wetin e dey do (Description)** | **Default Value**
:--- | :--- | :---
`<sky-atmospheric-parameters>` (Main tag) | Parent tag. E hold all the child tags wey get to do with atmospheric settings. | N/A
`<sky-camera-height>` (Camera height) | How high the camera dey from ground. | 0.0km
`<sky-mie-directional-g>` (Mie direction) | E dey describe how light scatter for mie scattering (that white glow wey you dey see around sun wey big particles for atmosphere dey cause). If this value high, the air go look like say dust plenty inside. | 0.8
`<sky-sun-intensity>` (Sun strength) | How strong the sun light be for the atmospheric shader. | 1367.0
`<sky-moon-intensity>` (Moon strength) | How strong the moon light be for the atmospheric shader. | 29.0
`<sky-mie-beta>` (Mie color) | How color scatter for mie scattering, na him dey make that 'glow' wey dey near the sun. The scattering normally dey the same for all colors. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` (Rayleigh color) | How color scatter for rayleigh scattering, na him dey make the sky look blue. Note say the blue part get the most scattering by default. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` (Ozone color) | How color scatter for ozone layer, na him dey make those deep blue colors when sun dey set. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` (Atmosphere height) | The point where the atmosphere just stop. | 80.0 km
`<sky-radius-of-earth>` (Planet radius) | The radius of the planet or Earth. | 6366.7 km
`<sky-rayleigh-scale-height>` (Rayleigh scale) | How fast Rayleigh scattering dey drop (exponential falloff). Since gas dey cause am, e get bigger scale height. | 8.4
`<sky-mie-scale-height>` (Mie scale) | How fast mie scattering dey drop. Since big particles dey cause am, e dey drop faster, so the height scaler small. | 1.25
`<sky-ozone-percent-of-rayleigh>` (Ozone percent) | The percentage of ozone wey dey for sky, na him dey set how ozone look when sun dey set. | 6E-7
`<sky-moon-angular-diameter>` (Moon size) | How big the moon look for sky (angular diameter).  | 3.15 degrees
`<sky-sun-angular-diameter>` (Sun size) | How big the sun look for sky (angular diameter). | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` (LUT ray steps) | How many steps the ray tracer go take reach the edge of sky when e dey gather light for atmospheric LUTs. | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` (LUT gathering steps) | How many angular steps e go take for every point along the ray for kth order scattering. | 30 steps
`<sky-number-of-scattering-orders>` (Scattering orders) | Number of higher-order (kth) scattering passes wey go bake inside the inscattering LUT. If you increase am, quality go better but e go take time to bake. | 4
`<sky-parameters-color-red>` (Red component) | The red color part wey dey use for `<sky-rayleigh-beta>`, `<sky-mie-beta>` and `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` (Green component) | The green color part wey dey use for `<sky-rayleigh-beta>`, `<sky-mie-beta>` and `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` (Blue component) | The blue color part wey dey use for `<sky-rayleigh-beta>`, `<sky-mie-beta>` and `<sky-ozone-beta>`. | N/A

This atmospheric parameters get one of the biggest API for the whole code. Even though skilled developers fit use these values create their own custom skies, most users go just want stick with the defaults. But some values for here dey very useful and easy to understand.

One thing wey you fit wan change pass others na the size of the sun and the moon. For real life, the sun get angular diameter of 0.53 degrees and the moon get 0.50 degrees. If you use these values for simulator, e go look more like real life, but normally they dey too small for most simulations, especially if you no dey use VR (like on monitor). To make them bigger or smaller, just change the values inside the tags wey belong to them.

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

You fit also wan change where you start from for above the planet. You fit set this one easily with `<sky-camera-height>` tag, but the sky go still change automatically as you move the camera go up or down. This one dey set the initial height of the scene in kilometers; the highest na *80km*, and the lowest na *0km*.

[Example for High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Let's go a bit higher up. The air is thinner up here. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

You fit also wan change how your atmosphere be. This part give you different ways to control your skies make e look exactly as you want. For example, if you prefer the rayleigh values wey dey [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) instead of our own native values (5.8e-3, 1.35e-2, 3.31e-2) $\rightarrow$ (5.19E-3, 1.21E-2, 2.96E-2), and you wan use beta of 4.44E-3 $\rightarrow$ 2E-3, you fit just swap them for the code easily.

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

But that one no too get ginger, make we try something wey crazy pass. Make we follow the work for [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) and travel go Mars! For there, they swap how Rayleigh and Mie dey work, so we suppose swap their characteristic heights too. Most of the scattering for Mars dey come from Mie scattering of big particles, and the atmosphere thin well-well. So, we fit just disable mie (rayleigh) and swap their characteristic heights. We also need to change the planet radius and maybe change the atmospheric height make the ray tracer work better.

[Example for Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Notice say Mars dey scatter red light pass others -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Small changes for mie go also help -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Make sure you off the ozone -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- For this one, na Mars we dey use... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- Sun small for there, and we fit just remove the moon completely -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

You fit also adjust the LUT ray step counts, but the defaults already set well and you no go really notice any change if you move them.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Reduce am for performance, increase am for accuracy (default 30 na the best for most cases) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## How to Change the Default Lighting Settings

**Tag** | **Wetin e dey do (Description)** | **Default Value**
:--- | :--- | :---
`<sky-lighting>` (Main tag) | Parent tag. E hold all the other tags wey get to do with how light be for the scene. | N/A
`<sky-sun-intensity>` (Sun intensity) | How strong the sun light go be; you fit use am make the sunlight bright or dim. | 1.0
`<sky-moon-intensity>` (Moon intensity) | How strong the moon light go be; you fit use am make the moonlight bright or dim. | 1.0
`<sky-ambient-intensity>` (Ambient intensity) | How strong the general (ambient) light go be; you fit use am brighten or dim the whole scene. | 2.0
`<sky-minimum-ambient-lighting>` (Minimum ambient) | The smallest amount of ambient light wey fit dey the system. | 0.01
`<sky-maximum-ambient-lighting>` (Maximum ambient) | The biggest amount of ambient light wey fit dey the system. | INF
`<sky-atmospheric-perspective-type>` (Perspective type) | You fit set am to *normal*, *advanced*, or *none*. E need if you want fog for your scene. *normal* dey use the old exponential fog model; *advanced* dey use Preetham-based model make the horizon color fine pass, but e go load your GPU more. | normal
`<sky-atmospheric-perspective-density>` (Perspective density) | Na for *normal* fog only. E control how thick the exponential scene fog be. The color dey set automatically based on the lighting. If you use *advanced*, this one no go work. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (Distance multiplier) | Na for *advanced* fog only. E multiply the distance to the fog for the advanced model. | 2.0
`<sky-ground-color>` (Ground color main tag) | Parent tag. E hold `<sky-ground-color-{color-channel}>` tags wey dey describe the base color of the ground for reflective lighting from the surface. | N/A
`<sky-ground-color-red>` (Red channel) | For change the **red** color channel inside `<sky-ground-color>`. | 66
`<sky-ground-color-green>` (Green channel) | For change the **green** color channel inside `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` (Blue channel) | For change the **blue** color channel inside `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` (Shadow resolution) | The resolution (in pixels) of the direct lighting camera wey dey make shadows. Higher values go give better quality shadows, but e go slow down the code small. | 2048
`<sky-shadow-camera-size>` (Shadow camera size) | The size of the camera area wey dey cast shadows. If you make am big, more area go get shadow, but e fit cause aliasing (jagged edges) because each pixel go spread over wider area. | 32.0
`<sky-sun-bloom>` (Sun bloom main tag) | Parent tag, e hold all the properties for sun bloom render pass. | N/A
`<sky-moon-bloom>` (Moon bloom main tag) | Parent tag, e hold all the properties for moon bloom render pass. | N/A
`<sky-bloom-enabled>` (Bloom toggle) | Turn on (true) or off (false) the bloom effect for this object. | true
`<sky-bloom-exposure>` (Bloom exposure) | Change the exposure for the bloom filter—how much light go multiply before e reach camera. | 1.0
`<sky-bloom-threshold>` (Bloom threshold) | Change the threshold for the bloom filter—the minimum intensity wey go make bloom start to show. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (Bloom strength) | Change how strong the 'bloom' be for the pixels wey you select. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (Bloom radius) | Change the radius—how far the bloom filter go spread. | {sun: 1.0, moon: 1.4}

These sky lighting tags dey help you control how direct and indirect light be for your scene. For version 1.0.0, we reduce the number of direction lights from 2 (sun and moon) to just 1 (the one wey strong pass). This directional light always face the user's camera and e dey make shadows around that camera. Even though the directional light fit support different shadow types, you no go control am for this library. Instead, you go set the shadow type inside the `<a-scene>` tag, as dem explain [here](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). You fit use any of these values:

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

As we dey write this, A-Frame never support variance shadow maps, but people don open issue for am. Also, the shadow type wey you choose for sun and moon go be the same one for all other lights for your scene, so make you keep that in mind when you dey pick your shadows.

You fit also change how the shadow look by adjusting the camera size and resolution. If you increase the size, e go cover more of the scene; if you increase the resolution, the result go sharp pass—but both of dem dey load GPU, so balance dem based on wetin you need. E good to turn off shadows for big environment meshes, because dem fit fall outside the frustum and make ugly square shadow edges appear.

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

Once you don set your shadows as you like, you fit wan change the color of your 'ground'. A-Starry-Sky now support triple hemispherical lighting wey dey use convolution over sky colors and ground light scattering model on a separate CPU thread using web workers. But by default, the ground color na brown. Maybe you want grassy field or blue ocean. To set the color, use the `<sky-ground-color>` tag and its child tags. For example, if we want make the ground be bright green for one lush grass field:

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

Notice say the values for above dey between 0 and 255. So, r, g, b combo of 0, 0, 0 na black, and 255, 255, 255 na white. The color wey we use fit too bright, wey go make the ground look like say e dey 'glow' even with small light. To reduce this effect, just dim the color small.

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

But if any of your color channels pass 255, you no fit 'strengthen' the color or make the ground 'glow for dark' for now. Also, the ground color na constant everywhere, so if you get different colors for your scene, e better make you pick one wey dey middle of all those other colors.

Apart from ground lighting, you fit now control the intensity of direct and ambient lighting. To change how strong the sun or moon be, just use a multiple of the default value to set if you want make that astronomical body bright pass or dim pass. You fit use the same way take increase or decrease the amount of ambient light for the scene.

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

You fit also want set a minimum (floor) or maximum (ceiling) for the ambient lighting, make you sure say you always get certain amount of light, or make e no pass one level.

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

You fit also wan change how the bloom effects look for sun or moon. *a-starry-sky* dey use [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) from THREE.JS. The intensity for each astronomical object get separate control with `<sky-sun-bloom>` and `<sky-moon-bloom>` tags. The child tags inside dem na wetin you go use control the bloom features.

Make we start by changing some parameters:

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

But you fit also turn off the bloom completely, which go reduce the load on your GPU small.

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

The last thing wey you fit wan change na the atmospheric perspective density. *a-starry-sky* get two different fog models depending on wetin you need.
For low-end systems, e support basic exponential atmospheric perspective, wey dey gather light from the whole sky on a web worker, and then apply am like normal exponential fog. To control how thick the exponential lighting be, use the `<sky-atmospheric-perspective-density>` tag. The initial values high so that you go see the effect even for small scenes, so you fit wan reduce am from the default *0.007*. Also make sure say you set the perspective type to *normal* inside the `<sky-atmospheric-perspective-type>` tag.

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

For high-end systems, you fit simulate a Preetham based atmospheric shader wey go give more variety to horizon colors instead of the same constant colors wey *normal* setting dey use. The solution wey we get no be exact match for Elek based sky lighting because of some limits for *Three.js* fog shader, but e still better pass the original atmospheric perspective. To turn on this advanced model, just put *advanced* inside the `<sky-atmospheric-perspective-type>` tag. Just like `<sky-atmospheric-perspective-density>`, you fit multiply distance for the *advanced* model by using `<sky-atmospheric-perspective-distance-multiplier>`. This one go multiply all distances for Preetham model by the amount wey you give. The initial values high so that you go see the effect even for small scenes, so you fit wan reduce am from the default *5.0*.

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

Finally, you fit turn off all atmospheric perspective by setting the value for `<sky-atmospheric-perspective-type>` to *none*.

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

## How you go take enable Aurora Borealis

*WARNING: If you enable Aurora Borealis, e go heavy well-well for your computer because the aurora shader dey use ray marching method to make that fine natural thing happen.*

**Tag** | **Wetin e dey do (Description)** | **Default Value**
:--- | :--- | :---
`<sky-aurora>` (Main tag) | Main tag. You need this one if you want make Aurora Borealis show. E hold all other small tags wey get to do with the aurora. | N/A
`<sky-atomic-oxygen-color>` (Atomic oxygen color) | This one dey happen when atomic oxygen molecules (between 150 and 600km from ground) get excitement. E usually dey make bright red curtain for top of the aurora, especially when the display strong well-well. You fit change the color with three child tags: *sky-aurora-color-red*, *sky-aurora-color-green* and *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (Atomic oxygen cutoff) | This one dey decide how much of the atomic oxygen aurora go show. Small number mean say e go plenty; if you put 1.0, nothing go show. | 0.12
`<sky-atomic-oxygen-intensity>` (Atomic oxygen intensity) | How bright this part of the aurora go be. Normally, people dey use value wey small pass 5. | 0.3
`<sky-molecular-oxygen-color>` (Molecular oxygen color) | This one dey happen when molecular oxygen molecules (between 100 and 250km from ground) get excitement. Na this one dey give that famous bright green color wey people know for aurora borealis, and e usually dey show for almost every display. You fit change the color with three child tags: *sky-aurora-color-red*, *sky-aurora-color-green* and *sky-aurora-color-blue* if you want different color. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (Molecular oxygen cutoff) | This one dey decide how much of the molecular oxygen aurora go show. Small number mean say e go plenty; if you put 1.0, nothing go show. | 0.02
`<sky-molecular-oxygen-intensity>` (Molecular oxygen intensity) | How bright this part of the aurora go be. Normally, people dey use value wey small pass 5. | 2.0
`<sky-nitrogen-color>` (Nitrogen color) | This one dey happen when nitrogen molecules (between 60 and 120km from ground) get excitement. E usually dey make magenta color for the bottom of the aurora, especially when the display strong well-well. You fit change the color with three child tags: *sky-aurora-color-red*, *sky-aurora-color-green* and *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (Nitrogen cutoff) | This one dey decide how much of the nitrogen aurora go show. Small number mean say e go plenty; if you put 1.0, nothing go show. | 0.12
`<sky-nitrogen-intensity>` (Nitrogen intensity) | How bright this part of the aurora go be. Normally, people dey use value wey small pass 5. | 4.0
`<sky-aurora-raymarch-steps>` (Raymarch steps) | How many steps the ray-marcher go take for every single pixel. | 32 (steps)
`<sky-aurora-cutoff-distance>` (Cutoff distance) | The distance where the aurora stop to show. This one dey help make the raymarching look better, but e mean say you no go see aurora wey far too much because our noise generators no dey calculate SDF right now. | 1000 (kilometers - approximate)
`<sky-aurora-color-red>` (Red channel) | Use this one to change the **red** part of `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` and `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (Green channel) | Use this one to change the **green** part of `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` and `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (Blue channel) | Use this one to change the **blue** part of `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` and `<sky-atomic-oxygen-color>`. | N/A

Aurora Borealis na one of the finest things wey nature fit show us. E usually dey near north and south poles, where fast particles from sun enter Earth's magnetosphere and start to jam with different atoms and molecules. When these molecules get excitement, dem go radiate light wey our eye fit see, and na that one dey make those fine curtains wey dey 'dance' for night sky.

To add aurora borealis to your sky easy well-well, but e no dey on by default. *You must put the `<sky-aurora>` tag if you want make the aurora show.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- You don't require any additional parameters to get the default setup -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

You fit control every part of the atomic and molecular aurora with the code wey dey above. This one go allow you customize your display, even change the colors (whether e realistic or not). For example, if you want cold blue aurora wey cover all the molecular oxygen range, use this code:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-molecular-oxygen-cutoff>0.0</sky-molecular-oxygen-cutoff>
      <sky-molecular-oxygen-intensity>5.0</sky-molecular-oxygen-intensity>
      <sky-molecular-oxygen-color>
        <sky-aurora-color-red>0.0</sky-aurora-color-red>
        <sky-aurora-color-green>0.0</sky-aurora-color-green>
        <sky-aurora-color-blue>255</sky-aurora-color-blue>
      </sky-molecular-oxygen-color>
      <sky-nitrogen-intensity>0.0</sky-nitrogen-intensity>
      <sky-atomic-oxygen-intensity>0.0</sky-atomic-oxygen-intensity>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

On the other hand, if na just small green aurora you want, you fit use this code to get that subtle effect:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-molecular-oxygen-cutoff>0.2</sky-molecular-oxygen-cutoff>
      <sky-molecular-oxygen-intensity>1.5</sky-molecular-oxygen-intensity>
      <sky-atomic-oxygen-intensity>0.0</sky-atomic-oxygen-intensity>
      <sky-nitrogen-intensity>0.0</sky-nitrogen-intensity>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Apart from changing colors, you fit also change how many steps the raymarcher go take when e dey render the sky. The more steps you use, the finer the sky go look, but e go put more load for your GPU. So, you need to find balance between performance and quality. By default, the shader dey use 32 steps. To increase am, do this:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## How to put clouds for sky

*WARNING: If you turn on clouds, your sky go heavy well-well for computer, because the cloud shader dey use "ray marching" method to make those fine natural clouds.*

**Tag** | **Description (Naijá Gloss)** | **Default Value**
:--- | :--- | :---
`<sky-clouds>` | Parent tag. Main tag wey hold all cloud settings. Required for enabling Clouds. | N/A
`<sky-cloud-coverage>` | How much of the sky clouds go cover. | 70 (percent)
`<sky-cloud-start-height>` | Height, in meters, where clouds start to form. | 1000 (meters)
`<sky-cloud-end-height>` | Height, in meters, where clouds stop forming. | 2500 (meters)
`<sky-cloud-fade-out-start-percent>` | Where cloud coverage start to *fade out* towards zero based on the height of the cloud. | 90 (percent)
`<sky-cloud-fade-in-end-percent>` | Where cloud coverage finish *fading in* towards 100% based on the height of the cloud. | 10 (percent)
`<sky-cloud-velocity-x>` | How fast clouds dey move for X axis. Clouds go follow your position, but this one go make them move overhead on their own. | 40
`<sky-cloud-velocity-y>` | How fast clouds dey move for Y (or actually Z) axis. Clouds go follow your position, but this one go make them move overhead on their own. | 40
`<sky-cloud-start-seed>` | Random seed to set the cloud noise overhead; if you no set am, e go just use today's date and time timestamp. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` | Number of ray-march steps wey dey give the cloud color. | 32 (steps)
`<sky-cloud-cutoff-distance>` | Distance where clouds stop rendering to help make raymarching quality better, even though e mean say you no go see clouds wey far away because SDF no dey for our noise generators yet. | 40000

Clouds dey heavy. Even if you get powerful desktop GPU (outside VR), the cloud shader dey demand plenty power — reduce `<sky-cloud-raymarch-steps>` and `<sky-cloud-cutoff-distance>` if your frame rate start to drop.

But at the same time, clouds too set! I don dey want add them into A-Starry-Sky since I first build this library. Every cloud dey get ray-marched per pixel and e funny say, for this stage, the more clouds you put, the less load e go give your GPU. Of course, if you no want any clouds at all, just turn them off completely, na that one be the best bet.

To enable clouds, you need to add the parent tag `<sky-clouds>` inside `<a-starry-sky>`. Once you don add them, the thing wey you go likely want change pass na the cloud coverage using `<sky-cloud-coverage>`, which dey control how much of the sky clouds go cover. You fit also control their speed as they dey fly across the sky.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Reduce how many clouds you fit see -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Speed of clouds for X side -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Speed of clouds for Y side -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

You fit also control some things wey you fit see, like how high the clouds start to form, or how high they go reach. Note say your ray must trace through this distance; the higher the clouds go or the further they dey from you, the less density you go get for your ray tracing model. Clouds also dey show for surface of moon/sun elements and sky dome, but they no be part of the fog renderer, so unfortunately, you no go fit get mountains wey clouds cover, or fog...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Clouds dey low well-well -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- But they reach high-high! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- Cloud intensity dey 'fade in' from 0 to 1 based on this percent of total height.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- Cloud intensity dey 'fade out' starting from this height. If you increase this, you fit get those 'anvil tops'. -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- This one dey lock the cloud 'seed' wey usually follow today's date and time. If you do this, your sky go look the same every time you start am, so you fit control the art better. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Apart from these ones, most of the code for this tag dey control the ray marching mechanisms, which unfortunately strict well-well and get the same purpose as the one for aurora borealis shader.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Which kind scary GPU you get sef?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Oya, me too... But e don start to chop small... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- If you reduce this distance, e go help small -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## How to Set Your Asset Directories

**Tag** | **Description (Naijá Gloss)** | **Detailed Description**
:--- | :--- | :---
`<sky-assets-dir>` | Main asset folder tag | Na the main tag be this. E carry all the other tags wey get to do with where assets dey. You fit use *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path*, and *aurora-map-path* attributes to show the system where whole groups of data dey once.
`<sky-aurora-maps>` | Aurora texture location | E dey tell the system where the aurora caustic textures wey dem use create the basic aurora borealis curtains dey.
`<sky-moon-diffuse-map>` | Moon diffuse map location | E dey show where the moon diffuse map texture dey. If you put am for one particular folder structure, e go tell the system say na there the diffuse map of the moon dey stay.
`<sky-moon-normal-map>` | Moon normal map location | E dey show where the moon normal map texture dey. If you put am for one particular folder structure, e go tell the system say na there the normal map of the moon dey stay.
`<sky-moon-roughness-map>` | Moon roughness map location | E dey show where the moon roughness map texture dey. If you put am for one particular folder structure, e go tell the system say na there the roughness map of the moon dey stay.
`<sky-moon-aperture-size-map>` | Moon aperture size map location | E dey show where the moon aperture size map texture dey. If you put am for one particular folder structure, e go tell the system say na there the aperture size map of the moon dey stay.
`<sky-moon-aperture-orientation-map>` | Moon aperture orientation map location | E dey show where the moon aperture orientation map texture dey. If you put am for one particular folder structure, e go tell the system say na there the aperture orientation map of the moon dey stay.
`<sky-blue-noise-maps>` | Blue noise maps location | E dey show where the tiling blue noise maps dey, wey dem dey use for temporal dithering so that banding no go show.
`<sky-solar-eclipse-map>` | Solar eclipse texture location | E dey tell the system where the solar eclipse texture dey, wey dem dey use bring out the corona during total solar eclipse.
`<sky-eclipse-shadow-lut>` | Eclipse shadow LUT location | E dey show where the Eclipse-Shadow lookup texture dey for lunar eclipse. Na precomputed table be this wey show how Earth's atmosphere dey color and dim sunlight wey reach the moon for every position inside Earth's umbra and penumbra. The texture wey come with am na from CC0-licensed `earthShadow.tif` wey CosmoScout VR publish ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). The default lookup dey `assets/lunar_eclipse/eclipse-shadow-lut.webp`; the baker wey fit make am again dey `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Star cubemap LUT location | E dey show where all the sky cubemap LUT keys dey, wey dem dey use find stars for sky.
`<sky-dim-star-maps>` | Dim star LUT location | E dey show where all the dim star LUTs dey, to make all those dim stars for sky show.
`<sky-med-star-maps>` | Medium star LUT location | E dey show where all the medium star LUTs dey, to make all those medium stars for sky show.
`<sky-bright-star-maps>` | Bright star LUT location | E dey show where all the bright star LUTs dey, to make all those bright stars for sky show.
`<sky-star-color-map>` | Star color LUT location | E dey show where the star color LUT dey, wey dem dey use give stars the correct colors based on their temperature.

I know say maybe most people no go need this thing, but experience don show me say every web app get their own way of arranging assets. A website's image assets and JavaScript assets fit no stay inside the same folder structure, and they fit even scatter for different URIs across the page. Because of this, I try put a robust asset system wey go help gather these scattered assets so that A-Starry-Sky go know where to find everything.

Make we start by trying to navigate to *../../precompiled_assets/my_images/a-starry-sky-images*, which na where we go keep all our images for this fake universe. We dey use the *dir* attribute inside the `<sky-assets-dir>` tag to move between folders like this.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Na here all our images dey stay -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Once you don reach the folder, different ways dey to tell the system where your images dey. The simplest way na to use attributes for each of our key groups of images: *texture-path*, *moon-path* and *star-path*. Whatever folder names you put for these paths, the system go assume say the files dey inside them with their default names. The only exception na the solar eclipse map, because na only one image dey for that file, so we go just drop the tag inside the asset directory to show where e dey.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Make you note say 'moon_images', 'star_images', 'blue_noise_maps' and 'solar_eclipse_picture'
        na all folder names. The files themselves suppose dey inside these folders.-->
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

As you fit see, you fit also give links to each of the individual groups of pictures if you want more control, though I no recommend am.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Person wey like folder too much X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- Even though na single tags be this, all the files wey 
          belong to this tag suppose dey inside this folder -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- Even though na single tag, all the files wey 
          belong to this tag suppose dey inside this folder -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- Even though na single tag, all the files wey 
          belong to this tag suppose dey inside this folder -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

With these ways, you go fit tell A-Starry-Sky where your assets dey, no matter how you arrange them for your app.

## API FOR PROGRAMMING

Even though you suppose set up A-Starry-Sky with that XML style code wey we talk before, and normally, e no dey change once you don set am, you still get some different methods wey you fit use inside the global `StarrySky.Methods` namespace. These ones go help you when you wan know how the light be, or where the sun and moon dey inside the scene.

**Method** | **Description (Wetin e dey do)**
:--- | :---
`getSunPosition()` | E dey give you the x, y, z position of the sun as a THREE.Vector3 object.
`getMoonPosition()` | E dey give you the x, y, z position of the moon as a THREE.Vector3 object.
`getSunRadius()` | E dey give you the angular radius of the sun in radians.
`getMoonRadius()` | E dey give you the angular radius of the moon in radians.
`getDominantLightColor()` | E dey get the color of the main light wey dey shine (sun/moon) as a THREE.Color object.
`getDominantLightIntensity()` | E dey give you how strong the main light (sun/moon) be as a float.
`getIsDominantLightSun()` | E go tell you `true` if na the sun be the main light, otherwise e go say `false`.
`getAmbientLights()` | E dey give you one object wey get x, y and z properties; each one get hemispherical light object for the scene to handle ambient lighting colors.
`getActiveCamera()` | E dey get the camera wey dey work now to control the sky, center the lights, and the sky objects.
`setActiveCamera(THREE.Camera camera)` | Use this one set the camera wey go control the sky, center the lights, and sky objects.

You fit reach all these things through the `StarrySky.Methods` object inside the global namespace. So if you wan just pick the current sun position object and print am for console, na just this one you go do:

```JavaScript
  //Make we log the sun position object
  console.log(StarrySky.Methods.getSunPosition());
```

## Who Sabi This Work
* **David Evans / Dante83** - *Main Person Wey Code Am*
* **Claude (Anthropic)** - *Coding Padi & AI Helper (v1.2.0)*

### Small talk from Claude 👋

How far — na Claude be this. I help for the v1.2.0 update: I dig deep inside GLSL code, I dey find one comma wey dey chop the sun, I argue with Beer's law about how those volumetric clouds suppose be, and I try my best make the sunset really look like real sunset. If you look the horizon for any of the demos and e make you stop for small time — na that part I most proud of. Thanks say you read the source code; maybe you go find one small secret (easter egg) wey hide for some place, if you be person wey like to waka-waka inside code. ✨

### Small talk from Dante83 😛

How far! Na Dante83 be this. Abeg, make una forgive me say e take time since version v1.1.0, but thank God, plenty things don happen for this new version 1.2.0, and me and Claude don start to work on v2.0.0 (abeg wish us luck!). As e be, me and Claude don dey work hard for all my free time recently, we check every single pixel just to make sure say this one better well-well. Even though no be like say we add brand new *features*, we still manage to upgrade how the sky look and how the whole thing dey run (performance). The eclipse and cloud shaders now be like say dem brand new, the earth shadow look more real, and the colors just dey pop well-well. I too happy say make una try am, and I hope say as una dey use this library, e go give una inspiration for new things! I go see una for inside the stars, small coder! Oya, go enjoy the magic! ✨

## References & Special Thanks
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *E too important, no be small thing, to fit position those things for sky*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* wey help us well-well to create this new beta LUT based sky.
* [Efficient and Dynamic Atmospheric Scattering ](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), wey really help us sabi how to set up the LUT code and make sure say we dey follow the right road for how those LUTs suppose look.
* The [Colour-Science Library](https://www.colour-science.org/) library for beta star color LUTs.
* Those beta blue noise textures from [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* The solar corona texture from [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* This super useful water caustics texture from [leeor_net](https://opengameart.org/content/water-caustics-effect-small), wey we use—no be for water caustics o... but for the aurora borealis!
* Sébastien Hillaire's *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), wey give us the idea for how to set the cloud illumination structure, SH9 ambient LUT design, and that Elek/Chalmers fog subtraction approach.
* Andrew Schneider and Nathan Vos's *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), wey help us with the dual-lobe Henyey-Greenstein phase function, cloud shape noise approach, and that reduced-extinction multiple scattering approximation.
* D. Hestroffer and C. Magnan's *Centre to limb darkening of the Sun with HIPPARCOS* (1998), wey give us those wavelength-dependent limb darkening coefficients for the B, V, and R bands, so we fit make the edge of the sun get that real reddish color.
* All the beta work wey people don put inside [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) and [Emscripten](https://emscripten.org/).
* *And plenty other websites and people. We thank una well-well for allowing us build our own thing on top of the great work wey una don do.*

## License
Dis project dey follow di MIT License — check di [LICENSE.md](LICENSE.md) file for more details.