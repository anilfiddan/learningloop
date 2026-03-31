export interface WordAttempt {
  id: string;
  createdAt: string;
  audioUrl: string;
  transcript?: string;
  matchPct?: number;
  durationSec?: number;
  pauses?: number;
}

export interface WordMedia {
  imageUrl?: string;
  videoUrl?: string;
  tts?: {
    syllableSlowUrls?: string[];
    wordNormalUrl?: string;
  };
}

export interface Word {
  id: string;
  text: string;
  lang: "tr" | "en";
  level: "beginner" | "intermediate";
  syllables: string[];
  definition?: string;
  createdAt: string;
  lastPracticedAt?: string;
  isLearned?: boolean;
  isFavorite?: boolean;
  isHard?: boolean;
  tags?: string[];
  media?: WordMedia;
  attempts?: WordAttempt[];
}

export interface WordList {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  wordIds: string[];
  autoGenerateMedia?: boolean;
  createdAt: string;
}

export interface HistoryEvent {
  id: string;
  wordId: string;
  event: "practiced" | "learned" | "added_to_list" | "created";
  createdAt: string;
  meta?: {
    listId?: string;
    attemptId?: string;
  };
}
