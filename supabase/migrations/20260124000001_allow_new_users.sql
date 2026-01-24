-- NCIAFlux - Políticas para permitir novos usuários
-- Migration: 20260124000001_allow_new_users.sql

-- ============================================
-- PERMITIR INSERÇÃO DE NOVOS USUÁRIOS
-- ============================================

-- Política para permitir que o trigger crie usuários
-- (O trigger handle_new_user já tem SECURITY DEFINER, então funciona)

-- Política para permitir que usuários vejam outros usuários (para equipes)
CREATE POLICY "Users can view team members"
    ON public.users FOR SELECT
    USING (TRUE);  -- Permite ver todos os usuários (necessário para funcionalidade de equipes)

-- ============================================
-- TABELAS DE EQUIPES (Novas)
-- ============================================

-- Tabela de equipes
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams they belong to"
    ON public.teams FOR SELECT
    USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = id AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can manage their teams"
    ON public.teams FOR ALL
    USING (owner_id = auth.uid());

-- Tabela de membros de equipe
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    invited_by UUID REFERENCES public.users(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members of their teams"
    ON public.team_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm2
            WHERE tm2.team_id = team_id AND tm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Team admins can manage members"
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
-- CONVITES DE EQUIPE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    invited_by UUID NOT NULL REFERENCES public.users(id),
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON public.team_invites(token);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team admins can manage invites"
    ON public.team_invites FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
        )
    );

-- ============================================
-- FUNÇÃO: Aceitar convite de equipe
-- ============================================
CREATE OR REPLACE FUNCTION public.accept_team_invite(invite_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_invite RECORD;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Buscar convite válido
    SELECT * INTO v_invite
    FROM public.team_invites
    WHERE token = invite_token
    AND accepted_at IS NULL
    AND expires_at > NOW();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invite';
    END IF;

    -- Verificar se email do usuário corresponde
    IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = v_user_id AND email = v_invite.email
    ) THEN
        RAISE EXCEPTION 'Email does not match invite';
    END IF;

    -- Adicionar usuário à equipe
    INSERT INTO public.team_members (team_id, user_id, role, invited_by)
    VALUES (v_invite.team_id, v_user_id, v_invite.role, v_invite.invited_by)
    ON CONFLICT (team_id, user_id) DO NOTHING;

    -- Marcar convite como aceito
    UPDATE public.team_invites
    SET accepted_at = NOW()
    WHERE id = v_invite.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ATUALIZAR POLÍTICA DE PROFILES
-- ============================================
-- Permitir que profissionais vejam perfis de membros de suas equipes
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;

CREATE POLICY "Users can view profiles"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = user_id
        OR session_id IS NOT NULL
        OR EXISTS (
            SELECT 1 FROM public.team_members tm1
            JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
            WHERE tm1.user_id = auth.uid()
            AND tm2.user_id = profiles.user_id
        )
    );

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE public.teams IS 'Equipes de trabalho para gestores acompanharem membros';
COMMENT ON TABLE public.team_members IS 'Membros de cada equipe com seus papéis';
COMMENT ON TABLE public.team_invites IS 'Convites pendentes para entrar em equipes';
COMMENT ON FUNCTION public.accept_team_invite IS 'Função para aceitar convite de equipe via token';
