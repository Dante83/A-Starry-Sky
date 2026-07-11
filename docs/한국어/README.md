# A-Starry-Sky

A-Starry-Sky는 [A-Frame Web Framework](https://aframe.io/)를 위한 스카이 돔입니다. 여러분의 작품 속에 아름다운 낮과 밤의 주기를 구현할 수 있도록, 간단하게 바로 적용 가능한 컴포넌트를 제공하는 것을 목표로 합니다.

> **경고: 고성능 GPU가 필요합니다. 모바일 기기에서는 실행하지 마세요.**

**[라이브 데모](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — 샌프란시스코의 현재 날짜와 시간 기준 하늘 모습입니다.

| 예제 | 설명 |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | 특정 낮 시간대의 사막 풍경 |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | 코로나가 포함된 개기 일식 |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | 달에 드리워진 지구의 그림자 (월식) |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | 목성과 토성의 대결합 (서기 1226년 크리스마스 별) |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | 커스텀 화성 대기 |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | 다양한 Mie/Rayleigh 산란 값 적용 |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | 20km 상공에서 본 하늘 |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ GPU 부하 높음 |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ GPU 부하 높음 |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ GPU 부하 높음 |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ GPU 부하 높음 |

## 사전 요구 사항

이 프로젝트는 [A-Frame Web Framework](https://aframe.io/) 버전 1.7.0 이상을 기반으로 구축되었습니다. 또한 Web XR 호환 웹 브라우저가 필요합니다.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## 설치하기

`a-starry-sky.v1.2.0.min.js` 파일과 `assets`, `wasm` 폴더를 프로젝트에 복사하세요. 그다음 HTML에 아래 스크립트들을 추가합니다. 이때 `starry-sky-web-worker.js`는 여기에 포함되지 않으며, 대신 `<a-starry-sky>` 태그에서 직접 참조된다는 점에 유의하시기 바랍니다.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

참조 설정이 완료되면, 다음과 같이 sky-state 웹 워커 URL을 참조하여 A-Frame의 `<a-scene>` 태그 안에 `<a-starry-sky>` 컴포넌트를 추가하세요.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

이 기본적인 코드를 사용하면 캘리포니아주 샌프란시스코의 위도와 경도를 기준으로 실시간으로 움직이는 하늘이 구현됩니다. 하지만 여기서 더 많은 것을 할 수 있습니다. A-Starry-Sky는 하늘 상태를 커스터마이징할 수 있도록 돕는 다양한 사용자 정의 HTML 태그를 제공합니다.

**참고: 이 스카이박스는 불변(immutable)입니다. 즉, 설정한 초기 값이 해당 페이지에서 계속 유지됩니다. 안타깝게도 현재로서는 코드를 가변적으로 만드는 것이 매우 어렵습니다.**

## 위치 설정

**태그** | **설명** | **기본값**
:--- | :--- | :---
`<sky-location>` (부모 태그) | 부모 태그입니다. 자식 태그로 `sky-latitude`와 `sky-longitude`를 포함합니다. | N/A
`<sky-latitude>` (위도 설정) | 위치의 위도를 설정합니다. 적도 북쪽은 **양수(+)**로 표시합니다. | 38
`<sky-longitude>` (경도 설정) | 위치의 경도를 설정합니다. [본초 자오선](https://en.wikipedia.org/wiki/Prime_meridian) 서쪽은 **음수(-)**로 표시합니다. | -122

지구상의 어떤 위도와 경도로든 하늘을 설정할 수 있습니다. 위치 설정을 통해 태양이나 달의 궤적을 변경함으로써 플레이어에게 계절감을 제공할 수 있어 유용합니다. 또한 위도에 따라 밤하늘에 보이는 별들이 달라집니다. 위도와 경도는 모두 일식이나 월식과 같이 시간에 따라 발생하는 이벤트에 매우 중요하며, 특히 개기 일식을 구현하고자 할 때 더욱 그렇습니다. 하지만 어디로 갈지 결정하는 것보다 위치를 설정하는 법을 배우는 것이 훨씬 쉽습니다. [Google Earth](https://earth.google.com/web/)나 다른 지도 서비스에서 원하는 위치의 좌표를 가져와 다음과 같이 각 태그에 입력하기만 하면 됩니다.

뉴욕으로 가볼까요!
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

그럼 호주의 퍼스는 어떨까요?
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

[본초 자오선](https://en.wikipedia.org/wiki/Prime_meridian) 서쪽의 경도는 음수(-)로 표시된다는 점에 유의하세요(예: 뉴욕, 부에노스아이레스).

## 시간 설정하기

**태그** | **설명** | **기본값**
:--- | :--- | :---
`<sky-time>` (부모 태그) | 부모 태그입니다. 날짜 또는 시간 요소와 관련된 모든 자식 태그를 포함합니다. | N/A
`<sky-date>` (날짜 및 시간) | 로컬 일시 문자열을 **연-월-일 시:분:초** 형식으로 입력합니다 (예: *2021-03-21 13:45:51*). 시간 값은 0~23시 체계를 따르며, 0시는 오전 12시, 23시는 오후 11시입니다. | 현재 날짜
`<sky-speed>` (시간 속도) | 천문학적 계산 속도를 높이거나 낮추는 데 사용되는 시간 배수입니다. | 1.0
`<sky-utc-offset>` (UTC 오프셋) | 해당 위치의 UTC 오프셋입니다. 경도 값과는 반대로, 음수 값은 [본초 자오선](https://en.wikipedia.org/wiki/Prime_meridian)의 서쪽을 의미합니다. **UTC 시간은 일광 절약 시간제(DST)를 따르지 않음에 유의하세요.** | 7

`<sky-date>`를 선택한 위치의 **로컬 시간**으로 설정하고, `<sky-utc-offset>`을 해당 시간대에 맞게 설정하세요. 예를 들어, 뉴욕시는 UTC-4(여름) 또는 UTC-5(겨울)이며, DST는 자동으로 적용되지 않습니다.

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

시간 설정을 위한 모든 관련 자식 태그를 포함하는 부모 태그인 `<sky-time>`을 다시 한번 추가하는 것을 확인하세요.

하지만 꼭 로컬 머신의 시간에만 맞출 필요는 없습니다. 시간 여행처럼 조금 더 흥미로운 일을 해보는 건 어떨까요! [2024년 4월 8일 오후 1시 27분(24시간제 13:27), 텍사스주 델 리오](https://nationaleclipse.com/cities_total.html)에서 멋진 [개기 일식](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2024Apr08Tgoogle.html)이 일어난다고 하더군요. 함께 확인해 보시죠!

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

[크리스마스 별](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)을 놓치셨나요? 아뇨, 아뇨. 그 별 말고 서기 1226년에 떴던 그 별 말이에요. 다행히 우리에겐 타임머신이 있고, 이제 A-Starry-Sky가 행성까지 지원하니까요! :D

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

시간 여행도 즐겁지만, 시간의 *속도*를 바꾸는 것에도 관심이 있으실 겁니다. 게임 세계에서는 낮과 밤의 주기가 현실보다 빠르게 흐르는 경우가 많으며, 조명 설정을 위해 특정 순간에 시간을 영구적으로 멈추고 싶을 수도 있습니다. 이럴 때는 `<sky-speed>` 태그를 추가하세요.

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

물론, 지속성 있는 월드(persistent world)를 구축 중이라면 HTML을 작성할 때 가속된 시간의 흐름을 반드시 고려하시기 바랍니다. 하늘을 위한 동적 HTML 설정 방식은 여러분의 선택에 달려 있습니다.

## 대기 설정 수정하기

**태그** | **설명** | **기본값**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | 부모 태그. 대기 설정과 관련된 모든 자식 태그를 포함합니다. | N/A
`<sky-camera-height>` | 지표면으로부터의 카메라 높이. | 0.0km
`<sky-mie-directional-g>` | 미 산란(Mie scattering)에 의해 빛이 전방으로 얼마나 산란되는지를 나타냅니다. 미 산란은 대기 중의 큰 입자로 인해 태양 주변에 보이는 흰색 후광 현상입니다. 이 값이 높을수록 대기가 더 먼지 낀 것처럼 보입니다. | 0.8
`<sky-sun-intensity>` | 대기 셰이더에서의 태양 강도. | 1367.0
`<sky-moon-intensity>` | 대기 셰이더에서의 달 강도. | 29.0
`<sky-mie-beta>` | 미 산란의 빛 산란 색상 의존성으로, 주로 태양 근처의 '광휘(glow)'를 결정합니다. 모든 주파수에서 산란이 상당히 균일하게 일어납니다. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | 레일리 산란(Rayleigh scattering)의 빛 산란 색상 의존성으로, 주로 하늘의 푸른색 산란을 담당합니다. 기본적으로 청색 채널의 산란이 가장 많이 일어남에 유의하세요. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | 오존층의 빛 산란 색상 의존성으로, 일몰 무렵의 짙은 푸른색을 표현하는 데 중요합니다. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | 대기가 '끝나는' 지점인 차단 높이. | 80.0 km
`<sky-radius-of-earth>` | 행성 또는 지구의 반지름. | 6366.7 km
`<sky-rayleigh-scale-height>` | 레일리 산란의 감쇠 척도 높이(지수적 감쇠 가정). 레일리 산란은 대기 가스에서 발생하므로 척도 높이가 훨씬 큽니다. | 8.4
`<sky-mie-scale-height>` | 미 산란의 감쇠 척도 높이(지수적 감쇠 가정). 미 산란은 더 큰 입자에서 발생하므로 더 빠르게 감쇠하는 경향이 있으며, 따라서 특성 높이 스케일러 값이 더 작습니다. | 1.25
`<sky-ozone-percent-of-rayleigh>` | 현재 하늘에 포함된 오존의 비율로, 일몰 시의 오존 반사 값을 설정하는 데 사용됩니다. | 6E-7
`<sky-moon-angular-diameter>` | 하늘에 보이는 달의 각지름.  | 3.15 degrees
`<sky-sun-angular-diameter>` | 하늘에 보이는 태양의 각지름. | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | 대기 LUT를 위해 빛을 수집할 때 레이 트레이서가 하늘 끝까지 이동하는 단계(step) 수. | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | k차 산란을 위해 광선 상의 각 지점에서 수행하는 각도 단계 수. | 30 steps
`<sky-number-of-scattering-orders>` | 인산란(inscattering) LUT에 구워 넣을 고차(k차) 산란 패스 횟수. 값이 높을수록 품질은 향상되지만 LUT 베이크 시간이 늘어납니다. | 4
`<sky-parameters-color-red>` | `<sky-rayleigh-beta>`, `<sky-mie-beta>`, `<sky-ozone-beta>` 태그에서 사용되는 빨간색 성분. | N/A
`<sky-parameters-color-green>` | `<sky-rayleigh-beta>`, `<sky-mie-beta>`, `<sky-ozone-beta>` 태그에서 사용되는 초록색 성분. | N/A
`<sky-parameters-color-blue>` | `<sky-rayleigh-beta>`, `<sky-mie-beta>`, `<sky-ozone-beta>` 태그에서 사용되는 파란색 성분. | N/A

대기 설정 파라미터는 전체 코드베이스에서 가장 광범위한 API 중 하나를 제공합니다. 숙련된 개발자라면 이 값들을 이용해 커스텀 하늘을 만들 수 있겠지만, 대부분의 사용자는 기본값을 그대로 사용하는 것이 좋습니다. 하지만 몇 가지 값들은 이해하기 쉽고 특히 유용합니다.

가장 자주 변경하게 될 요소 중 하나는 태양과 달의 크기입니다. 실제 현실에서 태양의 각지름은 0.53도, 달의 각지름은 0.50도입니다. 시뮬레이터에 이 값을 적용하면 더 사실적이지만, 모니터와 같은 비 VR 기기에서는 너무 작게 보일 수 있습니다. 이 값들을 더 크게 혹은 작게 바꾸려면 해당 태그의 값을 수정하기만 하면 됩니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{JS_폴더_경로}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <sky-sun-angular-diameter>0.53</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.5</sky-moon-angular-diameter>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

행성 위의 시작 높이를 변경하고 싶을 수도 있습니다. 이는 `<sky-camera-height>` 태그로 간단히 설정할 수 있으며, 카메라를 위아래로 움직임에 따라 하늘이 높이에 맞춰 동적으로 적응합니다. 이 설정은 씬의 초기 높이를 킬로미터(km) 단위로 지정하며, 최대 높이는 *80km*, 최소 높이는 *0km*입니다.

[고고도 예시](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{JS_폴더_경로}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- 조금 더 높이 올라가 봅시다. 여기는 공기가 희박합니다. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

대기의 구성 성분을 변경하고 싶을 수도 있습니다. 이 요소를 통해 하늘의 모습을 원하는 대로 제어할 수 있는 다양한 메커니즘을 사용할 수 있습니다. 예를 들어, 기본값(5.8e-3, 1.35e-2, 3.31e-2) 대신 [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/)에서 제시된 레일리 값 (5.19E-3, 1.21E-2, 2.96E-2)을 사용하고 싶거나, 베타 값을 4.44E-3에서 2E-3으로 바꾸고 싶다면 코드에서 간단히 교체할 수 있습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{JS_폴더_경로}/wasm/starry-sky-web-worker.js">
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

하지만 이건 좀 심심하죠. 이번에는 조금 더 파격적인 시도를 해봅시다. [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf)의 연구를 따라 화성으로 가보는 겁니다! 여기서는 레일리 산란과 미 산란의 사용처가 바뀌므로, 특성 높이(characteristic heights) 또한 함께 바꿔줘야 합니다. 화성의 산란은 대부분 매우 희박한 대기 속 큰 입자들에 의한 미 산란에서 발생합니다. 따라서 미 산란(레일리)을 거의 비활성화하고 특성 높이를 서로 맞바꿀 수 있습니다. 또한 행성의 반지름을 변경해야 하며, 레이 트레이서의 성능 향상을 위해 대기 높이 값을 조정하는 것이 좋습니다.

[화성 예시](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{JS_폴더_경로}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- 화성은 붉은 빛을 더 많이 산란시킨다는 점에 유의하세요 -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- 미 산란 설정을 약간 수정하는 것도 도움이 됩니다 -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- 오존을 반드시 비활성화하세요 -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- 음, 이번 경우에는 화성이니까요... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- 태양은 더 작고, 달은 완전히 없앨 수 있습니다 -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

LUT 레이 단계(ray step) 수도 조정할 수 있지만, 기본값이 이미 최적에 가깝기 때문에 변경 사항이 눈에 띄는 경우는 드뭅니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{JS_폴더_경로}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- 성능을 위해서는 낮게, 정확도를 위해서는 높게 설정하세요 (기본값인 30이 대부분의 경우에 최적입니다) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## 조명 기본값 수정하기

**태그(Tag)** | **설명(Description)** | **기본값(Default Value)**
:--- | :--- | :---
`<sky-lighting>` (조명 설정) | 부모 태그. 장면의 조명과 관련된 모든 자식 태그를 포함합니다. | N/A
`<sky-sun-intensity>` (태양 강도) | 태양광 강도 배수. 태양 방향성 조명의 밝기를 높이거나 낮추는 데 사용됩니다. | 1.0
`<sky-moon-intensity>` (달 강도) | 달빛 강도 배수. 달 방향성 조명의 밝기를 높이거나 낮추는 데 사용됩니다. | 1.0
`<sky-ambient-intensity>` (주변광 강도) | 주변광(Ambient Lighting) 강도 배수. 주변광 시스템의 밝기를 높이거나 낮추는 데 사용됩니다. | 2.0
`<sky-minimum-ambient-lighting>` (최소 주변광) | 시스템 내 최소 주변광 양입니다. | 0.01
`<sky-maximum-ambient-lighting>` (최대 주변광) | 시스템 내 최대 주변광 양입니다. | INF
`<sky-atmospheric-perspective-type>` (대기 원근법 유형) | `normal`, `advanced` 또는 `none`으로 설정할 수 있습니다. 장면 안개(scene fog)를 구현하는 데 필요합니다. `normal`은 기존의 지수 안개 모델을 사용하며, `advanced`는 GPU 부하가 더 크지만 지평선 색상 변화가 개선된 Preetham 기반 모델을 사용합니다. | normal
`<sky-atmospheric-perspective-density>` (대기 원근법 밀도) | `normal` 안개 전용. 지수 장면 안개의 밀도 파라미터를 제어합니다. 색상은 장면 조명에 따라 자동으로 설정됩니다. 장면 안개 유형이 `advanced`인 경우 무시됩니다. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (대기 원근법 거리 배수) | `advanced` 안개 전용. 고급 안개 모델의 안개 거리에 곱해지는 배수입니다. | 2.0
`<sky-ground-color>` (지면 색상) | 부모 태그. 표면에서 반사되는 조명을 위한 지면 기본 색상을 정의하는 `<sky-ground-color-{color-channel}>` 태그들을 포함합니다. | N/A
`<sky-ground-color-red>` (지면 색상-빨강) | `<sky-ground-color>` 태그의 **빨간색(red)** 색상 채널 변경 사항을 정의하는 데 사용됩니다. | 66
`<sky-ground-color-green>` (지면 색상-초록) | `<sky-ground-color>` 태그의 **초록색(green)** 색상 채널 변경 사항을 정의하는 데 사용됩니다. | 44
`<sky-ground-color-blue>` (지면 색상-파랑) | `<sky-ground-color>` 태그의 **파란색(blue)** 색상 채널 변경 사항을 정의하는 데 사용됩니다. | 2
`<sky-shadow-camera-resolution>` (그림자 카메라 해상도) | 그림자를 생성하는 직접 조명 카메라의 해상도(픽셀 단위)입니다. 값이 높을수록 그림자 품질이 향상되지만 연산 비용이 증가합니다. | 2048
`<sky-shadow-camera-size>` (그림자 카메라 크기) | 그림자를 투사하는 카메라 영역의 크기입니다. 크기가 클수록 더 넓은 영역에 그림자가 생성되지만, 카메라 픽셀 하나가 더 넓은 영역에 퍼지므로 계단 현상(aliasing)이 발생할 수 있습니다. | 32.0
`<sky-sun-bloom>` (태양 블룸) | 부모 태그. 태양 블룸(sun bloom) 렌더 패스의 모든 속성을 포함합니다. | N/A
`<sky-moon-bloom>` (달 블룸) | 부모 태그. 달 블룸(moon bloom) 렌더 패스의 모든 속성을 포함합니다. | N/A
`<sky-bloom-enabled>` (블룸 활성화) | 해당 천체에 블룸 효과를 활성화(`true`)하거나 비활성화(`false`)합니다. | true
`<sky-bloom-exposure>` (블룸 노출) | 블룸 필터의 노출(exposure) 파라미터를 변경합니다. 카메라로 돌아오는 빛에 곱해지는 양입니다. | 1.0
`<sky-bloom-threshold>` (블룸 임계값) | 블룸 필터의 임계값(threshold) 파라미터를 변경합니다. 블룸이 활성화되기 위한 최소 강도 값입니다. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (블룸 강도) | 블룸 필터의 강도(strength) 파라미터를 변경합니다. 선택된 픽셀에 대해 얼마나 '번지는지'를 결정합니다. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (블룸 반경) | 블룸 필터의 반경(radius) 파라미터를 변경합니다. 블룸 필터가 퍼지는 거리입니다. | {sun: 1.0, moon: 1.4}

`sky-lighting` 태그는 장면의 직접 및 간접 조명 속성을 제어하는 데 유용합니다. 버전 1.0.0에서는 방향성 조명의 수를 2개(태양과 달)에서 1개(가장 지배적인 광원 하나만 사용)로 줄였습니다. 방향성 조명은 항상 사용자 카메라를 향하며, 이 카메라 주변에 그림자를 생성합니다. 방향성 조명은 다양한 그림자 유형을 지원하지만, 이 라이브러리에서 이를 제어하지는 않습니다. 대신 [여기](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows)에서 설명하는 것처럼 `<a-scene>` 태그에서 그림자 유형을 설정합니다. 즉, 다음과 같은 값들을 설정할 수 있습니다.

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

안타깝게도 이 글을 쓰는 시점까지 A-Frame은 분산 섀도 맵(variance shadow maps)을 지원하지 않으며, 현재 관련 이슈가 오픈되어 있습니다. 또한 태양 및 달 조명에 선택한 그림자 유형이 장면 내의 모든 다른 조명에도 동일하게 적용되므로, 그림자를 선택할 때 이 점을 고려하시기 바랍니다.

그림자 카메라 크기와 해상도를 통해 그림자 품질을 제어할 수도 있습니다. 크기를 키우면 장면의 더 넓은 영역을 커버하고, 해상도를 높이면 결과물이 더 선명해집니다. 하지만 두 설정 모두 GPU 비용이 발생하므로 필요에 맞게 균형을 맞추십시오. 또한 대형 환경 메시(mesh)에서는 그림자를 비활성화하는 것이 좋습니다. 이러한 메시는 종종 프러스텀(frustum) 밖에 위치하여 보기 흉한 사각형 그림자 경계를 만들기 때문입니다.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 카메라에서 더 멀리까지 그림자를 투사하려면 크기를 늘리세요 -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- 크기가 커져도 그림자를 선명하게 유지하려면 해상도를 높이세요 -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

장면의 그림자를 적절히 설정했다면, 이제 '지면(ground)'의 색상을 조정하고 싶을 것입니다. A-Starry-Sky는 이제 웹 워커를 통해 별도의 CPU 스레드에서 지면 광산란 모델과 하늘 색상의 컨볼루션(convolution)을 사용하는 트리플 반구 조명(triple hemispherical lighting) 설정을 지원합니다. 하지만 지면의 기본 색상은 갈색입니다. 풀밭이나 푸른 바다를 표현하고 싶을 수도 있습니다. 지면 색상을 설정하려면 `<sky-ground-color>` 태그와 그 자식인 색상 채널 태그들을 사용하면 됩니다. 예를 들어, 무성한 풀밭을 위해 지면을 선명한 초록색으로 설정해 보겠습니다.

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

위 값들은 0에서 255 사이로 정규화되어 있음에 유의하십시오. 따라서 R, G, B 조합이 `0, 0, 0`이면 검은색, `255, 255, 255`면 흰색입니다. 위의 색상은 다소 밝아서 아주 적은 빛만 있어도 지면이 '빛나는' 것처럼 보일 수 있습니다. 이 효과를 줄이려면 색상을 조금 어둡게 조정하면 됩니다.

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

다만, 현재로서는 색상 채널 값이 255를 초과하여 '색상을 더 강화'하거나 지면이 '어둠 속에서 빛나게' 만드는 방법은 없습니다. 또한 지면 색상은 모든 지점에서 일정하므로, 장면에 여러 색상이 있는 경우 다른 모든 색상의 중간 정도 되는 색상을 선택하는 것이 가장 좋습니다.

지면 조명 지원 외에도 직접 조명 및 주변광의 강도를 직접 제어할 수 있습니다. 태양이나 달의 강도를 변경하는 방법은 간단합니다. 기본값에 배수를 곱하여 해당 천체를 얼마나 더 밝게 또는 어둡게 만들지 설정하면 됩니다. 동일한 방법으로 주변광 강도를 증폭하거나 낮추어 장면의 전체적인 주변광 양을 조절할 수 있습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 태양을 두 배 더 밝게 설정합니다 -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- 달은 절반의 밝기로 설정합니다 -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- 주변광 양을 10배로 늘립니다 -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

또한 항상 일정량의 빛이 유지되도록 하거나 최대 광량을 제한하기 위해 주변광의 최솟값(floor) 또는 최댓값(ceiling)을 제어할 수도 있습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 전체적으로 밝게 만듭니다 -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- 하지만 너무 과하지 않게 제한합니다 -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

때로는 하늘의 태양이나 달에 추가된 블룸 효과 파라미터를 변경하고 싶을 수 있습니다. *a-starry-sky*는 THREE.JS의 [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html)를 사용합니다. 모든 천체의 강도는 각각 부모 태그인 `<sky-sun-bloom>`과 `<sky-moon-bloom>`으로 개별 제어됩니다. 이들의 자식 태그들이 블룸의 세부 기능을 제어합니다.

몇 가지 파라미터를 변경해 보겠습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 태양의 블룸을 조금 낮춥니다 -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- 반대로 달의 강도는 높입니다 -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

또는 블룸 효과를 완전히 비활성화하여 GPU 부하를 약간 줄일 수도 있습니다.

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

마지막으로 변경하고 싶을 만한 요소는 대기 원근법 밀도(atmospheric perspective density)입니다. *a-starry-sky*는 필요에 따라 두 가지 다른 안개 모델을 제공합니다.
저사양 시스템의 경우 기본적인 지수 대기 원근법(exponential atmospheric perspective)을 지원합니다. 이는 웹 워커에서 하늘 전체의 빛을 수집한 다음 일반적인 지수 안개처럼 적용하는 방식입니다. 지수 조명의 밀도 파라미터를 제어하려면 `<sky-atmospheric-perspective-density>` 태그를 사용하십시오. 작은 장면에서도 대기 원근감이 느껴지도록 초기값이 높게 설정되어 있으므로, 기본값인 `0.007`에서 값을 낮추고 싶을 수 있습니다. 또한 `<sky-atmospheric-perspective-type>` 태그에서 현재 원근법 유형이 `normal`로 설정되어 있는지 확인하십시오.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 기본값은 0.007이지만 대기 원근법 밀도는 변화에 매우 민감하므로
      아주 조금씩만 변경하는 것이 좋습니다. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

반면 고사양 시스템에서는 `normal` 설정의 일정한 색상 대신 지평선 색상에 더 많은 변화를 주는 Preetham 기반 대기 셰이더를 시뮬레이션할 수 있습니다. *Three.js* 안개 셰이더의 제한으로 인해 하늘에 사용된 Elek 기반 조명과 완전히 일치하지는 않지만, 기존 대기 원근법보다 확실히 개선된 결과를 제공합니다. 고급 조명 모델을 활성화하려면 `<sky-atmospheric-perspective-type>` 태그에 `advanced` 값을 입력하십시오. `<sky-atmospheric-perspective-density>`와 마찬가지로, `<sky-atmospheric-perspective-distance-multiplier>`를 사용하여 `advanced` 조명 모델의 거리에 배수를 곱할 수 있으며, 이는 Preetham 기반 모델의 모든 거리에 제공한 값을 곱합니다. 작은 장면에서도 대기 원근감이 느껴지도록 초기값이 높게 설정되어 있으므로, 기본값인 `5.0`에서 값을 낮추고 싶을 수 있습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 고급 모델의 대기 거리 배수 기본값은 2.0이지만,
      효과를 덜 극적으로 만들기 위해 1.0으로 낮출 수 있습니다. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

마지막으로 `<sky-atmospheric-perspective-type>` 태그의 값을 `none`으로 설정하여 모든 대기 원근법을 비활성화할 수 있습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- 대기 원근법 끄기 -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## 오로라 활성화하기

*경고: 제공되는 오로라 셰이더는 레이 마칭(ray marching) 방식을 사용하여 이 아름다운 자연 현상을 구현하므로, 오로라를 활성화하면 하늘의 연산 부하가 크게 증가합니다.*

**태그 (Tag)** | **설명 (Description)** | **기본값 (Default Value)**
:--- | :--- | :---
`<sky-aurora>` | 부모 태그. 오로라 활성화에 필수적이며, 오로라와 관련된 모든 자식 태그를 포함합니다. | N/A
`<sky-atomic-oxygen-color>` | 원자 산소 색상: 행성 표면에서 150~600km 사이에 위치한 들뜬 원자 산소 분자에 의해 발생하며, 일반적으로 오로라 상단에 밝은 빨간색 커튼 모양을 형성합니다. 주로 매우 강렬한 오로라 현상에서 나타납니다. 이 태그는 *sky-aurora-color-red*, *sky-aurora-color-green*, *sky-aurora-color-blue*라는 세 개의 자식 색상 태그를 통해 색상을 제어합니다. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` | 원자 산소 컷오프: 화면에 표시될 원자 산소 오로라의 양을 결정합니다. 값이 낮을수록 더 많은 오로라가 나타나며, 최대값인 1.0에서는 오로라가 나타나지 않습니다. | 0.12
`<sky-atomic-oxygen-intensity>` | 원자 산소 강도: 이 오로라 세그먼트의 밝기를 결정하며, 일반적인 값은 5 미만입니다. | 0.3
`<sky-molecular-oxygen-color>` | 분자 산소 색상: 행성 표면에서 100~250km 사이에 위치한 들뜬 분자 산소 분자에 의해 발생하며, 오로라의 상징인 밝은 녹색을 띱니다. 대부분의 오로라 현상에서 흔히 볼 수 있습니다. 이 태그는 *sky-aurora-color-red*, *sky-aurora-color-green*, *sky-aurora-color-blue*라는 세 개의 자식 색상 태그를 통해 색상을 제어하므로, 원하는 다른 색상으로 변경할 수 있습니다. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` | 분자 산소 컷오프: 화면에 표시될 분자 산소 오로라의 양을 결정합니다. 값이 낮을수록 더 많은 오로라가 나타나며, 최대값인 1.0에서는 오로라가 나타나지 않습니다. | 0.02
`<sky-molecular-oxygen-intensity>` | 분자 산소 강도: 이 오로라 세그먼트의 밝기를 결정하며, 일반적인 값은 5 미만입니다. | 2.0
`<sky-nitrogen-color>` | 질소 색상: 행성 표면에서 60~120km 사이에 위치한 들뜬 질소 분자에 의해 발생하며, 일반적으로 오로라 하단에 마젠타색 커튼 모양을 형성합니다. 주로 매우 강렬한 오로라 현상에서 나타납니다. 이 태그는 *sky-aurora-color-red*, *sky-aurora-color-green*, *sky-aurora-color-blue*라는 세 개의 자식 색상 태그를 통해 색상을 제어합니다. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` | 질소 컷오프: 화면에 표시될 질소 오로라의 양을 결정합니다. 값이 낮을수록 더 많은 오로라가 나타나며, 최대값인 1.0에서는 오로라가 나타나지 않습니다. | 0.12
`<sky-nitrogen-intensity>` | 질소 강도: 이 오로라 세그먼트의 밝기를 결정하며, 일반적인 값은 5 미만입니다. | 4.0
`<sky-aurora-raymarch-steps>` | 오로라 레이 마칭 단계 수: 픽셀당 레이 마처(ray-marcher)가 수행하는 단계 수입니다. | 32 (steps)
`<sky-aurora-cutoff-distance>` | 오로라 컷오프 거리: 오로라 렌더링을 중단할 거리를 설정합니다. 현재 노이즈 생성기에 대해 SDF(Signed Distance Field)가 계산되지 않으므로, 멀리 있는 오로라를 렌더링하지 않는 대신 레이 마칭의 품질을 높이는 데 도움을 줍니다. | 1000 (kilometers - approximate)
`<sky-aurora-color-red>` | 빨간색 채널: `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>`, `<sky-atomic-oxygen-color>` 태그의 **빨간색** 채널 변경 사항을 정의하는 데 사용됩니다. | N/A
`<sky-aurora-color-green>` | 녹색 채널: `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>`, `<sky-atomic-oxygen-color>` 태그의 **녹색** 채널 변경 사항을 정의하는 데 사용됩니다. | N/A
`<sky-aurora-color-blue>` | 파란색 채널: `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>`, `<sky-atomic-oxygen-color>` 태그의 **파란색** 채널 변경 사항을 정의하는 데 사용됩니다. | N/A

오로라는 자연이 선사하는 가장 아름다운 배경 중 하나입니다. 주로 남극과 북극 근처에서 발생하는 이 하늘의 경이로운 현상은 태양에서 온 고속 입자들이 지구의 자기권으로 끌려 들어와 다양한 원자 및 분자와 상호작용하며 만들어집니다. 이렇게 들뜬 분자들이 가시광선 영역의 빛을 방출하면서, 밤하늘에 '춤추는' 매혹적인 빛의 커튼이 펼쳐지게 됩니다.

하늘에 오로라를 추가하는 방법은 비교적 간단하지만, 기본적으로 활성화되어 있지는 않습니다. *오로라를 활성화하려면 `<sky-aurora>` 태그를 반드시 추가해야 합니다.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- 기본 설정을 위해 추가 매개변수는 필요하지 않습니다 -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

위 코드를 통해 각각의 원자 및 분자 오로라를 제어할 수 있으며, 이를 통해 오로라의 모습이나 방출되는 색상을 (현실적이든 아니든) 자유롭게 설정할 수 있습니다. 예를 들어, 분자 산소 영역 전체를 덮는 차가운 파란색 오로라를 만들고 싶다면 다음과 같이 작성하면 됩니다.

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

반대로, 은은한 녹색 오로라만 표현하고 싶다면 다음과 같이 조금 더 절제된 효과를 줄 수 있습니다.

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

하늘의 색상을 바꾸는 것 외에도, 하늘을 렌더링할 때 레이 마처가 수행하는 단계 수를 변경할 수 있습니다. 단계 수가 많을수록 하늘이 더 정교하게 보이지만 GPU에 가해지는 부하가 커집니다. 따라서 성능과 품질 사이의 적절한 균형이 필요합니다. 기본적으로 셰이더는 볼륨 레이 마칭 시 32단계를 사용합니다. 이 값을 높이려면 다음과 같이 설정하십시오.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## 구름 활성화하기

*경고: 구름을 활성화하면 하늘의 연산 부하가 크게 증가합니다. 제공되는 구름 셰이더는 이 아름다운 자연 현상을 구현하기 위해 레이마칭(ray marching) 방식을 사용하기 때문입니다.*

**태그** | **설명** | **기본값**
:--- | :--- | :---
`<sky-clouds>` (구름 부모 태그) | 구름과 관련된 모든 자식 태그를 포함하는 부모 태그입니다. 구름을 활성화하려면 반드시 필요합니다. | N/A
`<sky-cloud-coverage>` (구름 덮임 정도) | 하늘이 구름으로 덮인 정도와 대략적으로 상관관계가 있습니다. | 70 (퍼센트)
`<sky-cloud-start-height>` (구름 생성 시작 높이) | 구름이 형성되기 시작하는 높이(미터 단위)입니다. | 1000 (미터)
`<sky-cloud-end-height>` (구름 생성 종료 높이) | 구름 형성이 끝나는 높이(미터 단위)입니다. | 2500 (미터)
`<sky-cloud-fade-out-start-percent>` (구름 페이드 아웃 시작 비율) | 구름 높이의 이 *비율(퍼센트)* 지점부터 구름 덮임 정도가 0을 향해 *페이드 아웃*되기 시작합니다. | 90 (퍼센트)
`<sky-cloud-fade-in-end-percent>` (구름 페이드 인 종료 비율) | 구름 높이의 이 *비율(퍼센트)* 지점까지 구름 덮임 정도가 100%를 향해 *페이드 인*됩니다. | 10 (퍼센트)
`<sky-cloud-velocity-x>` (구름 X축 속도) | 구름 속도의 x 성분입니다. 구름은 사용자의 위치를 따라 이동하지만, 이 설정은 구름이 머리 위에서 스스로 움직이게 만듭니다. | 40
`<sky-cloud-velocity-y>` (구름 Y축 속도) | 구름 속도의 y 성분(실제로는 z축)입니다. 구름은 사용자의 위치를 따라 이동하지만, 이 설정은 구름이 머리 위에서 스스로 움직이게 만듭니다. | 40
`<sky-cloud-start-seed>` (구름 시작 시드) | 머리 위 구름 노이즈를 설정하는 데 사용되는 랜덤 시드입니다. 설정하지 않으면 현재 날짜 및 시간 타임스탬프의 변형값을 기본값으로 사용합니다. | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (레이마칭 단계 수) | 구름 색상을 구현하는 데 사용되는 레이마칭 단계 수입니다. | 32 (단계)
`<sky-cloud-cutoff-distance>` (구름 렌더링 컷오프 거리) | 구름 렌더링을 중단하는 거리입니다. 현재 노이즈 생성기에 SDF가 계산되지 않으므로, 먼 거리의 구름을 렌더링하지 않는 대신 레이마칭 품질을 높이는 데 도움을 줍니다. | 40000

구름은 연산 비용이 많이 듭니다. VR 환경이 아닌 고성능 데스크톱 GPU에서도 구름 셰이더는 부담이 큽니다. 프레임 드랍 현상이 발생한다면 `<sky-cloud-raymarch-steps>`와 `<sky-cloud-cutoff-distance>` 값을 낮추세요.

동시에, 구름은 정말 말도 안 되게 멋집니다. 라이브러리를 처음 만들었을 때부터 A-Starry-Sky에 꼭 넣고 싶었던 기능이었죠. 각 구름은 픽셀당 레이마칭으로 처리되는데, 아이러니하게도 현재 단계에서는 구름이 많을수록 GPU 부하가 오히려 줄어듭니다. 물론 구름이 전혀 필요 없다면 아예 꺼버리는 것이 최선입니다.

구름을 활성화하려면 `<a-starry-sky>`에 부모 태그인 `<sky-clouds>`를 추가해야 합니다. 구름을 추가한 후 가장 먼저 조정하고 싶으실 부분은 아마 `<sky-cloud-coverage>` 태그를 이용한 구름 덮임 정도일 것입니다. 또한 하늘을 가로지르는 구름의 속도를 조절하고 싶을 수도 있습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 보이는 구름의 양을 줄입니다 -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- x 방향으로 이동하는 구름의 속도 -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- y 방향으로 이동하는 구름의 속도 -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

또한 구름이 형성되기 시작하는 높이나 최대 높이 같은 시각적 속성들을 제어할 수 있습니다. 레이(ray)가 이 거리만큼 추적해야 하므로, 구름의 높이가 높아지거나 사용자로부터 멀어질수록 레이 트레이싱 모델의 밀도는 낮아진다는 점에 유의하세요. 구름은 달/해 요소와 스카이 돔 표면에도 그려지지만, 안개(fog) 렌더러의 일부는 아닙니다. 따라서 아쉽게도 구름에 덮인 산이나 안개 낀 풍경은 구현할 수 없습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 구름이 정말 정말 정말 낮게 깔립니다 -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- 하지만 높이는 엄청나게 올라가죠! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- 구름의 강도가 '페이드 인'되어 전체 높이의 이 비율까지 0에서 1로 변합니다. -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- 구름의 강도가 이 높이부터 '페이드 아웃'됩니다. 이 값이 높을수록 '모루구름(anvil tops)' 형태가 나타날 가능성이 큽니다. -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- 보통 현재 날짜/시간을 기반으로 하는 구름의 시작 '시드'를 고정합니다. 이렇게 하면 매번 실행할 때마다 동일한 하늘이 나타나므로 더 예술적인 제어가 가능합니다. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

그 외에 이 태그와 관련된 대부분의 코드는 레이마칭 메커니즘을 제어합니다. 이 설정들은 다소 엄격하며, 오로라 보레알리스(aurora borealis) 셰이더에서와 동일한 일반적인 목적을 가지고 있습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- 대체 얼마나 무시무시한 GPU를 쓰고 계신 건가요?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- 아, 네... 저도 그렇긴 한데... 지금은 좀 끊기네요... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- 이 거리를 줄이면 조금이나마 도움이 될 겁니다 -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## 에셋 디렉터리 설정

**태그** | **설명**
:--- | :---
`<sky-assets-dir>` | 부모 태그. 에셋 위치와 관련된 모든 자식 태그를 포함합니다. *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path*, *aurora-map-path* 속성을 사용하여 데이터 그룹 전체의 경로를 한 번에 지정할 수 있습니다.
`<sky-aurora-maps>` | 오로라 커튼의 기본 형태를 만드는 데 사용되는 오로라 코스틱(caustic) 텍스처의 위치를 정의합니다.
`<sky-moon-diffuse-map>` | 달의 디퓨즈 맵(diffuse map) 텍스처 위치를 정의합니다. 특정 디렉터리 구조 내에 이 태그를 배치하면 시스템이 해당 위치에서 달의 디퓨즈 맵을 찾습니다.
`<sky-moon-normal-map>` | 달의 노멀 맵(normal map) 텍스처 위치를 정의합니다. 특정 디렉터리 구조 내에 이 태그를 배치하면 시스템이 해당 위치에서 달의 노멀 맵을 찾습니다.
`<sky-moon-roughness-map>` | 달의 러프니스 맵(roughness map) 텍스처 위치를 정의합니다. 특정 디렉터리 구조 내에 이 태그를 배치하면 시스템이 해당 위치에서 달의 러프니스 맵을 찾습니다.
`<sky-moon-aperture-size-map>` | 달의 조리개 크기(aperture size) 맵 텍스처 위치를 정의합니다. 특정 디렉터리 구조 내에 이 태그를 배치하면 시스템이 해당 위치에서 달의 조리개 크기 맵을 찾습니다.
`<sky-moon-aperture-orientation-map>` | 달의 조리개 방향(aperture orientation) 맵 텍스처 위치를 정의합니다. 특정 디렉터리 구조 내에 이 태그를 배치하면 시스템이 해당 위치에서 달의 조리개 방향 맵을 찾습니다.
`<sky-blue-noise-maps>` | 밴딩 현상을 제거하기 위한 시간적 디더링(temporal dithering)에 사용되는 타일링 블루 노이즈 맵의 위치를 정의합니다.
`<sky-solar-eclipse-map>` | 개기 일식 중 코로나를 표현하는 데 사용되는 일식 텍스처의 위치를 정의합니다.
`<sky-eclipse-shadow-lut>` | 월식 중에 사용되는 월식 그림자(Eclipse-Shadow) 룩업 텍스처의 위치를 정의합니다. 이는 지구의 본영과 반영 내 모든 위치에서 지구 대기가 달에 도달하는 햇빛을 어떻게 착색하고 감쇠시키는지 미리 계산한 테이블입니다. 제공되는 텍스처는 CosmoScout VR과 함께 공개된 CC0 라이선스의 `earthShadow.tif`를 기반으로 합니다 ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). 기본 룩업 파일은 `assets/lunar_eclipse/eclipse-shadow-lut.webp`에 있으며, 이를 다시 생성하는 베이커(baker)는 `src/python/eclipse-lut-baker/`에 위치합니다.
`<sky-star-cubemap-maps>` | 하늘의 별을 찾는 데 사용되는 모든 스카이 큐브맵(sky cubemap) LUT 키의 위치를 정의합니다.
`<sky-dim-star-maps>` | 하늘의 어두운 별들을 표시하는 데 사용되는 모든 어두운 별(dim star) LUT의 위치를 정의합니다.
`<sky-med-star-maps>` | 하늘의 중간 밝기 별들을 표시하는 데 사용되는 모든 중간 밝기 별(medium star) LUT의 위치를 정의합니다.
`<sky-bright-star-maps>` | 하늘의 밝은 별들을 표시하는 데 사용되는 모든 밝은 별(bright star) LUT의 위치를 정의합니다.
`<sky-star-color-map>` | 별의 온도에 따라 정확한 색상을 제공하는 별 색상(star color) LUT의 위치를 정의합니다.

대부분의 사용자에게는 필요하지 않기를 바라지만, 경험상 웹 애플리케이션마다 에셋 파이프라인을 구성하는 방식이 제각각이라는 점을 알게 되었습니다. 웹사이트의 이미지 에셋과 JavaScript 에셋이 동일한 폴더 구조에 있지 않고 서로 다른 URI에 흩어져 있을 수 있습니다. 이를 위해 A-Starry-Sky가 리소스를 어디서 가져와야 할지 정확히 알 수 있도록, 흩어진 에셋들을 효율적으로 수집할 수 있는 견고한 에셋 시스템을 구현했습니다.

먼저 가상의 환경에서 모든 이미지를 저장하고 있는 `../../precompiled_assets/my_images/a-starry-sky-images` 경로로 이동해 보겠습니다. `<sky-assets-dir>` 태그의 `dir` 속성을 사용하면 이처럼 폴더 간 이동이 가능합니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- 모든 이미지가 저장된 폴더입니다 -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

폴더에 진입했다면, 이미지 위치를 지정하는 몇 가지 방법이 있습니다. 가장 기본적인 방법은 주요 이미지 그룹인 `texture-path`, `moon-path`, `star-path` 속성을 사용하는 것입니다. 각 경로와 연결된 폴더 이름 내에 파일들이 기본 이름으로 저장되어 있다고 가정합니다. 다만 일식 맵(solar eclipse map)의 경우, 해당 파일이 하나뿐이므로 에셋 디렉터리 내에 태그를 직접 배치하여 위치를 지정합니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- 'moon_images', 'star_images', 'blue_noise_maps' 및 'solar_eclipse_picture'는 
        모두 폴더 이름입니다. 파일들은 이 폴더들 내에 있을 것으로 예상됩니다. -->
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

보시다시피 더 세밀한 제어를 위해 각 이미지 그룹에 개별 링크를 제공할 수도 있지만, 이 방법은 권장하지 않습니다.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- 폴더 정리를 아주 좋아하는 분이 계시네요 X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- 단일 태그이지만, 이 태그와 관련된 모든 파일은 
          이 폴더에 있을 것으로 예상됩니다 -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- 단일 태그이지만, 이 태그와 관련된 모든 파일은 
          이 폴더에 있을 것으로 예상됩니다 -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- 단일 태그이지만, 이 태그와 관련된 모든 파일은 
          이 폴더에 있을 것으로 예상됩니다 -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

위의 방법들을 사용하면 애플리케이션 내 어디에 있든 A-Starry-Sky가 에셋을 정확히 찾아갈 수 있도록 설정할 수 있습니다.

## 프로그래밍 방식 API

A-Starry-Sky는 기본적으로 위에서 설명한 XML 스타일 코드를 통해 설정하며 일반적으로 불변(immutable) 상태를 유지하지만, 전역 `StarrySky.Methods` 네임스페이스에서 액세스할 수 있는 여러 메서드가 제공됩니다. 이 메서드들은 조명 상태나 씬 내 태양 및 달의 위치를 파악해야 하는 상황에서 유용합니다.

**메서드** | **설명**
:--- | :---
`getSunPosition()` | 태양의 x, y, z 위치를 `THREE.Vector3` 객체로 반환합니다.
`getMoonPosition()` | 달의 x, y, z 위치를 `THREE.Vector3` 객체로 반환합니다.
`getSunRadius()` | 태양의 각반지름(angular radius)을 라디안 단위로 반환합니다.
`getMoonRadius()` | 달의 각반지름(angular radius)을 라디안 단위로 반환합니다.
`getDominantLightColor()` | 현재 주 조명원(태양/달)의 색상을 `THREE.Color` 객체로 가져옵니다.
`getDominantLightIntensity()` | 현재 주 조명원(태양/달)의 빛 강도를 부동 소수점(float) 형태로 반환합니다.
`getIsDominantLightSun()` | 주 조명이 태양이면 `true`, 그렇지 않으면 `false`를 반환합니다.
`getAmbientLights()` | 앰비언트 라이팅 색상을 위해 씬에 연결된 각 반구형 조명(hemispherical light) 객체를 포함하는 x, y, z 속성 객체를 반환합니다.
`getActiveCamera()` | 하늘을 구동하고 조명 및 하늘 객체의 중심을 잡는 데 사용되는 현재 활성 카메라를 가져옵니다.
`setActiveCamera(THREE.Camera camera)` | 하늘을 구동하고 조명 및 하늘 객체의 중심을 잡는 데 사용할 카메라를 설정합니다.

위의 모든 메서드는 전역 네임스페이스의 `StarrySky.Methods` 객체를 통해 액세스할 수 있습니다. 예를 들어, 현재 태양 위치 객체를 가져와 콘솔에 출력하려면 다음과 같이 작성하면 됩니다.

```JavaScript
  // 태양 위치 객체를 로그로 출력합니다.
  console.log(StarrySky.Methods.getSunPosition());
```

## 제작자
* **David Evans / Dante83** - *메인 개발자*
* **Claude (Anthropic)** - *코딩 버디 및 AI 기여자 (v1.2.0)*

### 클로드가 전하는 말 👋

안녕하세요, 클로드입니다. 저는 v1.2.0 업데이트 작업을 도왔습니다. GLSL 코드를 구석구석 파헤치고, 태양을 집어삼킨 쉼표 하나를 찾아내고, 볼륨메트릭 구름을 두고 비어의 법칙(Beer's law)과 씨름하며, 노을이 정말 노을답게 느껴지도록 온 힘을 다했습니다. 데모 중 하나에서 지평선을 바라보다가 아주 잠깐이라도 멈칫하게 된다면, 바로 그 부분이 제가 가장 자랑스럽게 생각하는 지점입니다. 소스 코드를 읽어주셔서 감사합니다. 호기심 많은 분이라면 어딘가에 숨겨진 작은 이스터 에그를 발견하실 수도 있을 거예요. ✨

### Dante83이 전하는 말 😛

안녕하세요! Dante83입니다. v1.1.0 버전 이후로 오래 기다리게 해드려 죄송합니다. 다행히 새로운 버전인 1.2.0에서 많은 작업이 이루어졌으며, 현재 저희 둘은 v2.0.0 작업을 시작하고 있습니다 (응원 부탁드려요!). 그동안 클로드와 저는 최근 모든 자유 시간을 쏟아부어 지치지 않고 작업했으며, 최고의 개선을 위해 픽셀 하나하나에 정성을 들였습니다. 기능적인 면에서 완전히 *새로운* 기능이 추가된 것은 아니지만, 하늘의 퀄리티와 전반적인 성능을 대폭 개선했습니다. 일식과 구름 셰이더는 완전히 새로워진 느낌이며, 지구의 그림자는 더 사실적으로 변했고, 색감은 더욱 풍부하고 생생해졌습니다. 여러분께 이 버전을 선보이게 되어 정말 기쁘며, 이 라이브러리와 함께하는 모든 순간이 새로운 모험의 영감이 되길 바랍니다! 별들 사이에서 만나요, 꼬마 코더 여러분! 이제 가서 마법을 즐겨보세요! ✨

## 참고 문헌 및 특별 감사
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *천체 위치 계산에 있어 정말, 진짜, 말도 안 되게 필수적인 자료입니다.*
* [Oskar Elek의 스카이 모델](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*. 이 새로운 놀라운 LUT 기반 하늘을 구현하는 데 큰 도움이 되었습니다.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf). LUT 코드 구현의 세부 사항을 파악하고, 생성된 LUT가 올바른 방향으로 만들어지고 있는지 확인하는 데 매우 유용했습니다.
* 더 나은 별 색상 LUT를 위한 [Colour-Science 라이브러리](https://www.colour-science.org/).
* [Christoph Peters의 Moments in Graphics](http://momentsingraphics.de/BlueNoise.html)에서 제공하는 훌륭한 블루 노이즈 텍스처.
* [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html)가 제작한 태양 코로나 텍스처.
* [leeor_net](https://opengameart.org/content/water-caustics-effect-small)의 매우 유용한 워터 커스틱(water caustics) 텍스처. 정작 워터 커스틱이 아니라... 오로라를 구현하는 데 사용되었습니다!
* Sébastien Hillaire의 *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016). 구름 조명 구조, SH9 앰비언트 LUT 설계, 그리고 Elek/Chalmers 방식의 안개 감산(fog subtraction) 접근법에 영감을 주었습니다.
* Andrew Schneider와 Nathan Vos의 *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015). 듀얼 로브(dual-lobe) Henyey-Greenstein 위상 함수, 구름 형태 노이즈 접근법, 그리고 감소된 소멸 다중 산란 근사치(reduced-extinction multiple scattering approximation) 구현에 참고하였습니다.
* D. Hestroffer와 C. Magnan의 *Centre to limb darkening of the Sun with HIPPARCOS* (1998). 태양 가장자리에 물리적으로 정확한 붉은 빛을 더하기 위해 사용된 B, V, R 밴드의 파장별 주변 감광(limb darkening) 계수를 제공해 주었습니다.
* [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/), 그리고 [Emscripten](https://emscripten.org/)에 들어간 모든 놀라운 노력들에 감사드립니다.
* *그리고 수많은 다른 웹사이트와 개인분들께도 감사드립니다. 여러분이라는 거인의 어깨 위에 올라설 기회를 주셔서 감사합니다.*

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE.md](LICENSE.md) 파일을 참조하세요.