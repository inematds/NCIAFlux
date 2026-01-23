# NCIAFlux Product Requirements Document (PRD)

**Versão:** 1.0
**Data:** 23 de Janeiro de 2026
**Status:** Draft

---

## 1. Goals and Background Context

### 1.1 Goals

- Criar uma experiência de descoberta isolada que entrega valor imediato em 5-7 minutos
- Desenvolver um sistema de plano diário adaptativo que respeita o fluxo real do cérebro ADHD
- Implementar acompanhamento gentil sem cobrança de métricas ou performance
- Oferecer estrutura de planos escalável (Gratuito → Básico → Avançado → Profissional)
- Posicionar o NCIAFlux como alternativa acessível no mercado brasileiro de apps ADHD
- Garantir que o sistema evolua com o usuário sem exigir redescoberta constante

### 1.2 Background Context

NCIAFlux (NeuroFluxo) surge como resposta a um mercado de apps ADHD que cresce a 15% ao ano (projetado para USD 7-12 bilhões até 2035), mas que frequentemente falha em atender às necessidades reais dos usuários. A pesquisa de mercado identificou problemas críticos nos concorrentes: preços abusivos (Numo $16/mês, Inflow $95/ano), interfaces sobrecarregadas, foco excessivo em produtividade punitiva, e falta de adaptação real ao usuário.

O NCIAFlux diferencia-se por três pilares: **Autoconhecimento** (descoberta do perfil cognitivo), **Adaptação Constante** (sistema que aprende com o uso), e **Sem Pressão** (acompanhamento gentil, não métrico). O público-alvo são adultos com TDAH ou dificuldades de foco/organização que buscam autogestão sustentável, não produtividade máxima.

### 1.3 Change Log

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-01-23 | 1.0 | Criação inicial do PRD | PM (BMad) |

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

#### Módulo Plano Personalizado (Básico+)

- **FR11**: O perfil da descoberta deve se tornar automaticamente o perfil base ao continuar
- **FR12**: O plano diário deve conter: 1 prioridade real, máximo 2 tarefas leves, 1 bloco de foco
- **FR13**: O sistema deve suportar rotinas condicionais no formato "se/então"
- **FR14**: O sistema deve sugerir no máximo 3 técnicas por vez (brain dump, starter step, pomodoro adaptado, blocos de energia)
- **FR15**: As técnicas devem mudar conforme padrões de uso
- **FR16**: O sistema deve permitir widgets de 1-toque para ações rápidas

#### Módulo Acompanhamento (Básico+)

- **FR17**: O painel visual deve ser acessível em 1 toque com design limpo
- **FR18**: O painel deve mostrar: prioridade do dia, energia do dia, foco iniciado, botão de ajuste
- **FR19**: Todas as interações do painel devem ser clicáveis (sem digitação)
- **FR20**: O chat conversacional deve ser opcional (texto no Básico, voz no Avançado)
- **FR21**: O chat deve coletar sinais leves, não histórias longas
- **FR22**: Os check-ins devem ser 1-2 interações por dia no máximo

#### Módulo Notificações (Básico+)

- **FR23**: O sistema de notificações deve iniciar no modo mais simples possível
- **FR24**: O usuário deve poder ativar notificações adicionais conforme desejo
- **FR25**: O usuário deve poder escolher canal (app, WhatsApp, outro)
- **FR26**: O usuário deve poder escolher horário e frequência
- **FR27**: As mensagens devem ter tom de convite, não cobrança
- **FR28**: (Avançado) O usuário deve poder configurar cada notificação individualmente

#### Módulo Relatórios (Básico+)

- **FR29**: O relatório simples deve ser o padrão e sempre visível
- **FR30**: (Avançado) O sistema deve oferecer biblioteca de relatórios avançados
- **FR31**: (Avançado) O usuário deve poder selecionar quais relatórios ficam disponíveis
- **FR32**: Os relatórios selecionados devem ficar em área dedicada, acessíveis quando o usuário quiser
- **FR33**: O sistema nunca deve empurrar métricas automaticamente

#### Módulo Perfil Adaptativo (Básico+)

- **FR34**: O sistema deve coletar sinais leves de uso (início de tarefas, conclusão, energia, horários)
- **FR35**: O sistema deve fazer ajustes automáticos pequenos (tarefas, horário de foco, técnicas, rotina)
- **FR36**: A redescoberta pontual só deve ocorrer se: usuário pedir, rotina mudar muito, ou adesão cair significativamente
- **FR37**: Na redescoberta, apenas partes relevantes devem ser refeitas

