# Epic 1: Fundação e Descoberta

**Objetivo:** Estabelecer a infraestrutura base do projeto e entregar o módulo de Descoberta completo como produto isolado funcional.

**Valor de Negócio:** Ao final deste épico, usuários poderão fazer a descoberta e receber seu perfil, mesmo sem as features de plano. Este é o core do produto gratuito.

**Dependências:** Nenhuma (primeiro épico)

**Stories:**
- [1.1 Setup do Projeto e Infraestrutura Base](./1.1-setup-projeto.md)
- [1.2 Autenticação e Gestão de Usuários](./1.2-autenticacao.md)
- [1.3 Tela de Questionário de Descoberta](./1.3-questionario-descoberta.md)
- [1.4 Motor de Geração de Perfil](./1.4-motor-perfil.md)
- [1.5 Tela de Resultado da Descoberta](./1.5-resultado-descoberta.md)
- [1.6 Fluxo de Descoberta sem Cadastro](./1.6-descoberta-sem-cadastro.md)

**Definition of Done do Epic:**
- [ ] Usuário consegue completar descoberta sem login
- [ ] Perfil é gerado e exibido corretamente
- [ ] Resultado pode ser salvo e compartilhado
- [ ] CI/CD funcionando
- [ ] Testes de integração do fluxo completo passando
