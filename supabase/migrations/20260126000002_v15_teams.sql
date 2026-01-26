-- NCIAFlux v1.5: Gestão de Times
-- Migration: 20260126000002_v15_teams.sql

-- ============================================
-- TEAMS TABLE (Enhanced from initial schema)
-- ============================================

-- Drop and recreate teams table with v1.5 features
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.users(id),
    -- Settings
    max_members INTEGER DEFAULT 10,
    member_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    -- Feature settings
    feature_preset TEXT DEFAULT 'standard' CHECK (feature_preset IN ('beginner', 'standard', 'advanced', 'custom')),
    feature_config JSONB DEFAULT '{}',
    -- Privacy
    allow_member_visibility BOOLEAN DEFAULT TRUE, -- Can members see each other?
    require_approval BOOLEAN DEFAULT FALSE,
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_owner ON public.teams(owner_id);

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage teams"
    ON public.teams FOR ALL
    USING (owner_id = auth.uid());

CREATE POLICY "Members can view their teams"
    ON public.teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = id AND tm.user_id = auth.uid()
        )
    );

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE public.team_members (
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member')),
    -- Member settings
    nickname TEXT,
    visibility TEXT DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'managers')),
    -- Feature overrides for this member
    feature_overrides JSONB DEFAULT '{}',
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMPTZ,
    -- Metadata
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON public.team_members(user_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view team members"
    ON public.team_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage members"
    ON public.team_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
        )
    );

-- ============================================
-- TEAM INVITATIONS TABLE
-- ============================================
CREATE TABLE public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    email TEXT, -- Optional: invite specific email
    invited_by UUID NOT NULL REFERENCES public.users(id),
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
    max_uses INTEGER DEFAULT 1,
    use_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_invitations_code ON public.team_invitations(code);
CREATE INDEX idx_team_invitations_team ON public.team_invitations(team_id);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations"
    ON public.team_invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Anyone can view invitation by code"
    ON public.team_invitations FOR SELECT
    USING (TRUE);

-- ============================================
-- TEAM JOIN REQUESTS TABLE
-- ============================================
CREATE TABLE public.team_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_join_requests_team ON public.team_join_requests(team_id, status);

ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own requests"
    ON public.team_join_requests FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view and manage requests"
    ON public.team_join_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
        )
    );

-- ============================================
-- TEAM AGGREGATED STATS VIEW (Privacy-preserving)
-- ============================================
CREATE OR REPLACE VIEW public.team_aggregated_stats AS
SELECT
    tm.team_id,
    COUNT(DISTINCT tm.user_id) as total_members,
    COUNT(DISTINCT tm.user_id) FILTER (
        WHERE tm.last_active_at > NOW() - INTERVAL '7 days'
    ) as active_members_7d,
    -- Only show average stability if 3+ members (privacy)
    CASE
        WHEN COUNT(*) >= 3 THEN (
            SELECT AVG(dp.stability_score)
            FROM public.daily_patterns dp
            WHERE dp.user_id IN (SELECT user_id FROM public.team_members WHERE team_id = tm.team_id)
            AND dp.date >= CURRENT_DATE - 7
        )
        ELSE NULL
    END as avg_stability_7d,
    -- Safe aggregate metrics
    CASE
        WHEN COUNT(*) >= 3 THEN (
            SELECT SUM(dp.tasks_completed)
            FROM public.daily_patterns dp
            WHERE dp.user_id IN (SELECT user_id FROM public.team_members WHERE team_id = tm.team_id)
            AND dp.date >= CURRENT_DATE - 7
        )
        ELSE NULL
    END as total_tasks_7d
FROM public.team_members tm
WHERE tm.is_active = TRUE
GROUP BY tm.team_id;

