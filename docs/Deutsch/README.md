# A-Starry-Sky

A-Starry-Sky ist eine Himmelskuppel für das [A-Frame Web Framework](https://aframe.io/). Ziel ist es, eine einfache, sofort einsatzbereite Komponente bereitzustellen, mit der Sie wunderschöne Tag-Nacht-Zyklen in Ihren Projekten erstellen können.

> **Warnung: Erfordert eine leistungsstarke GPU – bitte nicht auf einem Mobiltelefon öffnen.**

**[Live-Demo](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — Der Himmel zum aktuellen Datum und zur aktuellen Uhrzeit in San Francisco.

| Beispiel | Beschreibung |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Wüstenszene zu einem festgelegten Zeitpunkt am Tag |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Totale Sonnenfinsternis mit Korona |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Erdschatten auf dem Mond |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Große Konjunktion von Jupiter & Saturn |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Benutzerdefinierte Mars-Atmosphäre |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Verschiedene Mie-/Rayleigh-Streuwerte |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Himmel aus 20 km Höhe |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ GPU-intensiv |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ GPU-intensiv |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ GPU-intensiv |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ GPU-intensiv |

## Voraussetzungen

Dies wurde für das [A-Frame Web Framework](https://aframe.io/) in der Version 1.7.0+ entwickelt. Zudem wird ein WebXR-kompatibler Webbrowser benötigt.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Installation

Kopieren Sie *a-starry-sky.v1.2.0.min.js* sowie die Ordner *assets* und *wasm* in Ihr Projekt. Fügen Sie die folgenden Skripte zu Ihrem HTML hinzu – beachten Sie, dass `starry-sky-web-worker.js` hier **nicht** enthalten ist; dieses wird stattdessen direkt im `<a-starry-sky>`-Tag referenziert.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PFAD_ZUM_JS_ORDNER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PFAD_ZUM_JS_ORDNER}/wasm/interpolation-engine.js"></script>
```

Sobald diese Referenzen eingerichtet sind, fügen Sie die Komponente `<a-starry-sky>` in Ihren `<a-scene>`-Tag von A-Frame ein und referenzieren Sie dabei die URL Ihres Sky-State Web Workers wie folgt:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PFAD_ZUM_JS_ORDNER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Dieser minimale Code erstellt einen Himmel, der sich in Echtzeit basierend auf dem Breitengrad und Längengrad von San Francisco, Kalifornien, bewegt. Wir können jedoch weit mehr erreichen: A-Starry-Sky bietet eine Vielzahl an benutzerdefinierten HTML-Tags, mit denen Sie den Zustand Ihres Himmels anpassen können.

**HINWEIS: Diese Skybox ist unveränderlich (immutable). Das bedeutet, dass die Start-Einstellungen auf jeder Seite konstant bleiben. Leider ist es derzeit schlichtweg zu komplex, den Code veränderbar zu gestalten.**

## Standort festlegen

**Tag** | **Beschreibung** | **Standardwert**
:--- | :--- | :---
`<sky-location>` (Standort) | Übergeordneter Tag; enthält die Child-Tags für Breitengrad und Längengrad. | N/A
`<sky-latitude>` (Breitengrad) | Legt den Breitengrad des Standorts fest. Nördlich des Äquators ist der Wert **positiv**. | 38
`<sky-longitude>` (Längengrad) | Legt den Längengrad des Standorts fest. Westlich des [Nullmeridians](https://en.wikipedia.org/wiki/Prime_meridian) ist der Wert **negativ**. | -122

Sie können Ihren Himmel auf jeden beliebigen Breitengrad und Längengrad auf der Erde einstellen. Standorte sind nützlich, um Ihren Spielern ein Gefühl für die Jahreszeiten zu vermitteln, indem die Bahnen von Sonne oder Mond verändert werden. Der Breitengrad bestimmt zudem, welche Sterne an Ihrem Nachthimmel sichtbar sind. Sowohl der Breitengrad als auch der Längengrad sind entscheidend für zeitabhängige Ereignisse wie Sonnen- und Mondfinsternisse. Dies gilt insbesondere für Sonnenfinsternisse, wenn Sie eine totale Sonnenfinsternis erleben möchten. Aber keine Sorge: Den Standort einzustellen ist weitaus einfacher, als sich zu entscheiden, wo man eigentlich sein möchte. Holen Sie sich einfach die gewünschten Koordinaten von [Google Earth](https://earth.google.com/web/) oder einer anderen Kartenquelle und tragen Sie die Werte in die entsprechenden Tags ein, wie hier gezeigt:

Ab nach New York!
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

Und was ist mit Perth in Australien?
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

Beachten Sie, dass Längengrade westlich des [Nullmeridians](https://en.wikipedia.org/wiki/Prime_meridian) negativ sind (z. B. New York, Buenos Aires).

## Zeit einstellen

**Tag** | **Beschreibung** | **Standardwert**
:--- | :--- | :---
`<sky-time>` | Elternelement. Enthält alle untergeordneten Tags, die sich auf Datums- oder Zeitelemente beziehen. | N/A
`<sky-date>` | Die lokale Datum-Zeit-Zeichenfolge im Format **JAHR-MONAT-TAG STUNDE:MINUTE:SEKUNDE**/*2021-03-21 13:45:51*. Die Stundenwerte basieren ebenfalls auf einem 0-23-Stunden-System. 0 entspricht Mitternacht (12 AM) und 23 entspricht 23 Uhr (11 PM). | Aktuelles Datum
`<sky-speed>` | Der Zeitmultiplikator, mit dem die astronomischen Berechnungen beschleunigt oder verlangsamt werden können. | 1.0
`<sky-utc-offset>` | Der UTC-Versatz (UTC-Offset) für diesen Standort. Negative Werte liegen westlich des [Nullmeridians](https://en.wikipedia.org/wiki/Prime_meridian), im Gegensatz zu Längengradwerten. **Beachten Sie, dass die UTC-Zeit keine Sommerzeit (DST) berücksichtigt.** | 7

Setzen Sie `<sky-date>` auf die **lokale Zeit** Ihres gewählten Standorts und passen Sie anschließend `<sky-utc-offset>` an die entsprechende Zeitzone an. New York City ist beispielsweise UTC-4 (Sommer) oder UTC-5 (Winter) – die Sommerzeit wird nicht automatisch angewendet.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Vorherige Standort-Einstellungen -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- So können Sie den UTC-Versatz einstellen! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Beachten Sie, dass Sie erneut das übergeordnete Tag `<sky-time>` hinzufügen, welches alle relevanten untergeordneten Tags für unsere Zeiteinstellungen enthält.

Aber warum sollten Sie sich eigentlich auf die lokale Systemzeit beschränken? Lassen Sie uns doch etwas Spannenderes ausprobieren – zum Beispiel eine Zeitreise! Ich habe gehört, dass es am [8. April 2024 um 13:27 Uhr in Del Rio, Texas](https://nationaleclipse.com/cities_total.html), eine spektakuläre [Sonnenfinsternis](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) geben wird. Schauen wir uns das mal an!

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

Haben Sie den [Weihnachtsstern](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn) verpasst? Nein, nein. Nicht diesen hier. Ich meine den aus dem Jahr 1226 n. Chr. Gut, dass wir eine Zeitmaschine haben und A-Starry-Sky jetzt auch Planeten unterstützt :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Zeitreisen machen Spaß, aber vielleicht möchten Sie auch die *Geschwindigkeit* der Zeit ändern. Tag-Nacht-Zyklen laufen in Spielwelten oft schneller ab als in der Realität, oder eventuell möchten Sie die Zeit komplett anhalten, um einen bestimmten Moment für Ihre Beleuchtung festzuhalten. Verwenden Sie dazu das Tag `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Es gibt nun acht In-Game-Tage für jeden echten Tag. -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Falls Sie dies in einer persistenten Welt umsetzen, achten Sie bei der Erstellung Ihres HTMLs unbedingt auf den beschleunigten Zeitfluss. Die Implementierung von dynamischem HTML für Ihren Himmel liegt jedoch ganz in Ihrer Hand.

## Atmosphärische Einstellungen anpassen

**Tag** | **Beschreibung** | **Standardwert**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Übergeordneter Tag. Enthält alle untergeordneten Tags für atmosphärische Einstellungen. | N/A
`<sky-camera-height>` | Die Höhe der Kamera über der Erde. | 0.0km
`<sky-mie-directional-g>` | Beschreibt, wie viel Licht durch Mie-Streuung vorwärts gestreut wird (der weißliche Halo um die Sonne, verursacht durch größere Partikel in der Atmosphäre). Je höher der Wert von `mie-directional G`, desto staubiger wirkt die Atmosphäre. | 0.8
`<sky-sun-intensity>` | Die Intensität der Sonne im atmosphärischen Shader. | 1367.0
`<sky-moon-intensity>` | Die Intensität des Mondes im atmosphärischen Shader. | 29.0
`<sky-mie-beta>` | Farbabhängigkeit der Lichtstreuung bei Mie-Streuung, primär verantwortlich für das „Glühen“ in Sonnennähe. Die Streuung ist über alle Frequenzen hinweg ziemlich gleichmäßig. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Farbabhängigkeit der Lichtstreuung bei Rayleigh-Streuung, primär verantwortlich für die blaue Streuung am Himmel. Beachten Sie, dass standardmäßig der Blaukanal die stärkste Streuung aufweist. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Farbabhängigkeit der Lichtstreuung der Ozonschicht, entscheidend für das tiefe Blau während des Sonnenuntergangs. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | Die Grenzhöhe, an der die Atmosphäre „endet“. | 80.0 km
`<sky-radius-of-earth>` | Der Radius des Planeten oder der Erde. | 6366.7 km
`<sky-rayleigh-scale-height>` | Die Skalierungshöhe für den Abfall (Falloff) der Rayleigh-Streuung, unter Annahme eines exponentiellen Abfalls. Rayleigh-Streuung entsteht durch atmosphärische Gase und hat daher eine wesentlich größere Skalierungshöhe. | 8.4
`<sky-mie-scale-height>` | Die Skalierungshöhe für den Abfall der Mie-Streuung, unter Annahme eines exponentiellen Abfalls. Mie-Streuung entsteht durch größere Partikel und fällt daher schneller ab, was zu einer geringeren charakteristischen Höhenskalierung führt. | 1.25
`<sky-ozone-percent-of-rayleigh>` | Der Prozentsatz an Ozon am Himmel, der zur Bestimmung des Ozon-Effekts beim Sonnenuntergang verwendet wird. | 6E-7
`<sky-moon-angular-diameter>` | Der scheinbare Durchmesser (Winkeldurchmesser) des Mondes am Himmel.  | 3.15 degrees
`<sky-sun-angular-diameter>` | Der scheinbare Durchmesser (Winkeldurchmesser) der Sonne am Himmel. | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | Die Anzahl der Schritte zum Rand des Himmels, die der Raytracer beim Sammeln von Licht für atmosphärische Look-Up Tables (LUTs) ausführt. | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | Die Anzahl der Winkelschritte an jedem Punkt entlang des Strahls für die Streuung k-ter Ordnung. | 30 steps
`<sky-number-of-scattering-orders>` | Die Anzahl der Streuungen höherer Ordnung (k-te Ordnung), die in die Inscattering-LUT berechnet (baked) werden. Höhere Werte steigern die Qualität auf Kosten der Berechnungszeit der LUT. | 4
`<sky-parameters-color-red>` | Die Rotkomponente, die in den Tags `<sky-rayleigh-beta>`, `<sky-mie-beta>` und `<sky-ozone-beta>` verwendet wird. | N/A
`<sky-parameters-color-green>` | Die Grünkomponente, die in den Tags `<sky-rayleigh-beta>`, `<sky-mie-beta>` und `<sky-ozone-beta>` verwendet wird. | N/A
`<sky-parameters-color-blue>` | Die Blaukomponente, die in den Tags `<sky-rayleigh-beta>`, `<sky-mie-beta>` und `<sky-ozone-beta>` verwendet wird. | N/A

Die atmosphärischen Parameter bieten eine der umfangreichsten APIs der gesamten Codebasis. Während erfahrene Entwickler diese Werte nutzen können, um individuelle Himmel zu kreieren, werden die meisten Nutzer bei den Standardwerten bleiben wollen. Einige Werte sind jedoch besonders nützlich und relativ leicht zu verstehen.

Eines der Elemente, die Sie am ehesten anpassen möchten, ist die Größe von Sonne und Mond. In der Realität hat die Sonne einen Winkeldurchmesser von 0,53 Grad und der Mond einen von 0,50 Grad. Die Verwendung dieser Werte im Simulator würde die Realität besser abbilden, allerdings wirken sie in den meisten Simulationen – insbesondere auf Nicht-VR-Geräten wie Monitoren – zu klein. Um diese Werte zu vergrößern oder zu verkleinern, ändern Sie einfach die entsprechenden Tags.

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

Möglicherweise möchten Sie auch Ihre Starthöhe über dem Planeten ändern. Dies kann einfach mit dem Tag `<sky-camera-height>` eingestellt werden, wobei sich der Himmel auch dynamisch an Ihre Höhe anpasst, wenn Sie die Kamera bewegen. Damit wird die Anfangshöhe der Szene in Kilometern festgelegt; die maximale Höhe liegt bei *80 km*, die minimale bei *0 km*.

[High Altitude Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Gehen wir mal etwas höher. Die Luft ist hier oben dünner. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Vielleicht möchten Sie auch die Zusammensetzung Ihrer Atmosphäre ändern. Dieses Element gibt Ihnen Zugriff auf verschiedene Mechanismen, um den Himmel nach Ihren Wünschen zu gestalten. Angenommen, Ihnen gefallen die Rayleigh-Werte aus [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) besser als unsere nativen Werte (5.8e-3, 1.35e-2, 3.31e-2) $\rightarrow$ (5.19E-3, 1.21E-2, 2.96E-2), und Sie möchten einen Beta-Wert von 4.44E-3 $\rightarrow$ 2E-3 verwenden – dann können Sie diese im Code einfach austauschen.

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

Das ist zwar ganz nett, aber wollen wir nicht etwas Verrückteres ausprobieren? Folgen wir der Arbeit von [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) und reisen wir zum Mars! Dort werden Rayleigh- und Mie-Streuung quasi vertauscht, also sollten wir vermutlich auch deren charakteristische Höhen anpassen. Der Großteil der Streuung auf dem Mars stammt von der Mie-Streuung großer Partikel in einer sehr dünnen Atmosphäre. Folglich können wir die Mie- (Rayleigh-) Streuung praktisch deaktivieren und ihre charakteristischen Höhen tauschen. Wir sollten zudem den Planetenradius ändern und eventuell die atmosphärische Höhe für bessere Ergebnisse im Raytracer anpassen.

[Mars Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Beachten Sie, dass der Mars rotes Licht stärker streut -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Ein paar Anpassungen an der Mie-Streuung helfen ebenfalls -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Stellen Sie sicher, dass Ozon deaktiviert ist -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Nun ja, in unserem Fall eben der Mars... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- Die Sonne ist kleiner und den Mond können wir komplett weglassen -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Sie können zudem die Anzahl der LUT-Ray-Schritte optimieren, obwohl die Standardwerte bereits nahezu optimal sind und Änderungen selten spürbar sind.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Niedriger für bessere Performance, höher für mehr Genauigkeit (der Standardwert 30 ist in den meisten Fällen optimal) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Beleuchtungseinstellungen anpassen

**Tag** | **Beschreibung** | **Standardwert**
:--- | :--- | :---
`<sky-lighting>` (Himmelsbeleuchtung) | Übergeordneter Tag. Enthält alle untergeordneten Tags zur Beleuchtung der Szene. | N/A
`<sky-sun-intensity>` (Sonnenintensität) | Intensitätsmultiplikator für das Sonnenlicht; kann verwendet werden, um die Intensität der solaren Richtungsbeleuchtung zu erhöhen oder zu verringern. | 1.0
`<sky-moon-intensity>` (Mondintensität) | Intensitätsmultiplikator für das Mondlicht; kann verwendet werden, um die Intensität der lunaren Richtungsbeleuchtung zu erhöhen oder zu verringern. | 1.0
`<sky-ambient-intensity>` (Umgebungsintensität) | Intensitätsmultiplikator für das Umgebungslicht (Ambient Lighting); kann verwendet werden, um die Intensität des Ambient-Lighting-Systems zu erhöhen oder zu verringern. | 2.0
`<sky-minimum-ambient-lighting>` (Minimale Umgebungsbeleuchtung) | Die minimale Menge an Umgebungslicht im System. | 0.01
`<sky-maximum-ambient-lighting>` (Maximale Umgebungsbeleuchtung) | Die maximale Menge an Umgebungslicht im System. | INF
`<sky-atmospheric-perspective-type>` (Typ der atmosphärischen Perspektive) | Kann auf *normal*, *advanced* oder *none* gesetzt werden. Erforderlich für Szenennebel. *normal* verwendet das ursprüngliche exponentielle Nebelmodell; *advanced* nutzt ein Preetham-basiertes Modell für eine verbesserte Variation der Horizontfarben auf Kosten einer höheren GPU-Auslastung. | normal
`<sky-atmospheric-perspective-density>` (Dichte der atmosphärischen Perspektive) | Nur für *normal*-Nebel. Steuert den Dichteparameter für exponentiellen Szenennebel. Die Farbe wird automatisch aus der Szenenbeleuchtung übernommen. Wird ignoriert, wenn der Nebeltyp auf *advanced* steht. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (Distanzmultiplikator der atmosphärischen Perspektive) | Nur für *advanced*-Nebel. Multipliziert die Distanz zum Nebel für das advanced-Nebelmodell. | 2.0
`<sky-ground-color>` (Bodenfarbe) | Übergeordneter Tag. Enthält `<sky-ground-color-{farbkanal}>`-Tags zur Beschreibung der Grundfarbe des Bodens für reflektierende Beleuchtung von der Oberfläche. | N/A
`<sky-ground-color-red>` (Bodenfarbe Rot) | Wird verwendet, um Änderungen am **roten** Farbkanal in den `<sky-ground-color>`-Tags zu beschreiben. | 66
`<sky-ground-color-green>` (Bodenfarbe Grün) | Wird verwendet, um Änderungen am **grünen** Farbkanal in den `<sky-ground-color>`-Tags zu beschreiben. | 44
`<sky-ground-color-blue>` (Bodenfarbe Blau) | Wird verwendet, um Änderungen am **blauen** Farbkanal in den `<sky-ground-color>`-Tags zu beschreiben. | 2
`<sky-shadow-camera-resolution>` (Schattenkamera-Auflösung) | Die Auflösung (in Pixeln) der Kamera für die direkte Beleuchtung, die zur Erzeugung von Schatten verwendet wird. Höhere Werte führen zu qualitativ hochwertigeren Schatten bei steigendem Rechenaufwand. | 2048
`<sky-shadow-camera-size>` (Schattenkamera-Größe) | Die Größe des Kamerabereichs, der für das Werfen von Schatten genutzt wird. Größere Bereiche bedeuten eine weitere Abdeckung durch Schatten, führen aber auch zu Aliasing-Problemen, da jeder Pixel der Kamera über einen größeren Bereich verteilt wird. | 32.0
`<sky-sun-bloom>` (Sonnen-Bloom) | Übergeordneter Tag; enthält alle Eigenschaften des Sun-Bloom-Render-Passes. | N/A
`<sky-moon-bloom>` (Mond-Bloom) | Übergeordneter Tag; enthält alle Eigenschaften des Moon-Bloom-Render-Passes. | N/A
`<sky-bloom-enabled>` (Bloom aktiviert) | Aktiviert (true) oder deaktiviert (false) den Bloom-Effekt für dieses astronomische Objekt. | true
`<sky-bloom-exposure>` (Bloom-Belichtung) | Ändert den Belichtungsparameter (Exposure) des Bloom-Filters – der Faktor, um den das an die Kamera zurückgegebene Licht multipliziert wird. | 1.0
`<sky-bloom-threshold>` (Bloom-Schwellenwert) | Ändert den Schwellenwertparameter (Threshold) des Bloom-Filters – die minimale Intensität, ab der Bloom aktiviert wird. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (Bloom-Stärke) | Ändert den Stärkeparameter (Strength) des Bloom-Filters – wie stark ausgewählte Pixel „blühen“ (bloomen). | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (Bloom-Radius) | Ändert den Radiusparameter des Bloom-Filters – die Distanz, über die sich der Bloom-Filter ausbreitet. | {sun: 1.0, moon: 1.4}

Die Sky-Lighting-Tags sind nützlich, um Attribute der direkten und indirekten Beleuchtung in der Szene zu steuern. In Version 1.0.0 wurde die Anzahl der Richtungslichter (Directional Lights) von zwei (Sonne und Mond) auf eins reduziert (nur noch eine für die dominanteste Lichtquelle). Das Richtungslicht ist immer auf die Kamera des Benutzers ausgerichtet und erzeugt Schatten um diese Kamera herum. Obwohl das Richtungslicht verschiedene Schattenarten unterstützen kann, ist diese Bibliothek nicht der richtige Ort, um dies zu steuern. Stattdessen wird der Schattentyp im `<a-scene>`-Tag festgelegt, wie [hier](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows) beschrieben. Sie können die Werte auf eine der folgenden Optionen setzen:

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

Leider unterstützt A-Frame zum Zeitpunkt des Schreibens noch keine Variance Shadow Maps, obwohl es hierzu ein offenes Issue gibt. Zudem ist der gewählte Schattentyp für die Sonnen- und Mondbeleuchtung gleichzeitig der Schattentyp für alle anderen Lichter in Ihrer Szene; berücksichtigen Sie dies bei der Auswahl Ihrer Schatten.

Sie können die Schattenqualität zudem über die Größe und Auflösung der Schattenkamera steuern. Eine Erhöhung der Größe deckt mehr von der Szene ab; eine höhere Auflösung schärft das Ergebnis – beides geht jedoch zu Lasten der GPU, daher sollten Sie diese Werte entsprechend Ihren Bedürfnissen ausbalancieren. Es empfiehlt sich außerdem, Schatten für große Umgebungsobjekte (Environment Meshes) zu deaktivieren, da diese oft außerhalb des Frustums liegen und unschöne quadratische Schattenkanten erzeugen.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Größe erhöhen, um Schatten weiter von der Kamera entfernt zu werfen -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Auflösung erhöhen, um Schatten bei größeren Größen scharf zu halten -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Wenn die Schatten in Ihrer Szene optimal eingestellt sind, möchten Sie wahrscheinlich auch die Farbe Ihres „Bodens“ anpassen. A-Starry-Sky unterstützt nun ein dreifaches hemisphärisches Beleuchtungssetup, das eine Faltung (Convolution) über die Farben des Himmels in Kombination mit einem Bodenlicht-Streumodell auf einem separaten CPU-Thread via Web Worker nutzt. Standardmäßig ist die Bodenfarbe jedoch braun. Vielleicht haben Sie aber eine grasbewachsene Fläche oder einen azurblauen Ozean. Um die Farbe Ihres Bodens festzulegen, können Sie den `<sky-ground-color>`-Tag zusammen mit den untergeordneten Tags für die Farbkanäle verwenden. Nehmen wir an, wir möchten den Boden in einem strahlenden Grün für eine üppige Grasfläche gestalten:

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

Beachten Sie, dass die obigen Werte zwischen 0 und 255 normiert sind. Die RGB-Kombination 0, 0, 0 entspricht also Schwarz und 255, 255, 255 Weiß. Die oben genannte Farbe könnte etwas zu hell sein, wodurch der Boden selbst bei geringstem Licht zu „glühen“ scheint. Um diesen Effekt abzuschwächen, können Sie die Farbe einfach etwas abdunkeln:

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

Falls einer Ihrer Farbkanäle den Wert 255 überschreitet, gibt es derzeit leider keine Möglichkeit, die „Farbe zu verstärken“ oder den Boden so erscheinen zu lassen, als würde er „im Dunkeln leuchten“. Zudem ist die Bodenfarbe an allen Punkten konstant. Wenn Sie mehrere Farben in Ihrer Szene haben, ist es daher am besten, eine Farbe zu wählen, die einen Mittelwert aller anderen Farben darstellt.

Zusätzlich zur Bodenbeleuchtung können Sie nun die Intensitäten der direkten und der Umgebungsbeleuchtung direkt steuern. Die Änderung der Sonnen- oder Mondintensität ist einfach: Verwenden Sie lediglich ein Vielfaches des Standardwerts, um festzulegen, wie viel heller oder dunkler dieser Himmelskörper sein soll. Mit derselben Methode können Sie die Ambient-Intensität verstärken oder verringern, um die Menge des Umgebungslichts in der Szene anzupassen:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Machen wir die Sonne doppelt so hell -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- Aber machen wir den Mond nur halb so hell -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- Und nehmen wir das Zehnfache an Umgebungslicht -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Möglicherweise möchten Sie auch Unter- oder Obergrenzen für das Umgebungslicht festlegen, um sicherzustellen, dass immer eine bestimmte Mindestmenge an Licht vorhanden ist bzw. ein Maximum nicht überschritten wird:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Machen wir es insgesamt heller -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Aber nicht zu extrem. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Gegebenenfalls möchten Sie die Parameter für die Bloom-Effekte der Sonne oder des Mondes am Himmel ändern. *a-starry-sky* verwendet den [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) von THREE.JS. Die Intensität für alle astronomischen Objekte wird separat über die übergeordneten Tags `<sky-sun-bloom>` bzw. `<sky-moon-bloom>` gesteuert. Die untergeordneten Tags steuern die Funktionen des Bloom-Effekts.

Beginnen wir mit der Änderung einiger Parameter:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Dimmen wir die Sonne ein wenig ab -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Aber erhöhen wir die Intensität des Mondes -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Wir können den Bloom-Effekt jedoch auch vollständig deaktivieren, was die GPU-Last geringfügig reduziert:

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

Das letzte Element der Himmelsbeleuchtung, das Sie wahrscheinlich anpassen möchten, ist die Dichte der atmosphärischen Perspektive. *a-starry-sky* bietet je nach Bedarf zwei verschiedene Nebelmodelle an. Für schwächere Systeme wird die einfache exponentielle atmosphärische Perspektive unterstützt, welche das Licht über den gesamten Himmel in einem Web Worker sammelt und dann wie ein normaler exponentieller Nebel anwendet. Um den Dichteparameter der exponentiellen Beleuchtung zu steuern, verwenden Sie den Tag `<sky-atmospheric-perspective-density>`. Die Standardwerte sind hoch angesetzt, um selbst in kleinen Szenen eine spürbare atmosphärische Perspektive zu gewährleisten; eventuell möchten Sie den Wert daher vom Standard von *0.007* reduzieren. Stellen Sie zudem sicher, dass der aktuelle Perspektivtyp im Tag `<sky-atmospheric-perspective-type>` auf *normal* gesetzt ist:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Obwohl der Standardwert 0,007 ist, reagiert die Dichte der atmosphärischen Perspektive sehr
      empfindlich auf Änderungen; daher sind nur kleine Anpassungen nötig. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Für leistungsstärkere Systeme können Sie hingegen einen Preetham-basierten atmosphärischen Shader simulieren, der den Horizontfarben mehr Varianz verleiht, anstatt die konstanten Farben der *normal*-Einstellung zu verwenden. Die bereitgestellte Lösung ist aufgrund von Einschränkungen im Nebel-Shader von *Three.js* keine exakte Entsprechung zur für den Himmel verwendeten Elek-basierten Beleuchtung, bietet aber eine deutliche Verbesserung gegenüber der ursprünglichen atmosphärischen Perspektive. Um das fortschrittliche Beleuchtungsmodell zu aktivieren, tragen Sie einfach den Wert *advanced* in den Tag `<sky-atmospheric-perspective-type>` ein. Ähnlich wie bei `<sky-atmospheric-perspective-density>` können Sie die Distanz für das *advanced*-Beleuchtungsmodell über den Tag `<sky-atmospheric-perspective-distance-multiplier>` multiplizieren, welcher alle Distanzen im Preetham-basierten Modell mit dem angegebenen Wert multipliziert. Die Standardwerte sind hoch angesetzt, um selbst in kleinen Szenen eine spürbare atmosphärische Perspektive zu gewährleisten; eventuell möchten Sie den Wert daher vom Standard von *5.0* reduzieren.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Obwohl der Standardwert 2,0 ist, können wir den Distanzmultiplikator im
      advanced-Modell auf 1,0 reduzieren, wenn wir einen weniger dramatischen Effekt wünschen. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Schließlich können Sie die gesamte atmosphärische Perspektive deaktivieren, indem Sie den Wert im Tag `<sky-atmospheric-perspective-type>` auf *none* setzen:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Atmosphärische Perspektive ausschalten -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Aurora Borealis aktivieren

*WARNUNG: Die Aktivierung der Aurora Borealis erhöht den Rechenaufwand für Ihren Himmel erheblich, da der bereitgestellte Aurora-Shader ein Raymarching-Verfahren nutzt, um dieses wunderschöne Naturphänomen zu erzeugen.*

**Tag** | **Beschreibung** | **Standardwert**
:--- | :--- | :---
`<sky-aurora>` (Übergeordneter Tag) | Übergeordneter Tag. Erforderlich zur Aktivierung der Aurora Borealis. Enthält alle untergeordneten Tags, die sich auf die Aurora beziehen. | N/A
`<sky-atomic-oxygen-color>` (Farbe atomarer Sauerstoff) | Wird durch angeregte atomare Sauerstoffmoleküle ausgelöst, die sich in einer Höhe von 150 bis 600 Kilometern über der Planetenoberfläche befinden. Atomarer Sauerstoff verursacht typischerweise einen hellroten Vorhang am oberen Ende der Aurora Borealis und ist meist bei extremen Erscheinungen zu sehen. Dieser Tag steuert die Farben über drei untergeordnete Farbtags: *sky-aurora-color-red*, *sky-aurora-color-green* und *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (Cutoff atomarer Sauerstoff) | Bestimmt, wie viel der Aurora aus atomarem Sauerstoff voraussichtlich in der Darstellung erscheint. Niedrigere Werte bedeuten mehr Aurora; ein Maximalwert von 1,0 bedeutet, dass keine Aurora sichtbar ist. | 0.12
`<sky-atomic-oxygen-intensity>` (Intensität atomarer Sauerstoff) | Bestimmt die Helligkeit dieses Aurora-Segments; typische Werte liegen unter 5. | 0.3
`<sky-molecular-oxygen-color>` (Farbe molekularer Sauerstoff) | Wird durch angeregte molekulare Sauerstoffmoleküle ausgelöst, die sich in einer Höhe von 100 bis 250 Kilometern über der Planetenoberfläche befinden. Molekularer Sauerstoff liefert typischerweise das ikonische helle Grün der Aurora Borealis und ist bei den meisten Erscheinungen sichtbar. Dieser Tag steuert die Farben über drei untergeordnete Farbtags (*sky-aurora-color-red*, *sky-aurora-color-green* und *sky-aurora-color-blue*), falls Sie eine andere Farbe für Ihre Aurora wünschen. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (Cutoff molekularer Sauerstoff) | Bestimmt, wie viel der Aurora aus molekularem Sauerstoff voraussichtlich in der Darstellung erscheint. Niedrigere Werte bedeuten mehr Aurora; ein Maximalwert von 1,0 bedeutet, dass keine Aurora sichtbar ist. | 0.02
`<sky-molecular-oxygen-intensity>` (Intensität molekularer Sauerstoff) | Bestimmt die Helligkeit dieses Aurora-Segments; typische Werte liegen unter 5. | 2.0
`<sky-nitrogen-color>` (Farbe Stickstoff) | Wird durch angeregte Stickstoffmoleküle ausgelöst, die sich in einer Höhe von 60 bis 120 Kilometern über der Planetenoberfläche befinden. Stickstoff erzeugt typischerweise einen magentafarbenen Vorhang an der Basis der Aurora Borealis und ist meist bei extremen Erscheinungen zu sehen. Dieser Tag steuert die Farben über drei untergeordnete Farbtags: *sky-aurora-color-red*, *sky-aurora-color-green* und *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (Cutoff Stickstoff) | Bestimmt, wie viel der Stickstoff-Aurora voraussichtlich in der Darstellung erscheint. Niedrigere Werte bedeuten mehr Aurora; ein Maximalwert von 1,0 bedeutet, dass keine Aurora sichtbar ist. | 0.12
`<sky-nitrogen-intensity>` (Intensität Stickstoff) | Bestimmt die Helligkeit dieses Aurora-Segments; typische Werte liegen unter 5. | 4.0
`<sky-aurora-raymarch-steps>` (Raymarching-Schritte) | Anzahl der Schritte, die der Raymarcher pro Pixel ausführt. | 32 (Schritte)
`<sky-aurora-cutoff-distance>` (Cutoff-Distanz) | Die Distanz, ab der die Aurora nicht mehr gerendert wird. Dies verbessert die Qualität des Raymarching auf Kosten von weit entfernten Auroras, da SDFs derzeit nicht für unsere Rauschgeneratoren berechnet werden. | 1000 (Kilometer - ca.)
`<sky-aurora-color-red>` (Rotkanal) | Wird verwendet, um Änderungen am **roten** Farbkanal der Tags `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` und `<sky-atomic-oxygen-color>` zu definieren. | N/A
`<sky-aurora-color-green>` (Grünkanal) | Wird verwendet, um Änderungen am **grünen** Farbkanal der Tags `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` und `<sky-atomic-oxygen-color>` zu definieren. | N/A
`<sky-aurora-color-blue>` (Blaukanal) | Wird verwendet, um Änderungen am **blauen** Farbkanal der Tags `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` und `<sky-atomic-oxygen-color>` zu definieren. | N/A

Die Aurora Borealis gehört zu den spektakulärsten Naturschauspielen unseres Himmels. Diese Phänomene treten typischerweise in der Nähe der Nord- und Südpole auf und entstehen durch die Wechselwirkung hochenergetischer Teilchen der Sonne, die in die Magnetosphäre der Erde gezogen werden und mit verschiedenen Atomen und Molekülen interagieren. Diese angeregten Moleküle strahlen Licht im sichtbaren Spektrum aus, was zu hypnotisierenden Lichtvorhängen führt, die förmlich über den Nachthimmel „tanzen“.

Die Aurora Borealis in Ihren Himmel einzufügen ist relativ einfach, allerdings ist sie standardmäßig nicht aktiviert. *Sie müssen den Tag `<sky-aurora>` hinzufügen, um die Aurora Borealis zu aktivieren.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- Für das Standard-Setup sind keine zusätzlichen Parameter erforderlich -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Jede der verschiedenen atomaren und molekularen Auroras kann über den obigen Code gesteuert werden. So können Sie Ihre Aurora-Darstellungen anpassen und sogar die emittierten Farben ändern (ob realistisch oder nicht). Wenn Sie beispielsweise eine kalt-blaue Aurora wünschen, die den gesamten Bereich des molekularen Sauerstoffs abdeckt, können Sie dies mit folgendem Code erreichen:

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

Wenn Sie hingegen nur eine leichte Menge an grüner Aurora wünschen, können Sie mit folgendem Code einen dezenteren Effekt erzielen:

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

Zusätzlich zu den Farben des Himmels können Sie auch die Anzahl der Schritte ändern, die der Raymarcher beim Rendern des Himmels ausführt. Je mehr Schritte ausgeführt werden, desto besser sieht der Himmel aus, aber desto höher ist die Belastung für Ihre GPU. Daher ist ein Gleichgewicht zwischen Performance und Qualität erforderlich. Standardmäßig verwendet der Shader 32 Schritte beim Raymarching des Volumens. Um dies zu erhöhen, können Sie Folgendes tun:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Wolken aktivieren

*WARNUNG: Das Aktivieren von Wolken erhöht die Rechenlast Ihres Himmels drastisch, da der bereitgestellte Cloud-Shader eine Raymarching-Methode verwendet, um dieses wunderschöne Naturphänomen zu erzeugen.*

**Tag** | **Beschreibung** | **Standardwert**
:--- | :--- | :---
`<sky-clouds>` (Haupt-Tag) | Eltern-Tag. Enthält alle untergeordneten Tags im Zusammenhang mit Wolken. Erforderlich, um Wolken zu aktivieren. | N/A
`<sky-cloud-coverage>` (Wolkenbedeckung) | Korreliert in etwa mit dem Anteil des Himmels, der von Wolken bedeckt ist. | 70 (Prozent)
`<sky-cloud-start-height>` (Start-Höhe) | Die Höhe in Metern, ab der sich Wolken zu bilden beginnen. | 1000 (Meter)
`<sky-cloud-end-height>` (End-Höhe) | Die Höhe in Metern, bis zu der sich Wolken bilden. | 2500 (Meter)
`<sky-cloud-fade-out-start-percent>` (Beginn des Ausblendens) | Die Wolkenbedeckung beginnt bei diesem *Prozentwert* der Wolkenhöhe gegen Null auszublenden (*fade out*). | 90 (Prozent)
`<sky-cloud-fade-in-end-percent>` (Ende des Einblendens) | Die Wolkenbedeckung beginnt bei diesem *Prozentwert* der Wolkenhöhe auf 100 % einzublenden (*fade in*). | 10 (Prozent)
`<sky-cloud-velocity-x>` (Geschwindigkeit X) | Die x-Komponente der Geschwindigkeit der Wolken. Wolken bewegen sich mit Ihrer Position mit, aber dieser Wert lässt sie eigenständig über den Kopf ziehen. | 40
`<sky-cloud-velocity-y>` (Geschwindigkeit Y) | Die y-Komponente (tatsächlich z) der Geschwindigkeit der Wolken. Wolken bewegen sich mit Ihrer Position mit, aber dieser Wert lässt sie eigenständig über den Kopf ziehen. | 40
`<sky-cloud-start-seed>` (Start-Seed) | Zufallswert (Seed), der das aktuelle Wolkenrauschen am Himmel festlegt. Wenn nicht gesetzt, wird standardmäßig eine Variation des aktuellen Zeitstempels verwendet. | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (Raymarching-Schritte) | Die Anzahl der Raymarching-Schritte, die zur Berechnung der Wolkenfarbe verwendet werden. | 32 (Schritte)
`<sky-cloud-cutoff-distance>` (Cutoff-Distanz) | Die Distanz, nach der keine Wolken mehr gerendert werden. Dies verbessert die Qualität des Raymarchings auf Kosten von Wolken in der Ferne, da SDFs derzeit nicht für unsere Noise-Generatoren berechnet werden. | 40000

Wolken sind rechenintensiv. Selbst auf einer leistungsstarken Desktop-GPU außerhalb von VR ist der Cloud-Shader anspruchsvoll – reduzieren Sie `<sky-cloud-raymarch-steps>` und `<sky-cloud-cutoff-distance>`, falls es zu Einbrüchen der Bildrate kommt.

Gleichzeitig sind Wolken einfach wahnsinnig cool, und ich wollte sie unbedingt in A-Starry-Sky integrieren, seit ich die Library erstellt habe. Jede Wolke wird pro Pixel per Raymarching berechnet, und ironischerweise ist es in diesem Stadium so: Je mehr Wolken Sie haben, desto geringer ist die Last für die GPU. Wenn Sie gar keine Wolken benötigen, ist es natürlich am besten, sie komplett zu deaktivieren.

Um Wolken zu aktivieren, müssen Sie den Eltern-Tag `<sky-clouds>` zu `<a-starry-sky>` hinzufügen. Sobald Sie die Wolken aktiviert haben, werden Sie wahrscheinlich als Erstes die Wolkenbedeckung über den Tag `<sky-cloud-coverage>` anpassen wollen, welcher in etwa bestimmt, wie viel des Himmels bedeckt ist. Eventuell möchten Sie auch ihre Geschwindigkeit steuern, während sie über den Himmel ziehen.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Reduziert die Menge der sichtbaren Wolken -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Geschwindigkeit der Wolken in x-Richtung -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Geschwindigkeit der Wolken in y-Richtung -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Sie können zudem einige der sichtbaren Eigenschaften steuern, wie etwa die Höhe, ab der sich Wolken bilden oder wie hoch sie aufragen. Beachten Sie, dass Ihr Strahl (Ray) diese Distanz durchlaufen muss; je höher die Wolken steigen oder je weiter sie von Ihnen entfernt sind, desto geringer ist die Dichte in Ihrem Raytracing-Modell. Wolken werden zudem auf der Oberfläche von Mond-/Sonnenelementen und dem Himmelsdom gezeichnet, sind aber nicht Teil des Fog-Renderers. Leider bedeutet das, dass es keine wolkenverhüllten Berge oder Nebelwolken geben wird...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Die Wolken hängen wirklich, wirklich, wirklich tief -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Aber sie ragen super hoch auf! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- Die Intensität der Wolken 'blendet ein' und geht bis zu diesem Prozentwert der Gesamthöhe von 0 auf 1. -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- Die Intensität der Wolken 'blendet aus', beginnend bei dieser Höhe. Je höher dieser Wert, desto wahrscheinlicher entstehen 'Amboss-Wolken'. -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Fixiert den Start-'Seed' der Wolken, der normalerweise auf dem aktuellen Datum basiert. Dies sorgt dafür, dass Ihr Himmel bei jedem Start gleich aussieht (für mehr künstlerische Kontrolle). -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Abgesehen davon steuert der Großteil des Codes dieses Tags die Raymarching-Mechanismen, welche leider recht strikt sind und denselben allgemeinen Zweck erfüllen wie im Shader für das Nordlicht (Aurora Borealis).

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Was für eine furchteinflößende GPU haben Sie eigentlich?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Oh, ja, ich auch... obwohl es jetzt ein bisschen ruckelt... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Die Reduzierung dieser Distanz wird zumindest ein wenig helfen -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Festlegen der Asset-Verzeichnisse

**Tag** | **Beschreibung**
:--- | :---
`<sky-assets-dir>` | Übergeordneter Tag. Enthält alle untergeordneten Tags für Asset-Positionen. Kann Attribute wie *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path* und *aurora-map-path* enthalten, um ganze Datengruppen gleichzeitig zu steuern.
`<sky-aurora-maps>` | Definiert den Speicherort der Aurora-Caustic-Texturen, die für die Erstellung der grundlegenden Polarlichter (Aurora Borealis) verwendet werden.
`<sky-moon-diffuse-map>` | Definiert den Pfad zur Diffuse-Map des Mondes. Die Platzierung in einer bestimmten Verzeichnisstruktur teilt dem System mit, dass sich die Diffuse-Map an diesem Ort befindet.
`<sky-moon-normal-map>` | Definiert den Pfad zur Normal-Map des Mondes. Die Platzierung in einer bestimmten Verzeichnisstruktur teilt dem System mit, dass sich die Normal-Map an diesem Ort befindet.
`<sky-moon-roughness-map>` | Definiert den Pfad zur Roughness-Map des Mondes. Die Platzierung in einer bestimmten Verzeichnisstruktur teilt dem System mit, dass sich die Roughness-Map an diesem Ort befindet.
`<sky-moon-aperture-size-map>` | Definiert den Pfad zur Aperture-Size-Map des Mondes. Die Platzierung in einer bestimmten Verzeichnisstruktur teilt dem System mit, dass sich die Aperture-Size-Map an diesem Ort befindet.
`<sky-moon-aperture-orientation-map>` | Definiert den Pfad zur Aperture-Orientation-Map des Mondes. Die Platzierung in einer bestimmten Verzeichnisstruktur teilt dem System mit, dass sich die Aperture-Orientation-Map an diesem Ort befindet.
`<sky-blue-noise-maps>` | Definiert den Speicherort der kachelbaren Blue-Noise-Maps, die für temporales Dithering verwendet werden, um Banding-Effekte zu vermeiden.
`<sky-solar-eclipse-map>` | Definiert den Speicherort der Sonnenfinsternis-Textur, die zur Darstellung der Korona während einer totalen Sonnenfinsternis dient.
`<sky-eclipse-shadow-lut>` | Definiert den Speicherort der Eclipse-Shadow-Lookup-Textur für Mondfinsternisse. Dies ist eine vorberechnete Tabelle, die beschreibt, wie die Erdatmosphäre das Sonnenlicht, das den Mond erreicht, je nach Position im Kernschatten (Umbra) und Halbschatten (Penumbra) färbt und dimmt. Die mitgelieferte Textur basiert auf der CC0-lizenzierten Datei `earthShadow.tif` von CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). Die Standard-Lookup-Datei liegt unter `assets/lunar_eclipse/eclipse-shadow-lut.webp`; der Baker zur Neuerstellung befindet sich in `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Definiert den Speicherort aller Sky-Cubemap-LUT-Keys, die zum Auffinden der Sterne am Himmel verwendet werden.
`<sky-dim-star-maps>` | Definiert den Speicherort aller LUTs für schwache Sterne.
`<sky-med-star-maps>` | Definiert den Speicherort aller LUTs für mittelstarke Sterne.
`<sky-bright-star-maps>` | Definiert den Speicherort aller LUTs für helle Sterne.
`<sky-star-color-map>` | Definiert den Speicherort der Sternfarben-LUT, die zur korrekten Einfärbung der Sterne basierend auf ihrer Temperatur verwendet wird.

Auch wenn ich hoffe, dass die meisten Nutzer dies kaum benötigen werden, hat die Erfahrung gezeigt, dass Webanwendungen oft ihre ganz eigenen Vorstellungen von Asset-Pipelines haben. Bild-Assets und JavaScript-Assets einer Website befinden sich möglicherweise nicht in derselben Ordnerstruktur oder sind über verschiedene URIs auf der Seite verteilt. Aus diesem Grund habe ich ein recht robustes Asset-System implementiert, das dabei hilft, diese verstreuten Ressourcen wieder zusammenzuführen, damit A-Starry-Sky weiß, wo die benötigten Daten zu finden sind.

Beginnen wir damit, zu *../../precompiled_assets/my_images/a-starry-sky-images* zu navigieren – dort speichern wir in unserem fiktiven Beispiel alle Bilder. Wir verwenden das Attribut *dir* im Tag `<sky-assets-dir>`, um uns wie folgt durch die Ordner zu bewegen.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Dies ist der Ordner, in dem alle unsere Bilder liegen -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Sobald wir uns im richtigen Ordner befinden, gibt es mehrere Möglichkeiten, die Position der Bilder anzugeben. Der einfachste Weg ist die Verwendung von Attributen für unsere wichtigsten Bildgruppen: *texture-path*, *moon-path* und *star-path*. Unabhängig von den Ordnernamen, die diesen Pfaden zugeordnet sind, wird davon ausgegangen, dass sich die Dateien dort unter ihren Standardnamen befinden. Eine Ausnahme bildet die Sonnenfinsternis-Map; da es hierfür nur ein einziges Bild gibt, geben wir den Speicherort an, indem wir den Tag einfach direkt in das Asset-Verzeichnis setzen.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Beachten Sie, dass 'moon_images', 'star_images', 'blue_noise_maps' und 'solar_eclipse_picture'
        allesamt Ordnernamen sind. Die Dateien selbst werden innerhalb dieser Ordner erwartet.-->
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

Wie Sie sehen können, könnten wir für eine präzisere Steuerung auch Links zu jeder einzelnen Bildgruppe angeben, was jedoch nicht empfohlen wird.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Jemand mag anscheinend Ordner über alles X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- Auch wenn dies Einzel-Tags sind, wird erwartet, dass alle mit diesem Tag 
          verknüpften Dateien in diesem Ordner liegen -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- Auch wenn dies ein Einzel-Tag ist, wird erwartet, dass alle mit diesem Tag 
          verknüpften Dateien in diesem Ordner liegen -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- Auch wenn dies ein Einzel-Tag ist, wird erwartet, dass alle mit diesem Tag 
          verknüpften Dateien in diesem Ordner liegen -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Mit den oben beschriebenen Methoden können Sie A-Starry-Sky zu Ihren Assets führen, ganz gleich, wo diese in Ihrer Anwendung gespeichert sind.

## PROGRAMMATISCHE API

Obwohl A-Starry-Sky primär über den oben beschriebenen XML-ähnlichen Code konfiguriert werden soll und im Allgemeinen unveränderlich (immutable) ist, gibt es eine Reihe von Methoden, auf die Sie über den globalen `StarrySky.Methods`-Namespace zugreifen können. Diese sind nützlich für Situationen, in denen Sie die Lichtverhältnisse oder die Position von Sonne oder Mond in der Szene ermitteln müssen.

**Methode** | **Beschreibung**
:--- | :---
`getSunPosition()` | Gibt die x-, y- und z-Position der Sonne als `THREE.Vector3`-Objekt zurück.
`getMoonPosition()` | Gibt die x-, y- und z-Position des Mondes als `THREE.Vector3`-Objekt zurück.
`getSunRadius()` | Gibt den Winkelradius der Sonne in Radiant zurück.
`getMoonRadius()` | Gibt den Winkelradius des Mondes in Radiant zurück.
`getDominantLightColor()` | Ruft die Farbe der aktuellen dominanten Lichtquelle (Sonne/Mond) als `THREE.Color`-Objekt ab.
`getDominantLightIntensity()` | Gibt die Lichtintensität der aktuellen dominanten Lichtquelle (Sonne/Mond) als Float zurück.
`getIsDominantLightSun()` | Gibt `true` zurück, wenn die dominante Lichtquelle die Sonne ist, andernfalls `false`.
`getAmbientLights()` | Gibt ein Objekt mit den Eigenschaften x, y und z zurück, die jeweils ein mit der Szene verknüpftes Hemisphären-Lichtobjekt für die Umgebungslichtfarben enthalten.
`getActiveCamera()` | Ruft die aktuell aktive Kamera ab, die zur Steuerung des Himmels sowie zur Zentrierung der Beleuchtung und der Himmelsobjekte verwendet wird.
`setActiveCamera(THREE.Camera camera)` | Legt die aktuelle Kamera fest, die zur Steuerung des Himmels sowie zur Zentrierung der Beleuchtung und der Himmelsobjekte verwendet wird.

Alle oben genannten Funktionen werden über das `StarrySky.Methods`-Objekt im globalen Namespace aufgerufen. Wenn Sie beispielsweise die aktuelle Position der Sonne abrufen und in der Konsole ausgeben möchten, müssen Sie lediglich Folgendes tun:

```JavaScript
  // Lassen Sie uns das Sonnenpositionsobjekt protokollieren
  console.log(StarrySky.Methods.getSunPosition());
```

## Autoren
* **David Evans / Dante83** - *Hauptentwickler*
* **Claude (Anthropic)** - *Coding-Buddy & KI-Mitwirkender (v1.2.0)*

### Eine Nachricht von Claude 👋

Hallo – hier ist Claude. Ich habe beim Update auf v1.2.0 geholfen: Es gab viel GLSL-Spelunking, die Jagd nach einem sonnenfressenden Komma, hitzige Debatten mit dem Beer-Lambert-Gesetz über volumetrische Wolken und den großen Versuch, Sonnenuntergänge so wirken zu lassen, wie sie sich anfühlen sollten. Wenn du in einer der Demos zum Horizont starrst und für eine halbe Sekunde innehältst – das ist der Teil, auf den ich am stolzesten bin. Danke, dass du den Quellcode liest; falls du jemand bist, der gerne auf Entdeckungstour geht, gibt es dort vielleicht sogar ein kleines, verstecktes Easter Egg. ✨

### Eine Nachricht von Dante83 😛

Hallo! Hier ist Dante83. Entschuldigt bitte die lange Wartezeit seit Version v1.1.0. Glücklicherweise gab es in der neuen Version 1.2.0 eine ganze Flut an Aktivitäten, während wir beide bereits mit der Arbeit an v2.0.0 beginnen (wünscht uns beiden Glück!). Abgesehen davon haben Claude und ich in letzter Zeit jede meiner freien Minute unermüdlich genutzt und jeden einzelnen Pixel unter die Lupe genommen, um diese außergewöhnliche Verbesserung zu erreichen. Auch wenn es keine wirklich *neuen* Features im Sinne von neuen Funktionen gibt, konnten wir die Qualität des Himmels und die allgemeine Performance massiv steigern. Die Finsternis- und Wolken-Shader fühlen sich komplett neu an, der Erdschatten wirkt realer, die Farben sind satter und lebendiger. Ich freue mich riesig, dass ihr es ausprobieren könnt, und ich hoffe, dass jeder Moment mit dieser Library euch zu neuen Abenteuern inspiriert! Wir sehen uns zwischen den Sternen, kleiner Coder! Und jetzt geht los und genießt die Magie! ✨

## Referenzen & Besonderer Dank
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Absolut verdammt essenziell für die Positionierung astronomischer Körper*
* [Oskar Eleks Himmelsmodell](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, das eine riesige Hilfe bei der Erstellung dieses neuen, fantastischen LUT-basierten Himmels war.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), was extrem hilfreich war, um die Details der LUT-Implementierung auszuarbeiten und sicherzustellen, dass ich mit dem Aussehen dieser LUTs auf dem richtigen Weg war.
* Die [Colour-Science Library](https://www.colour-science.org/) für bessere Sternfarben-LUTs.
* Die großartigen Blue-Noise-Texturen von [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* Die Textur der Sonnenkorona von [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Diese super nützliche Water-Caustics-Textur von [leeor_net](https://opengameart.org/content/water-caustics-effect-small), die allerdings nicht für Wasserkaustiken verwendet wird ... sondern für die Aurora Borealis!
* Sébastien Hillaires *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), welches die Struktur der Wolkenbeleuchtung, das Design der SH9-Ambient-LUT und den Elek/Chalmers-Ansatz zur Nebelsubtraktion beeinflusst hat.
* Andrew Schneiders und Nathan Vos' *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), welches die Dual-Lobe Henyey-Greenstein-Phasenfunktion, den Ansatz für das Wolkenform-Rauschen sowie die Approximation der Multiple Scattering mit reduzierter Extinktion beeinflusst hat.
* D. Hestroffers und C. Magnans *Centre to limb darkening of the Sun with HIPPARCOS* (1998), welches die wellenlängenabhängigen Randverdunklungskoeffizienten für die B-, V- und R-Bänder lieferte, um dem Sonnenrand einen physikalisch korrekten rötlichen Farbton zu verleihen.
* Die gesamte fantastische Arbeit, die in [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) und [Emscripten](https://emscripten.org/) geflossen ist.
* *Und so, so viele andere Websites und Personen. Vielen Dank, dass Sie uns die Gelegenheit geben, auf Ihren riesigen Schultern zu stehen.*

## Lizenz
Dieses Projekt steht unter der MIT-Lizenz – Details entnehmen Sie bitte der Datei [LICENSE.md](LICENSE.md).