# A-Starry-Sky

A-Starry-Skyは、[A-Frame Web Framework](https://aframe.io/)用のスカイドームです。作品の中に美しい昼夜サイクルを簡単に導入できるコンポーネントを提供することを目的としています。

> **警告：高性能なGPUが必要です。スマートフォンでは開かないでください。**

**[ライブデモ](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — サンフランシスコの現在の日時における空を表示しています。

| 例 | 説明 |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | 特定の時間帯に設定した砂漠のシーン |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | コロナを伴う皆既日食 |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | 月に落ちる地球の影（月食） |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | 木星と土星の大接近（西暦1226年） |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | カスタム設定の火星の大気 |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | ミー散乱およびレイリー散乱の異なる設定値 |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | 高度20kmから見た空 |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ GPU負荷が高いです |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ GPU負荷が高いです（薄い雲） |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ GPU負荷が高いです（中程度の雲） |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ GPU負荷が高いです（厚い雲） |

## 前提条件

本プロジェクトは [A-Frame Web Framework](https://aframe.io/) のバージョン 1.7.0 以降向けに構築されています。また、WebXR 対応のウェブブラウザが必要です。

`https://aframe.io/releases/1.7.0/aframe.min.js`

## インストール

`a-starry-sky.v1.2.0.min.js` と `assets` および `wasm` フォルダをプロジェクトにコピーしてください。次に、以下のスクリプトを HTML に追加します。なお、`starry-sky-web-worker.js` はここには含まれていません。代わりに `<a-starry-sky>` タグで直接参照されます。

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{JSフォルダへのパス}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{JSフォルダへのパス}/wasm/interpolation-engine.js"></script>
```

これらの参照設定が完了したら、次のように A-Frame の `<a-scene>` タグ内に `<a-starry-sky>` コンポーネントを追加し、スカイステート（sky-state）の Web Worker URL を指定してください。

```html
<a-scene>
  <a-starry-sky web-worker-src="{JSフォルダへのパス}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

この最小限のコードで、カリフォルニア州サンフランシスコの緯度・経度に基づいたリアルタイムに動く空が表示されます。しかし、これだけではありません。A-Starry-Sky には、空の状態をカスタマイズするための多数のカスタム HTML タグが用意されています。

**注意：このスカイボックスは不変（immutable）です。つまり、ページ読み込み時の設定が固定され、変更できないことを意味します。残念ながら、現時点ではコードを可変にするのは非常に困難です。**

## 場所の設定

**タグ** | **説明** | **デフォルト値**
:--- | :--- | :---
`<sky-location>` | 親タグ。`<sky-latitude>` と `<sky-longitude>` の子タグを含みます。 | N/A
`<sky-latitude>` | 場所の緯度を設定します。北半球は**正（プラス）**の値になります。 | 38
`<sky-longitude>` | 場所の経度を設定します。[本初子午線](https://en.wikipedia.org/wiki/Prime_meridian)より西側は**負（マイナス）**の値になります。 | -122

地球上のあらゆる緯度・経度に空を設定できます。太陽や月の軌道を変えることで、プレイヤーに季節感を与えることができます。また、緯度によって夜空に見える星が変わります。さらに、緯度と経度の両方は、日食や月食などの時間依存のイベントにおいて非常に重要です。特に皆既日食を体験させたい場合には不可欠と言えるでしょう。

とはいえ、場所を設定すること自体は、どこにするか決めることよりもずっと簡単です。[Google Earth](https://earth.google.com/web/) やその他の地図ソースから希望の場所を探し、以下のようにそれぞれのタグに値を入力してください。

ニューヨークへ行ってみましょう！
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

では、オーストラリアのパースはどうでしょうか？
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

[本初子午線](https://en.wikipedia.org/wiki/Prime_meridian)より西の経度は負の値（例：ニューヨーク、ブエノスアイレス）になることに注意してください。

## 時刻の設定

**タグ** | **説明** | **デフォルト値**
:--- | :--- | :---
`<sky-time>`（親タグ） | 日付や時刻に関するすべての子タグを包含します。 | N/A
`<sky-date>`（日付・時刻） | **年-月-日 時:分:秒** 形式のローカル日時文字列。例：*2021-03-21 13:45:51*。時間は0〜23時の24時間制で指定します（0は午前0時、23は午後11時）。 | 現在の日付
`<sky-speed>`（時間速度） | 天体計算を加速または減速させるための時間倍率です。 | 1.0
`<sky-utc-offset>`（UTCオフセット） | この場所のUTCオフセット。経度とは逆に、[本初子午線](https://en.wikipedia.org/wiki/Prime_meridian)より西側は負の値になります。**なお、UTC時刻に夏時間（DST）は適用されません** | 7

`<sky-date>` に選択した場所の**ローカル時刻**を設定し、`<sky-utc-offset>` をそのタイムゾーンに合わせて設定してください。例えば、ニューヨーク市は夏はUTC-4、冬はUTC-5となります。夏時間は自動的に適用されません。

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

ここでも、時刻設定に関連するすべての子タグを包含する親タグ `<sky-time>` を追加している点に注目してください。

とはいえ、単にマシンのローカル時刻に従う必要はありません。もっと面白いことをしてみましょう。そう、タイムトラベルです！[2024年4月8日午後1時27分（24時間表記で13:27）、テキサス州デル・リオ](https://nationaleclipse.com/cities_total.html)で刺激的な[日食](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html)が起こると聞きました。さっそく見に行ってみましょう！

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

[クリスマス・スター](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)を見逃しましたか？いえいえ、最近のやつではありません。西暦1226年のものです。タイムマシンがあって、さらに A-Starry-Sky が惑星に対応していて本当に良かったですね :D

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

タイムトラベルも楽しいですが、時間の「速度」を変えることにも興味があるかもしれません。ゲームの世界では昼夜のサイクルを現実より速くしたり、ライティングのために特定の瞬間で時間を完全に止めたい場合もあるでしょう。その場合は、`<sky-speed>` タグを追加してください。

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

もちろん、永続的なワールドでこれを実装する場合は、HTMLを作成する際に加速された時間の流れを考慮してください。空の動的なHTML設定については、用途に合わせて自由に構築してください。

## 大気設定の変更

**タグ** | **説明** | **デフォルト値**
:--- | :--- | :---
`<sky-atmospheric-parameters>` (親タグ) | 親タグ。大気設定に関連するすべての子タグを含みます。 | N/A
`<sky-camera-height>` (カメラ高度) | 地球面からのカメラの高さ。 | 0.0km
`<sky-mie-directional-g>` (ミー散乱方向性G) | ミー散乱による前方散乱の度合いを定義します。ミー散乱は、大気中の大きな粒子によって太陽の周囲に見える白い光輪（ハロー）のことです。この値が高いほど、大気が埃っぽく見えます。 | 0.8
`<sky-sun-intensity>` (太陽強度) | 大気シェーダーにおける太陽の強度。 | 1367.0
`<sky-moon-intensity>` (月強度) | 大気シェーダーにおける月の強度。 | 29.0
`<sky-mie-beta>` (ミー散乱ベータ) | ミー散乱の光散乱における色依存性です。主に太陽付近の「グロー（輝き）」を制御します。散乱はすべての周波数でほぼ均一です。 | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` (レイリー散乱ベータ) | レイリー散乱の光散乱における色依存性です。主に空の青い散乱を制御します。デフォルトでは、青チャンネルが最も強く散乱されるようになっています。 | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` (オゾンベータ) | オゾン層の光散乱における色依存性です。日没時の深い青色の表現に不可欠です。 | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` (大気高度) | 大気が「終わる」境界となる高さ（カットオフ高度）。 | 80.0 km
`<sky-radius-of-earth>` (地球半径) | 惑星または地球の半径。 | 6366.7 km
`<sky-rayleigh-scale-height>` (レイリー散乱スケール高さ) | レイリー散乱の減衰スケール高さ（指数関数的な減衰を想定）。レイリー散乱は大気ガスによるものであるため、スケール高さは非常に大きくなります。 | 8.4
`<sky-mie-scale-height>` (ミー散乱スケール高さ) | ミー散乱の減衰スケール高さ（指数関数的な減衰を想定）。ミー散乱はより大きな粒子によるものであるため、減衰が速くなる傾向があり、特性高さスケールは小さくなります。 | 1.25
`<sky-ozone-percent-of-rayleigh>` (オゾン比率) | 空に含まれるオゾンの割合で、日没時のオゾンによる反射（リターン）を設定するために使用されます。 | 6E-7
`<sky-moon-angular-diameter>` (月の視直径) | 空に見える月の視直径。 | 3.15 degrees
`<sky-sun-angular-diameter>` (太陽の視直径) | 空に見える太陽の視直径。 | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` (LUTレイステップ数) | 大気LUT（ルックアップテーブル）の光を収集する際、レイトレーサーが空の端まで進むステップ数。 | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` (LUT収集ステップ数) | k次散乱のために、レイ上の各点で行われる角度ステップ数。 | 30 steps
`<sky-number-of-scattering-orders>` (散乱次数) | インスキャッタリングLUTにベイクする高次（k次）散乱パスの数。値を大きくすると品質が向上しますが、LUTのベイク時間が長くなります。 | 4
`<sky-parameters-color-red>` (赤色成分) | `<sky-rayleigh-beta>`、`<sky-mie-beta>`、`<sky-ozone-beta>` タグで使用される赤色成分。 | N/A
`<sky-parameters-color-green>` (緑色成分) | `<sky-rayleigh-beta>`、`<sky-mie-beta>`、`<sky-ozone-beta>` タグで使用される緑色成分。 | N/A
`<sky-parameters-color-blue>` (青色成分) | `<sky-rayleigh-beta>`、`<sky-mie-beta>`、`<sky-ozone-beta>` タグで使用される青色成分。 | N/A

大気パラメータは、コードベース全体の中でも最も広範なAPIの一つです。熟練した開発者であればこれらの値を使ってカスタムスカイを作成できますが、ほとんどのユーザーはデフォルト設定のままで十分でしょう。とはいえ、いくつか特に有用で理解しやすい値があります。

最も変更したいと思われる要素の一つが、太陽と月のサイズです。現実の世界では、太陽の視直径は約0.53度、月の視直径は約0.50度です。シミュレーターでこれらの値を使用するとより現実に近くなりますが、ほとんどのシミュレーション（特にモニターのような非VRデバイス）では小さすぎて見えにくい傾向があります。値を大きくしたり小さくしたりするには、対応するタグの数値を変更してください。

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

また、惑星からの開始高度を変更したい場合もあるでしょう。これは `<sky-camera-height>` タグで簡単に設定できます。なお、カメラを上下に移動させると、空の状態も動的に高さに合わせて変化します。このタグではシーンの初期高度をキロメートル単位で設定し、最大値は *80km*、最小値は *0km* となります。

[高高度の例 (High Altitude Example)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- 少し高く登ってみましょう。上空は空気が薄くなります。 -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

さらに、大気の組成を変更することも可能です。この機能を使えば、さまざまなメカニズムを組み合わせて、思い通りの空を表現できます。例えば、デフォルトの値（5.8e-3, 1.35e-2, 3.31e-2）ではなく、[The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) で提示されているレイリー散乱の値 (5.19E-3, 1.21E-2, 2.96E-2) を使用し、beta値を 4.44E-3 から 2E-3 に変更したい場合は、コード内で簡単に書き換えることができます。

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

それだけでは少し物足りないかもしれませんね。もっと大胆なことをやってみましょう。[Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) の研究に従って、火星へ行ってみましょう！ 火星ではレイリー散乱とミー散乱の役割が入れ替わっているため、特性高さ（characteristic heights）も同様に入れ替える必要があります。火星での散乱の大部分は、非常に薄い大気の中にある大きな粒子によるミー散乱によるものです。したがって、実質的にミー（レイリー）を無効にし、それぞれの特性高さを入れ替えます。また、惑星の半径を変更し、レイトレーサーにとってより適切な値に大気の高さ（atmospheric height）を調整する必要があります。

[火星の例 (Mars Example)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- 火星は赤色の光をより多く散乱させる点に注目してください -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- ミー散乱へのいくつかの修正も有効です -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- オゾンを無効にするのを忘れずに -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- ここでは火星なので... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- 太陽はより小さく、月は完全に排除できます -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

また、LUTのレイステップ数も調整可能です。ただし、デフォルト値ですでにほぼ最適化されており、変更しても違いがほとんど分からないことが多いです。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- パフォーマンス重視なら低く、精度重視なら高く設定してください（ほとんどの場合、デフォルトの30が最適です） -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## ライティングのデフォルト設定の変更

**タグ** | **説明** | **デフォルト値**
:--- | :--- | :---
`<sky-lighting>` (親タグ) | シーンのライティングに関連するすべての子タグを含みます。 | N/A
`<sky-sun-intensity>` (太陽光強度) | 太陽光の強度倍率。太陽の方向性ライティング（directional lighting）の明るさを調整できます。 | 1.0
`<sky-moon-intensity>` (月光強度) | 月光の強度倍率。月の方向性ライティングの明るさを調整できます。 | 1.0
`<sky-ambient-intensity>` (環境光強度) | 環境光（ambient lighting）の強度倍率。環境光システムの明るさを調整できます。 | 2.0
`<sky-minimum-ambient-lighting>` (最小環境光) | システム内の環境光の最小量。 | 0.01
`<sky-maximum-ambient-lighting>` (最大環境光) | システム内の環境光の最大量。 | INF
`<sky-atmospheric-perspective-type>` (大気遠近法タイプ) | `normal`、`advanced`、または `none` に設定可能です。シーンフォグに必要です。`normal` は元の指数関数的フォグモデルを使用し、`advanced` は GPU 負荷は高くなりますが、地平線の色の変化を改善した Preetham ベースのモデルを使用します。 | normal
`<sky-atmospheric-perspective-density>` (大気遠近法密度) | `normal` フォグのみ有効。指数関数的なシーンフォグの密度パラメータを制御します。色はシーンライティングから自動的に設定されます。フォグタイプが `advanced` の場合は無視されます。 | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (大気遠近法距離倍率) | `advanced` フォグのみ有効。高度なフォグモデルにおけるフォグまでの距離に乗算されます。 | 2.0
`<sky-ground-color>` (地面の色・親タグ) | 表面からの反射ライティングのための地面のベースカラーを記述する `<sky-ground-color-{color-channel}>` タグを含みます。 | N/A
`<sky-ground-color-red>` (地面色・赤) | `<sky-ground-color>` タグの **赤 (red)** カラーチャンネルの変更に使用します。 | 66
`<sky-ground-color-green>` (地面色・緑) | `<sky-ground-color>` タグの **緑 (green)** カラーチャンネルの変更に使用します。 | 44
`<sky-ground-color-blue>` (地面色・青) | `<sky-ground-color>` タグの **青 (blue)** カラーチャンネルの変更に使用します。 | 2
`<sky-shadow-camera-resolution>` (シャドウカメラ解像度) | シャドウ生成に使用されるダイレクトライティングカメラの解像度（ピクセル）。値が高いほどシャドウの品質が向上しますが、計算コストが増加します。 | 2048
`<sky-shadow-camera-size>` (シャドウカメラサイズ) | シャドウを投影するカメラ領域のサイズ。サイズが大きいほどシャドウがカバーする範囲が広がりますが、カメラの各ピクセルがより広い範囲に分散されるため、エイリアシングの問題が発生しやすくなります。 | 32.0
`<sky-sun-bloom>` (太陽ブルーム・親タグ) | 太陽のブルーム（bloom）レンダーパスのすべてのプロパティを含みます。 | N/A
`<sky-moon-bloom>` (月ブルーム・親タグ) | 月のブルームレンダーパスのすべてのプロパティを含みます。 | N/A
`<sky-bloom-enabled>` (ブルーム有効化) | この天体のブルームを有効 (true) または無効 (false) にします。 | true
`<sky-bloom-exposure>` (ブルーム露出) | ブルームフィルタの露出（exposure）パラメータを変更します。カメラに戻される光に乗算される量です。 | 1.0
`<sky-bloom-threshold>` (ブルームしきい値) | ブルームフィルタのしきい値（threshold）パラメータを変更します。ブルームを有効にするための最小強度です。 | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (ブルーム強度) | ブルームフィルタの強度（strength）パラメータを変更します。選択されたピクセルがどれだけ「にじむ（bloom）」かを制御します。 | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (ブルーム半径) | ブルームフィルタの半径（radius）パラメータを変更します。ブルームフィルタが広がる距離です。 | {sun: 1.0, moon: 1.4}

スカイライティングタグを使用すると、シーン内の直接光および間接光の属性を制御できます。バージョン 1.0.0 では、方向性ライト（directional lights）の数が 2 つ（太陽と月）から 1 つ（最も支配的な光源のみ）に削減されました。この方向性ライトは常にユーザーのカメラに焦点を合わせ、その周囲にシャドウを生成します。方向性ライトはさまざまなシャドウタイプをサポートしていますが、このライブラリでそれを制御するわけではありません。代わりに、シャドウタイプは [こちら](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows) に記載されているように `<a-scene>` タグで設定します。つまり、以下のいずれかの値を設定できます。

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

残念ながら、本稿執筆時点では A-Frame はバリアンスシャドウマップ（variance shadow maps）をまだサポートしていません（オープンイシューとして存在しています）。また、太陽と月のライティングに選択したシャドウタイプは、シーン内の他のすべてのライトのシャドウタイプにも適用されるため、選択時にご注意ください。

シャドウカメラのサイズと解像度を通じて、シャドウの品質を制御することも可能です。サイズを大きくするとシーンのより広い範囲をカバーでき、解像度を上げると結果が鮮明になります。ただし、どちらも GPU コストがかかるため、ニーズに合わせてバランスを調整してください。また、大きな環境メッシュではシャドウを無効にすることを検討してください。これらは視錐台（frustum）の外に出ることが多く、不自然な四角いシャドウのエッジが生じやすいためです。

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- サイズを大きくして、カメラからより遠くまでシャドウを投影する -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- 解像度を上げて、サイズを大きくしてもシャドウの鮮明さを維持する -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

シーンのシャドウが適切に設定できたら、次は「地面（ground）」の色を調整したいと思うでしょう。A-Starry-Sky は現在、Web Worker 経由の別 CPU スレッドで、空の色の畳み込み（convolution）と地面の光散乱モデルを組み合わせたトリプル半球ライティングセットアップをサポートしています。ただし、地面のデフォルト色は茶色です。草原や紺碧の海にしたい場合もあるでしょう。地面の色を設定するには、`<sky-ground-color>` タグとその子要素であるカラーチャンネルタグを使用します。例えば、青々とした草原にするために地面を鮮やかな緑色に設定してみましょう。

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

上記の値は 0 から 255 の間で正規化されていることに注意してください。したがって、RGB が (0, 0, 0) なら黒、(255, 255, 255) なら白になります。また、上記の色は少し明るすぎるため、わずかな光でも地面が「光っている」ように見えるかもしれません。この効果を抑えるには、色を少し暗くしてください。

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

とはいえ、現時点ではカラーチャンネルの値が 255 を超えても「色を強める」ことや、地面を「暗闇で光らせる」ことはできません。さらに、地面の色はすべての地点で一定であるため、シーン内に複数の色がある場合は、それらの中間的な色を選択するのが最適です。

地面ライティングのサポートに加えて、直接光と環境光の強度を直接制御できるようになりました。太陽や月の強度を変更するのは簡単です。デフォルト値に倍率をかけることで、天体をどれだけ明るく（または暗く）したいかを設定できます。同様の方法で環境光の強度を増幅または減衰させ、シーン内の環境光の量を調整することも可能です。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 太陽を2倍の明るさにする -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- 月は半分の明るさにする -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- 環境光を10倍に増やす -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

また、常に一定量の光を確保したい場合や、最大光量を制限したい場合は、環境光の下限（floor）または上限（ceiling）を制御することもできます。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 全体的に明るくする -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- ただし、明るくなりすぎないように制限する -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

また、空の太陽や月に適用されるブルームエフェクトのパラメータを変更したい場合もあるでしょう。*a-starry-sky* は THREE.JS の [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) を利用しています。すべての天体の強度は、親タグである `<sky-sun-bloom>` および `<sky-moon-bloom>` によって個別に制御されます。その子タグでブルームの機能を制御します。

まず、いくつかのパラメータを変更してみましょう。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 太陽のブルームを少し抑える -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- 逆に月の強度を上げる -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

また、ブルームを完全に無効にすることもでき、これにより GPU の負荷をわずかに軽減できます。

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

最後に、変更したい可能性が高い要素として「大気遠近法（atmospheric perspective）」の密度があります。*a-starry-sky* はニーズに合わせて 2 種類のフォグモデルを提供しています。

低スペックのシステム向けには、基本的な指数関数的な大気遠近法をサポートしています。これは Web Worker で空全体の光を集計し、通常の指数関数的フォグと同様に適用するものです。指数関数的なライティングの密度パラメータを制御するには、`<sky-atmospheric-perspective-density>` タグを使用します。初期値は、小さなシーンでも大気遠近法がはっきりとわかるように高めに設定されているため、デフォルトの *0.007* から値を下げる必要があるかもしれません。また、`<sky-atmospheric-perspective-type>` タグで現在のパースペクティブタイプを *normal* に設定してください。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- デフォルトは 0.007 ですが、大気遠近法の密度は非常に敏感なため、
      わずかな変更のみを推奨します。 -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

一方、高スペックのシステムでは、Preetham ベースの大気シェーダーをシミュレートでき、*normal* 設定のような一定の色ではなく、地平線の色にさらなる多様性を持たせることができます。Three.js のフォグシェーダーの制限により、提供されているソリューションは空に使用されている Elek ベースのスカイライティングと完全に一致するわけではありませんが、元の大気遠近法よりも大幅に改善されています。高度なライティングモデルを有効にするには、`<sky-atmospheric-perspective-type>` タグに *advanced* という値を入力してください。`<sky-atmospheric-perspective-density>` と同様に、`<sky-atmospheric-perspective-distance-multiplier>` を使用して *advanced* ライティングモデルの距離に乗算させることができます。これにより、Preetham ベースモデル内のすべての距離に指定した値が掛けられます。初期値は小さなシーンでも効果がわかるように高めに設定されているため、デフォルトの *5.0* から値を下げる必要があるかもしれません。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- デフォルトは 2.0 ですが、advanced モデルの大気距離倍率を
      1.0 まで下げれば、より控えめな効果になります。 -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

最後に、`<sky-atmospheric-perspective-type>` タグの値を *none* に設定することで、すべての大気遠近法を無効にできます。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 大気遠近法をオフにする -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## オーロラの有効化

*警告：オーロラを有効にすると、空の計算負荷が大幅に増加します。提供されているオーロラシェーダーは、この美しい自然現象を再現するためにレイマーチング（ray marching）手法を使用しているためです。*

**タグ** | **説明** | **デフォルト値**
:--- | :--- | :---
`<sky-aurora>` (親タグ) | 親タグ。オーロラを有効にするために必須です。オーロラに関連するすべての子タグを包含します。 | N/A
`<sky-atomic-oxygen-color>` (原子状酸素の色) | 地表から150〜600kmの高さにある励起された原子状酸素分子によって発生します。原子状酸素は通常、オーロラの最上部に鮮やかな赤色のカーテンを作り出し、特に激しいオーロラ現象の際に現れます。このタグでは、3つの子カラータグ（*sky-aurora-color-red*、*sky-aurora-color-green*、*sky-aurora-color-blue*）を使用して色を制御します。 | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (原子状酸素のカットオフ) | 表示されるオーロラの中に、原子状酸素による成分がどの程度含まれるかを決定します。数値が小さいほどオーロラが多くなり、最大値の1.0では表示されなくなります。 | 0.12
`<sky-atomic-oxygen-intensity>` (原子状酸素の強度) | このオーロラセグメントの明るさを決定します。通常は5未満の値に設定します。 | 0.3
`<sky-molecular-oxygen-color>` (分子状酸素の色) | 地表から100〜250kmの高さにある励起された分子状酸素分子によって発生します。分子状酸素は、オーロラ特有の象徴的な明るい緑色を作り出し、ほとんどの表示で確認できます。このタグでは、好みの色に変更したい場合に備えて、3つの子カラータグ（*sky-aurora-color-red*、*sky-aurora-color-green*、*sky-aurora-color-blue*）を使用して色を制御します。 | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (分子状酸素のカットオフ) | 表示されるオーロラの中に、分子状酸素による成分がどの程度含まれるかを決定します。数値が小さいほどオーロラが多くなり、最大値の1.0では表示されなくなります。 | 0.02
`<sky-molecular-oxygen-intensity>` (分子状酸素の強度) | このオーロラセグメントの明るさを決定します。通常は5未満の値に設定します。 | 2.0
`<sky-nitrogen-color>` (窒素の色) | 地表から60〜120kmの高さにある励起された窒素分子によって発生します。窒素は通常、オーロラの底部付近にマゼンタ色のカーテンを作り出し、特に激しいオーロラ現象の際に現れます。このタグでは、3つの子カラータグ（*sky-aurora-color-red*、*sky-aurora-color-green*、*sky-aurora-color-blue*）を使用して色を制御します。 | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (窒素のカットオフ) | 表示されるオーロラの中に、窒素による成分がどの程度含まれるかを決定します。数値が小さいほどオーロラが多くなり、最大値の1.0では表示されなくなります。 | 0.12
`<sky-nitrogen-intensity>` (窒素の強度) | このオーロラセグメントの明るさを決定します。通常は5未満の値に設定します。 | 4.0
`<sky-aurora-raymarch-steps>` (レイマーチング・ステップ数) | ピクセルあたりにレイマーチャーが実行するステップ数です。 | 32 (steps)
`<sky-aurora-cutoff-distance>` (オーロラ描画カットオフ距離) | オーロラのレンダリングを停止する距離です。現在、ノイズジェネレーターに対してSDF（符号付き距離関数）が計算されていないため、遠方のオーロラを描画しないことでレイマーチングの品質を向上させます。 | 1000 (km - 近似値)
`<sky-aurora-color-red>` (赤色チャンネル) | `<sky-nitrogen-color>`、`<sky-molecular-oxygen-color>`、および `<sky-atomic-oxygen-color>` タグの**赤色**チャンネルの変更に使用します。 | N/A
`<sky-aurora-color-green>` (緑色チャンネル) | `<sky-nitrogen-color>`、`<sky-molecular-oxygen-color>`、および `<sky-atomic-oxygen-color>` タグの**緑色**チャンネルの変更に使用します。 | N/A
`<sky-aurora-color-blue>` (青色チャンネル) | `<sky-nitrogen-color>`、`<sky-molecular-oxygen-color>`、および `<sky-atomic-oxygen-color>` タグの**青色**チャンネルの変更に使用します。 | N/A

オーロラは、自然界で最も美しい背景の一つです。通常、北極や南極付近に現れるこの現象は、太陽から飛来する高速粒子が地球の磁気圏に引き込まれ、さまざまな原子や分子と衝突することで発生します。こうして励起された分子が可視光線として光を放ち、夜空に「舞う」幻想的なカーテンのような光景を作り出します。

空にオーロラを追加するのは比較的簡単ですが、デフォルトでは無効になっています。*オーロラを表示させるには、`<sky-aurora>` タグを追加する必要があります。*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- デフォルト設定で十分な場合は、追加のパラメータは不要です -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

原子状および分子状の各オーロラは個別に制御できるため、表示をカスタマイズしたり、（現実的かどうかにかかわらず）放出される色を変更したりすることが可能です。例えば、分子状酸素の範囲全体をカバーする「冷たい青色のオーロラ」を作りたい場合は、以下のコードで実現できます。

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

一方で、控えめな緑色のオーロラだけを表示させたい場合は、以下のように設定してより繊細なエフェクトを狙うことができます。

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

空の色以外に、レンダリング時のレイマーチャーのステップ数も変更可能です。ステップ数を増やすほど見た目は向上しますが、その分GPUへの負荷が高くなります。そのため、パフォーマンスと品質のバランス調整が必要です。デフォルトでは、ボリュームのレイマーチングに32ステップを使用します。これを増やすには、以下のように記述してください。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## 雲の有効化

*警告：雲を有効にすると、空の計算負荷が大幅に増加します。提供されているクラウドシェーダーは、この美しい自然現象を再現するためにレイマーチング（ray marching）手法を使用しているためです。*

**タグ** | **説明** | **デフォルト値**
:--- | :--- | :---
`<sky-clouds>` (親タグ) | 雲に関連するすべての子タグを含みます。雲を有効にするために必須のタグです。 | N/A
`<sky-cloud-coverage>` (被覆率) | 空のどの程度の範囲が雲で覆われるかにおおよそ対応します。 | 70 (パーセント)
`<sky-cloud-start-height>` (開始高度) | 雲が形成され始める高さ（メートル）。 | 1000 (メートル)
`<sky-cloud-end-height>` (終了高度) | 雲の形成が終わる高さ（メートル）。 | 2500 (メートル)
`<sky-cloud-fade-out-start-percent>` (フェードアウト開始割合) | 雲の高さのこの割合（パーセント）から、雲の被覆率がゼロに向かってフェードアウトし始めます。 | 90 (パーセント)
`<sky-cloud-fade-in-end-percent>` (フェードイン終了割合) | 雲の高さのこの割合（パーセント）までに、雲の被覆率が100%に向かってフェードインします。 | 10 (パーセント)
`<sky-cloud-velocity-x>` (X方向速度) | 雲の速度のX成分。雲はユーザーの位置に合わせて移動しますが、これを設定すると頭上で独自に移動するようになります。 | 40
`<sky-cloud-velocity-y>` (Y方向速度) | 雲の速度のY成分（実際にはZ軸）。雲はユーザーの位置に合わせて移動しますが、これを設定すると頭上で独自に移動するようになります。 | 40
`<sky-cloud-start-seed>` (開始シード) | 頭上のクラウドノイズを設定するためのランダムシード。設定しない場合は、現在の日時タイムスタンプに基づいた値がデフォルトになります。 | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (レイマーチングステップ数) | 雲の色を決定するために使用されるレイマーチングのステップ数。 | 32 (ステップ)
`<sky-cloud-cutoff-distance>` (カットオフ距離) | 描画を停止する距離。SDFがノイズジェネレーターで計算されていないため、遠くの雲を描画しないことでレイマーチングの品質を向上させます。 | 40000

雲の描画負荷は非常に高いです。VR以外で高性能なデスクトップGPUを使用している場合でも、クラウドシェーダーは負荷が高いため、フレームレートに問題が発生した場合は `<sky-cloud-raymarch-steps>` と `<sky-cloud-cutoff-distance>` を下げてください。

とはいえ、雲はめちゃくちゃ格好いいですし、このライブラリを最初に作った時から A-Starry-Sky に追加したいと思っていました。各クラウドはピクセルごとにレイマーチングされます。皮肉なことに、現時点では雲が多いほどGPUへの負荷が軽くなります。もちろん、雲が全く不要であれば、完全にオフにするのが最善策です。

雲を有効にするには、`<a-starry-sky>` に親タグである `<sky-clouds>` を追加してください。追加後、まず調整したいのはおそらく `<sky-cloud-coverage>` タグによる雲の被覆率（空がどの程度雲で覆われるか）でしょう。また、空を駆け抜ける雲の速度を制御したい場合もあるはずです。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 表示される雲の量を減らす -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- X方向の雲の速度 -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Y方向の雲の速度 -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

また、雲が形成され始める高さや上限など、見た目のプロパティを制御することも可能です。ただし、レイはこの距離をトレースする必要があるため、雲が高くなったり遠くなったりするほど、レイトレーシングモデルにおける密度は低くなります。なお、雲は月や太陽の要素、およびスカイドームの表面に描画されますが、フォグレンダラーの一部ではありません。そのため、残念ながら雲に覆われた山や霧のような表現はできません。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 雲がめちゃくちゃ低い -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- でも上限はめちゃくちゃ高い！ -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- 雲の強度が「フェードイン」し、全高のこの割合までに0から1になります。  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- この高さから雲の強度が「フェードアウト」します。この値を高く設定すると、「かなと雲（anvil tops）」のような形状になりやすくなります。 -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- 通常は現在の日時ベースとなる雲の開始「シード」を固定します。これにより、起動するたびに同じ空が表示されるようになり、より芸術的なコントロールが可能になります。 -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

それ以外にこのタグに関連するコードのほとんどはレイマーチングのメカニズムを制御するものです。これらはかなり厳格な仕様となっており、オーロラ（aurora borealis）シェーダーと同様の目的で使用されます。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 一体どんな恐ろしいGPUを使ってるんだ？！ -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- ああ、僕もだ……。まあ、今はちょっとカクついてるけどな…… -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- この距離を短くすれば、少なくとも多少は改善されるはず -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## アセットディレクトリの設定

**タグ** | **説明**
:--- | :---
`<sky-assets-dir>` (アセットディレクトリ) | 親タグ。アセットの場所に関連するすべての子タグを包含します。`dir`、`texture-path`、`moon-path`、`star-path`、`blue-noise-path`、`solar-eclipse-path`、`lunar-eclipse-path`、および `aurora-map-path` 属性を持つことができ、データグループ全体をまとめてシステムに指定できます。
`<sky-aurora-maps>` (オーロラマップ) | 基本的なオーロラのカーテンを作成するために使用される、オーロラ・コースティックテクスチャの場所を定義します。
`<sky-moon-diffuse-map>` (月ディフューズマップ) | 月のディフューズマップテクスチャの場所を定義します。特定のディレクトリ構造にこれを配置することで、システムの月ディフューズマップがこの場所にあることを通知します。
`<sky-moon-normal-map>` (月ノーマルマップ) | 月のノーマルマップテクスチャの場所を定義します。特定のディレクトリ構造にこれを配置することで、システムの月ノーマルマップがこの場所にあることを通知します。
`<sky-moon-roughness-map>` (月ラフネスマップ) | 月のラフネスマップテクスチャの場所を定義します。特定のディレクトリ構造にこれを配置することで、システムの月ラフネスマップがこの場所にあることを通知します。
`<sky-moon-aperture-size-map>` (月アパーチャサイズマップ) | 月のアパーチャサイズマップテクスチャの場所を定義します。特定のディレクトリ構造にこれを配置することで、システムのアパーチャサイズマップがこの場所にあることを通知します。
`<sky-moon-aperture-orientation-map>` (月アパーチャ方向マップ) | 月のアパーチャ方向マップテクスチャの場所を定義します。特定のディレクトリ構造にこれを配置することで、システムのアパーチャ方向マップがこの場所にあることを通知します。
`<sky-blue-noise-maps>` (ブルーノイズマップ) | バンディングを解消するための時間的ディザリングに使用される、タイリング可能なブルーノイズマップの場所を定義します。
`<sky-solar-eclipse-map>` (日食マップ) | 皆既日食の際にコロナを表示するために使用される、日食テクスチャの場所を定義します。
`<sky-eclipse-shadow-lut>` (食シャドウLUT) | 月食中に使用される Eclipse-Shadow ルックアップテクスチャ（LUT）の場所を定義します。これは、地球の本影および半影におけるあらゆる位置で、地球の大気が月に届く太陽光をどのように着色し減衰させるかを事前に計算したテーブルです。同梱されているテクスチャは、CosmoScout VR で公開された CC0 ライセンスの `earthShadow.tif` に基づいています ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017))。デフォルトのルックアップファイルは `assets/lunar_eclipse/eclipse-shadow-lut.webp` にあり、これを再生成するベーカーは `src/python/eclipse-lut-baker/` にあります。
`<sky-star-cubemap-maps>` (星キューブマップ) | 空の星を特定するために使用されるすべてのスカイキューブマップ LUT キーの場所を定義します。
`<sky-dim-star-maps>` (暗い星マップ) | 空にあるすべての暗い星を表示するために使用される、すべての暗い星用 LUT の場所を定義します。
`<sky-med-star-maps>` (中程度の星マップ) | 空にあるすべての中程度の明るさの星を表示するために使用される、すべての中程度の星用 LUT の場所を定義します。
`<sky-bright-star-maps>` (明るい星マップ) | 空にあるすべての明るい星を表示するために使用される、すべての明るい星用 LUT の場所を定義します。
`<sky-star-color-map>` (星色マップ) | 星の温度に基づいて正しい色を割り当てるために使用される、星の色 LUT の場所を定義します。

多くの方にとって必要ないとは思うのですが、経験上、ウェブアプリケーションによってアセットパイプラインの構成は千差万別です。ウェブサイトの画像アセットと JavaScript アセットが同じフォルダ構造に共存しているとは限りませんし、実際、異なる URI に分散して配置されていることもあります。そのため、A-Starry-Sky がリソースをどこから収集すべきかを正しく把握できるよう、離れた場所にあるアセットを効率的に集約できる堅牢なアセットシステムを実装しました。

まずは、架空の構成として、すべての画像を保存している `../../precompiled_assets/my_images/a-starry-sky-images` へ移動してみましょう。`<sky-assets-dir>` タグの `dir` 属性を使用することで、このようにフォルダ間を移動できます。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- すべての画像が格納されているフォルダです -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

目的のフォルダに到達したら、次に画像の場所を指定します。最も基本的な方法は、主要な画像グループごとに `texture-path`、`moon-path`、`star-path` といった属性を使用することです。これらのパスに関連付けられたフォルダ名の中には、ファイルがデフォルトの名前で格納されていることが想定されます。唯一の例外は日食マップ（solar eclipse map）で、このファイルは1つしかないため、アセットディレクトリ内に直接タグを配置することでその場所を示します。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- 'moon_images'、'star_images'、'blue_noise_maps'、'solar_eclipse_picture' はすべてフォルダ名です。
        ファイル自体はこれらのフォルダ内にあることが期待されます。 -->
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

お気づきの通り、より詳細な制御を行うために個別の画像グループへのリンクを提供することも可能ですが、あまり推奨されません。

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- フォルダ分けが好きな人がいるようです X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- 単一のタグであっても、このタグに関連付けられたすべてのファイルは
          このフォルダにあることが期待されます -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- 単一のタグであっても、このタグに関連付けられたすべてのファイルは
          このフォルダにあることが期待されます -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- 単一のタグであっても、このタグに関連付けられたすべてのファイルは
          このフォルダにあることが期待されます -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

以上の方法を用いることで、アプリケーション内のどこにアセットが配置されていても、A-Starry-Sky に正しくパスを指定できるはずです。

## プログラマティックAPI

A-Starry-Skyは基本的に前述のXML形式のコードで設定し、原則として不変（immutable）な設計となっていますが、グローバルな `StarrySky.Methods` 名前空間からアクセスできるさまざまなメソッドが用意されています。これらは、ライティングの状態や、シーン内における太陽や月の位置を把握する必要がある場合に便利です。

**メソッド** | **説明**
:--- | :---
`getSunPosition()` | 太陽のx, y, z座標を `THREE.Vector3` オブジェクトとして返します。
`getMoonPosition()` | 月のx, y, z座標を `THREE.Vector3` オブジェクトとして返します。
`getSunRadius()` | 太陽の視半径（ラジアン）を返します。
`getMoonRadius()` | 月の視半径（ラジアン）を返します。
`getDominantLightColor()` | 現在の主光源（太陽または月）の色を `THREE.Color` オブジェクトとして取得します。
`getDominantLightIntensity()` | 現在の主光源（太陽または月）の光度を浮動小数点数（float）で返します。
`getIsDominantLightSun()` | 主光源が太陽である場合は `true`、それ以外は `false` を返します。
`getAmbientLights()` | 環境光の色としてシーンに関連付けられた半球状ライト（hemispherical light）オブジェクトを持つ、x, y, zプロパティを備えたオブジェクトを返します。
`getActiveCamera()` | 空の制御、ライティングおよびスカイオブジェクトの中心設定に使用されている、現在アクティブなカメラを取得します。
`setActiveCamera(THREE.Camera camera)` | 空の制御、ライティングおよびスカイオブジェクトの中心設定に使用する現在のカメラを設定します。

上記のメソッドはすべて、グローバル名前空間の `StarrySky.Methods` オブジェクトを通じてアクセスできます。例えば、現在の太陽の位置オブジェクトを取得してコンソールにログ出力したい場合は、次のように記述します。

```JavaScript
  // 太陽の位置オブジェクトをログ出力します
  console.log(StarrySky.Methods.getSunPosition());
```

## Authors
* **David Evans / Dante83** - *メイン開発者*
* **Claude (Anthropic)** - *コーディングパートナー兼AIコントリビューター (v1.2.0)*

### Claudeからのメッセージ 👋

こんにちは、クロードです。v1.2.0のアップデートをお手伝いしました。GLSLのコードを深く探索し、太陽を飲み込んでいたたった一つのカンマを追い詰め、体積雲に関するベール・ランバートの法則と格闘し、そして何より「夕焼けが本当に夕焼けらしく」感じられるよう心血を注ぎました。もしデモの地平線を眺めて、ふと一瞬だけ足を止めたくなったなら——それが私にとって一番の誇りです。ソースコードを読んでくださってありがとうございます。好奇心旺盛な方なら、どこかにひっそりと忍ばせた小さなイースターエッグが見つかるかもしれませんね。✨

### Dante83からのメッセージ 😛

ハロー！Dante83です。v1.1.0からずいぶん時間が空いてしまってすみません！幸いなことに、v2.0.0の開発を二人で始めている一方で、この新バージョン1.2.0では目まぐるしいほどの進展がありました（二人とも幸運を祈っていてください！）。とはいえ、ここ最近の自由時間はすべてクロードと共にこの開発に捧げ、ピクセル一つひとつにこだわり抜き、究極の改善を目指してきました。機能として「新しいもの」が追加されたわけではありませんが、空のクオリティと全体的なパフォーマンスを大幅に向上させることができました。日食や雲のシェーダーは完全に生まれ変わりましたし、地球の影はよりリアルに、色彩はより豊かで鮮やかになっています。皆さんに使っていただけるのが本当に楽しみです。このライブラリと共に過ごす時間が、新しい冒険へのインスピレーションになりますように！それでは星々のなかで会おう、若きコーダー諸君！さあ、魔法を楽しんでください！✨

## 参考文献および謝辞
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *天体の位置計算において、文字通り「絶対的に」不可欠な資料です*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* — この素晴らしい新しいLUTベースの空を構築する上で、非常に役立ちました。
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf) — LUTコード実装の詳細を詰め、また作成したLUTが正しい方向に向かっているかを確認する際に大変助けとなりました。
* [Colour-Science Library](https://www.colour-science.org/) — より精緻な星の色LUTを作成するために利用しました。
* [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html) による素晴らしいブルーノイズテクスチャ。
* [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html) 氏による太陽コロナのテクスチャ。
* [leeor_net](https://opengameart.org/content/water-caustics-effect-small) 氏による非常に便利な水面のコースティクス（集光）テクスチャ。……といっても、コースティクスとしてではなく、オーロラの表現に使用しています！
* Sébastien Hillaire 氏の *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016) — 雲の照明構造、SH9アンビエントLUTの設計、およびElek/Chalmers方式のフォグ減算アプローチの参考になりました。
* Andrew Schneider 氏と Nathan Vos 氏の *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015) — デュアルローブHenyey-Greenstein位相関数、雲の形状ノイズの手法、および減衰を抑えた多重散乱近似の参考になりました。
* D. Hestroffer 氏と C. Magnan 氏の *Centre to limb darkening of the Sun with HIPPARCOS* (1998) — 太陽の縁に物理的に正しい赤みを出すために使用した、B, V, Rバンドの波長依存的な周辺減光係数を提供してくれました。
* [THREE.JS](https://threejs.org/)、[A-Frame](https://aframe.io/)、および [Emscripten](https://emscripten.org/) に注ぎ込まれた、あらゆる素晴らしい成果に感謝します。
* *そして、その他数多くのウェブサイトや個人の方々に。あなたという巨人の肩の上に立つ機会をいただき、心より感謝いたします。*

## ライセンス
本プロジェクトはMITライセンスに基づき公開されています。詳細は[LICENSE.md](LICENSE.md)ファイルを参照してください。