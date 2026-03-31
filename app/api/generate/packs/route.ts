import { NextRequest, NextResponse } from "next/server";
import { wiroRunMultipart } from "@/lib/wiro";
import { buildPacksPrompt, type Lang } from "@/lib/prompts";

// Fallback packs for each category
const FALLBACK_PACKS: Record<string, { tr: Record<string, unknown>; en: Record<string, unknown> }> = {
  food: {
    tr: {
      packName: "Lezzetli Yiyecekler",
      packDescription: "Mutfaktan sofrana, en sevdiğin yiyeceklerle pratik yap!",
      words: [
        { word: "elma", definition: "Kırmızı veya yeşil yuvarlak meyve", syllables: ["el", "ma"], level: "beginner" },
        { word: "ekmek", definition: "Undan yapılan temel gıda", syllables: ["ek", "mek"], level: "beginner" },
        { word: "süt", definition: "Beyaz, besleyici içecek", syllables: ["süt"], level: "beginner" },
        { word: "peynir", definition: "Sütten yapılan lezzetli yiyecek", syllables: ["pey", "nir"], level: "beginner" },
        { word: "domates", definition: "Salatada kullanılan kırmızı sebze", syllables: ["do", "ma", "tes"], level: "beginner" },
      ],
    },
    en: {
      packName: "Yummy Foods",
      packDescription: "Practice your favorite foods from kitchen to table!",
      words: [
        { word: "apple", definition: "A round red or green fruit", syllables: ["ap", "ple"], level: "beginner" },
        { word: "bread", definition: "Basic food made from flour", syllables: ["bread"], level: "beginner" },
        { word: "milk", definition: "A white, nutritious drink", syllables: ["milk"], level: "beginner" },
        { word: "cheese", definition: "Tasty food made from milk", syllables: ["cheese"], level: "beginner" },
        { word: "tomato", definition: "A red vegetable for salads", syllables: ["to", "ma", "to"], level: "beginner" },
      ],
    },
  },
  animals: {
    tr: {
      packName: "Sevimli Hayvanlar",
      packDescription: "Çiftlikten ormana, hayvan arkadaşlarınla tanış!",
      words: [
        { word: "kedi", definition: "Miyavlayan tüylü evcil hayvan", syllables: ["ke", "di"], level: "beginner" },
        { word: "köpek", definition: "Havlayan sadık evcil dost", syllables: ["kö", "pek"], level: "beginner" },
        { word: "kuş", definition: "Gökyüzünde uçan kanatlı hayvan", syllables: ["kuş"], level: "beginner" },
        { word: "balık", definition: "Suda yüzen hayvan", syllables: ["ba", "lık"], level: "beginner" },
        { word: "tavşan", definition: "Uzun kulaklı, zıplayan hayvan", syllables: ["tav", "şan"], level: "beginner" },
      ],
    },
    en: {
      packName: "Cute Animals",
      packDescription: "Meet your animal friends from farm to forest!",
      words: [
        { word: "cat", definition: "A furry pet that meows", syllables: ["cat"], level: "beginner" },
        { word: "dog", definition: "A loyal pet that barks", syllables: ["dog"], level: "beginner" },
        { word: "bird", definition: "A winged animal that flies", syllables: ["bird"], level: "beginner" },
        { word: "fish", definition: "An animal that swims in water", syllables: ["fish"], level: "beginner" },
        { word: "rabbit", definition: "A hopping animal with long ears", syllables: ["rab", "bit"], level: "beginner" },
      ],
    },
  },
  nature: {
    tr: {
      packName: "Doğa Harikaları",
      packDescription: "Güneşten yağmura, doğanın güzelliklerini keşfet!",
      words: [
        { word: "ağaç", definition: "Dalları ve yaprakları olan bitki", syllables: ["a", "ğaç"], level: "beginner" },
        { word: "çiçek", definition: "Renkli ve güzel kokan bitki", syllables: ["çi", "çek"], level: "beginner" },
        { word: "güneş", definition: "Gökyüzündeki sıcak ışık kaynağı", syllables: ["gü", "neş"], level: "beginner" },
        { word: "yağmur", definition: "Bulutlardan düşen su damlaları", syllables: ["yağ", "mur"], level: "beginner" },
        { word: "deniz", definition: "Uçsuz bucaksız mavi su", syllables: ["de", "niz"], level: "beginner" },
      ],
    },
    en: {
      packName: "Nature Wonders",
      packDescription: "From sunshine to rain, discover the beauty of nature!",
      words: [
        { word: "tree", definition: "A tall plant with branches and leaves", syllables: ["tree"], level: "beginner" },
        { word: "flower", definition: "A colorful, sweet-smelling plant", syllables: ["flow", "er"], level: "beginner" },
        { word: "sun", definition: "The warm light source in the sky", syllables: ["sun"], level: "beginner" },
        { word: "rain", definition: "Water drops falling from clouds", syllables: ["rain"], level: "beginner" },
        { word: "ocean", definition: "A vast body of blue water", syllables: ["o", "cean"], level: "beginner" },
      ],
    },
  },
  home: {
    tr: {
      packName: "Evdeki Eşyalar",
      packDescription: "Oturma odasından mutfağa, evindeki eşyaları öğren!",
      words: [
        { word: "masa", definition: "Üzerine eşya konan mobilya", syllables: ["ma", "sa"], level: "beginner" },
        { word: "sandalye", definition: "Üzerine oturduğun mobilya", syllables: ["san", "dal", "ye"], level: "beginner" },
        { word: "yatak", definition: "Üzerinde uyuduğun mobilya", syllables: ["ya", "tak"], level: "beginner" },
        { word: "dolap", definition: "Kıyafetleri sakladığın mobilya", syllables: ["do", "lap"], level: "beginner" },
        { word: "pencere", definition: "Dışarıyı gördüğün camlı açıklık", syllables: ["pen", "ce", "re"], level: "beginner" },
      ],
    },
    en: {
      packName: "Home Sweet Home",
      packDescription: "From living room to kitchen, learn things in your home!",
      words: [
        { word: "table", definition: "Furniture to put things on", syllables: ["ta", "ble"], level: "beginner" },
        { word: "chair", definition: "Furniture to sit on", syllables: ["chair"], level: "beginner" },
        { word: "bed", definition: "Furniture to sleep on", syllables: ["bed"], level: "beginner" },
        { word: "closet", definition: "Furniture to store clothes", syllables: ["clos", "et"], level: "beginner" },
        { word: "window", definition: "Glass opening to see outside", syllables: ["win", "dow"], level: "beginner" },
      ],
    },
  },
};

