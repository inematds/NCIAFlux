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
    features: ['Descoberta completa', 'Perfil cognitivo', 'Compartilhamento de resultado'],
  },
  basic: {
    id: 'basic',
    name: 'Básico',
    price: 19.9,
    features: [
      'Tudo do Gratuito',
      'Plano personalizado',
      'Chat de acompanhamento',
      'Notificações básicas',
      'Widgets 1-toque',
      'Modo crise',
    ],
  },
  advanced: {
    id: 'advanced',
    name: 'Avançado',
    price: 39.9,
    features: [
      'Tudo do Básico',
      'Chat por voz',
      'Biblioteca de relatórios',
      'Conteúdo educativo',
      'Comunidade',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Profissional',
    price: 59.9,
    features: [
      'Tudo do Avançado',
      'Vinculação com terapeuta/coach',
      'Relatórios para profissional',
      'Acompanhamento supervisionado',
    ],
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
