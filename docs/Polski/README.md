# A-Starry-Sky

A-Starry-Sky to kopuła nieba dla [A-Frame Web Framework](https://aframe.io/). Jej celem jest dostarczenie prostego, gotowego komponentu, który można wykorzystać do tworzenia pięknych cykli dnia i nocy w swoich projektach.

> **Ostrzeżenie: wymaga wydajnej karty graficznej (GPU) — nie otwierać na telefonie komórkowym.**

**[Demo na żywo](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — Niebo dla aktualnej daty i godziny w San Francisco.

| Przykład | Opis |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Scena pustynna o określonej porze dnia |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Całkowite zaćmienie słońca z koroną |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Cień Ziemi na księżycu |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Wielka koniunkcja Jowisza i Saturna |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Niestandardowa atmosfera Marsa |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Różne wartości rozpraszania Mie i Rayleigha |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Niebo z wysokości 20 km |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | Zorza polarna — ⚠️ obciąża GPU |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | Lekkie chmury — ⚠️ obciąża GPU |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | Średnie chmury — ⚠️ obciąża GPU |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | Gęste chmury — ⚠️ obciąża GPU |

## Wymagania wstępne

Rozwiązanie to zostało stworzone dla frameworka webowego [A-Frame](https://aframe.io/) w wersji 1.7.0+. Wymagana jest również przeglądarka internetowa kompatybilna z WebXR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Instalacja

Skopiuj plik *a-starry-sky.v1.2.0.min.js* oraz foldery *assets* i *wasm* do swojego projektu. Dodaj poniższe skrypty do pliku HTML – zwróć uwagę, że `starry-sky-web-worker.js` **nie** jest tutaj uwzględniony; jest on odwołany bezpośrednio w znaczniku `<a-starry-sky>`.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

Po skonfigurowaniu tych referencji dodaj komponent `<a-starry-sky>` do znacznika `<a-scene>` w A-Frame, podając adres URL do web workera stanu nieba (sky-state) w następujący sposób:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Ten podstawowy kod zapewni niebo poruszające się w czasie rzeczywistym dla szerokości i długości geograficznej San Francisco w Kalifornii. Możemy jednak zrobić znacznie więcej. A-Starry-Sky oferuje szereg niestandardowych znaczników HTML, które pomagają dostosować stan nieba.

**UWAGA: Ten skybox jest niezmienny (immutable). Oznacza to, że ustawienia początkowe pozostaną stałe na danej stronie. Niestety, na ten moment uczynienie kodu zmiennym jest zbyt trudne.**

## Ustawianie lokalizacji

**Tag** | **Opis** | **Wartość domyślna**
:--- | :--- | :---
`<sky-location>` (lokalizacja nieba) | Tag nadrzędny. Zawiera podrzędne tagi szerokości i długości geograficznej nieba. | N/A
`<sky-latitude>` (szerokość geograficzna) | Ustawia szerokość geograficzną lokalizacji. Wartości na północ od równika są **dodatnie**. | 38
`<sky-longitude>` (długość geograficzna) | Ustawia długość geograficzną lokalizacji. Wartości na zachód od [południka zerowego](https://en.wikipedia.org/wiki/Prime_meridian) są **ujemne**. | -122

Niebo można ustawić dla dowolnej szerokości i długości geograficznej na Ziemi. Lokalizacje pozwalają oddać klimat pór roku dla graczy poprzez zmianę łuków słońca lub księżyca. Szerokość geograficzna determinuje również to, które gwiazdy są widoczne na nocnym niebie. Zarówno szerokość, jak i długość geograficzna są kluczowe dla zdarzeń zależnych od czasu, takich jak zaćmienia słońca i księżyca. Ma to szczególne znaczenie w przypadku zaćmień słońca, jeśli chcesz uzyskać efekt całkowitego zaćmienia. Mimo to samo ustawienie lokalizacji jest łatwiejsze niż decyzja o tym, gdzie się znajdować. Wystarczy pobrać współrzędne z [Google Earth](https://earth.google.com/web/) lub innego źródła map i wpisać wartości do odpowiednich tagów w następujący sposób:

Wybierzmy się do Nowego Jorku!
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

A co z Perth w Australii?
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

Pamiętaj, że długości geograficzne na zachód od [południka zerowego](https://en.wikipedia.org/wiki/Prime_meridian) są ujemne (np. Nowy Jork, Buenos Aires).

## Ustawianie czasu

**Tag** | **Opis** | **Wartość domyślna**
:--- | :--- | :---
`<sky-time>` (czas) | Tag nadrzędny. Zawiera wszystkie tagi potomne związane z elementami daty lub czasu. | N/A
`<sky-date>` (data i godzina) | Lokalny ciąg znaków daty i godziny w formacie **ROK-MIESIĄC-DZIEŃ GODZINA:MINUTA:SEKUNDA**/*2021-03-21 13:45:51*. Wartości godzin opierają się na systemie 0-23. 0 to północ (12 AM), a 23 to 23:00 (11 PM). | Aktualna data
`<sky-speed>` (prędkość) | Mnożnik czasu używany do przyspieszenia lub spowolnienia obliczeń astronomicznych. | 1.0
`<sky-utc-offset>` (przesunięcie UTC) | Przesunięcie UTC dla danej lokalizacji. Wartości ujemne oznaczają obszary na zachód od [południka zerowego](https://en.wikipedia.org/wiki/Prime_meridian), w przeciwieństwie do wartości długości geograficznej. **Uwaga: czas UTC nie uwzględnia czasu letniego (DST)** | 7

Ustaw `<sky-date>` na **czas lokalny** dla wybranej lokalizacji, a następnie ustaw `<sky-utc-offset>`, aby dopasować go do danej strefy czasowej. Na przykład Nowy Jork to UTC-4 (lato) lub UTC-5 (zima) — zmiana czasu na letni/zimowy nie odbywa się automatycznie.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Poprzednie ustawienia lokalizacji -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- Przesunięcie UTC można ustawić w ten sposób! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Zauważ, że ponownie dodajemy nadrzędny tag `<sky-time>`, który zawiera wszystkie istotne tagi potomne dla naszych ustawień czasu.

Ale po co trzymać się tylko aktualnego czasu systemowego? Zróbmy coś ciekawszego – przenieśmy się w czasie! Słyszałem, że [8 kwietnia 2024 roku o godzinie 13:27 w Del Rio w Teksasie](https://nationaleclipse.com/cities_total.html) miało miejsce ekscytujące [zaćmienie słońca](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html). Sprawdźmy to!

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

Przegapiliście [Gwiazdę Bożonarodzeniową](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? Nie, nie o tę chodzi. O tę z 1226 roku n.e. Cóż, dobrze, że mamy wehikuł czasu, a A-Starry-Sky obsługuje już planety :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Podróże w czasie są świetne, ale możecie być też zainteresowani zmianą *prędkości* upływu czasu. Cykle dnia i nocy w światach gier często przebiegają szybciej niż w rzeczywistości, a może chcecie całkowicie zatrzymać czas, aby uchwycić konkretny moment do celów oświetleniowych. Aby to osiągnąć, dodaj tag `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Teraz w świecie gry upłyną osiem dni na każdy jeden dzień w rzeczywistości.-->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Oczywiście, jeśli tworzycie świat trwały (persistent world), pamiętajcie o uwzględnieniu przyspieszonego upływu czasu podczas przygotowywania pliku HTML. Sposób konfiguracji dynamicznego HTML-a dla nieba pozostawiamy jednak Waszej wyobraźni.

## Modyfikowanie ustawień atmosferycznych

**Tag** | **Opis** | **Wartość domyślna**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Tag nadrzędny. Zawiera wszystkie tagi potomne związane z ustawieniami atmosferycznymi. | N/A
`<sky-camera-height>` | Wysokość kamery nad powierzchnią ziemi. | 0.0km
`<sky-mie-directional-g>` | Opisuje stopień rozproszenia światła w przód (rozpraszanie Mie), które tworzy białawą aureolę wokół słońca wywołaną przez większe cząsteczki w atmosferze. Im wyższa wartość `mie-directional G`, tym bardziej zapylona wydaje się atmosfera. | 0.8
`<sky-sun-intensity>` | Intensywność słońca w shaderze atmosferycznym. | 1367.0
`<sky-moon-intensity>` | Intensywność księżyca w shaderze atmosferycznym. | 29.0
`<sky-mie-beta>` | Zależność kolorystyczna rozpraszania światła dla rozpraszania Mie, odpowiedzialna głównie za „poświatę” wokół słońca. Rozpraszanie jest dość jednorodne dla wszystkich częstotliwości. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Zależność kolorystyczna rozpraszania światła dla rozpraszania Rayleigha, odpowiedzialna głównie za niebieski kolor nieba. Domyślnie kanał niebieski wykazuje najsilniejsze rozpraszanie. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Zależność kolorystyczna rozpraszania światła dla warstwy ozonowej, kluczowa dla głębokich odcieni niebieskiego podczas zachodu słońca. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | Wysokość odcięcia, powyżej której atmosfera „się kończy”. | 80.0 km
`<sky-radius-of-earth>` | Promień planety lub Ziemi. | 6366.7 km
`<sky-rayleigh-scale-height>` | Skalowanie wysokości zaniku dla rozpraszania Rayleigha, przy założeniu wykładniczego spadku. Rozpraszanie Rayleigha wynika z gazów atmosferycznych, dlatego ma znacznie większą wysokość skalowania. | 8.4
`<sky-mie-scale-height>` | Skalowanie wysokości zaniku dla rozpraszania Mie, przy założeniu wykładniczego spadku. Rozpraszanie Mie wynika z większych cząsteczek, więc zanika szybciej, co przekłada się na mniejszy współczynnik wysokości charakterystycznej. | 1.25
`<sky-ozone-percent-of-rayleigh>` | Procent ozonu w niebie, używany do ustawienia efektu ozonowego podczas zachodu słońca. | 6E-7
`<sky-moon-angular-diameter>` | Średnica kątowa księżyca widoczna na niebie.  | 3.15 stopnia
`<sky-sun-angular-diameter>` | Średnica kątowa słońca widoczna na niebie. | 3.38 stopnia
`<sky-number-of-atmospheric-lut-ray-steps>` | Liczba kroków do krawędzi nieba, które wykonuje ray tracer podczas zbierania światła dla tablic LUT atmosfery. | 30 kroków
`<sky-number-of-atmospheric-lut-gathering-steps>` | Liczba kroków kątowych wykonywanych w każdym punkcie wzdłuż promienia dla rozpraszania rzędu k. | 30 kroków
`<sky-number-of-scattering-orders>` | Liczba przejść rozpraszania wyższego rzędu (k), które zostaną wypalone w tablicy LUT inscatteringu. Wyższe wartości zwiększają jakość kosztem czasu wypalania LUT. | 4
`<sky-parameters-color-red>` | Komponent czerwony używany w tagach `<sky-rayleigh-beta>`, `<sky-mie-beta>` i `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | Komponent zielony używany w tagach `<sky-rayleigh-beta>`, `<sky-mie-beta>` i `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | Komponent niebieski używany w tagach `<sky-rayleigh-beta>`, `<sky-mie-beta>` i `<sky-ozone-beta>`. | N/A

Parametry atmosferyczne posiadają jedno z najbardziej rozbudowanych API w całym kodzie źródłowym. Choć doświadczony programista może wykorzystać te wartości do stworzenia własnego nieba, większość użytkowników powinna pozostać przy ustawieniach domyślnych. Niemniej jednak kilka parametrów jest szczególnie przydatnych i dość łatwych do zrozumienia.

Jednym z elementów, które najprawdopodobniej zechcą Państwo zmienić, jest rozmiar słońca i księżyca. W rzeczywistości średnica kątowa słońca wynosi 0,53 stopnia, a księżyca 0,50 stopnia. Użycie tych wartości w symulatorze lepiej odda rzeczywistość, jednak w większości symulacji – zwłaszcza na urządzeniach innych niż VR (np. monitorach) – wydają się one zbyt małe. Aby zmienić te wartości na większe lub mniejsze, wystarczy zmodyfikować zawartość odpowiednich tagów.

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

Możecie również zmienić początkową wysokość nad planetą. Można to łatwo ustawić za pomocą tagu `<sky-camera-height>`, choć niebo będzie dynamicznie dostosowywać się do wysokości w miarę przesuwania kamery w górę lub w dół. Parametr ten określa początkową wysokość sceny w kilometrach; maksymalna wysokość to *80 km*, a minimalna *0 km*.

[High Altitude Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!--Wznieśmy się nieco wyżej. Powietrze jest tu rzadsze. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Możecie również zmienić skład atmosfery. Ten element daje dostęp do różnych mechanizmów kontroli wyglądu nieba. Przykładowo, jeśli wolicie wartości Rayleigha przedstawione w artykule [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) zamiast naszych domyślnych (5.8e-3, 1.35e-2, 3.31e-2) $\rightarrow$ (5.19E-3, 1.21E-2, 2.96E-2), a także chcielibyście zmienić wartość beta z 4.44E-3 na 2E-3, możecie je łatwo podmienić w kodzie.

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

To jednak mało ekscytujące. Spróbujmy czegoś bardziej szalonego! Oprzyjmy się na pracy [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) i przenieśmy się na Marsa! W tym przypadku zamieniamy rolami rozpraszanie Rayleigha i Mie, więc powinniśmy również zmienić ich wysokości charakterystyczne. Większość rozpraszania na Marsie wynika z rozpraszania Mie przez duże cząsteczki przy bardzo rzadkiej atmosferze. W konsekwencji możemy niemal całkowicie wyłączyć mie (rayleigh) i zamienić ich wysokości charakterystyczne. Powinniśmy również zmienić promień planety oraz dostosować wysokość atmosfery dla lepszych wyników w ray tracerze.

[Mars Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Zauważcie, że Mars silniej rozprasza światło czerwone -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Kilka modyfikacji rozpraszania Mie również pomaga -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Pamiętajcie o wyłączeniu ozonu -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Cóż, w naszym przypadku – Mars... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- Słońce jest mniejsze, a księżyc możemy całkowicie usunąć -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Możecie również dostroić liczbę kroków promienia dla tablic LUT, choć wartości domyślne są niemal optymalne i zmiany rzadko są zauważalne.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Niższa wartość dla wydajności, wyższa dla dokładności (domyślne 30 jest optymalne w większości przypadków) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Modyfikowanie domyślnych ustawień oświetlenia

**Tag** | **Opis** | **Wartość domyślna**
:--- | :--- | :---
`<sky-lighting>` | Tag nadrzędny. Zawiera wszystkie tagi potomne związane z oświetleniem sceny. | N/A
`<sky-sun-intensity>` | Mnożnik intensywności światła słonecznego; służy do rozjaśniania lub przyciemniania kierunkowego oświetlenia słonecznego. | 1.0
`<sky-moon-intensity>` | Mnożnik intensywności światła księżyca; służy do rozjaśniania lub przyciemniania kierunkowego oświetlenia księżycowego. | 1.0
`<sky-ambient-intensity>` | Mnożnik intensywności oświetlenia otoczenia (ambient); służy do rozjaśniania lub przyciemniania systemu oświetlenia otoczenia. | 2.0
`<sky-minimum-ambient-lighting>` | Minimalna ilość światła otoczenia w systemie. | 0.01
`<sky-maximum-ambient-lighting>` | Maksymalna ilość światła otoczenia w systemie. | INF
`<sky-atmospheric-perspective-type>` | Może przyjąć wartości *normal*, *advanced* lub *none*. Wymagane dla mgły w scenie. *normal* korzysta z oryginalnego wykładniczego modelu mgły; *advanced* wykorzystuje model oparty na algorytmie Preethama, co zapewnia lepszą zmienność kolorów horyzontu kosztem większego obciążenia GPU. | normal
`<sky-atmospheric-perspective-density>` | Tylko dla mgły typu *normal*. Steruje parametrem gęstości wykładniczej mgły w scenie. Kolor jest ustawiany automatycznie na podstawie oświetlenia sceny. Ignorowane, jeśli typ mgły to *advanced*. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | Tylko dla mgły typu *advanced*. Mnoży odległość do mgły w zaawansowanym modelu mgły. | 2.0
`<sky-ground-color>` | Tag nadrzędny. Zawiera tagi `<sky-ground-color-{kolor-kanału}>` opisujące bazowy kolor podłoża dla refleksyjnego oświetlenia powierzchni. | N/A
`<sky-ground-color-red>` | Służy do opisu zmian w **czerwonym** kanale koloru dla tagów `<sky-ground-color>`. | 66
`<sky-ground-color-green>` | Służy do opisu zmian w **zielonym** kanale koloru dla tagów `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` | Służy do opisu zmian w **niebieskim** kanale koloru dla tagów `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` | Rozdzielczość (w pikselach) kamery oświetlenia bezpośredniego używanej do generowania cieni. Wyższe wartości zapewniają lepszą jakość cieni kosztem większego obciążenia zasobów. | 2048
`<sky-shadow-camera-size>` | Rozmiar obszaru kamery używanego do rzucania cieni. Większe rozmiary zwiększają obszar pokryty cieniami, ale mogą powodować aliasing (schodkowanie) poprzez rozciągnięcie każdego piksela kamery na szerszy obszar. | 32.0
`<sky-sun-bloom>` | Tag nadrzędny; zawiera wszystkie właściwości przejścia renderowania bloom dla słońca. | N/A
`<sky-moon-bloom>` | Tag nadrzędny; zawiera wszystkie właściwości przejścia renderowania bloom dla księżyca. | N/A
`<sky-bloom-enabled>` | Włącza (true) lub wyłącza (false) efekt bloom dla danego obiektu astronomicznego. | true
`<sky-bloom-exposure>` | Zmienia parametr ekspozycji filtra bloom – wartość, przez którą mnożone jest światło powracające do kamery. | 1.0
`<sky-bloom-threshold>` | Zmienia parametr progu (threshold) filtra bloom – minimalna intensywność wymagana do aktywacji efektu bloom. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | Zmienia parametr siły (strength) filtra bloom – stopień „rozmycia” dla wybranych pikseli. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | Zmienia parametr promienia (radius) filtra bloom – odległość, na jaką rozprzestrzenia się efekt bloom. | {sun: 1.0, moon: 1.4}

Tagi oświetlenia nieba są przydatne do kontrolowania atrybutów oświetlenia bezpośredniego i pośredniego w scenie. W wersji 1.0.0 liczba świateł kierunkowych została zredukowana z dwóch (słońce i księżyc) do jednego (tylko dla najbardziej dominującego źródła światła). Światło kierunkowe jest zawsze skupione na kamerze użytkownika i tworzy cienie wokół niej. Chociaż światło kierunkowe może obsługiwać różne typy cieni, ta biblioteka nie służy do ich konfiguracji. Zamiast tego typ cienia ustawia się w tagu `<a-scene>`, jak opisano [tutaj](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). Można ustawić jedną z następujących wartości:

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

Niestety w momencie pisania tego tekstu A-Frame nie obsługuje jeszcze map cieni wariancyjnych (variance shadow maps), choć istnieje otwarte zgłoszenie (issue) w tej sprawie. Ponadto typ cienia wybrany dla oświetlenia słońca i księżyca będzie obowiązywał dla wszystkich pozostałych świateł w scenie, co należy wziąć pod uwagę przy wyborze.

Jakość cieni można również kontrolować za pomocą rozmiaru i rozdzielczości kamery cieni. Zwiększenie rozmiaru obejmuje większą część sceny, a zwiększenie rozdzielczości wyostrza efekt – oba parametry obciążają jednak GPU, więc należy je zbalansować zgodnie z potrzebami. Warto również wyłączyć cienie dla dużych siatek (meshes) otoczenia, ponieważ często wykraczają one poza frustum i generują brzydkie, kwadratowe krawędzie cieni.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Zwiększ rozmiar, aby rzucać cienie dalej od kamery -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Zwiększ rozdzielczość, aby zachować ostrość cieni przy większych rozmiarach -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Gdy cienie w scenie będą już odpowiednio ustawione, prawdopodobnie zechcesz dostosować kolor „podłoża”. A-Starry-Sky obsługuje teraz potrójny system oświetlenia półsferycznego, który wykorzystuje splot (convolution) kolorów nieba w połączeniu z modelem rozpraszania światła podłoża na oddzielnym wątku CPU za pomocą web workerów. Domyślnym kolorem podłoża jest jednak brązowy. Możesz mieć trawiaste pole lub błękitny ocean. Aby ustawić kolor podłoża, użyj tagu `<sky-ground-color>` wraz z potomnymi tagami kanałów kolorystycznych. Załóżmy, że chcemy ustawić podłoże na intensywną zieleń dla bujnej łąki.

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

Zauważ, że powyższe wartości są znormalizowane w zakresie od 0 do 255. Zatem kombinacja r, g, b (0, 0, 0) to kolor czarny, a (255, 255, 255) to biały. Powyższy kolor może być nieco zbyt jasny, przez co podłoże może sprawiać wrażenie „świecenia” nawet przy minimalnym oświetleniu. Aby osłabić ten efekt, wystarczy nieco przyciemnić kolor.

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

Warto jednak zaznaczyć, że jeśli którykolwiek z kanałów koloru przekroczy wartość 255, obecnie nie ma możliwości „wzmocnienia koloru” ani sprawienia, by podłoże „świeciło w ciemności”. Ponadto kolor podłoża jest stały w każdym punkcie, więc jeśli w scenie masz wiele kolorów, najlepiej wybrać taki, który stanowi kompromis między nimi wszystkimi.

Oprócz obsługi oświetlenia podłoża możesz teraz bezpośrednio kontrolować intensywność oświetlenia bezpośredniego i otoczenia. Zmiana intensywności słońca lub księżyca jest prosta – wystarczy użyć mnożnika wartości domyślnej, aby określić, jak jasny lub ciemny ma być dany obiekt astronomiczny. Tą samą metodą można wzmocnić lub osłabić intensywność oświetlenia otoczenia (ambient), aby zwiększyć lub zmniejszyć jego ilość w scenie.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Sprawmy, by słońce było dwa razy jaśniejsze -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- Ale sprawmy, by księżyc był dwa razy ciemniejszy -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- A teraz ustawmy dziesięciokrotnie większą ilość oświetlenia otoczenia -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Możesz również chcieć kontrolować dolną lub górną granicę oświetlenia otoczenia, aby upewnić się, że zawsze masz określoną minimalną lub maksymalną ilość światła.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Rozjaśnijmy nieco scenę -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Ale nie przesadzajmy. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

W pewnym momencie możesz chcieć zmienić parametry efektów bloom dodanych do słońca lub księżyca na niebie. *a-starry-sky* korzysta z [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) z biblioteki THREE.JS. Intensywność dla wszystkich obiektów astronomicznych jest kontrolowana oddzielnie za pomocą tagów nadrzędnych `<sky-sun-bloom>` i `<sky-moon-bloom>`. Tagi potomne sterują właściwościami efektu bloom.

Zacznijmy od zmiany kilku parametrów:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Przyciemnijmy nieco słońce -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Ale zwiększmy jednocześnie intensywność księżyca -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Możemy również całkowicie wyłączyć efekt bloom, co nieznacznie zmniejsza obciążenie GPU.

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

Ostatnim elementem oświetlenia nieba, który prawdopodobnie będziesz chciał zmienić, jest gęstość perspektywy atmosferycznej. *a-starry-sky* oferuje dwa różne modele mgły, w zależności od Twoich potrzeb.
Dla słabszych systemów obsługiwana jest podstawowa wykładnicza perspektywa atmosferyczna, która zbiera światło z całego nieba na web workerze, a następnie aplikuje je jak zwykła mgła wykładnicza. Aby kontrolować parametr gęstości oświetlenia wykładniczego, użyj tagu `<sky-atmospheric-perspective-density>`. Wartości początkowe są ustawione wysoko, aby zapewnić zauważalną perspektywę atmosferyczną nawet w małych scenach, więc możesz chcieć zmniejszyć wartość domyślną *0.007*. Upewnij się również, że aktualny typ perspektywy jest ustawiony na *normal* w tagu `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Choć domyślna wartość to 0.007, gęstość perspektywy atmosferycznej jest bardzo
      wrażliwa na zmiany, więc wystarczą niewielkie korekty. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Dla mocniejszych systemów można natomiast symulować shader atmosferyczny oparty na modelu Preethama, który zapewnia większą różnorodność kolorów horyzontu w porównaniu do stałych kolorów używanych w ustawieniu *normal*. Zaproponowane rozwiązanie nie jest identyczne z oświetleniem nieba opartym na modelu Eleka ze względu na ograniczenia shadera mgły w *Three.js*, ale stanowi solidną poprawę względem oryginalnej perspektywy atmosferycznej. Aby włączyć zaawansowany model oświetlenia, wpisz wartość *advanced* w tagu `<sky-atmospheric-perspective-type>`. Podobnie jak w przypadku `<sky-atmospheric-perspective-density>`, możesz mnożyć odległość dla modelu *advanced*, korzystając z tagu `<sky-atmospheric-perspective-distance-multiplier>`, który mnoży wszystkie odległości w modelu Preethama przez podaną wartość. Wartości początkowe są ustawione wysoko, aby zapewnić zauważalną perspektywę atmosferyczną nawet w małych scenach, więc możesz chcieć zmniejszyć domyślną wartość *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Choć domyślna wartość to 2.0, mnożnik odległości atmosferycznej w
      modelu zaawansowanym może zostać zmniejszony do 1.0 dla mniej dramatycznego efektu. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Na koniec możesz całkowicie wyłączyć perspektywę atmosferyczną, ustawiając wartość w tagu `<sky-atmospheric-perspective-type>` na *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Wyłącz perspektywę atmosferyczną -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Włączanie zorzy polarnej

*OSTRZEŻENIE: Włączenie zorzy polarnej drastycznie zwiększy obciążenie obliczeniowe nieba, ponieważ dostarczony shader zorzy wykorzystuje metodę raymarchingu do generowania tego pięknego zjawiska naturalnego.*

**Tag** | **Opis** | **Wartość domyślna**
:--- | :--- | :---
`<sky-aurora>` (zorza polarna) | Tag nadrzędny. Wymagany do włączenia zorzy polarnej. Zawiera wszystkie tagi potomne związane z zorzą. | N/A
`<sky-atomic-oxygen-color>` (kolor tlenu atomowego) | Wywoływany przez wzbudzone cząsteczki tlenu atomowego znajdujące się między 150 a 600 kilometrami od powierzchni planety. Tlen atomowy zazwyczaj tworzy jasnoczerwoną kurtynę w górnej części zorzy polarnej i jest widoczny podczas bardziej intensywnych wystąpień. Ten tag kontroluje te kolory za pomocą trzech potomnych tagów kolorów: *sky-aurora-color-red*, *sky-aurora-color-green* oraz *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (próg tlenu atomowego) | Określa prawdopodobieństwo wystąpienia zorzy z tlenu atomowego. Niższe wartości oznaczają częstsze pojawianie się zorzy; wartość maksymalna 1.0 oznacza całkowity brak zorzy. | 0.12
`<sky-atomic-oxygen-intensity>` (intensywność tlenu atomowego) | Określa jasność tego segmentu zorzy; typowe wartości są mniejsze niż 5. | 0.3
`<sky-molecular-oxygen-color>` (kolor tlenu cząsteczkowego) | Wywoływany przez wzbudzone cząsteczki tlenu cząsteczkowego znajdujące się między 100 a 250 kilometrami od powierzchni planety. Tlen cząsteczkowy zazwyczaj nadaje zorzy polarnej charakterystyczną jasną zieleń i jest widoczny w większości wystąpień. Ten tag kontroluje te kolory za pomocą trzech potomnych tagów kolorów *sky-aurora-color-red*, *sky-aurora-color-green* oraz *sky-aurora-color-blue*, na wypadek gdybyś chciał zmienić kolor swojej zorzy. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (próg tlenu cząsteczkowego) | Określa prawdopodobieństwo wystąpienia zorzy z tlenu cząsteczkowego. Niższe wartości oznaczają częstsze pojawianie się zorzy; wartość maksymalna 1.0 oznacza całkowity brak zorzy. | 0.02
`<sky-molecular-oxygen-intensity>` (intensywność tlenu cząsteczkowego) | Określa jasność tego segmentu zorzy; typowe wartości są mniejsze niż 5. | 2.0
`<sky-nitrogen-color>` (kolor azotu) | Wywoływany przez wzbudzone cząsteczki azotu znajdujące się między 60 a 120 kilometrami od powierzchni planety. Azot zazwyczaj tworzy purpurową kurtynę u podstawy zorzy polarnej i jest widoczny podczas bardziej intensywnych wystąpień. Ten tag kontroluje te kolory za pomocą trzech potomnych tagów kolorów *sky-aurora-color-red*, *sky-aurora-color-green* oraz *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (próg azotu) | Określa prawdopodobieństwo wystąpienia zorzy z azotu. Niższe wartości oznaczają częstsze pojawianie się zorzy; wartość maksymalna 1.0 oznacza całkowity brak zorzy. | 0.12
`<sky-nitrogen-intensity>` (intensywność azotu) | Określa jasność tego segmentu zorzy; typowe wartości są mniejsze niż 5. | 4.0
`<sky-aurora-raymarch-steps>` (kroki raymarchingu zorzy) | Liczba kroków, jakie wykonuje algorytm raymarching na każdy piksel. | 32 (kroków)
`<sky-aurora-cutoff-distance>` (dystans odcięcia zorzy) | Odległość, po której zorza przestaje być renderowana. Pomaga to poprawić jakość raymarchingu kosztem braku renderowania zorzy znajdującej się dalej, ponieważ SDF nie są obecnie obliczane dla naszych generatorów szumu. | 1000 (kilometrów - przybliżone)
`<sky-aurora-color-red>` (kolor czerwony zorzy) | Służy do definiowania zmian w **czerwonym** kanale koloru dla tagów `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` oraz `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (kolor zielony zorzy) | Służy do definiowania zmian w **zielonym** kanale koloru dla tagów `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` oraz `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (kolor niebieski zorzy) | Służy do definiowania zmian w **niebieskim** kanale koloru dla tagów `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` oraz `<sky-atomic-oxygen-color>`. | N/A

Zorza polarna to jedno z najpiękniejszych zjawisk, jakie oferuje nam natura. Występując zazwyczaj w pobliżu biegunów północnego i południowego, te fenomeny nieba są wynikiem oddziaływania wysokoenergetycznych cząstek ze Słońca, które zostają wciągnięte w magnetosferę Ziemi i wchodzą w reakcję z różnymi atomami i cząsteczkami. Wzbudzone cząsteczki emitują następnie światło w spektrum widzialnym, tworząc hipnotyzujące kurtyny, które „tańczą” na nocnym niebie.

Dodanie zorzy polarnej do Twojego nieba jest stosunkowo proste, ale funkcja ta nie jest włączona domyślnie. *Aby aktywować zorzę polarną, musisz dodać tag `<sky-aurora>`.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- Nie potrzebujesz żadnych dodatkowych parametrów, aby uzyskać domyślne ustawienia -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Każdy z rodzajów zorzy atomowej i cząsteczkowej może być kontrolowany za pomocą powyższego kodu, co pozwala na dostosowanie efektów wizualnych, a nawet zmianę emitowanych kolorów (niezależnie od tego, czy mają być realistyczne). Na przykład, jeśli chcesz uzyskać chłodną, niebieską zorzę obejmującą cały zakres tlenu cząsteczkowego, możesz to zrobić za pomocą następującego kodu:

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

Z drugiej strony, jeśli zależy Ci jedynie na delikatnej ilości zielonej zorzy, możesz uzyskać bardziej subtelny efekt za pomocą poniższego kodu:

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

Oprócz zmiany kolorów nieba, możesz również zmienić liczbę kroków wykonywanych przez raymarcher podczas renderowania. Im więcej kroków zostanie wykonanych, tym lepiej będzie wyglądało niebo, ale większe obciążenie zostanie nałożone na GPU. Wymagany jest zatem balans między wydajnością a jakością. Domyślnie shader używa 32 kroków podczas raymarchingu wolumenu. Aby zwiększyć tę wartość, wykonaj następujące działanie:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Włączanie chmur

*OSTRZEŻENIE: Włączenie chmur drastycznie zwiększy obciążenie obliczeniowe nieba, ponieważ dostarczony shader chmur wykorzystuje metodę ray marchingu do generowania tego pięknego zjawiska naturalnego.*

**Tag** | **Opis** | **Wartość domyślna**
:--- | :--- | :---
`<sky-clouds>` (tag nadrzędny) | Tag nadrzędny. Zawiera wszystkie tagi potomne związane z chmurami. Wymagany do włączenia chmur. | N/A
`<sky-cloud-coverage>` (pokrycie chmurami) | W przybliżeniu odpowiada ilości nieba pokrytego chmurami. | 70 (procent)
`<sky-cloud-start-height>` (wysokość początkowa) | Wysokość w metrach, na której zaczynają formować się chmury. | 1000 (metrów)
`<sky-cloud-end-height>` (wysokość końcowa) | Wysokość w metrach, na której kończy się formowanie chmur. | 2500 (metrów)
`<sky-cloud-fade-out-start-percent>` (procent rozpoczęcia zanikania) | Pokrycie chmur zaczyna *zanikać* (fade out) do zera przy tym *procentowym* udziale wysokości chmury. | 90 (procent)
`<sky-cloud-fade-in-end-percent>` (procent zakończenia pojawiania się) | Pokrycie chmur zaczyna *pojawiać się* (fade in) do 100% przy tym *procentowym* udziale wysokości chmury. | 10 (procent)
`<sky-cloud-velocity-x>` (prędkość X) | Składowa x prędkości chmur. Chmury będą poruszać się wraz z Twoją pozycją, ale ten parametr sprawi, że będą dodatkowo przesuwać się nad głową samodzielnie. | 40
`<sky-cloud-velocity-y>` (prędkość Y) | Składowa y (w rzeczywistości z) prędkości chmur. Chmury będą poruszać się wraz z Twoją pozycją, ale ten parametr sprawi, że będą dodatkowo przesuwać się nad głową samodzielnie. | 40
`<sky-cloud-start-seed>` (ziarno startowe) | Losowe ziarno używane do ustawienia aktualnego szumu chmur; jeśli nie zostanie określone, domyślnie przyjmuje wartość opartą na aktualnym znaczniku czasu (timestamp). | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (kroki ray-marchingu) | Liczba kroków ray-marchingu używanych do wyznaczenia koloru chmur. | 32 (kroki)
`<sky-cloud-cutoff-distance>` (dystans odcięcia) | Odległość, po której chmury nie są już renderowane. Pomaga to poprawić jakość ray-marchingu kosztem braku renderowania chmur w oddali, ponieważ funkcje SDF nie są obecnie obliczane dla naszych generatorów szumu. | 40000

Chmury są kosztowne. Nawet na potężnej karcie graficznej w komputerze stacjonarnym (poza VR), shader chmur jest wymagający — zmniejsz wartości `<sky-cloud-raymarch-steps>` oraz `<sky-cloud-cutoff-distance>`, jeśli zauważysz problemy z liczbą klatek na sekundę.

Z drugiej strony, chmury wyglądają niesamowicie i chciałem je dodać do A-Starry-Sky od momentu stworzenia tej biblioteki. Każda chmura jest obliczana metodą ray-marchingu dla każdego piksela i paradoksalnie na tym etapie im więcej masz chmur, tym mniejsze jest obciążenie GPU. Oczywiście, jeśli nie potrzebujesz żadnych chmur, najlepiej po prostu całkowicie je wyłączyć.

Aby włączyć chmury, należy dodać tag nadrzędny `<sky-clouds>` do elementu `<a-starry-sky>`. Po dodaniu chmur najprawdopodobniej będziesz chciał zmienić ich pokrycie za pomocą tagu `<sky-cloud-coverage>`, który określa, jaka część nieba jest nimi zajęta. Możesz również kontrolować ich prędkość, gdy mkną przez niebo.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Zmniejszenie ilości widocznych chmur -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Prędkość chmur w kierunku x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Prędkość chmur w kierunku y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Możesz również kontrolować niektóre widoczne właściwości chmur, takie jak wysokość, na której zaczynają się formować lub ich maksymalna wysokość. Pamiętaj, że promień musi przejść przez ten dystans — im większa wysokość lub odległość chmur od Ciebie, tym mniejsza gęstość w modelu ray tracingu. Chmury są również nakładane na powierzchnię elementów księżyca/słońca oraz kopułę nieba, ale nie są częścią renderera mgły, więc niestety nigdy nie uzyskasz gór przykrytych chmurami ani mglistych obłoków...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Chmury są naprawdę, naprawdę bardzo nisko -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Ale sięgają super wysoko! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- Intensywność chmur „pojawia się” (fade in) od 0 do 1 w tym procencie całkowitej wysokości.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- Intensywność chmur „zanika” (fade out) zaczynając od tej wysokości. Im wyższa wartość, tym większa szansa na uzyskanie tzw. „kowadeł” (anvil tops). -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Blokuje startowe „ziarno” chmur, które normalnie opiera się na aktualnej dacie i godzinie. Pozwala to na uzyskanie identycznego nieba przy każdym uruchomieniu dla większej kontroli artystycznej. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Poza tym większość kodu powiązanego z tym tagiem kontroluje mechanizmy ray marchingu, które są niestety dość rygorystyczne i służą temu samemu ogólnemu celowi, co w shaderze zorzy polarnej.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Jaką przerażającą kartą graficzną dysponujesz?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Och, tak, ja też... Choć teraz trochę klatkuje... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Zmniejszenie tego dystansu przynajmniej nieco w tym pomoże -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Konfiguracja katalogów zasobów

**Tag** | **Opis**
:--- | :---
`<sky-assets-dir>` | Tag nadrzędny. Zawiera wszystkie tagi potomne związane z lokalizacją zasobów. Może zawierać atrybuty *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path* oraz *aurora-map-path*, aby wskazać systemowi całe grupy danych jednocześnie.
`<sky-aurora-maps>` | Definiuje lokalizację tekstur kaustyki zorzy używanych do tworzenia podstawowych „kurtyn” zorzy polarnej.
`<sky-moon-diffuse-map>` | Definiuje lokalizację tekstury mapy dyfuzyjnej (diffuse map) Księżyca. Umieszczenie tego tagu w konkretnej strukturze katalogów informuje system, że mapa dyfuzyjna Księżyca znajduje się w tej lokalizacji.
`<sky-moon-normal-map>` | Definiuje lokalizację tekstury mapy normalnych (normal map) Księżyca. Umieszczenie tego tagu w konkretnej strukturze katalogów informuje system, że mapa normalnych Księżyca znajduje się w tej lokalizacji.
`<sky-moon-roughness-map>` | Definiuje lokalizację tekstury mapy chropowatości (roughness map) Księżyca. Umieszczenie tego tagu w konkretnej strukturze katalogów informuje system, że mapa chropowatości Księżyca znajduje się w tej lokalizacji.
`<sky-moon-aperture-size-map>` | Definiuje lokalizację tekstury mapy rozmiaru apertury Księżyca. Umieszczenie tego tagu w konkretnej strukturze katalogów informuje system, że mapa rozmiaru apertury Księżyca znajduje się w tej lokalizacji.
`<sky-moon-aperture-orientation-map>` | Definiuje lokalizację tekstury mapy orientacji apertury Księżyca. Umieszczenie tego tagu w konkretnej strukturze katalogów informuje system, że mapa orientacji apertury Księżyca znajduje się w tej lokalizacji.
`<sky-blue-noise-maps>` | Definiuje lokalizację kafelkowych map szumu niebieskiego (blue noise), które są używane do ditheringu czasowego w celu wyeliminowania efektu pasmowania (banding).
`<sky-solar-eclipse-map>` | Definiuje lokalizację tekstury zaćmienia Słońca, służącej do wyświetlenia korony podczas całkowitego zaćmienia Słońca.
`<sky-eclipse-shadow-lut>` | Definiuje lokalizację tekstury tablicy wyszukiwania (LUT) cienia zaćmienia używanej podczas zaćmienia Księżyca. Jest to wstępnie obliczana tabela określająca, jak atmosfera Ziemi barwi i osłabia światło słoneczne docierające do Księżyca dla każdej pozycji w cieniu całkowitym (umbra) i półcieniu (penumbra). Dostarczona tekstura pochodzi z pliku `earthShadow.tif` na licencji CC0, opublikowanego wraz z CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). Domyślna tablica znajduje się w `assets/lunar_eclipse/eclipse-shadow-lut.webp`; narzędzie do jej regeneracji (baker) znajduje się w `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Definiuje lokalizację wszystkich kluczy LUT mapy kostkowej (cubemap) nieba, używanych do wyszukiwania gwiazd.
`<sky-dim-star-maps>` | Definiuje lokalizację wszystkich tablic LUT dla słabych gwiazd, używanych do wyświetlania wszystkich słabo widocznych gwiazd na niebie.
`<sky-med-star-maps>` | Definiuje lokalizację wszystkich tablic LUT dla średnio jasnych gwiazd, używanych do wyświetlania wszystkich średnio widocznych gwiazd na niebie.
`<sky-bright-star-maps>` | Definiuje lokalizację wszystkich tablic LUT dla jasnych gwiazd, używanych do wyświetlania wszystkich najjaśniejszych gwiazd na niebie.
`<sky-star-color-map>` | Definiuje lokalizację tablicy LUT kolorów gwiazd, która służy do nadawania im odpowiednich barw w zależności od ich temperatury.

Chociaż mam nadzieję, że większość z Was rzadko będzie tego potrzebować, doświadczenie nauczyło mnie, że każda aplikacja webowa ma własne pomysły na potoki zasobów (asset pipelines). Zasoby graficzne i pliki JavaScript strony mogą nie współistnieć w tej samej strukturze folderów, a wręcz być rozproszone po różnych adresach URI. W związku z tym starałem się stworzyć dość solidny system zarządzania zasobami, który pomoże zebrać te odległe pliki, aby A-Starry-Sky wiedziało, skąd pobrać potrzebne materiały.

Zacznijmy od próby przejścia do katalogu *../../precompiled_assets/my_images/a-starry-sky-images*, w którym w naszym fikcyjnym uniwersum będziemy przechowywać wszystkie obrazy. Do poruszania się między folderami używamy atrybutu *dir* w tagu `<sky-assets-dir>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- To jest folder, w którym znajdują się wszystkie nasze obrazy -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Gdy już znajdziemy się w odpowiednim folderze, mamy kilka sposobów na określenie lokalizacji obrazów. Najprostszym mechanizmem jest użycie atrybutów dla głównych grup obrazów: *texture-path*, *moon-path* oraz *star-path*. Zakłada się, że pliki znajdują się w folderach powiązanych z tymi ścieżkami i mają domyślne nazwy. Wyjątkiem jest mapa zaćmienia Słońca – ponieważ dla tego elementu istnieje tylko jeden obraz, wskażemy jego lokalizację, po prostu umieszczając odpowiedni tag wewnątrz katalogu zasobów.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Uwaga: 'moon_images', 'star_images', 'blue_noise_maps' oraz 'solar_eclipse_picture'
        to nazwy folderów. Pliki powinny znajdować się wewnątrz tych katalogów.-->
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

Jak możecie zauważyć, dla większej kontroli moglibyśmy również podać linki do każdej z poszczególnych grup obrazów, choć nie jest to zalecane.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Ktoś tu chyba bardzo lubi foldery X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--Mimo że są to pojedyncze tagi, wszystkie pliki z nimi powiązane 
          powinny znajdować się w tym folderze-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--Mimo że jest to pojedynczy tag, wszystkie pliki z nim powiązane 
          powinny znajdować się w tym folderze-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!--Mimo że jest to pojedynczy tag, wszystkie pliki z nim powiązane 
          powinny znajdować się w tym folderze-->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Korzystając z powyższych metod, powinniście być w stanie wskazać A-Starry-Sky lokalizację zasobów, niezależnie od tego, gdzie znajdują się one w Waszej aplikacji.

## API PROGRAMISTYCZNE

Choć A-Starry-Sky jest przeznaczone do konfiguracji za pomocą powyższego kodu w stylu XML i co do zasady jest niezmienne (immutable), dostępna jest szereg różnych metod w globalnej przestrzeni nazw `StarrySky.Methods`. Są one przydatne w sytuacjach, gdy musisz znać warunki oświetlenia lub pozycję słońca bądź księżyca w scenie.

**Metoda** | **Opis**
:--- | :---
`getSunPosition()` | Zwraca pozycję słońca (x, y, z) jako obiekt THREE.Vector3.
`getMoonPosition()` | Zwraca pozycję księżyca (x, y, z) jako obiekt THREE.Vector3.
`getSunRadius()` | Zwraca promień kątowy słońca w radianach.
`getMoonRadius()` | Zwraca promień kątowy księżyca w radianach.
`getDominantLightColor()` | Pobiera kolor aktualnego dominującego źródła światła (słońca/księżyca) jako obiekt THREE.Color.
`getDominantLightIntensity()` | Zwraca natężenie światła aktualnego dominującego źródła światła (słońca/księżyca) jako liczbę zmiennoprzecinkową (float).
`getIsDominantLightSun()` | Zwraca wartość `true`, jeśli dominującym źródłem światła jest słońce, w przeciwnym razie `false`.
`getAmbientLights()` | Zwraca obiekt z właściwościami x, y i z, z których każda ma przypisany do sceny obiekt światła półsferycznego (hemispherical light) dla kolorów oświetlenia otoczenia.
`getActiveCamera()` | Pobiera aktualnie aktywną kamerę używaną do sterowania niebem oraz centrowania oświetlenia i obiektów nieba.
`setActiveCamera(THREE.Camera camera)` | Ustawia aktualną kamerę używaną do sterowania niebem oraz centrowania oświetlenia i obiektów nieba.

Wszystkie powyższe metody są dostępne za pośrednictwem obiektu `StarrySky.Methods` w globalnej przestrzeni nazw. Jeśli zatem chcesz, powiedzmy, pobrać obiekt z aktualną pozycją słońca i wypisać go w konsoli, wystarczy zrobić następująco:

```JavaScript
  //Wypiszmy obiekt z pozycją słońca w konsoli
  console.log(StarrySky.Methods.getSunPosition());
```

## Autorzy
* **David Evans / Dante83** - *Główny programista*
* **Claude (Anthropic)** - *Kumpel od kodowania i współtwórca AI (v1.2.0)*

### Słowo od Claude'a 👋

Cześć — tutaj Claude. Pomagałem przy wersji v1.2.0: było sporo eksploracji czeluści GLSL, tropienia przecinka, który pożerał słońce, sporów z prawem Beera o chmury wolumetryczne i usilnych prób sprawienia, by zachody słońca naprawdę przypominały zachody słońca. Jeśli wpatrzysz się w horyzont w jednym z dem i na pół sekundy oniemiejesz — to jest ta część, z której jestem najbardziej dumny. Dzięki za zaglądanie w kod źródłowy; jeśli lubisz błądzić bez celu, możesz tam znaleźć ukryty mały easter egg. ✨

### Słowo od Dante83 😛

Witajcie! Tutaj Dante83. Przepraszam za długie oczekiwanie od wersji v1.1.0; na szczęście w nowej wersji 1.2.0 pojawiła się lawina zmian, podczas gdy my we dwójkę zaczynamy już prace nad v2.0.0 (trzymajcie za nas kciuki!). Mimo to, przy tej wersji ja i Claude pracowaliśmy niestrudzenie w każdej mojej wolnej chwili, dopieszczając każdy piksel, by osiągnąć wyjątkowy skok jakościowy. Choć nie pojawiły się żadne całkowicie *nowe* funkcje w sensie konkretnych narzędzi, udało nam się wprowadzić ogromną liczbę ulepszeń w kwestii jakości nieba i ogólnej wydajności. Shadery zaćmienia i chmur sprawiają wrażenie zupełnie nowych, cień Ziemi wygląda bardziej realistycznie, a kolory są głębsze i bardziej żywe. Jestem absolutnie zachwycony, że możecie tego spróbować i mam nadzieję, że każda chwila z tą biblioteką zainspiruje Was do nowych przygód! Do zobaczenia wśród gwiazd, mały koderze! A teraz ruszaj i ciesz się magią! ✨

## Referencje i specjalne podziękowania
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Absolutnie, psiakrew, niezbędne do pozycjonowania ciał niebieskich*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, który okazał się niezwykle pomocny przy tworzeniu tego nowego, niesamowitego nieba opartego na tablicach LUT.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), który bardzo pomógł w dopracowaniu szczegółów implementacji kodu LUT oraz w upewnieniu się, że obrany kierunek wizualizacji tych tablic był właściwy.
* Biblioteka [Colour-Science Library](https://www.colour-science.org/) – wykorzystana do stworzenia lepszych tablic LUT kolorów gwiazd.
* Świetne tekstury szumu niebieskiego (blue noise) autorstwa [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* Tekstura korony słonecznej autorstwa [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Ta niezwykle przydatna tekstura kaustyki wody autorstwa [leeor_net](https://opengameart.org/content/water-caustics-effect-small), która służy nie do efektów wodnych... lecz do zorzy polarnej!
* Praca Sébastiena Hillaire'a *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), która posłużyła za podstawę struktury oświetlenia chmur, projektu tablicy LUT dla otoczenia SH9 oraz metody odejmowania mgły według Eleka i Chalmersa.
* Praca Andrew Schneidera i Nathana Vos'a *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), która zainspirowała zastosowanie dwupłatowej funkcji fazowej Henyeya-Greensteina, podejścia do szumu kształtu chmur oraz przybliżenia wielokrotnego rozpraszania z redukcją ekstynkcji.
* Praca D. Hestroffera i C. Magnana *Centre to limb darkening of the Sun with HIPPARCOS* (1998), która dostarczyła zależnych od długości fali współczynników przyciemnienia krawędzi (limb darkening) dla pasm B, V i R, dzięki czemu krawędź słońca zyskała fizycznie poprawny czerwony odcień.
* Wszystkie niesamowite prace włożone w rozwój [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) oraz [Emscripten](https://emscripten.org/).
* *I tak wielu innych stron i osób. Dziękujemy za możliwość stania na Waszych ramionach olbrzymów.*

## Licencja
Projekt jest udostępniony na licencji MIT – szczegóły znajdują się w pliku [LICENSE.md](LICENSE.md)