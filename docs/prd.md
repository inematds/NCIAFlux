# NCIAFlux Product Requirements Document (PRD)

**Versão:** 1.2.1
**Data:** 25 de Janeiro de 2026
**Status:** Draft
**Umbrella Brand:** MentesBrilhantes

---

## 1. Goals and Background Context

### 1.1 Goals

- Criar uma experiência de descoberta isolada que entrega valor imediato em 5-7 minutos
- Desenvolver um sistema de plano diário adaptativo que respeita o fluxo real do cérebro ADHD
- Implementar acompanhamento gentil sem cobrança de métricas ou performance
- Oferecer estrutura de planos escalável (Free Local → Team Central+P2P → Premium Cloud → Empresarial)
- Posicionar o NCIAFlux como alternativa acessível no mercado brasileiro de apps ADHD
- Garantir que o sistema evolua com o usuário sem exigir redescoberta constante

### 1.2 Background Context

NCIAFlux (NeuroFluxo) surge como resposta a um mercado de apps ADHD que cresce a 15% ao ano (projetado para USD 7-12 bilhões até 2035), mas que frequentemente falha em atender às necessidades reais dos usuários. A pesquisa de mercado identificou problemas críticos nos concorrentes: preços abusivos (Numo $16/mês, Inflow $95/ano), interfaces sobrecarregadas, foco excessivo em produtividade punitiva, e falta de adaptação real ao usuário.

O NCIAFlux diferencia-se por três pilares: **Autoconhecimento** (descoberta do perfil cognitivo), **Adaptação Constante** (sistema que aprende com o uso), e **Sem Pressão** (acompanhamento gentil, não métrico). O público-alvo são adultos com TDAH ou dificuldades de foco/organização que buscam autogestão sustentável, não produtividade máxima.

### 1.3 Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-01-23 | 1.0 | Criação inicial do PRD | PM (BMad) |
| 2026-01-24 | 1.1 | Adição de módulos: Brain Dump, Cronotipos, Planner Diário, Rotinas, Revisões | PM (Claude) |
| 2026-01-24 | 1.2 | Arquitetura MentesBrilhantes (multi-perfil), Gestão de Projetos, Agenda, Notas | Architect (Winston) |
| 2026-01-25 | 1.2.1 | Roadmap atualizado: v1.5 Times, v1.6 PWA, v1.7 Notificacoes, v2.0 IA, v2.5 Testes, v3.0 Nativo. Planos: Free, Team, Premium, Empresarial | PM (Claude) |
| 2026-01-25 | 1.3.0 | Adicionado v1.3 Chat Input (OpenRouter), v1.8 Voice Output. Epic 15 criado | PM (Claude) |

### 1.4 MentesBrilhantes - Visão do Produto

**MentesBrilhantes** é o nome do projeto NeuroFluxo/NCIAFlux - um único produto que atende **qualquer pessoa** que precisa de uma forma simples de se organizar e monitorar suas atividades.

#### Filosofia do Produto

O MentesBrilhantes não é exclusivo para pessoas com TDAH. É para **qualquer pessoa** que:
- Tem dificuldade de organização
- Quer uma rotina mais estruturada
- Precisa de um sistema simples e sem pressão
- Busca autoconhecimento e produtividade sustentável

#### Princípios Unificados

| Princípio | Aplicação |
|-----------|-----------|
| **Simplicidade** | Interface limpa, poucas opções, ações em 1-3 toques |
| **Flexibilidade** | Funciona para quem quer pouco ou muito controle |
| **Sem Pressão** | Tom gentil, sem cobrança, métricas opcionais |
| **Adaptável** | Sistema aprende com o uso e se ajusta |
| **Acessível** | Grátis com todas features localmente |

#### Público-Alvo Expandido

