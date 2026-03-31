export type Level = 'beginner' | 'intermediate';

export type PipelineStep = 'idle' | 'strategy' | 'audio' | 'visual' | 'video' | 'ready';

export interface StrategyResult {
  word: string;
  syllables: string[];
  definition: string;
  coachingTip: string;
  level: Level;
}

export interface AudioResult {
  syllableAudios: { syllable: string; audioUrl: string }[];
  wordAudioUrl: string;
  isFallback: boolean;
}

export interface VisualResult {
  imageUrl: string;
  isFallback: boolean;
}

export interface VideoResult {
  videoUrl: string;
  isFallback: boolean;
}

export interface GenerationState {
  step: PipelineStep;
  strategy: StrategyResult | null;
  audio: AudioResult | null;
  visual: VisualResult | null;
  video: VideoResult | null;
  error: string | null;
}

export interface RecordingMetrics {
  duration: number;
  pauseCount: number;
  attemptNumber: number;
}

export interface PracticeSession {
  word: string;
  syllables: string[];
  attempts: RecordingMetrics[];
  hardSyllables: string[];
  timestamp: Date;
}

export interface ProgressData {
  dailyCounts: { date: string; count: number }[];
  streak: number;
  hardSyllables: { syllable: string; count: number }[];
}
