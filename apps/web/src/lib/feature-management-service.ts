/**
 * Feature Management Service
 *
 * Allows managers to enable/disable features for:
 * - Their own profile
 * - Teams they manage
 *
 * When changes are made, triggers navigation to dashboard with refresh
 */

import { getUserStorageKey } from './profile-manager';

// ============================================
// TYPES
// ============================================

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'social' | 'wellbeing' | 'advanced';
  icon: string;
  defaultEnabled: boolean;
  requiresLevel?: number;
  requiresPlan?: 'free' | 'plus' | 'team';
}

export interface UserFeatureSettings {
  userId: string;
  features: Record<string, boolean>;
  updatedAt: string;
}

export interface TeamFeatureSettings {
  teamId: string;
  teamName: string;
  features: Record<string, boolean>;
  updatedAt: string;
}

export interface FeatureChangeEvent {
  type: 'user' | 'team';
  targetId: string;
  featureId: string;
  enabled: boolean;
  timestamp: string;
}

// ============================================
// FEATURE DEFINITIONS
// ============================================

export const ALL_FEATURES: FeatureDefinition[] = [
  // Productivity
  {
    id: 'brain_dump',
    name: 'Brain Dump',
    description: 'Captura rápida de pensamentos e ideias',
    category: 'productivity',
    icon: '🧠',
    defaultEnabled: true,
  },
  {
    id: 'tasks',
    name: 'Tarefas',
    description: 'Gerenciamento de tarefas com prioridades',
    category: 'productivity',
    icon: '✅',
    defaultEnabled: true,
  },
  {
    id: 'planner',
    name: 'Planejador Diário',
    description: 'Planeje seu dia com blocos de tempo',
    category: 'productivity',
    icon: '📅',
    defaultEnabled: true,
  },
  {
    id: 'routines',
    name: 'Rotinas',
    description: 'Crie e acompanhe rotinas matinais/noturnas',
    category: 'productivity',
    icon: '🔄',
    defaultEnabled: true,
  },
  {
    id: 'projects',
    name: 'Projetos',
    description: 'Organize tarefas em projetos',
    category: 'productivity',
    icon: '📁',
    defaultEnabled: true,
  },
  {
    id: 'focus_timer',
    name: 'Timer de Foco',
    description: 'Sessões Pomodoro adaptativas',
    category: 'productivity',
    icon: '🎯',
    defaultEnabled: true,
  },
  {
    id: 'notes',
    name: 'Notas',
    description: 'Notas rápidas e organizadas',
    category: 'productivity',
    icon: '📓',
    defaultEnabled: true,
  },
  {
    id: 'calendar',
    name: 'Calendário',
    description: 'Visualização de agenda',
    category: 'productivity',
    icon: '📆',
    defaultEnabled: true,
  },

  // Wellbeing
  {
    id: 'checkin',
    name: 'Check-in Diário',
    description: 'Registro de energia e humor',
    category: 'wellbeing',
    icon: '😊',
    defaultEnabled: true,
  },
  {
    id: 'crisis_mode',
    name: 'Modo Crise',
    description: 'Suporte em momentos difíceis',
    category: 'wellbeing',
    icon: '🆘',
    defaultEnabled: true,
  },
  {
    id: 'gamification',
    name: 'Gamificação',
    description: 'XP, níveis e conquistas',
    category: 'wellbeing',
    icon: '🎮',
    defaultEnabled: true,
  },
  {
    id: 'adaptive',
    name: 'Sistema Adaptativo',
    description: 'Análise de padrões e sugestões',
    category: 'wellbeing',
    icon: '🔮',
    defaultEnabled: true,
  },
  {
    id: 'chronotype',
    name: 'Cronotipo',
    description: 'Descubra seu perfil de energia',
    category: 'wellbeing',
    icon: '🧬',
    defaultEnabled: true,
  },
  {
    id: 'review',
    name: 'Revisão Semanal',
    description: 'Reflexão sobre a semana',
    category: 'wellbeing',
    icon: '📊',
    defaultEnabled: true,
  },
  {
    id: 'reports',
    name: 'Relatórios',
    description: 'Análise de produtividade',
    category: 'wellbeing',
    icon: '📈',
    defaultEnabled: true,
  },

  // Social
  {
    id: 'partnerships',
    name: 'Parcerias',
    description: 'Parceiros de responsabilidade 1:1',
    category: 'social',
    icon: '🤝',
    defaultEnabled: true,
  },
  {
    id: 'communities',
    name: 'Comunidades',
    description: 'Grupos de apoio e discussão',
    category: 'social',
    icon: '👪',
    defaultEnabled: true,
  },
  {
    id: 'chat',
    name: 'Chat',
    description: 'Mensagens diretas e em grupo',
    category: 'social',
    icon: '💬',
    defaultEnabled: true,
  },

  // Advanced
  {
    id: 'teams',
    name: 'Times',
    description: 'Gestão de equipes',
    category: 'advanced',
    icon: '👥',
    defaultEnabled: true,
    requiresPlan: 'team',
  },
  {
    id: 'team_challenges',
    name: 'Desafios de Time',
    description: 'Desafios colaborativos',
    category: 'advanced',
    icon: '🏆',
    defaultEnabled: true,
    requiresPlan: 'team',
  },
  {
    id: 'team_reports',
    name: 'Relatórios de Time',
    description: 'Métricas agregadas do time',
    category: 'advanced',
    icon: '📋',
    defaultEnabled: true,
    requiresPlan: 'team',
  },
  {
    id: 'ai_chat',
    name: 'Assistente IA',
    description: 'Chat inteligente com IA',
    category: 'advanced',
    icon: '🤖',
    defaultEnabled: true,
    requiresPlan: 'plus',
  },
  {
    id: 'integrations',
    name: 'Integrações',
    description: 'Google Calendar, etc',
    category: 'advanced',
    icon: '🔗',
    defaultEnabled: false,
    requiresPlan: 'plus',
  },
];

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  USER_FEATURES: 'neurofluxo_user_features',
  TEAM_FEATURES: 'neurofluxo_team_features',
  CHANGE_LOG: 'neurofluxo_feature_changes',
};

