# NeuroFluxo Mentes Brilhantes

<div align="center">

**v1.3** | Produtividade que entende você

Sistema de organização pessoal baseado em neurociência para pessoas com TDAH.

[![Version](https://img.shields.io/badge/Version-1.3-purple)](https://github.com/inematds/NCIAFlux)
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

## Autismo e TDAH em Números (2026)

Este projeto existe porque **milhões de pessoas** precisam de ferramentas que entendam como seus cérebros funcionam.

### Brasil

| Condição | Estimativa 2026 | Fonte |
|----------|-----------------|-------|
| **Autismo (TEA)** | 2,4 - 2,6 milhões | IBGE Censo 2022 (~1,2% da população) |
| **TDAH** | ~11 milhões | Estudos epidemiológicos (~7,6% crianças/adolescentes) |

> O Censo 2022 foi o **primeiro levantamento oficial brasileiro** a incluir dados sobre autismo.

### Mundo

| Condição | Estimativa 2026 | Prevalência |
|----------|-----------------|-------------|
| **Autismo (TEA)** | ~65 milhões | 1 em cada 127 pessoas (OMS) |
| **TDAH** | ~94 milhões | ~1,13% da população (GBD) |

### Por que isso importa?

Apps de produtividade tradicionais são feitos para cérebros neurotípicos. Pessoas com TDAH e autismo frequentemente:
- Têm dificuldade com listas rígidas e horários fixos
- Experimentam paralisia por análise e sobrecarga sensorial
- Precisam de lembretes gentis, não cobranças
- Funcionam melhor com recompensas imediatas e micro-vitórias

O NeuroFluxo foi projetado **desde o início** para essas necessidades.

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

### v1.2 - Multi-Perfil

| Feature | Descrição |
|---------|-----------|
| **Multi-Usuario Local** | Suporte a multiplos perfis no mesmo dispositivo |
| **Storage Prefixado** | Dados isolados por usuario (nciaflux_${userId}_...) |
| **Switcher de Perfis** | Troca rapida entre contas no sidebar |
| **Visao Pessoal/Gestao** | Toggle para managers alternarem entre modos |
| **Menu por Role** | Equipes visivel apenas para gestores/admins |
| **Demo com 3 Perfis** | Teste como Usuario, Gestor ou Admin |
| **Botao Chat IA** | Teaser da versao Pro com chat por texto/voz |
| **Migracao Automatica** | Dados antigos migrados para novo formato |

### v1.3 - Chat com IA (Atual)

| Feature | Descrição |
|---------|-----------|
| **Chat por Texto** | Converse com IA para criar tarefas, brain dump, pedir ajuda |
| **Comandos de Voz** | Fale para criar e gerenciar tarefas (Web Speech API) |
| **OpenRouter** | Gateway para escolher entre LLMs (Claude, GPT-4, Mistral) |
| **Tool Use** | IA executa ações na app (criar tarefas, ativar modo crise) |
| **Assistente Contextual** | Sugestões baseadas no perfil cognitivo e cronotipo |
| **Brain Dump por Voz** | Fale pensamentos, IA organiza automaticamente |
| **Listagem por Chat** | IA lista tarefas, eventos e brain dump do usuário |

---

## Roadmap

### v1.4 - Sistema Adaptativo + Cloud (Plano Plus)

| Feature | Descrição |
|---------|-----------|
| **Supabase Auth** | Login com Google/Email, sessão persistente |
| **Sync Offline-First** | Dados locais + sincronização quando online |
| **Multi-Device** | Acesse seus dados em qualquer dispositivo |
| **Importação em Massa** | Importar tarefas, eventos, notas, brain dump (CSV/ICS/JSON) |
| **Sistema Adaptativo** | App detecta padrões e ajusta experiência automaticamente |
| **Perfil TDAH** | Questionário de subtipo (hiperativo/desatento/combinado) |
| **Ferramentas de Avaliação** | Refazer questionários, editar perfil manualmente |
| **Relatório Pessoal** | Mapa de energia, padrões de humor, recomendações |
| **Liberação Progressiva** | Features liberadas conforme estabilidade do usuário |
| **Gamificação Básica** | Celebrações suaves, streaks gentis (sem punição por falha) |
| **Chat 1:1** | Conversa privada (parceiro accountability) |
| **Chat em Grupo** | Comunidades de apoio |

> Documentação: [docs/v1.4-adaptive-system.md](docs/v1.4-adaptive-system.md)

### v1.5 - Gestão de Times (Plano Pro)

| Feature | Descrição |
|---------|-----------|
| **Criar Times** | Gestor cria equipe e convida membros |
| **Roles** | Admin, Gestor, Membro com permissões diferentes |
| **Dashboard do Gestor** | Visão geral da equipe (dados anonimizados) |
| **Liberar Features** | Gestor pode habilitar features para membros |
| **Relatórios de Time** | Métricas agregadas da equipe |
| **Gamificação Avançada** | Conquistas, XP, níveis, desafios (liberado por estabilidade) |

### v1.6 - PWA e Notificações

| Feature | Descrição |
|---------|-----------|
| **PWA Instalável** | Instale no celular como app nativo |
| **Notificações Push** | Lembretes de tarefas, rotinas, check-in |
| **Modo Escuro** | Tema escuro para uso noturno |

### v1.7 - Voice Output (TTS)

| Feature | Descrição |
|---------|-----------|
| **Text-to-Speech** | Assistente responde por voz (Web Speech API) |
| **Vozes em PT-BR** | Escolha de vozes disponíveis |
| **Auto-Read Modo Crise** | Leitura automática quando sobrecarregado |
| **Controles de Voz** | Ajuste de velocidade e tom |

### v1.8 - Messaging Integration

| Feature | Descrição |
|---------|-----------|
| **Telegram Bot** | Interaja com o app via Telegram |
| **WhatsApp** | Integração via Business API ou web.js |
| **Email** | Resumos e lembretes por email |

> Documentação: [docs/v1.9-messaging-integration.md](docs/v1.9-messaging-integration.md)

### v1.9 - Integrações Externas

| Feature | Descrição |
|---------|-----------|
| **Google Calendar** | Sincronizar eventos com Google Agenda |
| **Apple Calendar** | Sincronizar com calendário Apple |
| **Outlook** | Integração com Microsoft 365 |
| **Importação Automática** | Sync contínuo de eventos externos |

### v2.0 - IA Avançada (Plano Premium)

| Feature | Descrição |
|---------|-----------|
| **IA Ilimitada** | Sem limite de mensagens no chat |
| **Resumo Diário** | IA resume seu dia e sugere próximos passos |
| **Análise Preditiva** | IA prevê dias difíceis e sugere preparação |

### v2.3 - Integração com Terapeutas

| Feature | Descrição |
|---------|-----------|
| **Vincular Terapeuta** | Usuário convida profissional de saúde |
| **Relatórios Clínicos** | Exportar humor, energia, padrões para terapeuta |
| **Modo Acompanhamento** | Terapeuta visualiza progresso (com permissão) |
| **Liberar Features** | Terapeuta pode habilitar features sensíveis |

### v2.5 - Testes e Estabilização

| Feature | Descrição |
|---------|-----------|
| **Testes Automatizados** | Cobertura de testes unitários e E2E |
| **CI/CD Pipeline** | Integração e deploy contínuos |
| **Testes de Segurança** | Auditoria de segurança completa |
| **Testes de Acessibilidade** | WCAG 2.1 compliance |
| **Beta Testing** | Programa de beta testers |

### v3.0 - App Nativo (Plano Empresarial)

| Feature | Descrição |
|---------|-----------|
| **App iOS Nativo** | Swift/SwiftUI para melhor performance |
| **App Android Nativo** | Kotlin para melhor performance |
| **Widgets Nativos** | Widgets para tela inicial |
| **Wearables** | Apple Watch e Wear OS |
| **Biometria** | Face ID, Touch ID, impressão digital |
| **Organizações** | Admin cria empresas e organizações |
| **API Pública** | Integrações com outros apps |

### Status do Desenvolvimento

```
v1.0 ████████████████████ 100% - Base completa
v1.1 ████████████████████ 100% - Storage local aprimorado
v1.2 ████████████████████ 100% - Multi-perfil
v1.3 ████████████████████ 100% - Chat com IA ← ATUAL
─────────────────────────────────────────────────
v1.4 ░░░░░░░░░░░░░░░░░░░░   0% - Sistema Adaptativo + Cloud + Gamificação
v1.5 ░░░░░░░░░░░░░░░░░░░░   0% - Gestão de Times (Pro)
v1.6 ░░░░░░░░░░░░░░░░░░░░   0% - PWA e Notificações
v1.7 ░░░░░░░░░░░░░░░░░░░░   0% - Voice Output (TTS)
v1.8 ░░░░░░░░░░░░░░░░░░░░   0% - Messaging (Telegram/WhatsApp)
v1.9 ░░░░░░░░░░░░░░░░░░░░   0% - Integrações Externas (Calendários)
v2.0 ░░░░░░░░░░░░░░░░░░░░   0% - IA Avançada (Premium)
v2.3 ░░░░░░░░░░░░░░░░░░░░   0% - Integração Terapeutas
v2.5 ░░░░░░░░░░░░░░░░░░░░   0% - Testes e Estabilização
v3.0 ░░░░░░░░░░░░░░░░░░░░   0% - App Nativo (Empresarial)
```

> **Nota:** Versão atual (v1.3). Demo simula 3 perfis (Usuario/Gestor/Admin) para demonstração.

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

| Plano | Features | Storage | Versão |
|-------|----------|---------|--------|
| **Free** | Funcionalidades pessoais | Local | v1.2 ✓ |
| **Team** | + Times + Chat equipe + P2P | Central + P2P | v1.5 |
| **Premium** | + Chat IA + Voz + Sync nuvem | Cloud | v2.0 |
| **Empresarial** | + Organizações + Apps nativos | Cloud | v3.0 |

### Detalhamento dos Planos

**Free (Disponível)**
- Todas as funcionalidades de produtividade pessoal
- Dados salvos localmente no navegador
- Multi-perfil no mesmo dispositivo
- PWA instalável (v1.6)
- Notificações locais (v1.7)
- Sem limite de uso

**Team (v1.5)**
- Tudo do Free +
- Criação e gestão de times
- Chat entre membros da equipe
- Convites por ID
- Central de descoberta de usuários
- Comunicação P2P após conexão
- Dashboard do gestor (dados anonimizados)

**Premium (v2.0)**
- Tudo do Team +
- Chat com IA por texto e voz
- Assistente contextual inteligente
- Brain dump por voz
- Sincronização na nuvem
- Backup automático
- Integração com terapeutas (v1.7)

**Empresarial (v3.0)**
- Tudo do Premium +
- Apps nativos iOS e Android
- Widgets e wearables
- Criação de organizações
- API pública para integrações
- Suporte prioritário
- SLA garantido

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
