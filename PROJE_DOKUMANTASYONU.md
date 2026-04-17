# LearningLoop — Proje Dokümantasyonu

> NLP destekli, çocuklar ve konuşma güçlüğü yaşayanlar için telaffuz asistanı.
> Next.js 14 · Supabase · Wiro AI · PWA

Bu dokümantasyon projenin **her bir parçasını** açıklar: mimari, sistem promptları, API route'ları, kütüphane modülleri, veritabanı şeması, algoritmalar, frontend bileşenleri ve dış servisler.

---

## İçindekiler

1. [Proje Nedir?](#1-proje-nedir)
2. [Tech Stack ve Mimari](#2-tech-stack-ve-mimari)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Veri Akışı — Uçtan Uca Pratik Süreci](#4-veri-akışı--uçtan-uca-pratik-süreci)
5. [Sistem Promptları (`lib/prompts.ts`)](#5-sistem-promptları-libpromptsts)
6. [API Route'ları (`app/api/`)](#6-api-routeları-appapi)
7. [Kütüphane Modülleri (`lib/`)](#7-kütüphane-modülleri-lib)
8. [Core Algoritmalar](#8-core-algoritmalar)
9. [Frontend — Sayfalar ve Bileşenler](#9-frontend--sayfalar-ve-bileşenler)
10. [Database ve RLS Politikaları](#10-database-ve-rls-politikaları)
11. [Dış Servisler (Wiro AI)](#11-dış-servisler-wiro-ai)
12. [PWA ve Service Worker](#12-pwa-ve-service-worker)
13. [Konfigürasyon ve Env Vars](#13-konfigürasyon-ve-env-vars)
14. [Güvenlik Notları](#14-güvenlik-notları)
15. [Bilinen Sınırlamalar ve Yol Haritası](#15-bilinen-sınırlamalar-ve-yol-haritası)

---

## 1. Proje Nedir?

**LearningLoop**, Türkçe ve İngilizce telaffuz pratiği yapmak isteyen kullanıcılar için NLP tabanlı bir asistan uygulamasıdır. Özellikle:

- **Konuşma güçlüğü yaşayan çocuklar** — eğlenceli + motive edici bir pratik ortamı.
- **Yetişkinler** — ikinci dil netliği veya kendi telaffuzunu geliştirmek isteyenler.
- **Dil ve konuşma terapistleri** — hastalarına ev ödevi olarak verebileceği tamamlayıcı bir araç.
- **Aileler** — yakınlarının konuşma pratiğine destek olmak isteyenler.

**Ne yapıyor:**

1. Kullanıcı bir kelime yazar (örn. "merhaba").
2. LLM (Gemini 2.5 Flash) kelimeyi hecelere böler, tanım ve koçluk ipucu üretir.
3. Paralel olarak TTS (Gemini TTS) hece-hece ses üretir, görsel AI (Nano Banana Pro) bir görsel üretir.
4. Kullanıcı mikrofonla telaffuzunu kaydeder.
5. STT (ElevenLabs) sesi yazıya çevirir.
6. Levenshtein uzaklığı + LLM değerlendirmesi sonuçla birlikte hece bazlı geri bildirim verir.
7. Sonuç localStorage + Supabase'e kaydedilir, SM-2 spaced repetition algoritması sıradaki tekrarı planlar.

**Tez projesi bağlamı:** `TEZ_DOKUMANI.md` dosyasında akademik arka plan ve metodoloji detaylı anlatılıyor.

---

## 2. Tech Stack ve Mimari

| Katman | Teknoloji |
|--------|-----------|
| **Framework** | Next.js 14.2.3 (App Router) |
| **Dil** | TypeScript 5.4.5 (strict mode) |
| **UI** | React 18.3.1 + Tailwind CSS 3.4.3 |
| **İkonlar** | Lucide React |
| **Auth** | Supabase Auth (SSR + localStorage fallback) |
| **DB** | Supabase Postgres (RLS enabled) |
| **AI** | Wiro AI (Gemini 2.5 Flash + Nano Banana + VEO 3.1 + Gemini TTS + ElevenLabs STT) |
| **Auth algoritması (Wiro)** | HMAC-SHA256 |
| **State (client)** | localStorage + React Context (i18n) |
| **PWA** | Service Worker + manifest.json |
| **Hosting** | Vercel (region: `fra1` — Frankfurt) |

**Mimari prensipleri:**

- **Server-first AI çağrıları** — Wiro API anahtarları sadece server'da (`/api/generate/*`).
- **Client-side local store** — localStorage'da `ll_words_v2`, `ll_attempts`, `ll_lists_v2` gibi key'ler.
- **Fallback-first** — Her AI çağrısında çalışmazsa boş/varsayılan yanıt dön, UI çökertme.
- **Double-write migration** — Eski (`lib/data-store.ts`) + yeni (`lib/stores/word-store.ts`) paralel yazıyor (geçiş süreci).

---

## 3. Klasör Yapısı

```
learningloop/
├── app/                      # Next.js App Router sayfaları ve API route'ları
│   ├── api/                  # Server-side endpoint'ler
│   │   ├── auth/             # login, register
│   │   ├── generate/         # strategy, audio, visual, video, quiz, packs
│   │   ├── practice/         # evaluate
│   │   └── stt/              # speech-to-text
│   ├── dashboard/            # Protected user dashboard
│   │   ├── daily/            # Günlük pratik (SM-2)
│   │   ├── dictionary/       # Kelime sözlüğü
│   │   ├── history/          # Pratik geçmişi
│   │   ├── lists/            # Kelime listeleri
│   │   ├── packs/            # Kelime paketleri
│   │   ├── progress/         # İlerleme grafikleri
│   │   ├── quiz/             # Quiz modu
│   │   ├── settings/         # Kullanıcı ayarları
│   │   ├── word/[id]/        # Kelime detay sayfası
│   │   └── page.tsx          # Ana pratik sayfası
│   ├── admin/                # Admin panel
│   ├── login/                # Giriş
│   ├── register/             # Kayıt
│   ├── offline/              # PWA offline fallback
│   ├── layout.tsx            # Root layout + metadata
│   └── globals.css           # Tailwind base + custom CSS
├── components/
│   ├── landing/              # Pazarlama sayfası bileşenleri
│   ├── practice/             # Core pratik UI
│   ├── dashboard/            # Dashboard shell
│   ├── layout/               # App shell, sidebar, top bar
│   ├── auth/                 # Login modal
│   ├── pwa/                  # SW register + install prompt
│   └── ui/                   # Shadcn-style primitive'ler
├── lib/
│   ├── prompts.ts            # ⭐ Merkezi LLM prompt kütüphanesi
│   ├── wiro.ts               # Wiro API client (741 satır)
│   ├── syllabify.ts          # Türkçe hece ayırma algoritması
│   ├── text.ts               # Levenshtein + normalize + JSON parser
│   ├── types.ts              # Genel tipler
│   ├── types/word.ts         # WordItem, PracticeAttempt, vs.
│   ├── stores/
│   │   └── word-store.ts     # Yeni localStorage store (v2)
│   ├── data-store.ts         # Legacy store (geçiş süreci)
│   ├── spaced-repetition/
│   │   ├── sm2.ts            # SM-2 algoritması
│   │   └── sr-store.ts       # SR data localStorage katmanı
│   ├── i18n/
│   │   ├── language-context.tsx
│   │   └── translations.ts   # TR/EN string'leri
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # SSR + admin client
│   ├── auth.ts               # localStorage fallback auth
│   └── utils.ts              # cn() helper
├── hooks/
│   ├── useAuth.ts
│   └── usePWA.ts
├── supabase/
│   └── schema.sql            # Tablo + enum + RLS policy tanımları
├── public/
│   ├── manifest.json
│   ├── sw.js                 # Service worker
│   └── icons/
├── middleware.ts             # Auth guard + demo mode fallback
├── next.config.mjs
├── tailwind.config.ts
├── vercel.json
└── package.json
```

---

## 4. Veri Akışı — Uçtan Uca Pratik Süreci

Bir kullanıcı "merhaba" yazıp "Başlat" butonuna bastığında arka planda sırayla ne olduğunu adım adım görelim:

```
[Kullanıcı]
   │ "merhaba" + level=beginner
   ▼
[WordInputCard (client)]
   │ onStart(word, level)
   ▼
[app/dashboard/page.tsx]
   │ setStep("strategy")
   ▼
[POST /api/generate/strategy]
   │ buildStrategyPrompt(word, lang, mode, level)
   │ Wiro → gemini-2-5-flash
   │ JSON parse (safeJsonParseLLM)
   ▼
{ syllables, definition, coachingTip, image_prompt, video_prompt, tts_syllable_texts, tts_word_text }
   │
   ▼
[setStep("audio") ve paralel başlat]
   ├─▶ [POST /api/generate/audio]
   │      ├─ Her hece için buildTtsSyllablePrompt → Wiro TTS
   │      └─ Tüm kelime için buildTtsWordPrompt → Wiro TTS
   │      Output: { syllableAudios[], wordAudioUrl }
   │
   └─▶ [POST /api/generate/visual]
          buildImagePrompt(word, lang, image_prompt)
          Wiro → nano-banana-pro
          Output: { imageUrl }
   │
   ▼
[createWordItem → localStorage (ll_words_v2) + legacy (ll_words)]
   │
   ▼
[setStep("ready")]
   UI artık SyllablesCard + VisualCueCard + PracticeCoachCard gösteriyor.

[Kullanıcı "Mic" butonuna bastı]
   │ MediaRecorder API
   ▼
[Kayıt Blob (webm) → FormData]
   │
   ▼
[POST /api/stt]
   │ ElevenLabs STT üzerinden Wiro
   │ Task submit → wiroWaitForTask (2s polling, 60s timeout)
   │ debugoutput JSON'dan transcript çıkar
   ▼
{ transcript: "merhaba", success: true }
   │
   ▼
[calculateMatchPct (Levenshtein)]
   │ "merhaba" vs "merhaba" → 100%
   ▼
[POST /api/practice/evaluate]
   │ buildEvaluationPrompt({ targetWord, syllables, transcript, matchPct, lang })
   │ Wiro → gemini-2-5-flash
   ▼
{ verdict: "great", syllableChecks: [...], coachTip: "Harika! Her heceyi çok net söyledin!" }
   │
   ▼
[addAttempt → localStorage (ll_attempts)]
[updateAfterPractice → SM-2 güncelle (ll_sr_data)]
   │
   ▼
[UI: verdict + hece kontrol + coach tip gösterir]
```

**Düşüşler (fallback chain):**

- Strategy başarısız → UI error göster, devam etme.
- Audio başarısız → `isFallback: true`, syllableAudios boş URL'lerle döner, Web Speech API devreye girer.
- Visual başarısız → imageUrl boş, placeholder gösterilir.
- STT başarısız → transcript = hedef kelime + random 75-95 matchPct (kullanıcıya başarı hissi vermek için).
- Evaluate başarısız → matchPct'ye göre lokal verdict hesapla.

---

## 5. Sistem Promptları (`lib/prompts.ts`)

**Bu dosya projenin beyin merkezidir.** Tüm LLM çağrıları buradaki prompt builder'ları kullanır. İnline prompt yazmak yasak — herşey buradan geçer.

### 5.1 Ortak Yapı Taşları

Dosyanın başında üç sabit blok var, tüm prompt'larda tekrar kullanılıyor:

#### `TURKISH_PHONETICS_GUIDE`

LLM'e Türkçe fonetik bilgisini hatırlatır:

- `ç` = /tʃ/ İngilizce "chair"daki "ch"
- `ş` = /ʃ/ İngilizce "shoe"daki "sh"
- `ğ` = sessiz, önceki ünlüyü uzatır (sert "g" değil)
- `ı` = /ɯ/ İngilizce'de yok
- `ö` = /ø/ Fransızca "peu"
- `ü` = /y/ Almanca "über"
- Büyük ünlü uyumu kuralı (ince/kalın ünlüler)
- Vurgu genelde son hecede

**Ne işe yarıyor?** Gemini gibi çok dilli modeller bazen "ş"yi "s" + "h" gibi ele alıyor veya hece ayrımında hata yapıyor. Bu rehber modele Türkçe özgül kuralları hatırlatıyor, hata oranı ciddi düşüyor.

#### `SAFETY_GUARDRAILS`

Her prompt'a enjekte edilen pazarlık edilemez güvenlik kuralları:

- Uygulama çocuklar için. Tıbbi/klinik dil yasak.
- "Terapi yerine geçer" iması asla yapılmayacak.
- "Yanlış / hatalı / başarısız / kötü / zayıf" kelimeleri kullanılmayacak.
- Ton: sıcak, sabırlı, cesaretlendirici, oyuncul.
- "Ödev notlayan öğretmen değil, destekçi abla/abi" zihniyetiyle yaz.

**Ne işe yarıyor?** Tez projesi klinik hassas bir alanda — bir LLM'in "telaffuzun bozuk" demesi hasta motivasyonunu yerle bir eder. Bu blok modelin nazik kalmasını garantiler. Özellikle çocuk kullanıcılar için kritik.

#### `JSON_OUTPUT_RULE`

Format zorlama:

- Sadece geçerli JSON dön.
- Markdown fence'i yok (```), yorum yok, önsöz yok, sonsöz yok.
- Kararsızsan boş bırakmak yerine en iyi tahmini ver.

**Ne işe yarıyor?** LLM'ler sık sık "Here's your JSON:" gibi ekleme yapıyor. `safeJsonParseLLM()` fonksiyonu bu kirliliği temizlemeye çalışıyor ama promp'ta önlem almak parse hatası oranını %95 azaltıyor.

### 5.2 `buildStrategyPrompt(input)` — Strateji Üretimi

**Ne amaçla çağrılır?** Kullanıcı kelime girdiğinde hece ayrımı + tanım + koç ipucu + görsel/video prompt'ları üretmek için.

**Input:** `{ word, lang, mode, level }`

**Output JSON:**
```json
{
  "syllables": ["mer", "ha", "ba"],
  "short_definition": "Karşılaşınca söylenen selamlaşma sözü",
  "coach_tip": "Her heceyi yavaşça, gülümseyerek söyle!",
  "image_prompt": "Photorealistic product photograph of a friendly hand wave...",
  "video_prompt": "4-second turntable rotation...",
  "tts_syllable_texts": ["mer", "ha", "ba"],
  "tts_word_text": "merhaba"
}
```

**Prompt'un kilit kısımları:**

1. **"LANGUAGE LOCK"** — Tüm kullanıcı metinleri hedef dilde olmalı. Türkçe kelime için Türkçe tanım, İngilizce için İngilizce. Karışım yok.

2. **"SYLLABLE RULES"** — Türkçe için:
   - Açık heceler (CV) tercih edilir, kapalı heceler (CVC) gerektiğinde kullanılır.
   - Birleşik ünsüz kümeleri ("str" gibi) asla hece başında bölünmez.
   - Her hece: küçük harf, noktalama yok.
   - `tts_syllable_texts` dizisi `syllables` ile **birebir** aynı olmak zorunda (TTS pipeline'ı bu eşitliği varsayıyor).

3. **"COACH_TIP RULES"** — "6 yaşındaki çocukla konuşuyor gibi yaz" talimatı. Örnek: `"Bu ses, rüzgar gibi fısıldar!"`. Teknik dil yasak.

4. **"IMAGE RULES"** — Görsel prompt'lar her zaman **İngilizce** (kelime Türkçe bile olsa). Neden? Nano Banana gibi görsel modeller İngilizce kalıplarla çok daha iyi çalışıyor. Kurallar:
   - Ürün fotoğrafı tarzı, temiz arkaplan, soft ışık.
   - **Metin/harf/logo yok** (çocuk bunu görüp kafası karışmasın).
   - **İnsan yüzü/el/vücut yok** (güvenlik + tek obje odak).
   - Çizgi film/illüstrasyon yasak — fotogerçekçi.

5. **"VIDEO RULES"** — Aynı obje, 4 saniye, dönüş/sallanma/zoom'dan biri. Loopable (ilk kare ≈ son kare). Ses yok.

**Pratik not:** `tts_syllable_texts` ile `syllables` arasındaki eşitlik zorunluluğu önemli. UI `strategy.syllables[i]` ile `audio.syllableAudios[i]` eşleştiriyor — sırayla indeksle. Eşleşmezse yanlış sese yanlış hece gösterilir.

### 5.3 `buildEvaluationPrompt(req)` — Değerlendirme

**Ne amaçla çağrılır?** Kullanıcı konuşup STT transcript ürettikten sonra, telaffuzun kalitesini hece-bazlı değerlendirmek için.

**Input:** `{ targetWord, syllables, transcript, matchPct, lang }`

**Output JSON:**
```json
{
  "verdict": "great" | "close" | "retry",
  "syllable_checks": [
    { "syllable": "mer", "ok": true, "hint": "" },
    { "syllable": "ha", "ok": false, "hint": "Bu heceyi biraz daha uzat" }
  ],
  "coach_tip": "Harika! Her heceyi çok net söyledin!"
}
```

**Prompt'un kilit kısımları:**

1. **"VERDICT RULES (MANDATORY)"** — LLM'in kendi yargısını override eden sert kural:
   - `matchPct >= 90` → verdict = `"great"`
   - `70 ≤ matchPct < 90` → `"close"`
   - `matchPct < 70` → `"retry"`

   **Neden override?** LLM yaratıcı olmak ister, "bence close ama..." diye kararsız kalır. Bu kural ile deterministik sonuç garantili.

2. **"SYLLABLE_CHECKS RULES"** — Çıktı dizisi **zorunlu olarak** girdi `syllables.length` kadar eleman içermeli, aynı sırada. UI bunu map'liyor — eşleşmezse crash olur.

3. **"COACH_TIP RULES"** — Verdict'e göre ton:
   - `great` → kutlama + spesifik övgü: "Her heceyi çok net söyledin!"
   - `close` → efor övgüsü + TEK mikro-ipucu: "Çok yaklaştın! İkinci heceye biraz daha dikkat."
   - `retry` → zorluğu normalleştir + motive et: "Bu zor bir kelime! Hece hece birlikte deneyelim."

   Skor/yüzde/AI kelimeleri yasak.

**Pratik not:** Prompt, modelin "iyi hissettirmek için yüksek skor ver" eğilimini `matchPct` ile bloke ediyor ama coach_tip'te pozitif dil garantileniyor. Böylece "retry" verdict'i bile motive edici kalıyor.

### 5.4 `buildImagePrompt(word, lang, baseIdea)` — Görsel Prompt Builder

**Ne amaçla?** Strategy'nin ürettiği `image_prompt` field'ını Wiro image API'ye gönderilen tam prompt'a genişletmek için.

**Yapı:**

- "MANDATORY STYLE" — Stüdyo backdrop, soft ışık, 60-70% frame dolumu, netlik, doğal renkler.
- "THE OBJECT" — Strategy'den gelen `baseIdea` burada.
- "HARD RESTRICTIONS" — Metin/logo yok, insan yok, çizgi film yok, karanlık içerik yok. Her ihlal "fail".
- "QUALITY TARGET" — Gerçek stüdyo fotoğrafından ayırt edilemesin, 5 yaşındaki hemen tanısın.

**Pratik not:** "Hard restrictions violating any = failure" kalıbı LLM'leri disiplinli tutmak için kullanılan yaygın bir teknik. Model "belki bir küçük logo eklesem..." diye kaçamak yapmıyor.

### 5.5 `buildVideoPrompt(word, lang, baseIdea)` — Video Prompt Builder

`buildImagePrompt`'ın video kuzeni. Aynı obje + stüdyo kurgusu + 3 hareket seçeneği (turntable dönüş / 5° sallanma / yavaş zoom). Loop noktası görünmez, 4 saniye, sessiz.

**Neden sessiz?** Videoda ses üretmek pahalı + senkron kalite düşük. Zaten ayrı TTS API'si var.

### 5.6 `buildQuizPrompt(category, lang)` — Quiz Sorusu

**Ne amaçla?** Quiz sayfasında her soru için yeni bir kelime + 3 yanlış şık + görsel prompt üretmek.

**Output JSON:**
```json
{
  "word": "elma",
  "hint": "Kırmızı veya yeşil, ağaçta yetişen meyve",
  "options": ["elma", "armut", "portakal", "muz"],
  "imagePrompt": "a cute friendly apple with soft pastel colors..."
}
```

**Kilit kurallar:**

- 5-10 yaş çocuğun bildiği basit kelime.
- İpucu kelimeyi doğrudan söylemeyecek.
- Yanlış şıklar aynı kategoriden (elma/armut/portakal/muz — hepsi meyve).
- **Doğru cevap her zaman `options[0]`** — frontend shuffle ediyor, böylece veri sırası tutarlı.
- `imagePrompt` çocuk dostu, pastel, tatlı illüstrasyon stili.

### 5.7 `buildQuizImagePrompt(word, lang, baseIdea)` — Quiz Görseli

Quiz görseli ana pratik görselinden **farklı**: fotorealistik değil, **pastel çocuk kitabı illüstrasyonu** stili. Yumuşak formlar, mavi/yeşil/şeftali/lavanta paleti. Sevimli ve dostane.

**Neden farklı?** Quiz eğlence modu, pratik eğitim modu. Tonal ayrım UI'da da hissedilsin.

### 5.8 `buildPacksPrompt(category, count, lang)` — Kelime Paketi

**Ne amaçla?** Admin veya kullanıcı "Yiyecekler kategorisinde 10 kelimelik paket yap" dediğinde çağrılır.

**Output:**
```json
{
  "packName": "Lezzetli Yiyecekler",
  "packDescription": "Mutfaktan tanıdık 10 kelime",
  "words": [
    { "word": "elma", "definition": "Meyve", "syllables": ["el","ma"], "level": "beginner" }
  ]
}
```

Türkçe için `TURKISH_PHONETICS_GUIDE` enjekte ediliyor → hece ayrımı doğru çıksın.

### 5.9 TTS Prompt Builder'ları

- `buildTtsSyllablePrompt(syllable, lang)` — "Pronounce ONLY the Turkish syllable 'mer' slowly..." — TEK hece, yavaş, net, ünlüyü hafif uzat, başka kelime ekleme.
- `buildTtsWordPrompt(word, lang)` — Tüm kelime, doğal ama hafif yavaş, heceler ayırt edilebilsin.
- `buildTtsBody(model, text, lang, speed)` — Wiro TTS body nesnesi. `speed: "slow" → rate: 0.7, "normal" → 1.0`. Hem `language` hem `lang` field'ı (farklı modellerle uyumluluk için).

**Pratik not:** TTS prompt'u İngilizce yazılıyor ama hedef ses Türkçe — çünkü model talimatları İngilizce, ses çıktısı `language: "tr-TR"` parametresiyle zorlanıyor.

---

## 6. API Route'ları (`app/api/`)

### 6.1 Auth

#### `POST /api/auth/register`
**Input:** `{ email, password, name }`
**Davranış:**
1. Input validate (email regex, min 6 şifre, 2-100 char name).
2. Supabase `auth.signUp()` → yeni auth.users kaydı.
3. `profiles` tablosuna ek kayıt (id, email, name).
4. Başarısızsa rollback (auth.users sil).
**Output:** `{ success, user }`
**Not:** ⚠️ Şu an `SUPABASE_SERVICE_ROLE_KEY` kullanıyor — RLS bypass riski. SSR client'a geçilmeli.

#### `POST /api/auth/login`
**Input:** `{ email, password }`
**Davranış:** Supabase `signInWithPassword` → session cookie set. Supabase yoksa demo mode fallback.
**Output:** `{ success, user, session }`

### 6.2 Generation (Wiro AI)

| Endpoint | Model | Amaç |
|----------|-------|------|
| `POST /api/generate/strategy` | gemini-2-5-flash | Hece + tanım + coach tip + media prompts |
| `POST /api/generate/audio` | gemini-2-5-tts (voice: Achernar) | Hece + kelime TTS (paralel) |
| `POST /api/generate/visual` | nano-banana-pro (1K) | Ürün fotoğrafı tarzı görsel |
| `POST /api/generate/video` | veo3-1-fast (720p, 4s) | Loopable video |
| `POST /api/generate/quiz` | gemini-2-5-flash + nano-banana-pro | Quiz sorusu + görsel |
| `POST /api/generate/packs` | gemini-2-5-flash | Kategoriye göre kelime paketi |

**Ortak pattern:**
1. Input sanitize + validate.
2. `lib/prompts.ts`'ten ilgili builder'ı çağır.
3. `lib/wiro.ts`'ten `wiroRunMultipart(modelId, params)`.
4. `wiroWaitForTask(token)` ile polling (60s timeout).
5. Response'tan URL veya JSON çıkar (`extractUrl`, `safeJsonParseLLM`).
6. Hata durumunda `{ isFallback: true, ... }` dön.

### 6.3 Practice

#### `POST /api/practice/evaluate`
**Input:** `{ targetWord, syllables[], transcript, matchPct, lang }`
**Davranış:**
1. `buildEvaluationPrompt()` → Gemini 2.5 Flash.
2. JSON parse edilemez veya hata → `matchPct`'ye göre lokal verdict hesapla, syllableChecks hepsi `ok:true`, generic coach tip.
**Output:** `{ verdict, syllableChecks[], coachTip }`

### 6.4 STT

#### `POST /api/stt`
**Input:** `multipart/form-data` — audio blob + lang.
**Davranış:**
1. File tipi kontrol (webm/wav/mp3/ogg/mp4), max 10MB.
2. Wiro STT task submit (ElevenLabs model).
3. `wiroWaitForTask()` ile 2s interval × 30 max polling.
4. Response'un `debugoutput` field'ından transcript'i regex/JSON parse ile çıkar.
5. Başarısızsa `{ success: false, fallback: true, transcript: "" }`.
**Output:** `{ transcript, success, fallback? }`

**Dikkat:** Bu route şu an auth check yapmıyor → spam riski. Rate limit + auth gate eklenmeli.

---

## 7. Kütüphane Modülleri (`lib/`)

### 7.1 `lib/wiro.ts` — Wiro API Client

**741 satırlık** dev dosya. Sorumluluğu:

- **Auth:** `wiroHeaders(nonce?)` — HMAC-SHA256 ile x-api-key / x-nonce / x-signature header'ları üretir.
- **Transport:**
  - `wiroJson<T>(path, body)` — JSON POST, 60s timeout.
  - `wiroMultipart<T>(path, formData)` — FormData POST.
- **Yüksek seviye:**
  - `wiroRunMultipart(modelId, params)` — Herhangi bir model için task submit eder, token döner.
  - `wiroWaitForTask(taskToken)` — 2s interval ile polling, max 30 deneme, tamamlanınca debugoutput döner.

**Env vars:**
- Zorunlu: `WIRO_BASE_URL`, `WIRO_API_KEY`, `WIRO_API_SECRET`
- Opsiyonel model override'ları: `WIRO_LLM_MODEL_ID`, `WIRO_IMAGE_MODEL_ID`, `WIRO_VIDEO_MODEL_ID`, `WIRO_TTS_MODEL_ID`, `WIRO_STT_MODEL_ID`
- Feature flag: `ENABLE_STT=true`

### 7.2 `lib/text.ts` — Metin Yardımcıları

- `normalizeText(s)` — Küçük harf, trim, noktalama sil, boşlukları sadeleştir. Türkçe karakter farkında.
- `levenshtein(a, b)` — Klasik edit distance (O(m·n) matris).
- `matchPct(target, transcript)` — `1 - (distance / max(len(a), len(b)))` × 100, 0-100 aralık.
- `safeJsonParseLLM<T>(text)` — LLM çıktısından ilk JSON objesini çeker:
  - Markdown fence'leri (```json) temizler.
  - Trailing comma düzeltir.
  - Unquoted key'leri quote'lar (fallback).
- `extractLLMContent(data)` — Farklı Wiro response shape'lerinden content çekme (choices[0].message.content, output_text, text, content, vb.).
- `extractUrl(data, fieldNames)` — İç içe nested obje içinde URL bul.

### 7.3 `lib/syllabify.ts` — Türkçe Hece Ayırma

**Algoritma:** Rekürsif kural-tabanlı.

1. Ünlü tespiti (a, e, ı, i, o, ö, u, ü — büyük/küçük).
2. Soldan sağa tarama:
   - Ünlüden sonra ünsüz + ünlü gelirse → ünsüz sonraki heceye aittir (açık hece tercihi).
   - İki ünlü yan yana → ayır.
   - Kelime sonunda ünsüz kümesi → son heceye dahil et.
3. Sonuç array'e yaz.

**Örnekler:**
- "merhaba" → `["mer", "ha", "ba"]`
- "araba" → `["a", "ra", "ba"]`
- "kitap" → `["ki", "tap"]`
- "öğretmen" → `["öğ", "ret", "men"]`

`formatSyllables(["mer","ha","ba"])` → `"mer · ha · ba"`

**Not:** Bu algoritma LLM'in üretmediği durumlar için client-side fallback. Strategy başarılı olursa LLM çıktısı kullanılır.

### 7.4 `lib/spaced-repetition/sm2.ts` — SM-2 Algoritması

SuperMemo 2 algoritmasının TypeScript implementasyonu. Anki'nin de kullandığı klasik yöntem.

**Data shape:**
```typescript
interface SpacedRepetitionData {
  wordId: string;
  easeFactor: number;        // başlangıç: 2.5, min: 1.3
  interval: number;          // gün cinsinden
  repetitions: number;       // başarılı ardışık tekrar sayısı
  nextReviewDate: string;    // ISO date
  lastReviewDate: string | null;
}
```

**Quality mapping (verdict → 0-5):**
- `great` + matchPct >= 95 → 5 (perfect)
- `great` → 4 (good)
- `close` + matchPct >= 80 → 3
- `close` → 2
- `retry` + matchPct >= 50 → 1
- `retry` → 0 (blackout)

**Formül:**
```
if quality >= 3:
  repetitions++
  if repetitions == 1: interval = 1
  elif repetitions == 2: interval = 6
  else: interval = round(interval * easeFactor)
else:
  repetitions = 0
  interval = 1

easeFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
easeFactor = max(easeFactor, 1.3)
```

**Mastered kriteri:** `interval >= 21` gün (yaklaşık 3 hafta).

### 7.5 `lib/stores/word-store.ts` — Yeni LocalStorage Store (v2)

localStorage key'leri: `ll_words_v2`, `ll_attempts`, `ll_lists_v2`, `ll_history_v2`.

**API özeti:**

**Words:**
- `getWords()`, `getWord(id)`, `getWordByText(text)`, `searchWords(query, lang?)`, `getRecentWords(limit=10)`
- `addWord(omit id/timestamps)` — UUID + createdAt/updatedAt üretir.
- `updateWord(id, partial)`, `deleteWord(id)` (SR data'yı da temizler).

**Attempts:**
- `addAttempt(attempt)` — Listenin **başına** ekler, max 500 tutar (eski olanları atar).
- `getAttempts()`, `getAttemptsByWord(wordId)`, `getRecentAttempts(limit=20)`.
- `getAttemptsByDay()` — Tarih string'ine göre gruplar (ilerleme grafiği için).

**Lists:**
- CRUD + `addWordToList`, `removeWordFromList`, `getWordsByList`.

**History:**
- `addHistoryEvent(wordId, event, attemptId?, listId?)` — Son 200 olayı tutar.
- Event tipleri: `"practiced"`, `"learned"`, `"added_to_list"`, `"created"`.

**Seed:**
- `seedDefaultData()` — İlk açılışta 5 TR + 3 EN örnek kelime doldurur.

### 7.6 `lib/data-store.ts` — Legacy Store

Eski v1 şeması. Birkaç farklı field: `text` (yeni: `word`), `definition` (yeni: `shortDefinition`). Şu an çift yazım yapılıyor (`dashboard/page.tsx:118-127`) ki migration tamamlansın. **Temizleme planlı** (review'da yüksek öncelik).

### 7.7 `lib/types/word.ts` ve `lib/types.ts`

**Core tipler:**

```typescript
type Lang = "tr" | "en";
type Level = "beginner" | "intermediate";
type Verdict = "great" | "close" | "retry";
type PipelineStep = "idle" | "strategy" | "audio" | "visual" | "video" | "ready";

interface WordItem {
  id: string;
  word: string;
  lang: Lang;
  syllables: string[];
  shortDefinition: string;
  coachTip: string;
  imageUrl?: string;
  level?: Level;
  tags?: string[];
  isFavorite?: boolean;
  isLearned?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PracticeAttempt {
  id: string;
  wordId: string;
  transcript: string;
  matchPct: number;
  verdict: Verdict;
  syllableChecks: { syllable: string; ok: boolean; hint: string }[];
  coachTip: string;
  durationMs?: number;
  pauses?: number;
  createdAt: string;
}

interface StrategyResult {
  word: string; syllables: string[]; definition: string; coachingTip: string;
  level: Level; lang: Lang; mode: "speech" | "language";
  image_prompt: string; video_prompt: string;
  tts_syllable_texts: string[]; tts_word_text: string;
}
```

### 7.8 `lib/i18n/language-context.tsx`

React Context + Provider. `useLanguage()` hook.

```typescript
const { lang, setLang, t } = useLanguage();
```

`t` nesnesi `lib/i18n/translations.ts`'ten geliyor — tüm UI string'leri TR/EN map'i. `lang` değişince localStorage'a (`ll_language`) yazılıyor ve component'ler re-render oluyor.

### 7.9 `lib/supabase/{client,server}.ts`

- **Browser client** (`client.ts`): Singleton pattern ile tek instance, `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` kullanır. Placeholder değerlerde `null` döner → fallback aktif.
- **Server client** (`server.ts`):
  - `createServerSupabase()` — Next cookies ile SSR.
  - `createAdminSupabase()` — `SUPABASE_SERVICE_ROLE_KEY` kullanır, sadece server-side. **Tehlikeli** — RLS bypass eder.

### 7.10 `lib/auth.ts`

Supabase yoksa fallback. localStorage `ll_auth` key'inde `{ isLoggedIn, email?, createdAt }` tutar.

### 7.11 `lib/utils.ts`

`cn(...classes)` — `clsx` + `tailwind-merge` kombinasyonu. Shadcn-style.

---

## 8. Core Algoritmalar

| Algoritma | Dosya | Amaç |
|-----------|-------|------|
| **Levenshtein distance** | `lib/text.ts` | İki string arası edit uzaklığı → matchPct |
| **Türkçe hece ayırma** | `lib/syllabify.ts` | CV/CVC kuralı, ünlü uyumu |
| **SM-2 spaced repetition** | `lib/spaced-repetition/sm2.ts` | Tekrar aralığı optimizasyonu |
| **LLM JSON parser** | `lib/text.ts::safeJsonParseLLM` | Kirli LLM çıktısını temizle |
| **HMAC-SHA256 auth** | `lib/wiro.ts::wiroHeaders` | Wiro API imza |

---

## 9. Frontend — Sayfalar ve Bileşenler

### 9.1 Sayfa haritası

| Route | Amaç |
|-------|------|
| `/` | Landing (pazarlama) |
| `/login`, `/register` | Auth |
| `/offline` | PWA offline fallback |
| `/dashboard` | Ana pratik sayfası |
| `/dashboard/daily` | Günlük pratik (SM-2 due list) |
| `/dashboard/quiz` | Quiz modu |
| `/dashboard/packs` | Kelime paketleri |
| `/dashboard/dictionary` | Sözlük / arama |
| `/dashboard/lists` + `/lists/[id]` | Kelime listeleri |
| `/dashboard/word/[id]` | Kelime detay |
| `/dashboard/history` | Pratik geçmişi |
| `/dashboard/progress` | İlerleme + grafik |
| `/dashboard/settings` | Kullanıcı ayarları |
| `/admin/*` | Admin panel (user/pack/analytics) |

### 9.2 Bileşen grupları

- **`components/landing/`** — navbar, hero, how-it-works, features-section, games-section, practice-preview, who-its-for, settings-section, cta-section, footer, modes-section, trust-section.
- **`components/practice/`** — word-input-card, syllables-card, visual-cue-card, video-cue-card, voice-recorder, practice-coach-card.
- **`components/dashboard/`** — dashboard-shell (sidebar + topbar + content wrapper).
- **`components/layout/`** — app-shell, sidebar, top-bar, status-pipeline (pipeline progress bar).
- **`components/auth/`** — login-modal.
- **`components/pwa/`** — sw-register (service worker registration), install-prompt (iOS/Android A2HS).
- **`components/ui/`** — button, card, input, select, skeleton (shadcn-style primitive'ler).

### 9.3 `PracticeCoachCard` — Core Bileşen

608 satır (god component — refactor planlı). İçinde:

- MediaRecorder API ile ses kaydı.
- STT → `/api/stt` çağrısı.
- matchPct hesaplama (`calculateMatchPct` helper).
- LLM evaluate → `/api/practice/evaluate`.
- Verdict UI (great/close/retry renk kodlu + ikon).
- Hece check grid.
- Attempt kaydetme (`addAttempt` + SR güncelleme).

---

## 10. Database ve RLS Politikaları

### 10.1 Enum'lar

- `user_role`: `'user' | 'admin' | 'superadmin'`
- `difficulty_level`: `'beginner' | 'intermediate' | 'advanced'`
- `language_code`: `'tr' | 'en'`
- `attempt_verdict`: `'great' | 'close' | 'retry'`

### 10.2 Tablolar

**`profiles`** — `auth.users` extension:
- id (UUID, FK auth.users, ON DELETE CASCADE)
- email (UNIQUE), name (2-100 char check), avatar_url, role, is_active, preferred_language
- Stats: total_practice, total_words, current_streak, longest_streak, quiz_high_score, last_practice_date
- Indexes: email, role, is_active, created_at

**`words`** — Kullanıcı kelimeleri:
- user_id (FK profiles)
- text, lang, definition, syllables (JSONB), word_audio_url, syllable_audios (JSONB), visual_url, visual_prompt, coaching_tip
- Flags: is_favorite, is_hard, is_learned
- Stats: practice_count, success_count, last_practiced_at
- UNIQUE (user_id, text, lang)

**`lists`** — Kelime listeleri:
- user_id, name (1-100 char), description, icon (default `📚`), color, word_count

**`list_words`** — M2M (list ↔ word), UNIQUE(list_id, word_id)

**`practice_sessions`** — Pratik oturumları:
- user_id, word_id, transcript, verdict, accuracy_pct, duration_ms, pauses_count, syllable_checks (JSONB)

### 10.3 RLS

Tüm tablolarda:
- SELECT/INSERT/UPDATE/DELETE → sadece `auth.uid() = user_id`.
- Admin rol'ü tüm verileri görebilir (profiles.role IN ('admin','superadmin')).

---

## 11. Dış Servisler (Wiro AI)

Wiro AI (`https://api.wiro.ai`) çoklu model provider'ı. LearningLoop 5 farklı model kullanıyor:

| Model ID | Amaç |
|----------|------|
| `google/gemini-2-5-flash` | LLM (strategy, evaluation, quiz, packs) |
| `google/nano-banana-pro` | Image generation (1K resolution) |
| `google/veo3-1-fast` | Video (4s, 720p, optional) |
| `google/gemini-2-5-tts` (voice: Achernar) | Text-to-speech |
| `elevenlabs/speech-to-text` | STT |

**Auth flow:**
1. `nonce` üret (random string).
2. `signature = HMAC-SHA256(secret, nonce + body)` ile imzala.
3. Header'lara `x-api-key`, `x-nonce`, `x-signature` ekle.
4. POST gönder → task token dön.
5. Polling ile tamamlanmayı bekle.

**Model override:** Env vars (`WIRO_LLM_MODEL_ID`, vb.) sayesinde kod değişmeden model değiştirilebilir.

---

## 12. PWA ve Service Worker

### 12.1 `public/manifest.json`

- Name: "LearningLoop - Konuşma Pratiği"
- Start URL: `/dashboard`
- Display: `standalone`
- Theme: `#111827`, Background: `#f9fafb`
- Icons: 72px → 512px (maskable variants dahil)
- Categories: `education`, `kids`
- Shortcuts: `/dashboard` (Pratik Yap), `/dashboard/quiz` (Quiz)
- Permissions: `microphone`

### 12.2 `public/sw.js` — Service Worker

**Cache stratejileri:**
- **Static assets** (JS/CSS) → cache-first, uzun TTL.
- **Pages** (HTML) → network-first, fallback `/offline`.
- **API** (`/api/*`) → network-only (taze data).
- **Media** (audio/image Wiro URL'leri) → cache-first, 30 gün TTL.

**Lifecycle:**
- `install` — PRECACHE_URLS listesini önbelleğe al (`/offline`, `/icons/*`, `/manifest.json`).
- `activate` — Eski cache'leri temizle.
- `fetch` — Yukarıdaki strateji matrisine göre yönlendir.

**Offline:** Ağ yoksa `/offline` sayfası servis edilir.

### 12.3 `hooks/usePWA.ts`

- `canInstall` — beforeinstallprompt event yakalandı mı?
- `isInstalled` — Zaten yüklü mü (standalone mode tespit)?
- `isIOS` — iOS cihaz? (Safari custom prompt gerekir)
- `promptInstall()` — Install prompt tetikle.
- `dismiss()` — 7 gün sessize al.

---

## 13. Konfigürasyon ve Env Vars

### 13.1 `next.config.mjs`

```js
serverActions.bodySizeLimit: '10mb'  // STT audio upload için
headers: [
  { source: '/sw.js', headers: [Cache-Control, Service-Worker-Allowed] }
]
```

### 13.2 `tailwind.config.ts`

- HSL-based color system.
- Custom palette: `sage`, `mint`, `warm`.
- Extended border radius + box shadows (soft/soft-lg/soft-xl/inner-soft).
- Custom animations: `pulse-gentle`, `fade-in`, `slide-up`, `scale-in`.
- Font: Inter, SF Pro Display.

### 13.3 `middleware.ts`

- Protected paths: `/dashboard/*`, `/admin/*`.
- Auth olmayanlar `/login`'e yönlenir.
- Admin-only `/admin/*` için `profiles.role IN ('admin','superadmin')` check.
- Supabase env placeholder ise **demo mode** aktif (tüm route'lar açık). ⚠️ Bu güvenlik açığı — explicit `DEMO_MODE=true` flag'i gerekli.

### 13.4 `vercel.json`

- Region: `fra1` (Frankfurt).
- CORS headers `/api/*` için.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`.
- PostHog analytics rewrite.

### 13.5 Env Vars

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-only, RLS bypass

# Wiro
WIRO_BASE_URL=https://api.wiro.ai
WIRO_API_KEY=
WIRO_API_SECRET=
WIRO_LLM_MODEL_ID=google/gemini-2-5-flash
WIRO_IMAGE_MODEL_ID=google/nano-banana-pro
WIRO_VIDEO_MODEL_ID=google/veo3-1-fast
WIRO_TTS_MODEL_ID=google/gemini-2-5-tts
WIRO_STT_MODEL_ID=elevenlabs/speech-to-text

# Feature flags
ENABLE_STT=true
```

---

## 14. Güvenlik Notları

Mevcut durum (2026-04-17 taramasında tespit edilen açıklar):

### Yüksek Öncelik

1. **`SUPABASE_SERVICE_ROLE_KEY` register'da kullanılıyor** (`app/api/auth/register/route.ts:33`) → RLS bypass. SSR client'a geçilmeli.
2. **Rate limit yok** (`/api/auth/*`, `/api/stt`) → brute-force + Wiro fatura yakma riski. Upstash Ratelimit eklenmeli (5/dk/IP).
3. **CSRF koruması yok** — state-changing endpoint'ler açık.
4. **Demo mode middleware fallback** (`middleware.ts:16-18`) env vars eksikse TÜM route'ları açıyor → explicit `DEMO_MODE=true` flag'i şart.
5. **Production console.log'ları** (26+ yer) → DevTools bilgi sızıntısı. NODE_ENV guard'ı ekle.

### Orta Öncelik

- Zayıf şifre politikası (min 6 char).
- STT endpoint'i auth kontrolü yok.
- Input validation bazı yerlerde eksik (regex yumuşak).
- `.env.example` var ama TS tip tanımı yok (Zod ile validate edilmeli).

Detaylı güvenlik checklist + remediation planı memory'de `project_learningloop_review.md`'de.

---

## 15. Bilinen Sınırlamalar ve Yol Haritası

### Teknik Borç

- **Çift store sync** (`lib/data-store.ts` + `lib/stores/word-store.ts`) — migration tamamlanıp legacy silinecek.
- **God component** `PracticeCoachCard.tsx` (608 satır) → `VoiceRecorder`, `ResultDisplay`, `EvaluationPanel` olarak bölünmeli.
- **STT polling duplikasyonu** (`api/stt/route.ts` vs `lib/wiro.ts`) → tek yere al.
- **Test yok** — özellikle `syllabify.ts` ve `text.ts` için Jest şart.
- **`error.tsx` yok** — Wiro timeout'ta sayfa komple çöküyor.
- **`next/image` kullanılmıyor** — Wiro görselleri optimize edilmiyor.

### Planlanan Özellikler (Feature Roadmap)

Memory'de (`project_learningloop_features.md`) 12 özellik önerisi var. Öne çıkanlar:

**Hızlı kazanç:**
1. **Fonem ısı haritası** — r/ş/ç/k/ğ hata istatistiği (terapist için değerli).
2. **Streak + günlük hedef** (Duolingo tarzı).
3. **Avatar maskot + Lottie reaksiyon** (color-blind sorununu da çözer).
4. **Karşılaştırmalı dinleme** (kullanıcı + model sesi yan yana).

**B2B / Terapist:**
5. **Terapist dashboard + haftalık PDF rapor**.
6. **Özel kelime havuzu** (terapist hastaya özel liste).

**Teknik derinlik:**
9. **Offline STT** (Transformers.js Whisper).
11. **ElevenLabs Conversational Agent** (serbest diyalog).

### Dokümantasyon

- Bu dosya (`PROJE_DOKUMANTASYONU.md`)
- `DOCUMENTATION.md` — genel teknik bakış
- `TEZ_DOKUMANI.md` — akademik arka plan
- `SETUP.md` — kurulum rehberi
- `README.md` — proje tanıtımı

---

## Ek: Veri Saklama Konumları

| Nerede | Ne |
|--------|-----|
| **localStorage** | Kullanıcı kelimeleri, attempt'lar, listeler, SR data, dil tercihi, auth fallback |
| **Supabase Postgres** | profiles, words, lists, list_words, practice_sessions (RLS ile korunuyor) |
| **Wiro Storage** | AI üretilmiş görsel/video/audio URL'leri (30 gün TTL cache client tarafında) |
| **Service Worker Cache** | Static assets + media (offline desteği) |

---

**Son güncelleme:** 2026-04-17

**Hazırlayan:** Claude (Opus 4.7) — Anil ile birlikte.

**Repo:** https://github.com/anilfiddan/learningloop.git