```
┌─────────────────────────────────────────────────────────────┐
│                    MentesBrilhantes                         │
│              "Organize sua mente, simplifique sua vida"     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   👤 Adultos com TDAH                                       │
│   👤 Profissionais sobrecarregados                          │
│   👤 Estudantes que precisam de organização                 │
│   👤 Qualquer pessoa buscando rotina e foco                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Funcionalidades Personalizáveis

Em vez de perfis fixos, o usuário **personaliza** sua experiência:

- **Limite de tarefas diárias**: pode escolher 3, 5, 10 ou sem limite
- **Tom das notificações**: gentil, neutro ou motivador
- **Nível de detalhe**: simples (Dashboard básico) ou completo (Planner, Projetos, Agenda)
- **Modo Crise**: disponível para todos, ativado quando necessário
- **Cronotipos**: opcional, para quem quer adaptar horários

---

## 2. Requirements

### 2.1 Functional Requirements

#### Módulo Descoberta (Gratuito)

- **FR1**: O sistema deve apresentar um questionário de descoberta com duração de 5-7 minutos
- **FR2**: As perguntas devem ser exibidas uma por tela com linguagem humana (não clínica)
- **FR3**: As respostas devem ser por toque/deslizar (sem digitação obrigatória)
- **FR4**: O questionário deve cobrir: dificuldades atuais, energia/horários, estilo de execução, sobrecarga percebida
- **FR5**: Ao final, o sistema deve gerar um perfil resumido (1-2 frases)
- **FR6**: O sistema deve apresentar um insight central de clareza emocional
- **FR7**: O sistema deve fornecer 1 sugestão prática acionável
- **FR8**: O usuário deve poder salvar seu resultado
- **FR9**: O usuário deve poder compartilhar seu resultado
- **FR10**: A descoberta deve funcionar de forma completamente isolada, sem exigir cadastro ou compromisso

#### Módulo Plano Personalizado (Todos os planos)

- **FR11**: O perfil da descoberta deve se tornar automaticamente o perfil base ao continuar
- **FR12**: O plano diário deve conter: 1 prioridade real (Top 1), máximo 2 tarefas leves, 1 bloco de foco
- **FR13**: O sistema deve suportar rotinas condicionais no formato "se/então"
- **FR14**: O sistema deve sugerir no máximo 3 técnicas por vez (brain dump, starter step, pomodoro adaptado, blocos de energia)
- **FR15**: As técnicas devem mudar conforme padrões de uso
- **FR16**: O sistema deve permitir widgets de 1-toque para ações rápidas

#### Módulo Brain Dump Estruturado (Todos os planos)

- **FR59**: O sistema deve oferecer área dedicada para "despejo mental" (Brain Dump)
- **FR60**: O Brain Dump deve ter categorias pré-definidas: Ligar, Enviar mensagem, Enviar e-mail, Planejar, Pesquisar/Aprender, Fazer/Criar
- **FR61**: O usuário deve poder adicionar itens rapidamente por voz ou texto
- **FR62**: O sistema deve oferecer triagem automática em 3 categorias: Hoje (máx 3), Esta Semana (máx 5), Delegar/Pedir ajuda (máx 3)
- **FR63**: O Brain Dump deve ter área para "Meu Grande Objetivo" do dia/semana
- **FR64**: O sistema deve alertar quando lista ficar muito grande (> 10 itens não triados)
- **FR65**: A triagem deve resultar em Top 1 (prioridade absoluta) automaticamente sugerido

#### Módulo Cronotipos (Todos os planos)

- **FR66**: O questionário de descoberta deve identificar o cronotipo do usuário (Urso, Golfinho, Coruja, Leão)
- **FR67**: Cada cronotipo deve ter rotina diária específica pré-configurada:
  - **Urso**: Meditar pela manhã → Metas de conclusão parcial → Pausas para alongar → Tarefas leves
  - **Golfinho**: Priorizar listas → Trabalho profundo 3h → Técnica Pomodoro → Intervalos curtos
  - **Coruja**: Brain dump → Check-in diário → Tarefas desafiadoras → Definir metas para amanhã
  - **Leão**: Definir 1 prioridade → Criar ambiente de trabalho → Tarefas difíceis primeiro → Terminar com leves
- **FR68**: O usuário deve poder visualizar e ajustar a rotina do seu cronotipo
- **FR69**: O sistema deve sugerir horários ideais de foco baseado no cronotipo
- **FR70**: O cronotipo deve influenciar notificações e lembretes

#### Módulo Planner Diário (Todos os planos)

- **FR71**: O Planner deve exibir visão do dia dividida em períodos: Manhã, Tarde, Noite
- **FR72**: O Planner deve incluir seção de "Confirmação do dia" (intenção positiva)
- **FR73**: O Planner deve incluir seção de "Gratidão" (ação de graças)
- **FR74**: O Planner deve registrar humor do usuário via emojis (😊😐😔😰😴)
- **FR75**: O Planner deve registrar qualidade do sono da noite anterior (escala 1-10)
- **FR76**: O Planner deve ter lista de prioridades com limite visual (Top 1 destacado, máx 3 secundárias)
- **FR77**: O Planner deve mostrar rotina matinal por horário (ex: 6h dormir, 7h acordar, 8h meditação)
- **FR78**: O Planner deve mostrar rotina noturna por horário (ex: 17h sair trabalho, 20h exercício, 21h descanso)
- **FR79**: O Planner deve ter campo "Revisão para hoje" (nota 1-10 de como espera o dia)

#### Módulo Rotinas Matinal e Noturna (Todos os planos)

- **FR80**: O sistema deve oferecer construtor de rotina matinal em formato de fluxograma visual
- **FR81**: A rotina matinal deve usar decisões condicionais: "Você dormiu bem?" → Sim/Não → caminhos diferentes
- **FR82**: Exemplos de condições matinais: qualidade do sono, toma banho de manhã, espaço bagunçado
- **FR83**: A rotina matinal deve culminar em: "Criar lista de tarefas do dia"
- **FR84**: O sistema deve oferecer construtor de rotina noturna similar
- **FR85**: A rotina noturna deve incluir: preparação para amanhã, revisão do dia, descompressão
- **FR86**: O usuário deve poder configurar horário de início de cada rotina
- **FR87**: O sistema deve enviar notificação gentil no horário da rotina configurada
- **FR88**: Tipo de personalidade (MBTI simplificado) pode influenciar sugestões de rotina

#### Módulo Sistema de Revisão (Todos os planos)

- **FR89**: O sistema deve oferecer Revisão Matinal com pergunta: "O que me deixa orgulhoso esta manhã?"
- **FR90**: O sistema deve oferecer Revisão Noturna com perguntas:
  1. "O que me deixou orgulhoso hoje?"
  2. "O que eu mudaria amanhã? (uma coisa)"
- **FR91**: As revisões devem ser opcionais e rápidas (máx 2 minutos)
- **FR92**: O sistema deve armazenar histórico de revisões para identificar padrões
- **FR93**: Revisões nunca devem ter tom de cobrança - sempre de auto-observação gentil
- **FR94**: O sistema pode sugerir insights baseados em revisões anteriores (ex: "Você mencionou sono 3x esta semana")

#### Módulo Gestão de Projetos (Todos os planos)

- **FR95**: O sistema deve permitir criar Projetos como containers para agrupar tarefas relacionadas
- **FR96**: Cada Projeto deve ter: nome, cor, emoji (opcional), status (ativo/arquivado/concluído)
- **FR97**: Tarefas podem ser associadas a um Projeto (associação opcional)
- **FR98**: O sistema deve permitir visualizar todas as tarefas de um Projeto específico
- **FR99**: O sistema deve mostrar progresso do Projeto (% de tarefas concluídas)
- **FR100**: Projetos podem ser arquivados (mantendo histórico) ou excluídos
- **FR101**: Filtro por Projeto deve estar disponível no Planner e Dashboard
- **FR102**: Limite de Projetos ativos deve ser configurável por perfil (adhd=5, productivity=20, teams=ilimitado)

#### Módulo Agenda/Calendário (Todos os planos)

- **FR103**: O sistema deve oferecer visualização de Agenda em formato dia/semana
- **FR104**: Tarefas com data agendada devem aparecer automaticamente na Agenda
- **FR105**: O sistema deve permitir criar Eventos independentes de tarefas
- **FR106**: Eventos devem ter: título, descrição, horário início/fim, recorrência, cor
- **FR107**: Blocos de rotina (matinal/noturna) devem aparecer na Agenda automaticamente
- **FR108**: O sistema deve permitir arrastar tarefas para a Agenda para agendá-las
- **FR109**: (V1) Agenda funciona apenas localmente no sistema
- **FR110**: (V2) Integração com Google Calendar via OAuth
- **FR111**: (V2) Integração com Apple Calendar via CalDAV
- **FR112**: (V2) Integração com Outlook via Microsoft Graph API
- **FR113**: (V2) Sincronização bidirecional com calendários externos

#### Módulo Notas/Anotações (Todos os planos)

- **FR114**: O sistema deve oferecer área de captura rápida de Notas
- **FR115**: Notas devem ter: conteúdo (texto), data criação, status (inbox/processada/arquivada)
- **FR116**: O sistema deve ter área "Inbox" para processar notas pendentes
- **FR117**: Uma Nota pode ser convertida em Tarefa com 1 ação
- **FR118**: Uma Nota pode ser convertida em Evento de Agenda com 1 ação
- **FR119**: Notas podem ser associadas a Projetos
- **FR120**: O sistema deve permitir captura rápida de Nota via botão flutuante "+"
- **FR121**: (Avançado) Notas podem ter tags para categorização
- **FR122**: Integração Brain Dump: Notas podem ser enviadas para categorias do Brain Dump

#### Módulo Acompanhamento (Todos os planos)

- **FR17**: O painel visual deve ser acessível em 1 toque com design limpo
- **FR18**: O painel deve mostrar: prioridade do dia, energia do dia, foco iniciado, botão de ajuste
- **FR19**: Todas as interações do painel devem ser clicáveis (sem digitação)
- **FR20**: O chat conversacional deve ser opcional (texto no Básico, voz no Avançado)
- **FR21**: O chat deve coletar sinais leves, não histórias longas
- **FR22**: Os check-ins devem ser 1-2 interações por dia no máximo

#### Módulo Notificações (Todos os planos)

- **FR23**: O sistema de notificações deve iniciar no modo mais simples possível
- **FR24**: O usuário deve poder ativar notificações adicionais conforme desejo
- **FR25**: O usuário deve poder escolher canal (app, WhatsApp, outro)
- **FR26**: O usuário deve poder escolher horário e frequência
- **FR27**: As mensagens devem ter tom de convite, não cobrança
- **FR28**: (Avançado) O usuário deve poder configurar cada notificação individualmente

#### Módulo Relatórios (Todos os planos)

- **FR29**: O relatório simples deve ser o padrão e sempre visível
- **FR30**: (Avançado) O sistema deve oferecer biblioteca de relatórios avançados
- **FR31**: (Avançado) O usuário deve poder selecionar quais relatórios ficam disponíveis
- **FR32**: Os relatórios selecionados devem ficar em área dedicada, acessíveis quando o usuário quiser
- **FR33**: O sistema nunca deve empurrar métricas automaticamente

#### Módulo Perfil Adaptativo (Todos os planos)

- **FR34**: O sistema deve coletar sinais leves de uso (início de tarefas, conclusão, energia, horários)
- **FR35**: O sistema deve fazer ajustes automáticos pequenos (tarefas, horário de foco, técnicas, rotina)
- **FR36**: A redescoberta pontual só deve ocorrer se: usuário pedir, rotina mudar muito, ou adesão cair significativamente
- **FR37**: Na redescoberta, apenas partes relevantes devem ser refeitas

#### Módulo Experiência e Engajamento (Todos os planos)

- **FR38**: O sistema deve fornecer micro-recompensas visuais ao completar ações
- **FR39**: O sistema deve celebrar progressos de forma visual e gentil
- **FR40**: O sistema deve oferecer "Modo Crise" com rotina mínima para dias difíceis
- **FR41**: O Modo Crise deve simplificar drasticamente as expectativas sem julgamento

#### Módulo Educação (Avançado)

- **FR42**: O tutorial do sistema deve estar sempre disponível (Todos os planos)
- **FR43**: As pílulas educativas devem ser liberadas gradualmente pela gestão
- **FR44**: A gestão deve controlar quais conteúdos aparecem por plano
- **FR45**: O sistema deve poder expandir conteúdos sem necessidade de deploy

#### Módulo Comunidade (Avançado)

- **FR46**: A comunidade deve estar disponível apenas no plano Avançado+
- **FR47**: A gestão deve poder habilitar/desabilitar comunidade por plano
- **FR48**: O sistema deve suportar times temáticos
- **FR49**: A comunidade deve ter sistema de moderação antes de ativação

#### Módulo Profissional (Plano Profissional)

- **FR50**: O usuário deve poder vincular um terapeuta/coach à sua conta
- **FR51**: O sistema deve gerar relatórios específicos para profissionais
- **FR52**: O profissional deve ter dashboard próprio para acompanhamento
- **FR53**: O acompanhamento supervisionado deve ter controles de privacidade

#### Gestao de Planos

- **FR54**: O sistema deve suportar 4 niveis de plano: Free (local), Team (central+P2P), Premium (cloud+IA), Empresarial (nativo)
- **FR55**: O plano Free inclui TODAS as funcionalidades pessoais com dados armazenados localmente no dispositivo
- **FR56**: O plano Team adiciona times com central de descoberta, chat de equipe e comunicacao P2P
- **FR56.1**: O plano Premium adiciona chat com IA por texto/voz, sincronizacao na nuvem e integracao com terapeutas
- **FR56.2**: O plano Empresarial adiciona apps nativos iOS/Android, widgets, wearables, organizacoes e API publica
- **FR57**: O upgrade/downgrade deve ser fluido sem perda de dados
- **FR58**: Dados locais podem ser migrados para nuvem ao fazer upgrade

#### Módulo Demo (Marketing/Showcase)

- **FR123**: O sistema deve oferecer login de demonstração "/demo" na tela inicial
- **FR124**: O modo demo deve simular diferentes cenários de uso com dados fictícios:
  - **Demo Básico**: Usuário iniciante com poucas tarefas e descoberta recente
  - **Demo Completo**: Usuário ativo com projetos, tarefas, rotinas configuradas
  - **Demo Cronotipo**: Foco na rotina por cronotipo (Urso, Golfinho, Coruja, Leão)
- **FR125**: Dados do demo são pré-carregados e não persistem entre sessões
- **FR126**: Banner ou indicador visual claro de "Modo Demonstração"
- **FR127**: Botão "Criar minha conta" sempre visível durante o demo
- **FR128**: Demo funciona 100% offline (dados embarcados no app)
- **FR129**: Demo permite testar todas as funcionalidades sem restrição

### 2.2 Non-Functional Requirements

#### Performance

- **NFR1**: O questionário de descoberta deve carregar em menos de 2 segundos
- **NFR2**: Transições entre telas devem ter latência máxima de 300ms
- **NFR3**: O painel principal deve carregar em menos de 1 segundo
- **NFR4**: Notificações devem ser entregues com precisão de ±1 minuto do horário configurado

#### Usabilidade

- **NFR5**: Qualquer ação principal deve ser completável em no máximo 3 toques
- **NFR6**: A interface deve evitar sobrecarga visual (considerar comorbidade ASD)
- **NFR7**: O sistema deve funcionar bem com leitores de tela (acessibilidade básica)
- **NFR8**: Textos devem ter opção de tamanho ajustável

#### Segurança e Privacidade

- **NFR9**: Dados sensíveis de saúde mental devem ser criptografados em repouso e trânsito
- **NFR10**: O sistema deve permitir exportação completa de dados do usuário (LGPD)
- **NFR11**: O sistema deve permitir exclusão completa de conta e dados (LGPD)
- **NFR12**: Dados compartilhados com profissionais devem ter consentimento explícito

#### Disponibilidade

- **NFR13**: O sistema deve ter disponibilidade mínima de 99.5%
- **NFR14**: Funcionalidades core (painel, check-in) devem funcionar offline com sync posterior

#### Escalabilidade

- **NFR15**: O sistema deve suportar crescimento de 10x em usuários sem degradação
- **NFR16**: A arquitetura deve permitir expansão para novos módulos (V2 features)
- **NFR17**: A arquitetura deve ser preparada para sistema de plugins/extensões (V2)

#### Manutenibilidade

- **NFR17**: Conteúdos educativos devem ser gerenciáveis via CMS sem deploy
- **NFR18**: Features por plano devem ser configuráveis via feature flags
- **NFR19**: A gestão deve poder habilitar/desabilitar features por plano sem código

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

Interface minimalista, acolhedora e não-clínica que respeita cérebros neurodivergentes. O design deve transmitir calma, não produtividade agressiva. Cada tela deve ter propósito único e claro. O fluxo deve ser intuitivo a ponto de não precisar de explicações.

**Princípios:**
- Menos é mais (evitar sobrecarga sensorial)
- Feedback visual imediato (micro-recompensas)
- Ações em no máximo 3 toques
- Tom gentil em todas as mensagens
- Cores suaves com alto contraste para legibilidade

### 3.2 Key Interaction Paradigms

- **Toque único** para ações principais (iniciar foco, marcar tarefa, check-in)
- **Deslizar** para navegação e respostas rápidas no questionário
- **Pull-to-refresh** para atualizar plano
- **Long press** para opções secundárias
- **Widgets** para ações sem abrir o app

### 3.3 Core Screens and Views

1. **Tela de Descoberta** - Questionário uma pergunta por vez (inclui identificação de cronotipo)
2. **Tela de Resultado** - Perfil + cronotipo + insight + sugestão
3. **Painel Principal (Dashboard)** - Prioridade Top 1, energia, foco, humor, acesso rápido
4. **Planner Diário** - Visão manhã/tarde/noite com rotinas, tarefas e revisões
5. **Brain Dump** - Área de despejo mental com categorias e triagem
6. **Construtor de Rotina Matinal** - Fluxograma visual com decisões se/então
7. **Construtor de Rotina Noturna** - Fluxograma visual com preparação para amanhã
8. **Timer de Foco** - Pomodoro adaptado com técnicas do cronotipo
9. **Tela de Revisão** - Perguntas de reflexão (manhã e noite)
10. **Chat de Acompanhamento** - Interface conversacional leve
11. **Configurações de Notificações** - Simples e avançada
12. **Biblioteca de Relatórios** - Cards de relatórios disponíveis
13. **Modo Crise** - Interface ultra-simplificada
14. **Perfil/Configurações** - Gestão de conta, cronotipo e plano
15. **Comunidade** (Avançado) - Feed e times
16. **Lista de Projetos** - Visualização de todos os projetos com progresso
17. **Detalhe do Projeto** - Tarefas do projeto, progresso, status
18. **Agenda/Calendário** - Visualização dia/semana com eventos e tarefas agendadas
19. **Notas (Inbox)** - Área de captura rápida e processamento de notas
20. **Captura Rápida** - Modal/overlay para adicionar nota com 1 toque

### 3.4 Accessibility

**WCAG AA** com atenção especial a:
- Contraste de cores adequado
- Suporte a leitores de tela
- Tamanhos de fonte ajustáveis
- Navegação por teclado (web)
- Evitar animações que causem desconforto
- Opção de reduzir movimento

### 3.5 Branding

- **Nome**: NCIAFlux
- **Conceito**: NeuroFluxo
- **Logo**: Cérebro estilizado com linhas coloridas fluidas representando fluxo
- **Paleta**: Cores suaves e acolhedoras (referência nos assets em `doc/`)
- **Tom de voz**: Gentil, encorajador, não-clínico, sem julgamento
- **Taglines**: Autoconhecimento • Adaptação Constante • Sem Pressão

### 3.6 Target Device and Platforms

**Mobile First** (iOS e Android) com **Web Responsive** como secundário.

- Prioridade 1: App iOS
- Prioridade 2: App Android
- Prioridade 3: Web responsiva (PWA)
- Widgets nativos para iOS e Android

---

## 4. Technical Assumptions

### 4.1 Repository Structure

**Monorepo** com separação clara entre:
- `/mobile` - App React Native ou Flutter
- `/web` - Web app (se PWA)
- `/api` - Backend/API
- `/shared` - Código compartilhado
- `/cms` - Gestão de conteúdo
- `/docs` - Documentação

### 4.2 Service Architecture

**Serverless-first** com possibilidade de migração:
- API serverless (AWS Lambda, Vercel Functions, ou similar)
- Banco de dados gerenciado (PostgreSQL ou MongoDB)
- Autenticação via serviço gerenciado (Auth0, Firebase Auth, ou Supabase)
- Storage para assets (S3 ou similar)
- Sistema de notificações (Firebase Cloud Messaging, OneSignal)
- Feature flags (LaunchDarkly, Flagsmith, ou próprio)

### 4.3 Testing Requirements

**Unit + Integration** com foco em:
- Testes unitários para lógica de negócio (perfil, adaptação, planos)
- Testes de integração para fluxos críticos (descoberta, check-in)
- Testes E2E para jornadas principais (smoke tests)
- Cobertura mínima de 70% para código crítico

### 4.4 Additional Technical Assumptions and Requests

- **Linguagem principal**: TypeScript (frontend e backend)
- **Framework mobile**: A definir (React Native ou Flutter)
- **Estado**: Solução offline-first com sync (ex: WatermelonDB, Realm)
- **CI/CD**: GitHub Actions ou similar
- **Monitoramento**: Sentry para erros, analytics básico
- **Internacionalização**: Preparar para pt-BR inicialmente, com estrutura para expansão
- **Feature flags**: Essencial para gestão de features por plano
- **CMS headless**: Para conteúdos educativos e mensagens configuráveis

---

## 5. Epic List

### Visão Geral dos Épicos

#### v1.0-v1.2 - Base (Free) - ATUAL

| Epic | Título | Objetivo |
|------|--------|----------|
| 1 | Fundação e Descoberta | Setup do projeto + módulo de descoberta completo (entrega valor isolado) |
| 2 | Plano e Painel | Sistema de plano personalizado + painel principal |
| 3 | Acompanhamento e Adaptação | Chat, check-ins, notificações e perfil adaptativo |
| 4 | Experiência e Engajamento | Micro-recompensas, widgets, modo crise |
| 5 | Features Avançadas | Relatórios avançados, educação, comunidade |
| 6 | Plano Profissional | Integração com terapeutas e acompanhamento supervisionado |
| 7 | Sistema de Produtividade TDAH | Brain Dump, Cronotipos, Planner Diário, Rotinas e Revisões |
| 8 | Organização Avançada | Gestão de Projetos, Agenda/Calendário e Sistema de Notas |

#### v1.5 - Times (Plano Team)

| Epic | Título | Objetivo |
|------|--------|----------|
| 9 | Interação entre Usuários | Usuários locais podem interagir dentro do time |
| 10 | Central de Descoberta | Servidor central para usuários se encontrarem |
| 11 | Sistema de Convites | Gestor convida membros via ID único |
| 12 | Chat de Equipe | Comunicação entre membros do time |
| 13 | Comunicação P2P | Após descoberta, comunicação direta peer-to-peer |
| 14 | Dashboard do Gestor | Visão geral da equipe (dados anonimizados) |

#### v1.6 - PWA e Testes

| Epic | Título | Objetivo |
|------|--------|----------|
| 15 | PWA Instalável | Instale no celular como app nativo |
| 16 | Modo Offline | Funciona sem internet, sincroniza depois |
| 17 | Testes Automatizados | Cobertura de testes unitários e E2E |
| 18 | CI/CD Pipeline | Integração e deploy contínuos |
| 19 | Modo Escuro | Tema escuro para uso noturno |

#### v1.7 - Notificações e Terapeutas

| Epic | Título | Objetivo |
|------|--------|----------|
| 20 | Notificações Locais | Lembretes de tarefas, rotinas, check-in |
| 21 | Notificações de Time | Alertas de mensagens e convites |
| 22 | Integração Terapeutas | Compartilhe progresso com profissionais |
| 23 | Relatórios para Terapeuta | Exportar dados de humor, energia, produtividade |
| 24 | Modo Acompanhamento | Terapeuta visualiza progresso (com permissão) |

#### v2.0 - Chat com IA (Plano Premium)

| Epic | Título | Objetivo |
|------|--------|----------|
| 25 | Chat por Texto com IA | Converse com IA para criar tarefas, brain dump, pedir ajuda |
| 26 | Comandos de Voz | Fale para criar e gerenciar tarefas |
| 27 | Assistente Contextual | Sugestões baseadas no perfil cognitivo e cronotipo |
| 28 | Brain Dump por Voz | Fale pensamentos, IA organiza automaticamente |
| 29 | Resumo Diário | IA resume seu dia e sugere próximos passos |
| 30 | Sync na Nuvem | Dados sincronizados para usuários Premium |

#### v2.5 - Testes e Estabilização

| Epic | Título | Objetivo |
|------|--------|----------|
| 31 | Testes de Carga | Performance sob alta demanda |
| 32 | Testes de Segurança | Auditoria de segurança completa |
| 33 | Testes de Acessibilidade | WCAG 2.1 compliance |
| 34 | Beta Testing | Programa de beta testers |
| 35 | Documentação API | Documentação completa para integrações |

#### v3.0 - App Nativo (Plano Empresarial)

| Epic | Título | Objetivo |
|------|--------|----------|
| 36 | App iOS Nativo | Swift/SwiftUI para melhor performance |
| 37 | App Android Nativo | Kotlin para melhor performance |
| 38 | Widgets Nativos | Widgets para tela inicial |
| 39 | Wearables | Apple Watch e Wear OS |
| 40 | Biometria | Face ID, Touch ID, impressão digital |
| 41 | Organizações | Admin cria empresas e organizações |
| 42 | API Pública | Integrações com outros apps |

### Features Adicionais (Futuras)

| Feature | Descrição |
|---------|-----------|
| Plugins/MCPs | Sistema para desenvolvedores externos criarem extensões e integrações |
| Modo trabalho profundo | Sessões longas de foco intenso |
| Modo família/casal | Perfis compartilhados e sincronização |
| Integração wearables | Dados de sono e atividade física |
| Body doubling virtual | Sessões com outros usuários |
| Gamificação expandida | Níveis, conquistas, desafios |
| IA conversacional avançada | Chat mais inteligente |
| Marketplace de técnicas | Usuários compartilham o que funciona |
| **Integrações de Calendário** | Google Calendar, Apple Calendar, Outlook (OAuth/CalDAV/Graph API) |
| **Sincronização de Notas** | Integração com Notion, Obsidian, Apple Notes |
| **Projetos Colaborativos** | Compartilhar projetos com outros usuários |

### Roadmap e Status

```
v1.0 ████████████████████ 100% - Base completa
v1.1 ████████████████████ 100% - Storage local aprimorado
v1.2 ████████████████████ 100% - Multi-perfil ← ATUAL
─────────────────────────────────────────────────
v1.3 ░░░░░░░░░░░░░░░░░░░░   0% - Chat Input (Texto + Voz via OpenRouter)
v1.5 ░░░░░░░░░░░░░░░░░░░░   0% - Times (Plano Team)
v1.6 ░░░░░░░░░░░░░░░░░░░░   0% - PWA e Testes
v1.7 ░░░░░░░░░░░░░░░░░░░░   0% - Notificações e Terapeutas
v1.8 ░░░░░░░░░░░░░░░░░░░░   0% - Voice Output (TTS)
v2.0 ░░░░░░░░░░░░░░░░░░░░   0% - Sync Cloud + IA Avancada (Premium)
v2.5 ░░░░░░░░░░░░░░░░░░░░   0% - Testes e Estabilização
v3.0 ░░░░░░░░░░░░░░░░░░░░   0% - App Nativo (Plano Empresarial)
```

### Planos de Uso

| Plano | Features | Storage | Versão |
|-------|----------|---------|--------|
| **Free** | Funcionalidades pessoais + Chat IA (limitado) | Local | v1.3 |
| **Team** | + Times + Chat equipe + P2P | Central + P2P | v1.5 |
| **Premium** | + Voice Output + Sync nuvem + IA ilimitada | Cloud | v2.0 |
| **Empresarial** | + Organizações + Apps nativos | Cloud | v3.0 |

---

## 6. Epic Details

### Epic 1: Fundação e Descoberta

**Objetivo**: Estabelecer a infraestrutura base do projeto e entregar o módulo de Descoberta completo como produto isolado funcional. Ao final deste épico, usuários poderão fazer a descoberta e receber seu perfil, mesmo sem as features de plano.

#### Story 1.1: Setup do Projeto e Infraestrutura Base

**Como** desenvolvedor,
**Quero** ter o projeto configurado com estrutura, CI/CD e ambiente de desenvolvimento,
**Para que** possamos começar a desenvolver features com qualidade.

**Acceptance Criteria:**
1. Repositório monorepo criado com estrutura de pastas definida
2. Configuração de TypeScript, linting (ESLint) e formatação (Prettier)
3. Pipeline de CI básico funcionando (lint, type-check)
4. Ambiente de desenvolvimento local documentado e funcional
5. README com instruções de setup
6. Estrutura de feature flags implementada

#### Story 1.2: Autenticação e Gestão de Usuários Base

**Como** usuário,
**Quero** poder criar conta e fazer login de forma simples,
**Para que** meus dados sejam salvos com segurança.

**Acceptance Criteria:**
1. Registro com email/senha funcional
2. Login funcional com sessão persistente
3. Opção de login social (Google) disponível
4. Fluxo de recuperação de senha implementado
5. Sessão offline funciona para usuários já logados
6. LGPD: Termos de uso e política de privacidade no registro

#### Story 1.3: Tela de Questionário de Descoberta

**Como** usuário,
**Quero** responder perguntas simples sobre como meu cérebro funciona,
**Para que** o sistema entenda meu perfil e cronotipo.

**Acceptance Criteria:**
1. Interface de questionário com uma pergunta por tela
2. Navegação por deslizar ou toque
3. Progresso visual mostrando etapa atual
4. Perguntas cobrem: dificuldades, energia/horários, estilo de execução, sobrecarga
5. Perguntas incluem identificação de cronotipo (horário de pico, sono, preferências)
6. Tempo total de 5-7 minutos
7. Linguagem humana e não-clínica em todas as perguntas
8. Possibilidade de pausar e continuar depois

#### Story 1.4: Motor de Geração de Perfil e Cronotipo

**Como** sistema,
**Quero** processar as respostas do questionário,
**Para que** gere um perfil cognitivo personalizado com cronotipo identificado.

**Acceptance Criteria:**
1. Algoritmo processa respostas e gera perfil estruturado
2. Perfil contém: resumo (1-2 frases), insight central, sugestão prática
3. Sistema identifica cronotipo do usuário: Urso, Golfinho, Coruja ou Leão
4. Cronotipo determina rotina diária sugerida inicial
5. Perfil é salvo no banco de dados associado ao usuário
6. Lógica permite extensão futura (mais dimensões de perfil)
7. Testes unitários cobrem casos principais de geração e identificação de cronotipo

#### Story 1.5: Tela de Resultado da Descoberta

**Como** usuário,
**Quero** ver meu perfil e cronotipo de forma clara e inspiradora,
**Para que** me sinta compreendido e tenha clareza sobre como agir.

**Acceptance Criteria:**
1. Tela exibe perfil resumido de forma visual e acolhedora
2. Cronotipo identificado com ícone e descrição (Urso 🐻, Golfinho 🐬, Coruja 🦉, Leão 🦁)
3. Rotina sugerida baseada no cronotipo apresentada visualmente
4. Insight central destacado com linguagem empática
5. Sugestão prática acionável claramente apresentada
6. Botão para salvar resultado
7. Botão para compartilhar resultado (gera imagem ou link)
8. Opção clara de "Continuar usando o app" vs "Apenas salvar"
9. Nenhuma pressão para continuar - experiência completa mesmo sem cadastro pago

#### Story 1.6: Fluxo de Descoberta sem Cadastro

**Como** usuário curioso,
**Quero** fazer a descoberta sem precisar criar conta,
**Para que** receba valor imediato sem compromisso.

**Acceptance Criteria:**
1. Descoberta pode ser iniciada sem login
2. Resultado é exibido normalmente
3. Ao tentar salvar, usuário é convidado a criar conta
4. Dados do questionário são preservados durante criação de conta
5. Experiência fluida sem perda de dados

---

### Epic 2: Plano e Painel

**Objetivo**: Implementar o sistema de plano diário personalizado e o painel principal, permitindo que usuários do plano Todos os planos tenham uma rotina adaptada ao seu perfil.

#### Story 2.1: Estrutura de Planos e Armazenamento

**Como** sistema,
**Quero** ter estrutura de planos (Gratuito Local, Premium Cloud, Empresarial),
**Para que** usuarios tenham acesso a todas funcionalidades com opcao de sincronizacao.

**Acceptance Criteria:**
1. Modelo de dados suporta diferentes modos de armazenamento (local vs cloud)
2. Plano Gratuito oferece TODAS as funcionalidades com dados em localStorage
3. Plano Premium adiciona sincronizacao na nuvem e acesso multi-dispositivo
4. Tela de upgrade destaca beneficios de sincronizacao e equipes
5. Migracao de dados local para cloud ao fazer upgrade
6. Configuracao de planos gerenciavel sem deploy

#### Story 2.2: Geração de Plano Diário

**Como** usuário do plano Básico,
**Quero** receber um plano diário baseado no meu perfil,
**Para que** tenha clareza do que fazer sem sobrecarga.

**Acceptance Criteria:**
1. Sistema gera plano com: 1 prioridade, máximo 2 tarefas leves, 1 bloco de foco
2. Plano considera perfil do usuário (energia, horários preferidos)
3. Plano é gerado automaticamente a cada dia
4. Usuário pode ajustar/personalizar plano manualmente
5. Técnicas sugeridas são no máximo 3 e relevantes ao perfil

#### Story 2.3: Painel Principal (Dashboard)

**Como** usuário,
**Quero** ver meu dia de forma visual e simples,
**Para que** saiba rapidamente meu status e próximos passos.

**Acceptance Criteria:**
1. Painel acessível em 1 toque da home
2. Exibe: prioridade do dia (status), energia atual, foco (iniciado/não)
3. Botão de ajuste rápido do plano
4. Design limpo sem sobrecarga visual
5. Todas as interações são por toque (sem digitação)
6. Carregamento em menos de 1 segundo

#### Story 2.4: Sistema de Rotinas Condicionais

**Como** usuário,
**Quero** criar rotinas no formato "se/então",
**Para que** meu plano se adapte a diferentes situações.

**Acceptance Criteria:**
1. Interface para criar rotinas condicionais (ex: "Se energia baixa, então rotina mínima")
2. Condições disponíveis: energia, horário, dia da semana, humor
3. Ações disponíveis: ajustar tarefas, mudar técnica, ativar modo específico
4. Rotinas são avaliadas automaticamente
5. Usuário recebe feedback quando rotina é ativada

#### Story 2.5: Técnicas Adaptativas

**Como** usuário,
**Quero** receber sugestões de técnicas que funcionam para mim,
**Para que** aprenda formas eficazes de manter foco e organização.

**Acceptance Criteria:**
1. Biblioteca de técnicas: brain dump, starter step, pomodoro adaptado, blocos de energia
2. Sistema sugere no máximo 3 técnicas por vez
3. Técnicas são explicadas de forma clara e prática
4. Usuário pode marcar se técnica funcionou ou não
5. Sugestões evoluem baseadas no feedback

---

### Epic 3: Acompanhamento e Adaptação

**Objetivo**: Implementar o sistema de acompanhamento gentil com chat, check-ins, notificações e a adaptação automática do perfil baseada em uso.

#### Story 3.1: Chat de Acompanhamento (Texto)

**Como** usuário,
**Quero** interagir via chat para registrar como está meu dia,
**Para que** o sistema colete sinais de forma natural.

**Acceptance Criteria:**
1. Interface de chat conversacional limpa
2. Perguntas curtas e gentis (ex: "Hoje foi pesado ou leve?")
3. Respostas por botões/quick replies (sem digitação obrigatória)
4. Máximo 1-2 interações por sessão
5. Tom sempre de convite, nunca cobrança
6. Histórico de conversas acessível

#### Story 3.2: Sistema de Check-ins

**Como** sistema,
**Quero** coletar sinais leves de uso,
**Para que** possa adaptar o plano automaticamente.

**Acceptance Criteria:**
1. Check-in coleta: início de tarefas, conclusão, energia percebida, ajustes feitos
2. Dados são binários/simples (não extensos)
3. Check-in pode ser via chat ou painel
4. Dados alimentam o motor de adaptação
5. Usuário pode pular check-in sem penalidade

#### Story 3.3: Sistema de Notificações Básico

**Como** usuário,
**Quero** receber lembretes gentis no momento certo,
**Para que** mantenha minha rotina sem esquecer.

**Acceptance Criteria:**
1. Sistema de notificações push funcional
2. Padrão inicial: apenas 1 notificação gentil por dia
3. Usuário pode desativar completamente
4. Usuário pode escolher horário preferido
5. Tom das mensagens é de convite, não cobrança
6. Notificações respeitam horários de não-perturbe

#### Story 3.4: Configurações de Notificações

**Como** usuário,
**Quero** configurar minhas notificações conforme minha preferência,
**Para que** receba apenas o que me ajuda.

**Acceptance Criteria:**
1. Tela de configuração com opções claras
2. (Básico) Configuração simples: on/off, horário, frequência
3. (Avançado) Configuração individual por tipo de notificação
4. Escolha de canal (app, futuramente WhatsApp)
5. Preview de como será a notificação
6. Mudanças aplicadas imediatamente

#### Story 3.5: Motor de Adaptação do Perfil

**Como** sistema,
**Quero** ajustar o perfil do usuário baseado em padrões de uso,
**Para que** o plano evolua sem exigir redescoberta.

**Acceptance Criteria:**
1. Sistema analisa sinais coletados (check-ins, uso)
2. Ajustes automáticos pequenos: número de tarefas, horário de foco, técnicas
3. Mudanças são graduais e não disruptivas
4. Usuário é informado de ajustes significativos
5. Redescoberta só é sugerida em casos extremos (adesão muito baixa, mudança de rotina)
6. Usuário pode reverter ajustes automáticos

---

### Epic 4: Experiência e Engajamento

**Objetivo**: Implementar elementos que aumentam engajamento de forma saudável: micro-recompensas, widgets, celebrações e modo crise.

#### Story 4.1: Sistema de Micro-Recompensas

**Como** usuário,
**Quero** receber feedback visual positivo ao completar ações,
**Para que** me sinta motivado de forma saudável.

**Acceptance Criteria:**
1. Animações sutis ao completar tarefas
2. Feedback visual imediato (< 300ms)
3. Variação nas celebrações (não repetitivo)
4. Recompensas são visuais, não métricas numéricas
5. Opção de reduzir animações para usuários sensíveis
6. Nunca punir ou mostrar "falha" - apenas celebrar

#### Story 4.2: Celebrações de Progresso

**Como** usuário,
**Quero** ver meu progresso celebrado de forma gentil,
**Para que** reconheça minha evolução sem pressão.

**Acceptance Criteria:**
1. Marcos de progresso identificados (ex: 7 dias usando, primeira semana completa)
2. Celebrações são sutis e encorajadoras
3. Foco em consistência, não em quantidade/produtividade
4. Mensagens personalizadas baseadas no perfil
5. Nunca comparar com outros usuários

#### Story 4.3: Widgets de 1-Toque

**Como** usuário,
**Quero** acessar ações rápidas sem abrir o app,
**Para que** mantenha minha rotina com mínimo esforço.

**Acceptance Criteria:**
1. Widget de iniciar foco disponível
2. Widget de check-in rápido (como está sua energia?)
3. Widget de ver prioridade do dia
4. Widgets funcionam em iOS e Android
5. Design consistente com o app
6. Ações executam corretamente e sincronizam

#### Story 4.4: Modo Crise

**Como** usuário em um dia difícil,
**Quero** ativar um modo que simplifica tudo,
**Para que** não me sinta sobrecarregado quando estou mal.

**Acceptance Criteria:**
1. Botão de ativar "Modo Crise" facilmente acessível
2. Modo crise reduz plano a: 1 única coisa simples
3. Interface ainda mais simplificada
4. Mensagens extra-gentis e sem cobrança
5. Notificações reduzidas ou pausadas
6. Modo desativa automaticamente no dia seguinte (ou manualmente)
7. Sem julgamento - normalizar dias difíceis

---

### Epic 5: Features Avançadas

**Objetivo**: Implementar funcionalidades do plano Avançado: relatórios avançados, biblioteca de conteúdo educativo e comunidade.

#### Story 5.1: Biblioteca de Relatórios

**Como** usuário do plano Avançado,
**Quero** acessar diferentes tipos de relatórios,
**Para que** entenda meus padrões quando quiser.

**Acceptance Criteria:**
1. Área dedicada "Meus Relatórios"
2. Relatório simples sempre disponível como padrão
3. Biblioteca com relatórios adicionais (padrões de energia, horários, técnicas eficazes)
4. Usuário seleciona quais relatórios quer disponíveis
5. Relatórios não são empurrados - usuário acessa quando quer
6. Visualizações são visuais, não tabelas de números

#### Story 5.2: Chat por Voz

**Como** usuário do plano Avançado,
**Quero** interagir com o chat usando voz,
**Para que** seja ainda mais fácil fazer check-ins.

**Acceptance Criteria:**
1. Botão de voz no chat funcional
2. Speech-to-text processa input do usuário
3. Respostas do sistema podem ser ouvidas (text-to-speech)
4. Funciona offline com sync posterior
5. Privacidade: áudio não é armazenado permanentemente

#### Story 5.3: Sistema de Conteúdo Educativo

**Como** usuário do plano Avançado,
**Quero** acessar pílulas educativas sobre TDAH e produtividade,
**Para que** aprenda técnicas e entenda melhor meu cérebro.

**Acceptance Criteria:**
1. CMS para gestão de conteúdos (sem deploy)
2. Pílulas em formato curto e digerível
3. Conteúdos liberados gradualmente pela gestão
4. Conteúdos tagueados por tema/categoria
5. Progresso de leitura salvo
6. Conteúdos não são obrigatórios - disponíveis quando usuário quiser

#### Story 5.4: Comunidade e Times (Base)

**Como** usuário do plano Avançado (se habilitado),
**Quero** participar de uma comunidade de apoio,
**Para que** me sinta menos sozinho na jornada.

**Acceptance Criteria:**
1. Feature habilitável/desabilitável pela gestão
2. Feed de comunidade com posts
3. Times temáticos (ex: "Manhãs Difíceis", "Foco no Trabalho")
4. Usuário pode entrar/sair de times
5. Sistema básico de moderação
6. Regras de comunidade claras e visíveis
7. Denúncia de conteúdo impróprio

---

### Epic 6: Plano Profissional

**Objetivo**: Implementar funcionalidades para acompanhamento profissional com terapeutas e coaches.

#### Story 6.1: Vinculação com Profissional

**Como** usuário do plano Profissional,
**Quero** vincular minha conta a um terapeuta/coach,
**Para que** ele possa me acompanhar.

**Acceptance Criteria:**
1. Fluxo de convite/aceite de vinculação
2. Consentimento explícito sobre dados compartilhados
3. Usuário controla quais dados são visíveis
4. Vinculação pode ser revogada a qualquer momento
5. Múltiplos profissionais podem ser vinculados
6. Notificação ao profissional quando vinculado

#### Story 6.2: Dashboard do Profissional

**Como** terapeuta/coach,
**Quero** ver um painel com dados relevantes dos meus pacientes,
**Para que** possa acompanhar e orientar melhor.

**Acceptance Criteria:**
1. Login separado para profissionais
2. Lista de pacientes vinculados
3. Visão resumida do progresso de cada paciente
4. Acesso a relatórios específicos (conforme consentimento)
5. Não é dashboard de cobrança - foco em padrões e insights
6. Exportação de relatórios para sessões

#### Story 6.3: Relatórios para Profissional

**Como** profissional,
**Quero** gerar relatórios específicos sobre meu paciente,
**Para que** use nas sessões de acompanhamento.

**Acceptance Criteria:**
1. Relatórios focados em padrões, não métricas punitivas
2. Insights sobre: energia, adesão, técnicas eficazes, momentos difíceis
3. Formato adequado para discussão em sessão
4. Exportação em PDF
5. Período personalizável
6. Notas do profissional podem ser adicionadas

---

### Epic 7: Sistema de Produtividade TDAH

**Objetivo**: Implementar o sistema completo de produtividade adaptado para TDAH, incluindo Brain Dump estruturado, identificação por cronotipos, Planner Diário visual, Rotinas Matinal/Noturna com fluxogramas e Sistema de Revisão para fechamento do ciclo diário.

#### Story 7.1: Brain Dump Estruturado

**Como** usuário,
**Quero** despejar todos os pensamentos da minha cabeça em categorias,
**Para que** reduza a sobrecarga mental e transforme ansiedade em ação.

**Acceptance Criteria:**
1. Área dedicada "Brain Dump" acessível do dashboard
2. Categorias pré-definidas: Ligar, Mensagem, E-mail, Planejar, Pesquisar, Fazer/Criar
3. Campo livre para itens sem categoria
4. Input rápido por voz ou texto
5. Visualização clara de todos os itens despejados
6. Contador de itens com alerta visual se > 10 não triados
7. Campo "Meu Grande Objetivo" destacado no topo

#### Story 7.2: Triagem e Top 1

**Como** usuário,
**Quero** transformar meu brain dump em ações priorizadas,
**Para que** saiba exatamente o que fazer sem decisão demais.

**Acceptance Criteria:**
1. Botão "Triar" transforma brain dump em triagem
2. Interface de arrastar itens para: Hoje (máx 3), Esta Semana (máx 5), Delegar (máx 3)
3. Sistema sugere Top 1 automaticamente baseado em urgência/importância
4. Usuário pode ajustar Top 1 com 1 toque
5. Itens triados somem do brain dump e vão para planner
6. Regra visual: se lista > 3 itens para hoje, aviso gentil aparece
7. Opção de mover item para "Algum dia" (sem prazo)

#### Story 7.3: Sistema de Cronotipos

**Como** usuário,
**Quero** ter minha rotina adaptada ao meu cronotipo,
**Para que** trabalhe nos horários que meu cérebro funciona melhor.

**Acceptance Criteria:**
1. Tela de configuração do cronotipo acessível do perfil
2. Quiz rápido (3-5 perguntas) para identificar/confirmar cronotipo
3. Descrição clara de cada cronotipo com pontos fortes e desafios:
   - 🐻 **Urso**: Segue ritmo solar, produtivo no meio da manhã
   - 🐬 **Golfinho**: Sono leve, precisa de estrutura rígida
   - 🦉 **Coruja**: Noturno, criativo à noite, manhã difícil
   - 🦁 **Leão**: Madrugador, produtivo bem cedo, cansa à noite
4. Rotina sugerida específica para cada cronotipo
5. Horários de notificação ajustados ao cronotipo
6. Usuário pode mudar cronotipo manualmente

#### Story 7.4: Rotinas por Cronotipo

**Como** usuário,
**Quero** ter uma rotina pré-configurada baseada no meu cronotipo,
**Para que** tenha um ponto de partida que funciona para mim.

**Acceptance Criteria:**
1. Cada cronotipo tem rotina matinal e noturna pré-definida
2. Rotina do Urso: Meditar → Metas parciais → Pausas → Tarefas leves
3. Rotina do Golfinho: Listas → Trabalho profundo 3h → Pomodoro → Intervalos curtos
4. Rotina da Coruja: Brain dump → Check-in → Tarefas difíceis → Metas amanhã
5. Rotina do Leão: 1 prioridade → Ambiente → Difíceis primeiro → Leves no fim
6. Usuário pode personalizar rotina mantendo estrutura base
7. Rotina aparece no Planner Diário automaticamente

#### Story 7.5: Planner Diário Visual

**Como** usuário,
**Quero** ver meu dia organizado visualmente por períodos,
**Para que** tenha clareza do fluxo do dia sem sobrecarga.

**Acceptance Criteria:**
1. Visão dividida em Manhã (6h-12h), Tarde (12h-18h), Noite (18h-24h)
2. Seção superior: Confirmação do dia + Gratidão + Humor + Sono
3. Humor via emojis (😊😐😔😰😴) com 1 toque
4. Sono da noite anterior (escala 1-10) com slider rápido
5. Top 1 destacado visualmente no centro
6. Tarefas secundárias (máx 3) abaixo do Top 1
7. Rotina matinal por horário na seção Manhã
8. Rotina noturna por horário na seção Noite
9. Campo "Revisão para hoje" (expectativa 1-10)
10. Design limpo, sem sobrecarga visual

#### Story 7.6: Construtor de Rotina Matinal

**Como** usuário,
**Quero** criar minha rotina matinal em formato de fluxograma,
**Para que** não dependa de motivação, apenas siga o caminho.

**Acceptance Criteria:**
1. Interface visual de fluxograma com blocos arrastáveis
2. Blocos de decisão "Se/Então": Dormiu bem? → Sim/Não
3. Blocos de ação: Exercício, Meditação, Café, Banho, etc.
4. Condições disponíveis: qualidade sono, humor, dia da semana, agenda
5. Ações disponíveis: atividade física, mindfulness, alimentação, higiene, organização
6. Preview da rotina em texto simples
7. Horário de início configurável
8. Notificação gentil no horário configurado
9. Rotina culmina em "Criar lista de tarefas"

#### Story 7.7: Construtor de Rotina Noturna

**Como** usuário,
**Quero** criar minha rotina noturna para fechar o dia,
**Para que** prepare o amanhã e descanse melhor.

**Acceptance Criteria:**
1. Interface similar à rotina matinal
2. Blocos específicos noturnos: Revisão, Preparar amanhã, Descompressão
3. Condições: energia atual, tarefas pendentes, hora atual
4. Ações: exercício leve, leitura, gratidão, preparar roupa/mochila, desligar telas
5. Horário de início configurável
6. Notificação gentil no horário configurado
7. Rotina culmina em "Definir Top 1 de amanhã"

#### Story 7.8: Sistema de Revisão Diária

**Como** usuário,
**Quero** fazer revisões rápidas manhã e noite,
**Para que** aprenda com meus padrões sem culpa.

**Acceptance Criteria:**
1. Revisão Matinal (2 min): "O que me deixa orgulhoso esta manhã?"
2. Revisão Noturna (3 min):
   - "O que me deixou orgulhoso hoje?"
   - "O que eu mudaria amanhã? (uma coisa)"
3. Respostas por texto livre ou sugestões rápidas
4. Tom sempre gentil, nunca de cobrança
5. Histórico de revisões acessível
6. Sistema identifica padrões (ex: "Sono apareceu 3x esta semana")
7. Insights gentis baseados em padrões (opcional)
8. Revisões são opcionais - nunca punir por pular

#### Story 7.9: Ciclo Diário Completo

**Como** usuário,
**Quero** ter um ciclo diário integrado,
**Para que** todas as partes funcionem juntas de forma fluida.

**Acceptance Criteria:**
1. Fluxo matinal: Acordar → Rotina Matinal → Revisão Matinal → Brain Dump → Triagem → Top 1
2. Fluxo diário: Planner → Foco → Check-ins leves → Ajustes
3. Fluxo noturno: Rotina Noturna → Revisão Noturna → Preparar amanhã
4. Transições suaves entre cada etapa
5. Progresso visual do ciclo no dashboard
6. Notificações gentis nos momentos de transição
7. Modo simplificado para dias difíceis (pular etapas sem culpa)
8. Métricas de consistência (não produtividade) disponíveis

---

### Epic 8: Organização Avançada

**Objetivo**: Implementar sistema de Gestão de Projetos para agrupar tarefas, Agenda/Calendário para visualização temporal, e Sistema de Notas para captura rápida com conversão para tarefas ou eventos.

#### Story 8.1: Sistema de Projetos - CRUD Básico

**Como** usuário,
**Quero** criar e gerenciar projetos,
**Para que** agrupe tarefas relacionadas e tenha visão organizada.

**Acceptance Criteria:**
1. Tela de listagem de Projetos acessível do menu principal
2. Criar projeto com: nome, cor (paleta pré-definida), emoji (opcional)
3. Editar nome, cor e emoji do projeto
4. Arquivar projeto (mantém histórico, não aparece na lista ativa)
5. Excluir projeto (com confirmação, remove associações de tarefas)
6. Status do projeto: Ativo, Arquivado, Concluído
7. Projetos ordenados por: última atualização ou alfabético
8. Limite de projetos ativos configurável nas preferências

#### Story 8.2: Associação Tarefa-Projeto

**Como** usuário,
**Quero** associar tarefas a projetos,
**Para que** saiba qual tarefa pertence a qual contexto.

**Acceptance Criteria:**
1. Campo opcional de Projeto ao criar/editar tarefa
2. Dropdown com lista de projetos ativos
3. Opção "Sem projeto" sempre disponível
4. Cor do projeto aparece como indicador visual na tarefa
5. Filtro por projeto disponível no Dashboard e Planner
6. Ao arquivar projeto, tarefas pendentes podem ser movidas ou mantidas
7. Tarefa pode ser movida entre projetos facilmente

#### Story 8.3: Visão do Projeto

**Como** usuário,
**Quero** ver todas as informações de um projeto específico,
**Para que** tenha clareza do progresso e próximos passos.

**Acceptance Criteria:**
1. Tela de detalhe do projeto ao clicar em um projeto
2. Lista de todas as tarefas do projeto (pendentes, concluídas, todas)
3. Barra de progresso visual (% de tarefas concluídas)
4. Contador: X de Y tarefas concluídas
5. Adicionar tarefa direto na tela do projeto
6. Filtros: Todas, Pendentes, Concluídas
7. Ações rápidas: Arquivar, Editar, Excluir
8. Histórico de atividades do projeto (opcional)

#### Story 8.4: Agenda - Visualização de Calendário

**Como** usuário,
**Quero** visualizar meu dia/semana em formato de agenda,
**Para que** tenha noção temporal das minhas atividades.

**Acceptance Criteria:**
1. Tela de Agenda acessível do menu principal
2. Visualização padrão: Dia atual
3. Toggle para visualização de Semana
4. Tarefas com data aparecem na agenda automaticamente
5. Blocos de rotina (matinal/noturna) aparecem nos horários configurados
6. Sessões de foco agendadas aparecem na agenda
7. Navegação entre dias/semanas (swipe ou setas)
8. Indicador visual de "Hoje"
9. Design limpo sem sobrecarga

#### Story 8.5: Eventos de Agenda

**Como** usuário,
**Quero** criar eventos independentes na agenda,
**Para que** registre compromissos que não são tarefas.

**Acceptance Criteria:**
1. Criar evento com: título, data, horário início, horário fim
2. Eventos podem ser de dia inteiro (sem horário específico)
3. Descrição opcional no evento
4. Cor do evento (diferente de tarefas)
5. Eventos recorrentes: diário, semanal, mensal, anual
6. Editar e excluir eventos
7. Excluir uma ocorrência ou todas (para recorrentes)
8. Eventos aparecem visualmente distintos de tarefas

#### Story 8.6: Agendamento de Tarefas

**Como** usuário,
**Quero** agendar tarefas para horários específicos,
**Para que** planeje quando vou executar cada atividade.

**Acceptance Criteria:**
1. Tarefa pode ter data e horário de agendamento
2. Arrastar tarefa para a agenda define data/hora
3. Tarefa agendada aparece no slot de horário correspondente
4. Duração estimada da tarefa (30min, 1h, 2h, personalizado)
5. Tarefa agendada pode ser reagendada arrastando
6. Notificação no horário da tarefa (se notificações ativas)
7. Diferenciação visual entre tarefa agendada e evento

#### Story 8.7: Sistema de Notas - Captura Rápida

**Como** usuário,
**Quero** capturar pensamentos rapidamente,
**Para que** não perca ideias e processe depois.

**Acceptance Criteria:**
1. Botão flutuante "+" visível em telas principais
2. Modal de captura rápida abre com 1 toque
3. Campo de texto com foco automático
4. Salvar nota com Enter ou botão
5. Nota vai para "Inbox" com status pendente
6. Timestamp automático de criação
7. Captura funciona offline
8. Suporte a múltiplas linhas

#### Story 8.8: Inbox de Notas

**Como** usuário,
**Quero** processar minhas notas capturadas,
**Para que** transforme pensamentos em ações ou arquive.

**Acceptance Criteria:**
1. Tela "Notas" com área de Inbox proeminente
2. Lista de notas não processadas ordenada por data
3. Contador de notas pendentes no menu
4. Ações por nota: Converter em Tarefa, Converter em Evento, Arquivar, Excluir
5. Swipe actions para ações rápidas
6. Nota convertida muda status para "Processada" e mantém referência
7. Área de notas arquivadas (acessível mas não proeminente)
8. Busca em notas (texto)

#### Story 8.9: Conversão de Notas

**Como** usuário,
**Quero** transformar notas em tarefas ou eventos,
**Para que** meus pensamentos se tornem ações planejadas.

**Acceptance Criteria:**
1. "Converter em Tarefa": abre criação de tarefa com texto da nota pré-preenchido
2. Tarefa criada mantém link para nota original
3. "Converter em Evento": abre criação de evento com título pré-preenchido
4. Evento criado mantém link para nota original
5. Opção de associar a Projeto durante conversão
6. Nota original é marcada como "Processada"
7. Conversão pode ser desfeita (restaura nota para Inbox)
8. Preview da nota durante conversão

#### Story 8.10: Integração Notas-Brain Dump

**Como** usuário,
**Quero** enviar notas para o Brain Dump,
**Para que** use o sistema de triagem existente.

**Acceptance Criteria:**
1. Ação "Enviar para Brain Dump" disponível nas notas
2. Selecionar categoria do Brain Dump ao enviar
3. Nota aparece na categoria selecionada do Brain Dump
4. Nota original é marcada como "Processada"
5. Triagem do Brain Dump funciona normalmente com notas enviadas
6. Link bidirecional entre nota e item do Brain Dump

---

### Epic 15: Chat com IA (Input)

**Objetivo**: Implementar chat com IA que permite ao usuário interagir com toda a aplicação através de linguagem natural (texto e voz). Utiliza OpenRouter como gateway para escolher entre diferentes LLMs.

**Versão Target**: v1.3

#### Story 15.1: Infraestrutura OpenRouter

**Como** desenvolvedor,
**Quero** ter a integração básica com OpenRouter configurada,
**Para que** possamos enviar mensagens para diferentes LLMs.

**Acceptance Criteria:**
1. Cliente OpenRouter implementado em `apps/web/src/services/ai/openrouter-client.ts`
2. Types de chat exportados do `packages/shared/src/types/ai-chat.ts`
3. Variáveis de ambiente configuradas (OPENROUTER_API_KEY, OPENROUTER_DEFAULT_MODEL)
4. Suporte a streaming de respostas
5. Testes unitários para o cliente

#### Story 15.2: API Route /api/chat

**Como** desenvolvedor,
**Quero** ter um endpoint para processar mensagens de chat,
**Para que** o frontend possa enviar mensagens e receber respostas.

**Acceptance Criteria:**
1. POST /api/chat aceita { message, userId, model? }
2. Contexto do usuário incluído no system prompt (energia, humor, tarefas)
3. Streaming de resposta funcionando
4. Rate limiting básico implementado
5. Erros tratados adequadamente com mensagens amigáveis

#### Story 15.3: Tool System Base

**Como** usuário,
**Quero** que o chat execute ações na aplicação,
**Para que** eu possa criar tarefas, ativar modo crise, etc. por conversa.

**Acceptance Criteria:**
1. 5 tools iniciais implementadas: create_task, add_to_brain_dump, complete_task, activate_crisis_mode, record_checkin
2. ToolExecutor processa tool calls do LLM
3. Ações executadas no localStorage
4. Feedback de sucesso/erro retornado ao chat
5. Testes para cada tool

#### Story 15.4: Chat Widget UI

**Como** usuário,
**Quero** um widget de chat flutuante no dashboard,
**Para que** eu possa conversar com o assistente a qualquer momento.

**Acceptance Criteria:**
1. Componente ChatWidget flutuante no canto inferior direito
2. Histórico de mensagens exibido corretamente
3. Scroll automático para novas mensagens
4. Loading state durante resposta do LLM
5. Store Zustand para gerenciar estado do chat
6. Persistência do histórico na sessão

#### Story 15.5: Voice Input

**Como** usuário,
**Quero** poder falar em vez de digitar,
**Para que** seja mais rápido e natural interagir com o chat.

**Acceptance Criteria:**
1. Botão de microfone no ChatInput
2. Web Speech API para reconhecimento de voz em PT-BR
3. Transcript exibido em tempo real enquanto fala
4. Mensagem enviada ao parar gravação
5. Fallback visual para browsers não suportados
6. Tratamento de erros de permissão de microfone

#### Story 15.6: Tools Adicionais

**Como** usuário,
**Quero** mais comandos disponíveis no chat,
**Para que** possa fazer consultas e criar notas, projetos, etc.

**Acceptance Criteria:**
1. Tools de consulta: search_tasks, get_user_stats, get_energy_history
2. Tools de criação: create_note, create_project
3. Tools de triagem: triage_brain_dump_item
4. Tool deactivate_crisis_mode
5. Todas as tools testadas

#### Story 15.7: Rate Limiting por Plano

**Como** sistema,
**Quero** limitar uso do chat por plano,
**Para que** controlemos custos e incentivemos upgrade.

**Acceptance Criteria:**
1. Plano Free: 10 mensagens/hora, 50/dia
2. Plano Premium: 100 mensagens/hora, ilimitado/dia
3. Contador visível para usuário Free
4. Mensagem amigável ao atingir limite
5. Reset automático do contador

#### Story 15.8: Seleção de Modelo

**Como** admin/usuário premium,
**Quero** escolher qual modelo LLM usar,
**Para que** eu possa balancear custo e qualidade.

**Acceptance Criteria:**
1. Configuração de modelo padrão nas preferências
2. Seleção automática por tipo de tarefa (simples → haiku, complexo → sonnet)
3. UI para escolher modelo (apenas Premium)
4. Fallback para modelo alternativo se principal falhar

---

### Epic 18: Voice Output (TTS)

**Objetivo**: Implementar saída por voz (Text-to-Speech) para que o assistente possa responder falando, não apenas com texto.

**Versão Target**: v1.8

#### Story 18.1: Text-to-Speech Básico

**Como** usuário,
**Quero** ouvir as respostas do assistente,
**Para que** eu possa usar o app sem olhar para a tela.

**Acceptance Criteria:**
1. Hook useTextToSpeech implementado
2. Web Speech API para TTS em PT-BR
3. Botão de "ler em voz alta" nas mensagens
4. Controle de velocidade da fala
5. Funciona em Chrome, Firefox, Edge, Safari

#### Story 18.2: Configurações de Voz

**Como** usuário,
**Quero** personalizar a voz do assistente,
**Para que** seja mais agradável de ouvir.

**Acceptance Criteria:**
1. Lista de vozes disponíveis em PT-BR
2. Seleção de voz preferida nas configurações
3. Ajuste de velocidade (0.5x - 2x)
4. Ajuste de tom (pitch)
5. Preferências persistidas

#### Story 18.3: Auto-Read e Modo Crise

**Como** usuário,
**Quero** respostas lidas automaticamente no Modo Crise,
**Para que** eu não precise ler quando estou sobrecarregado.

**Acceptance Criteria:**
1. Opção de auto-read nas configurações
2. Auto-read ativado automaticamente no Modo Crise
3. Voz mais lenta e calma no Modo Crise
4. Botão para parar a fala a qualquer momento

---

## 7. Checklist Results Report

*A ser preenchido após execução do checklist PM*

---

## 8. Next Steps

### 8.1 UX Expert Prompt

> Crie as especificações de UX/UI para o NCIAFlux baseado neste PRD. Foco em:
> - Design system com paleta de cores suaves e acolhedoras
> - Componentes para questionário, painel, chat e widgets
> - Fluxos de navegação mobile-first
> - Considerações de acessibilidade (WCAG AA)
> - Micro-interações e animações sutis para recompensas

### 8.2 Architect Prompt

> Crie a arquitetura técnica para o NCIAFlux baseado neste PRD. Considere:
> - Monorepo com mobile (React Native ou Flutter), API serverless, CMS
> - Offline-first com sync para mobile
> - Feature flags para gestão de planos
> - Sistema de notificações push
> - Escalabilidade para 10x crescimento
> - LGPD compliance

---

---

## Anexo A: Features V2 - Sistema de Plugins/MCPs

### Visão Geral

Na versão 2, o NCIAFlux terá um sistema de extensibilidade que permite desenvolvedores externos criarem plugins e MCPs (Model Context Protocols) para agregar funcionalidades ao projeto.

### Objetivos do Sistema de Plugins

1. **Extensibilidade**: Permitir que a comunidade desenvolva integrações sem modificar o core
2. **Ecossistema**: Criar um marketplace de extensões que agregam valor
3. **Personalização**: Usuários podem escolher plugins que atendem suas necessidades específicas
4. **Inovação**: Acelerar desenvolvimento de features através da comunidade

### Tipos de Extensões Planejadas

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| **Integrações** | Conexão com serviços externos | Calendário Google, Todoist, Notion, Slack |
| **Técnicas** | Novas técnicas de foco/organização | Técnicas customizadas, métodos específicos |
| **Relatórios** | Novos tipos de visualizações | Relatórios específicos para nichos |
| **Themes** | Personalização visual | Temas de cores, layouts alternativos |
| **MCPs** | Protocolos para IA contextual | Contexto para LLMs, assistentes especializados |
| **Wearables** | Integrações com dispositivos | Fitbit, Apple Watch, Garmin |

### Arquitetura de Plugins (Conceitual)

```
NCIAFlux Core
├── Plugin API (REST + WebSocket)
├── Plugin Registry
├── Sandbox de execução
├── Sistema de permissões
└── Marketplace

Plugin externo
├── Manifest (metadata, permissões)
├── Código (isolado em sandbox)
├── Assets
└── Configurações do usuário
```

### Requisitos para V2

- **FR-V2-1**: API documentada para desenvolvedores de plugins
- **FR-V2-2**: SDK/CLI para desenvolvimento e teste de plugins
- **FR-V2-3**: Marketplace para descoberta e instalação
- **FR-V2-4**: Sistema de permissões granular (o que o plugin pode acessar)
- **FR-V2-5**: Sandbox de execução para segurança
- **FR-V2-6**: Sistema de review/aprovação de plugins
- **FR-V2-7**: Versionamento de plugins
- **FR-V2-8**: Suporte a MCPs para integração com LLMs

### MCPs (Model Context Protocols)

Os MCPs permitirão que o NCIAFlux exponha contexto estruturado para LLMs externos, possibilitando:

- Assistentes de IA que entendem o perfil do usuário
- Automações inteligentes baseadas em padrões
- Integrações com Claude, ChatGPT, e outros modelos
- Criação de agentes especializados em ADHD

---

*Documento gerado seguindo BMad Method v4.44.3*
