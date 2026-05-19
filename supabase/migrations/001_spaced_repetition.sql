-- =====================================================
-- MIGRATION 001: Spaced Repetition & User Settings
-- Aralıklı tekrar sistemi, quiz skorları, kullanıcı ayarları
-- =====================================================

-- =====================================================
-- SPACED REPETITION TABLE
-- SM-2 algoritması verileri
-- =====================================================

CREATE TABLE public.spaced_repetition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,

    -- SM-2 Parameters
    ease_factor NUMERIC(4,2) DEFAULT 2.50 NOT NULL CHECK (ease_factor >= 1.30),
    interval_days INTEGER DEFAULT 0 NOT NULL CHECK (interval_days >= 0),
    repetitions INTEGER DEFAULT 0 NOT NULL CHECK (repetitions >= 0),

    -- Schedule
    next_review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_review_date DATE DEFAULT CURRENT_DATE,

    -- Status
    is_mastered BOOLEAN DEFAULT false NOT NULL,
    total_reviews INTEGER DEFAULT 0 NOT NULL,
    correct_reviews INTEGER DEFAULT 0 NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_sr_per_user_word UNIQUE (user_id, word_id)
);

-- Indexes
CREATE INDEX idx_sr_user_id ON public.spaced_repetition(user_id);
CREATE INDEX idx_sr_word_id ON public.spaced_repetition(word_id);
CREATE INDEX idx_sr_next_review ON public.spaced_repetition(user_id, next_review_date);
CREATE INDEX idx_sr_is_mastered ON public.spaced_repetition(user_id, is_mastered) WHERE is_mastered = false;

-- Trigger for updated_at
CREATE TRIGGER update_sr_updated_at BEFORE UPDATE ON public.spaced_repetition
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- QUIZ SCORES TABLE
-- Quiz oyunu yüksek skorları ve istatistikleri
-- =====================================================

CREATE TABLE public.quiz_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Score
    score INTEGER NOT NULL CHECK (score >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0 AND correct_answers <= total_questions),

    -- Game details
    category TEXT,
    difficulty difficulty_level DEFAULT 'beginner' NOT NULL,
    duration_seconds INTEGER CHECK (duration_seconds > 0),
    hints_used INTEGER DEFAULT 0 NOT NULL,
    lives_remaining INTEGER DEFAULT 0 NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_quiz_scores_user_id ON public.quiz_scores(user_id);
CREATE INDEX idx_quiz_scores_score ON public.quiz_scores(score DESC);
CREATE INDEX idx_quiz_scores_created_at ON public.quiz_scores(created_at DESC);
CREATE INDEX idx_quiz_scores_category ON public.quiz_scores(category);

-- =====================================================
-- USER SETTINGS TABLE
-- Kullanıcı tercihleri (localStorage yerine kalıcı)
-- =====================================================

CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Speech settings
    speech_speed NUMERIC(3,2) DEFAULT 1.00 NOT NULL CHECK (speech_speed >= 0.50 AND speech_speed <= 2.00),
    preferred_level difficulty_level DEFAULT 'beginner' NOT NULL,
    auto_play_audio BOOLEAN DEFAULT true NOT NULL,
    show_definitions BOOLEAN DEFAULT true NOT NULL,

    -- UI preferences
    theme TEXT DEFAULT 'system' NOT NULL CHECK (theme IN ('light', 'dark', 'system')),
    compact_mode BOOLEAN DEFAULT false NOT NULL,

    -- Notification preferences
    daily_reminder BOOLEAN DEFAULT false NOT NULL,
    reminder_time TIME DEFAULT '09:00:00',
    streak_notifications BOOLEAN DEFAULT true NOT NULL,

    -- Practice preferences
    daily_goal INTEGER DEFAULT 5 NOT NULL CHECK (daily_goal >= 1 AND daily_goal <= 100),
    preferred_practice_mode TEXT DEFAULT 'standard' NOT NULL CHECK (preferred_practice_mode IN ('standard', 'quick', 'intensive')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DAILY STREAKS TABLE
-- Günlük pratik serileri (detaylı takip)
-- =====================================================

CREATE TABLE public.daily_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    practice_date DATE NOT NULL,
    word_count INTEGER DEFAULT 0 NOT NULL,
    attempt_count INTEGER DEFAULT 0 NOT NULL,
    average_accuracy NUMERIC(5,2) DEFAULT 0 NOT NULL,
    practice_duration_seconds INTEGER DEFAULT 0 NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_streak_per_day UNIQUE (user_id, practice_date)
);

-- Indexes
CREATE INDEX idx_daily_streaks_user_id ON public.daily_streaks(user_id);
CREATE INDEX idx_daily_streaks_date ON public.daily_streaks(user_id, practice_date DESC);

