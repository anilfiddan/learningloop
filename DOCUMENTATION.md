# LearningLoop - Teknik Dokumantasyon

## Proje Tanimi

**LearningLoop**, konusma ve telaffuz bozuklugu yasayan bireyler icin gelistirilmis, NLP destekli bir telaffuz asistanidir. Yapay zeka ile telaffuz analizi yaparak, kisisellestirilmis geri bildirim ve pratik onerileri sunar. Profesyonel terapinin yerine gecmez, tamamlayici bir destek aracidir.

**Hedef Kitle:** Cocuklar, yetiskinler, aileler ve dil terapistlerinin hastalarini yonlendirebilecegi herkes.

---

## Teknoloji Yigini

| Katman | Teknoloji | Surum |
|--------|-----------|-------|
| Frontend | Next.js (App Router) | 14.2.3 |
| UI | React + TypeScript | 18.3.1 / 5.4.5 |
| Stil | Tailwind CSS | 3.4.3 |
| Ikonlar | Lucide React | 0.378.0 |
| Veritabani | Supabase (PostgreSQL) | 2.89.0 |
| AI Platform | Wiro AI | HTTP API |
| LLM | Google Gemini 2.5 Flash | Wiro uzerinden |
| Gorsel | Google Nano Banana Pro | Wiro uzerinden |
| Video | Google VEO 3.1 Fast | Wiro uzerinden |
| TTS | Google Gemini 2.5 TTS | Wiro uzerinden |
| STT | ElevenLabs Speech-to-Text | Wiro uzerinden |
| Deploy | Vercel | Frankfurt bolge |
| PWA | Service Worker + Manifest | Ozel |

---

## Proje Dizin Yapisi

