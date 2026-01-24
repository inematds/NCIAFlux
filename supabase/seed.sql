-- NCIAFlux Seed Data
-- Execute este arquivo APÓS as migrations para popular o banco com dados de exemplo
-- Uso: psql -h localhost -U postgres -d postgres -f seed.sql

-- ============================================
-- IMPORTANTE: Criar usuários via Auth primeiro
-- ============================================
-- Os usuários devem ser criados via Supabase Auth (Dashboard ou API)
-- O trigger on_auth_user_created criará automaticamente o registro em public.users

-- Para testes locais, podemos inserir diretamente (sem auth):
-- ATENÇÃO: Em produção, use apenas o fluxo de Auth

-- ============================================
-- USUÁRIO DE DEMONSTRAÇÃO
-- ============================================
-- ID fixo para facilitar referências
DO $$
DECLARE
    demo_user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    demo_user2_id UUID := 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
    demo_user3_id UUID := 'c3d4e5f6-a7b8-9012-cdef-123456789012';
    demo_user4_id UUID := 'd4e5f6a7-b8c9-0123-def0-234567890123';
    demo_user5_id UUID := 'e5f6a7b8-c9d0-1234-ef01-345678901234';
BEGIN

-- Limpar dados existentes (para re-execução)
DELETE FROM public.chat_messages;
DELETE FROM public.check_ins;
DELETE FROM public.focus_blocks;
DELETE FROM public.daily_plans;
DELETE FROM public.tasks;
DELETE FROM public.routines;
DELETE FROM public.profiles;
DELETE FROM public.notification_preferences;
DELETE FROM public.notifications;
DELETE FROM public.users;

-- ============================================
-- USUÁRIOS
-- ============================================
INSERT INTO public.users (id, email, name, avatar_url, plan, role, onboarding_completed) VALUES
(demo_user_id, 'demo@nciaflux.com', 'João Demo', NULL, 'professional', 'user', TRUE),
(demo_user2_id, 'ana.silva@empresa.com', 'Ana Silva', NULL, 'advanced', 'user', TRUE),
(demo_user3_id, 'carlos.santos@empresa.com', 'Carlos Santos', NULL, 'basic', 'user', TRUE),
(demo_user4_id, 'maria.oliveira@empresa.com', 'Maria Oliveira', NULL, 'professional', 'user', TRUE),
(demo_user5_id, 'gestor@empresa.com', 'Fernando Costa', NULL, 'professional', 'professional', TRUE);

-- Preferências de notificação
INSERT INTO public.notification_preferences (user_id, enabled, check_in_reminders, task_reminders, focus_reminders, celebrations, quiet_hours_start, quiet_hours_end, preferred_tone) VALUES
(demo_user_id, TRUE, TRUE, TRUE, TRUE, TRUE, '22:00', '07:00', 'gentle'),
(demo_user2_id, TRUE, TRUE, TRUE, TRUE, TRUE, '23:00', '08:00', 'encouraging'),
(demo_user3_id, TRUE, TRUE, FALSE, TRUE, TRUE, NULL, NULL, 'direct'),
(demo_user4_id, TRUE, TRUE, TRUE, TRUE, TRUE, '21:00', '06:00', 'gentle'),
(demo_user5_id, TRUE, TRUE, TRUE, TRUE, TRUE, '22:00', '07:00', 'encouraging');

-- ============================================
-- PERFIS COGNITIVOS
-- ============================================
INSERT INTO public.profiles (user_id, summary, insight, suggestion, energy_pattern, execution_style, distraction_triggers, coping_strengths, focus_duration_minutes, best_focus_time, needs_external_accountability, response_to_pressure, raw_answers) VALUES
(demo_user_id,
 'Você tem um perfil de energia variável com picos pela manhã. Funciona melhor com tarefas estruturadas e prazos claros.',
 'Seu estilo de execução é sequencial - você prefere completar uma tarefa antes de começar outra. Isso é uma força!',
 'Recomendamos blocos de foco de 25 minutos (Pomodoro) pela manhã, quando sua energia está no pico.',
 '{"morning": 4, "afternoon": 3, "evening": 2}',
 'sequential',
 ARRAY['notifications', 'social_media', 'noise'],
 ARRAY['lists', 'timers', 'music'],
 25,
 'morning',
 TRUE,
 'mixed',
 '{"energy_morning": "high", "best_time": "morning", "focus_duration": 25, "distractions": ["notifications", "social_media"], "execution": "sequential"}'
),
(demo_user2_id,
 'Você tem energia consistente ao longo do dia com leve queda à tarde. Trabalha bem em paralelo.',
 'Seu estilo multitarefa pode ser uma força quando bem gerenciado. Use timeboxing para manter o foco.',
 'Experimente blocos de 45 minutos com pausas de 10 minutos. Evite redes sociais durante o trabalho.',
 '{"morning": 4, "afternoon": 3, "evening": 4}',
 'parallel',
 ARRAY['social_media', 'thoughts'],
 ARRAY['timers', 'body_doubling', 'deadlines'],
 45,
 'morning',
 FALSE,
 'thrives',
 '{}'
),
(demo_user3_id,
 'Você é uma pessoa noturna com picos de energia à noite. Precisa de mais tempo para engrenar pela manhã.',
 'Seu padrão de energia sugere agendar tarefas criativas para o final do dia.',
 'Comece o dia com tarefas simples e deixe as complexas para depois das 15h.',
 '{"morning": 2, "afternoon": 3, "evening": 5}',
 'burst',
 ARRAY['fatigue', 'hunger', 'noise'],
 ARRAY['caffeine', 'music', 'rewards'],
 30,
 'evening',
 TRUE,
 'freezes',
 '{}'
);