-- ============================================
-- TEAM CHALLENGES TABLE
-- ============================================
CREATE TABLE public.team_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    metric TEXT NOT NULL CHECK (metric IN ('tasks', 'checkins', 'focus_minutes', 'streak_days')),
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'expired', 'cancelled')),
    -- Rewards
    xp_reward INTEGER DEFAULT 50,
    badge_id TEXT,
    -- Metadata
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_team_challenges_team ON public.team_challenges(team_id, status);

ALTER TABLE public.team_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view team challenges"
    ON public.team_challenges FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage challenges"
    ON public.team_challenges FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager')
        )
    );

-- ============================================
-- CHALLENGE PARTICIPANTS TABLE
-- ============================================
CREATE TABLE public.challenge_participants (
    challenge_id UUID NOT NULL REFERENCES public.team_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contribution INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can manage own participation"
    ON public.challenge_participants FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Team members can view participants"
    ON public.challenge_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_challenges tc
            JOIN public.team_members tm ON tm.team_id = tc.team_id
            WHERE tc.id = challenge_id AND tm.user_id = auth.uid()
        )
    );

-- ============================================
-- TEAM ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE public.team_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL, -- References TEAM_ACHIEVEMENTS constant
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    members_at_time UUID[] NOT NULL,
    UNIQUE(team_id, achievement_id)
);

CREATE INDEX idx_team_achievements_team ON public.team_achievements(team_id);

ALTER TABLE public.team_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view team achievements"
    ON public.team_achievements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
        )
    );

-- ============================================
-- TEAM FEATURE CONFIG TABLE
-- ============================================
CREATE TABLE public.team_feature_config (
    team_id UUID PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
    preset TEXT DEFAULT 'standard' CHECK (preset IN ('beginner', 'standard', 'advanced', 'custom')),
    features JSONB DEFAULT '{}',
    member_overrides JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id)
);

CREATE TRIGGER update_team_feature_config_updated_at
    BEFORE UPDATE ON public.team_feature_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.team_feature_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature config"
    ON public.team_feature_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Members can view feature config"
    ON public.team_feature_config FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
        )
    );

-- ============================================
-- TEAM REPORTS TABLE
-- ============================================
CREATE TABLE public.team_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    summary JSONB NOT NULL,
    insights JSONB DEFAULT '[]',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, report_type, period_start)
);

CREATE INDEX idx_team_reports_team ON public.team_reports(team_id, generated_at DESC);

ALTER TABLE public.team_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view team reports"
    ON public.team_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin', 'manager')
        )
    );

-- ============================================
-- FUNCTIONS: Team helpers
-- ============================================

-- Function to generate invitation code
CREATE OR REPLACE FUNCTION public.generate_team_invite(
    p_team_id UUID,
    p_role TEXT DEFAULT 'member',
    p_max_uses INTEGER DEFAULT 1,
    p_expires_days INTEGER DEFAULT 7
) RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
BEGIN
    -- Generate unique code
    v_code := encode(gen_random_bytes(6), 'hex');

    INSERT INTO public.team_invitations (team_id, code, invited_by, role, max_uses, expires_at)
    VALUES (
        p_team_id,
        v_code,
        auth.uid(),
        p_role,
        p_max_uses,
        NOW() + (p_expires_days || ' days')::INTERVAL
    );

    RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join team with invite code
