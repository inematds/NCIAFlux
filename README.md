# NCIAFlux - NeuroFluxo

App de suporte para TDAH com descoberta de perfil cognitivo e acompanhamento personalizado.

**Seu fluxo, seu ritmo.**

## Estrutura do Projeto

```
NCIAFlux/
├── apps/
│   ├── mobile/          # App React Native (Expo)
│   └── web/             # Dashboard web (Next.js) - futuro
├── packages/
│   ├── shared/          # Tipos, constantes e utilitários
│   ├── ui/              # Componentes compartilhados - futuro
│   └── config/          # Configurações compartilhadas - futuro
├── supabase/
│   └── migrations/      # Migrations do banco de dados
├── docs/
│   ├── prd.md           # Product Requirements Document
│   ├── architecture.md  # Arquitetura técnica
│   ├── front-end-spec.md # Especificação UX/UI
│   └── stories/         # User stories detalhadas
└── v0/                  # Prompts para v0.dev
```

## Requisitos

- Node.js 18+
- pnpm 8+
- Expo CLI
- Supabase CLI (para desenvolvimento local)

## Setup

### 1. Instalar dependências

```bash
# Instalar pnpm se não tiver
npm install -g pnpm

# Instalar dependências
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar exemplo de .env
cp apps/mobile/.env.example apps/mobile/.env

# Editar com suas credenciais do Supabase
```

### 3. Iniciar Supabase local (opcional)

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# Iniciar serviços locais
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

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia todos os apps em modo desenvolvimento |
| `pnpm dev:mobile` | Inicia apenas o app mobile |
| `pnpm build` | Build de produção |
| `pnpm lint` | Executa linting em todos os pacotes |
| `pnpm test` | Executa testes |
| `pnpm format` | Formata código com Prettier |

## Tech Stack

- **Mobile**: React Native 0.73 + Expo 50
- **Web**: Next.js 14 (futuro)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **State**: Zustand + React Query
- **Navegação**: React Navigation 6
- **Estilização**: StyleSheet nativo
- **Feature Flags**: Flagsmith

## Documentação

- [PRD - Product Requirements Document](docs/prd.md)
- [Arquitetura Técnica](docs/architecture.md)
- [Especificação UX/UI](docs/front-end-spec.md)
- [User Stories](docs/stories/README.md)
- [Análise de Mercado](docs/market-research-analysis.md)

## Contribuição

1. Siga as stories documentadas em `docs/stories/`
2. Mantenha o código limpo e tipado
3. Escreva testes para novas funcionalidades
4. Use commits convencionais (feat:, fix:, docs:, etc.)

## Licença

MIT

---

Desenvolvido com assistência de IA usando o [BMad Method](https://github.com/bmad-method).
