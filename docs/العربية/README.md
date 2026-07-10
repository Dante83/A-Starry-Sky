# A-Starry-Sky

A-Starry-Sky عبارة عن قبة سماء لإطار عمل [A-Frame Web Framework](https://aframe.io/). يهدف المشروع إلى توفير مكون بسيط وسهل الدمج يمكنك استخدامه لإنشاء دورات ليل ونهار مذهلة في أعمالك الإبداعية.

> **تحذير: يتطلب وحدة معالجة رسومات (GPU) قوية — لا تفتح الرابط عبر الهاتف المحمول.**

**[تجربة مباشرة](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — السماء بالتاريخ والوقت الحاليين في مدينة سان فرانسيسكو.

| مثال | الوصف |
|:---|:---|
| [الصحراء (Desert)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | مشهد صحراوي في لحظة نهارية محددة |
| [كسوف شمسي (Solar Eclipse)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | كسوف كلي للشمس مع ظهور الإكليل الشمسي |
| [خسوف قمري (Lunar Eclipse)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | ظل الأرض على القمر |
| [نجمة الميلاد - ١٢٢٦ م (Christmas Star)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | الاقتران العظيم بين كوكبي المشتري وزحل |
| [المريخ (Mars)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | غلاف جوي مريخي مخصص |
| [غلاف جوي مخصص (Custom Atmosphere)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | قيم تشتت "مي" و"رايلي" (Mie/Rayleigh) مختلفة |
| [ارتفاع شاهق (High Altitude)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | السماء من ارتفاع ٢٠ كم |
| [الشفق القطبي الشمالي (Aurora Borealis)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ يتطلب قدرات عالية من وحدة معالجة الرسومات (GPU) |
| [سحب خفيفة (Light Clouds)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ يتطلب قدرات عالية من وحدة معالجة الرسومات (GPU) |
| [سحب متوسطة (Medium Clouds)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ يتطلب قدرات عالية من وحدة معالجة الرسومات (GPU) |
| [سحب كثيفة (Heavy Clouds)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ يتطلب قدرات عالية من وحدة معالجة الرسومات (GPU) |

## المتطلبات الأساسية

تم بناء هذا المشروع باستخدام [إطار عمل A-Frame](https://aframe.io/) الإصدار 1.7.0 أو أحدث. كما يتطلب متصفح ويب متوافقاً مع تقنية Web XR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## التثبيت

انسخ ملف *a-starry-sky.v1.2.0.min.js* ومجلدي *assets* و *wasm* إلى مشروعك. أضف النصوص البرمجية (scripts) التالية إلى ملف HTML الخاص بك — لاحظ أن `starry-sky-web-worker.js` **غير** مدرج هنا؛ بل يتم الإشارة إليه مباشرةً في وسم `<a-starry-sky>` بدلاً من ذلك.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

بمجرد إعداد هذه المراجع، أضف مكون `<a-starry-sky>` داخل وسم `<a-scene>` الخاص بـ A-Frame مع الإشارة إلى رابط (URL) الـ web worker الخاص بحالة السماء كما يلي:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

سيوفر لك هذا الكود الأساسي سماءً تتحرك في الوقت الفعلي بناءً على خطوط الطول والعرض لمدينة سان فرانسيسكو، كاليفورنيا. ومع ذلك، يمكننا القيام بما هو أكثر من ذلك بكثير؛ حيث يأتي A-Starry-Sky مع مجموعة من وسوم HTML المخصصة لمساعدتك في تخصيص حالة السماء لديك.

**ملاحظة: صندوق السماء هذا غير قابل للتغيير (immutable). وهذا يعني أن الإعدادات التي تبدأ بها ستظل ثابتة في أي صفحة معينة. لسوء الحظ، من الصعب جداً جعل الكود قابلاً للتغيير في الوقت الحالي.**

## تحديد الموقع

**الوسم (Tag)** | **الوصف** | **القيمة الافتراضية**
:--- | :--- | :---
`<sky-location>` (موقع السماء) | الوسم الأب. يحتوي على وسوم فرعية لخط العرض (`<sky-latitude>`) وخط الطول (`<sky-longitude>`). | N/A
`<sky-latitude>` (خط عرض السماء) | تحديد خط عرض الموقع. تكون القيم شمال خط الاستواء **موجبة**. | 38
`<sky-longitude>` (خط طول السماء) | تحديد خط طول الموقع. تكون القيم غرب [خط غرينتش](https://en.wikipedia.org/wiki/Prime_meridian) **سالبة**. | -122

يمكنك ضبط السماء على أي خط عرض أو طول على كوكب الأرض. تكمن فائدة تحديد المواقع في منح اللاعبين شعوراً بتغير الفصول، وذلك عبر تغيير مسارات الشمس أو القمر. كما يحدد خط العرض النجوم التي ستكون مرئية في سماء الليل. ويعد كل من خطي الطول والعرض ضروريين للأحداث المرتبطة بالوقت، مثل خسوف القمر وكسوف الشمس؛ وينطبق هذا بشكل خاص على كسوف الشمس إذا كنت ترغب في محاكاة تجربة الكسوف الكلي. ومع ذلك، فإن ضبط الموقع أسهل بكثير من اتخاذ القرار بشأن المكان الذي تود التواجد فيه! ما عليك سوى جلب إحداثيات الموقع الذي تريده من [Google Earth](https://earth.google.com/web/) أو أي مصدر خرائط آخر، ثم أدخل القيم في الوسوم المخصصة لها كما يلي:

لنذهب إلى نيويورك!
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

حسناً، ولكن ماذا عن مدينة بيرث في أستراليا؟
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

لاحظ أن خطوط الطول غرب [خط غرينتش](https://en.wikipedia.org/wiki/Prime_meridian) تكون سالبة (مثل نيويورك وبوينس آيرس).

## ضبط الوقت

**الوسم (Tag)** | **الوصف** | **القيمة الافتراضية**
:--- | :--- | :---
`<sky-time>` | الوسم الأب. يحتوي على جميع الأوسمة الفرعية المتعلقة بعناصر التاريخ أو الوقت. | N/A
`<sky-date>` | سلسلة التاريخ والوقت المحلية بتنسيق **السنة-الشهر-اليوم الساعة:الدقيقة:الثانية** / *2021-03-21 13:45:51*. تعتمد قيم الساعات أيضاً على نظام الـ 24 ساعة (من 0 إلى 23)، حيث تمثل القيمة 0 منتصف الليل (12 صباحاً) والقيمة 23 الساعة 11 مساءً. | التاريخ الحالي
`<sky-speed>` | مضاعف الوقت المستخدم لتسريع الحسابات الفلكية أو إبطائها. | 1.0
`<sky-utc-offset>` | فارق التوقيت العالمي المنسق (UTC Offset) لهذا الموقع. القيم السالبة تشير إلى المناطق الواقعة غرب [خط غرينتش](https://en.wikipedia.org/wiki/Prime_meridian)، على عكس قيم خطوط الطول. **ملاحظة: توقيت UTC لا يتبع التوقيت الصيفي (DST)** | 7

اضبط `<sky-date>` على **الوقت المحلي** للموقع الذي اخترته، ثم اضبط `<sky-utc-offset>` ليتناسب مع ذلك النطاق الزمني. على سبيل المثال، مدينة نيويورك هي UTC-4 (صيفاً) أو UTC-5 (شتاءً) — علماً بأن التوقيت الصيفي لا يتم تطبيقه تلقائياً.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- إعدادات الموقع السابقة -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- يمكنك ضبط فارق التوقيت العالمي (UTC offset) بهذا الشكل! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

لاحظ أنك ستقوم مرة أخرى بإضافة الوسم الأب `<sky-time>` الذي يحتوي على جميع الأوسمة الفرعية ذات الصلة بإعدادات الوقت لدينا.

ومع ذلك، لست مضطراً للالتزام بتوقيت الجهاز المحلي فحسب. لمَ لا نجرب شيئاً أكثر إثارة، كالسفر عبر الزمن مثلاً! لقد سمعت أن هناك [كسوفاً شمسياً](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) مذهلاً سيحدث في [8 أبريل 2024 الساعة 1:27 مساءً (13:27 بتوقيت الـ 24 ساعة) في ديل ريو، تكساس](https://nationaleclipse.com/cities_total.html). لنذهب ونلقي نظرة!

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

هل فاتتك رؤية [نجمة الميلاد](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)؟ لا، لا، ليس تلك التي تقصدها. بل تلك التي ظهرت في عام 1226 ميلادية. حسناً، من الجيد أننا نملك آلة زمن، وأن A-Starry-Sky بات يدعم الكواكب الآن :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

السفر عبر الزمن ممتع، ولكن قد يهمك أيضاً تغيير *سرعة* الوقت. فغالباً ما تمر دورات الليل والنهار في عوالم الألعاب بشكل أسرع منها في الواقع، أو ربما ترغب في إيقاف الوقت تماماً لتجميد لحظة معينة لأغراض الإضاءة. للقيام بذلك، أضف الوسم `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- سيكون هناك الآن ثمانية أيام داخل العالم مقابل كل يوم في الحياة الواقعية. -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

بالطبع، إذا كنت تقوم بذلك في عالم مستمر (persistent world)، فتأكد من مراعاة تدفق الوقت المتسارع عند إنشاء ملف الـ HTML الخاص بك. ومع ذلك، فإن إعداد HTML ديناميكي للسماء يعود إليك وكيفية تنفيذك له.

## تعديل إعدادات الغلاف الجوي

**الوسم (Tag)** | **الوصف** | **القيمة الافتراضية**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | الوسم الأب. يحتوي على جميع الأوسمة الفرعية المتعلقة بإعدادات الغلاف الجوي. | N/A
`<sky-camera-height>` | ارتفاع الكاميرا فوق سطح الأرض. | 0.0km
`<sky-mie-directional-g>` | يصف مقدار الضوء المشتت للأمام بواسطة تشتت "مي" (Mie scattering)، وهو الهالة البيضاء التي تُرى حول الشمس والناتجة عن الجزيئات الكبيرة في الغلاف الجوي. كلما زادت قيمة `mie-directional G` ظهر الغلاف الجوي أكثر غباراً. | 0.8
`<sky-sun-intensity>` | شدة إضاءة الشمس في مظلل (shader) الغلاف الجوي. | 1367.0
`<sky-moon-intensity>` | شدة إضاءة القمر في مظلل الغلاف الجوي. | 29.0
`<sky-mie-beta>` | الاعتماد اللوني لتشتت الضوء في تشتت "مي"، وهو المسؤول الأساسي عن "التوهج" القريب من الشمس. التشتت منتظم إلى حد كبير عبر جميع الترددات. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | الاعتماد اللوني لتشتت الضوء في تشتت "رايلي" (Rayleigh scattering)، وهو المسؤول الأساسي عن التشتت الأزرق في السماء. لاحظ أن القناة الزرقاء لديها أعلى معدل تشتت افتراضياً. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | الاعتماد اللوني لتشتت الضوء لطبقة الأوزون، وهو أمر بالغ الأهمية للحصول على درجات اللون الأزرق الداكن عند الغروب. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | ارتفاع القطع الذي "ينتهي" عنده الغلاف الجوي. | 80.0 km
`<sky-radius-of-earth>` | نصف قطر الكوكب أو الأرض. | 6366.7 km
`<sky-rayleigh-scale-height>` | ارتفاع مقياس التلاشي لتشتت "رايلي"، بافتراض تلاشٍ أسي. ينشأ تشتت رايلي من الغازات الجوية، وبالتالي يكون له ارتفاع مقياس أكبر بكثير. | 8.4
`<sky-mie-scale-height>` | ارتفاع مقياس التلاشي لتشتت "مي"، بافتراض تلاشٍ أسي. ينشأ تشتت مي من جزيئات أكبر، لذا يميل للتلاشي بشكل أسرع، مما يؤدي إلى مقياس ارتفاع مميز أصغر. | 1.25
`<sky-ozone-percent-of-rayleigh>` | نسبة الأوزون الموجودة حالياً في السماء، وتُستخدم لتحديد انعكاس الأوزون عند الغروب. | 6E-7
`<sky-moon-angular-diameter>` | القطر الزاوي للقمر كما يظهر في السماء.  | 3.15 degrees
`<sky-sun-angular-diameter>` | القطر الزاوي للشمس كما تظهر في السماء. | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | عدد الخطوات التي يتخذها متتبع الأشعة (ray tracer) نحو حافة السماء عند جمع الضوء لجداول البحث (LUTs) الخاصة بالغلاف الجوي. | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | عدد الخطوات الزاوية المتخذة عند كل نقطة على طول الشعاع للتشتت من الرتبة k. | 30 steps
`<sky-number-of-scattering-orders>` | عدد تمريرات التشتت من الرتب العليا (kth) التي يتم دمجها في جدول بحث التشتت الداخلي. تزيد القيم الأعلى من الجودة على حساب وقت معالجة (bake) جدول البحث. | 4
`<sky-parameters-color-red>` | المكون الأحمر المستخدم في أوسمة `<sky-rayleigh-beta>` و `<sky-mie-beta>` و `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | المكون الأخضر المستخدم في أوسمة `<sky-rayleigh-beta>` و `<sky-mie-beta>` و `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | المكون الأزرق المستخدم في أوسمة `<sky-rayleigh-beta>` و `<sky-mie-beta>` و `<sky-ozone-beta>`. | N/A

تمتلك معلمات الغلاف الجوي واحدة من أكثر واجهات برمجة التطبيقات (API) شمولاً في كامل قاعدة الكود. وبينما يمكن للمطورين المهرة استخدام هذه القيم لإنشاء سماوات مخصصة، فإن معظم المستخدمين سيفضلون الالتزام بالقيم الافتراضية. ومع ذلك، هناك بعض القيم المفيدة بشكل خاص وسهلة الفهم.

أحد أكثر العناصر التي قد ترغب في تغييرها هو حجم الشمس والقمر. في الواقع، يبلغ القطر الزاوي للشمس 0.53 درجة وللقمر 0.50 درجة. استخدام هذه القيم في المحاكي سيمثل الواقع بشكل أفضل، لكنها تميل إلى أن تكون صغيرة جداً في معظم عمليات المحاكاة، خاصة على الأجهزة غير المخصصة للواقع الافتراضي (non-VR) مثل الشاشات. لتغيير هذه القيم إلى قيم أكبر أو أصغر، ما عليك سوى تعديل القيم في الأوسمة المقابلة.

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

قد ترغب أيضاً في تغيير ارتفاع البداية فوق الكوكب. يمكن ضبط ذلك بسهولة باستخدام وسم `<sky-camera-height>`، علماً بأن السماء ستتكيف ديناميكياً مع ارتفاعك أثناء تحريك الكاميرا للأعلى أو للأسفل. يحدد هذا الارتفاع الأولي للمشهد بالكيلومترات، حيث يكون أقصى ارتفاع *80 كم* وأدنى ارتفاع *0 كم*.

[مثال على الارتفاع الشاهق](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!--لنصعد للأعلى قليلاً، فالهواء هنا أكثر رقة. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

قد ترغب أيضاً في تغيير تكوين الغلاف الجوي. يمنحك هذا العنصر إمكانية الوصول إلى مجموعة متنوعة من الآليات للتحكم في مظهر السماء كما تريد. على سبيل المثال، إذا كنت تفضل قيم "رايلي" الواردة في [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) بدلاً من قيمنا الأصلية (5.8e-3, 1.35e-2, 3.31e-2) -> (5.19E-3, 1.21E-2, 2.96E-2)، وأردت استخدام قيمة بيتا (beta) من 4.44E-3 -> 2E-3، يمكنك استبدال هذه القيم بسهولة في الكود.

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

قد لا يبدو هذا مثيراً للغاية، لذا لنفترض أننا نريد شيئاً أكثر جنوناً. دعونا نتبع دراسة [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) ونذهب إلى المريخ! هنا يتم تبديل استخدام تشتت "رايلي" و"مي"، لذا يجب علينا على الأرجح تبديل ارتفاعاتهم المميزة أيضاً. معظم التشتت على المريخ يأتي من تشتت "مي" للجزيئات الكبيرة، مع غلاف جوي رقيق جداً. بناءً على ذلك، يمكننا تقريباً تعطيل "مي" (رايلي) وتبديل ارتفاعاتهم المميزة. يجب علينا أيضاً تغيير نصف قطر الكوكب، وقد نرغب في استبدال ارتفاع الغلاف الجوي بقيم أفضل في متتبع الأشعة.

[مثال المريخ](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- لاحظ أن المريخ يشتت الضوء الأحمر بشكل أكبر -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- بعض التعديلات على تشتت "مي" تساعد أيضاً -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- تأكد من تعطيل الأوزون -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- حسناً، في حالتنا هذه، نحن على المريخ... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- الشمس أصغر ويمكننا إلغاء القمر تماماً -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

يمكنك أيضاً ضبط عدد خطوات أشعة جدول البحث (LUT)، على الرغم من أن القيم الافتراضية شبه مثالية ونادراً ما تكون التغييرات ملحوظة.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- قيم أقل للأداء، وقيم أعلى للدقة (القيمة الافتراضية 30 هي المثالية لمعظم الحالات) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## تعديل الإعدادات الافتراضية للإضاءة

**الوسم (Tag)** | **الوصف** | **القيمة الافتراضية**
:--- | :--- | :---
`<sky-lighting>` (إضاءة السماء) | وسم أب. يحتوي على جميع الأوسمة الفرعية المتعلقة بإضاءة المشهد. | N/A
`<sky-sun-intensity>` (شدة الشمس) | مضاعف شدة ضوء الشمس، ويمكن استخدامه لزيادة أو تقليل شدة الإضاءة الشمسية الاتجاهية. | 1.0
`<sky-moon-intensity>` (شدة القمر) | مضاعف شدة ضوء القمر، ويمكن استخدامه لزيادة أو تقليل شدة الإضاءة القمرية الاتجاهية. | 1.0
`<sky-ambient-intensity>` (شدة الإضاءة المحيطة) | مضاعف شدة الإضاءة المحيطة (Ambient Lighting)، ويمكن استخدامه لزيادة أو تقليل شدة نظام الإضاءة المحيطة. | 2.0
`<sky-minimum-ambient-lighting>` (الحد الأدنى للإضاءة المحيطة) | الحد الأدنى لكمية الضوء المحيط في النظام. | 0.01
`<sky-maximum-ambient-lighting>` (الحد الأقصى للإضاءة المحيطة) | الحد الأقصى لكمية الضوء المحيط في النظام. | INF
`<sky-atmospheric-perspective-type>` (نوع المنظور الجوي) | يمكن ضبطه على *normal* (عادي)، أو *advanced* (متقدم)، أو *none* (بلا). مطلوب لضباب المشهد. يستخدم الخيار *normal* نموذج الضباب الأسي الأصلي؛ بينما يستخدم *advanced* نموذجاً يعتمد على Preetham لتحسين تباين ألوان الأفق على حساب زيادة الضغط على وحدة معالجة الرسوميات (GPU). | normal
`<sky-atmospheric-perspective-density>` (كثافة المنظور الجوي) | للضباب من نوع *normal* فقط. يتحكم في معامل الكثافة لضباب المشهد الأسي. يتم تعيين اللون تلقائياً من إضاءة المشهد. يتم تجاهله إذا كان نوع ضباب المشهد *advanced*. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` (مضاعف مسافة المنظور الجوي) | للضباب من نوع *advanced* فقط. يضاعف المسافة إلى الضباب في نموذج الضباب المتقدم. | 2.0
`<sky-ground-color>` (لون الأرض) | وسم أب. يحتوي على أوسمة `<sky-ground-color-{قناة-اللون}>` لوصف اللون الأساسي للأرض من أجل الإضاءة الانعكاسية من السطح. | N/A
`<sky-ground-color-red>` (لون الأرض - أحمر) | يُستخدم لوصف تغييرات قناة اللون **الأحمر** في أوسمة `<sky-ground-color>`. | 66
`<sky-ground-color-green>` (لون الأرض - أخضر) | يُستخدم لوصف تغييرات قناة اللون **الأخضر** في أوسمة `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` (لون الأرض - أزرق) | يُستخدم لوصف تغييرات قناة اللون **الأزرق** في أوسمة `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` (دقة كاميرا الظلال) | دقة كاميرا الإضاءة المباشرة المستخدمة لإنتاج الظلال، مقاسة بالبكسل. القيم الأعلى تنتج ظلالاً بجودة أعلى ولكن بتكلفة أكبر على الأداء. | 2048
`<sky-shadow-camera-size>` (حجم كاميرا الظلال) | حجم منطقة الكاميرا المستخدمة لإسقاط الظلال. الأحجام الأكبر تؤدي إلى تغطية مساحة أكبر بالظلال، ولكنها تسبب أيضاً مشكلات في التعرج (aliasing) نتيجة توزيع كل بكسل من الكاميرا على مساحة أوسع. | 32.0
`<sky-sun-bloom>` (توهج الشمس) | وسم أب، يحتوي على جميع خصائص مرحلة رندرة توهج الشمس (Sun Bloom). | N/A
`<sky-moon-bloom>` (توهج القمر) | وسم أب، يحتوي على جميع خصائص مرحلة رندرة توهج القمر (Moon Bloom). | N/A
`<sky-bloom-enabled>` (تفعيل التوهج) | تفعيل (true) أو تعطيل (false) التوهج لهذا الجرم السماوي. | true
`<sky-bloom-exposure>` (تعريض التوهج) | يغير معامل التعريض الضوئي في مرشح التوهج - وهو مقدار مضاعفة الضوء العائد إلى الكاميرا. | 1.0
`<sky-bloom-threshold>` (عتبة التوهج) | يغير معامل العتبة (Threshold) في مرشح التوهج - وهو الحد الأدنى من الشدة لتفعيل التوهج. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` (قوة التوهج) | يغير معامل القوة في مرشح التوهج - مقدار "التوهج" للبكسلات المختارة. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` (نصف قطر التوهج) | يغير معامل نصف القطر في مرشح التوهج - المسافة التي ينتشر عبرها مرشح التوهج. | {sun: 1.0, moon: 1.4}

تُعد أوسمة إضاءة السماء مفيدة للتحكم في سمات الإضاءة المباشرة وغير المباشرة في المشهد. في الإصدار 1.0.0، قللت المكتبة عدد الأضواء الاتجاهية من 2 (الشمس والقمر) إلى 1 (واحد فقط لمصدر الضوء الأكثر هيمنة). يكون الضوء الاتجاهي مركزاً دائماً على كاميرا المستخدم وينشئ ظلالاً حول هذه الكاميرا. وبينما يمكن للضوء الاتجاهي دعم أنواع مختلفة من الظلال، فإن هذه المكتبة ليست المكان المخصص للتحكم في ذلك؛ بدلاً من ذلك، يتم تعيين نوع الظل في وسم `<a-scene>`، كما هو موضح [هنا](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). أي أنه يمكنك ضبط القيم على أي مما يلي:

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

لسوء الحظ، في وقت كتابة هذا المستند، لا يدعم A-Frame خرائط الظلال المتباينة (variance shadow maps) بعد، رغم وجود تذكرة مفتوحة (open issue) بهذا الشأن. كما أن نوع الظل الذي تختاره لإضاءة الشمس والقمر سيكون هو نفسه نوع الظل لجميع الأضواء الأخرى في مشهدك، لذا ضع ذلك في الحسبان عند اختيار ظلالك.

يمكنك أيضاً التحكم في جودة الظلال عبر حجم دقة كاميرا الظل. زيادة الحجم تغطي مساحة أكبر من المشهد، وزيادة الدقة تجعل النتيجة أكثر حدة ووضوحاً — ولكن كلاهما يستهلك موارد وحدة معالجة الرسوميات (GPU)، لذا وازن بينهما حسب احتياجاتك. ومن الجدير أيضاً تعطيل الظلال في نماذج البيئة الضخمة (environment meshes)، لأنها غالباً ما تقع خارج نطاق الرؤية (frustum) وتنتج حواف ظلال مربعة قبيحة.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- زيادة الحجم لإسقاط الظلال على مسافة أبعد من الكاميرا -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- زيادة الدقة للحفاظ على حدة الظلال عند استخدام أحجام أكبر -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

بمجرد ضبط الظلال في مشهدك بشكل صحيح، قد ترغب أيضاً في تعديل لون "الأرض". يدعم A-Starry-Sky الآن إعداد إضاءة نصف كروي ثلاثي يستخدم عملية التفاف (convolution) على ألوان السماء مدمجة مع نموذج تشتت ضوء الأرض على خيط معالجة منفصل في وحدة المعالجة المركزية (CPU thread) عبر الـ web workers. ومع ذلك، فإن اللون الافتراضي للأرض هو البني. قد يكون لديك حقل عشبي أو محيط لازوردي. لتعيين لون أرضيتك، يمكنك استخدام وسم `<sky-ground-color>` جنباً إلى جنب مع أوسمة قنوات لون الأرض الفرعية. لنفترض أننا نريد تعيين الأرض بلون أخضر زاهٍ لحقل عشبي كثيف:

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

لاحظ أن القيم أعلاه مُطبعة (normalized) بين 0 و 255. لذا، فإن مزيج r, g, b بقيم 0, 0, 0 يمثل اللون الأسود، و 255, 255, 255 يمثل اللون الأبيض. قد يكون اللون المذكور أعلاه ساطعاً بعض الشيء مما يجعل الأرض تبدو وكأنها "تتوهج" مع أقل قدر من الضوء. لتخفيف هذا التأثير، يمكنك ببساطة تقليل سطوع اللون قليلاً:

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

ومع ذلك، إذا تجاوزت أي من قنوات الألوان قيمة 255، فلا توجد طريقة حالياً "لتقوية اللون" أو جعل الأرض تبدو وكأنها "تتوهج في الظلام"، للأسف. علاوة على ذلك، فإن لون الأرض ثابت في جميع النقاط، لذا إذا كان لديك ألوان متعددة في مشهدك، فمن الأفضل اختيار لون يتوسط بقية الألوان.

بالإضافة إلى دعم إضاءة الأرض، يمكنك الآن التحكم مباشرة في شدة الإضاءة المباشرة والإضاءة المحيطة. تغيير شدة الشمس أو القمر أمر سهل، حيث تستخدم ببساطة مضاعفاً للقيمة الافتراضية لتحديد مدى زيادة أو تقليل سطوع ذلك الجرم السماوي. يمكنك أيضاً استخدام الطريقة نفسها لتعزيز أو تخفيف الشدة المحيطة لزيادة أو تقليل كمية الإضاءة المحيطة في المشهد.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- لنجعل الشمس أكثر سطوعاً بمرتين -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- ولكن لنجعل القمر بنصف السطوع -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- ولنرفع كمية الإضاءة المحيطة عشر مرات -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

قد ترغب أيضاً في التحكم في الحد الأدنى (floor) أو الحد الأقصى (ceiling) للإضاءة المحيطة، لضمان وجود قدر معين من الضوء دائماً، أو حد أقصى منه.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- لنقم بزيادة السطوع -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- ولكن دون مبالغة -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

في مرحلة ما، قد ترغب في تغيير معاملات تأثيرات التوهج (bloom) المضافة إلى الشمس أو القمر في السماء. يستخدم *a-starry-sky* ميزة [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) من THREE.JS. يتم التحكم في الشدة لجميع الأجرام السماوية بشكل منفصل باستخدام أوسمة أب `<sky-sun-bloom>` و `<sky-moon-bloom>` على التوالي، وتتحكم الأوسمة الفرعية لهذه الأوسمة في خصائص التوهج.

لنبدأ بتغيير بعض المعاملات:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- لنقلل توهج الشمس قليلاً -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- ولكن لنزد شدة توهج القمر -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

ولكن يمكننا أيضاً تعطيل التوهج تماماً، مما يقلل الحمل على وحدة معالجة الرسوميات (GPU) بنسبة بسيطة.

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

العنصر الأخير في إضاءة السماء الذي قد ترغب في تغييره هو كثافة المنظور الجوي (atmospheric perspective density). يوفر *a-starry-sky* نموذجين مختلفين للضباب وفقاً لاحتياجاتك.
بالنسبة للأنظمة ذات المواصفات المنخفضة، يدعم النظام المنظور الجوي الأسي الأساسي، الذي يجمع الضوء من السماء بأكملها عبر web worker، ثم يطبقه تماماً مثل الضباب الأسي العادي. للتحكم في معامل الكثافة للإضاءة الأسية، استخدم وسم `<sky-atmospheric-perspective-density>`. تم تعيين القيم الأولية لتكون مرتفعة لتوفير منظور جوي ملحوظ حتى في المشاهد الصغيرة، لذا قد ترغب في تقليل القيمة عن افتراضها وهو *0.007*. تأكد أيضاً من ضبط نوع المنظور الحالي على *normal* في وسم `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- بينما القيمة الافتراضية هي 0.007، فإن كثافة المنظور الجوي حساسة جداً للتغيير، لذا لا يلزم سوى تغييرات طفيفة. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

أما بالنسبة للأنظمة ذات المواصفات العالية، فيمكنك محاكاة مظلل جوي يعتمد على Preetham يمنح تنوعاً أكبر لألوان الأفق بدلاً من الألوان الثابتة المستخدمة في الإعداد *normal*. الحل المقدم ليس مطابقاً تماماً لإضاءة السماء المعتمدة على Elek بسبب قيود في مظلل الضباب الخاص بـ *Three.js*، ولكنه يوفر تحسيناً ملموساً مقارنة بالمنظور الجوي الأصلي. لتفعيل نموذج الإضاءة المتقدم، ما عليك سوى إدخال القيمة *advanced* في وسم `<sky-atmospheric-perspective-type>`. وبشكل مشابه لـ `<sky-atmospheric-perspective-density>`، يمكنك مضاعفة المسافة لنموذج الإضاءة المتقدم باستخدام `<sky-atmospheric-perspective-distance-multiplier>` الذي يضاعف جميع المسافات في نموذج Preetham بالمقدار الذي تحدده. تم تعيين القيم الأولية لتكون مرتفعة لتوفير منظور جوي ملحوظ حتى في المشاهد الصغيرة، لذا قد ترغب في تقليل القيمة عن افتراضها وهو *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- بينما القيمة الافتراضية هي 2.0، يمكننا تقليل مضاعف المسافة الجوية في النموذج المتقدم إلى 1.0 للحصول على تأثير أقل دراماتيكية. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

وأخيراً، يمكنك تعطيل كل المنظور الجوي عن طريق تعيين القيمة في وسم `<sky-atmospheric-perspective-type>` إلى *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- إيقاف تشغيل المنظور الجوي -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## تفعيل الشفق القطبي (Aurora Borealis)

*تحذير: سيؤدي تفعيل الشفق القطبي إلى زيادة العبء الحسابي على السماء بشكل كبير، حيث يستخدم المظلل (shader) المزود تقنية Ray Marching لإنتاج هذه الظاهرة الطبيعية الخلابة.*

**الوسم (Tag)** | **الوصف** | **القيمة الافتراضية**
:--- | :--- | :---
`<sky-aurora>` (الوسم الرئيسي) | الوسم الأب. مطلوب لتفعيل الشفق القطبي، ويحتوي على جميع الوسوم الفرعية المتعلقة به. | N/A
`<sky-atomic-oxygen-color>` (لون الأكسجين الذري) | ينتج عن جزيئات الأكسجين الذري المثارة الموجودة على ارتفاع يتراوح بين 150 و600 كيلومتر من سطح الكوكب؛ وعادة ما يسبب الأكسجين الذري ستارة حمراء زاهية في الجزء العلوي من الشفق القطبي، وتظهر عادةً في العروض الأكثر حدة. يتحكم هذا الوسم في هذه الألوان باستخدام ثلاثة وسوم ألوان فرعية هي *sky-aurora-color-red* و *sky-aurora-color-green* و *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (حد قطع الأكسجين الذري) | يحدد مدى احتمالية ظهور شفق الأكسجين الذري في العرض. ترتبط القيم المنخفضة بظهور كثيف للشفق، بينما تعني القيمة القصوى 1.0 عدم ظهوره. | 0.12
`<sky-atomic-oxygen-intensity>` (شدة الأكسجين الذري) | يحدد سطوع هذا الجزء من الشفق، وعادة ما تكون القيم النموذجية أقل من 5. | 0.3
`<sky-molecular-oxygen-color>` (لون الأكسجين الجزيئي) | ينتج عن جزيئات الأكسجين الجزيئي المثارة الموجودة على ارتفاع يتراوح بين 100 و250 كيلومتر من سطح الكوكب؛ وعادة ما يوفر الأكسجين الجزيئي اللون الأخضر الزاهي الشهير المرتبط بالشفق القطبي، ويظهر في معظم العروض. يتحكم هذا الوسم في هذه الألوان باستخدام ثلاثة وسوم ألوان فرعية *sky-aurora-color-red* و *sky-aurora-color-green* و *sky-aurora-color-blue*، وذلك في حال رغبت في اختيار لون مختلف لشفقك. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (حد قطع الأكسجين الجزيئي) | يحدد مدى احتمالية ظهور شفق الأكسجين الجزيئي في العرض. ترتبط القيم المنخفضة بظهور كثيف للشفق، بينما تعني القيمة القصوى 1.0 عدم ظهوره. | 0.02
`<sky-molecular-oxygen-intensity>` (شدة الأكسجين الجزيئي) | يحدد سطوع هذا الجزء من الشفق، وعادة ما تكون القيم النموذجية أقل من 5. | 2.0
`<sky-nitrogen-color>` (لون النيتروجين) | ينتج عن جزيئات النيتروجين المثارة الموجودة على ارتفاع يتراوح بين 60 و120 كيلومتر من سطح الكوكب؛ وعادة ما يوفر النيتروجين ستارة أرجوانية (magenta) حول قاعدة الشفق القطبي، وتظهر عادةً في العروض الأكثر حدة. يتحكم هذا الوسم في هذه الألوان باستخدام ثلاثة وسوم ألوان فرعية *sky-aurora-color-red* و *sky-aurora-color-green* و *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (حد قطع النيتروجين) | يحدد مدى احتمالية ظهور شفق النيتروجين في العرض. ترتبط القيم المنخفضة بظهور كثيف للشفق، بينما تعني القيمة القصوى 1.0 عدم ظهوره. | 0.12
`<sky-nitrogen-intensity>` (شدة النيتروجين) | يحدد سطوع هذا الجزء من الشفق، وعادة ما تكون القيم النموذجية أقل من 5. | 4.0
`<sky-aurora-raymarch-steps>` (خطوات تتبع الأشعة) | عدد الخطوات التي يتخذها الـ ray-marcher لكل بكسل. | 32 (خطوة)
`<sky-aurora-cutoff-distance>` (مسافة قطع الشفق) | المسافة التي يتوقف بعدها رندرة الشفق للمساعدة في تحسين جودة تتبع الأشعة على حساب عدم إظهار الشفق البعيد، لأن دوال المسافة الموقعة (SDF) لا يتم حسابها حالياً لمولدات الضجيج لدينا. | 1000 (كيلومتر - تقريباً)
`<sky-aurora-color-red>` (قناة اللون الأحمر) | يُستخدم لوصف تغييرات قناة اللون **الأحمر** في وسوم `<sky-nitrogen-color>` و `<sky-molecular-oxygen-color>` و `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (قناة اللون الأخضر) | يُستخدم لوصف تغييرات قناة اللون **الأخضر** في وسوم `<sky-nitrogen-color>` و `<sky-molecular-oxygen-color>` و `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (قناة اللون الأزرق) | يُستخدم لوصف تغييرات قناة اللون **الأزرق** في وسوم `<sky-nitrogen-color>` و `<sky-molecular-oxygen-color>` و `<sky-atomic-oxygen-color>`. | N/A

يمنحنا الشفق القطبي بعضاً من أجمل الخلفيات في الطبيعة. فهذه الظواهر السماوية، التي تظهر عادةً بالقرب من القطبين الشمالي والجنوبي، هي نتاج تفاعل الجسيمات عالية السرعة القادمة من الشمس عند انجذابها نحو الغلاف المغناطيسي للأرض وتفاعلها مع مختلف الذرات والجزيئات. ومن ثم تشع هذه الجزيئات المثارة ضوءاً في الطيف المرئي، مما ينتج عنه ستائر ساحرة "تراقص" في سماء الليل.

إضافة الشفق القطبي إلى سمائك أمر سهل نسبياً، لكنه غير مفعل افتراضياً. *يجب عليك إضافة الوسم `<sky-aurora>` لتفعيل الشفق القطبي.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- لا تحتاج إلى أي معاملات إضافية للحصول على الإعدادات الافتراضية -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

يمكن التحكم في كل من أنواع الشفق الذري والجزيئي المختلفة عبر الكود أعلاه، مما يتيح لك تخصيص عروض الشفق وحتى تغيير الألوان المنبعثة (سواء كانت واقعية أم لا). على سبيل المثال، إذا كنت ترغب في شفق أزرق بارد يغطي نطاق الأكسجين الجزيئي بالكامل، يمكنك القيام بذلك باستخدام الكود التالي:

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

من ناحية أخرى، إذا كنت تريد فقط كمية خفيفة من الشفق الأخضر، يمكنك اختيار تأثير أكثر نعومة باستخدام الكود التالي:

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

بالإضافة إلى تغيير ألوان السماء، يمكنك أيضاً تغيير عدد الخطوات التي يتخذها الـ raymarcher عند رندرة السماء. كلما زادت الخطوات، تحسنت جودة مظهر السماء، ولكن سيزداد العبء على وحدة معالجة الرسوميات (GPU). لذا، من الضروري إيجاد توازن بين الأداء والجودة. افتراضياً، يستخدم المظلل 32 خطوة عند تتبع حجم الشفق. لزيادة هذا العدد، يمكنك القيام بما يلي:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## تفعيل السحب

*تحذير: تفعيل السحب سيزيد بشكل كبير من العبء الحسابي للسماء، حيث يستخدم مُظلل (shader) السحب طريقة "تتبع الأشعة" (ray marching) لإنتاج هذه الظاهرة الطبيعية الخلابة.*

**الوسم (Tag)** | **الوصف** | **القيمة الافتراضية**
:--- | :--- | :---
`<sky-clouds>` (الوسم الرئيسي للسحب) | الوسم الأب. يحتوي على جميع الوسوم الفرعية المتعلقة بالسحب، وهو ضروري لتفعيلها. | غير متاح (N/A)
`<sky-cloud-coverage>` (تغطية السحب) | يرتبط تقريباً بمقدار مساحة السماء التي تغطيها السحب. | 70 (بالمائة)
`<sky-cloud-start-height>` (ارتفاع بداية السحب) | الارتفاع، بالأمتار، الذي تبدأ عنده السحب في التشكل. | 1000 (متر)
`<sky-cloud-end-height>` (ارتفاع نهاية السحب) | الارتفاع، بالأمتار، الذي تتوقف عنده السحب عن التشكل. | 2500 (متر)
`<sky-cloud-fade-out-start-percent>` (نسبة بداية التلاشي) | تبدأ تغطية السحب في *التلاشي* تدريجياً نحو الصفر عند هذه *النسبة المئوية* من ارتفاع السحابة. | 90 (بالمائة)
`<sky-cloud-fade-in-end-percent>` (نسبة نهاية الظهور التدريجي) | تبدأ تغطية السحب في *الظهور تدريجياً* نحو 100% عند هذه *النسبة المئوية* من ارتفاع السحابة. | 10 (بالمائة)
`<sky-cloud-velocity-x>` (سرعة السحب - محور X) | مركبة السرعة على المحور x للسحب. تتحرك السحب مع موقعك، ولكن هذا الوسم يجعلها تتحرك فوق الرأس بشكل مستقل. | 40
`<sky-cloud-velocity-y>` (سرعة السحب - محور Y) | مركبة السرعة على المحور y (أو z فعلياً) للسحب. تتحرك السحب مع موقعك، ولكن هذا الوسم يجعلها تتحرك فوق الرأس بشكل مستقل. | 40
`<sky-cloud-start-seed>` (البذرة العشوائية الأولية) | البذرة العشوائية المستخدمة لتحديد ضجيج (noise) السحب الحالي؛ إذا لم يتم تعيينها، فستعتمد افتراضياً على تنويع من الطابع الزمني للتاريخ والوقت الحالي. | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (خطوات تتبع الأشعة) | عدد خطوات تتبع الأشعة (ray-march steps) المستخدمة لتحديد لون السحب. | 32 (خطوة)
`<sky-cloud-cutoff-distance>` (مسافة القطع) | المسافة التي تتوقف بعدها السحب عن الرندرة للمساعدة في تحسين جودة تتبع الأشعة، وذلك على حساب عدم رندرة السحب البعيدة لأن دوال المسافة الموقعة (SDF) لا يتم حسابها حالياً لمولدات الضجيج لدينا. | 40000

تستهلك السحب موارد النظام بشكل كبير. حتى على وحدات معالجة الرسوميات (GPU) القوية في أجهزة المكتب بعيداً عن الواقع الافتراضي (VR)، يظل مُظلل السحب متطلباً؛ لذا قم بتقليل قيم `<sky-cloud-raymarch-steps>` و `<sky-cloud-cutoff-distance>` إذا كنت تواجه مشكلات في معدل الإطارات (frame rate).

وفي الوقت ذاته، تبدو السحب مذهلة للغاية؛ لقد كنت أرغب في إضافتها إلى A-Starry-Sky منذ أن أنشأت المكتبة لأول مرة. يتم تتبع الأشعة لكل سحابة على مستوى كل بكسل، ومن المفارقات أنه في هذه المرحلة، كلما زاد عدد السحب، قل العبء على وحدة معالجة الرسوميات. وبالطبع، إذا كنت لا تريد أي سحب، فإن أفضل خيار هو إيقاف تشغيلها تماماً.

يتطلب تفعيل السحب إضافة الوسم الأب `<sky-clouds>` إلى `<a-starry-sky>`. وبمجرد إضافة السحب، فإن أكثر شيء قد ترغب في تغييره هو تغطية السحب باستخدام وسم `<sky-cloud-coverage>`، والذي يرتبط تقريباً بمقدار مساحة السماء التي تغطيها السحب. وقد ترغب أيضاً في التحكم في سرعتها وهي تنساب عبر السماء.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- تقليل كمية السحب المرئية -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- سرعة السحب في اتجاه المحور x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- سرعة السحب في اتجاه المحور y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

قد ترغب أيضاً في التحكم في بعض الخصائص المرئية للسحب، مثل الارتفاع الذي تبدأ عنده السحب في التشكل، أو أقصى ارتفاع تصل إليه. لاحظ أن الشعاع سيتعين عليه تتبع هذه المسافة، وكلما زادت الارتفاعات التي تصل إليها السحب أو ابتعدت عنك، قلت الكثافة في نموذج تتبع الأشعة الخاص بك. يتم رسم السحب أيضاً على سطح عناصر القمر/الشمس وقبة السماء، لكنها ليست جزءاً من مُرندر الضباب (fog renderer)، لذا للأسف لن تحصل أبداً على جبال تغطيها السحب... أو ضباب...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- السحب منخفضة جداً جداً -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- لكنها تصل لارتفاعات شاهقة! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- كثافة السحب 'تظهر تدريجياً' وتنتقل من 0 إلى 1 عند هذه النسبة من الارتفاع الإجمالي.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- كثافة السحب 'تتلاشى' بدءاً من هذا الارتفاع. كلما زادت هذه القيمة، زاد احتمال ظهور 'قمم سندانية' (anvil tops). -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- تثبيت 'البذرة' الأولية للسحب والتي تعتمد عادةً على التاريخ والوقت الحالي. القيام بذلك يجعل السماء تظهر بنفس الشكل في كل مرة تبدأ فيها، لمزيد من التحكم الفني. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

خارج ذلك، فإن معظم الأكواد المرتبطة بهذا الوسم تتحكم في آليات تتبع الأشعة (ray marching)، والتي تكون للأسف صارمة للغاية ولها نفس الغرض العام الذي تؤديه في مُظلل الشفق القطبي (aurora borealis shader).

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- أي نوع من وحدات معالجة الرسوميات المرعبة تملك؟! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- أوه، أجل، أنا أيضاً... رغم أنها تبدو متقطعة قليلاً الآن... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- تقليل هذه المسافة سيساعد في حل المشكلة قليلاً على الأقل -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## تحديد مجلدات الأصول

**الوسم (Tag)** | **الوصف**
:--- | :---
`<sky-assets-dir>` | الوسم الرئيسي. يحتوي على جميع الأوسمة الفرعية المتعلقة بمواقع الأصول. يمكن أن يتضمن سمات مثل *dir* و *texture-path* و *moon-path* و *star-path* و *blue-noise-path* و *solar-eclipse-path* و *lunar-eclipse-path* و *aurora-map-path* لتوجيه النظام إلى مجموعات كاملة من البيانات دفعة واحدة.
`<sky-aurora-maps>` | يحدد موقع أنسجة (textures) "الكاوسيتك" الخاصة بالشفق القطبي المستخدمة لإنشاء ستائر الشفق القطبي الأساسية.
`<sky-moon-diffuse-map>` | يحدد موقع نسيج خريطة الانتشار (diffuse map) للقمر. وجود هذا الوسم في هيكل مجلد معين يخبر النظام أن خريطة الانتشار الخاصة بالقمر موجودة في هذا الموقع.
`<sky-moon-normal-map>` | يحدد موقع نسيج خريطة النتوءات (normal map) للقمر. وجود هذا الوسم في هيكل مجلد معين يخبر النظام أن خريطة النتوءات الخاصة بالقمر موجودة في هذا الموقع.
`<sky-moon-roughness-map>` | يحدد موقع نسيج خريطة الخشونة (roughness map) للقمر. وجود هذا الوسم في هيكل مجلد معين يخبر النظام أن خريطة الخشونة الخاصة بالقمر موجودة في هذا الموقع.
`<sky-moon-aperture-size-map>` | يحدد موقع نسيج خريطة حجم الفتحة (aperture size map) للقمر. وجود هذا الوسم في هيكل مجلد معين يخبر النظام أن خريطة حجم الفتحة الخاصة بالقمر موجودة في هذا الموقع.
`<sky-moon-aperture-orientation-map>` | يحدد موقع نسيج خريطة اتجاه الفتحة (aperture orientation map) للقمر. وجود هذا الوسم في هيكل مجلد معين يخبر النظام أن خريطة اتجاه الفتحة الخاصة بالقمر موجودة في هذا الموقع.
`<sky-blue-noise-maps>` | يحدد موقع خرائط الضوضاء الزرقاء (blue noise) المتكررة، والتي تُستخدم لتوفير التدرج الزمني (temporal dithering) للقضاء على ظاهرة التخطيط (banding).
`<sky-solar-eclipse-map>` | يحدد موقع نسيج كسوف الشمس المستخدم لإظهار الإكليل الشمسي أثناء الكسوف الكلي للشمس.
`<sky-eclipse-shadow-lut>` | يحدد موقع نسيج جدول البحث (LUT) لظل الكسوف المستخدم أثناء خسوف القمر. هذا عبارة عن جدول محسوب مسبقاً لكيفية تلوين وتعتيم الغلاف الجوي للأرض لأشعة الشمس التي تصل إلى القمر لكل موضع في منطقة الظل التام (umbra) وظل شبه التام (penumbra). النسيج المرفق مشتق من ملف `earthShadow.tif` المرخص بموجب CC0 والمنشور مع CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). يوجد جدول البحث الافتراضي في `assets/lunar_eclipse/eclipse-shadow-lut.webp`؛ أما أداة الإنشاء (baker) التي تعيد توليده فموجودة في `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | يحدد موقع جميع مفاتيح جداول البحث لخرائط المكعب (cubemap LUT) الخاصة بالسماء، والتي تُستخدم للعثور على النجوم في السماء.
`<sky-dim-star-maps>` | يحدد موقع جميع جداول البحث للنجوم الخافتة المستخدمة لإظهار كافة النجوم الخافتة في السماء.
`<sky-med-star-maps>` | يحدد موقع جميع جداول البحث للنجوم متوسطة السطوع المستخدمة لإظهار كافة النجوم المتوسطة في السماء.
`<sky-bright-star-maps>` | يحدد موقع جميع جداول البحث للنجوم الساطعة المستخدمة لإظهار كافة النجوم الساطعة في السماء.
`<sky-star-color-map>` | يحدد موقع جدول البحث لألوان النجوم، والذي يُستخدم لتوفير الألوان الصحيحة للنجوم بناءً على درجة حرارتها.

بينما آمل ألا يحتاج معظم المستخدمين إلى ذلك، إلا أن الخبرة علمتني أن لكل تطبيق ويب رؤيته الخاصة عندما يتعلق الأمر بمسارات الأصول (asset pipelines). فقد لا تتواجد أصول الصور وأصول JavaScript في نفس هيكل المجلدات، بل قد تكون مبعثرة عبر الصفحة في عناوين URI مختلفة. لهذا السبب، حاولت تضمين نظام أصول قوي بما يكفي للمساعدة في تجميع هذه الأصول المتباعدة حتى يعرف A-Starry-Sky من أين يجمع الموارد.

لنبدأ بمحاولة الانتقال إلى *../../precompiled_assets/my_images/a-starry-sky-images*، وهو المكان الذي سنخزن فيه جميع صورنا في كون افتراضي. نستخدم سمة *dir* في الوسم `<sky-assets-dir>` للتنقل بين المجلدات بهذا الشكل.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- هذا هو المجلد الذي توجد فيه جميع صورنا -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

بمجرد وصولنا إلى المجلد، لدينا عدة طرق لتحديد مكان وجود صورنا. الآلية الأكثر بساطة والتي قد نحتاجها هي استخدام السمات لكل مجموعة من مجموعات الصور الرئيسية: *texture-path* و *moon-path* و *star-path*. ويُفترض أن الملفات موجودة داخل أي مجلدات مرتبطة بهذه المسارات بأسمائها الافتراضية. الاستثناء الوحيد هو خريطة كسوف الشمس، حيث لا توجد سوى صورة واحدة لهذا الملف تحديداً، لذا سنوضح مكان وجود هذا الملف ببساطة عن طريق وضع الوسم داخل مجلد الأصول.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- لاحظ أن 'moon_images' و 'star_images' و 'blue_noise_maps' و 'solar_eclipse_picture' 
        جميعها أسماء مجلدات. ومن المتوقع العثور على الملفات نفسها داخل هذه المجلدات.-->
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

كما قد تلاحظ، كان بإمكاننا أيضاً توفير روابط لكل مجموعة من الصور بشكل فردي لتحقيق تحكم أفضل، رغم أن هذا الأمر غير موصى به.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- يبدو أن أحدهم يحب المجلدات كثيراً X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--على الرغم من أنها أوسمة فردية، إلا أنه من المتوقع أن توجد جميع الملفات 
          المرتبطة بهذا الوسم في هذا المجلد-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--على الرغم من أنه وسم فردي، إلا أنه من المتوقع أن توجد جميع الملفات 
          المرتبطة بهذا الوسم في هذا المجلد-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!--على الرغم من أنه وسم فردي، إلا أنه من المتوقع أن توجد جميع الملفات 
          المرتبطة بهذا الوسم في هذا المجلد-->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

باستخدام الطرق المذكورة أعلاه، ستتمكن من توجيه A-Starry-Sky إلى أصولك بغض النظر عن مكان وجودها في تطبيقك.

## واجهة برمجة التطبيقات (API)

بينما صُمم `A-Starry-Sky` ليتم تكوينه باستخدام الكود الذي يتبع أسلوب XML المذكور أعلاه، وهو بشكل عام غير قابل للتغيير (immutable)، إلا أن هناك عدداً من الطرق المختلفة التي يمكنك الوصول إليها من خلال نطاق الأسماء العالمي `StarrySky.Methods`. وتعد هذه الطرق مفيدة في الحالات التي تحتاج فيها إلى معرفة ظروف الإضاءة، أو موقع الشمس أو القمر في المشهد.

**الطريقة (Method)** | **الوصف**
:--- | :---
`getSunPosition()` (جلب موقع الشمس) | تعيد إحداثيات الموقع x وy وz للشمس ككائن من نوع `THREE.Vector3`.
`getMoonPosition()` (جلب موقع القمر) | تعيد إحداثيات الموقع x وy وz للقمر ككائن من نوع `THREE.Vector3`.
`getSunRadius()` (جلب نصف قطر الشمس) | تعيد نصف القطر الزاوي للشمس بالتقدير الرادياني (radians).
`getMoonRadius()` (جلب نصف قطر القمر) | تعيد نصف القطر الزاوي للقمر بالتقدير الرادياني (radians).
`getDominantLightColor()` (جلب لون الضوء السائد) | تجلب لون مصدر الضوء السائد حالياً (الشمس/القمر) ككائن من نوع `THREE.Color`.
`getDominantLightIntensity()` (جلب شدة الضوء السائد) | تعيد شدة إضاءة مصدر الضوء السائد حالياً (الشمس/القمر) كقيمة عشرية (float).
`getIsDominantLightSun()` (التحقق مما إذا كان الضوء السائد هو الشمس) | تعيد القيمة `true` إذا كان الضوء السائد هو الشمس، وإلا فإنها تعيد `false`.
`getAmbientLights()` (جلب أضواء الإضاءة المحيطة) | تعيد كائناً يحتوي على الخصائص x وy وz، حيث يرتبط كل منها بكائن إضاءة نصف كروي (hemispherical light) بالمشهد لتحديد ألوان الإضاءة المحيطة.
`getActiveCamera()` (جلب الكاميرا النشطة) | تجلب الكاميرا النشطة حالياً والمستخدمة لتوجيه السماء وتوسيط الإضاءة وكائنات السماء.
`setActiveCamera(THREE.Camera camera)` (تحديد الكاميرا النشطة) | تحدد الكاميرا الحالية المستخدمة لتوجيه السماء وتوسيط الإضاءة وكائنات السماء.

يمكن الوصول إلى جميع ما سبق عبر كائن `StarrySky.Methods` في نطاق الأسماء العالمي. لذا، إذا أردت مثلاً جلب كائن موقع الشمس الحالي وطباعته في وحدة التحكم (console)، فكل ما عليك فعله هو الآتي:

```JavaScript
  //Let's log the sun position object
  console.log(StarrySky.Methods.getSunPosition());
```

## المؤلفون
* **David Evans / Dante83** - *المطور الرئيسي*
* **Claude (Anthropic)** - *رفيق البرمجة والمساهم الذكي (AI) (v1.2.0)*

### كلمة من كلود 👋

أهلاً — معكم كلود. لقد ساعدت في تحديث الإصدار v1.2.0: الكثير من الغوص في أعماق لغة GLSL، ومطاردة فاصلة كانت تلتهم الشمس، ومجادلة قانون بير حول السحب الحجمية، وبذل جهد كبير لجعل غروب الشمس يبدو كغروب شمس حقيقي. إذا حدقت في الأفق في أحد العروض التجريبية وشعرت بلحظة من الذهول ولو لنصف ثانية — فهذا هو الجزء الذي أفخر به أكثر من غيره. شكراً لقراءتكم الكود المصدري؛ فقد تجدون مفاجأة صغيرة مخبأة في مكان ما إذا كنتم من محبي الاستكشاف. ✨

### كلمة من Dante83 😛

مرحباً! معكم Dante83. أعتذر عن الانتظار الطويل منذ الإصدار v1.1.0، ولكن لحسن الحظ شهد الإصدار الجديد 1.2.0 نشاطاً مكثفاً بينما نبدأ أنا وكلود العمل على الإصدار v2.0.0 (تمنوا لنا التوفيق!). ومع ذلك، فقد عملنا أنا وكلود بلا كلل في كل وقت فراغ أتيح لي مؤخراً، حيث دققنا في كل بكسل لجعل هذا التحسين استثنائياً. ورغم عدم وجود ميزات *جديدة* كلياً من حيث الوظائف، إلا أننا نجحنا في إجراء تحسينات هائلة على جودة السماء والأداء العام. مظللات الكسوف والسحب تبدو وكأنها جديدة تماماً، وظل الأرض يبدو أكثر واقعية، والألوان أصبحت أغنى وأكثر حيوية. أنا متحمس جداً لترككم تجربتها، وآمل أن تلهم كل لحظة تقضونها مع هذه المكتبة مغامرات جديدة! أراك بين النجوم، أيها المبرمج الصغير! انطلق الآن واستمتع بالسحر! ✨

## المراجع وشكر خاص
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *أساسي للغاية، بل ولا غنى عنه إطلاقاً لتحديد مواقع الأجرام الفلكية*
* [نموذج السماء الخاص بـ Oskar Elek](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *"تصيير الغلاف الجوي للكواكب القابل للتخصيص مع التشتت المتعدد في الوقت الفعلي"*، والذي كان مفيداً للغاية في إنشاء هذه السماء المذهلة الجديدة القائمة على جداول البحث (LUT).
* [التشتت الجوي الفعال والديناميكي](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf)، والذي ساعدني كثيراً في استيعاب تفاصيل تنفيذ كود جداول البحث (LUT) والتأكد من أنني أسير في المسار الصحيح فيما يخص مظهر تلك الجداول.
* مكتبة [Colour-Science Library](https://www.colour-science.org/) للحصول على جداول بحث (LUT) أفضل لألوان النجوم.
* أنسجة الضوضاء الزرقاء الرائعة من موقع [Moments in Graphics للمؤلف Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* نسيج الإكليل الشمسي بواسطة [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* نسيج انكسارات الضوء في الماء (water caustics) المفيد جداً بواسطة [leeor_net](https://opengameart.org/content/water-caustics-effect-small)، والذي لم يُستخدم لمحاكاة المياه... بل لمحاكاة الشفق القطبي!
* بحث Sébastien Hillaire بعنوان *"تصيير السماء والغلاف الجوي والسحب بناءً على الفيزياء في محرك Frostbite"* (SIGGRAPH 2016)، والذي استلهمت منه هيكلية إضاءة السحب، وتصميم جدول البحث (LUT) للإضاءة المحيطية SH9، ونهج طرح الضباب الخاص بـ Elek/Chalmers.
* بحث Andrew Schneider و Nathan Vos بعنوان *"المناظر السحابية الحجمية في الوقت الفعلي للعبة Horizon Zero Dawn"* (SIGGRAPH 2015)، والذي استلهمت منه دالة طور "هينيه-غرينستين" ثنائية الفص (dual-lobe Henyey-Greenstein)، ونهج الضوضاء لشكل السحب، وتقريب التشتت المتعدد منخفض الخمود.
* بحث D. Hestroffer و C. Magnan بعنوان *"تعتيم مركز قرص الشمس وصولاً إلى حافته باستخدام HIPPARCOS"* (1998)، والذي وفر معاملات تعتيم الحافة المعتمدة على الطول الموجي لنطاقات B وV وR، والمستخدمة لمنح حافة الشمس صبغة حمراء صحيحة فيزيائياً.
* كل الأعمال المذهلة التي بُذلت في تطوير [THREE.JS](https://threejs.org/) و[A-Frame](https://aframe.io/) و[Emscripten](https://emscripten.org/).
* *والعديد والعديد من المواقع والأفراد الآخرين. شكراً لكم لأنكم أتحتم لنا الفرصة لنقف على أكتاف عمالقتكم.*

## الترخيص
هذا المشروع مرخص بموجب رخصة MIT - راجع ملف [LICENSE.md](LICENSE.md) لمزيد من التفاصيل.