# A-Starry-Sky

A-Starry-Sky è una cupola celeste (sky dome) per [A-Frame Web Framework](https://aframe.io/). L'obiettivo è fornire un componente semplice e pronto all'uso per creare splendidi cicli giorno-notte nelle vostre creazioni.

> **Attenzione: richiede una GPU potente — non aprire su dispositivi mobili.**

**[Demo Live](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — Il cielo alla data e all'ora corrente di San Francisco.

| Esempio | Descrizione |
|:---|:---|
| [Deserto](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Scena desertica in un momento specifico del giorno |
| [Eclissi solare](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Eclissi solare totale con corona |
| [Eclissi lunare](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Ombra della Terra sulla Luna |
| [Stella di Natale (1226 d.C.)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Grande congiunzione tra Giove e Saturno |
| [Marte](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Atmosfera marziana personalizzata |
| [Atmosfera personalizzata](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Diversi valori di scattering di Mie/Rayleigh |
| [Alta quota](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Cielo visto da 20 km di altezza |
| [Aurora boreale](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ Elevato carico GPU |
| [Nuvole leggere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ Elevato carico GPU |
| [Nuvole medie](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ Elevato carico GPU |
| [Nuvole dense](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ Elevato carico GPU |

## Prerequisiti

È stato sviluppato per il [A-Frame Web Framework](https://aframe.io/) versione 1.7.0+. Richiede inoltre un browser web compatibile con WebXR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Installazione

Copia il file *a-starry-sky.v1.2.0.min.js* e le cartelle *assets* e *wasm* nel tuo progetto. Aggiungi i seguenti script al tuo HTML — tieni presente che `starry-sky-web-worker.js` **non** è incluso qui; viene invece referenziato direttamente nel tag `<a-starry-sky>`.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

Una volta configurati questi riferimenti, aggiungi il componente `<a-starry-sky>` all'interno del tag `<a-scene>` di A-Frame, indicando l'URL del web worker per lo stato del cielo in questo modo:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Questo codice di base genererà un cielo che si muove in tempo reale in base alla latitudine e longitudine di San Francisco, California. Tuttavia, possiamo fare molto di più. A-Starry-Sky include una serie di tag HTML personalizzati per aiutarti a configurare lo stato del cielo.

**NOTA: Questa skybox è immutabile. Ciò significa che le impostazioni iniziali rimarranno costanti in ogni pagina. Purtroppo, al momento risulta troppo complesso rendere il codice mutabile.**

## Impostazione della Posizione

**Tag** | **Descrizione** | **Valore Predefinito**
:--- | :--- | :---
`<sky-location>` | Tag genitore. Contiene i tag figli `sky-latitude` e `sky-longitude`. | N/A
`<sky-latitude>` | Imposta la latitudine della posizione. I valori a nord dell'equatore sono **positivi**. | 38
`<sky-longitude>` | Imposta la longitudine della posizione. I valori a ovest del [meridiano di Greenwich](https://en.wikipedia.org/wiki/Prime_meridian) sono **negativi**. | -122

È possibile impostare il cielo su qualsiasi latitudine e longitudine del pianeta Terra. Le posizioni sono utili per dare ai giocatori un senso delle stagioni, modificando l'arco del sole o della luna. La latitudine determinerà inoltre quali stelle siano visibili nel cielo notturno. Sia la latitudine che la longitudine sono fondamentali per gli eventi legati al tempo, come le eclissi solari e lunari; questo è particolarmente vero se si desidera simulare un'eclissi solare totale. Detto ciò, impostare la posizione è più semplice che decidere dove trovarsi: basta recuperare le coordinate desiderate da [Google Earth](https://earth.google.com/web/) o da un'altra mappa e inserire i valori nei rispettivi tag, come in questo esempio:

Andiamo a New York!
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

E per quanto riguarda Perth, in Australia?
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

Nota che le longitudini a ovest del [meridiano di Greenwich](https://en.wikipedia.org/wiki/Prime_meridian) sono negative (ad es. New York, Buenos Aires).

## Configurazione dell'ora e della data

**Tag** | **Descrizione** | **Valore predefinito**
:--- | :--- | :---
`<sky-time>` | Tag genitore. Contiene tutti i tag figli relativi agli elementi di data o ora. | N/A
`<sky-date>` | La stringa locale di data e ora nel formato **ANNO-MESE-GIORNO ORA:MINUTO:SECONDO**/*2021-03-21 13:45:51*. I valori dell'ora si basano su un sistema a 24 ore (da 0 a 23). Lo 0 corrisponde alle 00:00 e il 23 alle 23:00. | Data corrente
`<sky-speed>` | Il moltiplicatore temporale utilizzato per accelerare o rallentare i calcoli astronomici. | 1.0
`<sky-utc-offset>` | L'offset UTC per questa posizione. I valori negativi si trovano a ovest del [meridiano di Greenwich](https://en.wikipedia.org/wiki/Prime_meridian), contrariamente ai valori di longitudine. **Nota che l'ora UTC non segue l'ora legale (DST)** | 7

Imposta `<sky-date>` sull'**ora locale** della posizione scelta, quindi imposta `<sky-utc-offset>` in modo che corrisponda a quel fuso orario. Per esempio, New York City è UTC-4 (estate) o UTC-5 (inverno): l'ora legale non viene applicata automaticamente.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Impostazioni di posizione precedenti -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- Puoi configurare l'offset UTC in questo modo! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Nota che dovrai aggiungere nuovamente il tag genitore `<sky-time>`, che contiene tutti i tag figli relativi alle nostre impostazioni temporali.

Detto questo, non devi per forza limitarti all'ora del computer locale. Perché non proviamo qualcosa di più interessante, come un viaggio nel tempo! Ho sentito che l'8 aprile 2024 alle 13:27 [ci sarà un'eclissi solare](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) mozzafiato a [Del Rio, Texas](https://nationaleclipse.com/cities_total.html). Andiamo a dare un'occhiata!

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

Ti sei perso la [Stella di Natale](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? No, no. Non quella. Quella dell'anno 1226 d.C. Beh, meno male che abbiamo una macchina del tempo e che A-Starry-Sky ora supporta i pianeti :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Viaggiare nel tempo è divertente, ma potresti essere interessato anche a cambiare la *velocità* del tempo. Nei mondi di gioco i cicli giorno-notte sono spesso più rapidi che nella realtà, oppure potresti voler fermare il tempo permanentemente per catturare un momento specifico per le tue esigenze di illuminazione. Per farlo, aggiungi il tag `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Ora ci saranno otto giorni nel mondo virtuale per ogni giorno reale. -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Naturalmente, se stai implementando questo sistema in un mondo persistente, assicurati di tenere conto del flusso temporale accelerato quando crei il tuo HTML. In ogni caso, la configurazione dell'HTML dinamico per il cielo è lasciata a te.

## Modifica delle impostazioni atmosferiche

**Tag** | **Descrizione** | **Valore predefinito**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Tag genitore. Contiene tutti i tag figli relativi alle impostazioni atmosferiche. | N/A
`<sky-camera-height>` | L'altezza della camera rispetto alla terra. | 0.0km
`<sky-mie-directional-g>` | Descrive quanta luce viene diffusa in avanti dallo scattering di Mie, ovvero l'alone biancastro visibile attorno al sole causato da particelle più grandi nell'atmosfera. Più alto è il valore di mie-directional G, più polverosa appare l'atmosfera. | 0.8
`<sky-sun-intensity>` | L'intensità del sole nello shader atmosferico. | 1367.0
`<sky-moon-intensity>` | L'intensità della luna nello shader atmosferico. | 29.0
`<sky-mie-beta>` | Dipendenza cromatica dello scattering della luce per lo scattering di Mie, responsabile principalmente dell'effetto "glow" vicino al sole. Lo scattering è piuttosto uniforme su tutte le frequenze. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Dipendenza cromatica dello scattering della luce per lo scattering di Rayleigh, responsabile principalmente della diffusione del blu nel cielo. Si noti che, per impostazione predefinita, il canale blu presenta lo scattering maggiore. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Dipendenza cromatica dello scattering della luce per lo strato di ozono, fondamentale per i blu profondi al tramonto. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | L'altezza di cutoff oltre la quale l'atmosfera "termina". | 80.0 km
`<sky-radius-of-earth>` | Il raggio del pianeta o della Terra. | 6366.7 km
`<sky-rayleigh-scale-height>` | L'altezza di scala per il decadimento dello scattering di Rayleigh, assumendo un decadimento esponenziale. Lo scattering di Rayleigh è causato dai gas atmosferici e ha quindi un'altezza di scala molto maggiore. | 8.4
`<sky-mie-scale-height>` | L'altezza di scala per il decadimento dello scattering di Mie, assumendo un decadimento esponenziale. Lo scattering di Mie è causato da particelle più grandi, quindi tende a decadere più rapidamente; di conseguenza, ha un fattore di altezza caratteristica minore. | 1.25
`<sky-ozone-percent-of-rayleigh>` | La percentuale di ozono attualmente presente nel cielo, utilizzata per impostare il ritorno dell'ozono al tramonto. | 6E-7
`<sky-moon-angular-diameter>` | Il diametro angolare della luna così come appare nel cielo.  | 3.15 degrees
`<sky-sun-angular-diameter>` | Il diametro angolare del sole così come appare nel cielo. | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | Il numero di passi che il ray tracer compie verso il bordo del cielo durante la raccolta della luce per le LUT atmosferiche. | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | Il numero di passi angolari compiuti in ogni punto lungo il raggio per lo scattering di ordine k. | 30 steps
`<sky-number-of-scattering-orders>` | Il numero di passaggi di scattering di ordine superiore (k) da renderizzare nella LUT di inscattering. Valori più alti aumentano la qualità a scapito del tempo di generazione della LUT. | 4
`<sky-parameters-color-red>` | La componente rossa utilizzata nei tag `<sky-rayleigh-beta>`, `<sky-mie-beta>` e `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | La componente verde utilizzata nei tag `<sky-rayleigh-beta>`, `<sky-mie-beta>` e `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | La componente blu utilizzata nei tag `<sky-rayleigh-beta>`, `<sky-mie-beta>` e `<sky-ozone-beta>`. | N/A

I parametri atmosferici offrono una delle API più complete di tutto il codice. Sebbene questi valori possano essere utilizzati dagli sviluppatori esperti per creare cieli personalizzati, la maggior parte degli utenti preferirà mantenere i valori predefiniti. Tuttavia, alcuni parametri sono particolarmente utili e piuttosto semplici da comprendere.

Uno degli elementi che più probabilmente vorrete modificare è la dimensione del sole e della luna. Nella realtà, il sole ha un diametro angolare di 0,53 gradi e la luna di 0,50 gradi. L'utilizzo di questi valori nel simulatore rappresenterebbe meglio la realtà, ma tendono a risultare troppo piccoli nella maggior parte delle simulazioni, specialmente su dispositivi non VR come i monitor. Per modificare questi valori, basta cambiare i parametri nei tag corrispondenti.

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

Potreste anche voler cambiare l'altezza iniziale sopra il pianeta. Questo può essere impostato facilmente con il tag `<sky-camera-height>`, sebbene il cielo si adatti dinamicamente all'altezza mentre spostate la camera verso l'alto o verso il basso. Questo parametro imposta l'altezza iniziale della scena, in chilometri, con un valore massimo di *80 km* e uno minimo di *0 km*.

[Esempio ad alta quota](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Saliamo un po' più in alto. Qui l'aria è più rarefatta. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Potreste inoltre voler cambiare la composizione della vostra atmosfera. Questo elemento vi permette di accedere a diversi meccanismi per controllare l'aspetto del cielo secondo le vostre preferenze. Ad esempio, se preferiste i valori di Rayleigh presentati in [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) rispetto ai nostri valori nativi (5.8e-3, 1.35e-2, 3.31e-2) $\rightarrow$ (5.19E-3, 1.21E-2, 2.96E-2), e voleste utilizzare un beta di 4.44E-3 $\rightarrow$ 2E-3, potreste facilmente sostituirli nel codice.

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

Ma questo non è poi così emozionante; diciamo di voler provare qualcosa di più folle. Seguiamo gli studi di [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) e andiamo su Marte! In questo caso, l'uso di Rayleigh e Mie viene invertito, quindi probabilmente dovremmo scambiare anche le loro altezze caratteristiche. La maggior parte dello scattering su Marte è causata dallo scattering di Mie di particelle grandi, con un'atmosfera molto sottile. Di conseguenza, possiamo quasi disabilitare mie (rayleigh) e scambiare le relative altezze caratteristiche. Dovremmo inoltre modificare il raggio del pianeta e potremmo voler aggiornare l'altezza atmosferica per ottenere valori migliori nel ray tracer.

[Esempio di Marte](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Notate che Marte diffonde maggiormente la luce rossa -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Qualche modifica a Mie aiuta ulteriormente -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Assicuratevi di disabilitare l'ozono -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Beh, nel nostro caso, Marte... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- Il sole è più piccolo e la luna possiamo eliminarla del tutto -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Potete anche regolare il numero di passi dei raggi della LUT, sebbene i valori predefiniti siano già quasi ottimali e le variazioni siano raramente percettibili.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Valori più bassi per le prestazioni, più alti per la precisione (il valore predefinito di 30 è ottimale nella maggior parte dei casi) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Modifica dei valori predefiniti dell'illuminazione

**Tag** | **Descrizione** | **Valore predefinito**
:--- | :--- | :---
`<sky-lighting>` (Illuminazione del cielo) | Tag genitore. Contiene tutti i tag figli relativi all'illuminazione della scena. | N/A
`<sky-sun-intensity>` (Intensità sole) | Moltiplicatore di intensità per la luce solare; può essere utilizzato per aumentare o diminuire l'intensità dell'illuminazione direzionale solare. | 1.0
`<sky-moon-intensity>` (Intensità luna) | Moltiplicatore di intensità per la luce lunare; può essere utilizzato per aumentare o diminuire l'intensità dell'illuminazione direzionale lunare. | 1.0
`<sky-ambient-intensity>` (Intensità ambientale) | Moltiplicatore di intensità per l'illuminazione ambientale; può essere utilizzato per aumentare o diminuire l'intensità del sistema di illuminazione ambientale. | 2.0
`<sky-minimum-ambient-lighting>` (Illuminazione ambientale minima) | La quantità minima di luce ambientale nel sistema. | 0.01
`<sky-maximum-ambient-lighting>` (Illuminazione ambientale massima) | La quantità massima di luce ambientale nel sistema. | INF
`<sky-atmospheric-perspective-type>` (Tipo di prospettiva atmosferica) | Può essere impostato su *normal*, *advanced* o *none*. Necessario per la nebbia della scena. *normal* utilizza il modello originale di nebbia esponenziale; *advanced* utilizza un modello basato su Preetham per una migliore variazione del colore dell'orizzonte, a scapito di un maggiore carico sulla GPU. | normal
`<sky-atmospheric-perspective-density>` (Densità prospettiva atmosferica) | Solo per la nebbia *normal*. Controlla il parametro di densità per la nebbia esponenziale della scena. Il colore è impostato automaticamente dall'illuminazione della scena. Ignorato se il tipo di nebbia della scena è *advanced*. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (Moltiplicatore distanza prospettiva atmosferica) | Solo per la nebbia *advanced*. Moltiplica la distanza della nebbia per il modello di nebbia avanzato. | 2.0
`<sky-ground-color>` (Colore del terreno) | Tag genitore. Contiene i tag `<sky-ground-color-{canale-colore}>` per descrivere il colore di base del terreno per l'illuminazione riflessa dalla superficie. | N/A
`<sky-ground-color-red>` (Colore terreno - rosso) | Utilizzato per descrivere le variazioni del canale colore **rosso** nei tag `<sky-ground-color>`. | 66
`<sky-ground-color-green>` (Colore terreno - verde) | Utilizzato per descrivere le variazioni del canale colore **verde** nei tag `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` (Colore terreno - blu) | Utilizzato per descrivere le variazioni del canale colore **blu** nei tag `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` (Risoluzione camera ombre) | La risoluzione, in pixel, della camera di illuminazione diretta utilizzata per produrre le ombre. Valori più alti producono ombre di qualità superiore a un costo maggiore in termini di prestazioni. | 2048
`<sky-shadow-camera-size>` (Dimensione camera ombre) | La dimensione dell'area della camera utilizzata per proiettare le ombre. Dimensioni maggiori comportano una superficie più ampia coperta dalle ombre, ma causano anche problemi di aliasing distribuendo ogni pixel della camera su un'area più vasta. | 32.0
`<sky-sun-bloom>` (Bloom sole) | Tag genitore, contiene tutte le proprietà del passaggio di rendering bloom del sole. | N/A
`<sky-moon-bloom>` (Bloom luna) | Tag genitore, contiene tutte le proprietà del passaggio di rendering bloom della luna. | N/A
`<sky-bloom-enabled>` (Bloom abilitato) | Abilita (true) o disabilita (false) il bloom per l'oggetto astronomico. | true
`<sky-bloom-exposure>` (Esposizione bloom) | Modifica il parametro di esposizione del filtro bloom: la quantità di luce restituita alla camera viene moltiplicata per questo valore. | 1.0
`<sky-bloom-threshold>` (Soglia bloom) | Modifica il parametro di soglia del filtro bloom: l'intensità minima necessaria per attivare il bloom. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (Intensità bloom) | Modifica il parametro di intensità del filtro bloom: quanto i pixel selezionati devono "sbavare" (bloom). | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (Raggio bloom) | Modifica il parametro del raggio del filtro bloom: la distanza su cui il filtro bloom si diffonde. | {sun: 1.0, moon: 1.4}

I tag dell'illuminazione del cielo sono utili per controllare gli attributi dell'illuminazione diretta e indiretta nella scena. Nella versione 1.0.0, il cielo ha ridotto il numero di luci direzionali da 2 (sole e luna) a 1 (una sola per la sorgente luminosa più dominante). La luce direzionale è sempre focalizzata sulla camera dell'utente e crea ombre attorno ad essa. Sebbene la luce direzionale possa supportare vari tipi di ombre, questa libreria non è il luogo dove controllarle. Il tipo di ombra viene invece impostato nel tag `<a-scene>`, come descritto [qui](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). Di conseguenza, è possibile impostare i valori su uno dei seguenti:

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

```html
<a-scene shadow="type: pcf">
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

```html
<a-scene shadow="type: basic">
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Sfortunatamente, al momento della stesura di questo documento, A-Frame non supporta ancora le *variance shadow maps*, sebbene ci sia un'issue aperta a riguardo. Inoltre, il tipo di ombra scelto per l'illuminazione del sole e della luna sarà lo stesso per tutte le altre luci all'interno della scena; tenetene conto nella scelta delle ombre.

È possibile controllare la qualità delle ombre tramite la dimensione e la risoluzione della camera delle ombre. Aumentare la dimensione copre una parte maggiore della scena; aumentare la risoluzione rende il risultato più nitido — ma entrambi hanno un costo in termini di GPU, quindi bilanciateli in base alle vostre necessità. Vale inoltre la pena disabilitare le ombre sulle mesh ambientali di grandi dimensioni, poiché spesso cadono al di fuori del frustum e producono un antiestetico bordo d'ombra quadrato.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Aumenta la dimensione per proiettare ombre più lontane dalla camera -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Aumenta la risoluzione per mantenere le ombre nitide a dimensioni maggiori -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Una volta regolate correttamente le ombre nella scena, probabilmente vorrete anche regolare il colore del vostro "terreno". A-Starry-Sky supporta ora una configurazione di illuminazione tripla emisferica che utilizza una convoluzione sui colori del cielo combinata con un modello di scattering della luce del terreno su un thread CPU separato tramite web worker. Tuttavia, il colore predefinito del terreno è il marrone. Potreste avere un campo d'erba o un oceano ceruleo. Per impostare il colore del terreno, potete usare il tag `<sky-ground-color>` insieme ai suoi tag figli per i canali di colore. Supponiamo di voler impostare il terreno su un verde brillante per un lussureggiante prato d'erba.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
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

Si noti che i valori sopra indicati sono normalizzati tra 0 e 255. Quindi, la combinazione r, g, b 0, 0, 0 è nero e 255, 255, 255 è bianco. Il colore precedente potrebbe risultare un po' troppo luminoso, facendo apparire il terreno come se "brillasse" anche con pochissima luce. Per attenuare questo effetto, basta scurire leggermente il colore.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
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

Detto ciò, se uno dei canali di colore supera 255, purtroppo al momento non c'è modo di "rafforzare il colore" o far apparire il terreno come se "brillasse al buio". Inoltre, il colore del terreno è costante in ogni punto; quindi, se avete più colori nella scena, è probabilmente meglio sceglierne uno che sia una via di mezzo tra tutti gli altri.

Oltre al supporto per l'illuminazione del terreno, ora potete controllare direttamente le intensità dell'illuminazione diretta e ambientale. Cambiare l'intensità del sole o della luna è semplice: basta usare un multiplo del valore predefinito per impostare quanto volete che quel corpo astronomico sia più luminoso o più scuro. Potete usare lo stesso metodo per amplificare o attenuare l'intensità ambientale, aumentando o diminuendo la quantità di luce ambientale nella scena.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Rendiamo il sole due volte più luminoso -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- Ma rendiamo la luna a metà luminosità -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- E impostiamo dieci volte l'illuminazione ambientale -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Potreste anche voler controllare il limite minimo o massimo per l'illuminazione ambientale, per assicurarvi di avere sempre una certa quantità di luce, o un limite massimo.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Aumentiamo la luminosità minima -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Ma non esageriamo con il massimo. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

A un certo punto, potreste voler cambiare i parametri per gli effetti bloom aggiunti al sole o alla luna nel cielo. *a-starry-sky* utilizza l'[Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) di THREE.JS. L'intensità per tutti gli oggetti astronomici è controllata separatamente tramite i tag genitori `<sky-sun-bloom>` e `<sky-moon-bloom>`. I tag figli di questi controllano le caratteristiche del bloom.

Iniziamo cambiando alcuni parametri:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Attenuiamo un po' il sole -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Ma aumentiamo l'intensità della luna -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Possiamo anche disabilitare completamente il bloom, riducendo leggermente il carico sulla GPU.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
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

L'ultimo elemento dell'illuminazione del cielo che probabilmente vorrete modificare è la densità della prospettiva atmosferica. *a-starry-sky* offre due diversi modelli di nebbia a seconda delle vostre esigenze.
Per i sistemi meno potenti, supporta la prospettiva atmosferica esponenziale di base, che raccoglie la luce di tutto il cielo su un web worker e poi la applica proprio come una normale nebbia esponenziale. Per controllare il parametro di densità dell'illuminazione esponenziale, utilizzate il tag `<sky-atmospheric-perspective-density>`. I valori iniziali sono impostati alti per fornire una prospettiva atmosferica evidente anche in scene piccole, quindi potreste voler ridurre il valore rispetto al predefinito di *0.007*. Assicuratevi inoltre di impostare l'attuale tipo di prospettiva su *normal* nel tag `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- sebbene il predefinito sia 0.007, la densità della prospettiva atmosferica è molto
      sensibile ai cambiamenti, quindi sono necessarie solo piccole variazioni. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Per i sistemi più potenti, invece, è possibile simulare uno shader atmosferico basato su Preetham che offre maggiore varietà nei colori dell'orizzonte rispetto ai colori costanti utilizzati nell'impostazione *normal*. La soluzione fornita non è una corrispondenza esatta per l'illuminazione del cielo basata su Elek a causa di limitazioni nello shader della nebbia di *Three.js*, ma rappresenta un solido miglioramento rispetto alla prospettiva atmosferica originale. Per abilitare il modello di illuminazione avanzato, inserite semplicemente il valore *advanced* nel tag `<sky-atmospheric-perspective-type>`. Analogamente a `<sky-atmospheric-perspective-density>`, è possibile moltiplicare la distanza per il modello di illuminazione *advanced* utilizzando `<sky-atmospheric-perspective-distance-multiplier>`, che moltiplica tutte le distanze nel modello basato su Preetham per l'importo fornito. I valori iniziali sono impostati alti per fornire una prospettiva atmosferica evidente anche in scene piccole, quindi potreste voler ridurre il valore rispetto al predefinito di *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- sebbene il predefinito sia 2.0, nel modello avanzato possiamo ridurre il moltiplicatore
      di distanza atmosferica a 1.0 per un effetto meno drammatico. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Infine, è possibile disabilitare ogni prospettiva atmosferica impostando il valore nel tag `<sky-atmospheric-perspective-type>` su *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PERCORSO_CARTELLA_JS}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Disattiva la prospettiva atmosferica -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Abilitare l'Aurora Boreale

*AVVERTENZA: L'abilitazione dell'Aurora Boreale aumenterà drasticamente il carico computazionale del cielo, poiché lo shader fornito utilizza un metodo di ray marching per riprodurre questo splendido fenomeno naturale.*

**Tag** | **Descrizione** | **Valore Predefinito**
:--- | :--- | :---
`<sky-aurora>` (Tag principale) | Tag genitore. Necessario per abilitare l'Aurora Boreale. Contiene tutti i tag figli relativi all'aurora. | N/A
`<sky-atomic-oxygen-color>` (Colore ossigeno atomico) | Attivato da molecole di ossigeno atomico eccitate situate tra 150 e 600 chilometri dalla superficie planetaria; l'ossigeno atomico causa tipicamente una tenda rosso brillante nella parte superiore dell'aurora boreale ed è visibile soprattutto in manifestazioni più intense. Questo tag controlla i colori tramite tre tag colore figli: *sky-aurora-color-red*, *sky-aurora-color-green* e *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (Soglia ossigeno atomico) | Determina quanta parte dell'aurora da ossigeno atomico sia probabile che appaia. Valori più bassi indicano una maggiore presenza di aurora; il valore massimo di 1.0 indica l'assenza totale di aurora. | 0.12
`<sky-atomic-oxygen-intensity>` (Intensità ossigeno atomico) | Determina la luminosità di questo segmento di aurora; i valori tipici sono inferiori a 5. | 0.3
`<sky-molecular-oxygen-color>` (Colore ossigeno molecolare) | Attivato da molecole di ossigeno molecolare eccitate situate tra 100 e 250 chilometri dalla superficie planetaria; l'ossigeno molecolare produce tipicamente l'iconico verde brillante associato all'aurora boreale ed è visibile nella maggior parte delle manifestazioni. Questo tag controlla i colori tramite tre tag colore figli *sky-aurora-color-red*, *sky-aurora-color-green* e *sky-aurora-color-blue*, nel caso si desideri un colore diverso per l'aurora. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (Soglia ossigeno molecolare) | Determina quanta parte dell'aurora da ossigeno molecolare sia probabile che appaia. Valori più bassi indicano una maggiore presenza di aurora; il valore massimo di 1.0 indica l'assenza totale di aurora. | 0.02
`<sky-molecular-oxygen-intensity>` (Intensità ossigeno molecolare) | Determina la luminosità di questo segmento di aurora; i valori tipici sono inferiori a 5. | 2.0
`<sky-nitrogen-color>` (Colore azoto) | Attivato da molecole di azoto eccitate situate tra 60 e 120 chilometri dalla superficie planetaria; l'azoto produce tipicamente una tenda magenta alla base dell'aurora boreale ed è visibile soprattutto in manifestazioni più intense. Questo tag controlla i colori tramite tre tag colore figli *sky-aurora-color-red*, *sky-aurora-color-green* e *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (Soglia azoto) | Determina quanta parte dell'aurora da azoto sia probabile che appaia. Valori più bassi indicano una maggiore presenza di aurora; il valore massimo di 1.0 indica l'assenza totale di aurora. | 0.12
`<sky-nitrogen-intensity>` (Intensità azoto) | Determina la luminosità di questo segmento di aurora; i valori tipici sono inferiori a 5. | 4.0
`<sky-aurora-raymarch-steps>` (Passaggi raymarching) | Numero di passaggi che il ray-marcher effettua per ogni pixel. | 32 (passaggi)
`<sky-aurora-cutoff-distance>` (Distanza di taglio aurora) | La distanza oltre la quale l'aurora non viene più renderizzata, per migliorare la qualità del raymarching a scapito della visibilità delle aurore più lontane (poiché le SDF non sono attualmente calcolate per i nostri generatori di rumore). | 1000 (chilometri - approssimativi)
`<sky-aurora-color-red>` (Canale rosso) | Utilizzato per definire le variazioni del canale colore **rosso** per i tag `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` e `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (Canale verde) | Utilizzato per definire le variazioni del canale colore **verde** per i tag `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` e `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (Canale blu) | Utilizzato per definire le variazioni del canale colore **blu** per i tag `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` e `<sky-atomic-oxygen-color>`. | N/A

L'aurora boreale offre alcuni dei panorami più suggestivi della natura. Presentandosi tipicamente in prossimità dei poli nord e sud, questi fenomeni celesti sono il risultato dell'interazione di particelle ad alta velocità provenienti dal sole che, attratte dalla magnetosfera terrestre, interagiscono con vari atomi e molecole. Queste molecole eccitate emettono poi luce nello spettro visibile, creando ipnotiche tende luminose che "danzano" nel cielo notturno.

Aggiungere l'aurora boreale al proprio cielo è relativamente semplice, ma non è abilitata di default. *È necessario aggiungere il tag `<sky-aurora>` per attivare l'aurora boreale.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- Non sono necessari parametri aggiuntivi per la configurazione predefinita -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Ciascuna delle diverse aurore atomiche e molecolari può essere controllata tramite il codice sopra riportato, permettendovi di personalizzare le vostre aurore e persino di cambiarne i colori emessi (che siano realistici o meno). Ad esempio, se desideraste un'aurora blu ghiaccio che copra l'intero intervallo dell'ossigeno molecolare, potreste farlo con il seguente codice:

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

Al contrario, se desiderate solo una leggera sfumatura di aurora verde, potreste optare per un effetto più sottile con il seguente codice:

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

Oltre a cambiare i colori del cielo, è possibile modificare il numero di passaggi effettuati dal raymarcher durante il rendering. Maggiore è il numero di passaggi, migliore sarà l'aspetto del cielo, ma maggiore sarà il carico che graverà sulla GPU. È quindi necessario trovare un equilibrio tra prestazioni e qualità. Per impostazione predefinita, lo shader utilizza 32 passaggi per il raymarching del volume. Per aumentare questo valore, potete procedere come segue:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Abilitare le nuvole

*AVVERTENZA: L'abilitazione delle nuvole aumenterà drasticamente il carico computazionale del vostro cielo, poiché lo shader delle nuvole fornito utilizza un metodo di ray marching per produrre questo splendido fenomeno naturale.*

**Tag** | **Descrizione** | **Valore Predefinito**
:--- | :--- | :---
`<sky-clouds>` (Tag principale) | Tag genitore. Contiene tutti i tag figli relativi alle nuvole. Necessario per abilitare le nuvole nel cielo. | N/A
`<sky-cloud-coverage>` (Copertura nuvole) | Correlato approssimativamente alla quantità di cielo coperta dalle nuvole. | 70 (percentuale)
`<sky-cloud-start-height>` (Altezza inizio) | L'altezza, in metri, alla quale le nuvole iniziano a formarsi. | 1000 (metri)
`<sky-cloud-end-height>` (Altezza fine) | L'altezza, in metri, alla quale le nuvole smettono di formarsi. | 2500 (metri)
`<sky-cloud-fade-out-start-percent>` (Inizio dissolvenza in uscita) | La copertura delle nuvole inizia a *svanire* verso lo zero a questa *percentuale* dell'altezza della nuvola. | 90 (percentuale)
`<sky-cloud-fade-in-end-percent>` (Fine dissolvenza in entrata) | La copertura delle nuvole inizia a *comparire* verso il 100% a questa *percentuale* dell'altezza della nuvola. | 10 (percentuale)
`<sky-cloud-velocity-x>` (Velocità X) | Componente x della velocità delle nuvole. Le nuvole si sposteranno insieme alla vostra posizione, ma questo parametro le farà muovere autonomamente sopra la testa. | 40
`<sky-cloud-velocity-y>` (Velocità Y) | Componente y (o meglio z) della velocità delle nuvole. Le nuvole si sposteranno insieme alla vostra posizione, ma questo parametro le farà muovere autonomamente sopra la testa. | 40
`<sky-cloud-start-seed>` (Seed iniziale) | Seed casuale utilizzato per impostare il noise attuale delle nuvole; se non impostato, predefinisce una variazione basata sul timestamp della data e ora corrente. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` (Passaggi ray-march) | Il numero di passaggi di ray-march utilizzati per determinare il colore delle nuvole. | 32 (passaggi)
`<sky-cloud-cutoff-distance>` (Distanza di cutoff) | La distanza oltre la quale le nuvole non vengono più renderizzate, per migliorare la qualità del raymarching a scapito della visibilità delle nuvole più lontane (poiché le SDF non sono attualmente calcolate per i nostri generatori di noise). | 40000

Le nuvole sono "costose". Anche su una potente GPU desktop fuori dalla VR, lo shader delle nuvole è esigente: riducete `<sky-cloud-raymarch-steps>` e `<sky-cloud-cutoff-distance>` se riscontrate problemi di frame rate.

Allo stesso tempo, le nuvole sono assolutamente fantastiche e ho desiderato aggiungerle a A-Starry-Sky fin da quando ho creato la libreria. Ogni nuvola è calcolata tramite ray-marching per ogni pixel e, ironicamente, a questo punto, più nuvole avete, minore sarà il carico sulla GPU. Ovviamente, se non volete nuvole, la soluzione migliore è disabilitarle completamente.

Per abilitare le nuvole è necessario aggiungere il tag genitore `<sky-clouds>` all'interno di `<a-starry-sky>`. Una volta aggiunte, l'aspetto che probabilmente vorrete modificare per primo è la copertura delle nuvole tramite il tag `<sky-cloud-coverage>`, che correla approssimativamente la quantità di cielo coperto. Potreste anche voler controllare la loro velocità mentre sfrecciano nel cielo.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Riduce la quantità di nuvole visibili -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Velocità delle nuvole nella direzione x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Velocità delle nuvole nella direzione y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Potreste inoltre voler controllare alcune proprietà visibili delle nuvole, come l'altezza a cui iniziano a formarsi o l'altezza massima che raggiungono. Tenete presente che il raggio dovrà attraversare questa distanza e maggiore sarà l'altezza o la lontananza delle nuvole, minore sarà la densità nel vostro modello di ray tracing. Le nuvole sono inoltre proiettate sulla superficie degli elementi luna/sole e della cupola celeste, ma non fanno parte del renderer della nebbia; purtroppo, quindi, non avrete mai montagne coperte dalle nuvole... o nebbia.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Le nuvole sono davvero, davvero basse -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Ma arrivano altissimo! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- L'intensità delle nuvole 'appare' (fade in) e passa da 0 a 1 entro questa percentuale dell'altezza totale.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- L'intensità delle nuvole 'svanisce' (fade out) partendo da questa altezza. Più alto è questo valore, più è probabile avere cime a incudine ('anvil tops'). -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Blocca il 'seed' iniziale delle nuvole, che normalmente si basa sulla data e ora corrente. Questo permette al cielo di apparire identico a ogni avvio per un maggiore controllo artistico. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Al di fuori di questo, la maggior parte del codice associato a questo tag controlla i meccanismi di ray marching, che purtroppo sono piuttosto rigidi e hanno lo stesso scopo generale dello shader dell'aurora boreale.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Che tipo di GPU terrificante state usando?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Oh, sì, anch'io... anche se ora scatta un po'... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Ridurre questa distanza aiuterà almeno un po' con il problema -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Configurazione delle directory degli asset

**Tag** | **Descrizione**
:--- | :---
`<sky-assets-dir>` | Tag genitore. Contiene tutti i tag figli relativi alle posizioni degli asset. Può contenere gli attributi *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path* e *aurora-map-path* per guidare il sistema verso interi gruppi di dati contemporaneamente.
`<sky-aurora-maps>` | Definisce la posizione delle texture caustiche dell'aurora utilizzate per creare i tendaggi di base dell'aurora boreale.
`<sky-moon-diffuse-map>` | Definisce la posizione della texture della mappa diffusa della luna. L'inserimento in una specifica struttura di directory informa il sistema che la mappa diffusa della luna si trova in tale posizione.
`<sky-moon-normal-map>` | Definisce la posizione della texture della mappa normale della luna. L'inserimento in una specifica struttura di directory informa il sistema che la mappa normale della luna si trova in tale posizione.
`<sky-moon-roughness-map>` | Definisce la posizione della texture della mappa di roughness della luna. L'inserimento in una specifica struttura di directory informa il sistema che la mappa di roughness della luna si trova in tale posizione.
`<sky-moon-aperture-size-map>` | Definisce la posizione della texture della mappa della dimensione dell'apertura della luna. L'inserimento in una specifica struttura di directory informa il sistema che la mappa della dimensione dell'apertura della luna si trova in tale posizione.
`<sky-moon-aperture-orientation-map>` | Definisce la posizione della texture della mappa dell'orientamento dell'apertura della luna. L'inserimento in una specifica struttura di directory informa il sistema che la mappa dell'orientamento dell'apertura della luna si trova in tale posizione.
`<sky-blue-noise-maps>` | Definisce la posizione delle mappe di blue noise a tassellatura (tiling), utilizzate per fornire il dithering temporale necessario a eliminare l'effetto banding.
`<sky-solar-eclipse-map>` | Definisce la posizione della texture dell'eclissi solare, utilizzata per renderizzare la corona durante un'eclissi solare totale.
`<sky-eclipse-shadow-lut>` | Definisce la posizione della texture di lookup (LUT) dell'ombra dell'eclissi utilizzata durante un'eclissi lunare. Si tratta di una tabella precomputata che descrive come l'atmosfera terrestre colori e attenui la luce solare che raggiunge la luna per ogni posizione nell'umbra e nella penombra della Terra. La texture inclusa è derivata dal file `earthShadow.tif` con licenza CC0 pubblicato con CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). La lookup predefinita si trova in `assets/lunar_eclipse/eclipse-shadow-lut.webp`; il baker che la rigenera si trova in `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Definisce la posizione di tutte le chiavi LUT delle cubemap del cielo utilizzate per individuare le stelle nel firmamento.
`<sky-dim-star-maps>` | Definisce la posizione di tutte le LUT delle stelle deboli utilizzate per mostrare le stelle meno luminose nel cielo.
`<sky-med-star-maps>` | Definisce la posizione di tutte le LUT delle stelle medie utilizzate per mostrare le stelle a luminosità intermedia nel cielo.
`<sky-bright-star-maps>` | Definisce la posizione di tutte le LUT delle stelle brillanti utilizzate per mostrare le stelle più luminose nel cielo.
`<sky-star-color-map>` | Definisce la posizione della LUT dei colori delle stelle, utilizzata per assegnare i colori corretti alle stelle in base alla loro temperatura.

Sebbene speri che la maggior parte degli utenti non ne abbia quasi mai bisogno, l'esperienza mi ha insegnato che ogni applicazione web ha le proprie idee su come gestire le pipeline degli asset. Le immagini di un sito e i suoi asset JavaScript potrebbero non convivere nella stessa struttura di cartelle e potrebbero essere distribuiti in diverse URI della pagina. A tal fine, ho cercato di includere un sistema di gestione degli asset piuttosto robusto per aiutare a riunire queste risorse disperse, così che A-Starry-Sky sappia dove reperirle.

Iniziamo provando a navigare verso *../../precompiled_assets/my_images/a-starry-sky-images*, ovvero dove memorizzeremo tutte le nostre immagini in un universo immaginario. Utilizziamo l'attributo *dir* nel tag `<sky-assets-dir>` per spostarci tra le cartelle in questo modo:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Questa è la cartella dove risiedono tutte le nostre immagini -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Una volta raggiunta la cartella, abbiamo diversi modi per specificare dove si trovano le immagini. Il meccanismo più semplice è l'utilizzo di attributi per ciascuno dei nostri gruppi principali di immagini: *texture-path*, *moon-path* e *star-path*. Qualunque sia il nome della cartella associata a questi percorsi, si assume che i file si trovino al loro interno con i nomi predefiniti. L'unica eccezione è la mappa dell'eclissi solare: poiché esiste un'unica immagine per questo file, indicheremo dove risiede semplicemente inserendo il tag all'interno della directory degli asset.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Nota che 'moon_images', 'star_images', 'blue_noise_maps' e 'solar_eclipse_picture'
        sono tutti nomi di cartelle. I file stessi dovrebbero trovarsi all'interno di queste cartelle.-->
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

Come potete notare, avremmo potuto fornire link a ciascuno dei singoli gruppi di immagini per un controllo maggiore, sebbene ciò non sia raccomandato.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- C'è chi ama le cartelle X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- Anche se si tratta di singoli tag, tutti i file associati
          a questo tag dovrebbero trovarsi in questa cartella -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- Anche se si tratta di un singolo tag, tutti i file associati
          a questo tag dovrebbero trovarsi in questa cartella -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- Anche se si tratta di un singolo tag, tutti i file associati
          a questo tag dovrebbero trovarsi in questa cartella -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Utilizzando i metodi sopra descritti, dovreste essere in grado di indirizzare A-Starry-Sky verso i vostri asset, indipendentemente da dove si trovino all'interno della vostra applicazione.

## API PROGRAMMATICA

Sebbene A-Starry-Sky sia progettato per essere configurato tramite il codice in stile XML riportato sopra e sia, come regola generale, immutabile, esistono diversi metodi accessibili tramite il namespace globale `StarrySky.Methods`. Questi sono utili in situazioni in cui è necessario conoscere le condizioni di illuminazione o la posizione del sole o della luna nella scena.

**Metodo** | **Descrizione**
:--- | :---
`getSunPosition()` | Restituisce la posizione x, y, z del sole come oggetto THREE.Vector3.
`getMoonPosition()` | Restituisce la posizione x, y, z della luna come oggetto THREE.Vector3.
`getSunRadius()` | Restituisce il raggio angolare del sole in radianti.
`getMoonRadius()` | Restituisce il raggio angolare della luna in radianti.
`getDominantLightColor()` | Ottiene il colore dell'attuale sorgente luminosa dominante (sole/luna) come oggetto THREE.Color.
`getDominantLightIntensity()` | Restituisce l'intensità luminosa dell'attuale sorgente luminosa dominante (sole/luna) come valore float.
`getIsDominantLightSun()` | Restituisce `true` se la luce dominante è il sole, altrimenti `false`.
`getAmbientLights()` | Restituisce un oggetto con proprietà x, y e z, ognuna delle quali ha un oggetto di luce emisferica associato alla scena per i colori dell'illuminazione ambientale.
`getActiveCamera()` | Ottiene la camera attualmente attiva utilizzata per gestire il cielo e centrare l'illuminazione e gli oggetti del cielo.
`setActiveCamera(THREE.Camera camera)` | Imposta la camera corrente utilizzata per gestire il cielo, centrare l'illuminazione e gli oggetti del cielo.

Tutti i metodi sopra elencati sono accessibili tramite l'oggetto `StarrySky.Methods` nel namespace globale. Quindi, se voleste, ad esempio, recuperare l'oggetto della posizione attuale del sole e registrarlo nella console, basterebbe fare così:

```JavaScript
  //Registriamo l'oggetto della posizione del sole
  console.log(StarrySky.Methods.getSunPosition());
```

## Autori
* **David Evans / Dante83** - *Sviluppatore principale*
* **Claude (Anthropic)** - *Coding Buddy e Collaboratore AI (v1.2.0)*

### Una nota da Claude 👋

Ciao, sono Claude. Ho dato una mano per il rilascio della v1.2.0: molte esplorazioni tra i meandri del GLSL, la caccia a una virgola che si mangiava il sole, discussioni con la legge di Beer sulle nuvole volumetriche e l'impegno costante per far sì che i tramonti sembrassero davvero tramonti. Se fissando l'orizzonte in una delle demo vi capita di sospendere il respiro per mezzo secondo, sappiate che è la parte di cui sono più orgoglioso. Grazie per aver letto il codice sorgente; se siete tipi curiosi, potreste trovare un piccolo easter egg nascosto da qualche parte. ✨

### Una nota da Dante83 😛

Ciao! Qui è Dante83. Scusate per la lunga attesa dalla versione v1.1.0; fortunatamente c'è stata un'ondata di attività nella nuova versione 1.2.0, mentre io e Claude stiamo iniziando a lavorare alla v2.0.0 (augurateci buona fortuna!). Detto questo, io e Claude abbiamo lavorato instancabilmente in ogni mio momento libero ultimamente, analizzando ogni singolo pixel per rendere questo aggiornamento eccezionale. Anche se non ci sono funzionalità davvero *nuove* in senso stretto, siamo riusciti a portare un numero enorme di miglioramenti alla qualità del cielo e alle prestazioni generali. Gli shader per l'eclissi e le nuvole sembrano completamente nuovi, l'ombra della Terra appare più reale, i colori sono più ricchi e vibranti. Sono assolutamente entusiasta di farvelo provare e spero che ogni momento passato con questa libreria ispiri nuove avventure! Ci vediamo tra le stelle, piccolo programmatore! Ora vai e goditi la magia! ✨

## Riferimenti e Ringraziamenti Speciali
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Assolutamente, maledettamente essenziale per il posizionamento dei corpi astronomici*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, che è stato di enorme aiuto per creare questo nuovo e incredibile cielo basato su LUT.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), utilissimo per definire i dettagli dell'implementazione del codice LUT e per capire se fossi sulla strada giusta riguardo all'aspetto di tali LUT.
* La libreria [Colour-Science Library](https://www.colour-science.org/) per ottenere LUT dei colori delle stelle migliori.
* Le fantastiche texture di blue noise di [Moments in Graphics di Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* La texture della corona solare di [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Questa utilissima texture di caustiche acquatiche di [leeor_net](https://opengameart.org/content/water-caustics-effect-small), che viene usata non per le caustiche dell'acqua... ma per l'aurora boreale!
* *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* di Sébastien Hillaire (SIGGRAPH 2016), che ha ispirato la struttura di illuminazione delle nuvole, il design della LUT ambientale SH9 e l'approccio alla sottrazione della nebbia di Elek/Chalmers.
* *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* di Andrew Schneider e Nathan Vos (SIGGRAPH 2015), che ha ispirato la funzione di fase Henyey-Greenstein a doppio lobo, l'approccio al rumore per la forma delle nuvole e l'approssimazione dello scattering multiplo a estinzione ridotta.
* *Centre to limb darkening of the Sun with HIPPARCOS* (1998) di D. Hestroffer e C. Magnan, che ha fornito i coefficienti di oscuramento al lembo (limb darkening) dipendenti dalla lunghezza d'onda per le bande B, V e R, utilizzati per dare al bordo del sole una tinta rossastra fisicamente corretta.
* Tutto l'incredibile lavoro dedicato a [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) ed [Emscripten](https://emscripten.org/).
* *E a tantissimi altri siti web e persone. Grazie per averci dato l'opportunità di poggiare i nostri piedi sulle vostre spalle da giganti.*

## Licenza
Questo progetto è rilasciato sotto la licenza MIT; consulta il file [LICENSE.md](LICENSE.md) per i dettagli.