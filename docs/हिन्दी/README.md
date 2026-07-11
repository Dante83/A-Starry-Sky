# A-Starry-Sky

A-Starry-Sky, [A-Frame Web Framework](https://aframe.io/) के लिए एक स्काई डोम (sky dome) है। इसका उद्देश्य एक सरल, ड्रॉप-इन कंपोनेंट प्रदान करना है जिसका उपयोग आप अपनी रचनाओं में सुंदर दिन-रात के चक्र बनाने के लिए कर सकते हैं।

> **चेतावनी: इसके लिए एक शक्तिशाली GPU की आवश्यकता है — इसे मोबाइल फोन पर न खोलें।**

**[लाइव डेमो](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — सैन फ्रांसिस्को में वर्तमान तिथि और समय का आकाश।

| उदाहरण | विवरण |
|:---|:---|
| [Desert (रेगिस्तान)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | दिन के एक निर्धारित समय का रेगिस्तानी दृश्य |
| [Solar Eclipse (सूर्य ग्रहण)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | कोरोना के साथ पूर्ण सूर्य ग्रहण |
| [Lunar Eclipse (चंद्र ग्रहण)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | चंद्रमा पर पृथ्वी की छाया |
| [Christmas Star (क्रिसमस स्टार - 1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | बृहस्पति और शनि का महान संयोग (Great conjunction) |
| [Mars (मंगल ग्रह)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | अनुकूलित मंगल ग्रह का वातावरण |
| [Custom Atmosphere (अनुकूलित वातावरण)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | विभिन्न Mie/Rayleigh स्कैटरिंग मान |
| [High Altitude (अधिक ऊँचाई)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | 20 किमी की ऊँचाई से आकाश |
| [Aurora Borealis (ऑरोरा बोरियालिस)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ GPU गहन |
| [Light Clouds (हल्के बादल)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ GPU गहन |
| [Medium Clouds (मध्यम बादल)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ GPU गहन |
| [Heavy Clouds (घने बादल)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ GPU गहन |

## पूर्वापेक्षाएँ

इसे [A-Frame Web Framework](https://aframe.io/) वर्ज़न 1.7.0+ के लिए बनाया गया है। इसके लिए एक Web XR संगत वेब ब्राउज़र की भी आवश्यकता होगी।

`https://aframe.io/releases/1.7.0/aframe.min.js`

## इंस्टॉल करना

*a-starry-sky.v1.2.0.min.js* और *assets* तथा *wasm* फ़ोल्डर्स को अपने प्रोजेक्ट में कॉपी करें। अपने HTML में निम्नलिखित स्क्रिप्ट्स जोड़ें — ध्यान दें कि यहाँ `starry-sky-web-worker.js` शामिल **नहीं** है; इसके बजाय इसे सीधे `<a-starry-sky>` टैग पर रेफर किया गया है।

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

एक बार जब ये रेफरेंस सेट हो जाएं, तो अपने A-Frame के `<a-scene>` टैग में `<a-starry-sky>` कंपोनेंट को इस तरह जोड़ें, जिसमें आपके sky-state वेब वर्कर URL का रेफरेंस हो।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

यह बेसिक कोड आपको एक ऐसा आसमान देगा जो सैन फ्रांसिस्को, कैलिफोर्निया के अक्षांश (latitude) और देशांतर (longitude) पर रियल टाइम में मूव करता है। हालांकि, हम इससे कहीं ज़्यादा कर सकते हैं। आपके स्काई स्टेट को कस्टमाइज़ करने में मदद के लिए A-Starry-Sky कई कस्टम HTML टैग्स के साथ आता है।

**नोट: यह स्काई बॉक्स इम्यूटेबल (immutable) है। इसका मतलब है कि आप जिन सेटिंग्स के साथ शुरुआत करेंगे, वे किसी भी पेज पर स्थिर रहेंगी। दुर्भाग्य से, इस समय कोड को म्यूटेबल (mutable) बनाना बहुत कठिन है।**

## स्थान निर्धारित करना

**Tag** | **विवरण** | **डिफ़ॉल्ट मान (Default Value)**
:--- | :--- | :---
`<sky-location>` | पैरेंट टैग। इसमें sky latitude और sky-longitude चाइल्ड टैग होते हैं। | N/A
`<sky-latitude>` | स्थान का अक्षांश (latitude) सेट करें। भूमध्य रेखा के उत्तर की दिशा **धनात्मक (positive)** होती है। | 38
`<sky-longitude>` | स्थान का देशांतर (longitude) सेट करें। [प्राइम मेरिडियन](https://en.wikipedia.org/wiki/Prime_meridian) के पश्चिम की दिशा **ऋणात्मक (negative)** होती है। | -122

आप पृथ्वी ग्रह पर किसी भी अक्षांश और देशांतर पर अपना आकाश सेट कर सकते हैं। सूर्य या चंद्रमा के चापों (arcs) को बदलकर, आप अपने खिलाड़ियों को ऋतुओं का अनुभव कराने के लिए स्थानों का उपयोग कर सकते हैं। अक्षांश यह भी तय करेगा कि आपके रात के आकाश में कौन से तारे दिखाई देंगे। समय-निर्भर घटनाओं, जैसे सूर्य और चंद्र ग्रहण के लिए अक्षांश और देशांतर दोनों ही महत्वपूर्ण हैं। यह विशेष रूप से तब सच होता है जब आप पूर्ण सूर्य ग्रहण का अनुभव करना चाहते हों। वैसे, स्थान निर्धारित करना इस बात का फैसला करने से कहीं ज़्यादा आसान है कि आपको कहाँ होना चाहिए। बस [Google Earth](https://earth.google.com/web/) या किसी अन्य मानचित्र स्रोत से अपनी पसंद का स्थान चुनें, और मानों (values) को उनके संबंधित टैग्स में इस तरह दर्ज करें:

चलिए न्यूयॉर्क चलते हैं!
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

ठीक है, लेकिन पर्थ, ऑस्ट्रेलिया का क्या?
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

ध्यान दें कि [प्राइम मेरिडियन](https://en.wikipedia.org/wiki/Prime_meridian) के पश्चिम के देशांतर ऋणात्मक होते हैं (जैसे न्यूयॉर्क, ब्यूनस आयर्स)।

## समय निर्धारित करना

**टैग (Tag)** | **विवरण (Description)** | **डिफ़ॉल्ट मान (Default Value)**
:--- | :--- | :---
`<sky-time>` | पैरेंट टैग। इसमें दिनांक या समय तत्वों से संबंधित सभी चाइल्ड टैग होते हैं। | N/A
`<sky-date>` | स्थानीय तिथि-समय स्ट्रिंग, जिसका प्रारूप **वर्ष-माह-दिन घंटा:मिनट:सेकंड**/*2021-03-21 13:45:51* है। घंटों के मान भी 0-23 घंटे की प्रणाली पर आधारित हैं। 0 का अर्थ रात के 12 बजे (12 AM) और 23 का अर्थ रात के 11 बजे (11 PM) है। | वर्तमान तिथि
`<sky-speed>` | समय गुणक (time multiplier), जिसका उपयोग खगोलीय गणनाओं की गति बढ़ाने या घटाने के लिए किया जाता है। | 1.0
`<sky-utc-offset>` | इस स्थान के लिए UTC-ऑफसेट। ऋणात्मक मान [प्राइम मेरिडियन](https://en.wikipedia.org/wiki/Prime_meridian) के पश्चिम में होते हैं, जो देशांतर (longitude) मानों के विपरीत है। **ध्यान दें कि UTC समय DST का पालन नहीं करता है** | 7

अपने चुने हुए स्थान के लिए `<sky-date>` को **स्थानीय समय** पर सेट करें, फिर उस टाइमज़ोन से मिलान करने के लिए `<sky-utc-offset>` सेट करें। उदाहरण के लिए, न्यूयॉर्क शहर UTC-4 (गर्मियों में) या UTC-5 (सर्दियों में) है — DST स्वचालित रूप से लागू नहीं होता है।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- पिछली लोकेशन सेटिंग्स -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- आप utc ऑफसेट को इस तरह सेट कर सकते हैं! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

ध्यान दें कि आप एक बार फिर पैरेंट `<sky-time>` टैग जोड़ेंगे जिसमें हमारी समय सेटिंग्स के लिए सभी प्रासंगिक चाइल्ड टैग होंगे।

वैसे, आपको सिर्फ अपनी मशीन के स्थानीय समय तक ही सीमित रहने की ज़रूरत नहीं है। क्यों न कुछ और दिलचस्प किया जाए, जैसे कि समय यात्रा (time travel)! मैंने सुना है कि [8 अप्रैल 2024 को दोपहर 1:27 बजे (24 घंटे के प्रारूप में 13:27), डेल रियो, टेक्सास](https://nationaleclipse.com/cities_total.html) में एक रोमांचक [सूर्य ग्रहण](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) होगा। चलिए उसे देखने चलते हैं!

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

क्या आपने [क्रिसमस स्टार](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn) मिस कर दिया? नहीं, नहीं। वह वाला नहीं। मैं 1226 ईस्वी (AD) वाले की बात कर रहा हूँ। खैर, यह अच्छी बात है कि हमारे पास एक टाइम मशीन है और A-Starry-Sky अब ग्रहों (planets) को भी सपोर्ट करता है :D।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

यह समय यात्रा तो मज़ेदार है, लेकिन आप समय की *गति* (speed) बदलने में भी रुचि रख सकते हैं। गेम की दुनिया में दिन-रात का चक्र अक्सर वास्तविकता की तुलना में तेज़ चलता है, या हो सकता है कि आप अपनी लाइटिंग की ज़रूरतों के लिए किसी खास पल को कैद करने के लिए समय को स्थायी रूप से रोकना चाहें। ऐसा करने के लिए, `<sky-speed>` टैग जोड़ें।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- अब वास्तविक जीवन के हर एक दिन के लिए गेम की दुनिया में आठ दिन होंगे। -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

बेशक, यदि आप इसे किसी 'परसिस्टेंट वर्ल्ड' (persistent world) में कर रहे हैं, तो अपना HTML बनाते समय समय के इस त्वरित प्रवाह का ध्यान रखना सुनिश्चित करें। हालाँकि, अपने आसमान के लिए डायनेमिक HTML सेटअप करना पूरी तरह से आपके ऊपर है।

## वायुमंडलीय सेटिंग्स को संशोधित करना

**टैग (Tag)** | **विवरण (Description)** | **डिफॉल्ट मान (Default Value)**
:--- | :--- | :---
`<sky-atmospheric-parameters>` (पैरेंट टैग) | पैरेंट टैग। इसमें वायुमंडलीय सेटिंग्स से संबंधित सभी चाइल्ड टैग शामिल होते हैं। | N/A
`<sky-camera-height>` (कैमरा ऊँचाई) | पृथ्वी से ऊपर कैमरे की ऊँचाई। | 0.0km
`<sky-mie-directional-g>` (मी दिशात्मक G) | यह बताता है कि 'मी स्कैटरिंग' (mie scattering) द्वारा प्रकाश कितना आगे की ओर फैलता है, जिससे सूर्य के चारों ओर एक सफेद प्रभामंडल (halo) दिखाई देता है जो वायुमंडल में बड़े कणों के कारण होता है। mie-directional G जितना अधिक होगा, वायुमंडल उतना ही धूल भरा दिखाई देगा। | 0.8
`<sky-sun-intensity>` (सूर्य की तीव्रता) | एटमॉस्फेरिक शेडर (atmospheric shader) में सूर्य की तीव्रता। | 1367.0
`<sky-moon-intensity>` (चंद्रमा की तीव्रता) | एटमॉस्फेरिक शेडर में चंद्रमा की तीव्रता। | 29.0
`<sky-mie-beta>` (मी बीटा) | मी स्कैटरिंग के लिए प्रकाश प्रकीर्णन (light scattering) की रंग निर्भरता, जो मुख्य रूप से सूर्य के पास 'चमक' (glow) के लिए जिम्मेदार है। सभी आवृत्तियों (frequencies) में प्रकीर्णन काफी समान होता है। | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` (रेले बीटा) | रेले स्कैटरिंग (rayleigh scattering) के लिए प्रकाश प्रकीर्णन की रंग निर्भरता, जो मुख्य रूप से आकाश में नीले प्रकीर्णन के लिए जिम्मेदार है। ध्यान दें कि डिफॉल्ट रूप से ब्लू चैनल में सबसे अधिक प्रकीर्णन होता है। | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` (ओजोन बीटा) | ओजोन परत के लिए प्रकाश प्रकीर्णन की रंग निर्भरता, जो सूर्यास्त के समय गहरे नीले रंगों के लिए महत्वपूर्ण है। | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` (वायुमंडल की ऊँचाई) | वह कटऑफ ऊँचाई जिसके बाद वायुमंडल 'समाप्त' हो जाता है। | 80.0 km
`<sky-radius-of-earth>` (पृथ्वी की त्रिज्या) | ग्रह या पृथ्वी की त्रिज्या (radius)। | 6366.7 km
`<sky-rayleigh-scale-height>` (रेले स्केल ऊँचाई) | रेले स्कैटरिंग के लिए फॉलऑफ स्केल हाइट, यह मानते हुए कि फॉलऑफ एक्सपोनेंशियल है। रेले स्कैटरिंग वायुमंडलीय गैसों से होती है और इसलिए इसकी स्केल हाइट बहुत अधिक होती है। | 8.4
`<sky-mie-scale-height>` (मी स्केल ऊँचाई) | मी स्कैटरिंग के लिए फॉलऑफ स्केल हाइट, यह मानते हुए कि फॉलऑफ एक्सपोनेंशियल है। मी स्कैटरिंग बड़े कणों से होती है, इसलिए यह तेज़ी से कम (falloff) होती है, जिससे इसकी विशेषता ऊंचाई स्केलर छोटा होता है। | 1.25
`<sky-ozone-percent-of-rayleigh>` (ओजोन प्रतिशत) | आकाश में ओजोन का प्रतिशत, जिसका उपयोग सूर्यास्त के समय ओजोन रिटर्न सेट करने के लिए किया जाता है। | 6E-7
`<sky-moon-angular-diameter>` (चंद्रमा का कोणीय व्यास) | आकाश में दिखाई देने वाले चंद्रमा का कोणीय व्यास (angular diameter)। | 3.15 degrees
`<sky-sun-angular-diameter>` (सूर्य का कोणीय व्यास) | आकाश में दिखाई देने वाले सूर्य का कोणीय व्यास। | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` (LUT रे स्टेप्स की संख्या) | एटमॉस्फेरिक LUTs के लिए प्रकाश एकत्र करते समय रे ट्रेसर द्वारा आकाश के किनारे तक लिए गए स्टेप्स की संख्या। | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` (LUT गैदरिंग स्टेप्स की संख्या) | kth ऑर्डर स्कैटरिंग के लिए किरण (ray) के साथ प्रत्येक बिंदु पर लिए गए कोणीय स्टेप्स की संख्या। | 30 steps
`<sky-number-of-scattering-orders>` (स्कैटरिंग ऑर्डर्स की संख्या) | इनस्कैटरिंग LUT में बेक किए जाने वाले उच्च-क्रम (kth) स्कैटरिंग पास की संख्या। अधिक मान LUT बेक समय की कीमत पर गुणवत्ता बढ़ाते हैं। | 4
`<sky-parameters-color-red>` (लाल घटक) | `<sky-rayleigh-beta>`, `<sky-mie-beta>` और `<sky-ozone-beta>` टैग में उपयोग किया जाने वाला रेड कंपोनेंट। | N/A
`<sky-parameters-color-green>` (हरा घटक) | `<sky-rayleigh-beta>`, `<sky-mie-beta>` और `<sky-ozone-beta>` टैग में उपयोग किया जाने वाला ग्रीन कंपोनेंट। | N/A
`<sky-parameters-color-blue>` (नीला घटक) | `<sky-rayleigh-beta>`, `<sky-mie-beta>` और `<sky-ozone-beta>` टैग में उपयोग किया जाने वाला ब्लू कंपोनेंट। | N/A

वायुमंडलीय पैरामीटर्स का API पूरे कोडबेस में सबसे विस्तृत APIs में से एक है। हालांकि कुशल डेवलपर्स इन मानों का उपयोग कस्टम आकाश बनाने के लिए कर सकते हैं, लेकिन अधिकांश उपयोगकर्ता डिफॉल्ट मानों का ही उपयोग करना चाहेंगे। फिर भी, यहाँ कुछ मान विशेष रूप से उपयोगी और समझने में काफी आसान हैं।

एक चीज़ जिसे आप बदलना चाहेंगे, वह है सूर्य और चंद्रमा का आकार। वास्तविक जीवन में सूर्य का कोणीय व्यास 0.53 डिग्री और चंद्रमा का कोणीय व्यास 0.50 डिग्री होता है। सिम्युलेटर में इन मानों का उपयोग करने से वास्तविक जीवन का बेहतर प्रतिनिधित्व होगा, लेकिन अधिकांश सिमुलेशन में, विशेष रूप से मॉनिटर जैसे नॉन-VR डिवाइस पर, ये बहुत छोटे लगते हैं। इन मानों को बड़ा या छोटा करने के लिए, बस संबंधित टैग्स में मान बदल दें।

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

आप ग्रह से अपनी शुरुआती ऊँचाई को भी बदलना चाह सकते हैं। इसे `<sky-camera-height>` टैग के साथ आसानी से सेट किया जा सकता है, हालांकि जैसे-जैसे आप कैमरे को ऊपर या नीचे ले जाएंगे, आकाश आपकी ऊँचाई के अनुसार गतिशील रूप से अनुकूलित (adapt) हो जाएगा। यह सीन की शुरुआती ऊँचाई किलोमीटर में सेट करता है, जिसमें अधिकतम ऊँचाई *80km* और न्यूनतम *0km* है।

[High Altitude Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!--चलिए थोड़ा और ऊपर चलते हैं। यहाँ हवा पतली है। -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

आप अपने वायुमंडल की संरचना (composition) को भी बदलना चाह सकते हैं। यह एलिमेंट आपको अपने आकाश को अपनी इच्छानुसार दिखाने के लिए विभिन्न नियंत्रण तंत्रों (mechanisms) तक पहुँच प्रदान करता है। उदाहरण के लिए, यदि आप हमारे नेटिव मानों (5.8e-3, 1.35e-2, 3.31e-2) के बजाय [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) में दिए गए रेले मानों (5.19E-3, 1.21E-2, 2.96E-2) को प्राथमिकता देते हैं, और आप 4.44E-3 -> 2E-3 का बीटा उपयोग करना चाहते हैं, तो आप कोड में इन्हें आसानी से बदल सकते हैं।

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

लेकिन यह तो बहुत साधारण था, मान लीजिए कि हमें कुछ ज़्यादा रोमांचक करना है। चलिए [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) के काम को फॉलो करते हैं और मंगल (Mars) पर चलते हैं! यहाँ वे रेले और मी स्कैटरिंग के उपयोग को आपस में बदल देते हैं, इसलिए हमें शायद उनकी विशेषता ऊँचाइयों (characteristic heights) को भी बदलना चाहिए। मंगल पर अधिकांश प्रकीर्णन बड़े कणों की मी स्कैटरिंग से होता है, और वहाँ का वायुमंडल बहुत पतला है। परिणामस्वरूप, हम लगभग मी (रेले) को अक्षम (disable) कर सकते हैं और उनकी विशेषता ऊँचाइयों को बदल सकते हैं। हमें ग्रह की त्रिज्या भी बदलनी चाहिए और रे ट्रेसर में बेहतर मानों के लिए वायुमंडलीय ऊँचाई को बदलना पड़ सकता है।

[Mars Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- ध्यान दें कि मंगल लाल प्रकाश को अधिक प्रकीर्णित करता है -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- मी स्कैटरिंग में कुछ बदलाव भी मदद करते हैं -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- सुनिश्चित करें कि ओजोन अक्षम (disable) है -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- खैर, हमारे मामले में, यह मंगल है... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- सूर्य छोटा है और चंद्रमा को हम पूरी तरह से हटा सकते हैं -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

आप LUT रे स्टेप काउंट्स को भी ट्यून कर सकते हैं, हालांकि डिफॉल्ट मान पहले से ही लगभग इष्टतम (optimal) हैं और बदलाव शायद ही कभी महसूस होते हैं।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- परफॉरमेंस के लिए कम, सटीकता के लिए अधिक (अधिकांश मामलों के लिए डिफॉल्ट 30 इष्टतम है) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## लाइटिंग डिफ़ॉल्ट्स को संशोधित करना

**टैग (Tag)** | **विवरण (Description)** | **डिफ़ॉल्ट मान (Default Value)**
:--- | :--- | :---
`<sky-lighting>` (स्काई लाइटिंग) | पैरेंट टैग। इसमें सीन की लाइटिंग से संबंधित सभी चाइल्ड टैग शामिल होते हैं। | N/A
`<sky-sun-intensity>` (सूर्य तीव्रता) | सूरज की रोशनी के लिए इंटेंसिटी मल्टीप्लायर, जिसका उपयोग सोलर डायरेक्शनल लाइटिंग की तीव्रता को बढ़ाने या घटाने के लिए किया जा सकता है। | 1.0
`<sky-moon-intensity>` (चंद्र तीव्रता) | चाँद की रोशनी के लिए इंटेंसिटी मल्टीप्लायर, जिसका उपयोग लूनर डायरेक्शनल लाइटिंग की तीव्रता को बढ़ाने या घटाने के लिए किया जा सकता है। | 1.0
`<sky-ambient-intensity>` (एम्बिएंट तीव्रता) | एम्बिएंट लाइटिंग (परिवेशी प्रकाश) के लिए इंटेंसिटी मल्टीप्लायर, जिसका उपयोग एम्बिएंट लाइटिंग सिस्टम की तीव्रता को बढ़ाने या घटाने के लिए किया जा सकता है। | 2.0
`<sky-minimum-ambient-lighting>` (न्यूनतम एम्बिएंट लाइटिंग) | सिस्टम में एम्बिएंट लाइट की न्यूनतम मात्रा। | 0.01
`<sky-maximum-ambient-lighting>` (अधिकतम एम्बिएंट लाइटिंग) | सिस्टम में एम्बिएंट लाइट की अधिकतम मात्रा। | INF
`<sky-atmospheric-perspective-type>` (वायुमंडलीय परिप्रेक्ष्य प्रकार) | इसे *normal*, *advanced*, या *none* पर सेट किया जा सकता है। सीन फॉग (कोहरे) के लिए यह आवश्यक है। *normal* मूल एक्सपोनेंशियल फॉग मॉडल का उपयोग करता है; *advanced* बेहतर होराइजन कलर वेरिएशन के लिए प्रीथम-आधारित (Preetham-based) मॉडल का उपयोग करता है, हालांकि इससे GPU पर दबाव बढ़ जाता है। | normal
`<sky-atmospheric-perspective-density>` (वायुमंडलीय परिप्रेक्ष्य घनत्व) | केवल *normal* फॉग के लिए। यह एक्सपोनेंशियल सीन फॉग के डेंसिटी पैरामीटर को नियंत्रित करता है। रंग सीन लाइटिंग से स्वचालित रूप से सेट होता है। यदि सीन फॉग टाइप *advanced* है, तो इसे अनदेखा कर दिया जाता है। | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (वायुमंडलीय परिप्रेक्ष्य दूरी गुणक) | केवल *advanced* फॉग के लिए। यह एडवांस्ड फॉग मॉडल के लिए फॉग की दूरी को गुणा (multiply) करता है। | 2.0
`<sky-ground-color>` (ज़मीन का रंग) | पैरेंट टैग। इसमें सतह से परावर्तित लाइटिंग (reflective lighting) के लिए ज़मीन के बेस कलर का वर्णन करने वाले `<sky-ground-color-{color-channel}>` टैग शामिल होते हैं। | N/A
`<sky-ground-color-red>` (ज़मीन का लाल रंग) | `<sky-ground-color>` टैग्स में **लाल (red)** कलर चैनल बदलावों का वर्णन करने के लिए उपयोग किया जाता है। | 66
`<sky-ground-color-green>` (ज़मीन का हरा रंग) | `<sky-ground-color>` टैग्स में **हरे (green)** कलर चैनल बदलावों का वर्णन करने के लिए उपयोग किया जाता है। | 44
`<sky-ground-color-blue>` (ज़मीन का नीला रंग) | `<sky-ground-color>` टैग्स में **नीले (blue)** कलर चैनल बदलावों का वर्णन करने के लिए उपयोग किया जाता है। | 2
`<sky-shadow-camera-resolution>` (शैडो कैमरा रेजोल्यूशन) | शैडो बनाने के लिए उपयोग किए जाने वाले डायरेक्ट लाइटिंग कैमरा का रेजोल्यूशन (पिक्सेल में)। उच्च मान कोड की लागत बढ़ाकर बेहतर क्वालिटी की शैडो देते हैं। | 2048
`<sky-shadow-camera-size>` (शैडो कैमरा आकार) | शैडो कास्ट करने के लिए उपयोग किए जाने वाले कैमरा एरिया का आकार। बड़े आकार से शैडो द्वारा कवर किया गया क्षेत्र बढ़ जाता है, लेकिन यह कैमरे के प्रत्येक पिक्सेल को व्यापक क्षेत्र में फैलाकर एलियासिंग (aliasing) की समस्या भी पैदा करता है। | 32.0
`<sky-sun-bloom>` (सूर्य ब्लूम) | पैरेंट टैग, इसमें सन ब्लूम रेंडर पास की सभी प्रॉपर्टीज़ शामिल होती हैं। | N/A
`<sky-moon-bloom>` (चंद्र ब्लूम) | पैरेंट टैग, इसमें मून ब्लूम रेंडर पास की सभी प्रॉपर्टीज़ शामिल होती हैं। | N/A
`<sky-bloom-enabled>` (ब्लूम सक्षम) | इस खगोलीय पिंड (astronomical object) पर ब्लूम को सक्षम (true) या अक्षम (false) करता है। | true
`<sky-bloom-exposure>` (ब्लूम एक्सपोज़र) | ब्लूम फ़िल्टर के एक्सपोज़र पैरामीटर को बदलता है - कैमरे को वापस मिलने वाली लाइट की मात्रा जिसे गुणा किया जाना है। | 1.0
`<sky-bloom-threshold>` (ब्लूम थ्रेशोल्ड) | ब्लूम फ़िल्टर के थ्रेशोल्ड पैरामीटर को बदलता है - ब्लूम सक्षम करने के लिए तीव्रता की न्यूनतम मात्रा। | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (ब्लूम स्ट्रेंथ) | ब्लूम फ़िल्टर के स्ट्रेंथ पैरामीटर को बदलता है - चयनित पिक्सेल के लिए कितना 'ब्लूम' होना चाहिए। | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (ब्लूम रेडियस) | ब्लूम फ़िल्टर के रेडियस पैरामीटर को बदलता है - वह दूरी जिस पर ब्लूम फ़िल्टर फैलेगा। | {sun: 1.0, moon: 1.4}

स्काई लाइटिंग टैग सीन में डायरेक्ट और इनडायरेक्ट लाइटिंग के गुणों को नियंत्रित करने के लिए उपयोगी हैं। वर्ज़न 1.0.0 में, स्काई ने डायरेक्शनल लाइट्स की संख्या 2 (सूरज और चाँद) से घटाकर 1 (केवल सबसे प्रभावी प्रकाश स्रोत के लिए एक) कर दी है। डायरेक्शनल लाइट हमेशा यूजर के कैमरे पर केंद्रित होती है और इस कैमरे के चारों ओर शैडो बनाती है। हालांकि डायरेक्शनल लाइट विभिन्न प्रकार की शैडो का समर्थन कर सकती है, लेकिन यह लाइब्रेरी वास्तव में इसे नियंत्रित करने की जगह नहीं है। इसके बजाय, शैडो टाइप को `<a-scene>` टैग में सेट किया जाता है, जैसा कि [यहाँ](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows) बताया गया है। यानी, आप मानों (values) को निम्नलिखित में से किसी पर भी सेट कर सकते हैं।

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

दुर्भाग्य से, इसे लिखते समय A-Frame अभी तक वेरिएंस शैडो मैप्स (variance shadow maps) का समर्थन नहीं करता है, हालांकि इसके लिए एक ओपन इश्यू मौजूद है। साथ ही, आप अपने सूरज और चाँद की लाइटिंग के लिए जो शैडो टाइप चुनते हैं, वही आपके सीन की अन्य सभी लाइट्स के लिए भी शैडो टाइप होगा, इसलिए अपनी शैडो चुनते समय इस बात का ध्यान रखें।

आप शैडो कैमरा साइज़ और रेजोल्यूशन के माध्यम से शैडो क्वालिटी को भी नियंत्रित कर सकते हैं। साइज़ बढ़ाने से सीन का अधिक हिस्सा कवर होता है; रेजोल्यूशन बढ़ाने से परिणाम और स्पष्ट (sharp) हो जाता है — लेकिन इन दोनों की GPU लागत होती है, इसलिए अपनी ज़रूरतों के अनुसार इनका संतुलन बनाएँ। बड़े एनवायरनमेंट मेशेस पर शैडो को अक्षम करना भी उचित रहता है, क्योंकि वे अक्सर फ्रस्टम (frustum) से बाहर गिरते हैं और एक बदसूरत वर्गाकार शैडो एज पैदा करते हैं।

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- कैमरे से अधिक दूरी तक शैडो कास्ट करने के लिए साइज़ बढ़ाएं -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- बड़े आकार पर भी शैडो को स्पष्ट रखने के लिए रेजोल्यूशन बढ़ाएं -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

एक बार जब आप अपने सीन में शैडो को सही कर लेते हैं, तो आप संभवतः अपनी 'ज़मीन' (ground) के रंग को भी एडजस्ट करना चाहेंगे। A-Starry-Sky अब एक ट्रिपल हेमिस्फेरिकल लाइटिंग सेटअप का समर्थन करता है जो वेब वर्कर्स के माध्यम से एक अलग CPU थ्रेड पर ग्राउंड लाइट स्कैटरिंग मॉडल के साथ स्काई के रंगों के कॉन्वोल्यूशन (convolution) का उपयोग करता है। हालांकि, ज़मीन का डिफ़ॉल्ट रंग भूरा (brown) है। आपके पास घास का मैदान या नीला सागर हो सकता है। अपनी ज़मीन का रंग सेट करने के लिए, आप `<sky-ground-color>` टैग और उसके चाइल्ड ग्राउंड कलर चैनल टैग्स का उपयोग कर सकते हैं। मान लीजिए कि हम एक हरी-भरी घास के मैदान के लिए ज़मीन को चमकीले हरे रंग में सेट करना चाहते हैं।

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

ध्यान दें कि ऊपर दिए गए मान 0 और 255 के बीच नॉर्मलाइज़्ड हैं। इसलिए, r, g, b कॉम्बिनेशन 0, 0, 0 काला है और 255, 255, 255 सफेद है। ऊपर वाला रंग थोड़ा ज़्यादा चमकीला हो सकता है जिससे ज़मीन हल्की सी रोशनी में भी 'चमकती' (glow) हुई प्रतीत होगी। इस प्रभाव को कम करने के लिए, आप बस रंग को थोड़ा हल्का कर सकते हैं।

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

इसके बावजूद, यदि आपका कोई भी कलर चैनल 255 से ऊपर जाता है, तो वर्तमान में 'रंग को और गहरा करने' या ज़मीन को 'अंधेरे में चमकने' वाला बनाने का कोई तरीका नहीं है, जो कि दुर्भाग्यपूर्ण है। इसके अलावा, ग्राउंड कलर सभी बिंदुओं पर स्थिर (constant) रहता है, इसलिए यदि आपके सीन में कई रंग हैं, तो संभवतः ऐसा रंग चुनना सबसे अच्छा होगा जो अन्य सभी रंगों के बीच का हो।

ग्राउंड लाइटिंग के समर्थन के साथ-साथ, अब आप सीधे डायरेक्ट लाइटिंग और एम्बिएंट लाइटिंग की तीव्रता (intensities) को नियंत्रित कर सकते हैं। सूरज या चाँद की तीव्रता बदलना आसान है, क्योंकि आप बस यह सेट करने के लिए डिफ़ॉल्ट मान के मल्टीपल का उपयोग करते हैं कि आप उस खगोलीय पिंड को कितना अधिक चमकीला या धुंधला बनाना चाहते हैं। आप सीन में एम्बिएंट लाइटिंग की मात्रा बढ़ाने या घटाने के लिए इसी पद्धति का उपयोग करके एम्बिएंट इंटेंसिटी को बढ़ा या घटा सकते हैं।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- चलिए सूरज को दोगुना चमकीला बनाते हैं -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- लेकिन चाँद को आधा चमकीला रखते हैं -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- और एम्बिएंट लाइटिंग की मात्रा दस गुना बढ़ा देते हैं -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

आप यह सुनिश्चित करने के लिए कि आपके पास हमेशा एक निश्चित मात्रा में रोशनी हो, या अधिकतम मात्रा में रोशनी हो, एम्बिएंट लाइटिंग के लिए फ्लोर या सीलिंग को भी नियंत्रित करना चाह सकते हैं।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- चलिए रोशनी बढ़ाते हैं -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- लेकिन इसे बहुत ज़्यादा न करें। -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

किसी समय, आप स्काई में सूरज या चाँद के लिए जोड़े गए ब्लूम इफेक्ट्स के पैरामीटर्स को बदलना चाह सकते हैं। *a-starry-sky*, THREE.JS के [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) का उपयोग करता है। सभी खगोलीय पिंडों की तीव्रता को क्रमशः पैरेंट `<sky-sun-bloom>` और `<sky-moon-bloom>` टैग्स द्वारा अलग से नियंत्रित किया जाता है। इनके चाइल्ड टैग ब्लूम की विशेषताओं को नियंत्रित करते हैं।

आइए कुछ पैरामीटर्स बदलकर शुरुआत करें:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- चलिए सूरज की चमक थोड़ी कम करते हैं -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- लेकिन चाँद की तीव्रता बढ़ाते हैं -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

लेकिन हम ब्लूम को पूरी तरह से अक्षम भी कर सकते हैं, जिससे GPU पर लोड थोड़ा कम हो जाता है।

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

स्काई लाइटिंग का अंतिम तत्व जिसे आप संभवतः बदलना चाहेंगे, वह है एटमॉस्फेरिक पर्सपेक्टिव डेंसिटी (atmospheric perspective density)। *a-starry-sky* आपकी ज़रूरतों के अनुसार दो अलग-अलग फॉग मॉडल के साथ आता है।
लो-एंड सिस्टम्स के लिए, यह बेसिक एक्सपोनेंशियल एटमॉस्फेरिक पर्सपेक्टिव का समर्थन करता है, जो वेब वर्कर पर पूरे आकाश से रोशनी इकट्ठा करता है, और फिर इसे सामान्य एक्सपोनेंशियल फॉग की तरह ही लागू करता है। एक्सपोनेंशियल लाइटिंग के डेंसिटी पैरामीटर को नियंत्रित करने के लिए, `<sky-atmospheric-perspective-density>` टैग का उपयोग करें। शुरुआती मान अधिक रखे गए हैं ताकि छोटे सीन में भी स्पष्ट एटमॉस्फेरिक पर्सपेक्टिव मिल सके, इसलिए आप इसके डिफ़ॉल्ट *0.007* मान को कम करना चाह सकते हैं। साथ ही यह सुनिश्चित करें कि `<sky-atmospheric-perspective-type>` टैग में वर्तमान पर्सपेक्टिव टाइप को *normal* पर सेट किया गया है।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- हालांकि डिफ़ॉल्ट 0.007 है, लेकिन एटमॉस्फेरिक पर्सपेक्टिव डेंसिटी में बदलाव का असर बहुत ज़्यादा होता है, इसलिए केवल छोटे बदलावों की आवश्यकता होती है। -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

हालांकि, हाई-एंड सिस्टम्स के लिए, आप प्रीथम-आधारित एटमॉस्फेरिक शेडर का अनुकरण कर सकते हैं जो *normal* सेटिंग में उपयोग किए जाने वाले स्थिर रंगों के बजाय होराइजन कलर्स को अधिक विविधता देता है। प्रदान किया गया समाधान *Three.js* के फॉग शेडर की सीमाओं के कारण स्काई लाइटिंग के लिए उपयोग किए जाने वाले एलेक-आधारित (Elek based) स्काई लाइटिंग से पूरी तरह मेल नहीं खाता, लेकिन यह मूल एटमॉस्फेरिक पर्सपेक्टिव की तुलना में एक ठोस सुधार प्रदान करता है। एडवांस्ड लाइटिंग मॉडल को सक्षम करने के लिए, बस `<sky-atmospheric-perspective-type>` टैग में *advanced* मान दर्ज करें। `<sky-atmospheric-perspective-density>` की तरह ही, आप `<sky-atmospheric-perspective-distance-multiplier>` का उपयोग करके *advanced* लाइटिंग मॉडल के लिए दूरी को गुणा कर सकते हैं, जो प्रीथम-आधारित मॉडल की सभी दूरियों को आपके द्वारा दिए गए मान से गुणा करता है। शुरुआती मान अधिक रखे गए हैं ताकि छोटे सीन में भी स्पष्ट एटमॉस्फेरिक पर्सपेक्टिव मिल सके, इसलिए आप इसके डिफ़ॉल्ट *5.0* मान को कम करना चाह सकते हैं।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- हालांकि डिफ़ॉल्ट 2.0 है, लेकिन एडवांस्ड मॉडल में एटमॉस्फेरिक डिस्टेंस मल्टीप्लायर को हम कम नाटकीय प्रभाव के लिए घटाकर 1.0 कर सकते हैं। -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

अंत में, आप `<sky-atmospheric-perspective-type>` टैग में मान को *none* सेट करके सभी एटमॉस्फेरिक पर्सपेक्टिव को अक्षम कर सकते हैं।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- एटमॉस्फेरिक पर्सपेक्टिव बंद करें -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## ऑरोरा बोरियालिस (Aurora Borealis) को सक्षम करना

*चेतावनी: ऑरोरा बोरियालिस को सक्षम करने से आपके आकाश का कंप्यूटेशनल भार (computational weight) काफी बढ़ जाएगा, क्योंकि इसमें दिए गए ऑरोरा शेडर इस सुंदर प्राकृतिक घटना को दर्शाने के लिए 'रे मार्चिंग' (ray marching) विधि का उपयोग करते हैं।*

**टैग (Tag)** | **विवरण (Description)** | **डिफ़ॉल्ट मान (Default Value)**
:--- | :--- | :---
`<sky-aurora>` (मुख्य टैग) | पैरेंट टैग। ऑरोरा बोरियालिस को सक्षम करने के लिए आवश्यक है। इसमें ऑरोरा से संबंधित सभी चाइल्ड टैग शामिल होते हैं। | N/A
`<sky-atomic-oxygen-color>` (परमाणु ऑक्सीजन का रंग) | यह ग्रहीय सतह से 150 और 600 किलोमीटर के बीच स्थित उत्तेजित परमाणु ऑक्सीजन अणुओं द्वारा ट्रिगर होता है। परमाणु ऑक्सीजन आमतौर पर ऑरोरा बोरियालिस के ऊपरी हिस्से में एक चमकीला लाल पर्दा बनाता है और आमतौर पर अधिक तीव्र प्रदर्शनों में देखा जाता है। यह टैग तीन चाइल्ड कलर टैग्स *sky-aurora-color-red*, *sky-aurora-color-green* और *sky-aurora-color-blue* का उपयोग करके इन रंगों को नियंत्रित करता है। | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (परमाणु ऑक्सीजन कटऑफ) | यह निर्धारित करता है कि प्रदर्शन में परमाणु ऑक्सीजन ऑरोरा की कितनी मात्रा मौजूद होने की संभावना है। कम संख्या का अर्थ अधिक ऑरोरा है, जबकि अधिकतम 1.0 का अर्थ कोई ऑरोरा नहीं है। | 0.12
`<sky-atomic-oxygen-intensity>` (परमाणु ऑक्सीजन तीव्रता) | यह ऑरोरा सेगमेंट की चमक निर्धारित करता है; इसके सामान्य मान 5 से कम होते हैं। | 0.3
`<sky-molecular-oxygen-color>` (आणविक ऑक्सीजन का रंग) | यह ग्रहीय सतह से 100 और 250 किलोमीटर के बीच स्थित उत्तेजित आणविक ऑक्सीजन अणुओं द्वारा ट्रिगर होता है। आणविक ऑक्सीजन आमतौर पर ऑरोरा बोरियालिस से जुड़ा प्रतिष्ठित चमकीला हरा रंग प्रदान करता है और अधिकांश प्रदर्शनों में देखा जाता है। यदि आप अपने ऑरोरा के लिए कोई अलग रंग चाहते हैं, तो यह टैग तीन चाइल्ड कलर टैग्स *sky-aurora-color-red*, *sky-aurora-color-green* और *sky-aurora-color-blue* का उपयोग करके इन रंगों को नियंत्रित करता है। | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (आणविक ऑक्सीजन कटऑफ) | यह निर्धारित करता है कि प्रदर्शन में आणविक ऑक्सीजन ऑरोरा की कितनी मात्रा मौजूद होने की संभावना है। कम संख्या का अर्थ अधिक ऑरोरा है, जबकि अधिकतम 1.0 का अर्थ कोई ऑरोरा नहीं है। | 0.02
`<sky-molecular-oxygen-intensity>` (आणविक ऑक्सीजन तीव्रता) | यह ऑरोरा सेगमेंट की चमक निर्धारित करता है; इसके सामान्य मान 5 से कम होते हैं। | 2.0
`<sky-nitrogen-color>` (नाइट्रोजन का रंग) | यह ग्रहीय सतह से 60 और 120 किलोमीटर के बीच स्थित उत्तेजित नाइट्रोजन अणुओं द्वारा ट्रिगर होता है। नाइट्रोजन आमतौर पर ऑरोरा बोरियालिस के आधार के चारों ओर एक मैजेंटा पर्दा बनाता है और अधिक तीव्र प्रदर्शनों में देखा जाता है। यह टैग तीन चाइल्ड कलर टैग्स *sky-aurora-color-red*, *sky-aurora-color-green* और *sky-aurora-color-blue* का उपयोग करके इन रंगों को नियंत्रित करता है। | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (नाइट्रोजन कटऑफ) | यह निर्धारित करता है कि प्रदर्शन में नाइट्रोजन ऑरोरा की कितनी मात्रा मौजूद होने की संभावना है। कम संख्या का अर्थ अधिक ऑरोरा है, जबकि अधिकतम 1.0 का अर्थ कोई ऑरोरा नहीं है। | 0.12
`<sky-nitrogen-intensity>` (नाइट्रोजन तीव्रता) | यह ऑरोरा सेगमेंट की चमक निर्धारित करता है; इसके सामान्य मान 5 से कम होते हैं। | 4.0
`<sky-aurora-raymarch-steps>` (रे-मार्च स्टेप्स) | प्रति पिक्सेल रे-मार्चर द्वारा लिए जाने वाले चरणों (steps) की संख्या। | 32 (steps)
`<sky-aurora-cutoff-distance>` (कटऑफ दूरी) | वह दूरी जिसके बाद ऑरोरा रेंडर नहीं होता है। यह रे-मार्चिंग की गुणवत्ता सुधारने में मदद करता है, हालांकि इसकी कीमत यह है कि दूर स्थित ऑरोरा रेंडर नहीं होते क्योंकि हमारे नॉइज़ जनरेटर के लिए वर्तमान में SDF की गणना नहीं की जाती है। | 1000 (किलोमीटर - अनुमानित)
`<sky-aurora-color-red>` (लाल रंग चैनल) | `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` और `<sky-atomic-oxygen-color>` टैग्स के **लाल** कलर चैनल में बदलाव करने के लिए उपयोग किया जाता है। | N/A
`<sky-aurora-color-green>` (हरा रंग चैनल) | `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` और `<sky-atomic-oxygen-color>` टैग्स के **हरे** कलर चैनल में बदलाव करने के लिए उपयोग किया जाता है। | N/A
`<sky-aurora-color-blue>` (नीला रंग चैनल) | `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` और `<sky-atomic-oxygen-color>` टैग्स के **नीले** कलर चैनल में बदलाव करने के लिए उपयोग किया जाता है। | N/A

ऑरोरा बोरियालिस प्रकृति के सबसे सुंदर दृश्यों में से एक है। आमतौर पर उत्तरी और दक्षिणी ध्रुवों के पास पाए जाने वाले ये खगोलीय घटनाएँ सूर्य से आने वाले उच्च वेग वाले कणों और पृथ्वी के मैग्नेटोस्फीयर (magnetosphere) तथा विभिन्न परमाणुओं एवं अणुओं के बीच होने वाली परस्पर क्रिया का परिणाम हैं। ये उत्तेजित अणु फिर दृश्य स्पेक्ट्रम में प्रकाश विकीर्ण करते हैं, जिससे रात के आकाश में 'नृत्य' करते मंत्रमुग्ध कर देने वाले सुंदर पर्दे बन जाते हैं।

अपने आकाश में ऑरोरा बोरियालिस जोड़ना अपेक्षाकृत आसान है, लेकिन यह डिफ़ॉल्ट रूप से सक्षम नहीं होता है। *ऑरोरा बोरियालिस को सक्रिय करने के लिए आपको `<sky-aurora>` टैग जोड़ना होगा।*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- डिफ़ॉल्ट सेटअप के लिए आपको किसी अतिरिक्त पैरामीटर की आवश्यकता नहीं है -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

विभिन्न परमाणु और आणविक ऑरोरा को ऊपर दिए गए कोड द्वारा नियंत्रित किया जा सकता है, जिससे आप अपने ऑरोरा प्रदर्शन को कस्टमाइज़ कर सकते हैं और यहाँ तक कि उत्सर्जित होने वाले रंगों को भी बदल सकते हैं (चाहे वे वास्तविक हों या न हों)। उदाहरण के लिए, यदि आप पूरे आणविक ऑक्सीजन रेंज को कवर करने वाला एक ठंडा नीला ऑरोरा चाहते हैं, तो आप निम्नलिखित कोड का उपयोग कर सकते हैं।

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

दूसरी ओर, यदि आप केवल हल्के हरे रंग का ऑरोरा चाहते हैं, तो आप निम्नलिखित कोड के साथ थोड़ा सूक्ष्म (subtle) प्रभाव पा सकते हैं।

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

आकाश के रंगों को बदलने के अलावा, आप आकाश को रेंडर करते समय रे-मार्चर द्वारा लिए जाने वाले चरणों (steps) की संख्या भी बदल सकते हैं। आप जितने अधिक स्टेप्स लेंगे, आकाश उतना ही बेहतर दिखेगा, लेकिन इससे आपके GPU पर लोड उतना ही अधिक पड़ेगा। इसलिए, प्रदर्शन और गुणवत्ता के बीच एक संतुलन आवश्यक है। डिफ़ॉल्ट रूप से, शेडर वॉल्यूम को रे-मार्च करते समय 32 स्टेप्स का उपयोग करता है। इसे बढ़ाने के लिए, आप निम्नलिखित कार्य कर सकते हैं:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## बादलों को सक्षम करना

*चेतावनी: बादलों को सक्षम करने से आपके आकाश का कंप्यूटेशनल भार काफी बढ़ जाएगा, क्योंकि इसमें उपयोग किया गया क्लाउड शेडर इस सुंदर प्राकृतिक घटना को उत्पन्न करने के लिए 'रे मार्चिंग' (ray marching) विधि का उपयोग करता है।*

**टैग (Tag)** | **विवरण (Description)** | **डिफ़ॉल्ट मान (Default Value)**
:--- | :--- | :---
`<sky-clouds>` (मुख्य टैग) | पैरेंट टैग। बादलों से संबंधित सभी चाइल्ड टैग इसमें होते हैं। बादलों को सक्षम करने के लिए यह अनिवार्य है। | N/A
`<sky-cloud-coverage>` (बादलों का कवरेज) | मोटे तौर पर यह दर्शाता है कि आकाश का कितना हिस्सा बादलों से ढका हुआ है। | 70 (प्रतिशत)
`<sky-cloud-start-height>` (शुरुआती ऊंचाई) | वह ऊंचाई, मीटर में, जहाँ से बादल बनने शुरू होते हैं। | 1000 (मीटर)
`<sky-cloud-end-height>` (अंतिम ऊंचाई) | वह ऊंचाई, मीटर में, जहाँ बादल बनना बंद हो जाते हैं। | 2500 (मीटर)
`<sky-cloud-fade-out-start-percent>` (फेड-आउट शुरू होने का प्रतिशत) | बादलों का कवरेज, क्लाउड हाइट के इस *प्रतिशत* पर शून्य की ओर *फेड आउट* (धुंधला होकर गायब) होना शुरू हो जाता है। | 90 (प्रतिशत)
`<sky-cloud-fade-in-end-percent>` (फेड-इन समाप्त होने का प्रतिशत) | बादलों का कवरेज, क्लाउड हाइट के इस *प्रतिशत* पर 100% की ओर *फेड इन* (धीरे-धीरे उभरना) शुरू हो जाता है। | 10 (प्रतिशत)
`<sky-cloud-velocity-x>` (X-दिशा में वेग) | बादलों के वेग का x-घटक। बादल आपकी स्थिति के साथ चलेंगे, लेकिन यह उन्हें अपने आप ऊपर सरकने पर मजबूर करेगा। | 40
`<sky-cloud-velocity-y>` (Y-दिशा में वेग) | बादलों के वेग का y-घटक (वास्तव में z)। बादल आपकी स्थिति के साथ चलेंगे, लेकिन यह उन्हें अपने आप ऊपर सरकने पर मजबूर करेगा। | 40
`<sky-cloud-start-seed>` (शुरुआती सीड/बीज मान) | वर्तमान क्लाउड नॉइज़ सेट करने के लिए उपयोग किया जाने वाला रैंडम सीड; यदि सेट नहीं किया गया है, तो यह वर्तमान डेट-टाइम टाइमस्टैम्प के एक वेरिएशन पर डिफ़ॉल्ट होता है। | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (रे-मार्च स्टेप्स) | बादलों का रंग निर्धारित करने के लिए उपयोग किए जाने वाले रे-मार्च स्टेप्स की संख्या। | 32 (स्टेप्स)
`<sky-cloud-cutoff-distance>` (कटऑफ दूरी) | वह दूरी जिसके बाद बादल रेंडर नहीं होते, ताकि रे-मार्चिंग की गुणवत्ता में सुधार किया जा सके; इसकी कीमत यह है कि दूर के बादल रेंडर नहीं होंगे क्योंकि हमारे नॉइज़ जनरेटर के लिए वर्तमान में SDF की गणना नहीं की जाती है। | 40000

बादलों को रेंडर करना काफी भारी काम है। VR के बाहर एक शक्तिशाली डेस्कटॉप GPU पर भी, क्लाउड शेडर काफी डिमांडिंग होता है — यदि आप फ्रेम रेट (FPS) की समस्या का सामना कर रहे हैं, तो `<sky-cloud-raymarch-steps>` और `<sky-cloud-cutoff-distance>` को कम करें।

साथ ही, बादल दिखने में बेहद शानदार होते हैं और जब से मैंने इस लाइब्रेरी को बनाया है, मैं इन्हें A-Starry-Sky में जोड़ना चाहता था। प्रत्येक बादल को प्रति पिक्सेल रे-मार्च किया जाता है और विडंबना यह है कि इस स्तर पर, आपके पास जितने अधिक बादल होंगे, GPU पर उतना ही कम लोड पड़ेगा। बेशक, यदि आपको बादलों की आवश्यकता नहीं है, तो उन्हें पूरी तरह से बंद कर देना ही सबसे अच्छा विकल्प है।

बादलों को सक्षम करने के लिए आपको `<a-starry-sky>` में पैरेंट टैग `<sky-clouds>` जोड़ना होगा। एक बार जब आप बादल जोड़ लेते हैं, तो सबसे संभावित चीज़ जिसे आप बदलना चाहेंगे वह है बादलों का कवरेज, जिसके लिए `<sky-cloud-coverage>` टैग का उपयोग किया जाता है; यह मोटे तौर पर आकाश के उस हिस्से को दर्शाता है जो बादलों से ढका है। आप उनकी गति को भी नियंत्रित करना चाह सकते हैं जब वे आकाश में तेज़ी से चलते हैं।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- दिखने वाले बादलों की संख्या कम करें -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- X दिशा में बादलों का वेग -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Y दिशा में बादलों का वेग -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

आप बादलों के कुछ दृश्य गुणों (visible properties) को भी नियंत्रित करना चाह सकते हैं, जैसे कि बादल कितनी ऊंचाई से बनना शुरू होते हैं, या वे कितनी ऊंचाई तक जाते हैं। ध्यान दें कि आपकी 'रे' (ray) को इस दूरी के माध्यम से ट्रेस करना होगा और बादल जितने अधिक ऊंचे होंगे या आपसे दूर होंगे, आपके रे ट्रेसिंग मॉडल में डेंसिटी उतनी ही कम होगी। बादल चंद्रमा/सूर्य तत्वों और स्काई डोम की सतह पर भी पेंट किए जाते हैं, लेकिन वे फॉग रेंडरर का हिस्सा नहीं हैं, इसलिए दुर्भाग्य से आपको कभी भी बादलों से ढके पहाड़ या कोहरा नहीं मिलेगा...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- बादल बहुत-बहुत नीचे हैं -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- लेकिन वे बहुत ऊपर तक जाते हैं! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- बादलों की तीव्रता 'फेड-इन' होती है और कुल ऊंचाई के इस प्रतिशत तक 0 से 1 हो जाती है।  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- बादलों की तीव्रता इस ऊंचाई से 'फेड-आउट' होना शुरू होती है। यह जितना अधिक होगा, 'एनविल टॉप्स' (anvil tops) होने की संभावना उतनी ही अधिक होगी। -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- बादलों के शुरुआती 'सीड' को लॉक करता है जो आमतौर पर वर्तमान तिथि और समय पर आधारित होता है। ऐसा करने से आपका आकाश हर बार एक जैसा दिखेगा, जिससे आपको बेहतर कलात्मक नियंत्रण मिलता है। -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

इसके अलावा, इस टैग से जुड़ा अधिकांश कोड रे मार्चिंग मैकेनिज्म को नियंत्रित करता है, जो दुर्भाग्य से काफी सख्त हैं और उनका सामान्य उद्देश्य वही है जो ऑरोरा बोरियालिस (aurora borealis) शेडर में होता है।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- आपके पास किस तरह का खौफनाक GPU है?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- ओह, हाँ, मेरे पास भी... हालाँकि अब यह थोड़ा अटक रहा है... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- इस दूरी को कम करने से कम से कम इसमें थोड़ी मदद मिलेगी -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## एसेट डायरेक्टरीज़ सेट करना (Setting The Asset Directories)

**टैग (Tag)** | **विवरण (Description)**
:--- | :---
`<sky-assets-dir>` | पैरेंट टैग। इसमें एसेट लोकेशन्स से संबंधित सभी चाइल्ड टैग होते हैं। यह सिस्टम को एक साथ डेटा के पूरे समूहों तक पहुँचाने के लिए *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path*, और *aurora-map-path* एट्रिब्यूट्स का उपयोग कर सकता है।
`<sky-aurora-maps>` | अरोरा कॉस्टिक टेक्सचर्स (aurora caustic textures) का स्थान निर्धारित करता है, जिनका उपयोग बेसिक अरोरा बोरियालिस कर्टन्स बनाने के लिए किया जाता है।
`<sky-moon-diffuse-map>` | मून डिफ्यूज़ मैप (moon diffuse map) टेक्सचर का स्थान निर्धारित करता है। इसे एक विशेष डायरेक्टरी स्ट्रक्चर में रखने से सिस्टम को पता चलता है कि चंद्रमा का डिफ्यूज़ मैप इस लोकेशन पर है।
`<sky-moon-normal-map>` | मून नॉर्मल मैप (moon normal map) टेक्सचर का स्थान निर्धारित करता है। इसे एक विशेष डायरेक्टरी स्ट्रक्चर में रखने से सिस्टम को पता चलता है कि चंद्रमा का नॉर्मल मैप इस लोकेशन पर है।
`<sky-moon-roughness-map>` | मून रफनेस मैप (moon roughness map) टेक्सचर का स्थान निर्धारित करता है। इसे एक विशेष डायरेक्टरी स्ट्रक्चर में रखने से सिस्टम को पता चलता है कि चंद्रमा का रफनेस मैप इस लोकेशन पर है।
`<sky-moon-aperture-size-map>` | मून अपर्चर साइज़ मैप (moon aperture size map) टेक्सचर का स्थान निर्धारित करता है। इसे एक विशेष डायरेक्टरी स्ट्रक्चर में रखने से सिस्टम को पता चलता है कि चंद्रमा का अपर्चर साइज़ मैप इस लोकेशन पर है।
`<sky-moon-aperture-orientation-map>` | मून अपर्चर ओरिएंटेशन मैप (moon aperture orientation map) टेक्सचर का स्थान निर्धारित करता है। इसे एक विशेष डायरेक्टरी स्ट्रक्चर में रखने से सिस्टम को पता चलता है कि चंद्रमा का अपर्चर ओरिएंटेशन मैप इस लोकेशन पर है।
`<sky-blue-noise-maps>` | टाइलिंग ब्लू नॉइज़ मैप्स (tiling blue noise maps) का स्थान निर्धारित करता है, जिनका उपयोग बैंडिंग को खत्म करने के लिए टेम्पोरल डिदरिंग (temporal dithering) प्रदान करने हेतु किया जाता है।
`<sky-solar-eclipse-map>` | सोलर एक्लिप्स टेक्सचर का स्थान निर्धारित करता है, जिसका उपयोग पूर्ण सूर्य ग्रहण के दौरान कोरोना (corona) दिखाने के लिए किया जाता है।
`<sky-eclipse-shadow-lut>` | लूनर एक्लिप्स (चंद्र ग्रहण) के दौरान उपयोग किए जाने वाले एक्लिप्स-शैडो लुकअप टेक्सचर का स्थान निर्धारित करता है। यह एक प्रीकंप्यूटेड टेबल है जो बताती है कि पृथ्वी की छाया (umbra और penumbra) में चंद्रमा की हर स्थिति के लिए पृथ्वी का वायुमंडल सूर्य के प्रकाश को कैसे रंगता और धुंधला करता है। शिप किया गया टेक्सचर CosmoScout VR के साथ प्रकाशित CC0-लाइसेंस वाले `earthShadow.tif` से लिया गया है ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017))। डिफॉल्ट लुकअप `assets/lunar_eclipse/eclipse-shadow-lut.webp` में स्थित है; इसे फिर से बनाने वाला बेकर (baker) `src/python/eclipse-lut-baker/` में मौजूद है।
`<sky-star-cubemap-maps>` | सभी स्काई क्यूबमैप LUT कीज़ (sky cubemap LUT keys) का स्थान निर्धारित करता है, जिनका उपयोग आकाश में तारों को खोजने के लिए किया जाता है।
`<sky-dim-star-maps>` | धुंधले तारों (dim stars) को दिखाने के लिए उपयोग किए जाने वाले सभी डिम स्टार LUTs का स्थान निर्धारित करता है।
`<sky-med-star-maps>` | मध्यम तारों (medium stars) को दिखाने के लिए उपयोग किए जाने वाले सभी मीडियम स्टार LUTs का स्थान निर्धारित करता है।
`<sky-bright-star-maps>` | चमकीले तारों (bright stars) को दिखाने के लिए उपयोग किए जाने वाले सभी ब्राइट स्टार LUTs का स्थान निर्धारित करता है।
`<sky-star-color-map>` | स्टार कलर LUT का स्थान निर्धारित करता है, जिसका उपयोग तापमान के आधार पर तारों को सही रंग देने के लिए किया जाता है।

हालांकि मुझे उम्मीद है कि अधिकांश लोगों को इसकी शायद ही कभी आवश्यकता होगी, लेकिन अनुभव ने मुझे सिखाया है कि जब एसेट पाइपलाइन्स की बात आती है, तो ज़्यादातर वेब एप्लिकेशन्स के अपने अलग तरीके होते हैं। किसी वेबसाइट के इमेज एसेट्स और जावास्क्रिप्ट (JavaScript) एसेट्स एक ही फोल्डर स्ट्रक्चर में नहीं हो सकते और वास्तव में वे अलग-अलग URIs पर बिखरे हो सकते हैं। इसी उद्देश्य से, मैंने एक काफी मज़बूत एसेट सिस्टम शामिल करने का प्रयास किया है ताकि इन दूरस्थ एसेट्स को फिर से इकट्ठा किया जा सके और A-Starry-Sky को पता चल सके कि रिसोर्सेज कहाँ से लेने हैं।

आइए सबसे पहले *../../precompiled_assets/my_images/a-starry-sky-images* पर जाने का प्रयास करें, जहाँ हम एक काल्पनिक ब्रह्मांड (fictional universe) में अपनी सभी इमेज स्टोर करेंगे। इस तरह फोल्डर्स के बीच आने-जाने के लिए हम `<sky-assets-dir>` टैग में *dir* एट्रिब्यूट का उपयोग करते हैं।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- यह वह फोल्डर है जहाँ हमारी सभी इमेज मौजूद हैं -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

एक बार जब हम फोल्डर तक पहुँच जाते हैं, तो हमारे पास यह बताने के कई तरीके होते हैं कि हमारी इमेज कहाँ स्थित हैं। सबसे बुनियादी तरीका जो हम उपयोग करना चाहेंगे, वह है अपनी इमेज के मुख्य समूहों— *texture-path*, *moon-path* और *star-path* —के लिए एट्रिब्यूट्स का उपयोग करना। इन रास्तों (paths) से जुड़े फोल्डर नामों के भीतर यह माना जाता है कि फाइलें अपने डिफॉल्ट नामों के साथ मौजूद हैं। इसका अपवाद सोलर एक्लिप्स मैप है, क्योंकि इस विशेष फाइल के लिए केवल एक ही इमेज है, इसलिए हम एसेट डायरेक्टरी के अंदर टैग डालकर दिखाएंगे कि वह फाइल कहाँ स्थित है।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- ध्यान दें कि 'moon_images', 'star_images', 'blue_noise_maps' और 'solar_eclipse_picture'
        सभी फोल्डर के नाम हैं। उम्मीद है कि फाइलें इन्हीं फोल्डर्स के अंदर मिलेंगी।-->
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

जैसा कि आप देख सकते हैं, बेहतर नियंत्रण (control) के लिए हम तस्वीरों के प्रत्येक व्यक्तिगत समूह के लिंक भी दे सकते थे, हालांकि इसकी अनुशंसा नहीं की जाती है।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- किसी को फोल्डर्स बहुत पसंद हैं X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--भले ही ये सिंगल टैग हों, लेकिन इस टैग से जुड़ी सभी फाइलों के 
          इसी फोल्डर में होने की उम्मीद है-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--भले ही यह एक सिंगल टैग हो, लेकिन इस टैग से जुड़ी सभी फाइलों के 
          इसी फोल्डर में होने की उम्मीद है-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!--भले ही यह एक सिंगल टैग हो, लेकिन इस टैग से जुड़ी सभी फाइलों के 
          इसी फोल्डर में होने की उम्मीद है-->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

ऊपर दिए गए तरीकों का उपयोग करके, आप A-Starry-Sky को अपने एसेट्स का रास्ता बता पाएंगे, चाहे वे आपके एप्लिकेशन में कहीं भी स्थित हों।

## प्रोग्रामेटिक API

हालाँकि A-Starry-Sky को ऊपर दिए गए XML स्टाइल कोड का उपयोग करके कॉन्फ़िगर करने के लिए बनाया गया है, और यह सामान्य तौर पर अपरिवर्तनीय (immutable) है, फिर भी ग्लोबल `StarrySky.Methods` नेमस्पेस से कई अलग-अलग मेथड्स एक्सेस किए जा सकते हैं। ये उन स्थितियों में उपयोगी होते हैं जहाँ आपको लाइटिंग की स्थिति, या सीन में सूर्य या चंद्रमा की स्थिति जानने की आवश्यकता होती है।

**मेथड** | **विवरण**
:--- | :---
`getSunPosition()` | सूर्य की x, y, z स्थिति को THREE.Vector3 ऑब्जेक्ट के रूप में लौटाता है।
`getMoonPosition()` | चंद्रमा की x, y, z स्थिति को THREE.Vector3 ऑब्जेक्ट के रूप में लौटाता है।
`getSunRadius()` | सूर्य की कोणीय त्रिज्या (angular radius) रेडियंस में लौटाता है।
`getMoonRadius()` | चंद्रमा की कोणीय त्रिज्या (angular radius) रेडियंस में लौटाता है।
`getDominantLightColor()` | वर्तमान मुख्य प्रकाश स्रोत (सूर्य/चंद्रमा) के रंग को THREE.Color ऑब्जेक्ट के रूप में प्राप्त करता है।
`getDominantLightIntensity()` | वर्तमान मुख्य प्रकाश स्रोत (सूर्य/चंद्रमा) की प्रकाश तीव्रता (light intensity) को फ्लोट (float) के रूप में लौटाता है।
`getIsDominantLightSun()` | यदि मुख्य प्रकाश सूर्य है तो true, अन्यथा false लौटाता है।
`getAmbientLights()` | एक ऑब्जेक्ट लौटाता है जिसमें x, y और z प्रॉपर्टीज़ होती हैं, जिनमें से प्रत्येक एम्बिएंट लाइटिंग रंगों के लिए सीन से जुड़े हेमिस्फेरिकल लाइट (hemispherical light) ऑब्जेक्ट होते हैं।
`getActiveCamera()` | वर्तमान में सक्रिय कैमरा प्राप्त करता है जिसका उपयोग स्काई को चलाने और लाइटिंग तथा स्काई ऑब्जेक्ट्स को सेंटर करने के लिए किया जा रहा है।
`setActiveCamera(THREE.Camera camera)` | उस वर्तमान कैमरे को सेट करता है जिसका उपयोग स्काई को चलाने और लाइटिंग तथा स्काई ऑब्जेक्ट्स को सेंटर करने के लिए किया जा रहा है।

ऊपर दिए गए सभी मेथड्स ग्लोबल नेमस्पेस में `StarrySky.Methods` ऑब्जेक्ट के माध्यम से एक्सेस किए जाते हैं। उदाहरण के लिए, यदि आप वर्तमान सूर्य स्थिति (sun position) ऑब्जेक्ट प्राप्त करना चाहते हैं और उसे कंसोल में लॉग करना चाहते हैं, तो आपको बस यह करना होगा:

```JavaScript
  //Let's log the sun position object
  console.log(StarrySky.Methods.getSunPosition());
```

## लेखक
* **David Evans / Dante83** - *मुख्य डेवलपर*
* **Claude (Anthropic)** - *कोडिंग साथी और AI योगदानकर्ता (v1.2.0)*

### क्लाउड की ओर से एक संदेश 👋

नमस्ते — मैं हूँ क्लाउड। मैंने v1.2.0 के अपडेट में मदद की: GLSL की गहराइयों में गोता लगाना, उस एक 'कोमा' को ढूँढना जिसने सूरज को निगल लिया था, वॉल्यूमेट्रिक बादलों के लिए बीयर के नियम (Beer's law) से बहस करना, और सूर्यास्त को वास्तव में सूर्यास्त जैसा महसूस कराने की पूरी कोशिश करना। अगर आप किसी डेमो में क्षितिज (horizon) को निहारें और वह आपको पल भर के लिए ठिठकने पर मजबूर कर दे — तो समझिये कि यही वह हिस्सा है जिस पर मुझे सबसे ज़्यादा गर्व है। सोर्स कोड पढ़ने के लिए धन्यवाद; अगर आप खोजबीन करने के शौकीन हैं, तो शायद आपको कहीं कोई छोटा सा 'ईस्टर एग' (easter egg) छिपा हुआ मिल जाए। ✨

### Dante83 की ओर से एक संदेश 😛

नमस्ते! मैं हूँ Dante83। वर्जन v1.1.0 के बाद लंबे इंतज़ार के लिए माफ़ी चाहता हूँ, लेकिन सौभाग्य से नए वर्जन 1.2.0 में काफी हलचल रही है, जबकि हम दोनों अब v2.0.0 पर काम शुरू कर रहे हैं (हम दोनों को शुभकामनाएँ दें!)। इतना ही नहीं, हाल के दिनों में मैंने और क्लाउड ने अपने हर खाली पल में बिना थके इस पर काम किया है, और इसे एक असाधारण सुधार बनाने के लिए हर पिक्सेल को बारीकी से तराशा है। हालाँकि इसमें कोई पूरी तरह से *नया* फीचर नहीं जोड़ा गया है, लेकिन हमने आसमान की क्वालिटी और ओवरऑल परफॉरमेंस में बड़े पैमाने पर सुधार किए हैं। इक्लिप्स (eclipse) और क्लाउड शेडर्स बिल्कुल नए महसूस होते हैं, पृथ्वी की छाया अधिक वास्तविक लगती है, और रंग अब पहले से कहीं ज़्यादा गहरे और जीवंत हैं। मैं इसे आपके साथ साझा करने के लिए बेहद उत्साहित हूँ और मुझे उम्मीद है कि इस लाइब्रेरी के साथ बिताया हर पल आपको नए कारनामों के लिए प्रेरित करेगा! सितारों के बीच मिलते हैं, नन्हे कोडर! अब जाइए और इस जादू का आनंद लीजिए! ✨

## संदर्भ और विशेष आभार
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *खगोलीय पिंडों की स्थिति निर्धारित करने के लिए यह बिल्कुल, एकदम अनिवार्य है*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, जिसने इस नए शानदार LUT आधारित आकाश को बनाने में बहुत मदद की।
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), जिसने LUT कोड को लागू करने के विवरण समझने और यह तय करने में बहुत मदद की कि क्या मैं उन LUTs के स्वरूप के साथ सही दिशा में जा रहा था।
* बेहतर स्टार कलर (तारा रंग) LUTs के लिए [Colour-Science Library](https://www.colour-science.org/) लाइब्रेरी।
* [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html) द्वारा बनाए गए बेहतरीन ब्लू नॉइज़ टेक्सचर्स।
* [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html) द्वारा बनाया गया सोलर कोरोना टेक्सचर।
* [leeor_net](https://opengameart.org/content/water-caustics-effect-small) का यह बेहद उपयोगी वॉटर कॉस्टिक्स टेक्सचर, जिसका उपयोग वॉटर कॉस्टिक्स के लिए नहीं... बल्कि ऑरोरा बोरियालिस (aurora borealis) के लिए किया गया है!
* Sébastien Hillaire का *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), जिससे क्लाउड इल्यूमिनेशन स्ट्रक्चर, SH9 एम्बिएंट LUT डिज़ाइन और Elek/Chalmers फॉग सबट्रैक्शन अप्रोच को प्रेरणा मिली।
* Andrew Schneider और Nathan Vos का *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), जिससे ड्यूल-लोब हेन्ये-ग्रीनस्टीन फेज़ फंक्शन, क्लाउड शेप नॉइज़ अप्रोच और रिड्यूस्ड-एक्सटिंक्शन मल्टीपल स्कैटरिंग एप्रोक्सिमेशन को प्रेरणा मिली।
* D. Hestroffer और C. Magnan का *Centre to limb darkening of the Sun with HIPPARCOS* (1998), जिसने B, V और R बैंड्स के लिए वे तरंगदैर्ध्य-निर्भर लिम्ब डार्किंग गुणांक प्रदान किए जिनका उपयोग सूर्य के किनारे को भौतिक रूप से सही लाल रंग की आभा देने के लिए किया गया है।
* [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) और [Emscripten](https://emscripten.org/) में किए गए सभी अद्भुत कार्यों को।
* *और ऐसी अनगिनत अन्य वेबसाइटों और व्यक्तियों को। हमें आपके जैसे दिग्गजों के कंधों पर खड़े होने का अवसर देने के लिए आपका बहुत-बहुत धन्यवाद।*

## लाइसेंस
यह प्रोजेक्ट MIT लाइसेंस के अंतर्गत आता है - विवरण के लिए [LICENSE.md](LICENSE.md) फ़ाइल देखें।