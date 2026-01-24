# Epic 2: Plano e Painel

**Objetivo:** Implementar o sistema de plano diário personalizado e o painel principal.

**Valor de Negócio:** Usuários do plano Básico+ terão uma rotina adaptada ao seu perfil, com visualização clara do dia e ações rápidas.

**Dependências:** Epic 1 (auth, profile)

**Stories:**
- [2.1 Estrutura de Planos e Feature Flags](./2.1-estrutura-planos.md)
- [2.2 Geração de Plano Diário](./2.2-geracao-plano.md)
- [2.3 Painel Principal (Dashboard)](./2.3-painel-dashboard.md)
- [2.4 Sistema de Rotinas Condicionais](./2.4-rotinas-condicionais.md)
- [2.5 Técnicas Adaptativas](./2.5-tecnicas-adaptativas.md)

**Definition of Done do Epic:**
- [ ] Dashboard carrega em < 1 segundo
- [ ] Plano diário é gerado automaticamente
- [ ] Usuário consegue ajustar plano manualmente
- [ ] Técnicas são sugeridas baseadas no perfil
- [ ] Feature flags controlam acesso por plano
