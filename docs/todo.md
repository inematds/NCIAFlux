# MentesBrilhantes (NCIAFlux) - Plano de Ação

**Projeto:** MentesBrilhantes / NCIAFlux (NeuroFluxo)
**Início:** 23 de Janeiro de 2026
**Última Atualização:** 24 de Janeiro de 2026
**Status:** Web 100% Completo - Pronto para Testes

---

## Status Atual

### Web App - COMPLETO ✅

Todas as features do Epic 7 e Epic 8 foram implementadas.

---

## Estado Atual - Web App

### Implementado (Funcional)

| Feature | Status | Arquivo |
|---------|--------|---------|
| Landing Page | ✅ 100% | `app/page.tsx` |
| Login/Register | ✅ 100% | `app/login`, `app/register` |
| Dashboard | ✅ 100% | `app/dashboard/page.tsx` |
| Discovery Questionário | ✅ 100% | `app/dashboard/discovery/page.tsx` |
| Discovery Resultado | ✅ 100% | `app/dashboard/discovery/result/page.tsx` |
| Tasks (CRUD) | ✅ 100% | `app/dashboard/tasks/page.tsx` |
| Focus Timer | ✅ 100% | `app/dashboard/focus/page.tsx` |
| Check-in | ✅ 100% | `app/dashboard/checkin/page.tsx` |
| Crisis Mode | ✅ 100% | `app/dashboard/crisis/page.tsx` |
| Reports | ✅ 70% | `app/dashboard/reports/page.tsx` |
| Settings | ✅ 80% | `app/dashboard/settings/page.tsx` |
| Teams | ✅ 80% | `app/dashboard/teams/page.tsx` |
| **Brain Dump** | ✅ 100% | `app/dashboard/brain-dump/page.tsx` |
| **Cronotipos** | ✅ 100% | `app/dashboard/chronotype/page.tsx` |
| **Planner Diário** | ✅ 100% | `app/dashboard/planner/page.tsx` |
| **Rotinas (Hub)** | ✅ 100% | `app/dashboard/routines/page.tsx` |
| **Rotina Matinal** | ✅ 100% | `app/dashboard/routines/morning/page.tsx` |
| **Rotina Noturna** | ✅ 100% | `app/dashboard/routines/evening/page.tsx` |
| **Projetos** | ✅ 100% | `app/dashboard/projects/page.tsx` |
| **Projeto Detalhe** | ✅ 100% | `app/dashboard/projects/[id]/page.tsx` |
| **Agenda/Calendário** | ✅ 100% | `app/dashboard/calendar/page.tsx` |
| **Notas** | ✅ 100% | `app/dashboard/notes/page.tsx` |
| **Revisões** | ✅ 100% | `app/dashboard/review/page.tsx` |
| **Demo Mode** | ✅ 100% | `app/demo/page.tsx` |

### A Implementar (Prioridade Baixa - V2)

| Feature | Status | Notas |
|---------|--------|-------|
| Chat por Voz | ⬜ 0% | Avançado |
| Integração WhatsApp | ⬜ 0% | Avançado |
| Integração Calendários Externos | ⬜ 0% | V2 |
| Dashboard Profissional | ⬜ 0% | Plano Pro |
| Sistema de Plugins | ⬜ 0% | V2 |

---

## Sprints Concluídas

### Sprint 11: Epic 7 - Sistema de Produtividade ✅

**Meta:** Completar módulos Brain Dump, Cronotipos, Planner, Rotinas e Revisões

