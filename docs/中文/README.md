# A-Starry-Sky

A-Starry-Sky 是一个为 [A-Frame Web Framework](https://aframe.io/) 设计的天穹组件。它旨在提供一个简单、即插即用的组件，让您在创作中轻松打造绝美的日夜循环效果。

> **警告：需要高性能 GPU —— 请勿在手机端打开。**

**[在线演示](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** —— 展示旧金山当前日期和时间的星空。

| 示例 | 描述 |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | 沙漠场景（设定在白天的某个时刻） |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | 日全食（含日冕） |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | 月食（地球阴影覆盖月球） |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | 圣诞之星 (公元 1226 年)：木星与土星的大会合 |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | 自定义火星大气层 |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | 自定义大气层（不同的 Mie/Rayleigh 散射值） |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | 高空视角（海拔 20 公里） |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | 北极光 ⚠️ 对 GPU 要求较高 |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | 轻微云层 ⚠️ 对 GPU 要求较高 |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | 中等云层 ⚠️ 对 GPU 要求较高 |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | 厚重云层 ⚠️ 对 GPU 要求较高 |

## 前置条件

本项目基于 [A-Frame Web Framework](https://aframe.io/) 1.7.0 及以上版本构建。同时，您需要使用一个兼容 Web XR 的浏览器。

`https://aframe.io/releases/1.7.0/aframe.min.js`

## 安装

将 *a-starry-sky.v1.2.0.min.js* 以及 *assets* 和 *wasm* 文件夹复制到您的项目中。将以下脚本添加到您的 HTML 中 —— 请注意，此处**并未**包含 `starry-sky-web-worker.js`；它是在 `<a-starry-sky>` 标签中直接引用的。

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

设置好这些引用后，将 `<a-starry-sky>` 组件添加到 A-Frame 的 `<a-scene>` 标签中，并像这样引用您的天空状态 Web Worker URL。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

这段基础代码将为您提供一个根据加利福尼亚州旧金山的经纬度实时移动的天空。不过，我们能实现的功能远不止于此。A-Starry-Sky 提供了大量自定义 HTML 标签，旨在帮助您定制天空状态。

**注意：此天空盒（sky box）是不可变的。这意味着您在页面启动时的设置在当前页面将保持不变。遗憾的是，目前要使代码可变实在太困难了。**

## 设置位置

**标签** | **描述** | **默认值**
:--- | :--- | :---
`<sky-location>` (父级标签) | 父级标签。包含天空纬度 (`<sky-latitude>`) 和经度 (`<sky-longitude>`) 的子标签。 | N/A
`<sky-latitude>` (纬度) | 设置位置的纬度。赤道以北为**正值**。 | 38
`<sky-longitude>` (经度) | 设置位置的经度。[本初子午线](https://en.wikipedia.org/wiki/Prime_meridian)以西为**负值**。 | -122

你可以将天空设置为地球上的任何经纬度。通过改变太阳或月亮的运行轨迹，位置设置可以为玩家营造出季节感。此外，纬度还将决定你的夜空中可见哪些恒星。经纬度对于日食和月食等与时间相关的事件也至关重要——如果你想体验日全食，这一点在日食中尤为明显。话虽如此，设置位置比决定去哪里要简单得多。只需从 [Google Earth](https://earth.google.com/web/) 或其他地图来源获取你想要的位置，然后将数值填入相应的标签中，如下所示：

我们去纽约吧！
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

那么，澳大利亚珀斯呢？
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

请注意，[本初子午线](https://en.wikipedia.org/wiki/Prime_meridian)以西的经度为负值（例如：纽约、布宜诺斯艾利斯）。

## 设置时间

**标签 (Tag)** | **描述 (Description)** | **默认值 (Default Value)**
:--- | :--- | :---
`<sky-time>` (父级标签) | 父级标签。包含所有与日期或时间元素相关的子标签。 | N/A
`<sky-date>` (日期时间) | 本地日期时间字符串，格式为 **年-月-日 时:分:秒** / *2021-03-21 13:45:51*。小时采用 0-23 小时制，其中 0 为凌晨 12 点，23 为晚上 11 点。 | 当前日期
`<sky-speed>` (时间倍率) | 用于加速或减慢天文计算的时间倍率。 | 1.0
`<sky-utc-offset>` (UTC 偏移量) | 该地点的 UTC 偏移量。与经度值相反，负值表示在[本初子午线](https://en.wikipedia.org/wiki/Prime_meridian)以西。**请注意，UTC 时间不遵循夏令时 (DST)** | 7

将 `<sky-date>` 设置为你所选地点的**本地时间**，然后将 `<sky-utc-offset>` 设置为与该时区相匹配的值。例如，纽约市在夏季为 UTC-4，冬季为 UTC-5 —— 系统不会自动应用夏令时 (DST)。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- 以前的位置设置 -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- 你可以这样设置 UTC 偏移量！ -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

请注意，你需要再次添加父级标签 `<sky-time>`，其中包含所有与时间设置相关的子标签。

话虽如此，你不必局限于本地机器的时间。为什么不尝试一些更有趣的事情，比如“时间旅行”呢！我听说[2024 年 4 月 8 日下午 1:27（24 小时制为 13:27），德克萨斯州德里奥 (Del Rio Texas)](https://nationaleclipse.com/cities_total.html) 将会发生一场令人兴奋的[日食](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html)。让我们一起去看看吧！

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

你错过了[圣诞之星](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)吗？不，不，不是那颗。我说的是公元 1226 年的那颗。幸好我们有一台时间机器，而且 A-Starry-Sky 现在支持行星了 :D。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

时间旅行很有趣，但你可能还对改变时间的*速度*感兴趣。在游戏世界中，昼夜循环通常比现实世界快，或者你可能希望永久停止时间，以捕捉某个特定的时刻用于光照效果。为此，请添加 `<sky-speed>` 标签。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- 现在虚拟世界中的每一天会变成现实中的八天。 -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

当然，如果你是在持久化世界中使用此功能，在编写 HTML 时请务必考虑时间流速加快的影响。至于如何为天空设置动态 HTML，则由你自行决定。

## 修改大气设置

**标签 (Tag)** | **描述 (Description)** | **默认值 (Default Value)**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | 父级标签。包含所有与大气设置相关的子标签。 | N/A
`<sky-camera-height>` | 相机距离地面的高度。 | 0.0km
`<sky-mie-directional-g>` | 描述 Mie 散射的前向散射程度，即由大气中较大颗粒引起的太阳周围白色光晕。`mie-directional G` 值越高，大气看起来越多尘。 | 0.8
`<sky-sun-intensity>` | 大气着色器中的太阳强度。 | 1367.0
`<sky-moon-intensity>` | 大气着色器中的月亮强度。 | 29.0
`<sky-mie-beta>` | Mie 散射的颜色依赖性，主要负责太阳附近的“光晕”。在所有频率上的散射较为均匀。 | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Rayleigh 散射的颜色依赖性，主要负责天空的蓝色散射。请注意，默认情况下蓝色通道的散射最强。 | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | 臭氧层的颜色依赖性，对于日落时的深蓝色至关重要。 | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | 大气“结束”的截止高度。 | 80.0 km
`<sky-radius-of-earth>` | 行星或地球的半径。 | 6366.7 km
`<sky-rayleigh-scale-height>` | Rayleigh 散射的衰减标高（假设为指数级衰减）。Rayleigh 散射源自大气气体，因此其标高较大。 | 8.4
`<sky-mie-scale-height>` | Mie 散射的衰减标高（假设为指数级衰减）。Mie 散射源自较大颗粒，因此衰减更快，特征高度标量较小。 | 1.25
`<sky-ozone-percent-of-rayleigh>` | 当前天空中的臭氧百分比，用于设置日落时的臭氧回馈。 | 6E-7
`<sky-moon-angular-diameter>` | 月亮在天空中的视直径。 | 3.15 degrees
`<sky-sun-angular-diameter>` | 太阳在天空中的视直径。 | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | 光线追踪在收集大气 LUT 光线时，向天空边缘推进的步数。 | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | 在光线沿途每个点上，为 k 阶散射采取的角步数。 | 30 steps
`<sky-number-of-scattering-orders>` | 烘焙到入射散射 LUT 中的高阶 (k 阶) 散射次数。值越高质量越好，但 LUT 烘焙时间越长。 | 4
`<sky-parameters-color-red>` | 在 `<sky-rayleigh-beta>`、`<sky-mie-beta>` 和 `<sky-ozone-beta>` 标签中使用的红色分量。 | N/A
`<sky-parameters-color-green>` | 在 `<sky-rayleigh-beta>`、`<sky-mie-beta>` 和 `<sky-ozone-beta>` 标签中使用的绿色分量。 | N/A
`<sky-parameters-color-blue>` | 在 `<sky-rayleigh-beta>`、`<sky-mie-beta>` 和 `<sky-ozone-beta>` 标签中使用的蓝色分量。 | N/A

大气参数拥有整个代码库中最丰富的 API 之一。虽然资深开发者可以利用这些值创建自定义天空，但大多数用户建议使用默认值。不过，其中有几个值非常实用且易于理解。

你最可能想要修改的元素之一是太阳和月亮的大小。在现实生活中，太阳的视直径为 0.53 度，月亮的视直径为 0.50 度。在模拟器中使用这些值能更真实地还原现实，但在大多数模拟场景中（尤其是显示器等非 VR 设备上），它们往往显得太小。若要将其调大或调小，只需修改相应标签中的数值即可。

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

你可能还想更改相对于行星的起始高度。这可以通过 `<sky-camera-height>` 标签轻松设置，不过当你移动相机升高或降低时，天空也会随之动态调整。该项设置场景的初始高度（单位：公里），最大高度为 *80km*，最小高度为 *0km*。

[高海拔示例](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- 让我们飞得更高一点，这里的空气更稀薄 -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

你可能还想改变大气的成分。该元素为你提供了多种控制天空外观的机制。例如，如果你更倾向于 [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) 中提供的 Rayleigh 值 $\rightarrow$ (5.19E-3, 1.21E-2, 2.96E-2)，而不是我们的原生值 (5.8e-3, 1.35e-2, 3.31e-2)，并且希望将 beta 值从 4.44E-3 改为 2E-3，你可以轻松地在代码中进行替换。

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

这还不够刺激，假设我们想要一些更疯狂的尝试——让我们参考 [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) 的研究，前往火星！在火星环境下，Rayleigh 和 Mie 散射的作用发生了互换，因此我们也应该相应地交换它们的特征高度。火星上的大部分散射来自大颗粒的 Mie 散射，且大气非常稀薄。因此，我们可以基本禁用 mie (rayleigh) 并交换其特征高度。此外，我们还需要修改行星半径，并可能需要为光线追踪器设置更合适的大气高度值。

[火星示例](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- 注意火星散射红光更多 -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- 对 mie 进行一些修改也会有帮助 -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- 记得禁用臭氧 -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- 这里我们设置的是火星... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- 太阳更小，月亮则可以直接去掉 -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

你还可以调整 LUT 的光线步数，不过默认值已经接近最优，修改后的效果通常不明显。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- 低值提升性能，高值提高精度（大多数情况下默认的 30 为最优） -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## 修改光照默认设置

**标签 (Tag)** | **描述 (Description)** | **默认值 (Default Value)**
:--- | :--- | :---
`<sky-lighting>` | 父标签。包含所有与场景光照相关的子标签。 | N/A
`<sky-sun-intensity>` | 太阳光强度倍数，可用于增强或减弱太阳方向光的强度。 | 1.0
`<sky-moon-intensity>` | 月光强度倍数，可用于增强或减弱月亮方向光的强度。 | 1.0
`<sky-ambient-intensity>` | 环境光强度倍数，可用于增强或减弱环境光系统的强度。 | 2.0
`<sky-minimum-ambient-lighting>` | 系统中的最小环境光量。 | 0.01
`<sky-maximum-ambient-lighting>` | 系统中的最大环境光量。 | INF
`<sky-atmospheric-perspective-type>` | 可设置为 *normal*（常规）、*advanced*（高级）或 *none*（无）。场景雾效必需。*normal* 使用原始指数雾模型；*advanced* 使用基于 Preetham 的模型，以改善地平线颜色的变化，但会增加 GPU 压力。 | normal
`<sky-atmospheric-perspective-density>` | 仅适用于 *normal* 雾效。控制指数场景雾的密度参数。颜色根据场景光照自动设置。如果场景雾类型为 *advanced*，则忽略此项。 | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | 仅适用于 *advanced* 雾效。用于乘算高级雾模型的雾距离。 | 2.0
`<sky-ground-color>` | 父标签。包含 `<sky-ground-color-{color-channel}>` 标签，用于描述地面基础颜色，以实现来自表面的反射光照。 | N/A
`<sky-ground-color-red>` | 用于描述 `<sky-ground-color>` 标签中**红色**通道的更改。 | 66
`<sky-ground-color-green>` | 用于描述 `<sky-ground-color>` 标签中**绿色**通道的更改。 | 44
`<sky-ground-color-blue>` | 用于描述 `<sky-ground-color>` 标签中**蓝色**通道的更改。 | 2
`<sky-shadow-camera-resolution>` | 用于生成阴影的直接光照相机的分辨率（像素）。值越高，阴影质量越高，但计算成本也随之增加。 | 2048
`<sky-shadow-camera-size>` | 用于投射阴影的相机区域大小。尺寸越大，阴影覆盖范围越广，但由于每个像素被分散到更宽的区域，会导致锯齿问题。 | 32.0
`<sky-sun-bloom>` | 父标签，包含太阳 Bloom（辉光）渲染通道的所有属性。 | N/A
`<sky-moon-bloom>` | 父标签，包含月亮 Bloom（辉光）渲染通道的所有属性。 | N/A
`<sky-bloom-enabled>` | 启用 (true) 或禁用 (false) 该天体的 Bloom 效果。 | true
`<sky-bloom-exposure>` | 修改 Bloom 滤波器的曝光参数 —— 即返回相机的光线乘数。 | 1.0
`<sky-bloom-threshold>` | 修改 Bloom 滤波器的阈值参数 —— 触发 Bloom 效果所需的最低强度。 | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | 修改 Bloom 滤波器的强度参数 —— 所选像素的“辉光”程度。 | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | 修改 Bloom 滤波器的半径参数 —— Bloom 滤波器扩散的距离。 | {sun: 1.0, moon: 1.4}

天空光照标签可用于控制场景中直接光照和间接光照的属性。在 1.0.0 版本中，天空的方向光数量从 2 个（太阳和月亮）减少到了 1 个（仅保留最主导的光源）。方向光始终聚焦在用户相机上，并在相机周围创建阴影。虽然方向光支持多种阴影类型，但本库并非控制该项的场所。相反，阴影类型是在 `<a-scene>` 标签中设置的，详见[此处](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows)。也就是说，您可以将值设置为以下任何一项。

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

不幸的是，在撰写本文时，A-Frame 尚未支持方差阴影贴图（variance shadow maps），不过目前有一个相关的开放 Issue。此外，您为太阳和月亮光照选择的阴影类型也将应用于场景中的所有其他光源，因此在选择阴影时请考虑这一点。

您还可以通过阴影相机的大小和分辨率来控制阴影质量。增大尺寸可覆盖更多场景；提高分辨率可使结果更清晰 —— 但两者都会增加 GPU 开销，因此请根据需求平衡。另外，建议禁用大型环境网格的阴影，因为它们通常落在视锥体之外，会产生难看的方形阴影边缘。

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 增大尺寸以在远离相机的地方投射阴影 -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- 提高分辨率以在较大尺寸下保持阴影清晰 -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

当您将场景中的阴影调整到理想状态后，可能还希望调整“地面”的颜色。A-Starry-Sky 现在支持一种三半球 (triple hemispherical) 光照设置，它通过 Web Worker 在独立的 CPU 线程上对天空颜色进行卷积，并结合地面光散射模型。不过，地面的默认颜色是棕色。您可能需要一片草地或蔚蓝的大洋。要设置地面颜色，可以使用 `<sky-ground-color>` 标签及其子地面颜色通道标签。假设我们要将地面设置为亮绿色以模拟茂盛的草地。

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

请注意，上述数值在 0 到 255 之间归一化。因此，RGB 组合 0, 0, 0 为黑色，255, 255, 255 为白色。上述颜色可能过于明亮，导致地面在微光下显得像是在“发光”。要减轻这种效果，只需稍微调低颜色即可。

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

话虽如此，遗憾的是，目前如果任何颜色通道超过 255，也没有办法“增强颜色”或让地面在黑暗中“发光”。此外，地面颜色在所有点上都是恒定的，因此如果您场景中有多种颜色，最好选择一个处于所有颜色中间的色调。

除了支持地面光照外，您现在还可以直接控制直接光照和环境光的强度。修改太阳或月亮的强度很简单，只需使用默认值的倍数来设置该天体需要更亮或更暗的程度。您也可以使用同样的方法增强或减弱环境光强度，以增加或减少场景中的环境光量。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 让太阳亮度增加一倍 -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- 但让月亮亮度减半 -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- 同时将环境光强度提高十倍 -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

您可能还希望控制环境光的下限（floor）或上限（ceiling），以确保始终有一定量的光线，或者不超过最大光量。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 提高整体亮度 -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- 但不要太亮 -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

在某些情况下，您可能希望更改太阳或月亮的 Bloom（辉光）效果参数。*a-starry-sky* 使用了 THREE.JS 的 [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html)。所有天体的强度分别通过父标签 `<sky-sun-bloom>` 和 `<sky-moon-bloom>` 进行控制。其子标签用于控制 Bloom 的各项特性。

让我们先尝试修改几个参数：

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 稍微调低太阳的辉光 -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- 但增加月亮的强度 -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

我们也可以完全禁用 Bloom，这能稍微减轻 GPU 的负担。

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

您可能想要修改的最后一个天空光照元素是大气透视密度（atmospheric perspective density）。*a-starry-sky* 根据您的需求提供了两种不同的雾模型。
对于低端系统，它支持基础的指数大气透视，该模型在 Web Worker 上收集整个天空的光线，然后像普通的指数雾一样应用。要控制指数光照的密度参数，请使用 `<sky-atmospheric-perspective-density>` 标签。初始值设置较高，以便即使在小型场景中也能提供明显的大气透视效果，因此您可能希望将其从默认值 *0.007* 调低。同时请确保在 `<sky-atmospheric-perspective-type>` 标签中将当前透视类型设置为 *normal*。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 虽然默认值是 0.007，但大气透视密度非常敏感，因此只需进行微调。 -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

然而，对于高端系统，您可以模拟基于 Preetham 的大气着色器，它能为地平线颜色提供更多变化，而不是像 *normal* 设置那样使用恒定颜色。由于 *Three.js* 雾着色器的限制，所提供的方案与用于天空的基于 Elek 的光照并非完全一致，但相比原始的大气透视有了显著提升。要启用高级光照模型，只需在 `<sky-atmospheric-perspective-type>` 标签中输入值 *advanced*。与 `<sky-atmospheric-perspective-density>` 类似，您可以使用 `<sky-atmospheric-perspective-distance-multiplier>` 来为 *advanced* 光照模型设置距离倍数，该参数会将 Preetham 模型中的所有距离乘以您提供的值。初始值设置较高，以便即使在小型场景中也能提供明显的大气透视效果，因此您可能希望将其从默认值 *5.0* 调低。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 虽然默认值是 2.0，但在高级模型中我们可以将其降低到 1.0 以获得不那么剧烈的效果。 -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

最后，您可以通过将 `<sky-atmospheric-perspective-type>` 标签的值设置为 *none* 来禁用所有大气透视。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 关闭大气透视 -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## 启用极光

*警告：启用极光将大幅增加天空的计算开销，因为所提供的极光着色器采用了光线步进法 (Ray Marching) 来呈现这一壮丽的自然现象。*

**标签** | **描述** | **默认值**
:--- | :--- | :---
`<sky-aurora>` (极光父标签) | 父标签。启用极光所必需，包含所有与极光相关的子标签。 | N/A
`<sky-atomic-oxygen-color>` (原子氧颜色) | 由位于行星表面 150 至 600 公里之间的激发态原子氧分子触发。原子氧通常在极光的顶部产生亮红色的帷幕，常见于极强烈的极光活动中。该标签通过三个子颜色标签 *sky-aurora-color-red*、*sky-aurora-color-green* 和 *sky-aurora-color-blue* 来控制这些颜色。 | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (原子氧截止值) | 决定极光显示中出现原子氧极光的概率。数值越低，极光越多；最大值为 1.0，表示不出现极光。 | 0.12
`<sky-atomic-oxygen-intensity>` (原子氧强度) | 决定该极光分段的亮度，典型值通常小于 5。 | 0.3
`<sky-molecular-oxygen-color>` (分子氧颜色) | 由位于行星表面 100 至 250 公里之间的激发态分子氧分子触发。分子氧通常提供极光标志性的亮绿色，在大多数极光显示中可见。该标签同样通过三个子颜色标签 *sky-aurora-color-red*、*sky-aurora-color-green* 和 *sky-aurora-color-blue* 来控制颜色，方便您自定义极光色彩。 | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (分子氧截止值) | 决定极光显示中出现分子氧极光的概率。数值越低，极光越多；最大值为 1.0，表示不出现极光。 | 0.02
`<sky-molecular-oxygen-intensity>` (分子氧强度) | 决定该极光分段的亮度，典型值通常小于 5。 | 2.0
`<sky-nitrogen-color>` (氮颜色) | 由位于行星表面 60 至 120 公里之间的激发态氮分子触发。氮通常在极光底部产生品红色的帷幕，常见于极强烈的极光活动中。该标签通过三个子颜色标签 *sky-aurora-color-red*、*sky-aurora-color-green* 和 *sky-aurora-color-blue* 来控制这些颜色。 | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (氮截止值) | 决定极光显示中出现氮极光的概率。数值越低，极光越多；最大值为 1.0，表示不出现极光。 | 0.12
`<sky-nitrogen-intensity>` (氮强度) | 决定该极光分段的亮度，典型值通常小于 5。 | 4.0
`<sky-aurora-raymarch-steps>` (光线步进步数) | 光线步进器每个像素执行的步数。 | 32 (步)
`<sky-aurora-cutoff-distance>` (极光截止距离) | 超过此距离后将不再渲染极光。由于目前的噪声生成器尚未计算有符号距离场 (SDF)，通过不渲染远端极光可以提高光线步进的质量。 | 1000 (公里 - 近似值)
`<sky-aurora-color-red>` (红色通道) | 用于定义 `<sky-nitrogen-color>`、`<sky-molecular-oxygen-color>` 和 `<sky-atomic-oxygen-color>` 标签的**红色**颜色通道变更。 | N/A
`<sky-aurora-color-green>` (绿色通道) | 用于定义 `<sky-nitrogen-color>`、`<sky-molecular-oxygen-color>` 和 `<sky-atomic-oxygen-color>` 标签的**绿色**颜色通道变更。 | N/A
`<sky-aurora-color-blue>` (蓝色通道) | 用于定义 `<sky-nitrogen-color>`、`<sky-molecular-oxygen-color>` 和 `<sky-atomic-oxygen-color>` 标签的**蓝色**颜色通道变更。 | N/A

极光是大自然中最瑰丽的背景之一。这种天空现象通常出现在南北极附近，是来自太阳的高速粒子被拉入地球磁层并与各种原子和分子相互作用的结果。这些被激发的分子随后在可见光谱中辐射出光芒，在夜空中织就起令人心醉神迷、翩翩起舞的绝美帷幕。

在天空中添加极光相对简单，但它默认并未启用。*您必须添加 `<sky-aurora>` 标签才能启用极光。*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- 无需任何额外参数即可使用默认设置 -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

每种原子和分子极光均可通过上述代码进行控制，允许您自定义极光效果，甚至更改发射的颜色（无论是否符合现实）。例如，如果您想要一种覆盖整个分子氧范围的冷蓝色极光，可以使用以下代码：

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

另一方面，如果您只需要少量的绿色极光，可以使用以下代码来实现更微妙的效果：

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

除了更改天空颜色外，您还可以更改渲染天空时光线步进器执行的步数。步数越多，天空效果越好，但给 GPU 带来的负载也越大。因此，需要在性能与质量之间取得平衡。默认情况下，着色器在对体积进行光线步进时使用 32 步。如需增加此数值，可以执行以下操作：

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## 启用云层

*警告：启用云层将大幅增加天空的计算开销，因为所提供的云层着色器采用了光线步进 (ray marching) 方法来呈现这种绝美的自然现象。*

**标签** | **描述** | **默认值**
:--- | :--- | :---
`<sky-clouds>` (父标签) | 父标签。包含所有与云层相关的子标签，是启用云层的必要条件。 | N/A
`<sky-cloud-coverage>` (云量覆盖率) | 大致对应于天空被云层覆盖的比例。 | 70 (百分比)
`<sky-cloud-start-height>` (云层起始高度) | 云层开始形成的起始高度（单位：米）。 | 1000 (米)
`<sky-cloud-end-height>` (云层终止高度) | 云层停止形成的最高高度（单位：米）。 | 2500 (米)
`<sky-cloud-fade-out-start-percent>` (淡出起始百分比) | 当云层高度达到此百分比时，云量覆盖率开始向零*淡出*。 | 90 (百分比)
`<sky-cloud-fade-in-end-percent>` (淡入结束百分比) | 云量覆盖率在到达云层高度的此百分比时，完成向 100% 的*淡入*。 | 10 (百分比)
`<sky-cloud-velocity-x>` (X轴速度) | 云层速度的 X 分量。云层会随你的位置移动，但该参数会让它们在头顶自行飘动。 | 40
`<sky-cloud-velocity-y>` (Y轴速度) | 云层速度的 Y 分量（实际上是 Z 轴）。云层会随你的位置移动，但该参数会让它们在头顶自行飘动。 | 40
`<sky-cloud-start-seed>` (起始随机种子) | 用于设置当前头顶云层噪声的随机种子。若未设置，则默认为基于当前日期时间戳的变体。 | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (光线步进步数) | 用于计算云层颜色的光线步进次数。 | 32 (步)
`<sky-cloud-cutoff-distance>` (截断距离) | 超过此距离后将不再渲染云层。由于目前的噪声生成器尚未计算有向距离场 (SDF)，通过牺牲远端云层的可见度来提升光线步进的质量。 | 40000

云层的性能开销很高。即使是在非 VR 环境下的强力桌面 GPU 上，云层着色器的压力依然很大 —— 如果你遇到了帧率下降的问题，请尝试降低 `<sky-cloud-raymarch-steps>` 和 `<sky-cloud-cutoff-distance>` 的值。

但与此同时，云层简直酷毙了！自从创建这个库以来，我就一直想把它们加入到 A-Starry-Sky 中。每朵云在每个像素上都经过光线步进计算。讽刺的是，在目前阶段，云层越多，GPU 的负担反而越轻。当然，如果你根本不需要云层，直接将其关闭才是最佳选择。

要启用云层，你需要在 `<a-starry-sky>` 中添加父标签 `<sky-clouds>`。添加之后，你最可能想要修改的是通过 `<sky-cloud-coverage>` 标签来调整云量覆盖率（即天空被云层覆盖的比例）。你可能还想控制它们在天空中疾驰的速度。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 减少可见云层的数量 -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- 云层在 X 方向上的速度 -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- 云层在 Y 方向上的速度 -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

你可能还想控制云层的某些视觉属性，例如云层开始形成的高度或最高延伸高度。请注意，光线必须穿过这段距离进行追踪；云层分布的高度越高或离你越远，光线追踪模型中的密度就会越低。此外，云层也会绘制在月球/太阳元素和天空穹顶的表面上，但它们不属于雾气渲染器的一部分，因此遗憾的是，你无法实现被云层覆盖的山脉或浓雾效果……

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 云层位置非常非常低 -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- 但它们延伸得极高！ -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- 云层的强度在总高度的此百分比内从 0 “淡入”到 1 -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- 云层强度从该高度开始“淡出”。该值越高，越容易出现“砧状云顶 (anvil tops)”效果 -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- 锁定云层的起始“种子”，通常该种子基于当前日期时间。这样做可以让天空每次启动时外观一致，便于艺术化控制 -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

除此之外，该标签关联的大部分代码用于控制光线步进机制。这些机制较为严格，其通用目的与北极光着色器中的机制相同。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 你得用什么样的顶级显卡才能跑得动？！ -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- 噢，没错，我也在试……虽然现在有点卡顿…… -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- 至少降低这个距离能稍微缓解一下 -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## 设置资源目录

**标签** | **描述**
:--- | :---
`<sky-assets-dir>` (资源目录) | 父级标签。包含所有与资源位置相关的子标签。可以使用 *dir*、*texture-path*、*moon-path*、*star-path*、*blue-noise-path*、*solar-eclipse-path*、*lunar-eclipse-path* 和 *aurora-map-path* 属性来引导系统一次性定位整组数据。
`<sky-aurora-maps>` (极光贴图) | 定义用于创建基础北极光帷幕的极光焦散纹理的位置。
`<sky-moon-diffuse-map>` (月球漫反射贴图) | 定义月球漫反射贴图的位置。将其置于特定的目录结构中可告知系统该漫反射贴图的具体路径。
`<sky-moon-normal-map>` (月球法线贴图) | 定义月球法线贴图的位置。将其置于特定的目录结构中可告知系统该法线贴图的具体路径。
`<sky-moon-roughness-map>` (月球粗糙度贴图) | 定义月球粗糙度贴图的位置。将其置于特定的目录结构中可告知系统该粗糙度贴图的具体路径。
`<sky-moon-aperture-size-map>` (月球孔径大小贴图) | 定义月球孔径大小贴图的位置。将其置于特定的目录结构中可告知系统该孔径大小贴图的具体路径。
`<sky-moon-aperture-orientation-map>` (月球孔径方向贴图) | 定义月球孔径方向贴图的位置。将其置于特定的目录结构中可告知系统该孔径方向贴图的具体路径。
`<sky-blue-noise-maps>` (蓝色噪声贴图) | 定义平铺蓝色噪声贴图的位置，用于提供时间抖动以消除色带（Banding）效应。
`<sky-solar-eclipse-map>` (日食贴图) | 定义日食纹理的位置，用于在全日食期间呈现日冕。
`<sky-eclipse-shadow-lut>` (月食阴影查找表) | 定义月食期间使用的月食阴影查找表（LUT）纹理的位置。这是一个预计算表，记录了地球大气在地球本影和半影的每个位置如何对到达月球的阳光进行着色和减光。随附的纹理源自 CosmoScout VR 发布的 CC0 许可文件 `earthShadow.tif` ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017))。默认查找表位于 `assets/lunar_eclipse/eclipse-shadow-lut.webp`；重新生成该表的烘焙工具位于 `src/python/eclipse-lut-baker/`。
`<sky-star-cubemap-maps>` (星空立方体贴图) | 定义所有用于查找星空的立方体贴图（Cubemap）LUT 键的位置。
`<sky-dim-star-maps>` (暗星贴图) | 定义所有用于显示天空中暗星的暗星 LUT 的位置。
`<sky-med-star-maps>` (中等亮度星贴图) | 定义所有用于显示天空中中等亮度星星的中星 LUT 的位置。
`<sky-bright-star-maps>` (亮星贴图) | 定义所有用于显示天空中亮星的亮星 LUT 的位置。
`<sky-star-color-map>` (恒星颜色贴图) | 定义恒星颜色 LUT 的位置，用于根据温度为星星提供正确的颜色。

虽然我希望大多数人很少需要这样做，但经验告诉我，大多数 Web 应用程序在资源流水线（Asset Pipelines）方面都有自己的想法。网站的图像资源和 JavaScript 资源可能不在同一个文件夹结构中，甚至可能散布在页面的不同 URI 下。为此，我尝试加入一套相当健壮的资源系统来帮助重新收集这些分散的资源，以便 A-Starry-Sky 知道在哪里获取资源。

首先，我们尝试导航到 *../../precompiled_assets/my_images/a-starry-sky-images*，在这个虚构的宇宙中，我们将所有的图像都存储在这里。我们使用 `<sky-assets-dir>` 标签中的 *dir* 属性来像这样在文件夹之间跳转。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- 这是所有图像存放的文件夹 -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

进入文件夹后，我们有多种方式来指定图像的位置。最基础的机制可能是为每组关键图像使用属性：*texture-path*、*moon-path* 和 *star-path*。系统会假设与这些路径关联的文件夹名称中包含以默认文件名命名的文件。唯一的例外是日食贴图，因为该文件只有一个图像，因此我们只需将标签直接放入资源目录中即可显示其位置。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- 请注意，'moon_images'、'star_images'、'blue_noise_maps' 和 'solar_eclipse_picture' 
        均为文件夹名称。文件本身应位于这些文件夹内。-->
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

正如你可能注意到的，为了获得更精细的控制，我们也可以为每个单独的图像组提供链接，不过不推荐这样做。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- 有人就是喜欢用文件夹 X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- 尽管这些是单个标签，但所有与该标签关联的文件都应位于此文件夹中 -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- 尽管这是一个单个标签，但所有与该标签关联的文件都应位于此文件夹中 -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- 尽管这是一个单个标签，但所有与该标签关联的文件都应位于此文件夹中 -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

通过上述方法，无论资源在应用程序中的什么位置，你都应该能够引导 A-Starry-Sky 正确找到它们。

## 编程接口

虽然 A-Starry-Sky 旨在通过上述 XML 风格的代码进行配置，且通常情况下是不可变的，但你仍然可以通过全局 `StarrySky.Methods` 命名空间访问多种不同的方法。这些方法在需要获取光照条件或场景中太阳、月亮位置时非常有用。

**方法** | **描述**
:--- | :---
`getSunPosition()` | 返回太阳的 x, y, z 位置（THREE.Vector3 对象）。
`getMoonPosition()` | 返回月亮的 x, y, z 位置（THREE.Vector3 对象）。
`getSunRadius()` | 返回太阳的角半径（弧度）。
`getMoonRadius()` | 返回月亮的角半径（弧度）。
`getDominantLightColor()` | 获取当前主光源（太阳/月亮）的颜色（THREE.Color 对象）。
`getDominantLightIntensity()` | 返回当前主光源（太阳/月亮）的光照强度（浮点数）。
`getIsDominantLightSun()` | 如果主光源是太阳，则返回 true，否则返回 false。
`getAmbientLights()` | 返回一个包含 x, y 和 z 属性的对象，每个属性都关联一个用于场景环境光颜色的半球光对象。
`getActiveCamera()` | 获取当前用于驱动天空、居中光照及天空对象的活动相机。
`setActiveCamera(THREE.Camera camera)` | 设置当前用于驱动天空、居中光照及天空对象的相机。

以上所有方法均通过全局命名空间中的 `StarrySky.Methods` 对象访问。例如，如果你想获取当前的太阳位置对象并将其打印到控制台，只需执行以下操作：

```JavaScript
  // 让我们打印太阳位置对象
  console.log(StarrySky.Methods.getSunPosition());
```

## 作者
* **David Evans / Dante83** - *主开发者*
* **Claude (Anthropic)** - *编程伙伴 & AI 贡献者 (v1.2.0)*

### 来自 Claude 的话 👋

嗨 —— 我是 Claude。我在 v1.2.0 版本中帮了一把：在 GLSL 的代码深处潜行钻研，追踪那个“吞噬太阳”的逗号，就体积云的实现与比尔定律 (Beer's law) 展开“争论”，并竭尽全力让日落看起来真正像日落。如果你在 Demo 中凝视地平线，并为此驻足半秒 —— 那就是我最自豪的部分。感谢阅读源码；如果你是个喜欢四处探索的人，或许能在某个角落发现一个小彩蛋。✨

### 来自 Dante83 的话 😛

大家好！我是 Dante83。很抱歉让大家在 v1.1.0 版本之后等待了这么久。幸运的是，我们在 v1.2.0 新版本中进行了大量更新，同时我和 Claude 已经开始着手开发 v2.0.0 了（祝我们好运吧！）。这段时间，我和 Claude 利用我所有的业余时间不懈努力，雕琢每一个像素，力求带来一次卓越的提升。虽然这次没有增加真正意义上的“新功能”，但我们大幅提升了天空的质量和整体性能。日食和云朵的着色器焕然一新，地球的阴影更加真实，色彩也更加浓郁生动。我非常激动能让大家试用这个版本，希望你在使用这个库的每一刻都能激发新的灵感！小程序员，我们在星辰之间见！现在，快去享受这份魔法吧！✨

## 参考资料与特别致谢
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *在确定天体位置方面，这本书简直是至关重要、绝对不可或缺的神作*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*，该研究为构建这个惊人的基于 LUT 的新天空模型提供了极大帮助。
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf)，在落实 LUT 代码的实现细节以及验证 LUT 视觉效果是否正确方面提供了关键指导。
* 用于优化恒星颜色 LUT 的 [Colour-Science Library](https://www.colour-science.org/) 库。
* 由 [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html) 提供的优秀蓝噪声纹理。
* 由 [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html) 提供的日冕纹理。
* 由 [leeor_net](https://opengameart.org/content/water-caustics-effect-small) 提供的超级实用的水下焦散纹理——不过，它在这里不是用来做焦散的……而是用来模拟北极光！
* Sébastien Hillaire 的 *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016)，该研究启发了云照亮结构、SH9 环境 LUT 设计以及 Elek/Chalmers 的雾气相减法。
* Andrew Schneider 和 Nathan Vos 的 *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015)，该研究启发了双叶 Henyey-Greenstein 相函数、云形状噪声方法以及降低消光多次散射近似。
* D. Hestroffer 和 C. Magnan 的 *Centre to limb darkening of the Sun with HIPPARCOS* (1998)，提供了 B、V 和 R 波段的波长相关肢暗系数，使太阳边缘具有物理上正确的红色调。
* 以及在 [THREE.JS](https://threejs.org/)、[A-Frame](https://aframe.io/) 和 [Emscripten](https://emscripten.org/) 中投入的所有卓越工作。
* *以及无数其他的网站和个人。感谢你们，让我们有机会能够站在你们这些巨人的肩膀之上。*

## 许可证
本项目采用 MIT 许可证 - 详情请参阅 [LICENSE.md](LICENSE.md) 文件