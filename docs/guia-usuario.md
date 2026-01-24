# Guia do Usuario - NCIAFlux

Este guia explica todas as funcionalidades disponiveis para usuarios do NCIAFlux.

---

## Primeiros Passos

### 1. Criar uma Conta

1. Acesse a pagina de **Registro** (`/register`)
2. Preencha seus dados:
   - **Nome completo** - Como voce quer ser chamado
   - **Email** - Seu email de acesso
   - **Empresa** (opcional) - Nome da sua empresa
   - **Tipo de conta**:
     - `Usuario Individual` - Para gerenciar apenas suas proprias tarefas
     - `Gestor/Lider` - Para gerenciar equipes
     - `Administrador` - Acesso total ao sistema
   - **Senha** - Minimo 6 caracteres
3. Clique em **Criar conta**

> **Dica:** Use o icone de olho para visualizar a senha enquanto digita.

### 2. Fazer Login

1. Acesse a pagina de **Login** (`/login`)
2. Digite seu email e senha
3. Clique em **Entrar**

> **Modo Demo:** No modo demonstracao, qualquer email e senha funcionam para testar o sistema.

---

## Dashboard

O Dashboard e a tela inicial apos o login. O conteudo varia conforme seu tipo de conta.

### Para Usuarios Individuais

Voce vera:
- **Saudacao personalizada** com seu nome
- **Cards de estatisticas**:
  - Total de Tarefas
  - Tarefas Pendentes
  - Tarefas Em Progresso
  - Tarefas Concluidas
- **Seu Progresso** - Grafico visual das suas tarefas
- **Acoes Rapidas**:
  - Nova Tarefa
  - Ver Todas as Tarefas
  - Configuracoes
- **Minhas Tarefas Recentes** - Lista das ultimas 5 tarefas

### Para Gestores/Administradores

Voce vera:
- **Stats da Equipe**:
  - Total de Usuarios
  - Tarefas Ativas
  - Concluidas Hoje
  - Produtividade Media
- **Progresso Semanal da Equipe** - Grafico de barras
- **Atividade Recente** - Ultimas acoes dos membros
- **Visao da Equipe** - Tabela com membros, produtividade e humor

---

## Gerenciamento de Tarefas

Acesse em **Dashboard > Tarefas** (`/dashboard/tasks`)

### Criar Nova Tarefa

1. Clique no botao **+ Nova Tarefa**
2. Preencha:
   - **Titulo** - Nome da tarefa
   - **Descricao** - Detalhes da tarefa
   - **Categoria** - Tipo (Trabalho, Pessoal, Saude, etc.)
   - **Prioridade**:
     - `Alta` - Urgente (vermelho)
     - `Media` - Importante (amarelo)
     - `Baixa` - Quando der (verde)
   - **Data de Vencimento** - Prazo
3. Clique em **Salvar**

### Status das Tarefas

| Status | Significado |
|--------|-------------|
| `Pendente` | Aguardando inicio |
| `Em Progresso` | Voce esta trabalhando nela |
| `Concluida` | Tarefa finalizada |
| `Pulada` | Adiada ou cancelada |

### Acoes Disponiveis

- **Editar** - Modificar detalhes da tarefa
- **Alterar Status** - Mudar para outro status
- **Excluir** - Remover a tarefa

---

## Gerenciamento de Equipes

> **Disponivel apenas para Gestores e Administradores**

Acesse em **Dashboard > Equipes** (`/dashboard/teams`)

### Criar Nova Equipe

1. Clique em **+ Nova Equipe**
2. Preencha:
   - **Nome da Equipe**
   - **Descricao**
3. Clique em **Criar**

Voce sera automaticamente adicionado como Lider da equipe.

### Gerenciar Membros

- **Adicionar Membro**: Clique em "+ Adicionar" na equipe
- **Remover Membro**: Clique no "X" ao lado do membro
- **Ver Detalhes**: Clique no nome da equipe

