import { Word, WordList, HistoryEvent } from "./data-types";

const WORDS_KEY = "ll_words";
const LISTS_KEY = "ll_lists";
const HISTORY_KEY = "ll_history";
const SEEDED_KEY = "ll_seeded";

// Generate unique ID using crypto for better randomness
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback with crypto.getRandomValues
  const arr = new Uint8Array(16);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(arr);
  }
  return `${Date.now()}-${Array.from(arr, b => b.toString(36)).join('').slice(0, 12)}`;
}

// WORDS
export function getWords(): Word[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(WORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWords(words: Word[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

export function getWord(id: string): Word | null {
  const words = getWords();
  return words.find((w) => w.id === id) || null;
}

export function addWord(word: Omit<Word, "id" | "createdAt">): Word {
  const words = getWords();
  const newWord: Word = {
    ...word,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  words.push(newWord);
  saveWords(words);
  addHistoryEvent(newWord.id, "created");
  return newWord;
}

export function updateWord(id: string, updates: Partial<Word>): Word | null {
  const words = getWords();
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return null;
  words[index] = { ...words[index], ...updates };
  saveWords(words);
  return words[index];
}

export function deleteWord(id: string): boolean {
  const words = getWords();
  const filtered = words.filter((w) => w.id !== id);
  if (filtered.length === words.length) return false;
  saveWords(filtered);
  return true;
}

// LISTS
export function getLists(): WordList[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LISTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLists(lists: WordList[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

export function getList(id: string): WordList | null {
  const lists = getLists();
  return lists.find((l) => l.id === id) || null;
}

export function addList(list: Omit<WordList, "id" | "createdAt">): WordList {
  const lists = getLists();
  const newList: WordList = {
    ...list,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  lists.push(newList);
  saveLists(lists);
  return newList;
}

export function updateList(id: string, updates: Partial<WordList>): WordList | null {
  const lists = getLists();
  const index = lists.findIndex((l) => l.id === id);
  if (index === -1) return null;
  lists[index] = { ...lists[index], ...updates };
  saveLists(lists);
  return lists[index];
}

export function deleteList(id: string): boolean {
  const lists = getLists();
  const filtered = lists.filter((l) => l.id !== id);
  if (filtered.length === lists.length) return false;
  saveLists(filtered);
  return true;
}

export function addWordToList(listId: string, wordId: string): boolean {
  const list = getList(listId);
  if (!list) return false;
  if (list.wordIds.includes(wordId)) return true;
  updateList(listId, { wordIds: [...list.wordIds, wordId] });
  addHistoryEvent(wordId, "added_to_list", { listId });
  return true;
}

export function removeWordFromList(listId: string, wordId: string): boolean {
  const list = getList(listId);
  if (!list) return false;
  updateList(listId, { wordIds: list.wordIds.filter((id) => id !== wordId) });
  return true;
}

// HISTORY
export function getHistory(): HistoryEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryEvent[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addHistoryEvent(
  wordId: string,
  event: HistoryEvent["event"],
  meta?: HistoryEvent["meta"]
): HistoryEvent {
  const history = getHistory();
  const newEvent: HistoryEvent = {
    id: generateId(),
    wordId,
    event,
    createdAt: new Date().toISOString(),
    meta,
  };
  history.unshift(newEvent);
  // Keep only last 100 events
  if (history.length > 100) {
    history.pop();
  }
  saveHistory(history);
  return newEvent;
}

// Mark word as practiced
export function markWordPracticed(wordId: string): void {
  updateWord(wordId, { lastPracticedAt: new Date().toISOString() });
  addHistoryEvent(wordId, "practiced");
}

// Mark word as learned
export function markWordLearned(wordId: string, isLearned: boolean): void {
  updateWord(wordId, { isLearned });
  if (isLearned) {
    addHistoryEvent(wordId, "learned");
  }
}

// SEED DATA
export function seedDefaultData(): void {
  if (typeof window === "undefined") return;
  
  // Check if already seeded
  if (localStorage.getItem(SEEDED_KEY)) return;

  // Turkish Nature words
  const turkishWords: Omit<Word, "id" | "createdAt">[] = [
    { text: "kuş", lang: "tr", level: "beginner", syllables: ["kuş"], definition: "Bird" },
    { text: "ağaç", lang: "tr", level: "beginner", syllables: ["a", "ğaç"], definition: "Tree" },
    { text: "deniz", lang: "tr", level: "beginner", syllables: ["de", "niz"], definition: "Sea" },
    { text: "rüzgar", lang: "tr", level: "intermediate", syllables: ["rüz", "gar"], definition: "Wind" },
    { text: "dağ", lang: "tr", level: "beginner", syllables: ["dağ"], definition: "Mountain" },
    { text: "güneş", lang: "tr", level: "beginner", syllables: ["gü", "neş"], definition: "Sun" },
    { text: "yıldız", lang: "tr", level: "intermediate", syllables: ["yıl", "dız"], definition: "Star" },
    { text: "çiçek", lang: "tr", level: "beginner", syllables: ["çi", "çek"], definition: "Flower" },
  ];

  // English words
  const englishWords: Omit<Word, "id" | "createdAt">[] = [
    { text: "water", lang: "en", level: "beginner", syllables: ["wa", "ter"], definition: "Su" },
    { text: "wind", lang: "en", level: "beginner", syllables: ["wind"], definition: "Rüzgar" },
    { text: "tree", lang: "en", level: "beginner", syllables: ["tree"], definition: "Ağaç" },
    { text: "mountain", lang: "en", level: "intermediate", syllables: ["moun", "tain"], definition: "Dağ" },
  ];

  // Add words
  const addedTurkishWords: Word[] = [];
  const addedEnglishWords: Word[] = [];

  turkishWords.forEach((w) => {
    addedTurkishWords.push(addWord(w));
  });

  englishWords.forEach((w) => {
    addedEnglishWords.push(addWord(w));
  });

  // Create Nature list (Turkish)
  addList({
    name: "Nature",
    description: "Turkish nature vocabulary",
    icon: "🌿",
    wordIds: addedTurkishWords.slice(0, 5).map((w) => w.id),
    autoGenerateMedia: true,
  });

  // Create Language list (English)
  addList({
    name: "English Basics",
    description: "Basic English words",
    icon: "🇬🇧",
    wordIds: addedEnglishWords.map((w) => w.id),
    autoGenerateMedia: true,
  });

  // Mark as seeded
  localStorage.setItem(SEEDED_KEY, "true");
}

// Get words by list
export function getWordsByList(listId: string): Word[] {
  const list = getList(listId);
  if (!list) return [];
  const words = getWords();
  return list.wordIds.map((id) => words.find((w) => w.id === id)).filter(Boolean) as Word[];
}

// Search words
export function searchWords(query: string): Word[] {
  const words = getWords();
  const q = query.toLowerCase();
  return words.filter(
    (w) =>
      w.text.toLowerCase().includes(q) ||
      w.definition?.toLowerCase().includes(q) ||
      w.tags?.some((t) => t.toLowerCase().includes(q))
  );
}

// Get recent words
export function getRecentWords(limit = 10): Word[] {
  const words = getWords();
  return words
    .filter((w) => w.lastPracticedAt)
    .sort((a, b) => new Date(b.lastPracticedAt!).getTime() - new Date(a.lastPracticedAt!).getTime())
    .slice(0, limit);
}

// Get learned words
export function getLearnedWords(): Word[] {
  return getWords().filter((w) => w.isLearned);
}

// Get favorite words
export function getFavoriteWords(): Word[] {
  return getWords().filter((w) => w.isFavorite);
}

// Get hard words
export function getHardWords(): Word[] {
  return getWords().filter((w) => w.isHard);
}
