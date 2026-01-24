-- NCIAFlux Initial Database Schema
-- Migration: 20260123000001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'advanced', 'professional')),
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'professional', 'admin')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- COGNITIVE PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID, -- For non-logged users
    summary TEXT NOT NULL,
    insight TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    energy_pattern JSONB NOT NULL DEFAULT '{}',
    execution_style TEXT CHECK (execution_style IN ('sequential', 'parallel', 'burst')),
    distraction_triggers TEXT[] DEFAULT '{}',
    coping_strengths TEXT[] DEFAULT '{}',
    focus_duration_minutes INTEGER DEFAULT 25,
    best_focus_time TEXT,
    needs_external_accountability BOOLEAN DEFAULT FALSE,
    response_to_pressure TEXT CHECK (response_to_pressure IN ('thrives', 'freezes', 'mixed')),
    raw_answers JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_session_id ON public.profiles(session_id);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profiles"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can insert own profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own profiles"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    category TEXT NOT NULL DEFAULT 'other',
    estimated_duration_minutes INTEGER,
    scheduled_time TIME,
    completed_at TIMESTAMPTZ,
    parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_parent ON public.tasks(parent_task_id);

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
    ON public.tasks FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- DAILY PLANS TABLE
-- ============================================
CREATE TABLE public.daily_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    mood TEXT,
    is_crisis_mode BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_plans_user_date ON public.daily_plans(user_id, date);

CREATE TRIGGER update_daily_plans_updated_at
    BEFORE UPDATE ON public.daily_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for daily_plans
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own daily plans"
    ON public.daily_plans FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- FOCUS BLOCKS TABLE
-- ============================================
CREATE TABLE public.focus_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    daily_plan_id UUID REFERENCES public.daily_plans(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    technique TEXT NOT NULL DEFAULT 'pomodoro' CHECK (technique IN ('pomodoro', 'deep_work', 'timeboxing', 'free_flow')),
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    actual_duration_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_focus_blocks_user_id ON public.focus_blocks(user_id);
CREATE INDEX idx_focus_blocks_daily_plan ON public.focus_blocks(daily_plan_id);

-- RLS Policies for focus_blocks
ALTER TABLE public.focus_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own focus blocks"
    ON public.focus_blocks FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- ROUTINES TABLE
-- ============================================
CREATE TABLE public.routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time', 'condition')),
    trigger_time TIME,
    trigger_condition JSONB,
    steps JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routines_user_id ON public.routines(user_id);

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for routines
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own routines"
    ON public.routines FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'check_in', 'suggestion', 'celebration')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- RLS Policies for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own chat messages"
    ON public.chat_messages FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- CHECK-INS TABLE
-- ============================================
CREATE TABLE public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('morning', 'midday', 'evening', 'on_demand')),
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 5),
    mood TEXT,
    notes TEXT,
    responses JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_check_ins_created_at ON public.check_ins(created_at DESC);

-- RLS Policies for check_ins
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own check-ins"
    ON public.check_ins FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- RLS Policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================
CREATE TABLE public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    check_in_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    task_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    focus_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    celebrations BOOLEAN NOT NULL DEFAULT TRUE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    max_daily_notifications INTEGER NOT NULL DEFAULT 8,
    preferred_tone TEXT NOT NULL DEFAULT 'gentle' CHECK (preferred_tone IN ('gentle', 'encouraging', 'direct')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
    ON public.notification_preferences FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- DISCOVERY QUESTIONS TABLE (Read-only reference)
-- ============================================
CREATE TABLE public.discovery_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "order" INTEGER NOT NULL,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'slider', 'text')),
    options JSONB,
    min_value INTEGER,
    max_value INTEGER,
    required BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discovery_questions_order ON public.discovery_questions("order");

-- RLS Policies for discovery_questions (public read)
ALTER TABLE public.discovery_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read discovery questions"
    ON public.discovery_questions FOR SELECT
    USING (is_active = TRUE);

-- ============================================
-- FUNCTION: Create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NULL)
    );

    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED: Discovery Questions
-- ============================================
INSERT INTO public.discovery_questions ("order", category, question_text, question_type, options, required) VALUES
(1, 'energy', 'Como você geralmente se sente pela manhã?', 'single_choice',
 '[{"value": "low", "label": "Difícil acordar, pouca energia", "emoji": "😴"}, {"value": "medium", "label": "Normal, demoro a engrenar", "emoji": "😐"}, {"value": "high", "label": "Acordo bem disposto", "emoji": "⚡"}]',
 TRUE),
(2, 'energy', 'Em que período do dia você se sente mais produtivo?', 'single_choice',
 '[{"value": "morning", "label": "Manhã"}, {"value": "afternoon", "label": "Tarde"}, {"value": "evening", "label": "Noite"}, {"value": "varies", "label": "Varia muito"}]',
 TRUE),
(3, 'focus', 'Por quanto tempo você consegue manter o foco em uma tarefa?', 'slider', NULL, TRUE),
(4, 'distraction', 'O que mais te distrai durante o dia?', 'multiple_choice',
 '[{"value": "notifications", "label": "Notificações"}, {"value": "noise", "label": "Barulho"}, {"value": "thoughts", "label": "Pensamentos"}, {"value": "social_media", "label": "Redes sociais"}, {"value": "hunger", "label": "Fome"}, {"value": "fatigue", "label": "Cansaço"}]',
 TRUE),
(5, 'execution', 'Como você prefere organizar suas tarefas?', 'single_choice',
 '[{"value": "sequential", "label": "Uma de cada vez, em ordem"}, {"value": "parallel", "label": "Várias ao mesmo tempo"}, {"value": "burst", "label": "Tudo de uma vez quando dá"}]',
 TRUE),
(6, 'coping', 'O que já te ajudou a manter o foco?', 'multiple_choice',
 '[{"value": "lists", "label": "Listas"}, {"value": "timers", "label": "Timers"}, {"value": "music", "label": "Música"}, {"value": "movement", "label": "Movimento"}, {"value": "caffeine", "label": "Café"}, {"value": "body_doubling", "label": "Trabalhar com alguém"}, {"value": "rewards", "label": "Recompensas"}, {"value": "deadlines", "label": "Prazos"}]',
 TRUE),
(7, 'accountability', 'Você funciona melhor com alguém te cobrando?', 'single_choice',
 '[{"value": "yes", "label": "Sim, preciso de cobrança externa"}, {"value": "no", "label": "Não, prefiro autonomia"}, {"value": "sometimes", "label": "Depende da situação"}]',
 TRUE),
(8, 'pressure', 'Como você reage sob pressão/prazos apertados?', 'single_choice',
 '[{"value": "thrives", "label": "Me motiva e rendo mais"}, {"value": "freezes", "label": "Travo e fico ansioso"}, {"value": "mixed", "label": "Às vezes ajuda, às vezes atrapalha"}]',
 TRUE);

COMMENT ON TABLE public.users IS 'User profiles and subscription information';
COMMENT ON TABLE public.profiles IS 'Cognitive profiles from discovery questionnaire';
COMMENT ON TABLE public.tasks IS 'User tasks and to-dos';
COMMENT ON TABLE public.daily_plans IS 'Daily plans with tasks and focus blocks';
COMMENT ON TABLE public.chat_messages IS 'Chat conversation history';
COMMENT ON TABLE public.check_ins IS 'User check-in responses';
