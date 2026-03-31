-- =====================================================
-- LEARNINGLOOP - SUPABASE DATABASE SCHEMA
-- Güvenli, ölçeklenebilir ve kalıcı veri yapısı
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE language_code AS ENUM ('tr', 'en');
CREATE TYPE attempt_verdict AS ENUM ('great', 'close', 'retry');

-- =====================================================
-- USERS TABLE
-- Ana kullanıcı tablosu - Supabase Auth ile entegre
-- =====================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    preferred_language language_code DEFAULT 'tr' NOT NULL,
    
    -- Stats
    total_practice INTEGER DEFAULT 0 NOT NULL,
    total_words INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    quiz_high_score INTEGER DEFAULT 0 NOT NULL,
    last_practice_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_name CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
);

-- Index for faster queries
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- =====================================================
-- WORDS TABLE
-- Kullanıcıların eklediği kelimeler
-- =====================================================

CREATE TABLE public.words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    text TEXT NOT NULL,
    lang language_code NOT NULL,
    definition TEXT,
    
    -- Syllables (JSON array)
    syllables JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Audio URLs (stored in Supabase Storage)
    word_audio_url TEXT,
    syllable_audios JSONB DEFAULT '[]'::jsonb,
    
    -- Visual (stored in Supabase Storage - KALICI)
    visual_url TEXT,
    visual_prompt TEXT,
    
    -- Coaching
    coaching_tip TEXT,
    
    -- User preferences
    is_favorite BOOLEAN DEFAULT false NOT NULL,
    is_hard BOOLEAN DEFAULT false NOT NULL,
    is_learned BOOLEAN DEFAULT false NOT NULL,
    
    -- Stats
    practice_count INTEGER DEFAULT 0 NOT NULL,
    success_count INTEGER DEFAULT 0 NOT NULL,
    last_practiced_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_text CHECK (char_length(text) >= 1 AND char_length(text) <= 100),
    CONSTRAINT unique_word_per_user UNIQUE (user_id, text, lang)
);

-- Indexes
CREATE INDEX idx_words_user_id ON public.words(user_id);
CREATE INDEX idx_words_text ON public.words(text);
CREATE INDEX idx_words_lang ON public.words(lang);
CREATE INDEX idx_words_is_favorite ON public.words(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_words_is_hard ON public.words(is_hard) WHERE is_hard = true;
CREATE INDEX idx_words_created_at ON public.words(created_at DESC);

-- =====================================================
-- LISTS TABLE
-- Kullanıcı listeleri (koleksiyonlar)
-- =====================================================

CREATE TABLE public.lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📚' NOT NULL,
    color TEXT DEFAULT '#6366f1',
    
    -- Stats
    word_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_list_name CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Indexes
CREATE INDEX idx_lists_user_id ON public.lists(user_id);
CREATE INDEX idx_lists_created_at ON public.lists(created_at DESC);

-- =====================================================
-- LIST_WORDS TABLE
-- Liste-kelime ilişkisi (many-to-many)
-- =====================================================

CREATE TABLE public.list_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_word_in_list UNIQUE (list_id, word_id)
);

-- Indexes
CREATE INDEX idx_list_words_list_id ON public.list_words(list_id);
CREATE INDEX idx_list_words_word_id ON public.list_words(word_id);

-- =====================================================
-- PACKS TABLE
-- Admin tarafından oluşturulan kelime paketleri
-- =====================================================

CREATE TABLE public.packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📚' NOT NULL,
    category TEXT NOT NULL,
    difficulty difficulty_level DEFAULT 'beginner' NOT NULL,
    
    -- Words (JSON array of strings)
    words JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    
    -- Stats
    download_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_pack_name CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Indexes
CREATE INDEX idx_packs_category ON public.packs(category);
CREATE INDEX idx_packs_difficulty ON public.packs(difficulty);
CREATE INDEX idx_packs_is_active ON public.packs(is_active) WHERE is_active = true;
CREATE INDEX idx_packs_is_featured ON public.packs(is_featured) WHERE is_featured = true;

-- =====================================================
-- PRACTICE_ATTEMPTS TABLE
-- Pratik denemeleri ve sonuçları
-- =====================================================

