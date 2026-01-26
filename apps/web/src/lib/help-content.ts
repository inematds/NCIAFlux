/**
 * Help Content - Conteúdo de ajuda para todas as páginas
 */

import { HelpContent } from '@/components/HelpButton';

export const helpContent: Record<string, HelpContent> = {
  dashboard: {
    title: 'Dashboard Principal',
    description: 'O Dashboard é sua central de comando pessoal. Aqui você tem uma visão geral do seu dia, suas tarefas prioritárias, seu progresso e insights personalizados baseados no seu perfil TDAH.',
    objective: 'Fornecer uma visão rápida e clara do seu dia, ajudando você a manter o foco no que é importante sem sobrecarregar com informações.',
    howItWorks: [
      'Visualize suas tarefas do dia organizadas por prioridade',
      'Acompanhe seu progresso diário com métricas visuais',
      'Receba lembretes gentis sobre check-ins e pausas',
      'Veja insights personalizados baseados nos seus padrões',
    ],
    tips: [
      'Comece o dia revisando apenas as 3 tarefas mais importantes',
      'Use o modo foco quando precisar de concentração',
      'Faça pausas regulares - seu cérebro agradece!',
    ],
    features: ['Visão do dia', 'Tarefas prioritárias', 'Progresso visual', 'Insights personalizados'],
  },

  tasks: {
    title: 'Gerenciador de Tarefas',
    description: 'O Gerenciador de Tarefas foi pensado especialmente para mentes TDAH. Sem listas infinitas ou pressão - apenas o que você precisa fazer, organizado de forma clara e gentil.',
    objective: 'Ajudar você a organizar suas tarefas de forma que funcione com seu cérebro, não contra ele. Foco em poucas tarefas por vez, sem sobrecarga.',
    howItWorks: [
      'Adicione tarefas com título, prioridade e prazo opcional',
      'Organize por projetos ou contextos',
      'Marque como concluída e ganhe XP',
      'Tarefas atrasadas são tratadas com gentileza, sem culpa',
    ],
    tips: [
      'Quebre tarefas grandes em pequenos passos',
      'Use emojis para tornar as tarefas mais visuais',
      'Não adicione mais de 5 tarefas para um único dia',
      'Celebre cada tarefa concluída!',
    ],
    features: ['Prioridades visuais', 'Projetos', 'Subtarefas', 'Recompensas XP', 'Sem punição por atrasos'],
  },

  focus: {
    title: 'Timer de Foco',
    description: 'O Timer de Foco usa técnicas como Pomodoro adaptadas para TDAH. Períodos curtos de concentração com pausas obrigatórias para manter sua energia mental.',
    objective: 'Ajudar você a entrar e manter o estado de foco sem esgotamento, respeitando os limites naturais de atenção.',
    howItWorks: [
      'Escolha uma tarefa para focar',
      'Inicie o timer (padrão: 25 minutos)',
      'Trabalhe sem interrupções até o alarme',
      'Faça uma pausa obrigatória',
      'Repita conforme sua energia permitir',
    ],
    tips: [
      'Comece com sessões de 15 minutos se 25 parecer muito',
      'Use fones de ouvido com música ou ruído branco',
      'Deixe o celular em outro cômodo durante o foco',
      'Não pule as pausas - elas são parte do processo!',
    ],
    features: ['Timer personalizável', 'Pausas guiadas', 'Estatísticas de foco', 'Integração com tarefas'],
  },

  checkin: {
    title: 'Check-in Diário',
    description: 'O Check-in é um momento de conexão consigo mesmo. Em poucos segundos, você registra como está se sentindo e o que pretende focar hoje.',
    objective: 'Criar consciência sobre seu estado emocional e mental, ajudando o app a se adaptar às suas necessidades do momento.',
    howItWorks: [
      'Responda como você está se sentindo (1-5)',
      'Indique seu nível de energia',
      'Opcionalmente, escreva uma nota',
      'O app ajusta sugestões baseado no seu estado',
    ],
    tips: [
      'Faça o check-in logo ao acordar',
      'Seja honesto - não existe resposta errada',
      'Use os check-ins para identificar padrões ao longo do tempo',
      'Se estiver em um dia difícil, o app vai pegar leve com você',
    ],
    features: ['Registro de humor', 'Nível de energia', 'Notas pessoais', 'Histórico visual'],
  },

  planner: {
    title: 'Planejador Diário',
    description: 'O Planejador ajuda você a estruturar seu dia de forma realista, considerando sua energia, compromissos e o que realmente importa.',
    objective: 'Criar um plano diário alcançável que respeita seus limites e maximiza sua produtividade natural.',
    howItWorks: [
      'Veja suas tarefas e compromissos do dia',
      'Arraste para organizar por horário',
      'O app sugere blocos de tempo baseado no seu cronotipo',
      'Ajuste conforme sua energia ao longo do dia',
    ],
    tips: [
      'Coloque tarefas difíceis no seu horário de pico de energia',
      'Deixe espaços vazios para imprevistos',
      'Não planeje mais de 4-5 horas de trabalho focado',
      'Inclua tempo para transições entre atividades',
    ],
    features: ['Blocos de tempo', 'Sugestões por cronotipo', 'Arrastar e soltar', 'Integração com calendário'],
  },

  calendar: {
    title: 'Calendário',
    description: 'Visualize seus compromissos e prazos em formato de calendário. Integrado com suas tarefas e rotinas para uma visão completa.',
    objective: 'Dar visibilidade clara do que está por vir, evitando surpresas e ajudando no planejamento.',
    howItWorks: [
      'Veja compromissos em visão diária, semanal ou mensal',
      'Tarefas com prazo aparecem automaticamente',
      'Adicione eventos diretamente no calendário',
      'Receba lembretes antes dos compromissos',
    ],
    tips: [
      'Use cores diferentes para tipos de compromissos',
      'Bloqueie tempo para você mesmo',
      'Revise a semana todo domingo',
    ],
    features: ['Múltiplas visualizações', 'Cores personalizadas', 'Lembretes', 'Integração com tarefas'],
  },

  crisis: {
    title: 'Modo Crise',
    description: 'O Modo Crise é seu botão de emergência para dias muito difíceis. Quando tudo parece demais, ele simplifica tudo e foca apenas no essencial.',
    objective: 'Fornecer suporte imediato em momentos de sobrecarga, reduzindo estímulos e oferecendo orientação passo a passo.',
    howItWorks: [
      'Ative quando estiver sobrecarregado',
      'O app entra em modo simplificado',
      'Mostra apenas 1 tarefa por vez',
      'Oferece exercícios de respiração e grounding',
      'Desativa notificações não essenciais',
    ],
    tips: [
      'Não tenha vergonha de usar - é para isso que existe',
      'Use os exercícios de respiração mesmo fora de crise',
      'Avise alguém de confiança se precisar de apoio',
      'Depois da crise, descanse antes de voltar à rotina',
    ],
    features: ['Interface simplificada', 'Exercícios guiados', 'Uma tarefa por vez', 'Modo silencioso'],
  },

  discovery: {
    title: 'Descoberta de Perfil',
    description: 'A Descoberta é um questionário interativo que mapeia como seu cérebro funciona - seus pontos fortes, desafios e o que funciona para você.',
    objective: 'Criar um perfil personalizado que permite ao app se adaptar às suas necessidades específicas.',
    howItWorks: [
      'Responda perguntas sobre seus hábitos e preferências',
      'O app analisa seus padrões',
      'Receba seu perfil de cronotipo e estilo cognitivo',
      'O app se adapta baseado nas suas respostas',
    ],
    tips: [
      'Responda com base no que você realmente faz, não no que gostaria',
      'Pode refazer a descoberta a qualquer momento',
      'Seu perfil evolui conforme você usa o app',
    ],
    features: ['Questionário interativo', 'Análise de cronotipo', 'Perfil cognitivo', 'Recomendações personalizadas'],
  },

  chronotype: {
    title: 'Cronotipo',
    description: 'Seu cronotipo indica seus horários naturais de maior energia e foco. Conhecê-lo ajuda a planejar seu dia de forma mais eficiente.',
    objective: 'Identificar seus picos de energia para agendar tarefas importantes nos melhores horários.',
    howItWorks: [
      'O app identifica seu cronotipo baseado em suas respostas',
      'Mostra seus horários de pico de energia',
      'Sugere melhores horários para diferentes tipos de tarefas',
      'Ajusta lembretes e sugestões ao seu ritmo',
    ],
    tips: [
      'Respeite seu cronotipo - não lute contra ele',
      'Tarefas criativas no pico, administrativas na baixa',
      'Durma e acorde em horários consistentes',
    ],
    features: ['Identificação de cronotipo', 'Mapa de energia', 'Sugestões de horários', 'Gráficos de padrões'],
  },

  routines: {
    title: 'Rotinas',
    description: 'Rotinas são sequências de pequenas ações que, quando automatizadas, liberam energia mental para o que realmente importa.',
    objective: 'Criar hábitos automáticos que reduzem a necessidade de decisões e aumentam a consistência.',
    howItWorks: [
      'Crie rotinas matinais e noturnas',
      'Adicione pequenas ações em sequência',
      'Siga a rotina tocando cada item',
      'O app rastreia sua consistência',
    ],
    tips: [
      'Comece com rotinas de apenas 3-5 itens',
      'Vincule novos hábitos a ações existentes',
      'Seja flexível - rotinas são guias, não prisões',
      'Celebre a consistência, não a perfeição',
    ],
    features: ['Rotina matinal', 'Rotina noturna', 'Checklists visuais', 'Rastreamento de consistência'],
  },

  'brain-dump': {
    title: 'Brain Dump',
    description: 'O Brain Dump é um espaço para descarregar tudo que está na sua cabeça. Sem julgamento, sem organização - apenas libere os pensamentos.',
    objective: 'Aliviar a carga mental despejando pensamentos, ideias e preocupações em um lugar seguro.',
    howItWorks: [
      'Escreva tudo que está na sua cabeça',
      'Não se preocupe com formatação ou organização',
      'Depois, opcionalmente transforme itens em tarefas',
      'Limpe quando quiser começar de novo',
    ],
    tips: [
      'Faça um brain dump quando se sentir sobrecarregado',
      'Use antes de dormir para esvaziar a mente',
      'Não edite enquanto escreve - apenas despeje',
    ],
    features: ['Escrita livre', 'Conversão em tarefas', 'Histórico', 'Export para notas'],
  },

  notes: {
    title: 'Notas',
    description: 'Um espaço simples para guardar informações importantes, ideias e referências que você precisa acessar depois.',
    objective: 'Centralizar informações importantes em um lugar fácil de encontrar.',
    howItWorks: [
      'Crie notas com título e conteúdo',
      'Organize por categorias ou tags',
      'Busque por palavras-chave',
      'Acesse de qualquer lugar',
    ],
    tips: [
      'Use para listas de referência que consulta frequentemente',
      'Capture ideias rapidamente antes que escapem',
      'Revise e limpe notas antigas periodicamente',
    ],
    features: ['Editor simples', 'Categorias', 'Busca', 'Sincronização'],
  },

  projects: {
    title: 'Projetos',
    description: 'Projetos agrupam tarefas relacionadas a um objetivo maior. Perfeito para acompanhar progresso em iniciativas de longo prazo.',
    objective: 'Organizar trabalho complexo em partes gerenciáveis e acompanhar progresso geral.',
    howItWorks: [
      'Crie um projeto com nome e descrição',
      'Adicione tarefas ao projeto',
      'Acompanhe o progresso geral',
      'Defina marcos e celebre ao alcançá-los',
    ],
    tips: [
      'Não tenha mais de 3 projetos ativos por vez',
      'Quebre projetos grandes em fases',
      'Revise projetos semanalmente',
    ],
    features: ['Agrupamento de tarefas', 'Progresso visual', 'Marcos', 'Datas limite'],
  },

  reports: {
    title: 'Relatórios',
    description: 'Visualize seu progresso ao longo do tempo. Entenda seus padrões, celebre conquistas e identifique áreas de melhoria.',
    objective: 'Fornecer insights sobre seus hábitos e progresso para ajudar na tomada de decisões.',
    howItWorks: [
      'Veja estatísticas diárias, semanais e mensais',
      'Analise padrões de produtividade',
      'Identifique seus melhores dias e horários',
      'Exporte relatórios se necessário',
    ],
    tips: [
      'Revise semanalmente para ajustar estratégias',
      'Foque em tendências, não dias isolados',
      'Use insights para planejar melhor',
    ],
    features: ['Gráficos visuais', 'Múltiplos períodos', 'Exportação', 'Comparativos'],
  },

  review: {
    title: 'Revisão Semanal',
    description: 'A Revisão Semanal é um momento para refletir sobre a semana, celebrar conquistas e planejar a próxima.',
    objective: 'Criar um hábito de reflexão que melhora continuamente sua produtividade e bem-estar.',
    howItWorks: [
      'Responda perguntas guiadas sobre a semana',
      'Celebre o que deu certo',
      'Identifique o que pode melhorar',
      'Defina intenções para a próxima semana',
    ],
    tips: [
      'Reserve 15-20 minutos no domingo',
      'Seja gentil consigo mesmo na reflexão',
      'Anote aprendizados para consultar depois',
    ],
    features: ['Perguntas guiadas', 'Celebração de conquistas', 'Planejamento', 'Histórico'],
  },

  settings: {
    title: 'Configurações',
    description: 'Personalize o app para funcionar da sua maneira. Ajuste notificações, aparência e preferências.',
    objective: 'Permitir que você adapte o app às suas necessidades e preferências pessoais.',
    howItWorks: [
      'Acesse diferentes categorias de configurações',
      'Ajuste notificações e lembretes',
      'Personalize aparência e comportamento',
      'Gerencie sua conta e dados',
    ],
    tips: [
      'Comece com as configurações padrão e ajuste conforme necessário',
      'Desative notificações que não são úteis',
      'Revise configurações periodicamente',
    ],
    features: ['Notificações', 'Aparência', 'Conta', 'Privacidade', 'Exportação de dados'],
  },

  teams: {
    title: 'Times',
    description: 'Gerencie equipes e acompanhe o progresso coletivo. Ideal para gestores que querem apoiar suas equipes de forma respeitosa.',
    objective: 'Facilitar a gestão de equipes com foco em apoio e não em vigilância, respeitando a privacidade individual.',
    howItWorks: [
      'Crie times e convide membros',
      'Veja métricas agregadas (não individuais)',
      'Crie desafios e celebre conquistas coletivas',
      'Membros controlam o que compartilham',
    ],
    tips: [
      'Foque em apoio, não em controle',
      'Celebre conquistas do time publicamente',
      'Respeite a privacidade de cada membro',
    ],
    features: ['Gestão de times', 'Métricas agregadas', 'Desafios', 'Rankings amigáveis', 'Conquistas colaborativas'],
  },

  gamification: {
    title: 'Gamificação',
    description: 'Sistema de recompensas pensado para TDAH. Ganhe XP, suba de nível e desbloqueie conquistas - sem pressão ou punição.',
    objective: 'Tornar o progresso visível e recompensador, usando dopamina a seu favor.',
    howItWorks: [
      'Complete tarefas e ações para ganhar XP',
      'Suba de nível conforme acumula XP',
      'Desbloqueie conquistas por marcos especiais',
      'Mantenha sequências (sem punição se pausar)',
    ],
    tips: [
      'Não se preocupe com "perder" sequências - elas pausam, não zeram',
      'Foque no progresso, não na perfeição',
      'Celebre cada nível e conquista!',
    ],
    features: ['Sistema de XP', 'Níveis', '20+ conquistas', 'Sequências gentis', 'Sem punição'],
  },

  partnerships: {
    title: 'Parcerias',
    description: 'Conecte-se com um parceiro de responsabilidade. Apoiem-se mutuamente, compartilhem conquistas e se motivem.',
    objective: 'Criar conexão humana que aumenta motivação e responsabilidade de forma gentil.',
    howItWorks: [
      'Gere um código e compartilhe com alguém',
      'Ou aceite o código de outra pessoa',
      'Troquem mensagens de apoio',
      'Compartilhem conquistas automaticamente',
    ],
    tips: [
      'Escolha alguém que entende seus desafios',
      'Combinem check-ins regulares',
      'Celebrem as vitórias um do outro',
      'Sem julgamento nos dias difíceis',
    ],
    features: ['Chat privado', 'Compartilhamento de conquistas', 'Mensagens de incentivo', 'Código de convite'],
  },

  communities: {
    title: 'Comunidades',
    description: 'Participe de grupos com pessoas que compartilham desafios e objetivos similares. Juntos somos mais fortes.',
    objective: 'Criar senso de pertencimento e suporte coletivo entre pessoas com experiências similares.',
    howItWorks: [
      'Encontre comunidades por interesse ou crie a sua',
      'Participe de conversas em grupo',
      'Compartilhe dicas e experiências',
      'Celebre conquistas coletivas',
    ],
    tips: [
      'Comece observando antes de participar ativamente',
      'Compartilhe suas experiências - ajuda outros',
      'Seja respeitoso com diferentes experiências',
    ],
    features: ['Grupos temáticos', 'Chat em tempo real', 'Moderação', 'Eventos'],
  },

  adaptive: {
    title: 'Dashboard Adaptativo',
    description: 'O sistema aprende com seus padrões e se adapta automaticamente. Quanto mais você usa, mais personalizado fica.',
    objective: 'Criar uma experiência única que evolui com você, desbloqueando recursos conforme você ganha estabilidade.',
    howItWorks: [
      'O app coleta padrões do seu uso (localmente)',
      'Calcula seu Score de Estabilidade (0-100)',
      'Desbloqueia recursos progressivamente',
      'Adapta sugestões ao seu estado atual',
    ],
    tips: [
      'Use o app regularmente para melhores adaptações',
      'O score de estabilidade não é uma nota - é informação',
      'Recursos desbloqueiam gradualmente para não sobrecarregar',
    ],
    features: ['Score de estabilidade', 'Detecção de padrões', 'Desbloqueio progressivo', 'Adaptação automática'],
  },

  admin: {
    title: 'Painel Admin',
    description: 'Área administrativa para gestão de empresas, usuários e times. Acesso restrito a administradores.',
    objective: 'Fornecer ferramentas de gestão para administradores da plataforma.',
    howItWorks: [
      'Gerencie empresas cadastradas',
      'Administre usuários e permissões',
      'Acompanhe métricas gerais',
      'Configure parâmetros do sistema',
    ],
    tips: [
      'Use com responsabilidade',
      'Respeite a privacidade dos usuários',
      'Documente alterações importantes',
    ],
    features: ['Gestão de empresas', 'Gestão de usuários', 'Métricas', 'Configurações'],
  },
};

export function getHelpContent(page: string): HelpContent {
  return helpContent[page] || helpContent.dashboard;
}
