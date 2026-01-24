/**
 * App Constants
 */

export const APP_CONFIG = {
  name: 'NCIAFlux',
  displayName: 'NeuroFluxo',
  version: '1.0.0',
  tagline: 'Seu fluxo, seu ritmo',
  supportEmail: 'suporte@nciaflux.com',
} as const;

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    storageMode: 'local', // Dados armazenados localmente no dispositivo
    features: [
      'Todas as funcionalidades',
      'Descoberta e perfil cognitivo',
      'Check-in diario',
      'Timer de foco',
      'Gerenciamento de tarefas',
      'Modo crise',
      'Relatorios pessoais',
      'Dados salvos localmente',
    ],
    note: 'Todas as funcionalidades com dados armazenados no seu dispositivo',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 29.9,
    storageMode: 'cloud', // Dados sincronizados na nuvem
    features: [
      'Tudo do Gratuito',
      'Sincronizacao na nuvem',
      'Acesso em multiplos dispositivos',
      'Backup automatico',
      'Gestao de equipes',
      'Dashboard de lider',
      'Relatorios de equipe',
      'Suporte prioritario',
    ],
    note: 'Ideal para quem quer sincronizar dados entre dispositivos ou liderar equipes',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Empresarial',
    price: 0, // Preco sob consulta
    storageMode: 'cloud',
    features: [
      'Tudo do Premium',
      'Multiplas equipes',
      'Integracao com RH',
      'Relatorios corporativos',
      'SSO e seguranca avancada',
      'Suporte dedicado',
      'Treinamento personalizado',
    ],
    note: 'Para empresas - entre em contato para preco personalizado',
  },
} as const;

export const FEATURE_FLAGS = {
  // Plan-based features
  PLAN_PERSONALIZED: 'plan_personalized',
  CHAT_BASIC: 'chat_basic',
  CHAT_VOICE: 'chat_voice',
  NOTIFICATIONS_BASIC: 'notifications_basic',
  NOTIFICATIONS_ADVANCED: 'notifications_advanced',
  WIDGETS: 'widgets',
  CRISIS_MODE: 'crisis_mode',
  REPORTS_BASIC: 'reports_basic',
  REPORTS_ADVANCED: 'reports_advanced',
  EDUCATIONAL_CONTENT: 'educational_content',
  COMMUNITY: 'community',
  PROFESSIONAL_LINK: 'professional_link',

  // System features
  MAINTENANCE_MODE: 'maintenance_mode',
  NEW_ONBOARDING: 'new_onboarding',
} as const;

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',

  // Discovery
  DISCOVERY_QUESTIONS: '/discovery/questions',
  DISCOVERY_SUBMIT: '/discovery/submit',
  DISCOVERY_PROFILE: '/discovery/profile',
  DISCOVERY_SHARE: '/discovery/share',

  // Plan
  PLANS_CURRENT: '/plans/current',
  PLANS_GENERATE: '/plans/generate',
  PLANS_DAILY: '/plans/daily',

  // Tasks
  TASKS: '/tasks',
  TASKS_COMPLETE: '/tasks/:id/complete',
  TASKS_SKIP: '/tasks/:id/skip',

  // Chat
  CHAT_MESSAGES: '/chat/messages',
  CHAT_SEND: '/chat/send',
  CHAT_CHECK_IN: '/chat/check-in',

  // Crisis
  CRISIS_ACTIVATE: '/crisis/activate',
  CRISIS_DEACTIVATE: '/crisis/deactivate',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_PREFERENCES: '/notifications/preferences',

  // Reports
  REPORTS: '/reports',
  REPORTS_GENERATE: '/reports/generate',

  // User
  USER_PROFILE: '/user/profile',
  USER_PREFERENCES: '/user/preferences',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@nciaflux/auth_token',
  REFRESH_TOKEN: '@nciaflux/refresh_token',
  USER: '@nciaflux/user',
  DISCOVERY_SESSION: '@nciaflux/discovery_session',
  ONBOARDING_COMPLETED: '@nciaflux/onboarding_completed',
  NOTIFICATION_PREFERENCES: '@nciaflux/notification_preferences',
  THEME: '@nciaflux/theme',
} as const;

export const LIMITS = {
  MAX_TASKS_PER_DAY: 10,
  MAX_FOCUS_BLOCK_MINUTES: 90,
  MIN_FOCUS_BLOCK_MINUTES: 5,
  MAX_DAILY_NOTIFICATIONS: 12,
  MAX_CHECK_INS_PER_DAY: 4,
  TASK_TITLE_MAX_LENGTH: 100,
  TASK_DESCRIPTION_MAX_LENGTH: 500,
  CHAT_MESSAGE_MAX_LENGTH: 1000,
} as const;

// Check-in questions and responses
export const CHECK_IN_MOODS = [
  { value: 'great', emoji: '😊', label: 'Ótimo' },
  { value: 'good', emoji: '🙂', label: 'Bem' },
  { value: 'okay', emoji: '😐', label: 'Ok' },
  { value: 'low', emoji: '😔', label: 'Baixo' },
  { value: 'struggling', emoji: '😢', label: 'Difícil' },
] as const;

export const CHECK_IN_PROMPTS = {
  morning: {
    greeting: 'Bom dia! Como você está começando o dia?',
    energy: 'Como está sua energia agora?',
    intention: 'Qual é sua intenção principal para hoje?',
  },
  midday: {
    greeting: 'Como está indo o dia até agora?',
    energy: 'Como está sua energia neste momento?',
    accomplishment: 'O que você já conseguiu fazer?',
  },
  evening: {
    greeting: 'Como foi seu dia?',
    energy: 'Como está sua energia no fim do dia?',
    reflection: 'O que você aprendeu sobre si hoje?',
  },
  on_demand: {
    greeting: 'Como você está se sentindo agora?',
    energy: 'Como está sua energia?',
    support: 'Como posso te ajudar?',
  },
} as const;

export const CHECK_IN_RESPONSES = {
  high_energy: [
    'Que bom saber que sua energia está alta! Aproveite para tarefas mais desafiadoras.',
    'Excelente! Esse é um ótimo momento para focar em algo importante.',
    'Energia alta detectada! Use esse momento a seu favor.',
  ],
  low_energy: [
    'Tudo bem ter dias assim. Que tal começar com algo leve?',
    'Está tudo bem descansar quando precisa. Cuide de você.',
    'Dias de baixa energia fazem parte. Seja gentil consigo.',
  ],
  struggling: [
    'Obrigado por compartilhar. Estou aqui com você.',
    'Reconhecer como se sente é um passo importante. Você não está sozinho.',
    'Dias difíceis acontecem. Quer que eu sugira algo para ajudar?',
  ],
} as const;
