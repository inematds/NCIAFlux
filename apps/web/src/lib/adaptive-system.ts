/**
 * Adaptive System Service
 *
 * The core "brain" of NeuroFluxo that:
 * 1. Collects usage patterns
 * 2. Calculates stability scores
 * 3. Makes UI adaptations
 * 4. Manages progressive feature unlocking
 *
 * Philosophy: "The app configures itself to the user, not the other way around"
 */

import { getUserStorageKey } from './profile-manager';
import { supabase, isDemoMode } from './supabase';

// ============================================
// TYPES
// ============================================

export interface DailyPattern {
  date: string;
  appOpens: number;
  activeMinutes: number;
  hourlyActivity: Record<number, number>;
  tasksCreated: number;
  tasksCompleted: number;
  tasksSkipped: number;
  completionRate: number;
  avgEnergy: number | null;
  avgMood: number | null;
  moodVariance: number;
  focusSessions: number;
  focusMinutes: number;
  focusCompletionRate: number;
  crisisModeCount: number;
  crisisTotalMinutes: number;
  stabilityScore: number;
  productivityScore: number;
}

export interface AdaptiveSettings {
  // Chronotype
  chronotype: 'morning' | 'neutral' | 'evening';
  wakeTime: string;
  sleepTime: string;
  peakHours: number[];
  // Focus
  preferredFocusDuration: number;
  preferredTechnique: 'pomodoro' | 'deep_work' | 'timeboxing' | 'free_flow';
  // Triggers
  distractionTriggers: string[];
  copingStrategies: string[];
  // UI
  featureLevel: number;
  featureOverrides: Record<string, boolean>;
  // Gamification
  gamificationEnabled: boolean;
  showXP: boolean;
  showStreaks: boolean;
  // Calculated
  lastCalculatedAt: string | null;
}

export interface AdaptationSuggestion {
  type: string;
  reason: string;
  oldValue: unknown;
  newValue: unknown;
  confidence: number;
}

export interface StabilityComponents {
  checkInConsistency: number;
  moodStability: number;
  taskCompletion: number;
  crisisFrequency: number;
  routineAdherence: number;
  total: number;
}

