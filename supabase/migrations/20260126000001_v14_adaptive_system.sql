-- NCIAFlux v1.4: Sistema Adaptativo + Cloud
-- Migration: 20260126000001_v14_adaptive_system.sql

-- ============================================
-- SYNC SYSTEM TABLES
-- ============================================

-- Sync queue for offline-first architecture
CREATE TABLE public.sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'task', 'checkin', 'note', etc
    entity_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    data JSONB NOT NULL,
    local_timestamp TIMESTAMPTZ NOT NULL,
    synced_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_queue_user_pending ON public.sync_queue(user_id, synced_at)
    WHERE synced_at IS NULL;
CREATE INDEX idx_sync_queue_entity ON public.sync_queue(entity_type, entity_id);

ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sync queue"
    ON public.sync_queue FOR ALL
    USING (auth.uid() = user_id);

-- Sync log for conflict resolution
CREATE TABLE public.sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('push', 'pull', 'full')),
    entities_synced INTEGER DEFAULT 0,
    conflicts_resolved INTEGER DEFAULT 0,
    duration_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_log_user ON public.sync_log(user_id, created_at DESC);

ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync logs"
    ON public.sync_log FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- TDAH PROFILE TABLES
-- ============================================

-- TDAH evaluation results
CREATE TABLE public.tdah_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('asrs', 'wender_utah', 'caars', 'custom')),
    version TEXT NOT NULL DEFAULT '1.0',
    responses JSONB NOT NULL,
    scores JSONB NOT NULL,
    interpretation TEXT,
    professional_validated BOOLEAN DEFAULT FALSE,
    validated_by UUID REFERENCES public.users(id),
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tdah_evaluations_user ON public.tdah_evaluations(user_id, created_at DESC);

ALTER TABLE public.tdah_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own evaluations"
    ON public.tdah_evaluations FOR ALL
    USING (auth.uid() = user_id);

-- User preferences and adaptive settings
CREATE TABLE public.user_adaptive_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    -- Cronotipo
    chronotype TEXT CHECK (chronotype IN ('morning', 'neutral', 'evening')),
    wake_time TIME,
    sleep_time TIME,
    peak_hours INTEGER[] DEFAULT '{}', -- [9, 10, 11] = 9h-12h
    -- Preferências de foco
    preferred_focus_duration INTEGER DEFAULT 25,
    preferred_technique TEXT DEFAULT 'pomodoro',
    -- Triggers e coping
    distraction_triggers TEXT[] DEFAULT '{}',
    coping_strategies TEXT[] DEFAULT '{}',
    -- Sensibilidades
    sensory_preferences JSONB DEFAULT '{}', -- {sound: 'low', light: 'dim'}
    -- Feature flags
    feature_level INTEGER DEFAULT 1 CHECK (feature_level >= 1 AND feature_level <= 5),
    feature_overrides JSONB DEFAULT '{}',
    -- Gamificação
    gamification_enabled BOOLEAN DEFAULT TRUE,
    show_xp BOOLEAN DEFAULT TRUE,
    show_streaks BOOLEAN DEFAULT TRUE,
    -- Sync
    sync_enabled BOOLEAN DEFAULT FALSE,
    last_sync_at TIMESTAMPTZ,
    -- Metadata
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_adaptive_settings_updated_at
    BEFORE UPDATE ON public.user_adaptive_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.user_adaptive_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own adaptive settings"
    ON public.user_adaptive_settings FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- PATTERN COLLECTION TABLES
-- ============================================

-- Daily patterns for adaptive system
CREATE TABLE public.daily_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    -- Activity metrics
    app_opens INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    hourly_activity JSONB DEFAULT '{}', -- {"9": 15, "10": 30, ...}
    -- Task metrics
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_skipped INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    -- Energy/mood from check-ins
    avg_energy DECIMAL(3,2),
    avg_mood DECIMAL(3,2),
    mood_variance DECIMAL(3,2),
    -- Focus metrics
    focus_sessions INTEGER DEFAULT 0,
    focus_minutes INTEGER DEFAULT 0,
    focus_completion_rate DECIMAL(5,2),
    -- Crisis events
    crisis_mode_count INTEGER DEFAULT 0,
    crisis_total_minutes INTEGER DEFAULT 0,
    -- Calculated scores
    stability_score DECIMAL(5,2),
    productivity_score DECIMAL(5,2),
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_patterns_user_date ON public.daily_patterns(user_id, date DESC);

CREATE TRIGGER update_daily_patterns_updated_at
    BEFORE UPDATE ON public.daily_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.daily_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patterns"
    ON public.daily_patterns FOR SELECT
    USING (auth.uid() = user_id);

