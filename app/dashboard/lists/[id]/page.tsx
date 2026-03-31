"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Play,
  ExternalLink,
  Trash2,
  Search
} from "lucide-react";
import { WordList, Word } from "@/lib/data-types";
import { getList, getWordsByList, getWords, addWordToList, removeWordFromList } from "@/lib/data-store";
import { cn } from "@/lib/utils";

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  const [list, setList] = useState<WordList | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [listId]);

  const loadData = () => {
    const listData = getList(listId);
    setList(listData);
    if (listData) {
      setWords(getWordsByList(listId));
    }
    setAllWords(getWords());
  };

  const handleAddWord = (wordId: string) => {
    addWordToList(listId, wordId);
    loadData();
  };

  const handleRemoveWord = (wordId: string) => {
    removeWordFromList(listId, wordId);
    loadData();
  };

  const availableWords = allWords.filter(
    (w) =>
      !words.some((lw) => lw.id === w.id) &&
      (w.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
       w.definition?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!list) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Liste bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/dashboard/lists")}
          className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center text-2xl text-white font-bold">
            {list.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{list.name}</h1>
            {list.description && (
              <p className="text-gray-500">{list.description}</p>
            )}
          </div>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            Kelime Ekle
          </button>
        </div>
      </div>

      {/* Words */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-bold text-gray-700">Bu listede kelime yok</p>
            <p className="text-sm text-gray-400 mt-1">Sözlügünden kelime ekle</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
            >
              Kelime Ekle
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {words.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">
                      {word.text.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{word.text}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium uppercase">
                        {word.lang}
                      </span>
                    </div>
                    {word.definition && (
                      <p className="text-sm text-gray-500">{word.definition}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/dashboard?word=${encodeURIComponent(word.text)}`)}
                    className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/word/${word.id}`)}
                    className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveWord(word.id)}
                    className="p-2.5 rounded-xl text-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Words Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-lg p-6 max-h-[80vh] flex flex-col border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Listeye Kelime Ekle</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kelime ara..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
              />
            </div>

            <div className="flex-1 overflow-auto">
              {availableWords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Eklenecek kelime yok</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableWords.map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
                    >
                      <div>
                        <span className="font-bold text-gray-800">{word.text}</span>
                        {word.definition && (
                          <span className="text-sm text-gray-500 ml-2">- {word.definition}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddWord(word.id)}
                        className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg font-semibold hover:bg-gray-800"
                      >
                        Ekle
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
