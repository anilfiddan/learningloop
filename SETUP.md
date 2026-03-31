# 🚀 LearningLoop - Supabase & Vercel Kurulum Rehberi

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı (ücretsiz)
- Vercel hesabı (ücretsiz)
- Wiro API anahtarları

---

## 1️⃣ Supabase Kurulumu

### 1.1 Proje Oluşturma

1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub ile giriş yapın
4. "New Project" butonuna tıklayın
5. Proje bilgilerini girin:
   - **Name:** learningloop
   - **Database Password:** Güçlü bir şifre oluşturun (kaydedin!)
   - **Region:** Frankfurt (fra) - Türkiye'ye en yakın
6. "Create new project" butonuna tıklayın

### 1.2 Veritabanı Şemasını Yükleme

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. "New query" butonuna tıklayın
3. `supabase/schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. "Run" butonuna tıklayın
5. Tüm tablolar ve politikalar oluşturulacak

### 1.3 Storage Bucket'ları Oluşturma

1. **Storage** sekmesine gidin
2. "New bucket" butonuna tıklayın
3. Aşağıdaki bucket'ları oluşturun:

| Bucket | Public | Açıklama |
|--------|--------|----------|
| `visuals` | ✅ Yes | Kelime görselleri (KALICI) |
| `recordings` | ❌ No | Ses kayıtları |
| `avatars` | ✅ Yes | Kullanıcı avatarları |
| `audio` | ✅ Yes | TTS ses dosyaları |

4. Her bucket için **Policies** sekmesinden `supabase/storage-policies.sql` dosyasındaki politikaları ekleyin

### 1.4 API Anahtarlarını Alma

1. **Settings** > **API** sekmesine gidin
2. Aşağıdaki değerleri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (GİZLİ TUTUN!)

---

## 2️⃣ Vercel Kurulumu

### 2.1 Projeyi Deploy Etme

1. [vercel.com](https://vercel.com) adresine gidin
2. GitHub ile giriş yapın
3. "Add New" > "Project" butonuna tıklayın
4. GitHub reponuzu seçin
5. Framework olarak **Next.js** seçili olmalı

### 2.2 Environment Variables

Deploy etmeden önce şu değişkenleri ekleyin:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Wiro AI
WIRO_BASE_URL=https://api.wiro.ai
WIRO_API_KEY=your_api_key
WIRO_API_SECRET=your_api_secret
```

### 2.3 Deploy

1. "Deploy" butonuna tıklayın
2. Deployment tamamlanana kadar bekleyin
3. Verilen URL'yi ziyaret edin

---

## 3️⃣ İlk Admin Kullanıcısı Oluşturma

### 3.1 Kayıt Olma

1. Sitenize gidin ve kayıt olun
2. E-posta doğrulaması yapın (Supabase otomatik gönderir)

### 3.2 Admin Yetkisi Verme

1. Supabase Dashboard > **Table Editor** > **profiles** tablosuna gidin
2. Kendi kullanıcınızı bulun
3. `role` sütununu `superadmin` olarak değiştirin
4. "Save" butonuna tıklayın

Artık `/admin` sayfasına erişebilirsiniz!

---

## 4️⃣ Güvenlik Kontrol Listesi

### ✅ Yapılması Gerekenler

- [ ] Supabase Dashboard'da **Authentication** > **URL Configuration** ayarlarını kontrol edin
- [ ] Site URL'nizi ekleyin (örn: `https://learningloop.vercel.app`)
- [ ] Redirect URL'leri ekleyin:
  - `https://learningloop.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (development için)

### ✅ RLS Politikaları

Tüm tablolarda Row Level Security (RLS) aktif:

| Tablo | Politika |
|-------|----------|
| profiles | Kullanıcı sadece kendi profilini görebilir/düzenleyebilir |
| words | Kullanıcı sadece kendi kelimelerini görebilir |
| lists | Kullanıcı sadece kendi listelerini görebilir |
| packs | Herkes aktif paketleri görebilir, sadece admin düzenleyebilir |
| practice_attempts | Kullanıcı sadece kendi denemelerini görebilir |
| site_settings | Herkes okuyabilir, sadece superadmin düzenleyebilir |

### ✅ Storage Güvenliği

| Bucket | Okuma | Yazma | Silme |
|--------|-------|-------|-------|
| visuals | Herkes | Kendi klasörü | ❌ YASAK (kalıcı) |
| recordings | Kendi dosyaları | Kendi klasörü | Kendi dosyaları |
| avatars | Herkes | Kendi klasörü | Kendi dosyaları |
| audio | Herkes | Sistem | ❌ Service role only |

---

## 5️⃣ Sorun Giderme

### "Invalid API key" hatası
- `.env.local` dosyasındaki anahtarları kontrol edin
- Vercel'de environment variables'ları kontrol edin

### "Row level security" hatası
- SQL şemasının doğru yüklendiğinden emin olun
- Kullanıcının giriş yapmış olduğundan emin olun

### Görseller yüklenmiyor
- Storage bucket'ların oluşturulduğunu kontrol edin
- Bucket politikalarının eklendiğini kontrol edin

### Admin paneline erişilemiyor
- Kullanıcının `role` değerinin `admin` veya `superadmin` olduğunu kontrol edin

---

## 📞 Destek

Sorun yaşarsanız:
1. Supabase Dashboard > **Logs** sekmesini kontrol edin
2. Vercel > **Deployments** > **Functions** loglarını kontrol edin
3. Browser console'u kontrol edin (F12)

---

## 🔐 Güvenlik Notları

⚠️ **ASLA** şunları yapmayın:
- `SUPABASE_SERVICE_ROLE_KEY` değerini client-side kodda kullanmayın
- `.env.local` dosyasını git'e commit etmeyin
- API anahtarlarını herkese açık yerlerde paylaşmayın

✅ **HER ZAMAN** şunları yapın:
- Güçlü şifreler kullanın
- 2FA'yı aktif edin (Supabase ve Vercel)
- Düzenli olarak logları kontrol edin
