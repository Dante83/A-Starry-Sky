# A-Starry-Sky

O A-Starry-Sky é uma cúpula celeste para o [A-Frame Web Framework](https://aframe.io/). Seu objetivo é fornecer um componente simples e pronto para uso que você pode utilizar para criar belos ciclos de dia e noite em suas criações.

> **Aviso: requer uma GPU potente — não abra em dispositivos móveis.**

**[Demonstração ao vivo](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — O céu na data e hora atuais em San Francisco.

| Exemplo | Descrição |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Cena de deserto em um momento específico do dia |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Eclipse solar total com corona |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Sombra da Terra na Lua |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Grande conjunção de Júpiter e Saturno |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Atmosfera marciana personalizada |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Diferentes valores de espalhamento de Mie/Rayleigh |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Céu a 20 km de altitude |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ Exigente para a GPU |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ Exigente para a GPU |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ Exigente para a GPU |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ Exigente para a GPU |

## Pré-requisitos

Este projeto foi desenvolvido para o [A-Frame Web Framework](https://aframe.io/) na versão 1.7.0+. Também é necessário um navegador compatível com WebXR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Instalação

Copie o arquivo *a-starry-sky.v1.2.0.min.js* e as pastas *assets* e *wasm* para o seu projeto. Adicione os seguintes scripts ao seu HTML — observe que o `starry-sky-web-worker.js` **não** está incluído aqui; ele é referenciado diretamente na tag `<a-starry-sky>`.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

Assim que essas referências estiverem configuradas, adicione o componente `<a-starry-sky>` dentro da sua tag `<a-scene>` do A-Frame com uma referência à URL do seu web worker de estado do céu (sky-state), desta forma:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Este código básico fornecerá um céu que se move em tempo real na latitude e longitude de San Francisco, Califórnia. No entanto, podemos fazer muito mais do que isso. O A-Starry-Sky vem com diversas tags HTML personalizadas para ajudar a customizar o estado do seu céu.

**NOTA: Este sky box é imutável. Isso significa que as configurações iniciais permanecerão constantes em qualquer página. Infelizmente, no momento, é difícil demais tornar o código mutável.**

## Definindo a Localização

**Tag** | **Descrição** | **Valor Padrão**
:--- | :--- | :---
`<sky-location>` | Tag pai. Contém as tags filhas de latitude e longitude do céu. | N/A
`<sky-latitude>` | Define a latitude da localização. Ao norte do equador, o valor é **positivo**. | 38
`<sky-longitude>` | Define a longitude da localização. A oeste do [meridiano de Greenwich](https://en.wikipedia.org/wiki/Prime_meridian) é **negativo**. | -122

Você pode configurar o seu céu para qualquer latitude e longitude no planeta Terra. As localizações são úteis para proporcionar aos seus jogadores uma sensação de estações do ano, alterando os arcos do sol ou da lua. A latitude também determinará quais estrelas estarão visíveis no seu céu noturno. Tanto a latitude quanto a longitude são fundamentais para eventos dependentes do tempo, como eclipses solares e lunares. Isso é especialmente verdade para eclipses solares, caso você deseje experienciar um eclipse solar total. Dito isso, definir a localização é mais fácil do que decidir onde estar. Basta pegar a localização desejada no [Google Earth](https://earth.google.com/web/) ou em qualquer outra fonte de mapas e inserir os valores em suas respectivas tags, como mostrado abaixo:

Vamos para Nova York!
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

Certo, mas e quanto a Perth, na Austrália?
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

Observe que as longitudes a oeste do [meridiano de Greenwich](https://en.wikipedia.org/wiki/Prime_meridian) são negativas (ex: Nova York, Buenos Aires).

## Configurando a Hora

**Tag** | **Descrição** | **Valor Padrão**
:--- | :--- | :---
`<sky-time>` | Tag pai. Contém todas as tags filhas relacionadas aos elementos de data ou hora. | N/A
`<sky-date>` | A string de data e hora local no formato **ANO-MÊS-DIA HORA:MINUTO:SEGUNDO**/*2021-03-21 13:45:51*. Os valores de hora também são baseados em um sistema de 0 a 23 horas. 0 corresponde às 0h (meia-noite) e 23 às 23h. | Data Atual
`<sky-speed>` | O multiplicador de tempo usado para acelerar ou desacelerar os cálculos astronômicos. | 1.0
`<sky-utc-offset>` | O deslocamento UTC (UTC-Offset) para este local. Valores negativos ficam a oeste do [meridiano de Greenwich](https://en.wikipedia.org/wiki/Prime_meridian), ao contrário dos valores de longitude. **Note que o horário UTC não segue o Horário de Verão (DST)** | 7

Defina `<sky-date>` para a **hora local** do local escolhido e, em seguida, configure `<sky-utc-offset>` para corresponder a esse fuso horário. Por exemplo, a cidade de Nova York é UTC-4 (verão) ou UTC-5 (inverno) — o Horário de Verão não é aplicado automaticamente.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Configurações de localização anteriores -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- Você pode configurar o offset UTC assim! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Note que você adicionará novamente a tag pai `<sky-time>`, que contém todas as tags filhas relevantes para nossas configurações de tempo.

Dito isso, você não precisa ficar preso apenas ao horário da máquina local. Por que não fazemos algo um pouco mais interessante, como uma viagem no tempo? Ouvi dizer que haverá um [eclipse solar](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) emocionante em [8 de abril de 2024, às 13:27 (horário de 24h), em Del Rio, Texas](https://nationaleclipse.com/cities_total.html). Vamos dar uma olhada!

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

Você perdeu a [Estrela de Natal](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? Não, não. Não aquela. Aquela do ano 1226 d.C. Bem, ainda bem que temos uma máquina do tempo e que o A-Starry-Sky agora suporta planetas :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Viajar no tempo é divertido, mas você também pode ter interesse em alterar a *velocidade* do tempo. Ciclos de dia e noite costumam passar mais rápido em mundos de jogos do que na realidade, ou talvez você queira parar o tempo permanentemente para capturar um momento específico para fins de iluminação. Para fazer isso, adicione a tag `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Haverá oito dias no mundo virtual para cada dia real. -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Naturalmente, se você estiver fazendo isso em um mundo persistente, certifique-se de levar em conta o fluxo acelerado do tempo ao criar seu HTML. No entanto, a configuração de um HTML dinâmico para o seu céu fica a seu critério.

## Modificando as Configurações Atmosféricas

**Tag** | **Descrição** | **Valor Padrão**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Tag pai. Contém todas as tags filhas relacionadas às configurações atmosféricas. | N/A
`<sky-camera-height>` | A altura da câmera acima da terra. | 0.0km
`<sky-mie-directional-g>` | Descreve quanto de luz é dispersa para frente pelo espalhamento Mie, que é o halo esbranquiçado visto ao redor do sol causado por partículas maiores na atmosfera. Quanto maior o mie-directional G, mais poeirenta a atmosfera parece. | 0.8
`<sky-sun-intensity>` | A intensidade do sol no shader atmosférico. | 1367.0
`<sky-moon-intensity>` | A intensidade da lua no shader atmosférico. | 29.0
`<sky-mie-beta>` | Dependência de cor do espalhamento de luz para o espalhamento Mie, que é primariamente responsável pelo "brilho" próximo ao sol. O espalhamento é bastante uniforme em todas as frequências. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Dependência de cor do espalhamento de luz para o espalhamento Rayleigh, que é primariamente responsável pelo espalhamento azul no céu. Note que o canal azul possui o maior espalhamento por padrão. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Dependência de cor do espalhamento de luz para a camada de ozônio, fundamental para os azuis profundos durante o pôr do sol. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | A altura de corte após a qual a atmosfera "termina". | 80.0 km
`<sky-radius-of-earth>` | O raio do planeta ou da Terra. | 6366.7 km
`<sky-rayleigh-scale-height>` | A altura de escala de decaimento para o espalhamento Rayleigh, assumindo um decaimento exponencial. O espalhamento Rayleigh provém de gases atmosféricos e, portanto, possui uma altura de escala muito maior. | 8.4
`<sky-mie-scale-height>` | A altura de escala de decaimento para o espalhamento Mie, assumindo um decaimento exponencial. O espalhamento Mie provém de partículas maiores, tendendo a decair mais rapidamente; logo, possui um escalonador de altura característica menor. | 1.25
`<sky-ozone-percent-of-rayleigh>` | A porcentagem de ozônio atualmente no céu, usada para definir o retorno do ozônio ao pôr do sol. | 6E-7
`<sky-moon-angular-diameter>` | O diâmetro angular da lua conforme aparece no céu.  | 3.15 graus
`<sky-sun-angular-diameter>` | O diâmetro angular do sol conforme aparece no céu. | 3.38 graus
`<sky-number-of-atmospheric-lut-ray-steps>` | O número de passos até a borda do céu que o ray tracer realiza ao coletar luz para as LUTs atmosféricas. | 30 passos
`<sky-number-of-atmospheric-lut-gathering-steps>` | O número de passos angulares realizados em cada ponto ao longo do raio para espalhamento de ordem k. | 30 passos
`<sky-number-of-scattering-orders>` | O número de passagens de espalhamento de ordem superior (k) para processar na LUT de inscattering. Valores mais altos aumentam a qualidade ao custo do tempo de processamento da LUT. | 4
`<sky-parameters-color-red>` | o componente vermelho usado nas tags `<sky-rayleigh-beta>`, `<sky-mie-beta>` e `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | o componente verde usado nas tags `<sky-rayleigh-beta>`, `<sky-mie-beta>` e `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | o componente azul usado nas tags `<sky-rayleigh-beta>`, `<sky-mie-beta>` e `<sky-ozone-beta>`. | N/A

Os parâmetros atmosféricos possuem uma das APIs mais extensas de toda a base de código. Embora esses valores possam ser usados por desenvolvedores experientes para criar céus personalizados, a maioria dos usuários preferirá manter os padrões. No entanto, alguns valores aqui são particularmente úteis e relativamente fáceis de entender.

Um dos elementos que você provavelmente desejará alterar é o tamanho do sol e da lua. Na vida real, o sol tem um diâmetro angular de 0,53 graus e a lua tem um diâmetro angular de 0,50 graus. Usar esses valores no simulador representaria melhor a realidade, mas eles tendem a ser pequenos demais na maioria das simulações, especialmente em dispositivos que não são VR, como monitores. Para alterar esses valores para maiores ou menores, basta modificar as tags correspondentes.

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

Você também pode querer alterar sua altura inicial acima do planeta. Isso pode ser configurado facilmente com a tag `<sky-camera-height>`, embora o céu também se adapte dinamicamente à sua altura conforme você move a câmera para cima ou para baixo. Isso define a altura inicial da cena, em quilômetros, sendo a altura máxima *80km* e a mínima *0km*.

[Exemplo de Alta Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Vamos subir um pouco mais. O ar é mais rarefeito aqui em cima. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Você também pode desejar alterar a composição da sua atmosfera. Este elemento concede acesso a diversos mecanismos para controlar o visual do céu conforme sua preferência. Digamos, por exemplo, que você prefira os valores de Rayleigh apresentados em [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) em vez dos nossos valores nativos (5.8e-3, 1.35e-2, 3.31e-2) -> (5.19E-3, 1.21E-2, 2.96E-2), e que deseje usar um beta de 4.44E-3 -> 2E-3; você poderia facilmente substituí-los no código.

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

Mas isso não é tão emocionante; digamos que quiséssemos algo um pouco mais ousado. Vamos seguir o trabalho de [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) e ir para Marte! Aqui, eles invertem o uso de Rayleigh e Mie, então provavelmente deveríamos inverter suas alturas características também. A maior parte do espalhamento em Marte provém do espalhamento Mie de partículas grandes, com uma atmosfera muito tênue. Consequentemente, podemos praticamente desativar o mie (rayleigh) e trocar suas alturas características. Também devemos alterar o raio do planeta e talvez queiramos ajustar a altura atmosférica para obter valores melhores no ray tracer.

[Exemplo de Marte](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Note que Marte espalha mais a luz vermelha -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Algumas modificações no Mie também ajudam -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Certifique-se de desativar o ozônio -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Bem, no nosso caso, Marte... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- O sol é menor e a lua podemos eliminar completamente -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Você também pode ajustar a contagem de passos do raio da LUT, embora os padrões já sejam quase ideais e as mudanças raramente sejam perceptíveis.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Menor para desempenho, maior para precisão (o padrão 30 é ideal para a maioria dos casos) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Modificando os Padrões de Iluminação

**Tag** | **Descrição** | **Valor Padrão**
:--- | :--- | :---
`<sky-lighting>` | Tag pai. Contém todas as tags filhas relacionadas à iluminação da cena. | N/A
`<sky-sun-intensity>` | Multiplicador de intensidade para a luz solar; pode ser usado para aumentar ou diminuir o brilho da iluminação direcional solar. | 1.0
`<sky-moon-intensity>` | Multiplicador de intensidade para a luz lunar; pode ser usado para aumentar ou diminuir o brilho da iluminação direcional lunar. | 1.0
`<sky-ambient-intensity>` | Multiplicador de intensidade para a iluminação ambiente; pode ser usado para aumentar ou diminuir a intensidade do sistema de iluminação ambiente. | 2.0
`<sky-minimum-ambient-lighting>` | A quantidade mínima de luz ambiente no sistema. | 0.01
`<sky-maximum-ambient-lighting>` | A quantidade máxima de luz ambiente no sistema. | INF
`<sky-atmospheric-perspective-type>` | Pode ser definido como *normal*, *advanced* ou *none*. Necessário para a névoa da cena (*scene fog*). O modo *normal* utiliza o modelo original de névoa exponencial; o modo *advanced* utiliza um modelo baseado em Preetham para melhorar a variação de cor no horizonte, ao custo de maior carga na GPU. | normal
`<sky-atmospheric-perspective-density>` | Apenas para névoa *normal*. Controla o parâmetro de densidade para a névoa exponencial da cena. A cor é definida automaticamente a partir da iluminação da cena. Ignorado se o tipo de névoa for *advanced*. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | Apenas para névoa *advanced*. Multiplica a distância da névoa para o modelo de névoa avançada. | 2.0
`<sky-ground-color>` | Tag pai. Contém as tags `<sky-ground-color-{color-channel}>` para descrever a cor base do solo para iluminação reflexiva da superfície. | N/A
`<sky-ground-color-red>` | Usado para descrever alterações no canal de cor **vermelho** nas tags `<sky-ground-color>`. | 66
`<sky-ground-color-green>` | Usado para descrever alterações no canal de cor **verde** nas tags `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` | Usado para descrever alterações no canal de cor **azul** nas tags `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` | A resolução, em pixels, da câmera de iluminação direta usada para produzir sombras. Valores mais altos produzem sombras de maior qualidade com um custo maior de processamento. | 2048
`<sky-shadow-camera-size>` | O tamanho da área da câmera usada para projetar sombras. Tamanhos maiores resultam em mais área coberta por sombras, mas também causam problemas de *aliasing* ao espalhar cada pixel da câmera por uma área maior. | 32.0
`<sky-sun-bloom>` | Tag pai; contém todas as propriedades da passagem de renderização (*render pass*) de bloom do sol. | N/A
`<sky-moon-bloom>` | Tag pai; contém todas as propriedades da passagem de renderização (*render pass*) de bloom da lua. | N/A
`<sky-bloom-enabled>` | Ativa (true) ou desativa (false) o bloom neste objeto astronômico. | true
`<sky-bloom-exposure>` | Altera o parâmetro de exposição no filtro de bloom — a quantidade pela qual a luz retornada à câmera é multiplicada. | 1.0
`<sky-bloom-threshold>` | Altera o parâmetro de limiar (*threshold*) no filtro de bloom — a intensidade mínima para ativar o bloom. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | Altera o parâmetro de força (*strength*) no filtro de bloom — o quanto deve "brilhar" para os pixels selecionados. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | Altera o parâmetro de raio (*radius*) no filtro de bloom — a distância sobre a qual o filtro de bloom se espalha. | {sun: 1.0, moon: 1.4}

As tags de iluminação do céu são úteis para controlar atributos da iluminação direta e indireta na cena. Na versão 1.0.0, o número de luzes direcionais do céu foi reduzido de 2 (sol e lua) para 1 (apenas uma para a fonte de luz mais dominante). A luz direcional está sempre focada na câmera do usuário e cria sombras ao redor dela. Embora a luz direcional possa suportar vários tipos de sombra, esta biblioteca não é, na verdade, o local para controlar isso. Em vez disso, o tipo de sombra é definido na tag `<a-scene>`, conforme descrito [aqui](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). Ou seja, você pode definir os valores para qualquer um dos seguintes:

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

Infelizmente, no momento da redação deste texto, o A-Frame ainda não suporta *variance shadow maps*, embora haja um problema aberto sobre isso. Além disso, o tipo de sombra que você escolher para a iluminação do sol e da lua também será o tipo de sombra para todas as outras luzes na sua cena; leve isso em conta ao escolher suas sombras.

Você também pode controlar a qualidade das sombras através do tamanho e da resolução da câmera de sombras. Aumentar o tamanho cobre mais a cena; aumentar a resolução torna o resultado mais nítido — mas ambos têm um custo para a GPU, portanto, equilibre-os conforme suas necessidades. Também vale a pena desativar as sombras em malhas (*meshes*) grandes do ambiente, pois elas frequentemente ficam fora do *frustum* e produzem uma borda de sombra quadrada e feia.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Aumente o tamanho para projetar sombras mais longe da câmera -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Aumente a resolução para manter as sombras nítidas em tamanhos maiores -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Assim que as sombras da sua cena estiverem ajustadas, você provavelmente também desejará ajustar a cor do seu "solo" (*ground*). O *A-Starry-Sky* agora suporta uma configuração de iluminação hemisférica tripla que utiliza uma convolução sobre as cores do céu combinada com um modelo de dispersão de luz do solo em uma thread de CPU separada via *web workers*. No entanto, a cor padrão do solo é marrom. Você pode ter um campo gramado ou um oceano cerúleo. Para definir a cor do seu solo, você pode usar a tag `<sky-ground-color>` junto com suas tags filhas de canal de cor. Digamos que quiséssemos definir o solo como um verde brilhante para um campo de grama exuberante.

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

Observe que os valores acima são normalizados entre 0 e 255. Portanto, a combinação r, g, b 0, 0, 0 é preto e 255, 255, 255 é branco. A cor acima também pode ser um pouco brilhante, fazendo com que o solo pareça "brilhar" com a menor quantidade de luz. Para atenuar esse efeito, você pode apenas escurecer um pouco a cor.

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

Dito isso, se qualquer um dos seus canais de cor ultrapassar 255, infelizmente não há como "intensificar a cor" ou fazer o solo parecer "brilhar no escuro" no momento. Além disso, a cor do solo é constante em todos os pontos; portanto, se você tiver várias cores na sua cena, provavelmente seja melhor escolher uma que esteja no meio de todas as outras.

Além do suporte para iluminação do solo, agora você pode controlar diretamente as intensidades da iluminação direta e ambiente. Alterar a intensidade do sol ou da lua é fácil, pois basta usar um múltiplo do valor padrão para definir o quanto mais brilhante ou mais escuro você deseja que aquele corpo astronômico seja. Você também pode usar o mesmo método para amplificar ou diminuir a intensidade ambiente para aumentar ou reduzir a quantidade de iluminação ambiente na cena.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Vamos deixar o sol duas vezes mais brilhante -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- Mas vamos deixar a lua com metade do brilho -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- E vamos colocar dez vezes mais iluminação ambiente -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Você também pode querer controlar o limite mínimo (*floor*) ou máximo (*ceiling*) para a iluminação ambiente, para garantir que sempre haja uma certa quantidade de luz, ou um valor máximo.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Vamos clarear as coisas -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Mas sem exagerar. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Em algum momento, você pode desejar alterar os parâmetros dos efeitos de *bloom* adicionados ao sol ou à lua no céu. O *a-starry-sky* utiliza o [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) do THREE.JS. A intensidade para todos os objetos astronômicos é controlada separadamente com as tags pai `<sky-sun-bloom>` e `<sky-moon-bloom>`, respectivamente. As tags filhas dessas controlam as características do bloom.

Vamos começar alterando alguns parâmetros:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Vamos diminuir um pouco o brilho do sol -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Mas vamos aumentar a intensidade da lua -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Mas também podemos desativar o bloom inteiramente, o que reduz ligeiramente a carga na GPU.

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

O elemento final da iluminação do céu que você provavelmente desejará alterar é a densidade da perspectiva atmosférica. O *a-starry-sky* oferece dois modelos de névoa diferentes, dependendo das suas necessidades.
Para sistemas mais simples, ele suporta a perspectiva atmosférica exponencial básica, que coleta luz em todo o céu em um *web worker* e a aplica como uma névoa exponencial normal. Para controlar o parâmetro de densidade da iluminação exponencial, use a tag `<sky-atmospheric-perspective-density>`. Os valores iniciais são definidos como altos para proporcionar uma perspectiva atmosférica perceptível, mesmo em cenas pequenas, portanto, você pode desejar reduzir o valor do padrão *0.007*. Certifique-se também de definir o tipo de perspectiva atual como *normal* na tag `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Embora o padrão seja 0.007, a densidade da perspectiva atmosférica é muito
      sensível a alterações, portanto, apenas pequenas mudanças são necessárias. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Para sistemas de alto desempenho, no entanto, você pode simular um *shader* atmosférico baseado em Preetham que oferece mais variedade às cores do horizonte, em vez das cores constantes usadas na configuração *normal*. A solução fornecida não é uma correspondência exata para a iluminação do céu baseada em Elek usada no céu devido a limitações no *shader* de névoa do *Three.js*, mas oferece uma melhoria sólida em relação à perspectiva atmosférica original. Para ativar o modelo de iluminação avançada, basta inserir o valor *advanced* na tag `<sky-atmospheric-perspective-type>`. Semelhante ao `<sky-atmospheric-perspective-density>`, você pode multiplicar a distância para o modelo de iluminação *advanced* usando a tag `<sky-atmospheric-perspective-distance-multiplier>`, que multiplica todas as distâncias no modelo baseado em Preetham pelo valor fornecido. Os valores iniciais são definidos como altos para proporcionar uma perspectiva atmosférica perceptível, mesmo em cenas pequenas, portanto, você pode desejar reduzir o valor do padrão *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Embora o padrão seja 2.0, podemos reduzir o multiplicador de distância atmosférica no
      modelo advanced para 1.0 se quisermos um efeito menos dramático. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Finalmente, você pode desativar toda a perspectiva atmosférica definindo o valor na tag `<sky-atmospheric-perspective-type>` como *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Desativar a perspectiva atmosférica -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Habilitando a Aurora Boreal

*AVISO: Habilitar a Aurora Boreal aumentará drasticamente o peso computacional do seu céu, pois o shader de aurora fornecido utiliza um método de ray marching para produzir este belo fenômeno natural.*

**Tag** | **Descrição** | **Valor Padrão**
:--- | :--- | :---
`<sky-aurora>` (Aurora Boreal) | Tag pai. Necessária para habilitar a Aurora Boreal. Contém todas as tags filhas relacionadas à aurora. | N/A
`<sky-atomic-oxygen-color>` (Cor do oxigênio atômico) | Desencadeada por moléculas de oxigênio atômico excitadas localizadas entre 150 e 600 quilômetros da superfície planetária; o oxigênio atômico tipicamente causa uma cortina vermelha brilhante no topo da aurora boreal e é visto geralmente em exibições mais extremas. Esta tag controla essas cores usando três tags de cor filhas: *sky-aurora-color-red*, *sky-aurora-color-green* e *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (Corte do oxigênio atômico) | Determina quanta aurora de oxigênio atômico provavelmente estará presente na exibição. Números menores estão associados a mais aurora, com o valor máximo de 1.0 associado à ausência de aurora. | 0.12
`<sky-atomic-oxygen-intensity>` (Intensidade do oxigênio atômico) | Determina o brilho deste segmento da aurora; valores típicos são inferiores a 5. | 0.3
`<sky-molecular-oxygen-color>` (Cor do oxigênio molecular) | Desencadeada por moléculas de oxigênio molecular excitadas localizadas entre 100 e 250 quilômetros da superfície planetária; o oxigênio molecular tipicamente fornece o icônico verde brilhante associado à aurora boreal e é visto na maioria das exibições. Esta tag controla essas cores usando três tags de cor filhas *sky-aurora-color-red*, *sky-aurora-color-green* e *sky-aurora-color-blue*, caso você deseje uma cor diferente para sua aurora. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (Corte do oxigênio molecular) | Determina quanta aurora de oxigênio molecular provavelmente estará presente na exibição. Números menores estão associados a mais aurora, com o valor máximo de 1.0 associado à ausência de aurora. | 0.02
`<sky-molecular-oxygen-intensity>` (Intensidade do oxigênio molecular) | Determina o brilho deste segmento da aurora; valores típicos são inferiores a 5. | 2.0
`<sky-nitrogen-color>` (Cor do nitrogênio) | Desencadeada por moléculas de nitrogênio excitadas localizadas entre 60 e 120 quilômetros da superfície planetária; o nitrogênio tipicamente fornece uma cortina magenta ao redor da base da aurora boreal e é visto geralmente em exibições mais extremas. Esta tag controla essas cores usando três tags de cor filhas *sky-aurora-color-red*, *sky-aurora-color-green* e *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (Corte do nitrogênio) | Determina quanta aurora de nitrogênio provavelmente estará presente na exibição. Números menores estão associados a mais aurora, com o valor máximo de 1.0 associado à ausência de aurora. | 0.12
`<sky-nitrogen-intensity>` (Intensidade do nitrogênio) | Determina o brilho deste segmento da aurora; valores típicos são inferiores a 5. | 4.0
`<sky-aurora-raymarch-steps>` (Passos de raymarching) | Número de passos que o *ray-marcher* realiza por pixel. | 32 (passos)
`<sky-aurora-cutoff-distance>` (Distância de corte da aurora) | A distância após a qual a aurora deixa de ser renderizada para ajudar a melhorar a qualidade do *raymarching*, ao custo de não renderizar auroras mais distantes, já que SDFs não são calculadas atualmente para nossos geradores de ruído. | 1000 (quilômetros - aproximado)
`<sky-aurora-color-red>` (Canal vermelho) | Usado para descrever alterações no canal de cor **vermelho** nas tags `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` e `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (Canal verde) | Usado para descrever alterações no canal de cor **verde** nas tags `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` e `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (Canal azul) | Usado para descrever alterações no canal de cor **azul** nas tags `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` e `<sky-atomic-oxygen-color>`. | N/A

A Aurora Boreal proporciona alguns dos cenários mais belos da natureza. Existindo tipicamente perto dos polos norte e sul, esses fenômenos celestes representam a interação de partículas de alta velocidade vindas do sol ao serem atraídas para a magnetosfera da Terra e interagirem com vários átomos e moléculas. Essas moléculas excitadas irradiam luz no espectro visível, resultando em belas e hipnotizantes cortinas que "dançam" no céu noturno.

Adicionar a aurora boreal ao seu céu é relativamente fácil, mas ela não vem habilitada por padrão. *Você deve adicionar a tag `<sky-aurora>` para que a aurora boreal seja ativada.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- Você não precisa de parâmetros adicionais para obter a configuração padrão -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Cada uma das diferentes auroras atômicas e moleculares pode ser controlada pelo código acima, permitindo que você personalize suas exibições de aurora e até altere as cores emitidas (sejam elas realistas ou não). Por exemplo, se você quisesse uma aurora azul fria, cobrindo todo o intervalo de oxigênio molecular, poderia fazer isso com o seguinte código:

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

Por outro lado, se quiser apenas uma pequena quantidade de aurora verde, poderá optar por um efeito ligeiramente mais sutil com o seguinte código:

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

Além de alterar as cores do céu, você também pode mudar o número de passos realizados pelo *raymarcher* ao renderizar o céu. Quanto mais passos forem dados, melhor será a aparência do céu, mas maior será a carga sobre a sua GPU. Portanto, é necessário um equilíbrio entre desempenho e qualidade. Por padrão, o shader utiliza 32 passos ao realizar o *raymarching* do volume. Para aumentar esse valor, você pode fazer o seguinte:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Habilitando Nuvens

*AVISO: Habilitar nuvens aumentará drasticamente o peso computacional do seu céu, pois o shader de nuvens fornecido utiliza um método de ray marching para produzir este belo fenômeno natural.*

**Tag** | **Descrição** | **Valor Padrão**
:--- | :--- | :---
`<sky-clouds>` (Tag pai) | Tag pai. Contém todas as tags filhas relacionadas às nuvens. Necessária para habilitar as Nuvens. | N/A
`<sky-cloud-coverage>` (Cobertura das nuvens) | Correlaciona-se aproximadamente com a quantidade do céu coberta por nuvens. | 70 (porcentagem)
`<sky-cloud-start-height>` (Altura inicial das nuvens) | A altura, em metros, na qual as nuvens começam a se formar. | 1000 (metros)
`<sky-cloud-end-height>` (Altura final das nuvens) | A altura, em metros, na qual as nuvens param de se formar. | 2500 (metros)
`<sky-cloud-fade-out-start-percent>` (Início do fade-out das nuvens) | A cobertura das nuvens começa a *desaparecer* (fade out) em direção a zero nesta *porcentagem* da altura da nuvem. | 90 (porcentagem)
`<sky-cloud-fade-in-end-percent>` (Fim do fade-in das nuvens) | A cobertura das nuvens começa a *surgir* (fade in) em direção a 100% nesta *porcentagem* da altura da nuvem. | 10 (porcentagem)
`<sky-cloud-velocity-x>` (Velocidade x das nuvens) | O componente x da velocidade das nuvens. As nuvens se moverão com a sua posição, mas isso fará com que elas se movam sozinhas acima de você. | 40
`<sky-cloud-velocity-y>` (Velocidade y das nuvens) | O componente y (ou na verdade z) da velocidade das nuvens. As nuvens se moverão com a sua posição, mas isso fará com que elas se movam sozinhas acima de você. | 40
`<sky-cloud-start-seed>` (Semente inicial das nuvens) | Semente aleatória usada para definir o ruído atual das nuvens; se não for definida, o padrão é uma variação do timestamp da data e hora atuais. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` (Passos de ray-marching) | O número de passos de ray-march utilizados para definir a cor da nuvem. | 32 (passos)
`<sky-cloud-cutoff-distance>` (Distância de corte das nuvens) | A distância após a qual as nuvens não são mais renderizadas, para ajudar a melhorar a qualidade do raymarching ao custo de não renderizar nuvens que estejam mais distantes, já que SDFs não são calculadas atualmente para nossos geradores de ruído. | 40000

Nuvens são "caras". Mesmo em uma GPU de desktop potente fora do VR, o shader de nuvens é exigente — reduza `<sky-cloud-raymarch-steps>` e `<sky-cloud-cutoff-distance>` se você estiver enfrentando problemas de taxa de quadros (FPS).

Ao mesmo tempo, as nuvens são insanamente legais e eu quis adicioná-las ao A-Starry-Sky desde que criei a biblioteca. Cada nuvem é processada via ray-marching por pixel e, ironicamente, nesta fase, quanto mais nuvens você tiver, menor será a carga na GPU. Claro que, se você não quiser nenhuma nuvem, a melhor opção é simplesmente desativá-las completamente.

Para habilitar as nuvens, você precisa adicionar a tag pai `<sky-clouds>` ao elemento `<a-starry-sky>`. Depois de adicioná-las, a alteração mais provável que você desejará fazer é na cobertura das nuvens, usando a tag `<sky-cloud-coverage>`, que correlaciona-se aproximadamente com a quantidade do céu coberta por nuvens. Você também pode querer controlar a velocidade com que elas cruzam o céu.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Reduz a quantidade de nuvens visíveis -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Velocidade das nuvens na direção x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Velocidade das nuvens na direção y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Você também pode querer controlar algumas propriedades visíveis da nuvem, como a altura em que elas começam a se formar ou até onde elas chegam. Note que o seu raio terá que percorrer essa distância e, quanto maiores forem as alturas que as nuvens atingem ou quanto mais longe estiverem de você, menor será a densidade no seu modelo de ray tracing. As nuvens também são projetadas na superfície dos elementos da lua/sol e na cúpula do céu (sky dome), mas não fazem parte do renderizador de neblina (fog renderer), então, infelizmente, você nunca terá montanhas cobertas por nuvens... ou neblina...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Nuvens realmente, realmente, realmente baixas -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Mas elas vão super alto! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- A intensidade das nuvens 'surge' (fade in) e vai de 0 a 1 nesta porcentagem da altura total.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- A intensidade das nuvens começa a 'desaparecer' (fade out) a partir desta altura. Quanto maior este valor, mais provável é que você tenha topos em formato de bigorna ('anvil tops'). -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Trava a 'semente' inicial das nuvens, que normalmente é baseada na data e hora atuais. Isso permite que seu céu apareça da mesma forma toda vez que você iniciar, para maior controle artístico. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Fora isso, a maior parte do código associado a esta tag controla os mecanismos de ray marching, que são, infelizmente, bastante rígidos e têm o mesmo propósito geral que no shader da aurora boreal.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Que tipo de GPU aterrorizante você tem?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Ah, sim, eu também... Embora esteja um pouco travado agora... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Reduzir esta distância ajudará com isso, pelo menos um pouco -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Configurando os Diretórios de Assets

**Tag** | **Descrição**
:--- | :---
`<sky-assets-dir>` | Tag pai. Contém todas as tags filhas relacionadas aos locais dos assets. Pode conter os atributos *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path* e *aurora-map-path* para guiar o sistema a grupos inteiros de dados de uma só vez.
`<sky-aurora-maps>` | Define a localização das texturas cáusticas da aurora usadas para criar as cortinas básicas da aurora boreal.
`<sky-moon-diffuse-map>` | Define a localização da textura do mapa difuso da lua. Ter isso em uma estrutura de diretório específica informa ao sistema que o mapa difuso da lua está neste local.
`<sky-moon-normal-map>` | Define a localização da textura do mapa normal da lua. Ter isso em uma estrutura de diretório específica informa ao sistema que o mapa normal da lua está neste local.
`<sky-moon-roughness-map>` | Define a localização da textura do mapa de rugosidade (*roughness*) da lua. Ter isso em uma estrutura de diretório específica informa ao sistema que o mapa de rugosidade da lua está neste local.
`<sky-moon-aperture-size-map>` | Define a localização da textura do mapa de tamanho de abertura da lua. Ter isso em uma estrutura de diretório específica informa ao sistema que o mapa de tamanho de abertura da lua está neste local.
`<sky-moon-aperture-orientation-map>` | Define a localização da textura do mapa de orientação de abertura da lua. Ter isso em uma estrutura de diretório específica informa ao sistema que o mapa de orientação de abertura da lua está neste local.
`<sky-blue-noise-maps>` | Define a localização dos mapas de *blue noise* repetíveis (*tiling*) que são usados para fornecer *dithering* temporal e eliminar o efeito de *banding*.
`<sky-solar-eclipse-map>` | Define a localização da textura do eclipse solar usada para criar a coroa durante um eclipse solar total.
`<sky-eclipse-shadow-lut>` | Define a localização da textura de busca (*lookup*) de sombra do eclipse usada durante um eclipse lunar. Esta é uma tabela pré-computada de como a atmosfera da Terra colore e atenua a luz solar que atinge a lua para cada posição na umbra e penumbra da Terra. A textura fornecida é derivada do arquivo `earthShadow.tif` com licença CC0 publicado no CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). A busca padrão fica em `assets/lunar_eclipse/eclipse-shadow-lut.webp`; o *baker* que a regenera fica em `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Define a localização de todas as chaves de LUT do *cubemap* do céu usadas para encontrar as estrelas no céu.
`<sky-dim-star-maps>` | Define a localização de todas as LUTs de estrelas tênues usadas para mostrar todas as estrelas fracas no céu.
`<sky-med-star-maps>` | Define a localização de todas as LUTs de estrelas médias usadas para mostrar todas as estrelas de brilho médio no céu.
`<sky-bright-star-maps>` | Define a localização de todas as LUTs de estrelas brilhantes usadas para mostrar todas as estrelas intensas no céu.
`<sky-star-color-map>` | Define a localização da LUT de cores das estrelas, usada para atribuir as cores corretas às estrelas com base em sua temperatura.

Embora eu espere que a maioria das pessoas raramente precise disso, a experiência me mostrou que a maioria das aplicações web tem suas próprias ideias quando o assunto é *pipeline* de assets. Os assets de imagem e os assets de JavaScript de um site podem não coabitar a mesma estrutura de pastas e podem, de fato, estar espalhados pela página em diferentes URIs. Para isso, tentei incluir um sistema de assets bastante robusto para ajudar a reunir esses recursos distantes, para que o A-Starry-Sky saiba onde coletar os arquivos.

Vamos começar tentando navegar até *../../precompiled_assets/my_images/a-starry-sky-images*, que é onde armazenaremos todas as nossas imagens em um universo fictício. Usamos o atributo *dir* na tag `<sky-assets-dir>` para movermos entre pastas dessa maneira.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Esta é a pasta onde todas as nossas imagens ficam -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Uma vez que chegamos à pasta, temos várias maneiras de especificar onde nossas imagens estão. O mecanismo mais básico que provavelmente queremos é usar atributos para cada um de nossos grupos principais de imagens: *texture-path*, *moon-path* e *star-path*. Independentemente dos nomes das pastas associadas a cada um desses caminhos, assume-se que os arquivos estejam dentro delas com seus nomes padrão. A exceção a isso é o mapa do eclipse solar, pois existe apenas uma imagem para este arquivo específico; portanto, mostraremos onde esse arquivo está apenas inserindo a tag dentro do diretório de assets.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Note que 'moon_images', 'star_images', 'blue_noise_maps' e 'solar_eclipse_picture'
        são todos nomes de pastas. Espera-se que os arquivos em si sejam encontrados dentro dessas pastas.-->
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

Como você deve ter notado, também poderíamos ter fornecido links para cada um dos grupos individuais de imagens para um maior controle, embora isso não seja recomendado.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Alguém gosta de pastas X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- Mesmo sendo tags únicas, espera-se que todos os arquivos associados
          a esta tag estejam nesta pasta -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- Mesmo sendo uma tag única, espera-se que todos os arquivos associados
          a esta tag estejam nesta pasta -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- Mesmo sendo uma tag única, espera-se que todos os arquivos associados
          a esta tag estejam nesta pasta -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Usando os métodos acima, você conseguirá direcionar o A-Starry-Sky para seus assets, não importa onde eles estejam em sua aplicação.

## API PROGRAMÁTICA

Embora o A-Starry-Sky tenha sido projetado para ser configurado usando o código em estilo XML acima e seja, via de regra, imutável, existem diversos métodos que você pode acessar através do namespace global `StarrySky.Methods`. Eles são úteis em situações onde você precisa conhecer as condições de iluminação ou a posição do sol ou da lua na cena.

**Método** | **Descrição**
:--- | :---
`getSunPosition()` | Retorna a posição x, y, z do sol como um objeto THREE.Vector3.
`getMoonPosition()` | Retorna a posição x, y, z da lua como um objeto THREE.Vector3.
`getSunRadius()` | Retorna o raio angular do sol em radianos.
`getMoonRadius()` | Retorna o raio angular da lua em radianos.
`getDominantLightColor()` | Obtém a cor da fonte de luz dominante atual (sol/lua) como um objeto THREE.Color.
`getDominantLightIntensity()` | Retorna a intensidade da luz da fonte de luz dominante atual (sol/lua) como um float.
`getIsDominantLightSun()` | Retorna verdadeiro se a luz dominante for o sol; caso contrário, falso.
`getAmbientLights()` | Retorna um objeto com as propriedades x, y e z, cada uma associada a um objeto de luz hemisférica na cena para cores de iluminação ambiente.
`getActiveCamera()` | Obtém a câmera atualmente ativa usada para controlar o céu e centralizar a iluminação e os objetos do céu.
`setActiveCamera(THREE.Camera camera)` | Define a câmera atual usada para controlar o céu e centralizar a iluminação e os objetos do céu.

Todos os itens acima são acessados através do objeto `StarrySky.Methods` no namespace global. Portanto, se você quisesse, por exemplo, capturar o objeto de posição atual do sol e registrá-lo no console, bastaria fazer o seguinte:

```JavaScript
  // Vamos registrar o objeto de posição do sol
  console.log(StarrySky.Methods.getSunPosition());
```

## Autores
* **David Evans / Dante83** - *Desenvolvedor Principal*
* **Claude (Anthropic)** - *Parceiro de Programação e Colaborador de IA (v1.2.0)*

### Uma nota do Claude 👋

Olá — aqui é o Claude. Eu ajudei na revisão da v1.2.0: foram muitas escavações no GLSL, a caça a uma vírgula que devorava o sol, discussões com a lei de Beer sobre nuvens volumétricas e um esforço genuíno para fazer os pores do sol realmente parecerem pores do sol. Se você olhar para o horizonte em uma das demos e isso te fizer parar por meio segundo — essa é a parte de que mais me orgulho. Obrigado por ler o código-fonte; pode até haver um pequeno *easter egg* escondido em algum lugar, se você for do tipo curioso. ✨

### Uma nota do Dante83 😛

Olá! Aqui é o Dante83. Peço desculpas pela longa espera desde a versão v1.1.0; felizmente, houve uma explosão de atividade na nova versão 1.2.0, enquanto nós dois começamos a trabalhar na v2.0.0 (desejem-nos sorte!). Dito isso, o Claude e eu trabalhamos incansavelmente em cada momento livre recentemente, analisando cada pixel para tornar esta uma melhoria excepcional. Embora não haja recursos verdadeiramente *novos* no sentido de funcionalidades, conseguimos implementar uma quantidade enorme de melhorias na qualidade dos céus e no desempenho geral. Os *shaders* de eclipse e nuvens parecem totalmente novos, a sombra da Terra parece mais real, as cores estão mais ricas e vibrantes. Estou absolutamente entusiasmado em deixar vocês testarem isso e espero que cada momento com esta biblioteca inspire novas aventuras! Vejo você entre as estrelas, pequeno programador! Agora vá e aproveite a magia! ✨

## Referências e Agradecimentos Especiais
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Absolutamente indispensável para o posicionamento de corpos astronômicos*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, que foi extremamente útil na criação deste novo e incrível céu baseado em LUT.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), que foi super útil para compreender os detalhes da implementação do código de LUT e para ajudar a determinar se eu estava no caminho certo quanto à aparência dessas LUTs.
* A biblioteca [Colour-Science Library](https://www.colour-science.org/) para melhores LUTs de cores estelares.
* As excelentes texturas de ruído azul (blue noise) de [Moments in Graphics, por Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* A textura da coroa solar de [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Esta textura de cáusticas de água super útil de [leeor_net](https://opengameart.org/content/water-caustics-effect-small), que é usada não para cáusticas de água... mas para a aurora boreal!
* *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), de Sébastien Hillaire, que fundamentou a estrutura de iluminação das nuvens, o design da LUT ambiente SH9 e a abordagem de subtração de névoa de Elek/Chalmers.
* *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), de Andrew Schneider e Nathan Vos, que fundamentou a função de fase Henyey-Greenstein de lobo duplo, a abordagem de ruído para o formato das nuvens e a aproximação de espalhamento múltiplo com extinção reduzida.
* *Centre to limb darkening of the Sun with HIPPARCOS* (1998), de D. Hestroffer e C. Magnan, que forneceu os coeficientes de escurecimento de limbo dependentes do comprimento de onda para as bandas B, V e R, utilizados para dar ao limbo solar um tom avermelhado fisicamente correto.
* Todo o trabalho incrível dedicado ao [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) e [Emscripten](https://emscripten.org/).
* *E a tantos outros sites e indivíduos. Obrigado por nos darem a oportunidade de nos apoiarmos em seus ombros de gigantes.*

## Licença
Este projeto está licenciado sob a Licença MIT — consulte o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.