- [x] Brain Dump - Despejo mental com categorias
- [x] Brain Dump - Triagem (Hoje/Semana/Delegar/Algum dia)
- [x] Brain Dump - Top 1 automático
- [x] Brain Dump - Big Goal
- [x] Cronotipos - Quiz de identificação (5 perguntas)
- [x] Cronotipos - 4 tipos (Urso/Golfinho/Coruja/Leão)
- [x] Cronotipos - Rotinas específicas por tipo
- [x] Cronotipos - Melhor horário de foco
- [x] Planner Diário - Visão manhã/tarde/noite
- [x] Planner Diário - Check-in com humor e sono
- [x] Planner Diário - Integração com Top 1 do Brain Dump
- [x] Planner Diário - Navegação por dia
- [x] Rotinas - Hub central com estatísticas
- [x] Rotina Matinal - Construtor visual
- [x] Rotina Matinal - Condicionais (se/então)
- [x] Rotina Matinal - Execução passo-a-passo
- [x] Rotina Noturna - Construtor visual
- [x] Rotina Noturna - Top 1 do dia seguinte
- [x] Sistema de Revisão - Revisão semanal completa
- [x] Sistema de Revisão - Revisão mensal completa
- [x] Sistema de Revisão - Energia e produtividade
- [x] Sistema de Revisão - Histórico de revisões

### Sprint 12: Epic 8 - Organização Avançada ✅

**Meta:** Completar módulos Projetos, Agenda e Notas

- [x] Projetos - CRUD básico (criar, editar, arquivar, excluir)
- [x] Projetos - Associação com tarefas
- [x] Projetos - Visão de progresso
- [x] Projetos - Cores e emojis customizáveis
- [x] Projetos - Detalhe do projeto com tarefas
- [x] Agenda - Visualização mês/semana/dia
- [x] Agenda - Eventos independentes
- [x] Agenda - Integração com tarefas agendadas
- [x] Agenda - Eventos recorrentes
- [x] Notas - Captura rápida (Inbox)
- [x] Notas - Pastas organizadas
- [x] Notas - Tags
- [x] Notas - Fixar notas importantes

### Sprint 13: Demo Mode ✅

**Meta:** Login de demonstração para showcase

- [x] Dados fictícios completos (projetos, tarefas, perfil)
- [x] Rotinas pré-configuradas
- [x] Cronotipo definido (Bear)
- [x] Revisão semanal de exemplo
- [x] Banner "Modo Demo" no dashboard
- [x] CTA "Criar minha conta"
- [x] Branding atualizado para MentesBrilhantes

---

## Navegação do Dashboard

```
/dashboard
├── /                    ← Dashboard principal
├── /brain-dump         ← Brain Dump ✅
├── /planner            ← Planner Diário ✅
├── /routines           ← Hub de Rotinas ✅
│   ├── /morning        ← Rotina Matinal ✅
│   └── /evening        ← Rotina Noturna ✅
├── /calendar           ← Agenda/Calendário ✅
├── /projects           ← Projetos ✅
│   └── /[id]          ← Detalhe do Projeto ✅
├── /tasks              ← Lista de tarefas ✅
├── /notes              ← Notas ✅
├── /focus              ← Timer de foco ✅
├── /checkin            ← Check-in diário ✅
├── /crisis             ← Modo crise ✅
├── /chronotype         ← Cronotipos ✅
├── /review             ← Revisões ✅
├── /reports            ← Relatórios ✅
├── /discovery          ← Questionário descoberta ✅
│   └── /result        ← Resultado do perfil ✅
├── /teams              ← Times/Equipes ✅
└── /settings           ← Configurações ✅

/demo                   ← Página de Demo ✅
```

---

## Funcionalidades por Módulo

### Brain Dump (`/dashboard/brain-dump`)
- Captura rápida de pensamentos
- Categorias: Ligar, Mensagem, E-mail, Planejar, Pesquisar, Fazer/Criar, Outros
- Triagem: Hoje (max 3), Esta Semana (max 5), Delegar (max 3), Algum dia
- Top 1 do dia
- Big Goal (meta grande)

### Cronotipos (`/dashboard/chronotype`)
- Quiz de 5 perguntas
- 4 tipos: Urso 🐻, Golfinho 🐬, Coruja 🦉, Leão 🦁
- Rotinas específicas por período
- Melhor horário de foco
- Pontos fortes e desafios

### Planner Diário (`/dashboard/planner`)
- Navegação por data
- Check-in: humor (5 emojis), qualidade do sono (1-10)
- Intenção do dia, gratidão
- 3 blocos: Manhã, Tarde, Noite
- Integração com Top 1 do Brain Dump
- Barra de progresso

### Rotinas (`/dashboard/routines`)
- Hub com estatísticas
- Dicas por cronotipo
- Links para rotinas matinal e noturna