-- ============================================
-- TAREFAS DO USUÁRIO DEMO
-- ============================================
INSERT INTO public.tasks (user_id, title, description, priority, status, category, estimated_duration_minutes, scheduled_time, "order") VALUES
-- Tarefas do João Demo
(demo_user_id, 'Revisar emails importantes', 'Checar e responder emails urgentes do trabalho', 'high', 'completed', 'work', 30, '09:00', 1),
(demo_user_id, 'Reunião de equipe', 'Reunião semanal de alinhamento com a equipe', 'high', 'completed', 'work', 60, '10:00', 2),
(demo_user_id, 'Almoço', 'Pausa para alimentação', 'medium', 'completed', 'health', 45, '12:00', 3),
(demo_user_id, 'Finalizar relatório mensal', 'Completar e enviar relatório de atividades', 'high', 'in_progress', 'work', 90, '14:00', 4),
(demo_user_id, 'Exercício físico', 'Caminhada ou academia', 'medium', 'pending', 'health', 30, '18:00', 5),
(demo_user_id, 'Estudar React Native', 'Continuar curso de desenvolvimento mobile', 'low', 'pending', 'learning', 60, '20:00', 6),
(demo_user_id, 'Preparar apresentação', 'Slides para reunião de sexta', 'high', 'pending', 'work', 45, NULL, 7),
(demo_user_id, 'Ligar para médico', 'Agendar consulta de rotina', 'medium', 'pending', 'health', 15, NULL, 8),
(demo_user_id, 'Organizar escritório', 'Limpar e organizar mesa de trabalho', 'low', 'pending', 'personal', 30, NULL, 9),
(demo_user_id, 'Responder mensagens', 'WhatsApp e Slack pendentes', 'medium', 'pending', 'social', 20, NULL, 10),

-- Tarefas da Ana Silva
(demo_user2_id, 'Code review PR #234', 'Revisar pull request do Carlos', 'high', 'in_progress', 'work', 45, '09:00', 1),
(demo_user2_id, 'Implementar nova feature', 'Sistema de notificações push', 'high', 'pending', 'work', 180, '10:00', 2),
(demo_user2_id, 'Documentar API', 'Atualizar documentação do endpoint', 'medium', 'pending', 'work', 60, '14:00', 3),
(demo_user2_id, 'Daily standup', 'Reunião diária da equipe', 'high', 'completed', 'work', 15, '09:30', 4),

-- Tarefas do Carlos Santos
(demo_user3_id, 'Design nova tela', 'Criar mockup da tela de perfil', 'high', 'in_progress', 'work', 120, '15:00', 1),
(demo_user3_id, 'Revisar protótipo', 'Ajustes no protótipo do Figma', 'medium', 'pending', 'work', 60, '17:00', 2),
(demo_user3_id, 'Reunião com cliente', 'Apresentar propostas de design', 'high', 'pending', 'work', 60, '19:00', 3);

-- Subtarefas (tarefas com parent_task_id)
INSERT INTO public.tasks (user_id, title, description, priority, status, category, estimated_duration_minutes, parent_task_id, "order")
SELECT
    demo_user_id,
    subtask.title,
    NULL,
    'medium',
    subtask.status,
    'work',
    subtask.duration,
    t.id,
    subtask.ord
FROM public.tasks t
CROSS JOIN (VALUES
    ('Coletar dados do mês', 'completed', 20, 1),
    ('Criar gráficos', 'completed', 30, 2),
    ('Escrever análise', 'in_progress', 25, 3),
    ('Revisar formatação', 'pending', 15, 4)
) AS subtask(title, status, duration, ord)
WHERE t.user_id = demo_user_id AND t.title = 'Finalizar relatório mensal';