const DEFAULT_PACK = {
  tr: {
    packName: "Temel Kelimeler",
    packDescription: "Her gün kullandığın en önemli kelimeleri öğren!",
    words: [
      { word: "ev", definition: "Ailenle yaşadığın yer", syllables: ["ev"], level: "beginner" },
      { word: "araba", definition: "Tekerlekli ulaşım aracı", syllables: ["a", "ra", "ba"], level: "beginner" },
      { word: "kitap", definition: "İçinde hikayeler olan okuma aracı", syllables: ["ki", "tap"], level: "beginner" },
      { word: "kalem", definition: "Yazı yazmak için araç", syllables: ["ka", "lem"], level: "beginner" },
      { word: "telefon", definition: "Konuşmak için iletişim cihazı", syllables: ["te", "le", "fon"], level: "beginner" },
    ],
  },
  en: {
    packName: "Essential Words",
    packDescription: "Learn the most important words you use every day!",
    words: [
      { word: "house", definition: "The place where you live with family", syllables: ["house"], level: "beginner" },
      { word: "car", definition: "A vehicle with wheels for travel", syllables: ["car"], level: "beginner" },
      { word: "book", definition: "Something with stories you read", syllables: ["book"], level: "beginner" },
      { word: "pencil", definition: "A tool for writing", syllables: ["pen", "cil"], level: "beginner" },
      { word: "phone", definition: "A device for talking to people", syllables: ["phone"], level: "beginner" },
    ],
  },
};

export async function POST(request: NextRequest) {
  let category = "general";
  let lang: Lang = "tr";

  try {
    const body = await request.json();
    category = String(body.category || "general").replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50);
    lang = body.lang && ["tr", "en"].includes(body.lang) ? body.lang : "tr";
    const count = Math.min(Math.max(Number(body.count) || 10, 3), 20);

    const prompt = buildPacksPrompt(category, count, lang);

    const data = await wiroRunMultipart("google/gemini-2-5-flash", { prompt });

    const content = (data?.text as string) ||
      (data?.raw as string) ||
      (data?.output as string) ||
      ((data?.task as Record<string, unknown>)?.debugoutput as string) ||
      "";

    if (!content) throw new Error("No content from LLM");

    // Safe JSON extraction
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = codeBlockMatch ? codeBlockMatch[1] : content;

    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new Error("No JSON found");

    const packData = JSON.parse(jsonStr.slice(start, end + 1));

    if (!packData.words || packData.words.length === 0) throw new Error("Empty words array");

    return NextResponse.json({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? `pack-${crypto.randomUUID()}` : `pack-${Date.now()}`,
      category,
      ...packData,
    });

  } catch (error) {
    console.error("[Packs API] Error:", error);

    const pack = FALLBACK_PACKS[category]?.[lang] || DEFAULT_PACK[lang];

    return NextResponse.json({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? `pack-${crypto.randomUUID()}` : `pack-${Date.now()}`,
      category,
      isFallback: true,
      ...pack,
    });
  }
}
