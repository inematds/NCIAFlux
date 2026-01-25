/**
 * AI Tools - v1.3
 * Tool definitions and executor for AI chat
 */

import type { AITool } from '@shared/types';

// ===== Tool Definitions =====

export const AI_TOOLS: AITool[] = [
  // === TAREFAS ===
  {
    name: 'create_task',
    description: 'Cria uma nova tarefa para o usuario. Use quando o usuario mencionar algo que precisa fazer.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titulo da tarefa' },
        description: { type: 'string', description: 'Descricao opcional' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Prioridade (padrao: medium)' },
        dueDate: { type: 'string', description: 'Data de vencimento (YYYY-MM-DD, padrao: hoje)' },
        period: { type: 'string', enum: ['morning', 'afternoon', 'evening'], description: 'Periodo do dia' },
      },
      required: ['title'],
    },
  },

  {
    name: 'complete_task',
    description: 'Marca uma tarefa como concluida. Use o titulo para buscar se o ID nao for conhecido.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'ID da tarefa (opcional se fornecer titulo)' },
        taskTitle: { type: 'string', description: 'Titulo da tarefa para buscar' },
      },
    },
  },

  // === BRAIN DUMP ===
  {
    name: 'add_to_brain_dump',
    description: 'Adiciona um ou mais itens ao Brain Dump. Use para pensamentos, ideias, coisas para fazer depois.',
    input_schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string', description: 'Conteudo do item' },
              category: {
                type: 'string',
                enum: ['call', 'message', 'email', 'plan', 'research', 'create', 'other'],
                description: 'Categoria do item',
              },
            },
            required: ['content'],
          },
        },
      },
      required: ['items'],
    },
  },

  // === MODO CRISE ===
  {
    name: 'activate_crisis_mode',
    description: 'Ativa o Modo Crise quando o usuario esta sobrecarregado ou tendo um dia dificil.',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Motivo opcional (para historico)' },
      },
    },
  },

  // === CHECK-IN ===
  {
    name: 'record_checkin',
    description: 'Registra um check-in de energia/humor do usuario.',
    input_schema: {
      type: 'object',
      properties: {
        energyLevel: { type: 'number', minimum: 1, maximum: 5, description: 'Nivel de energia (1-5)' },
        mood: { type: 'string', enum: ['great', 'good', 'neutral', 'low', 'bad'], description: 'Humor atual' },
        notes: { type: 'string', description: 'Notas opcionais' },
      },
      required: ['energyLevel'],
    },
  },

  // === AGENDA / CALENDARIO ===
  {
    name: 'create_event',
    description: 'Cria um evento na agenda/calendario. Use para reunioes, compromissos, consultas, etc.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titulo do evento' },
        description: { type: 'string', description: 'Descricao opcional do evento' },
        date: { type: 'string', description: 'Data do evento (YYYY-MM-DD)' },
        startTime: { type: 'string', description: 'Hora de inicio (HH:MM, formato 24h)' },
        endTime: { type: 'string', description: 'Hora de termino (HH:MM, formato 24h)' },
        category: { type: 'string', enum: ['meeting', 'appointment', 'personal', 'work', 'health', 'other'], description: 'Categoria do evento' },
        reminder: { type: 'number', description: 'Lembrete em minutos antes (ex: 15, 30, 60)' },
      },
      required: ['title', 'date', 'startTime'],
    },
  },

  // === BUSCA DE TAREFAS ===
  {
    name: 'search_tasks',
    description: 'Busca tarefas por termo, status ou prioridade.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Termo de busca no titulo/descricao' },
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed'], description: 'Filtrar por status' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Filtrar por prioridade' },
        limit: { type: 'number', description: 'Maximo de resultados (padrao: 5)' },
      },
    },
  },

  {
    name: 'list_today_tasks',
    description: 'Lista todas as tarefas de hoje. Use quando o usuario perguntar o que precisa fazer.',
    input_schema: {
      type: 'object',
      properties: {
        includeCompleted: { type: 'boolean', description: 'Incluir tarefas concluidas (padrao: false)' },
        groupByPriority: { type: 'boolean', description: 'Agrupar por prioridade (padrao: true)' },
      },
    },
  },

  // === NOTAS ===
  {
    name: 'create_note',
    description: 'Cria uma nota rapida. Use para informacoes que nao sao tarefas.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titulo da nota' },
        content: { type: 'string', description: 'Conteudo da nota' },
        category: { type: 'string', description: 'Categoria (ex: ideias, referencias, lembretes)' },
      },
      required: ['content'],
    },
  },

  // === PROJETOS ===
  {
    name: 'create_project',
    description: 'Cria um novo projeto para organizar tarefas relacionadas.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome do projeto' },
        description: { type: 'string', description: 'Descricao do projeto' },
        color: { type: 'string', description: 'Cor do projeto (hex ou nome)' },
      },
      required: ['name'],
    },
  },

  // === ESTATISTICAS ===
  {
    name: 'get_stats',
    description: 'Retorna estatisticas do usuario (tarefas, foco, humor). Use para perguntas sobre produtividade.',
    input_schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', 'week', 'month'], description: 'Periodo das estatisticas (padrao: today)' },
        includeComparison: { type: 'boolean', description: 'Comparar com periodo anterior (padrao: false)' },
      },
    },
  },

  // === SUGESTOES ===
  {
    name: 'suggest_next_task',
    description: 'Sugere a proxima tarefa com base no contexto atual (hora, energia, tarefas pendentes).',
    input_schema: {
      type: 'object',
      properties: {
        considerEnergy: { type: 'boolean', description: 'Considerar nivel de energia atual (padrao: true)' },
        maxSuggestions: { type: 'number', description: 'Numero de sugestoes (padrao: 3)' },
      },
    },
  },

  // === DEACTIVATE CRISIS ===
  {
    name: 'deactivate_crisis_mode',
    description: 'Desativa o Modo Crise quando o usuario se sentir melhor.',
    input_schema: {
      type: 'object',
      properties: {
        notes: { type: 'string', description: 'Notas sobre como se sente agora' },
      },
    },
  },
];

