import { WordItem, PracticeAttempt, WordList, HistoryEvent } from "../types/word";
import { updateAfterPractice, ensureSRData } from "../spaced-repetition/sr-store";

const WORDS_KEY = "ll_words_v2";
const ATTEMPTS_KEY = "ll_attempts";
const LISTS_KEY = "ll_lists_v2";
const HISTORY_KEY = "ll_history_v2";

// Generate unique ID using crypto for better randomness
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const arr = new Uint8Array(16);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(arr);
  }
  return `${Date.now()}-${Array.from(arr, b => b.toString(36)).join('').slice(0, 12)}`;
}

// ============ WORDS ============

export function getWords(): WordItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(WORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWords(words: WordItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

export function getWord(id: string): WordItem | null {
  const words = getWords();
  return words.find((w) => w.id === id) || null;
}

export function getWordByText(text: string): WordItem | null {
  const words = getWords();
  return words.find((w) => w.word.toLowerCase() === text.toLowerCase()) || null;
}

export function addWord(word: Omit<WordItem, "id" | "createdAt" | "updatedAt">): WordItem {
  const words = getWords();
  const now = new Date().toISOString();
  const newWord: WordItem = {
    ...word,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  words.push(newWord);
  saveWords(words);
  addHistoryEvent(newWord.id, "created");
  ensureSRData(newWord.id);
  return newWord;
}

export function updateWord(id: string, updates: Partial<WordItem>): WordItem | null {
  const words = getWords();
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return null;
  words[index] = { 
    ...words[index], 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  saveWords(words);
  return words[index];
}

export function deleteWord(id: string): boolean {
  const words = getWords();
  const filtered = words.filter((w) => w.id !== id);
  if (filtered.length === words.length) return false;
  saveWords(filtered);
  // Clean up SR data for deleted word
  import("../spaced-repetition/sr-store").then(m => m.deleteSRData(id));
  return true;
}

export function searchWords(query: string, lang?: string): WordItem[] {
  const words = getWords();
  const q = query.toLowerCase();
  return words.filter((w) => {
    const matchesQuery = w.word.toLowerCase().includes(q) ||
      w.shortDefinition?.toLowerCase().includes(q) ||
      w.tags?.some((t) => t.toLowerCase().includes(q));
    const matchesLang = !lang || w.lang === lang;
    return matchesQuery && matchesLang;
  });
}

export function getRecentWords(limit = 10): WordItem[] {
  const words = getWords();
  return words
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

// ============ PRACTICE ATTEMPTS ============

export function getAttempts(): PracticeAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ATTEMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAttempts(attempts: PracticeAttempt[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function addAttempt(attempt: Omit<PracticeAttempt, "id" | "createdAt">): PracticeAttempt {
  const attempts = getAttempts();
  const newAttempt: PracticeAttempt = {
    ...attempt,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  attempts.unshift(newAttempt);
  // Keep only last 500 attempts
  if (attempts.length > 500) {
    attempts.pop();
  }
  saveAttempts(attempts);
  addHistoryEvent(attempt.wordId, "practiced", newAttempt.id);
  updateAfterPractice(attempt.wordId, attempt.verdict, attempt.matchPct);
  return newAttempt;
}

export function getAttemptsByWord(wordId: string): PracticeAttempt[] {
  return getAttempts().filter((a) => a.wordId === wordId);
}

export function getRecentAttempts(limit = 20): PracticeAttempt[] {
  return getAttempts().slice(0, limit);
}

export function getAttemptsByDay(): Record<string, PracticeAttempt[]> {
  const attempts = getAttempts();
  const grouped: Record<string, PracticeAttempt[]> = {};
  
  attempts.forEach((attempt) => {
    const date = new Date(attempt.createdAt).toLocaleDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(attempt);
  });
  
  return grouped;
}

// ============ LISTS ============

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
  lists[index] = { 
    ...lists[index], 
    ...updates,
    updatedAt: new Date().toISOString(),
  };
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
  addHistoryEvent(wordId, "added_to_list", undefined, listId);
  return true;
}

export function removeWordFromList(listId: string, wordId: string): boolean {
  const list = getList(listId);
  if (!list) return false;
  updateList(listId, { wordIds: list.wordIds.filter((id) => id !== wordId) });
  return true;
}

export function getWordsByList(listId: string): WordItem[] {
  const list = getList(listId);
  if (!list) return [];
  const words = getWords();
  return list.wordIds
    .map((id) => words.find((w) => w.id === id))
    .filter(Boolean) as WordItem[];
}

// ============ HISTORY ============

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
  attemptId?: string,
  listId?: string
): HistoryEvent {
  const history = getHistory();
  const newEvent: HistoryEvent = {
    id: generateId(),
    wordId,
    event,
    attemptId,
    listId,
    createdAt: new Date().toISOString(),
  };
  history.unshift(newEvent);
  // Keep only last 200 events
  if (history.length > 200) {
    history.pop();
  }
  saveHistory(history);
  return newEvent;
}

export function getRecentHistory(limit = 50): HistoryEvent[] {
  return getHistory().slice(0, limit);
}

// ============ SEED DATA ============

export function seedDefaultData(): void {
  if (typeof window === "undefined") return;
  
  const SEEDED_KEY = "ll_seeded_v2";
  if (localStorage.getItem(SEEDED_KEY)) return;

  // Turkish words
  const turkishWords: Omit<WordItem, "id" | "createdAt" | "updatedAt">[] = [
    { 
      word: "kuş", 
      lang: "tr", 
      syllables: ["kuş"], 
      shortDefinition: "Gökyüzünde uçan tüylü hayvan",
      coachTip: "Dudaklarını yuvarlak tut, 'u' sesini uzat",
    },
    { 
      word: "ağaç", 
      lang: "tr", 
      syllables: ["a", "ğaç"], 
      shortDefinition: "Gövdesi ve dalları olan uzun bitki",
      coachTip: "'ğ' sesini yumuşak söyle, boğazdan gelsin",
    },
    { 
      word: "deniz", 
      lang: "tr", 
      syllables: ["de", "niz"], 
      shortDefinition: "Büyük tuzlu su kütlesi",
      coachTip: "Her heceyi eşit vurgula",
    },
    { 
      word: "güneş", 
      lang: "tr", 
      syllables: ["gü", "neş"], 
      shortDefinition: "Gökyüzündeki parlak ışık kaynağı",
      coachTip: "'ü' ve 'e' seslerini net ayır",
    },
    { 
      word: "çiçek", 
      lang: "tr", 
      syllables: ["çi", "çek"], 
      shortDefinition: "Renkli yaprakları olan bitki parçası",
      coachTip: "'ç' sesini dişlerin arkasından çıkar",
    },
  ];

  // English words
  const englishWords: Omit<WordItem, "id" | "createdAt" | "updatedAt">[] = [
    { 
      word: "water", 
      lang: "en", 
      syllables: ["wa", "ter"], 
      shortDefinition: "Clear liquid essential for life",
      coachTip: "Soften the 't' sound between syllables",
    },
    { 
      word: "mountain", 
      lang: "en", 
      syllables: ["moun", "tain"], 
      shortDefinition: "Large natural elevation of earth",
      coachTip: "The 'ai' sounds like 'i' in 'tin'",
    },
    { 
      word: "beautiful", 
      lang: "en", 
      syllables: ["beau", "ti", "ful"], 
      shortDefinition: "Pleasing to the senses",
      coachTip: "Stress the first syllable 'BEAU'",
    },
  ];

  // Add words
  const addedTurkish: WordItem[] = [];
  const addedEnglish: WordItem[] = [];

  turkishWords.forEach((w) => {
    addedTurkish.push(addWord(w));
  });

  englishWords.forEach((w) => {
    addedEnglish.push(addWord(w));
  });

  // Create lists
  addList({
    name: "Doğa",
    description: "Türkçe doğa kelimeleri",
    icon: "🌿",
    wordIds: addedTurkish.slice(0, 4).map((w) => w.id),
  });

  addList({
    name: "English Basics",
    description: "Common English words",
    icon: "🇬🇧",
    wordIds: addedEnglish.map((w) => w.id),
  });

  localStorage.setItem(SEEDED_KEY, "true");
}