-- ============================================
-- PLANOS DIÁRIOS
-- ============================================
INSERT INTO public.daily_plans (user_id, date, energy_level, mood, is_crisis_mode, notes) VALUES
(demo_user_id, CURRENT_DATE, 4, 'focado', FALSE, 'Dia produtivo, muitas reuniões'),
(demo_user_id, CURRENT_DATE - INTERVAL '1 day', 3, 'cansado', FALSE, 'Dia corrido mas consegui entregar'),
(demo_user_id, CURRENT_DATE - INTERVAL '2 days', 5, 'energizado', FALSE, 'Ótimo dia! Completei todas as tarefas'),
(demo_user_id, CURRENT_DATE - INTERVAL '3 days', 2, 'ansioso', TRUE, 'Ativei modo crise - muita pressão'),
(demo_user_id, CURRENT_DATE - INTERVAL '4 days', 4, 'tranquilo', FALSE, NULL),
(demo_user2_id, CURRENT_DATE, 4, 'motivada', FALSE, 'Bom dia de código'),
(demo_user3_id, CURRENT_DATE, 3, 'criativo', FALSE, 'Inspiração fluindo');

-- ============================================
-- BLOCOS DE FOCO
-- ============================================
INSERT INTO public.focus_blocks (user_id, daily_plan_id, start_time, duration_minutes, technique, completed, actual_duration_minutes)
SELECT
    demo_user_id,
    dp.id,
    fb.start_time::TIME,
    fb.duration,
    fb.technique,
    fb.completed,
    fb.actual_duration
FROM public.daily_plans dp
CROSS JOIN (VALUES
    ('09:00', 25, 'pomodoro', TRUE, 25),
    ('09:30', 25, 'pomodoro', TRUE, 28),
    ('10:30', 45, 'deep_work', TRUE, 42),
    ('14:00', 25, 'pomodoro', TRUE, 25),
    ('14:30', 25, 'pomodoro', FALSE, NULL),
    ('15:00', 60, 'timeboxing', FALSE, NULL)
) AS fb(start_time, duration, technique, completed, actual_duration)
WHERE dp.user_id = demo_user_id AND dp.date = CURRENT_DATE;

-- ============================================
-- ROTINAS
-- ============================================
INSERT INTO public.routines (user_id, name, description, trigger_type, trigger_time, steps, is_active) VALUES
(demo_user_id, 'Rotina Matinal', 'Começar o dia com energia', 'time', '07:00',
 '[{"order": 1, "description": "Beber copo de água", "duration_minutes": 2, "optional": false},
   {"order": 2, "description": "Alongamento leve", "duration_minutes": 5, "optional": false},
   {"order": 3, "description": "Revisar agenda do dia", "duration_minutes": 5, "optional": false},
   {"order": 4, "description": "Café da manhã", "duration_minutes": 15, "optional": false}]',
 TRUE),
(demo_user_id, 'Preparar para Dormir', 'Rotina para melhorar o sono', 'time', '22:00',
 '[{"order": 1, "description": "Desligar telas", "duration_minutes": 1, "optional": false},
   {"order": 2, "description": "Preparar roupa do dia seguinte", "duration_minutes": 5, "optional": true},
   {"order": 3, "description": "Meditação guiada", "duration_minutes": 10, "optional": false},
   {"order": 4, "description": "Leitura leve", "duration_minutes": 15, "optional": true}]',
 TRUE),
(demo_user_id, 'Pausa Energizante', 'Quando energia está baixa', 'condition', NULL,
 '[{"order": 1, "description": "Levantar e alongar", "duration_minutes": 3, "optional": false},
   {"order": 2, "description": "Beber água", "duration_minutes": 1, "optional": false},
   {"order": 3, "description": "Caminhar pelo ambiente", "duration_minutes": 5, "optional": false}]',
 TRUE),
(demo_user2_id, 'Início de Trabalho', 'Ritual para começar a codar', 'time', '09:00',
 '[{"order": 1, "description": "Revisar PRs pendentes", "duration_minutes": 10, "optional": false},
   {"order": 2, "description": "Verificar Slack", "duration_minutes": 5, "optional": false},
   {"order": 3, "description": "Definir prioridades", "duration_minutes": 5, "optional": false}]',
 TRUE);