-- Automatic adaptations made by the system
CREATE TABLE public.adaptations_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    adaptation_type TEXT NOT NULL, -- 'focus_duration', 'notification_time', 'feature_unlock'
    trigger_reason TEXT NOT NULL, -- Why this adaptation was made
    old_value JSONB,
    new_value JSONB,
    confidence DECIMAL(3,2), -- 0.00 to 1.00
    accepted BOOLEAN, -- User can reject adaptations
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adaptations_log_user ON public.adaptations_log(user_id, created_at DESC);

ALTER TABLE public.adaptations_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own adaptations"
    ON public.adaptations_log FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

-- User XP and levels
CREATE TABLE public.user_gamification (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    -- Streaks (gentle - never resets, just pauses)
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    streak_paused_days INTEGER DEFAULT 0,
    -- Stats
    total_tasks_completed INTEGER DEFAULT 0,
    total_focus_minutes INTEGER DEFAULT 0,
    total_check_ins INTEGER DEFAULT 0,
    -- Metadata
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_gamification_updated_at
    BEFORE UPDATE ON public.user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own gamification"
    ON public.user_gamification FOR ALL
    USING (auth.uid() = user_id);

-- Achievement definitions (read-only reference)
CREATE TABLE public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('start', 'consistency', 'wellbeing', 'social', 'mastery')),
    icon TEXT, -- Emoji or icon name
    xp_reward INTEGER DEFAULT 0,
    requirement JSONB NOT NULL, -- {"type": "tasks_completed", "value": 10}
    is_secret BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements"
    ON public.achievements FOR SELECT
    USING (is_active = TRUE);

-- User unlocked achievements
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id),
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    celebrated BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own achievements"
    ON public.user_achievements FOR ALL
    USING (auth.uid() = user_id);

-- XP transaction log
CREATE TABLE public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL, -- 'task_complete', 'checkin', 'streak_bonus', 'achievement'
    source_id UUID, -- Reference to task, achievement, etc
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user ON public.xp_transactions(user_id, created_at DESC);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp transactions"
    ON public.xp_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- CHAT SOCIAL TABLES
-- ============================================

-- Partnerships (1:1 accountability)
CREATE TABLE public.partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked', 'ended')),
    initiated_by UUID NOT NULL REFERENCES public.users(id),
    -- Sharing settings
    share_achievements BOOLEAN DEFAULT TRUE,
    share_streaks BOOLEAN DEFAULT TRUE,
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    CONSTRAINT different_users CHECK (user_a != user_b),
    CONSTRAINT unique_partnership UNIQUE (user_a, user_b)
);

CREATE INDEX idx_partnerships_users ON public.partnerships(user_a, user_b);

CREATE TRIGGER update_partnerships_updated_at
    BEFORE UPDATE ON public.partnerships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own partnerships"
    ON public.partnerships FOR ALL
    USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Direct messages between partners
CREATE TABLE public.direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'achievement_share', 'celebration', 'encouragement')),
    metadata JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_direct_messages_partnership ON public.direct_messages(partnership_id, created_at DESC);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage messages"
    ON public.direct_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.partnerships p
            WHERE p.id = partnership_id
            AND (p.user_a = auth.uid() OR p.user_b = auth.uid())
            AND p.status = 'active'
        )
    );

-- Communities (group chat)
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    rules TEXT,
    owner_id UUID NOT NULL REFERENCES public.users(id),
    is_public BOOLEAN DEFAULT TRUE,
    max_members INTEGER DEFAULT 50,
    member_count INTEGER DEFAULT 1,
    invite_code TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_communities_owner ON public.communities(owner_id);
CREATE INDEX idx_communities_invite ON public.communities(invite_code) WHERE invite_code IS NOT NULL;

CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON public.communities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public communities"
    ON public.communities FOR SELECT
    USING (is_public = TRUE OR owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.community_id = id AND cm.user_id = auth.uid()
    ));

CREATE POLICY "Owners can manage communities"
    ON public.communities FOR ALL
    USING (owner_id = auth.uid());

-- Community members
CREATE TABLE public.community_members (
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    nickname TEXT,
    muted_until TIMESTAMPTZ,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

CREATE INDEX idx_community_members_user ON public.community_members(user_id);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view community members"
    ON public.community_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members cm
            WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage members"
    ON public.community_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members cm
            WHERE cm.community_id = community_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('admin', 'moderator')
        )
        OR
        EXISTS (
            SELECT 1 FROM public.communities c
            WHERE c.id = community_id AND c.owner_id = auth.uid()
        )
    );

