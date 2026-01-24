# Arquitetura do Sistema NCIAFlux

## Visao Geral

O NCIAFlux (NeuroFluxo) e um aplicativo de suporte para TDAH com arquitetura **monorepo** usando **Turborepo** e **pnpm**.

---

## Estrutura Geral

```
NCIAFlux/
├── apps/
│   ├── web/          # Aplicacao Web (Next.js 14)
│   └── mobile/       # Aplicacao Mobile (React Native + Expo)
├── packages/
│   ├── shared/       # Codigo compartilhado (tipos, constantes)
│   ├── config/       # Configuracoes compartilhadas
│   └── ui/           # Componentes UI compartilhados
└── supabase/         # Backend (Supabase)
```

---

## APP WEB (`apps/web`)

### Tecnologia
- **Framework:** Next.js 14 com App Router
- **Estilizacao:** Tailwind CSS
- **Linguagem:** TypeScript

### Estrutura de Rotas

```
/                     # Landing page
/login               # Login
/register            # Cadastro
/forgot-password     # Recuperar senha
/dashboard           # Dashboard principal
  /tasks             # Gerenciamento de tarefas
  /teams             # Gerenciamento de equipes
  /reports           # Relatorios
  /settings          # Configuracoes
/(static)
  /privacy           # Politica de privacidade
  /terms             # Termos de uso
  /contact           # Contato
```

### Armazenamento (Demo Mode)

O modo demo usa `localStorage` para persistencia local:

| Chave | Descricao |
|-------|-----------|
| `nciaflux_demo_user` | Dados do usuario logado |
| `nciaflux_tasks_{userId}` | Tarefas do usuario (isoladas por ID) |
| `nciaflux_settings` | Configuracoes do usuario |
| `nciaflux_teams` | Equipes criadas |

### Tipos de Dados

```typescript
interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'manager' | 'admin';
  company?: string;
  avatar_url?: string;
}

interface StoredTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate: string;
  category: string;
}

interface StoredTeam {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: StoredTeamMember[];
}
```

### Diferencas por Role

| Funcionalidade | Usuario (`user`) | Gestor (`manager`/`admin`) |
|----------------|------------------|---------------------------|
| Dashboard | Stats pessoais, acoes rapidas | Stats da equipe, visao geral |
| Equipes | "Nao disponivel" | CRUD completo de equipes |
| Relatorios | Relatorios pessoais | Relatorios de equipe + individuais |
| Tarefas | Apenas suas tarefas | Apenas suas tarefas |

---

## APP MOBILE (`apps/mobile`)

### Tecnologia
- **Framework:** React Native + Expo
- **Navegacao:** React Navigation 6
- **Estado:** Zustand + React Query
- **Linguagem:** TypeScript

### Estrutura de Navegacao

```
RootNavigator
├── AuthNavigator          # Fluxo de autenticacao
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
├── OnboardingNavigator    # Primeiro acesso
│   ├── QuestionnaireScreen
│   └── ProfileResultScreen
└── MainNavigator          # App principal
    ├── DashboardScreen    # Painel principal
    ├── PlanScreen         # Lista de tarefas
    ├── CheckInScreen      # Check-in diario
    ├── TaskDetailScreen   # Detalhes da tarefa
    ├── TeamDetailScreen   # Detalhes da equipe
    ├── ReportsScreen      # Relatorios
    ├── ChatScreen         # Assistente
    ├── CommunityScreen    # Comunidade
    ├── ProfileScreen      # Perfil do usuario
    ├── FocusBlockScreen   # Timer de foco
    ├── CrisisModeScreen   # Modo crise
    └── ...
```

### Fluxo de Autenticacao

```
┌─────────────────────────────────────────────────────────┐
│                    App Inicia                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     isLoading?        │
              └───────────────────────┘
                    │ Sim        │ Nao
                    ▼            ▼
            LoadingScreen   ┌───────────────────────┐
                            │   isAuthenticated?    │
                            └───────────────────────┘
                                  │ Nao      │ Sim
                                  ▼          ▼
                            AuthNavigator  ┌───────────────────────┐
                                           │ onboarding_completed? │
                                           └───────────────────────┘
                                                 │ Nao      │ Sim
                                                 ▼          ▼
                                           Onboarding   MainNavigator
```

### Armazenamento

| Tecnologia | Uso |
|------------|-----|
| `expo-secure-store` | Tokens de autenticacao |
| `AsyncStorage` | Dados gerais do app |
| Supabase | Backend real (quando configurado) |

---

## BACKEND (Supabase)

### Servicos Utilizados

| Servico | Funcao |
|---------|--------|
| **Auth** | Autenticacao de usuarios (email/senha) |
| **Database** | PostgreSQL para dados persistentes |
| **Storage** | Armazenamento de arquivos/imagens |
| **Realtime** | Atualizacoes em tempo real |

### Modo Demo

Quando `SUPABASE_URL` nao esta configurado:
- App funciona em modo offline
- Dados sao armazenados localmente
- Banner "Modo Demo" aparece na interface
- Qualquer email/senha funciona para login

---

## Comparacao Web vs Mobile

| Aspecto | Web | Mobile |
|---------|-----|--------|
| **Framework** | Next.js 14 | React Native + Expo |
| **Storage** | localStorage | SecureStore + AsyncStorage |
| **Auth** | localStorage simples | Supabase Auth ou Demo |
| **Navegacao** | App Router | React Navigation |
| **UI** | Tailwind CSS | StyleSheet nativo |
| **Publico Alvo** | Gestores/Dashboard | Usuarios individuais |
| **Modo Demo** | Sempre ativo | Quando sem Supabase |

---

## Executando o Projeto

### Requisitos
- Node.js 18+
- pnpm 8+
- Expo CLI (para mobile)

### Comandos

```bash
# Instalar dependencias
pnpm install

# Rodar Web (http://localhost:3000)
pnpm dev:web

# Rodar Mobile (Expo Dev Server)
pnpm dev:mobile

# Build de producao
pnpm build

# Lint e formatacao
pnpm lint
pnpm format
```

---

## Arquivos Principais

### Web

| Arquivo | Descricao |
|---------|-----------|
| `apps/web/src/lib/storage.ts` | Servico de localStorage |
| `apps/web/src/app/layout.tsx` | Layout principal |
| `apps/web/src/app/dashboard/page.tsx` | Dashboard (role-based) |
| `apps/web/src/app/dashboard/tasks/page.tsx` | Gerenciamento de tarefas |
| `apps/web/src/app/dashboard/teams/page.tsx` | Gerenciamento de equipes |
| `apps/web/src/app/dashboard/reports/page.tsx` | Relatorios |
| `apps/web/src/app/dashboard/settings/page.tsx` | Configuracoes |

### Mobile

| Arquivo | Descricao |
|---------|-----------|
| `apps/mobile/App.tsx` | Entry point |
| `apps/mobile/src/hooks/useAuth.tsx` | Hook de autenticacao |
| `apps/mobile/src/navigation/RootNavigator.tsx` | Navegacao principal |
| `apps/mobile/src/services/supabase.ts` | Cliente Supabase |
| `apps/mobile/src/screens/main/` | Telas principais |

---

*Ultima atualizacao: Janeiro 2025*