```
learningloop-main/
├── app/                          # Next.js App Router sayfalari
│   ├── layout.tsx                # Root layout (font, PWA, i18n provider)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global stiller
│   ├── login/page.tsx            # Giris sayfasi
│   ├── register/page.tsx         # Kayit sayfasi
│   ├── offline/page.tsx          # Cevrimdisi sayfasi
│   ├── dashboard/                # Korunmus dashboard sayfalari
│   │   ├── layout.tsx            # Auth kontrol + DashboardShell
│   │   ├── page.tsx              # Ana pratik sayfasi
│   │   ├── dictionary/page.tsx   # Sozluk
│   │   ├── history/page.tsx      # Gecmis
│   │   ├── lists/page.tsx        # Kelime listeleri
│   │   ├── lists/[id]/page.tsx   # Liste detayi
│   │   ├── packs/page.tsx        # Kelime paketleri
│   │   ├── progress/page.tsx     # Ilerleme takibi
│   │   ├── quiz/page.tsx         # Telaffuz quizi
│   │   ├── settings/page.tsx     # Ayarlar
│   │   └── word/[id]/page.tsx    # Kelime detay sayfasi
│   ├── admin/                    # Admin paneli
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── users/page.tsx        # Kullanici yonetimi
│   │   ├── packs/page.tsx        # Paket yonetimi
│   │   ├── analytics/page.tsx    # Analitik
│   │   └── settings/page.tsx     # Site ayarlari
│   └── api/                      # Backend API route'lari
│       ├── auth/login/route.ts
│       ├── auth/register/route.ts
│       ├── generate/strategy/route.ts
│       ├── generate/audio/route.ts
│       ├── generate/visual/route.ts
│       ├── generate/video/route.ts
│       ├── generate/quiz/route.ts
│       ├── practice/evaluate/route.ts
│       └── stt/route.ts
├── components/                   # React bileşenleri
│   ├── landing/                  # Landing page bileşenleri (13 dosya)
│   ├── dashboard/                # Dashboard shell
│   ├── practice/                 # Pratik bileşenleri
│   │   ├── word-input-card.tsx   # Kelime giris karti
│   │   ├── syllables-card.tsx    # Hece gosterim + ses calma
│   │   ├── visual-cue-card.tsx   # AI gorsel karti
│   │   ├── video-cue-card.tsx    # AI video karti
│   │   ├── practice-coach-card.tsx # Pratik kocu (kayit + degerlendirme)
│   │   └── voice-recorder.tsx    # Mikrofon kayit bileseni
│   ├── layout/                   # Sidebar, TopBar, AppShell
│   ├── auth/                     # Login modal
│   ├── ui/                       # Button, Card, Input, Select, Skeleton
│   └── pwa/                      # Install prompt, SW register
├── lib/                          # Cekirdek kutuphaneler
│   ├── wiro.ts                   # Wiro AI HTTP client (HMAC-SHA256)
│   ├── prompts.ts                # Tum AI system prompt'lari
│   ├── auth.ts                   # localStorage auth yardimcisi
│   ├── types.ts                  # Temel tip tanimlari
│   ├── types/word.ts             # Kelime ve pratik tipleri
│   ├── data-types.ts             # localStorage veri tipleri
│   ├── data-store.ts             # localStorage CRUD islemleri
│   ├── stores/word-store.ts      # Gelismis kelime store (v2)
│   ├── syllabify.ts              # Turkce hece ayirma algoritmasi
│   ├── text.ts                   # Metin isleme (Levenshtein, matchPct)
│   ├── utils.ts                  # Yardimci fonksiyonlar (cn, base64)
│   ├── i18n/
│   │   ├── language-context.tsx  # Dil context provider
│   │   └── translations.ts      # TR/EN ceviriler (20K+ kelime)
│   └── supabase/
│       ├── client.ts             # Tarayici Supabase client
│       ├── server.ts             # Sunucu Supabase client
│       └── types.ts              # Supabase tip tanimlari
├── hooks/
│   ├── useAuth.ts                # Auth hook
│   └── usePWA.ts                 # PWA kurulum hook
├── supabase/
│   ├── schema.sql                # Veritabani semasi (9 tablo, RLS)
│   └── storage-policies.sql      # Storage bucket politikalari
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   └── icons/                    # Uygulama ikonlari (14 boyut)
├── middleware.ts                  # Route koruma + demo mod
├── next.config.mjs               # Next.js yapilandirmasi
├── tailwind.config.ts            # Tailwind tema
├── tsconfig.json                 # TypeScript yapilandirmasi
└── vercel.json                   # Vercel deploy ayarlari
```

---

## Ana Is Akisi: Pratik Pipeline

Kullanicinin bir kelime girmesinden geri bildirim almasina kadar olan tam akis:

```
[1] Kullanici kelime girer (orn: "tesekkurler")
         |
[2] POST /api/generate/strategy
    -> Wiro Gemini 2.5 Flash
    -> Donus: {
         syllables: ["te", "sek", "kur", "ler"],
         definition: "Minnettarlik ifadesi",
         coachTip: "kur hecesinde dudaklarinizi yuvarlak tutun",
         imagePrompt: "...",
         videoPrompt: "..."
       }
         |
[3] Paralel istekler baslar:
    ├── POST /api/generate/audio
    │   -> Wiro Gemini TTS
    │   -> Her hece icin ayri ses + tam kelime sesi
    │   -> Donus: { syllableAudios: [...], wordAudioUrl: "..." }
    │
    └── POST /api/generate/visual
        -> Wiro Nano Banana Pro
        -> 1024x1024 fotorealistik gorsel
        -> Donus: { imageUrl: "..." }
         |
[4] Icerik hazir -> Kullaniciya gosterilir:
    - Hece kartlari (tiklanabilir, sesli)
    - AI gorseli
    - Koçluk ipucu
    - Tanim
         |
[5] Kullanici mikrofona konusur
    -> VoiceRecorder bileseni
    -> Web Audio API ile sessizlik tespiti
    -> Kayit suresi, duraklama sayisi olculur
         |
[6] POST /api/stt
    -> Wiro ElevenLabs STT
    -> Ses dosyasi multipart olarak gonderilir
    -> Async task polling (max 60sn)
    -> Donus: { transcript: "tesekkurler" }
         |
[7] POST /api/practice/evaluate
    -> Wiro Gemini 2.5 Flash
    -> Hedef kelime + transkript karsilastirilir
    -> Donus: {
         verdict: "great" | "close" | "retry",
         matchPct: 92,
         syllableChecks: [
           { syllable: "te", ok: true },
           { syllable: "sek", ok: true },
           { syllable: "kur", ok: false, tip: "..." },
           { syllable: "ler", ok: true }
         ],
         coachResponse: "Harika! kur hecesinde biraz daha..."
       }
         |
[8] Sonuc kullaniciya gosterilir:
    - Renk kodlu verdict (yesil/sari/mavi)
    - Hece bazli basari/basarisizlik
    - Kisisel kocluk ipuclari
    - Tekrar pratik butonu
```

