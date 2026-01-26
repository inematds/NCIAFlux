/**
 * Gamification Service
 *
 * ADHD-friendly gamification system:
 * - XP that's never lost
 * - Gentle streaks that pause instead of reset
 * - Achievements that celebrate progress
 * - No punishment mechanics
 */

import { getUserStorageKey } from './profile-manager';
import { supabase, isDemoMode, addXP, updateStreak } from './supabase';

// ============================================
// TYPES
// ============================================

export interface UserGamification {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  xpProgress: number; // 0-100
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  pausedDays: number;
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  totalCheckIns: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'start' | 'consistency' | 'wellbeing' | 'social' | 'mastery';
  icon: string;
  xpReward: number;
  requirement: AchievementRequirement;
  isSecret: boolean;
}

export interface AchievementRequirement {
  type: string;
  value: number;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  celebrated: boolean;
}

export interface XPTransaction {
  id: string;
  amount: number;
  source: string;
  sourceId?: string;
  description?: string;
  createdAt: string;
}

export interface LevelUpResult {
  newLevel: number;
  xpEarned: number;
  leveledUp: boolean;
  newAchievements: Achievement[];
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  pausedDays: number;
  message: string;
  xpBonus: number;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEYS = {
  GAMIFICATION: 'gamification_data',
  ACHIEVEMENTS: 'user_achievements',
  XP_LOG: 'xp_transactions',
};

const XP_PER_LEVEL = 100;

const XP_REWARDS = {
  task_complete_low: 10,
  task_complete_medium: 20,
  task_complete_high: 30,
  checkin: 5,
  routine_complete: 20,
  focus_complete: 15,
  no_crisis_day: 15,
  streak_7_days: 50,
  streak_30_days: 150,
  achievement_unlock: 25,
};

const ACHIEVEMENTS: Achievement[] = [
  // Start category
  {
    id: 'first_task',
    name: 'Primeiro Passo',
    description: 'Completou sua primeira tarefa',
    category: 'start',
    icon: '🎯',
    xpReward: 10,
    requirement: { type: 'tasks_completed', value: 1 },
    isSecret: false,
  },
  {
    id: 'first_checkin',
    name: 'Bom Dia!',
    description: 'Fez seu primeiro check-in',
    category: 'start',
    icon: '☀️',
    xpReward: 10,
    requirement: { type: 'checkins', value: 1 },
    isSecret: false,
  },
  {
    id: 'brain_dumper',
    name: 'Brain Dumper',
    description: 'Usou o brain dump 10 vezes',
    category: 'start',
    icon: '🧠',
    xpReward: 25,
    requirement: { type: 'brain_dumps', value: 10 },
    isSecret: false,
  },
  {
    id: 'discovery_complete',
    name: 'Autoconhecimento',
    description: 'Completou o questionario de descoberta',
    category: 'start',
    icon: '🔮',
    xpReward: 20,
    requirement: { type: 'discovery', value: 1 },
    isSecret: false,
  },

  // Consistency category
  {
    id: 'week_streak',
    name: 'Semana Ativa',
    description: '7 dias com check-in',
    category: 'consistency',
    icon: '🔥',
    xpReward: 50,
    requirement: { type: 'streak', value: 7 },
    isSecret: false,
  },
  {
    id: 'month_streak',
    name: 'Mes Forte',
    description: '30 dias com check-in',
    category: 'consistency',
    icon: '💪',
    xpReward: 150,
    requirement: { type: 'streak', value: 30 },
    isSecret: false,
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: '7 dias seguindo seu cronotipo',
    category: 'consistency',
    icon: '🌅',
    xpReward: 40,
    requirement: { type: 'chronotype_adherence', value: 7 },
    isSecret: false,
  },
  {
    id: 'routine_master',
    name: 'Mestre da Rotina',
    description: 'Completou 50 rotinas',
    category: 'consistency',
    icon: '⚙️',
    xpReward: 75,
    requirement: { type: 'routines_completed', value: 50 },
    isSecret: false,
  },

  // Wellbeing category
  {
    id: 'zen_master',
    name: 'Modo Zen',
    description: 'Saiu do modo crise e se recuperou',
    category: 'wellbeing',
    icon: '🧘',
    xpReward: 30,
    requirement: { type: 'crisis_recovery', value: 1 },
    isSecret: false,
  },
  {
    id: 'stable_week',
    name: 'Semana Estavel',
    description: '7 dias com estabilidade > 70%',
    category: 'wellbeing',
    icon: '⚖️',
    xpReward: 60,
    requirement: { type: 'stability_streak', value: 7 },
    isSecret: false,
  },
  {
    id: 'focus_champion',
    name: 'Campeao do Foco',
    description: 'Completou 100 blocos de foco',
    category: 'wellbeing',
    icon: '🎧',
    xpReward: 100,
    requirement: { type: 'focus_blocks', value: 100 },
    isSecret: false,
  },
  {
    id: 'mood_tracker',
    name: 'Observador',
    description: 'Registrou humor por 14 dias seguidos',
    category: 'wellbeing',
    icon: '📊',
    xpReward: 45,
    requirement: { type: 'mood_tracking', value: 14 },
    isSecret: false,
  },

  // Social category
  {
    id: 'team_player',
    name: 'Jogador de Time',
    description: 'Entrou em um time',
    category: 'social',
    icon: '🤝',
    xpReward: 20,
    requirement: { type: 'team_join', value: 1 },
    isSecret: false,
  },
  {
    id: 'partner_up',
    name: 'Parceiro de Jornada',
    description: 'Conectou-se com um parceiro',
    category: 'social',
    icon: '👥',
    xpReward: 25,
    requirement: { type: 'partnership', value: 1 },
    isSecret: false,
  },
  {
    id: 'community_member',
    name: 'Parte da Comunidade',
    description: 'Entrou em uma comunidade',
    category: 'social',
    icon: '🏘️',
    xpReward: 15,
    requirement: { type: 'community_join', value: 1 },
    isSecret: false,
  },
  {
    id: 'supporter',
    name: 'Apoiador',
    description: 'Enviou 10 mensagens de encorajamento',
    category: 'social',
    icon: '💬',
    xpReward: 35,
    requirement: { type: 'encouragements_sent', value: 10 },
    isSecret: false,
  },

  // Mastery category
  {
    id: 'level_10',
    name: 'Veterano',
    description: 'Alcancou nivel 10',
    category: 'mastery',
    icon: '⭐',
    xpReward: 100,
    requirement: { type: 'level', value: 10 },
    isSecret: false,
  },
  {
    id: 'level_25',
    name: 'Mestre',
    description: 'Alcancou nivel 25',
    category: 'mastery',
    icon: '🌟',
    xpReward: 250,
    requirement: { type: 'level', value: 25 },
    isSecret: false,
  },
  {
    id: 'achievement_hunter',
    name: 'Colecionador',
    description: 'Desbloqueou 15 conquistas',
    category: 'mastery',
    icon: '🏆',
    xpReward: 75,
    requirement: { type: 'achievements', value: 15 },
    isSecret: false,
  },
  {
    id: 'productivity_100',
    name: 'Super Produtivo',
    description: 'Completou 100 tarefas',
    category: 'mastery',
    icon: '💯',
    xpReward: 150,
    requirement: { type: 'tasks_completed', value: 100 },
    isSecret: false,
  },
];

// ============================================
// XP SYSTEM
// ============================================

/**
 * Award XP to user
 */
export async function awardXP(
  source: keyof typeof XP_REWARDS | string,
  sourceId?: string,
  description?: string,
  userId?: string
): Promise<LevelUpResult> {
  const amount = XP_REWARDS[source as keyof typeof XP_REWARDS] || 0;
  const data = getGamificationData();

  const previousLevel = data.currentLevel;
  data.totalXP += amount;
  data.currentLevel = Math.floor(data.totalXP / XP_PER_LEVEL) + 1;

  // Calculate progress to next level
  const xpInCurrentLevel = data.totalXP % XP_PER_LEVEL;
  data.xpProgress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
  data.xpToNextLevel = XP_PER_LEVEL - xpInCurrentLevel;

  saveGamificationData(data);

  // Log transaction
  logXPTransaction(amount, source, sourceId, description);

  // Sync to cloud if available
  if (userId && !isDemoMode && supabase) {
    await addXP(userId, amount, source, sourceId, description);
  }

  // Check for level-based achievements
  const newAchievements = await checkAchievements(userId);

  return {
    newLevel: data.currentLevel,
    xpEarned: amount,
    leveledUp: data.currentLevel > previousLevel,
    newAchievements,
  };
}

/**
 * Get XP needed for a specific level
 */
export function getXPForLevel(level: number): number {
  return (level - 1) * XP_PER_LEVEL;
}

/**
 * Log XP transaction
 */
function logXPTransaction(amount: number, source: string, sourceId?: string, description?: string): void {
  if (typeof window === 'undefined') return;

  const key = getUserStorageKey(STORAGE_KEYS.XP_LOG);
  const data = localStorage.getItem(key);
  const log: XPTransaction[] = data ? JSON.parse(data) : [];

  log.push({
    id: `xp_${Date.now()}`,
    amount,
    source,
    sourceId,
    description,
    createdAt: new Date().toISOString(),
  });

  // Keep only last 100 transactions
  if (log.length > 100) {
    log.splice(0, log.length - 100);
  }

  localStorage.setItem(key, JSON.stringify(log));
}

// ============================================
// STREAK SYSTEM (GENTLE - NO PUNISHMENT)
// ============================================

/**
 * Update streak (call on daily check-in)
 */
export async function updateUserStreak(userId?: string): Promise<StreakResult> {
  const data = getGamificationData();
  const today = new Date().toISOString().split('T')[0];
  const lastActive = data.lastActiveDate;

  let message = '';
  let xpBonus = 0;

  // Already checked in today
  if (lastActive === today) {
    return {
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      pausedDays: data.pausedDays,
      message: 'Ja registrado hoje!',
      xpBonus: 0,
    };
  }

  if (!lastActive) {
    // First ever check-in
    data.currentStreak = 1;
    data.longestStreak = 1;
    data.pausedDays = 0;
    message = 'Primeiro dia! Bem-vindo!';
  } else {
    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day - increase streak
      data.currentStreak++;
      data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
      data.pausedDays = 0;
      message = `Streak de ${data.currentStreak} dias!`;

      // Streak bonuses
      if (data.currentStreak === 7) {
        xpBonus = XP_REWARDS.streak_7_days;
        message += ' Bonus de 7 dias!';
      } else if (data.currentStreak === 30) {
        xpBonus = XP_REWARDS.streak_30_days;
        message += ' Bonus de 30 dias!';
      }
    } else if (daysDiff > 1) {
      // Paused days (GENTLE - doesn't reset, just records pause)
      data.pausedDays += daysDiff - 1;
      message = `Descansou ${daysDiff - 1} dias. Sem problemas!`;
      // Don't reset streak - it's a pause, not a failure
    }
  }

