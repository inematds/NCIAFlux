/**
 * Storage Service - Centralized localStorage management for demo mode
 * Supports multiple user profiles with prefixed storage keys
 */

import { profileManager, getUserStorageKey, migrateToUserPrefixedStorage } from './profile-manager';

const STORAGE_KEYS = {
  USER: 'nciaflux_demo_user',
  TASKS: 'nciaflux_tasks',
  SETTINGS: 'nciaflux_settings',
  TEAMS: 'nciaflux_teams',
} as const;

// Base keys for user-prefixed storage (without nciaflux_ prefix)
export const USER_STORAGE_KEYS = {
  TASKS: 'tasks',
  SETTINGS: 'settings',
  TEAMS: 'teams',
  PROJECTS: 'projects',
  NOTES: 'notes',
  CHECKINS: 'checkins',
  FOCUS_STATS: 'focus_stats',
  CALENDAR_EVENTS: 'calendar_events',
  WEEKLY_REVIEWS: 'weekly_reviews',
  MONTHLY_REVIEWS: 'monthly_reviews',
  CHRONOTYPE: 'chronotype',
  COGNITIVE_PROFILE: 'cognitive_profile',
  CRISIS_EVENTS: 'crisis_events',
  MORNING_ROUTINE: 'morning_routine',
  EVENING_ROUTINE: 'evening_routine',
  BRAIN_DUMP: 'brain_dump',
  DISCOVERY_ANSWERS: 'discovery_answers',
  SUGGESTED_ROUTINE: 'suggested_routine',
} as const;

// Types
export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string;
  avatar_url?: string;
  password?: string; // For demo mode password change
}

export interface StoredTeam {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  members: StoredTeamMember[];
}

export interface StoredTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'away' | 'offline';
  productivity: number;
  lastCheckIn: string;
}