CREATE TABLE public.practice_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
    
    -- Recording (stored in Supabase Storage)
    recording_url TEXT,
    
    -- Evaluation
    transcript TEXT,
    verdict attempt_verdict,
    accuracy INTEGER CHECK (accuracy >= 0 AND accuracy <= 100),
    feedback TEXT,
    
    -- Syllable checks (JSON array)
    syllable_checks JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_accuracy CHECK (accuracy IS NULL OR (accuracy >= 0 AND accuracy <= 100))
);

-- Indexes
CREATE INDEX idx_attempts_user_id ON public.practice_attempts(user_id);
CREATE INDEX idx_attempts_word_id ON public.practice_attempts(word_id);
CREATE INDEX idx_attempts_created_at ON public.practice_attempts(created_at DESC);
CREATE INDEX idx_attempts_verdict ON public.practice_attempts(verdict);

-- =====================================================
-- HARD_SYLLABLES TABLE
-- Kullanıcının zor bulduğu heceler
-- =====================================================

CREATE TABLE public.hard_syllables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    syllable TEXT NOT NULL,
    fail_count INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_syllable_per_user UNIQUE (user_id, syllable)
);

-- Indexes
CREATE INDEX idx_hard_syllables_user_id ON public.hard_syllables(user_id);
CREATE INDEX idx_hard_syllables_fail_count ON public.hard_syllables(fail_count DESC);

-- =====================================================
-- SITE_SETTINGS TABLE
-- Site ayarları (sadece adminler)
-- =====================================================

CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Default settings
INSERT INTO public.site_settings (key, value) VALUES
    ('general', '{"siteName": "LearningLoop", "siteDescription": "Çocuklar için eğlenceli kelime öğrenme platformu", "defaultLanguage": "tr"}'::jsonb),
    ('security', '{"maintenanceMode": false, "allowRegistration": true}'::jsonb),
    ('limits', '{"maxWordsPerUser": 500, "maxListsPerUser": 20}'::jsonb),
    ('features', '{"quiz": true, "packs": true, "visualCue": true, "practiceCoach": true}'::jsonb);

-- =====================================================
-- ACTIVITY_LOG TABLE
-- Kullanıcı aktivite logları (audit trail)
-- =====================================================

CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_action ON public.activity_log(action);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Partition by month for better performance (optional)
-- CREATE INDEX idx_activity_log_created_at_month ON public.activity_log(date_trunc('month', created_at));

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update list word count
CREATE OR REPLACE FUNCTION update_list_word_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.lists SET word_count = word_count + 1 WHERE id = NEW.list_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.lists SET word_count = word_count - 1 WHERE id = OLD.list_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update user stats after practice
CREATE OR REPLACE FUNCTION update_user_stats_after_practice()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_last_practice DATE;
    v_current_streak INTEGER;
BEGIN
    v_user_id := NEW.user_id;
    
    -- Get current user stats
    SELECT last_practice_date, current_streak INTO v_last_practice, v_current_streak
    FROM public.profiles WHERE id = v_user_id;
    
    -- Update practice count
    UPDATE public.profiles 
    SET total_practice = total_practice + 1,
        last_practice_date = CURRENT_DATE,
        current_streak = CASE 
            WHEN v_last_practice = CURRENT_DATE - INTERVAL '1 day' THEN v_current_streak + 1
            WHEN v_last_practice = CURRENT_DATE THEN v_current_streak
            ELSE 1
        END,
        longest_streak = GREATEST(longest_streak, 
            CASE 
                WHEN v_last_practice = CURRENT_DATE - INTERVAL '1 day' THEN v_current_streak + 1
                WHEN v_last_practice = CURRENT_DATE THEN v_current_streak
                ELSE 1
            END
        )
    WHERE id = v_user_id;
    
    -- Update word stats
    UPDATE public.words 
    SET practice_count = practice_count + 1,
        success_count = success_count + CASE WHEN NEW.verdict = 'great' THEN 1 ELSE 0 END,
        last_practiced_at = NOW()
    WHERE id = NEW.word_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON public.words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON public.lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packs_updated_at BEFORE UPDATE ON public.packs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hard_syllables_updated_at BEFORE UPDATE ON public.hard_syllables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- List word count trigger
