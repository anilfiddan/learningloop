"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  History as HistoryIcon,
  Play,
  CheckCircle,
  FolderPlus,
  PlusCircle,
  ExternalLink,
  Calendar,
  ClipboardList,
  Clock,
  BookCheck
} from "lucide-react";
import { HistoryEvent, Word } from "@/lib/data-types";
import { getHistory, getWord, getRecentWords, getLearnedWords, seedDefaultData } from "@/lib/data-store";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [words, setWords] = useState<Record<string, Word | null>>({});
  const [recentWords, setRecentWords] = useState<Word[]>([]);
  const [learnedWords, setLearnedWords] = useState<Word[]>([]);
  const [activeTab, setActiveTab] = useState<"activity" | "recent" | "learned">("activity");

  useEffect(() => {
    seedDefaultData();
    loadData();
  }, []);

  const loadData = () => {
    const historyData = getHistory();
    setHistory(historyData);

    // Load word data for each history event
    const wordMap: Record<string, Word | null> = {};
    historyData.forEach((event) => {
      if (!wordMap[event.wordId]) {
        wordMap[event.wordId] = getWord(event.wordId);
      }
    });
    setWords(wordMap);

    setRecentWords(getRecentWords(20));
    setLearnedWords(getLearnedWords());
  };

  const getEventIcon = (event: HistoryEvent["event"]) => {
    switch (event) {
      case "practiced": return <Play className="w-4 h-4" />;
      case "learned": return <CheckCircle className="w-4 h-4" />;
      case "added_to_list": return <FolderPlus className="w-4 h-4" />;
      case "created": return <PlusCircle className="w-4 h-4" />;
      default: return <HistoryIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (event: HistoryEvent["event"]) => {
    switch (event) {
      case "practiced": return "bg-blue-100 text-blue-600";
      case "learned": return "bg-green-100 text-green-600";
      case "added_to_list": return "bg-purple-100 text-purple-600";
      case "created": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getEventLabel = (event: HistoryEvent["event"]) => {
    switch (event) {
      case "practiced": return "Practiced";
      case "learned": return "Marked as learned";
      case "added_to_list": return "Added to list";
      case "created": return "Added to dictionary";
      default: return event;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const mins = Math.floor(diff / (1000 * 60));
        return mins <= 1 ? "Just now" : `${mins} mins ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Geçmiş</h1>
        <p className="text-gray-500">Öğrenme yolculuğunu takip et</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "activity", label: "Aktiviteler" },
          { key: "recent", label: "Son Pratikler" },
          { key: "learned", label: "Öğrenilenler" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
              activeTab === tab.key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-700">Henüz aktivite yok</p>
              <p className="text-sm text-gray-400 mt-1">Pratik yapmaya başla</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((event) => {
                const word = words[event.wordId];
                if (!word) return null;

                return (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/dashboard?word=${encodeURIComponent(word.text)}`)}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getEventIcon(event.event)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{word.text}</span>
                          <span className="text-sm text-gray-500">{getEventLabel(event.event)}</span>
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(event.createdAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/word/${word.id}`); }}
                      className="p-2.5 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recent Practice Tab */}
      {activeTab === "recent" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {recentWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-700">Henüz pratik yok</p>
              <p className="text-sm text-gray-400 mt-1">Pratik yaptığın kelimeler burada görünecek</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentWords.map((word) => (
                <div
                  key={word.id}
                  onClick={() => router.push(`/dashboard?word=${encodeURIComponent(word.text)}`)}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">
                        {word.text.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-800">{word.text}</span>
                      {word.lastPracticedAt && (
                        <p className="text-xs text-gray-400">
                          Son pratik: {formatDate(word.lastPracticedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/dashboard?word=${encodeURIComponent(word.text)}`)}
                      className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg font-semibold hover:bg-gray-800 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Pratik
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/word/${word.id}`)}
                      className="p-2.5 rounded-lg text-gray-400 hover:bg-gray-50"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Learned Tab */}
      {activeTab === "learned" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {learnedWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <BookCheck className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-700">Henüz öğrenilen kelime yok</p>
              <p className="text-sm text-gray-400 mt-1">Kelimeleri öğrenildi olarak işaretleyin</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {learnedWords.map((word) => (
                <div
                  key={word.id}
                  onClick={() => router.push(`/dashboard?word=${encodeURIComponent(word.text)}`)}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{word.text}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
                          Öğrenildi
                        </span>
                      </div>
                      {word.definition && (
                        <p className="text-sm text-gray-500">{word.definition}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/word/${word.id}`); }}
                    className="p-2.5 rounded-lg text-gray-400 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-gray-800">{history.length}</p>
          <p className="text-sm text-gray-500 font-medium">Aktiviteler</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-gray-800">{recentWords.length}</p>
          <p className="text-sm text-gray-500 font-medium">Pratik Yapılan</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-3xl font-bold text-gray-800">{learnedWords.length}</p>
          <p className="text-sm text-gray-500 font-medium">Öğrenilen</p>
        </div>
      </div>
    </div>
  );
}
