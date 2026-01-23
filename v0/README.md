# NCIAFlux - Prompts para v0.dev

Esta pasta contém prompts otimizados para gerar as telas do NCIAFlux no [v0.dev](https://v0.dev).

## Como Usar

1. Acesse [v0.dev](https://v0.dev)
2. Copie o conteúdo da seção "Prompt" de cada arquivo
3. Cole no v0.dev e gere
4. Itere conforme necessário

## Telas Disponíveis

### Fluxo de Descoberta (Gratuito)
| # | Arquivo | Tela | Prioridade |
|---|---------|------|------------|
| 01 | [01-welcome-screen.md](./01-welcome-screen.md) | Tela de Boas-vindas | Alta |
| 02 | [02-discovery-questionnaire.md](./02-discovery-questionnaire.md) | Questionário de Descoberta | Alta |
| 03 | [03-discovery-result.md](./03-discovery-result.md) | Resultado da Descoberta | Alta |

### Core App (Básico+)
| # | Arquivo | Tela | Prioridade |
|---|---------|------|------------|
| 04 | [04-dashboard-home.md](./04-dashboard-home.md) | Painel Principal (Home) | Alta |
| 05 | [05-daily-plan.md](./05-daily-plan.md) | Plano do Dia | Alta |
| 06 | [06-chat-checkin.md](./06-chat-checkin.md) | Chat / Check-in | Alta |
| 07 | [07-crisis-mode.md](./07-crisis-mode.md) | Modo Crise | Alta |
| 08 | [08-focus-block.md](./08-focus-block.md) | Bloco de Foco (Timer) | Média |

### Configurações e Perfil
| # | Arquivo | Tela | Prioridade |
|---|---------|------|------------|
| 09 | [09-notifications-settings.md](./09-notifications-settings.md) | Configurações de Notificações | Média |
| 10 | [10-profile-cognitive.md](./10-profile-cognitive.md) | Perfil Cognitivo | Média |
| 11 | [11-reports-library.md](./11-reports-library.md) | Biblioteca de Relatórios | Baixa |

### Widgets
| # | Arquivo | Tela | Prioridade |
|---|---------|------|------------|
| 12 | [12-widgets.md](./12-widgets.md) | Widgets iOS/Android | Média |

## Paleta de Cores (Referência Rápida)

```css
/* Cores Principais */
--primary: #4A90A4;
--primary-light: #7BB5C4;
--secondary: #E8A87C;
--accent: #85C88A;

/* Backgrounds */
--background: #F9FAFB;
--background-dark: #1A1D29;
--surface: #FFFFFF;
--surface-dark: #252836;

/* Texto */
--text-primary: #2D3748;
--text-secondary: #718096;
--text-muted: #A0AEC0;

/* Estados */
--success: #68D391;
--warning: #F6AD55;
--energy-low: #FC8181;
--energy-medium: #F6AD55;
--energy-high: #68D391;
```

## Tipografia

- **Headings:** Nunito (bold, 600-700)
- **Body:** Inter (regular, 400)
- **Monospace:** JetBrains Mono (para timers)

## Princípios de Design

1. **Calma sobre Produtividade** - Sem urgência, sem pressão
2. **Menos é Mais** - Uma ação por tela
3. **Feedback Gentil** - Celebrar, nunca punir
4. **Acessível** - WCAG 2.1 AA, considerar neurodivergência

## Ordem Sugerida de Geração

1. Welcome Screen (valida paleta e tom)
2. Discovery Questionnaire (valida interações)
3. Discovery Result (valida cards e celebração)
4. Dashboard Home (valida navegação)
5. Demais telas conforme necessidade

---

*Baseado em `docs/front-end-spec.md`*