-- Community messages
CREATE TABLE public.community_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'announcement', 'celebration', 'system')),
    reply_to UUID REFERENCES public.community_messages(id),
    reactions JSONB DEFAULT '{}', -- {"👍": ["user1", "user2"]}
    metadata JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_messages_community ON public.community_messages(community_id, created_at DESC);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view messages"
    ON public.community_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members cm
            WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can send messages"
    ON public.community_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.community_members cm
            WHERE cm.community_id = community_id
            AND cm.user_id = auth.uid()
            AND (cm.muted_until IS NULL OR cm.muted_until < NOW())
        )
    );

-- ============================================
-- SEED: Initial Achievements
-- ============================================
INSERT INTO public.achievements (id, name, description, category, icon, xp_reward, requirement) VALUES
-- Start category
('first_task', 'Primeiro Passo', 'Completou sua primeira tarefa', 'start', '🎯', 10, '{"type": "tasks_completed", "value": 1}'),
('first_checkin', 'Bom Dia!', 'Fez seu primeiro check-in', 'start', '☀️', 10, '{"type": "checkins", "value": 1}'),
('brain_dumper', 'Brain Dumper', 'Usou o brain dump 10 vezes', 'start', '🧠', 25, '{"type": "brain_dumps", "value": 10}'),
('discovery_complete', 'Autoconhecimento', 'Completou o questionário de descoberta', 'start', '🔮', 20, '{"type": "discovery", "value": 1}'),

-- Consistency category
('week_streak', 'Semana Ativa', '7 dias com check-in', 'consistency', '🔥', 50, '{"type": "streak", "value": 7}'),
('month_streak', 'Mês Forte', '30 dias com check-in', 'consistency', '💪', 150, '{"type": "streak", "value": 30}'),
('early_bird', 'Madrugador', '7 dias seguindo seu cronotipo', 'consistency', '🌅', 40, '{"type": "chronotype_adherence", "value": 7}'),
('routine_master', 'Mestre da Rotina', 'Completou 50 rotinas', 'consistency', '⚙️', 75, '{"type": "routines_completed", "value": 50}'),

-- Wellbeing category
('zen_master', 'Modo Zen', 'Saiu do modo crise e se recuperou', 'wellbeing', '🧘', 30, '{"type": "crisis_recovery", "value": 1}'),
('stable_week', 'Semana Estável', '7 dias com estabilidade > 70%', 'wellbeing', '⚖️', 60, '{"type": "stability_streak", "value": 7}'),
('focus_champion', 'Campeão do Foco', 'Completou 100 blocos de foco', 'wellbeing', '🎧', 100, '{"type": "focus_blocks", "value": 100}'),
('mood_tracker', 'Observador', 'Registrou humor por 14 dias seguidos', 'wellbeing', '📊', 45, '{"type": "mood_tracking", "value": 14}'),

-- Social category
('team_player', 'Jogador de Time', 'Entrou em um time', 'social', '🤝', 20, '{"type": "team_join", "value": 1}'),
('partner_up', 'Parceiro de Jornada', 'Conectou-se com um parceiro', 'social', '👥', 25, '{"type": "partnership", "value": 1}'),
('community_member', 'Parte da Comunidade', 'Entrou em uma comunidade', 'social', '🏘️', 15, '{"type": "community_join", "value": 1}'),
('supporter', 'Apoiador', 'Enviou 10 mensagens de encorajamento', 'social', '💬', 35, '{"type": "encouragements_sent", "value": 10}'),

-- Mastery category
('level_10', 'Veterano', 'Alcançou nível 10', 'mastery', '⭐', 100, '{"type": "level", "value": 10}'),
('level_25', 'Mestre', 'Alcançou nível 25', 'mastery', '🌟', 250, '{"type": "level", "value": 25}'),
('achievement_hunter', 'Colecionador', 'Desbloqueou 15 conquistas', 'mastery', '🏆', 75, '{"type": "achievements", "value": 15}'),
('productivity_100', 'Super Produtivo', 'Completou 100 tarefas', 'mastery', '💯', 150, '{"type": "tasks_completed", "value": 100}');

-- ============================================
-- FUNCTIONS: Gamification helpers
-- ============================================

