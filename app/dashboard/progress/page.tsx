"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Flame,
  Star,
  Calendar,
  TrendingUp,
  X,
  Play,
  Globe,
  Info
} from "lucide-react";
import { getAttempts } from "@/lib/stores/word-store";
import { PracticeAttempt } from "@/lib/types/word";

type Language = "tr" | "en";

const translations = {
  tr: {
    title: "Ilerleme Durumu",
    subtitle: "Pratik yolculugunu takip et ve gelisimini gor",
    thisWeek: "Bu Hafta",
    wordsPracticed: "kelime calisildi",
    currentStreak: "Mevcut Seri",
    keepItUp: "devam et!",
    hardSyllables: "Zor Heceler",
    markedForPractice: "pratik icin isaretli",
    last7Days: "Son 7 Gun",
    practiced: "kez calisildi",
    practice: "Pratik",
    noHardSyllables: "Isaretli zor hece yok",
    markSyllables: "Pratik sirasinda heceleri zor olarak isaretle",
    disclaimer: "Bu ilerleme verileri yalnizca pratik takibi icindir. Teshis bilgisi veya tibbi degerlendirme saglamaz. Konusma terapisi endiseler icin lutfen nitelikli bir dil ve konusma uzmanina danisin.",
    days: ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"],
  },
  en: {
    title: "Your Progress",
    subtitle: "Track your practice journey and celebrate your growth",
    thisWeek: "This Week",
    wordsPracticed: "words practiced",
    currentStreak: "Current Streak",
    keepItUp: "keep it up!",
    hardSyllables: "Hard Syllables",
    markedForPractice: "marked for practice",
    last7Days: "Last 7 Days",
    practiced: "practiced",
    practice: "Practice",
    noHardSyllables: "No hard syllables marked",
    markSyllables: "Mark syllables as hard during practice",
    disclaimer: "This progress data is for practice tracking only. It does not provide diagnostic information or medical assessments. For speech therapy concerns, please consult a qualified speech-language professional.",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
};

function getDailyCountsFromAttempts(attempts: PracticeAttempt[], lang: Language): { date: string; count: number }[] {
  const days = translations[lang].days;
  const today = new Date();
  const result: { date: string; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    // getDay() returns 0=Sunday, 1=Monday... 6=Saturday
    // Our days array is [Mon, Tue, Wed, Thu, Fri, Sat, Sun] (0=Mon... 6=Sun)
    const dayIndex = date.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert: Sun(0)→6, Mon(1)→0, etc.

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const count = attempts.filter(a => {
      const attemptDate = new Date(a.createdAt);
      return attemptDate >= dayStart && attemptDate <= dayEnd;
    }).length;

    result.push({ date: days[adjustedIndex], count });
  }

  return result;
}

function calculateStreak(attempts: PracticeAttempt[]): number {
  if (attempts.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const hasAttempt = attempts.some(a => {
      const attemptDate = new Date(a.createdAt);
      return attemptDate >= dayStart && attemptDate <= dayEnd;
    });

    if (hasAttempt) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0) {
      currentDate.setDate(currentDate.getDate() - 1);
      if (currentDate < new Date(today.getTime() - 86400000)) break;
    } else {
      break;
    }
  }

  return streak;
}

function getHardSyllablesFromAttempts(attempts: PracticeAttempt[]): { syllable: string; count: number }[] {
  const syllableCounts: Record<string, number> = {};

  attempts.forEach(attempt => {
    if (attempt.syllableChecks) {
      attempt.syllableChecks.forEach(check => {
        if (!check.ok) {
          syllableCounts[check.syllable] = (syllableCounts[check.syllable] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(syllableCounts)
    .map(([syllable, count]) => ({ syllable, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export default function ProgressPage() {
  const [lang, setLang] = useState<Language>("tr");
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [hardSyllables, setHardSyllables] = useState<{ syllable: string; count: number }[]>([]);

  const t = translations[lang];

  useEffect(() => {
    const loadedAttempts = getAttempts();
    setAttempts(loadedAttempts);
    setHardSyllables(getHardSyllablesFromAttempts(loadedAttempts));
  }, []);

  const dailyCounts = getDailyCountsFromAttempts(attempts, lang);
  const totalPractice = dailyCounts.reduce((sum, day) => sum + day.count, 0);
  const maxCount = Math.max(...dailyCounts.map(d => d.count), 1);
  const streak = calculateStreak(attempts);

  const removeSyllable = (syllable: string) => {
    setHardSyllables(prev => prev.filter(s => s.syllable !== syllable));
  };

  return (
    <div className="p-6">
      {/* Header with language toggle */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{t.title}</h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setLang(lang === "tr" ? "en" : "tr")}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Globe className="h-4 w-4" />
          {lang === "tr" ? "EN" : "TR"}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-600">{t.thisWeek}</span>
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{totalPractice}</div>
          <p className="text-sm text-gray-500 mt-1 font-medium">{t.wordsPracticed}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-600">{t.currentStreak}</span>
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <Flame className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{streak} {lang === "tr" ? "gun" : "days"}</div>
          <p className="text-sm text-gray-500 mt-1 font-medium">{t.keepItUp}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-600">{t.hardSyllables}</span>
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <Star className="h-5 w-5 text-gray-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{hardSyllables.length}</div>
          <p className="text-sm text-gray-500 mt-1 font-medium">{t.markedForPractice}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-800">{t.last7Days}</h3>
          </div>
          <div className="flex items-end justify-between gap-3 h-44">
            {dailyCounts.map((day) => (
              <div key={day.date} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-semibold text-gray-500 mb-2">
                    {day.count}
                  </span>
                  <div
                    className="w-full bg-gray-900 rounded-lg transition-all duration-300"
                    style={{
                      height: maxCount > 0 ? `${(day.count / maxCount) * 120}px` : "8px",
                      minHeight: day.count > 0 ? "12px" : "8px",
                      opacity: day.count > 0 ? 1 : 0.15,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-3 font-semibold">
                  {day.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hard syllables */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-800">{t.hardSyllables}</h3>
          </div>
          {hardSyllables.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44">
              <Star className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-600">{t.noHardSyllables}</p>
              <p className="text-xs text-gray-400 mt-1">{t.markSyllables}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hardSyllables.map((item) => (
                <div
                  key={item.syllable}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-gray-800">
                      {item.syllable}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      {item.count}x {t.practiced}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      {t.practice}
                    </button>
                    <button
                      onClick={() => removeSyllable(item.syllable)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-5 bg-gray-50 border border-gray-100 rounded-xl">
        <div className="flex gap-3">
          <Info className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
