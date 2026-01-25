# NeuroFluxo Mentes Brilhantes

<div align="center">

**v1.2** | Produtividade que entende você

Sistema de organização pessoal baseado em neurociência para pessoas com TDAH.

[![Version](https://img.shields.io/badge/Version-1.2-purple)](https://github.com/inematds/NCIAFlux)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[**Demo ao Vivo**](https://ncia-flux.vercel.app) | [**Documentação**](docs/)

</div>

---

## Sobre o Projeto

NCIAFlux (NeuroFluxo) é um aplicativo web projetado especificamente para pessoas com TDAH. Diferente de apps genéricos de produtividade, o NeuroFluxo entende que cada pessoa tem seu próprio ritmo e adapta suas ferramentas ao perfil cognitivo do usuário.

### Por que "Mentes Brilhantes"?

Porque acreditamos que cérebros neurodivergentes não são defeituosos - são diferentes. E com as ferramentas certas, podem brilhar.

### Diferenciais

- **Cronotipos**: Descubra seu perfil de produtividade (Leão, Urso, Lobo, Golfinho)
- **Brain Dump**: Capture pensamentos sem julgamento, organize depois
- **Planner Adaptativo**: Check-in de humor/energia que adapta o dia
- **Rotinas Condicionais**: Regras "se/então" para dias diferentes
- **Modo Crise**: Suporte imediato quando você trava
- **Sem Pressão**: Acompanhamento gentil, celebrações e micro-recompensas

---

## Funcionalidades

### v1.0 - Base

| Módulo | Descrição |
|--------|-----------|
| **Landing Page** | Apresentação do produto com CTA |
| **Autenticação** | Login, registro, recuperação de senha |
| **Demo Mode** | Experimente com dados de exemplo |
| **Brain Dump** | Captura de pensamentos com triagem e Top 1 diário |
| **Cronotipos** | Questionário de descoberta + perfil personalizado |
| **Planner Diário** | Check-in matinal, tarefas por período (manhã/tarde/noite) |
| **Rotinas** | Rotinas matinais e noturnas com passos condicionais |
| **Projetos** | Organize tarefas por projeto com cores e emojis |
| **Tarefas Unificadas** | Lista geral com filtros por status, projeto e período |
| **Calendário** | Visualização mensal de eventos e tarefas |
| **Notas** | Inbox rápido + organização em pastas |
| **Revisões Semanais** | Reflexão: vitórias, desafios, aprendizados |
| **Modo Foco** | Técnica Pomodoro com pausas guiadas |
| **Modo Crise** | Técnicas de grounding para momentos difíceis |
| **Relatórios** | Estatísticas de produtividade e padrões |
| **Equipes** | Gestão de equipe (visão admin) |
| **Configurações** | Preferências, foto, senha |

### v1.1 - Storage Local Aprimorado

| Feature | Descrição |
|---------|-----------|
| **Barra de Status** | Humor, energia, foco e tarefas no topo do dashboard |
| **Timer de Foco Integrado** | Escolha tecnica primeiro, depois tarefa para focar |
| **Check-in Acionavel** | Recomendacoes personalizadas apos registrar humor/energia |
| **Modo Crise com Jogos** | Mini-games para acalmar: bolhas, cores, respiracao |
| **Dados Demo** | Dados de exemplo completos para demonstracao |

### v1.2 - Multi-Perfil (Atual)

| Feature | Descrição |
|---------|-----------|
| **Multi-Usuario Local** | Suporte a multiplos perfis no mesmo dispositivo |
| **Storage Prefixado** | Dados isolados por usuario (nciaflux_${userId}_...) |
| **Switcher de Perfis** | Troca rapida entre contas no sidebar |
| **Visao Pessoal/Gestao** | Toggle para managers alternarem entre modos |
| **Botao Chat IA** | Teaser da versao Pro com chat por texto/voz |
| **Migracao Automatica** | Dados antigos migrados para novo formato |

### Roadmap

| Feature | Status |
|---------|--------|
| PWA (instalável no celular) | Planejado |
| Sincronização na nuvem | Planejado |
| Notificações push | Planejado |
| **Chat com IA (texto e voz)** | v2 - Pro |
| App mobile nativo | Futuro |
| Integração com terapeutas | Futuro |

#### v2 - Versão Pro

**Chat com IA**
- Converse com a IA para criar tarefas, fazer brain dump, ou pedir ajuda
- Comandos por voz para criar e gerenciar tarefas
- Sugestões personalizadas baseadas no seu perfil cognitivo

**Gestão de Equipes (Plano Empresarial)**
- **Admin**: Cria organizações e empresas, define permissões para gestores
- **Gestor**: Convida membros via email/ID, gerencia equipes
- **Convites**: Aparecem na tela de chat da equipe (não por email externo)
- **Toggle de Visão**: Gestores alternam entre visão pessoal e gestão de equipe
- **Dados Isolados**: Cada membro tem seus dados separados e privados

> Nota: Na versão atual, a Demo simula os 3 perfis (usuario/gestor/admin) para demonstração. O login normal cria apenas usuários comuns com tela limpa.

---

## Screenshots

### Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  Bom dia, João! ☀️                                      │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Tarefas  │ │ Projetos │ │ Rotinas  │ │ Energia  │   │
│  │    12    │ │    4     │ │   85%    │ │   ⚡ 7   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                         │
│  Top 1 de Hoje: Entregar relatório mensal              │
│                                                         │
│  Próximas Tarefas:                                      │
│  🔴 Reunião com cliente (10h)                          │
│  🟡 Revisar documentação                               │
│  🟢 Responder emails                                   │
└─────────────────────────────────────────────────────────┘
```

### Planner Diário
```
┌─────────────────────────────────────────────────────────┐
│  📅 Sexta, 24 de Janeiro                               │
│                                                         │
│  Como você está?  😊 😐 😔 😤                          │
│  Energia: ████████░░ 8/10                              │
│  Sono: ⭐⭐⭐⭐☆ 4/5                                    │
│                                                         │
│  ☀️ MANHÃ                                              │
│  ┌────────────────────────────────────────────┐        │
│  │ ⭐ Preparar apresentação         Em Andamento│       │
│  │ ☐ Revisar emails                   Pendente │        │
│  └────────────────────────────────────────────┘        │
│                                                         │
│  🌤️ TARDE                                              │
│  ┌────────────────────────────────────────────┐        │
│  │ ☐ Reunião de equipe               Pendente │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

## Arquitetura

### Estrutura do Projeto

```
NCIAFlux/
├── apps/
│   └── web/                      # App Web (Next.js 14)
│       └── src/
│           ├── app/              # App Router
│           │   ├── dashboard/    # Módulos do app
│           │   │   ├── brain-dump/
│           │   │   ├── calendar/
│           │   │   ├── chronotype/
│           │   │   ├── notes/
│           │   │   ├── planner/
│           │   │   ├── projects/
│           │   │   ├── review/
│           │   │   ├── routines/
│           │   │   ├── tasks/
│           │   │   └── ...
│           │   ├── demo/         # Modo demonstração
│           │   ├── login/        # Autenticação
│           │   └── register/
│           ├── components/       # Componentes reutilizáveis
│           └── lib/              # Utilitários e storage
├── packages/
│   └── shared/                   # Tipos compartilhados
├── docs/                         # Documentação
│   ├── prd.md                    # Product Requirements
│   ├── architecture.md           # Arquitetura técnica
│   └── stories/                  # User Stories
└── .bmad-core/                   # Framework BMad Method
```

### Tech Stack

| Camada | Tecnologia |
|--------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Linguagem** | TypeScript 5.0 |
| **Estilização** | Tailwind CSS 3.4 |
| **Storage** | localStorage (híbrido, preparado para backend) |
| **Deploy** | Vercel (auto-deploy via GitHub) |
| **Monorepo** | Turborepo + pnpm |

### Armazenamento

O app usa localStorage com estrutura preparada para migração para backend:

```typescript
// Chaves de storage
nciaflux_user          // Dados do usuário
nciaflux_tasks         // Tarefas unificadas
nciaflux_projects      // Projetos
nciaflux_notes         // Notas
nciaflux_routines      // Rotinas
nciaflux_dayplan       // Plano diário
nciaflux_braindump     // Brain dump
nciaflux_chronotype    // Perfil de cronotipo
nciaflux_reviews       // Revisões semanais
```

---

## Setup Local

### Requisitos

- Node.js 18+
- pnpm 8+

### Instalação

```bash
# Clonar repositório
git clone https://github.com/inematds/NCIAFlux.git
cd NCIAFlux

# Instalar pnpm (se necessário)
npm install -g pnpm

# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev:web
```

O app estará disponível em `http://localhost:3000`

### Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev:web` | Inicia em desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm lint` | Executa linting |

---

## Deploy

O projeto está configurado para deploy automático no Vercel:

1. Push para `main` dispara build
2. Preview deploys em PRs
3. Produção: https://ncia-flux.vercel.app

---

## Planos de Uso

| Plano | Features | Storage | Preço |
|-------|----------|---------|-------|
| **Gratuito** | Todas as funcionalidades | Local (dispositivo) | R$ 0 |
| **Premium** | + Sync na nuvem + Multi-dispositivo | Cloud | Futuro |
| **Empresarial** | + Gestão de equipes + Integrações | Cloud | Futuro |

> O plano gratuito oferece acesso completo. A diferença será sincronização entre dispositivos.

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [PRD](docs/prd.md) | Requisitos do produto |
| [Arquitetura](docs/architecture.md) | Arquitetura técnica |
| [Stories](docs/stories/) | User stories |

---

## Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Use commits convencionais (`feat:`, `fix:`, `docs:`)
4. Abra um Pull Request

---

## Licença

MIT

---

<div align="center">

Desenvolvido com assistência de IA usando o [BMad Method](https://github.com/bmad-method)

**NCIAFlux - NeuroFluxo** | Produtividade que entende você

</div>
