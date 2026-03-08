# YZL321 Store | Premium E-Ticaret Deneyimi 🚀

Bu proje, modern web teknolojileri ile geliştirilmiş, kullanıcı deneyimi odaklı ve tam teşekküllü bir e-ticaret çözümüdür. Apple-like minimal tasarımı, güçlü backend mimarisi ve gelişmiş bildirim sistemleriyle uçtan uca bir alışveriş deneyimi sunar.

---

## 🛠 Teknoloji Yığını (Tech Stack)

Proje, güncel ve ölçeklenebilir en iyi teknolojiler üzerine inşa edilmiştir:

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM:** [Prisma](https://www.prisma.io/) (Tip güvenli veritabanı yönetimi)
- **E-posta:** [Resend](https://resend.com/) (Güçlü ve hızlı e-posta bildirimleri)
- **Deployment:** [Vercel](https://vercel.com/) (Edge Runtime & Serverless)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Premium UI & Glassmorphism)
- **Auth:** Custom JWT-based Authentication (bcryptjs + jose)

---

## ✨ Öne Çıkan Özellikler

### 🛍️ Kusursuz Alışveriş Akışı
- **Dinamik Katalog:** Gelişmiş filtreleme ve arama motoru.
- **Akıllı Sepet:** Stok kontrolleri ve anlık sepet güncellemeleri.
- **Detaylı Takip:** Sipariş durumunun anlık olarak izlenebildiği müşteri paneli.
- **İade Sistemi:** Teslim alım sonrası kolay iade talebi oluşturma.

### 🛡️ Güvenlik ve Bildirimler
- **Doğrulama Sistemi:** Kayıt sonrası e-posta doğrulama (Resend entegrasyonu).
- **Şifre Kurtarma:** Güvenli token tabanlı şifre sıfırlama süreci.
- **Anlık Bilgilendirme:** Sipariş alındığında ve durum güncellendiğinde (Kargoda, Teslim Edildi) otomatik e-posta gönderimi.

### 📊 Güçlü Admin Paneli
- **Stok Yönetimi:** Ürün ve varyasyon (renk/beden) bazlı anlık stok kontrolü.
- **Sipariş Yönetimi:** Sipariş durumlarını yönetme ve iade taleplerini onaylama/reddetme.
- **İndirim Motoru:** Ürün bazlı veya sepet alt limitli kampanya yönetim sistemi.

---

## 🔄 Sipariş Yaşam Döngüsü

Sistem, veritabanı tutarlılığını korumak için sıkı bir durum makinesi (state machine) izler:

1. **Ödendi (PAID):** Kartlı ödeme sonrası sipariş bu durumda başlar.
2. **Oluşturuldu (CREATED):** Kapıda ödeme seçildiğinde sipariş bu durumda başlar.
3. **Kargolandı (SHIPPED):** Admin kargoya verdiğinde müşteri mail ile bilgilendirilir.
4. **Teslim Edildi (DELIVERED):** Ürün müşteriye ulaştığında iade hakkı başlar.
5. **İade İstendi (RETURN_REQUESTED):** Müşteri iade süreci başlatır.
6. **İade Edildi (RETURNED):** Admin onayladığında **stoklar otomatik olarak geri yüklenir**.
7. **İptal Edildi (CANCELLED):** Kargodan önce iptal edilirse stoklar geri döner.

---

## 🚀 Kurulum

Projeyi yerel ortamınızda ayağa kaldırmak için:

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Çevresel Değişkenleri Ayarlayın (.env):**
   ```env
   DATABASE_URL="supabase_postgresql_url"
   RESEND_API_KEY="re_..."
   JWT_SECRET="super_secret_key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Veritabanını Hazırlayın:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Çalıştırın:**
   ```bash
   npm run dev
   ```

---

## 🌐 Canlı Ortam (Deployment)

Proje **Vercel** üzerinde optimize edilmiştir. Otomatik build süreci için `prisma generate` komutu `postinstall` adımına eklenmiştir.

---