-- Trigger for updated_at
CREATE TRIGGER update_daily_streaks_updated_at BEFORE UPDATE ON public.daily_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTIFICATIONS TABLE
-- Kullanıcı bildirimleri
-- =====================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    type TEXT NOT NULL CHECK (type IN ('streak', 'achievement', 'reminder', 'system', 'pack_new')),
    title TEXT NOT NULL,
    body TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    is_read BOOLEAN DEFAULT false NOT NULL,
    read_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- ACHIEVEMENTS TABLE
-- Kullanıcı başarıları / rozetleri
-- =====================================================

CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Achievement definition
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT NOT NULL,
    description_en TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🏆',
    category TEXT NOT NULL CHECK (category IN ('streak', 'practice', 'words', 'quiz', 'special')),

    -- Requirements
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak_days', 'total_practice', 'total_words', 'quiz_score', 'accuracy', 'custom')),
    requirement_value INTEGER NOT NULL,

    -- Display
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- USER_ACHIEVEMENTS TABLE
-- Kullanıcının kazandığı başarılar
-- =====================================================

CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,

    earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT unique_achievement_per_user UNIQUE (user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- =====================================================
-- FEEDBACK TABLE
-- Kullanıcı geri bildirimleri
-- =====================================================

CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general', 'praise')),
    message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 2000),

    -- Admin response
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_response TEXT,
    responded_by UUID REFERENCES public.profiles(id),
    responded_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_status ON public.feedback(status);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update spaced repetition after practice
CREATE OR REPLACE FUNCTION update_spaced_repetition(
    p_user_id UUID,
    p_word_id UUID,
    p_verdict attempt_verdict,
    p_accuracy INTEGER
)
RETURNS public.spaced_repetition AS $$
DECLARE
    v_sr public.spaced_repetition;
    v_quality INTEGER;
    v_new_ef NUMERIC(4,2);
    v_new_interval INTEGER;
    v_new_reps INTEGER;
BEGIN
    -- Map verdict to quality (0-5)
    v_quality := CASE
        WHEN p_verdict = 'great' AND p_accuracy >= 90 THEN 5
        WHEN p_verdict = 'great' THEN 4
        WHEN p_verdict = 'close' AND p_accuracy >= 60 THEN 3
        WHEN p_verdict = 'close' THEN 2
        WHEN p_accuracy >= 30 THEN 1
        ELSE 0
    END;

    -- Get or create SR data
    SELECT * INTO v_sr FROM public.spaced_repetition
    WHERE user_id = p_user_id AND word_id = p_word_id;

    IF NOT FOUND THEN
        INSERT INTO public.spaced_repetition (user_id, word_id)
        VALUES (p_user_id, p_word_id)
        RETURNING * INTO v_sr;
    END IF;

    -- Calculate new ease factor
    v_new_ef := v_sr.ease_factor + (0.1 - (5 - v_quality) * (0.08 + (5 - v_quality) * 0.02));
    IF v_new_ef < 1.30 THEN v_new_ef := 1.30; END IF;

    -- Calculate new interval and repetitions
    IF v_quality >= 3 THEN
        IF v_sr.repetitions = 0 THEN
            v_new_interval := 1;
        ELSIF v_sr.repetitions = 1 THEN
            v_new_interval := 6;
        ELSE
            v_new_interval := ROUND(v_sr.interval_days * v_new_ef);
        END IF;
        v_new_reps := v_sr.repetitions + 1;
    ELSE
        v_new_interval := 1;
        v_new_reps := 0;
    END IF;

    -- Update SR record
    UPDATE public.spaced_repetition
    SET ease_factor = ROUND(v_new_ef::numeric, 2),
        interval_days = v_new_interval,
        repetitions = v_new_reps,
        next_review_date = CURRENT_DATE + v_new_interval,
        last_review_date = CURRENT_DATE,
        is_mastered = (v_new_interval >= 21),
        total_reviews = total_reviews + 1,
        correct_reviews = correct_reviews + CASE WHEN v_quality >= 3 THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE id = v_sr.id
    RETURNING * INTO v_sr;

    RETURN v_sr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get today's review queue for a user
