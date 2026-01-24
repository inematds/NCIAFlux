# NCIAFlux - Plano de Ação

**Projeto:** NCIAFlux (NeuroFluxo)
**Início:** 23 de Janeiro de 2026
**Status:** Em Planejamento

---

## Fase 1: Planejamento (Planning Phase)

### 1.1 Pesquisa e Análise
- [x] Pesquisa de mercado de apps TDAH
- [x] Análise de concorrentes (Inflow, Tiimo, Numo, etc.)
- [x] Gap analysis e oportunidades
- [x] Sessão de brainstorming
- [x] Consolidação de decisões estratégicas
- [x] Salvar relatório de análise (`docs/market-research-analysis.md`)

### 1.2 Documentação de Produto
- [x] Criar PRD completo
- [x] Criar especificações de UX/UI (`docs/front-end-spec.md`)
- [ ] **Revisão e aprovação do usuário** ← ATUAL

### 1.3 Arquitetura
- [x] Criar documento de arquitetura (`docs/architecture.md`)
- [x] Definir tech stack (Supabase, React Native, TypeScript, etc.)
- [x] Definir coding standards
- [x] Definir estrutura do projeto (source tree)

### 1.4 Sharding (Fragmentação)
- [x] Shard PRD em épicos (6 épicos criados)
- [x] Shard épicos em stories (27 stories criadas)
- [ ] Validar stories com checklist
- [ ] **Aprovar stories para desenvolvimento** ← PRÓXIMO

---

## Fase 2: Desenvolvimento (Development Phase)

### 2.1 Infraestrutura Base
- [ ] Setup do repositório
- [ ] Configuração de ambiente de desenvolvimento
- [ ] CI/CD básico
- [ ] Estrutura de pastas do projeto

### 2.2 MVP - Módulo Descoberta (Gratuito)
- [ ] Epic: Sistema de questionário
- [ ] Epic: Geração de perfil
- [ ] Epic: Feedback e insights
- [ ] Epic: Salvar/compartilhar resultado

### 2.3 MVP - Módulo Plano Personalizado (Básico)
- [ ] Epic: Dashboard/Painel visual
- [ ] Epic: Sistema de prioridades e tarefas
- [ ] Epic: Rotinas condicionais (se/então)
- [ ] Epic: Técnicas adaptativas
- [ ] Epic: Blocos de foco

### 2.4 MVP - Módulo Acompanhamento (Básico)
- [ ] Epic: Chat texto (sinais leves)
- [ ] Epic: Check-ins e coleta de dados
- [ ] Epic: Sistema de notificações (simples)
- [ ] Epic: Relatório simples

### 2.5 MVP - Experiência e Engajamento
- [ ] Epic: Micro-recompensas visuais
- [ ] Epic: Widgets 1-toque
- [ ] Epic: Celebrações de progresso
- [ ] Epic: Modo crise

### 2.6 MVP - Perfil Adaptativo
- [ ] Epic: Ajustes automáticos baseados em uso
- [ ] Epic: Redescoberta pontual

---

## Fase 3: Features Avançadas (Plano Avançado)

### 3.1 Comunicação Avançada
- [ ] Epic: Chat por voz
- [ ] Epic: Notificações avançadas (configuráveis)
- [ ] Epic: Integração WhatsApp (opcional)

### 3.2 Relatórios Avançados
- [ ] Epic: Biblioteca de relatórios
- [ ] Epic: Relatórios selecionáveis pelo usuário

### 3.3 Educação
- [ ] Epic: Sistema de pílulas educativas
- [ ] Epic: Gestão de conteúdo (admin)

### 3.4 Comunidade
- [ ] Epic: Sistema de comunidade
- [ ] Epic: Times temáticos
- [ ] Epic: Moderação

---

## Fase 4: Plano Profissional

### 4.1 Integração com Profissionais
- [ ] Epic: Vinculação terapeuta/coach
- [ ] Epic: Relatórios para profissional
- [ ] Epic: Dashboard do profissional
- [ ] Epic: Acompanhamento supervisionado

---

## Fase 5: V2 - Expansões Futuras

### Sistema de Plugins e MCPs
- [ ] Definir arquitetura de plugins
- [ ] Criar Plugin API (REST + WebSocket)
- [ ] Desenvolver SDK/CLI para desenvolvedores
- [ ] Implementar sandbox de execução
- [ ] Sistema de permissões granular
- [ ] Marketplace de plugins
- [ ] Sistema de review/aprovação
- [ ] Suporte a MCPs (Model Context Protocols)
- [ ] Documentação para desenvolvedores

### Outras Features V2
- [ ] Modo trabalho profundo
- [ ] Modo família/casal
- [ ] Integração com wearables
- [ ] Body doubling virtual
- [ ] Gamificação expandida (níveis, conquistas)
- [ ] IA conversacional avançada
- [ ] Marketplace de técnicas

---

## Documentos do Projeto

| Documento | Status | Localização |
|-----------|--------|-------------|
| Especificação Original | ✅ Completo | `doc/app_tdah_descoberta_plano_e_acompanhamento.md` |
| Branding | ✅ Completo | `doc/NCIAFlux é um sistema de NeuroFluxo.txt` |
| Pesquisa de Mercado | ✅ Completo | `docs/market-research-analysis.md` |
| PRD | ✅ Completo | `docs/prd.md` |
| Especificação UX/UI | ✅ Completo | `docs/front-end-spec.md` |
| Arquitetura | ✅ Completo | `docs/architecture.md` |

---

## Estrutura de Planos (Referência Rápida)

| Plano | Features Principais |
|-------|---------------------|
| **Gratuito** | Descoberta isolada |
| **Básico** | Plano + Acompanhamento + Widgets + Modo Crise |
| **Avançado** | Voz + Relatórios + Educação + Comunidade* |
| **Profissional** | Integração com terapeuta/coach |

*\*Comunidade sujeita a habilitação pela gestão*

---

## Notas e Decisões Importantes

1. **Notificações**: Sempre começar no modo mais simples, usuário ativa mais se quiser
2. **Relatórios**: Biblioteca disponível, mas padrão é o simples
3. **Educação**: Liberação controlada pela gestão do sistema
4. **Comunidade**: Feature premium com toggle (pode ser desabilitada)
5. **Preço**: Manter acessível - crítica forte aos concorrentes caros

---

## Histórico de Atualizações

| Data | Ação | Responsável |
|------|------|-------------|
| 2026-01-23 | Criação do projeto | - |
| 2026-01-23 | Pesquisa de mercado completa | Mary (Analyst) |
| 2026-01-23 | Análise de concorrentes | Mary (Analyst) |
| 2026-01-23 | Consolidação de decisões | Mary (Analyst) |
| 2026-01-23 | PRD completo criado | PM |
| 2026-01-23 | Especificação UX/UI criada | Sally (UX Expert) |
| 2026-01-23 | Arquitetura técnica criada | Architect |

---

*Atualizado em: 23 de Janeiro de 2026*