CREATE TRIGGER update_list_word_count_trigger
    AFTER INSERT OR DELETE ON public.list_words
    FOR EACH ROW EXECUTE FUNCTION update_list_word_count();

-- Practice stats trigger
CREATE TRIGGER update_stats_after_practice_trigger
    AFTER INSERT ON public.practice_attempts
    FOR EACH ROW EXECUTE FUNCTION update_user_stats_after_practice();

-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Güvenlik politikaları - HİÇBİR AÇIK BIRAKILMADI
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hard_syllables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Superadmins can update any profile
CREATE POLICY "Superadmins can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- =====================================================
-- WORDS POLICIES
-- =====================================================

-- Users can view their own words
CREATE POLICY "Users can view own words"
    ON public.words FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own words
CREATE POLICY "Users can insert own words"
    ON public.words FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own words
CREATE POLICY "Users can update own words"
    ON public.words FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own words
CREATE POLICY "Users can delete own words"
    ON public.words FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can view all words (for analytics)
CREATE POLICY "Admins can view all words"
    ON public.words FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- =====================================================
-- LISTS POLICIES
-- =====================================================

-- Users can view their own lists
CREATE POLICY "Users can view own lists"
    ON public.lists FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own lists
CREATE POLICY "Users can insert own lists"
    ON public.lists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own lists
CREATE POLICY "Users can update own lists"
    ON public.lists FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own lists
CREATE POLICY "Users can delete own lists"
    ON public.lists FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- LIST_WORDS POLICIES
-- =====================================================

-- Users can view list_words for their own lists
CREATE POLICY "Users can view own list_words"
    ON public.list_words FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lists 
            WHERE id = list_id AND user_id = auth.uid()
        )
    );

-- Users can insert list_words for their own lists and words
CREATE POLICY "Users can insert own list_words"
    ON public.list_words FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lists 
            WHERE id = list_id AND user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM public.words 
            WHERE id = word_id AND user_id = auth.uid()
        )
    );

-- Users can delete list_words from their own lists
CREATE POLICY "Users can delete own list_words"
    ON public.list_words FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.lists 
            WHERE id = list_id AND user_id = auth.uid()
        )
    );

-- =====================================================
-- PACKS POLICIES
-- =====================================================

-- Everyone can view active packs
CREATE POLICY "Everyone can view active packs"
    ON public.packs FOR SELECT
    USING (is_active = true);

-- Admins can view all packs
CREATE POLICY "Admins can view all packs"
    ON public.packs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Admins can insert packs
CREATE POLICY "Admins can insert packs"
    ON public.packs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Admins can update packs
CREATE POLICY "Admins can update packs"
    ON public.packs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Superadmins can delete packs
CREATE POLICY "Superadmins can delete packs"
    ON public.packs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- =====================================================
-- PRACTICE_ATTEMPTS POLICIES
-- =====================================================

-- Users can view their own attempts
CREATE POLICY "Users can view own attempts"
    ON public.practice_attempts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts"
    ON public.practice_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all attempts (for analytics)
CREATE POLICY "Admins can view all attempts"
    ON public.practice_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- =====================================================
-- HARD_SYLLABLES POLICIES
-- =====================================================

-- Users can view their own hard syllables
CREATE POLICY "Users can view own hard_syllables"
    ON public.hard_syllables FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own hard syllables
CREATE POLICY "Users can insert own hard_syllables"
    ON public.hard_syllables FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own hard syllables
CREATE POLICY "Users can update own hard_syllables"
    ON public.hard_syllables FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own hard syllables
CREATE POLICY "Users can delete own hard_syllables"
    ON public.hard_syllables FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- SITE_SETTINGS POLICIES
-- =====================================================

-- Everyone can read settings
CREATE POLICY "Everyone can read settings"
    ON public.site_settings FOR SELECT
    USING (true);

-- Only superadmins can update settings
CREATE POLICY "Superadmins can update settings"
    ON public.site_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- =====================================================
-- ACTIVITY_LOG POLICIES
-- =====================================================

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
    ON public.activity_log FOR SELECT
    USING (auth.uid() = user_id);