#### Módulo Experiência e Engajamento (Básico+)

- **FR38**: O sistema deve fornecer micro-recompensas visuais ao completar ações
- **FR39**: O sistema deve celebrar progressos de forma visual e gentil
- **FR40**: O sistema deve oferecer "Modo Crise" com rotina mínima para dias difíceis
- **FR41**: O Modo Crise deve simplificar drasticamente as expectativas sem julgamento

#### Módulo Educação (Avançado)

- **FR42**: O tutorial do sistema deve estar sempre disponível (Básico+)
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

#### Gestão de Planos

- **FR54**: O sistema deve suportar 4 níveis de plano: Gratuito, Básico, Avançado, Profissional
- **FR55**: Cada feature deve respeitar restrições de plano
- **FR56**: O upgrade/downgrade deve ser fluido sem perda de dados

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

1. **Tela de Descoberta** - Questionário uma pergunta por vez
2. **Tela de Resultado** - Perfil + insight + sugestão
3. **Painel Principal (Dashboard)** - Prioridade, energia, foco, ajuste
4. **Tela de Plano do Dia** - Tarefas e blocos de foco
5. **Chat de Acompanhamento** - Interface conversacional leve
6. **Configurações de Notificações** - Simples e avançada
7. **Biblioteca de Relatórios** - Cards de relatórios disponíveis
8. **Modo Crise** - Interface ultra-simplificada
9. **Perfil/Configurações** - Gestão de conta e plano
10. **Comunidade** (Avançado) - Feed e times

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

| Epic | Título | Objetivo |
|------|--------|----------|
| 1 | Fundação e Descoberta | Setup do projeto + módulo de descoberta completo (entrega valor isolado) |
| 2 | Plano e Painel | Sistema de plano personalizado + painel principal |
| 3 | Acompanhamento e Adaptação | Chat, check-ins, notificações e perfil adaptativo |
| 4 | Experiência e Engajamento | Micro-recompensas, widgets, modo crise |
| 5 | Features Avançadas | Relatórios avançados, educação, comunidade |
| 6 | Plano Profissional | Integração com terapeutas e acompanhamento supervisionado |

### Features V2 (Futuras)

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
**Para que** o sistema entenda meu perfil.

**Acceptance Criteria:**
1. Interface de questionário com uma pergunta por tela
2. Navegação por deslizar ou toque
3. Progresso visual mostrando etapa atual
4. Perguntas cobrem: dificuldades, energia/horários, estilo de execução, sobrecarga
5. Tempo total de 5-7 minutos
6. Linguagem humana e não-clínica em todas as perguntas
7. Possibilidade de pausar e continuar depois

#### Story 1.4: Motor de Geração de Perfil

**Como** sistema,
**Quero** processar as respostas do questionário,
**Para que** gere um perfil cognitivo personalizado.

**Acceptance Criteria:**
1. Algoritmo processa respostas e gera perfil estruturado
2. Perfil contém: resumo (1-2 frases), insight central, sugestão prática
3. Perfil é salvo no banco de dados associado ao usuário
4. Lógica permite extensão futura (mais dimensões de perfil)
5. Testes unitários cobrem casos principais de geração

#### Story 1.5: Tela de Resultado da Descoberta

**Como** usuário,
**Quero** ver meu perfil de forma clara e inspiradora,
**Para que** me sinta compreendido e tenha clareza sobre como agir.

**Acceptance Criteria:**
1. Tela exibe perfil resumido de forma visual e acolhedora
2. Insight central destacado com linguagem empática
3. Sugestão prática acionável claramente apresentada
4. Botão para salvar resultado
5. Botão para compartilhar resultado (gera imagem ou link)
6. Opção clara de "Continuar usando o app" vs "Apenas salvar"
7. Nenhuma pressão para continuar - experiência completa mesmo sem cadastro pago

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

**Objetivo**: Implementar o sistema de plano diário personalizado e o painel principal, permitindo que usuários do plano Básico+ tenham uma rotina adaptada ao seu perfil.

#### Story 2.1: Estrutura de Planos e Feature Flags

**Como** sistema,
**Quero** ter estrutura de planos (Gratuito, Básico, Avançado, Profissional),
**Para que** features sejam liberadas conforme o plano do usuário.

**Acceptance Criteria:**
1. Modelo de dados suporta diferentes níveis de plano
2. Feature flags controlam acesso a funcionalidades por plano
3. Middleware/guard verifica permissões antes de acessar features
4. Tela de upgrade disponível quando usuário tenta acessar feature bloqueada
5. Configuração de planos gerenciável sem deploy

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
