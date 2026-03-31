/**
 * SM-2 Spaced Repetition Algorithm
 * Based on Piotr Wozniak's SuperMemo 2 algorithm
 */

import { Verdict } from "../types/word";

export interface SpacedRepetitionData {
  wordId: string;
  easeFactor: number;      // >= 1.3, starts at 2.5
  interval: number;        // days until next review
  repetitions: number;     // consecutive correct answers
  nextReviewDate: string;  // YYYY-MM-DD
  lastReviewDate: string;  // YYYY-MM-DD
}

/**
 * Map verdict + matchPct to SM-2 quality score (0-5)
 *   5 = perfect response
 *   4 = correct with hesitation
 *   3 = correct with difficulty
 *   2 = incorrect but easy to recall
 *   1 = incorrect
 *   0 = complete blackout
 */
export function verdictToQuality(verdict: Verdict, matchPct: number): number {
  if (verdict === "great") {
    return matchPct >= 90 ? 5 : 4;
  }
  if (verdict === "close") {
    return matchPct >= 60 ? 3 : 2;
  }
  // retry
  return matchPct >= 30 ? 1 : 0;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Add days to a date string and return YYYY-MM-DD
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * Create initial SR data for a new word
 */
export function createInitialSRData(wordId: string): SpacedRepetitionData {
  const today = todayString();
  return {
    wordId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: today,
    lastReviewDate: today,
  };
}

/**
 * Core SM-2 calculation
 *
 * @param current - Current SR parameters for the word
 * @param quality - Quality of response (0-5)
 * @returns Updated SR parameters
 */
export function calculateSM2(
  current: SpacedRepetitionData,
  quality: number
): SpacedRepetitionData {
  const today = todayString();
  let { easeFactor, interval, repetitions } = current;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect - reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const nextReviewDate = addDays(today, interval);

  return {
    wordId: current.wordId,
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: today,
  };
}

/**
 * Check if a word is considered "mastered" (interval >= 21 days)
 */
export function isMastered(data: SpacedRepetitionData): boolean {
  return data.interval >= 21;
}

/**
 * Check if a word is due for review today or earlier
 */
export function isDueToday(data: SpacedRepetitionData): boolean {
  return data.nextReviewDate <= todayString();
}