---

## API Endpoint Detaylari

### POST /api/generate/strategy
Bir kelime icin ogrenme stratejisi olusturur.

**Request:**
```json
{
  "word": "merhaba",
  "level": "beginner",
  "lang": "tr"
}
```

**Response:**
```json
{
  "word": "merhaba",
  "syllables": ["mer", "ha", "ba"],
  "definition": "Selamlama ifadesi",
  "coachingTip": "ha hecesinde agzinizi genis acin",
  "imagePrompt": "A warm greeting scene...",
  "videoPrompt": "Gentle waving hand...",
  "level": "beginner"
}
```

### POST /api/generate/audio
Kelime ve heceleri icin TTS sesleri uretir.

**Request:**
```json
{
  "word": "merhaba",
  "syllables": ["mer", "ha", "ba"]
}
```

**Response:**
```json
{
  "syllableAudios": [
    { "syllable": "mer", "audioUrl": "https://..." },
    { "syllable": "ha", "audioUrl": "https://..." },
    { "syllable": "ba", "audioUrl": "https://..." }
  ],
  "wordAudioUrl": "https://...",
  "isFallback": false
}
```

### POST /api/generate/visual
Kelime icin AI gorseli uretir.

**Request:**
```json
{
  "word": "merhaba",
  "definition": "Selamlama ifadesi"
}
```

**Response:**
```json
{
  "imageUrl": "https://...",
  "isFallback": false
}
```

### POST /api/stt
Ses dosyasini metne cevirir.

**Request:** `multipart/form-data`
- `file`: Ses dosyasi (max 10MB)
- `language`: "tr" | "en"

**Response:**
```json
{
  "transcript": "merhaba",
  "success": true
}
```

### POST /api/practice/evaluate
Telaffuzu degerlendirir.

**Request:**
```json
{
  "word": "merhaba",
  "transcript": "merbaba",
  "syllables": ["mer", "ha", "ba"],
  "lang": "tr"
}
```

**Response:**
```json
{
  "verdict": "close",
  "matchPct": 78,
  "syllableChecks": [
    { "syllable": "mer", "ok": true },
    { "syllable": "ha", "ok": false, "tip": "h sesini daha belirgin cikartin" },
    { "syllable": "ba", "ok": true }
  ],
  "coachResponse": "Guzel deneme! ha hecesinde h sesine dikkat edin."
}
```

### POST /api/generate/quiz
Quiz sorusu uretir.

**Request:**
```json
{
  "category": "food",
  "lang": "tr",
  "difficulty": "beginner"
}
```

**Response:**
```json
{
  "word": "elma",
  "options": ["elma", "armut", "portakal", "muz"],
  "hint": "Kirmizi veya yesil olabilen meyve",
  "imageUrl": "https://..."
}
```

### POST /api/generate/packs
Kategoriye gore kelime paketi uretir.

**Request:**
```json
{
  "category": "animals",
  "lang": "tr",
  "count": 10
}
```