-- System can insert activity (via service role)
CREATE POLICY "System can insert activity"
    ON public.activity_log FOR INSERT
    WITH CHECK (true);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
    ON public.activity_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- =====================================================
-- STORAGE BUCKETS
-- Resimler için kalıcı depolama
-- =====================================================

-- Bu kısım Supabase Dashboard'dan veya API ile oluşturulmalı:
-- 1. 'visuals' bucket - Kelime görselleri (KALICI, SİLİNMEZ)
-- 2. 'recordings' bucket - Ses kayıtları
-- 3. 'avatars' bucket - Kullanıcı avatarları

-- Storage policies (SQL ile oluşturulamaz, Dashboard'dan yapılmalı)
-- Visuals bucket: 
--   - SELECT: authenticated users can read their own files
--   - INSERT: authenticated users can upload to their own folder
--   - DELETE: DISABLED (kalıcı)

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- User stats view
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    p.id,
    p.name,
    p.email,
    p.total_practice,
    p.total_words,
    p.current_streak,
    p.longest_streak,
    p.quiz_high_score,
    COUNT(DISTINCT w.id) as word_count,
    COUNT(DISTINCT l.id) as list_count,
    COUNT(DISTINCT pa.id) as attempt_count
FROM public.profiles p
LEFT JOIN public.words w ON w.user_id = p.id
LEFT JOIN public.lists l ON l.user_id = p.id
LEFT JOIN public.practice_attempts pa ON pa.user_id = p.id
GROUP BY p.id;

-- Admin dashboard stats view
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.profiles WHERE is_active = true) as active_users,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE) as new_users_today,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
    (SELECT COUNT(*) FROM public.words) as total_words,
    (SELECT COUNT(*) FROM public.practice_attempts) as total_practices,
    (SELECT COUNT(*) FROM public.packs WHERE is_active = true) as total_packs,
    (SELECT COALESCE(AVG(total_practice), 0) FROM public.profiles) as avg_practice_per_user;

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'superadmin'
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, metadata)
    VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default superadmin (password will be set via Supabase Auth)
-- This should be done after the first user signs up and manually promoted

-- Default packs
INSERT INTO public.packs (name, description, icon, category, difficulty, words, is_active, is_featured) VALUES
    ('Temel Kelimeler', 'Günlük hayatta en çok kullanılan kelimeler', '📚', 'general', 'beginner', '["elma", "araba", "ev", "okul", "kitap", "kalem", "masa", "sandalye", "kapı", "pencere"]'::jsonb, true, true),
    ('Hayvanlar', 'Sevimli hayvan isimleri', '🐶', 'animals', 'beginner', '["kedi", "köpek", "kuş", "balık", "tavşan", "at", "inek", "koyun", "tavuk", "ördek"]'::jsonb, true, true),
    ('Yiyecekler', 'Lezzetli yiyecek isimleri', '🍕', 'food', 'beginner', '["ekmek", "süt", "peynir", "yumurta", "meyve", "sebze", "et", "balık", "pilav", "makarna"]'::jsonb, true, false),
    ('Renkler', 'Gökkuşağı renkleri', '🌈', 'general', 'beginner', '["kırmızı", "mavi", "yeşil", "sarı", "turuncu", "mor", "pembe", "beyaz", "siyah", "kahverengi"]'::jsonb, true, false),
    ('Sayılar', 'Temel sayılar', '🔢', 'general', 'beginner', '["bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on"]'::jsonb, true, false),
    ('Aile', 'Aile üyeleri', '👨‍👩‍👧‍👦', 'general', 'beginner', '["anne", "baba", "kardeş", "abla", "ağabey", "dede", "nine", "teyze", "amca", "kuzen"]'::jsonb, true, false),
    ('Doğa', 'Doğadaki güzellikler', '🌳', 'nature', 'intermediate', '["ağaç", "çiçek", "göl", "dağ", "deniz", "orman", "nehir", "bulut", "güneş", "ay"]'::jsonb, true, false),
    ('Okul Malzemeleri', 'Okul çantasındakiler', '🎒', 'school', 'beginner', '["defter", "silgi", "cetvel", "makas", "yapıştırıcı", "boya", "fırça", "çanta", "önlük", "ayakkabı"]'::jsonb, true, false);

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant access to sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
