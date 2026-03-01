# E-Ticaret MVP Projesi 🚀

Bu proje, temel bir e-ticaret sisteminin nasıl çalıştığını, mimari tasarımını ve "transactional" (işlemsel) düşünme yapısını öğrenmek/öğretmek amacıyla geliştirilmiş kapsamlı bir Minimum Viable Product (MVP) uygulamasıdır. 

Müşteri tarafındaki ürün kataloğundan başlayıp, sepet, sipariş, stok düşümü ve kargo takibine kadar uzanan uçtan uca bir akış sunar. Aynı zamanda tam teşekküllü bir Admin paneli ile mağaza ve stok yönetimini içerir.

---

## 🎯 Proje Hedefleri ve Öğretileri (Ne Öğretir?)

Bu proje bir e-ticaret sitesi arayüzünden ziyade, **arka planda dönen kritik iş kurallarını** (Business Logic) kodlamayı öğretir:

1. **Transactional Düşünme (İşlemsel Bütünlük):** Sipariş oluşturulurken müşterinin sepetinin temizlenmesi ve eşzamanlı olarak ürün stoklarının düşülmesi işlemlerinin veritabanında (Prisma Transactions) nasıl güvenli bir bütün olarak işlendiği.
2. **State Machine (Durum Makinesi):** Bir siparişin yaşam döngüsünün `CREATED` → `PAID` → `SHIPPED` → `DELIVERED` → `RETURNED` şeklinde dışarıya sızdırmadan, belirli kurallarla nasıl yönetildiği.
3. **Stok Tutarlılığı (Stock Consistency):** Satın alımlarda stok düşümü, iade işlemlerinde veya sipariş iptallerinde stokların güvenli bir şekilde nasıl geri yüklendiği ve eksi stoka düşmeme kontrolleri.
4. **Rol Ayrımı (Admin / Müşteri):** Müşteriye sunulan veri ile yöneticinin gördüğü verinin izolasyonu, yetki sınırları ve yönetim paneli mimarisi.

---

## 🧩 Çekirdek Modüller (Core Modules)

Sistem aşağıdaki modüllerin birbiriyle entegre çalışmasıyla oluşur:

* **Ürün ve Varyasyon Yönetimi:** Ürünlerin ana bilgileri, fiyatları ve alt varyasyonları (beden/renk) ve bunlara bağlı bağımsız stok miktarları.
* **Kampanya ve İndirim (Discount/Coupon):** Ürün bazlı veya sepet alt limitli "Koşulsuz" indirim motoru, kupon kodu doğrulama sistemi.
* **Sepet ve Checkout:** Sepet tutarının (Context API) hesaplanması, adres ve sahte (simüle edilmiş) ödeme yöntemleri ile sipariş onay süreci.
* **Stok Yönetimi:** Ürün sepete eklendiğinde limit kontrolü, sipariş anında stok düşümü ve iadelerde stok kurtarma (restocking).
* **Sipariş Durum Akışı:** Siparişin durum döngüsünün ve kargo simülasyonunun yönetimi.
* **Admin Paneli:** Ürün Ekle/Düzenle, Stok Artır/Azalt, Sipariş ve İade Onaylama sistemleri.

---

## 🛠 Öğrenci MVP Kapsamındaki Özellikler

- **Müşteri Tarafı (Storefront):**
  - Ürün listeleme, metin bazlı ve kategori bazlı filtreleme/arama.
  - Sadece stoğu olan ürün varyantlarını sepete ekleyebilme (Stok "0" ise "Stok Yok" etiketi).
  - Sepete ekle → Adres/Ödeme simülasyonu → Sipariş oluştur → Stok azalt.
  - /track-order (Sipariş Takibi) sayfasından kargo durumu görüntüleme (shipped/delivered) ve kargoya verilmeden sipariş iptal edebilme veya teslim edildikten sonra iade talebi oluşturabilme.
  
- **Admin Tarafı (Dashboard):**
  - Ürün ve varyasyon (stok) ekleme / güncelleme.
  - Sipariş durumlarını manuel güncelleme (Örn: Siparişi Kargoya Ver).
  - Kullanıcıların iade taleplerini onaylama (stok geri yüklenir) veya reddetme.

---

## 🔄 Sipariş Durum Akışı (State Machine)

