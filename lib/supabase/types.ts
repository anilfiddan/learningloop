export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin' | 'superadmin'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type LanguageCode = 'tr' | 'en'
export type AttemptVerdict = 'great' | 'close' | 'retry'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          preferred_language: LanguageCode
          total_practice: number
          total_words: number
          current_streak: number
          longest_streak: number
          quiz_high_score: number
          last_practice_date: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          preferred_language?: LanguageCode
          total_practice?: number
          total_words?: number
          current_streak?: number
          longest_streak?: number
          quiz_high_score?: number
          last_practice_date?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          preferred_language?: LanguageCode
          total_practice?: number
          total_words?: number
          current_streak?: number
          longest_streak?: number
          quiz_high_score?: number
          last_practice_date?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      words: {
        Row: {
          id: string
          user_id: string
          text: string
          lang: LanguageCode
          definition: string | null
          syllables: string[]
          word_audio_url: string | null
          syllable_audios: { syllable: string; audioUrl: string }[]
          visual_url: string | null
          visual_prompt: string | null
          coaching_tip: string | null
          is_favorite: boolean
          is_hard: boolean
          is_learned: boolean
          practice_count: number
          success_count: number
          last_practiced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          lang: LanguageCode
          definition?: string | null
          syllables?: string[]
          word_audio_url?: string | null
          syllable_audios?: { syllable: string; audioUrl: string }[]
          visual_url?: string | null
          visual_prompt?: string | null
          coaching_tip?: string | null
          is_favorite?: boolean
          is_hard?: boolean
          is_learned?: boolean
          practice_count?: number
          success_count?: number
          last_practiced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          lang?: LanguageCode
          definition?: string | null
          syllables?: string[]
          word_audio_url?: string | null
          syllable_audios?: { syllable: string; audioUrl: string }[]
          visual_url?: string | null
          visual_prompt?: string | null
          coaching_tip?: string | null
          is_favorite?: boolean
          is_hard?: boolean
          is_learned?: boolean
          practice_count?: number
          success_count?: number
          last_practiced_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          icon: string
          color: string | null
          word_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          icon?: string
          color?: string | null
          word_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string | null
          word_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      list_words: {
        Row: {
          id: string
          list_id: string
          word_id: string
          added_at: string
        }
        Insert: {
          id?: string
          list_id: string
          word_id: string
          added_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          word_id?: string
          added_at?: string
        }
      }
      packs: {
        Row: {
          id: string
          created_by: string | null
          name: string
          description: string | null
          icon: string
          category: string
          difficulty: DifficultyLevel
          words: string[]
          is_active: boolean
          is_featured: boolean
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by?: string | null
          name: string
          description?: string | null
          icon?: string
          category: string
          difficulty?: DifficultyLevel
          words?: string[]
          is_active?: boolean
          is_featured?: boolean
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string | null
          name?: string
          description?: string | null
          icon?: string
          category?: string
          difficulty?: DifficultyLevel
          words?: string[]
          is_active?: boolean
          is_featured?: boolean
          download_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      practice_attempts: {
        Row: {
          id: string
          user_id: string
          word_id: string
          recording_url: string | null
          transcript: string | null
          verdict: AttemptVerdict | null
          accuracy: number | null
          feedback: string | null
          syllable_checks: { syllable: string; correct: boolean }[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word_id: string
          recording_url?: string | null
          transcript?: string | null
          verdict?: AttemptVerdict | null
          accuracy?: number | null
          feedback?: string | null
          syllable_checks?: { syllable: string; correct: boolean }[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word_id?: string
          recording_url?: string | null
          transcript?: string | null
          verdict?: AttemptVerdict | null
          accuracy?: number | null
          feedback?: string | null
          syllable_checks?: { syllable: string; correct: boolean }[]
          created_at?: string
        }
      }
      hard_syllables: {
        Row: {
          id: string
          user_id: string
          syllable: string
          fail_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          syllable: string
          fail_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          syllable?: string
          fail_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_by?: string | null
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: string
          name: string
          email: string
          total_practice: number
          total_words: number
          current_streak: number
          longest_streak: number
          quiz_high_score: number
          word_count: number
          list_count: number
          attempt_count: number
        }
      }
      admin_stats: {
        Row: {
          total_users: number
          active_users: number
          new_users_today: number
          new_users_week: number
          total_words: number
          total_practices: number
          total_packs: number
          avg_practice_per_user: number
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_superadmin: {
        Args: Record<string, never>
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_entity_type?: string
          p_entity_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      difficulty_level: DifficultyLevel
      language_code: LanguageCode
      attempt_verdict: AttemptVerdict
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Word = Database['public']['Tables']['words']['Row']
export type List = Database['public']['Tables']['lists']['Row']
export type ListWord = Database['public']['Tables']['list_words']['Row']
export type Pack = Database['public']['Tables']['packs']['Row']
export type PracticeAttempt = Database['public']['Tables']['practice_attempts']['Row']
export type HardSyllable = Database['public']['Tables']['hard_syllables']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type WordInsert = Database['public']['Tables']['words']['Insert']
export type ListInsert = Database['public']['Tables']['lists']['Insert']
export type PackInsert = Database['public']['Tables']['packs']['Insert']
export type PracticeAttemptInsert = Database['public']['Tables']['practice_attempts']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type WordUpdate = Database['public']['Tables']['words']['Update']
export type ListUpdate = Database['public']['Tables']['lists']['Update']
export type PackUpdate = Database['public']['Tables']['packs']['Update']