CREATE OR REPLACE FUNCTION public.join_team_with_code(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_invite public.team_invitations%ROWTYPE;
    v_team public.teams%ROWTYPE;
BEGIN
    -- Get and validate invitation
    SELECT * INTO v_invite
    FROM public.team_invitations
    WHERE code = p_code
    AND expires_at > NOW()
    AND (max_uses IS NULL OR use_count < max_uses);

    IF v_invite IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Convite inválido ou expirado');
    END IF;

    -- Get team
    SELECT * INTO v_team FROM public.teams WHERE id = v_invite.team_id;

    -- Check member limit
    IF v_team.member_count >= v_team.max_members THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Time está cheio');
    END IF;

    -- Check if already member
    IF EXISTS (SELECT 1 FROM public.team_members WHERE team_id = v_invite.team_id AND user_id = auth.uid()) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Você já é membro deste time');
    END IF;

    -- Add member
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (v_invite.team_id, auth.uid(), v_invite.role);

    -- Update team member count
    UPDATE public.teams SET member_count = member_count + 1 WHERE id = v_invite.team_id;

    -- Update invite use count
    UPDATE public.team_invitations SET use_count = use_count + 1 WHERE id = v_invite.id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'team_id', v_invite.team_id,
        'team_name', v_team.name,
        'role', v_invite.role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get friendly rankings (privacy-preserving)
CREATE OR REPLACE FUNCTION public.get_team_rankings(
    p_team_id UUID,
    p_category TEXT,
    p_period TEXT DEFAULT 'week'
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_result JSONB;
BEGIN
    -- Only return top 5 and user's position (never last places)
    WITH ranked AS (
        SELECT
            tm.user_id,
            u.name,
            u.avatar_url,
            CASE p_category
                WHEN 'growth' THEN (
                    SELECT COALESCE(
                        dp2.stability_score - dp1.stability_score,
                        0
                    )
                    FROM public.daily_patterns dp1
                    LEFT JOIN public.daily_patterns dp2 ON dp2.user_id = dp1.user_id
                        AND dp2.date = dp1.date + 7
                    WHERE dp1.user_id = tm.user_id
                    ORDER BY dp1.date DESC
                    LIMIT 1
                )
                WHEN 'streak' THEN (
                    SELECT COALESCE(ug.current_streak, 0)
                    FROM public.user_gamification ug
                    WHERE ug.user_id = tm.user_id
                )
                WHEN 'achievements' THEN (
                    SELECT COUNT(*)::INTEGER
                    FROM public.user_achievements ua
                    WHERE ua.user_id = tm.user_id
                )
                ELSE 0
            END as value,
            ROW_NUMBER() OVER (ORDER BY
                CASE p_category
                    WHEN 'growth' THEN (
                        SELECT COALESCE(dp2.stability_score - dp1.stability_score, 0)
                        FROM public.daily_patterns dp1
                        LEFT JOIN public.daily_patterns dp2 ON dp2.user_id = dp1.user_id
                            AND dp2.date = dp1.date + 7
                        WHERE dp1.user_id = tm.user_id
                        ORDER BY dp1.date DESC
                        LIMIT 1
                    )
                    ELSE 0
                END DESC
            ) as position
        FROM public.team_members tm
        JOIN public.users u ON u.id = tm.user_id
        WHERE tm.team_id = p_team_id
        AND tm.is_active = TRUE
    )
    SELECT jsonb_build_object(
        'category', p_category,
        'top5', (
            SELECT jsonb_agg(jsonb_build_object(
                'position', position,
                'name', name,
                'avatar_url', avatar_url,
                'value', value,
                'is_current_user', user_id = v_user_id
            ))
            FROM ranked
            WHERE position <= 5
        ),
        'user_position', (
            SELECT jsonb_build_object(
                'position', position,
                'value', value
            )
            FROM ranked
            WHERE user_id = v_user_id
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Notify team achievement
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_team_achievement()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification for each member
    INSERT INTO public.notifications (user_id, type, title, body, data)
    SELECT
        unnest(NEW.members_at_time),
        'team_achievement',
        'Conquista do Time!',
        format('O time desbloqueou: %s', NEW.achievement_id),
        jsonb_build_object(
            'team_id', NEW.team_id,
            'achievement_id', NEW.achievement_id
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_team_achievement
    AFTER INSERT ON public.team_achievements
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_team_achievement();

COMMENT ON TABLE public.teams IS 'Teams for group management (v1.5)';
COMMENT ON TABLE public.team_members IS 'Team membership with roles';
COMMENT ON TABLE public.team_challenges IS 'Cooperative team challenges';
COMMENT ON TABLE public.team_reports IS 'Generated team reports (weekly/monthly)';