export interface FeatureAccess {
  featureId: string;
  isUnlocked: boolean;
  requiredLevel: number;
  requiredStability?: number;
  requiredPlan?: string;
  canOverride: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEYS = {
  PATTERNS: 'adaptive_patterns',
  SETTINGS: 'adaptive_settings',
  ADAPTATIONS: 'adaptive_adaptations',
};

const STABILITY_WEIGHTS = {
  checkInConsistency: 0.25,
  moodStability: 0.20,
  taskCompletion: 0.20,
  crisisFrequency: 0.20,
  routineAdherence: 0.15,
};

const FEATURE_LEVELS: Record<string, { requiredLevel: number; requiredStability?: number; requiredPlan?: string }> = {
  // Level 1: Basics (always available)
  brain_dump: { requiredLevel: 1 },
  basic_tasks: { requiredLevel: 1 },
  crisis_mode: { requiredLevel: 1 },
  ai_chat: { requiredLevel: 1 },

  // Level 2: After profile completion
  planner: { requiredLevel: 2 },
  routines: { requiredLevel: 2 },
  projects: { requiredLevel: 2 },
  focus_mode: { requiredLevel: 2 },

  // Level 3: Stability > 50%
  all_tasks: { requiredLevel: 3, requiredStability: 50 },
  reports: { requiredLevel: 3, requiredStability: 50 },
  weekly_review: { requiredLevel: 3, requiredStability: 50 },
  calendar: { requiredLevel: 3, requiredStability: 50 },

  // Level 4: Stability > 70% + Plus plan
  multi_device: { requiredLevel: 4, requiredStability: 70, requiredPlan: 'plus' },
  chat_1to1: { requiredLevel: 4, requiredStability: 70, requiredPlan: 'plus' },
  communities: { requiredLevel: 4, requiredStability: 70, requiredPlan: 'plus' },

  // Level 5: Full access (therapist/manager override)
  team_management: { requiredLevel: 5 },
  advanced_reports: { requiredLevel: 5 },
};

const XP_REWARDS = {
  task_complete_low: 10,
  task_complete_medium: 20,
  task_complete_high: 30,
  checkin: 5,
  routine_complete: 20,
  no_crisis_day: 15,
  streak_7_days: 50,
  streak_30_days: 150,
};

// ============================================
// PATTERN COLLECTION
// ============================================

/**
 * Record app open event
 */
export function recordAppOpen(): void {
  const today = getTodayPattern();
  today.appOpens++;
  saveTodayPattern(today);
}

/**
 * Record active time (call periodically while app is in foreground)
 */
export function recordActiveTime(minutes: number): void {
  const today = getTodayPattern();
  today.activeMinutes += minutes;

  // Track hourly activity
  const hour = new Date().getHours();
  today.hourlyActivity[hour] = (today.hourlyActivity[hour] || 0) + minutes;

  saveTodayPattern(today);
}

/**
 * Record task event
 */
export function recordTaskEvent(eventType: 'created' | 'completed' | 'skipped'): void {
  const today = getTodayPattern();

  switch (eventType) {
    case 'created':
      today.tasksCreated++;
      break;
    case 'completed':
      today.tasksCompleted++;
      break;
    case 'skipped':
      today.tasksSkipped++;
      break;
  }

  // Update completion rate
  const total = today.tasksCompleted + today.tasksSkipped;
  today.completionRate = total > 0 ? (today.tasksCompleted / total) * 100 : 0;

  saveTodayPattern(today);
}

/**
 * Record check-in data
 */
export function recordCheckIn(energy: number, mood: number): void {
  const today = getTodayPattern();

  // Calculate running average
  const prevAvgEnergy = today.avgEnergy || energy;
  const prevAvgMood = today.avgMood || mood;

  // Simple moving average
  today.avgEnergy = (prevAvgEnergy + energy) / 2;
  today.avgMood = (prevAvgMood + mood) / 2;

  // Calculate mood variance
  today.moodVariance = Math.abs(mood - prevAvgMood);

  saveTodayPattern(today);
}

/**
 * Record focus session
 */
export function recordFocusSession(durationMinutes: number, completed: boolean): void {
  const today = getTodayPattern();

  today.focusSessions++;
  today.focusMinutes += durationMinutes;

  const completedSessions = completed
    ? (today.focusCompletionRate * (today.focusSessions - 1) + 100) / today.focusSessions
    : (today.focusCompletionRate * (today.focusSessions - 1)) / today.focusSessions;

  today.focusCompletionRate = completedSessions;

  saveTodayPattern(today);
}

/**
 * Record crisis mode event
 */
export function recordCrisisMode(durationMinutes: number): void {
  const today = getTodayPattern();
  today.crisisModeCount++;
  today.crisisTotalMinutes += durationMinutes;
  saveTodayPattern(today);
}

// ============================================
// STABILITY CALCULATION
// ============================================

/**
 * Calculate stability score (0-100)
 */
export function calculateStabilityScore(days: number = 7): StabilityComponents {
  const patterns = getPatterns(days);

  if (patterns.length === 0) {
    return {
      checkInConsistency: 50,
      moodStability: 50,
      taskCompletion: 50,
      crisisFrequency: 50,
      routineAdherence: 50,
      total: 50,
    };
  }

  // Check-in consistency: % of days with check-ins
  const daysWithCheckIn = patterns.filter((p) => p.avgEnergy !== null).length;
  const checkInConsistency = (daysWithCheckIn / patterns.length) * 100;

  // Mood stability: inverse of average variance
  const avgMoodVariance = patterns.reduce((sum, p) => sum + p.moodVariance, 0) / patterns.length;
  const moodStability = Math.max(0, 100 - avgMoodVariance * 20);

  // Task completion rate
  const avgCompletionRate = patterns.reduce((sum, p) => sum + p.completionRate, 0) / patterns.length;
  const taskCompletion = avgCompletionRate;

  // Crisis frequency: fewer crises = higher score
  const totalCrises = patterns.reduce((sum, p) => sum + p.crisisModeCount, 0);
  const crisisFrequency = Math.max(0, 100 - totalCrises * 15);

  // Routine/focus adherence
  const avgFocusCompletion = patterns.reduce((sum, p) => sum + p.focusCompletionRate, 0) / patterns.length;
  const routineAdherence = avgFocusCompletion;

  // Weighted total
  const total =
    checkInConsistency * STABILITY_WEIGHTS.checkInConsistency +
    moodStability * STABILITY_WEIGHTS.moodStability +
    taskCompletion * STABILITY_WEIGHTS.taskCompletion +
    crisisFrequency * STABILITY_WEIGHTS.crisisFrequency +
    routineAdherence * STABILITY_WEIGHTS.routineAdherence;

  return {
    checkInConsistency,
    moodStability,
    taskCompletion,
    crisisFrequency,
    routineAdherence,
    total: Math.round(total * 100) / 100,
  };
}

// ============================================
// ADAPTATION ENGINE
// ============================================

/**
 * Analyze patterns and suggest adaptations
 */
export function analyzeAndAdapt(): AdaptationSuggestion[] {
  const patterns = getPatterns(14); // 2 weeks of data
  const settings = getAdaptiveSettings();
  const suggestions: AdaptationSuggestion[] = [];

  if (patterns.length < 7) {
    return []; // Not enough data
  }

  // Detect chronotype from activity patterns
  const detectedChronotype = detectChronotype(patterns);
  if (detectedChronotype !== settings.chronotype) {
    suggestions.push({
      type: 'chronotype',
      reason: `Detectamos que voce e mais ativo no periodo da ${translateChronotype(detectedChronotype)}`,
      oldValue: settings.chronotype,
      newValue: detectedChronotype,
      confidence: 0.75,
    });
  }

  // Detect optimal focus duration
  const avgFocusDuration = patterns.reduce((sum, p) => sum + (p.focusMinutes / Math.max(1, p.focusSessions)), 0) / patterns.length;
  const optimalDuration = Math.round(avgFocusDuration / 5) * 5; // Round to nearest 5

  if (Math.abs(optimalDuration - settings.preferredFocusDuration) > 10) {
    suggestions.push({
      type: 'focus_duration',
      reason: `Seus melhores resultados acontecem com sessoes de ${optimalDuration} minutos`,
      oldValue: settings.preferredFocusDuration,
      newValue: optimalDuration,
      confidence: 0.7,
    });
  }

  // Detect peak hours
  const peakHours = detectPeakHours(patterns);
  if (JSON.stringify(peakHours) !== JSON.stringify(settings.peakHours)) {
    suggestions.push({
      type: 'peak_hours',
      reason: `Voce e mais produtivo entre ${peakHours[0]}h e ${peakHours[peakHours.length - 1]}h`,
      oldValue: settings.peakHours,
      newValue: peakHours,
      confidence: 0.8,
    });
  }

  return suggestions;
}

/**
 * Apply an adaptation suggestion
 */
export function applyAdaptation(suggestion: AdaptationSuggestion): void {
  const settings = getAdaptiveSettings();

  switch (suggestion.type) {
    case 'chronotype':
      settings.chronotype = suggestion.newValue as 'morning' | 'neutral' | 'evening';
      break;
    case 'focus_duration':
      settings.preferredFocusDuration = suggestion.newValue as number;
      break;
    case 'peak_hours':
      settings.peakHours = suggestion.newValue as number[];
      break;
  }

  settings.lastCalculatedAt = new Date().toISOString();
  saveAdaptiveSettings(settings);

  // Log adaptation
  logAdaptation(suggestion);
}

/**
 * Detect chronotype from activity patterns
 */
function detectChronotype(patterns: DailyPattern[]): 'morning' | 'neutral' | 'evening' {
  const hourlyTotals: Record<number, number> = {};

  for (const pattern of patterns) {
    for (const [hour, minutes] of Object.entries(pattern.hourlyActivity)) {
      hourlyTotals[parseInt(hour)] = (hourlyTotals[parseInt(hour)] || 0) + minutes;
    }
  }

  // Find peak activity time
  let maxActivity = 0;
  let peakHour = 12;

  for (const [hour, minutes] of Object.entries(hourlyTotals)) {
    if (minutes > maxActivity) {
      maxActivity = minutes;
      peakHour = parseInt(hour);
    }
  }

  if (peakHour < 10) return 'morning';
  if (peakHour > 17) return 'evening';
  return 'neutral';
}

/**
 * Detect peak productivity hours
 */
function detectPeakHours(patterns: DailyPattern[]): number[] {
  const hourlyProductivity: Record<number, number> = {};

  for (const pattern of patterns) {
    for (const [hour, minutes] of Object.entries(pattern.hourlyActivity)) {
      hourlyProductivity[parseInt(hour)] = (hourlyProductivity[parseInt(hour)] || 0) + minutes;
    }
  }

  // Sort hours by productivity
  const sortedHours = Object.entries(hourlyProductivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4) // Top 4 hours
    .map(([hour]) => parseInt(hour))
    .sort((a, b) => a - b);

  return sortedHours;
}

/**
 * Translate chronotype to Portuguese
 */
function translateChronotype(type: 'morning' | 'neutral' | 'evening'): string {
  const translations = {
    morning: 'manha',
    neutral: 'tarde',
    evening: 'noite',
  };
  return translations[type];
}

// ============================================
// FEATURE UNLOCKING
// ============================================

/**
 * Check if a feature is unlocked for user
 */
export function isFeatureUnlocked(
  featureId: string,
  userLevel: number,
  stabilityScore: number,
  userPlan: string
): FeatureAccess {
  const feature = FEATURE_LEVELS[featureId];

  if (!feature) {
    return {
      featureId,
      isUnlocked: true,
      requiredLevel: 1,
      canOverride: false,
    };
  }

  const settings = getAdaptiveSettings();
  const hasOverride = settings.featureOverrides[featureId];

  if (hasOverride !== undefined) {
    return {
      featureId,
      isUnlocked: hasOverride,
      requiredLevel: feature.requiredLevel,
      requiredStability: feature.requiredStability,
      requiredPlan: feature.requiredPlan,
      canOverride: true,
    };
  }

  const meetsLevel = userLevel >= feature.requiredLevel;
  const meetsStability = !feature.requiredStability || stabilityScore >= feature.requiredStability;
  const meetsPlan = !feature.requiredPlan || userPlan === feature.requiredPlan || userPlan === 'professional';

  return {
    featureId,
    isUnlocked: meetsLevel && meetsStability && meetsPlan,
    requiredLevel: feature.requiredLevel,
    requiredStability: feature.requiredStability,
    requiredPlan: feature.requiredPlan,
    canOverride: true,
  };
}

/**
 * Get all features with their unlock status
 */
export function getAllFeatureAccess(
  userLevel: number,
  stabilityScore: number,
  userPlan: string
): FeatureAccess[] {
  return Object.keys(FEATURE_LEVELS).map((featureId) =>
    isFeatureUnlocked(featureId, userLevel, stabilityScore, userPlan)
  );
}

/**
 * Override feature access (manager/therapist/manual)
 */
export function setFeatureOverride(featureId: string, enabled: boolean): void {
  const settings = getAdaptiveSettings();
  settings.featureOverrides[featureId] = enabled;
  saveAdaptiveSettings(settings);
}

/**
 * Clear feature override (revert to automatic)
 */
export function clearFeatureOverride(featureId: string): void {
  const settings = getAdaptiveSettings();
  delete settings.featureOverrides[featureId];
  saveAdaptiveSettings(settings);
}

// ============================================
// XP CALCULATION
// ============================================

/**
 * Calculate XP for task completion
 */
export function calculateTaskXP(priority: 'high' | 'medium' | 'low'): number {
  const mapping = {
    high: XP_REWARDS.task_complete_high,
    medium: XP_REWARDS.task_complete_medium,
    low: XP_REWARDS.task_complete_low,
  };
  return mapping[priority];
}

/**
 * Get daily XP summary
 */
export function getDailyXPSummary(): { earned: number; sources: Record<string, number> } {
  const today = getTodayPattern();

  const sources: Record<string, number> = {};

  // Tasks
  sources.tasks = today.tasksCompleted * XP_REWARDS.task_complete_medium;

  // Check-ins
  sources.checkins = today.avgEnergy !== null ? XP_REWARDS.checkin : 0;

  // Focus
  sources.focus = today.focusSessions * 5;

  // No crisis bonus
  sources.stability = today.crisisModeCount === 0 ? XP_REWARDS.no_crisis_day : 0;

  const earned = Object.values(sources).reduce((sum, xp) => sum + xp, 0);

  return { earned, sources };
}

// ============================================
// STORAGE HELPERS
// ============================================

/**
 * Get today's pattern (create if not exists)
 */
function getTodayPattern(): DailyPattern {
  const today = new Date().toISOString().split('T')[0];
  const patterns = getAllPatterns();
  const existing = patterns.find((p) => p.date === today);

  if (existing) return existing;

  const newPattern: DailyPattern = {
    date: today,
    appOpens: 0,
    activeMinutes: 0,
    hourlyActivity: {},
    tasksCreated: 0,
    tasksCompleted: 0,
    tasksSkipped: 0,
    completionRate: 0,
    avgEnergy: null,
    avgMood: null,
    moodVariance: 0,
    focusSessions: 0,
    focusMinutes: 0,
    focusCompletionRate: 0,
    crisisModeCount: 0,
    crisisTotalMinutes: 0,
    stabilityScore: 0,
    productivityScore: 0,
  };

  patterns.push(newPattern);
  saveAllPatterns(patterns);

  return newPattern;
}

/**
 * Save today's pattern
 */
function saveTodayPattern(pattern: DailyPattern): void {
  const patterns = getAllPatterns();
  const index = patterns.findIndex((p) => p.date === pattern.date);

  if (index >= 0) {
    patterns[index] = pattern;
  } else {
    patterns.push(pattern);
  }

  saveAllPatterns(patterns);
}

/**
 * Get all patterns
 */
function getAllPatterns(): DailyPattern[] {
  if (typeof window === 'undefined') return [];
  const key = getUserStorageKey(STORAGE_KEYS.PATTERNS);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * Save all patterns
 */
function saveAllPatterns(patterns: DailyPattern[]): void {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(STORAGE_KEYS.PATTERNS);
  // Keep only last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const filtered = patterns.filter((p) => new Date(p.date) >= cutoff);
  localStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * Get patterns for last N days
 */
function getPatterns(days: number): DailyPattern[] {
  const patterns = getAllPatterns();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return patterns.filter((p) => new Date(p.date) >= cutoff);
}

/**
 * Get adaptive settings
 */
export function getAdaptiveSettings(): AdaptiveSettings {
  if (typeof window === 'undefined') return getDefaultSettings();
  const key = getUserStorageKey(STORAGE_KEYS.SETTINGS);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : getDefaultSettings();
}

/**
 * Save adaptive settings
 */
export function saveAdaptiveSettings(settings: AdaptiveSettings): void {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(STORAGE_KEYS.SETTINGS);
  localStorage.setItem(key, JSON.stringify(settings));
}

/**
 * Get default settings
 */
function getDefaultSettings(): AdaptiveSettings {
  return {
    chronotype: 'neutral',
    wakeTime: '07:00',
    sleepTime: '23:00',
    peakHours: [9, 10, 11, 14, 15],
    preferredFocusDuration: 25,
    preferredTechnique: 'pomodoro',
    distractionTriggers: [],
    copingStrategies: [],
    featureLevel: 1,
    featureOverrides: {},
    gamificationEnabled: true,
    showXP: true,
    showStreaks: true,
    lastCalculatedAt: null,
  };
}

/**
 * Log adaptation for history
 */
function logAdaptation(suggestion: AdaptationSuggestion): void {
  if (typeof window === 'undefined') return;

  const key = getUserStorageKey(STORAGE_KEYS.ADAPTATIONS);
  const data = localStorage.getItem(key);
  const log = data ? JSON.parse(data) : [];

  log.push({
    ...suggestion,
    appliedAt: new Date().toISOString(),
  });

  // Keep only last 100 adaptations
  if (log.length > 100) {
    log.splice(0, log.length - 100);
  }

  localStorage.setItem(key, JSON.stringify(log));
}

/**
 * Sync adaptive data to Supabase
 */
export async function syncAdaptiveDataToCloud(userId: string): Promise<void> {
  if (isDemoMode || !supabase) return;

  const patterns = getPatterns(7);
  const settings = getAdaptiveSettings();
  const stability = calculateStabilityScore();

  // Update daily patterns
  for (const pattern of patterns) {
    await supabase.from('daily_patterns').upsert({
      user_id: userId,
      date: pattern.date,
      app_opens: pattern.appOpens,
      active_minutes: pattern.activeMinutes,
      hourly_activity: pattern.hourlyActivity,
      tasks_created: pattern.tasksCreated,
      tasks_completed: pattern.tasksCompleted,
      tasks_skipped: pattern.tasksSkipped,
      completion_rate: pattern.completionRate,
      avg_energy: pattern.avgEnergy,
      avg_mood: pattern.avgMood,
      mood_variance: pattern.moodVariance,
      focus_sessions: pattern.focusSessions,
      focus_minutes: pattern.focusMinutes,
      focus_completion_rate: pattern.focusCompletionRate,
      crisis_mode_count: pattern.crisisModeCount,
      crisis_total_minutes: pattern.crisisTotalMinutes,
      stability_score: stability.total,
    });
  }

  // Update adaptive settings
  await supabase.from('user_adaptive_settings').upsert({
    user_id: userId,
    chronotype: settings.chronotype,
    wake_time: settings.wakeTime,
    sleep_time: settings.sleepTime,
    peak_hours: settings.peakHours,
    preferred_focus_duration: settings.preferredFocusDuration,
    preferred_technique: settings.preferredTechnique,
    distraction_triggers: settings.distractionTriggers,
    coping_strategies: settings.copingStrategies,
    feature_level: settings.featureLevel,
    feature_overrides: settings.featureOverrides,
    gamification_enabled: settings.gamificationEnabled,
    show_xp: settings.showXP,
    show_streaks: settings.showStreaks,
  });
}
