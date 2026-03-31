// Core data types for LearningLoop

export type Lang = "tr" | "en";
export type Level = "beginner" | "intermediate";
export type Verdict = "great" | "close" | "retry";

// WordItem - the core word entity
export interface WordItem {
  id: string;
  word: string;
  lang: Lang;
  syllables: string[];
  shortDefinition: string;
  coachTip: string;
  imageUrl?: string;
  imagePrompt?: string;
  level?: Level;
  tags?: string[];
  isFavorite?: boolean;
  isLearned?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Syllable check result from practice evaluation
export interface SyllableCheck {
  syllable: string;
  ok: boolean;
  hint: string;
}

// Practice attempt record
export interface PracticeAttempt {
  id: string;
  wordId: string;
  transcript: string;
  matchPct: number;
  verdict: Verdict;
  syllableChecks: SyllableCheck[];
  coachTip: string;
  durationMs?: number;
  pauses?: number;
  createdAt: string;
}

// Word list/collection
export interface WordList {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  wordIds: string[];
  createdAt: string;
  updatedAt?: string;
}

// History event types
export type HistoryEventType = "practiced" | "learned" | "added_to_list" | "created";

export interface HistoryEvent {
  id: string;
  wordId: string;
  event: HistoryEventType;
  attemptId?: string;
  listId?: string;
  createdAt: string;
}

// Practice evaluation request/response
export interface EvaluationRequest {
  targetWord: string;
  syllables: string[];
  transcript: string;
  matchPct: number;
  lang: Lang;
}

export interface EvaluationResponse {
  verdict: Verdict;
  syllableChecks: SyllableCheck[];
  coachTip: string;
}

// Strategy generation response
export interface StrategyResponse {
  syllables: string[];
  short_definition: string;
  coach_tip: string;
  image_prompt: string;
}

// UI State types
export type PracticeStep = "idle" | "recording" | "processing" | "result";

export interface PracticeState {
  step: PracticeStep;
  isRecording: boolean;
  audioBlob?: Blob;
  transcript?: string;
  matchPct?: number;
  evaluation?: EvaluationResponse;
  error?: string;
}