// ============================================
// USER FEATURE MANAGEMENT
// ============================================

/**
 * Get user's feature settings
 */
export function getUserFeatureSettings(): UserFeatureSettings {
  if (typeof window === 'undefined') {
    return { userId: '', features: getDefaultFeatures(), updatedAt: new Date().toISOString() };
  }

  const key = getUserStorageKey(STORAGE_KEYS.USER_FEATURES);
  const stored = localStorage.getItem(key);

  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with defaults
  const defaults: UserFeatureSettings = {
    userId: getUserStorageKey('user'),
    features: getDefaultFeatures(),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
}

/**
 * Update a single user feature
 */
export function setUserFeature(featureId: string, enabled: boolean): void {
  const settings = getUserFeatureSettings();
  settings.features[featureId] = enabled;
  settings.updatedAt = new Date().toISOString();

  const key = getUserStorageKey(STORAGE_KEYS.USER_FEATURES);
  localStorage.setItem(key, JSON.stringify(settings));

  // Log the change
  logFeatureChange('user', settings.userId, featureId, enabled);
}

/**
 * Update multiple user features
 */
export function setUserFeatures(features: Record<string, boolean>): void {
  const settings = getUserFeatureSettings();
  settings.features = { ...settings.features, ...features };
  settings.updatedAt = new Date().toISOString();

  const key = getUserStorageKey(STORAGE_KEYS.USER_FEATURES);
  localStorage.setItem(key, JSON.stringify(settings));

  // Log changes
  Object.entries(features).forEach(([featureId, enabled]) => {
    logFeatureChange('user', settings.userId, featureId, enabled);
  });
}

/**
 * Check if a feature is enabled for user
 */
export function isFeatureEnabled(featureId: string): boolean {
  const settings = getUserFeatureSettings();
  return settings.features[featureId] ?? true;
}

// ============================================
// TEAM FEATURE MANAGEMENT
// ============================================

/**
 * Get all team feature settings for teams user manages
 */
export function getManagedTeamsFeatures(): TeamFeatureSettings[] {
  if (typeof window === 'undefined') return [];

  const key = getUserStorageKey(STORAGE_KEYS.TEAM_FEATURES);
  const stored = localStorage.getItem(key);

  if (stored) {
    return JSON.parse(stored);
  }

  return [];
}

/**
 * Get feature settings for a specific team
 */
export function getTeamFeatureSettings(teamId: string): TeamFeatureSettings | null {
  const allTeams = getManagedTeamsFeatures();
  return allTeams.find((t) => t.teamId === teamId) || null;
}

/**
 * Initialize team feature settings
 */
export function initializeTeamFeatures(teamId: string, teamName: string): TeamFeatureSettings {
  const allTeams = getManagedTeamsFeatures();
  const existing = allTeams.find((t) => t.teamId === teamId);

  if (existing) return existing;

  const newTeamSettings: TeamFeatureSettings = {
    teamId,
    teamName,
    features: getDefaultFeatures(),
    updatedAt: new Date().toISOString(),
  };

  allTeams.push(newTeamSettings);
  const key = getUserStorageKey(STORAGE_KEYS.TEAM_FEATURES);
  localStorage.setItem(key, JSON.stringify(allTeams));

  return newTeamSettings;
}

/**
 * Update a single team feature
 */
export function setTeamFeature(teamId: string, featureId: string, enabled: boolean): void {
  const allTeams = getManagedTeamsFeatures();
  const teamIndex = allTeams.findIndex((t) => t.teamId === teamId);

  if (teamIndex === -1) return;

  allTeams[teamIndex].features[featureId] = enabled;
  allTeams[teamIndex].updatedAt = new Date().toISOString();

  const key = getUserStorageKey(STORAGE_KEYS.TEAM_FEATURES);
  localStorage.setItem(key, JSON.stringify(allTeams));

  // Log the change
  logFeatureChange('team', teamId, featureId, enabled);
}

/**
 * Update multiple team features
 */
export function setTeamFeatures(teamId: string, features: Record<string, boolean>): void {
  const allTeams = getManagedTeamsFeatures();
  const teamIndex = allTeams.findIndex((t) => t.teamId === teamId);

  if (teamIndex === -1) return;

  allTeams[teamIndex].features = { ...allTeams[teamIndex].features, ...features };
  allTeams[teamIndex].updatedAt = new Date().toISOString();

  const key = getUserStorageKey(STORAGE_KEYS.TEAM_FEATURES);
  localStorage.setItem(key, JSON.stringify(allTeams));

  // Log changes
  Object.entries(features).forEach(([featureId, enabled]) => {
    logFeatureChange('team', teamId, featureId, enabled);
  });
}

/**
 * Check if a feature is enabled for a team
 */
export function isTeamFeatureEnabled(teamId: string, featureId: string): boolean {
  const settings = getTeamFeatureSettings(teamId);
  return settings?.features[featureId] ?? true;
}

// ============================================
// HELPERS
// ============================================

/**
 * Get default feature states
 */
function getDefaultFeatures(): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  ALL_FEATURES.forEach((f) => {
    defaults[f.id] = f.defaultEnabled;
  });
  return defaults;
}

