"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Trophy, Loader2, RefreshCw, Lightbulb, Check, X, Play } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface QuizQuestion {
  word: string;
  options: string[];
  hint: string;
  imageUrl: string | null;
}

const TOTAL_QUESTIONS = 10;

const CATEGORIES = [
  { id: "general", labelTr: "Genel", labelEn: "General", emoji: "🌟", color: "from-sky-400 to-blue-500", bgColor: "bg-sky-50", borderColor: "border-sky-200" },
  { id: "food", labelTr: "Yiyecekler", labelEn: "Food", emoji: "🍕", color: "from-amber-400 to-orange-500", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { id: "animals", labelTr: "Hayvanlar", labelEn: "Animals", emoji: "🐶", color: "from-emerald-400 to-green-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  { id: "nature", labelTr: "Doğa", labelEn: "Nature", emoji: "🌳", color: "from-violet-400 to-purple-500", bgColor: "bg-violet-50", borderColor: "border-violet-200" },
];

const TIPS_TR = [
  "Heceleri yavaşça söylemek telaffuzu kolaylaştırır!",
  "Her gün 10 dakika pratik yapmak büyük fark yaratır!",
  "Yanlış cevaplar da öğrenmenin bir parçası!",
  "Her doğru cevap seni daha güçlü yapar!",
];

const TIPS_EN = [
  "Pronouncing syllables slowly makes it easier!",
  "10 minutes of daily practice makes a big difference!",
  "Wrong answers are part of learning too!",
  "Every correct answer makes you stronger!",
];

export default function QuizPage() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [status, setStatus] = useState<"idle" | "preparing" | "playing" | "answered" | "gameover">("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [preparedCount, setPreparedCount] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const tips = lang === "tr" ? TIPS_TR : TIPS_EN;

  useEffect(() => {
    const stored = localStorage.getItem("quiz-highscore");
    if (stored) setHighScore(parseInt(stored));
  }, []);

  useEffect(() => {
    if (status === "preparing") {
      const interval = setInterval(() => setCurrentTip((p) => (p + 1) % tips.length), 3000);
      return () => clearInterval(interval);
    }
  }, [status, tips.length]);

  const fetchQuestion = async (idx: number, signal: AbortSignal): Promise<QuizQuestion | null> => {
    try {
      const res = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, lang, difficulty: idx < 5 ? "beginner" : "intermediate" }),
        signal,
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      return { word: data.word, options: data.options, hint: data.hint, imageUrl: data.imageUrl };
    } catch (e) {
      if ((e as Error).name === "AbortError") return null;
      return { word: lang === "tr" ? "elma" : "apple", options: lang === "tr" ? ["elma", "armut", "portakal", "muz"] : ["apple", "pear", "orange", "banana"], hint: lang === "tr" ? "Kırmızı meyve" : "Red fruit", imageUrl: null };
    }
  };

  const prepareQuestions = async () => {
    setStatus("preparing");
    setPreparedCount(0);
    setQuestions([]);
    setCurrentIndex(0);
    setLives(3);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
    abortRef.current = new AbortController();
    const newQ: QuizQuestion[] = [];
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      if (abortRef.current.signal.aborted) break;
      const q = await fetchQuestion(i, abortRef.current.signal);
      if (q) { newQ.push(q); setQuestions([...newQ]); setPreparedCount(i + 1); }
    }
    if (!abortRef.current.signal.aborted && newQ.length > 0) setStatus("playing");
  };

  const handleAnswer = (answer: string) => {
    if (status !== "playing" || selectedAnswer) return;
    const q = questions[currentIndex];
    const correct = answer === q.word;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setStatus("answered");
    if (correct) {
      const pts = showHint ? 5 : 10;
      const ns = score + pts;
      setScore(ns);
      if (ns > highScore) { setHighScore(ns); localStorage.setItem("quiz-highscore", ns.toString()); }
    } else {
      setLives((p) => p - 1);
    }
    setTimeout(() => {
      const nl = correct ? lives : lives - 1;
      if (nl <= 0 || currentIndex + 1 >= questions.length) { setStatus("gameover"); }
      else { setCurrentIndex((p) => p + 1); setSelectedAnswer(null); setIsCorrect(null); setShowHint(false); setStatus("playing"); }
    }, 1500);
  };

  const resetGame = () => {
    abortRef.current?.abort();
    setStatus("idle");
    setQuestions([]);
    setCurrentIndex(0);
    setLives(3);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
    setPreparedCount(0);
  };

  const q = questions[currentIndex];
  const t = lang === "tr"
    ? { title: "Kelime Quiz", subtitle: "Resme bakarak doğru kelimeyi bul", start: "Oyunu Baslat", category: "Kategori Sec", high: "En Yuksek", preparing: "Sorular hazirlaniyor...", of: "/", prepared: "soru hazirlandi", tip: "Ipucu", correct: "Dogru!", wrong: "Yanlis!", answer: "Dogru cevap", over: "Oyun Bitti", final: "Final Skor", again: "Tekrar Oyna", newHigh: "Yeni Rekor!", question: "Soru", wait: "Gorsel yukleniyor...", hint: "Ipucu" }
    : { title: "Word Quiz", subtitle: "Find the correct word by looking at the image", start: "Start Game", category: "Select Category", high: "High Score", preparing: "Preparing questions...", of: "/", prepared: "questions prepared", tip: "Tip", correct: "Correct!", wrong: "Wrong!", answer: "Correct answer", over: "Game Over", final: "Final Score", again: "Play Again", newHigh: "New High Score!", question: "Question", wait: "Loading image...", hint: "Hint" };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{t.title}</h1>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {status === "idle" && (
        <div className="space-y-6">
          {highScore > 0 && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Trophy className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-bold">{t.high}: {highScore}</span>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">{t.category}</h3>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={cn(
                    "px-4 py-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                    selectedCategory === c.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  <span className="text-lg">{c.emoji}</span>
                  {lang === "tr" ? c.labelTr : c.labelEn}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={prepareQuestions}
              className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all"
            >
              <Play className="w-5 h-5" />
              {t.start}
            </button>
          </div>
        </div>
      )}

      {status === "preparing" && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8">
          <div className="flex flex-col items-center py-8">
            <div className="mb-6">
              <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
            </div>
            <p className="text-lg font-bold text-gray-800 mb-2">{t.preparing}</p>
            <p className="text-gray-600 font-medium mb-6">{preparedCount} {t.of} {TOTAL_QUESTIONS} {t.prepared}</p>
            <div className="w-full max-w-xs mb-8">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${(preparedCount / TOTAL_QUESTIONS) * 100}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 max-w-md text-center border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">{t.tip}</p>
              <p className="text-gray-600 font-medium">{tips[currentTip]}</p>
            </div>
          </div>
        </div>
      )}

      {(status === "playing" || status === "answered") && q && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart key={i} className={cn("w-6 h-6", i < lives ? "fill-red-500 text-red-500" : "fill-gray-200 text-gray-200")} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-600">{t.question} {currentIndex + 1} {t.of} {questions.length}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Trophy className="w-4 h-4 text-gray-600" />
              <span className="font-bold text-gray-700">{score}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="aspect-square max-w-sm mx-auto bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
              {q.imageUrl ? (
                <Image src={q.imageUrl} alt="Quiz" width={400} height={400} className="w-full h-full object-cover" unoptimized />
              ) : (
                <div className="text-center p-8">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">{t.wait}</p>
                </div>
              )}
            </div>
            {!showHint && status === "playing" && (
              <button
                onClick={() => setShowHint(true)}
                className="mt-4 flex items-center gap-2 mx-auto px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
              >
                <Lightbulb className="w-4 h-4" />
                {t.hint} (-5)
              </button>
            )}
            {showHint && (
              <p className="mt-4 text-center text-gray-700 font-medium bg-gray-50 rounded-lg py-3 px-4 border border-gray-100">
                {q.hint}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o, i) => {
              const sel = selectedAnswer === o;
              const corr = o === q.word;
              const show = status === "answered";
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(o)}
                  disabled={status === "answered" || !q.imageUrl}
                  className={cn(
                    "p-4 rounded-xl text-lg font-bold transition-all",
                    !q.imageUrl && "opacity-50 cursor-not-allowed",
                    show && corr
                      ? "bg-emerald-600 text-white"
                      : show && sel && !corr
                        ? "bg-red-500 text-white"
                        : sel
                          ? "bg-gray-900 text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    {show && corr && <Check className="w-5 h-5" />}
                    {show && sel && !corr && <X className="w-5 h-5" />}
                    {o}
                  </span>
                </button>
              );
            })}
          </div>

          {status === "answered" && (
            <div className={cn(
              "flex items-center justify-center gap-2 text-center py-4 rounded-xl font-bold text-lg",
              isCorrect
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            )}>
              {isCorrect ? (
                <><Check className="w-5 h-5" /> {t.correct}</>
              ) : (
                <><X className="w-5 h-5" /> {t.wrong} {t.answer}: {q.word}</>
              )}
            </div>
          )}
        </div>
      )}

      {status === "gameover" && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.over}</h2>
          {score >= highScore && score > 0 && (
            <p className="text-gray-700 font-bold mb-4 text-lg">{t.newHigh}</p>
          )}
          <p className="text-5xl font-bold text-gray-800 mb-2">{score}</p>
          <p className="text-gray-500 font-medium mb-8">{t.final}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={prepareQuestions}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              {t.again}
            </button>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold hover:border-gray-300 transition-all"
            >
              {t.category}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
