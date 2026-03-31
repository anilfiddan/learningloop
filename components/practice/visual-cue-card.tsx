"use client";

import { useState, useEffect } from "react";
import { VisualResult } from "@/lib/types";
import { Image as ImageIcon, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface VisualCueCardProps {
  visual: VisualResult | null;
  isLoading: boolean;
  onRegenerate: () => void;
  word: string;
}

export function VisualCueCard({
  visual,
  isLoading,
  onRegenerate,
  word,
}: VisualCueCardProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  // Animated progress bar when loading
  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const texts = [
        t.visual.preparing,
        t.visual.aiWorking,
        t.visual.creating,
        t.visual.finalTouches,
      ];
      setLoadingText(texts[0]);
      let textIndex = 0;

      // Progress animation - goes to 90% then waits
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 8 + 2;
        });
      }, 300);

      // Text animation
      const textInterval = setInterval(() => {
        textIndex = (textIndex + 1) % texts.length;
        setLoadingText(texts[textIndex]);
      }, 2000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(textInterval);
      };
    } else {
      // Complete the progress when done
      setProgress(100);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            {t.visual.title}
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-gray-50">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-3">{loadingText}</p>
          <div className="w-48">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            {t.visual.title}
          </h3>
        </div>
        <div className="flex flex-col h-48 items-center justify-center rounded-xl bg-gray-50">
          <ImageIcon className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 font-medium">{t.visual.enterWord}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          {t.visual.title}
        </h3>
        <button
          onClick={onRegenerate}
          aria-label={t.visual.refresh}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {visual?.isFallback || !visual?.imageUrl ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-gray-50">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-900 shadow-sm">
            <span className="text-2xl font-bold text-white">
              {word.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="mt-3 text-base font-bold text-gray-800">{word}</p>
          <p className="text-xs text-gray-400 mt-1">Gorsel olusturmak icin yenile</p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-gray-100">
          <img
            src={visual.imageUrl}
            alt={`Visual cue for ${word}`}
            className="h-48 w-full object-contain bg-white"
          />
        </div>
      )}
    </div>
  );
}
