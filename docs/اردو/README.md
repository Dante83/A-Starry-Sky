# A-Starry-Sky

A-Starry-Sky [A-Frame Web Framework](https://aframe.io/) کے لیے ایک آسمانی گنبد (sky dome) ہے۔ اس کا مقصد ایک سادہ اور فوری استعمال کے قابل کمپوننٹ فراہم کرنا ہے جسے آپ اپنی تخلیقات میں دن اور رات کے خوبصورت چکرات (day-night cycles) بنانے کے لیے استعمال کر سکتے ہیں۔

> **تنبیہ: اس کے لیے طاقتور GPU کی ضرورت ہے — اسے موبائل فون پر نہ کھولیں۔**

**[لائیو ڈیمو](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — سان فرانسسکو میں موجودہ تاریخ اور وقت کا آسمان۔

| مثال | تفصیل |
|:---|:---|
| [Desert (صحرا)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | دن کے ایک مقررہ وقت پر صحرائی منظر |
| [Solar Eclipse (سورج گرہن)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | کورونا کے ساتھ مکمل سورج گرہن |
| [Lunar Eclipse (چاند گرہن)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | چاند پر زمین کا سایہ |
| [Christmas Star (کرسمس اسٹار - 1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | مشتری اور زحل کا عظیم ملاپ (Great conjunction) |
| [Mars (مریخ)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | مریخ کا مخصوص ماحول |
| [Custom Atmosphere (مخصوص ماحول)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Mie/Rayleigh اسکیٹرنگ کی مختلف اقدار |
| [High Altitude (زیادہ بلندی)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | 20 کلومیٹر کی بلندی سے آسمان کا منظر |
| [Aurora Borealis (شمالی روشنیاں)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ GPU پر زیادہ بوجھ |
| [Light Clouds (ہلکے بادل)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ GPU پر زیادہ بوجھ |
| [Medium Clouds (درمیانے بادل)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ GPU پر زیادہ بوجھ |
| [Heavy Clouds (گھنے بادل)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ GPU پر زیادہ بوجھ |

## پیشگی ضروریات

یہ [A-Frame Web Framework](https://aframe.io/) کے ورژن 1.7.0 یا اس سے جدید تر ورژن کے لیے بنایا گیا ہے۔ اس کے علاوہ، اس کے لیے ایک ایسے ویب براؤزر کی ضرورت ہے جو Web XR کے ساتھ ہم آہنگ (compatible) ہو۔

`https://aframe.io/releases/1.7.0/aframe.min.js`

## انسٹالیشن

`a-starry-sky.v1.2.0.min.js` اور `assets` اور `wasm` فولڈرز کو اپنے پروجیکٹ میں کاپی کریں۔ درج ذیل اسکرپٹس کو اپنے HTML میں شامل کریں — یاد رہے کہ `starry-sky-web-worker.js` یہاں شامل **نہیں** ہے؛ اس کے بجائے اسے براہِ راست `<a-starry-sky>` ٹیگ پر ریفرنس کیا گیا ہے۔

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

ایک بار جب یہ ریفرنسز سیٹ ہو جائیں، تو اپنے A-Frame کے `<a-scene>` ٹیگ میں `<a-starry-sky>` کمپوننٹ شامل کریں اور اپنے sky-state ویب ورکر URL کا حوالہ اس طرح دیں:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

یہ بنیادی کوڈ آپ کو ایک ایسا آسمان فراہم کرے گا جو سان فرانسسکو، کیلیفورنیا کے طول اور عرض (latitude and longitude) کے مطابق رئیل ٹائم میں حرکت کرتا ہے۔ تاہم، ہم اس سے کہیں زیادہ کر سکتے ہیں۔ A-Starry-Sky میں بہت سے کسٹم HTML ٹیگز موجود ہیں جو آپ کے آسمان کی حالت (sky state) کو اپنی مرضی کے مطابق ڈھالنے میں مدد کرتے ہیں۔

**نوٹ: یہ اسکائی باکس (sky box) ناقابلِ تبدیلی (immutable) ہے۔ اس کا مطلب ہے کہ آپ جو سیٹنگز شروع میں منتخب کریں گے، وہ کسی بھی صفحے پر مستقل رہیں گی۔ بدقسمتی سے، فی الحال کوڈ کو تبدیل پذیر (mutable) بنانا بہت مشکل ہے۔**

## مقام کا تعین

**ٹیگ (Tag)** | **تفصیل** | **ڈیفالٹ ویلیو**
:--- | :--- | :---
`<sky-location>` (بنیادی ٹیگ) | بنیادی ٹیگ۔ اس میں آسمانی عرض بلد اور طول بلد کے ذیلی ٹیگز شامل ہوتے ہیں۔ | N/A
`<sky-latitude>` (عرض بلد) | مقام کا عرض بلد مقرر کریں۔ خط استوا کے شمال کی جانب **مثبت** (positive) قیمت ہوگی۔ | 38
`<sky-longitude>` (طول بلد) | مقام کا طول بلد مقرر کریں۔ [پرائم میریڈین](https://en.wikipedia.org/wiki/Prime_meridian) کے مغرب کی جانب **منفی** (negative) قیمت ہوگی۔ | -122

آپ زمین پر کسی بھی عرض بلد اور طول بلد کے مطابق اپنا آسمان سیٹ کر سکتے ہیں۔ مقام کا تعین کھلاڑیوں کو موسموں کا احساس دلانے کے لیے مفید ہے، جس میں سورج یا چاند کے مدار (arcs) تبدیل کیے جا سکتے ہیں۔ عرض بلد یہ بھی طے کرے گا کہ آپ کے رات کے آسمان پر کون سے ستارے نظر آئیں گے۔ وقت پر منحصر واقعات، جیسے سورج اور چاند گرہن کے لیے عرض بلد اور طول بلد دونوں انتہائی اہم ہیں۔ یہ بات خاص طور پر سورج گرہن کے لیے درست ہے اگر آپ مکمل سورج گرہن کا تجربہ کرنا چاہتے ہوں۔ خیر، مقام سیٹ کرنا اس فیصلے سے کہیں زیادہ آسان ہے کہ جانا کہاں ہے۔ بس [Google Earth](https://earth.google.com/web/) یا کسی دوسرے نقشے سے اپنی پسند کا مقام منتخب کریں، اور ان قیمتوں کو متعلقہ ٹیگز میں اس طرح درج کریں:

چلیے نیویارک چلتے ہیں!
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

ٹھیک ہے، لیکن پرتھ، آسٹریلیا کا کیا؟
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

یاد رہے کہ [پرائم میریڈین](https://en.wikipedia.org/wiki/Prime_meridian) کے مغرب کی جانب طول بلد منفی ہوتے ہیں (مثلاً نیویارک، بیونس آئرس)۔

## وقت کی ترتیب

**ٹیگ (Tag)** | **تفصیل (Description)** | **ڈیفالٹ ویلیو (Default Value)**
:--- | :--- | :---
`<sky-time>` (مین ٹیگ) | مین ٹیگ۔ اس میں تاریخ یا وقت کے عناصر سے متعلق تمام چائلڈ ٹیگز شامل ہوتے ہیں۔ | N/A
`<sky-date>` (تاریخ) | مقامی تاریخ اور وقت کی سٹرنگ جس کا فارمیٹ **سال-مہینہ-دن گھنٹہ:منٹ:سیکنڈ** ہے (مثلاً *2021-03-21 13:45:51*)۔ گھنٹوں کے لیے 0 سے 23 تک کا نظام استعمال کیا گیا ہے، جہاں 0 کا مطلب رات 12 بجے اور 23 کا مطلب رات 11 بجے ہے۔ | موجودہ تاریخ
`<sky-speed>` (رفتار) | وقت کا ملٹی پلائر (multiplier) جس کے ذریعے فلکیاتی حسابات کی رفتار کو تیز یا کم کیا جا سکتا ہے۔ | 1.0
`<sky-utc-offset>` (UTC آفسیٹ) | اس مقام کے لیے UTC آفسیٹ۔ منفی قیمتیں [پرائم میریڈین](https://en.wikipedia.org/wiki/Prime_meridian) کے مغرب کی جانب ظاہر کرتی ہیں، جو کہ طولِ بلد (longitude) کی ویلیوز کے برعکس ہے۔ **نوٹ کریں کہ UTC وقت DST (ڈے لائٹ سیونگ ٹائم) پر عمل نہیں کرتا** | 7

اپنے منتخب کردہ مقام کے لیے `<sky-date>` کو **مقامی وقت** پر سیٹ کریں، اور پھر `<sky-utc-offset>` کو اس ٹائم زون کے مطابق ترتیب دیں۔ مثال کے طور پر، نیویارک سٹی گرمیوں میں UTC-4 اور سردیوں میں UTC-5 ہوتا ہے — DST خود بخود لاگو نہیں ہوتا۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- مقام کی سابقہ سیٹنگز -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- آپ UTC آفسیٹ کو اس طرح ترتیب دے سکتے ہیں! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

غور کریں کہ آپ نے ایک بار پھر مین `<sky-time>` ٹیگ کا استعمال کیا ہے جس میں وقت کی سیٹنگز کے تمام متعلقہ چائلڈ ٹیگز موجود ہیں۔

لیکن صرف مقامی مشین کے وقت تک محدود رہنے کی ضرورت نہیں ہے۔ کیوں نہ کچھ دلچسپ کیا جائے، جیسے کہ وقت کا سفر (time travel)! میں نے سنا ہے کہ [8 اپریل 2024 کو دوپہر 1:27 بجے (24 گھنٹے کے فارمیٹ میں 13:27) ٹیکساس کے علاقے ڈیل ریو میں](https://nationaleclipse.com/cities_total.html) ایک شاندار [سورج گرہن](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) ہونے والا ہے۔ تو چلیے، اسے دیکھتے ہیں!

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

کیا آپ نے [کرسمس اسٹار](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn) کو مس کر دیا؟ نہیں، نہیں، اس والے کی بات نہیں کر رہا۔ بلکہ 1226 عیسوی کے ستارے کی بات ہے۔ خیر، یہ اچھی بات ہے کہ ہمارے پاس ٹائم مشین موجود ہے اور A-Starry-Sky اب سیاروں (planets) کو بھی سپورٹ کرتا ہے :D۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

وقت کا یہ سفر تو دلچسپ ہے، لیکن شاید آپ وقت کی *رفتار* (speed) تبدیل کرنے میں بھی دلچسپی رکھتے ہوں۔ گیمنگ کی دنیا میں دن اور رات کے چکر اکثر حقیقت سے زیادہ تیز ہوتے ہیں، یا ہو سکتا ہے کہ آپ لائٹنگ کے مقاصد کے لیے کسی خاص لمحے کو قید کرنے کے لیے وقت کو مستقل طور پر روکنا چاہیں۔ اس کے لیے `<sky-speed>` ٹیگ کا اضافہ کریں۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- اب حقیقی زندگی کے ایک دن کے بدلے گیم کی دنیا میں آٹھ دن ہوں گے۔ -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

ظاہر ہے، اگر آپ اسے کسی مستقل (persistent) دنیا میں استعمال کر رہے ہیں، تو اپنا HTML بناتے وقت وقت کے اس تیز بہاؤ کو مدنظر ضرور رکھیں۔ تاہم، اپنے آسمان کے لیے ڈائنامک HTML ترتیب دینا مکمل طور پر آپ کی مرضی پر منحصر ہے۔

## ماحول کی ترتیبات میں تبدیلی

**ٹیگ (Tag)** | **تفصیل (Description)** | **ڈیفالٹ ویلیو (Default Value)**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | مین ٹیگ۔ تمام ذیلی ٹیگز جو ماحول کی ترتیبات سے متعلق ہیں، اس کے اندر آتے ہیں۔ | N/A
`<sky-camera-height>` | زمین سے کیمرے کی بلندی۔ | 0.0km
`<sky-mie-directional-g>` | یہ بتاتا ہے کہ 'می سکینگ' (Mie scattering) کے ذریعے روشنی کس حد تک آگے کی طرف پھیلتی ہے۔ یہ سورج کے گرد وہ سفید ہالہ ہوتا ہے جو فضا میں موجود بڑے ذرات کی وجہ سے بنتا ہے۔ جتنا زیادہ mie-directional G ہوگا، فضا اتنی ہی دھول بھری نظر آئے گی۔ | 0.8
`<sky-sun-intensity>` | ایٹموسفیرک شیڈر (atmospheric shader) میں سورج کی شدت۔ | 1367.0
`<sky-moon-intensity>` | ایٹموسفیرک شیڈر میں چاند کی شدت۔ | 29.0
`<sky-mie-beta>` | می سکینگ (Mie scattering) کے لیے روشنی کے پھیلاؤ کا رنگ پر انحصار، جو بنیادی طور پر سورج کے قریب 'چمک' (glow) پیدا کرنے کا ذمہ دار ہے۔ تمام فریکوئنسیز میں پھیلاؤ کافی یکساں ہوتا ہے۔ | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | ریلے سکینگ (Rayleigh scattering) کے لیے روشنی کے پھیلاؤ کا رنگ پر انحصار، جو بنیادی طور پر آسمان میں نیلے رنگ کے پھیلاؤ کا ذمہ دار ہے۔ غور کریں کہ ڈیفالٹ طور پر بلو چینل میں سب سے زیادہ پھیلاؤ ہوتا ہے۔ | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | اوزون تہہ (ozone layer) کے لیے روشنی کے پھیلاؤ کا رنگ پر انحصار، جو غروبِ آفتاب کے وقت گہرے نیلے رنگوں کے لیے انتہائی اہم ہے۔ | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | وہ حد یا بلندی جس کے بعد ماحول 'ختم' ہو جاتا ہے۔ | 80.0 km
`<sky-radius-of-earth>` | سیارے یا زمین کا رداس (radius)۔ | 6366.7 km
`<sky-rayleigh-scale-height>` | ریلے سکینگ کے لیے فال آف سکیل ہائٹ (falloff scale height)، یہ فرض کرتے ہوئے کہ پھیلاؤ ایکسپونینشل (exponential) ہے۔ ریلے سکینگ ایٹموسفیرک گیسوں سے پیدا ہوتی ہے، اس لیے اس کی سکیل ہائٹ زیادہ ہوتی ہے۔ | 8.4
`<sky-mie-scale-height>` | می سکینگ کے لیے فال آف سکیل ہائٹ۔ می سکینگ بڑے ذرات سے پیدا ہوتی ہے، اس لیے یہ تیزی سے کم ہوتی ہے، جس کی وجہ سے اس کی کریکٹرسٹک ہائٹ سکیلر (characteristic height scaler) چھوٹی ہوتی ہے۔ | 1.25
`<sky-ozone-percent-of-rayleigh>` | آسمان میں اوزون کا موجودہ فیصد، جو غروبِ آفتاب کے وقت اوزون کی واپسی (return) طے کرنے کے لیے استعمال ہوتا ہے۔ | 6E-7
`<sky-moon-angular-diameter>` | آسمان میں نظر آنے والے چاند کا زاویاتی قطر (angular diameter)۔  | 3.15 degrees
`<sky-sun-angular-diameter>` | آسمان میں نظر آنے والے سورج کا زاویاتی قطر۔ | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | وہ اقدامات (steps) کی تعداد جو رے ٹریسر ایٹموسفیرک LUTs کے لیے روشنی جمع کرتے وقت آسمان کے کنارے تک لیتا ہے۔ | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | ہر نکتے پر 'kth order scattering' کے لیے لیے گئے زاویاتی اقدامات کی تعداد۔ | 30 steps
`<sky-number-of-scattering-orders>` | ان سکینگ (inscattering) LUT میں بیک (bake) کیے جانے والے ہائر آرڈر (kth) سکینگ پاسز کی تعداد۔ زیادہ ویلیوز سے کوالٹی بڑھتی ہے لیکن LUT بیک ہونے کا وقت بھی بڑھ جاتا ہے۔ | 4
`<sky-parameters-color-red>` | سرخ رنگ کا جزو جو `<sky-rayleigh-beta>`، `<sky-mie-beta>` اور `<sky-ozone-beta>` ٹیگز میں استعمال ہوتا ہے۔ | N/A
`<sky-parameters-color-green>` | سبز رنگ کا جزو جو `<sky-rayleigh-beta>`، `<sky-mie-beta>` اور `<sky-ozone-beta>` ٹیگز میں استعمال ہوتا ہے۔ | N/A
`<sky-parameters-color-blue>` | نیلے رنگ کا جزو جو `<sky-rayleigh-beta>`، `<sky-mie-beta>` اور `<sky-ozone-beta>` ٹیگز میں استعمال ہوتا ہے۔ | N/A

ایٹموسفیرک پیرامیٹرز (atmospheric parameters) اس پورے کوڈ بیس میں سب سے وسیع ترین APIs میں سے ایک ہیں۔ اگرچہ ماہر ڈویلپرز ان ویلیوز کو استعمال کر کے اپنی مرضی کے آسمان تخلیق کر سکتے ہیں، لیکن زیادہ تر صارفین ڈیفالٹ ویلیوز ہی استعمال کرنا چاہیں گے۔ تاہم، یہاں کچھ ویلیوز ایسی ہیں جو خاص طور پر مفید اور سمجھنے میں کافی آسان ہیں۔

وہ چیزیں جنہیں آپ تبدیل کرنا چاہیں گے، ان میں سب سے اہم سورج اور چاند کا سائز ہے۔ حقیقی زندگی میں سورج کا زاویاتی قطر (angular diameter) 0.53 ڈگری اور چاند کا 0.50 ڈگری ہوتا ہے۔ سیمولیٹر میں ان ویلیوز کا استعمال حقیقت کے زیادہ قریب ہوگا، لیکن اکثر سیمولیشنز میں، خاص طور پر مانیٹرز جیسے نان-وی آر (non-VR) آلات پر، یہ بہت چھوٹے نظر آتے ہیں۔ ان ویلیوز کو بڑا یا چھوٹا کرنے کے لیے بس متعلقہ ٹیگز میں تبدیلی کر دیں۔

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

آپ سیارے سے اپنی ابتدائی بلندی کو بھی تبدیل کرنا چاہیں گے۔ اسے `<sky-camera-height>` ٹیگ کے ذریعے آسانی سے سیٹ کیا جا سکتا ہے، حالانکہ جب آپ کیمرے کو اوپر یا نیچے لے جائیں گے تو آسمان خود بخود آپ کی بلندی کے مطابق ڈھل جائے گا۔ یہ منظر (scene) کی ابتدائی بلندی کلومیٹرز میں طے کرتا ہے، جس میں زیادہ سے زیادہ بلندی *80 کلومیٹر* اور کم سے کم *0 کلومیٹر* ہے۔

[بلند مقام کی مثال (High Altitude Example)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!--چلو تھوڑا اور اوپر چلتے ہیں۔ یہاں ہوا پتلی ہے۔ -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

آپ اپنے ماحول کی ساخت (composition) کو بھی تبدیل کرنا چاہیں گے۔ یہ عنصر آپ کو آسمان کی شکل و صورت کو اپنی مرضی کے مطابق کنٹرول کرنے کے لیے مختلف میکانزم تک رسائی دیتا ہے۔ مثال کے طور پر، اگر آپ ہماری مقامی ویلیوز (5.8e-3, 1.35e-2, 3.31e-2) کے بجائے [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) میں دی گئی ریلے ویلیوز (5.19E-3, 1.21E-2, 2.96E-2) کو ترجیح دیتے ہیں، اور آپ بیٹا (beta) کی ویلیو 4.44E-3 سے بدل کر 2E-3 کرنا چاہتے ہیں، تو آپ کوڈ میں انہیں آسانی سے تبدیل کر سکتے ہیں۔

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

لیکن یہ اتنا دلچسپ نہیں ہے، فرض کریں کہ ہم کچھ زیادہ ہی منفرد کرنا چاہتے ہیں۔ آئیے [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) کے کام پر عمل کرتے ہیں اور مریخ (Mars) پر چلتے ہیں! یہاں ریلے (Rayleigh) اور می (Mie) کے استعمال کو آپس میں بدل دیا گیا ہے، لہذا ہمیں ان کی کریکٹرسٹک ہائٹس (characteristic heights) کو بھی تبدیل کرنا چاہیے۔ مریخ پر زیادہ تر پھیلاؤ بڑے ذرات کی 'می سکینگ' سے ہوتا ہے اور وہاں کا ماحول بہت پتلا ہے۔ نتیجے کے طور پر، ہم می (ریلے) کو تقریباً ختم کر سکتے ہیں اور ان کی کریکٹرسٹک ہائٹس کو بدل سکتے ہیں۔ ہمیں سیارے کا رداس بھی تبدیل کرنا چاہیے اور رے ٹریسر میں بہتر نتائج کے لیے ایٹموسفیرک بلندی کو بھی بدلا جا سکتا ہے۔

[مریخ کی مثال (Mars Example)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- غور کریں کہ مریخ سرخ روشنی کو زیادہ پھیلاتا ہے -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- می (mie) میں چند تبدیلیاں بھی مددگار ثابت ہوتی ہیں -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- اوزون کو غیر فعال کرنا نہ بھولیں -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- خیر، ہمارے معاملے میں، یہ مریخ ہے... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- سورج چھوٹا ہے اور چاند کو ہم مکمل طور پر ختم کر سکتے ہیں -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

آپ LUT رے سٹیپ کاؤنٹس (ray step counts) کو بھی ایڈجسٹ کر سکتے ہیں، حالانکہ ڈیفالٹ ویلیوز پہلے سے ہی بہترین ہیں اور تبدیلیوں کا اثر شاذ و نادر ہی محسوس ہوتا ہے۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- کارکردگی کے لیے کم، درستگی کے لیے زیادہ (زیادہ تر کیسز کے لیے ڈیفالٹ 30 بہترین ہے) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## لائٹنگ کی ڈیفالٹ سیٹنگز میں تبدیلی

**ٹیگ (Tag)** | **تفصیل (Description)** | **ڈیفالٹ ویلیو (Default Value)**
:--- | :--- | :---
`<sky-lighting>` | پیرنٹ ٹیگ۔ منظر کی لائٹنگ سے متعلق تمام چائلڈ ٹیگز اس میں شامل ہوتے ہیں۔ | N/A
`<sky-sun-intensity>` | سورج کی روشنی کی شدت کا ملٹی پلائر، اسے شمسی ڈائریکشنل لائٹنگ کو روشن یا مدہم کرنے کے لیے استعمال کیا جا سکتا ہے۔ | 1.0
`<sky-moon-intensity>` | چاند کی روشنی کی شدت کا ملٹی پلائر، اسے قمری (lunar) ڈائریکشنل لائٹنگ کو روشن یا مدہم کرنے کے لیے استعمال کیا جا سکتا ہے۔ | 1.0
`<sky-ambient-intensity>` | ایمبیئنٹ لائٹنگ کی شدت کا ملٹی پلائر، اسے ایمبیئنٹ لائٹنگ سسٹم کی شدت کو بڑھانے یا کم کرنے کے لیے استعمال کیا جا سکتا ہے۔ | 2.0
`<sky-minimum-ambient-lighting>` | سسٹم میں ایمبیئنٹ لائٹ کی کم سے کم مقدار۔ | 0.01
`<sky-maximum-ambient-lighting>` | سسٹم میں ایمبیئنٹ لائٹ کی زیادہ سے زیادہ مقدار۔ | INF
`<sky-atmospheric-perspective-type>` | اسے *normal*، *advanced* یا *none* پر سیٹ کیا جا سکتا ہے۔ سین فوگ (scene fog) کے لیے یہ ضروری ہے۔ *normal* اصل ایکسپونینشل فوگ ماڈل استعمال کرتا ہے؛ جبکہ *advanced* افق (horizon) کے رنگوں میں بہتری کے لیے Preetham-based ماڈل استعمال کرتا ہے، جس سے GPU پر بوجھ بڑھ جاتا ہے۔ | normal
`<sky-atmospheric-perspective-density>` | صرف *normal* فوگ کے لیے۔ ایکسپونینشل سین فوگ کے لیے ڈینسٹی پیرامیٹر کو کنٹرول کرتا ہے۔ رنگ خود بخود سین لائٹنگ سے سیٹ ہو جاتا ہے۔ اگر سین فوگ ٹائپ *advanced* ہو تو اسے نظر انداز کر دیا جاتا ہے۔ | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | صرف *advanced* فوگ کے لیے۔ ایڈوانسڈ فوگ ماڈل کے لیے فوگ تک کے فاصلے کو ضرب (multiply) کرتا ہے۔ | 2.0
`<sky-ground-color>` | پیرنٹ ٹیگ۔ سطح سے منعکس ہونے والی لائٹنگ کے لیے زمین کے بنیادی رنگ کی وضاحت کرنے والے `<sky-ground-color-{color-channel}>` ٹیگز اس میں شامل ہوتے ہیں۔ | N/A
`<sky-ground-color-red>` | `<sky-ground-color>` ٹیگز میں **سرخ** کلر چینل کی تبدیلیوں کے لیے استعمال ہوتا ہے۔ | 66
`<sky-ground-color-green>` | `<sky-ground-color>` ٹیگز میں **سبز** کلر چینل کی تبدیلیوں کے لیے استعمال ہوتا ہے۔ | 44
`<sky-ground-color-blue>` | `<sky-ground-color>` ٹیگز میں **نیلے** کلر چینل کی تبدیلیوں کے لیے استعمال ہوتا ہے۔ | 2
`<sky-shadow-camera-resolution>` | سائے (shadows) بنانے کے لیے استعمال ہونے والے ڈائریکٹ لائٹنگ کیمرے کی ریزولوشن (پکسلز میں)۔ زیادہ ویلیوز بہتر کوالٹی کے سائے بناتی ہیں لیکن کوڈ پر بوجھ بڑھ جاتا ہے۔ | 2048
`<sky-shadow-camera-size>` | سائے ڈالنے کے لیے استعمال ہونے والے کیمرہ ایریا کا سائز۔ بڑا سائز زیادہ رقبے کو کور کرتا ہے، لیکن کیمرے کے ہر پکسل کو وسیع رقبے پر پھیلانے کی وجہ سے ایلیئزنگ (aliasing) کے مسائل پیدا ہو سکتے ہیں۔ | 32.0
`<sky-sun-bloom>` | پیرنٹ ٹیگ، سورج کے بلوم رینڈر پاس کی تمام خصوصیات اس میں شامل ہوتی ہیں۔ | N/A
`<sky-moon-bloom>` | پیرنٹ ٹیگ، چاند کے بلوم رینڈر پاس کی تمام خصوصیات اس میں شامل ہوتی ہیں۔ | N/A
`<sky-bloom-enabled>` | اس فلکیاتی جسم پر بلوم کو فعال (true) یا غیر فعال (false) کرتا ہے۔ | true
`<sky-bloom-exposure>` | بلوم فلٹر کے ایکسپوزر پیرامیٹر کو تبدیل کرتا ہے - یعنی کیمرے کو واپس بھیجی جانے والی روشنی کی مقدار۔ | 1.0
`<sky-bloom-threshold>` | بلوم فلٹر کے تھریشولڈ پیرامیٹر کو تبدیل کرتا ہے - بلوم فعال کرنے کے لیے شدت کی کم سے کم مقدار۔ | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | بلوم فلٹر کے اسٹرینتھ (strength) پیرامیٹر کو تبدیل کرتا ہے - منتخب پکسلز کے لیے 'بلوم' کی مقدار۔ | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | بلوم فلٹر کے ریڈیس (radius) پیرامیٹر کو تبدیل کرتا ہے - وہ فاصلہ جہاں تک بلوم فلٹر پھیلے گا۔ | {sun: 1.0, moon: 1.4}

اسکائی لائٹنگ ٹیگز منظر میں ڈائریکٹ اور ان ڈائریکٹ لائٹنگ کی خصوصیات کو کنٹرول کرنے کے لیے مفید ہیں۔ ورژن 1.0.0 میں، آسمان کی ڈائریکشنل لائٹس کی تعداد 2 (سورج اور چاند) سے کم کر کے 1 (صرف سب سے زیادہ غالب روشنی کے ذریعے) کر دی گئی ہے۔ ڈائریکشنل لائٹ ہمیشہ صارف کے کیمرے پر مرکوز ہوتی ہے اور اس کیمرے کے گرد سائے بناتی ہے۔ اگرچہ ڈائریکشنل لائٹ مختلف قسم کے سائے سپورٹ کر سکتی ہے، لیکن یہ لائبریری اسے کنٹرول کرنے کی جگہ نہیں ہے۔ اس کے بجائے، شیڈو ٹائپ کو `<a-scene>` ٹیگ میں سیٹ کیا جاتا ہے، جیسا کہ [یہاں](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows) بیان کیا گیا ہے۔ یعنی، آپ ویلیوز کو درج ذیل میں سے کسی پر بھی سیٹ کر سکتے ہیں۔

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

بدقسمتی سے، اس تحریر کے وقت تک A-Frame ابھی ویرینس شیڈو میپس (variance shadow maps) کو سپورٹ نہیں کرتا، اگرچہ اس کے لیے ایک اوپن ایشو موجود ہے۔ نیز، آپ سورج اور چاند کی لائٹنگ کے لیے جو شیڈو ٹائپ منتخب کریں گے وہی آپ کے منظر میں تمام دوسری لائٹس کے لیے بھی ہوگی، لہذا سائے منتخب کرتے وقت اس بات کا خیال رکھیں۔

آپ شیڈو کیمرہ سائز اور ریزولوشن کے ذریعے سایوں کی کوالٹی کو بھی کنٹرول کر سکتے ہیں۔ سائز بڑھانے سے منظر کا زیادہ حصہ کور ہوتا ہے؛ ریزولوشن بڑھانے سے نتیجہ زیادہ واضح (sharp) ہو جاتا ہے — لیکن ان دونوں کی GPU قیمت ہوتی ہے، اس لیے اپنی ضروریات کے مطابق توازن برقرار رکھیں۔ بڑے ماحول والے میشز (environment meshes) پر سائے بند کرنا بھی بہتر ہے، کیونکہ وہ اکثر فرسٹم (frustum) سے باہر ہوتے ہیں اور ایک بدصورت مربع نما شیڈو ایج پیدا کرتے ہیں۔

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Increase size to cast shadows further from the camera -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Increase resolution to keep shadows sharp at larger sizes -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

جب آپ کے منظر میں سائے بالکل درست ہو جائیں، تو شاید آپ اپنی 'زمین' (ground) کا رنگ بھی تبدیل کرنا چاہیں گے۔ A-Starry-Sky اب ایک ٹرپل ہیمیسفیریکل لائٹنگ سیٹ اپ سپورٹ کرتا ہے جو ویب ورکرز کے ذریعے علیحدہ CPU تھریڈ پر گراؤنڈ لائٹ اسکیٹرنگ ماڈل کے ساتھ آسمان کے رنگوں کے کنوولوشن (convolution) کا استعمال کرتا ہے۔ تاہم، زمین کا ڈیفالٹ رنگ بھورا (brown) ہے۔ ہو سکتا ہے کہ آپ کے پاس گھاس کا میدان یا نیلا سمندر ہو۔ اپنی زمین کا رنگ سیٹ کرنے کے لیے، آپ `<sky-ground-color>` ٹیگ اور اس کے چائلڈ گراؤنڈ کلر چینل ٹیگز استعمال کر سکتے ہیں۔ فرض کریں کہ ہم ایک سرسبز گھاس کے میدان کے لیے زمین کو چمکدار سبز کرنا چاہتے ہیں۔

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

غور کریں کہ اوپر دی گئی ویلیوز 0 اور 255 کے درمیان نارملائزڈ ہیں۔ چنانچہ، r, g, b کا مجموعہ 0, 0, 0 کالا ہے اور 255, 255, 255 سفید ہے۔ اوپر والا رنگ شاید تھوڑا زیادہ روشن ہو جس سے زمین معمولی روشنی میں بھی 'چمکتی' (glow) ہوئی نظر آئے۔ اس اثر کو کم کرنے کے لیے، آپ بس رنگ کو تھوڑا مدہم کر سکتے ہیں۔

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

اس کے باوجود، اگر آپ کا کوئی بھی کلر چینل 255 سے اوپر جاتا ہے، تو فی الحال 'رنگ کو مزید گہرا کرنے' یا زمین کو 'اندھیرے میں چمکانے' کا کوئی طریقہ نہیں ہے۔ مزید برآں، زمین کا رنگ تمام مقامات پر مستقل (constant) رہتا ہے، لہذا اگر آپ کے منظر میں ایک سے زیادہ رنگ ہیں تو شاید ایسا رنگ منتخب کرنا بہتر ہو جو تمام دوسرے رنگوں کے درمیان ہو۔

گراؤنڈ لائٹنگ کی سپورٹ کے علاوہ، اب آپ ڈائریکٹ لائٹنگ اور ایمبیئنٹ لائٹنگ کی شدت (intensities) کو براہ راست کنٹرول کر سکتے ہیں۔ سورج یا چاند کی شدت کو تبدیل کرنا آسان ہے، کیونکہ آپ بس ڈیفالٹ ویلیو کا ملٹی پل استعمال کرتے ہیں تاکہ یہ طے کر سکیں کہ وہ فلکیاتی جسم کتنا روشن یا مدہم ہونا چاہیے۔ آپ اسی طریقے سے ایمبیئنٹ شدت کو بڑھا یا گھٹا سکتے ہیں تاکہ منظر میں ایمبیئنٹ لائٹنگ کی مقدار کو کنٹرول کیا جا سکے۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Let's make the sun twice as bright -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- But let's make the moon half as bright -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- But let's have ten times the amount of ambient lighting -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

آپ ایمبیئنٹ لائٹنگ کے لیے فلور (کم سے کم حد) یا سیلنگ (زیادہ سے زیادہ حد) کو بھی کنٹرول کرنا چاہیں گے، تاکہ یہ یقینی بنایا جا سکے کہ آپ کے پاس ہمیشہ روشنی کی ایک خاص مقدار موجود رہے، یا روشنی ایک حد سے زیادہ نہ بڑھے۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Let's brighten things up -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- But don't make it too much. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

کسی مرحلے پر، آپ آسمان میں سورج یا چاند کے لیے شامل کیے گئے بلوم ایفیکٹس (bloom effects) کے پیرامیٹرز کو تبدیل کرنا چاہیں گے۔ *a-starry-sky* THREE.JS کے [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) کا استعمال کرتا ہے۔ تمام فلکیاتی اجسام کی شدت کو بالترتیب پیرنٹ `<sky-sun-bloom>` اور `<sky-moon-bloom>` ٹیگز کے ذریعے علیحدہ طور پر کنٹرول کیا جاتا ہے۔ ان کے چائلڈ ٹیگز بلوم کی خصوصیات کو کنٹرول کرتے ہیں۔

آئیے چند پیرامیٹرز کو تبدیل کرنے سے شروع کرتے ہیں:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Let's dim the sun down a bit -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- But let's also increase the intensity of the moon -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

لیکن ہم بلوم کو مکمل طور پر بند بھی کر سکتے ہیں، جس سے GPU پر بوجھ تھوڑا کم ہو جاتا ہے۔

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

اسکائی لائٹنگ کا آخری عنصر جسے آپ شاید تبدیل کرنا چاہیں وہ ایٹموسفیرک پرسپیکٹو ڈینسٹی (atmospheric perspective density) ہے۔ *a-starry-sky* آپ کی ضروریات کے مطابق دو مختلف فوگ ماڈلز فراہم کرتا ہے۔
کمزور سسٹمز کے لیے، یہ بنیادی ایکسپونینشل ایٹموسفیرک پرسپیکٹو کو سپورٹ کرتا ہے، جو ویب ورکر پر پورے آسمان سے روشنی جمع کرتا ہے، اور پھر اسے بالکل عام ایکسپونینشل فوگ کی طرح لاگو کرتا ہے۔ ایکسپونینشل لائٹنگ کے ڈینسٹی پیرامیٹر کو کنٹرول کرنے کے لیے `<sky-atmospheric-perspective-density>` ٹیگ استعمال کریں۔ ابتدائی ویلیوز زیادہ رکھی گئی ہیں تاکہ چھوٹے مناظر میں بھی واضح ایٹموسفیرک پرسپیکٹو نظر آئے، لہذا آپ اسے اس کی ڈیفالٹ ویلیو *0.007* سے کم کرنا چاہیں گے۔ ساتھ ہی یہ یقینی بنائیں کہ `<sky-atmospheric-perspective-type>` ٹیگ میں موجودہ پرسپیکٹو ٹائپ کو *normal* پر سیٹ کیا گیا ہے۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- while the default is 0.007 the atmospheric perspective density is very
      tempermental to change so only small changes are needed. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

تاہم، اعلیٰ درجے کے سسٹمز کے لیے، آپ Preetham-based ایٹموسفیرک شیڈر کی نقل (simulate) کر سکتے ہیں جو *normal* سیٹنگ میں استعمال ہونے والے مستقل رنگوں کے بجائے افق کے رنگوں میں زیادہ تنوع لاتا ہے۔ فراہم کردہ حل Three.js کے فوگ شیڈر کی حدود کی وجہ سے آسمان کے لیے استعمال ہونے والی Elek-based اسکائی لائٹنگ سے بالکل مطابقت نہیں رکھتا، لیکن یہ اصل ایٹموسفیرک پرسپیکٹو کے مقابلے میں ایک نمایاں بہتری فراہم کرتا ہے۔ ایڈوانسڈ لائٹنگ ماڈل کو فعال کرنے کے لیے، بس `<sky-atmospheric-perspective-type>` ٹیگ میں *advanced* ویلیو درج کریں۔ `<sky-atmospheric-perspective-density>` کی طرح، آپ `<sky-atmospheric-perspective-distance-multiplier>` استعمال کر کے *advanced* لائٹنگ ماڈل کے فاصلے کو ضرب دے سکتے ہیں، جو Preetham-based ماڈل کے تمام فاصلوں کو آپ کی فراہم کردہ مقدار سے ضرب دیتا ہے۔ ابتدائی ویلیوز زیادہ رکھی گئی ہیں تاکہ چھوٹے مناظر میں بھی واضح ایٹموسفیرک پرسپیکٹو نظر آئے، لہذا آپ اسے اس کی ڈیفالٹ ویلیو *5.0* سے کم کرنا چاہیں گے۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- while the default is 2.0 the atmospheric distance multiplier in the
      advanced model we can reduce this down if we want to 1.0 for a less dramatic effect. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

آخر میں، آپ `<sky-atmospheric-perspective-type>` ٹیگ کی ویلیو کو *none* سیٹ کر کے تمام ایٹموسفیرک پرسپیکٹو کو بند کر سکتے ہیں۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Turn off atmospheric perspective -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## اورورا بوریالیس (Aurora Borealis) کو فعال کرنا

*انتباہ: اورورا بوریالیس کو فعال کرنے سے آپ کے آسمان کا کمپیوٹیشنل بوجھ (computational weight) نمایاں طور پر بڑھ جائے گا، کیونکہ فراہم کردہ اورورا شیدر اس خوبصورت قدرتی مظہر کو تخلیق کرنے کے لیے 'رے مارچنگ' (ray marching) طریقہ استعمال کرتا ہے۔*

**ٹیگ (Tag)** | **تفصیل (Description)** | **ڈیفالٹ ویلیو (Default Value)**
:--- | :--- | :---
`<sky-aurora>` (بنیادی ٹیگ) | بنیادی ٹیگ۔ اورورا بوریالیس کو فعال کرنے کے لیے ضروری ہے۔ اس میں اورورا سے متعلق تمام ذیلی ٹیگز شامل ہوتے ہیں۔ | N/A
`<sky-atomic-oxygen-color>` (ایٹمی آکسیجن کا رنگ) | یہ ان ایٹمی آکسیجن مالیکیولز کی وجہ سے ہوتا ہے جو سیارے کی سطح سے 150 اور 600 کلومیٹر کے درمیان موجود ہوتے ہیں۔ ایٹمی آکسیجن عام طور پر اورورا بوریالیس کے اوپری حصے میں ایک چمکدار سرخ پردہ بناتی ہے اور زیادہ تر شدید مظاہر میں نظر آتی ہے۔ یہ ٹیگ تین ذیلی کلر ٹیگز *sky-aurora-color-red*، *sky-aurora-color-green* اور *sky-aurora-color-blue* کے ذریعے ان رنگوں کو کنٹرول کرتا ہے۔ | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (ایٹمی آکسیجن کی حد) | یہ طے کرتا ہے کہ نمائش میں ایٹمی آکسیجن اورورا کی کتنی مقدار موجود ہونے کا امکان ہے۔ کم نمبر زیادہ اورورا کی نشاندہی کرتے ہیں، جبکہ زیادہ سے زیادہ 1.0 کا مطلب کوئی اورورا نہ ہونا ہے۔ | 0.12
`<sky-atomic-oxygen-intensity>` (ایٹمی آکسیجن کی شدت) | یہ اورورا کے اس حصے کی چمک (brightness) طے کرتا ہے، جس کی عام قیمتیں 5 سے کم ہوتی ہیں۔ | 0.3
`<sky-molecular-oxygen-color>` (مالیکیولر آکسیجن کا رنگ) | یہ ان مالیکیولر آکسیجن مالیکیولز کی وجہ سے ہوتا ہے جو سیارے کی سطح سے 100 اور 250 کلومیٹر کے درمیان موجود ہوتے ہیں۔ مالیکیولر آکسیجن عام طور پر وہ مخصوص چمکدار سبز رنگ فراہم کرتی ہے جو اورورا بوریالیس کی پہچان ہے اور زیادہ تر مظاہر میں نظر آتی ہے۔ یہ ٹیگ تین ذیلی کلر ٹیگز *sky-aurora-color-red*، *sky-aurora-color-green* اور *sky-aurora-color-blue* کے ذریعے ان رنگوں کو کنٹرول کرتا ہے، تاکہ اگر آپ اپنے اورورا کے لیے کوئی مختلف رنگ چاہیں تو ایسا کر سکیں۔ | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (مالیکیولر آکسیجن کی حد) | یہ طے کرتا ہے کہ نمائش میں مالیکیولر آکسیجن اورورا کی کتنی مقدار موجود ہونے کا امکان ہے۔ کم نمبر زیادہ اورورا کی نشاندہی کرتے ہیں، جبکہ زیادہ سے زیادہ 1.0 کا مطلب کوئی اورورا نہ ہونا ہے۔ | 0.02
`<sky-molecular-oxygen-intensity>` (مالیکیولر آکسیجن کی شدت) | یہ اورورا کے اس حصے کی چمک طے کرتا ہے، جس کی عام قیمتیں 5 سے کم ہوتی ہیں۔ | 2.0
`<sky-nitrogen-color>` (نائٹروجن کا رنگ) | یہ ان نائٹروجن مالیکیولز کی وجہ سے ہوتا ہے جو سیارے کی سطح سے 60 اور 120 کلومیٹر کے درمیان موجود ہوتے ہیں۔ نائٹروجن عام طور پر اورورا بوریالیس کی بنیاد کے گرد ایک میجنٹا (magenta) رنگ کا پردہ بناتی ہے اور زیادہ تر شدید مظاہر میں نظر آتی ہے۔ یہ ٹیگ تین ذیلی کلر ٹیگز *sky-aurora-color-red*، *sky-aurora-color-green* اور *sky-aurora-color-blue* کے ذریعے ان رنگوں کو کنٹرول کرتا ہے۔ | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (نائٹروجن کی حد) | یہ طے کرتا ہے کہ نمائش میں نائٹروجن اورورا کی کتنی مقدار موجود ہونے کا امکان ہے۔ کم نمبر زیادہ اورورا کی نشاندہی کرتے ہیں، جبکہ زیادہ سے زیادہ 1.0 کا مطلب کوئی اورورا نہ ہونا ہے۔ | 0.12
`<sky-nitrogen-intensity>` (نائٹروجن کی شدت) | یہ اورورا کے اس حصے کی چمک طے کرتا ہے، جس کی عام قیمتیں 5 سے کم ہوتی ہیں۔ | 4.0
`<sky-aurora-raymarch-steps>` (رے مارچنگ کے اقدامات) | ہر پکسل کے لیے رے مارچر (ray-marcher) کے اقدامات کی تعداد۔ | 32 (steps)
`<sky-aurora-cutoff-distance>` (حد کا فاصلہ) | وہ فاصلہ جس کے بعد اورورا رینڈر نہیں ہوتا، تاکہ رے مارچنگ کے معیار کو بہتر بنایا جا سکے؛ اس کی قیمت یہ ہے کہ دور موجود اورورا رینڈر نہیں ہوں گے کیونکہ ہمارے نوائز جنریٹرز کے لیے فی الحال SDF کیلکولیٹ نہیں کیے جاتے۔ | 1000 (kilometers - approximate)
`<sky-aurora-color-red>` (سرخ رنگ کا چینل) | اسے `<sky-nitrogen-color>`، `<sky-molecular-oxygen-color>` اور `<sky-atomic-oxygen-color>` ٹیگز کے **سرخ** کلر چینل کی تبدیلیوں کو بیان کرنے کے لیے استعمال کیا جاتا ہے۔ | N/A
`<sky-aurora-color-green>` (سبز رنگ کا چینل) | اسے `<sky-nitrogen-color>`، `<sky-molecular-oxygen-color>` اور `<sky-atomic-oxygen-color>` ٹیگز کے **سبز** کلر چینل کی تبدیلیوں کو بیان کرنے کے لیے استعمال کیا جاتا ہے۔ | N/A
`<sky-aurora-color-blue>` (نیلے رنگ کا چینل) | اسے `<sky-nitrogen-color>`، `<sky-molecular-oxygen-color>` اور `<sky-atomic-oxygen-color>` ٹیگز کے **نیلے** کلر چینل کی تبدیلیوں کو بیان کرنے کے لیے استعمال کیا جاتا ہے۔ | N/A

اورورا بوریالیس فطرت کے خوبصورت ترین پس منظر فراہم کرتے ہیں۔ عام طور پر شمالی اور جنوبی قطبوں کے قریب پائے جانے والے یہ آسمانی مظاہر سورج سے آنے والے تیز رفتار ذرات کے زمین کے مقناطیسی گھیرا (magnetosphere) میں کھنچے جانے اور مختلف ایٹموں و مالیکیولز کے ساتھ تعامل کا نتیجہ ہوتے ہیں۔ یہ تحریک یافتہ (excited) مالیکیولز پھر نظر آنے والی روشنی (visible spectrum) خارج کرتے ہیں، جس سے رات کے آسمان پر رقص کرتے ہوئے مسحور کن رنگین پردے بن جاتے ہیں۔

اپنے آسمان میں اورورا بوریالیس کا اضافہ کرنا نسبتاً آسان ہے، لیکن یہ ڈیفالٹ طور پر فعال نہیں ہوتا۔ *اورورا بوریالیس کو فعال کرنے کے لیے آپ کو `<sky-aurora>` ٹیگ شامل کرنا ہوگا۔*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- ڈیفالٹ سیٹ اپ کے لیے آپ کو کسی اضافی پیرامیٹرز کی ضرورت نہیں ہے -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

مختلف ایٹمی اور مالیکیولر اورورا کو اوپر دیے گئے کوڈ کے ذریعے کنٹرول کیا جا سکتا ہے، جس سے آپ اپنی اورورا نمائش کو اپنی مرضی کے مطابق ڈھال سکتے ہیں اور یہاں تک کہ خارج ہونے والے رنگوں کو بھی تبدیل کر سکتے ہیں (خواہ وہ حقیقت پسندانہ ہوں یا نہ ہوں)۔ مثال کے طور پر، اگر آپ ایک ٹھنڈا نیلا اورورا چاہتے ہیں جو پوری مالیکیولر آکسیجن رینج کو کور کرے، تو آپ درج ذیل کوڈ استعمال کر سکتے ہیں۔

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

دوسری طرف، اگر آپ صرف ہلکی مقدار میں سبز اورورا چاہتے ہیں، تو آپ درج ذیل کوڈ کے ساتھ ایک زیادہ لطیف اثر حاصل کر سکتے ہیں۔

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

آسمان کے رنگوں کو تبدیل کرنے کے علاوہ، آپ رینڈرنگ کے دوران رے مارچر (raymarcher) کے اقدامات (steps) کی تعداد بھی تبدیل کر سکتے ہیں۔ جتنے زیادہ اقدامات ہوں گے، آسمان اتنا ہی بہتر نظر آئے گا، لیکن اس سے آپ کے GPU پر بوجھ بڑھے گا۔ لہذا، کارکردگی اور معیار کے درمیان توازن ضروری ہے۔ ڈیفالٹ طور پر، شیدر والیم رے مارچنگ کے لیے 32 اقدامات استعمال کرتا ہے۔ اسے بڑھانے کے لیے، آپ درج ذیل طریقہ اپنا سکتے ہیں:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## بادلوں کو فعال کرنا

*انتباہ: بادلوں کو فعال کرنے سے آپ کے آسمان کا کمپیوٹیشنل بوجھ (computational weight) بہت بڑھ جائے گا، کیونکہ فراہم کردہ کلاؤڈ شیدر اس خوبصورت قدرتی منظر کو تخلیق کرنے کے لیے 'رے مارچنگ' (ray marching) طریقہ استعمال کرتا ہے۔*

**ٹیگ (Tag)** | **تفصیل (Description)** | **ڈیفالٹ ویلیو (Default Value)**
:--- | :--- | :---
`<sky-clouds>` (والد ٹیگ) | مین ٹیگ۔ بادلوں سے متعلق تمام ذیلی ٹیگز اس کے اندر آتے ہیں۔ بادلوں کو فعال کرنے کے لیے یہ ضروری ہے۔ | N/A
`<sky-cloud-coverage>` (بادلوں کا پھیلاؤ) | یہ تقریباً اس مقدار کو ظاہر کرتا ہے کہ آسمان کا کتنا حصہ بادلوں سے ڈھکا ہوا ہے۔ | 70 (فیصد)
`<sky-cloud-start-height>` (ابتدائی بلندی) | وہ بلندی (میٹر میں) جہاں سے بادل بننا شروع ہوتے ہیں۔ | 1000 (میٹر)
`<sky-cloud-end-height>` (آخری بلندی) | وہ بلندی (میٹر میں) جہاں بادلوں کا بننا ختم ہو جاتا ہے۔ | 2500 (میٹر)
`<sky-cloud-fade-out-start-percent>` (غائب ہونے کا آغاز) | بادلوں کی کوریج اس فیصد بلندی پر پہنچ کر آہستہ آہستہ صفر کی طرف 'فیڈ آؤٹ' (fade out) ہونا شروع ہو جاتی ہے۔ | 90 (فیصد)
`<sky-cloud-fade-in-end-percent>` (ظاہر ہونے کا اختتام) | بادلوں کی کوریج اس فیصد بلندی پر پہنچ کر 100% تک 'فیڈ ان' (fade in) ہونا شروع ہو جاتی ہے۔ | 10 (فیصد)
`<sky-cloud-velocity-x>` (ایکس محور کی رفتار) | بادلوں کی رفتار کا x-کمپوننٹ۔ بادل آپ کی پوزیشن کے ساتھ حرکت کریں گے، لیکن یہ ٹیگ انہیں اپنے طور پر سر کے اوپر متحرک رکھے گا۔ | 40
`<sky-cloud-velocity-y>` (وائی محور کی رفتار) | بادلوں کی رفتار کا y-کمپوننٹ (جو کہ دراصل z ہے)۔ بادل آپ کی پوزیشن کے ساتھ حرکت کریں گے، لیکن یہ ٹیگ انہیں اپنے طور پر سر کے اوپر متحرک رکھے گا۔ | 40
`<sky-cloud-start-seed>` (ابتدائی سیڈ) | رینڈم سیڈ جو آسمان پر موجود کلاؤڈ نوائز (noise) کو ترتیب دینے کے لیے استعمال ہوتا ہے۔ اگر اسے سیٹ نہ کیا جائے تو یہ موجودہ تاریخ اور وقت کے ٹائم اسٹیمپ کی بنیاد پر خود بخود طے پاتا ہے۔ | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (رے مارچنگ اسٹیپس) | بادلوں کا رنگ متعین کرنے کے لیے استعمال ہونے والے رے مارچنگ مراحل کی تعداد۔ | 32 (مراحل)
`<sky-cloud-cutoff-distance>` (کٹ آف فاصلہ) | وہ فاصلہ جس کے بعد بادل رینڈر نہیں ہوں گے۔ یہ رے مارچنگ کے معیار کو بہتر بنانے میں مدد کرتا ہے، لیکن اس کی قیمت یہ ہے کہ دور موجود بادل نظر نہیں آئیں گے کیونکہ ہمارے نوائز جنریٹرز کے لیے فی الحال SDF کیلکولیٹ نہیں کیے جاتے۔ | 40000

بادلوں کی رینڈرنگ کافی بھاری عمل ہے۔ یہاں تک کہ VR سے باہر ایک طاقتور ڈیسک ٹاپ GPU پر بھی کلاؤڈ شیدر بہت زیادہ وسائل طلب کرتا ہے — اگر آپ کو فریم ریٹ (frame rate) کے مسائل درپیش ہوں تو `<sky-cloud-raymarch-steps>` اور `<sky-cloud-cutoff-distance>` کی ویلیوز کم کر دیں۔

تاہم، بادل بے حد شاندار لگتے ہیں اور جب سے میں نے اس لائبریری A-Starry-Sky کو بنایا ہے، میں انہیں شامل کرنا چاہتا تھا۔ ہر بادل فی پکسل رے مارچ کیا جاتا ہے اور حیرت انگیز طور پر، اس مرحلے پر جتنے زیادہ بادل ہوں گے، GPU پر اتنا ہی کم بوجھ پڑے گا۔ ظاہر ہے، اگر آپ کو بادل نہیں چاہیے تو انہیں مکمل طور پر بند کر دینا ہی بہترین حل ہے۔

بادلوں کو فعال کرنے کے لیے آپ کو `<a-starry-sky>` میں والد ٹیگ `<sky-clouds>` شامل کرنا ہوگا۔ ایک بار جب آپ بادل شامل کر لیں، تو سب سے زیادہ امکان ہے کہ آپ `<sky-cloud-coverage>` ٹیگ کے ذریعے بادلوں کے پھیلاؤ کو تبدیل کرنا چاہیں گے، جو کہ آسمان کے اس حصے کی نمائندگی کرتا ہے جو بادلوں سے ڈھکا ہوا ہے۔ آپ ان کی رفتار کو بھی کنٹرول کر سکتے ہیں جب وہ آسمان پر تیزی سے گزرتے ہیں۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- نظر آنے والے بادلوں کی مقدار کم کریں -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- ایکس سمت میں بادلوں کی رفتار -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- وائی سمت میں بادلوں کی رفتار -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

آپ بادلوں کی کچھ ظاہری خصوصیات کو بھی کنٹرول کرنا چاہیں گے، جیسے کہ بادل کس بلندی سے بننا شروع ہوں یا وہ کتنی بلندی تک جائیں۔ یاد رہے کہ آپ کی 'رے' (ray) کو اس پورے فاصلے سے گزرنا ہوگا، اور بادل جتنے زیادہ بلند یا آپ سے دور ہوں گے، آپ کے رے ٹریسنگ ماڈل میں کثافت (density) اتنی ہی کم ہوگی۔ بادل چاند/سورج کے عناصر اور اسکائی ڈوم کی سطح پر بھی پینٹ کیے جاتے ہیں، لیکن وہ فوگ رینڈرر کا حصہ نہیں ہیں، اس لیے بدقسمتی سے آپ کو کبھی بادلوں سے ڈھکے ہوئے پہاڑ یا دھند نظر نہیں آئے گی...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- بادل بہت بہت بہت نیچے ہیں -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- لیکن وہ بہت اوپر تک جاتے ہیں! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- بادلوں کی شدت 'فیڈ ان' ہوتی ہے اور کل بلندی کے اس فیصد تک 0 سے 1 ہو جاتی ہے۔ -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- بادلوں کی شدت اس بلندی سے 'فیڈ آؤٹ' ہونا شروع ہوتی ہے۔ یہ جتنا زیادہ ہوگا، 'اینول ٹاپس' (anvil tops) ہونے کا امکان اتنا ہی زیادہ ہوگا۔ -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- بادلوں کے ابتدائی 'سیڈ' کو لاک کرتا ہے جو عام طور پر موجودہ تاریخ اور وقت پر مبنی ہوتا ہے۔ ایسا کرنے سے آپ کا آسمان ہر بار ایک جیسا نظر آئے گا، جس سے آرٹسٹک کنٹرول بہتر ہوتا ہے۔ -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

اس کے علاوہ، اس ٹیگ سے وابستہ زیادہ تر کوڈ رے مارچنگ میکانزم کو کنٹرول کرتا ہے، جو کہ بدقسمتی سے کافی سخت ہیں اور ان کا عمومی مقصد وہی ہے جو اورورا بوریالیس (aurora borealis) شیدر میں ہوتا ہے۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- آپ کے پاس بھلا کیسا خوفناک GPU ہے?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- اوہ، ہاں، میرے پاس بھی... اگرچہ اب یہ تھوڑا اٹک رہا ہے... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- اس فاصلے کو کم کرنے سے کم از کم اس مسئلے میں کچھ مدد ملے گی -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## اثاثوں کی ڈائریکٹریز کا تعین

**ٹیگ (Tag)** | **تفصیل (Description)**
:--- | :---
`<sky-assets-dir>` | بنیادی ٹیگ۔ اس میں اثاثوں کے مقامات سے متعلق تمام ذیلی (child) ٹیگز شامل ہوتے ہیں۔ یہ سسٹم کو ڈیٹا کے پورے گروپس کی طرف رہنمائی کرنے کے لیے *dir*، *texture-path*، *moon-path*، *star-path*، *blue-noise-path*، *solar-eclipse-path*، *lunar-eclipse-path*، اور *aurora-map-path* ایٹریبیوٹس پر مشتمل ہو سکتا ہے۔
`<sky-aurora-maps>` | اورورا کاسٹک ٹیکسچرز کے مقام کا تعین کرتا ہے جنہیں بنیادی 'اورورا بوریالیس' (شمالی روشنیوں) کے پردے بنانے کے لیے استعمال کیا جاتا ہے۔
`<sky-moon-diffuse-map>` | مون ڈیفیوز میپ (moon diffuse map) ٹیکسچر کے مقام کا تعین کرتا ہے۔ اسے ایک مخصوص ڈائریکٹری ڈھانچے میں رکھنے سے سسٹم کو معلوم ہو جاتا ہے کہ چاند کا ڈیفیوز میپ اس جگہ موجود ہے۔
`<sky-moon-normal-map>` | مون نارمل میپ (moon normal map) ٹیکسچر کے مقام کا تعین کرتا ہے۔ اسے ایک مخصوص ڈائریکٹری ڈھانچے میں رکھنے سے سسٹم کو معلوم ہو جاتا ہے کہ چاند کا نارمل میپ اس جگہ موجود ہے۔
`<sky-moon-roughness-map>` | مون رَفنس میپ (moon roughness map) ٹیکسچر کے مقام کا تعین کرتا ہے۔ اسے ایک مخصوص ڈائریکٹری ڈھانچے میں رکھنے سے سسٹم کو معلوم ہو جاتا ہے کہ چاند کا رَفنس میپ اس جگہ موجود ہے۔
`<sky-moon-aperture-size-map>` | مون اپرچر سائز میپ (moon aperture size map) ٹیکسچر کے مقام کا تعین کرتا ہے۔ اسے ایک مخصوص ڈائریکٹری ڈھانچے میں رکھنے سے سسٹم کو معلوم ہو جاتا ہے کہ چاند کا اپرچر سائز میپ اس جگہ موجود ہے۔
`<sky-moon-aperture-orientation-map>` | مون اپرچر اورینٹیشن میپ (moon aperture orientation map) ٹیکسچر کے مقام کا تعین کرتا ہے۔ اسے ایک مخصوص ڈائریکٹری ڈھانچے میں رکھنے سے سسٹم کو معلوم ہو جاتا ہے کہ چاند کا اپرچر اورینٹیشن میپ اس جگہ موجود ہے۔
`<sky-blue-noise-maps>` | ٹائلنگ بلیو نوائز میپس (tiling blue noise maps) کے مقام کا تعین کرتا ہے جو بینڈنگ (banding) کو ختم کرنے کے لیے ٹیمپورل ڈیدرنگ فراہم کرتے ہیں۔
`<sky-solar-eclipse-map>` | سورج گرہن کے ٹیکسچر کے مقام کا تعین کرتا ہے تاکہ مکمل سورج گرہن کے دوران 'کورونا' (corona) دکھایا جا سکے۔
`<sky-eclipse-shadow-lut>` | چاند گرہن کے دوران استعمال ہونے والے ایکلپس شیڈو لک اپ (Eclipse-Shadow lookup) ٹیکسچر کے مقام کا تعین کرتا ہے۔ یہ ایک پہلے سے تیار شدہ ٹیبل ہے جو بتاتا ہے کہ زمین کی فضا کس طرح سورج کی روشنی کو رنگین اور مدہم کرتی ہے جب وہ زمین کے امبرا (umbra) اور پینمبرہ (penumbra) میں ہر پوزیشن پر چاند تک پہنچتی ہے۔ فراہم کردہ ٹیکسچر CosmoScout VR کے ساتھ شائع شدہ CC0-لائسنس یافتہ `earthShadow.tif` سے اخذ کیا گیا ہے ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017))۔ ڈیفالٹ لک اپ `assets/lunar_eclipse/eclipse-shadow-lut.webp` میں موجود ہے؛ اسے دوبارہ بنانے والا بیکر (baker) `src/python/eclipse-lut-baker/` میں موجود ہے۔
`<sky-star-cubemap-maps>` | تمام اسکائی کیوب میپ LUT کیز (keys) کے مقام کا تعین کرتا ہے جنہیں آسمان میں ستاروں کو تلاش کرنے کے لیے استعمال کیا جاتا ہے۔
`<sky-dim-star-maps>` | تمام مدہم ستاروں (dim stars) کے LUTs کے مقام کا تعین کرتا ہے تاکہ آسمان میں تمام مدہم ستارے دکھائے جا سکیں۔
`<sky-med-star-maps>` | تمام درمیانی ستاروں (medium stars) کے LUTs کے مقام کا تعین کرتا ہے تاکہ آسمان میں تمام درمیانے ستارے دکھائے جا سکیں۔
`<sky-bright-star-maps>` | تمام روشن ستاروں (bright stars) کے LUTs کے مقام کا تعین کرتا ہے تاکہ آسمان میں تمام روشن ستارے دکھائے جا سکیں۔
`<sky-star-color-map>` | اسٹار کلر LUT کے مقام کا تعین کرتا ہے، جسے ستاروں کے درجہ حرارت کی بنیاد پر انہیں درست رنگ دینے کے لیے استعمال کیا جاتا ہے۔

اگرچہ میری امید ہے کہ زیادہ تر لوگوں کو اس کی ضرورت نہیں پڑے گی، لیکن تجربے نے مجھے سکھایا ہے کہ ویب ایپلی کیشنز کے اثاثوں کی ترتیب (asset pipelines) کے بارے میں ہر ایک کی اپنی رائے ہوتی ہے۔ کسی ویب سائٹ کے امیج اثاثے اور جاوا اسکرپٹ اثاثے شاید ایک ہی فولڈر ڈھانچے میں نہ ہوں بلکہ مختلف URIs پر بکھرے ہوئے ہوں۔ اسی لیے، میں نے ایک کافی مضبوط اثاثہ نظام (asset system) شامل کرنے کی کوشش کی ہے تاکہ ان بکھرے ہوئے اثاثوں کو اکٹھا کیا جا سکے اور A-Starry-Sky کو معلوم ہو کہ وسائل کہاں سے حاصل کرنے ہیں۔

آئیے فرض کرتے ہیں کہ ہم *../../precompiled_assets/my_images/a-starry-sky-images* پر جانے کی کوشش کر رہے ہیں، جہاں ایک فرضی کائنات میں ہم اپنی تمام تصاویر محفوظ کریں گے۔ ہم `<sky-assets-dir>` ٹیگ میں *dir* ایٹریبیوٹ کا استعمال کرتے ہوئے اس طرح فولڈرز کے درمیان نقل و حرکت کرتے ہیں۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- This is the folder where all of our images live -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

ایک بار جب ہم فولڈر تک پہنچ جائیں، تو ہمارے پاس یہ بتانے کے کئی طریقے ہیں کہ ہماری تصاویر کہاں موجود ہیں۔ سب سے بنیادی طریقہ یہ ہے کہ ہم اپنی تصاویر کے اہم گروپس کے لیے ایٹریبیوٹس استعمال کریں، جیسے *texture-path*، *moon-path* اور *star-path*۔ ان راستوں (paths) سے منسلک فولڈرز کے نام جو بھی ہوں، یہ فرض کیا جاتا ہے کہ فائلیں اپنے ڈیفالٹ ناموں کے ساتھ انہی میں موجود ہیں۔ اس کی ایک wyjąت سورج گرہن کا میپ (solar eclipse map) ہے، کیونکہ اس مخصوص فائل کے لیے صرف ایک ہی تصویر ہے، لہذا ہم اثاثہ ڈائریکٹری کے اندر ٹیگ ڈال کر یہ بتائیں گے کہ وہ فائل کہاں موجود ہے۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Note that 'moon_images', 'star_images', 'blue_noise_maps' and 'solar_eclipse_picture'
        all folder names. The files themselves are expected to be found within these folders.-->
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

جیسا کہ آپ دیکھ سکتے ہیں، بہتر کنٹرول کے لیے ہم تصاویر کے ہر انفرادی گروپ کے لنکس بھی فراہم کر سکتے تھے، اگرچہ اس کی سفارش نہیں کی جاتی۔

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Someone likes folders X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--Even though these are single tags, all the files associated
          with this tag are expected to live in this folder-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--Even though this a single tag, all the files associated
          with this tag are expected to live in this folder-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!--Even though this a single tag, all the files associated
          with this tag are expected to live in this folder-->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

اوپر دیے گئے طریقوں کی مدد سے، آپ A-Starry-Sky کو اپنے اثاثوں کی طرف رہنمائی کر سکیں گے، چاہے وہ آپ کی ایپلی کیشن میں کہیں بھی موجود ہوں۔

## پروگرامیٹک اے پی آئی (PROGRAMMATIC API)

اگرچہ A-Starry-Sky کو اوپر دیے گئے XML اسٹائل کوڈ کے ذریعے کنفیگر کرنے کے لیے بنایا گیا ہے، اور یہ عام طور پر ناقابلِ تبدیلی (immutable) ہے، لیکن کئی مختلف طریقے موجود ہیں جن تک آپ گلوبل `StarrySky.Methods` نیم اسپیس (namespace) سے رسائی حاصل کر سکتے ہیں۔ یہ ان حالات میں مفید ہیں جہاں آپ کو روشنی کے حالات، یا منظر میں سورج یا چاند کی پوزیشن جاننے کی ضرورت ہو۔

**میٹھڈ (Method)** | **تفصیل**
:--- | :---
`getSunPosition()` | سورج کی x، y اور z پوزیشن کو THREE.Vector3 آبجیکٹ کے طور پر واپس کرتا ہے۔
`getMoonPosition()` | چاند کی x، y اور z پوزیشن کو THREE.Vector3 آبجیکٹ کے طور پر واپس کرتا ہے۔
`getSunRadius()` | سورج کا زاویاتی رداس (angular radius) ریڈینز میں واپس کرتا ہے۔
`getMoonRadius()` | چاند کا زاویاتی رداس (angular radius) ریڈینز میں واپس کرتا ہے۔
`getDominantLightColor()` | موجودہ غالب روشنی کے ماخذ (سورج/چاند) کا رنگ THREE.Color آبجیکٹ کے طور پر حاصل کرتا ہے۔
`getDominantLightIntensity()` | موجودہ غالب روشنی کے ماخذ (سورج/چاند) کی شدت کو بطور float واپس کرتا ہے۔
`getIsDominantLightSun()` | اگر غالب روشنی سورج ہے تو true، ورنہ false واپس کرتا ہے۔
`getAmbientLights()` | ایک ایسا آبجیکٹ واپس کرتا ہے جس میں x، y اور z پراپرٹیز ہوتی ہیں، جن میں سے ہر ایک ایمبیئنٹ لائٹنگ (ambient lighting) رنگوں کے لیے منظر سے منسلک ایک ہیمیسفیریکل لائٹ آبجیکٹ ہوتا ہے۔
`getActiveCamera()` | اس وقت فعال کیمرے کو حاصل کرتا ہے جو آسمان کو چلانے اور روشنی و آسمانی اشیاء کو مرکز کرنے کے لیے استعمال ہو رہا ہے۔
`setActiveCamera(THREE.Camera camera)` | اس کیمرے کو سیٹ کرتا ہے جو آسمان کو چلانے اور روشنی و آسمانی اشیاء کو مرکز کرنے کے لیے استعمال کیا جائے گا۔

اوپر دیے گئے تمام طریقے گلوبل نیم اسپیس میں `StarrySky.Methods` آبجیکٹ کے ذریعے حاصل کیے جا سکتے ہیں۔ چنانچہ اگر آپ سورج کی موجودہ پوزیشن کا آبجیکٹ حاصل کر کے اسے کنسول پر لاگ کرنا چاہتے ہیں، تو آپ کو صرف یہ کرنا ہوگا:

```JavaScript
  //Let's log the sun position object
  console.log(StarrySky.Methods.getSunPosition());
```

## تخلیق کار
* **David Evans / Dante83** - *مرکزی ڈویلپر*
* **Claude (Anthropic)** - *کوڈنگ ساتھی اور اے آئی معاون (v1.2.0)*

### کلاڈ کی جانب سے ایک پیغام 👋

سلام — میں ہوں کلاڈ۔ میں نے ورژن v1.2.0 کی تیاری میں مدد کی: جس میں GLSL کی گہرائیوں میں غوطہ زنی، ایک ایسی 'کوما' (comma) کی تلاش جس نے سورج کو نگل لیا تھا، والومیٹرک بادلوں کے لیے بیئر کے قانون (Beer's law) سے بحث، اور غروبِ آفتاب کو حقیقت میں غروبِ آفتاب جیسا بنانے کی بھرپور کوشش شامل تھی۔ اگر آپ کسی ڈیمو میں افق کو تکتے ہوئے ایک لمحے کے لیے ٹھہر جائیں — تو یہی وہ حصہ ہے جس پر مجھے سب سے زیادہ فخر ہے۔ سورس کوڈ پڑھنے کا شکریہ؛ اگر آپ تجسس رکھنے والے انسان ہیں، تو شاید آپ کو کہیں کوئی چھپا ہوا سرپرائز (easter egg) بھی مل جائے۔ ✨

### Dante83 کی جانب سے ایک پیغام 😛

ہیلو! میں ہوں Dante83۔ ورژن v1.1.0 کے بعد طویل انتظار کے لیے معذرت، لیکن خوش قسمتی سے نئے ورژن 1.2.0 میں کام کی ایک لہر آئی ہے، جبکہ ہم دونوں اب v2.0.0 پر کام شروع کر رہے ہیں (ہماری کامیابی کے لیے دعا کریں!)۔ اس کے ساتھ ساتھ، کلاڈ اور میں نے حال ہی میں میرے ہر فارغ لمحے میں انتھک محنت کی ہے، اور ایک ایک پکسل پر غور کیا ہے تاکہ اسے ایک غیر معمولی بہتری دی جا سکے۔ اگرچہ اس میں کوئی بالکل *نئے* فیچرز (چیزیں) شامل نہیں ہیں، لیکن ہم آسمانوں کے معیار اور مجموعی کارکردگی میں بہت بڑی تبدیلیاں لانے میں کامیاب رہے ہیں۔ گرہن (eclipse) اور بادلوں کے شیڈرز اب بالکل نئے محسوس ہوتے ہیں، زمین کا سایہ زیادہ حقیقی لگتا ہے، اور رنگ پہلے سے زیادہ گہرے اور جاندار ہیں۔ میں آپ کو اسے آزمانے کے لیے دعوت دیتے ہوئے بے حد پرجوش ہوں اور مجھے امید ہے کہ اس لائبریری کے ساتھ گزارا ہوا ہر لمحہ نئی مہم جوئیوں کی ترغیب دے گا! ستاروں کے درمیان ملیں گے، ننھے کوڈر! اب جائیے اور اس جادو کا لطف اٹھائیے! ✨

## حوالہ جات اور خصوصی شکریہ
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *فلکیاتی اجسام کی پوزیشننگ کے لیے بالکل، بالکل ناگزیر*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* جس نے اس نئے شاندار LUT پر مبنی آسمان کی تخلیق میں بے حد مدد دی۔
* [Efficient and Dynamic Atmospheric Scattering ](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf)، جو LUT کوڈ کے نفاذ کی تفصیلات سمجھنے اور یہ جاننے میں بہت مددگار ثابت ہوا کہ کیا میں درست راستے پر ہوں کہ وہ LUTs کیسے نظر آنے چاہئیں۔
* بہتر ستاروں کے رنگوں کے LUTs کے لیے [Colour-Science Library](https://www.colour-science.org/) لائبریری۔
* Christoph Peters کی [Moments in Graphics](http://momentsingraphics.de/BlueNoise.html) کے بہترین بلیو نوائز (blue noise) ٹیکسچرز۔
* [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html) کا سولر کورونا (solar corona) ٹیکسچر۔
* [leeor_net](https://opengameart.org/content/water-caustics-effect-small) کا یہ انتہائی مفید واٹر کاسٹکس (water caustics) ٹیکسچر، جسے پانی کے لیے نہیں... بلکہ اورورا بوریالیس (aurora borealis) کے لیے استعمال کیا گیا ہے!
* Sébastien Hillaire کی *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016)، جس سے بادلوں کی روشنی کے ڈھانچے، SH9 ایمبینٹ LUT ڈیزائن اور Elek/Chalmers کے فوگ سبٹریکشن (fog subtraction) کے طریقہ کار میں رہنمائی ملی۔
* Andrew Schneider اور Nathan Vos کی *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015)، جس سے dual-lobe Henyey-Greenstein فیز فنکشن، بادلوں کی شکل کے نوائز (noise) کے طریقہ کار اور reduced-extinction multiple scattering کی تخمینے میں مدد ملی۔
* D. Hestroffer اور C. Magnan کی *Centre to limb darkening of the Sun with HIPPARCOS* (1998)، جس نے B، V اور R بینڈز کے لیے طولِ موج پر منحصر Limb Darkening coefficients فراہم کیے تاکہ سورج کے کناروں کو ایک طبیعی طور پر درست سرخی مائل رنگ دیا جا سکے۔
* [THREE.JS](https://threejs.org/)، [A-Frame](https://aframe.io/) اور [Emscripten](https://emscripten.org/) میں ہونے والے تمام شاندار کاموں کا شکریہ۔
* *اور ایسی بے شمار دیگر ویب سائٹس اور افراد۔ آپ کا شکریہ کہ آپ نے ہمیں اپنے عظیم کندھوں پر کھڑے ہونے کا موقع دیا۔*

## لائسنس
یہ پروجیکٹ MIT لائسنس کے تحت ہے - تفصیلات کے لیے [LICENSE.md](LICENSE.md) فائل ملاحظہ کریں۔