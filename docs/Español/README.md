# A-Starry-Sky

A-Starry-Sky es una cúpula celeste para el [A-Frame Web Framework](https://aframe.io/). Su objetivo es proporcionar un componente sencillo y listo para usar que permita crear ciclos día-noche espectaculares en tus proyectos.

> **Advertencia: requiere una GPU potente; no abrir en dispositivos móviles.**

**[Demo en vivo](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — El cielo según la fecha y hora actuales en San Francisco.

| Ejemplo | Descripción |
|:---|:---|
| [Desierto](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Escena desértica en un momento específico del día |
| [Eclipse solar](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Eclipse solar total con corona |
| [Eclipse lunar](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Sombra de la Tierra sobre la Luna |
| [Estrella de Navidad (1226 d.C.)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Gran conjunción de Júpiter y Saturno |
| [Marte](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Atmósfera marciana personalizada |
| [Atmósfera personalizada](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Diferentes valores de dispersión de Mie y Rayleigh |
| [Gran altitud](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Cielo visto desde los 20 km de altura |
| [Aurora boreal](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ Consumo intensivo de GPU |
| [Nubes ligeras](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ Consumo intensivo de GPU |
| [Nubes moderadas](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ Consumo intensivo de GPU |
| [Nubes densas](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ Consumo intensivo de GPU |

## Requisitos previos

Está desarrollado para el [A-Frame Web Framework](https://aframe.io/) versión 1.7.0+. También requiere un navegador web compatible con WebXR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Instalación

Copia el archivo *a-starry-sky.v1.2.0.min.js* y las carpetas *assets* y *wasm* en tu proyecto. Añade los siguientes scripts a tu HTML; ten en cuenta que `starry-sky-web-worker.js` **no** está incluido aquí, ya que se referencia directamente en la etiqueta `<a-starry-sky>`.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{RUTA_A_LA_CARPETA_JS}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{RUTA_A_LA_CARPETA_JS}/wasm/interpolation-engine.js"></script>
```

Una vez configuradas estas referencias, añade el componente `<a-starry-sky>` dentro de la etiqueta `<a-scene>` de A-Frame, haciendo referencia a la URL del web worker del estado del cielo de la siguiente manera:

```html
<a-scene>
  <a-starry-sky web-worker-src="{RUTA_A_LA_CARPETA_JS}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Este código básico te proporcionará un cielo que se mueve en tiempo real según la latitud y longitud de San Francisco, California. Sin embargo, podemos hacer mucho más que esto. A-Starry-Sky incluye una serie de etiquetas HTML personalizadas para ayudarte a configurar el estado de tu cielo.

**NOTA: Este sky box es inmutable. Esto significa que la configuración inicial se mantendrá constante en cualquier página. Lamentablemente, en este momento resulta demasiado complejo hacer que el código sea mutable.**

## Configuración de la ubicación

**Etiqueta** | **Descripción** | **Valor predeterminado**
:--- | :--- | :---
`<sky-location>` (Ubicación del cielo) | Etiqueta principal. Contiene las etiquetas hijas de latitud y longitud del cielo. | N/A
`<sky-latitude>` (Latitud del cielo) | Establece la latitud de la ubicación. El norte del ecuador es **positivo**. | 38
`<sky-longitude>` (Longitud del cielo) | Establece la longitud de la ubicación. El oeste del [meridiano de Greenwich](https://en.wikipedia.org/wiki/Prime_meridian) es **negativo**. | -122

Puedes configurar tu cielo en cualquier latitud y longitud del planeta Tierra. Las ubicaciones son útiles para dar una sensación de estaciones a tus jugadores, modificando los arcos del sol o la luna. La latitud también determinará qué estrellas son visibles en tu cielo nocturno. Tanto la latitud como la longitud son fundamentales para eventos dependientes del tiempo, como los eclipses solares y lunares; esto es especialmente relevante si buscas experimentar un eclipse solar total. Dicho esto, configurar la ubicación es más sencillo que decidir dónde estar. Solo tienes que obtener las coordenadas deseadas de [Google Earth](https://earth.google.com/web/) o cualquier otra fuente cartográfica e introducir los valores en sus etiquetas correspondientes, así:

¡Vamos a Nueva York!
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

Vale, ¿pero qué hay de Perth, Australia?
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

Ten en cuenta que las longitudes al oeste del [meridiano de Greenwich](https://en.wikipedia.org/wiki/Prime_meridian) son negativas (por ejemplo, Nueva York o Buenos Aires).

## Configuración de la hora

**Etiqueta** | **Descripción** | **Valor predeterminado**
:--- | :--- | :---
`<sky-time>` | Etiqueta principal. Contiene todas las etiquetas hijas relacionadas con los elementos de fecha u hora. | N/A
`<sky-date>` | La cadena de fecha y hora local en el formato **AÑO-MES-DÍA HORA:MINUTO:SEGUNDO**/*2021-03-21 13:45:51*. Los valores de la hora también se basan en un sistema de 0 a 23 horas. El 0 corresponde a las 12 AM y el 23 a las 11 PM. | Fecha actual
`<sky-speed>` | El multiplicador de tiempo utilizado para acelerar o ralentizar los cálculos astronómicos. | 1.0
`<sky-utc-offset>` | El desplazamiento UTC (UTC-Offset) para esta ubicación. Los valores negativos se encuentran al oeste del [meridiano de Greenwich](https://en.wikipedia.org/wiki/Prime_meridian), al contrario que los valores de longitud. **Tenga en cuenta que la hora UTC no sigue el horario de verano (DST)** | 7

Configure `<sky-date>` con la **hora local** de la ubicación elegida y luego ajuste `<sky-utc-offset>` para que coincida con esa zona horaria. Por ejemplo, la ciudad de Nueva York es UTC-4 (verano) o UTC-5 (invierno); el horario de verano no se aplica automáticamente.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Configuración de ubicación anterior -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- ¡Puedes configurar el desplazamiento UTC de esta manera! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Observe que volveremos a añadir la etiqueta principal `<sky-time>`, que contiene todas las etiquetas hijas pertinentes para nuestra configuración de tiempo.

Dicho esto, no tienes por qué limitarte a la hora del equipo local. ¿Por qué no hacemos algo más interesante, como viajar en el tiempo? Me han dicho que habrá un [eclipse solar](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) emocionante el [8 de abril de 2024 a las 1:27 PM (13:27 en formato de 24 horas) en Del Rio, Texas](https://nationaleclipse.com/cities_total.html). ¡Vamos a echarle un vistazo!

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

¿Te perdiste la [Estrella de Navidad](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? No, no. No esa. Me refiero a la del año 1226 d.C. Bueno, es una suerte que tengamos una máquina del tiempo y que A-Starry-Sky ahora admita planetas :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Viajar en el tiempo es divertido, pero quizá también te interese cambiar la *velocidad* del tiempo. Los ciclos de día y noche suelen transcurrir más rápido en los mundos virtuales que en la realidad, o tal vez quieras detener el tiempo permanentemente para capturar un momento específico para tu iluminación. Para lograrlo, añade la etiqueta `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Ahora habrá ocho días en el mundo virtual por cada día de la vida real. -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Por supuesto, si estás implementando esto en un mundo persistente, asegúrate de tener en cuenta el flujo acelerado del tiempo al crear tu HTML. No obstante, la configuración de un HTML dinámico para tu cielo queda a tu criterio.

## Modificación de los ajustes atmosféricos

**Etiqueta (Tag)** | **Descripción** | **Valor predeterminado**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Etiqueta principal. Contiene todas las etiquetas hijas relacionadas con los ajustes atmosféricos. | N/A
`<sky-camera-height>` | La altura de la cámara sobre la tierra. | 0.0km
`<sky-mie-directional-g>` | Describe cuánta luz se dispersa hacia adelante mediante la dispersión de Mie, que es el halo blanquecino que se ve alrededor del sol causado por partículas más grandes en la atmósfera. Cuanto mayor sea el valor de `mie-directional G`, más polvorienta parecerá la atmósfera. | 0.8
`<sky-sun-intensity>` | La intensidad del sol en el shader atmosférico. | 1367.0
`<sky-moon-intensity>` | La intensidad de la luna en el shader atmosférico. | 29.0
`<sky-mie-beta>` | Dependencia del color de la dispersión de la luz para la dispersión de Mie, responsable principalmente del «resplandor» cercano al sol. La dispersión es bastante uniforme en todas las frecuencias. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Dependencia del color de la dispersión de la luz para la dispersión de Rayleigh, responsable principalmente de la dispersión azul del cielo. Nótese que el canal azul es el que presenta mayor dispersión por defecto. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Dependencia del color de la dispersión de la luz para la capa de ozono, fundamental para los azules profundos durante el atardecer. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | La altura de corte a partir de la cual «termina» la atmósfera. | 80.0 km
`<sky-radius-of-earth>` | El radio del planeta o de la Tierra. | 6366.7 km
`<sky-rayleigh-scale-height>` | Altura de escala de caída para la dispersión de Rayleigh, asumiendo una caída exponencial. La dispersión de Rayleigh proviene de los gases atmosféricos y, por lo tanto, tiene una altura de escala mucho mayor. | 8.4
`<sky-mie-scale-height>` | Altura de escala de caída para la dispersión de Mie, asumiendo una caída exponencial. La dispersión de Mie proviene de partículas más grandes, por lo que tiende a caer más rápido; de ahí un escalador de altura característica menor. | 1.25
`<sky-ozone-percent-of-rayleigh>` | El porcentaje de ozono actual en el cielo, utilizado para establecer el retorno de ozono al atardecer. | 6E-7
`<sky-moon-angular-diameter>` | El diámetro angular de la luna tal como aparece en el cielo.  | 3.15 grados
`<sky-sun-angular-diameter>` | El diámetro angular del sol tal como aparece en el cielo. | 3.38 grados
`<sky-number-of-atmospheric-lut-ray-steps>` | El número de pasos hacia el borde del cielo que realiza el trazador de rayos al recolectar luz para las LUT atmosféricas. | 30 pasos
`<sky-number-of-atmospheric-lut-gathering-steps>` | El número de pasos angulares realizados en cada punto a lo largo del rayo para la dispersión de orden k. | 30 pasos
`<sky-number-of-scattering-orders>` | El número de pases de dispersión de orden superior (k) que se hornean (*bake*) en la LUT de dispersión entrante. Valores más altos aumentan la calidad a costa del tiempo de horneado de la LUT. | 4
`<sky-parameters-color-red>` | El componente rojo utilizado en las etiquetas `<sky-rayleigh-beta>`, `<sky-mie-beta>` y `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | El componente verde utilizado en las etiquetas `<sky-rayleigh-beta>`, `<sky-mie-beta>` y `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | El componente azul utilizado en las etiquetas `<sky-rayleigh-beta>`, `<sky-mie-beta>` y `<sky-ozone-beta>`. | N/A

Los parámetros atmosféricos cuentan con una de las API más extensas de todo el código base. Aunque un desarrollador experimentado puede usar estos valores para crear cielos personalizados, la mayoría de los usuarios preferirán mantener los valores predeterminados. No obstante, algunos valores son especialmente útiles y fáciles de comprender.

Uno de los elementos que más probablemente quiera cambiar es el tamaño del sol y la luna. En la vida real, el sol tiene un diámetro angular de 0,53 grados y la luna uno de 0,50 grados. Usar estos valores en el simulador representaría mejor la realidad, pero suelen resultar demasiado pequeños en la mayoría de las simulaciones, especialmente en dispositivos que no son VR, como los monitores. Para ajustar estos valores, simplemente cámbielos en las etiquetas correspondientes.

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

También es posible que desee cambiar la altura inicial sobre el planeta. Esto se puede configurar fácilmente con la etiqueta `<sky-camera-height>`, aunque el cielo también se adaptará dinámicamente a su altura a medida que mueva la cámara hacia arriba o hacia abajo. Esto establece la altura inicial de la escena, en kilómetros; la altura máxima es de *80 km* y la mínima de *0 km*.

[Ejemplo de gran altitud](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Subamos un poco más. El aire es más tenue aquí arriba. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

También puede cambiar la composición de su atmósfera. Este elemento le otorga acceso a diversos mecanismos para controlar el aspecto de sus cielos según sus preferencias. Por ejemplo, si prefiere los valores de Rayleigh presentados en [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) en lugar de nuestros valores nativos (5.8e-3, 1.35e-2, 3.31e-2) $\rightarrow$ (5.19E-3, 1.21E-2, 2.96E-2), y desea usar una beta de 4.44E-3 $\rightarrow$ 2E-3, puede sustituirlos fácilmente en el código.

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

Pero eso no es muy emocionante; digamos que queremos algo un poco más loco. ¡Sigamos el trabajo de [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) y vayamos a Marte! En este caso, se intercambia el uso de Rayleigh y Mie, por lo que probablemente también debamos intercambiar sus alturas características. La mayor parte de la dispersión en Marte proviene de la dispersión de Mie de partículas grandes, con una atmósfera muy tenue. Por consiguiente, podemos desactivar prácticamente la mie (rayleigh) e intercambiar también sus alturas características. También deberíamos cambiar el radio del planeta y quizás ajustar la altura atmosférica para obtener mejores valores en el trazador de rayos.

[Ejemplo de Marte](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Nótese que Marte dispersa más la luz roja -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Algunas modificaciones en Mie también ayudan -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Asegúrese de desactivar el ozono -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Bueno, en nuestro caso, Marte... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- El sol es más pequeño y la luna podemos eliminarla por completo -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

También puede ajustar el número de pasos del rayo de la LUT, aunque los valores predeterminados ya son casi óptimos y los cambios rara vez son perceptibles.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Menor para mejorar el rendimiento, mayor para más precisión (el valor predeterminado de 30 es óptimo en la mayoría de los casos) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Modificación de los valores predeterminados de iluminación

**Etiqueta (Tag)** | **Descripción** | **Valor predeterminado**
:--- | :--- | :---
`<sky-lighting>` | Etiqueta principal. Contiene todas las etiquetas hijas relacionadas con la iluminación de la escena. | N/A
`<sky-sun-intensity>` | Multiplicador de intensidad para la luz solar; se puede usar para aumentar o disminuir la intensidad de la iluminación direccional solar. | 1.0
`<sky-moon-intensity>` | Multiplicador de intensidad para la luz lunar; se puede usar para aumentar o disminuir la intensidad de la iluminación direccional lunar. | 1.0
`<sky-ambient-intensity>` | Multiplicador de intensidad para la iluminación ambiental; se puede usar para aumentar o disminuir la intensidad del sistema de iluminación ambiental. | 2.0
`<sky-minimum-ambient-lighting>` | La cantidad mínima de luz ambiental en el sistema. | 0.01
`<sky-maximum-ambient-lighting>` | La cantidad máxima de luz ambiental en el sistema. | INF
`<sky-atmospheric-perspective-type>` | Puede configurarse como *normal*, *advanced* o *none*. Es necesaria para la niebla de la escena. *normal* utiliza el modelo original de niebla exponencial; *advanced* utiliza un modelo basado en Preetham para mejorar la variación del color del horizonte a costa de una mayor carga para la GPU. | normal
`<sky-atmospheric-perspective-density>` | Solo para niebla *normal*. Controla el parámetro de densidad para la niebla exponencial de la escena. El color se establece automáticamente según la iluminación de la escena. Se ignora si el tipo de niebla de la escena es *advanced*. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | Solo para niebla *advanced*. Multiplica la distancia a la niebla para el modelo de niebla avanzado. | 2.0
`<sky-ground-color>` | Etiqueta principal. Contiene las etiquetas `<sky-ground-color-{canal-de-color}>` para describir el color base del suelo para la iluminación reflectante desde la superficie. | N/A
`<sky-ground-color-red>` | Se utiliza para describir los cambios en el canal de color **rojo** de las etiquetas `<sky-ground-color>`. | 66
`<sky-ground-color-green>` | Se utiliza para describir los cambios en el canal de color **verde** de las etiquetas `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` | Se utiliza para describir los cambios en el canal de color **azul** de las etiquetas `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` | La resolución, en píxeles, de la cámara de iluminación directa utilizada para producir sombras. Valores más altos producen sombras de mayor calidad a un mayor costo de procesamiento. | 2048
`<sky-shadow-camera-size>` | El tamaño del área de la cámara utilizada para proyectar sombras. Tamaños más grandes resultan en una mayor área cubierta por sombras, pero también causan problemas de aliasing al distribuir cada píxel de la cámara sobre un área más amplia. | 32.0
`<sky-sun-bloom>` | Etiqueta principal; contiene todas las propiedades del pase de renderizado bloom del sol. | N/A
`<sky-moon-bloom>` | Etiqueta principal; contiene todas las propiedades del pase de renderizado bloom de la luna. | N/A
`<sky-bloom-enabled>` | Activa (true) o desactiva (false) el efecto bloom en este objeto astronómico. | true
`<sky-bloom-exposure>` | Cambia el parámetro de exposición del filtro bloom: la cantidad por la cual se multiplica la luz que regresa a la cámara. | 1.0
`<sky-bloom-threshold>` | Cambia el parámetro de umbral (threshold) del filtro bloom: la intensidad mínima necesaria para activar el bloom. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | Cambia el parámetro de fuerza (strength) del filtro bloom: cuánto debe "brillar" (bloom) en los píxeles seleccionados. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | Cambia el parámetro de radio del filtro bloom: la distancia sobre la cual se extiende el efecto de bloom. | {sun: 1.0, moon: 1.4}

Las etiquetas de iluminación del cielo son útiles para controlar los atributos de la iluminación directa e indirecta en la escena. En la versión 1.0.0, se ha reducido el número de luces direccionales de 2 (sol y luna) a 1 (solo una para la fuente de luz más dominante). La luz direccional siempre está enfocada en la cámara del usuario y crea sombras alrededor de ella. Aunque la luz direccional puede admitir varios tipos de sombras, esta librería no es el lugar para controlarlo. En su lugar, el tipo de sombra se define en la etiqueta `<a-scene>`, como se describe [aquí](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). Es decir, puede establecer los valores en cualquiera de los siguientes:

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

Lamentablemente, al momento de escribir esto, A-Frame aún no admite mapas de sombras de varianza (variance shadow maps), aunque hay un problema abierto al respecto. Además, el tipo de sombra que elija para la iluminación del sol y la luna será también el tipo de sombra para todas las demás luces de su escena, así que tenga esto en cuenta al elegir sus sombras.

También puede controlar la calidad de las sombras a través del tamaño y la resolución de la cámara de sombras. Aumentar el tamaño cubre más parte de la escena; aumentar la resolución define mejor el resultado, pero ambos tienen un costo para la GPU, así que equilíbrelos según sus necesidades. También conviene desactivar las sombras en mallas ambientales grandes, ya que a menudo quedan fuera del frustum y producen un borde de sombra cuadrado y antiestético.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Aumentar el tamaño para proyectar sombras más lejos de la cámara -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Aumentar la resolución para mantener las sombras nítidas en tamaños mayores -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Una vez que tenga las sombras de su escena ajustadas a su gusto, probablemente también desee ajustar el color de su "suelo". A-Starry-Sky ahora admite una configuración de iluminación hemisférica triple que utiliza una convolución sobre los colores del cielo combinada con un modelo de dispersión de luz terrestre en un hilo de CPU separado mediante web workers. Sin embargo, el color predeterminado del suelo es marrón. Podría tener un campo de hierba o un océano cerúleo. Para establecer el color de su suelo, puede usar la etiqueta `<sky-ground-color>` junto con sus etiquetas hijas de canal de color. Supongamos que queremos configurar el suelo en un verde brillante para un campo de hierba exuberante.

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

Tenga en cuenta que los valores anteriores están normalizados entre 0 y 255. Por lo tanto, la combinación r, g, b 0, 0, 0 es negro y 255, 255, 255 es blanco. El color anterior podría ser demasiado brillante, haciendo que el suelo parezca "brillar" con la más mínima cantidad de luz. Para atenuar este efecto, simplemente puede oscurecer un poco el color.

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

Dicho esto, lamentablemente, si alguno de sus canales de color supera los 255, no hay forma de "reforzar el color" o hacer que el suelo parezca "brillar en la oscuridad" por el momento. Además, el color del suelo es una constante en todos los puntos, por lo que si tiene múltiples colores en su escena, probablemente sea mejor elegir uno que se encuentre en un punto medio entre todos los demás colores.

Además del soporte para la iluminación del suelo, ahora puede controlar directamente las intensidades de la iluminación directa y ambiental. Cambiar la intensidad del sol o la luna es sencillo, ya que solo debe usar un múltiplo del valor predeterminado para establecer qué tan brillante u oscuro desea que sea ese cuerpo astronómico. También puede utilizar el mismo método para amplificar o atenuar la intensidad ambiental y así aumentar o disminuir la cantidad de iluminación ambiental en la escena.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Hagamos que el sol sea el doble de brillante -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- Pero hagamos que la luna sea la mitad de brillante -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- Pero tengamos diez veces más iluminación ambiental -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

También es posible que desee controlar el límite inferior (floor) o superior (ceiling) de la iluminación ambiental, para asegurarse de tener siempre una cierta cantidad de luz, o una cantidad máxima.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Aclaremos un poco las cosas -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Pero que no sea demasiado. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

En algún momento, es posible que desee cambiar los parámetros de los efectos bloom añadidos al sol o a la luna en el cielo. *a-starry-sky* utiliza el [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) de THREE.JS. La intensidad de todos los objetos astronómicos se controla por separado con las etiquetas principales `<sky-sun-bloom>` y `<sky-moon-bloom>`, respectivamente. Las etiquetas hijas de estas controlan las características del bloom.

Comencemos cambiando algunos parámetros:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Atenuemos un poco el sol -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Pero aumentemos también la intensidad de la luna -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

También podemos desactivar el bloom por completo, lo que reduce ligeramente la carga de la GPU.

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

El último elemento de la iluminación del cielo que probablemente querrá cambiar es la densidad de la perspectiva atmosférica. *a-starry-sky* incluye dos modelos de niebla diferentes según sus necesidades.
Para sistemas de gama baja, admite la perspectiva atmosférica exponencial básica, que recopila luz de todo el cielo en un web worker y luego la aplica como una niebla exponencial normal. Para controlar el parámetro de densidad de la iluminación exponencial, utilice la etiqueta `<sky-atmospheric-perspective-density>`. Los valores iniciales se establecen altos para proporcionar una perspectiva atmosférica notable, incluso en escenas pequeñas, por lo que es posible que desee reducir el valor predeterminado de *0.007*. Asegúrese también de establecer el tipo de perspectiva actual como *normal* en la etiqueta `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- aunque el valor predeterminado es 0.007, la densidad de la perspectiva atmosférica es muy
      sensible a los cambios, por lo que solo se requieren ajustes pequeños. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Para sistemas de gama alta, sin embargo, puede simular un sombreador atmosférico basado en Preetham que ofrece más variedad en los colores del horizonte en lugar de los colores constantes utilizados en la configuración *normal*. La solución proporcionada no es una coincidencia exacta con la iluminación del cielo basada en Elek utilizada para el firmamento debido a limitaciones en el sombreador de niebla de *Three.js*, pero representa una mejora sólida respecto a la perspectiva atmosférica original. Para habilitar el modelo de iluminación avanzado, simplemente ingrese el valor *advanced* en la etiqueta `<sky-atmospheric-perspective-type>`. De manera similar a `<sky-atmospheric-perspective-density>`, puede multiplicar la distancia para el modelo de iluminación *advanced* utilizando la etiqueta `<sky-atmospheric-perspective-distance-multiplier>`, que multiplica todas las distancias en el modelo basado en Preetham por la cantidad que usted indique. Los valores iniciales se establecen altos para proporcionar una perspectiva atmosférica notable, incluso en escenas pequeñas, por lo que es posible que desee reducir el valor predeterminado de *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- aunque el valor predeterminado es 2.0, podemos reducir el multiplicador de distancia atmosférica en el
      modelo avanzado a 1.0 si queremos un efecto menos dramático. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Finalmente, puede desactivar toda la perspectiva atmosférica estableciendo el valor de la etiqueta `<sky-atmospheric-perspective-type>` en *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Desactivar la perspectiva atmosférica -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Habilitar la aurora boreal

*ADVERTENCIA: Habilitar la aurora boreal aumentará drásticamente la carga computacional del cielo, ya que el shader de aurora proporcionado utiliza un método de raymarching para producir este hermoso fenómeno natural.*

**Etiqueta (Tag)** | **Descripción** | **Valor predeterminado**
:--- | :--- | :---
`<sky-aurora>` (Aurora boreal) | Etiqueta principal. Es necesaria para habilitar la aurora boreal. Contiene todas las etiquetas hijas relacionadas con la aurora. | N/A
`<sky-atomic-oxygen-color>` (Color del oxígeno atómico) | Provocado por moléculas de oxígeno atómico excitadas situadas entre 150 y 600 kilómetros de la superficie planetaria; el oxígeno atómico suele generar una cortina roja brillante en la parte superior de la aurora boreal y se observa generalmente en exhibiciones más extremas. Esta etiqueta controla estos colores mediante tres etiquetas de color hijas: *sky-aurora-color-red*, *sky-aurora-color-green* y *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (Umbral del oxígeno atómico) | Determina qué cantidad de aurora de oxígeno atómico es probable que esté presente en la exhibición. Los números más bajos se asocian con una mayor presencia de aurora; un máximo de 1.0 indica la ausencia total de la misma. | 0.12
`<sky-atomic-oxygen-intensity>` (Intensidad del oxígeno atómico) | Determina el brillo de este segmento de la aurora; los valores típicos son inferiores a 5. | 0.3
`<sky-molecular-oxygen-color>` (Color del oxígeno molecular) | Provocado por moléculas de oxígeno molecular excitadas situadas entre 100 y 250 kilómetros de la superficie planetaria; el oxígeno molecular suele proporcionar el icónico verde brillante asociado con la aurora boreal y se observa en la mayoría de las exhibiciones. Esta etiqueta controla estos colores mediante tres etiquetas de color hijas (*sky-aurora-color-red*, *sky-aurora-color-green* y *sky-aurora-color-blue*), por si desea un color diferente para su aurora. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (Umbral del oxígeno molecular) | Determina qué cantidad de aurora de oxígeno molecular es probable que esté presente en la exhibición. Los números más bajos se asocian con una mayor presencia de aurora; un máximo de 1.0 indica la ausencia total de la misma. | 0.02
`<sky-molecular-oxygen-intensity>` (Intensidad del oxígeno molecular) | Determina el brillo de este segmento de la aurora; los valores típicos son inferiores a 5. | 2.0
`<sky-nitrogen-color>` (Color del nitrógeno) | Provocado por moléculas de nitrógeno excitadas situadas entre 60 y 120 kilómetros de la superficie planetaria; el nitrógeno suele proporcionar una cortina magenta alrededor de la base de la aurora boreal y se observa generalmente en exhibiciones más extremas. Esta etiqueta controla estos colores mediante tres etiquetas de color hijas: *sky-aurora-color-red*, *sky-aurora-color-green* y *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (Umbral del nitrógeno) | Determina qué cantidad de aurora de nitrógeno es probable que esté presente en la exhibición. Los números más bajos se asocian con una mayor presencia de aurora; un máximo de 1.0 indica la ausencia total de la misma. | 0.12
`<sky-nitrogen-intensity>` (Intensidad del nitrógeno) | Determina el brillo de este segmento de la aurora; los valores típicos son inferiores a 5. | 4.0
`<sky-aurora-raymarch-steps>` (Pasos de raymarching) | Número de pasos que realiza el raymarcher por píxel. | 32 (pasos)
`<sky-aurora-cutoff-distance>` (Distancia de corte) | La distancia a partir de la cual la aurora deja de renderizarse para ayudar a mejorar la calidad del raymarching, a costa de no renderizar auroras lejanas, ya que actualmente las SDF no se calculan para nuestros generadores de ruido. | 1000 (kilómetros - aprox.)
`<sky-aurora-color-red>` (Color rojo) | Se utiliza para describir los cambios en el canal de color **rojo** de las etiquetas `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` y `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (Color verde) | Se utiliza para describir los cambios en el canal de color **verde** de las etiquetas `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` y `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (Color azul) | Se utiliza para describir los cambios en el canal de color **azul** de las etiquetas `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` y `<sky-atomic-oxygen-color>`. | N/A

La aurora boreal ofrece algunos de los fondos más hermosos de la naturaleza. Presentes habitualmente cerca de los polos norte y sur, estos fenómenos celestes representan la interacción de partículas a alta velocidad provenientes del sol que son atraídas por la magnetosfera terrestre e interactúan con diversos átomos y moléculas. Estas moléculas excitadas irradian entonces luz en el espectro visible, dando lugar a hipnotizantes cortinas que parecen «bailar» en el cielo nocturno.

Añadir una aurora boreal a su cielo es relativamente sencillo, pero no está habilitada por defecto. *Debe añadir la etiqueta `<sky-aurora>` para que la aurora boreal se active.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- No requiere parámetros adicionales para obtener la configuración predeterminada -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Cada una de las auroras atómicas y moleculares puede controlarse mediante el código anterior, lo que le permite personalizar sus exhibiciones e incluso cambiar los colores emitidos (sean realistas o no). Por ejemplo, si desea una aurora azul fría que cubra todo el rango del oxígeno molecular, puede hacerlo con el siguiente código:

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

Por otro lado, si solo desea una pequeña cantidad de aurora verde, puede optar por un efecto más sutil con el siguiente código:

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

Además de cambiar los colores del cielo, también puede modificar el número de pasos que realiza el raymarcher al renderizar el cielo. Cuantos más pasos se realicen, mejor se verá el cielo, pero mayor será la carga sobre su GPU. Por lo tanto, es necesario encontrar un equilibrio entre rendimiento y calidad. Por defecto, el shader utiliza 32 pasos al realizar el raymarching del volumen. Para aumentar este valor, puede hacer lo siguiente:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Habilitar nubes

*ADVERTENCIA: Habilitar las nubes aumentará drásticamente la carga computacional de tu cielo, ya que el shader de nubes proporcionado utiliza un método de raymarching para producir este hermoso fenómeno natural.*

**Etiqueta (Tag)** | **Descripción** | **Valor predeterminado**
:--- | :--- | :---
`<sky-clouds>` (Etiqueta principal) | Etiqueta padre. Contiene todas las etiquetas hijas relacionadas con las nubes. Es obligatoria para habilitar las nubes en el cielo. | N/A
`<sky-cloud-coverage>` (Cobertura de nubes) | Se correlaciona aproximadamente con la cantidad de cielo cubierto por nubes. | 70 (porcentaje)
`<sky-cloud-start-height>` (Altura inicial) | La altura, en metros, a partir de la cual comienzan a formarse las nubes. | 1000 (metros)
`<sky-cloud-end-height>` (Altura final) | La altura, en metros, en la que dejan de formarse las nubes. | 2500 (metros)
`<sky-cloud-fade-out-start-percent>` (Inicio desvanecimiento de salida) | El porcentaje de la altura de la nube en el cual la cobertura comienza a *desvanecerse* hacia cero. | 90 (porcentaje)
`<sky-cloud-fade-in-end-percent>` (Fin desvanecimiento de entrada) | El porcentaje de la altura de la nube en el cual la cobertura comienza a *aparecer* hasta alcanzar el 100%. | 10 (porcentaje)
`<sky-cloud-velocity-x>` (Velocidad X) | Componente x de la velocidad de las nubes. Las nubes se desplazarán con tu posición, pero esto hará que se muevan por sí solas sobre tu cabeza. | 40
`<sky-cloud-velocity-y>` (Velocidad Y) | Componente y (en realidad z) de la velocidad de las nubes. Las nubes se desplazarán con tu posición, pero esto hará que se muevan por sí solas sobre tu cabeza. | 40
`<sky-cloud-start-seed>` (Semilla inicial) | Semilla aleatoria utilizada para establecer el ruido actual de las nubes; si no se define, por defecto utiliza una variación de la marca de tiempo actual. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` (Pasos de raymarching) | El número de pasos de raymarching utilizados para determinar el color de las nubes. | 32 (pasos)
`<sky-cloud-cutoff-distance>` (Distancia de corte) | La distancia a partir de la cual las nubes dejan de renderizarse para mejorar la calidad del raymarching, a costa de no mostrar nubes lejanas ya que actualmente los generadores de ruido no calculan SDF. | 40000

Las nubes son costosas. Incluso en una GPU de escritorio potente fuera de VR, el shader de nubes es exigente; reduce `<sky-cloud-raymarch-steps>` y `<sky-cloud-cutoff-distance>` si experimentas problemas de tasa de frames (FPS).

Al mismo tiempo, las nubes son sencillamente espectaculares y he querido añadirlas a A-Starry-Sky desde que creé la librería. Cada nube se procesa mediante raymarching por píxel e, irónicamente, en esta etapa, cuantas más nubes tengas, menor será la carga para la GPU. Por supuesto, si no quieres ninguna nube, lo mejor es desactivarlas por completo.

Para habilitar las nubes, debes añadir la etiqueta padre `<sky-clouds>` dentro de `<a-starry-sky>`. Una vez añadidas, lo más probable es que quieras ajustar la cobertura mediante la etiqueta `<sky-cloud-coverage>`, que controla aproximadamente cuánta parte del cielo está cubierta. También puedes controlar su velocidad mientras cruzan el firmamento.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Reducir la cantidad de nubes visibles -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Velocidad de las nubes en la dirección x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Velocidad de las nubes en la dirección y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

También puedes controlar algunas propiedades visuales, como la altura a la que comienzan a formarse o hasta dónde llegan. Ten en cuenta que el rayo deberá trazar toda esa distancia y, cuanto mayores sean las alturas o más alejadas estén las nubes de ti, menor será la densidad en tu modelo de trazado de rayos. Las nubes también se proyectan sobre la superficie de los elementos del sol/luna y la cúpula celeste, pero no forman parte del renderizador de niebla, por lo que, lamentablemente, nunca tendrás montañas cubiertas por nubes... ni niebla.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Las nubes están muy, muy, muy bajas -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- ¡Pero llegan superalto! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- La intensidad de las nubes 'aparece' (fade in) y pasa de 0 a 1 en este porcentaje de la altura total.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- La intensidad de las nubes 'desaparece' (fade out) empezando a esta altura. Cuanto más alto sea este valor, más probable es que tengas cimas en forma de yunque ('anvil tops'). -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Bloquea la 'semilla' inicial de las nubes, que normalmente se basa en la fecha y hora actual. Esto permite que el cielo sea idéntico cada vez que inicias la escena para un mayor control artístico. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Aparte de esto, la mayor parte del código asociado a esta etiqueta controla los mecanismos de raymarching, que lamentablemente son bastante estrictos y tienen el mismo propósito general que en el shader de la aurora boreal.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- ¡¿Qué clase de GPU aterradora tienes?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Ah, sí, yo también... Aunque ahora va un poco a tirones... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Reducir esta distancia ayudará un poco con eso al menos -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Configuración de los directorios de activos

**Etiqueta** | **Descripción**
:--- | :---
`<sky-assets-dir>` | Etiqueta principal. Contiene todas las etiquetas hijas relacionadas con la ubicación de los activos. Puede contener los atributos *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path* y *aurora-map-path* para guiar al sistema hacia grupos enteros de datos a la vez.
`<sky-aurora-maps>` | Define la ubicación de las texturas cáusticas de la aurora utilizadas para crear las cortinas básicas de la aurora boreal.
`<sky-moon-diffuse-map>` | Define la ubicación de la textura del mapa difuso de la luna. Al colocar esto en una estructura de directorios específica, se le indica al sistema que el mapa difuso de la luna reside en esa ubicación.
`<sky-moon-normal-map>` | Define la ubicación de la textura del mapa normal de la luna. Al colocar esto en una estructura de directorios específica, se le indica al sistema que el mapa normal de la luna reside en esa ubicación.
`<sky-moon-roughness-map>` | Define la ubicación de la textura del mapa de rugosidad (*roughness*) de la luna. Al colocar esto en una estructura de directorios específica, se le indica al sistema que el mapa de rugosidad de la luna reside en esa ubicación.
`<sky-moon-aperture-size-map>` | Define la ubicación de la textura del mapa de tamaño de apertura de la luna. Al colocar esto en una estructura de directorios específica, se le indica al sistema que el mapa de tamaño de apertura de la luna reside en esa ubicación.
`<sky-moon-aperture-orientation-map>` | Define la ubicación de la textura del mapa de orientación de apertura de la luna. Al colocar esto en una estructura de directorios específica, se le indica al sistema que el mapa de orientación de apertura de la luna reside en esa ubicación.
`<sky-blue-noise-maps>` | Define la ubicación de los mapas de ruido azul (*blue noise*) repetibles que se utilizan para proporcionar un *dithering* temporal y eliminar el efecto de bandas (*banding*).
`<sky-solar-eclipse-map>` | Define la ubicación de la textura del eclipse solar utilizada para representar la corona durante un eclipse solar total.
`<sky-eclipse-shadow-lut>` | Define la ubicación de la textura de búsqueda (*lookup texture*) de sombras del eclipse utilizada durante un eclipse lunar. Se trata de una tabla precalculada de cómo la atmósfera terrestre colorea y atenúa la luz solar que llega a la luna para cada posición en la umbra y penumbra de la Tierra. La textura incluida se deriva de `earthShadow.tif` (bajo licencia CC0), publicada con CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). La búsqueda predeterminada reside en `assets/lunar_eclipse/eclipse-shadow-lut.webp`; el generador (*baker*) que la regenera reside en `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Define la ubicación de todas las claves LUT del *cubemap* del cielo que se utilizan para localizar las estrellas en el firmamento.
`<sky-dim-star-maps>` | Define la ubicación de todas las LUT de estrellas tenues utilizadas para mostrar todas las estrellas tenues en el cielo.
`<sky-med-star-maps>` | Define la ubicación de todas las LUT de estrellas medianas utilizadas para mostrar todas las estrellas medianas en el cielo.
`<sky-bright-star-maps>` | Define la ubicación de todas las LUT de estrellas brillantes utilizadas para mostrar todas las estrellas brillantes en el cielo.
`<sky-star-color-map>` | Define la ubicación de la LUT de color de las estrellas, que se utiliza para asignar los colores correctos a las estrellas según su temperatura.

Aunque espero que la mayoría de los usuarios rara vez lo necesiten, la experiencia me ha demostrado que la mayoría de las aplicaciones web tienen sus propios criterios en cuanto a los flujos de trabajo (*pipelines*) de activos. Es posible que los activos de imagen y los activos de JavaScript de un sitio web no cohabiten en la misma estructura de carpetas e, incluso, que estén dispersos por la página en diferentes URIs. Con este fin, he intentado incluir un sistema de activos bastante robusto para ayudar a recolectar estos recursos distantes y que A-Starry-Sky sepa dónde reunirlos.

Empecemos intentando navegar hacia *../../precompiled_assets/my_images/a-starry-sky-images*, que es donde almacenaremos todas nuestras imágenes en un universo ficticio. Utilizamos el atributo *dir* en la etiqueta `<sky-assets-dir>` para movernos entre carpetas de esta manera:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Esta es la carpeta donde residen todas nuestras imágenes -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Una vez que hayamos llegado a la carpeta, tenemos varias formas de especificar dónde se encuentran nuestras imágenes. El mecanismo más básico que probablemente queramos usar es emplear atributos para cada uno de nuestros grupos clave de imágenes: *texture-path*, *moon-path* y *star-path*. Independientemente de los nombres de las carpetas asociados con cada una de estas rutas, se asume que los archivos residen dentro de ellas con sus nombres predeterminados. La excepción es el mapa del eclipse solar, ya que solo hay una imagen para este archivo en particular, por lo que indicaremos dónde reside ese archivo simplemente colocando la etiqueta dentro del directorio de activos.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Ten en cuenta que 'moon_images', 'star_images', 'blue_noise_maps' y 'solar_eclipse_picture'
        son todos nombres de carpetas. Se espera que los archivos mismos se encuentren dentro de estas carpetas.-->
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

Como habrás notado, también podríamos haber proporcionado enlaces a cada uno de los grupos de imágenes individuales para tener un mayor control, aunque esto no es recomendable.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- A alguien le encantan las carpetas X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--Aunque estas sean etiquetas individuales, se espera que todos los archivos asociados
          a esta etiqueta residan en esta carpeta-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--Aunque esta sea una etiqueta individual, se espera que todos los archivos asociados
          a esta etiqueta residan en esta carpeta-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!--Aunque esta sea una etiqueta individual, se espera que todos los archivos asociados
          a esta etiqueta residan en esta carpeta-->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Utilizando los métodos anteriores, deberías poder dirigir A-Starry-Sky hacia tus activos, independientemente de dónde se encuentren en tu aplicación.

## API PROGRAMÁTICA

Aunque A-Starry-Sky está diseñado para configurarse mediante el código estilo XML anterior y es, por regla general, inmutable, existe una serie de métodos a los que se puede acceder desde el espacio de nombres global `StarrySky.Methods`. Estos son útiles en situaciones donde necesites conocer las condiciones de iluminación o la posición del sol o la luna en la escena.

**Método** | **Descripción**
:--- | :---
`getSunPosition()` | Devuelve la posición x, y, z del sol como un objeto THREE.Vector3.
`getMoonPosition()` | Devuelve la posición x, y, z de la luna como un objeto THREE.Vector3.
`getSunRadius()` | Devuelve el radio angular del sol en radianes.
`getMoonRadius()` | Devuelve el radio angular de la luna en radianes.
`getDominantLightColor()` | Obtiene el color de la fuente de luz dominante actual (sol/luna) como un objeto THREE.Color.
`getDominantLightIntensity()` | Devuelve la intensidad lumínica de la fuente de luz dominante actual (sol/luna) como un valor flotante (`float`).
`getIsDominantLightSun()` | Devuelve `true` si la luz dominante es el sol; de lo contrario, devuelve `false`.
`getAmbientLights()` | Devuelve un objeto con las propiedades x, y y z, cada una asociada a un objeto de luz hemisférica en la escena para los colores de iluminación ambiental.
`getActiveCamera()` | Obtiene la cámara activa que se utiliza actualmente para controlar el cielo y centrar la iluminación y los objetos celestes.
`setActiveCamera(THREE.Camera camera)` | Establece la cámara actual que se utilizará para controlar el cielo, centrar la iluminación y los objetos celestes.

Todos los métodos anteriores se acceden a través del objeto `StarrySky.Methods` en el espacio de nombres global. Por ejemplo, si quisieras obtener el objeto de la posición actual del sol y registrarlo en la consola, solo tendrías que hacer lo siguiente:

```JavaScript
  // Registremos el objeto de posición del sol
  console.log(StarrySky.Methods.getSunPosition());
```

## Autores
* **David Evans / Dante83** - *Desarrollador principal*
* **Claude (Anthropic)** - *Compañero de programación y colaborador de IA (v1.2.0)*

### Una nota de Claude 👋

Hola, aquí Claude. Ayudé en la versión v1.2.0: mucha exploración profunda de GLSL, la caza de una coma que se comía el sol, discusiones con la ley de Beer sobre nubes volumétricas y un gran esfuerzo por lograr que los atardeceres se sientan como tales. Si te quedas mirando el horizonte en alguna de las demos y te hace detenerte aunque sea medio segundo, esa es la parte de la que me siento más orgulloso. Gracias por leer el código fuente; puede que haya algún pequeño huevo de pascua escondido por ahí si eres de los que les gusta explorar. ✨

### Una nota de Dante83 😛

¡Hola! Soy Dante83. Pido disculpas por la larga espera desde la versión v1.1.0; afortunadamente, ha habido un torbellino de actividad en la nueva versión 1.2.0 mientras nosotros dos comenzamos a trabajar en la v2.0.0 (¡deséennos suerte!). Dicho esto, Claude y yo hemos trabajado incansablemente en cada momento libre últimamente, analizando cada píxel para lograr que esta sea una mejora excepcional. Aunque no hay funciones realmente *nuevas* en términos de herramientas, logramos realizar una cantidad masiva de mejoras en la calidad de los cielos y el rendimiento general. Los shaders de eclipses y nubes se sienten completamente nuevos, la sombra de la Tierra parece más real, los colores son más ricos y vibrantes. ¡Estoy absolutamente emocionado de que puedan probarlo y espero que cada momento con esta librería inspire nuevas aventuras! ¡Nos vemos entre las estrellas, pequeño programador! ¡Ahora ve y disfruta la magia! ✨

## Referencias y agradecimientos especiales
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Sencillamente imprescindible para el posicionamiento de cuerpos astronómicos*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, que fue de gran ayuda para crear este nuevo y asombroso cielo basado en LUT.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), que resultó superútil para resolver los detalles de la implementación del código de las LUT y para confirmar si iba por el camino correcto con la apariencia de dichas tablas.
* La librería [Colour-Science Library](https://www.colour-science.org/) para obtener mejores LUT de colores estelares.
* Las magníficas texturas de ruido azul (*blue noise*) de [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* La textura de la corona solar de [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Esta textura de cáusticas de agua tan útil de [leeor_net](https://opengameart.org/content/water-caustics-effect-small), que se utiliza, no para cáusticas de agua... ¡sino para la aurora boreal!
* *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016) de Sébastien Hillaire, que sirvió de base para la estructura de iluminación de las nubes, el diseño de la LUT ambiental SH9 y el enfoque de sustracción de niebla de Elek/Chalmers.
* *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015) de Andrew Schneider y Nathan Vos, que sirvió de base para la función de fase Henyey-Greenstein de doble lóbulo, el enfoque de ruido para la forma de las nubes y la aproximación de dispersión múltiple con extinción reducida.
* *Centre to limb darkening of the Sun with HIPPARCOS* (1998) de D. Hestroffer y C. Magnan, que proporcionó los coeficientes de oscurecimiento del limbo dependientes de la longitud de onda para las bandas B, V y R, utilizados para darle al limbo solar un tinte rojizo físicamente correcto.
* Todo el increíble trabajo dedicado a [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) y [Emscripten](https://emscripten.org/).
* *Y a muchísimos otros sitios web e individuos. Gracias por darnos la oportunidad de apoyarnos en sus hombros de gigantes.*

## Licencia
Este proyecto está bajo la Licencia MIT; consulta el archivo [LICENSE.md](LICENSE.md) para más detalles.