  data.lastActiveDate = today;
  saveGamificationData(data);

  // Award bonus XP if any
  if (xpBonus > 0) {
    await awardXP(`streak_${data.currentStreak}_days` as keyof typeof XP_REWARDS, undefined, message, userId);
  }

  // Sync to cloud
  if (userId && !isDemoMode && supabase) {
    await updateStreak(userId);
  }

  return {
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    pausedDays: data.pausedDays,
    message,
    xpBonus,
  };
}

/**
 * Get streak info without updating
 */
export function getStreakInfo(): {
  current: number;
  longest: number;
  pausedDays: number;
  lastActive: string | null;
} {
  const data = getGamificationData();
  return {
    current: data.currentStreak,
    longest: data.longestStreak,
    pausedDays: data.pausedDays,
    lastActive: data.lastActiveDate,
  };
}

// ============================================
// ACHIEVEMENTS SYSTEM
// ============================================

/**
 * Check and unlock achievements
 */
export async function checkAchievements(userId?: string): Promise<Achievement[]> {
  const userAchievements = getUserAchievements();
  const data = getGamificationData();
  const stats = getUserStats();
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (userAchievements.some((ua) => ua.achievementId === achievement.id)) {
      continue;
    }

    // Check requirement
    let isUnlocked = false;

    switch (achievement.requirement.type) {
      case 'tasks_completed':
        isUnlocked = data.totalTasksCompleted >= achievement.requirement.value;
        break;
      case 'checkins':
        isUnlocked = data.totalCheckIns >= achievement.requirement.value;
        break;
      case 'streak':
        isUnlocked = data.currentStreak >= achievement.requirement.value;
        break;
      case 'level':
        isUnlocked = data.currentLevel >= achievement.requirement.value;
        break;
      case 'focus_blocks':
        isUnlocked = stats.focusBlocks >= achievement.requirement.value;
        break;
      case 'achievements':
        isUnlocked = userAchievements.length >= achievement.requirement.value;
        break;
      case 'routines_completed':
        isUnlocked = stats.routinesCompleted >= achievement.requirement.value;
        break;
      case 'brain_dumps':
        isUnlocked = stats.brainDumps >= achievement.requirement.value;
        break;
      case 'discovery':
        isUnlocked = stats.discoveryCompleted;
        break;
      default:
        // Custom checks would go here
        break;
    }

    if (isUnlocked) {
      unlockAchievement(achievement.id);
      newlyUnlocked.push(achievement);

      // Award achievement XP
      await awardXP('achievement_unlock', achievement.id, achievement.name, userId);
    }
  }

  return newlyUnlocked;
}

