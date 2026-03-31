# LearningLoop: Konusma Bozuklugu Olan Bireyler Icin NLP Destekli Telaffuz Asistani

## Bitirme Projesi / Tez Dokumani

---

## OZET

Bu calisma, konusma ve telaffuz bozuklugu yasayan bireylere yonelik, dogal dil isleme (NLP) tabanli bir telaffuz asistani gelistirmeyi amaclamaktadir. LearningLoop adi verilen sistem, yapay zeka teknolojilerini kullanarak kullanicilarin telaffuz performansini analiz etmekte, kisisellestirilmis geri bildirim sunmakta ve zaman icindeki gelisimlerini takip etmektedir.

Sistem, konusmadan metne (Speech-to-Text / STT), metinden konusmaya (Text-to-Speech / TTS), buyuk dil modelleri (LLM) ve gorsel/video uretimi gibi coklu yapay zeka modulleri icermektedir. Web tabanli, progresif web uygulamasi (PWA) olarak gelistirilen platform, hem masaustu hem mobil cihazlarda kullanilabilir durumdadir.

Calismada Next.js, React, TypeScript gibi modern web teknolojileri ile Wiro AI platformu uzerinden erisilen Google Gemini, ElevenLabs gibi yapay zeka modelleri kullanilmistir. Sistem, profesyonel konusma terapisinin yerine gecmeyi degil, tamamlayici bir destek araci olmayı hedeflemektedir.

**Anahtar Kelimeler:** Dogal Dil Isleme, Konusma Bozuklugu, Telaffuz Analizi, Yapay Zeka, Konusmadan Metne, Progresif Web Uygulamasi, Hece Analizi, Kisisellestirilmis Ogrenme

---

## ABSTRACT

This study aims to develop a Natural Language Processing (NLP) based pronunciation assistant for individuals experiencing speech and pronunciation disorders. The system, named LearningLoop, uses artificial intelligence technologies to analyze users' pronunciation performance, provide personalized feedback, and track their progress over time.

The system incorporates multiple AI modules including Speech-to-Text (STT), Text-to-Speech (TTS), Large Language Models (LLM), and visual/video generation. Developed as a web-based Progressive Web Application (PWA), the platform is accessible on both desktop and mobile devices.

The study utilizes modern web technologies such as Next.js, React, and TypeScript, along with AI models including Google Gemini and ElevenLabs accessed through the Wiro AI platform. The system does not aim to replace professional speech therapy but rather to serve as a complementary support tool.

**Keywords:** Natural Language Processing, Speech Disorder, Pronunciation Analysis, Artificial Intelligence, Speech-to-Text, Progressive Web Application, Syllable Analysis, Personalized Learning

---

## ICERIK

