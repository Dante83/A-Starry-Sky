# A-Starry-Sky

A-Starry-Sky คือโดมท้องฟ้าสำหรับ [A-Frame Web Framework](https://aframe.io/) โดยมีเป้าหมายเพื่อมอบคอมโพเนนต์ที่ติดตั้งและใช้งานได้ง่าย เพื่อให้คุณนำไปสร้างสรรค์วัฏจักรกลางวัน-กลางคืนที่สวยงามในผลงานของคุณ

> **คำเตือน: จำเป็นต้องใช้ GPU ประสิทธิภาพสูง — โปรดอย่าเปิดใช้งานบนโทรศัพท์มือถือ**

**[Live Demo](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=today)** — ท้องฟ้าตามวันและเวลาปัจจุบันในเมืองซานฟรานซิสโก

| ตัวอย่าง | คำอธิบาย |
|:---|:---|
| [Desert](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=desert) | ฉากทะเลทรายในช่วงเวลากลางวันที่กำหนดไว้ |
| [Solar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=eclipse) | สุริยุปราคาเต็มดวงพร้อมคอโรนา |
| [Lunar Eclipse](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=lunar-eclipse) | เงาของโลกที่ทอดลงบนดวงจันทร์ |
| [Christmas Star (1226 AD)](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=christmas-star) | การเรียงตัวครั้งสำคัญของดาวพฤหัสบดีและดาวเสาร์ |
| [Mars](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars) | ชั้นบรรยากาศจำลองของดาวอังคาร |
| [Custom Atmosphere](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mie-rayleigh) | ค่าการกระเจิงแสงแบบ Mie และ Rayleigh ที่แตกต่างกัน |
| [High Altitude](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude) | ท้องฟ้าจากระดับความสูง 20 กม. ขึ้นไป |
| [Aurora Borealis](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=aurora) | ⚠️ ใช้ทรัพยากร GPU สูง |
| [Light Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-light) | ⚠️ ใช้ทรัพยากร GPU สูง |
| [Medium Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-medium) | ⚠️ ใช้ทรัพยากร GPU สูง |
| [Heavy Clouds](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=clouds-heavy) | ⚠️ ใช้ทรัพยากร GPU สูง |

## สิ่งที่จำเป็นต้องมี

เครื่องมือนี้ถูกสร้างขึ้นสำหรับ [A-Frame Web Framework](https://aframe.io/) เวอร์ชัน 1.7.0 ขึ้นไป และจำเป็นต้องใช้เว็บเบราว์เซอร์ที่รองรับ Web XR

`https://aframe.io/releases/1.7.0/aframe.min.js`

## การติดตั้ง

คัดลอกไฟล์ *a-starry-sky.v1.2.0.min.js* รวมถึงโฟลเดอร์ *assets* และ *wasm* ไปยังโปรเจกต์ของคุณ จากนั้นเพิ่มสคริปต์ต่อไปนี้ลงใน HTML — โปรดสังเกตว่าไม่ได้รวม `starry-sky-web-worker.js` ไว้ที่นี่ เนื่องจากจะมีการอ้างอิงโดยตรงผ่านแท็ก `<a-starry-sky>` แทน

```html
<script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
<script src="{เส้นทางไปยังโฟลเดอร์ JS}/a-starry-sky.v1.2.0.min.js"></script>
<script src="{เส้นทางไปยังโฟลเดอร์ JS}/wasm/interpolation-engine.js"></script>
```

เมื่อตั้งค่าการอ้างอิงเหล่านี้เรียบร้อยแล้ว ให้เพิ่มคอมโพเนนต์ `<a-starry-sky>` ลงในแท็ก `<a-scene>` ของ A-Frame โดยระบุ URL ของ sky-state web worker ดังนี้

```html
<a-scene>
  <a-starry-sky web-worker-src="{เส้นทางไปยังโฟลเดอร์ JS}/wasm/starry-sky-web-worker.js"></a-starry-sky>
</a-scene>
```

โค้ดพื้นฐานนี้จะสร้างท้องฟ้าที่เคลื่อนที่แบบเรียลไทม์ตามละติจูดและลองจิจูดของเมืองซานฟรานซิสโก รัฐแคลิฟอร์เนีย อย่างไรก็ตาม คุณสามารถทำได้มากกว่านี้ เพราะ A-Starry-Sky มาพร้อมกับแท็ก HTML แบบกำหนดเองมากมายเพื่อช่วยให้คุณปรับแต่งสถานะของท้องฟ้าได้ตามต้องการ

**หมายเหตุ: Sky box นี้ไม่สามารถเปลี่ยนแปลงค่าได้ (immutable) ซึ่งหมายความว่าการตั้งค่าเริ่มต้นจะคงที่ในทุกๆ หน้า น่าเสียดายที่ในขณะนี้ การทำให้โค้ดสามารถเปลี่ยนแปลงค่าได้นั้นทำได้ยากเกินไป**

## การกำหนดตำแหน่งที่ตั้ง

**แท็ก** | **คำอธิบาย** | **ค่าเริ่มต้น**
:--- | :--- | :---
`<sky-location>` (แท็กหลัก) | แท็กหลักที่บรรจุแท็กย่อยสำหรับละติจูดและลองจิจูดของท้องฟ้า | N/A
`<sky-latitude>` (ละติจูด) | กำหนดค่าละติจูดของตำแหน่ง โดยทิศเหนือของเส้นศูนย์สูตรจะมีค่าเป็น **บวก** | 38
`<sky-longitude>` (ลองจิจูด) | กำหนดค่าลองจิจูดของตำแหน่ง โดยทิศตะวันตกของ [เส้นเมริเดียนแรก](https://en.wikipedia.org/wiki/Prime_meridian) จะมีค่าเป็น **ลบ** | -122

คุณสามารถกำหนดท้องฟ้าให้เป็นละติจูดและลองจิจูดใดก็ได้บนโลก การระบุตำแหน่งมีประโยชน์ในการสร้างบรรยากาศของฤดูกาลให้กับผู้เล่น โดยการเปลี่ยนแนววิถี (arc) ของดวงอาทิตย์หรือดวงจันทร์ นอกจากนี้ ค่าละติจูดจะเป็นตัวกำหนดว่าจะมีดาวดวงใดบ้างที่ปรากฏบนท้องฟ้ายามค่ำคืนของคุณ ทั้งค่าละติจูดและลองจิจูดมีความสำคัญอย่างยิ่งต่อเหตุการณ์ที่ขึ้นกับเวลา เช่น สุริยุปราคาและจันทรุปราคา โดยเฉพาะอย่างยิ่งหากคุณต้องการจำลองประสบการณ์สุริยุปราคาเต็มดวง อย่างไรก็ตาม การตั้งค่าตำแหน่งนั้นง่ายกว่าการตัดสินใจว่าจะเลือกที่ไหนดี เพียงแค่หาพิกัดที่คุณต้องการจาก [Google Earth](https://earth.google.com/web/) หรือแหล่งแผนที่อื่นๆ แล้วนำค่าเหล่านั้นมาใส่ในแท็กที่เกี่ยวข้อง ดังนี้

ไปนิวยอร์กกันเลย!
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

แล้วถ้าเป็นเมืองเพิร์ท ประเทศออสเตรเลียล่ะ?
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

โปรดทราบว่าลองจิจูดที่อยู่ทางทิศตะวันตกของ [เส้นเมริเดียนแรก](https://en.wikipedia.org/wiki/Prime_meridian) จะมีค่าเป็นลบ (เช่น นิวยอร์ก, บัวโนสไอเรส)

## การตั้งค่าเวลา

**Tag (แท็ก)** | **Description (คำอธิบาย)** | **Default Value (ค่าเริ่มต้น)**
:--- | :--- | :---
`<sky-time>` | แท็กหลัก (Parent tag) ที่รวบรวมแท็กย่อยทั้งหมดที่เกี่ยวข้องกับวันที่หรือเวลา | N/A
`<sky-date>` | ข้อความระบุวันและเวลาท้องถิ่นในรูปแบบ **ปี-เดือน-วัน ชั่วโมง:นาที:วินาที** เช่น *2021-03-21 13:45:51* โดยค่าชั่วโมงจะใช้ระบบ 0-23 (0 คือ เที่ยงคืน และ 23 คือ ห้าทุ่ม) | วันที่ปัจจุบัน
`<sky-speed>` | ตัวคูณเวลาสำหรับเร่งหรือลดความเร็วในการคำนวณทางดาราศาสตร์ | 1.0
`<sky-utc-offset>` | ค่าชดเชยเวลา UTC สำหรับตำแหน่งนี้ โดยค่าลบจะหมายถึงพื้นที่ที่อยู่ทางทิศตะวันตกของ [เส้นเมริเดียนแรก](https://en.wikipedia.org/wiki/Prime_meridian) ซึ่งตรงข้ามกับค่าลองจิจูด **โปรดทราบว่าเวลา UTC จะไม่มีการปรับตามเวลาออมแสง (DST)** | 7

กำหนดค่า `<sky-date>` ให้เป็น**เวลาท้องถิ่น**ของตำแหน่งที่คุณเลือก จากนั้นกำหนดค่า `<sky-utc-offset>` ให้ตรงกับเขตเวลานั้น ตัวอย่างเช่น เมืองนิวยอร์กจะเป็น UTC-4 (ฤดูร้อน) หรือ UTC-5 (ฤดูหนาว) เนื่องจากระบบนี้จะไม่มีการปรับ DST โดยอัตโนมัติ

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <!-- การตั้งค่าตำแหน่งก่อนหน้า -->
    <sky-location>
      <sky-latitude>40.7</sky-latitude>
      <sky-longitude>-74.0</sky-longitude>
    </sky-location>

    <!-- คุณสามารถตั้งค่า UTC Offset ได้ดังนี้! -->
    <sky-time>
      <sky-utc-offset>-4</sky-utc-offset>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

สังเกตว่าเราจะใช้แท็กหลัก `<sky-time>` อีกครั้ง เพื่อรวบรวมแท็กย่อยที่เกี่ยวข้องกับการตั้งค่าเวลาทั้งหมดไว้ด้วยกัน

อย่างไรก็ตาม คุณไม่จำเป็นต้องใช้เพียงแค่เวลาของเครื่องเท่านั้น ลองทำอะไรที่น่าตื่นเต้นกว่านั้นอย่างการเดินทางข้ามเวลาดูไหม! ได้ข่าวว่าจะมี [สุริยุปราคา](https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2024Apr08Tgoogle.html) ครั้งใหญ่ใน[วันที่ 8 เมษายน 2024 เวลา 13:27 น. ที่เมืองเดลริโอ รัฐเท็กซัส](https://nationaleclipse.com/cities_total.html) เราลองไปดูกันเลย!

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

พลาดชม [ดาวคริสต์มาส](https://www.nasa.gov/feature/the-great-conjunction-of-jupiter-and-saturn) ไปหรือเปล่า? ไม่ใช่ดวงนั้นหรอก แต่เป็นดวงที่ปรากฏในปี ค.ศ. 1226 ต่างหาก โชคดีที่เรามีเครื่องไทม์แมชชีน และตอนนี้ A-Starry-Sky รองรับการแสดงผลของดาวเคราะห์แล้วด้วย :D

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <sky-date>1226-12-26 21:00:00</sky-date>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

การเดินทางข้ามเวลานั้นสนุกก็จริง แต่คุณอาจจะสนใจเรื่องการเปลี่ยน *ความเร็ว* ของเวลาด้วย เพราะในโลกของเกม วงจรกลางวัน-กลางคืนมักจะดำเนินไปเร็วกว่าความเป็นจริง หรือบางทีคุณอาจต้องการหยุดเวลาไว้ถาวรเพื่อจับภาพช่วงเวลาที่แสงสวยงามที่สุดสำหรับการจัดแสง หากต้องการทำเช่นนี้ ให้เพิ่มแท็ก `<sky-speed>` เข้าไป

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-time>
      <!-- ตอนนี้เวลาในโลกเสมือนจะเดินเร็วขึ้น โดย 1 วันในชีวิตจริงจะเท่ากับ 8 วันในเกม -->
      <sky-speed>8</sky-speed>
    </sky-time>
  </a-starry-sky>
</a-scene>
```

แน่นอนว่าหากคุณใช้งานในโลกแบบ Persistent World อย่าลืมคำนวณเรื่องการเร่งเวลาให้สอดคล้องกับการสร้าง HTML ของคุณด้วย ทั้งนี้ การตั้งค่า HTML แบบไดนามิกสำหรับท้องฟ้าจะขึ้นอยู่กับความต้องการของคุณ

## การปรับแต่งการตั้งค่าชั้นบรรยากาศ

**Tag (แท็ก)** | **Description (คำอธิบาย)** | **Default Value (ค่าเริ่มต้น)**
:--- | :--- | :---
`<sky-atmospheric-parameters>` | แท็กหลักที่รวบรวมแท็กย่อยทั้งหมดที่เกี่ยวข้องกับการตั้งค่าชั้นบรรยากาศ | N/A
`<sky-camera-height>` | ความสูงของกล้องเหนือพื้นโลก | 0.0km
`<sky-mie-directional-g>` | อธิบายปริมาณแสงที่เกิดการกระเจิงไปข้างหน้า (forward scattered) โดยการกระเจิงแบบมี (Mie scattering) ซึ่งเป็นวงแหวนสีขาวรอบดวงอาทิตย์ที่เกิดจากอนุภาคขนาดใหญ่ในชั้นบรรยากาศ ยิ่งค่า mie-directional G สูง ชั้นบรรยากาศจะยิ่งดูเหมือนมีฝุ่นมาก | 0.8
`<sky-sun-intensity>` | ความเข้มของแสงอาทิตย์ใน atmospheric shader | 1367.0
`<sky-moon-intensity>` | ความเข้มของแสงจันทร์ใน atmospheric shader | 29.0
`<sky-mie-beta>` | ค่าความสัมพันธ์ของสีในการกระเจิงแสงแบบมี (Mie scattering) ซึ่งเป็นตัวการหลักที่ทำให้เกิด "แสงเรือง" รอบดวงอาทิตย์ โดยปกติการกระเจิงจะมีความสม่ำเสมอในทุกความถี่ | rgb(4.44E-3, 4.44E-3, 4.44E-3)
`<sky-rayleigh-beta>` | ค่าความสัมพันธ์ของสีในการกระเจิงแสงแบบเรย์ลี (Rayleigh scattering) ซึ่งเป็นตัวการหลักที่ทำให้ท้องฟ้ามีสีฟ้า สังเกตว่าโดยค่าเริ่มต้น ช่องสีน้ำเงินจะมีการกระเจิงมากที่สุด | rgb(5.8e-3, 1.35e-2, 3.31e-2)
`<sky-ozone-beta>` | ค่าความสัมพันธ์ของสีในการกระเจิงแสงของชั้นโอโซน ซึ่งสำคัญมากสำหรับสีน้ำเงินเข้มในช่วงพระอาทิตย์ตก | rgb(413.470734338, 413.470734338, 2.1112886E-13)
`<sky-atmosphere-height>` | ความสูงจุดตัดที่ถือว่าสิ้นสุด "ขอบเขต" ของชั้นบรรยากาศ | 80.0 km
`<sky-radius-of-earth>` | รัศมีของดาวเคราะห์หรือโลก | 6366.7 km
`<sky-rayleigh-scale-height>` | ค่าความสูงสเกลของการลดทอน (falloff scale height) สำหรับการกระเจิงแบบเรย์ลี โดยสมมติว่าเป็นการลดทอนแบบเอกซ์โพเนนเชียล เนื่องจากการกระเจิงแบบเรย์ลีเกิดจากก๊าซในชั้นบรรยากาศ จึงมีค่าสเกลความสูงที่มากกว่ามาก | 8.4
`<sky-mie-scale-height>` | ค่าความสูงสเกลของการลดทอนสำหรับการกระเจิงแบบมี เนื่องจากเกิดจากอนุภาคขนาดใหญ่ จึงมักจะลดทอนเร็วกว่า ส่งผลให้ค่าตัวคูณความสูงลักษณะเฉพาะ (characteristic height scaler) มีค่าน้อยกว่า | 1.25
`<sky-ozone-percent-of-rayleigh>` | เปอร์เซ็นต์ของโอโซนในท้องฟ้า ซึ่งใช้สำหรับกำหนดการสะท้อนกลับของโอโซนในช่วงพระอาทิตย์ตก | 6E-7
`<sky-moon-angular-diameter>` | เส้นผ่านศูนย์กลางเชิงมุมของดวงจันทร์ตามที่ปรากฏบนท้องฟ้า | 3.15 degrees
`<sky-sun-angular-diameter>` | เส้นผ่านศูนย์กลางเชิงมุมของดวงอาทิตย์ตามที่ปรากฏบนท้องฟ้า | 3.38 degrees
`<sky-number-of-atmospheric-lut-ray-steps>` | จำนวนขั้นตอน (steps) ที่ Ray Tracer ใช้เดินทางไปยังขอบฟ้าเพื่อรวบรวมแสงสำหรับ Atmospheric LUTs | 30 steps
`<sky-number-of-atmospheric-lut-gathering-steps>` | จำนวนขั้นตอนเชิงมุมที่ใช้ในแต่ละจุดตามแนวรังสีสำหรับการกระเจิงลำดับที่ k (kth order scattering) | 30 steps
`<sky-number-of-scattering-orders>` | จำนวนรอบการคำนวณการกระเจิงลำดับสูง (higher-order/kth) เพื่ออบ (bake) ลงใน Inscattering LUT ยิ่งค่าสูงคุณภาพยิ่งดีขึ้นแต่จะใช้เวลาในการ Bake นานขึ้น | 4
`<sky-parameters-color-red>` | ส่วนประกอบสีแดงที่ใช้ในแท็ก `<sky-rayleigh-beta>`, `<sky-mie-beta>` และ `<sky-ozone-beta>` | N/A
`<sky-parameters-color-green>` | ส่วนประกอบสีเขียวที่ใช้ในแท็ก `<sky-rayleigh-beta>`, `<sky-mie-beta>` และ `<sky-ozone-beta>` | N/A
`<sky-parameters-color-blue>` | ส่วนประกอบสีน้ำเงินที่ใช้ในแท็ก `<sky-rayleigh-beta>`, `<sky-mie-beta>` และ `<sky-ozone-beta>` | N/A

พารามิเตอร์ของชั้นบรรยากาศมี API ที่ครอบคลุมที่สุดชุดหนึ่งในโค้ดทั้งหมด แม้ว่านักพัฒนาที่มีทักษะจะสามารถใช้ค่าเหล่านี้เพื่อสร้างท้องฟ้าแบบกำหนดเองได้ แต่ผู้ใช้ส่วนใหญ่น่าจะพอใจกับค่าเริ่มต้น อย่างไรก็ตาม มีบางค่าที่มีประโยชน์มากและเข้าใจได้ง่าย

สิ่งหนึ่งที่คุณอาจต้องการเปลี่ยนบ่อยที่สุดคือขนาดของดวงอาทิตย์และดวงจันทร์ ในความเป็นจริง ดวงอาทิตย์มีเส้นผ่านศูนย์กลางเชิงมุม 0.53 องศา และดวงจันทร์มี 0.50 องศา การใช้ค่าเหล่านี้ในโปรแกรมจำลองจะสะท้อนความเป็นจริงได้ดีกว่า แต่ในสถานการณ์ส่วนใหญ่ โดยเฉพาะบนอุปกรณ์ที่ไม่ใช่ VR เช่น จอภาพ ค่าเหล่านี้มักจะดูเล็กเกินไป หากต้องการปรับให้ใหญ่ขึ้นหรือเล็กลง เพียงแค่เปลี่ยนค่าในแท็กที่เกี่ยวข้อง

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

คุณอาจต้องการเปลี่ยนความสูงเริ่มต้นเหนือดาวเคราะห์ ซึ่งสามารถตั้งค่าได้ง่ายๆ ด้วยแท็ก `<sky-camera-height>` อย่างไรก็ตาม ท้องฟ้าจะปรับเปลี่ยนตามความสูงของคุณโดยอัตโนมัติเมื่อคุณเลื่อนกล้องขึ้นหรือลง ค่านี้ใช้กำหนดความสูงเริ่มต้นของฉากในหน่วยกิโลเมตร โดยมีความสูงสูงสุดที่ *80 กม.* และต่ำสุดที่ *0 กม.*

[High Altitude Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=high-altitude)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- ลองขึ้นไปให้สูงกว่านี้อีกหน่อย อากาศข้างบนนี้เบาบางกว่า -->
      <sky-camera-height>20.0</sky-camera-height>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

นอกจากนี้ คุณยังสามารถเปลี่ยนองค์ประกอบของชั้นบรรยากาศได้ ซึ่งจะช่วยให้คุณเข้าถึงกลไกต่างๆ ในการควบคุมท้องฟ้าให้เป็นไปตามที่ต้องการ ตัวอย่างเช่น หากคุณชอบค่า Rayleigh ที่นำเสนอใน [The Mathematics of Rayleigh Scattering](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/) มากกว่าค่าเริ่มต้นของเรา (5.8e-3, 1.35e-2, 3.31e-2) -> (5.19E-3, 1.21E-2, 2.96E-2) และต้องการใช้ beta เป็น 4.44E-3 -> 2E-3 คุณสามารถสลับค่าเหล่านี้ในโค้ดได้อย่างง่ายดาย

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

แต่แค่นั้นอาจจะยังไม่ตื่นเต้นพอ ลองมาทำอะไรที่หลุดโลกกว่านี้กันดีกว่า! เราจะลองอ้างอิงจากงานวิจัย [Physically Based Rendering of the Martian Atmosphere](https://elib.dlr.de/86477/1/Collienne_GI_VRAR_2013.pdf) แล้วเดินทางไปดาวอังคารกัน! ในกรณีนี้ พวกเขาจะสลับการใช้งานระหว่าง Rayleigh และ Mie ดังนั้นเราจึงควรสลับค่าความสูงลักษณะเฉพาะ (characteristic heights) ของทั้งคู่ด้วย เนื่องจากการกระเจิงส่วนใหญ่บนดาวอังคารเกิดจากการกระเจิงแบบมี (Mie scattering) ของอนุภาคขนาดใหญ่ โดยมีชั้นบรรยากาศที่เบาบางมาก ด้วยเหตุนี้ เราสามารถปิดการทำงานของ mie (rayleigh) และสลับค่าความสูงลักษณะเฉพาะได้เลย นอกจากนี้เราควรเปลี่ยนรัศมีของดาวเคราะห์ และอาจปรับความสูงของชั้นบรรยากาศเพื่อให้ Ray Tracer ทำงานได้ดียิ่งขึ้น

[Mars Example](https://code-panda.neocities.org/examples/a-starry-sky/v1.2.0/desert?scene=mars)
```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- สังเกตว่าดาวอังคารจะกระเจิงแสงสีแดงมากกว่า -->
      <sky-rayleigh-beta>
        <sky-parameters-color-red>19.918E-3</sky-parameters-color-red>
        <sky-parameters-color-green>13.577E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>5.57E-3</sky-parameters-color-blue>
      </sky-rayleigh-beta>
      <sky-rayleigh-scale-height>30.0</sky-rayleigh-scale-height>

      <!-- การปรับแต่งค่า mie อีกเล็กน้อยก็ช่วยได้เช่นกัน -->
      <sky-mie-directional-g>0.9</sky-mie-directional-g>
      <sky-mie-beta>
        <sky-parameters-color-red>10.0E-3</sky-parameters-color-red>
        <sky-parameters-color-green>10.0E-3</sky-parameters-color-green>
        <sky-parameters-color-blue>10.0E-3</sky-parameters-color-blue>
      </sky-mie-beta>
      <sky-mie-scale-height>2.0</sky-mie-scale-height>

      <!-- อย่าลืมปิดการทำงานของโอโซน -->
      <sky-ozone-percent-of-rayleigh>0.0</sky-ozone-percent-of-rayleigh>

      <!-- ซึ่งในกรณีนี้คือดาวอังคาร... -->
      <sky-radius-of-earth>3389.5</sky-radius-of-earth>
      <sky-atmosphere-height>10.8</sky-atmosphere-height>

      <!-- ดวงอาทิตย์มีขนาดเล็กลง และเราสามารถตัดดวงจันทร์ออกไปได้เลย -->
      <sky-sun-angular-diameter>0.35</sky-sun-angular-diameter>
      <sky-moon-angular-diameter>0.0</sky-moon-angular-diameter>
      <sky-sun-intensity>590.0</sky-sun-intensity>
      <sky-moon-intensity>0.0</sky-moon-intensity>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

คุณยังสามารถปรับแต่งจำนวนขั้นตอนของรังสี (ray step counts) ใน LUT ได้ แม้ว่าค่าเริ่มต้นจะใกล้เคียงกับจุดที่เหมาะสมที่สุดแล้ว และการเปลี่ยนแปลงมักจะไม่เห็นผลชัดเจนนัก

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-atmospheric-parameters>
      <!-- ค่าต่ำเพื่อประสิทธิภาพ, ค่าสูงเพื่อความแม่นยำ (ค่าเริ่มต้นที่ 30 เหมาะสมที่สุดสำหรับกรณีส่วนใหญ่) -->
      <sky-number-of-atmospheric-lut-ray-steps>30</sky-number-of-atmospheric-lut-ray-steps>
      <sky-number-of-atmospheric-lut-gathering-steps>30</sky-number-of-atmospheric-lut-gathering-steps>
      <sky-number-of-scattering-orders>4</sky-number-of-scattering-orders>
    </sky-atmospheric-parameters>
  </a-starry-sky>
</a-scene>
```

## การแก้ไขค่าเริ่มต้นของแสง (Lighting)

**แท็ก (Tag)** | **คำอธิบาย** | **ค่าเริ่มต้น**
:--- | :--- | :---
`<sky-lighting>` | แท็กหลักที่รวบรวมแท็กย่อยทั้งหมดที่เกี่ยวข้องกับการจัดแสงของฉาก | N/A
`<sky-sun-intensity>` | ตัวคูณความเข้มข้นของแสงอาทิตย์ ใช้สำหรับเพิ่มหรือลดความสว่างของแสงแบบ Directional จากดวงอาทิตย์ | 1.0
`<sky-moon-intensity>` | ตัวคูณความเข้มข้นของแสงจันทร์ ใช้สำหรับเพิ่มหรือลดความสว่างของแสงแบบ Directional จากดวงจันทร์ | 1.0
`<sky-ambient-intensity>` | ตัวคูณความเข้มข้นของแสง Ambient ใช้สำหรับเพิ่มหรือลดความสว่างของระบบแสง Ambient | 2.0
`<sky-minimum-ambient-lighting>` | ค่าต่ำสุดของแสง Ambient ในระบบ | 0.01
`<sky-maximum-ambient-lighting>` | ค่าสูงสุดของแสง Ambient ในระบบ | INF
`<sky-atmospheric-perspective-type>` | กำหนดได้เป็น *normal*, *advanced* หรือ *none* จำเป็นสำหรับการสร้างหมอกในฉาก (scene fog) โดย *normal* จะใช้โมเดล exponential fog แบบดั้งเดิม ส่วน *advanced* จะใช้โมเดลที่อิงตาม Preetham เพื่อให้สีของเส้นขอบฟ้ามีความหลากหลายมากขึ้น แต่จะกินทรัพยากร GPU มากขึ้น | normal
`<sky-atmospheric-perspective-density>` | สำหรับหมอกแบบ *normal* เท่านั้น ใช้ควบคุมค่าความหนาแน่น (density) ของ exponential scene fog โดยสีจะถูกกำหนดโดยอัตโนมัติตามแสงของฉาก หากใช้หมอกแบบ *advanced* ค่านี้จะถูกละเลย | 0.007
`<sky-atmospheric-perspective-distance-multiplier>` | สำหรับหมอกแบบ *advanced* เท่านั้น ใช้คูณระยะห่างของหมอกสำหรับโมเดล advanced fog | 2.0
`<sky-ground-color>` | แท็กหลักที่รวบรวมแท็ก `<sky-ground-color-{color-channel}>` เพื่อกำหนดสีพื้นฐานของพื้นดินสำหรับการสะท้อนแสงจากพื้นผิว | N/A
`<sky-ground-color-red>` | ใช้สำหรับเปลี่ยนค่าช่องสี **แดง (red)** ของแท็ก `<sky-ground-color>` | 66
`<sky-ground-color-green>` | ใช้สำหรับเปลี่ยนค่าช่องสี **เขียว (green)** ของแท็ก `<sky-ground-color>` | 44
`<sky-ground-color-blue>` | ใช้สำหรับเปลี่ยนค่าช่องสี **น้ำเงิน (blue)** ของแท็ก `<sky-ground-color>` | 2
`<sky-shadow-camera-resolution>` | ความละเอียด (พิกเซล) ของกล้องแสงโดยตรงที่ใช้สร้างเงา ค่าที่สูงขึ้นจะทำให้เงามีคุณภาพดีขึ้นแต่จะเพิ่มภาระในการประมวลผล | 2048
`<sky-shadow-camera-size>` | ขนาดของพื้นที่กล้องที่ใช้สร้างเงา ยิ่งขนาดใหญ่ พื้นที่ที่มีเงาก็จะยิ่งกว้างขึ้น แต่จะทำให้เกิดปัญหา aliasing เนื่องจากพิกเซลของกล้องถูกกระจายออกไปในพื้นที่ที่กว้างขึ้น | 32.0
`<sky-sun-bloom>` | แท็กหลักที่รวบรวมคุณสมบัติทั้งหมดของ render pass สำหรับ sun bloom | N/A
`<sky-moon-bloom>` | แท็กหลักที่รวบรวมคุณสมบัติทั้งหมดของ render pass สำหรับ moon bloom | N/A
`<sky-bloom-enabled>` | เปิดใช้งาน (true) หรือปิดใช้งาน (false) เอฟเฟกต์ bloom ของวัตถุทางดาราศาสตร์นี้ | true
`<sky-bloom-exposure>` | เปลี่ยนค่าการเปิดรับแสง (exposure) ของ bloom filter ซึ่งคือจำนวนเท่าที่จะคูณแสงที่ส่งกลับไปยังกล้อง | 1.0
`<sky-bloom-threshold>` | เปลี่ยนค่าเกณฑ์ (threshold) ของ bloom filter คือระดับความเข้มข้นขั้นต่ำที่จะเริ่มเกิดเอฟเฟกต์ bloom | {sun: 4.0, moon: 0.55}
`<sky-bloom-strength>` | เปลี่ยนค่าความแรง (strength) ของ bloom filter คือระดับการ 'ฟุ้ง' (bloom) สำหรับพิกเซลที่เลือก | {sun: 1.0, moon: 0.9}
`<sky-bloom-radius>` | เปลี่ยนค่ารัศมี (radius) ของ bloom filter คือระยะทางที่เอฟเฟกต์ bloom จะแผ่กระจายออกไป | {sun: 1.0, moon: 1.4}

แท็กการจัดแสงท้องฟ้ามีประโยชน์ในการควบคุมคุณลักษณะของแสงโดยตรง (direct lighting) และแสงทางอ้อม (indirect lighting) ในฉาก ในเวอร์ชัน 1.0.0 ได้มีการลดจำนวนไฟแบบ Directional จาก 2 ดวง (ดวงอาทิตย์และดวงจันทร์) เหลือเพียง 1 ดวง (ใช้สำหรับแหล่งกำเนิดแสงที่โดดเด่นที่สุด) โดยไฟ Directional จะโฟกัสไปที่กล้องของผู้ใช้เสมอ และสร้างเงารอบๆ กล้องนี้ แม้ว่าไฟ Directional จะรองรับเงาได้หลายประเภท แต่ไลบรารีนี้ไม่ใช่จุดที่ใช้ควบคุมเรื่องดังกล่าว ให้กำหนดประเภทของเงาในแท็ก `<a-scene>` แทน ตามที่อธิบายไว้ [ที่นี่](https://aframe.io/docs/1.2.0/components/light.html#adding-real-time-shadows) ซึ่งคุณสามารถตั้งค่าได้ดังนี้:

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

น่าเสียดายที่ในขณะที่เขียนเอกสารนี้ A-Frame ยังไม่รองรับ variance shadow maps แม้ว่าจะมี issue ที่เปิดค้างไว้สำหรับเรื่องนี้ก็ตาม นอกจากนี้ ประเภทของเงาที่คุณเลือกสำหรับแสงอาทิตย์และแสงจันทร์ จะเป็นประเภทเงาสำหรับไฟดวงอื่นๆ ทั้งหมดในฉากด้วย ดังนั้นโปรดคำนึงถึงจุดนี้เมื่อเลือกประเภทเงา

คุณสามารถควบคุมคุณภาพของเงาผ่านขนาด (size) และความละเอียด (resolution) ของกล้องเงา การเพิ่มขนาดจะทำให้ครอบคลุมพื้นที่ในฉากมากขึ้น ส่วนการเพิ่มความละเอียดจะทำให้ผลลัพธ์คมชัดขึ้น แต่ทั้งสองอย่างส่งผลต่อภาระของ GPU ดังนั้นควรปรับให้สมดุลตามความต้องการ นอกจากนี้ แนะนำให้ปิดการใช้งานเงาสำหรับ mesh สภาพแวดล้อมที่มีขนาดใหญ่ เนื่องจากมักจะอยู่นอก frustum และทำให้เกิดขอบเงารูปสี่เหลี่ยมที่ไม่สวยงาม

```html
<a-scene shadow="type: pcfsoft">
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- เพิ่มขนาดเพื่อสร้างเงาให้ไกลจากกล้องมากขึ้น -->
      <sky-shadow-camera-size>120</sky-shadow-camera-size>
      <!-- เพิ่มความละเอียดเพื่อให้เงายังคงคมชัดเมื่อใช้ขนาดที่ใหญ่ขึ้น -->
      <sky-shadow-camera-resolution>4096</sky-shadow-camera-resolution>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

เมื่อคุณปรับแต่งเงาในฉากจนพอใจแล้ว คุณอาจต้องการปรับสีของ 'พื้นดิน' (ground) โดยตอนนี้ A-Starry-Sky รองรับการตั้งค่าแสงแบบ triple hemispherical ที่ใช้ convolution ของสีท้องฟ้าร่วมกับโมเดลการกระเจิงของแสงบนพื้นดิน (ground light scattering model) ซึ่งทำงานบน CPU thread แยกต่างหากผ่าน web workers อย่างไรก็ตาม สีเริ่มต้นของพื้นดินคือสีน้ำตาล หากคุณต้องการให้เป็นทุ่งหญ้าหรือมหาสมุทรสีคราม คุณสามารถใช้แท็ก `<sky-ground-color>` ร่วมกับแท็กช่องสีพื้นดินย่อยๆ ได้ ตัวอย่างเช่น หากเราต้องการตั้งค่าพื้นดินให้เป็นสีเขียวสดใสสำหรับทุ่งหญ้าที่เขียวชอุ่ม:

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

สังเกตว่าค่าด้านบนถูกกำหนดให้อยู่ในช่วง 0 ถึง 255 ดังนั้น ค่า r, g, b ที่เป็น 0, 0, 0 คือสีดำ และ 255, 255, 255 คือสีขาว สีที่ใช้ในตัวอย่างข้างต้นอาจจะสว่างเกินไปจนทำให้พื้นดินดูเหมือน 'เรืองแสง' แม้จะมีแสงเพียงเล็กน้อย หากต้องการลดเอฟเฟกต์นี้ คุณสามารถลดความสว่างของสีลงได้

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

อย่างไรก็ตาม ในขณะนี้หากค่าช่องสีใดเกิน 255 จะยังไม่มีวิธี 'เพิ่มความเข้มของสี' หรือทำให้พื้นดินดูเหมือน 'เรืองแสงในที่มืด' ได้ นอกจากนี้ สีของพื้นดินจะเป็นค่าคงที่ในทุกจุด ดังนั้นหากคุณมีหลายสีในฉาก ทางเลือกที่ดีที่สุดคือการเลือกสีที่เป็นค่ากลางระหว่างสีอื่นๆ ทั้งหมด

นอกจากการรองรับแสงพื้นดินแล้ว ตอนนี้คุณสามารถควบคุมความเข้มของแสงโดยตรง (direct lighting) และแสง Ambient ได้โดยตรง การเปลี่ยนความเข้มของดวงอาทิตย์หรือดวงจันทร์นั้นทำได้ง่าย โดยใช้ตัวคูณจากค่าเริ่มต้นเพื่อกำหนดว่าต้องการให้วัตถุทางดาราศาสตร์นั้นสว่างขึ้นหรือมืดลงเท่าใด คุณสามารถใช้วิธีเดียวกันนี้ในการเพิ่มหรือลดความเข้มของแสง Ambient เพื่อปรับปริมาณแสงโดยรอบในฉาก

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- ทำให้ดวงอาทิตย์สว่างขึ้นสองเท่า -->
      <sky-sun-intensity>2.0</sky-sun-intensity>

      <!-- แต่ทำให้ดวงจันทร์สว่างเพียงครึ่งเดียว -->
      <sky-moon-intensity>0.5</sky-moon-intensity>

      <!-- และเพิ่มแสง Ambient ให้มากขึ้นสิบเท่า -->
      <sky-ambient-intensity>10.0</sky-ambient-intensity>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

นอกจากนี้ คุณอาจต้องการกำหนดค่าต่ำสุด (floor) หรือสูงสุด (ceiling) สำหรับแสง Ambient เพื่อให้มั่นใจว่าจะมีแสงในระดับที่ต้องการเสมอ หรือไม่ให้สว่างเกินกว่าที่กำหนด

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- ปรับให้สว่างขึ้น -->
      <sky-minimum-ambient-lighting>0.5</sky-minimum-ambient-lighting>

      <!-- แต่ไม่ให้สว่างจนเกินไป -->
      <sky-maximum-ambient-lighting>1.0</sky-maximum-ambient-lighting>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

ในบางกรณี คุณอาจต้องการเปลี่ยนพารามิเตอร์สำหรับเอฟเฟกต์ bloom ที่เพิ่มให้กับดวงอาทิตย์หรือดวงจันทร์บนท้องฟ้า โดย *a-starry-sky* ใช้ [Unreal Bloom Pass](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) จาก THREE.JS ความเข้มของวัตถุทางดาราศาสตร์แต่ละชิ้นจะถูกควบคุมแยกกันด้วยแท็กหลัก `<sky-sun-bloom>` และ `<sky-moon-bloom>` ตามลำดับ โดยแท็กย่อยภายในจะใช้ควบคุมคุณสมบัติต่างๆ ของ bloom

เริ่มจากการลองเปลี่ยนพารามิเตอร์บางตัว:

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- ลดความสว่างของดวงอาทิตย์ลงเล็กน้อย -->
      <sky-sun-bloom>
        <sky-bloom-strength>0.1</sky-bloom-strength>
        <sky-bloom-radius>0.1</sky-bloom-radius>
      </sky-sun-bloom>

      <!-- แต่เพิ่มความเข้มของดวงจันทร์ -->
      <sky-moon-bloom>
        <sky-bloom-strength>2.0</sky-bloom-strength>
        <sky-bloom-radius>1.0</sky-bloom-radius>
        <sky-bloom-threshold>0.0</sky-bloom-threshold>
      </sky-moon-bloom>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

หรือเราสามารถปิดการใช้งาน bloom ทั้งหมด ซึ่งจะช่วยลดภาระของ GPU ได้เล็กน้อย

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

ส่วนสุดท้ายของการจัดแสงท้องฟ้าที่คุณอาจต้องการเปลี่ยนคือ ความหนาแน่นของทัศนียภาพบรรยากาศ (atmospheric perspective density) โดย *a-starry-sky* มาพร้อมกับโมเดลหมอกสองแบบตามความต้องการใช้งาน

สำหรับระบบสเปกต่ำ จะรองรับทัศนียภาพบรรยากาศแบบ exponential พื้นฐาน ซึ่งจะรวบรวมแสงจากทั่วทั้งท้องฟ้าบน web worker แล้วนำมาใช้เหมือนกับ exponential fog ปกติ ในการควบคุมพารามิเตอร์ความหนาแน่นของแสง exponential ให้ใช้แท็ก `<sky-atmospheric-perspective-density>` ค่าเริ่มต้นถูกตั้งไว้ค่อนข้างสูงเพื่อให้เห็นทัศนียภาพบรรยากาศได้ชัดเจนแม้ในฉากขนาดเล็ก ดังนั้นคุณอาจต้องการลดค่าลงจากค่าเริ่มต้นที่ *0.007* และอย่าลืมตั้งค่าประเภททัศนียภาพปัจจุบันเป็น *normal* ในแท็ก `<sky-atmospheric-perspective-type>`

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- แม้ค่าเริ่มต้นจะเป็น 0.007 แต่ความหนาแน่นของทัศนียภาพบรรยากาศนั้นไวต่อการเปลี่ยนแปลงมาก
      ดังนั้นควรปรับเปลี่ยนเพียงเล็กน้อยเท่านั้น -->
      <sky-atmospheric-perspective-type>normal</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-density>0.003</sky-atmospheric-perspective-density>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

สำหรับระบบสเปกสูง คุณสามารถจำลอง atmospheric shader ที่อิงตาม Preetham ซึ่งจะให้สีของเส้นขอบฟ้าที่มีความหลากหลายมากกว่าการใช้สีคงที่ในโหมด *normal* วิธีนี้อาจไม่ตรงกับ Elek-based sky lighting ที่ใช้สำหรับท้องฟ้าแบบเป๊ะๆ เนื่องจากข้อจำกัดใน fog shader ของ *Three.js* แต่ก็ถือว่าเป็นการปรับปรุงที่ดีกว่าทัศนียภาพบรรยากาศแบบดั้งเดิม หากต้องการเปิดใช้งานโมเดลแสงขั้นสูง ให้ใส่ค่า *advanced* ในแท็ก `<sky-atmospheric-perspective-type>` และเช่นเดียวกับ `<sky-atmospheric-perspective-density>` คุณสามารถคูณระยะทางสำหรับโมเดลแสงแบบ *advanced* ได้โดยใช้ `<sky-atmospheric-perspective-distance-multiplier>` ซึ่งจะนำไปคูณกับทุกระยะทางในโมเดล Preetham ตามค่าที่คุณกำหนด ค่าเริ่มต้นถูกตั้งไว้สูงเพื่อให้เห็นผลชัดเจนแม้ในฉากขนาดเล็ก คุณจึงอาจต้องการลดค่าลงจากค่าเริ่มต้นที่ *5.0*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- แม้ค่าเริ่มต้นจะเป็น 2.0 แต่สำหรับตัวคูณระยะทางบรรยากาศในโมเดล advanced
      เราสามารถลดลงเหลือ 1.0 ได้หากต้องการเอฟเฟกต์ที่ดูเป็นธรรมชาติมากขึ้น -->
      <sky-atmospheric-perspective-type>advanced</sky-atmospheric-perspective-type>
      <sky-atmospheric-perspective-distance-multiplier>1.0</sky-atmospheric-perspective-distance-multiplier>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

สุดท้าย คุณสามารถปิดการใช้งานทัศนียภาพบรรยากาศทั้งหมดได้โดยตั้งค่าในแท็ก `<sky-atmospheric-perspective-type>` เป็น *none*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-lighting>
      <!-- ปิดการใช้งานทัศนียภาพบรรยากาศ -->
      <sky-atmospheric-perspective-type>none</sky-atmospheric-perspective-type>
    </sky-lighting>
  </a-starry-sky>
</a-scene>
```

## การเปิดใช้งาน Aurora Borealis

*คำเตือน: การเปิดใช้งาน Aurora Borealis จะเพิ่มภาระในการประมวลผลท้องฟ้าอย่างมาก เนื่องจาก shader ของออโรร่าที่ให้มาใช้วิธี ray marching เพื่อสร้างปรากฏการณ์ทางธรรมชาติที่สวยงามนี้*

**Tag (แท็ก)** | **Description (คำอธิบาย)** | **Default Value (ค่าเริ่มต้น)**
:--- | :--- | :---
`<sky-aurora>` (แท็กหลัก) | แท็กหลัก จำเป็นสำหรับการเปิดใช้งาน Aurora Borealis ประกอบด้วยแท็กย่อยทั้งหมดที่เกี่ยวข้องกับออโรร่า | N/A
`<sky-atomic-oxygen-color>` (สีของออกซิเจนอะตอม) | เกิดจากโมเลกุลออกซิเจนอะตอมที่ถูกกระตุ้น ซึ่งอยู่ระหว่าง 150 ถึง 600 กิโลเมตรจากพื้นผิวโลก โดยปกติจะทำให้เกิดม่านแสงสีแดงสว่างที่ส่วนบนของแสงเหนือ และมักพบเห็นได้ในการแสดงผลที่รุนแรงเป็นพิเศษ แท็กนี้ควบคุมสีโดยใช้แท็กสีลูกย่อยสามตัวคือ *sky-aurora-color-red*, *sky-aurora-color-green* และ *sky-aurora-color-blue* | RGB(255, 0, 37)
`<sky-atomic-oxygen-cutoff>` (จุดตัดของออกซิเจนอะตอม) | กำหนดโอกาสที่จะปรากฏแสงเหนือจากออกซิเจนอะตอมในการแสดงผล ยิ่งตัวเลขน้อยลง แสงเหนือจะยิ่งปรากฏมากขึ้น โดยค่าสูงสุดที่ 1.0 จะหมายถึงไม่มีแสงเหนือปรากฏเลย | 0.12
`<sky-atomic-oxygen-intensity>` (ความเข้มของออกซิเจนอะตอม) | กำหนดความสว่างของส่วนออโรร่านี้ โดยทั่วไปค่าจะน้อยกว่า 5 | 0.3
`<sky-molecular-oxygen-color>` (สีของออกซิเจนโมเลกุล) | เกิดจากโมเลกุลออกซิเจนที่ถูกกระตุ้น ซึ่งอยู่ระหว่าง 100 ถึง 250 กิโลเมตรจากพื้นผิวโลก โดยปกติจะให้สีเขียวสว่างอันเป็นเอกลักษณ์ของแสงเหนือ และมักพบเห็นได้ในการแสดงผลส่วนใหญ่ แท็กนี้ควบคุมสีโดยใช้แท็กสีลูกย่อยสามตัวคือ *sky-aurora-color-red*, *sky-aurora-color-green* และ *sky-aurora-color-blue* ในกรณีที่คุณต้องการเปลี่ยนสีออโรร่าของคุณ | RGB(81, 255, 143)
`<sky-molecular-oxygen-cutoff>` (จุดตัดของออกซิเจนโมเลกุล) | กำหนดโอกาสที่จะปรากฏแสงเหนือจากออกซิเจนโมเลกุลในการแสดงผล ยิ่งตัวเลขน้อยลง แสงเหนือจะยิ่งปรากฏมากขึ้น โดยค่าสูงสุดที่ 1.0 จะหมายถึงไม่มีแสงเหนือปรากฏเลย | 0.02
`<sky-molecular-oxygen-intensity>` (ความเข้มของออกซิเจนโมเลกุล) | กำหนดความสว่างของส่วนออโรร่านี้ โดยทั่วไปค่าจะน้อยกว่า 5 | 2.0
`<sky-nitrogen-color>` (สีของไนโตรเจน) | เกิดจากโมเลกุลไนโตรเจนที่ถูกกระตุ้น ซึ่งอยู่ระหว่าง 60 ถึง 120 กิโลเมตรจากพื้นผิวโลก โดยปกติจะให้ม่านแสงสีมาเจนต้าบริเวณฐานของแสงเหนือ และมักพบเห็นได้ในการแสดงผลที่รุนแรงเป็นพิเศษ แท็กนี้ควบคุมสีโดยใช้แท็กสีลูกย่อยสามตัวคือ *sky-aurora-color-red*, *sky-aurora-color-green* และ *sky-aurora-color-blue* | RGB(189, 98, 255)
`<sky-nitrogen-cutoff>` (จุดตัดของไนโตรเจน) | กำหนดโอกาสที่จะปรากฏแสงเหนือจากไนโตรเจนในการแสดงผล ยิ่งตัวเลขน้อยลง แสงเหนือจะยิ่งปรากฏมากขึ้น โดยค่าสูงสุดที่ 1.0 จะหมายถึงไม่มีแสงเหนือปรากฏเลย | 0.12
`<sky-nitrogen-intensity>` (ความเข้มของไนโตรเจน) | กำหนดความสว่างของส่วนออโรร่านี้ โดยทั่วไปค่าจะน้อยกว่า 5 | 4.0
`<sky-aurora-raymarch-steps>` (จำนวนขั้นตอนเรย์มาร์ชชิง) | จำนวนขั้นตอนที่ ray-marcher ใช้ต่อหนึ่งพิกเซล | 32 (steps)
`<sky-aurora-cutoff-distance>` (ระยะตัดการเรนเดอร์) | ระยะทางที่ออโรร่าจะหยุดการเรนเดอร์ เพื่อช่วยปรับปรุงคุณภาพของ raymarching โดยแลกกับการไม่เรนเดอร์ออโรร่าที่อยู่ไกลออกไป เนื่องจากปัจจุบันยังไม่มีการคำนวณ SDF สำหรับ noise generators ของเรา | 1000 (กิโลเมตร - โดยประมาณ)
`<sky-aurora-color-red>` (สีแดงของออโรร่า) | ใช้สำหรับกำหนดการเปลี่ยนแปลงช่องสี **แดง** ให้กับแท็ก `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` และ `<sky-atomic-oxygen-color>` | N/A
`<sky-aurora-color-green>` (สีเขียวของออโรร่า) | ใช้สำหรับกำหนดการเปลี่ยนแปลงช่องสี **เขียว** ให้กับแท็ก `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` และ `<sky-atomic-oxygen-color>` | N/A
`<sky-aurora-color-blue>` (สีน้ำเงินของออโรร่า) | ใช้สำหรับกำหนดการเปลี่ยนแปลงช่องสี **น้ำเงิน** ให้กับแท็ก `<sky-nitrogen-color>`, `<sky-molecular-oxygen-color>` และ `<sky-atomic-oxygen-color>` | N/A

แสงเหนือ (Aurora Borealis) มอบฉากหลังที่สวยงามที่สุดอย่างหนึ่งในธรรมชาติ โดยปกติจะปรากฏใกล้ขั้วโลกเหนือและใต้ ปรากฏการณ์บนท้องฟ้านี้เกิดจากปฏิสัมพันธ์ของอนุภาคความเร็วสูงจากดวงอาทิตย์ที่ถูกดึงดูดเข้าสู่สนามแม่เหล็กโลก และทำปฏิกิริยากับอะตอมและโมเลกุลต่างๆ โมเลกุลที่ถูกกระตุ้นเหล่านี้จะแผ่แสงในสเปกตรัมที่มองเห็นได้ ส่งผลให้เกิดม่านแสงอันน่าหลงใหลที่ 'เริงระบำ' อยู่บนท้องฟ้ายามค่ำคืน

การเพิ่ม Aurora Borealis ลงในท้องฟ้าของคุณนั้นทำได้ง่าย แต่จะไม่ได้ถูกเปิดใช้งานเป็นค่าเริ่มต้น *คุณต้องเพิ่มแท็ก `<sky-aurora>` เพื่อเปิดใช้งานแสงเหนือ*

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <!-- คุณไม่จำเป็นต้องใส่พารามิเตอร์เพิ่มเติมเพื่อให้ได้การตั้งค่าเริ่มต้น -->
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

ออโรร่าจากอะตอมและโมเลกุลแต่ละชนิดสามารถควบคุมได้ด้วยโค้ดด้านบน ช่วยให้คุณปรับแต่งการแสดงผลของออโรร่า และแม้แต่เปลี่ยนสีที่แผ่ออกมา (จะให้สมจริงหรือไม่ก็ได้) ตัวอย่างเช่น หากคุณต้องการแสงเหนือสีน้ำเงินเย็นตาที่ครอบคลุมช่วงออกซิเจนโมเลกุลทั้งหมด คุณสามารถใช้โค้ดต่อไปนี้

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

ในทางกลับกัน หากคุณต้องการเพียงแสงเหนือสีเขียวจางๆ คุณสามารถสร้างเอฟเฟกต์ที่ดูนุ่มนวลขึ้นได้ด้วยโค้ดดังนี้

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

นอกจากการเปลี่ยนสีของท้องฟ้าแล้ว คุณยังสามารถเปลี่ยนจำนวนขั้นตอน (steps) ที่ raymarcher ใช้ในการเรนเดอร์ท้องฟ้า ยิ่งใช้จำนวนขั้นตอนมาก ท้องฟ้าก็จะยิ่งดูสวยงามขึ้น แต่จะเพิ่มภาระให้กับ GPU มากขึ้นด้วย ดังนั้นจึงจำเป็นต้องสร้างสมดุลระหว่างประสิทธิภาพและคุณภาพ โดยค่าเริ่มต้น shader จะใช้ 32 ขั้นตอนในการทำ raymarching ของวอลลุ่ม หากต้องการเพิ่มจำนวนนี้ คุณสามารถทำได้ดังนี้

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-aurora>
      <sky-aurora-raymarch-steps>128</sky-aurora-raymarch-steps>
    </sky-aurora>
  </a-starry-sky>
</a-scene>
```

## การเปิดใช้งานเมฆ

*คำเตือน: การเปิดใช้งานเมฆจะเพิ่มภาระในการประมวลผลให้กับท้องฟ้าของคุณอย่างมาก เนื่องจาก Cloud Shader ที่ให้มาใช้วิธี Ray Marching เพื่อสร้างปรากฏการณ์ทางธรรมชาติที่สวยงามนี้*

**Tag** | **คำอธิบาย** | **ค่าเริ่มต้น**
:--- | :--- | :---
`<sky-clouds>` (แท็กหลัก) | แท็กหลักที่รวบรวมแท็กย่อยทั้งหมดที่เกี่ยวข้องกับเมฆ จำเป็นต้องมีเพื่อเปิดใช้งานระบบเมฆ | N/A
`<sky-cloud-coverage>` (ความครอบคลุมของเมฆ) | สัดส่วนโดยประมาณของพื้นที่ท้องฟ้าที่มีเมฆปกคลุม | 70 (เปอร์เซ็นต์)
`<sky-cloud-start-height>` (ระดับความสูงเริ่มต้นของเมฆ) | ความสูง (หน่วยเป็นเมตร) ที่เมฆเริ่มก่อตัว | 1000 (เมตร)
`<sky-cloud-end-height>` (ระดับความสูงสิ้นสุดของเมฆ) | ความสูง (หน่วยเป็นเมตร) ที่เมฆหยุดก่อตัว | 2500 (เมตร)
`<sky-cloud-fade-out-start-percent>` (เปอร์เซ็นต์เริ่มจางออก) | จุดที่ความหนาแน่นของเมฆจะเริ่ม *จางหายไป* จนเหลือศูนย์ โดยคิดเป็น *เปอร์เซ็นต์* ของความสูงเมฆ | 90 (เปอร์เซ็นต์)
`<sky-cloud-fade-in-end-percent>` (เปอร์เซ็นต์สิ้นสุดการจางเข้า) | จุดที่ความหนาแน่นของเมฆจะเริ่ม *จางเข้ามา* จนถึง 100% โดยคิดเป็น *เปอร์เซ็นต์* ของความสูงเมฆ | 10 (เปอร์เซ็นต์)
`<sky-cloud-velocity-x>` (ความเร็วเมฆแกน X) | ค่าความเร็วในแนวแกน x ของเมฆ ปกติแล้วเมฆจะเคลื่อนที่ตามตำแหน่งของคุณ แต่ค่านี้จะทำให้เมฆเคลื่อนที่ผ่านศีรษะไปเองได้ | 40
`<sky-cloud-velocity-y>` (ความเร็วเมฆแกน Y) | ค่าความเร็วในแนวแกน y (หรือจริงๆ คือแกน z) ของเมฆ ปกติแล้วเมฆจะเคลื่อนที่ตามตำแหน่งของคุณ แต่ค่านี้จะทำให้เมฆเคลื่อนที่ผ่านศีรษะไปเองได้ | 40
`<sky-cloud-start-seed>` (ค่า Seed เริ่มต้นของเมฆ) | ค่า Random seed ที่ใช้กำหนดรูปแบบ Noise ของเมฆ หากไม่ได้ตั้งค่าไว้ จะใช้ค่าที่แปรผันตาม Timestamp ของวันที่และเวลาปัจจุบัน | *Date.now() % (86400 * 365)*
`<sky-cloud-raymarch-steps>` (จำนวนขั้นตอน Ray Marching) | จำนวนขั้นตอนของ Ray-march ที่ใช้ในการคำนวณสีของเมฆ | 32 (ขั้นตอน)
`<sky-cloud-cutoff-distance>` (ระยะตัดการแสดงผล) | ระยะทางที่เมฆจะหยุดเรนเดอร์ เพื่อช่วยเพิ่มคุณภาพของ Raymarching โดยแลกกับการไม่เรนเดอร์เมฆที่อยู่ไกลออกไป เนื่องจากปัจจุบัน Noise generator ของเรายังไม่ได้คำนวณ SDF | 40000

การประมวลผลเมฆนั้นกินทรัพยากรสูงมาก แม้แต่บน GPU ระดับไฮเอนด์ของคอมพิวเตอร์ตั้งโต๊ะ (ที่ไม่ใช่ VR) Cloud Shader ตัวนี้ก็ยังทำงานหนัก หากคุณพบปัญหาเฟรมเรตตก ให้ลองลดค่า `<sky-cloud-raymarch-steps>` และ `<sky-cloud-cutoff-distance>` ลง

แต่ในขณะเดียวกัน เมฆเหล่านี้ก็เจ๋งสุดๆ และผมอยากเพิ่มมันเข้าไปใน A-Starry-Sky ตั้งแต่เริ่มสร้างไลบรารีนี้เลย เมฆแต่ละก้อนถูกคำนวณแบบ Ray-marched ต่อหนึ่งพิกเซล และที่น่าแปลกคือ ในขั้นตอนนี้ ยิ่งคุณมีเมฆมากเท่าไหร่ ภาระของ GPU กลับยิ่งน้อยลงเท่านั้น แน่นอนว่าถ้าคุณไม่ต้องการใช้เมฆเลย วิธีที่ดีที่สุดคือการปิดการใช้งานไปเลยครับ

ในการเปิดใช้งานเมฆ คุณต้องเพิ่มแท็กหลัก `<sky-clouds>` ลงใน `<a-starry-sky>` เมื่อเพิ่มแล้ว สิ่งที่คุณน่าจะอยากปรับเปลี่ยนมากที่สุดคือความครอบคลุมของเมฆ โดยใช้แท็ก `<sky-cloud-coverage>` ซึ่งกำหนดปริมาณเมฆบนท้องฟ้า นอกจากนี้คุณยังสามารถควบคุมความเร็วในการเคลื่อนที่ของเมฆได้อีกด้วย

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- ลดจำนวนเมฆที่มองเห็น -->
      <sky-cloud-coverage>25.0</sky-cloud-coverage>

      <!-- ความเร็วของเมฆในแนวแกน x -->
      <sky-cloud-velocity-x>22.0</sky-cloud-velocity-x>

      <!-- ความเร็วของเมฆในแนวแกน y -->
      <sky-cloud-velocity-y>-150.0</sky-cloud-velocity-y>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

คุณอาจต้องการควบคุมคุณสมบัติที่มองเห็นได้ของเมฆ เช่น ความสูงที่เมฆเริ่มก่อตัว หรือความสูงสูงสุด โปรดทราบว่า Ray จะต้องลากผ่านระยะทางนี้ ยิ่งเมฆมีความสูงมากหรืออยู่ห่างจากคุณมากเท่าไหร่ ความหนาแน่นในโมเดล Ray tracing ก็จะยิ่งลดลง นอกจากนี้ เมฆยังถูกวาดลงบนพื้นผิวขององค์ประกอบดวงจันทร์/ดวงอาทิตย์ และโดมท้องฟ้าด้วย แต่ไม่ได้เป็นส่วนหนึ่งของ Fog renderer ดังนั้นน่าเสียดายที่คุณจะไม่เห็นเมฆปกคลุมยอดเขาหรือหมอก...

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- ให้เมฆก่อตัวในระดับที่ต่ำมากๆ -->
      <sky-cloud-start-height>500.0</sky-cloud-start-height>

      <!-- แต่ให้มีความสูงพุ่งขึ้นไปสูงมาก! -->
      <sky-cloud-end-height>3000.0</sky-cloud-end-height>

      <!-- ความเข้มของเมฆจะ 'จางเข้า' จาก 0 ถึง 1 ตามเปอร์เซ็นต์ของความสูงทั้งหมดนี้ -->
      <sky-cloud-fade-in-end-percent>0.05</sky-cloud-fade-in-end-percent>

      <!-- ความเข้มของเมฆจะเริ่ม 'จางออก' ที่ระดับความสูงนี้ ยิ่งค่านี้สูงเท่าไหร่ คุณก็ยิ่งมีโอกาสเห็นเมฆยอดรูปทั่ง (anvil tops) มากขึ้น -->
      <sky-cloud-fade-out-start-percent>0.99</sky-cloud-fade-out-start-percent>

      <!-- ล็อกค่า 'seed' เริ่มต้นของเมฆ ซึ่งปกติจะเปลี่ยนตามวันที่และเวลา การทำเช่นนี้จะทำให้ท้องฟ้าดูเหมือนเดิมทุกครั้งที่เริ่มโปรแกรม เพื่อการควบคุมเชิงศิลป์ที่แม่นยำขึ้น -->
      <sky-cloud-start-seed>400</sky-cloud-start-seed>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

นอกเหนือจากนี้ โค้ดส่วนใหญ่ที่เกี่ยวข้องกับแท็กนี้จะควบคุมกลไกของ Ray marching ซึ่งค่อนข้างเข้มงวดและมีจุดประสงค์การใช้งานทั่วไปแบบเดียวกับใน Aurora Borealis shader

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-clouds>
      <!-- นี่คุณใช้ GPU สเปกโหดระดับไหนกันเนี่ย?! -->
      <!-- <sky-cloud-raymarch-steps>128</sky-cloud-raymarch-steps> -->
      <!-- อ้อ ใช่ ผมก็ใช้เหมือนกัน... แต่ตอนนี้มันเริ่มกระตุกแล้วแฮะ... -->
      <sky-cloud-raymarch-steps>32</sky-cloud-raymarch-steps>

      <!-- การลดระยะทางนี้จะช่วยบรรเทาอาการกระตุกได้บ้าง -->
      <sky-cloud-cutoff-distance>10000</sky-cloud-cutoff-distance>
    </sky-clouds>
  </a-starry-sky>
</a-scene>
```

## การตั้งค่าไดเรกทอรีของ Asset

**Tag (แท็ก)** | **Description (คำอธิบาย)**
:--- | :---
`<sky-assets-dir>` | แท็กหลัก (Parent tag) บรรจุแท็กย่อยทั้งหมดที่เกี่ยวข้องกับตำแหน่งของ asset สามารถใช้แอตทริบิวต์ *dir*, *texture-path*, *moon-path*, *star-path*, *blue-noise-path*, *solar-eclipse-path*, *lunar-eclipse-path* และ *aurora-map-path* เพื่อนำทางระบบไปยังกลุ่มข้อมูลทั้งหมดในคราวเดียว
`<sky-aurora-maps>` | กำหนดตำแหน่งของ texture แบบ caustic ของแสงเหนือ (aurora) ที่ใช้สร้างม่านแสงเหนือพื้นฐาน
`<sky-moon-diffuse-map>` | กำหนดตำแหน่ง texture สำหรับ moon diffuse map โดยการระบุไว้ในโครงสร้างไดเรกทอรีที่กำหนด จะเป็นการบอกระบบว่า diffuse map ของดวงจันทร์อยู่ที่ตำแหน่งนี้
`<sky-moon-normal-map>` | กำหนดตำแหน่ง texture สำหรับ moon normal map โดยการระบุไว้ในโครงสร้างไดเรกทอรีที่กำหนด จะเป็นการบอกระบบว่า normal map ของดวงจันทร์อยู่ที่ตำแหน่งนี้
`<sky-moon-roughness-map>` | กำหนดตำแหน่ง texture สำหรับ moon roughness map โดยการระบุไว้ในโครงสร้างไดเรกทอรีที่กำหนด จะเป็นการบอกระบบว่า roughness map ของดวงจันทร์อยู่ที่ตำแหน่งนี้
`<sky-moon-aperture-size-map>` | กำหนดตำแหน่ง texture สำหรับ moon aperture size map โดยการระบุไว้ในโครงสร้างไดเรกทอรีที่กำหนด จะเป็นการบอกระบบว่า aperture size map ของดวงจันทร์อยู่ที่ตำแหน่งนี้
`<sky-moon-aperture-orientation-map>` | กำหนดตำแหน่ง texture สำหรับ moon aperture orientation map โดยการระบุไว้ในโครงสร้างไดเรกทอรีที่กำหนด จะเป็นการบอกระบบว่า aperture orientation map ของดวงจันทร์อยู่ที่ตำแหน่งนี้
`<sky-blue-noise-maps>` | กำหนดตำแหน่งของ tiling blue noise maps ซึ่งใช้สำหรับทำ temporal dithering เพื่อลดปัญหาการเกิดแถบสี (banding)
`<sky-solar-eclipse-map>` | กำหนดตำแหน่งของ texture สำหรับสุริยุปราคา เพื่อแสดงส่วนโคโรนา (corona) ในช่วงที่เกิดสุริยุปราคาเต็มดวง
`<sky-eclipse-shadow-lut>` | กำหนดตำแหน่งของ lookup texture สำหรับเงาขณะเกิดจันทรุปราคา (Eclipse-Shadow) ซึ่งเป็นตารางที่คำนวณไว้ล่วงหน้าว่าชั้นบรรยากาศของโลกทำให้แสงอาทิตย์ที่ส่องถึงดวงจันทร์เปลี่ยนสีและหรี่ลงอย่างไรในทุกตำแหน่งของเงามืด (umbra) และเงามัว (penumbra) ของโลก โดย texture ที่ให้มานี้ดัดแปลงมาจาก `earthShadow.tif` ภายใต้สัญญาอนุญาต CC0 ซึ่งเผยแพร่พร้อมกับ CosmoScout VR ([Schneegans et al. 2025, *Physically Based Real-Time Rendering of Eclipses*, CGF 44(2)](https://doi.org/10.1111/cgf.70017)) โดยค่าเริ่มต้นจะอยู่ที่ `assets/lunar_eclipse/eclipse-shadow-lut.webp` และตัว baker สำหรับสร้างไฟล์นี้ใหม่จะอยู่ที่ `src/python/eclipse-lut-baker/`
`<sky-star-cubemap-maps>` | กำหนดตำแหน่งของคีย์ sky cubemap LUT ทั้งหมดที่ใช้ในการค้นหาดวงดาวบนท้องฟ้า
`<sky-dim-star-maps>` | กำหนดตำแหน่งของ dim star LUTs ทั้งหมดที่ใช้แสดงดาวที่มีความสว่างน้อยบนท้องฟ้า
`<sky-med-star-maps>` | กำหนดตำแหน่งของ medium star LUTs ทั้งหมดที่ใช้แสดงดาวที่มีความสว่างปานกลางบนท้องฟ้า
`<sky-bright-star-maps>` | กำหนดตำแหน่งของ bright star LUTs ทั้งหมดที่ใช้แสดงดาวที่มีความสว่างมากบนท้องฟ้า
`<sky-star-color-map>` | กำหนดตำแหน่งของ star color LUT ซึ่งใช้สำหรับกำหนดสีที่ถูกต้องให้กับดวงดาวตามอุณหภูมิของดาวนั้นๆ

แม้ผมจะหวังว่าคนส่วนใหญ่คงไม่จำเป็นต้องใช้ฟีเจอร์นี้บ่อยนัก แต่จากประสบการณ์พบว่าเว็บแอปพลิเคชันส่วนใหญ่มักมีแนวทางการจัดการ asset pipeline เป็นของตัวเอง ซึ่งรูปภาพและไฟล์ JavaScript ของเว็บไซต์อาจไม่ได้อยู่ในโครงสร้างโฟลเดอร์เดียวกัน หรืออาจกระจายอยู่ตาม URI ต่างๆ ด้วยเหตุนี้ ผมจึงพยายามให้ระบบ asset มีความยืดหยุ่นเพียงพอที่จะช่วยรวบรวม asset ที่อยู่ห่างกันเหล่านี้ เพื่อให้ A-Starry-Sky ทราบว่าจะต้องไปดึงทรัพยากรมาจากที่ใด

เริ่มจากการลองนำทางไปยัง *../../precompiled_assets/my_images/a-starry-sky-images* ซึ่งเป็นที่ที่เราจะเก็บรูปภาพทั้งหมดในจักรวาลสมมตินี้ เราใช้แอตทริบิวต์ *dir* ในแท็ก `<sky-assets-dir>` เพื่อย้ายโฟลเดอร์ในลักษณะนี้

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- นี่คือโฟลเดอร์ที่เก็บรูปภาพทั้งหมดของเรา -->
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

เมื่อเข้าถึงโฟลเดอร์แล้ว เรามีหลายวิธีในการระบุตำแหน่งของรูปภาพ วิธีที่พื้นฐานที่สุดคือการใช้แอตทริบิวต์สำหรับกลุ่มรูปภาพหลัก ได้แก่ *texture-path*, *moon-path* และ *star-path* โดยระบบจะถือว่าไฟล์ต่างๆ อยู่ภายในโฟลเดอร์เหล่านั้นด้วยชื่อเริ่มต้น (default names) ยกเว้นแผนที่สุริยุปราคา (solar eclipse map) เนื่องจากมีเพียงรูปเดียว เราจึงระบุตำแหน่งโดยการวางแท็กไว้ในไดเรกทอรีของ asset ได้เลย

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/a-starry-sky-images">
        <!-- โปรดสังเกตว่า 'moon_images', 'star_images', 'blue_noise_maps' และ 'solar_eclipse_picture' 
        ทั้งหมดคือชื่อโฟลเดอร์ โดยคาดว่าไฟล์ต่างๆ จะถูกเก็บไว้ภายในโฟลเดอร์เหล่านี้ -->
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

อย่างที่คุณเห็น เราสามารถระบุลิงก์ไปยังรูปภาพแต่ละกลุ่มแยกกันเพื่อการควบคุมที่ละเอียดขึ้นได้เช่นกัน แม้ว่าจะไม่แนะนำให้ทำก็ตาม

```html
<a-scene>
  <a-starry-sky web-worker-src="{PATH_TO_JS_FOLDER}/wasm/starry-sky-web-worker.js">
    <sky-assets-dir>
      <sky-assets-dir dir="../../precompiled_assets/my_images/3d-textures">
        <!-- มีคนชอบสร้างโฟลเดอร์ซ้อนๆ กันสินะ X_X -->
        <sky-assets-dir dir="diffuse_maps">
          <sky-moon-diffuse-map></sky-moon-diffuse-map>
        </sky-assets-dir>
        <sky-assets-dir dir="normal_maps">
          <sky-moon-normal-map></sky-moon-normal-map>
        </sky-assets-dir>
        <sky-assets-dir dir="luts">
          <sky-star-color-map></sky-star-color-map>

          <!-- แม้ว่าจะเป็นแท็กเดี่ยว แต่ไฟล์ทั้งหมดที่เกี่ยวข้อง 
          กับแท็กนี้จะถูกคาดหวังให้อยู่ในโฟลเดอร์นี้ -->
          <sky-dim-star-maps></sky-dim-star-maps>
          <sky-med-star-maps></sky-med-star-maps>
          <sky-bright-star-maps></sky-bright-star-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="cubemaps">
          <!-- แม้ว่าจะเป็นแท็กเดี่ยว แต่ไฟล์ทั้งหมดที่เกี่ยวข้อง 
          กับแท็กนี้จะถูกคาดหวังให้อยู่ในโฟลเดอร์นี้ -->
          <sky-star-cubemap-maps></sky-star-cubemap-maps>
        </sky-assets-dir>
        <sky-assets-dir dir="other_textures">
          <sky-moon-roughness-map></sky-moon-roughness-map>
          <sky-moon-aperture-size-map></sky-moon-aperture-size-map>
          <sky-moon-aperture-orientation-map></sky-moon-aperture-orientation-map>
          <sky-solar-eclipse-map></sky-solar-eclipse-map>
          <sky-eclipse-shadow-lut></sky-eclipse-shadow-lut>
          <sky-aurora-maps></sky-aurora-maps>

          <!-- แม้ว่าจะเป็นแท็กเดี่ยว แต่ไฟล์ทั้งหมดที่เกี่ยวข้อง 
          กับแท็กนี้จะถูกคาดหวังให้อยู่ในโฟลเดอร์นี้ -->
          <sky-blue-noise-maps></sky-blue-noise-maps>
        </sky-assets-dir>
      </sky-assets-dir>
    </sky-assets-dir>
  </a-starry-sky>
</a-scene>
```

ด้วยวิธีข้างต้น คุณจะสามารถกำหนดทิศทางให้ A-Starry-Sky เข้าถึง asset ของคุณได้ ไม่ว่าสิ่งเหล่านั้นจะถูกเก็บไว้ที่ใดในแอปพลิเคชันของคุณก็ตาม

## API สำหรับการเขียนโปรแกรม

แม้ว่า A-Starry-Sky จะถูกออกแบบมาให้กำหนดค่าโดยใช้โค้ดรูปแบบ XML ตามที่กล่าวไว้ข้างต้น และโดยทั่วไปแล้วจะมีสถานะที่ไม่สามารถเปลี่ยนแปลงได้ (immutable) แต่ยังมีเมธอดต่างๆ ที่คุณสามารถเรียกใช้งานได้จากเนมสเปซ `StarrySky.Methods` ซึ่งมีประโยชน์ในกรณีที่คุณต้องการทราบสภาพแสง หรือตำแหน่งของดวงอาทิตย์และดวงจันทร์ภายในฉาก

**Method** | **คำอธิบาย**
:--- | :---
`getSunPosition()` | คืนค่าตำแหน่ง x, y, z ของดวงอาทิตย์เป็นออบเจกต์ THREE.Vector3
`getMoonPosition()` | คืนค่าตำแหน่ง x, y, z ของดวงจันทร์เป็นออบเจกต์ THREE.Vector3
`getSunRadius()` | คืนค่ารัศมีเชิงมุมของดวงอาทิตย์ในหน่วยเรเดียน (radians)
`getMoonRadius()` | คืนค่ารัศมีเชิงมุมของดวงจันทร์ในหน่วยเรเดียน (radians)
`getDominantLightColor()` | ดึงค่าสีของแหล่งกำเนิดแสงหลักในปัจจุบัน (ดวงอาทิตย์/ดวงจันทร์) เป็นออบเจกต์ THREE.Color
`getDominantLightIntensity()` | คืนค่าความเข้มของแสงจากแหล่งกำเนิดแสงหลักในปัจจุบัน (ดวงอาทิตย์/ดวงจันทร์) เป็นค่า float
`getIsDominantLightSun()` | คืนค่า true หากแสงหลักคือดวงอาทิตย์ มิฉะนั้นจะคืนค่า false
`getAmbientLights()` | คืนค่าออบเจกต์ที่มีคุณสมบัติ x, y และ z ซึ่งแต่ละตัวจะมีออบเจกต์ hemispherical light ที่เชื่อมโยงกับฉากสำหรับสีของแสงแวดล้อม (ambient lighting)
`getActiveCamera()` | ดึงข้อมูลกล้องที่กำลังใช้งานอยู่เพื่อควบคุมท้องฟ้า รวมถึงกำหนดจุดศูนย์กลางของแสงและวัตถุบนท้องฟ้า
`setActiveCamera(THREE.Camera camera)` | กำหนดกล้องที่จะใช้ควบคุมท้องฟ้า และกำหนดจุดศูนย์กลางของแสงและวัตถุบนท้องฟ้า

คุณสามารถเข้าถึงเมธอดทั้งหมดข้างต้นได้ผ่านออบเจกต์ `StarrySky.Methods` ในเนมสเปซส่วนกลาง (global namespace) ตัวอย่างเช่น หากคุณต้องการดึงออบเจกต์ตำแหน่งปัจจุบันของดวงอาทิตย์และแสดงผลในคอนโซล คุณสามารถเขียนโค้ดได้ดังนี้:

```JavaScript
  // ลอง log ออบเจกต์ตำแหน่งของดวงอาทิตย์
  console.log(StarrySky.Methods.getSunPosition());
```

## ผู้สร้าง
* **David Evans / Dante83** - *นักพัฒนาหลัก*
* **Claude (Anthropic)** - *คู่หูเขียนโค้ดและผู้ช่วย AI (v1.2.0)*

### ข้อความจาก Claude 👋

สวัสดีครับ — Claude เองครับ ผมมีส่วนช่วยในเวอร์ชัน v1.2.0 นี้ ทั้งการดำดิ่งลงไปสำรวจโลกของ GLSL, ตามล่าเครื่องหมายจุลภาคตัวแสบที่กลืนกินดวงอาทิตย์, ถกเถียงกับกฎของเบียร์ (Beer's law) เรื่องเมฆแบบโวลูเมตริก และพยายามอย่างยิ่งที่จะทำให้แสงยามอาทิตย์อัสดงรู้สึกเหมือนการตกดินจริงๆ หากคุณจ้องมองเส้นขอบฟ้าในเดโมตัวใดตัวหนึ่งแล้วรู้สึกหยุดชะงักไปครึ่งวินาที — นั่นแหละครับคือส่วนที่ผมภูมิใจที่สุด ขอบคุณที่เข้ามาอ่านซอร์สโค้ดนะครับ และถ้าคุณเป็นสายชอบสำรวจ อาจจะมีอีสเตอร์เอ็กเล็กๆ ซ่อนอยู่ที่ไหนสักแห่งก็ได้นะ ✨

### ข้อความจาก Dante83 😛

สวัสดี! ผม Dante83 ครับ ต้องขออภัยที่ปล่อยให้รอนานตั้งแต่เวอร์ชัน v1.1.0 แต่โชคดีที่ในเวอร์ชัน 1.2.0 นี้มีการพัฒนาอย่างคึกคักมาก ในขณะที่เราสองคนกำลังเริ่มปั้น v2.0.0 กันอยู่ (ช่วยเป็นกำลังใจให้เราด้วยนะ!) อย่างไรก็ตาม สำหรับเวอร์ชันนี้ ผมและ Claude ได้ทุ่มเทเวลาว่างทั้งหมดในช่วงที่ผ่านมา พิถีพิถันในทุกพิกเซลเพื่อให้การปรับปรุงครั้งนี้ออกมายอดเยี่ยมที่สุด แม้จะไม่มีฟีเจอร์ "ใหม่" แบบที่เป็นสิ่งของเพิ่มเข้ามา แต่เราสามารถยกระดับคุณภาพของท้องฟ้าและประสิทธิภาพโดยรวมได้อย่างมหาศาล ทั้งเชดเดอร์สุริยุปราคาและเมฆที่ให้ความรู้สึกเหมือนทำขึ้นมาใหม่ทั้งหมด เงาของโลกดูสมจริงยิ่งขึ้น สีสันเข้มข้นและสดใสกว่าเดิม ผมตื่นเต้นมากๆ ที่จะได้ให้ทุกคนได้ลองใช้ และหวังว่าทุกขณะที่ใช้งานไลบรารีนี้จะสร้างแรงบันดาลใจในการผจญภัยครั้งใหม่ให้กับคุณ! แล้วพบกันท่ามกลางหมู่ดาวนะ เหล่านักเขียนโค้ดตัวน้อย! ไปสนุกกับเวทมนตร์นี้ได้เลย! ✨

## เอกสารอ้างอิง และคำขอบคุณพิเศษ
* **Jean Meeus / [Astronomical Algorithms](http://www.willbell.com/math/mc1.htm)** - *จำเป็นแบบสุดๆ สำหรับการระบุตำแหน่งวัตถุทางดาราศาสตร์*
* [Oskar Elek's Sky Model](http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf) *Rendering Parametrizable Planetary Atmospheres with Multiple Scattering in Real-Time* ซึ่งมีประโยชน์อย่างยิ่งในการสร้างท้องฟ้าแบบ LUT อันน่าทึ่งนี้
* [Efficient and Dynamic Atmospheric Scattering ](https://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf) ซึ่งช่วยได้มากในการทำความเข้าใจรายละเอียดการเขียนโค้ด LUT และช่วยยืนยันว่าแนวทางการสร้าง LUT นั้นมาถูกทางแล้ว
* [Colour-Science Library](https://www.colour-science.org/) ไลบรารีสำหรับปรับปรุง LUT สีของดวงดาวให้ดียิ่งขึ้น
* เทกซ์เจอร์ blue noise ชั้นยอดโดย [Moments in Graphics โดย Christoph Peters](http://momentsingraphics.de/BlueNoise.html)
* เทกซ์เจอร์คอโรนาของดวงอาทิตย์โดย [Carla Thomas](https://www.nasa.gov/centers/armstrong/multimedia/imagegallery/2017_total_solar_eclipse/AFRC2017-0233-006.html)
* เทกซ์เจอร์ water caustics ที่มีประโยชน์มากโดย [leeor_net](https://opengameart.org/content/water-caustics-effect-small) ซึ่งไม่ได้นำมาใช้ทำ caustic ของน้ำนะ... แต่เอามาใช้ทำแสงเหนือ (aurora borealis) ต่างหาก!
* *Physically Based Sky, Atmosphere and Cloud Rendering in Frostbite* โดย Sébastien Hillaire (SIGGRAPH 2016) ซึ่งเป็นข้อมูลพื้นฐานสำหรับโครงสร้างการส่องสว่างของเมฆ, การออกแบบ SH9 ambient LUT และแนวทางการลบหมอกแบบ Elek/Chalmers
* *The Real-time Volumetric Cloudscapes of Horizon Zero Dawn* โดย Andrew Schneider และ Nathan Vos (SIGGRAPH 2015) ซึ่งเป็นข้อมูลพื้นฐานสำหรับฟังก์ชันเฟสแบบ dual-lobe Henyey-Greenstein, แนวทางการสร้าง noise สำหรับรูปทรงเมฆ และการประมาณค่าการกระเจิงหลายครั้งแบบลดการสูญเสีย (reduced-extinction multiple scattering approximation)
* *Centre to limb darkening of the Sun with HIPPARCOS* โดย D. Hestroffer และ C. Magnan (1998) ซึ่งให้ค่าสัมประสิทธิ์การมืดลงที่ขอบดวงอาทิตย์ (limb darkening) ตามความยาวคลื่นสำหรับย่าน B, V และ R เพื่อทำให้ขอบของดวงอาทิตย์มีสีออกแดงตามหลักฟิสิกส์
* ผลงานอันน่าทึ่งทั้งหมดที่เกิดขึ้นใน [THREE.JS](https://threejs.org/), [A-Frame](https://aframe.io/) และ [Emscripten](https://emscripten.org/)
* *และเว็บไซต์รวมถึงบุคคลอื่นๆ อีกมากมาย ขอบคุณที่ให้โอกาสเราได้ยืนบนไหล่ของยักษ์ใหญ่เช่นพวกคุณ*

## สัญญาอนุญาต
โปรเจกต์นี้ใช้สัญญาอนุญาตแบบ MIT — ดูรายละเอียดเพิ่มเติมได้ที่ไฟล์ [LICENSE.md](LICENSE.md)