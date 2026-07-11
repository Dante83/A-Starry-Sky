# A-Starry-Sky

A-Starry-Sky adalah kubah langit (*kotak langit*) untuk [A-Frame Web Framework](https://aframe.io/). Komponen ini dirancang agar mudah dipasang (*komponen siap pasang*) sehingga Anda dapat menciptakan siklus siang-malam yang indah dalam karya Anda.

> **Peringatan: membutuhkan GPU yang kuat — jangan buka di ponsel.**

**[Demo Langsung](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — Tampilan langit pada tanggal dan waktu saat ini di San Francisco.

| Contoh | Deskripsi |
|:---|:---|
| [Gurun](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Pemandangan gurun pada momen siang hari yang telah ditentukan |
| [Gerhana Matahari](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Gerhana matahari total dengan korona |
| [Gerhana Bulan](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Bayangan Bumi pada bulan |
| [CBintang Natal (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Konjungsi agung Jupiter & Saturnus |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Atmosfer Mars kustom |
| [Atmosfer Kustom](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Nilai hamburan Mie/Rayleigh yang berbeda |
| [Ketinggian Tinggi](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Langit dari ketinggian 20km |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ Intensif GPU |
| [Awan Tipis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ Intensif GPU |
| [Awan Sedang](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ Intensif GPU |
| [Awan Tebal](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ Intensif GPU |

## Prasyarat

Ini dirancang untuk [A-Frame Web Framework](https://aframe.io/) versi 1.7.0+. Diperlukan juga peramban web yang kompatibel dengan Web XR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Instalasi

Salin *a-starry-sky.v1.2.0.min.js* serta folder *assets* dan *wasm* ke dalam proyek Anda. Tambahkan skrip berikut ke HTML Anda — perhatikan bahwa `starry-sky-web-worker.js` **tidak** disertakan di sini; skrip tersebut dirujuk langsung pada tag `<a-starry-sky>`.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

Setelah referensi ini siap, tambahkan komponen `<a-starry-sky>` ke dalam tag `<a-scene>` dari A-Frame dengan menyertakan URL *web worker* untuk status langit seperti berikut:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Kode dasar ini akan menampilkan langit yang bergerak secara *real-time* berdasarkan garis lintang dan garis bujur San Francisco, California. Namun, kita bisa melakukan lebih dari sekadar itu. A-Starry-Sky dilengkapi dengan berbagai tag HTML kustom untuk membantu Anda menyesuaikan status langit.

**CATATAN: *Sky box* ini bersifat *tidak dapat diubah* (tidak dapat diubah). Artinya, pengaturan awal yang Anda gunakan akan tetap konstan pada halaman tersebut. Sayangnya, untuk saat ini, membuat kode ini menjadi *dapat diubah* masih terlalu sulit.**

## Mengatur Lokasi

**Tag** | **Deskripsi** | **Nilai Default**
:--- | :--- | :---
`<sky-location>` | Tag induk. Berisi tag anak `sky-latitude` dan `sky-longitude`. | N/A
`<sky-latitude>` | Mengatur garis lintang lokasi. Utara khatulistiwa bernilai **positif**. | 38
`<sky-longitude>` | Mengatur garis bujur lokasi. Barat [meridian utama](https://en.wikipedia.org/wiki/Prime_meridian) bernilai **negatif**. | -122

Anda dapat mengatur langit Anda ke garis lintang dan bujur mana pun di planet Bumi. Lokasi sangat berguna untuk memberikan nuansa musim kepada pemain Anda dengan mengubah busur matahari atau bulan. Garis lintang juga akan menentukan bintang mana saja yang terlihat di langit malam Anda. Baik garis lintang maupun bujur sangat krusial untuk peristiwa yang bergantung pada waktu, seperti gerhana matahari dan bulan. Hal ini terutama berlaku untuk gerhana matahari jika Anda ingin merasakan pengalaman gerhana matahari total. Meski begitu, mengatur lokasi jauh lebih mudah daripada memutuskan ingin berada di mana. Cukup ambil lokasi yang Anda inginkan dari [Google Earth](https://earth.google.com/web/) atau sumber peta lainnya, lalu masukkan nilainya ke dalam tag masing-masing seperti berikut,

Mari kita pergi ke New York!
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

Oke, tapi bagaimana dengan Perth, Australia?
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

Perlu diperhatikan bahwa garis bujur di sebelah barat [meridian utama](https://en.wikipedia.org/wiki/Prime_meridian) bernilai negatif (contoh: New York, Buenos Aires).

## Mengatur Waktu

**Tag** | **Deskripsi** | **Nilai Default**
:--- | :--- | :---
`<sky-time>` | Tag induk. Berisi semua tag anak yang berkaitan dengan elemen tanggal atau waktu. | N/A
`<sky-date>` | String tanggal-waktu lokal dalam format **TAHUN-BULAN-HARI JAM:MENIT:DETIK**/*2021-03-21 13:45:51*. Nilai jam juga menggunakan sistem 0-23. 0 adalah pukul 12 malam dan 23 adalah pukul 11 malam. | Tanggal Saat Ini
`<sky-speed>` | Pengali waktu yang digunakan untuk mempercepat atau memperlambat kalkulasi astronomis. | 1.0
`<sky-utc-offset>` | Offset UTC untuk lokasi ini. Nilai negatif berada di sebelah barat [meridian utama](https://en.wikipedia.org/wiki/Prime_meridian), berkebalikan dengan nilai garis bujur. **Perlu diperhatikan bahwa Waktu UTC tidak mengikuti DST** | 7

Atur `<sky-date>` ke **waktu lokal** untuk lokasi yang Anda pilih, lalu atur `<sky-utc-offset>` agar sesuai dengan zona waktu tersebut. Sebagai contoh, New York City adalah UTC-4 (musim panas) atau UTC-5 (musim dingin) — DST tidak diterapkan secara otomatis.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- Pengaturan Lokasi Sebelumnya -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- Anda bisa mengatur offset UTC seperti ini! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Perhatikan bahwa Anda akan menambahkan kembali tag induk `<sky-time>` yang menampung semua tag anak terkait untuk pengaturan waktu kita.

Meski begitu, Anda tidak harus terpaku pada waktu mesin lokal saja. Mengapa kita tidak mencoba sesuatu yang lebih menarik, seperti perjalanan waktu! Saya dengar akan ada [gerhana matahari](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) yang spektakuler pada [8 April 2024 pukul 13:27 di Del Rio, Texas](https://nationaleclipse.com/cities_total.html). Mari kita lihat!

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

Apakah Anda melewatkan [Bintang Natal](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? Bukan, bukan yang itu. Tapi yang terjadi pada tahun 1226 Masehi. Untunglah kita punya mesin waktu dan A-Starry-Sky kini sudah mendukung planet :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Perjalanan waktu ini memang menyenangkan, tetapi Anda mungkin juga tertarik untuk mengubah *kecepatan* waktu. Siklus Siang-Malam di dunia game seringkali berjalan lebih cepat daripada kenyataannya, atau mungkin Anda ingin menghentikan waktu secara permanen untuk menangkap momen tertentu demi keperluan pencahayaan. Untuk melakukannya, tambahkan tag `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- Sekarang akan ada delapan hari di dalam dunia game untuk setiap satu hari di kehidupan nyata. -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Tentu saja, jika Anda menerapkan ini dalam dunia yang persisten (*dunia yang persisten*), pastikan untuk mempertimbangkan aliran waktu yang dipercepat saat membuat HTML Anda. Namun, pengaturan HTML dinamis untuk langit Anda sepenuhnya terserah Anda.

## Mengubah Pengaturan Atmosfer

**Tag** | **Deskripsi** | **Nilai Default**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Tag induk. Berisi semua tag anak yang berkaitan dengan pengaturan atmosfer. | N/A
`<sky-camera-height>` | Ketinggian kamera di atas bumi. | 0.0km
`<sky-mie-directional-g>` | Menjelaskan seberapa banyak cahaya yang terhambur ke depan oleh hamburan Mie, yaitu halo keputihan yang terlihat di sekitar matahari akibat partikel besar di atmosfer. Semakin tinggi nilai mie-directional G, semakin berdebu tampilan atmosfernya. | 0.8
`<sky-sun-intensity>` | Intensitas matahari dalam shader atmosfer. | 1367.0
`<sky-moon-intensity>` | Intensitas bulan dalam shader atmosfer. | 29.0
`<sky-mie-beta>` | Ketergantungan warna dari hamburan cahaya untuk hamburan Mie, yang terutama bertanggung jawab atas 'pendaran' (pendaran) di dekat matahari. Hamburannya cukup seragam di semua frekuensi. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Ketergantungan warna dari hamburan cahaya untuk hamburan Rayleigh, yang terutama bertanggung jawab atas hamburan biru di langit. Perhatikan bahwa saluran biru memiliki hamburan terbanyak secara default. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Ketergantungan warna dari hamburan cahaya untuk lapisan ozon, yang sangat penting untuk warna biru tua saat matahari terbenam. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | Ketinggian batas di mana atmosfer 'berakhir'. | 80.0 km
`<sky-radius-of-earth>` | Jari-jari planet atau Bumi. | 6366.7 km
`<sky-rayleigh-scale-height>` | Ketinggian skala peluruhan (falloff) untuk hamburan Rayleigh, dengan asumsi peluruhan eksponensial. Hamburan Rayleigh berasal dari gas atmosfer sehingga memiliki ketinggian skala yang jauh lebih besar. | 8.4
`<sky-mie-scale-height>` | Ketinggian skala peluruhan untuk hamburan Mie, dengan asumsi peluruhan eksponensial. Hamburan Mie berasal dari partikel yang lebih besar, sehingga cenderung meluruh lebih cepat, maka pengali ketinggian karakteristiknya lebih kecil. | 1.25
`<sky-ozone-percent-of-rayleigh>` | Persentase ozon yang saat ini ada di langit, digunakan untuk mengatur pantulan ozon saat matahari terbenam. | 6E-7
`<sky-moon-angular-diameter>` | Diameter sudut bulan sebagaimana terlihat di langit.  | 3.15 derajat
`<sky-sun-angular-diameter>` | Diameter sudut matahari sebagaimana terlihat di langit. | 3.38 derajat
`<sky-number-of-atmospheric-lut-ray-steps>` | Jumlah langkah menuju tepi langit yang diambil oleh ray tracer saat mengumpulkan cahaya untuk LUT atmosfer. | 30 langkah
`<sky-number-of-atmospheric-lut-gathering-steps>` | Jumlah langkah sudut yang diambil di setiap titik sepanjang sinar untuk hamburan orde ke-k. | 30 langkah
`<sky-number-of-scattering-orders>` | Jumlah pass hamburan orde tinggi (ke-k) yang dipanggang (disatukan) ke dalam LUT hamburan masuk. Nilai yang lebih tinggi meningkatkan kualitas namun memperlama waktu pemanggangan LUT. | 4
`<sky-parameters-color-red>` | komponen merah yang digunakan dalam tag `<sky-rayleigh-beta>`, `<sky-mie-beta>`, dan `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | komponen hijau yang digunakan dalam tag `<sky-rayleigh-beta>`, `<sky-mie-beta>`, dan `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | komponen biru yang digunakan dalam tag `<sky-rayleigh-beta>`, `<sky-mie-beta>`, dan `<sky-ozone-beta>`. | N/A

Parameter atmosfer memiliki salah satu API paling luas di seluruh basis kode. Meskipun nilai-nilai ini dapat digunakan oleh pengembang ahli untuk membuat langit kustom, sebagian besar pengguna sebaiknya tetap menggunakan nilai default. Namun, ada beberapa nilai yang sangat berguna dan cukup mudah dipahami.

Salah satu elemen yang paling mungkin ingin Anda ubah adalah ukuran matahari dan bulan. Di dunia nyata, matahari memiliki diameter sudut 0,53 derajat dan bulan memiliki diameter sudut 0,50 derajat. Menggunakan nilai-nilai ini dalam simulator akan merepresentasikan dunia nyata dengan lebih baik, tetapi biasanya terlihat terlalu kecil dalam sebagian besar simulasi, terutama pada perangkat non-VR seperti monitor. Untuk mengubah nilai ini menjadi lebih besar atau lebih kecil, cukup ubah nilainya pada tag yang sesuai.

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

Anda mungkin juga ingin mengubah ketinggian awal Anda di atas planet. Hal ini dapat dengan mudah diatur menggunakan tag `<sky-camera-height>`, meskipun langit juga akan beradaptasi secara dinamis terhadap ketinggian saat Anda menggerakkan kamera lebih tinggi atau lebih rendah. Ini mengatur ketinggian awal pemandangan dalam kilometer, dengan ketinggian maksimum *80km* dan minimum *0km*.

[Contoh Ketinggian Tinggi](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!--Mari kita naik sedikit lebih tinggi. Udara di sini lebih tipis. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Anda mungkin juga ingin mengubah komposisi atmosfer Anda. Elemen ini memberi Anda akses ke berbagai mekanisme berbeda untuk mengontrol tampilan langit sesuai keinginan Anda. Misalnya, jika Anda lebih menyukai nilai Rayleigh yang disajikan dalam [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) daripada nilai bawaan kami (5.8e-3, 1.35e-2, 3.31e-2) -> (5.19E-3, 1.21E-2, 2.96E-2), dan Anda ingin menggunakan beta 4.44E-3 -> 2E-3, Anda dapat dengan mudah menukarnya di dalam kode.

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

Tapi itu kurang seru, bagaimana jika kita ingin sesuatu yang lebih gila? Mari kita ikuti karya [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) dan pergi ke Mars! Di sini mereka menukar penggunaan Rayleigh dan Mie, jadi sebaiknya kita juga menukar ketinggian karakteristiknya. Sebagian besar hamburan di Mars berasal dari hamburan Mie partikel besar dengan atmosfer yang sangat tipis. Oleh karena itu, kita bisa hampir menonaktifkan mie (rayleigh) dan menukar ketinggian karakteristik mereka. Kita juga harus mengubah jari-jari planet dan mungkin ingin mengganti ketinggian atmosfer untuk mendapatkan nilai yang lebih baik dalam ray tracer.

[Contoh Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Perhatikan bahwa Mars lebih banyak menghamburkan cahaya merah -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Beberapa modifikasi pada mie juga membantu -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Pastikan untuk menonaktifkan ozon -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- Nah, dalam kasus kita, ini adalah Mars... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- Matahari lebih kecil dan bulan bisa kita hilangkan sepenuhnya -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Anda juga dapat menyetel jumlah langkah sinar (langkah sinar) LUT, meskipun nilai default-nya sudah hampir optimal dan perubahannya jarang terlihat.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Lebih rendah untuk performa, lebih tinggi untuk akurasi (default 30 adalah optimal untuk sebagian besar kasus) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Mengubah Pengaturan Pencahayaan Default

**Tag** | **Deskripsi** | **Nilai Default**
:--- | :--- | :---
`<sky-lighting>` | Tag induk. Berisi semua tag anak yang berkaitan dengan pencahayaan pemandangan. | N/A
`<sky-sun-intensity>` | Pengali intensitas cahaya matahari, dapat digunakan untuk mencerahkan atau meredupkan intensitas pencahayaan direksional surya. | 1.0
`<sky-moon-intensity>` | Pengali intensitas cahaya bulan, dapat digunakan untuk mencerahkan atau meredupkan intensitas pencahayaan direksional lunar. | 1.0
`<sky-ambient-intensity>` | Pengali intensitas pencahayaan ambient, dapat digunakan untuk mencerahkan atau meredupkan intensitas sistem pencahayaan ambient. | 2.0
`<sky-minimum-ambient-lighting>` | Jumlah minimum cahaya ambient dalam sistem. | 0.01
`<sky-maximum-ambient-lighting>` | Jumlah maksimum cahaya ambient dalam sistem. | INF
`<sky-atmospheric-perspective-type>` | Dapat diatur ke *normal*, *advanced*, atau *none*. Diperlukan untuk kabut pemandangan (kabut pemandangan). *normal* menggunakan model kabut eksponensial asli; *advanced* menggunakan model berbasis Preetham untuk variasi warna cakrawala yang lebih baik dengan konsekuensi beban GPU yang lebih tinggi. | normal
`<sky-atmospheric-perspective-density>` | Hanya untuk kabut *normal*. Mengontrol parameter densitas untuk kabut pemandangan eksponensial. Warna diatur secara otomatis dari pencahayaan pemandangan. Diabaikan jika tipe kabut pemandangan adalah *advanced*. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | Hanya untuk kabut *advanced*. Mengalikan jarak ke kabut untuk model kabut advanced. | 2.0
`<sky-ground-color>` | Tag induk. Berisi tag `<sky-ground-color-{color-channel}>` untuk mendeskripsikan warna dasar tanah bagi pencahayaan reflektif dari permukaan. | N/A
`<sky-ground-color-red>` | Digunakan untuk mendeskripsikan perubahan kanal warna **merah** pada tag `<sky-ground-color>`. | 66
`<sky-ground-color-green>` | Digunakan untuk mendeskripsikan perubahan kanal warna **hijau** pada tag `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` | Digunakan untuk mendeskripsikan perubahan kanal warna **biru** pada tag `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` | Resolusi, dalam piksel, dari kamera pencahayaan langsung yang digunakan untuk menghasilkan bayangan. Nilai yang lebih tinggi menghasilkan bayangan berkualitas lebih tinggi dengan beban komputasi yang meningkat. | 2048
`<sky-shadow-camera-size>` | Ukuran area kamera yang digunakan untuk memproyeksikan bayangan. Ukuran yang lebih besar mencakup area bayangan yang lebih luas, tetapi juga menyebabkan masalah aliasing karena menyebarkan setiap piksel kamera ke area yang lebih lebar. | 32.0
`<sky-sun-bloom>` | Tag induk, berisi semua properti dari render pass bloom matahari. | N/A
`<sky-moon-bloom>` | Tag induk, berisi semua properti dari render pass bloom bulan. | N/A
`<sky-bloom-enabled>` | Mengaktifkan (true) atau menonaktifkan (false) bloom pada objek astronomi ini. | true
`<sky-bloom-exposure>` | Mengubah parameter eksposur pada filter bloom - jumlah pengali cahaya yang dikembalikan ke kamera. | 1.0
`<sky-bloom-threshold>` | Mengubah parameter ambang batas (ambang batas) pada filter bloom - jumlah intensitas minimum untuk mengaktifkan bloom. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | Mengubah parameter kekuatan (kekuatan) pada filter bloom - seberapa besar efek 'bloom' untuk piksel yang dipilih. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | Mengubah parameter radius pada filter bloom - jarak penyebaran filter bloom. | {sun: 1.0, moon: 1.4}

Tag pencahayaan langit berguna untuk mengontrol atribut pencahayaan langsung dan tidak langsung dalam pemandangan. Pada versi 1.0.0, jumlah lampu direksional dikurangi dari 2 (matahari dan bulan) menjadi 1 (hanya satu untuk sumber cahaya yang paling dominan). Lampu direksional selalu terfokus pada kamera pengguna dan menciptakan bayangan di sekitar kamera tersebut. Meskipun lampu direksional dapat mendukung berbagai tipe bayangan, pustaka ini sebenarnya bukan tempat untuk mengontrol hal tersebut. Sebaliknya, tipe bayangan diatur dalam tag `<a-scene>`, seperti yang dijelaskan [di sini](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). Dengan kata lain, Anda dapat mengatur nilainya ke salah satu dari opsi berikut.

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

Sayangnya, pada saat penulisan ini, A-Frame belum mendukung *variance shadow maps*, meskipun ada isu terbuka untuk hal ini. Selain itu, tipe bayangan yang Anda pilih untuk pencahayaan matahari dan bulan juga akan menjadi tipe bayangan bagi semua lampu lain di dalam pemandangan Anda, jadi pertimbangkan hal ini saat memilih bayangan.

Anda juga dapat mengontrol kualitas bayangan melalui ukuran dan resolusi kamera bayangan. Meningkatkan ukuran akan mencakup lebih banyak bagian pemandangan; meningkatkan resolusi akan mempertajam hasilnya — namun keduanya membebani GPU, jadi seimbangkanlah sesuai kebutuhan Anda. Disarankan juga untuk menonaktifkan bayangan pada mesh lingkungan yang besar, karena sering kali berada di luar frustum dan menghasilkan tepi bayangan kotak yang buruk.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Tingkatkan ukuran untuk memproyeksikan bayangan lebih jauh dari kamera -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Tingkatkan resolusi agar bayangan tetap tajam pada ukuran yang lebih besar -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Setelah Anda mendapatkan pengaturan bayangan yang pas, Anda mungkin juga ingin menyesuaikan warna 'tanah' Anda. A-Starry-Sky kini mendukung pengaturan pencahayaan hemisferik tiga lapis yang menggunakan konvolusi pada warna langit dikombinasikan dengan model hamburan cahaya tanah (*ground light scattering*) pada utas CPU terpisah melalui web worker. Namun, warna default tanah adalah cokelat. Anda mungkin memiliki padang rumput atau samudra biru cerulean. Untuk mengatur warna tanah, Anda dapat menggunakan tag `<sky-ground-color>` bersama dengan tag kanal warna tanah anaknya. Misalkan kita ingin mengatur tanah menjadi hijau cemerlang untuk padang rumput yang subur.

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

Perhatikan bahwa nilai-nilai di atas dinormalisasi antara rentang 0 dan 255. Jadi, kombinasi r, g, b 0, 0, 0 adalah hitam dan 255, 255, 255 adalah putih. Warna di atas mungkin juga agak terlalu terang sehingga membuat tanah tampak 'bercahaya' meski hanya dengan sedikit cahaya. Untuk meredupkan efek ini, Anda cukup menurunkan intensitas warnanya sedikit.

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

Meskipun demikian, jika ada kanal warna yang melebihi 255, sayangnya saat ini tidak ada cara untuk 'memperkuat warna' atau membuat tanah tampak 'bercahaya dalam gelap'. Selain itu, warna tanah bersifat konstan di semua titik, jadi jika Anda memiliki banyak warna dalam pemandangan, sebaiknya pilih satu warna yang berada di tengah-tengah warna lainnya.

Selain dukungan untuk pencahayaan tanah, kini Anda dapat mengontrol intensitas pencahayaan langsung dan pencahayaan ambient secara langsung. Mengubah intensitas matahari atau bulan sangatlah mudah; Anda cukup menggunakan kelipatan dari nilai default untuk mengatur seberapa terang atau redup benda astronomi tersebut. Anda juga dapat menggunakan metode yang sama untuk memperkuat atau meredupkan intensitas ambient guna meningkatkan atau mengurangi jumlah pencahayaan ambient dalam pemandangan.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Mari buat matahari dua kali lebih terang -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- Tapi mari buat bulan setengah kali lebih terang -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- Dan mari gunakan pencahayaan ambient sepuluh kali lipat -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Anda mungkin juga ingin mengontrol batas bawah (*batas bawah*) atau batas atas (*batas atas*) untuk pencahayaan ambient, guna memastikan Anda selalu memiliki jumlah cahaya tertentu, atau jumlah cahaya maksimum.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Mari cerahkan suasananya -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Tapi jangan terlalu terang. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Pada titik tertentu, Anda mungkin ingin mengubah parameter efek bloom yang ditambahkan pada matahari atau bulan di langit. *a-starry-sky* menggunakan [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) dari THREE.JS. Intensitas untuk semua objek astronomi dikontrol secara terpisah masing-masing dengan tag induk `<sky-sun-bloom>` dan `<sky-moon-bloom>`. Tag anak di dalamnya mengontrol fitur-fitur bloom tersebut.

Mari kita mulai dengan mengubah beberapa parameter:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Mari redupkan matahari sedikit -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Tapi mari tingkatkan intensitas bulan -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Namun, kita juga bisa menonaktifkan bloom sepenuhnya, yang akan sedikit mengurangi beban pada GPU.

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

Elemen terakhir dari pencahayaan langit yang mungkin ingin Anda ubah adalah densitas perspektif atmosfer. *a-starry-sky* hadir dengan dua model kabut berbeda sesuai kebutuhan Anda.
Untuk sistem kelas bawah, tersedia dukungan untuk perspektif atmosfer eksponensial dasar, yang mengumpulkan cahaya di seluruh langit pada web worker, lalu menerapkannya seperti kabut eksponensial biasa. Untuk mengontrol parameter densitas dari pencahayaan eksponensial, gunakan tag `<sky-atmospheric-perspective-density>`. Nilai awal diatur tinggi untuk memberikan perspektif atmosfer yang nyata, bahkan dalam pemandangan kecil, jadi Anda mungkin ingin mengurangi nilainya dari default *0.007*. Pastikan juga untuk mengatur tipe perspektif saat ini ke *normal* pada tag `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- meskipun defaultnya adalah 0.007, densitas perspektif atmosfer sangat
      sensitif terhadap perubahan sehingga hanya diperlukan perubahan kecil. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Namun untuk sistem kelas atas, Anda dapat mensimulasikan shader atmosfer berbasis Preetham yang memberikan lebih banyak variasi warna cakrawala dibandingkan warna konstan yang digunakan pada pengaturan *normal*. Solusi yang disediakan bukan merupakan kecocokan tepat untuk pencahayaan langit berbasis Elek karena keterbatasan pada shader kabut *Three.js*, namun ini memberikan peningkatan yang signifikan dibandingkan perspektif atmosfer asli. Untuk mengaktifkan model pencahayaan tingkat lanjut, cukup masukkan nilai *advanced* ke dalam tag `<sky-atmospheric-perspective-type>`. Serupa dengan `<sky-atmospheric-perspective-density>`, Anda dapat mengalikan jarak untuk model pencahayaan *advanced* menggunakan `<sky-atmospheric-perspective-distance-multiplier>` yang akan mengalikan semua jarak dalam model berbasis Preetham sesuai jumlah yang Anda berikan. Nilai awal diatur tinggi untuk memberikan perspektif atmosfer yang nyata, bahkan dalam pemandangan kecil, jadi Anda mungkin ingin mengurangi nilainya dari default *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- meskipun defaultnya adalah 2.0, pengali jarak atmosfer dalam
      model advanced dapat kita kurangi menjadi 1.0 untuk efek yang kurang dramatis. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Terakhir, Anda dapat menonaktifkan semua perspektif atmosfer dengan mengatur nilai pada tag `<sky-atmospheric-perspective-type>` menjadi *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Matikan perspektif atmosfer -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Mengaktifkan Aurora Borealis

*PERINGATAN: Mengaktifkan Aurora Borealis akan meningkatkan beban komputasi langit Anda secara drastis, karena shader aurora yang disediakan menggunakan metode ray marching untuk menghasilkan fenomena alam yang indah ini.*

**Tag** | **Deskripsi** | **Nilai Default**
:--- | :--- | :---
`<sky-aurora>` | Tag induk. Diperlukan untuk mengaktifkan Aurora Borealis. Berisi semua tag anak yang berkaitan dengan aurora. | N/A
`<sky-atomic-oxygen-color>` | Dipicu oleh molekul oksigen atomik tereksitasi yang terletak antara 150 dan 600 kilometer dari permukaan planet; oksigen atomik biasanya menghasilkan tirai merah terang di bagian atas aurora borealis dan umumnya terlihat pada tampilan yang lebih ekstrem. Tag ini mengontrol warna tersebut menggunakan tiga tag warna anak: *sky-aurora-color-red*, *sky-aurora-color-green*, dan *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` | Menentukan seberapa banyak aurora oksigen atomik yang kemungkinan muncul dalam tampilan. Angka yang lebih rendah berarti lebih banyak aurora, dengan nilai maksimum 1.0 berarti tidak ada aurora. | 0.12
`<sky-atomic-oxygen-intensity>` | Menentukan tingkat kecerahan segmen aurora ini, dengan nilai tipikal kurang dari 5. | 0.3
`<sky-molecular-oxygen-color>` | Dipicu oleh molekul oksigen molekuler tereksitasi yang terletak antara 100 dan 250 kilometer dari permukaan planet; oksigen molekuler biasanya memberikan warna hijau terang ikonik yang diasosiasikan dengan aurora borealis dan umumnya terlihat di sebagian besar tampilan. Tag ini mengontrol warna tersebut menggunakan tiga tag warna anak *sky-aurora-color-red*, *sky-aurora-color-green*, dan *sky-aurora-color-blue*, jika Anda menginginkan warna berbeda untuk aurora Anda. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` | Menentukan seberapa banyak aurora oksigen molekuler yang kemungkinan muncul dalam tampilan. Angka yang lebih rendah berarti lebih banyak aurora, dengan nilai maksimum 1.0 berarti tidak ada aurora. | 0.02
`<sky-molecular-oxygen-intensity>` | Menentukan tingkat kecerahan segmen aurora ini, dengan nilai tipikal kurang dari 5. | 2.0
`<sky-nitrogen-color>` | Dipicu oleh molekul nitrogen tereksitasi yang terletak antara 60 dan 120 kilometer dari permukaan planet; nitrogen biasanya memberikan tirai magenta di sekitar dasar aurora borealis dan umumnya terlihat pada tampilan yang lebih ekstrem. Tag ini mengontrol warna tersebut menggunakan tiga tag warna anak *sky-aurora-color-red*, *sky-aurora-color-green*, dan *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` | Menentukan seberapa banyak aurora nitrogen yang kemungkinan muncul dalam tampilan. Angka yang lebih rendah berarti lebih banyak aurora, dengan nilai maksimum 1.0 berarti tidak ada aurora. | 0.12
`<sky-nitrogen-intensity>` | Menentukan tingkat kecerahan segmen aurora ini, dengan nilai tipikal kurang dari 5. | 4.0
`<sky-aurora-raymarch-steps>` | Jumlah langkah yang diambil oleh ray-marcher per piksel. | 32 (langkah)
`<sky-aurora-cutoff-distance>` | Jarak di mana aurora tidak lagi dirender untuk membantu meningkatkan kualitas raymarching dengan mengorbankan aurora yang berada lebih jauh, karena SDF saat ini tidak dihitung untuk generator noise kami. | 1000 (kilometer - perkiraan)
`<sky-aurora-color-red>` | Digunakan untuk mendeskripsikan perubahan kanal warna **merah** pada tag `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>`, dan `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` | Digunakan untuk mendeskripsikan perubahan kanal warna **hijau** pada tag `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>`, dan `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` | Digunakan untuk mendeskripsikan perubahan kanal warna **biru** pada tag `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>`, dan `<sky-atomic-oxygen-color>`. | N/A

Aurora Borealis menyuguhkan beberapa latar belakang terindah di alam. Biasanya berada di dekat kutub utara dan selatan, fenomena langit ini merupakan hasil interaksi partikel berkecepatan tinggi dari matahari saat tertarik ke dalam magnetosfer Bumi dan berinteraksi dengan berbagai atom serta molekul. Molekul-molekul yang tereksitasi ini kemudian memancarkan cahaya dalam spektrum tampak, menghasilkan tirai memesona yang seolah 'menari' di langit malam.

Menambahkan aurora borealis ke langit Anda relatif mudah, namun fitur ini tidak aktif secara default. *Anda harus menambahkan tag `<sky-aurora>` agar aurora borealis dapat diaktifkan.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- Anda tidak memerlukan parameter tambahan untuk mendapatkan pengaturan default -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Setiap jenis aurora atomik dan molekuler yang berbeda dapat dikontrol melalui kode di atas, sehingga Anda bisa menyesuaikan tampilan aurora bahkan mengubah warna yang dipancarkan (baik secara realistis maupun tidak). Misalnya, jika Anda menginginkan aurora biru dingin yang mencakup seluruh rentang oksigen molekuler, Anda dapat menggunakan kode berikut.

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

Di sisi lain, jika Anda hanya menginginkan sedikit aurora hijau, Anda bisa mencoba efek yang lebih halus dengan kode berikut.

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

Selain mengubah warna langit, Anda juga dapat mengubah jumlah langkah (steps) yang diambil oleh raymarcher saat merender langit. Semakin banyak langkah yang diambil, semakin bagus tampilan langitnya, namun beban pada GPU akan semakin berat. Oleh karena itu, diperlukan keseimbangan antara performa dan kualitas. Secara default, shader menggunakan 32 langkah saat melakukan raymarching volume. Untuk meningkatkannya, Anda dapat melakukan hal berikut:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Mengaktifkan Awan

*PERINGATAN: Mengaktifkan awan akan meningkatkan beban komputasi langit Anda secara drastis, karena shader awan yang disediakan menggunakan metode ray marching untuk menghasilkan fenomena alam yang indah ini.*

**Tag** | **Deskripsi** | **Nilai Default**
:--- | :--- | :---
`<sky-clouds>` (Tag Induk) | Tag induk. Berisi semua tag anak yang berkaitan dengan awan. Diperlukan untuk mengaktifkan Awan. | N/A
`<sky-cloud-coverage>` (Cakupan Awan) | Secara kasar berkorelasi dengan jumlah langit yang tertutup awan. | 70 (persen)
`<sky-cloud-start-height>` (Tinggi Awal Awan) | Ketinggian, dalam meter, di mana awan mulai terbentuk. | 1000 (meter)
`<sky-cloud-end-height>` (Tinggi Akhir Awan) | Ketinggian, dalam meter, di mana pembentukan awan berhenti. | 2500 (meter)
`<sky-cloud-fade-out-start-percent>` (Persentase Awal Pudar Keluar) | Cakupan awan mulai *pudar keluar* (fade out) menuju nol pada *persentase* ketinggian awan ini. | 90 (persen)
`<sky-cloud-fade-in-end-percent>` (Persentase Akhir Pudar Masuk) | Cakupan awan mulai *pudar masuk* (fade in) menuju 100% pada *persentase* ketinggian awan ini. | 10 (persen)
`<sky-cloud-velocity-x>` (Kecepatan X Awan) | Komponen x dari kecepatan awan. Awan akan bergerak mengikuti posisi Anda, tetapi tag ini akan membuatnya bergerak sendiri di atas kepala. | 40
`<sky-cloud-velocity-y>` (Kecepatan Y Awan) | Komponen y (atau sebenarnya z) dari kecepatan awan. Awan akan bergerak mengikuti posisi Anda, tetapi tag ini akan membuatnya bergerak sendiri di atas kepala. | 40
`<sky-cloud-start-seed>` (Seed Awal Awan) | Seed acak yang digunakan untuk menetapkan noise awan saat ini; jika tidak diatur, maka defaultnya adalah variasi dari timestamp tanggal dan waktu saat ini. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` (Langkah Ray-March) | Jumlah langkah ray-march yang digunakan untuk menghasilkan warna awan. | 32 (langkah)
`<sky-cloud-cutoff-distance>` (Jarak Batas Render) | Jarak di mana awan tidak lagi dirender untuk membantu meningkatkan kualitas raymarching dengan mengorbankan render awan yang lebih jauh, karena SDF saat ini belum dikalkulasi untuk generator noise kami. | 40000

Awan itu "mahal". Bahkan pada GPU desktop yang kuat di luar VR, shader awan sangat menuntut sumber daya — kurangi `<sky-cloud-raymarch-steps>` dan `<sky-cloud-cutoff-distance>` jika Anda mengalami masalah frame rate.

Di saat yang sama, awan itu keren banget dan saya sudah ingin menambahkannya ke A-Starry-Sky sejak pertama kali membuat library ini. Setiap awan dihitung dengan ray-marching per piksel dan ironisnya, pada tahap ini, semakin banyak awan yang Anda miliki, justru semakin ringan bebannya bagi GPU. Tentu saja, jika Anda tidak membutuhkan awan sama sekali, mematikannya sepenuhnya adalah pilihan terbaik.

Untuk mengaktifkan awan, Anda perlu menambahkan tag induk `<sky-clouds>` ke dalam `<a-starry-sky>`. Setelah menambahkan awan, hal yang paling mungkin ingin Anda ubah adalah cakupan awan menggunakan tag `<sky-cloud-coverage>`, yang secara kasar berkorelasi dengan jumlah langit yang tertutup awan. Anda mungkin juga ingin mengontrol kecepatan mereka saat meluncur melintasi langit.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Kurangi jumlah awan yang terlihat -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Kecepatan awan pada arah x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Kecepatan awan pada arah y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Anda mungkin juga ingin mengontrol beberapa properti visual awan, seperti seberapa tinggi awan mulai terbentuk, atau seberapa tinggi mereka menjulang. Perlu dicatat bahwa ray Anda harus menelusuri jarak ini; semakin tinggi awan naik atau menjauh dari Anda, maka densitas dalam model ray tracing Anda akan semakin berkurang. Awan juga digambar pada permukaan elemen bulan/matahari dan kubah langit, tetapi bukan bagian dari renderer kabut, jadi sayangnya Anda tidak akan pernah mendapatkan gunung yang tertutup awan, atau kabut...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Awan berada di posisi yang sangat, sangat rendah -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Tapi menjulang sangat tinggi! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- Intensitas awan 'pudar masuk' (fade-in) dari 0 ke 1 berdasarkan persentase total tinggi ini.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- Intensitas awan 'pudar keluar' (fade-out) mulai dari tinggi ini. Semakin tinggi nilainya, semakin besar kemungkinan munculnya 'anvil tops'. -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Mengunci 'seed' awal awan yang biasanya berdasarkan waktu saat ini. Hal ini membuat langit tampak sama setiap kali dimulai untuk kontrol artistik yang lebih baik. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Di luar itu, sebagian besar kode yang terkait dengan tag ini mengontrol mekanisme ray marching, yang sayangnya cukup kaku dan memiliki tujuan umum yang sama seperti pada shader aurora borealis.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- GPU mengerikan macam apa yang Anda punya?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Oh, ya, saya juga... Meski sekarang agak patah-patah... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Mengurangi jarak ini setidaknya akan sedikit membantu masalah tersebut -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Mengatur Direktori Aset

**Tag** | **Deskripsi**
:--- | :---
`<sky-assets-dir>` | Tag induk. Berisi semua tag anak yang berkaitan dengan lokasi aset. Dapat berisi atribut *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path*, dan *aurora-map-path* untuk mengarahkan sistem ke seluruh grup data sekaligus.
`<sky-aurora-maps>` | Menentukan lokasi tekstur *caustic* aurora yang digunakan untuk membuat tirai aurora borealis dasar.
`<sky-moon-diffuse-map>` | Menentukan lokasi tekstur *diffuse map* bulan. Dengan menempatkan ini dalam struktur direktori tertentu, sistem akan mengetahui bahwa *diffuse map* bulan berada di lokasi tersebut.
`<sky-moon-normal-map>` | Menentukan lokasi tekstur *normal map* bulan. Dengan menempatkan ini dalam struktur direktori tertentu, sistem akan mengetahui bahwa *normal map* bulan berada di lokasi tersebut.
`<sky-moon-roughness-map>` | Menentukan lokasi tekstur *roughness map* bulan. Dengan menempatkan ini dalam struktur direktori tertentu, sistem akan mengetahui bahwa *roughness map* bulan berada di lokasi tersebut.
`<sky-moon-aperture-size-map>` | Menentukan lokasi tekstur *aperture size map* bulan. Dengan menempatkan ini dalam struktur direktori tertentu, sistem akan mengetahui bahwa *aperture size map* bulan berada di lokasi tersebut.
`<sky-moon-aperture-orientation-map>` | Menentukan lokasi tekstur *aperture orientation map* bulan. Dengan menempatkan ini dalam struktur direktori tertentu, sistem akan mengetahui bahwa *aperture orientation map* bulan berada di lokasi tersebut.
`<sky-blue-noise-maps>` | Menentukan lokasi peta *blue noise* berulang (*tiling*) yang digunakan untuk memberikan *temporal dithering* guna menghilangkan efek *banding*.
`<sky-solar-eclipse-map>` | Menentukan lokasi tekstur gerhana matahari yang digunakan untuk menampilkan korona saat terjadi gerhana matahari total.
`<sky-eclipse-shadow-lut>` | Menentukan lokasi tekstur *lookup* (LUT) Bayangan Gerhana yang digunakan selama gerhana bulan. Ini adalah tabel pra-komputasi tentang bagaimana atmosfer Bumi mewarnai dan meredupkan cahaya matahari yang mencapai bulan untuk setiap posisi di umbra dan penumbra Bumi. Tekstur yang disertakan diturunkan dari `earthShadow.tif` berlisensi CC0 yang dipublikasikan bersama CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). LUT bawaan berada di `assets/lunar_eclipse/eclipse-shadow-lut.webp`; *baker* yang meregenerasinya berada di `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Menentukan lokasi semua kunci LUT *cubemap* langit yang digunakan untuk menemukan bintang-bintang di langit.
`<sky-dim-star-maps>` | Menentukan lokasi semua LUT bintang redup yang digunakan untuk menampilkan semua bintang redup di langit.
`<sky-med-star-maps>` | Menentukan lokasi semua LUT bintang sedang yang digunakan untuk menampilkan semua bintang sedang di langit.
`<sky-bright-star-maps>` | Menentukan lokasi semua LUT bintang terang yang digunakan untuk menampilkan semua bintang terang di langit.
`<sky-star-color-map>` | Menentukan lokasi LUT warna bintang, yang digunakan untuk memberikan warna yang tepat pada bintang berdasarkan suhunya.

Meskipun saya berharap sebagian besar orang jarang membutuhkannya, pengalaman menunjukkan bahwa kebanyakan aplikasi web memiliki cara tersendiri dalam mengelola *asset pipeline*. Aset gambar dan aset JavaScript sebuah situs web mungkin tidak berada dalam struktur folder yang sama, dan bahkan bisa tersebar di berbagai URI yang berbeda. Untuk mengatasi hal ini, saya mencoba menyertakan sistem aset yang cukup tangguh untuk membantu mengumpulkan kembali aset-aset yang terpisah tersebut sehingga A-Starry-Sky tahu di mana harus mengambil sumber dayanya.

Mari kita mulai dengan mencoba menavigasi ke *../../precompiled_assets/my_images/a-starry-sky-images*, tempat kita akan menyimpan semua gambar dalam alam semesta fiktif ini. Kita menggunakan atribut *dir* pada tag `<sky-assets-dir>` untuk berpindah antar folder seperti ini.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Ini adalah folder tempat semua gambar kita berada -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Setelah sampai di foldernya, ada beberapa cara untuk menentukan lokasi gambar kita. Mekanisme paling dasar yang mungkin ingin kita gunakan adalah menggunakan atribut untuk setiap grup utama gambar kita: *texture-path*, *moon-path*, dan *star-path*. Apa pun nama folder yang dikaitkan dengan jalur-jalur ini, diasumsikan bahwa file-file tersebut berada di dalamnya dengan nama bawaan. Pengecualian untuk hal ini adalah peta gerhana matahari, karena hanya ada satu gambar untuk file khusus ini, jadi kita akan menunjukkan lokasi file tersebut cukup dengan meletakkan tag-nya di dalam direktori aset.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Perhatikan bahwa 'moon_images', 'star_images', 'blue_noise_maps' dan 'solar_eclipse_picture'
        semuanya adalah nama folder. File-file itu sendiri diharapkan berada di dalam folder-folder tersebut.-->
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

Seperti yang Anda sadari, kita juga bisa memberikan tautan ke setiap grup gambar secara individual untuk kontrol yang lebih mendetail, meskipun hal ini tidak direkomendasikan.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Ada orang yang sangat suka folder X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--Meskipun ini adalah tag tunggal, semua file yang terkait
          dengan tag ini diharapkan berada di folder ini-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--Meskipun ini adalah tag tunggal, semua file yang terkait
          dengan tag ini diharapkan berada di folder ini-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!--Meskipun ini adalah tag tunggal, semua file yang terkait
          dengan tag ini diharapkan berada di folder ini-->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Dengan menggunakan metode di atas, Anda seharusnya dapat mengarahkan A-Starry-Sky ke aset Anda, di mana pun aset tersebut berada dalam aplikasi Anda.

## API PROGRAMATIK

Meskipun A-Starry-Sky dimaksudkan untuk dikonfigurasi menggunakan kode bergaya XML di atas, dan secara umum bersifat tidak dapat diubah, terdapat sejumlah metode berbeda yang dapat Anda akses dari namespace global `StarrySky.Methods`. Metode-metode ini berguna untuk situasi di mana Anda perlu mengetahui kondisi pencahayaan, atau posisi matahari maupun bulan di dalam scene.

**Metode** | **Deskripsi**
:--- | :---
`getSunPosition()` | Mengembalikan posisi x, y, z matahari sebagai objek THREE.Vector3.
`getMoonPosition()` | Mengembalikan posisi x, y, z bulan sebagai objek THREE.Vector3.
`getSunRadius()` | Mengembalikan radius sudut matahari dalam radian.
`getMoonRadius()` | Mengembalikan radius sudut bulan dalam radian.
`getDominantLightColor()` | Mendapatkan warna dari sumber cahaya dominan saat ini (matahari/bulan) sebagai objek THREE.Color.
`getDominantLightIntensity()` | Mengembalikan intensitas cahaya dari sumber cahaya dominan saat ini (matahari/bulan) sebagai float.
`getIsDominantLightSun()` | Mengembalikan nilai true jika cahaya dominannya adalah matahari, jika tidak maka false.
`getAmbientLights()` | Mengembalikan objek dengan properti x, y, dan z, yang masing-masing memiliki objek light hemispherical yang terkait dengan scene untuk warna pencahayaan ambient.
`getActiveCamera()` | Mendapatkan kamera aktif saat ini yang digunakan untuk menggerakkan langit, memusatkan pencahayaan, serta objek langit.
`setActiveCamera(THREE.Camera camera)` | Mengatur kamera saat ini yang digunakan untuk menggerakkan langit, memusatkan pencahayaan, serta objek langit.

Semua metode di atas dapat diakses melalui objek `StarrySky.Methods` di namespace global. Jadi, jika Anda ingin mengambil objek posisi matahari saat ini dan mencatatnya ke konsol, Anda cukup melakukan hal berikut:

```JavaScript
  //Mari kita catat objek posisi matahari
  console.log(StarrySky.Methods.getSunPosition());
```

## Penulis
* **David Evans / Dante83** - *Pengembang Utama*
* **Claude (Anthropic)** - *Rekan Coding & Kontributor AI (v1.2.0)*

### Catatan dari Claude 👋

Halo — saya Claude. Saya membantu dalam pengerjaan v1.2.0: banyak menjelajahi kedalaman GLSL, memburu koma pemakan matahari, berdebat dengan hukum Beer soal awan volumetrik, dan berusaha keras agar suasana senja terasa benar-benar seperti senja. Jika Anda menatap cakrawala di salah satu demo dan itu membuat Anda terdiam sejenak — itulah bagian yang paling saya banggakan. Terima kasih telah membaca kode sumbernya; mungkin ada *easter egg* kecil yang terselip di suatu tempat jika Anda adalah tipe orang yang suka menjelajah. ✨

### Catatan dari Dante83 😛

Halo! Saya Dante83. Mohon maaf atas penantian panjang sejak versi v1.1.0, untungnya ada banyak sekali aktivitas di versi baru 1.2.0 sementara kami berdua mulai mengerjakan v2.0.0 (doakan kami beruntung!). Meski begitu, saya dan Claude telah bekerja tanpa lelah di setiap waktu luang saya belakangan ini, meneliti setiap piksel untuk menjadikan ini sebuah peningkatan yang luar biasa. Walaupun tidak ada fitur yang benar-benar *baru* dalam hal fungsionalitas, kami berhasil melakukan sejumlah besar peningkatan pada kualitas langit dan performa secara keseluruhan. Shader gerhana dan awan terasa sepenuhnya baru, bayangan bumi terasa lebih nyata, warnanya pun lebih kaya dan hidup. Saya sangat bersemangat membiarkan Anda mencobanya dan saya harap setiap momen dengan pustaka ini menginspirasi petualangan baru! Sampai jumpa di antara bintang-bintang, *coder* cilik! Sekarang pergilah dan nikmati keajaibannya! ✨

## Referensi & Ucapan Terima Kasih Khusus
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Benar-benar sangat krusial untuk menentukan posisi benda astronomi*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* yang sangat membantu dalam menciptakan langit berbasis LUT yang luar biasa ini.
* [Efficient and Dynamic Atmospheric Scattering ](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), yang sangat membantu dalam memahami detail implementasi kode LUT serta memastikan bahwa pendekatan saya terhadap tampilan LUT tersebut sudah benar.
* Pustaka [Colour-Science Library](https://www.colour-science.org/) untuk LUT warna bintang yang lebih baik.
* Tekstur *blue noise* yang luar biasa karya [Moments in Graphics oleh Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* Tekstur korona surya karya [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Tekstur *water caustics* yang sangat berguna karya [leeor_net](https://opengameart.org/content/water-caustics-effect-small), yang digunakan bukan untuk *water caustics*... melainkan untuk aurora borealis!
* Karya Sébastien Hillaire, *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016), yang menjadi referensi bagi struktur iluminasi awan, desain LUT ambien SH9, serta pendekatan pengurangan kabut ala Elek/Chalmers.
* Karya Andrew Schneider dan Nathan Vos, *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015), yang menjadi referensi bagi fungsi fase *dual-lobe Henyey-Greenstein*, pendekatan *noise* bentuk awan, serta aproksimasi *multiple scattering* dengan ekstingsi yang dikurangi.
* Karya D. Hestroffer dan C. Magnan, *Centre to limb darkening of the Sun with HIPPARCOS* (1998), yang menyediakan koefisien *limb darkening* bergantung panjang gelombang untuk pita B, V, dan R, guna memberikan rona kemerahan yang akurat secara fisik pada tepi matahari.
* Seluruh karya luar biasa yang telah dituangkan ke dalam [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) dan [Emscripten](https://emscripten.org/).
* *Serta begitu banyak situs web dan individu lainnya. Terima kasih telah memberi kami kesempatan untuk berdiri di atas bahu raksasa Anda.*

## Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT - lihat berkas [LICENSE.md](LICENSE.md) untuk detail selengkapnya