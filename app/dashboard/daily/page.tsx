"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Clock,
  Trophy,
  Play,
  ChevronRight,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { getWords } from "@/lib/stores/word-store";
import { WordItem } from "@/lib/types/word";
import {
  getWordsDueToday,
  getWordsDueInDays,
  getMasteredWords,
  getTotalSRWords,
  migrateExistingWords,
} from "@/lib/spaced-repetition/sr-store";
import { SpacedRepetitionData } from "@/lib/spaced-repetition/sm2";
import { cn } from "@/lib/utils";

export default function DailyPracticePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [dueWords, setDueWords] = useState<SpacedRepetitionData[]>([]);
  const [upcomingWords, setUpcomingWords] = useState<SpacedRepetitionData[]>([]);
  const [masteredWords, setMasteredWords] = useState<SpacedRepetitionData[]>([]);
  const [wordMap, setWordMap] = useState<Record<string, WordItem>>({});
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Migrate existing words to SR system
    const allWords = getWords();
    migrateExistingWords(allWords.map((w) => w.id));

    // Build word lookup map
    const map: Record<string, WordItem> = {};
    allWords.forEach((w) => (map[w.id] = w));
    setWordMap(map);

    // Load SR data
    setDueWords(getWordsDueToday());
    setUpcomingWords(getWordsDueInDays(7));
    setMasteredWords(getMasteredWords());
  }, []);

  const handlePractice = (wordId: string) => {
    const word = wordMap[wordId];
    if (word) {
      router.push(`/dashboard?word=${encodeURIComponent(word.word)}`);
    }
  };

  const markCompleted = (wordId: string) => {
    setCompletedToday((prev) => new Set([...prev, wordId]));
  };

  const remainingCount = dueWords.filter(
    (d) => !completedToday.has(d.wordId)
  ).length;
  const totalDue = dueWords.length;
  const completedCount = completedToday.size;
  const progressPct = totalDue > 0 ? (completedCount / totalDue) * 100 : 0;

  const t = lang === "tr" ? {
    title: "Günlük Pratik",
    subtitle: "Aralıklı tekrar ile kelimelerinizi pekiştirin",
    dueToday: "Bugün",
    upcoming: "Yaklaşan (7 gün)",
    mastered: "Ustalaşılmış",
    words: "kelime",
    startPractice: "Pratik Yap",
    allDone: "Bugün için tamamlandı!",
    allDoneDesc: "Harika iş! Yarın yeni kelimeler sizi bekliyor.",
    noWords: "Henüz kelime yok",
    noWordsDesc: "Pratik sayfasından kelime ekleyerek başlayın",
    goToPractice: "Pratik Sayfasına Git",
    nextReview: "Sonraki tekrar",
    days: "gün sonra",
    today: "bugün",
    interval: "Aralık",
    ease: "Kolaylık",
    reps: "Tekrar",
    completed: "Tamamlandı",
    remaining: "kaldı",
    progress: "İlerleme",
  } : {
    title: "Daily Practice",
    subtitle: "Reinforce your words with spaced repetition",
    dueToday: "Due Today",
    upcoming: "Upcoming (7 days)",
    mastered: "Mastered",
    words: "words",
    startPractice: "Practice",
    allDone: "All done for today!",
    allDoneDesc: "Great work! New words will be waiting for you tomorrow.",
    noWords: "No words yet",
    noWordsDesc: "Start by adding words from the practice page",
    goToPractice: "Go to Practice",
    nextReview: "Next review",
    days: "days",
    today: "today",
    interval: "Interval",
    ease: "Ease",
    reps: "Reps",
    completed: "Completed",
    remaining: "remaining",
    progress: "Progress",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t.title}</h1>
        <p className="text-gray-500 text-sm">{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{t.dueToday}</span>
            <CalendarCheck className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalDue}</p>
          <p className="text-xs text-gray-400 mt-1">{t.words}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{t.upcoming}</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingWords.length}</p>
          <p className="text-xs text-gray-400 mt-1">{t.words}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">{t.mastered}</span>
            <Trophy className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{masteredWords.length}</p>
          <p className="text-xs text-gray-400 mt-1">{t.words}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {totalDue > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">{t.progress}</span>
            <span className="text-sm text-gray-500">
              {completedCount}/{totalDue} {t.completed}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {remainingCount > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {remainingCount} {t.remaining}
            </p>
          )}
        </div>
      )}

      {/* No Words State */}
      {getTotalSRWords() === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-1">{t.noWords}</h3>
          <p className="text-sm text-gray-400 mb-6">{t.noWordsDesc}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t.goToPractice}
          </button>
        </div>
      )}

      {/* All Done State */}
      {totalDue > 0 && remainingCount === 0 && (
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-8 text-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-1">{t.allDone}</h3>
          <p className="text-sm text-gray-500">{t.allDoneDesc}</p>
        </div>
      )}

      {/* Due Words List */}
      {dueWords.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t.dueToday} ({totalDue})
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {dueWords.map((sr) => {
              const word = wordMap[sr.wordId];
              if (!word) return null;
              const done = completedToday.has(sr.wordId);

              return (
                <div
                  key={sr.wordId}
                  className={cn(
                    "flex items-center justify-between p-4 transition-colors",
                    done ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold",
                      done ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-700"
                    )}>
                      {done ? <CheckCircle className="w-5 h-5" /> : word.word.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={cn(
                        "font-medium",
                        done ? "text-gray-400 line-through" : "text-gray-900"
                      )}>
                        {word.word}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {t.interval}: {sr.interval}d
                        </span>
                        <span className="text-xs text-gray-400">
                          {t.ease}: {sr.easeFactor}
                        </span>
                        <span className="text-xs text-gray-400">
                          {t.reps}: {sr.repetitions}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!done && (
                    <button
                      onClick={() => {
                        markCompleted(sr.wordId);
                        handlePractice(sr.wordId);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {t.startPractice}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Words */}
      {upcomingWords.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t.upcoming} ({upcomingWords.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {upcomingWords.slice(0, 10).map((sr) => {
              const word = wordMap[sr.wordId];
              if (!word) return null;

              const daysUntil = Math.ceil(
                (new Date(sr.nextReviewDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={sr.wordId}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-500">
                      {word.word.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{word.word}</p>
                      <p className="text-xs text-gray-400">
                        {t.nextReview}: {daysUntil} {t.days}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                    {sr.nextReviewDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mastered Words */}
      {masteredWords.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t.mastered} ({masteredWords.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {masteredWords.slice(0, 5).map((sr) => {
              const word = wordMap[sr.wordId];
              if (!word) return null;

              return (
                <div
                  key={sr.wordId}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{word.word}</p>
                      <p className="text-xs text-gray-400">
                        {t.interval}: {sr.interval}d | {t.reps}: {sr.repetitions}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePractice(sr.wordId)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
