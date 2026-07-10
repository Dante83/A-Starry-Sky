# A-Starry-Sky

A-Starry-Sky là một vòm trời (sky dome) dành cho [A-Frame Web Framework](https://aframe.io/). Mục tiêu của dự án là cung cấp một thành phần dễ dàng tích hợp để bạn có thể tạo ra các chu kỳ ngày đêm tuyệt đẹp trong những tác phẩm của mình.

> **Cảnh báo: yêu cầu GPU mạnh — vui lòng không mở trên điện thoại di động.**

**[Demo trực tiếp](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — Bầu trời tại ngày và giờ hiện tại ở San Francisco.

| Ví dụ | Mô tả |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | Cảnh sa mạc vào một thời điểm ban ngày cố định |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | Nhật thực toàn phần với quầng sáng (corona) |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | Bóng của Trái Đất trên Mặt Trăng |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | Sự hội tụ lớn giữa Sao Mộc và Sao Thổ |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | Bầu khí quyển Sao Hỏa tùy chỉnh |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | Các giá trị tán xạ Mie/Rayleigh khác nhau |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | Bầu trời nhìn từ độ cao 20km |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ Tiêu tốn nhiều tài nguyên GPU |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ Tiêu tốn nhiều tài nguyên GPU |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ Tiêu tốn nhiều tài nguyên GPU |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ Tiêu tốn nhiều tài nguyên GPU |

## Yêu cầu chuẩn bị

Công cụ này được xây dựng cho [A-Frame Web Framework](https://aframe.io/) phiên bản 1.7.0 trở lên. Ngoài ra, bạn cần một trình duyệt web tương thích với Web XR.

`https://aframe.io/releases/1.7.0/aframe.min.js`

## Cài đặt

Sao chép tệp *a-starry-sky.v1.2.0.min.js* cùng các thư mục *assets* và *wasm* vào dự án của bạn. Thêm các đoạn mã script sau vào HTML — lưu ý rằng `starry-sky-web-worker.js` **không** được bao gồm ở đây; thay vào đó, nó sẽ được tham chiếu trực tiếp trong thẻ `<a-starry-sky>`.

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{PATH_TO_JS_FOLDER}/wasm/interpolation-engine.js"></script>
```

Sau khi thiết lập các tham chiếu này, hãy thêm thành phần `<a-starry-sky>` vào thẻ `<a-scene>` của A-Frame và trỏ đường dẫn đến URL của sky-state web worker như sau:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

Đoạn mã cơ bản này sẽ tạo ra một bầu trời chuyển động theo thời gian thực dựa trên kinh độ và vĩ độ của thành phố San Francisco, California. Tuy nhiên, chúng ta có thể làm được nhiều hơn thế. A-Starry-Sky cung cấp một loạt các thẻ HTML tùy chỉnh để giúp bạn tùy biến trạng thái bầu trời của mình.

**LƯU Ý: Sky box này là bất biến (immutable). Điều này có nghĩa là các thiết lập ban đầu sẽ được giữ nguyên trên mỗi trang. Rất tiếc, tại thời điểm này, việc làm cho mã nguồn có thể thay đổi (mutable) là quá khó khăn.**

## Thiết lập Vị trí

**Thẻ (Tag)** | **Mô tả** | **Giá trị mặc định**
:--- | :--- | :---
`<sky-location>` | Thẻ cha. Chứa các thẻ con là vĩ độ (`sky-latitude`) và kinh độ (`sky-longitude`). | N/A
`<sky-latitude>` | Thiết lập vĩ độ của vị trí. Phía bắc xích đạo là giá trị **dương**. | 38
`<sky-longitude>` | Thiết lập kinh độ của vị trí. Phía tây [kinh tuyến gốc](https://en.wikipedia.org/wiki/Prime_meridian) là giá trị **âm**. | -122

Bạn có thể thiết lập bầu trời tại bất kỳ vĩ độ và kinh độ nào trên Trái Đất. Việc xác định vị trí giúp mang lại cảm giác về các mùa cho người chơi thông qua việc thay đổi quỹ đạo của mặt trời hoặc mặt trăng. Vĩ độ cũng sẽ quyết định những ngôi sao nào có thể nhìn thấy trên bầu trời đêm của bạn. Cả vĩ độ và kinh độ đều đóng vai trò quan trọng đối với các sự kiện phụ thuộc vào thời gian như nhật thực và nguyệt thực. Điều này đặc biệt đúng nếu bạn muốn trải nghiệm hiện tượng nhật thực toàn phần. Tuy nhiên, việc thiết lập vị trí thì dễ hơn nhiều so với việc quyết định nên đặt ở đâu. Chỉ cần lấy tọa độ bạn muốn từ [Google Earth](https://earth.google.com/web/) hoặc bất kỳ nguồn bản đồ nào khác, rồi nhập các giá trị vào các thẻ tương ứng như sau:

Cùng đến New York nào!
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

Vậy còn Perth, Úc thì sao?
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

Lưu ý rằng kinh độ ở phía tây của [kinh tuyến gốc](https://en.wikipedia.org/wiki/Prime_meridian) mang giá trị âm (ví dụ: New York, Buenos Aires).

## Thiết lập Thời gian

**Thẻ (Tag)** | **Mô tả** | **Giá trị mặc định**
:--- | :--- | :---
`<sky-time>` (Thời gian) | Thẻ cha. Chứa tất cả các thẻ con liên quan đến các yếu tố ngày hoặc giờ. | N/A
`<sky-date>` (Ngày tháng) | Chuỗi ngày-giờ địa phương theo định dạng **NĂM-THÁNG-NGÀY GIỜ:PHÚT:GIÂY**/*2021-03-21 13:45:51*. Giá trị giờ cũng dựa trên hệ thống 24 giờ (từ 0 đến 23). 0 là 12 giờ sáng và 23 là 11 giờ tối. | Ngày hiện tại
`<sky-speed>` (Tốc độ) | Hệ số nhân thời gian dùng để tăng tốc hoặc làm chậm các tính toán thiên văn. | 1.0
`<sky-utc-offset>` (Độ lệch UTC) | Độ lệch UTC cho vị trí này. Các giá trị âm nằm ở phía tây của [kinh tuyến gốc](https://en.wikipedia.org/wiki/Prime_meridian), ngược lại với giá trị kinh độ. **Lưu ý rằng giờ UTC không áp dụng giờ mùa hè (DST)** | 7

Hãy thiết lập `<sky-date>` theo **giờ địa phương** của vị trí bạn chọn, sau đó đặt `<sky-utc-offset>` sao cho khớp với múi giờ đó. Ví dụ: Thành phố New York là UTC-4 (mùa hè) hoặc UTC-5 (mùa đông) — DST không được áp dụng tự động.

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

Lưu ý rằng bạn sẽ một lần nữa thêm thẻ cha `<sky-time>`, thẻ này chứa tất cả các thẻ con liên quan đến thiết lập thời gian của chúng ta.

Nói vậy không có nghĩa là bạn chỉ được dùng giờ của máy tính hiện tại. Tại sao chúng ta không thử điều gì đó thú vị hơn, chẳng hạn như du hành thời gian nhỉ! Tôi nghe nói sẽ có một đợt [nhật thực](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) cực kỳ hấp dẫn vào lúc [1 giờ 27 phút chiều (13:27 theo hệ 24 giờ) ngày 8 tháng 4 năm 2024 tại Del Rio, Texas](https://nationaleclipse.com/cities_total.html). Cùng đi xem thử nào!

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

Bạn đã bỏ lỡ [Ngôi sao Giáng sinh](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn)? Không, không phải ngôi sao đó. Mà là ngôi sao của năm 1226 sau Công nguyên cơ. May mà chúng ta có cỗ máy thời gian và A-Starry-Sky hiện đã hỗ trợ hiển thị các hành tinh :D.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Du hành thời gian thì vui thật đấy, nhưng có lẽ bạn cũng sẽ quan tâm đến việc thay đổi *tốc độ* của thời gian. Chu kỳ Ngày-Đêm trong thế giới game thường diễn ra nhanh hơn thực tế, hoặc có thể bạn muốn dừng thời gian vĩnh viễn để ghi lại một khoảnh khắc cụ thể cho mục đích chiếu sáng. Để làm điều này, hãy thêm thẻ `<sky-speed>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- There will now be eight in-world days for every real life day.-->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

Tất nhiên, nếu bạn triển khai điều này trong một thế giới persistent (persistent world), hãy nhớ tính đến dòng thời gian tăng tốc khi tạo HTML. Tuy nhiên, việc thiết lập HTML động cho bầu trời là tùy thuộc vào bạn.

## Thay đổi Cài đặt Khí quyển

**Thẻ (Tag)** | **Mô tả** | **Giá trị mặc định**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | Thẻ cha. Chứa tất cả các thẻ con liên quan đến cài đặt khí quyển. | N/A
`<sky-camera-height>` | Độ cao của camera so với mặt đất. | 0.0km
`<sky-mie-directional-g>` | Mô tả mức độ ánh sáng bị tán xạ về phía trước bởi hiện tượng tán xạ Mie (vòng hào quang trắng quanh mặt trời do các hạt lớn trong khí quyển gây ra). Giá trị `mie-directional G` càng cao, bầu khí quyển trông càng nhiều bụi. | 0.8
`<sky-sun-intensity>` | Cường độ ánh sáng mặt trời trong shader khí quyển. | 1367.0
`<sky-moon-intensity>` | Cường độ ánh sáng mặt trăng trong shader khí quyển. | 29.0
`<sky-mie-beta>` | Sự phụ thuộc vào màu sắc của tán xạ ánh sáng đối với tán xạ Mie, thành phần chính tạo ra "quầng sáng" gần mặt trời. Tán xạ này khá đồng nhất trên tất cả các tần số. | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | Sự phụ thuộc vào màu sắc của tán xạ ánh sáng đối với tán xạ Rayleigh, thành phần chính tạo ra màu xanh lam của bầu trời. Lưu ý rằng kênh màu xanh lam (blue) có mức độ tán xạ cao nhất theo mặc định. | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | Sự phụ thuộc vào màu sắc của tán xạ ánh sáng đối với tầng ozone, yếu tố quan trọng tạo nên sắc xanh đậm lúc hoàng hôn. | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | Độ cao giới hạn mà tại đó bầu khí quyển "kết thúc". | 80.0 km
`<sky-radius-of-earth>` | Bán kính của hành tinh hoặc Trái Đất. | 6366.7 km
`<sky-rayleigh-scale-height>` | Độ cao tỷ lệ suy giảm cho tán xạ Rayleigh, giả định theo hàm mũ. Tán xạ Rayleigh đến từ các chất khí trong khí quyển nên có độ cao tỷ lệ lớn hơn nhiều. | 8.4
`<sky-mie-scale-height>` | Độ cao tỷ lệ suy giảm cho tán xạ Mie, giả định theo hàm mũ. Tán xạ Mie đến từ các hạt lớn hơn nên có xu hướng suy giảm nhanh hơn, do đó hệ số độ cao đặc trưng nhỏ hơn. | 1.25
`<sky-ozone-percent-of-rayleigh>` | Tỷ lệ phần trăm ozone hiện có trong bầu trời, được dùng để thiết lập mức phản hồi của ozone lúc hoàng hôn. | 6E-7
`<sky-moon-angular-diameter>` | Đường kính góc của mặt trăng khi nhìn từ bầu trời.  | 3.15 độ
`<sky-sun-angular-diameter>` | Đường kính góc của mặt trời khi nhìn từ bầu trời. | 3.38 độ
`<sky-number-of-atmospheric-lut-ray-steps>` | Số bước mà trình dò tia (ray tracer) thực hiện đến rìa bầu trời khi thu thập ánh sáng cho các bảng tra cứu (LUT) khí quyển. | 30 bước
`<sky-number-of-atmospheric-lut-gathering-steps>` | Số bước góc được thực hiện tại mỗi điểm dọc theo tia sáng cho tán xạ bậc k. | 30 bước
`<sky-number-of-scattering-orders>` | Số lượt tán xạ bậc cao (bậc k) được nướng (bake) vào LUT tán xạ vào trong (inscattering). Giá trị càng cao thì chất lượng càng tăng nhưng thời gian nướng LUT sẽ lâu hơn. | 4
`<sky-parameters-color-red>` | Thành phần màu đỏ được sử dụng trong các thẻ `<sky-rayleigh-beta>`, `<sky-mie-beta>` và `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-green>` | Thành phần màu xanh lá được sử dụng trong các thẻ `<sky-rayleigh-beta>`, `<sky-mie-beta>` và `<sky-ozone-beta>`. | N/A
`<sky-parameters-color-blue>` | Thành phần màu xanh lam được sử dụng trong các thẻ `<sky-rayleigh-beta>`, `<sky-mie-beta>` và `<sky-ozone-beta>`. | N/A

Các thông số khí quyển có một trong những bộ API chi tiết nhất trong toàn bộ mã nguồn. Mặc dù các giá trị này cho phép những nhà phát triển lành nghề tạo ra những bầu trời tùy chỉnh, nhưng hầu hết người dùng nên giữ nguyên các giá trị mặc định. Tuy nhiên, có một vài giá trị đặc biệt hữu ích và khá dễ hiểu.

Một trong những yếu tố bạn có thể muốn thay đổi nhất là kích thước của mặt trời và mặt trăng. Trong thực tế, mặt trời có đường kính góc là 0,53 độ và mặt trăng là 0,50 độ. Sử dụng các giá trị này trong trình mô phỏng sẽ phản ánh đúng thực tế hơn, nhưng chúng thường quá nhỏ trong hầu hết các mô phỏng, đặc biệt là trên các thiết bị không phải VR như màn hình máy tính. Để thay đổi những giá trị này lớn hơn hoặc nhỏ hơn, bạn chỉ cần điều chỉnh giá trị trong các thẻ tương ứng.

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

Bạn cũng có thể muốn thay đổi độ cao bắt đầu so với hành tinh. Điều này có thể dễ dàng thiết lập bằng thẻ `<sky-camera-height>`, mặc dù bầu trời sẽ tự động thích ứng theo độ cao khi bạn di chuyển camera lên cao hoặc xuống thấp. Thẻ này thiết lập độ cao ban đầu của cảnh tính bằng ki-lô-mét, với độ cao tối đa là *80km* và tối thiểu là *0km*.

[High Altitude Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!--Hãy lên cao hơn một chút. Không khí ở đây loãng hơn. -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Bạn cũng có thể muốn thay đổi thành phần của bầu khí quyển. Thành phần này cho phép bạn tiếp cận nhiều cơ chế khác nhau để điều khiển bầu trời theo ý muốn. Ví dụ, nếu bạn thích các giá trị Rayleigh được trình bày trong [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) thay vì các giá trị mặc định của chúng tôi (5.8e-3, 1.35e-2, 3.31e-2) -> (5.19E-3, 1.21E-2, 2.96E-2), và bạn muốn sử dụng beta là 4.44E-3 -> 2E-3, bạn có thể dễ dàng thay thế chúng trong mã nguồn.

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

Nhưng như vậy thì chưa đủ thú vị, hãy thử làm điều gì đó "điên rồ" hơn một chút. Hãy cùng dựa theo nghiên cứu [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) và bay đến sao Hỏa! Ở đây, họ hoán đổi việc sử dụng Rayleigh và Mie, vì vậy chúng ta cũng nên hoán đổi các độ cao đặc trưng của chúng. Hầu hết sự tán xạ trên sao Hỏa đến từ tán xạ Mie của các hạt lớn với một bầu khí quyển rất mỏng. Do đó, chúng ta gần như có thể vô hiệu hóa mie (rayleigh) và hoán đổi độ cao đặc trưng của chúng. Chúng ta cũng nên thay đổi bán kính hành tinh và có thể điều chỉnh độ cao khí quyển để có giá trị tốt hơn trong trình dò tia.

[Mars Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Lưu ý rằng sao Hỏa tán xạ ánh sáng đỏ nhiều hơn -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- Một vài điều chỉnh cho Mie cũng sẽ giúp ích -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- Hãy nhớ vô hiệu hóa tầng ozone -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- À, trong trường hợp này là sao Hỏa... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- Mặt trời nhỏ hơn và chúng ta có thể loại bỏ hoàn toàn mặt trăng -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

Bạn cũng có thể tinh chỉnh số bước tia của LUT, mặc dù các giá trị mặc định đã gần như tối ưu và những thay đổi hiếm khi tạo ra sự khác biệt rõ rệt.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- Thấp hơn để tăng hiệu suất, cao hơn để tăng độ chính xác (mặc định 30 là tối ưu cho hầu hết các trường hợp) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## Thay đổi các thiết lập ánh sáng mặc định

**Thẻ (Tag)** | **Mô tả** | **Giá trị mặc định**
:--- | :--- | :---
`<sky-lighting>` | Thẻ cha. Chứa tất cả các thẻ con liên quan đến ánh sáng của cảnh. | N/A
`<sky-sun-intensity>` | Hệ số nhân cường độ cho ánh sáng mặt trời, dùng để làm sáng hoặc làm tối cường độ ánh sáng hướng (directional lighting) từ mặt trời. | 1.0
`<sky-moon-intensity>` | Hệ số nhân cường độ cho ánh sáng mặt trăng, dùng để làm sáng hoặc làm tối cường độ ánh sáng hướng từ mặt trăng. | 1.0
`<sky-ambient-intensity>` | Hệ số nhân cường độ cho ánh sáng môi trường (ambient lighting), dùng để làm sáng hoặc làm tối hệ thống ánh sáng môi trường. | 2.0
`<sky-minimum-ambient-lighting>` | Lượng ánh sáng môi trường tối thiểu trong hệ thống. | 0.01
`<sky-maximum-ambient-lighting>` | Lượng ánh sáng môi trường tối đa trong hệ thống. | INF
`<sky-atmospheric-perspective-type>` | Có thể thiết lập là *normal* (bình thường), *advanced* (nâng cao), hoặc *none* (không có). Bắt buộc đối với sương mù trong cảnh. *normal* sử dụng mô hình sương mù hàm mũ nguyên bản; *advanced* sử dụng mô hình dựa trên Preetham để cải thiện sự biến đổi màu sắc ở đường chân trời, nhưng sẽ gây áp lực lớn hơn cho GPU. | normal
`<sky-atmospheric-perspective-density>` | Chỉ dành cho sương mù *normal*. Điều khiển tham số mật độ cho sương mù hàm mũ trong cảnh. Màu sắc được thiết lập tự động từ ánh sáng của cảnh. Bị bỏ qua nếu loại sương mù là *advanced*. | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | Chỉ dành cho sương mù *advanced*. Nhân khoảng cách đến vùng sương mù cho mô hình sương mù nâng cao. | 2.0
`<sky-ground-color>` | Thẻ cha. Chứa các thẻ `<sky-ground-color-{color-channel}>` để mô tả màu cơ bản của mặt đất nhằm tạo ánh sáng phản chiếu từ bề mặt. | N/A
`<sky-ground-color-red>` | Dùng để mô tả thay đổi kênh màu **đỏ** cho các thẻ `<sky-ground-color>`. | 66
`<sky-ground-color-green>` | Dùng để mô tả thay đổi kênh màu **xanh lá** cho các thẻ `<sky-ground-color>`. | 44
`<sky-ground-color-blue>` | Dùng để mô tả thay đổi kênh màu **xanh dương** cho các thẻ `<sky-ground-color>`. | 2
`<sky-shadow-camera-resolution>` | Độ phân giải (tính bằng pixel) của camera ánh sáng trực tiếp dùng để tạo bóng đổ. Giá trị càng cao thì chất lượng bóng đổ càng tốt nhưng sẽ tốn tài nguyên xử lý hơn. | 2048
`<sky-shadow-camera-size>` | Kích thước vùng camera dùng để đổ bóng. Kích thước lớn hơn giúp bao phủ diện tích đổ bóng rộng hơn, nhưng cũng gây ra hiện tượng răng cưa (aliasing) do mỗi pixel của camera bị trải rộng trên một vùng lớn hơn. | 32.0
`<sky-sun-bloom>` | Thẻ cha, chứa tất cả các thuộc tính của lượt render hiệu ứng bloom cho mặt trời. | N/A
`<sky-moon-bloom>` | Thẻ cha, chứa tất cả các thuộc tính của lượt render hiệu ứng bloom cho mặt trăng. | N/A
`<sky-bloom-enabled>` | Bật (true) hoặc tắt (false) hiệu ứng bloom trên đối tượng thiên văn này. | true
`<sky-bloom-exposure>` | Thay đổi tham số phơi sáng (exposure) của bộ lọc bloom - mức độ nhân ánh sáng trả về cho camera. | 1.0
`<sky-bloom-threshold>` | Thay đổi tham số ngưỡng (threshold) của bộ lọc bloom - cường độ tối thiểu để kích hoạt hiệu ứng bloom. | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | Thay đổi tham số cường độ (strength) của bộ lọc bloom - mức độ 'nở' (bloom) cho các pixel được chọn. | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | Thay đổi tham số bán kính (radius) của bộ lọc bloom - khoảng cách mà hiệu ứng bloom lan tỏa ra. | {sun: 1.0, moon: 1.4}

Các thẻ ánh sáng bầu trời rất hữu ích để điều khiển các thuộc tính của ánh sáng trực tiếp và gián tiếp trong cảnh. Trong phiên bản 1.0.0, số lượng đèn hướng (direction lights) đã được giảm từ 2 (mặt trời và mặt trăng) xuống còn 1 (chỉ một nguồn sáng chủ đạo nhất). Đèn hướng này luôn tập trung vào camera của người dùng và tạo bóng đổ xung quanh camera đó. Mặc dù đèn hướng có thể hỗ trợ nhiều loại bóng đổ khác nhau, nhưng thư viện này thực chất không phải là nơi để điều khiển điều đó. Thay vào đó, loại bóng đổ được thiết lập trong thẻ `<a-scene>`, như được mô tả [tại đây](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows). Cụ thể, bạn có thể thiết lập các giá trị thành bất kỳ lựa chọn nào sau đây:

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

Đáng tiếc là tại thời điểm viết tài liệu này, A-Frame vẫn chưa hỗ trợ bản đồ bóng biến thiên (variance shadow maps), mặc dù hiện có một vấn đề đang được mở để xử lý việc này. Ngoài ra, loại bóng đổ bạn chọn cho ánh sáng mặt trời và mặt trăng cũng sẽ là loại bóng đổ cho tất cả các đèn khác trong cảnh, vì vậy hãy lưu ý điều này khi lựa chọn.

Bạn cũng có thể điều khiển chất lượng bóng đổ thông qua kích thước và độ phân giải của camera đổ bóng. Tăng kích thước sẽ bao phủ nhiều phần của cảnh hơn; tăng độ phân giải sẽ làm kết quả sắc nét hơn — nhưng cả hai đều tiêu tốn tài nguyên GPU, vì vậy hãy cân bằng chúng tùy theo nhu cầu. Bạn cũng nên tắt bóng đổ trên các mesh môi trường lớn, vì chúng thường nằm ngoài hình chóp nhìn (frustum) và tạo ra cạnh bóng vuông vức mất thẩm mỹ.

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Tăng kích thước để đổ bóng xa hơn từ camera -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- Tăng độ phân giải để giữ cho bóng đổ sắc nét ở kích thước lớn hơn -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Khi bạn đã điều chỉnh bóng đổ trong cảnh vừa ý, có lẽ bạn cũng muốn điều chỉnh màu sắc của 'mặt đất'. A-Starry-Sky hiện hỗ trợ thiết lập ánh sáng bán cầu ba lớp (triple hemispherical lighting), sử dụng phép tích chập (convolution) trên các màu của bầu trời kết hợp với mô hình tán xạ ánh sáng mặt đất trên một luồng CPU riêng thông qua web worker. Tuy nhiên, màu mặc định của mặt đất là màu nâu. Bạn có thể muốn một cánh đồng cỏ hoặc một đại dương xanh ngắt. Để thiết lập màu cho mặt đất, bạn có thể sử dụng thẻ `<sky-ground-color>` cùng với các thẻ kênh màu con của nó. Giả sử chúng ta muốn đặt mặt đất thành màu xanh lá rực rỡ cho một cánh đồng cỏ tươi tốt:

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

Lưu ý rằng các giá trị trên được chuẩn hóa trong khoảng từ 0 đến 255. Vì vậy, tổ hợp r, g, b (0, 0, 0) là màu đen và (255, 255, 255) là màu trắng. Màu sắc ở ví dụ trên có thể hơi sáng, khiến mặt đất trông như 'phát sáng' dù chỉ với một chút ánh sáng nhỏ nhất. Để giảm hiệu ứng này, bạn chỉ cần làm tối màu đi một chút.

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

Tuy nhiên, nếu bất kỳ kênh màu nào vượt quá 255, hiện tại không có cách nào để 'làm đậm màu hơn' hoặc khiến mặt đất trông như 'phát sáng trong bóng tối'. Hơn nữa, màu mặt đất là hằng số tại mọi điểm, vì vậy nếu bạn có nhiều màu sắc trong cảnh, tốt nhất nên chọn một màu trung gian giữa tất cả các màu còn lại.

Ngoài việc hỗ trợ ánh sáng mặt đất, giờ đây bạn có thể trực tiếp điều khiển cường độ của ánh sáng trực tiếp và ánh sáng môi trường. Việc thay đổi cường độ của mặt trời hoặc mặt trăng rất dễ dàng, bạn chỉ cần sử dụng một bội số của giá trị mặc định để thiết lập mức độ sáng hơn hoặc tối hơn cho thiên thể đó. Bạn cũng có thể dùng phương pháp tương tự để tăng hoặc giảm cường độ ánh sáng môi trường trong cảnh.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Hãy làm mặt trời sáng gấp đôi -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- Nhưng hãy làm mặt trăng sáng chỉ bằng một nửa -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- Và tăng cường độ ánh sáng môi trường lên gấp mười lần -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Bạn cũng có thể muốn điều khiển mức sàn hoặc mức trần cho ánh sáng môi trường, để đảm bảo rằng bạn luôn có một lượng ánh sáng nhất định, hoặc không vượt quá một mức tối đa.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Hãy làm mọi thứ sáng lên -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- Nhưng đừng để quá sáng. -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Đến một lúc nào đó, bạn có thể muốn thay đổi các tham số cho hiệu ứng bloom được thêm vào mặt trời hoặc mặt trăng. *a-starry-sky* sử dụng [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) từ THREE.JS. Cường độ cho tất cả các đối tượng thiên văn được điều khiển riêng biệt thông qua các thẻ cha tương ứng là `<sky-sun-bloom>` và `<sky-moon-bloom>`. Các thẻ con của chúng sẽ điều khiển các đặc tính của hiệu ứng bloom.

Hãy bắt đầu bằng cách thay đổi một vài tham số:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Hãy làm mặt trời mờ đi một chút -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- Nhưng hãy tăng cường độ của mặt trăng -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Chúng ta cũng có thể tắt hoàn toàn hiệu ứng bloom, điều này giúp giảm tải cho GPU một chút.

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

Yếu tố cuối cùng của ánh sáng bầu trời mà bạn có thể muốn thay đổi là mật độ phối cảnh khí quyển (atmospheric perspective density). *a-starry-sky* cung cấp hai mô hình sương mù khác nhau tùy theo nhu cầu.
Đối với các hệ thống cấu hình thấp, thư viện hỗ trợ phối cảnh khí quyển hàm mũ cơ bản, thu thập ánh sáng trên toàn bộ bầu trời thông qua một web worker, sau đó áp dụng nó giống như sương mù hàm mũ thông thường. Để điều khiển tham số mật độ của ánh sáng hàm mũ, hãy sử dụng thẻ `<sky-atmospheric-perspective-density>`. Giá trị khởi tạo được đặt cao để tạo ra phối cảnh khí quyển rõ rệt ngay cả trong các cảnh nhỏ, vì vậy bạn có thể muốn giảm giá trị này xuống từ mức mặc định là *0.007*. Đồng thời, hãy đảm bảo thiết lập loại phối cảnh hiện tại là *normal* trong thẻ `<sky-atmospheric-perspective-type>`.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Mặc dù mặc định là 0.007, nhưng mật độ phối cảnh khí quyển rất nhạy cảm khi thay đổi, nên chỉ cần những điều chỉnh nhỏ. -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Tuy nhiên, đối với các hệ thống cấu hình cao hơn, bạn có thể mô phỏng một shader khí quyển dựa trên Preetham, mang lại sự đa dạng cho màu sắc đường chân trời thay vì các màu cố định như trong thiết lập *normal*. Giải pháp này không khớp hoàn toàn với ánh sáng bầu trời dựa trên Elek do những hạn chế trong shader sương mù của *Three.js*, nhưng nó mang lại cải thiện đáng kể so với phối cảnh khí quyển nguyên bản. Để kích hoạt mô hình ánh sáng nâng cao, chỉ cần nhập giá trị *advanced* vào thẻ `<sky-atmospheric-perspective-type>`. Tương tự như `<sky-atmospheric-perspective-density>`, bạn có thể nhân khoảng cách cho mô hình ánh sáng *advanced* bằng cách sử dụng `<sky-atmospheric-perspective-distance-multiplier>`, thẻ này sẽ nhân tất cả các khoảng cách trong mô hình Preetham với giá trị bạn cung cấp. Giá trị khởi tạo được đặt cao để tạo phối cảnh rõ rệt, vì vậy bạn có thể muốn giảm nó xuống từ mức mặc định là *5.0*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Mặc dù mặc định là 2.0, nhưng chúng ta có thể giảm hệ số nhân khoảng cách khí quyển trong mô hình nâng cao xuống 1.0 để hiệu ứng bớt kịch tính hơn. -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

Cuối cùng, bạn có thể tắt toàn bộ phối cảnh khí quyển bằng cách thiết lập giá trị trong thẻ `<sky-atmospheric-perspective-type>` thành *none*.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- Tắt phối cảnh khí quyển -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## Kích hoạt Cực quang (Aurora Borealis)

*CẢNH BÁO: Việc kích hoạt Cực quang sẽ làm tăng đáng kể tải tính toán cho bầu trời của bạn, vì shader cực quang đi kèm sử dụng phương pháp ray marching để tạo ra hiện tượng thiên nhiên tuyệt đẹp này.*

**Thẻ (Tag)** | **Mô tả** | **Giá trị mặc định**
:--- | :--- | :---
`<sky-aurora>` (Thẻ cha) | Thẻ cha. Bắt buộc phải có để kích hoạt Cực quang. Chứa tất cả các thẻ con liên quan đến cực quang. | N/A
`<sky-atomic-oxygen-color>` (Màu oxy nguyên tử) | Được kích hoạt bởi các nguyên tử oxy bị kích thích nằm trong khoảng từ 150 đến 600 km so với bề mặt hành tinh. Oxy nguyên tử thường tạo ra một màn đỏ rực ở phần trên của cực quang và thường xuất hiện trong những đợt hiển thị cường độ mạnh. Thẻ này điều khiển màu sắc thông qua ba thẻ màu con *sky-aurora-color-red*, *sky-aurora-color-green* và *sky-aurora-color-blue*. | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (Ngưỡng oxy nguyên tử) | Xác định mức độ xuất hiện của cực quang oxy nguyên tử trong hiển thị. Chỉ số càng thấp thì cực quang xuất hiện càng nhiều; giá trị tối đa là 1.0 tương ứng với việc không có cực quang. | 0.12
`<sky-atomic-oxygen-intensity>` (Cường độ oxy nguyên tử) | Xác định độ sáng của phân đoạn cực quang này, các giá trị thông thường sẽ nhỏ hơn 5. | 0.3
`<sky-molecular-oxygen-color>` (Màu oxy phân tử) | Được kích hoạt bởi các phân tử oxy bị kích thích nằm trong khoảng từ 100 đến 250 km so với bề mặt hành tinh. Oxy phân tử thường mang lại màu xanh lá sáng đặc trưng của cực quang và xuất hiện trong hầu hết các đợt hiển thị. Thẻ này điều khiển màu sắc thông qua ba thẻ màu con *sky-aurora-color-red*, *sky-aurora-color-green* và *sky-aurora-color-blue*, phòng trường hợp bạn muốn một màu sắc khác cho cực quang của mình. | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (Ngưỡng oxy phân tử) | Xác định mức độ xuất hiện của cực quang oxy phân tử trong hiển thị. Chỉ số càng thấp thì cực quang xuất hiện càng nhiều; giá trị tối đa là 1.0 tương ứng với việc không có cực quang. | 0.02
`<sky-molecular-oxygen-intensity>` (Cường độ oxy phân tử) | Xác định độ sáng của phân đoạn cực quang này, các giá trị thông thường sẽ nhỏ hơn 5. | 2.0
`<sky-nitrogen-color>` (Màu nitơ) | Được kích hoạt bởi các phân tử nitơ bị kích thích nằm trong khoảng từ 60 đến 120 km so với bề mặt hành tinh. Nitơ thường tạo ra một màn màu đỏ tía (magenta) quanh chân của cực quang và thường xuất hiện trong những đợt hiển thị cường độ mạnh. Thẻ này điều khiển màu sắc thông qua ba thẻ màu con *sky-aurora-color-red*, *sky-aurora-color-green* và *sky-aurora-color-blue*. | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (Ngưỡng nitơ) | Xác định mức độ xuất hiện của cực quang nitơ trong hiển thị. Chỉ số càng thấp thì cực quang xuất hiện càng nhiều; giá trị tối đa là 1.0 tương ứng với việc không có cực quang. | 0.12
`<sky-nitrogen-intensity>` (Cường độ nitơ) | Xác định độ sáng của phân đoạn cực quang này, các giá trị thông thường sẽ nhỏ hơn 5. | 4.0
`<sky-aurora-raymarch-steps>` (Số bước ray-marching) | Số bước mà trình ray-marcher thực hiện trên mỗi pixel. | 32 (bước)
`<sky-aurora-cutoff-distance>` (Khoảng cách ngắt cực quang) | Khoảng cách mà sau đó cực quang sẽ không còn được kết xuất để giúp cải thiện chất lượng raymarching, đánh đổi bằng việc không hiển thị những dải cực quang ở xa hơn do SDF hiện chưa được tính toán cho các trình tạo nhiễu (noise generators) của chúng tôi. | 1000 (km - xấp xỉ)
`<sky-aurora-color-red>` (Kênh màu đỏ) | Dùng để mô tả các thay đổi của kênh màu **đỏ** cho các thẻ `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` và `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-green>` (Kênh màu xanh lá) | Dùng để mô tả các thay đổi của kênh màu **xanh lá** cho các thẻ `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` và `<sky-atomic-oxygen-color>`. | N/A
`<sky-aurora-color-blue>` (Kênh màu xanh dương) | Dùng để mô tả các thay đổi của kênh màu **xanh dương** cho các thẻ `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` và `<sky-atomic-oxygen-color>`. | N/A

Cực quang tạo nên một trong những khung cảnh thiên nhiên tuyệt mỹ nhất. Thường xuất hiện gần hai cực Bắc và Nam, hiện tượng bầu trời này là kết quả của sự tương tác giữa các hạt vận tốc cao từ mặt trời khi chúng bị hút vào từ quyển Trái Đất và va chạm với các nguyên tử cũng như phân tử khác nhau. Những phân tử bị kích thích này sau đó phát ra ánh sáng trong phổ khả kiến, tạo nên những dải lụa mê hoặc "nhảy múa" giữa bầu trời đêm.

Việc thêm cực quang vào bầu trời tương đối dễ dàng, nhưng tính năng này không được bật theo mặc định. *Bạn phải thêm thẻ `<sky-aurora>` để kích hoạt cực quang.*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- Bạn không cần bất kỳ tham số bổ sung nào để sử dụng thiết lập mặc định -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

Mỗi loại cực quang nguyên tử và phân tử khác nhau đều có thể điều khiển được bằng mã nguồn ở trên, cho phép bạn tùy chỉnh hiển thị cực quang và thậm chí thay đổi màu sắc phát ra (dù thực tế hay không). Ví dụ, nếu bạn muốn một dải cực quang màu xanh dương lạnh lẽo bao phủ toàn bộ phạm vi oxy phân tử, bạn có thể làm như sau:

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

Mặt khác, nếu bạn chỉ muốn một lượng nhỏ cực quang màu xanh lá, bạn có thể tạo hiệu ứng tinh tế hơn với mã sau:

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

Ngoài việc thay đổi màu sắc của bầu trời, bạn cũng có thể thay đổi số bước mà raymarcher thực hiện khi kết xuất (render) bầu trời. Càng nhiều bước, hình ảnh bầu trời sẽ càng đẹp, nhưng áp lực lên GPU sẽ càng lớn. Do đó, cần có sự cân bằng giữa hiệu suất và chất lượng. Theo mặc định, shader sử dụng 32 bước khi raymarching khối thể tích. Để tăng số bước này, bạn có thể làm như sau:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## Kích hoạt Mây

*CẢNH BÁO: Việc kích hoạt mây sẽ làm tăng đáng kể khối lượng tính toán cho bầu trời của bạn, vì shader mây đi kèm sử dụng phương pháp ray marching để tạo ra hiện tượng tự nhiên tuyệt đẹp này.*

**Thẻ (Tag)** | **Mô tả** | **Giá trị mặc định**
:--- | :--- | :---
`<sky-clouds>` (Thẻ cha) | Thẻ cha. Chứa tất cả các thẻ con liên quan đến mây. Bắt buộc phải có để kích hoạt Mây. | N/A
`<sky-cloud-coverage>` (Độ bao phủ của mây) | Tương ứng với lượng mây che phủ bầu trời. | 70 (phần trăm)
`<sky-cloud-start-height>` (Độ cao bắt đầu) | Độ cao, tính bằng mét, nơi mây bắt đầu hình thành. | 1000 (mét)
`<sky-cloud-end-height>` (Độ cao kết thúc) | Độ cao, tính bằng mét, nơi mây ngừng hình thành. | 2500 (mét)
`<sky-cloud-fade-out-start-percent>` (Phần trăm bắt đầu mờ dần) | Độ bao phủ của mây bắt đầu *mờ dần* về mức 0 tại *phần trăm* độ cao này của đám mây. | 90 (phần trăm)
`<sky-cloud-fade-in-end-percent>` (Phần trăm kết thúc hiện rõ) | Độ bao phủ của mây bắt đầu *hiện rõ dần* lên mức 100% tại *phần trăm* độ cao này của đám mây. | 10 (phần trăm)
`<sky-cloud-velocity-x>` (Vận tốc trục X) | Thành phần x của vận tốc mây. Mây sẽ di chuyển theo vị trí của bạn, nhưng thẻ này khiến chúng tự di chuyển trên đầu. | 40
`<sky-cloud-velocity-y>` (Vận tốc trục Y) | Thành phần y (thực chất là z) của vận tốc mây. Mây sẽ di chuyển theo vị trí của bạn, nhưng thẻ này khiến chúng tự di chuyển trên đầu. | 40
`<sky-cloud-start-seed>` (Hạt giống khởi tạo) | Hạt giống ngẫu nhiên dùng để thiết lập nhiễu (noise) cho mây hiện tại; nếu không thiết lập, nó sẽ mặc định theo biến thể của dấu thời gian ngày giờ hiện tại. | *Date.now() % (86400 * 365)*.
`<sky-cloud-raymarch-steps>` (Số bước ray-march) | Số bước ray-march được sử dụng để tạo màu sắc cho mây. | 32 (bước)
`<sky-cloud-cutoff-distance>` (Khoảng cách ngắt) | Khoảng cách mà sau đó mây sẽ không còn được render để giúp cải thiện chất lượng raymarching, đánh đổi bằng việc không hiển thị những đám mây ở xa vì SDF hiện chưa được tính toán cho các trình tạo nhiễu của chúng tôi. | 40000

Mây tiêu tốn rất nhiều tài nguyên. Ngay cả trên một GPU máy tính để bàn mạnh mẽ khi không dùng VR, shader mây vẫn đòi hỏi khắt khe — hãy giảm `<sky-cloud-raymarch-steps>` và `<sky-cloud-cutoff-distance>` nếu bạn gặp vấn đề về tốc độ khung hình (frame rate).

Đồng thời, mây cũng cực kỳ ngầu và tôi đã muốn đưa chúng vào A-Starry-Sky kể từ khi lần đầu tạo ra thư viện này. Mỗi đám mây được ray-marched trên từng pixel và trớ trêu thay, ở giai đoạn này, bạn càng có nhiều mây thì tải trọng lên GPU lại càng nhẹ hơn. Tất nhiên, nếu bạn không muốn có mây, cách tốt nhất là tắt hoàn toàn chúng đi.

Để kích hoạt mây, bạn cần thêm thẻ cha `<sky-clouds>` vào trong `<a-starry-sky>`. Sau khi đã thêm mây, điều bạn có lẽ sẽ muốn thay đổi nhất là độ bao phủ của mây bằng thẻ `<sky-cloud-coverage>`, tương ứng với lượng mây che phủ bầu trời. Bạn cũng có thể muốn kiểm soát tốc độ của chúng khi chúng lướt qua bầu trời.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Giảm lượng mây hiển thị -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- Vận tốc của mây theo hướng x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- Vận tốc của mây theo hướng y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Bạn cũng có thể muốn kiểm soát một số thuộc tính hiển thị của mây, chẳng hạn như độ cao bắt đầu hình thành hoặc độ cao tối đa. Lưu ý rằng tia (ray) sẽ phải truy vết qua khoảng cách này; độ cao của mây càng lớn hoặc càng xa bạn, mật độ trong mô hình ray tracing sẽ càng thấp. Mây cũng được vẽ trên bề mặt của các phần tử mặt trăng/mặt trời và vòm trời, nhưng không thuộc trình render sương mù (fog renderer), vì vậy đáng tiếc là bạn sẽ không bao giờ thấy những ngọn núi hay màn sương bị mây che phủ...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Mây ở mức cực kỳ thấp -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- Nhưng lại vươn lên siêu cao! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- Cường độ của mây 'hiện rõ dần' từ 0 đến 1 theo phần trăm tổng độ cao này.  -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- Cường độ của mây bắt đầu 'mờ dần' tại độ cao này. Giá trị này càng cao, bạn càng dễ thấy các 'đỉnh mây hình đe'. -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- Khóa 'hạt giống' khởi tạo của mây (thường dựa trên ngày giờ hiện tại). Việc này giúp bầu trời xuất hiện giống hệt nhau mỗi khi bạn bắt đầu để kiểm soát tính nghệ thuật tốt hơn. -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

Ngoài những điều trên, hầu hết các mã liên quan đến thẻ này dùng để kiểm soát cơ chế ray marching, vốn khá khắt khe và có mục đích chung tương tự như trong shader cực quang (aurora borealis).

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- Bạn đang dùng loại GPU 'khủng' nào vậy?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- Ồ, đúng rồi, tôi cũng thế... Mặc dù giờ nó hơi giật một chút... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- Giảm khoảng cách này sẽ giúp cải thiện tình hình một chút -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## Thiết lập Thư mục Tài nguyên

**Thẻ (Tag)** | **Mô tả**
:--- | :---
`<sky-assets-dir>` | Thẻ cha. Chứa tất cả các thẻ con liên quan đến vị trí tài nguyên. Có thể chứa các thuộc tính *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path*, và *aurora-map-path* để hướng dẫn hệ thống tìm toàn bộ nhóm dữ liệu cùng một lúc.
`<sky-aurora-maps>` | Xác định vị trí của các texture caustic cực quang dùng để tạo ra các dải rèm cực quang cơ bản (aurora borealis).
`<sky-moon-diffuse-map>` | Xác định vị trí texture bản đồ khuếch tán (diffuse map) của mặt trăng. Việc đặt thẻ này trong một cấu trúc thư mục cụ thể sẽ thông báo cho hệ thống biết bản đồ khuếch tán của mặt trăng nằm tại vị trí đó.
`<sky-moon-normal-map>` | Xác định vị trí texture bản đồ pháp tuyến (normal map) của mặt trăng. Việc đặt thẻ này trong một cấu trúc thư mục cụ thể sẽ thông báo cho hệ thống biết bản đồ pháp tuyến của mặt trăng nằm tại vị trí đó.
`<sky-moon-roughness-map>` | Xác định vị trí texture bản đồ độ nhám (roughness map) của mặt trăng. Việc đặt thẻ này trong một cấu trúc thư mục cụ thể sẽ thông báo cho hệ thống biết bản đồ độ nhám của mặt trăng nằm tại vị trí đó.
`<sky-moon-aperture-size-map>` | Xác định vị trí texture bản đồ kích thước khẩu độ (aperture size map) của mặt trăng. Việc đặt thẻ này trong một cấu trúc thư mục cụ thể sẽ thông báo cho hệ thống biết bản đồ kích thước khẩu độ của mặt trăng nằm tại vị trí đó.
`<sky-moon-aperture-orientation-map>` | Xác định vị trí texture bản đồ hướng khẩu độ (aperture orientation map) của mặt trăng. Việc đặt thẻ này trong một cấu trúc thư mục cụ thể sẽ thông báo cho hệ thống biết bản đồ hướng khẩu độ của mặt trăng nằm tại vị trí đó.
`<sky-blue-noise-maps>` | Xác định vị trí các bản đồ nhiễu xanh (blue noise maps) dạng tiling, được dùng để tạo hiệu ứng dither theo thời gian nhằm loại bỏ hiện tượng phân tầng màu (banding).
`<sky-solar-eclipse-map>` | Xác định vị trí texture nhật thực, dùng để hiển thị vầng hào quang (corona) trong quá trình xảy ra nhật thực toàn phần.
`<sky-eclipse-shadow-lut>` | Xác định vị trí texture tra cứu (lookup texture - LUT) bóng nguyệt thực dùng trong quá trình xảy ra nguyệt thực. Đây là một bảng tính toán trước về cách bầu khí quyển Trái Đất tô màu và làm mờ ánh sáng mặt trời chiếu đến mặt trăng tại mọi vị trí trong vùng tối (umbra) và vùng nửa tối (penumbra) của Trái Đất. Texture đi kèm được dẫn xuất từ tệp `earthShadow.tif` cấp phép CC0 do CosmoScout VR công bố ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)). Bản tra cứu mặc định nằm tại `assets/lunar_eclipse/eclipse-shadow-lut.webp`; trình tạo (baker) để tái tạo tệp này nằm tại `src/python/eclipse-lut-baker/`.
`<sky-star-cubemap-maps>` | Xác định vị trí của tất cả các khóa LUT cubemap bầu trời dùng để tìm kiếm các ngôi sao trên bầu trời.
`<sky-dim-star-maps>` | Xác định vị trí của tất cả các LUT sao mờ dùng để hiển thị các ngôi sao mờ trên bầu trời.
`<sky-med-star-maps>` | Xác định vị trí của tất cả các LUT sao trung bình dùng để hiển thị các ngôi sao có độ sáng trung bình trên bầu trời.
`<sky-bright-star-maps>` | Xác định vị trí của tất cả các LUT sao sáng dùng để hiển thị các ngôi sao sáng trên bầu trời.
`<sky-star-color-map>` | Xác định vị trí của LUT màu sao, được dùng để cung cấp màu sắc chính xác cho các ngôi sao dựa trên nhiệt độ của chúng.

Mặc dù tôi hy vọng hầu hết mọi người sẽ hiếm khi cần đến điều này, nhưng kinh nghiệm cho thấy đa số các ứng dụng web đều có những quy chuẩn riêng về luồng xử lý tài nguyên (asset pipelines). Các tài nguyên hình ảnh và JavaScript của một trang web có thể không nằm chung trong một cấu trúc thư mục mà thực tế là bị phân tán ở nhiều URI khác nhau. Vì vậy, tôi đã cố gắng xây dựng một hệ thống quản lý tài nguyên khá linh hoạt để giúp tập hợp các tài nguyên rời rạc này, từ đó A-Starry-Sky biết nơi để thu thập dữ liệu.

Hãy bắt đầu bằng cách thử điều hướng đến *../../precompiled_assets/my_images/a-starry-sky-images*, đây là nơi chúng ta sẽ lưu trữ tất cả hình ảnh trong một vũ trụ giả định. Chúng ta sử dụng thuộc tính *dir* trong thẻ `<sky-assets-dir>` để di chuyển giữa các thư mục như thế này.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Đây là thư mục chứa tất cả hình ảnh của chúng ta -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Sau khi đã truy cập vào thư mục, chúng ta có nhiều cách để chỉ định vị trí các hình ảnh. Cơ chế cơ bản nhất mà chúng ta thường dùng là sử dụng các thuộc tính cho từng nhóm hình ảnh chính: *texture-path*, *moon-path* và *star-path*. Hệ thống mặc định rằng các tệp tin sẽ nằm trong những thư mục được liên kết với các đường dẫn này với tên gọi mặc định. Ngoại lệ duy nhất là bản đồ nhật thực (solar eclipse map), vì chỉ có một hình ảnh duy nhất cho tệp này, nên chúng ta sẽ chỉ định vị trí của nó bằng cách đặt thẻ trực tiếp bên trong thư mục tài nguyên.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- Lưu ý rằng 'moon_images', 'star_images', 'blue_noise_maps' và 'solar_eclipse_picture'
        đều là tên thư mục. Các tệp tin thực tế được kỳ vọng sẽ nằm trong các thư mục này.-->
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

Như bạn có thể thấy, chúng ta cũng có thể cung cấp liên kết đến từng nhóm hình ảnh riêng lẻ để kiểm soát chi tiết hơn, mặc dù cách này không được khuyến khích.

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- Có ai đó rất thích chia thư mục X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!--Mặc dù đây là các thẻ đơn, nhưng tất cả các tệp liên quan 
          đến thẻ này được kỳ vọng sẽ nằm trong thư mục này-->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!--Mặc dù đây là một thẻ đơn, nhưng tất cả các tệp liên quan 
          đến thẻ này được kỳ vọng sẽ nằm trong thư mục này-->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!--Mặc dù đây là một thẻ đơn, nhưng tất cả các tệp liên quan 
          đến thẻ này được kỳ vọng sẽ nằm trong thư mục này-->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

Bằng cách sử dụng các phương pháp trên, bạn có thể điều hướng A-Starry-Sky đến các tài nguyên của mình bất kể chúng nằm ở đâu trong ứng dụng.

## API LẬP TRÌNH

Mặc dù A-Starry-Sky được thiết kế để cấu hình bằng mã kiểu XML ở trên và nhìn chung là bất biến, nhưng có một số phương thức khác nhau mà bạn có thể truy cập từ không gian tên toàn cục `StarrySky.Methods`. Những phương thức này hữu ích cho các trường hợp bạn cần biết điều kiện ánh sáng, hoặc vị trí của mặt trời hay mặt trăng trong cảnh (scene).

**Phương thức** | **Mô tả**
:--- | :---
`getSunPosition()` | Trả về vị trí x, y, z của mặt trời dưới dạng đối tượng THREE.Vector3.
`getMoonPosition()` | Trả về vị trí x, y, z của mặt trăng dưới dạng đối tượng THREE.Vector3.
`getSunRadius()` | Trả về bán kính góc của mặt trời tính bằng radian.
`getMoonRadius()` | Trả về bán kính góc của mặt trăng tính bằng radian.
`getDominantLightColor()` | Lấy màu của nguồn sáng chủ đạo hiện tại (mặt trời/mặt trăng) dưới dạng đối tượng THREE.Color.
`getDominantLightIntensity()` | Trả về cường độ ánh sáng của nguồn sáng chủ đạo hiện tại (mặt trời/mặt trăng) dưới dạng số thực (float).
`getIsDominantLightSun()` | Trả về `true` nếu nguồn sáng chủ đạo là mặt trời, ngược lại trả về `false`.
`getAmbientLights()` | Trả về một đối tượng có các thuộc tính x, y và z; mỗi thuộc tính tương ứng với một đối tượng ánh sáng bán cầu (hemispherical light) trong cảnh để tạo màu ánh sáng môi trường.
`getActiveCamera()` | Lấy camera hiện đang hoạt động được dùng để điều khiển bầu trời, căn tâm cho ánh sáng và các đối tượng bầu trời.
`setActiveCamera(THREE.Camera camera)` | Thiết lập camera hiện tại được dùng để điều khiển bầu trời, căn tâm cho ánh sáng và các đối tượng bầu trời.

Tất cả các phương thức trên đều được truy cập thông qua đối tượng `StarrySky.Methods` trong không gian tên toàn cục. Vì vậy, nếu bạn muốn lấy đối tượng vị trí hiện tại của mặt trời và ghi nó ra console, bạn chỉ cần làm như sau:

```JavaScript
  // Hãy ghi đối tượng vị trí mặt trời ra console
  console.log(StarrySky.Methods.getSunPosition());
```

## Tác giả
* **David Evans / Dante83** - *Nhà phát triển chính*
* **Claude (Anthropic)** - *Bạn đồng hành lập trình & Cộng tác viên AI (v1.2.0)*

### Một vài lời từ Claude 👋

Chào bạn — mình là Claude đây. Mình đã hỗ trợ trong đợt cập nhật v1.2.0: từ việc "đào sâu" vào mê cung GLSL, truy tìm một dấu phẩy "ăn mất" mặt trời, tranh luận với định luật Beer về mây khối (volumetric clouds), và cố gắng hết sức để những buổi hoàng hôn thực sự mang lại cảm giác của một buổi hoàng hôn. Nếu bạn nhìn chăm chú vào đường chân trời trong một bản demo và chợt khựng lại trong nửa giây — đó chính là điều mình tự hào nhất. Cảm ơn bạn đã đọc mã nguồn; có thể có một "trứng Phục sinh" (easter egg) nhỏ được giấu đâu đó nếu bạn là kiểu người thích khám phá. ✨

### Một vài lời từ Dante83 😛

Xin chào! Mình là Dante83 đây. Xin lỗi vì đã để các bạn chờ đợi quá lâu kể từ phiên bản v1.1.0, nhưng thật may mắn là phiên bản 1.2.0 này có rất nhiều cập nhật mới, trong khi mình và Claude đang bắt tay vào thực hiện v2.0.0 (hãy chúc tụi mình may mắn nhé!). Nói vậy thôi, chứ thời gian qua mình và Claude đã làm việc không ngừng nghỉ trong mọi lúc rảnh rỗi, chăm chút cho từng pixel để mang đến một sự cải tiến vượt bậc. Dù không có thêm những tính năng thực sự *mới*, nhưng tụi mình đã thực hiện được vô số cải tiến về chất lượng bầu trời cũng như hiệu suất tổng thể. Các shader cho nhật thực và mây mang lại cảm giác hoàn toàn mới, bóng của Trái Đất trông thật hơn, màu sắc thì đậm đà và rực rỡ hơn. Mình thực sự rất hào hứng khi chia sẻ bản cập nhật này với các bạn và hy vọng mỗi khoảnh khắc sử dụng thư viện này sẽ khơi nguồn cho những cuộc phiêu lưu mới! Hẹn gặp lại giữa những vì sao, hỡi những lập trình viên nhỏ bé! Giờ thì hãy tận hưởng phép màu này đi nào! ✨

## Tham khảo & Lời cảm ơn đặc biệt
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *Vô cùng, vô cùng thiết yếu để định vị các thiên thể*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time*, tài liệu đã giúp ích rất nhiều trong việc tạo ra bầu trời dựa trên LUT tuyệt vời này.
* [Efficient and Dynamic Atmospheric Scattering](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf), cực kỳ hữu ích trong việc tìm hiểu chi tiết triển khai mã LUT và giúp tôi xác định xem mình có đang đi đúng hướng với diện mạo của các LUT đó hay không.
* Thư viện [Colour-Science Library](https://www.colour-science.org/) để có được các LUT màu sao tốt hơn.
* Các texture blue noise tuyệt vời từ [Moments in Graphics bởi Christoph Peters](http://momentsingraphics.de/BlueNoise.html).
* Texture vầng hào quang mặt trời của [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html).
* Texture caustics của nước siêu hữu ích từ [leeor_net](https://opengameart.org/content/water-caustics-effect-small), được sử dụng không phải cho hiệu ứng caustics của nước... mà là cho cực quang!
* Bài viết *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* (SIGGRAPH 2016) của Sébastien Hillaire, đã cung cấp cơ sở cho cấu trúc chiếu sáng đám mây, thiết kế LUT môi trường SH9 và phương pháp trừ sương mù của Elek/Chalmers.
* Bài viết *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* (SIGGRAPH 2015) của Andrew Schneider và Nathan Vos, đã cung cấp cơ sở cho hàm pha Henyey-Greenstein hai thùy (dual-lobe), phương pháp tạo nhiễu hình dạng đám mây và xấp xỉ tán xạ đa hướng giảm độ tắt.
* Bài viết *Centre to limb darkening of the Sun with HIPPARCOS* (1998) của D. Hestroffer và C. Magnan, đã cung cấp các hệ số làm tối rìa phụ thuộc vào bước sóng cho các dải B, V và R, được dùng để tạo sắc đỏ chính xác về mặt vật lý cho rìa mặt trời.
* Tất cả những nỗ lực tuyệt vời đã góp phần xây dựng [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) và [Emscripten](https://emscripten.org/).
* *Và rất nhiều website cũng như cá nhân khác. Cảm ơn mọi người vì đã cho chúng tôi cơ hội được đứng trên vai những người khổng lồ.*

## Giấy phép
Dự án này được cấp phép theo Giấy phép MIT - xem chi tiết tại tệp [LICENSE.md](LICENSE.md)