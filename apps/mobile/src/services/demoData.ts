// Demo data for offline mode
import { Task, CheckIn, DailyPlan, ChatMessage, TaskCategory } from '@nciaflux/shared';

const today = new Date().toISOString().split('T')[0];
const now = new Date();

export const DEMO_TASKS: Task[] = [
  {
    id: 'task-001',
    user_id: 'demo-user-001',
    title: 'Revisar emails importantes',
    description: 'Verificar e responder emails prioritarios da manha',
    priority: 'high',
    status: 'pending',
    category: 'work' as TaskCategory,
    estimated_duration_minutes: 30,
    scheduled_time: '09:00',
    completed_at: undefined,
    parent_task_id: undefined,
    order: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'task-002',
    user_id: 'demo-user-001',
    title: 'Reuniao de equipe',
    description: 'Participar da reuniao semanal de alinhamento',
    priority: 'high',
    status: 'pending',
    category: 'work' as TaskCategory,
    estimated_duration_minutes: 60,
    scheduled_time: '10:00',
    completed_at: undefined,
    parent_task_id: undefined,
    order: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'task-003',
    user_id: 'demo-user-001',
    title: 'Almocar',
    description: 'Fazer uma pausa para almoco',
    priority: 'medium',
    status: 'pending',
    category: 'health' as TaskCategory,
    estimated_duration_minutes: 45,
    scheduled_time: '12:00',
    completed_at: undefined,
    parent_task_id: undefined,
    order: 3,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'task-004',
    user_id: 'demo-user-001',
    title: 'Exercicio fisico',
    description: 'Caminhada de 30 minutos',
    priority: 'medium',
    status: 'pending',
    category: 'health' as TaskCategory,
    estimated_duration_minutes: 30,
    scheduled_time: '18:00',
    completed_at: undefined,
    parent_task_id: undefined,
    order: 4,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'task-005',
    user_id: 'demo-user-001',
    title: 'Ler por 20 minutos',
    description: 'Tempo de leitura antes de dormir',
    priority: 'low',
    status: 'pending',
    category: 'personal' as TaskCategory,
    estimated_duration_minutes: 20,
    scheduled_time: '21:00',
    completed_at: undefined,
    parent_task_id: undefined,
    order: 5,
    created_at: now,
    updated_at: now,
  },
];

export const DEMO_DAILY_PLAN: DailyPlan = {
  id: 'plan-001',
  user_id: 'demo-user-001',
  date: today,
  energy_level: 7,
  mood: 'focused',
  tasks: DEMO_TASKS,
  focus_blocks: [],
  is_crisis_mode: false,
  notes: 'Dia produtivo! Foco nas tarefas da manha.',
  created_at: now,
  updated_at: now,
};

export const DEMO_CHECK_INS: CheckIn[] = [
  {
    id: 'checkin-001',
    user_id: 'demo-user-001',
    type: 'morning',
    energy_level: 7,
    mood: 'energized',
    notes: 'Dormi bem, pronto para o dia!',
    responses: undefined,
    created_at: now,
  },
];

export const DEMO_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001',
    user_id: 'demo-user-001',
    role: 'assistant',
    type: 'text',
    content: 'Ola! Bem-vindo ao NeuroFluxo! Estou aqui para ajudar voce a gerenciar suas tarefas de forma mais eficiente. Como esta se sentindo hoje?',
    metadata: undefined,
    created_at: now,
  },
  {
    id: 'msg-002',
    user_id: 'demo-user-001',
    role: 'assistant',
    type: 'suggestion',
    content: 'Dica: Comece o dia com as tarefas mais importantes quando sua energia esta alta. Isso ajuda a manter o foco e a produtividade!',
    metadata: undefined,
    created_at: now,
  },
];

export const DEMO_PROFILE = {
  id: 'profile-001',
  user_id: 'demo-user-001',
  session_id: null,
  summary: 'Perfil com tendencia a hiperfoco em tarefas interessantes, com desafios em transicoes e organizacao.',
  insight: 'Voce trabalha melhor em blocos de tempo focados com intervalos regulares.',
  suggestion: 'Tente usar a tecnica Pomodoro: 25 minutos de foco, 5 de pausa.',
  energy_pattern: {
    morning: 'high',
    afternoon: 'medium',
    evening: 'low',
  },
  execution_style: 'hyperfocus',
  distraction_triggers: ['notificacoes', 'redes sociais', 'ruidos'],
  coping_strengths: ['musica', 'listas', 'timers'],
  focus_duration_minutes: 25,
  best_focus_time: 'morning',
  needs_external_accountability: true,
  response_to_pressure: 'moderate',
  raw_answers: {},
  created_at: now,
  updated_at: now,
};

// Demo data state manager
class DemoDataManager {
  private tasks: Task[] = [...DEMO_TASKS];
  private checkIns: CheckIn[] = [...DEMO_CHECK_INS];
  private chatMessages: ChatMessage[] = [...DEMO_CHAT_MESSAGES];
  private dailyPlan: DailyPlan = { ...DEMO_DAILY_PLAN };

  getTasks(): Task[] {
    return this.tasks;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  addTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
    const now = new Date();
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...updates,
        updated_at: new Date(),
      };
      return this.tasks[index];
    }
    return undefined;
  }

  deleteTask(id: string): boolean {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }

  getCheckIns(): CheckIn[] {
    return this.checkIns;
  }

  addCheckIn(checkIn: Omit<CheckIn, 'id' | 'created_at'>): CheckIn {
    const newCheckIn: CheckIn = {
      ...checkIn,
      id: `checkin-${Date.now()}`,
      created_at: new Date(),
    };
    this.checkIns.push(newCheckIn);
    return newCheckIn;
  }

  getChatMessages(): ChatMessage[] {
    return this.chatMessages;
  }

  addChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): ChatMessage {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      created_at: new Date(),
    };
    this.chatMessages.push(newMessage);
    return newMessage;
  }

  getDailyPlan(): DailyPlan {
    return { ...this.dailyPlan, tasks: this.tasks };
  }

  updateDailyPlan(updates: Partial<DailyPlan>): DailyPlan {
    this.dailyPlan = {
      ...this.dailyPlan,
      ...updates,
      updated_at: new Date(),
    };
    return this.dailyPlan;
  }

  getProfile() {
    return DEMO_PROFILE;
  }
}

export const demoDataManager = new DemoDataManager();