Bir siparişin veritabanındaki `status` alanı şu adımları izler:

1. `CREATED`: Sipariş oluştu, stoklar düştü ancak ödeme bekleniyor.
2. `PAID`: Ödeme başarıyla alındı (Simüle).
3. `SHIPPED`: Admin paneli üzerinden sipariş kargoya verildi. (İptal edilemez).
4. `DELIVERED`: Sipariş müşteriye teslim edildi (İade talebi açılabilir).
5. `RETURN_REQUESTED`: Müşteri Sipariş Takip ekranından iade talep etti.
6. `RETURNED`: Admin iadeyi onayladı ve **ürün stokları veritabanında geri arttırıldı**.
7. `RETURN_REJECTED`: Admin iadeyi reddetti.
8. `CANCELLED`: Müşteri kargolanmadan önce siparişi iptal etti, stoklar geri yüklendi.

---

## 📡 REST API Referansı

Projede Next.js App Router API Route'ları (`/api/*`) kullanılarak kapsamlı bir backend sunulmaktadır.

### 1. Ürün API (`/api/products`)
* **`GET /api/products`** 
  * Tüm ürünleri, ilişkili varyantları, stok durumlarını ve aktif indirimlerini getirir. Katalog ve arama sayfası için kullanılır.
* **`GET /api/products/[id]`**
  * Belirli bir ürünün detaylarını (isim, fiyat, görsel, beden seçenekleri) ID'ye göre döner.
* **`POST /api/products` (Admin)**
  * Yeni ürün oluşturur. JSON Body içerisinde `variants` (renk/beden/stok) dizisi alır.

### 2. Sipariş API (`/api/orders`)
* **`POST /api/orders`**
  * Checkout ekranından tetiklenir. **Transaction yapısı içerir!**
  * **Payload:** `items` (sepetteki ürün varyant id'leri ve miktarlar), `customerName`, `customerAddress`, `total`, `paymentMethod`.
  * **İşlem:** Ürünlerin mevcudiyeti kontrol edilir -> Stoklar düşürülür (`decrement`) -> Sipariş tablosuna yazılır.

### 3. İndirim ve Sepet API (`/api/discounts` & `/api/cart`)
* **`GET /api/discounts/cart`**
  * Sepet alt limitine (minCartValue) göre aktif olan genel/koşulsuz indirimleri veya global kampanyaları getirir.
* **`POST /api/coupons/validate`**
  * Kullanıcının girdiği promosyon/kupon kodunu veritabanında sorgular. Kupon geçerliyse indirim yüzdesini/tutarını döner.

### 4. Admin Yönetim İşlemleri (Server Actions / API)
Modern mimari gereği admin güncellemeleri, doğrudan Next.js **Server Actions** ile yapılmaktadır:
* **Sipariş Durumu Güncelleme:** Admin panelinden sipariş `status` alanı değiştirildiğinde çalışır. `RETURNED` seçilirse stokları transaction içinde iade eder.
* **İade Onayı:** `/admin/returns` üzerinden `RETURN_REQUESTED` durumundaki siparişi onaylar.

---

## 💻 Tech Stack (Kullanılan Teknolojiler)

- **Framework:** Next.js (App Router, React Server Components)
- **Database:** SQLite (Geliştirme kolaylığı için)
- **ORM:** Prisma (Tip güvenli veritabanı sorguları ve Transaction desteği)
- **Styling:** Tailwind CSS (Özelleştirilmiş animasyonlar ve UI kütüphanesi)
- **Icons:** Lucide React

---

## 🚀 Kurulum ve Çalıştırma

Ödev sunumu veya geliştirme aşaması için projeyi yerel ortamınızda ayağa kaldırmak oldukça basittir:

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Veritabanı şemasını oluşturun (Prisma SQLite):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

Uygulama **http://localhost:3000** adresinde çalışmaya başlayacaktır. 
Admin paneline **http://localhost:3000/admin** üzerinden erişebilirsiniz.

---
*Bu proje, e-ticaret süreçlerinin arka plandaki mühendislik zorluklarını (stok senkronizasyonu, veri tutarlılığı, durum mimarisi) göstermek amacıyla akademik/öğretici kapsamlı geliştirilmiştir.*
