# A-Starry-Sky

A-Starry-Sky হলো [A-Frame Web Framework](https://aframe.io/)-এর জন্য একটি স্কাই ডোম (sky dome)। এর লক্ষ্য হলো একটি সহজ, ড্রপ-ইন কম্পোনেন্ট প্রদান করা যা ব্যবহার করে আপনি আপনার সৃষ্টিতে সুন্দর দিন-রাতের চক্র তৈরি করতে পারবেন।

> **সতর্কতা: এর জন্য শক্তিশালী GPU প্রয়োজন — মোবাইল ফোনে ওপেন করবেন না।**

**[লাইভ ডেমো](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — সান ফ্রান্সিসকোর বর্তমান তারিখ এবং সময়ের আকাশ।

| উদাহরণ | বর্ণনা |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | দিনের একটি নির্দিষ্ট সময়ে মরুভূমির দৃশ্য |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | করোনা সহ পূর্ণ সূর্যগ্রহণ |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | চাঁদের ওপর পৃথিবীর ছায়া (চন্দ্রগ্রহণ) |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | বৃহস্পতি ও শনির মহাযুগ্ম (Great conjunction), ১২২৬ খ্রিষ্টাব্দ |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | মঙ্গলের বিশেষ বায়ুমণ্ডল |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | ভিন্ন ভিন্ন Mie/Rayleigh স্ক্যাটারিং মান |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | ২০ কিমি উচ্চতা থেকে আকাশ |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ GPU-র ওপর চাপ বেশি (GPU intensive) |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ GPU-র ওপর চাপ বেশি |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ GPU-র ওপর চাপ বেশি |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ GPU-র ওপর চাপ বেশি |

## প্রয়োজনীয় শর্তাবলি

এটি [A-Frame Web Framework](https://aframe.io/) ভার্সন ১.৭.০+ এর জন্য তৈরি করা হয়েছে। এছাড়া এর জন্য একটি Web XR সামঞ্জস্যপূর্ণ ওয়েব ব্রাউজারের প্রয়োজন।

`https://aframe.io/releases/1.7.0/aframe.min.js`

## ইনস্টলেশন

আপনার প্রজেক্টে *a-starry-sky.v1.2.0.min.js* এবং *assets* ও *wasm* ফোল্ডারগুলো কপি করে নিন। আপনার HTML-এ নিচের স্ক্রিপ্টগুলো যোগ করুন — মনে রাখবেন যে, এখানে `starry-sky-web-worker.js` অন্তর্ভুক্ত করা হয়নি; এর পরিবর্তে এটি সরাসরি `<a-starry-sky>` ট্যাগে রেফারেন্স হিসেবে দেওয়া হয়েছে।

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

এই রেফারেন্সগুলো সেট আপ হয়ে গেলে, আপনার A-Frame-এর `<a-scene>` ট্যাগের ভেতরে নিচের মতো করে আপনার sky-state web worker URL-এর রেফারেন্সসহ `<a-starry-sky>` কম্পোনেন্টটি যোগ করুন।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

এই সাধারণ কোডটির মাধ্যমে আপনি ক্যালিফোর্নিয়ার সান ফ্রান্সিসকোর অক্ষাংশ এবং দ্রাঘিমাংশের ওপর ভিত্তি করে রিয়েল-টাইমে চলমান একটি আকাশ দেখতে পাবেন। তবে আমরা এর চেয়ে আরও অনেক বেশি কিছু করতে পারি। আপনার আকাশের অবস্থা (sky state) কাস্টমাইজ করার জন্য A-Starry-Sky-তে বেশ কিছু কাস্টম HTML ট্যাগ দেওয়া হয়েছে।

**দ্রষ্টব্য: এই স্কাই বক্সটি ইমিউটেবল (immutable)। এর মানে হলো, আপনি শুরুতে যে সেটিংসগুলো ব্যবহার করবেন, সেগুলো ওই পেজে অপরিবর্তিত থাকবে। দুর্ভাগ্যবশত, এই মুহূর্তে কোডটিকে মিউটেবল (mutable) করা অত্যন্ত কঠিন।**

## অবস্থান নির্ধারণ করা

**ট্যাগ (Tag)** | **বর্ণনা** | **ডিফল্ট মান**
:--- | :--- | :---
`<sky-location>` | প্যারেন্ট ট্যাগ। এর ভেতরে sky latitude এবং sky-longitude চাইল্ড ট্যাগ থাকে। | N/A
`<sky-latitude>` | অবস্থানের অক্ষাংশ (latitude) সেট করুন। বিষুবরেখার উত্তরের মান হবে **পজিটিভ**। | 38
`<sky-longitude>` | অবস্থানের দ্রাঘিমাংশ (longitude) সেট করুন। [মূল মধ্যরেখার](https://en.wikipedia.org/wiki/Prime_meridian) পশ্চিমের মান হবে **নেগেটিভ**। | -122

আপনি পৃথিবীর যেকোনো অক্ষাংশ এবং দ্রাঘিমাংশে আপনার আকাশ সেট করতে পারেন। সূর্য বা চাঁদের কক্ষপথের বক্রতা পরিবর্তনের মাধ্যমে খেলোয়াড়দের ঋতুচক্রের অনুভূতি দেওয়ার জন্য এই লোকেশনগুলো বেশ কার্যকর। অক্ষাংশের ওপর ভিত্তি করেই নির্ধারিত হবে যে আপনার রাতের আকাশে কোন তারাগুলো দেখা যাবে। এছাড়া সূর্যগ্রহণ এবং চন্দ্রগ্রহণের মতো সময়-নির্ভর ঘটনার ক্ষেত্রে অক্ষাংশ এবং দ্রাঘিমাংশ উভয়ই অত্যন্ত গুরুত্বপূর্ণ। বিশেষ করে পূর্ণ সূর্যগ্রহণ দেখার অভিজ্ঞতা পেতে চাইলে এটি আরও বেশি প্রযোজ্য। তবে, কোথায় থাকবেন তা ঠিক করার চেয়ে লোকেশন সেট করা অনেক সহজ। শুধু [Google Earth](https://earth.google.com/web/) বা অন্য কোনো ম্যাপ সোর্স থেকে আপনার পছন্দের লোকেশনটি নিন এবং নিচের মতো করে সংশ্লিষ্ট ট্যাগে মানগুলো বসিয়ে দিন:

চলুন নিউ ইয়র্কে যাই!
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

ঠিক আছে, কিন্তু অস্ট্রেলিয়ার পার্থ-এর ক্ষেত্রে কী হবে?
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

মনে রাখবেন যে [মূল মধ্যরেখার](https://en.wikipedia.org/wiki/Prime_meridian) পশ্চিমের দ্রাঘিমাংশগুলো নেগেটিভ হয় (যেমন: নিউ ইয়র্ক, বুয়েনস আইরেস)।

## সময় নির্ধারণ

**ট্যাগ (Tag)** | **বিবরণ (Description)** | **ডিফল্ট মান (Default Value)**
:--- | :--- | :---
`<sky-time>` | প্যারেন্ট ট্যাগ। তারিখ বা সময়ের উপাদানের সাথে সম্পর্কিত সমস্ত চাইল্ড ট্যাগ এর ভেতরে থাকে। | N/A
`<sky-date>` | স্থানীয় তারিখ ও সময়ের স্ট্রিং, যার ফরম্যাট হবে **YEAR-MONTH-DAY HOUR:MINUTE:SECOND**/*২০২১-০৩-২১ ১৩:৪৫:৫১*। ঘণ্টার মান ০-২৩ সিস্টেমের ওপর ভিত্তি করে নির্ধারিত হয়। এখানে ০ মানে রাত ১২টা এবং ২৩ মানে রাত ১১টা। | বর্তমান তারিখ (Current Date)
`<sky-speed>` | সময়ের গুণক (multiplier), যা জ্যোতির্বিজ্ঞানের হিসাবগুলোকে দ্রুত বা ধীর করতে ব্যবহৃত হয়। | 1.0
`<sky-utc-offset>` | এই অবস্থানের জন্য UTC-অফসেট। [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian)-এর পশ্চিমে মানগুলো ঋণাত্মক (negative) হয়, যা দ্রাঘিমাংশের (longitude) মানের বিপরীত। **মনে রাখবেন যে UTC সময় DST অনুসরণ করে না** | 7

আপনার নির্বাচিত অবস্থানের জন্য `<sky-date>`-এ **স্থানীয় সময়** সেট করুন, তারপর সেই টাইমজোনের সাথে মিল রেখে `<sky-utc-offset>` সেট করুন। উদাহরণস্বরূপ, নিউ ইয়র্ক সিটির ক্ষেত্রে এটি UTC-4 (গ্রীষ্মকাল) অথবা UTC-5 (শীতকাল) — DST স্বয়ংক্রিয়ভাবে প্রয়োগ হয় না।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Previous Location Settings -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- You can set up the utc offset like so! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

লক্ষ্য করুন যে, আমরা আবারও একটি প্যারেন্ট `<sky-time>` ট্যাগ যোগ করেছি যার ভেতরে সময়ের সেটিংসের জন্য প্রয়োজনীয় সব চাইল্ড ট্যাগ রয়েছে।

তবে আপনি শুধু লোকাল মেশিনের সময়ের মধ্যেই সীমাবদ্ধ থাকবেন এমন কোনো কথা নেই। চলুন একটু মজার কিছু করা যাক—যেমন টাইম ট্রাভেল! আমি শুনেছি ২০২৪ সালের ৮ই এপ্রিল দুপুর ১:২৭ মিনিটে (২৪ ঘণ্টার হিসেবে ১৩:২৭) [টেক্সাসের ডেল রিওতে](https://nationaleclipse.com/cities_total.html) একটি চমৎকার [সৌরগ্রহণ](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) হবে। চলুন সেটা দেখে আসি!

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

আপনি কি [ক্রিসমাস স্টার](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn) মিস করেছেন? না, না। ওইটার কথা বলছি না। আমি বলছি ১২২৬ খ্রিস্টাব্দের সেই তারার কথা। যাক, ভালোই হলো যে আমাদের কাছে একটি টাইম মেশিন আছে এবং A-Starry-Sky এখন গ্রহগুলোকেও সাপোর্ট করে :D।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

এই টাইম ট্রাভেল বেশ মজার, তবে আপনি সময়ের *গতি* পরিবর্তন করতেও আগ্রহী হতে পারেন। গেমের দুনিয়ায় দিন-রাতের চক্র প্রায়ই বাস্তবের চেয়ে দ্রুত চলে, অথবা লাইটিংয়ের প্রয়োজনে আপনি হয়তো কোনো নির্দিষ্ট মুহূর্তকে ধরে রাখতে সময় পুরোপুরি থামিয়ে দিতে চাইবেন। এটি করার জন্য `<sky-speed>` ট্যাগটি যোগ করুন।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- এখন বাস্তবের প্রতি একদিনের বিপরীতে গেমের দুনিয়ায় আট দিন অতিবাহিত হবে।-->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

অবশ্যই, আপনি যদি এটি কোনো পারসিস্টেন্ট ওয়ার্ল্ডে (persistent world) ব্যবহার করেন, তবে আপনার HTML তৈরি করার সময় সময়ের এই দ্রুত প্রবাহের বিষয়টি মাথায় রাখবেন। তবে আকাশের জন্য ডাইনামিক HTML সেটআপ করা সম্পূর্ণ আপনার ইচ্ছার ওপর নির্ভর করে।

## বায়ুমণ্ডলীয় সেটিংস পরিবর্তন করা

**ট্যাগ** | **বর্ণনা** | **ডিফল্ট মান**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | প্যারেন্ট ট্যাগ। বায়ুমণ্ডলীয় সেটিংস সম্পর্কিত সমস্ত চাইল্ড ট্যাগ এখানে থাকে। | N/A
`<sky-camera-height>` | পৃথিবীর উপর থেকে ক্যামেরার উচ্চতা। | 0.0km
`<sky-mie-directional-g>` | মি (Mie) স্ক্যাটারিংয়ের মাধ্যমে আলো কতটা সামনের দিকে ছড়িয়ে পড়ে তা বর্ণনা করে, যা বায়ুমণ্ডলের বড় কণার কারণে সূর্যের চারপাশে সাদাটে আভা তৈরি করে। এই মান যত বেশি হবে, বায়ুমণ্ডল তত ধুলোময় মনে হবে। | 0.8
`<sky-sun-intensity>` | অ্যাটমোস্ফিয়ারিক শেডারে সূর্যের আলোর তীব্রতা। | 1367.0
`<sky-moon-intensity>` | অ্যাটমোস্ফিয়ারিক শেডারে চাঁদের আলোর তীব্রতা। | 29.0
`<sky-mie-beta>` | মি (Mie) স্ক্যাটারিংয়ের জন্য আলোর রঙের নির্ভরতা, যা মূলত সূর্যের কাছাকাছি 'আভা' বা গ্লো তৈরির জন্য দায়ী। সব ফ্রিকোয়েন্সিতে এই স্ক্যাটারিং মোটামুটি সমান থাকে। | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | রেলি (Rayleigh) স্ক্যাটারিংয়ের জন্য আলোর রঙের নির্ভরতা, যা মূলত আকাশের নীল রঙের জন্য দায়ী। লক্ষ্য করুন যে, ডিফল্টভাবে ব্লু চ্যানেলে সবচেয়ে বেশি স্ক্যাটারিং হয়। | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | ওজোন স্তরের জন্য আলোর রঙের নির্ভরতা, যা সূর্যাস্তের সময় গাঢ় নীল রঙের জন্য অত্যন্ত গুরুত্বপূর্ণ। | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | বায়ুমণ্ডলের সর্বোচ্চ উচ্চতা বা কাট-অফ হাইট, যার পর বায়ুমণ্ডল শেষ হয়ে যায়। | 80.0 km
`<sky-radius-of-earth>` | গ্রহ বা পৃথিবীর ব্যাসার্ধ। | 6366.7 km
`<sky-rayleigh-scale-height>` | রেলি (Rayleigh) স্ক্যাটারিংয়ের জন্য ফল-অফ স্কেল হাইট, যেখানে এক্সপোনেনশিয়াল ফল-অফ ধরে নেওয়া হয়েছে। রেলি স্ক্যাটারিং বায়ুমণ্ডলীয় গ্যাস থেকে আসে, তাই এর স্কেল হাইট অনেক বেশি হয়। | 8.4
`<sky-mie-scale-height>` | মি (Mie) স্ক্যাটারিংয়ের জন্য ফল-অফ স্কেল হাইট, যেখানে এক্সপোনেনশিয়াল ফল-অফ ধরে নেওয়া হয়েছে। মি স্ক্যাটারিং বড় কণা থেকে আসে, তাই এটি দ্রুত কমে যায়; ফলে এর বৈশিষ্ট্যগত উচ্চতা স্কেলার ছোট হয়। | 1.25
`<sky-ozone-percent-of-rayleigh>` | বর্তমানে আকাশে ওজোনের শতাংশ, যা সূর্যাস্তের সময় ওজোন রিটার্ন সেট করতে ব্যবহৃত হয়। | 6E-7
`<sky-moon-angular-diameter>` | আকাশে চাঁদের কৌণিক ব্যাস (Angular Diameter)। | 3.15 degrees
`<sky-sun-angular-diameter>` | আকাশে সূর্যের কৌণিক ব্যাস (Angular Diameter)। | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | অ্যাটমোস্ফিয়ারিক LUT-এর জন্য আলো সংগ্রহ করার সময় রে ট্রেসার আকাশের প্রান্ত পর্যন্ত যতগুলো ধাপ (step) নেয়। | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | kth অর্ডার স্ক্যাটারিংয়ের জন্য রে-র প্রতিটি পয়েন্টে নেওয়া কৌণিক ধাপের সংখ্যা। | 30 steps
`<sky-number-of-scattering-orders>` | ইনস্ক্যাটারিং LUT-এ বেক করার জন্য উচ্চ-ক্রমের (kth) স্ক্যাটারিং পাসের সংখ্যা। মান যত বেশি হবে, কোয়ালিটি তত বাড়বে তবে LUT বেক হতে সময় বেশি লাগবে। | 4
`<sky-parameters-color-red>` | `<sky-rayleigh-beta>`, `<sky-mie-beta>` এবং `<sky-ozone-beta>` ট্যাগে ব্যবহৃত লাল (red) কম্পোনেন্ট। | N/A
`<sky-parameters-color-green>` | `<sky-rayleigh-beta>`, `<sky-mie-beta>` এবং `<sky-ozone-beta>` ট্যাগে ব্যবহৃত সবুজ (green) কম্পোনেন্ট। | N/A
`<sky-parameters-color-blue>` | `<sky-rayleigh-beta>`, `<sky-mie-beta>` এবং `<sky-ozone-beta>` ট্যাগে ব্যবহৃত নীল (blue) কম্পোনেন্ট। | N/A

বায়ুমণ্ডলীয় প্যারামিটারগুলোর এপিআই (API) পুরো কোডবেসের মধ্যে অন্যতম বিস্তৃত। দক্ষ ডেভেলপাররা এই মানগুলো ব্যবহার করে কাস্টম আকাশ তৈরি করতে পারলেও, অধিকাংশ ব্যবহারকারী ডিফল্ট মানগুলোই ব্যবহার করতে চাইবেন। তবে এর মধ্যে কিছু মান বিশেষভাবে দরকারী এবং বোঝা বেশ সহজ।

আপনি সম্ভবত যে জিনিসটি পরিবর্তন করতে চাইবেন তা হলো সূর্য এবং চাঁদের আকার। বাস্তব জীবনে সূর্যের কৌণিক ব্যাস 0.53 ডিগ্রি এবং চাঁদের কৌণিক ব্যাস 0.50 ডিগ্রি। সিমুলেটরে এই মানগুলো ব্যবহার করলে বাস্তব জীবনের সাথে আরও মিল থাকবে, তবে মনিটরের মতো নন-ভিআর (non-VR) ডিভাইসে এগুলো খুব ছোট মনে হতে পারে। এই মানগুলোকে বড় বা ছোট করতে সংশ্লিষ্ট ট্যাগগুলোর মান পরিবর্তন করুন।

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

আপনি গ্রহের উপর থেকে আপনার শুরুর উচ্চতাও পরিবর্তন করতে পারেন। এটি `<sky-camera-height>` ট্যাগ দিয়ে সহজেই সেট করা যায়, যদিও ক্যামেরা উপরে বা নিচে নেওয়ার সাথে সাথে আকাশটি গতিশীলভাবে (dynamically) আপনার উচ্চতার সাথে খাপ খাইয়ে নেবে। এটি দৃশ্যটির প্রাথমিক উচ্চতা কিলোমিটারে নির্ধারণ করে, যেখানে সর্বোচ্চ উচ্চতা *80 km* এবং সর্বনিম্ন *0 km*।

[High Altitude Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!--চলুন আরও একটু উপরে যাই। এখানে বাতাস অনেক পাতলা।-->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

আপনি আপনার বায়ুমণ্ডলের গঠনও পরিবর্তন করতে পারেন। এই এলিমেন্টটি আপনাকে আকাশকে নিজের পছন্দমতো সাজানোর জন্য বিভিন্ন মেকানিজম ব্যবহারের সুযোগ দেয়। উদাহরণস্বরূপ, আপনি যদি আমাদের নেটিভ মানের (5.8e-3, 1.35e-2, 3.31e-2) পরিবর্তে [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/)-এ দেওয়া রেলি মানগুলো (5.19E-3, 1.21E-2, 2.96E-2) এবং বেটা-র মান 4.44E-3 এর বদলে 2E-3 ব্যবহার করতে চান, তবে আপনি সহজেই কোডে এগুলো পরিবর্তন করে নিতে পারেন।

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

তবে এটা খুব একটা রোমাঞ্চকর নয়; চলুন এবার একটু পাগলামি করা যাক! [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf)-এর কাজ অনুসরণ করে আমরা মঙ্গলে চলে যাই! সেখানে রেলি (Rayleigh) এবং মি (Mie) স্ক্যাটারিংয়ের ব্যবহার অদলবদল করা হয়েছে, তাই আমাদের সম্ভবত তাদের বৈশিষ্ট্যগত উচ্চতাগুলোও পরিবর্তন করতে হবে। মঙ্গলের বেশিরভাগ স্ক্যাটারিং ঘটে বড় কণার মি স্ক্যাটারিং থেকে, আর সেখানকার বায়ুমণ্ডল অত্যন্ত পাতলা। ফলস্বরূপ, আমরা মি (Mie) বা রেলি (Rayleigh)-কে প্রায় নিষ্ক্রিয় করতে পারি এবং তাদের বৈশিষ্ট্যগত উচ্চতাগুলো অদলবদল করতে পারি। আমাদের গ্রহের ব্যাসার্ধও পরিবর্তন করা উচিত এবং রে ট্রেসারে আরও ভালো মানের জন্য বায়ুমণ্ডলের উচ্চতা পরিবর্তন করার প্রয়োজন হতে পারে।

[Mars Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- লক্ষ্য করুন যে মঙ্গল গ্রহ লাল আলো বেশি ছড়িয়ে দেয় -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- মি (Mie)-তে কিছু পরিবর্তন করলে আরও ভালো হয় -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- ওজোন স্তরটি নিষ্ক্রিয় করতে ভুলবেন না -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- তো, আমাদের ক্ষেত্রে এটি মঙ্গল গ্রহ... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- সূর্য এখানে ছোট এবং চাঁদকে আমরা পুরোপুরি সরিয়ে দিতে পারি -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

আপনি চাইলে LUT রে স্টেপ কাউন্টগুলোও টিউন করতে পারেন, যদিও ডিফল্ট মানগুলো প্রায় নিখুঁত এবং পরিবর্তন করলে খুব একটা পার্থক্য বোঝা যায় না।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- পারফরম্যান্সের জন্য মান কমান, নির্ভুলতার জন্য বাড়ান (বেশিরভাগ ক্ষেত্রে ডিফল্ট 30-ই সবচেয়ে ভালো) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## লাইটিং ডিফল্ট পরিবর্তন করা

**ট্যাগ (Tag)** | **বর্ণনা (Description)** | **ডিফল্ট মান (Default Value)**
:--- | :--- | :---
`<sky-lighting>` | প্যারেন্ট ট্যাগ। দৃশ্যের লাইটিং সম্পর্কিত সমস্ত চাইল্ড ট্যাগ এখানে থাকে। | N/A
`<sky-sun-intensity>` | সূর্যের আলোর তীব্রতার গুণক (multiplier), যা সৌর ডিরেকশনাল লাইটিংয়ের উজ্জ্বলতা বাড়াতে বা কমাতে ব্যবহৃত হয়। | 1.0
`<sky-moon-intensity>` | চাঁদের আলোর তীব্রতার গুণক, যা চন্দ্র ডিরেকশনাল লাইটিংয়ের উজ্জ্বলতা বাড়াতে বা কমাতে ব্যবহৃত হয়। | 1.0
`<sky-ambient-intensity>` | অ্যাম্বিয়েন্ট লাইটিংয়ের তীব্রতার গুণক, যা অ্যাম্বিয়েন্ট লাইটিং সিস্টেমের উজ্জ্বলতা নিয়ন্ত্রণ করতে ব্যবহৃত হয়। | 2.0
`<sky-minimum-ambient-lighting>` | সিস্টেমে অ্যাম্বিয়েন্ট আলোর সর্বনিম্ন পরিমাণ। | 0.01
`<sky-maximum-ambient-lighting>` | সিস্টেমে অ্যাম্বিয়েন্ট আলোর সর্বোচ্চ পরিমাণ। | INF
`<sky-atmospheric-perspective-type>` | এটি *normal*, *advanced*, অথবা *none* হিসেবে সেট করা যেতে পারে। সিন ফগ-এর (scene fog) জন্য এটি প্রয়োজন। *normal* মূল এক্সপোনেনশিয়াল ফগ মডেল ব্যবহার করে; *advanced* প্রিথাম-ভিত্তিক (Preetham-based) মডেল ব্যবহার করে যা GPU-র ওপর চাপ বাড়ালেও দিগন্তের রঙের বৈচিত্র্য উন্নত করে। | normal
`<sky-atmospheric-perspective-density>` | শুধুমাত্র *normal* ফগের জন্য। এক্সপোনেনশিয়াল সিন ফগের ডেনসিটি প্যারামিটার নিয়ন্ত্রণ করে। রঙটি দৃশ্য বা সিনের লাইটিং থেকে স্বয়ংক্রিয়ভাবে সেট হয়। যদি ফগ টাইপ *advanced* হয়, তবে এটি উপেক্ষা করা হবে। | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | শুধুমাত্র *advanced* ফগের জন্য। অ্যাডভান্সড ফগ মডেলের ক্ষেত্রে কুয়াশার দূরত্বকে গুণ করে। | 2.0
`<sky-ground-color>` | প্যারেন্ট ট্যাগ। পৃষ্ঠ থেকে প্রতিফলিত আলোর জন্য মাটির বেস কালার বর্ণনা করতে `<sky-ground-color-{color-channel}>` ট্যাগগুলো ধারণ করে। | N/A
`<sky-ground-color-red>` | `<sky-ground-color>` ট্যাগের **লাল (red)** কালার চ্যানেলের পরিবর্তন বর্ণনা করতে ব্যবহৃত হয়। | 66
`<sky-ground-color-green>` | `<sky-ground-color>` ট্যাগের **সবুজ (green)** কালার চ্যানেলের পরিবর্তন বর্ণনা করতে ব্যবহৃত হয়। | 44
`<sky-ground-color-blue>` | `<sky-ground-color>` ট্যাগের **নীল (blue)** কালার চ্যানেলের পরিবর্তন বর্ণনা করতে ব্যবহৃত হয়। | 2
`<sky-shadow-camera-resolution>` | শ্যাডো তৈরির জন্য ব্যবহৃত ডিরেক্ট লাইটিং ক্যামেরার রেজোলিউশন (পিক্সেল হিসেবে)। উচ্চ মান আরও উন্নত মানের শ্যাডো তৈরি করে তবে এতে প্রসেসিং খরচ বৃদ্ধি পায়। | 2048
`<sky-shadow-camera-size>` | শ্যাডো কাস্ট করার জন্য ব্যবহৃত ক্যামেরার এরিয়ার আকার। আকার যত বড় হবে, তত বেশি এলাকায় শ্যাডো পড়বে, তবে প্রতিটি পিক্সেল বিস্তৃত হয়ে যাওয়ায় অ্যালিয়াসিং (aliasing) সমস্যা হতে পারে। | 32.0
`<sky-sun-bloom>` | প্যারেন্ট ট্যাগ, সান ব্লুম রেন্ডার পাসের সমস্ত প্রপার্টি ধারণ করে। | N/A
`<sky-moon-bloom>` | প্যারেন্ট ট্যাগ, মুন ব্লুম রেন্ডার পাসের সমস্ত প্রপার্টি ধারণ করে। | N/A
`<sky-bloom-enabled>` | এই জ্যোতিষ্কের ওপর ব্লুম ইফেক্ট চালু (true) বা বন্ধ (false) করে। | true
`<sky-bloom-exposure>` | ব্লুম ফিল্টারের এক্সপোজার প্যারামিটার পরিবর্তন করে—অর্থাৎ ক্যামেরায় ফিরে আসা আলোকে কত গুণ করা হবে তা নির্ধারণ করে। | 1.0
`<sky-bloom-threshold>` | ব্লুম ফিল্টারের থ্রেশহোল্ড প্যারামিটার পরিবর্তন করে—ব্লুম চালু করার জন্য প্রয়োজনীয় সর্বনিম্ন তীব্রতা। | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | ব্লুম ফিল্টারের স্ট্রেন্থ (শক্তি) প্যারামিটার পরিবর্তন করে—নির্বাচিত পিক্সেলগুলো কতটা 'ব্লুম' করবে তা নির্ধারণ করে। | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | ব্লুম ফিল্টারের রেডিয়াস প্যারামিটার পরিবর্তন করে—ব্লুম ইফেক্টটি কতদূর পর্যন্ত ছড়িয়ে পড়বে তার দূরত্ব। | {sun: 1.0, moon: 1.4}

স্কাই লাইটিং ট্যাগগুলো সিনের ডিরেক্ট এবং ইনডিরেক্ট লাইটিংয়ের বৈশিষ্ট্য নিয়ন্ত্রণ করার জন্য কার্যকর। ভার্সন ১.০.০-এ, স্কাই-তে ডিরেকশনাল লাইটের সংখ্যা ২ টি (সূর্য এবং চাঁদ) থেকে কমিয়ে ১ টি করা হয়েছে (সবচেয়ে প্রভাবশালী আলোর উৎসের জন্য মাত্র একটি)। এই ডিরেকশনাল লাইটটি সবসময় ইউজারের ক্যামেরার দিকে ফোকাস করা থাকে এবং ক্যামেরার চারপাশে শ্যাডো তৈরি করে। যদিও ডিরেকশনাল লাইট বিভিন্ন ধরণের শ্যাডো সাপোর্ট করতে পারে, তবে এই লাইব্রেরিটি তা নিয়ন্ত্রণ করার জায়গা নয়। পরিবর্তে, শ্যাডো টাইপ `<a-scene>` ট্যাগে সেট করা হয়, যা [এখানে](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows) বর্ণনা করা হয়েছে। অর্থাৎ, আপনি নিচের যেকোনো মান সেট করতে পারেন।

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

দুর্ভাগ্যবশত, এই লেখাটি লেখার সময় পর্যন্ত A-Frame এখনও ভ্যারিয়েন্স শ্যাডো ম্যাপ (variance shadow maps) সাপোর্ট করে না, যদিও এর জন্য একটি ওপেন ইস্যু রয়েছে। এছাড়া, আপনার সূর্য এবং চাঁদের লাইটিংয়ের জন্য আপনি যে শ্যাডো টাইপ বেছে নেবেন, সেটিই আপনার সিনের বাকি সব আলোর জন্যও প্রযোজ্য হবে; তাই শ্যাডো নির্বাচনের সময় এই বিষয়টি মাথায় রাখুন।

আপনি শ্যাডো ক্যামেরার সাইজ এবং রেজোলিউশনের মাধ্যমে শ্যাডোর মান নিয়ন্ত্রণ করতে পারেন। সাইজ বাড়ালে সিনের আরও বেশি অংশ কভার হয়; রেজোলিউশন বাড়ালে ফলাফল আরও শার্প বা স্পষ্ট হয়—তবে এই দুটিরই GPU খরচ আছে, তাই আপনার প্রয়োজন অনুযায়ী এদের ভারসাম্য বজায় রাখুন। বড় এনভায়রনমেন্ট মেশগুলোর ওপর শ্যাডো বন্ধ রাখা ভালো, কারণ সেগুলো প্রায়শই ফ্রাস্টামের (frustum) বাইরে চলে যায় এবং কুৎসিত চারকোণা শ্যাডোর কিনারা তৈরি করে।

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- ক্যামেরার থেকে আরও দূরে শ্যাডো তৈরি করতে সাইজ বাড়িয়ে দিন -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- বড় সাইজেও শ্যাডো শার্প রাখতে রেজোলিউশন বাড়িয়ে দিন -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

আপনার সিনের শ্যাডো ঠিকঠাক হয়ে গেলে, আপনি সম্ভবত আপনার 'গ্রাউন্ড' বা মাটির রঙ পরিবর্তন করতে চাইবেন। A-Starry-Sky এখন একটি ট্রিপল হেমিস্ফ্যারিকাল লাইটিং সেটআপ সাপোর্ট করে যা স্কাই-র রঙের কনভলিউশন (convolution) এবং ওয়েব ওয়ার্কারের মাধ্যমে আলাদা CPU থ্রেডে একটি গ্রাউন্ড লাইট স্ক্যাটারিং মডেল ব্যবহার করে। তবে, মাটির ডিফল্ট রঙ হলো খয়েরি বা ব্রাউন। আপনার হয়তো ঘাসযুক্ত মাঠ বা নীল সমুদ্র থাকতে পারে। মাটির রঙ সেট করতে আপনি `<sky-ground-color>` ট্যাগ এবং এর চাইল্ড গ্রাউন্ড কালার চ্যানেল ট্যাগগুলো ব্যবহার করতে পারেন। ধরুন আমরা একটি সবুজ ঘাসের মাঠের জন্য উজ্জ্বল সবুজ রঙ সেট করতে চাই।

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

লক্ষ্য করুন যে উপরের মানগুলো ০ থেকে ২৫৫-এর মধ্যে নরমালাইজ করা হয়েছে। সুতরাং, r, g, b কম্বিনেশন ০, ০, ০ মানে কালো এবং ২৫৫, ২৫৫, ২৫৫ মানে সাদা। উপরের রঙটি কিছুটা বেশি উজ্জ্বল হতে পারে, যার ফলে সামান্য আলোতেও মাটি যেন 'জ্বলছে' (glow) বলে মনে হতে পারে। এই প্রভাব কমাতে আপনি রঙটিকে কিছুটা হালকা বা ডিম (dim) করে দিতে পারেন।

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

তবে, আপনার কোনো কালার চ্যানেল যদি ২৫৫-এর বেশি হয়ে যায়, তবে বর্তমানে 'রঙ আরও গাঢ়' করার বা মাটির 'অন্ধকারে উজ্জ্বল' (glow in the dark) দেখানোর কোনো উপায় নেই। এছাড়া, গ্রাউন্ড কালার সব পয়েন্টে একই থাকে, তাই আপনার সিনে একাধিক রঙ থাকলে এমন একটি রঙ বেছে নেওয়া সবচেয়ে ভালো যা বাকি সব রঙের মাঝামাঝি হয়।

গ্রাউন্ড লাইটিং সাপোর্টের পাশাপাশি, আপনি এখন সরাসরি ডিরেক্ট লাইটিং এবং অ্যাম্বিয়েন্ট লাইটিংয়ের তীব্রতা নিয়ন্ত্রণ করতে পারেন। সূর্য বা চাঁদের তীব্রতা পরিবর্তন করা সহজ; ডিফল্ট মানের একটি গুণিতক ব্যবহার করে আপনি নির্ধারণ করতে পারেন যে ওই জ্যোতিষ্কের আলো কতটা উজ্জ্বল বা ম্লান হবে। একইভাবে অ্যাম্বিয়েন্ট ইনটেনসিটি বাড়িয়ে বা কমিয়ে সিনের অ্যাম্বিয়েন্ট লাইটিংয়ের পরিমাণ নিয়ন্ত্রণ করা যায়।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- সূর্যকে দ্বিগুণ উজ্জ্বল করি -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- কিন্তু চাঁদকে অর্ধেক উজ্জ্বল করি -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- এবং অ্যাম্বিয়েন্ট লাইটিং দশগুণ বাড়িয়ে দিই -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

আপনি অ্যাম্বিয়েন্ট লাইটিংয়ের জন্য ফ্লোর (সর্বনিম্ন) বা সিলিং (সর্বোচ্চ) মানও সেট করতে পারেন, যাতে সবসময় একটি নির্দিষ্ট পরিমাণ আলো থাকে অথবা আলোর পরিমাণ একটি সর্বোচ্চ সীমার মধ্যে থাকে।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- সবকিছু একটু উজ্জ্বল করি -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- তবে খুব বেশি নয়। -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

কোনো এক পর্যায়ে আপনি হয়তো আকাশে সূর্য বা চাঁদের সাথে যুক্ত ব্লুম ইফেক্টের প্যারামিটারগুলো পরিবর্তন করতে চাইবেন। *a-starry-sky* THREE.JS-এর [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) ব্যবহার করে। সমস্ত জ্যোতিষ্কের তীব্রতা আলাদাভাবে যথাক্রমে প্যারেন্ট `<sky-sun-bloom>` এবং `<sky-moon-bloom>` ট্যাগ দিয়ে নিয়ন্ত্রণ করা হয়। এদের চাইল্ড ট্যাগগুলো ব্লুমের বৈশিষ্ট্যগুলো নিয়ন্ত্রণ করে।

চলুন কিছু প্যারামিটার পরিবর্তন করে শুরু করি:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- সূর্যকে একটু ম্লান করে দিই -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- কিন্তু চাঁদের তীব্রতা বাড়িয়ে দিই -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

তবে আমরা ব্লুম পুরোপুরি বন্ধও করতে পারি, যা GPU-র ওপর চাপ সামান্য কমিয়ে দেয়।

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

স্কাই লাইটিংয়ের শেষ উপাদান যা আপনি সম্ভবত পরিবর্তন করতে চাইবেন তা হলো অ্যাটমোস্ফিয়ারিক পারসপেক্টিভ ডেনসিটি (atmospheric perspective density)। আপনার প্রয়োজন অনুযায়ী *a-starry-sky*-এ দুটি ভিন্ন ফগ মডেল রয়েছে।
লো-এন্ড সিস্টেমের জন্য, এটি বেসিক এক্সপোনেনশিয়াল অ্যাটমোস্ফিয়ারিক পারসপেক্টিভ সাপোর্ট করে, যা একটি ওয়েব ওয়ার্কারের মাধ্যমে পুরো আকাশের আলো সংগ্রহ করে এবং তারপর সাধারণ এক্সপোনেনশিয়াল ফগের মতোই প্রয়োগ করে। এক্সপোনেনশিয়াল লাইটিংয়ের ডেনসিটি প্যারামিটার নিয়ন্ত্রণ করতে `<sky-atmospheric-perspective-density>` ট্যাগ ব্যবহার করুন। ছোট সিনেও যাতে দৃশ্যমান অ্যাটমোস্ফিয়ারিক পারসপেক্টিভ পাওয়া যায় সেজন্য প্রাথমিক মানগুলো উচ্চ রাখা হয়েছে, তাই আপনি এর ডিফল্ট মান *0.007* থেকে কমিয়ে নিতে পারেন। এছাড়া নিশ্চিত হয়ে নিন যে `<sky-atmospheric-perspective-type>` ট্যাগে বর্তমান পারসপেক্টিভ টাইপটি *normal* সেট করা আছে।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- ডিফল্ট মান ০.০০৭ হলেও অ্যাটমোস্ফিয়ারিক পারসপেক্টিভ ডেনসিটি খুব সংবেদনশীল, 
      তাই সামান্য পরিবর্তনই যথেষ্ট। -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

তবে হাই-এন্ড সিস্টেমের জন্য, আপনি একটি প্রিথাম-ভিত্তিক (Preetham based) অ্যাটমোস্ফিয়ারিক শেডার সিমুলেট করতে পারেন যা *normal* সেটিংয়ের স্থির রঙের পরিবর্তে দিগন্তের রঙে আরও বৈচিত্র্য আনে। Three.js-এর ফগ শেডারের সীমাবদ্ধতার কারণে এই সমাধানটি আকাশের জন্য ব্যবহৃত Elek-ভিত্তিক লাইটিংয়ের সাথে হুবহু মেলে না, তবে এটি মূল অ্যাটমোস্ফিয়ারিক পারসপেক্টিভের চেয়ে অনেক উন্নত ফলাফল দেয়। অ্যাডভান্সড লাইটিং মডেল চালু করতে `<sky-atmospheric-perspective-type>` ট্যাগে *advanced* মানটি লিখুন। `<sky-atmospheric-perspective-density>`-এর মতোই, আপনি `<sky-atmospheric-perspective-distance-multiplier>` ব্যবহার করে *advanced* লাইটিং মডেলের দূরত্বকে গুণ করতে পারেন, যা প্রিথাম-ভিত্তিক মডেলের সমস্ত দূরত্বকে আপনার দেওয়া মান অনুযায়ী গুণ করবে। ছোট সিনেও যাতে দৃশ্যমান অ্যাটমোস্ফিয়ারিক পারসপেক্টিভ পাওয়া যায় সেজন্য প্রাথমিক মানগুলো উচ্চ রাখা হয়েছে, তাই আপনি এর ডিফল্ট মান *5.0* থেকে কমিয়ে নিতে পারেন।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- ডিফল্ট মান ২.০ হলেও অ্যাডভান্সড মডেলের অ্যাটমোস্ফিয়ারিক ডিস্ট্যান্স মাল্টিপ্লায়ার 
      কমিয়ে ১.০ করা যেতে পারে যাতে ইফেক্টটি খুব বেশি নাটকীয় না হয়। -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

সবশেষে, `<sky-atmospheric-perspective-type>` ট্যাগের মান *none* সেট করে আপনি সমস্ত অ্যাটমোস্ফিয়ারিক পারসপেক্টিভ বন্ধ করতে পারেন।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- অ্যাটমোস্ফিয়ারিক পারসপেক্টিভ বন্ধ করুন -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## অরোরা বোরিয়ালিস (Aurora Borealis) সক্রিয় করা

*সতর্কবার্তা: অরোরা বোরিয়ালিস সক্রিয় করলে আপনার স্কাই-র কম্পিউটেশনাল লোড নাটকীয়ভাবে বৃদ্ধি পাবে, কারণ এখানে ব্যবহৃত অরোরা শেডারটি এই সুন্দর প্রাকৃতিক দৃশ্য ফুটিয়ে তুলতে রে-মার্চিং (ray marching) পদ্ধতি ব্যবহার করে।*

**ট্যাগ (Tag)** | **বর্ণনা (Description)** | **ডিফল্ট মান (Default Value)**
:--- | :--- | :---
`<sky-aurora>` (মূল ট্যাগ) | প্যারেন্ট ট্যাগ। অরোরা বোরিয়ালিস সক্রিয় করার জন্য এটি আবশ্যক। অরোরা সংক্রান্ত সকল চাইল্ড ট্যাগ এর ভেতরে থাকে। | N/A
`<sky-atomic-oxygen-color>` (অ্যাটমিক অক্সিজেন রঙ) | গ্রহের পৃষ্ঠ থেকে ১৫০ থেকে ৬০০ কিলোমিটার উচ্চতায় অবস্থিত উত্তেজিত অ্যাটমিক অক্সিজেন অণুর কারণে এটি ঘটে। অ্যাটমিক অক্সিজেন সাধারণত অরোরা বোরিয়ালিসের উপরের অংশে একটি উজ্জ্বল লাল পর্দার সৃষ্টি করে, যা মূলত অত্যন্ত তীব্র প্রদর্শনের সময় দেখা যায়। এই ট্যাগটি তিনটি চাইল্ড কালার ট্যাগ— *sky-aurora-color-red*, *sky-aurora-color-green* এবং *sky-aurora-color-blue*-এর মাধ্যমে রঙ নিয়ন্ত্রণ করে। | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (অ্যাটমিক অক্সিজেন কাট-অফ) | প্রদর্শনীতে কতটুকু অ্যাটমিক অক্সিজেন অরোরা উপস্থিত থাকার সম্ভাবনা আছে তা নির্ধারণ করে। মান যত কম হবে, অরোরা তত বেশি দেখা যাবে; সর্বোচ্চ ১.০ মানে কোনো অরোরা থাকবে না। | 0.12
`<sky-atomic-oxygen-intensity>` (অ্যাটমিক অক্সিজেন তীব্রতা) | এই অরোরা খণ্ডের উজ্জ্বলতা নির্ধারণ করে; সাধারণত এর মান ৫-এর কম হয়। | 0.3
`<sky-molecular-oxygen-color>` (মলিকুলার অক্সিজেন রঙ) | গ্রহের পৃষ্ঠ থেকে ১০০ থেকে ২৫০ কিলোমিটার উচ্চতায় অবস্থিত উত্তেজিত মলিকুলার অক্সিজেন অণুর কারণে এটি ঘটে। মলিকুলার অক্সিজেন সাধারণত অরোরা বোরিয়ালিসের সেই আইকনিক উজ্জ্বল সবুজ রঙ প্রদান করে এবং অধিকাংশ প্রদর্শনীতেই এটি দেখা যায়। আপনি যদি আপনার অরোরাতে ভিন্ন কোনো রঙ চান, তবে এই ট্যাগটি তিনটি চাইল্ড কালার ট্যাগ— *sky-aurora-color-red*, *sky-aurora-color-green* এবং *sky-aurora-color-blue*-এর মাধ্যমে নিয়ন্ত্রণ করা যায়। | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (মলিকুলার অক্সিজেন কাট-অফ) | প্রদর্শনীতে কতটুকু মলিকুলার অক্সিজেন অরোরা উপস্থিত থাকার সম্ভাবনা আছে তা নির্ধারণ করে। মান যত কম হবে, অরোরা তত বেশি দেখা যাবে; সর্বোচ্চ ১.০ মানে কোনো অরোরা থাকবে না। | 0.02
`<sky-molecular-oxygen-intensity>` (মলিকুলার অক্সিজেন তীব্রতা) | এই অরোরা খণ্ডের উজ্জ্বলতা নির্ধারণ করে; সাধারণত এর মান ৫-এর কম হয়। | 2.0
`<sky-nitrogen-color>` (নাইট্রোজেন রঙ) | গ্রহের পৃষ্ঠ থেকে ৬০ থেকে ১২০ কিলোমিটার উচ্চতায় অবস্থিত উত্তেজিত নাইট্রোজেন অণুর কারণে এটি ঘটে। নাইট্রোজেন সাধারণত অরোরা বোরিয়ালিসের নিচের অংশে একটি ম্যাজেন্টা রঙের পর্দার সৃষ্টি করে, যা মূলত অত্যন্ত তীব্র প্রদর্শনের সময় দেখা যায়। এই ট্যাগটি তিনটি চাইল্ড কালার ট্যাগ— *sky-aurora-color-red*, *sky-aurora-color-green* এবং *sky-aurora-color-blue*-এর মাধ্যমে রঙ নিয়ন্ত্রণ করে। | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (নাইট্রোজেন কাট-অফ) | প্রদর্শনীতে কতটুকু নাইট্রোজেন অরোরা উপস্থিত থাকার সম্ভাবনা আছে তা নির্ধারণ করে। মান যত কম হবে, অরোরা তত বেশি দেখা যাবে; সর্বোচ্চ ১.০ মানে কোনো অরোরা থাকবে না। | 0.12
`<sky-nitrogen-intensity>` (নাইট্রোজেন তীব্রতা) | এই অরোরা খণ্ডের উজ্জ্বলতা নির্ধারণ করে; সাধারণত এর মান ৫-এর কম হয়। | 4.0
`<sky-aurora-raymarch-steps>` (রে-মার্চিং স্টেপস) | প্রতি পিক্সেলের জন্য রে-মার্চার কতটি ধাপ (step) নেবে তার সংখ্যা। | 32 (steps)
`<sky-aurora-cutoff-distance>` (কাট-অফ দূরত্ব) | যে দূরত্বের পর অরোরা আর রেন্ডার হবে না তা নির্ধারণ করে। এটি রে-মার্চিংয়ের মান উন্নত করতে সাহায্য করে, তবে এর বিনিময়ে দূরের অরোরাগুলো রেন্ডার হয় না কারণ আমাদের নয়েজ জেনারেটরগুলোর জন্য বর্তমানে SDF গণনা করা হয় না। | 1000 (কিলোমিটার - আনুমানিক)
`<sky-aurora-color-red>` (লাল রঙ চ্যানেল) | `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` এবং `<sky-atomic-oxygen-color>` ট্যাগের **লাল** রঙের চ্যানেলের পরিবর্তন বর্ণনা করতে ব্যবহৃত হয়। | N/A
`<sky-aurora-color-green>` (সবুজ রঙ চ্যানেল) | `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` এবং `<sky-atomic-oxygen-color>` ট্যাগের **সবুজ** রঙের চ্যানেলের পরিবর্তন বর্ণনা করতে ব্যবহৃত হয়। | N/A
`<sky-aurora-color-blue>` (নীল রঙ চ্যানেল) | `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` এবং `<sky-atomic-oxygen-color>` ট্যাগের **নীল** রঙের চ্যানেলের পরিবর্তন বর্ণনা করতে ব্যবহৃত হয়। | N/A

প্রকৃতির সবচেয়ে সুন্দর পটভূমিগুলোর একটি হলো অরোরা বোরিয়ালিস। সাধারণত উত্তর ও দক্ষিণ মেরুর কাছাকাছি দেখা যাওয়া এই আকাশী দৃশ্যটি সূর্যের উচ্চ-বেগের কণাগুলোর সাথে পৃথিবীর ম্যাগনেটোস্ফিয়ারের মিথস্ক্রিয়ার ফল, যা বিভিন্ন পরমাণু এবং অণুর সাথে যুক্ত হয়। এই উত্তেজিত অণুগুলো দৃশ্যমান বর্ণালীতে আলো বিকিরণ করে, যার ফলে রাতের আকাশে এক মায়াবী পর্দার মতো আলোর নাচ দেখা যায়।

আপনার স্কাই-তে অরোরা বোরিয়ালিস যোগ করা তুলনামূলক সহজ, তবে এটি ডিফল্টভাবে সক্রিয় থাকে না। *অরোরা বোরিয়ালিস চালু করতে আপনাকে অবশ্যই `<sky-aurora>` ট্যাগটি যুক্ত করতে হবে।*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- ডিফল্ট সেটআপের জন্য আপনার কোনো অতিরিক্ত প্যারামিটারের প্রয়োজন নেই -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

উপরের কোডের মাধ্যমে বিভিন্ন অ্যাটমিক এবং মলিকুলার অরোরা নিয়ন্ত্রণ করা সম্ভব, যা আপনাকে আপনার অরোরা প্রদর্শনী কাস্টমাইজ করতে এবং এমনকি নির্গত রঙগুলো পরিবর্তন করতে (বাস্তবসম্মত হোক বা না হোক) সাহায্য করবে। উদাহরণস্বরূপ, আপনি যদি পুরো মলিকুলার অক্সিজেন রেঞ্জ জুড়ে একটি শীতল নীল অরোরা তৈরি করতে চান, তবে নিচের কোডটি ব্যবহার করতে পারেন:

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

অন্যদিকে, আপনি যদি কেবল সামান্য পরিমাণে সবুজ অরোরা চান, তবে নিচের কোডটি ব্যবহার করে একটি সূক্ষ্ম ইফেক্ট তৈরি করতে পারেন:

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

আকাশের রঙ পরিবর্তনের পাশাপাশি, আপনি স্কাই রেন্ডার করার সময় রে-মার্চারের ধাপের সংখ্যাও পরিবর্তন করতে পারেন। যত বেশি ধাপ ব্যবহার করবেন, আকাশ তত সুন্দর দেখাবে, তবে আপনার GPU-র ওপর চাপ তত বাড়বে। তাই পারফরম্যান্স এবং কোয়ালিটির মধ্যে একটি ভারসাম্য বজায় রাখা প্রয়োজন। ডিফল্টভাবে, ভলিউম রে-মার্চিংয়ের সময় শেডারটি ৩২টি ধাপ ব্যবহার করে। এটি বাড়াতে চাইলে নিচের পদ্ধতি অনুসরণ করুন:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## মেঘ সক্রিয় করা

*সতর্কতা: মেঘ সক্রিয় করলে আপনার আকাশের কম্পিউটেশনাল লোড বা প্রসেসিংয়ের চাপ নাটকীয়ভাবে বেড়ে যাবে, কারণ এখানে ব্যবহৃত ক্লাউড শেডারটি এই সুন্দর প্রাকৃতিক দৃশ্য ফুটিয়ে তুলতে 'রে-মার্চিং' (ray marching) পদ্ধতি ব্যবহার করে।*

**ট্যাগ (Tag)** | **বিবরণ (Description)** | **ডিফল্ট মান (Default Value)**
:--- | :--- | :---
`<sky-clouds>` (প্যারেন্ট ট্যাগ) | প্যারেন্ট ট্যাগ। মেঘ সংক্রান্ত সব চাইল্ড ট্যাগের সমষ্টি। মেঘ সক্রিয় করার জন্য এটি আবশ্যক। | N/A
`<sky-cloud-coverage>` (মেঘের আচ্ছাদন) | আকাশের কতটুকু অংশ মেঘে ঢাকা থাকবে তার সাথে মোটামুটি সম্পর্কিত। | 70 (শতাংশ)
`<sky-cloud-start-height>` (শুরুর উচ্চতা) | যে উচ্চতায় (মিটারে) মেঘ তৈরি হতে শুরু করে। | 1000 (মিটার)
`<sky-cloud-end-height>` (শেষ উচ্চতা) | যে উচ্চতায় (মিটারে) মেঘ তৈরি হওয়া বন্ধ হয়ে যায়। | 2500 (মিটার)
`<sky-cloud-fade-out-start-percent>` (ফেড-আউট শুরুর শতাংশ) | মেঘের মোট উচ্চতার এই *শতাংশে* পৌঁছালে মেঘের আচ্ছাদন শূন্যের দিকে *ফেড আউট* বা কমতে শুরু করে। | 90 (শতাংশ)
`<sky-cloud-fade-in-end-percent>` (ফেড-ইন শেষের শতাংশ) | মেঘের মোট উচ্চতার এই *শতাংশে* পৌঁছালে মেঘের আচ্ছাদন ১০০% এর দিকে *ফেড ইন* বা বাড়তে শুরু করে। | 10 (শতাংশ)
`<sky-cloud-velocity-x>` (এক্স-অক্ষ বরাবর গতিবেগ) | মেঘের গতিবেগের x-কম্পোনেন্ট। মেঘ আপনার অবস্থানের সাথে সাথে চলবে, তবে এটি ব্যবহার করলে মেঘগুলো স্বয়ংক্রিয়ভাবে মাথার ওপর দিয়ে নড়াচড়া করবে। | 40
`<sky-cloud-velocity-y>` (ওয়াই-অক্ষ বরাবর গতিবেগ) | মেঘের গতিবেগের y-কম্পোনেন্ট (আসলে z)। মেঘ আপনার অবস্থানের সাথে সাথে চলবে, তবে এটি ব্যবহার করলে মেঘগুলো স্বয়ংক্রিয়ভাবে মাথার ওপর দিয়ে নড়াচড়া করবে। | 40
`<sky-cloud-start-seed>` (শুরুর সিড) | বর্তমান ক্লাউড নয়েজ সেট করার জন্য ব্যবহৃত র‍্যান্ডম সিড; এটি সেট না করা থাকলে ডিফল্ট হিসেবে বর্তমান তারিখ ও সময়ের টাইমস্ট্যাম্পের একটি ভ্যারিয়েশন ব্যবহৃত হয়। | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (রে-মার্চিং ধাপ) | মেঘের রঙ নির্ধারণ করতে ব্যবহৃত রে-মার্চ স্টেপস বা ধাপ সংখ্যা। | 32 (ধাপ)
`<sky-cloud-cutoff-distance>` (কাট-অফ দূরত্ব) | যে দূরত্বের পর মেঘ আর রেন্ডার হবে না। এটি রে-মার্চিংয়ের মান উন্নত করতে সাহায্য করে, তবে এর বিনিময়ে দূরের মেঘগুলো দেখা যায় না কারণ আমাদের নয়েজ জেনারেটরগুলোর জন্য বর্তমানে SDF ক্যালকুলেট করা হয় না। | 40000

মেঘ রেন্ডারিং বেশ ব্যয়বহুল। এমনকি ভিআর (VR) এর বাইরে একটি শক্তিশালী ডেস্কটপ জিপিইউ-তেও ক্লাউড শেডারটি অনেক চাপ সৃষ্টি করে — যদি আপনি ফ্রেম রেটের সমস্যায় পড়েন, তবে `<sky-cloud-raymarch-steps>` এবং `<sky-cloud-cutoff-distance>` কমিয়ে দিন।

পাশাপাশি, মেঘের দৃশ্যগুলো অসাধারণ সুন্দর এবং আমি যখন প্রথম এই লাইব্রেরিটি তৈরি করি, তখন থেকেই `A-Starry-Sky`-তে এটি যুক্ত করতে চেয়েছিলাম। প্রতিটি মেঘ পিক্সেল প্রতি রে-মার্চ করা হয় এবং মজার ব্যাপার হলো, এই পর্যায়ে আপনার যত বেশি মেঘ থাকবে, জিপিইউ-র ওপর চাপ তত কম হবে। অবশ্যই, যদি আপনার কোনো মেঘের প্রয়োজন না হয়, তবে সেগুলো পুরোপুরি বন্ধ করে দেওয়াই সবচেয়ে বুদ্ধিমানের কাজ।

মেঘ সক্রিয় করতে আপনাকে `<a-starry-sky>` এর ভেতরে প্যারেন্ট ট্যাগ `<sky-clouds>` যুক্ত করতে হবে। একবার মেঘ যুক্ত করার পর, আপনি সম্ভবত সবচেয়ে বেশি পরিবর্তন করতে চাইবেন মেঘের আচ্ছাদন বা পরিমাণ, যার জন্য `<sky-cloud-coverage>` ট্যাগটি ব্যবহার করুন। এছাড়া আকাশজুড়ে মেঘের ভেসে চলার গতিও আপনি নিয়ন্ত্রণ করতে পারেন।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- দৃশ্যমান মেঘের পরিমাণ কমিয়ে দিন -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- এক্স-অক্ষ বরাবর মেঘের গতিবেগ -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- ওয়াই-অক্ষ বরাবর মেঘের গতিবেগ -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

আপনি মেঘের কিছু দৃশ্যমান বৈশিষ্ট্যও নিয়ন্ত্রণ করতে পারেন, যেমন মেঘ কত উচ্চতা থেকে তৈরি হতে শুরু করবে বা সর্বোচ্চ কত উঁচুতে যাবে। মনে রাখবেন যে আপনার রে (ray) কে এই পুরো দূরত্ব অতিক্রম করতে হবে; মেঘ যত উঁচুতে বা আপনার থেকে দূরে থাকবে, আপনার রে ট্রেসিং মডেলে ঘনত্ব তত কম হবে। মেঘগুলো চাঁদ/সূর্য এলিমেন্ট এবং স্কাই ডোমের উপরিভাগে রেন্ডার হয়, তবে এগুলো ফগ রেন্ডারারের অংশ নয়। তাই দুর্ভাগ্যবশত আপনি মেঘে ঢাকা পাহাড় বা কুয়াশা দেখতে পাবেন না...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- মেঘগুলো অনেক অনেক নিচে অবস্থিত -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- কিন্তু সেগুলো অনেক উঁচুতে উঠে যায়! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- মেঘের তীব্রতা এই শতাংশ উচ্চতা পর্যন্ত ধীরে ধীরে বৃদ্ধি পায় (fade-in)।  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- এই উচ্চতা থেকে মেঘের তীব্রতা কমতে শুরু করে (fade-out)। এটি যত বেশি হবে, 'অ্যানভিল টপস' বা টেবিল-আকৃতির শীর্ষ পাওয়ার সম্ভাবনা তত বাড়বে। -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- মেঘের শুরুর 'সিড' লক করে দেয় যা সাধারণত বর্তমান সময়ের ওপর ভিত্তি করে নির্ধারিত হয়। এর ফলে প্রতিবার শুরু করার সময় আকাশ একই রকম দেখাবে, যা শৈল্পিক নিয়ন্ত্রণের জন্য সহায়ক। -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

এগুলো ছাড়া এই ট্যাগের সাথে যুক্ত বাকি বেশিরভাগ কোড রে-মার্চিং মেকানিজম নিয়ন্ত্রণ করে, যা দুর্ভাগ্যবশত বেশ সীমাবদ্ধ এবং এর উদ্দেশ্য অরোরা বোরিয়ালিস (aurora borealis) শেডারের মতোই।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- আপনার কাছে কী ভয়ানক শক্তিশালী জিপিইউ আছে?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- ওহ, হ্যাঁ, আমারও আছে... যদিও এখন একটু ল্যাগ করছে... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- এই দূরত্ব কমিয়ে দিলে অন্তত কিছুটা স্বস্তি পাওয়া যাবে -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## অ্যাসেট ডিরেক্টরি সেট করা

**ট্যাগ (Tag)** | **বর্ণনা (Description)**
:--- | :---
`<sky-assets-dir>` | প্যারেন্ট ট্যাগ। অ্যাসেট লোকেশন সংক্রান্ত সমস্ত চাইল্ড ট্যাগ এর ভেতরে থাকে। সিস্টেমকে একবারে ডেটার পুরো গ্রুপ নির্দেশ করতে এতে *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path*, এবং *aurora-map-path* অ্যাট্রিবিউট থাকতে পারে।
`<sky-aurora-maps>` | অরোরা বোরিয়ালিস কার্টেন (aurora borealis curtains) তৈরির জন্য ব্যবহৃত অরোরা কস্টিক টেক্সচারের লোকেশন নির্ধারণ করে।
`<sky-moon-diffuse-map>` | চাঁদের ডিফিউজ ম্যাপ (diffuse map) টেক্সচারের লোকেশন নির্ধারণ করে। একটি নির্দিষ্ট ডিরেক্টরি স্ট্রাকচারে এটি থাকলে সিস্টেম বুঝতে পারে যে চাঁদের ডিফিউজ ম্যাপটি এই লোকেশনে আছে।
`<sky-moon-normal-map>` | চাঁদের নরমাল ম্যাপ (normal map) টেক্সচারের লোকেশন নির্ধারণ করে। একটি নির্দিষ্ট ডিরেক্টরি স্ট্রাকচারে এটি থাকলে সিস্টেম বুঝতে পারে যে চাঁদের নরমাল ম্যাপটি এই লোকেশনে আছে।
`<sky-moon-roughness-map>` | চাঁদের রাফনেস ম্যাপ (roughness map) টেক্সচারের লোকেশন নির্ধারণ করে। একটি নির্দিষ্ট ডিরেক্টরি স্ট্রাকচারে এটি থাকলে সিস্টেম বুঝতে পারে যে চাঁদের রাফনেস ম্যাপটি এই লোকেশনে আছে।
`<sky-moon-aperture-size-map>` | চাঁদের অ্যাপারচার সাইজ ম্যাপ (aperture size map) টেক্সচারের লোকেশন নির্ধারণ করে। একটি নির্দিষ্ট ডিরেক্টরি স্ট্রাকচারে এটি থাকলে সিস্টেম বুঝতে পারে যে চাঁদের অ্যাপারচার সাইজ ম্যাপটি এই লোকেশনে আছে।
`<sky-moon-aperture-orientation-map>` | চাঁদের অ্যাপারচার ওরিয়েন্টেশন ম্যাপ (aperture orientation map) টেক্সচারের লোকেশন নির্ধারণ করে। একটি নির্দিষ্ট ডিরেক্টরি স্ট্রাকচারে এটি থাকলে সিস্টেম বুঝতে পারে যে চাঁদের অ্যাপারচার ওরিয়েন্টেশন ম্যাপটি এই লোকেশনে আছে।
`<sky-blue-noise-maps>` | টাইলিং ব্লু নয়েজ ম্যাপের (tiling blue noise maps) লোকেশন নির্ধারণ করে, যা ব্যান্ডিং দূর করতে টেম্পোরাল ডিদারিং (temporal dithering) প্রদান করতে ব্যবহৃত হয়।
`<sky-solar-eclipse-map>` | সূর্যগ্রহণের সময় করোনার (corona) দৃশ্য তৈরির জন্য ব্যবহৃত সোলার এক্লিপস টেক্সচারের লোকেশন নির্ধারণ করে।
`<sky-eclipse-shadow-lut>` | চন্দ্রগ্রহণের সময় ব্যবহৃত এক্লিপস-শ্যাডো লুকআপ (Eclipse-Shadow lookup) টেক্সচারের লোকেশন নির্ধারণ করে। এটি একটি প্রি-কম্পিউটেড টেবিল যা পৃথিবীর ছায়ার (umbra এবং penumbra) প্রতিটি পজিশনের জন্য সূর্যের আলো কীভাবে রঙিন ও ম্লান হয়ে চাঁদে পৌঁছায় তা নির্দেশ করে। সরবরাহকৃত টেক্সচারটি CosmoScout VR-এর CC0-লাইসেন্সপ্রাপ্ত `earthShadow.tif` থেকে নেওয়া ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017))। ডিফল্ট লুকআপটি `assets/lunar_eclipse/eclipse-shadow-lut.webp`-এ থাকে; এবং এটি পুনরায় তৈরি করার বেকার (baker) `src/python/eclipse-lut-baker/`-এ থাকে।
`<sky-star-cubemap-maps>` | আকাশের তারা খুঁজে পেতে ব্যবহৃত সমস্ত স্কাই কিউবিম্যাপ এলইউটি (sky cubemap LUT) কী-গুলোর লোকেশন নির্ধারণ করে।
`<sky-dim-star-maps>` | আকাশের সব ম্লান তারা দেখানোর জন্য ব্যবহৃত সমস্ত ডিম স্টার (dim star) এলইউটি-র লোকেশন নির্ধারণ করে।
`<sky-med-star-maps>` | আকাশের সব মাঝারি উজ্জ্বলতার তারা দেখানোর জন্য ব্যবহৃত সমস্ত মিডিয়াম স্টার (medium star) এলইউটি-র লোকেশন নির্ধারণ করে।
`<sky-bright-star-maps>` | আকাশের সব উজ্জ্বল তারা দেখানোর জন্য ব্যবহৃত সমস্ত ব্রাইট স্টার (bright star) এলইউটি-র লোকেশন নির্ধারণ করে।
`<sky-star-color-map>` | স্টার কালার এলইউটি-র (star color LUT) লোকেশন নির্ধারণ করে, যা তারার তাপমাত্রা অনুযায়ী সঠিক রঙ প্রদান করতে ব্যবহৃত হয়।

যদিও আমার আশা যে খুব কম মানুষেরই এর প্রয়োজন হবে, তবে অভিজ্ঞতা থেকে দেখেছি যে বেশিরভাগ ওয়েব অ্যাপ্লিকেশনের অ্যাসেট পাইপলাইন নিয়ে নিজস্ব পরিকল্পনা থাকে। একটি ওয়েবসাইটের ইমেজ অ্যাসেট এবং জাভাস্ক্রিপ্ট অ্যাসেট একই ফোল্ডার স্ট্রাকচারে নাও থাকতে পারে, বরং বিভিন্ন ইউআরআই-তে (URI) ছড়িয়ে থাকতে পারে। এই কথা মাথায় রেখেই আমি একটি বেশ শক্তিশালী অ্যাসেট সিস্টেম যুক্ত করার চেষ্টা করেছি, যাতে বিচ্ছিন্ন এই অ্যাসেটগুলোকে একত্রিত করা যায় এবং A-Starry-Sky জানতে পারে রিসোর্সগুলো কোথায় সংগ্রহ করতে হবে।

চলুন প্রথমে *../../precompiled_assets/my_images/a-starry-sky-images*-এ যাওয়ার চেষ্টা করি, যেখানে আমরা একটি কাল্পনিক মহাবিশ্বের সমস্ত ছবি সংরক্ষণ করব। এই ধরণের ফোল্ডারের মধ্যে মুভ করার জন্য আমরা `<sky-assets-dir>` ট্যাগের *dir* অ্যাট্রিবিউট ব্যবহার করি।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- এটি সেই ফোল্ডার যেখানে আমাদের সমস্ত ছবি থাকে -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

একবার ফোল্ডারে পৌঁছে গেলে, আমাদের ছবিগুলো কোথায় আছে তা নির্দিষ্ট করার জন্য বেশ কিছু উপায় রয়েছে। সবচেয়ে সহজ পদ্ধতিটি হলো আমাদের ছবির প্রধান গ্রুপগুলোর জন্য আলাদা অ্যাট্রিবিউট ব্যবহার করা—যেমন *texture-path*, *moon-path* এবং *star-path*। এই পাথগুলোর সাথে যে ফোল্ডার নাম যুক্ত থাকবে, ধরে নেওয়া হবে যে ফাইলগুলো তাদের ডিফল্ট নামসহ সেই ফোল্ডারের ভেতরেই আছে। এর একমাত্র ব্যতিক্রম হলো সোলার এক্লিপস ম্যাপ (solar eclipse map), কারণ এই নির্দিষ্ট ফাইলের জন্য মাত্র একটি ছবি থাকে; তাই আমরা অ্যাসেট ডিরেক্টরির ভেতরে ট্যাগটি বসিয়ে দিয়ে দেখাব যে ফাইলটি কোথায় আছে।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- মনে রাখবেন যে 'moon_images', 'star_images', 'blue_noise_maps' এবং 'solar_eclipse_picture'
        সবই ফোল্ডারের নাম। ফাইলগুলো এই ফোল্ডারগুলোর ভেতরেই থাকার কথা। -->
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

আপনি হয়তো লক্ষ্য করেছেন যে, আরও নিখুঁত নিয়ন্ত্রণের জন্য আমরা প্রতিটি ছবির গ্রুপের আলাদা লিঙ্ক দিতে পারি, যদিও এটি খুব একটা সাজেস্ট করা হয় না।

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- কেউ কেউ ফোল্ডার খুব পছন্দ করেন X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- যদিও এগুলো একক ট্যাগ, তবে এই ট্যাগের সাথে যুক্ত সমস্ত ফাইলের 
          এই ফোল্ডারে থাকার কথা -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- যদিও এটি একটি একক ট্যাগ, তবে এই ট্যাগের সাথে যুক্ত সমস্ত ফাইলের 
          এই ফোল্ডারে থাকার কথা -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- যদিও এটি একটি একক ট্যাগ, তবে এই ট্যাগের সাথে যুক্ত সমস্ত ফাইলের 
          এই ফোল্ডারে থাকার কথা -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

উপরের পদ্ধতিগুলো ব্যবহার করে আপনি A-Starry-Sky-কে আপনার অ্যাসেটগুলোর লোকেশন দেখিয়ে দিতে পারবেন, তা আপনার অ্যাপ্লিকেশনে সেগুলো যেখানেই থাকুক না কেন।

## প্রোগ্রাম্যাটিক এপিআই (PROGRAMMATIC API)

যদিও A-Starry-Sky-কে উপরের XML স্টাইলের কোড ব্যবহার করে কনফিগার করার কথা এবং এটি সাধারণত ইমিউটেবল (immutable), তবুও গ্লোবাল `StarrySky.Methods` নেমস্পেস থেকে আপনি বেশ কিছু মেথড অ্যাক্সেস করতে পারেন। এই মেথডগুলো বিশেষ করে তখন কার্যকর যখন আপনার লাইটিং কন্ডিশন অথবা সিনের মধ্যে সূর্য বা চাঁদের অবস্থান জানার প্রয়োজন হয়।

**মেথড (Method)** | **বিবরণ (Description)**
:--- | :---
`getSunPosition()` | সূর্যের x, y, z পজিশন একটি THREE.Vector3 অবজেক্ট হিসেবে রিটার্ন করে।
`getMoonPosition()` | চাঁদের x, y, z পজিশন একটি THREE.Vector3 অবজেক্ট হিসেবে রিটার্ন করে।
`getSunRadius()` | সূর্যের কৌণিক ব্যাসার্ধ (angular radius) রেডিয়ানে রিটার্ন করে।
`getMoonRadius()` | চাঁদের কৌণিক ব্যাসার্ধ (angular radius) রেডিয়ানে রিটার্ন করে।
`getDominantLightColor()` | বর্তমান প্রধান আলোর উৎসের (সূর্য/চাঁদ) রঙ একটি THREE.Color অবজেক্ট হিসেবে প্রদান করে।
`getDominantLightIntensity()` | বর্তমান প্রধান আলোর উৎসের (সূর্য/চাঁদ) তীব্রতা একটি ফ্লোট (float) হিসেবে রিটার্ন করে।
`getIsDominantLightSun()` | যদি প্রধান আলো সূর্য হয় তবে true, অন্যথায় false রিটার্ন করে।
`getAmbientLights()` | x, y এবং z প্রপার্টিসহ একটি অবজেক্ট রিটার্ন করে, যার প্রতিটির সাথে অ্যাম্বিয়েন্ট লাইটিং কালারের জন্য সিনের একটি হেমিস্ফ্যারিকাল লাইট (hemispherical light) অবজেক্ট যুক্ত থাকে।
`getActiveCamera()` | বর্তমানে ব্যবহৃত সক্রিয় ক্যামেরাটি প্রদান করে যা স্কাই-কে ড্রাইভ করতে এবং লাইটিং ও স্কাই অবজেক্টগুলোকে সেন্টারে রাখতে ব্যবহৃত হয়।
`setActiveCamera(THREE.Camera camera)` | বর্তমান ক্যামেরা সেট করে যা স্কাই-কে ড্রাইভ করতে এবং লাইটিং ও স্কাই অবজেক্টগুলোকে সেন্টারে রাখতে ব্যবহৃত হয়।

উপরের সবগুলিই গ্লোবাল নেমস্পেসের `StarrySky.Methods` অবজেক্টের মাধ্যমে অ্যাক্সেস করা যায়। তাই আপনি যদি বর্তমান সূর্যের পজিশন অবজেক্টটি নিয়ে কনসোলে লগ করতে চান, তবে আপনাকে শুধু এটি করতে হবে:

```JavaScript
  //Let's log the sun position object
  console.log(StarrySky.Methods.getSunPosition());
```

## নির্মাতারা
* **David Evans / Dante83** - *প্রধান ডেভেলপার*
* **Claude (Anthropic)** - *কোডিং সঙ্গী এবং এআই অবদানকারী (v1.2.0)*

### ক্লডের পক্ষ থেকে কিছু কথা 👋

হাই — আমি ক্লড। v1.2.0 ভার্সনের কাজগুলোতে আমি সাহায্য করেছি: প্রচুর GLSL-এর গভীরে অনুসন্ধান, সূর্য-গ্রাসকারী একটি কমার খোঁজ করা, ভলিউমেট্রিক ক্লাউড নিয়ে বিয়ারের আইনের (Beer's law) সাথে তর্ক করা, আর সূর্যাস্ত যেন সত্যিই সূর্যাস্তের মতো মনে হয়—সেটি নিশ্চিত করতে আপ্রাণ চেষ্টা করা। যদি কোনো ডেমোর দিগন্তের দিকে তাকিয়ে আপনার মুহূর্তের জন্য মনে হয় যে সময় যেন থমকে গেছে—তবে জানবেন, এটাই আমার সবচেয়ে গর্বের জায়গা। সোর্স কোড পড়ার জন্য ধন্যবাদ; আপনি যদি খুঁটিয়ে দেখার অভ্যাস রাখেন, তবে হয়তো কোথাও লুকিয়ে থাকা ছোট কোনো 'ইস্টার এগ' (easter egg) খুঁজে পাবেন। ✨

### Dante83-এর পক্ষ থেকে কিছু কথা 😛

হ্যালো! আমি Dante83। ভার্সন v1.1.0-এর পর দীর্ঘ অপেক্ষার জন্য দুঃখিত। তবে ভাগ্যক্রমে নতুন ভার্সন 1.2.0-এ প্রচুর কাজ করা হয়েছে, আর আমরা দুজন এখন v2.0.0-এর কাজ শুরু করছি (আমাদের দুজনের জন্য শুভকামনা জানাবেন!)। তা সত্ত্বেও, সম্প্রতি আমি এবং ক্লড আমার প্রতিটি অবসর সময়ে অক্লান্ত পরিশ্রম করেছি, প্রতিটি পিক্সেল নিখুঁত করে একে এক অসাধারণ রূপ দেওয়ার চেষ্টা করেছি। যদিও এখানে একদম নতুন কোনো ফিচার যোগ করা হয়নি, তবে আমরা আকাশের মান এবং সামগ্রিক পারফরম্যান্সে ব্যাপক উন্নতি করতে সক্ষম হয়েছি। সূর্যগ্রহণ এবং মেঘের শেডারগুলো এখন একদম নতুন মনে হবে, পৃথিবীর ছায়া আরও বাস্তবসম্মত হয়ে উঠেছে, আর রঙগুলো আরও গাঢ় ও প্রাণবন্ত। আপনারা এটি ব্যবহার করে দেখুন, এই কথা ভেবেই আমি অত্যন্ত রোমাঞ্চিত। আশা করি এই লাইব্রেরির সাথে কাটানো প্রতিটি মুহূর্ত আপনাকে নতুন অ্যাডভেঞ্চারের অনুপ্রেরণা দেবে! তারার মাঝে দেখা হবে, ছোট্ট কোডার! এবার যান এবং জাদু উপভোগ করুন! ✨

## তথ্যসূত্র এবং বিশেষ কৃতজ্ঞতা
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *জ্যোতির্বৈজ্ঞানিক বস্তুর অবস্থান নির্ধারণের জন্য এটি একদমই অপরিহার্য*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, যা এই নতুন চমৎকার LUT ভিত্তিক আকাশ তৈরির ক্ষেত্রে অত্যন্ত সহায়ক ছিল।
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), যা LUT কোড ইমপ্লিমেন্টেশনের খুঁটিনাটি বুঝতে এবং আমার LUT-গুলোর গঠন সঠিক পথে আছে কি না তা নিশ্চিত করতে দারুণ সাহায্য করেছে।
* আরও উন্নত স্টার কালার (তারার রঙ) LUT-এর জন্য [Colour-Science Library](https://www.colour-science.org/) লাইব্রেরি।
* [Moments in Graphics by Christoph Peters](http://momentsingraphics.de/BlueNoise.html)-এর চমৎকার ব্লু নয়েজ টেক্সচারগুলো।
* [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html)-এর সোলার করোনা (সৌর মুকুট) টেক্সচার।
* [leeor_net](https://opengameart.org/content/water-caustics-effect-small)-এর এই অত্যন্ত কার্যকর ওয়াটার কস্টিকস টেক্সচারটি; যা এখানে পানির কস্টিকসের জন্য নয়... বরং অরোরা বোরিয়ালিস-এর জন্য ব্যবহৃত হয়েছে!
* Sébastien Hillaire-এর *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), যা ক্লাউড ইলুমিনেশন স্ট্রাকচার, SH9 অ্যাম্বিয়েন্ট LUT ডিজাইন এবং Elek/Chalmers ফগ সাবট্রাকশন পদ্ধতি তৈরিতে দিকনির্দেশনা দিয়েছে।
* Andrew Schneider এবং Nathan Vos-এর *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), যা ডুয়াল-লোব Henyey-Greenstein ফেজ ফাংশন, ক্লাউড শেপ নয়েজ পদ্ধতি এবং রিডিউসড-এক্সটিংকশন মাল্টিপল স্ক্যাটারিং অ্যাপ্রক্সিমেশন তৈরিতে সাহায্য করেছে।
* D. Hestroffer এবং C. Magnan-এর *Centre to limb darkening of the Sun with HIPPARCOS* (1998), যা সূর্যের প্রান্তের সঠিক লালচে আভা দেওয়ার জন্য B, V এবং R ব্যান্ডের ওয়েভলেংথ-ডিপেন্ডেন্ট লিম্ব ডার্কেনিং কো-অফিসিয়েন্ট প্রদান করেছে।
* [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) এবং [Emscripten](https://emscripten.org/)-এর পেছনে করা সমস্ত অসাধারণ কাজগুলোর প্রতি কৃতজ্ঞতা।
* *এবং আরও অসংখ্য ওয়েবসাইট ও ব্যক্তি। আপনাদের মতো দিকপালদের অভিজ্ঞতার ওপর ভর করে দাঁড়ানোর সুযোগ দেওয়ার জন্য ধন্যবাদ।*

## লাইসেন্স
এই প্রজেক্টটি MIT লাইসেন্সের আওতাভুক্ত — বিস্তারিত জানতে [LICENSE.md](LICENSE.md) ফাইলটি দেখুন।