/**
 * Unlock an achievement
 */
function unlockAchievement(achievementId: string): void {
  const achievements = getUserAchievements();

  if (achievements.some((a) => a.achievementId === achievementId)) {
    return; // Already unlocked
  }

  achievements.push({
    achievementId,
    unlockedAt: new Date().toISOString(),
    celebrated: false,
  });

  saveUserAchievements(achievements);
}

/**
 * Mark achievement as celebrated (seen by user)
 */
export function celebrateAchievement(achievementId: string): void {
  const achievements = getUserAchievements();
  const achievement = achievements.find((a) => a.achievementId === achievementId);

  if (achievement) {
    achievement.celebrated = true;
    saveUserAchievements(achievements);
  }
}

/**
 * Get uncelebrated achievements
 */
export function getUncelebratedAchievements(): Achievement[] {
  const userAchievements = getUserAchievements();
  const uncelebrated = userAchievements.filter((ua) => !ua.celebrated);

  return uncelebrated
    .map((ua) => ACHIEVEMENTS.find((a) => a.id === ua.achievementId))
    .filter((a): a is Achievement => a !== undefined);
}

/**
 * Get all achievements with unlock status
 */
export function getAllAchievementsWithStatus(): (Achievement & { unlocked: boolean; unlockedAt?: string })[] {
  const userAchievements = getUserAchievements();

  return ACHIEVEMENTS.map((achievement) => {
    const userAchievement = userAchievements.find((ua) => ua.achievementId === achievement.id);
    return {
      ...achievement,
      unlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlockedAt,
    };
  });
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

// ============================================
// STATS TRACKING
// ============================================

/**
 * Increment task completed counter
 */
export function incrementTasksCompleted(): void {
  const data = getGamificationData();
  data.totalTasksCompleted++;
  saveGamificationData(data);
}

/**
 * Increment focus minutes
 */
export function incrementFocusMinutes(minutes: number): void {
  const data = getGamificationData();
  data.totalFocusMinutes += minutes;
  saveGamificationData(data);
}

/**
 * Increment check-ins
 */
export function incrementCheckIns(): void {
  const data = getGamificationData();
  data.totalCheckIns++;
  saveGamificationData(data);
}

/**
 * Get user stats for achievement checking
 */
function getUserStats(): {
  focusBlocks: number;
  routinesCompleted: number;
  brainDumps: number;
  discoveryCompleted: boolean;
} {
  // This would read from various localStorage keys
  const focusKey = getUserStorageKey('nciaflux_focus_stats');
  const routineKey = getUserStorageKey('nciaflux_routines_completed');
  const brainDumpKey = getUserStorageKey('nciaflux_brain_dump');
  const discoveryKey = getUserStorageKey('nciaflux_discovery_answers');

  const focusData = typeof window !== 'undefined' ? localStorage.getItem(focusKey) : null;
  const routineData = typeof window !== 'undefined' ? localStorage.getItem(routineKey) : null;
  const brainDumpData = typeof window !== 'undefined' ? localStorage.getItem(brainDumpKey) : null;
  const discoveryData = typeof window !== 'undefined' ? localStorage.getItem(discoveryKey) : null;

  return {
    focusBlocks: focusData ? JSON.parse(focusData).totalBlocks || 0 : 0,
    routinesCompleted: routineData ? JSON.parse(routineData).count || 0 : 0,
    brainDumps: brainDumpData ? (JSON.parse(brainDumpData).items?.length || 0) : 0,
    discoveryCompleted: !!discoveryData,
  };
}

// ============================================
// STORAGE HELPERS
// ============================================

/**
 * Get gamification data
 */
export function getGamificationData(): UserGamification {
  if (typeof window === 'undefined') return getDefaultGamification();

  const key = getUserStorageKey(STORAGE_KEYS.GAMIFICATION);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : getDefaultGamification();
}

/**
 * Save gamification data
 */
function saveGamificationData(data: UserGamification): void {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(STORAGE_KEYS.GAMIFICATION);
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Get default gamification data
 */
function getDefaultGamification(): UserGamification {
  return {
    totalXP: 0,
    currentLevel: 1,
    xpToNextLevel: XP_PER_LEVEL,
    xpProgress: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    pausedDays: 0,
    totalTasksCompleted: 0,
    totalFocusMinutes: 0,
    totalCheckIns: 0,
  };
}

/**
 * Get user achievements
 */
function getUserAchievements(): UserAchievement[] {
  if (typeof window === 'undefined') return [];
  const key = getUserStorageKey(STORAGE_KEYS.ACHIEVEMENTS);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * Save user achievements
 */
function saveUserAchievements(achievements: UserAchievement[]): void {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(STORAGE_KEYS.ACHIEVEMENTS);
  localStorage.setItem(key, JSON.stringify(achievements));
}

/**
 * Get recent XP transactions
 */
export function getRecentXPTransactions(limit: number = 10): XPTransaction[] {
  if (typeof window === 'undefined') return [];
  const key = getUserStorageKey(STORAGE_KEYS.XP_LOG);
  const data = localStorage.getItem(key);
  const transactions: XPTransaction[] = data ? JSON.parse(data) : [];
  return transactions.slice(-limit).reverse();
}