CREATE OR REPLACE FUNCTION get_review_queue(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    word_id UUID,
    word_text TEXT,
    word_lang language_code,
    syllables JSONB,
    ease_factor NUMERIC,
    interval_days INTEGER,
    repetitions INTEGER,
    next_review_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sr.word_id,
        w.text,
        w.lang,
        w.syllables,
        sr.ease_factor,
        sr.interval_days,
        sr.repetitions,
        sr.next_review_date
    FROM public.spaced_repetition sr
    JOIN public.words w ON w.id = sr.word_id
    WHERE sr.user_id = p_user_id
        AND sr.next_review_date <= CURRENT_DATE
        AND sr.is_mastered = false
    ORDER BY sr.next_review_date ASC, sr.ease_factor ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update daily streak
CREATE OR REPLACE FUNCTION update_daily_streak(
    p_user_id UUID,
    p_accuracy NUMERIC DEFAULT 0,
    p_duration_seconds INTEGER DEFAULT 0
)
RETURNS public.daily_streaks AS $$
DECLARE
    v_streak public.daily_streaks;
BEGIN
    INSERT INTO public.daily_streaks (user_id, practice_date, word_count, attempt_count, average_accuracy, practice_duration_seconds)
    VALUES (p_user_id, CURRENT_DATE, 1, 1, p_accuracy, p_duration_seconds)
    ON CONFLICT (user_id, practice_date)
    DO UPDATE SET
        word_count = public.daily_streaks.word_count + 1,
        attempt_count = public.daily_streaks.attempt_count + 1,
        average_accuracy = (public.daily_streaks.average_accuracy * public.daily_streaks.attempt_count + p_accuracy) / (public.daily_streaks.attempt_count + 1),
        practice_duration_seconds = public.daily_streaks.practice_duration_seconds + p_duration_seconds,
        updated_at = NOW()
    RETURNING * INTO v_streak;

    RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS SETOF public.user_achievements AS $$
DECLARE
    v_achievement RECORD;
    v_profile public.profiles;
    v_earned public.user_achievements;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

    FOR v_achievement IN SELECT * FROM public.achievements WHERE is_active = true LOOP
        -- Skip if already earned
        IF EXISTS (SELECT 1 FROM public.user_achievements WHERE user_id = p_user_id AND achievement_id = v_achievement.id) THEN
            CONTINUE;
        END IF;

        -- Check requirements
        IF (v_achievement.requirement_type = 'streak_days' AND v_profile.current_streak >= v_achievement.requirement_value)
            OR (v_achievement.requirement_type = 'total_practice' AND v_profile.total_practice >= v_achievement.requirement_value)
            OR (v_achievement.requirement_type = 'total_words' AND v_profile.total_words >= v_achievement.requirement_value)
            OR (v_achievement.requirement_type = 'quiz_score' AND v_profile.quiz_high_score >= v_achievement.requirement_value)
        THEN
            INSERT INTO public.user_achievements (user_id, achievement_id)
            VALUES (p_user_id, v_achievement.id)
            RETURNING * INTO v_earned;

            -- Create notification
            INSERT INTO public.notifications (user_id, type, title, body, metadata)
            VALUES (
                p_user_id,
                'achievement',
                v_achievement.icon || ' ' || v_achievement.name,
                v_achievement.description,
                jsonb_build_object('achievement_id', v_achievement.id, 'slug', v_achievement.slug)
            );

            RETURN NEXT v_earned;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.spaced_repetition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- SPACED REPETITION POLICIES
CREATE POLICY "Users can view own SR data"
    ON public.spaced_repetition FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SR data"
    ON public.spaced_repetition FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SR data"
    ON public.spaced_repetition FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own SR data"
    ON public.spaced_repetition FOR DELETE
    USING (auth.uid() = user_id);

-- QUIZ SCORES POLICIES
CREATE POLICY "Users can view own quiz scores"
    ON public.quiz_scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz scores"
    ON public.quiz_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz scores"
    ON public.quiz_scores FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- USER SETTINGS POLICIES
CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- DAILY STREAKS POLICIES
CREATE POLICY "Users can view own streaks"
    ON public.daily_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
    ON public.daily_streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
    ON public.daily_streaks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all streaks"
    ON public.daily_streaks FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- ACHIEVEMENTS POLICIES
CREATE POLICY "Everyone can view achievements"
    ON public.achievements FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage achievements"
    ON public.achievements FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- USER ACHIEVEMENTS POLICIES
CREATE POLICY "Users can view own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (true);

-- FEEDBACK POLICIES
CREATE POLICY "Users can view own feedback"
    ON public.feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback"
    ON public.feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
    ON public.feedback FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Admins can update feedback"
    ON public.feedback FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- =====================================================
-- GRANTS
-- =====================================================

GRANT SELECT ON public.spaced_repetition TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.spaced_repetition TO authenticated;
GRANT SELECT ON public.quiz_scores TO authenticated;
GRANT INSERT ON public.quiz_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_streaks TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT INSERT ON public.notifications TO authenticated;
GRANT SELECT ON public.achievements TO anon, authenticated;
GRANT SELECT ON public.user_achievements TO authenticated;
GRANT INSERT ON public.user_achievements TO authenticated;
GRANT SELECT, INSERT ON public.feedback TO authenticated;
GRANT UPDATE ON public.feedback TO authenticated;

-- Grant execute on new functions
GRANT EXECUTE ON FUNCTION update_spaced_repetition TO authenticated;
GRANT EXECUTE ON FUNCTION get_review_queue TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_streak TO authenticated;
GRANT EXECUTE ON FUNCTION check_achievements TO authenticated;

-- =====================================================
-- SEED DATA: Default Achievements
-- =====================================================

INSERT INTO public.achievements (slug, name, name_en, description, description_en, icon, category, requirement_type, requirement_value, sort_order) VALUES
    ('first_practice', 'İlk Pratik', 'First Practice', 'İlk pratik denemeni tamamladın!', 'You completed your first practice!', '🎯', 'practice', 'total_practice', 1, 1),
    ('practice_10', '10 Pratik', '10 Practices', '10 pratik denemesini tamamladın!', 'You completed 10 practices!', '🔥', 'practice', 'total_practice', 10, 2),
    ('practice_50', '50 Pratik', '50 Practices', '50 pratik denemesini tamamladın!', 'You completed 50 practices!', '⚡', 'practice', 'total_practice', 50, 3),
    ('practice_100', 'Yüz Pratik', '100 Practices', '100 pratik denemesini tamamladın!', 'You completed 100 practices!', '💯', 'practice', 'total_practice', 100, 4),
    ('practice_500', 'Pratik Ustası', 'Practice Master', '500 pratik denemesini tamamladın!', 'You completed 500 practices!', '👑', 'practice', 'total_practice', 500, 5),
    ('streak_3', '3 Gün Seri', '3 Day Streak', '3 gün üst üste pratik yaptın!', '3 days in a row!', '📅', 'streak', 'streak_days', 3, 10),
    ('streak_7', 'Haftalık Seri', 'Weekly Streak', '7 gün üst üste pratik yaptın!', '7 days in a row!', '🗓️', 'streak', 'streak_days', 7, 11),
    ('streak_30', 'Aylık Seri', 'Monthly Streak', '30 gün üst üste pratik yaptın!', '30 days in a row!', '🏆', 'streak', 'streak_days', 30, 12),
    ('streak_100', 'Yüz Günlük Seri', '100 Day Streak', '100 gün üst üste pratik yaptın!', '100 days in a row!', '💎', 'streak', 'streak_days', 100, 13),
    ('words_10', '10 Kelime', '10 Words', '10 kelime öğrendin!', 'You learned 10 words!', '📖', 'words', 'total_words', 10, 20),
    ('words_50', '50 Kelime', '50 Words', '50 kelime öğrendin!', 'You learned 50 words!', '📚', 'words', 'total_words', 50, 21),
    ('words_100', '100 Kelime', '100 Words', '100 kelime öğrendin!', 'You learned 100 words!', '🎓', 'words', 'total_words', 100, 22),
    ('quiz_50', 'Quiz Yıldızı', 'Quiz Star', 'Quiz''de 50 puan aldın!', 'Scored 50 in quiz!', '⭐', 'quiz', 'quiz_score', 50, 30),
    ('quiz_100', 'Quiz Şampiyonu', 'Quiz Champion', 'Quiz''de 100 puan aldın!', 'Scored 100 in quiz!', '🌟', 'quiz', 'quiz_score', 100, 31);

-- =====================================================
-- VIEWS
-- =====================================================

-- User progress overview view
CREATE OR REPLACE VIEW public.user_progress AS
SELECT
    p.id as user_id,
    p.current_streak,
    p.longest_streak,
    p.total_practice,
    p.total_words,
    p.quiz_high_score,
    (SELECT COUNT(*) FROM public.spaced_repetition sr WHERE sr.user_id = p.id AND sr.is_mastered = true) as mastered_words,
    (SELECT COUNT(*) FROM public.spaced_repetition sr WHERE sr.user_id = p.id AND sr.next_review_date <= CURRENT_DATE AND sr.is_mastered = false) as due_today,
    (SELECT COUNT(*) FROM public.user_achievements ua WHERE ua.user_id = p.id) as achievement_count,
    (SELECT COALESCE(AVG(pa.accuracy), 0) FROM public.practice_attempts pa WHERE pa.user_id = p.id AND pa.created_at >= CURRENT_DATE - INTERVAL '7 days') as weekly_avg_accuracy
FROM public.profiles p;

-- Leaderboard view (weekly)
CREATE OR REPLACE VIEW public.weekly_leaderboard AS
SELECT
    p.id as user_id,
    p.name,
    p.avatar_url,
    COUNT(pa.id) as weekly_practices,
    COALESCE(AVG(pa.accuracy), 0)::INTEGER as weekly_avg_accuracy,
    p.current_streak
FROM public.profiles p
LEFT JOIN public.practice_attempts pa ON pa.user_id = p.id AND pa.created_at >= CURRENT_DATE - INTERVAL '7 days'
WHERE p.is_active = true
GROUP BY p.id
ORDER BY weekly_practices DESC, weekly_avg_accuracy DESC
LIMIT 50;
