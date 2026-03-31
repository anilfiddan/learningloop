"use client";

import React, { useState, useRef, useEffect } from "react";
import { AudioResult, StrategyResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Volume2,
  Play,
  Pause,
  RefreshCw,
  Star,
  Edit2,
  Check,
  X,
  Loader2
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface SyllablesCardProps {
  strategy: StrategyResult | null;
  audio: AudioResult | null;
  isLoading: boolean;
  onRegenerateAudio: () => void;
  onMarkHard: (syllable: string) => void;
  hardSyllables: string[];
  onUpdateSyllables: (syllables: string[]) => void;
}

export function SyllablesCard({
  strategy,
  audio,
  isLoading,
  onRegenerateAudio,
  onMarkHard,
  hardSyllables,
  onUpdateSyllables,
}: SyllablesCardProps) {
  const { t } = useLanguage();
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playSyllable = (index: number, audioUrl: string) => {
    if (!audioUrl) {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(strategy?.syllables[index] || '');
        utterance.lang = 'tr-TR';
        utterance.rate = 0.6;
        speechSynthesis.speak(utterance);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingIndex(index);

    audio.onended = () => setPlayingIndex(null);
    audio.onerror = () => setPlayingIndex(null);
    audio.play().catch(() => setPlayingIndex(null));
  };

  const playWord = () => {
    if (audio?.wordAudioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioEl = new Audio(audio.wordAudioUrl);
      audioRef.current = audioEl;
      setIsPlayingWord(true);

      audioEl.onended = () => setIsPlayingWord(false);
      audioEl.onerror = () => setIsPlayingWord(false);
      audioEl.play().catch(() => setIsPlayingWord(false));
    } else if ('speechSynthesis' in window && strategy?.word) {
      // Fallback to Web Speech API
      const utterance = new SpeechSynthesisUtterance(strategy.word);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.0;
      setIsPlayingWord(true);
      utterance.onend = () => setIsPlayingWord(false);
      speechSynthesis.speak(utterance);
    }
  };

  const playAllSyllables = () => {
    if (!strategy?.syllables.length) return;

    let index = 0;
    const playNext = () => {
      if (index >= strategy.syllables.length) return;

      const syllableAudio = audio?.syllableAudios?.[index];
      if (syllableAudio?.audioUrl) {
        const audioEl = new Audio(syllableAudio.audioUrl);
        audioRef.current = audioEl;
        setPlayingIndex(index);

        audioEl.onended = () => {
          setPlayingIndex(null);
          index++;
          setTimeout(playNext, 300);
        };
        audioEl.play().catch(() => {
          index++;
          playNext();
        });
      } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(strategy.syllables[index]);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.6;
        setPlayingIndex(index);
        utterance.onend = () => {
          setPlayingIndex(null);
          index++;
          setTimeout(playNext, 300);
        };
        speechSynthesis.speak(utterance);
      }
    };

    playNext();
  };

  const startEditing = () => {
    if (strategy?.syllables) {
      setEditValue(strategy.syllables.join(' · '));
      setIsEditing(true);
    }
  };

  const saveEdit = () => {
    const newSyllables = editValue
      .split(/[·\s]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
    if (newSyllables.length > 0) {
      onUpdateSyllables(newSyllables);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue("");
  };

  // Loading progress state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      const texts = [
        t.syllables.splitting,
        t.syllables.audioPrep,
        t.syllables.pronunciation,
        t.syllables.finalChecks,
      ];
      setLoadingText(texts[0]);
      let textIndex = 0;

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10 + 3;
        });
      }, 250);

      const textInterval = setInterval(() => {
        textIndex = (textIndex + 1) % texts.length;
        setLoadingText(texts[textIndex]);
      }, 1500);

      return () => {
        clearInterval(progressInterval);
        clearInterval(textInterval);
      };
    } else {
      setLoadingProgress(100);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Heceler</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-3" />
          <p className="text-sm text-gray-600 font-medium mb-3">{loadingText}</p>
          <div className="w-40">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(loadingProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Heceler</h3>
        </div>
        <div className="flex h-16 items-center justify-center">
          <p className="text-sm text-gray-400">Heceleri gormek icin kelime gir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Heceler</h3>
        <div className="flex gap-1">
          {!isEditing && (
            <button
              onClick={startEditing}
              aria-label={t.syllables.edit}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onRegenerateAudio}
            aria-label="Refresh"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              placeholder="a · ra · ba"
            />
            <button
              onClick={saveEdit}
              className="p-2 rounded-lg text-white bg-gray-900 hover:bg-gray-800"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={cancelEdit}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {strategy.syllables.map((syllable, index) => {
              const syllableAudio = audio?.syllableAudios?.[index];
              const isHard = hardSyllables.includes(syllable);

              return (
                <button
                  key={`${syllable}-${index}`}
                  onClick={() => playSyllable(index, syllableAudio?.audioUrl || '')}
                  className={cn(
                    "group relative px-4 py-2 text-base font-bold rounded-xl transition-all",
                    playingIndex === index
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200",
                    isHard && "ring-2 ring-amber-400"
                  )}
                >
                  {syllable}
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onMarkHard(syllable);
                    }}
                    className={cn(
                      "absolute -top-1 -right-1 p-0.5 rounded-full transition-all",
                      isHard
                        ? "bg-amber-400 text-white"
                        : "bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Star className="h-2.5 w-2.5" />
                  </button>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={playAllSyllables}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Play className="h-4 w-4" />
            Heceleri Cal
          </button>
          <button
            onClick={playWord}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm"
          >
            {isPlayingWord ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            Kelimeyi Cal
          </button>
        </div>
      </div>
    </div>
  );
}
