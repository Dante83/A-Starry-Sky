# A-Starry-Sky

A-Starry-Sky — это небесный купол для [A-Frame Web Framework](https://aframe.io/). Он представляет собой простой, готовый к использованию компонент, который позволяет легко создавать красивые циклы смены дня и ночи в ваших проектах.

> **Внимание: требуется мощный GPU — не открывайте на мобильном телефоне.**

**[Живое демо](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — небо в Сан-Франциско на текущую дату и время.

| Пример | Описание |
|:---|:---|
| [Пустыня](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Сцена в пустыне в определенный дневной момент |
| [Солнечное затмение](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Полное солнечное затмение с короной |
| [Лунное затмение](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Тень Земли на Луне |
| [Рождественская звезда (1226 г. н.э.)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Великое соединение Юпитера и Сатурна |
| [Марс](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Кастомная марсианская атмосфера |
| [Пользовательская атмосфера](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Различные значения рассеяния Ми и Рэлея |
| [Большая высота](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Вид неба с высоты 20 км |
| [Северное сияние](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ Высокая нагрузка на GPU |
| [Легкие облака](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ Высокая нагрузка на GPU |
| [Средние облака](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ Высокая нагрузка на GPU |
| [Густые облака](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ Высокая нагрузка на GPU |

## Предварительные требования

Этот инструмент разработан для [A-Frame Web Framework](https://aframe.io/) версии 1.7.0 и выше. Также потребуется веб-браузер с поддержкой WebXR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Установка

Скопируйте файл *a-starry-sky.v1.2.0.min.js*, а также папки *assets* и *wasm* в ваш проект. Добавьте следующие скрипты в ваш HTML — обратите внимание, что `starry-sky-web-worker.js` здесь **не** указан; на него ссылаются напрямую в теге `<a-starry-sky>`.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{ПУТЬ_К_ПАПКЕ_JS}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{ПУТЬ_К_ПАПКЕ_JS}/wasm/interpolation-engine.js"></script>
```

После настройки этих ссылок добавьте компонент `<a-starry-sky>` в тег `<a-scene>` из A-Frame, указав URL вашего веб-воркера для состояния неба следующим образом:

```html
<a-scene>
  <a-starry-sky web-worker-src="{ПУТЬ_К_ПАПКЕ_JS}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Этот минимальный код создаст небо, которое в реальном времени перемещается в соответствии с широтой и долготой Сан-Франциско, Калифорния. Однако возможности библиотеки не ограничиваются этим: A-Starry-Sky предоставляет множество пользовательских HTML-тегов для настройки состояния неба.

**ПРИМЕЧАНИЕ: Этот скайбокс неизменяем (immutable). Это означает, что начальные настройки останутся постоянными на любой конкретной странице. К сожалению, на данный момент сделать код изменяемым слишком сложно.**

## Настройка местоположения

**Тег** | **Описание** | **Значение по умолчанию**
:--- | :--- | :---
`<sky-location>` | Родительский тег. Содержит дочерние теги широты (`<sky-latitude>`) и долготы (`<sky-longitude>`). | N/A
`<sky-latitude>` | Устанавливает широту местоположения. Северное полушарие — **положительное** значение. | 38
`<sky-longitude>` | Устанавливает долготу местоположения. Западнее [Гринвичского меридиана](https://en.wikipedia.org/wiki/Prime_meridian) — **отрицательное** значение. | -122

Вы можете установить любые координаты широты и долготы на планете Земля. Настройка местоположения позволяет передать игрокам ощущение смены времён года, изменяя траектории движения Солнца или Луны. Широта также определяет, какие звёзды будут видны в ночном небе. И широта, и долгота имеют решающее значение для событий, зависящих от времени, таких как солнечные и лунные затмения. Это особенно важно, если вы хотите создать эффект полного солнечного затмения. Впрочем, настроить координаты проще, чем решить, где именно вы хотите оказаться. Просто найдите нужные координаты в [Google Earth](https://earth.google.com/web/) или другом картографическом сервисе и введите значения в соответствующие теги следующим образом:

Отправимся в Нью-Йорк!
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

А как насчёт Перта в Австралии?
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

Обратите внимание, что долгота западнее [Гринвичского меридиана](https://en.wikipedia.org/wiki/Prime_meridian) имеет отрицательное значение (например, Нью-Йорк или Буэнос-Айрес).

## Настройка времени

**Тег** | **Описание** | **Значение по умолчанию**
:--- | :--- | :---
`<sky-time>` | Родительский тег. Содержит все дочерние теги, относящиеся к элементам даты или времени. | N/A
`<sky-date>` | Строка локальной даты и времени в формате **ГОД-МЕСЯЦ-ДЕНЬ ЧАС:МИНУТА:СЕКУНДА** / *2021-03-21 13:45:51*. Часы указаны в 24-часовом формате (от 0 до 23). 0 соответствует полуночи, а 23 — одиннадцати часам вечера. | Текущая дата
`<sky-speed>` | Множитель времени, используемый для ускорения или замедления астрономических расчетов. | 1.0
`<sky-utc-offset>` | Смещение UTC для данной локации. Отрицательные значения указывают на расположение к западу от [главного меридиана](https://en.wikipedia.org/wiki/Prime_meridian), что противоположно значениям долготы. **Обратите внимание, что время UTC не учитывает летнее время (DST)** | 7

Установите в `<sky-date>` **местное время** для выбранной локации, а затем задайте `<sky-utc-offset>`, соответствующий этому часовому поясу. Например, Нью-Йорк имеет смещение UTC-4 (летом) или UTC-5 (зимой) — летнее время не применяется автоматически.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Предыдущие настройки местоположения -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- Смещение UTC можно настроить следующим образом! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Обратите внимание, что мы снова используем родительский тег `<sky-time>`, который объединяет все дочерние теги для настроек времени.

Впрочем, вы не обязаны ограничиваться временем вашего компьютера. Почему бы не попробовать что-то более интересное — например, путешествие во времени! Я слышал, что [солнечное затмение](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) [8 апреля 2024 года в 13:27 (по 24-часовому формату) в Дель-Рио, штат Техас](https://nationaleclipse.com/cities_total.html) будет просто захватывающим. Давайте заглянем туда!

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

Пропустили [Рождественскую звезду](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? Нет-нет, не ту. Я про ту, что была в 1226 году нашей эры. Что ж, хорошо, что у нас есть машина времени, а A-Starry-Sky теперь поддерживает планеты :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Путешествия во времени — это весело, но вам также может понадобиться изменить *скорость* течения времени. В игровых мирах цикл дня и ночи часто проходит быстрее, чем в реальности; или же вы захотите вовсе остановить время, чтобы зафиксировать определенный момент для настройки освещения. Для этого добавьте тег `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Теперь в игровом мире будет проходить восемь дней за одни реальные сутки. -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Разумеется, если вы создаете постоянный мир (persistent world), не забудьте учесть ускоренный ход времени при подготовке вашего HTML. Впрочем, настройка динамического HTML для неба остается на ваше усмотрение.

## Настройка параметров атмосферы

**Тег** | **Описание** | **Значение по умолчанию**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Родительский тег. Содержит все дочерние теги, связанные с настройками атмосферы. | N/A
`<sky-camera-height>` | Высота камеры над поверхностью Земли. | 0.0km
`<sky-mie-directional-g>` | Определяет степень прямого рассеяния при рассеянии Ми — это белесый ореол вокруг солнца, вызванный крупными частицами в атмосфере. Чем выше значение `mie-directional G`, тем более запыленной кажется атмосфера. | 0.8
`<sky-sun-intensity>` | Интенсивность солнечного света в шейдере атмосферы. | 1367.0
`<sky-moon-intensity>` | Интенсивность лунного света в шейдере атмосферы. | 29.0
`<sky-mie-beta>` | Цветовая зависимость рассеяния Ми, которая в основном отвечает за «свечение» вокруг солнца. Рассеяние достаточно равномерно для всех частот. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Цветовая зависимость рэлеевского рассеяния, которое в основном отвечает за голубой цвет неба. Обратите внимание, что по умолчанию сильнее всего рассеивается синий канал. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Цветовая зависимость рассеяния озонового слоя, имеющая решающее значение для глубоких синих оттенков во время заката. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | Высота отсечки, после которой атмосфера «заканчивается». | 80.0 km
`<sky-radius-of-earth>` | Радиус планеты или Земли. | 6366.7 km
`<sky-rayleigh-scale-height>` | Высота масштаба затухания для рэлеевского рассеяния (при условии экспоненциального затухания). Рэлеевское рассеяние вызвано атмосферными газами, поэтому имеет гораздо большую высоту масштаба. | 8.4
`<sky-mie-scale-height>` | Высота масштаба затухания для рассеяния Ми (при условии экспоненциального затухания). Рассеяние Ми вызвано более крупными частицами, поэтому оно затухает быстрее, что приводит к меньшему значению характерной высоты. | 1.25
`<sky-ozone-percent-of-rayleigh>` | Процент озона в небе, используемый для настройки отражения озонового слоя при закате. | 6E-7
`<sky-moon-angular-diameter>` | Угловой диаметр Луны в небе.  | 3.15 degrees
`<sky-sun-angular-diameter>` | Угловой диаметр Солнца в небе. | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | Количество шагов луча до края неба, которые делает трассировщик при сборе света для атмосферных LUT (таблиц поиска). | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | Количество угловых шагов в каждой точке вдоль луча для рассеяния k-го порядка. | 30 steps
`<sky-number-of-scattering-orders>` | Количество проходов рассеяния высших порядков (k-го), запекаемых в LUT внутреннего рассеяния. Более высокие значения повышают качество, но увеличивают время запекания LUT. | 4
`<sky-parameters-color-red>` | Красный компонент, используемый в тегах `<sky-rayleigh-beta>`, `<sky-mie-beta>` и `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | Зеленый компонент, используемый в тегах `<sky-rayleigh-beta>`, `<sky-mie-beta>` и `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | Синий компонент, используемый в тегах `<sky-rayleigh-beta>`, `<sky-mie-beta>` и `<sky-ozone-beta>`. | N/A

Параметры атмосферы обладают одним из самых обширных API во всей кодовой базе. Хотя опытный разработчик может использовать эти значения для создания уникального неба, большинству пользователей будет достаточно настроек по умолчанию. Тем не менее, некоторые параметры особенно полезны и довольно просты в понимании.

Скорее всего, вы захотите изменить размер Солнца и Луны. В реальности угловой диаметр Солнца составляет 0,53 градуса, а Луны — 0,50 градуса. Использование этих значений в симуляторе будет более достоверным, но на большинстве устройств (особенно на мониторах, а не в VR) они могут казаться слишком маленькими. Чтобы увеличить или уменьшить эти объекты, просто измените значения в соответствующих тегах.

```html
<a-scene>
  <a-starry-sky web-worker-src="{ПУТЬ_К_ПАПКЕ_JS}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <sky-sun-angular-diameter>0.53</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.5</sky-moon-angular-diameter>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Также вы можете изменить начальную высоту над планетой. Это делается с помощью тега `<sky-camera-height>`, хотя небо будет динамически адаптироваться к вашей высоте по мере перемещения камеры вверх или вниз. Этот параметр задает начальную высоту сцены в километрах; максимальное значение составляет *80 км*, минимальное — *0 км*.

[Пример на большой высоте](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{ПУТЬ_К_ПАПКЕ_JS}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Поднимемся чуть выше. Здесь воздух более разреженный. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Кроме того, вы можете изменить состав атмосферы. Этот раздел предоставляет доступ к различным механизмам управления видом неба. Например, если вам больше нравятся значения рэлеевского рассеяния из статьи [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) вместо наших стандартных (5.8e-3, 1.35e-2, 3.31e-2) $\rightarrow$ (5.19E-3, 1.21E-2, 2.96E-2), а также вы хотите использовать бета-значение 4.44E-3 $\rightarrow$ 2E-3, вы можете легко заменить их в коде.

```html
<a-scene>
  <a-starry-sky web-worker-src="{ПУТЬ_К_ПАПКЕ_JS}/wasm/starry-sky-web-worker.js">
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

Но это скучно. Давайте попробуем что-нибудь более безумное. Опираясь на работу [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf), отправимся на Марс! В этой модели роли рэлеевского и миевого рассеяния меняются, поэтому нам стоит поменять и их характерные высоты. Большая часть рассеяния на Марсе происходит из-за миевого рассеяния крупных частиц при очень разреженной атмосфере. Следовательно, мы можем практически отключить «миевое» (рэлеевское) рассеяние и перераспределить высоты. Также нам нужно изменить радиус планеты и, возможно, подобрать более подходящие значения высоты атмосферы для трассировщика лучей.

[Пример с Марсом](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{ПУТЬ_К_ПАПКЕ_JS}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Обратите внимание, что на Марсе сильнее рассеивается красный свет -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Несколько правок для рассеяния Ми также помогут -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Обязательно отключите озон -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Ну, в нашем случае — Марс... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- Солнце меньше, а Луну можно вообще убрать -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Вы также можете настроить количество шагов луча для LUT, хотя значения по умолчанию уже близки к оптимальным, и изменения редко бывают заметны.

```html
<a-scene>
  <a-starry-sky web-worker-src="{ПУТЬ_К_ПАПКЕ_JS}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Меньше — для производительности, больше — для точности (стандартные 30 оптимальны в большинстве случаев) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Изменение настроек освещения по умолчанию

**Тег** | **Описание** | **Значение по умолчанию**
:--- | :--- | :---
`<sky-lighting>` (Освещение неба) | Родительский тег. Содержит все дочерние теги, связанные с освещением сцены. | N/A
`<sky-sun-intensity>` (Интенсивность солнца) | Множитель интенсивности солнечного света; используется для усиления или ослабления яркости направленного солнечного освещения. | 1.0
`<sky-moon-intensity>` (Интенсивность луны) | Множитель интенсивности лунного света; используется для усиления или ослабления яркости направленного лунного освещения. | 1.0
`<sky-ambient-intensity>` (Интенсивность общего света) | Множитель интенсивности окружающего (эмбиентного) освещения; используется для регулировки яркости системы общего освещения. | 2.0
`<sky-minimum-ambient-lighting>` (Мин. общий свет) | Минимальный уровень окружающего света в системе. | 0.01
`<sky-maximum-ambient-lighting>` (Макс. общий свет) | Максимальный уровень окружающего света в системе. | INF
`<sky-atmospheric-perspective-type>` (Тип атм. перспективы) | Может принимать значения `normal` (обычный), `advanced` (расширенный) или `none` (отключено). Требуется для создания тумана в сцене. `normal` использует оригинальную экспоненциальную модель тумана; `advanced` использует модель на основе алгоритма Притама (Preetham) для более естественного изменения цвета горизонта, что увеличивает нагрузку на GPU. | normal
`<sky-atmospheric-perspective-density>` (Плотность атм. перспективы) | Только для типа `normal`. Управляет параметром плотности экспоненциального тумана в сцене. Цвет устанавливается автоматически на основе освещения сцены. Игнорируется, если выбран тип `advanced`. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (Множитель дистанции атм. перспективы) | Только для типа `advanced`. Множитель дистанции до тумана для расширенной модели. | 2.0
`<sky-ground-color>` (Цвет земли) | Родительский тег. Содержит теги `<sky-ground-color-{color-channel}>` для описания базового цвета поверхности земли (для расчета отраженного света). | N/A
`<sky-ground-color-red>` (Красный канал земли) | Используется для изменения **красного** цветового канала в теге `<sky-ground-color>`. | 66
`<sky-ground-color-green>` (Зеленый канал земли) | Используется для изменения **зеленого** цветового канала в теге `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` (Синий канал земли) | Используется для изменения **синего** цветового канала в теге `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` (Разрешение камеры теней) | Разрешение (в пикселях) камеры прямого освещения, используемой для генерации теней. Более высокие значения повышают качество теней, но увеличивают нагрузку на систему. | 2048
`<sky-shadow-camera-size>` (Размер камеры теней) | Размер области камеры, в которой отбрасываются тени. Чем больше размер, тем большая область покрыта тенями, однако это может привести к алиасингу (ступенчатости), так как каждый пиксель камеры растягивается на большую площадь. | 32.0
`<sky-sun-bloom>` (Свечение солнца) | Родительский тег; содержит все свойства прохода рендеринга эффекта свечения (bloom) солнца. | N/A
`<sky-moon-bloom>` (Свечение луны) | Родительский тег; содержит все свойства прохода рендеринга эффекта свечения (bloom) луны. | N/A
`<sky-bloom-enabled>` (Bloom включен) | Включает (`true`) или выключает (`false`) эффект bloom для данного астрономического объекта. | true
`<sky-bloom-exposure>` (Экспозиция bloom) | Изменяет параметр экспозиции фильтра bloom — коэффициент усиления света, возвращаемого камере. | 1.0
`<sky-bloom-threshold>` (Порог bloom) | Изменяет порог (threshold) фильтра bloom — минимальный уровень интенсивности, при котором начинает проявляться свечение. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (Сила bloom) | Изменяет параметр силы (strength) фильтра bloom — степень «размытия» света для выбранных пикселей. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (Радиус bloom) | Изменяет радиус фильтра bloom — расстояние, на которое распространяется свечение. | {sun: 1.0, moon: 1.4}

Теги освещения неба позволяют управлять параметрами прямого и непрямого освещения в сцене. В версии 1.0.0 количество направленных источников света было сокращено с двух (солнце и луна) до одного (только для самого доминирующего источника). Направленный свет всегда сфокусирован на камере пользователя и создает тени вокруг неё. Хотя направленный свет поддерживает различные типы теней, управлять ими нужно не в этой библиотеке. Вместо этого тип теней задается в теге `<a-scene>`, как описано [здесь](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). То есть вы можете установить любое из следующих значений:

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

К сожалению, на момент написания этого текста A-Frame еще не поддерживает вариационные карты теней (variance shadow maps), хотя по этому вопросу открыт тикет. Также имейте в виду, что тип теней, выбранный для солнца и луны, будет применяться ко всем остальным источникам света в сцене, так что учитывайте это при выборе.

Вы также можете управлять качеством теней через размер и разрешение камеры теней. Увеличение размера расширяет область покрытия сцены, а увеличение разрешения делает тени более четкими — однако оба параметра увеличивают нагрузку на GPU, поэтому подбирайте их с балансом. Также рекомендуется отключать тени для крупных мешей окружения, так как они часто выходят за пределы пирамиды видимости (frustum) и создают некрасивые квадратные края теней.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Увеличьте размер, чтобы тени отбрасывались дальше от камеры -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Увеличьте разрешение, чтобы сохранить четкость теней при больших размерах -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Когда тени в сцене будут настроены идеально, вам, вероятно, захочется отрегулировать цвет «земли». A-Starry-Sky теперь поддерживает тройную полусферическую схему освещения, которая использует свертку цветов неба в сочетании с моделью рассеивания света от земли; вычисления выполняются в отдельном потоке CPU через web-воркеры. По умолчанию земля имеет коричневый цвет. Но у вас может быть травянистое поле или лазурный океан. Чтобы изменить цвет поверхности, используйте тег `<sky-ground-color>` и его дочерние теги цветовых каналов. Например, если мы хотим сделать землю ярко-зеленой для сочного луга:

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

Обратите внимание, что значения выше нормализованы в диапазоне от 0 до 255. Таким образом, комбинация RGB `0, 0, 0` — это черный цвет, а `255, 255, 255` — белый. Цвет из примера выше может быть слишком ярким, из-за чего земля будет казаться «светящейся» даже при слабом освещении. Чтобы ослабить этот эффект, просто немного приглушите цвет.

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

Стоит отметить, что если значение любого из цветовых каналов превысит 255, «усилить» цвет или заставить землю «светиться в темноте» на данный момент невозможно. Кроме того, цвет земли является константой для всех точек сцены, поэтому, если у вас используется несколько цветов, лучше выбрать тот, который будет нейтральным фоном для остальных.

Помимо освещения земли, теперь можно напрямую управлять интенсивностью прямого и окружающего света. Изменить яркость солнца или луны очень просто: используйте множитель от значения по умолчанию, чтобы определить, насколько ярче или тусклее должен быть этот астрономический объект. Аналогичным образом можно усилить или ослабить общую интенсивность окружающего освещения в сцене.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Сделаем солнце в два раза ярче -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- А луну — в два раза тусклее -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- И увеличим интенсивность общего освещения в десять раз -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Вы также можете установить нижний и верхний пороги для окружающего освещения, чтобы гарантировать наличие определенного минимума или максимума света.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Сделаем сцену светлее -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Но не слишком сильно -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

В какой-то момент вам может потребоваться изменить параметры эффектов свечения (bloom) для солнца или луны. *a-starry-sky* использует [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) из THREE.JS. Интенсивность для каждого астрономического объекта настраивается отдельно с помощью родительских тегов `<sky-sun-bloom>` и `<sky-moon-bloom>`. Дочерние теги управляют конкретными свойствами свечения.

Начнем с изменения нескольких параметров:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Немного приглушим солнце -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Но увеличим интенсивность луны -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Также можно полностью отключить эффект bloom, что немного снизит нагрузку на GPU.

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

Последний элемент освещения неба, который вы можете захотеть изменить, — это плотность атмосферной перспективы. *a-starry-sky* предлагает две модели тумана в зависимости от ваших потребностей.
Для систем с низкой производительностью поддерживается базовая экспоненциальная модель атмосферной перспективы: она собирает свет по всему небу в web-воркере, а затем применяет его как обычный экспоненциальный туман. Чтобы управлять параметром плотности, используйте тег `<sky-atmospheric-perspective-density>`. Начальные значения установлены достаточно высокими, чтобы эффект был заметен даже в небольших сценах, поэтому вы можете захотеть уменьшить значение по умолчанию (*0.007*). Также убедитесь, что в теге `<sky-atmospheric-perspective-type>` установлен тип `normal`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Хотя значение по умолчанию 0.007, плотность атмосферной перспективы очень
      чувствительна к изменениям, поэтому достаточно небольших корректировок. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Для более мощных систем можно использовать атмосферный шейдер на основе модели Притама (Preetham), который обеспечивает большее разнообразие цветов горизонта по сравнению с константными цветами в режиме `normal`. Предложенное решение не является точным соответствием освещению неба на базе Elek из-за ограничений шейдера тумана в *Three.js*, но оно значительно улучшает оригинальную атмосферную перспективу. Чтобы включить расширенную модель, установите значение `advanced` в теге `<sky-atmospheric-perspective-type>`. Аналогично параметру плотности, вы можете изменить дистанцию для расширенной модели с помощью тега `<sky-atmospheric-perspective-distance-multiplier>`, который умножает все расстояния в модели Притама на указанное число. Значения по умолчанию довольно высоки для заметности эффекта даже в малых сценах, поэтому вы можете уменьшить значение *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Хотя по умолчанию стоит 2.0, множитель дистанции в расширенной модели
      может быть уменьшен до 1.0 для менее драматичного эффекта. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Наконец, вы можете полностью отключить атмосферную перспективу, установив значение `none` в теге `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Отключить атмосферную перспективу -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Включение северного сияния

*ПРЕДУПРЕЖДЕНИЕ: Включение северного сияния значительно увеличит вычислительную нагрузку на отрисовку неба, так как используемый шейер сияния применяет метод реймарчинга (ray marching) для создания этого прекрасного природного явления.*

**Тег** | **Описание** | **Значение по умолчанию**
:--- | :--- | :---
`<sky-aurora>` (основной тег) | Родительский тег. Необходим для включения северного сияния. Содержит все дочерние теги, относящиеся к сиянию. | N/A
`<sky-atomic-oxygen-color>` (цвет атомарного кислорода) | Вызывается возбужденными молекулами атомарного кислорода на высоте от 150 до 600 километров от поверхности планеты. Атомарный кислород обычно создает ярко-красную завесу в верхней части сияния и наблюдается при наиболее интенсивных вспышках. Этот тег управляет цветами с помощью трех дочерних тегов: *sky-aurora-color-red*, *sky-aurora-color-green* и *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (порог атомарного кислорода) | Определяет вероятность появления сияния от атомарного кислорода. Чем меньше число, тем сильнее выражено сияние; значение 1.0 означает полное отсутствие сияния. | 0.12
`<sky-atomic-oxygen-intensity>` (интенсивность атомарного кислорода) | Определяет яркость этого сегмента сияния. Типичные значения обычно не превышают 5. | 0.3
`<sky-molecular-oxygen-color>` (цвет молекулярного кислорода) | Вызывается возбужденными молекулами молекулярного кислорода на высоте от 100 до 250 километров от поверхности планеты. Молекулярный кислород обычно дает тот самый культовый ярко-зеленый цвет и присутствует в большинстве случаев сияния. Этот тег управляет цветами с помощью трех дочерних тегов *sky-aurora-color-red*, *sky-aurora-color-green* и *sky-aurora-color-blue* — на случай, если вы захотите изменить цвет вашего сияния. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (порог молекулярного кислорода) | Определяет вероятность появления сияния от молекулярного кислорода. Чем меньше число, тем сильнее выражено сияние; значение 1.0 означает полное отсутствие сияния. | 0.02
`<sky-molecular-oxygen-intensity>` (интенсивность молекулярного кислорода) | Определяет яркость этого сегмента сияния. Типичные значения обычно не превышают 5. | 2.0
`<sky-nitrogen-color>` (цвет азота) | Вызывается возбужденными молекулами азота на высоте от 60 до 120 километров от поверхности планеты. Азот обычно создает пурпурную завесу у основания сияния и наблюдается при наиболее интенсивных вспышках. Этот тег управляет цветами с помощью трех дочерних тегов *sky-aurora-color-red*, *sky-aurora-color-green* и *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (порог азота) | Определяет вероятность появления сияния от азота. Чем меньше число, тем сильнее выражено сияние; значение 1.0 означает полное отсутствие сияния. | 0.12
`<sky-nitrogen-intensity>` (интенсивность азота) | Определяет яркость этого сегмента сияния. Типичные значения обычно не превышают 5. | 4.0
`<sky-aurora-raymarch-steps>` (шаги реймарчинга) | Количество шагов, которые делает реймарчер на один пиксель. | 32 (шагов)
`<sky-aurora-cutoff-distance>` (дистанция отсечения) | Расстояние, после которого сияние перестает отрисовываться. Это помогает улучшить качество реймарчинга за счет отказа от рендеринга удаленных объектов, так как SDF в настоящее время не рассчитываются для наших генераторов шума. | 1000 (км — приблизительно)
`<sky-aurora-color-red>` (красный канал) | Используется для изменения **красного** цветового канала в тегах `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` и `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (зеленый канал) | Используется для изменения **зеленого** цветового канала в тегах `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` и `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (синий канал) | Используется для изменения **синего** цветового канала в тегах `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` и `<sky-atomic-oxygen-color>`. | N/A

Северное сияние — одно из самых прекрасных зрелищ в природе. Обычно возникающее у северного и южного полюсов, это явление представляет собой результат взаимодействия высокоскоростных частиц солнечного ветра с магнитосферой Земли и различными атомами и молекулами атмосферы. Возбужденные молекулы излучают свет в видимом спектре, создавая завораживающие «танцующие» завесы в ночном небе.

Добавить северное сияние в ваше небо довольно просто, но по умолчанию оно отключено. *Для его активации необходимо добавить тег `<sky-aurora>`.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- Дополнительные параметры не требуются для использования настроек по умолчанию -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Каждый из типов атомного и молекулярного сияния можно настраивать с помощью кода выше, что позволяет кастомизировать внешний вид эффекта и даже менять излучаемые цвета (реалистично или нет). Например, если вы хотите создать холодное синее сияние, охватывающее весь диапазон молекулярного кислорода, используйте следующий код:

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

С другой стороны, если вам нужно лишь легкое зеленое сияние, можно добиться более сдержанного эффекта следующим образом:

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

Помимо изменения цветов, вы можете настроить количество шагов реймарчера при отрисовке неба. Чем больше шагов, тем качественнее выглядит изображение, но тем выше нагрузка на ваш GPU. Поэтому важно найти баланс между производительностью и качеством. По умолчанию шейдер использует 32 шага для реймарчинга объема. Чтобы увеличить это значение, сделайте следующее:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Включение облаков

*ПРЕДУПРЕЖДЕНИЕ: Включение облаков значительно увеличит вычислительную нагрузку на небо, так как используемый шейдер облаков применяет метод реймарчинга (ray marching) для создания этого прекрасного природного явления.*

**Тег** | **Описание** | **Значение по умолчанию**
:--- | :--- | :---
`<sky-clouds>` (Родительский тег) | Родительский тег. Содержит все дочерние теги, связанные с облаками. Необходим для включения облаков. | N/A
`<sky-cloud-coverage>` (Облачность) | Примерно соответствует количеству неба, покрытого облаками. | 70 (процентов)
`<sky-cloud-start-height>` (Начальная высота) | Высота в метрах, на которой начинают формироваться облака. | 1000 (метров)
`<sky-cloud-end-height>` (Конечная высота) | Высота в метрах, на которой формирование облаков прекращается. | 2500 (метров)
`<sky-cloud-fade-out-start-percent>` (Начало затухания) | Процент высоты облака, при котором плотность облачности начинает *затухать* до нуля. | 90 (процентов)
`<sky-cloud-fade-in-end-percent>` (Конец нарастания) | Процент высоты облака, к которому плотность облачности *нарастает* до 100%. | 10 (процентов)
`<sky-cloud-velocity-x>` (Скорость по X) | Компонента скорости облаков по оси X. Облака перемещаются вместе с вами, но этот параметр заставляет их двигаться над головой самостоятельно. | 40
`<sky-cloud-velocity-y>` (Скорость по Y) | Компонента скорости облаков по оси Y (фактически Z). Облака перемещаются вместе с вами, но этот параметр заставляет их двигаться над головой самостоятельно. | 40
`<sky-cloud-start-seed>` (Сид генерации) | Случайное число (seed), используемое для установки текущего шума облаков. Если не задано, по умолчанию используется вариация временной метки даты и времени. | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (Шаги реймарчинга) | Количество шагов реймарчинга, используемых для определения цвета облаков. | 32 (шага)
`<sky-cloud-cutoff-distance>` (Дистанция отсечения) | Расстояние, после которого облака перестают отрисовываться. Это помогает улучшить качество реймарчинга за счет того, что удаленные облака не рендерятся (так как SDF в данный момент не рассчитываются для наших генераторов шума). | 40000

Облака — ресурсозатратная функция. Даже на мощной настольной видеокарте вне VR шейдер облаков весьма требователен — уменьшите значения `<sky-cloud-raymarch-steps>` и `<sky-cloud-cutoff-distance>`, если столкнетесь с падением частоты кадров.

В то же время, облака выглядят безумно круто, и я хотел добавить их в A-Starry-Sky с самого момента создания библиотеки. Каждое облако просчитывается методом реймарчинга для каждого пикселя, и, по иронии судьбы, на данном этапе чем больше у вас облаков, тем меньше нагрузка на GPU. Конечно, если облака вам совсем не нужны, лучше всего будет просто полностью их отключить.

Для включения облаков необходимо добавить родительский тег `<sky-clouds>` внутрь `<a-starry-sky>`. После этого первым делом вы, скорее всего, захотите изменить степень затянутости неба с помощью тега `<sky-cloud-coverage>`, который определяет количество облаков. Также вы можете управлять их скоростью, чтобы они стремительно проносились по небосводу.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Уменьшаем количество видимых облаков -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Скорость облаков по оси X -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Скорость облаков по оси Y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Вы также можете настроить визуальные свойства облаков, например, высоту их начала и верхнюю границу. Имейте в виду, что луч должен пройти через всё это расстояние: чем выше поднимаются облака или чем дальше они от вас, тем меньше будет плотность в модели трассировки лучей. Облака также отрисовываются на поверхности элементов луны/солнца и небесного купола, но не являются частью рендерера тумана, поэтому, к сожалению, вы никогда не увидите гор, окутанных облаками, или самого тумана...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Облака очень-очень низко -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Но поднимаются они очень высоко! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- Интенсивность облаков «нарастает» от 0 до 1 к этому проценту от общей высоты -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- Интенсивность облаков начинает «затухать» с этой высоты. Чем выше этот параметр, тем больше вероятность появления «наковален» (плоских вершин) -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Фиксирует начальный «сид» облаков, который обычно зависит от текущей даты и времени. Это позволяет небу выглядеть одинаково при каждом запуске для большего художественного контроля -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

В остальном большинство параметров этого тега управляют механизмами реймарчинга, которые, к сожалению, довольно жестко заданы и имеют то же общее назначение, что и в шейдере северного сияния.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Что за чудовищная видеокарта у вас стоит?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- А, ну да, у меня тоже... Хотя теперь немного подтормаживает... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Уменьшение этой дистанции хотя бы немного поможет с этим -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Настройка директорий ресурсов

**Тег** | **Описание**
:--- | :---
`<sky-assets-dir>` (директория ресурсов) | Родительский тег. Содержит все дочерние теги, связанные с расположением ресурсов. Может содержать атрибуты *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path* и *aurora-map-path*, чтобы указать системе пути к целым группам данных сразу.
`<sky-aurora-maps>` (карты северного сияния) | Определяет расположение текстур каустики северного сияния, которые используются для создания основных «занавесей» Aurora Borealis.
`<sky-moon-diffuse-map>` (диффузная карта Луны) | Определяет путь к диффузной карте Луны. Наличие этого тега в определенной структуре директорий сообщает системе, что диффузная карта Луны находится по этому адресу.
`<sky-moon-normal-map>` (карта нормалей Луны) | Определяет путь к карте нормалей Луны. Наличие этого тега в определенной структуре директорий сообщает системе, что карта нормалей Луны находится по этому адресу.
`<sky-moon-roughness-map>` (карта шероховатости Луны) | Определяет путь к карте шероховатости Луны. Наличие этого тега в определенной структуре директорий сообщает системе, что карта шероховатости Луны находится по этому адресу.
`<sky-moon-aperture-size-map>` (карта размера апертуры Луны) | Определяет путь к карте размера апертуры Луны. Наличие этого тега в определенной структуре директорий сообщает системе, что карта размера апертуры Луны находится по этому адресу.
`<sky-moon-aperture-orientation-map>` (карта ориентации апертуры Луны) | Определяет путь к карте ориентации апертуры Луны. Наличие этого тега в определенной структуре директорий сообщает системе, что карта ориентации апертуры Луны находится по этому адресу.
`<sky-blue-noise-maps>` (карты синего шума) | Определяет расположение тайловых карт синего шума, которые используются для временного дизеринга (temporal dithering) с целью устранения бандинга (ступенчатых градиентов).
`<sky-solar-eclipse-map>` (карта солнечного затмения) | Определяет расположение текстуры солнечного затмения, которая используется для отрисовки короны во время полного солнечного затмения.
`<sky-eclipse-shadow-lut>` (LUT тени при затмении) | Определяет расположение LUT-текстуры тени при затмении, используемой во время лунного затмения. Это предварительно вычисленная таблица того, как атмосфера Земли окрашивает и ослабляет солнечный свет, достигающий Луны, для каждой позиции в умбре (полной тени) и пенумбре (полутени) Земли. Поставляемая текстура основана на файле `earthShadow.tif` под лицензией CC0, опубликованном в CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). LUT по умолчанию находится в `assets/lunar_eclipse/eclipse-shadow-lut.webp`; бейкер для его регенерации находится в `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` (кубические карты звезд) | Определяет расположение всех ключей LUT кубических карт неба, которые используются для поиска звезд на небе.
`<sky-dim-star-maps>` (карты тусклых звезд) | Определяет расположение всех LUT тусклых звезд, используемых для отображения всех малозаметных звезд на небе.
`<sky-med-star-maps>` (карты звезд средней яркости) | Определяет расположение всех LUT звезд средней яркости, используемых для отображения соответствующих звезд на небе.
`<sky-bright-star-maps>` (карты ярких звезд) | Определяет расположение всех LUT ярких звезд, используемых для отображения самых заметных звезд на небе.
`<sky-star-color-map>` (карта цветов звезд) | Определяет расположение LUT цветов звезд, которая используется для присвоения звездам правильных цветов в зависимости от их температуры.

Хотя я надеюсь, что большинству пользователей это редко понадобится, опыт показывает, что у каждого веб-приложения свои взгляды на организацию конвейеров ресурсов (asset pipelines). Изображения и JavaScript-файлы сайта могут не находиться в одной структуре папок и даже быть разбросаны по разным URI. Поэтому я постарался создать достаточно гибкую систему ресурсов, которая поможет собрать эти разрозненные файлы воедино, чтобы A-Starry-Sky знала, где искать необходимые данные.

Для начала попробуем перейти по пути *../../precompiled_assets/my_images/a-starry-sky-images* — представим, что в нашей вымышленной вселенной все изображения хранятся именно там. Для перемещения между папками мы используем атрибут *dir* в теге `<sky-assets-dir>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Папка, в которой хранятся все наши изображения -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Как только мы попали в нужную папку, у нас есть несколько способов указать расположение изображений. Самый простой механизм — использование атрибутов для каждой из основных групп ресурсов: *texture-path*, *moon-path* и *star-path*. Предполагается, что файлы находятся внутри указанных папок под своими именами по умолчанию. Исключением является карта солнечного затмения: так как для этого файла существует всего одно изображение, мы укажем его расположение, просто поместив соответствующий тег внутрь директории ресурсов.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Обратите внимание, что 'moon_images', 'star_images', 'blue_noise_maps' и 'solar_eclipse_picture'
        — это имена папок. Ожидается, что сами файлы находятся внутри этих папок.-->
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

Как вы могли заметить, для более точного контроля можно предоставить ссылки на каждую отдельную группу изображений, хотя это и не рекомендуется.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Кто-то очень любит папки X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- Несмотря на то, что это одиночные теги, ожидается, что все связанные 
          с ними файлы находятся в этой папке -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- Несмотря на то, что это одиночный тег, ожидается, что все связанные 
          с ним файлы находятся в этой папке -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- Несмотря на то, что это одиночный тег, ожидается, что все связанные 
          с ним файлы находятся в этой папке -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Используя описанные выше методы, вы сможете указать A-Starry-Sky путь к вашим ресурсам, где бы они ни находились в вашем приложении.

## ПРОГРАММНЫЙ API

Хотя A-Starry-Sky предназначен для настройки с помощью вышеупомянутого кода в стиле XML и, как правило, является неизменяемым, существует ряд методов, доступных в глобальном пространстве имен `StarrySky.Methods`. Они полезны в ситуациях, когда вам необходимо узнать условия освещения или положение солнца и луны в сцене.

**Метод** | **Описание**
:--- | :---
`getSunPosition()` | Возвращает координаты x, y, z солнца в виде объекта THREE.Vector3.
`getMoonPosition()` | Возвращает координаты x, y, z луны в виде объекта THREE.Vector3.
`getSunRadius()` | Возвращает угловой радиус солнца в радианах.
`getMoonRadius()` | Возвращает угловой радиус луны в радианах.
`getDominantLightColor()` | Возвращает цвет текущего доминирующего источника света (солнца/луны) в виде объекта THREE.Color.
`getDominantLightIntensity()` | Возвращает интенсивность света текущего доминирующего источника света (солнца/луны) в виде числа с плавающей запятой (float).
`getIsDominantLightSun()` | Возвращает true, если доминирующий источник света — солнце, иначе false.
`getAmbientLights()` | Возвращает объект со свойствами x, y и z, каждый из которых связан с объектом полусферического освещения сцены для настройки цветов окружающего света.
`getActiveCamera()` | Возвращает текущую активную камеру, используемую для управления небом, центрирования освещения и объектов неба.
`setActiveCamera(THREE.Camera camera)` | Устанавливает текущую камеру, используемую для управления небом, центрирования освещения и объектов неба.

Все вышеперечисленные методы доступны через объект `StarrySky.Methods` в глобальном пространстве имен. Таким образом, если вы хотите, например, получить текущий объект положения солнца и вывести его в консоль, вам достаточно сделать следующее:

```JavaScript
  //Выведем объект положения солнца в консоль
  console.log(StarrySky.Methods.getSunPosition());
```

## Авторы
* **David Evans / Dante83** — *основной разработчик*
* **Claude (Anthropic)** — *напарник по кодингу и ИИ-контрибьютор (v1.2.0)*

### Записка от Клода 👋

Привет, на связи Клод. Я помогал с обновлением v1.2.0: пришлось изрядно побродить по дебрям GLSL, выслеживать запятую, пожиравшую солнце, спорить с законом Бера по поводу объемных облаков и изо всех сил стараясь сделать так, чтобы закаты выглядели как настоящие закаты. Если в одном из демо вы засмотритесь на горизонт и на мгновение замрете — знайте, это та часть работы, которой я горжусь больше всего. Спасибо, что заглянули в исходники; если вы любите исследовать, то сможете найти там спрятанный пасхальный секрет. ✨

### Записка от Dante83 😛

Всем привет! С вами Dante83. Прошу прощения за долгое ожидание после версии v1.1.0. К счастью, в новой версии 1.2.0 кипела работа, а сейчас мы с Клодом приступаем к разработке v2.0.0 (пожелайте нам удачи!). В последнее время мы трудились не покладая рук в каждую свободную минуту, выверяя каждый пиксель, чтобы добиться исключительного результата. Хотя по сути новых функций не появилось, нам удалось колоссально улучшить качество неба и общую производительность. Шейдеры затмения и облаков ощущаются совершенно по-новому, тень Земли стала более реалистичной, а цвета — насыщеннее и ярче. Я в полном восторге от того, что могу поделиться этим с вами, и надеюсь, что каждая минута работы с этой библиотекой вдохновит вас на новые свершения! Увидимся среди звезд, юный кодер! А теперь вперед — творить магию! ✨

## Ссылки и благодарности
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** — *просто чертовски незаменимо для позиционирования астрономических тел*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, который очень помог в создании этого нового потрясающего неба на основе LUT.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf) — эта работа оказалась невероятно полезной при разборе деталей реализации кода LUT и помогла понять, в правильном ли направлении я двигаюсь в плане внешнего вида этих таблиц.
* Библиотека [Colour-Science Library](https://www.colour-science.org/) для создания более качественных LUT цветов звезд.
* Великолепные текстуры синего шума от [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* Текстура солнечной короны от [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Суперполезная текстура каустики воды от [leeor_net](https://opengameart.org/content/water-caustics-effect-small), которая используется вовсе не для каустики... а для северного сияния!
* Работа Сэбастьена Иллэра *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), которая легла в основу структуры освещения облаков, дизайна ambient-LUT на базе SH9 и метода вычитания тумана по подходу Элека/Чалмерса.
* Работа Эндрю Шнайдера и Натана Воса *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), которая помогла в реализации двухлопастной фазовой функции Хенье-Гринштейна, подхода к шуму формы облаков и аппроксимации многократного рассеяния с пониженным затуханием.
* Работа Д. Хестроффера и К. Маньяна *Centre to limb darkening of the Sun with HIPPARCOS* (1998), благодаря которой были получены коэффициенты потемнения к краю диска Солнца в зависимости от длины волны для полос B, V и R, что позволило придать краю солнца физически корректный красноватый оттенок.
* Всей той потрясающей работе, которая была вложена в [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) и [Emscripten](https://emscripten.org/).
* *И многим-многим другим сайтам и людям. Спасибо за возможность стоять на ваших плечах-гигантах.*

## Лицензия
Этот проект распространяется под лицензией MIT — подробности см. в файле [LICENSE.md](LICENSE.md)