-- ============================================
-- CHECK-INS
-- ============================================
INSERT INTO public.check_ins (user_id, type, energy_level, mood, notes, responses, created_at) VALUES
(demo_user_id, 'morning', 4, 'motivado', 'Dormi bem, pronto para o dia', '{"slept_well": true, "exercise_planned": true}', NOW() - INTERVAL '2 hours'),
(demo_user_id, 'morning', 3, 'sonolento', 'Noite mal dormida', '{"slept_well": false, "exercise_planned": false}', NOW() - INTERVAL '1 day'),
(demo_user_id, 'midday', 3, 'focado', 'Manhã produtiva', '{"completed_morning_tasks": true}', NOW() - INTERVAL '1 day' + INTERVAL '5 hours'),
(demo_user_id, 'evening', 4, 'satisfeito', 'Bom dia no geral', '{"day_rating": 4}', NOW() - INTERVAL '1 day' + INTERVAL '10 hours'),
(demo_user_id, 'morning', 5, 'energizado', 'Melhor dia da semana!', '{"slept_well": true, "exercise_planned": true}', NOW() - INTERVAL '2 days'),
(demo_user_id, 'morning', 2, 'ansioso', 'Preocupado com deadline', '{"slept_well": false, "anxiety_level": 4}', NOW() - INTERVAL '3 days'),
(demo_user2_id, 'morning', 4, 'bem', 'Pronta para codar', '{}', NOW() - INTERVAL '1 hour'),
(demo_user3_id, 'morning', 3, 'neutro', 'Dia normal', '{}', NOW() - INTERVAL '30 minutes');

-- ============================================
-- MENSAGENS DE CHAT
-- ============================================
INSERT INTO public.chat_messages (user_id, role, type, content, metadata, created_at) VALUES
(demo_user_id, 'assistant', 'text', 'Bom dia, João! Como você está se sentindo hoje? Vi que você tem algumas tarefas importantes agendadas.', '{}', NOW() - INTERVAL '2 hours'),
(demo_user_id, 'user', 'text', 'Bom dia! Estou bem, mas um pouco preocupado com o relatório que preciso entregar.', '{}', NOW() - INTERVAL '2 hours' + INTERVAL '1 minute'),
(demo_user_id, 'assistant', 'suggestion', 'Entendo! Que tal dividirmos o relatório em partes menores? Você pode começar coletando os dados, depois criar os gráficos, e por fim escrever a análise. Assim fica mais gerenciável!', '{"suggestion_type": "task_breakdown"}', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),
(demo_user_id, 'user', 'text', 'Boa ideia! Vou fazer isso.', '{}', NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes'),
(demo_user_id, 'assistant', 'celebration', '🎉 Parabéns! Você completou 3 tarefas esta manhã! Continue assim!', '{"celebration_type": "task_completion", "count": 3}', NOW() - INTERVAL '1 hour'),
(demo_user_id, 'assistant', 'check_in', 'Hora do check-in do meio-dia! Como está sua energia agora? Conseguiu manter o foco nas tarefas da manhã?', '{"check_in_type": "midday"}', NOW() - INTERVAL '30 minutes');

-- ============================================
-- NOTIFICAÇÕES
-- ============================================
INSERT INTO public.notifications (user_id, type, title, body, data, read, sent_at) VALUES
(demo_user_id, 'check_in_reminder', 'Hora do Check-in! ☀️', 'Como você está se sentindo? Faça seu check-in matinal.', '{"check_in_type": "morning"}', TRUE, NOW() - INTERVAL '2 hours'),
(demo_user_id, 'task_reminder', 'Tarefa em 30 minutos', 'Reunião de equipe às 10:00', '{"task_id": "xxx"}', TRUE, NOW() - INTERVAL '3 hours'),
(demo_user_id, 'celebration', 'Parabéns! 🎉', 'Você completou todas as tarefas da manhã!', '{}', TRUE, NOW() - INTERVAL '1 hour'),
(demo_user_id, 'focus_reminder', 'Bloco de Foco', 'Está na hora do seu bloco de foco de 25 minutos', '{"technique": "pomodoro"}', FALSE, NOW() - INTERVAL '10 minutes'),
(demo_user_id, 'tip', 'Dica do Dia 💡', 'Lembre-se de fazer pausas regulares para manter a produtividade!', '{}', FALSE, NOW());

END $$;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '=== SEED DATA INSERIDO COM SUCESSO ===';
    RAISE NOTICE 'Usuários criados: %', (SELECT COUNT(*) FROM public.users);
    RAISE NOTICE 'Tarefas criadas: %', (SELECT COUNT(*) FROM public.tasks);
    RAISE NOTICE 'Perfis criados: %', (SELECT COUNT(*) FROM public.profiles);
    RAISE NOTICE 'Rotinas criadas: %', (SELECT COUNT(*) FROM public.routines);
    RAISE NOTICE 'Check-ins criados: %', (SELECT COUNT(*) FROM public.check_ins);
    RAISE NOTICE 'Mensagens de chat: %', (SELECT COUNT(*) FROM public.chat_messages);
    RAISE NOTICE '';
    RAISE NOTICE 'USUÁRIO DEMO:';
    RAISE NOTICE 'Email: demo@nciaflux.com';
    RAISE NOTICE 'ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    RAISE NOTICE '';
    RAISE NOTICE 'Para criar novos usuários, use o Supabase Auth!';
END $$;
