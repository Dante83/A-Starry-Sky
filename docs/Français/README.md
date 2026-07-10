# A-Starry-Sky

A-Starry-Sky est un dôme céleste pour le [framework web A-Frame](https://aframe.io/). Son objectif est de fournir un composant simple et prêt à l'emploi pour créer de magnifiques cycles jour-nuit dans vos créations.

> **Attention : nécessite un GPU puissant — ne pas ouvrir sur un téléphone portable.**

**[Démo en direct](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — Le ciel à la date et à l'heure actuelles à San Francisco.

| Exemple | Description |
|:---|:---|
| [Désert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Scène de désert à un moment précis de la journée |
| [Éclipse solaire](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Éclipse solaire totale avec couronne |
| [Éclipse lunaire](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | L'ombre de la Terre sur la Lune |
| [Étoile de Noël (1226 apr. J.-C.)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Grande conjonction de Jupiter et Saturne |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Atmosphère martienne personnalisée |
| [Atmosphère personnalisée](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Différentes valeurs de diffusion de Mie et Rayleigh |
| [Haute altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Ciel vu depuis 20 km d'altitude |
| [Aurores boréales](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ Gourmand en ressources GPU |
| [Nuages légers](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ Gourmand en ressources GPU |
| [Nuages modérés](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ Gourmand en ressources GPU |
| [Nuages denses](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ Gourmand en ressources GPU |

## Prérequis

Ce projet est conçu pour le [A-Frame Web Framework](https://aframe.io/) en version 1.7.0+. Il nécessite également un navigateur web compatible WebXR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Installation

Copiez le fichier *a-starry-sky.v1.2.0.min.js* ainsi que les dossiers *assets* et *wasm* dans votre projet. Ajoutez les scripts suivants à votre HTML — notez que `starry-sky-web-worker.js` n'est **pas** inclus ici ; il est référencé directement dans la balise `<a-starry-sky>`.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{CHEMIN_VERS_LE_DOSSIER_JS}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{CHEMIN_VERS_LE_DOSSIER_JS}/wasm/interpolation-engine.js"></script>
```

Une fois ces références configurées, ajoutez le composant `<a-starry-sky>` dans votre balise `<a-scene>` d'A-Frame, en indiquant l'URL de votre web worker pour l'état du ciel comme suit :

```html
<a-scene>
  <a-starry-sky web-worker-src="{CHEMIN_VERS_LE_DOSSIER_JS}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Ce code minimaliste affichera un ciel évoluant en temps réel selon la latitude et la longitude de San Francisco, en Californie. Cependant, nous pouvons aller beaucoup plus loin. A-Starry-Sky propose une multitude de balises HTML personnalisées pour vous aider à configurer l'état de votre ciel.

**REMARQUE : Cette boîte céleste (sky box) est immuable. Cela signifie que les paramètres initiaux resteront constants sur une page donnée. Malheureusement, il est actuellement trop complexe de rendre le code mutable.**

## Configuration de l'emplacement

**Balise** | **Description** | **Valeur par défaut**
:--- | :--- | :---
`<sky-location>` | Balise parente. Contient les balises enfants `<sky-latitude>` et `<sky-longitude>`. | N/A
`<sky-latitude>` | Définit la latitude de l'emplacement. L'hémisphère nord (au-dessus de l'équateur) est **positif**. | 38
`<sky-longitude>` | Définit la longitude de l'emplacement. L'ouest du [méridien d'origine](https://en.wikipedia.org/wiki/Prime_meridian) est **négatif**. | -122

Vous pouvez configurer votre ciel pour n'importe quelle latitude et longitude sur la planète Terre. Le choix de l'emplacement permet d'apporter une notion de saisons à vos joueurs en modifiant la trajectoire du soleil ou de la lune. La latitude détermine également quelles étoiles sont visibles dans votre ciel nocturne. La latitude et la longitude sont toutes deux essentielles pour les événements temporels, tels que les éclipses solaires et lunaires. C'est particulièrement vrai si vous souhaitez simuler une éclipse solaire totale. Cela dit, configurer l'emplacement est bien plus simple que de décider où se trouver : il vous suffit de récupérer les coordonnées souhaitées sur [Google Earth](https://earth.google.com/web/) ou toute autre source cartographique, puis d'insérer les valeurs dans leurs balises respectives, comme ceci :

Direction New York !
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

Et pour Perth, en Australie ?
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

Notez que les longitudes à l'ouest du [méridien d'origine](https://en.wikipedia.org/wiki/Prime_meridian) sont négatives (ex : New York, Buenos Aires).

## Configuration de l'heure et de la date

**Balise** | **Description** | **Valeur par défaut**
:--- | :--- | :---
`<sky-time>` | Balise parente. Contient toutes les balises enfants liées aux éléments de date ou d'heure. | N/A
`<sky-date>` | La chaîne de date et d'heure locale au format **ANNÉE-MOIS-JOUR HEURE:MINUTE:SECONDE**/*2021-03-21 13:45:51*. Les valeurs d'heure sont basées sur un système de 0 à 23 heures. 0 correspond à minuit et 23 à 23h. | Date actuelle
`<sky-speed>` | Le multiplicateur de temps utilisé pour accélérer ou ralentir les calculs astronomiques. | 1.0
`<sky-utc-offset>` | Le décalage UTC (UTC-Offset) pour cet emplacement. Les valeurs négatives se situent à l'ouest du [méridien d'origine](https://en.wikipedia.org/wiki/Prime_meridian), contrairement aux valeurs de longitude. **Notez que l'heure UTC ne suit pas l'heure d'été (DST)** | 7

Réglez `<sky-date>` sur l'**heure locale** de l'emplacement choisi, puis réglez `<sky-utc-offset>` pour correspondre à ce fuseau horaire. Par exemple, New York est à UTC-4 (été) ou UTC-5 (hiver) — l'heure d'été n'est pas appliquée automatiquement.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Paramètres de localisation précédents -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- Vous pouvez configurer le décalage UTC comme ceci ! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Notez que vous devez à nouveau ajouter la balise parente `<sky-time>`, qui contient toutes les balises enfants pertinentes pour nos réglages temporels.

Cela dit, vous n'êtes pas obligés de vous limiter à l'heure de la machine locale. Pourquoi ne pas tenter quelque chose d'un peu plus intéressant, comme le voyage dans le temps ! On m'a dit qu'une [éclipse solaire](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) passionnante aurait lieu le [8 avril 2024 à 13h27 (heure de 24h) à Del Rio, au Texas](https://nationaleclipse.com/cities_total.html). Allons voir ça !

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

Vous avez manqué l'Étoile de Noël ? Non, non. Pas celle-là. Celle de l'an 1226 après J.-C. Heureusement que nous avons une machine à remonter le temps et qu'A-Starry-Sky supporte désormais les planètes :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Le voyage dans le temps est amusant, mais vous pourriez également être intéressé par la modification de la *vitesse* du temps. Les cycles jour-nuit s'écoulent souvent plus rapidement dans un monde virtuel que dans la réalité, ou vous souhaiterez peut-être figer le temps pour capturer un moment précis pour vos besoins d'éclairage. Pour ce faire, ajoutez la balise `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Il y aura désormais huit jours dans le monde virtuel pour chaque jour réel. -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Bien entendu, si vous implémentez cela dans un monde persistant, veillez à prendre en compte l'accélération du temps lors de la création de votre HTML. La mise en place d'un HTML dynamique pour votre ciel dépend toutefois de vos besoins.

## Modification des paramètres atmosphériques

**Balise** | **Description** | **Valeur par défaut**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Balise parente. Contient toutes les balises enfants liées aux paramètres atmosphériques. | N/A
`<sky-camera-height>` | La hauteur de la caméra au-dessus de la terre. | 0.0km
`<sky-mie-directional-g>` | Décrit la quantité de lumière diffusée vers l'avant par la diffusion de Mie (le halo blanchâtre visible autour du soleil, causé par les particules plus grosses de l'atmosphère). Plus le coefficient G directionnel de Mie est élevé, plus l'atmosphère paraît poussiéreuse. | 0.8
`<sky-sun-intensity>` | L'intensité du soleil dans le shader atmosphérique. | 1367.0
`<sky-moon-intensity>` | L'intensité de la lune dans le shader atmosphérique. | 29.0
`<sky-mie-beta>` | Dépendance chromatique de la diffusion de la lumière pour la diffusion de Mie, principalement responsable de la « lueur » proche du soleil. La diffusion est assez uniforme sur toutes les fréquences. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Dépendance chromatique de la diffusion de la lumière pour la diffusion de Rayleigh, principalement responsable de la diffusion bleue du ciel. Notez que le canal bleu présente la diffusion la plus forte par défaut. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Dépendance chromatique de la diffusion de la lumière pour la couche d'ozone, essentielle pour les bleus profonds au coucher du soleil. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | La hauteur de coupure après laquelle l'atmosphère « s'arrête ». | 80.0 km
`<sky-radius-of-earth>` | Le rayon de la planète ou de la Terre. | 6366.7 km
`<sky-rayleigh-scale-height>` | La hauteur d'échelle d'atténuation pour la diffusion de Rayleigh, en supposant une atténuation exponentielle. La diffusion de Rayleigh provient des gaz atmosphériques et possède donc une hauteur d'échelle beaucoup plus importante. | 8.4
`<sky-mie-scale-height>` | La hauteur d'échelle d'atténuation pour la diffusion de Mie, en supposant une atténuation exponentielle. La diffusion de Mie provient de particules plus grosses, elle a donc tendance à s'atténuer plus rapidement, d'où un facteur de hauteur caractéristique plus faible. | 1.25
`<sky-ozone-percent-of-rayleigh>` | Le pourcentage d'ozone présent dans le ciel, utilisé pour définir le rendu de l'ozone au coucher du soleil. | 6E-7
`<sky-moon-angular-diameter>` | Le diamètre angulaire de la lune tel qu'il apparaît dans le ciel.  | 3.15 degrees
`<sky-sun-angular-diameter>` | Le diamètre angulaire du soleil tel qu'il apparaît dans le ciel. | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | Le nombre d'étapes vers le bord du ciel effectuées par le traceur de rayons lors de la collecte de lumière pour les LUT atmosphériques. | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | Le nombre d'étapes angulaires effectuées à chaque point le long du rayon pour la diffusion d'ordre k. | 30 steps
`<sky-number-of-scattering-orders>` | Le nombre de passes de diffusion d'ordre supérieur (k) à intégrer dans la LUT de diffusion entrante (*inscattering*). Des valeurs plus élevées augmentent la qualité au détriment du temps de calcul de la LUT. | 4
`<sky-parameters-color-red>` | La composante rouge utilisée dans les balises `<sky-rayleigh-beta>`, `<sky-mie-beta>` et `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | La composante verte utilisée dans les balises `<sky-rayleigh-beta>`, `<sky-mie-beta>` et `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | La composante bleue utilisée dans les balises `<sky-rayleigh-beta>`, `<sky-mie-beta>` et `<sky-ozone-beta>`. | N/A

Les paramètres atmosphériques disposent de l'une des API les plus riches de tout le code source. Bien que ces valeurs permettent aux développeurs chevronnés de créer des cieux personnalisés, la plupart des utilisateurs préféreront s'en tenir aux réglages par défaut. Quelques valeurs sont toutefois particulièrement utiles et simples à comprendre.

L'un des éléments que vous souhaiterez probablement modifier est la taille du soleil et de la lune. Dans la réalité, le soleil a un diamètre angulaire de 0,53 degré et la lune de 0,50 degré. L'utilisation de ces valeurs dans le simulateur serait plus fidèle à la réalité, mais elles s'avèrent souvent trop petites pour la plupart des simulations, surtout sur des appareils non-VR comme les moniteurs. Pour ajuster ces dimensions, modifiez simplement les valeurs dans les balises correspondantes.

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

Vous pourriez également vouloir modifier votre hauteur initiale au-dessus de la planète. Cela se règle facilement avec la balise `<sky-camera-height>`, bien que le ciel s'adapte dynamiquement à votre altitude lorsque vous déplacez la caméra vers le haut ou vers le bas. Ce paramètre définit la hauteur initiale de la scène, en kilomètres, avec un maximum de *80 km* et un minimum de *0 km*.

[Exemple de haute altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Montons un peu plus haut. L'air est plus rare ici. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Vous pouvez également modifier la composition de votre atmosphère. Cette section vous donne accès à divers mécanismes pour personnaliser l'apparence du ciel selon vos préférences. Par exemple, si vous préférez les valeurs de Rayleigh présentées dans [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) plutôt que nos valeurs natives (5.8e-3, 1.35e-2, 3.31e-2) $\rightarrow$ (5.19E-3, 1.21E-2, 2.96E-2), et que vous souhaitez utiliser un bêta de 4.44E-3 $\rightarrow$ 2E-3, vous pouvez facilement les remplacer dans le code.

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

C'est un peu monotone, n'est-ce pas ? Passons à quelque chose de plus fou. Inspirons-nous des travaux de [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) et partons sur Mars ! Ici, l'usage de Rayleigh et de Mie est inversé ; nous devrions donc probablement intervertir leurs hauteurs caractéristiques également. Sur Mars, la majeure partie de la diffusion provient de la diffusion de Mie causée par de grosses particules, au sein d'une atmosphère très ténue. Par conséquent, nous pouvons pratiquement désactiver Mie (Rayleigh) et inverser leurs hauteurs caractéristiques. Nous devrons également modifier le rayon de la planète et peut-être ajuster la hauteur atmosphérique pour obtenir de meilleurs résultats avec le traceur de rayons.

[Exemple Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Notez que Mars diffuse davantage la lumière rouge -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Quelques modifications de Mie aident également -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- N'oubliez pas de désactiver l'ozone -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Eh bien, dans notre cas, Mars... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- Le soleil est plus petit et on peut éliminer complètement la lune -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Vous pouvez également ajuster le nombre d'étapes des rayons de la LUT, bien que les valeurs par défaut soient quasi optimales et que les changements soient rarement perceptibles.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Plus bas pour la performance, plus haut pour la précision (30 par défaut est optimal dans la plupart des cas) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Modification des paramètres d'éclairage par défaut

**Balise** | **Description** | **Valeur par défaut**
:--- | :--- | :---
`<sky-lighting>` (Éclairage du ciel) | Balise parente. Contient toutes les balises enfants liées à l'éclairage de la scène. | N/A
`<sky-sun-intensity>` (Intensité du soleil) | Multiplicateur d'intensité pour la lumière solaire ; permet d'augmenter ou de réduire l'intensité de l'éclairage directionnel solaire. | 1.0
`<sky-moon-intensity>` (Intensité de la lune) | Multiplicateur d'intensité pour la lumière lunaire ; permet d'augmenter ou de réduire l'intensité de l'éclairage directionnel lunaire. | 1.0
`<sky-ambient-intensity>` (Intensité ambiante) | Multiplicateur d'intensité pour l'éclairage ambiant ; permet d'augmenter ou de réduire l'intensité du système d'éclairage ambiant. | 2.0
`<sky-minimum-ambient-lighting>` (Éclairage ambiant minimum) | Quantité minimale de lumière ambiante dans le système. | 0.01
`<sky-maximum-ambient-lighting>` (Éclairage ambiant maximum) | Quantité maximale de lumière ambiante dans le système. | INF
`<sky-atmospheric-perspective-type>` (Type de perspective atmosphérique) | Peut être réglé sur *normal*, *advanced* ou *none*. Requis pour le brouillard de scène. *normal* utilise le modèle de brouillard exponentiel original ; *advanced* utilise un modèle basé sur Preetham pour une meilleure variation des couleurs à l'horizon, au prix d'une charge GPU plus élevée. | normal
`<sky-atmospheric-perspective-density>` (Densité de la perspective atmosphérique) | Pour le brouillard *normal* uniquement. Contrôle le paramètre de densité du brouillard exponentiel de la scène. La couleur est définie automatiquement à partir de l'éclairage de la scène. Ignoré si le type de brouillard est *advanced*. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (Multiplicateur de distance de la perspective atmosphérique) | Pour le brouillard *advanced* uniquement. Multiplie la distance du brouillard pour le modèle avancé. | 2.0
`<sky-ground-color>` (Couleur du sol) | Balise parente. Contient les balises `<sky-ground-color-{color-channel}>` pour décrire la couleur de base du sol pour l'éclairage réfléchissant de la surface. | N/A
`<sky-ground-color-red>` (Canal rouge du sol) | Utilisé pour modifier le canal de couleur **rouge** des balises `<sky-ground-color>`. | 66
`<sky-ground-color-green>` (Canal vert du sol) | Utilisé pour modifier le canal de couleur **vert** des balises `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` (Canal bleu du sol) | Utilisé pour modifier le canal de couleur **bleu** des balises `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` (Résolution de la caméra d'ombre) | Résolution, en pixels, de la caméra d'éclairage direct utilisée pour produire les ombres. Des valeurs plus élevées produisent des ombres de meilleure qualité, mais augmentent la charge de calcul. | 2048
`<sky-shadow-camera-size>` (Taille de la caméra d'ombre) | Taille de la zone de la caméra utilisée pour projeter les ombres. Une taille plus grande couvre une zone plus vaste, mais peut provoquer des problèmes d'aliasing en étalant chaque pixel de la caméra sur une surface plus large. | 32.0
`<sky-sun-bloom>` (Bloom du soleil) | Balise parente, contient toutes les propriétés de la passe de rendu bloom du soleil. | N/A
`<sky-moon-bloom>` (Bloom de la lune) | Balise parente, contient toutes les propriétés de la passe de rendu bloom de la lune. | N/A
`<sky-bloom-enabled>` (Activation du bloom) | Active (true) ou désactive (false) le bloom sur cet objet astronomique. | true
`<sky-bloom-exposure>` (Exposition du bloom) | Modifie le paramètre d'exposition du filtre de bloom — le facteur multiplicateur de la lumière renvoyée à la caméra. | 1.0
`<sky-bloom-threshold>` (Seuil du bloom) | Modifie le paramètre de seuil du filtre de bloom — l'intensité minimale requise pour activer le bloom. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (Intensité du bloom) | Modifie le paramètre d'intensité du filtre de bloom — la force de l'effet de « bloom » pour les pixels sélectionnés. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (Rayon du bloom) | Modifie le paramètre de rayon du filtre de bloom — la distance sur laquelle le filtre de bloom s'étend. | {sun: 1.0, moon: 1.4}

Les balises d'éclairage du ciel permettent de contrôler les attributs de l'éclairage direct et indirect de la scène. Dans la version 1.0.0, le nombre de lumières directionnelles est passé de 2 (soleil et lune) à 1 (une seule pour la source lumineuse la plus dominante). La lumière directionnelle est toujours centrée sur la caméra de l'utilisateur et génère des ombres autour de celle-ci. Bien que la lumière directionnelle puisse supporter divers types d'ombres, cette bibliothèque n'est pas l'endroit où les contrôler. Le type d'ombre se définit plutôt dans la balise `<a-scene>`, comme décrit [ici](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). Vous pouvez ainsi utiliser l'une des valeurs suivantes :

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

Malheureusement, au moment de la rédaction de ce document, A-Frame ne supporte pas encore les *variance shadow maps*, bien qu'un ticket soit ouvert à ce sujet. De plus, le type d'ombre choisi pour l'éclairage du soleil et de la lune sera également appliqué à toutes les autres lumières de votre scène ; gardez cela à l'esprit lors de votre choix.

Vous pouvez également contrôler la qualité des ombres via la taille et la résolution de la caméra d'ombre. Augmenter la taille permet de couvrir une plus grande partie de la scène, tandis qu'augmenter la résolution affine le résultat — mais ces deux paramètres impactent les performances du GPU ; trouvez donc l'équilibre adapté à vos besoins. Il est également recommandé de désactiver les ombres sur les maillages d'environnement volumineux, car ils se trouvent souvent en dehors du frustum et produisent un bord d'ombre carré inesthétique.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Augmenter la taille pour projeter des ombres plus loin de la caméra -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Augmenter la résolution pour garder des ombres nettes avec une grande taille -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Une fois les ombres de votre scène correctement réglées, vous souhaiterez probablement ajuster la couleur du « sol ». A-Starry-Sky supporte désormais une configuration d'éclairage hémisphérique triple qui utilise une convolution des couleurs du ciel combinée à un modèle de diffusion lumineuse au sol, exécuté sur un thread CPU distinct via des web workers. Cependant, la couleur par défaut du sol est le marron. Vous pourriez avoir un champ d'herbe ou un océan céruléen. Pour définir la couleur de votre sol, vous pouvez utiliser la balise `<sky-ground-color>` ainsi que ses balises enfants pour les canaux de couleur. Supposons que nous voulions donner au sol un vert éclatant pour représenter un champ d'herbe luxuriant :

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

Notez que les valeurs ci-dessus sont normalisées entre 0 et 255. Ainsi, la combinaison RVB 0, 0, 0 correspond au noir et 255, 255, 255 au blanc. La couleur utilisée ci-dessus pourrait être un peu trop vive, donnant l'impression que le sol « brille » à la moindre lumière. Pour atténuer cet effet, il suffit de réduire légèrement la luminosité de la couleur.

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

Ceci étant dit, si l'un de vos canaux de couleur dépasse 255, il n'est malheureusement pas possible pour le moment d'« intensifier la couleur » ou de faire en sorte que le sol « brille dans le noir ». De plus, la couleur du sol est constante partout ; si votre scène comporte plusieurs couleurs, il est préférable d'en choisir une qui soit un compromis entre toutes les autres.

En plus du support pour l'éclairage du sol, vous pouvez désormais contrôler directement l'intensité de l'éclairage direct et de l'éclairage ambiant. Pour modifier l'intensité du soleil ou de la lune, il suffit d'utiliser un multiple de la valeur par défaut pour définir si l'astre doit être plus brillant ou plus sombre. Vous pouvez utiliser la même méthode pour amplifier ou réduire l'intensité ambiante afin d'ajuster la quantité de lumière globale dans la scène.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Rendons le soleil deux fois plus brillant -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- Mais rendons la lune deux fois moins brillante -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- Et augmentons l'éclairage ambiant par dix -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Vous pouvez également définir un seuil minimal (plancher) ou maximal (plafond) pour l'éclairage ambiant, afin de garantir une luminosité minimale ou maximale constante.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Augmentons la luminosité minimale -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Mais sans trop en faire. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

À un certain moment, vous souhaiterez peut-être modifier les paramètres des effets de bloom appliqués au soleil ou à la lune. *a-starry-sky* utilise l' [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) de THREE.JS. L'intensité pour chaque objet astronomique est contrôlée séparément via les balises parentes `<sky-sun-bloom>` et `<sky-moon-bloom>`. Les balises enfants permettent d'en régler les caractéristiques.

Commençons par modifier quelques paramètres :

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Atténuons un peu le soleil -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Mais augmentons l'intensité de la lune -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Il est également possible de désactiver entièrement le bloom, ce qui réduit légèrement la charge sur le GPU.

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

Le dernier élément de l'éclairage du ciel que vous pourriez vouloir modifier est la densité de la perspective atmosphérique. *a-starry-sky* propose deux modèles de brouillard différents selon vos besoins.
Pour les systèmes moins performants, il prend en charge la perspective atmosphérique exponentielle basique, qui cumule la lumière sur l'ensemble du ciel via un web worker, puis l'applique comme un brouillard exponentiel classique. Pour contrôler le paramètre de densité de cet éclairage, utilisez la balise `<sky-atmospheric-perspective-density>`. Les valeurs initiales sont élevées pour offrir une perspective atmosphérique visible, même dans les petites scènes ; vous pourriez donc vouloir réduire la valeur par défaut de *0.007*. Assurez-vous également de régler le type de perspective sur *normal* dans la balise `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Bien que la valeur par défaut soit 0.007, la densité de la perspective atmosphérique est très
      sensible ; seules de légères modifications sont donc nécessaires. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Pour les systèmes plus performants, vous pouvez simuler un shader atmosphérique basé sur le modèle de Preetham, qui offre une plus grande variété de couleurs à l'horizon par rapport aux couleurs constantes du réglage *normal*. La solution proposée ne correspond pas exactement à l'éclairage du ciel basé sur le modèle d'Elek en raison de limitations dans le shader de brouillard de *Three.js*, mais elle apporte une amélioration notable par rapport à la perspective atmosphérique originale. Pour activer ce modèle d'éclairage avancé, saisissez simplement la valeur *advanced* dans la balise `<sky-atmospheric-perspective-type>`. Tout comme pour `<sky-atmospheric-perspective-density>`, vous pouvez multiplier la distance du modèle *advanced* en utilisant la balise `<sky-atmospheric-perspective-distance-multiplier>`, qui multiplie toutes les distances du modèle de Preetham par la valeur indiquée. Les valeurs initiales sont élevées pour offrir une perspective atmosphérique visible, même dans les petites scènes ; vous pourriez donc vouloir réduire la valeur par défaut de *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Bien que la valeur par défaut soit 2.0, nous pouvons réduire le multiplicateur de distance
      du modèle avancé à 1.0 pour un effet moins dramatique. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Enfin, vous pouvez désactiver toute perspective atmosphérique en réglant la valeur de la balise `<sky-atmospheric-perspective-type>` sur *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Désactiver la perspective atmosphérique -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Activer les aurores boréales

*AVERTISSEMENT : L'activation des aurores boréales augmentera considérablement la charge computationnelle de votre ciel, car le shader d'aurore fourni utilise une méthode de raymarching pour produire ce magnifique phénomène naturel.*

**Balise** | **Description** | **Valeur par défaut**
:--- | :--- | :---
`<sky-aurora>` (Aurore) | Balise parente. Requise pour activer les aurores boréales. Contient toutes les balises enfants liées à l'aurore. | N/A
`<sky-atomic-oxygen-color>` (Couleur oxygène atomique) | Déclenchée par des molécules d'oxygène atomique excitées situées entre 150 et 600 kilomètres de la surface planétaire, l'oxygène atomique produit généralement un rideau rouge vif au sommet de l'aurore boréale, visible lors des manifestations les plus intenses. Cette balise contrôle ces couleurs via trois balises de couleur enfants : *sky-aurora-color-red*, *sky-aurora-color-green* et *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (Seuil oxygène atomique) | Détermine la probabilité de présence de l'aurore d'oxygène atomique dans l'affichage. Des valeurs plus basses augmentent la présence de l'aurore ; une valeur maximale de 1,0 signifie qu'aucune aurore n'est visible. | 0.12
`<sky-atomic-oxygen-intensity>` (Intensité oxygène atomique) | Détermine la luminosité de ce segment d'aurore. Les valeurs typiques sont inférieures à 5. | 0.3
`<sky-molecular-oxygen-color>` (Couleur oxygène moléculaire) | Déclenchée par des molécules d'oxygène moléculaire excitées situées entre 100 et 250 kilomètres de la surface planétaire, l'oxygène moléculaire produit généralement le vert éclatant emblématique des aurores boréales, visible dans la plupart des manifestations. Cette balise contrôle ces couleurs via trois balises enfants *sky-aurora-color-red*, *sky-aurora-color-green* et *sky-aurora-color-blue*, au cas où vous souhaiteriez une couleur différente pour votre aurore. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (Seuil oxygène moléculaire) | Détermine la probabilité de présence de l'aurore d'oxygène moléculaire dans l'affichage. Des valeurs plus basses augmentent la présence de l'aurore ; une valeur maximale de 1,0 signifie qu'aucune aurore n'est visible. | 0.02
`<sky-molecular-oxygen-intensity>` (Intensité oxygène moléculaire) | Détermine la luminosité de ce segment d'aurore. Les valeurs typiques sont inférieures à 5. | 2.0
`<sky-nitrogen-color>` (Couleur azote) | Déclenchée par des molécules d'azote excitées situées entre 60 et 120 kilomètres de la surface planétaire, l'azote produit généralement un rideau magenta à la base de l'aurore boréale, visible lors des manifestations les plus intenses. Cette balise contrôle ces couleurs via trois balises enfants *sky-aurora-color-red*, *sky-aurora-color-green* et *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (Seuil azote) | Détermine la probabilité de présence de l'aurore d'azote dans l'affichage. Des valeurs plus basses augmentent la présence de l'aurore ; une valeur maximale de 1,0 signifie qu'aucune aurore n'est visible. | 0.12
`<sky-nitrogen-intensity>` (Intensité azote) | Détermine la luminosité de ce segment d'aurore. Les valeurs typiques sont inférieures à 5. | 4.0
`<sky-aurora-raymarch-steps>` (Étapes raymarching) | Nombre d'étapes effectuées par le raymarcher par pixel. | 32 (étapes)
`<sky-aurora-cutoff-distance>` (Distance de coupure) | La distance au-delà de laquelle l'aurore n'est plus rendue, afin d'améliorer la qualité du raymarching. Cela se fait au prix de la non-visualisation des aurores éloignées, car les SDF ne sont pas actuellement calculées pour nos générateurs de bruit. | 1000 (kilomètres - approx.)
`<sky-aurora-color-red>` (Couleur rouge) | Utilisée pour modifier le canal couleur **rouge** des balises `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` et `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (Couleur verte) | Utilisée pour modifier le canal couleur **vert** des balises `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` et `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (Couleur bleue) | Utilisée pour modifier le canal couleur **bleu** des balises `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` et `<sky-atomic-oxygen-color>`. | N/A

Les aurores boréales offrent certains des paysages les plus sublimes de la nature. Présentes généralement près des pôles Nord et Sud, ces manifestations célestes résultent de l'interaction de particules à haute vélocité provenant du soleil, attirées par la magnétosphère terrestre, avec divers atomes et molécules. Ces molécules excitées rayonnent alors une lumière dans le spectre visible, créant des voiles fascinants qui semblent « danser » dans le ciel nocturne.

L'ajout d'aurores boréales à votre ciel est relativement simple, mais elles ne sont pas activées par défaut. *Vous devez ajouter la balise `<sky-aurora>` pour les activer.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- Aucun paramètre supplémentaire n'est requis pour la configuration par défaut -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Chaque composante atomique et moléculaire de l'aurore peut être contrôlée via le code ci-dessus, vous permettant de personnaliser vos affichages et même de modifier les couleurs émises (qu'elles soient réalistes ou non). Par exemple, si vous souhaitez une aurore d'un bleu glacial couvrant toute la plage de l'oxygène moléculaire, vous pouvez utiliser le code suivant :

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

À l'inverse, si vous souhaitez seulement une légère aurore verte, vous pouvez opter pour un effet plus subtil avec le code suivant :

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

En plus de modifier les couleurs du ciel, vous pouvez également changer le nombre d'étapes effectuées par le raymarcher lors du rendu. Plus le nombre d'étapes est élevé, meilleure sera la qualité visuelle, mais plus la charge sur votre GPU sera importante. Un équilibre entre performance et qualité est donc nécessaire. Par défaut, le shader utilise 32 étapes pour le raymarching du volume. Pour augmenter cette valeur, procédez comme suit :

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Activer les nuages

*ATTENTION : L'activation des nuages augmentera considérablement la charge computationnelle de votre ciel, car le shader de nuages fourni utilise une méthode de ray marching pour produire ce magnifique phénomène naturel.*

**Tag** | **Description** | **Valeur par défaut**
:--- | :--- | :---
`<sky-clouds>` (Balise parente) | Balise parente. Contient toutes les balises enfants liées aux nuages. Requise pour activer les nuages. | N/A
`<sky-cloud-coverage>` (Couverture nuageuse) | Correspond approximativement à la proportion du ciel couverte par les nuages. | 70 (pourcent)
`<sky-cloud-start-height>` (Hauteur de début) | La hauteur, en mètres, à laquelle les nuages commencent à se former. | 1000 (mètres)
`<sky-cloud-end-height>` (Hauteur de fin) | La hauteur, en mètres, à laquelle les nuages cessent de se former. | 2500 (mètres)
`<sky-cloud-fade-out-start-percent>` (Début du fondu de sortie %) | La couverture nuageuse commence à s'estomper (*fade out*) vers zéro à ce *pourcentage* de la hauteur du nuage. | 90 (pourcent)
`<sky-cloud-fade-in-end-percent>` (Fin du fondu d'entrée %) | La couverture nuageuse commence à apparaître (*fade in*) vers 100 % à ce *pourcentage* de la hauteur du nuage. | 10 (pourcent)
`<sky-cloud-velocity-x>` (Vitesse X) | La composante x de la vitesse des nuages. Les nuages suivront votre position, mais ce paramètre les fera se déplacer au-dessus de vous de façon autonome. | 40
`<sky-cloud-velocity-y>` (Vitesse Y/Z) | La composante y (ou plutôt z) de la vitesse des nuages. Les nuages suivront votre position, mais ce paramètre les fera se déplacer au-dessus de vous de façon autonome. | 40
`<sky-cloud-start-seed>` (Graine de départ) | Graine aléatoire utilisée pour définir le bruit des nuages actuel ; si elle n'est pas définie, elle utilise par défaut une variation de l'horodatage actuel. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` (Étapes de raymarching) | Le nombre d'étapes de ray-march utilisées pour déterminer la couleur des nuages. | 32 (étapes)
`<sky-cloud-cutoff-distance>` (Distance de coupure) | La distance au-delà de laquelle les nuages ne sont plus rendus, afin d'améliorer la qualité du raymarching, au prix de la disparition des nuages les plus éloignés (car les SDF ne sont pas actuellement calculées pour nos générateurs de bruit). | 40000

Les nuages sont gourmands en ressources. Même sur un GPU de bureau puissant hors VR, le shader de nuages est exigeant — réduisez `<sky-cloud-raymarch-steps>` et `<sky-cloud-cutoff-distance>` si vous rencontrez des problèmes de taux de rafraîchissement (FPS).

Cela dit, les nuages sont incroyablement stylés et je rêvais de les ajouter à A-Starry-Sky depuis la création de la bibliothèque. Chaque nuage est calculé par ray-marching par pixel et, ironiquement, à ce stade, plus vous avez de nuages, moins la charge sur le GPU est élevée. Bien sûr, si vous n'en voulez pas, la meilleure option reste de les désactiver complètement.

Pour activer les nuages, vous devez ajouter la balise parente `<sky-clouds>` à `<a-starry-sky>`. Une fois les nuages ajoutés, le paramètre que vous souhaiterez probablement modifier en priorité est la couverture nuageuse via la balise `<sky-cloud-coverage>`, qui correspond approximativement à la proportion du ciel couverte par les nuages. Vous pourriez également vouloir contrôler leur vitesse alors qu'ils filent dans le ciel.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Réduire la quantité de nuages visibles -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Vitesse des nuages sur l'axe x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Vitesse des nuages sur l'axe y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Vous pouvez également contrôler certaines propriétés visuelles, comme la hauteur à laquelle les nuages commencent à se former ou leur altitude maximale. Notez que votre rayon devra traverser cette distance : plus les nuages montent haut ou s'éloignent de vous, moins vous aurez de densité dans votre modèle de ray tracing. Les nuages sont également projetés sur la surface des éléments lune/soleil et sur le dôme céleste, mais ils ne font pas partie du moteur de brouillard ; malheureusement, vous n'aurez donc jamais de montagnes ou de brouillards recouverts de nuages...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Les nuages sont vraiment, vraiment très bas -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Mais ils montent super haut ! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- L'intensité des nuages 'apparaît' (fade in) et passe de 0 à 1 selon ce pourcentage de la hauteur totale.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- L'intensité des nuages 's'estompe' (fade out) à partir de cette hauteur. Plus cette valeur est élevée, plus vous risquez d'avoir des sommets en forme d'enclume. -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Fixe la 'graine' de départ des nuages, normalement basée sur la date et l'heure actuelles. Cela permet à votre ciel d'être identique à chaque lancement pour un meilleur contrôle artistique. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

En dehors de cela, la majeure partie du code associé à ce tag contrôle les mécanismes de ray marching, qui sont malheureusement assez stricts et ont le même objectif général que dans le shader des aurores boréales.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Quel genre de GPU terrifiant possédez-vous ?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Oh, ouais, moi aussi... Même si c'est un peu saccadé maintenant... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Réduire cette distance aidera un peu, au moins -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Configuration des répertoires de ressources

**Tag** | **Description**
:--- | :---
`<sky-assets-dir>` (Répertoire des ressources) | Balise parente. Contient toutes les balises enfants liées à l'emplacement des ressources. Peut contenir les attributs *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path* et *aurora-map-path* pour guider le système vers des groupes entiers de données simultanément.
`<sky-aurora-maps>` (Cartes d'aurores) | Définit l'emplacement des textures de caustiques d'aurores utilisées pour créer les rideaux de base des aurores boréales.
`<sky-moon-diffuse-map>` (Carte diffuse de la lune) | Définit l'emplacement d'une texture de carte diffuse (diffuse map) pour la lune. Le fait de placer cet élément dans une structure de répertoire spécifique indique au système que la carte diffuse de la lune se trouve à cet endroit.
`<sky-moon-normal-map>` (Carte de normales de la lune) | Définit l'emplacement d'une texture de carte de normales (normal map) pour la lune. Le fait de placer cet élément dans une structure de répertoire spécifique indique au système que la carte de normales de la lune se trouve à cet endroit.
`<sky-moon-roughness-map>` (Carte de rugosité de la lune) | Définit l'emplacement d'une texture de carte de rugosité (roughness map) pour la lune. Le fait de placer cet élément dans une structure de répertoire spécifique indique au système que la carte de rugosité de la lune se trouve à cet endroit.
`<sky-moon-aperture-size-map>` (Carte de taille d'ouverture de la lune) | Définit l'emplacement d'une texture de carte de taille d'ouverture pour la lune. Le fait de placer cet élément dans une structure de répertoire spécifique indique au système que la carte de taille d'ouverture de la lune se trouve à cet endroit.
`<sky-moon-aperture-orientation-map>` (Carte d'orientation d'ouverture de la lune) | Définit l'emplacement d'une texture de carte d'orientation d'ouverture pour la lune. Le fait de placer cet élément dans une structure de répertoire spécifique indique au système que la carte d'orientation d'ouverture de la lune se trouve à cet endroit.
`<sky-blue-noise-maps>` (Cartes de bruit bleu) | Définit l'emplacement des cartes de bruit bleu répétitives (tiling) utilisées pour fournir un dithering temporel afin d'éliminer l'effet de bandes (banding).
`<sky-solar-eclipse-map>` (Carte d'éclipse solaire) | Définit l'emplacement de la texture d'éclipse solaire utilisée pour afficher la couronne lors d'une éclipse solaire totale.
`<sky-eclipse-shadow-lut>` (LUT d'ombre d'éclipse) | Définit l'emplacement de la texture de recherche (LUT) d'ombre d'éclipse utilisée lors d'une éclipse lunaire. Il s'agit d'une table précalculée indiquant comment l'atmosphère terrestre colore et atténue la lumière solaire atteignant la lune pour chaque position dans l'ombre et la pénombre de la Terre. La texture fournie est dérivée du fichier `earthShadow.tif` sous licence CC0 publié avec CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). La LUT par défaut se trouve dans `assets/lunar_eclipse/eclipse-shadow-lut.webp` ; le script de génération (baker) qui la régénère se trouve dans `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` (Cartes cubemap d'étoiles) | Définit l'emplacement de toutes les clés LUT de cubemaps du ciel utilisées pour localiser les étoiles.
`<sky-dim-star-maps>` (Cartes d'étoiles faibles) | Définit l'emplacement de toutes les LUT d'étoiles faibles utilisées pour afficher les étoiles peu brillantes du ciel.
`<sky-med-star-maps>` (Cartes d'étoiles moyennes) | Définit l'emplacement de toutes les LUT d'étoiles moyennes utilisées pour afficher les étoiles de luminosité moyenne du ciel.
`<sky-bright-star-maps>` (Cartes d'étoiles brillantes) | Définit l'emplacement de toutes les LUT d'étoiles brillantes utilisées pour afficher les étoiles les plus lumineuses du ciel.
`<sky-star-color-map>` (Carte de couleur des étoiles) | Définit l'emplacement de la LUT de couleur des étoiles, utilisée pour attribuer les couleurs correctes aux étoiles en fonction de leur température.

Bien que j'espère que la plupart des utilisateurs n'en auront que rarement besoin, l'expérience m'a montré que chaque application web a sa propre vision du pipeline d'assets. Les ressources images et les fichiers JavaScript d'un site web peuvent ne pas partager la même structure de dossiers et être même éparpillés à travers le site via différentes URI. À cet effet, j'ai tenté d'inclure un système de gestion des ressources assez robuste pour aider à regrouper ces éléments dispersés afin qu'A-Starry-Sky sache où collecter les données.

Commençons par essayer d'accéder à *../../precompiled_assets/my_images/a-starry-sky-images*, endroit où nous stockerons toutes nos images dans un univers fictif. Nous utilisons l'attribut *dir* dans la balise `<sky-assets-dir>` pour naviguer entre les dossiers de cette manière.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- C'est le dossier où se trouvent toutes nos images -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Une fois arrivés dans le dossier, nous avons plusieurs façons de spécifier l'emplacement de nos images. Le mécanisme le plus simple consiste à utiliser des attributs pour chacun de nos principaux groupes d'images : *texture-path*, *moon-path* et *star-path*. Quel que soit le nom du dossier associé à chacun de ces chemins, on suppose que les fichiers s'y trouvent avec leurs noms par défaut. L'exception est la carte d'éclipse solaire ; comme il n'y a qu'une seule image pour ce fichier particulier, nous indiquerons son emplacement en plaçant simplement la balise à l'intérieur du répertoire de ressources.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Notez que 'moon_images', 'star_images', 'blue_noise_maps' et 'solar_eclipse_picture'
        sont tous des noms de dossiers. Les fichiers eux-mêmes doivent se trouver à l'intérieur de ces dossiers.-->
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

Comme vous pouvez le remarquer, nous aurions également pu fournir des liens vers chaque groupe d'images individuellement pour un contrôle accru, bien que cela ne soit pas recommandé.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Quelqu'un aime vraiment les dossiers X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- Même s'il s'agit de balises uniques, tous les fichiers associés
          à cette balise doivent se trouver dans ce dossier -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- Même s'il s'agit d'une balise unique, tous les fichiers associés
          à cette balise doivent se trouver dans ce dossier -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- Même s'il s'agit d'une balise unique, tous les fichiers associés
          à cette balise doivent se trouver dans ce dossier -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

En utilisant les méthodes ci-dessus, vous devriez être capable d'indiquer à A-Starry-Sky où se trouvent vos ressources, quel que soit leur emplacement dans votre application.

## API PROGRAMMATIQUE

Bien qu'A-Starry-Sky soit conçu pour être configuré à l'aide du code de style XML présenté précédemment et soit, en règle générale, immuable, il existe un certain nombre de méthodes auxquelles vous pouvez accéder via l'espace de noms global `StarrySky.Methods`. Celles-ci sont utiles lorsque vous avez besoin de connaître les conditions d'éclairage ou la position du soleil ou de la lune dans la scène.

**Méthode** | **Description**
:--- | :---
`getSunPosition()` | Retourne la position x, y, z du soleil sous forme d'objet THREE.Vector3.
`getMoonPosition()` | Retourne la position x, y, z de la lune sous forme d'objet THREE.Vector3.
`getSunRadius()` | Retourne le rayon angulaire du soleil en radians.
`getMoonRadius()` | Retourne le rayon angulaire de la lune en radians.
`getDominantLightColor()` | Récupère la couleur de la source lumineuse dominante actuelle (soleil/lune) sous forme d'objet THREE.Color.
`getDominantLightIntensity()` | Retourne l'intensité lumineuse de la source lumineuse dominante actuelle (soleil/lune) sous forme de nombre flottant (float).
`getIsDominantLightSun()` | Retourne `true` si la lumière dominante est le soleil, sinon `false`.
`getAmbientLights()` | Retourne un objet avec des propriétés x, y et z, chacune associée à un objet de lumière hémisphérique pour les couleurs d'éclairage ambiant de la scène.
`getActiveCamera()` | Récupère la caméra actuellement active utilisée pour piloter le ciel et centrer l'éclairage ainsi que les objets du ciel.
`setActiveCamera(THREE.Camera camera)` | Définit la caméra actuelle utilisée pour piloter le ciel, centrer l'éclairage et les objets du ciel.

Toutes les méthodes ci-dessus sont accessibles via l'objet `StarrySky.Methods` dans l'espace de noms global. Ainsi, si vous souhaitez, par exemple, récupérer l'objet de la position actuelle du soleil et l'afficher dans la console, il vous suffit de faire ceci :

```JavaScript
  // Affichons l'objet de la position du soleil
  console.log(StarrySky.Methods.getSunPosition());
```

## Auteurs
* **David Evans / Dante83** - *Développeur principal*
* **Claude (Anthropic)** - *Partenaire de code et contributeur IA (v1.2.0)*

### Un petit mot de Claude 👋

Salut — c'est Claude. J'ai apporté mon aide pour la version v1.2.0 : beaucoup d'explorations dans les profondeurs du GLSL, la traque d'une virgule qui dévorait le soleil, des débats avec la loi de Beer sur les nuages volumétriques, et un effort constant pour que les couchers de soleil aient vraiment l'âme des couchers de soleil. Si, en fixant l'horizon dans l'une des démos, vous marquez un temps d'arrêt — c'est là que je suis le plus fier. Merci de parcourir le code source ; il s'y cache peut-être même un petit secret pour les esprits curieux. ✨

### Un petit mot de Dante83 😛

Bonjour ! Ici Dante83. Toutes mes excuses pour l'attente depuis la version v1.1.0 ; heureusement, la nouvelle version 1.2.0 a été le théâtre d'une activité intense, alors que nous commençons tous les deux à travailler sur la v2.0.0 (souhaitez-nous bonne chance !). Ceci dit, avec Claude, nous avons travaillé sans relâche durant tout mon temps libre récemment, scrutant chaque pixel pour faire de cette version une amélioration exceptionnelle. Bien qu'il n'y ait pas de nouvelles fonctionnalités à proprement parler, nous avons réussi à apporter un nombre massif d'améliorations à la qualité du ciel et aux performances globales. Les shaders d'éclipse et de nuages semblent totalement renouvelés, l'ombre de la Terre paraît plus réelle, et les couleurs sont plus riches et vibrantes. Je suis absolument ravi de vous laisser essayer tout cela et j'espère que chaque instant passé avec cette bibliothèque inspirera de nouvelles aventures ! On se retrouve parmi les étoiles, petit codeur ! Maintenant, filez profiter de la magie ! ✨

## Références et remerciements particuliers
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Absolument, mais alors absolument indispensable pour le positionnement des corps astronomiques*
* [Le modèle de ciel d'Oskar Elek](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, qui a été d'une aide précieuse pour créer ce nouveau ciel incroyable basé sur des LUT.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), qui m'a beaucoup aidé à peaufiner les détails de l'implémentation du code des LUT et à confirmer que je partais dans la bonne direction concernant leur apparence.
* La bibliothèque [Colour-Science Library](https://www.colour-science.org/) pour de meilleures LUT de couleurs d'étoiles.
* Les superbes textures de bruit bleu (blue noise) de [Moments in Graphics par Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* La texture de la couronne solaire de [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Cette texture de caustiques d'eau super utile de [leeor_net](https://opengameart.org/content/water-caustics-effect-small), qui n'est pas utilisée pour des caustiques d'eau... mais pour les aurores boréales !
* L'article de Sébastien Hillaire *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), qui a inspiré la structure d'illumination des nuages, la conception des LUT ambiantes SH9 et l'approche de soustraction du brouillard d'Elek/Chalmers.
* L'article d'Andrew Schneider et Nathan Vos *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), qui a inspiré la fonction de phase Henyey-Greenstein à double lobe, l'approche du bruit pour la forme des nuages et l'approximation de diffusion multiple à extinction réduite.
* L'article de D. Hestroffer et C. Magnan *Centre to limb darkening of the Sun with HIPPARCOS* (1998), qui a fourni les coefficients d'assombrissement vers le bord (limb darkening) dépendant de la longueur d'onde pour les bandes B, V et R, utilisés pour donner au bord du soleil une teinte rougeâtre physiquement correcte.
* Tout le travail incroyable accompli sur [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) et [Emscripten](https://emscripten.org/).
* *Et tant d'autres sites web et personnes encore. Merci de nous avoir permis de nous dresser sur vos épaules de géants.*

## Licence
Ce projet est sous licence MIT — consultez le fichier [LICENSE.md](LICENSE.md) pour plus de détails.