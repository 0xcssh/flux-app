-- ============================================
-- FLUX: Supabase PostgreSQL Schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USER PROFILES ────────────────────────────
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    birth_year INTEGER,
    timezone TEXT DEFAULT 'Europe/Paris',
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr')),
    notification_time TIME DEFAULT '08:00',
    nofap_module_enabled BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DAILY LOGS ──────────────────────────────
CREATE TABLE public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    energy INTEGER CHECK (energy BETWEEN 1 AND 10),
    mood INTEGER CHECK (mood BETWEEN 1 AND 10),
    libido INTEGER CHECK (libido BETWEEN 1 AND 10),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
    stress INTEGER CHECK (stress BETWEEN 1 AND 10),
    training INTEGER CHECK (training BETWEEN 1 AND 10),
    notes TEXT,
    nofap_checked BOOLEAN DEFAULT FALSE,
    vitality_score INTEGER CHECK (vitality_score BETWEEN 0 AND 100),
    log_time TIMESTAMPTZ DEFAULT NOW(),
    synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ─── NOFAP STREAKS ────────────────────────────
CREATE TABLE public.nofap_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PUSH NOTIFICATION TOKENS ──────────────────
CREATE TABLE public.push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    expo_push_token TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('ios', 'android')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, expo_push_token)
);

-- ─── USER INSIGHTS (cached computations) ──────
CREATE TABLE public.user_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('correlation', 'pattern', 'recommendation')),
    title_key TEXT NOT NULL,
    body_key TEXT NOT NULL,
    body_params JSONB,
    metric_a TEXT,
    metric_b TEXT,
    correlation_value FLOAT,
    confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ───────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nofap_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Daily logs
CREATE POLICY "logs_select_own" ON public.daily_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own" ON public.daily_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_update_own" ON public.daily_logs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "logs_delete_own" ON public.daily_logs
    FOR DELETE USING (auth.uid() = user_id);

-- NoFap streaks
CREATE POLICY "streaks_select_own" ON public.nofap_streaks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "streaks_insert_own" ON public.nofap_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "streaks_update_own" ON public.nofap_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Push tokens
CREATE POLICY "tokens_all_own" ON public.push_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Insights
CREATE POLICY "insights_select_own" ON public.user_insights
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insights_insert_own" ON public.user_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── INDEXES ──────────────────────────────────
CREATE INDEX idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX idx_daily_logs_date ON public.daily_logs(log_date DESC);
CREATE INDEX idx_nofap_streaks_user_active ON public.nofap_streaks(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_insights_user ON public.user_insights(user_id, created_at DESC);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── NOFAP COMMUNITY STATS (anonymous) ────────
CREATE MATERIALIZED VIEW public.nofap_community_stats AS
SELECT
    DATE_TRUNC('week', start_date) AS week,
    COUNT(*) AS total_streaks,
    AVG(CASE WHEN end_date IS NOT NULL THEN end_date - start_date ELSE NULL END)::INTEGER AS avg_streak_days,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY
        CASE WHEN end_date IS NOT NULL THEN end_date - start_date ELSE NULL END
    )::INTEGER AS median_streak_days,
    MAX(CASE WHEN end_date IS NOT NULL THEN end_date - start_date
             ELSE CURRENT_DATE - start_date END) AS longest_streak
FROM public.nofap_streaks
GROUP BY DATE_TRUNC('week', start_date);