/**
 * Log feature change for audit
 */
function logFeatureChange(type: 'user' | 'team', targetId: string, featureId: string, enabled: boolean): void {
  if (typeof window === 'undefined') return;

  const key = getUserStorageKey(STORAGE_KEYS.CHANGE_LOG);
  const stored = localStorage.getItem(key);
  const log: FeatureChangeEvent[] = stored ? JSON.parse(stored) : [];

  log.push({
    type,
    targetId,
    featureId,
    enabled,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 100 changes
  if (log.length > 100) {
    log.splice(0, log.length - 100);
  }

  localStorage.setItem(key, JSON.stringify(log));
}

/**
 * Get recent feature changes
 */
export function getRecentFeatureChanges(limit: number = 20): FeatureChangeEvent[] {
  if (typeof window === 'undefined') return [];

  const key = getUserStorageKey(STORAGE_KEYS.CHANGE_LOG);
  const stored = localStorage.getItem(key);
  const log: FeatureChangeEvent[] = stored ? JSON.parse(stored) : [];

  return log.slice(-limit).reverse();
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: FeatureDefinition['category']): FeatureDefinition[] {
  return ALL_FEATURES.filter((f) => f.category === category);
}

/**
 * Reset user features to defaults
 */
export function resetUserFeaturesToDefaults(): void {
  const settings: UserFeatureSettings = {
    userId: getUserStorageKey('user'),
    features: getDefaultFeatures(),
    updatedAt: new Date().toISOString(),
  };

  const key = getUserStorageKey(STORAGE_KEYS.USER_FEATURES);
  localStorage.setItem(key, JSON.stringify(settings));
}

/**
 * Reset team features to defaults
 */
export function resetTeamFeaturesToDefaults(teamId: string): void {
  const allTeams = getManagedTeamsFeatures();
  const teamIndex = allTeams.findIndex((t) => t.teamId === teamId);

  if (teamIndex === -1) return;

  allTeams[teamIndex].features = getDefaultFeatures();
  allTeams[teamIndex].updatedAt = new Date().toISOString();

  const key = getUserStorageKey(STORAGE_KEYS.TEAM_FEATURES);
  localStorage.setItem(key, JSON.stringify(allTeams));
}

/**
 * Get enabled features count
 */
export function getEnabledFeaturesCount(features: Record<string, boolean>): { enabled: number; total: number } {
  const enabled = Object.values(features).filter(Boolean).length;
  return { enabled, total: ALL_FEATURES.length };
}
