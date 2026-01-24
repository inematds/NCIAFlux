# NCIAFlux - NeuroFluxo

<div align="center">

**Seu fluxo, seu ritmo.**

App de suporte para TDAH com descoberta de perfil cognitivo, plano personalizado e acompanhamento adaptativo.

[![React Native](https://img.shields.io/badge/React_Native-0.73-blue?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-50-black?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Sobre o Projeto

NCIAFlux (NeuroFluxo) é um aplicativo mobile projetado especificamente para pessoas com TDAH. Diferente de apps genéricos de produtividade, o NeuroFluxo entende que cada pessoa tem seu próprio ritmo e adapta suas ferramentas ao perfil cognitivo do usuário.

### Diferenciais

- **Perfil Cognitivo**: Descubra seu estilo de funcionamento através de um questionário gamificado
- **Plano Personalizado**: Tarefas, rotinas e técnicas adaptadas ao seu perfil
- **Acompanhamento Suave**: Check-ins sem pressão, celebrações e micro-recompensas
- **Modo Crise**: Suporte imediato quando você trava
- **Comunidade**: Times temáticos para apoio mútuo
- **Preço Acessível**: Pensado para ser inclusivo

---

## Funcionalidades

### Módulo Descoberta (Gratuito)
| Feature | Descrição |
|---------|-----------|
| Questionário Gamificado | 20-30 perguntas interativas com emojis e animações |
| Geração de Perfil | Identificação de estilo de execução, gatilhos e forças |
| Feedback Visual | Insights personalizados sobre seu funcionamento |
| Compartilhamento | Exporte seu perfil em PDF ou imagem |

### Módulo Plano Personalizado (Básico)
| Feature | Descrição |
|---------|-----------|
| Dashboard Visual | Painel intuitivo com tarefas, energia e progresso |
| Sistema de Tarefas | Prioridades visuais (vermelha/amarela/verde) |
| Blocos de Foco | Pomodoro, Deep Work, Timeboxing, Free Flow |
| Rotinas Condicionais | Regras "se/então" adaptativas |
| Técnicas TDAH | Dicas contextuais baseadas no momento |

### Módulo Acompanhamento (Básico)
| Feature | Descrição |
|---------|-----------|
| Chat de Texto | Assistente com tom empático e sem julgamento |
| Check-ins Diários | Monitoramento de humor e energia |
| Relatórios | Insights semanais sobre padrões e progresso |
| Notificações Gentis | Lembretes configuráveis e respeitosos |

### Experiência e Engajamento
| Feature | Descrição |
|---------|-----------|
| Micro-recompensas | Celebrações visuais ao completar tarefas |
| Widgets 1-Toque | Ações rápidas direto da home |
| Celebrações | Animações e confetes ao atingir metas |
| Modo Crise | Suporte imediato com técnicas de grounding |
| Perfil Adaptativo | O app aprende e sugere ajustes |

### Features Avançadas (Premium)
| Feature | Descrição |
|---------|-----------|
| Notificações Avançadas | Configuração detalhada com quiet hours |
| Biblioteca de Relatórios | 11 modelos de relatórios especializados |
| Pílulas Educativas | Conteúdo sobre TDAH, foco e bem-estar |
| Comunidade | Times temáticos com desafios e apoio mútuo |
| Moderação | Sistema completo para comunidade segura |

---

## Screenshots

### Telas Principais

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Dashboard    │  │      Plano      │  │      Chat       │
│                 │  │                 │  │                 │
│  [Energia: 70%] │  │  [ ] Tarefa 1   │  │  Oi! Como você  │
│                 │  │  [x] Tarefa 2   │  │  está hoje?     │
│  Tarefas do Dia │  │  [ ] Tarefa 3   │  │                 │
│  ─────────────  │  │                 │  │  [   Digitar  ] │
│  🔴 Urgente     │  │  [+ Nova]       │  │                 │
│  🟡 Importante  │  │                 │  │                 │
│  🟢 Quando der  │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Blocos de Foco

```
┌─────────────────────────────────────────────┐
│              🍅 POMODORO                     │
│                                             │
│                 25:00                       │
│              ───────────                    │
│                                             │
│         [  ▶  INICIAR  ]                   │
│                                             │
│    Foco: 25min  │  Pausa: 5min             │
└─────────────────────────────────────────────┘
```

### Comunidade

```
┌─────────────────────────────────────────────┐
│  🧠 Foco Profundo              456 membros  │
├─────────────────────────────────────────────┤
│  Feed  │  Membros  │  Desafios              │
├─────────────────────────────────────────────┤
│  👤 Maria S.                    Lv.15       │
│  Consegui 4h de foco hoje! 🎉               │
│  ❤️ 24   💬 12                              │
├─────────────────────────────────────────────┤
│  👤 João P.                     Lv.8        │
│  Alguém tem dicas para o pós-almoço?        │
│  🤍 12   💬 23                              │
└─────────────────────────────────────────────┘
```

---

## Arquitetura

### Estrutura do Monorepo

```
NCIAFlux/
├── apps/
│   ├── web/                       # App Web (Next.js 14)
│   │   └── src/
│   │       ├── app/               # App Router pages
│   │       │   ├── dashboard/     # Dashboard, Tasks, Teams, Reports, Settings
│   │       │   ├── login/         # Autenticação
│   │       │   ├── register/      # Cadastro
│   │       │   └── (static)/      # Páginas estáticas
│   │       └── lib/               # Utilitários
│   │           └── storage.ts     # LocalStorage service
│   └── mobile/                    # App React Native (Expo)
│       ├── src/
│       │   ├── components/        # Componentes reutilizáveis
│       │   │   ├── CelebrationOverlay.tsx
│       │   │   ├── MicroReward.tsx
│       │   │   ├── QuickWidgets.tsx
│       │   │   └── index.ts
│       │   ├── hooks/             # Custom hooks
│       │   │   └── useAuth.ts
│       │   ├── navigation/        # Navegação
│       │   │   ├── AuthNavigator.tsx
│       │   │   ├── MainNavigator.tsx
│       │   │   └── index.tsx
│       │   ├── screens/           # Telas
│       │   │   ├── auth/          # Login, Registro, etc.
│       │   │   ├── discovery/     # Questionário e Perfil
│       │   │   └── main/          # Dashboard, Plano, Chat, etc.
│       │   ├── services/          # Serviços
│       │   │   ├── notifications.ts
│       │   │   ├── adaptiveProfile.ts
│       │   │   └── community.ts
│       │   └── lib/               # Configurações
│       │       └── supabase.ts
│       └── app.json
├── packages/
│   └── shared/                    # Código compartilhado
│       └── src/
│           ├── types/             # TypeScript types
│           │   ├── database.ts
│           │   ├── discovery.ts
│           │   └── index.ts
│           └── constants/         # Constantes
│               ├── app.ts
│               ├── colors.ts
│               └── index.ts
├── supabase/
│   └── migrations/                # Migrations SQL
│       └── 20240123000000_initial_schema.sql
├── docs/                          # Documentação
│   ├── prd.md
│   ├── architecture.md
│   ├── front-end-spec.md
│   ├── market-research-analysis.md
│   ├── todo.md
│   └── stories/                   # User Stories
└── v0/                            # Prompts para v0.dev
```

### Telas Implementadas

| Tela | Arquivo | Descrição |
|------|---------|-----------|
| Login | `LoginScreen.tsx` | Autenticação com email/senha |
| Registro | `RegisterScreen.tsx` | Criação de conta |
| Esqueci Senha | `ForgotPasswordScreen.tsx` | Recuperação de senha |
| Questionário | `QuestionnaireScreen.tsx` | Descoberta do perfil |
| Resultado | `ProfileResultScreen.tsx` | Exibição do perfil |
| Dashboard | `DashboardScreen.tsx` | Painel principal |
| Plano | `PlanScreen.tsx` | Lista de tarefas |
| Detalhe Tarefa | `TaskDetailScreen.tsx` | Edição de tarefa |
| Bloco de Foco | `FocusBlockScreen.tsx` | Timer de foco |
| Chat | `ChatScreen.tsx` | Assistente de texto |
| Check-in | `CheckInScreen.tsx` | Registro de humor/energia |
| Relatórios | `ReportsScreen.tsx` | Estatísticas semanais |
| Perfil | `ProfileScreen.tsx` | Configurações e perfil |
| Modo Crise | `CrisisModeScreen.tsx` | Suporte de emergência |
| Notificações | `NotificationSettingsScreen.tsx` | Config. de alertas |
| Biblioteca Relatórios | `ReportsLibraryScreen.tsx` | Modelos de relatórios |
| Conteúdo Educativo | `EducationalContentScreen.tsx` | Pílulas educativas |
| Comunidade | `CommunityScreen.tsx` | Hub de times |
| Detalhe Time | `TeamDetailScreen.tsx` | Posts e membros |

### Componentes

| Componente | Descrição |
|------------|-----------|
| `CelebrationOverlay` | Animação de confetes para conquistas |
| `MicroReward` | Feedback visual de XP/pontos |
| `AchievementBadge` | Notificação de conquista |
| `ProgressMilestone` | Indicador de progresso |
| `QuickTaskWidget` | Widget de tarefa rápida |
| `QuickFocusWidget` | Widget de foco |
| `QuickEnergyWidget` | Seletor de energia |
| `CrisisWidget` | Botão de modo crise |
| `StreakWidget` | Contador de sequência |
| `ProgressRingWidget` | Anel de progresso |

### Serviços

| Serviço | Funcionalidades |
|---------|-----------------|
| `notifications.ts` | Templates, quiet hours, preferências, agendamento |
| `adaptiveProfile.ts` | Tracking de uso, sugestões de ajuste, análise de padrões |
| `community.ts` | Moderação, times, posts, denúncias, desafios |

---

## Banco de Dados

### Principais Tabelas

```sql
-- Usuários e Perfis
users                    -- Dados básicos do usuário
profiles                 -- Perfil cognitivo descoberto
discovery_responses      -- Respostas do questionário

-- Plano e Tarefas
tasks                    -- Tarefas do usuário
routines                 -- Rotinas condicionais
focus_sessions          -- Sessões de foco registradas

-- Acompanhamento
check_ins               -- Check-ins de humor/energia
chat_messages           -- Histórico do chat
notifications           -- Notificações enviadas

-- Gamificação
achievements            -- Conquistas desbloqueadas
rewards                 -- Recompensas recebidas
streaks                 -- Sequências de dias

-- Comunidade
teams                   -- Times temáticos
team_members            -- Membros dos times
posts                   -- Posts da comunidade
comments                -- Comentários
reports                 -- Denúncias
challenges              -- Desafios dos times
```

---

## Planos de Assinatura

| Plano | Features | Preço Sugerido |
|-------|----------|----------------|
| **Gratuito** | Descoberta isolada (perfil + insights) | R$ 0 |
| **Básico** | Plano + Acompanhamento + Widgets + Modo Crise | R$ 19,90/mês |
| **Avançado** | + Voz + Relatórios + Educação + Comunidade | R$ 29,90/mês |
| **Profissional** | + Integração com terapeuta/coach | R$ 49,90/mês |

---

## Requisitos

- Node.js 18+
- pnpm 8+
- Expo CLI
- Supabase CLI (para desenvolvimento local)

## Setup

### 1. Clonar e instalar

```bash
git clone https://github.com/inematds/NCIAFlux.git
cd NCIAFlux

# Instalar pnpm se não tiver
npm install -g pnpm

# Instalar dependências
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
cp apps/mobile/.env.example apps/mobile/.env
# Editar com suas credenciais do Supabase
```

### 3. Supabase local (opcional)

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# Iniciar serviços
supabase start

# Aplicar migrations
supabase db reset
```

### 4. Rodar o app

```bash
# Iniciar o app mobile
pnpm dev:mobile

# Ou usando Expo diretamente
cd apps/mobile && npx expo start
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia todos os apps |
| `pnpm dev:web` | Inicia o app web (http://localhost:3000) |
| `pnpm dev:mobile` | Inicia o app mobile (Expo) |
| `pnpm build` | Build de produção |
| `pnpm lint` | Executa linting |
| `pnpm test` | Executa testes |
| `pnpm format` | Formata código |

---

## Tech Stack

| Camada | Tecnologia |
|--------|------------|
| **Web** | Next.js 14 + Tailwind CSS |
| **Mobile** | React Native 0.73 + Expo 50 |
| **Linguagem** | TypeScript 5.0 |
| **Navegação** | App Router (Web) / React Navigation 6 (Mobile) |
| **Estado** | Zustand + React Query |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Estilização** | Tailwind CSS (Web) / StyleSheet nativo (Mobile) |
| **Animações** | React Native Animated |
| **Armazenamento Local** | localStorage (Web) / AsyncStorage (Mobile) |
| **Monorepo** | Turborepo + pnpm |

### Web App - Funcionalidades por Role

| Funcionalidade | Usuário | Gestor/Admin |
|----------------|---------|--------------|
| Dashboard | Stats pessoais | Stats da equipe |
| Tarefas | CRUD próprias | CRUD próprias |
| Equipes | Não disponível | CRUD completo |
| Relatórios | Pessoais | Equipe + Individuais |
| Configurações | Perfil + Senha + Foto | Perfil + Senha + Foto |

---

## Roadmap

### Fase 1: Planejamento
- [x] Pesquisa de mercado
- [x] Análise de concorrentes
- [x] PRD completo
- [x] Especificação UX/UI
- [x] Arquitetura técnica

### Fase 2: MVP
- [x] Setup do monorepo
- [x] Autenticação
- [x] Módulo Descoberta
- [x] Módulo Plano
- [x] Módulo Acompanhamento
- [x] Experiência e Engajamento
- [x] Perfil Adaptativo

### Fase 3: Features Avançadas
- [x] Notificações avançadas
- [x] Biblioteca de relatórios
- [x] Pílulas educativas
- [x] Sistema de comunidade
- [ ] Chat por voz
- [ ] Integração WhatsApp

### Fase 4: Plano Profissional
- [ ] Vinculação com terapeuta
- [ ] Dashboard profissional
- [ ] Relatórios para profissional

### Fase 5: V2
- [ ] Sistema de plugins/MCPs
- [ ] Gamificação expandida
- [ ] Wearables
- [ ] Body doubling virtual

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [PRD](docs/prd.md) | Product Requirements Document |
| [Arquitetura](docs/architecture.md) | Arquitetura técnica detalhada |
| [Arquitetura do Sistema](docs/arquitetura-sistema.md) | Visão geral Web + Mobile + Backend |
| [Guia do Usuário](docs/guia-usuario.md) | Manual completo para usuários |
| [UX/UI Spec](docs/front-end-spec.md) | Especificação de interface |
| [Market Research](docs/market-research-analysis.md) | Análise de mercado |
| [Todo](docs/todo.md) | Plano de ação do projeto |
| [Stories](docs/stories/) | User stories detalhadas |

---

## Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Siga as stories em `docs/stories/`
4. Mantenha código limpo e tipado
5. Use commits convencionais (`feat:`, `fix:`, `docs:`)
6. Abra um Pull Request

---

## Licença

MIT

---

<div align="center">

Desenvolvido com assistência de IA usando o [BMad Method](https://github.com/bmad-method)

**NCIAFlux** - Porque produtividade não precisa ser sofrimento.

</div>
