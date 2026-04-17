"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Star,
  AlertTriangle,
  Play,
  ExternalLink,
  X,
  BookOpen,
  Loader2
} from "lucide-react";
import { Word } from "@/lib/data-types";
import { getWords, addWord, updateWord, seedDefaultData } from "@/lib/data-store";
import { cn } from "@/lib/utils";

export default function DictionaryPage() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites" | "hard" | "learned">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWord, setNewWord] = useState({ text: "", lang: "tr" as "tr" | "en", level: "beginner" as "beginner" | "intermediate" });
  const [isAddingWord, setIsAddingWord] = useState(false);

  useEffect(() => {
    seedDefaultData();
    setWords(getWords());
  }, []);

  const filteredWords = words.filter((word) => {
    const matchesSearch = word.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.definition?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case "favorites": return word.isFavorite;
      case "hard": return word.isHard;
      case "learned": return word.isLearned;
      default: return true;
    }
  });

  const handleAddWord = async () => {
    if (!newWord.text.trim() || isAddingWord) return;

    setIsAddingWord(true);

    try {
      // Call Wiro API to get syllables, definition, and coach tip
      const response = await fetch("/api/generate/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: newWord.text.trim(),
          level: newWord.level,
          lang: newWord.lang
        }),
      });

      let syllables: string[] = [newWord.text.trim()];
      let definition = "";
      let coachTip = "";

      if (response.ok) {
        const strategy = await response.json();
        syllables = strategy.syllables || syllables;
        definition = strategy.definition || "";
        coachTip = strategy.coachingTip || "";
      }

      // Add word with generated data
      addWord({
        text: newWord.text.trim(),
        lang: newWord.lang,
        level: newWord.level,
        syllables,
        definition,
      });

      setWords(getWords());
      setNewWord({ text: "", lang: "tr", level: "beginner" });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding word:", error);
      // Fallback: add word without API data
      const syllables = newWord.text.split(/[-·]/).map(s => s.trim()).filter(Boolean);
      addWord({
        text: newWord.text.trim(),
        lang: newWord.lang,
        level: newWord.level,
        syllables: syllables.length > 0 ? syllables : [newWord.text.trim()],
      });
      setWords(getWords());
      setNewWord({ text: "", lang: "tr", level: "beginner" });
      setIsAddModalOpen(false);
    } finally {
      setIsAddingWord(false);
    }
  };

  const toggleFavorite = (id: string) => {
    const word = words.find(w => w.id === id);
    if (word) {
      updateWord(id, { isFavorite: !word.isFavorite });
      setWords(getWords());
    }
  };

  const toggleHard = (id: string) => {
    const word = words.find(w => w.id === id);
    if (word) {
      updateWord(id, { isHard: !word.isHard });
      setWords(getWords());
    }
  };

  const openWord = (id: string) => {
    router.push(`/dashboard/word/${id}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sözlüğüm</h1>
          <p className="text-gray-500">Öğrendiğin tüm kelimeler burada</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
        >
          <Plus className="w-4 h-4" />
          Kelime Ekle
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kelime ara..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
          />
        </div>
        <div className="flex gap-2">
          {([
            { key: "all", label: "Tümü" },
            { key: "favorites", label: "Favoriler" },
            { key: "hard", label: "Zor" },
            { key: "learned", label: "Öğrendim" },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
                filter === f.key
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Words List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-bold text-gray-700">Henüz kelime yok</p>
            <p className="text-sm text-gray-400 mt-1">İlk kelimeni ekleyerek başla</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openWord(word.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-base font-bold text-gray-700">
                      {word.text.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{word.text}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium uppercase">
                        {word.lang}
                      </span>
                      {word.isLearned && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
                          Öğrendim
                        </span>
                      )}
                    </div>
                    {word.definition && (
                      <p className="text-sm text-gray-500">{word.definition}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleFavorite(word.id)}
                    className={cn(
                      "p-2.5 rounded-lg transition-all",
                      word.isFavorite
                        ? "text-gray-900 bg-gray-200"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Star className="w-5 h-5" fill={word.isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => toggleHard(word.id)}
                    className={cn(
                      "p-2.5 rounded-lg transition-all",
                      word.isHard
                        ? "text-gray-900 bg-gray-200"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard?word=${encodeURIComponent(word.text)}`)}
                    className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openWord(word.id)}
                    className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-gray-900">{words.length}</p>
          <p className="text-sm text-gray-500 font-medium">Toplam</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-gray-900">{words.filter(w => w.isFavorite).length}</p>
          <p className="text-sm text-gray-500 font-medium">Favoriler</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-gray-900">{words.filter(w => w.isHard).length}</p>
          <p className="text-sm text-gray-500 font-medium">Zor</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-gray-900">{words.filter(w => w.isLearned).length}</p>
          <p className="text-sm text-gray-500 font-medium">Öğrendim</p>
        </div>
      </div>

      {/* Add Word Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Yeni Kelime Ekle</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Kelime</label>
                <input
                  type="text"
                  value={newWord.text}
                  onChange={(e) => setNewWord({ ...newWord, text: e.target.value })}
                  placeholder="örn: araba, kitap, güneş"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Heceler ve tanım otomatik oluşturulacak</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Dil</label>
                  <select
                    value={newWord.lang}
                    onChange={(e) => setNewWord({ ...newWord, lang: e.target.value as "tr" | "en" })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">İngilizce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Seviye</label>
                  <select
                    value={newWord.level}
                    onChange={(e) => setNewWord({ ...newWord, level: e.target.value as "beginner" | "intermediate" })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <option value="beginner">Kolay</option>
                    <option value="intermediate">Orta</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddWord}
                disabled={!newWord.text.trim() || isAddingWord}
                className="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingWord ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Ekleniyor...
                  </>
                ) : (
                  "Kelime Ekle"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