// ===== Tool Execution Result =====

interface ToolExecutionResult {
  success: boolean;
  result?: unknown;
  message?: string;
  error?: string;
  redirectTo?: string;
}

// ===== Tool Executor =====

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<ToolExecutionResult> {
  try {
    switch (toolName) {
      case 'create_task':
        return await createTask(args, userId);
      case 'complete_task':
        return await completeTask(args, userId);
      case 'add_to_brain_dump':
        return await addToBrainDump(args, userId);
      case 'activate_crisis_mode':
        return await activateCrisisMode(args, userId);
      case 'record_checkin':
        return await recordCheckin(args, userId);
      case 'create_event':
        return await createEvent(args, userId);
      case 'search_tasks':
        return await searchTasks(args, userId);
      case 'list_today_tasks':
        return await listTodayTasks(args, userId);
      case 'create_note':
        return await createNote(args, userId);
      case 'create_project':
        return await createProject(args, userId);
      case 'get_stats':
        return await getStats(args, userId);
      case 'suggest_next_task':
        return await suggestNextTask(args, userId);
      case 'deactivate_crisis_mode':
        return await deactivateCrisisMode(args, userId);
      default:
        return {
          success: false,
          error: `Tool nao implementada: ${toolName}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// ===== Tool Implementations =====

async function createTask(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolExecutionResult> {
  const title = args.title as string;
  const description = args.description as string | undefined;
  const priority = (args.priority as string) || 'medium';
  const dueDate = (args.dueDate as string) || new Date().toISOString().split('T')[0];
  const period = args.period as string | undefined;

  const task = {
    id: `task_${Date.now()}`,
    title,
    description: description || '',
    priority,
    status: 'pending',
    dueDate,
    period,
    assignee: userId,
    category: 'geral',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Note: In a real implementation, this would save to storage
  // For API route, we return the task to be saved client-side
  return {
    success: true,
    result: { task, action: 'create_task' },
    message: `Pronto! Criei a tarefa "${title}" para voce.${priority === 'high' ? ' Marquei como prioridade alta.' : ''}`,
  };
}

async function completeTask(
  args: Record<string, unknown>,
  _userId: string
): Promise<ToolExecutionResult> {
  const taskId = args.taskId as string | undefined;
  const taskTitle = args.taskTitle as string | undefined;

  if (!taskId && !taskTitle) {
    return {
      success: false,
      error: 'Preciso do ID ou titulo da tarefa para completar.',
    };
  }

  // Note: In a real implementation, this would search and update storage
  return {
    success: true,
    result: {
      action: 'complete_task',
      taskId,
      taskTitle,
      searchBy: taskId ? 'id' : 'title',
    },
    message: `Otimo! Marquei a tarefa "${taskTitle || taskId}" como concluida. Parabens pelo progresso!`,
  };
}

async function addToBrainDump(
  args: Record<string, unknown>,
  _userId: string
): Promise<ToolExecutionResult> {
  const items = args.items as Array<{ content: string; category?: string }>;

  if (!items || items.length === 0) {
    return {
      success: false,
      error: 'Nenhum item fornecido para o Brain Dump.',
    };
  }

  const createdItems = items.map((item, index) => ({
    id: `bd_${Date.now()}_${index}`,
    content: item.content,
    category: item.category || 'other',
    status: 'inbox',
    createdAt: new Date().toISOString(),
  }));

  const itemCount = createdItems.length;
  const itemWord = itemCount === 1 ? 'item' : 'itens';

  return {
    success: true,
    result: { items: createdItems, action: 'add_to_brain_dump' },
    message: `Adicionei ${itemCount} ${itemWord} ao seu Brain Dump. Quando quiser, podemos triar juntos!`,
  };
}

async function activateCrisisMode(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolExecutionResult> {
  const reason = args.reason as string | undefined;

  const crisisState = {
    active: true,
    activatedAt: new Date().toISOString(),
    reason,
    userId,
  };

  return {
    success: true,
    result: { crisisState, action: 'activate_crisis_mode' },
    message: 'Entendi. Ativei o Modo Crise para voce. Respira fundo - esta tudo bem ter dias assim. Estou aqui se precisar.',
    redirectTo: '/dashboard/crisis',
  };
}

async function recordCheckin(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolExecutionResult> {
  const energyLevel = args.energyLevel as number;
  const mood = args.mood as string | undefined;
  const notes = args.notes as string | undefined;

  if (energyLevel < 1 || energyLevel > 5) {
    return {
      success: false,
      error: 'Nivel de energia deve ser entre 1 e 5.',
    };
  }

  const checkin = {
    id: `checkin_${Date.now()}`,
    userId,
    energyLevel,
    mood,
    notes,
    type: 'on_demand',
    createdAt: new Date().toISOString(),
  };

  const energyEmoji = ['😴', '😔', '😐', '😊', '⚡'][energyLevel - 1];
  const moodText = mood ? ` e humor ${mood}` : '';

  return {
    success: true,
    result: { checkin, action: 'record_checkin' },
    message: `Registrei seu check-in: energia ${energyLevel}/5 ${energyEmoji}${moodText}. Obrigado por compartilhar como voce esta!`,
  };
}

async function createEvent(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolExecutionResult> {
  const title = args.title as string;
  const description = args.description as string | undefined;
  const date = args.date as string;
  const startTime = args.startTime as string;
  const endTime = args.endTime as string | undefined;
  const category = (args.category as string) || 'other';
  const reminder = args.reminder as number | undefined;

  const event = {
    id: `event_${Date.now()}`,
    title,
    description: description || '',
    date,
    startTime,
    endTime: endTime || '',
    category,
    reminder: reminder || 15,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const categoryEmoji: Record<string, string> = {
    meeting: '👥',
    appointment: '📅',
    personal: '🏠',
    work: '💼',
    health: '🏥',
    other: '📌',
  };

  const emoji = categoryEmoji[category] || '📌';
  const timeText = endTime ? `${startTime} - ${endTime}` : `${startTime}`;

  return {
    success: true,
    result: { event, action: 'create_event' },
    message: `${emoji} Agendei "${title}" para ${date} as ${timeText}.${reminder ? ` Vou te lembrar ${reminder} minutos antes.` : ''}`,
  };
}

// ===== Additional Tool Implementations =====

async function searchTasks(
  args: Record<string, unknown>,
  _userId: string
): Promise<ToolExecutionResult> {
  const query = args.query as string | undefined;
  const status = args.status as string | undefined;
  const priority = args.priority as string | undefined;
  const limit = (args.limit as number) || 5;

  // Note: In a real implementation, this would search the database/storage
  // For now, we return a query object for client-side execution
  return {
    success: true,
    result: {
      action: 'search_tasks',
      searchParams: { query, status, priority, limit },
    },
    message: query
      ? `Buscando tarefas com "${query}"...`
      : `Buscando tarefas${status ? ` com status ${status}` : ''}${priority ? ` e prioridade ${priority}` : ''}...`,
  };
}

async function listTodayTasks(
  args: Record<string, unknown>,
  _userId: string
): Promise<ToolExecutionResult> {
  const includeCompleted = args.includeCompleted as boolean ?? false;
  const groupByPriority = args.groupByPriority as boolean ?? true;

  return {
    success: true,
    result: {
      action: 'list_today_tasks',
      params: { includeCompleted, groupByPriority },
    },
    message: 'Deixe-me ver suas tarefas de hoje...',
  };
}

async function createNote(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolExecutionResult> {
  const title = args.title as string | undefined;
  const content = args.content as string;
  const category = args.category as string | undefined;

  const note = {
    id: `note_${Date.now()}`,
    title: title || 'Nota rapida',
    content,
    category: category || 'geral',
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    result: { note, action: 'create_note' },
    message: `Salvei sua nota "${note.title}".`,
  };
}

async function createProject(
  args: Record<string, unknown>,
  userId: string
): Promise<ToolExecutionResult> {
  const name = args.name as string;
  const description = args.description as string | undefined;
  const color = args.color as string | undefined;

  const project = {
    id: `proj_${Date.now()}`,
    name,
    description: description || '',
    color: color || '#8B5CF6',
    userId,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    result: { project, action: 'create_project' },
    message: `Criei o projeto "${name}". Voce pode adicionar tarefas a ele quando quiser!`,
  };
}

async function getStats(
  args: Record<string, unknown>,
  _userId: string
): Promise<ToolExecutionResult> {
  const period = (args.period as string) || 'today';
  const includeComparison = args.includeComparison as boolean ?? false;

  // Note: In a real implementation, this would fetch actual stats
  return {
    success: true,
    result: {
      action: 'get_stats',
      params: { period, includeComparison },
    },
    message: `Analisando suas estatisticas de ${period === 'today' ? 'hoje' : period === 'week' ? 'esta semana' : 'este mes'}...`,
  };
}

async function suggestNextTask(
  args: Record<string, unknown>,
  _userId: string
): Promise<ToolExecutionResult> {
  const considerEnergy = args.considerEnergy as boolean ?? true;
  const maxSuggestions = (args.maxSuggestions as number) || 3;

  // Note: In a real implementation, this would use context to suggest
  return {
    success: true,
    result: {
      action: 'suggest_next_task',
      params: { considerEnergy, maxSuggestions },
    },
    message: 'Deixe-me analisar suas tarefas e sugerir a proxima...',
  };
}

async function deactivateCrisisMode(
  args: Record<string, unknown>,
  _userId: string
): Promise<ToolExecutionResult> {
  const notes = args.notes as string | undefined;

  return {
    success: true,
    result: {
      action: 'deactivate_crisis_mode',
      notes,
      deactivatedAt: new Date().toISOString(),
    },
    message: 'Que bom que voce esta se sentindo melhor! Desativei o Modo Crise. Continue no seu ritmo!',
  };
}

// ===== Export tool names for reference =====

export const TOOL_NAMES = AI_TOOLS.map(t => t.name);
