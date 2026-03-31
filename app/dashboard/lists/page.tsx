"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderOpen,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  ChevronRight
} from "lucide-react";
import { WordList, Word } from "@/lib/data-types";
import { getLists, addList, deleteList, getWordsByList, seedDefaultData } from "@/lib/data-store";
import { cn } from "@/lib/utils";

export default function ListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<WordList[]>([]);
  const [listWords, setListWords] = useState<Record<string, Word[]>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newList, setNewList] = useState({ name: "", description: "", icon: "📚" });
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    seedDefaultData();
    loadLists();
  }, []);

  const loadLists = () => {
    const allLists = getLists();
    setLists(allLists);

    const wordsMap: Record<string, Word[]> = {};
    allLists.forEach((list) => {
      wordsMap[list.id] = getWordsByList(list.id);
    });
    setListWords(wordsMap);
  };

  const handleAddList = () => {
    if (!newList.name.trim()) return;

    addList({
      name: newList.name.trim(),
      description: newList.description.trim() || undefined,
      icon: newList.icon || "📚",
      wordIds: [],
    });

    loadLists();
    setNewList({ name: "", description: "", icon: "📚" });
    setIsAddModalOpen(false);
  };

  const handleDeleteList = (id: string) => {
    if (confirm("Are you sure you want to delete this list?")) {
      deleteList(id);
      loadLists();
    }
    setOpenMenu(null);
  };

  const openList = (id: string) => {
    router.push(`/dashboard/lists/${id}`);
  };

  const emojis = ["📚", "🌿", "🏠", "🍎", "🎨", "🎵", "⭐", "💼", "🌍", "🔬", "🎯", "💡"];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Listeler</h1>
          <p className="text-gray-500">Kelimelerini koleksiyonlara ayir ve duzenle</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
        >
          <Plus className="w-4 h-4" />
          Yeni Liste
        </button>
      </div>

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-16 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Henuz liste yok</h3>
          <p className="text-gray-500 mb-6">Ilk listeni olustur ve kelimelerini duzenle</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            Liste Olustur
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const words = listWords[list.id] || [];
            return (
              <div
                key={list.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                        {list.icon || "📚"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{list.name}</h3>
                        <p className="text-sm text-gray-400">{words.length} kelime</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === list.id ? null : list.id);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu === list.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {list.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{list.description}</p>
                  )}

                  {/* Preview words */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {words.slice(0, 4).map((word) => (
                      <button
                        key={word.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard?word=${encodeURIComponent(word.text)}`);
                        }}
                        className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        {word.text}
                      </button>
                    ))}
                    {words.length > 4 && (
                      <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs rounded font-medium">
                        +{words.length - 4} daha
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openList(list.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Listeyi Ac
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add List Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl p-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Yeni Liste Olustur</h2>
              <p className="text-sm text-gray-500 mt-1">Kelimelerini gruplamak icin bir liste olustur</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Ikon Sec</label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewList({ ...newList, icon: emoji })}
                      className={cn(
                        "w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all",
                        newList.icon === emoji
                          ? "bg-gray-50 ring-2 ring-gray-300 shadow-sm"
                          : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Liste Adi</label>
                <input
                  type="text"
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  placeholder="orn: Doga, Yiyecekler, Seyahat"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Aciklama (istege bagli)</label>
                <textarea
                  value={newList.description}
                  onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  placeholder="Bu liste ne hakkinda?"
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 resize-none"
                />
              </div>

              <button
                onClick={handleAddList}
                disabled={!newList.name.trim()}
                className="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Liste Olustur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
