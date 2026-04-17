"use client";

import React, { useState } from "react";
import { Level } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface WordInputCardProps {
  onStart: (word: string, level: Level) => void;
  isLoading: boolean;
}

const SAMPLE_WORDS = [
  { word: "araba" },
  { word: "elma" },
  { word: "kitap" },
  { word: "okul" },
  { word: "kalem" },
];

export function WordInputCard({ onStart, isLoading }: WordInputCardProps) {
  const { lang, t } = useLanguage();
  const [word, setWord] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [speed, setSpeed] = useState<"slow" | "normal">("slow");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim()) {
      onStart(word.trim(), level);
    }
  };

  const handleSampleClick = (sampleWord: string) => {
    setWord(sampleWord);
  };

  return (
    <div role="region" aria-label={t.wordInput.label}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Main Input Row */}
        <div className="flex gap-3">
          <input
            id="word-input"
            type="text"
            value={word}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWord(e.target.value)}
            placeholder={lang === "tr" ? "Örnek: merhaba" : "Example: hello"}
            disabled={isLoading}
            autoComplete="off"
            className={cn(
              "flex-1 px-5 py-4 text-lg font-medium rounded-lg",
              "border border-gray-200 bg-white",
              "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400",
              "placeholder:text-gray-400 placeholder:font-normal",
              "transition-all"
            )}
          />
          <button
            type="submit"
            disabled={!word.trim() || isLoading}
            className={cn(
              "px-6 py-4 rounded-lg font-semibold text-white",
              "bg-gray-900 hover:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "transition-all shadow-sm"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="text-sm">{lang === "tr" ? "Başlat" : "Start"}</span>
            )}
          </button>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* Level */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">{lang === "tr" ? "Seviye:" : "Level:"}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setLevel("beginner")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all font-medium",
                  level === "beginner"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {lang === "tr" ? "Kolay" : "Easy"}
              </button>
              <button
                type="button"
                onClick={() => setLevel("intermediate")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all font-medium",
                  level === "intermediate"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {lang === "tr" ? "Orta" : "Medium"}
              </button>
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">{lang === "tr" ? "Hız:" : "Speed:"}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSpeed("slow")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all font-medium",
                  speed === "slow"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {lang === "tr" ? "Yavaş" : "Slow"}
              </button>
              <button
                type="button"
                onClick={() => setSpeed("normal")}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all font-medium",
                  speed === "normal"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                Normal
              </button>
            </div>
          </div>
        </div>

        {/* Sample Words */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-sm text-gray-500 font-medium">{lang === "tr" ? "Örnek Kelimeler:" : "Sample Words:"}</span>
          {SAMPLE_WORDS.map((item) => (
            <button
              key={item.word}
              type="button"
              onClick={() => handleSampleClick(item.word)}
              disabled={isLoading}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg font-medium",
                "bg-white border border-gray-200 text-gray-600",
                "hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                "transition-all disabled:opacity-50"
              )}
            >
              {item.word}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
