"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  X,
  AlertCircle,
  BookOpen,
  Tag,
} from "lucide-react";
import { getPacks, createPack, updatePack, deletePack, WordPack, getCurrentUser } from "@/lib/stores/admin-store";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "general", label: "Genel", emoji: "🌟" },
  { id: "food", label: "Yiyecekler", emoji: "🍕" },
  { id: "animals", label: "Hayvanlar", emoji: "🐶" },
  { id: "nature", label: "Doğa", emoji: "🌳" },
  { id: "school", label: "Okul", emoji: "📚" },
  { id: "home", label: "Ev", emoji: "🏠" },
];

const DIFFICULTIES = [
  { id: "beginner", label: "Başlangıç", color: "bg-emerald-100 text-emerald-700" },
  { id: "intermediate", label: "Orta", color: "bg-amber-100 text-amber-700" },
  { id: "advanced", label: "İleri", color: "bg-red-100 text-red-700" },
];

export default function PacksPage() {
  const [packs, setPacks] = useState<WordPack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<WordPack | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📚",
    category: "general",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    words: "",
    isActive: true,
  });

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = () => {
    setPacks(getPacks());
  };

  const filteredPacks = packs.filter((pack) => {
    const matchesSearch =
      pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || pack.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingPack(null);
    setFormData({
      name: "",
      description: "",
      icon: "📚",
      category: "general",
      difficulty: "beginner",
      words: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pack: WordPack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      description: pack.description,
      icon: pack.icon,
      category: pack.category,
      difficulty: pack.difficulty,
      words: pack.words.join(", "),
      isActive: pack.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const wordsArray = formData.words
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    const user = getCurrentUser();

    if (editingPack) {
      updatePack(editingPack.id, {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        category: formData.category,
        difficulty: formData.difficulty,
        words: wordsArray,
        isActive: formData.isActive,
      });
    } else {
      createPack({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        category: formData.category,
        difficulty: formData.difficulty,
        words: wordsArray,
        isActive: formData.isActive,
        createdBy: user?.id || "admin",
      });
    }

    loadPacks();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deletePack(id);
    loadPacks();
    setDeleteConfirm(null);
  };

  const togglePackStatus = (pack: WordPack) => {
    updatePack(pack.id, { isActive: !pack.isActive });
    loadPacks();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelime Paketleri</h1>
          <p className="text-slate-500">Toplam {packs.length} paket</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200"
        >
          <Plus className="w-4 h-4" />
          Yeni Paket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Paket ara..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Tüm Kategoriler</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPacks.map((pack) => {
          const category = CATEGORIES.find((c) => c.id === pack.category);
          const difficulty = DIFFICULTIES.find((d) => d.id === pack.difficulty);

          return (
            <div
              key={pack.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-200">
                    {pack.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePackStatus(pack)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                        pack.isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {pack.isActive ? "✅ Aktif" : "⏸️ Pasif"}
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1">{pack.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{pack.description}</p>
              </div>

              {/* Stats */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-slate-600">
                      <BookOpen className="w-4 h-4" />
                      {pack.words.length} kelime
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      {category?.emoji} {category?.label}
                    </span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", difficulty?.color)}>
                    {difficulty?.label}
                  </span>
                </div>
              </div>

              {/* Words preview */}
              <div className="px-6 py-3 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5">
                  {pack.words.slice(0, 5).map((word, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium"
                    >
                      {word}
                    </span>
                  ))}
                  {pack.words.length > 5 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-xs">
                      +{pack.words.length - 5} daha
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(pack)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => setDeleteConfirm(pack.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPacks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Paket bulunamadı</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
          <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingPack ? "Paketi Düzenle" : "Yeni Paket"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">İkon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-2xl text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="📚">📚</option>
                    <option value="🌟">🌟</option>
                    <option value="🍕">🍕</option>
                    <option value="🐶">🐶</option>
                    <option value="🌳">🌳</option>
                    <option value="🏠">🏠</option>
                    <option value="🎮">🎮</option>
                    <option value="🎨">🎨</option>
                    <option value="🚗">🚗</option>
                    <option value="⚽">⚽</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Paket Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Temel Kelimeler"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Paket hakkında kısa bir açıklama..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zorluk</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff.id} value={diff.id}>
                        {diff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kelimeler <span className="text-slate-400">(virgülle ayırın)</span>
                </label>
                <textarea
                  value={formData.words}
                  onChange={(e) => setFormData({ ...formData, words: e.target.value })}
                  placeholder="elma, araba, ev, okul, kitap..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formData.words.split(",").filter((w) => w.trim()).length} kelime
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">Aktif paket</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  {editingPack ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Paketi Sil?</h3>
            <p className="text-slate-500 mb-6">Bu işlem geri alınamaz. Paket kalıcı olarak silinecek.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
