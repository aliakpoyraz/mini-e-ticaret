<div align="center">

# 🛍️ YZL321 Store | E-Ticaret Platformu

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

Next.js ve modern web teknolojilerini öğrenmek ve uygulamak amacıyla geliştirdiğim aynı zamanda YZL321 dersi kapsamındaki proje ödevim yerine geçmesi amacıyla geliştirdiğim, hem müşteriler hem de yöneticiler için pratik özellikleri barındıran işlevsel bir e-ticaret projesi.

[Canlı Demo](https://e-ticaret.aliakpoyraz.com) · [Hata Bildir](https://github.com/aliakpoyraz/mini-e-ticaret/issues/new) · [Özellik İste](https://github.com/aliakpoyraz/mini-e-ticaret/issues/new)

</div>

---

## 🌟 Proje Hakkında

Bu proje, modern bir e-ticaret sitesinin nasıl çalıştığını baştan sona uygulamalı olarak öğrenmek için geliştirdiğim bir çalışmadır. Ön yüzde sade, anlaşılır ve temiz bir tasarım elde etmeye çalıştım.
 
Arka planda ise; ürünleri, sepeti, sipariş takibini ve stok durumlarını (örneğin bir sipariş iptal edildiğinde stoğun otomatik geri gelmesi gibi) yönetebilen çalışan bir sistem kurdum. Bunu yaparken **Next.js**, **Prisma** ve **PostgreSQL** gibi güncel teknolojileri kullandım.
 
Kodu incelerken başka öğrenci arkadaşların veya projeyi inceleyenlerin karmaşıklık yaşamaması için kodların kritik noktalarına **tamamen Türkçe** olan, neyi neden yaptığımı açıklayan yorum satırları ekledim.

---

## 🚀 Öne Çıkan Özellikler

### 🎯 Müşteri Deneyimi (Storefront)
- **Kusursuz Arayüz:** Modern, mobil uyumlu ve yüksek dönüşüm oranına (conversion-rate) odaklanmış tasarım.
- **Ürün Keşfi:** Gelişmiş kategori, marka, fiyat ve puan tabanlı filtreleme ile anlık arama motoru.
- **Dinamik Sepet:** Gerçek zamanlı varyasyon (renk/beden) ve stok kontrolü yapan akıllı sepet sistemi.
- **Güvenli Kimlik Doğrulama:** Google OAuth veya e-posta/şifre ile güvenli giriş. Kayıt esnasında reCAPTCHA koruması.
- **Sipariş Takibi:** "Hazırlanıyor", "Kargolandı", "Teslim Edildi" gibi aşamaların anlık izlenebildiği müşteri paneli.
- **İade Yönetimi:** Teslim sonrası tek tıkla iade talebi oluşturma ve iade iptal süreçleri.
- **Ürün Değerlendirmeleri:** Yalnızca o ürünü satın alan müşterilerin yorum yapabildiği ve puan verebildiği güvenilir yorum sistemi.

### 🛡️ Yönetim Paneli (Admin Dashboard)
- **Kapsamlı İstatistikler:** Toplam satış, aktif müşteri, sipariş sayıları ve bekleyen görevlerin anlık takibi.
- **Sipariş & İade Yönetimi:** Durumu değişen (İptal, İade vb.) siparişlerde stokların **otomatik geri yüklenmesi** ve müşteriye bilgilendirme maillerinin atılması.
- **Detaylı Stok ve Varyasyon Kontrolü:** Çoklu resim, beden, renk seçenekleriyle ürün ve stok girişleri.
- **Pazarlama Araçları:** Alt limitli, yüzdelik veya sabit tutarlı gelişmiş "İndirim Kuponu" motoru.
- **Kullanıcı & Yorum Moderatörlüğü:** Kötü amaçlı kullanıcıları banlama, uygunsuz değerlendirmeleri reddetme veya onaylama.

---

## 🛠️ Mimari & Teknoloji Yığını

Proje, günümüzün en iyi pratikleri (Best Practices) kabul edilen modern teknolojiler üzerinde çalışmaktadır:

| Kategori | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | React tabanlı full-stack framework. Server Components ile yüksek performans. |
| **Veritabanı** | PostgreSQL | Güçlü ve ilişkisel veritabanı altyapısı (Supabase / Neon vb. ile uyumlu). |
| **ORM / Veri Erişimi** | Prisma | Tip-güvenli (Type-safe) veritabanı sorguları ve şema yönetimi. |
| **Tasarım / Stil** | Tailwind CSS | Utility-first yaklaşım, özelleştirilmiş tasarım token'ları ve responsive yapı. |
| **E-Posta Servisi** | Resend | Sipariş onay, kargo, iade ve şifre sıfırlama mailleri için entegre API. |
| **Kimlik Doğrulama** | Custom Auth | `bcryptjs` + `jose` tabanlı JWT sistemi & Google OAuth entegrasyonu. |

---

## ⚙️ Kurulum & Yerel Geliştirme (Local Development)

Kendinize ait bir kopyasını çalıştırmak oldukça basittir. 

### Ön Koşullar
* Node.js (v18.x veya üzeri önerilir)
* PostgreSQL Veritabanı (Yerel makinenizde kurulu veya Supabase vb. bir Cloud servisi)

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/aliakpoyraz/mini-e-ticaret.git
cd mini-e-ticaret
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevresel Değişkenleri Ayarlayın (.env)
Kök dizinde `.env` isimli bir dosya oluşturun ve aşağıdaki değişkenleri kendi bilgilerinizle doldurun:
```env
# Veritabanı Bağlantısı
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/eticaretdb"

# Güvenlik & Oturum
JWT_SECRET="cok_gizli_bir_anahtar_belirleyin"

# Bildirimler (Resend)
RESEND_API_KEY="re_..."

# Google OAuth (Opsiyonel)
GOOGLE_CLIENT_ID="izin.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="gizli_anahtar"

# Uygulama URL'i
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Veritabanını Hazırlayın
Veritabanı şemasını oluşturmak ve Prisma Client'ı oluşturmak için aşağıdaki komutları sırasıyla çalıştırın:
```bash
npx prisma generate
npx prisma db push
```

### 5. Sunucuyu Başlatın
```bash
npm run dev
```
Uygulamanız başarıyla başlatıldığında tarayıcınızdan **`http://localhost:3000`** adresine giderek siteyi görüntüleyebilirsiniz.

**Admin Girişi (Varsayılan):**
Hazırlanan ilk başlatma mekanizması ile giriş ekranından `admin@store.com` / `admin123` bilgileriyle oturum açarak tüm yönetim paneline erişebilirsiniz.

---

## 🔒 Sipariş & Stok Durum

- Kapıda Ödemeli siparişler **`CREATED`** (Oluşturuldu), Kredi Kartlı siparişler **`PAID`** (Ödendi) statüsü ile başlar.
- Kargodan önce **`CANCELLED`** (İptal) veya ürün geri geldiğinde **`RETURNED`** (İade Edildi) statüsüne geçildiğinde; o siparişteki tüm **stoklar milisaniyeler içinde sisteme otomatik olarak geri işlenir**.
- Her statü değişiminde kullanıcıya özel, dinamik hesaplanmış e-posta bilgilendirmeleri gönderilir.

---

## 📄 Lisans
Bu proje geliştirilmeye açık ve portfolyo amaçlı sunulmuştur. 

<div align="center">
  <p>Sevgi ve tasarım odaklı geliştirildi ❤️</p>
</div>
