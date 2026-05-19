-- =====================================================
-- MIGRATION 002: Rate Limiting & API Security
-- API rate limiting, abuse prevention
-- =====================================================

-- =====================================================
-- RATE LIMIT TABLE
-- API çağrı sayılarını takip eder
-- =====================================================

CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address INET,
    endpoint TEXT NOT NULL,

    -- Window tracking
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_count INTEGER DEFAULT 1 NOT NULL,

    -- Limits (configurable per endpoint)
    max_requests INTEGER NOT NULL DEFAULT 60,
    window_seconds INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT rate_limit_identifier CHECK (user_id IS NOT NULL OR ip_address IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_rate_limits_user ON public.rate_limits(user_id, endpoint, window_start);
CREATE INDEX idx_rate_limits_ip ON public.rate_limits(ip_address, endpoint, window_start);
CREATE INDEX idx_rate_limits_cleanup ON public.rate_limits(window_start);

-- =====================================================
-- FUNCTION: Check and increment rate limit
-- Returns TRUE if request is allowed, FALSE if rate limited
-- =====================================================

CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_ip_address INET,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 60,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
BEGIN
    v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;

    -- Get current request count in window
    SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
    FROM public.rate_limits
    WHERE (user_id = p_user_id OR ip_address = p_ip_address)
        AND endpoint = p_endpoint
        AND window_start >= v_window_start;

    -- Check if over limit
    IF v_current_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;

    -- Increment or insert
    INSERT INTO public.rate_limits (user_id, ip_address, endpoint, max_requests, window_seconds)
    VALUES (p_user_id, p_ip_address, p_endpoint, p_max_requests, p_window_seconds)
    ON CONFLICT DO NOTHING;

    -- Update if exists in current window
    UPDATE public.rate_limits
    SET request_count = request_count + 1
    WHERE (user_id = p_user_id OR ip_address = p_ip_address)
        AND endpoint = p_endpoint
        AND window_start >= v_window_start;

    IF NOT FOUND THEN
        INSERT INTO public.rate_limits (user_id, ip_address, endpoint, max_requests, window_seconds)
        VALUES (p_user_id, p_ip_address, p_endpoint, p_max_requests, p_window_seconds);
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Cleanup old rate limit entries
-- Should be called periodically (via cron or pg_cron)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_start < NOW() - INTERVAL '1 hour';

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- API USAGE TRACKING
-- Wiro API kullanım takibi (maliyet kontrolü)
-- =====================================================

CREATE TABLE public.api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- API details
    api_name TEXT NOT NULL CHECK (api_name IN ('tts', 'stt', 'image', 'video', 'llm')),
    model_id TEXT,
    endpoint TEXT,

    -- Usage metrics
    tokens_used INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    cost_estimate NUMERIC(10,6) DEFAULT 0,

    -- Status
    success BOOLEAN DEFAULT true NOT NULL,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_api_name ON public.api_usage(api_name);
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at DESC);
CREATE INDEX idx_api_usage_daily ON public.api_usage(user_id, api_name, created_at);

-- =====================================================
-- DAILY API LIMITS PER USER
-- =====================================================

CREATE OR REPLACE FUNCTION check_daily_api_limit(
    p_user_id UUID,
    p_api_name TEXT,
    p_daily_limit INTEGER DEFAULT 100
)
RETURNS BOOLEAN AS $$
DECLARE
    v_today_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_today_count
    FROM public.api_usage
    WHERE user_id = p_user_id
        AND api_name = p_api_name
        AND created_at >= CURRENT_DATE
        AND success = true;

    RETURN v_today_count < p_daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEW: Daily API usage summary
-- =====================================================

CREATE OR REPLACE VIEW public.api_usage_daily AS
SELECT
    user_id,
    api_name,
    DATE(created_at) as usage_date,
    COUNT(*) as total_calls,
    COUNT(*) FILTER (WHERE success = true) as successful_calls,
    COUNT(*) FILTER (WHERE success = false) as failed_calls,
    SUM(tokens_used) as total_tokens,
    SUM(cost_estimate) as total_cost,
    AVG(duration_ms)::INTEGER as avg_duration_ms
FROM public.api_usage
GROUP BY user_id, api_name, DATE(created_at);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Rate limits - only service role
CREATE POLICY "Service role manages rate limits"
    ON public.rate_limits FOR ALL
    USING (auth.role() = 'service_role');

-- API usage - users see own, admins see all
CREATE POLICY "Users can view own API usage"
    ON public.api_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage"
    ON public.api_usage FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view all API usage"
    ON public.api_usage FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- =====================================================
-- GRANTS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_daily_api_limit TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rate_limits TO authenticated;
GRANT SELECT ON public.api_usage TO authenticated;
GRANT INSERT ON public.api_usage TO authenticated;
GRANT SELECT ON public.api_usage_daily TO authenticated;
