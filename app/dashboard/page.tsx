"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WordInputCard } from "@/components/practice/word-input-card";
import { SyllablesCard } from "@/components/practice/syllables-card";
import { VisualCueCard } from "@/components/practice/visual-cue-card";
import { PracticeCoachCard } from "@/components/practice/practice-coach-card";
import { Mic, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Level, PipelineStep, StrategyResult, AudioResult, VisualResult } from "@/lib/types";
import { WordItem } from "@/lib/types/word";
import {
  addWord as addWordToStore,
  getWordByText,
  updateWord as updateWordInStore,
  seedDefaultData,
} from "@/lib/stores/word-store";
import {
  addWord as addWordOld,
  getWords as getWordsOld,
  updateWord as updateWordOld,
  seedDefaultData as seedOldData,
} from "@/lib/data-store";

// Loading Overlay Component
function LoadingOverlay({ step, t }: { step: PipelineStep; t: ReturnType<typeof useLanguage>["t"] }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    setProgress(0);
    const items = [
      { text: "Strateji olusturuluyor..." },
      { text: "Sesler hazirlaniyor..." },
      { text: "Gorseller yukleniyor..." },
      { text: "Son dokunuslar..." },
    ];
    setLoadingText(items[0].text);
    let index = 0;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 8 + 2;
      });
    }, 200);

    const textInterval = setInterval(() => {
      index = (index + 1) % items.length;
      setLoadingText(items[index].text);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [step, t]);

  return (
    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-gray-900 flex items-center justify-center shadow-sm animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-gray-700 mb-4 font-semibold text-lg">{loadingText}</p>
        <div className="w-64">
          <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2 font-medium">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}

interface DashboardState {
  step: PipelineStep;
  strategy: StrategyResult | null;
  audio: AudioResult | null;
  visual: VisualResult | null;
  wordItem: WordItem | null;
  error: string | null;
}

const initialState: DashboardState = {
  step: "idle",
  strategy: null,
  audio: null,
  visual: null,
  wordItem: null,
  error: null,
};

export default function DashboardPracticePage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [state, setState] = useState<DashboardState>(initialState);
  const [hardSyllables, setHardSyllables] = useState<string[]>([]);

  useEffect(() => {
    seedDefaultData();
    seedOldData();
  }, []);

  const setStep = (step: PipelineStep) => {
    setState((prev) => ({ ...prev, step }));
  };

  const createWordItem = (strategy: StrategyResult, imageUrl?: string): WordItem => {
    // Save to old data-store for History page
    const oldWords = getWordsOld();
    const existingOld = oldWords.find(w => w.text.toLowerCase() === strategy.word.toLowerCase());
    if (existingOld) {
      updateWordOld(existingOld.id, {
        syllables: strategy.syllables,
        definition: strategy.definition,
        lastPracticedAt: new Date().toISOString(),
        media: { imageUrl },
      });
    } else {
      addWordOld({
        text: strategy.word,
        lang: "tr",
        level: strategy.level,
        syllables: strategy.syllables,
        definition: strategy.definition,
        lastPracticedAt: new Date().toISOString(),
        media: { imageUrl },
      });
    }

    // Save to new word-store for PracticeCoachCard
    const existing = getWordByText(strategy.word);
    if (existing) {
      const updated = updateWordInStore(existing.id, {
        syllables: strategy.syllables,
        shortDefinition: strategy.definition,
        coachTip: strategy.coachingTip || "",
        imageUrl,
      });
      return updated || existing;
    } else {
      return addWordToStore({
        word: strategy.word,
        lang: "tr",
        syllables: strategy.syllables,
        shortDefinition: strategy.definition,
        coachTip: strategy.coachingTip || "",
        imageUrl,
        level: strategy.level,
      });
    }
  };

  const generateStrategy = async (word: string, level: Level): Promise<StrategyResult | null> => {
    try {
      const response = await fetch("/api/generate/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, level }),
      });
      if (!response.ok) throw new Error("Strategy generation failed");
      return await response.json();
    } catch (error) {
      console.error("Strategy error:", error);
      return null;
    }
  };

  const generateAudio = async (word: string, syllables: string[]): Promise<AudioResult | null> => {
    try {
      const response = await fetch("/api/generate/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, syllables }),
      });
      if (!response.ok) throw new Error("Audio generation failed");
      return await response.json();
    } catch (error) {
      console.error("Audio error:", error);
      return {
        syllableAudios: syllables.map((s) => ({ syllable: s, audioUrl: "" })),
        wordAudioUrl: "",
        isFallback: true,
      };
    }
  };

  const generateVisual = async (word: string, definition: string): Promise<VisualResult | null> => {
    try {
      const response = await fetch("/api/generate/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, definition }),
      });
      if (!response.ok) throw new Error("Visual generation failed");
      return await response.json();
    } catch (error) {
      console.error("Visual error:", error);
      return { imageUrl: "", isFallback: true };
    }
  };

  const handleStart = useCallback(async (word: string, level: Level) => {
    setState(initialState);

    setStep("strategy");
    const strategy = await generateStrategy(word, level);
    if (!strategy) {
      setState((prev) => ({ ...prev, step: "idle", error: "Failed to generate strategy" }));
      return;
    }
    setState((prev) => ({ ...prev, strategy }));

    setStep("audio");
    const [audio, visual] = await Promise.all([
      generateAudio(strategy.word, strategy.syllables),
      generateVisual(strategy.word, strategy.definition),
    ]);

    const wordItem = createWordItem(strategy, visual?.imageUrl);

    setState((prev) => ({ ...prev, audio, visual, wordItem }));
    setStep("ready");
  }, []);

  const handleRegenerateAudio = useCallback(async () => {
    if (!state.strategy) return;
    setStep("audio");
    const audio = await generateAudio(state.strategy.word, state.strategy.syllables);
    setState((prev) => ({ ...prev, audio, step: "ready" }));
  }, [state.strategy]);

  const handleRegenerateVisual = useCallback(async () => {
    if (!state.strategy) return;
    setStep("visual");
    const visual = await generateVisual(state.strategy.word, state.strategy.definition);
    setState((prev) => ({ ...prev, visual, step: "ready" }));
  }, [state.strategy]);

  const handleMarkHard = useCallback((syllable: string) => {
    setHardSyllables((prev) =>
      prev.includes(syllable)
        ? prev.filter((s) => s !== syllable)
        : [...prev, syllable]
    );
  }, []);

  const handleUpdateSyllables = useCallback((syllables: string[]) => {
    setState((prev) => {
      if (!prev.strategy) return prev;
      return {
        ...prev,
        strategy: { ...prev.strategy, syllables },
      };
    });
  }, []);

  useEffect(() => {
    const wordParam = searchParams.get("word");
    if (wordParam && state.step === "idle") {
      handleStart(wordParam, "beginner");
    }
  }, [searchParams, state.step, handleStart]);

  const isLoading = state.step !== "idle" && state.step !== "ready";

  // Check if all content is ready
  const isContentReady = state.step === "ready" && state.wordItem && state.visual && state.audio;
  const isContentLoading = state.step !== "idle" && !isContentReady;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* TOP SECTION — WORD ENTRY */}
        <section className="mb-8">
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
            <WordInputCard onStart={handleStart} isLoading={isLoading} />
          </div>
        </section>

        {/* Error */}
        {state.error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        {/* LOADING STATE - Show fake loading until all content is ready */}
        {isContentLoading && (
          <section className="mb-8">
            <LoadingOverlay step={state.step} t={t} />
          </section>
        )}

        {/* CONTENT SECTION - Only show when ready */}
        {isContentReady && (
          <section className="grid gap-6 lg:grid-cols-5">

            {/* LEFT COLUMN — Visual & Understanding (2/5) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Visual Image */}
              <VisualCueCard
                visual={state.visual}
                isLoading={false}
                onRegenerate={handleRegenerateVisual}
                word={state.strategy?.word || ""}
              />

              {/* Syllables */}
              <SyllablesCard
                strategy={state.strategy}
                audio={state.audio}
                isLoading={false}
                onRegenerateAudio={handleRegenerateAudio}
                onMarkHard={handleMarkHard}
                hardSyllables={hardSyllables}
                onUpdateSyllables={handleUpdateSyllables}
              />

              {/* Definition */}
              {state.strategy && (
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    {state.strategy.word}
                  </h2>
                  <p className="text-gray-500 mt-2 leading-relaxed">
                    {state.strategy.definition}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN — Practice Coach (3/5) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm min-h-[420px] flex flex-col">

                {/* Coach Header */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t?.coach?.title || "Practice"}
                  </h2>
                </div>

                {/* Coach Content */}
                <div className="flex-1 p-6 flex flex-col">
                  <PracticeCoachCard wordItem={state.wordItem!} />
                </div>

                {/* Coach Tip */}
                {state.strategy?.coachingTip && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-gray-500">
                      {state.strategy.coachingTip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* IDLE STATE - Show placeholder cards */}
        {state.step === "idle" && (
          <section className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-6">
              <VisualCueCard
                visual={null}
                isLoading={false}
                onRegenerate={handleRegenerateVisual}
                word=""
              />
              <SyllablesCard
                strategy={null}
                audio={null}
                isLoading={false}
                onRegenerateAudio={handleRegenerateAudio}
                onMarkHard={handleMarkHard}
                hardSyllables={hardSyllables}
                onUpdateSyllables={handleUpdateSyllables}
              />
            </div>
            <div className="lg:col-span-3">
              <div className="bg-gray-50 rounded-xl border border-gray-100 min-h-[420px] flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-gray-400" />
                    {t?.coach?.title || "Pratik Kocu"}
                  </h2>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-6 shadow-sm">
                    <Mic className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold text-lg mb-2">
                    {t?.coach?.enterWordFirst || "Pratik yapmak icin yukaridan bir kelime girin"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Kelimeyi yazin ve Baslat butonuna basin.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