-- Function to add XP and check for level up
CREATE OR REPLACE FUNCTION public.add_xp(
    p_user_id UUID,
    p_amount INTEGER,
    p_source TEXT,
    p_source_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS TABLE(new_total_xp INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
    v_current_xp INTEGER;
    v_current_level INTEGER;
    v_new_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Get current values
    SELECT total_xp, current_level INTO v_current_xp, v_current_level
    FROM public.user_gamification
    WHERE user_id = p_user_id;

    -- Initialize if not exists
    IF v_current_xp IS NULL THEN
        INSERT INTO public.user_gamification (user_id, total_xp, current_level)
        VALUES (p_user_id, 0, 1);
        v_current_xp := 0;
        v_current_level := 1;
    END IF;

    -- Calculate new values
    v_new_xp := v_current_xp + p_amount;
    v_new_level := GREATEST(1, FLOOR(v_new_xp / 100) + 1)::INTEGER; -- 100 XP per level

    -- Update user gamification
    UPDATE public.user_gamification
    SET total_xp = v_new_xp, current_level = v_new_level, updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Log transaction
    INSERT INTO public.xp_transactions (user_id, amount, source, source_id, description)
    VALUES (p_user_id, p_amount, p_source, p_source_id, p_description);

    RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > v_current_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak (gentle - pauses instead of reset)
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID) RETURNS JSONB AS $$
DECLARE
    v_last_active DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_paused_days INTEGER;
    v_today DATE := CURRENT_DATE;
    v_result JSONB;
BEGIN
    SELECT last_active_date, current_streak, longest_streak, streak_paused_days
    INTO v_last_active, v_current_streak, v_longest_streak, v_paused_days
    FROM public.user_gamification
    WHERE user_id = p_user_id;

    -- Initialize if not exists
    IF v_last_active IS NULL THEN
        INSERT INTO public.user_gamification (user_id, current_streak, longest_streak, last_active_date, streak_paused_days)
        VALUES (p_user_id, 1, 1, v_today, 0);
        RETURN jsonb_build_object('streak', 1, 'longest', 1, 'paused_days', 0, 'message', 'Primeiro dia!');
    END IF;

    -- Already checked in today
    IF v_last_active = v_today THEN
        RETURN jsonb_build_object('streak', v_current_streak, 'longest', v_longest_streak, 'paused_days', v_paused_days, 'message', 'Já registrado hoje');
    END IF;

    -- Consecutive day - increase streak
    IF v_last_active = v_today - 1 THEN
        v_current_streak := v_current_streak + 1;
        v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
        v_paused_days := 0;

        UPDATE public.user_gamification
        SET current_streak = v_current_streak,
            longest_streak = v_longest_streak,
            last_active_date = v_today,
            streak_paused_days = 0,
            updated_at = NOW()
        WHERE user_id = p_user_id;

        RETURN jsonb_build_object('streak', v_current_streak, 'longest', v_longest_streak, 'paused_days', 0, 'message', 'Streak aumentado!');
    END IF;

    -- Paused days (gentle - doesn't reset, just pauses)
    v_paused_days := v_paused_days + (v_today - v_last_active - 1);

    UPDATE public.user_gamification
    SET last_active_date = v_today,
        streak_paused_days = v_paused_days,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'streak', v_current_streak,
        'longest', v_longest_streak,
        'paused_days', v_paused_days,
        'message', format('Descansou %s dias. Sem problemas!', v_paused_days)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate stability score
CREATE OR REPLACE FUNCTION public.calculate_stability_score(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_score DECIMAL(5,2);
BEGIN
    SELECT
        (
            -- Check-in consistency (25%)
            (COALESCE(AVG(CASE WHEN dp.avg_energy IS NOT NULL THEN 1 ELSE 0 END), 0) * 25) +
            -- Mood stability (20%)
            (GREATEST(0, 20 - COALESCE(AVG(dp.mood_variance), 0) * 10)) +
            -- Task completion (20%)
            (COALESCE(AVG(dp.completion_rate), 0) * 0.2) +
            -- Crisis frequency (20%)
            (20 - LEAST(20, COALESCE(SUM(dp.crisis_mode_count), 0) * 5)) +
            -- Focus/routine adherence (15%)
            (COALESCE(AVG(dp.focus_completion_rate), 0) * 0.15)
        )
    INTO v_score
    FROM public.daily_patterns dp
    WHERE dp.user_id = p_user_id
    AND dp.date >= CURRENT_DATE - p_days;

    RETURN COALESCE(v_score, 50.00); -- Default 50% if no data
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Create gamification record on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_gamification (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_adaptive_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_gamification
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_gamification();

-- ============================================
-- REALTIME: Enable for chat tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partnerships;

COMMENT ON TABLE public.sync_queue IS 'Offline-first sync queue for pending changes';
COMMENT ON TABLE public.daily_patterns IS 'Collected daily usage patterns for adaptive system';
COMMENT ON TABLE public.user_gamification IS 'User XP, levels, and gentle streaks';
COMMENT ON TABLE public.partnerships IS 'Accountability partner connections';
COMMENT ON TABLE public.communities IS 'Support communities for group chat';