**Response:**
```json
{
  "id": "...",
  "category": "animals",
  "packName": "Sevimli Hayvanlar",
  "packDescription": "Evcil ve vahsi hayvan isimleri",
  "words": [
    {
      "word": "kedi",
      "definition": "Evcil, miyavlayan hayvan",
      "syllables": ["ke", "di"],
      "level": "beginner"
    }
  ]
}
```

---

## Wiro AI Entegrasyonu

### Kimlik Dogrulama
Wiro API, HMAC-SHA256 imza sistemi kullanir:

```
Signature = HMAC-SHA256(key=API_KEY, message=API_SECRET + nonce)

Headers:
  x-api-key: {API_KEY}
  x-nonce: {timestamp}
  x-signature: {hex_signature}
```

### Async Task Yonetimi
Video ve gorsel uretimi gibi uzun islemler asenkron calisir:

1. `POST /v1/Run/{model}` -> `{ socketaccesstoken: "..." }` doner
2. `POST /v1/Task/Detail` ile polling yapilir (3sn aralikla)
3. Task status `task_postprocess_end` olunca sonuc alinir
4. Maksimum bekleme: 120 saniye

### Kullanilan Modeller

| Islem | Model | Aciklama |
|-------|-------|----------|
| Strateji/Degerlendirme | google/gemini-2-5-flash | Hece ayirma, telaffuz analizi, kocluk |
| Gorsel Uretimi | google/nano-banana-pro | 1024x1024 fotorealistik gorsel |
| Video Uretimi | google/veo3-1-fast | 4sn, 720p, sessiz, dongusel |
| TTS (Metin->Ses) | google/gemini-2-5-tts | Hece ve kelime seslendirme |
| STT (Ses->Metin) | elevenlabs/speech-to-text | Kullanici ses tanima |

---

## Veritabani Semasi (Supabase)

### Tablolar

**profiles** - Kullanici profilleri
```sql
id UUID (auth.users FK)
email TEXT
name TEXT
role TEXT (user/admin/superadmin)
avatar_url TEXT
stats JSONB (total_practice, streak, hard_syllables_count)
created_at, updated_at TIMESTAMPTZ
```

**words** - Kullanici kelime sozlugu
```sql
id UUID
user_id UUID (profiles FK)
text TEXT
lang TEXT (tr/en)
syllables JSONB (string array)
definition TEXT
word_audio_url TEXT
syllable_audios JSONB
visual_url TEXT
coaching_tip TEXT
is_favorite, is_hard, is_learned BOOLEAN
practice_count, success_count INTEGER
last_practiced_at TIMESTAMPTZ
```

**practice_attempts** - Pratik denemeleri
```sql
id UUID
user_id UUID
word_id UUID
recording_url TEXT
transcript TEXT
verdict TEXT (great/close/retry)
accuracy INTEGER (0-100)
syllable_checks JSONB
created_at TIMESTAMPTZ
```

**lists** - Kelime listeleri
```sql
id UUID
user_id UUID
name TEXT
icon TEXT
word_count INTEGER (trigger ile guncellenir)
```

**packs** - Admin kelime paketleri
```sql
id UUID
created_by UUID
name TEXT
category TEXT
difficulty TEXT
words JSONB
is_active, is_featured BOOLEAN
download_count INTEGER
```

### Row Level Security (RLS)
Tum tablolarda RLS aktif:
- Kullanicilar sadece kendi verilerini gorebilir/duzenleyebilir
- Admin'ler genis erisime sahip
- Superadmin'ler tam kontrol

### Storage Bucket'lari
| Bucket | Erisim | Max Boyut | Icerik |
|--------|--------|-----------|--------|
| visuals | Public | 5MB | AI gorselleri |
| recordings | Private | 10MB | Kullanici ses kayitlari |
| avatars | Public | 2MB | Profil resimleri |
| audio | Public | 5MB | TTS ses dosyalari |

