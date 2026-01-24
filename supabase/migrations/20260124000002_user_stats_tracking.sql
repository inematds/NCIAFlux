-- NCIAFlux User Stats Tracking
-- Migration: 20260124000002_user_stats_tracking.sql
-- Purpose: Track basic stats for free users using local storage

-- ============================================
-- USER STATS TABLE (for free users)
-- ============================================
-- This table stores minimal data for users on free plan
-- Their actual data (tasks, settings) stays in localStorage

CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    storage_mode TEXT NOT NULL DEFAULT 'local' CHECK (storage_mode IN ('local', 'cloud')),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'advanced', 'professional')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin')),

    -- Statistics
    tasks_created INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    teams_created INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ,

    -- Metadata
    browser TEXT,
    platform TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_stats_email ON public.user_stats(email);

-- Trigger for updated_at
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for registration)
CREATE POLICY "Anyone can register"
    ON public.user_stats FOR INSERT
    WITH CHECK (true);

-- Users can view their own stats
CREATE POLICY "Users can view own stats"
    ON public.user_stats FOR SELECT
    USING (true);

-- Users can update their own stats
CREATE POLICY "Users can update own stats"
    ON public.user_stats FOR UPDATE
    USING (true);

-- ============================================
-- FUNCTION: Upsert user stats
-- ============================================
CREATE OR REPLACE FUNCTION upsert_user_stats(
    p_email TEXT,
    p_name TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'user',
    p_browser TEXT DEFAULT NULL,
    p_platform TEXT DEFAULT NULL
)
RETURNS public.user_stats AS $$
DECLARE
    result public.user_stats;
BEGIN
    INSERT INTO public.user_stats (email, name, role, browser, platform, last_activity_at)
    VALUES (p_email, p_name, p_role, p_browser, p_platform, NOW())
    ON CONFLICT (email)
    DO UPDATE SET
        name = COALESCE(EXCLUDED.name, public.user_stats.name),
        last_activity_at = NOW(),
        updated_at = NOW()
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Increment task stats
-- ============================================
CREATE OR REPLACE FUNCTION increment_task_stats(
    p_email TEXT,
    p_created INTEGER DEFAULT 0,
    p_completed INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
    UPDATE public.user_stats
    SET
        tasks_created = tasks_created + p_created,
        tasks_completed = tasks_completed + p_completed,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Increment team stats
-- ============================================
CREATE OR REPLACE FUNCTION increment_team_stats(
    p_email TEXT,
    p_created INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
    UPDATE public.user_stats
    SET
        teams_created = teams_created + p_created,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
