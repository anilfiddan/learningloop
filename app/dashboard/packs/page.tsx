"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Loader2,
  Plus,
  ChevronRight,
  Utensils,
  PawPrint,
  Trees,
  Home,
  Heart,
  Briefcase,
  Plane,
  Music,
  Palette,
  BookOpen,
  Sparkles,
  X
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { addWord } from "@/lib/data-store";
import { cn } from "@/lib/utils";

interface WordPack {
  id: string;
  category: string;
  packName: string;
  packDescription: string;
  words: {
    word: string;
    definition: string;
    syllables: string[];
    level: string;
  }[];
}

const PACK_CATEGORIES = [
  { id: "food", icon: Utensils, emoji: "🍎", labelTr: "Yiyecekler", labelEn: "Food", descTr: "Meyve, sebze, yemekler", descEn: "Fruits, vegetables, dishes", color: "from-rose-400 to-red-500", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
  { id: "animals", icon: PawPrint, emoji: "🐱", labelTr: "Hayvanlar", labelEn: "Animals", descTr: "Evcil ve vahşi hayvanlar", descEn: "Pets and wild animals", color: "from-amber-400 to-orange-500", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { id: "nature", icon: Trees, emoji: "🌳", labelTr: "Doğa", labelEn: "Nature", descTr: "Bitkiler, hava durumu", descEn: "Plants, weather", color: "from-emerald-400 to-green-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  { id: "home", icon: Home, emoji: "🏠", labelTr: "Ev Eşyaları", labelEn: "Home Items", descTr: "Mobilya, ev aletleri", descEn: "Furniture, appliances", color: "from-sky-400 to-blue-500", bgColor: "bg-sky-50", borderColor: "border-sky-200" },
  { id: "body", icon: Heart, emoji: "❤️", labelTr: "Vücut", labelEn: "Body Parts", descTr: "Organlar, uzuvlar", descEn: "Organs, limbs", color: "from-pink-400 to-rose-500", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
  { id: "work", icon: Briefcase, emoji: "💼", labelTr: "İş & Ofis", labelEn: "Work & Office", descTr: "Ofis malzemeleri, meslekler", descEn: "Office supplies, professions", color: "from-slate-400 to-gray-500", bgColor: "bg-slate-50", borderColor: "border-slate-200" },
  { id: "travel", icon: Plane, emoji: "✈️", labelTr: "Seyahat", labelEn: "Travel", descTr: "Ulaşım, yerler", descEn: "Transportation, places", color: "from-cyan-400 to-teal-500", bgColor: "bg-cyan-50", borderColor: "border-cyan-200" },
  { id: "music", icon: Music, emoji: "🎵", labelTr: "Müzik & Sanat", labelEn: "Music & Art", descTr: "Enstrümanlar, sanat terimleri", descEn: "Instruments, art terms", color: "from-violet-400 to-purple-500", bgColor: "bg-violet-50", borderColor: "border-violet-200" },
  { id: "colors", icon: Palette, emoji: "🎨", labelTr: "Renkler & Şekiller", labelEn: "Colors & Shapes", descTr: "Renkler, geometrik şekiller", descEn: "Colors, geometric shapes", color: "from-fuchsia-400 to-pink-500", bgColor: "bg-fuchsia-50", borderColor: "border-fuchsia-200" },
  { id: "education", icon: BookOpen, emoji: "📚", labelTr: "Eğitim", labelEn: "Education", descTr: "Okul, dersler", descEn: "School, subjects", color: "from-indigo-400 to-blue-500", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
];

export default function PacksPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [generatedPack, setGeneratedPack] = useState<WordPack | null>(null);
  const [addingWords, setAddingWords] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(0);

  const tips = lang === "tr" ? [
    "AI kelime paketi oluşturuyor...",
    "Tanımlar hazırlanıyor...",
    "Heceler ayrıştırılıyor...",
    "Zorluk seviyeleri belirleniyor...",
    "Neredeyse hazır...",
  ] : [
    "AI is creating word pack...",
    "Preparing definitions...",
    "Splitting syllables...",
    "Determining difficulty levels...",
    "Almost ready...",
  ];

  const generatePack = async (category: string) => {
    setLoadingCategory(category);
    setGeneratedPack(null);
    setError(null);
    setLoadingTip(0);

    // Rotate tips
    const tipInterval = setInterval(() => {
      setLoadingTip(prev => (prev + 1) % tips.length);
    }, 2000);

    try {
      const response = await fetch("/api/generate/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          lang,
          count: 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate pack");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.words || data.words.length === 0) {
        throw new Error(lang === "tr" ? "Kelime paketi boş döndü" : "Word pack returned empty");
      }

      setGeneratedPack(data);
    } catch (err) {
      console.error("Pack generation error:", err);
      setError(err instanceof Error ? err.message : (lang === "tr" ? "Bir hata oluştu" : "An error occurred"));
    } finally {
      clearInterval(tipInterval);
      setLoadingCategory(null);
    }
  };

  const addAllWords = async () => {
    if (!generatedPack) return;

    setAddingWords(true);
    setAddedCount(0);

    for (const word of generatedPack.words) {
      addWord({
        text: word.word,
        lang: lang,
        level: word.level === "beginner" ? "beginner" : "intermediate",
        syllables: word.syllables,
        definition: word.definition,
      });
      setAddedCount(prev => prev + 1);
      await new Promise(r => setTimeout(r, 100)); // Small delay for visual feedback
    }

    setAddingWords(false);

    // Redirect to dictionary after adding
    setTimeout(() => {
      router.push("/dashboard/dictionary");
    }, 1000);
  };

  const t = {
    tr: {
      title: "Kelime Paketleri",
      subtitle: "Kategorilere göre kelime paketleri oluştur",
      generate: "Paket Oluştur",
      generating: "Oluşturuluyor...",
      words: "kelime",
      addAll: "Tümünü Sözlüğe Ekle",
      adding: "Ekleniyor",
      added: "Eklendi",
      back: "Geri",
      beginner: "Kolay",
      intermediate: "Orta",
      selectCategory: "Bir kategori seç ve AI ile kelime paketi oluştur",
    },
    en: {
      title: "Word Packs",
      subtitle: "Generate word packs by category",
      generate: "Generate Pack",
      generating: "Generating...",
      words: "words",
      addAll: "Add All to Dictionary",
      adding: "Adding",
      added: "Added",
      back: "Back",
      beginner: "Easy",
      intermediate: "Medium",
      selectCategory: "Pick a category and create a word pack with AI",
    },
  };

  const text = t[lang];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{text.title}</h1>
        <p className="text-gray-500">{text.subtitle}</p>
      </div>

      {/* Generated Pack View */}
      {generatedPack ? (
        <div className="space-y-6">
          {/* Pack Header */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{generatedPack.packName}</h2>
                <p className="text-gray-500">{generatedPack.packDescription}</p>
                <p className="text-sm text-gray-400 mt-2">{generatedPack.words.length} {text.words}</p>
              </div>
              <button
                onClick={() => setGeneratedPack(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {text.back}
              </button>
            </div>
          </div>

          {/* Words List */}
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {generatedPack.words.map((word, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-700">
                      {word.word.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{word.word}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        word.level === "beginner"
                          ? "bg-green-100 text-green-600"
                          : "bg-amber-100 text-amber-600"
                      )}>
                        {word.level === "beginner" ? text.beginner : text.intermediate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{word.definition}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {word.syllables.join(" · ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add All Button */}
          <button
            onClick={addAllWords}
            disabled={addingWords}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {addingWords ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {text.adding}... ({addedCount}/{generatedPack.words.length})
              </>
            ) : addedCount === generatedPack.words.length ? (
              <>
                <Sparkles className="w-5 h-5" />
                {text.added}!
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                {text.addAll}
              </>
            )}
          </button>
        </div>
      ) : loadingCategory ? (
        /* Loading State */
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {tips[loadingTip]}
            </p>
            <p className="text-gray-500 text-sm">
              {lang === "tr" ? "Biraz bekleyin, paket hazırlanıyor" : "Please wait, preparing your pack"}
            </p>
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-red-50 rounded-xl border border-red-100 p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-xl bg-red-100 flex items-center justify-center mb-6">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {lang === "tr" ? "Bir şeyler ters gitti" : "Something went wrong"}
            </p>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              {lang === "tr" ? "Tekrar Dene" : "Try Again"}
            </button>
          </div>
        </div>
      ) : (
        /* Category Selection */
        <div className="space-y-6">
          <p className="text-center text-gray-500">{text.selectCategory}</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {PACK_CATEGORIES.map((cat) => {
              const isLoading = loadingCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => generatePack(cat.id)}
                  disabled={!!loadingCategory}
                  className={cn(
                    "flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all text-left",
                    isLoading && "opacity-50"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                      <span className="text-lg">{cat.emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">
                      {lang === "tr" ? cat.labelTr : cat.labelEn}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {lang === "tr" ? cat.descTr : cat.descEn}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
