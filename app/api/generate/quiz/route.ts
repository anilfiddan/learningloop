import { NextRequest, NextResponse } from "next/server";
import { wiroRunMultipart } from "@/lib/wiro";
import { buildQuizPrompt, buildQuizImagePrompt, type Lang } from "@/lib/prompts";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fallback word pools (used if LLM fails)
const FALLBACK_POOLS: Record<string, { tr: Array<{ word: string; hint: string; options: string[]; imagePrompt: string }>; en: Array<{ word: string; hint: string; options: string[]; imagePrompt: string }> }> = {
  food: {
    tr: [
      { word: "elma", hint: "Kırmızı ya da yeşil olabilen yuvarlak bir meyve", options: ["elma", "armut", "portakal", "muz"], imagePrompt: "a shiny red apple on a white background" },
      { word: "muz", hint: "Sarı renkli, kabuğunu soyarak yediğin meyve", options: ["muz", "elma", "üzüm", "kivi"], imagePrompt: "a ripe yellow banana" },
      { word: "ekmek", hint: "Neredeyse her yemekte sofrada bulunan temel gıda", options: ["ekmek", "peynir", "süt", "yumurta"], imagePrompt: "a fresh loaf of bread" },
    ],
    en: [
      { word: "apple", hint: "A round fruit that can be red, green, or yellow", options: ["apple", "pear", "orange", "banana"], imagePrompt: "a shiny red apple" },
      { word: "banana", hint: "A yellow fruit you need to peel before eating", options: ["banana", "apple", "grape", "kiwi"], imagePrompt: "a ripe yellow banana" },
      { word: "bread", hint: "A basic food found on almost every dinner table", options: ["bread", "cheese", "milk", "egg"], imagePrompt: "a fresh loaf of bread" },
    ],
  },
  animals: {
    tr: [
      { word: "kedi", hint: "Miyavlayan, tüylü, evde beslenen hayvan", options: ["kedi", "köpek", "tavşan", "kuş"], imagePrompt: "a cute orange tabby cat sitting" },
      { word: "köpek", hint: "Havlayan, kuyruğunu sallayan sadık dost", options: ["köpek", "kedi", "tavşan", "kuş"], imagePrompt: "a happy golden retriever puppy" },
      { word: "kuş", hint: "Kanatları olan ve gökyüzünde uçan hayvan", options: ["kuş", "balık", "kedi", "arı"], imagePrompt: "a small colorful songbird on a branch" },
    ],
    en: [
      { word: "cat", hint: "A furry pet that meows and purrs", options: ["cat", "dog", "rabbit", "bird"], imagePrompt: "a cute orange tabby cat" },
      { word: "dog", hint: "A loyal pet that barks and wags its tail", options: ["dog", "cat", "rabbit", "bird"], imagePrompt: "a happy golden retriever puppy" },
      { word: "bird", hint: "An animal with wings that flies in the sky", options: ["bird", "fish", "cat", "bee"], imagePrompt: "a small colorful songbird" },
    ],
  },
  nature: {
    tr: [
      { word: "ağaç", hint: "Dalları, yaprakları olan ve parkta gölge yapan bitki", options: ["ağaç", "çiçek", "güneş", "bulut"], imagePrompt: "a big green oak tree" },
      { word: "güneş", hint: "Gökyüzündeki sarı, sıcak ve parlak yıldız", options: ["güneş", "ay", "yıldız", "bulut"], imagePrompt: "a bright warm sun with rays" },
    ],
    en: [
      { word: "tree", hint: "A tall plant with branches and leaves that gives shade", options: ["tree", "flower", "sun", "cloud"], imagePrompt: "a big green oak tree" },
      { word: "sun", hint: "The bright, warm yellow star in the sky", options: ["sun", "moon", "star", "cloud"], imagePrompt: "a bright warm sun with rays" },
    ],
  },
  home: {
    tr: [
      { word: "masa", hint: "Üzerinde yemek yediğin veya ödev yaptığın mobilya", options: ["masa", "sandalye", "yatak", "kapı"], imagePrompt: "a wooden dining table" },
      { word: "sandalye", hint: "Üzerine oturduğun, dört ayaklı mobilya", options: ["sandalye", "masa", "yatak", "kapı"], imagePrompt: "a wooden chair" },
    ],
    en: [
      { word: "table", hint: "Furniture where you eat meals or do homework", options: ["table", "chair", "bed", "door"], imagePrompt: "a wooden dining table" },
      { word: "chair", hint: "A piece of furniture with four legs that you sit on", options: ["chair", "table", "bed", "door"], imagePrompt: "a wooden chair" },
    ],
  },
  general: {
    tr: [
      { word: "ev", hint: "Ailenle birlikte yaşadığın, kapısı olan yer", options: ["ev", "araba", "kitap", "top"], imagePrompt: "a cozy little house with a red roof" },
      { word: "kitap", hint: "İçinde hikayeler olan, sayfaları çevirerek okuduğun şey", options: ["kitap", "ev", "araba", "top"], imagePrompt: "a colorful children's book" },
    ],
    en: [
      { word: "house", hint: "The place with a door and roof where you live with family", options: ["house", "car", "book", "ball"], imagePrompt: "a cozy little house with a red roof" },
      { word: "book", hint: "Something with pages and stories that you read", options: ["book", "house", "car", "ball"], imagePrompt: "a colorful children's book" },
    ],
  },
};

export async function POST(request: NextRequest) {
  const { category = "general", lang = "tr" } = await request.json();
  const cat = String(category).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || "general";
  const validLang: Lang = ["tr", "en"].includes(lang) ? lang : "tr";

  let quizData: { word: string; hint: string; options: string[]; imagePrompt: string } | null = null;

  // Try to generate quiz with LLM
  try {
    const llmPrompt = buildQuizPrompt(cat, validLang);
    const llmResult = await wiroRunMultipart("google/gemini-2-5-flash", { prompt: llmPrompt });
    const content = (llmResult.text as string) || (llmResult.raw as string) || (llmResult.output as string) || "";

    if (content) {
      // Safe JSON extraction using indexOf
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start !== -1 && end > start) {
        quizData = JSON.parse(content.slice(start, end + 1));
      }
    }
  } catch (llmError) {
    console.error("[Quiz API] LLM error:", llmError);
  }

  // Fallback if LLM failed
  if (!quizData) {
    const pool = FALLBACK_POOLS[cat]?.[validLang] || FALLBACK_POOLS.general[validLang];
    quizData = pool[Math.floor(Math.random() * pool.length)];
  }

  // Shuffle options
  const shuffledOptions = shuffleArray(quizData.options);

  // Generate image
  let imageUrl = null;
  try {
    const prompt = buildQuizImagePrompt(quizData.word, validLang, quizData.imagePrompt);

    const data = await wiroRunMultipart("google/nano-banana-pro", {
      prompt,
      resolution: "1K",
    }) as Record<string, unknown>;

    imageUrl =
      (data?.url as string) ||
      ((data?.outputs as Array<Record<string, unknown>>)?.[0]?.url as string) ||
      ((data?.output as Record<string, unknown>)?.url as string) ||
      ((data?.task as Record<string, unknown>)?.outputs as Array<Record<string, unknown>>)?.[0]?.url as string ||
      null;

  } catch (imgError) {
    console.error("[Quiz API] Image error:", imgError);
  }

  return NextResponse.json({
    word: quizData.word,
    options: shuffledOptions,
    hint: quizData.hint,
    imageUrl,
    category: cat,
  });
}
