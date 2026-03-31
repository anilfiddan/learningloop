/**
 * Spaced Repetition localStorage Store
 */

import { Verdict } from "../types/word";
import {
  SpacedRepetitionData,
  createInitialSRData,
  calculateSM2,
  verdictToQuality,
  todayString,
  isDueToday,
  isMastered,
} from "./sm2";

const SR_KEY = "ll_sr_data";
const SR_MIGRATED_KEY = "ll_sr_migrated";

// ============ CRUD ============

export function getSRDataMap(): Record<string, SpacedRepetitionData> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(SR_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveSRDataMap(map: Record<string, SpacedRepetitionData>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SR_KEY, JSON.stringify(map));
}

export function getSRData(wordId: string): SpacedRepetitionData | null {
  const map = getSRDataMap();
  return map[wordId] || null;
}

export function saveSRData(data: SpacedRepetitionData): void {
  const map = getSRDataMap();
  map[data.wordId] = data;
  saveSRDataMap(map);
}

export function deleteSRData(wordId: string): void {
  const map = getSRDataMap();
  delete map[wordId];
  saveSRDataMap(map);
}

// ============ QUERIES ============

/**
 * Get all words due for review today (or overdue)
 */
export function getWordsDueToday(): SpacedRepetitionData[] {
  const map = getSRDataMap();
  return Object.values(map).filter(isDueToday);
}

/**
 * Get words due within the next N days (excluding today)
 */
export function getWordsDueInDays(days: number): SpacedRepetitionData[] {
  const today = todayString();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  const futureDateStr = futureDate.toISOString().split("T")[0];

  const map = getSRDataMap();
  return Object.values(map).filter(
    (d) => d.nextReviewDate > today && d.nextReviewDate <= futureDateStr
  );
}

/**
 * Get mastered words (interval >= 21 days)
 */
export function getMasteredWords(): SpacedRepetitionData[] {
  const map = getSRDataMap();
  return Object.values(map).filter(isMastered);
}

/**
 * Get total word count with SR data
 */
export function getTotalSRWords(): number {
  return Object.keys(getSRDataMap()).length;
}

// ============ PRACTICE INTEGRATION ============

/**
 * Update SR data after a practice attempt
 * This is the main integration point called from word-store.addAttempt
 */
export function updateAfterPractice(
  wordId: string,
  verdict: Verdict,
  matchPct: number
): SpacedRepetitionData {
  let current = getSRData(wordId);
  if (!current) {
    current = createInitialSRData(wordId);
  }

  const quality = verdictToQuality(verdict, matchPct);
  const updated = calculateSM2(current, quality);
  saveSRData(updated);
  return updated;
}

/**
 * Ensure a word has SR data (called when adding new words)
 */
export function ensureSRData(wordId: string): SpacedRepetitionData {
  let data = getSRData(wordId);
  if (!data) {
    data = createInitialSRData(wordId);
    saveSRData(data);
  }
  return data;
}

// ============ MIGRATION ============

/**
 * Initialize SR data for existing words that don't have it yet
 * Called once on first load
 */
export function migrateExistingWords(wordIds: string[]): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SR_MIGRATED_KEY)) return;

  const map = getSRDataMap();
  let changed = false;

  for (const id of wordIds) {
    if (!map[id]) {
      map[id] = createInitialSRData(id);
      changed = true;
    }
  }

  if (changed) {
    saveSRDataMap(map);
  }
  localStorage.setItem(SR_MIGRATED_KEY, "true");
}