1. [Giris](#1-giris)
2. [Problem Tanimi ve Amac](#2-problem-tanimi-ve-amac)
3. [Literatur Taramasi](#3-literatur-taramasi)
4. [Yontem ve Teknolojiler](#4-yontem-ve-teknolojiler)
5. [Sistem Mimarisi](#5-sistem-mimarisi)
6. [Uygulama Detaylari](#6-uygulama-detaylari)
7. [Yapay Zeka Modulleri](#7-yapay-zeka-modulleri)
8. [Veritabani Tasarimi](#8-veritabani-tasarimi)
9. [Kullanici Arayuzu Tasarimi](#9-kullanici-arayuzu-tasarimi)
10. [Test ve Degerlendirme](#10-test-ve-degerlendirme)
11. [Sonuc ve Oneriler](#11-sonuc-ve-oneriler)
12. [Kaynakca](#12-kaynakca)
13. [Ekler](#13-ekler)

---

## 1. GIRIS

### 1.1 Konunun Onemi

Konusma bozukluklari, bireylerin gunluk iletisimlerini, sosyal iliskilerini ve akademik/mesleki basarilarini dogrudan etkileyen onemli bir saglik sorunudur. Dunya Saglik Orgutu (WHO) verilerine gore, dunya genelinde milyonlarca birey cesitli konusma ve dil bozukluklariyla karsi karsiya kalmaktadir.

Turkiye'de konusma terapistlerine erisim, ozellikle kirsal bolgeler ve kucuk sehirlerde sinirlidir. Terapi seanslari arasindaki sureclerde bireylerin duzenli pratik yapmasi, tedavi surecinin etkinligi acisindan buyuk onem tasimaktadir. Ancak geleneksel yontemlerle ev pratigi yapmak, dogru geri bildirim mekanizmasinin bulunmamasi nedeniyle sinirli kalmaktadir.

Bu baglamda, yapay zeka destekli bir telaffuz asistani, bireylerin terapi seanslari disinda da yapilandirilmis ve geri bildirimli pratik yapabilmelerini saglayarak tedavi surecini destekleyebilir.

### 1.2 Calismanin Kapsami

Bu calisma kapsaminda:
- Turkce ve Ingilizce dillerini destekleyen bir telaffuz pratik platformu gelistirilmistir
- Konusmadan metne (STT) teknolojisi ile kullanici telaffuzu otomatik olarak analiz edilmektedir
- Buyuk dil modelleri (LLM) kullanilarak hece bazli detayli geri bildirim saglanmaktadir
- Gorsel ve isitsel ipuclari ile coklu duyusal ogrenme desteklenmektedir
- Kullanicinin zaman icindeki gelisimi izlenebilmektedir
- Sistem, web tabanli ve progresif web uygulamasi (PWA) olarak her cihazda erisilebilir sekilde tasarlanmistir

### 1.3 Kisitlamalar

- Sistem, tibbi teshis veya tedavi araci degildir
- Profesyonel konusma terapisinin yerine gecmez
- Geri bildirim kalitesi, kullanilan AI modellerinin dogruluguna baglidir
- Internet baglantisi gerektirmektedir (cevrimdisi mod sinirlidir)

---

## 2. PROBLEM TANIMI VE AMAC

### 2.1 Problem

Konusma bozuklugu yasayan bireyler su sorunlarla karsilasmaktadir:

1. **Terapiste erisim guclugu:** Turkiye'de dil ve konusma terapisti sayisi yetersizdir. Ozellikle kirsal bolgelerde bireylerin duzenli terapi alabilmesi zordur.

2. **Ev pratigi eksikligi:** Terapi seanslari arasinda duzenli pratik yapilmasi gerekmesine ragmen, bireylerin evde yapilandirilmis pratik yapabilecekleri araclar sinirlidir.

3. **Geri bildirim yoklugu:** Geleneksel ev pratiklerinde bireylerin telaffuzlarinin dogru olup olmadigini degerlendiren bir mekanizma bulunmamaktadir.

4. **Motivasyon kaybi:** Geri bildirim almadan yapilan tekrarli pratikler, ozellikle cocuklarda motivasyon kaybina yol acmaktadir.

5. **Ilerleme takibi:** Bireylerin ve ailelerinin tedavi surecindeki gelisimi objektif olarak takip edebilecekleri araclar sinirlidir.

### 2.2 Amac

Bu calismanin amaci, yukarida tanimlanan problemlere cozum olarak:

- Yapay zeka destekli, kisisellestirilmis telaffuz geri bildirimi saglayan bir sistem gelistirmek
- Hece bazli detayli analiz ile bireylerin hangi seslerde zorluk yasadigini tespit etmek
- Gorsel, isitsel ve video ipuclari ile coklu duyusal ogrenmeyi desteklemek
- Gamifikasyon unsurlari ile motivasyonu artirmak
- Kullanicinin zaman icindeki gelisimini olculebilir sekilde takip etmek
- Her yasta ve her seviyede bireyin kolayca kullanabilecegi bir arayuz tasarlamak

### 2.3 Hedef Kitle

| Grup | Aciklama |
|------|----------|
| Cocuklar | Konusma gelisim surecinde destek gerektiren cocuklar |
| Yetiskinler | Telaffuz zorluklari yasayan veya ikinci dilde netlik isteyen yetiskinler |
| Terapistler | Hastalarina ev odevi olarak onerebilecekleri tamamlayici arac |
| Aileler | Yakinlarinin konusma pratik surecine destek olmak isteyen aile uyeleri |

---

## 3. LITERATUR TARAMASI

### 3.1 Konusma Bozukluklari

Konusma bozukluklari, artikulasyon bozukluklari, fonolojik bozukluklar, akicilik bozukluklari (kekemelik) ve ses bozukluklari olarak siniflandirilmaktadir (ASHA, 2023). Bu bozukluklar, bireylerin sesletim, prozodi, ritim veya ses kalitesi alanlarinda gucluk yasamasina neden olmaktadir.

Turkce, aglutinatif (eklemeli) yapisi ve sesli uyumu ozellikleri nedeniyle telaffuz pratigi acisindan kendine ozgu zorluklar icerir. Turkce'ye ozgu sesler (ö, ü, ı, ğ, ş, ç) yabanci dil konusuculari ve konusma bozuklugu olan bireyler icin ek zorluklar olusturmaktadir.

### 3.2 Teknoloji Destekli Konusma Terapisi

Son yillarda teknoloji destekli konusma terapisi alaninda onemli gelismeler yasanmistir:

- **Konusmadan Metne (STT) Sistemleri:** Google Speech-to-Text, ElevenLabs, Whisper gibi modeller konusma tanima alaninda yuksek dogruluk oranlarina ulasmistir.
- **Buyuk Dil Modelleri (LLM):** GPT, Gemini gibi modeller dogal dil anlama ve uretme yetenekleri ile kisisellestirilmis geri bildirim olusturabilmektedir.
- **Metinden Konusmaya (TTS):** Modern TTS sistemleri, dogal ve anlasilir ses uretimi saglayarak referans telaffuz ornekleri olusturabilmektedir.

### 3.3 Mevcut Cozumler ve Eksiklikler

Piyasada bulunan mevcut uygulamalar incelendiginde:

| Uygulama | Guclu Yonler | Zayif Yonler |
|----------|-------------|-------------|
| Speech Blubs | Cocuklara yonelik, gorsel zengin | Turkce destegi yok, sinirli geri bildirim |
| Articulation Station | Profesyonel icerik | Sadece iOS, pahalı, Turkce yok |
| Google Read Along | Ucretsiz, AI destekli | Sadece okuma odakli, telaffuz analizi sinirli |
| Duolingo | Gamifikasyon, genis dil destegi | Konusma bozukluguna ozel degil |

LearningLoop, bu eksiklikleri gidermek uzere tasarlanmistir:
- Turkce ve Ingilizce destegi
- Hece bazli detayli telaffuz analizi
- Konusma bozukluguna ozel pozitif geri bildirim tonu
- Ucretsiz ve web tabanli erisim
- Coklu duyusal ogrenme (ses, gorsel, video, metin)

---

## 4. YONTEM VE TEKNOLOJILER

### 4.1 Gelistirme Yontemi

Proje, cevik (Agile) yazilim gelistirme metodolojisi ile iteratif olarak gelistirilmistir. Her iterasyonda yeni ozellikler eklenmis, test edilmis ve kullanici geri bildirimlerine gore iyilestirilmistir.

### 4.2 Kullanilan Teknolojiler

#### 4.2.1 Frontend Teknolojileri

| Teknoloji | Surum | Kullanim Amaci |
|-----------|-------|----------------|
| Next.js | 14.2.3 | React tabanli full-stack web framework |
| React | 18.3.1 | Kullanici arayuzu bilesenleri |
| TypeScript | 5.4.5 | Tip guvenli JavaScript |
| Tailwind CSS | 3.4.3 | Utility-first CSS framework |
| Lucide React | 0.378.0 | Ikon kutuphanesi |

**Next.js** tercih sebebi: App Router yapisinın sunucu ve istemci tarafli renderlama, API route'lari, middleware ve otomatik kod bolme ozelliklerini tek catı altinda sunmasi.

**TypeScript** tercih sebebi: Derleme zamaninda hata yakalama, IDE destegi ve buyuk olcekli proje yonetilebilirligi.

#### 4.2.2 Yapay Zeka Teknolojileri

| Teknoloji | Model | Kullanim Amaci |
|-----------|-------|----------------|
| Google Gemini 2.5 Flash | LLM | Hece ayirma, telaffuz degerlendirme, kocluk |
| Google Gemini 2.5 TTS | TTS | Referans telaffuz sesleri uretimi |
| ElevenLabs STT | STT | Kullanici konusmasini metne cevirme |
| Google Nano Banana Pro | Gorsel | Kelimeyi somutlastiran gorsel uretimi |
| Google VEO 3.1 | Video | Kisa animasyon/video uretimi |

Bu modellere **Wiro AI** platformu uzerinden erisim saglanmaktadir. Wiro, HMAC-SHA256 tabanli kimlik dogrulama ve asenkron gorev yonetimi sunmaktadir.

#### 4.2.3 Backend ve Veritabani

| Teknoloji | Kullanim Amaci |
|-----------|----------------|
| Supabase | PostgreSQL veritabani, kimlik dogrulama, dosya depolama |
| Next.js API Routes | Sunucu tarafli is mantigi |
| localStorage | Istemci tarafli veri onbellekleme |

#### 4.2.4 Altyapi

| Teknoloji | Kullanim Amaci |
|-----------|----------------|
| Vercel | Hosting ve deployment |
| Service Worker | Cevrimdisi destek ve onbellekleme |
| PWA | Mobil uygulama deneyimi |

### 4.3 Sistem Gereksinimleri

**Kullanici tarafi:**
- Modern web tarayicisi (Chrome, Firefox, Safari, Edge)
- Mikrofon erisimi
- Internet baglantisi

**Sunucu tarafi:**
- Node.js calisma ortami
- Wiro AI API erisimi
- Supabase projesi (opsiyonel)

---

## 5. SISTEM MIMARISI

### 5.1 Genel Mimari

Sistem, uc katmanli bir mimari uzerine insa edilmistir:

```
┌─────────────────────────────────────────────────┐
│                  SUNUM KATMANI                   │
│  (Next.js + React + TypeScript + Tailwind CSS)   │
│                                                   │
│  Landing Page | Dashboard | Quiz | Ayarlar        │
│  Pratik Kocu  | Sozluk    | Ilerleme             │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                  IS MANTIGI KATMANI               │
│            (Next.js API Routes)                   │
│                                                   │
│  /api/generate/strategy  - Strateji olusturma     │
│  /api/generate/audio     - TTS ses uretimi        │
│  /api/generate/visual    - Gorsel uretimi         │
│  /api/generate/video     - Video uretimi          │
│  /api/generate/quiz      - Quiz sorusu uretimi    │
│  /api/practice/evaluate  - Telaffuz degerlendirme  │
│  /api/stt                - Konusmadan metne        │
│  /api/auth/login         - Giris                   │
│  /api/auth/register      - Kayit                   │
└──────────┬──────────────────────┬───────────────┘
           │                      │
           ▼                      ▼
┌────────────────────┐  ┌────────────────────────┐
│   VERI KATMANI     │  │   YAPAY ZEKA KATMANI   │
│                    │  │                        │
│  Supabase          │  │  Wiro AI Platform      │
│  - PostgreSQL      │  │  - Gemini (LLM)        │
│  - Auth            │  │  - Gemini TTS          │
│  - Storage         │  │  - ElevenLabs STT      │
│  - RLS             │  │  - Nano Banana (Gorsel) │
│                    │  │  - VEO (Video)          │
│  localStorage      │  │                        │
│  - Kelimeler       │  │  HMAC-SHA256 Auth       │
│  - Denemeler       │  │  Async Task Polling     │
│  - Ayarlar         │  │                        │
└────────────────────┘  └────────────────────────┘
```

### 5.2 Veri Akis Diyagrami

```
Kullanici ──[kelime girer]──> Frontend
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            Strateji API              Gorsel API
            (Gemini LLM)            (Nano Banana)
                │                       │
                ▼                       ▼
          Hece ayirma              AI gorsel uretimi
          Tanim                    1024x1024 px
          Kocluk ipucu
                │
                ▼
            TTS API
          (Gemini TTS)
                │
                ▼
          Hece sesleri
          Kelime sesi
                │
                ▼
    Kullanici icerik kartlarini gorur
    (Heceler + Gorsel + Sesler + Ipucu)
                │
                ▼
    Kullanici mikrofona konusur
    (Web Audio API ile kayit)
                │
                ▼
            STT API
        (ElevenLabs STT)
                │
                ▼
          Transkript olusur
                │
                ▼
        Degerlendirme API
          (Gemini LLM)
                │
                ▼
    ┌───────────┴───────────┐
    │   Degerlendirme       │
    │   - Verdict (harika/  │
    │     yakin/tekrar)     │
    │   - Eslesme yuzdesi   │
    │   - Hece kontrolleri  │
    │   - Kocluk ipuclari   │
    └───────────┬───────────┘
                │
                ▼
    Kullaniciya geri bildirim gosterilir
    Sonuc localStorage'a kaydedilir
```

### 5.3 Bilesen Diyagrami

```
┌──────────────────────────────────────────────────┐
│                    APP SHELL                      │
│  ┌──────────┐  ┌────────────────────────────┐    │
│  │ Sidebar  │  │      Sayfa Icerigi          │    │
│  │          │  │                              │    │
│  │ Pratik   │  │  ┌─────────────────────┐    │    │
│  │ Quiz     │  │  │ WordInputCard       │    │    │
│  │ Paketler │  │  │ (Kelime girisi)     │    │    │
│  │ Sozluk   │  │  └─────────┬───────────┘    │    │
│  │ Listeler │  │            │                 │    │
│  │ Gecmis   │  │  ┌────────┴────────┐        │    │
│  │ Ilerleme │  │  │                  │        │    │
│  │ Ayarlar  │  │  ▼                  ▼        │    │
│  │          │  │ ┌──────────┐ ┌───────────┐   │    │
│  │          │  │ │SyllCard  │ │VisualCard │   │    │
│  │          │  │ │(Heceler) │ │(AI Gorsel)│   │    │
│  │          │  │ └──────────┘ └───────────┘   │    │
│  │          │  │                               │    │
│  │          │  │ ┌───────────────────────────┐ │    │
│  │          │  │ │  PracticeCoachCard        │ │    │
│  │          │  │ │  ┌────────────────────┐   │ │    │
│  │          │  │ │  │ VoiceRecorder      │   │ │    │
│  │          │  │ │  │ (Mikrofon kayit)   │   │ │    │
│  │          │  │ │  └────────────────────┘   │ │    │
│  │          │  │ │  ┌────────────────────┐   │ │    │
│  │          │  │ │  │ Geri Bildirim      │   │ │    │
│  │          │  │ │  │ (Verdict + Heceler)│   │ │    │
│  │          │  │ │  └────────────────────┘   │ │    │
│  │          │  │ └───────────────────────────┘ │    │
│  └──────────┘  └────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## 6. UYGULAMA DETAYLARI

### 6.1 Turkce Hece Ayirma Algoritmasi

Sistemin temel bilesenlerinden biri, Turkce kelimeleri dogru sekilde hecelere ayiran algortimadir. Bu algoritma, Turkce'nin fonotaktik kurallarina dayali olarak gelistirilmistir.

**Turkce Hece Kurallari:**

1. Her hece bir unlu harf icerir
2. Turkce unluler: a, e, i, o, u, ı, o, u
3. Iki unlu arasindaki tek unsuz, sonraki heceye aittir (a-ra-ba)
4. Iki unlu arasindaki iki unsuzun ilki onceki, ikincisi sonraki heceye aittir (bas-la)
5. Uc unsuz yan yana geldiginde ilk ikisi onceki heceye aittir (Turk-ce)

**Algoritma Ornekleri:**

| Kelime | Heceleme | Kural |
|--------|----------|-------|
| araba | a-ra-ba | Kural 3 |
| merhaba | mer-ha-ba | Kural 4 |
| tesekkurler | te-sek-kur-ler | Kural 4, 5 |
| istanbul | is-tan-bul | Kural 4 |
| ogretmen | og-ret-men | Kural 4 |

**Implementasyon:** `lib/syllabify.ts` dosyasinda TypeScript ile uygulanmistir.

### 6.2 Telaffuz Eslesme Algoritması

Kullanicinin soyledigi kelime (STT transkripti) ile hedef kelime arasindaki benzerlik, **Levenshtein Mesafesi** algoritmasi kullanilarak hesaplanmaktadir.

**Formul:**
```
matchPct = (1 - (levenshteinDistance / maxLength)) * 100
```

**Ornekler:**

| Hedef | Soylenen | Mesafe | Eslesme % |
|-------|----------|--------|-----------|
| merhaba | merhaba | 0 | 100% |
| merhaba | merbaba | 1 | 85% |
| kitap | ktap | 1 | 80% |
| tesekkurler | tesekkurle | 1 | 90% |

**Implementasyon:** `lib/text.ts` dosyasinda `matchPct()` fonksiyonu olarak uygulanmistir.

### 6.3 Ses Kayit ve Analiz

Kullanici sesinin kaydedilmesi icin **Web Audio API** kullanilmaktadir.

**Ozellikler:**
- MediaRecorder API ile ses kaydi
- AudioContext ile gercek zamanli frekans analizi
- Otomatik sessizlik tespiti (pause detection)
- Kayit suresi ve duraklama sayisi olcumu

**Sessizlik Tespiti Algoritmasi:**
```
1. AudioContext ile AnalyserNode olustur
2. Her frame'de frekans verisini oku
3. Ortalama genlik esik degerinin altindaysa "sessizlik" say
4. Ardisik sessizlik suresi esigi asarsa "duraklama" olarak isaretle
```

Bu metrikler, kullanicinin konusma akiciligi hakkinda bilgi saglamaktadir.

### 6.4 Coklu Duyusal Ogrenme Destegi

Sistem, ogrenmeyi guclendirmek icin birden fazla duyu kanalini kullanmaktadir:

| Duyu Kanali | Uygulama | Teknoloji |
|-------------|----------|-----------|
| Isitsel | Referans telaffuz sesleri | Gemini TTS |
| Gorsel | Kelimeyi somutlastiran gorsel | Nano Banana Pro |
| Gorsel (video) | Kisa animasyon | VEO 3.1 |
| Kinestetik | Agiz pozisyonu rehberligi | LLM metin uretimi |
| Metin | Tanim ve kocluk ipuclari | LLM metin uretimi |

### 6.5 Geri Bildirim Mekanizmasi

Sistem, uc kademeli bir degerlendirme sistemi kullanmaktadir:

| Verdict | Eslesme | Aciklama | Renk |
|---------|---------|----------|------|
| Harika (great) | %80+ | Basarili telaffuz | Yesil |
| Yakin (close) | %50-79 | Kismen dogru, iyilestirme gerekli | Sari |
| Tekrar (retry) | %0-49 | Yeniden denenmeli | Mavi |

Her degerlendirmede sunulan bilgiler:
1. **Genel verdict:** Harika / Yakin / Tekrar
2. **Eslesme yuzdesi:** 0-100 arasi skor
3. **Hece bazli kontroller:** Her hece icin dogru/yanlis + ipucu
4. **Kocluk mesaji:** Kisisellestirilmis, tesvik edici geri bildirim

**Onemli tasarim karari:** Sistem asla "yanlis", "hatali", "basarisiz" gibi olumsuz ifadeler kullanmaz. Tum geri bildirimler pozitif ve tesvik edici tonla sunulmaktadir.

---

## 7. YAPAY ZEKA MODULLERI

### 7.1 Buyuk Dil Modeli (LLM) Kullanimi

Sistem, Google Gemini 2.5 Flash modelini uc farkli amacla kullanmaktadir:

#### 7.1.1 Strateji Olusturma
Girdi olarak kelime, dil ve seviye bilgisini alir; cikti olarak:
- Hece ayirimi
- Kisa tanim
- Kocluk ipucu (agiz pozisyonu, nefes kontrolu)
- Gorsel uretim prompt'u
- TTS metinleri

#### 7.1.2 Telaffuz Degerlendirme
Girdi olarak hedef kelime, STT transkripti ve hece bilgisini alir; cikti olarak:
- Genel verdict (great/close/retry)
- Hece bazli basari kontrolu
- Her basarisiz hece icin fiziksel rehberlik ipucu
- Genel kocluk mesaji

#### 7.1.3 Quiz Sorusu Uretimi
Girdi olarak kategori, dil ve zorluk seviyesini alir; cikti olarak:
- Hedef kelime
- 4 secenekli coktan secmeli sorular
- Gorsel ipucu
- Metin ipucu

### 7.2 Prompt Muhendisligi

Tum LLM prompt'lari merkezi olarak `lib/prompts.ts` dosyasinda yonetilmektedir. Her prompt su unsurları icerir:

**Turkce Fonetik Rehberi:**
```
ç = /tʃ/ -> "chair" deki "ch" sesi
ş = /ʃ/  -> "shoe" deki "sh" sesi
ğ = sessiz, onceki unluyu uzatir
ı = /ɯ/ -> dudaklar duz, "uh" benzeri
ö = /ø/ -> Fransizca "peu" deki ses
ü = /y/ -> Almanca "über" deki ses
```

**Guvenlik Kurallari:**
- Cocuklara ve ogrenen bireylere uygun ton
- Tibbi/klinik dil kullanilmamasi
- Terapinin yerini almadigi vurgusu
- Pozitif ve tesvik edici ifadeler

**Cikti Formati:**
- Strict JSON formati zorunlulugu
- Alan uzunluk sinirlari
- Fallback degerleri

### 7.3 Konusmadan Metne (STT)

ElevenLabs Speech-to-Text modeli kullanilmaktadir.

**Is Akisi:**
1. Kullanici sesi WebM/WAV formatinda kaydedilir
2. Ses dosyasi multipart/form-data olarak sunucuya gonderilir
3. Sunucu, dosyayi Wiro API uzerinden ElevenLabs'a iletir
4. Asenkron gorev baslatilir ve polling ile sonuc beklenir
5. Transkript elde edilir ve degerlendirme API'sine gonderilir

**Zorluklar ve Cozumler:**
- **Cocuk sesi tanima:** Cocuklarin sesleri yetiskinlerden farklidir; model bu konuda sinirli olabilir
- **Turkce karakter tanima:** ç, ş, ğ, ı, ö, ü karakterlerinin dogru tanınması icin Turkce dil parametresi gonderilmektedir
- **Gurultu:** Web Audio API ile sessizlik tespiti yapilarak gurultulu ortamlarda daha iyi sonuc alinmaktadir

### 7.4 Metinden Konusmaya (TTS)

Google Gemini 2.5 TTS modeli kullanilmaktadir.

**Ozellikler:**
- Her hece icin ayri ses dosyasi uretimi
- Tam kelime icin ayri ses dosyasi
- Yavas ve normal hiz secenekleri
- Dogal ve anlasilir Turkce/Ingilizce ses

### 7.5 Gorsel ve Video Uretimi

**Gorsel (Nano Banana Pro):**
- 1024x1024 piksel cozunurluk
- Fotorealistik stil
- Kelimeyi somutlastiran sahne

**Video (VEO 3.1 Fast):**
- 4 saniye sure
- 720p cozunurluk
- Sessiz (sesle celismemesi icin)
- Dongusel (loop) oynatim

---

## 8. VERITABANI TASARIMI

### 8.1 Varlik-Iliski Diyagrami (ER)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   profiles   │     │    words     │     │ practice_attempts │
│──────────────│     │──────────────│     │──────────────────│
│ id (PK)      │──┐  │ id (PK)      │──┐  │ id (PK)          │
│ email        │  │  │ user_id (FK) │  │  │ user_id (FK)     │
│ name         │  │  │ text         │  │  │ word_id (FK)     │
│ role         │  │  │ lang         │  │  │ transcript       │
│ stats (JSON) │  │  │ syllables    │  │  │ verdict          │
└──────────────┘  │  │ definition   │  │  │ accuracy         │
                  │  │ is_favorite  │  │  │ syllable_checks  │
                  │  │ is_hard      │  │  └──────────────────┘
                  │  │ is_learned   │  │
                  │  │ practice_cnt │  │
                  │  └──────────────┘  │
                  │                    │
                  │  ┌──────────────┐  │  ┌──────────────┐
                  │  │    lists     │  │  │  list_words  │
                  │  │──────────────│  │  │──────────────│
                  └──│ user_id (FK) │  └──│ word_id (FK) │
                     │ name         │     │ list_id (FK) │
                     │ icon         │     └──────────────┘
                     │ word_count   │
                     └──────────────┘

┌──────────────┐     ┌──────────────────┐
│    packs     │     │  hard_syllables  │
│──────────────│     │──────────────────│
│ id (PK)      │     │ id (PK)          │
│ created_by   │     │ user_id (FK)     │
│ name         │     │ syllable         │
│ category     │     │ fail_count       │
│ words (JSON) │     └──────────────────┘
│ is_active    │
└──────────────┘
```

### 8.2 Guvenlik

- **Row Level Security (RLS):** Tum tablolarda aktif; kullanicilar sadece kendi verilerini gorebilir
- **Rol tabanli erisim:** user, admin, superadmin rolleri
- **Storage politikalari:** Kullanicilar sadece kendi klasorlerine dosya yukleyebilir

### 8.3 Local-First Yaklasim

Sistem, "local-first" yaklasimini benimsemistir:
- Tum kullanici verileri oncelikle localStorage'da tutulur
- Internet baglantisi olmadan da temel islevler calisir
- Supabase yapılandirildiginda veriler sunucuyla senkronize edilir
- Demo modunda Supabase olmadan tam islevsellik saglanir

---

## 9. KULLANICI ARAYUZU TASARIMI

### 9.1 Tasarim Ilkeleri

1. **Minimalist ve Profesyonel:** Dikkat dagitmayan, temiz tasarim
2. **Erisilebilirlik:** Her yasta kullanici icin kolay kullanim
3. **Duyarli Tasarim:** Masaustu ve mobilde sorunsuz calisma
4. **Pozitif Ton:** Tesvik edici, motivasyon artirici arayuz dili
5. **Tutarli Renk Paleti:** Notr gri tonlari, vurgular icin emerald/sky

### 9.2 Sayfa Yapisi

| Sayfa | Islevsellik |
|-------|-------------|
| Landing Page | Proje tanitimi, ozellikler, nasil calisir, hedef kitle |
| Giris/Kayit | Email ve sifre ile kimlik dogrulama |
| Pratik (Dashboard) | Kelime girisi, hece gosterimi, ses calma, pratik kocu |
| Quiz | Gorsel tabanli kelime eslestirme oyunu |
| Paketler | Kategoriye gore AI kelime paketi uretimi |
| Sozluk | Kisisel kelime koleksiyonu, arama, filtreleme |
| Listeler | Ozel kelime gruplari olusturma |
| Gecmis | Aktivite ve pratik gecmisi takibi |
| Ilerleme | Haftalik grafik, seri, zor hece analizi |
| Ayarlar | Dil, hiz, seviye, tema tercihleri |
| Kelime Detay | Tekil kelime pratigi, istatistik, gecmis |

### 9.3 Responsive Tasarim

- **Masaustu:** Yan menu (sidebar) + genis icerik alani
- **Mobil:** Hamburger menu + tam ekran icerik
- **Tablet:** Daraltilabilir sidebar

### 9.4 PWA Ozellikleri

- Ana ekrana eklenebilir (Add to Home Screen)
- Tam ekran / standalone calisma modu
- Cevrimdisi destek (onbelleklenmis sayfalar)
- Kisayollar (Pratik + Quiz)

---

## 10. TEST VE DEGERLENDIRME

### 10.1 Fonksiyonel Testler

| Test Alani | Durum | Aciklama |
|------------|-------|----------|
| Kelime girisi ve strateji uretimi | Basarili | Turkce ve Ingilizce kelimeler test edildi |
| TTS ses uretimi | Basarili | Hece ve kelime sesleri dogru uretildi |
| STT ses tanima | Basarili | Turkce konusma %85+ dogrulukla tanindi |
| Telaffuz degerlendirme | Basarili | Hece bazli geri bildirim dogru calisti |
| Quiz islevselligi | Basarili | Soru uretimi ve puanlama calisiyor |
| Veri saklama | Basarili | localStorage ve Supabase uyumlu |
| PWA kurulumu | Basarili | Android ve iOS'ta test edildi |
| Cevrimdisi mod | Basarili | Onbelleklenmis sayfalar calisiyor |

### 10.2 Performans Metrikleri

| Metrik | Deger |
|--------|-------|
| Ilk yukleme suresi | ~2 saniye |
| Strateji uretim suresi | 3-5 saniye |
| TTS uretim suresi | 2-4 saniye |
| STT isleme suresi | 3-8 saniye |
| Gorsel uretim suresi | 5-15 saniye |
| Toplam pratik dongusu | 15-30 saniye |

### 10.3 Kullanilabilirlik Degerlendirmesi

Sistemin kullanilabilirligini artirmak icin alinan tasarim kararlari:

1. **Tek kelime odakli akis:** Kullanici bir seferde tek kelimeye odaklanir
2. **Gorsel geri bildirim:** Renk kodlu sonuclar anlik anlasılabilirlik saglar
3. **Sesli geri bildirim:** TTS ile dogru telaffuz her zaman dinlenebilir
4. **Basit navigasyon:** Sidebar ile tum sayfalara tek tikla erisim
5. **Dil destegi:** Turkce ve Ingilizce arayuz secenegi

---

## 11. SONUC VE ONERILER

### 11.1 Sonuc

Bu calismada, konusma bozuklugu olan bireyler icin NLP destekli bir telaffuz asistani basariyla gelistirilmistir. Sistem:

- **Yapay zeka ile kisisellestirilmis geri bildirim** saglamaktadir
- **Hece bazli detayli analiz** ile zorlanilan sesleri tespit edebilmektedir
- **Coklu duyusal ogrenme** (ses, gorsel, video, metin) ile ogrenmeyi desteklemektedir
- **Ilerleme takibi** ile bireylerin gelisimini olculebilir kilmaktadir
- **Web tabanli ve PWA** olarak her cihazda erisilebilir durumdadir
- **Turkce'ye ozel fonetik analiz** yapabilmektedir

Sistem, profesyonel konusma terapisinin yerine gecmek icin degil, tamamlayici bir destek araci olarak tasarlanmistir. Terapi seanslari arasinda yapilandirilmis pratik imkani sunarak tedavi surecinin etkinligini artirma potansiyeli tasimaktadir.

### 11.2 Gelecek Calisma Onerileri

1. **Gamifikasyon:** XP, rozet ve seviye sistemi ile motivasyonu artirma
2. **Aralikli Tekrar (Spaced Repetition):** Ogrenme verimliligi icin SM-2 algoritmasi
3. **Ses Dalgasi Karsilastirmasi:** Kullanici sesi ile referans sesin gorsel karsilastirmasi
4. **Cumle Pratigi:** Kelime seviyesinden cumle seviyesine gecis
5. **Ebeveyn/Terapist Paneli:** Ilerleme raporlarinin paylasimi
6. **Konusma Akiciligi Analizi:** Duraklama, hiz, ritim analizi
7. **Coklu Dil Destegi:** Arapca, Almanca gibi ek diller
8. **Yapay Zeka Model Iyilestirmesi:** Ozel egitilmis Turkce STT modeli
9. **Klinik Calisma:** Kontrollü deneylerle sistem etkinliginin bilimsel olarak olculmesi

### 11.3 Katkilar

Bu calisma, su alanlara katki saglamaktadir:

- **Saglik teknolojisi:** Konusma terapisini destekleyen yapay zeka uygulamasi
- **Dogal dil isleme:** Turkce'ye ozel hece ayirma ve fonetik analiz
- **Egitim teknolojisi:** Coklu duyusal, kisisellestirilmis ogrenme platformu
- **Web gelistirme:** Modern teknolojilerle PWA tabanli saglik uygulamasi

---

## 12. KAYNAKCA

1. American Speech-Language-Hearing Association (ASHA). (2023). Speech Sound Disorders. https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/

2. World Health Organization (WHO). (2023). Deafness and hearing loss. https://www.who.int/health-topics/hearing-loss

3. Levenshtein, V. I. (1966). Binary codes capable of correcting deletions, insertions, and reversals. Soviet physics doklady, 10(8), 707-710.

4. Vaswani, A., et al. (2017). Attention is all you need. Advances in neural information processing systems, 30.

5. Google DeepMind. (2024). Gemini: A Family of Highly Capable Multimodal Models. arXiv preprint.

6. Radford, A., et al. (2023). Robust speech recognition via large-scale weak supervision (Whisper). International Conference on Machine Learning.

7. Next.js Documentation. (2024). https://nextjs.org/docs

8. Supabase Documentation. (2024). https://supabase.com/docs

9. Web Speech API Specification. W3C. https://wicg.github.io/speech-api/

10. Goksel, A., & Kerslake, C. (2005). Turkish: A Comprehensive Grammar. Routledge.

11. Ergenç, İ. (1989). Türkiye Türkçesinin Görevsel Sesbilimi. Engin Yayınevi.

12. Sak, H., et al. (2011). A corpus-based concatenative speech synthesis system for Turkish. Turkish Journal of Electrical Engineering and Computer Sciences, 19(5).

13. MDN Web Docs. (2024). Web Audio API. https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

14. MDN Web Docs. (2024). MediaRecorder API. https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

15. PWA Documentation. web.dev. (2024). https://web.dev/progressive-web-apps/

---

## 13. EKLER

### Ek A: Ortam Degiskenleri

```env
# Zorunlu - Wiro AI
WIRO_BASE_URL=https://api.wiro.ai
WIRO_API_KEY=your_api_key
WIRO_API_SECRET=your_api_secret

# Opsiyonel - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Opsiyonel - Model Ayarlari
WIRO_LLM_MODEL_ID=google/gemini-2-5-flash
WIRO_TTS_MODEL_ID=google/gemini-2-5-tts
WIRO_STT_MODEL_ID=elevenlabs/speech-to-text
WIRO_IMAGE_MODEL_ID=google/nano-banana-pro
ENABLE_STT=true
```

### Ek B: Kurulum Adimlari

```bash
# 1. Projeyi klonla
git clone <repo-url>
cd learningloop-main

# 2. Bagimliliklari kur
npm install

# 3. Ortam degiskenlerini ayarla
cp .env.example .env.local
# .env.local dosyasini duzenle

# 4. Gelistirme sunucusunu baslat
npm run dev

# 5. Tarayicida ac
# http://localhost:3000
```

### Ek C: Veritabani Tablolari Ozeti

| Tablo | Satir Sayisi (tahmini) | Aciklama |
|-------|----------------------|----------|
| profiles | Kullanici sayisi kadar | Kullanici profilleri |
| words | ~50-200 / kullanici | Kelime sozlugu |
| practice_attempts | ~10-50 / kelime | Pratik denemeleri |
| lists | ~3-10 / kullanici | Kelime listeleri |
| list_words | Degisken | Liste-kelime iliskisi |
| packs | ~20-50 (admin) | Hazir kelime paketleri |
| hard_syllables | Degisken | Zor hece takibi |
| site_settings | ~10 | Sistem ayarlari |
| activity_log | Surekli buyuyen | Aktivite kayitlari |

### Ek D: API Endpoint Ozeti

| Endpoint | Metod | Aciklama | Ortalama Sure |
|----------|-------|----------|---------------|
| /api/generate/strategy | POST | Kelime stratejisi | 3-5 sn |
| /api/generate/audio | POST | TTS ses uretimi | 2-4 sn |
| /api/generate/visual | POST | Gorsel uretimi | 5-15 sn |
| /api/generate/video | POST | Video uretimi | 30-120 sn |
| /api/generate/quiz | POST | Quiz sorusu | 5-10 sn |
| /api/generate/packs | POST | Kelime paketi | 10-20 sn |
| /api/practice/evaluate | POST | Telaffuz degerlendirme | 3-5 sn |
| /api/stt | POST | Ses tanima | 3-8 sn |
| /api/auth/login | POST | Giris | <1 sn |
| /api/auth/register | POST | Kayit | <1 sn |

---

*Bu dokuman, LearningLoop projesinin akademik ve teknik referansi olarak hazirlanmistir.*
*Tarih: 2026-03-28*
*Surum: 1.0.0*
