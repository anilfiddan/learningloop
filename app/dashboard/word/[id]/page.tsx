"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Volume2,
  Star,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
  RefreshCw,
  Loader2,
  History
} from "lucide-react";
import { Word } from "@/lib/data-types";
import { getWord, updateWord, markWordLearned, markWordPracticed } from "@/lib/data-store";
import { WordItem, PracticeAttempt } from "@/lib/types/word";
import { getAttemptsByWord } from "@/lib/stores/word-store";
import { PracticeCoachCard } from "@/components/practice/practice-coach-card";
import { cn } from "@/lib/utils";

export default function WordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const wordId = params.id as string;

  const [word, setWord] = useState<Word | null>(null);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    loadWord();
  }, [wordId]);

  const loadWord = () => {
    const wordData = getWord(wordId);
    setWord(wordData);
    setAttempts(getAttemptsByWord(wordId));
  };

  // Convert Word to WordItem for PracticeCoachCard
  const wordItem: WordItem | null = word ? {
    id: word.id,
    word: word.text,
    lang: word.lang,
    syllables: word.syllables,
    shortDefinition: word.definition || "",
    coachTip: "",
    imageUrl: word.media?.imageUrl,
    level: word.level,
    createdAt: word.createdAt,
    updatedAt: word.lastPracticedAt || word.createdAt,
  } : null;

  const toggleFavorite = () => {
    if (!word) return;
    updateWord(word.id, { isFavorite: !word.isFavorite });
    loadWord();
  };

  const toggleHard = () => {
    if (!word) return;
    updateWord(word.id, { isHard: !word.isHard });
    loadWord();
  };

  const toggleLearned = () => {
    if (!word) return;
    markWordLearned(word.id, !word.isLearned);
    loadWord();
  };

  const handlePractice = () => {
    if (!word) return;
    markWordPracticed(word.id);
    router.push(`/dashboard?word=${encodeURIComponent(word.text)}`);
  };

  const generateMedia = async () => {
    if (!word) return;
    setIsGeneratingMedia(true);

    try {
      // Generate strategy for syllables
      const strategyRes = await fetch("/api/generate/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.text, level: word.level }),
      });
      const strategy = await strategyRes.json();

      // Generate visual only (no video)
      const visualRes = await fetch("/api/generate/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.text, definition: word.definition || strategy.definition }),
      });
      const visual = await visualRes.json();

      // Update word with media
      updateWord(word.id, {
        syllables: strategy.syllables || word.syllables,
        definition: strategy.definition || word.definition,
        media: {
          imageUrl: visual.imageUrl,
        },
      });

      loadWord();
    } catch (error) {
      console.error("Failed to generate media:", error);
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  const playSyllable = (syllable: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(syllable);
      utterance.lang = word?.lang === "tr" ? "tr-TR" : "en-US";
      utterance.rate = 0.7;
      setPlayingAudio(syllable);
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playWord = () => {
    if (!word) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.text);
      utterance.lang = word.lang === "tr" ? "tr-TR" : "en-US";
      utterance.rate = 0.8;
      setPlayingAudio("word");
      utterance.onend = () => setPlayingAudio(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!word) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Kelime bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{word.text}</h1>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium uppercase">
              {word.lang === "tr" ? "TR" : "EN"}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium">
              {word.level === "beginner" ? "Başlangıç" : "Orta"}
            </span>
          </div>
          {word.definition && (
            <p className="text-gray-600 mt-1">{word.definition}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handlePractice}
          className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          <Play className="w-4 h-4" />
          Pratik Yap
        </button>
        <button
          onClick={toggleFavorite}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors",
            word.isFavorite
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
          )}
        >
          <Star className="w-4 h-4" fill={word.isFavorite ? "currentColor" : "none"} />
          Favori
        </button>
        <button
          onClick={toggleHard}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors",
            word.isHard
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-700"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          {word.isHard ? "Zor" : "Zor İşaretle"}
        </button>
        <button
          onClick={toggleLearned}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors",
            word.isLearned
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
          )}
        >
          <CheckCircle className="w-4 h-4" />
          {word.isLearned ? "Öğrendim" : "Öğrendim İşaretle"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Syllables Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Heceler
            </h3>
            <button
              onClick={playWord}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                playingAudio === "word"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              Kelimeyi Çal
            </button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center py-4">
            {word.syllables.map((syllable, index) => (
              <button
                key={`${syllable}-${index}`}
                onClick={() => playSyllable(syllable)}
                className={cn(
                  "px-6 py-3 text-xl font-bold rounded-lg transition-colors",
                  playingAudio === syllable
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100"
                )}
              >
                {syllable}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Hecelere tiklayarak telaffuzu dinle
          </p>
        </div>

        {/* Visual Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Görsel
            </h3>
            <button
              onClick={generateMedia}
              disabled={isGeneratingMedia}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isGeneratingMedia ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Oluştur
            </button>
          </div>

          {word.media?.imageUrl ? (
            <img
              src={word.media.imageUrl}
              alt={word.text}
              className="w-full h-48 object-cover rounded-lg border border-gray-100"
            />
          ) : (
            <div className="w-full h-48 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Görsel oluşturmak için tıkla</p>
            </div>
          )}
        </div>

        {/* Practice Coach Card */}
        {wordItem && (
          <PracticeCoachCard
            wordItem={wordItem}
            onAttemptSaved={loadWord}
          />
        )}

        {/* Practice History */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Pratik Geçmişi
            </h3>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Henüz pratik yok</p>
              <p className="text-xs text-gray-400 mt-1">Pratik Koçu ile başla</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {attempts.slice(0, 10).map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold",
                      attempt.verdict === "great" ? "bg-emerald-100 text-emerald-700" :
                      attempt.verdict === "close" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-200 text-gray-700"
                    )}>
                      {attempt.matchPct}%
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{attempt.transcript || "—"}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(attempt.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium",
                    attempt.verdict === "great" ? "bg-emerald-50 text-emerald-700" :
                    attempt.verdict === "close" ? "bg-amber-50 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {attempt.verdict === "great" ? "Harika" :
                     attempt.verdict === "close" ? "Yakın" : "Tekrar"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Kelime Bilgisi
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-gray-500 font-medium">Oluşturulma</span>
              <span className="text-gray-800 font-semibold">{new Date(word.createdAt).toLocaleDateString()}</span>
            </div>
            {word.lastPracticedAt && (
              <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <span className="text-gray-500 font-medium">Son Pratik</span>
                <span className="text-gray-800 font-semibold">{new Date(word.lastPracticedAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-gray-500 font-medium">Deneme</span>
              <span className="text-gray-800 font-semibold">{word.attempts?.length || 0}</span>
            </div>
            <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-gray-500 font-medium">Durum</span>
              <span className={cn(
                "px-2.5 py-1 rounded text-xs font-medium",
                word.isLearned ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
              )}>
                {word.isLearned ? "Öğrendim" : "Öğreniyorum"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