export interface StoredTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSettings {
  notifications: {
    email: boolean;
    push: boolean;
    weeklyReport: boolean;
    teamAlerts: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

// Default data
const DEFAULT_SETTINGS: StoredSettings = {
  notifications: {
    email: true,
    push: true,
    weeklyReport: true,
    teamAlerts: true,
  },
  preferences: {
    theme: 'light',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  },
};

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined';

// User Storage - now integrates with profile manager
export const userStorage = {
  get(): StoredUser | null {
    if (!isBrowser) return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  set(user: StoredUser): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Also update profile manager
    profileManager.initializeOnLogin(user);
    // Migrate old data to user-prefixed storage
    migrateToUserPrefixedStorage(user.id);
  },

  remove(): void {
    if (!isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    profileManager.logout();
  },

  isAuthenticated(): boolean {
    return this.get() !== null;
  },

  // Get current user ID from profile manager
  getCurrentUserId(): string | null {
    return profileManager.getActiveProfileId();
  },
};

// Tasks Storage - uses user-prefixed keys
export const tasksStorage = {
  getAll(): StoredTask[] {
    if (!isBrowser) return [];
    const key = getUserStorageKey('nciaflux_tasks');
    const data = localStorage.getItem(key);
    if (!data) {
      return []; // Start with empty tasks for new users
    }
    return JSON.parse(data);
  },

  setAll(tasks: StoredTask[]): void {
    if (!isBrowser) return;
    const key = getUserStorageKey('nciaflux_tasks');
    localStorage.setItem(key, JSON.stringify(tasks));
  },

  add(task: Omit<StoredTask, 'id' | 'createdAt' | 'updatedAt'>): StoredTask {
    const tasks = this.getAll();
    const newTask: StoredTask = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    this.setAll(tasks);
    return newTask;
  },

  update(id: string, updates: Partial<StoredTask>): StoredTask | null {
    const tasks = this.getAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setAll(tasks);
    return tasks[index];
  },

  delete(id: string): boolean {
    const tasks = this.getAll();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) return false;
    this.setAll(filtered);
    return true;
  },

  getById(id: string): StoredTask | null {
    const tasks = this.getAll();
    return tasks.find((t) => t.id === id) || null;
  },
};

// Settings Storage - uses user-prefixed keys
export const settingsStorage = {
  get(): StoredSettings {
    if (!isBrowser) return DEFAULT_SETTINGS;
    const key = getUserStorageKey('nciaflux_settings');
    const data = localStorage.getItem(key);
    if (!data) {
      this.set(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(data);
  },

  set(settings: StoredSettings): void {
    if (!isBrowser) return;
    const key = getUserStorageKey('nciaflux_settings');
    localStorage.setItem(key, JSON.stringify(settings));
  },

  update(updates: Partial<StoredSettings>): StoredSettings {
    const current = this.get();
    const updated = { ...current, ...updates };
    this.set(updated);
    return updated;
  },
};

// Global Teams Storage - NOT user-prefixed (for admin-created teams)
export const globalTeamsStorage = {
  getAll(): StoredTeam[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem('nciaflux_global_teams');
    return data ? JSON.parse(data) : [];
  },

  setAll(teams: StoredTeam[]): void {
    if (!isBrowser) return;
    localStorage.setItem('nciaflux_global_teams', JSON.stringify(teams));
  },

  add(team: Omit<StoredTeam, 'id' | 'createdAt'>): StoredTeam {
    const teams = this.getAll();
    const newTeam: StoredTeam = {
      ...team,
      id: `global_team_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    teams.push(newTeam);
    this.setAll(teams);
    return newTeam;
  },

  update(id: string, updates: Partial<StoredTeam>): StoredTeam | null {
    const teams = this.getAll();
    const index = teams.findIndex((t) => t.id === id);
    if (index === -1) return null;
    teams[index] = { ...teams[index], ...updates };
    this.setAll(teams);
    return teams[index];
  },

  delete(id: string): boolean {
    const teams = this.getAll();
    const filtered = teams.filter((t) => t.id !== id);
    if (filtered.length === teams.length) return false;
    this.setAll(filtered);
    return true;
  },

  getByManagerEmail(email: string): StoredTeam[] {
    const teams = this.getAll();
    return teams.filter(t =>
      t.members.some(m => m.email?.toLowerCase() === email?.toLowerCase() && m.role === 'manager')
    );
  },
};

// Teams Storage - uses user-prefixed keys (for personal teams)
export const teamsStorage = {
  getAll(): StoredTeam[] {
    if (!isBrowser) return [];
    const key = getUserStorageKey('nciaflux_teams');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  setAll(teams: StoredTeam[]): void {
    if (!isBrowser) return;
    const key = getUserStorageKey('nciaflux_teams');
    localStorage.setItem(key, JSON.stringify(teams));
  },

  add(team: Omit<StoredTeam, 'id' | 'createdAt'>): StoredTeam {
    const teams = this.getAll();
    const newTeam: StoredTeam = {
      ...team,
      id: `team_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    teams.push(newTeam);
    this.setAll(teams);
    return newTeam;
  },

  update(id: string, updates: Partial<StoredTeam>): StoredTeam | null {
    const teams = this.getAll();
    const index = teams.findIndex((t) => t.id === id);
    if (index === -1) return null;
    teams[index] = { ...teams[index], ...updates };
    this.setAll(teams);
    return teams[index];
  },

  delete(id: string): boolean {
    const teams = this.getAll();
    const filtered = teams.filter((t) => t.id !== id);
    if (filtered.length === teams.length) return false;
    this.setAll(filtered);
    return true;
  },

  addMember(teamId: string, member: StoredTeamMember): StoredTeam | null {
    const teams = this.getAll();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index === -1) return null;
    teams[index].members.push(member);
    this.setAll(teams);
    return teams[index];
  },

  removeMember(teamId: string, memberId: string): boolean {
    const teams = this.getAll();
    const index = teams.findIndex((t) => t.id === teamId);
    if (index === -1) return false;
    teams[index].members = teams[index].members.filter((m) => m.id !== memberId);
    this.setAll(teams);
    return true;
  },
};

// Clear current user's session (for logout - keeps profile data)
export function clearAllStorage(): void {
  if (!isBrowser) return;
  // Only clear the current user session, not all profiles
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem('nciaflux_demo_mode');
  profileManager.logout();
}

// Clear ALL data including all profiles (full reset)
export function clearAllDataCompletely(): void {
  if (!isBrowser) return;
  // Clear all nciaflux keys
  const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('nciaflux_'));
  keysToRemove.forEach(key => localStorage.removeItem(key));
  profileManager.clearAll();
}

// Helper to get user-prefixed key for direct localStorage access
export function getStorageKey(baseKey: string): string {
  return getUserStorageKey(baseKey);
}

// Re-export profile manager for convenience
export { profileManager, getUserStorageKey } from './profile-manager';
export type { LocalProfile, ViewMode } from './profile-manager';