---

## Prompt Mimarisi

Tum AI prompt'lari `lib/prompts.ts` dosyasinda merkezi olarak yonetilir.

### Guvenlik Kurallari (Tum Prompt'larda)
```
- Bu uygulama cocuklar ve ogrenenlere yoneliktir
- ASLA tibbi/klinik dil kullanma
- ASLA bu uygulamanin terapinin yerine gectigini soyleme
- ASLA "yanlis", "hatali", "basarisiz", "kotu" gibi kelimeler kullanma
- HER ZAMAN sicak, sabırli, tesvik edici ve eglenceli ol
```

### Turkce Fonetik Rehberi (Prompt'lara Gomulu)
```
c = /ts/ -> "ch" in "chair"
s = /s/  -> "sh" in "shoe"
g = sessiz veya onceki unluyu uzatir
i = /ɯ/ -> dudaklar duz "uh"
o = /ø/ -> Fransizca "peu" deki "eu"
u = /y/ -> Almanca "uber" deki "u"
Vurgu genellikle son hecede
```

---

## Hece Ayirma Algoritmasi

`lib/syllabify.ts` dosyasinda Turkce'ye ozel hece ayirma:

**Kurallar:**
1. Unlu harfler: a, e, i, o, u, ı, o, u
2. Her unlu bir hece olusturur
3. Iki unlu arasindaki tek unsuz sonraki heceye gider
4. Iki unlu arasindaki iki unsuzun ilki onceki, ikincisi sonraki heceye gider
5. Uc unsuz durumunda ilk ikisi onceki heceye gider

**Ornek:**
```
"tesekkurler" -> ["te", "sek", "kur", "ler"]
"merhaba"     -> ["mer", "ha", "ba"]
"istanbul"    -> ["is", "tan", "bul"]
```

---

## Metin Eslestirme

`lib/text.ts` dosyasinda Levenshtein mesafesi ile telaffuz benzerlik olcumu:

```typescript
matchPct("merhaba", "merbaba") // -> 85
matchPct("elma", "elma")       // -> 100
matchPct("kitap", "ktap")      // -> 80
```

Bu skor, STT transkriptinin hedef kelimeyle ne kadar eslestigi olcmek icin kullanilir.

---

## Veri Yonetimi

### Local-First Yaklasim
Uygulama oncelikle localStorage kullanir:

| Store | Anahtar | Icerik |
|-------|---------|--------|
| Kelimeler | `learningloop-words` | Tum kelimeler + metadata |
| Denemeler | `learningloop-attempts` | Pratik denemeleri |
| Listeler | `learningloop-lists` | Kelime listeleri |
| Ayarlar | `learningloop-settings` | Kullanici tercihleri |
| Auth | `ll_auth` | Oturum bilgisi |

### Demo Modu
Supabase yapilandirilmadiginda uygulama tamamen localStorage ile calisir:
- Kayit/giris localStorage'a yazilir
- Middleware korumasiz calisir
- Tum ozellikler kullanilabilir

---

## PWA Destegi

### Manifest
- Standalone mod (tarayici cercevesi yok)
- Portrait yonelim
- Kisayollar: Pratik + Quiz
- Tema rengi: #10b981 (emerald)

### Service Worker Cache Stratejileri

| Icerik | Strateji | Sure |
|--------|----------|------|
| Statik dosyalar (JS, CSS, font) | Cache-first | 7 gun |
| Wiro medya (gorsel, ses) | Cache-first | 30 gun, max 200 |
| Sayfalar | Network-first + fallback | - |
| API route'lari | Network-only | - |
| Offline | /offline sayfasina yonlendir | - |

---

## Cevrimdisi Calisma

1. Service Worker tum statik dosyalari onbellege alir
2. Onceden yuklenmis medya icerikleri cache'den sunulur
3. API istekleri basarisiz olursa /offline sayfasi gosterilir
4. localStorage verileri her zaman erisilebilir
5. Kullanici tekrar baglaninca normal akis devam eder