### Rotina Matinal (`/dashboard/routines/morning`)
- Construtor visual de fluxo
- Steps de ação (com duração)
- Steps de condição (sim/não branching)
- Execução passo-a-passo
- Presets de ações comuns

### Rotina Noturna (`/dashboard/routines/evening`)
- Mesmo formato da matinal
- Definição do Top 1 do dia seguinte
- Foco em desaceleração

### Projetos (`/dashboard/projects`)
- CRUD completo
- 8 cores, 12 emojis
- Status: ativo, arquivado, concluído
- Progresso visual
- Contagem de tarefas

### Detalhe do Projeto (`/dashboard/projects/[id]`)
- Tarefas do projeto
- Adicionar tarefas diretamente
- Filtros: todas, pendentes, concluídas
- Prioridades: alta, média, baixa
- Barra de progresso

### Agenda (`/dashboard/calendar`)
- 3 visualizações: mês, semana, dia
- CRUD de eventos
- Eventos de dia inteiro
- Repetição: diária, semanal, mensal
- 8 cores para eventos
- Integração com tarefas agendadas

### Notas (`/dashboard/notes`)
- 3 colunas: pastas, lista, editor
- Captura rápida (Cmd+Enter)
- Pastas padrão: Inbox, Ideias, Referência, Arquivo
- Pastas customizadas
- Tags
- Busca
- Fixar notas

### Revisões (`/dashboard/review`)
- Revisão semanal
  - Humor geral
  - Energia (1-5)
  - Produtividade (1-5)
  - Vitórias, desafios, lições
  - Gratidão
  - Foco da próxima semana
- Revisão mensal
  - Avaliação geral (1-10)
  - Maiores vitórias
  - Áreas para melhorar
  - Hábitos formados
  - Lições aprendidas
  - Metas do próximo mês
- Histórico de revisões

### Demo Mode (`/demo`)
- Login sem cadastro
- Dados de exemplo completos
- Banner indicativo no dashboard
- CTA para criar conta

---

## Armazenamento (localStorage)

| Chave | Dados |
|-------|-------|
| `nciaflux_user` | Dados do usuário |
| `nciaflux_tasks` | Lista de tarefas |
| `nciaflux_projects` | Lista de projetos |
| `nciaflux_brain_dump` | Brain dump (items, triaged, top1, bigGoal) |
| `nciaflux_calendar_events` | Eventos do calendário |
| `nciaflux_notes` | Notas |
| `nciaflux_note_folders` | Pastas de notas |
| `nciaflux_weekly_reviews` | Revisões semanais |
| `nciaflux_monthly_reviews` | Revisões mensais |
| `nciaflux_planner_YYYY-MM-DD` | Planner por dia |
| `nciaflux_morning_routine` | Rotina matinal |
| `nciaflux_evening_routine` | Rotina noturna |
| `nciaflux_chronotype` | Cronotipo identificado |
| `nciaflux_demo_mode` | Flag de modo demo |

---

## Documentos do Projeto

| Documento | Status | Localização |
|-----------|--------|-------------|
| PRD (v1.2) | ✅ Atualizado | `docs/prd.md` |
| Arquitetura | ✅ Completo | `docs/architecture.md` |
| Front-end Spec | ✅ Completo | `docs/front-end-spec.md` |
| Pesquisa de Mercado | ✅ Completo | `docs/market-research-analysis.md` |

---

## Próximos Passos

1. **Testes** - Testar todas as funcionalidades
2. **Bug fixes** - Corrigir problemas encontrados
3. **Polish** - Melhorar UX e animações
4. **Deploy** - Publicar versão beta
5. **Feedback** - Coletar feedback de usuários beta

---

## Notas Importantes

1. **Branding:** MentesBrilhantes (nome do produto)
2. **Storage:** localStorage para demo/grátis, Supabase para premium
3. **Demo Mode:** Acesso em /demo com dados de exemplo
4. **Tom:** Gentil, sem pressão, sem cobrança
5. **Público:** Qualquer pessoa que precise de organização

---

*Atualizado em: 24 de Janeiro de 2026*