### Informacoes dos Membros

| Campo | Descricao |
|-------|-----------|
| Nome | Nome do membro |
| Funcao | Cargo na equipe |
| Status | `Ativo`, `Ausente` ou `Offline` |
| Produtividade | Percentual de tarefas concluidas |
| Ultimo Check-in | Quando fez o ultimo check-in |

---

## Relatorios

Acesse em **Dashboard > Relatorios** (`/dashboard/reports`)

### Para Usuarios Individuais

Voce vera seus relatorios pessoais:

- **Sua Produtividade** - Percentual de conclusao
- **Distribuicao por Status** - Grafico de tarefas por status
- **Distribuicao por Prioridade** - Grafico por prioridade
- **Conclusao por Categoria** - Desempenho por tipo de tarefa
- **Resumo Pessoal** - Cards com totais

### Para Gestores/Administradores

Duas abas disponiveis:

**Relatorio da Equipe:**
- Produtividade Media
- Tarefas Concluidas
- Sessoes de Foco
- Tendencia de Produtividade
- Distribuicao de Humor
- Conclusao por Categoria

**Relatorios Individuais:**
- Tabela com cada membro
- Produtividade individual
- Tarefas concluidas
- Sessoes de foco
- Tendencia (subindo, estavel, descendo)

### Filtros de Periodo

- Esta Semana
- Este Mes
- Este Trimestre
- Este Ano

---

## Configuracoes

Acesse em **Dashboard > Configuracoes** (`/dashboard/settings`)

### Perfil

- **Alterar Foto** - Escolha um avatar emoji
- **Nome** - Seu nome de exibicao
- **Email** - Seu email (nao editavel)

### Seguranca

- **Alterar Senha**:
  1. Digite a senha atual
  2. Digite a nova senha (minimo 6 caracteres)
  3. Confirme a nova senha
  4. Clique em **Alterar Senha**

### Notificacoes

| Opcao | Descricao |
|-------|-----------|
| Notificacoes por Email | Receber emails sobre atividades |
| Notificacoes Push | Alertas no navegador |
| Relatorio Semanal | Resumo semanal por email |
| Alertas de Equipe | Notificacoes sobre sua equipe |

### Preferencias

- **Tema**: Claro, Escuro ou Automatico
- **Idioma**: Portugues (Brasil)
- **Fuso Horario**: America/Sao_Paulo

---

## Dicas de Uso

### Organizacao de Tarefas

1. **Use categorias** para agrupar tarefas similares
2. **Defina prioridades** para focar no que importa
3. **Atualize o status** assim que iniciar ou concluir
4. **Revise diariamente** suas tarefas pendentes

### Produtividade

1. Comece pelas tarefas de **alta prioridade**
2. Divida tarefas grandes em **subtarefas menores**
3. Use os **relatorios** para identificar padroes
4. Faca **check-ins regulares** de como esta se sentindo

### Para Gestores

1. **Monitore a equipe** pelo dashboard
2. **Crie equipes tematicas** por projeto ou area
3. **Acompanhe tendencias** nos relatorios individuais
4. **Celebre conquistas** da equipe

---

## Solucao de Problemas

### Esqueci minha senha

1. Na tela de login, clique em **Esqueceu a senha?**
2. Digite seu email
3. Siga as instrucoes enviadas

### Tarefas nao aparecem

- Verifique se esta logado com a conta correta
- As tarefas sao isoladas por usuario
- Limpar o cache do navegador pode ajudar

### Nao consigo criar equipes

- Esta funcionalidade e apenas para **Gestores** e **Administradores**
- Usuarios individuais nao tem acesso a equipes
- Crie uma nova conta como Gestor se precisar

---

## Suporte

- **Email:** suporte@nciaflux.com
- **Contato:** `/contact`
- **Termos de Uso:** `/terms`
- **Privacidade:** `/privacy`

---

*Ultima atualizacao: Janeiro 2025*