---

## Guvenlik Onlemleri

1. **RLS (Row Level Security):** Tum Supabase tablolarinda aktif
2. **Input Validation:** Kelime girisleri sanitize (max 100 karakter, alfanumerik + Turkce karakterler)
3. **Dosya Limitleri:** Ses dosyalari max 10MB, MIME tipi kontrolu
4. **HMAC Imzalama:** Wiro API istekleri HMAC-SHA256 ile imzali
5. **API Key Gizliligi:** Hata mesajlarinda API key'ler [REDACTED] ile maskelenir
6. **Prompt Injection Korumasi:** Kullanici girisleri AI prompt'larina gonderilmeden temizlenir
7. **CORS:** API route'larinda CORS header'lari tanimli
8. **Security Headers:** X-Frame-Options, XSS-Protection, Referrer-Policy
9. **Audit Log:** Kullanici islemleri IP + user-agent ile loglanir
10. **crypto.randomUUID():** Math.random() yerine guvenli ID uretimi

---

## Ortam Degiskenleri

### Zorunlu
```env
WIRO_BASE_URL=https://api.wiro.ai
WIRO_API_KEY=your_api_key
WIRO_API_SECRET=your_api_secret
```

### Opsiyonel (Supabase)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Opsiyonel (Model Override)
```env
WIRO_LLM_MODEL_ID=google/gemini-2-5-flash
WIRO_IMAGE_MODEL_ID=google/nano-banana-pro
WIRO_VIDEO_MODEL_ID=google/veo3-1-fast
WIRO_TTS_MODEL_ID=google/gemini-2-5-tts
WIRO_STT_MODEL_ID=elevenlabs/speech-to-text
ENABLE_STT=true
```

---

## Deployment

### Vercel Yapilandirmasi
- **Bolge:** Frankfurt (iad1)
- **Framework:** Next.js 14
- **Node.js:** Server actions aktif, 10MB body limit
- **Headers:** CORS, guvenlik header'lari
- **Rewrites:** PostHog analytics proxy

### Build Komutu
```bash
npm run build   # Next.js production build
npm run start   # Production server
npm run dev     # Development server (localhost:3000)
```

---

## Sayfa Ozeti

| Sayfa | Yol | Aciklama |
|-------|-----|----------|
| Landing | `/` | Tanitim sayfasi |
| Giris | `/login` | Email/sifre giris |
| Kayit | `/register` | Hesap olusturma |
| Pratik | `/dashboard` | Ana pratik sayfasi (kelime gir -> dinle -> soyle -> geri bildirim) |
| Quiz | `/dashboard/quiz` | Gorsel tabanli kelime quizi |
| Paketler | `/dashboard/packs` | Kategoriye gore AI kelime paketi uretimi |
| Sozluk | `/dashboard/dictionary` | Kisisel kelime sozlugu |
| Listeler | `/dashboard/lists` | Ozel kelime koleksiyonlari |
| Gecmis | `/dashboard/history` | Aktivite ve pratik gecmisi |
| Ilerleme | `/dashboard/progress` | Haftalik grafik, seri, zor heceler |
| Ayarlar | `/dashboard/settings` | Dil, hiz, seviye, tema, veri yonetimi |
| Kelime Detay | `/dashboard/word/[id]` | Kelime detayi + pratik + istatistik |
| Cevrimdisi | `/offline` | Internet baglantisi yok sayfasi |
| Admin | `/admin` | Yonetim paneli |

---

## Lisans ve Sorumluluk Reddi

Bu uygulama yalnizca pratik amaciyla tasarlanmistir. Tibbi tavsiye, teshis veya tedavi saglamaz. Konusma ve dil terapisi endiseleriniz icin lutfen nitelikli bir dil ve konusma uzmani ile gorusun.

---

*Son guncelleme: 2026-03-28*
*Surum: 1.0.0*
